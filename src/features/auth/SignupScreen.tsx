import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import CountrySelect from "@/components/CountrySelect";
import TravelProfileCheckboxes from "@/features/profile/TravelProfileCheckboxes";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import EntryLayout from "@/features/entry/EntryLayout";
import { EntryAlternatives, EntryButton, EntryError } from "@/features/entry/EntryControls";
import { HomeAction, homeFocus } from "@/features/home/HomeAction";
import { safeAuthReturn } from "./return-path";

function validatePassword(pwd: string) {
  return pwd.length >= 8 && /[A-Za-z]/.test(pwd) && /\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);
}
export default function SignupScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const returnTo = safeAuthReturn(state);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirma, setSenhaConfirma] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [dataNascimento, setDataNascimento] = useState("");
  const [pais, setPais] = useState("");
  const [profileTags, setProfileTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const locked = useRef(false);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const { user, loading: authLoading, error: sessionError } = useSupabaseAuth();
  useEffect(() => { if (user) navigate(returnTo, { replace: true }); }, [user, navigate, returnTo]);
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (locked.current || authLoading) return;
    setErro(null);
    if (!nome.trim()) return setErro("Preencha seu nome completo.");
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setErro("E-mail inválido.");
    if (!validatePassword(senha)) return setErro("A senha deve ter pelo menos 8 caracteres, incluir letras, números e símbolos.");
    if (senha !== senhaConfirma) return setErro("As senhas não coincidem.");
    if (!dataNascimento) return setErro("Informe sua data de nascimento.");
    if (!pais) return setErro("Selecione sua nacionalidade.");
    if (!profileTags.length) return setErro("Selecione pelo menos um perfil de viagem.");
    locked.current = true; setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password: senha,
        options: { data: { name: nome.trim(), birthdate: dataNascimento, country: pais, travel_profiles: profileTags }, emailRedirectTo: `${window.location.origin}/auth/confirm` },
      });
      if (!active.current) return;
      if (error) throw error;
      if (data.session) navigate(returnTo, { replace: true });
      else setPendingConfirmation(true);
      setSenha(""); setSenhaConfirma("");
    } catch { if (active.current) setErro("Não foi possível concluir o cadastro. Confira os dados e tente novamente."); }
    finally { locked.current = false; if (active.current) setLoading(false); }
  }
  if (pendingConfirmation) return <EntryLayout title="Confira seu e-mail" eyebrow="Mais um passo para começar" description="Sua próxima jornada merece um lugar para guardar os planos.">
    <MailCheck aria-hidden="true" className="mb-5 h-9 w-9 stroke-[1.3] text-[#244956]" />
    <p role="status" className="mb-6 text-sm leading-relaxed">Se o endereço puder ser cadastrado, você receberá um link para confirmar sua conta. Verifique também a pasta de spam. Se não receber, tente entrar com sua conta existente.</p>
    <HomeAction to="/auth/login" state={state} className="mb-3 w-full">Já confirmei: entrar</HomeAction>
    <EntryButton onClick={() => setPendingConfirmation(false)} className="w-full border border-accent/30 bg-cream text-accent hover:bg-terracotta-light">Voltar ao cadastro</EntryButton>
    <Link to="/demo" className={`mt-5 flex min-h-11 items-center rounded-lg text-sm underline underline-offset-4 ${homeFocus}`}>Explorar enquanto isso</Link>
  </EntryLayout>;
  return <EntryLayout title="Criar sua conta" description="Guarde seus planos e reencontre cada destino. O planejamento começa com o essencial, sem pressa de chegar.">
    <h2 className="mb-2 text-xl font-semibold">Seu espaço para planejar.</h2><p className="mb-6 text-sm leading-relaxed text-accent/85">Você também pode conhecer o exemplo sem se cadastrar.</p>
    <form onSubmit={handleSubmit} aria-busy={loading || authLoading} aria-describedby={erro ? "signup-error" : undefined} className="entry-fields space-y-5">
      <fieldset disabled={loading || authLoading} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block" htmlFor="signup-name">Nome Completo<input id="signup-name" type="text" autoComplete="name" required value={nome} onChange={(e) => setNome(e.target.value)} className="mt-2" /></label>
          <label className="block" htmlFor="signup-email">E-mail<input id="signup-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" placeholder="voce@exemplo.com" /></label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label className="block" htmlFor="signup-password">Senha</label><div className="relative mt-2"><input id="signup-password" type={showSenha ? "text" : "password"} autoComplete="new-password" required value={senha} onChange={(e) => setSenha(e.target.value)} aria-describedby="signup-password-help" className="entry-password" /><button type="button" aria-pressed={showSenha} aria-label={showSenha ? "Esconder senha" : "Mostrar senha"} onClick={() => setShowSenha(!showSenha)} className={`absolute right-1 top-0.5 flex h-11 w-11 items-center justify-center rounded-lg ${homeFocus}`}>{showSenha ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}</button></div></div>
          <label className="block" htmlFor="signup-password-confirm">Confirmar Senha<input id="signup-password-confirm" type="password" autoComplete="new-password" required value={senhaConfirma} onChange={(e) => setSenhaConfirma(e.target.value)} className="mt-2" /></label>
        </div>
        <p id="signup-password-help" className="text-xs leading-relaxed text-accent/85">Mín. 8 caracteres, incluindo letra, número e símbolo.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block" htmlFor="signup-birthdate">Data de Nascimento<input id="signup-birthdate" type="date" required value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} max={format(new Date(), "yyyy-MM-dd")} className="mt-2" autoComplete="bday" /></label>
          <label className="block">Nacionalidade<span className="mt-2 block"><CountrySelect value={pais} onChange={setPais} /></span></label>
        </div>
        <fieldset className="entry-tags"><legend className="mb-2 text-sm font-medium">Perfil de Viagem</legend><TravelProfileCheckboxes value={profileTags} onChange={setProfileTags} /></fieldset>
        <EntryButton type="submit" className="w-full">{loading ? "Criando conta..." : "Criar Conta"}</EntryButton>
      </fieldset>
      {authLoading && <p role="status" className="text-sm">Verificando sua sessão...</p>}
      <EntryError id="signup-error" message={erro || sessionError} />
    </form>
    <EntryAlternatives />
  </EntryLayout>;
}
