# Maintenance backlog

This file lists cleanup work that was identified during a repository review
but was **intentionally not applied** because each item requires modifying or
deleting existing files. The companion scaffolding PR adds new files only.

Treat each section as a candidate follow-up PR. Items are roughly ordered by
leverage. None of these are urgent on their own, but together they remove a
lot of latent risk.

> **Conventions**
> - "Touch" = an item requires editing or deleting committed files.
> - "Owner" is intentionally left blank — assign when picking up.
> - File paths are relative to the repo root unless prefixed.

---

## 1. `package.json` hygiene (touches `av-observe-main/package.json`)

| # | Change | Rationale |
|---|---|---|
| 1.1 | Remove `crypto` from `dependencies`. | `crypto` is a Node built-in. The npm package of the same name is a deprecated stub and shadows the built-in module. |
| 1.2 | Remove `npm` from `dependencies`. | Installs a copy of npm into `node_modules/`. Almost certainly accidental. |
| 1.3 | Remove `help` and `version`. | Generic-named packages, no source references. Verify with `grep -R "require('help')\|from 'help'\|from 'version'\|require('version')" av-observe-main/`. |
| 1.4 | Verify `ide_qsys` is actually imported anywhere; remove if not. | Custom QRC/HTTP clients exist in `shared/modules/`. |
| 1.5 | Add `"engines": { "node": ">=20" }` and `"private": true` (root already has the latter). | Matches `.nvmrc` and prevents accidental publish. |
| 1.6 | Extend `"workspaces"` to `["apps/*", "shared"]`. | `av-daily-update` and `av-alerts-api` are not currently workspaces; they only work because of root hoisting. |
| 1.7 | Add scripts: `"lint": "eslint ."`, `"format": "prettier --write ."`, `"format:check": "prettier --check ."`. | Make linters first-class. |
| 1.8 | Add devDependencies: `eslint@^9`, `@eslint/js@^9`, `globals@^15`, `prettier@^3`. | Replaces the on-the-fly install in CI. |
| 1.9 | Flip CI lint job's `continue-on-error: true` to `false` after 1.7 + 1.8 land. | See `.github/workflows/ci.yml`. |

## 2. Sub-package hygiene

| # | File | Change |
|---|---|---|
| 2.1 | `av-observe-main/apps/av-alerts-api/package.json` | Add `"private": true`. Remove `crypto` dep (same reason as 1.1). |
| 2.2 | `av-observe-main/apps/av-docker/package.json` | Add `"private": true`. |
| 2.3 | `av-observe-main/shared/package.json` | Either fill in `publishConfig.@av-observe:registry` with a real project ID and intend to publish, or remove the `publishConfig` block and add `"private": true`. Today's `YOUR_PROJECT_ID` placeholder means a stray `npm publish` would 404, but the intent is unclear. |

## 3. License conflict (touches `README.md` and/or sub-`package.json` files)

The README says **"Internal Zillow Group project - All rights reserved."**, but
every sub-`package.json` declares `"license": "ISC"`. Pick one:

- **If proprietary (likely the intent):** change all `"license"` fields to
  `"UNLICENSED"`, add `"private": true` to all sub-packages, and do **not**
  add a `LICENSE` file. Keep the README wording.
- **If open source:** add a top-level `LICENSE` file with the full ISC text and
  update the README accordingly.

The scaffolding PR deliberately did not add a `LICENSE` file because picking
the wrong one is worse than picking neither.

## 4. Delete dead and generated artifacts (deletions)

| # | Path | Why |
|---|---|---|
| 4.1 | `av-observe-main/apps/av-alerts-api/code/` | Stale snapshot of the Lambda. The deploy script `package-lambda.sh` builds from `index.mjs` + `../../shared/`, not from `code/`. It has already diverged (different `validateSender`, different handler, missing `cloud-credentials.js`). Deleting it removes a serious debugging trap. |
| 4.2 | `av-observe-main/apps/av-alerts-api/code.zip` | Build output. Now ignored via `.gitignore`; remove from git history via `git rm --cached code.zip`. |
| 4.3 | `av-observe-main/data-output.json` | Runtime data; the live copy lives under `.ignore/` or `.data/`. Now ignored. Remove via `git rm --cached av-observe-main/data-output.json`. |

## 5. Top-level README (touches `README.md`)

The root `README.md` is one line containing a typo (`# av-abserve`). Replace
with a brief pointer:

```markdown
# av-observe

The project lives in [`av-observe-main/`](./av-observe-main/). See its
[README](./av-observe-main/README.md) for the full overview, plus
[CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md), and
[MAINTENANCE.md](./MAINTENANCE.md) in this directory.
```

Better still: move the contents of `av-observe-main/` up to the repo root and
delete the wrapper directory entirely. The nesting serves no purpose.

## 6. README inaccuracies (touches `av-observe-main/README.md` and app READMEs)

- References a `qrc.js` module that does not exist in `shared/modules/`.
- Places `ErrorSync.js` in `shared/modules/`; it actually lives in
  `apps/av-daily-update/`.
- Lists `SIMULATE_OUTAGES=true` as a supported flag; it is not referenced in
  `app.js`.
- `apps/av-alerts-api/README.md` contains inline code samples that no longer
  match `index.mjs` (the real code delegates to `shared/modules/qsysWebhooks.js`
  and `shared/modules/zoomWebhooks.js`).

Sweep these on the next docs PR; add a checkbox to the PR template once one
exists.

## 7. Config externalization (touches `app.js`, `index.mjs`, `credentials.js`, `config.json`)

| # | Item |
|---|---|
| 7.1 | Splunk index `'zgav_nonprod'` is hardcoded in both `app.js` and the Lambda. Move to `process.env.SPLUNK_INDEX` with a sensible default. Production should not literally read `nonprod`. |
| 7.2 | Microsoft `clientId: '351ce072-...'` is hardcoded in `shared/credentials.js` with a TODO comment. Move to `MICROSOFT_CLIENT_ID` env var. `.env.example` already has a stubbed-out entry. |
| 7.3 | The runtime mode flag is `process.env.mode` (lowercase). Migrate to `NODE_ENV` or `AV_OBSERVE_MODE` for tooling compatibility. Add a back-compat shim that reads both for one release. |
| 7.4 | Per-environment Slack channel IDs live in `shared/config.json`. Consider splitting into `config.production.json` / `config.testing.json` selected by env. |

## 8. Code-quality follow-ups (touches `app.js`)

| # | Item |
|---|---|
| 8.1 | Extract `buildSplunkPayload(dailyData)` so it isn't defined twice (`updateSplunk` and `saveDailyDataFiles` build the same object). |
| 8.2 | Convert `fs.writeFileSync` / `existsSync` / `mkdirSync` calls inside `async` functions to `fs/promises` equivalents. |
| 8.3 | Decide which pipeline stages are soft-fail (return empty data, keep going) vs hard-fail (throw, alert, exit). Currently `processSplunkUpdates`, `trackErrorTypes`, and `sendSiteSpecificAlerts` can throw and break the run; the upstream collectors all swallow. |
| 8.4 | Add a top-level overall timeout (e.g. wrap `main()` in `Promise.race` with a 20-minute guard) so a hung remote API can't keep the daily job alive forever. |

## 9. Lambda durability (touches `apps/av-alerts-api/index.mjs`)

The current pattern is:

```js
context.callbackWaitsForEmptyEventLoop = false;
const sync = await processSynchronously(event);
processAsynchronously(event, sync).catch(...);
return sync.response;
```

This works, but the AWS-recommended pattern for "respond fast then continue
work" is one of:

- **Lambda Response Streaming** (`awslambda.streamifyResponse`).
- A second invocation (SNS / EventBridge / SQS) that handles the slow path.

If async work load grows or if you ever see truncated Splunk logs after a
quick burst, that's the symptom of the container being frozen mid-flight.

## 10. Testing baseline

There is no real unit-test setup. Recommended starting point:

- Use Node's built-in `node:test` runner (no devDeps needed).
- Add tests for pure helpers first: `generateReport`, `validateSender`,
  the eventual `buildSplunkPayload`, and `ErrorSync` categorization.
- Wire `node --test` into the CI `lint` job (or its own job) once present.

## 11. Repository hosting note

`av-observe-main/shared/package.json` references
`https://gitlab.zgtools.net/av/prod/av-observe.git`, but the GitHub remote in
this clone is `github.com/v-cortneye-pixel/av-abserve`. Reconcile this:

- If GitHub is now canonical: update `repository.url` to the GitHub URL and
  remove/adjust the GitLab `publishConfig` (see item 2.3).
- If GitLab is canonical and this is a fork: add the source GitLab URL to the
  root README and consider adding a GitLab mirror workflow.

The CI scaffolding in this PR targets GitHub Actions; if the canonical home
is GitLab, replace `.github/workflows/ci.yml` with `.gitlab-ci.yml` (the same
jobs map cleanly).

---

## Suggested PR sequencing

1. **PR A — package.json hygiene (§1, §2).** Mechanical, easy to review.
2. **PR B — delete dead artifacts (§4).** Pure deletions, low risk.
3. **PR C — license decision (§3) and README fixes (§5, §6).** Documentation.
4. **PR D — config externalization (§7).** Touches multiple files but each
   change is small and testable in `mode=testing` first.
5. **PR E — code quality (§8) and Lambda durability (§9).** Bigger surface
   area; do after the previous PRs have established guard rails.
6. **PR F — testing baseline (§10).** Can land in parallel with anything.

Once §1.7/§1.8 land, flip the CI lint job's `continue-on-error` to `false`
and the safety net engages by default for every PR.
