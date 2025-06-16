
import { useSupabaseAuth } from "./useSupabaseAuth";

/**
 * Hook que detecta se o usuário está em uma sessão de convidado válida.
 * Retorna { isGuestSession, isAuthenticated, isLoading }
 */
export function useGuestSession() {
  const { user, loading } = useSupabaseAuth();
  
  // Verifica se o onboarding foi marcado como feito (indicador de modo convidado)
  const onboardingDone = localStorage.getItem("onboarding_done") === "1";
  
  // É uma sessão de convidado se não há usuário MAS o onboarding foi feito
  const isGuestSession = !loading && !user && onboardingDone;
  
  // É autenticado se há usuário logado
  const isAuthenticated = !loading && !!user;
  
  // Debug logs temporários
  console.log("[useGuestSession] Deploy Debug - Hook chamado:", {
    user: !!user,
    loading,
    onboardingDone,
    isGuestSession,
    isAuthenticated
  });
  
  return {
    isGuestSession,
    isAuthenticated,
    isLoading: loading,
    // Útil para verificar se deve mostrar funcionalidades limitadas
    hasAccess: isAuthenticated || isGuestSession
  };
}
