/* ============================================================
   UTM MSA — The Musalla: live prayer times + dates
   Uses fetchPrayerTimes / findNextPrayer / prayerListHTML / to12Hour
   from script.js (loaded first), so both pages show identical,
   12-hour times. AlAdhan API, ISNA method, UTM's coordinates.
   ============================================================ */

async function loadPrayerTimes() {
  const row = document.getElementById("prayerTimesRow");
  if (!row) return;
  const hijriEl = document.getElementById("hijriDate");
  const gregEl = document.getElementById("gregDate");
  try {
    const data = await fetchPrayerTimes();
    const h = data.date.hijri;
    if (hijriEl) hijriEl.textContent = `${h.day} ${h.month.en} ${h.year} AH`;
    if (gregEl) gregEl.textContent = `(${data.date.readable})`;
    const next = findNextPrayer(data.timings);
    row.innerHTML = prayerListHTML(data.timings, next.tomorrow ? null : next.name, "Today's prayer times at UTM");
  } catch (err) {
    console.error("Prayer times fetch failed:", err);
    if (hijriEl) hijriEl.textContent = "";
    row.innerHTML = `<p class="prayer-empty">Today's prayer times couldn't load. Try refreshing, or check <a href="https://www.isnacanada.com/" target="_blank" rel="noopener">ISNA Canada's timetable<span class="sr-only"> (opens in a new tab)</span></a>.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadPrayerTimes);
