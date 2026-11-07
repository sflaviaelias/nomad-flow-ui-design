import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ConfirmEmailPage() {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const attempt = useRef<Promise<boolean>>();
  useEffect(() => {
    let active = true;
    attempt.current ??= (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      if (url.searchParams.has("error") || hash.has("error")) return false;
      const { data, error } = await supabase.auth.getSession();
      if (data.session) return true; // O SDK já processou o retorno implícito/PKCE.
      if (error) return false;
      const code = url.searchParams.get("code");
      if (!code) return false;
      const result = await supabase.auth.exchangeCodeForSession(code);
      return !result.error && !!result.data.session;
    })().catch(() => false);
    attempt.current.then((confirmed) => {
      // Remove tokens/códigos da barra de endereço sem registrá-los em logs.
      window.history.replaceState(null, "", window.location.pathname);
      if (active) setState(confirmed ? "ready" : "error");
    });
    return () => { active = false; };
  }, []);
  return <main className="max-w-md mx-auto p-6 space-y-4">
    <h1 className="text-xl font-semibold">Confirmação de e-mail</h1>
    {state === "loading" ? <p role="status">Validando seu link...</p>
      : state === "ready" ? <><p>E-mail confirmado. Sua sessão está ativa.</p><Link to="/trips">Acessar minhas viagens</Link></>
      : <p role="alert">Não foi possível validar o link. Ele pode ter expirado ou já ter sido usado. Se já confirmou seu e-mail, entre com sua senha.</p>}
    <Link className="block underline" to="/auth/login">Entrar com e-mail e senha</Link>
  </main>;
}
