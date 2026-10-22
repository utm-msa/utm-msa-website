/* ============================================================
   UTM MSA — Hand-entered events (loaded BEFORE script.js)

   Why this file exists:
   The Google Sheet is still the main place to add events. This file
   holds events that need extra detail the sheet can't carry (partners,
   descriptions, posts, posters) or that must show even if the sheet fails
   to load, like Charity Week. Both sources are merged on the page; if the
   same event is in both (same date, and one title starts with the other),
   it only shows once and this file's copy wins.

   Fields:
     date      "YYYY-MM-DD"
     title     Event name.
     time      e.g. "4–6 PM"
     location  e.g. "UTMSU Meeting Room"
     tag       Short label shown as a pill, e.g. "Charity Week"
     partners  Optional. Who we ran it with.
     details   Optional. A sentence or two shown in the pop-up.
     post      Optional. Instagram post or reel URL. Shown inside the pop-up.
     image     Optional. A poster image file, shown in the pop-up when there's
               no post (or if Instagram can't load). Add imageAlt with it.
     register  Optional. Registration or ticket link. If set, the pop-up's main
               button is "Register" and goes straight there. If not, the main
               button goes to the Instagram post (or @utmmsa).
     registerLabel  Optional. Button text instead of "Register", e.g. "Get tickets".
     campaign  "charity-week" gives the row the Charity Week colours.

   Sheet columns (Google Sheet, in this order):
     A Date | B Title | C Time | D Location | E Tag | F Registration link | G Instagram post | H Details
   F to H are optional. Leave them blank and nothing changes.
   Put "Weekly" in the Tag column for something that repeats every week
   (like Jumu'ah): it shows as "Every Friday" with its next date, never in Past.
   ============================================================ */

// Charity Week window. The homepage "at a glance" block and the Events
// page colours switch on from showFrom and switch off the day after end.
const CHARITY_WEEK = {
  name: "Charity Week 2026",
  theme: "Waves of Unity",
  start: "2026-10-21",
  end: "2026-10-25",
  showFrom: "2026-10-14",
  blurb: "Charity Week is an annual, volunteer-led campaign raising funds for orphans and vulnerable children.",
  post: "https://www.instagram.com/p/DepVwp0my83/",
};

const INSTAGRAM_PROFILE = "https://www.instagram.com/utmmsa/";

// Sheet events to leave off the site, by title (not case-sensitive).
// Easier than deleting the row if you might want it back.
const HIDDEN_EVENTS = ["MIMC"];

// Week at a Glance posters (from Marketing), used as the picture in each Charity Week pop-up
const CW_POSTER_1 = { image: "cw-week-glance-1.jpg", imageAlt: "Charity Week, Week at a Glance poster: Wednesday October 21 and Thursday October 22" };
const CW_POSTER_2 = { image: "cw-week-glance-2.jpg", imageAlt: "Charity Week, Week at a Glance poster: Friday October 23 to Sunday October 25" };

const LOCAL_EVENTS = [
  // ---------- Charity Week 2026 (from the Week at a Glance posters) ----------
  // Sign-ups (from the Linktree): Auction Dinner, FIFA, Soccer. The rest have no sign-up.
  // REPLACE_ME: each event's own Instagram post, as post: "https://www.instagram.com/p/..."
  {
    date: "2026-10-21", title: "IR x UTM MSA Game Night", time: "4–6 PM", location: "UTMSU Meeting Room",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA + Islamic Relief UTM",
    details: "Games and food to open Charity Week.", ...CW_POSTER_1,
  },
  {
    date: "2026-10-22", title: "Building Brotherhood", time: "1–3 PM", location: "UTMSU Meeting Room",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA, with the Islamic Relief drinks cart",
    details: "A brothers' gathering for Charity Week. The Islamic Relief drinks cart will be there too.", ...CW_POSTER_1,
  },
  {
    date: "2026-10-22", title: "Sisters' Chai and Chill", time: "3–5 PM", location: "UTMSU Board Room",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA + Muslims in Academia, with the Islamic Relief drinks cart",
    details: "Chai, conversation, and the Islamic Relief drinks cart.", ...CW_POSTER_1,
  },
  {
    date: "2026-10-23", title: "Sisters' Tote Bag Painting", time: "3–6 PM", location: "UTMSU Meeting Room",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA",
    details: "Paint your own tote bag with the sisters for Charity Week.", ...CW_POSTER_2,
  },
  {
    date: "2026-10-23", title: "Brothers' FIFA Tournament", time: "4–8 PM", location: "DV 3140",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA + UTM Soccer Club",
    details: "A brothers' FIFA tournament for Charity Week.", ...CW_POSTER_2,
    register: "https://tr.ee/4VCXEA93Qe",
  },
  {
    date: "2026-10-24", title: "Sisters' Hike and Picnic", time: "11 AM–2 PM", location: "Riverwood Conservancy",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA + Islamic Relief UTM",
    details: "A morning hike and picnic at Riverwood Conservancy.", ...CW_POSTER_2,
  },
  {
    date: "2026-10-24", title: "Brothers' Soccer Tournament", time: "5:30–8:30 PM", location: "AZ Soccer Pro, Ridgeway Plaza",
    tag: "Charity Week", campaign: "charity-week",
    partners: "UTM MSA, Islamic Relief UTM, UTM Soccer Club, MESA, APS, NASA, and Amnesty International",
    details: "A brothers' soccer tournament with clubs from across campus.", ...CW_POSTER_2,
    register: "https://tr.ee/C4hU0ymzM8",
  },
  {
    date: "2026-10-25", title: "Charity Week Auction Dinner", time: "4:30–9 PM", location: "ISNA Canada Islamic Centre (gym), 2200 S Sheridan Way",
    tag: "Charity Week", campaign: "charity-week", featured: true,
    details: "The main event of Charity Week: dinner, a live auction, and every dollar going to orphans and vulnerable children.",
    post: "https://www.instagram.com/p/DekzhyTGxnj/", ...CW_POSTER_2,
    register: "https://tr.ee/mMuxnOC9Ka", registerLabel: "Get tickets",
  },

  // ---------- Earlier this term ----------
  {
    date: "2026-10-15", title: "Islamic Heritage Month Exhibit", tag: "Islamic Heritage Month",
    details: "Our Islamic Heritage Month exhibit on campus.",
    post: "https://www.instagram.com/reel/DeptLl_txCs/",
  },
  {
    date: "2026-09-27", title: "Frosh Field Day", tag: "Frosh",
    post: "https://www.instagram.com/reel/DeFpkkEv0H-/",
  },
  {
    // Replaces the sheet's "Back on Track" row for the same day
    date: "2026-09-07", title: "Back on Track: Brothers' Scavenger Hunt", time: "1–4 PM", location: "IB 140", tag: "Brothers",
    post: "https://www.instagram.com/reel/DdXM700iY-G/",
  },
];

const _isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Weekly events (Tag = "Weekly"): move the date forward to the next time it happens,
// so it shows under Today / Upcoming as "Every <day>" and never sits in Past.
function expandWeekly(ev, now = new Date()) {
  if (!/weekly/i.test(ev.tag || "") || !ev.date) return ev;
  const first = new Date(ev.date.length === 10 ? ev.date + "T00:00" : ev.date);
  if (isNaN(first)) return ev;
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const next = new Date(today);
  next.setDate(today.getDate() + ((first.getDay() - today.getDay() + 7) % 7));
  const day = first.toLocaleDateString("en-CA", { weekday: "long" });
  return { ...ev, date: _isoDay(next < first ? first : next), recurring: `Every ${day}` };
}

// Merge sheet events with the ones above.
// - Hidden titles (HIDDEN_EVENTS) are dropped.
// - Same date and one title starts with the other = one event (this file's copy wins).
// - Weekly events roll forward to their next date.
function mergeEvents(sheetEvents) {
  const norm = (t) => (t || "").trim().toLowerCase();
  const local = typeof LOCAL_EVENTS !== "undefined" ? LOCAL_EVENTS : [];
  const hidden = (typeof HIDDEN_EVENTS !== "undefined" ? HIDDEN_EVENTS : []).map(norm);
  const dup = (e) => local.some((l) => l.date === (e.date || "").trim() &&
    (norm(l.title).startsWith(norm(e.title)) || norm(e.title).startsWith(norm(l.title))));
  const sheet = (sheetEvents || []).filter((e) => !hidden.includes(norm(e.title)) && !dup(e));
  return [...local, ...sheet].map((e) => expandWeekly(e));
}

// True while Charity Week should be shown (showFrom through end, inclusive, local time).
function charityWeekActive(now = new Date()) {
  if (typeof CHARITY_WEEK === "undefined") return false;
  const from = new Date(CHARITY_WEEK.showFrom + "T00:00");
  const until = new Date(CHARITY_WEEK.end + "T23:59:59");
  return now >= from && now <= until;
}
