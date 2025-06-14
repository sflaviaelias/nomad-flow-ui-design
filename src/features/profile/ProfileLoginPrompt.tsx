
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "./ProfileAvatar";
import { useNavigate } from "react-router-dom";

export function ProfileLoginPrompt() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF3EC] px-4">
      <Card className="w-full max-w-md bg-white rounded-2xl p-8 border-none shadow-soft flex flex-col items-center">
        <ProfileAvatar avatarUrl={null} name={null} editable={false} />
        <h2 className="font-bold text-2xl mt-4 mb-2 text-terra-800 text-center" style={{ fontFamily: "Inter" }}>
          Sessão não iniciada
        </h2>
        <p className="text-terra-700 text-[16px] text-center mb-6" style={{ fontFamily: "Inter" }}>
          Faça login para visualizar seu perfil e personalizar sua experiência no Go Nomad.
        </p>
        <Button
          className="w-full mb-3 min-h-[44px] font-semibold bg-[#E76F51] text-white hover:bg-[#CC5A3D]"
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
      </Card>
    </div>
  );
}
