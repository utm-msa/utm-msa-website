/* ============================================================
   UTM MSA — The Musalla: live prayer times + Hijri date
   Uses the free AlAdhan API (no key required), calculated for
   UTM's coordinates using the ISNA method (method=2), which is
   what most Mississauga-area masjids print their timetables by.
   ============================================================ */

const UTM_LAT = 43.5461;
const UTM_LNG = -79.6633;

const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

async function loadPrayerTimes() {
  const row = document.getElementById("prayerTimesRow");
  const hijriEl = document.getElementById("hijriDate");
  const gregEl = document.getElementById("gregDate");
  if (!row) return; // not on a page with the widget

  try {
    const ts = Math.floor(Date.now() / 1000);
    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${ts}?latitude=${UTM_LAT}&longitude=${UTM_LNG}&method=2`
    );
    const json = await res.json();
    const timings = json.data.timings;
    const hijri = json.data.date.hijri;
    const greg = json.data.date.readable;

    if (hijriEl) {
      hijriEl.textContent = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
    }
    if (gregEl) {
      gregEl.textContent = greg;
    }

    row.innerHTML = PRAYER_ORDER.map((name) => {
      const raw = (timings[name] || "").split(" ")[0]; // strip timezone suffix
      return `
        <div class="musalla-time-cell">
          <span class="musalla-time-label">${name}</span>
          <span class="musalla-time-value">${raw}</span>
        </div>
      `;
    }).join("");
  } catch (err) {
    row.innerHTML = `<div class="musalla-time-empty">Couldn't load today's prayer times — try refreshing.</div>`;
    console.error("Prayer times fetch failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadPrayerTimes);
