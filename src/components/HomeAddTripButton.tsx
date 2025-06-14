
import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
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
        <PlusCircle size={22} className="mr-1.5" />
        Adicionar nova viagem
      </Button>
    </div>
  );
}
