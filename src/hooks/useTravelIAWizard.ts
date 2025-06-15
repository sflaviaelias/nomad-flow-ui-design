
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Novo hook: integrando com Edge Function real de IA
export function useTravelIAWizard() {
  const [iaText, setIAText] = useState<string | null>(null);
  const [iaLoading, setLoading] = useState(false);

  async function fetchIATip({ type, value, context = {} }: { type: string; value: any; context?: any }) {
    setLoading(true);
    setIAText(null);
    try {
      const { data, error } = await supabase.functions.invoke("travel-ai-wizard", {
        body: { type, value, context },
      });
      if (error) setIAText("Não foi possível obter dica da IA.");
      if (data?.iaText) setIAText(data.iaText);
    } catch (error) {
      setIAText("Erro ao consultar IA.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchIASuggestions({ destination, dates, budget }: { destination: string; dates: any; budget: string }) {
    try {
      const context = { destination, dates, budget };
      const { data, error } = await supabase.functions.invoke("travel-ai-wizard", {
        body: { type: "suggestions", value: "", context },
      });
      if (error) return [];
      // Espera lista de strings
      if (Array.isArray(data)) return data;
      return Array.isArray(data?.sugestoes) ? data.sugestoes : [];
    } catch {
      return [];
    }
  }

  return { iaText, iaLoading, fetchIATip, fetchIASuggestions };
}
