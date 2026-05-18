# Workplace Assistant — product plan (draft)

**Codename:** Moment Ready / Workplace Brief  
**Status:** Beta (internal CI + public Vercel demo)  
**Owner:** AV / Workplace Experience (assign name)  
**Last updated:** 2026-05-18

---

## 1. Executive summary

**Problem:** Employees and event hosts scramble before important office days—finding rooms, decks, AV confidence, and wayfinder directions. AV Observe serves operators, not attendees.

**Solution:** A **Workplace Assistant** delivered primarily in **Slack**, with a **public demo site** (no secrets). It proactively briefs users on tier‑1 meetings: calendar context, **AV readiness** (from AV Observe), and **iOffice wayfinder** links to the space.

**Principle:** *No org credentials on public cloud.* Production runs on **GitLab CI** (same trust zone as AV Observe). Vercel is demo-only.

---

## 2. Goals & non-goals

### Goals (12 months)

| # | Goal | Measure |
|---|------|---------|
| G1 | Reduce “day-of” AV / room confusion for tier‑1 events | Fewer reactive tickets per flagged meeting |
| G2 | Proactive brief adopted by pilot cohort | 5+ DAU on morning brief (opens / reactions) |
| G3 | Reuse AV Observe as system of record for room health | 100% tier‑1 in-office events show AV status |
| G4 | IRV pilot → 2 additional sites | SEA + SFO space directories live |

### Non-goals (for now)

- Replacing EAs, travel booking, or badge systems end-to-end  
- Full natural-language copilot (“prep my whole week”)  
- Moving AV Observe daily-update or Q-SYS remediation to Vercel  
- Storing calendar data outside Microsoft / existing retention policies  

---

## 3. Users & personas

| Persona | Job to be done | Channel |
|---------|----------------|---------|
| **Employee** | “What matters today? Is my room ready? How do I get there?” | Slack DM or channel |
| **Event host** | “Is AV green before my customer demo?” | Slack + optional web status |
| **EA / coordinator** | “Don’t let us forget room, wayfinder, AV for exec block” | Slack; later checklist |
| **AV ops** | “Fewer surprise break/fix during tier‑1 meetings” | Splunk + existing alerts (unchanged) |
| **Leadership** | “Global story: office + remote moments feel seamless” | Vercel demo + quarterly metrics |

---

## 4. Product pillars (v1 → v3)

| Pillar | v1 (pilot) | v2 | v3 |
|--------|------------|----|----|
| **Brief** | Morning tier‑1 Slack digest | Per-meeting 60‑min reminder | Personalized by role / site |
| **Prepare** | Links from calendar (subject/location) | Agenda + Drive from description | Slack thread + deck aggregation |
| **Place** | iOffice wayfinder per room (IRV directory) | API sync for space IDs | Indoor routing from “you are here” |
| **Assure** | Zoom room health snapshot | Pull from AV Observe / Splunk cache | Live escalation to site Slack |

---

## 5. What exists today (beta)

| Component | Location | Maturity |
|-----------|----------|----------|
| Slack brief bot | `apps/av-workplace-brief` | Beta — tier‑1 filter, demo + live modes |
| AV Observe | `apps/av-daily-update` | Production — feeds AV signal |
| Demo website | `apps/workplace-brief-web` | Beta — Vercel, no secrets |
| GitLab CI | `.gitlab-ci.yml` | Beta — `workplace-brief-morning`, `av-daily-update` |
| IRV space directory | `data/spaceDirectory.json` | Template — needs real wayfinder URLs |
| Runbook | `docs/DEPLOYMENT.md` | Draft |

---

## 6. Phased roadmap

### Phase 0 — Align (2–3 weeks)

**Outcome:** Signed pilot charter.

- [ ] Name executive sponsor + AV product owner  
- [ ] Security: confirm Graph + Zoom + Slack from GitLab runners only  
- [ ] Pick pilot site: **IRV** (recommended)  
- [ ] Identify 5–10 pilot users (mix: host, EA, IC)  
- [ ] Fill IRV `spaceDirectory.json` with real iOffice URLs  
- [ ] Schedule GitLab `workplace-brief-morning` → test Slack channel  
- [ ] Merge beta branch; present Vercel demo URL to team  

**Exit criteria:** 5 consecutive workdays of morning briefs in test channel without P0 issues.

---

### Phase 1 — IRV pilot (4–6 weeks)

**Outcome:** Trusted tier‑1 brief in production test, then limited prod channel.

- [ ] `pilot.userEmails` populated; tier‑1 keywords tuned with ops feedback  
- [ ] Promote Slack from test → pilot channel (not company-wide)  
- [ ] “Report AV issue” button → site channel (reuse AV Observe routing)  
- [ ] Metrics: brief sent, events shown, wayfinder clicks (qualitative OK)  
- [ ] Weekly retro with pilot users (15 min)  

**Exit criteria:** ≥70% pilot users say brief is “useful” in quick survey; &lt;2 false-alarm AV reds per week.

---

### Phase 2 — Scale places (6–8 weeks)

**Outcome:** SEA + SFO space directories; same pipeline.

- [ ] Clone space directory pattern per site  
- [ ] Site-specific keyword tweaks (e.g. Olympic Board, All Hands rooms)  
- [ ] Optional: read cached AV health from Splunk instead of live Zoom per brief  
- [ ] Internal static page (GitLab Pages) mirroring Vercel demo if desired  

**Exit criteria:** 3 sites live; brief job runtime &lt;2 min on CI.

---

### Phase 3 — Moments & remote (8–12 weeks)

**Outcome:** “Huge moment” playbooks, not just daily brief.

- [ ] Town hall / All Hands template (pre + during + post links)  
- [ ] Hybrid events: in-room wayfinder + Zoom join in one block  
- [ ] EA checklist blocks (badge, lunch, Uber) as **static templates** first  
- [ ] Evaluate slash command on **internal** API only (`/workplace-brief`)  

**Exit criteria:** 1 company-wide event supported end-to-end with playbook doc + automated brief.

---

## 7. Architecture (decision record)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Secrets | GitLab CI variables only | Org policy: no keys on public cloud |
| Public web | Vercel, demo data only | Global pitch URL, zero compliance risk |
| AV data | AV Observe + Zoom API | Existing integrations; avoid duplicate collectors |
| Filter | Tier‑1 keywords default on | Prevent alert fatigue |
| Calendar | Microsoft Graph | Already in shared modules |
| Maps | iOffice wayfinder deep links | No API required for v1 |

---

## 8. Success metrics

| Metric | Baseline | Phase 1 target |
|--------|----------|----------------|
| Tier‑1 meetings with AV status in brief | 0 | 100% in pilot |
| Reactive AV tickets during pilot events | TBD | −25% vs 4-week prior |
| Pilot weekly active (opened Slack brief) | 0 | ≥80% of cohort |
| Time to find room (self-reported) | TBD | “Faster” majority in survey |
| CI job success rate | — | ≥99% |

---

## 9. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Brief noise → users mute | Tier‑1 only; expand slowly |
| Wrong room / wayfinder link | Space directory owned by site champion; quarterly audit |
| Graph permission delays | Start with named mailboxes; document admin consent |
| Duplication with EAs | Position as “safety net,” not replacement |
| AV false positives | Show “Check AV” not “Broken”; link to AV Observe context |

---

## 10. Team & asks

| Ask | From |
|-----|------|
| Pilot user list (5–10) | Site lead / HR partner |
| iOffice wayfinder URLs for IRV top rooms | Facilities / workplace |
| Graph app consent for calendar read | Identity / Azure admin |
| GitLab schedule on protected branch | DevOps |
| 15 min biweekly steering | Skip-level sponsor |

**Core build:** 1 engineer (AV Observe familiarity) + 0.25 PM/coordinator for pilot feedback.

---

## 11. Immediate next actions (this week)

1. **Socialize this plan** with skip-level (15 min).  
2. **Merge PR #5** (or current beta branch) to `main`.  
3. **Deploy Vercel demo** → share URL in plan deck.  
4. **Add 3 pilot emails** to `config.json`; run `workplace-brief-morning` manually in GitLab.  
5. **Replace 5 wayfinder placeholders** in `spaceDirectory.json` (real IRV links).  
6. **Book week-2 retro** with pilot users.

---

## 12. Appendix

- [DEPLOYMENT.md](./DEPLOYMENT.md) — technical runbook  
- [apps/av-workplace-brief/README.md](../apps/av-workplace-brief/README.md) — bot beta  
- [apps/workplace-brief-web/README.md](../apps/workplace-brief-web/README.md) — Vercel demo  

---

*Draft for discussion — update owners, dates, and metrics after pilot kickoff.*
