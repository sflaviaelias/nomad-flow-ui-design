import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import CountrySelect from "@/components/CountrySelect";
import TravelProfileCheckboxes from "@/features/profile/TravelProfileCheckboxes";
import { Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

function validatePassword(pwd: string) {
  const min = pwd.length >= 8;
  const letter = /[A-Za-z]/.test(pwd);
  const number = /\d/.test(pwd);
  const symbol = /[^A-Za-z0-9]/.test(pwd);
  return min && letter && number && symbol;
}

export default function SignupScreen() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirma, setSenhaConfirma] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [dataNascimento, setDataNascimento] = useState("");
  const [pais, setPais] = useState("");
  const [profileTags, setProfileTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user) navigate("/trips", { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErro(null);

    if (!nome.trim()) return setErro("Preencha seu nome completo.");
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setErro("E-mail inválido.");
    if (!validatePassword(senha))
      return setErro("A senha deve ter pelo menos 8 caracteres, incluir letras, números e símbolos.");
    if (senha !== senhaConfirma) return setErro("As senhas não coincidem.");
    if (!dataNascimento) return setErro("Informe sua data de nascimento.");
    if (!pais) return setErro("Selecione sua nacionalidade.");
    if (profileTags.length === 0) return setErro("Selecione pelo menos um perfil de viagem.");

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password: senha,
        options: {
          data: { name: nome.trim(), birthdate: dataNascimento, country: pais, travel_profiles: profileTags },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) throw error;
      if (data.session) navigate("/trips", { replace: true });
      else setPendingConfirmation(true);
      setSenha(""); setSenhaConfirma("");
    } catch {
      setErro("Não foi possível concluir o cadastro. Confira os dados e tente novamente.");
    } finally { setLoading(false); }
  }

  if (pendingConfirmation) return <main className="max-w-md mx-auto p-6 space-y-4">
    <h1 className="text-xl font-semibold">Confira seu e-mail</h1>
    <p>Se o endereço puder ser cadastrado, você receberá um link para confirmar sua conta. Verifique também a pasta de spam.</p>
    <Button onClick={() => navigate("/auth/login")}>Já confirmei: entrar</Button>
    <Button variant="outline" onClick={() => setPendingConfirmation(false)}>Voltar ao cadastro</Button>
  </main>;



  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <PageHeader
        title="Criar Sua Conta"
        showBack
        backTo="/auth/access"
      />
      <form aria-busy={loading}
        onSubmit={handleSubmit}
        className="max-w-md mx-auto mt-4 bg-white rounded-lg p-6 space-y-5 shadow-card border border-gray-100"
        style={{ fontFamily: "Inter" }}
      >
        <div>
          <label htmlFor="signup-name" className="block mb-1 text-terra-700 font-medium">Nome Completo</label>
          <Input
            id="signup-name"
            type="text"
            placeholder="Digite seu nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="bg-[#FAF3EC] text-terra-900"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="block mb-1 text-terra-700 font-medium">E-mail</label>
          <Input
            id="signup-email"
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#FAF3EC] text-terra-900"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block mb-1 text-terra-700 font-medium">Senha</label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showSenha ? "text" : "password"}
              placeholder="Crie uma senha forte"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="bg-[#FAF3EC] text-terra-900 pr-11"
              autoComplete="new-password"
            />
            <button
              type="button"
              aria-label={showSenha ? "Esconder senha" : "Mostrar senha"}
              onClick={() => setShowSenha((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-terra-700"
              tabIndex={-1}
            >
              {showSenha ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Mín. 8 caracteres, incluindo letra, número e símbolo.
          </div>
        </div>
        <div>
          <label htmlFor="signup-password-confirm" className="block mb-1 text-terra-700 font-medium">Confirmar Senha</label>
          <Input
            id="signup-password-confirm"
            type="password"
            placeholder="Repita sua senha"
            value={senhaConfirma}
            onChange={(e) => setSenhaConfirma(e.target.value)}
            required
            className="bg-[#FAF3EC] text-terra-900"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="signup-birthdate" className="block mb-1 text-terra-700 font-medium">Data de Nascimento</label>
          <Input
            id="signup-birthdate"
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            max={format(new Date(), "yyyy-MM-dd")}
            required
            className="bg-[#FAF3EC] text-terra-900"
          />
        </div>
        <div>
          <label className="block mb-1 text-terra-700 font-medium">Nacionalidade</label>
          <CountrySelect value={pais} onChange={setPais} />
        </div>
        <div>
          <label className="block mb-1 text-terra-700 font-medium">Perfil de Viagem</label>
          <TravelProfileCheckboxes value={profileTags} onChange={setProfileTags} />
        </div>
        {erro && <div role="alert" className="text-red-600 text-sm">{erro}</div>}
        <Button
          type="submit"
          className="w-full py-3 bg-[#E76F51] text-white font-semibold text-base shadow-md hover:bg-[#CC5A3D]"
          disabled={loading}
        >
          {loading ? "Criando conta..." : "Criar Conta"}
        </Button>
      </form>
    </div>
  );
}
