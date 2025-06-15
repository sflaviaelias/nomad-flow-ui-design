
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPrompt(type: string, value: any, context: any) {
  // Monta prompt contextual conforme etapa do wizard
  if (type === "destination") {
    return `O usuário está planejando uma viagem. O destino informado foi "${value}". Dê uma dica relevante e curta sobre esse destino, para nômades digitais brasileiros. Inclua curiosidades, clima, vistos ou bairros legais.`;
  }
  if (type === "dates") {
    return `O destino da viagem é "${context.destination}". As datas informadas são início: ${value.start}, fim: ${value.end}. Dê uma curiosidade contextual ou alerta sobre clima, eventos ou aspectos sazonais nesse período para essa cidade, falando diretamente com a pessoa como um concierge brasileiro.`;
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

    // Prompt adequado conforme etapa e contexto
    const prompt = buildPrompt(type, value, context);

    const model = type === "suggestions" ? "gpt-4o" : "gpt-4o-mini";

    const messages = [{
      role: "system",
      content: "Responda SEMPRE em português (Brasil), de forma simpática, sucinta e bem contextual para nômades digitais brasileiros.",
    }, {
      role: "user",
      content: prompt
    }];

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        ...(type === "suggestions" && { response_format: { type: "json_object" } }),
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const resData = await aiResponse.json();
    let output;

    if (type === "suggestions") {
      // Espera: { "sugestoes": [ ... ] }
      output = (() => {
        try {
          return JSON.parse(resData.choices?.[0]?.message?.content ?? "");
        } catch {
          return { sugestoes: [] };
        }
      })();
      return new Response(JSON.stringify(output.sugestoes || []), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Qualquer outro caso: devolve texto simples
    const aiText = resData.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ iaText }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Travel AI Function erro:", err);
    return new Response(JSON.stringify({ error: "Falha ao obter resposta da IA" }), { status: 500, headers: corsHeaders });
  }
});
