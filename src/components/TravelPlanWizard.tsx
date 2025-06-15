import React, { useState } from "react";
import WizardStepDestination from "./WizardStepDestination";
import WizardStepDates from "./WizardStepDates";
import WizardStepBudget from "./WizardStepBudget";
import WizardStepIASuggestions from "./WizardStepIASuggestions";
import WizardStepConfirmation from "./WizardStepConfirmation";
import { useTravelIAWizard } from "@/hooks/useTravelIAWizard";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  "Destino",
  "Datas",
  "Orçamento",
  "Sugestões IA",
  "Confirmação"
];

type Suggestion = { id: number, text: string };

export default function TravelPlanWizard() {
  const [step, setStep] = useState(0);
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [budget, setBudget] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [saving, setSaving] = useState(false);

  const {
    iaText,
    iaLoading,
    fetchIATip,
    fetchIASuggestions,
  } = useTravelIAWizard();

  // Lida com submissão de etapa/dados
  const nextStep = async () => {
    if (step === 0 && destination) {
      await fetchIATip({ type: "destination", value: destination, context: {} });
    }
    if (step === 1 && dates.start && dates.end) {
      await fetchIATip({ type: "dates", value: dates, context: { destination } });
    }
    if (step === 2 && budget) {
      await fetchIATip({ type: "budget", value: budget, context: { destination, dates } });
    }
    if (step === 3) {
      // Sugestões reais da IA
      const iaList = await fetchIASuggestions({ destination, dates, budget });
      setSuggestions(iaList.map((t: string, idx: number) => ({ id: idx, text: t })));
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Remover/editar sugestão IA
  const removeSuggestion = (id: number) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
  };
  const editSuggestion = (id: number, text: string) => {
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, text } : s));
  };

  const handleSaveTrip = async () => {
    setSaving(true);

    // Busca usuário logado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast({ title: "Erro: não foi possível identificar o usuário.", variant: "destructive" });
      setSaving(false);
      return;
    }

    // Garante os tipos corretos
    const parsedBudget = budget ? parseFloat(budget) : null;

    // Insere viagem na tabela trips
    const { error } = await supabase.from("trips").insert({
      destination,
      start_date: dates.start,
      end_date: dates.end,
      budget: parsedBudget,
      user_id: user.id,
      checklist: suggestions.length ? suggestions.map(s => s.text) : null,
      is_smart_trip: true, // sempre smart trip pelo wizard IA
    });

    if (error) {
      toast({ title: "Erro ao criar viagem", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Viagem criada com sucesso!" });
      setStep(steps.length - 1); // vai para confirmação
    }
    setSaving(false);
  };

  // Progresso ex: "Etapa 2 de 5"
  const progress = `Etapa ${step + 1} de ${steps.length}`;

  return (
    <div className="w-full max-w-xl mx-auto bg-[#FAF3EC] rounded-2xl p-5 shadow-card flex flex-col gap-8 font-inter animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-[#AD4F36] font-medium">{progress}</span>
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-terracotta' : 'bg-[#DADADA]'}`} />
          ))}
        </div>
      </div>
      {step === 0 && (
        <WizardStepDestination
          value={destination}
          onChange={setDestination}
          onNext={nextStep}
          disabled={!destination}
          iaTip={step === 0 && iaText}
          iaLoading={iaLoading}
        />
      )}
      {step === 1 && (
        <WizardStepDates
          dates={dates}
          onChange={setDates}
          onNext={nextStep}
          onPrev={prevStep}
          iaTip={step === 1 && iaText}
          iaLoading={iaLoading}
        />
      )}
      {step === 2 && (
        <WizardStepBudget
          value={budget}
          onChange={setBudget}
          onNext={nextStep}
          onPrev={prevStep}
          iaTip={step === 2 && iaText}
          iaLoading={iaLoading}
        />
      )}
      {step === 3 && (
        <WizardStepIASuggestions
          suggestions={suggestions}
          onEdit={editSuggestion}
          onRemove={removeSuggestion}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}
      {step === 4 && (
        <WizardStepConfirmation
          destination={destination}
          dates={dates}
          budget={budget}
          suggestions={suggestions}
          onBack={prevStep}
          onSave={handleSaveTrip}
          saving={saving}
        />
      )}
    </div>
  );
}
