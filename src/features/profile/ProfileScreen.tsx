
import React from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Edit2, Lock, Mail, Globe, Calendar, User, CheckCircle, ArrowRight, MapPin, DollarSign, Languages } from "lucide-react";

export default function ProfileScreen() {
  const { user, loading, signOut } = useSupabaseAuth();
  const navigate = useNavigate();

  // Profile real — só usa user do Supabase
  const profile = React.useMemo(() => {
    if (!user) return null;
    const { user_metadata = {}, email, app_metadata = {} } = user;
    return {
      name: user_metadata?.name || email?.split("@")[0] || "",
      email: email || "",
      avatar_url: user_metadata?.avatar_url || "",
      country: user_metadata?.country || "Não informado",
      currency: user_metadata?.currency || "BRL",
      language: user_metadata?.language || "Português",
      birthdate: user_metadata?.birthdate || "",
      gender: user_metadata?.gender || "",
      sso_google: app_metadata?.provider === "google",
    };
  }, [user]);

  // Loading state melhorado
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF3EC] text-terra-700">
        <span className="animate-pulse text-lg">Carregando...</span>
      </div>
    );
  }

  // Guest view: pede login de verdade
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF3EC] text-terra-700">
        <User size={48} className="mb-2" />
        <h2 className="font-semibold text-lg mb-2">Faça login para visualizar seu perfil</h2>
        <Button
          variant="default"
          className="bg-terra-600 text-white mt-2 min-h-[44px] font-inter"
          onClick={() => navigate("/auth/access")}
        >Entrar / Criar conta</Button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF3EC] min-h-screen pb-10">
      {/* Header com opção de voltar para Home */}
      <PageHeader title="Perfil" showBack />

      <main className="max-w-md mx-auto w-full px-4 pt-3 pb-8 flex flex-col font-sans">
        {/* Avatar, nome e email */}
        <section className="flex flex-col items-center mt-2 mb-5">
          <ProfileAvatar
            avatarUrl={profile.avatar_url}
            editable
            name={profile.name}
            onChange={() => {/* no-op for now */}}
          />
          <h1 className="mt-3 font-bold text-[1.45rem] md:text-2xl text-terra-700 text-center font-inter">
            {profile.name || "Nome"}
          </h1>
          <div className="text-base text-terra-600/70 mt-1 text-center font-inter">
            {profile.email || "E-mail"}
          </div>
          <Button
            className="mt-3 w-full max-w-[230px] bg-[#E76F51] hover:bg-[#C9583C] text-white font-semibold tracking-wide min-h-[44px] rounded-[10px] font-inter"
            onClick={() => navigate("/profile/edit")}
          >
            <Edit2 className="mr-2" size={18} /> Editar Perfil
          </Button>
        </section>

        {/* CARD - Informações do Perfil */}
        <Card className="mb-5 bg-white/80 border-none rounded-lg shadow-soft">
          <CardContent className="py-4 px-5 grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3">
              <MapPin className="text-terra-600" size={19} />
              <span className="text-sm text-terra-900/80 font-medium">Nacionalidade:</span>
              <span className="ml-auto text-sm">{profile.country || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="text-terra-600" size={18} />
              <span className="text-sm text-terra-900/80 font-medium">Moeda:</span>
              <span className="ml-auto text-sm">{profile.currency || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Languages className="text-terra-600" size={18} />
              <span className="text-sm text-terra-900/80 font-medium">Idioma:</span>
              <span className="ml-auto text-sm">{profile.language || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-terra-600" size={17} />
              <span className="text-sm text-terra-900/80 font-medium">Nascimento:</span>
              <span className="ml-auto text-sm">{profile.birthdate || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="text-terra-600" size={17} />
              <span className="text-sm text-terra-900/80 font-medium">Gênero:</span>
              <span className="ml-auto text-sm">{profile.gender || "-"}</span>
            </div>
          </CardContent>
        </Card>

        {/* CARD - Segurança */}
        <Card className="mb-3 bg-white/80 border-none rounded-lg shadow-soft">
          <CardContent className="py-4 px-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Lock className="text-terra-600" size={18} />
              <span className="text-sm font-medium flex-1">Alterar senha</span>
              <Button size="sm" variant="ghost" className="text-terra-700 font-semibold px-2 cursor-not-allowed font-inter" disabled>
                Gerenciar
              </Button>
            </div>
            {/* Exibe SSO Google apenas se conectado */}
            {profile.sso_google && (
              <div className="flex items-center gap-3">
                <Mail className="text-terra-600" size={17} />
                <span className="text-sm font-medium flex-1">Google (SSO)</span>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-xs text-terra-700/80 ml-1">
                  Conectado
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sair da conta */}
        <Button
          type="button"
          variant="ghost"
          className="w-full text-terra-700 bg-transparent hover:underline font-semibold min-h-[44px] hover:bg-terra-600/10 mb-2 font-inter"
          onClick={async () => {
            await signOut?.();
            navigate("/auth/access");
          }}
        >
          <LogOut className="mr-2" size={18} /> Sair da Conta
        </Button>
      </main>
    </div>
  );
}
