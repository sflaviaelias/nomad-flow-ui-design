
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get("GO-NOMAD-GROQ");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { messages, userContext } = await req.json();
    const systemPrompt = `Você é um concierge inteligente do app Go Nomad para nômades digitais. Sempre responda em português, com tom acolhedor, objetivo e contextual ao usuário brasileiro. Utilize o contexto fornecido: ${JSON.stringify(userContext || {})}. Dê respostas práticas, com sugestões acionáveis.`;

    if (!groqApiKey) {
      console.error("[Concierge-Chat] Falta chave GO-NOMAD-GROQ");
      return new Response(
        JSON.stringify({ error: "Groq API Key não configurada" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Log do payload antes de enviar pro Groq
    console.log("[Concierge-Chat] Enviando para Groq:", {
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        ...(messages || [])
      ]
    });

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

    // Log do status recebido
    console.log("[Concierge-Chat] Status de resposta Groq:", response.status, response.statusText);

    const textResult = await response.text();
    console.log("[Concierge-Chat] Corpo da resposta Groq:", textResult);

    let ai;
    try {
      ai = JSON.parse(textResult);
    } catch (err) {
      console.error("[Concierge-Chat] Erro ao fazer parse do JSON Groq:", err, textResult);
      return new Response(JSON.stringify({ error: "Resposta não é JSON válido", debug: textResult }), { status: 502, headers: corsHeaders });
    }

    const text = ai.choices?.[0]?.message?.content;
    if (!text) {
      return new Response(JSON.stringify({ error: "Groq não retornou resposta válida", ai }), { status: 502, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ result: text }), {
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("[Concierge-Chat] Erro inesperado:", err);
    return new Response(JSON.stringify({ error: "Erro ao conectar à IA.", debug: String(err) }), {
      status: 400,
      headers: corsHeaders
    });
  }
});
