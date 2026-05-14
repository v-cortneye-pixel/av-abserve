# Contributing to av-observe

Thanks for working on AV Observe. This file describes the day-to-day workflow
and conventions that keep the repo healthy. For a one-time list of repo
hygiene issues that still need to be paid down, see `MAINTENANCE.md`.

> **Note:** the actual project lives in `av-observe-main/`. All `npm` commands
> below should be run from that directory unless stated otherwise.

## Prerequisites

- Node.js — version pinned in `av-observe-main/.nvmrc` (currently 20).
- `npm` (ships with Node).
- For deploying the Lambda: AWS CLI configured for the target account.

```bash
cd av-observe-main
nvm use            # or: fnm use
npm install
cp .env.example .env
# fill .env with real secrets
```

## Branching & PRs

- Branch from `main` for everything: `git checkout -b feature/<short-name>`.
- Keep PRs small and focused on a single logical change.
- Reference the issue or alert that motivated the change in the PR description.
- Run lint/format and the relevant scripts locally before opening the PR.

## Local checks

Until ESLint/Prettier are added to `devDependencies` (see `MAINTENANCE.md`),
you can run them on-the-fly:

```bash
cd av-observe-main
npx --yes eslint@^9 .
npx --yes prettier@^3 --check .
```

Syntax-only check (no install required):

```bash
find av-observe-main \
  \( -name node_modules -o -name .ignore -o -name .data \) -prune -false \
  -o -type f \( -name '*.js' -o -name '*.mjs' \) -print0 \
  | xargs -0 -I {} node --check {}
```

## Running things

| Command | What it does |
| --- | --- |
| `npm run app:daily-update` | Full production daily run. |
| `npm run test:daily-update` | Same, but in `mode=testing` (Slack test channel, no Splunk). |
| `npm run splunk-only` | Skip Slack, only push to Splunk. |
| `npm run script:deploy-alerts` | Package and upload the Lambda to AWS. |
| `npm test` | Interactive scenario runner. |

## Secrets

- **Never** commit `.env`. The repo `.gitignore` blocks it; do not bypass.
- `.env.example` documents every variable. If you add a new credential to
  `shared/credentials.js`, add it to `.env.example` in the same PR.
- Lambda credentials are KMS-encrypted in the Lambda's own environment, not
  loaded from `.env`. See `shared/cloud-credentials.js`.
- If a secret is committed by accident, rotate it immediately and open an
  incident before doing anything else.

## Style

- Configured via `.editorconfig`, `.prettierrc.json`, and `eslint.config.js`.
- New JS/MJS files: tabs, single quotes, semicolons, 100 char width.
- Don't add narrating comments (`// increment the counter`). Comments should
  explain *why*, not *what*.

## Module boundaries

- Code in `shared/modules/` must remain Lambda-safe:
  - No code with side effects at import time.
  - Avoid heavy deps (`googleapis`, `ssh2`) in modules imported by the Lambda.
  - The Lambda imports modules directly (`shared/modules/Splunk.js`) rather
    than the barrel (`shared/modules/index.js`). Keep it that way.
- New service integrations follow the pattern in `shared/modules/`:
  - One class per service, default-exported.
  - Credentials come from `getCredentials('<type>')`.
  - Add to `shared/modules/index.js` and re-export from there.

## Tests

The repo currently has scenario scripts under `test/`, not unit tests. When
adding new pure functions (report builders, validators, parsers), pair them
with `node --test` unit tests so they can run in CI without network access.

## Commit messages

Conventional-ish prefixes preferred, but not enforced:

```
feat(qsys): add temperature alerting threshold
fix(slack): handle 429 rate limits with backoff
chore: bump @aws-sdk/client-kms to 3.901.0
docs: clarify .env.example for Google Meet
```
