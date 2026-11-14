import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createFakeSupabase } from "./fake-supabase";
const fake = createFakeSupabase();
vi.mock("@/integrations/supabase/client", () => ({
  SUPABASE_URL: "http://127.0.0.1:54321", AUTH_STORAGE_KEY: "fake-auth-key",
  supabase: new Proxy({}, { get: (_target, key) => fake.client[key] }), clearLocalAuth: () => fake.clear(),
}));
import App from "@/App";
import TripForm from "@/components/TripForm";
import { AuthProvider } from "@/contexts/AuthProvider";
import { createTrip, getTrip, updateTrip, type TripDraft } from "@/lib/trips";
const draft: TripDraft = { destination: "Albania", start_date: "2030-05-01", end_date: "2030-05-15", budget: 2500, currency: "BRL" };
beforeEach(() => { fake.reset(); fake.register(); });

it("prefills, saves dates and budget once, preserves history and survives a new session", async () => {
  await createTrip("user-1", draft, "trip-a");
  Object.assign(fake.rows[0], { notes: "Keep this", checklist: ["Passport"] });
  window.history.replaceState(null, "", "/trip/trip-a");
  const view = render(<App />);
  await userEvent.click(await screen.findByRole("button", { name: "Editar viagem" }));
  expect((screen.getByLabelText("Destino") as HTMLInputElement).value).toBe("Albania");
  expect((screen.getByLabelText(/Orçamento em/) as HTMLInputElement).value).toBe("2500");
  fireEvent.change(screen.getByLabelText("Início"), { target: { value: "2030-05-03" } });
  fireEvent.change(screen.getByLabelText(/Orçamento em/), { target: { value: "3000" } });
  let release: () => void;
  fake.delayInsert(new Promise<void>((resolve) => { release = resolve; }));
  const form = screen.getByRole("button", { name: "Salvar viagem" }).closest("form");
  fireEvent.submit(form); fireEvent.submit(form);
  await waitFor(() => expect(fake.update).toHaveBeenCalledTimes(1));
  expect(screen.getByRole("button", { name: "Salvando..." }).hasAttribute("disabled") || form.querySelector("fieldset").disabled).toBe(true);
  await act(async () => release());
  await screen.findByText("Viagem atualizada com sucesso.");
  expect(fake.rows).toHaveLength(1);
  expect(fake.rows[0]).toMatchObject({ id: "trip-a", user_id: "user-1", notes: "Keep this", checklist: ["Passport"], start_date: "2030-05-03", budget: 3000 });
  expect(fake.update.mock.calls[0][0]).not.toHaveProperty("id");
  view.unmount();
  await fake.client.auth.signOut(); fake.register();
  render(<App />);
  await screen.findByRole("heading", { name: "Albania" });
  expect((await getTrip("user-1", "trip-a")).budget).toBe(3000);
});

it("keeps failed edits and allows retry; invalidates list, Home, detail and old cover caches", async () => {
  const trip = { ...await createTrip("user-1", draft, "trip-a") };
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const saved = vi.fn();
  render(<QueryClientProvider client={cache}><AuthProvider><MemoryRouter><TripForm trip={trip} onSaved={saved} /></MemoryRouter></AuthProvider></QueryClientProvider>);
  await waitFor(() => expect(fake.client.auth.getSession).toHaveBeenCalled());
  cache.setQueryData(["trips", "user-1"], [trip]);
  cache.setQueryData(["trips", "user-1", trip.id], trip);
  cache.setQueryData(["trip-cover", "user-1", trip.id, trip.destination], { status: "ready", photo: {} });
  fireEvent.change(screen.getByLabelText("Destino"), { target: { value: "Portugal" } });
  fake.failUpdate();
  await userEvent.click(screen.getByRole("button", { name: "Salvar viagem" }));
  await screen.findByRole("alert");
  expect((screen.getByLabelText("Destino") as HTMLInputElement).value).toBe("Portugal");
  expect(saved).not.toHaveBeenCalled();
  fake.failUpdate(false);
  await userEvent.click(screen.getByRole("button", { name: "Salvar viagem" }));
  await waitFor(() => expect(saved).toHaveBeenCalledOnce());
  expect(cache.getQueryState(["trips", "user-1"]).isInvalidated).toBe(true);
  expect(cache.getQueryData(["trips", "user-1", trip.id])).toMatchObject({ destination: "Portugal" });
  expect(cache.getQueryData(["trip-cover", "user-1", trip.id, trip.destination])).toBeUndefined();
});

it("rejects missing sessions, switched accounts, foreign IDs and invalid values before update", async () => {
  await createTrip("user-1", draft, "trip-a");
  for (const changes of [{ end_date: "2020-01-01" }, { budget: -1 }, { currency: "XYZ" }, { start_date: "2030-02-30" }]) {
    await expect(updateTrip("user-1", "trip-a", { ...draft, ...changes } as TripDraft)).rejects.toThrow();
  }
  fake.switchUser();
  await expect(updateTrip("user-1", "trip-a", draft)).rejects.toThrow("sessão expirou");
  await expect(updateTrip("user-2", "trip-a", draft)).rejects.toThrow("indisponível para esta conta");
  await fake.client.auth.signOut();
  await expect(updateTrip("user-1", "trip-a", draft)).rejects.toThrow("sessão expirou");
  expect(fake.update).not.toHaveBeenCalled();
});

it("preserves supported existing currency without offering currency selection", async () => {
  const trip = await createTrip("user-1", { ...draft, currency: "EUR" }, "trip-eur");
  const cache = new QueryClient();
  render(<QueryClientProvider client={cache}><AuthProvider><MemoryRouter><TripForm trip={trip} /></MemoryRouter></AuthProvider></QueryClientProvider>);
  expect(screen.getByLabelText("Orçamento em EUR, opcional")).toBeTruthy();
  expect(screen.queryByRole("combobox")).toBeNull();
  await updateTrip("user-1", trip.id, { ...draft, currency: "EUR", budget: 0 });
  expect(fake.rows[0].currency).toBe("EUR");
  await expect(updateTrip("user-1", trip.id, draft)).rejects.toThrow("moeda original");
});

it("reports invalid edits without persisting them and cancel leaves the creation draft intact", async () => {
  const trip = await createTrip("user-1", draft, "trip-a");
  const cancel = vi.fn();
  const cache = new QueryClient();
  sessionStorage.setItem("go-nomad:pending-trip:user-1", "pending-creation");
  await act(async () => {
  render(<QueryClientProvider client={cache}><AuthProvider><MemoryRouter><TripForm trip={trip} onCancel={cancel} /></MemoryRouter></AuthProvider></QueryClientProvider>);
  });
  fireEvent.change(screen.getByLabelText(/Orçamento em/), { target: { value: "-5" } });
  fireEvent.submit(screen.getByRole("button", { name: "Salvar viagem" }).closest("form"));
  expect((await screen.findByRole("alert")).textContent).toContain("não pode ser negativo");
  expect(fake.update).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(cancel).toHaveBeenCalledOnce();
  expect(sessionStorage.getItem("go-nomad:pending-trip:user-1")).toBe("pending-creation");
});
