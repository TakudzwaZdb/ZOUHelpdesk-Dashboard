/**
 * Standalone connection test — run this BEFORE `npm start` when going live.
 * Confirms the .env credentials can reach MySQL, that the `helpdesk`
 * database exists, that the read-only account can SELECT from it, and
 * gives you a first look at whether the osTicket table names match what
 * queries/osticket.js expects.
 *
 * Usage: npm run test-db
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`✗ Missing required .env values: ${missing.join(', ')}`);
  console.error('  Copy .env.example to .env and fill these in first.');
  process.exit(1);
}

(async () => {
  console.log(`Connecting to ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME} ...`);
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 5000,
    });
    console.log('✓ Connected successfully.');
  } catch (err) {
    console.error('✗ Could not connect:', err.code || err.message);
    if (err.code === 'ECONNREFUSED') console.error('  → MySQL is not reachable at that host/port. Check DB_HOST/DB_PORT and firewall rules.');
    if (err.code === 'ER_ACCESS_DENIED_ERROR') console.error('  → Wrong username/password, or the account\'s allowed host doesn\'t match where this script is running from.');
    if (err.code === 'ER_BAD_DB_ERROR') console.error(`  → Database "${process.env.DB_NAME}" doesn't exist on that server.`);
    process.exit(1);
  }

  try {
    const [[{ ok }]] = await conn.query('SELECT 1 AS ok');
    console.log(ok === 1 ? '✓ Basic query works.' : '✗ Unexpected result from SELECT 1.');
  } catch (err) {
    console.error('✗ SELECT 1 failed:', err.message);
  }

  // Check the tables queries/osticket.js expects exist
  const expectedTables = ['ost_ticket', 'ost_ticket_status', 'ost_department', 'ost_staff',
    'ost_help_topic', 'ost_ticket__cdata', 'ost_thread', 'ost_thread_entry'];
  console.log('\nChecking expected osTicket tables (prefix "ost_"):');
  const [rows] = await conn.query('SHOW TABLES');
  const existing = rows.map(r => Object.values(r)[0]);
  for (const t of expectedTables) {
    console.log(existing.includes(t) ? `  ✓ ${t}` : `  ✗ ${t} NOT FOUND — check table prefix in queries/osticket.js`);
  }

  try {
    const [statusRows] = await conn.query('SELECT id, name, state FROM ost_ticket_status');
    console.log('\nTicket statuses found in your install:');
    statusRows.forEach(s => console.log(`  - ${s.name} (state: ${s.state})`));
    console.log('  → Confirm "Resolved" and open/closed states here match what queries/osticket.js assumes.');
  } catch (err) {
    console.log('\n(Could not read ost_ticket_status — table prefix may differ, see above.)');
  }

  await conn.end();
  console.log('\nDone. If everything above shows ✓, set DEMO_MODE=false in .env and run `npm start`.');
})();
