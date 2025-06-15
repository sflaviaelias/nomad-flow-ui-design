
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

  const unsplashKey = Deno.env.get("UNSPLASH_ACCESS_KEY");
  if (!unsplashKey) {
    return new Response(JSON.stringify({ error: "Chave Unsplash não configurada" }), { status: 500, headers: corsHeaders });
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&orientation=landscape&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${unsplashKey}`,
        },
      }
    );
    const data = await res.json();
    if (data.results?.[0]?.urls?.regular) {
      return new Response(JSON.stringify({ image_url: data.results[0].urls.regular }), { headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({ image_url: null }), { headers: corsHeaders });
    }
  } catch (error) {
    console.error("Erro ao buscar imagem Unsplash:", error);
    return new Response(JSON.stringify({ error: "Erro ao buscar imagem Unsplash", details: String(error) }), { status: 500, headers: corsHeaders });
  }
});
