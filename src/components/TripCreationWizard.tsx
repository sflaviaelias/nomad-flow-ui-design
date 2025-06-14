
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, CalendarDays, MapPin, DollarSign, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Phase = 0 | 1 | 2 | 3;

const currencyOptions = [
  { label: "Real (BRL)", value: "BRL" },
  { label: "Euro (EUR)", value: "EUR" },
  { label: "Dólar (USD)", value: "USD" },
];

const TripCreationWizard: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(0);
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [currency, setCurrency] = useState("BRL");
  const [aiAdvice, setAiAdvice] = useState<{ dates?: string; budget?: string; forecast?: string } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);

  // Simulação do preenchimento automático via AI
  async function fetchAIAdvice() {
    setLoadingAI(true);
    try {
      const res = await fetch("/functions/v1/concierge-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Sugira as melhores datas e previsão de custos para uma viagem a ${destination}. Mostre também o clima atual.` }],
          userContext: {},
        }),
      });
      const data = await res.json();
      // Parsing simplificado
      setAiAdvice({
        dates: data.result?.match(/Datas.+/i)?.[0] ?? "",
        budget: data.result?.match(/(Custo|Orçamento).+/i)?.[0] ?? "",
        forecast: data.result?.match(/(Clima|Previsão).+/i)?.[0] ?? "",
      });
    } catch {
      toast({ title: "Erro ao obter sugestões da IA." });
    } finally {
      setLoadingAI(false);
    }
  }

  // Simulação simples de imagem Unsplash e clima
  async function fetchDestinationImage() {
    // Demo: define fallback genérica
    setImageUrl(`https://source.unsplash.com/600x350/?${encodeURIComponent(destination)},travel,city`);
    setWeather("22°C, ensolarado");
  }

  function nextPhase() {
    setPhase((p) => (p < 3 ? ((p + 1) as Phase) : p));
  }

  function prevPhase() {
    setPhase((p) => (p > 0 ? ((p - 1) as Phase) : p));
  }

  // Ao avançar para etapa de resumo
  React.useEffect(() => {
    if (phase === 2 && destination) {
      fetchAIAdvice();
      fetchDestinationImage();
    }
    // eslint-disable-next-line
  }, [phase]);

  return (
    <Card className="mt-6">
      <CardContent>
        <div className="py-4 px-1 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-xl text-terracotta">Nova Viagem</span>
            <span className="text-neutral-700 text-sm">Preencha as etapas para planejar sua próxima jornada.</span>
          </div>
          {/* Etapa 1: Destino */}
          {phase === 0 && (
            <div>
              <label className="block mb-2 font-medium flex items-center gap-2">
                <MapPin className="text-terracotta" /> Destino
              </label>
              <Input
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Ex: Lisboa, Portugal"
                autoFocus
              />
              <div className="mt-4 flex gap-2">
                <Button className="bg-terracotta" disabled={!destination} onClick={nextPhase}>Próxima <ArrowRight className="ml-1" /></Button>
              </div>
            </div>
          )}
          {/* Etapa 2: Datas */}
          {phase === 1 && (
            <div>
              <label className="block mb-2 font-medium flex items-center gap-2">
                <CalendarDays className="text-terracotta" /> Datas da Viagem
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dates.start}
                  onChange={e => setDates(d => ({ ...d, start: e.target.value }))}
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={dates.end}
                  onChange={e => setDates(d => ({ ...d, end: e.target.value }))}
                  className="flex-1"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={prevPhase}>Voltar</Button>
                <Button className="bg-terracotta" disabled={!dates.start || !dates.end} onClick={nextPhase}>Próxima <ArrowRight className="ml-1" /></Button>
              </div>
            </div>
          )}
          {/* Etapa 3: Moeda */}
          {phase === 2 && (
            <div>
              <label className="block mb-2 font-medium flex items-center gap-2">
                <DollarSign className="text-terracotta" /> Moeda preferida
              </label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                {currencyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={prevPhase}>Voltar</Button>
                <Button className="bg-terracotta" onClick={nextPhase}>Resumo <ArrowRight className="ml-1" /></Button>
              </div>
              {/* Sugestão da AI */}
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
                  <img src={imageUrl} alt={`Paisagem de ${destination}`} className="w-full object-cover" />
                </div>
              )}
            </div>
          )}
          {/* Etapa Final: Resumo */}
          {phase === 3 && (
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
                <Button variant="outline" onClick={prevPhase}>Voltar</Button>
                <Button className="bg-terracotta" onClick={() => toast({ title: "Viagem criada com sucesso! (fake)", description: "Integração de backend futura." })}>Salvar viagem & finalizar</Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCreationWizard;
