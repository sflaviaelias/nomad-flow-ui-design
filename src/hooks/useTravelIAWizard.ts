
import { useState } from "react";

// Pode conectar com edge function/LLM de verdade depois
export function useTravelIAWizard() {
  const [iaText, setIAText] = useState<string | null>(null);
  const [iaLoading, setLoading] = useState(false);

  async function fetchIATip({ type, value }: { type: string, value: any }) {
    setLoading(true);
    setIAText(null);
    // Mock IA response:
    if (type === "destination")
      setIAText("Sabia que Buenos Aires não exige visto para brasileiros? Melhor época para visitar: entre setembro e novembro. Bairros bons para nômades digitais...");
    else if (type === "dates")
      setIAText("Durante esse período acontecem 3 eventos locais; clima seco, ideal para atividades ao ar livre.");
    else if (type === "budget")
      setIAText("Com esse orçamento, sugerimos: 50% hospedagem, 30% alimentação, 20% transporte. Dá para 7 dias usando transporte público!");
    // Simula delay:
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
  }

  async function fetchIASuggestions({ destination, dates, budget }: { destination: string, dates: any, budget: string }) {
    // Simula sugestões IA
    await new Promise(r => setTimeout(r, 1000));
    return [
      "Visite o Nomad Market da cidade",
      "Conheça coworkings centralizados: WorkCity, Nomad Spot",
      "Roteiro sugerido: 1 dia histórico, 2 dias gastronomia, 1 noite de jazz",
      "Checklist: seguro de viagem, adaptador, chip virtual",
    ];
  }

  return { iaText, iaLoading, fetchIATip, fetchIASuggestions };
}
