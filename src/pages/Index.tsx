import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActiveTripCard from "../components/ActiveTripCard";
import ConciergeCard from "../components/ConciergeCard";
import DiscoverySection from "../components/DiscoverySection";
import UpcomingTripsPreview from "../components/UpcomingTripsPreview";
import { Avatar } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

// Dummy data: in real app, replace with actual data and hooks.
const user = {
  name: "João",
  avatarUrl: "https://randomuser.me/api/portraits/men/12.jpg",
};

const activeTrip = {
  destination: "Barcelona, Espanha",
  imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=945&q=80",
  startDate: "01/07/2024",
  endDate: "15/07/2024",
  budget: "€1200",
  localBudget: "US$ 1,300",
};
const hasActiveTrip = true; // Simulate trip presence

const upcomingTrips = [
  {
    id: 1,
    destination: "Tóquio, Japão",
    dates: "15/08 - 30/08",
    imageUrl:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80",
    budget: "¥240,000",
    localBudget: "US$ 1,500",
    visa: true,
    vaccines: true,
  },
  {
    id: 2,
    destination: "Lisboa, Portugal",
    dates: "12/09 - 27/09",
    imageUrl:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&q=80",
    budget: "€900",
    localBudget: "US$ 950",
    visa: false,
    vaccines: false,
  },
  {
    id: 3,
    destination: "Buenos Aires, Argentina",
    dates: "10/10 - 30/10",
    imageUrl:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=500&q=80",
    budget: "ARS 85,000",
    localBudget: "US$ 980",
    visa: false,
    vaccines: true,
  },
];
const hasUpcomingTrips = upcomingTrips.length > 0;

const Index = () => {
  const navigate = useNavigate();

  // Novo: state para perfil do usuário para reflexão imediata das edições
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      // Buscar usuário autenticado do Supabase (v2)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(data);
      setLoading(false);
    }
    fetchProfile();

    // Recarregar perfil após login ou atualização
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });
    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Fallbacks
  const userName = profile?.name || "Viajante";
  const avatarUrl =
    profile?.avatar_url && profile.avatar_url !== ""
      ? profile.avatar_url
      : "https://ui-avatars.com/api/?background=E76F51&color=fff&size=128&name=" +
        encodeURIComponent(userName);

  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2 bg-[#FAF3EC] rounded-b-xl shadow-none">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Abrir menu"
          onClick={() => navigate("/profile")}
        >
          <Menu className="text-[#E76F51]" size={28} />
        </Button>
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="font-bold text-xl leading-tight text-[#E76F51] font-inter">
            Olá, {userName}!
          </h1>
          <span className="text-sm text-[#6D4530] leading-tight font-inter">Seu painel de viagens</span>
        </div>
        <div onClick={() => navigate("/profile")} className="cursor-pointer">
          <Avatar className="w-10 h-10 border-2 border-[#E76F51] ring-2 ring-[#E76F51] shadow">
            <img
              src={avatarUrl}
              alt={`Avatar de ${userName}`}
              className="object-cover w-full h-full rounded-full"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://ui-avatars.com/api/?background=E76F51&color=fff&size=128&name=" +
                  encodeURIComponent(userName);
              }}
            />
          </Avatar>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-0 pb-10">
        {/* Loading indicator */}
        {loading ? (
          <div className="h-32 flex items-center justify-center text-[#E76F51] text-lg font-medium">
            Carregando informações...
          </div>
        ) : (
        <>
        {/* Vertical spacing */}
        <div className="h-8 md:h-12" />
        {/* Trip Section */}
        <section>
          <h2 className="heading-sm font-semibold text-[#AD4F36] px-5 mb-3 text-base md:text-lg tracking-tight font-inter">
            Viagem ativa
          </h2>
          <div className="px-4">
            {hasActiveTrip ? (
              <div className="rounded-2xl bg-white overflow-hidden shadow-card mb-6 w-full">
                <img
                  src={activeTrip.imageUrl}
                  alt={activeTrip.destination}
                  className="object-cover w-full h-40 md:h-48"
                  style={{ borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
                />
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[#E76F51] font-inter font-semibold text-lg">
                      {activeTrip.destination}
                    </span>
                  </div>
                  <div className="text-xs text-[#AD4F36] mb-1 font-medium">{activeTrip.startDate} — {activeTrip.endDate}</div>
                  <div className="flex gap-4 mb-1">
                    <div>
                      <div className="text-xs text-neutral-500">Orçamento</div>
                      <div className="font-bold text-base text-[#C9583C]">{activeTrip.budget}</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400">No destino</div>
                      <div className="font-medium text-[#6D4530]">{activeTrip.localBudget}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      className="flex-1"
                      variant="default"
                      size="sm"
                      onClick={() => navigate("/trip/add-expense")}
                    >
                      Adicionar despesa
                    </Button>
                    <Button
                      className="flex-1"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/discovery/markets")}
                    >
                      Descoberta local
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

        {/* Vertical spacing */}
        <div className="h-12" />
        
        {/* Concierge IA */}
        <section>
          <h2 className="heading-sm font-semibold text-[#AD4F36] px-5 mb-3 text-base md:text-lg tracking-tight font-inter">
            Concierge IA
          </h2>
          <div className="px-4 mb-3">
            <ConciergeCard />
          </div>
        </section>

        {/* Vertical spacing */}
        <div className="h-12" />

        {/* Discovery */}
        <section>
          <h2 className="heading-sm font-semibold text-[#AD4F36] px-5 mb-3 text-base md:text-lg tracking-tight font-inter">
            Descoberta
          </h2>
          <div className="px-4">
            <DiscoverySection />
          </div>
        </section>

        {/* Vertical spacing */}
        <div className="h-12" />

        {/* Upcoming Trips */}
        <section>
          <h2 className="heading-sm font-semibold text-[#AD4F36] px-5 mb-3 text-base md:text-lg tracking-tight font-inter">
            Próximas viagens
          </h2>
          <div className="px-4">
            <UpcomingTripsPreview />
          </div>
        </section>
        </>
        )}
      </main>
    </div>
  );
};

export default Index;
