
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Message } from "@/hooks/useConciergeChat";

export default function ConciergeMessagesList({
  messages,
  chatEndRef,
}: {
  messages: Message[];
  chatEndRef: React.RefObject<HTMLDivElement>;
}) {
  if (messages.length === 0) {
    return (
      <Card className="mb-2 bg-[#FCF7F4] rounded-lg px-2 py-5 flex items-center justify-center border border-[#F9E1DA] shadow-soft">
        <CardContent className="p-0">
          <div className="text-center text-neutral-400 text-base font-inter select-none">
            Faça uma pergunta ao Concierge IA.<br />
            <span className="text-sm text-[#6D4530] block mt-1">
              Respostas rápidas, naturais e contextualizadas.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="flex flex-col-reverse gap-4 overflow-y-auto max-h-[54vh] bg-[#FCF7F4] border border-[#DADADA] shadow-soft rounded-xl">
      <CardContent>
        <div className="flex flex-col gap-3 py-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`rounded-xl px-4 py-3 max-w-xs font-inter text-base leading-snug break-words ${
                msg.role === "user"
                  ? "bg-[#E76F51] text-white ml-auto"
                  : "bg-white border border-[#F9E1DA] text-[#6D4530]"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </CardContent>
    </Card>
  );
}
