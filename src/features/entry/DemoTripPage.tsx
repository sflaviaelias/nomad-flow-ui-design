import { CalendarDays, Compass, Wallet, NotebookPen, ArrowUpRight } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { HomeAction } from "@/features/home/HomeAction";
import { tripBudget, tripDate, tripDuration } from "@/lib/trip-presentation";
import EntryLayout from "./EntryLayout";
import { demoTrip } from "./demo-trip";

export default function DemoTripPage() {
  const { user } = useSupabaseAuth();
  return <EntryLayout title="Um novo ritmo em Belgrado." eyebrow="Demonstração · Somente leitura" description="Esta viagem é um exemplo fictício para conhecer o Go Nomad. Não é um plano seu, uma recomendação ou uma reserva real.">
    <div className="mb-6 flex items-start gap-3 rounded-xl bg-terracotta-light/50 p-4"><Compass aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#244956]" /><p className="text-sm leading-relaxed"><strong>Dados fictícios.</strong> Este exemplo não é salvo nem copiado para sua conta.</p></div>
    <article aria-label="Viagem de demonstração">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-terra-800">Destino do exemplo</p><h2 className="mb-6 text-3xl font-semibold tracking-tight">{demoTrip.destination}</h2>
      <dl className="space-y-6">
        <div><dt className="mb-2 flex items-center gap-2 text-sm font-semibold"><CalendarDays aria-hidden="true" className="h-4 w-4 text-[#244956]" />{tripDuration(demoTrip.startDate, demoTrip.endDate)} no exemplo</dt><dd className="text-sm leading-relaxed"><time dateTime={demoTrip.startDate}>{tripDate(demoTrip.startDate)}</time> a <time dateTime={demoTrip.endDate}>{tripDate(demoTrip.endDate)}</time></dd></div>
        <div><dt className="mb-2 flex items-center gap-2 text-sm font-semibold"><Wallet aria-hidden="true" className="h-4 w-4 text-[#244956]" />Orçamento ilustrativo</dt><dd><span className="text-2xl font-semibold">{tripBudget(demoTrip.budget, demoTrip.currency)}</span><p className="mt-2 text-xs leading-relaxed text-accent/85">Valor fictício, não uma estimativa de custo para o destino. Sem conversão de moeda ou acompanhamento de despesas.</p></dd></div>
        <div><dt className="mb-2 flex items-center gap-2 text-sm font-semibold"><NotebookPen aria-hidden="true" className="h-4 w-4 text-[#244956]" />Notas do exemplo</dt><dd className="text-sm leading-relaxed text-accent/85">{demoTrip.notes}</dd></div>
      </dl>
    </article>
    <div className="mt-7 border-t border-accent/15 pt-6"><h3 className="mb-2 text-lg font-semibold">Pronto para um plano seu?</h3><p className="mb-5 text-sm leading-relaxed text-accent/85">{user ? "Comece uma viagem pessoal em branco. Este exemplo continua separado dos seus dados." : "Entre ou crie uma conta para salvar suas próprias viagens. Você vai começar um plano em branco."}</p><HomeAction to="/trip/new" className="w-full">Criar uma viagem pessoal<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></HomeAction><HomeAction secondary to="/" className="mt-3 w-full">Ir para Home</HomeAction></div>
  </EntryLayout>;
}
