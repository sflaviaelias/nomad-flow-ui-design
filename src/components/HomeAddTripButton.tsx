
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function HomeAddTripButton() {
  const navigate = useNavigate();
  return (
    <div className="flex justify-start items-center px-5 py-1 mt-1 mb-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-[#E76F51] border border-[#E76F51] bg-transparent hover:bg-[#E76F5110] hover:border-[#C9583C] hover:text-[#C9583C] font-semibold rounded-md px-3 py-2 whitespace-nowrap transition-all shadow-none text-[15px]"
        style={{
          minWidth: 0,
          minHeight: 36,
        }}
        onClick={() => navigate("/trip/new")}
        aria-label="Adicionar nova viagem"
      >
        <Plus size={16} strokeWidth={2.2} className="mr-2" />
        Adicionar nova viagem
      </Button>
    </div>
  );
}
