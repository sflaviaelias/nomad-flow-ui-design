import { expect, it } from "vitest";
import { AUTH_STORAGE_KEY, clearLocalAuth } from "./client";

it("logout remove tokens e tentativas privadas, preservando preferências não privadas", () => {
  localStorage.setItem(AUTH_STORAGE_KEY, "sessao-ficticia");
  localStorage.setItem(`${AUTH_STORAGE_KEY}-code-verifier`, "verificador-ficticio");
  localStorage.setItem("language", "pt-BR");
  localStorage.setItem("theme", "dark");
  sessionStorage.setItem("go-nomad:pending-trip:user-1", "id-ficticio");
  sessionStorage.setItem("go-nomad:pending-trip:user-2", "outro-id-ficticio");
  clearLocalAuth();
  expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  expect(localStorage.getItem(`${AUTH_STORAGE_KEY}-code-verifier`)).toBeNull();
  expect(localStorage.getItem("language")).toBeNull();
  expect(sessionStorage.length).toBe(0);
  expect(localStorage.getItem("theme")).toBe("dark");
});
