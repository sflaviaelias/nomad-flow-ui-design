
import React from "react";
import { Check } from "lucide-react";

export default function SuggestionCard({
  suggestion,
  selected,
  onToggle
}: {
  suggestion: any;
  selected: boolean;
  onToggle: () => void;
}) {
  // Render different suggestion types
  if (suggestion.tipo === "coworking") {
    return (
      <div
        className={`border rounded-md px-4 py-3 flex items-center justify-between gap-2 cursor-pointer transition-all ${
          selected ? "border-terracotta bg-[#FFE6DF]" : "border-[#dadada] bg-white"
        }`}
        onClick={onToggle}
        tabIndex={0}
        aria-pressed={selected}
      >
        <div>
          <div className="font-semibold text-[#C9583C]">{suggestion.nome}</div>
          <div className="text-xs text-neutral-700">{suggestion.descricao}</div>
        </div>
        {selected && <Check className="text-terracotta" />}
      </div>
    );
  }
  if (suggestion.tipo === "alerta") {
    return (
      <div
        className={`border-l-4 pl-3 pr-4 py-2 rounded bg-[#FFF8F1] text-[#A46130] flex items-center gap-1 ${selected ? "border-terracotta" : "border-[#E8C6AD]"}`}
        onClick={onToggle}
        tabIndex={0}
        aria-pressed={selected}
      >
        <span className="text-xs">{suggestion.mensagem}</span>
        {selected && <Check className="text-terracotta ml-1" />}
      </div>
    );
  }
  // Fallback
  return (
    <div
      className={`border rounded-md px-4 py-3 flex items-center gap-2 cursor-pointer transition-all ${
        selected ? "border-terracotta bg-[#FFE6DF]" : "border-[#dadada] bg-white"
      }`}
      onClick={onToggle}
      tabIndex={0}
      aria-pressed={selected}
    >
      <span className="text-sm font-medium">
        {JSON.stringify(suggestion)}
      </span>
      {selected && <Check className="text-terracotta" />}
    </div>
  );
}
