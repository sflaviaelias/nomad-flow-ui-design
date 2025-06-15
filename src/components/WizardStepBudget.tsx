
import React from "react";
import { Button } from "@/components/ui/button";

export default function WizardStepBudget({ value, onChange, onNext, onPrev, iaTip, iaLoading }:{ value:string,onChange:(v:string)=>void,onNext:()=>void,onPrev:()=>void,iaTip:any,iaLoading:boolean }) {
  return (
    <div>
      <label className="font-bold text-base mb-2 text-[#AD4F36]">Orçamento</label>
      <input
        type="number"
        className="w-full p-3 rounded-lg border border-[#dadada] bg-[#faf3ec] mb-2"
        placeholder="Valor em moeda local"
        value={value}
        onChange={e=>onChange(e.target.value)}
        min="1"
      />
      {iaLoading ? <div className="text-xs text-neutral-400 mb-2">Carregando IA...</div>
      : iaTip && <div className="text-xs bg-[#FEEDD4] text-[#C9583C] rounded-md p-2 mb-2">{iaTip}</div>}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrev}>Voltar</Button>
        <Button className="bg-terracotta flex-1 text-white" onClick={onNext} disabled={!value}>Próximo</Button>
      </div>
    </div>
  );
}
