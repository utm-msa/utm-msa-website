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
    <div class="event-row${isPast ? " is-past" : ""}">
      <div class="event-date-badge">${dateLabel}</div>
      <div>
        <h3>${event.title}</h3>
        <div class="event-meta">${[event.time, event.location].filter(Boolean).join(" · ")}</div>
      </div>
      ${event.tag ? `<span class="event-tag">${event.tag}</span>` : "<span></span>"}
    </div>
  `;
}

// ---------- Split into upcoming vs past, render both lists ----------
function renderEventsLists(events) {
  const upcomingEl = document.getElementById("upcomingList");
  const pastEl = document.getElementById("pastList");
  if (!upcomingEl && !pastEl) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const withDates = events
    .map((e) => ({ ...e, _d: new Date(e.date) }))
    .filter((e) => !isNaN(e._d));

  const upcoming = withDates.filter((e) => e._d >= today).sort((a, b) => a._d - b._d);
  const past = withDates.filter((e) => e._d < today).sort((a, b) => b._d - a._d);

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
}

async function loadEventsForPages() {
  const upcomingEl = document.getElementById("upcomingList");
  const pastEl = document.getElementById("pastList");
  if (!upcomingEl && !pastEl) return; // not on the Events page, skip fetch entirely

  try {
    const res = await fetch(PAGES_EVENTS_CSV_URL);
    const csvText = await res.text();
    const events = parsePagesCSV(csvText);
    renderEventsLists(events);
  } catch (err) {
    if (upcomingEl) upcomingEl.innerHTML = `<div class="empty-state">Couldn't load events right now.</div>`;
    if (pastEl) pastEl.innerHTML = `<div class="empty-state">Couldn't load the archive right now.</div>`;
    console.error("Events fetch failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderTeamGrid();
  loadEventsForPages();
});
