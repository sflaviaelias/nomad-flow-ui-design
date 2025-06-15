
import React from "react";
import { NotebookText } from "lucide-react";

interface SummaryNotesProps {
  note: string;
}

export const SummaryNotes: React.FC<SummaryNotesProps> = ({ note }) => (
  <section className="mb-6">
    <h3 className="font-inter font-semibold text-base text-[#AD4F36] flex items-center gap-2 mb-3">
      <NotebookText className="text-[#E76F51]" />
      Aprendizados & Notas pessoais
    </h3>
    <div className="rounded-lg bg-[#FAF3EC] border border-[#E76F51]/10 px-4 py-3 text-[#6D4530] text-sm font-inter shadow-soft">
      {note}
    </div>
  </section>
);
