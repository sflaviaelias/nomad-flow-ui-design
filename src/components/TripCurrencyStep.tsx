
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, DollarSign } from "lucide-react";

interface CurrencyOption {
  label: string;
  value: string;
}

interface TripCurrencyStepProps {
  currency: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
  options: CurrencyOption[];
  aiAdvice?: { dates?: string; budget?: string; forecast?: string } | null;
  loadingAI?: boolean;
  imageUrl?: string | null;
}

const TripCurrencyStep: React.FC<TripCurrencyStepProps> = ({
  currency,
  onChange,
  onNext,
  onPrev,
  options,
  aiAdvice,
  loadingAI,
  imageUrl,
}) => (
  <div>
    <label className="block mb-2 font-medium flex items-center gap-2">
      <DollarSign className="text-terracotta" /> Moeda preferida
    </label>
    <select
      className="w-full border rounded-md px-3 py-2"
      value={currency}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <div className="mt-4 flex gap-2">
      <Button variant="outline" onClick={onPrev}>Voltar</Button>
      <Button className="bg-terracotta" onClick={onNext}>Resumo <ArrowRight className="ml-1" /></Button>
    </div>
    <div className="mt-6 space-y-2">
      {loadingAI && (
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <Loader2 className="animate-spin" size={18} /> Buscando sugestões com IA...
        </div>
      )}
      {aiAdvice && (
        <div className="text-neutral-700 text-sm">
          {aiAdvice.dates && <div><b>Datas sugeridas:</b> {aiAdvice.dates}</div>}
          {aiAdvice.budget && <div><b>Estimativa de orçamento:</b> {aiAdvice.budget}</div>}
          {aiAdvice.forecast && <div><b>Clima previsto:</b> {aiAdvice.forecast}</div>}
        </div>
      )}
    </div>
    {imageUrl && (
      <div className="w-full mt-4 rounded-md overflow-hidden max-h-60">
        <img src={imageUrl} alt="Imagem do destino" className="w-full object-cover" />
      </div>
    )}
  </div>
);

export default TripCurrencyStep;

