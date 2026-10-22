# UTM MSA Website: Charity Week Launch Changelog

**Date:** October 22, 2026
**Built on:** the latest `main` in `utm-msa/utm-msa-website` (commit `25c4d4a`)
**Scope:** President and VP feedback, plus Moosa's Charity Week launch list

---

## Update 4 (Oct 22): sign-up links, code of conduct, Linktree links

Bundled with Update 3 into one upload, since Update 3 hadn't gone to GitHub yet.

| What | Where |
|---|---|
| **Sign-up links added** (from the MSA Linktree). Auction Dinner: `tr.ee/mMuxnOC9Ka` (button says "Get tickets"). Brothers' FIFA Tournament: `tr.ee/4VCXEA93Qe`. Brothers' Soccer Tournament: `tr.ee/C4hU0ymzM8`. These pop-ups now lead with the sign-up button, with Instagram as the second link. The other Charity Week events have no sign-up, so their button goes to Instagram. | `events-data.js` (`register`) |
| New optional field `registerLabel`, for button text other than "Register". | `events-data.js` header, `events-team.js` `eventActionsHTML` |
| **Homepage auction dinner block:** the main button is now "Get auction dinner tickets" (orange, Charity Week style), and "View the post on Instagram" is the second link. | `index.html` highlight section, `charity-week.css` `.cw-highlight-actions` |
| **Code of conduct is live:** the "being finalized" placeholder is replaced with a "Read the UTM MSA Code of Conduct" button linking to the published Google Doc (from the Linktree). The confidential-report and Campus Safety lines stay. | `about.html#code-of-conduct`, `pages.css` (button colour fix inside `.coc-card`) |
| **ISNA Cares:** added an "ISNA Cares for UTM students" button (`isnacares.ca/utm`, from the Linktree) next to the email and phone buttons. Description now mentions booking through that page. | `resources.html`, ISNA Cares card |
| **Musalla page:** the "Can't find a room?" note now also links UTM's official spiritual and faith spaces page (from the Linktree). | `musalla.html` |

---

## Going live on utmmsa.org (Bluehost)

Checked Oct 22: utmmsa.org's DNS is managed at **Bluehost** (nameservers `ns1/ns2.bluehost.com`), and the domain still points to Bluehost's server (`66.235.200.145`), where the old WordPress site lives. The new site is on Vercel (`utm-msa-website` project), which redeploys every time GitHub changes.

**Recommended: keep the domain at Bluehost and point it to Vercel.** No file uploading, and every GitHub upload goes live on utmmsa.org automatically.
1. **Vercel:** Project `utm-msa-website`, then Settings, then Domains. Add `utmmsa.org` and `www.utmmsa.org`.
2. **Bluehost:** Domains, then utmmsa.org, then DNS. Change the `@` A record from `66.235.200.145` to `76.76.21.21`. Change `www` to a CNAME pointing at `cname.vercel-dns.com`. Leave every MX/email record and any other record alone.
3. Wait for DNS (usually minutes, up to a few hours). Vercel issues the HTTPS certificate on its own.
4. Before switching, make a Bluehost backup of the WordPress site. Keep the Bluehost hosting plan until the new site has run cleanly for a while.

**Alternative: upload the files to Bluehost directly.** Back up WordPress, then upload every site file to `public_html` with File Manager or FTP. Remove or move the WordPress files so the new `index.html` loads. Every future change has to be uploaded the same way, by hand, and GitHub/Vercel stop being the live site.

---

## Update 3 (Oct 22): event pop-ups show the post, past events cleaned up, credits

| What | Where |
|---|---|
| **Event pop-ups now show the event itself, not just text.** Wide screens show details on the left and the Instagram post or reel on the right. Phones show details first, then the post. If an event has no post yet, its poster shows instead. Charity Week events use the Week at a Glance posters. While Instagram loads, or if it's blocked, the poster or a clear "View this post on Instagram" link shows. | `events-team.js` (`eventMediaHTML`, `eventActionsHTML`, `wireEventDialogs`), `pages.css` "Event pop-up with a post or poster", `script.js` `zoomOpen` (new `wide` option, bigger dialog) |
| **Main button works like the newsletter.** With a registration link, the button says "Register" and goes straight to it, with the Instagram post as a second link. Without one, it goes to the event's Instagram post. If there's no post either, it goes to the Charity Week post (for Charity Week events) or @utmmsa. Past events say "Watch the recap on Instagram". | `events-team.js` `eventActionsHTML` |
| **Registration links, posts and details can now come from the Google Sheet.** New optional columns: **F Registration link, G Instagram post, H Details**. Links must start with `https://`. Blank columns change nothing. | `script.js` `parseEventsCSV` |
| New event fields in the hand-entered file: `post`, `image` + `imageAlt`, `register`. The old `link`/`linkLabel` are gone. | `events-data.js` (header comment explains each) |
| Week at a Glance posters added as optimized images (about 160 KB each, down from 2 to 3 MB). | `cw-week-glance-1.jpg` (Wed/Thu), `cw-week-glance-2.jpg` (Fri to Sun) |
| **MIMC removed** from the site. It's listed in `HIDDEN_EVENTS`, so the sheet row stays and you can bring it back by deleting it from that list. | `events-data.js` `HIDDEN_EVENTS` |
| **Weekly events (Tag = "Weekly", e.g. Jummah Prayer) never go to Past.** They roll forward to their next date and show as "Every Friday" in Today/Upcoming. The homepage "This week" shows "· Every Friday", and the pop-up shows "Every Friday · next: Fri, Oct 23". | `events-data.js` `expandWeekly`, `events-team.js` `eventDateLabel`, `script.js` `renderWeekGrid` |
| **Duplicate "Back on Track" fixed.** The sheet's "Back on Track" row and the hand-entered "Back on Track: Brothers' Scavenger Hunt" are now one event, which took the sheet's time and room (1 to 4 PM, IB 140). Rule: same date, and one title starts with the other, means one event. | `events-data.js` `mergeEvents` |
| **"Join the team" card removed** from Getting involved (it was waiting on application and election dates). | `about.html#getting-involved` |
| **Marketing is now under Internal Affairs** in the departments list. | `about.html`, "Our departments" |
| **Website shoutout** in every page footer: "Built and maintained by UTM MSA Internal Affairs. A big thank you to Husain, Farah, Zunairah, and Wafa for their work on this website." It replaces "Designed & maintained by UTMMSA Marketing". | footer of all six pages |

---

## Update 2 (Oct 22, later the same day): Instagram posts, real dates, arrow intro is back

| What | Where |
|---|---|
| Auction dinner post (`instagram.com/p/DekzhyTGxnj`) is now live in the homepage Instagram slot. The embed is switched on (`instagram-media`, no longer `-pending`) and the "View the auction dinner post" link points to it. | `index.html`, highlight section |
| The Auction Dinner "Tickets and details" button in the event pop-up points to the same post. | `events-data.js`, Auction Dinner `link` |
| Charity Week post (`instagram.com/p/DepVwp0my83`) is linked from the Events page banner and the About page Charity Week card, and stored as `CHARITY_WEEK.post`. | `events.html` `#cwBanner`, `about.html#impact`, `events-data.js` |
| Past events now have real dates and recap reels: **Islamic Heritage Month Exhibit** (Thu Oct 15), **Frosh Field Day** (Sun Sept 27, new), **Back on Track: Brothers' Scavenger Hunt** (Mon Sept 7). They sort by date in the Past tab and the pop-up has a "Watch the recap on Instagram" button. | `events-data.js`, "Earlier this term" |
| "Back on Track" and the Brothers' Scavenger Hunt are now **one event**, matching the single reel. Split them back into two entries if they were separate. | `events-data.js` |
| **Arrow intro is back on the Events page**, with real content. An arrow shoots across and one card per Charity Week day pops up as it passes (Wed to Sun, every event listed). Today's card gets a thick orange border and a "Today" pill, finished days go dashed, and the Auction Dinner is starred. It starts when the strip scrolls into view, so nobody misses it. | `events.html` `#cwFlight`, `events-team.js` `initCharityFlight()`, `charity-week.css` "arrow intro" |
| Arrow intro accessibility: it's `aria-hidden` because the same events are in the Upcoming and Today tabs, so screen readers don't hear them twice. With reduced motion (system setting or Display settings) the cards show in place without the arrow. It's hidden under 760px wide, where the list below does the job. It also switches off after Charity Week with everything else. | same |

---

## Summary of what changed

| # | Request | Status | Where |
|---|---------|--------|-------|
| P1 | Don't publish the full team structure | Done | `about.html` (org chart removed), `pages.css` |
| P2 | Naseeha: hide for now | Done (hidden, not deleted) | `resources.html` |
| P3 | Remove constitution excerpts | Done | `about.html`, `pages.css` |
| P4 | Add a code of conduct | Section added, text pending | `about.html` (`#code-of-conduct`) |
| P5 | Local masjids formatting | Kept as is (per Moosa) | none |
| V1 | ISNA Cares no longer "coming soon" | Done | `resources.html` |
| V2 | Calendar view / event details | Charity Week at a glance on the homepage; event pop-ups now show partners, details, and a link | `index.html`, `script.js`, `events-team.js`, `events-data.js` |
| V3 | "Become a General Member" becomes "Getting involved" | Done, with screen-reader label "Getting involved with the MSA" | header on all 6 pages, footers, `about.html#getting-involved` |
| V4 | Musalla locations + multifaith room + reflection spaces | Done; Jumu'ah left as a placeholder | `musalla.html`, `pages.css` |
| 1 | Remove the ILF charity | Done; replaced by a Charity Week card | `about.html` (`#impact`) |
| 2 | Homepage calendar: rest of Charity Week; auction dinner in the Instagram slot | Done | `index.html`, `script.js`, `charity-week.css` |
| 3 | Remove "This year's theme" intro on About | Done | `about.html`, `events-team.js`, `pages.css` |
| 4 | Rename "Sagas" | Now **Events** ("What's on & lectures") | all pages, `pages.css`, `a11y.css`, `styles.css` |
| 5 | Charity Week colours on the Events page; CW events in Upcoming; recent events in Past; today's events in Today | Done | `events.html`, `events-data.js`, `charity-week.css`, `events-team.js` |
| 6 | Document everything | This file | `CHARITY_WEEK_LAUNCH_CHANGELOG.md` |

---

## New files

### `events-data.js`
Holds events typed in by hand, merged with the Google Sheet on the homepage and Events page.

- `CHARITY_WEEK` object: name, theme ("Waves of Unity"), `start` 2026-10-21, `end` 2026-10-25, `showFrom` 2026-10-14. This window switches the Charity Week homepage block, the Events page banner, and the Events page colours **on and off automatically**. Nothing needs to be removed by hand after Charity Week.
- `LOCAL_EVENTS` array:
  - All 8 Charity Week events (Oct 21 to 25) with times, rooms, partners, and short details, taken from the Week at a Glance posters in Marketing's Drive folder.
  - Three past events with no date yet: Islamic Heritage Month Exhibit, Back on Track, Brothers' Scavenger Hunt. They show at the bottom of the Past tab as "Earlier this fall" until a date is added.
- `mergeEvents(sheetEvents)`: combines sheet + local. Same date and same title counts as one event (the local copy wins because it has more detail).
- `charityWeekActive()`: true from `showFrom` through `end`.
- If the Google Sheet fails to load, these events still show.

### `charity-week.css`
Charity Week palette sampled from the Charity Week poster (deep ocean blue, sea-foam, poster orange). Loaded only on `index.html` and `events.html`, after `resources.css` and before `a11y.css` so Display settings (high contrast) still override it.

- `.cw-glance`, `.cw-days`, `.cw-day` (homepage at a glance)
- `.cw-highlight` (homepage auction dinner block)
- `html.cw-active body.page-events` swaps the gold accents for Charity Week orange on the Events page only
- `.cw-banner` (Events page banner), `.event-row.is-cw` (orange left edge on Charity Week rows)
- High-contrast overrides at the bottom
- Contrast checked: sea-foam text 10.4:1, orange text 5.9:1 (5.0:1 on the lightest gradient stop). The lighter wave blue is never behind text.

### `CHARITY_WEEK_LAUNCH_CHANGELOG.md`
This document.

---

## Changes by file

### All pages (`index.html`, `about.html`, `events.html`, `resources.html`, `musalla.html`, `accessibility.html`)
- **Nav:** "Sagas / Events & lectures" is now "Events / What's on & lectures".
- **Header button:** "Become a General Member" (Google Form) is now **"Getting involved"**, linking to `about.html#getting-involved`. It has `aria-label="Getting involved with the MSA"`, so screen readers hear the full phrase while the button shows "Getting involved".
- **Footer, Site map:** "Sagas" renamed "Events".
- **Footer, Get involved column:** heading renamed "Getting involved"; added "Ways to get involved" (to `about.html#getting-involved`); "Become a General Member" form link kept as is (per the VP); "Donate to our current campaign" relabelled **"Donate to the UTM MSA"** (same Zeffy link) since the ILF campaign is off the site.

### `index.html` (Homepage)
- Hero buttons: "See this week's events" is now "See what's on this week"; "Meet the cabinet" is now "Get involved with the MSA" (to `about.html#getting-involved`).
- **New section `#cwGlance` "Charity Week at a glance"**, placed before "This week". One small card per day, Wednesday to Sunday, each listing that day's events with time and room. Today gets a thick orange border and a "Today" label; finished days get a dashed border and a "Done" label (text labels, so it doesn't rely on colour). Stacks to one column on phones. While it shows, "This week" is hidden; after Oct 25 it hides itself and "This week" comes back.
- **Highlight section:** Monday Orientation replaced with **Sunday: Charity Week Auction Dinner** (Oct 25, 4:30 to 9 PM, ISNA Canada Islamic Centre gym). The Instagram embed slot is ready but **waiting on the post URL** (see Open items).
- Loads `charity-week.css` and `events-data.js` (before `script.js`).

### `events.html` (formerly "Sagas")
- `<title>` is now "Events and lectures | UTM MSA". `<body class="page-events">` added.
- Hero: H1 "Events", subtitle "What's on, what's next, and what you missed", new intro line.
- **Removed:** the arrow-flight intro and its six placeholder character cards.
- **Added:** Charity Week banner (`#cwBanner`): "UTM MSA presents / Charity Week / This year's theme: Waves of Unity", plus a one-line description. Hidden outside the Charity Week window.
- **Tabs reordered:** Today, Upcoming, Past, Lectures. When something is on today and the visitor didn't arrive on a specific tab, the page opens on Today (today, Oct 22, that's Building Brotherhood and Sisters' Chai and Chill).
- Internal class names renamed for future maintainers: `saga-tabs` to `event-tabs`, `saga-tab` to `event-tab`, `saga-panel` to `event-panel`, `sagas-tabs-wrap` to `events-tabs-wrap`.
- Loads `charity-week.css` and `events-data.js`.

What each tab shows right now (Oct 22):
- **Today:** Building Brotherhood (1 to 3 PM, UTMSU Meeting Room); Sisters' Chai and Chill (3 to 5 PM, UTMSU Board Room)
- **Upcoming:** Tote Bag Painting and FIFA Tournament (Fri); Hike and Picnic and Soccer Tournament (Sat); Auction Dinner (Sun)
- **Past:** IR x UTM MSA Game Night (Oct 21), then IHM Exhibit, Back on Track, Brothers' Scavenger Hunt ("Earlier this fall")

### `about.html`
- **Removed:** "This year's theme" intro dialog and the inline theme line.
- **Removed:** the Departments org chart (names, reporting lines, "Position open" boxes).
- **Removed:** "From our constitution" quotes.
- **Removed:** the Illuminating Lights Foundation campaign card, progress bar, and ILF links.
- Hero paragraph shortened (no longer mentions departments or causes).
- "On this page" now lists: cabinet, Getting involved, Code of conduct, Charity Week.
- **Kept:** "This year's cabinet" grid (exec names and titles only, still edited in `TEAM` in `events-team.js`).
- **New `#getting-involved`:** three cards (Become a general member, with the existing form; Volunteer at an event; Join the team, with application/election dates as a placeholder), then **"Our departments"**: Student Life, Internal Affairs, Public Affairs, Finance, Marketing, each with its departments listed but no names or vacancies.
- **New `#code-of-conduct`:** intro, a placeholder for the approved text, and how to raise a concern (msa@utmsu.ca, or Campus Safety 905-569-4333 for urgent help).
- **`#impact` is now Charity Week:** "Waves of Unity" card with a link to the schedule. Fundraising total, goal, and donation link are left as a placeholder for you to add.

### `resources.html`
- **ISNA Cares:** "Coming soon" badge removed. Copy says the MSA is running counselling with ISNA Cares again this year. Buttons: "Email msa@utmsu.ca" (subject pre-filled "ISNA Cares counselling") and "Call ISNA Canada 905-403-8406".
- **Naseeha Health:** hidden inside an HTML comment, not deleted. To restore, remove the two comment markers around the card.
- 9-8-8, Good2Talk, Campus Safety, and the Health & Counselling Centre are unchanged.

### `musalla.html`
"Praying on campus" rebuilt:
- Intro no longer cites the constitution.
- **MSA prayer rooms:** Brothers' room CC 2172 / 2174, Sisters' room CC 2100 (CCT Building, 2nd floor; notes the move from CC 2132).
- **Multifaith space:** Student Centre, upstairs above the Duck Stop, run by UTMSU, elevator key at the info desk.
- **Reflection spaces:** DH 3rd floor (between DH 3026 and 3028), DH 4th floor (between DH 4026 and 4030), IB 3rd floor (next to IB 377 and across from IB 396), MN 2nd floor (next to MN 2171), MN 3rd floor (across from MN 3160).
- Link to the UTM campus map.
- **Jumu'ah on campus:** placeholder until this term's room and time are confirmed.
- Local masjids section unchanged (per Moosa).

Sources for room numbers: UTM's Spiritual & Faith Spaces page, the MSA prayer spaces guide (utmprayerspaces.carrd.co), and UTMSU's Multi-Faith page.

### `script.js`
- New `renderCharityGlance(events)` (section 4b) builds the homepage at-a-glance block.
- `loadEvents()` now merges the sheet with `events-data.js` and still renders when the sheet fails.
- `renderWeekGrid()` skips undated events.
- On load, adds `html.cw-active` during the Charity Week window.
- Header comment: "Sagas" changed to "Events".

### `events-team.js`
- Removed `initThemeReveal()` (the About page theme dialog).
- New `initCharityBanner()` shows the Events page banner during Charity Week.
- `loadEventsForPages()` merges the sheet with `events-data.js`; falls back to local events if the sheet fails.
- New `eventDateLabel()`: undated past events read "Earlier this fall".
- Event rows: Charity Week rows get `is-cw`; empty time/location lines are no longer printed.
- Event pop-up now also shows **With:** (partners), a short description, and an optional link button.
- Opens the Today tab first when something is on today.

### `pages.css`
- **Removed:** org chart, constitution cards, theme reveal and theme inline, arrow-flight intro, character cards.
- **Renamed:** saga tab/panel selectors to event tab/panel.
- **Added:** `.involve-grid`, `.involve-card`, `.subsection-title`, `.dept-list`, `.coc-card`, `.room-chip`, `.campus-spaces`, `.reflection-list`, `.musalla-campus-card.is-text-only`.
- Charity card styles kept (reused for the Charity Week card and later fundraising totals).

### `a11y.css`
- Removed the reduced-motion rule for the deleted arrow-flight intro.
- Renamed `.sagas-tabs-wrap` and `.saga-tab` selectors.

### `styles.css`
- Comment wording only ("Sagas" to "Events").

---

## Open items for Moosa

Search the code for `REPLACE_ME` to find each one.

1. ~~Auction dinner Instagram post~~ Done in Update 2.
2. **Per-event Instagram posts** for Game Night, Building Brotherhood, Sisters' Chai and Chill, Tote Bag Painting, FIFA, Hike and Picnic, and Soccer: add `post: "..."` in `events-data.js`, or column G in the sheet. Until then those pop-ups show the Week at a Glance poster. (Sign-up links done in Update 4.)
3. ~~Past event dates~~ Done in Update 2. Optional: add time and room for IHM Exhibit, Frosh Field Day and Back on Track.
4. ~~Code of conduct~~ Done in Update 4.
5. ~~Application and election dates~~ The "Join the team" card was removed in Update 3. Bring it back when dates are set.
6. **Charity Week fundraising total, goal, donation link** (`about.html#impact`).
7. **Multifaith room number** (`musalla.html`): UTMSU lists Student Centre Room 200; the older MSA guide lists 290. The page says "upstairs above the Duck Stop" until confirmed.
8. **Jumu'ah on campus** (`musalla.html`): room, khutbah time(s), khateeb for this term.
9. **Prayer room details to double-check with Prayer Services:** CC 2172/2174 and CC 2100 come from the MSA's own prayer spaces guide, which may be from a previous year.
10. **Two schedule conflicts between sources:** the posters and the Oct 19 exec meeting notes disagree. The site follows the **posters**:
    - Sisters' Tote Bag Painting: poster 3 to 6 PM, UTMSU Meeting Room; exec notes 4 to 7 PM, SC Meeting Room.
    - Brothers' FIFA Tournament: poster DV 3140; exec notes "UTM Room".
11. **Footer donate link:** relabelled "Donate to the UTM MSA". Confirm the Zeffy form isn't still tied to the ILF campaign.
12. ~~ISNA Cares link~~ Done in Update 4.
13. **Jumu'ah on the Musalla page:** the events sheet has "Jummah Prayer, Fridays 1:00 to 3:00 PM, Speigel Hall" (check the spelling of the room). The Musalla page still says details are coming. Confirm and it can go there too.

---

## How the site behaves after Charity Week

On **October 26** the homepage at-a-glance block, the Events page banner, and the orange accents switch off on their own and the site returns to navy and gold. The Charity Week events stay in the Past tab. To run the same treatment next year, update the `CHARITY_WEEK` dates and theme in `events-data.js` and replace the events in `LOCAL_EVENTS`.

---

## Checks run

- All JS files pass `node --check`.
- All HTML pages: tags balanced (no unclosed or mismatched tags).
- All CSS files: braces balanced.
- Rendered at 1280px and 390px in headless Chromium: homepage, Events, About, The Musalla. No page errors. Today, Upcoming, and Past tabs show the expected events; the auction dinner pop-up opens with partners, details, and link.
- Not tested here: the live Google Sheet and prayer-time API (blocked from the build environment). With the sheet down, the Charity Week events still render, which is the intended fallback.
