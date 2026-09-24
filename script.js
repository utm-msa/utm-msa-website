/* ============================================================
   UTM MSA — site behaviour (loaded on every page)
   1. Mobile menu
   2. Display settings panel (text size, contrast, font, spacing, motion)
   3. Accessible tabs (Sagas + Resources) with #hash links
   4. "This week" events from the Google Sheet
   5. Scroll reveal
   6. Accessible zoom-open dialog (event details)
   7. Homepage prayer gateway
   8. Instagram embed titles
   ============================================================ */

// STEP 1 — Where the event data lives.
// Google Sheets > File > Share > Publish to web > "Events" tab > CSV. Paste the URL here.
// Columns, in this exact order: date, title, time, location, tag
const EVENTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzWMytxSn8obn1_UVpXS2cEFnaMrffmElA3uDrMGHbXbB7MAZNL-TNa8Cny4nSGg/pub?gid=1548793607&single=true&output=csv";

// ---------- Small helpers ----------

// Sheet text is inserted into the page, so escape it (stops a stray "<" in a cell breaking the layout)
function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function prefersReducedMotion() {
  return document.documentElement.classList.contains("pref-motion-reduced") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// "13:05" -> "1:05 PM". Shared by the homepage gateway and musalla.js so both pages show the same format.
function to12Hour(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  if (isNaN(h)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${period}`;
}

// ---------- 1. Mobile menu ----------
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
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
}

// ---------- 2. Display settings ----------
const PREFS_KEY = "msaDisplayPrefs";
const PREF_DEFAULTS = { text: "default", contrast: "default", font: "default", spacing: "default", motion: "default" };

function loadPrefs() {
  try { return { ...PREF_DEFAULTS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") }; }
  catch (e) { return { ...PREF_DEFAULTS }; }
}

function applyPrefs(p) {
  const c = document.documentElement.classList;
  c.remove("pref-text-lg", "pref-text-xl", "pref-contrast-high", "pref-font-readable", "pref-spacing-wide", "pref-motion-reduced");
  if (p.text === "lg" || p.text === "xl") c.add("pref-text-" + p.text);
  if (p.contrast === "high") c.add("pref-contrast-high");
  if (p.spacing === "wide") c.add("pref-spacing-wide");
  if (p.motion === "reduced") c.add("pref-motion-reduced");
  if (p.font === "readable") {
    c.add("pref-font-readable");
    // The easy-read font is only downloaded for people who choose it
    if (!document.getElementById("readableFont")) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.id = "readableFont";
      l.href = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap";
      document.head.appendChild(l);
    }
  }
}

function initDisplaySettings() {
  const toggle = document.querySelector(".prefs-toggle");
  const panel = document.getElementById("prefsPanel");
  const form = document.getElementById("prefsForm");
  if (!toggle || !panel || !form) return;
  const status = document.getElementById("prefsStatus");

  const sync = (p) => {
    Object.entries(p).forEach(([name, value]) => {
      const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
      if (input) input.checked = true;
    });
  };
  sync(loadPrefs());

  const setOpen = (open, returnFocus) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) panel.querySelector("input:checked, input")?.focus();
    else if (returnFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  document.getElementById("prefsClose")?.addEventListener("click", () => setOpen(false, true));
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false, true); });
  form.addEventListener("submit", (e) => e.preventDefault());

  form.addEventListener("change", (e) => {
    const p = loadPrefs();
    p[e.target.name] = e.target.value;
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (err) { /* private mode: still applies for this page */ }
    applyPrefs(p);
    if (status) status.textContent = `${e.target.closest("fieldset").querySelector("legend").textContent} set to ${e.target.closest("label").querySelector("span").firstChild.textContent}.`;
  });

  document.getElementById("prefsReset")?.addEventListener("click", () => {
    try { localStorage.removeItem(PREFS_KEY); } catch (err) {}
    applyPrefs(PREF_DEFAULTS);
    sync(PREF_DEFAULTS);
    if (status) status.textContent = "All display settings reset to default.";
  });
}

// ---------- 3. Accessible tabs ----------
// Any element with role="tablist" and data-tabs becomes a WAI-ARIA tab set:
// arrow keys move between tabs, Home/End jump, only the active tab is in the Tab order,
// and a #hash in the URL (e.g. resources.html#halal-food) opens the matching tab.
function initTabs() {
  document.querySelectorAll('[role="tablist"][data-tabs]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const vertical = list.getAttribute("aria-orientation") === "vertical";

    const activate = (tab, { focus = false, updateHash = true, animate = true } = {}) => {
      const current = tabs.find((t) => t.getAttribute("aria-selected") === "true");
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (animate && panel && current !== tab && !prefersReducedMotion()) {
        panel.classList.remove("is-entering");
        void panel.offsetWidth;
        panel.classList.add("is-entering");
        if (list.id === "resourcesRail") railGhost(tab, panel.parentElement);
      }
      if (focus) tab.focus();
      if (updateHash) history.replaceState(null, "", "#" + tab.getAttribute("aria-controls").replace(/^panel-/, ""));
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (e) => {
        const next = vertical ? ["ArrowDown", "ArrowRight"] : ["ArrowRight", "ArrowDown"];
        const prev = vertical ? ["ArrowUp", "ArrowLeft"] : ["ArrowLeft", "ArrowUp"];
        let target = null;
        if (next.includes(e.key)) target = tabs[(i + 1) % tabs.length];
        else if (prev.includes(e.key)) target = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") target = tabs[0];
        else if (e.key === "End") target = tabs[tabs.length - 1];
        if (target) { e.preventDefault(); activate(target, { focus: true }); }
      });
    });

    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) return;
      const tab = tabs.find((t) => { const c = t.getAttribute("aria-controls"); return c === id || c === "panel-" + id; });
      if (tab) {
        activate(tab, { updateHash: false, animate: false });
        list.scrollIntoView({ block: "start" });
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
  });
}

// Decorative "ghost" that flies from the rail button into the Resources panel (skipped under reduced motion)
function railGhost(item, panelContainer) {
  if (!panelContainer) return;
  const a = item.getBoundingClientRect();
  const b = panelContainer.getBoundingClientRect();
  const ghost = document.createElement("div");
  ghost.className = "rail-ghost";
  ghost.setAttribute("aria-hidden", "true");
  ghost.textContent = item.textContent.trim();
  Object.assign(ghost.style, { top: a.top + "px", left: a.left + "px", width: a.width + "px", height: a.height + "px", opacity: "1" });
  document.body.appendChild(ghost);
  requestAnimationFrame(() => {
    Object.assign(ghost.style, { top: b.top + "px", left: b.left + "px", width: b.width + "px", height: "50px", opacity: "0" });
  });
  setTimeout(() => ghost.remove(), 420);
}

// ---------- 4. "This week" events (homepage) ----------
// Hand-rolled CSV parser that also handles quoted cells with commas, e.g. "Room 3170, CCT"
function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function parseEventsCSV(text) {
  return parseCSV(text.trim())
    .slice(1)
    .filter((c) => c.length >= 2 && (c[0] || "").trim() !== "")
    .map(([date, title, time, location, tag]) => ({
      date: (date || "").trim(), title: (title || "").trim(), time: (time || "").trim(),
      location: (location || "").trim(), tag: (tag || "").trim(),
    }));
}

function renderWeekGrid(events) {
  const grid = document.getElementById("weekGrid");
  if (!grid) return;
  grid.setAttribute("aria-busy", "false");

  // Only today through the next 7 days, soonest first, with a readable date ("Thu, Sep 24")
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekOut = new Date(today); weekOut.setDate(weekOut.getDate() + 7);
  const upcoming = events
    .map((e) => ({ ...e, _d: new Date(e.date.length === 10 ? e.date + "T00:00" : e.date) }))
    .filter((e) => !isNaN(e._d) && e._d >= today && e._d <= weekOut)
    .sort((a, b) => a._d - b._d);

  if (!upcoming.length) {
    grid.innerHTML = '<li class="week-empty">Nothing on the calendar this week yet. <a href="events.html">See upcoming events</a> or follow us on Instagram.</li>';
    return;
  }
  grid.innerHTML = upcoming.slice(0, 4).map((ev) => `
      <li class="week-card">
        <p class="ev-date"><time datetime="${escapeHTML(ev.date)}">${ev._d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" })}</time></p>
        <h3 class="ev-title">${escapeHTML(ev.title)}</h3>
        <p class="ev-meta">${[ev.time, ev.location].filter(Boolean).map(escapeHTML).join(", ")}</p>
      </li>`).join("");
}

async function loadEvents() {
  if (!document.getElementById("weekGrid")) return;
  try {
    const res = await fetch(EVENTS_CSV_URL);
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    renderWeekGrid(parseEventsCSV(await res.text()));
  } catch (err) {
    console.error("[events] could not load sheet:", err);
    const grid = document.getElementById("weekGrid");
    grid.setAttribute("aria-busy", "false");
    grid.innerHTML = '<li class="week-empty">Events couldn\'t load right now. Try refreshing, or see our <a href="https://www.instagram.com/utmmsa/">Instagram</a> for this week\'s schedule.</li>';
  }
}

// ---------- 5. Scroll reveal ----------
function initScrollReveal() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1 });
  targets.forEach((t) => observer.observe(t));
  // Anything focused by keyboard is revealed immediately, never left invisible
  document.addEventListener("focusin", (e) => e.target.closest?.("[data-reveal]")?.classList.add("is-visible"));
}

// ---------- 6. Zoom-open dialog ----------
// Opens a detail view that grows out of the thing you clicked. It is a real modal dialog:
// focus moves into it, Tab stays inside it, Escape closes it, and focus returns to where you were.
function zoomOpen(triggerEl, contentHTML, labelId) {
  if (!triggerEl) return;
  const returnTo = document.activeElement;
  const rect = triggerEl.getBoundingClientRect();
  const reduce = prefersReducedMotion();

  const backdrop = document.createElement("div");
  backdrop.className = "zoom-backdrop";
  const dialog = document.createElement("div");
  dialog.className = "zoom-clone";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  if (labelId) dialog.setAttribute("aria-labelledby", labelId);
  dialog.innerHTML = contentHTML;

  const place = (r) => Object.assign(dialog.style, { top: r.top + "px", left: r.left + "px", width: r.width + "px", height: r.height + "px" });
  place(rect);
  document.body.append(backdrop, dialog);
  document.body.style.overflow = "hidden";
  // Hide the rest of the page from screen readers while the dialog is open
  const siblings = [...document.body.children].filter((el) => el !== backdrop && el !== dialog && !el.hasAttribute("inert"));
  siblings.forEach((el) => el.setAttribute("inert", ""));

  const targetW = Math.min(window.innerWidth - 32, 720);
  const targetH = Math.min(window.innerHeight - 64, 560);
  const open = () => {
    backdrop.classList.add("is-visible");
    place({ top: (window.innerHeight - targetH) / 2, left: (window.innerWidth - targetW) / 2, width: targetW, height: targetH });
    dialog.classList.add("is-open");
  };
  reduce ? open() : requestAnimationFrame(open);
  dialog.querySelector(".zoom-close")?.focus();

  function close() {
    siblings.forEach((el) => el.removeAttribute("inert"));
    backdrop.classList.remove("is-visible");
    dialog.classList.remove("is-open");
    place(rect);
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
    setTimeout(() => { backdrop.remove(); dialog.remove(); }, reduce ? 0 : 420);
    returnTo?.focus?.();
  }
  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "Tab") {
      const f = [...dialog.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  }
  backdrop.addEventListener("click", close);
  dialog.querySelector(".zoom-close")?.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
}

// ---------- 7. Homepage prayer gateway ----------
const UTM_COORDS = { lat: 43.5461, lng: -79.6633 };
const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

async function fetchPrayerTimes() {
  const ts = Math.floor(Date.now() / 1000);
  const res = await fetch(`https://api.aladhan.com/v1/timings/${ts}?latitude=${UTM_COORDS.lat}&longitude=${UTM_COORDS.lng}&method=2`);
  if (!res.ok) throw new Error(`AlAdhan fetch failed: ${res.status}`);
  return (await res.json()).data;
}

function findNextPrayer(timings) {
  const now = new Date();
  for (const name of PRAYER_ORDER) {
    const raw = (timings[name] || "").split(" ")[0];
    const [h, m] = raw.split(":").map(Number);
    if (new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m) > now) return { name, raw };
  }
  return { name: "Fajr", raw: (timings.Fajr || "").split(" ")[0], tomorrow: true };
}

// Renders the five times as a definition list (name/time pairs), marking the next prayer in text, not just colour
function prayerListHTML(timings, nextName, label) {
  return `<dl class="prayer-list" aria-label="${label}">` + PRAYER_ORDER.map((name) => {
    const raw = (timings[name] || "").split(" ")[0];
    const isNext = name === nextName;
    return `<div class="prayer-item${isNext ? " is-next" : ""}"><dt>${name}</dt><dd>${to12Hour(raw)}</dd></div>`;
  }).join("") + "</dl>";
}

async function loadPrayerGateway() {
  const nameEl = document.getElementById("nextPrayerName");
  const timeEl = document.getElementById("nextPrayerTime");
  if (!nameEl || !timeEl) return;
  const hijriEl = document.getElementById("gatewayHijri");
  const rowEl = document.getElementById("gatewayTimesRow");
  try {
    const data = await fetchPrayerTimes();
    const h = data.date.hijri;
    if (hijriEl) hijriEl.textContent = `${h.day} ${h.month.en} ${h.year} AH`;
    const next = findNextPrayer(data.timings);
    nameEl.textContent = next.tomorrow ? `${next.name}, tomorrow` : next.name;
    timeEl.textContent = `at ${to12Hour(next.raw)}`;
    if (rowEl) rowEl.innerHTML = prayerListHTML(data.timings, next.tomorrow ? null : next.name, "Today's prayer times at UTM");
  } catch (err) {
    console.error("[prayer gateway]", err);
    nameEl.textContent = "Prayer times couldn't load";
    timeEl.textContent = "";
    if (rowEl) rowEl.innerHTML = '<p class="prayer-empty">Try refreshing, or see today\'s times on The Musalla page.</p>';
  }
}

// ---------- 8. Instagram iframes get a descriptive title once Instagram inserts them ----------
function initEmbedTitles() {
  const frames = document.querySelectorAll(".embed-frame");
  if (!frames.length || !("MutationObserver" in window)) return;
  frames.forEach((frame) => {
    const label = frame.getAttribute("aria-label") || "Instagram post";
    new MutationObserver(() => {
      frame.querySelectorAll("iframe:not([data-titled])").forEach((f) => { f.title = label; f.dataset.titled = "1"; });
    }).observe(frame, { childList: true, subtree: true });
  });
}

// ---------- Boot ----------
applyPrefs(loadPrefs());
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initDisplaySettings();
  initTabs();
  initScrollReveal();
  loadEvents();
  loadPrayerGateway();
  initEmbedTitles();
});
