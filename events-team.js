/* ============================================================
   UTM MSA — About & Events page behaviour
   Runs alongside script.js (loaded first). Safe to include on
   any page: every function checks the element exists before
   touching it, so it does nothing on pages without that section.
   ============================================================ */

// STEP 1 — Same published-sheet CSV URL you used in script.js.
// Paste it here too (this file fetches independently so the
// Events page doesn't depend on exactly how script.js is written).
const PAGES_EVENTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzWMytxSn8obn1_UVpXS2cEFnaMrffmElA3uDrMGHbXbB7MAZNL-TNa8Cny4nSGg/pub?gid=1548793607&single=true&output=csv";

// ---------- Team grid (About page) ----------
// Edit names here — no HTML editing needed. Order shown = order on the page.
const TEAM = [
  { title: "President", name: "Husain" },
  { title: "Vice President", name: "Farah" },
  { title: "Brother's Student Life", name: "Saad Hussain" },
  { title: "Sister's Student Life", name: "Sarah Al-Malahi" },
  { title: "VP Finance", name: "Suleman" },
  { title: "Internal Affairs", name: "Moosa" },
  { title: "Public Affairs", name: "Mahi" },
  { title: "Co-Marketing Lead", name: "Zunairah" },
  { title: "Co-Marketing Lead", name: "Wafa" },
  { title: "Senior Advisor", name: "Sarah Gamal El-Deen" },
];

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function renderTeamGrid() {
  const grid = document.getElementById("teamGrid");
  if (!grid) return;

  grid.innerHTML = TEAM.map(
    (member) => `
    <div class="team-card">
      <div class="team-avatar">${initials(member.name)}</div>
      <p class="team-name">${member.name}</p>
      <p class="team-title">${member.title}</p>
    </div>
  `
  ).join("");
}

// ---------- CSV parsing (same simple approach as script.js) ----------
function parsePagesCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const rows = lines.slice(1); // skip header row
  return rows
    .map((line) => {
      const [date, title, time, location, tag] = line.split(",").map((s) => (s || "").trim());
      return { date, title, time, location, tag };
    })
    .filter((e) => e.date && e.title);
}

// ---------- Rendering an event row ----------
function eventRowHTML(event, isPast) {
  const dateObj = new Date(event.date);
  const dateLabel = isNaN(dateObj)
    ? event.date
    : dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return `
    <div class="event-row${isPast ? " is-past" : ""}" data-zoomable tabindex="0">
      <div class="event-date-badge">${dateLabel}</div>
      <div>
        <h3>${event.title}</h3>
        <div class="event-meta">${[event.time, event.location].filter(Boolean).join(" · ")}</div>
      </div>
      ${event.tag ? `<span class="event-tag">${event.tag}</span>` : "<span></span>"}
    </div>
  `;
}

// ---------- Zoom-open wiring for event rows ----------
function wireZoomOpen() {
  document.querySelectorAll(".event-row[data-zoomable]").forEach((row) => {
    const open = () => {
      const title = row.querySelector("h3")?.textContent || "";
      const meta = row.querySelector(".event-meta")?.textContent || "";
      const tag = row.querySelector(".event-tag")?.textContent || "";
      const date = row.querySelector(".event-date-badge")?.textContent || "";
      zoomOpen(
        row,
        `<button class="zoom-close" aria-label="Close">✕</button>
         <div class="zoom-detail">
           <span class="event-date-badge">${date}</span>
           <h3>${title}</h3>
           <div class="event-meta">${meta}</div>
           ${tag ? `<span class="event-tag">${tag}</span>` : ""}
         </div>`
      );
    };
    row.addEventListener("click", open);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });
}

// ---------- Split into present / upcoming / past, render all three ----------
function renderEventsLists(events) {
  const presentEl = document.getElementById("presentList");
  const upcomingEl = document.getElementById("upcomingList");
  const pastEl = document.getElementById("pastList");
  if (!presentEl && !upcomingEl && !pastEl) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const withDates = events
    .map((e) => ({ ...e, _d: new Date(e.date) }))
    .filter((e) => !isNaN(e._d));

  const present = withDates.filter((e) => e._d.getTime() === todayTime);
  const upcoming = withDates.filter((e) => e._d.getTime() > todayTime).sort((a, b) => a._d - b._d);
  const past = withDates.filter((e) => e._d.getTime() < todayTime).sort((a, b) => b._d - a._d);

  if (presentEl) {
    presentEl.innerHTML = present.length
      ? present.map((e) => eventRowHTML(e, false)).join("")
      : `<div class="empty-state">Nothing on today's calendar — check Upcoming for what's next.</div>`;
  }

  if (upcomingEl) {
    upcomingEl.innerHTML = upcoming.length
      ? upcoming.map((e) => eventRowHTML(e, false)).join("")
      : `<div class="empty-state">No upcoming events posted yet — check back soon.</div>`;
  }

  if (pastEl) {
    pastEl.innerHTML = past.length
      ? past.map((e) => eventRowHTML(e, true)).join("")
      : `<div class="empty-state">No past events on record yet.</div>`;
  }

  wireZoomOpen();
}

async function loadEventsForPages() {
  const presentEl = document.getElementById("presentList");
  const upcomingEl = document.getElementById("upcomingList");
  const pastEl = document.getElementById("pastList");
  if (!presentEl && !upcomingEl && !pastEl) return; // not on the Sagas page, skip fetch entirely

  try {
    const res = await fetch(PAGES_EVENTS_CSV_URL);
    const csvText = await res.text();
    const events = parsePagesCSV(csvText);
    renderEventsLists(events);
  } catch (err) {
    if (presentEl) presentEl.innerHTML = `<div class="empty-state">Couldn't load today's calendar right now.</div>`;
    if (upcomingEl) upcomingEl.innerHTML = `<div class="empty-state">Couldn't load events right now.</div>`;
    if (pastEl) pastEl.innerHTML = `<div class="empty-state">Couldn't load the archive right now.</div>`;
    console.error("Events fetch failed:", err);
  }
}

// ---------- Sagas tab switching (Present / Upcoming / Past / Lectures) ----------
function initSagaTabs() {
  const tabs = document.querySelectorAll(".saga-tab");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".saga-tab").forEach((t) => t.classList.remove("is-active"));
      document.querySelectorAll(".saga-panel").forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.querySelector(`.saga-panel[data-panel="${tab.dataset.tab}"]`)?.classList.add("is-active");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTeamGrid();
  loadEventsForPages();
  initSagaTabs();

  const themeReveal = document.getElementById("themeReveal");
  if (themeReveal) {
    themeReveal.addEventListener("click", () => {
      themeReveal.style.animation = "themeFadeOut 0.4s ease forwards";
      themeReveal.style.animationDelay = "0s";
    });
  }
});
