
import React from "react";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomeCommunityCard() {
  return (
    <section className="rounded-2xl bg-white shadow-card px-5 py-5 mb-5 flex items-center gap-4 border border-[#E76F51]/10">
      <div className="bg-[#FAF3EC] rounded-xl p-3">
        <Users size={30} className="text-[#E76F51]" />
      </div>
      <div className="flex flex-col flex-1">
        <div className="font-inter font-bold text-base text-[#AD4F36] mb-1">
          Comunidade Inteligente
        </div>
        <div className="text-xs text-neutral-700 mb-2">
          Conecte-se com nômades próximos e veja grupos temporários no seu destino.
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-fit px-3 text-[#E76F51] border-[#E76F51] font-bold hover:bg-[#E76F51]/10 hover:text-[#AD4F36]"
          onClick={() => window.location.href = "/community"}
        >
          Ver comunidade <ArrowRight size={16} className="ml-1" />
        </Button>
      </div>
    </section>
  );
}
