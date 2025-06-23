
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Globe, ArrowLeft } from "lucide-react";
import LogoMini from "@/components/LogoMini";
import { Separator } from "@/components/ui/separator";
import { useGuestSession } from "@/hooks/useGuestSession";

export default function NewTripAuthPrompt() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useGuestSession();

  // Se usuário já está autenticado, redireciona para a página de nova viagem
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/trip/new", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF3EC] text-terra-700">
        <span className="animate-pulse text-lg">Carregando...</span>
      </div>
    );
  }

  // Se não está autenticado, mostra as opções de login/cadastro
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF3EC] pb-safe">
      {/* Header com botão voltar */}
      <header className="w-full flex items-center gap-2 px-4 pt-4 pb-3 bg-[#FAF3EC] shadow-soft rounded-b-lg sticky top-0 z-20">
        <button
          aria-label="Voltar"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-full hover:bg-[#E76F5112] active:bg-[#E76F5130] transition"
          style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
        >
          <ArrowLeft size={24} className="text-[#E76F51]" />
        </button>
        <div className="flex-1" />
      </header>

      {/* Conteúdo principal */}
      <main className="flex flex-1 flex-col justify-center items-center w-full px-6 py-8">
        <div className="w-full max-w-sm">
          {/* Logo centralizada */}
          <div className="flex justify-center mb-12">
            <LogoMini size="large" showText={true} />
          </div>

          {/* Título principal */}
          <div className="text-center mb-8">
            <h1 className="font-semibold text-3xl mb-3 text-[#1D2939]" style={{fontFamily: "Inter"}}>
              Planeje sua viagem
            </h1>
            <p className="text-[#667085] text-base leading-6">
              Faça login ou crie sua conta para começar a planejar sua próxima aventura
            </p>
          </div>

          {/* Ações principais de cadastro */}
          <div className="space-y-4 mb-6">
            {/* Botão Google - Desabilitado por enquanto */}
            <Button
              className="w-full h-12 bg-white text-[#344054] border border-[#D0D5DD] font-medium text-base hover:bg-[#F9FAFB] hover:border-[#98A2B3] transition-all duration-200 relative opacity-50 cursor-not-allowed shadow-sm"
              disabled
            >
              <Globe className="mr-3 h-5 w-5" /> 
              Cadastrar com Google
              <span className="ml-auto bg-[#F79009] text-white text-xs font-medium px-2 py-1 rounded-md absolute right-3 top-1/2 -translate-y-1/2 select-none pointer-events-none">
                Em breve
              </span>
            </Button>

            {/* Botão Email - Principal disponível */}
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

          {/* Botão de Login */}
          <div className="mb-8">
            <Button
              variant="outline"
              className="w-full h-11 text-[#344054] border-[#D0D5DD] font-medium text-base hover:bg-[#F9FAFB] hover:border-[#98A2B3] transition-all duration-200"
              onClick={() => navigate("/auth/login")}
            >
              Já tem conta? Entrar
            </Button>
          </div>

          {/* Texto explicativo */}
          <div className="text-center">
            <p className="text-sm text-[#667085] leading-5">
              Com uma conta, você pode salvar suas viagens, acompanhar gastos e receber sugestões personalizadas da IA.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
