import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "./fake-supabase";
const fake = createFakeSupabase();
vi.mock("@/integrations/supabase/client", () => ({
  SUPABASE_URL: "http://127.0.0.1:54321", AUTH_STORAGE_KEY: "fake-auth-key",
  supabase: new Proxy({}, { get: (_target, key) => fake.client[key] }), clearLocalAuth: () => fake.clear(),
}));
// Testar o destino do router sem os serviços legados/externos da Home.
vi.mock("@/pages/Index", () => ({ default: () => <h1>Home</h1> }));
import App from "@/App";
import { createTrip } from "@/lib/trips";
import { readTripDraft, TRIP_DRAFT_PREFIX, writeTripDraft } from "@/lib/trip-form-draft";
const saved = { destination: "Albânia", start_date: "2030-05-01", end_date: "2030-05-12", budget: 4500, currency: "BRL" as const };
beforeEach(() => { fake.reset(); window.history.replaceState(null, "", "/trip/new"); });
describe("Navegação de criação e detalhes", () => {
  it("entrada direta na criação: botão acessível de 44px volta à Home sem histórico", async () => {
    fake.register(); render(<App />);
    const back = await screen.findByRole("button", { name: "Voltar para Home" });
    expect(back.getAttribute("type")).toBe("button");
    expect(back.style.minHeight).toBe("44px");
    expect(back.style.minWidth).toBe("44px");
    await userEvent.click(back);
    await screen.findByRole("heading", { name: "Home" });
    expect(window.location.pathname).toBe("/");
  });
  it("Home é o destino mesmo vindo de Minhas viagens; teclado mantém o rascunho", async () => {
    fake.register(); window.history.replaceState(null, "", "/trips");
    const user = userEvent.setup(); render(<App />);
    await user.click(await screen.findByRole("link", { name: "Criar viagem" }));
    await user.type(screen.getByLabelText("Destino"), "Albânia");
    const back = screen.getByRole("button", { name: "Voltar para Home" });
    back.focus(); await user.keyboard("{Enter}");
    await screen.findByRole("heading", { name: "Home" });
    expect(window.location.pathname).toBe("/");
    expect(readTripDraft("user-1").destination).toBe("Albânia");
    expect(fake.insert).not.toHaveBeenCalled();
    act(() => window.history.back());
    expect((await screen.findByLabelText("Destino") as HTMLInputElement).value).toBe("Albânia");
  });
  it("sair pelo link da criação e reabrir restaura todos os campos sem gravar no banco", async () => {
    fake.register(); const user = userEvent.setup(); render(<App />);
    await user.type(await screen.findByLabelText("Destino"), "Albânia");
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: "2030-05-01" } });
    fireEvent.change(screen.getByLabelText("Término"), { target: { value: "2030-05-12" } });
    await user.type(screen.getByLabelText(/Orçamento/), "4500");
    await user.click(screen.getByRole("link", { name: "Minhas viagens" }));
    await user.click(await screen.findByRole("link", { name: "Criar viagem" }));
    for (const [label, expected] of [["Destino", "Albânia"], ["Início", "2030-05-01"], ["Término", "2030-05-12"], [/Orçamento/, "4500"]] as const) {
      expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe(expected);
    }
    expect(fake.insert).not.toHaveBeenCalled();
  });
  it("detalhes por URL têm um único retorno e mantêm os dados e a capa", async () => {
    fake.register(); await createTrip("user-1", saved, "trip-a");
    window.history.replaceState(null, "", "/trip/trip-a"); render(<App />);
    await screen.findByRole("heading", { name: "Albânia" });
    expect(screen.getAllByRole("button", { name: "Voltar para Minhas viagens" })).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "Minhas viagens" })).toBeNull();
    expect(screen.getByText("Foto do destino indisponível")).toBeTruthy();
    expect(screen.getByText(/4.500,00/)).toBeTruthy();
    const back = screen.getByRole("button", { name: "Voltar para Minhas viagens" });
    back.focus(); await userEvent.keyboard(" ");
    await screen.findByRole("heading", { name: "Minhas viagens" });
    expect(window.location.pathname).toBe("/trips");
    expect(fake.rows).toHaveLength(1);
  });
  it("após salvar, limpa o rascunho e browser back retorna à lista, sem reenviar criação", async () => {
    fake.register(); window.history.replaceState(null, "", "/trips");
    const user = userEvent.setup(); render(<App />);
    await user.click(await screen.findByRole("link", { name: "Criar viagem" }));
    await user.type(screen.getByLabelText("Destino"), "Albânia");
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: "2030-05-01" } });
    fireEvent.change(screen.getByLabelText("Término"), { target: { value: "2030-05-12" } });
    await user.click(screen.getByRole("button", { name: "Salvar viagem" }));
    await screen.findByRole("heading", { name: "Albânia" });
    expect(sessionStorage.getItem(`${TRIP_DRAFT_PREFIX}user-1`)).toBeNull();
    act(() => window.history.back());
    await screen.findByRole("heading", { name: "Minhas viagens" });
    expect(window.location.pathname).toBe("/trips");
    expect(fake.insert).toHaveBeenCalledTimes(1);
  });
  it("resposta perdida reconhecida na lista remove a tentativa e o rascunho já salvos", async () => {
    fake.register(); await createTrip("user-1", saved, "trip-a");
    writeTripDraft("user-1", { destination: "Albânia", start: "2030-05-01", end: "2030-05-12", budget: "4500" });
    sessionStorage.setItem("go-nomad:pending-trip:user-1", "trip-a");
    window.history.replaceState(null, "", "/trips"); render(<App />);
    await waitFor(() => expect(sessionStorage.getItem(`${TRIP_DRAFT_PREFIX}user-1`)).toBeNull());
    expect(sessionStorage.getItem("go-nomad:pending-trip:user-1")).toBeNull();
  });
  it("viagem inexistente ou excluída mantém um retorno funcional à lista", async () => {
    fake.register(); window.history.replaceState(null, "", "/trip/excluida"); render(<App />);
    await screen.findByText("Viagem não encontrada ou indisponível para esta conta.");
    await userEvent.click(screen.getByRole("button", { name: "Voltar para Minhas viagens" }));
    await screen.findByRole("heading", { name: "Minhas viagens" });
  });
  it("URLs diretas de criação e detalhes continuam protegidas sem sessão", async () => {
    for (const path of ["/trip/new", "/trip/trip-a"]) {
      window.history.replaceState(null, "", path);
      const view = render(<App />);
      await screen.findByRole("heading", { name: "Bem-vindo" });
      expect(window.location.pathname).toBe("/auth/access");
      expect(screen.queryByLabelText("Destino")).toBeNull();
      view.unmount();
    }
  });
});
