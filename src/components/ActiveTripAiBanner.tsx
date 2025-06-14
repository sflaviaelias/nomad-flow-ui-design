
import React from "react";
import { AlertTriangle, BadgeCheck, Syringe } from "lucide-react";

type Props = {
  ai: {
    visa_required?: boolean | null;
    vaccines_required?: boolean | null;
    comment?: string;
    progress_comment?: string;
    remainingDays?: number | null;
    error?: string;
  };
  loading: boolean;
};

export default function ActiveTripAiBanner({ ai, loading }: Props) {
  if (loading || !ai) {
    return (
      <div className="w-full bg-neutral-100 text-center text-neutral-500 py-2 rounded-lg animate-pulse mb-2 h-8" aria-busy="true" />
    );
  }
  if (ai.error) return null;

  return (
    <div className="w-full flex flex-col items-start gap-1">
      {(ai.visa_required || ai.vaccines_required) && (
        <div className="flex gap-2 mb-1">
          {ai.visa_required && (
            <span className="flex items-center gap-1 bg-[#E76F51] text-white text-xs px-2 py-0.5 rounded font-medium">
              <BadgeCheck size={14} /> Visto necessário
            </span>
          )}
          {ai.vaccines_required && (
            <span className="flex items-center gap-1 bg-[#AD4F36] text-white text-xs px-2 py-0.5 rounded font-medium">
              <Syringe size={14} /> Vacinas obrigatórias
            </span>
          )}
        </div>
      )}
      {(ai.comment || ai.progress_comment) && (
        <div className="text-xs flex items-center gap-2 text-[#AD4F36] font-medium mb-1">
          <AlertTriangle size={15} className="text-[#E76F51]" />
          {ai.progress_comment || ai.comment}
        </div>
      )}
      {typeof ai.remainingDays === "number" && (
        <div className="text-xs text-neutral-500 mb-1">
          Dias restantes na viagem: <span className="font-bold">{ai.remainingDays}</span>
        </div>
      )}
    </div>
  );
}
