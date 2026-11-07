
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LogoMini from "@/components/LogoMini";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useSupabaseAuth();
  useEffect(() => {
    if (user) navigate("/trips", { replace: true });
  }, [user, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setError(null);
    try {
      const { error: failure } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (failure) {
        setError(failure.code === "email_not_confirmed"
          ? "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada."
          : "Não foi possível entrar. Confira e-mail e senha e tente novamente.");
        return;
      }
      setPassword("");
      navigate("/trips", { replace: true });
    } catch {
      setError("Não foi possível conectar. Tente novamente.");
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#FAF3EC] px-4">
      <div className="w-full max-w-md">
        {/* Logo centralizada acima dos campos */}
        <div className="flex justify-center mb-8">
          <LogoMini size="medium" showText={true} />
        </div>
        
        <h2 className="font-bold text-2xl mb-6 text-terra-800 text-center" style={{fontFamily: "Inter"}}>
          Entrar no GoNomad
        </h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            type="email"
            aria-label="E-mail"
            autoComplete="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white"
          />
          <Input
            type="password"
            aria-label="Senha"
            autoComplete="current-password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white"
          />
          <Button
            className="w-full py-3 bg-[#E76F51] text-white font-semibold text-base shadow-md hover:bg-[#CC5A3D]"
            type="submit"
            disabled={loading || authLoading}
          >
            {loading ? "Entrando..." : "Entrar no GoNomad"}
          </Button>
          {error && <div role="alert" className="text-red-500 text-sm">{error}</div>}
        </form>
        <Button variant="ghost" onClick={() => navigate("/auth/signup")}>Criar conta</Button>
      </div>
    </div>
  );
}
