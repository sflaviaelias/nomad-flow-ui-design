import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ProfileAvatar } from "./ProfileAvatar";
import { TravelTagsPicker } from "./TravelTagsPicker";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const currencyOptions = ["BRL", "USD", "EUR"];
const languageOptions = ["Português", "Inglês", "Espanhol", "Francês"];

const countryList = [
  "Brasil", "Argentina", "Espanha", "Portugal", "Colômbia", "Estados Unidos", "México",
];

export default function EditProfileScreen() {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Placeholder: Replace with data from user profile fetch
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [nationality, setNationality] = useState("Brasil");
  const [countryResidence, setCountryResidence] = useState("Brasil");
  const [currency, setCurrency] = useState("BRL");
  const [languages, setLanguages] = useState<string[]>(["Português", "Inglês"]);
  const [travelTags, setTravelTags] = useState<string[]>([]);
  const [aiAssistant, setAIAssistant] = useState(true);

  const isGoogleSSO = user?.app_metadata?.provider === "google";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Atualize o perfil no Supabase (tabela: profiles)
      const updates = {
        id: user?.id,
        name,
        email: user?.email,
        avatar_url: avatarUrl,
        country: countryResidence,
        preferences: {
          nationality,
          currency,
          languages,
          travel_tags: travelTags,
          ai_assistant: aiAssistant
        }
      };

      const { error } = await supabase.from("profiles").upsert(updates, { onConflict: "id" });
      if (error) throw error;

      toast({ title: "Perfil atualizado com sucesso!" });
      navigate("/profile", { state: { refresh: true } }); // força refetch na tela de perfil
    } catch (err: any) {
      toast({ title: "Erro ao atualizar perfil", description: err.message ?? "Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF3EC] min-h-screen flex flex-col font-sans">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-2 py-4 px-4 md:px-8 bg-white shadow-soft rounded-b-lg mb-4">
        <button
          className="flex items-center justify-center p-0.5 sm:p-2 rounded-md transition hover:bg-terra-600/10 text-terra-700"
          style={{ minWidth: 44, minHeight: 44 }}
          aria-label="Voltar"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-xl text-terra-800" style={{ fontFamily: "Inter" }}>
          Editar Perfil
        </h1>
        {/* reserve espaço para alinhamento centralizado */}
        <span style={{ width: 32 }} />
      </div>
      <form onSubmit={handleSubmit} className="flex-1 px-4 pb-8 md:pb-12 space-y-7 w-full max-w-md mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-2">
          <ProfileAvatar
            avatarUrl={avatarUrl}
            editable
            onChange={file => setAvatarFile(file)}
            name={name}
          />
        </div>
        <div className="bg-white rounded-lg shadow-soft p-5 flex flex-col gap-6">
          {/* Campo Nome */}
          <div className="flex flex-col gap-1">
            <label className="text-terra-900 font-medium text-sm" style={{ fontFamily: "Inter" }}>
              Nome
            </label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-[#FAF3EC] border-terra-900/10 focus-visible:ring-2 focus-visible:ring-terra-600 text-base"
              required
              style={{ fontFamily: "Inter" }}
            />
          </div>
          {/* Campo Email */}
          <div className="flex flex-col gap-1">
            <label className="text-terra-900 font-medium text-sm" style={{ fontFamily: "Inter" }}>
              E-mail
            </label>
            <Input
              value={user?.email || ""}
              readOnly
              tabIndex={-1}
              className="bg-[#FAF3EC] text-terra-700 border-terra-900/10 cursor-not-allowed"
              aria-disabled="true"
              style={{ fontFamily: "Inter" }}
            />
          </div>
          {/* Campo Nacionalidade */}
          <div className="flex flex-col gap-1">
            <label className="text-terra-900 font-medium text-sm" style={{ fontFamily: "Inter" }}>
              Nacionalidade
            </label>
            <select
              value={nationality}
              onChange={e => setNationality(e.target.value)}
              className="w-full rounded-md bg-[#FAF3EC] border-terra-900/10 px-3 py-2 text-base"
              required
              style={{ fontFamily: "Inter", minHeight: 44 }}
            >
              {countryList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {/* Campo Residência */}
          <div className="flex flex-col gap-1">
            <label className="text-terra-900 font-medium text-sm" style={{ fontFamily: "Inter" }}>
              Residência
            </label>
            <select
              value={countryResidence}
              onChange={e => setCountryResidence(e.target.value)}
              className="w-full rounded-md bg-[#FAF3EC] border-terra-900/10 px-3 py-2 text-base"
              required
              style={{ fontFamily: "Inter", minHeight: 44 }}
            >
              {countryList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {/* Campo Moeda */}
          <div className="flex flex-col gap-1">
            <label className="text-terra-900 font-medium text-sm" style={{ fontFamily: "Inter" }}>
              Moeda
            </label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full rounded-md bg-[#FAF3EC] border-terra-900/10 px-3 py-2 text-base"
              required
              style={{ fontFamily: "Inter", minHeight: 44 }}
            >
              {currencyOptions.map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
          {/* Idiomas */}
          <div className="flex flex-col gap-1">
            <label className="text-terra-900 font-medium text-sm" style={{ fontFamily: "Inter" }}>
              Idiomas
            </label>
            <div className="flex flex-wrap gap-3 mt-1">
              {languageOptions.map(lang => (
                <label
                  key={lang}
                  className={`flex items-center gap-2 px-2 py-1 border border-terra-900/10 rounded-lg cursor-pointer bg-[#FAF3EC]
                    ${languages.includes(lang) ? "bg-terra-600 text-white border-none" : "text-terra-900"}
                  `}
                  htmlFor={`lang-${lang}`}
                  style={{
                    minWidth: 44,
                    minHeight: 44,
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: 15
                  }}
                >
                  <input
                    id={`lang-${lang}`}
                    type="checkbox"
                    checked={languages.includes(lang)}
                    onChange={() =>
                      setLanguages(languages.includes(lang)
                        ? languages.filter(l => l !== lang)
                        : [...languages, lang])
                    }
                    className="sr-only"
                  />
                  <span className="">{lang}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Tags de estilo de viagem */}
          <div className="flex flex-col gap-1">
            <label className="text-terra-900 font-medium text-sm mb-0.5" style={{ fontFamily: "Inter" }}>
              Tags de estilo de viagem
              <span className="text-xs text-terra-700 ml-1 font-normal">(até 3)</span>
            </label>
            <TravelTagsPicker value={travelTags} onChange={setTravelTags} />
          </div>
          {/* Switch Assistente IA */}
          <div className="flex items-center gap-3 mt-2">
            <Switch
              checked={aiAssistant}
              onCheckedChange={setAIAssistant}
              className="data-[state=checked]:bg-terra-600 data-[state=unchecked]:bg-[#DADADA] w-[46px] h-[26px] min-w-[44px] min-h-[44px]"
            />
            <span className="text-terra-900 font-medium text-base" style={{ fontFamily: "Inter" }}>
              Ativar assistente inteligente
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1 bg-terra-600 text-white font-semibold text-lg rounded-lg py-2 mt-1 min-h-[44px]"
            style={{ fontFamily: "Inter" }}
          >
            Salvar
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-terra-700 text-terra-700 bg-[#FAF3EC] hover:bg-terra-600/10 font-semibold rounded-lg py-2 mt-1 min-h-[44px]"
            style={{ fontFamily: "Inter" }}
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
