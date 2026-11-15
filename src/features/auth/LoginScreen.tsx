import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import EntryLayout from "@/features/entry/EntryLayout";
import { EntryAlternatives, EntryButton, EntryError } from "@/features/entry/EntryControls";
import { homeFocus } from "@/features/home/HomeAction";
import { safeAuthReturn } from "./return-path";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const returnTo = safeAuthReturn(state);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const { user, loading: authLoading, error: sessionError } = useSupabaseAuth();
  useEffect(() => { if (user) navigate(returnTo, { replace: true }); }, [user, navigate, returnTo]);
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (locked.current || authLoading) return;
    locked.current = true; setLoading(true); setError(null);
    try {
      const { error: failure } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (!active.current) return;
      if (failure) {
        setError(failure.code === "email_not_confirmed" ? "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada." : "Não foi possível entrar. Confira e-mail e senha e tente novamente.");
        return;
      }
      setPassword(""); navigate(returnTo, { replace: true });
    } catch { if (active.current) setError("Não foi possível conectar. Tente novamente."); }
    finally { locked.current = false; if (active.current) setLoading(false); }
  }
  return <EntryLayout title="Entrar no GoNomad" description="Seus destinos e seus planos, do jeito que você deixou. Entre para continuar sua jornada.">
    <h2 className="mb-6 text-xl font-semibold">Que bom ter você de volta.</h2>
    <form onSubmit={handleLogin} aria-busy={loading || authLoading} aria-describedby={error || sessionError ? "login-error" : undefined} className="entry-fields space-y-5">
      <fieldset disabled={loading || authLoading} className="space-y-5">
        <label className="block" htmlFor="login-email">E-mail<input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" placeholder="voce@exemplo.com" /></label>
        <div><label className="block" htmlFor="login-password">Senha</label><div className="relative mt-2"><input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="entry-password" /><button type="button" aria-pressed={showPassword} aria-label={showPassword ? "Esconder senha" : "Mostrar senha"} onClick={() => setShowPassword(!showPassword)} className={`absolute right-1 top-0.5 flex h-11 w-11 items-center justify-center rounded-lg ${homeFocus}`}>{showPassword ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}</button></div></div>
        <EntryButton type="submit" className="w-full">{loading ? "Entrando..." : "Entrar no GoNomad"}</EntryButton>
      </fieldset>
      {authLoading && <p role="status" className="text-sm">Verificando sua sessão...</p>}
      <EntryError id="login-error" message={error || sessionError} />
    </form>
    <EntryAlternatives signup />
  </EntryLayout>;
}
