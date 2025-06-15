
import React from "react";
import { Button } from "@/components/ui/button";

export default function WizardStepConfirmation({ destination, dates, budget, suggestions, onBack, onSave, saving }:{
  destination:string,
  dates:{start:string,end:string},
  budget:string,
  suggestions:{id:number,text:string}[],
  onBack:()=>void,
  onSave:()=>void,
  saving:boolean
}) {
  return (
    <div>
      <div className="bg-white rounded-xl border border-[#dadada] p-4 shadow-md mb-4">
        <div className="text-xl font-bold text-[#E76F51]">{destination}</div>
        <div className="text-xs text-neutral-500 mb-2">{dates.start && dates.end ? `${dates.start} — ${dates.end}` : "Sem datas definidas"}</div>
        <div className="text-sm text-neutral-700 mb-2">Orçamento: <span className="font-semibold">{budget ? `R$ ${budget}` : "—"}</span></div>
        <div className="text-xs text-neutral-700">
          <b>Sugestões finais:</b>
          <ul className="pl-5 list-disc">
            {suggestions.map(sug => <li key={sug.id}>{sug.text}</li>)}
          </ul>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>Voltar</Button>
        <Button className="bg-terracotta flex-1 text-white" onClick={onSave} disabled={saving}>Criar viagem</Button>
      </div>
      {saving && <div className="text-center py-2 text-[#E76F51]">Salvando...</div>}
      {/* Extra: botão para nova viagem pode estar em outro componente/página após sucesso */}
    </div>
  );
}
