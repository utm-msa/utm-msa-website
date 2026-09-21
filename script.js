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

// ---------- Resources page: rail item click → zoom-ghost into panel ----------
function initResourcesRail() {
  const rail = document.getElementById("resourcesRail");
  const panelContainer = document.getElementById("resourcesPanel");
  if (!rail || !panelContainer) return;

  rail.querySelectorAll(".rail-item").forEach((item) => {
    item.addEventListener("click", () => {
      const panelId = item.dataset.panel;
      const target = panelContainer.querySelector(`.panel-detail[data-panel="${panelId}"]`);
      if (!target || item.classList.contains("is-active")) return;

      const triggerRect = item.getBoundingClientRect();
      const panelRect = panelContainer.getBoundingClientRect();

      const ghost = document.createElement("div");
      ghost.className = "rail-ghost";
      ghost.textContent = item.textContent;
      ghost.style.top = triggerRect.top + "px";
      ghost.style.left = triggerRect.left + "px";
      ghost.style.width = triggerRect.width + "px";
      ghost.style.height = triggerRect.height + "px";
      ghost.style.opacity = "1";
      document.body.appendChild(ghost);

      requestAnimationFrame(() => {
        ghost.style.top = panelRect.top + "px";
        ghost.style.left = panelRect.left + "px";
        ghost.style.width = panelRect.width + "px";
        ghost.style.height = "50px";
        ghost.style.opacity = "0";
      });
      setTimeout(() => ghost.remove(), 420);

      rail.querySelectorAll(".rail-item").forEach((b) => b.classList.remove("is-active"));
      item.classList.add("is-active");
      panelContainer.querySelectorAll(".panel-detail").forEach((p) => p.classList.remove("is-active"));
      target.classList.add("is-entering", "is-active");
      requestAnimationFrame(() => target.classList.remove("is-entering"));
      panelContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
}

// ---------- Homepage: Musalla gateway (next prayer + hover expand) ----------
// Same AlAdhan API + UTM coordinates as musalla.js, but only cares about
// "what's next" for the compact clock, plus the full row for the hover state.
const GATEWAY_LAT = 43.5461;
const GATEWAY_LNG = -79.6633;
const GATEWAY_PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

function gatewayTo12Hour(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

async function loadPrayerGateway() {
  const nameEl = document.getElementById("nextPrayerName");
  const timeEl = document.getElementById("nextPrayerTime");
  const hijriEl = document.getElementById("gatewayHijri");
  const rowEl = document.getElementById("gatewayTimesRow");
  if (!nameEl || !timeEl) return; // not on a page with the widget

  try {
    const ts = Math.floor(Date.now() / 1000);
    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${ts}?latitude=${GATEWAY_LAT}&longitude=${GATEWAY_LNG}&method=2`
    );
    if (!res.ok) throw new Error(`AlAdhan fetch failed: ${res.status}`);
    const json = await res.json();
    const timings = json.data.timings;
    const hijri = json.data.date.hijri;

    if (hijriEl) {
      hijriEl.textContent = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
    }

    // Find the next prayer that hasn't happened yet today; if all five have
    // passed, fall back to today's Fajr time labelled "Tomorrow" (close
    // enough day-to-day — exact time updates once it's actually tomorrow).
    const now = new Date();
    let next = null;
    for (const name of GATEWAY_PRAYER_ORDER) {
      const raw = (timings[name] || "").split(" ")[0];
      const [h, m] = raw.split(":").map(Number);
      const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      if (candidate > now) {
        next = { name, raw };
        break;
      }
    }
    if (!next) {
      const raw = (timings.Fajr || "").split(" ")[0];
      next = { name: "Fajr", raw, tomorrow: true };
    }

    nameEl.textContent = next.tomorrow ? `${next.name} · Tomorrow` : next.name;
    timeEl.textContent = gatewayTo12Hour(next.raw);

    if (rowEl) {
      rowEl.innerHTML = GATEWAY_PRAYER_ORDER.map((name) => {
        const raw = (timings[name] || "").split(" ")[0];
        return `
          <div class="musalla-gateway-cell">
            <span class="musalla-gateway-cell-label">${name}</span>
            <span class="musalla-gateway-cell-time">${gatewayTo12Hour(raw)}</span>
          </div>`;
      }).join("");
    }
  } catch (err) {
    nameEl.textContent = "The Musalla";
    timeEl.textContent = "See today's times →";
    if (hijriEl) hijriEl.textContent = "";
    console.error("[musalla gateway] could not load prayer times:", err);
  }
}

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", () => {
  buildHeroMotif();
  initScrollReveal();
  loadEvents();
  initResourcesRail();
  loadPrayerGateway();
});
