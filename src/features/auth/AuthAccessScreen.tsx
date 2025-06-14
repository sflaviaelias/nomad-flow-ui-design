
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AuthAccessScreen() {
  const navigate = useNavigate();

  const handleSocial = async () => {
    try {
      // Usa o mesmo handler que AuthPage para padronizar (e evitar rota inexistente!)
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/auth" },
      });
    } catch (e) {
      // erro será tratado pelo provider em outro lugar
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#FAF3EC] px-4">
      <div className="w-full max-w-md">
        <h2 className="font-bold text-2xl mb-6 text-terra-700 text-center" style={{fontFamily: "Inter"}}>
          Crie sua conta
        </h2>
        <Button
          className="w-full py-3 mb-3 bg-[#E76F51] text-white font-semibold text-base shadow-md hover:bg-[#CC5A3D]"
          onClick={handleSocial}
        >
          <Globe className="mr-2" /> Entrar com Google
        </Button>
        <Button
          className="w-full py-3 mb-3 bg-white text-[#E76F51] border border-[#E76F51] font-semibold text-base shadow"
          onClick={() => navigate("/auth")}
        >
          Cadastrar com e-mail
        </Button>
        <Button
          variant="ghost"
          className="w-full py-2 mb-4 text-neutral-500 underline text-sm"
          onClick={() => navigate("/auth/login")}
        >
          Já tem conta? <span className="ml-1 underline">Entrar</span>
        </Button>
        <Button
          variant="link"
          className="w-full py-2 text-xs text-neutral-400"
          onClick={() => navigate("/")}
        >
          Explorar como Convidado
        </Button>
      </div>
    </div>
  );
}
