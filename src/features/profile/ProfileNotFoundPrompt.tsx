
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ProfileNotFoundPrompt() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF3EC] px-4">
      <div className="w-full max-w-md flex flex-col items-center justify-center mt-16">
        <h2 className="font-bold text-xl mb-4 text-terra-800 text-center" style={{ fontFamily: "Inter" }}>
          Perfil não encontrado.
        </h2>
        <div className="flex flex-col gap-2 w-full max-w-[220px]">
          <Button
            className="w-full min-h-[44px] font-semibold bg-[#E76F51] text-white hover:bg-[#CC5A3D]"
            onClick={() => navigate("/auth")}
          >
            Entrar
          </Button>
          <Button
            variant="outline"
            className="w-full min-h-[44px] font-semibold border-[#E76F51] text-[#E76F51] hover:bg-[#E76F51]/10"
            onClick={() => navigate("/auth/access")}
          >
            Criar conta
          </Button>
        </div>
      </div>
    </div>
  );
}
