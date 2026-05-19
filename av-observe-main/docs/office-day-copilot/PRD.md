# Office Day Copilot — One-Page PRD

**Product:** Office Day Copilot (working name)  
**Owner:** AV / Workplace Technology  
**Status:** Proposal (Phase 0 → Phase 1)  
**Last updated:** 2026-05-19  

---

## Problem

Remote-first employees have strong digital rituals (calendar, Slack, docs). **High-stakes in-office days** (all-hands, customer visits, offsites, exec summits) still depend on fragmented Slack DMs, ad hoc AV checks, and manual coordination (travel, badges, catering, agendas). AV Observe already proves we can monitor 200+ rooms and push daily Slack intelligence—we do not yet **orchestrate the human experience** of a flagship office day.

## Vision

A **Slack-native copilot** that proactively briefs people on what matters today, ties **calendar + room + AV readiness** into one view, and closes the loop on whether the day actually worked—not only whether devices were online.

## Goals (12 months)

| Goal | Metric |
|------|--------|
| Reduce last-minute AV surprises on flagship events | ≥50% fewer “room not working” escalations within 1h of start (baseline TBD) |
| Increase confidence for onsite “huge moments” | NPS / pulse survey on event readiness (target ≥4/5) |
| Reuse AV Observe platform | ≥80% of Phase 1 logic uses existing modules (Slack, Zoom, Microsoft, config) |
| Meet teams where they work | Briefings delivered in **existing AV site Slack channels** |

## Non-goals (Phase 1)

- Booking hotels/Uber or issuing badges (Phase 3+; needs HR/travel APIs or event sheets)
- Replacing EAs, event teams, or Facilities ticketing
- Public LLM access to sensitive calendar bodies (start with rules + templates)
- Company-wide personal DMs for every employee (start with **site channels + event channels**)

---

## Personas

| Persona | Needs | Copilot value |
|---------|--------|----------------|
| **Onsite attendee** (remote-first IC) | “What’s my day? Where do I go? Will AV work?” | Morning briefing: meetings, rooms, AV status for rooms they use |
| **Presenter / host** | Agenda, room, clicker, backup link, pre-check | Event card + 24h / 1h reminders, AV pre-flight status |
| **AV / workplace tech** | Prevent fires, prioritize fixes | Same data as today + **event-aware** prioritization by calendar |
| **EA / event coordinator** | One place for run-of-show, comms, logistics | Checklist + draft Slack post (Phase 2); not full replacement |
| **Skip-level / leadership** | Proof AV serves the business on big days | Day effectiveness summary + trend in Splunk |

---

## User stories (MVP — Phase 1)

1. As an **IRV employee**, I open `#av-irv` and see **today’s flagship meetings** (All Hands, zRetreat, Board Room) with room names, times, and AV/Zoom status for those rooms.
2. As **AV ops**, I see which **today’s booked rooms** have offline Zoom devices or Q-SYS issues **before** the meeting starts.
3. As a **site lead**, I get the existing daily Zoom digest **plus** a short “Events today” section—not a second bot in a new channel.
4. As **leadership**, I can describe AV as moving from **monitoring** to **readiness for moments that matter**.

---

## MVP scope (Phase 1)

### In scope

- **Event-aware site briefing** posted to existing per-site AV Slack channels (see channel map below)
- **Microsoft Graph** room/resource calendar for filtered event types (`config.microsoft.filters`)
- **Zoom room health** cross-referenced by room name / site (existing `Zoom.dailyUpdate()` data)
- **Q-SYS / Domotz** summary unchanged; highlight systems tied to today’s event rooms where matchable
- **Schedule:** run with daily update (e.g. 8:00 local per site timezone in `config.siteTimezones`)
- **Test mode:** all site briefings → `testSiteAlert` channel

### Out of scope (later phases)

| Phase | Capability |
|-------|------------|
| 2 | Google Doc agenda link/embed; draft Slack announcement from template |
| 3 | Role-based checklists (presenter, EA, AV, facilities); reminders |
| 4 | Post-event “day score” (started on time, AV incidents, attendance proxy) |
| 5 | Logistics (hotel, Uber, badge, catering) via event sheet or integrations |

---

## AV Slack channel map (existing)

Configured in `shared/config.json` → `slack.channelIds`. Used today by `sendSiteSpecificAlerts()` in `av-daily-update`.

| Site code | Purpose | Config key | Channel ID |
|-----------|---------|------------|------------|
| **IRV** | Irvine AV site | `IRV` | `C05SUTC4D50` |
| **SEA** | Seattle AV site | `SEA` | `C02QZ6M3JTF` |
| **SFO** | San Francisco AV site | `SFO` | `C064BQYFL2F` |
| **NYC** | New York AV site | `NYC` | `C05U76M61A5` |
| **DEN** | Denver AV site | `DEN` | `C08FS39GCLR` |
| **KCY** | Kansas City AV site | `KCY` | `C0963N20WP3` |

**Global / special channels (not site-specific):**

| Key | Purpose | Channel ID |
|-----|---------|------------|
| `alert` | Main daily AV digest | `C07SY86AY31` |
| `testAlert` | Test main digest | `C08B281AYA2` |
| `testSiteAlert` | Test all site posts | `C09HL5L98KT` |
| `Olympic` | Olympic / exec board room alerts | `C04B26YDH27` |
| `live-alerts` | Real-time webhook alerts | `C09SURDPU6N` |

**Gap to track:** Zoom/sites may appear in data without a matching `slack.channelIds[site]` key—today those sites log `No channel configured for site` and skip posting. Phase 1 should add a config audit job or document owner for any new site.

**Site timezones** (for “today” boundaries): `SEA`, `SFO`, `IRV` → Pacific; `NYC` → Eastern; `DEN` → Mountain; `KCY` → Central.

---

## Success metrics (Phase 1)

| Metric | Target | How measured |
|--------|--------|----------------|
| Briefing delivery | 100% of configured sites on schedule days | CI / job logs + Slack API `ok` |
| Event–room match rate | ≥70% of filtered calendar events matched to a Zoom room | Splunk field `eventRoomMatch` |
| Actionable AV flags before event | ≥1 flagged issue with &gt;30 min lead time (pilot) | Manual pilot review 4 weeks |
| No regression on daily update | Zero increase in job failure rate | Existing daily-update monitoring |
| Channel engagement | Optional: Slack reactions / thread replies on pilot sites | Slack analytics |

---

## Dependencies & risks

| Item | Notes |
|------|--------|
| **Microsoft `getCalendarsBySite()`** | Documented in shared README but **not implemented** in `Microsoft.js` nor wired in `app.js`—Phase 1 engineering prerequisite |
| **Room calendar IDs** | Need mapping: M365 resource mailbox → site code → Zoom room name |
| **Privacy** | `hideMeetingDetails` already in config for sensitive rooms (e.g. Olympic Board Room)—respect in briefings |
| **Calendar vs AV truth** | Calendar can show booked while gear is offline—copilot must surface **both** |
| **False confidence** | Copy must say “AV status as of {time}” not “guaranteed ready” |

---

## Rollout

1. **Pilot:** SEA + IRV (largest AV footprint, channels exist)  
2. **Expand:** SFO, NYC, DEN, KCY  
3. **Comms:** Announce in each `#av-{site}` as “new Events today section” atop existing digest  
4. **Feedback:** 2-week office-hours in site channels  

---

## Executive summary (copy-paste)

We propose evolving AV Observe into an **Office Day Copilot**: proactive Slack briefings in our **existing six AV site channels**, combining room calendars, flagship event filters, and live Zoom/Q-SYS health. Phase 1 reuses our Slack bot, site channel config, and Zoom pipeline; we add Microsoft calendar orchestration and event-aware formatting. Later phases add Google Doc agendas, run-of-show checklists, and optional logistics. **Outcome:** remote-first employees get the same confidence on big in-office days that they have on a normal remote workday.

---

## Related docs

- [Phase 1 Technical Spec](./PHASE-1-SPEC.md) — implementation detail, Block Kit, module mapping
