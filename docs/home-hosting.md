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
- [ ] Home bring-up
- [ ] Run Dota server (DotesBot) locally
- [ ] Remote access from another PC
- [ ] Repo housekeeping

## Future TODOs

### 1. Home bring-up (Windows 10 / WSL Ubuntu)
- Install WSL Ubuntu, Node 20 LTS (via nvm), and `mysql-server`.
- Recreate the database schema from [`db.sql`](../db.sql); optionally restore ratings from the
  rescued dumps (`data-dumps/backup-2022-02-06.sql` is the newest).
- Create a local `.env` (DB pointed at `localhost`; CS/Dathost left blank so CS auto-skips its server).
- Run under systemd (WSL has systemd support) or tmux so it survives reboots and crashes.
- Verify the bot builds and boots with CS disabled.

### 2. Dota server (DotesBot)
- DotesBot is a **separate companion app** the bot connects to over a socket on `:4545`.
- Set `DOTA_SERVER_URL=http://127.0.0.1:4545` in `.env` to enable Dota servers.
- Resolve the repo ambiguity: the old box used `github.com/Xavantex/DotesBot`; `github.com/Cronvs/DotesBot`
  was also mentioned. Confirm which fork to run.
- DotesBot needs its own Steam credentials (`STEAMUSER`/`STEAMPW`, rescued from its `.env`).

### 3. Remote access
- Windows OpenSSH Server on the W10 host → SSH to the PC's LAN IP → `wsl` into Ubuntu → attach to the bot.
- Add a DHCP reservation on the router so the PC's LAN IP is stable.
- (Windows 10 has no WSL mirrored networking, so SSH into the Windows host and hop into WSL rather than
  running sshd directly inside WSL.)

### 4. Repo housekeeping
- Clean up ~16 stale `origin/*` branches (history is squash-merged, so `--merged` doesn't flag them —
  triage each with `git log origin/main..origin/<branch>`).
- Consider running a local CS (get5/Dathost-style) server as a later follow-up.
