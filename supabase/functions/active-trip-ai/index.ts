
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
    const { nationality, destination, tripStart, tripEnd, budget, currency, spent } = await req.json();

    const systemPrompt = `
Você é um assistente de viagens para nômades digitais brasileiros. Aja como concierge, sendo objetivo, natural e acolhedor. 
Responda em JSON. Contexto:
- Nacionalidade do usuário: ${nationality ? nationality : "não informada"}
- Destino: ${destination}
- Orçamento: ${budget} ${currency}
- Período: ${tripStart} a ${tripEnd}
- Já gasto: ${spent || 0}
Responda:
{
  "visa_required": true|false|null,
  "vaccines_required": true|false|null,
  "comment": "Mensagem curta sobre orçamento, dias restantes etc. Para banner",
  "progress_comment": "Mensagem curta se o orçamento passa de 75%, personalizada"
}
`;

    const today = new Date();
    const end = tripEnd ? new Date(tripEnd) : null;
    const remainingDays = end ? Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : null;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    const ai = await res.json();
    const text = ai.choices?.[0]?.message?.content ?? "{}";

    // Ensure it is valid JSON, fallback if parse error
    let output;
    try {
      output = JSON.parse(text);
    } catch {
      output = {};
    }

    return new Response(JSON.stringify({
      ...output,
      remainingDays,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro na função IA." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
