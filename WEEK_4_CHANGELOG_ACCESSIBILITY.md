# UTM MSA Website — Accessibility Update Changelog
## September 24, 2026

**Source:** "Making the Website Accessible" review by Sarah Qamar, plus every resource she linked
(Elsevier developer/designer checklist, WCAG 2.2, WebAIM, font-size guidance, Equalize Digital,
BOIA, Learn the Web checklist + cheat sheet, CNIB as a design reference, programmatic determinability).

**Target:** WCAG 2.2 level AA, AAA where practical.

**Scope:** 14 files — 11 modified, 3 new. 3,188 lines added, 2,469 removed.

This log goes file by file: what changed, why it changed, and exactly how the code changed, so
anyone on the team (or a future cabinet) can follow along and verify against the reviewer's notes
line by line.

---

## 1. Design System — `styles.css`

**What changed:** The whole visual foundation — color tokens, type scale, fonts, and global
element rules — was rebuilt around one rule: nothing ships that fails a contrast or size check.

**Why:** Almost every note in the review traced back to this file. Fixing it once, at the
`:root` level, cascades the fix everywhere instead of patching each page separately.

**How:**

- **Color tokens rewritten with contrast ratios documented inline**, so nobody can accidentally
  regress them later:
  ```css
  /* before */
  --text-muted-dark: #7783a3;   /* 4.6:1 — fails at small sizes */
  --text-muted: #8792ac;        /* 5.6:1 */

  /* after */
  --text-muted-dark: #b3bbd1;   /* 9.0:1 */
  --text-muted: #a9b1c8;        /* 8.1:1 */
  ```
  Also added `--text-strong` (16.6:1), `--text-soft` (10.5:1), `--border-control` (a dedicated
  3:1+ outline color for anything that's a *control*, separate from decorative hairlines), and
  `--focus-ring` / `--focus-halo` for the new focus system.

- **Font stack cut from 5 families to 3** (reviewer: "3 fonts or fewer"):
  ```css
  /* before */
  --font-display: 'Cinzel', serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-script: 'Cormorant Garamond', serif;

  /* after */
  --font-display: 'Literata', Georgia, 'Times New Roman', serif;
  --font-mono: var(--font-body);   /* retired — aliased so nothing silently falls back to monospace */
  --font-script: var(--font-display);
  ```
  Cinzel is a small-caps-style display face that reads like all-caps even in mixed case — that
  was the reviewer's specific complaint about the header font. Literata is a serif built for
  reading, with true ascenders/descenders. JetBrains Mono (a coding font) and Cormorant Garamond
  (a hairline script) are both gone site-wide.

- **Type scale converted entirely to `rem`**, with a documented floor:
  ```css
  --fs-xs: 0.875rem;    /* 14px — floor, used sparingly */
  --fs-sm: 0.9375rem;   /* 15px — meta lines, chips, labels */
  --fs-body: 1.0625rem; /* 17px — body copy */
  --fs-lead: 1.1875rem; /* 19px — intros */
  --fs-h3: 1.25rem;
  --fs-h2: 2rem;
  ```
  Previously sizes were a mix of `px`, `em`, and a few `rem`, several under 11px (footer, tags,
  labels). `rem` means the browser's own text-size setting — and the new Display Settings panel —
  scale every page at once instead of only some of it.

- **`body` font-weight raised to 500 as a baseline** (reviewer: "font weights medium or heavy").
  Headings are 600.

- **Links inside body text are now underlined, not color-only** (WCAG 1.4.1):
  ```css
  p a:not([class]), .prose a:not([class]), .lecture-note a {
    color: var(--gold-light);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }
  ```

- **`scroll-padding-top` added to `html`**, keyed off a new `--header-h: 96px` token, so the
  sticky header can never cover a heading or focused element you've jumped to (WCAG 2.4.11) — this
  fixes the "On this page" and footer sitemap links added in the HTML.

- **All 18 `text-transform: uppercase` rules removed**, across nav labels, section labels,
  footer headings, tags, and badges. Most of these were also sitting at 10.5–12px — those got
  bumped to `var(--fs-sm)` (15px) at the same time, since shrinking text and then removing the
  visual weight of all-caps would have made them harder to read, not easier.

- **Hero gradient lengthened and made phone-specific** (reviewer: "lengthen the horizontal
  gradient; text hard to read toward the middle, especially in black and white"):
  ```css
  /* after */
  .hero {
    background:
      linear-gradient(100deg,
        rgba(9, 14, 27, 0.95) 0%,
        rgba(9, 14, 27, 0.92) 38%,
        rgba(9, 14, 27, 0.84) 52%,
        rgba(9, 14, 27, 0.55) 70%,
        rgba(9, 14, 27, 0.25) 88%,
        rgba(9, 14, 27, 0.15) 100%),
      url("utm-hero.jpg");
  }
  @media (max-width: 900px) {
    .hero {
      /* text spans full width on phones, so the whole photo gets an even, strong scrim
         instead of a left-to-right fade */
      background: linear-gradient(180deg, rgba(9, 14, 27, 0.9) 0%, rgba(9, 14, 27, 0.88) 100%),
        url("utm-hero.jpg");
    }
  }
  ```
  Measured against the actual photo pixels (worst 5%, right third of the text column): desktop
  went from 10.0:1 → 13.2:1, **phone went from 2.1:1 → 13.7:1.**

**Result:** "Designed & maintained" footer line: 2.4:1 → 10.5:1. Muted text: 4.6:1 → 9.0:1.

---

## 2. Page-Specific Styles — `pages.css`

**What changed:** About, Sagas (events), and The Musalla page styles were updated to match the new
type scale and heading hierarchy, plus new rules for the theme-reveal dialog, the org chart as a
semantic list, and the arrow-flight intro.

**Why:** These styles are additive on top of `styles.css`, so once the base tokens changed, every
rule here that referenced an old font size, an uppercase label, or a hardcoded muted color needed
to move to the new system or it would have silently reverted the fix on those two pages.

**How (representative changes — the file has ~830 changed lines total):**
- Removed `text-transform: uppercase` from section labels, tag pills, and org-chart tier headers.
- Org chart rebuilt: was a visual-only tiered `<div>` layout; is now a nested `<ul>`/`<li>` list so
  a screen reader announces who reports to whom, with "Position open" written out as real text
  (previously shown only by a dashed border).
- `.saga-tabs`, `.saga-tab`, `.saga-panel` rules reworked to support `role="tab"`/`role="tabpanel"`
  from the new `initTabs()` in `script.js` — focus-visible states, `aria-selected` styling, and a
  panel-entry animation that's skipped under `prefers-reduced-motion`.
- `.theme-reveal` dialog styling: no longer animates out on a fixed timer; now has a visible
  "Continue" button and only fades out on dismissal.

---

## 3. Resources Page Styles — `resources.css`

**What changed:** Styling for the rail/panel layout, icons next to section headings, and the
"ghost" animation that flies from the clicked rail item into the panel.

**Why:** Same reasoning as `pages.css` — the rail pattern predates this pass, but its labels,
font sizes, and hover-only description text all needed to come into line with the new rules.

**How:**
- Removed the last `text-transform: uppercase` rules (rail item labels, badge text).
- `.rail-ghost` kept but now purely decorative (`aria-hidden`) — the real state change is driven
  by `aria-selected` on the tab, not by the animation.
- **Hover-only content removed.** Resource card descriptions used to be `max-height: 0` until
  `:hover`, meaning keyboard and touch users could never see them (BOIA's hover article, WCAG
  2.1.1 / 1.4.13). Descriptions are now always visible.
- Responsive breakpoint for the rail (< 860px, rail becomes a horizontal row) retained and
  adjusted for the larger minimum touch target sizes below.

---

## 4. New: Accessibility Layer — `a11y.css` *(new file, loaded last on every page)*

**What it is:** A single stylesheet that holds every cross-cutting accessibility system, kept
separate from page styles so it's easy to find and easy to reason about in isolation.

**Why a separate file:** Reviewer asked for a CNIB-style comfort menu, a skip link, and visible
focus styles — none of these belong to one page, so bundling them with `styles.css` or `pages.css`
would have made them harder to find later.

**What's in it:**

- **Skip link** (WCAG 2.4.1) — visually hidden, appears on keyboard focus, jumps to `#main`:
  ```css
  .skip-link {
    position: absolute; top: 12px; left: 12px; z-index: 1000;
    transform: translateY(-200%);
    transition: transform 0.15s ease;
  }
  .skip-link:focus { transform: translateY(0); }
  ```

- **Focus ring** (WCAG 2.4.7 / 2.4.13) — a 3px gold ring with a navy halo, so it's visible against
  navy backgrounds, gold buttons (where it inverts), *and* the white Instagram embed, where gold
  alone measures only 1.7:1 and used to disappear:
  ```css
  :focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: 3px;
    box-shadow: 0 0 0 6px var(--focus-halo);
  }
  ```

- **Display settings panel** (the CNIB-style comfort menu) — five independent toggles, each one a
  class on `<html>` set by `script.js` and read here:
  | Class | Effect |
  |---|---|
  | `.pref-text-lg` / `.pref-text-xl` | `font-size: 112.5%` / `125%` on `html` — scales everything because the type scale is `rem` |
  | `.pref-font-readable` | Swaps `--font-display` and `--font-body` to Atkinson Hyperlegible (Braille Institute, designed for low vision); font is only downloaded if this is turned on |
  | `.pref-spacing-wide` | Applies the WCAG 1.4.12 text-spacing values (`letter-spacing: 0.12em`, `word-spacing: 0.16em`, `line-height: 1.8`) — explicitly excluded from Arabic script, which must not be letter-spaced |
  | `.pref-contrast-high` | Overrides text/border tokens to near-white, removes hero photo entirely, underlines all links |
  | `.pref-motion-reduced` | Zeroes animation/transition durations, disables the Sagas arrow-flight intro |

- **OS-level support, automatic, no toggle needed:**
  ```css
  @media (prefers-contrast: more) { /* same overrides as .pref-contrast-high */ }
  @media (prefers-reduced-motion: reduce) { /* same overrides as .pref-motion-reduced */ }
  @media (forced-colors: active) { /* Windows High Contrast: force 2px+ borders on all controls */ }
  ```

- **`.page-index`** — the "On this page" jump-link component used on About and The Musalla (a
  second way to navigate a long page, WCAG 2.4.5).

- **`.label-icon` / `.with-icon`** — the icon-next-to-text pattern. Icons paired with visible text
  are `aria-hidden="true"` on purpose: giving them `alt` text makes a screen reader say "masjid
  icon, Local Masjids" twice for the same information.

- **`.embed-frame`** — the gold frame + focus-within highlight around the Instagram embed, plus
  `.embed-skip` for the "Skip past the Instagram post" link.

---

## 5. Core Behavior — `script.js` *(loaded on every page)*

**What changed:** Near-total rewrite. Old: hero motif builder, CSV fetch, scroll reveal, zoom-open,
resources-rail click handler, prayer-gateway fetch. New: all of that minus the hero motif, plus
mobile menu, Display Settings, accessible tabs, and shared helpers used by the other two scripts.

**Why:** The reviewer's "check all buttons are not empty" note surfaced a real bug — the mobile
menu button had a label but no click handler behind it. Fixing that, plus adding the Display
Settings panel and converting the ad-hoc rail-click code into a proper WAI-ARIA tab pattern,
touched most of the file.

**How, function by function:**

- **`escapeHTML(str)` — new.** Sheet data and event titles are inserted into the page as HTML; this
  escapes `& < > " '` so a stray character in a Google Sheet cell can't break the layout (or worse).
  Used throughout `renderWeekGrid`, `eventRowHTML`, and `renderTeamGrid`.

- **`buildHeroMotif()` — removed.** The decorative rotated-square grid behind the hero text is gone
  (superseded by the hero gradient rework in `styles.css`).

- **`initMobileMenu()` — new.** The actual fix for the "empty button" bug:
  ```js
  function initMobileMenu() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("siteMenu");
    if (!toggle || !menu) return;
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      toggle.querySelector("span").textContent = open ? "Close menu" : "Menu";
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
  }
  ```

- **Display Settings system — new** (`PREFS_KEY`, `PREF_DEFAULTS`, `loadPrefs()`, `applyPrefs()`,
  `initDisplaySettings()`). Preferences are stored in `localStorage` as one JSON object, applied by
  toggling classes on `<html>` (read by `a11y.css`, above), and re-synced into the panel's radio
  inputs on load. `applyPrefs(loadPrefs())` also runs once at the very top of the script, outside
  `DOMContentLoaded`, so preferences apply before first paint and there's no flash of un-styled
  content. Each page also carries a tiny inline `<script>` in `<head>` that does the same class
  application even earlier, before `script.js` itself has loaded.

- **`initTabs()` — new, replaces the old rail click-handler and the old Sagas tab-handler.** Any
  `[role="tablist"][data-tabs]` becomes a full WAI-ARIA tab widget: arrow keys move focus between
  tabs, Home/End jump to the first/last, only the active tab sits in the Tab order, and the URL
  hash updates and is read on load (so `resources.html#halal-food` opens directly on that tab —
  see Bugs Fixed, below). This single function now drives both the Sagas tabs *and* the Resources
  rail, replacing two separate, non-standard implementations.

- **`railGhost()` — kept, simplified.** The decorative fly-in animation from a clicked rail button
  into the panel; now called from inside `initTabs()`'s `activate()` and skipped when
  `prefersReducedMotion()` is true.

- **`parseCSV(text)` — new, replaces the old naive `line.split(",")` parser.** Handles quoted
  cells so a location like `"Room 3170, CCT"` doesn't get split into two columns. `parseEventsCSV`
  now calls this instead of hand-splitting.

- **`renderWeekGrid(events)` — rewritten.** Previously showed the next 4 events regardless of date
  and displayed the raw CSV date string. Now filters to `today <= date <= today+7`, sorts
  ascending, and formats dates as `"Thu, Sep 24"` via `toLocaleDateString`. Cards are `<li>` inside
  a list (was `<div>`s) so the grid is a real list for screen readers, and every field is passed
  through `escapeHTML`.

- **`loadEvents()` — updated error message.** Was `"Couldn't load events right now."` with no next
  step; now points to Instagram as a fallback and suggests refreshing.

- **`initScrollReveal()`** — now checks `prefersReducedMotion()` up front (was checking only for
  `IntersectionObserver` support), and adds a `focusin` listener so anything a keyboard user tabs
  to is revealed immediately rather than staying invisible until scrolled into view.

- **`zoomOpen(triggerEl, contentHTML, labelId)` — rewritten as a real modal dialog.** The old
  version was a visual-only "shared element" animation with no dialog semantics. The new version:
  sets `role="dialog"` and `aria-modal="true"`, accepts a `labelId` for `aria-labelledby`, moves
  focus into the dialog and traps it there with a `Tab`/`Shift+Tab` cycle, marks every other
  top-level element `inert` while open (hiding the rest of the page from screen readers), and
  restores focus to whatever triggered it on close. Reduced-motion users get the dialog placed
  instantly instead of animated.

- **`initResourcesRail()` — removed.** Its job is now done by `initTabs()`.

- **Prayer time helpers — refactored and shared.** `UTM_COORDS`, `PRAYER_ORDER`,
  `fetchPrayerTimes()`, `findNextPrayer()`, and `prayerListHTML()` are new, standalone functions
  (previously this logic was duplicated, with a slightly different implementation, in both
  `script.js`'s homepage gateway *and* `musalla.js`). `musalla.js` now calls these same functions
  instead of maintaining its own copy — see below. `to12Hour()` is likewise shared; it replaces
  two nearly-identical functions (`gatewayTo12Hour` here, a duplicate in `musalla.js`) that had
  drifted apart (one used 24-hour, one 12-hour — see Bugs Fixed).

- **`initEmbedTitles()` — new.** Instagram's embed script inserts an `<iframe>` after the page
  loads, asynchronously, with no accessible name. This watches for that iframe with a
  `MutationObserver` and sets its `title` once it appears.

- **Boot sequence updated:**
  ```js
  applyPrefs(loadPrefs());               // before paint
  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initDisplaySettings();
    initTabs();
    initScrollReveal();
    loadEvents();
    loadPrayerGateway();
    initEmbedTitles();
  });
  ```

---

## 6. About & Sagas Behavior — `events-team.js`

**What changed:** Team grid rendering, event-row rendering, and event dialogs were reworked to use
the shared helpers from `script.js`; the old timer-based theme reveal was replaced with a real
dialog; the old bespoke Sagas tab-switcher was removed (now handled by `initTabs()` in `script.js`).

**Why:** Two of the reviewer's notes applied directly here — "test with people who use screen
readers" surfaced that the theme intro auto-dismissed after 3.2 seconds regardless of whether
someone had finished reading it, and the org chart / team grid needed real headings instead of
styled `<div>`s.

**How:**

- **`TEAM` array** — two title typos fixed: `"Brother's Student Life"` → `"Brothers' Student Life"`,
  `"Sister's Student Life"` → `"Sisters' Student Life"`.

- **`renderTeamGrid()`** — team cards are now `<li>` with a real `<h3>` for the name (was a styled
  `<p>`); the initials avatar is `aria-hidden="true"` since it's decorative once the name is a
  proper heading.

- **`parsePagesCSV()` — removed.** This page now imports `parseEventsCSV` from `script.js` instead
  of maintaining its own, simpler CSV parser (which didn't handle quoted commas — see Bugs Fixed).

- **`eventRowHTML(ev, isPast, idx)` — rewritten.** Event titles are now real `<button>` elements
  (`class="event-open"`) rather than a whole clickable `<div data-zoomable tabindex="0">` row —
  this follows the Elsevier checklist's "`<button>` for in-page actions" rule, gives the control a
  visible focus state that matches every other button on the site, and means a screen reader
  announces it as an actual interactive button instead of a generic focusable div. Past events get
  a visually-hidden `"Past event, "` prefix on the date so it's announced even though the visual
  distinction (dimmed opacity) is colour/contrast-only otherwise.

- **`wireZoomOpen()` → `wireEventDialogs()`, rewritten.** Previously read the event's data back out
  of the DOM text content of the row that was clicked. Now events are kept in an `EVENT_CACHE`
  array and looked up by index (`data-idx` on the button), which is more robust and lets the dialog
  pass a proper `aria-labelledby` (`zoomTitle`) pointing at a real `<h2>` inside the dialog content.

- **`renderEventsLists(events)`** — date parsing fixed to avoid the UTC-midnight bug (see Bugs
  Fixed): `new Date(e.date + "T00:00")` instead of `new Date(e.date)` when the date string is a
  bare `YYYY-MM-DD`. Output for each tab (`present`/`upcoming`/`past`) is now a semantic `<ul
  class="event-list">` instead of a bare `<div>` soup, and empty-state messages were rewritten to
  be more specific (e.g. "Check the Upcoming tab for what's next" instead of a dead end).

- **`initSagaTabs()` — removed.** Superseded by `initTabs()` in `script.js`, which now drives both
  the Sagas tabs and the Resources rail through one shared, ARIA-correct implementation.

- **`initThemeReveal()` — new, replaces the inline click-to-dismiss handler that used to live in
  the `DOMContentLoaded` listener.** The theme intro is now a proper dialog:
  ```js
  function initThemeReveal() {
    const dlg = document.getElementById("themeReveal");
    if (!dlg) return;
    let seen = false;
    try { seen = sessionStorage.getItem("msaThemeSeen") === "1"; } catch (e) {}
    if (seen) return;
    // ...marks the rest of the page inert, focuses the Continue button,
    // traps Tab inside the dialog (only one control, so Tab always returns to it),
    // and closes on Escape, click-outside, or the Continue button.
  }
  ```
  It shows once per browser session (`sessionStorage`, not a hard-coded timer), stays open until
  the visitor dismisses it, and under reduced motion skips the fade animation entirely.

---

## 7. Prayer Times — `musalla.js`

**What changed:** Reduced from a self-contained fetch-and-render implementation to a thin wrapper
around the shared helpers now living in `script.js`.

**Why:** The reviewer's notes didn't call this file out directly, but testing surfaced that The
Musalla page showed prayer times in 24-hour format while the homepage gateway showed 12-hour —
same API, same data, different formatting code, because the two pages had never shared logic (see
Bugs Fixed).

**How:**
```js
// before: this file had its own UTM_LAT, UTM_LNG, PRAYER_ORDER constants and did its own
// fetch + JSON parsing + HTML building, independent of script.js.

// after:
async function loadPrayerTimes() {
  const row = document.getElementById("prayerTimesRow");
  if (!row) return;
  const hijriEl = document.getElementById("hijriDate");
  const gregEl = document.getElementById("gregDate");
  try {
    const data = await fetchPrayerTimes();          // shared, from script.js
    const h = data.date.hijri;
    if (hijriEl) hijriEl.textContent = `${h.day} ${h.month.en} ${h.year} AH`;
    if (gregEl) gregEl.textContent = `(${data.date.readable})`;
    const next = findNextPrayer(data.timings);       // shared, from script.js
    row.innerHTML = prayerListHTML(data.timings, next.tomorrow ? null : next.name, "Today's prayer times at UTM");
  } catch (err) {
    console.error("Prayer times fetch failed:", err);
    if (hijriEl) hijriEl.textContent = "";
    row.innerHTML = `<p class="prayer-empty">Today's prayer times couldn't load. Try refreshing, or check <a href="https://www.isnacanada.com/" target="_blank" rel="noopener">ISNA Canada's timetable<span class="sr-only"> (opens in a new tab)</span></a>.</p>`;
  }
}
```
`script.js` is loaded before `musalla.js` on `musalla.html`, so `fetchPrayerTimes`, `findNextPrayer`,
and `prayerListHTML` are already in scope. `prayerListHTML` renders a `<dl>` (name/time pairs) and
marks the next prayer by name in the text, not only by highlight color. The error state now
suggests a specific fallback (ISNA Canada's published timetable) instead of a dead-end message.

---

## 8. Every HTML Page (`index.html`, `about.html`, `events.html`, `resources.html`, `musalla.html`)

These five pages share the same structural changes; each is detailed below where it differs.

### Shared across all five pages

- **`<head>`:**
  - Font `<link>` swapped to the 3-family set (Amiri, Literata, Montserrat) with only the specific
    weights used (500–700), replacing the old 5-family link with Cinzel/Cormorant/JetBrains Mono.
  - A tiny inline `<script>` added before any stylesheet loads, that reads `localStorage` and
    applies the saved Display Settings classes to `<html>` immediately — avoids a flash of
    unstyled content while `script.js` itself is still loading.
  - `<link rel="stylesheet" href="a11y.css">` added, loaded last (after the page's own CSS) so its
    rules — especially the preference overrides — always win.

- **`<body>`:**
  - `<a class="skip-link" href="#main">Skip to main content</a>` as the very first element.
  - `<main id="main" tabindex="-1">` now wraps the page's actual content, so the skip link (and
    dialog-close handlers) have somewhere concrete to send focus.

- **Header, rebuilt on every page:**
  - Old: logo, a flat `<nav class="main-nav">` with four bare links, a "Become a General Member"
    link, and a hamburger `<button>` with three `<span>` bars and `aria-label="Toggle menu"` but
    **no event listener anywhere in the codebase** — clicking it did nothing.
  - New: logo (now with explicit `width`/`height` attributes to prevent layout shift, and
    alt text rewritten from `"UTM MSA logo"` to `"UTM Muslim Students' Association, home page"`),
    a working `.nav-toggle` button wired to `initMobileMenu()`, nav links that each carry a title +
    a short description span (`"Sagas" → "Events & lectures"`, `"The Musalla" → "Prayer times &
    masjids"` — the reviewer's "Sagas is unclear" note), a new `.prefs-toggle` button that opens
    the Display Settings panel, and `aria-current="page"` on whichever nav link matches the current
    page (shown with an underline + weight change, not color alone).
  - The `.prefs-panel` itself — the five fieldsets (Text size / Contrast / Font / Text spacing /
    Motion), each a set of radio buttons — is now present in the header of every page (see the
    `a11y.css` and `script.js` sections above for how it's styled and wired).

- **Footer, standardized across all five pages:**
  - Added a **`<nav aria-labelledby="sitemapHeading">`** "Site map" block listing every page — a
    second way to navigate the site beyond the header nav (WCAG 2.4.5), and useful if the header
    nav is ever missed or collapsed.
  - Social links changed from icon-only to icon + visible text: `"Instagram: @utmmsa"`, `"YouTube:
    @utmmsa"` (reviewer: "label social media buttons, visible or semantic").
  - "Designed & maintained by..." credit line font-size increased and color moved to the new
    higher-contrast token (2.4:1 → 10.5:1).
  - Qur'an translation block: font changed from a small, light, inconsistent mix to Montserrat
    18px/500 for the translation and Montserrat 16px/700 gold for the verse reference; the
    monospace verse-number styling is gone.

### `index.html` specifically

- Hero: `<section class="hero">` gained `aria-labelledby="heroTitle"`; the kicker greeting changed
  from a `<span>` to a `<p>`; the scroll-down chevron link now has visible `aria-hidden` on the
  decorative chevron plus an `.sr-only` text label ("Scroll down to the Bismillah") instead of a
  bare `aria-label` attribute on the link.
- "Next prayer" section: was an entire `<a class="musalla-gateway">` wrapping both a compact clock
  *and* a hover-to-expand detail panel — meaning the expanded content (today's full prayer list)
  was hover-only and unreachable by keyboard or touch (same BOIA hover issue as the resource
  cards). Rebuilt as a `<section>` with a real `<h2>` (with a clock icon), an `aria-live="polite"`
  readout so the next-prayer name/time updates are announced, and the full prayer list always
  visible below rather than hidden behind hover.
- The Instagram highlight section gained the `.embed-frame` wrapper, an "Skip past the Instagram
  post" link, a fallback link to the post directly, and a descriptive `iframe` title once
  `initEmbedTitles()` picks it up.
- Resource preview cards: description text (previously hidden until `:hover`) made permanently
  visible, matching the fix in `resources.css`.

### `about.html` specifically

- Theme-reveal overlay converted from a self-dismissing 3.2-second animation into `initThemeReveal()`'s
  real dialog (see `events-team.js` above): `role="dialog"`, a visible "Continue" button, focus
  trapped inside, closes on Escape/click-outside/button, shown once per session via
  `sessionStorage` instead of every page load.
- Org chart: rebuilt from a visual-only tiered `<div>` layout into a nested `<ul>`/`<li>` structure
  so a screen reader can announce the reporting hierarchy; "Position open" is now written out as
  visible text rather than shown only by a dashed border style.
- Added a **`.page-index`** "On this page" jump list near the top (About has several long sections:
  team, org chart, lectures).
- Team grid `<div>` cards → `<li>` with a real `<h3>` name heading (see `events-team.js`).
- YouTube lectures embed switched to privacy-enhanced (`youtube-nocookie.com`) with captions on by
  default.

### `events.html` (Sagas page) specifically

- Arrow-flight intro: now entirely skipped when `prefers-reduced-motion` or the Motion setting is
  on (previously always played, with no way to turn it off, and the tabs underneath were invisible
  for the full 3.6-second duration).
- Four-tab interface (`Present | Upcoming | Past | Lectures`) rebuilt on top of `initTabs()`, with
  `role="tablist"`/`role="tab"`/`role="tabpanel"` and `aria-controls`/`aria-selected` wired
  correctly (previously a custom, non-ARIA tab implementation). **Default tab changed from Present
  to Upcoming**, since Present is usually empty (nothing happening exactly today) and was
  previously the first thing a visitor saw.
- Event rows: title is now a real `<button>` (see `events-team.js`); dialog opens with proper
  `aria-labelledby` pointing at the event name.
- Lectures tab: 8 video slots marked `REPLACE_ME` pending real titles from the cabinet (data
  content, not a code issue — flagged in "Still needs content" below).

### `resources.html` specifically

- Rail/panel structure kept, but the rail is now a proper `role="tablist"` (`id="resourcesRail"`)
  driven by `initTabs()` instead of the old bespoke `initResourcesRail()` click handler removed
  from `script.js`. Each rail item now carries a `.label-icon` (masjid, heart, cap, food, flag)
  next to its text label.
- **Panels now follow the URL hash** — `resources.html#halal-food` opens directly on the Halal Food
  panel — fixing the bug where homepage resource cards always opened Resources on the Mental
  Health panel regardless of which card was clicked (see Bugs Fixed).
- Crisis callout (Campus Safety, 988, Good2Talk): phone numbers converted to `tel:` links so
  they're tap-to-call on mobile (previously plain text).
- Every "Get directions" / "Visit website" / "Call" link now carries a visually-hidden suffix
  naming its destination, e.g. `Get directions<span class="sr-only"> to Monasaba</span>`, so a
  screen reader doesn't announce a list of identical "Get directions" links with no way to tell
  them apart.

### `musalla.html` specifically

- Prayer times widget switched from its own fetch/render code to the shared `fetchPrayerTimes()` /
  `findNextPrayer()` / `prayerListHTML()` helpers (see `musalla.js` above) — this is the fix for
  the 24-hour vs. 12-hour mismatch with the homepage.
- Added a **`.page-index`** "On this page" jump list (prayer times / on-campus / nearby masjids).
- Nearby masjid cards: each gained a `.label-icon` (pin) next to the address, and "Get directions"
  links now name the masjid for screen readers, same pattern as Resources.
- On-campus section: photo placeholders marked `REPLACE_ME` with a note that any real photo added
  later needs descriptive `alt` text, not `alt=""`.

---

## 9. New: `accessibility.html`

**What it is:** A standalone page, linked from every footer, that states the site's accessibility
commitment and gives people a direct way to report problems.

**Why:** The reviewer's note "test with people who use screen readers" doesn't have a code fix —
it's an ongoing process. This page is the mechanism: a visible, permanent invitation for anyone
using assistive technology to tell the MSA what isn't working, rather than a one-time internal test
being the only check this ever gets.

**Structure:** Uses the same header/footer pattern as every other page (skip link, working mobile
menu, Display Settings panel). Body content:
- A short accessibility statement — what standard the site targets (WCAG 2.2 AA) and that it's an
  ongoing effort, not a one-time fix.
- A link to `ACCESSIBILITY.md` in the GitHub repo for anyone who wants the technical detail.
- A feedback `<a>` with a `mailto:` link to `msa@utmsu.ca` and a pre-filled subject line, so
  reporting a problem takes one tap rather than requiring someone to compose an email from scratch.

---

## 10. New: `ACCESSIBILITY.md`

The handoff document for future cabinets — already in the repo root. Contains the full
reviewer's-notes-to-fix mapping table, the "from the linked resources" list of fixes that went
beyond the reviewer's explicit notes, the bugs-fixed list (below), the verification results
(below), the remaining `REPLACE_ME` content placeholders, and five short rules for keeping new
content accessible going forward. This changelog is the *why and how*; `ACCESSIBILITY.md` is the
*reference table* — keep both in the repo.

---

## Bugs Fixed Along the Way

These weren't in the reviewer's notes — they turned up during implementation and testing:

1. **Homepage resource cards opened the wrong Resources tab.** "Halal Food" on the homepage always
   landed on the Mental Health panel. Fixed by making tabs follow the URL hash
   (`resources.html#halal-food`) via `initTabs()`.
2. **About page's "Become a General Member" link pointed to a placeholder URL** in one spot; now
   consistently uses the real Google Form link everywhere.
3. **Mobile menu button did nothing** — had a label, no listener. Now wired via `initMobileMenu()`.
4. **Crisis numbers weren't tap-to-call** (Campus Safety, 988, Good2Talk) — now `tel:` links.
5. **CSV parser broke on commas inside a cell** (e.g. `"Room 3170, CCT"`) — old parser did a naive
   `line.split(",")`. New `parseCSV()` respects quoted fields.
6. **Dates were read as UTC midnight**, which is the previous evening in Toronto — a bare
   `2026-09-24` from the sheet could land an event in the wrong tab (e.g. show as "past" a day
   early). Fixed by parsing as `date + "T00:00"` (local midnight) instead of handing the bare
   string to `new Date()`.
7. **"This week" on the homepage showed past events and raw ISO date strings.** Now filters to
   today through +7 days and formats as `"Thu, Sep 24"`.
8. **Sheet text wasn't escaped before being inserted into the page** — a stray `<` or `&` in an
   event title or location could break the layout. All sheet-sourced text now passes through
   `escapeHTML()`.
9. **Prayer times showed 24-hour format on The Musalla, 12-hour on the homepage** — two independent
   implementations had drifted apart. Now both pages share `to12Hour()`.
10. **Sagas tabs were invisible for the full 3.6-second arrow-flight intro**, and the default tab
    (Present) was usually empty. Intro is now skippable via reduced-motion, and the default tab is
    Upcoming.

---

## How It Was Verified

| Test | Before | After |
|---|---|---|
| axe-core (WCAG 2.0/2.1/2.2 A+AA + best practice) — 6 pages, every tab, settings panel, event dialog (14 states total) | 33 failing nodes (default views only) | **0** |
| Hero paragraph contrast vs. actual photo pixels, worst 5%, right third of text column | 10.0:1 desktop / **2.1:1 phone** | 13.2:1 desktop / **13.7:1 phone** |
| Scripted keyboard/behavior checks (skip link, focus ring, tabs, dialogs, settings, hash links, text sizes, all-caps, fonts, target sizes, empty buttons) | n/a | **36 / 36 pass** |
| 200% text zoom + WCAG 1.4.12 spacing, every page | Header ran off screen | Nothing clipped, no sideways scroll |
| Reflow at 1920 / 1440 / 1400 / 1399 / 1024 / 768 / 390 / 320px | 2 pages overflowed at 320px | No overflow anywhere |

Syntax validated separately for this Git push: all 5 HTML pages tag-balanced, all 3 JS files pass
`node -c`, all 4 CSS files brace-balanced.

---

## Still Needs Content (search `REPLACE_ME` in the HTML)

- 8 lecture video titles (`events.html`)
- Theme title + one-line description, two places (`about.html`)
- A real photo with descriptive alt text for the charity card and prayer rooms
- Prayer room locations, Jumu'ah logistics, study group details, zakat contact
- `resources-preview-section.html` is an old, unused snippet — safe to delete from the repo

---

## Keeping It Accessible (for future cabinets)

1. Don't add new font sizes below `var(--fs-xs)` (14px) — use the existing scale.
2. Every new image needs `alt` text describing what matters in it, or `alt=""` if purely decorative.
3. Every new link should say where it goes ("Register for Halaqa Night," not "Click here").
4. Links that open a new tab: add `<span class="sr-only"> (opens in a new tab)</span>`.
5. Before shipping a change: Tab through the page without a mouse, and check it with Display
   Settings → High contrast + Largest text turned on.
