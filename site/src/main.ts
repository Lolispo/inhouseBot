import './style.css';
import snapshot from './data/snapshot.json';
import { mmrJourneyChart, timelineChart, type Journey } from './charts';

// ---- types (loosely mirror snapshot.json) --------------------------------
type LadderRow = { name: string; mmr: number; games: number; wins: number; losses: number; winrate: number };
type LeadRow = { name: string; matches: number; value: number; [k: string]: number | string };
type Game = 'cs' | 'dota';
const S = snapshot as unknown as {
  meta: { generated: string; spanFrom: string; spanTo: string; totalMatches: number; totalPlayers: number; csPlayers: number };
  totals: { matches: number; kills: number; deaths: number; damage: number; headshots: number; aces: number; rounds: number; plants: number; defuses: number };
  games: { key: string; label: string; matches: number }[];
  leaderboards: Record<string, LadderRow[]>;
  csLeaders: { minRounds: number; kd: LeadRow[]; adr: LeadRow[]; hs: LeadRow[]; entry: LeadRow[]; aces: LeadRow[]; multi: LeadRow[]; bombs: LeadRow[] };
  timeline: { month: string; cs: number; dota: number; total: number }[];
  maps: { name: string; count: number }[];
  mmr: Record<Game, Journey[]>;
};

// ---- config: video URLs (drop in when available) -------------------------
const VIDEOS = {
  trailer: 'https://www.youtube-nocookie.com/embed/oSSWqhEjmdI',
  kosa: [
    { title: 'CS highlights #18', url: 'https://www.youtube-nocookie.com/embed/kAzvjTpX7_k' },
    { title: 'CS highlights #17', url: 'https://www.youtube-nocookie.com/embed/Hn1bDATRycQ' },
    { title: 'CS highlights #16', url: 'https://www.youtube-nocookie.com/embed/LEBHgXcEFaQ' },
  ] as { title: string; url: string }[],
};

const $ = <T extends Element>(sel: string) => document.querySelector<T>(sel)!;
const fmt = (n: number) => n.toLocaleString('en-US');
const compact = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : fmt(n));
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const el = (id: string) => document.getElementById(id)!;

// ---- hero ticker ---------------------------------------------------------
const spanYears = ((new Date(S.meta.spanTo + '-01').getTime() - new Date(S.meta.spanFrom + '-01').getTime()) / 3.156e10).toFixed(1);
el('ticker').innerHTML = [
  ['Matches played', fmt(S.totals.matches)],
  ['Players ranked', fmt(S.meta.csPlayers)],
  ['Kills tracked', `<b>${fmt(S.totals.kills)}</b>`],
  ['Years running', spanYears],
].map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`).join('');

// ---- features ------------------------------------------------------------
const FEATURES: { cmd: string; title: string; body: string; media?: string; tag?: string; wide?: boolean }[] = [
  { cmd: '-balance', title: 'Balanced teams, instantly', body: 'It reads everyone sitting in your voice channel and builds the two closest-rated teams it can — 4v4 up to 7v7. No captains, no picking order, no arguments.' },
  { cmd: '-stats', title: 'MMR that actually moves', body: 'Every player carries a rating in each game. How much you gain depends on how lopsided the match was, so beating a stacked team is worth more than farming an easy one.' },
  { cmd: 'get5 · dathost', title: 'Real CS stats, ingested', body: 'Point it at a get5 / Dathost server and every kill, headshot, entry frag and bomb plant lands in the ladder the second the match ends.', tag: 'Counter-Strike' },
  { cmd: '-mapveto', title: 'A proper map veto', body: 'Run the competitive ban/pick veto right in Discord before you load in.', tag: 'Counter-Strike' },
  { cmd: 'socket connect', title: 'Dota, wired in', body: 'Opens a socket to a companion match-making app to create games and pull results back into the same rating system.', media: '/dotaConnect.gif', wide: true },
  { cmd: '-link steam', title: 'Linked once, tracked forever', body: 'Players connect their Steam profile a single time; from then on in-game stats attach to the right person automatically.', media: '/fetchProfileUrl.gif', wide: true },
  { cmd: '-split / -unite', title: 'Move the lobby for them', body: 'Throws each team into its own voice channel for the game, then pulls everyone back together the moment it is over.' },
  { cmd: '-trivia', title: 'A trivia ladder too', body: '20+ topics, live hints and a scoreboard — a ranked trivia mode for the downtime between matches.' },
];
el('features-grid').innerHTML = FEATURES.map((f) => `
  <article class="feature${f.wide ? ' feature--wide' : ''}">
    <p class="feature__cmd">${esc(f.cmd)}</p>
    <h3 class="feature__title">${esc(f.title)}${f.tag ? `<span class="feature__tag">${esc(f.tag)}</span>` : ''}</h3>
    <p class="feature__body">${esc(f.body)}</p>
    ${f.media ? `<div class="feature__media"><img src="${f.media}" alt="${esc(f.title)} demo" loading="lazy" /></div>` : ''}
  </article>`).join('');

// ---- numbers: sub + stat strip -------------------------------------------
const monthName = (m: string) => new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
el('numbers-sub').textContent = `${monthName(S.meta.spanFrom)} → ${monthName(S.meta.spanTo)}. Everything below is pulled straight from the bot's own database.`;

el('statstrip').innerHTML = [
  ['Matches', fmt(S.totals.matches)],
  ['Rounds of CS', fmt(S.totals.rounds)],
  ['Kills', fmt(S.totals.kills)],
  ['Damage dealt', compact(S.totals.damage)],
  ['Headshots', fmt(S.totals.headshots)],
  ['Aces', fmt(S.totals.aces)],
  ['Bombs planted', fmt(S.totals.plants)],
].map(([label, num]) => `<div class="stat"><div class="stat__num">${num}</div><div class="stat__label">${label}</div></div>`).join('');

// ---- ladder + cs stat leaders (game-dependent) ---------------------------
function renderLadder(game: Game) {
  const rows = S.leaderboards[game] || [];
  el('ladder-tag').textContent = `top ${rows.length} · by mmr`;
  el('ladder').innerHTML = `<div class="board"><table>
    <thead><tr><th>#</th><th>Player</th><th>MMR</th><th>W</th><th>L</th><th>Win%</th></tr></thead>
    <tbody>${rows.map((r, i) => `
      <tr class="top${i + 1}">
        <td class="rank">${i + 1}</td>
        <td class="name">${esc(r.name)}</td>
        <td><span class="mmr">${r.mmr}</span></td>
        <td>${r.wins}</td><td>${r.losses}</td>
        <td class="wr">${r.winrate}%</td>
      </tr>`).join('')}</tbody></table></div>`;
}

const CS_LEAD_DEFS: { key: keyof typeof S.csLeaders; title: string; unit?: string }[] = [
  { key: 'kd', title: 'K/D ratio' },
  { key: 'adr', title: 'Damage / round' },
  { key: 'hs', title: 'Headshot %', unit: '%' },
  { key: 'entry', title: 'Entry kills' },
  { key: 'multi', title: '3K+ rounds' },
  { key: 'aces', title: 'Aces (5K)' },
];
function renderCsLeaders() {
  el('csleaders-tag').textContent = `min ${S.csLeaders.minRounds} rounds`;
  el('csleaders').innerHTML = CS_LEAD_DEFS.map((d) => {
    const list = (S.csLeaders[d.key] as LeadRow[]).slice(0, 5);
    return `<div class="lead"><p class="lead__title">${d.title}</p>${list.map((r, i) => `
      <div class="lead__row"><span class="lead__rank">${i + 1}</span><span class="lead__name">${esc(r.name)}</span><span class="lead__val">${r.value}${d.unit || ''}</span></div>`).join('')}</div>`;
  }).join('');
}

// ---- maps ----------------------------------------------------------------
function renderMaps() {
  const max = Math.max(...S.maps.map((m) => m.count));
  el('maps').innerHTML = `<div class="bars">${S.maps.map((m) => `
    <div class="bar"><span class="bar__name">${esc(m.name)}</span>
      <span class="bar__track"><span class="bar__fill" style="width:${(m.count / max) * 100}%"></span></span>
      <span class="bar__val">${m.count}</span></div>`).join('')}</div>`;
}

// ---- charts --------------------------------------------------------------
function renderMmr(game: Game) { el('mmr-chart').innerHTML = mmrJourneyChart(S.mmr[game]); }
el('timeline').innerHTML = timelineChart(S.timeline);

// ---- breadth -------------------------------------------------------------
const extraGames = S.games.filter((g) => g.key !== 'cs' && g.key !== 'dota');
const triviaCount = (S.leaderboards.trivia || []).length;
el('breadth').innerHTML = [
  ...extraGames.map((g) => `<li>${esc(g.label)}<b>${g.matches}</b></li>`),
  triviaCount ? `<li>Trivia<b>${triviaCount}</b></li>` : '',
].join('');

// ---- tech: stack + diagram -----------------------------------------------
const STACK = ['Node.js', 'TypeScript', 'discord.js 14', 'Sequelize', 'MySQL', 'get5', 'Socket.IO', 'SteamID', 'Jest', 'AWS RDS'];
el('stack').innerHTML = STACK.map((s) => `<li>${s}</li>`).join('');

el('diagram').innerHTML = `<svg viewBox="0 0 320 260" role="img" aria-label="Architecture: Discord and game servers connect to the bot, which persists to MySQL">
  ${boxSvg(110, 10, 100, 40, 'Discord', 'voice + commands', 'var(--ink)')}
  ${boxSvg(90, 105, 140, 50, 'inhouseBot', 'Node · TypeScript', 'var(--accent)')}
  ${boxSvg(88, 210, 144, 40, 'MySQL', 'players · matches · stats', 'var(--ink)')}
  ${boxSvg(0, 105, 78, 50, 'CS server', 'get5 / Dathost', '#F0B429')}
  ${boxSvg(242, 105, 78, 50, 'Dota app', 'socket', '#E4483B')}
  ${arrow(160, 50, 160, 105)}
  ${arrow(160, 155, 160, 210)}
  ${arrow(78, 130, 90, 130)}
  ${arrow(242, 130, 230, 130)}
</svg>`;

function boxSvg(x: number, y: number, w: number, h: number, title: string, sub: string, stroke: string) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="var(--bg-2)" stroke="${stroke}" stroke-width="1.4"/>
    <text x="${x + w / 2}" y="${y + h / 2 - 3}" fill="var(--ink)" font-size="12" font-weight="600" font-family="Chakra Petch, sans-serif" text-anchor="middle">${title}</text>
    <text x="${x + w / 2}" y="${y + h / 2 + 12}" fill="var(--steel)" font-size="8" font-family="IBM Plex Mono, monospace" text-anchor="middle">${sub}</text>
  </g>`;
}
function arrow(x1: number, y1: number, x2: number, y2: number) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--steel-dim)" stroke-width="1.4" marker-end="url(#ah)"/>`;
}
// inject arrowhead marker once
$('#diagram svg').insertAdjacentHTML('afterbegin',
  '<defs><marker id="ah" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6z" fill="var(--steel)"/></marker></defs>');

// ---- community videos ----------------------------------------------------
el('videos').innerHTML = (VIDEOS.kosa.length
  ? VIDEOS.kosa.map((v) => videoFrame(v.title, v.url))
  : ['Match VOD', 'Cast highlight', 'Season recap'].map((t) => videoFrame(t, ''))
).join('');

function videoFrame(title: string, url: string): string {
  return `<figure class="broadcast" data-video="${url ? 'set' : 'placeholder'}">
    <div class="broadcast__screen">
      <span class="broadcast__badge">${esc(title)}</span>
      ${url
        ? `<iframe src="${esc(url)}" title="${esc(title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
        : `<button class="broadcast__play" type="button" aria-label="${esc(title)} — coming soon"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button><p class="broadcast__note">Coming soon</p>`}
    </div>
    <figcaption class="broadcast__bar"><span class="dot"></span> ${esc(title)}</figcaption>
  </figure>`;
}

// ---- hero trailer wiring -------------------------------------------------
const heroFrame = $<HTMLElement>('.hero .broadcast');
const heroPlay = heroFrame.querySelector<HTMLButtonElement>('.broadcast__play');
const heroNote = heroFrame.querySelector<HTMLElement>('.broadcast__note');
if (heroNote) heroNote.textContent = VIDEOS.trailer ? 'Watch the Season 2 trailer' : 'Trailer link coming soon';
heroPlay?.addEventListener('click', () => {
  if (!VIDEOS.trailer) return;
  const screen = heroFrame.querySelector('.broadcast__screen')!;
  screen.innerHTML = `<iframe src="${VIDEOS.trailer}${VIDEOS.trailer.includes('?') ? '&' : '?'}autoplay=1" title="Season 2 trailer" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
});

// ---- game switch ---------------------------------------------------------
function setGame(game: Game) {
  document.body.dataset.game = game;
  document.querySelectorAll<HTMLButtonElement>('.gameswitch__btn').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.switch === game));
  renderLadder(game);
  renderMmr(game);
}
document.querySelectorAll<HTMLButtonElement>('.gameswitch__btn').forEach((b) =>
  b.addEventListener('click', () => setGame(b.dataset.switch as Game)));

// ---- footer + first paint ------------------------------------------------
el('footer-generated').textContent = `data snapshot · ${S.meta.generated}`;
renderCsLeaders();
renderMaps();
setGame('cs');

// ---- scroll reveal -------------------------------------------------------
const revealTargets = document.querySelectorAll('.section__head, .feature, .panel, .statstrip, .breadth, .tech__notes');
const revealAll = () => revealTargets.forEach((n) => n.classList.add('is-in'));
if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealAll();
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach((n) => { n.classList.add('reveal'); io.observe(n); });
  // Safety net: never let content stay hidden if the observer misfires.
  setTimeout(revealAll, 2500);
}
