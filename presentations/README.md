# AV Team — Mac Findings Presentation

An interactive JSX-based presentation summarizing the recurring Mac / macOS / Zoom Rooms / login-credential issues raised in the `#av-team` Slack channel between **Dec 2024 and May 2026**, and their impact on the team's productivity.

The deck is intentionally built so you have two delivery options without any build tooling required.

## Files

| File | What it is | When to use it |
| --- | --- | --- |
| `av-team-mac-findings.html` | Self-contained single-file deck (React + Babel-standalone + Tailwind, all from CDN). | **Recommended for presenting.** Just open it in any modern browser. |
| `AvTeamMacFindings.jsx` | The same deck as a clean, importable React component. | When you want to drop it into an existing React app (Vite, Next.js, CRA, etc.). |

## Running the standalone HTML deck

No build step. No `npm install`. From this folder:

```bash
# any one of these works
open av-team-mac-findings.html
# or
python3 -m http.server 8080
# then visit http://localhost:8080/av-team-mac-findings.html
```

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `→` / `Space` / `PageDown` | Next slide |
| `←` / `PageUp` | Previous slide |
| `Home` / `End` | Jump to first / last slide |
| `F` | Toggle fullscreen |

You can also click the cards on the **Overview** slide to jump directly to any issue.

## Using the React component

Copy `AvTeamMacFindings.jsx` into your project (anywhere under `src/`). It requires:

- React 18+
- Tailwind CSS configured in your app (or replace the utility classes with your own CSS)

```jsx
import AvTeamMacFindings from "./AvTeamMacFindings.jsx";

export default function App() {
  return <AvTeamMacFindings />;
}
```

The component fills its parent — give it a full-viewport container if you want the proper slide feel.

## Deck structure

1. **Title**
2. **At a glance** — severity counts + clickable cards for every issue
3. **9 × issue slides** — each with summary, productivity impact, dated evidence, and workaround
4. **Timeline** — issues ordered by first-seen date
5. **Themes** — five recurring patterns across all incidents
6. **Open question** — Mac vs. Windows NUC vs. Android-appliance trade-offs

## Editing content

All slide content lives in two arrays near the top of each file:

- `ISSUES` — one entry per issue (title, severity, dates, summary, impact, evidence, workaround)
- `THEMES` — short cards for the Themes slide

Add or remove items in those arrays and the deck (counts, overview cards, timeline, etc.) updates automatically.
