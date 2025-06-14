import React, { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";

// Import the refactored components
import { ProfileLoginPrompt } from "./ProfileLoginPrompt";
import { ProfileNotFoundPrompt } from "./ProfileNotFoundPrompt";
import { ProfileInfoCard } from "./ProfileInfoCard";
import { ProfilePreferencesCard } from "./ProfilePreferencesCard";
import { AccountActionsCard } from "./AccountActionsCard";

const fallbackTags = [
  "Viajante Econômico",
  "Trabalhador Remoto",
  "Explorador Cultural",
];

export default function ProfileScreen() {
  const { user, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Buscar perfil atualizado do banco
  async function fetchProfile() {
    if (!user?.id) return setLoading(false); // Evita loading infinito se usuário não logado
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
    // Refetch ao voltar do editar, se necessário
    if (window.history.state && "refresh" in window.history.state) {
      fetchProfile();
      window.history.replaceState({}, document.title); // limpa o refresh
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-screen text-lg">
        Carregando...
      </div>
    );
  }

  // Caso não haja usuário logado
  if (!user) {
    return <ProfileLoginPrompt />;
  }

  // Caso usuário autenticado mas perfil não encontrado
  if (!profile) {
    return <ProfileNotFoundPrompt />;
  }

  // Extrai as preferências e outros dados
  const preferences = profile.preferences || {};

  return (
    <div className="bg-[#FAF3EC] min-h-screen px-4 pt-2 pb-8 flex flex-col font-sans">
      {/* Cabeçalho padrão interno */}
      <PageHeader title="Perfil" showBack />

      {/* Avatar */}
      <div className="mb-5 flex flex-col items-center">
        <ProfileAvatar
          avatarUrl={profile.avatar_url}
          name={profile.name}
          editable={false}
        />
      </div>

      {!profile.complete && (
        <div className="my-4 bg-terra-600/10 text-terra-900 p-3 rounded-lg text-sm text-center" style={{ fontFamily: "Inter" }}>
          Complete seu perfil para desbloquear recomendações inteligentes de viagem.
        </div>
      )}

      <div className="space-y-8">
        <ProfileInfoCard profile={profile} />
        <ProfilePreferencesCard preferences={preferences} />

        {/* Países visitados */}
        <div className="flex justify-between items-center px-1 mt-1">
          <span className="text-terra-900 font-medium text-base" style={{ fontFamily: "Inter" }}>
            {profile.countries_visited}{" "}
            <span className="text-sm font-normal text-terra-700">
              {profile.countries_visited === 1 ? "país visitado" : "países visitados"}
            </span>
          </span>
          <span className="text-terra-800 text-sm font-medium" style={{ fontFamily: "Inter" }}>
            Que jornada incrível! 🌍
          </span>
        </div>

        <AccountActionsCard />
      </div>
    </div>
  );
}
