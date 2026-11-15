
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get("GO-NOMAD-GROQ");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPrompt(type: string, value: unknown, context: { destination?: string; dates?: { start?: string; end?: string }; budget?: string | number }) {
  if (type === "destination") {
    return `O usuário está planejando uma viagem. O destino informado foi "${value}". Dê uma dica relevante e curta sobre esse destino, para nômades digitais brasileiros. Inclua curiosidades, clima, vistos ou bairros legais.`;
  }
  if (type === "dates") {
    return `O destino da viagem é "${context.destination}". As datas informadas são início: ${(value as { start?: string }).start}, fim: ${(value as { end?: string }).end}. Dê uma curiosidade contextual ou alerta sobre clima, eventos ou aspectos sazonais nesse período para essa cidade, falando diretamente com a pessoa como um concierge brasileiro.`;
  }
  if (type === "budget") {
    return `O destino da viagem é "${context.destination}" entre ${context.dates?.start} e ${context.dates?.end}. O orçamento estimado informado pelo usuário é ${value}. Sugira como dividir o orçamento, para quantos dias rende, e conselhos práticos para economia (de maneira sucinta, em português, estilo amigável).`;
  }
  if (type === "suggestions") {
    return `Destino: "${context.destination}". Datas: ${context.dates?.start} até ${context.dates?.end}. Orçamento: ${context.budget || "não informado"}.
Responda em JSON compacto, uma lista chamada "sugestoes", com até 4 sugestões para o roteiro, recomendações de locais (atrações ou coworkings), checklist (principalmente itens úteis mas esquecidos) e ideias personalizadas para nômades digitais brasileiros.`;
  }
  return `Seja um assistente de planejamento de viagem para nômades digitais brasileiros!`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, value, context } = await req.json();

    if (!groqApiKey) {
      console.error("[travel-ai-wizard] configuration_missing");
      return new Response(JSON.stringify({ error: "Groq API Key não configurada" }), { status: 500, headers: corsHeaders });
    }

    const prompt = buildPrompt(type, value, context);

    const systemPrompt = "Responda SEMPRE em português (Brasil), de forma simpática, sucinta e bem contextual para nômades digitais brasileiros.";
    const model = "llama3-70b-8192";

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ];

    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 500,
        temperature: 0.7,
        ...(type === "suggestions" && { response_format: { type: "json_object" } }),
      }),
    });

    console.info("[travel-ai-wizard] provider_response", aiResponse.status);

    const resText = await aiResponse.text();

    let resData: { error?: unknown; choices?: { message?: { content?: string } }[] };
    try {
      resData = JSON.parse(resText);
    } catch (err) {
      console.error("[travel-ai-wizard] provider_json_invalid");
      return new Response(JSON.stringify({ error: "Erro ao parsear resposta Groq", debug: resText }), { status: 502, headers: corsHeaders });
    }

    if (aiResponse.status !== 200) {
      return new Response(JSON.stringify({ error: resData.error || "Erro na Groq API", debug: resData }), { status: 502, headers: corsHeaders });
    }

    if (type === "suggestions") {
      // Espera: { "sugestoes": [ ... ] }
      let output;
      try {
        output = JSON.parse(resData.choices?.[0]?.message?.content ?? "");
      } catch (err) {
        console.error("[travel-ai-wizard] suggestions_json_invalid");
        output = { sugestoes: [] };
      }
      return new Response(JSON.stringify(output.sugestoes || []), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Outros tipos: devolve texto simples
    const aiText = resData.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ iaText: aiText }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("[travel-ai-wizard] request_failed");
    return new Response(JSON.stringify({ error: "Falha ao obter resposta da IA", debug: String(err) }), { status: 500, headers: corsHeaders });
  }
});
