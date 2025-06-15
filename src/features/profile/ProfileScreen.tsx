
import React, { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LogOut, Edit2, Lock, Mail, Globe, Calendar, User, Bell, Shield, Languages, DollarSign, MapPin, Camera, CheckCircle, ArrowRight } from "lucide-react";

export default function ProfileScreen() {
  const { user, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  // Informações mock para exibir na tela. (em app real, trazer do Supabase)
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.name || user.email?.split("@")[0] || "",
        email: user.email || "",
        avatar_url: user.user_metadata?.avatar_url || "",
        country: "Brasil",
        currency: "BRL",
        language: "Português",
        birthdate: "1996-06-15",
        gender: "Feminino",
        notifications: true,
        privacy: true,
        sso_google: true,
      });
    }
  }, [user]);

  // Preferências de tema (localStorage)
  const [theme, setTheme] = useState<"light"|"dark">(
    (localStorage.getItem("theme") as "light"|"dark") || "light"
  );
  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF3EC] text-terra-700">
        <User size={48} className="mb-2" />
        <h2 className="font-semibold text-lg mb-2">Faça login para visualizar seu perfil</h2>
        <Button
          variant="default"
          className="bg-terra-600 text-white mt-2"
          onClick={() => navigate("/auth/access")}
        >Entrar / Criar conta</Button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF3EC] min-h-screen pb-12">
      {/* Header com opção de voltar para Home */}
      <PageHeader title="Perfil" showBack />

      <main className="max-w-md mx-auto w-full px-4 pt-3 pb-8 flex flex-col font-sans">
        {/* Avatar, nome e email */}
        <section className="flex flex-col items-center mt-1 mb-5">
          <ProfileAvatar
            avatarUrl={profile?.avatar_url}
            editable
            name={profile?.name || ""}
            onChange={() => {/* mock: no-op */}}
          />
          <h1 className="mt-3 font-bold text-[1.55rem] md:text-2xl text-terra-700 text-center font-inter">
            {profile?.name || "Nome"}
          </h1>
          <div className="text-base text-terra-600/70 mt-1 text-center font-inter">
            {profile?.email || "E-mail"}
          </div>
          <Button
            className="mt-3 w-full max-w-[230px] bg-[#E76F51] hover:bg-[#C9583C] text-white font-semibold tracking-wide min-h-[44px]"
            style={{ borderRadius: 10, fontFamily: "Inter" }}
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
              <span className="ml-auto text-sm">{profile?.country || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="text-terra-600" size={18} />
              <span className="text-sm text-terra-900/80 font-medium">Moeda:</span>
              <span className="ml-auto text-sm">{profile?.currency || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Languages className="text-terra-600" size={18} />
              <span className="text-sm text-terra-900/80 font-medium">Idioma:</span>
              <span className="ml-auto text-sm">{profile?.language || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-terra-600" size={17} />
              <span className="text-sm text-terra-900/80 font-medium">Nascimento:</span>
              <span className="ml-auto text-sm">{profile?.birthdate || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="text-terra-600" size={17} />
              <span className="text-sm text-terra-900/80 font-medium">Gênero:</span>
              <span className="ml-auto text-sm">{profile?.gender || "-"}</span>
            </div>
          </CardContent>
        </Card>

        {/* CARD - Preferências */}
        <Card className="mb-5 bg-white/80 border-none rounded-lg shadow-soft">
          <CardContent className="py-4 px-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {theme === "dark"
                ? <Moon className="text-terra-600" size={19} />
                : <Sun className="text-terra-600" size={19} />}
              <div className="flex-1">
                <span className="text-sm font-medium">Tema: {theme === "dark" ? "Escuro" : "Claro"}</span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={handleThemeToggle}
                aria-label="Alternar tema claro/escuro"
              />
            </div>
            <div className="flex items-center gap-3">
              <Bell className="text-terra-600" size={18} />
              <span className="text-sm font-medium flex-1">Notificações</span>
              <Switch checked={profile?.notifications} aria-label="Notificações" disabled />
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-terra-600" size={16} />
              <span className="text-sm font-medium flex-1">Compartilhar localização</span>
              <Switch checked={profile?.privacy} aria-label="Privacidade" disabled />
            </div>
          </CardContent>
        </Card>

        {/* CARD - Segurança */}
        <Card className="mb-5 bg-white/80 border-none rounded-lg shadow-soft">
          <CardContent className="py-4 px-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Lock className="text-terra-600" size={18} />
              <span className="text-sm font-medium flex-1">Alterar senha</span>
              <Button size="sm" variant="ghost" className="text-terra-700 font-semibold px-2" style={{ fontFamily: "Inter" }} disabled>
                Gerenciar
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-terra-600" size={17} />
              <span className="text-sm font-medium flex-1">Google (SSO)</span>
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-xs text-terra-700/80 ml-1">
                {profile?.sso_google ? "Conectado" : "Desconectado"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Sair da conta */}
        <Button
          type="button"
          variant="ghost"
          className="w-full text-terra-700 bg-transparent hover:underline font-semibold min-h-[44px] hover:bg-terra-600/10 mb-2"
          style={{ fontFamily: "Inter" }}
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

/// Avatar reutilizável - mock editável
function Moon(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 0 1 12.21 3a7 7 0 1 0 8.79 9.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function Sun(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }

