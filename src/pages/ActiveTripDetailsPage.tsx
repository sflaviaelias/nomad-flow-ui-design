import { Link, Navigate } from "react-router-dom";
import { useActiveTrip } from "@/hooks/useActiveTrip";
export default function ActiveTripDetailsPage() {
  const trip = useActiveTrip();
  if (trip.isLoading) return <p role="status">Carregando viagem...</p>;
  if (trip.isError) return <p role="alert">Não foi possível carregar a viagem. <Link to="/trips">Minhas viagens</Link></p>;
  return trip.data ? <Navigate replace to={`/trip/${trip.data.id}`} /> : <Navigate replace to="/trips" />;
}
