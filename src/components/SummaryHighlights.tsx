
import React from "react";
import { Star, TrendingUp, MapPinned } from "lucide-react";

interface Place {
  name: string;
  imageUrl: string;
  visits: number;
}

interface SummaryHighlightsProps {
  places: Place[];
  totalSpent: string;
  avgPerDay: string;
  topCategory: string;
}

export const SummaryHighlights: React.FC<SummaryHighlightsProps> = ({
  places,
  totalSpent,
  avgPerDay,
  topCategory,
}) => {
  return (
    <section className="mb-6">
      <h3 className="font-inter font-semibold text-base text-[#AD4F36] flex items-center gap-2 mb-3">
        <Star className="text-[#E76F51]" /> Destaques da Viagem
      </h3>
      {/* Lugares mais visitados */}
      <div className="mb-4">
        <div className="text-xs text-neutral-500 font-medium mb-2">Lugares mais visitados:</div>
        <div className="flex gap-3">
          {places.map((p) => (
            <div key={p.name} className="flex flex-col items-center w-20">
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-12 h-12 rounded-lg object-cover shadow-xs mb-1 border border-[#E76F51]/10"
              />
              <div className="text-xs font-inter text-[#6D4530] truncate text-center">{p.name}</div>
              <div className="text-[11px] text-neutral-400">{p.visits}x</div>
            </div>
          ))}
        </div>
      </div>
      {/* Gasto total + média + categoria maior gasto */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-[#E76F51] w-4 h-4" />
          <span className="text-xs text-neutral-700">Gasto total:</span>
          <span className="font-bold text-[#E76F51] ml-1">{totalSpent}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="text-[#AD4F36] opacity-70 w-4 h-4" />
          <span className="text-xs text-neutral-700">Média por dia:</span>
          <span className="font-bold text-[#AD4F36] ml-1">{avgPerDay}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPinned className="text-[#C9583C] w-4 h-4" />
          <span className="text-xs text-neutral-700">Maior gasto em:</span>
          <span className="ml-1 font-medium text-[#C9583C]">{topCategory}</span>
        </div>
      </div>
    </section>
  );
};
