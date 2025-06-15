
import React from "react";
import { Button } from "@/components/ui/button";

export default function WizardStepDestination({ value, onChange, onNext, disabled, iaTip, iaLoading }:{ value:string,onChange:(v:string)=>void,onNext:()=>void,disabled:boolean,iaTip:any,iaLoading:boolean }) {
  return (
    <div>
      <label className="font-bold text-base mb-2 text-[#AD4F36]">Destino</label>
      <input
        className="w-full p-3 rounded-lg border border-[#dadada] bg-[#faf3ec] mb-2"
        placeholder="Ex: Lisboa, Portugal"
        value={value}
        onChange={e=>onChange(e.target.value)}
      />
      {iaLoading ? <div className="text-xs text-neutral-400 mb-2">Carregando IA...</div>
      : iaTip && <div className="text-xs bg-[#FEEDD4] text-[#C9583C] rounded-md p-2 mb-2">{iaTip}</div>}
      <Button className="bg-terracotta w-full text-white" onClick={onNext} disabled={disabled}>Próximo</Button>
    </div>
  );
}
