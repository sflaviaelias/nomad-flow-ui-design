import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, CalendarDays, Compass, LogOut, Plus, Wallet } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TripCover from "@/components/TripCover";
import { useTrips } from "@/hooks/useTrips";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { tripBudget, tripDate, tripDuration, tripStatus } from "@/lib/trip-presentation";
export default function NextTripsPage() {
  const trips = useTrips();
  const { user, signOut } = useSupabaseAuth();
  useEffect(() => {
    if (!user || !trips.data) return;
    const key = `go-nomad:pending-trip:${user.id}`;
    const pending = sessionStorage.getItem(key);
    if (pending && trips.data.some((trip) => trip.id === pending)) sessionStorage.removeItem(key);
  }, [user, trips.data]);
  return <div className="min-h-screen bg-background pb-12 text-accent">
    <PageHeader title="Minhas viagens" showBack backTo="/" rightAction={
      <button onClick={() => void signOut()} aria-label="Sair da conta" className="flex h-11 w-11 items-center justify-center rounded-full text-accent hover:bg-terracotta-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-terracotta-dark"><LogOut className="h-5 w-5" aria-hidden="true" /></button>
    } />
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-dark">Seu mundo, suas histórias</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">O próximo capítulo é seu.</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-accent/80">Reencontre seus planos e guarde espaço para novas descobertas.</p>
        </div>
        <Link to="/trip/new" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-terracotta-dark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta-dark"><Plus className="h-4 w-4" aria-hidden="true" />Criar viagem</Link>
      </div>
      {trips.isLoading ? <div role="status"><p className="mb-4 text-sm">Carregando viagens...</p><div aria-hidden="true" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((id) => <div key={id} className="h-96 animate-pulse rounded-2xl bg-terracotta-light motion-reduce:animate-none" />)}</div></div>
        : trips.isError ? <div role="alert" className="rounded-2xl border border-terracotta/20 bg-white p-6"><p>{trips.error.message}</p><Button className="mt-4 bg-terracotta-dark text-white hover:bg-accent" onClick={() => void trips.refetch()}>Tentar novamente</Button></div>
        : !trips.data?.length ? <section className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-terracotta/15 bg-gradient-to-br from-white to-cream p-8 text-center">
          <Compass aria-hidden="true" className="mb-5 h-14 w-14 stroke-1 text-terracotta-dark" /><h3 className="text-xl font-semibold">Um mundo de possibilidades</h3><p className="mt-3 max-w-sm text-sm leading-relaxed">Nenhuma viagem salva. Crie sua primeira viagem.</p>
        </section>
        : <ul className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">{trips.data.map((trip) => {
          const status = tripStatus(trip.start_date, trip.end_date);
          return <li key={trip.id} className="min-w-0"><article className="overflow-hidden rounded-2xl border border-terracotta/10 bg-white shadow-soft">
            <TripCover tripId={trip.id} destination={trip.destination} />
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-2"><span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{status.label}</span><span className="text-xs text-accent/80">{tripDuration(trip.start_date, trip.end_date)}</span></div>
              <h3 className="break-words text-2xl font-semibold leading-tight tracking-tight"><Link to={`/trip/${trip.id}`} className="rounded hover:text-terracotta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-terracotta-dark">{trip.destination}</Link></h3>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-accent/80"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-dark" aria-hidden="true" /><span><time dateTime={trip.start_date}>{tripDate(trip.start_date)}</time><br />a <time dateTime={trip.end_date}>{tripDate(trip.end_date)}</time></span></p>
              <div className="flex items-center justify-between gap-3 border-t border-terracotta/10 pt-4"><div className="min-w-0"><p className="flex items-center gap-1.5 text-xs text-accent/80"><Wallet aria-hidden="true" className="h-3.5 w-3.5" />Orçamento</p><p className="mt-1 break-words text-base font-semibold">{tripBudget(trip.budget, trip.currency)}</p></div>
                <Link to={`/trip/${trip.id}`} aria-label={`Ver detalhes de ${trip.destination}`} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-terracotta-dark hover:bg-terracotta-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-terracotta-dark">Ver viagem<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
            </div>
          </article></li>;
        })}</ul>}
    </main>
  </div>;
}
