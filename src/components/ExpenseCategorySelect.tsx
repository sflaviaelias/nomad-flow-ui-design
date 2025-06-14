
import React from "react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "Alimentação", label: "Alimentação" },
  { value: "Transporte", label: "Transporte" },
  { value: "Hospedagem", label: "Hospedagem" },
  { value: "Lazer", label: "Lazer" },
  { value: "Compras", label: "Compras" },
  { value: "Outros", label: "Outros" }
];

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function ExpenseCategorySelect({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.value}
          type="button"
          variant={value === cat.value ? "default" : "outline"}
          className={`rounded-full px-4 py-2 text-sm font-medium border
            ${value === cat.value
              ? "bg-[#E76F51] text-white shadow"
              : "border-[#DADADA] text-[#6D4530] bg-white"}
          `}
          style={{
            minWidth: 44,
            minHeight: 44,
            fontFamily: "Inter"
          }}
          onClick={() => onChange(cat.value)}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  );
}
