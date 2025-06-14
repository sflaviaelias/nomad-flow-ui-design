
import React from "react";
import { BarChart3 } from "lucide-react";

export default function HomeTripSummaryCard() {
  return (
    <section className="rounded-2xl bg-white shadow-card px-5 py-5 mb-5 flex items-center gap-4 border border-[#E76F51]/10">
      <div className="bg-[#FAF3EC] rounded-xl p-3">
        <BarChart3 size={30} className="text-[#E76F51]" />
      </div>
      <div className="flex flex-col flex-1">
        <div className="font-inter font-bold text-base text-[#AD4F36] mb-1">
          Resumo Inteligente da Viagem
        </div>
        <div className="text-xs text-neutral-700">
          Após a viagem, veja seus destaques: gastos, lugares visitados, aprendizados e sugestões para o próximo destino.
        </div>
      </div>
    </section>
  );
}
