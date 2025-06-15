
import { useSupabaseAuth } from "./useSupabaseAuth";

/**
 * Detecta se o usuário está acessando como convidado (não autenticado).
 * Retorna { isGuest, isLoading }
 */
export function useGuestMode() {
  const { user, loading } = useSupabaseAuth();
  // Se não está carregando E não há user, é convidado
  return { isGuest: !loading && !user, isLoading: loading };
}
