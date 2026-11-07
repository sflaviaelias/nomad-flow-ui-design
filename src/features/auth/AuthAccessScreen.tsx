
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Globe, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import LogoMini from "@/components/LogoMini";
import { Separator } from "@/components/ui/separator";

export default function AuthAccessScreen() {
  const navigate = useNavigate();
  const { signOut } = useSupabaseAuth();

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

  // Explorar como convidado — corrigido para usar React Router
  const handleExploreAsGuest = async () => {
    
    try {
      // Garante sign-out antes de liberar uso como guest
      await signOut();
      
      // Marca onboarding como feito (não mostra onboarding para guest)
      localStorage.setItem("onboarding_done", "1");
      
      // Navega para Home usando React Router em vez de window.location
      navigate("/", { replace: true });
      
    } catch {
      // O logout compartilhado já remove a sessão local e informa falhas de rede.
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF3EC] px-6 py-8">
      <div className="w-full max-w-sm">
        {/* Logo centralizada com mais espaço */}
        <div className="flex justify-center mb-12">
          <LogoMini size="large" showText={true} />
        </div>

        {/* Título principal */}
        <div className="text-center mb-8">
          <h1 className="font-semibold text-3xl mb-3 text-[#1D2939]" style={{fontFamily: "Inter"}}>
            Bem-vindo
          </h1>
          <p className="text-[#667085] text-base leading-6">
            Crie sua conta para começar a planejar suas viagens
          </p>
        </div>

        {/* Ações principais de cadastro */}
        <div className="space-y-4 mb-6">
          {/* Botão Google - Ação principal futura */}
          <Button
            className="w-full h-12 bg-white text-[#344054] border border-[#D0D5DD] font-medium text-base hover:bg-[#F9FAFB] hover:border-[#98A2B3] transition-all duration-200 relative opacity-50 cursor-not-allowed shadow-sm"
            disabled
            // onClick={handleSocial} // Desativa temporariamente
          >
            <Globe className="mr-3 h-5 w-5" /> 
            Cadastrar com Google
            <span className="ml-auto bg-[#F79009] text-white text-xs font-medium px-2 py-1 rounded-md absolute right-3 top-1/2 -translate-y-1/2 select-none pointer-events-none">
              Em breve
            </span>
          </Button>

          {/* Botão Email - Ação principal disponível */}
          <Button
            className="w-full h-12 bg-[#E76F51] text-white font-medium text-base hover:bg-[#D85D3F] active:bg-[#C2513B] transition-all duration-200 shadow-sm"
            onClick={() => navigate("/auth/signup")}
          >
            <Mail className="mr-3 h-5 w-5" />
            Cadastrar com e-mail
          </Button>
        </div>

        {/* Divisor visual */}
        <div className="relative mb-6">
          <Separator className="bg-[#EAECF0]" />
          <div className="absolute inset-0 flex justify-center">
            <span className="bg-[#FAF3EC] px-3 text-sm text-[#98A2B3] font-medium">
              ou
            </span>
          </div>
        </div>

        {/* Ação secundária - Login */}
        <div className="mb-8">
          <Button
            variant="outline"
            className="w-full h-11 text-[#344054] border-[#D0D5DD] font-medium text-base hover:bg-[#F9FAFB] hover:border-[#98A2B3] transition-all duration-200"
            onClick={() => navigate("/auth/login")}
          >
            Já tem conta? Entrar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Ação terciária - Explorar como convidado */}
        <div className="text-center">
          <Button
            variant="ghost"
            className="text-[#667085] hover:text-[#344054] font-medium text-sm hover:bg-[#F9FAFB] transition-all duration-200 px-4 py-3"
            onClick={handleExploreAsGuest}
          >
            Explorar como Convidado
          </Button>
          <p className="text-xs text-[#98A2B3] mt-2 leading-5">
            Acesse funcionalidades básicas sem criar conta
          </p>
        </div>
      </div>
    </div>
  );
}
