import { BriefcaseBusiness, MapPin, UsersRound, Sparkles } from "lucide-react";
const pillars = [
  { icon: BriefcaseBusiness, title: "Trabalho remoto", description: "Mais clareza para conciliar a rotina e a estrada." },
  { icon: MapPin, title: "Descoberta local", description: "Novas formas de conhecer cada destino." },
  { icon: UsersRound, title: "Comunidade", description: "Conexões que tornam o caminho mais rico." },
  { icon: Sparkles, title: "Planejamento com IA", description: "Apoio para transformar ideias em planos." },
];
export default function HomeExplore() {
  return <section id="explore" aria-labelledby="explore-heading" className="scroll-mt-6 border-t border-accent/15 pt-9 sm:pt-12">
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-terra-800">Explore o Go Nomad</p><h2 id="explore-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Mais caminhos pela frente.</h2></div>
      <p className="max-w-xs text-xs leading-relaxed text-accent/80"><span className="font-semibold text-[#244956]">Visão de futuro.</span> Conceitos em estudo, ainda não disponíveis. Hoje, comece organizando suas viagens.</p>
    </div>
    <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">{pillars.map(({ icon: Icon, title, description }) => <div key={title} className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-cream"><Icon aria-hidden="true" className="h-4 w-4 text-[#244956]" /></span><div><h3 className="mb-1 text-sm font-semibold">{title}</h3><p className="text-xs leading-relaxed text-accent/80">{description}</p></div></div>)}</div>
  </section>;
}
