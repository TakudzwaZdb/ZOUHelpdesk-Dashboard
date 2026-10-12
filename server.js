/**
 * ZOU Student Helpdesk — Analytics Dashboard backend (Node.js / Express)
 * -----------------------------------------------------------------------
 * Reads from a READ-ONLY connection to the osTicket database and serves
 * aggregate JSON to the kiosk dashboard. Never writes to osTicket.
 * Never returns ticket subjects, message bodies, names or emails —
 * aggregate counts and timings only.
 *
 * Run:
 *   npm install
 *   cp .env.example .env        # fill in DB creds, or leave DEMO_MODE=true
 *   npm start
 *
 * See README.md for deployment (kiosk mode, network/VLAN restriction, token).
 */
require('dotenv').config();
const express = require('express');
const path = require('path');

const DEMO_MODE = (process.env.DEMO_MODE || 'true').toLowerCase() === 'true';
const KIOSK_TOKEN = process.env.KIOSK_TOKEN || '';
const PORT = parseInt(process.env.PORT || '8080', 10);

const demo = require('./demo_data');
const live = require('./queries/osticket'); // only used when DEMO_MODE=false

let pool = null;
if (!DEMO_MODE) {
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,        // must be a READ-ONLY (SELECT-only) account
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    connectTimeout: 5000,
    decimalNumbers: true,       // SUM()/AVG() come back as DECIMAL -> return real numbers, not strings
    supportBigNumbers: true,
    bigNumberStrings: false,
  });

  // Fail loudly and immediately if the DB is unreachable, rather than
  // discovering it only when the first browser request comes in.
  pool.query('SELECT 1')
    .then(() => console.log(`✓ Connected to MySQL database "${process.env.DB_NAME}" at ${process.env.DB_HOST}`))
    .catch(err => {
      console.error('✗ Could not reach the database on startup:', err.code || err.message);
      console.error('  Run `npm run test-db` for a detailed diagnostic.');
    });
}

// q(sql, params) -> rows, shared by every function in queries/osticket.js
async function q(sql, params) {
  const [rows] = await pool.query(sql, params || []);
  // Belt and braces: SUM() over a DECIMAL/BigInt can still arrive as a string
  // ("70"), and "0"+"70"+"16" concatenates instead of adding. Make every
  // numeric-looking value in a row a real JS number.
  return rows.map((r) => {
    const o = {};
    for (const k of Object.keys(r)) {
      const v = r[k];
      o[k] = typeof v === 'bigint' ? Number(v)
        : (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v) && !/^(label|agent|hour|date|topic|name)$/.test(k)) ? Number(v)
        : v;
    }
    return o;
  });
}

// Fetch a named dataset either from the live DB or the demo generator,
// depending on DEMO_MODE. Every demo_data.js function has a same-named,
// same-shaped counterpart in queries/osticket.js.
async function getData(key) {
  if (DEMO_MODE) return demo[key]();
  return live[key](q);
}

const app = express();

// ---------------------------------------------------------------------
// Access control: a lightweight shared token, meant to sit BEHIND a
// network or VLAN restriction (see README) — not a substitute for it.
// No student login is required or possible from this app; it is
// strictly read-only and shows aggregates only.
// ---------------------------------------------------------------------
function requireKioskToken(req, res, next) {
  if (!KIOSK_TOKEN) return next();
  const supplied = req.query.token || req.headers['x-kiosk-token'];
  if (supplied !== KIOSK_TOKEN) return res.status(401).json({ error: 'unauthorized' });
  next();
}

const FRONTEND_DIST = path.join(__dirname, 'frontend', 'dist');
const fs = require('fs');
const frontendBuilt = fs.existsSync(path.join(FRONTEND_DIST, 'index.html'));

if (frontendBuilt) {
  app.use(express.static(FRONTEND_DIST));
} else {
  console.warn('⚠ frontend/dist not found — run `cd frontend && npm install && npm run build`, ' +
    'or use `npm run dev` in /frontend for local development (Vite proxies /api here automatically).');
}

// Every /api/* response is explicitly marked non-cacheable. Without this,
// a browser, the nginx reverse proxy (see deploy/nginx.conf.example), or
// any CDN sitting in front could legally cache a GET response and serve
// stale numbers on the kiosk — this guarantees every refresh cycle (e.g.
// the 14-day trend line, hourly volume) reflects a genuinely fresh query
// against the database, not a cached response from an earlier one.
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.get('/api/status', requireKioskToken, async (req, res) => {
  if (DEMO_MODE) {
    return res.json({ ok: true, demo_mode: true, db_connected: false, server_time: new Date().toISOString() });
  }
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, demo_mode: false, db_connected: true, server_time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ ok: false, demo_mode: false, db_connected: false, error: err.message, server_time: new Date().toISOString() });
  }
});

const routes = {
  '/api/summary': 'summary',
  '/api/volume': 'volume',
  '/api/by-department': 'by_department',
  '/api/by-category': 'by_category',
  '/api/by-source': 'by_source',
  '/api/assignment': 'assignment',
  '/api/agent-workload': 'agent_workload',
  '/api/resolved-per-agent': 'resolved_per_agent',
  '/api/response-times': 'response_times',
  '/api/sla-compliance': 'sla_compliance',
  '/api/trends-hourly': 'trends_hourly',
  '/api/trends-daily': 'trends_daily',
  '/api/channel-mix': 'channel_mix',
  '/api/department-comparison': 'department_comparison',
  '/api/category-comparison': 'category_comparison',
  '/api/agent-comparison': 'agent_comparison',
  '/api/resolution-pace': 'resolution_pace',
  '/api/ticket-keywords': 'ticket_keywords',
};

for (const [route, key] of Object.entries(routes)) {
  app.get(route, requireKioskToken, async (req, res) => {
    try {
      res.json(await getData(key));
    } catch (err) {
      console.error(`${route} failed:`, err.message);
      res.status(500).json({ error: 'query_failed', detail: err.message });
    }
  });
}

// SPA fallback — anything not matched above (and not /api/*) serves the
// React app's index.html so client-side routing/refresh works.
app.get(/^(?!\/api\/).*/, (req, res) => {
  if (!frontendBuilt) {
    return res.status(503).send('Frontend not built yet. Run: cd frontend && npm install && npm run build');
  }
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Helpdesk dashboard listening on :${PORT} (DEMO_MODE=${DEMO_MODE})`);
});
