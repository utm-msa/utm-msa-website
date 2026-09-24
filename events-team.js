/* ============================================================
   UTM MSA — About & Sagas page behaviour
   Loaded after script.js (uses escapeHTML, parseEventsCSV, zoomOpen,
   prefersReducedMotion from it). Every function checks its element
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

// ---------- Event rows (Sagas) ----------
function eventRowHTML(ev, isPast, idx) {
  const d = ev._d;
  const label = isNaN(d) ? ev.date : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const meta = [ev.time, ev.location].filter(Boolean).map(escapeHTML).join(", ");
  return `
    <li class="event-row${isPast ? " is-past" : ""}">
      <p class="event-date-badge" style="margin:0">${isPast ? '<span class="sr-only">Past event, </span>' : ""}${escapeHTML(label)}</p>
      <div>
        <h3><button type="button" class="event-open" data-idx="${idx}" aria-haspopup="dialog">${escapeHTML(ev.title)}<span class="sr-only">, open details</span></button></h3>
        <p class="event-meta" style="margin:0">${meta}</p>
      </div>
      ${ev.tag ? `<span class="event-tag">${escapeHTML(ev.tag)}</span>` : "<span></span>"}
    </li>`;
}

let EVENT_CACHE = [];

function wireEventDialogs() {
  document.querySelectorAll(".event-open").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ev = EVENT_CACHE[Number(btn.dataset.idx)];
      if (!ev) return;
      const row = btn.closest(".event-row");
      const date = row.querySelector(".event-date-badge").textContent.replace("Past event, ", "");
      const meta = [ev.time, ev.location].filter(Boolean).map(escapeHTML).join(", ");
      zoomOpen(row, `
        <button type="button" class="zoom-close dialog-close">Close<span class="sr-only"> event details</span></button>
        <div class="zoom-detail">
          <p class="event-date-badge" style="margin:0">${escapeHTML(date)}</p>
          <h2 id="zoomTitle">${escapeHTML(ev.title)}</h2>
          ${meta ? `<p class="event-meta">${meta}</p>` : ""}
          ${ev.tag ? `<span class="event-tag">${escapeHTML(ev.tag)}</span>` : ""}
        </div>`, "zoomTitle");
    });
  });
}

function renderEventsLists(events) {
  const lists = { present: document.getElementById("presentList"), upcoming: document.getElementById("upcomingList"), past: document.getElementById("pastList") };
  if (!lists.present && !lists.upcoming && !lists.past) return;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const t = today.getTime();
  const dated = events.map((e) => ({ ...e, _d: new Date(e.date.length === 10 ? e.date + "T00:00" : e.date) })).filter((e) => !isNaN(e._d));
  dated.forEach((e) => e._d.setHours(0, 0, 0, 0));

  const groups = {
    present: dated.filter((e) => e._d.getTime() === t),
    upcoming: dated.filter((e) => e._d.getTime() > t).sort((a, b) => a._d - b._d),
    past: dated.filter((e) => e._d.getTime() < t).sort((a, b) => b._d - a._d),
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
}

async function loadEventsForPages() {
  const ids = ["presentList", "upcomingList", "pastList"];
  if (!ids.some((id) => document.getElementById(id))) return;
  try {
    const res = await fetch(PAGES_EVENTS_CSV_URL);
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    renderEventsLists(parseEventsCSV(await res.text()));
  } catch (err) {
    console.error("Events fetch failed:", err);
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<p class="empty-state">Events couldn't load right now. Try refreshing, or see our <a href="https://www.instagram.com/utmmsa/">Instagram</a>.</p>`;
    });
  }
}

// ---------- Theme intro (About) ----------
// A real dialog: shows once per visit, focus goes to "Continue", Escape or the button closes it,
// and it no longer vanishes on a timer before slower readers finish.
function initThemeReveal() {
  const dlg = document.getElementById("themeReveal");
  if (!dlg) return;
  let seen = false;
  try { seen = sessionStorage.getItem("msaThemeSeen") === "1"; } catch (e) {}
  if (seen) return;

  const others = [...document.body.children].filter((el) => el !== dlg);
  const btn = document.getElementById("themeContinue");
  const close = () => {
    try { sessionStorage.setItem("msaThemeSeen", "1"); } catch (e) {}
    others.forEach((el) => el.removeAttribute("inert"));
    document.removeEventListener("keydown", onKey);
    if (prefersReducedMotion()) dlg.hidden = true;
    else { dlg.classList.add("is-leaving"); setTimeout(() => { dlg.hidden = true; }, 400); }
    document.getElementById("main")?.focus();
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
    if (e.key === "Tab") { e.preventDefault(); btn.focus(); } // only one control inside
  };

  dlg.hidden = false;
  others.forEach((el) => el.setAttribute("inert", ""));
  btn.focus();
  btn.addEventListener("click", close);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  document.addEventListener("keydown", onKey);
}

document.addEventListener("DOMContentLoaded", () => {
  renderTeamGrid();
  loadEventsForPages();
  initThemeReveal();
});
