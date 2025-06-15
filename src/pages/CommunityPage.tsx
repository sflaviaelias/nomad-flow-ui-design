import React, { useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import CommunityNomadCard from "@/components/CommunityNomadCard";
import CommunityGroupCard from "@/components/CommunityGroupCard";
import CommunityNewsCard from "@/components/CommunityNewsCard";
import { Plus } from "lucide-react";
import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";
import CommunitySuggestedConnections from "@/components/CommunitySuggestedConnections";

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

// MOCK DE NOTÍCIAS para nômades
const news = [
  {
    title: "Novo café nômade abre no centro de Lisboa",
    summary: "Espaço com wifi rápido, café gourmet e desconto para membros Go Nomad.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80",
    date: "15/06/2025",
    content: "O Nomads Coffee inaugurou no centro! Espaço para coworking, café especial e ambiente acolhedor para quem trabalha remoto. Mostre seu app Go Nomad e ganhe desconto de 10%.",
  },
  {
    title: "Evento especial: Meet & Work no Miradouro",
    summary: "Participe do encontro de nômades digitais com vista panorâmica da cidade.",
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400&q=80",
    date: "13/06/2025",
    content: "Venha trabalhar e conhecer outros nômades no Miradouro. Traga seu notebook, aproveite o cenário e networking!",
  },
  {
    title: "Dica local: Melhor padaria para café da manhã produtivo",
    summary: "Conheça a padaria favorita da comunidade para começar o dia com energia.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80",
    date: "10/06/2025",
    content: "A Padaria Lisboa foi eleita pela comunidade como o melhor ponto para café da manhã e trabalho tranquilo. Recomendada por nômades!",
  },
];

export default function CommunityPage() {
  const [showFab, setShowFab] = React.useState(true);
  const { push } = useNavigationHistory();

  useEffect(() => {
    push(window.location.pathname);
    // eslint-disable-next-line
  }, []);

  // Novo: handler simples de modal/alert news
  const handleNewsClick = (item: typeof news[0]) => {
    window.alert(`${item.title}\n\n${item.content}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF3EC] pb-20 relative">
      <PageHeader title="Comunidade Inteligente" showBack />

      {/* NOVA seção IA de sugestões de conexões */}
      <div className="px-4 pt-3">
        <CommunitySuggestedConnections />
      </div>

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
        
        {/* NOVA seção de notícias */}
        <section className="mt-8">
          <h2 className="font-inter font-semibold text-base md:text-lg mb-2 text-[#AD4F36] px-1">Notícias para nômades</h2>
          {news.length > 0 ? (
            news.map((n, idx) => (
              <CommunityNewsCard
                key={idx}
                title={n.title}
                summary={n.summary}
                image={n.image}
                date={n.date}
                onClick={() => handleNewsClick(n)}
              />
            ))
          ) : (
            <div className="text-sm text-neutral-500">Sem novidades para este destino no momento.</div>
          )}
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
