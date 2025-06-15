
import React from "react";
import PageHeader from "@/components/PageHeader";
import { SummaryHighlights } from "@/components/SummaryHighlights";
import { SummaryNotes } from "@/components/SummaryNotes";
import { SummarySuggestions } from "@/components/SummarySuggestions";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockPlaces = [
  {
    name: "Mercado Central",
    imageUrl: "https://images.unsplash.com/photo-1532634896-26909d0d9c49?w=100&q=80",
    visits: 3,
  },
  {
    name: "Café Avenida",
    imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=100&q=80",
    visits: 2,
  },
  {
    name: "Cowork Lab",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&q=80",
    visits: 1,
  },
];

const TripSummaryPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF3EC] font-inter">
      <PageHeader
        title="Resumo da Viagem"
        showBack
        rightAction={
          <div className="flex items-center gap-1 text-xs text-[#AD4F36] bg-[#DFC8BC]/70 px-3 py-1 rounded-lg select-none">
            <BadgeCheck className="w-4 h-4 text-[#E76F51]" />
            Gerado automaticamente com base na sua viagem
          </div>
        }
      />
      <main className="max-w-md mx-auto w-full px-4 pb-8 pt-8 animate-fade-in">
        <SummaryHighlights
          places={mockPlaces}
          totalSpent="R$ 2.345,00"
          avgPerDay="R$ 168,00"
          topCategory="Restaurantes"
        />
        <SummaryNotes
          note="Você comentou sobre conexão ruim em alguns cafés. Considere coworkings da próxima vez!"
        />
        <SummarySuggestions
          suggestions={[
            "Com base na sua viagem a Lisboa, experimente: Porto, Madri ou Barcelona.",
            "Viaje em setembro para pegar menos chuva.",
          ]}
        />
        <Button
          className="w-full rounded-xl py-3 text-base font-bold bg-[#E76F51] hover:bg-[#C9583C] text-white shadow-card"
          onClick={() => alert('Em breve: compartilhar ou salvar resumo!')}
        >
          Compartilhar Resumo
        </Button>
      </main>
    </div>
  );
};

export default TripSummaryPage;
