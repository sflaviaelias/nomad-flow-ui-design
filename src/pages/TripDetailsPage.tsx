import { useParams } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, NotebookPen, Wallet } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TripCover from "@/components/TripCover";
import { useTrip } from "@/hooks/useTrips";
import { Button } from "@/components/ui/button";
import { tripBudget, tripDate, tripDuration, tripStatus } from "@/lib/trip-presentation";
export default function TripDetailsPage() {
  const { tripId } = useParams();
  const trip = useTrip(tripId);
  const data = trip.data;
  const status = data && tripStatus(data.start_date, data.end_date);
  return <div className="min-h-screen bg-background pb-12 text-accent">
    <PageHeader title="Detalhes da viagem" showBack backTo="/trips" backLabel="Voltar para Minhas viagens" />
    <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
      {trip.isLoading ? <div role="status"><p className="mb-4">Carregando viagem...</p><div aria-hidden="true" className="h-80 animate-pulse rounded-3xl bg-terracotta-light motion-reduce:animate-none" /></div>
        : trip.isError ? <div role="alert" className="rounded-2xl border border-terracotta/20 bg-white p-6"><p>{trip.error.message}</p><Button className="mt-4 bg-terracotta-dark text-white hover:bg-accent" onClick={() => void trip.refetch()}>Tentar novamente</Button></div>
        : !data ? <section className="rounded-3xl bg-cream p-10 text-center"><MapPin aria-hidden="true" className="mx-auto mb-4 h-10 w-10 text-terracotta-dark" /><p>Viagem não encontrada ou indisponível para esta conta.</p></section>
        : <article>
          <div className="overflow-hidden rounded-3xl border border-terracotta/10 shadow-soft"><TripCover tripId={data.id} destination={data.destination} hero /></div>
          <div className="grid items-start gap-6 pt-7 lg:grid-cols-[1fr_20rem] lg:gap-10">
            <div className="min-w-0 space-y-7">
              <div><div className="mb-4 flex flex-wrap items-center gap-3"><span className={`rounded-full px-3 py-1.5 text-xs font-medium ${status.className}`}>{status.label}</span><span className="inline-flex items-center gap-1.5 text-xs text-accent/80"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{tripDuration(data.start_date, data.end_date)}</span></div>
                <h2 className="break-words text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{data.destination}</h2><p className="mt-3 text-sm leading-relaxed text-accent/80">Seu destino, do primeiro plano à próxima lembrança.</p></div>
              <section aria-label="Período da viagem" className="rounded-2xl border border-terracotta/10 bg-white p-6"><h3 className="mb-5 flex items-center gap-2 text-base font-semibold"><CalendarDays aria-hidden="true" className="h-5 w-5 text-terracotta-dark" />O tempo da sua viagem</h3>
                <dl className="grid gap-5 sm:grid-cols-2"><div><dt className="text-xs text-accent/80">Início</dt><dd className="mt-1 text-sm font-semibold"><time dateTime={data.start_date}>{tripDate(data.start_date)}</time></dd></div><div><dt className="text-xs text-accent/80">Término</dt><dd className="mt-1 text-sm font-semibold"><time dateTime={data.end_date}>{tripDate(data.end_date)}</time></dd></div></dl>
              </section>
              {data.notes && <section className="rounded-2xl border border-terracotta/10 bg-white p-6"><h3 className="mb-3 flex items-center gap-2 font-semibold"><NotebookPen aria-hidden="true" className="h-5 w-5 text-terracotta-dark" />Suas anotações</h3><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{data.notes}</p></section>}
              {Array.isArray(data.checklist) && data.checklist.length > 0 && <section className="rounded-2xl border border-terracotta/10 bg-white p-6"><h3 className="mb-3 font-semibold">Checklist</h3><ul className="list-inside list-disc space-y-2 text-sm">{data.checklist.map((item, index) => <li className="break-words" key={index}>{typeof item === "string" ? item : JSON.stringify(item)}</li>)}</ul></section>}
            </div>
            <aside className="rounded-2xl border border-terracotta/20 bg-cream p-6 lg:sticky lg:top-6" aria-label="Orçamento da viagem">
              <Wallet aria-hidden="true" className="mb-4 h-6 w-6 text-terracotta-dark" /><h3 className="text-sm font-medium">Orçamento planejado</h3><p className="mt-2 break-words text-3xl font-semibold tracking-tight">{tripBudget(data.budget, data.currency)}</p><p className="mt-3 text-xs leading-relaxed text-accent/80">{data.budget === null ? "Você ainda não informou um orçamento para esta viagem." : "Valor total informado ao criar sua viagem."}</p>
              <div className="mt-6 border-t border-terracotta/15 pt-4 text-xs text-accent/80">{tripDuration(data.start_date, data.end_date)} para viver novas histórias.</div>
            </aside>
          </div>
        </article>}
    </main>
  </div>;
}
