# Changelog

All notable changes to av-observe will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

This release applies the full cleanup pass tracked in `MAINTENANCE.md`:
scaffolding, mechanical hygiene, and safe back-compat refactors. Every
runtime change preserves existing behavior when new env vars are unset.

### Added

- `.gitignore` covering `node_modules/`, `.env*`, `.ignore/`, `.data/`,
  `data-output.json`, Lambda build artifacts, editor/OS files.
- `av-observe-main/.env.example` documenting every credential variable.
- `av-observe-main/.editorconfig`, `.nvmrc` (Node 20).
- ESLint flat config + Prettier config + ignore files.
- GitHub Actions CI: syntax check, install, lint (advisory), unit tests,
  npm audit (advisory), secret scan.
- `renovate.json` for automated dependency updates.
- `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `MAINTENANCE.md`.
- Unit-test scaffolding: `test/unit/` directory with `node:test` harness,
  smoke spec, `npm run test:unit` script, and a blocking CI job.
- Two ESLint/Prettier devDependencies (`eslint`, `@eslint/js`, `globals`,
  `prettier`) so CI no longer needs an on-the-fly install.

### Changed

- `av-observe-main/package.json`:
  - Removed bogus deps: `crypto`, `npm`, `help`, `version`.
  - Added `engines.node >=20`, `license: UNLICENSED`.
  - Expanded `workspaces` to `["apps/*", "shared"]`.
- All sub-package `package.json` files marked `private: true` and
  normalized to `license: UNLICENSED`.
- Splunk index target is now configurable via `SPLUNK_INDEX`; defaults to
  `zgav_nonprod`, preserving prior behavior. Used by both
  `apps/av-daily-update/app.js` and `apps/av-alerts-api/index.mjs`.
- Microsoft Azure App Registration `clientId` is now configurable via
  `MICROSOFT_CLIENT_ID`; defaults to the historical hardcoded value.
- Test mode is now triggered by any of `mode=testing` (legacy),
  `AV_OBSERVE_MODE=testing`, or `NODE_ENV=test`.
- `buildSplunkPayload(dailyData)` extracted in
  `apps/av-daily-update/app.js` (previously duplicated). Bit-identical
  output.
- Root `README.md` replaced with a proper pointer.
- `av-observe-main/README.md`, `apps/av-daily-update/README.md`, and
  `apps/av-alerts-api/README.md` corrected for drift (non-existent
  modules, missing scripts, stale data-file paths).

### Removed

- `av-observe-main/apps/av-alerts-api/code/` — stale snapshot.
- `av-observe-main/apps/av-alerts-api/code.zip` — build artifact.
- `av-observe-main/data-output.json` — runtime data.
  (~20k lines removed total.)
- `publishConfig` placeholder in `shared/package.json`.
- Outdated `repository` URL in `shared/package.json`.

### Notes

- The CI `lint` job remains advisory (`continue-on-error: true`) because
  the existing codebase has never been auto-formatted. Run
  `npm run format` once to fix and then flip the flag — tracked in
  `MAINTENANCE.md` §12.
- The Lambda durability rewrite (`MAINTENANCE.md` §9) is intentionally
  not in this release. It is an architectural decision.
