
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF3EC] text-terra-700">
        <span className="animate-pulse text-lg">Carregando...</span>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth/access" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
