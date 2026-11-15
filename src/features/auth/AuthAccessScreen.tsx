import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Compass } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { HomeAction, homeFocus } from "@/features/home/HomeAction";
import EntryLayout from "@/features/entry/EntryLayout";
import { safeAuthReturn } from "./return-path";

export default function AuthAccessScreen() {
  const { user, loading } = useSupabaseAuth();
  const { state } = useLocation();
  return <EntryLayout title="Bem-vindo" eyebrow="Um mundo de possibilidades" description="Conheça o Go Nomad no seu ritmo. Explore um exemplo ou entre para organizar seus próprios destinos, datas e orçamento.">
    <Compass aria-hidden="true" className="mb-5 h-8 w-8 stroke-[1.3] text-[#244956]" />
    <h2 className="mb-2 text-xl font-semibold">Escolha como começar.</h2><p className="mb-6 text-sm leading-relaxed text-accent/85">Não precisa criar uma conta para conhecer a experiência.</p>
    <div className="grid gap-3" aria-busy={loading}>
      <HomeAction to="/demo" className="w-full">Explorar como Convidado<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></HomeAction>
      <p className="mb-2 text-center text-xs leading-relaxed text-accent/80">Viagem fictícia, somente leitura. Sem cadastro.</p>
      {loading ? <p role="status" className="py-3 text-sm">Verificando sua sessão...</p> : user ? <HomeAction secondary to={safeAuthReturn(state)}>Continuar com minha conta</HomeAction> : <><HomeAction secondary to="/auth/login" state={state}>Já tem conta? Entrar</HomeAction><HomeAction secondary to="/auth/signup" state={state}>Cadastrar com e-mail</HomeAction></>}
    </div>
    <Link to="/onboarding" className={`mt-6 inline-flex min-h-11 items-center rounded-lg text-sm font-medium underline underline-offset-4 ${homeFocus}`}>Como o Go Nomad funciona</Link>
  </EntryLayout>;
}
