/** Sem credenciais ou dependências de runtime; testes usam HTTP e armazenamento simulados. */
export type CoverPhoto = {
  provider: "unsplash"; id: string; url: string; photoUrl: string;
  photographer: string; photographerUrl: string; destinationKey: string;
};
export type CoverResult = { status: "ready" | "pending" | "unavailable"; photo: CoverPhoto | null };
export type CoverRecord = CoverResult & { destination: string; request_key: string; retry_after: string };
export const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
const countries: Record<string, string[]> = {
  AL: ["Albania", "Albânia", "Shqipëria"], BR: ["Brazil", "Brasil"], PT: ["Portugal"],
  FR: ["France", "França"], ES: ["Spain", "Espanha", "España"], IT: ["Italy", "Itália", "Italia"],
  GB: ["United Kingdom", "Reino Unido"], JP: ["Japan", "Japão"], US: ["United States", "Estados Unidos", "USA"],
  AR: ["Argentina"], CL: ["Chile"], PE: ["Peru"], GR: ["Greece", "Grécia"], DE: ["Germany", "Alemanha"],
};
const cities: [string, string[]][] = [
  ["AL", ["Tirana", "Tiranë"]], ["PT", ["Porto", "Oporto"]], ["PT", ["Lisbon", "Lisboa"]],
  ["FR", ["Paris"]], ["BR", ["Rio de Janeiro"]], ["BR", ["São Paulo", "Sao Paulo"]], ["BR", ["Recife"]],
  ["ES", ["Barcelona"]], ["IT", ["Rome", "Roma"]], ["GB", ["London", "Londres"]], ["JP", ["Tokyo", "Tóquio"]],
];
export function resolveDestination(input: string) {
  const value = normalize(input);
  for (const [code, names] of Object.entries(countries)) {
    if (names.some((name) => normalize(name) === value)) return { key: code, country: names, city: null, query: names[0] };
    for (const [cityCode, namesOfCity] of cities) {
      if (cityCode !== code) continue;
      if (names.some((country) => namesOfCity.some((city) => normalize(`${city}, ${country}`) === value))) {
        return { key: `${code}:${normalize(namesOfCity[0])}`, country: names, city: namesOfCity, query: `${namesOfCity[0]}, ${names[0]}` };
      }
    }
  }
  // Sem país/cidade desambiguados, não presumir localização a partir do título de uma foto.
  return null;
}
export function safeProviderUrl(value: unknown, host: "images.unsplash.com" | "unsplash.com"): value is string {
  if (typeof value !== "string") return false;
  try { const u = new URL(value); return u.protocol === "https:" && u.hostname === host && !u.username && !u.password && !u.port; }
  catch { return false; }
}
export function isCoverPhoto(value: unknown, destination: string): value is CoverPhoto {
  const p = value as CoverPhoto;
  return !!p && p.provider === "unsplash" && typeof p.id === "string" && /^[\w-]+$/.test(p.id)
    && typeof p.photographer === "string" && !!p.photographer.trim()
    && p.destinationKey === resolveDestination(destination)?.key
    && safeProviderUrl(p.url, "images.unsplash.com") && safeProviderUrl(p.photoUrl, "unsplash.com") && safeProviderUrl(p.photographerUrl, "unsplash.com");
}
function attributionUrl(url: string) {
  const result = new URL(url);
  result.searchParams.set("utm_source", "go_nomad"); result.searchParams.set("utm_medium", "referral");
  return result.toString();
}
export async function findPhoto(destination: string, key: string, http: typeof fetch = fetch): Promise<CoverPhoto | null> {
  const place = resolveDestination(destination);
  if (!place || !key) return null;
  const headers = { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" };
  const get = async (url: string) => {
    const response = await http(url, { headers, signal: AbortSignal.timeout(7000), redirect: "error" });
    if (!response.ok) throw new Error("Provedor de imagens indisponível.");
    return response.json();
  };
  const search = new URL("https://api.unsplash.com/search/photos");
  search.search = new URLSearchParams({ query: place.query, orientation: "landscape", per_page: "3", content_filter: "high" }).toString();
  const result = await get(search.toString());
  if (!Array.isArray(result.results)) return null;
  for (const candidate of result.results.slice(0, 3)) {
    if (typeof candidate.id !== "string" || !/^[\w-]+$/.test(candidate.id)) continue;
    const photo = await get(`https://api.unsplash.com/photos/${candidate.id}`);
    const location = photo.location;
    if (!location || typeof location.country !== "string" || !place.country.some((name) => normalize(name) === normalize(location.country))) continue;
    if (place.city && (typeof location.city !== "string" || !place.city.some((name) => normalize(name) === normalize(location.city)))) continue;
    const lat = location.position?.latitude, lng = location.position?.longitude;
    // Exigir geotag real; para Albânia, também rejeitar pontos fora de seus limites aproximados.
    if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng)
        || Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
    if (place.key.startsWith("AL") && (lat < 39.64 || lat > 42.67 || lng < 19.26 || lng > 21.10)) continue;
    if (!(photo.width >= photo.height)) continue;
    const cover: CoverPhoto = { provider: "unsplash", id: photo.id, url: photo.urls?.regular,
      photoUrl: photo.links?.html, photographer: photo.user?.name, photographerUrl: photo.user?.links?.html, destinationKey: place.key };
    if (photo.id !== candidate.id || !isCoverPhoto(cover, destination)) continue;
    // A seleção automática como capa é uso equivalente a download nas diretrizes da API.
    await get(`https://api.unsplash.com/photos/${photo.id}/download`);
    return { ...cover, photoUrl: attributionUrl(cover.photoUrl), photographerUrl: attributionUrl(cover.photographerUrl) };
  }
  return null;
}

export interface CoverStore {
  read(tripId: string): Promise<CoverRecord | null>;
  claim(tripId: string, destination: string, existing: CoverRecord | null, now: Date): Promise<string | null>;
  finish(tripId: string, requestKey: string, result: CoverRecord): Promise<boolean>;
}
export async function getOrSelectCover(tripId: string, destination: string, store: CoverStore,
  select: (destination: string) => Promise<CoverPhoto | null>, now = new Date()): Promise<CoverResult> {
  const cached = await store.read(tripId);
  if (cached?.destination === destination) {
    if (cached.status === "ready" && isCoverPhoto(cached.photo, destination)) return { status: "ready", photo: cached.photo };
    if (new Date(cached.retry_after).getTime() > now.getTime()) return { status: cached.status === "pending" ? "pending" : "unavailable", photo: null };
  }
  const requestKey = await store.claim(tripId, destination, cached, now);
  if (!requestKey) return { status: "pending", photo: null };
  let photo: CoverPhoto | null = null;
  try { photo = await select(destination); } catch { /* Fallback e cooldown, sem logs com payloads do provedor. */ }
  if (photo && !isCoverPhoto(photo, destination)) photo = null;
  const result: CoverRecord = { status: photo ? "ready" : "unavailable", photo, destination, request_key: requestKey,
    retry_after: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() };
  const saved = await store.finish(tripId, requestKey, result);
  // Não exibir uma seleção que não foi persistida: reload deve usar a mesma capa.
  return saved ? { status: result.status, photo } : { status: "pending", photo: null };
}
