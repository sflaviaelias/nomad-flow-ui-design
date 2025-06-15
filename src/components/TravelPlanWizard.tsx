import React, { useState, useEffect, useRef } from "react";
import WizardStepDestination from "./WizardStepDestination";
import WizardStepDates from "./WizardStepDates";
import WizardStepBudget from "./WizardStepBudget";
import WizardStepIASuggestions from "./WizardStepIASuggestions";
import WizardStepConfirmation from "./WizardStepConfirmation";
import { useTravelIAWizard } from "@/hooks/useTravelIAWizard";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGuestMode } from "@/hooks/useGuestMode";
import { showGuestBlockedToast } from "./GuestLoginToast";
import IATipCard from "./IATipCard";
import SuggestionCard from "./SuggestionCard";

const steps = [
  "Destino",
  "Datas",
  "Orçamento",
  "Sugestões IA",
  "Confirmação"
];

type Suggestion =
  | { tipo: "coworking"; nome: string; descricao: string; adicionado: boolean }
  | { tipo: "alerta"; mensagem: string; adicionado?: boolean }
  | { [key: string]: any };

export default function TravelPlanWizard() {
  const [step, setStep] = useState(0);
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [budget, setBudget] = useState("");
  // IA tips for each step
  const [iaTip, setIATip] = useState<string | null>(null);
  const [iaSuggestions, setIASuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { iaLoading, fetchIATip, fetchIASuggestions } = useTravelIAWizard();
  const { isGuest } = useGuestMode();

  // Handler: show only relevant tip for the current step
  useEffect(() => {
    setIATip(null);
    if (step === 0 && destination) {
      fetchIATip({ type: "destination", value: destination, context: {} }).then(() => {
        setIATip(iaTip); // Tip will be updated by the hook if used properly; adapt if async
      });
    } else if (step === 1 && destination && dates.start && dates.end) {
      fetchIATip({ type: "dates", value: dates, context: { destination } }).then(() => {
        setIATip(iaTip);
      });
    } else if (step === 2 && destination && dates.start && dates.end && budget) {
      fetchIATip({ type: "budget", value: budget, context: { destination, dates } }).then(() => {
        setIATip(iaTip);
      });
    }
    // Clear IA tip on other steps
    else {
      setIATip(null);
    }
    // eslint-disable-next-line
  }, [step, destination, dates.start, dates.end, budget]);

  // Handler: fetch and display suggestions in Step 3
  useEffect(() => {
    if (step === 3 && destination && dates.start && dates.end && budget) {
      setSuggestionsLoading(true);
      fetchIASuggestions({ destination, dates, budget }).then(list => {
        // Normalize suggestions to add "adicionado" flag for selection
        setIASuggestions(
          (list ?? []).map((s: any) => ({
            ...s,
            adicionado: false,
          }))
        );
        setSuggestionsLoading(false);
      });
    } else if (step !== 3) {
      setIASuggestions([]);
    }
  }, [step, destination, dates.start, dates.end, budget, fetchIASuggestions]);

  // Select/unselect suggestion
  const handleToggleSuggestion = (idx: number) => {
    setIASuggestions(prev =>
      prev.map((s, i) =>
        i === idx ? { ...s, adicionado: !s.adicionado } : s
      )
    );
  };

  // On next from suggestions, collect only those with adicionado=true
  const handleNextFromSuggestions = () => {
    setSelectedSuggestions(iaSuggestions.filter(s => s.adicionado));
    setStep(step + 1);
  };

  // Save trip including selected suggestions as checklist
  const handleSaveTrip = async () => {
    if (isGuest) {
      showGuestBlockedToast();
      return;
    }
    setSaving(true);
    // Fetch user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast({ title: "Erro: não foi possível identificar o usuário.", variant: "destructive" });
      setSaving(false);
      return;
    }

    const parsedBudget = budget ? parseFloat(budget) : null;
    // Create trip in DB - checklist as text array or suggestion JSON
    const tripPayload: any = {
      destination,
      start_date: dates.start,
      end_date: dates.end,
      budget: parsedBudget,
      user_id: user.id,
      is_smart_trip: true,
      checklist: selectedSuggestions.length
        ? selectedSuggestions.map(s => {
            if ("mensagem" in s) return s.mensagem;
            if ("nome" in s) return `${s.nome} (${s.tipo || ""}): ${s.descricao || ""}`;
            return JSON.stringify(s);
        })
        : null,
    };

    const { error } = await supabase.from("trips").insert(tripPayload);
    if (error) {
      toast({ title: "Erro ao criar viagem", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Viagem criada com sucesso!" });
      setStep(steps.length - 1);
    }
    setSaving(false);
  };

  // Visual progress
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
        <>
          <WizardStepDestination
            value={destination}
            onChange={setDestination}
            onNext={() => setStep(step + 1)}
            disabled={!destination}
            iaTip={iaTip ? <IATipCard text={iaTip} loading={iaLoading} /> : null}
            iaLoading={iaLoading}
          />
        </>
      )}
      {step === 1 && (
        <>
          <WizardStepDates
            dates={dates}
            onChange={setDates}
            onNext={() => setStep(step + 1)}
            onPrev={() => setStep(step - 1)}
            iaTip={iaTip ? <IATipCard text={iaTip} loading={iaLoading} /> : null}
            iaLoading={iaLoading}
          />
        </>
      )}
      {step === 2 && (
        <>
          <WizardStepBudget
            value={budget}
            onChange={setBudget}
            onNext={() => setStep(step + 1)}
            onPrev={() => setStep(step - 1)}
            iaTip={iaTip ? <IATipCard text={iaTip} loading={iaLoading} /> : null}
            iaLoading={iaLoading}
          />
        </>
      )}
      {step === 3 && (
        <WizardStepIASuggestions
          suggestions={iaSuggestions}
          loading={suggestionsLoading}
          onToggle={handleToggleSuggestion}
          onNext={handleNextFromSuggestions}
          onPrev={() => setStep(step - 1)}
        />
      )}
      {step === 4 && (
        <WizardStepConfirmation
          destination={destination}
          dates={dates}
          budget={budget}
          suggestions={selectedSuggestions.map((s, idx) =>
            ({ id: idx, text: "mensagem" in s ? s.mensagem : ("nome" in s ? s.nome : JSON.stringify(s)) }))
          }
          onBack={() => setStep(step - 1)}
          onSave={handleSaveTrip}
          saving={saving}
        />
      )}
    </div>
  );
}
