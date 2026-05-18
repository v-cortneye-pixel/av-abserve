# Workplace Brief — Vercel site

Marketing and **live demo UI** for Workplace Brief. Deploy separately from the Slack bot (`../av-workplace-brief`).

**No API keys on Vercel** — production briefs run on GitLab CI. See [DEPLOYMENT.md](../../docs/DEPLOYMENT.md).

## Deploy to Vercel

### Option A — Vercel Dashboard

1. Import this GitHub repo in [Vercel](https://vercel.com/new).
2. Set **Root Directory** to: `av-observe-main/apps/workplace-brief-web`
3. Framework preset: **Next.js** (auto-detected).
4. Deploy.

### Option B — Vercel CLI

```bash
cd av-observe-main/apps/workplace-brief-web
npm install
npx vercel
```

Follow prompts; use the same root directory when linking the project.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000 — demo brief renders on the home page.

## API

| Route | Description |
|-------|-------------|
| `GET /api/brief` | JSON demo brief (same data as the UI) |

## Environment variables (future)

| Variable | Purpose |
|----------|---------|
| `SLACK_BOT_TOKEN` | Optional: live Slack preview webhook |
| `MICROSOFT_SECRET_VALUE` | Optional: real calendar in API route |

Beta ships with **demo data only** on Vercel — no secrets required.

## Related

- [av-workplace-brief](../av-workplace-brief/) — Slack bot + cron
- [AV Observe README](../../README.md)
