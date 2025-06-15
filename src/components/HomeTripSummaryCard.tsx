
import React, { useState } from "react";
import { BarChart3, Pencil } from "lucide-react";
import { useActiveTripSmartSummary } from "@/hooks/useActiveTripSmartSummary";
import SmartSummaryEditModal from "./SmartSummaryEditModal";

// Ajusta paddings para consistência visual com outros cards (px-6 py-5 igual ConciergeCard)
export default function HomeTripSummaryCard() {
  const { summary, updateSummary } = useActiveTripSmartSummary();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <section className="rounded-2xl bg-white shadow-card px-6 py-5 mb-6 flex flex-col gap-3 border border-[#E76F51]/10 font-inter">
      <div className="flex items-center gap-4">
        <div className="bg-[#FAF3EC] rounded-xl p-3">
          <BarChart3 size={30} className="text-[#E76F51]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base text-[#AD4F36] mb-1 truncate">
            Resumo Inteligente da Viagem
          </div>
          <div className="text-xs text-neutral-700 truncate">
            Após a viagem, veja seus destaques: gastos, lugares visitados, aprendizados e sugestões da IA.
          </div>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="p-2 rounded-md border border-[#E76F51]/20 bg-[#FAF3EC] hover:bg-[#E76F5115] active:bg-[#E76F5107] text-[#C9583C] ml-2 focus:outline-none"
          title="Editar resumo"
          aria-label="Editar resumo"
        >
          <Pencil size={19} />
        </button>
      </div>

      {/* Destaques */}
      <div className="pt-2">
        <div className="font-semibold text-xs text-[#AD4F36] mb-2">Lugares mais visitados</div>
        <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth">
          {summary.highlights.places.map((p) => (
            <div key={p.name} className="flex flex-col items-center min-w-[68px]">
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-11 h-11 rounded-xl object-cover shadow-xs mb-1 border border-[#E76F51]/15"
              />
              <div className="text-[11px] font-medium text-[#6D4530] truncate text-center">
                {p.name}
              </div>
              <div className="text-[10px] text-neutral-400">{p.visits}x</div>
            </div>
          ))}
        </div>
      </div>
      {/* Gastos */}
      <div className="pt-1 pb-2">
        <div className="font-semibold text-xs text-[#AD4F36] mb-2">Gastos por categoria</div>
        <div className="flex flex-wrap gap-3">
          {summary.highlights.byCategory.map((cat) => (
            <div
              key={cat.category}
              className="rounded-lg px-3 py-1 bg-[#FAF3EC] border border-[#DADADA] text-xs flex flex-col min-w-[90px]"
              style={{
                color: cat.color,
                fontWeight: 600
              }}
            >
              <span className="truncate">{cat.category}</span>
              <span className="font-inter font-bold text-[15px] leading-5">{cat.value}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-[#E76F51] mt-2 font-semibold">
          Total: {summary.highlights.totalSpent}
        </div>
      </div>
      {/* Insights */}
      {summary.insights.length > 0 && (
        <div>
          <div className="font-semibold text-xs text-[#AD4F36] mb-1">Insights automáticos</div>
          <ul className="ml-2 list-disc space-y-1">
            {summary.insights.map((ins, i) => (
              <li key={i} className="text-[12px] text-[#6D4530]">{ins}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Sugestões IA */}
      <div>
        <div className="font-semibold text-xs text-[#AD4F36] mb-1 mt-2">Sugestões para próxima viagem</div>
        <ul className="ml-2 list-disc space-y-1">
          {summary.suggestions.map((s, i) => (
            <li key={i} className="text-[12px] text-[#6D4530]">{s}</li>
          ))}
        </ul>
      </div>
      {/* Nota editável */}
      <div className="mt-2 mb-1">
        <div className="text-xs text-[#AD4F36] font-medium mb-1">Nota pessoal</div>
        <div className="rounded bg-[#FAF3EC] border border-[#E76F51]/12 px-3 py-2 text-[12.5px] text-[#6D4530] min-h-[36px]">
          {summary.editableNote || "—"}
        </div>
      </div>
      {/* Modal de edição */}
      <SmartSummaryEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        value={{
          editableNote: summary.editableNote,
          suggestions: summary.suggestions,
        }}
        onSave={(data) => updateSummary(data)}
      />
    </section>
  );
}
