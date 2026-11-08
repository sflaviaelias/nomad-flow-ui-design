import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { createTrip, tripDraftSchema, type TripDraft } from "@/lib/trips";
import { clearTripDraft, readTripDraft, writeTripDraft, type TripFormDraft } from "@/lib/trip-form-draft";
import { Button } from "@/components/ui/button";
export default function TripForm() {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const cache = useQueryClient();
  // AuthProvider remonta as telas privadas quando a identidade muda.
  const [draft, setDraft] = useState(() => readTripDraft(user?.id));
  const { destination, start, end, budget } = draft;
  const [draftSaved, setDraftSaved] = useState(true);
  const changeField = (field: keyof TripFormDraft, value: string) => setDraft((previous) => ({ ...previous, [field]: value }));
  useEffect(() => { setDraftSaved(writeTripDraft(user?.id, draft)); }, [user?.id, draft]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const requestId = useRef<string>();
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (locked.current || !user) return;
    const parsed = tripDraftSchema.safeParse({ destination, start_date: start, end_date: end,
      budget: budget.trim() ? Number(budget) : null, currency: "BRL" });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    locked.current = true;
    setSaving(true);
    setError(null);
    const key = `go-nomad:pending-trip:${user.id}`;
    try {
      requestId.current ??= sessionStorage.getItem(key) || crypto.randomUUID();
      sessionStorage.setItem(key, requestId.current);
      const trip = await createTrip(user.id, parsed.data as TripDraft, requestId.current);
      if (!active.current) return;
      sessionStorage.removeItem(key);
      clearTripDraft(user.id);
      await cache.invalidateQueries({ queryKey: ["trips", user.id] });
      if (active.current) navigate(`/trip/${trip.id}`, { replace: true });
    } catch (failure) {
      if (!active.current) return;
      setError(failure instanceof Error ? failure.message : "Não foi possível salvar. Tente novamente.");
    } finally { locked.current = false; if (active.current) setSaving(false); }
  }
  return <form onSubmit={submit} className="space-y-4 p-5" aria-busy={saving}>
    <fieldset disabled={saving} className="space-y-4">
      <label className="block">Destino<input className="input block w-full" required value={destination} onChange={(e) => changeField("destination", e.target.value)} /></label>
      <label className="block">Início<input className="input block w-full" type="date" required value={start} onChange={(e) => changeField("start", e.target.value)} /></label>
      <label className="block">Término<input className="input block w-full" type="date" required min={start || undefined} value={end} onChange={(e) => changeField("end", e.target.value)} /></label>
      <label className="block">Orçamento em reais (BRL), opcional<input className="input block w-full" type="number" min="0" step="0.01" value={budget} onChange={(e) => changeField("budget", e.target.value)} /></label>
      <Button type="submit">{saving ? "Salvando..." : "Salvar viagem"}</Button>
    </fieldset>
    {error && <p role="alert">{error}</p>}
    {!draftSaved && <p role="status">Não foi possível guardar seu rascunho neste navegador. Copie os dados antes de sair.</p>}
    <Link className="block underline" to="/trips">Minhas viagens</Link>
  </form>;
}
