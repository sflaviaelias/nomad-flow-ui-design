
// Refatorado para dividir áreas em componentes lógicos menores.
import React from "react";
import { ProfilePersonalInfoForm } from "./components/ProfilePersonalInfoForm";
import { ProfileTravelProfileForm } from "./components/ProfileTravelProfileForm";
import { ProfileLanguagesForm } from "./components/ProfileLanguagesForm";
import { ProfilePreferencesForm } from "./components/ProfilePreferencesForm";
import { ProfileAIAssistantForm } from "./components/ProfileAIAssistantForm";

const currencyOptions = ["BRL", "USD", "EUR"];
const languageOptions = ["Português", "Inglês", "Espanhol", "Francês"];
const countryList = [
  "Brasil", "Argentina", "Espanha", "Portugal", "Colômbia", "Estados Unidos", "México",
];

interface EditProfileFormProps {
  name: string;
  setName: (n: string) => void;
  userEmail?: string;
  nationality: string;
  setNationality: (val: string) => void;
  countryResidence: string;
  setCountryResidence: (v: string) => void;
  currency: string;
  setCurrency: (v: string) => void;
  languages: string[];
  setLanguages: (v: string[]) => void;
  travelProfiles: string[];
  setTravelProfiles: (v: string[]) => void;
  birthDate: Date | null;
  setBirthDate: (v: Date | null) => void;
  aiAssistant: boolean;
  setAIAssistant: (v: boolean) => void;
  isGoogleSSO?: boolean;
  errors: { [k: string]: string | null };
}

export function EditProfileForm(props: EditProfileFormProps) {
  // Erro dinâmico de perfil de viagem
  const travelProfileError = !!props.errors.travelProfiles && props.travelProfiles.length === 0;

  return (
    <div className="bg-white rounded-lg shadow-soft py-5 px-3 flex flex-col gap-5 md:gap-7">
      {/* Informações Pessoais */}
      <ProfilePersonalInfoForm
        name={props.name}
        setName={props.setName}
        userEmail={props.userEmail}
        nationality={props.nationality}
        setNationality={props.setNationality}
        countryList={countryList}
        errors={props.errors}
        birthDate={props.birthDate}
        setBirthDate={props.setBirthDate}
      />

      {/* Perfil de Viagem */}
      <ProfileTravelProfileForm
        travelProfiles={props.travelProfiles}
        setTravelProfiles={props.setTravelProfiles}
        error={travelProfileError}
      />

      {/* Preferências e Idiomas */}
      <ProfilePreferencesForm
        countryResidence={props.countryResidence}
        setCountryResidence={props.setCountryResidence}
        currency={props.currency}
        setCurrency={props.setCurrency}
        countryList={countryList}
        currencyOptions={currencyOptions}
      />
      <ProfileLanguagesForm
        languages={props.languages}
        setLanguages={props.setLanguages}
        languageOptions={languageOptions}
      />

      {/* Preferências adicionais */}
      <ProfileAIAssistantForm
        aiAssistant={props.aiAssistant}
        setAIAssistant={props.setAIAssistant}
      />
    </div>
  );
}
