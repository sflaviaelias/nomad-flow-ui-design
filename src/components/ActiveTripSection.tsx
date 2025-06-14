
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TripData {
  destination: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  budget: string;
  localBudget: string;
}
interface ActiveTripSectionProps {
  hasActiveTrip: boolean;
  activeTrip: TripData;
}

export const ActiveTripSection: React.FC<ActiveTripSectionProps> = ({
  hasActiveTrip,
  activeTrip,
}) => {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="heading-sm font-semibold text-[#AD4F36] px-5 mb-3 text-base md:text-lg tracking-tight font-inter">
        Viagem ativa
      </h2>
      <div className="px-4">
        {hasActiveTrip ? (
          <div className="rounded-2xl bg-white overflow-hidden shadow-card mb-6 w-full">
            <img
              src={activeTrip.imageUrl}
              alt={activeTrip.destination}
              className="object-cover w-full h-40 md:h-48"
              style={{ borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
            />
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#E76F51] font-inter font-semibold text-lg">
                  {activeTrip.destination}
                </span>
              </div>
              <div className="text-xs text-[#AD4F36] mb-1 font-medium">
                {activeTrip.startDate} — {activeTrip.endDate}
              </div>
              <div className="flex gap-4 mb-1">
                <div>
                  <div className="text-xs text-neutral-500">Orçamento</div>
                  <div className="font-bold text-base text-[#C9583C]">
                    {activeTrip.budget}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">No destino</div>
                  <div className="font-medium text-[#6D4530]">
                    {activeTrip.localBudget}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  className="flex-1"
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/trip/add-expense")}
                >
                  Adicionar despesa
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/discovery/markets")}
                >
                  Descoberta local
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow-card p-7 text-center mb-6 flex flex-col items-center">
            <span className="text-lg font-semibold text-[#E76F51] mb-1">
              Nenhuma viagem ativa encontrada.
            </span>
            <span className="text-sm text-[#AD4F36] mb-4">
              Programe uma nova viagem para começar!
            </span>
            <Button
              onClick={() => navigate("/trip/new")}
              className="w-full max-w-xs mx-auto"
            >
              Adicionar nova viagem
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
