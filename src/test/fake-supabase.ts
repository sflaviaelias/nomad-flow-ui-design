import { vi } from "vitest";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { Trip } from "@/lib/trips";

export function createFakeSupabase() {
  let session: Session | null = null;
  let listener: ((event: AuthChangeEvent, next: Session | null) => void) | null = null;
  const accounts = new Map<string, { id: string; password: string; confirmed: boolean }>();
  const rows: Trip[] = [];
  const queries: { table: string; filters: [string, unknown][] }[] = [];
  let loseResponse = false;
  let rejectInsert = false;
  let logoutFailure = false;
  let missingProfile = false;
  let gate: Promise<void> | null = null;
  const emit = (event: AuthChangeEvent) => listener?.(event, session);
  function login(email: string) {
    session = { access_token: "ficticio", refresh_token: "ficticio", expires_in: 3600, token_type: "bearer",
      user: { id: accounts.get(email).id, email } } as Session;
    emit("SIGNED_IN");
  }
  const insert = vi.fn();
  const upsert = vi.fn(() => { throw new Error("O frontend não deve criar perfis."); });
  const client = {
    auth: {
      getSession: vi.fn(async () => ({ data: { session }, error: null })),
      getUser: vi.fn(async () => ({ data: { user: session?.user ?? null }, error: null })),
      onAuthStateChange: vi.fn((callback: typeof listener) => {
        listener = callback;
        return { data: { subscription: { unsubscribe: () => { listener = null; } } } };
      }),
      signUp: vi.fn(async ({ email, password }: { email: string; password: string }) => {
        accounts.set(email, { id: `user-${accounts.size + 1}`, password, confirmed: false });
        return { data: { user: { id: accounts.get(email).id }, session: null }, error: null };
      }),
      signInWithPassword: vi.fn(async ({ email, password }: { email: string; password: string }) => {
        const account = accounts.get(email);
        if (!account || account.password !== password) return { error: { code: "invalid_credentials" } };
        if (!account.confirmed) return { error: { code: "email_not_confirmed" } };
        login(email);
        return { data: { session }, error: null };
      }),
      signOut: vi.fn(async () => {
        if (logoutFailure) return { error: new Error("offline") };
        session = null;
        emit("SIGNED_OUT");
        return { error: null };
      }),
      exchangeCodeForSession: vi.fn(async () => ({ data: { session }, error: null })),
    },
    functions: { invoke: vi.fn(async () => ({ data: null, error: new Error("IA indisponível") })) },
    from: vi.fn((table: string) => {
      const filters: [string, unknown][] = [];
      let payload: Trip | null = null;
      queries.push({ table, filters });
      async function execute(single = false) {
        if (table === "profiles") {
          const id = filters.find(([key]) => key === "id")?.[1];
          return { data: !missingProfile && Array.from(accounts.values()).some((a) => a.id === id) ? { id, preferences: {} } : null, error: null };
        }
        if (payload) {
          insert(payload);
          if (gate) await gate;
          if (rejectInsert) return { data: null, error: new Error("offline") };
          if (!rows.some((r) => r.id === payload.id)) rows.push(payload);
          if (loseResponse) { loseResponse = false; return { data: null, error: new Error("Resposta perdida") }; }
        }
        const selected = rows.filter((r) => filters.every(([key, value]) => r[key] === value));
        return { data: single ? (selected[0] ?? null) : selected, error: null };
      }
      const builder = {
        select: () => builder,
        eq: (key: string, value: unknown) => { filters.push([key, value]); return builder; },
        order: () => builder,
        abortSignal: () => builder,
        insert: (value: Trip) => { payload = value; return builder; },
        upsert,
        single: () => execute(true),
        maybeSingle: () => execute(true),
        then: (resolve: (value: Awaited<ReturnType<typeof execute>>) => unknown, reject: (error: unknown) => unknown) => execute().then(resolve, reject),
      };
      return builder;
    }),
  };
  return {
    client, rows, queries, insert, upsert,
    clear: vi.fn(() => { session = null; sessionStorage.clear(); localStorage.clear(); }),
    register(email = "ana@example.test", id = "user-1") { accounts.set(email, { id, password: "Senha!123", confirmed: true }); login(email); },
    confirm(email: string, activate = false) { accounts.get(email).confirmed = true; if (activate) login(email); },
    loseNextResponse() { loseResponse = true; },
    failInsert(value = true) { rejectInsert = value; },
    failLogout() { logoutFailure = true; },
    removeProfile() { missingProfile = true; },
    delayInsert(promise: Promise<void>) { gate = promise; },
    switchUser() { accounts.set("bia@example.test", { id: "user-2", password: "Senha!123", confirmed: true }); login("bia@example.test"); },
    reset() {
      session = null; listener = null; rows.length = 0; queries.length = 0; accounts.clear();
      loseResponse = false; rejectInsert = false; logoutFailure = false; missingProfile = false; gate = null;
      vi.clearAllMocks();
    },
  };
}
