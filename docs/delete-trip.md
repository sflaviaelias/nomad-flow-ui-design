# Deleting a trip

On `/trip/:tripId`, the secondary **Excluir viagem** action opens an accessible
confirmation dialog naming the destination. It explains that the trip, linked
expenses and cover record will be removed permanently. Cancel and Escape close
the dialog without a write. Confirmation locks repeat submissions and dismissals
while the request is pending. Failures remain in the dialog with a clear retry or
refresh message; no optimistic removal occurs.

`deleteTrip` verifies the current authenticated user using `getUser`, then issues
one DELETE on `trips`, filtered by both `id` and `user_id`. Success requires a
returned matching ID. No returned row (including an absent or unauthorized trip)
is treated as failure. RLS remains the authorization boundary if a session changes
during the request. The existing `trips_manage_own` policy in
`20261107000200_stabilize_table_access.sql` provides owner-only SELECT and DELETE
through its ALL policy and `USING (user_id = auth.uid())`. No schema or RLS change
is necessary, and no remote policy state is assumed.

A failure before commit leaves the trip intact. A response lost after commit is
inherently ambiguous: the client does not claim that the trip still exists or
report success without confirmation. It offers refresh/retry. Retrying targets the
same ID and cannot remove other trips.

## Referential integrity

- `trip_covers.trip_id` references `trips.id` with `ON DELETE CASCADE` in
  `20261108000100_trip_destination_covers.sql`. The database removes the linked
  cover atomically, although authenticated clients cannot delete covers directly.
- `expenses.trip_id` also has `ON DELETE CASCADE`, defined in the original schema.
  Only expenses linked to the deleted trip are removed.
- `places` is an independent catalog with no trip foreign key. It is untouched.
- Notes, itinerary and checklist are fields on the deleted trip. Other trips,
  profiles, community records and storage objects are untouched.
- Cover images are external Unsplash references. No external image deletion,
  storage cleanup or image-provider request is made by the deletion operation.

On success the client cancels pending account trip and selected-trip cover queries,
removes the selected trip from the cached list, caches a null detail, removes its
cover queries, navigates to `/trips` with history replacement and invalidates the
account's entire `trips` prefix. Home, upcoming trips and profile counts derive
from that shared list. Other accounts' caches are untouched. Identity changes
unmount the component and clear private caches through the existing AuthProvider;
a late result cannot navigate the new account or repopulate its caches.

## Verification

Automated React/service tests cover destination-specific confirmation, cancellation,
Escape, pending locking, successful deletion, navigation, cache refresh, unrelated
trip preservation, network failure/retry, ambiguous lost responses, missing or
changed sessions, account isolation and persistence across a new session/remount.
The new `supabase/tests/trip_deletion_test.sql` checks real owner/anonymous/foreign
RLS behavior and cascades with privileged assertions that cannot hide orphans,
as well as preservation of unrelated covers, expenses, places and profiles.

Verification results for this change:

- `npm test`: 59 tests pass across 9 files, including all existing editing tests.
- `npx tsc --noEmit -p tsconfig.app.json`: passes.
- `npx tsc --noEmit -p tsconfig.node.json`: passes.
- ESLint on all changed TypeScript files: passes.
- `npm run lint`: reports 42 errors and 12 warnings. Running the same command
  against the unmodified base produces identical output after normalizing paths.
- `npm run build`: passes with bundle-size and outdated Browserslist warnings.
- Local pgTAP was attempted using pinned Supabase CLI 2.54.11 and the repository's
  disposable local runner. The default image registry returned Forbidden. Retrying
  with the Docker Hub setting used by repository CI downloaded the image, but
  Docker's `vfs` extraction grew disk usage from roughly 6 GB to 51 GB on the
  63 GB filesystem before database startup. The attempt was stopped to avoid
  exhausting disk space. The runner confirmed cleanup; no containers remain.
  No pgTAP assertions ran, so the new SQL test is not claimed as passing.

No remote database writes, schema/RLS changes, deployments or merges were made.
