
import { useEffect } from "react";
import i18n from "@/i18n/config";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { LanguageCode } from "@/features/profile/LanguageSelect";

// Mantém a linguagem globalmente consistente para usuário logado e visitor
export function useAppLanguage(current: LanguageCode) {
  const { user } = useSupabaseAuth();

  // Sempre atualiza i18n e localStorage ao alterar linguagem escolhida
  useEffect(() => {
    if (current) {
      i18n.changeLanguage(current);
      localStorage.setItem("language", current); // <- garante persistência global
    }
  }, [current]);

  // Ao logar, tenta carregar idioma salvo no Supabase (preferência do usuário)
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
            localStorage.setItem("language", prefs.language); // <- sincroniza localStorage
          }
        });
    }
  }, [user?.id, current]);

  return null;
}
