
import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowUp, ArrowLeft, Users, MapPin, CircleCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ConciergeContextModal from "./ConciergeContextModal";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Por ora sugestões estáticas; futuro: vinda da IA via contexto dinâmico
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

const ConciergeChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Submit handler para enviar mensagem
  const sendMessage = async (question: string) => {
    if (!question.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: question }]);
    setValue("");
    setLoading(true);
    try {
      const res = await fetch(
        "/functions/v1/concierge-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages,
              { role: "user", content: question }
            ],
            userContext: userSampleContext, // No futuro: contexto dinâmico
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

  // Paleta e styles Untitled UI
  const styledInput =
    "bg-[#FAF3EC] border border-[#DADADA] placeholder:text-neutral-400 text-base font-inter focus:ring-2 focus:ring-[#E76F51] rounded-lg px-4 py-3 h-12 disabled:opacity-50 transition";
  const styledSuggestionBtn =
    "inline-flex items-center justify-center font-inter font-medium text-base min-w-[44px] min-h-[44px] px-5 py-2 rounded-lg border border-[#E76F51] text-[#E76F51] bg-[#FFF] hover:bg-[#E76F51] hover:text-white active:bg-[#C9583C] focus:outline-none focus:ring-2 focus:ring-[#E76F51] transition";
  const styledContextBtn =
    "font-inter text-base rounded-md px-4 py-2 border border-[#DADADA] text-[#6D4530] bg-[#FCF7F4] hover:bg-[#E76F51]/15";
  const styledSendBtn =
    "h-12 px-4 rounded-lg bg-[#E76F51] hover:bg-[#C9583C] text-white font-semibold flex items-center justify-center transition";

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col pt-2 px-2 md:px-0 gap-2 font-inter">
      {/* Header com botão voltar, título central e ícones alinhados */}
      <div className="flex items-center justify-between mb-2 px-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar"
          onClick={() => navigate(-1)}
          className="rounded-full border border-[#DADADA] text-[#E76F51] bg-[#FAF3EC] mr-1"
        >
          <ArrowLeft size={24} />
        </Button>
        <span className="font-bold text-lg text-[#C9583C] text-center flex-1">Concierge IA</span>
        <Button
          variant="outline"
          type="button"
          className={styledContextBtn + " ml-auto"}
          onClick={() => setContextOpen(true)}
        >
          Ver contexto
        </Button>
      </div>

      {/* Card de chat (Untitled UI Card) */}
      <Card className="flex flex-col-reverse gap-4 overflow-y-auto max-h-[54vh] bg-[#FCF7F4] border border-[#DADADA] shadow-soft rounded-xl">
        <CardContent>
          <div className="flex flex-col gap-3 py-1">
            {messages.length === 0 && (
              <div className="text-center text-neutral-400 text-base py-8 font-inter">
                Faça uma pergunta ao Concierge IA.<br />
                <span className="text-sm text-[#6D4530]">Respostas rápidas, naturais e contextualizadas. ✨</span>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx}
                className={`flex items-end ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-xl px-4 py-3 max-w-xs font-inter text-base leading-snug break-words ${
                  msg.role === "user"
                    ? "bg-[#E76F51] text-white ml-auto"
                    : "bg-white border border-[#F9E1DA] text-[#6D4530]"
                }`}>
                  {msg.content}
                  {/* Em breve: CTAs contextuais inteligentes */}
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
        className="flex gap-2 mt-2 w-full"
        aria-label="Enviar pergunta"
      >
        <Input
          className={styledInput + " flex-1"}
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
          className={styledSendBtn}
          aria-label="Enviar pergunta"
        >
          {loading ? <Loader2 className="animate-spin" /> : <ArrowUp />}
        </Button>
      </form>

      {/* Sugestões contextuais (como botões, layout grid responsivo Untitled UI) */}
      <div className="flex flex-wrap gap-2 mt-2">
        {QUICK_SUGGESTIONS.map(q => (
          <Button
            key={q}
            variant="outline"
            className={styledSuggestionBtn}
            onClick={() => sendMessage(q)}
            disabled={loading}
            style={{
              minWidth: 120,
              minHeight: 44,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500
            }}
            aria-label={q}
          >
            {q}
          </Button>
        ))}
      </div>

      <ConciergeContextModal open={contextOpen} onClose={() => setContextOpen(false)} userContext={userSampleContext} />
    </section>
  );
};

export default ConciergeChat;
