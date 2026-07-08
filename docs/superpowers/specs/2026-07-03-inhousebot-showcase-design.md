# inhousebot Showcase Page — Design

**Date:** 2026-07-03
**Goal:** A polished static showcase site for the inhousebot project, hosted at
`inhousebot.petterbuilds.com`, showing off what the bot is, what it does, and the
scale of what was built — with a light "come play" path into the Kosa Tupp community.

---

## 1. Purpose & audience

Portfolio-leaning showcase. Primary reader: someone browsing petterbuilds.com
(recruiter, collaborator, curious dev) who should come away thinking *"this is a
serious, well-built project."* Secondary: a gamer who lands here and thinks *"I want
to play in this."* So: impressive craft first, with a clear but non-pushy join/links
path.

Not in scope: selling the bot as a self-host product, live/interactive bot control,
or a full docs site. (YAGNI — this is a showcase, not a product page.)

## 2. Deliverable & hosting

- A new **`site/`** folder inside the `inhousebot` repo, self-contained, with its own
  `package.json` and build. Emits a static `dist/`.
- Deployed to **`inhousebot.petterbuilds.com`** using the existing web-platform
  convention (`app-id = inhousebot`):
  ```bash
  cd site && npm run build
  AWS_PROFILE=private ~/HobbyProjects/web-platform/scripts/deploy-app.sh inhousebot site/dist
  ```
  We never point the deploy at the repo root (it holds `cfg/`, `db.sql`, secrets).
- Registered as a card on the hub by adding one entry to
  `web-platform/landing/apps.json` and redeploying the landing manifest. (Done as a
  final step, in the web-platform repo — a separate commit there.)

## 3. Tech stack

**Vite + vanilla TypeScript + CSS.** No framework.

- Rationale: the page is mostly static content with a few interactive bits (video
  embeds, a couple of charts, tabbed CS/Dota views). Vanilla TS keeps the bundle tiny
  and matches the "small static app" ethos of petterbuilds; React would be overkill.
- Charts: a single lightweight lib chosen at build-plan time (leaning **uPlot** or
  hand-rolled SVG for MMR-progression + bar charts — small, no heavy deps). Decided in
  the implementation plan, not here.
- Node 22 available locally; Vite build outputs to `site/dist/`.

## 4. Site structure (single scrolling page + sticky nav)

1. **Hero** — inhousebot logo (`res/inhousebot.png`), one-line pitch
   ("Make your own inhouse league — CS & Dota, with real matchmaking"), and the
   **Season 2 trailer** as the hero video. CTA buttons: *Watch trailer*, *See the tech*.
   *(Trailer URL pending — placeholder embed until provided.)*
2. **What it does — feature tour.** Cards / alternating rows for the headline
   capabilities, each with a short blurb and a visual where we have one:
   - Team balancing (up to 7v7) from whoever's in voice
   - Per-player MMR & rating, per mode (cs, cs1v1, dota, dota1v1, trivia)
   - **CS integration** via get5/Dathost — pulls real in-game performance & results
   - **Dota integration** over socket to a match-making app — use `res/dotaConnect.gif`
   - Steam profile linking — use `res/fetchProfileUrl.gif`
   - Map veto, 1v1 duels, trivia game
3. **By the numbers — data/stats section.** The centerpiece. Driven by a baked static
   snapshot (see §5) built from the **real data** (extracted 2026-07-03 from RDS
   snapshot `db-2024-03-03`; 2020-06 → 2023-12). CS/Dota tabbed, with a breadth strip
   for the other games. Includes:
   - Headline aggregates: 535 matches, 138 players, ~33k kills, 3.69M damage, 12,979
     headshots, 50 aces, 2,440 bomb plants; 3.5-year span.
   - Leaderboard (top MMR holders per mode) from `ratings` (games/wins → win rate).
   - CS advanced stats leaderboards from `CSPlayerStats` (K/D, ADR-ish, entry frags,
     clutch/multi-kill rounds, bomb plants/defuses).
   - An MMR-progression / activity chart over the 3.5-year timeline.
   - Map-play distribution (Inferno, Overpass, Mirage, Vertigo, + 6 more).
   - A "…and more" breadth strip: the community also ran Valorant, Battlerite,
     Slapshot, CS 1v1, and trivia ladders.
4. **From the community — Kosa Tupp.** Embedded Kosa Tupp YouTube highlights + a link
   to KosaTupp.se. *(Video URLs pending — placeholder grid until provided.)*
5. **The tech / what we built.** Short, portfolio-facing: stack (Node + TS,
   discord.js 14, Sequelize/MySQL, get5 socket + Dota socket integrations), a simple
   architecture diagram (Discord ⇄ bot ⇄ MySQL, CS server ⇄ get5, Dota app ⇄ socket),
   authors (Petter Andersson, Robert Wörlund), link to the GitHub repo.
6. **Footer / join.** Links: GitHub, Kosa Tupp, petterbuilds hub. Light "want to
   play?" nudge.

## 5. Data pipeline (schema → snapshot → site)

The bot's data lives in a **MySQL** database, not S3. Real schema (from
`src/database/db_sequelize.ts`):

- `users(uid, userName, steamid, cs, cs1v1, dota, dota1v1, trivia, gamesPlayed)`
- `ratings(uid, gameName, userName, mmr, gamesPlayed, wins)`
- `matches(mid, gameName, result, team1Name, team2Name, mapName, score)`
- `playerMatches(mid, uid, team, mmrChange)`
- `CSPlayerStats(mid, uid, team, name, roundsplayed, kills, deaths, assists, damage,
  headshot_kills, 1..5kill_rounds, tradekill, firstkill/​firstdeath_t/ct, bomb_plants,
  bomb_defuses, flashbang_assists)`

**Pipeline design:**
1. A small Node script `site/scripts/build-data.ts` reads a raw export (mysqldump SQL,
   or CSV/JSON per table) from a configurable input path.
2. It computes the aggregates/leaderboards/series the site needs and writes a compact
   **`site/src/data/snapshot.json`** (committed). The site imports only this snapshot —
   never raw personal data. **Player names/steamids anonymizable via a flag** (display
   handles only; no steamids shipped) — default on for privacy.
3. The site renders purely from `snapshot.json`, so it works offline and needs no live
   DB or S3 at serve time.

**Data source RESOLVED (2026-07-03).** The data was extracted from RDS snapshot
`db-2024-03-03` (restored to a temp instance, dumped via `mysql2`, torn down). Raw
per-table JSON now exists in scratchpad. Real DB name is `database1`. Data-quality
handling in the build script: drop `test`/placeholder rows (gameName `test`/`test1v1`,
userName `Test`/`Player 0`); use the `ratings` table (not the unreliable
`users.gamesPlayed`) for per-game games/wins; losses ≈ games − wins; early-2020 matches
have null map/score (legacy). Steamids never shipped; display names shown for
leaderboards (community handles).

## 6. Visual direction

Dark esports aesthetic. Dual accent tied to the two games — a CS gold/orange and a
Dota red — used to tint the respective tabs/sections, over a near-black background with
one clean geometric sans for headings. Restrained motion (subtle reveal on scroll,
hover states); nothing that reads as templated. Fully responsive; wide tables/charts
scroll within their own container. Design system nailed down in the implementation plan.

## 7. Assets

- In-repo now: `res/inhousebot.png` (logo/hero), `res/dotaConnect.gif`,
  `res/fetchProfileUrl.gif` (feature tour). Copied into `site/` at build.
- Pending from user: Season 2 trailer URL, Kosa Tupp video URLs. Placeholders until then.

## 8. Open dependencies (do not block scaffolding)

1. ~~Real stats data~~ — **RESOLVED 2026-07-03** (extracted from RDS `db-2024-03-03`).
2. **Video URLs** — Season 2 trailer + Kosa Tupp highlights (placeholders until provided).

## 9. Success criteria

- `inhousebot.petterbuilds.com` loads a fast, responsive, single-page showcase.
- A visitor understands what the bot is and the breadth of what was built within ~15s.
- The data section renders real (or realistic-placeholder) leaderboards & charts for
  both CS and Dota.
- Deploys via the standard web-platform script; appears as a card on the hub.
- No personal/raw data (steamids, etc.) shipped in the bundle.
