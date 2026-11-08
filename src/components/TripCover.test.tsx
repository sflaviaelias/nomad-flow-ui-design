import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ invoke: vi.fn(), user: { id: "account-a" } }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: mocks.invoke } } }));
vi.mock("@/hooks/useSupabaseAuth", () => ({ useSupabaseAuth: () => ({ user: mocks.user }) }));
import TripCover from "./TripCover";
const photo = { provider: "unsplash", id: "albania", url: "https://images.unsplash.com/albania", photoUrl: "https://unsplash.com/photos/albania", photographer: "Fotógrafa de teste", photographerUrl: "https://unsplash.com/@test", destinationKey: "AL" };
function ui(client = new QueryClient(), destination = "Albânia") {
  return <QueryClientProvider client={client}><TripCover tripId="trip-a" destination={destination} /></QueryClientProvider>;
}
beforeEach(() => { mocks.invoke.mockReset(); mocks.user = { id: "account-a" }; vi.stubEnv("VITE_TRIP_COVERS_ENABLED", "true"); });
afterEach(() => vi.unstubAllEnvs());
describe("Capa de viagem", () => {
  it("flag desabilitada mantém fallback sem chamar backend", () => {
    vi.stubEnv("VITE_TRIP_COVERS_ENABLED", "false");
    render(ui());
    expect(screen.getByText("Foto do destino indisponível")).toBeTruthy();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });
  it("mostra carregamento, foto acessível, crédito e reutiliza cache ao reabrir", async () => {
    let finish: (value: unknown) => void;
    mocks.invoke.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const cache = new QueryClient();
    const first = render(ui(cache));
    expect(screen.getByRole("status").textContent).toBe("Carregando foto...");
    await act(async () => finish({ data: { status: "ready", photo }, error: null }));
    const image = await screen.findByRole("img", { name: "Vista de Albânia" });
    fireEvent.load(image);
    expect(image.className).toContain("opacity-100");
    expect(screen.getByRole("link", { name: "Fotógrafa de teste" }).getAttribute("href")).toBe(photo.photographerUrl);
    first.unmount();
    render(ui(cache));
    expect(await screen.findByRole("img", { name: "Vista de Albânia" })).toBeTruthy();
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
    expect(mocks.invoke.mock.calls[0]).toEqual(["trip-destination-cover", { body: { tripId: "trip-a" } }]);
  });
  it("URL quebrada usa fallback sem trocar por outra fotografia", async () => {
    mocks.invoke.mockResolvedValue({ data: { status: "ready", photo }, error: null });
    render(ui());
    fireEvent.error(await screen.findByRole("img"));
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("Foto do destino indisponível")).toBeTruthy();
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
  });
  it("erro da API não bloqueia a tela nem dispara retentativas", async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: new Error("503") });
    render(ui());
    await screen.findByText("Foto do destino indisponível");
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
  });
  it("foto de outro destino é rejeitada também no frontend", async () => {
    mocks.invoke.mockResolvedValue({ data: { status: "ready", photo }, error: null });
    render(ui(new QueryClient(), "Portugal"));
    await screen.findByText("Foto do destino indisponível");
    expect(screen.queryByRole("img")).toBeNull();
  });
  it("chaves de cache distinguem contas privadas", async () => {
    mocks.invoke.mockResolvedValueOnce({ data: { status: "ready", photo }, error: null }).mockResolvedValue({ data: null, error: new Error("404") });
    const client = new QueryClient();
    const view = render(ui(client));
    await screen.findByRole("img");
    mocks.user = { id: "account-b" };
    view.rerender(ui(client));
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("img")).toBeNull();
  });
});
