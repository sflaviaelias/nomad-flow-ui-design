
import React from "react";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";

const trips = [
  {
    id: 1,
    destination: "Tóquio, Japão",
    dates: "15/08 - 30/08",
    budget: "¥240,000",
    localBudget: "US$ 1,500",
    visa: true,
    vaccines: true,
    imageUrl:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80",
  },
  {
    id: 2,
    destination: "Lisboa, Portugal",
    dates: "12/09 - 27/09",
    budget: "€900",
    localBudget: "US$ 950",
    visa: false,
    vaccines: false,
    imageUrl:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&q=80",
  },
  {
    id: 3,
    destination: "Buenos Aires, Argentina",
    dates: "10/10 - 30/10",
    budget: "ARS 85,000",
    localBudget: "US$ 980",
    visa: false,
    vaccines: true,
    imageUrl:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=500&q=80",
  },
];

const UpcomingTripsPreview = () => (
  <section className="mt-8">
    <h3 className="font-semibold text-lg mb-3 text-neutral-800">Próximas viagens</h3>
    <div className="flex gap-5 overflow-x-auto pb-2">
      {trips.map((trip) => (
        <div
          key={trip.id}
          className="bg-card rounded-lg shadow-soft min-w-[250px] flex flex-col"
        >
          <img
            src={trip.imageUrl}
            alt={trip.destination}
            className="w-full h-[90px] object-cover rounded-t-lg"
          />
          <div className="px-4 py-3 flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2 text-sm font-medium text-terracotta">
              <MapPin size={16} /> {trip.destination}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <CalendarDays size={14} /> {trip.dates}
            </div>
            <div className="text-xs text-neutral-400 font-medium">
              Orçamento: {trip.budget}
            </div>
            <div className="text-xs text-neutral-400 font-medium">
              Local: {trip.localBudget}
            </div>
            <div className="flex gap-1 flex-wrap mt-1">
              {trip.visa && (
                <span className="bg-terracotta text-white text-xs px-2 py-0.5 rounded font-medium">
                  Visto
                </span>
              )}
              {trip.vaccines && (
                <span className="bg-accent-light text-accent text-xs px-2 py-0.5 rounded font-medium">
                  Vacinas
                </span>
              )}
            </div>
            <a
              href="#"
              className="rounded-md bg-terracotta text-white px-3 py-1.5 font-semibold text-xs hover:bg-terracotta-dark transition mt-2 flex items-center gap-1 w-fit"
            >
              Ver detalhes <ArrowRight size={14} />
            </a>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default UpcomingTripsPreview;
