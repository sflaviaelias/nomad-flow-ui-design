
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomeAddTripButton() {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center py-2">
      <Button
        size="lg"
        className="bg-[#E76F51] hover:bg-[#C9583C] text-white font-bold rounded-lg flex items-center gap-2 px-6 py-3 shadow-card"
        style={{
          fontSize: 17,
          minWidth: 220,
          minHeight: 44,
        }}
        onClick={() => navigate("/trip/new")}
        aria-label="Adicionar nova viagem"
      >
        {/* Ícone plus Untitled UI style */}
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="mr-1.5">
          <rect x="9" y="4" width="2" height="12" rx="1" fill="white" />
          <rect x="4" y="9" width="12" height="2" rx="1" fill="white" />
          <rect x="1" y="1" width="18" height="18" rx="5" stroke="white" strokeWidth="2" fill="#E76F51" />
        </svg>
        Adicionar nova viagem
      </Button>
    </div>
  );
}

