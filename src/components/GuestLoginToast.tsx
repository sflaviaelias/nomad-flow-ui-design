
import { toast } from "@/hooks/use-toast";

/**
 * Exibe toast de bloqueio para ações de convidado.
 */
export function showGuestBlockedToast() {
  toast({
    title: "Faça login para acessar",
    description: "Para usar essa funcionalidade, faça login ou crie uma conta. É rápido e gratuito!",
    variant: "destructive",
    action: (
      <a
        href="/auth/access"
        className="ml-3 underline font-semibold text-[#E76F51] hover:text-[#C9583C]"
        style={{ fontFamily: "Inter" }}
      >
        Entrar / Criar Conta
      </a>
    ),
  });
}
