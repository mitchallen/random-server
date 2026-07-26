# random-server — notes for Claude

A REST API server that returns random JSON data (people, words, values, coords,
and an always-empty route). TypeScript + Express 5, Cucumber tests, Swagger UI
at `/api-docs`, optional `API_KEY` auth, graceful shutdown, multi-stage Docker
on Node 24, published to GHCR + Docker Hub via tag-triggered workflows.

## Remaining work (open GitHub issues)

Check these before starting new work — pick up, update, or close as appropriate.
Run `gh issue list` for the current state.

- _No open issues._ (#48, the Express 5 upgrade, was completed in PR #54.)

Known cleanup, not yet ticketed:

- **`body-parser` is a dead direct dependency.** Nothing in `src/` or `features/`
  imports it — the code uses `express.json()`. Since the Express 5 upgrade the
  tree carries two copies: the vestigial direct `body-parser@1.x` and Express's
  own bundled `body-parser@2.x`. Safe to drop from `dependencies`; it only
  generates Dependabot noise for a package the app never loads.

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
- **Routing (Express 5 / path-to-regexp v8):** bare `*` wildcards are gone — a
  route like `app.get('*', ...)` throws `PathError: Missing parameter name` at
  **boot**, not at request time, so it takes the whole server down. Use the named
  form `app.get('/*splat', ...)` (see the 404 catch-all at the end of
  `src/index.ts`, which must stay last). Named `:id` params are unchanged.
  `req.param()`, `res.sendfile()` and `app.del()` are also removed.
- **API key:** `/v1` routes require `x-api-key` only when `API_KEY` is set at
  launch; root `/` and `/api-docs` stay open. If `API_KEY` is unset the API is open.
- Default branch is `main`. Work on a branch and open a PR (CI gates merges).
