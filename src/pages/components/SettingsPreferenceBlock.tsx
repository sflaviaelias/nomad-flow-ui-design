
import React from "react";
import { Switch } from "@/components/ui/switch";

interface SettingsPreferenceBlockProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
  disabled?: boolean;
  id: string;
}

export function SettingsPreferenceBlock({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  id,
}: SettingsPreferenceBlockProps) {
  return (
    <div className="bg-white rounded-xl px-4 py-5 shadow-card flex items-center">
      <div className="flex-1 flex flex-col">
        <span className="font-medium text-base text-terra-900">{label}</span>
        <span className="text-sm text-neutral-500">{description}</span>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        id={id}
        aria-label={label}
        disabled={disabled}
        className={`ml-2 data-[state=checked]:bg-[#E76F51] data-[state=checked]:border-[#E76F51] ${
          disabled ? "opacity-50 pointer-events-none cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}
