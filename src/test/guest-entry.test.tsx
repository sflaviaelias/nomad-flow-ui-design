import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { createFakeSupabase } from "./fake-supabase";
const fake = createFakeSupabase();
vi.mock("@/integrations/supabase/client", () => ({
  SUPABASE_URL: "http://127.0.0.1:54321", AUTH_STORAGE_KEY: "fake-auth-key",
  supabase: new Proxy({}, { get: (_target, key) => fake.client[key] }), clearLocalAuth: () => fake.clear(),
}));
import App from "@/App";
import { createTrip } from "@/lib/trips";
import { demoTrip } from "@/features/entry/demo-trip";
import { safeAuthReturn } from "@/features/auth/return-path";
beforeEach(() => { fake.reset(); window.history.replaceState(null, "", "/"); });
async function login() {
  await userEvent.type(await screen.findByLabelText("E-mail"), "ana@example.test");
  await userEvent.type(screen.getByLabelText("Senha", { exact: true }), "Senha!123");
  await userEvent.click(screen.getByRole("button", { name: "Entrar no GoNomad" }));
}
async function fillSignup() {
  await userEvent.type(await screen.findByLabelText("Nome Completo"), "Ana");
  await userEvent.type(screen.getByLabelText("E-mail"), "ana@example.test");
  await userEvent.type(screen.getByLabelText("Senha", { exact: true }), "Senha!123");
  await userEvent.type(screen.getByLabelText("Confirmar Senha"), "Senha!123");
  fireEvent.change(screen.getByLabelText("Data de Nascimento"), { target: { value: "1990-05-20" } });
  await userEvent.selectOptions(screen.getByRole("combobox"), "BR");
  await userEvent.click(screen.getByRole("checkbox", { name: "Trabalhador Remoto" }));
}
it("lets a first-time guest explore a fictional read-only trip and return without any account or trip mutation", async () => {
  render(<App />);
  await userEvent.click(await screen.findByRole("link", { name: "Explorar como convidado" }));
  expect(window.location.pathname).toBe("/demo");
  expect(screen.getByRole("article", { name: "Viagem de demonstração" })).toBeTruthy();
  expect(screen.getByText(/Dados fictícios/)).toBeTruthy();
  expect(screen.getByText(/não uma estimativa de custo/)).toBeTruthy();
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(screen.queryByRole("button", { name: /Salvar|Editar|Excluir/ })).toBeNull();
  expect(fake.client.auth.signUp).not.toHaveBeenCalled();
  expect(fake.client.auth.signInWithPassword).not.toHaveBeenCalled();
  expect(fake.client.auth.signOut).not.toHaveBeenCalled();
  expect(fake.insert).not.toHaveBeenCalled(); expect(fake.update).not.toHaveBeenCalled(); expect(fake.remove).not.toHaveBeenCalled();
  expect(fake.queries.filter((query) => query.table === "trips")).toHaveLength(0);
  expect(fake.client.functions.invoke).not.toHaveBeenCalled();
  expect(Object.isFrozen(demoTrip)).toBe(true);
  await userEvent.click(screen.getByRole("link", { name: "Voltar para Home" }));
  await screen.findByRole("heading", { name: /Novos destinos/ });
});
it("requires authentication for a personal trip and preserves that action through login", async () => {
  fake.register(); await fake.client.auth.signOut(); window.history.replaceState(null, "", "/demo");render(<App />);
  await userEvent.click(await screen.findByRole("link", { name: "Criar uma viagem pessoal" }));
  await screen.findByRole("heading", { name: "Bem-vindo" });
  expect(window.location.pathname).toBe("/auth/access");
  await userEvent.click(screen.getByRole("link", { name: "Já tem conta? Entrar" }));
  await login();await screen.findByLabelText("Destino");
  expect(window.location.pathname).toBe("/trip/new");
  expect((screen.getByLabelText("Destino") as HTMLInputElement).value).toBe("");
  expect(fake.rows).toHaveLength(0);
});
it("keeps the demo separate when already authenticated and never signs out to explore", async () => {
  fake.register();await createTrip("user-1", { destination: "My real trip", start_date: "2030-01-01", end_date: "2030-01-15", budget: 100, currency: "BRL" }, "real-trip");
  const before = fake.queries.length;
  window.history.replaceState(null, "", "/auth/access");render(<App />);
  await screen.findByRole("link", { name: "Continuar com minha conta" });
  await userEvent.click(await screen.findByRole("link", { name: "Explorar como Convidado" }));
  await screen.findByRole("article", { name: "Viagem de demonstração" });
  expect(fake.client.auth.signOut).not.toHaveBeenCalled();
  expect(fake.rows).toHaveLength(1);expect(fake.rows[0].destination).toBe("My real trip");
  expect(fake.queries.slice(before).filter((query) => query.table === "trips")).toHaveLength(0);
  await userEvent.click(screen.getByRole("link", { name: "Voltar para Home" }));
  await screen.findByRole("heading", { name: "My real trip" });
  expect(screen.queryByRole("article", { name: "Viagem de demonstração" })).toBeNull();
});
it("offers only two optional introduction steps, supports skip, and leaves returning Home visitors alone", async () => {
  window.history.replaceState(null, "", "/onboarding");const view = render(<App />);
  await screen.findByText("1 de 2");
  await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
  await screen.findByText("2 de 2");
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Conheça antes de criar uma conta." })));
  await userEvent.click(screen.getByRole("button", { name: "Pular introdução" }));
  await screen.findByRole("heading", { name: /Novos destinos/ });
  expect(localStorage.getItem("onboarding_done")).toBe("1");
  view.unmount();render(<App />);
  await screen.findByRole("heading", { name: /Novos destinos/ });
  expect(screen.queryByRole("navigation", { name: "Progresso do onboarding" })).toBeNull();
});
it("finishes the introduction in the demo without registration", async () => {
  window.history.replaceState(null, "", "/onboarding");render(<App />);
  await userEvent.click(await screen.findByRole("button", { name: "Continuar" }));
  await userEvent.click(screen.getByRole("button", { name: "Explorar como convidado" }));
  await screen.findByRole("article", { name: "Viagem de demonstração" });
  expect(fake.client.auth.signUp).not.toHaveBeenCalled();
});
it("preserves input and focuses understandable login errors, then allows retry", async () => {
  fake.register();await fake.client.auth.signOut();
  fake.client.auth.signInWithPassword.mockRejectedValueOnce(new Error("private-provider-message"));
  window.history.replaceState(null, "", "/auth/login");render(<App />);await login();
  const error = await screen.findByRole("alert");expect(error.textContent).toContain("Não foi possível conectar");
  expect(error.textContent).not.toContain("private-provider-message");
  expect(document.activeElement).toBe(error);
  expect((screen.getByLabelText("E-mail") as HTMLInputElement).value).toBe("ana@example.test");
  await userEvent.click(screen.getByRole("button", { name: "Entrar no GoNomad" }));
  await screen.findByRole("heading", { name: "Minhas viagens" });
});
it("locks repeated login submissions and exposes pending feedback", async () => {
  let release: (value: unknown) => void;
  fake.client.auth.signInWithPassword.mockImplementationOnce(() => new Promise((resolve) => { release = resolve; }));
  window.history.replaceState(null, "", "/auth/login");render(<App />);
  await userEvent.type(await screen.findByLabelText("E-mail"), "ana@example.test");
  await userEvent.type(screen.getByLabelText("Senha", { exact: true }), "Senha!123");
  const form = screen.getByRole("button", { name: "Entrar no GoNomad" }).closest("form");
  fireEvent.submit(form);fireEvent.submit(form);
  await waitFor(() => expect(fake.client.auth.signInWithPassword).toHaveBeenCalledOnce());
  expect(form.getAttribute("aria-busy")).toBe("true");
  expect(form.querySelector("fieldset").disabled).toBe(true);
  await act(async () => release({ error: { code: "invalid_credentials" } }));
  await screen.findByRole("alert");expect(form.querySelector("fieldset").disabled).toBe(false);
});
it("retains protected-route intent through signup, neutral confirmation feedback, and subsequent login", async () => {
  window.history.replaceState(null, "", "/trip/new");render(<App />);
  await userEvent.click(await screen.findByRole("link", { name: "Cadastrar com e-mail" }));
  await fillSignup();await userEvent.click(screen.getByRole("button", { name: "Criar Conta" }));
  await screen.findByRole("heading", { name: "Confira seu e-mail" });
  expect(screen.getByRole("status").textContent).toContain("Se o endereço puder ser cadastrado");
  expect(fake.client.auth.signUp.mock.calls[0][0]).toMatchObject({ options: { emailRedirectTo: `${window.location.origin}/auth/confirm`, data: { name: "Ana", country: "BR", birthdate: "1990-05-20", travel_profiles: ["Trabalhador Remoto"] } } });
  fake.confirm("ana@example.test");
  await userEvent.click(screen.getByRole("link", { name: "Já confirmei: entrar" }));await login();
  await screen.findByLabelText("Destino");expect(window.location.pathname).toBe("/trip/new");
});
it("reports signup network failures without losing the entered profile or creating a trip", async () => {
  fake.client.auth.signUp.mockRejectedValueOnce(new Error("offline"));
  window.history.replaceState(null, "", "/auth/signup");render(<App />);await fillSignup();
  await userEvent.click(screen.getByRole("button", { name: "Criar Conta" }));
  expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível concluir o cadastro");
  expect((screen.getByLabelText("Nome Completo") as HTMLInputElement).value).toBe("Ana");
  expect(fake.rows).toHaveLength(0);expect(fake.insert).not.toHaveBeenCalled();
});
it.each(["https://evil.example", "//evil.example", "/\\evil.example", "/trip/new?token=private", "/auth/login", "/trip/%2f%2fevil", "/trip/summary"])("rejects an unsafe or unsupported return path: %s", (pathname) => {
  expect(safeAuthReturn({ from: { pathname } })).toBe("/trips");
});
it.each(["/trip/new", "/trip/real-trip", "/profile/edit", "/settings"])("preserves a known internal return path: %s", (pathname) => {
  expect(safeAuthReturn({ from: { pathname, search: "?token=private", hash: "#private" } })).toBe(pathname);
});

it("does not redirect away from the demo when a login started on another screen finishes late", async () => {
  fake.register();await fake.client.auth.signOut();
  const signIn = fake.client.auth.signInWithPassword.getMockImplementation();
  let release: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  fake.client.auth.signInWithPassword.mockImplementationOnce(async (credentials) => { await gate; return signIn(credentials); });
  window.history.replaceState(null, "", "/auth/login");render(<App />);await login();
  await userEvent.click(screen.getByRole("link", { name: "Explorar como convidado · sem cadastro" }));
  await screen.findByRole("article", { name: "Viagem de demonstração" });
  await act(async () => release());
  await screen.findByText("Comece uma viagem pessoal em branco. Este exemplo continua separado dos seus dados.");
  expect(window.location.pathname).toBe("/demo");
  expect(fake.rows).toHaveLength(0);
});
