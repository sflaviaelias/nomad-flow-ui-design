import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import TripDestinationStep from "./TripDestinationStep";
import TripDatesStep from "./TripDatesStep";
import TripCurrencyStep from "./TripCurrencyStep";
import TripSummaryStep from "./TripSummaryStep";
import SmartTripToggle from "./SmartTripToggle";
import { useDestinationImageUnsplash } from "@/hooks/useDestinationImageUnsplash";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import TripCreationHeader from "./TripCreationHeader";
import TripIntelligentStep from "./TripIntelligentStep";

type Phase = 0 | 1 | 2 | 3;

const currencyOptions = [
  { label: "Real (BRL)", value: "BRL" },
  { label: "Euro (EUR)", value: "EUR" },
  { label: "Dólar (USD)", value: "USD" },
];

const TripCreationWizard: React.FC = () => {
  const [phase, setPhase] = React.useState<Phase>(0);
  const [destination, setDestination] = React.useState("");
  const [dates, setDates] = React.useState({ start: "", end: "" });
  const [currency, setCurrency] = React.useState("BRL");
  const [aiAdvice, setAiAdvice] = React.useState<{ dates?: string; budget?: string; forecast?: string } | null>(null);
  const [loadingAI, setLoadingAI] = React.useState(false);
  const [isSmartTrip, setIsSmartTrip] = React.useState(false);

  // Usa hook para buscar imagem do destino via Unsplash
  const { imageUrl, loading: imgLoading } = useDestinationImageUnsplash(destination);

  // Loading e feedback
  const [saving, setSaving] = React.useState(false);

  function nextPhase() {
    setPhase((p) => (p < 3 ? ((p + 1) as Phase) : p));
  }
  function prevPhase() {
    setPhase((p) => (p > 0 ? ((p - 1) as Phase) : p));
  }

  // Busca sugestões IA para orçamento/datas/clima (mantém pois não envolve imagens)
  React.useEffect(() => {
    if (phase === 2 && destination) {
      setLoadingAI(true);
      fetch(`${SUPABASE_URL}/functions/v1/concierge-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Sugira as melhores datas e previsão de custos para uma viagem a ${destination}. Mostre também o clima atual.`
          }],
          userContext: {},
        }),
      })
        .then(res => res.json())
        .then(data => {
          setAiAdvice({
            dates: data.result?.match(/Datas.+/i)?.[0] ?? "",
            budget: data.result?.match(/(Custo|Orçamento).+/i)?.[0] ?? "",
            forecast: data.result?.match(/(Clima|Previsão).+/i)?.[0] ?? "",
          });
        })
        .catch(() => {
          setAiAdvice(null);
        })
        .finally(() => setLoadingAI(false));
    }
    // eslint-disable-next-line
  }, [phase]);

  // Salva viagem na tabela trips
  async function handleSaveTrip() {
    setSaving(true);
    try {
      // Obter usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        toast({
          title: "Erro",
          description: "É preciso estar logado para salvar a viagem.",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }

      // Gravar viagem
      const { error } = await supabase
        .from("trips")
        .insert({
          user_id: user.id,
          destination,
          start_date: dates.start,
          end_date: dates.end,
          currency,
          budget: null, // Ajustar se orçamento for numérico
          notes: "",
          is_smart_trip: isSmartTrip, // <-- NOVO!! 
          // Use imageUrl if available (additional column if your schema permits)
        });

      if (error) throw error;

      toast({
        title: "Viagem salva!",
        description: isSmartTrip
          ? "Viagem Inteligente ativada. Você receberá sugestões automáticas, análises e cards IA no seu planejamento ✨"
          : "Viagem salva! Em breve: sugestões inteligentes da IA para otimizar seu planejamento.",
      });

      // Resetar wizard (opcional: pode redirecionar ou só limpar)
      setPhase(0);
      setDestination("");
      setDates({ start: "", end: "" });
      setCurrency("BRL");
      setAiAdvice(null);
      setIsSmartTrip(false);
    } catch (e: any) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a viagem. Tente novamente.",
        variant: "destructive"
      });
    }
    setSaving(false);
  }

  return (
    <Card className="mt-6">
      <CardContent>
        <div className="py-4 px-1 flex flex-col gap-6">
          <TripCreationHeader />

          {/* Toggle Viagem Inteligente separado em seu próprio step */}
          {phase === 0 && (
            <TripIntelligentStep value={isSmartTrip} onChange={setIsSmartTrip} />
          )}

          {phase === 0 && (
            <TripDestinationStep
              value={destination}
              onChange={setDestination}
              onNext={nextPhase}
              disabled={imgLoading || saving}
            />
          )}

          {phase === 1 && (
            <TripDatesStep
              dates={dates}
              onChange={setDates}
              onPrev={prevPhase}
              onNext={nextPhase}
            />
          )}

          {phase === 2 && (
            <TripCurrencyStep
              currency={currency}
              onChange={setCurrency}
              onPrev={prevPhase}
              onNext={nextPhase}
              options={currencyOptions}
              aiAdvice={aiAdvice}
              loadingAI={loadingAI}
              imageUrl={imageUrl}
            />
          )}

          {phase === 3 && (
            <TripSummaryStep
              destination={destination}
              dates={dates}
              currency={currency}
              aiAdvice={aiAdvice}
              imageUrl={imageUrl}
              onPrev={prevPhase}
              onSave={handleSaveTrip}
              saving={saving}
            />
          )}

          {saving && (
            <div className="text-center text-[#E76F51] text-sm">Salvando...</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCreationWizard;
