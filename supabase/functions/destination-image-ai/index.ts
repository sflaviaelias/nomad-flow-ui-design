
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve((req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  // Resposta simples para conferência de deploy
  return new Response(JSON.stringify({ message: "Hello, world!" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
