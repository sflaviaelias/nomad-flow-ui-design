
import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ConciergeContextModal from "./ConciergeContextModal";

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

const ConciergeChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
            userContext: userSampleContext, // Trocar para contexto dinâmico
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

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col py-2 px-2 md:px-0 gap-2">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-lg text-neutral-800">Concierge IA</span>
        <Button variant="outline" size="sm" onClick={() => setContextOpen(true)}>
          Ver contexto
        </Button>
      </div>
      <Card className="flex flex-col-reverse gap-4 overflow-y-auto max-h-[54vh] bg-background">
        <CardContent>
          <div className="flex flex-col gap-3 py-1">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-base py-10">Faça uma pergunta ao Concierge IA.</div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx}
                className={`flex items-end ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-xl px-4 py-3 text-sm max-w-xs ${msg.role === "user"
                  ? "bg-terracotta text-white ml-auto"
                  : "bg-white border border-terracotta-light text-neutral-800"
                }`}>
                  {msg.content}
                  {/* Exemplo de CTAs contextualizadas retornar aqui via futuro parsing: */}
                  {/* {msg.role === "assistant" && <Button size="sm" variant="link">Adicionar ao itinerário</Button>} */}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col mt-2 gap-2">
        <form
          onSubmit={e => {
            e.preventDefault();
            sendMessage(value);
          }}
          className="flex gap-2"
        >
          <input
            className="flex-1 border border-accent-light rounded-md px-4 py-2 outline-none"
            placeholder="Pergunte sobre sua viagem, locais, câmbio..."
            value={value}
            onChange={e => setValue(e.target.value)}
            disabled={loading}
            aria-label="Campo de entrada do chat"
          />
          <Button type="submit" disabled={loading || !value.trim()} className="h-10 bg-terracotta hover:bg-terracotta-dark">
            {loading ? <Loader2 className="animate-spin" /> : <ArrowUp />}
          </Button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {QUICK_SUGGESTIONS.map(q => (
            <Button
              key={q}
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => sendMessage(q)}
              disabled={loading}
            >
              {q}
            </Button>
          ))}
        </div>
      </div>
      <ConciergeContextModal open={contextOpen} onClose={() => setContextOpen(false)} userContext={userSampleContext} />
    </section>
  );
};

export default ConciergeChat;
