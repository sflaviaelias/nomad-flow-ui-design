
import React from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fallbackTags = [
  "Viajante Econômico",
  "Trabalhador Remoto",
  "Explorador Cultural",
];

export default function ProfileScreen() {
  const { user, signOut } = useSupabaseAuth();
  const navigate = useNavigate();

  // Placeholder user info
  const profile = {
    name: user?.user_metadata?.name || "Nome não informado",
    email: user?.email || "",
    avatar_url: user?.user_metadata?.avatar_url ?? null,
    nationality: "Brasil",
    country_residence: "Brasil",
    currency: "BRL",
    languages: ["Português", "Inglês"],
    travel_tags: fallbackTags, // Simular vazio para fallback
    ai_assistant: true,
    provider: user?.app_metadata?.provider,
    countries_visited: 6,
    complete: true,
  };

  const isGoogleSSO = profile.provider === "google";
  const hasTags = profile.travel_tags && profile.travel_tags.length > 0;
  const isIncomplete = !profile.name || !profile.nationality || !profile.country_residence;

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
              <dd className="font-normal text-terra-900">{profile.nationality}</dd>
              <dt className="font-medium leading-tight">Residência</dt>
              <dd className="font-normal text-terra-900">{profile.country_residence}</dd>
              <dt className="font-medium leading-tight">Moeda</dt>
              <dd className="font-normal text-terra-900">{profile.currency}</dd>
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
              <span className="ml-1 text-terra-900">{profile.languages.join(", ")}</span>
            </div>
            <div className="mb-2 flex flex-col">
              <span className="font-medium text-terra-800 text-[15px] mb-1" style={{ fontFamily: "Inter" }}>Estilo de viagem:</span>
              <div className="flex flex-wrap gap-2">
                {hasTags ? (
                  profile.travel_tags.map((tag) => (
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
                  profile.ai_assistant
                    ? "bg-terra-600 text-white"
                    : "bg-[#DADADA] text-terra-900"
                }`}
                style={{ fontFamily: "Inter" }}
              >
                {profile.ai_assistant ? "Ativado" : "Desativado"}
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
