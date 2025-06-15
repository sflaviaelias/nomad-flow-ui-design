
import React from "react";
import { useUpcomingTrips } from "@/hooks/useUpcomingTrips";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";

export default function UpcomingTripsSlider() {
  const { data: trips, isLoading } = useUpcomingTrips();

  // Loading state: do not render anything while loading (no flicker)
  if (isLoading) return null;

  // No upcoming trips: friendly message, else horizontal slider
  if (!trips || trips.length === 0) {
    return (
      <section className="w-full px-4 mt-7">
        <h2 className="heading-sm font-semibold text-[#AD4F36] mb-3 text-base md:text-lg tracking-tight font-inter">
          Próximas viagens
        </h2>
        <div className="text-center text-neutral-400 text-sm py-6 rounded-xl bg-white border border-[#ecd9c5] shadow-sm">
          Nenhuma viagem futura ainda.
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-4 mt-7">
      <h2 className="heading-sm font-semibold text-[#AD4F36] mb-3 text-base md:text-lg tracking-tight font-inter">
        Próximas viagens
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar scroll-smooth">
        {trips.map((trip: any) => (
          <UpcomingTripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </section>
  );
}

function formatDateRange(start: string, end: string) {
  if (!start || !end) return "";
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" };
  const fmt = (dt: string) => new Date(dt).toLocaleDateString("pt-BR", opts);
  return `${fmt(start)} - ${fmt(end)}`;
}

function UpcomingTripCard({ trip }: { trip: any }) {
  // Visual helpers
  const budget =
    trip.budget != null && trip.currency
      ? `${trip.currency} ${Number(trip.budget).toLocaleString("pt-BR")}`
      : "Indefinido";

  return (
    <Card className="rounded-xl shadow-card bg-white border border-[#E76F51]/10 min-w-[240px] max-w-[280px] flex flex-col hover-scale transition-all duration-200">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center gap-2 text-terracotta text-sm font-medium font-inter">
          <MapPin size={16} /> {trip.destination}
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <CalendarDays size={14} />
          {formatDateRange(trip.start_date, trip.end_date)}
        </div>
        <div className="text-xs text-neutral-400 font-medium">
          Orçamento: {budget}
        </div>
        <Button
          variant="outline"
          className="mt-2 flex gap-2 w-full font-semibold text-[#E76F51] border-[#E76F51] hover:bg-[#E76F51] hover:text-white transition"
          size="sm"
          onClick={() => {
            window.location.href = `/trip/${trip.id}`;
          }}
        >
          Ver detalhes <ArrowRight size={14} />
        </Button>
      </CardContent>
    </Card>
  );
}
