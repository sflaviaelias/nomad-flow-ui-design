
import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/calendar"; // usaremos o DatePicker shadcn
import TravelProfileCheckboxes from "./TravelProfileCheckboxes";
import { format } from "date-fns";

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

const currencyOptions = ["BRL", "USD", "EUR"];
const languageOptions = ["Português", "Inglês", "Espanhol", "Francês"];
const countryList = [
  "Brasil", "Argentina", "Espanha", "Portugal", "Colômbia", "Estados Unidos", "México",
];

export function EditProfileForm({
  name, setName, userEmail, nationality, setNationality,
  countryResidence, setCountryResidence, currency, setCurrency,
  languages, setLanguages, travelProfiles, setTravelProfiles, birthDate, setBirthDate,
  aiAssistant, setAIAssistant, errors
}: EditProfileFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-soft p-5 flex flex-col gap-6">
      {/* Nome */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">Nome<span className="ml-0.5 text-red-500">*</span></label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          className={`bg-[#FAF3EC] border-terra-900/10 focus-visible:ring-2 focus-visible:ring-terra-600 text-base ${errors.name ? 'border-red-500' : ''}`}
          required
        />
        {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
      </div>
      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">E-mail<span className="ml-0.5 text-red-500">*</span></label>
        <Input
          value={userEmail || ""}
          readOnly
          tabIndex={-1}
          className="bg-[#FAF3EC] text-terra-700 border-terra-900/10 cursor-not-allowed"
          aria-disabled="true"
        />
      </div>
      {/* Nacionalidade */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">Nacionalidade<span className="ml-0.5 text-red-500">*</span></label>
        <select
          value={nationality}
          onChange={e => setNationality(e.target.value)}
          className={`w-full rounded-md bg-[#FAF3EC] border-terra-900/10 px-3 py-2 text-base ${errors.nationality ? 'border-red-500' : ''}`}
          required
          style={{ minHeight: 44 }}
        >
          {countryList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.nationality && <span className="text-red-500 text-xs">{errors.nationality}</span>}
      </div>
      {/* Data Nascimento */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">Data de Nascimento<span className="ml-0.5 text-red-500">*</span></label>
        <DatePicker selected={birthDate} onSelect={setBirthDate}
          maxDate={new Date()} required />
        {errors.birthDate && <span className="text-red-500 text-xs">{errors.birthDate}</span>}
      </div>
      {/* Perfil de viagem (obrigatório, mínimo 1) */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm mb-0.5 font-inter">
          Perfil de Viagem<span className="ml-0.5 text-red-500">*</span>
        </label>
        <TravelProfileCheckboxes value={travelProfiles} onChange={setTravelProfiles} error={!!errors.travelProfiles} />
        {errors.travelProfiles && <span className="text-red-500 text-xs">{errors.travelProfiles}</span>}
      </div>
      {/* Residência */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">Residência</label>
        <select
          value={countryResidence}
          onChange={e => setCountryResidence(e.target.value)}
          className="w-full rounded-md bg-[#FAF3EC] border-terra-900/10 px-3 py-2 text-base"
          required
          style={{ minHeight: 44 }}
        >
          {countryList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {/* Moeda */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">Moeda</label>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="w-full rounded-md bg-[#FAF3EC] border-terra-900/10 px-3 py-2 text-base"
          required
          style={{ minHeight: 44 }}
        >
          {currencyOptions.map((cur) => (
            <option key={cur} value={cur}>{cur}</option>
          ))}
        </select>
      </div>
      {/* Idiomas */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">Idiomas</label>
        <div className="flex flex-wrap gap-3 mt-1">
          {languageOptions.map(lang => (
            <label
              key={lang}
              className={`flex items-center gap-2 px-2 py-1 border border-terra-900/10 rounded-lg cursor-pointer bg-[#FAF3EC]
                ${languages.includes(lang) ? "bg-terra-600 text-white border-none" : "text-terra-900"}
              `}
              htmlFor={`lang-${lang}`}
              style={{ minWidth: 44, minHeight: 44, fontFamily: "Inter", fontWeight: 500, fontSize: 15 }}
            >
              <input
                id={`lang-${lang}`}
                type="checkbox"
                checked={languages.includes(lang)}
                onChange={() =>
                  languages.includes(lang)
                    ? setLanguages(languages.filter(l => l !== lang))
                    : setLanguages([...languages, lang])
                }
                className="sr-only"
              />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      </div>
      {/* IA Assistente */}
      <div className="flex items-center gap-3 mt-2">
        <Switch
          checked={aiAssistant}
          onCheckedChange={setAIAssistant}
          className="data-[state=checked]:bg-terra-600 data-[state=unchecked]:bg-[#DADADA] w-[46px] h-[26px] min-w-[44px] min-h-[44px]"
        />
        <span className="text-terra-900 font-medium text-base font-inter">
          Ativar assistente inteligente
        </span>
      </div>
    </div>
  );
}
