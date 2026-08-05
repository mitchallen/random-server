# random-server — notes for Claude

A REST API server that returns random JSON data (people, words, values, coords,
and an always-empty route). TypeScript 7 + Express 5, Cucumber 13 tests, Swagger
UI at `/api-docs`, optional `API_KEY` auth, graceful shutdown, multi-stage Docker
on Node 24, published to GHCR + Docker Hub via tag-triggered workflows.

## Remaining work (open GitHub issues)

Check these before starting new work — pick up, update, or close as appropriate.
Run `gh issue list` for the current state.

- _No open issues._ (#48, the Express 5 upgrade, was completed in PR #54.)

## Conventions

- **TypeScript build:** source in `src/`, compiled to `dist/` via `npm run build`
  (`tsc`, then `scripts/copy-yaml.mjs` to mirror the `*.yaml` swagger files into
  `dist/`). `start` runs `node dist/index.js`. The copy step is a plain
  `fs.cpSync` with no dependencies — it replaced `copyfiles`, which was
  unmaintained and dragged in `glob@7` + `inflight`.
- **Tests:** `npm test` (Cucumber, `features/`). The suite **spawns the compiled
  server** (`node dist/index.js`) in `BeforeAll`, so `npm run build` must run
  first. The test server launches with `API_KEY=demo-key`. CI
  (`.github/workflows/test.yml`) runs build + test on push/PR to `main`.
- **Release:** bump the version and push a `v*` tag → the publish workflows build
  and push multi-platform images to GHCR + Docker Hub and sync the README to
  Docker Hub. See the README "Publish" section.
- **PR CI never builds the Docker image** — only the tag-triggered publish
  workflows do. A broken `Dockerfile` or build script therefore stays invisible
  until release. Run `docker build .` locally before tagging whenever the build
  pipeline, `Dockerfile`, or anything `npm run build` touches has changed.
- **Routing (Express 5 / path-to-regexp v8):** bare `*` wildcards are gone — a
  route like `app.get('*', ...)` throws `PathError: Missing parameter name` at
  **boot**, not at request time, so it takes the whole server down. Use the named
  form `app.get('/*splat', ...)` (see the 404 catch-all at the end of
  `src/index.ts`, which must stay last). Named `:id` params are unchanged.
  `req.param()`, `res.sendfile()` and `app.del()` are also removed.
- **Body parsing:** use the built-in `express.json()` (see `src/index.ts`, which
  wires it with a `verify` hook that rejects malformed JSON with a 400). Don't
  re-add `body-parser` as a direct dependency — Express 5 bundles its own copy,
  and a second one is dead weight plus a Dependabot alert surface.
- **API key:** `/v1` routes require `x-api-key` only when `API_KEY` is set at
  launch; root `/` and `/api-docs` stay open. If `API_KEY` is unset the API is open.
- Default branch is `main`. Work on a branch and open a PR (CI gates merges).
  Version-bump commits are the exception — those go straight to `main`, with a
  bare `2.x.x` commit message.

## Dependencies & Dependabot

- **Config:** `.github/dependabot.yml`, weekly on Monday, covering all three
  ecosystems present — npm, docker (the `Dockerfile` base image), and
  github-actions. `@types/*` and other minor/patch npm bumps are **grouped**
  into single PRs; majors stay individual so each gets its own review. Security
  updates are independent of this file and arrive regardless.
- **Transitive CVEs are pinned via `overrides`,** not by adding direct
  dependencies — see the `overrides` block in `package.json` (`js-yaml`, `qs`,
  `brace-expansion`). When a follow-up advisory lands for something already
  pinned, **bump the existing entry** rather than adding a second one —
  `brace-expansion` has been moved twice this way (`5.0.6 → 5.0.7 → 5.0.9`).
  Overrides can also be **scoped to one dependent** when only that package is
  the problem: `swagger-jsdoc → glob: ^13.0.6` exists solely to silence a
  deprecation warning, and is safe because glob v13 still exports the `.sync`
  swagger-jsdoc calls and the `apis` entries are literal paths, not patterns.
- **Docker base image: stay on LTS Node.** Dependabot will propose odd-numbered
  current releases (Node 25 was declined in #60); take a major only when the
  next LTS ships. The `Dockerfile` pins the floating `24-alpine` tag, so
  patch/minor Node updates already arrive at build time with no PR.
- **Closing a Dependabot PR** stops it re-proposing *that* version but not
  future ones — it opens a fresh PR when a newer version appears. That's why
  #60 was closed without an `ignore` rule: Node 26 LTS should still get a PR.
- **Keep install output warning-free.** A cold `npm ci` currently emits **zero**
  `npm warn deprecated` lines; keep it that way. Warnings that always appear and
  never matter train you to skip the output, so a real one gets missed. Fix the
  cause — drop or replace the offending package, or scope an override — rather
  than hiding it behind `--silent` or a redirect.
- **Untyped JS dependencies fail the build under TypeScript 7** with `TS7016`
  (5.x silently inferred `any`). `@mitchallen/uptime` was vendored to
  `src/uptime.ts` for exactly this reason — don't re-add it. For a tiny untyped
  dep, prefer vendoring it or shipping real types over an ambient
  `declare module`, which suppresses the error without typing anything.
