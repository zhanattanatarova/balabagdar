---
name: Seed FK production bug
description: Why the BalaBagdar production seed kept failing with FK violations
---

## The rule
After inserting a user with `onConflictDoNothing()`, always query the actual user `id` by phone before using it as a FK in child inserts.

**Why:** The production DB already had a user with phone `77474807286` registered under a different UUID. `onConflictDoNothing()` silently skipped the insert, leaving our hardcoded UUID absent from the `users` table. Every subsequent club insert using that UUID then failed with `clubs_user_id_users_id_fk`.

**How to apply:** In `artifacts/api-server/src/lib/seed.ts` — after the user INSERT, do `SELECT id FROM users WHERE phone = ?` and use the result as `userId` for all club rows. Wrap each club insert in its own `try/catch` so one failure doesn't abort the rest.

## Additional context
- `seedIfEmpty()` gates on Baby Kids club id `89f20083-45e0-4d8c-b3d0-7f4fc892f464` being absent — so Baby Kids must be FIRST in the clubs array
- "Аси" club uses a storage-hosted avatar (`/api/storage/objects/uploads/aefb06f3…`) — the object may or may not exist in production; club will show with emoji fallback if missing
- City state in `Index.tsx` must be persisted to `localStorage` (key: `balabagdar_city`, default: "Актау") — without this every page refresh resets city to "" and all cities mix together
