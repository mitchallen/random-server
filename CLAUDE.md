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
  (plain `tsc`). `start` runs `node dist/index.js`.
- **OpenAPI spec:** `src/openapi.ts` builds the `/api-docs` spec as a typed
  `OpenAPIV3.Document` (types from the dev-only `openapi-types`). Document new
  routes there — `collectionPaths()` covers the list/count/by-id trio. Don't
  bring back YAML spec files or `swagger-jsdoc`: it pulled 27 packages into
  production (`ajv`, `fast-uri`, `js-yaml`, `glob`/`minimatch`/
  `brace-expansion`, a pre-release `yaml`) and caused most of this repo's
  Dependabot alerts, all to merge three static YAML files.
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
- **Low-risk Dependabot PRs auto-merge** via
  `.github/workflows/dependabot-auto-merge.yml`: all github-actions updates,
  plus npm/docker **minor and patch**. Majors always stay manual — the
  TypeScript 5.9 → 7.0 bump broke the build and the Node 24 → 25 base image was
  declined, and both needed a human. This relies on branch protection: `main`
  requires the `test` and `docker` checks, which is what native auto-merge
  waits for. Without required checks, auto-merge would land PRs *without* CI
  gating them. `enforce_admins` is off, so direct version-bump pushes to `main`
  still work.
- **Transitive CVEs are pinned via `overrides`,** not by adding direct
  dependencies — see the `overrides` block in `package.json` (currently just
  `qs`, under Express). When a follow-up advisory lands for something already
  pinned, **bump the existing entry** rather than adding a second one.
  Overrides can also be **scoped to one dependent** when only that package is
  the problem (`"parent": { "child": "^x" }`). Before adding an override,
  check whether the dependent is worth keeping at all — removing
  `swagger-jsdoc` retired three overrides at once.
- **Docker base image: stay on LTS Node.** Take a major only once it has
  actually *entered* LTS — not when it's merely released. Dependabot proposes
  both odd-numbered current releases (Node 25, declined in #60) and even majors
  that are still in their pre-LTS "Current" phase (Node 26 released 2026-05-05
  but isn't LTS until **2026-10-28**). The `Dockerfile` pins the floating
  `26-alpine` tag, so patch/minor Node updates already arrive at build time with
  no PR. Check the real dates against
  <https://github.com/nodejs/Release/blob/main/schedule.json> rather than
  assuming an even major is LTS.
- **PR #71 (`24-alpine` → `26-alpine`) was merged on 2026-08-24**, ahead of
  the planned hold until Node 26 entered LTS on 2026-10-28. Its `test` and
  `docker` checks passed, so the image builds on 26. The base image is
  now `node:26-alpine` in both `Dockerfile` stages.
- **Closing a Dependabot PR** stops it re-proposing *that* version but not
  future ones — it opens a fresh PR when a newer version appears. That's why
  #60 was closed without an `ignore` rule, and it worked: Node 26 duly got its
  own PR (#71). Parking a PR open, as was planned for #71, is the alternative
  when the version is one you *do* eventually want — it keeps the reminder visible
  instead of waiting on Dependabot to re-propose.
- **Keep install output warning-free.** A cold `npm ci` currently emits **zero**
  `npm warn deprecated` lines; keep it that way. Warnings that always appear and
  never matter train you to skip the output, so a real one gets missed. Fix the
  cause — drop or replace the offending package, or scope an override — rather
  than hiding it behind `--silent` or a redirect.
- **Install scripts are an explicit allow/deny list** (`allowScripts` in
  `package.json`, npm 11). npm already skips unlisted scripts but warns about
  each one; listing it silences the warning. `@scarf/scarf` (download
  telemetry pulled in by `swagger-ui-dist`) is denied — nothing here needs it.
  Add a new package with `npm install-scripts approve|deny <pkg>`, approving
  only when it genuinely needs to build something. A user-level
  `allow-scripts=` line in `~/.npmrc` is ignored here and npm says so; that
  warning is local to the machine, not something to fix in this repo.
- **Untyped JS dependencies fail the build under TypeScript 7** with `TS7016`
  (5.x silently inferred `any`). `@mitchallen/uptime` was vendored to
  `src/uptime.ts` for exactly this reason — don't re-add it. For a tiny untyped
  dep, prefer vendoring it or shipping real types over an ambient
  `declare module`, which suppresses the error without typing anything.
