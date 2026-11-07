import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDevelopmentConfig } from "../check-supabase-development.mjs";

const ref = "abcdefghijklmnopqrst";
const config = {
  VITE_SUPABASE_URL: `https://${ref}.supabase.co`,
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_exemplo_ficticio",
};
// JWTs de teste sem assinatura válida; não são credenciais utilizáveis.
const fakeJwt = (payload) => [
  Buffer.from('{"alg":"HS256"}').toString("base64url"),
  Buffer.from(JSON.stringify(payload)).toString("base64url"),
  "assinatura_ficticia",
].join(".");

test("aceita configuração publishable coerente sem acessar rede", () => {
  assert.deepEqual(validateDevelopmentConfig(config, ref), { projectRef: ref, keyType: "publishable" });
});
test("exige Project Ref explícito e recusa o antigo", () => {
  for (const value of [undefined, "go-nomad-dev", "hxjjdutzpzrchfkrbxcd"]) {
    assert.throws(() => validateDevelopmentConfig(config, value));
  }
});
test("recusa valores ausentes e URL inválida", () => {
  for (const value of [{}, { ...config, VITE_SUPABASE_PUBLISHABLE_KEY: " " },
    { ...config, VITE_SUPABASE_URL: "invalida" }]) {
    assert.throws(() => validateDevelopmentConfig(value, ref));
  }
});
test("recusa outro projeto, HTTP e credenciais/paths na URL", () => {
  for (const url of ["https://hxjjdutzpzrchfkrbxcd.supabase.co", `http://${ref}.supabase.co`,
    `https://${ref}.supabase.co/rest/v1`, `https://${ref}.supabase.co?token=ficticio`,
    `https://${ref}.supabase.co#fragmento`, `https://usuario@${ref}.supabase.co`,
    `https://${ref}.supabase.co:8443`]) {
    assert.throws(() => validateDevelopmentConfig({ ...config, VITE_SUPABASE_URL: url }, ref));
  }
});
test("recusa secret key sem imprimi-la", () => {
  const secret = "sb_secret_valor_ficticio";
  assert.throws(() => validateDevelopmentConfig({ ...config, VITE_SUPABASE_PUBLISHABLE_KEY: secret }, ref),
    (error) => !error.message.includes(secret));
});
test("aceita metadados anon coerentes sem validar assinatura", () => {
  const key = fakeJwt({ role: "anon", ref, exp: 4102444800 });
  assert.equal(validateDevelopmentConfig({ ...config, VITE_SUPABASE_PUBLISHABLE_KEY: key }, ref).keyType, "anon");
});
test("recusa JWT de service_role, outro projeto, expirado ou malformado", () => {
  const keys = [fakeJwt({ role: "service_role", ref }), fakeJwt({ role: "anon", ref: "outro" }),
    fakeJwt({ role: "anon", ref, exp: 1 }), "texto-invalido", "abc.def.ghi"];
  for (const key of keys) {
    assert.throws(() => validateDevelopmentConfig({ ...config, VITE_SUPABASE_PUBLISHABLE_KEY: key }, ref),
      (error) => !error.message.includes(key));
  }
});
