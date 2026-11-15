import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { createFakeSupabase } from "./fake-supabase";
const fake = createFakeSupabase();
vi.mock("@/integrations/supabase/client", () => ({
  SUPABASE_URL: "http://127.0.0.1:54321", AUTH_STORAGE_KEY: "fake-auth-key",
  supabase: new Proxy({}, { get: (_target, key) => fake.client[key] }), clearLocalAuth: () => fake.clear(),
}));
import App from "@/App";
beforeEach(() => { fake.reset(); localStorage.clear(); window.history.replaceState(null, "", "/"); });
it("shows the real Home to a first-time visitor without changing guest or auth storage", async () => {
  render(<App />);
  await screen.findByRole("heading", { name: /Novos destinos/ });
  expect(window.location.pathname).toBe("/");
  expect(localStorage.getItem("onboarding_done")).toBeNull();
  expect(fake.client.auth.signOut).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("link", { name: "Já tenho conta" }));
  await screen.findByRole("heading", { name: "Entrar no GoNomad" });
  expect(window.location.pathname).toBe("/auth/login");
});
it("keeps the existing optional onboarding route available", async () => {
  window.history.replaceState(null, "", "/onboarding");render(<App />);
  expect(await screen.findByRole("navigation", { name: "Progresso do onboarding" })).toBeTruthy();
});
