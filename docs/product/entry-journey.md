# Optional onboarding, auth entry and guest demo — #26

- `/onboarding` is two short, skippable steps; public Home remains the direct
  entry for first-time and returning visitors. Completing the optional introduction
  opens the demo; skipping returns to Home.
- `/auth/access`, login, signup and signup's pending-email state share Home's
  sand/clay/terracotta palette, restrained blue accents, spacious responsive grids,
  visible field boundaries and 44–48px actions. No unavailable OAuth or password
  recovery action is advertised. Existing signup metadata, password validation,
  Supabase calls and email-confirmation redirect are preserved.
- Home's guest primary action now opens `/demo`. Its static fictional trip has no
  account ID, editable controls, save/copy action, backend trip queries, AI requests
  or personal-cache entry. The example budget is explicitly not a cost estimate.
  Exploring never signs out an existing user or creates an anonymous account.
- Creating a personal trip still uses protected `/trip/new` and starts blank.
  Login/signup links carry intended navigation through a strict internal-path
  allowlist; external URLs and query/hash payloads are not used as destinations.
  Current-tab signup → confirmation instructions → login retains that intent.
  A confirmation opened in a new tab retains the existing `/trips` fallback.
  A request finishing after the visitor leaves an auth screen cannot redirect
  them away from the demo.
- AuthProvider, RequireAuth, owner-scoped queries, trip CRUD, schema/RLS, Edge
  Functions and remote settings are unchanged. English-first localization remains
  a separate task; this flow follows the current Portuguese interface.

## Browser QA and screenshots

Local Chromium with synthetic HTTP responses, blocked external services and no
real accounts. All five routes passed layout/overflow and effective target-size
checks at **375, 390, 768, 1024 and 1440px**. Mobile stacks content; desktop uses
an introduction/illustration column alongside the form or sample. Checkbox labels
provide the enlarged targets for their smaller internal checkbox indicators.

| Screen | Mobile | Desktop |
|---|---|---|
| Intro | [375px](entry-journey/onboarding-375.png) | [1440px](entry-journey/onboarding-1440.png) |
| Access choices | [375px](entry-journey/access-375.png) | [1440px](entry-journey/access-1440.png) |
| Login | [375px](entry-journey/login-375.png) | [1440px](entry-journey/login-1440.png) |
| Signup | [375px](entry-journey/signup-375.png) | [1440px](entry-journey/signup-1440.png) |
| Read-only demo | [375px](entry-journey/demo-375.png) | [1440px](entry-journey/demo-1440.png) |

Also captured: [intro step 2](entry-journey/onboarding-step2-390.png),
[login loading](entry-journey/login-loading-390.png),
[login error](entry-journey/login-error-390.png), and
[signup confirmation instructions](entry-journey/signup-confirmation-390.png).
Browser checks passed skip/return/reload, Home → demo → protected personal-trip
entry, login/signup cross-navigation, keyboard password visibility, error focus,
selected-tag contrast and neutral confirmation feedback.

## Verification and limits

- Full suite: **126 tests / 13 files pass**, including 21 new guest, return-path,
  onboarding, pending/error and signup/login tests; existing CRUD/isolation tests
  remain green. Existing journey assertions now use link semantics for navigation actions.
- App and Node TypeScript checks, changed-file ESLint and production build pass.
  Existing bundle-size and Browserslist build warnings remain.
- Native iPhone Safari, physical mobile keyboards, screen readers, live email
  delivery and live Supabase integration were not validated. Browser screenshots
  and auth HTTP responses are controlled test fixtures, not production evidence.
- No Home visual refinements beyond its guest CTA were bundled. Legacy prototype
  routes and the broader shared-control work remain separate from this issue.
- No remote resources, deployment, schema, RLS or secrets were changed. No merge.
