import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, Wallet } from "lucide-react";
import EntryLayout from "@/features/entry/EntryLayout";
import { EntryButton } from "@/features/entry/EntryControls";
import { homeFocus } from "@/features/home/HomeAction";

export default function OnboardingFlow({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const heading = useRef<HTMLHeadingElement>(null);
  const navigate = useNavigate();
  function finish(path: string) {
    try { onFinish?.(); } catch { /* An optional local flag must never block navigation. */ }
    navigate(path, { replace: true });
  }
  function next() { setStep(2); requestAnimationFrame(() => heading.current?.focus()); }
  return <EntryLayout title={step === 1 ? "Viaje no seu ritmo." : "O caminho começa com um plano."} eyebrow="Uma introdução, sem compromisso" description="Um lugar para organizar viagens enquanto você leva o trabalho na bagagem. Explore primeiro; crie uma conta quando quiser guardar seus planos.">
    <div className="mb-6 flex items-center justify-between gap-4"><nav aria-label="Progresso do onboarding" className="text-xs font-semibold uppercase tracking-[0.15em] text-terra-800">{step} de 2</nav><button type="button" onClick={() => finish("/")} className={`min-h-11 rounded-lg px-2 text-sm underline underline-offset-4 ${homeFocus}`}>Pular introdução</button></div>
    <h2 ref={heading} tabIndex={-1} className="mb-4 text-2xl font-semibold outline-none">{step === 1 ? "Mais intenção. Menos planos espalhados." : "Conheça antes de criar uma conta."}</h2>
    {step === 1 ? <><p className="mb-6 text-sm leading-relaxed text-accent/85">Destinos, datas e orçamento reunidos. O essencial para começar uma viagem e retomar o planejamento depois.</p><ul className="mb-7 space-y-4">{[{ icon: MapPin, text: "Escolha o próximo destino." }, { icon: CalendarDays, text: "Encontre espaço na sua agenda." }, { icon: Wallet, text: "Defina o orçamento que faz sentido para você." }].map(({ icon: Icon, text }) => <li key={text} className="flex items-start gap-3 text-sm leading-relaxed"><Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#244956]" />{text}</li>)}</ul><EntryButton onClick={next} className="w-full">Continuar<ArrowRight aria-hidden="true" className="h-4 w-4" /></EntryButton></>
      : <><p className="mb-5 text-sm leading-relaxed text-accent/85">Explore uma viagem fictícia, sem cadastro. O exemplo é somente leitura: não salva dados, não faz recomendações e não mostra resultados de IA.</p><p className="mb-7 rounded-xl bg-cream p-4 text-sm leading-relaxed">Quando quiser um plano seu, entre ou crie sua conta. Suas viagens pessoais ficam separadas da demonstração.</p><EntryButton onClick={() => finish("/demo")} className="w-full">Explorar como convidado<ArrowRight aria-hidden="true" className="h-4 w-4" /></EntryButton><button type="button" onClick={() => { setStep(1); requestAnimationFrame(() => heading.current?.focus()); }} className={`mt-3 min-h-11 w-full rounded-lg text-sm underline underline-offset-4 ${homeFocus}`}>Voltar à introdução</button></>}
    <Link to="/auth/access" className={`mt-5 flex min-h-11 items-center justify-center rounded-lg text-sm font-semibold ${homeFocus}`}>Entrar ou criar conta</Link>
  </EntryLayout>;
}
