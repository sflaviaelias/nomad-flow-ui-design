import { Link } from "react-router-dom";
import { useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { useTrips } from "@/hooks/useTrips";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
export default function NextTripsPage() {
  const trips = useTrips();
  const { user, signOut } = useSupabaseAuth();
  useEffect(() => {
    if (!user || !trips.data) return;
    const key = `go-nomad:pending-trip:${user.id}`;
    const pending = sessionStorage.getItem(key);
    // A lista reconhece uma gravação cuja resposta se perdeu. Depois de vê-la,
    // o usuário pode iniciar outra tentativa, com novo ID, sem sobrescrever nada.
    if (pending && trips.data.some((trip) => trip.id === pending)) sessionStorage.removeItem(key);
  }, [user, trips.data]);
  return <div className="min-h-screen bg-[#FAF3EC]">
    <PageHeader title="Minhas viagens" showBack backTo="/" />
    <main className="max-w-lg mx-auto p-5 space-y-4">
      <Link to="/trip/new" className="underline">Criar viagem</Link>
      <Button className="ml-4" onClick={() => void signOut()}>Sair da conta</Button>
      {trips.isLoading ? <p role="status">Carregando viagens...</p>
        : trips.isError ? <div role="alert">{trips.error.message} <Button onClick={() => void trips.refetch()}>Tentar novamente</Button></div>
        : !trips.data?.length ? <p>Nenhuma viagem salva. Crie sua primeira viagem.</p>
        : <ul className="space-y-4">{trips.data.map((trip) => <li key={trip.id} className="rounded bg-white p-4">
          <Link to={`/trip/${trip.id}`} className="font-semibold underline">{trip.destination}</Link>
          <p>{trip.start_date} a {trip.end_date}</p>
        </li>)}</ul>}
    </main>
  </div>;
}
