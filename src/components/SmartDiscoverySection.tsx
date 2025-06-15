
import React, { useMemo } from "react";
import { useActiveTrip } from "@/hooks/useActiveTrip";
import HomeDiscoverySection from "./HomeDiscoverySection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Mock local fallback (caso IA não esteja implementada/tabela vazia)
const MOCK_DISCOVERY = [
  // ... conteudo exemplo com cidade/país distintos
  {
    title: "Mercados e Padarias",
    city: "São Paulo",
    country: "Brasil",
    nearby: [
      { name: "Mercado Municipal", desc: "A 500m • 07h-18h", link: "mercado-municipal-sp" },
      { name: "Padaria Bella Paulista", desc: "24h", link: "padaria-bella-pa" },
    ],
  },
  {
    title: "Cafés & Restaurantes",
    city: "São Paulo",
    country: "Brasil",
    nearby: [
      { name: "Café do Centro", desc: "Wi-fi • 200m", link: "cafe-do-centro" },
      { name: "Bistro Paulista", desc: "Cozinha local", link: "bistro-paulista" },
    ],
  },
  {
    title: "Notícias e Comunidade",
    city: "São Paulo",
    country: "Brasil",
    nearby: [
      { name: "Paulistando.com", desc: "Notícias da cidade", link: "paulistando-site" },
      { name: "Comunidade Nômade SP", desc: "Encontros semanais", link: "nomadesp" },
    ],
  },
];

// (Futuro: buscar sugestões contextuais via edge function IA)
async function fetchDiscoveryForDestination(destination?: string) {
  if (!destination) return [];
  // Separar cidade e país
  const [city, country] = destination.split(",").map(s => s.trim());
  // Chamada edge function (mock, adaptar para IA real em produção)
  // const { data } = await supabase.functions.invoke("discovery-ai", {
  //   body: { destination: destination }
  // });
  // if (Array.isArray(data)) return data;
  // Filtro mock local
  return MOCK_DISCOVERY.filter(
    b =>
      (!b.city || b.city.toLowerCase() === city?.toLowerCase()) &&
      (!b.country || b.country.toLowerCase() === country?.toLowerCase())
  );
}

export default function SmartDiscoverySection() {
  // Ativa: cidade, país
  const { data: activeTrip } = useActiveTrip();
  const destination = activeTrip?.destination || "";
  const [city, country] = destination.split(",").map(s => s.trim());

  // Use React Query para buscar conteúdo relevante
  const { data: discoveryData = [], isLoading } = useQuery({
    queryKey: ["smart-discovery", destination],
    queryFn: () => fetchDiscoveryForDestination(destination),
    enabled: !!destination,
  });

  // Fallback friendly message se sem conteúdo relevante
  const noContent =
    !isLoading && (!discoveryData || discoveryData.length === 0);

  // Mensagem para "estamos descobrindo..."
  const discoverMsg =
    city
      ? `Ainda estamos descobrindo mais lugares em ${city} para você! 😉`
      : "Ainda estamos descobrindo mais lugares para você! 😉";

  // IA sugerida para futuro
  // Se for viável, ativar chamada Groq/OpenAI baseado no destino ativo...

  return (
    <section>
      <h2 className="heading-sm font-semibold text-[#AD4F36] px-5 mb-3 text-base md:text-lg tracking-tight font-inter">
        Descoberta
      </h2>
      <div className="px-4">
        {isLoading ? (
          <div className="py-6 text-neutral-400">Carregando sugestões...</div>
        ) : noContent ? (
          <div className="py-6 text-neutral-500 text-center">{discoverMsg}</div>
        ) : (
          <HomeDiscoverySection discoveryData={discoveryData} />
        )}
      </div>
    </section>
  );
}
