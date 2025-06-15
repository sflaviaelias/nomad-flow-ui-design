import React, { useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import CommunityNomadCard from "@/components/CommunityNomadCard";
import CommunityGroupCard from "@/components/CommunityGroupCard";
import { Plus } from "lucide-react";
import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";

const nomads = [
  // Exemplo de dados mockados; em breve virá de API
  {
    name: "Ana Souza",
    avatar_url: null,
    country: "Brasil",
    stayPeriod: "até 22 de junho",
  },
  {
    name: "Louis Dupont",
    avatar_url: "https://randomuser.me/api/portraits/men/35.jpg",
    country: "França",
    stayPeriod: "até 25 de junho",
  },
];

const groups = [
  {
    name: "Trabalhando em cafés - Lisboa",
    description: "Encontro informal para coworking em cafés locais.",
    date: "Sáb, 22/06 - 10h",
    members: 5,
  },
  {
    name: "Free walking tour sábado",
    description: "Passeio gratuito pelos pontos turísticos da cidade.",
    date: "Sáb, 22/06 - 16h",
    members: 12,
  },
];

export default function CommunityPage() {
  const [showFab, setShowFab] = React.useState(true);
  const { push } = useNavigationHistory();

  useEffect(() => {
    push(window.location.pathname);
    // eslint-disable-next-line
  }, []);

  // Estados vazios para testes:
  // const nomads: any[] = [];
  // const groups: any[] = [];

  return (
    <div className="min-h-screen bg-[#FAF3EC] pb-20 relative">
      <PageHeader title="Comunidade Inteligente" showBack />

      <main className="px-4 py-3 w-full max-w-lg mx-auto">
        {/* Nômades próximos */}
        <section className="mb-7">
          <h2 className="font-inter font-semibold text-base md:text-lg mb-2 text-[#AD4F36] px-1">Nômades próximos</h2>
          {nomads.length > 0 ? (
            nomads.map((u, i) => (
              <CommunityNomadCard
                key={i}
                {...u}
                onProfile={() => alert("Funcionalidade de perfil em breve!")}
              />
            ))
          ) : null}
        </section>

        {/* Grupos temporários */}
        <section>
          <h2 className="font-inter font-semibold text-base md:text-lg mb-2 text-[#AD4F36] px-1">Grupos temporários</h2>
          {groups.length > 0 ? (
            groups.map((g, i) => (
              <CommunityGroupCard
                key={i}
                {...g}
                onJoin={() => alert("Funcionalidade de entrar no grupo em breve!")}
              />
            ))
          ) : null}
        </section>

        {/* Estado vazio */}
        {nomads.length === 0 && groups.length === 0 && (
          <div className="text-center mt-20 mb-10 animate-fade-in">
            <div className="font-inter text-base text-[#AD4F36] mb-2">Ainda não há nômades por perto neste destino.</div>
            <div className="text-sm text-neutral-500 mb-5">Que tal criar um grupo?</div>
          </div>
        )}
      </main>

      {/* Botão flutuante “Criar grupo” */}
      <button
        type="button"
        className="fixed z-20 bottom-7 right-6 md:right-8 rounded-full p-0 w-[56px] h-[56px] bg-[#E76F51] shadow-card flex items-center justify-center hover:bg-[#C9583C] transition-all duration-150"
        aria-label="Criar grupo"
        onClick={() => alert("Funcionalidade de criar grupo em breve!")}
      >
        <Plus size={32} className="text-white" />
      </button>
    </div>
  );
}
