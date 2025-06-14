
import React from "react";
import { CalendarDays, MapPin, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        {(trip.visa || trip.vaccines) && (
          <div className="flex gap-2 flex-wrap mb-1">
            {trip.visa && (
              <span className="bg-[#E76F51] text-white text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <BadgeCheck size={14} /> Visto necessário
              </span>
            )}
            {trip.vaccines && (
              <span className="bg-[#AD4F36] text-white text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <BadgeCheck size={14} /> Vacinas obrigatórias
              </span>
            )}
          </div>
        )}
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
