
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe, Briefcase, Activity, User } from "lucide-react";

const OPTIONS = [
  { label: "Trabalhador Remoto", value: "Trabalhador Remoto", icon: Briefcase },
  { label: "Freelancer", value: "Freelancer", icon: User },
  { label: "Aventureiro", value: "Aventureiro", icon: Activity },
  { label: "Cosmopolita", value: "Cosmopolita", icon: Globe },
];

export default function TravelProfileCheckboxes({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (newValues: string[]) => void;
  error?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3 mt-1">
      {OPTIONS.map(opt => {
        const checked = value.includes(opt.value);
        const Icon = opt.icon;
        return (
          <label
            key={opt.value}
            htmlFor={`travel-profile-${opt.value}`}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition
              min-w-[120px] min-h-[44px] font-inter text-base cursor-pointer
              ${checked
                ? "bg-terra-600 border-terra-600 text-white shadow"
                : error
                ? "border-red-400 text-terra-900 bg-[#FAF3EC]"
                : "border-terra-900/10 text-terra-900 bg-[#FAF3EC]"}
            `}
            style={{
              fontWeight: checked ? 600 : 500,
            }}
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() =>
                checked
                  ? onChange(value.filter(v => v !== opt.value))
                  : onChange([...value, opt.value])
              }
              id={`travel-profile-${opt.value}`}
              className="mr-1"
            />
            <Icon size={18} className={checked ? "text-white" : "text-terra-600"} />
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
