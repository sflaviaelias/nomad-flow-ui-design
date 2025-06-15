
import React from "react";

interface Props {
  languages: string[];
  setLanguages: (v: string[]) => void;
  languageOptions: string[];
}
export function ProfileLanguagesForm({
  languages,
  setLanguages,
  languageOptions
}: Props) {
  return (
    <section>
      <label className="text-terra-900 font-medium text-sm font-inter">
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
    </section>
  );
}
