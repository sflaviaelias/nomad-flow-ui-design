import { afterEach, describe, expect, it, vi } from "vitest";
import { clearTripDraft, readTripDraft, TRIP_DRAFT_PREFIX, writeTripDraft } from "./trip-form-draft";
const draft = { destination: "Albânia", start: "2030-05-01", end: "2030-05-12", budget: "4500" };
afterEach(() => vi.restoreAllMocks());
describe("Rascunho privado de navegação", () => {
  it("restaura por conta e não compartilha campos entre usuários", () => {
    expect(writeTripDraft("a", draft)).toBe(true);
    expect(readTripDraft("a")).toEqual(draft);
    expect(readTripDraft("b").destination).toBe("");
    expect(readTripDraft().destination).toBe("");
    expect(clearTripDraft("a")).toBe(true);
    expect(readTripDraft("a").destination).toBe("");
  });
  it("ignora JSON inválido ou campos com tipos inesperados", () => {
    for (const value of ["{", "null", '{"destination":123}', '{"destination":"Albânia"}']) {
      sessionStorage.setItem(`${TRIP_DRAFT_PREFIX}a`, value);
      expect(readTripDraft("a").destination).toBe("");
    }
  });
  it("não mantém um rascunho vazio", () => {
    writeTripDraft("a", draft);
    writeTripDraft("a", { destination: "", start: "", end: "", budget: "" });
    expect(sessionStorage.getItem(`${TRIP_DRAFT_PREFIX}a`)).toBeNull();
  });
  it("armazenamento indisponível não lança erro nem impede formulário", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage bloqueado"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota esgotada"); });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("Storage bloqueado"); });
    expect(readTripDraft("a").destination).toBe("");
    expect(writeTripDraft("a", draft)).toBe(false);
    expect(clearTripDraft("a")).toBe(false);
  });
});
