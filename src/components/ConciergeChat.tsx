
import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ConciergeContextModal from "./ConciergeContextModal";
import ConciergeMessagesList from "./ConciergeMessagesList";
import ConciergeQuickSuggestions from "./ConciergeQuickSuggestions";
import ConciergeChatInput from "./ConciergeChatInput";
import { Button } from "@/components/ui/button";
import { useConciergeChat } from "@/hooks/useConciergeChat";

const BUTTON_CONTEXT =
  "h-10 px-3 rounded-md border border-[#DADADA] bg-[#FAF3EC] text-[#68412A] font-inter text-sm font-medium hover:bg-[#FAF3EC]/90 transition";

export default function ConciergeChat() {
  const [contextOpen, setContextOpen] = useState(false);
  const {
    messages,
    loading,
    value,
    setValue,
    sendMessage,
    chatEndRef,
    quickSuggestions,
    userSampleContext,
  } = useConciergeChat();

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col pt-0 px-2 md:px-0 gap-2 font-inter">
      <PageHeader title="Concierge" showBack />

      <div className="w-full">
        <ConciergeMessagesList messages={messages} chatEndRef={chatEndRef} />
      </div>

      <ConciergeChatInput
        value={value}
        setValue={setValue}
        onSend={sendMessage}
        loading={loading}
      />

      <ConciergeQuickSuggestions
        suggestions={quickSuggestions}
        onSuggestion={sendMessage}
        disabled={loading}
      />

      {/* Botão "Ver contexto" discreto/pequeno */}
      <div className="flex justify-end mt-1">
        <Button
          variant="outline"
          type="button"
          className={BUTTON_CONTEXT}
          style={{
            minWidth: 44,
            minHeight: 36,
            fontSize: 14,
            paddingLeft: 16,
            paddingRight: 16,
            borderRadius: 8,
          }}
          onClick={() => setContextOpen(true)}
        >
          Ver contexto
        </Button>
      </div>
      <ConciergeContextModal
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        userContext={userSampleContext}
      />
    </section>
  );
}
