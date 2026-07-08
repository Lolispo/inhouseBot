// Processes the raw inhousebot DB dump (site/data-src/database1.*.json) into a compact
// site/src/data/snapshot.json for the showcase. No steamids are ever emitted.
// Run: node scripts/build-data.mjs   (from the site/ dir)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'data-src');
const OUT = path.join(__dirname, '..', 'src', 'data', 'snapshot.json');

const load = (t) => JSON.parse(fs.readFileSync(path.join(SRC, `database1.${t}.json`), 'utf8'));
const users = load('users');
const ratings = load('ratings');
const matches = load('matches');
const playerMatches = load('playerMatches');
const csStats = load('CSPlayerStats');

// ---- helpers -------------------------------------------------------------
const START_MMR = 2500;
const TEST_GAMES = new Set(['test', 'test1v1']);
const isTestName = (n) => !n || n === 'Test' || /^Player \d+$/.test(n);
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

const GAME_LABELS = {
  cs: 'Counter-Strike', dota: 'Dota 2', cs1v1: 'CS 1v1', dota1v1: 'Dota 1v1',
  valorant: 'Valorant', battlerite: 'Battlerite', slapshot: 'Slapshot', trivia: 'Trivia',
};

// uid -> best display name
const nameByUid = new Map();
for (const u of users) if (u.userName && !isTestName(u.userName)) nameByUid.set(u.uid, u.userName);
const displayName = (uid, fallback) => nameByUid.get(uid) || fallback || null;

// ---- games breadth (from matches) ---------------------------------------
const gameMatchCounts = {};
for (const m of matches) {
  const g = m.gameName;
  if (!g || TEST_GAMES.has(g)) continue;
  gameMatchCounts[g] = (gameMatchCounts[g] || 0) + 1;
}
const games = Object.entries(gameMatchCounts)
  .map(([key, matches]) => ({ key, label: GAME_LABELS[key] || key, matches }))
  .sort((a, b) => b.matches - a.matches);

// ---- leaderboards (from ratings) -----------------------------------------
const leaderboards = {};
for (const r of ratings) {
  if (TEST_GAMES.has(r.gameName) || !(r.gamesPlayed > 0) || isTestName(r.userName)) continue;
  (leaderboards[r.gameName] ??= []).push({
    name: displayName(r.uid, r.userName),
    mmr: r.mmr,
    games: r.gamesPlayed,
    wins: r.wins ?? 0,
    losses: Math.max(0, r.gamesPlayed - (r.wins ?? 0)),
    winrate: r.gamesPlayed ? round((100 * (r.wins ?? 0)) / r.gamesPlayed, 1) : 0,
  });
}
for (const g of Object.keys(leaderboards)) {
  leaderboards[g].sort((a, b) => b.mmr - a.mmr || b.games - a.games);
  leaderboards[g] = leaderboards[g].slice(0, 15);
}

// ---- CS advanced stats (aggregate per player) ----------------------------
const csAgg = new Map();
for (const r of csStats) {
  if (!(r.roundsplayed > 0)) continue;
  const a = csAgg.get(r.uid) || {
    uid: r.uid, name: displayName(r.uid, r.name), matches: 0, rounds: 0,
    kills: 0, deaths: 0, assists: 0, damage: 0, hs: 0, aces: 0, multi: 0,
    entryK: 0, entryD: 0, plants: 0, defuses: 0, flashes: 0,
  };
  a.matches += 1;
  a.rounds += r.roundsplayed || 0;
  a.kills += r.kills || 0;
  a.deaths += r.deaths || 0;
  a.assists += r.assists || 0;
  a.damage += r.damage || 0;
  a.hs += r.headshot_kills || 0;
  a.aces += r['5kill_rounds'] || 0;
  a.multi += (r['3kill_rounds'] || 0) + (r['4kill_rounds'] || 0) + (r['5kill_rounds'] || 0);
  a.entryK += (r.firstkill_t || 0) + (r.firstkill_ct || 0);
  a.entryD += (r.firstdeath_t || 0) + (r.firstdeath_ct || 0);
  a.plants += r.bomb_plants || 0;
  a.defuses += r.bomb_defuses || 0;
  a.flashes += r.flashbang_assists || 0;
  csAgg.set(r.uid, a);
}
const csPlayers = [...csAgg.values()].filter((p) => p.name);
const MIN_ROUNDS = 200; // meaningful sample for rate stats
const qualified = csPlayers.filter((p) => p.rounds >= MIN_ROUNDS);
const topBy = (arr, val, extra) =>
  [...arr].sort((a, b) => val(b) - val(a)).slice(0, 10).map((p) => ({ name: p.name, matches: p.matches, ...extra(p) }));

const csLeaders = {
  minRounds: MIN_ROUNDS,
  kd: topBy(qualified, (p) => p.kills / Math.max(1, p.deaths), (p) => ({ value: round(p.kills / Math.max(1, p.deaths)), kills: p.kills, deaths: p.deaths })),
  adr: topBy(qualified, (p) => p.damage / Math.max(1, p.rounds), (p) => ({ value: round(p.damage / Math.max(1, p.rounds), 1), rounds: p.rounds })),
  hs: topBy(qualified, (p) => p.hs / Math.max(1, p.kills), (p) => ({ value: round((100 * p.hs) / Math.max(1, p.kills), 1), kills: p.kills })),
  entry: topBy(qualified, (p) => p.entryK, (p) => ({ value: p.entryK, entryDeaths: p.entryD })),
  aces: topBy(csPlayers.filter((p) => p.aces > 0), (p) => p.aces, (p) => ({ value: p.aces })),
  multi: topBy(qualified, (p) => p.multi, (p) => ({ value: p.multi })),
  bombs: topBy(csPlayers, (p) => p.plants + p.defuses, (p) => ({ value: p.plants + p.defuses, plants: p.plants, defuses: p.defuses })),
};

// ---- totals --------------------------------------------------------------
const totals = csPlayers.reduce(
  (a, p) => ({
    kills: a.kills + p.kills, deaths: a.deaths + p.deaths, damage: a.damage + p.damage,
    headshots: a.headshots + p.hs, aces: a.aces + p.aces, rounds: a.rounds + p.rounds,
    plants: a.plants + p.plants, defuses: a.defuses + p.defuses,
  }),
  { kills: 0, deaths: 0, damage: 0, headshots: 0, aces: 0, rounds: 0, plants: 0, defuses: 0 },
);
const rankedPlayers = new Set();
for (const g of Object.keys(leaderboards)) for (const p of leaderboards[g]) rankedPlayers.add(p.name);

// ---- timeline (matches per month) ----------------------------------------
const monthMap = new Map();
const validMatches = matches.filter((m) => m.gameName && !TEST_GAMES.has(m.gameName) && m.createdAt);
for (const m of validMatches) {
  const month = new Date(m.createdAt).toISOString().slice(0, 7);
  const e = monthMap.get(month) || { month, total: 0, cs: 0, dota: 0 };
  e.total += 1;
  if (m.gameName === 'cs') e.cs += 1;
  else if (m.gameName === 'dota') e.dota += 1;
  monthMap.set(month, e);
}
const timeline = [...monthMap.values()].sort((a, b) => a.month.localeCompare(b.month));

// ---- maps (CS) -----------------------------------------------------------
const mapCounts = {};
for (const m of matches) if (m.gameName === 'cs' && m.mapName) mapCounts[m.mapName] = (mapCounts[m.mapName] || 0) + 1;
const maps = Object.entries(mapCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

// ---- MMR journeys (cumulative from deltas, per game) ---------------------
const matchById = new Map(matches.map((m) => [m.mid, m]));
function journeys(gameName, topN = 6) {
  // matches of this game, chronological
  const mids = matches
    .filter((m) => m.gameName === gameName && m.createdAt)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((m) => m.mid);
  const midSet = new Set(mids);
  // per-uid ordered deltas
  const perUid = new Map();
  const pmSorted = playerMatches
    .filter((p) => midSet.has(p.mid) && p.mmrChange != null)
    .sort((a, b) => new Date(matchById.get(a.mid).createdAt) - new Date(matchById.get(b.mid).createdAt));
  for (const p of pmSorted) {
    const arr = perUid.get(p.uid) || [];
    arr.push({ date: matchById.get(p.mid).createdAt.slice(0, 10), delta: p.mmrChange });
    perUid.set(p.uid, arr);
  }
  // pick top players by final rating for this game
  const top = (leaderboards[gameName] || []).slice(0, topN).map((l) => l.name);
  const out = [];
  for (const [uid, deltas] of perUid) {
    const name = displayName(uid);
    if (!name || !top.includes(name) || deltas.length < 10) continue;
    let mmr = START_MMR;
    let points = [{ date: deltas[0].date, mmr }];
    for (const d of deltas) { mmr += d.delta; points.push({ date: d.date, mmr }); }
    // downsample to ~50 points
    if (points.length > 50) {
      const step = Math.ceil(points.length / 50);
      points = points.filter((_, i) => i % step === 0 || i === points.length - 1);
    }
    out.push({ name, games: deltas.length, final: mmr, points });
  }
  return out.sort((a, b) => b.final - a.final);
}

const snapshot = {
  meta: {
    generated: new Date().toISOString().slice(0, 10),
    spanFrom: timeline[0]?.month,
    spanTo: timeline[timeline.length - 1]?.month,
    totalMatches: validMatches.length,
    totalPlayers: rankedPlayers.size,
    csPlayers: csPlayers.length,
  },
  totals: { matches: validMatches.length, ...totals },
  games,
  leaderboards,
  csLeaders,
  timeline,
  maps,
  mmr: { cs: journeys('cs'), dota: journeys('dota') },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(snapshot));
console.log('Wrote', path.relative(process.cwd(), OUT));
console.log(JSON.stringify({
  span: `${snapshot.meta.spanFrom} → ${snapshot.meta.spanTo}`,
  matches: snapshot.meta.totalMatches, games: games.map((g) => `${g.key}:${g.matches}`).join(','),
  leaderboards: Object.fromEntries(Object.entries(leaderboards).map(([k, v]) => [k, v.length])),
  csQualified: qualified.length, mmrCurves: { cs: snapshot.mmr.cs.length, dota: snapshot.mmr.dota.length },
  totals,
}, null, 2));
