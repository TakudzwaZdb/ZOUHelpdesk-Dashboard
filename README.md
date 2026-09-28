# ZOU Student Helpdesk — Analytics Dashboard

A standalone, view-only kiosk dashboard for `helpdesk.zou.ac.zw` (osTicket),
built with **React + Tailwind CSS** on the frontend and **Node.js / Express**
on the backend. It never modifies osTicket — it only ever runs `SELECT`
queries against a read-only database account — and it never requires a
viewer to log in.

## What's in this package

```
server.js                Node/Express backend + API (read-only)
demo_data.js              Realistic mock data — lets you rehearse today, no DB needed
queries/osticket.js        Real SQL against osTicket — swap in once DB access is ready
scripts/test-connection.js  Diagnostic: checks your DB creds/schema before going live
frontend/                 React + Tailwind + Chart.js dashboard (source)
  src/context/ThemeContext.jsx    Theme state — every chart re-renders on change, no patching
  src/hooks/useEndpoint.js         Per-panel fetch/refresh, isolated failure handling
  src/charts/                      Bar/Line/Donut wrappers around react-chartjs-2
  src/components/                  Panel, KPI cards, status badge, clock, theme switcher
  src/App.jsx                      Assembles the full dashboard layout
sql/read_only_user.sql    Creates a SELECT-only MySQL account
deploy/nginx.conf.example       Restricts access to the ZOU LAN/VLAN
deploy/helpdesk-dashboard.service    Runs the app as a background systemd service
deploy/kiosk-autostart.md       Full-screen auto-launch on the display PC
package.json / .env.example
```

## Get it presenting TODAY (demo mode, no DB access needed)

Two things need installing: the backend, and the frontend.

```bash
# 1. Backend
npm install
cp .env.example .env          # DEMO_MODE=true is already the default

# 2. Frontend (one-time)
cd frontend
npm install
cd ..
```

**For local development** (hot-reload on every save):
```bash
npm start                     # terminal 1 — backend on :8080
cd frontend && npm run dev    # terminal 2 — frontend on :5173, proxies /api to :8080
```
Open `http://localhost:5173`. Vite's dev proxy forwards every `/api/...`
request straight to Express, so there's nothing to configure — edit any
file under `frontend/src` and the browser updates instantly.

**For a single-URL build** (what the kiosk PC will actually run):
```bash
npm run build:frontend        # builds frontend/dist
npm start                     # Express now serves the built React app AND the API on :8080
```
Open `http://localhost:8080` — this is the one URL the kiosk browser should
point at. Every component is final; only the numbers are fake until you
connect the real database.

`npm run setup` does both installs and the frontend build in one shot.

## Switching to live data before Monday

1. **Provision a read-only reporting connection** (this is the "reporting
   replica / read-only connection" the brief asked for — it can be either
   a real MySQL replica, or simply a restricted-privilege account on the
   live osTicket DB, whichever your DBA prefers):
   ```bash
   mysql -u root -p < sql/read_only_user.sql
   ```
2. Fill in `.env` with that account's `DB_HOST`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`,
   and set `DEMO_MODE=false`.
3. **Verify the schema assumptions.** osTicket's table/column names differ
   slightly by version. `queries/osticket.js` documents every assumption
   inline (table prefix, status names, how "Pending" is derived, etc.) —
   run the `SHOW TABLES` / `DESCRIBE` checks noted at the top of that file
   against your real install and adjust before you go live. Two things you
   *must* confirm specifically:
   - **"Pending" status**: osTicket doesn't have a native "Pending" status;
     this build treats it as "open + awaiting student reply." Confirm that
     matches how Student Affairs thinks about "pending."
   - **AI chatbot vs portal**: osTicket doesn't natively tag chatbot-created
     tickets. The query currently assumes your chatbot creates tickets via
     the API (`source = 'API'`). Check what `source` value (or custom field)
     your actual chatbot integration sets and update `channel_mix()`
     accordingly.
4. **Verify the connection before switching over:**
   ```bash
   npm run test-db
   ```
   This checks that MySQL is reachable, that `DEMO_MODE=false`'s credentials
   can actually `SELECT`, that the expected osTicket tables exist under the
   `ost_` prefix, and prints out your real ticket status names so you can
   confirm the "Resolved"/"Pending" assumptions above. Fix anything it flags
   before going further.
5. Rebuild the frontend and restart: `npm run build:frontend && npm start`
   (or deploy properly — see below).

## Real-time reliability

This isn't just a demo — the dashboard is built to keep working, and to be
honest about it, when something's wrong:
- **`/api/status`** actually pings the database (`SELECT 1`) on every
  refresh cycle, not just checking whether `DEMO_MODE` is set — so the
  status badge in the top-left tells you *Live — connected to MySQL*,
  *Demo Data*, or *Database unreachable*, accurately.
- **Every panel fetches and renders independently** via its own
  `useEndpoint()` hook. If one query breaks (e.g. a table name doesn't
  match your osTicket version), only that one panel flags itself (a small
  "⚠ no data" marker) — the rest of the dashboard keeps showing live
  numbers instead of the whole screen going blank. It recovers
  automatically once the underlying query succeeds again.
- **First load shows skeleton loading placeholders**, not empty dashes, so
  the kiosk doesn't flash "0" or "–" while the first fetch is in flight.
- The server logs a clear ✓/✗ to its console on startup and on every failed
  query, so if something's wrong during the live run-through you'll see it
  in the terminal immediately, not just guess from a blank chart.
- **Theme switching is instant and reliable by construction.** The active
  theme lives in React state (`ThemeContext`), and every chart reads its
  colors from that state as normal props. Switching themes is just a
  re-render — there's no manual walking of Chart.js instances to recolor
  them after the fact, which is what the previous vanilla-JS version did
  and where a real bug (colors lagging on the line charts) turned up during
  testing. That whole class of bug isn't possible in this architecture.

## Access control (you asked for one; this ships with three)

- **Control #1 — Network/VLAN restriction**: `deploy/nginx.conf.example`
  reverse-proxies the app and allowlists only the ZOU LAN / management VLAN.
  This is the strongest control and is recommended as your primary layer.
- **Control #2 — Aggregates only, by design**: every API route returns
  counts, averages and percentages only. No ticket subjects, message
  content, student names or email addresses are queried or exposed
  anywhere in the app — check `queries/osticket.js`, there's simply no
  `SELECT` that touches those columns.
- **Control #3 — Kiosk token**: set `KIOSK_TOKEN` in `.env`; the dashboard
  URL becomes `https://.../?token=...`. Treat this as defense-in-depth
  behind the network restriction, not a replacement for it.
- **Control #4 — Full-screen kiosk autostart**: see
  `deploy/kiosk-autostart.md` for Windows and Linux instructions to make
  the display PC boot straight into full-screen, no-login mode.

Recommended for Monday: **#1 + #3 together**, plus **#4** on the actual
presentation PC. #2 is baked in regardless.

## Production deployment sketch

```
osTicket DB (MySQL) --read-only-- server.js (Node/Express, 127.0.0.1:8080)
                                   serves the built React app + the API
                                        │
                                nginx (LAN/VLAN allowlist, TLS)
                                        │
                              Student Affairs kiosk browser (full-screen)
```

```bash
sudo cp -r . /opt/helpdesk-dashboard
cd /opt/helpdesk-dashboard
npm ci --omit=dev
npm run build:frontend        # produces frontend/dist, which server.js serves
sudo cp deploy/helpdesk-dashboard.service /etc/systemd/system/
sudo systemctl enable --now helpdesk-dashboard
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/helpdesk-dashboard
sudo ln -s /etc/nginx/sites-available/helpdesk-dashboard /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

If you ever run `server.js` without having built the frontend first, it
still starts and the API still works — hitting `/` just returns a short
message telling you to run `npm run build:frontend`, instead of a blank
page or a crash.

## On Grafana / Power BI / Metabase instead

The brief also mentioned those as options. This custom build was chosen
because it can run standalone with no additional licensing or server
footprint and be ready to present by Monday. If ZOU already runs Grafana
or Metabase, the SQL in `queries/osticket.js` can be pasted directly into
panel queries there instead — the read-only DB account in
`sql/read_only_user.sql` works identically for that path. Say the word and
this can be adapted into Grafana JSON dashboards instead.

## What's still left for you to confirm with your DBA/osTicket admin

- Exact table prefix (`ost_` assumed) and osTicket version.
- Real status names in `ost_ticket_status` (Open/Resolved/Closed etc.).
- How "Pending" should be defined for Student Affairs' purposes.
- The `source` value (or custom field) your AI chatbot sets on tickets it creates.
- Real ZOU LAN/VLAN CIDR ranges for `nginx.conf`.
