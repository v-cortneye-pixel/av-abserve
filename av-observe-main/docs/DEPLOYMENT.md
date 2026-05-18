# Deployment & operations guide

**Workplace Brief** (employee copilot) + **AV Observe** (AV ops platform) — how to run everything internally, and how to host the **public demo** on Vercel **without secrets**.

---

## Architecture (two surfaces, one repo)

| Surface | Host | Secrets | Purpose |
|---------|------|---------|---------|
| **AV Observe** `av-daily-update` | GitLab scheduled CI / manual | Yes (CI variables) | Daily fleet health, Splunk, site Slack |
| **Workplace Brief** `av-workplace-brief` | GitLab scheduled CI / manual | Yes (CI variables) | Tier-1 morning brief → Slack |
| **Demo website** `workplace-brief-web` | **Vercel** (public) | **None** | Team deck URL, fake data only |

Org keys **never** go on Vercel. Production runs on **GitLab CI** (same trust zone as today’s AV Observe).

---

## Part 1 — GitLab CI (internal backbone)

### 1.1 CI/CD variables (Settings → CI/CD → Variables)

Set these as **masked** / **protected** (same as existing AV Observe):

| Variable | Used by |
|----------|---------|
| `SLACK_BOT_TOKEN` | daily-update, workplace-brief |
| `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` | both |
| `MICROSOFT_SECRET_VALUE` | workplace-brief (+ calendar in daily-update if enabled) |
| `QSYS_*`, `DOMOTZ_KEY`, `SPLUNK_TOKEN`, etc. | daily-update |

Optional for workplace-brief pilot:

| Variable | Purpose |
|----------|---------|
| `WORKPLACE_PILOT_EMAILS` | Comma-separated UPNs (future: wire in config loader) |

Today, pilot emails are set in `apps/av-workplace-brief/config.json` → `pilot.userEmails`.

### 1.2 Pipeline jobs

| Job | Command | When |
|-----|---------|------|
| `av-daily-update` | Full AV Observe digest | Schedule / manual |
| `workplace-brief-morning` | Tier-1 brief → **test** Slack (`mode=testing`) | Schedule / manual |
| `workplace-brief-dry-run` | Demo data, no Slack | MR / manual |

File: `av-observe-main/.gitlab-ci.yml` (repo root runs `cd av-observe-main`).

### 1.3 Create schedules (GitLab → CI/CD → Schedules)

**Schedule A — AV daily update**

- Cron: `0 15 * * 1-5` (adjust for 7:00 AM your timezone)
- Variable: `SCHEDULE_TYPE` = `daily-update` (optional; or use default manual + one schedule without filter)
- Target branch: `main`

**Schedule B — Workplace Brief morning**

- Cron: `0 14 * * 1-5` (e.g. 7:00 AM Pacific = 14:00 UTC during PDT)
- Variable: `SCHEDULE_TYPE` = `workplace-brief`
- Target branch: `main`

### 1.4 Manual runs (first pilot)

```bash
# On your laptop (from av-observe-main/, with .env)
npm install
npm run test:workplace-brief          # demo + dry run
mode=testing npm run app:workplace-brief   # live APIs → test Slack (needs .env)
```

In GitLab: **CI/CD → Pipelines → Run pipeline** → play `workplace-brief-morning`.

### 1.5 Pilot configuration checklist

1. **`apps/av-workplace-brief/config.json`**
   - Add emails to `pilot.userEmails`
   - `pilot.primarySite`: `IRV` (default)
   - `briefing.tier1Only`: `true` (default)

2. **`apps/av-workplace-brief/data/spaceDirectory.json`**
   - Replace `REPLACE_IOFFICE_WAYFINDER_*` with real iOffice wayfinder URLs (IRV rooms pre-listed)

3. **Verify** artifact `av-observe-main/.data/workplace-brief.json` after each run

4. **Promote to prod Slack**: remove `mode: testing` from `workplace-brief-morning` job in `.gitlab-ci.yml` when ready

---

## Part 2 — Vercel (public demo only, no keys)

### 2.1 What Vercel hosts

- Landing page + live **demo** brief (fake calendar data)
- `GET /api/brief` JSON (demo only)

It does **not** call Microsoft, Zoom, or Slack.

### 2.2 Deploy steps

1. Go to **[vercel.com/new](https://vercel.com/new)** and import your GitHub repository.
2. **Root Directory** (required):

   ```
   av-observe-main/apps/workplace-brief-web
   ```

3. Framework: **Next.js** (auto-detected).
4. **Do not** add `SLACK_BOT_TOKEN`, `ZOOM_*`, or `MICROSOFT_*` in Vercel env.
5. Click **Deploy**.

### 2.3 After deploy

Your URL will look like:

```
https://workplace-brief-web-<team>.vercel.app
```

Or add a custom domain in Vercel → Project → Settings → Domains.

### 2.4 Local preview (same as production demo)

```bash
cd av-observe-main/apps/workplace-brief-web
npm install
npm run dev
# http://localhost:3000
```

### 2.5 Vercel CLI (optional)

```bash
cd av-observe-main/apps/workplace-brief-web
npx vercel --prod
```

---

## Part 3 — How the pieces connect

```
┌─────────────────────────────────────────────────────────────┐
│  GitLab CI (secrets)                                         │
│  ├─ av-daily-update     → Zoom, Q-SYS, Domotz, Splunk, Slack │
│  └─ workplace-brief     → Graph, Zoom health, Slack brief    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Vercel (no secrets)                                         │
│  └─ workplace-brief-web  → demo UI for presentations          │
└─────────────────────────────────────────────────────────────┘
```

Tier-1 filter keeps briefs short (keywords: All Hands, Board, zRetreat, Customer, QBR, etc.).

---

## Part 4 — npm scripts reference

Run from `av-observe-main/`:

| Script | Description |
|--------|-------------|
| `npm run app:daily-update` | AV Observe production digest |
| `npm run test:daily-update` | AV Observe test channel |
| `npm run test:workplace-brief` | Workplace Brief demo + dry run |
| `npm run test:workplace-brief:slack` | Demo data → test Slack |
| `npm run app:workplace-brief` | Live brief (tier-1, needs config + .env) |

Environment flags:

| Flag | Effect |
|------|--------|
| `WORKPLACE_DEMO=true` | Sample events |
| `WORKPLACE_DRY_RUN=true` | No Slack post |
| `WORKPLACE_TIER1_ONLY=false` | Disable keyword filter |
| `mode=testing` | Test Slack channel |

---

## Part 5 — Team presentation script

1. Open **Vercel URL** — “This is what employees see (demo data).”
2. Show **GitLab pipeline** `workplace-brief-dry-run` on MR — “CI validates every change.”
3. Show **manual** `workplace-brief-morning` artifact — “Real data stays internal.”
4. Show **av-daily-update** — “Same platform powers AV readiness on each room line.”

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `No pilot users configured` | Add `pilot.userEmails` or use `WORKPLACE_DEMO=true` |
| Empty brief, no Slack | Expected with tier-1 filter; widen keywords or set `postToSlackWhenEmpty` |
| Wayfinder links broken | Update `data/spaceDirectory.json` with real iOffice URLs |
| Graph 403 | App registration needs `Calendars.Read` + admin consent for pilot mailboxes |

---

## Related docs

- [apps/av-workplace-brief/README.md](../apps/av-workplace-brief/README.md)
- [apps/workplace-brief-web/README.md](../apps/workplace-brief-web/README.md)
- [README.md](../README.md) — AV Observe overview
