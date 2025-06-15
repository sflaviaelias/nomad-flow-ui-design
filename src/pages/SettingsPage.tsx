import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, LanguageCode } from "@/features/profile/LanguageSelect";
import { useTranslation } from "react-i18next";
import { useAppLanguage } from "@/hooks/useAppLanguage";

// Idioma padrão pelo browser
function getDefaultLanguage(): LanguageCode {
  const nav = typeof navigator !== "undefined" ? navigator.language : "";
  if (nav.startsWith("pt")) return "pt-BR";
  if (nav.startsWith("es")) return "es-ES";
  if (nav.startsWith("en")) return "en-US";
  return "pt-BR";
}

export default function SettingsPage() {
  const { user } = useSupabaseAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = React.useState<boolean>(true);
  const [location, setLocation] = React.useState<boolean>(false);
  const [loadingLocation, setLoadingLocation] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);

  // Novo: idioma do app
  const [appLanguage, setAppLanguage] = React.useState<LanguageCode>(getDefaultLanguage());
  useAppLanguage(appLanguage);

  React.useEffect(() => {
    // Carregar configuração de idioma ao abrir se logado
    if (user?.id) {
      supabase
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!data?.preferences) return;
          let prefs: any = {};
          if (typeof data.preferences === "object" && data.preferences !== null) prefs = data.preferences;
          else if (typeof data.preferences === "string") {
            try { prefs = JSON.parse(data.preferences); } catch { prefs = {}; }
          }
          if (prefs.language) setAppLanguage(prefs.language);
          if ("location_enabled" in prefs) setLocation(Boolean(prefs.location_enabled));
        });
    }
  }, [user?.id]);

  const handleLanguageChange = async (newLang: LanguageCode) => {
    setAppLanguage(newLang);
    if (!user?.id) return;
    setSaving(true);
    // Atualiza no Supabase (preferences.language)
    const { data, error } = await supabase
      .from("profiles")
      .select("preferences")
      .eq("id", user.id)
      .maybeSingle();
    let prefs: any = {};
    if (data?.preferences) {
      if (typeof data.preferences === "object") { prefs = data.preferences; }
      else if (typeof data.preferences === "string") {
        try { prefs = JSON.parse(data.preferences); } catch { prefs = {}; }
      }
    }
    const updatedPrefs = { ...prefs, language: newLang };
    await supabase
      .from("profiles")
      .update({ preferences: updatedPrefs })
      .eq("id", user.id);
    setSaving(false);
    toast({
      title: "Idioma atualizado com sucesso",
      description: "A interface será ajustada conforme o idioma escolhido.",
      variant: "default"
    });
    // TODO: disparar troca real do idioma na aplicação (i18n).
  };

  const handleLocationToggle = async (checked: boolean) => {
    if (!user?.id) {
      setLocation(checked);
      return;
    }
    setLoadingLocation(true);

    // Atualiza local semântica/local state otimista
    setLocation(checked);

    // Consulta e atualiza preferências
    const { data } = await supabase
      .from("profiles")
      .select("preferences")
      .eq("id", user.id)
      .maybeSingle();

    let prefs: any = {};
    if (data?.preferences) {
      if (typeof data.preferences === "object") { prefs = data.preferences; }
      else if (typeof data.preferences === "string") {
        try { prefs = JSON.parse(data.preferences); } catch { prefs = {}; }
      }
    }
    // Persiste permissão no campo "location_enabled"
    const updatedPrefs = { ...prefs, location_enabled: checked };

    await supabase
      .from("profiles")
      .update({ preferences: updatedPrefs })
      .eq("id", user.id);

    setLoadingLocation(false);

    // Exibe toast de acordo com a ação
    if (checked) {
      if (!navigator.geolocation) {
        toast({
          title: "Ops!",
          description: "Seu dispositivo não suporta localização.",
          variant: "destructive",
        });
        setLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          toast({
            title: "Localização ativada!",
            description: "Agora o Go Nomad pode sugerir lugares perto de você.",
            variant: "default",
          });
        },
        () => {
          toast({
            title: "Permissão negada",
            description:
              "Não foi possível acessar sua localização. Ative nas permissões do navegador se desejar utilizar este recurso.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Localização desativada",
        description: "Você poderá ativar novamente sempre que quiser.",
        variant: "default",
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso!",
    });
  };

  return (
    <main className="flex flex-col min-h-screen bg-background font-inter">
      {/* Cabeçalho */}
      <div className="w-full flex flex-col items-center justify-center pt-8 pb-3 bg-[#FCF7F4] shadow-soft">
        <span className="mb-2 rounded-full p-2 bg-[#E76F51]/10 flex items-center">
          <Bell size={30} className="text-terra-600" />
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-terra-800">
          {t("app_settings")}
        </h1>
      </div>
      {/* Conteúdo Scrollable */}
      <form
        onSubmit={handleSave}
        className="flex-1 w-full max-w-xl mx-auto px-5 py-7 flex flex-col gap-6"
        style={{ minHeight: 0 }}
        id="form-settings"
      >
        {/* Seletor de idioma */}
        <div className="bg-white rounded-xl px-4 py-5 shadow-card flex items-center">
          <div className="flex-1 flex flex-col">
            <LanguageSelect value={appLanguage} onChange={handleLanguageChange} disabled={saving} label={t("language_app")} />
          </div>
        </div>

        <Separator className="my-1 bg-[#dadada]" />

        {/* Notificações */}
        <div className="bg-white rounded-xl px-4 py-5 shadow-card flex items-center">
          <div className="flex-1 flex flex-col">
            <span className="font-medium text-base text-terra-900">
              {t("notifications_label")}
            </span>
            <span className="text-sm text-neutral-500">{t("notifications_desc")}</span>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
            id="toggle-notifications"
            aria-label={t("notifications_label")}
            className="ml-2 data-[state=checked]:bg-[#E76F51] data-[state=checked]:border-[#E76F51]"
          />
        </div>

        <Separator className="my-1 bg-[#dadada]" />

        {/* Localização */}
        <div className="bg-white rounded-xl px-4 py-5 shadow-card flex items-center">
          <div className="flex-1 flex flex-col">
            <span className="font-medium text-base text-terra-900">
              {t("location_label")}
            </span>
            <span className="text-sm text-neutral-500">
              {t("location_desc")}
            </span>
          </div>
          <Switch
            checked={location}
            onCheckedChange={handleLocationToggle}
            id="toggle-location"
            aria-label={t("location_label")}
            disabled={loadingLocation}
            className={`ml-2 data-[state=checked]:bg-[#E76F51] data-[state=checked]:border-[#E76F51] ${
              loadingLocation ? "opacity-50 pointer-events-none cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* Espaço extra para garantir visualização do botão fixo */}
        <div className="h-32" />
      </form>
      {/* Botão Fixo */}
      <div className="fixed left-0 right-0 bottom-0 bg-background/95 border-t border-[#E76F51]/10 px-6 py-5 flex justify-center z-50 shadow-soft">
        <Button
          type="submit"
          form="form-settings"
          className="w-full max-w-xl text-white bg-terra-600 hover:bg-terra-700 font-semibold py-3 rounded-lg shadow-xl"
          size="lg"
          disabled={saving}
        >
          {t("save_changes")}
        </Button>
      </div>
    </main>
  );
}
