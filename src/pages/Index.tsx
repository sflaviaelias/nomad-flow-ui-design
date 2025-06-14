
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
import { supabase } from "@/integrations/supabase/client";

// Dummy data: in real app, replace with actual data and hooks.
const userFallback = {
  name: "Viajante",
  avatarUrl:
    "https://ui-avatars.com/api/?background=E76F51&color=fff&size=128&name=Viajante"
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

const Index = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      {/* Header */}
      <HomeHeader user={{ name: userName, avatarUrl }} />
      <main className="max-w-md mx-auto w-full px-0 pb-8">
        {loading ? (
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
            {/* Botão “Adicionar nova viagem” abaixo das próximas viagens */}
            <HomeAddTripButton />
            <div className="h-6" />

            {/* Concierge IA Proativo */}
            <ConciergeSection />
            <div className="h-6" />

            {/* Descoberta Local personalizada */}
            <DiscoverySectionWrapper />
            <div className="h-6" />

            {/* Card Comunidade Inteligente */}
            <HomeCommunityCard />
            {/* Card Resumo Inteligente da Viagem */}
            <HomeTripSummaryCard />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
