import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { deleteTrip, type Trip } from "@/lib/trips";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";

export default function DeleteTripButton({ trip }: { trip: Trip }) {
  const { user } = useSupabaseAuth();
  const cache = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);

  async function confirm() {
    if (locked.current || !user) return;
    locked.current = true;
    setDeleting(true);
    setError(null);
    try {
      await deleteTrip(user.id, trip.id);
      if (!active.current) return;
      await Promise.all([
        cache.cancelQueries({ queryKey: ["trips", user.id] }),
        cache.cancelQueries({ queryKey: ["trip-cover", user.id, trip.id] }),
      ]);
      if (!active.current) return;
      cache.removeQueries({ queryKey: ["trip-cover", user.id, trip.id] });
      cache.setQueryData<Trip[]>(["trips", user.id], (trips) => trips?.filter((item) => item.id !== trip.id));
      cache.setQueryData(["trips", user.id, trip.id], null);
      navigate("/trips", { replace: true });
      void cache.invalidateQueries({ queryKey: ["trips", user.id] });
    } catch (failure) {
      if (active.current) setError(failure instanceof Error ? failure.message : "Não foi possível excluir. Tente novamente.");
    } finally {
      locked.current = false;
      if (active.current) setDeleting(false);
    }
  }

  return <AlertDialog open={open} onOpenChange={(next) => {
    if (!locked.current) { setOpen(next); setError(null); }
  }}>
    <AlertDialogTrigger asChild><Button variant="outline" className="mb-4 ml-2">Excluir viagem</Button></AlertDialogTrigger>
    <AlertDialogContent aria-busy={deleting}>
      <AlertDialogTitle>Excluir a viagem para {trip.destination}?</AlertDialogTitle>
      <AlertDialogDescription>
        A viagem para {trip.destination}, suas despesas e sua capa serão removidas. Esta ação não pode ser desfeita.
      </AlertDialogDescription>
      {error && <p role="alert">{error}</p>}
      {deleting && <p role="status">Excluindo viagem...</p>}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
        <Button variant="destructive" disabled={deleting} onClick={() => void confirm()}>Confirmar exclusão</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
