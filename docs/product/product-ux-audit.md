# Go Nomad: product, UX/UI and technical audit

Reference: `dev/incremental-rls-deploy`, commit `1bbca0e` (includes merged trip editing and deletion). Reviewed November 15, 2026. Documentation only; this is a candidate assessment, not Sprint 2 scope approval.

## 1. Executive summary

Go Nomad now has a credible **basic trip-management foundation**: authenticated creation, list/detail views, editing, confirmed deletion, owner-scoped access and destination-cover fallbacks. Preserve those gains. The surrounding experience still mixes that foundation with prototype financial, discovery, community and AI screens. It can record a Brazilian remote worker's two-week Belgrade trip and BRL budget; it cannot yet reliably help them decide whether that trip is affordable or compatible with their work.

The highest-value next step is to make existing screens truthful, consistent and dependable before expanding their promises. Correct calendar dates and weak form presentation, feature the user's actual trip, fix false success feedback, and remove sensitive logging. No verified P0 incident was established; P1 findings below warrant attention before wider testing or enabling legacy AI services.

### Method and limits

Evidence labels: **Observed** = reproduced in a local browser; **Code** = supported by the reference source; **Hypothesis** = requires further validation. Browser findings use Chromium at 390 × 844; desktop trip-list layout was also checked at 1280 × 900. Screenshots were visually reviewed for Home and trip creation. The shared-browser tool failed to initialize; scripted Playwright/installed Chromium provided the fallback.

Guest screens were inspected directly. Authenticated screens used explicitly fictional session/profile/trip responses intercepted in the browser, including a failed Settings PATCH. Supabase was configured to loopback; external requests were blocked and covers disabled. These checks establish rendering and client behavior, **not live authentication, persistence, provider availability or remote RLS**. Existing automated tests exercise simulated CRUD and account changes. No live accounts, remote resources, application code, schema or RLS were changed.

No real iPhone/Safari, mobile keyboard, screen reader, physical-network performance or production integration validation was performed. Do not attribute blocked external images in these browser checks to a product defect. Local pgTAP was not rerun: the documented prior attempt exhausted practical storage during Docker `vfs` extraction ([deletion verification](../delete-trip.md)).

## 2. Current product assessment

| Journey | What exists now | Decision value / limitation |
|---|---|---|
| Onboarding/auth | Three onboarding steps, guest browsing, email signup/confirmation, login/logout; Google explicitly marked “Em breve” | A working entry path, but profile enrichment is required before the first trip; no visible password-recovery path in `LoginScreen.tsx` |
| Home/navigation | Menu, active-trip card, discovery/community, upcoming carousel, Concierge | Upcoming trips are below prototypes; load failures can resemble no trips. The fixed header occupies substantial mobile space |
| Trips | CRUD, real owner-filtered queries, validation, draft restoration, deterministic core back controls, cover attribution/fallback | Useful storage and maintenance of independent trips. No multi-country itinerary structure or work-schedule model |
| Profile/settings | Existing profile updates and avatar-upload path; language/location preferences | Distinct from a mock-only profile, but error handling and preference feedback need repair; no live save/upload verified here |
| Finance | Optional BRL budget on new trips; edits preserve supported existing BRL/EUR/USD currency | No functioning trip-specific expense ledger or FX conversion in the audited primary journey; profile currency does not drive the new-trip form |
| Discovery/community/AI | Navigable screens, local fixture places/community, ranking simulation, legacy AI function code | Not verified destination-specific recommendations, live events, partnerships or work-readiness information |

For Belgrade, the user can save dates/budget, revisit, edit and delete. They cannot compare BRL purchasing power against Serbian dinar costs, establish reliable Wi-Fi/workspace suitability, or find verified activities for their actual free evenings/weekends. A multi-country plan currently means separate trip records. These are **product gaps**, not regressions against Sprint 1's CRUD scope.

Sources reviewed include `README.md`, [first journey](../primeira-jornada.md), [navigation](../issue-12-navegacao.md), [covers](../issue-6-capas-de-viagem.md), [editing](../edit-trip.md), [deletion](../delete-trip.md), and GitHub issues [#5](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/5), [#6](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/6), [#9](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/9), [#10](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/10), [#11](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/11), [#12](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/12) and [#13](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/13). README still says editing/deletion are unimplemented and #13's checklist still lists them unchecked; the merged source is the implementation evidence. #5's neutral signup wording is already partly addressed; do not report duplicate account creation as a verified bug.

## 3. Five most important findings

Priority: P0 = urgent verified blocker/exposure; P1 = protect core correctness/trust; P2 = important incremental improvement; P3 = later polish. Effort is relative: S = focused change, M = coordinated screens/tests, L = new data/service workflow, not a delivery commitment.

### F1 — Prototype output looks like real financial and local guidance

- **Evidence — Observed + Code:** With a Belgrade fixture, `/trip/smart-summary` displays R$2,345 spent and claimed café check-ins from `useActiveTripSmartSummary.ts`, not trip records. `HomeTripSummaryCard.tsx` promises personalized AI insights. `AddExpensePage.tsx:35–77` uses a default R$1,000 budget and in-memory `allExpenses`, discards most submitted fields and displays success; `ExpenseReceiptUpload.tsx` creates only a local object URL. This legacy expense route exists, although the new trip-detail view does not offer an expense CTA. Discovery imports `PLACES_MOCK`; `useDiscoveryRanking.ts` uses random compatibility. Community includes dated Lisbon events and an asserted partner discount. Concierge sends a fixed Barcelona/€1,200 sample context (`useConciergeChat.ts`).
- **Impact:** A budget-conscious traveler may trust invented spending, nearby places or personalized guidance. A direct-route expense entry disappears on remount.
- **Priority / effort:** **P1 / M** for honest presentation; a persisted ledger is separate future work.
- **Action:** Clearly mark demo sections/results and remove personal/verified claims; hide unsupported transactional actions from the normal journey. Keep real trip budget separate from illustrative amounts. Align onboarding and README with delivered functionality.
- **Acceptance:** Belgrade never receives unlabeled Lisbon/Barcelona/sample financial claims; every visible save action either persists and survives reload or is explicitly a non-saving demo before input; notifications and partner offers cannot imply real unread activity or agreements without backing data (`HomeHeader.tsx` currently has an inert notification button/red dot).

### F2 — Home's upcoming dates shift one day backwards

- **Evidence — Observed + Code:** Fixture dates `2027-02-08`–`2027-02-22` render as `07/02 - 21/02` on Home. `UpcomingTripsSlider.tsx:42–46` parses date-only strings as UTC and formats in local time. List/details use the safer `tripDate` helper in `src/lib/trip-presentation.ts`.
- **Reproduction:** In a negative-UTC-offset timezone such as São Paulo, open Home with that future trip; compare the carousel with `/trip/:id`.
- **Impact:** Users see contradictory travel dates precisely when coordinating work, bookings and onward travel.
- **Priority / effort:** **P1 / S**.
- **Action:** Reuse one calendar-date formatter; review the same parse/display pattern for profile birth dates rather than treating them as instants.
- **Acceptance:** Identical saved dates across Home, list, detail and edit in UTC, São Paulo and a positive-offset timezone; regression tests cover month boundaries and one-day trips.

### F3 — Shared controls lack a coherent, accessible UI foundation

- **Evidence — Observed + Code:** `/trip/new` inputs measure 24–26 px high with 0 px borders; `TripForm.tsx` uses `.input`, but no definition exists in `src/index.css`. Save/Edit buttons render with transparent backgrounds: `ui/button.tsx` expects `primary`, `destructive`, `input` and `ring` tokens absent from `tailwind.config.ts`. Settings' Save button combines white text with a transparent background. Separately, white on the widely used `#E76F51` has **3.09:1** contrast, below 4.5:1 for normal-sized text.
- **Impact:** Primary actions look like plain text; fields are hard to distinguish and target. Defining an entire design system is unnecessary to fix this.
- **Priority / effort:** **P1 / M**.
- **Action:** Establish a small supported token set and shared input/button variants; retain the warm palette while darkening interactive fills or changing foregrounds. Associate validation text with fields, including focus on the first invalid input.
- **Acceptance:** Creation/edit/delete/settings have visible, consistent controls; normal text meets 4.5:1, non-text boundaries/focus meet applicable 3:1 requirements; comfortable 44 px mobile targets, visible keyboard focus and field-error associations. Test keyboard-only submission and dialog cancel/focus return at narrow widths and 200% zoom. The current back controls already provide 44 px targets and should be preserved.

### F4 — Home hides the next meaningful action and conflates errors with emptiness

- **Evidence — Observed + Code:** A saved future Belgrade trip still produces the primary “Nenhuma viagem ativa” creation prompt, with the actual trip below Discovery and Community. This confirms existing issue #9. `Index.tsx` reads `tripError` but does not render it; `UpcomingTripsSlider.tsx` ignores query errors and falls through to “Nenhuma viagem futura ainda.” Home's active card also uses an unrelated fixed landscape rather than `TripCover`.
- **Impact:** Users can interpret a saved-trip or network state as lost data and create unnecessary trips; the planning task is visually subordinate to prototypes.
- **Priority / effort:** **P1 / M**.
- **Action:** Feature active trip, else earliest upcoming trip, else true empty state. Give loading, failed fetch and zero results distinct states with retry. Reuse the validated cover/fallback and existing shared trip query.
- **Acceptance:** Active/upcoming/none/error/guest scenarios are tested; next-trip details are reachable from the first meaningful Home section; a failing query never says there are no saved trips. Match cover behavior across Home/list/details, without treating unsupported Belgrade photography as a failure to save.

### F5 — Legacy AI logging and access boundaries need review before activation

- **Evidence — Code:** `supabase/functions/concierge-chat/index.ts:13–18` logs every incoming header, which can include Authorization; later it logs user messages/context and provider bodies. `config.toml` explicitly disables JWT verification for **destination-image-ai and travel-ai-wizard**, whose handlers lack an application-level auth check. This is distinct from Concierge's gateway configuration, which was not verified, and from the newer owner-checked trip-cover function.
- **Impact:** If these paths are deployed/used, logs can retain credentials/private conversations and unauthenticated legacy provider calls can consume quota. No live exploit or deployed exposure was tested.
- **Priority / effort:** **P1 / S** for log removal; deployment/access verification may require a separately authorized follow-up.
- **Action:** Remove header/conversation logging; keep sanitized operational metadata. Inventory callable legacy functions, document intended guest access and enforce authentication or explicit constrained guest quotas before enabling them. Keep provider keys server-side.
- **Acceptance:** Synthetic bearer tokens and conversation text never appear in captured function logs; access tests enforce the chosen anonymous/authenticated policy and request limits. Do not change remote functions or gateway settings as part of this audit.

## 4. UX/UI findings

### F6 — Settings reports persistence without verifying it; profile failures resemble logout

- **Evidence — Observed + Code:** In the isolated browser, intercept a `/profiles` PATCH with HTTP 503, then change Settings language: it still announces “Idioma atualizado com sucesso / Suas preferências foram atualizadas com sucesso.” `SettingsPage.tsx:74–83` ignores the update error. Notifications are local state; `handleSave` only toasts. Location preference is written before browser permission succeeds. `ProfileScreen.tsx:56–81` turns a missing/errored profile into a login prompt despite an authenticated user; its query also lacks a rejection handler.
- **Impact:** People cannot tell whether preferences are stored or whether their account/session is broken.
- **Priority / effort:** **P1 / M**.
- **Action:** Handle read/write/rejection errors, distinguish session from profile availability, add retry and rollback optimistic preferences. Remove unsupported toggles or describe their limits.
- **Acceptance:** Failed saves never announce success; supported preferences survive remount/new session; denied geolocation is not represented as active permission; a failed profile read offers recovery without implying sign-out. Test these paths with rejected requests as well as Supabase error responses.

### F7 — Entry and accessibility friction exceed what a first trip needs

- **Evidence — Code + partial browser observation:** Signup requires birth date, nationality and travel-profile tags (`SignupScreen.tsx:45–52`). Login has no password-recovery action. `RequireAuth` supplies a return location, but Login always navigates to `/trips`. Most trip screens remain hard-coded Portuguese while Settings changes language; `index.html` fixes `lang="en"`. Discovery conditionally nests a translation button within a place-card button. The fixed Home header uses z-index 9999 while overlays commonly use 50.
- **Impact:** Extra entry effort, interrupted direct-link intent, mixed-language UI and potential keyboard/overlay problems. The magnitude of signup abandonment and actual overlay occlusion are **hypotheses**, not measured outcomes.
- **Priority / effort:** **P2 / M**, split into small focused fixes after validation.
- **Action:** Consider deferring enrichment until profile editing; offer a recovery route only when it actually works. Preserve safe return paths. Correct page language and interactive nesting; test layer ordering rather than adding more z-index overrides.
- **Acceptance:** Keyboard navigation has one interactive target per action and a correctly announced page language; no active overlay is covered by the header. A direct trip URL resumes after login or explains its fallback. Signup still works with confirmation and neutral existing-email messaging; assess enrichment requirements with users before removing fields.

Mobile Safari remains a follow-up validation target: inspect safe-area insets, dynamic viewport/keyboard behavior (`LoginScreen` uses `h-screen`), date controls, zoom and dialog focus on real hardware. Current checks found no document-wide horizontal overflow at 390 px on sampled screens or 1280 px on the trip list; horizontally scrolling discovery cards still need clear touch/keyboard affordances. These observations do not establish whole-app accessibility compliance.

## 5. Functional and technical findings

**Preserve:** `src/lib/trips.ts` validates drafts, rechecks identity for writes and filters owners; `AuthProvider.tsx` cancels queries, clears private caches and remounts on identity change. Editing preserves identity/history and original currency. Deletion requires a returned matching ID, blocks duplicate confirmation, and clears list/detail/cover caches. Repository RLS has owner `USING`/`WITH CHECK`; trip covers and expenses cascade while the places catalog remains independent. The cover function checks ownership, destination matching and safe provider URLs. None of this proves the remote environment has the same applied policies.

### F8 — Verification covers CRUD well, but misses the surrounding experience

- **Evidence — executed + Code:** `npm test` passes **59 tests / 9 files**, covering auth journeys, navigation, simulated edit/delete persistence/isolation and cover core/UI behavior. App and Node TypeScript checks pass. Build passes; main JS is **889.78 kB / 268.05 kB gzip**, with a chunk warning. All routes are statically imported in `App.tsx`. Lint reports **42 errors / 12 warnings** in the unchanged baseline. No checked-in tests cover Settings' failed-save feedback or the upcoming-card timezone bug. Database workflow is manual (`workflow_dispatch`); docs distinguish historical checks from current local execution.
- **Impact:** A green suite can coexist with visible date, presentation and preference defects. Initial loading may cost mobile bandwidth; no real slow-network timing was measured.
- **Priority / effort:** **P2 / M**.
- **Action:** Add focused regressions for F2/F3/F6 and a small browser smoke checklist; establish reviewed local/CI database evidence. Ratchet lint on changed files rather than a broad cleanup. Measure mobile route loading before prioritizing lazy loading of non-core screens; retire unused duplicate wizard/demo paths incrementally.
- **Acceptance:** Fixed defects have behavior-level tests; a reviewed result records real RLS/cascade tests and Safari smoke coverage with their environment. No new lint errors; a measured performance baseline determines any route-splitting change. Bundle size alone is not a claimed user-visible latency measurement.

## 6. Product value gaps across the four pillars

| Pillar | Delivered value | Gap for the Belgrade scenario | Incremental direction, not a commitment |
|---|---|---|---|
| Travel planning | Persisted destination, dates, budget, CRUD | No joined multi-country plan, workdays/free-time structure, editable logistics in the current trip form | First improve Home/date consistency; later expose existing notes for an explicit preparation checklist |
| Remote work readiness | Travel-profile tag; prototype coworking categories | No verified connection quality, desk/noise/call suitability, work policy or schedule context | Test whether a short self-reported checklist helps; distinguish unknown from verified |
| Discovery/community | Browsable examples and guest exploration | São Paulo/Lisbon fixtures are not Belgrade places/events; random recommendation labels are not work suitability | Label examples now; later validate a small sourced destination collection before a broad directory/community network |
| Financial planning | A saved total budget in BRL; supported existing currencies preserved during edit | No persisted expense journey, BRL/RSD conversion, rate/date/source or realistic cost estimates | Show honest budget-only status first. Treat a trip-specific single-currency ledger as separate L work; validate FX needs before choosing a provider |

### F9 — Validate a small work-readiness aid before building recommendation systems

- **Evidence — Code + Hypothesis:** `TripForm` edits only destination/dates/budget; `TripDetailsPage` can render existing notes, but no current preparation workflow captures the worker's constraints. The usefulness of a checklist has not been user-tested.
- **Impact:** The product stores plans without helping the worker decide whether they can work reliably during the trip.
- **Priority / effort:** **P2 / M**, future capability, optional discovery candidate.
- **Action:** Test a low-fidelity, user-maintained preparation note/checklist using the existing notes field: work hours/timezone, accommodation workspace, connectivity evidence, backup connection, available evenings/weekends and source links. Avoid inferred guarantees or automatic recommendations.
- **Acceptance:** A small user test establishes whether this improves a specific planning decision; if selected for implementation later, notes are owner-scoped and survive reload/sign-in, unknown facts remain explicit, and no unsourced connection or cost claim appears.

## 7. Visual identity opportunities

The cream/sand, terracotta and brown palette already creates warmth. `TripCover`'s compass, circles and calm fallback and the newer spacious list/details are a coherent starting point. Home's gradients, shadows and tall fixed header, dense legacy summaries and almost unstyled forms currently feel like different generations of the product (F3/F4).

Refine a **lightweight UI foundation**, not a redesign: one typography scale, consistent 4/8-based spacing, a small radius/shadow vocabulary, semantic colors and restrained primary/secondary/destructive actions. Keep terracotta for emphasis with tested contrast; consider deep blue selectively for information or links after testing, rather than adding another competing accent. Use subtle horizons/routes/movement as secondary cues, never behind essential text. Historical nomadic and Arab cultural references should be researched and contextual, avoiding generic “exotic” motifs, stereotyped imagery or decorative scripts. A single consistent typeface with robust language coverage is enough. Evaluate success through readable fields, clear actions and faster trip retrieval, not decorative density.

## 8. Prioritized Sprint 2 candidate backlog

These are candidates for capacity discussion; no issues were created and no sprint scope is finalized. Avoid opening duplicate issues for #9 or #5.

| Order | Type | Candidate | Priority / effort | Acceptance reference |
|---|---|---|---|---|
| 1 | Immediate fix | Remove sensitive Concierge logging; document legacy function access checks before activation | P1 / S | F5 |
| 2 | Immediate fix | Fix calendar-date consistency across Home and trip views | P1 / S | F2 |
| 3 | Immediate fix | Make prototype financial/local/AI claims explicit; reconcile README delivery status | P1 / M | F1 |
| 4 | UX/UI improvement | Repair shared control tokens, field styling, contrast and focus | P1 / M | F3 |
| 5 | UX/UI improvement | Reuse #9: feature the next trip and distinguish Home error/empty states | P1 / M | F4 |
| 6 | Immediate fix | Correct Settings persistence feedback and profile recovery states | P1 / M | F6 |
| 7 | UX/UI improvement | Validate entry simplification; repair language/keyboard/return-path basics in small slices | P2 / M | F7 |
| 8 | Technical enabler | Add regressions with each selected fix; establish mobile/database verification and performance baseline | P2 / M | F8; shared work, not a second full test project |

**Future capabilities, separately evaluated:** F9's preparation-note experiment (M); a persisted, trip-specific expense ledger (L); sourced local/workspace information (L); FX conversion (L); community participation/partnership systems (L). These are not prerequisites for a useful reliability sprint and should not all enter Sprint 2. Prefer one validated planning decision at a time over another layer of unsupported AI output.
