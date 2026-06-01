---
name: BalaBagdar artifact recovery
description: How to recover the balabagdar web artifact when it gets unregistered/orphaned, and fix /api 502 routing
---

# BalaBagdar artifact recovery

The `balabagdar` web artifact (served at `/`) can become **unregistered** during git
operations or checkpoints while its dev process keeps running orphaned on its assigned
port. Symptoms: it no longer appears in `listWorkflows()` / artifact list, but `curl`
to its local port still returns 200.

## Re-register without losing the directory
`createArtifact` FAILS when `artifacts/<slug>/` already exists. To re-register an existing
artifact whose `.replit-artifact/artifact.toml` is intact, re-validate the toml — this
triggers the platform to re-scan and re-register it:
1. Copy `artifact.toml` to a sibling temp file (e.g. `artifact.edit.toml`).
2. Call `verifyAndReplaceArtifactToml({ tempFilePath, artifactTomlPath })` with absolute paths.
3. Delete the temp file. The workflow comes back as a managed workflow.

## /api returns 502 (or 404) through the dev domain
When artifact registration churns, the platform port/path routing gets reshuffled (the
balabagdar local port had grabbed externalPort 3000). The api-server is fine locally
(`curl localhost:3000/api/...` = 200) but the dev-domain `/api/*` route 502s.
**Fix: restart the api-server workflow** — this re-establishes its `paths=["/api"]` routing.

**Why:** `/api/*` is routed to the api-server artifact at the platform level via its
`paths=["/api"]`. A Vite dev proxy for `/api` is therefore NOT required and was reverted;
do not re-add it as long as the api-server artifact routing is healthy.
