
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSupabaseAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listener ANTES de buscar session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // LOG: print eventos de autenticação para debug detalhado
      console.log("[useSupabaseAuth] Evento de Autenticação:", event, session);
      if (session?.user) {
        // log ok para acompanhamento
        console.log("[useSupabaseAuth] Usuário autenticado:", session.user.email);
      }
      if (!session) {
        console.log("[useSupabaseAuth] Usuário fez logout ou não existe sessão");
      }
    });

    // 2. Busca session atual
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      // LOG
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
