import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./auth-context";
import { AUTH_STORAGE_KEY, clearLocalAuth, supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function AuthProvider({ children }: { children: ReactNode }) {
  const cache = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const identity = useRef<string | null>(null);
  const signingOut = useRef(false);
  const acceptSession = useCallback((next: Session | null) => {
    if (signingOut.current && next) return;
    const nextId = next?.user.id ?? null;
    if (identity.current !== nextId) { void cache.cancelQueries(); cache.clear(); }
    identity.current = nextId;
    setSession(next);
    setLoading(false);
  }, [cache]);
  useEffect(() => {
    let active = true;
    let eventReceived = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      eventReceived = true;
      if (event === "SIGNED_OUT") clearLocalAuth();
      setError(null);
      acceptSession(next);
    });
    const storageChanged = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEY && event.newValue === null) {
        eventReceived = true;
        clearLocalAuth();
        acceptSession(null);
      }
    };
    window.addEventListener("storage", storageChanged);
    supabase.auth.getSession().then(({ data, error: failure }) => {
      if (!active || eventReceived) return;
      if (failure) setError("Não foi possível recuperar sua sessão. Tente novamente.");
      acceptSession(failure ? null : data.session);
    }).catch(() => {
      if (!active || eventReceived) return;
      setError("Não foi possível recuperar sua sessão. Tente novamente.");
      acceptSession(null);
    });
    return () => { active = false; subscription.unsubscribe(); window.removeEventListener("storage", storageChanged); };
  }, [acceptSession]);
  const signOut = useCallback(async () => {
    if (signingOut.current) return;
    signingOut.current = true;
    acceptSession(null);
    setLoading(true);
    void cache.cancelQueries();
    cache.clear();
    try {
      const { error: failure } = await supabase.auth.signOut({ scope: "local" });
      if (failure) throw failure;
    } catch {
      toast({ title: "Sessão local encerrada", description: "Não foi possível confirmar a revogação no servidor. Seus dados locais foram removidos." });
    } finally {
      clearLocalAuth();
      setError(null);
      signingOut.current = false;
      setLoading(false);
    }
  }, [acceptSession, cache]);
  return <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, error, signOut }}>
    <Fragment key={session?.user.id ?? "guest"}>{children}</Fragment>
  </AuthContext.Provider>;
}
