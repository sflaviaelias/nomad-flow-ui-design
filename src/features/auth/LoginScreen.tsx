import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check session and redirect if logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/", { replace: true });
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Real authentication with Supabase
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Credenciais inválidas. Tente novamente.");
      setLoading(false);
      return;
    }
    // Success: session will be set and hook will update everything
    setLoading(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#FAF3EC] px-4">
      <div className="w-full max-w-md">
        <h2 className="font-bold text-2xl mb-6 text-terra-800 text-center" style={{fontFamily: "Inter"}}>
          Entrar no FlyNomad
        </h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white"
          />
          <Button
            className="w-full py-3 bg-[#E76F51] text-white font-semibold text-base shadow-md hover:bg-[#CC5A3D]"
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar no FlyNomad"}
          </Button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => { navigate("/auth"); }}
            className="text-xs text-terra-700 underline"
            style={{fontFamily: "Inter"}}
          >
            Esqueceu sua senha?
          </button>
        </div>
      </div>
    </div>
  );
}
