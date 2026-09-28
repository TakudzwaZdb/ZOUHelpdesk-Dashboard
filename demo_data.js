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

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function summary() {
  return { open: 42, overdue: 7, pending: 18, resolved: 231, total_active: 42 + 18 };
}

function volume() {
  return { today: 26, this_week: 148, this_month: 612 };
}

function by_department() {
  return DEPARTMENTS.map(d => ({ label: d, count: randInt(20, 140) }));
}

function by_category() {
  return CATEGORIES.map(c => ({ label: c, count: randInt(15, 120) }));
}

function by_source() {
  const weights = { Portal: 0.45, Email: 0.25, Phone: 0.10, 'AI Chatbot': 0.20 };
  const total = 612;
  return Object.entries(weights).map(([label, w]) => ({ label, count: Math.round(total * w) }));
}

function assignment() {
  return { assigned: 34, unassigned: 8 };
}

function agent_workload() {
  return AGENTS.map(a => ({ agent: a, open_tickets: randInt(2, 14) }));
}

function resolved_per_agent() {
  return AGENTS.map(a => ({ agent: a, resolved: randInt(20, 70) }));
}

function response_times() {
  return {
    avg_first_response_minutes: 47,
    avg_resolution_hours: 9.4,
    median_first_response_minutes: 22,
    median_resolution_hours: 5.1,
  };
}

function sla_compliance() {
  return { within_sla_pct: 84.6, breached_pct: 15.4, total_evaluated: 480 };
}

function trends_hourly() {
  const now = new Date();
  const base = [2, 1, 1, 1, 2, 4, 9, 16, 22, 26, 24, 20, 18, 21, 25, 23, 19, 14, 10, 7, 5, 4, 3, 2];
  const out = [];
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600 * 1000);
    const hour = String(d.getHours()).padStart(2, '0') + ':00';
    const idx = 23 - i;
    out.push({ hour, count: Math.max(0, base[idx] + randInt(-2, 2)) });
  }
  return out;
}

function trends_daily() {
  const today = new Date();
  const out = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400 * 1000);
    out.push({ date: d.toISOString().slice(0, 10), count: randInt(15, 55) });
  }
  return out;
}

function channel_mix() {
  return { ai_chatbot: 122, portal_and_other: 490 };
}

function department_comparison() {
  return DEPARTMENTS.map(d => ({
    label: d,
    assigned: randInt(5, 40),
    resolved: randInt(20, 90),
    overdue: randInt(0, 12),
  }));
}

function category_comparison() {
  return CATEGORIES.map(c => ({
    label: c,
    assigned: randInt(3, 30),
    resolved: randInt(10, 70),
    overdue: randInt(0, 10),
  }));
}

function agent_comparison() {
  return AGENTS.map(a => ({
    label: a,
    workload: randInt(2, 14),
    overdue: randInt(0, 6),
    resolved: randInt(20, 70),
  }));
}

module.exports = {
  summary, volume, by_department, by_category, by_source, assignment,
  agent_workload, resolved_per_agent, response_times, sla_compliance,
  trends_hourly, trends_daily, channel_mix,
  department_comparison, category_comparison, agent_comparison,
};