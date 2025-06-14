
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSupabaseAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (event === "SIGNED_IN" && session?.user) {
        createProfileIfNotExists(session.user);
      }
    });

    // Verifica sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session?.user) {
        createProfileIfNotExists(data.session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cria um perfil na tabela `profiles` ao registrar
  const createProfileIfNotExists = useCallback(async (user) => {
    if (!user) return;
    // Tenta inserir apenas se não existe
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

  // Sign Out
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  return { session, user, loading, signOut };
}
