
import React from "react";
import { LanguageSelect, LanguageCode } from "@/features/profile/LanguageSelect";
import { useTranslation } from "react-i18next";

interface SettingsLanguageBlockProps {
  value: LanguageCode;
  onChange: (lang: LanguageCode) => void;
  disabled?: boolean;
}

export function SettingsLanguageBlock({ value, onChange, disabled }: SettingsLanguageBlockProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl px-4 py-5 shadow-card flex items-center">
      <div className="flex-1 flex flex-col">
        <LanguageSelect
          value={value}
          onChange={onChange}
          disabled={disabled}
          label={t("language_app")}
        />
      </div>
    </div>
  );
}
