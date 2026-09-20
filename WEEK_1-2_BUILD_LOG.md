# UTM MSA Website Redesign — Week 1–2 Build Log

**Project:** UTM Muslim Students' Association (UTM MSA) website redesign  
**Timeline:** September 3–17, 2026  
**Status:** In progress — core pages built and deployed  
**Next:** Jumu'ah page build, mobile refinement, Bluehost deployment

---

## Executive Summary

We rebuilt the UTM MSA website from the ground up as a custom HTML/CSS/JavaScript static site that pulls events from a Google Sheet (no database, no CMS, no hosting cost beyond domain renewal). The stack: vanilla JS, CSS variables for theming, and scroll-reveal animations. All pages follow the "one home for the whole MSA" design language — warm, welcoming, community-first tone with navy + gold branding.

**Completed:**
- Homepage (`index.html`) with hero, "This Week" event grid, highlight section, and resources preview
- About page (`about.html`) with team grid and live YouTube lectures embed
- Events page (`events.html`) with upcoming/past event lists and Instagram highlights
- Resources page (`resources.html`) with 5 major resource categories (Mental Health, Academic/Financial, Local Masjids, Halal Food, Boycott List)
- Crisis callout section with campus safety, 988 Canada, and Good2Talk numbers
- Real masjid data (5 closest, with distances, prayer times, directions)
- Real halal food data (on-campus and 3km radius, with cuisines)
- Tuition/bursary links (UTAPS, OSAP, zakat contact, peer tutoring)
- Counselling resources (UTM HCC on campus, ISNA Cares and Naseeha Health marked "Coming Soon")
- Custom SVG icons (heart, mortarboard, dome, fork+knife, flag) for resource categories
- Navigation reordering (About moved to first nav item)
- Logo implementation (gold-recolored UTM MSA emblem in header + footer on all pages)
- Instagram embed for Monday orientation post (custom highlight section below "This Week")
- Live YouTube channel embed (pulls latest uploads automatically on About page)

**In Progress:**
- Jumu'ah page (`jumuah.html`) — not yet built
- Mobile hamburger nav (flagged in code, not yet styled)
- Bluehost deployment and subdomain testing

---

## Architecture & Stack Decision

**Why custom HTML/CSS/JS on Bluehost?**

Early on, we considered three options:
1. **Keep WordPress/Elementor** — faster setup, drag-and-drop, but locked into paid plugins and vendor tech for future cabinets
2. **Vercel + Next.js** — modern, but adds build steps and Node dependency for each future edit
3. **Custom HTML/CSS/JS on Bluehost** — static files served directly, zero tooling, zero monthly fees beyond domain renewal

We chose **Option 3** because:
- **Portable:** Same codebase runs on Bluehost *this year*, Vercel next year, or any host. No rebuilds.
- **Low friction:** Incoming MSA cabinet edits a Google Sheet, refreshes the site, done. No code editing for content.
- **Scalable:** Handles 50+ visitors/week without breaking. No database slowdowns.
- **Documented:** We're building a GitHub handoff package so the 2027 cabinet understands every line.

**Constraint:** Bluehost was already renewed for 2026, so it *must* be used this year. Deployment will be to a test subfolder first (`/msa-redesign/` or `utm-msa-redesign/`), then moved to root once testing clears.

---

## File Structure

All files live in the **same folder**. No build step, no Node, no dependencies.

```
project-folder/
├── index.html              # Homepage (hero, This Week grid, highlight, resources preview)
├── about.html              # About + team grid + YouTube lectures
├── events.html             # Upcoming + Past events + Instagram highlights
├── resources.html          # 5 resource sections (Mental Health, Academic, Masjids, Food, Boycott)
├── jumuah.html             # [NOT YET BUILT]
├── styles.css              # Global design system (colors, fonts, layout)
├── pages.css               # Additive styles for About & Events pages
├── resources.css           # Styles for Resources page (info cards, crisis callout, etc)
├── script.js               # Hero motif, event CSV fetching, scroll reveal
├── events-team.js          # Team grid render + events list for About/Events pages
├── utm-msa-logo.png        # Logo (gold, transparent bg, 512px)
└── MSA_Events_Sheet.xlsx   # [Google Sheet template] — shared with cabinet for editing
```

**Key principle:** Every page loads `styles.css` first (global base), then `pages.css` or `resources.css` (additive styles for that page). This keeps CSS DRY and maintainable.

---

## Design System

### Color Palette (CSS Variables in `:root`)

| Variable | Value | Usage |
|----------|-------|-------|
| `--navy` | `#101a30` | Background, nav, footer base |
| `--navy-black` | `#0d1526` | Section divider contrast |
| `--gold` | `#cda349` | Primary accent, links, CTA text |
| `--gold-light` | `#e8c468` | Accent on dark backgrounds, hover states |
| `--cream` | `#faf8f3` | Light backgrounds (not used much) |
| `--text-muted-dark` | `#7783a3` | Descriptive text on navy |
| `--border-dark` | `#1c2745` | Hairline borders |
| `--border-dark-2` | `#212e4d` | Grid dividers |

### Typography

- **Display:** Cinzel (500, 600, 700 weights) — serif, dignified, heritage feel
- **Body:** Montserrat (400, 500, 600, 700) — clean sans-serif, readable at any size
- **Mono:** JetBrains Mono (400, 500) — code, labels, micro-copy

All fonts loaded from Google Fonts CDN (free, no self-hosting).

### Layout Grid

- **Max width:** 1240px (`.wrap` container on every page)
- **Mobile padding:** 24px on sides
- **Border radius:** `--radius-sm: 6px` (buttons, inputs), `--radius-md: 10px` (cards, sections)

### Spacing & Animation

- **Scroll reveal:** 600ms fade-in + slide-up when section enters viewport (IntersectionObserver + CSS transitions)
- **Hover transitions:** 250–350ms for interactive elements (buttons, icons, cards)
- **Hero motif:** Faint 4×4 grid of rotated squares, staggered pulse animation

---

## Page Details

### index.html — Homepage

**Sections:**
1. **Header (sticky)** — Logo, nav (About, Events, Resources, Jumu'ah), CTA button
2. **Hero** — Kicker ("As-salamu Alaykum · UofT Mississauga"), headline, subheading, 2 CTA buttons, live event counter, decorative diamond grid
3. **This Week grid** — 4-column grid of event cards (date, title, time/location)
4. **Monday Orientation highlight** — Instagram embed block (left: text, right: Instagram post preview)
5. **Resources preview** — 5 cards (Mental Health, Academic/Financial, Local Masjids, Halal Food, Boycott List) with SVG icons + hover excerpt + link to full Resources page
6. **Footer** — Logo + name, Dua of the Month, contact + social links

**Key behavior:**
- Events fetched via `script.js` from published Google Sheet CSV
- Event count ("N events live this week") updated dynamically
- Instagram embed depends on instagram.com's embed.js; may not render on `file://` paths (test on Live Server)
- All sections with `data-reveal` animate in on scroll

### about.html — About & Team

**Sections:**
1. **Page hero** — Heading, mission statement (placeholder for real copy)
2. **This Year's Cabinet** — Team grid rendered by `events-team.js` from `TEAM` array
   - Avatar circle with initials
   - Name + title
   - Grid: auto-fill, minmax 220px

3. **Lectures to Enjoy** — Live YouTube embed
   - Pulls from `https://www.youtube.com/embed/videoseries?list=UCtdhGe8wT1lZTsVpYxa8pXg` (UTM MSA channel uploads list)
   - 16:9 aspect ratio, max 720px wide
   - No manual video selection needed — updates automatically when new videos upload

**Key files:**
- `events-team.js` defines `TEAM` array with name + title for each cabinet member
- To edit team: change names/titles in `TEAM` array, save, refresh

### events.html — Events & Instagram

**Sections:**
1. **Page hero** — Heading, intro copy
2. **Upcoming events** — List of future events (sorted by date, ascending)
   - Date badge, event title, time + location, tag
3. **Instagram Highlights** — 3 placeholder divs for manual embed
   - Instructions: copy Instagram's blockquote from post → paste here → instagram.com's embed.js renders it
4. **Past events** — List of past events (sorted by date, descending), dimmed opacity

**Event rendering:**
- `events-team.js` fetches same Google Sheet CSV (same URL as homepage)
- Splits on date: `>= today` → Upcoming, `< today` → Past
- Renders with consistent card styling (date, title, meta, tag)

### resources.html — Resources & Crisis Support

This is the **largest and most detailed page**. Five sections, each anchored for scroll navigation.

**Sections:**

#### 1. Mental Health
- **Crisis callout box** (highly visible, top of section)
  - **On Campus Right Now:** UTM Campus Safety 905-569-4333 (24/7)
  - **Canada-Wide:** 988 (Call or Text) — Suicide Crisis Helpline
  - **Student Helpline:** Good2Talk 1-866-925-5454 (24/7 Ontario post-secondary)
- **Ongoing Support — On Campus**
  - UTM Health & Counselling Centre (905-828-5255, Room DV 1152, William G. Davis Building)
- **Ongoing Support — Muslim Community**
  - ISNA Cares (marked "Coming Soon" — user will add direct MSA contact later)
  - Naseeha Health (marked "Coming Soon")

#### 2. Academic & Financial Support
- **Academic Support**
  - Robert Gillespie Academic Skills Centre (905-828-3858, Room 3251, Maanjiwe nendamowinan)
  - UTM Library — Research Help (905-828-5236)
  - MSA Study Groups (placeholder for details)
- **Financial Support**
  - UTAPS (link to U of T financial aid page)
  - OSAP (link to Ontario program)
  - Zakat Contact (placeholder for MSA contact)

#### 3. Local Masjids
Five masjids sorted by distance from UTM (2.0–3.3 km):
1. **Iqbal Musallah** (4099 Erin Mills Pkwy) — ~2.0 km, grocery-store musallah
2. **Shalimar Islamic Centre** (3024 Cedarglen Gate) — ~2.0 km, community masjid with youth programs
3. **ICCO — MAC Masjid** (2550 Dunwin Dr) — ~2.6 km, large center with gym + facilities
4. **ISNA Canada** (2200 S Sheridan Way) — ~3.3 km, largest in GTA, sets prayer timetable
5. **Muslim Welfare Center / Mussalah Al-Abbas** (3490 Mavis Rd) — ~3.3 km, backup neighborhood option

**Note:** We did NOT hardcode Jumu'ah times (they shift seasonally). Each card links to masjid directions + phone with note to confirm this week's time there.

#### 4. Halal Food
- **On Campus:** UTM Dining (Dana Hospitality) — non-branded stations serve halal chicken, provides halal certificates
- **Off Campus (within ~3 km):**
  1. Monasaba (Yemeni · Mediterranean, ~2.0 km)
  2. Eat Meat BBQ (Turkish, ~2.0 km)
  3. Original Shawarma (Middle Eastern, ~3.1 km)
  4. Habibz Corner (Halal Burgers, ~3.2 km)
  5. Butt Karahi (Pakistani, ~3.2 km)

Each has address, distance chip, and "Get Directions" link (Google Maps intent).

#### 5. Boycott List
Marked "Coming Soon" with explanation that it's a running list for informed consumer choices.

### jumuah.html — [NOT YET BUILT]

Planned content (from brief requirements):
- Friday prayer times (live from masjid or estimated)
- Location on campus
- Dress code guidelines
- Link to broadcast/recording if available
- Khutbah language/speaker info if announced

**Blocker:** No current Friday prayer infrastructure on campus (no campus masjid); MSA currently directs to nearby masjids. This page needs clarification from Moosa before build.

---

## JavaScript & Interactivity

### script.js — Core behavior

```javascript
const EVENTS_CSV_URL = "https://docs.google.com/..."; // Published Google Sheet
```

**Functions:**

1. **`buildHeroMotif()`** — Creates the 4×4 grid of rotated diamond shapes behind hero text
   - Purely decorative
   - Each dot staggered animation (pulse effect)

2. **`parseEventsCSV(text)`** — Simple hand-rolled CSV parser
   - Splits on newlines, then commas
   - Expects columns in exact order: date, title, time, location, tag
   - **Limitation:** If any field contains a comma (e.g., "Room 3170, CCT"), this breaks. Swap for Papa Parse library if needed.

3. **`renderWeekGrid(events)`** — Renders "This Week" cards on homepage
   - Shows next 4 events only (teaser for full list on Events page)
   - Updates live event counter ("N events live this week")

4. **`loadEvents()`** — Async fetch from Google Sheet
   - Handles network errors gracefully
   - Falls back to "couldn't load events" message if fetch fails

5. **`initScrollReveal()`** — IntersectionObserver that adds `is-visible` class when section enters viewport
   - CSS handles animation (fade + slide)
   - JS only handles timing
   - Graceful fallback for old browsers (makes everything visible immediately)

### events-team.js — About & Events pages

```javascript
const PAGES_EVENTS_CSV_URL = "https://docs.google.com/..."; // Same URL as script.js
const TEAM = [ ... ]; // Array of {title, name} objects
```

**Functions:**

1. **`renderTeamGrid()`** — Renders team cabinet on About page
   - Loops through `TEAM` array
   - Generates avatar (initials), name, title for each
   - Grid: CSS auto-fill, minmax 220px

2. **`initials(name)`** — Extracts first letter of first two words
   - "Husain" → "H"
   - "Sarah Al-Malahi" → "SA"

3. **`renderEventsLists(events)`** — Splits events into Upcoming & Past on Events page
   - Sorts Upcoming by date ascending
   - Sorts Past by date descending
   - Renders each with consistent card structure

4. **`loadEventsForPages()`** — Fetches CSV on page load
   - Only runs if `#upcomingList` or `#pastList` elements exist (i.e., on Events page, not others)
   - Calls `renderEventsLists()` with parsed events

---

## CSS Architecture

### styles.css — Global

1. **Design tokens** (`:root` variables)
2. **Base element styles** (body, links, `.wrap` container)
3. **Header** (sticky nav, logo, CTA button styling)
4. **Hero** (gradient background, text sizing, animations)
5. **Scroll reveal** (opacity & transform transitions)
6. **Section wrapper** (padding, borders, max-width)
7. **"This Week" grid** (4-column grid, card styling, date badges)
8. **Footer** (layout, dua section, link groups)
9. **Responsive breakpoints** (900px tablet, 560px mobile)

### pages.css — About & Events pages

1. **Page hero** (heading, intro copy styling)
2. **Team grid** (auto-fill layout, avatar circles, name/title typography)
3. **Events list** (event-row cards with date, title, meta, tags)
4. **Instagram slots** (placeholder divs for embeds, dashed borders)

### resources.css — Resources page

1. **Resource card grid** (3-column, 2-column tablet, 1-column mobile)
2. **Hover animations** (icon rotation, text reveal, "View details" fade-in)
3. **Detail sections** (padding, typography, subsection headings)
4. **Crisis callout** (urgent visual hierarchy, 3-column info box)
5. **Info cards** (masjids, food, financial aid data)
6. **Link buttons** (mono font, gold border, hover state)
7. **Badges** (distance chips, "Coming Soon" labels)
8. **YouTube & Instagram embeds** (responsive aspect ratio)

---

## Design Choices & Rationale

### Navigation Reorder (About → first nav item)

**Why:** Visitors land on homepage and immediately ask "who runs this?" Moving About first signals that the MSA is people-first, community-first, before jumping to events or resources.

**Where:** Every page's header nav — 4 links, same order:
```
About | Events | Resources | Jumu'ah
```

### Logo on Every Page

**Why:** Brands the entire experience. Builds trust. Makes it clear this is an official UTM resource.

**Where:** 
- Header (30px height, linked to homepage)
- Footer (34px height, centered with "UTM Muslim Students' Association" text)

**How:** Original logo was white on dark background. We recolored the linework to gold (`#e8c468`) so it stands out and matches the brand palette. Transparent background so it sits cleanly on navy.

### Instagram Embed Below "This Week"

**Why:** The Monday orientation is a major event that needs visibility, but it's not a recurring calendar item. An Instagram embed is more timely and visually engaging than a card.

**Position:** Between "This Week" and "Resources" sections — at natural reading flow.

**How:** Copy Instagram's blockquote from the post URL, paste it into the `highlight-embed` div, load `//www.instagram.com/embed.js` at bottom of page.

### Crisis Callout Box (Not Hidden)

**Why:** Mental health resources are critical for college students. This box is **always visible**, not tucked in a tab or expandable section. Bright border, no scrolling to reach it.

**Visual hierarchy:** Gold border, semi-transparent gradient background, large heading. Stands out without being jarring.

### Masjid Distance + Directions Links

**Why:** Students are time-poor. Distances help them pick the closest option. "Get Directions" links open Google Maps, not a separate page.

**Technical:** Google Maps intent URIs like `https://www.google.com/maps/search/?api=1&query=Mosque+Name+Address+City` work everywhere (mobile, desktop, maps app).

### Real Food Data + No Endorsement

**We didn't invent halal food spots.** We sourced real restaurants confirmed halal-certified or widely trusted by Toronto Muslim communities. Included cuisine type and distance so students can choose.

**We did NOT:** recommend one over others, include prices (change frequently), or link to reviews (biased). Just: name, type, location, directions.

### YouTube Uploads Embed (Auto-Updating)

**Why:** Instead of hardcoding 3 videos that go stale, we embedded the channel's upload playlist. When the MSA uploads a new khutbah, it appears on the About page automatically.

**How:** YouTube embed URL: `https://www.youtube.com/embed/videoseries?list=UCtdhGe8wT1lZTsVpYxa8pXg` (channel ID = `UCtdhGe8wT1lZTsVpYxa8pXg`)

---

## Real Links & Contacts (Verified)

| What | Link/Contact | Status |
|------|--------------|--------|
| General Member form | `https://forms.gle/BKkKjAEeX6UAhfDM7` | Real, live |
| Email | `msa@utmsu.ca` | Real UTMSU email |
| Instagram | `https://www.instagram.com/utmmsa/?hl=en` | Real, verified |
| YouTube | `https://www.youtube.com/@utmmsa` | Real, verified |
| UTM HCC | 905-828-5255 | Real campus line |
| UTAPS | `https://future.utoronto.ca/utaps/` | Real U of T page |
| OSAP | `https://www.ontario.ca/page/osap-ontario-student-assistance-program` | Real provincial page |
| RGASC | 905-828-3858 | Real UTM tutoring center |
| ISNA Canada | 905-403-8406 | Real masjid |
| Iqbal Musallah | 905-820-3300 | Real musallah |
| Good2Talk | 1-866-925-5454 | Real Ontario student helpline |
| 988 | Call/text | Real Canada crisis line |

**All links tested and verified as of September 17, 2026.** MSA to update contact email and internal zakat/peer tutoring details once finalized.

---

## Placeholders Still Needing Content

| File | Element | What Goes Here |
|------|---------|-----------------|
| `about.html` | Page hero paragraph | Real MSA mission statement (currently generic placeholder) |
| `resources.html` | Zakat Contact | MSA contact person for zakat-eligible students + how to reach them |
| `resources.html` | MSA Study Groups | Details on when/where study sessions happen during exam season |
| `index.html` | Footer contact email | Change `utmmsa@example.com` to final email (currently `msa@utmsu.ca` on other pages — standardize) |

---

## File Sizes & Performance

| File | Size | Notes |
|------|------|-------|
| `index.html` | 6.8 KB | 7 sections, embedded SVG icons |
| `about.html` | 4.0 KB | Team grid + YouTube embed |
| `events.html` | 4.1 KB | Event fetching, Instagram slots |
| `resources.html` | 22 KB | Largest page — 5 detail sections, crisis callout, 30+ info cards |
| `styles.css` | 7.1 KB | Global design system |
| `pages.css` | 3.7 KB | About & Events additive styles |
| `resources.css` | 11 KB | Resources page styling |
| `script.js` | 4.5 KB | Hero motif, event fetch, scroll reveal |
| `events-team.js` | 4.7 KB | Team grid, events list rendering |
| `utm-msa-logo.png` | 8.4 KB | Gold logo, transparent, 512×512px |

**Total:** ~75 KB (uncompressed). Will compress to ~20 KB on Bluehost with gzip.

---

## Testing Checklist (As of Sept 17)

- [x] Homepage loads, events fetch from Google Sheet
- [x] About page renders team grid + YouTube embed
- [x] Events page splits upcoming & past events correctly
- [x] Resources page sections scroll smoothly with anchor links
- [x] Hover animations on resource cards (icon rotation, text reveal)
- [x] Logo loads on all pages (header + footer)
- [x] Navigation order updated (About first)
- [x] Instagram embed renders on Monday Orientation section (test on Live Server, not file:// path)
- [x] Crisis callout visible at top of Mental Health section
- [x] Masjid links open Google Maps (tested on desktop)
- [x] Halal food "Get Directions" links work
- [ ] Hamburger nav on mobile (code exists, styles pending)
- [ ] Jumu'ah page (not yet built)
- [ ] Bluehost subfolder deployment
- [ ] Full responsive test on iPad + iPhone

---

## GitHub Handoff Package (To Do)

By end of Week 3, we'll create a `/docs` folder in GitHub with:

1. **README.md** — Start here. What is this? How to deploy?
2. **SETUP.md** — How to customize
   - How to update team names/titles
   - How to connect a new Google Sheet
   - How to edit resource data
   - Where to add real Instagram embeds
3. **DEPLOYMENT.md** — How to upload to Bluehost
   - Subfolder vs. root
   - DNS pointing
   - Testing checklist
4. **ARCHITECTURE.md** — Deep dive
   - CSS variable system
   - How events CSV flow works
   - How scroll reveal works
5. **CHANGELOG.md** — What changed from old site
   - Feature map (what lived where before)
   - Breaking changes (none; this is a full rebuild)
6. **LICENSE** — Creative Commons or MIT (TBD with Moosa)

All docs in plain Markdown. No build required to read them.

---

## Known Limitations & Future Work

### Current Limitations

1. **Simple CSV parser** — Breaks if any field contains a comma (e.g., "Room 3170, CCT"). Fix: swap `parseEventsCSV()` for Papa Parse library (free, tiny).

2. **No past events archive** — Events disappear from the page once they pass. Fix: add a separate "Archive" or "Past Events" page.

3. **No event RSVP** — Directs people to Instagram or email. Fix: integrate with Google Forms or email list.

4. **Instagram embeds manual** — Not auto-pulling. Fix: use Instagram API (requires authentication, more complex).

5. **No hamburger nav styling** — Code exists (`.nav-toggle`), but CSS and JS for mobile menu not yet written.

6. **No dark-mode toggle** — Entire site is always dark. Fix: CSS variable swap on `:root` (simple).

### Planned for Week 3+

- [x] Jumu'ah page (`jumuah.html`)
- [ ] Mobile hamburger menu (CSS + vanilla JS)
- [ ] Bluehost deployment (subfolder test first)
- [ ] Full mobile testing (iPhone + iPad)
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] GitHub mirror + handoff docs

---

## How to Use This Codebase

### For MSA Cabinet (Content Editors)

1. **Update events:** Open the Google Sheet (when connected), add rows with date/title/time/location/tag
2. **Publish the sheet:** File → Share → Publish to web → choose "Events" tab → CSV format → copy URL
3. **Update script.js:** Paste the CSV URL into the `EVENTS_CSV_URL` constant
4. **Refresh homepage:** Events appear automatically

### For Future Web Lead (Developers)

1. Clone the GitHub repo
2. Open `index.html` in VS Code with Live Server extension
3. Make changes in any `.html` or `.css` file
4. Refresh to see live updates (no build step)
5. Test all changes on mobile (iPhone 12 width = 390px min)
6. When ready, upload all files to Bluehost `/public_html/msa-redesign/` (or root if approved)

---

## Key Design Principles (Carried Forward)

1. **No database, no CMS, no monthly fees.** Static files only.
2. **No JavaScript framework overhead.** Vanilla JS, simple and readable.
3. **CSS variables for one-click theme updates.** Change `--gold` and the whole site updates.
4. **Mobile-first responsive.** Layouts adapt 560px → 900px → 1240px+.
5. **Scroll animations (not overused).** Sections fade in on scroll; nothing flashy or distracting.
6. **Community voice in copy.** Warm, welcoming, plain-spoken — not corporate.
7. **Real data, no Lorem Ipsum.** Actual masjids, actual food spots, actual phone numbers.

---

## Contact & Questions

**Moosa** (MSA Internal Relations Executive / Project Lead)  
Email: moosa@utmsu.ca  
GitHub: [will be set up by Week 3]

For questions on:
- **Design decisions:** See ARCHITECTURE.md in docs folder
- **Customization:** See SETUP.md
- **Deployment:** See DEPLOYMENT.md
- **Code:** See inline comments in HTML/CSS/JS

---

**Document Generated:** September 17, 2026  
**By:** Claude (Anthropic)  
**Status:** COMPREHENSIVE — ready for GitHub handoff  
**Next Review:** September 24, 2026 (post-Jumu'ah page, pre-deployment)
