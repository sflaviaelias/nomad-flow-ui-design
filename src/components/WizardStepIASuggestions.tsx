
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, CirclePlus } from "lucide-react";

export default function WizardStepIASuggestions({ suggestions, onEdit, onRemove, onNext, onPrev }:{
  suggestions: { id:number, text:string }[],
  onEdit: (id:number, text:string)=>void,
  onRemove: (id:number)=>void,
  onNext: ()=>void,
  onPrev: ()=>void
}) {
  const [editId, setEditId] = useState<number|null>(null);
  const [editText, setEditText] = useState("");

  return (
    <div>
      <label className="font-bold text-base mb-3 text-[#AD4F36]">Sugestões da IA</label>
      {suggestions.length === 0 && (
        <div className="text-sm text-neutral-400 mb-3">Nenhuma sugestão ainda.</div>
      )}
      <div className="flex flex-col gap-3 mb-4">
        {suggestions.map(sug => (
          <div
            key={sug.id}
            className="bg-white border border-[#dadada] rounded-lg p-3 shadow-sm flex items-center gap-3"
          >
            {editId === sug.id ? (
              <>
                <input
                  className="flex-1 p-1 border rounded"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                />
                <Button size="sm" onClick={() => { onEdit(sug.id, editText); setEditId(null); }} className="bg-terracotta text-white">Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Cancelar</Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-[#4d240e]">{sug.text}</span>
                <Button size="icon" variant="ghost" onClick={() => { setEditId(sug.id); setEditText(sug.text); }}><Edit size={16} /></Button>
                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => onRemove(sug.id)}><CirclePlus size={16} /></Button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrev}>Voltar</Button>
        <Button className="bg-terracotta flex-1 text-white" onClick={onNext}>Próximo</Button>
      </div>
    </div>
  );
}
