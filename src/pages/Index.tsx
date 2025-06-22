
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../components/HomeHeader";
import { ActiveTripSection } from "../components/ActiveTripSection";
import { ConciergeSection } from "../components/ConciergeSection";
import { DiscoverySectionWrapper } from "../components/DiscoverySectionWrapper";
import { UpcomingTripsSection } from "../components/UpcomingTripsSection";
import HomeAddTripButton from "../components/HomeAddTripButton";
import HomeCommunityCard from "../components/HomeCommunityCard";
import HomeTripSummaryCard from "../components/HomeTripSummaryCard";
import TripDetailsModal from "@/components/TripDetailsModal";
import { supabase } from "@/integrations/supabase/client";
import UpcomingTripsSlider from "@/components/UpcomingTripsSlider";
import { useActiveTrip } from "@/hooks/useActiveTrip";
import { useGuestSession } from "@/hooks/useGuestSession";
import GuestLoginButton from "@/components/GuestLoginButton";
import { showGuestBlockedToast } from "@/components/GuestLoginToast";

// Dummy data: in real app, replace with actual data and hooks.
const userFallback = {
  name: "Viajante",
  avatarUrl:
    "https://ui-avatars.com/api/?background=E76F51&color=fff&size=128&name=Viajante"
};

const fallbackImage =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&q=80";

const Index = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hook: fetch dynamic active trip
  const { data: activeTripRaw, isLoading: tripLoading, error: tripError } = useActiveTrip();
  const hasActiveTrip = !!activeTripRaw;

  const { isGuestSession, isAuthenticated, isLoading } = useGuestSession();

  // Debug logs
  console.log("[Index] Deploy Debug - Componente carregado em:", new Date().toISOString());
  console.log("[Index] Deploy Debug - Status de sessão:", {
    isGuestSession,
    isAuthenticated,
    isLoading,
    hasActiveTrip,
    activeTripRaw,
    tripError
  });

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      console.log("[Index] Deploy Debug - fetchProfile, usuário:", !!user?.id);
      if (!user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      console.log("[Index] Deploy Debug - Profile obtido:", !!data);
      if (data) {
        console.log("[Index] Avatar URL no profile:", data.avatar_url);
      }
      setProfile(data);
      setLoading(false);
    }
    fetchProfile();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      console.log("[Index] Deploy Debug - Auth state mudou, buscando profile novamente");
      fetchProfile();
    });
    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Determinar nome do usuário baseado no tipo de sessão
  const userName = isGuestSession ? "Nômade" : (profile?.name || userFallback.name);
  const avatarUrl = isGuestSession
    ? userFallback.avatarUrl
    : (profile?.avatar_url && profile.avatar_url !== ""
        ? profile.avatar_url
        : userFallback.avatarUrl);

  console.log("[Index] Deploy Debug - Nome do usuário:", userName);
  console.log("[Index] Deploy Debug - Avatar URL final:", avatarUrl);
  console.log("[Index] Deploy Debug - É sessão guest:", isGuestSession);

  // Lógica melhorada para criar activeTrip
  let activeTrip = null;
  if (isAuthenticated && activeTripRaw) {
    console.log("[Index] Deploy Debug - Criando activeTrip para usuário autenticado");
    console.log("[Index] Deploy Debug - Dados da viagem:", activeTripRaw);
    
    // Função auxiliar para formatar orçamento
    const formatBudget = (budget: number | null, currency: string = "EUR") => {
      if (budget === null || budget === undefined) {
        return "Orçamento não definido";
      }
      try {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(budget);
      } catch (error) {
        return `${currency} ${budget}`;
      }
    };

    // Função auxiliar para conversão local
    const formatLocalBudget = (budget: number | null, rate: number = 5.4) => {
      if (budget === null || budget === undefined) {
        return "—";
      }
      try {
        const localAmount = budget * rate;
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(localAmount);
      } catch (error) {
        return "—";
      }
    };

    activeTrip = {
      destination: activeTripRaw.destination,
      imageUrl: fallbackImage,
      startDate: activeTripRaw.start_date || "",
      endDate: activeTripRaw.end_date || "",
      budget: formatBudget(activeTripRaw.budget, activeTripRaw.currency || "EUR"),
      localBudget: formatLocalBudget(activeTripRaw.budget),
    };
    
    console.log("[Index] Deploy Debug - ActiveTrip formatado:", activeTrip);
  } else {
    console.log("[Index] Deploy Debug - Não criando activeTrip - usuário guest ou sem viagem");
  }

  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      {isGuestSession && <GuestLoginButton />}
      {/* Header */}
      <HomeHeader user={{ name: userName, avatarUrl }} />
      <main className="max-w-md mx-auto w-full px-0 pb-8">
        {loading || tripLoading || isLoading ? (
          <div className="h-32 flex items-center justify-center text-[#E76F51] text-lg font-medium">
            Carregando informações...
          </div>
        ) : (
          <>
            <div className="h-8 md:h-12" />
            <ActiveTripSection
              hasActiveTrip={!!activeTrip}
              activeTrip={activeTrip}
              onShowDetails={isGuestSession ? () => showGuestBlockedToast() : undefined}
            />
            <div className="h-4" />

            {/* Só mostrar HomeTripSummaryCard se há viagem ativa real */}
            {activeTrip && (
              <div className="px-4">
                <HomeTripSummaryCard activeTrip={activeTrip} />
              </div>
            )}

            {/* Descoberta — padrão genérico */}
            <DiscoverySectionWrapper />

            <div className="px-5 mb-2">
              <div className="bg-[#dadada20] border border-[#E76F51]/5 rounded-lg px-4 py-2 mt-2 text-[#6D4530] text-xs font-inter shadow-sm">
                ✨ Em breve: locais recomendados pela IA conforme seu perfil e localização.
              </div>
            </div>
            <div className="h-6" />

            <div className="px-4">
              <HomeCommunityCard />
            </div>
            <div className="h-3" />

            {/* Upcoming Trips should render at the bottom, below community/news */}
            <UpcomingTripsSlider />

            <div className="h-3" />
            <ConciergeSection />
            <div className="px-5 mb-2">
              <div className="bg-[#e76f5115] border border-[#E76F51]/20 rounded-lg px-4 py-2 mt-2 text-[#AD4F36] text-xs font-inter shadow-sm">
                🎯 DICA: O Concierge utiliza IA para sugerir ações inteligentes, baseadas no contexto da sua viagem.
              </div>
            </div>
            <div className="h-4" />
          </>
        )}
      </main>
    </div>
  );
};
export default Index;
