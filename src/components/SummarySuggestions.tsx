
import React from "react";
import { Sparkles } from "lucide-react";

interface SummarySuggestionsProps {
  title?: string;
  suggestions: string[];
}

export const SummarySuggestions: React.FC<SummarySuggestionsProps> = ({
  title = "Sugestões para sua próxima viagem",
  suggestions,
}) => (
  <section className="mb-8">
    <h3 className="font-inter font-semibold text-base text-[#AD4F36] flex items-center gap-2 mb-3">
      <Sparkles className="text-[#E76F51]" />
      {title}
    </h3>
    <ul className="pl-2 ml-2 list-disc space-y-1">
      {suggestions.map((s, i) => (
        <li key={i} className="text-sm text-[#6D4530]">{s}</li>
      ))}
    </ul>
  </section>
);
