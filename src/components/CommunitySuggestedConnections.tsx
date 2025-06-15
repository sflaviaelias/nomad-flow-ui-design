
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Filter } from "lucide-react";

type Nomad = {
  id: string;
  name: string;
  avatar_url?: string | null;
  country: string;
  city: string;
  language: string;
  interests: string[];
  workStyle: string;
  description?: string;
};

const CURRENT_USER = {
  language: "pt",
  interests: ["Cafés", "Coworking", "Tecnologia"],
  city: "Lisboa",
  workStyle: "Remoto",
};

const MOCK_NOMADS: Nomad[] = [
  {
    id: "1",
    name: "Lucas Lima",
    avatar_url: null,
    country: "Brasil",
    city: "Lisboa",
    language: "pt",
    interests: ["Cafés", "Coworking", "Fotografia"],
    workStyle: "Remoto",
    description: "Apaixonado por tecnologia e cafés locais.",
  },
  {
    id: "2",
    name: "Sophie Martin",
    avatar_url: "https://randomuser.me/api/portraits/women/65.jpg",
    country: "França",
    city: "Lisboa",
    language: "fr",
    interests: ["Música", "Yoga", "Coworking"],
    workStyle: "Remoto",
    description: "Gosto de trocar experiências culturais.",
  },
  {
    id: "3",
    name: "Carlos Ortega",
    avatar_url: "https://randomuser.me/api/portraits/men/26.jpg",
    country: "Espanha",
    city: "Lisboa",
    language: "es",
    interests: ["Cafés", "Caminhadas", "Tecnologia"],
    workStyle: "Presencial",
    description: "Explorando coworkings e trilhas novas.",
  },
  {
    id: "4",
    name: "Manuela Dias",
    avatar_url: null,
    country: "Brasil",
    city: "Porto",
    language: "pt",
    interests: ["Coworking", "Arte", "Culinária"],
    workStyle: "Remoto",
    description: "Amo cozinhar e conhecer novos espaços!",
  },
];

const FILTER_OPTIONS = [
  { value: "all", label: "Mais compatíveis" },
  { value: "language", label: "Idioma" },
  { value: "interests", label: "Interesses" },
  { value: "city", label: "Localização" },
  { value: "workStyle", label: "Estilo de trabalho" },
];

function getCompatibility(nomad: Nomad, filter: string) {
  let score = 0;

  // Por filtro específico ou geral ("all")
  if (filter === "all" || filter === "language")
    if (nomad.language === CURRENT_USER.language) score += 2;
  if (filter === "all" || filter === "interests")
    score += nomad.interests.filter(i => CURRENT_USER.interests.includes(i)).length;
  if (filter === "all" || filter === "city")
    if (nomad.city === CURRENT_USER.city) score += 1.5;
  if (filter === "all" || filter === "workStyle")
    if (nomad.workStyle === CURRENT_USER.workStyle) score += 1;

  return score;
}

export default function CommunitySuggestedConnections() {
  const [filter, setFilter] = useState<string>("all");

  // IA simulada: ordena por maior similaridade segundo filtro
  const sortedNomads = useMemo(() => {
    return [...MOCK_NOMADS]
      .map(nomad => ({
        ...nomad,
        compatibility: getCompatibility(nomad, filter),
      }))
      .filter(n => n.id !== "0") // Ignora self, se necessário
      .sort((a, b) => b.compatibility - a.compatibility)
      .filter(n => n.compatibility > 0);
  }, [filter]);

  return (
    <section className="bg-[#fff]/60 border border-[#E76F51]/10 rounded-2xl shadow-card px-4 py-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-inter font-semibold text-base md:text-lg text-[#E76F51] flex items-center gap-2">
          <UserPlus size={20} className="text-[#E76F51]" />
          Conexões inteligentes para você
        </h2>
        <div className="relative">
          <Filter size={18} className="absolute left-2 top-2 text-[#AD4F36]" />
          <select
            className="bg-[#FAF3EC] text-[#AD4F36] pl-7 pr-2 py-1.5 rounded-md border border-[#E76F51]/20 text-xs focus:outline-none"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            aria-label="Filtrar por"
          >
            {FILTER_OPTIONS.map(opt => (
              <option value={opt.value} key={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        {sortedNomads.length === 0 && (
          <div className="text-sm text-neutral-400 py-3">
            Nenhum nômade encontrado para esse filtro.
          </div>
        )}
        {sortedNomads.map(nomad => (
          <div
            key={nomad.id}
            className="flex items-center bg-white rounded-xl p-3 border border-[#E76F51]/10 mb-3 shadow-xs gap-4"
          >
            <Avatar className="w-11 h-11">
              {nomad.avatar_url ?
                <AvatarImage src={nomad.avatar_url} alt={nomad.name} /> :
                <AvatarFallback className="bg-[#FAF3EC] text-[#AD4F36] font-bold">
                  {nomad.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              }
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[#AD4F36] truncate">{nomad.name}</div>
              <div className="text-xs text-neutral-500 truncate">
                {nomad.city}, {nomad.country} · {nomad.language.toUpperCase()}
              </div>
              <div className="mt-0.5 text-xs text-neutral-700 line-clamp-2">
                {nomad.description}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {nomad.interests.map((int, idx) => (
                  <span key={idx} className="bg-[#E76F51]/10 px-2 py-0.5 rounded text-[11px] text-[#AD4F36]">{int}</span>
                ))}
                <span className="bg-[#E76F51]/10 px-2 py-0.5 rounded text-[11px] text-[#AD4F36]">
                  {nomad.workStyle}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="px-2 py-1 border-[#E76F51] text-[#E76F51] rounded font-medium hover:bg-[#E76F51]/15 text-xs"
              onClick={() => window.alert(`Pedido enviado para ${nomad.name}!`)}
            >
              Conectar
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
