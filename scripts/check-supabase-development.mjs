// Verificação offline: não cria cliente Supabase nem faz solicitações de rede.
import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const LEGACY_PROJECT_REF = "hxjjdutzpzrchfkrbxcd";

export function validateDevelopmentConfig(config, expectedRef) {
  if (!/^[a-z0-9]{20}$/.test(expectedRef ?? "") || expectedRef === LEGACY_PROJECT_REF) {
    throw new Error("Informe o Project Ref real do go-nomad-dev, diferente do projeto antigo.");
  }
  const rawUrl = config.VITE_SUPABASE_URL?.trim();
  const key = config.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!rawUrl || !key) {
    throw new Error("Preencha VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY para development.");
  }
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("VITE_SUPABASE_URL deve ser uma URL HTTPS válida.");
  }
  if (url.protocol !== "https:" || url.hostname !== `${expectedRef}.supabase.co`
      || url.username || url.password || url.port || url.search || url.hash
      || !/^\/*$/.test(url.pathname)) {
    throw new Error("A URL não corresponde exatamente ao Project Ref de desenvolvimento informado.");
  }
  if (key.startsWith("sb_secret_")) {
    throw new Error("Chave privada recusada: use somente publishable ou anon pública.");
  }
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
    return { projectRef: expectedRef, keyType: "publishable" };
  }
  try {
    const segments = key.split(".");
    if (segments.length !== 3 || segments.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) {
      throw new Error();
    }
    const payload = JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8"));
    if (payload.role !== "anon" || payload.ref !== expectedRef
        || (payload.exp !== undefined
            && (typeof payload.exp !== "number" || payload.exp <= Date.now() / 1000))) {
      throw new Error();
    }
    return { projectRef: expectedRef, keyType: "anon" };
  } catch {
    throw new Error("Chave pública não reconhecida, expirada ou incompatível com o Project Ref informado.");
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 4 || process.argv[2] !== "--project-ref") {
      throw new Error("Uso: node scripts/check-supabase-development.mjs --project-ref <PROJECT_REF>");
    }
    const config = loadEnv("development", process.cwd(), "VITE_SUPABASE_");
    const result = validateDevelopmentConfig(config, process.argv[3]);
    console.log(`Configuração development coerente para ${result.projectRef}; tipo ${result.keyType}.`);
    console.log("Nenhuma conexão realizada. Validade da chave e identidade do projeto exigem confirmação posterior.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
