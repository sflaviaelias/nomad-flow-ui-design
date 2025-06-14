
import React from "react";
import countriesList from "./countriesList";

// value: código do país, ex: "BR"
export default function CountrySelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      className="block w-full py-2 px-3 rounded-md border border-gray-200 bg-[#FAF3EC] text-base"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      disabled={disabled}
    >
      <option value="">Selecione seu país</option>
      {countriesList.map((country) => (
        <option key={country.code} value={country.code}>
          {country.flag} {country.name}
        </option>
      ))}
    </select>
  );
}
