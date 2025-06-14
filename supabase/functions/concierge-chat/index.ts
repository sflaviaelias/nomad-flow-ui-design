
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get("GO-NOMAD-GROQ");

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
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: "Groq API Key não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Altere aqui para o modelo suportado pela Groq, como llama3-70b-8192
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // Confirme na doc Groq se prefere outro modelo!
        messages: [
          { role: "system", content: systemPrompt },
          ...(messages || [])
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
