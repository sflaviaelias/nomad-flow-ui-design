
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Loader2, Github, Globe, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [variant, setVariant] = useState<"login" | "register" | "forgot">("login");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (variant === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Credenciais inválidas. Tente novamente.");
      } else {
        toast({ title: "Bem-vindo de volta!" });
        navigate("/");
      }
      setLoading(false);
    }

    if (variant === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { name: email.split("@")[0] },
        },
      });
      if (error) {
        setError("Erro ao registrar: " + error.message);
      } else {
        toast({ title: "Cheque seu e-mail para confirmar o cadastro." });
        setVariant("login");
      }
      setLoading(false);
    }

    if (variant === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (error) {
        setError("Falha ao enviar e-mail de recuperação.");
      } else {
        toast({ title: "Verifique sua caixa de entrada." });
        setVariant("login");
      }
      setLoading(false);
    }
  };

  // Social providers
  const handleSocial = async (provider: "google" | "github" | "twitter") => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) setError("Falha ao autenticar com provedor social.");
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Toaster />
      <div className="mx-auto w-full max-w-md bg-white shadow-sm rounded-lg p-8 space-y-5 border border-neutral-100">
        <h1 className="font-bold text-2xl text-center mb-2">
          {variant === "login"
            ? "Acessar sua conta"
            : variant === "register"
            ? "Criar nova conta"
            : "Recuperar senha"}
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={loading}
          />
          {variant !== "forgot" && (
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={variant === "register" ? "new-password" : "current-password"}
              required
              disabled={loading}
            />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full mt-3" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 
            variant === "login"
              ? "Entrar"
              : variant === "register"
              ? "Cadastrar"
              : "Enviar e-mail de recuperação"}
          </Button>
        </form>
        <div className="flex flex-col items-center space-y-2">
          {variant === "login" && (
            <>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setVariant("register")}
                disabled={loading}
              >
                Não possui conta? <span className="ml-1 underline">Cadastrar</span>
              </Button>
              <Button
                variant="link"
                className="w-full text-xs text-neutral-500"
                onClick={() => setVariant("forgot")}
                disabled={loading}
              >
                Esqueceu sua senha?
              </Button>
            </>
          )}
          {variant === "register" && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setVariant("login")}
              disabled={loading}
            >
              Já tem conta? <span className="ml-1 underline">Entrar</span>
            </Button>
          )}
          {variant === "forgot" && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setVariant("login")}
              disabled={loading}
            >
              Voltar ao login
            </Button>
          )}
        </div>
        <div className="w-full flex items-center gap-3 my-2">
          <span className="h-px bg-muted w-full" />
          <span className="text-sm text-muted-foreground">ou</span>
          <span className="h-px bg-muted w-full" />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => handleSocial("google")} disabled={loading}>
            <Globe className="w-5 h-5 mr-1" /> Google
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => handleSocial("github")} disabled={loading}>
            <Github className="w-5 h-5 mr-1" /> GitHub
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => handleSocial("twitter")} disabled={loading}>
            <Twitter className="w-5 h-5 mr-1" /> Twitter
          </Button>
        </div>
      </div>
    </main>
  );
}
