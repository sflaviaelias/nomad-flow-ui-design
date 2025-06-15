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
  onShowDetails?: () => void; // Nova prop opcional para mostrar modal de detalhes
}

export const ActiveTripSection: React.FC<ActiveTripSectionProps> = ({
  hasActiveTrip,
  activeTrip
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

  // Cores, tipografia e classes Untitled UI/paleta Nomad
  const cardClass =
    "rounded-2xl bg-white shadow-card border border-[#E76F51]/10 overflow-hidden font-inter";
  const badgeClass =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#FAF3EC] border border-[#DADADA] text-[#E76F51] gap-1 min-w-[44px] min-h-[32px]";
  const badgeUtcClass =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#E76F51] bg-opacity-10 border border-[#DADADA] text-[#C9583C] gap-1 min-w-[44px] min-h-[32px]";
  const labelClass =
    "text-xs text-[#AD4F36] font-medium mb-1 tracking-tight";
  const valueClass =
    "font-semibold text-base text-[#C9583C]";
  const currencyEquivClass =
    "font-medium text-base text-[#6D4530]";
  const sectionTitle =
    "heading-sm font-semibold text-xl md:text-2xl text-[#C9583C] font-inter mb-1 px-2 tracking-tight";

  return (
    <section>
      <h2 className={sectionTitle} style={{letterSpacing: 0}}>
        Viagem ativa
      </h2>
      <div className="px-4">
        {hasActiveTrip ? (
          <div className={cardClass + " mb-6 w-full"}>
            <div className="relative w-full h-44 md:h-56">
              {/* Imagem dinâmica, borda arredondada Untitled UI */}
              <img
                src={cityPhoto}
                alt={activeTrip.destination}
                className="object-cover w-full h-full"
                style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              />
              {/* Badges: temperatura e UTC, como badges do DS acima da imagem */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={badgeClass}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="inline">
                    <circle cx="12" cy="12" r="8" stroke="#E76F51" strokeWidth="2" fill="#E76F51" fillOpacity="0.18" />
                  </svg>
                  {weather ? weather : "—°C"}
                </span>
                <span className={badgeUtcClass}>
                  UTC {utcOffset ? utcOffset : ""}
                </span>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#E76F51] font-bold text-lg md:text-xl font-inter">
                  {activeTrip.destination}
                </span>
              </div>
              <div className="text-xs text-[#AD4F36] font-medium mb-2">
                {activeTrip.startDate} &mdash; {activeTrip.endDate}
              </div>
              <div className="flex gap-5 flex-wrap mb-2">
                <div>
                  <div className={labelClass}>Orçamento (EUR)</div>
                  <div className={valueClass}>{activeTrip.budget}</div>
                </div>
                <div>
                  <div className={labelClass + " text-neutral-400"}>Orçamento (BRL)</div>
                  <div className={currencyEquivClass}>{brlBudget}</div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3 mt-3">
                <Button
                  className="bg-[#E76F51] hover:bg-[#C9583C] text-white font-bold rounded-md px-4 py-3 w-full md:w-auto"
                  variant="default"
                  style={{ minHeight: 44, minWidth: 44, letterSpacing: 0 }}
                  size="lg"
                  onClick={() => navigate("/trip/add-expense")}
                >
                  Adicionar despesa
                </Button>
                <Button
                  className="border border-[#E76F51] text-[#E76F51] bg-[#FAF3EC] hover:bg-[#E76F51] hover:text-white font-bold rounded-md px-4 py-3 w-full md:w-auto"
                  variant="outline"
                  style={{ minHeight: 44, minWidth: 44, letterSpacing: 0 }}
                  size="lg"
                  onClick={() => navigate("/trip/active")}
                >
                  Acessar detalhes da viagem
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className={cardClass + " p-8 text-center mb-6 flex flex-col items-center"}>
            <span className="text-lg font-semibold text-[#E76F51] mb-2 font-inter">
              Nenhuma viagem ativa encontrada.
            </span>
            <span className="text-sm text-[#AD4F36] mb-5 font-inter">
              Programe uma nova viagem para começar!
            </span>
            <Button
              onClick={() => navigate("/trip/new")}
              className="w-full max-w-xs mx-auto bg-[#E76F51] hover:bg-[#C9583C] text-white font-bold rounded-lg flex items-center justify-center gap-2 px-6 py-3 shadow-card"
              size="lg"
              style={{ fontSize: 17, minWidth: 220, minHeight: 44 }}
              aria-label="Adicionar nova viagem"
            >
              {/* Ícone Untitled UI */}
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="mr-1.5">
                <rect x="9" y="4" width="2" height="12" rx="1" fill="white" />
                <rect x="4" y="9" width="12" height="2" rx="1" fill="white" />
                <rect x="1" y="1" width="18" height="18" rx="5" stroke="white" strokeWidth="2" fill="#E76F51" />
              </svg>
              Adicionar nova viagem
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
