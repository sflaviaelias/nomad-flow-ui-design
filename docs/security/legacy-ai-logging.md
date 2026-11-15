# Legacy AI logging and authentication review — Issue #18

## Scope and security result

This change addresses audit finding F5 and GitHub issue #18. Repository code exposed
raw request headers, prompts, conversations, context, provider bodies and exceptions
to application logs. This is a verified code issue, **not evidence of a deployed
incident or exploitation**. No remote logs, secrets or gateway settings were read.

Changes:

- `concierge-chat`: removes header enumeration, outgoing messages/context, provider
  bodies and status text, and raw exceptions from diagnostics.
- `travel-ai-wizard`: removes request values/context, constructed prompts, provider
  messages/bodies and parser/exception details from diagnostics.
- `destination-image-ai` and `destination-image-unsplash`: replace raw exception
  logging with a fixed event. Exceptions can include URLs, credentials or bodies,
  so even ostensibly useful `Error.message`/stack/cause output is excluded.
- `active-trip-ai` was reviewed and has no explicit console output; it is unchanged
  and included in the regression tests. The newer `trip-destination-cover` and all
  trip CRUD code are unchanged.

Only fixed function/event strings and, for the Concierge/wizard provider response,
its numeric HTTP status enter logs. No request-derived method, URL, query, header,
identifier, task type, message length, response status text or exception object is
passed to console. There is no regex-based secret redaction to bypass.

Diagnostic events are `configuration_missing`, `provider_response` (numeric HTTP
status only), `provider_json_invalid`, `provider_result_missing`,
`suggestions_json_invalid` and `request_failed`, where applicable to each function.
For example, `provider_response 429` distinguishes an upstream rejection from a
local `request_failed`; `provider_json_invalid` identifies an unreadable response
without retaining its contents. Requests and identities cannot be correlated from
these events; this is an intentional privacy/troubleshooting tradeoff.

Provider URLs, models, prompts, outbound authentication, request bodies, CORS,
response payloads/statuses and fallback behavior are preserved. Existing wizard
`any` annotations were narrowed for changed-file lint; no runtime validation or
request interpretation was added. No access policy was changed locally or remotely.

## Authentication inventory and remaining risks

| Function | Repository evidence | Assumption / further verification |
|---|---|---|
| `concierge-chat` | No handler-level user validation. No explicit JWT override in `supabase/config.toml`. `useConciergeChat` sends a bearer token only when a session exists; guest UI can open the screen. | Do not infer anonymous access or adequate protection from UI behavior or absent config. Verify the deployed gateway policy and intended guest behavior separately before activation. |
| `travel-ai-wizard` | Explicit `verify_jwt = false`; no handler-level user validation. Frontend hook uses `supabase.functions.invoke`. | The checked-in gateway configuration does not require JWT verification. A public client key/SDK call is not user authorization. Verify the deployed configuration, permitted callers and provider quotas separately. |
| `destination-image-ai` | Explicit `verify_jwt = false`; no handler-level user validation. | Same unauthenticated provider-cost risk if deployed with this configuration. The provider endpoint is described as illustrative in source; sanitizing logs does not make the feature production-ready. |
| `destination-image-unsplash` | No handler-level user validation or explicit JWT override. Legacy hook uses raw fetch. | Deployed gateway policy, anonymous access and rate limits are unknown. This legacy path is distinct from the owner-checked trip-cover implementation. |
| `active-trip-ai` | No handler-level user validation or explicit JWT override. Hook sends a raw request without a bearer header. | Verify gateway behavior and intended access before claiming that the call works or is protected. Missing provider configuration is not an authorization mechanism. |
| `trip-destination-cover` (boundary reviewed, unchanged) | Handler validates a bearer via `getUser` and reads a trip filtered by authenticated `user_id`. | Retain this ownership boundary; repository review does not establish applied remote settings. |

Wildcard CORS is not authentication. No handler-level quotas, input-size limits or
rate limits were added. Any decision to enable guest calls or enforce authentication
requires a separately reviewed access policy and tests, not a silent change bundled
with logging cleanup. Deployed gateway behavior, current deployments, provider
availability and historical exposure remain unverified.

**Residual response risk:** legacy error responses still contain `debug`, `details`
or raw provider data in some branches. Their response contracts are intentionally
unchanged in this logging-only change. Do not log those response objects upstream;
review response sanitization as a separate compatibility/security change. Upstream
providers still receive the same prompts, user context and credentials required
for their existing calls; this work changes logging, not provider data handling.

Captured application-console tests cannot establish that platform access logs,
provider logs, historic logs or client-side logging never contain private data.
If historical exposure is later confirmed, assess retention, access and credential
revocation under separate authorization. This PR does not inspect or alter them.

## Verification

`supabase/functions/legacy-logging.test.ts` loads the real `serve` callbacks after
removing remote imports with TypeScript's AST and transpiling them in an isolated
VM. Only Deno environment access, server registration, console and HTTP are
substituted. No live service, token, user account or provider request is used.

The suite captures all console methods and injects synthetic bearer/API credentials,
private messages/personal context, raw provider bodies, malicious status text and
exceptions containing messages, stacks and causes. It exercises successful output,
CORS preflight, missing configuration, malformed request/provider JSON, provider
rejection, wizard suggestions and their fallback, and thrown exceptions. It checks
that existing output/status/CORS and outbound credential/prompt use still work,
that sensitive markers are absent from logs, and that every recorded diagnostic
has the fixed-event/numeric-status shape. An AST guard also rejects console aliases,
dynamic events or extra logged fields in the reviewed legacy handlers.

Results:

- `npm test -- supabase/functions/legacy-logging.test.ts`: 33 tests pass.
- `npm test`: all 92 tests pass across 10 files, including existing trip CRUD and
  destination-cover tests.
- `npx tsc --noEmit -p tsconfig.app.json`: passes.
- `npx tsc --noEmit -p tsconfig.node.json`: passes.
- Changed-file ESLint (the four handlers and new test): passes.
- Supplementary TypeScript check of the changed handlers/test: passes using
  temporary declarations for Deno environment access and the existing remote
  `serve`/XHR imports.
- `npm run build`: passes; existing bundle-size and outdated Browserslist warnings
  remain. The frontend output is unchanged by these backend logging edits.
- `git diff --check`: passes.

**Unavailable verification:** native Deno is not installed in this environment.
VM tests use Web Request/Response and cannot prove native Deno/Supabase gateway
integration. The supplementary type check verifies local handler/test types, not
remote package compatibility. No remote deployment/access tests or provider calls
were performed. No database schema, RLS, production secrets, authentication settings
or deployed resources were modified; nothing was deployed or merged.
