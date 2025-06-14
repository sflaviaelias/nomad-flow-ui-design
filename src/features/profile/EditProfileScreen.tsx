
import React, { useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { EditProfileHeader } from "./EditProfileHeader";
import { EditProfileAvatarBlock } from "./EditProfileAvatarBlock";
import { EditProfileForm } from "./EditProfileForm";
import { EditProfileActions } from "./EditProfileActions";

export default function EditProfileScreen() {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State fields obrigatórios
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [nationality, setNationality] = useState("Brasil");
  const [countryResidence, setCountryResidence] = useState("Brasil");
  const [currency, setCurrency] = useState("BRL");
  const [languages, setLanguages] = useState<string[]>(["Português", "Inglês"]);
  const [travelProfiles, setTravelProfiles] = useState<string[]>([]);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [aiAssistant, setAIAssistant] = useState(true);

  // Controle de erros para validação obrigatória
  const [errors, setErrors] = useState<{ [k: string]: string | null }>({});

  // Nova lógica: não permite "escapar" da tela se campos obrigatórios não preenchidos
  // A menos que já venha de perfil existente e completo.
  // (isso depende do backend: é bom obrigar no backend, mas aqui é prevention UX)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [k: string]: string | null } = {};

    if (!name.trim()) newErrors.name = "Nome é obrigatório";
    if (!nationality) newErrors.nationality = "Selecione sua nacionalidade";
    if (!birthDate) newErrors.birthDate = "Data de nascimento obrigatória";
    if (!Array.isArray(travelProfiles) || travelProfiles.length === 0)
      newErrors.travelProfiles = "Selecione ao menos um perfil";

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);

    try {
      const updates = {
        id: user?.id,
        name,
        email: user?.email,
        avatar_url: avatarUrl,
        country: countryResidence,
        birth_date: birthDate ? birthDate.toISOString().split("T")[0] : null,
        preferences: {
          nationality,
          currency,
          languages,
          travel_profiles: travelProfiles,
          ai_assistant: aiAssistant
        },
        complete: true // Marque como "completo" após edição inicial
      };

      const { error } = await supabase.from("profiles").upsert(updates, { onConflict: "id" });
      if (error) throw error;

      toast({ title: "Perfil atualizado com sucesso!" });
      // Após perfil salvo, redirecione para Home para garantir experiência fluída
      navigate("/", { state: { refresh: true } });
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
          travelProfiles={travelProfiles}
          setTravelProfiles={setTravelProfiles}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          aiAssistant={aiAssistant}
          setAIAssistant={setAIAssistant}
          errors={errors}
        />
        <EditProfileActions loading={loading} onSave={handleSubmit} />
      </form>
    </div>
  );
}
