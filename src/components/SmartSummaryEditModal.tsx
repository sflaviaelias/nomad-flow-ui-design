
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { SmartSummary } from "@/hooks/useActiveTripSmartSummary";

interface Props {
  open: boolean;
  onClose: () => void;
  value: Pick<SmartSummary, "editableNote" | "suggestions">;
  onSave: (data: Pick<SmartSummary, "editableNote" | "suggestions">) => void;
}

export default function SmartSummaryEditModal({
  open,
  onClose,
  value,
  onSave,
}: Props) {
  const [note, setNote] = useState(value.editableNote);
  const [suggestions, setSuggestions] = useState(value.suggestions.join("\n"));

  function handleSave() {
    onSave({
      editableNote: note,
      suggestions: suggestions
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#FAF3EC] font-inter border-[#E76F51]/15">
        <div className="flex gap-2 items-center mb-2">
          <Sparkles className="text-[#E76F51]" />
          <span className="font-bold text-base text-[#AD4F36]">
            Editar resumo inteligente
          </span>
        </div>
        <div className="mb-4">
          <label className="text-xs block mb-1 text-[#C9583C] font-medium">
            Nota pessoal
          </label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm font-inter bg-white border-[#E76F51]/15 focus:border-[#E76F51] resize-none"
            rows={2}
            maxLength={120}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="text-xs block mb-1 text-[#C9583C] font-medium">
            Sugestões para próximas viagens
          </label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm font-inter bg-white border-[#E76F51]/15 focus:border-[#E76F51] resize-none"
            rows={3}
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            placeholder="Uma sugestão por linha"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="min-w-[44px]">
            Cancelar
          </Button>
          <Button
            className="bg-[#E76F51] hover:bg-[#C9583C] text-white font-bold min-w-[44px]"
            onClick={handleSave}
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
