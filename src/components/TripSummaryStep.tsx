
import React from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface TripSummaryStepProps {
  destination: string;
  dates: { start: string; end: string; };
  currency: string;
  aiAdvice?: { dates?: string; budget?: string; forecast?: string } | null;
  imageUrl?: string | null;
  onPrev: () => void;
  onSave: () => void;
+  saving?: boolean;
}

const TripSummaryStep: React.FC<TripSummaryStepProps> = ({
  destination,
  dates,
  currency,
  aiAdvice,
  imageUrl,
  onPrev,
  onSave,
+  saving
}) => (
  <div className="flex flex-col gap-3">
    <div className="font-medium text-lg flex items-center gap-2"><Users className="text-terracotta" /> Resumo da Viagem</div>
    <div className="text-sm text-neutral-600">
      <b>Destino:</b> {destination} <br />
      <b>Data:</b> {dates.start} até {dates.end} <br />
      <b>Moeda:</b> {currency}
    </div>
    {aiAdvice && (
      <div className="mt-2 text-neutral-700 text-sm">
        {aiAdvice.dates && <div><b>Datas IA:</b> {aiAdvice.dates}</div>}
        {aiAdvice.budget && <div><b>Orçamento IA:</b> {aiAdvice.budget}</div>}
        {aiAdvice.forecast && <div><b>Clima IA:</b> {aiAdvice.forecast}</div>}
      </div>
    )}
    {imageUrl && (
      <div className="w-full mt-3 rounded-md overflow-hidden max-h-60">
        <img src={imageUrl} alt={`Paisagem de ${destination}`} className="w-full object-cover" />
      </div>
    )}
    <div className="mt-4 flex gap-2">
      <Button variant="outline" onClick={onPrev}>Voltar</Button>
-      <Button className="bg-terracotta" onClick={onSave}>Salvar viagem & finalizar</Button>
+      <Button className="bg-terracotta" onClick={onSave} disabled={saving}>
+        {saving ? "Salvando..." : "Salvar viagem & finalizar"}
+      </Button>
    </div>
  </div>
);

export default TripSummaryStep;

