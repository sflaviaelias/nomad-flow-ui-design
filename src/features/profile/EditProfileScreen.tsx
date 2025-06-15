
import React, { useState, useEffect } from "react";
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

  // Campos do formulário
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

  const [errors, setErrors] = useState<{ [k: string]: string | null }>({});

  // Buscar dados completos do perfil ao montar
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    supabase
      .from("profiles")
      .select("name,avatar_url,email,country,birth_date,preferences")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setLoading(false);
          toast({ title: "Erro ao carregar perfil", description: error.message });
          return;
        }
        if (data) {
          setName(data.name || "");
          setAvatarUrl(data.avatar_url || null);
          setCountryResidence(data.country || "Brasil");
          setBirthDate(data.birth_date ? new Date(data.birth_date) : null);

          // --- CORREÇÃO DE PARSING AQUI ---
          let prefs: any = {};
          if (data.preferences && typeof data.preferences === "object") {
            prefs = data.preferences as { [k: string]: any };
          } else if (data.preferences && typeof data.preferences === "string") {
            try {
              prefs = JSON.parse(data.preferences);
            } catch (e) {
              prefs = {};
            }
          }

          setNationality(
            typeof prefs.nationality === "string" ? prefs.nationality : "Brasil"
          );
          setCurrency(
            typeof prefs.currency === "string" ? prefs.currency : "BRL"
          );
          setLanguages(
            Array.isArray(prefs.languages) && prefs.languages.length > 0
              ? prefs.languages
              : ["Português", "Inglês"]
          );
          setTravelProfiles(
            Array.isArray(prefs.travel_profiles) ? prefs.travel_profiles : []
          );
          setAIAssistant(
            typeof prefs.ai_assistant === "boolean" ? prefs.ai_assistant : true
          );
        }
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
          ai_assistant: aiAssistant,
        },
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates, { onConflict: "id" });
      if (error) {
        if (
          error.message?.toLowerCase().includes("duplic") ||
          error.message
            ?.toLowerCase()
            .includes("já existe um perfil cadastrado com este e-mail")
        ) {
          toast({
            title: "Já existe um perfil com este e-mail",
            description:
              "Tente acessar sua conta existente ou recupere sua senha!",
          });
          setErrors({ ...newErrors, email: "E-mail já cadastrado" });
        } else {
          toast({
            title: "Erro ao atualizar perfil",
            description: error.message ?? "Tente novamente.",
          });
        }
        setLoading(false);
        return;
      }

      toast({ title: "Perfil atualizado com sucesso!" });
      navigate("/", { state: { refresh: true } });
    } catch (err: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: err.message ?? "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF3EC] min-h-screen flex flex-col font-sans">
      <EditProfileHeader />
      <form
        onSubmit={handleSubmit}
        className="flex-1 px-4 pb-8 md:pb-12 space-y-7 w-full max-w-md mx-auto"
      >
        <EditProfileAvatarBlock
          avatarUrl={avatarUrl}
          onChange={setAvatarFile}
          name={name}
        />
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
