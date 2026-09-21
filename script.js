/* ============================================================
   UTM MSA — site behaviour
   1. Build the hero's decorative diamond grid
   2. Fetch events from a published Google Sheet (as CSV)
   3. Render "This Week" cards + the live event counter
   4. Reveal sections on scroll
   ============================================================ */

// STEP 1 — Where the event data lives.
// Google Sheets → File → Share → Publish to web → pick the "Events" tab,
// format = CSV. Paste that URL here. Columns expected, in this exact
// order: date, title, time, location, tag
const EVENTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzWMytxSn8obn1_UVpXS2cEFnaMrffmElA3uDrMGHbXbB7MAZNL-TNa8Cny4nSGg/pub?gid=1548793607&single=true&output=csv";

// ---------- Hero decorative motif ----------
// Builds the faint grid of rotated squares behind the hero text —
// purely visual, so it fails silently if the container is missing.
function buildHeroMotif() {
  const container = document.getElementById("heroMotif");
  if (!container) return;

  const cols = 4;
  const rows = 4;
  const cellSize = 90;

  for (let i = 0; i < cols * rows; i++) {
    const dot = document.createElement("span");
    const col = Math.floor(i / rows);
    const row = i % rows;
    dot.style.top = `${row * cellSize}px`;
    dot.style.left = `${col * cellSize}px`;
    dot.style.animationDelay = `${(i % 5) * 0.6}s`;
    container.appendChild(dot);
  }
}

// ---------- CSV → array of event objects ----------
// A small hand-rolled parser is fine here because the sheet is simple,
// single-line fields. If anyone later adds commas inside a cell (e.g.
// "Room 3170, CCT"), swap this for Papa Parse — see the note in the
// project README.
function parseEventsCSV(text) {
  const lines = text.trim().split("\n");
  const rows = lines.slice(1); // drop the header row
  return rows
    .map((line) => line.split(","))
    .filter((cols) => cols.length >= 5 && cols[0].trim() !== "")
    .map(([date, title, time, location, tag]) => ({
      date: date.trim(),
      title: title.trim(),
      time: time.trim(),
      location: location.trim(),
      tag: (tag || "").trim(),
    }));
}

// ---------- Render "This Week" ----------
function renderWeekGrid(events) {
  const grid = document.getElementById("weekGrid");
  const liveCount = document.getElementById("liveEventCount");
  if (!grid) return;

  if (!events.length) {
    grid.innerHTML = '<div class="week-empty">No events posted yet — check back soon.</div>';
    if (liveCount) liveCount.textContent = "No events live on the calendar this week";
    return;
  }

  grid.innerHTML = events
    .slice(0, 4) // homepage teaser only shows the next 4
    .map(
      (ev) => `
      <div class="week-card">
        <div class="ev-date">${ev.date}</div>
        <div class="ev-title">${ev.title}</div>
        <div class="ev-meta">${ev.time} · ${ev.location}</div>
      </div>`
    )
    .join("");

  if (liveCount) {
    liveCount.textContent = `${events.length} event${events.length === 1 ? "" : "s"} live on the calendar this week`;
  }
}

// ---------- Fetch + wire it up ----------
async function loadEvents() {
  if (EVENTS_CSV_URL.startsWith("REPLACE_WITH")) {
    // Sheet isn't connected yet — show a friendly placeholder instead of an error.
    renderWeekGrid([]);
    return;
  }
  try {
    const res = await fetch(EVENTS_CSV_URL);
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const csvText = await res.text();
    const events = parseEventsCSV(csvText);
    renderWeekGrid(events);
  } catch (err) {
    console.error("[events] could not load sheet:", err);
    const grid = document.getElementById("weekGrid");
    if (grid) grid.innerHTML = '<div class="week-empty">Couldn\'t load events right now.</div>';
  }
}

// ---------- Scroll reveal ----------
function initScrollReveal() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length || !("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  targets.forEach((t) => observer.observe(t));
}

// ---------- Zoom-open card transition ----------
// Reusable "shared element" zoom: clicking a trigger scales/slides it from
// its own position on the page into a full detail overlay, instead of a
// plain modal popping in. Used on the Sagas page; intended for reuse on
// Resources cards too once that page's redesign lands.
function zoomOpen(triggerEl, contentHTML) {
  if (!triggerEl) return;
  const rect = triggerEl.getBoundingClientRect();

  const backdrop = document.createElement("div");
  backdrop.className = "zoom-backdrop";

  const clone = document.createElement("div");
  clone.className = "zoom-clone";
  clone.style.top = rect.top + "px";
  clone.style.left = rect.left + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";
  clone.innerHTML = contentHTML;

  document.body.appendChild(backdrop);
  document.body.appendChild(clone);
  document.body.style.overflow = "hidden";

  // Force layout, then animate to the centred, full-size target.
  requestAnimationFrame(() => {
    backdrop.classList.add("is-visible");
    const targetW = Math.min(window.innerWidth - 48, 720);
    const targetH = Math.min(window.innerHeight - 96, 640);
    clone.style.top = (window.innerHeight - targetH) / 2 + "px";
    clone.style.left = (window.innerWidth - targetW) / 2 + "px";
    clone.style.width = targetW + "px";
    clone.style.height = targetH + "px";
    clone.classList.add("is-open");
  });

  function close() {
    backdrop.classList.remove("is-visible");
    clone.classList.remove("is-open");
    clone.style.top = rect.top + "px";
    clone.style.left = rect.left + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";
    document.body.style.overflow = "";
    setTimeout(() => {
      backdrop.remove();
      clone.remove();
    }, 420);
  }

  backdrop.addEventListener("click", close);
  clone.querySelector(".zoom-close")?.addEventListener("click", close);
  document.addEventListener("keydown", function esc(e) {
    if (e.key === "Escape") {
      close();
      document.removeEventListener("keydown", esc);
    }
  });
}

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", () => {
  buildHeroMotif();
  initScrollReveal();
  loadEvents();
});
