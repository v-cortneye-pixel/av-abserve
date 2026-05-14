# Security policy

## Reporting a vulnerability

If you discover a security issue in av-observe — including a leaked credential,
a vulnerable dependency exploitable in our deployment, or an avenue for an
external party to inject data into our Slack/Splunk pipelines — **do not open
a public GitHub issue.**

Instead, contact the AV engineering team directly via the internal Slack
channel `#av-observe` or by email to the repository maintainer. Provide:

1. A description of the issue and the impact you believe it has.
2. Steps to reproduce, including any required configuration.
3. Suggested mitigation, if you have one.

We will acknowledge receipt within one business day and keep you updated as
we triage.

## Secrets handling

- All real credentials live in `.env` (local) or in AWS Lambda's KMS-encrypted
  environment (production webhook handler). Neither location is in git.
- `.env.example` documents the *names* of required env vars but **must never**
  contain real values. CI rejects PRs that add non-placeholder values to it.
- If a secret is committed:
  1. Rotate it at the upstream provider immediately.
  2. Remove it from history (`git filter-repo` or BFG) — purging from `HEAD`
     is not sufficient; the value is still in the reflog and on every clone.
  3. Notify the team.

## Dependency hygiene

- `npm audit --omit=dev --audit-level=high` runs on every CI build (advisory).
- Renovate / Dependabot keeps deps current; see `renovate.json`.
- Before promoting a new transitive dep that does network I/O at import time,
  check the impact on the Lambda cold start.

## Hardening notes specific to this repo

- The Lambda Function URL is currently `auth-type: NONE`. Source validation
  happens in `validateSender()` and trusts vendor-specific headers. Treat
  unknown senders as a potential reconnaissance attempt and review CloudWatch
  logs for `> Unknown sender` lines periodically.
- `splunk.push()` should never include user-controlled fields without a prior
  size limit; Splunk HEC will reject very large events and we want a fast
  failure, not a Lambda timeout.
