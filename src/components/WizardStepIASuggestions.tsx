
import React from "react";
import { Button } from "@/components/ui/button";
import SuggestionCard from "./SuggestionCard";

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
        <div className="text-neutral-400 text-sm my-4">Carregando sugestões…</div>
      )}
      {!loading && suggestions?.length === 0 && (
        <div className="bg-[#FBEEE5] text-neutral-600 px-4 py-3 rounded-lg text-center text-sm my-4">
          Ainda estamos gerando recomendações para sua viagem. Você pode seguir com o planejamento e receber dicas depois.
        </div>
      )}
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
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrev}>Voltar</Button>
        <Button className="bg-terracotta flex-1 text-white" onClick={onNext}>Próximo</Button>
      </div>
    </div>
  );
}
