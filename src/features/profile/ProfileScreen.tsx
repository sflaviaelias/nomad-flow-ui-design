
import React from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";
import { toast } from "@/hooks/use-toast";

const fallbackTags = [
  "Viajante Econômico",
  "Trabalhador Remoto",
  "Explorador Cultural",
];

export default function ProfileScreen() {
  const { user, signOut } = useSupabaseAuth();
  const navigate = useNavigate();

  // Placeholder user info; replace with fetched supabase user profile
  const profile = {
    name: user?.user_metadata?.name || "Nome não informado",
    email: user?.email || "",
    avatar_url: user?.user_metadata?.avatar_url ?? null,
    nationality: "Brasil",
    country_residence: "Brasil",
    currency: "BRL",
    languages: ["Português", "Inglês"],
    travel_tags: fallbackTags,
    ai_assistant: true,
    provider: user?.app_metadata?.provider,
    countries_visited: 6,
    complete: true,
  };

  const isGoogleSSO = profile.provider === "google";

  const isIncomplete = !profile.name || !profile.nationality || !profile.country_residence;
  return (
    <div className="bg-background min-h-screen p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-bold text-xl text-terra-800" style={{ fontFamily: "Inter" }}>
          Perfil
        </h1>
        <Button
          variant="outline"
          className="text-terra-700 border-terra-700 px-3 font-medium"
          onClick={() => navigate("/profile/edit")}
          aria-label="Editar perfil"
        >
          Editar
          <User className="ml-2" size={18}/>
        </Button>
      </div>
      <ProfileAvatar avatarUrl={profile.avatar_url} name={profile.name} editable={false} />
      {!profile.complete && (
        <div className="my-4 bg-terra-600/10 text-terra-900 p-3 rounded-lg text-sm">
          Complete seu perfil para desbloquear recomendações inteligentes de viagem.
        </div>
      )}
      <div className="mt-5 space-y-5">
        {/* Personal Info */}
        <div className="bg-card rounded-lg shadow-soft p-4">
          <div className="font-semibold text-terra-900 mb-2">Informações Pessoais</div>
          <div className="grid grid-cols-[2.5rem_1fr] items-center gap-2 text-sm">
            <span className="font-medium text-terra-800">Nome</span>
            <span className="">{profile.name}</span>
            <span className="font-medium text-terra-800">E-mail</span>
            <span className="">{profile.email}</span>
            <span className="font-medium text-terra-800">Nacionalidade</span>
            <span className="">{profile.nationality}</span>
            <span className="font-medium text-terra-800">Residência</span>
            <span className="">{profile.country_residence}</span>
            <span className="font-medium text-terra-800">Moeda</span>
            <span className="">{profile.currency}</span>
          </div>
        </div>
        {/* Preferences */}
        <div className="bg-card rounded-lg shadow-soft p-4">
          <div className="font-semibold text-terra-900 mb-2">Preferências</div>
          <div className="text-sm mb-2">
            <span className="font-medium text-terra-800">Idiomas: </span>
            {profile.languages.join(", ")}
          </div>
          <div className="mb-2">
            <span className="font-medium text-terra-800">Estilo de viagem:</span>
            <div className="flex flex-wrap mt-1 gap-1">
              {profile.travel_tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-terra-600/90 text-white rounded-full px-3 py-1 text-xs mr-1 mb-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-terra-800">Assistente IA:</span>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                profile.ai_assistant
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {profile.ai_assistant ? "Ativado" : "Desativado"}
            </span>
          </div>
        </div>
        <div className="flex justify-between px-1">
          <div>
            <span className="text-terra-900 font-medium text-base">
              {profile.countries_visited}
            </span>
            <span className="ml-1 text-sm text-neutral-500">
              países visitados
            </span>
          </div>
          {/* Optional enhancements would go here */}
        </div>
        {/* Account Actions */}
        <div className="mt-6 bg-card rounded-lg shadow-soft p-4 flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={async () => {
              await signOut();
              toast({ title: "Sessão encerrada", description: "Você saiu da conta com sucesso." });
              navigate("/auth/access");
            }}
          >
            <LogOut className="mr-2" size={18}/> Sair da Conta
          </Button>
          <Button
            variant="ghost"
            className="w-full text-red-500 mt-1"
            onClick={() => toast({ title:"Função indisponível no momento"})}
          >
            Excluir Conta
          </Button>
        </div>
      </div>
    </div>
  );
}
