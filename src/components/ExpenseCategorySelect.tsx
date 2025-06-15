
import React from "react";

interface ExpenseCategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const categories = [
  { label: "Alimentação", value: "food" },
  { label: "Transporte", value: "transport" },
  { label: "Hospedagem", value: "accommodation" },
  { label: "Lazer", value: "leisure" },
  { label: "Outros", value: "other" },
];

export default function ExpenseCategorySelect({
  value,
  onChange,
  error,
}: ExpenseCategorySelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#6D4530] mb-1">
        Categoria <span className="text-[#C9583C]">*</span>
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        <option value="">Escolha uma categoria</option>
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
      {error && <div className="text-[#C9583C] text-xs mt-1">{error}</div>}
    </div>
  );
}
