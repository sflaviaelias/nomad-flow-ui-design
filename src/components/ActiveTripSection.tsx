
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Utilitário para buscar foto da cidade no Unsplash API (simulado para Barcelona)
const getCityImage = async (city: string): Promise<string> => {
  // Normalmente, usaria fetch na API do Unsplash. Aqui retornamos uma URL representativa para Barcelona.
  return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&q=80";
};

// Utilitário para buscar a temperatura atual (°C) da cidade (usando Open-Meteo API)
const getCityWeather = async (city: string): Promise<{ temp: string }> => {
  // Para demo, retorna "23°C" fixo para Barcelona.
  return { temp: "23°C" };
};

// Utilitário para pegar o fuso horário IANA e offset UTC de uma cidade (para Barcelona)
const getCityTimezone = async (city: string): Promise<{ timezone: string; offset: string }> => {
  // Para demo, retorna dados reais de Barcelona: "Europe/Madrid", UTC+2
  return { timezone: "Europe/Madrid", offset: "+2" };
};

// Utilitário “mock” para conversão de moeda (EUR->BRL)
const convertCurrency = (amountEUR: number, nationality: string) => {
  // Mock simples: 1 EUR = 5.4 BRL
  const rate = 5.4;
  if (nationality === "Brasil" || nationality === "BR") {
    return amountEUR * rate;
  }
  return amountEUR;
};

interface TripData {
  destination: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  budget: string;
  localBudget: string;
}
interface ActiveTripSectionProps {
  hasActiveTrip: boolean;
  activeTrip: TripData;
}

export const ActiveTripSection: React.FC<ActiveTripSectionProps> = ({
  hasActiveTrip,
  activeTrip,
}) => {
  const navigate = useNavigate();

  // Estados adicionais para informações dinâmicas
  const [cityPhoto, setCityPhoto] = useState<string>(activeTrip.imageUrl);
  const [weather, setWeather] = useState<string>("");
  const [timezone, setTimezone] = useState<string>("");
  const [utcOffset, setUtcOffset] = useState<string>("");
  const [brlBudget, setBrlBudget] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Obtém nacionalidade do usuário do localStorage ou default BR
  const nationality = localStorage.getItem("profile-country") || "BR";

  useEffect(() => {
    async function fetchInfo() {
      setLoading(true);
      const image = await getCityImage(activeTrip.destination);
      setCityPhoto(image || activeTrip.imageUrl);

      const { temp } = await getCityWeather(activeTrip.destination);
      setWeather(temp);

      const tz = await getCityTimezone(activeTrip.destination);
      setTimezone(tz.timezone);
      setUtcOffset(tz.offset);

      // Calcula orçamento BRL
      // Pega valor em EUR do orçamento (ex: €1200) remove símbolos e converte
      const eur = Number(activeTrip.budget.replace(/[^\d.,]/g, "").replace(",","."));
      const brl = convertCurrency(eur, nationality);
      setBrlBudget(brl.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
      setLoading(false);
    }
    if (hasActiveTrip) fetchInfo();
    // eslint-disable-next-line
  }, [activeTrip.destination, hasActiveTrip]);

  // Paleta Go Nomad UI
  const terra = "#E76F51";
  const areia = "#FAF3EC";
  const cinza = "#DADADA";

  return (
    <section>
      <h2 className="heading-sm font-semibold" style={{ color: "#AD4F36" }}>
        Viagem ativa
      </h2>
      <div className="px-4">
        {hasActiveTrip ? (
          <div className="rounded-2xl bg-white overflow-hidden shadow-card mb-6 w-full border border-[#E76F51]/10">
            <div className="relative w-full h-44 md:h-52">
              {/* Imagem dinâmica contextualizada */}
              <img
                src={cityPhoto}
                alt={activeTrip.destination}
                className="object-cover w-full h-full"
                style={{ borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
              />
              {/* Temperatura & Fuso visual contextualizado */}
              <div className="absolute bottom-2 right-2 bg-[#FAF3EC] bg-opacity-90 rounded-md shadow-card flex items-center px-3 py-1 gap-4 border border-[#dadada]">
                <span className="flex items-center gap-1 text-[#E76F51] font-semibold text-base">
                  <svg width="18" height="18" fill="none" className="inline" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="#E76F51" strokeWidth="2" fill="#E76F51" fillOpacity="0.18" /></svg>
                  {weather ? `${weather}` : "—°C"}
                </span>
                <span className="text-xs text-[#6D4530] font-medium border-l border-[#dadada] pl-3">
                  UTC {utcOffset ? `${utcOffset}` : ""}
                </span>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#E76F51] font-inter font-semibold text-lg">
                  {activeTrip.destination}
                </span>
              </div>
              <div className="text-xs text-[#AD4F36] mb-1 font-medium">
                {activeTrip.startDate} — {activeTrip.endDate}
              </div>
              <div className="flex gap-4 mb-1">
                <div>
                  <div className="text-xs text-neutral-500">Orçamento (EUR)</div>
                  <div className="font-bold text-base" style={{ color: "#C9583C" }}>
                    {activeTrip.budget}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Orçamento (BRL)</div>
                  <div className="font-medium" style={{ color: "#6D4530" }}>
                    {brlBudget}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  className="flex-1 bg-[#E76F51] hover:bg-[#C9583C] text-white font-bold rounded-md"
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/trip/add-expense")}
                >
                  Adicionar despesa
                </Button>
                <Button
                  className="flex-1 border border-[#E76F51] text-[#E76F51] bg-[#FAF3EC] hover:bg-[#E76F51] hover:text-white font-bold rounded-md"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/trip/details")}
                >
                  Acessar detalhes da viagem
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow-card p-7 text-center mb-6 flex flex-col items-center">
            <span className="text-lg font-semibold text-[#E76F51] mb-1">
              Nenhuma viagem ativa encontrada.
            </span>
            <span className="text-sm text-[#AD4F36] mb-4">
              Programe uma nova viagem para começar!
            </span>
            <Button
              onClick={() => navigate("/trip/new")}
              className="w-full max-w-xs mx-auto"
            >
              Adicionar nova viagem
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
