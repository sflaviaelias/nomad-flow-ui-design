
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

interface GuestOrAuthRouteProps {
  children: React.ReactNode;
}

export default function GuestOrAuthRoute({ children }: GuestOrAuthRouteProps) {
  const { user, loading } = useSupabaseAuth();
  const location = useLocation();

  console.log("[GuestOrAuthRoute] Verificando acesso:", { 
    user: !!user, 
    loading, 
    path: location.pathname 
  });

  if (loading) {
    console.log("[GuestOrAuthRoute] Ainda carregando auth state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF3EC] text-terra-700">
        <span className="animate-pulse text-lg">Carregando...</span>
      </div>
    );
  }

  // Se há usuário logado, permite acesso
  if (user) {
    console.log("[GuestOrAuthRoute] Usuário autenticado, liberando acesso");
    return <>{children}</>;
  }

  // Se não há usuário, verifica se está em modo convidado
  const isGuestMode = localStorage.getItem("onboarding_done") === "1";
  
  console.log("[GuestOrAuthRoute] Verificando modo convidado:", { isGuestMode });
  
  if (isGuestMode) {
    console.log("[GuestOrAuthRoute] Modo convidado ativo, liberando acesso");
    return <>{children}</>;
  }

  // Se não está logado e não está em modo convidado, redireciona para auth
  console.log("[GuestOrAuthRoute] Redirecionando para tela de auth");
  return <Navigate to="/auth/access" state={{ from: location }} replace />;
}
