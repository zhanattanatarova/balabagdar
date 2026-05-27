---
name: Seed FK production bug
description: Why the BalaBagdar production seed kept failing with FK violations and how it was fixed
---

## The rule
Use the **actual production user UUID** directly in the seed — never guess or rely on dynamic phone lookup.

Production user (Жанат Танатарова, phone 77474807286) has UUID:
`47f3109e-d49b-4444-a9bb-ad68e43da337`

The old seed used `87467a97-634f-4be2-8421-59f0d47aad4b` — that ID does NOT exist in the production users table.

**Why:** The production DB registered the user through the app's normal auth flow, assigning a different UUID than what was hardcoded in the seed. `onConflictDoNothing()` on the user INSERT silently skipped the upsert (conflict on phone), leaving the hardcoded UUID absent → every club FK failed.

**How to apply:** In `artifacts/api-server/src/lib/seed.ts` — the constant `PROD_USER_ID = "47f3109e-d49b-4444-a9bb-ad68e43da337"` must be used for all club `userId` fields. Do NOT try to insert this user again (they already exist).

## Additional context
- `seedIfEmpty()` gates on Baby Kids club id `89f20083-45e0-4d8c-b3d0-7f4fc892f464` being absent
- Baby Kids must be FIRST in the clubs array
- Each club is wrapped in its own try/catch so one failure won't block others
- "Аси" club uses storage avatar (`/api/storage/objects/uploads/aefb06f3…`) — may show emoji fallback in production if object is missing
- City default in `Index.tsx` persisted to `localStorage` key `balabagdar_city`, defaults to "Актау"
- Production deployment runs `pnpm --filter @workspace/api-server run build` → compiles source → runs dist; dist is gitignored so always rebuilt from source on each deploy
