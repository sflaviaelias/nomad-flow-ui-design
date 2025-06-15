
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSupabaseAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sempre inicializa ouvindo eventos, ANTES de buscar sessão atual.
  useEffect(() => {
    // Ouve eventos de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Debug detalhado
      console.log("[useSupabaseAuth] Evento:", event, session);
    });

    // Busca sessão atual salva/localStorage (persistente)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      // Debug inicial
      console.log("[useSupabaseAuth] getSession inicial:", data.session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createProfileIfNotExists = useCallback(async (user) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          name: user.user_metadata?.name || user.email?.split("@")[0],
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          country: null,
          preferences: {},
        },
        { onConflict: "id" }
      );
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  return { session, user, loading, signOut };
}

