/* ============================================================
   UTM MSA — Hand-entered events (loaded BEFORE script.js)

   Why this file exists:
   The Google Sheet is still the main place to add events. This file
   holds events that need extra detail the sheet can't carry (partners,
   descriptions, links) or that must show even if the sheet fails to load,
   like Charity Week. Both sources are merged on the page; if the same
   event (same date + same title) is in both, it only shows once.

   Fields:
     date      "YYYY-MM-DD". Leave "" only for past events whose exact
               date you don't have; they show as "Earlier this fall".
     title     Event name.
     time      e.g. "4–6 PM"
     location  e.g. "UTMSU Meeting Room"
     tag       Short label shown as a pill, e.g. "Charity Week"
     partners  Optional. Who we ran it with.
     details   Optional. One or two sentences shown in the pop-up.
     link / linkLabel  Optional. A button in the pop-up (tickets, post).
     campaign  "charity-week" gives the row the Charity Week colours.
     when      "past" for undated past events (see date above).
   ============================================================ */

// Charity Week window. The homepage "at a glance" block and the Events
// page colours switch on from SHOW_FROM and switch off the day after END.
const CHARITY_WEEK = {
  name: "Charity Week 2026",
  theme: "Waves of Unity",
  start: "2026-10-21",
  end: "2026-10-25",
  showFrom: "2026-10-14",
  blurb: "Charity Week is an annual, volunteer-led campaign raising funds for orphans and vulnerable children.",
  post: "https://www.instagram.com/p/DepVwp0my83/",
};

const LOCAL_EVENTS = [
  // ---------- Charity Week 2026 (from the Week at a Glance posters) ----------
  {
    date: "2026-10-21", title: "IR x UTM MSA Game Night", time: "4–6 PM", location: "UTMSU Meeting Room",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA + Islamic Relief UTM",
    details: "Games and food to open Charity Week.",
  },
  {
    date: "2026-10-22", title: "Building Brotherhood", time: "1–3 PM", location: "UTMSU Meeting Room",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA, with the Islamic Relief drinks cart",
    details: "A brothers' gathering for Charity Week. The Islamic Relief drinks cart will be there too.",
  },
  {
    date: "2026-10-22", title: "Sisters' Chai and Chill", time: "3–5 PM", location: "UTMSU Board Room",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA + Muslims in Academia, with the Islamic Relief drinks cart",
    details: "Chai, conversation, and the Islamic Relief drinks cart.",
  },
  {
    date: "2026-10-23", title: "Sisters' Tote Bag Painting", time: "3–6 PM", location: "UTMSU Meeting Room",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA",
  },
  {
    date: "2026-10-23", title: "Brothers' FIFA Tournament", time: "4–8 PM", location: "DV 3140",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA + UTM Soccer Club",
  },
  {
    date: "2026-10-24", title: "Sisters' Hike and Picnic", time: "11 AM–2 PM", location: "Riverwood Conservancy",
    tag: "Charity Week", campaign: "charity-week", partners: "UTM MSA + Islamic Relief UTM",
  },
  {
    date: "2026-10-24", title: "Brothers' Soccer Tournament", time: "5:30–8:30 PM", location: "AZ Soccer Pro, Ridgeway Plaza",
    tag: "Charity Week", campaign: "charity-week",
    partners: "UTM MSA, Islamic Relief UTM, UTM Soccer Club, MESA, APS, NASA, and Amnesty International",
  },
  {
    date: "2026-10-25", title: "Charity Week Auction Dinner", time: "4:30–9 PM", location: "ISNA Canada Islamic Centre (gym), 2200 S Sheridan Way",
    tag: "Charity Week", campaign: "charity-week", featured: true,
    details: "The main event of Charity Week: dinner, a live auction, and every dollar going to orphans and vulnerable children.",
    link: "https://www.instagram.com/p/DekzhyTGxnj/", linkLabel: "Tickets and details on Instagram",
  },

  // ---------- Earlier this term ----------
  // REPLACE_ME (optional): add time and room if you want them shown.
  {
    date: "2026-10-15", title: "Islamic Heritage Month Exhibit", tag: "Islamic Heritage Month",
    details: "Our Islamic Heritage Month exhibit on campus.",
    link: "https://www.instagram.com/reel/DeptLl_txCs/", linkLabel: "Watch the recap on Instagram",
  },
  {
    date: "2026-09-27", title: "Frosh Field Day", tag: "Frosh",
    link: "https://www.instagram.com/reel/DeFpkkEv0H-/", linkLabel: "Watch the recap on Instagram",
  },
  {
    date: "2026-09-07", title: "Back on Track: Brothers' Scavenger Hunt", tag: "Brothers",
    link: "https://www.instagram.com/reel/DdXM700iY-G/", linkLabel: "Watch the recap on Instagram",
  },
];

// Merge sheet events with the ones above. Same date + same title = one event (this file's copy wins,
// because it carries the extra details).
function mergeEvents(sheetEvents) {
  const key = (e) => `${(e.date || "").trim()}|${(e.title || "").trim().toLowerCase()}`;
  const local = typeof LOCAL_EVENTS !== "undefined" ? LOCAL_EVENTS : [];
  const seen = new Set(local.map(key));
  return [...local, ...(sheetEvents || []).filter((e) => !seen.has(key(e)))];
}

// True while Charity Week should be shown (SHOW_FROM through END, inclusive, local time).
function charityWeekActive(now = new Date()) {
  if (typeof CHARITY_WEEK === "undefined") return false;
  const from = new Date(CHARITY_WEEK.showFrom + "T00:00");
  const until = new Date(CHARITY_WEEK.end + "T23:59:59");
  return now >= from && now <= until;
}
