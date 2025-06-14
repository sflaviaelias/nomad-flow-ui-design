
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
      {/* Navegação superior com botão voltar */}
      <div className="flex items-center justify-between gap-2 mb-7 mt-2">
        <button
          aria-label="Voltar"
          className="flex-shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-transparent hover:bg-terra-600/10 transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} className="text-terra-700" />
        </button>
        <h1
          className="flex-1 text-center text-[1.45rem] font-bold text-terra-800"
          style={{ fontFamily: "Inter", letterSpacing: "-0.02em", marginLeft: -22 }}
        >
          Perfil
        </h1>
        {/* Editar perfil */}
        <Button
          variant="outline"
          className="flex items-center gap-1.5 text-terra-600 border-terra-600 bg-white px-4 h-11 min-w-[44px] min-h-[44px] font-medium transition hover:bg-terra-600/10"
          style={{ fontFamily: "Inter" }}
          onClick={() => navigate("/profile/edit")}
          aria-label="Editar perfil"
        >
          <User className="mr-1" size={18} />
          Editar
        </Button>
      </div>

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
