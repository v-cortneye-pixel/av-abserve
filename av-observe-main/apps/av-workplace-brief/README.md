# Workplace Brief (beta)

**Global workplace copilot for Slack** — proactive day-at-a-glance briefings that combine calendar events, AV room readiness (from AV Observe), and **iOffice wayfinder** links to the exact space.

This app is a **sibling integration** to [av-daily-update](../av-daily-update/): same shared modules (`Slack`, `Zoom`, `Microsoft`), different audience and job.

| | AV Observe (daily-update) | Workplace Brief (this app) |
|--|---------------------------|----------------------------|
| **Audience** | AV / IT operators | Employees, hosts, EAs |
| **Question** | Is the fleet healthy? | Am I ready? Can I find the room? Is AV green? |
| **Timing** | Scheduled daily digest | Before meetings / start of day |
| **Output** | Site-by-site infra report | Personal or pilot-channel brief with actions |

---

## Beta status (v0.1.0)

**Shipped in this beta**

- New app `apps/av-workplace-brief` reusing `@av-observe/shared`
- Demo mode (no API keys) for demos and CI
- Live mode: Microsoft calendar + Zoom room health + Slack post
- Space directory: room name → iOffice wayfinder URL
- Slack blocks: time, location, AV status, Wayfinder + Join buttons

**Pilot required before production**

1. Copy `data/spaceDirectory.sample.json` → `data/spaceDirectory.json` and add real iOffice URLs
2. Add pilot user emails to `config.json` → `pilot.userEmails`
3. Confirm Microsoft Graph `Calendars.Read` for those users
4. Run in `mode=testing` against the test Slack channel

---

## Quick start

From repo root (`av-observe-main/`):

```bash
# Demo — no credentials, writes .ignore/workplace-brief.json
npm run test:workplace-brief

# Demo + post to Slack test channel (needs SLACK_BOT_TOKEN)
npm run test:workplace-brief:slack

# Production pilot (config + credentials required)
npm run app:workplace-brief
```

Environment variables (same as AV Observe where applicable):

| Variable | Required | Purpose |
|----------|----------|---------|
| `WORKPLACE_DEMO=true` | Demo only | Sample events + AV states |
| `WORKPLACE_DRY_RUN=true` | Optional | Build brief without Slack |
| `mode=testing` | Recommended for pilot | Use test Slack channel |
| `SLACK_BOT_TOKEN` | Live post | Slack delivery |
| `ZOOM_*` | Live AV status | Room health lookup |
| `MICROSOFT_SECRET_VALUE` | Live calendar | Graph calendar read |

---

## Architecture

```
Microsoft Calendar ──┐
Zoom Room Health  ───┼──► collectBriefData ──► generateSlackBrief ──► Slack
spaceDirectory.json ─┘         ▲
                               └── AV Observe shared modules
```

---

## Space directory (iOffice wayfinder)

Each entry maps names that appear on calendar invites to a wayfinder URL:

```json
{
  "displayName": "IRV-1109 zRetreat",
  "match": ["IRV-1109", "irv-1109 zretreat"],
  "zoomRoomName": "IRV-1109 zRetreat",
  "ioffice": {
    "spaceId": "abc123",
    "wayfinderUrl": "https://tenant.iofficecorp.com/wayfinder?spaceId=abc123"
  }
}
```

Optional: set `ioffice.wayfinderBaseUrl` in `config.json` and provide only `spaceId` per room.

---

## Rollout plan (for team presentation)

### Phase 0 — Beta (now)

- [x] Scaffold app cloned from AV Observe patterns
- [x] Demo mode for global demo without prod credentials
- [ ] 3–5 pilot users, one site (e.g. IRV)
- [ ] Populate `spaceDirectory.json` for top 10 booked rooms
- [ ] Daily cron: `mode=testing` morning brief

### Phase 1 — Pilot expansion (4–6 weeks)

- Tier-1 meeting detection (keywords + exec calendars)
- Pre-meeting ping 60 minutes before high-importance events
- Link agenda URL from calendar body / Google Drive search
- Slack workflow: “Report AV issue” → routes to site channel

### Phase 2 — Global scale

- Per-site rollout via `siteTimezones` (reuse shared config)
- EA / event host checklist (badge, lunch, Uber — manual templates first)
- Post-event recap (recording link, thread summary)
- Optional: Splunk event `workplace.brief` for adoption metrics

### Phase 3 — Intelligence

- Natural language in Slack: “Prep me for my 2pm”
- iOffice API sync (replace manual space directory)
- Hybrid “huge moment” playbooks (town hall, board, customer)

---

## Team presentation outline (15 min)

1. **Problem** — AV Observe serves operators; employees still scramble for rooms, decks, and AV confidence.
2. **Vision** — One Slack brief: calendar + AV green/yellow + wayfinder to the space.
3. **Live demo** — `npm run test:workplace-brief` → show `workplace-brief.json` + Slack preview.
4. **Reuse** — Same Zoom/Microsoft/Slack stack; no rip-and-replace.
5. **Global path** — Pilot → site rollout → remote “huge moments.”
6. **Ask** — Pilot users, iOffice URL export for top rooms, Graph permission confirmation.

---

## Success metrics (beta)

| Metric | Target |
|--------|--------|
| Pilot users receiving daily brief | 5+ |
| Rooms in space directory | 10+ per pilot site |
| Wayfinder clicks (Slack link analytics) | Track qualitatively in pilot |
| AV issues surfaced before meeting | Compare to reactive tickets |

---

## Files

```
apps/av-workplace-brief/
├── app.js                 # Entry point
├── config.json            # Pilot users, keywords, iOffice base URL
├── data/
│   ├── spaceDirectory.sample.json
│   └── spaceDirectory.json   # Local (copy from sample; not required in git)
└── lib/
    ├── collectBriefData.js
    ├── generateSlackBrief.js
    ├── spaceDirectory.js
    └── normalizeRoomName.js
```

---

## Related

- [AV Observe README](../../README.md)
- [av-daily-update](../av-daily-update/README.md) — operator daily digest
