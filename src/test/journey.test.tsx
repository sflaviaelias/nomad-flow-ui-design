import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createFakeSupabase } from "./fake-supabase";

const fake = createFakeSupabase();
vi.mock("@/integrations/supabase/client", () => ({
  SUPABASE_URL: "http://127.0.0.1:54321",
  AUTH_STORAGE_KEY: "fake-auth-key",
  supabase: new Proxy({}, { get: (_target, key) => fake.client[key] }),
  clearLocalAuth: () => fake.clear(),
}));
import App from "@/App";
import { createTrip, tripDraftSchema, type TripDraft } from "@/lib/trips";
import { AuthProvider } from "@/contexts/AuthProvider";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const draft: TripDraft = { destination: "Porto", start_date: "2030-05-01", end_date: "2030-05-15", budget: 2500, currency: "BRL" };
beforeEach(() => { fake.reset(); window.history.replaceState(null, "", "/auth/signup"); });

describe("Jornada React com Supabase simulado", () => {
  it("cadastro pendente, confirmação, login, gravação única, logout e recuperação após novo login", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText("Nome Completo"), "Ana");
    await user.type(screen.getByLabelText("E-mail"), "ana@example.test");
    await user.type(screen.getByLabelText("Senha", { exact: true }), "Senha!123");
    await user.type(screen.getByLabelText("Confirmar Senha"), "Senha!123");
    fireEvent.change(screen.getByLabelText("Data de Nascimento"), { target: { value: "1990-05-20" } });
    await user.selectOptions(screen.getByRole("combobox"), "BR");
    await user.click(screen.getByRole("checkbox", { name: "Trabalhador Remoto" }));
    await user.click(screen.getByRole("button", { name: "Criar Conta" }));
    await screen.findByRole("heading", { name: "Confira seu e-mail" });
    expect(fake.client.auth.signUp.mock.calls[0][0]).toMatchObject({ options: { emailRedirectTo: `${window.location.origin}/auth/confirm` } });
    await user.click(screen.getByRole("button", { name: "Já confirmei: entrar" }));
    async function enter() {
      await user.type(screen.getByLabelText("E-mail"), "ana@example.test");
      await user.type(screen.getByLabelText("Senha"), "Senha!123");
      await user.click(screen.getByRole("button", { name: "Entrar no GoNomad" }));
    }
    await enter();
    expect((await screen.findByRole("alert")).textContent).toContain("Confirme seu e-mail");
    // Representa a confirmação pelo servidor de e-mail, sem efetuar login automático.
    fake.confirm("ana@example.test");
    await user.click(screen.getByRole("button", { name: "Entrar no GoNomad" }));
    await screen.findByRole("heading", { name: "Minhas viagens" });
    await screen.findByText("Nenhuma viagem salva. Crie sua primeira viagem.");
    await user.click(screen.getByRole("link", { name: "Criar viagem" }));
    await user.type(screen.getByLabelText("Destino"), "Porto");
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: "2030-05-01" } });
    fireEvent.change(screen.getByLabelText("Término"), { target: { value: "2030-05-15" } });
    await user.type(screen.getByLabelText(/Orçamento/), "2500");
    let release: () => void;
    fake.delayInsert(new Promise<void>((resolve) => { release = resolve; }));
    const form = screen.getByRole("button", { name: "Salvar viagem" }).closest("form");
    fireEvent.submit(form); fireEvent.submit(form);
    await waitFor(() => expect(fake.insert).toHaveBeenCalledTimes(1));
    await act(async () => release());
    await screen.findByRole("heading", { name: "Porto" });
    const id = fake.rows[0].id;
    expect(window.location.pathname).toBe(`/trip/${id}`);
    expect(fake.upsert).not.toHaveBeenCalled();
    expect(fake.client.functions.invoke).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Voltar para Minhas viagens" }));
    await user.click(screen.getByRole("button", { name: "Sair da conta" }));
    await screen.findByRole("heading", { name: "Bem-vindo" });
    expect(screen.queryByText("Porto")).toBeNull();
    await user.click(screen.getByRole("button", { name: /Já tem conta/ }));
    await enter();
    await user.click(await screen.findByRole("link", { name: "Porto" }));
    await screen.findByRole("heading", { name: "Porto" });
    expect(window.location.pathname).toBe(`/trip/${id}`);
    expect(fake.rows).toHaveLength(1);
  });

  it("o callback de confirmação não é bloqueado pelo onboarding", async () => {
    fake.register();
    window.history.replaceState(null, "", "/auth/confirm#access_token=ficticio");
    render(<App />);
    expect((await screen.findByText("E-mail confirmado. Sua sessão está ativa.")).textContent).toContain("confirmado");
    expect(window.location.hash).toBe("");
  });

  it("link de confirmação inválido apresenta erro e remove parâmetros", async () => {
    window.history.replaceState(null, "", "/auth/confirm?error=access_denied#token=ficticio");
    render(<App />);
    expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível validar");
    expect(window.location.search + window.location.hash).toBe("");
  });

  it("troca de conta desmonta telas privadas e limpa o cache", async () => {
    const cache = new QueryClient();
    function Probe() {
      const { user, signOut } = useSupabaseAuth();
      return <><p>{user?.id ?? "sem sessão"}</p><button onClick={() => void signOut()}>Sair</button></>;
    }
    fake.register();
    render(<QueryClientProvider client={cache}><AuthProvider><Probe /></AuthProvider></QueryClientProvider>);
    await screen.findByText("user-1");
    cache.setQueryData(["trips", "user-1"], [draft]);
    act(() => fake.switchUser());
    await screen.findByText("user-2");
    expect(cache.getQueryData(["trips", "user-1"])).toBeUndefined();
    fake.failLogout();
    cache.setQueryData(["trips", "user-2"], [draft]);
    await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    await screen.findByText("sem sessão");
    await waitFor(() => expect(fake.clear).toHaveBeenCalled());
    expect(cache.getQueryData(["trips", "user-2"])).toBeUndefined();
  });

  it("erro ao salvar preserva campos e permite tentar novamente", async () => {
    fake.register(); fake.failInsert();
    window.history.replaceState(null, "", "/trip/new");
    const user = userEvent.setup();
    render(<App />);
    await user.type(await screen.findByLabelText("Destino"), "Recife");
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: "2030-05-01" } });
    fireEvent.change(screen.getByLabelText("Término"), { target: { value: "2030-05-15" } });
    await user.click(screen.getByRole("button", { name: "Salvar viagem" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível salvar");
    expect((screen.getByLabelText("Destino") as HTMLInputElement).value).toBe("Recife");
    fake.failInsert(false);
    await user.click(screen.getByRole("button", { name: "Salvar viagem" }));
    await screen.findByRole("heading", { name: "Recife" });
    expect(fake.rows).toHaveLength(1);
    expect(fake.insert.mock.calls[0][0].id).toBe(fake.insert.mock.calls[1][0].id);
  });

  it("conta B não recebe a viagem de A nas consultas do cliente", async () => {
    fake.register();
    await createTrip("user-1", draft, "trip-a");
    fake.switchUser();
    window.history.replaceState(null, "", "/trip/trip-a");
    render(<App />);
    await screen.findByText("Viagem não encontrada ou indisponível para esta conta.");
    expect(fake.queries.some((q) => q.table === "trips" && q.filters.some(([k,v]) => k === "user_id" && v === "user-2"))).toBe(true);
  });
});

describe("Persistência e validação", () => {
  it("perfil ausente interrompe gravação sem tentar criá-lo no frontend", async () => {
    fake.register(); fake.removeProfile();
    await expect(createTrip("user-1", draft, "trip-a")).rejects.toThrow("perfil ainda não está disponível");
    expect(fake.insert).not.toHaveBeenCalled();
    expect(fake.upsert).not.toHaveBeenCalled();
  });
  it("reconcilia resposta perdida e reutiliza o ID sem duplicar", async () => {
    fake.register(); fake.loseNextResponse();
    expect((await createTrip("user-1", draft, "trip-a")).id).toBe("trip-a");
    expect((await createTrip("user-1", draft, "trip-a")).id).toBe("trip-a");
    expect(fake.insert).toHaveBeenCalledTimes(1);
    await expect(createTrip("user-1", { ...draft, destination: "Recife" }, "trip-a")).rejects.toThrow("outros dados");
    expect(fake.rows).toHaveLength(1);
  });
  it("falha de gravação é reportada e nova tentativa mantém o ID", async () => {
    fake.register(); fake.failInsert();
    await expect(createTrip("user-1", draft, "trip-a")).rejects.toThrow("Não foi possível salvar");
    fake.failInsert(false);
    expect((await createTrip("user-1", draft, "trip-a")).id).toBe("trip-a");
    expect(fake.rows).toHaveLength(1);
  });
  it("rejeita sessão trocada antes de gravar", async () => {
    fake.register(); fake.switchUser();
    await expect(createTrip("user-1", draft, "trip-a")).rejects.toThrow("sessão expirou");
    expect(fake.insert).not.toHaveBeenCalled();
  });
  it("valida datas reais, ordem, destino e valores finitos", () => {
    for (const input of [{ ...draft, destination: " " }, { ...draft, start_date: "2030-02-30" },
      { ...draft, end_date: "2029-01-01" }, { ...draft, budget: -1 }, { ...draft, budget: NaN }, { ...draft, budget: Infinity }]) {
      expect(tripDraftSchema.safeParse(input).success).toBe(false);
    }
    expect(tripDraftSchema.safeParse({ ...draft, budget: null }).success).toBe(true);
    expect(tripDraftSchema.safeParse({ ...draft, end_date: draft.start_date, budget: 0 }).success).toBe(true);
  });
});
