
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

interface GuestOrAuthRouteProps {
  children: React.ReactNode;
}

export default function GuestOrAuthRoute({ children }: GuestOrAuthRouteProps) {
  const { user, loading } = useSupabaseAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF3EC] text-terra-700">
        <span className="animate-pulse text-lg">Carregando...</span>
      </div>
    );
  }

  // Se há usuário logado, permite acesso
  if (user) {
    return <>{children}</>;
  }

  // Se não há usuário, verifica se está em modo convidado
  const isGuestMode = localStorage.getItem("onboarding_done") === "1";
  
  if (isGuestMode) {
    return <>{children}</>;
  }

  // Se não está logado e não está em modo convidado, redireciona para auth
  return <Navigate to="/auth/access" state={{ from: location }} replace />;
}
