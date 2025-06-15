
import { useState } from "react";

export interface SmartSummary {
  highlights: {
    places: { name: string; imageUrl: string; visits: number }[];
    totalSpent: string;
    byCategory: { category: string; value: string; color: string }[];
  };
  insights: string[];
  suggestions: string[];
  editableNote: string;
}

export function useActiveTripSmartSummary() {
  // Mock inicial (futuro: chamar API Groq)
  const [summary, setSummary] = useState<SmartSummary>({
    highlights: {
      places: [
        {
          name: "Mercado Central",
          imageUrl:
            "https://images.unsplash.com/photo-1532634896-26909d0d9c49?w=100&q=80",
          visits: 3,
        },
        {
          name: "Café Avenida",
          imageUrl:
            "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=100&q=80",
          visits: 2,
        },
        {
          name: "Cowork Lab",
          imageUrl:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&q=80",
          visits: 1,
        },
      ],
      totalSpent: "R$ 2.345,00",
      byCategory: [
        { category: "Alimentação", value: "R$ 1.120", color: "#E76F51" },
        { category: "Transporte", value: "R$ 480", color: "#B5838D" },
        { category: "Hospedagem", value: "R$ 360", color: "#457B9D" },
        { category: "Lazer", value: "R$ 285", color: "#A2A2A2" },
      ],
    },
    insights: [
      "Você faz check-in em cafés com wi-fi todo dia útil.",
      "A maior parte do gasto foi com alimentação nos 3 primeiros dias.",
    ],
    suggestions: [
      "Para economizar, busque mercados locais e prepare refeições.",
      "Considere co-workings para melhor conectividade.",
      "Sua próxima viagem pode ser Porto ou Madri, ajuste o orçamento.",
    ],
    editableNote: "Considere trocar chips locais por eSIM em próximas viagens.",
  });

  // Edita o resumo (apenas nota & sugestões, simulação)
  function updateSummary(edit: Partial<SmartSummary>) {
    setSummary((s) => ({ ...s, ...edit }));
  }

  return { summary, updateSummary };
}
