const privatePaths = new Set(["/trips", "/trip/new", "/trips/upcoming", "/active-trip", "/profile", "/profile/edit", "/settings"]);
const legacyTripPages = new Set(["summary", "smart-summary", "add-expense"]);

/** Only known internal planning/account paths; never forward URLs, query strings or tokens. */
export function safeAuthReturn(state: unknown): string {
  if (!state || typeof state !== "object" || !("from" in state)) return "/trips";
  const from = state.from;
  if (!from || typeof from !== "object" || !("pathname" in from) || typeof from.pathname !== "string") return "/trips";
  const path = from.pathname;
  if (privatePaths.has(path)) return path;
  const match = /^\/trip\/([A-Za-z0-9-]+)$/.exec(path);
  return match && !legacyTripPages.has(match[1]) ? path : "/trips";
}
