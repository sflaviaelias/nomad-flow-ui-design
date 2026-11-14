# Editing an existing trip

On `/trip/:tripId`, **Editar viagem** opens the shared creation form with the
saved destination, dates and budget. The budget label shows the saved currency;
there is no currency selector. Supported existing currencies are BRL, EUR and USD,
matching the original wizard. Missing or unsupported currency blocks saving with
an error rather than silently converting the budget. New trips still default to BRL.
Cancel returns to the detail without writing. Edits do not read, overwrite or clear
the new-trip draft or its pending creation ID.

`updateTrip` validates real dates, date order, a finite non-negative (or absent)
budget and supported currency. It verifies the current user with `getUser`, reads
the owner-scoped trip, requires the existing currency and updates only the editable
fields. Both ID and owner filter the UPDATE. It requires a returned row before
reporting success. No insert/upsert, identity reassignment or replacement of notes,
checklist, expenses or history occurs. Failed requests preserve form values; retry
updates the same ID. An ambiguous network failure may already have committed;
retrying remains safe from duplicate creation.

The base migration `20261107000200_stabilize_table_access.sql` already enables RLS,
grants UPDATE to authenticated users and defines `trips_manage_own` for ALL with
both USING and WITH CHECK restricted to `auth.uid() = user_id`. It also provides
SELECT, which is required for UPDATE. `supabase/tests/trips_test.sql` already tests
owner updates, rejection of ownership transfer and zero affected rows for another
account. No migration is needed. This review is of repository policy definitions;
it does not assert the state of a remote database.

After saving, the client cancels in-flight trip queries, seeds the returned detail
and invalidates the account's entire `trips` query prefix. The list, Home active
trip, upcoming trips and profile count all derive from this prefix. A destination
change also cancels and removes every cover cache entry for that account/trip.
The detail then calls `trip-destination-cover` through the existing cover hook
when covers are enabled. Its destination-specific key and photo validation prevent
an old destination photo from rendering. The existing backend reclaims a cache
record whose destination differs and reselects a photo. Provider/network failures
show the neutral fallback and do not turn a successful trip save into a failure.

## Verification

- `npm test`: React journeys, edit persistence across remount and a new session,
  duplicate-submit locking, preserved history/identity, errors and retry, currency
  preservation, invalid input, account isolation, cache invalidation, and cover
  destination changes with a failing provider. Existing cover core tests exercise
  backend cache selection and races.
- `npx tsc --noEmit -p tsconfig.app.json`
- `npx tsc --noEmit -p tsconfig.node.json`
- `npm run build`

Tests use a simulated Supabase client. No live account or remote data is changed.
The existing pgTAP suite can be run separately with
`scripts/test-database-local.sh` and its pinned Supabase CLI 2.54.11. It was not run
for this UI change; the CLI is not installed in this environment.
