import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Trip } from "@/lib/trips";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), trips: vi.fn(), retry: vi.fn(), signOut: vi.fn() }));
vi.mock("@/hooks/useSupabaseAuth", () => ({ useSupabaseAuth: mocks.auth }));
vi.mock("@/hooks/useTrips", () => ({ useTrips: mocks.trips }));
vi.mock("@/components/TripCover", () => ({ default: ({ tripId, destination }: { tripId: string; destination: string }) => <div data-testid="trip-cover" data-trip-id={tripId}>{destination} cover</div> }));
import Home from "@/pages/Index";
import { localDateKey } from "@/lib/trips";
const today = localDateKey();
function trip(id: string, start: string, end: string, budget: number | null = 5000): Trip {
  return { id, user_id: "account-a", destination: id, start_date: start, end_date: end, budget, currency: "BRL", notes: null, checklist: null, itinerary: null, created_at: "", updated_at: "", is_smart_trip: false };
}
function state(data: Trip[] = []) { return { data, isLoading: false, isError: false, isFetching: false, refetch: mocks.retry }; }
function ui() { return <MemoryRouter><Routes><Route path="/" element={<Home />} /><Route path="/trip/:id" element={<h1>Trip detail destination</h1>} /><Route path="/trip/new" element={<h1>Create destination</h1>} /><Route path="/trips" element={<h1>Trips destination</h1>} /><Route path="/demo" element={<h1>Demo destination</h1>} /><Route path="/auth/signup" element={<h1>Signup destination</h1>} /><Route path="/auth/login" element={<h1>Login destination</h1>} /><Route path="/profile" element={<h1>Profile destination</h1>} /><Route path="/settings" element={<h1>Settings destination</h1>} /></Routes></MemoryRouter>; }
beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockReturnValue({ user: { id: "account-a" }, loading: false, signOut: mocks.signOut }); mocks.trips.mockReturnValue(state()); });

describe("Home", () => {
  it("introduces the real product to guests without personalized trips or demo promises", async () => {
    mocks.auth.mockReturnValue({ user: null, loading: false });
    // Disabled guest queries must never cause a personalized card, even with stray data.
    mocks.trips.mockReturnValue(state([trip("Private trip", today, today)]));
    render(ui());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Novos destinos.");
    expect(screen.queryByTestId("trip-cover")).toBeNull();
    expect(screen.queryByText("Private trip")).toBeNull();
    expect(screen.getByText(/Conceitos em estudo, ainda não disponíveis/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Notificações" })).toBeNull();
    expect(screen.queryByText(/Resumo Inteligente/)).toBeNull();
    await userEvent.click(screen.getByRole("link", { name: "Explorar como convidado" }));
    expect(screen.getByRole("heading", { name: "Demo destination" })).toBeTruthy();
  });
  it("features an inclusive active trip before any upcoming trip and opens its details", async () => {
    mocks.trips.mockReturnValue(state([trip("Upcoming", "2099-01-01", "2099-01-15"), trip("Current", today, today)]));
    render(ui());
    const card = screen.getByRole("article", { name: "Viagem em destaque: Current" });
    expect(within(card).getByText("Em viagem")).toBeTruthy();
    expect(screen.getByTestId("trip-cover").getAttribute("data-trip-id")).toBe("Current");
    expect(within(card).getByText(/5.000,00/)).toBeTruthy();
    await userEvent.click(screen.getByRole("link", { name: "Continuar planejamento" }));
    expect(screen.getByRole("heading", { name: "Trip detail destination" })).toBeTruthy();
  });
  it("selects the earliest upcoming trip regardless of list order, excludes past trips, and preserves calendar dates", () => {
    const data = [trip("Later", "2099-03-01", "2099-03-02"), trip("Past", "2000-01-01", "2000-01-02"), trip("Soon", "2099-02-08", "2099-02-22", null)];
    mocks.trips.mockReturnValue(state(data)); render(ui());
    const card = screen.getByRole("article", { name: "Viagem em destaque: Soon" });
    expect(within(card).getByText("Sua próxima viagem")).toBeTruthy();
    expect(card.querySelector('time[datetime="2099-02-08"]').textContent).toBe("8 de fevereiro de 2099");
    expect(within(card).getByText("Não informado")).toBeTruthy();
    expect(data.map((item) => item.id)).toEqual(["Later", "Past", "Soon"]);
  });
  it("offers a true empty state and a working create action", async () => {
    render(ui()); expect(screen.getByText(/Você ainda não tem viagens salvas/)).toBeTruthy();
    await userEvent.click(screen.getByRole("link", { name: "Criar minha primeira viagem" }));
    expect(screen.getByRole("heading", { name: "Create destination" })).toBeTruthy();
  });
  it("keeps previous trips reachable without pretending there are no saved trips", () => {
    mocks.trips.mockReturnValue(state([trip("Past", "2000-01-01", "2000-01-02")]));render(ui());
    expect(screen.getByText(/Seus destinos anteriores continuam/)).toBeTruthy();
    expect(screen.queryByText(/Você ainda não tem viagens salvas/)).toBeNull();
    expect(screen.getByRole("link", { name: "Todas as viagens" }).getAttribute("href")).toBe("/trips");
  });
  it.each(["query", "auth"])("distinguishes %s loading from empty state", (kind) => {
    if (kind === "query") mocks.trips.mockReturnValue({ ...state(), isLoading: true });
    else mocks.auth.mockReturnValue({ user: null, loading: true });
    render(ui());expect(screen.getByRole("status").textContent).toContain("Carregando suas viagens");
    expect(screen.queryByText(/Você ainda não tem viagens salvas/)).toBeNull();
  });
  it("shows a retryable query error instead of a stale trip or false empty state", async () => {
    mocks.trips.mockReturnValue({ ...state([trip("Stale", today, today)]), isError: true });render(ui());
    expect(screen.getByRole("alert").textContent).toContain("Não foi possível carregar suas viagens");
    expect(screen.queryByTestId("trip-cover")).toBeNull();
    expect(screen.queryByText(/Você ainda não tem viagens salvas/)).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));expect(mocks.retry).toHaveBeenCalledOnce();
  });
  it("supports mobile disclosure navigation with Escape focus return and profile links", async () => {
    render(ui());const toggle = screen.getByRole("button", { name: "Abrir navegação" });
    await userEvent.click(toggle);expect(toggle.getAttribute("aria-expanded")).toBe("true");
    const nav = screen.getByRole("navigation", { name: "Navegação móvel" });
    fireEvent.keyDown(nav, { key: "Escape" });expect(toggle.getAttribute("aria-expanded")).toBe("false");expect(document.activeElement).toBe(toggle);
    await userEvent.click(toggle);await userEvent.click(within(screen.getByRole("navigation", { name: "Navegação móvel" })).getByRole("link", { name: "Meu perfil" }));
    expect(screen.getByRole("heading", { name: "Profile destination" })).toBeTruthy();
  });
  it("navigates to the complete list", async () => {
    render(ui());await userEvent.click(screen.getByRole("link", { name: "Todas as viagens" }));
    expect(screen.getByRole("heading", { name: "Trips destination" })).toBeTruthy();
  });
  it("uses the existing sign-out action and returns to login", async () => {
    render(ui());await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: "Login destination" })).toBeTruthy();
  });

});
