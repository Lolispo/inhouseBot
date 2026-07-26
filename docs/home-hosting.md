# Home Hosting Migration

The bot was previously hosted on an AWS EC2 instance (Ubuntu 20.04, eu-west-1) with MySQL
running on the same box. To save money it is being moved to a home **Windows 10 + WSL (Ubuntu)**
machine. The AWS instance and its volume were **terminated on 2026-07-19** after rescuing the
`.env` files and database dumps.

Config is a plain local `.env` (no AWS SSM) — see [`.env.SAMPLE`](../.env.SAMPLE).

## Status

- [x] Rescue `.env` files + DB dumps off EC2
- [x] Terminate EC2 instance + volume ($0/mo)
- [x] Auto-detect game server from env (no manual `noserver` needed) — see the Dota section in the [README](../README.md)
- [x] Home bring-up — **the bot is live**, see [Running it](#running-it) (2026-07-26)
- [x] Remote access from another PC — `ssh homeserver` lands straight in WSL Ubuntu
- [ ] Run Dota server (DotesBot) locally — **blocked on Steam credentials**, see below
- [ ] Repo housekeeping

## Running it

The bot runs on the home box as a systemd service. The box has its own conventions
(`/srv/setup/TODO.md` on the box is the source of truth for the machine itself).

| | |
|---|---|
| Host | `ssh homeserver` → port 2222 → WSL Ubuntu 24.04 on the W10 PC |
| App | `/srv/inhousebot` (`root:srv`, 2775 setgid, per the box's service pattern) |
| Service | `inhousebot.service` — enabled at boot, `Restart=on-failure` |
| Node | nvm `v22.22.1`, pinned by absolute path in the unit |
| Database | local MySQL 8.0.46, db `inhousebot`, user `inhousebot`@`localhost` |
| Config | `/srv/inhousebot/.env`, mode **600 petter** (not group-readable — see below) |
| Logs | `journalctl -u inhousebot -f` |

```bash
ssh homeserver 'systemctl status inhousebot'
ssh homeserver 'journalctl -u inhousebot -n 50 --no-pager'
ssh homeserver 'sudo systemctl restart inhousebot'
# deploy a new version:
ssh homeserver 'cd /srv/inhousebot && git pull && npm ci && npm run build && sudo systemctl restart inhousebot'
```

Two deliberate deviations from the box's `scs-units.template` pattern, both recorded in the unit itself:

- **Runs as `petter`, not `svc`.** `.env` holds a live Discord bot token. Running as `svc` would
  require the file to be group-readable, and group `srv` includes the box's other admin. Mode 600
  owned by `petter` is what keeps the token private.
- **No `EnvironmentFile=`.** The app reads `.env` itself via `dotenv`
  ([`src/tools/load-environment.ts`](../src/tools/load-environment.ts)); a second loader would only
  duplicate it.

### Database

`db.sql` in this repo is **stale scratch** — it describes an old `users` table with `mmr`/`cs`/`dota`
columns and only sketches the real schema in comments. The live schema came from restoring
[`db-backups/backup-2022-02-06.sql`](../db-backups), which matches the five sequelize models exactly.
This matters because `syncTables()` is commented out at `db_sequelize.ts:225`, so **the bot never
creates its own tables** — a restore is mandatory, not optional.

Restored and verified: 131 users, 242 ratings across 10 game modes, 473 matches, 4101 player-match
rows, 1278 CS stat lines; last match 2022-02-05. The dump needed its `GTID_PURGED` / `SQL_LOG_BIN`
lines stripped, since it came off MySQL 5.7 (RDS) and those fail on 8.0 with `gtid_mode=OFF`.

⚠️ **The database is not backed up.** The box's nightly `srv-backup` only covers `/srv`, and MySQL
data lives in `/var/lib/mysql`. RDS used to do this automatically; nothing does now. A `mysqldump`
into `/srv` on a timer would close the gap.

Also note the nightly backup tarball now contains `/srv/inhousebot/.env` (and `/srv/dotesbot/.env`),
i.e. live secrets on the Windows filesystem — the same caveat the box's TODO already records for scs.

## Future TODOs

### 1. Dota server (DotesBot) — blocked

Fully installed at `/srv/dotesbot`, but **it cannot log in to Steam**, so it is not running and
`DOTA_SERVER_URL` is deliberately left blank in `.env` (which makes Dota games auto-skip the server
rather than fail).

- **Fork ambiguity resolved:** `Xavantex/DotesBot` and `Cronvs/DotesBot` are at an identical HEAD
  (`6225ff21`, 2021-09-05). Either works; `/srv/dotesbot` came from `Cronvs`.
- **It is a Python app**, not Node: `python3 DotaWhisperer.py --port 4545 --api socket`. The 2021
  pins (`gevent==21.1.2` etc.) do not build on Python 3.12, so the venv installs them **unpinned** —
  gevent 26.7.0, steam 1.4.4, dota2 1.1.0, python-socketio 5.16.3. All imports and both clients
  construct fine. The `discord`/`quart`/`trueskill` imports live in `DotesBot.py`, a separate
  standalone bot that this entrypoint never touches.
- **The blocker:** Steam rejects the rescued credentials with `EResult.InvalidPassword` (5). The
  credentials are transmitted correctly (verified: `dotenv` parses the 14-char password intact), so
  it is either a stale password or Valve refusing legacy logon. `steam` 1.4.4 sends a legacy
  plaintext `CMsgClientLogon`; it ships the modern auth protobufs but no code path uses them.
  **Cheapest next test: log in to that Steam account in a browser to see whether the password still
  works.** Treat the rescued password as compromised and rotate it — it was exposed in a terminal
  session on 2026-07-26.
- **A local patch was needed for unattended operation** (committed on the box as `6ec66f1`, not
  pushed — the box has no GitHub credentials). Upstream called `cli_login()` on every start, and
  `SteamClient.credential_location` defaults to `None`, making `store_sentry()` a silent no-op. So
  nothing was ever cached and every start demanded a Steam Guard code on stdin — impossible under
  systemd. The patch caches the sentry *and* the login key under `~/.dotesbot-steam`, so only the
  first login is interactive.
- The unit is written but **not installed**, as `/srv/dotesbot/dotesbot.service.template`. It would
  crash-loop today. The template carries the exact steps to install it once login works. (Keeping it
  out of `/etc/systemd/system` is deliberate: the box's TODO records an inert unit there previously
  being mistaken for a live one.)
- `MASTERID` is unset in `/srv/dotesbot/.env` — it was not in the rescued file. Typing `start` to the
  bot over Steam chat will `KeyError` until a steam32 account id is filled in.

### 2. Database backups
- Nothing backs up MySQL today (see the warning above). A nightly `mysqldump` into `/srv` would ride
  along on the box's existing `srv-backup.timer`.

### 3. Repo housekeeping
- Clean up ~16 stale `origin/*` branches (history is squash-merged, so `--merged` doesn't flag them —
  triage each with `git log origin/main..origin/<branch>`).
- Consider running a local CS (get5/Dathost-style) server as a later follow-up.
- 5 Jest suites fail on `main` with `Cannot read properties of undefined (reading 'Guilds')` —
  `GatewayIntentBits` is undefined inside Jest (a CJS/ESM interop issue in the test harness, since
  the same import resolves fine at runtime and the bot boots). Pre-existing, unrelated to hosting.
  Note the suite also needs a local `.env` present or it fails earlier on `process.env.ENVIRONMENT`.
