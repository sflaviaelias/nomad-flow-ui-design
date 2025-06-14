
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { useDestinationImageAI } from "./useDestinationImageAI";
import DestinationCombobox from "./DestinationCombobox";

interface TripDestinationStepProps {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  disabled?: boolean;
}

const TripDestinationStep: React.FC<TripDestinationStepProps> = ({
  value,
  onChange,
  onNext,
  disabled,
}) => {
  const { imageUrl, imgLoading } = useDestinationImageAI(value);

  return (
    <div>
      <label className="block mb-2 font-medium flex items-center gap-2">
        Destino
      </label>
      <DestinationCombobox
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus
      />
      <div className="mt-3">
        {imgLoading && (
          <div className="text-xs text-neutral-500 flex items-center gap-2">
            <Loader2 className="animate-spin" size={16} /> Buscando imagem do destino...
          </div>
        )}
        {imageUrl && !imgLoading && (
          <div className="rounded-md overflow-hidden mt-2 max-h-40 border border-[#DADADA]">
            <img src={imageUrl} alt={`Paisagem de ${value}`} className="w-full object-cover" style={{ height: 160 }} />
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <Button className="bg-terracotta" disabled={!value || disabled} onClick={onNext}>
          Próxima <ArrowRight className="ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default TripDestinationStep;
