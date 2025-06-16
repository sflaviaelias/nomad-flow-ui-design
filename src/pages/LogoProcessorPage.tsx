
import React from "react";
import LogoBackgroundRemover from "@/components/LogoBackgroundRemover";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LogoProcessorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center p-4 border-b border-[#E76F51]/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-3 p-2"
          >
            <ArrowLeft className="w-5 h-5 text-[#E76F51]" />
          </Button>
          <h1 className="text-lg font-semibold text-[#E76F51]">
            Processador de Logo
          </h1>
        </div>
        
        <div className="p-4">
          <LogoBackgroundRemover />
        </div>
      </div>
    </div>
  );
}
