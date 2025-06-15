
import { useEffect } from "react";
import i18n from "@/i18n/config";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { LanguageCode } from "@/features/profile/LanguageSelect";

export function useAppLanguage(current: LanguageCode) {
  const { user } = useSupabaseAuth();

  // Atualiza i18n ao alterar o idioma escolhido
  useEffect(() => {
    i18n.changeLanguage(current);
  }, [current]);

  // Carregar idioma salvo se logado
  useEffect(() => {
    if (user?.id && !current) {
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
          if (prefs.language) {
            i18n.changeLanguage(prefs.language);
          }
        });
    }
  }, [user?.id, current]);

  return null;
}
