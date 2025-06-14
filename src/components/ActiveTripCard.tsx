
import React from "react";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";

type Props = {
  destination: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  budget: string;
  localBudget: string;
};

const ActiveTripCard = ({
  destination,
  imageUrl,
  startDate,
  endDate,
  budget,
  localBudget,
}: Props) => {
  return (
    <section className="bg-terracotta-light rounded-lg shadow-card overflow-hidden flex flex-col md:flex-row">
      <div className="md:w-2/5 w-full h-56 md:h-auto flex-shrink-0 overflow-hidden">
        <img src={imageUrl} alt={destination} className="object-cover h-full w-full" />
      </div>
      <div className="flex-1 p-6 flex flex-col gap-4 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={20} className="text-terracotta" />
            <h2 className="text-2xl md:text-3xl font-bold text-terracotta">{destination}</h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-600 mb-2">
            <CalendarDays className="w-4 h-4 mr-1" />
            {startDate} &ndash; {endDate}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
          <div className="bg-card rounded-md px-4 py-2 mr-3 shadow-sm">
            <div className="text-xs text-neutral-500">Orçamento</div>
            <div className="font-bold text-base">{budget}</div>
          </div>
          <div className="bg-neutral-100 rounded-md px-4 py-2 shadow-sm">
            <div className="text-xs text-neutral-400">No destino</div>
            <div className="font-medium">{localBudget}</div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href="#" className="rounded-md bg-terracotta text-white px-4 py-2 font-semibold shadow-soft hover:bg-terracotta-dark transition hover:scale-105 flex items-center gap-2">
            Concierge <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#" className="rounded-md bg-neutral-200 text-terracotta px-4 py-2 font-semibold shadow-soft hover:bg-neutral-300 transition flex items-center gap-2">
            Adicionar Despesa
          </a>
          <a href="#" className="rounded-md bg-accent-light text-accent px-4 py-2 font-semibold shadow-soft hover:bg-accent transition flex items-center gap-2">
            Descoberta Local
          </a>
        </div>
      </div>
    </section>
  );
};

export default ActiveTripCard;
