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
- [x] Nightly database dumps into `/srv`, with a verified restore (2026-07-26)
- [x] MySQL moved into a Docker container; host `mysql.service` masked (2026-07-29)
- [ ] Run Dota server (DotesBot) locally — **blocked on Steam credentials**, see below
- [ ] Repo housekeeping

## Running it

The bot runs on the home box as a systemd service. The box has its own conventions
(`/srv/setup/TODO.md` on the box is the source of truth for the machine itself).

| | |
|---|---|
| Host | `ssh homeserver` → port 2222 → WSL Ubuntu 24.04 on the W10 PC |
| App | `/srv/inhousebot` (`root:srv`, 2775 setgid, per the box's service pattern) |
| Service | `inhousebot.service` — enabled at boot, `Restart=on-failure`, `Requires=docker.service` |
| Node | nvm `v22.22.1`, pinned by absolute path in the unit |
| Database | MySQL 8.0.46 **in a container** — `inhousebot-mysql`, compose at `/srv/inhousebot/docker-compose.yml`, datadir `/srv/inhousebot/data/mysql`. Host `mysql.service` is **masked** |
| Config | `/srv/inhousebot/.env`, mode **600 petter** (not group-readable — see below) |
| Logs | `journalctl -u inhousebot -f` |

```bash
ssh homeserver 'systemctl status inhousebot'
ssh homeserver 'journalctl -u inhousebot -n 50 --no-pager'
ssh homeserver 'sudo systemctl restart inhousebot'
# deploy a new version:
ssh homeserver 'cd /srv/inhousebot && git pull && npm ci && npm run build && sudo systemctl restart inhousebot'
# the database (see below — it is a container, not a host service):
ssh homeserver 'docker ps --filter name=inhousebot-mysql'
ssh homeserver 'docker logs --tail 50 inhousebot-mysql'
ssh homeserver 'docker compose -f /srv/inhousebot/docker-compose.yml restart'
```

### Closing the Ubuntu window is safe — rebooting is not

`/etc/wsl.conf` sets `systemd=true`, so **systemd is PID 1 inside the distro** and keeps it alive
after the last shell exits. Closing the Ubuntu terminal on the PC closes only that shell: the bot,
its MySQL container and sshd keep running, which is why `ssh homeserver` works with no window open.
Nothing runs
in tmux — services are systemd units, and the box's own guidance is to never host a service in tmux,
since it would die with its session.

⚠️ **What does stop the bot is a Windows reboot or shutdown.** WSL does not start on its own, and
`systemctl enable` only decides what happens once systemd starts. The Windows Startup folder is
currently **empty** (verified 2026-07-26), so after a reboot the bot stays down until someone opens
an Ubuntu window. Closing that gap is step 15 of the box's runbook (`/srv/setup/TODO.md`) and is
still open: a shortcut in `shell:startup` running `wsl.exe -d Ubuntu -e true`, or a Task Scheduler
task at system startup to also cover "nobody logged in". Only `wsl --shutdown` and a PC
reboot/shutdown take the distro down.

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

### MySQL runs in a container (2026-07-29)

Moved off the host `mysql.service` for consistency with the box's direction — Docker is planned as
the default runtime (`web-platform/docs/superpowers/specs/2026-07-27-home-server-docker-design.md`).
Only the **database** moved: the bot itself stays a native systemd unit on purpose, because
containerizing the Node process would put an image rebuild and `docker logs` between a human and
every debug session, which isn't worth it for a service that gets edited by hand.

`docker-compose.yml` lives at `/srv/inhousebot/docker-compose.yml` and is **not** in this repo — it
is box-local and git-excluded via `.git/info/exclude`, matching the `docker-compose.box.yml`
precedent set by the other app on the box. Its paths and uids are specific to that machine.

The non-obvious parts, all of which are load-bearing:

- **`network_mode: host`** — no bridge, no NAT. This kernel (`5.15 WSL2`) is already missing
  netfilter extensions, so a bridged container is the risky configuration here, and host networking
  also keeps `DB_HOST=localhost` in `.env` working with no code change.
- **`--bind-address=127.0.0.1` and `--mysqlx=OFF`.** With host networking the image would otherwise
  listen on `0.0.0.0`, i.e. the whole WiFi. `--mysqlx=OFF` is separate and easy to miss: the X
  plugin **ignores `--bind-address`** and binds `*:33060` itself. Caught only because the dry-run
  container ran alongside the still-live host server and collided on the port.
- **`--default-authentication-plugin=mysql_native_password`.** The bot has two MySQL drivers —
  sequelize on `mysql2`, and `mysql-promisify-pool` on the ancient `mysql@2.18`, used by
  `src/birthday.ts` alone. `mysql@2` cannot speak `caching_sha2_password` at all, so the 8.0 default
  would have broken the birthday feature and nothing else, months later.
- **`--socket` / `--pid-file` moved into the datadir.** `/var/run/mysqld` inside the image is owned
  by uid 999 and this container does not run as that user.
- **`user: "1000:1001"` (petter:srv)** — so the bind-mounted datadir needs no root `chown` and keeps
  the box's `/srv` group convention.
- **Passwords via `MYSQL_*_FILE`**, never compose `environment:`. Anything in an `environment:`
  block is readable by every member of the `docker` group through `docker inspect` — no sudo, no
  audit trail. The files are mode 600 in `/srv/inhousebot/secrets/`.
- **The DB user is `inhousebot`@`127.0.0.1` and `@localhost`**, not `@%` as `MYSQL_USER` creates it.

⚠️ **The host `mysql.service` is masked, not just disabled** — and that distinction cost a live
incident during the cutover. `inhousebot-db-backup.service` still carried `Requires=mysql.service`,
and **a `Requires=` dependency starts a *disabled* unit**, so the retired host server went into a
21-deep restart loop fighting the container for port 3306, at ~270 MB per attempt. Worse than the
RAM: had the container ever stopped, one of those attempts would have won 3306 and the bot would
have silently connected to the stale pre-cutover `/var/lib/mysql` copy. Both units now
`Requires=docker.service`, and the host server is masked so nothing can pull it back up.

`/var/lib/mysql` is deliberately left intact as a frozen pre-cutover copy — it is the rollback, and
it can be deleted once the container has run for a while:

```bash
# rollback to the host server
ssh -t homeserver 'sudo systemctl unmask mysql && sudo systemctl enable --now mysql'
# then restore the pre-container unit deps (Requires=mysql.service) and restart the bot
```

Note the container is currently managed with a plain `docker compose` as `petter`, who is in the
`docker` group. When that group membership is removed — a tracked decision on the box, since it is
root-equivalent — this needs an enumerated sudoers line for
`docker compose -f /srv/inhousebot/docker-compose.yml restart` instead.

### Database backups

The dumps were never about `/srv` coverage alone: the bot's history is irreplaceable and RDS used to
back it up automatically. Since 2026-07-29 the datadir *is* inside `/srv`
(`/srv/inhousebot/data/mysql`), so `srv-backup` does now sweep it up — **but only as live InnoDB
files, which are not a restorable backup.** The logical dump below remains the real one. It also
means the nightly tarball now carries a live datadir; adding an exclude for it is a shared-script
change and is noted in the box's `INBOX-from-mac.md` rather than done unilaterally.

`inhousebot-db-backup.timer` dumps the database to `/srv/mysql-backups/inhousebot-<date>.sql.gz`
at 02:00 (`Persistent=true`, since a desktop PC isn't guaranteed to be awake), keeping 14. Landing
it in `/srv` means the box's existing `srv-backup` carries it to the Windows side for free. It's
outside this repo on purpose, so dumps never show up as git noise.

```bash
ssh homeserver 'sudo systemctl start inhousebot-db-backup'   # dump right now
ssh homeserver 'systemctl list-timers inhousebot-db-backup'
ssh homeserver 'ls -lh /srv/mysql-backups'
```

The script writes to `.partial` and only promotes the file after checking both gzip integrity and
the `Dump completed` marker, so a failed run can't replace a good backup with a truncated one.
Credentials come from `~/.inhousebot-my.cnf` (mode 600) rather than the command line, so the
password never appears in `ps`. Since the container cutover that file also carries
`host=127.0.0.1` + `protocol=tcp`: without it the client defaults to the unix socket the retired
host server used to own, and the timer would fail quietly. **That one line was the only change the
backup flow needed** — the dump script's logic is untouched, and it still runs on the host with
`mysql-client-8.0`, which is its own package and survives the server being masked.

**Restore rehearsal — done 2026-07-26**, which the box had never tested for any service. A dump was
restored into a scratch database and matched the live one exactly: same row counts across all six
tables and an identical `CRC32` checksum over `ratings`. It needed no hand-editing, unlike the
RDS-era dump. To restore for real:

```bash
zcat /srv/mysql-backups/inhousebot-<date>.sql.gz \
  | mysql --defaults-extra-file=~/.inhousebot-my.cnf inhousebot
```

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

**Decision (2026-07-26): parked, and the preferred fix is a rewrite.** Rather than keep an
unmaintained 2021 Python app alive on retired Steam auth, the intent is to reimplement it in
TypeScript inside this repo against a maintained Node Steam library — one repo, one language, one
deploy, no socket hop, and no credential-caching patch needed. The socket contract is small (7
events, listed in [`TODO.md`](../TODO.md) under *Rewrite the Dota server*). Until then Dota games
simply balance without a server, which is the graceful default.

### 2. Repo housekeeping
- Clean up ~16 stale `origin/*` branches (history is squash-merged, so `--merged` doesn't flag them —
  triage each with `git log origin/main..origin/<branch>`).
- Consider running a local CS (get5/Dathost-style) server as a later follow-up.
- 5 Jest suites fail on `main` with `Cannot read properties of undefined (reading 'Guilds')` —
  `GatewayIntentBits` is undefined inside Jest (a CJS/ESM interop issue in the test harness, since
  the same import resolves fine at runtime and the bot boots). Pre-existing, unrelated to hosting.
  Note the suite also needs a local `.env` present or it fails earlier on `process.env.ENVIRONMENT`.
