
import React from "react";

interface Props {
  countryResidence: string;
  setCountryResidence: (v: string) => void;
  currency: string;
  setCurrency: (v: string) => void;
  countryList: string[];
  currencyOptions: string[];
}

export function ProfilePreferencesForm({
  countryResidence,
  setCountryResidence,
  currency,
  setCurrency,
  countryList,
  currencyOptions
}: Props) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Residência */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">
          Residência
        </label>
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
        <label className="text-terra-900 font-medium text-sm font-inter">
          Moeda
        </label>
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
    </section>
  );
}
