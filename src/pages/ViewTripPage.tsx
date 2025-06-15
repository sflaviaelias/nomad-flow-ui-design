
import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, CalendarDays, Plus, Check, Sun, ArrowLeft, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tripData = {
  destination: "Lisboa, Portugal",
  imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80",
  startDate: "2025-09-12",
  endDate: "2025-09-27",
  status: "Futura", // ou "Ativa", "Concluída"
  travelers: 2,
  budget: { // mock valores
    currency: "BRL",
    total: 5000,
    totalLocal: 950,
    localSymbol: "€",
    breakdown: [
      { label: "Hospedagem", value: 400 },
      { label: "Transporte", value: 120 },
      { label: "Alimentação", value: 200 }
    ],
  },
  expenses: [], // vazio exibe mensagem neutra
  checklist: [
    "Passagens compradas",
    "Seguro viagem",
    "Adaptador europeu"
  ],
  itinerary: [
    "Dia 1: Chegada",
    "Dia 2: Passeio de tuk tuk",
    "Dia 3: Free day"
  ],
  weather: "Média de 23ºC com sol e pancadas de chuva",
}

const statusColor = {
  "Futura": "bg-[#E76F51]/15 text-[#E76F51]",
  "Ativa": "bg-[#E76F51]/30 text-[#AD4F36]",
  "Concluída": "bg-[#AD4F36]/20 text-[#AD4F36]",
}

const formatDate = (date: string) => {
  // yyyy-mm-dd para dd/mm/yyyy
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
};

export default function ViewTripPage() {
  const navigate = useNavigate();

  // Estado visual do checklist
  const [checked, setChecked] = useState<boolean[]>(Array(tripData.checklist.length).fill(false));

  const handleChecklistClick = (idx: number) => {
    setChecked(prev => prev.map((v, i) => i === idx ? !v : v));
  };

  return (
    <div className="min-h-screen bg-[#FAF3EC] flex flex-col text-[#333] font-inter">
      {/* Header fixo */}
      <PageHeader
        title="Detalhes da Viagem"
        showBack
        rightAction={
          <Button
            variant="ghost"
            className="rounded-full p-2"
            onClick={() => { navigate("/trip/edit"); }}
            aria-label="Editar viagem"
          >
            <Edit className="w-5 h-5 text-[#E76F51]" />
          </Button>
        }
      />
      <main className="w-full max-w-md mx-auto px-3 pb-8 flex flex-col gap-8">
        {/* 1. Info principal */}
        <Card className="mt-5 shadow-card rounded-md p-0 overflow-hidden border-[#E76F51]/10">
          <img src={tripData.imageUrl} alt={`Foto de ${tripData.destination}`} className="w-full h-40 object-cover rounded-t-md" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-[#E76F51]" />
              <span className="font-bold text-base md:text-lg text-[#E76F51] capitalize">{tripData.destination}</span>
              <span className={"ml-auto px-2 py-0.5 rounded font-semibold text-xs " + statusColor[tripData.status]}>
                {tripData.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#AD4F36] text-xs font-medium mb-2">
              <CalendarDays className="w-4 h-4" />
              {formatDate(tripData.startDate)} a {formatDate(tripData.endDate)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-5 h-5 text-[#C9583C]" />
              <span className="bg-[#FAF3EC] text-[#C9583C] px-3 py-1 rounded-full text-xs font-semibold">
                {tripData.travelers} Viajantes
              </span>
            </div>
          </div>
        </Card>

        {/* 3. Orçamento */}
        <Card className="shadow-card rounded-md p-5 border-[#E76F51]/10 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-2">
            <div className="heading-sm font-semibold text-[#AD4F36]">Orçamento</div>
            <Badge className="bg-[#E76F51]/15 text-[#E76F51] text-xs font-medium rounded-full px-3 py-1">
              {tripData.budget.currency}
            </Badge>
          </div>
          <div className="text-base font-bold text-[#AD4F36]">
            Orçamento Total:
            <span className="ml-2 text-[#E76F51] font-extrabold">
              {tripData.budget.total.toLocaleString("pt-BR", { style: "currency", currency: tripData.budget.currency })}
            </span>
          </div>
          <div className="text-sm text-[#AD4F36] mb-2">
            Na moeda local:
            <span className="font-semibold text-[#C9583C] ml-2">
              {tripData.budget.localSymbol}{" "}{tripData.budget.totalLocal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <div className="text-xs text-[#AD4F36] font-medium mb-1">Divisão de custos:</div>
            <ul className="list-disc pl-6 mt-1 space-y-2">
              {tripData.budget.breakdown.map(item => (
                <li key={item.label} className="text-[#E76F51] text-base font-bold">
                  {item.label}:
                  <span className="text-[#C9583C] font-semibold ml-2">
                    {tripData.budget.localSymbol}{item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Button
            className="bg-[#E76F51] hover:bg-[#C9583C] text-white font-bold rounded-md mt-5"
            onClick={()=>navigate("/trip/add-expense")}
          >
            <Plus className="mr-2 w-4 h-4" /> Adicionar despesa
          </Button>
        </Card>

        {/* 4. Checklist */}
        <Card className="shadow-card rounded-md p-5 border-[#E76F51]/10">
          <div className="heading-sm font-semibold text-[#C9583C] mb-2">Checklist</div>
          <ul className="space-y-3">
            {tripData.checklist.map((item, idx) => (
              <li
                className={`flex items-center gap-3 text-base select-none cursor-pointer rounded px-2 py-1 transition-colors duration-150 ${checked[idx] ? "bg-[#E76F51]/10 text-[#E76F51] line-through" : "text-[#333]"}`}
                key={item}
                onClick={() => handleChecklistClick(idx)}
                aria-checked={checked[idx]}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === " " || e.key === "Enter") handleChecklistClick(idx);
                }}
                style={{ minHeight: 36 }}
              >
                <span className={`inline-block w-5 h-5 rounded border bg-[#faf3ec] border-[#DADADA] flex items-center justify-center transition-all ${checked[idx] ? "bg-[#E76F51] border-[#E76F51]" : ""}`}>
                  {checked[idx] && <Check size={18} strokeWidth={2.5} className="text-white" />}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* 5. Itinerário */}
        <Card className="shadow-card rounded-md p-5 border-[#E76F51]/10">
          <div className="heading-sm font-semibold text-[#C9583C] mb-2">Itinerário</div>
          <ul className="list-disc pl-4 space-y-2">
            {tripData.itinerary.map(item => (
              <li key={item} className="text-[#6D4530] font-inter text-base">{item}</li>
            ))}
          </ul>
        </Card>

        {/* 6. Clima */}
        <Card className="shadow-card rounded-md p-5 border-[#E76F51]/10 flex items-start gap-3">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
            <Sun className="text-[#E76F51] w-7 h-7" />
          </div>
          <div>
            <div className="heading-sm font-semibold text-[#C9583C] mb-1">Clima em Lisboa</div>
            <span className="text-sm text-[#AD4F36]">{tripData.weather}</span>
          </div>
        </Card>

        {/* Mensagem neutra se nenhuma despesa */}
        {(!tripData.expenses || tripData.expenses.length === 0) && (
          <div className="text-center bg-[#dadada10] border border-[#dadada55] rounded-lg px-4 py-3 text-[#AD4F36] text-sm mt-2 shadow-soft">
            Você ainda não adicionou despesas para esta viagem.
          </div>
        )}

        {/* Alerta mock IA - lembrar visto */}
        <div className="bg-[#E76F51]/10 text-[#C9583C] text-xs px-3 py-2 rounded-md mt-1 font-inter shadow-card">
          Lembre-se de verificar se o destino exige visto.
        </div>
      </main>
    </div>
  );
}
