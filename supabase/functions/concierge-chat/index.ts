
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get("GO-NOMAD-GROQ");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { messages, userContext } = await req.json();
    const systemPrompt = `Você é um concierge inteligente do app Go Nomad para nômades digitais. Sempre responda em português, com tom acolhedor, objetivo e contextual ao usuário brasileiro. Utilize o contexto fornecido: ${JSON.stringify(userContext || {})}. Dê respostas práticas, com sugestões acionáveis.`;

    if (!groqApiKey) {
      console.error("[concierge-chat] configuration_missing");
      return new Response(
        JSON.stringify({ error: "Groq API Key não configurada" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          ...(messages || [])
        ],
        max_tokens: 500,
        temperature: 0.77,
      }),
    });

    // Only a fixed event and the numeric HTTP status enter application logs.
    console.info("[concierge-chat] provider_response", response.status);

    const textResult = await response.text();

    let ai;
    try {
      ai = JSON.parse(textResult);
    } catch (err) {
      console.error("[concierge-chat] provider_json_invalid");
      return new Response(JSON.stringify({ error: "Resposta não é JSON válido", debug: textResult }), { status: 502, headers: corsHeaders });
    }

    const text = ai.choices?.[0]?.message?.content;
    if (!text) {
      console.error("[concierge-chat] provider_result_missing");
      return new Response(JSON.stringify({ error: "Groq não retornou resposta válida", ai }), { status: 502, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ result: text }), {
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("[concierge-chat] request_failed");
    return new Response(JSON.stringify({
      error: "Erro ao conectar à IA.",
      debug: typeof err === "object" && err?.message ? err.message : String(err)
    }), {
      status: 400,
      headers: corsHeaders
    });
  }
});
