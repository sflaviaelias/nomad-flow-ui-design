
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Flag } from "lucide-react";

// Lista fixa de idiomas suportados
const languages = [
  {
    code: "pt-BR",
    label: "Português (Brasil)",
    flag: "🇧🇷",
  },
  {
    code: "en-US",
    label: "Inglês",
    flag: "🇺🇸",
  },
  {
    code: "es-ES",
    label: "Espanhol",
    flag: "🇪🇸",
  },
];

export type LanguageCode = "pt-BR" | "en-US" | "es-ES";

interface Props {
  value: LanguageCode;
  onChange: (lang: LanguageCode) => void;
  disabled?: boolean;
  label?: string;
}

export const LanguageSelect = ({ value, onChange, disabled, label }: Props) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-terra-900 font-medium text-sm font-inter mb-1">
        {label || "Idioma do aplicativo"}
      </label>
      <Select value={value} onValueChange={val => onChange(val as LanguageCode)} disabled={disabled}>
        <SelectTrigger
          className="w-full min-h-[44px] bg-[#FAF3EC] border-terra-900/10 font-inter text-base focus:ring-[#E76F51]"
          aria-label={label || "Idioma do aplicativo"}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map(lang => (
            <SelectItem key={lang.code} value={lang.code} className="flex items-center">
              <span className="mr-2">{lang.flag}</span>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
