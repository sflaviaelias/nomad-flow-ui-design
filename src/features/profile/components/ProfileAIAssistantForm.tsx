
import React from "react";
import { Switch } from "@/components/ui/switch";

interface Props {
  aiAssistant: boolean;
  setAIAssistant: (v: boolean) => void;
}
export function ProfileAIAssistantForm({ aiAssistant, setAIAssistant }: Props) {
  return (
    <section className="flex items-center gap-3 mt-2">
      <Switch
        checked={aiAssistant}
        onCheckedChange={setAIAssistant}
        className="data-[state=checked]:bg-terra-600 data-[state=unchecked]:bg-[#DADADA] w-[46px] h-[26px] min-w-[44px] min-h-[44px]"
      />
      <span className="text-terra-900 font-medium text-base font-inter">
        Ativar assistente inteligente
      </span>
    </section>
  );
}
