
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSupabaseAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    // TODO: Não chame nada do supabase aqui, nem fetch extra

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
