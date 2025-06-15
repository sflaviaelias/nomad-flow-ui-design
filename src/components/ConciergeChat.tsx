import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import ConciergeContextModal from "./ConciergeContextModal";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";

// Tipos
interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_SUGGESTIONS = [
  "Sugira cafés para trabalhar perto de mim",
  "Melhores mercados abertos até tarde",
  "Como economizar no transporte local?",
  "Previsão do tempo pra amanhã",
];

const userSampleContext = {
  name: "Flávia",
  destination: "Barcelona",
  budget: "€1200",
  currency: "EUR",
  weather: "22°C, ensolarado",
};

const SUPABASE_CONCIERGE_FN_URL =
  "https://hxjjdutzpzrchfkrbxcd.functions.supabase.co/concierge-chat";

const ConciergeChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Envio da mensagem (IA)
  const sendMessage = async (question: string) => {
    if (!question.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: question }]);
    setValue("");
    setLoading(true);
    try {
      // OBTÉM o token de autenticação da usuária
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch(
        SUPABASE_CONCIERGE_FN_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` })
          },
          body: JSON.stringify({
            messages: [
              ...messages,
              { role: "user", content: question }
            ],
            userContext: userSampleContext, // Futuro: contexto dinâmico
          }),
        }
      );
      const data = await res.json();
      if (data.result) {
        setMessages((msgs) => [...msgs, { role: "assistant", content: data.result }]);
      } else {
        toast({ title: "Erro ao consultar concierge IA." });
      }
    } catch (_) {
      toast({ title: "Erro de conexão." });
    } finally {
      setLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    }
  };

  // Styles do DS (ajustados)
  const BUTTON_TAG_STYLES =
    "h-11 px-4 rounded-full border border-[#E76F51] bg-[#FAF3EC] text-[#E76F51] font-inter text-sm font-medium hover:bg-[#E76F51] hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E76F51] min-w-[44px] min-h-[44px]";
  const BUTTON_CONTEXT =
    "h-10 px-3 rounded-md border border-[#DADADA] bg-[#FAF3EC] text-[#68412A] font-inter text-sm font-medium hover:bg-[#FAF3EC]/90 transition";
  const HEADER_TITLE =
    "font-inter text-lg font-semibold text-[#C9583C] select-none w-full text-center";
  const BUTTON_BACK =
    "flex items-center gap-2 h-10 px-3 py-2 rounded-md bg-transparent border-none text-[#E76F51] hover:bg-[#E76F51]/10 font-inter text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E76F51] min-w-[44px] min-h-[44px]";

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col pt-0 px-2 md:px-0 gap-2 font-inter">
      {/* Header padrão: só UM header utilizando PageHeader padrão interno */}
      <PageHeader title="Concierge" showBack />

      {/* Message Card (Card do DS para a mensagem inicial) */}
      <div className="w-full">
        {messages.length === 0 && (
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
        )}
      </div>

      {/* Card de chat (Untitled UI Card) */}
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

      {/* Input de pergunta e botão enviar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage(value);
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
          {/* Ícone de seta nativo Lucide */}
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M16 12H4m0 0l6.362-6M4 12l6.362 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      </form>

      {/* Sugestões contextuais (botões compactos estilo tag) */}
      <div className="flex flex-wrap gap-2 mt-2">
        {QUICK_SUGGESTIONS.map(q => (
          <Button
            key={q}
            variant="outline"
            className={BUTTON_TAG_STYLES}
            onClick={() => sendMessage(q)}
            disabled={loading}
            style={{
              minWidth: 44,
              minHeight: 44,
              paddingLeft: 16,
              paddingRight: 16,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500
            }}
            aria-label={q}
          >
            {q}
          </Button>
        ))}
      </div>

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
      {/* Modal do contexto */}
      <ConciergeContextModal
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        userContext={userSampleContext}
      />
    </section>
  );
};

export default ConciergeChat;
