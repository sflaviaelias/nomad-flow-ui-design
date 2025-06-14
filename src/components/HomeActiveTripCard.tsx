import React from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveTripAI } from "@/hooks/useActiveTripAI";
import ActiveTripAiBanner from "./ActiveTripAiBanner";

type Props = {
  trip: {
    destination: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    budget: string;
    localBudget: string;
    visa?: boolean;
    vaccines?: boolean;
  };
};

export default function HomeActiveTripCard({ trip }: Props) {
  // Convert budget string (e.g., '€1200') to number (remove currency and format)
  const spent = 0; // For now, pass 0. Would get from real expenses in full integration.
  // Fix: budgetNum should be a string, already done by trip.budget cleanup:
  const budgetNum = (trip.budget || "").replace(/[^\d]/g, "");
  const { data: ai, loading } = useActiveTripAI({
    destination: trip.destination,
    tripStart: trip.startDate,
    tripEnd: trip.endDate,
    budget: budgetNum, // Budget should be a string!
    currency: (trip.budget || "BRL").replace(/[\d\s.,]/g, "") || "BRL",
    spent,
  });

  return (
    <section className="bg-white rounded-2xl shadow-card overflow-hidden mb-2 border border-[#E76F51]/10">
      <div className="relative w-full h-40">
        <img
          src={trip.imageUrl}
          alt={trip.destination}
          className="object-cover w-full h-full"
          style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[#E76F51] font-semibold text-base">{trip.destination}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#AD4F36] font-medium">
          <CalendarDays className="w-4 h-4" />
          {trip.startDate} — {trip.endDate}
        </div>

        <ActiveTripAiBanner ai={ai || {}} loading={loading} />

        <div className="flex gap-4 mt-1 mb-1">
          <div>
            <div className="text-xs text-neutral-400">Orçamento</div>
            <div className="font-bold text-base text-[#C9583C]">{trip.budget}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-400">No destino</div>
            <div className="font-medium text-[#6D4530]">{trip.localBudget}</div>
          </div>
        </div>
        <Button
          size="sm"
          className="w-full mt-2 bg-[#E76F51] hover:bg-[#C9583C] text-white font-bold rounded-md"
        >
          Acessar detalhes da viagem
        </Button>
      </div>
    </section>
  );
}
