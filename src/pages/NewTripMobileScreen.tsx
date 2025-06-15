
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { CalendarIcon, ArrowRight } from "lucide-react";
import { useDestinationImageUnsplash } from "@/hooks/useDestinationImageUnsplash";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useVisaRequirement } from "@/hooks/useVisaRequirement";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import destinationsList from "@/components/destinationsList"; // Para autocomplete
import { format, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import "tailwindcss/tailwind.css";

const currencyMap = { BR: "BRL", US: "USD", PT: "EUR", FR: "EUR", ES: "EUR" }; // simplificado

export default function NewTripMobileScreen() {
  // User context
  const { user } = useSupabaseAuth();
  const [nationality, setNationality] = useState("BR");
  const userCurrency = currencyMap[nationality] || "BRL";

  // Form state
  const [destination, setDestination] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [existingTrip, setExistingTrip] = useState(false); // mock, sempre false
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [currency, setCurrency] = useState(userCurrency);
  const [destCurrency, setDestCurrency] = useState("USD"); // mock
  const [budget, setBudget] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Smart APIs
  const { imageUrl, loading: imageLoading } = useDestinationImageUnsplash(destination);
  const { converted, loading: conversionLoading } = useCurrencyConversion(budget, currency, destCurrency);
  const { required: visaRequired, loading: visaLoading } = useVisaRequirement(nationality, destinationCountry);

  // Autocomplete de destino
  useEffect(() => {
    const found = destinationsList.find(d =>
      d.label.toLowerCase().includes(destination.toLowerCase())
    );
    setDestinationCountry(found?.country || "");
    setDestCurrency(currencyMap[found?.countryCode as string] || "USD");
  }, [destination]);

  // Validação de datas
  const dateValid = start && end && isAfter(parseISO(end), parseISO(start));

  // Mock de trips (poderia buscar do backend), sempre falso por simplicidade
  useEffect(() => {
    setExistingTrip(false);
  }, [destination]);

  // Form submit handler
  function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!destination) return setFormError("Escolha um destino.");
    if (!dateValid) return setFormError("Defina datas válidas.");
    if (budget <= 0) return setFormError("Orçamento deve ser maior que zero.");
    // Mock create:
    alert("Viagem criada com sucesso! (Mock)");
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF3EC] flex flex-col font-inter">
      {/* Imagem do destino/banner */}
      {imageLoading ? (
        <div className="h-[160px] w-full bg-[#DADADA] animate-pulse flex items-center justify-center">
          <span className="text-neutral-500">Carregando imagem...</span>
        </div>
      ) : imageUrl ? (
        <div className="h-[180px] w-full overflow-hidden rounded-b-xl shadow-sm">
          <img src={imageUrl} alt={`Paisagem de ${destination}`} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-[160px] w-full bg-[#DADADA] flex items-center justify-center">
          <span className="text-neutral-500">Selecione um destino para ver foto</span>
        </div>
      )}

      <form className="flex flex-col gap-5 p-4" onSubmit={handleCreateTrip} autoComplete="off">
        {/* Destination */}
        <Card className="p-3 flex flex-col gap-2">
          <label className="font-medium text-terracotta mb-1" htmlFor="destino">Destino</label>
          <Input
            id="destino"
            type="text"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            list="suggestions"
            placeholder="Ex: Lisboa, Portugal"
            className="capitalize"
            required
            style={{ fontFamily: "Inter" }}
          />
          <datalist id="suggestions">
            {destinationsList.slice(0, 12).map((d) => (
              <option value={d.label} key={d.value}>{d.label}</option>
            ))}
          </datalist>
          {/* Badges */}
          <div className="flex items-center gap-2 mt-1">
            {visaLoading ? (
              <span className="text-xs text-neutral-400">Verificando visto...</span>
            ) : visaRequired ? (
              <span className="text-xs bg-terracotta text-white rounded-full px-3 py-1">Visto necessário</span>
            ) : visaRequired === false && (
              <span className="text-xs bg-green-200 text-green-700 rounded-full px-3 py-1">Sem visto</span>
            )}
            {existingTrip && (
              <span className="text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-1">
                Você já adicionou {destination} em outra viagem futura. Deseja continuar?
              </span>
            )}
          </div>
        </Card>

        {/* Dates */}
        <div className="flex gap-3">
          <Card className="flex-1 flex flex-col gap-1 p-3">
            <label className="font-medium text-terracotta mb-1 flex gap-1 items-center">
              <CalendarIcon size={16} /> Início
            </label>
            <Input type="date" value={start} onChange={e => setStart(e.target.value)} required />
          </Card>
          <Card className="flex-1 flex flex-col gap-1 p-3">
            <label className="font-medium text-terracotta mb-1 flex gap-1 items-center">
              <CalendarIcon size={16} /> Fim
            </label>
            <Input type="date" value={end} onChange={e => setEnd(e.target.value)} required min={start} />
          </Card>
        </div>
        {!dateValid && start && end && (
          <span className="text-xs text-red-500">A data final deve ser após a data inicial.</span>
        )}

        {/* Orçamento */}
        <Card className="p-3 flex flex-col gap-2">
          <label className="font-medium text-terracotta mb-1">Orçamento</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              placeholder="Valor"
              required
              className="flex-1"
            />
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="bg-[#FAF3EC] px-2 py-2 rounded-md border border-[#DADADA]">
              <option value={userCurrency}>{userCurrency}</option>
              <option value={destCurrency}>{destCurrency}</option>
            </select>
          </div>
          {/* Conversão automática */}
          {conversionLoading ? (
            <span className="text-xs text-neutral-400">Convertendo orçamento...</span>
          ) : converted !== null && !isNaN(converted) && (
            <span className="text-xs text-neutral-700">
              {Number(budget).toLocaleString("pt-BR", { style: "currency", currency })} ≈ {Number(converted).toLocaleString("pt-BR", { style: "currency", currency: destCurrency })} ({destCurrency})
            </span>
          )}
        </Card>

        {/* Notas */}
        <Card className="p-3 flex flex-col gap-2">
          <label className="font-medium text-terracotta mb-1" htmlFor="notes">Observações</label>
          <Textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            maxLength={220}
            rows={2}
            placeholder="Metas, lembretes ou intenções para a viagem"
            className="resize-none"
          />
        </Card>

        {formError && (
          <div className="text-center text-red-500 text-sm py-1">{formError}</div>
        )}

        {/* CTA */}
        <Button
          type="submit"
          className="w-full mt-3 bg-terracotta hover:bg-[#C9583C] text-white text-lg rounded-lg shadow-card py-3 tracking-tight"
        >
          <span>Criar Viagem</span>
          <ArrowRight className="ml-2" />
        </Button>
      </form>
    </div>
  );
}
