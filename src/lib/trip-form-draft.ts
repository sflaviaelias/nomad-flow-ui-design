/** Rascunho privado desta aba; nunca cria/atualiza uma viagem no servidor. */
export const TRIP_DRAFT_PREFIX = "go-nomad:trip-draft:";
export type TripFormDraft = { destination: string; start: string; end: string; budget: string };
const emptyDraft = (): TripFormDraft => ({ destination: "", start: "", end: "", budget: "" });
export function readTripDraft(userId?: string): TripFormDraft {
  if (!userId) return emptyDraft();
  try {
    const value = JSON.parse(sessionStorage.getItem(`${TRIP_DRAFT_PREFIX}${userId}`) || "null");
    if (value && Object.keys(emptyDraft()).every((key) => typeof value[key] === "string")) {
      return { destination: value.destination, start: value.start, end: value.end, budget: value.budget };
    }
  } catch { /* JSON antigo/inválido ou armazenamento bloqueado: formulário continua utilizável. */ }
  return emptyDraft();
}
export function clearTripDraft(userId: string): boolean {
  try { sessionStorage.removeItem(`${TRIP_DRAFT_PREFIX}${userId}`); return true; }
  catch { return false; }
}
export function writeTripDraft(userId: string | undefined, draft: TripFormDraft): boolean {
  if (!userId) return true;
  if (!Object.values(draft).some(Boolean)) return clearTripDraft(userId);
  try { sessionStorage.setItem(`${TRIP_DRAFT_PREFIX}${userId}`, JSON.stringify(draft)); return true; }
  catch { return false; }
}
