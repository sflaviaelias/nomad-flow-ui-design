
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

// Função para formatar orçamento com tratamento de valores nulos
function formatBudget(budget: number | null, currency: string = "EUR"): string {
  if (budget === null || budget === undefined) {
    return "Orçamento não definido";
  }
  
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  } catch (error) {
    console.error("[ActiveTripSection] Error formatting budget:", error);
    return `${currency} ${budget}`;
  }
}

// Função para converter para moeda local
function formatLocalBudget(budget: number | null, rate: number = 5.4): string {
  if (budget === null || budget === undefined) {
    return "—";
  }
  
  try {
    const localAmount = budget * rate;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(localAmount);
  } catch (error) {
    console.error("[ActiveTripSection] Error formatting local budget:", error);
    return "—";
  }
}

export function ActiveTripSection({ hasActiveTrip, activeTrip, onShowDetails }: Props) {
  const navigate = useNavigate();

  console.log("[ActiveTripSection] Render - hasActiveTrip:", hasActiveTrip, "activeTrip:", activeTrip);

  if (hasActiveTrip && activeTrip) {
    const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&q=80";
    
    return (
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold text-[#6D4530] mb-4 font-inter">
          Viagem ativa
        </h2>
        <Card className="overflow-hidden border border-[#E76F51]/20 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="relative">
              <div 
                className="h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${activeTrip.imageUrl || fallbackImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-[#6D4530] font-inter">
                    {activeTrip.destination}
                  </h3>
                  <PlaneIcon size={20} className="text-[#E76F51]" />
                </div>
                <div className="space-y-2 text-sm text-[#6D4530]/80">
                  <p>
                    <span className="font-semibold text-[#E76F51]">{activeTrip.budget}</span>
                  </p>
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
