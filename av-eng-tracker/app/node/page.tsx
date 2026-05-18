import Link from "next/link";

interface Benefit {
  num: number;
  title: string;
  why: string;
  example?: { label: string; code: string };
  withoutIt?: string;
}

const BENEFITS: Benefit[] = [
  {
    num: 1,
    title: "Read + modify Patrick's Lambdas",
    why: "Patrick's monitoring Lambdas (q-sys-slack-updater, q-sys_webhooks, av-devices-updater) are almost certainly written in Node.js. That's the most common AWS Lambda runtime AND matches Patrick's 'wrote it in 20 minutes with AI' pattern — Cursor + Node + Lambda is the fastest dev loop.",
    withoutIt:
      "Cursor autocomplete won't work on Patrick's code. You can't run `npm install` to pull dependencies. You can't test locally. Error stack traces are unreadable. You're inheriting his code blind.",
  },
  {
    num: 2,
    title: "Run this AV tracker site locally (for changes)",
    why: "The site you're looking at right now is a Next.js app — Next is built on Node. If you ever want to add a new finding to lib/data.ts, update the QW# list, modify the 1:1 cheat sheet content, or test a change before pushing to Vercel — you need Node.",
    example: {
      label: "Clone + run this site locally",
      code: `git clone https://github.com/v-cortneye-pixel/av-abserve
cd av-abserve/av-eng-tracker
npm install
npm run dev
# → opens at http://localhost:3000`,
    },
    withoutIt:
      "You can only push blind commits to GitHub and hope Vercel's build doesn't break.",
  },
  {
    num: 3,
    title: "Test Lambda code BEFORE deploying to AWS",
    why: "The most valuable workflow: invoke a Lambda locally with a mock event payload, see exactly what it would produce, verify your re-keying change works — all without touching production. Patrick definitely did this.",
    example: {
      label: "Local Lambda test loop",
      code: `cd q-sys-slack-updater
npm install
# Drop a test event JSON file
node -e "
  const handler = require('./index').handler;
  handler(require('./test-event.json'), {})
    .then(r => console.log('OK', r))
    .catch(e => console.error('FAIL', e));
"`,
    },
    withoutIt:
      "You're deploying changes to live monitoring Lambdas with no local verification. Every push is a roll of the dice.",
  },
  {
    num: 4,
    title: "AI tooling that assumes Node + npm",
    why: "The modern AI dev tooling ecosystem is heavily Node-based. Claude Code CLI, OpenAI CLI, the Anthropic SDK, many Cursor extensions — all installed via npm. If you want to script things like 'summarize Patrick's last 50 Lambda errors' or 'auto-generate runbooks from code,' these tools assume Node.",
    example: {
      label: "Install Claude Code CLI globally",
      code: `npm install -g @anthropic-ai/claude-code

# Then use it to read + summarize a Lambda
cd q-sys-slack-updater
claude code "explain what this Lambda does and what could break it"`,
    },
    withoutIt:
      "You're cut off from the AI tools that would otherwise let you go faster than Patrick did with just Cursor alone.",
  },
  {
    num: 5,
    title: "Quick scripting against Zoom / Slack / Q-Sys APIs",
    why: "Single-purpose scripts you'll write over the next 90 days — each one is 20-40 lines of Node + axios.",
    example: {
      label: "Pull every Zoom Room with a specific firmware version",
      code: `// pull-firmware-stragglers.js
const axios = require('axios');

const token = process.env.ZOOM_TOKEN;
const targetVersion = '6.6.10';

axios.get('https://api.zoom.us/v2/rooms', {
  headers: { Authorization: \`Bearer \${token}\` }
}).then(r => {
  const stragglers = r.data.rooms.filter(
    room => room.firmware_version === targetVersion
  );
  console.table(stragglers);
});`,
    },
    withoutIt:
      "Every one-off question becomes a manual click-fest in the Zoom Admin UI. The 'easy lift' iPad-battery webhook Matt asked for never ships.",
  },
  {
    num: 6,
    title: "AWS Lambda dev tooling (Serverless / SAM / CDK)",
    why: "The three most common ways to deploy Lambdas — Serverless Framework, AWS SAM, AWS CDK — are all Node-based. Even if you stay on the AWS console UI for now, the moment you want to do anything Infrastructure-as-Code (clean deployment, version-controlled Lambda configs, automated rollback), you need Node.",
    example: {
      label: "Deploy a Lambda update via Serverless Framework",
      code: `npm install -g serverless

# In a Lambda repo with a serverless.yml file:
serverless deploy --stage prod

# Or just one function:
serverless deploy function -f q-sys-webhook-handler`,
    },
    withoutIt:
      "You're stuck deploying Lambda changes by hand through the AWS Console — copy-paste code, click 'Deploy.' That's how Patrick's pipeline ended up running under his personal identity in the first place.",
  },
];

const SKIP_IT_IF = [
  "Your role stays strictly hands-on AV — Q-Sys files, room walks, vendor coordination, no monitoring or Lambda work",
  "You'll never need to read Patrick's Lambda code",
  "You're not planning to modify the AV tracker site",
  "You don't intend to script anything against Zoom / Slack / Q-Sys APIs",
];

const INSTALL_IT_IF = [
  "You're inheriting Patrick's monitoring pipeline (which IS your P0 work)",
  "You'll edit the AV tracker site (your operational-excellence artifact for Stacey)",
  "You're going to touch ANY Lambda — even just to read it",
  "You want Cursor's autocomplete to work on Patrick's code",
  "You're planning to use AI dev tooling beyond just Cursor",
];

export default function NodePage() {
  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Why this tool matters</p>
        <h1 className="z-h1 mt-2">Node.js — the language Patrick&apos;s stack is written in</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          You inherited the Splunk + Lambda pipeline. <strong>Node.js is the language that
          pipeline is most likely written in.</strong> Installing it isn&apos;t about
          following a setup checklist — it&apos;s the difference between &ldquo;I can read
          Patrick&apos;s code&rdquo; and &ldquo;I can actually understand what it does and
          fix it.&rdquo;
        </p>
      </header>

      {/* Headline framing */}
      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">The bottom line</div>
        <p className="mt-2 text-base font-semibold text-zillow-ink">
          Without Node, half of Patrick&apos;s stack is unreadable to you.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zillow-ink">
          Cursor&apos;s autocomplete on a Lambda repo without Node installed = 401-style
          errors on every import. npm-distributed AI dev tools = blocked. Local Lambda
          testing = impossible. The AV tracker site = read-only.
        </p>
      </section>

      {/* The 6 benefits */}
      <section>
        <h2 className="z-h2 mb-1">The 6 things Node.js unlocks for you</h2>
        <p className="mb-6 max-w-3xl text-sm text-zillow-slate">
          Each one is AV-engineer-specific, not generic developer-tooling. Most have a
          concrete code example showing the workflow it enables.
        </p>
        <div className="space-y-4">
          {BENEFITS.map((b) => (
            <article key={b.num} className="z-card">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zillow-blue text-base font-bold text-white">
                  {b.num}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-zillow-ink">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zillow-ink">{b.why}</p>

                  {b.example && (
                    <div className="mt-4 overflow-hidden rounded-lg border border-zillow-gray-border">
                      <div className="border-b border-zillow-gray-border bg-zillow-gray-light px-3 py-1.5">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-zillow-slate">
                          {b.example.label}
                        </span>
                      </div>
                      <pre className="overflow-x-auto bg-zillow-ink p-4 text-xs leading-relaxed text-gray-100">
                        <code>{b.example.code}</code>
                      </pre>
                    </div>
                  )}

                  {b.withoutIt && (
                    <div className="mt-3 rounded-md border-l-4 border-zillow-red bg-red-50 px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                      <span className="font-semibold text-zillow-red">Without it: </span>
                      {b.withoutIt}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* When to skip vs install */}
      <section>
        <h2 className="z-h2 mb-4">When you need it vs. when you can skip it</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="z-card border-l-4 border-emerald-500">
            <h3 className="z-h3 text-emerald-700">✅ Install it if…</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink">
              {INSTALL_IT_IF.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-zillow-slate italic">
              Spoiler: your actual role checks every box on this list. Install it.
            </p>
          </article>
          <article className="z-card border-l-4 border-zillow-gray-border">
            <h3 className="z-h3 text-zillow-slate">⏭️ Skip it if…</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink">
              {SKIP_IT_IF.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-zillow-slate italic">
              If you&apos;re a pure-floor AV tech with no monitoring or scripting role, you
              don&apos;t need it. But that&apos;s not the role Stacey scoped.
            </p>
          </article>
        </div>
      </section>

      {/* Install command */}
      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">Install command</div>
        <h2 className="z-h3 mt-2">1-minute install on your Windows laptop</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-zillow-ink p-4 text-xs leading-relaxed text-gray-100">
          <code>{`# In PowerShell as admin (or your normal shell if winget works for you)
winget install --id OpenJS.NodeJS.LTS -e

# Verify
node --version
# v22.x.x or higher

npm --version
# 10.x.x or higher`}</code>
        </pre>
        <p className="mt-3 text-xs leading-relaxed text-zillow-slate">
          Full Windows setup walkthrough including Node:{" "}
          <a
            href="https://av-windows-setup.vercel.app/#node"
            target="_blank"
            rel="noopener noreferrer"
            className="z-link"
          >
            Windows setup site → Step 9 ↗
          </a>
        </p>
      </section>

      {/* When to use what */}
      <section>
        <h2 className="z-h2 mb-4">First three places you&apos;ll actually use it</h2>
        <ol className="space-y-3 text-sm leading-relaxed text-zillow-ink">
          <li className="z-card">
            <span className="font-semibold text-zillow-blue">
              1. After you clone q-sys-slack-updater (the bot Lambda):
            </span>{" "}
            run <code className="rounded bg-zillow-gray-light px-1.5 py-0.5 font-mono text-xs">npm install</code>{" "}
            in the repo folder. Cursor now has full intellisense on the Lambda code. You can
            read the re-poll pattern, the Reflect API calls, the Slack webhook destinations
            — all with proper code navigation.
          </li>
          <li className="z-card">
            <span className="font-semibold text-zillow-blue">
              2. When you write your first AV automation script:
            </span>{" "}
            it&apos;ll be a short Node file invoking the Zoom API. Patrick wrote a few of
            these (the daily updater, the AV devices updater). You&apos;ll write more — the
            iPad-battery webhook Matt asked for is the obvious first one.
          </li>
          <li className="z-card">
            <span className="font-semibold text-zillow-blue">
              3. When you want to modify this AV tracker site:
            </span>{" "}
            clone the GitHub repo,{" "}
            <code className="rounded bg-zillow-gray-light px-1.5 py-0.5 font-mono text-xs">npm install</code>,{" "}
            <code className="rounded bg-zillow-gray-light px-1.5 py-0.5 font-mono text-xs">npm run dev</code>.
            Live-reload at <code className="rounded bg-zillow-gray-light px-1.5 py-0.5 font-mono text-xs">localhost:3000</code>.
            Edit any data file, see changes instantly. When you&apos;re happy, push to
            GitHub and Vercel auto-deploys.
          </li>
        </ol>
      </section>

      <section className="text-xs text-zillow-slate border-t border-zillow-gray-border pt-4">
        Related:{" "}
        <Link href="/glossary" className="z-link">
          Glossary (terms)
        </Link>{" "}
        ·{" "}
        <Link href="/splunk" className="z-link">
          Splunk runbook
        </Link>{" "}
        ·{" "}
        <Link href="/patrick-audit" className="z-link">
          Patrick stack inventory
        </Link>{" "}
        ·{" "}
        <a
          href="https://av-windows-setup.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="z-link"
        >
          🖥️ Windows setup site ↗
        </a>
      </section>
    </div>
  );
}
