
import React from "react";
import { Button } from "@/components/ui/button";

export default function WizardStepDates({ dates, onChange, onNext, onPrev, iaTip, iaLoading }:{ dates:{start:string,end:string},onChange:(d:{start:string,end:string})=>void,onNext:()=>void,onPrev:()=>void,iaTip:any,iaLoading:boolean }) {
  return (
    <div>
      <label className="font-bold text-base mb-2 text-[#AD4F36]">Datas da viagem</label>
      <div className="flex gap-2 mb-2">
        <input
          type="date"
          className="flex-1 p-3 rounded-lg border border-[#dadada] bg-[#faf3ec]"
          value={dates.start}
          onChange={e=>onChange({ ...dates, start:e.target.value })}
        />
        <input
          type="date"
          className="flex-1 p-3 rounded-lg border border-[#dadada] bg-[#faf3ec]"
          value={dates.end}
          onChange={e=>onChange({ ...dates, end:e.target.value })}
        />
      </div>
      {iaLoading ? <div className="text-xs text-neutral-400 mb-2">Carregando IA...</div>
      : iaTip && <div className="text-xs bg-[#FEEDD4] text-[#C9583C] rounded-md p-2 mb-2">{iaTip}</div>}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrev}>Voltar</Button>
        <Button className="bg-terracotta flex-1 text-white" onClick={onNext} disabled={!dates.start || !dates.end}>Próximo</Button>
      </div>
    </div>
  );
}
