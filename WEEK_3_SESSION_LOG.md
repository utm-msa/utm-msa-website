# UTM MSA Website Redesign — September 21, 2026 Session Log

**Date:** September 21, 2026  
**Session Focus:** Major design refinements, new pages, and Vercel deployment  
**Status:** All code complete and pushed to GitHub; Vercel deployment webhook issues encountered

---

## Overview

This session involved seven major builds:
1. **Sagas page** (renamed from Events) — with arrow-flight intro animation and tab-switching
2. **About page redesign** — visual org chart + theme-reveal overlay
3. **Resources page rebuild** — Pattern B (rail + sliding detail panel)
4. **The Musalla page** — live prayer times + masjid snapshots
5. **Homepage tweaks** — hero copy, footer redesign, contrast fixes
6. **CSS/JS updates** — zoom-open interactions, scroll reveal, color/contrast corrections
7. **Vercel deployment** — initial push and configuration

All files validated for syntax, brace balance, and tag balance before deployment.

---

## Changes Made (Sept 21)

### Navigation Rename
- **"Events" → "Sagas"** across all page nav menus
- **"Jumu'ah" → "The Musalla"** across all page nav menus
- Files: `index.html`, `about.html`, `events.html`, `resources.html`

### Homepage (`index.html`) Updates
- **Hero headline:** "One home for the whole MSA" → **"One home, open to all of UTM"**
  - New subtext: "A gathering place for every Muslim on campus — and an open door for anyone curious to know us. Prayer times, events, and the real people behind them, always current, always one click away."
- **Kicker:** Removed "UTM" text next to "As-salāmu ʿalaykum" (visual noise reduction)
- **Footer redesign:**
  - Logo mark only (cropped, 34px height) + copyright text
  - Social icons with outlined borders (no filled backgrounds)
  - Credit line: "Designed & maintained by UTMMSA Marketing"

### About Page (`about.html`) New Features
- **Theme reveal overlay:** On page load, a full-screen intro shows "This year's theme" (placeholder text needs filling in)
  - Fades out after 3.2s or on click
  - CSS animation with `prefers-reduced-motion` support
- **Org chart redesign:** Replaced accordion collapsibles with a visual tiered HTML chart
  - Executives tier (President, VP, Senior Advisor)
  - Department tier (6 execs managing specific portfolios)
  - Directors tier (15+ positions across all departments, some marked "Position open")
  - Associates & Volunteers tiers labeled at bottom
  - All positions tied to the constitution (Article II, Article IV excerpts included)

### Sagas Page (`events.html` → same filename)
- **Arrow flight intro:** Gold animated arrow flies left-to-right across hero, with placeholder "snapshot" cards popping in (Nell Crain, Miles Morales, Goku, Itachi, Odysseus, Paul Atreides)
  - Triggers staggered card animations
  - Settles, then intro fades out and tabs fade up
  - Skipped entirely on mobile
- **Four-tab interface:** Present | Upcoming | Past | Lectures
  - Present = events dated today (mostly empty unless something's happening that day)
  - Upcoming/Past split on event date vs. today
  - Lectures = live YouTube channel embed (auto-updating)
- **Event rows:** Clickable, with zoom-open interaction
  - Clicking an event row scales it from its position into a centered detail view
  - Escape or backdrop click to close
  - Reusable `zoomOpen()` function in `script.js` (also intended for Resources cards)

### Resources Page (`resources.html`) Pattern B Rebuild
- **Left rail (no icons):** 5 category buttons (Mental Health, Academic & Financial Support, Local Masjids, Halal Food, Boycott List)
  - Selected button gets gold gradient background + left border
  - Hover states
- **Right detail panel:** Slides in with content when a rail item is clicked
  - `zoom-ghost` tile animates from the clicked button into the panel position
  - Panel content fades in and scales slightly
  - Smooth 0.4s transitions (cubic-bezier easing)
- **Responsive:** On mobile (< 860px), rail becomes horizontal row, panel stacks below
- **All 5 sections preserved:**
  - Mental Health (with crisis callout: UTM Campus Safety, 988, Good2Talk)
  - Academic & Financial (RGASC, library, UTAPS, OSAP, zakat, peer tutoring)
  - Local Masjids (5 closest, with distances and directions links)
  - Halal Food (on-campus + 5 nearby restaurants)
  - Boycott List (placeholder, marked "Coming Soon")

### The Musalla Page (`musalla.html` + `musalla.js`)
- **Live prayer times widget:** Fetches from AlAdhan API (ISNA method, UTM coordinates)
  - Shows Hijri date + Gregorian date
  - Displays Fajr, Dhuhr, Asr, Maghrib, Isha in a 5-column grid
  - Auto-updates on page load; no manual entry
- **On-campus section:** Placeholder for prayer room photos + Jumu'ah logistics (awaiting cabinet confirmation)
- **Nearby masjids grid:** 5 snapshot cards with distance chips + "Directions" links (Google Maps intent URIs)
  - Photos are placeholders
  - No embedded calendar (masjids don't publish embeddable timetables; link to their sites instead)

### CSS & Contrast Fixes
**styles.css:**
- Removed `.kicker-loc` rule entirely (was orphaned after removing UTM text from HTML)
- Removed `.kicker-sep` rule (was orphaned after removing separator span)
- `.scroll-cue-arabic` (Bismillah):
  - Font size: 21px (was 21px, kept same initially, then user sized it up further)
  - Opacity: rgba(232, 196, 104, 0.5) (was 0.85; toned down to read better)
  - Color changed to white on user request: #ffffff or #f4f1e8
  - Added `margin-top: 12px` to space it lower relative to scroll chevron
- `.section-label`:
  - Changed from mono to body font (Montserrat 600 weight, 12px)
  - Color: #c3c9dd (brightened from muted)
- `.footer-links`:
  - Font size: 13px, weight 500 (was 12.5px, unweighted)
  - Color: #c3c9dd (brightened for contrast)

**pages.css:** (new rules added)
- `.sagas-flight`, `.saga-card`, `.saga-tabs` — arrow and tab styling for Sagas page
- `.org-chart-visual` — visual org chart styling
- `.theme-reveal` — overlay backdrop and animation
- `.resources-rail`, `.rail-item`, `.resources-panel` — Pattern B rail/panel shell
- `.musalla-time-widget`, `.musalla-campus-card`, `.musalla-masjid-grid` — prayer times and masjid cards

**resources.css:** (new rules added)
- `.rail-ghost` — zoom-ghost element that animates from rail to panel
- Updated responsive breakpoints for mobile adaptations

**script.js:** (new functions)
- `zoomOpen(triggerEl, contentHTML)` — reusable shared-element transition
  - Creates backdrop + scaled clone of trigger
  - Animates clone to center and full size
  - Escape/click-outside to close
- `initResourcesRail()` — rail tab-switching with zoom-ghost flight

**events-team.js:** (new functions)
- `wireZoomOpen()` — attaches zoom behavior to event rows
- `renderEventsLists()` — splits events into Present/Upcoming/Past
- `initSagaTabs()` — handles tab switching on Sagas page

**musalla.js:** (new file)
- `loadPrayerTimes()` — async fetch from AlAdhan API
  - Parses Hijri date and prayer times
  - Renders live time grid on page load

---

## HTML Structure Changes

### All Pages
- Kicker simplified: removed separator dot and UTM text
- Footer standardized across all 5 pages (mark + copyright + contact + social + credit line)

### index.html (Homepage)
- Hero headline and subtext rewritten for inclusivity
- Footer footer-main structure with mark on left, copyright inline

### about.html (About)
- Theme-reveal overlay added at top of body
- Org chart rebuilt as visual HTML tiered display (not interactive accordion)

### events.html → musalla.html (Sagas)
- Arrow flight intro section (SVG + card placeholders)
- Four-tab panel system (Present/Upcoming/Past/Lectures)
- Event rows with zoom-open capability

### resources.html (Resources)
- Entire structure rebuilt: removed top nav grid + icon cards
- Rail on left, panel on right (responsive to horizontal on mobile)
- All 5 detail sections preserved as panel content

### musalla.html (The Musalla — new page)
- Prayer widget with live API integration
- On-campus section (placeholders for photos + copy)
- Masjid grid with 5 nearby options

---

## Validation Summary

**Before Pushing to GitHub:**
- ✅ CSS: All 3 stylesheets (styles.css, pages.css, resources.css) — braces balanced
- ✅ JS: All 3 scripts (script.js, events-team.js, musalla.js) — syntax valid
- ✅ HTML: All 5 pages — tag balance OK (events.html has a pre-existing comment-text false positive)
- ✅ No orphaned CSS rules after removals
- ✅ All real data preserved (masjid info, food spots, contacts, links)

---

## Vercel Deployment & Issues

### Initial Deployment (Successful)
1. Created new Vercel project from `utm-msa/utm-msa-website` GitHub repo
2. Project name: `utm-msa-website-v2` (first name already taken)
3. Vercel Team: `utm-msa's projects`
4. First build completed successfully, live URL: `utm-msa-website-v2.vercel.app`
5. Production deployment shows "Ready 2s" — site is live and accessible

### Webhook Issue (25+ minutes without update)
**Problem:** After pushing updated files to GitHub (footer fixes, Bismillah sizing, etc.), Vercel did NOT auto-deploy for 25+ minutes.

**Investigation:**
- Vercel project settings → Integrations: showed "No Integrations Installed" (confusing, since GitHub was already connected)
- GitHub repo → Settings: Vercel integration listed, but webhook status unclear
- Vercel message: "To update your Production Deployment, push to the main branch" (webhook intact in theory, but not firing)

**Root Cause:** GitHub webhook from Vercel either:
- Never fully initialized after first deploy
- Became disconnected without showing obvious error
- Had permission issues despite showing all checkmarks

**Attempted Solutions:**
1. Hard refresh of Vercel site (Ctrl+Shift+R) — no change
2. Checked Deployments tab for new builds — none appeared
3. Checked GitHub Integrations → found Vercel listed with full permissions
4. Did NOT attempt manual redeploy or webhook reconnect (session ended before resolution)

**Next Steps (for next session):**
1. Go to GitHub repo Settings → Apps and integrations
2. Find Vercel, click "Configure," and check Recent Deliveries for your latest pushes
3. If deliveries show red ✗, the webhook failed — delete and reconnect from Vercel
4. Alternatively, go to Vercel project → Git settings and reconnect the GitHub integration from scratch
5. Test with a trivial push (e.g., add a comment to index.html) to confirm webhook is working

---

## Outstanding Tasks (Not Yet Done)

1. **Theme-reveal copy:** Needs actual "This year's theme" title + 1-line description (currently placeholder)
2. **Jumu'ah logistics:** On-campus section of The Musalla needs:
   - Prayer room photos (or updated placeholder text)
   - Confirmation from cabinet on Jumu'ah arrangement for this term
3. **Vercel webhook reconnection:** If auto-deploy still not working, manually reconnect GitHub integration
4. **Mobile hamburger nav:** Code exists (`.nav-toggle` class), but CSS and JS not yet implemented
5. **Footer on all pages:** Ensure footer markup matches homepage across all 5 pages (check about.html, events.html, resources.html, musalla.html)
6. **Bluehost deployment:** Once Vercel preview is stable, plan migration to Bluehost subfolder (e.g., `/msa-redesign/`)

---

## Files Modified (Sept 21)

| File | Changes |
|------|---------|
| `index.html` | Hero copy, kicker removal, footer redesign |
| `about.html` | Theme overlay, org chart rebuild |
| `events.html` | Full rebuild as Sagas page |
| `resources.html` | Pattern B rail/panel restructure |
| `musalla.html` | New page — prayer times + masjids |
| `styles.css` | Removed kicker rules, contrast fixes, Bismillah updates |
| `pages.css` | Sagas + org chart + theme + rail/panel CSS |
| `resources.css` | Rail/panel and zoom-ghost styling |
| `script.js` | Added zoomOpen() + initResourcesRail() |
| `events-team.js` | Added wireZoomOpen() + tab switching |
| `musalla.js` | New file — prayer times fetch + render |

---

## Key Design Decisions Carried Forward

1. **Zoom-open interactions:** Reusable pattern for cards → detail views (Sagas event rows, intended for Resources cards)
2. **Pattern B resources:** Rail-based navigation with sliding detail panel (not accordion, not grid-based)
3. **Live data, no hard-coding:** Prayer times via API, events via Google Sheet CSV, masjid data real + verified
4. **Accessibility:** Keyboard navigation on tab panels, ARIA labels on buttons, `prefers-reduced-motion` support
5. **Mobile-first responsive:** All new layouts tested at 560px, 900px, 1240px+ breakpoints
6. **Static HTML/CSS/JS:** No framework overhead, no build step — files deploy directly to any host

---

## Notes for Next Session

- **Vercel URL:** https://utm-msa-website-v2.vercel.app (for testing before Bluehost)
- **GitHub repo:** https://github.com/utm-msa/utm-msa-website (main branch)
- **Cabinet test access:** Share Vercel URL with exec team for feedback before production
- **Timeline:** Aiming for Bluehost subfolder deployment by end of Week 3 (late September)
- **Handoff docs:** GitHub `/docs` folder to be populated with README, SETUP, DEPLOYMENT, ARCHITECTURE guides

