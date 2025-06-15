
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

// Dummy data: in real app, replace with actual data and hooks.
const userFallback = {
  name: "Viajante",
  avatarUrl:
    "https://ui-avatars.com/api/?background=E76F51&color=fff&size=128&name=Viajante"
};

const Index = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hook: fetch dynamic active trip
  const { data: activeTrip, isLoading: tripLoading } = useActiveTrip();
  const hasActiveTrip = !!activeTrip;

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
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
      setProfile(data);
      setLoading(false);
    }
    fetchProfile();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });
    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const userName = profile?.name || userFallback.name;
  const avatarUrl =
    profile?.avatar_url && profile.avatar_url !== ""
      ? profile.avatar_url
      : userFallback.avatarUrl;

  // Infos de orçamento/currency mock removidos (tudo dinâmico agora!)

  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      {/* Header */}
      <HomeHeader user={{ name: userName, avatarUrl }} />
      <main className="max-w-md mx-auto w-full px-0 pb-8">
        {loading || tripLoading ? (
          <div className="h-32 flex items-center justify-center text-[#E76F51] text-lg font-medium">
            Carregando informações...
          </div>
        ) : (
          <>
            <div className="h-8 md:h-12" />
            <ActiveTripSection
              hasActiveTrip={hasActiveTrip}
              activeTrip={activeTrip}
            />
            <div className="h-4" />

            <div className="px-4">
              {/* Pass activeTrip here if the summary needs it, or fetch inside HomeTripSummaryCard */}
              <HomeTripSummaryCard activeTrip={activeTrip} />
            </div>
            <UpcomingTripsSlider />
            <div className="h-6" />
            <ConciergeSection />
            <div className="px-5 mb-2">
              <div className="bg-[#e76f5115] border border-[#E76F51]/20 rounded-lg px-4 py-2 mt-2 text-[#AD4F36] text-xs font-inter shadow-sm">
                🎯 DICA: O Concierge utiliza IA para sugerir ações inteligentes, baseadas no contexto da sua viagem.
              </div>
            </div>
            <div className="h-6" />

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
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
