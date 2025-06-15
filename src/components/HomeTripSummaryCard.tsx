
import React from "react";
import { BarChart3, ArrowRight } from "lucide-react";
import { useActiveTripSmartSummary } from "@/hooks/useActiveTripSmartSummary";
import { useNavigate } from "react-router-dom";

// Card curto do resumo inteligente, com botão de acesso à página completa
export default function HomeTripSummaryCard() {
  const { summary } = useActiveTripSmartSummary();
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl bg-white shadow-card px-6 py-5 mb-6 flex flex-col gap-2 border border-[#E76F51]/10 font-inter relative">
      <div className="flex items-center gap-4">
        <div className="bg-[#FAF3EC] rounded-xl p-3 shrink-0">
          <BarChart3 size={30} className="text-[#E76F51]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base text-[#AD4F36] mb-1 truncate">
            Resumo Inteligente da Viagem
          </div>
          <div className="text-xs text-neutral-700 truncate">
            Veja insights, destaques e dicas personalizadas com IA.
          </div>
        </div>
      </div>
      {/* Destaques rápidos */}
      <div className="flex gap-6 mt-2 items-center">
        <div>
          <div className="text-[11px] text-[#AD4F36] font-semibold mb-0.5">Lugares</div>
          <div className="flex gap-1">
            {summary.highlights.places.slice(0, 2).map((p) => (
              <img
                src={p.imageUrl}
                alt={p.name}
                key={p.name}
                className="w-7 h-7 rounded-md object-cover border border-[#E76F51]/10"
                title={p.name}
              />
            ))}
            {summary.highlights.places.length > 2 && (
              <span className="text-xs text-[#AD4F36] ml-1 font-bold">+{summary.highlights.places.length - 2}</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-[#AD4F36] font-semibold mb-0.5">Gastos</div>
          <span className="font-bold text-[13px] text-[#C9583C]">{summary.highlights.totalSpent}</span>
        </div>
      </div>
      <button
        className="mt-4 self-end flex items-center gap-1 text-xs font-medium px-3 py-1 bg-[#FAF3EC] hover:bg-[#FFE7DD] text-[#E76F51] rounded-lg border border-[#E76F51]/15 transition focus:outline-none min-h-[36px]"
        aria-label="Ver resumo completo"
        onClick={() => navigate("/trip/smart-summary")}
        style={{ minWidth: 110 }}
      >
        Ver resumo <ArrowRight size={16} />
      </button>
    </section>
  );
}
