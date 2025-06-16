
import { useGuestSession } from "./useGuestSession";

/**
 * Detecta se o usuário está acessando como convidado (não autenticado).
 * Retorna { isGuest, isLoading }
 * 
 * @deprecated Use useGuestSession() para mais controle
 */
export function useGuestMode() {
  const { isGuestSession, isLoading } = useGuestSession();
  return { isGuest: isGuestSession, isLoading };
}
