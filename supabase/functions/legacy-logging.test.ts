import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

const names = ["concierge-chat", "travel-ai-wizard", "destination-image-ai", "destination-image-unsplash", "active-trip-ai"] as const;
type Name = typeof names[number];
type Handler = (request: Request) => Promise<Response>;
const secrets = ["synthetic-bearer-token", "synthetic-provider-key", "private-conversation-content", "private-person@example.test", "raw-provider-payload"];
const sourceOf = (name: Name) => readFileSync(resolve("supabase/functions", name, "index.ts"), "utf8");

// Execute the real serve callback without remote imports, Deno, network or credentials.
// Remove imports through the TypeScript AST; handler statements stay unchanged.
function load(name: Name, fetcher: typeof fetch, configured = true) {
  let handler: Handler;
  const logs: unknown[][] = [];
  const root = ts.createSourceFile(`${name}.ts`, sourceOf(name), ts.ScriptTarget.Latest, true);
  const localSource = ts.createPrinter().printFile(ts.factory.updateSourceFile(root,
    root.statements.filter((statement) => !ts.isImportDeclaration(statement))));
  const output = ts.transpileModule(localSource, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const capture = new Proxy({}, { get: (_target, level) => (...args: unknown[]) => logs.push([String(level), ...args]) });
  runInNewContext(output, {
    serve: (callback: Handler) => { handler = callback; },
    Deno: { env: { get: () => configured ? secrets[1] : undefined } },
    fetch: fetcher, console: capture, Request, Response, URL, exports: {},
  });
  return { invoke: (request: Request) => handler(request), logs };
}
function request(body: unknown, method = "POST") {
  return new Request(`https://example.test/?private=${secrets[3]}`, {
    method, headers: { Authorization: `Bearer ${secrets[0]}`, apikey: secrets[1], "x-private": secrets[3] },
    ...(method !== "OPTIONS" && { body: JSON.stringify(body) }),
  });
}
function input(name: Name) {
  if (name === "concierge-chat") return { messages: [{ role: "user", content: secrets[2] }], userContext: { name: secrets[3] } };
  if (name === "travel-ai-wizard") return { type: "destination", value: secrets[2], context: { destination: secrets[3] } };
  return { destination: secrets[2], nationality: secrets[3], tripEnd: "2030-01-01" };
}
function providerBody(name: Name) {
  if (name === "destination-image-ai") return { data: [{ b64_json: secrets[4] }] };
  if (name === "destination-image-unsplash") return { results: [{ urls: { regular: `https://images.unsplash.com/${secrets[4]}` } }] };
  return { choices: [{ message: { content: name === "active-trip-ai" ? JSON.stringify({ comment: secrets[4] }) : secrets[4] } }] };
}
function assertSafe(logs: unknown[][]) {
  const captured = JSON.stringify(logs);
  for (const secret of secrets) expect(captured).not.toContain(secret);
  for (const [level, event, ...metadata] of logs) {
    expect(["info", "error"]).toContain(level);
    expect(event).toMatch(/^\[(concierge-chat|travel-ai-wizard|destination-image-ai|destination-image-unsplash)\] (configuration_missing|provider_response|provider_json_invalid|provider_result_missing|suggestions_json_invalid|request_failed)$/);
    expect(metadata.length).toBeLessThanOrEqual(1);
    if (metadata.length) { expect(typeof metadata[0]).toBe("number"); expect(Number.isInteger(metadata[0])).toBe(true); }
  }
}

describe.each(names)("%s application logging", (name) => {
  it("preserves successful output and provider requests without logging private inputs or outputs", async () => {
    const http = vi.fn().mockResolvedValue(new Response(JSON.stringify(providerBody(name)), { status: 200, statusText: secrets[0] }));
    const app = load(name, http);
    const response = await app.invoke(request(input(name)));
    expect(response.status).toBe(200);
    const result = await response.json();
    if (name === "concierge-chat") expect(result).toEqual({ result: secrets[4] });
    if (name === "travel-ai-wizard") expect(result).toEqual({ iaText: secrets[4] });
    if (name === "destination-image-ai") expect(result).toEqual({ image_url: `data:image/png;base64,${secrets[4]}` });
    if (name === "destination-image-unsplash") expect(result).toEqual({ image_url: `https://images.unsplash.com/${secrets[4]}` });
    if (name === "active-trip-ai") expect(result).toMatchObject({ comment: secrets[4] });
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(http).toHaveBeenCalledOnce();
    expect(http.mock.calls[0][1].headers.Authorization).toContain(secrets[1]);
    expect(name === "destination-image-unsplash" ? http.mock.calls[0][0] : http.mock.calls[0][1].body).toContain(secrets[2]);
    assertSafe(app.logs);
    if (["concierge-chat", "travel-ai-wizard"].includes(name)) expect(app.logs).toEqual([["info", `[${name}] provider_response`, 200]]);
  });

  it("keeps CORS preflight private and avoids the provider", async () => {
    const http = vi.fn(); const app = load(name, http);
    expect((await app.invoke(request(null, "OPTIONS"))).status).toBe(200);
    expect(http).not.toHaveBeenCalled(); expect(app.logs).toEqual([]);
  });

  it("never logs thrown exception messages, stack, causes or provider response text", async () => {
    const failure = new Error(secrets.join(" "), { cause: { token: secrets[0] } });
    const http = vi.fn().mockRejectedValue(failure); const app = load(name, http);
    const response = await app.invoke(request(input(name)));
    expect(response.status).toBe(name === "concierge-chat" || name === "active-trip-ai" ? 400 : 500);
    assertSafe(app.logs);
    if (name !== "active-trip-ai") expect(app.logs).toContainEqual(["error", `[${name}] request_failed`]);
  });

  it("handles malformed provider JSON without logging the raw body or parser exception", async () => {
    const http = vi.fn().mockResolvedValue(new Response(secrets.join(" "), { status: 200 }));
    const app = load(name, http); const response = await app.invoke(request(input(name)));
    expect(response.status).toBe(name === "concierge-chat" || name === "travel-ai-wizard" ? 502 : name === "active-trip-ai" ? 400 : 500);
    assertSafe(app.logs);
  });

  it("does not log malformed private request bodies", async () => {
    const http = vi.fn(); const app = load(name, http);
    const response = await app.invoke(new Request("https://example.test", { method: "POST", body: secrets.join(" ") }));
    expect(response.status).toBe(name === "travel-ai-wizard" ? 500 : 400);
    expect(http).not.toHaveBeenCalled(); assertSafe(app.logs);
  });
});

it.each(["concierge-chat", "travel-ai-wizard", "destination-image-ai", "destination-image-unsplash"] as const)("%s preserves missing configuration errors without logging credentials", async (name) => {
  const http = vi.fn(); const app = load(name, http, false);
  expect((await app.invoke(request(input(name)))).status).toBe(500);
  expect(http).not.toHaveBeenCalled(); assertSafe(app.logs);
});

it("preserves wizard suggestions and their malformed-content fallback without logging either", async () => {
  for (const content of [JSON.stringify({ sugestoes: [secrets[2]] }), secrets.join(" ")]) {
    const app = load("travel-ai-wizard", vi.fn().mockResolvedValue(Response.json({ choices: [{ message: { content } }] })));
    const response = await app.invoke(request({ type: "suggestions", context: { destination: secrets[3] } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(content.startsWith("{") ? [secrets[2]] : []);
    assertSafe(app.logs);
  }
});

it.each(["concierge-chat", "travel-ai-wizard"] as const)("%s reports provider failure using only its numeric status", async (name) => {
  const app = load(name, vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: secrets.join(" ") }), { status: 429, statusText: secrets[3] })));
  expect((await app.invoke(request(input(name)))).status).toBe(502);
  expect(app.logs).toContainEqual(["info", `[${name}] provider_response`, 429]);
  assertSafe(app.logs);
});

it("restricts every legacy console reference to a literal event and optional numeric response status", () => {
  for (const name of names) {
    const root = ts.createSourceFile(`${name}.ts`, sourceOf(name), ts.ScriptTarget.Latest, true);
    function visit(node: ts.Node) {
      if (ts.isIdentifier(node) && node.text === "console") {
        const property = node.parent;
        expect(ts.isPropertyAccessExpression(property)).toBe(true);
        const call = property.parent;
        expect(ts.isCallExpression(call)).toBe(true);
        if (!ts.isCallExpression(call)) throw new Error("Unexpected console usage");
        expect(ts.isStringLiteral(call.arguments[0])).toBe(true);
        expect(call.arguments.length).toBeLessThanOrEqual(2);
        if (call.arguments[1]) expect(call.arguments[1].getText(root)).toMatch(/^(response|aiResponse)\.status$/);
      }
      ts.forEachChild(node, visit);
    }
    visit(root);
  }
});
