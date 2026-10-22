/* ============================================================
   UTM MSA — About & Events page behaviour
   Loaded after events-data.js and script.js (uses mergeEvents from the first;
   escapeHTML, parseEventsCSV, zoomOpen, prefersReducedMotion from the second). Every function checks its element
   exists, so this file is safe on any page.
   ============================================================ */

// Same published-sheet CSV URL as EVENTS_CSV_URL in script.js.
const PAGES_EVENTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzWMytxSn8obn1_UVpXS2cEFnaMrffmElA3uDrMGHbXbB7MAZNL-TNa8Cny4nSGg/pub?gid=1548793607&single=true&output=csv";

// ---------- Team grid (About) ----------
// Edit names here. Order shown = order on the page.
const TEAM = [
  { title: "President", name: "Husain" },
  { title: "Vice President", name: "Farah" },
  { title: "Brothers' Student Life", name: "Saad Hussain" },
  { title: "Sisters' Student Life", name: "Sarah Al-Malahi" },
  { title: "VP Finance", name: "Suleman" },
  { title: "Internal Affairs", name: "Moosa" },
  { title: "Public Affairs", name: "Mahi" },
  { title: "Co-Marketing Lead", name: "Zunairah" },
  { title: "Co-Marketing Lead", name: "Wafa" },
  { title: "Senior Advisor", name: "Sarah Gamal El-Deen" },
];

function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function renderTeamGrid() {
  const grid = document.getElementById("teamGrid");
  if (!grid) return;
  // Initials circle is decorative (aria-hidden); the name is a real heading
  grid.innerHTML = TEAM.map((m) => `
    <li class="team-card">
      <div class="team-avatar" aria-hidden="true">${escapeHTML(initials(m.name))}</div>
      <h3 class="team-name">${escapeHTML(m.name)}</h3>
      <p class="team-title">${escapeHTML(m.title)}</p>
    </li>`).join("");
}

// ---------- Event rows (Events page) ----------
function eventDateLabel(ev) {
  const d = ev._d;
  if (ev.recurring) return ev.recurring;
  if (!ev.date) return "Earlier this fall";
  return isNaN(d) ? ev.date : d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}

function eventRowHTML(ev, isPast, idx) {
  const meta = [ev.time, ev.location].filter(Boolean).map(escapeHTML).join(", ");
  const cw = ev.campaign === "charity-week" ? " is-cw" : "";
  return `
    <li class="event-row${isPast ? " is-past" : ""}${cw}">
      <p class="event-date-badge" style="margin:0">${isPast ? '<span class="sr-only">Past event, </span>' : ""}${escapeHTML(eventDateLabel(ev))}</p>
      <div>
        <h3><button type="button" class="event-open" data-idx="${idx}" aria-haspopup="dialog">${escapeHTML(ev.title)}<span class="sr-only">, open details</span></button></h3>
        ${meta ? `<p class="event-meta" style="margin:0">${meta}</p>` : ""}
      </div>
      ${ev.tag ? `<span class="event-tag">${escapeHTML(ev.tag)}</span>` : "<span></span>"}
    </li>`;
}

let EVENT_CACHE = [];

const NEW_TAB = '<span class="sr-only"> (opens in a new tab)</span>';
const IG_PROFILE = typeof INSTAGRAM_PROFILE !== "undefined" ? INSTAGRAM_PROFILE : "https://www.instagram.com/utmmsa/";

// The picture side of the pop-up: the event's Instagram post if it has one (with the poster as a
// fallback while it loads or if Instagram is blocked), otherwise the poster, otherwise nothing.
function eventMediaHTML(ev) {
  const poster = ev.image
    ? `<img class="event-poster" src="${escapeHTML(ev.image)}" alt="${escapeHTML(ev.imageAlt || ev.title + " poster")}" loading="lazy">`
    : "";
  if (ev.post) {
    return `
      <blockquote class="instagram-media" data-instgrm-permalink="${escapeHTML(ev.post)}" data-instgrm-version="14">
        ${poster}
        <a class="embed-fallback" href="${escapeHTML(ev.post)}" target="_blank" rel="noopener">View this post on Instagram${NEW_TAB}</a>
      </blockquote>`;
  }
  return poster;
}

// Buttons: registration link first if there is one; otherwise straight to the Instagram post
// (or the Charity Week post, or @utmmsa).
function eventActionsHTML(ev, isPast) {
  const igLink = ev.post || (ev.campaign === "charity-week" && typeof CHARITY_WEEK !== "undefined" && CHARITY_WEEK.post) || IG_PROFILE;
  const igLabel = ev.post
    ? (isPast ? "Watch the recap on Instagram" : "See the post on Instagram")
    : (igLink === IG_PROFILE ? "Follow @utmmsa on Instagram" : "See the Charity Week post on Instagram");
  if (ev.register && !isPast) {
    return `
      <a class="btn-primary" href="${escapeHTML(ev.register)}" target="_blank" rel="noopener">${escapeHTML(ev.registerLabel || "Register")}${ev.title ? `<span class="sr-only"> for ${escapeHTML(ev.title)}</span>` : ""}${NEW_TAB}</a>
      <a class="btn-text" href="${escapeHTML(igLink)}" target="_blank" rel="noopener">${igLabel}${NEW_TAB}</a>`;
  }
  return `<a class="btn-primary" href="${escapeHTML(igLink)}" target="_blank" rel="noopener">${igLabel}${NEW_TAB}</a>`;
}

function wireEventDialogs() {
  document.querySelectorAll(".event-open").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ev = EVENT_CACHE[Number(btn.dataset.idx)];
      if (!ev) return;
      const row = btn.closest(".event-row");
      const isPast = row.classList.contains("is-past");
      const dateText = ev.recurring
        ? `${ev.recurring} · next: ${ev._d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" })}`
        : eventDateLabel(ev);
      const meta = [ev.time, ev.location].filter(Boolean).map(escapeHTML).join(", ");
      const media = eventMediaHTML(ev);
      zoomOpen(row, `
        <button type="button" class="zoom-close dialog-close">Close<span class="sr-only"> event details</span></button>
        <div class="zoom-detail event-detail${media ? " has-media" : ""}${ev.campaign === "charity-week" ? " is-cw" : ""}">
          <div class="event-detail-body">
            <p class="event-date-badge" style="margin:0">${isPast ? "Past event · " : ""}${escapeHTML(dateText)}</p>
            <h2 id="zoomTitle">${escapeHTML(ev.title)}</h2>
            ${meta ? `<p class="event-meta">${meta}</p>` : ""}
            ${ev.partners ? `<p class="event-meta"><strong>With:</strong> ${escapeHTML(ev.partners)}</p>` : ""}
            ${ev.details ? `<p class="event-details-text">${escapeHTML(ev.details)}</p>` : ""}
            ${ev.tag ? `<span class="event-tag">${escapeHTML(ev.tag)}</span>` : ""}
            <div class="event-actions">${eventActionsHTML(ev, isPast)}</div>
          </div>
          ${media ? `<div class="event-detail-media">${media}</div>` : ""}
        </div>`, "zoomTitle", { wide: !!media });
      // Turn the Instagram blockquote into the real post (embed.js is loaded on this page)
      if (ev.post && window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
    });
  });
}

function renderEventsLists(events) {
  const lists = { present: document.getElementById("presentList"), upcoming: document.getElementById("upcomingList"), past: document.getElementById("pastList") };
  if (!lists.present && !lists.upcoming && !lists.past) return;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const t = today.getTime();
  const dated = events.map((e) => ({ ...e, _d: new Date(e.date.length === 10 ? e.date + "T00:00" : e.date) })).filter((e) => e.date && !isNaN(e._d));
  dated.forEach((e) => e._d.setHours(0, 0, 0, 0));
  // Past events with no exact date yet (events-data.js, when: "past") go at the end of Past
  const undatedPast = events.filter((e) => !e.date && e.when === "past");

  const groups = {
    present: dated.filter((e) => e._d.getTime() === t),
    upcoming: dated.filter((e) => e._d.getTime() > t).sort((a, b) => a._d - b._d),
    past: [...dated.filter((e) => e._d.getTime() < t).sort((a, b) => b._d - a._d), ...undatedPast],
  };
  const empty = {
    present: "Nothing on the calendar today. Check the Upcoming tab for what's next.",
    upcoming: "No upcoming events posted yet. Check back soon, or follow our Instagram.",
    past: "No past events on record yet.",
  };

  EVENT_CACHE = [];
  Object.entries(groups).forEach(([key, list]) => {
    const el = lists[key];
    if (!el) return;
    el.innerHTML = list.length
      ? `<ul class="event-list">${list.map((e) => { EVENT_CACHE.push(e); return eventRowHTML(e, key === "past", EVENT_CACHE.length - 1); }).join("")}</ul>`
      : `<p class="empty-state">${empty[key]}</p>`;
  });
  wireEventDialogs();

  // If something is on today and the visitor didn't arrive on a specific tab (#upcoming etc.), open Today first
  if (groups.present.length && !location.hash) document.getElementById("tab-present")?.click();
}

async function loadEventsForPages() {
  const ids = ["presentList", "upcomingList", "pastList"];
  if (!ids.some((id) => document.getElementById(id))) return;
  let sheet = [];
  try {
    const res = await fetch(PAGES_EVENTS_CSV_URL);
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    sheet = parseEventsCSV(await res.text());
  } catch (err) {
    // The sheet is down: hand-entered events (events-data.js) still render
    console.error("Events fetch failed:", err);
  }
  renderEventsLists(typeof mergeEvents === "function" ? mergeEvents(sheet) : sheet);
}

// ---------- Charity Week banner (Events page) ----------
function initCharityBanner() {
  const banner = document.getElementById("cwBanner");
  if (banner && typeof charityWeekActive === "function" && charityWeekActive()) banner.hidden = false;
}

// Charity Week arrow intro (decorative, aria-hidden). One card per day of Charity Week,
// timed so each card pops up as the arrow passes it.
function initCharityFlight() {
  const flight = document.getElementById("cwFlight");
  if (!flight || typeof charityWeekActive !== "function" || !charityWeekActive()) return;
  const inner = flight.querySelector(".cw-flight-inner");
  const cw = (typeof LOCAL_EVENTS !== "undefined" ? LOCAL_EVENTS : []).filter((e) => e.campaign === "charity-week");
  const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = toISO(new Date());

  const days = [];
  for (let d = new Date(CHARITY_WEEK.start + "T12:00"); toISO(d) <= CHARITY_WEEK.end; d.setDate(d.getDate() + 1)) {
    const iso = toISO(d);
    const evs = cw.filter((e) => e.date === iso);
    if (evs.length) days.push({ iso, date: new Date(d), evs });
  }
  if (!days.length) return;

  // Arrow uses cubic-bezier(0.3, 0.7, 0.4, 1) over DURATION seconds. Work out when it reaches each card.
  const DURATION = 3.4;
  const bez = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  const timeAt = (progress) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (bez(0.7, 1, mid) < progress) lo = mid; else hi = mid; }
    return bez(0.3, 0.4, lo) * DURATION;
  };

  days.forEach((day, i) => {
    const pos = days.length === 1 ? 50 : 10 + (80 * i) / (days.length - 1);
    const card = document.createElement("div");
    card.className = "cw-flight-card";
    if (day.iso === today) card.classList.add("is-today");
    else if (day.iso < today) card.classList.add("is-done");
    card.style.setProperty("--pos", pos + "%");
    card.style.setProperty("--delay", Math.max(0.1, timeAt(pos / 100) - 0.15).toFixed(2) + "s");
    const label = day.date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
    const status = day.iso === today ? '<span class="cw-flight-pill">Today</span>' : "";
    card.innerHTML = `<p class="cw-flight-day">${escapeHTML(label)}${status}</p>` +
      day.evs.map((e) => `<p class="cw-flight-title">${e.featured ? "★ " : ""}${escapeHTML(e.title)}</p>`).join("");
    inner.appendChild(card);
  });
  flight.style.setProperty("--cw-flight-duration", DURATION + "s");
  flight.hidden = false;

  // Start the flight once most of the strip is on screen, so people actually see it
  const launch = () => flight.classList.add("is-flying");
  if (!("IntersectionObserver" in window)) return launch();
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { launch(); io.disconnect(); }
  }, { threshold: 0.6 });
  io.observe(flight);
}

document.addEventListener("DOMContentLoaded", () => {
  initCharityBanner();
  initCharityFlight();
  renderTeamGrid();
  loadEventsForPages();
});
