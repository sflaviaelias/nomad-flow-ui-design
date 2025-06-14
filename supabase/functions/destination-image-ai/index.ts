
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
  let bodyJson;
  try {
    bodyJson = await req.json();
  } catch (err) {
    console.error("[Request JSON parse ERROR]", err);
    return new Response(JSON.stringify({ error: "JSON inválido na requisição" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { destination } = bodyJson ?? {};
  if (!destination) {
    console.warn("[Missing destination]", bodyJson);
    return new Response(JSON.stringify({ error: "Missing destination" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!groqApiKey) {
    console.warn("[No GROQ API KEY]");
    return new Response(JSON.stringify({ error: "GO-NOMAD-GROQ not configured" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Prompt detalhado e explícito para Groq.
  const prompt = [
    {
      role: "system",
      content:
        "Você é um assistente especializado em viagens para nômades digitais. Quando receber um destino (cidade, país), responda única e exclusivamente com uma URL de imagem adequada e inspiradora desse local, preferencialmente do Unsplash, e que seja paisagem ou ícone visual reconhecível do destino (ex: ponto turístico famoso, paisagem urbana, praia famosa etc). Forneça apenas a URL, sem comentários ou texto adicional.",
    },
    { role: "user", content: `Destino: ${destination}` },
  ];

  const groqPayload = {
    model: "llama-3-70b-8192", // modelo Groq LLM estável
    messages: prompt,
    max_tokens: 128,
    temperature: 0.5,
  };

  // Log do payload
  console.log("[GROQ Request Payload]", JSON.stringify(groqPayload));

  let rawGroq;
  let groqErrorDetail = "";
  let statusCode = 500;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groqPayload),
    });

    // Log status
    console.log("[GROQ Response Status]", response.status);

    if (!response.ok) {
      rawGroq = await response.text();
      groqErrorDetail = rawGroq;
      console.error("[Groq API ERROR]", rawGroq);

      // Verificação direta por problemas clássicos
      if (groqErrorDetail.includes("model not found")) {
        statusCode = 422;
        return new Response(
          JSON.stringify({
            error: "Erro na Groq: modelo não encontrado",
            details: groqErrorDetail
          }),
          {
            status: statusCode,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (groqErrorDetail.toLowerCase().includes("timeout")) {
        statusCode = 504;
        return new Response(
          JSON.stringify({
            error: "Timeout ao consultar a Groq",
            details: groqErrorDetail,
          }),
          {
            status: statusCode,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Genérico
      return new Response(
        JSON.stringify({
          error: "Erro ao buscar imagem na Groq",
          details: groqErrorDetail,
        }),
        {
          status: statusCode,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Tenta parsear a resposta JSON
    let ai;
    try {
      ai = await response.json();
      console.log("[GROQ JSON Response]", JSON.stringify(ai));
    } catch (err) {
      console.error("[Groq JSON parse error]", err);
      return new Response(
        JSON.stringify({ error: "Groq API retornou resposta inválida", details: err && (err.message || err.toString()) }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let url = ai.choices?.[0]?.message?.content?.trim() ?? "";
    url = url.replace(/^["']|["']$/g, "");

    // Fallback para Unsplash se necessário (resposta não é URL)
    if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp)/i.test(url)) {
      url = `https://source.unsplash.com/900x600/?${encodeURIComponent(destination)},landscape`;
      console.warn("[Fallback] Resposta da IA não era URL, usando Unsplash:", url);
    }

    return new Response(JSON.stringify({ image_url: url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[Function ERROR]", err, { err });
    return new Response(JSON.stringify({
      error: "Erro ao gerar imagem para destino",
      exception: err && (err.message || err.toString()),
      extra: groqErrorDetail
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
