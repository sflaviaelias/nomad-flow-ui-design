
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
import HomeHeader from "../components/HomeHeader";
import { ActiveTripSection } from "../components/ActiveTripSection";
import { ConciergeSection } from "../components/ConciergeSection";
import { DiscoverySectionWrapper } from "../components/DiscoverySectionWrapper";
import { UpcomingTripsSection } from "../components/UpcomingTripsSection";

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
      <HomeHeader user={{ name: userName, avatarUrl }} />

      <main className="max-w-md mx-auto w-full px-0 pb-10">
        {/* Loading indicator */}
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
            <div className="h-12" />
            <ConciergeSection />
            <div className="h-12" />
            <DiscoverySectionWrapper />
            <div className="h-12" />
            <UpcomingTripsSection />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
