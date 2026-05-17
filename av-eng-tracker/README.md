# AV Engineering Tracker

A Next.js reference site for Cortney's first 90 days at Zillow as Patrick's replacement on the AV team.

Built in Zillow's visual style (primary blue `#006AFF`, clean cards, system sans-serif), this site organizes:

- **Recurring issues catalog** — every issue tracked in `#av-team` over ~20 months, sorted by severity
- **Per-issue detail pages** — full Slack quotes with attribution and timestamps
- **Mac Mini deep dive** — fleet host platform architectural review
- **HDMI options** — six paths to evaluate before signing the Q-Sys NV PO
- **Patrick handoff** — keys, access, and process context to claim
- **90-day plan** — 30/60/90 phased execution
- **Quick wins** — low-effort high-visibility starter set

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS with custom Zillow color tokens
- All data inline in `lib/data.ts` (no backend, no API calls)

## Running locally

```bash
cd av-eng-tracker
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Build for production

```bash
npm run build
npm run start
```

## Project structure

```
av-eng-tracker/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── issues/
│   │   ├── page.tsx          # All issues
│   │   └── [id]/page.tsx     # Issue detail
│   ├── mac-mini/page.tsx     # Mac Mini architectural review
│   ├── hdmi/page.tsx         # HDMI options
│   ├── handoff/page.tsx      # Patrick handoff checklist
│   ├── plan/page.tsx         # 90-day plan
│   ├── quick-wins/page.tsx   # Quick wins table
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Nav.tsx
│   ├── SeverityBadge.tsx
│   ├── StatusPill.tsx
│   └── QuoteCard.tsx
└── lib/
    └── data.ts               # All issues, quotes, plan, handoff
```

## Updating content

All content lives in `lib/data.ts`. Add new issues to the `ISSUES` array. Each issue auto-renders on the dashboard, the issues index, and gets a detail page at `/issues/[id]`.

## Print-friendly

`@media print` styles strip navigation and apply white backgrounds for clean printing of any page.
