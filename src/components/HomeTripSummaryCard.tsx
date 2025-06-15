
import React from "react";
import { BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Accept prop for activeTrip
type HomeTripSummaryCardProps = {
  activeTrip: any;
};

export default function HomeTripSummaryCard({ activeTrip }: HomeTripSummaryCardProps) {
  const navigate = useNavigate();

  // Optionally, you can use activeTrip here for advanced summaries

  return (
    <section
      className="rounded-2xl bg-white shadow-card px-6 py-5 mb-6 flex flex-col gap-2 border border-[#E76F51]/10 font-inter relative cursor-pointer transition hover:shadow-md outline-none focus:ring-2 focus:ring-[#E76F51]/60"
      tabIndex={0}
      aria-label="Resumo inteligente da viagem"
      onClick={() => navigate("/trip/smart-summary")}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") navigate("/trip/smart-summary");
      }}
      role="button"
      style={{
        userSelect: "none",
        WebkitTapHighlightColor: "#E76F5115",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="bg-[#FAF3EC] rounded-xl p-3 shrink-0">
          <BarChart3 size={30} className="text-[#E76F51]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base text-[#E76F51] mb-1 font-inter">
            Resumo Inteligente da Viagem
          </div>
          <div className="text-xs text-neutral-700 font-inter leading-snug">
            Veja insights, destaques e dicas personalizadas com IA com base na sua viagem ativa.
          </div>
        </div>
      </div>
    </section>
  );
}
