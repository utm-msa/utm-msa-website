# Accessibility pass — September 24, 2026

Source: "Making the Website Accessible" review by Sarah Qamar, plus every resource linked in it
(Elsevier developer/designer checklist, WCAG 2.2, WebAIM, font-size guidance, Equalize Digital,
BOIA, Learn the Web checklist + cheat sheet, CNIB, programmatic determinability).

Target: **WCAG 2.2 level AA**, AAA where practical.

## How it was verified

| Test | Before | After |
|---|---|---|
| axe-core (WCAG 2.0/2.1/2.2 A+AA + best practice), 6 pages, every tab, settings panel, event dialog (14 states) | 33 failing nodes (default views only) | **0** |
| Hero paragraph contrast vs. the actual photo pixels, worst 5% of pixels, right third of text | 10.0:1 desktop, **2.1:1 phone** | 13.2:1 desktop, **13.7:1 phone** |
| Scripted keyboard/behaviour checks (skip link, focus ring, tabs, dialogs, settings, hash links, sizes, caps, fonts, target sizes, empty buttons) | n/a | **36 / 36 pass** |
| 200% text + WCAG 1.4.12 spacing on every page | header ran off screen | nothing clipped, no sideways scroll |
| Reflow at 1920 / 1440 / 1400 / 1399 / 1024 / 768 / 390 / 320px | 2 pages overflowed at 320 | no overflow anywhere |

Contrast is measured as luminance, which is exactly what the reviewer's black-and-white test shows.

## Reviewer's notes, line by line

| Note | Change | Where |
|---|---|---|
| Lengthen the hero's horizontal gradient; text hard to read toward the middle, especially in black and white | Dark band now holds 84–95% across the whole text column and fades only past it. Phones get an even full-width scrim | `styles.css` `.hero` |
| Change header font; reads like all caps | Cinzel → **Literata** (true upper/lower case, open letterforms). One-line revert: `--font-display` in `styles.css` | `styles.css` `:root` |
| All caps should be avoided | Every `text-transform: uppercase` removed (18 rules). Labels are sentence case + bold | all CSS |
| Serif with extended terminals: text spacing encouraged | Headings get slight tracking + 1.25 line-height; a "Wide text spacing" option applies full WCAG 1.4.12 spacing | `styles.css`, `a11y.css` |
| 3 fonts or fewer | 5 families → **3**: Literata, Montserrat, Amiri (Arabic only). JetBrains Mono and Cormorant removed | font `<link>` on every page |
| Label social media buttons (visible or semantic) | Visible text: "Instagram: @utmmsa", "YouTube: @utmmsa". Icons are decorative | footer, every page |
| Check all buttons are not empty | Checked every link/button on every page. Also fixed the homepage menu button, which had a label but **no code behind it** (mobile menu didn't open) | `script.js` `initMobileMenu` |
| Font weights medium or heavy; lightweight body text hard to read | Minimum weight is 500 everywhere; body 500, labels 600–700 | all CSS |
| Qur'an translation + "cyber" verse-number font: too small, too light, inconsistent | Translation: Montserrat 18px 500, near-white. Reference: Montserrat 16px bold gold. Monospace removed site-wide | footer verse block |
| Headers stay headers, body stays body | Literata only for headings (+ the greeting and quotes as display text). Everything else Montserrat | all CSS |
| Bigger non-title text (navigation, basmalah, This Week, "Designed" line) | Nav 16px + 14px descriptions; Bismillah Arabic up to 60px, translation 18px; This Week titles 18px, meta 15px; credit line 15px | all CSS |
| "Designed & maintained" line too dark | 2.4:1 → **10.5:1** | `styles.css` `.footer-bottom` |
| Contrast passes but text too thin/small; tested at 100% | Muted text colour `#7783a3` (4.6:1) → `#b3bbd1` (**9.0:1**). Floor 14px, body 17px. All sizes in `rem` so browser text size settings work | `styles.css` `:root` |
| Specific labels (e.g. "Contact"; "Sagas" unclear) | "Email us at msa@utmsu.ca"; nav subtitles (Sagas: *Events & lectures*, The Musalla: *Prayer times & masjids*, etc.) + page subtitles; "See all" → "See all events" / "See all resources"; every "Get directions", "Visit website", "Call" link names its destination for screen readers | every page |
| A second way to navigate | Full **site map** in every footer + **"On this page"** links on About and The Musalla | footer, `about.html`, `musalla.html` |
| Icons next to text labels (e.g. masjid icon by Local Masjids) | Icons on Resources tabs, section and sub-section headings (masjid, clock, prayer arch, heart, cap, food, flag, building, pin), footer contact | every page |
| …with alt text in the HTML | Icons **next to visible text are marked decorative** (`aria-hidden`) on purpose: giving them alt text makes screen readers say "masjid icon, Local Masjids" twice. Icons that stand alone always have a text name | — |
| Use CNIB as a reference (comfort menu, alt text) | **Display settings** panel on every page: text size, high contrast, easy-read font (Atkinson Hyperlegible), text spacing, reduce motion. Saved per device, with Reset | header, `a11y.css`, `script.js` |
| Outline around the Instagram embed; focus box went missing | Gold frame around the embed; whole frame lights up when focus is inside it; "Skip past the Instagram post" link; fallback link if Instagram doesn't load; iframe gets a descriptive title | `index.html`, `a11y.css` |
| Focus styles: keep them visible | Custom ring: 3px gold + navy halo, visible on navy, gold buttons, and the white embed (gold alone is only 1.7:1 on white) | `a11y.css` |
| Test with people who use screen readers | New **Accessibility page** with a clear "tell us what isn't working" request (email subject line pre-filled). Share it in the Musalla chats | `accessibility.html` |

## From the linked resources (beyond the notes)

- **Skip to main content** link on every page (Elsevier #8, WCAG 2.4.1).
- One `<h1>` per page, headings in order, landmarks on all content (Elsevier #2, axe `region`).
- Links in text are underlined, not colour-only (Elsevier "Links", BOIA, WCAG 1.4.1).
- Hover-only content removed: resource descriptions and prayer times were hidden until mouse hover (BOIA hover article, WCAG 2.1.1 / 1.4.13).
- `<button>` for in-page actions, `<a>` for navigation; event rows are real buttons (Elsevier #7).
- Tabs follow the WAI-ARIA pattern: arrow keys, Home/End, correct roles (axe critical).
- Dialogs (event details, theme intro) trap focus, close on Escape, return focus (WCAG 2.1.2, 2.4.3).
- Loading and error messages announced to screen readers (Elsevier "Dynamic content", WCAG 4.1.3).
- Animations stop on their own or can be turned off: Bismillah glow no longer loops forever, scroll arrow bounces twice (Learn the Web "animations can be stopped", WCAG 2.2.2).
- Theme intro no longer vanishes on a 3.2s timer; stays until dismissed, shows once per visit, and the theme also appears on the page (WCAG 2.2.1).
- Targets at least 44px tall for buttons, pills, tabs, footer links (Learn the Web "hit areas", WCAG 2.5.8).
- Control outlines at least 3:1 (were 1.3–1.5:1) (WCAG 1.4.11).
- Sticky header can't cover focused elements or anchored headings (WCAG 2.4.11).
- Header switches to the menu button whenever the full header won't fit at the current text size.
- Lectures: YouTube captions on by default; privacy-enhanced embeds.
- Org chart is a nested list so screen readers hear who reports to whom; "Position open" is written out, not shown by a dashed border alone.
- Supports OS high-contrast, Windows forced colours, and reduced-motion settings automatically.

## Bugs fixed along the way

- Homepage cards like "Halal Food" opened Resources on the Mental Health panel. Tabs now follow the URL (`resources.html#halal-food`).
- About page "Become a General Member" pointed to a placeholder URL.
- Mobile menu button did nothing.
- Crisis numbers (Campus Safety, 988 call/text, Good2Talk) weren't tap-to-call.
- CSV parser broke on commas inside cells ("Room 3170, CCT"). Now handles quotes.
- Dates like `2026-09-24` were read as UTC midnight, i.e. the previous evening in Toronto, so events could land in the wrong tab.
- "This week" showed past events and raw ISO dates; now today + 7 days, "Thu, Sep 24".
- Sheet text is escaped before being inserted into the page.
- Prayer times showed 24-hour on The Musalla but 12-hour on the homepage; both 12-hour now.
- Sagas tabs were invisible for 3.6s while the intro played; default tab is now Upcoming (Today is usually empty).

## Still needs content (REPLACE_ME in the HTML)

- Real titles for the 8 lecture videos (`events.html`).
- Theme title + line (`about.html`, two places).
- Photo **with alt text** for the charity card and prayer rooms.
- Prayer room locations, Jumu'ah details, study groups, zakat contact.
- `resources-preview-section.html` is an old unused snippet; safe to delete.

## Keeping it accessible (for future cabinets)

1. Use the existing classes; don't add new font sizes below `var(--fs-xs)` (14px).
2. Every new image: `alt` describing what matters in it, or `alt=""` if decorative.
3. Every new link: say where it goes ("Register for Halaqa Night", not "Click here").
4. New links that open a new tab: add `<span class="sr-only"> (opens in a new tab)</span>`.
5. Test: Tab through the page without a mouse, and turn on Display settings > High contrast + Largest.
