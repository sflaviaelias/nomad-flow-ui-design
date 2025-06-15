
import React from "react";
import { Loader2 } from "lucide-react";

export default function IATipCard({ text, loading }: { text: string; loading: boolean }) {
  return (
    <div className="bg-[#FEEDD4] text-[#C9583C] rounded-md p-3 mb-2 flex items-center gap-2 min-h-8">
      {loading && <Loader2 className="animate-spin" size={18} />}
      <span>{loading ? "Carregando dica da IA…" : text}</span>
    </div>
  );
}
