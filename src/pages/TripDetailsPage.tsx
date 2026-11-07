import { Link, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { useTrip } from "@/hooks/useTrips";
import { Button } from "@/components/ui/button";
export default function TripDetailsPage() {
  const { tripId } = useParams();
  const trip = useTrip(tripId);
  return <div className="min-h-screen bg-[#FAF3EC]">
    <PageHeader title="Detalhes da viagem" showBack backTo="/trips" />
    <main className="max-w-lg mx-auto p-5 space-y-4">
      {trip.isLoading ? <p role="status">Carregando viagem...</p>
        : trip.isError ? <div role="alert">{trip.error.message} <Button onClick={() => void trip.refetch()}>Tentar novamente</Button></div>
        : !trip.data ? <p>Viagem não encontrada ou indisponível para esta conta.</p>
        : <article className="bg-white p-5 rounded space-y-3">
          <h2 className="text-xl font-semibold">{trip.data.destination}</h2>
          <p>Início: {trip.data.start_date}</p><p>Término: {trip.data.end_date}</p>
          <p>Orçamento: {trip.data.budget === null ? "Não informado" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: trip.data.currency || "BRL" }).format(trip.data.budget)}</p>
          {Array.isArray(trip.data.checklist) && <ul>{trip.data.checklist.map((item, index) => <li key={index}>{typeof item === "string" ? item : JSON.stringify(item)}</li>)}</ul>}
          {trip.data.notes && <p>{trip.data.notes}</p>}
        </article>}
      <Link to="/trips" className="underline">Minhas viagens</Link>
    </main>
  </div>;
}
