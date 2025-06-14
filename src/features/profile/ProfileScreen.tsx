
import React, { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";
import PageHeader from "@/components/PageHeader";
import { ProfileLoginPrompt } from "./ProfileLoginPrompt";
import { ProfileNotFoundPrompt } from "./ProfileNotFoundPrompt";
import { ProfileInfoCard } from "./ProfileInfoCard";
import { ProfilePreferencesCard } from "./ProfilePreferencesCard";
import { AccountActionsCard } from "./AccountActionsCard";
import { ProfileTripCountCard } from "./ProfileTripCountCard";
import { supabase } from "@/integrations/supabase/client";

export default function ProfileScreen() {
  const { user, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Buscar perfil atualizado do banco
  async function fetchProfile() {
    if (!user?.id) return setLoading(false);
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchProfile();
    if (window.history.state && "refresh" in window.history.state) {
      fetchProfile();
      window.history.replaceState({}, document.title);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-screen text-lg">
        Carregando...
      </div>
    );
  }
  if (!user) return <ProfileLoginPrompt />;
  if (!profile) return <ProfileNotFoundPrompt />;

  const preferences = profile.preferences || {};
  const tripCount = profile.countries_visited || 0; // ou utilize trips cadastradas

  return (
    <div className="bg-[#FAF3EC] min-h-screen px-4 pt-2 pb-8 flex flex-col font-sans">
      <PageHeader title="Perfil" showBack />
      <div className="mb-3 flex flex-col items-center">
        <ProfileAvatar
          avatarUrl={profile.avatar_url}
          name={profile.name}
          editable={false}
        />
        {/* Contador visual de viagens */}
        <ProfileTripCountCard count={tripCount} />
      </div>

      {!profile.complete && (
        <div className="my-4 bg-terra-600/10 text-terra-900 p-3 rounded-lg text-sm text-center" style={{ fontFamily: "Inter" }}>
          Complete seu perfil para desbloquear recomendações inteligentes de viagem.
        </div>
      )}

      <div className="space-y-8">
        <ProfileInfoCard profile={profile} />
        <ProfilePreferencesCard preferences={preferences} />
        <AccountActionsCard />
      </div>
    </div>
  );
}
