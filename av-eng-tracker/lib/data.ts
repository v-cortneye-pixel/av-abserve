export type Severity = "P0" | "P1" | "P2" | "P3";

export interface Quote {
  who: string;
  when: string;
  text: string;
  channel?: string;
}

export interface Issue {
  id: string;
  title: string;
  severity: Severity;
  category: "HDMI" | "Mac" | "Zoom" | "Audio" | "Hardware" | "Process" | "UI" | "Network" | "Other";
  rooms: string[];
  status: "Open" | "Workaround" | "In Progress" | "Resolved";
  owner: string;
  summary: string;
  rootCause: string;
  workaround?: string;
  quotes: Quote[];
  currentState: string;
  cortneyAction: string;
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
      "WAVE-16 still open. No proactive monitoring. New scheduler drift discovered reactively each time.",
    cortneyAction:
      "Take over WAVE-16. Add scheduler firmware version check to daily alerts bot. Build proactive list of v6.6.10 stragglers.",
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
