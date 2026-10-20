# random-server — notes for Claude

A REST API server that returns random JSON data (people, words, values, coords,
and an always-empty route). TypeScript 7 + Express 5, Cucumber 13 tests, Swagger
UI at `/api-docs`, optional `API_KEY` auth, graceful shutdown, multi-stage Docker
on Node 26, published to GHCR + Docker Hub via tag-triggered workflows.

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
  Docker Hub. See the README "Publish" section. Use a **minor** bump when the
  runtime or a framework moves a major (2.2.0 = Express 5; 2.3.0 = Node 26 base
  image + `swagger-jsdoc` removal), patch otherwise. GHCR and Docker Hub
  images have different digests because two workflows build them separately;
  that's expected.
- **Deciding whether a release is due:** compare `main` against the latest tag
  and ignore `.github/` and `*.md` — CI and docs changes don't reach the image.
  A lockfile change only counts if it moves the *production* tree; compare the
  non-dev entries (`jq '.packages|to_entries[]|select(.value.dev!=true)'` on
  `package-lock.json` at the tag vs now). Dependabot auto-merges land on `main`
  without a release, so a production bump (e.g. `express` 5.3.0 in #85) sits
  unshipped until someone tags it.
- **Auto-merged PRs don't trigger a `push` CI run on `main`.** Merges made with
  the workflow's `GITHUB_TOKEN` don't start other workflows, so the merge commit
  shows no `test`/`docker` run. The PR's own required checks are the gate; the
  next push you make (e.g. the version bump) runs CI on `main` again.
- **PR CI builds and smoke-tests the image** (the `docker` job in
  `.github/workflows/test.yml`), but only for the runner's platform — the
  `linux/arm64` half of the multi-platform build only runs at release. The
  `test` job's `node-version` must match the `Dockerfile` base image major
  (both 26) — bump them together, or the Cucumber suite tests a different Node
  than production runs. Still run
  `docker build .` locally before tagging when the `Dockerfile` or build
  pipeline changed.
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
- **Find where alerts come from before patching them one by one.** Tally the
  alert history by package (`gh api --paginate
  'repos/mitchallen/random-server/dependabot/alerts?per_page=100'`) and trace
  each package to its top-level dependent with `npm explain <pkg>`. That's how
  `swagger-jsdoc` turned out to be behind ~30 of ~54 alerts in a year — a
  dependency to remove, not a stream of overrides to keep bumping.
- **Dev dependencies raise Dependabot alerts too.** Moving a package to
  `devDependencies` keeps it out of the image but not out of the alert feed;
  only removing it does that.
- **`npm audit` can be ahead of GitHub's alerts.** On 2026-10-12 sibling
  `mockport-server` had a critical `proxy-addr` advisory in `npm audit` with no
  Dependabot alert or PR yet. Run `npm audit` when reviewing, rather than
  treating zero open alerts as zero vulnerabilities.
- **Adding or editing `dependabot.yml` triggers a run immediately**, not at the
  next Monday. Bring dependencies and actions current *before* landing a new
  config, or expect a batch of catch-up PRs within minutes.
- **Read the `package.json` diff of automated security-fix PRs.** In sibling
  `mcp-hello-typescript-server`, a "Dependabot resolver" PR (#51) promoted five
  transitive packages to direct `dependencies` (one, `fast-uri@^4`, never even
  reached the nested copy it targeted) and slipped in a `zod` 3 → 4 major.
  Lockfile-only changes are the expected shape; new direct deps are a red flag.
- **Floating `lts-alpine` tag as an alternative to pinning.** The archived demo
  repos switched to `node:lts-alpine`, which follows the LTS policy above
  automatically and never triggers a Dependabot docker PR (no version number to
  bump). The trade-off is less reproducible builds and no PR to review when the
  major moves. Once Node 26 is LTS (2026-10-28) this repo could do the same; for
  now it pins `26-alpine`.
- **Untyped JS dependencies fail the build under TypeScript 7** with `TS7016`
  (5.x silently inferred `any`). `@mitchallen/uptime` was vendored to
  `src/uptime.ts` for exactly this reason — don't re-add it. For a tiny untyped
  dep, prefer vendoring it or shipping real types over an ambient
  `declare module`, which suppresses the error without typing anything.

## Sibling projects (`../`)

random-server was the template for several sibling servers. As of 2026-10-20:

- **Archived** (read-only on GitHub; don't revive the pattern): `csv-server`,
  `image-server`, `markdown-server`, `video-server` were copies of the *old*
  random-server template (swagger-jsdoc, axios, body-parser, mocha/istanbul,
  Express 4, Node 23) with ~90 open alerts each and no tests or CI. The small
  demos `docker-build-args`, `docker-no-latest`, `docker-nginx` and
  `docker-go-wicked-small` were modernised and then archived.
- **Active**, each with CI + Dependabot: `thing-server` (same stack, already on
  a typed `src/openapi` spec), `mockport-server`, and `mcp-hello-go-server`,
  `mcp-hello-rust-server`, `mcp-hello-server`, `mcp-hello-typescript-server`,
  `random-mcp-server`. A fix made here (e.g. the `@scarf/scarf` deny) often
  applies to `thing-server` too.
- **Shared baseline (all eight active repos, as of 2026-10-20):** branch
  protection on `main` with required checks, the repo's *Allow auto-merge*
  setting on, a `dependabot-auto-merge.yml` (actions: all; everything else:
  minor + patch), and a **required check that starts the built container**
  and probes it. The REST servers do that in a `docker` job (random-server,
  thing-server, mockport-server's `make smoke`); the MCP servers do it inside
  the required `scan` job, running `make docker-smoke` (an MCP `initialize`)
  against the image it just built. mockport-server deliberately leaves its
  `audit` job *not* required, so one unrelated advisory can't block every PR.
  Before adding any of these to a sibling, check it isn't already there — the
  mcp-hello repos had all of it except the container start.
- **Siblings drift on dependency bumps.** Schedules differ (thing-server and
  mockport-server update monthly; random-server and the MCP servers weekly),
  so a bump that lands here can take weeks to reach a sibling.
  When releasing here for a production dep, run `npm outdated` in
  `thing-server` **and** `mockport-server` too — express 5.3.0 shipped here as
  2.3.2 and was hand-bumped in both the same day (thing-server #102 → 1.0.32,
  mockport-server #38 → 0.1.9). While in a sibling, run `npm explain <pkg>`
  on each `overrides` entry: mockport-server's `diff` and
  `serialize-javascript` pins had been dead since its mocha removal.
- **Release and merge conventions differ per repo — follow each one's own
  CLAUDE.md:**
  - random-server, thing-server: `npm version X.Y.Z` → push `main` and the
    `vX.Y.Z` tag. random-server merges PRs with `--merge`; the others squash.
  - mcp-hello-rust-server, mcp-hello-typescript-server, random-mcp-server:
    add the `## [X.Y.Z]` section to `CHANGELOG.md` (and its compare link),
    commit `docs: changelog for vX.Y.Z` to `main`, then `make release` — it
    refuses to run without that section, and creates the GitHub Release
    itself.
  - mockport-server, mcp-hello-go-server and mcp-hello-server release through
    a PR (`Release vX.Y.Z (#N)`). go and mcp-hello-server have
    `enforce_admins` **on**, so nothing can be pushed straight to their `main`.
- **Publish runs are slow for compiled/multi-arch images — don't mistake that
  for a hang.** Typical tag-to-done: random-server, thing-server,
  mockport-server and mcp-hello-typescript-server ~1.5 min; random-mcp-server
  14–20 min; mcp-hello-rust-server 19–27 min (the `linux/arm64` half under
  QEMU). Compare against `gh run list --workflow publish.yml` before
  investigating.
- **After publishing, check what shipped, not just the green run:**
  `docker buildx imagetools inspect <image>:X.Y.Z` on both registries for
  `linux/amd64` + `linux/arm64`, and for a dependency release, run the image
  to read the version it carries, e.g.
  `docker run --rm --entrypoint node <image>:X.Y.Z -p "require('express/package.json').version"`.
