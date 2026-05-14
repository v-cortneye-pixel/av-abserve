# Changelog

All notable changes to av-observe will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `.gitignore` at repo root covering `node_modules/`, `.env*`, `.ignore/`,
  `.data/`, `data-output.json`, Lambda build artifacts, and editor/OS files.
- `av-observe-main/.env.example` documenting every credential variable used by
  `shared/credentials.js`, plus the optional runtime flags.
- `av-observe-main/.editorconfig` and `.nvmrc` for consistent editor and
  Node version handling.
- ESLint flat config (`eslint.config.js`) and Prettier config
  (`.prettierrc.json` + `.prettierignore`) — opt-in for now, advisory in CI.
- GitHub Actions CI (`.github/workflows/ci.yml`): syntax check, install,
  advisory lint/format, advisory `npm audit`, and a secret scan.
- `renovate.json` for automated dependency updates.
- `CONTRIBUTING.md`, `SECURITY.md`, and this `CHANGELOG.md`.
- `MAINTENANCE.md`: a checklist of code-touching cleanups that still need
  to be applied (and were intentionally left out of this scaffolding pass).

### Notes

- This release **does not modify any existing application code or config**.
  Linters and CI run in advisory mode (`continue-on-error: true`) until the
  team chooses to ratchet them up.
