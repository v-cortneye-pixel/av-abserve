import CodeBlock from "@/components/CodeBlock";

const STEPS = [
  { id: "vpn", label: "1. VPN" },
  { id: "powershell", label: "2. PowerShell + Terminal" },
  { id: "git", label: "3. Git" },
  { id: "glab", label: "4. glab (GitLab CLI)" },
  { id: "auth", label: "5. Authenticate to GitLab" },
  { id: "aws", label: "6. AWS CLI" },
  { id: "qsys", label: "7. Q-Sys Designer" },
  { id: "cursor", label: "8. Cursor (AI editor)" },
  { id: "node", label: "9. Node.js" },
  { id: "inventory", label: "10. Run AV inventory" },
  { id: "bookmarks", label: "11. Browser bookmarks" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-border bg-white">
        <div className="container-main py-8">
          <p className="eyebrow">For Cortney's new Windows laptop</p>
          <h1 className="h1 mt-2">AV Engineer Windows Setup</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate">
            One-session setup. Top to bottom. Each step has copy-paste commands you can run
            in PowerShell. Estimated time: <strong>90-120 minutes</strong> if everything
            installs cleanly, plus 15-30 min for vendor portals and SSO.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <a
              href="https://av-eng-tracker.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-blue-light px-3 py-1.5 font-medium text-blue hover:bg-blue hover:text-white"
            >
              ← Back to AV Tracker site
            </a>
            <a
              href="https://av-eng-tracker.vercel.app/todo"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-blue-light px-3 py-1.5 font-medium text-blue hover:bg-blue hover:text-white"
            >
              Splunk inheritance to-do
            </a>
          </div>
        </div>
      </header>

      <div className="container-main py-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        {/* Sticky nav */}
        <nav className="hidden lg:block">
          <div className="sticky top-6 card">
            <div className="eyebrow mb-3">Setup checklist</div>
            <ol className="space-y-1 text-sm">
              {STEPS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded px-2 py-1 text-slate hover:bg-gray-light hover:text-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Main content */}
        <main className="space-y-10">
          {/* Critical first — prerequisites */}
          <section className="card border-l-4 border-red bg-red/5">
            <div className="eyebrow text-red">Before you start</div>
            <h2 className="h3 mt-2">Prerequisites — get these in your hands first</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink">
              <li className="flex gap-2">
                <span>✓</span>
                <span>
                  <strong>Zillow corporate laptop</strong> — Windows 11, on the Zillow domain.
                  Should be enrolled in Zillow IT&apos;s Intune / SCCM management.
                </span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>
                  <strong>Okta SSO active</strong> — your zillowgroup.com login works in a
                  browser. Test by going to{" "}
                  <a
                    href="https://zillowgroup.okta.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue underline"
                  >
                    zillowgroup.okta.com
                  </a>
                  .
                </span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>
                  <strong>VPN credentials</strong> — Zillow uses Cisco AnyConnect (or Zillow&apos;s
                  current standard, likely Zscaler ZIA). Confirm with Mark or Zillow IT which
                  client you should be using.
                </span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>
                  <strong>Admin rights or IT-approved installer pattern</strong> — winget /
                  Company Portal / Software Center. Find out which one your Windows laptop uses.
                </span>
              </li>
            </ul>
          </section>

          {/* Step 1 — VPN */}
          <section id="vpn" className="card scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="step-num">1</span>
              <h2 className="h2">Install + connect to Zillow VPN</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Nothing internal works without VPN. <code className="rounded bg-gray-light px-1.5 py-0.5 text-xs">gitlab.zgtools.net</code>,{" "}
              <code className="rounded bg-gray-light px-1.5 py-0.5 text-xs">zodiac.zgtools.net</code>,
              and the AWS console all require it.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <div className="eyebrow">If Zillow uses Cisco AnyConnect</div>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink">
                  <li>
                    Open <strong>Company Portal</strong> (Start menu → search) → install
                    &ldquo;Cisco AnyConnect Secure Mobility Client.&rdquo;
                  </li>
                  <li>
                    Launch AnyConnect → enter the VPN server hostname (ask Mark or check the
                    Zillow IT wiki). Common pattern: <code>vpn.zillowgroup.com</code> or{" "}
                    <code>vpn.zg.com</code>.
                  </li>
                  <li>Login with your Okta SSO credentials + Duo / Okta Verify push.</li>
                </ol>
              </div>
              <div>
                <div className="eyebrow">If Zillow uses Zscaler (ZIA / ZPA)</div>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink">
                  <li>
                    Already installed on managed laptops — look in the system tray for a
                    Zscaler icon.
                  </li>
                  <li>Right-click → &ldquo;Login&rdquo; → Okta SSO flow.</li>
                  <li>Wait for the icon to show &ldquo;Connected.&rdquo;</li>
                </ol>
              </div>
              <div className="rounded-md bg-blue-light p-3 text-xs leading-relaxed text-ink">
                <strong className="text-blue">Test that VPN works:</strong> open{" "}
                <a
                  href="https://gitlab.zgtools.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue underline"
                >
                  gitlab.zgtools.net
                </a>{" "}
                in your browser. You should see the Zillow GitLab login page (or auto-SSO
                in). If you see &ldquo;site can&apos;t be reached&rdquo; → VPN isn&apos;t
                connected.
              </div>
            </div>
          </section>

          {/* Step 2 — PowerShell + Terminal */}
          <section id="powershell" className="card scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="step-num">2</span>
              <h2 className="h2">Modern PowerShell + Windows Terminal</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Windows 10/11 ships with PowerShell 5.1, but PowerShell 7 (pwsh) is what you
              want — better cross-platform support, faster, and the version most modern docs
              assume. Windows Terminal gives you tabs + a better-looking shell.
            </p>
            <CodeBlock
              label="Install PowerShell 7 + Windows Terminal via winget"
              code={`winget install --id Microsoft.PowerShell -e
winget install --id Microsoft.WindowsTerminal -e`}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate">
              After installing: open <strong>Windows Terminal</strong> from the Start menu.
              Click the dropdown next to the new-tab button → Settings → set the default
              profile to &ldquo;PowerShell&rdquo; (the 7.x one, NOT &ldquo;Windows
              PowerShell&rdquo; — that&apos;s 5.1).
            </p>
            <div className="mt-3 rounded-md bg-blue-light p-3 text-xs leading-relaxed">
              <strong className="text-blue">Verify:</strong> open a new tab in Terminal, run{" "}
              <code className="rounded bg-white px-1 py-0.5">$PSVersionTable</code>. The
              PSVersion should be 7.x.
            </div>
          </section>

          {/* Step 3 — Git */}
          <section id="git" className="card scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="step-num">3</span>
              <h2 className="h2">Git for Windows</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              You need <code className="rounded bg-gray-light px-1.5 py-0.5 text-xs">git</code>{" "}
              for cloning, committing, and the daily Q-Sys file flow.
            </p>
            <CodeBlock
              label="Install Git for Windows"
              code={`winget install --id Git.Git -e --source winget`}
            />
            <p className="mt-3 text-sm leading-relaxed text-slate">
              After install, configure your identity:
            </p>
            <CodeBlock
              label="Configure git with your Zillow identity"
              code={`git config --global user.name "Cortney Eison"
git config --global user.email "cortneye@zillowgroup.com"
git config --global init.defaultBranch main
git config --global pull.rebase false`}
            />
          </section>

          {/* Step 4 — glab */}
          <section id="glab" className="card scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="step-num">4</span>
              <h2 className="h2">glab — the GitLab CLI</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              This is the tool that lets you inventory + clone all of Patrick&apos;s AV repos
              from one PowerShell window. Three install paths — try in order:
            </p>
            <CodeBlock
              label="Option A — winget (preferred)"
              code={`winget install --id GitLab.GitLabCLI -e`}
            />
            <p className="mt-2 text-xs text-slate">
              If winget can&apos;t find the package or Zillow IT blocks it, fall back:
            </p>
            <CodeBlock
              label="Option B — Scoop"
              code={`# First install scoop if you don't have it
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Then install glab
scoop install glab`}
            />
            <CodeBlock
              label="Option C — Chocolatey"
              code={`choco install glab -y`}
            />
            <CodeBlock
              label="Verify install"
              code={`glab --version`}
            />
          </section>

          {/* Step 5 — Authenticate */}
          <section id="auth" className="card scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="step-num">5</span>
              <h2 className="h2">Authenticate glab against Zillow GitLab</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Make sure your VPN is connected (Step 1) before this step.
            </p>
            <CodeBlock
              label="Login with browser SSO"
              code={`glab auth login --hostname gitlab.zgtools.net`}
            />
            <p className="mt-3 text-sm leading-relaxed text-ink">
              Prompts you&apos;ll see:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
              <li>
                <strong>Hostname:</strong> <code>gitlab.zgtools.net</code>
              </li>
              <li>
                <strong>API protocol:</strong> HTTPS
              </li>
              <li>
                <strong>Authentication method:</strong> choose <em>&ldquo;Web&rdquo;</em> — it
                opens a browser tab where you SSO via Okta
              </li>
              <li>
                <strong>Default git protocol:</strong> HTTPS (unless your team standardized on
                SSH)
              </li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              If the browser auth doesn&apos;t work, fall back to a Personal Access Token:
            </p>
            <CodeBlock
              label="Generate a PAT at this URL"
              code={`https://gitlab.zgtools.net/-/user_settings/personal_access_tokens`}
            />
            <p className="mt-2 text-xs leading-relaxed text-slate">
              Scopes to grant: <code>read_api</code>, <code>read_repository</code>,{" "}
              <code>write_repository</code>. Set expiration to 90 days. Save the token to{" "}
              <strong>AWS Secrets Manager</strong> once you have AWS access (Step 6) — never
              keep it in a notepad. That&apos;s the same blast-radius pattern that broke when
              Patrick was deactivated.
            </p>
            <CodeBlock
              label="Login with PAT instead"
              code={`glab auth login --hostname gitlab.zgtools.net --token "glpat-xxxxxxxxxxxxxxxxxxxx"

# Verify
glab auth status`}
            />
          </section>

          {/* Step 6 — AWS CLI */}
          <section id="aws" className="card scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="step-num">6</span>
              <h2 className="h2">AWS CLI v2</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              You&apos;ll need this for the actual Lambda re-keying work — listing functions,
              reading IAM roles, updating execution roles, reading CloudWatch logs.
            </p>
            <CodeBlock
              label="Install AWS CLI v2"
              code={`winget install --id Amazon.AWSCLI -e`}
            />
            <CodeBlock
              label="Verify + configure SSO (Zillow uses AWS SSO)"
              code={`aws --version

# Configure SSO profile — Zillow standard
aws configure sso

# Prompts:
# SSO start URL: https://zillowgroup.awsapps.com/start (confirm with Mark)
# SSO region: us-west-2 (usually)
# CLI default region: us-west-2
# CLI default output format: json
# Profile name: zg-av (or zg-cortney)`}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate">
              Once configured, run{" "}
              <code className="rounded bg-gray-light px-1 py-0.5">
                aws sso login --profile zg-av
              </code>{" "}
              to start a session.
            </p>
            <div className="mt-3 rounded-md bg-amber/10 p-3 text-xs leading-relaxed text-ink">
              <strong className="text-orange">If AWS access isn&apos;t granted yet:</strong>{" "}
              file a ServiceNow request for AV-team AWS access (specifically: the account
              where Patrick&apos;s Lambdas run). Stacey may be able to add you via the AV
              Zodiac team (same pattern as Splunk).
            </div>
          </section>

          {/* Step 7 — Q-Sys Designer */}
          <section id="qsys" className="card scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="step-num">7</span>
              <h2 className="h2">Q-Sys Designer Software</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              This is the QSC programming environment for all .qsys files (UCI visual builder,
              Lua scripts, plugin host, push-to-Core deployment). <strong>Windows only</strong>
              — which is exactly why your Windows laptop is strategically important to the
              team. Currently Matt + Mark share a single AWS VM for this; you having a local
              install removes that bottleneck.
            </p>
            <CodeBlock
              label="Download from QSC directly"
              code={`# QSC requires a free account (qsys.com login)
https://www.qsys.com/products-solutions/q-sys/software/q-sys-designer-software/

# Latest version (as of 2026): Q-SYS Designer 10.2.x
# Pick 'Standard' installer for Windows`}
            />
            <p className="mt-3 text-sm leading-relaxed text-ink">After install:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink">
              <li>
                Log into Q-SYS Designer with your QSC account (or create one if you
                don&apos;t have it — free).
              </li>
              <li>
                Ask Matt or Mark to share the Q-Sys plugin source folder location and any
                team-shared certificate / signing key.
              </li>
              <li>
                Set the default project folder to <code>C:\dev\av-inheritance\qsys-dev</code>{" "}
                (or wherever you clone the Q-Sys repos in Step 10).
              </li>
              <li>
                Open the SEA-3647 .qsys file once you&apos;ve cloned the qsys-dev repos —
                that&apos;s the single-page UCI proof point Patrick built.
              </li>
            </ol>
            <div className="mt-3 rounded-md bg-blue-light p-3 text-xs leading-relaxed">
              <strong className="text-blue">Why this matters:</strong> Patrick had to share a
              ~$250/mo AWS Windows VM with Matt because both needed Q-Sys Designer
              concurrently. Your local Windows install bypasses that constraint AND positions
              you as the team&apos;s only currently-Windows-equipped engineer for testing
              Q-Sys Connect for Zoom Rooms (Windows-only product).
            </div>
          </section>

          {/* Step 8 — Cursor */}
          <section id="cursor" className="card scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="step-num">8</span>
              <h2 className="h2">Cursor — Patrick&apos;s AI editor</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Patrick used Cursor extensively for writing Lua, AppleScript, and Lambda code.
              His &ldquo;wrote it in 20 minutes with AI&rdquo; comment came from this tool.
              Cursor is the editor; Claude is one of the underlying AI models it can use.
            </p>
            <CodeBlock
              label="Install Cursor"
              code={`winget install --id Anysphere.Cursor -e

# Or download directly: https://cursor.com`}
            />
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Sign in with your Zillow Google or GitHub account (Mark uses the Zillow
              enterprise tier if available; otherwise free tier is fine for individual use).
            </p>
          </section>

          {/* Step 9 — Node.js (for the tracker site) */}
          <section id="node" className="card scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="step-num">9</span>
              <h2 className="h2">Node.js (for running the AV tracker site locally)</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Only needed if you want to clone + run the AV tracker site
              (av-eng-tracker.vercel.app) locally to make changes. Skip if you&apos;re only
              consuming the live site.
            </p>
            <CodeBlock
              label="Install Node 22 LTS"
              code={`winget install --id OpenJS.NodeJS.LTS -e

# Verify
node --version
npm --version`}
            />
          </section>

          {/* Step 10 — Run AV inventory */}
          <section id="inventory" className="card scroll-mt-6 border-l-4 border-blue bg-blue-light/30">
            <div className="flex items-center gap-3">
              <span className="step-num">10</span>
              <h2 className="h2">Run the AV GitLab inventory</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              This is the actual deliverable for the Splunk inheritance work. With glab
              authenticated (Step 5), run this script. It creates a Desktop folder with three
              files you can paste back to me for analysis.
            </p>
            <CodeBlock
              label="Save as av-gitlab-inventory.ps1 — run from PowerShell"
              code={"# Create working folder + cd into it\n$dev = \"$env:USERPROFILE\\Desktop\\av-inheritance\"\nNew-Item -ItemType Directory -Path $dev -Force | Out-Null\nSet-Location $dev\n\n# 1. List ALL repos in the AV group (and sub-groups)\nglab api \"groups/core-tech%2Funified-communications%2Fav/projects?include_subgroups=true&per_page=100&order_by=last_activity_at\" `\n    > av-all-repos.json\n\n# 2. List Patrick's last 200 pushed commits across all repos\nglab api \"users/patrick.gilligan/events?action=pushed&per_page=200\" `\n    > patrick-activity.json\n\n# 3. Human-readable summary table\nGet-Content av-all-repos.json | ConvertFrom-Json `\n    | Select-Object name, path_with_namespace, last_activity_at, default_branch, web_url `\n    | Format-Table -AutoSize `\n    | Out-File -Encoding utf8 av-repos-summary.txt\n\n# 4. Open the folder so you can grab the files\nInvoke-Item $dev\n\nWrite-Host \"\"\nWrite-Host \"Done. Three files in $dev :\" -ForegroundColor Green\nWrite-Host \"  - av-all-repos.json (full metadata)\"\nWrite-Host \"  - patrick-activity.json (last 200 pushes)\"\nWrite-Host \"  - av-repos-summary.txt (readable table)\""}
            />
            <p className="mt-3 text-sm leading-relaxed text-ink">
              Paste <strong>av-repos-summary.txt</strong> contents back to me in chat and
              I&apos;ll triage which repos are the active monitoring stack vs. dead code, and
              build the clone-order list for the Splunk re-key work.
            </p>
            <CodeBlock
              label="Bonus — clone the four known AV repos"
              code={`# After running the inventory above
Set-Location "$env:USERPROFILE\\Desktop\\av-inheritance"

glab repo clone core-tech/unified-communications/av/av-ops-tools/av-devices-updater
glab repo clone core-tech/unified-communications/av/av-ops-tools/q-sys-slack-updater
glab repo clone core-tech/unified-communications/av/av-ops-tools/q-sys_webhooks
glab repo clone core-tech/unified-communications/av/qsys-dev/ric-36-qsc-sandbox

Write-Host "4 repos cloned. Open each in Cursor:" -ForegroundColor Green
Write-Host "  cursor av-devices-updater"
Write-Host "  cursor q-sys-slack-updater"
Write-Host "  cursor q-sys_webhooks"
Write-Host "  cursor ric-36-qsc-sandbox"`}
            />
          </section>

          {/* Step 11 — Bookmarks */}
          <section id="bookmarks" className="card scroll-mt-6">
            <div className="flex items-center gap-3">
              <span className="step-num">11</span>
              <h2 className="h2">Browser bookmarks — the daily-use URLs</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Make a bookmark folder called <strong>AV — daily</strong> and add these:
            </p>
            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-border">
              <table className="w-full text-sm">
                <thead className="bg-gray-light text-left">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-ink">Name</th>
                    <th className="px-4 py-2 font-semibold text-ink">URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-border bg-white text-xs">
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">
                      AV Tracker (this site&apos;s parent)
                    </td>
                    <td className="px-4 py-2 font-mono text-slate">
                      https://av-eng-tracker.vercel.app
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">
                      Splunk zgav dashboard
                    </td>
                    <td className="px-4 py-2 font-mono text-slate">
                      https://zillowgroup.splunkcloud.com/en-US/app/zgav/zgav_non-prod
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">Q-Sys Reflect Dashboard</td>
                    <td className="px-4 py-2 font-mono text-slate">https://reflect.qsc.com</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">Zoom Offline Rooms (live)</td>
                    <td className="px-4 py-2 font-mono text-slate">
                      https://zillowgroup.zoom.us/location?roomStatus=1
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">Domotz Portal</td>
                    <td className="px-4 py-2 font-mono text-slate">
                      https://portal.domotz.com/webapp/inventoryDashboard
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">Zillow GitLab (AV group)</td>
                    <td className="px-4 py-2 font-mono text-slate">
                      https://gitlab.zgtools.net/core-tech/unified-communications/av
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">Zodiac homepage</td>
                    <td className="px-4 py-2 font-mono text-slate">https://zodiac.zgtools.net</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">
                      Splunk runbook (GitLab wiki)
                    </td>
                    <td className="px-4 py-2 font-mono text-slate">
                      https://gitlab.zgtools.net/groups/devex/observability/-/wikis/splunk-cloud-runbook
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">ServiceNow Splunk request</td>
                    <td className="px-4 py-2 font-mono text-slate">
                      https://zillow.service-now.com/esc?id=sc_cat_item&amp;searchTerm=splunk
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">Zoom Admin Dashboard</td>
                    <td className="px-4 py-2 font-mono text-slate">
                      https://zoom.us/account/dashboard
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">Common AV Errors sheet</td>
                    <td className="px-4 py-2 font-mono text-slate">
                      https://docs.google.com/spreadsheets/d/1h57WezGBw0MSdFIZmpaV7zZc330Fla7wunTy8N5vlXQ
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-ink">IP Schedule sheet</td>
                    <td className="px-4 py-2 font-mono text-slate">
                      https://docs.google.com/spreadsheets/d/1efvIfN1IBDRdrE0u9jkAHjUefbzwfaptvF8rHNCPIE8
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting" className="card scroll-mt-6 bg-gray-light/30">
            <h2 className="h2">Troubleshooting</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed">
              <div>
                <div className="font-semibold text-ink">
                  &ldquo;gitlab.zgtools.net can&apos;t be reached&rdquo; in browser
                </div>
                <p className="mt-1 text-slate">
                  → VPN isn&apos;t connected. Check the system tray for your VPN client.
                </p>
              </div>
              <div>
                <div className="font-semibold text-ink">
                  glab login opens browser but gets stuck
                </div>
                <p className="mt-1 text-slate">
                  → Likely Okta SSO loop. Try a fresh incognito browser tab. If still stuck,
                  use PAT method (Step 5 fallback) instead.
                </p>
              </div>
              <div>
                <div className="font-semibold text-ink">
                  &ldquo;winget: command not found&rdquo;
                </div>
                <p className="mt-1 text-slate">
                  → Older Windows or restricted IT image. Install via{" "}
                  <strong>Company Portal</strong> instead, or use Scoop / Chocolatey.
                </p>
              </div>
              <div>
                <div className="font-semibold text-ink">
                  Execution policy error when running PowerShell scripts
                </div>
                <p className="mt-1 text-slate">
                  → Run this once:{" "}
                  <code className="rounded bg-white px-1.5 py-0.5">
                    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
                  </code>
                </p>
              </div>
              <div>
                <div className="font-semibold text-ink">
                  glab returns 401 / &ldquo;not authorized&rdquo;
                </div>
                <p className="mt-1 text-slate">
                  → Your token expired or scopes are wrong. Re-generate at{" "}
                  <code className="rounded bg-white px-1 py-0.5">
                    gitlab.zgtools.net/-/user_settings/personal_access_tokens
                  </code>{" "}
                  with read_api + read_repository + write_repository scopes.
                </p>
              </div>
              <div>
                <div className="font-semibold text-ink">
                  Q-Sys Designer can&apos;t connect to a Core
                </div>
                <p className="mt-1 text-slate">
                  → You need to be on VPN AND the Core&apos;s subnet needs to be reachable
                  from your VPN profile. Confirm with Mark which VPN profile gives access to
                  the AV management VLAN.
                </p>
              </div>
              <div>
                <div className="font-semibold text-ink">
                  AWS SSO login spins indefinitely
                </div>
                <p className="mt-1 text-slate">
                  → Try a different SSO start URL — Zillow&apos;s could be{" "}
                  <code>zillowgroup.awsapps.com/start</code> or under a different subdomain.
                  Ask Mark or check Zillow IT docs.
                </p>
              </div>
            </div>
          </section>

          {/* Final — what to do next */}
          <section className="card border-l-4 border-green bg-green/5">
            <div className="eyebrow text-green">When you&apos;ve finished setup</div>
            <h2 className="h3 mt-2">Three things to do, in order:</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink">
              <li>
                Run the AV GitLab inventory script (Step 10). Paste{" "}
                <code className="rounded bg-white px-1.5 py-0.5">av-repos-summary.txt</code>{" "}
                back in chat.
              </li>
              <li>
                Go to{" "}
                <a
                  href="https://av-eng-tracker.vercel.app/todo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue underline"
                >
                  av-eng-tracker.vercel.app/todo
                </a>{" "}
                and check off the Splunk inheritance items you can now act on (zgav bookmark,
                join #splunk-cloud-community, etc.).
              </li>
              <li>
                Open Cursor → File → Open Folder →{" "}
                <code className="rounded bg-white px-1.5 py-0.5">
                  C:\Users\you\Desktop\av-inheritance
                </code>{" "}
                → start exploring the cloned repos.
              </li>
            </ol>
          </section>
        </main>
      </div>

      <footer className="mt-16 border-t border-gray-border bg-white">
        <div className="container-main py-6 text-xs text-slate">
          Companion to{" "}
          <a
            href="https://av-eng-tracker.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue underline"
          >
            av-eng-tracker.vercel.app
          </a>
          . Private notebook — don&apos;t share publicly. Last updated{" "}
          {new Date().toISOString().slice(0, 10)}.
        </div>
      </footer>
    </div>
  );
}
