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

  // Caso não haja usuário logado, exibe opções amigáveis para login/criar conta
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF3EC] px-4">
        <Card className="w-full max-w-md bg-white rounded-2xl p-8 border-none shadow-soft flex flex-col items-center">
          <ProfileAvatar avatarUrl={null} name={null} editable={false} />
          <h2 className="font-bold text-2xl mt-4 mb-2 text-terra-800 text-center" style={{ fontFamily: "Inter" }}>
            Sessão não iniciada
          </h2>
          <p className="text-terra-700 text-[16px] text-center mb-6" style={{ fontFamily: "Inter" }}>
            Faça login para visualizar seu perfil e personalizar sua experiência no Go Nomad.
          </p>
          <Button
            className="w-full mb-3 min-h-[44px] font-semibold bg-[#E76F51] text-white hover:bg-[#CC5A3D]"
            onClick={() => navigate("/auth/login")}
          >
            Entrar
          </Button>
          <Button
            variant="outline"
            className="w-full min-h-[44px] font-semibold border-[#E76F51] text-[#E76F51] hover:bg-[#E76F51]/10"
            onClick={() => navigate("/auth/access")}
          >
            Criar conta
          </Button>
        </Card>
      </div>
    );
  }

  // Fallback se não encontrar perfil (usuário autenticado)
  if (!profile) {
    return (
      <div className="text-center mt-12 text-terra-800" style={{ fontFamily: "Inter" }}>
        Perfil não encontrado.<br />
        <Button
          className="mt-4 min-h-[44px] font-semibold bg-[#E76F51] text-white hover:bg-[#CC5A3D]"
          onClick={() => navigate("/auth/access")}
        >
          Criar conta
        </Button>
      </div>
    );
  }

  // Extrai tags, nacionalidade e preferências corretamente
  const preferences = profile.preferences || {};
  const travel_tags = preferences.travel_tags ?? fallbackTags;
  const isGoogleSSO = user?.app_metadata?.provider === "google";
  const hasTags = travel_tags && travel_tags.length > 0;
  const isIncomplete = !profile.name || !preferences?.nationality || !preferences?.country_residence;

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
        {/* Informações Pessoais */}
        <Card className="bg-white rounded-xl shadow-soft border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-terra-900 font-semibold text-base" style={{ fontFamily: "Inter" }}>
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-4 pt-0">
            <dl className="grid grid-cols-2 gap-y-2 text-[15px] text-terra-800" style={{ fontFamily: "Inter", wordBreak: "break-word" }}>
              <dt className="font-medium leading-tight">Nome</dt>
              <dd className="font-normal text-terra-900">{profile.name}</dd>
              <dt className="font-medium leading-tight">E-mail</dt>
              <dd className="font-normal text-terra-900">{profile.email}</dd>
              <dt className="font-medium leading-tight">Nacionalidade</dt>
              <dd className="font-normal text-terra-900">{preferences?.nationality}</dd>
              <dt className="font-medium leading-tight">Residência</dt>
              <dd className="font-normal text-terra-900">{profile.country_residence}</dd>
              <dt className="font-medium leading-tight">Moeda</dt>
              <dd className="font-normal text-terra-900">{preferences?.currency}</dd>
            </dl>
          </CardContent>
        </Card>

        {/* Preferências */}
        <Card className="bg-white rounded-xl shadow-soft border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-terra-900 font-semibold text-base" style={{ fontFamily: "Inter" }}>
              Preferências
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-4 pt-0">
            <div className="mb-2">
              <span className="font-medium text-terra-800 text-[15px]" style={{ fontFamily: "Inter" }}>Idiomas:</span>
              <span className="ml-1 text-terra-900">{preferences?.languages?.join(", ")}</span>
            </div>
            <div className="mb-2 flex flex-col">
              <span className="font-medium text-terra-800 text-[15px] mb-1" style={{ fontFamily: "Inter" }}>Estilo de viagem:</span>
              <div className="flex flex-wrap gap-2">
                {hasTags ? (
                  travel_tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-terra-600/90 text-white rounded-full px-3 py-1 text-xs"
                      style={{ fontFamily: "Inter", minHeight: "28px" }}
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-terra-700 text-[14px]" style={{ fontFamily: "Inter" }}>
                    Nenhum estilo favorito selecionado ainda.
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-medium text-terra-800 text-[15px]" style={{ fontFamily: "Inter" }}>
                Assistente IA:
              </span>
              <Badge
                className={`rounded-full px-2 py-0.5 text-xs font-medium border-none min-w-[44px] min-h-[28px] ${
                  preferences?.ai_assistant
                    ? "bg-terra-600 text-white"
                    : "bg-[#DADADA] text-terra-900"
                }`}
                style={{ fontFamily: "Inter" }}
              >
                {preferences?.ai_assistant ? "Ativado" : "Desativado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

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

        {/* Ações de Conta */}
        <Card className="bg-white rounded-xl shadow-soft border-none mt-3">
          <CardContent className="flex flex-col gap-3 p-4">
            <Button
              variant="secondary"
              className="w-full text-terra-600 border-terra-600 bg-[#FAF3EC] hover:bg-terra-600/10 font-semibold text-base min-h-[44px]"
              style={{ fontFamily: "Inter" }}
              onClick={async () => {
                await signOut();
                toast({ title: "Sessão encerrada", description: "Você saiu da conta com sucesso." });
                navigate("/auth/access");
              }}
            >
              <LogOut className="mr-2" size={18} /> Sair da Conta
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-terra-700 bg-transparent hover:underline font-semibold text-base min-h-[44px] hover:bg-terra-600/5"
              style={{ fontFamily: "Inter" }}
              onClick={() => toast({ title: "Função indisponível no momento" })}
            >
              Excluir Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
