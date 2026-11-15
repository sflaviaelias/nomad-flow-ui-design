import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CalendarDays, Compass, Map, Plus, Route, Wallet } from "lucide-react";
import HomeHeader from "@/components/HomeHeader";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useTrips } from "@/hooks/useTrips";
import { activeTrip, localDateKey } from "@/lib/trips";
import FeaturedTrip from "@/features/home/FeaturedTrip";
import HomeExplore from "@/features/home/HomeExplore";
import { HomeAction, homeFocus } from "@/features/home/HomeAction";
import "@/features/home/home.css";

export default function Index() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const trips = useTrips();
  const today = localDateKey();
  const active = activeTrip(trips.data ?? [], today);
  const upcoming = trips.data?.filter((trip) => trip.start_date > today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date) || a.id.localeCompare(b.id))[0];
  const featured = active ?? upcoming;
  const ready = !!user && !authLoading && !trips.isLoading && !trips.isError;
  const featuredId = ready ? featured?.id : undefined;
  const primaryTo = !user ? "/auth/signup" : featuredId ? `/trip/${featuredId}` : ready ? "/trip/new" : "/trips";
  const primaryLabel = !user ? "Começar minha jornada" : featuredId ? "Continuar planejamento" : ready ? "Planejar uma viagem" : "Minhas viagens";
  return <div lang="pt-BR" className="home-shell min-h-screen bg-background text-accent">
    <a href="#home-content" className="sr-only z-50 rounded-lg bg-white p-4 focus:not-sr-only focus:absolute focus:left-4 focus:top-4">Pular para o conteúdo</a>
    <HomeHeader />
    <main id="home-content" tabIndex={-1} className="mx-auto max-w-7xl px-5 pb-12 pt-8 outline-none sm:px-8 sm:pt-12 lg:px-10 lg:pt-14">
      <section aria-labelledby="welcome-heading" className="relative mb-8 flex items-center justify-between gap-8 sm:mb-12">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-terra-800"><span className="h-px w-6 bg-terracotta-dark" aria-hidden="true" />Viagem e trabalho, no seu ritmo</p>
          <h1 id="welcome-heading" className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-6xl">{user ? <>Sua jornada<br />continua por aqui.</> : <>Novos destinos.<br /><span className="text-terra-800">O seu próprio ritmo.</span></>}</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-accent/85 sm:text-base">Organize destinos, datas e orçamento em um só lugar. Para viajar com intenção e levar o trabalho na bagagem.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3"><HomeAction to={primaryTo}>{primaryLabel}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></HomeAction>{!user && <Link to="/auth/login" className={`inline-flex min-h-12 items-center rounded-lg px-3 text-sm font-semibold ${homeFocus}`}>Já tenho conta<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Link>}</div>
        </div>
        <div aria-hidden="true" className="relative hidden h-52 w-64 shrink-0 items-center justify-center lg:flex">
          <div className="absolute h-40 w-40 rounded-full bg-terracotta-light/60" />
          <svg viewBox="0 0 260 200" className="relative h-full w-full fill-none"><path d="M6 150Q62 85 132 142T254 118M12 175Q82 125 151 165T260 151" stroke="#DFC8BC" strokeWidth="1.5" /><path d="M47 143C23 41 222 57 211 121" stroke="#AD4F36" strokeWidth="1.5" strokeDasharray="4 6" /><circle cx="47" cy="143" r="5" fill="#AD4F36" /><circle cx="211" cy="121" r="5" stroke="#244956" strokeWidth="2" /><path d="m126 58 10-27 8 28-9-6z" stroke="#244956" strokeWidth="1.5" /></svg>
        </div>
      </section>

      <section aria-labelledby="trip-heading" className="mb-10 sm:mb-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-1 text-xs font-medium text-terra-800">{user ? "Seus planos, mais perto" : "Um lugar para começar"}</p><h2 id="trip-heading" className="text-xl sm:text-2xl font-semibold tracking-tight">{user ? "Seu próximo capítulo" : "Da ideia ao primeiro destino."}</h2></div>{user && <Link to="/trips" aria-label="Todas as viagens" className={`inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold ${homeFocus}`}>Ver todas<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>}</div>
        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_19rem]">
          {authLoading || (user && trips.isLoading) ? <div role="status" className="min-h-80 rounded-3xl border border-accent/15 bg-white p-7"><p className="mb-5 font-medium">Carregando suas viagens...</p><div aria-hidden="true" className="h-52 animate-pulse rounded-2xl bg-terracotta-light motion-reduce:animate-none" /></div>
            : user && trips.isError ? <div role="alert" className="flex min-h-80 flex-col items-start justify-center rounded-3xl border border-accent/20 bg-white p-7"><Compass aria-hidden="true" className="mb-5 h-8 w-8 text-terra-800" /><h3 className="mb-2 text-xl font-semibold">Uma pausa no caminho.</h3><p className="mb-6 max-w-md text-sm leading-relaxed">Não foi possível carregar suas viagens. Verifique sua conexão e tente novamente.</p><button onClick={() => void trips.refetch()} disabled={trips.isFetching} className={`min-h-12 rounded-xl bg-terracotta-dark px-5 py-3 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60 ${homeFocus}`}>{trips.isFetching ? "Tentando novamente..." : "Tentar novamente"}</button></div>
            : ready && featured ? <FeaturedTrip trip={featured} active={!!active} />
              : <div className="home-horizon relative flex min-h-80 flex-col items-start justify-center overflow-hidden rounded-3xl border border-accent/15 p-6 sm:p-9">
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-12 h-64 w-64 rounded-full border-[26px] border-white/40" />
                <Compass aria-hidden="true" className="mb-5 h-9 w-9 stroke-[1.2] text-terra-800" />
                <h3 className="relative mb-3 max-w-md text-2xl font-semibold leading-tight sm:text-3xl">{user ? "Deixe espaço para a próxima história." : "Menos planos espalhados. Mais caminho pela frente."}</h3>
                <p className="relative mb-6 max-w-md text-sm leading-relaxed text-accent/85">{user ? trips.data?.length ? "Nenhuma viagem em andamento ou por vir. Seus destinos anteriores continuam em Minhas viagens." : "Você ainda não tem viagens salvas. Escolha um destino e dê forma ao seu próximo plano." : "Escolha um destino, marque as datas e defina um orçamento. Seus planos ficam guardados na sua conta."}</p>
                <HomeAction to={user ? "/trip/new" : "/auth/signup"} className="relative">{user ? trips.data?.length ? "Criar nova viagem" : "Criar minha primeira viagem" : "Criar minha conta"}<Plus aria-hidden="true" className="h-4 w-4" /></HomeAction>
              </div>}
          <aside aria-labelledby="organize-heading" className="flex min-w-0 flex-col rounded-3xl border border-accent/15 bg-cream p-6">
            <h3 id="organize-heading" className="mb-3 flex items-center gap-2 text-lg font-semibold"><Route aria-hidden="true" className="h-5 w-5 stroke-[1.4] text-[#244956]" />Um plano de cada vez.</h3>
            <p className="mb-3 hidden text-sm leading-relaxed text-accent/85 sm:block">O essencial organizado para você seguir em frente.</p>
            <div className="space-y-1">{[
              { icon: Map, title: "Seus destinos", text: "Reúna as viagens em um lugar.", to: user ? "/trips" : "/auth/signup" },
              { icon: CalendarDays, title: "Datas no lugar", text: "Consulte e ajuste seu período.", to: featuredId ? `/trip/${featuredId}` : user ? "/trip/new" : "/auth/signup" },
              { icon: Wallet, title: "Orçamento à vista", text: "Revise o valor que você planejou.", to: featuredId ? `/trip/${featuredId}` : user ? "/trips" : "/auth/signup" },
            ].map(({ icon: Icon, title, text, to }) => <Link key={title} to={to} className={`group flex min-h-16 items-center gap-3 rounded-xl py-3 ${homeFocus}`}><Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-terra-800" /><div className="min-w-0 flex-1"><span className="block text-sm font-semibold group-hover:underline">{title}</span><span className="block text-xs leading-relaxed text-accent/80">{text}</span></div><ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" /></Link>)}</div>
            {user && <HomeAction secondary to="/trip/new" className="mt-5 w-full"><Plus aria-hidden="true" className="h-4 w-4" />Nova viagem</HomeAction>}
          </aside>
        </div>
      </section>
      <HomeExplore />
      <footer className="mt-10 flex flex-col gap-2 border-t border-accent/10 pt-6 text-xs text-accent/80 sm:flex-row sm:justify-between"><p className="font-semibold">Go Nomad · Explore no seu ritmo.</p><Link to="/policies" className={`inline-flex min-h-11 items-center self-start rounded-lg underline underline-offset-4 ${homeFocus}`}>Termos e políticas</Link></footer>
    </main>
  </div>;
}
