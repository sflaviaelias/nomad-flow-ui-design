
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ConciergeChatInput({
  value,
  setValue,
  onSend,
  loading,
}: {
  value: string;
  setValue: (v: string) => void;
  onSend: (v: string) => void;
  loading: boolean;
}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSend(value);
      }}
      className="flex gap-2 mt-2 w-full items-center"
      aria-label="Enviar pergunta"
    >
      <Input
        className="flex-1 h-12 rounded-lg border border-[#DADADA] bg-[#FAF3EC] placeholder:text-neutral-400 text-base font-inter px-4 py-3 focus:ring-2 focus:ring-[#E76F51] disabled:opacity-50 transition"
        placeholder="Pergunte sobre sua viagem, locais, câmbio..."
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={loading}
        aria-label="Campo de entrada do chat"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
      />
      <Button
        type="submit"
        disabled={loading || !value.trim()}
        className="h-12 aspect-square rounded-lg bg-[#E76F51] hover:bg-[#C9583C] text-white font-semibold shadow-card flex items-center justify-center transition min-w-[44px] min-h-[44px]"
        aria-label="Enviar pergunta"
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <path d="M16 12H4m0 0l6.362-6M4 12l6.362 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Button>
    </form>
  );
}
