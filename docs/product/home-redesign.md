# Home redesign — issues #24 and #9

Home now features the active trip, otherwise the earliest upcoming trip, otherwise
an actionable empty state. It uses the existing owner-scoped `useTrips`, calendar
formatters and `TripCover` (including fallback/attribution). Loading and query
failure are separate from empty results; failed queries can be retried.

The mobile-first layout uses the existing sand, clay and terracotta palette,
restrained deep-blue accents and a small route/horizon motif. The fixed header,
horizontal carousels, fabricated activity and links promoting prototype summaries
have been removed from Home. The four future pillars are a small non-interactive
section explicitly marked as unavailable. Planning actions open real trip routes.

`/` is now the public product introduction, including for first-time visitors.
The optional `/onboarding` route remains available. AuthProvider, private-route
guards, authentication logic, trip CRUD, queries, schema/RLS and Edge Functions
are unchanged. No remote resources were modified or deployed.

## Responsive QA and visual evidence

Local Chromium, fictional account/trip fixtures, São Paulo timezone. External
requests were blocked and destination-photo fallback was used. Screenshots contain
no real user data. No page-level overflow occurred at any requested width.

| Width | Layout checked | Final screenshot |
|---|---|---|
| 375 | Stacked trip and planning cards, disclosure navigation | [Mobile](home-redesign/after-375.png) |
| 390 | Stacked cards and comfortable actions | [Mobile](home-redesign/after-390.png) |
| 768 | Two-column featured card; two-column future pillars; disclosure navigation | [Tablet](home-redesign/after-768.png) |
| 1024 | Featured card + planning sidebar; desktop navigation; four pillars | [Small desktop](home-redesign/after-1024.png) |
| 1440 | 1,280 px page container with intentional nested grids | [Desktop](home-redesign/after-1440.png) |

Before/after, using the same upcoming-trip fixture:

| | Before | After |
|---|---|---|
| Mobile | [375 px](home-redesign/before-375.png) | [375 px](home-redesign/after-375.png) |
| Desktop | [1440 px: original main column was 448 px](home-redesign/before-1440.png) | [1440 px](home-redesign/after-1440.png) |

Additional browser checks: [first-time guest/mobile](home-redesign/guest-375.png),
[guest/desktop](home-redesign/guest-1440.png), [active trip](home-redesign/active-390.png),
[empty](home-redesign/empty-390.png), [loading](home-redesign/loading-390.png),
[error](home-redesign/error-390.png), and [long destination/missing budget](home-redesign/long-destination-375.png).
A simulated HTTP 503 recovered through Retry. Guest signup, active-trip navigation,
skip-link focus and mobile menu Escape/focus return passed browser checks. All
visible Home links/buttons measured at least 44 px high. Primary button white on
existing terracotta-dark is 4.63:1; small terracotta text uses the darker existing
clay text color. Home controls reuse existing colors, without a new global token
system or changes to shared forms.

## Verification and limits

- Full suite: **105 tests pass / 12 files**, including 13 new Home/entry tests and
  existing auth, CRUD, account-isolation and cover tests.
- App and Node TypeScript checks: pass.
- Changed-file ESLint: pass. Full lint retains the baseline **39 errors / 12 warnings**.
- Production build: passes; existing bundle-size/Browserslist warnings remain.
- Native iPhone Safari, real mobile keyboards, screen-reader behavior and live
  Supabase/provider photo integration were **not validated**. Native Safari QA
  remains a manual checkpoint; screenshots use controlled browser fixtures.
- Prototype routes outside Home, full localization and the broader shared-control
  repairs remain separate work under #20/#21. This change does not close those
  issues or #9's remaining manual validation. It adds no AI, financial or community
  backend functionality.
