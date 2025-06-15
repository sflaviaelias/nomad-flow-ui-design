
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileLoginPrompt() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF3EC] pb-safe">
      {/* Header with back button */}
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

      {/* Main area centered */}
      <main className="flex flex-1 flex-col justify-center items-center w-full px-5">
        <div className="w-full max-w-md flex flex-col items-center text-center">
          <h2
            className="text-[1.35rem] md:text-2xl font-semibold font-inter text-terra-800 mb-2"
            style={{
              letterSpacing: "-0.01em",
              lineHeight: 1.17,
            }}
          >
            Faça login para visualizar seu perfil
          </h2>
          <p className="text-terra-700 text-base mb-6 max-w-[340px] font-normal font-inter">
            Acesse sua conta para personalizar sua experiência no Go Nomad.
          </p>
          <Button
            className="w-full max-w-[270px] min-h-[44px] rounded-lg font-semibold text-base mt-2
              bg-[#E76F51] text-white shadow-md transition
              hover:bg-[#CC5A3D] active:bg-[#AD4F36]"
            onClick={() => navigate("/auth/access")}
            type="button"
            style={{ fontFamily: "Inter", letterSpacing: 0 }}
          >
            Entrar / Criar conta
          </Button>
        </div>
      </main>
    </div>
  );
}
