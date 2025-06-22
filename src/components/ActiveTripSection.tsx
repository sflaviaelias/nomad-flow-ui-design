
import React from "react";
import { PlaneIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ActiveTrip {
  destination: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  budget: string;
  localBudget?: string;
}

interface Props {
  hasActiveTrip: boolean;
  activeTrip?: ActiveTrip | null;
  onShowDetails?: () => void;
}

export function ActiveTripSection({ hasActiveTrip, activeTrip, onShowDetails }: Props) {
  const navigate = useNavigate();

  if (hasActiveTrip && activeTrip) {
    return (
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold text-[#6D4530] mb-4 font-inter">
          Viagem ativa
        </h2>
        <Card className="overflow-hidden border border-[#E76F51]/20 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="relative">
              {activeTrip.imageUrl && (
                <div 
                  className="h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url(${activeTrip.imageUrl})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-[#6D4530] font-inter">
                    {activeTrip.destination}
                  </h3>
                  <PlaneIcon size={20} className="text-[#E76F51]" />
                </div>
                <div className="space-y-2 text-sm text-[#6D4530]/80">
                  <p>Orçamento: <span className="font-semibold text-[#E76F51]">{activeTrip.budget}</span></p>
                  {activeTrip.localBudget && (
                    <p className="text-xs text-[#6D4530]/60">≈ {activeTrip.localBudget}</p>
                  )}
                </div>
                <Button 
                  onClick={onShowDetails || (() => navigate("/active-trip"))}
                  className="w-full mt-4 bg-[#E76F51] hover:bg-[#C9583C] text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Ver detalhes da viagem
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-5 mb-6">
      <h2 className="text-lg font-semibold text-[#6D4530] mb-4 font-inter">
        Programar nova viagem
      </h2>
      <Card className="border border-[#E76F51]/20 shadow-sm bg-white/90 backdrop-blur-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6 text-center">
          <PlaneIcon size={32} className="text-[#E76F51] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#6D4530] mb-2 font-inter">
            Nenhuma viagem ativa
          </h3>
          <p className="text-[#6D4530]/70 text-sm mb-4">
            Que tal planejar sua próxima aventura?
          </p>
          <Button 
            onClick={() => navigate("/new-trip")}
            className="bg-[#E76F51] hover:bg-[#C9583C] text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Criar nova viagem
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
