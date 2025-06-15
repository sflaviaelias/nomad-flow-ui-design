
import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, ArrowLeft } from "lucide-react";
import { useActiveTripSmartSummary } from "@/hooks/useActiveTripSmartSummary";

export default function TripSmartSummaryPage() {
  const { summary } = useActiveTripSmartSummary();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF3EC] font-inter">
      {/* Header padrão Untitled UI */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2 bg-[#FAF3EC] sticky top-0 z-20">
        <button
          onClick={() => navigate("/")}
          aria-label="Voltar"
          className="rounded-full hover:bg-[#E76F5115] flex items-center justify-center transition"
          style={{ width: 44, height: 44, minWidth: 44 }}
        >
          <ArrowLeft className="text-[#E76F51]" size={24} />
        </button>
        <span className="font-bold text-lg text-[#E76F51] flex items-center gap-2 ml-2">
          <BarChart3 size={22} className="text-[#E76F51]" />
          Resumo Inteligente
        </span>
      </header>
      <main className="max-w-md mx-auto w-full px-4 pt-4 pb-10 animate-fade-in">
        {/* Lugares mais visitados */}
        <section className="mb-6">
          <h3 className="font-inter font-semibold text-base text-[#AD4F36] mb-3 flex items-center gap-2">
            Locais mais visitados
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scroll-snap-x">
            {summary.highlights.places.map((p) => (
              <div key={p.name} className="flex flex-col items-center min-w-[70px]">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-12 h-12 rounded-lg object-cover shadow-xs mb-1 border border-[#E76F51]/15"
                />
                <div className="text-xs font-medium text-[#6D4530] truncate text-center">
                  {p.name}
                </div>
                <div className="text-[11px] text-neutral-400">{p.visits}x</div>
              </div>
            ))}
          </div>
        </section>
        {/* Gastos por categoria */}
        <section className="mb-6">
          <h3 className="font-inter font-semibold text-base text-[#AD4F36] mb-3 flex items-center gap-2">
            Gastos por categoria
          </h3>
          <div className="flex flex-wrap gap-3">
            {summary.highlights.byCategory.map((cat) => (
              <div
                key={cat.category}
                className="rounded-lg px-3 py-1 bg-[#FAF3EC] border border-[#DADADA] text-xs flex flex-col min-w-[96px]"
                style={{ color: cat.color, fontWeight: 600 }}
              >
                <span className="truncate">{cat.category}</span>
                <span className="font-inter font-bold text-[15px] leading-5">{cat.value}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-[#E76F51] mt-3 font-semibold">
            Total: {summary.highlights.totalSpent}
          </div>
        </section>
        {/* Insights */}
        {summary.insights.length > 0 && (
          <section className="mb-6">
            <h3 className="font-inter font-semibold text-base text-[#AD4F36] mb-2 flex items-center gap-2">
              Insights automáticos
            </h3>
            <ul className="ml-2 list-disc space-y-1">
              {summary.insights.map((ins, i) => (
                <li key={i} className="text-[13px] text-[#6D4530]">{ins}</li>
              ))}
            </ul>
          </section>
        )}
        {/* Sugestões IA */}
        <section className="mb-6">
          <h3 className="font-inter font-semibold text-base text-[#AD4F36] mb-2 flex items-center gap-2">
            Sugestões para próxima viagem
          </h3>
          <ul className="ml-2 list-disc space-y-1">
            {summary.suggestions.map((s, i) => (
              <li key={i} className="text-[13px] text-[#6D4530]">{s}</li>
            ))}
          </ul>
        </section>
        {/* Nota pessoal (se existir) */}
        {!!summary.editableNote && (
          <section className="mb-2">
            <h3 className="font-inter font-medium text-sm text-[#AD4F36] mb-1">
              Nota pessoal
            </h3>
            <div className="rounded bg-[#FAF3EC] border border-[#E76F51]/12 px-3 py-2 text-[13px] text-[#6D4530] min-h-[36px]">
              {summary.editableNote}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
