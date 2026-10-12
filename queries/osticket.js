/**
 * Real queries against a READ-ONLY replica of the osTicket database.
 *
 * IMPORTANT — verify against your install before going live:
 * osTicket's schema has shifted slightly across versions (1.10 / 1.14 / 1.17+),
 * and table prefix may not be `ost_`. Before Monday, run:
 *
 *     SHOW TABLES LIKE '%ticket%';
 *     DESCRIBE ost_ticket;
 *     SELECT id, name FROM ost_ticket_status;
 *
 * and adjust PREFIX / status-name matches below if yours differ.
 * Every assumption is flagged with // ASSUMPTION.
 *
 * Every function here takes `q` (an async `(sql, params) -> rows` executor
 * from server.js) and returns data in the exact same shape as
 * demo_data.js, so the frontend never needs to change.
 */

const PREFIX = 'ost_'; // ASSUMPTION: default osTicket table prefix

// osTicket status names as of 1.14+: Open, Resolved, Closed, Archived, Deleted
// "Pending" isn't a native status.
// CONFIRMED (per schema notes): pending == open tickets that still need
// staff attention — either nobody has answered yet (isanswered = 0) or the
// ticket has no owner yet (staff_id = 0 / unassigned).

async function summary(q) {
  const [openRow] = await q(`
    SELECT COUNT(*) c FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    WHERE s.state = 'open'
  `);
  const [overdueRow] = await q(`
    SELECT COUNT(*) c FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    WHERE s.state = 'open' AND t.isoverdue = 1
  `);
  const [pendingRow] = await q(`
    SELECT COUNT(*) c FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    WHERE s.state = 'open' AND (t.isanswered = 0 OR t.staff_id = 0 OR t.staff_id IS NULL)
  `);
  const [resolvedRow] = await q(`
    SELECT COUNT(*) c FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    WHERE s.name = 'Resolved'
  `);
<<<<<<< HEAD
  const [closedRow] = await q(`
    SELECT COUNT(*) c FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    WHERE s.name = 'Closed'
  `);
  return {
    open: openRow.c, overdue: overdueRow.c, pending: pendingRow.c,
    resolved: resolvedRow.c, closed: closedRow.c, total_active: openRow.c,
  };
}

async function resolution_pace(q) {
  // % of ALL tickets ever logged that are currently Resolved, measured
  // against an 80% target — this is a pace/progress metric, not a
  // point-in-time SLA check.
  const TARGET_PCT = 80;
  const [row] = await q(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END) AS resolved
    FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
  `);
  const total = row.total || 0;
  const resolved = row.resolved || 0;
  const resolved_pct = total ? Math.round((resolved / total) * 1000) / 10 : 0;
  return { resolved, total, resolved_pct, target_pct: TARGET_PCT };
}

=======
  return {
    open: openRow.c, overdue: overdueRow.c, pending: pendingRow.c,
    resolved: resolvedRow.c, total_active: openRow.c,
  };
}

>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
async function volume(q) {
  const [t] = await q(`SELECT COUNT(*) c FROM ${PREFIX}ticket WHERE DATE(created) = CURDATE()`);
  const [w] = await q(`SELECT COUNT(*) c FROM ${PREFIX}ticket WHERE YEARWEEK(created, 1) = YEARWEEK(CURDATE(), 1)`);
  const [m] = await q(`SELECT COUNT(*) c FROM ${PREFIX}ticket
                        WHERE YEAR(created) = YEAR(CURDATE()) AND MONTH(created) = MONTH(CURDATE())`);
  return { today: t.c, this_week: w.c, this_month: m.c };
}

async function by_department(q) {
  return q(`
<<<<<<< HEAD
    SELECT COALESCE(d.name, 'No department') AS label, COUNT(*) AS count
    FROM ${PREFIX}ticket t
    LEFT JOIN ${PREFIX}department d ON d.id = t.dept_id
    GROUP BY d.id, d.name ORDER BY count DESC
=======
    SELECT d.name AS label, COUNT(*) AS count
    FROM ${PREFIX}ticket t
    JOIN ${PREFIX}department d ON d.id = t.dept_id
    GROUP BY d.name ORDER BY count DESC
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
  `);
}

async function by_category(q) {
  return q(`
    SELECT
      COALESCE(NULLIF(TRIM(h.topic), ''), 'Uncategorized') AS label,
      COUNT(t.ticket_id) AS count
    FROM ${PREFIX}ticket t
    LEFT JOIN ${PREFIX}help_topic h
      ON h.topic_id = t.topic_id
    GROUP BY
      h.topic_id,
      h.topic
    ORDER BY count DESC
  `);
}

async function by_source(q) {
  return q(`
    SELECT COALESCE(source, 'Unknown') AS label, COUNT(*) AS count
    FROM ${PREFIX}ticket GROUP BY source ORDER BY count DESC
  `);
}

async function assignment(q) {
  // CONFIRMED (per schema notes): a ticket counts as assigned if it has
  // either an individual owner (staff_id) or a team owner (team_id).
  const [a] = await q(`
    SELECT COUNT(*) c FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    WHERE s.state = 'open' AND (t.staff_id > 0 OR t.team_id > 0)
  `);
  const [u] = await q(`
    SELECT COUNT(*) c FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    WHERE s.state = 'open'
      AND (t.staff_id = 0 OR t.staff_id IS NULL)
      AND (t.team_id = 0 OR t.team_id IS NULL)
  `);
  return { assigned: a.c, unassigned: u.c };
}

async function agent_workload(q) {
  return q(`
    SELECT CONCAT(st.firstname, ' ', st.lastname) AS agent, COUNT(*) AS open_tickets
    FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    JOIN ${PREFIX}staff st ON st.staff_id = t.staff_id
    WHERE s.state = 'open'
    GROUP BY st.staff_id ORDER BY open_tickets DESC
  `);
}

async function resolved_per_agent(q) {
  return q(`
    SELECT CONCAT(st.firstname, ' ', st.lastname) AS agent, COUNT(*) AS resolved
    FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    JOIN ${PREFIX}staff st ON st.staff_id = t.staff_id
    WHERE s.name = 'Resolved'
    GROUP BY st.staff_id ORDER BY resolved DESC
  `);
}

async function response_times(q) {
  // ASSUMPTION: first staff response = earliest ost_thread_entry with type='R'
  // on that ticket's thread, compared to ticket creation time.
  const [row] = await q(`
    SELECT
      AVG(TIMESTAMPDIFF(MINUTE, t.created, fr.first_response)) AS avg_first_response_minutes,
      AVG(TIMESTAMPDIFF(HOUR, t.created, t.closed)) AS avg_resolution_hours
    FROM ${PREFIX}ticket t
    LEFT JOIN (
        SELECT th.object_id AS ticket_id, MIN(te.created) AS first_response
        FROM ${PREFIX}thread_entry te
        JOIN ${PREFIX}thread th ON th.id = te.thread_id
        WHERE te.type = 'R'
        GROUP BY th.object_id
    ) fr ON fr.ticket_id = t.ticket_id
    WHERE t.created >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);
  return {
    avg_first_response_minutes: Math.round((row.avg_first_response_minutes || 0) * 10) / 10,
    avg_resolution_hours: Math.round((row.avg_resolution_hours || 0) * 10) / 10,
    median_first_response_minutes: null, // MySQL has no MEDIAN(); compute in app layer if needed
    median_resolution_hours: null,
  };
}

async function sla_compliance(q) {
  // CONFIRMED (per schema notes): breach is tracked by osTicket itself via
  // ost_ticket.isoverdue, which it maintains internally against
  // ost_sla.grace_period (18h default) — so we read isoverdue directly
  // instead of recomputing breach off duedate/closed ourselves.
  const [row] = await q(`
    SELECT
      SUM(CASE WHEN t.isoverdue = 0 THEN 1 ELSE 0 END) AS within_sla,
      COUNT(*) AS total
    FROM ${PREFIX}ticket t
    WHERE t.created >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);
  const total = row.total || 0;
  const within = row.within_sla || 0;
  const pct = total ? Math.round((within / total) * 1000) / 10 : 0;
  return { within_sla_pct: pct, breached_pct: Math.round((100 - pct) * 10) / 10, total_evaluated: total };
}

async function trends_hourly(q) {
  return q(`
    SELECT DATE_FORMAT(created, '%H:00') AS hour, COUNT(*) AS count
    FROM ${PREFIX}ticket
    WHERE created >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    GROUP BY hour ORDER BY hour
  `);
}

async function trends_daily(q) {
  return q(`
    SELECT DATE(created) AS date, COUNT(*) AS count
    FROM ${PREFIX}ticket
    WHERE created >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
    GROUP BY DATE(created) ORDER BY date
  `);
}

async function channel_mix(q) {
  // CONFIRMED (per schema notes): not cleanly separable yet — osTicket has
  // no dedicated "chatbot" source. Using source='API' as a proxy (vs the
  // OAuth2/portal-driven 'Web' source) until tickets are tagged explicitly.
  const [row] = await q(`
    SELECT
      SUM(CASE WHEN source = 'API' THEN 1 ELSE 0 END) AS ai_chatbot,
      SUM(CASE WHEN source != 'API' OR source IS NULL THEN 1 ELSE 0 END) AS portal_and_other
    FROM ${PREFIX}ticket
    WHERE created >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  `);
  return { ai_chatbot: row.ai_chatbot || 0, portal_and_other: row.portal_and_other || 0 };
}

async function department_comparison(q) {
  // Total = all tickets ever logged for this department (any status).
  // Assigned = currently open AND owned by a staff member or team.
  // Overdue = currently open AND past its SLA (isoverdue flag).
  // Resolved = closed with status 'Resolved'.
  return q(`
<<<<<<< HEAD
    SELECT COALESCE(d.name, 'No department') AS label,
=======
    SELECT d.name AS label,
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
      COUNT(*) AS total,
      SUM(CASE WHEN s.state = 'open' AND (t.staff_id > 0 OR t.team_id > 0) THEN 1 ELSE 0 END) AS assigned,
      SUM(CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN s.state = 'open' AND t.isoverdue = 1 THEN 1 ELSE 0 END) AS overdue
    FROM ${PREFIX}ticket t
<<<<<<< HEAD
    LEFT JOIN ${PREFIX}department d ON d.id = t.dept_id
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    GROUP BY d.id, d.name ORDER BY total DESC
=======
    JOIN ${PREFIX}department d ON d.id = t.dept_id
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    GROUP BY d.name ORDER BY total DESC
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
  `);
}

async function category_comparison(q) {
  return q(`
    SELECT
      COALESCE(NULLIF(TRIM(h.topic), ''), 'Uncategorized') AS label,
      COUNT(*) AS total,
      SUM(CASE WHEN s.state = 'open' AND (t.staff_id > 0 OR t.team_id > 0) THEN 1 ELSE 0 END) AS assigned,
      SUM(CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN s.state = 'open' AND t.isoverdue = 1 THEN 1 ELSE 0 END) AS overdue
    FROM ${PREFIX}ticket t
    LEFT JOIN ${PREFIX}help_topic h ON h.topic_id = t.topic_id
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
    GROUP BY h.topic_id, h.topic
    ORDER BY total DESC
  `);
}

async function agent_comparison(q) {
<<<<<<< HEAD
  // Total = all tickets ever assigned to this agent (any status). Tickets with
  // no individual owner are grouped as "Unassigned" so the agent totals add up
  // to ALL tickets (and overdue adds up to the Overdue KPI).
  return q(`
    SELECT COALESCE(CONCAT(st.firstname, ' ', st.lastname), 'Unassigned') AS label,
      COUNT(*) AS total,
      SUM(CASE WHEN s.state = 'open' AND st.staff_id IS NOT NULL THEN 1 ELSE 0 END) AS assigned,
=======
  // Total = all tickets ever assigned to this agent (any status).
  return q(`
    SELECT CONCAT(st.firstname, ' ', st.lastname) AS label,
      COUNT(*) AS total,
      SUM(CASE WHEN s.state = 'open' THEN 1 ELSE 0 END) AS assigned,
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
      SUM(CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN s.state = 'open' AND t.isoverdue = 1 THEN 1 ELSE 0 END) AS overdue
    FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket_status s ON s.id = t.status_id
<<<<<<< HEAD
    LEFT JOIN ${PREFIX}staff st ON st.staff_id = t.staff_id
    GROUP BY st.staff_id, st.firstname, st.lastname ORDER BY total DESC
  `);
}

const STOP = new Set(('a an the and or of to in on for with from at by is are was were be been it this that these those my me i we you your our '
  + 'please pls help need needs needed want cannot cant can not no yes hi hello dear sir madam regards thanks thank urgent issue problem '
  + 'request query re fw fwd about as but if so do does did have has had get got am will would should could there their them its into out up '
  + 'unable trying tried').split(' '));

async function ticket_keywords(q) {
  // ASSUMPTION: osTicket 1.10+ stores the subject in ost_ticket__cdata.subject.
  const rows = await q(`
    SELECT c.subject AS subject FROM ${PREFIX}ticket t
    JOIN ${PREFIX}ticket__cdata c ON c.ticket_id = t.ticket_id
    WHERE c.subject IS NOT NULL AND c.subject != ''
    ORDER BY t.created DESC LIMIT 5000
  `);
  const freq = new Map();
  for (const r of rows) {
    const seen = new Set();
    String(r.subject).toLowerCase().replace(/[^a-z\s'-]/g, ' ').split(/\s+/).forEach((w) => {
      w = w.replace(/^['-]+|['-]+$/g, '');
      if (w.length < 3 || STOP.has(w) || seen.has(w)) return;
      seen.add(w); // count each word once per ticket
      freq.set(w, (freq.get(w) || 0) + 1);
    });
  }
  return [...freq.entries()].map(([text, count]) => ({ text, count })).sort((a, b) => b.count - a.count).slice(0, 60);
}

=======
    JOIN ${PREFIX}staff st ON st.staff_id = t.staff_id
    GROUP BY st.staff_id ORDER BY total DESC
  `);
}

>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
module.exports = {
  summary, volume, by_department, by_category, by_source, assignment,
  agent_workload, resolved_per_agent, response_times, sla_compliance,
  trends_hourly, trends_daily, channel_mix,
  department_comparison, category_comparison, agent_comparison,
<<<<<<< HEAD
  resolution_pace, ticket_keywords,
=======
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
};
