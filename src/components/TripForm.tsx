import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { createTrip, tripDraftSchema, type TripDraft } from "@/lib/trips";
import { Button } from "@/components/ui/button";
export default function TripForm() {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const [destination, setDestination] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [budget, setBudget] = useState("");
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
      await cache.invalidateQueries({ queryKey: ["trips", user.id] });
      if (active.current) navigate(`/trip/${trip.id}`, { replace: true });
    } catch (failure) {
      if (!active.current) return;
      setError(failure instanceof Error ? failure.message : "Não foi possível salvar. Tente novamente.");
    } finally { locked.current = false; if (active.current) setSaving(false); }
  }
  return <form onSubmit={submit} className="space-y-4 p-5" aria-busy={saving}>
    <fieldset disabled={saving} className="space-y-4">
      <label className="block">Destino<input className="input block w-full" required value={destination} onChange={(e) => setDestination(e.target.value)} /></label>
      <label className="block">Início<input className="input block w-full" type="date" required value={start} onChange={(e) => setStart(e.target.value)} /></label>
      <label className="block">Término<input className="input block w-full" type="date" required min={start || undefined} value={end} onChange={(e) => setEnd(e.target.value)} /></label>
      <label className="block">Orçamento em reais (BRL), opcional<input className="input block w-full" type="number" min="0" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} /></label>
      <Button type="submit">{saving ? "Salvando..." : "Salvar viagem"}</Button>
    </fieldset>
    {error && <p role="alert">{error}</p>}
    <Link className="block underline" to="/trips">Minhas viagens</Link>
  </form>;
}
