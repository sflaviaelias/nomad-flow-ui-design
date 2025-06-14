
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { messages, userContext } = await req.json();
    // Exemplos de contexto: { name, destination, budget, currency, weather }
    const systemPrompt = `Você é um concierge inteligente do app Go Nomad para nômades digitais. Sempre responda em português, com tom acolhedor, objetivo e contextual ao usuário brasileiro. Utilize o contexto fornecido: ${JSON.stringify(userContext || {})}. Dê respostas práticas, com sugestões acionáveis.`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.77,
      }),
    });
    const ai = await response.json();
    const text = ai.choices?.[0]?.message?.content;
    return new Response(JSON.stringify({ result: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro ao conectar à IA." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
