
// Refactored file, now orchestrates the child components!
import React, { useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { EditProfileHeader } from "./EditProfileHeader";
import { EditProfileAvatarBlock } from "./EditProfileAvatarBlock";
import { EditProfileForm } from "./EditProfileForm";
import { EditProfileActions } from "./EditProfileActions";

const currencyOptions = ["BRL", "USD", "EUR"];
const languageOptions = ["Português", "Inglês", "Espanhol", "Francês"];
const countryList = [
  "Brasil", "Argentina", "Espanha", "Portugal", "Colômbia", "Estados Unidos", "México",
];

export default function EditProfileScreen() {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // State hooks for fields
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [nationality, setNationality] = useState("Brasil");
  const [countryResidence, setCountryResidence] = useState("Brasil");
  const [currency, setCurrency] = useState("BRL");
  const [languages, setLanguages] = useState<string[]>(["Português", "Inglês"]);
  const [travelTags, setTravelTags] = useState<string[]>([]);
  const [aiAssistant, setAIAssistant] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
      navigate("/profile", { state: { refresh: true } });
    } catch (err: any) {
      toast({ title: "Erro ao atualizar perfil", description: err.message ?? "Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF3EC] min-h-screen flex flex-col font-sans">
      <EditProfileHeader />
      <form onSubmit={handleSubmit} className="flex-1 px-4 pb-8 md:pb-12 space-y-7 w-full max-w-md mx-auto">
        <EditProfileAvatarBlock avatarUrl={avatarUrl} onChange={setAvatarFile} name={name} />
        <EditProfileForm
          name={name}
          setName={setName}
          userEmail={user?.email}
          nationality={nationality}
          setNationality={setNationality}
          countryResidence={countryResidence}
          setCountryResidence={setCountryResidence}
          currency={currency}
          setCurrency={setCurrency}
          languages={languages}
          setLanguages={setLanguages}
          travelTags={travelTags}
          setTravelTags={setTravelTags}
          aiAssistant={aiAssistant}
          setAIAssistant={setAIAssistant}
        />
        <EditProfileActions loading={loading} onSave={handleSubmit} />
      </form>
    </div>
  );
}
