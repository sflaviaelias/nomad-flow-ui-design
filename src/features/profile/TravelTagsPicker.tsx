
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const tagOptions = [
  "Viajante Econômico",
  "Trabalhador Remoto",
  "Explorador Cultural",
  "Minimalista",
  "Aventureiro",
  "Planner",
];

type Props = {
  value: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
  max?: number;
};

export function TravelTagsPicker({ value, onChange, disabled, max = 3 }: Props) {
  const handleChange = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else if (value.length < max) {
      onChange([...value, tag]);
    }
  };

  return (
    <ToggleGroup type="multiple" className="flex flex-wrap gap-2 mt-1">
      {tagOptions.map((tag) => (
        <ToggleGroupItem
          key={tag}
          value={tag}
          aria-pressed={value.includes(tag)}
          pressed={value.includes(tag)}
          onClick={() => handleChange(tag)}
          disabled={disabled && !value.includes(tag)}
          className={`rounded-full px-3 py-1 font-medium text-sm border ${
            value.includes(tag)
              ? "bg-terra-600 text-white border-none"
              : "bg-terra-700/5 text-terra-900 border-terra-900/10"
          }`}
        >
          {tag}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
