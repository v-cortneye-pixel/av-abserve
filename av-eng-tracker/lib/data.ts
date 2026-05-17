export type Severity = "P0" | "P1" | "P2" | "P3";

export interface Quote {
  who: string;
  when: string;
  text: string;
  channel?: string;
  /** Direct Slack permalink to the source message */
  permalink?: string;
  /** Optional secondary source URL (Jira ticket, doc, vendor blog, etc.) */
  sourceUrl?: string;
  sourceLabel?: string;
}

export type IssueStatus = "Open" | "Workaround" | "In Progress" | "Resolved";
export type IssueCategory =
  | "HDMI"
  | "Mac"
  | "Zoom"
  | "Audio"
  | "Hardware"
  | "Process"
  | "UI"
  | "Network"
  | "Other";

export interface Issue {
  id: string;
  title: string;
  severity: Severity;
  category: IssueCategory;
  rooms: string[];
  status: IssueStatus;
  owner: string;
  summary: string;
  rootCause: string;
  workaround?: string;
  quotes: Quote[];
  currentState: string;
  cortneyAction: string;
  steps: string[];
}

export const ISSUES: Issue[] = [
  {
    id: "hdmi-share",
    title: "HDMI Share Reliability (Fleet-wide)",
    severity: "P0",
    category: "HDMI",
    rooms: ["SFO-735", "IRV-802", "IRV-805", "IRV-1216", "IRV-1223", "SEA-3925"],
    status: "In Progress",
    owner: "Matt → Cortney (proposed)",
    summary:
      "HDMI share failure is the most frequent user-facing issue across the fleet. Multi-factor root cause: VSI enc/dec, Magewell capture sync loss, USB-C adapter quality, EDID negotiation, and Q-Sys 10 / NV interactions.",
    rootCause:
      "Mixed. Capture cards lose sync after first share. VSI enc/dec proven unreliable. USB-C adapters at user end frequently faulty. EDID handshake intermittent.",
    workaround: "Decision in principle to migrate to Q-Sys NV endpoints. Not yet rolled out.",
    quotes: [
      {
        who: "Matt Cornick",
        when: "Nov 12, 2025 11:56 PT",
        text: "Nope, just that HDMI share is probably the number one issue by 10x. SFO-735 and IRV-802 are both VSI and are both not working with HDMI share but I think they might be different issues.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1762977419683999?thread_ts=1762976206.686079&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Nov 10, 2025 13:13 PT",
        text: "Zoom Rooms never shows HDMI as a share option which means it doesn't see sync on the Magewell.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1762809225212559?thread_ts=1762808815.677239&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Nov 10, 2025 14:51 PT",
        text: "IRV-802: HDMI share issue as well, but different. The laptop doesn't even see that its plugged into the podium encoder.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1762815115795369?thread_ts=1762815115.795369&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Apr 17, 2026 10:42 PT",
        text: "Alright, I'm at the point of saying we can only do HDMI share if we use Q-Sys NV endpoints.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1776447763671279?thread_ts=1776447763.671279&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "Apr 17, 2026 10:46 PT",
        text: "I'm aligned with this. Let's see what the new qsys endpoints cost.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1776447996048669?thread_ts=1776447763.671279&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Apr 21, 2026 08:48 PT",
        text: "1223 is good. I think her problem may have been the usbc adapter. That made her think that the same problem was in 1216.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1776786526590539?thread_ts=1776786331.154879&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "Apr 21, 2026 08:50 PT",
        text: "Ok. Those damn adapters cause so many issues.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1776786603021269?thread_ts=1776786331.154879&cid=C04GF3S3KQF",
      },
    ],
    currentState:
      "Q-Sys NV pricing not confirmed. No rollout schedule. USB-C adapter quality not addressed. See HDMI Innovation page for 6 alternative paths.",
    cortneyAction:
      "Propose lab bench-test of source-side EDID forcing + direct USB capture before committing capex to NV endpoint swap.",
    steps: [
      "Get Q-Sys NV endpoint pricing from QSC (via Scott)",
      "Build list of every room currently using VSI enc/dec",
      "Tuesday meeting: pitch 2-week lab bench-test before PO",
      "Lab test Option D: source-side EDID forcing (Lightware EDID Lock)",
      "Lab test Option B: direct USB capture path (Inogeni/Magewell USB)",
      "Document pass/fail criteria for each test",
      "Build USB-C adapter standard SKU recommendation in parallel",
      "Bring data back to Matt + Mark with recommendation",
      "Tie swap-out schedule to existing site visit calendar",
    ],
  },
  {
    id: "zoom-whiteboard",
    title: "Zoom Room Whiteboard / Companion Error",
    severity: "P0",
    category: "Zoom",
    rooms: ["SFO-735", "SEA-3912", "SEA-3932"],
    status: "Workaround",
    owner: "Matt → Cortney (claim)",
    summary:
      "Companion Zoom Rooms throw a Whiteboard error after a ZR update. Zoom Dashboard incorrectly reports companions as disconnected even after recovery.",
    rootCause: "Unconfirmed. Believed to be a ZR update regression. Zoom support ticket still open.",
    workaround:
      "Enable Whiteboard (New) in Room Settings, then reboot all room devices from the web UI Zoom controller.",
    quotes: [
      {
        who: "Matt Cornick",
        when: "Apr 20, 2026 16:29 PT",
        text: "Zoom Rooms w/Companion Zoom Rooms showing Whiteboard error: I still believe this is ZR update issue. Zoom support was quick to respond. They asked if I could enabled the 'New Whiteboard' option... The fix requires a room reboot of all devices to fix the issue. I feel like it's a workaround at this point but will continue convo with Zoom support.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1776727777667679?thread_ts=1776727777.667679&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Apr 20, 2026 16:31 PT",
        text: "Once in a call, the companions work as they should. Zoom's dashboard is not reporting these errors correctly. Once they're back online, they're still showing as disconnected but from the admin panel they always show as online.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1776727889412549?thread_ts=1776727777.667679&cid=C04GF3S3KQF",
      },
    ],
    currentState:
      "Three rooms in workaround state. Other companion-room sites untouched. No root cause from Zoom yet.",
    cortneyAction:
      "Take over the Zoom Support ticket. Build a list of every companion-room site and audit workaround status.",
    steps: [
      "Ask Matt to transfer the Zoom Support ticket ownership to me",
      "Pull list of every Zoom Room with a companion device from Zoom Admin",
      "Audit each companion-room site for current Whiteboard state (workaround applied / not)",
      "Document the workaround steps in internal runbook",
      "Follow up with Zoom Support weekly for root cause",
      "Add a Whiteboard error detection check to the daily alerts bot",
    ],
  },
  {
    id: "sea-3647-audio",
    title: "SEA-3647 Audio Coverage",
    severity: "P0",
    category: "Audio",
    rooms: ["SEA-3647"],
    status: "Open",
    owner: "Cortney + Matt",
    summary:
      "User feedback May 15: in-room participants not heard on Zoom unless they use a mic. Room uses MXA910 ceiling mics (older, lobe-based, not autosteer). Same room failed audio test 8 months ago and was fixed by mic reboot — root cause never confirmed.",
    rootCause:
      "Possibly: muted mic channel, Dante routing, lobe coverage gap, MXA910 AEC drift, or quiet talker outside lobe coverage area.",
    quotes: [
      {
        who: "Stacey Newman",
        when: "May 15, 2026 09:43 PT",
        text: "Received feedback this week that 3647, audio didn't cover from in room participants through Zoom without the participants using a mic.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778863433433209?thread_ts=1778863433.433209&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "May 15, 2026 10:13 PT",
        text: "the room is small, i'd be shocked if it were a lobe steering issue given that the room has been working fine for a year without complaints. Can we verify that the mics arent muted? or that there arent dante routing issues?",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778865191631089?thread_ts=1778863433.433209&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "May 15, 2026 10:14 PT",
        text: "We're definitely not using discrete lobes in there. The 920 is setup to autosteer like a TCC2. No need for discrete lobes in a room like that. Especially because the tables can move.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778865255397989?thread_ts=1778863433.433209&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "May 15, 2026 10:23 PT",
        text: "Yep. We have MXA910s in there? We must have reused old stock. I thought they were 920s.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778866623443529?thread_ts=1778863433.433209&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "May 15, 2026 11:06 PT",
        text: "Lobes have to be used for 910s.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778868368940239?thread_ts=1778863433.433209&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Sep 3, 2025 09:06 PT",
        text: "Rebooting the mics fixed it. All metering on the mics looked like AEC was totally fine. I haven't seen that one before.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1756915619884549?thread_ts=1756914943.701849&cid=C04GF3S3KQF",
      },
    ],
    currentState:
      "Cortney has Keeper access. Lobes confirmed in use with sufficient coverage. Awaiting in-room walking talker test.",
    cortneyAction:
      "Schedule onsite 30-min walking talker test at 4 corners w/ Shelby or John. Pull Zoom Dashboard audio metrics for last 30 days. Document root cause this week.",
    steps: [
      "Coordinate onsite assist with Shelby or John for 30-min test slot",
      "Verify MXA910 mute states and Dante routing in Q-Sys Designer",
      "Walking talker test: 4 corners + center, normal + quiet voice",
      "Pull Zoom Dashboard audio metrics for last 30 days of 3647 calls",
      "Check if 3647 echo issue (Sep 2025) ever had documented root cause",
      "Document root cause + remediation in Jira ticket",
      "Decide: tune existing 910s, swap to 920, or pull TCC2 from spares",
      "Update Stacey with resolution + tie to fleet ceiling mic strategy",
    ],
  },
  {
    id: "mac-mini",
    title: "Mac Mini Reliability (Fleet-wide host platform)",
    severity: "P1",
    category: "Mac",
    rooms: ["Fleet-wide (~50+ rooms)"],
    status: "Open",
    owner: "Strategic — Cortney to lead architectural review",
    summary:
      "Mac Mini is the standard Zoom Rooms host. Track record over 18 months shows recurring OS-update-induced failures, provisioning inconsistency, and a strategic risk: Q-Sys Connect, the new ZR attached-controller standard, is Windows-only.",
    rootCause:
      "Management surface (Jamf push, OS updates, Apple ID, ZR version drift) + vendor compatibility direction (Q-Sys Connect Windows-only).",
    quotes: [
      {
        who: "Patrick Gilligan",
        when: "Aug 19, 2025 08:26 PT",
        text: "SFO-735 and SEA-3647 did indeed update to Sequoia, which prompts this Apple Intelligence popup... an overlay on top of Zoom Rooms, and doesn't take the computer out of ZR.....therefore Zoom thinks the system is still online (if the computer is not focused on ZR, its seen as offline).",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1755616850342659?thread_ts=1755616850.342659&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Aug 15, 2025 10:49 PT",
        text: "Mac Mini encoder, routed to the Projector Decoder, and the Mac's sound card is set to be its NV-21, instead of Q-Sys.....no signal",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1755280178314399?thread_ts=1755280178.314399&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Aug 12, 2025 08:26 PT",
        text: "Mac OS + USB-C = NV-21 seems all good now after updating to Q-Sys 10",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1755012394830489",
      },
      {
        who: "Mark Hampson",
        when: "Mar 24, 2026 07:21 PT",
        text: "according to Andrew that mac mini was never properly setup and Auto Login for zoomrooms account needs to be setup... I have no idea how this mac mini was never setup, it was installed before i even came onboard.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1774362086613879?thread_ts=1774362086.613879&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Mar 24, 2026 07:29 PT",
        text: "this Mac never went through the proper setup process. The reboots may be due to macOS updates because it was originally set up as a regular Mac. If it still has issues after this I'd recommend wiping it and going through the proper setup.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1774362578788829?thread_ts=1774362086.613879&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Mar 16, 2026 12:58 PT",
        text: "any idea why irv-802 is in a meeting, but when I open up the camera preview its on a Mac home screen?",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1773691116703509?thread_ts=1773691116.703509&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Feb 10, 2026 13:29 PT",
        text: "Ahhhhhhhh 'Use Mac System Picker for Sharing' - read the fine print",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1770758956104089?thread_ts=1770758739.704879&cid=C04GF3S3KQF",
      },
      {
        who: "Cortney Eison",
        when: "May 14, 2026 22:36 PT",
        text: "'Q-SYS Connect software is now certified as a Zoom Rooms attached controller for Windows.' I would imagine that would mean that zoom rooms be run on a NUC for example rather than a Mac.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778823386718649",
        sourceUrl:
          "https://blogs.qsc.com/systems/2026/05/07/q-sys-connect-unlocks-new-flexibility-for-zoom-rooms/",
        sourceLabel: "QSC blog post",
      },
      {
        who: "Mark Hampson",
        when: "May 15, 2026 06:26 PT",
        text: "It's such a bummer we need to use windows for this. Every room deployment we've rolled out is a mac mini. We have a specific mac os AV Zoom Room config that gets pushed out to them and is managed by our CE team. We can ask to see what the lift would be like if we would like to start deploying Windows based appliances but I imagine thats going to be a hard no - just last year we (zillow IT) decommisioned all PC appliances that were not laptops. It may be a tough sell.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778851565920959?thread_ts=1778823120.439739&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "May 15, 2026 16:19 PT",
        text: "A Mac Mini will outperform any Android based system. That's just a fact. There are Zoom Room features that aren't even supported on any Android appliances.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778887165858699?thread_ts=1778859719.870609&cid=C04GF3S3KQF",
      },
      {
        who: "Stacey Newman",
        when: "May 15, 2026 09:56 PT",
        text: "For your standard 30-person enclosed rooms, your existing Neat Bar Pro or zRetreat spec is likely the better choice... Cortney's G62 design starts making more sense above 45 people. It could be worth considering as a Tier 3 large/complex room standard rather than replacing what you have.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778864188189599?thread_ts=1778859719.870609&cid=C04GF3S3KQF",
      },
    ],
    currentState:
      "Active architectural debate. Tuesday May 19 meeting scheduled between Cortney and Matt. Stacey landed on 'Tier 3 large/complex room standard' as the framing.",
    cortneyAction:
      "Tuesday meeting: lead with questions about current Mac standard, NOT pitches. Reframe G62 as a Tier 3 lab pilot. Quantify ticket-hours/year for OS-driven issues to back up any architectural proposal.",
    steps: [
      "Tuesday meeting w/ Matt: walk through existing Mac Mini + Q-Sys reference design",
      "Get current Mac management story (Jamf push, OS update cadence, CE vs AV ownership)",
      "Quantify ticket-hours/year for OS-driven Mac Mini issues over past 18 months",
      "Ask Matt: what would success criteria look like for a Tier 3 lab pilot?",
      "Investigate Zillow IT exception path for Windows AV appliances (with Mark)",
      "Research: can Q-Sys touch panels work with Mac Mini long-term, or only via Windows now?",
      "Confirm where Andrew Spokes' Sequoia push process can be intercepted before production rollout",
      "By day 90: write 'Mac Mini retention vs Windows appliance' brief with data",
    ],
  },
  {
    id: "scheduler-offline",
    title: "Zoom Scheduler / Calendar-Only Rooms Offline (WAVE-16)",
    severity: "P1",
    category: "Zoom",
    rooms: ["Fleet-wide schedulers"],
    status: "Workaround",
    owner: "Patrick (gone) → Cortney",
    summary:
      "Calendar-only schedulers (Neat Pads in scheduler mode) drift offline. Software v6.6.10 specifically problematic. Remote reboot doesn't enable upgrade — requires physical reboot at panel. WAVE-16 ticket open with Zoom.",
    rootCause: "Confirmed by Matt as a v6.6.10 issue. Underlying root cause never confirmed by Zoom.",
    workaround:
      "Have an onsite person physically reboot the scheduler at the panel. This unlocks the remote upgrade button.",
    quotes: [
      {
        who: "Patrick Gilligan",
        when: "Feb 17, 2026 09:38 PT",
        text: "is the Zoom/Zillow bi weekly sync an acceptable place to park a troubleshooting item, like the issue with calendar only rooms being offline?",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1771349931445949?thread_ts=1771349931.445949&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Feb 17, 2026 09:44 PT",
        text: "WAVE-16 — so crazy being on teams before that started with like, ZNET-99446 and we are only on 16.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1771350255806289?thread_ts=1771349931.445949&cid=C04GF3S3KQF",
        sourceUrl: "https://zillowgroup.atlassian.net/browse/WAVE-16",
        sourceLabel: "WAVE-16 in Jira",
      },
      {
        who: "Matt Cornick",
        when: "Feb 17, 2026 09:57 PT",
        text: "Seeing different software versions with 724 offline and 720 online. Maybe related? Weird thing is, I can't upgrade 724 from Zoom.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1771351053357199?thread_ts=1771349931.445949&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Feb 17, 2026 10:14 PT",
        text: "It does seem to be an issue with v6.6.10 on the schedulers, looking at the dashboard.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1771352263397439?thread_ts=1771349931.445949&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Feb 17, 2026 10:34 PT",
        text: "It does restart but it didn't trigger the update ability for me until I had Priscilla go over and reboot it from the panel directly.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1771353259093079?thread_ts=1771349931.445949&cid=C04GF3S3KQF",
      },
      {
        who: "AV Slack Bot (daily alert)",
        when: "May 16, 2026 03:18 PT",
        text: "IRV-1250 Controller disconnected. IRV-1110 ZHL Offline — Zoom room is offline. (Same failure pattern WAVE-16 was opened for, still firing.)",
        permalink:
          "https://zillowgroup.slack.com/archives/C07SY86AY31/p1778926702093329",
      },
    ],
    currentState:
      "WAVE-16 shows CLOSED in Jira but the underlying issue is still firing — May 16, 2026 daily alerts: IRV-1250 (Controller disconnected) + IRV-1110 ZHL (Offline). Workaround was applied; root cause never confirmed by Zoom. Reopening is justified.",
    cortneyAction:
      "Reopen WAVE-16 with fresh evidence. Take over the ticket. Add scheduler firmware version check to daily alerts bot. Build proactive list of v6.6.10 stragglers.",
    steps: [
      "Reopen WAVE-16 with the May 16, 2026 IRV-1250 / IRV-1110 ZHL evidence",
      "Ask Matt for WAVE-16 ticket transfer to me + last touchpoint with Zoom",
      "Pull all schedulers from Zoom Admin and report current firmware versions",
      "Build a v6.6.10 'stragglers' list for proactive remediation",
      "Add scheduler firmware version check to daily alerts bot",
      "Document the panel-reboot workaround for onsite teams",
      "Resolve open sub-findings: rooms with 2 schedulers (one online/one offline); pad stuck on upgrading screen",
      "Schedule weekly Zoom Support follow-up until root cause confirmed",
    ],
  },
  {
    id: "neat-mic-coverage",
    title: "Neat Bar Pro audio coverage limitations + Q-Sys expansion failure",
    severity: "P1",
    category: "Audio",
    rooms: ["IRV-825 (North Star)", "SEA-3829 Dev Space", "Jeremy Hofmann office", "zRetreat fleet"],
    status: "Open",
    owner: "Cortney (proposed)",
    summary:
      "Neat Bar Pro alone has documented audio coverage limits in larger rooms. Attempts to expand via Q-Sys Core have failed (Matt: 'only worked with audio one way'). Neat's own Oct 2024 firmware introduced dynamic mic selection specifically to address coverage. SEA-3829 Dev Space already pairs a Sennheiser TCC2 with Neat Pads — the only production precedent for ceiling-mic + Neat coexistence.",
    rootCause:
      "Neat Bar Pro USB-C audio expansion to Q-Sys is one-way (mic input only, no output). Shure P300 is the only path Matt has confirmed for bidirectional USB audio. AVIO Dante-USB adapter is bidirectional but untested at Zillow.",
    workaround:
      "Pair Neat Bar Pro with handheld wireless mics (Shure MXW). Some rooms add ceiling mics (3737, 3647). SEA-3829 uses Sennheiser TCC2 alongside Neat.",
    quotes: [
      {
        who: "Mark Hampson",
        when: "Jan 31, 2024 06:10 PT",
        text: "Another underrated of the Neat Center (their version of the sight), is it has mics built in. So it extends the audio limitations of using just the bar/bar pro.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1706710204369599",
      },
      {
        who: "Matt Cornick",
        when: "May 14, 2026 08:46 PT",
        text: "The last time I tried a Core to expand a Neat Bar Pro, it only worked with audio one way. I think it was for mics. Output wouldn't work. Shure P300 was the only way to get 2 way USB audio connected.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778859975179529?thread_ts=1778859719.870609&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "Feb 6, 2025 13:14 PT",
        text: "What are our thoughts on using ceiling mics in tandem with wireless mics in zRetreats (like in 3925). Are the ceiling mics pointless? My thoughts are its a nice to have for the few times we may need them, so it is beneficial to have them in the room if we have the budget.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1738873872525929?thread_ts=1738873872.525929&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "Feb 6, 2025",
        text: "So in the new enclosed room, I am thinking we repurpose two MXA910 mics with some handheld mics. The space is definitely smaller than 3925. It's a 30 person room.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1738874145769329?thread_ts=1738873872.525929&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Jan 26, 2026 13:01 PT (SEA-3829 inventory)",
        text: "SEA-3829: Conference room seating; (1) Front camera; Dual screens HDbT; (1) Senn TCC2; (2) Controller as Neat Pads (x1 floor, x1 wall); (2) Schedulers outside.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1769461275618509?thread_ts=1769442903.577679&cid=C04GF3S3KQF",
      },
      {
        who: "Cortney Eison",
        when: "May 14, 2026 (G62 thread)",
        text: "For example with a neatboardpro an AVIO can be used to add ceiling mics as a companion to a neatcenter. Alternatively with a neatbar pro the same thing.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778886075167309?thread_ts=1778859719.870609&cid=C04GF3S3KQF",
      },
      {
        who: "Neat release notes",
        when: "Oct 2024 (firmware 24.4)",
        text: "Dynamic microphone selection between Neat Pad and main room. This enables further audio coverage for larger rooms or for rooms where the Pad is placed away from the table (e.g. on a podium).",
        sourceUrl: "https://support.neat.no/article/neat-preview-channel-firmware/",
        sourceLabel: "Neat 24.4 release notes",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1727887727620239?thread_ts=1727887727.620239&cid=C04GF3S3KQF",
      },
    ],
    currentState:
      "Mark's Feb 2025 open question — 'are ceiling mics pointless with Neat?' — never definitively answered. SEA-3829 is the only documented Neat + ceiling-mic coexistence in production. AVIO bidirectional approach Cortney proposed has not been bench-tested.",
    cortneyAction:
      "Use SEA-3829's existing Senn TCC2 + Neat Pad setup as the precedent. Bench-test AVIO USB-C adapter as bidirectional Q-Sys ↔ Neat audio bridge to validate the 45+ space architecture pitched May 14. Document findings for fleet audio coverage standard.",
    steps: [
      "Visit SEA-3829 dev space — document the working TCC2 + Neat Pad signal flow as a reference design",
      "Bench-test AVIO USB-C bidirectional adapter with Neat Bar Pro + Q-Sys Core",
      "Confirm Matt's prior failure mode — was it AVIO or Shure P300 that was tested?",
      "Survey Neat-equipped rooms (IRV-825, Hofmann office, zRetreat fleet) for audio coverage complaints",
      "Document a Neat audio-expansion standard if testing succeeds (Tier 2 → Tier 3 upgrade path)",
      "Answer Mark's open Feb 2025 question on ceiling-mics-with-Neat — recommendation by next sync",
    ],
  },
  {
    id: "neat-install-quality",
    title: "Neat Bar Pro fleet install quality — upside-down mounting",
    severity: "P2",
    category: "Hardware",
    rooms: ["SEA-3940 (fixed)", "SEA-3626 (fixed)", "remaining Neat Bar Pro fleet"],
    status: "Workaround",
    owner: "Matt + Face → Cortney (audit)",
    summary:
      "Discovered Aug 2025: all Neat Bar Pros were mounted upside down, causing cables to bend 180 degrees at the connector. Matt and Face flipped some manually; full remediation requires patch + paint due to original mounting hole pattern.",
    rootCause:
      "Original installer error — mounted upside down across the fleet. Not a Neat hardware defect.",
    workaround:
      "Flip the bar in place — exposes cables (cosmetic, not functional). Avoids the cable strain that risks HDMI port damage.",
    quotes: [
      {
        who: "Matt Cornick",
        when: "Aug 13, 2025 13:06 PT",
        text: "Neat Bar Pro rooms with a deserved facepalm: All of the Neat Bar Pros are mounted upside down which causes the cables to get bent 180 degrees to get plugged in. It's easy enough to flip them (which I did in 3940) and I can have Face flip the rest but it leaves the cables exposed. If we remount them to hide the cables properly it will leave holes in the wall exposed.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1755115598757889?thread_ts=1755115598.757889&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "Aug 13, 2025 13:16 PT",
        text: "Dude… what?? Ok leave as is for now. I'll try to coordinate remounting them with patch and paint. That's really annoying.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1755116179609379?thread_ts=1755115598.757889&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Aug 13, 2025 16:54 PT",
        text: "3626 is good. They used the vesa mount so I was able to flip it.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1755129690680359?thread_ts=1755115598.757889&cid=C04GF3S3KQF",
      },
    ],
    currentState: "Some flipped, rest pending. Patch + paint coordination unresolved.",
    cortneyAction:
      "Audit remaining Neat Bar Pro fleet for upside-down mounts. Coordinate patch + paint with Workplace as part of next site visits.",
    steps: [
      "Build full list of Neat Bar Pro rooms with current mount orientation",
      "Identify which have been flipped vs still upside-down",
      "Schedule patch + paint with Workplace for proper remount cycle",
      "Update install runbook so this never happens again on new deployments",
    ],
  },
  {
    id: "ui-standardization",
    title: "UI Standardization (Patrick's half-finished UCI work)",
    severity: "P1",
    category: "UI",
    rooms: ["SEA-3647 (deployed)", "All projector rooms (pending)"],
    status: "In Progress",
    owner: "Patrick (gone) → Cortney",
    summary:
      "Patrick deployed a single-page UCI to SEA-3647 in March intended as the standard for 'simpler rooms.' Rollout to other rooms never planned. Projector rooms need a different standard with manual controls (IRV-802 incident revealed Patrick hid projector controls behind a dynamic 'No source selected' state).",
    rootCause:
      "No documented UI standard. Patrick's UCI work is undocumented community-plus-custom Q-Sys plugins.",
    quotes: [
      {
        who: "Patrick Gilligan",
        when: "Mar 3, 2026 15:22 PT",
        text: "Another thing I've been working on, and already deployed to SEA-3647... A single page UCI with: no audio controls (nobody seems to use them), simple screen control, dropdown when there is a projector, routing if needed.",
      },
      {
        who: "Matt Cornick",
        when: "Mar 31, 2026 08:12 PT",
        text: "I also found out that I think Patrick removed projector and screen controls from the UI so I had to roll the screens up and turn projectors off manually from QDS.",
      },
      {
        who: "Mark Hampson",
        when: "Mar 31, 2026 08:28 PT",
        text: "You and I should get together to talk through the roadmap of simplifying and standardizing the UI for these rooms. The vast majority of these rooms should not need any UI, but anything with a projector should have manual controls on them. I am wide open tomorrow if you want to talk it through?",
      },
      {
        who: "Mark Hampson",
        when: "Mar 31, 2026",
        text: "Did Patrick write it or get it from his Q-Sys community? It's not on the Q-Sys Library.",
      },
    ],
    currentState: "Roadmap session never held. No documented Tier 1/2/3 UI standard.",
    cortneyAction:
      "Propose to Mark: take over the UI roadmap. Draft Tier 1/2/3 UCI standard strawman by mid-June. Continue Patrick's 3647 work as the Tier 1 template.",
    steps: [
      "Get Patrick's UCI source files from GitLab/CodeCommit",
      "Get all custom Q-Sys plugins (community vs Patrick-authored) sourced",
      "Audit every room's current UI to identify Tier 1 / 2 / 3 candidates",
      "Draft Tier 1/2/3 UCI standards doc (strawman, not pitch)",
      "Share with Mark + Matt for feedback",
      "Pilot Tier 1 (single-page UCI from 3647) in one additional room",
      "Build IRV-802-style projector room UI fix (expose controls properly)",
      "Roll out approved standards across rooms by site visit cadence",
    ],
  },
  {
    id: "nv21-tracking",
    title: "NV-21 Reliability + Tracking Process",
    severity: "P1",
    category: "Hardware",
    rooms: ["NV-21 fleet (SEA, IRV, dev space)"],
    status: "Open",
    owner: "Mark (process) + Cortney (proposed)",
    summary:
      "NV-21 hardware platform has had a rough 12 months: fan failures, PSU sourcing pain (no Phoenix block included), PSU mixups (NV21 vs NV32 incompatible), Mac OS USB-C audio bugs (fixed in Q-Sys 10), Founders packet loss. SN/MAC tracking process undocumented — John failed to log SN on the most recent fan failure.",
    rootCause: "Mix of vendor hardware quality issues + lack of internal process discipline.",
    quotes: [
      {
        who: "Mark Hampson",
        when: "May 8, 2026 11:28 PT",
        text: "do either of you guys have the serial number of the bad NV-21 with the fan issue from yesterday? Working on a replacement now.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778264881829089?thread_ts=1778264881.829089&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "May 8, 2026 12:20 PT",
        text: "As far as SN, MACs, etc we have the IP doc but it's really geared towards managing devices. SNs aren't on there because they can be a pain to always enter and you don't really need them unless you're replacing gear. When John pulled the bad NV, he should have logged the info into the Jira ticket so Mark could just reference it there. Jira is newish for us and we're also trying to get in the habit of tracking everything there so it's easily referenced later.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778268009822149?thread_ts=1778264881.829089&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Sep 2, 2025 10:07 PT",
        text: "where have you been buying the power phoenix blocks for the NV-21 PSUs? Seems like the unit does not ship with it, annoyingly.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1756832848851319?thread_ts=1756832848.851319&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "Sep 2, 2025 10:13 PT",
        text: "im sure this one would come with it, but i dont know how to buy this one. ive never even seen this power supply in real life before.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1756833218332419?thread_ts=1756832848.851319&cid=C04GF3S3KQF",
        sourceUrl:
          "https://www.adiglobaldistribution.pr/Product/QB-NV21PSU",
        sourceLabel: "QB-NV21PSU at ADI",
      },
      {
        who: "Matt Cornick",
        when: "Aug 20, 2025 08:22 PT",
        text: "The NV21 PSU will not work with the NV32.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1755703331410529?thread_ts=1755639064.739429&cid=C04GF3S3KQF",
      },
    ],
    currentState: "Fan replacement in motion. SN tracking process undocumented.",
    cortneyAction:
      "Write SN/MAC tracking runbook for onsite teams (John, Adali). Add to Jira ticket template. Build spare-parts inventory doc.",
    steps: [
      "Draft SN/MAC tracking runbook for onsite teams",
      "Define Jira ticket template fields for gear replacements",
      "Review draft with Mark for approval",
      "Share with John (onsite SEA) and Adali (onsite IRV) for buy-in",
      "Build spare-parts inventory doc (NV-21, NV-32, PSUs, Phoenix blocks, capture cards, UE1s)",
      "Document NV-21 PSU + Phoenix block sourcing path (Phihong / Digikey)",
      "Add inventory location tracking column",
    ],
  },
  {
    id: "mxa-strategy",
    title: "MXA910 → 920 / TCC2 Replacement Strategy",
    severity: "P2",
    category: "Audio",
    rooms: ["MXA910 fleet (SEA-3647, others)", "TCC2 fleet (SFO All Hands, SEA-3829, SEA-3925)"],
    status: "Open",
    owner: "Mark asked Matt → Cortney to spec",
    summary:
      "Open architectural question deferred since Sep 2025. MXA910s are dated, require manual lobes, AEC behavior unexplained. TCC2s already in fleet but never received an on-site tuning pass (3925's TCC2s called 'almost unusable' due to HVAC). Mark's last unanswered question: 'MXA920 or TCC2 for NYC-1204?'",
    rootCause: "No fleet-wide ceiling mic standard. Replacement deferred to 2027 AOP by Mark.",
    quotes: [
      {
        who: "Matt Cornick",
        when: "Sep 3, 2025 09:06 PT",
        text: "Rebooting the mics fixed it... I'm not sure what would be best to do here. 1. Use the MXA for automixing of the lobes only and use a single AEC channel on the Core. This kind of works like a TCC2. 2. Replace all MXA910s with TCC2s.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1756915619884549?thread_ts=1756914943.701849&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "Sep 3, 2025 09:26 PT",
        text: "We dont have money for TCC2's my dudes so its going to have to be option 1. FWIW I've always treated the built in AEC in those MXA's as a reference for the intellimix so the lobes know not to move around for far end voices (not for full blown AEC) and used the DSP's AEC.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1756916817628139?thread_ts=1756914943.701849&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Sep 3, 2025 09:33 PT",
        text: "we do have x2 in SFO from the 10 floor and I have x2 that I could part with. Plus there's the 4 in 3925 that could be argued are almost unusable with the HVAC in the room.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1756917212168039?thread_ts=1756914943.701849&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Sep 3, 2025 09:47 PT",
        text: "Updating 910s....shoulda/coulda/woulda been a good aop initiative for 2026. Didn't occur to me, personally, but I wish it had.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1756918067144129?thread_ts=1756914943.701849&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "Sep 3, 2025",
        text: "ship has sailed. maybe in 2027. although we do have funds for if they break, so technically we could replace one a month haha.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1756918126239429?thread_ts=1756914943.701849&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "Later (unanswered to Matt)",
        text: "Revisiting this conversation. We are putting 2 new ceiling mics in NYC-1204 at the end of the year. Any heartburn with going with MXA920s or did you want to stick with TCC2s?",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1756914943701849?thread_ts=1756914943.701849&cid=C04GF3S3KQF",
      },
      {
        who: "Nick Melin",
        when: "Oct 9, 2023 15:11 PT",
        text: "I'm actually shocked at how good the TCC2 ceiling mics are in the All Hands.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1696889465990319?thread_ts=1696889465.990319&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Feb 13, 2024 10:52 PT",
        text: "I learned at ISE, that the Sennheiser mics can actually be used for room reenforcement, with a separate reference channel sent back to the mic. It has slick DSP technology that provides something similar to a mix-minus and can cancel local speaker signal and block feedback. I had meaning to ask if you wanted to experiment with that at some point.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1707850345768029?thread_ts=1707848542.319799&cid=C04GF3S3KQF",
      },
    ],
    currentState:
      "TCC2s in fleet for 2.5+ years with no on-site tuning pass on record. Mark's NYC-1204 question still unanswered. 3925 HVAC issue still unmitigated.",
    cortneyAction:
      "Deliver MXA920 vs TCC2 one-pager with recommendation for NYC-1204 by next sync. Then propose TCC2 commissioning pass on existing rooms (SFO All Hands, SEA-3925, SEA-3829) — no CapEx win.",
    steps: [
      "Confirm NYC-1204 dimensions and ceiling height with Mark",
      "Count actual TCC2 spare inventory (SFO 10th floor, Matt's stash, 3925)",
      "Draft MXA920 vs TCC2 spec comparison one-pager",
      "Include 'commissioning labor' row addressing the no-tuning pattern",
      "Recommend a path (Shure consolidation vs Sennheiser consolidation vs mixed)",
      "Share with Mark + Matt at next WAVE sync",
      "Propose TCC2 commissioning sweep: SEA-3925 first (HVAC), then SFO All Hands, SEA-3829",
      "Schedule 2027 AOP item for MXA910 retirement",
    ],
  },
  {
    id: "usb-c-adapters",
    title: "USB-C Adapter Quality",
    severity: "P2",
    category: "Hardware",
    rooms: ["Fleet-wide"],
    status: "Open",
    owner: "Cortney (proposed)",
    summary:
      "Recurring root cause for 'HDMI share doesn't work' tickets. No procurement standard, no approved SKU list. Mark called it out explicitly during IRV-1216 troubleshooting in April.",
    rootCause: "No procurement standard or approved SKU at user-laptop side of HDMI share path.",
    quotes: [
      {
        who: "Mark Hampson",
        when: "Apr 21, 2026 08:50 PT",
        text: "Ok. Those damn adapters cause so many issues.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1776786603021269?thread_ts=1776786331.154879&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Apr 21, 2026 08:48 PT",
        text: "1223 is good. I think her problem may have been the usbc adapter. That made her think that the same problem was in 1216.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1776786526590539?thread_ts=1776786331.154879&cid=C04GF3S3KQF",
      },
    ],
    currentState: "No SKU standard. Each site sources independently.",
    cortneyAction:
      "Test 3 USB-C adapter SKUs in the lab this week. Lock in one part number. Ship to every site as standard kit. Document in Jira and runbook.",
    steps: [
      "Buy 3 candidate USB-C-to-HDMI adapters for lab testing",
      "Test each on Mac + PC + iPad against current capture cards",
      "Score adapters on: EDID stability, audio passthrough, hot-plug behavior",
      "Lock in one part number as the standard",
      "Get Mark to approve the SKU and place bulk order",
      "Ship standard kit to every site (SEA, SFO, IRV, NYC, DEN, MEX)",
      "Document the SKU + part number in the runbook",
    ],
  },
  {
    id: "irv-802-projector",
    title: "IRV-802 Projector / Routing UI Complexity",
    severity: "P2",
    category: "UI",
    rooms: ["IRV-802"],
    status: "Workaround",
    owner: "Matt → Cortney",
    summary:
      "Projector 2 went offline. Patrick removed projector/screen controls from the UI, requiring manual fallback to QDS during a zRetreat. Mark + Matt agreed to redesign — session never held.",
    rootCause: "Plugin source unclear (community vs Patrick-authored). UI design choices not documented.",
    quotes: [
      {
        who: "Matt Cornick",
        when: "Mar 31, 2026 08:12 PT",
        text: "Projector 2 is offline but you can access some controls from the web browser. You just need power. I also found out that I think Patrick removed projector and screen controls from the UI so I had to roll the screens up and turn projectors off manually from QDS.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1774969974154039?thread_ts=1774969974.154039&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "Apr 1, 2026",
        text: "Looking at the file now, it should be redone. Correct me if I'm wrong but cant this just be a simple Zoom Room? Do they really need manual routing and all that?",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1774969974154039?thread_ts=1774969974.154039&cid=C04GF3S3KQF",
      },
    ],
    currentState: "Room operational. UI standardization session never happened.",
    cortneyAction: "Fold into the broader Tier 1/2/3 UCI standardization work.",
    steps: [
      "Document the existing IRV-802 UCI quirks (hidden projector controls)",
      "Add IRV-802 to the Tier 1/2/3 UCI standardization scope",
      "Expose projector + screen controls in the redesigned UCI",
      "Pilot the new UCI in IRV-802 before fleet rollout",
    ],
  },
  {
    id: "ip-drift",
    title: "IP Reservation / Switch Drift After Power Events",
    severity: "P2",
    category: "Network",
    rooms: ["SEA-3611", "SEA-3619", "SEA-3647", "SEA-3925"],
    status: "Workaround",
    owner: "Patrick (gone) → Cortney",
    summary:
      "After power outages, devices re-IP. Patrick built a daily IP schedule/switch validator script that catches drift. Tool ownership now in question.",
    rootCause:
      "Dante + control IP devices (Shure stuff) don't show on switch ARP table until reboot, so reservations get missed.",
    quotes: [
      {
        who: "Patrick Gilligan",
        when: "Nov 17, 2025 09:25 PT",
        text: "Lots offline after that power outage. We have another Dr appointment, at 10:40 (leaving at 10:10), but before and after, I am working on the sea-3619 devices, as the IP schedules/switch validator sees over 20 discrepancies....so not sure what happened there.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1763395507263589?thread_ts=1763395507.263589&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Nov 17, 2025 09:53 PT",
        text: "its not just that IP addresses didnt' get reserved. Its that a lot of IPs don't show up on the switch's arp table until after a reboot. This happens a lot when a device has a dante and control IP, like Shure stuff....so a lot of these 'missing' reservations weren't there until the power outage.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1763402385358079?thread_ts=1763395507.263589&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Nov 17, 2025 09:54 PT",
        text: "But in brighter news, I don't know of anyone else whose got a daily IP schedule/switch validator running.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1763402453580779?thread_ts=1763395507.263589&cid=C04GF3S3KQF",
      },
    ],
    currentState: "Validator runs daily. No documentation. No backup owner if it breaks.",
    cortneyAction: "Claim the validator codebase. Document it. Add it to runbook.",
    steps: [
      "Find the IP/switch validator repo (GitLab or CodeCommit)",
      "Get prod credentials / cron host access",
      "Run the validator manually end-to-end to confirm it works",
      "Document its inputs, outputs, dependencies, and known limitations",
      "Add a runbook entry for what to do when it alerts",
      "Set up a backup runner / failover plan",
    ],
  },
  {
    id: "dwb-adoption",
    title: "Digital Whiteboard Adoption",
    severity: "P3",
    category: "Other",
    rooms: ["Fleet-wide (SEA)"],
    status: "Open",
    owner: "Cultural — not engineering",
    summary:
      "Long-standing cultural issue: users continue using flip charts even in projector rooms. Mural, Figma, and Zoom Whiteboard all attempted. Now DWBs being repurposed for World Cup viewing.",
    rootCause: "Cultural, not technical.",
    quotes: [
      {
        who: "Matt Cornick",
        when: "Mar 31, 2026 09:50 PT",
        text: "I think 2026 is the year to push Zillow to use Zoom Digital Whiteboards instead of all of these giant white paper boards. I was asked to roll up the screen and turn off projectors in IRV-802 so they could do an some flip charts at the front of the room. It's kind of comical.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1774975817765419",
      },
      {
        who: "Stacey Newman",
        when: "Mar 31, 2026 09:56 PT",
        text: "We could never get people to adopt the digital whiteboarding... we had mural and figma and all those zoom whiteboards everywhere and no one uses it.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1774976167039129",
      },
    ],
    currentState: "DWBs being repurposed for World Cup pop-ups (June 11).",
    cortneyAction: "Not a Cortney problem to solve. Stay out of it.",
    steps: [
      "Monitor DWB performance during World Cup pop-up usage",
      "Don't propose anything DWB-strategy related — cultural, not engineering",
    ],
  },
  {
    id: "world-cup",
    title: "World Cup Pop-Up Rooms",
    severity: "P3",
    category: "Other",
    rooms: ["IRV", "SEA", "SFO", "DEN", "MEX"],
    status: "Open",
    owner: "Mark → Cortney (proposed PM)",
    summary:
      "E&B requesting 5 dedicated viewing + gaming rooms across 5 offices for 6 weeks starting June 11. Each room: DWB for streaming + PlayStation + Xbox. Only SEA-3619 is currently set up to display encrypted content.",
    rootCause: "Scope creep / event request.",
    quotes: [
      {
        who: "Mark Hampson",
        when: "May 6, 2026 07:54 PT",
        text: "E&B is asking us to set up dedicated viewing + gaming rooms at 5 offices — Irvine, Seattle, SF, Denver, and Mexico City and running for 6 weeks starting June 11.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778079292269789?thread_ts=1778079292.269789&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "May 6, 2026 09:50 PT",
        text: "Other than SEA-3619, there's no room setup to display encrypted content.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778083824499509?thread_ts=1778079292.269789&cid=C04GF3S3KQF",
      },
    ],
    currentState: "Rooms not locked. Console procurement TBD. MEX has no AV onsite.",
    cortneyAction:
      "Volunteer to PM the rollout. Confirm streaming service / HDCP requirements with E&B. Find remote hands in MEX.",
    steps: [
      "Volunteer to PM the World Cup rollout (tell Mark Monday)",
      "Lock specific rooms at IRV, SEA, SFO, DEN by mid-June",
      "Confirm streaming service + HDCP requirements with E&B",
      "Identify remote hands in Mexico City for 6-week support window",
      "Source PlayStations + Xboxes + fire sticks/Apple TVs",
      "Schedule physical install / test day at each site before June 11",
      "Verify DWB internal speakers meet audio expectation per location",
      "Build a daily check during World Cup window into alerts bot",
    ],
  },
];

export type WinTier = "Quick" | "Medium" | "Project";
export type WinTopic =
  | "Process"
  | "Audio"
  | "HDMI"
  | "UCI"
  | "Hardware"
  | "Zoom"
  | "Tooling"
  | "Architecture"
  | "Documentation"
  | "Vendor";

export interface QuickWin {
  id: string;
  title: string;
  tier: WinTier;
  topic: WinTopic;
  effort: "Low" | "Medium" | "High";
  visibility: "Low" | "Medium" | "High";
  estimatedTime: string;
  owner: string;
  notes: string;
}

export const QUICK_WINS: QuickWin[] = [
  // Quick wins — ≤ 4 hours
  {
    id: "qw1",
    title: "USB-C Adapter Standard SKU",
    tier: "Quick",
    topic: "HDMI",
    effort: "Low",
    visibility: "High",
    estimatedTime: "2–4 hours lab + procurement ask",
    owner: "Cortney",
    notes: "Test 3 part numbers in lab, lock in one, ship to every site. Mark loves it.",
  },
  {
    id: "qw2",
    title: "NV-21 SN/MAC Tracking Runbook in Jira",
    tier: "Quick",
    topic: "Process",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "2 hours doc + review",
    owner: "Cortney",
    notes: "Closes a process gap John already failed once. Mark loves it.",
  },
  {
    id: "qw3",
    title: "Take Over WAVE-16 with Zoom Support",
    tier: "Quick",
    topic: "Zoom",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "30 min handoff + ongoing follow-up",
    owner: "Cortney",
    notes: "Frees Matt. Demonstrates ownership of cross-vendor escalations.",
  },
  {
    id: "qw4",
    title: "Reopen WAVE-16 with May 16 IRV-1250 / IRV-1110 ZHL evidence",
    tier: "Quick",
    topic: "Zoom",
    effort: "Low",
    visibility: "High",
    estimatedTime: "30 min ticket update",
    owner: "Cortney",
    notes: "Today's alerts bot output is the ammunition. Shows ticket-hygiene rigor.",
  },
  {
    id: "qw5",
    title: "Document Zoom Whiteboard Companion Workaround",
    tier: "Quick",
    topic: "Zoom",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "1 hour runbook",
    owner: "Cortney",
    notes: "Add to internal runbook. List rooms in workaround state vs untouched.",
  },
  {
    id: "qw6",
    title: "Build a v6.6.10 'Stragglers' List from Zoom Admin",
    tier: "Quick",
    topic: "Zoom",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "1 hour query + sheet",
    owner: "Cortney",
    notes: "Feeds WAVE-16. Demonstrates proactive monitoring habit.",
  },
  {
    id: "qw7",
    title: "Document NV-21 PSU + Phoenix Block Sourcing",
    tier: "Quick",
    topic: "Hardware",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "1 hour doc",
    owner: "Cortney",
    notes: "Capture Phihong + Phoenix Contact part numbers + 90W PoE+ injector path from #av-team history.",
  },
  {
    id: "qw8",
    title: "Spare Parts Inventory Doc",
    tier: "Quick",
    topic: "Hardware",
    effort: "Low",
    visibility: "High",
    estimatedTime: "3 hours initial pass",
    owner: "Cortney",
    notes: "NV-21, NV-32, PSUs, Phoenix blocks, capture cards, UE1s. Living doc.",
  },
  {
    id: "qw9",
    title: "MXA920 vs TCC2 One-Pager for NYC-1204",
    tier: "Quick",
    topic: "Audio",
    effort: "Low",
    visibility: "High",
    estimatedTime: "3 hours doc",
    owner: "Cortney",
    notes: "Closes Mark's 8-month-old unanswered question.",
  },
  {
    id: "qw10",
    title: "Document SEA-3829 Dev Space TCC2 + Neat Reference Design",
    tier: "Quick",
    topic: "Architecture",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "2 hours w/ onsite verification",
    owner: "Cortney",
    notes: "Only production Neat + ceiling-mic coexistence at Zillow. Frame as precedent for Friday G62 pitch.",
  },
  {
    id: "qw11",
    title: "Pull Zoom Dashboard Audio Metrics for SEA-3647",
    tier: "Quick",
    topic: "Audio",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "1 hour data pull",
    owner: "Cortney",
    notes: "Last 30 days of calls. Quantifies the audio complaint Stacey raised May 15.",
  },
  {
    id: "qw12",
    title: "Audit Neat Bar Pro Fleet for Upside-Down Mounts",
    tier: "Quick",
    topic: "Hardware",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "Half day onsite (paired with other site visits)",
    owner: "Cortney",
    notes: "Aug 2025 issue. Cosmetic but risks cable damage. Coordinate patch+paint with Workplace.",
  },
  {
    id: "qw13",
    title: "Tag the 'No Source Selected' UCI Quirk on IRV-802 in Jira",
    tier: "Quick",
    topic: "UCI",
    effort: "Low",
    visibility: "Low",
    estimatedTime: "30 min ticket",
    owner: "Cortney",
    notes: "Matt + Mark wanted this redesigned in March. Make sure it doesn't get forgotten again.",
  },

  // Medium wins — 1–3 days
  {
    id: "qw14",
    title: "TCC2 Commissioning Pass — SEA-3925 (HVAC room)",
    tier: "Medium",
    topic: "Audio",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "1 day onsite + writeup",
    owner: "Cortney",
    notes: "No CapEx. Recovers Matt's 'almost unusable' room. Plants flag as audio engineer.",
  },
  {
    id: "qw15",
    title: "Source-Side EDID Forcing Lab Test",
    tier: "Medium",
    topic: "HDMI",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "1–2 days, ~$300 hardware",
    owner: "Cortney",
    notes: "Option D from /hdmi page. May resolve 60%+ of HDMI share issues without a fleet swap.",
  },
  {
    id: "qw16",
    title: "Direct USB Capture Path Lab Test",
    tier: "Medium",
    topic: "HDMI",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "1–2 days lab",
    owner: "Cortney",
    notes: "Option B from /hdmi page. Bypass VSI / NV entirely for Tier 1/2 rooms.",
  },
  {
    id: "qw17",
    title: "AVIO Dante-USB Bidirectional Bridge Test (Neat + Q-Sys)",
    tier: "Medium",
    topic: "Audio",
    effort: "Medium",
    visibility: "Medium",
    estimatedTime: "1–2 days lab",
    owner: "Cortney",
    notes: "Confirm Matt's Q-Sys → Neat one-way audio failure mode and whether AVIO solves it. Validates G62 pitch architecture.",
  },
  {
    id: "qw18",
    title: "Single-Page UCI Rollout — 3 Rooms After SEA-3647",
    tier: "Medium",
    topic: "UCI",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "2–3 days deploy + test",
    owner: "Cortney",
    notes: "Patrick deployed to 3647 March 2026. Continue to 3 more 'simpler rooms'. John already validated.",
  },
  {
    id: "qw19",
    title: "Patrick's Tooling Runbook (alerts bot + IP validator + UCIs)",
    tier: "Medium",
    topic: "Tooling",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "2–3 days docs + access",
    owner: "Cortney",
    notes: "Closes Patrick handoff gap. Earns Mark trust on operational continuity.",
  },
  {
    id: "qw20",
    title: "Add Scheduler Firmware Check to Daily Alerts Bot",
    tier: "Medium",
    topic: "Tooling",
    effort: "Medium",
    visibility: "Medium",
    estimatedTime: "1 day code + deploy",
    owner: "Cortney",
    notes: "Feeds WAVE-16. Patrick's alerts bot extension.",
  },
  {
    id: "qw21",
    title: "Q-Sys Max Concurrent Session Audit Across All Cores",
    tier: "Medium",
    topic: "UCI",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "1 day audit",
    owner: "Cortney",
    notes: "Matt found SEA-3647 + NYC-1202 set to 3. Audit and bump to 5 fleet-wide. Prevents UCI lockouts.",
  },
  {
    id: "qw22",
    title: "IRV-802 UCI Fix — Expose Projector/Screen Controls Properly",
    tier: "Medium",
    topic: "UCI",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "2 days Q-Sys Designer work",
    owner: "Cortney",
    notes: "Eliminate 'No source selected' hidden state Matt complained about Mar 31. Make controls discoverable.",
  },
  {
    id: "qw23",
    title: "World Cup Pop-Up Room Locking — 4 Sites",
    tier: "Medium",
    topic: "Process",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "3 days PM across sites",
    owner: "Cortney",
    notes: "IRV / SFO / DEN / MEX. Confirm streaming HDCP path. June 11 launch.",
  },
  {
    id: "qw24",
    title: "Memory Leak Audit on All Q-Sys Touch Panel Scripts",
    tier: "Medium",
    topic: "UCI",
    effort: "Medium",
    visibility: "Medium",
    estimatedTime: "2–3 days code review",
    owner: "Cortney",
    notes: "Patrick fixed core scripts June 2025 but flagged TP scripts as untouched. Recursion via Timer.CallAfter still suspect.",
  },

  // Project wins — 1–2 weeks
  {
    id: "qw25",
    title: "TCC2 Commissioning Sweep — SFO All Hands + SEA-3829",
    tier: "Project",
    topic: "Audio",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "1 week (3 sites + writeup)",
    owner: "Cortney",
    notes: "Extends QW14. Establishes audio engineering reputation across the fleet.",
  },
  {
    id: "qw26",
    title: "Tier 1/2/3 UCI Standards Strawman",
    tier: "Project",
    topic: "UCI",
    effort: "High",
    visibility: "High",
    estimatedTime: "1–2 weeks doc + Q-Sys file template",
    owner: "Cortney",
    notes:
      "Address Patrick's 'if no operator, no touch panel' thesis. Defines when a room gets a UCI vs raw Zoom controls.",
  },
  {
    id: "qw27",
    title: "Replace BirdDog P400 in SFO-735 (Pilot)",
    tier: "Project",
    topic: "Hardware",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "1 week procurement + 1 day install",
    owner: "Cortney + Matt",
    notes: "Panasonic AW-UE50 (white). Pilot before NYC-1250 rollout. /birddog page has full options.",
  },
  {
    id: "qw28",
    title: "VSI → Q-Sys NV Endpoint Migration Schedule",
    tier: "Project",
    topic: "HDMI",
    effort: "High",
    visibility: "High",
    estimatedTime: "1 week pricing + scheduling, multi-month rollout",
    owner: "Cortney",
    notes: "Decision made Apr 17 by Matt + Mark. Lab tests (QW15/16) inform whether all rooms need it.",
  },
  {
    id: "qw29",
    title: "Mac Mini Operational-Cost Brief (ticket-hours/yr)",
    tier: "Project",
    topic: "Architecture",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "1 week data pull + writeup",
    owner: "Cortney",
    notes: "Backbone of the Tuesday G62 / Q-Sys Connect Windows-only debate. Don't pitch without this data.",
  },
  {
    id: "qw30",
    title: "India Buildout — Engineer of Record on One Room",
    tier: "Project",
    topic: "Architecture",
    effort: "High",
    visibility: "High",
    estimatedTime: "Multi-week, paced w/ build",
    owner: "Cortney",
    notes: "First solo end-to-end project. Stacey's pet initiative. Strong career investment.",
  },
  // ---------- POST-PLAYBOOK WINS (qw31-qw42) ----------
  {
    id: "qw31",
    title: "Re-key Patrick's Lambdas to a Service Account (with Matt watching)",
    tier: "Quick",
    topic: "Tooling",
    effort: "Low",
    visibility: "High",
    estimatedTime: "60-min screenshare with Matt",
    owner: "Cortney",
    notes:
      "The day-1 alerting-failed problem Matt is carrying. Drive AWS console, narrate in plain English, make Matt 2nd-in-line owner. He sends the green-circle Monday update so HE gets the credit.",
  },
  {
    id: "qw32",
    title: "GitLab Notification + AWS SNS + Splunk Recipient Audit (the 'Member vs Owner' trap)",
    tier: "Quick",
    topic: "Tooling",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "3–4 hours audit + one-pager",
    owner: "Cortney",
    notes:
      "Patrick discovered Matt was a GitLab 'Member' not 'Owner' so he wasn't getting pipeline-failure emails. Same trap likely exists across AWS SNS / Splunk / Domotz. Audit + before/after table. Email to team — Matt forwards to Stacey unprompted.",
  },
  {
    id: "qw33",
    title: "EDID + USB-Capture Lab Bench-Test (before HDMI/NV capex)",
    tier: "Medium",
    topic: "HDMI",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "2 weeks lab, ~$500 test gear",
    owner: "Cortney",
    notes:
      "The capex-hygiene win. $500 of Lightware EDID Lock + Inogeni/Magewell USB capture in the lab before Mark POs $20k+ of Q-Sys NV. Doesn't reopen the decision — runs parallel data so we size the right NV investment. See /hdmi for full proposal + Matt-rebuttal talking points.",
  },
  {
    id: "qw34",
    title: "IRV-802 Hidden-Controls Fix + Demo to Matt and Mark Together",
    tier: "Medium",
    topic: "UCI",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "Half-day in Designer + demo",
    owner: "Cortney",
    notes:
      "Re-add projector + screen controls under a visible settings tab. Demo WITH Matt so HE owns the explanation to John. Closes a Patrick eye-roll item that's been festering.",
  },
  {
    id: "qw35",
    title: "One-Pager Per Lambda (the Patrick-promised Monitoring Runbook)",
    tier: "Project",
    topic: "Documentation",
    effort: "High",
    visibility: "High",
    estimatedTime: "2–3 weeks, ship by day 30",
    owner: "Cortney",
    notes:
      "Stacey's annual 'operational excellence' goal that Patrick never shipped. Cursor + Claude translate code into plain English. Each Lambda gets: what triggers, where logs go, how to silence, how to debug, owner. Ship before any new initiative.",
  },
  {
    id: "qw36",
    title: "Cursor Pairing Session with Matt (one tiny demo, <20 min)",
    tier: "Quick",
    topic: "Tooling",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "20–30 min on a tiny Slack ask Matt mentioned",
    owner: "Cortney",
    notes:
      "Mark is already doing 'Claude testing.' Matt is NOT — he's the most threatened by code becoming a black box. Pick a tiny ask, open Cursor with him watching, narrate, ship in <20 min. Demystifies the AI tooling.",
  },
  {
    id: "qw37",
    title: "Solve NYC-1250 Memory-Leak Mystery (the open dragon)",
    tier: "Project",
    topic: "Architecture",
    effort: "High",
    visibility: "High",
    estimatedTime: "Multi-week, paced with Splunk dashboard data",
    owner: "Cortney",
    notes:
      "Patrick's open investigation. Diff against clean sibling NYC-1227 line-by-line. Watch both rooms in the memory-examination dashboard for a week. Closing this is the trump card for FTE conversion.",
  },
  {
    id: "qw38",
    title: "Mac-Mini vs Q-Sys-Connect-Windows Decision Memo",
    tier: "Medium",
    topic: "Architecture",
    effort: "Medium",
    visibility: "High",
    estimatedTime: "1–2 days writing + circulation",
    owner: "Cortney",
    notes:
      "Patrick's 4-year unforced loss. One-page memo: status quo cost, roadmap conflict, proposed pilot (one room, Windows appliance), success criteria, decision needed by date. To Matt + Mark + Stacey. Whichever way it goes, FORCING the decision is the FTE-level move.",
  },
  {
    id: "qw39",
    title: "SFO All Hands Rebuild as BirdDog → NV Conversion (two birds)",
    tier: "Project",
    topic: "Architecture",
    effort: "High",
    visibility: "High",
    estimatedTime: "Multi-week, paced with capex window",
    owner: "Cortney",
    notes:
      "Patrick's stated next priority. Leaks memory + uses BirdDog for cameras only (not transport). Rebuild AND swap BirdDog for NV camera transport in one project. See /sites/sfo + /birddog.",
  },
  {
    id: "qw40",
    title: "TP-Script Memory-Leak Sweep (8 rooms Patrick left)",
    tier: "Medium",
    topic: "Architecture",
    effort: "Medium",
    visibility: "Medium",
    estimatedTime: "1–2 weeks, 8 rooms",
    owner: "Cortney",
    notes:
      "Patrick explicitly said: 'I hadn't thought of the touch panel scripts, for the larger rooms.' Apply the same Lua refactor patterns to TP scripts in SEA-3611/3619/3925, IRV-1249/1250/851, SFO-735/726.",
  },
  {
    id: "qw41",
    title: "Q-Sys Lua Style Guide (the 5 bad patterns documented)",
    tier: "Quick",
    topic: "Documentation",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "2–3 hours",
    owner: "Cortney",
    notes:
      "Capture the 5 Lua patterns Patrick learned from QSC community: closures capturing controls, self-re-registering timers, re-bound event handlers, string concat in loops, unbounded table inserts in coroutines. Plus the safe replacements. Live in GitLab + linked from /splunk.",
  },
  {
    id: "qw42",
    title: "iPad / Scheduler Low-Battery Webhook → Slack (Matt's open ask)",
    tier: "Quick",
    topic: "Tooling",
    effort: "Low",
    visibility: "Medium",
    estimatedTime: "4–6 hours with Cursor",
    owner: "Cortney",
    notes:
      "Matt has flagged dead-iPad-at-SFO-07 multiple times: 'easy lift that I've seen done at other sites.' Patrick acknowledged and never shipped. AI-author the Lambda; route to #av-alerts. Closes a Matt ask without any code review drama.",
  },
];

// =========================================================================
// STEP DETAILS — small summary + links for each tracker action step.
// Keyed by `${issueId}::${stepIndex}`. The tracker page merges these at
// render time. Keeps `steps: string[]` backward-compatible.
// =========================================================================

export interface StepLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface StepDetail {
  summary: string;
  links?: StepLink[];
}

export const STEP_DETAILS: Record<string, StepDetail> = {
  // ---- hdmi-share ----
  "hdmi-share::0": {
    summary:
      "Email Scott at QSC and get the official NV-21 + NV-32 endpoint pricing in writing. Without a real quote you can't size the capex case Mark needs.",
    links: [
      { label: "QSC NV-21 product page", href: "https://www.qsys.com/products-solutions/q-sys/peripherals/network-video/", external: true },
      { label: "/nv-fleet — current NV inventory", href: "/nv-fleet" },
    ],
  },
  "hdmi-share::1": {
    summary:
      "Audit every conference room and flag every VSI encoder/decoder still in service. This is the denominator for the capex argument: 5 rooms vs. 50 rooms is a 10x difference in the PO.",
    links: [
      { label: "/sites — rooms by office", href: "/sites" },
      { label: "/glossary — VSI definition", href: "/glossary#vsi" },
    ],
  },
  "hdmi-share::2": {
    summary:
      "Drop the one-line pitch in the Tuesday sync. Frame as 'parallel data-gathering' that Matt can veto cheaply, not as 'reopening the decision.'",
    links: [
      { label: "/hdmi#lab-proposal — full pitch + Matt-rebuttal flow", href: "/hdmi#lab-proposal" },
      { label: "/glossary — CapEx vs OpEx", href: "/glossary#capex" },
    ],
  },
  "hdmi-share::3": {
    summary:
      "Plug a Lightware EDID Lock between source and encoder in the lab. Force a known-good EDID profile. If a $100 box stops handshake drama, NV may not be needed at all.",
    links: [
      { label: "Lightware EDID Lock product", href: "https://lightware.com/edid-manager", external: true },
      { label: "/glossary — EDID", href: "/glossary#edid" },
      { label: "/hdmi#lab-proposal — pass/fail criteria", href: "/hdmi#lab-proposal" },
    ],
  },
  "hdmi-share::4": {
    summary:
      "Inogeni / Magewell convert HDMI → USB. Plug straight into the Mac Mini and feed Zoom natively, bypassing the AV switch. Diagnostic gold even if you end up buying NV.",
    links: [
      { label: "Inogeni Share2", href: "https://inogeni.com/product/share2/", external: true },
      { label: "Magewell USB Capture Plus HDMI", href: "https://www.magewell.com/products/usb-capture-hdmi-plus", external: true },
    ],
  },
  "hdmi-share::5": {
    summary:
      "Lock success criteria BEFORE you start the test. Otherwise the result becomes a Rorschach test that everyone reads differently. Format on /hdmi.",
    links: [{ label: "/hdmi#lab-proposal — pre-defined pass/fail", href: "/hdmi#lab-proposal" }],
  },
  "hdmi-share::6": {
    summary:
      "Parallel quick win — pick one USB-C → HDMI adapter SKU after testing 3 candidates and lock it in. Closes a fleet-wide BYO-laptop pain point Mark loves.",
    links: [{ label: "qw1 — USB-C standard SKU win", href: "/quick-wins" }],
  },
  "hdmi-share::7": {
    summary:
      "Write up findings as dollar cost per option × fleet size. Bring it as a recommendation, not a debate. Two pages max.",
  },
  "hdmi-share::8": {
    summary:
      "Tie the swap-out to existing site visit cadence so the team doesn't have to schedule extra travel. Matt + John are already on-site for other work.",
  },

  // ---- zoom-whiteboard ----
  "zoom-whiteboard::0": {
    summary:
      "Matt currently owns the Zoom Support ticket. Ask him to transfer to you so you can drive the cadence — frees Matt up, signals you're owning monitoring escalations.",
  },
  "zoom-whiteboard::1": {
    summary:
      "Use the Zoom Admin Dashboard to pull every Zoom Room with a paired companion device (Neat Center, Neat Board, Whiteboard tablet). That's your exposure list.",
    links: [
      { label: "Zoom Admin → Rooms", href: "https://zoom.us/account/room", external: true },
    ],
  },
  "zoom-whiteboard::2": {
    summary:
      "Walk each affected room and confirm whether the documented workaround has been applied. Don't assume — the SFO and IRV teams sometimes diverge from the runbook.",
  },
  "zoom-whiteboard::3": {
    summary:
      "Write the workaround in plain English in GitLab. Patrick's habit was to leave runbooks 'in his head' — fix that. This is part of the foundation-lift mandate.",
    links: [
      { label: "/patrick-audit — foundation gaps", href: "/patrick-audit" },
      { label: "GitLab (av-ops-tools)", href: "https://gitlab.zgtools.net/core-tech/unified-communications/av/av-ops-tools/", external: true },
    ],
  },
  "zoom-whiteboard::4": {
    summary:
      "Weekly cadence — even one-liner emails. Zoom Support escalates faster when the ticket is touched regularly. Calendar reminder Mondays.",
  },
  "zoom-whiteboard::5": {
    summary:
      "Add a Splunk detection rule for Whiteboard error events. Match the noise-vs-signal pattern Patrick built — Splunk first, Slack only if a reaction is expected.",
    links: [
      { label: "/splunk — pipeline + add-alert checklist", href: "/splunk" },
    ],
  },

  // ---- sea-3647-audio ----
  "sea-3647-audio::0": {
    summary:
      "Lock 30 min onsite at SEA-3647 with Shelby or John. They have building access and can sit in the room while you run the test from your laptop.",
  },
  "sea-3647-audio::1": {
    summary:
      "Open the SEA-3647 Q-Sys file in Designer and confirm every MXA910 mic isn't muted at the DSP level, and Dante routing matches the documented signal flow.",
    links: [
      { label: "/glossary — MXA910/920", href: "/glossary#mxa910-mxa920" },
      { label: "/glossary — Dante", href: "/glossary#dante" },
    ],
  },
  "sea-3647-audio::2": {
    summary:
      "Walk the room talking at normal + quiet volume from 4 corners and the center. Tests pickup uniformity AND gate-threshold tuning. Most 'mic doesn't pick me up' issues are gate tuning, not hardware.",
  },
  "sea-3647-audio::3": {
    summary:
      "Pull the last 30 days of Zoom Dashboard audio analytics for SEA-3647. Look for echo-cancellation events, dropped audio, low-volume warnings.",
    links: [{ label: "Zoom Admin → Dashboard", href: "https://zoom.us/account/dashboard", external: true }],
  },
  "sea-3647-audio::4": {
    summary:
      "Sep 2025 echo issue might have been a one-off or a recurring root cause. Search #av-team for SEA-3647 echo references; if no documented RCA, write one.",
    links: [{ label: "Patrick's IRV RCA template", href: "https://docs.google.com/document/d/1DLhhQMdnv-dENGATLbzBWYi33mXc35bm6kPOyWg9ntA/edit", external: true }],
  },
  "sea-3647-audio::5": {
    summary:
      "Open a Jira ticket on the WAVE board with the root cause and the specific Q-Sys / Dante / MXA setting changed. Future-you (and Matt) will thank past-you.",
  },
  "sea-3647-audio::6": {
    summary:
      "Three options: (a) tune the existing 910s harder, (b) swap to MXA920 with auto-steer, (c) pull a TCC2 from spares. Recommendation based on dimensions + budget.",
    links: [{ label: "/glossary — TCC2 vs MXA920", href: "/glossary#mxa910-mxa920" }],
  },
  "sea-3647-audio::7": {
    summary:
      "Update Stacey via the Friday wins/challenges email. Tie the fix to a fleet-wide ceiling-mic strategy doc so it lands as 'operational excellence' not just one room.",
    links: [{ label: "/playbook — Friday wins discipline", href: "/playbook#friday-wins-discipline" }],
  },

  // ---- mac-mini ----
  "mac-mini::0": {
    summary:
      "Patrick + Matt have a Mac Mini reference design that's been the standard for years. Walk it with Matt before proposing any alternative — show respect for the existing investment.",
    links: [{ label: "/mac-mini — architectural review", href: "/mac-mini" }],
  },
  "mac-mini::1": {
    summary:
      "Find out exactly how Macs get updated today: Jamf push, AV-team manual cadence, CE (Corp Engineering) ownership, or some hybrid. The answer determines whether the team can BLOCK Sequoia.",
  },
  "mac-mini::2": {
    summary:
      "Use the WAVE board + Jira history to tally ticket hours spent on Mac-OS-driven room failures (auto-updates, Apple ID prompts, kernel panics). Dollarize it as 'ops cost per year.' That's the capex-vs-opex framing for the Mac→Windows pitch.",
    links: [{ label: "/glossary — OpEx", href: "/glossary#opex" }],
  },
  "mac-mini::3": {
    summary:
      "Ask Matt directly what would convince him a Windows appliance pilot is worth running. Get his criteria in writing — it disarms the 'we already decided on Mac' objection.",
    links: [{ label: "/playbook — Mac-vs-Windows memo", href: "/playbook#mac-vs-windows-memo" }],
  },
  "mac-mini::4": {
    summary:
      "Zillow IT defaults to Mac-only. Mark knows the exception path. File a proper exception request for one Windows AV appliance in one room as a pilot.",
  },
  "mac-mini::5": {
    summary:
      "Confirm: does the new Q-Sys Connect for Zoom Rooms platform have ANY Mac support on the roadmap? If not, the Mac standard is on borrowed time regardless. Ask Scott at QSC.",
    links: [
      { label: "Q-Sys Connect for ZR", href: "https://www.qsys.com/products-solutions/q-sys/peripherals/q-sys-connect/", external: true },
    ],
  },
  "mac-mini::6": {
    summary:
      "Andrew Spokes (Zillow IT) controls macOS rollout cadence. Identify the gate where he'd push Sequoia to all Macs and pre-test in the lab BEFORE it hits production rooms.",
  },
  "mac-mini::7": {
    summary:
      "By day 90 — one-page brief with data: status quo cost, roadmap conflict, pilot proposal, success criteria, decision date. To Matt + Mark + Stacey. The trump card for FTE.",
    links: [{ label: "/playbook — FTE ask", href: "/playbook" }],
  },

  // ---- scheduler-offline ----
  "scheduler-offline::0": {
    summary:
      "WAV-16 was closed prematurely. Reopen with the May 16, 2026 IRV-1250/IRV-1110 evidence — the same failure mode is still happening, so the close was wrong.",
    links: [{ label: "/issues/scheduler-offline — full evidence", href: "/issues/scheduler-offline" }],
  },
  "scheduler-offline::1": {
    summary:
      "Matt is the current ticket owner. Ask him to transfer + share his last touchpoint with Zoom Support so you don't repeat their last debug request.",
  },
  "scheduler-offline::2": {
    summary:
      "Zoom Admin shows firmware per device. Pull a CSV of every scheduler + current firmware version. Group by version — that's your stragglers list.",
    links: [{ label: "Zoom Admin → Devices", href: "https://zoom.us/account/devices", external: true }],
  },
  "scheduler-offline::3": {
    summary:
      "Anyone still on v6.6.10 is the at-risk cohort. Flag them for proactive firmware push before they fail in a calendar-visible way.",
  },
  "scheduler-offline::4": {
    summary:
      "Add a daily Splunk check: scheduler offline AND firmware version. Same re-poll pattern Patrick used for Reflect — confirm offline before alerting.",
    links: [{ label: "/splunk — re-poll pattern", href: "/splunk" }],
  },
  "scheduler-offline::5": {
    summary:
      "Document the panel-reboot workaround in a one-page runbook. Make sure John (SEA) and Adali (IRV) can both run it from the doc without calling you.",
  },
  "scheduler-offline::6": {
    summary:
      "Two open sub-findings: rooms with TWO schedulers where only one shows online, and pads stuck on the 'upgrading' screen. Each needs its own resolution path.",
  },
  "scheduler-offline::7": {
    summary:
      "Weekly Zoom Support email. Even a one-liner. Tickets without cadence get deprioritized fast.",
  },

  // ---- neat-mic-coverage ----
  "neat-mic-coverage::0": {
    summary:
      "SEA-3829 already runs TCC2 + Neat Pad cleanly. Document the signal flow with screenshots — that's your Tier 2 reference design for everyone else.",
    links: [{ label: "/sites/sea — SEA-3829 Dev Space", href: "/sites/sea" }],
  },
  "neat-mic-coverage::1": {
    summary:
      "AVIO USB lets the Neat Bar Pro 'speak Dante.' Test on the bench with a Q-Sys Core before pitching to Mark — proves the bidirectional audio flow actually works.",
    links: [{ label: "/glossary — AVIO", href: "/glossary#avio" }, { label: "Shure AVIO USB", href: "https://www.shure.com/en-US/microphones/avio-usb", external: true }],
  },
  "neat-mic-coverage::2": {
    summary:
      "Matt tested SOMETHING that failed previously. Confirm what — AVIO or P300 — so you don't repeat his exact failure mode. Could be a P300 routing config issue, not an AVIO problem.",
  },
  "neat-mic-coverage::3": {
    summary:
      "Walk IRV-825, Jeremy Hofmann's office, and zRetreat rooms. Note where coverage is weak. Build the evidence file before recommending hardware spend.",
    links: [{ label: "/sites/zretreat", href: "/sites/zretreat" }],
  },
  "neat-mic-coverage::4": {
    summary:
      "If AVIO + ceiling mic works, write it up as a Tier 2 → Tier 3 upgrade path so the team has a documented playbook. Closes the loop on Mark's Feb 2025 question.",
  },
  "neat-mic-coverage::5": {
    summary:
      "Bring the recommendation to the next AV sync. Mark has been waiting on this answer for over a year — first person to give him a definitive 'yes here's how' wins.",
  },

  // ---- neat-install-quality ----
  "neat-install-quality::0": {
    summary:
      "Inventory every Neat Bar Pro in the fleet with current mount orientation (right-side up or upside-down). Photos preferred.",
  },
  "neat-install-quality::1": {
    summary:
      "Some have already been flipped, some haven't. The two cohorts need different remediation plans (touch-up vs full re-mount).",
  },
  "neat-install-quality::2": {
    summary:
      "Coordinate with Zillow Workplace (the real-estate / facilities team) for patch + paint. Don't try to do the wall work yourself — it's not in the AV swim lane.",
  },
  "neat-install-quality::3": {
    summary:
      "Update the install runbook so this never happens again. Add a 'mount orientation' explicit step + a photo example. Hand to the next AV vendor that mounts.",
  },

  // ---- ui-standardization ----
  "ui-standardization::0": {
    summary:
      "Patrick's single-page UCI source lives in GitLab. Pull it locally, run it in Designer. This is the foundation of everything UCI-related.",
    links: [
      { label: "GitLab (qsys-dev)", href: "https://gitlab.zgtools.net/core-tech/unified-communications/av/qsys-dev/", external: true },
      { label: "/uci — half-standards", href: "/uci" },
    ],
  },
  "ui-standardization::1": {
    summary:
      "For every custom Q-Sys plugin: is it community-sourced from the QSC Discord, or did Patrick write it? License + support contact per plugin.",
    links: [{ label: "/uci#patricks-half-standards", href: "/uci" }],
  },
  "ui-standardization::2": {
    summary:
      "Walk every room or pull every UCI file. Classify by Tier 1 (huddle), Tier 2 (default), Tier 3 (event / multi-display). Strawman, not gospel.",
  },
  "ui-standardization::3": {
    summary:
      "Write a Tier 1/2/3 standards doc. Length: 3 pages max. Show the WHAT, the WHY, and the cost-to-deviate. Mark loves standardization docs.",
  },
  "ui-standardization::4": {
    summary:
      "Send to Matt + Mark for feedback before pitching to Stacey. 'Strawman' framing invites edits without ego.",
  },
  "ui-standardization::5": {
    summary:
      "Pilot Tier 1 (the SEA-3647 single-page UCI) in one additional room. Pick a low-traffic room so a regression doesn't block a meeting.",
  },
  "ui-standardization::6": {
    summary:
      "IRV-802 is the canonical broken-UCI example. Re-add projector + screen controls under a visible settings tab. Demo to Matt + Mark together.",
    links: [{ label: "/sites/irvine", href: "/sites/irvine" }],
  },
  "ui-standardization::7": {
    summary:
      "Roll out approved standards site-by-site as part of existing site-visit cadence. No extra travel needed.",
  },

  // ---- nv21-tracking ----
  "nv21-tracking::0": {
    summary:
      "When NV-21 hardware gets swapped, the onsite team needs a 30-second runbook for capturing SN + MAC into Jira. Patrick + Matt tried to eliminate clerical fields — this is the minimum that survived.",
  },
  "nv21-tracking::1": {
    summary:
      "Build a Jira ticket template with SN, MAC, IP, room, install date, replaced-because reason. Mark approves the template.",
  },
  "nv21-tracking::2": {
    summary:
      "Mark is the IP-doc owner — he has to sign off. Frame as 'closing a process gap' not 'adding paperwork.'",
  },
  "nv21-tracking::3": {
    summary:
      "John (SEA) and Adali (IRV) are the onsite teams who'll fill the template. Their buy-in determines whether it actually gets used.",
  },
  "nv21-tracking::4": {
    summary:
      "Spare parts inventory doc — count of NV-21s, NV-32s, PSUs, Phoenix blocks, capture cards, UE1s. Track per site. This goes into the foundation-lift runbook.",
    links: [{ label: "/nv-fleet — current spares", href: "/nv-fleet" }],
  },
  "nv21-tracking::5": {
    summary:
      "NV-21 PSU + Phoenix block — sourcing isn't obvious. Document the Phihong / Digikey path so the next person doesn't re-discover it.",
  },
  "nv21-tracking::6": {
    summary:
      "Add a 'physical location' column to the inventory doc. Matt's current stash is in the SFO 10th floor — that needs to be findable by someone who isn't Matt.",
  },

  // ---- mxa-strategy ----
  "mxa-strategy::0": {
    summary:
      "NYC-1204 dimensions + ceiling height determine which mic platform makes sense. Confirm before recommending TCC2 vs MXA920. Mark may have it on file.",
  },
  "mxa-strategy::1": {
    summary:
      "Count actual TCC2 spare inventory: SFO 10th floor, Matt's stash, SEA-3925. You need the real number to decide whether to consolidate on Sennheiser or split platforms.",
  },
  "mxa-strategy::2": {
    summary:
      "One-pager comparison: pickup pattern, auto-steer behavior, commissioning labor, $ per room, support availability. Length: 1 page. Mark will read 1 page.",
  },
  "mxa-strategy::3": {
    summary:
      "Add a 'commissioning labor' row — that's the no-tuning pattern Mark + Matt keep hitting. TCC2 needs in-room tuning to perform; MXA920 auto-steers. Real labor cost difference.",
  },
  "mxa-strategy::4": {
    summary:
      "Recommendation: Shure consolidation, Sennheiser consolidation, or mixed by room type. Don't sit on the fence — pick one.",
  },
  "mxa-strategy::5": {
    summary:
      "Bring to the next WAVE sync. Don't bring it in #av-team first — let Mark + Matt see it in the meeting where decisions actually get made.",
  },
  "mxa-strategy::6": {
    summary:
      "TCC2 commissioning sweep: SEA-3925 first (HVAC issue documented), then SFO All Hands (big visibility), then SEA-3829. Plumber's pattern — fix what's leaking loudest first.",
  },
  "mxa-strategy::7": {
    summary:
      "If we end up consolidating on a single platform, the MXA910 fleet is on borrowed time. Put a 2027 AOP (Annual Operating Plan) item in the queue now.",
  },

  // ---- usb-c-adapters ----
  "usb-c-adapters::0": {
    summary:
      "Buy 3 candidate USB-C → HDMI adapter SKUs (different chipsets). Anker, StarTech, Apple are the safest starting candidates.",
  },
  "usb-c-adapters::1": {
    summary:
      "Test on Mac (the Mac Mini host case), PC (BYOD laptops), and iPad (some users tether iPads). Test against current AV switch capture cards.",
  },
  "usb-c-adapters::2": {
    summary:
      "Score adapters on EDID stability (does the source see a consistent profile?), audio passthrough (some adapters drop audio), and hot-plug behavior (re-handshake on unplug).",
    links: [{ label: "/glossary — EDID", href: "/glossary#edid" }],
  },
  "usb-c-adapters::3": {
    summary:
      "Pick the winner. Write the part number in the runbook. Be specific — 'Anker 332' isn't enough; record the exact SKU because Anker revs silently.",
  },
  "usb-c-adapters::4": {
    summary:
      "Mark places the bulk order. Spread the SKU across all sites so a roving meeting attendee can grab one from any AV cabinet.",
  },
  "usb-c-adapters::5": {
    summary:
      "Ship to SEA, SFO, IRV, NYC, DEN, MEX. Use existing site cadence — Matt is in SEA most days, John is onsite. Coordinate with each site lead.",
  },
  "usb-c-adapters::6": {
    summary:
      "Lock the SKU + part number in the public AV runbook. Tag it as 'do not deviate' — every adapter swap reopens the EDID risk.",
  },

  // ---- irv-802-projector ----
  "irv-802-projector::0": {
    summary:
      "Document the quirks: projector + screen controls hidden behind 'No source selected' gating. Matt rolled screens manually from QDS. Write it down so the fix has a baseline.",
    links: [{ label: "/sites/irvine — IRV-802", href: "/sites/irvine" }],
  },
  "irv-802-projector::1": {
    summary:
      "IRV-802 is the canonical multi-display room. It belongs in the Tier 1/2/3 standardization scope so the fix isn't a one-off.",
  },
  "irv-802-projector::2": {
    summary:
      "Re-add projector + screen controls under a visible settings tab (long-press or PIN if Mark wants gating). This is the foundation fix to Patrick's 'hide it' pattern.",
  },
  "irv-802-projector::3": {
    summary:
      "Pilot the new UCI in IRV-802 with Matt watching. Demo to Mark before fleet rollout. Matt explains it to John himself.",
    links: [{ label: "/playbook — credit Matt publicly", href: "/playbook#matt-credit-pattern" }],
  },

  // ---- ip-drift ----
  "ip-drift::0": {
    summary:
      "Patrick wrote an IP/switch validator that ran on a cron. Find the repo — probably in GitLab av-ops-tools. May also be in legacy CodeCommit.",
    links: [
      { label: "GitLab av-ops-tools", href: "https://gitlab.zgtools.net/core-tech/unified-communications/av/av-ops-tools/", external: true },
    ],
  },
  "ip-drift::1": {
    summary:
      "Get prod credentials + the cron host. If the cron ran under Patrick's identity, it may have died on his deactivation. Same blast-radius pattern as the Lambdas.",
    links: [{ label: "/patrick-audit — deactivation blast radius", href: "/patrick-audit" }],
  },
  "ip-drift::2": {
    summary:
      "Run the validator end-to-end manually. Confirm it still works post-Patrick. If broken, log the failure mode before debugging.",
  },
  "ip-drift::3": {
    summary:
      "One-page runbook: inputs (switch credentials, IP doc), outputs (CSV / Slack alert), dependencies (Python? Node?), known limitations.",
  },
  "ip-drift::4": {
    summary:
      "When the validator alerts, what does the on-call do? Right now it goes silently dark. Document the response procedure so Matt + John can act on it without calling you.",
  },
  "ip-drift::5": {
    summary:
      "Failover plan — if the cron host dies, where does it run next? Service-account ownership so a single human's offboarding can't kill it again.",
  },

  // ---- dwb-adoption ----
  "dwb-adoption::0": {
    summary:
      "Watch DWB (Digital Whiteboard) usage during World Cup pop-up rooms. Lots of organic traffic = real data on whether DWB is adopted or just installed.",
  },
  "dwb-adoption::1": {
    summary:
      "DWB adoption is a cultural / org-behavior thing, not an engineering thing. Don't propose changes — observe and report. Save engineering capital for problems that have engineering solutions.",
  },

  // ---- world-cup ----
  "world-cup::0": {
    summary:
      "Tell Mark Monday. World Cup pop-up at multiple sites is a high-visibility project with a hard deadline. PM-ing it = max visibility in front of Stacey.",
    links: [{ label: "/playbook — Friday wins", href: "/playbook#friday-wins-discipline" }],
  },
  "world-cup::1": {
    summary:
      "Specific rooms at IRV, SEA, SFO, DEN need to be picked. Constraints: occupancy, display quality, ambient light, food-and-beverage policy. Lock by mid-June.",
  },
  "world-cup::2": {
    summary:
      "Streaming service (Peacock / FOX / Telemundo) + HDCP requirements. Some streaming services REQUIRE end-to-end HDCP — old AV switches will fail. Confirm with E&B (Events & Brand).",
    links: [{ label: "/glossary — HDCP", href: "/glossary#hdcp" }],
  },
  "world-cup::3": {
    summary:
      "Mexico City — Zillow has presence but no full-time AV staff. Find a remote hands contract for the 6-week window. Mark may have a vendor.",
  },
  "world-cup::4": {
    summary:
      "Some matches stream via console-native apps. PlayStation + Xbox + Fire Stick + Apple TV — pick one per room to standardize remote support.",
  },
  "world-cup::5": {
    summary:
      "Hard deadline: physical install + test day at each site before June 11 kickoff. Bake in time for HDCP / EDID / audio routing issues — they will appear.",
  },
  "world-cup::6": {
    summary:
      "DWB built-in speakers are NOT loud enough for a 30-person watch party. Verify audio expectation per location and pull in a portable PA if needed.",
  },
  "world-cup::7": {
    summary:
      "Daily Splunk check during the World Cup window: every pop-up room is online, displays are awake, audio is routed. Goes to #av-alerts if anything drifts.",
    links: [{ label: "/splunk — pipeline", href: "/splunk" }],
  },
};

// =========================================================================
// GLOSSARY — every acronym / industry term that shows up in #av-team or
// in this site. So you can pull up a definition mid-conversation without
// asking Matt "what's capex?"
// =========================================================================

export interface GlossaryTerm {
  term: string;
  category: "Finance" | "AV hardware" | "AV software" | "Network" | "Process" | "Audio" | "Video";
  short: string;
  long: string;
  whyItMattersToCortney?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "CapEx",
    category: "Finance",
    short: "Capital Expenditure — big-ticket gear purchases that go on the balance sheet and depreciate over years.",
    long: "Things like Q-Sys NV endpoints, racks, cameras, Cores, AV switches, BirdDog cameras. Requires a PO, budget approval, often Mark + Stacey + Zillow Finance sign-off. Capitalized on the balance sheet and depreciated typically over 3–5 years.",
    whyItMattersToCortney:
      "When you propose 'lab-test before committing capex,' you're saying spend $500 in test gear before Mark issues a $20k+ PO. Mark is allergic to wasted capex; Stacey owns operational excellence — this framing wins both.",
  },
  {
    term: "OpEx",
    category: "Finance",
    short: "Operating Expenditure — ongoing costs that hit the P&L every month.",
    long: "AWS bills (~$250/mo for the Q-Sys Designer VM), Splunk Cloud license, Domotz subscription, your contractor labor. Doesn't require capex approval but does show up in monthly budget reviews.",
    whyItMattersToCortney:
      "Your contractor pay is OpEx. FTE conversion moves you from OpEx contractor line to FTE headcount — which is a different budget category Stacey has to fight for separately.",
  },
  {
    term: "PO",
    category: "Finance",
    short: "Purchase Order — the document Mark issues to buy capex.",
    long: "Approval flow: spec → vendor quote → Mark builds PO → Zillow Procurement / Finance approval → vendor ships → receiving + asset tagging.",
  },
  {
    term: "BOM",
    category: "Process",
    short: "Bill of Materials — the per-room gear list with part numbers and quantities.",
    long: "Every new buildout needs a BOM. Mark is the BOM owner; he asked Stacey to share the India BOMs with you, so you can read + comment on real production specs.",
    whyItMattersToCortney:
      "Mark's standup Aug 2024: 'AI Hackathon task - Automate BOM creation (roughly 2 - 6 hours).' He's already automating BOM generation. Land on that team.",
  },
  {
    term: "EDID",
    category: "Video",
    short: "Extended Display Identification Data — the handshake protocol between an HDMI source and an HDMI sink.",
    long: "When you plug a laptop into a TV/encoder/projector, the SINK tells the SOURCE what resolutions, refresh rates, color depths, and audio formats it supports. The source picks one and starts sending. If the EDID is malformed, blocked, or 'lost' on a long cable run, you get black screen, dropped audio, or 'no signal.' Most fleet-wide HDMI failures trace back to EDID handshake drama, not the cables or the encoders themselves.",
    whyItMattersToCortney:
      "EDID forcing (Lightware EDID Lock, ~$100) sits between source and encoder and feeds a pre-baked EDID profile. It solves a huge percentage of HDMI complaints WITHOUT replacing the AV switch. That's the wedge for the capex argument.",
  },
  {
    term: "HDCP",
    category: "Video",
    short: "High-bandwidth Digital Content Protection — DRM over HDMI.",
    long: "Sources (especially streaming devices, sometimes laptops) refuse to output unless the entire signal chain is HDCP-compliant. Older AV switches or USB capture devices can fail HDCP negotiation = black screen.",
  },
  {
    term: "UCI",
    category: "AV software",
    short: "Universal Control Interface — Q-Sys touch panel UI.",
    long: "The Lua/visual interface that sits on the wall-mount or table-mount panel. Authored in Q-Sys Designer. Patrick's 'no touch panel' thesis is on /uci.",
  },
  {
    term: "TP scripts",
    category: "AV software",
    short: "Touch Panel scripts — Lua scripts that run on the touch panel (vs. Main scripts that run on the Core).",
    long: "Patrick fixed memory leaks in MAIN scripts but explicitly said 'I hadn't thought of the touch panel scripts, for the larger rooms.' Same leak patterns, different file, untouched in 8 rooms.",
  },
  {
    term: "NV-21 / NV-32",
    category: "AV hardware",
    short: "Q-Sys network video endpoints — AV-over-IP encoders/decoders.",
    long: "QSC's replacement for the legacy VSI encoder fleet. NV-21 is a 2-in-1-out endpoint, NV-32 is a 3-in-2-out. Carries video, audio, and control over a 1G/10G network. The capex-heavy alternative the team is considering for HDMI reliability.",
  },
  {
    term: "VSI",
    category: "AV hardware",
    short: "The legacy AV encoder/decoder fleet currently deployed.",
    long: "What the NV endpoints would replace. Failing intermittently on HDMI handshake — but that might be EDID, not the encoder hardware itself. That's what the lab bench-test is supposed to determine.",
  },
  {
    term: "NDI",
    category: "Video",
    short: "Network Device Interface — IP-based video transport protocol.",
    long: "What BirdDog cameras use. Low-latency, royalty-free video over standard Ethernet. The team is phasing BirdDog out (see /birddog), partly because of NDI flap issues.",
  },
  {
    term: "UVC",
    category: "Video",
    short: "USB Video Class — the USB standard for camera devices.",
    long: "Native USB camera support. Patrick + Matt tested USB extenders + UVC camera control in SFO-716/SFO-1027 — worked well. The same family of approach Cortney's HDMI USB-capture proposal builds on.",
  },
  {
    term: "Reflect",
    category: "AV software",
    short: "Q-Sys Reflect — QSC's cloud monitoring product.",
    long: "Each Q-Sys Core emits events on plugin error, script error, device offline. Reflect is the cloud receiver. Patrick's Lambda subscribes to the Reflect API + applies the re-poll pattern before alerting.",
  },
  {
    term: "Lambda",
    category: "AV software",
    short: "AWS Lambda — serverless function on a trigger.",
    long: "Patrick's alerting pipeline lives in Lambda. Each function gets an HTTP endpoint or scheduled trigger, runs short code, posts to Slack or writes to Splunk. Cheap, simple — but Patrick's ran under HIS IAM identity, so they failed the morning he was deactivated.",
  },
  {
    term: "HEC",
    category: "AV software",
    short: "HTTP Event Collector — how Lambdas push structured events INTO Splunk.",
    long: "Splunk endpoint + token. Each Lambda has an HEC token to authenticate. If a token was tied to Patrick's identity, the corresponding panel may be dark right now.",
  },
  {
    term: "Splunk",
    category: "AV software",
    short: "Zillow's log + dashboard platform — where Patrick's monitoring lives.",
    long: "App: zgav (zgav_non-prod view). Dashboards: Q-Sys plugin status, core temp/memory, Zoom offline events, daily digest, memory-leak examination panel. See /splunk for the full pipeline + access path.",
  },
  {
    term: "Q-Sys Core",
    category: "AV hardware",
    short: "The QSC DSP appliance at the heart of every Q-Sys room.",
    long: "Runs Lua scripts (Main + TP), exposes Named Controls API, hosts plugins, drives the touch panel. The thing that throws 'Critical Value' errors when memory leaks fill RAM.",
  },
  {
    term: "ZRC",
    category: "AV software",
    short: "Zoom Rooms Controller — the iPad app that pairs to a Zoom Room.",
    long: "Where users start meetings + share content + control the camera. The 'ZRC plugin kick' at NYC-1202 is the manual workaround when the iPad ↔ host pairing goes stale.",
  },
  {
    term: "Domotz",
    category: "Network",
    short: "Network device monitoring platform — pings every AV device.",
    long: "Feeds the av-alerts pipeline. Patrick wanted to route Domotz INTO Splunk so the noisy Slack channel could die. Open-task on Cortney's inherited list.",
  },
  {
    term: "Inogeni / Magewell",
    category: "AV hardware",
    short: "HDMI → USB capture devices.",
    long: "Cheap converter boxes (~$200–$400) that turn an HDMI input into a USB webcam for Zoom. Bypasses the AV switch entirely in a Mac-Mini Zoom Room. Useful for HDMI lab diagnostics + for room kits where USB is preferred over network video.",
  },
  {
    term: "Lightware EDID Lock",
    category: "AV hardware",
    short: "Inline HDMI device that forces a known-good EDID profile.",
    long: "~$100 box. Plug it between the source and the encoder, pre-program the EDID profile you want, and the source ALWAYS sees the same EDID. Kills handshake drama for cheap.",
  },
  {
    term: "AVIO",
    category: "Audio",
    short: "Shure AVIO — Dante-to-analog (or AVIO USB) audio adapter.",
    long: "Cortney's pitch for Neat Center / Neat Board open-space rooms: AVIO USB lets the Neat device 'speak Dante,' so you can companion-mic it with ceiling mics on a Q-Sys Core.",
  },
  {
    term: "Dante",
    category: "Audio",
    short: "Audinate Dante — pro audio over IP standard.",
    long: "The de-facto audio-over-IP standard in pro AV. Q-Sys Cores speak Dante natively; Neat doesn't, which is why AVIO matters for Cortney's open-space concept.",
  },
  {
    term: "TCC2",
    category: "Audio",
    short: "Sennheiser TeamConnect Ceiling 2 — ceiling array mic with auto-steering.",
    long: "What's installed at NYC-1204 and a few SEA rooms. Auto-steers a single beam to the active talker. Less granular than the MXA920 lobe-control approach. Mark's open spec question: TCC2 vs MXA920 for new event spaces.",
  },
  {
    term: "MXA910 / MXA920",
    category: "Audio",
    short: "Shure ceiling-array mics. 910 is lobed; 920 added auto-steer.",
    long: "MXA910 has 8 fixed pickup lobes you manually tune. MXA920 (newer) does auto-steer like the TCC2 but on Shure's stack. The competing platform for the TCC2 spec question.",
  },
  {
    term: "ServiceNow",
    category: "Process",
    short: "Zillow's IT request system. Where you file access tiles.",
    long: "Splunk access, AWS access, GitLab, VPN — all go through ServiceNow. The link Patrick shared for Splunk access is in /splunk.",
  },
  {
    term: "WAVE board / WAVE-XX",
    category: "Process",
    short: "The AV team's Jira board. Tickets are tagged WAVE-XX (e.g., WAVE-16).",
    long: "Migrated from Asana mid-2024. Sprint cadence + backlog. WAVE-16 is the prematurely-closed ticket on the open-issues list.",
  },
  {
    term: "DTO",
    category: "Process",
    short: "Doing The Office — Zillow's hot-desk / in-office day program.",
    long: "Mark's Aug 2024 standup: 'Refresh NYC Quickguide in preparation for Lu DTO in Oct.' When execs DTO at a non-home office, AV gets more scrutiny.",
  },
  {
    term: "P0/P1/P2/P3",
    category: "Process",
    short: "Severity tiers. P0 is everything-on-fire, P3 is whenever-you-get-to-it.",
    long: "Used throughout this site and in the WAVE board. P0 = production rooms down or pipeline failing now; P1 = recurring user impact; P2 = annoying but not blocking; P3 = nice-to-have.",
  },
];

// =========================================================================
// HDMI LAB PROPOSAL — the "what to propose" detail for the bench-test
// before any HDMI/NV capex commitment. Includes the Matt-rebuttal flow.
// =========================================================================

export const HDMI_LAB_PROPOSAL = {
  oneLinePitch:
    "Before we issue POs for Q-Sys NV endpoints to replace the VSI fleet, let me bench-test two cheap alternatives in the lab — source-side EDID forcing with a Lightware EDID Lock, and direct USB capture with an Inogeni or Magewell. Two weeks, no production impact, ~$500 in test gear, and we'll know if NV is actually the right answer or if a $100 EDID box solves it.",

  whyItMatters: [
    {
      headline: "The HDMI problem might not need a $20k+ network-video replacement.",
      detail:
        "Most fleet-wide HDMI failures trace to EDID handshake drama, not encoder hardware. An EDID lock forces a known-good profile so the source sees the same handshake every time. If a $100 device on each encoder makes VSI behave, we don't need NV at all.",
    },
    {
      headline: "USB capture is parallel diagnostic value.",
      detail:
        "Inogeni / Magewell convert HDMI → USB. In a Mac-Mini Zoom Room you can feed Zoom directly via USB and bypass the AV switch. Tells us whether the failure is at the source, in the switch, or in EDID negotiation — diagnostic gold even if we end up buying NV.",
    },
    {
      headline: "Risk to Matt is zero.",
      detail:
        "Lab tests don't touch production. If they fail, we still buy NV. If they pass, we save tens of thousands and avoid a rip-and-replace project Matt would have to install.",
    },
    {
      headline: "Speed isn't a tradeoff.",
      detail:
        "Lightware + Inogeni arrive in under a week. NV procurement is months — QSC quote → PO → Zillow IT review → delivery → install. Even if we end up buying NV, testing first costs nothing on the calendar.",
    },
    {
      headline: "Patrick + Matt already half-validated this path.",
      detail:
        "Their USB-extender + native UVC tests in SFO-716 / SFO-1027 proved this family of approach works. Use Matt's own positive result as the wedge.",
    },
    {
      headline: "Capex hygiene for Mark + Stacey.",
      detail:
        "Mark is allergic to custom one-offs. Stacey owns operational excellence. Spending $500 to validate before $20k+ is the textbook operational-excellence move — frame it back to her exactly that way.",
    },
  ],

  // The test gear shopping list
  testBom: [
    {
      part: "Lightware HDMI20-OPTC / EDID Lock",
      qty: 2,
      approxCost: "$100–$150 each",
      role: "Source-side EDID forcing. One on a clean room, one on a flaky room for A/B.",
    },
    {
      part: "Inogeni Share2 OR Magewell USB Capture Plus HDMI",
      qty: 2,
      approxCost: "$200–$350 each",
      role: "HDMI → USB capture. Test direct Zoom ingestion bypassing the AV switch.",
    },
    {
      part: "Known-good HDMI cables + 2x test laptops (one Mac, one Windows)",
      qty: "—",
      approxCost: "Existing inventory",
      role: "Reproducible source signals.",
    },
    {
      part: "(Optional) Murideo Six-G HDMI generator or similar",
      qty: 1,
      approxCost: "Borrow from QSC or rent",
      role: "Pristine HDMI signal source for baseline. Skip if budget is tight.",
    },
  ],

  // Pass/fail criteria for each option
  passFailCriteria: [
    {
      test: "Option D — Source-side EDID forcing (Lightware)",
      pass: "Flaky room shows zero 'no signal' / dropped audio events across 5 reboots + 3 laptop swaps + 2 resolution changes. Tested on Mac and Windows.",
      fail: "EDID forcing helps but still gets dropouts on resolution change or hot-plug. Means EDID is partial cause, NV (or NV + EDID lock) still likely needed.",
    },
    {
      test: "Option B — Direct USB capture (Inogeni/Magewell)",
      pass: "Zoom ingests the HDMI source via USB cleanly for 1 hour. No audio drift, no resolution flicker. Mac and Windows both work.",
      fail: "USB capture drops or stutters. Means the failure is upstream (source or cable), and replacing the switch (with NV) won't help either.",
    },
  ],

  // The Matt-rebuttal flow
  mattRebuttals: [
    {
      objection: "\"We already decided on NV.\"",
      response:
        "Totally fair — I'm not asking to reopen the decision. I'm asking for two weeks of parallel lab data so we can SIZE the right NV investment. Maybe we still buy NV, but only for the all-hands rooms instead of fleet-wide. Worst case we have receipts for Mark; best case we save the budget for somewhere it matters more.",
    },
    {
      objection: "\"That's a contractor doing engineer-level scoping work.\"",
      response:
        "Yep — that's literally the role. The Lambda re-keying, the runbook docs, the lab tests are all in the scope Stacey signed off on. I'll keep you in the loop on every step, and if any of it crosses into territory that needs your call, I'll DM you first before posting.",
    },
    {
      objection: "\"I don't want to manage another vendor for $500 of test gear.\"",
      response:
        "Don't have to. I'll handle the procurement through expense if Mark prefers — or pull from petty cash. The capex argument is exactly why I'm doing this part myself.",
    },
    {
      objection: "\"What if it's a waste of two weeks?\"",
      response:
        "Two weeks of lab work runs in parallel with the rest of my P0 list (re-keying Lambdas, building the runbook). It's not blocking anything. And even a 'fail' result tells us something useful — that the problem is upstream and NV alone won't fix it.",
    },
    {
      objection: "\"Why now?\"",
      response:
        "Because we haven't issued the PO yet. The moment Mark signs the NV PO this test gets a lot less valuable. The window for cheap data is right now.",
    },
  ],

  // Final 5-step lab plan
  labPlan: [
    "1. Order test gear (Lightware EDID Lock x2, Inogeni/Magewell x2). ~$500. Expense or petty cash.",
    "2. Pick one clean room (e.g., a SEA conference) and one flaky room (a current VSI complaint room) as the A/B pair.",
    "3. Day 1–3: baseline both rooms WITHOUT test gear. Record reboot/source-swap/resolution-change failure rates. Splunk panel if possible.",
    "4. Day 4–10: insert Lightware EDID Lock on the flaky room. Re-run the same matrix. Compare failure rates.",
    "5. Day 11–14: swap to Inogeni/Magewell USB capture path. Re-run. Compare. Write up findings — pass/fail per option + dollar cost to roll out fleet-wide vs. NV — and bring to the next AV sync.",
  ],
};



export const HANDOFF_KEYS = {
  toolingAndAccounts: [
    "GitLab/CodeCommit repo access: Core Tech / Unified Communications / AV / SFO / san-francisco_q-sys",
    "GitLab/CodeCommit repo access: Core Tech / Unified Communications / AV / SEA / seattle_q-sys",
    "Any other regional Q-Sys repos (IRV, NYC)",
    "Single-page UCI Patrick deployed on SEA-3647 — source location and rollout intent",
    "IP schedule / switch validator script — repo, cron, prod access",
    "Daily alerts bot — code, deployment, Slack API credentials",
    "Zoom version distribution dashboard — same access questions",
    "Outlook → meetings Slack integration — Kiel's API keys storage",
    "Custom Q-Sys plugins (Zoom Room Controls, Sennheiser, projector PJ Link) — source vs community",
    "Q-Sys Discord / QSC beta group account access",
    "Xyte vendor relationship contact",
    "Inogeni / Sennheiser open vendor follow-ups Mark mentioned",
  ],
  accessList: [
    "AWS, API Gateway, Secrets Manager",
    "Slack API for internal AV apps and bots",
    "Code repository access (GitLab/CodeCommit)",
    "Zoom Events / Production Suite",
    "Domotz access",
    "Local firewall/router access where required",
    "Local Keeper groups for room-level passwords (already got 3647)",
  ],
  processAndContext: [
    "Documented post-install commissioning checklist (if it exists)",
    "Room as-builts source of truth — AV Eng folder vs completed-project folder",
    "AOP 2026 — what's in flight before scoping 2027 asks?",
    "Vendor cadence — recurring meetings with Q-Sys, Sennheiser, Shure, BirdDog, Raritan, GlobalCache, Zoom — still on calendar?",
    "Asana → Jira migration — any tickets that didn't make the move?",
    "Patrick's exit notes / handoff doc (ask Stacey)",
  ],
};

export interface PlanItem {
  item: string;
  links?: string[];
}

export const PLAN = {
  days_1_30: {
    title: "Days 1–30 (currently day ~13)",
    theme: "Inventory + Access + Credibility. No architecture proposals.",
    items: [
      "Get repo access + clone every Q-Sys file",
      "Get all Patrick-inherited tool access",
      "Read every active Jira ticket end to end",
      "Screen-share with Matt on each Q-Sys file (SFO-735, SEA-3647, SEA-3619, IRV-802, NYC-1202, NYC-1227, Founders Suite, Olympic)",
      "Walk SEA-3647 audio diagnostic to closure (walking talker test, root cause documented)",
      "Write NV-21 SN tracking runbook (QW2)",
      "Lock USB-C adapter SKU (QW1)",
      "Take over WAVE-16 from Matt (QW3)",
      "Document Zoom Whiteboard workaround + room state list (QW4)",
    ],
  },
  days_31_60: {
    title: "Days 31–60",
    theme: "Own the open issues. Start authoring standards.",
    items: [
      "MXA920 vs TCC2 one-pager + recommendation for NYC-1204 (QW7)",
      "TCC2 commissioning pass on SEA-3925 (HVAC room) (QW6)",
      "Spare parts inventory doc (QW5)",
      "Single-page UCI rollout schedule (QW8)",
      "HDMI share migration plan (see HDMI Innovation — don't just rubber-stamp Q-Sys NV)",
      "World Cup pop-up room PM — lock rooms across 5 sites by mid-June",
      "India room — claim engineer-of-record on one room",
      "Tier 1/2/3 room standards strawman",
    ],
  },
  days_61_90: {
    title: "Days 61–90",
    theme: "Earn the right to lead architecture conversations.",
    items: [
      "Tier 3 large-room pilot proposal (G62 or alternative) — frame as pilot with success criteria from Matt",
      "Mac Mini retention vs Windows appliance brief (data-backed: ticket-hours/year for OS-driven issues)",
      "Q-Sys touch panel strategy paper (address Q-Sys Connect Windows-only direction)",
      "MXA910 retirement plan (proposed 2027 AOP item)",
      "TCC2 fleet tuning sweep — SFO All Hands, SEA-3829",
      "Patrick tooling — full documentation pass (runbooks for alerts bot, IP validator, UCIs, plugins)",
    ],
  },
};

export const HDMI_OPTIONS = [
  {
    id: "A",
    title: "Standardize on Q-Sys NV endpoints (current plan)",
    pros: ["Aligns with existing fleet", "Simple control"],
    cons: [
      "NV platform has a 12-month rough patch (fan failure, PSU sourcing, audio bugs under Q-Sys 9, VLAN trust)",
      "Still relies on capture card at Mac Mini end",
      "Doesn't address USB-C adapter quality",
    ],
    bestFor: "Large/event rooms with multi-display routing requirements.",
    risk: "Medium — committing CapEx to a platform with known operational tax.",
  },
  {
    id: "B",
    title: "Bypass AVoIP entirely for content share",
    description:
      "Laptop HDMI → Inogeni or Magewell USB capture → Mac Mini USB → Zoom Room content share.",
    pros: [
      "Removes entire enc/dec chain (and Magewell sync issues)",
      "Removes network dependency",
      "Removes EDID negotiation pain at the network endpoint",
      "Zoom Room sees content as native HDMI input",
    ],
    cons: ["Only works for rooms with one source", "Doesn't route to multiple displays"],
    bestFor: "Tier 1/2 rooms (no multi-display routing). Most zRetreat rooms qualify.",
    risk: "Low — proven path, decoupled from the network.",
  },
  {
    id: "C",
    title: "HDMI-to-NDI bridge into Zoom Room",
    description:
      "Laptop HDMI → BirdDog Mini / Magewell Pro Convert → NDI on network → Mac Mini as NDI source → Zoom Room.",
    pros: ["Decouples from Q-Sys NV"],
    cons: [
      "BirdDog historically problematic at Zillow (Matt: 'I strongly dislike BirdDog')",
      "Stacey doesn't love NDI",
      "Probably a non-starter culturally",
    ],
    bestFor: "Probably not viable at Zillow.",
    risk: "High — vendor goodwill / cultural pushback.",
  },
  {
    id: "D",
    title: "Source-side EDID forcing (low cost diagnostic)",
    description:
      "Use a Lightware HDMI20-Optc or HDMI EDID Lock on the encoder input to force a known-good EDID profile.",
    pros: [
      "~$300/room",
      "No architectural change",
      "Can be tested in lab in one day",
      "Addresses both Magewell 'no sync' AND Mac vs PC inconsistency",
    ],
    cons: ["May not fix everything — diagnostic move first"],
    bestFor: "Initial diagnostic step before any larger swap.",
    risk: "Very low — fast, cheap, reversible.",
  },
  {
    id: "E",
    title: "Wireless-share-only standard for non-event rooms",
    description: "Zoom Share / AirPlay / Mersive only. HDMI input becomes an exception, not a feature.",
    pros: [
      "Eliminates entire failure class",
      "Most users use wireless anyway",
      "Patrick noted: 'Mac worked great' wirelessly when HDMI failed",
    ],
    cons: [
      "Event rooms (All Hands, podium speakers) still need HDMI",
      "Cultural pushback from event coordinators",
    ],
    bestFor: "Mid-size rooms (zRetreats) where HDMI share is rarely used.",
    risk: "Medium — policy decision more than engineering.",
  },
  {
    id: "F",
    title: "Reframe: HDMI ingest is a Zoom Room native feature, not an AVoIP feature",
    description:
      "Zoom Rooms on Mac Mini supports a USB-attached capture device as a content input natively. Keep Q-Sys NV for display routing only. HDMI → encoder → Mac Mini USB capture → Zoom Room as content — never touches AVoIP fabric on the share path.",
    pros: [
      "Reuses gear already in rooms",
      "Decouples share reliability from network/encoder fabric",
      "Q-Sys NV continues to do what it's best at (display routing)",
    ],
    cons: ["Mac Mini USB capture has its own reliability surface"],
    bestFor: "Hybrid path — preserves NV investment for display, fixes only the share path.",
    risk: "Low-Medium.",
  },
];

export const RISKS = [
  "Who currently owns Patrick's tooling in production? If the alerts bot or IP validator breaks tomorrow, who's the on-call?",
  "Andrew Spokes (CE team) push cadence for macOS updates — can we defer the next major release until validated on a non-production Mac Mini? Sequoia incident shouldn't repeat.",
  "What's the Zillow IT exception process for Windows AV appliances? Mark called it 'a tough sell' — needs to be 'impossible' or 'possible with X conditions' before any Tier 3 Windows pilot is real.",
  "NYC-1204 dimensions and ceiling height — needed to finalize mic spec.",
  "TCC2 spare inventory ground truth — Matt says ~6+ between SFO 10th floor, his stash, 3925 candidates for elimination. Need actual count.",
  "Patrick's exit notes / handoff doc — does one exist? Ask Stacey.",
  "Are we forcing Zoom Room scheduler firmware updates on a cadence, or only when WAVE-16 forces our hand?",
];

export interface QuestionItem {
  text: string;
  why?: string;
  tags?: string[];
}

export interface QuestionGroup {
  id: string;
  title: string;
  audience: "Matt" | "Mark" | "Stacey" | "Team / WAVE sync" | "Multiple";
  context: string;
  description?: string;
  questions: QuestionItem[];
}

export const QUESTIONS: QuestionGroup[] = [
  {
    id: "tuesday-matt",
    title: "Tuesday meeting with Matt — Mac Mini / G62 / standards",
    audience: "Matt",
    context: "Scheduled 1:1, Tuesday May 19",
    description:
      "Reset Friday's G62 thread. Lead with questions, not pitches. Build credibility on the current standard before proposing alternatives.",
    questions: [
      {
        text: "Can you walk me through the current Mac Mini + Q-Sys reference design end-to-end so I understand what 'normal' looks like for Zillow?",
        why: "Establishes you're learning the existing system before proposing changes.",
        tags: ["Mac Mini", "Standards"],
      },
      {
        text: "What's the actual Mac management story — is CE pushing a Jamf profile? What breaks when an OS update slips through, and how often does it happen?",
        why: "Surfaces the Sequoia/Apple Intelligence incident on Matt's terms. Lets him show you the scars.",
        tags: ["Mac Mini", "Operations"],
      },
      {
        text: "Of the 50+ rooms we manage today, which ones cause us the most tickets, and is the root cause hardware, OS, network, or user?",
        why: "Grounds the conversation in real data, not vendor marketing.",
        tags: ["Mac Mini", "Data"],
      },
      {
        text: "Where does the team feel pain that the current standard doesn't solve?",
        why: "This is where G62 (or any alternative) earns its place.",
        tags: ["Standards"],
      },
      {
        text: "Stacey landed on 'Tier 3 large/complex rooms' as the place new options could live. Is there an upcoming room — India, NYC-1204, the SEA Library, the dev space — where we have permission to pilot something off-standard?",
        why: "Reframes G62 as a contained pilot, not a fleet replacement.",
        tags: ["G62", "Tier 3", "Pilot"],
      },
      {
        text: "If we wanted to pilot one G62 in the lab, what would success look like to you? What would convince you, and what would disqualify it?",
        why: "Matt defines the criteria. You go build the case.",
        tags: ["G62", "Pilot"],
      },
      {
        text: "If Q-Sys Connect is the future of Q-Sys + Zoom Rooms control, what's our 18-month bet — do we lobby IT for a Windows appliance exception, or do we wait for QSC to support Mac, or do we move away from Q-Sys touch panels?",
        why: "Strategic, forward-looking, and respects Mark's IT-politics framing.",
        tags: ["Q-Sys Connect", "Strategy"],
      },
      {
        text: "Mark mentioned Zillow IT decommissioned non-laptop PCs. Has anyone formally asked what an exception would take, or is that a known dead end?",
        why: "If it's a dead end, the Windows path is closed and we plan accordingly.",
        tags: ["Windows", "IT Politics"],
      },
      {
        text: "Did you ever do an on-site tuning pass on the TCC2s in SFO All Hands, 3925, or 3829? I went through Slack history and didn't see one referenced.",
        why: "Brings receipts. Opens the SEA-3925 commissioning win without grading Matt's work.",
        tags: ["TCC2", "Audio"],
      },
      {
        text: "What's one thing on your plate I can pick up this week so you have time to think about all this?",
        why: "Matt is drowning. He'll remember this.",
        tags: ["Bandwidth"],
      },
    ],
  },
  {
    id: "monday-wave-sync",
    title: "Monday WAVE sync — agenda items I'll add",
    audience: "Team / WAVE sync",
    context: "Stacey opens a Google Doc agenda every Monday. Drop these in proactively.",
    description:
      "Forcing-function topics. They show you're seeing the system, not just doing tickets.",
    questions: [
      {
        text: "Recurring issue inventory — should we maintain a running list?",
        why: "You can literally drop the /issues page in there.",
        tags: ["Process"],
      },
      {
        text: "Patrick's tooling — what's the ownership and documentation status? I'd like to propose I take 2 of his projects.",
        why: "Establishes claim on Patrick's portfolio publicly.",
        tags: ["Patrick handoff"],
      },
      {
        text: "Tier 3 / large room standard — can we pilot the G62 in the lab or in NYC-1204 / dev space?",
        why: "Reframes G62 as pilot, not replacement.",
        tags: ["G62", "Tier 3"],
      },
      {
        text: "USB-C adapter standard SKU — I can lab-test 3 candidates this week and lock in one part number.",
        why: "Small, cheap, high-impact. Mark loves it.",
        tags: ["Quick Win", "Procurement"],
      },
      {
        text: "NV-21 / spare gear inventory & SN tracking process — I want to write a runbook for John/Adali.",
        why: "Process win that closes a real gap.",
        tags: ["Quick Win", "Process"],
      },
      {
        text: "World Cup pop-up room scoping — want me to PM the 5-site rollout?",
        why: "Volunteer before it becomes a fire drill.",
        tags: ["World Cup"],
      },
      {
        text: "NYC-1204 ceiling mic spec — picking up Mark's open question from Sept 3. I'll bring a one-page MXA920 vs TCC2 comparison for next sync.",
        why: "Closes Mark's 8-month-old unanswered question.",
        tags: ["Quick Win", "Audio"],
      },
    ],
  },
  {
    id: "patrick-keys-code",
    title: "Patrick handoff — code, tooling, accounts",
    audience: "Matt",
    context: "Claim, don't ask. These belong in the Tuesday meeting.",
    description:
      "Patrick's GitLab repos, custom UCIs, alerts bot, IP validator, plugins — your portfolio now.",
    questions: [
      {
        text: "Where is Patrick's GitLab/CodeCommit repo for the Q-Sys files? I need contributor access to: Core Tech / Unified Communications / AV / SFO / san-francisco_q-sys; Core Tech / Unified Communications / AV / SEA / seattle_q-sys; any other regional Q-Sys repos (IRV, NYC).",
        tags: ["GitLab", "Q-Sys"],
      },
      {
        text: "Where does the single-page UCI Patrick deployed on SEA-3647 live? Was it pushed to other rooms? Is it the intended standard?",
        tags: ["UCI", "Standards"],
      },
      {
        text: "Where is the IP schedule / switch validator script? What runs it on a cadence? Who has prod access?",
        tags: ["Tooling", "Network"],
      },
      {
        text: "The daily alerts bot that posts per-site Slack messages — where's the code, what's the deployment, who has Slack API credentials?",
        tags: ["Tooling", "Slack"],
      },
      {
        text: "The Zoom version distribution dashboard Patrick built — same questions: source, deployment, credentials.",
        tags: ["Tooling", "Zoom"],
      },
      {
        text: "Outlook → meetings Slack integration — Kiel gave Patrick the API keys. Where are those stored?",
        tags: ["Tooling", "Outlook"],
      },
      {
        text: "Custom Q-Sys plugins (Zoom Room Controls, Sennheiser, projector PJ Link) — which are community downloads vs Patrick-authored? Where is the plugin source?",
        tags: ["Q-Sys", "Plugins"],
      },
      {
        text: "Q-Sys Discord / QSC beta group — what was Patrick's account, and how do I get added?",
        tags: ["Vendor"],
      },
      {
        text: "Xyte relationship — Patrick had a contact there. Who do I reach out to?",
        tags: ["Vendor"],
      },
      {
        text: "Inogeni / Sennheiser vendor follow-ups Mark mentioned — were those ever closed out?",
        tags: ["Vendor"],
      },
    ],
  },
  {
    id: "patrick-keys-access",
    title: "Patrick handoff — access list (May 12 ask)",
    audience: "Mark",
    context: "You raised these May 12. Keep pushing until granted.",
    description: "Access blockers preventing you from doing Patrick's job.",
    questions: [
      { text: "AWS, API Gateway, Secrets Manager access?", tags: ["Access"] },
      { text: "Slack API for internal AV apps and bots?", tags: ["Access"] },
      { text: "Code repository access (GitLab/CodeCommit)?", tags: ["Access"] },
      { text: "Zoom Events / Production Suite access?", tags: ["Access"] },
      { text: "Domotz access?", tags: ["Access"] },
      { text: "Local firewall/router access where required (NAT/IP table changes)?", tags: ["Access"] },
      {
        text: "Local Keeper groups for room-level passwords (already got 3647 — claim the rest).",
        tags: ["Access"],
      },
    ],
  },
  {
    id: "patrick-keys-process",
    title: "Patrick handoff — process and decision context",
    audience: "Multiple",
    context: "Foundational questions that close documentation gaps.",
    questions: [
      {
        text: "Is there a documented post-install commissioning checklist anywhere?",
        tags: ["Process"],
      },
      {
        text: "Where are room as-builts stored? AV Eng > [Region] > All Drawings vs completed-project folders — which is the source of truth?",
        tags: ["Documentation"],
      },
      {
        text: "AOP 2026 — what's in flight that I should know about before scoping 2027 asks?",
        tags: ["Budget", "AOP"],
      },
      {
        text: "Vendor cadence — Patrick had recurring tech meetings with Q-Sys, Sennheiser, Shure, BirdDog, Raritan, GlobalCache, Zoom. Are those still on the calendar?",
        tags: ["Vendor"],
      },
      {
        text: "Asana → Jira migration — what's lost in translation? Any tickets that didn't make the move?",
        tags: ["Process", "Jira"],
      },
      {
        text: "Patrick's exit notes / handoff doc — does one exist?",
        why: "Ask Stacey.",
        tags: ["Patrick handoff"],
      },
    ],
  },
  {
    id: "hdmi-share",
    title: "HDMI share — before signing the Q-Sys NV PO",
    audience: "Matt",
    context: "Decision in principle was made April 17. NV platform has had 12 months of bumps.",
    description: "Don't reopen the decision without evidence — but bring the lab test idea.",
    questions: [
      {
        text: "Before we issue POs for Q-Sys NV endpoints, want me to bench-test source-side EDID forcing and direct USB capture as alternatives? Two weeks in the lab, no impact on production, gives us data to size the right investment.",
        why: "Doesn't reopen the decision — runs a parallel data-gathering exercise that Matt can veto cheaply.",
        tags: ["HDMI", "Lab", "Diagnostic"],
      },
      {
        text: "Where did pricing land on the Q-Sys NV endpoints? Want me to pull a quote from Scott at QSC?",
        tags: ["HDMI", "Procurement"],
      },
      {
        text: "Which rooms still have VSI enc/dec? Can I build a list and propose a swap-out schedule tied to existing site visits?",
        tags: ["HDMI", "Rollout"],
      },
      {
        text: "Should we put together a 'known-good USB-C adapter' SKU and stock it at every site so we stop chasing adapter problems?",
        tags: ["HDMI", "Quick Win"],
      },
      {
        text: "For IRV-1216 specifically — has anyone confirmed whether the issue is the capture card, the adapter, or the Magewell sync? Want me to take that as a lab repro this week?",
        tags: ["HDMI", "IRV-1216"],
      },
    ],
  },
  {
    id: "sea-3647-audio",
    title: "SEA-3647 audio — close the diagnostic this week",
    audience: "Matt",
    context: "Open as of May 15. You already got Keeper access Friday.",
    questions: [
      {
        text: "I'd like to schedule 30 min in 3647 with someone onsite to do a walking talker test at the four corners. Who's the best person to coordinate that — Shelby? Derek?",
        tags: ["3647", "Audio"],
      },
      {
        text: "Can we get a Zoom Dashboard pull of all 3647 calls in the last 30 days and look at audio quality metrics for participants vs. remote attendees?",
        tags: ["3647", "Data"],
      },
      {
        text: "Mark mentioned a Dante license for the Core 8 to bring all mic channels to the DSP — is that still on the table as the option-1 fix? What would I need to scope that?",
        tags: ["3647", "Dante"],
      },
      {
        text: "Are there other MXA910 rooms with similar feedback pattern, or is this 3647 only? If it's broader, we may have a fleet problem, not a room problem.",
        tags: ["MXA910", "Fleet"],
      },
      {
        text: "For NYC-1204 — Mark asked Matt about MXA920 vs TCC2 and I didn't see an answer. Want me to put a quick spec comparison together for the AOP conversation?",
        tags: ["NYC-1204", "Audio Spec"],
      },
    ],
  },
  {
    id: "ui-standardization",
    title: "UI standardization — claim Patrick's UCI work",
    audience: "Mark",
    context: "Mark proposed this roadmap session March 31. Never happened.",
    questions: [
      {
        text: "You and Matt talked about a roadmap to simplify and standardize the room UIs back in March. Did that session happen? If not, want me to draft a strawman based on what's already in SEA-3647, IRV-802, NYC-1202, and SFO-735?",
        tags: ["UCI", "Standards"],
      },
      {
        text: "What's the matrix — which rooms need full manual controls (projector rooms), which can be a single-page Zoom Room with just on/off?",
        tags: ["UCI", "Tier 1/2/3"],
      },
      {
        text: "Where does projector + screen control live in the UCI today? Is the 'no source selected' behavior intentional or a Patrick easter egg we should expose properly?",
        tags: ["UCI", "IRV-802"],
      },
    ],
  },
  {
    id: "zoom-whiteboard",
    title: "Zoom Whiteboard / Companion bug",
    audience: "Matt",
    context: "Three rooms workarounded. Ticket open with Zoom.",
    questions: [
      {
        text: "Is the Zoom Support ticket on the Whiteboard companion issue still open? Want me to be the point of contact so it doesn't fall to you?",
        tags: ["Zoom", "Support"],
      },
      {
        text: "Do we have a written list of every room that got the 'New Whiteboard' workaround? It would be good to know which rooms are in workaround state vs. actually fixed.",
        tags: ["Zoom", "Inventory"],
      },
      {
        text: "Dashboard reports companions as disconnected even when online — is there a Zoom side configuration that fixes this, or is that a Zoom bug we just live with?",
        tags: ["Zoom", "Dashboard"],
      },
    ],
  },
  {
    id: "scheduler-wave-16",
    title: "Scheduler / Calendar-only rooms (WAVE-16)",
    audience: "Matt",
    context: "Low-attention but high-pain issue. Ticket open with Zoom.",
    questions: [
      {
        text: "What's the status of WAVE-16 with Zoom? Want me to take that ticket and run it down with their support?",
        tags: ["WAVE-16", "Zoom"],
      },
      {
        text: "Do we have a known list of schedulers stuck on v6.6.10, or are we discovering them reactively? Could be a good check to add to the daily alerts.",
        tags: ["WAVE-16", "Alerts"],
      },
      {
        text: "Are we forcing scheduler firmware updates on a cadence, or is it Andrew Spokes / CE driven?",
        tags: ["WAVE-16", "CE"],
      },
    ],
  },
  {
    id: "nv21-tracking",
    title: "NV-21 SN tracking + process hygiene",
    audience: "Mark",
    context: "You already raised this May 8. Close the loop.",
    questions: [
      {
        text: "Where in the Jira ticket template do we log SNs and MACs for swapped gear? Want me to write a short runbook so onsite teams (John, Adali) do this consistently?",
        tags: ["NV-21", "Process"],
      },
      {
        text: "Should we add a 'gear replacement' field or sub-task type in Jira so it's queryable later?",
        tags: ["NV-21", "Jira"],
      },
      {
        text: "What's our spare-parts inventory look like for NV-21s, NV-32s, PSUs, Phoenix blocks? Is there a doc, or is it tribal knowledge?",
        tags: ["NV-21", "Inventory"],
      },
    ],
  },
  {
    id: "world-cup",
    title: "World Cup pop-up rooms (June 11)",
    audience: "Mark",
    context: "5 offices, 6 weeks. Going to be a fire drill if not scoped soon.",
    questions: [
      {
        text: "Has any room been specifically committed at IRV, SFO, DEN, and MEX, or is that still TBD? Want me to coordinate with site leads to lock down rooms?",
        tags: ["World Cup", "PM"],
      },
      {
        text: "Encrypted content only works at SEA-3619 today. Has E&B confirmed which streaming service they're using? If it's any service that does HDCP enforcement, we have a problem at 4 of 5 sites.",
        tags: ["World Cup", "HDCP"],
      },
      {
        text: "What's the procurement story for the PlayStations, Xboxes, fire sticks/Apple TVs — are we buying or are they being shipped to us?",
        tags: ["World Cup", "Procurement"],
      },
      {
        text: "Mexico City — do we have any onsite AV presence there? Who's the remote hands?",
        tags: ["World Cup", "MEX"],
      },
    ],
  },
  {
    id: "india",
    title: "India buildout — claim engineer-of-record",
    audience: "Stacey",
    context: "Stacey's pet project. Get in early.",
    questions: [
      {
        text: "I saw the SOW Mark shared and the design you posted. Where in the project do you want me to plug in — design review, equipment sourcing, install QA, commissioning?",
        tags: ["India"],
      },
      {
        text: "For the India design, can I be the engineer of record on one of the spaces so I have full context end-to-end as my first solo project?",
        tags: ["India", "Engineer of Record"],
      },
      {
        text: "Is the 3-shift working model already factored into how we'll support those rooms after install? Who covers India hours?",
        tags: ["India", "Operations"],
      },
    ],
  },
];

// --- NV fleet (Q-Sys NV-21 / NV-32) ---

export type NvModel = "NV-21" | "NV-32";
export type NvRole = "Encoder" | "Decoder" | "Encoder + Decoder" | "Spare" | "Dev / Lab";
export type NvHealth = "Healthy" | "Watch" | "Faulty" | "RMA / Replaced" | "Unknown";

export interface NvDevice {
  id: string;
  room: string;
  site: string;
  model: NvModel;
  role: NvRole;
  health: NvHealth;
  firmware?: string;
  powerMethod: "PoE+" | "External PSU" | "90W Injector" | "Unknown";
  notes: string;
  knownIssueIds?: string[];
}

export const NV_DEVICES: NvDevice[] = [
  {
    id: "sea-3925-enc",
    room: "SEA-3925",
    site: "SEA",
    model: "NV-21",
    role: "Encoder",
    health: "Watch",
    powerMethod: "External PSU",
    notes:
      "Patrick's Aug 15, 2025 test: Mac Mini encoder routed to Projector Decoder, sound card set to NV-21 instead of Q-Sys → no signal. Resolved by Q-Sys 10 upgrade.",
    knownIssueIds: ["nv-usbc-audio-pre10"],
  },
  {
    id: "sea-3925-dec",
    room: "SEA-3925",
    site: "SEA",
    model: "NV-32",
    role: "Decoder",
    health: "Healthy",
    powerMethod: "External PSU",
    notes: "Projector decoder. Paired with the Mac Mini encoder above.",
  },
  {
    id: "olympic-dec",
    room: "Olympic",
    site: "SEA",
    model: "NV-32",
    role: "Decoder",
    health: "Watch",
    powerMethod: "90W Injector",
    notes:
      "Aug 20, 2025: PSU failure. John tried NV-21 PSU which won't work. Mark shipped 90W PoE+ injector — confirmed back online.",
    knownIssueIds: ["nv-psu-mismatch"],
  },
  {
    id: "founders-dec-main",
    room: "Founder's Suite",
    site: "SEA",
    model: "NV-32",
    role: "Decoder",
    health: "Watch",
    powerMethod: "Unknown",
    notes:
      "Jul 8, 2025: Patrick reported main decoder loses a packet every few seconds. Founders refresh completed May 1, 2026 — verify status post-refresh.",
    knownIssueIds: ["nv-packet-loss"],
  },
  {
    id: "nyc-ah-pair",
    room: "NYC All Hands",
    site: "NYC",
    model: "NV-21",
    role: "Encoder + Decoder",
    health: "Healthy",
    powerMethod: "PoE+",
    notes:
      "Original BirdDog system replaced with VSI-style routing using NV pair. PoE injector standard.",
  },
  {
    id: "irv-851",
    room: "IRV-851",
    site: "IRV",
    model: "NV-21",
    role: "Encoder + Decoder",
    health: "Healthy",
    firmware: "Q-Sys 10",
    powerMethod: "External PSU",
    notes:
      "Aug 15, 2025: Patrick updated IRV-851 — was the last system using NV-21 not on v10. Now on Q-Sys 10.",
  },
  {
    id: "sfo-failed-fan",
    room: "SFO (unknown)",
    site: "SFO",
    model: "NV-21",
    role: "Encoder",
    health: "Faulty",
    powerMethod: "External PSU",
    notes:
      "May 7, 2026: fan failure. Mark working on replacement. SN/MAC NOT logged in Jira when John pulled it — process gap.",
    knownIssueIds: ["nv-fan-failure", "nv-sn-tracking"],
  },
  {
    id: "patrick-dev",
    room: "Patrick's home lab",
    site: "Remote",
    model: "NV-21",
    role: "Dev / Lab",
    health: "Unknown",
    powerMethod: "External PSU",
    notes:
      "Originally Patrick's dev unit for serial-control testing. Status post-handoff unknown — verify whether it should come back to Zillow inventory.",
  },
  {
    id: "sea-4-incoming",
    room: "SEA new rooms (ordered)",
    site: "SEA",
    model: "NV-21",
    role: "Spare",
    health: "Unknown",
    powerMethod: "PoE+",
    notes: "Apr 1, 2026: Mark ordered 4x NV-21s for Seattle. Verify arrival, log SNs at receive.",
  },
  {
    id: "dev-4-incoming",
    room: "Dev Space (ordered)",
    site: "SEA",
    model: "NV-21",
    role: "Spare",
    health: "Unknown",
    powerMethod: "PoE+",
    notes: "Apr 1, 2026: Mark ordered 4x NV-21s for Dev space. Same process gap to close.",
  },
];

export interface NvKnownIssue {
  id: string;
  title: string;
  severity: "P0" | "P1" | "P2";
  firstSeen: string;
  affectsModels: NvModel[];
  symptom: string;
  cause: string;
  workaround: string;
  permanentFix?: string;
  evidence: Quote[];
}

export const NV_KNOWN_ISSUES: NvKnownIssue[] = [
  {
    id: "nv-fan-failure",
    title: "NV-21 fan failure",
    severity: "P1",
    firstSeen: "2026-05-07",
    affectsModels: ["NV-21"],
    symptom: "Fan stops, unit eventually overheats. Audible from rack.",
    cause: "Hardware failure — unit-level. Unclear if a batch issue.",
    workaround: "Swap with spare. Maintain hot-spare inventory.",
    permanentFix:
      "RMA with QSC. Track SN + failure date in Jira to detect any batch pattern.",
    evidence: [
      {
        who: "Mark Hampson",
        when: "May 8, 2026 11:28 PT",
        text: "do either of you guys have the serial number of the bad NV-21 with the fan issue from yesterday? Working on a replacement now.",
      },
    ],
  },
  {
    id: "nv-usbc-audio-pre10",
    title: "Mac OS + USB-C → NV-21 audio path: no signal (Q-Sys 9)",
    severity: "P1",
    firstSeen: "2025-08-15",
    affectsModels: ["NV-21"],
    symptom:
      "When Mac Mini sound card is set to NV-21 (instead of Q-Sys) as audio destination, no audio passes from encoder to decoder.",
    cause: "Q-Sys 9 firmware bug in USB-C audio handling on NV-21.",
    workaround: "Use Q-Sys as the audio destination, not the NV-21 sound card directly.",
    permanentFix: "Upgrade Q-Sys Core to v10 (resolved Aug 12, 2025).",
    evidence: [
      {
        who: "Patrick Gilligan",
        when: "Aug 15, 2025 10:49 PT",
        text: "Mac Mini encoder, routed to the Projector Decoder, and the Mac's sound card is set to be its NV-21, instead of Q-Sys.....no signal",
      },
      {
        who: "Patrick Gilligan",
        when: "Aug 12, 2025 08:26 PT",
        text: "Mac OS + USB-C = NV-21 seems all good now after updating to Q-Sys 10",
      },
    ],
  },
  {
    id: "nv-psu-mismatch",
    title: "NV-21 PSU does NOT work with NV-32",
    severity: "P2",
    firstSeen: "2025-08-20",
    affectsModels: ["NV-21", "NV-32"],
    symptom: "Swapping PSUs between models — unit fails to power up or runs underpowered.",
    cause:
      "NV-21 and NV-32 have different power requirements. PSUs are not interchangeable despite similar form factor.",
    workaround:
      "Use 90W PoE+ injector for either model in a pinch. Label PSUs clearly by model.",
    permanentFix:
      "Maintain separate spare PSU inventory by model. Document on the spare parts SKU reference.",
    evidence: [
      {
        who: "Matt Cornick",
        when: "Aug 20, 2025 08:22 PT",
        text: "The NV21 PSU will not work with the NV32.",
      },
      {
        who: "Mark Hampson",
        when: "Aug 20, 2025",
        text: "he has a 90 watt injector hes plugging in",
      },
    ],
  },
  {
    id: "nv-phoenix-block-not-included",
    title: "NV-21 PSU does not ship with the Phoenix terminal block",
    severity: "P2",
    firstSeen: "2025-09-02",
    affectsModels: ["NV-21"],
    symptom:
      "External PSU arrives without the 2-conductor Phoenix block. Cannot wire to the NV-21 input.",
    cause: "Vendor (QSC / Phihong) does not include the connector in standard packaging.",
    workaround:
      "Source separately from Phoenix Contact / Digikey. Or order the QSC OEM PSU (QB-NV21PSU) which includes it (but harder to source).",
    permanentFix:
      "Order Phoenix blocks in bulk with every NV-21 PO. Stock as a standard spare.",
    evidence: [
      {
        who: "Patrick Gilligan",
        when: "Sep 2, 2025 10:07 PT",
        text: "where have you been buying the power phoenix blocks for the NV-21 PSUs? Seems like the unit does not ship with it, annoyingly.",
      },
      {
        who: "Mark Hampson",
        when: "Sep 2, 2025 10:13 PT",
        text: "I get them from Phihong or Digikey. I have no idea how to get any PSU for the NV units that actually come with that phoenix block",
      },
      {
        who: "Mark Hampson",
        when: "Sep 2, 2025 10:16 PT",
        text: "if you need to buy the phoenix for the nv-21 here is the part https://www.digikey.com/en/products/detail/phoenix-contact/5452235/5187331",
      },
    ],
  },
  {
    id: "nv-packet-loss",
    title: "AVoIP packet loss on NV decoder (Founder's Suite)",
    severity: "P2",
    firstSeen: "2025-07-08",
    affectsModels: ["NV-32"],
    symptom: "Main decoder drops a packet every few seconds. Shows up consistently in dashboard.",
    cause:
      "Suspected: separate VLANs on Founder's switch (not yet collapsed). Matt: 'makes me not fully trust that network.'",
    workaround:
      "Tolerate the drop. Most users don't perceive it on a single-source feed.",
    permanentFix:
      "Consolidate Founder's Suite into the single AV VLAN per the post-refresh plan.",
    evidence: [
      {
        who: "Patrick Gilligan",
        when: "Jul 8, 2025",
        text: "the main decoder for the founder's suite loses a packet every few seconds, maybe once a minute. And, strange that its the only one doing that. But it might have to do with what is routed to it.",
      },
      {
        who: "Matt Cornick",
        when: "Jul 8, 2025",
        text: "That switch still has the separate VLANs which makes me not fully trust that network. Especially since I had problems with NDI in there.",
      },
    ],
  },
  {
    id: "nv-sn-tracking",
    title: "Serial number / MAC tracking gap on RMA",
    severity: "P2",
    firstSeen: "2026-05-08",
    affectsModels: ["NV-21", "NV-32"],
    symptom:
      "Failed NV unit pulled from rack but SN/MAC not captured in Jira. Cannot reference SN for QSC RMA.",
    cause:
      "No documented process. Asset tracking was Patrick-era tribal knowledge. Jira is new.",
    workaround: "Stop the onsite tech before they leave; ask for a photo of the label.",
    permanentFix:
      "Runbook for onsite (John, Adali): log SN + MAC + room + symptoms in Jira before disposing of failed unit.",
    evidence: [
      {
        who: "Matt Cornick",
        when: "May 8, 2026 12:20 PT",
        text: "When John pulled the bad NV, he should have logged the info into the Jira ticket so Mark could just reference it there. Jira is newish for us and we're also trying to get in the habit of tracking everything there so it's easily referenced later.",
      },
    ],
  },
];

export interface NvSparePart {
  name: string;
  partNumber: string;
  source: string;
  notes: string;
  url?: string;
}

export const NV_SPARES: NvSparePart[] = [
  {
    name: "NV-21 OEM PSU (includes Phoenix block)",
    partNumber: "QB-NV21PSU",
    source: "ADI Global Distribution / QSC reseller",
    notes:
      "The 'right' PSU but rarely in stock and not always shipped with the connector. Mark: 'I dont know how to buy this one. ive never even seen this power supply in real life before.'",
    url: "https://www.adiglobaldistribution.pr/Product/QB-NV21PSU",
  },
  {
    name: "External PSU (12V) — Phihong",
    partNumber: "AA120U-120B-R",
    source: "Digikey",
    notes:
      "Mark's go-to. Does not include the Phoenix block — order separately.",
    url: "https://www.digikey.com/en/products/detail/phihong-usa/AA120U-120B-R/21358452",
  },
  {
    name: "Phoenix Contact 2-conductor terminal block",
    partNumber: "5452235",
    source: "Digikey",
    notes:
      "The actual connector that mates with the NV-21 power input. Required if using a non-OEM PSU.",
    url: "https://www.digikey.com/en/products/detail/phoenix-contact/5452235/5187331",
  },
  {
    name: "90W PoE+ Injector",
    partNumber: "TBD — confirm with Mark",
    source: "Standard AV vendor",
    notes:
      "Field replacement for failed PSU on either NV-21 or NV-32. Mark used one to get Olympic back online Aug 20, 2025.",
  },
];

// --- UCI / Q-Sys touch panel issues ---

export interface UciIssue {
  id: string;
  title: string;
  severity: "P0" | "P1" | "P2";
  date: string;
  rooms: string[];
  description: string;
  rootCause: string;
  resolution: string;
  evidence: Quote[];
}

export const UCI_THESIS: { who: string; when: string; permalink: string; text: string } = {
  who: "Patrick Gilligan",
  when: "Mar 4, 2025 13:17 PT (after the CTO incident at SEA-3611)",
  permalink:
    "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1741123050535009?thread_ts=1741123050.535009&cid=C04GF3S3KQF",
  text:
    "We need bulletproof, simple rooms, that are comfortable and inviting to use, and heavily monitored to make sure they are always working as they should. If there is no operator, there should be no touch panel — would have been better to just have had one camera, vs a touch panel that people don't even know to use. Neither should there be anything along the lines of system mutes, video routing, display control.",
};

// Cortney's counter-thesis. Patrick was a strong programmer but didn't come from an AV
// background; several of his architectural calls were "half standards" — useful, but with
// real holes nobody could question because nobody else owned the code. This section captures
// Cortney's pushback as the new Systems Engineer.
export const CORTNEY_COUNTER_THESIS: {
  who: string;
  when: string;
  headline: string;
  text: string;
  bullets: string[];
} = {
  who: "Cortney (Systems Engineer — Patrick's replacement)",
  when: "May 17, 2026",
  headline:
    "Patrick's \"no touch panel\" thesis is a programmer's answer, not an AV engineer's answer.",
  text:
    "Taking a touch panel away from rooms is silly — what are they, BYOD rooms or what? Patrick was a strong programmer, but he didn't come from an AV background. Several of his standards are half-standards: useful, but with holes — and because he owned the code, nobody else could question them. I'm here to put them in front of the team and fix the ones that don't survive contact with how rooms actually get used.",
  bullets: [
    "A room without a touch panel IS a BYOD room. Either commit to BYOD or commit to a panel — don't ship a half-room where the user walks in, can't find the source, and the CTO has to flag down John.",
    "The CTO incident at SEA-3611 wasn't \"too many controls\" — it was an UNTUNED control (a camera preset that didn't exist). Patrick's takeaway was \"remove the panel.\" The AV answer is \"tune the panel.\"",
    "Patrick's own behavior contradicts the thesis: he still built a simplified single-page UCI for SEA-3647. So the real question is never \"panel vs. no panel\" — it's \"what's on the panel and is it tuned.\" Tier the CONTENT of the UCI, not the existence of it.",
    "Removing system mutes, video routing, and display control means an in-room operator (or a Zoom rep) can't take over a stuck meeting. That's a regression, not a simplification.",
    "Patrick's \"heavily monitored to make sure they are always working\" half kept the program afloat — but the monitoring lived in Splunk/Lambda scripts only he could read. Half standard: the system worked while he was here; nobody else could troubleshoot it.",
  ],
};

// Concrete list of Patrick decisions Cortney is reopening. Each one is a "half standard" —
// a call that was defensible inside Patrick's head, but never debated by the team and
// never written down as a real Zillow AV standard.
export interface HalfStandard {
  id: string;
  patrickPosition: string;
  why: string; // Why Patrick believed it
  cortneyConcern: string;
  action: string;
}

export const HALF_STANDARDS: HalfStandard[] = [
  {
    id: "no-touch-panel",
    patrickPosition: "If there is no operator, there should be no touch panel.",
    why: "Patrick was reacting to the CTO incident — users got confused by a UCI that had broken/hidden controls.",
    cortneyConcern:
      "A room with no touch panel is a BYOD room. We don't have BYOD as a standard. Removing the panel doesn't fix the panel — it just hides Zillow's failure to tune it.",
    action:
      "Keep the touch panel on every conference room (huddle and up). Tier the UCI CONTENT instead — Tier 1 minimal, Tier 2 default, Tier 3 strategic. Re-tune SEA-3611 + every room that had its panel \"hidden.\"",
  },
  {
    id: "remove-system-mutes-and-routing",
    patrickPosition:
      "Touch panels should not have system mutes, video routing, or display control.",
    why: "Patrick wanted users to never be able to break the room. He optimized for the bottom 20% of users.",
    cortneyConcern:
      "When a meeting is going sideways, the operator (or a Zoom rep) needs to mute, re-route, or kill a display. Stripping those controls strips our recovery options. The right answer is gated access (operator/settings tab), not removal.",
    action:
      "Bring back system mute, source-route, and display power on a settings tab behind a long-press / PIN. Standard pattern in every Crestron / Q-Sys deployment outside Zillow.",
  },
  {
    id: "single-page-uci-only",
    patrickPosition:
      "Single-page UCI is the future — no tabs, no navigation, just a Zoom rectangle and a content rectangle.",
    why: "It's elegant from a programmer's perspective and it tested well at SEA-3647.",
    cortneyConcern:
      "Single-page works for a uniform Tier 2 room. It does NOT work in a multi-display room (IRV-802 had projector + screen + Zoom display — all hidden). It does NOT scale to event spaces (NYC-1204) with multiple sources.",
    action:
      "Single-page UCI = Tier 2 default. Multi-source / multi-display rooms get a tabbed UCI with a clear visible affordance. Stop calling \"hide it\" a design pattern.",
  },
  {
    id: "monitoring-in-patricks-head",
    patrickPosition:
      "Rooms should be heavily monitored so they're always working as they should.",
    why: "Patrick built Splunk dashboards, Lambda probes, and Slack-API alerts. He was the on-call human.",
    cortneyConcern:
      "All the monitoring lived in Patrick's GitLab projects with no runbook. When he leaves, half of it goes dark or auto-fails silently. That's not a standard — that's tribal knowledge.",
    action:
      "Inventory every Patrick-authored monitor. Write a one-page runbook per monitor: what it watches, where it alerts, how to silence it, who owns it. Promote to team-owned, not Patrick-owned.",
  },
  {
    id: "mac-mini-as-the-host",
    patrickPosition:
      "Mac Mini is the Zoom Rooms host — Zillow standard, end of discussion.",
    why: "Apple ecosystem alignment with the rest of Zillow IT and historical inertia from before Patrick arrived.",
    cortneyConcern:
      "Q-Sys Connect for Zoom Rooms is Windows-only. Half the Q-Sys ecosystem we want to lean on is Windows-first. The Mac Mini standard is incompatible with our own roadmap. Patrick punted on this — never escalated it as an architectural conflict.",
    action:
      "Bring Mac Mini vs. Q-Sys roadmap conflict to Matt + IT as a formal decision. Pilot a Windows AV appliance exception (NUC / Q-Sys NV-Edge / G62) in one room and measure.",
  },
  {
    id: "patrick-as-the-only-coder",
    patrickPosition:
      "Patrick wrote and owned all the Lua, all the plugins, all the AWS Lambda alerts.",
    why: "Nobody else on the team wrote code. Patrick was the path of least resistance.",
    cortneyConcern:
      "If one engineer is the only person who can read or change a control system, that system isn't a standard — it's a black box. Mark/Matt have stated they can't troubleshoot the custom plugins or the projector-control plugin.",
    action:
      "Use Cursor + AI tools to make the code legible to Mark and Matt. Code reviews on every Q-Sys MR. Document custom plugins (source: community vs Patrick-authored, license, support contact).",
  },
  {
    id: "no-in-room-camera-control",
    patrickPosition:
      "Users shouldn't control cameras — auto-frame / speaker-tracking should handle it.",
    why: "Reduces support load. Most rooms are Neat Bar Pro which auto-frames anyway.",
    cortneyConcern:
      "Event spaces, board rooms, and any room with a presenter need PTZ presets that humans can pick. \"One camera vs a touch panel\" works in a 4-person huddle, not in a 30-person all-hands.",
    action:
      "Keep auto-frame as the default. Add PTZ preset row to Tier 3 (event / board) UCIs. Document which rooms are which tier.",
  },
];

export interface UciToolkitItem {
  name: string;
  category: "AI / Editor" | "Q-Sys core" | "Knowledge" | "Source control" | "Future (10.x)";
  what: string;
  zillowStatus: string;
  url?: string;
  patrickReference?: { permalink: string; quote: string; when: string };
}

export const UCI_TOOLKIT: UciToolkitItem[] = [
  {
    name: "Cursor (AI code editor)",
    category: "AI / Editor",
    what:
      "AI-first IDE. Lets you @-reference docs into context and generate Lua / TypeScript / Apple Script. Patrick's primary tool.",
    zillowStatus:
      "Patrick used it extensively. Confirm whether Zillow has a team license; otherwise free tier works for individual use.",
    url: "https://cursor.com",
    patrickReference: {
      permalink:
        "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1743535494415339?thread_ts=1743535494.415339&cid=C04GF3S3KQF",
      when: "Apr 1, 2025",
      quote:
        "I just brought my Elgato stream light of the garage. I used Cursor AI to write an Apple script that detects whether im in a meeting every 5 seconds and toggles my light accordingly. What a time to be alive. I wrote 0 code and was done in 10 minutes, after debugging.",
    },
  },
  {
    name: "Internal Zillow AI coding tool",
    category: "AI / Editor",
    what:
      "Some Zillow-blessed AI coding tool Patrick used to pull all AV switch configs and back them up in <20 minutes.",
    zillowStatus:
      "Patrick referenced 'one of Zillow's newer AI coding tools.' Specific tool not named in #av-team — ask Mark which one.",
    patrickReference: {
      permalink:
        "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1736812165080269?thread_ts=1736803286.261809&cid=C04GF3S3KQF",
      when: "Jan 13, 2025",
      quote:
        "I just used one of Zillow's newer AI coding tools to write an app that pulls all of our AV switch configs and backs them up to files. It took me <20 minutes. Completely insane.",
    },
  },
  {
    name: "Claude / Claude Code",
    category: "AI / Editor",
    what:
      "AI assistant; strong at converting natural language → Lua + Q-Sys Named Control API patterns. Good fallback when Cursor context fills up.",
    zillowStatus: "Use the same way as Cursor: feed Q-Sys help files as context.",
    url: "https://claude.ai",
  },
  {
    name: "NotebookLM",
    category: "AI / Editor",
    what:
      "Google's notebook AI. Ingest Q-Sys docs, internal AV docs, and ask 'how does our system handle X?' Mark used it to turn AV docs into a podcast.",
    zillowStatus: "Free with a Google account.",
    url: "https://notebooklm.google.com",
    patrickReference: {
      permalink:
        "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1740761801061229?thread_ts=1740761801.061229&cid=C04GF3S3KQF",
      when: "Feb 28, 2025",
      quote:
        "Check this out. Michael ran our room scheduler project docs through notebookLM and it created a podcast about the project.",
    },
  },
  {
    name: "Q-Sys Designer (LOCAL Windows install — Cortney's new path)",
    category: "Q-Sys core",
    what:
      "QSC's authoring environment for Q-Sys files. UCI visual builder, Lua scripts, plugin host, push-to-Core deploy.",
    zillowStatus:
      "Cortney is getting a dedicated Windows laptop (procurement approved May 2026) — installing Q-Sys Designer LOCALLY. This bypasses the shared AWS VM's contention and HD limits, and positions Cortney as the team's only currently-Windows-equipped engineer (relevant for Q-Sys Connect for Zoom Rooms testing, which is Windows-only). Keep the AWS VM ServiceNow request alive as a backup access path.",
    url: "https://www.qsys.com/products-solutions/q-sys/software/q-sys-designer-software/",
    patrickReference: {
      permalink:
        "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1769789035479339?thread_ts=1769787997.205509&cid=C04GF3S3KQF",
      when: "Jan 30, 2026 — why a local install is a meaningful upgrade",
      quote:
        "I need to close out designer 10.1 please. I am going to delete it. This VM is out of HD space. We only have 70gigs on this VM, and AWS charges us like $250 a month for it, so didn't want to ask for more yet. [Matt's reply: 'Oops...it was minimized. Closed now.']",
    },
  },
  {
    name: "Shared AWS Windows VM (Matt + Patrick's old setup — backup)",
    category: "Q-Sys core",
    what:
      "The original Q-Sys workstation. 70GB shared drive, ~$250/mo. Matt and Patrick had concurrent Designer sessions on it. TeamViewer pre-installed so QSC support can remote in.",
    zillowStatus:
      "Matt opened a ServiceNow ticket for Cortney's access May 7, 2026. Worth keeping access alive as a fallback — Matt still uses it, and QSC remote support comes in through it via TeamViewer.",
    patrickReference: {
      permalink:
        "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1710459608885999?thread_ts=1710452125.555549&cid=C04GF3S3KQF",
      when: "Mar 14, 2024",
      quote:
        "for future ref, the VM has TeamViewer on it....Q-Sys has remoted in several times.",
    },
  },
  {
    name: "Q-Sys Designer Asset Library",
    category: "Q-Sys core",
    what:
      "Plugin marketplace inside Designer. NOTE: Mark's check confirmed that Patrick's projector-control plugin is NOT in the public library — meaning some Zillow plugins came from QSC Communities or were hand-rolled.",
    zillowStatus: "Audit which plugins are community vs hand-rolled. Document in handoff.",
  },
  {
    name: "Q-Sys Help Portal",
    category: "Knowledge",
    what:
      "Canonical Lua + Q-Sys API + scripting reference. Download as PDF and feed to AI as context.",
    zillowStatus: "Free, public. Patrick referenced 10.1 docs directly in #av-team.",
    url: "https://help.qsys.com",
    patrickReference: {
      permalink:
        "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1770660521609409",
      when: "Feb 9, 2026",
      quote:
        "Q-Sys 10.1 help — Control: Resolved performance issues with Zoom app UCI responsiveness on Poly TC8 and Logi Tap IP devices, where certain firmware and Zoom Rooms versions cause significant sluggishness.",
    },
  },
  {
    name: "Q-Sys Community Forum",
    category: "Knowledge",
    what:
      "Plugin examples, code snippets, scripts. Mark explicitly suspected Patrick's projector-control plugin came from here.",
    zillowStatus: "Public, free signup.",
    url: "https://qsc.com/communities",
  },
  {
    name: "Q-Sys Discord",
    category: "Knowledge",
    what:
      "Faster than the community forum for tricky issues. Patrick was active here and called it 'the speediest help there is.'",
    zillowStatus:
      "Get added via Scott at QSC or via Mark. Patrick had access tied to his ASE certification.",
  },
  {
    name: "Q-Sys ASE Level 1 / 2 / 3 trainings",
    category: "Knowledge",
    what:
      "QSC's official free certification program. Foundational understanding of designer, scripting, and platform.",
    zillowStatus:
      "Free online. Patrick had Level 2/3. Worth scheduling Level 1 in your first 30 days.",
    url: "https://training.qsc.com",
  },
  {
    name: "QSC Beta Builds (SharePoint)",
    category: "Knowledge",
    what:
      "Patrick had access to Q-Sys beta firmware including 10.2 that fixed the 'max concurrent session' bug.",
    zillowStatus:
      "Acuity-hosted SharePoint. Get the share invite from Scott at QSC. Tied to ASE level / beta program.",
    patrickReference: {
      permalink:
        "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1769787997205509?thread_ts=1769787997.205509&cid=C04GF3S3KQF",
      when: "Jan 30, 2026",
      quote:
        "Beta version of Q-Sys 10.2, that deals with the 'maximum users' issue.",
    },
  },
  {
    name: "Zillow GitLab — regional Q-Sys repos",
    category: "Source control",
    what:
      "Patrick's commits auto-posted to #av-team via the GitLab bot. Four regional repos.",
    zillowStatus:
      "Listed in /handoff page. Get contributor access from Mark. Clone all four locally for Cursor context.",
    url: "https://gitlab.zgtools.net/core-tech/unified-communications/av",
  },
  {
    name: "Q-Sys Reflect Manager",
    category: "Q-Sys core",
    what:
      "Cloud monitoring + remote management for Q-Sys cores. Counts as a session against the max concurrent session limit.",
    zillowStatus: "Patrick used this heavily. Get added.",
    url: "https://reflect.qsc.com",
  },
  {
    name: "Splunk dashboards (av-observe)",
    category: "Source control",
    what:
      "Where Patrick built the Core memory + script error + IP schedule dashboards. Tied to the daily alerts bot.",
    zillowStatus: "Already in the existing av-observe-main repo at workspace root.",
    patrickReference: {
      permalink:
        "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1750867568819919?thread_ts=1750867568.819919&cid=C04GF3S3KQF",
      when: "Jun 25, 2025",
      quote:
        "This new dashboard I made is super helpful for examining script memory, or that error that causes us to have to reboot the Q-Sys cores ('Critical Value' errors).",
    },
  },
  {
    name: "Q-Sys UCI REST API (`/api-uci/v0/ucis/...`)",
    category: "Future (10.x)",
    what:
      "Patrick demoed pointing a Crestron touch panel and a browser at this URL to render the Q-Sys UCI as a web page. Foundation for the HTML/JS future.",
    zillowStatus:
      "Already works in your Q-Sys cores today. Try one: `https://irv-802-qdsp-01.zillow.local/api-uci/v0/ucis/<id>` (on VPN).",
    patrickReference: {
      permalink:
        "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1758044619414969?thread_ts=1758044619.414969&cid=C04GF3S3KQF",
      when: "Sep 16, 2025",
      quote:
        "What if we give the web version of the touch panels to each site lead. That way, they can take a look at things from their desk, without even having to get up?",
    },
  },
  {
    name: "HTML / JS / TypeScript / React",
    category: "Future (10.x)",
    what:
      "Q-Sys 10.x is opening UCI authoring to standard web tooling. AI assistants are far better at modern web stacks than Lua. This is the long-term path.",
    zillowStatus:
      "Q-Sys' direction per Patrick. Your existing web skills directly apply once QSC ships the API.",
    patrickReference: {
      permalink:
        "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1744734270335469?thread_ts=1744734002.228549&cid=C04GF3S3KQF",
      when: "Apr 15, 2025",
      quote:
        "They are trying to set it up so you can use more open source tools, like html and JavaScript, which is great because touch panels are their weakest link.",
    },
  },
  {
    name: "Crestron TPs in URL-mode (Patrick's experiment)",
    category: "Future (10.x)",
    what:
      "Old Crestron touch panels have a signage URL mode. Patrick ran a web app on a Raspberry Pi and pointed a Crestron TP at it to control Q-Sys via browser.",
    zillowStatus:
      "Proof of concept. Worth replicating if any old Crestron hardware is in storage.",
    patrickReference: {
      permalink:
        "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1773429111587919?thread_ts=1773429111.587919&cid=C04GF3S3KQF",
      when: "Mar 13, 2026",
      quote:
        "Fun project from the last few nights. These old Crestron TPs have a signage mode, and you can point them at a URL. I have a web app running on my raspberry PI, which I pointed the TP to the url. Controlling Q-Sys from Crestron (or the browser)!",
    },
  },
];

export const UCI_ISSUES: UciIssue[] = [
  {
    id: "uci-cto-incident",
    title: "SEA-3611 — CTO David Beitel reported in-room users couldn't hear far end",
    severity: "P0",
    date: "Mar 4, 2025",
    rooms: ["SEA-3611"],
    description:
      "Zillow's CTO walked up to John asking 'who runs SEA-3611' — they had a meeting where in-room participants couldn't hear the remote side and nobody reported it. The touch panel was sitting on the splash page (default-muted state). Zoom Room Controls plugin couldn't connect.",
    rootCause:
      "Touch panel discoverability + default-mute behavior. Users didn't know to tap the panel to wake the system; the splash page didn't communicate that the room was muted.",
    resolution:
      "Patrick fixed the ZRC connection that day and used the incident as the founding rationale for the single-page UCI redesign (deployed to SEA-3647 a year later).",
    evidence: [
      {
        who: "Patrick Gilligan",
        when: "Mar 4, 2025 13:17 PT",
        text: "David Beitel comes up to John, asks 'who runs SEA-3611': they had a meeting and in-room users couldn't hear the far end, and nobody reported it. Even though that room has a touch panel (mainly to handle 4x routable cameras). I log into the system, and its still on the splash page, meaning things are defaulted to muted.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1741123050535009?thread_ts=1741123050.535009&cid=C04GF3S3KQF",
      },
      {
        who: "John Gifford III",
        when: "Mar 4, 2025 13:51 PT",
        text: "Answering his original question, I told him that we try to have the rooms as close to hands off as possible. Short explanation on the difficulty in that room in regards to having to use two separate apps and how we are currently working on getting the process more simple.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1741125661113659?thread_ts=1741123050.535009&cid=C04GF3S3KQF",
      },
      {
        who: "Stacey Newman",
        when: "Mar 4, 2025 14:18 PT",
        text: "and how was he at the end? Was he understanding? Any follow up needed by us? ... he's always an advocate for us so I don't want to lose him as a supporter.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1741127091138949?thread_ts=1741123050.535009&cid=C04GF3S3KQF",
      },
    ],
  },
  {
    id: "uci-tp-build-pain",
    title: "Q-Sys touch panel build process is a known pain point",
    severity: "P1",
    date: "Mar 13, 2026",
    rooms: ["Fleet-wide"],
    description:
      "Patrick explicitly called building Q-Sys touch panels 'a huge pain' and 'one of the least modern parts of the stack.' Touch panels are why he built the single-page UCI (web-based, Zoom-app-rendered) and why he prototyped Crestron + Raspberry Pi for an HTML-based alternative.",
    rootCause:
      "Q-Sys Designer's touch-panel authoring tools haven't kept pace with modern web UI development. Every TP layout requires manual block-based scripting. No reusable component library. QSC's roadmap is to open this up to HTML/JS but not delivered yet.",
    resolution:
      "Q-Sys 10.x will support more open-source tools (HTML/JS). Patrick built the single-page UCI on SEA-3647 as the interim standard. Custom Q-Sys plugins (the source of the projector controls Mark couldn't find) need to be documented and migrated.",
    evidence: [
      {
        who: "Patrick Gilligan",
        when: "Mar 13, 2026 12:33 PT",
        text: "further context: building Q-Sys touch panels is a huge pain, takes forever, and one of the least modern parts of the stack.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1773430412723649?thread_ts=1773429111.587919&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Apr 15, 2025 09:24 PT",
        text: "They are trying to set it up so you can use more open source tools, like html and JavaScript, which is great because touch panels are their weakest link.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1744734270335469?thread_ts=1744734002.228549&cid=C04GF3S3KQF",
      },
    ],
  },
  {
    id: "uci-single-page-rollout",
    title: "Single-page UCI deployed to SEA-3647 — Patrick's interim standard",
    severity: "P1",
    date: "Mar 3, 2026 (deployed)",
    rooms: ["SEA-3647 (deployed)", "All Tier 1/2 rooms (pending)"],
    description:
      "Patrick deployed a new single-page UCI to SEA-3647 because 'what was there is so bad.' No audio controls (nobody used them), simple screen control, dropdown for projector, optional routing. Coded with AI assistance. Tested by Derek + John on Neat Pads — works. Fleet rollout never scheduled.",
    rootCause:
      "Multi-page UCIs were Patrick's attempt at being comprehensive, but in practice nobody used the audio controls. The 'On/Off + a little extra' pattern matches actual usage. Was John's original idea.",
    resolution:
      "Continue Patrick's work — define which rooms get the single-page UCI vs full UCI vs no UCI at all (Patrick's thesis). Targets: simpler rooms first, then evaluate.",
    evidence: [
      {
        who: "Patrick Gilligan",
        when: "Mar 3, 2026 15:22 PT",
        text: "Another thing I've been working on, and already deployed to SEA-3647 because what was there is so bad. A single page UCI with: no audio controls (nobody seems to use them), simple screen control, dropdown when there is a projector, routing if needed. Much simpler design, to deal with the limitations of the Zoom UI. A lot of it was coded with AI (much faster).",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1772580151958489?thread_ts=1772580151.958489&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Mar 3, 2026 15:27 PT",
        text: "He asked if we could make the UI just one page for those simpler rooms, which I think was a good idea on his part. Really, I want 'On' and 'Off' to do pretty much everything, with a little extra exposure for edge cases.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1772580435206409?thread_ts=1772580151.958489&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Mar 3, 2026 15:25 PT",
        text: "I can't test Neat Pads at home. Derek tried it, with no specific feedback other than that it works. John is going to test for me. Also, v 10.1.0 or 10.1.1 were supposed to have better 'Android' performance, haven't gotten a chance to test that.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1772580372974659?thread_ts=1772580151.958489&cid=C04GF3S3KQF",
      },
    ],
  },
  {
    id: "uci-irv-802-hidden-controls",
    title: "IRV-802 — projector + screen controls hidden behind 'No source selected'",
    severity: "P1",
    date: "Mar 31 – Apr 2, 2026",
    rooms: ["IRV-802"],
    description:
      "During a zRetreat, Matt needed to manually roll up the screens and turn off projectors but couldn't find the controls. Patrick's UCI exposed them only when no source was selected on the routing page — invisible to anyone who hadn't been shown.",
    rootCause:
      "Conditional UI logic that's not discoverable. Patrick's words: 'It would have made sense to not have the No source selected qualifier and then also include the controls under the cog as a tab.'",
    resolution:
      "Mark proposed a UI redesign roadmap session April 1, 2026. Never happened. Cortney to own. Make controls discoverable via a settings tab.",
    evidence: [
      {
        who: "Matt Cornick",
        when: "Mar 31, 2026 08:12 PT",
        text: "I also found out that I think Patrick removed projector and screen controls from the UI so I had to roll the screens up and turn projectors off manually from QDS.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1774969974154039?thread_ts=1774969974.154039&cid=C04GF3S3KQF",
      },
      {
        who: "Mark Hampson",
        when: "Mar 31, 2026 08:50 PT",
        text: "Looking at the file now, it should be redone. Correct me if I'm wrong but cant this just be a simple Zoom Room? Do they really need manual routing and all that? Also, do you know where this plugin comes from? Did Patrick write it or get it from his Q-Sys community? It's not on the Q-Sys Library.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1775136629767749?thread_ts=1774969974.154039&cid=C04GF3S3KQF",
      },
      {
        who: "Matt Cornick",
        when: "Apr 2, 2026 08:54 PT",
        text: "Patrick showed me how to get the projector/screen controls. It works, and I remember him doing it, I haven't touched this UCI much since he's updated it. On the routing page, if you have no source selected and select a destination, it brings up the controls dynamically dependent on what destination you select. It would have made sense to not have the 'No source selected' qualifier and then also include the controls under the cog as a tab.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1775145243494969?thread_ts=1774969974.154039&cid=C04GF3S3KQF",
      },
    ],
  },
  {
    id: "uci-max-concurrent-sessions",
    title: "Q-Sys 'Max Concurrent Session Limit Reached' warning",
    severity: "P2",
    date: "Jan 21, 2026",
    rooms: ["SEA-3647", "NYC-1202", "Fleet-wide (suspected)"],
    description:
      "Matt encountered the warning multiple times. Default Core setting was 3. Reflect, QDSP user logs, AND active UCI sessions all count toward the limit. Symptom: UCIs lock out users, scripts disconnect.",
    rootCause:
      "Default Q-Sys Core session cap of 3. Inadequate for rooms with multiple monitoring/dashboard sessions plus end-user UCI access.",
    resolution:
      "Bump to 5 per Core. Fixed in Q-Sys 10.2 beta. Matt: 'I've only found this setting on SEA-3647 and NYC-1202 so far.' Fleet audit needed.",
    evidence: [
      {
        who: "Matt Cornick",
        when: "Jan 21, 2026 15:26 PT",
        text: "Q-Sys 'max concurrent session limit has been reached.' I've encountered this warning a couple of times now and decided to look into it. Looks like there's a setting that can be changed. I found it set to 3 so I'm increasing it to 5. I've only found this setting on SEA-3647 and NYC-1202 so far which are the two I've had this warning with. I'm not totally sure what it's related to but I do see QDSP user logs in frequently so maybe it's has something to do with scripts/alerting. I believe Reflect counts as a session as well and maybe a UCI?",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1769038018079579?thread_ts=1769038018.079579&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Jan 30, 2026 07:46 PT",
        text: "Beta version of Q-Sys 10.2, that deals with the 'maximum users' issue.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1769787997205509?thread_ts=1769787997.205509&cid=C04GF3S3KQF",
      },
    ],
  },
  {
    id: "uci-memory-leaks",
    title: "Touch panel script memory leaks (Q-Sys Core 'Critical Value' errors)",
    severity: "P1",
    date: "Jun 17–25, 2025",
    rooms: ["SEA-3619", "SEA-3611", "SEA-3925", "IRV-1249/1250/851", "SFO-735", "SFO-726"],
    description:
      "Patrick traced Core memory leaks to recursion patterns in touch panel scripts using Timer.CallAfter loops. Cores had to be rebooted when memory crossed a threshold. He fixed the 'Main' script across major rooms but TP-specific scripts were untouched at the time.",
    rootCause:
      "QSC documented that 'a few coding methods are known to leak system memory.' Recursive Timer.CallAfter loops were the primary culprit in custom TP scripts.",
    resolution:
      "Patrick refactored Main scripts. Splunk dashboard built to monitor memory. After update to SEA-3619, memory went down vs prior day. NYC update intentionally deferred. Fleet sweep of TP scripts may still be open.",
    evidence: [
      {
        who: "Patrick Gilligan",
        when: "Jun 25, 2025 09:06 PT",
        text: "I learned the other day from someone at Q-sys that there are a few coding methods that have been known to leak system memory. While I removed those methods in the 'Main' script, which lives in SEA-3611, 3925, 3619, IRV-1250, 1249, 851, SFO-735, 726.....I hadn't thought of the touch panel scripts, for the larger rooms. I can see now its the systems with touch panels that are the only ones leaking memory.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1750867568819919?thread_ts=1750867568.819919&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Jun 17, 2025 07:44 PT",
        text: "I read somewhere that you can't do recursion like this, where you use a timer to loop itself. This is how I was getting that status data for the touch panel, which I only added in phase 2.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1750171462169739?thread_ts=1750110637.761679&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Jun 24, 2025 08:33 PT",
        text: "I was trying to clear the errors out, that John had reported on yesterday. I pushed a 1-line update (which I do all the time), and it started bugging out... I removed ALL code from the QSC touch panel for today's session, until I have time to investigate it. So in short, that touch panel doesnt work today. Never seen an update do this.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1750779187890609?thread_ts=1750697603.606309&cid=C04GF3S3KQF",
      },
    ],
  },
  {
    id: "uci-ipad-vs-tp-discrepancy",
    title: "iPad UCI vs Q-Sys TP behavioral inconsistency",
    severity: "P2",
    date: "Jul 22–31, 2025",
    rooms: ["SEA-3647", "SEA-3611", "SEA-3619"],
    description:
      "Multiple incidents where the routing page or mute controls worked on the Q-Sys TP but failed on the iPad UCI app — or the reverse. Re-installing the Q-Sys iOS app sometimes fixed it.",
    rootCause:
      "iPad rendering of UCI uses the Q-Sys iOS app which has its own rendering pipeline. Different from the Q-Sys touch panel embedded renderer. Bugs surface inconsistently.",
    resolution:
      "John reinstalled app on the affected iPad. Patrick noted Q-Sys 10.1 release notes specifically called out 'performance issues with Zoom app UCI responsiveness on Poly TC8 and Logi Tap IP devices, where certain firmware and Zoom Rooms versions cause significant sluggishness.'",
    evidence: [
      {
        who: "John Gifford III",
        when: "Jul 22, 2025 16:29 PT",
        text: "the routing page is acting up on the iPad UCI. Works on the qsys tp.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1753226980381079?thread_ts=1753226980.381079&cid=C04GF3S3KQF",
      },
      {
        who: "John Gifford III",
        when: "Jul 22, 2025 17:16 PT",
        text: "Just finished a tech check for in the morning. It was still acting funny. Wouldn't let me mute/unmute zones just now. The qsys tp still worked like a champ.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1753230355317839?thread_ts=1753226980.381079&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Feb 9, 2026 10:08 PT",
        text: "Q-Sys 10.1 — Control: Resolved performance issues with Zoom app UCI responsiveness on Poly TC8 and Logi Tap IP devices, where certain firmware and Zoom Rooms versions cause significant sluggishness, with performance varying across devices.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1770660521609409",
      },
    ],
  },
  {
    id: "uci-zrc-plugin-offline",
    title: "Zoom Room Controls Plugin goes offline — requires Zoom-side 'kick' to recover",
    severity: "P2",
    date: "Mar 16, 2026",
    rooms: ["NYC-1202"],
    description:
      "The Zoom Room Controls Plugin (which lets `meeting.started` and `operation.time.ended` events turn the room on/off) goes offline after Q-Sys reboots. Recovery requires editing the Zoom Room's profile in Zoom Admin and saving — anything to 'kick' it.",
    rootCause:
      "Plugin authentication state appears to need refreshing after Core reboots. Not automated yet.",
    resolution:
      "Patrick: 'These are just two small things I haven't been able to automate a fix for, since they happen so rarely.' Candidate for an automated check + remediation script.",
    evidence: [
      {
        who: "Patrick Gilligan",
        when: "Mar 16, 2026 06:45 PT",
        text: "NYC-1202 - rebooted the Q-Sys and 3 items were still offline after: 2x Christie Projector (not really needed because we use serial, but nice to have a web page). 1x Zoom Room Controls Plugin, that lets a meeting.started or operation.time.ended turn the room on/off.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1773668715745849?thread_ts=1773668715.745849&cid=C04GF3S3KQF",
      },
      {
        who: "Patrick Gilligan",
        when: "Mar 16, 2026 06:50 PT",
        text: "For the ZRC Plugin, I had to go to the Zoom Room's settings page and edit the Zoom Room profile, with something insignificant, and save it. Or cut, save it, and paste it back. Anything to give it a kick.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1773669029249559?thread_ts=1773668715.745849&cid=C04GF3S3KQF",
      },
    ],
  },
  {
    id: "uci-reip-disconnect",
    title: "iPad UCI loses connection after room re-IP",
    severity: "P2",
    date: "Jan 13, 2025",
    rooms: ["SEA-3611", "Any room where DHCP reassigns"],
    description:
      "After a Core re-IPs, the Q-Sys iOS app on the controller iPad doesn't auto-rediscover — the UCI vanishes from the iPad's room list. Manual IP entry required.",
    rootCause:
      "iOS app doesn't dynamically resolve cores by DNS name. Static IP entry on each iPad. Patrick's IP/switch validator helps but doesn't auto-update iPad configs.",
    resolution:
      "Reserved IPs for every Core (covered by Patrick's daily IP/switch validator). When breaks happen: punch in the new IP manually on the iPad.",
    evidence: [
      {
        who: "John Gifford III",
        when: "Jan 13, 2025 13:21 PT",
        text: "did the uci change in 3611 this week? Just went to change the cameras for the group and it looks different from last week.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1736803286261809",
      },
      {
        who: "Patrick Gilligan",
        when: "Jan 13, 2025 13:22 PT",
        text: "I actually think that this system re-IP'd, and we need to punch in a new IP to the iPad. That was my bad for forgetting to flag that.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1736803353173669?thread_ts=1736803286.261809&cid=C04GF3S3KQF",
      },
    ],
  },
  {
    id: "uci-two-tps-confusing",
    title: "Two touch panels per room confuses users (NYC-1250)",
    severity: "P2",
    date: "Feb 19, 2024",
    rooms: ["NYC-1250"],
    description:
      "Some rooms had both a Q-Sys touch panel AND an iPad running the Zoom Rooms app. Users couldn't tell which to use; the Q-Sys panel didn't have the Zoom app. Stacey flagged this as a UX problem.",
    rootCause:
      "Legacy install pattern from before Q-Sys could run the Zoom UCI directly. Two devices doing overlapping jobs.",
    resolution:
      "Consolidate to one device per room where possible. iPad-only is the new pattern for most rooms.",
    evidence: [
      {
        who: "Stacey Newman",
        when: "Feb 19, 2024 13:45 PT",
        text: "Can we remove one it's kind of confusing as a user and the iPad does both.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1708379141890159",
      },
    ],
  },
  {
    id: "uci-qsys-connect-windows-only",
    title: "Q-Sys Connect for Zoom Rooms — Windows-only certification (strategic)",
    severity: "P1",
    date: "May 7–14, 2026",
    rooms: ["Fleet strategic"],
    description:
      "QSC announced Q-Sys Connect as a Zoom Rooms 'attached controller' — but only certified for Windows. Mac Mini (Zillow's standard) is not supported. This is the same vendor-direction signal driving the Friday G62 / Mac Mini debate.",
    rootCause: "QSC strategic direction. Microsoft Teams Rooms ecosystem alignment.",
    resolution:
      "Decision pending. Three paths: lobby IT for Windows AV appliance exception, wait for QSC Mac support, or accept Q-Sys touch panel features won't progress on Mac Mini fleet. Tuesday May 19 meeting w/ Matt should address.",
    evidence: [
      {
        who: "Cortney Eison",
        when: "May 14, 2026 22:36 PT",
        text: "'Q-SYS Connect software is now certified as a Zoom Rooms attached controller for Windows.' I would imagine that would mean that zoom rooms be run on a NUC for example rather than a Mac.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778823386718649",
        sourceUrl:
          "https://blogs.qsc.com/systems/2026/05/07/q-sys-connect-unlocks-new-flexibility-for-zoom-rooms/",
        sourceLabel: "QSC blog post",
      },
      {
        who: "Mark Hampson",
        when: "May 15, 2026 06:26 PT",
        text: "It's such a bummer we need to use windows for this. Every room deployment we've rolled out is a mac mini. We have a specific mac os AV Zoom Room config that gets pushed out to them and is managed by our CE team... it may be a tough sell.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778851565920959?thread_ts=1778823120.439739&cid=C04GF3S3KQF",
      },
      {
        who: "Cortney Eison",
        when: "May 14, 2026 22:36 PT",
        text: "Here's the TP, Q-SYS TSC-101-G3 touchscreen. Maybe we can leverage Scott at QSYS to get us a loaner for a bit so I can put it through its paces or maybe we can buy one for the lab.",
        permalink:
          "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1778823386718649",
        sourceUrl:
          "https://www.qsys.com/products-solutions/q-sys/control-io-controllers/q-sys-touch-screen-controllers/tsc-101-g3/",
        sourceLabel: "Q-SYS TSC-101-G3",
      },
    ],
  },
];

// --- BirdDog phase-out ---

export interface BirdDogDeployment {
  room: string;
  site: string;
  gear: string;
  role: string;
  knownProblems: string;
  priority: "P0" | "P1" | "P2";
}

export const BIRDDOG_DEPLOYMENTS: BirdDogDeployment[] = [
  {
    room: "SFO-735 (All Hands)",
    site: "SFO",
    gear: "BirdDog P400 4K NDI PTZ cameras (white)",
    role: "Primary cameras for All Hands events",
    knownProblems:
      "Two units have mechanical/fan noise (Apr 16, 2025). HDMI share fails after first share — Matt suspects NDI camera path as root cause (Dec 9, 2025).",
    priority: "P0",
  },
  {
    room: "NYC-1250 (NYC All Hands)",
    site: "NYC",
    gear: "BirdDog cameras + decoders (NDI for projector routing)",
    role: "Camera capture + signal routing to dual projectors",
    knownProblems:
      "Right-side BirdDog decoder failed Jan 16, 2025 — switch sees MAC but no IP. Required replacement shipment. Recurring 'routing got stuck' incidents.",
    priority: "P0",
  },
];

export interface BirdDogQuote extends Quote {}

export const BIRDDOG_SENTIMENT: BirdDogQuote[] = [
  {
    who: "Patrick Gilligan",
    when: "Dec 9, 2025 16:01 PT",
    text: "For the record Stacey, I like NDI. I strongly dislike BirdDog.",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1765324897866679?thread_ts=1765315452.328519&cid=C04GF3S3KQF",
  },
  {
    who: "Patrick Gilligan",
    when: "Nov 10, 2025",
    text: "VSI is kinda trash. Better than BD, but not great.",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1762809304923999?thread_ts=1762808815.677239&cid=C04GF3S3KQF",
  },
  {
    who: "Matt Cornick",
    when: "Dec 9, 2025 13:24 PT",
    text: "HDMI screen share [SFO-735]: I'm the point of Zoom support... I did not see this happen at home so I don't think it's a osTahoe issue. The only thing unique about this room are the NDI cams.",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1765315452328519?thread_ts=1765315452.328519&cid=C04GF3S3KQF",
  },
  {
    who: "Matt Cornick",
    when: "Apr 16, 2025 12:33 PT",
    text: "Two of the Birddog P400 4k cams are noisy. I'm fine for the SFO All Hands but I don't know that I would want to put one of them in Olympic.",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1744832034796209?thread_ts=1744832034.796209&cid=C04GF3S3KQF",
  },
  {
    who: "Mark Hampson",
    when: "Apr 16, 2025",
    text: "ugh. thats a non-starter... yeah no way. OK lets not use these.",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1744832082137079?thread_ts=1744832034.796209&cid=C04GF3S3KQF",
  },
  {
    who: "Patrick Gilligan",
    when: "Jan 16, 2025 11:48 PT",
    text: "the BirdDog decoder for the right projector is busted. The switch sees the MAC address, but no IP... we have no way of knowing if we are getting signal or not, until its tried in person. Hopefully by Lu, and not an end user. I would hate for a 80 person meeting to happen, and only the 'house left' projector shows the content.",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1737056888600269?thread_ts=1737056888.600269&cid=C04GF3S3KQF",
  },
  {
    who: "Patrick Gilligan",
    when: "Feb 6, 2025 12:46 PT",
    text: "I will be the first to admit…after 'Birddog-gate', it was miracle we hit FDoB.",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1738874798995249?thread_ts=1738873872.525929&cid=C04GF3S3KQF",
  },
  {
    who: "Stacey Newman",
    when: "May 7, 2025 11:11 PT",
    text: "I wish the Urbens were better since we paid so much but like the BirdDog we should probably have a no urben emoji.",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1746641473777329?thread_ts=1746637998.361599&cid=C04GF3S3KQF",
  },
  {
    who: "Matt Cornick",
    when: "Apr 16, 2025 13:55 PT",
    text: "Sticking to white and NDI (assuming we only have one network drop there) we're pretty limited. Panasonic AW-UE40. Aver PTZ310UV2.",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1744837289576169?thread_ts=1744832034.796209&cid=C04GF3S3KQF",
    sourceUrl: "https://www.averusa.com/products/ptz-camera/ptz310uv2",
    sourceLabel: "AVer PTZ310UV2",
  },
];

export interface CameraOption {
  id: string;
  vendor: string;
  model: string;
  resolution: string;
  transport: string;
  priceRange: string;
  whiteFinish: boolean;
  ndiNative: boolean;
  qSysNative: boolean;
  pros: string[];
  cons: string[];
  bestFor: string;
  zillowFamiliarity: string;
}

export const CAMERA_OPTIONS: CameraOption[] = [
  {
    id: "panasonic-aw-ue50",
    vendor: "Panasonic",
    model: "AW-UE50 / AW-UE40 / AW-UE160",
    resolution: "4K @ 60fps",
    transport: "NDI|HX + SDI + HDMI + USB + IP",
    priceRange: "$4,000 – $8,000",
    whiteFinish: true,
    ndiNative: true,
    qSysNative: false,
    pros: [
      "Broadcast-grade build and optics — pro-PTZ market leader",
      "White finish standard (matches All Hands aesthetic)",
      "NDI|HX native, also full SDI + HDMI for fallback",
      "Mature firmware, predictable upgrade cycle",
      "Matt already flagged AW-UE40 as a candidate Apr 16, 2025",
    ],
    cons: ["Premium price — UE160 is ~$8k", "NDI|HX (compressed) not full bandwidth NDI"],
    bestFor: "SFO-735 + NYC-1250 All Hands replacement for BirdDog P400",
    zillowFamiliarity: "Matt has mentioned. No deployments yet.",
  },
  {
    id: "aver-ptz310uv2",
    vendor: "AVer",
    model: "PTZ310UV2 / PTZ330",
    resolution: "4K @ 30fps (PTZ310UV2) / 4K @ 60fps (PTZ330)",
    transport: "NDI|HX + SDI + HDMI + USB + IP",
    priceRange: "$1,800 – $3,500",
    whiteFinish: true,
    ndiNative: true,
    qSysNative: false,
    pros: [
      "Strong price/performance — half the cost of Panasonic",
      "Zillow already deploys AVer (UE1, CAM550)",
      "White available, NDI|HX native, multi-transport",
      "Matt suggested as a candidate Apr 16, 2025",
    ],
    cons: [
      "Lower-tier build vs Panasonic",
      "30fps cap on PTZ310UV2 (PTZ330 fixes this)",
      "AVer firmware updates can be uneven",
    ],
    bestFor: "Cost-conscious All Hands or secondary cameras",
    zillowFamiliarity:
      "High — AVer is already in the fleet (UE1 in Olympic, CAM550 considered for SFO-735).",
  },
  {
    id: "qsys-nc-series",
    vendor: "QSC",
    model: "NC-12x80 / NC-20x60 (Canon sensor line)",
    resolution: "4K (12x or 20x optical zoom)",
    transport: "Q-LAN / Q-Sys NV native (PoE+)",
    priceRange: "$4,500 – $6,500",
    whiteFinish: false,
    ndiNative: false,
    qSysNative: true,
    pros: [
      "Canon image sensor — photography-grade optics in a conferencing PTZ",
      "Native Q-Sys ecosystem — single fabric for cameras + audio + control",
      "ACPR (Automatic Camera Preset Recall) out of the box — Patrick wanted to play with this",
      "Same Q-Sys Designer workflow as everything else in the rack",
      "Aligns with the April 17 Q-Sys NV decision for HDMI share",
      "QSC bills it as their new conferencing flagship — strong forward-investment signal",
    ],
    cons: [
      "Black finish (no white SKU — would need design exception or wrap)",
      "Vendor lock-in to QSC ecosystem",
      "Requires Q-Sys Core in every room (already true for All Hands)",
      "Newer product — less third-party deployment data than Panasonic/Sony",
    ],
    bestFor:
      "Tier 3 All Hands rooms where Q-Sys is already the backbone and ACPR + Canon optics matter more than white finish",
    zillowFamiliarity:
      "Q-Sys ecosystem is the team standard. Patrick explored ACPR Oct 2024 but had to write a parser for the older MXA910s. NC-series + 920 mics + Q-Sys NV would make ACPR work natively.",
  },
  {
    id: "poly-e70",
    vendor: "Poly (HP)",
    model: "Studio E70",
    resolution: "4K dual-sensor (electronic framing, ~35x effective zoom range)",
    transport: "USB-C + IP (NDI|HX available) + LLN port for native G62 pairing",
    priceRange: "$3,000 – $3,800",
    whiteFinish: true,
    ndiNative: true,
    qSysNative: false,
    pros: [
      "Dual-sensor design — captures the whole room and a tight crop simultaneously",
      "Cinematic AI framing — no mechanical PTZ to fail (and no moving fan noise)",
      "White finish standard, low-profile mount",
      "Native Poly Lens cloud management — Cortney already proposed for Tier 3 large spaces",
      "Pairs natively with Poly G62 codec via LLN (Cat6) for daisy-chained large room scaling",
    ],
    cons: [
      "Electronic framing only — no optical PTZ tracking like the P400 or NC-series",
      "Best when paired with G62 codec; standalone deployment with Mac Mini works but loses Poly Lens integration",
      "Newer Poly platform — service-pack cadence is faster than enterprise teams prefer",
    ],
    bestFor:
      "45+ person spaces where 'pick up the whole room' matters more than tight subject framing. Cortney's original pitch for SFO-735/NYC-1250-class rooms.",
    zillowFamiliarity:
      "Cortney deployed similar at Airbnb. Mark + Matt have no Poly Studio deployments at Zillow yet.",
  },
  {
    id: "poly-e60",
    vendor: "Poly (HP)",
    model: "Studio E60",
    resolution: "4K @ 60fps, 12x optical zoom",
    transport: "USB-C + IP (NDI|HX available) + LLN port",
    priceRange: "$2,200 – $2,800",
    whiteFinish: true,
    ndiNative: true,
    qSysNative: false,
    pros: [
      "True optical 12x PTZ — direct 1:1 functional replacement for BirdDog P400",
      "White finish standard, slim profile",
      "Poly Lens cloud dashboard (one-place fleet management)",
      "USB-C + IP + NDI — most flexible single-cable deployment of the candidate cameras",
      "Pairs with G62 if/when the team adopts that codec",
    ],
    cons: [
      "12x zoom vs P400 21x — slightly less reach in very large rooms",
      "Newer in market vs Panasonic/Sony — less independent track record",
      "Poly enterprise support story uneven post HP acquisition",
    ],
    bestFor: "Direct P400 swap at SFO-735 and NYC-1250 with white-finish and NDI continuity",
    zillowFamiliarity:
      "None at Zillow. Cortney has Airbnb experience with the Poly Studio line.",
  },
  {
    id: "sony-srg-x400",
    vendor: "Sony",
    model: "SRG-X400 / BRC-X400",
    resolution: "4K @ 60fps",
    transport: "NDI|HX + SDI + HDMI + IP",
    priceRange: "$3,500 – $5,500",
    whiteFinish: true,
    ndiNative: true,
    qSysNative: false,
    pros: ["Excellent low-light performance", "Mature broadcast pedigree", "White finish available"],
    cons: ["Less familiar to Zillow team", "No QSC integration advantage"],
    bestFor: "Broadcast-quality replacement when Sony color science is desired",
    zillowFamiliarity: "None yet. Would require new vendor relationship.",
  },
  {
    id: "ptzoptics-move-se",
    vendor: "PTZOptics",
    model: "Move SE 4K",
    resolution: "4K @ 60fps",
    transport: "NDI|HX2 + SDI + HDMI + USB + IP",
    priceRange: "$1,500 – $2,500",
    whiteFinish: true,
    ndiNative: true,
    qSysNative: false,
    pros: [
      "Lowest cost option",
      "NDI|HX2 native (newer compression)",
      "Popular in EDU/HOW market — well-documented",
    ],
    cons: [
      "Build quality below Panasonic / Sony tier",
      "Limited enterprise support track record",
    ],
    bestFor: "Lab / dev space / secondary camera positions where cost matters more than tier",
    zillowFamiliarity: "None. Would be a new vendor.",
  },
];

export interface RoomKitOption {
  id: string;
  vendor: string;
  model: string;
  category: "Appliance codec" | "Native room kit" | "Hybrid";
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  zillowStatus: string;
}

export const TIER3_ROOM_KIT_OPTIONS: RoomKitOption[] = [
  {
    id: "poly-g62",
    vendor: "Poly (HP)",
    model: "Studio G62 + E60/E70 cameras (Tier 3 kit)",
    category: "Appliance codec",
    description:
      "Replaces Mac Mini + capture card + decoder with a single locked-down Android appliance codec. Runs Zoom Rooms, Microsoft Teams, or Google Meet natively (platform swap is a 2-click drop-down in Poly Lens cloud). G62 is the codec; Poly Studio E60/E70 cameras dock natively via the LLN port over standard Cat6.",
    pros: [
      "Locked appliance — no macOS updates, no Apple ID, no 9am-update-breaks-the-room class of failure",
      "Multi-platform native: Zoom Rooms / Teams / Meet swap via Poly Lens cloud",
      "Up to 4 USB cameras + IP cameras over LLN — scales beyond Mac Mini limits",
      "Single cloud dashboard (Poly Lens) for fleet view",
      "Eliminates the entire HDMI-share capture-card chain by ingesting content natively",
      "Future-proof against Q-Sys Connect's Windows-only direction (May 14, 2026 QSC announcement)",
    ],
    cons: [
      "Android-based — Matt's pushback: 'Mac Mini will outperform any Android based system. There are Zoom Room features that aren't even supported on any Android appliances.'",
      "Zillow IT decommissioned all non-laptop PC appliances last year — Android appliance approval is unknown territory",
      "Net-new vendor relationship and management surface",
      "$3,500–$5,000 per unit (codec only; cameras additional)",
    ],
    bestFor:
      "Tier 3 large/complex rooms (45+ person spaces) — Cortney's original pitch. Or any room where macOS update risk has been a repeat outage cause.",
    zillowStatus:
      "Pitched by Cortney May 14–15. Matt pushed back. Stacey reframed as 'Tier 3 large/complex room standard rather than replacing what you have.' Tuesday May 19 follow-up meeting scheduled.",
  },
  {
    id: "qsys-native-tier3",
    vendor: "QSC",
    model: "Q-Sys NC cameras + NV endpoints + Core + Mac Mini ZR host",
    category: "Native room kit",
    description:
      "The 'all-in on Q-Sys' path. NC-series Canon-sensor cameras for capture, NV-21/NV-32 for AV-over-IP routing, Q-Sys Core for DSP and control, Mac Mini as the Zoom Rooms host. Everything except the host lives in one Q-Sys Designer file.",
    pros: [
      "Single vendor, single Designer file, single support story",
      "ACPR works out of the box",
      "Aligns with April 17 Q-Sys NV decision and the team's standardization direction",
      "Doesn't disturb the Mac Mini / Jamf / CE management workflow that's already in place",
    ],
    cons: [
      "Still inherits Mac Mini operational tax (OS updates, Apple Intelligence popups, etc.)",
      "Doesn't address the Q-Sys Connect Windows-only future direction",
      "QSC NC cameras are black-only (Workplace/Design conversation needed)",
    ],
    bestFor:
      "All Hands rooms staying on Mac Mini host but consolidating cameras + AVoIP under Q-Sys",
    zillowStatus:
      "Closest to the current standard. Lowest-risk path to retire BirdDog without re-opening the Mac Mini debate.",
  },
  {
    id: "neat-tier3",
    vendor: "Neat",
    model: "Neat Center + Neat Bar Pro + Neat Pad",
    category: "Native room kit",
    description:
      "Neat's purpose-built Zoom Rooms kit. Neat Center is a 360-degree table-mounted camera with AI framing; Neat Bar Pro adds a front camera + speakerbar. All managed in Neat's cloud dashboard. Native Zoom Rooms hardware — no Mac Mini.",
    pros: [
      "Zillow already standardizes on Neat for most zRetreat rooms — extension, not new vendor",
      "Native Zoom Rooms (no Mac Mini, no Jamf, no macOS update risk)",
      "Neat Center solves the 'pick up the whole room' problem electronically",
      "Cleanest operational story — Stacey reportedly favors Neat",
    ],
    cons: [
      "Locked to Zoom Rooms — no multi-platform flexibility (vs G62's swap-to-Teams/Meet)",
      "Not ideal for very large rooms (SFO-735, NYC-1250 may be at upper limit)",
      "Doesn't integrate with Q-Sys natively (DSP duplication if you want Q-Sys mics)",
    ],
    bestFor:
      "Tier 2 rooms (15–30 person) and possibly the lower end of Tier 3. Already in the Zillow zRetreat spec.",
    zillowStatus:
      "Existing fleet standard for zRetreat rooms. Untested at SFO-735 / NYC-1250 scale.",
  },
];

export interface BirdDogPhaseStep {
  phase: number;
  name: string;
  timing: string;
  actions: string[];
}

export const BIRDDOG_PHASE_PLAN: BirdDogPhaseStep[] = [
  {
    phase: 1,
    name: "Inventory & decision",
    timing: "Days 1–14",
    actions: [
      "Confirm exact BD inventory at SFO-735 and NYC-1250 (SN, MAC, role)",
      "Confirm Mark's 'Birddog Remediation' drawings from Jan 2025 — what was scoped?",
      "Bring camera option matrix to Matt + Mark for selection",
      "Decide: keep NDI as transport or move cameras to Q-Sys NV / QSC NC",
      "Get 2026 AOP signal — is there budget for SFO-735 + NYC-1250 in 2026 or 2027?",
    ],
  },
  {
    phase: 2,
    name: "Pilot one room",
    timing: "Days 14–45",
    actions: [
      "Pick one room (recommend SFO-735 — closer to team for hands-on)",
      "Order pilot cameras (2 units min for redundancy)",
      "Schedule downtime window with Workplace/Gatherings",
      "Swap cameras, validate ACPR / multi-cam workflow",
      "Document install gotchas",
      "Confirm BirdDog decoder is decommissioned and signal flows through Q-Sys NV",
    ],
  },
  {
    phase: 3,
    name: "Roll out + remove BD",
    timing: "Days 45–90",
    actions: [
      "Apply pilot lessons to NYC-1250 (or do both in parallel if pilot is clean)",
      "Update room as-builts and IP schedule",
      "Surplus / sell / donate the BirdDog gear (P400s + decoders)",
      "Remove BirdDog from spare parts inventory",
      "Update Q-Sys file templates to not reference BD plugins",
      "Close the loop in WAVE sync — write up the migration as a wins/challenges item",
    ],
  },
];

export const TEAM = {
  Matt: {
    role: "Senior IC, Technical Gravity Well",
    relationship:
      "Now your peer, not your senior. Has been carrying the engineering load alone since Patrick left. Free him up first; debate architecture second.",
    posture: "Lead with questions, not pitches. He'll respect 'help me understand' over 'here's a better way.'",
  },
  Mark: {
    role: "Manager / PM / Budget / Vendor / Zillow IT politics",
    relationship: "Decides what gets bought. Allergic to custom one-offs. Loves standardization.",
    posture: "Show him you're self-sufficient. Patrick had 4 years of context — Mark shouldn't have to babysit you.",
  },
  Stacey: {
    role: "Director — People + Leadership",
    relationship:
      "Cares about user feedback, leadership visibility, wins/challenges email Friday, adoption.",
    posture: "Use the Friday email as your scoreboard. Lead with closed deliverables, not promises.",
  },
  Patrick: {
    role: "Predecessor — gone",
    relationship: "His tooling, UCIs, plugins, alerts, IP validator, GitLab repos are now your portfolio.",
    posture: "Claim, don't ask. Document as you go.",
  },
};

// =========================================================================
// PATRICK AUDIT — categorize every Patrick contribution so we can quantify
// what was real (analytics + support + direction) vs. what was fluff /
// unanswered / left open for the team.
// =========================================================================

export type PatrickCategory =
  | "Analytics" // monitoring, dashboards, alerts, data plumbing
  | "Support" // ad-hoc fixes, ticket work, room-by-room help
  | "Direction" // architectural / standards calls he made
  | "Fluff"; // open, unanswered, abandoned, or "left it for someone else"

export interface PatrickContribution {
  id: string;
  title: string;
  category: PatrickCategory;
  status: "Delivered" | "Partial" | "Open" | "Broken since departure";
  description: string;
  pickedUpBy?: ("Matt" | "Mark" | "Stacey" | "Cortney" | "John" | "QSC")[];
  // Source: Slack quote or GitLab project
  quote?: string;
  who?: string;
  when?: string;
  permalink?: string;
}

export const PATRICK_PORTFOLIO: PatrickContribution[] = [
  // ---------- ANALYTICS ----------
  {
    id: "av-alerts-channel",
    title: "#av-alerts Slack channel (Domotz + custom alerts routing)",
    category: "Analytics",
    status: "Broken since departure",
    description:
      "Created the av-alerts channel to consolidate Domotz + Splunk + Lambda alerts into one signal. Goal: only meaningful alerts, low noise. Was Patrick's pet project.",
    pickedUpBy: ["Matt"],
    who: "Patrick Gilligan",
    when: "Sep 2024",
    quote:
      "I create the public channel av-alerts but only invited Mark so far, because its still a wip. notice the word Domotz isn't in the channel, because over time, I want this to be a channel of mostly meaningful alerts, that aren't so noisy we don't pay attention to them.",
  },
  {
    id: "splunk-dashboards",
    title: "Splunk dashboard mockups (WAVE Sprint A)",
    category: "Analytics",
    status: "Partial",
    description:
      "Mocked up several dashboard models in Splunk for AV health. Asana subtask sequence Jan 2024.",
    pickedUpBy: ["Matt"],
    when: "Jan 2024 (WAVE Sprint A 1/8 - 1/19)",
  },
  {
    id: "lambda-reflect-alerting",
    title: "AWS Lambda Reflect alerting + Control Link Server noise filtering",
    category: "Analytics",
    status: "Delivered",
    description:
      "Wrote Lambda to surface Q-Sys Reflect events to Slack and filter the noisy 'Control Link Server...' messages. Includes auto power-cycle of QSC core on detected hangs.",
    pickedUpBy: ["Matt"],
    when: "Dec 2023",
  },
  {
    id: "daily-updater",
    title: "Daily updater / monitoring proxy",
    category: "Analytics",
    status: "Broken since departure",
    description:
      "Daily monitoring proxy that hit every Q-Sys core + device for health. The script Matt couldn't get to run the morning after Patrick was deactivated.",
    pickedUpBy: ["Matt"],
    quote:
      "AV Alerts: I just noticed that it looks like the alerts failed to run this morning. I'm guessing this has to do with Patrick officially being gone. Probably something he overlooked that would fail once he was de-activated. I'm poking around now to see what, if anything, I can do.",
    who: "Matt Cornick",
    when: "Day 1 after Patrick's offboarding",
  },
  {
    id: "av-devices-updater",
    title: "GitLab: av-ops-tools / av-devices-updater",
    category: "Analytics",
    status: "Delivered",
    description:
      "GitLab project that pulls AV switch + device configs and backs them up to files. Patrick said the v1 was written in <20 minutes with AI.",
    pickedUpBy: ["Cortney"],
    quote:
      "I just used one of Zillow's newer AI coding tools to write an app that pulls all of our AV switch configs and backs them up to files. It took me <20 minutes. Completely insane.",
    who: "Patrick Gilligan",
    when: "Jan 13, 2025",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1736812165080269?thread_ts=1736803286.261809&cid=C04GF3S3KQF",
  },
  {
    id: "q-sys-slack-updater",
    title: "GitLab: av-ops-tools / q-sys-slack-updater",
    category: "Analytics",
    status: "Delivered",
    description:
      "Auto-restart on plugin script error, posts to #av-team / #av-alerts. The script that 'restart the script if it errors' lived here.",
    pickedUpBy: ["Cortney"],
    quote:
      "A few weeks ago, I did add a feature to the alerting script - if the automation discovers a script error, it will restart the script. Its been working great so far, I will investigate why it didn't restart the Somfy one.",
    who: "Patrick Gilligan",
  },
  {
    id: "underscore-naming",
    title: "Underscore tagging convention for non-monitored dev/test devices",
    category: "Analytics",
    status: "Delivered",
    description:
      "Established naming rule: anything dev/test gets a leading underscore so the monitoring stack ignores it. Small but real standard.",
    pickedUpBy: ["Cortney"],
    quote:
      "I love how Matt added the underscore here. I think, as time goes on, anything that is for development purposes, whether its a zoom room, hostname for a device we are just using for testing, or anything else, the _ will notate the fact that its for testing, and not to be monitored or alerted.",
    who: "Patrick Gilligan",
  },
  {
    id: "ip-validator",
    title: "IP doc validator + Zillow internal AV switch config tool",
    category: "Analytics",
    status: "Delivered",
    description:
      "Patrick + Matt eliminated clerical fields from the IP doc, automated config validation. Matt: 'tried to eliminate a bunch of clerical entries that end up out-dated and not maintained.'",
    pickedUpBy: ["Matt", "Cortney"],
    who: "Matt Cornick",
    quote:
      "As far as SN, MACs, etc we have the IP doc but it's really geared towards managing devices. SNs aren't on there because they can be a pain to always enter and you don't really need them unless you're replacing gear. Patrick and I tried to eliminate a bunch of clerical entries that end up out-dated and not maintained.",
  },
  {
    id: "monitoring-doc",
    title: "Comprehensive monitoring + alerting doc (promised, never delivered)",
    category: "Fluff",
    status: "Open",
    description:
      "Patrick: 'Eventually, I will have a doc that describes all of our monitoring and alerting efforts.' That doc never landed. The monitoring lived in his head.",
    pickedUpBy: ["Cortney"],
    quote:
      "Just a documented understanding of what the tags are meant to do, so we are all on the same page. Eventually, I will have a doc that describes all of our monitoring and alerting efforts.",
    who: "Patrick Gilligan",
  },
  {
    id: "monitoring-handoff",
    title: "Monitoring handoff / runbook for Matt / Stacey",
    category: "Fluff",
    status: "Broken since departure",
    description:
      "Stacey explicitly asked for 'operational excellence — dependable systems' as the team's annual goal. Patrick agreed and then the runbook never shipped. Matt is now reverse-engineering the stack.",
    pickedUpBy: ["Matt", "Stacey"],
    quote:
      "This is a good start thanks Patrick, this year I'd like to focus on operational excellence as a team and having systems that are dependable, I see us doing this in a few ways, remote monitoring, better Bug Tracking, and having a dev environment to test before putting hardware and code updates there before going to Production environments, so having this data as our baseline to see how we can reduce eventual alerts and downtime will be really helpful.",
    who: "Stacey Newman",
  },

  // ---------- SUPPORT ----------
  {
    id: "sea-3611-cto-response",
    title: "SEA-3611 CTO incident response",
    category: "Support",
    status: "Partial",
    description:
      "Patrick responded to the CTO incident with the 'no touch panel' thesis. Resolved short-term but never re-tuned SEA-3611 + the rooms with the same UCI pattern.",
    pickedUpBy: ["Cortney"],
    when: "Mar 4, 2025",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1741123050535009?thread_ts=1741123050.535009&cid=C04GF3S3KQF",
  },
  {
    id: "main-script-memory-leaks",
    title: "Memory-leak sweep on Q-Sys Main scripts",
    category: "Support",
    status: "Partial",
    description:
      "Refactored recursive Main scripts to stop the per-room memory leak. Explicitly flagged TP scripts as not yet touched — left for the team.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "max-concurrent-sessions",
    title: "Max-concurrent-sessions check (2 cores only)",
    category: "Support",
    status: "Partial",
    description:
      "Matt + Patrick raised max concurrent sessions on 2 cores to unblock UCIs. Fleet was never swept.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "sea-3647-build",
    title: "SEA-3647 single-page UCI build",
    category: "Support",
    status: "Delivered",
    description:
      "Built the simplified single-page UCI at SEA-3647 — the proof point Patrick used to validate his 'less is more' thesis.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "qsc-core-auto-cycle",
    title: "Auto power-cycle QSC core on hang (scripted via Lambda)",
    category: "Support",
    status: "Delivered",
    description:
      "Hooked into the Reflect alerting Lambda — if the core hangs, the script power-cycles it.",
    pickedUpBy: ["Matt"],
  },
  {
    id: "applescript-elgato",
    title: "AppleScript: Elgato stream light tied to meeting status",
    category: "Fluff",
    status: "Delivered",
    description:
      "Cute Cursor-AI demo, not Zillow infra. Useful to cite as a Cursor success story but adds nothing to room reliability.",
    quote:
      "I just brought my Elgato stream light of the garage. I used Cursor AI to write an Apple script that detects whether im in a meeting every 5 seconds and toggles my light accordingly. What a time to be alive. I wrote 0 code and was done in 10 minutes, after debugging.",
    who: "Patrick Gilligan",
    when: "Apr 1, 2025",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1743535494415339?thread_ts=1743535494.415339&cid=C04GF3S3KQF",
  },

  // ---------- DIRECTION ----------
  {
    id: "single-page-uci-direction",
    title: "Single-page UCI as the fleet template",
    category: "Direction",
    status: "Delivered",
    description:
      "Decided the team would standardize on single-page UCIs. Real direction — debatable, but a real call. Now being re-tiered by Cortney.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "no-touch-panel-thesis",
    title: "\"No touch panel if no operator\" thesis",
    category: "Direction",
    status: "Partial",
    description:
      "Architectural call post-CTO. Cortney's counter-thesis pushes back: removing a panel just makes a BYOD room. Documented on /uci as a half-standard.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "cursor-ai-stack",
    title: "Cursor + Claude + NotebookLM as the Q-Sys author stack",
    category: "Direction",
    status: "Delivered",
    description:
      "Made AI-assisted Lua/Q-Sys authoring the team's default workflow. The single best direction Patrick set — Cortney is inheriting it wholesale.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "aws-vm-designer",
    title: "Q-Sys Designer on shared AWS Windows VM",
    category: "Direction",
    status: "Partial",
    description:
      "Set up the shared AWS Windows VM ($250/mo, 70GB) so Matt + Patrick could share a Q-Sys Designer workstation. TeamViewer pre-installed for QSC remote support.",
    pickedUpBy: ["Matt", "Cortney"],
    quote:
      "I need to close out designer 10.1 please. I am going to delete it. This VM is out of HD space. We only have 70gigs on this VM, and AWS charges us like $250 a month for it.",
    who: "Patrick Gilligan",
    when: "Jan 30, 2026",
    permalink:
      "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1769789035479339?thread_ts=1769787997.205509&cid=C04GF3S3KQF",
  },
  {
    id: "birddog-deployments",
    title: "BirdDog NDI camera deployments (event spaces)",
    category: "Direction",
    status: "Partial",
    description:
      "Patrick stood up BirdDog as the all-hands / event-space camera. The team is now mid-phase-out (see /birddog). Direction was real; the choice didn't age well.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "gitlab-migration",
    title: "Moved Q-Sys + AV scripts onto GitLab with #av-team push-notifications",
    category: "Direction",
    status: "Delivered",
    description:
      "Established GitLab as the source of truth for AV code, with #av-team bot posting on push. Real engineering direction.",
    pickedUpBy: ["Cortney", "Matt"],
  },
  {
    id: "asana-to-jira",
    title: "Asana → Jira migration for WAVE tickets",
    category: "Direction",
    status: "Delivered",
    description:
      "Patrick + Matt moved AV work tracking from Asana to Jira (WAVE board). Cleaner workflow, but Patrick left mid-migration. Matt: 'Jira is newish for us and we're also trying to get in the routine.'",
    pickedUpBy: ["Matt"],
  },

  // ---------- FLUFF / OPEN / UNANSWERED ----------
  {
    id: "irv-802-hidden-controls",
    title: "IRV-802: hidden projector / screen controls",
    category: "Fluff",
    status: "Open",
    description:
      "Patrick removed projector and screen controls from the UCI; the only way to access them was via 'No source selected' on the routing page (undiscoverable). Matt had to roll screens up from QDS manually.",
    pickedUpBy: ["Matt", "Cortney"],
    quote:
      "I also found out that I think Patrick removed projector and screen controls from the UI :eyeroll: so I had to roll the screens up and turn projectors off manually from QDS.",
    who: "Matt Cornick",
  },
  {
    id: "irv-802-followup",
    title: "IRV-802 UCI redesign — Mark's open question",
    category: "Fluff",
    status: "Open",
    description:
      "Mark explicitly asked whether this room should just be a simple Zoom Room and where the routing plugin even came from. Patrick was the only person who knew. Now unanswered.",
    pickedUpBy: ["Mark", "Cortney"],
    quote:
      "Looking at the file now, it should be redone. Correct me if I'm wrong but can't this just be a simple Zoom Room? Do they really need manual routing and all that? Also, do you know where this plugin comes from? Did Patrick write it or get it from his Q-Sys community? It's not on the Q-Sys Library.",
    who: "Mark Hampson",
  },
  {
    id: "plugin-provenance",
    title: "Custom Q-Sys plugin provenance (projector control + others)",
    category: "Fluff",
    status: "Open",
    description:
      "Mark doesn't know if Patrick wrote the plugins or pulled them from the Q-Sys community Discord. No license info, no support contact. Black-box infrastructure.",
    pickedUpBy: ["Mark", "Cortney"],
  },
  {
    id: "hdmi-fleet-issue",
    title: "HDMI sharing reliability across the fleet",
    category: "Fluff",
    status: "Open",
    description:
      "Recurring HDMI complaint (EDID handshake / source switching). Patrick acknowledged the issue but never proposed a fleet fix. See /hdmi — Cortney's NV-endpoint replacement proposal.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "tcc2-vs-mxa920",
    title: "NYC-1204 ceiling mics: TCC2 vs MXA920 spec call",
    category: "Fluff",
    status: "Open",
    description:
      "Mark asked Patrick which ceiling-mic platform to standardize on for the NYC event space. Never got an answer. Tuning passes on the existing TCC2 also never happened.",
    pickedUpBy: ["Mark", "Cortney"],
  },
  {
    id: "tp-scripts-leaks",
    title: "TP scripts memory-leak refactor",
    category: "Fluff",
    status: "Open",
    description:
      "Patrick fixed Main scripts and explicitly flagged TP scripts as the next pass — and then left.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "max-sessions-fleet",
    title: "Max-concurrent-sessions audit on remaining cores",
    category: "Fluff",
    status: "Open",
    description:
      "Only 2 cores were ever bumped. The rest of the fleet still defaults low — silent UCI failures continue.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "mac-mini-vs-windows",
    title: "Mac Mini host vs. Q-Sys Connect Windows-only architectural conflict",
    category: "Fluff",
    status: "Open",
    description:
      "Patrick punted on this entirely. Zillow standard is Mac Mini; Q-Sys Connect for Zoom Rooms is Windows-only. The conflict was never escalated to Matt + IT as a formal decision.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "wav16-premature-close",
    title: "WAV-16 closed prematurely",
    category: "Fluff",
    status: "Open",
    description:
      "Ticket got resolved-and-closed without addressing all root causes. Documented on /issues — Cortney is reopening.",
    pickedUpBy: ["Cortney"],
  },
  {
    id: "neat-pickup-gaps",
    title: "Neat Bar Pro / Center / Board pickup gaps in event spaces",
    category: "Fluff",
    status: "Open",
    description:
      "No documented decision on whether a ceiling mic should be added to Neat Center / Neat Board spaces. Patrick never specced it.",
    pickedUpBy: ["Mark", "Cortney"],
  },
  {
    id: "ipad-low-battery-script",
    title: "iPad / dock low-battery → Slack webhook automation",
    category: "Fluff",
    status: "Open",
    description:
      "Matt asked Patrick to script a Controller / scheduling-display low-battery webhook into a Slack channel — easy lift Patrick acknowledged but never delivered. SFO-07 still gets rooms knocked offline by dead iPads.",
    pickedUpBy: ["Matt", "Cortney"],
    quote:
      "I found two iPads off of their chargers yesterday EOD at SFO-07, one of which was dead. Unless users know how to pair to a room, this leaves the room unusable until the iPad gets enough charge to turn back on which takes awhile. What I believe is an easy lift that I've seen done at other sites, we use Controller or scheduling display battery is low webhook and have it sent to a channel.",
    who: "Matt Cornick",
  },
  {
    id: "deactivation-blast-radius",
    title: "Deactivation blast radius — scripts tied to Patrick's auth",
    category: "Fluff",
    status: "Broken since departure",
    description:
      "Patrick's Lambda + alerting jobs failed the morning he was officially deactivated because they ran under his identity. He knew this and never re-keyed.",
    pickedUpBy: ["Matt", "Cortney"],
  },
  {
    id: "backfill-hire",
    title: "Patrick backfill req → Cortney hire",
    category: "Direction",
    status: "Delivered",
    description:
      "Stacey ran the backfill: req went live for 48 hours, top 10 candidates pipeline, 3-way interview panel. That's how Cortney landed on the team.",
    pickedUpBy: ["Stacey"],
    quote:
      "Ok Patrick's backfill req is going live today and then will be up for 48 hours and they'll be sending me the top 10 candidates and then all 3 of us will be able to interview them.",
    who: "Stacey Newman",
  },
];

// Who is currently picking up which Patrick item (post-departure handoff).
// This is "what items is he working on with Matt/Mark/Stacey" reframed — Patrick
// isn't working on anything anymore; these are the things they're inheriting.
export interface ActiveHandoff {
  owner: "Matt" | "Mark" | "Stacey" | "Cortney";
  contributionIds: string[];
  note: string;
}

export const ACTIVE_HANDOFFS: ActiveHandoff[] = [
  {
    owner: "Matt",
    contributionIds: [
      "daily-updater",
      "av-alerts-channel",
      "lambda-reflect-alerting",
      "qsc-core-auto-cycle",
      "splunk-dashboards",
      "irv-802-hidden-controls",
      "ipad-low-battery-script",
      "deactivation-blast-radius",
      "asana-to-jira",
      "aws-vm-designer",
      "monitoring-handoff",
    ],
    note:
      "Matt is reverse-engineering the monitoring stack alone. He's also the one who manually rolled screens at IRV-802 when the UCI hid the controls. Free him up first — the most leveraged use of Cortney's first month is sharing the load on alerts.",
  },
  {
    owner: "Mark",
    contributionIds: [
      "plugin-provenance",
      "irv-802-followup",
      "tcc2-vs-mxa920",
      "neat-pickup-gaps",
    ],
    note:
      "Mark is asking the questions Patrick never answered: plugin origins, ceiling-mic spec, whether IRV-802 should just become a simple Zoom Room. Give him decisions, not options.",
  },
  {
    owner: "Stacey",
    contributionIds: ["backfill-hire", "monitoring-handoff"],
    note:
      "Stacey ran the backfill (Cortney's req) and owns the 'operational excellence' annual goal Patrick never delivered the runbook for. Friday wins/challenges email is her scoreboard.",
  },
  {
    owner: "Cortney",
    contributionIds: [
      "no-touch-panel-thesis",
      "single-page-uci-direction",
      "sea-3611-cto-response",
      "main-script-memory-leaks",
      "tp-scripts-leaks",
      "max-sessions-fleet",
      "max-concurrent-sessions",
      "mac-mini-vs-windows",
      "hdmi-fleet-issue",
      "wav16-premature-close",
      "birddog-deployments",
      "cursor-ai-stack",
      "av-devices-updater",
      "q-sys-slack-updater",
      "underscore-naming",
      "monitoring-doc",
      "ip-validator",
      "gitlab-migration",
    ],
    note:
      "Everything else lands on Cortney. Half of it is genuinely useful infra to inherit; the other half is fluff to clean up or hand back to the team for a real debate.",
  },
];

// =========================================================================
// PATRICK PATTERNS — observed strengths and weak spots so Cortney can
// inherit the good and fill the gaps. Each pattern is backed by a Slack quote.
// =========================================================================

export interface PatrickPattern {
  id: string;
  kind: "Strength" | "Weakness";
  pattern: string;
  evidence: string;
  who?: string;
  when?: string;
  permalink?: string;
  cortneyMove: string; // what Cortney should do about it
}

export const PATRICK_PATTERNS: PatrickPattern[] = [
  // ---------- STRENGTHS to inherit and amplify ----------
  {
    id: "noise-vs-signal",
    kind: "Strength",
    pattern: "Thought in noise-vs-signal terms — relentlessly killed noisy alert channels.",
    evidence:
      "A big part of building monitoring is cleaning up the noise. I am currently working on Zoom's webhooks, because I would like this channel to go away entirely, and have site specific slack messages for important messages, the rest go to the dashboard in Splunk. That way, we have the data for troubleshooting, but only get Slack messages if a reaction is expected.",
    who: "Patrick Gilligan",
    cortneyMove:
      "Keep this discipline. Every new alert goes to Splunk by default; only escalates to a Slack channel if a human reaction is expected. Don't reverse this with chatty alerting just because Splunk feels harder.",
  },
  {
    id: "re-poll-pattern",
    kind: "Strength",
    pattern: "Re-poll before alerting — confirm the failure is still present, then notify.",
    evidence:
      "Old way: Reflect sees error → Lambda → Slack + Splunk. New way: Reflect sees error → Lambda → polls the Reflect API on the device that just saw an error → if STILL in error, alert; if not, just logs to console.",
    who: "Patrick Gilligan",
    cortneyMove:
      "This is the gold-standard alerting pattern. Apply it to every new source (Domotz, Zoom webhooks, Neat). Patrick already built the Lambda template — clone it.",
  },
  {
    id: "ai-tooling-defaults",
    kind: "Strength",
    pattern: "Made AI-assisted authoring the default for Q-Sys Lua + Apple/Bash scripting.",
    evidence:
      "I just used one of Zillow's newer AI coding tools to write an app that pulls all of our AV switch configs and backs them up to files. It took me <20 minutes.",
    who: "Patrick Gilligan",
    when: "Jan 13, 2025",
    cortneyMove:
      "Inherit and broaden. Use Cursor to make Patrick's Lua / Lambda code LEGIBLE to Mark + Matt — solve Patrick's biggest weakness (single-coder lock-in) with the same tool that made him productive.",
  },
  {
    id: "rcas",
    kind: "Strength",
    pattern: "Wrote real RCAs when something went wrong.",
    evidence:
      "Here is the RCA for our issues in IRV. Tedious, but it was good practice to go through this. I think there are several things we can learn from here. I documented as much as good, and tagged a few of you as well.",
    who: "Patrick Gilligan",
    cortneyMove:
      "Find the IRV RCA doc in Google Drive (1DLhhQMdnv-dENGATLbzBWYi33mXc35bm6kPOyWg9ntA) and use the same format for every P0/P1 going forward. RCA discipline is Patrick's clearest team-supporting habit.",
  },
  {
    id: "swim-lanes",
    kind: "Strength",
    pattern: "Defended AV ↔ IT swim lanes — refused to take on liability that wasn't ours.",
    evidence:
      "I think we should hold off on the IT advice until we put some documentation together. And I think we need some better 'swim lanes,' as Greg used to call it, between what is AV and what is IT. Last, I think that more IT items that we weigh in on, the more we open ourselves up to liability on those topics. 'BUT AV TOLD US WE NEED TO...'",
    who: "Patrick Gilligan",
    cortneyMove:
      "Keep the swim lanes. When IT asks for AV input on iPad MDM, Zoom Rooms hosts, or laptops — answer narrowly to the AV impact, don't take ownership of IT's domain. Patrick's discipline here protected the team.",
  },
  {
    id: "team-load-awareness",
    kind: "Strength",
    pattern: "Publicly acknowledged what the dashboard didn't show — Mark + John's invisible work.",
    evidence:
      "I usually look at the dashboard once per sprint, and this week, it makes me look like a rockstar and everyone look lazy (see screenshot). Doesn't include the fact that John is there every day, for example. Doesn't include the 9 million things that Mark is handling daily.",
    who: "Patrick Gilligan",
    cortneyMove:
      "Friday wins/challenges email (Stacey's scoreboard) — call out Mark + Matt + John work that doesn't show in tickets. That's a deposit in the team relationship.",
  },
  {
    id: "non-technical-vision",
    kind: "Strength",
    pattern: "Aimed for systems a non-technical person could eventually run.",
    evidence:
      "I have tried to embrace the challenge of making the systems + documentation + training so easy that a completely non-technical person can eventually get comfortable with these systems.",
    who: "Patrick Gilligan",
    cortneyMove:
      "Aspiration was right. Execution was wrong (see 'cannot document' weakness below). Keep the aim — actually deliver the docs.",
  },

  // ---------- WEAKNESSES to fill ----------
  {
    id: "cannot-document",
    kind: "Weakness",
    pattern:
      "Could not document his own systems — explicitly admitted the monitoring pipeline was un-troubleshootable by anyone else.",
    evidence:
      "Its pretty complex - I have spent a lot of time on it, and I am not sure how to document how to troubleshoot it. On the other hand, anybody who is into building software and/or doing programming, would have a nice time jumping in.",
    who: "Patrick Gilligan",
    cortneyMove:
      "FILL THIS GAP FIRST. The Splunk pipeline + Lambdas + GitLab repos need a one-page README each: what it watches, where it lives, how to silence, how to debug, who to call. This is the foundation lift Stacey will measure you on.",
  },
  {
    id: "eventually-syndrome",
    kind: "Weakness",
    pattern: "\"Eventually I will...\" promises that never shipped.",
    evidence:
      "Eventually, I will have a doc that describes all of our monitoring and alerting efforts. ... In time, I will set up Splunk to send an alert to the newer alerts channel, when its received the same webhook over and over.",
    who: "Patrick Gilligan",
    cortneyMove:
      "Track every 'eventually' as a Jira ticket. If you say it in Slack, it goes in the WAVE board same day. No exceptions. This is how you out-deliver Patrick's reputation in the first 30 days.",
  },
  {
    id: "single-point-of-failure",
    kind: "Weakness",
    pattern: "Built scripts under his own AWS identity — failed the moment he was deactivated.",
    evidence:
      "AV Alerts: I just noticed that it looks like the alerts failed to run this morning. I'm guessing this has to do with Patrick officially being gone. Probably something he overlooked that would fail once he was de-activated.",
    who: "Matt Cornick",
    when: "Day 1 post-Patrick",
    cortneyMove:
      "Migrate every Patrick-authored Lambda / cron / scheduled job to a service account or team-owned IAM role. Inventory the full blast radius BEFORE you touch anything else. See /splunk for the workflow.",
  },
  {
    id: "solo-coder",
    kind: "Weakness",
    pattern: "Treated the code as his — nobody else could read it, so nobody else could change it.",
    evidence:
      "Looking at the file now, it should be redone. Correct me if I'm wrong but can't this just be a simple Zoom Room? Also, do you know where this plugin comes from? Did Patrick write it or get it from his Q-Sys community? It's not on the Q-Sys Library.",
    who: "Mark Hampson",
    cortneyMove:
      "Code reviews on every Q-Sys MR going forward. Use Cursor to add comments + diagrams. Mark + Matt should be able to read every plugin in the repo. Plugin source / license / support owner documented per plugin.",
  },
  {
    id: "scope-discipline-gap",
    kind: "Weakness",
    pattern: "Started ambitious projects, abandoned them mid-flight.",
    evidence:
      "In case you want to check it out, I have been spending most of the last few work days extracting as much data as possible from our Zoom Webhooks as possible. Dashboarding is actually a lot harder than I thought.",
    who: "Patrick Gilligan",
    cortneyMove:
      "Zoom Webhooks → Splunk migration was mid-flight when he left. Decide: finish it, or kill it. Don't let it sit in limbo for another year.",
  },
  {
    id: "no-escalation",
    kind: "Weakness",
    pattern: "Punted on architectural conflicts that needed IT politics, not code.",
    evidence:
      "Mac Mini standard never escalated to a Q-Sys-Connect-Windows architectural decision. No record of him taking it to Matt + IT formally.",
    cortneyMove:
      "You're better positioned for IT politics than Patrick was. Bring Mac vs. Windows AV-appliance to Matt as a formal decision in your first 60 days. Patrick avoided this — that's your wedge.",
  },
  {
    id: "dependency-tracking",
    kind: "Weakness",
    pattern: "Cross-team dependencies were tracked in his head, not in a doc.",
    evidence:
      "starting next new buildout, can we both take note of all cross team dependencies needed for new jobs, so that we can advance them properly and have them documented? I think it will tighten up our game a bit. Not trying to pawn this off, I'm happy to help. Just want to flag this as I thought of it.",
    who: "Patrick Gilligan",
    cortneyMove:
      "Stand up a 'cross-team dependencies' tracker (Jira label or Confluence page) day 1. Every new build = explicit Network/IT/Security/Facilities dependencies logged.",
  },
  {
    id: "punted-to-others",
    kind: "Weakness",
    pattern: "Relied on other people's docs (Alana for IRV training) without owning the followups.",
    evidence:
      "I think Alana made a guide. She coordinated a large training session about adding the NDI stream after a reboot....that session's scope got a little out of hand. I think there was some kind of accompanying documentation.",
    who: "Patrick Gilligan",
    cortneyMove:
      "Find Alana's IRV NDI guide. Either adopt it as the standard or replace it. Don't leave training docs in ambiguous ownership — that's where rooms regress quietly.",
  },
];

// =========================================================================
// SPLUNK WORKFLOW — Patrick's real Splunk pipeline. Cortney's runbook.
// Reconstructed from Slack record: access path, pipeline, dashboards,
// inherited in-flight work, and a how-to for adding a new alert.
// =========================================================================

export const SPLUNK_WORKFLOW = {
  access: {
    appUrl: "https://zillowgroup.splunkcloud.com/en-US/app/zgav/zgav_non-prod",
    appName: "zgav (Zillow Group AV)",
    nonProdView: "zgav_non-prod",
    requestAccessUrl:
      "https://zillow.service-now.com/esc?id=sc_cat_item&table=sc_cat_item&sys_id=2c137a826f5b1e800e129aad5d3ee4ff&searchTerm=splunk",
    requestAccessNote:
      "ServiceNow tile Patrick linked when teammates needed access. Mark already has Splunk access (confirmed Slack). Cortney should file this on day 1.",
    awsConsoleNote:
      "Splunk is paired with AWS — Patrick said 'AWS probably needs an access tile as well.' File the AWS ServiceNow request the same day so you can read Lambda CloudWatch logs alongside Splunk dashboards.",
    confirmedAccess: [
      { who: "Mark Hampson", quote: "I have splunk access" },
      { who: "Patrick Gilligan (departed)", quote: "was the dashboard author" },
    ],
  },

  // The actual end-to-end pipeline Patrick built
  pipeline: [
    {
      step: 1,
      name: "Source: Q-Sys Reflect",
      detail:
        "Each Q-Sys core's Reflect feature emits events on plugin error, script error, or device offline. Reflect pushes to a webhook URL.",
    },
    {
      step: 2,
      name: "AWS Lambda receives webhook",
      detail:
        "Patrick's Lambda is the entrypoint. Owned in GitLab project av-ops-tools (Q-Sys Slack Updater + companion). Currently failing because it ran under Patrick's identity.",
    },
    {
      step: 3,
      name: "Lambda re-polls Reflect API on the affected device",
      detail:
        "Critical signal-vs-noise step Patrick added. If the device has recovered between the webhook and the poll, Lambda logs to CloudWatch only — no Slack ping. Replaces the old 'every blip → Slack' pattern.",
    },
    {
      step: 4,
      name: "Branch A: still in error → write to Splunk (HEC)",
      detail:
        "Persistent failures get an event into Splunk via HTTP Event Collector. Indexed for dashboards + alert rules.",
    },
    {
      step: 5,
      name: "Branch B: still in error AND reaction expected → post to #av-alerts",
      detail:
        "Site-specific Slack message goes to #av-alerts (the channel Patrick created — 'mostly meaningful alerts, that aren't so noisy we don't pay attention'). Filters out 'Control Link Server...' noise.",
    },
    {
      step: 6,
      name: "Auto-recovery: power-cycle QSC core if hang detected",
      detail:
        "If the core itself is hung, Lambda triggers a power cycle via API before alerting. Documented in WAVE 'Add Reflect alerting to Lambda, filter out Control Link Server messages to reduce noise, power cycle QSC core to test.'",
    },
    {
      step: 7,
      name: "Daily updater digest → #av-daily-update",
      detail:
        "Once-a-day site-organized digest of everything Splunk saw. Cross-references IP doc to MAC table to suppress ARP-aged false positives. Includes Zoom offline events from Zoom API and Q-Sys plugin status sweep.",
    },
  ],

  // Dashboards Patrick built or had in-flight
  dashboards: [
    {
      name: "zgav_non-prod (the main AV dashboard)",
      url: "https://zillowgroup.splunkcloud.com/en-US/app/zgav/zgav_non-prod",
      status: "Built — primary view",
      contains: [
        "Q-Sys plugin status sweep (per-core)",
        "System temperature per core",
        "System memory per core",
        "Zoom offline events (from Zoom API)",
        "Speed tests (Patrick was considering moving these out of Slack)",
        "Site-organized daily digest links",
      ],
    },
    {
      name: "Zoom Webhooks ingest",
      status: "Mid-flight when Patrick left — INHERITED",
      contains: [
        "Sensor data webhooks (room_name, device_id, occupancy)",
        "Real Time People Count (Neat-room only — hardware-dependent)",
        "Meeting started/ended events",
        "Calendar mismatch events",
      ],
      cortneyAction:
        "Decide: finish the Zoom webhook ingest OR archive the project. Patrick said 'Dashboarding is actually a lot harder than I thought.' Don't let it rot — make a call.",
    },
    {
      name: "Wilson's Splunk logs (referenced, location TBD)",
      status: "Patrick mentioned having a link — never shared in #av-team",
      cortneyAction:
        "Ask Wilson (or his manager) for the link and inventory. Possible hidden value here.",
    },
  ],

  // Inherited Splunk + monitoring work Cortney is picking up
  inheritedWork: [
    {
      title: "Re-key every Lambda + cron under a service account",
      severity: "P0",
      reason:
        "Alerts already failed on day 1 of Patrick's departure. Until this is done, the pipeline is one outage away from going fully dark.",
    },
    {
      title: "Inventory every Splunk HEC token + dashboard owner",
      severity: "P0",
      reason: "If tokens were created under Patrick's identity, they expire next.",
    },
    {
      title: "Migrate the 'Eventually-Splunk-will-send-the-alert' rule",
      severity: "P1",
      reason:
        "Patrick promised: 'In time, I will set up Splunk to send an alert to the newer alerts channel, when its received the same webhook over and over, and the device is still offline.' Never landed. Write the Splunk alert rule yourself.",
    },
    {
      title: "Finish or kill the Zoom Webhooks → Splunk migration",
      severity: "P1",
      reason: "Mid-flight, valuable, but stalled. Decide.",
    },
    {
      title: "Document the pipeline (one-page runbook per Lambda)",
      severity: "P1",
      reason:
        "Patrick explicitly said: 'I am not sure how to document how to troubleshoot it.' Fill the gap.",
    },
    {
      title: "Build a Splunk dashboard panel for Neat Bar Pro / Center fleet health",
      severity: "P2",
      reason: "Currently no first-class view on the Neat fleet — gap noted in /issues.",
    },
    {
      title: "Cross-reference Domotz alerts INTO Splunk (not just Slack)",
      severity: "P2",
      reason: "Patrick's stated end-goal: kill the noisy Domotz Slack channel, route through Splunk first.",
    },
    {
      title: "Move speedtests out of Slack into Splunk-only",
      severity: "P3",
      reason: "Patrick flagged this as planned but never executed.",
    },
  ],

  // Practical: how to add a new alert end-to-end
  howToAddAlert: [
    "1. Decide the SOURCE: Reflect, Domotz, Zoom Webhook, Neat API, or custom Q-Sys script.",
    "2. Route the source to the AWS Lambda entrypoint (clone Patrick's existing Lambda for Reflect — it's the template).",
    "3. Inside Lambda: implement the re-poll pattern. Do NOT alert on first signal — confirm persistence first.",
    "4. Write the event to Splunk via HEC. Use a structured event (room_name, severity, device_id, source).",
    "5. Decide: dashboard-only, or also Slack? Default to dashboard-only. Only escalate to Slack if a human reaction is expected.",
    "6. If Slack: target #av-alerts. Patrick's channel intent: 'mostly meaningful alerts, that aren't so noisy we don't pay attention to them.'",
    "7. Add a panel to zgav_non-prod dashboard for the new source.",
    "8. Write a one-page runbook: what triggers, where it logs, how to silence, who to escalate to. Commit to GitLab next to the Lambda.",
    "9. Tag dev/test devices with leading underscore so the pipeline ignores them (Patrick's convention).",
    "10. Add the new alert to the team's Friday wins/challenges email scoreboard.",
  ],

  // Patrick docs Cortney should claim
  patrickDocs: [
    {
      label: "IRV RCA document",
      url: "https://docs.google.com/document/d/1DLhhQMdnv-dENGATLbzBWYi33mXc35bm6kPOyWg9ntA/edit?tab=t.0",
      why: "Real RCA Patrick wrote for an IRV outage. Reuse format for every P0/P1.",
    },
    {
      label: "Podium QR target doc (SFO podium)",
      url: "https://docs.google.com/document/d/1pGcefYSQAf3UwCE81C4J-mTlBRta-5N47CNjwp7CE-8/edit",
      why: "Hidden — the QR on the SFO podium links here. Confirm it's still current.",
    },
    {
      label: "Patrick handoff doc",
      url: "https://docs.google.com/document/d/1LxQvEdRCjbbALY6pb4Kqcr4-L7_EMIlJskAKjCL7XdI/edit?tab=t.0",
      why: "Linked by Patrick near departure — claim and read.",
    },
    {
      label: "Patrick second doc (context TBD)",
      url: "https://docs.google.com/document/d/1wseabp4r983exUw7j7n-p2QINQH7wO-5lchPQmZjt8o/edit?tab=t.0",
      why: "Second Patrick-authored doc shared in #av-team. Title unknown — open and tag.",
    },
  ],
};

// =========================================================================
// CORTNEY MENTIONS — every Slack reference to Cortney in #av-team.
// This is how the team is currently talking about Cortney. Read it to
// calibrate expectations and tone.
// =========================================================================

export interface CortneyMention {
  who: "Stacey Newman" | "Mark Hampson" | "Matt Cornick";
  context:
    | "Welcome"
    | "Onboarding"
    | "Access setup"
    | "Standup green-circle"
    | "Project assignment"
    | "Social"
    | "Indirect role context";
  quote: string;
  whyItMatters: string;
}

export const CORTNEY_MENTIONS: CortneyMention[] = [
  {
    who: "Stacey Newman",
    context: "Welcome",
    quote:
      "Hi Cortney! Welcome to the team. This is our main communication channel as a team. I'm adding you to a million other channels right now as well.",
    whyItMatters:
      "First public welcome. Stacey owns the people side — she's already routing you into the channel ecosystem.",
  },
  {
    who: "Mark Hampson",
    context: "Welcome",
    quote: "Welcome Cortney!",
    whyItMatters: "Mark went on-record same day. Low-friction signal.",
  },
  {
    who: "Stacey Newman",
    context: "Access setup",
    quote:
      "Hey I'm setting up access for Cortney, besides AV alerts and AV Team any other distro lists we should add him to.",
    whyItMatters:
      "She's specifically adding you to #av-alerts on day 1 — that channel is the team's eyes. Confirms the role is expected to own monitoring.",
  },
  {
    who: "Stacey Newman",
    context: "Standup green-circle",
    quote:
      "Stacey is :greencircle: • Cortney Onboarding • We changed some of the India buildout scope and I need to go through the budget line by line and make sure we're still in budget but I think we are yay! • Catch up from being gone but I think everything is under control.",
    whyItMatters:
      "You are the top item on Stacey's Monday. Onboarding is her active focus, and the India buildout is in motion in parallel — that's where Cortney will likely get pulled in next.",
  },
  {
    who: "Mark Hampson",
    context: "Standup green-circle",
    quote:
      "Mark is :greencircle: • Zip training/testing • Meet with Cortney • May reforecasting • Seattle lifecycle tracker complete • Claude testing (Create projects for each 2026 project on our roadmap, Add connectors for gmail, calendar, and Jira).",
    whyItMatters:
      "Mark has a 1:1 with you on his standup. He's also already doing Claude testing — which means he is OPEN to the AI-tooling direction Patrick set. Lean into Cursor + Claude with Mark; he won't push back on it.",
  },
  {
    who: "Matt Cornick",
    context: "Standup green-circle",
    quote:
      "Matt is :greencircle: • Post Google move/Room Resource access cleanup • Zall Hall Q2 draft • Founder's Suite monitoring/alert cleanup • Sync with Cortney.",
    whyItMatters:
      "Matt has 'Sync with Cortney' on his Monday list — alongside 'Founder's Suite monitoring/alert cleanup.' Read: Matt wants help on the monitoring fallout from Patrick's departure. This is your in.",
  },
  {
    who: "Stacey Newman",
    context: "Project assignment",
    quote: "Mark can you share the India Boms with Cortney.",
    whyItMatters:
      "Stacey is putting Cortney on the India buildout (BOMs = bill of materials). This is a real, in-flight project — not just onboarding busywork. Take it seriously and ask Mark for the BOM doc proactively.",
  },
  {
    who: "Mark Hampson",
    context: "Project assignment",
    quote: "awesome thanks Cortney",
    whyItMatters: "Mark publicly thanking you for a deliverable. Whatever you did, do more of it.",
  },
  {
    who: "Stacey Newman",
    context: "Social",
    quote:
      "Yes congrats Cortney! How was it? Are you driving back to SF this weekend? Matt hopefully you're spoiling Zahra this weekend?! Mark told me he's taking over all kid duties all weekend so he'll be busy ha.",
    whyItMatters:
      "Stacey is including Cortney in the personal-life banter the team uses to stay close. That's a relationship offer — reciprocate. Also: SF is on the table for Cortney (location signal).",
  },
  {
    who: "Matt Cornick",
    context: "Indirect role context",
    quote:
      "I have access. We kind of knew and chatted about that this would be the situation we would be in if Patrick ever left. This is not my world nor do I care for it to be and I don't think it's expected of me to know. I can click on a link all day long but then? :shrug-dk: I can rerun some scripts because that's just clicking a button but if that doesn't work...",
    whyItMatters:
      "MOST IMPORTANT QUOTE for understanding your role. Matt is publicly saying he is NOT the engineer/scripter and doesn't want to be. He can do rote ops (click links, rerun scripts) but not author code. Your role exists to fill exactly that gap. Don't try to do Matt's work; do the work he can't.",
  },
];

// =========================================================================
// ROLE DETAILS — what the role actually is, not what you might assume.
// Reconstructed from Stacey + Mark Slack messages.
// =========================================================================

export const ROLE_DETAILS = {
  title: "AV Systems Engineer — contractor backfill for Patrick Gilligan",
  classification:
    "CONTRACTOR (not FTE). Stacey explicitly: 'contracting department is running a comp analysis on the the backfill contractor role.'",
  hiringPath: [
    {
      step: "Comp analysis by contracting dept",
      quote:
        "Also the contracting department is running a comp analysis on the the backfill contractor role and then I'll get that posted so fingers crossed by end of next week.",
      who: "Stacey Newman",
    },
    {
      step: "Req creation with contracting team",
      quote:
        "Update on the contractor role. I'm meeting with our contracting team today to make the req and post it the comp analysis is completed.",
      who: "Stacey Newman",
    },
    {
      step: "Req live for 48 hours, top 10 candidates",
      quote:
        "Ok Patrick's backfill req is going live today and then will be up for 48 hours and they'll be sending me the top 10 candidates and then all 3 of us will be able to interview them.",
      who: "Stacey Newman",
    },
    {
      step: "3-way interview panel (Stacey + Matt + Mark)",
      quote: "all 3 of us will be able to interview them",
      who: "Stacey Newman",
    },
    {
      step: "Cortney joins team",
      quote: "Welcome Cortney! / Hi Cortney! Welcome to the team.",
      who: "Mark + Stacey",
    },
  ],
  // What the team expects the role to actually do
  expectedScope: [
    {
      area: "Q-Sys / Lua engineering",
      detail:
        "Author and maintain Q-Sys Lua scripts, UCI files, custom plugins. This is the core gap — Matt explicitly said this is 'not my world.'",
    },
    {
      area: "Monitoring + alerting pipeline ownership",
      detail:
        "Splunk dashboards, Lambda alerts, av-alerts channel hygiene, daily updater. Patrick's stack — see /splunk.",
    },
    {
      area: "AV-over-IP fleet ownership",
      detail:
        "Q-Sys NV-21 / NV-32 endpoints, BirdDog phase-out, HDMI reliability fixes. See /nv-fleet, /birddog, /hdmi.",
    },
    {
      area: "Room-tier UCI standardization",
      detail:
        "Tier 1/2/3 UCIs. Patrick's 'no touch panel' thesis is up for review (Cortney counter-thesis on /uci).",
    },
    {
      area: "New buildout participation",
      detail:
        "India buildout is in-flight — Mark/Stacey are already routing BOMs your way. Expect to spec, validate, and field-support new sites.",
    },
    {
      area: "On-call rotation for AV alerts",
      detail:
        "Being added to #av-alerts on day 1 is the signal. Patrick's silent on-call gap is what broke the morning he was deactivated.",
    },
  ],
  // Position the team is hoping the role fills
  whatTheyActuallyNeed:
    "They need someone who can code Q-Sys AND comes from an AV background — i.e., the thing Patrick was half of. Matt covers the room-floor / wiring / IT-politics side. Mark covers PM / budget / vendor. Stacey covers people / leadership. The empty seat is 'AV engineer who can write Lua, Lambda, and Splunk dashboards AND knows what a TCC2 actually does.' That's the wedge.",
  // Things that confirm contractor vs FTE
  contractorNotes: [
    "Hired via contracting department, not Zillow recruiting",
    "Comp set by comp analysis on contractor band (not FTE band)",
    "Backfill timeline ('end of next week') is contracting-speed, not FTE-speed",
    "No mention of equity, full-time benefits package, or FTE-track conversion in #av-team",
  ],
};

// =========================================================================
// MEMORY-LEAK REFACTOR — what Patrick was actually doing, what's left.
// =========================================================================

export interface MemoryLeakRoom {
  room: string;
  mainScript: "Fixed" | "Not touched" | "Mystery — still leaking after fix";
  tpScripts: "Fixed" | "Not touched" | "N/A";
  notes?: string;
}

export const MEMORY_LEAK_REFACTOR = {
  // What it actually is
  whatItIs:
    "Q-Sys cores run Lua scripts (Main script + per-touch-panel TP scripts) that allocate memory continuously. Certain Lua patterns — closures that capture controls, timers that never get garbage collected, event handlers that don't disconnect, table mutations inside loops — never release memory. Over hours or days, RAM fills up. The Core's monitor throws 'Critical Value' errors. Eventually the Core forces a reboot, which drops every room running on that Core mid-meeting. THAT is the memory leak.",

  whyItMatters:
    "Every reboot = users in a meeting suddenly lose AV. The leak is invisible until the Critical Value alarm fires, which is usually after the meeting has already started failing. This is the most common 'why did the room just die?' root cause Patrick was hunting.",

  // What Patrick learned from QSC
  rootCausePatterns: {
    source: "Q-Sys community contact (per Patrick — possibly via the QSC Discord)",
    badPatterns: [
      "Closures inside Lua that reference Q-Sys Controls without releasing",
      "Timer callbacks that re-register themselves without cleanup",
      "Event handlers (`.EventHandler = function() ... end`) that get re-bound on every script reload",
      "String concatenation in tight loops (Lua doesn't free intermediate strings)",
      "Table inserts without paired removes inside long-running coroutines",
    ],
    fix:
      "Replace with explicit `EventHandler = nil` on teardown, paired allocate/release on timers, table.concat instead of string concat, and bounded queues in coroutines.",
  },

  // The Main script sweep Patrick did
  mainScriptFixed: [
    { room: "SEA-3611", mainScript: "Fixed", tpScripts: "Not touched", notes: "The CTO incident room" },
    { room: "SEA-3925", mainScript: "Fixed", tpScripts: "Not touched" },
    { room: "SEA-3619", mainScript: "Fixed", tpScripts: "Not touched" },
    { room: "IRV-1250", mainScript: "Fixed", tpScripts: "Not touched" },
    { room: "IRV-1249", mainScript: "Fixed", tpScripts: "Not touched" },
    { room: "IRV-851", mainScript: "Fixed", tpScripts: "Not touched" },
    { room: "SFO-735", mainScript: "Fixed", tpScripts: "Not touched" },
    { room: "SFO-726", mainScript: "Fixed", tpScripts: "Not touched" },
  ] as MemoryLeakRoom[],

  // The rebuilt rooms (Matt + Patrick redid Main + TP from scratch — should be clean)
  rebuiltRooms: [
    { room: "SEA-4000", status: "Clean" },
    { room: "SEA-3737", status: "Clean" },
    { room: "SFO-716", status: "Clean" },
    { room: "SFO-1027", status: "Clean" },
    { room: "SEA-3829", status: "Clean" },
    { room: "NYC-1227", status: "Clean" },
    { room: "NYC-1250", status: "STILL LEAKING — slower than the others. Mystery." },
  ],

  // The NYC-1250 mystery
  nyc1250Investigation: {
    summary:
      "NYC-1250 was rebuilt from scratch like the others but still leaks. Patrick tried removing control links from the parent core — didn't fix it. He speculated room usage (Zoom calls, start/stop cycles) might be a factor. Investigation was open when he left.",
    quotes: [
      "Of all the systems that I have done re-programming of recently, since Matt and I started re-doing systems (SEA-4000, SEA-3737, SFO-716, SFO-1027, SEA-3829, NYC-1227, NYC-1250)...the ONLY one that leaks memory of those is NYC-1250.",
      "I was hoping that removing the control links from the parent core would have been the cause of the memory leak, yet now I am not sure.",
      "I'm starting to wonder if whatever is causing this memory leak is also affected by usage of the room, whether its talking to Zoom, starting/stopping the system, or what.",
    ],
    cortneyNextStep:
      "Diff NYC-1250 against NYC-1227 (its clean sibling). Patrick said the difference wasn't 'any of the items that I guessed it would have been' — which means it's a NON-obvious diff. Compare config files line-by-line in GitLab and run both against the memory-examination dashboard for a week.",
  },

  // The SFO All Hands carve-out
  sfoAllHands: {
    summary:
      "SFO All Hands also leaks but uses BirdDog for cameras ONLY (not video transport). Patrick had it on the list to re-do after CPR + performance review season.",
    quote:
      "After the CPR and performance review stuff, I'm going to prioritize re-doing the SFO All Hands system....that one does leak memory, but only uses birddog for the cameras and not the video transport. It will be an interesting piece of the puzzle.",
    cortneyNextStep:
      "Tie this into the BirdDog phase-out (/birddog). SFO All Hands is a candidate for an NV-endpoint conversion as part of the rebuild.",
  },

  // The dashboard Patrick built specifically for memory leak tracking
  memoryDashboard: {
    summary:
      "Patrick built a Splunk dashboard panel that specifically tracks Lua script memory + 'Critical Value' errors per Core. It's how he caught the leaks in the first place.",
    quote:
      "This new dashboard I made is super helpful for examining script memory, or that error that causes us to have to reboot the Q-Sys cores ('Critical Value' errors).",
    location: "Likely in the zgav Splunk app — see /splunk.",
    cortneyNextStep:
      "Find this panel in zgav_non-prod. Confirm it's still receiving data after Patrick's deactivation (HEC token may have been under his identity).",
  },

  // What's left to do
  inheritedTasks: [
    {
      task: "Sweep TP scripts for memory leaks across all 8 Main-fixed rooms",
      severity: "P1",
      reason:
        "Patrick explicitly flagged TP scripts as untouched: 'I hadn't thought of the touch panel scripts, for the larger rooms.' Same leaky patterns, different file.",
    },
    {
      task: "Solve the NYC-1250 mystery",
      severity: "P2",
      reason: "Open investigation. Diff against NYC-1227 and watch for a week.",
    },
    {
      task: "Re-do SFO All Hands system (Patrick's stated next priority)",
      severity: "P2",
      reason:
        "Leaks memory. Also candidate for BirdDog → NV camera transport upgrade — kill two birds.",
    },
    {
      task: "Confirm the memory-examination Splunk dashboard is still receiving data",
      severity: "P0",
      reason: "If the HEC token was tied to Patrick's identity, the dashboard is dark and you wouldn't know.",
    },
    {
      task: "Document the bad Lua patterns + the safe replacements in a team Q-Sys style guide",
      severity: "P1",
      reason:
        "Patrick learned the patterns from a QSC community contact. They live in his head. Write them down so Mark, Matt, and the next contractor have them.",
    },
  ],
};

// =========================================================================
// THE THREAD THAT EXPLAINS YOUR ROLE — Mar 13, 2026.
// Patrick wrote a handoff doc. Mark + Matt picked it apart in real time.
// This thread is the single richest piece of context for what your role
// is, what the team expects, and what gaps Patrick himself admitted to.
// =========================================================================

export interface RoleThreadMessage {
  who: "Matt Cornick" | "Mark Hampson" | "Patrick Gilligan";
  ts: string;
  text: string;
  significance: string; // why Cortney should care about this exact line
}

export const ROLE_THREAD: {
  title: string;
  when: string;
  permalink: string;
  context: string;
  messages: RoleThreadMessage[];
} = {
  title: "The handoff-doc thread — \"pretend I'm a new guy\"",
  when: "Mar 13, 2026, 11:11 AM PDT (#av-team)",
  permalink:
    "https://zillowgroup.slack.com/archives/C04GF3S3KQF/p1773425550031039?thread_ts=1773342215.611929&cid=C04GF3S3KQF",
  context:
    "Patrick had written a handoff doc Mark + Matt had asked for. Mark thought it was insufficient. Stacey was in India and the role spec wasn't finalized. The next 30 minutes of Slack are the most candid description of what your role actually is.",
  messages: [
    {
      who: "Mark Hampson",
      ts: "11:14:26",
      text: "Is this the doc Matt and I asked you to create? or did Stacey ask for a job writeup for a replacement?",
      significance:
        "Mark and Matt drove the handoff-doc requirement, NOT Stacey. Mark owns the technical-handoff completeness; Stacey owns the people side.",
    },
    {
      who: "Patrick Gilligan",
      ts: "11:15:13",
      text: "The one you asked for, but I guess in my head if somebody got the job, this is an easy map to understand what I do. I keep adding to it and editing it.",
      significance:
        "Patrick CONFLATED the operational-handoff doc with the role-spec doc. That's why your role spec is fuzzy — he wrote one doc trying to do two jobs.",
    },
    {
      who: "Mark Hampson",
      ts: "11:16:55",
      text: "Gotcha. this is assuming a direct replacement and given that Stacey is in India i don't think any of that has been worked out. Can you make this as detailed as possible please, not assuming a direct replacement?",
      significance:
        "CRITICAL. Mark explicitly told Patrick: don't assume a 1:1 replacement. The team was already negotiating whether your role would be a programmer-clone or a different shape. The 'direct replacement' question was OPEN — that's still your wedge.",
    },
    {
      who: "Mark Hampson",
      ts: "11:19:23",
      text: "It's missing the day to day troubleshooting. For example - what do we do if alerting stops working?",
      significance:
        "Mark articulated the exact gap your role exists to fill: there is no documented day-to-day troubleshooting flow for the monitoring stack.",
    },
    {
      who: "Patrick Gilligan",
      ts: "11:20:10",
      text: "I will add some more detail on that. Good idea. However, it can be one of a million different things.",
      significance:
        "Patrick's tell. He has no systematic troubleshooting framework — only intuition built up over years. That's not a system, that's tribal knowledge.",
    },
    {
      who: "Mark Hampson",
      ts: "11:21:33",
      text: "Yeah but where would we go based on this? If I pass this off to a new person, any direction would be helpful.",
      significance:
        "Mark was already prepping the role for you. 'A new person' = Cortney. He wanted decision trees, not war stories.",
    },
    {
      who: "Mark Hampson",
      ts: "11:25:48",
      text: "Matt try to give me access to these links when you get a chance. doesn't need to be today. pretend im a new guy.",
      significance:
        "GOLD. Mark literally road-tested the doc as if he were Cortney. The 'pretend I'm a new guy' frame is the same frame you should use when reading every Patrick doc — does it work without him in the room?",
    },
    {
      who: "Patrick Gilligan",
      ts: "11:26:30",
      text: "You need to request access to Gitlab, and it only works on VPN.",
      significance:
        "Access tile #1: GitLab via VPN. Confirmed Gitlab.zgtools.net — Zillow's internal GitLab.",
    },
    {
      who: "Patrick Gilligan",
      ts: "11:26:32",
      text: "AWS probably needs an access tile as well. Splunk, I would hope that you have? But a request if not.",
      significance:
        "Access tiles #2 + #3: AWS console and Splunk. File ServiceNow requests for both day 1. See /splunk.",
    },
    {
      who: "Mark Hampson",
      ts: "11:26:43",
      text: "I have splunk access.",
      significance:
        "Mark already has Splunk. He's the easiest in-org reference if Cortney's Splunk access is delayed.",
    },
    {
      who: "Matt Cornick",
      ts: "11:12:30 (the headline quote, in full context)",
      text: "I have access. We kind of knew and chatted about that this would be the situation we would be in if Patrick ever left. This is not my world nor do I care for it to be and I don't think it's expected of me to know. I can click on a link all day long but then? :shrug-dk: I can rerun some scripts because that's just clicking a button but if that doesn't work...",
      significance:
        "The single most important quote for understanding your role. Matt is publicly drawing the line: he can do rote ops (click links, rerun scripts), but he cannot author/debug code. The team knew this was coming. Your role exists to be the engineer Matt explicitly does not want to be — without making him feel that you're showing him up.",
    },
    {
      who: "Matt Cornick",
      ts: "11:21:00",
      text: "For example, monitoring went down right after Patrick went on PL and it only came back because he was alerted about something. This stuff takes regular maintenance by someone who lives in this world.",
      significance:
        "Real precedent. Monitoring already failed once before — on Patrick's PATERNITY leave — and stayed broken until Patrick himself happened to get alerted. The role you're stepping into is 'the person who lives in this world.'",
    },
    {
      who: "Patrick Gilligan",
      ts: "11:23:08",
      text: "That's what I was trying to get at. Its pretty complex - I have spent a lot of time on it, and I am not sure how to document how to troubleshoot it. On the other hand, anybody who is into building software and/or doing programming, would have a nice time jumping in, and making it their own over time. They would probably improve it greatly, and trim a lot of the fat out.",
      significance:
        "PATRICK ENDORSED YOUR ROLE PROFILE. He explicitly told the team: hire someone who builds software, they'll improve it. He also conceded his stack has 'fat to trim' — meaning he's not defending his own code as optimal. Permission to refactor without diplomacy debt.",
    },
    {
      who: "Mark Hampson",
      ts: "11:26:12",
      text: "So TL:DR too many variables/too complicated to accurately document.",
      significance:
        "Mark's verdict. The team manager officially recorded that the stack is undocumentable in its current form. That's the FOUNDATION LIFT your role is being measured on.",
    },
    {
      who: "Patrick Gilligan",
      ts: "12:15:43",
      text: "wait, so when the pipeline breaks, do you not get an email Matt? Because I see you as a member: Trying to change your role to `owner` and see if that changes things.",
      significance:
        "Hidden bug: Matt was a GitLab 'member' not 'owner,' so he wasn't getting pipeline-failure emails. Patrick fixed this in-thread. What else has the same trap? Likely AWS CloudWatch, Splunk alert recipients, Domotz email list — audit every notification destination on day 1.",
    },
    {
      who: "Matt Cornick",
      ts: "12:50:19",
      text: "Looking at Gitlab is like looking at a lighting console for me.",
      significance:
        "Matt's self-disclosure. His background is theater / stagehand (the 'chicken' = extra cable length joke he shares with Patrick). He's a phenomenal AV technician but not a developer. Frame your code-side work as supporting Matt's room-side work — never as replacing it.",
    },
    {
      who: "Matt Cornick",
      ts: "12:50:43",
      text: "Participate?",
      significance:
        "Matt asking how to configure GitLab notifications. He doesn't know GitLab UX. Concrete day-2 deliverable from Cortney: walk Matt through GitLab notification settings, project-watch level, and #av-team push routing.",
    },
    {
      who: "Matt Cornick",
      ts: "12:56:15",
      text: "No guarantees if there's a new person(s). I have some armor on my :broken_heart: now.",
      significance:
        "Matt publicly set expectations LOW for the new hire. He doesn't expect a unicorn. Walk in under-promising; over-deliver in week 1 and Matt is your strongest advocate.",
    },
  ],
};

// =========================================================================
// MATT vs CORTNEY — explicit boundary clarity. Where Matt's range stops
// and yours begins. Drawn from the Mar 13 thread + 4 years of #av-team.
// =========================================================================

export const MATT_VS_CORTNEY = {
  matt: {
    role: "Senior IC — AV technician / operator",
    background:
      "Live-event / theater stagehand background ('chicken' = stagehand term for leaving extra cable length). Self-described: 'Looking at Gitlab is like looking at a lighting console for me.'",
    canDo: [
      "Hands-on room work — racks, wiring, rigging, cable management",
      "Click links, follow runbooks, re-run scripted jobs (rote ops)",
      "Hardware diagnostics on Q-Sys, Neat, Poly, BirdDog devices",
      "On-site troubleshooting — IRV, SFO, SEA, NYC",
      "Vendor escalation (QSC, Neat, Zoom, Crestron)",
      "Roll a screen up manually from QDS when the UCI hides the control",
    ],
    cantOrWontDo: [
      "Write or refactor Lua scripts",
      "Author / debug Lambda functions",
      "Build or modify Splunk dashboards",
      "Read GitLab MR diffs",
      "Configure GitLab notification routing (Patrick had to set it for him)",
      "Architect AWS event pipelines",
    ],
    keyQuote:
      "This is not my world nor do I care for it to be and I don't think it's expected of me to know. I can click on a link all day long but then? I can rerun some scripts because that's just clicking a button but if that doesn't work...",
  },
  cortney: {
    role: "AV Systems Engineer (contractor) — the engineer-in-residence",
    background:
      "AV-background engineer (the thing Patrick was half of). Brings the room knowledge Patrick lacked + the code skills Matt doesn't have.",
    yourLane: [
      "Q-Sys Lua authorship, refactoring, code reviews",
      "Lambda / AWS pipeline ownership (post-Patrick re-keying)",
      "Splunk dashboards + alert rules",
      "GitLab MR reviews, plugin documentation, repo hygiene",
      "Q-Sys plugin provenance + custom plugin audit",
      "UCI tiering standard (Tier 1/2/3) and tuning passes",
      "Room AV architecture decisions (Mac vs Windows, NV vs BirdDog, TCC2 vs MXA920)",
      "Memory-leak refactor (Main + TP scripts) — see /splunk",
      "Bring open architectural decisions to Matt/Mark/Stacey on a cadence",
    ],
    notYourLane: [
      "Daily room walk-throughs (that's Matt + John)",
      "Rack hardware installs (that's Matt's craft — assist, don't take over)",
      "Vendor account management / POs (that's Mark)",
      "Hiring decisions / people performance (that's Stacey)",
      "iPad MDM / Zoom Rooms host IT policy (that's Zillow IT — defend the swim lane)",
    ],
    keyMove:
      "Matt explicitly said 'I have some armor on my :broken_heart: now' — meaning he's set the bar low. Walk in week 1 with under-promised wins (fix the GitLab notification trap for him, document one Lambda, take one Splunk panel from idea to production) and you'll have a strong advocate fast.",
  },
};

// =========================================================================
// ACCESS TILES — the day-1 ServiceNow checklist Mark already road-tested.
// =========================================================================

export const ACCESS_TILES = [
  {
    tile: "GitLab (gitlab.zgtools.net)",
    why: "All Q-Sys repos + Lambda + ops-tools live here. Bot posts pushes to #av-team.",
    how: "ServiceNow request. VPN required to access GitLab — confirm VPN is set up FIRST.",
    notificationTrap:
      "Default role for new members is 'Member' which does NOT get pipeline-failure emails. Patrick had to elevate Matt to 'Owner.' Confirm your role is 'Owner' on every Q-Sys + ops-tools project.",
  },
  {
    tile: "AWS console",
    why: "Lambda functions, CloudWatch logs, IAM roles. The alerting Lambda runs here and currently fails because it's tied to Patrick's identity.",
    how: "ServiceNow access tile (Patrick: 'AWS probably needs an access tile as well').",
    notificationTrap:
      "CloudWatch alarms route to SNS topics — confirm your email is on every topic Patrick's old email was on. Audit pre-existing topics first.",
  },
  {
    tile: "Splunk Cloud (zgav app)",
    why: "All dashboards + alert rules. The eyes of the team.",
    how: "ServiceNow tile: https://zillow.service-now.com/esc?id=sc_cat_item&searchTerm=splunk. Mark already has it — fastest cross-reference if your request stalls.",
    notificationTrap:
      "Splunk alert rules route to email lists. Audit which email lists Patrick's was on so we don't miss alerts during the handoff window.",
  },
  {
    tile: "VPN (required for GitLab + internal services)",
    why: "Nothing internal works without VPN.",
    how: "Standard Zillow IT request, separate from AV-specific tiles.",
  },
  {
    tile: "#av-alerts Slack channel",
    why: "Stacey already adds you here on day 1 — it's the team's monitoring signal.",
    how: "Stacey: 'I'm setting up access for Cortney, besides AV alerts and AV Team any other distro lists we should add him to.' Already in motion.",
  },
  {
    tile: "Q-Sys Core admin (per-core)",
    why: "Required to push Designer files, view memory stats, trigger reboots.",
    how: "Via the Q-Sys Designer file (which lives in GitLab). Ask Matt or Mark for the existing admin credentials.",
  },
  {
    tile: "Domotz dashboard",
    why: "Network-device monitoring that feeds the av-alerts pipeline.",
    how: "Patrick referenced 'add some links to the various APIs used and a sections about the Domotz dashboard.' Find the dashboard URL in his handoff doc and request access.",
  },
  {
    tile: "Zoom Webhook admin (Zoom marketplace app)",
    why: "Patrick was mid-flight migrating Zoom Webhooks → Splunk. Need admin to inspect / re-key.",
    how: "Coordinate with Zoom admin (likely Stacey or Zillow IT) to get marketplace-app management access.",
  },
  {
    tile: "Q-Sys community Discord",
    why: "Patrick's plugin source channel. Where he learned the memory-leak Lua patterns.",
    how: "Ask Scott at QSC (Patrick's contact) or Mark/Matt for the invite.",
  },
];

// =========================================================================
// SITES — per-office breakdown. Each site is a real Zillow office (or, in
// zRetreat's case, an off-site / event-space tier). The room-prefix is how
// we match Issues / UciIssues / NV / BirdDog / memory-leak rooms.
// =========================================================================

export interface Site {
  id: string;
  code: string;
  name: string;
  region: string;
  description: string;
  matchesPrefixes: string[]; // room prefix matches: "SEA-", "SEA ", etc
  roomList: string[]; // explicit canonical room list (best-effort from Slack)
  signature: string; // one-line headline for the site
  knownProjects: { title: string; note: string }[];
  innovationsHere: { title: string; note: string }[];
}

export const SITES: Site[] = [
  {
    id: "sea",
    code: "SEA",
    name: "Seattle",
    region: "HQ",
    description:
      "Zillow HQ. Highest room density, most Q-Sys cores, the CTO incident room (SEA-3611), the proof-point single-page UCI (SEA-3647), and the bulk of Patrick's memory-leak refactor work. This is the campus where standards either land or die first.",
    matchesPrefixes: ["SEA-", "SEA "],
    roomList: [
      "SEA-3611",
      "SEA-3619",
      "SEA-3626",
      "SEA-3634 DWB 001",
      "SEA-3647",
      "SEA-3737",
      "SEA-3829",
      "SEA-3829 Dev Space",
      "SEA-3912",
      "SEA-3925",
      "SEA-3932",
      "SEA-3940",
      "SEA-4000",
    ],
    signature:
      "Where Patrick proved single-page UCI works (SEA-3647) and where it failed publicly (CTO incident, SEA-3611).",
    knownProjects: [
      {
        title: "Memory-leak Main-script sweep",
        note: "Patrick fixed Main scripts in SEA-3611, SEA-3619, SEA-3925. TP scripts NOT touched. Same leak, different file.",
      },
      {
        title: "Rebuilds (Patrick + Matt, from scratch)",
        note: "SEA-4000, SEA-3737, SEA-3829 — clean after rebuild.",
      },
      {
        title: "Q-Sys Designer admin VM",
        note: "Lives in AWS; SEA team's primary push-to-Core workstation. Out of HD space repeatedly.",
      },
      {
        title: "Lifecycle tracker complete (per Mark's standup)",
        note: "Seattle lifecycle tracker was a Mark Hampson Q1 deliverable. Confirm it's accurate after BirdDog phase-out.",
      },
    ],
    innovationsHere: [
      {
        title: "SEA-3647 single-page UCI proof point",
        note: "Patrick's argument for the entire UCI thesis lives here. Cortney inherits the source.",
      },
      {
        title: "SEA-3829 Dev Space / sandbox core",
        note: "Internal sandbox where Patrick tested Q-Sys Designer files before pushing to prod. Reuse it.",
      },
    ],
  },
  {
    id: "sfo",
    code: "SFO",
    name: "San Francisco",
    region: "West Coast",
    description:
      "SF office. Site of the All Hands BirdDog system (Patrick's stated next priority before he left), the iPad-low-battery pain point Matt flagged repeatedly, and the USB-extender / UVC camera-control experiments Patrick + Matt ran in SFO-716 and SFO-1027.",
    matchesPrefixes: ["SFO-", "SFO "],
    roomList: [
      "SFO-07",
      "SFO-716",
      "SFO-726",
      "SFO-735",
      "SFO-1027",
      "SFO All Hands",
      "SFO podium (QR doc target)",
    ],
    signature:
      "Lab for new ideas. USB-extender + UVC tests, iPad battery webhook, All Hands BirdDog rebuild — all SFO experiments.",
    knownProjects: [
      {
        title: "SFO All Hands rebuild (Patrick's stated next priority)",
        note: "Leaks memory. BirdDog used for cameras only (not transport). Candidate for NV-endpoint conversion — kill two birds.",
      },
      {
        title: "iPad / scheduler low-battery webhook → Slack",
        note: "Matt's open ask. Not yet built. Easy first ship for Cortney.",
      },
      {
        title: "USB-extender / UVC camera-control test (SFO-716, SFO-1027)",
        note: "Patrick + Matt tested replacing NDI camera control with USB-extender + native UVC. Worked. Decide whether to standardize.",
      },
      {
        title: "Memory-leak Main-script sweep",
        note: "SFO-735, SFO-726 fixed at Main level. TP scripts not touched.",
      },
    ],
    innovationsHere: [
      {
        title: "Sandbox / dev core with public web certificate",
        note: "Patrick (with ex-contractor Greg) set up a public web cert so all devices including iPads could hit the dev core. iPad-as-ZRC test ran here.",
      },
      {
        title: "Podium QR-code AV onboarding doc",
        note: "SFO podium has a QR that links to a Patrick-authored Google doc. Confirm it's current.",
      },
    ],
  },
  {
    id: "irvine",
    code: "IRV",
    name: "Irvine",
    region: "SoCal",
    description:
      "Irvine office. Critical commissioning bottleneck — IRV-1250 was Patrick's WAVE backlog blocker, IRV-802 is where Patrick removed projector/screen controls from the UCI and Matt had to roll screens up from QDS manually. Patrick wrote a formal RCA for an IRV outage (the doc still in Google Drive).",
    matchesPrefixes: ["IRV-", "IRV "],
    roomList: [
      "IRV-802",
      "IRV-805",
      "IRV-825 (North Star)",
      "IRV-851",
      "IRV-1216",
      "IRV-1223",
      "IRV-1249",
      "IRV-1250",
    ],
    signature:
      "The site where Patrick's 'hide it' UI pattern hurt the team most (IRV-802) and where the only formal Patrick RCA was written.",
    knownProjects: [
      {
        title: "IRV-802 UCI redesign (Matt + Mark open)",
        note: "Patrick removed projector + screen controls. Hidden behind 'No source selected' gating. Matt asked: should this just be a simple Zoom Room? Open.",
      },
      {
        title: "IRV-1250 commissioning (BirdDog P110 bad batch)",
        note: "Patrick blocked here on the BirdDog 'bad batch' RMA. Cameras flapped in/out of NDI Virtual Input + Q-Sys plugin. Resolution status unclear.",
      },
      {
        title: "Memory-leak Main-script sweep (IRV-1249, IRV-1250, IRV-851)",
        note: "Patrick fixed Main scripts. TP scripts not touched.",
      },
      {
        title: "Irvine planning (Mark's Q1 deliverable)",
        note: "Network discussion, rack planning, COs (change orders). On Mark's standup for weeks.",
      },
      {
        title: "Patrick's IRV RCA document",
        note: "The most polished post-mortem Patrick ever produced. Inherit and reuse format for every P0/P1.",
      },
    ],
    innovationsHere: [
      {
        title: "NDI Virtual Input + Q-Sys plugin pairing",
        note: "IRV training session (per Patrick, Alana ran it) on adding NDI stream after a reboot. Find the doc.",
      },
    ],
  },
  {
    id: "nyc",
    code: "NYC",
    name: "New York",
    region: "East Coast",
    description:
      "NYC office. Home of the unsolved NYC-1250 memory-leak mystery (the only rebuilt room that still leaks), the NYC-1204 ceiling-mic spec question Mark never got an answer on, and the ZRC plugin 'kick' workaround at NYC-1202.",
    matchesPrefixes: ["NYC-", "NYC "],
    roomList: ["NYC-1202", "NYC-1204", "NYC-1227", "NYC-1250"],
    signature:
      "Open dragon: NYC-1250 memory leak. Solve it = trump card for the FTE conversion.",
    knownProjects: [
      {
        title: "NYC-1250 memory-leak mystery (OPEN INVESTIGATION)",
        note: "Rebuilt from scratch like NYC-1227 — but still leaks (slowly). Patrick's 'remove control links from parent core' theory didn't fix it. Diff against NYC-1227 line-by-line.",
      },
      {
        title: "NYC-1204 ceiling mics: TCC2 vs MXA920 spec call",
        note: "Mark asked Patrick which platform to standardize on for the event space. No answer. Tuning passes on existing TCC2 never happened.",
      },
      {
        title: "NYC-1202 ZRC plugin 'kick' workaround",
        note: "Manual fix Matt does. Scripting opportunity — automate the kick.",
      },
      {
        title: "DHCP cutover travel (Mark + Patrick trip)",
        note: "Stacey publicly thanked them for multitasking the NYC trip on a chaotic Friday outage. The NYC site has a recent DHCP cutover footprint.",
      },
    ],
    innovationsHere: [
      {
        title: "NYC-1227 as the clean control room",
        note: "It's NYC-1250's sibling that DOESN'T leak. Use it as the A/B baseline.",
      },
    ],
  },
  {
    id: "zretreat",
    code: "zRetreat",
    name: "zRetreat (event spaces + off-sites)",
    region: "Cross-site",
    description:
      "zRetreat covers the event spaces and off-site spaces Stacey + the team use for talent-success retreats and large gatherings. Standard is Neat Bar Pro + Mac Mini host. This is where the Mac-Mini-vs-Windows-Q-Sys-Connect conflict matters most — and where Cortney's G62-as-alternative argument lands.",
    matchesPrefixes: ["zRetreat", "zretreat"],
    roomList: [
      "zRetreat fleet (Neat Bar Pro)",
      "Founder's Suite",
      "Talent Success retreat spaces",
    ],
    signature:
      "Where the Mac Mini standard meets Q-Sys Connect's Windows-only reality. The architectural decision Patrick punted on lives here.",
    knownProjects: [
      {
        title: "zRetreat Neat Bar Pro + Mac Mini standard",
        note: "Stacey's current standard. Cortney's G62 pitch is the alternative — Android-based locked-down appliance, no macOS update breakage at 9 AM.",
      },
      {
        title: "Mark's NYC Quickguide refresh (Lu DTO Oct)",
        note: "Quickguides for visitor/exec usage of zRetreat-tier rooms. Living doc.",
      },
      {
        title: "Founder's Suite monitoring/alert cleanup",
        note: "On Matt's standup — Founder's Suite is in the zRetreat tier. Tie into Splunk re-key work.",
      },
      {
        title: "Insights / talent-success retreat AV support",
        note: "Stacey runs the Insights course retreats. AV team supports — known cadence is the week of 9/23 historically.",
      },
    ],
    innovationsHere: [
      {
        title: "Stacey's AI-friend G62 comparison",
        note: "Stacey ran the G62 vs Mac Mini comparison through an AI tool and posted the differentiators publicly. Cortney's G62 pitch already has wind in its sails.",
      },
      {
        title: "Neat Center + AVIO Dante companion concept",
        note: "Cortney proposed using AVIO to give Neat Center / Neat Board 'Dante speak' for ceiling-mic companions in open-space zRetreat rooms.",
      },
    ],
  },
];

// =========================================================================
// THE PLAYBOOK — friendly-prove-Matt-wrong + earn Stacey's trust + path
// from contractor → FTE. Every move tied to a specific Slack-evidenced
// behavior. No fluff, no calendar-time estimates, just sequenced moves.
// =========================================================================

export const PLAYBOOK_THESIS = {
  headline: "Friendly out-perform. Never publicly contradict. Make Matt look good in front of Stacey.",
  text:
    "Matt set the bar low publicly ('I have some armor on my :broken_heart: now') and Stacey is evaluating you for FTE conversion in real time through her Friday wins/challenges email. The play isn't to show Matt up — it's to quietly close the items he can't, credit him every time, and feed Stacey closed deliverables on her stated operational-excellence goal. Patrick promised the monitoring runbook and never shipped it; deliver it on day 30, deliver Patrick's other open items on day 60, and propose the FTE-only scope on day 90.",
  threeRules: [
    "Always write 'Matt and I' in shared docs even when you did 90%.",
    "Translate every piece of code into plain English in the runbook so Matt can read it. He admitted GitLab is a lighting console — meet him where he is.",
    "Close one Patrick-broken-since-departure item every week. Stacey notices closed loops, not open promises.",
  ],
};

export interface PlaybookMove {
  id: string;
  audience: ("Matt" | "Mark" | "Stacey" | "John")[];
  title: string;
  why: string; // why this move works for this person, in their words / from Slack
  how: string; // concrete steps
  proof: string; // how to surface the win without bragging
}

export const PLAYBOOK_MOVES: PlaybookMove[] = [
  // ---- THE MATT MOVES (friendly-prove-wrong) ----
  {
    id: "rekey-lambdas-with-matt",
    audience: ["Matt"],
    title: "Re-key Patrick's Lambdas — with Matt sitting next to you (screen share)",
    why: "Matt: 'AV Alerts: I just noticed that it looks like the alerts failed to run this morning. I'm guessing this has to do with Patrick officially being gone.' He's been carrying this alone. Helping him close it = instant credibility, zero ego.",
    how: "Schedule a 60-min screenshare. You drive AWS console, narrate every step in plain English. Move the Lambda execution role from Patrick's IAM user to a service-account or team IAM role. Make Matt the second-in-line owner.",
    proof: "Matt sends the green-circle Monday update: 'AV Alerts re-keyed with Cortney, no longer dependent on Patrick's identity.' He gets the credit; Stacey sees it.",
  },
  {
    id: "gitlab-notification-fix",
    audience: ["Matt"],
    title: "Fix Matt's GitLab notification settings (and everyone else's)",
    why: "Patrick discovered Matt was a GitLab 'Member' not 'Owner,' so he wasn't getting pipeline-failure emails. Same trap likely exists on AWS, Splunk, Domotz. Matt himself asked 'Participate?' — he doesn't know the UX.",
    how: "Audit GitLab + AWS SNS topics + Splunk alert recipients + Domotz email list. Bump every teammate to the right tier and document each setting in the runbook. Walk Matt through it once.",
    proof: "One-pager titled 'AV notification routing audit' with before/after table. Email to team. Matt forwards to Stacey unprompted.",
  },
  {
    id: "lambda-one-pager",
    audience: ["Matt", "Mark"],
    title: "One-pager per Lambda — written so Matt can read it",
    why: "Matt: 'Looking at Gitlab is like looking at a lighting console for me.' Mark's verdict on Patrick's stack: 'too many variables/too complicated to accurately document.' This is THE foundation gap.",
    how: "Cursor + Claude to summarize each Lambda in plain English. Sections: what triggers it, where logs go, how to silence, how to debug, who to escalate to. Commit alongside the code in GitLab.",
    proof: "When Matt next sees an alert and pings you, he opens the one-pager himself first. Send Stacey the doc link in the Friday wins email under 'operational excellence.'",
  },
  {
    id: "irv-802-close-the-loop",
    audience: ["Matt", "Mark"],
    title: "Close the IRV-802 hidden-controls ticket Matt eye-rolled at",
    why: "Matt: 'I think Patrick removed projector and screen controls from the UI :eyeroll: so I had to roll the screens up and turn projectors off manually from QDS.' Mark: 'should be redone. Correct me if I'm wrong but can't this just be a simple Zoom Room?' This is a wound that has been festering. Close it.",
    how: "Reopen the UCI in Designer. Re-add projector + screen controls under a visible settings tab (not Patrick's hidden 'No source selected' pattern). Push, test, demo to Matt and Mark together.",
    proof: "Matt's next IRV-802 Slack reference goes from eye-roll emoji to 'fixed in Cortney's last push.' You demoed it WITH him so he understands the change. He owns the explanation to John.",
  },
  {
    id: "cursor-pairing",
    audience: ["Matt", "Mark"],
    title: "Cursor pairing session — show Matt one AI win",
    why: "Mark is already doing 'Claude testing' on his standup. Matt is NOT — he's the one most threatened by the code-side becoming a black box. Demystify it.",
    how: "Pick one tiny Q-Sys ask Matt mentions in Slack ('we should have a Slack alert when X happens'). Open Cursor with him watching. Talk out loud. Ship the change in <20 minutes. Frame as 'this is the new way we make YOUR ideas real.'",
    proof: "Matt mentions Cursor in #av-team unprompted within 2 weeks. Mark sees it. Stacey sees it.",
  },
  {
    id: "matt-credit-pattern",
    audience: ["Matt"],
    title: "Credit Matt's room knowledge publicly on every closed ticket",
    why: "Matt has been carrying alone since Patrick left. He's lonely and slightly defensive. Public credit costs you nothing and converts him to your strongest advocate.",
    how: "Every Jira / Slack close-out: 'Closed with Matt — his read on [the rack / the cable run / the room behavior] caught X.' Mean it.",
    proof: "Matt is the first person to defend you when someone questions a contractor doing engineer-level work.",
  },
  {
    id: "do-not-publicly-contradict",
    audience: ["Matt"],
    title: "Never publicly contradict Matt — only ever in DM",
    why: "Matt's armor quote is real. He's bracing for being shown up. Public disagreement = Matt locks in. DM disagreement = Matt updates.",
    how: "If you disagree in #av-team, drop a thumbs-up emoji and DM him the question. Land the disagreement in 1:1 or DM only.",
    proof: "Watch Matt's tone shift over 30 days. He'll start DMing you BEFORE posting in #av-team to sanity-check.",
  },

  // ---- THE STACEY MOVES (earn trust + FTE conversion) ----
  {
    id: "friday-wins-discipline",
    audience: ["Stacey"],
    title: "Friday wins/challenges email — closed deliverables only, no promises",
    why: "Stacey: 'this year I'd like to focus on operational excellence as a team and having systems that are dependable.' Patrick's 'Eventually I will...' was his career-limiter. Don't repeat it.",
    how: "Every Friday, 3 lines: (1) what closed this week with link, (2) what's in-flight with target close, (3) what's blocked and who unblocks it. Always tie to Stacey's stated operational-excellence goal.",
    proof: "Stacey starts forwarding your wins email up. The forward is the FTE-conversion preamble.",
  },
  {
    id: "deliver-the-patrick-doc",
    audience: ["Stacey", "Matt", "Mark"],
    title: "Deliver the monitoring runbook Patrick promised — by day 30",
    why: "Stacey explicitly asked for 'operational excellence — dependable systems' as the annual goal. Patrick agreed and never shipped the doc. Mark's TL;DR: 'too many variables/too complicated to accurately document.' Shipping this doc is the single biggest 'I'm-different-from-Patrick' signal you can send.",
    how: "One-page-per-Lambda runbooks + a top-level 'AV monitoring stack — overview' doc. Use Cursor to compress Patrick's mess into plain English. Link it from #av-team and the Splunk dashboard.",
    proof: "Stacey replies in #av-team with 'this is exactly what I asked for last year — thank you Cortney.' That message goes to your FTE file.",
  },
  {
    id: "india-buildout-volunteering",
    audience: ["Stacey", "Mark"],
    title: "Take initiative on the India BOMs without being asked twice",
    why: "Stacey already told Mark to 'share the India BOMs with Cortney.' Mark is busy. Volunteering means Stacey sees you treat new buildouts as your problem, not assigned work.",
    how: "Get the BOM from Mark Monday. Read it end-to-end. Send back 3 questions + 1 spec suggestion by Wednesday. Don't wait for a meeting.",
    proof: "Mark mentions 'Cortney owned the India spec validation' in his Monday standup green-circle. That's a Stacey-visible artifact.",
  },
  {
    id: "fte-conversion-case-builder",
    audience: ["Stacey"],
    title: "Build the FTE conversion case in a private doc, week 1",
    why: "Contractor → FTE happens because the manager has a paper trail of impact. Start the trail day 1. Don't ask for conversion — make the case undeniable.",
    how: "Private Google doc 'Cortney 90-day impact log.' Three columns: date, what closed, who benefited. Add every closed item with link. Share it with Stacey at day 60 as 'thinking ahead to conversion conversation — wanted you to have the receipts.'",
    proof: "Stacey is the one who proposes the FTE conversion at day 90, not you. The doc gave her the ammo.",
  },
  {
    id: "operational-excellence-anchor",
    audience: ["Stacey"],
    title: "Anchor every initiative to Stacey's 'operational excellence' phrase",
    why: "She invoked that phrase as the team's annual goal. Use it back to her verbatim. Manager-level executives invoke phrases to signal alignment — repeat hers.",
    how: "In every Friday email, in every 1:1 agenda, frame your work as 'operational excellence — dependable systems' (her words). E.g., 'In service of operational excellence, I closed X this week.'",
    proof: "She starts using the same phrase in your direction in 1:1s. Alignment language = trust.",
  },
  {
    id: "personal-banter-reciprocate",
    audience: ["Stacey"],
    title: "Reciprocate Stacey's personal banter, sparingly",
    why: "Stacey's 'congrats Cortney! How was it? Are you driving back to SF this weekend?' is a relationship offer. The team uses personal banter to stay close. Decline it and you stay distant.",
    how: "Answer the personal question briefly + warmly. One sentence. Don't overshare. Reciprocate by asking about her India trip / her travel one time, then go back to work.",
    proof: "Stacey invites you to off-cadence chats (coffee, casual 1:1). That's the relationship-built signal.",
  },

  // ---- THE MARK MOVES (peer-allergic-to-custom-stuff) ----
  {
    id: "show-not-ask",
    audience: ["Mark"],
    title: "Be self-sufficient — Mark shouldn't have to babysit Patrick's onboarding twice",
    why: "Mark's signal in the Mar 13 thread: 'pretend I'm a new guy.' He wants self-sufficient hires. He's also doing Claude testing — he's open to AI tooling.",
    how: "File all 9 access tiles day 1 without being asked. Read every existing Google doc Patrick linked. Show up to 1:1 with questions, not 'can you set me up?'",
    proof: "Mark's first standup green-circle says 'Meet with Cortney' — and afterward he says 'productive sync' not 'spent the hour explaining basics.'",
  },
  {
    id: "standardize-not-customize",
    audience: ["Mark"],
    title: "Frame every UCI / room change as 'tier of an existing standard,' never a custom one-off",
    why: "Mark is allergic to custom plugins (he asked about the provenance of Patrick's). He loves standardization.",
    how: "Every room change you propose: anchor to Tier 1/2/3 UCI standard or to the Q-Sys community plugin library. Never 'I wrote a custom plugin for this' — instead 'I extended our Tier 2 template.'",
    proof: "Mark stops asking 'where does this plugin come from?' because every artifact has a documented source.",
  },
  {
    id: "mac-vs-windows-memo",
    audience: ["Mark", "Matt", "Stacey"],
    title: "Force the Mac-Mini-vs-Windows-Q-Sys-Connect decision Patrick punted",
    why: "Patrick's biggest unforced loss. Mark loves clean decisions. Stacey wants operational excellence. Bringing this forward = both wins.",
    how: "One-page memo: status quo cost, conflict with Q-Sys Connect roadmap, proposed pilot (one room, Windows AV appliance), success criteria, decision needed by date. Send to Matt + Mark + Stacey.",
    proof: "Decision lands. Whichever way it goes, you forced the architecture call that Patrick avoided. That's an FTE-level move.",
  },

  // ---- JOHN ----
  {
    id: "john-relationship",
    audience: ["John"],
    title: "Befriend John — he's daily-in-the-rooms eyes",
    why: "Patrick called out: 'John is there every day.' John was at the CTO incident. He sees what the dashboards don't. He's also been told the doctor's appointment news for the team while Patrick was gone.",
    how: "Ask John 'what's the room that frustrates you the most right now?' Listen. Don't problem-solve in the first meeting.",
    proof: "John starts DMing you with room issues before they hit Slack. That's the field-intel pipeline.",
  },
];

// Sequenced execution plan — what to ship in each window, mapped to the
// audiences each move converts.
export interface PlaybookPhase {
  phase: "Week 1" | "Week 2" | "Week 3-4" | "Month 2" | "Month 3 (FTE ask)";
  theme: string;
  moves: string[]; // PlaybookMove.id references
  fteSignal: string; // what evidence accumulates for Stacey
}

export const PLAYBOOK_PHASES: PlaybookPhase[] = [
  {
    phase: "Week 1",
    theme: "Show up self-sufficient. Re-key the alerts WITH Matt.",
    moves: [
      "show-not-ask",
      "rekey-lambdas-with-matt",
      "gitlab-notification-fix",
      "personal-banter-reciprocate",
      "fte-conversion-case-builder",
    ],
    fteSignal:
      "Stacey's onboarding checklist is half-complete before she has to ask. The av-alerts pipeline is back, re-keyed under a service account. Matt's Monday green-circle mentions 'Cortney' for the right reason.",
  },
  {
    phase: "Week 2",
    theme: "Document Patrick's mess in plain English. Make Matt look good.",
    moves: [
      "lambda-one-pager",
      "matt-credit-pattern",
      "do-not-publicly-contradict",
      "friday-wins-discipline",
    ],
    fteSignal:
      "First Friday wins email is a closed-deliverables-only banger. Stacey forwards it. Matt has been credited publicly twice.",
  },
  {
    phase: "Week 3-4",
    theme: "Close one Patrick-broken-since-departure item per week. Earn Mark.",
    moves: [
      "irv-802-close-the-loop",
      "cursor-pairing",
      "india-buildout-volunteering",
      "standardize-not-customize",
      "operational-excellence-anchor",
      "john-relationship",
    ],
    fteSignal:
      "IRV-802 closed. India BOM commented on. Mark stops introducing you as 'the new contractor' and starts introducing you as 'our systems engineer.'",
  },
  {
    phase: "Month 2",
    theme: "Ship the runbook Patrick promised. Hunt the NYC-1250 dragon.",
    moves: ["deliver-the-patrick-doc", "mac-vs-windows-memo"],
    fteSignal:
      "Stacey replies in #av-team to your runbook drop: 'this is exactly what I asked for last year — thank you Cortney.' That message lives forever in your FTE file. Mac-vs-Windows memo lands with a decision date.",
  },
  {
    phase: "Month 3 (FTE ask)",
    theme: "Make Stacey propose the conversion. Don't ask.",
    moves: [],
    fteSignal:
      "Share the 90-day impact log with Stacey as 'wanted you to have the receipts when we have the conversion conversation.' Don't push. She'll bring it up. The receipts you've already built make it easy for her to fight for FTE budget. Closing NYC-1250 in this window is the trump card — it's the dragon Patrick never killed.",
  },
];

// Anti-patterns — Patrick's traps Cortney must avoid. Every contractor-to-FTE
// path dies in the same four ways.
export const PLAYBOOK_ANTIPATTERNS = [
  {
    trap: "'Eventually I will...' syndrome",
    patrickEvidence:
      "Patrick: 'Eventually, I will have a doc that describes all of our monitoring and alerting efforts.'",
    avoid:
      "Never say 'eventually' in #av-team or 1:1s. If you say it, it goes in Jira same day with a target date. No exceptions.",
  },
  {
    trap: "Code-as-yours / single-owner lock-in",
    patrickEvidence:
      "Mark: 'do you know where this plugin comes from? Did Patrick write it or get it from his Q-Sys community? It's not on the Q-Sys Library.'",
    avoid:
      "Every plugin you write gets license / source / support-contact metadata in the file header. Every MR reviewed by Matt or Mark (Cursor makes it possible for them to read it).",
  },
  {
    trap: "Punting on IT politics",
    patrickEvidence:
      "Mac Mini ↔ Q-Sys Connect Windows-only conflict was never escalated to Matt + IT as a formal decision in 4 years.",
    avoid:
      "Force the open architectural decisions in writing. Patrick avoided diplomacy debt; you have to spend some of it to lift the foundation.",
  },
  {
    trap: "Public contradiction of teammates",
    patrickEvidence:
      "Matt: 'I have some armor on my :broken_heart: now' — bracing for being shown up.",
    avoid:
      "Disagreements in DM. Public posts are credit-sharing only. Make Matt's craft visible.",
  },
];

// Helper: compute summary percentages by category and by status.
export const PATRICK_SUMMARY = (() => {
  const total = PATRICK_PORTFOLIO.length;
  const byCat: Record<PatrickCategory, number> = {
    Analytics: 0,
    Support: 0,
    Direction: 0,
    Fluff: 0,
  };
  const byStatus: Record<PatrickContribution["status"], number> = {
    Delivered: 0,
    Partial: 0,
    Open: 0,
    "Broken since departure": 0,
  };
  for (const c of PATRICK_PORTFOLIO) {
    byCat[c.category]++;
    byStatus[c.status]++;
  }
  return { total, byCat, byStatus };
})();
