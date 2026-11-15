import { ArrowUpRight, CalendarDays, MapPin, Wallet } from "lucide-react";
import TripCover from "@/components/TripCover";
import type { Trip } from "@/lib/trips";
import { tripBudget, tripDate, tripDuration } from "@/lib/trip-presentation";
import { HomeAction } from "./HomeAction";

export default function FeaturedTrip({ trip, active }: { trip: Trip; active: boolean }) {
  return <article aria-label={`Viagem em destaque: ${trip.destination}`} className="grid min-w-0 overflow-hidden rounded-3xl border border-accent/15 bg-white shadow-soft sm:grid-cols-2">
    <div className="home-trip-cover min-w-0"><TripCover key={`${trip.id}:${trip.destination}`} tripId={trip.id} destination={trip.destination} /></div>
    <div className="flex min-w-0 flex-col items-start p-6 sm:p-7">
      <span className={`mb-5 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${active ? "bg-[#244956] text-white" : "bg-terracotta-light text-accent"}`}>{active ? "Em viagem" : "Sua próxima viagem"}</span>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.13em] text-terra-800"><MapPin aria-hidden="true" className="h-3.5 w-3.5" />Seu destino</div>
      <h3 className="mb-5 max-w-full break-words text-3xl font-semibold leading-tight tracking-tight text-accent">{trip.destination}</h3>
      <dl className="mb-6 w-full space-y-4 text-sm">
        <div className="flex items-start gap-3"><CalendarDays aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-terra-800" /><div><dt className="mb-1 text-xs text-accent/80">{tripDuration(trip.start_date, trip.end_date)} de novas histórias</dt><dd className="font-medium leading-relaxed"><time dateTime={trip.start_date}>{tripDate(trip.start_date)}</time><span className="block">a <time dateTime={trip.end_date}>{tripDate(trip.end_date)}</time></span></dd></div></div>
        <div className="flex items-start gap-3"><Wallet aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-terra-800" /><div><dt className="mb-1 text-xs text-accent/80">Orçamento planejado</dt><dd className="break-words text-lg font-semibold">{tripBudget(trip.budget, trip.currency)}</dd></div></div>
      </dl>
      <HomeAction to={`/trip/${trip.id}`} className="mt-auto w-full sm:w-auto">Ver viagem<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></HomeAction>
    </div>
  </article>;
}
