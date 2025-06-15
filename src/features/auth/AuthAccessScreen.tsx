import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AuthAccessScreen() {
  const navigate = useNavigate();

  // Mantém função existente para o futuro
  const handleSocial = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/auth" },
      });
    } catch (e) {
      // erro tratado pelo provider
    }
  };

  // Explorar como convidado — forçar signOut, limpar localStorage relacionado a sessão
  const handleExploreAsGuest = async () => {
    // Garante sign-out antes de liberar uso como guest
    await supabase.auth.signOut();
    // Marca onboarding como feito (não mostra onboarding para guest)
    localStorage.setItem("onboarding_done", "1");
    // Navega p/ Home e força reload leve para limpar eventuais estados residuais de usuário
    window.location.replace("/");
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#FAF3EC] px-4">
      <div className="w-full max-w-md">
        <h2 className="font-bold text-2xl mb-6 text-terra-700 text-center" style={{fontFamily: "Inter"}}>
          Crie sua conta
        </h2>
        <Button
          className="w-full py-3 mb-3 bg-[#E76F51] text-white font-semibold text-base shadow-md relative opacity-70 cursor-not-allowed"
          disabled
          // onClick={handleSocial} // Desativa temporariamente
        >
          <Globe className="mr-2" /> 
          Entrar com Google
          <span className="ml-2 bg-white/80 text-[#E76F51] text-xs font-semibold px-2 py-0.5 rounded shadow-sm absolute right-4 top-1/2 -translate-y-1/2 select-none pointer-events-none">
            Em breve
          </span>
        </Button>
        <Button
          className="w-full py-3 mb-3 bg-white text-[#E76F51] border border-[#E76F51] font-semibold text-base shadow"
          onClick={() => navigate("/auth/signup")}
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
          onClick={handleExploreAsGuest}
        >
          Explorar como Convidado
        </Button>
      </div>
    </div>
  );
}
