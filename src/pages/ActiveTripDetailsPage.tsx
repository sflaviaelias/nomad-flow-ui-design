
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";

const tripData = {
  destination: "Paris, França",
  startDate: "15 de Julho",
  endDate: "22 de Julho de 2025",
  imageUrl:
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80",
  travelers: 2,
  itinerary: [
    "Dia 1: Chegada e Torre Eiffel",
    "Dia 2: Museu do Louvre e Passeio de Barco no Sena",
    "Dia 3: Palácio de Versalhes",
  ],
  checklist: [
    "Passaporte e Visto",
    "Passagens aéreas",
    "Reservas de hotel",
    "Câmera fotográfica",
    "Adaptador de tomada",
  ],
  weather: "Média de 24°C, ensolarado com pancadas de chuva à tarde.",
  budget: {
    totalBRL: 7500,
    totalEUR: 1350,
    breakdown: [
      { label: "Hospedagem", value: 600 },
      { label: "Transporte", value: 150 },
      { label: "Alimentação", value: 300 },
    ],
  },
};

export default function ActiveTripDetailsPage() {
  const navigate = useNavigate();
  // Estado visual do checklist
  const [checkedChecklist, setCheckedChecklist] = useState<boolean[]>(Array(tripData.checklist.length).fill(false));

  const handleChecklistClick = (idx: number) => {
    setCheckedChecklist((prev) =>
      prev.map((item, i) => (i === idx ? !item : item))
    );
  };

  // Estilos in-line para alguns ajustes visuais customizados
  const editButtonStyle = {
    background: "#E76F51",
    color: "#fff",
    fontWeight: 700,
    fontSize: "1rem",
    borderRadius: "12px",
    boxShadow: "0 3px 16px 0 rgba(231,111,81,0.08)",
    width: "100%",
    padding: "15px 0",
    marginTop: 30,
    marginBottom: 8,
    border: "none",
    outline: "none",
    cursor: "pointer",
    letterSpacing: ".01em",
    transition: "background .16s",
    maxWidth: 480,
    alignSelf: "center" as const,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-[#FAF3EC] text-[#6D4530] flex flex-col items-center px-2 pb-10">
      {/* Novo cabeçalho padronizado */}
      <PageHeader
        title="Detalhes da Viagem Ativa"
        showBack
      />

      {/* Cartões de Detalhes */}
      <div className="w-full max-w-lg flex flex-col gap-5 mt-4">

        {/* Visão Geral */}
        <div className="bg-white rounded-2xl shadow-card border border-[#E76F51]/10 px-0 md:px-0 pt-0 pb-5 overflow-hidden">
          <img
            src={tripData.imageUrl}
            alt="Imagem da viagem"
            className="w-full h-40 md:h-56 object-cover rounded-t-2xl"
            style={{ minHeight: "160px", maxHeight: "250px" }}
          />
          <div className="px-5 pt-4">
            <div className="text-lg md:text-xl font-bold text-[#E76F51] font-inter">{`Viagem a ${tripData.destination}`}</div>
            <div className="text-sm font-medium text-[#AD4F36] mb-1 font-inter">{`${tripData.startDate} a ${tripData.endDate}`}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#FAF3EC] text-[#C9583C] px-3 py-1 rounded-full text-xs font-semibold">
                {`${tripData.travelers} Viajantes`}
              </span>
            </div>
          </div>
        </div>

        {/* Itinerário */}
        <div className="bg-white rounded-xl shadow-card border border-[#E76F51]/10 p-5">
          <div className="text-base font-bold text-[#C9583C] mb-2 font-inter">Itinerário</div>
          <ul className="pl-0 text-sm font-inter space-y-1">
            {tripData.itinerary.map((item, idx) => (
              <li key={idx} className="list-disc list-inside text-[#6D4530]">{item}</li>
            ))}
          </ul>
        </div>

        {/* Checklist Interativo */}
        <div className="bg-white rounded-xl shadow-card border border-[#E76F51]/10 p-5">
          <div className="text-base font-bold text-[#C9583C] mb-2 font-inter">Checklist</div>
          <ul className="space-y-2">
            {tripData.checklist.map((item, idx) => (
              <li
                key={item}
                className="flex items-center gap-3 font-inter text-base cursor-pointer select-none"
                onClick={() => handleChecklistClick(idx)}
                aria-checked={checkedChecklist[idx]}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === " " || e.key === "Enter") handleChecklistClick(idx);
                }}
                style={{
                  color: checkedChecklist[idx] ? "#E76F51" : "#6D4530",
                  transition: "color .14s"
                }}
              >
                <span
                  className={`inline-block w-5 h-5 rounded border bg-[#faf3ec50] border-[#DADADA] flex items-center justify-center mr-1 transition-all`}
                  style={{
                    background: checkedChecklist[idx] ? "#E76F51" : "#faf3ec50",
                    borderColor: checkedChecklist[idx] ? "#E76F51" : "#DADADA"
                  }}
                  aria-label={checkedChecklist[idx] ? "Marcado" : "Desmarcado"}
                >
                  {checkedChecklist[idx] && (
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <polyline
                        points="4 10 8 14 14 6"
                        style={{ fill: "none", stroke: "#fff", strokeWidth: 2, strokeLinecap: "round" }}
                      />
                    </svg>
                  )}
                </span>
                <span style={{ textDecoration: checkedChecklist[idx] ? "line-through" : "none" }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clima */}
        <div className="bg-white rounded-xl shadow-card border border-[#E76F51]/10 p-5 flex items-start gap-3">
          <span className="flex-shrink-0 text-2xl" title="Sol e nuvem">
            {/* Emoji mantém bom contraste e acessibilidade mobile */}
            <span role="img" aria-label="Sol e nuvem">☀️⛅</span>
          </span>
          <div className="flex flex-col">
            <div className="font-bold text-[#C9583C] mb-1 font-inter">Clima em Paris</div>
            <span className="text-sm font-inter">{tripData.weather}</span>
          </div>
        </div>

        {/* Orçamento */}
        <div className="bg-white rounded-xl shadow-card border border-[#E76F51]/10 p-5">
          <div className="font-bold text-[#C9583C] mb-2 font-inter">Orçamento</div>
          <div className="flex flex-col gap-1 mb-2">
            <span className="text-base font-bold text-[#AD4F36] font-inter">
              Orçamento Total:{" "}
              <span className="text-[#E76F51] font-extrabold">
                R$ {tripData.budget.totalBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </span>
            <span className="text-sm text-[#AD4F36]">
              Na moeda local:{" "}
              <span className="font-semibold text-[#C9583C]">
                € {tripData.budget.totalEUR.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </span>
          </div>
          <div>
            <span className="text-xs text-[#AD4F36] font-medium">Divisão de custos:</span>
            <ul className="list-disc pl-6 mt-2 text-base space-y-2 font-inter">
              {tripData.budget.breakdown.map(({ label, value }) => (
                <li key={label} className="text-[#E76F51] font-bold">
                  {label}: <span className="text-[#C9583C] font-semibold">€ {value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Botão Editar */}
      <button
        type="button"
        style={editButtonStyle}
        onClick={() => {
          alert("Funcionalidade de edição seria implementada aqui!");
          console.log("Navegar para a tela de edição da viagem");
        }}
      >
        Editar
      </button>
    </div>
  );
}
