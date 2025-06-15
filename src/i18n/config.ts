
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ptBR from "./pt-BR.json";
import enUS from "./en-US.json";
import esES from "./es-ES.json";

const resources = {
  "pt-BR": { translation: ptBR },
  "en-US": { translation: enUS },
  "es-ES": { translation: esES },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pt-BR", // default, override by user setting
    fallbackLng: "pt-BR",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
