
import React from "react";
import { Button } from "@/components/ui/button";
import SuggestionCard from "./SuggestionCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function WizardStepIASuggestions({
  suggestions,
  loading,
  onToggle,
  onNext,
  onPrev
}: {
  suggestions: any[];
  loading: boolean;
  onToggle: (idx: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div>
      <label className="font-bold text-base mb-3 text-[#AD4F36]">Sugestões da IA</label>
      {loading && (
        <div className="flex flex-col gap-3 my-4" aria-busy="true">
          <AISuggestionSkeleton />
          <AISuggestionSkeleton />
          <AISuggestionSkeleton />
        </div>
      )}
      {!loading && suggestions?.length === 0 && (
        <div className="bg-[#FBEEE5] text-neutral-600 px-4 py-3 rounded-lg text-center text-sm my-4">
          Ainda estamos gerando recomendações para sua viagem. Você pode seguir com o planejamento e receber dicas depois.
        </div>
      )}
      {!loading && (
        <div className="flex flex-col gap-3 mb-4">
          {suggestions.map((sug, idx) => (
            <SuggestionCard
              key={idx}
              suggestion={sug}
              selected={!!sug.adicionado}
              onToggle={() => onToggle(idx)}
            />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrev}>Voltar</Button>
        <Button className="bg-terracotta flex-1 text-white" onClick={onNext}>Próximo</Button>
      </div>
    </div>
  );
}

// Skeleton loader para cards de sugestão IA
function AISuggestionSkeleton() {
  return (
    <div className="border border-[#dadada] rounded-md px-4 py-3 flex items-center gap-2 bg-white">
      <Skeleton className="w-8 h-8 rounded-full bg-[#EADCD0]" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3 bg-[#EADCD0]" />
        <Skeleton className="h-3 w-1/2 bg-[#EDDFCE]" />
      </div>
    </div>
  );
}
