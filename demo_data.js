/**
 * Realistic-looking mock data so the dashboard can be rehearsed and
 * screenshotted TODAY, before the read-only DB connection to osTicket
 * is wired up.
 *
 * Set DEMO_MODE=false in .env once real DB credentials are supplied —
 * every function here has a same-named, same-shaped counterpart in
 * queries/osticket.js that pulls the real numbers, so the frontend
 * needs no changes to go live.
 */

const DEPARTMENTS = ['Registry', 'Finance', 'ICT', 'Academic Affairs', 'Student Affairs', 'Library'];
const CATEGORIES = ['Login/Password', 'Fees & Payments', 'Results & Transcripts', 'Registration',
  'e-Learning Platform', 'General Enquiry', 'Library Access'];
const AGENTS = ['T. Moyo', 'R. Chikafu', 'N. Gumbo', 'S. Ncube', 'F. Mudzingwa', 'P. Sibanda'];
const SOURCES = ['Portal', 'Email', 'Phone', 'API'];

// ---------------------------------------------------------------------------
// ONE coherent set of demo tickets. Every endpoint below is an aggregate of
// this same list, so totals always agree across the whole dashboard
// (e.g. overdue by department = overdue by category = overdue KPI).
// ---------------------------------------------------------------------------
let seed = 20260930;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const DAY = 86400 * 1000;
const NOW = Date.now();

const TICKETS = [];
for (let i = 0; i < 540; i++) {
  const r = rnd();
  const status = r < 0.09 ? 'open' : r < 0.67 ? 'resolved' : r < 0.9 ? 'closed' : 'other';
  const agent = status === 'open' && rnd() < 0.2 ? null : pick(AGENTS);
  const overdue = status === 'open' && rnd() < 0.2;
  const answered = status === 'open' ? rnd() < 0.6 : true;
  const ageDays = Math.pow(rnd(), 1.6) * 120; // skewed towards recent
  TICKETS.push({
    dept: pick(DEPARTMENTS), cat: pick(CATEGORIES), agent, status, overdue, answered,
    source: pick(SOURCES), created: NOW - ageDays * DAY - rnd() * DAY * 0.5,
  });
}
// Guarantee every one of the last 14 days has tickets (daily chart).
for (let d = 0; d < 14; d++) for (let k = 0; k < 8; k++) TICKETS[d * 8 + k].created = NOW - d * DAY - rnd() * DAY * 0.8;

const isOpen = (t) => t.status === 'open';
const count = (arr, f) => arr.filter(f).length;
const groupBy = (arr, keyFn, keys) => keys.map((k) => ({ k, rows: arr.filter((t) => keyFn(t) === k) }));
const stats = (rows) => ({
  total: rows.length,
  assigned: count(rows, (t) => isOpen(t) && t.agent),
  resolved: count(rows, (t) => t.status === 'resolved'),
  overdue: count(rows, (t) => isOpen(t) && t.overdue),
});

function summary() {
  const open = count(TICKETS, isOpen);
  return {
    open,
    overdue: count(TICKETS, (t) => isOpen(t) && t.overdue),
    pending: count(TICKETS, (t) => isOpen(t) && (!t.answered || !t.agent)),
    resolved: count(TICKETS, (t) => t.status === 'resolved'),
    closed: count(TICKETS, (t) => t.status === 'closed'),
    total_active: open,
  };
}

function resolution_pace() {
  const resolved = count(TICKETS, (t) => t.status === 'resolved');
  const total = TICKETS.length;
  return { resolved, total, resolved_pct: Math.round((resolved / total) * 1000) / 10, target_pct: 80 };
}

function volume() {
  const d = new Date(NOW);
  const startToday = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dow = (d.getDay() + 6) % 7;
  const startWeek = startToday - dow * DAY;
  const startMonth = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  return {
    today: count(TICKETS, (t) => t.created >= startToday),
    this_week: count(TICKETS, (t) => t.created >= startWeek),
    this_month: count(TICKETS, (t) => t.created >= startMonth),
  };
}

const byCount = (rows) => rows.sort((a, b) => b.count - a.count);
function by_department() { return byCount(groupBy(TICKETS, (t) => t.dept, DEPARTMENTS).map((g) => ({ label: g.k, count: g.rows.length }))); }
function by_category() { return byCount(groupBy(TICKETS, (t) => t.cat, CATEGORIES).map((g) => ({ label: g.k, count: g.rows.length }))); }
function by_source() {
  const names = { Portal: 'Portal', Email: 'Email', Phone: 'Phone', API: 'AI Chatbot' };
  return byCount(SOURCES.map((s) => ({ label: names[s], count: count(TICKETS, (t) => t.source === s) })));
}

function assignment() {
  return { assigned: count(TICKETS, (t) => isOpen(t) && t.agent), unassigned: count(TICKETS, (t) => isOpen(t) && !t.agent) };
}

function agent_workload() {
  return AGENTS.map((a) => ({ agent: a, open_tickets: count(TICKETS, (t) => isOpen(t) && t.agent === a) }))
    .sort((x, y) => y.open_tickets - x.open_tickets);
}

function resolved_per_agent() {
  return AGENTS.map((a) => ({ agent: a, resolved: count(TICKETS, (t) => t.status === 'resolved' && t.agent === a) }))
    .sort((x, y) => y.resolved - x.resolved);
}

function response_times() {
  return { avg_first_response_minutes: 47, avg_resolution_hours: 9.4, median_first_response_minutes: 22, median_resolution_hours: 5.1 };
}

function sla_compliance() {
  const recent = TICKETS.filter((t) => t.created >= NOW - 30 * DAY);
  const within = count(recent, (t) => !t.overdue);
  const pct = recent.length ? Math.round((within / recent.length) * 1000) / 10 : 0;
  return { within_sla_pct: pct, breached_pct: Math.round((100 - pct) * 10) / 10, total_evaluated: recent.length };
}

function trends_hourly() {
  const out = [];
  for (let i = 23; i >= 0; i--) {
    const from = NOW - (i + 1) * 3600 * 1000;
    const to = NOW - i * 3600 * 1000;
    const hour = String(new Date(to).getHours()).padStart(2, '0') + ':00';
    out.push({ hour, count: count(TICKETS, (t) => t.created >= from && t.created < to) });
  }
  return out;
}

function trends_daily() {
  const out = [];
  const today = new Date(NOW);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  for (let i = 13; i >= 0; i--) {
    const from = start - i * DAY;
    out.push({ date: new Date(from).toISOString().slice(0, 10), count: count(TICKETS, (t) => t.created >= from && t.created < from + DAY) });
  }
  return out;
}

function channel_mix() {
  const recent = TICKETS.filter((t) => t.created >= NOW - 30 * DAY);
  const ai = count(recent, (t) => t.source === 'API');
  return { ai_chatbot: ai, portal_and_other: recent.length - ai };
}

const comparison = (keyFn, keys) => groupBy(TICKETS, keyFn, keys).map((g) => ({ label: g.k, ...stats(g.rows) })).sort((a, b) => b.total - a.total);
function department_comparison() { return comparison((t) => t.dept, DEPARTMENTS); }
function category_comparison() { return comparison((t) => t.cat, CATEGORIES); }
function agent_comparison() {
  // Tickets with no owner are shown as "Unassigned" so agent totals add up to ALL tickets.
  return comparison((t) => t.agent || 'Unassigned', [...AGENTS, 'Unassigned'])
    .map((r) => (r.label === 'Unassigned' ? { ...r, assigned: 0 } : r));
}

// Demo subject words per category; every demo ticket contributes its category's words.
const KEYWORDS = {
  'Login/Password': ['password', 'reset', 'login', 'locked', 'account', 'portal'],
  'Fees & Payments': ['fees', 'payment', 'balance', 'receipt', 'proof', 'invoice'],
  'Results & Transcripts': ['results', 'transcript', 'missing', 'exam', 'marks', 'appeal'],
  'Registration': ['registration', 'courses', 'enrolment', 'deadline', 'semester', 'module'],
  'e-Learning Platform': ['moodle', 'access', 'assignment', 'upload', 'course', 'error'],
  'General Enquiry': ['information', 'campus', 'timetable', 'contact', 'graduation', 'letter'],
  'Library Access': ['library', 'journals', 'access', 'books', 'ebooks', 'database'],
};
function ticket_keywords() {
  const freq = {};
  TICKETS.forEach((t, i) => {
    const words = KEYWORDS[t.cat];
    // each ticket mentions 2 of its category's words (more weight to the first ones)
    [words[i % 3], words[3 + (i % 3)]].forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  });
  return Object.entries(freq).map(([text, count]) => ({ text, count })).sort((a, b) => b.count - a.count);
}

module.exports = {
  summary, volume, by_department, by_category, by_source, assignment,
  agent_workload, resolved_per_agent, response_times, sla_compliance,
  trends_hourly, trends_daily, channel_mix,
  department_comparison, category_comparison, agent_comparison,
  resolution_pace, ticket_keywords,
};
