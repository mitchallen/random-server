# random-server — notes for Claude

A REST API server that returns random JSON data (people, words, values, coords,
and an always-empty route). TypeScript + Express 4, Cucumber tests, Swagger UI
at `/api-docs`, optional `API_KEY` auth, graceful shutdown, multi-stage Docker
on Node 24, published to GHCR + Docker Hub via tag-triggered workflows.

## Remaining work (open GitHub issues)

Check these before starting new work — pick up, update, or close as appropriate.
Run `gh issue list` for the current state.

- **[#48 Upgrade to Express 5](https://github.com/mitchallen/random-server/issues/48)** — the one place random-server lags thing-server. Bump Express **and** fix the bare `app.get('*', ...)` 404 route to `app.get('/*splat', ...)` in the same change (path-to-regexp v8). thing-server already did this; use it as the reference.

## Conventions

- **TypeScript build:** source in `src/`, compiled to `dist/` via `npm run build`
  (`tsc` + `copyfiles` for the `*.yaml` swagger files). `start` runs
  `node dist/index.js`.
- **Tests:** `npm test` (Cucumber, `features/`). The suite **spawns the compiled
  server** (`node dist/index.js`) in `BeforeAll`, so `npm run build` must run
  first. The test server launches with `API_KEY=demo-key`. CI
  (`.github/workflows/test.yml`) runs build + test on push/PR to `main`.
- **Release:** bump the version and push a `v*` tag → the publish workflows build
  and push multi-platform images to GHCR + Docker Hub and sync the README to
  Docker Hub. See the README "Publish" section.
- **API key:** `/v1` routes require `x-api-key` only when `API_KEY` is set at
  launch; root `/` and `/api-docs` stay open. If `API_KEY` is unset the API is open.
- Default branch is `main`. Work on a branch and open a PR (CI gates merges).
