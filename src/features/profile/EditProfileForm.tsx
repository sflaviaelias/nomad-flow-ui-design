
import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TravelTagsPicker } from "./TravelTagsPicker";

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
  travelTags: string[];
  setTravelTags: (v: string[]) => void;
  aiAssistant: boolean;
  setAIAssistant: (v: boolean) => void;
  isGoogleSSO?: boolean;
}

export function EditProfileForm({
  name, setName, userEmail, nationality, setNationality,
  countryResidence, setCountryResidence, currency, setCurrency,
  languages, setLanguages, travelTags, setTravelTags, aiAssistant, setAIAssistant,
}: EditProfileFormProps) {
  return (
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
          value={userEmail || ""}
          readOnly
          tabIndex={-1}
          className="bg-[#FAF3EC] text-terra-700 border-terra-900/10 cursor-not-allowed"
          aria-disabled="true"
          style={{ fontFamily: "Inter" }}
        />
      </div>
      {/* Nacionalidade */}
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
      {/* Residência */}
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
      {/* Moeda */}
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
                  languages.includes(lang)
                    ? setLanguages(languages.filter(l => l !== lang))
                    : setLanguages([...languages, lang])
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
      {/* IA Assistente */}
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
  );
}
