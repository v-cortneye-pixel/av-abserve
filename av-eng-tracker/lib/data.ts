export type Severity = "P0" | "P1" | "P2" | "P3";

export interface Quote {
  who: string;
  when: string;
  text: string;
  channel?: string;
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
      },
      {
        who: "Matt Cornick",
        when: "Nov 10, 2025 13:13 PT",
        text: "Zoom Rooms never shows HDMI as a share option which means it doesn't see sync on the Magewell.",
      },
      {
        who: "Patrick Gilligan",
        when: "Nov 10, 2025 14:51 PT",
        text: "IRV-802: HDMI share issue as well, but different. The laptop doesn't even see that its plugged into the podium encoder.",
      },
      {
        who: "Matt Cornick",
        when: "Apr 17, 2026 10:42 PT",
        text: "Alright, I'm at the point of saying we can only do HDMI share if we use Q-Sys NV endpoints.",
      },
      {
        who: "Mark Hampson",
        when: "Apr 17, 2026 10:46 PT",
        text: "I'm aligned with this. Let's see what the new qsys endpoints cost.",
      },
      {
        who: "Matt Cornick",
        when: "Apr 21, 2026 08:48 PT",
        text: "1223 is good. I think her problem may have been the usbc adapter. That made her think that the same problem was in 1216.",
      },
      {
        who: "Mark Hampson",
        when: "Apr 21, 2026 08:50 PT",
        text: "Ok. Those damn adapters cause so many issues.",
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
      },
      {
        who: "Matt Cornick",
        when: "Apr 20, 2026 16:31 PT",
        text: "Once in a call, the companions work as they should. Zoom's dashboard is not reporting these errors correctly. Once they're back online, they're still showing as disconnected but from the admin panel they always show as online.",
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
      },
      {
        who: "Mark Hampson",
        when: "May 15, 2026 10:13 PT",
        text: "the room is small, i'd be shocked if it were a lobe steering issue given that the room has been working fine for a year without complaints. Can we verify that the mics arent muted? or that there arent dante routing issues?",
      },
      {
        who: "Matt Cornick",
        when: "May 15, 2026 10:14 PT",
        text: "We're definitely not using discrete lobes in there. The 920 is setup to autosteer like a TCC2. No need for discrete lobes in a room like that. Especially because the tables can move.",
      },
      {
        who: "Matt Cornick",
        when: "May 15, 2026 10:23 PT",
        text: "Yep. We have MXA910s in there? We must have reused old stock. I thought they were 920s.",
      },
      {
        who: "Matt Cornick",
        when: "May 15, 2026 11:06 PT",
        text: "Lobes have to be used for 910s.",
      },
      {
        who: "Matt Cornick",
        when: "Sep 3, 2025 09:06 PT",
        text: "Rebooting the mics fixed it. All metering on the mics looked like AEC was totally fine. I haven't seen that one before.",
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
        who: "Matt Cornick",
        when: "Dec 20, 2024",
        text: "Update pushed at 9:06 PM left newer Mac Minis + all Digital Signage stuck at login (Olympic, SEA-3925, etc.). Logged each one back in manually.",
      },
      {
        who: "Patrick Gilligan",
        when: "Aug 19, 2025 08:26 PT",
        text: "SFO-735 and SEA-3647 did indeed update to Sequoia, which prompts this Apple Intelligence popup... an overlay on top of Zoom Rooms, and doesn't take the computer out of ZR.....therefore Zoom thinks the system is still online (if the computer is not focused on ZR, its seen as offline).",
      },
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
      {
        who: "Mark Hampson",
        when: "Mar 24, 2026 07:21 PT",
        text: "according to Andrew that mac mini was never properly setup and Auto Login for zoomrooms account needs to be setup... I have no idea how this mac mini was never setup, it was installed before i even came onboard.",
      },
      {
        who: "Matt Cornick",
        when: "Mar 24, 2026 07:29 PT",
        text: "this Mac never went through the proper setup process. The reboots may be due to macOS updates because it was originally set up as a regular Mac. If it still has issues after this I'd recommend wiping it and going through the proper setup.",
      },
      {
        who: "Patrick Gilligan",
        when: "Mar 16, 2026 12:58 PT",
        text: "any idea why irv-802 is in a meeting, but when I open up the camera preview its on a Mac home screen?",
      },
      {
        who: "Patrick Gilligan",
        when: "Feb 10, 2026 13:29 PT",
        text: "Ahhhhhhhh 'Use Mac System Picker for Sharing' - read the fine print",
      },
      {
        who: "Cortney Eison",
        when: "May 14, 2026 22:36 PT",
        text: "'Q-SYS Connect software is now certified as a Zoom Rooms attached controller for Windows.' I would imagine that would mean that zoom rooms be run on a NUC for example rather than a Mac.",
      },
      {
        who: "Mark Hampson",
        when: "May 15, 2026 06:26 PT",
        text: "It's such a bummer we need to use windows for this. Every room deployment we've rolled out is a mac mini. We have a specific mac os AV Zoom Room config that gets pushed out to them and is managed by our CE team. We can ask to see what the lift would be like if we would like to start deploying Windows based appliances but I imagine thats going to be a hard no - just last year we (zillow IT) decommisioned all PC appliances that were not laptops. It may be a tough sell.",
      },
      {
        who: "Matt Cornick",
        when: "May 15, 2026 16:19 PT",
        text: "A Mac Mini will outperform any Android based system. That's just a fact. There are Zoom Room features that aren't even supported on any Android appliances.",
      },
      {
        who: "Stacey Newman",
        when: "May 15, 2026 09:56 PT",
        text: "For your standard 30-person enclosed rooms, your existing Neat Bar Pro or zRetreat spec is likely the better choice... Cortney's G62 design starts making more sense above 45 people. It could be worth considering as a Tier 3 large/complex room standard rather than replacing what you have.",
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
      },
      {
        who: "Matt Cornick",
        when: "Feb 17, 2026 09:57 PT",
        text: "Seeing different software versions with 724 offline and 720 online. Maybe related? Weird thing is, I can't upgrade 724 from Zoom.",
      },
      {
        who: "Matt Cornick",
        when: "Feb 17, 2026 10:14 PT",
        text: "It does seem to be an issue with v6.6.10 on the schedulers, looking at the dashboard.",
      },
      {
        who: "Matt Cornick",
        when: "Feb 17, 2026 10:34 PT",
        text: "It does restart but it didn't trigger the update ability for me until I had Priscilla go over and reboot it from the panel directly.",
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
      },
      {
        who: "Matt Cornick",
        when: "May 14, 2026 08:46 PT",
        text: "The last time I tried a Core to expand a Neat Bar Pro, it only worked with audio one way. I think it was for mics. Output wouldn't work. Shure P300 was the only way to get 2 way USB audio connected.",
      },
      {
        who: "Mark Hampson",
        when: "Feb 6, 2025 13:14 PT",
        text: "What are our thoughts on using ceiling mics in tandem with wireless mics in zRetreats (like in 3925). Are the ceiling mics pointless? My thoughts are its a nice to have for the few times we may need them, so it is beneficial to have them in the room if we have the budget.",
      },
      {
        who: "Mark Hampson",
        when: "Feb 6, 2025",
        text: "So in the new enclosed room, I am thinking we repurpose two MXA910 mics with some handheld mics. The space is definitely smaller than 3925. It's a 30 person room.",
      },
      {
        who: "Matt Cornick",
        when: "Jan 26, 2026 13:01 PT (SEA-3829 inventory)",
        text: "SEA-3829: Conference room seating; (1) Front camera; Dual screens HDbT; (1) Senn TCC2; (2) Controller as Neat Pads (x1 floor, x1 wall); (2) Schedulers outside.",
      },
      {
        who: "Cortney Eison",
        when: "May 14, 2026 (G62 thread)",
        text: "For example with a neatboardpro an AVIO can be used to add ceiling mics as a companion to a neatcenter. Alternatively with a neatbar pro the same thing.",
      },
      {
        who: "Neat release notes",
        when: "Oct 2024 (firmware 24.4)",
        text: "Dynamic microphone selection between Neat Pad and main room. This enables further audio coverage for larger rooms or for rooms where the Pad is placed away from the table (e.g. on a podium).",
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
      },
      {
        who: "Mark Hampson",
        when: "Aug 13, 2025 13:16 PT",
        text: "Dude… what?? Ok leave as is for now. I'll try to coordinate remounting them with patch and paint. That's really annoying.",
      },
      {
        who: "Matt Cornick",
        when: "Aug 13, 2025",
        text: "3626 is good. They used the vesa mount so I was able to flip it.",
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
      },
      {
        who: "Matt Cornick",
        when: "May 8, 2026 12:20 PT",
        text: "As far as SN, MACs, etc we have the IP doc but it's really geared towards managing devices. SNs aren't on there because they can be a pain to always enter and you don't really need them unless you're replacing gear. When John pulled the bad NV, he should have logged the info into the Jira ticket so Mark could just reference it there. Jira is newish for us and we're also trying to get in the habit of tracking everything there so it's easily referenced later.",
      },
      {
        who: "Patrick Gilligan",
        when: "Sep 2, 2025 10:07 PT",
        text: "where have you been buying the power phoenix blocks for the NV-21 PSUs? Seems like the unit does not ship with it, annoyingly.",
      },
      {
        who: "Mark Hampson",
        when: "Sep 2, 2025 10:13 PT",
        text: "im sure this one would come with it, but i dont know how to buy this one. ive never even seen this power supply in real life before.",
      },
      {
        who: "Matt Cornick",
        when: "Aug 20, 2025 08:22 PT",
        text: "The NV21 PSU will not work with the NV32.",
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
      },
      {
        who: "Mark Hampson",
        when: "Sep 3, 2025 09:26 PT",
        text: "We dont have money for TCC2's my dudes so its going to have to be option 1. FWIW I've always treated the built in AEC in those MXA's as a reference for the intellimix so the lobes know not to move around for far end voices (not for full blown AEC) and used the DSP's AEC.",
      },
      {
        who: "Matt Cornick",
        when: "Sep 3, 2025 09:33 PT",
        text: "we do have x2 in SFO from the 10 floor and I have x2 that I could part with. Plus there's the 4 in 3925 that could be argued are almost unusable with the HVAC in the room.",
      },
      {
        who: "Patrick Gilligan",
        when: "Sep 3, 2025 09:47 PT",
        text: "Updating 910s....shoulda/coulda/woulda been a good aop initiative for 2026. Didn't occur to me, personally, but I wish it had.",
      },
      {
        who: "Mark Hampson",
        when: "Sep 3, 2025",
        text: "ship has sailed. maybe in 2027. although we do have funds for if they break, so technically we could replace one a month haha.",
      },
      {
        who: "Mark Hampson",
        when: "Later (unanswered to Matt)",
        text: "Revisiting this conversation. We are putting 2 new ceiling mics in NYC-1204 at the end of the year. Any heartburn with going with MXA920s or did you want to stick with TCC2s?",
      },
      {
        who: "Nick Melin",
        when: "Oct 9, 2023 15:11 PT",
        text: "I'm actually shocked at how good the TCC2 ceiling mics are in the All Hands.",
      },
      {
        who: "Patrick Gilligan",
        when: "Feb 13, 2024 10:52 PT",
        text: "I learned at ISE, that the Sennheiser mics can actually be used for room reenforcement, with a separate reference channel sent back to the mic. It has slick DSP technology that provides something similar to a mix-minus and can cancel local speaker signal and block feedback. I had meaning to ask if you wanted to experiment with that at some point.",
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
      },
      {
        who: "Matt Cornick",
        when: "Apr 21, 2026 08:48 PT",
        text: "1223 is good. I think her problem may have been the usbc adapter. That made her think that the same problem was in 1216.",
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
      },
      {
        who: "Mark Hampson",
        when: "Apr 1, 2026",
        text: "Looking at the file now, it should be redone. Correct me if I'm wrong but cant this just be a simple Zoom Room? Do they really need manual routing and all that?",
      },
      {
        who: "Mark Hampson",
        when: "Apr 1, 2026",
        text: "Did Patrick write it or get it from his Q-Sys community? It's not on the Q-Sys Library.",
      },
      {
        who: "Matt Cornick",
        when: "Apr 1, 2026",
        text: "Patrick showed me how to get the projector/screen controls. It works... On the routing page, if you have no source selected and select a destination, it brings up the controls dynamically dependent on what destination you select. It would have made sense to not have the 'No source selected' qualifier and then also include the controls under the cog as a tab.",
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
      },
      {
        who: "Patrick Gilligan",
        when: "Nov 17, 2025 09:53 PT",
        text: "its not just that IP addresses didnt' get reserved. Its that a lot of IPs don't show up on the switch's arp table until after a reboot. This happens a lot when a device has a dante and control IP, like Shure stuff....so a lot of these 'missing' reservations weren't there until the power outage.",
      },
      {
        who: "Patrick Gilligan",
        when: "Nov 17, 2025 09:54 PT",
        text: "But in brighter news, I don't know of anyone else whose got a daily IP schedule/switch validator running.",
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
      },
      {
        who: "Stacey Newman",
        when: "Mar 31, 2026 09:56 PT",
        text: "We could never get people to adopt the digital whiteboarding... we had mural and figma and all those zoom whiteboards everywhere and no one uses it.",
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
      },
      {
        who: "Matt Cornick",
        when: "May 6, 2026 09:50 PT",
        text: "Other than SEA-3619, there's no room setup to display encrypted content.",
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

export const QUICK_WINS = [
  {
    id: "qw1",
    title: "USB-C Adapter Standard SKU",
    effort: "Low",
    visibility: "High",
    notes: "Test 3 part numbers in lab, lock in one, ship to every site. Mark loves it.",
  },
  {
    id: "qw2",
    title: "NV-21 SN/MAC Tracking Runbook in Jira",
    effort: "Low",
    visibility: "Medium",
    notes: "Closes a process gap John already failed once. Mark loves it.",
  },
  {
    id: "qw3",
    title: "Take Over WAVE-16 with Zoom Support",
    effort: "Low",
    visibility: "Medium",
    notes: "Frees Matt. Demonstrates ownership of cross-vendor escalations.",
  },
  {
    id: "qw4",
    title: "Document Zoom Whiteboard Companion Workaround",
    effort: "Low",
    visibility: "Medium",
    notes: "Add to internal runbook. List rooms in workaround state vs untouched.",
  },
  {
    id: "qw5",
    title: "Spare Parts Inventory Doc",
    effort: "Low",
    visibility: "High",
    notes: "NV-21, NV-32, PSUs, Phoenix blocks, capture cards, UE1s.",
  },
  {
    id: "qw6",
    title: "TCC2 Commissioning Pass — Start with SEA-3925",
    effort: "Medium",
    visibility: "High",
    notes: "No CapEx. Recovers known-bad room. Plants flag as audio engineer.",
  },
  {
    id: "qw7",
    title: "MXA920 vs TCC2 One-Pager for NYC-1204",
    effort: "Low",
    visibility: "High",
    notes: "Closes Mark's 8-month-old unanswered question.",
  },
  {
    id: "qw8",
    title: "Single-Page UCI Rollout Plan",
    effort: "Medium",
    visibility: "High",
    notes: "Inherits Patrick's most visible artifact.",
  },
];

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
  },
  {
    who: "Patrick Gilligan",
    when: "Nov 10, 2025",
    text: "VSI is kinda trash. Better than BD, but not great.",
  },
  {
    who: "Matt Cornick",
    when: "Dec 9, 2025 13:24 PT",
    text: "HDMI screen share [SFO-735]: I'm the point of Zoom support... I did not see this happen at home so I don't think it's a osTahoe issue. The only thing unique about this room are the NDI cams.",
  },
  {
    who: "Matt Cornick",
    when: "Apr 16, 2025 12:33 PT",
    text: "Two of the Birddog P400 4k cams are noisy. I'm fine for the SFO All Hands but I don't know that I would want to put one of them in Olympic.",
  },
  {
    who: "Mark Hampson",
    when: "Apr 16, 2025",
    text: "ugh. thats a non-starter... yeah no way. OK lets not use these.",
  },
  {
    who: "Patrick Gilligan",
    when: "Jan 16, 2025 11:48 PT",
    text: "the BirdDog decoder for the right projector is busted. The switch sees the MAC address, but no IP... we have no way of knowing if we are getting signal or not, until its tried in person. Hopefully by Lu, and not an end user. I would hate for a 80 person meeting to happen, and only the 'house left' projector shows the content.",
  },
  {
    who: "Patrick Gilligan",
    when: "Feb 6, 2025 12:46 PT",
    text: "I will be the first to admit…after 'Birddog-gate', it was miracle we hit FDoB.",
  },
  {
    who: "Stacey Newman",
    when: "May 7, 2025 11:11 PT",
    text: "I wish the Urbens were better since we paid so much but like the BirdDog we should probably have a no urben emoji.",
  },
  {
    who: "Matt Cornick",
    when: "Apr 16, 2025 13:55 PT",
    text: "Sticking to white and NDI (assuming we only have one network drop there) we're pretty limited. Panasonic AW-UE40. Aver PTZ310UV2 https://www.averusa.com/products/ptz-camera/ptz310uv2",
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
