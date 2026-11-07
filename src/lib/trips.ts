import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Data inválida.");
export const tripDraftSchema = z.object({
  destination: z.string().trim().min(1, "Informe o destino."),
  start_date: calendarDate, end_date: calendarDate,
  budget: z.number().finite().nonnegative("O orçamento não pode ser negativo.").nullable(),
  currency: z.literal("BRL"),
}).refine((value) => value.end_date >= value.start_date, {
  message: "O término deve ser igual ou posterior ao início.", path: ["end_date"],
});
export type TripDraft = Required<z.infer<typeof tripDraftSchema>>;
export type Trip = Tables<"trips">;
export async function listTrips(userId: string, signal?: AbortSignal) {
  const query = supabase.from("trips").select("*").eq("user_id", userId).order("start_date", { ascending: false });
  const { data, error } = await (signal ? query.abortSignal(signal) : query);
  if (error) throw new Error("Não foi possível carregar suas viagens.");
  return data;
}
export async function getTrip(userId: string, id: string, signal?: AbortSignal) {
  const query = supabase.from("trips").select("*").eq("user_id", userId).eq("id", id);
  const { data, error } = await (signal ? query.abortSignal(signal) : query).maybeSingle();
  if (error) throw new Error("Não foi possível carregar esta viagem.");
  return data;
}
export async function createTrip(userId: string, draft: TripDraft, id: string) {
  const input = tripDraftSchema.parse(draft) as TripDraft;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || user?.id !== userId) throw new Error("Sua sessão expirou. Entre novamente.");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (profileError || !profile) throw new Error("Seu perfil ainda não está disponível. Tente novamente ou contate o suporte.");
  const reconcile = (existing: Trip) => {
    if (existing.destination !== input.destination || existing.start_date !== input.start_date
        || existing.end_date !== input.end_date || existing.budget !== input.budget || existing.currency !== input.currency) {
      throw new Error("Esta tentativa já foi salva com outros dados. Consulte Minhas viagens antes de criar outra.");
    }
    return existing;
  };
  const previous = await getTrip(userId, id);
  if (previous) return reconcile(previous);
  try {
    const { data, error } = await supabase.from("trips").insert({
      ...input, id, user_id: userId, is_smart_trip: false,
    }).select("*").single();
    if (!error && data) return data;
  } catch { /* A resposta pode ter se perdido depois da gravação. */ }
  const recovered = await getTrip(userId, id);
  if (recovered) return reconcile(recovered);
  throw new Error("Não foi possível salvar. Seus campos foram preservados; tente novamente.");
}
export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function activeTrip(trips: Trip[], today = localDateKey()) {
  return trips.find((trip) => trip.start_date <= today && trip.end_date >= today) ?? null;
}
