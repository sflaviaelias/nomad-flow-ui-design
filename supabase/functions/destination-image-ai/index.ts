
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS configs
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Função principal
serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verifica body válido
  let destination: string | undefined = undefined;
  try {
    const body = await req.json();
    destination = body.destination;
    if (!destination || typeof destination !== "string" || !destination.trim()) {
      return new Response(JSON.stringify({ error: "Campo 'destination' obrigatório" }), { status: 400, headers: corsHeaders });
    }
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400, headers: corsHeaders });
  }

  // Prompt customizado
  const prompt = `Foto realista, vibrante, linda paisagem urbana ou natural de ${destination}, clima agradável, alta qualidade.`;

  // Pega a chave GROQ do ambiente
  const groqApiKey = Deno.env.get("GO-NOMAD-GROQ");
  if (!groqApiKey) {
    return new Response(JSON.stringify({ error: "Groq API Key não configurada" }), { status: 500, headers: corsHeaders });
  }

  try {
    // Configuração do endpoint de geração de imagem.
    // ATENÇÃO: O endpoint abaixo é ilustrativo. Consulte sua documentação Groq para URL e payload corretos.
    const res = await fetch("https://api.groq.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: "Erro da API Groq", details: text }), { status: res.status, headers: corsHeaders });
    }

    const data = await res.json();
    // Espera-se um campo data.images[0].b64_json — ajuste conforme resposta real da Groq!
    const imageBase64 = data.data?.[0]?.b64_json;
    if (imageBase64) {
      return new Response(JSON.stringify({
        image_url: `data:image/png;base64,${imageBase64}`,
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Não foi possível gerar imagem" }), { status: 500, headers: corsHeaders });
  } catch (error) {
    console.error("Erro na chamada Groq: ", error);
    return new Response(JSON.stringify({ error: "Erro interno ao gerar imagem", details: String(error) }), { status: 500, headers: corsHeaders });
  }
});
