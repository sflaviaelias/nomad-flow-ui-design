
import React from "react";
import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SettingsHeader() {
  const { t } = useTranslation();
  return (
    <div className="w-full flex flex-col items-center justify-center pt-8 pb-3 bg-[#FCF7F4] shadow-soft">
      <span className="mb-2 rounded-full p-2 bg-[#E76F51]/10 flex items-center">
        <Bell size={30} className="text-terra-600" />
      </span>
      <h1 className="text-2xl md:text-3xl font-bold text-terra-800">
        {t("app_settings")}
      </h1>
    </div>
  );
}
