
import React from "react";
import { useUpcomingTrips } from "@/hooks/useUpcomingTrips";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";

type Trip = {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number | string;
  currency: string;
  notes?: string;
  checklist?: any;
};

export default function UpcomingTripsSlider() {
  const { data: trips, isLoading } = useUpcomingTrips();

  if (isLoading) return null;
  if (!trips || trips.length === 0) return null;

  const showCarousel = trips.length > 1;

  const getCurrency = (currency: string) =>
    currency && typeof currency === "string" ? currency : "BRL";

  return (
    <section className="w-full px-4 mt-6">
      <h2 className="heading-sm font-semibold text-[#AD4F36] mb-3 text-base md:text-lg tracking-tight font-inter">
        Próximas viagens
      </h2>
      {showCarousel ? (
        <Carousel>
          <CarouselContent className="flex gap-3 py-2 pl-1">
            {trips.map((trip: any) => (
              <CarouselItem key={trip.id} className="w-[260px] shrink-0">
                <UpcomingTripCard trip={trip} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <div>
          <UpcomingTripCard trip={trips[0]} />
        </div>
      )}
    </section>
  );
}

function UpcomingTripCard({ trip }: { trip: any }) {
  // Simulate localBudget for now (could use conversion logic)
  const budget = trip.budget ? `${trip.currency || "BRL"} ${trip.budget}` : "Indefinido";
  const localBudget = trip.localBudget || "-";
  const hasVisa = trip.notes?.toLowerCase().includes("visto") || false;
  const hasVaccine = trip.notes?.toLowerCase().includes("vacina") || false;

  return (
    <Card className="rounded-xl shadow-card bg-white border border-[#E76F51]/10 min-w-[240px] max-w-[280px] flex flex-col">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center gap-2 text-terracotta text-sm font-medium font-inter">
          <MapPin size={16} /> {trip.destination}
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <CalendarDays size={14} />{" "}
          {trip.start_date} — {trip.end_date}
        </div>
        <div className="flex gap-2">
          <div className="text-xs text-neutral-400 font-medium">
            Orçamento: {budget}
          </div>
          {/* You could add: <div className="text-xs text-neutral-400 font-medium">{localBudget}</div> */}
        </div>
        <div className="flex gap-2 flex-wrap">
          {hasVisa && (
            <span className="bg-terracotta text-white text-2xs px-2 py-0.5 rounded font-medium">
              Visto
            </span>
          )}
          {hasVaccine && (
            <span className="bg-accent-light text-accent text-2xs px-2 py-0.5 rounded font-medium">
              Vacinas
            </span>
          )}
        </div>
        <Button
          variant="outline"
          className="mt-2 flex gap-2 w-full font-semibold"
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
