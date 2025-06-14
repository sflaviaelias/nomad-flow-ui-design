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
    const { destination } = await req.json();
    if (!destination) {
      return new Response(JSON.stringify({ error: "Missing destination" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!groqApiKey) {
      return new Response(JSON.stringify({ error: "GO-NOMAD-GROQ not configured" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prompt Groq para buscar uma URL de imagem inspiradora no Unsplash para o destino
    const prompt = [
      {
        role: "system",
        content:
          "Você é um assistente especializado em viagens para nômades digitais. Quando receber um destino (cidade, país), responda única e exclusivamente com uma URL de imagem adequada e inspiradora desse local, preferencialmente do Unsplash, e que seja paisagem ou ícone visual reconhecível do destino (ex: ponto turístico famoso, paisagem urbana, praia famosa etc). Se possível, forneça uma URL pronta para ser usada diretamente como imagem no app, sem comentários ou texto adicional, apenas a URL.",
      },
      { role: "user", content: `Destino: ${destination}` },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Modelo alterado para maior estabilidade Groq:
        model: "llama-3.3-70b-versatile",
        messages: prompt,
        max_tokens: 128,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const rawError = await response.text();
      console.error("[Groq API ERROR]", rawError);
      return new Response(
        JSON.stringify({
          error: "Erro ao buscar imagem na Groq",
          details: rawError,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let ai;
    try {
      ai = await response.json();
    } catch (err) {
      console.error("[Groq JSON parse error]", err);
      return new Response(
        JSON.stringify({
          error: "Groq API retornou resposta inválida",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let url = ai.choices?.[0]?.message?.content?.trim() ?? "";
    url = url.replace(/^["']|["']$/g, "");

    // Se não for uma URL, faz um fallback generoso para Unsplash
    if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp)/i.test(url)) {
      url = `https://source.unsplash.com/900x600/?${encodeURIComponent(destination)},landscape`;
    }

    return new Response(JSON.stringify({ image_url: url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Function ERROR]", err);
    return new Response(JSON.stringify({ error: "Erro ao gerar imagem para destino" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
