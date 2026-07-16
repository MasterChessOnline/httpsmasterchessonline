// Fetch live stats from MasterChess public stats endpoint.
// Fails silently — popup still works without the numbers.

const STATS_URL = "https://masterchess.live/functions/v1/public-stats";

async function loadStats() {
  try {
    const res = await fetch(STATS_URL, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const liveEl = document.getElementById("live-count");
    const nextEl = document.getElementById("next-tourney");
    if (liveEl && typeof data.liveGames === "number") {
      liveEl.textContent = data.liveGames.toString();
    }
    if (nextEl && data.nextTournamentAt) {
      const diff = new Date(data.nextTournamentAt).getTime() - Date.now();
      if (diff > 0) {
        const h = Math.floor(diff / 3_600_000);
        const m = Math.floor((diff % 3_600_000) / 60_000);
        nextEl.textContent = h >= 24 ? `in ${Math.floor(h / 24)}d` : h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
      } else {
        nextEl.textContent = "live now";
      }
    }
  } catch (_) {
    /* silent */
  }
}

loadStats();
