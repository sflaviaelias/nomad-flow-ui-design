
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ProfileAvatar } from "./ProfileAvatar";
import { TravelTagsPicker } from "./TravelTagsPicker";
import { useNavigate } from "react-router-dom";

const currencyOptions = ["BRL", "USD", "EUR"];
const languageOptions = ["Português", "Inglês", "Espanhol", "Francês"];

const countryList = [
  "Brasil", "Argentina", "Espanha", "Portugal", "Colômbia", "Estados Unidos", "México",
];

export default function EditProfileScreen() {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();

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
    // TODO: Upload avatar, update profile in supabase
    toast({ title: "Perfil atualizado com sucesso!" });
    navigate("/profile");
  };

  return (
    <div className="bg-background min-h-screen p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-bold text-xl text-terra-800" style={{ fontFamily: "Inter" }}>
          Editar Perfil
        </h1>
        <Button variant="ghost" className="text-terra-700" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <ProfileAvatar
          avatarUrl={avatarUrl}
          editable
          onChange={file => setAvatarFile(file)}
          name={name}
        />
        <div className="bg-card rounded-lg shadow-soft p-4 space-y-4">
          <div>
            <label className="block text-terra-900 font-medium mb-1">Nome</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-terra-700/5"
              required
            />
          </div>
          <div>
            <label className="block text-terra-900 font-medium mb-1">E-mail</label>
            <Input
              value={user?.email || ""}
              readOnly={isGoogleSSO}
              tabIndex={-1}
              className="bg-terra-600/5 text-gray-400 cursor-not-allowed"
              aria-disabled="true"
            />
          </div>
          <div>
            <label className="block text-terra-900 font-medium mb-1">Nacionalidade</label>
            <select
              value={nationality}
              onChange={e => setNationality(e.target.value)}
              className="w-full rounded-md bg-terra-700/5 border px-3 py-2"
              required
            >
              {countryList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-terra-900 font-medium mb-1">Residência</label>
            <select
              value={countryResidence}
              onChange={e => setCountryResidence(e.target.value)}
              className="w-full rounded-md bg-terra-700/5 border px-3 py-2"
              required
            >
              {countryList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-terra-900 font-medium mb-1">Moeda</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full rounded-md bg-terra-700/5 border px-3 py-2"
              required
            >
              {currencyOptions.map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-terra-900 font-medium mb-1">Idiomas</label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map(lang => (
                <label key={lang} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={languages.includes(lang)}
                    onChange={() =>
                      setLanguages(languages.includes(lang)
                        ? languages.filter(l => l !== lang)
                        : [...languages, lang])
                    }
                    className="rounded"
                  />
                  <span className="text-sm">{lang}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-terra-900 font-medium mb-1">Tags de estilo de viagem <span className="text-xs text-neutral-500">(até 3)</span></label>
            <TravelTagsPicker value={travelTags} onChange={setTravelTags} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Switch checked={aiAssistant} onCheckedChange={setAIAssistant} />
            <span>Ativar assistente inteligente</span>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-terra-600 text-white font-semibold text-lg rounded-lg py-2 mt-2"
        >
          Salvar
        </Button>
      </form>
    </div>
  );
}
