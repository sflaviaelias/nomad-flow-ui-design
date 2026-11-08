import { createClient } from "npm:@supabase/supabase-js@2.50.0";
import { findPhoto, getOrSelectCover, type CoverRecord, type CoverStore } from "./core.ts";

Deno.serve(async (request: Request) => {
  const origin = Deno.env.get("TRIP_COVER_ALLOWED_ORIGIN") || "http://localhost:8080";
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Origin",
    "Access-Control-Allow-Origin": origin || "http://localhost:8080", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS" };
  const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
  if (request.headers.get("origin") && request.headers.get("origin") !== origin) return reply({ error: "Origem não autorizada." }, 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return reply({ error: "Método não permitido." }, 405);
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return reply({ error: "Sessão necessária." }, 401);
    const url = Deno.env.get("SUPABASE_URL")!, publicKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const client = createClient(url, publicKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: { user }, error: authError } = await client.auth.getUser(authorization.slice(7));
    if (authError || !user) return reply({ error: "Sessão inválida." }, 401);
    const body = await request.json();
    if (typeof body.tripId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.tripId)) return reply({ error: "Viagem inválida." }, 400);
    // RLS + filtro explícito: nenhuma leitura privilegiada antes de provar a propriedade.
    const { data: trip, error } = await client.from("trips").select("id,destination").eq("id", body.tripId).eq("user_id", user.id).maybeSingle();
    if (error) throw new Error("Consulta indisponível");
    if (!trip) return reply({ error: "Viagem indisponível." }, 404);
    const key = Deno.env.get("UNSPLASH_ACCESS_KEY");
    if (!key) return reply({ status: "unavailable", photo: null });
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const store: CoverStore = {
      async read(tripId) {
        const { data, error } = await admin.from("trip_covers").select("*").eq("trip_id", tripId).maybeSingle();
        if (error) throw new Error("Cache indisponível");
        return data as CoverRecord | null;
      },
      async claim(tripId, destination, existing, now) {
        const requestKey = crypto.randomUUID();
        const values = { trip_id: tripId, destination, status: "pending", photo: null, request_key: requestKey,
          retry_after: new Date(now.getTime() + 90_000).toISOString() };
        if (!existing) {
          const { error } = await admin.from("trip_covers").insert(values);
          if (error?.code === "23505") return null;
          if (error) throw new Error("Cache indisponível");
          return requestKey;
        }
        const { data, error } = await admin.from("trip_covers").update(values).eq("trip_id", tripId).eq("request_key", existing.request_key).select("trip_id").maybeSingle();
        if (error) throw new Error("Cache indisponível");
        return data ? requestKey : null;
      },
      async finish(tripId, requestKey, result) {
        const { data, error } = await admin.from("trip_covers").update(result).eq("trip_id", tripId).eq("request_key", requestKey).select("trip_id").maybeSingle();
        if (error) throw new Error("Cache indisponível");
        return !!data;
      },
    };
    return reply(await getOrSelectCover(trip.id, trip.destination, store, (destination) => findPhoto(destination, key)));
  } catch {
    return reply({ error: "Capa temporariamente indisponível." }, 503);
  }
});
