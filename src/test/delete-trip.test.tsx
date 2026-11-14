import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createFakeSupabase } from "./fake-supabase";
const fake = createFakeSupabase();
vi.mock("@/integrations/supabase/client", () => ({
  SUPABASE_URL: "http://127.0.0.1:54321", AUTH_STORAGE_KEY: "fake-auth-key",
  supabase: new Proxy({}, { get: (_target, key) => fake.client[key] }), clearLocalAuth: () => fake.clear(),
}));
import App from "@/App";
import DeleteTripButton from "@/components/DeleteTripButton";
import { AuthProvider } from "@/contexts/AuthProvider";
import { createTrip, deleteTrip, getTrip, type TripDraft } from "@/lib/trips";
const draft: TripDraft = { destination: "Albânia", start_date: "2030-05-01", end_date: "2030-05-15", budget: 2500, currency: "BRL" };
beforeEach(() => { fake.reset(); fake.register(); });
async function openDetails() {
  window.history.replaceState(null, "", "/trip/trip-a");
  const view = render(<App />);
  await userEvent.click(await screen.findByRole("button", { name: "Excluir viagem" }));
  return view;
}

it("requires destination-specific confirmation; Cancel and Escape preserve all data", async () => {
  await createTrip("user-1", draft, "trip-a");
  await openDetails();
  const dialog = screen.getByRole("alertdialog", { name: "Excluir a viagem para Albânia?" });
  expect(within(dialog).getByText(/suas despesas e sua capa/)).toBeTruthy();
  await userEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));
  expect(screen.queryByRole("alertdialog")).toBeNull();
  expect(fake.remove).not.toHaveBeenCalled();
  expect(fake.rows).toHaveLength(1);
  await userEvent.click(screen.getByRole("button", { name: "Excluir viagem" }));
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("alertdialog")).toBeNull();
  expect(fake.remove).not.toHaveBeenCalled();
});

it("deletes only the confirmed trip, returns to /trips and stays deleted across a new session", async () => {
  await createTrip("user-1", draft, "trip-a");
  await createTrip("user-1", { ...draft, destination: "Portugal" }, "trip-b");
  const view = await openDetails();
  let release: () => void;
  fake.delayInsert(new Promise<void>((resolve) => { release = resolve; }));
  await userEvent.dblClick(screen.getByRole("button", { name: "Confirmar exclusão" }));
  await waitFor(() => expect(fake.remove).toHaveBeenCalledOnce());
  expect(screen.getByRole("button", { name: "Cancelar" }).hasAttribute("disabled")).toBe(true);
  await userEvent.keyboard("{Escape}");
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  await act(async () => release());
  await screen.findByRole("heading", { name: "Minhas viagens" });
  expect(window.location.pathname).toBe("/trips");
  expect(screen.queryByRole("link", { name: "Albânia" })).toBeNull();
  expect(await screen.findByRole("link", { name: "Portugal" })).toBeTruthy();
  expect(fake.remove.mock.calls[0][0]).toEqual([["id", "trip-a"], ["user_id", "user-1"]]);
  expect(fake.rows.map((r) => r.id)).toEqual(["trip-b"]);
  view.unmount();
  await fake.client.auth.signOut(); fake.register();
  window.history.replaceState(null, "", "/trip/trip-a");
  render(<App />);
  await screen.findByText("Viagem não encontrada ou indisponível para esta conta.");
  expect(await getTrip("user-1", "trip-a")).toBeNull();
  expect(fake.client.functions.invoke).not.toHaveBeenCalled();
});

it("network failure keeps the confirmation and trip intact and allows retry", async () => {
  await createTrip("user-1", draft, "trip-a");
  await openDetails(); fake.failDelete();
  await userEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
  expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível confirmar a exclusão");
  expect(window.location.pathname).toBe("/trip/trip-a");
  expect(fake.rows).toHaveLength(1);
  fake.failDelete(false);
  await userEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
  await screen.findByRole("heading", { name: "Minhas viagens" });
  expect(fake.rows).toHaveLength(0);
});

it("rejects missing/changed authentication and foreign or absent IDs without false success", async () => {
  await createTrip("user-1", draft, "trip-a");
  fake.switchUser();
  await expect(deleteTrip("user-1", "trip-a")).rejects.toThrow("sessão expirou");
  expect(fake.remove).not.toHaveBeenCalled();
  await expect(deleteTrip("user-2", "trip-a")).rejects.toThrow("Não foi possível confirmar");
  await expect(deleteTrip("user-2", "absent")).rejects.toThrow("Não foi possível confirmar");
  expect(fake.rows).toHaveLength(1);
  await fake.client.auth.signOut();
  await expect(deleteTrip("user-1", "trip-a")).rejects.toThrow("sessão expirou");
});

it("does not claim success for a lost response after commit; retry cannot delete unrelated rows", async () => {
  await createTrip("user-1", draft, "trip-a");
  await createTrip("user-1", draft, "trip-b");
  fake.loseDeleteResponse();
  await expect(deleteTrip("user-1", "trip-a")).rejects.toThrow("Não foi possível confirmar");
  await expect(deleteTrip("user-1", "trip-a")).rejects.toThrow("Não foi possível confirmar");
  expect(fake.rows.map((r) => r.id)).toEqual(["trip-b"]);
});

it("evicts deleted detail and cover and refreshes the shared list/Home cache without touching other accounts", async () => {
  const trip = await createTrip("user-1", draft, "trip-a");
  await createTrip("user-1", draft, "trip-b");
  const other = await getTrip("user-1", "trip-b");
  const cache = new QueryClient();
  await act(async () => { render(<QueryClientProvider client={cache}><AuthProvider><MemoryRouter initialEntries={["/trip/trip-a"]}>
    <Routes><Route path="/trip/:id" element={<DeleteTripButton trip={trip} />} /><Route path="/trips" element={<p>List destination</p>} /></Routes>
  </MemoryRouter></AuthProvider></QueryClientProvider>); });
  cache.setQueryData(["trips", "user-1"], [trip, other]);
  cache.setQueryData(["trips", "user-1", trip.id], trip);
  cache.setQueryData(["trip-cover", "user-1", trip.id, trip.destination], { photo: "old" });
  cache.setQueryData(["trips", "user-2"], [other]);
  await userEvent.click(screen.getByRole("button", { name: "Excluir viagem" }));
  await userEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
  await screen.findByText("List destination");
  expect(cache.getQueryData(["trips", "user-1"])).toEqual([other]);
  expect(cache.getQueryState(["trips", "user-1"]).isInvalidated).toBe(true);
  expect(cache.getQueryData(["trips", "user-1", trip.id])).toBeNull();
  expect(cache.getQueryData(["trip-cover", "user-1", trip.id, trip.destination])).toBeUndefined();
  expect(cache.getQueryData(["trips", "user-2"])).toEqual([other]);
});

it("a foreign account cannot see a delete action on the original account's direct URL", async () => {
  await createTrip("user-1", draft, "trip-a");
  fake.switchUser();
  window.history.replaceState(null, "", "/trip/trip-a");
  render(<App />);
  await screen.findByText("Viagem não encontrada ou indisponível para esta conta.");
  expect(screen.queryByRole("button", { name: "Excluir viagem" })).toBeNull();
  expect(fake.remove).not.toHaveBeenCalled();
  expect(fake.rows).toHaveLength(1);
});
