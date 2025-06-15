
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import countriesList from "@/components/countriesList";

interface TripDetailsModalProps {
  open: boolean;
  onClose: () => void;
  destination: string; // e.g., "Lisboa, Portugal"
  startDate: string;   // ISO date string
  endDate: string;     // ISO date string
  imageUrl?: string;
  currency: string;    // e.g., "BRL"
  destCurrency: string; // e.g., "EUR"
  budget: number;
  convertedBudget?: number; // conversion result
  visaRequired?: boolean;
  vaccineRequired?: boolean; // optional
}

export default function TripDetailsModal({
  open,
  onClose,
  destination,
  startDate,
  endDate,
  imageUrl,
  currency,
  destCurrency,
  budget,
  convertedBudget,
  visaRequired,
  vaccineRequired,
}: TripDetailsModalProps) {
  // Calculate duration
  let duration = "";
  if (startDate && endDate) {
    const diff = differenceInDays(parseISO(endDate), parseISO(startDate));
    duration = diff >= 0 ? `${diff + 1} dias` : "";
  }

  // Parse country for flag
  const countryName = destination.includes(",")
    ? destination.split(",")[1].trim()
    : destination.trim();
  const countryData = countriesList.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[99vw] !rounded-2xl !p-0 animate-fade-in overflow-hidden" style={{ fontFamily: "Inter" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-[#FAF3EC]">
          <h2 className="font-semibold text-lg text-terracotta">Detalhes da Viagem</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-2 hover:bg-[#E76F5115] transition">
            <X size={22} className="text-terracotta" />
          </button>
        </div>

        {/* Hero image */}
        {imageUrl ? (
          <div className="w-full h-36 md:h-48 bg-neutral-200 overflow-hidden flex items-center justify-center">
            <img
              src={imageUrl}
              alt={`Foto de ${destination}`}
              className="object-cover w-full h-full"
              style={{ borderRadius: 0, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
            />
          </div>
        ) : (
          <div className="w-full h-36 bg-[#DADADA] flex items-center justify-center text-neutral-400">
            Sem imagem do destino
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col gap-4 px-4 py-2">

          {/* Trip Overview */}
          <div className="flex flex-col items-center gap-2 my-2">
            <div className="flex items-center gap-2">
              {/* Flag (optional) */}
              {countryData?.flag && (
                <span className="text-2xl">{countryData.flag}</span>
              )}
              <span className="font-bold text-lg text-[#E76F51] capitalize text-center">{destination}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>
                {format(parseISO(startDate), "d 'de' MMM", { locale: ptBR })}
                {" → "}
                {format(parseISO(endDate), "d 'de' MMM yyyy", { locale: ptBR })}
              </span>
              {duration && <span className="bg-[#DFC8BC] text-accent px-2 py-0.5 rounded text-xs">{duration}</span>}
            </div>
          </div>

          {/* Budget and details */}
          <Card className="bg-[#FFF] shadow-sm rounded-lg p-4 flex flex-col gap-2">
            <div className="font-medium text-[15px] mb-1 text-neutral-700">
              Orçamento total
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-terracotta font-bold text-xl">
                {budget?.toLocaleString("pt-BR", { style: "currency", currency })}
              </span>
              <span className="text-neutral-400">({currency})</span>
              {convertedBudget && !isNaN(Number(convertedBudget)) && (
                <span className="ml-2 text-neutral-700 text-base">
                  ≈ {Number(convertedBudget).toLocaleString("pt-BR", { style: "currency", currency: destCurrency })} {" "}
                  <span className="text-xs text-neutral-400">({destCurrency})</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {visaRequired === true && (
                <Badge className="bg-terracotta text-white rounded-full">Visto necessário</Badge>
              )}
              {visaRequired === false && (
                <Badge className="bg-green-200 text-green-700 rounded-full">Sem visto</Badge>
              )}
              {vaccineRequired && (
                <Badge className="bg-yellow-200 text-yellow-900 rounded-full">Vacina obrigatória</Badge>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full mt-2">
            <Button variant="secondary" className="rounded-lg w-full py-3" onClick={() => alert("Em breve: gastos da viagem!")}>
              Ver gastos da viagem
            </Button>
            <Button variant="outline" className="rounded-lg w-full py-3" onClick={() => alert("Em breve: edição da viagem!")}>
              Editar viagem <ArrowRight className="ml-2" />
            </Button>
            <Button variant="ghost" className="rounded-lg w-full py-3 border border-[#dadada]" onClick={() => alert("Em breve: compartilhar viagem!")}>
              Compartilhar planejamento
            </Button>
            <Button variant="ghost" className="rounded-lg w-full py-3 text-destructive hover:bg-destructive/10" onClick={() => alert("Em breve: excluir viagem!")}>
              Excluir viagem
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full pb-2 pt-2 flex justify-center border-t bg-[#FAF3EC]">
          <Button className="w-[90vw] max-w-xs bg-terracotta text-white text-lg rounded-lg py-3 shadow-card" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
