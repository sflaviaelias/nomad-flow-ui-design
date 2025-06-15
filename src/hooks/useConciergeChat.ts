
import { useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export const SUPABASE_CONCIERGE_FN_URL =
  "https://hxjjdutzpzrchfkrbxcd.functions.supabase.co/concierge-chat";

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

export function useConciergeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Envia mensagem para Edge Function (com tratamento de token!)
  const sendMessage = async (question: string) => {
    if (!question.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: question }]);
    setValue("");
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch(
        SUPABASE_CONCIERGE_FN_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
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

  return {
    messages,
    loading,
    value,
    setValue,
    sendMessage,
    chatEndRef,
    quickSuggestions: QUICK_SUGGESTIONS,
    userSampleContext,
  };
}
