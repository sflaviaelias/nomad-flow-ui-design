
import React from "react";
import { Button } from "@/components/ui/button";
import DestinationCombobox from "./DestinationCombobox";

export default function WizardStepDestination({
  value,
  onChange,
  onNext,
  disabled,
  iaTip,
  iaLoading,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  disabled: boolean;
  iaTip: any;
  iaLoading: boolean;
}) {
  return (
    <div>
      <label className="font-bold text-base mb-2 text-[#AD4F36]">Destino</label>
      <DestinationCombobox
        value={value}
        onChange={onChange}
        autoFocus
      />
      {iaLoading ? (
        <div className="text-xs text-neutral-400 mb-2">Carregando IA...</div>
      ) : iaTip && (
        <div className="text-xs bg-[#FEEDD4] text-[#C9583C] rounded-md p-2 mb-2">{iaTip}</div>
      )}
      <Button
        className="bg-terracotta w-full text-white mt-2"
        onClick={onNext}
        disabled={!value || disabled}
      >
        Próximo
      </Button>
    </div>
  );
}
