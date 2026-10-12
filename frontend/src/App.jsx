import React from 'react';
import { useEndpoint } from './hooks/useEndpoint.js';
import { KpiCard } from './components/Metric.jsx';
import Card from './components/Card.jsx';
import StatusBadge from './components/StatusBadge.jsx';
import ThemeSwitcher from './components/ThemeSwitcher.jsx';
import Clock from './components/Clock.jsx';
import LinesChart from './charts/LinesChart.jsx';
import BarsChart from './charts/BarsChart.jsx';
import RadarChart from './charts/RadarChart.jsx';
import WordCloud from './charts/svg/WordCloud.jsx';
import { ConcentricRings, MiniDonuts, SegDonut, GlobePie, Bubbles } from './charts/svg/Rings.jsx';
import { C, short } from './charts/common.js';

const sum = (a) => a.reduce((x, y) => x + (Number(y) || 0), 0);
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const dayLabel = (iso) => {
  const dt = new Date(`${iso}T00:00:00`);
  return `${dt.toLocaleDateString('en-GB', { weekday: 'short' })} ${iso.slice(5)}`;
};
const movAvg = (a, n) => a.map((_, i) => {
  const w = a.slice(Math.max(0, i - n + 1), i + 1);
  return Math.round((sum(w) / w.length) * 10) / 10;
});

export default function App() {
  const summary = useEndpoint('summary');
  const volume = useEndpoint('volume');
  const assignment = useEndpoint('assignment');
  const daily = useEndpoint('trends-daily');
  const hourly = useEndpoint('trends-hourly');
  const response = useEndpoint(['response-times', 'sla-compliance']);
  const dept = useEndpoint('by-department');
  const category = useEndpoint('by-category');
  const source = useEndpoint('by-source');
  const channel = useEndpoint('channel-mix');
  const workload = useEndpoint('agent-workload');
  const resolvedAgent = useEndpoint('resolved-per-agent');
  const deptCmp = useEndpoint('department-comparison');
  const catCmp = useEndpoint('category-comparison');
  const agentCmp = useEndpoint('agent-comparison');
  const pace = useEndpoint('resolution-pace');
  const keywords = useEndpoint('ticket-keywords');

  const all = [summary, volume, assignment, daily, hourly, response, dept, category, source, channel, workload, resolvedAgent, deptCmp, catCmp, agentCmp, pace, keywords];
  const anyLoading = all.some((p) => p.loading);
  const lastUpdated = [summary, volume, dept].map((p) => p.lastUpdated).filter(Boolean).sort().pop();

  const s = summary.data;
  const sla = response.data?.[1]?.within_sla_pct ?? 0;
  const asg = assignment.data;
  const allTotal = pace.data?.total ?? 0;
  const dayVals = daily.data?.map((d) => Number(d.count) || 0) || [];
  const cum = dayVals.reduce((acc, v) => [...acc, (acc[acc.length - 1] || 0) + v], []);
  const vol = volume.data;
  const ch = channel.data;
  const src = source.data || [];
  const srcColors = [C.teal, C.gold, C.blue, C.red, C.violet];
  const col = (rows, k) => (rows || []).map((d) => (k === 'label' || k === 'agent' || k === 'date' || k === 'hour' ? d[k] : Number(d[k]) || 0));
  const openTotal = asg ? asg.assigned + asg.unassigned : 0;
  const withPct = (n, tot) => `${n} · ${pct(n, tot)}%`;
  const otherStatus = Math.max(0, allTotal - (s?.open ?? 0) - (s?.resolved ?? 0) - (s?.closed ?? 0));
  const srcTotal = sum(col(src, 'count'));
  const chTotal = (ch?.ai_chatbot ?? 0) + (ch?.portal_and_other ?? 0);

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
      {/* Dashboard frame — a solid, hard-edged box with a clear margin around it */}
      <div className="border-2 border-slate rounded-2xl p-3 sm:p-6 lg:p-8 bg-bg shadow-[0_0_0_6px_var(--panel)]">
      {/* Header */}
      <div className="flex justify-between items-start sm:items-end mb-5 border-b border-panelBorder pb-4 flex-col sm:flex-row gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-[22px] font-semibold tracking-[0.08em] uppercase text-ink leading-tight">
            Student Helpdesk — Live Operations Dashboard
          </h1>
          <div className="flex items-center gap-2.5 mt-2 flex-wrap">
            <StatusBadge />
          </div>
        </div>
        <div className="flex items-center sm:items-end gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          <Clock />
          <ThemeSwitcher />
        </div>
      </div>

      {/* KPI row — actual ticket counts; closed tickets stands on its own */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <KpiCard accent="violet" value={allTotal || undefined} label="TOTAL TICKETS" sub="All tickets logged" loading={pace.loading} />
        <KpiCard accent="blue" value={s?.open} label="OPEN TICKETS" sub="Currently open" loading={summary.loading} />
        <KpiCard accent="red" value={s?.overdue} label="OVERDUE" sub={`Past SLA · of ${s?.open ?? '–'} open`} loading={summary.loading} />
        <KpiCard accent="gold" value={s?.pending} label="PENDING" sub={`Awaiting reply · of ${s?.open ?? '–'} open`} loading={summary.loading} />
        <KpiCard accent="green" value={s?.resolved} label="RESOLVED" sub={`${pct(s?.resolved ?? 0, allTotal)}% of all tickets`} loading={summary.loading} />
        <KpiCard accent="violet" value={s?.closed} label="CLOSED TICKETS" sub={`${pct(s?.closed ?? 0, allTotal)}% of all tickets`} loading={summary.loading} />
      </div>

      {/* 20 chart cards — every chart is titled, described, and has labelled axes/legend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 grid-flow-dense">
        <Card title="Resolution Target Pace" sub="Rings (outer → inner): % of all tickets Resolved · SLA compliance · target" stale={pace.stale}
          legend={[
            { label: 'Resolved (% of all tickets)', value: `${pace.data?.resolved_pct ?? '–'}%`, color: C.teal },
            { label: 'SLA compliance (last 30 days)', value: `${sla}%`, color: C.blue },
            { label: 'Resolution target', value: `${pace.data?.target_pct ?? 80}%`, color: C.gold },
            { label: 'Avg first response, last 30 days (min)', value: response.data?.[0]?.avg_first_response_minutes ?? '–', color: C.violet },
            { label: 'Avg resolution time, last 30 days (hrs)', value: response.data?.[0]?.avg_resolution_hours ?? '–', color: C.red },
          ]}>
          <ConcentricRings rings={[
            { label: 'Resolved', value: pace.data?.resolved_pct ?? 0, color: C.teal },
            { label: 'SLA compliance', value: sla, color: C.blue },
            { label: 'Target', value: pace.data?.target_pct ?? 80, color: C.gold },
          ]} />
          {(() => {
            const rp = Number(pace.data?.resolved_pct ?? 0), tg = Number(pace.data?.target_pct ?? 80), gap = Math.round((rp - tg) * 10) / 10, ok = gap >= 0;
            return (
              <div className="mt-3 px-1">
                <div className="flex justify-between items-baseline text-[11px] mb-1.5">
                  <span className="text-ink2 font-semibold uppercase tracking-wide">Overall pace vs target</span>
                  <span className={`font-bold tabular-nums ${ok ? 'text-green' : 'text-red'}`}>{ok ? 'Target met' : `${Math.abs(gap)} pts behind`}</span>
                </div>
                <div className="relative h-3 rounded-full bg-line">
                  <div className={`h-full rounded-full ${ok ? 'bg-green' : 'bg-blue'}`} style={{ width: `${Math.min(rp, 100)}%` }} />
                  <div className="absolute -top-1 -bottom-1 w-0.5 bg-gold" style={{ left: `${Math.min(tg, 100)}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-[11px] tabular-nums">
                  <span className="text-ink2 font-semibold">Resolved {rp}%</span>
                  <span className="text-gold font-semibold">Target {tg}% (marker)</span>
                </div>
              </div>
            );
          })()}
        </Card>
        <Card span={2} title="Tickets per Department" sub="Total, resolved and overdue tickets for each department (all time)" stale={deptCmp.stale}
          legend={[
            { label: 'Total tickets', value: sum(col(deptCmp.data, 'total')), color: C.gold },
            { label: 'Resolved', value: sum(col(deptCmp.data, 'resolved')), color: C.teal },
            { label: 'Overdue (open, past SLA)', value: sum(col(deptCmp.data, 'overdue')), color: C.red },
          ]}>
          {deptCmp.data && (
            <BarsChart height={340} thickness={22} gap={0.75} xTitle="Department" yTitle="Number of tickets" labels={col(deptCmp.data, 'label')}
              series={[
                { label: 'Total tickets', data: col(deptCmp.data, 'total'), color: C.gold },
                { label: 'Resolved', data: col(deptCmp.data, 'resolved'), color: C.teal },
                { label: 'Overdue', data: col(deptCmp.data, 'overdue'), color: C.red },
              ]} />
          )}
        </Card>
        <Card span={3} title="Daily Ticket Volume" sub="New tickets created each day over the last 14 days, with a 3-day moving average" stale={daily.stale}
          legend={[{ label: 'Tickets per day', value: `${sum(dayVals)} in 14 days`, color: C.gold }, { label: '3-day moving average', value: dayVals.length ? movAvg(dayVals, 3).slice(-1)[0] : '–', color: C.blue }]}>
          {daily.data && (
            <LinesChart showValues height={400} points={5} xTitle="Day and date (MM-DD)" yTitle="Tickets per day" labels={daily.data.map((d) => dayLabel(d.date))} tension={0.35}
              series={[{ label: 'Tickets per day', data: dayVals, color: C.gold }, { label: '3-day average', data: movAvg(dayVals, 3), color: C.blue, noLabels: true }]} />
          )}
        </Card>
        <Card title="Ticket Volume" sub="Tickets created today, this week and this month (circle area ∝ count)" stale={volume.stale}
          legend={[{ label: 'Today', value: vol?.today ?? '–', color: C.gold }, { label: 'This week', value: vol?.this_week ?? '–', color: C.blue }, { label: 'This month', value: vol?.this_month ?? '–', color: C.teal }]}>
          {vol && <Bubbles items={[
            { label: 'Today', value: vol.today, color: C.gold },
            { label: 'This week', value: vol.this_week, color: C.blue },
            { label: 'This month', value: vol.this_month, color: C.teal },
          ]} />}
        </Card>
        <Card span={2} title="Resolved vs Open Tickets per Agent" sub="Tickets each agent has resolved, compared with open tickets they still hold" stale={resolvedAgent.stale}
          legend={[{ label: 'Resolved', value: sum(col(resolvedAgent.data, 'resolved')), color: C.gold }, { label: 'Open', value: sum(col(workload.data, 'open_tickets')), color: C.blue }]}>
          {resolvedAgent.data && workload.data && (
            <BarsChart height={320} thickness={22} gap={0.75} xTitle="Agent" yTitle="Number of tickets" labels={col(resolvedAgent.data, 'agent')}
              series={[
                { label: 'Resolved', data: col(resolvedAgent.data, 'resolved'), color: C.gold },
                { label: 'Open', data: resolvedAgent.data.map((d) => workload.data.find((w) => w.agent === d.agent)?.open_tickets ?? 0), color: C.blue },
              ]} />
          )}
        </Card>
        <Card title="Agent Workload" sub="Open tickets currently assigned to each agent" stale={workload.stale}
          legend={[{ label: 'Open tickets (all agents)', value: sum(col(workload.data, 'open_tickets')), color: C.red }]}>
          {workload.data && (
            <BarsChart horizontal thickness={16} height={300} xTitle="Open tickets" yTitle="Agent" labels={col(workload.data, 'agent')}
              series={[{ label: 'Open tickets', data: col(workload.data, 'open_tickets'), color: C.red }]} />
          )}
        </Card>
        <Card title="Ticket Shares" sub="Assigned & unassigned: % of open tickets · Overdue: % of open · Closed: % of all tickets" stale={assignment.stale}>
          <MiniDonuts items={[
            { label: 'Assigned (of open)', value: asg ? pct(asg.assigned, openTotal) : 0, color: C.teal },
            { label: 'Unassigned (of open)', value: asg ? pct(asg.unassigned, openTotal) : 0, color: C.gold },
            { label: 'Closed (of all tickets)', value: pct(s?.closed ?? 0, allTotal), color: C.violet },
            { label: 'Overdue (of open)', value: pct(s?.overdue ?? 0, s?.open ?? 0), color: C.red },
          ]} />
        </Card>
        <Card title="Ticket Status" sub="Open, resolved and other-status tickets (Closed tickets are shown on their own above)" stale={summary.stale}
          legend={[
            { label: 'Open', value: s?.open ?? '–', color: C.blue },
            { label: 'Resolved', value: s?.resolved ?? '–', color: C.teal },
            ...(otherStatus > 0 ? [{ label: 'Other statuses', value: otherStatus, color: C.gold }] : []),
          ]}>
          {s && (
            <SegDonut items={[
              { label: 'Open', value: s.open, color: C.blue },
              { label: 'Resolved', value: s.resolved, color: C.teal },
              ...(otherStatus > 0 ? [{ label: 'Other statuses', value: otherStatus, color: C.gold }] : []),
            ]} center={{ value: s.open + s.resolved + otherStatus, label: 'EXCL. CLOSED' }} />
          )}
        </Card>
        <Card title="Tickets by Source" sub="All tickets by the channel they came in through" stale={source.stale}
          legend={src.map((d, i) => ({ label: d.label, value: withPct(d.count, srcTotal), color: srcColors[i % 5] }))}>
          {src.length > 0 && (
            <SegDonut hub items={src.map((d, i) => ({ label: d.label, value: d.count, color: srcColors[i % 5] }))}
              center={{ value: srcTotal, label: 'TICKETS' }} />
          )}
        </Card>
        <Card span={2} title="Hourly Ticket Volume" sub="New tickets created in each hour of the last 24 hours" stale={hourly.stale}
          legend={[{ label: 'Tickets per hour', value: `${sum(col(hourly.data, 'count'))} in 24 hours`, color: C.blue }]}>
          {hourly.data && (
            <LinesChart height={320} xTitle="Hour of day" yTitle="Tickets per hour" labels={hourly.data.map((d) => d.hour)} tension={0}
              series={[{ label: 'Tickets per hour', data: col(hourly.data, 'count'), color: C.blue, fill: true }]} />
          )}
        </Card>
        <Card title="AI Chatbot vs Portal" sub="Tickets created in the last 30 days: AI chatbot (API source) vs portal & other" stale={channel.stale}
          legend={[{ label: 'AI Chatbot', value: withPct(ch?.ai_chatbot ?? 0, chTotal), color: C.teal }, { label: 'Portal / Other', value: withPct(ch?.portal_and_other ?? 0, chTotal), color: C.gold }]}>
          {ch && <GlobePie items={[{ label: 'AI Chatbot', value: ch.ai_chatbot, color: C.teal }, { label: 'Portal / Other', value: ch.portal_and_other, color: C.gold }]} />}
        </Card>
        <Card span={2} title="Most Frequent Words in Ticket Subjects" sub="Word cloud of the terms students use most in ticket subjects — bigger word = more tickets" stale={keywords.stale}
          legend={[{ label: 'Top word', value: keywords.data?.[0] ? `${keywords.data[0].text} · ${keywords.data[0].count}` : '–', color: C.teal }, { label: 'Distinct words shown', value: Math.min(keywords.data?.length ?? 0, 48), color: C.gold }]}>
          <WordCloud words={(keywords.data || []).map((k) => ({ text: String(k.text), count: Number(k.count) || 0 }))} />
        </Card>
        <Card span={3} title="Department Ticket Flow" sub="Assigned (open), resolved and overdue tickets for each department" stale={deptCmp.stale}
          legend={[
            { label: 'Assigned (open tickets with an owner)', value: sum(col(deptCmp.data, 'assigned')), color: C.blue },
            { label: 'Resolved', value: sum(col(deptCmp.data, 'resolved')), color: C.teal },
            { label: 'Overdue', value: sum(col(deptCmp.data, 'overdue')), color: C.red },
          ]}>
          {deptCmp.data && (
            <LinesChart showValues points={4} height={340} xTitle="Department" yTitle="Number of tickets" labels={col(deptCmp.data, 'label')} tension={0.4}
              series={[
                { label: 'Assigned', data: col(deptCmp.data, 'assigned'), color: C.blue },
                { label: 'Resolved', data: col(deptCmp.data, 'resolved'), color: C.teal },
                { label: 'Overdue', data: col(deptCmp.data, 'overdue'), color: C.red },
              ]} />
          )}
        </Card>
        <Card span={3} title="Cumulative Ticket Volume" sub="Running total of tickets created over the last 14 days" stale={daily.stale}
          legend={[{ label: 'Total tickets in 14 days', value: cum.slice(-1)[0] ?? '–', color: C.violet }]}>
          {daily.data && (
            <LinesChart showValues points={4} height={340} xTitle="Date (MM-DD)" yTitle="Cumulative tickets" labels={daily.data.map((d) => d.date.slice(5))} tension={0.4}
              series={[{ label: 'Cumulative tickets', data: cum, color: C.violet }]} />
          )}
        </Card>
        <Card span={3} title="Tickets per Agent: Total vs Overdue" sub="All tickets handled by each agent, compared with those overdue" stale={agentCmp.stale}
          legend={[{ label: 'Total tickets', value: sum(col(agentCmp.data, 'total')), color: C.gold }, { label: 'Overdue (open, past SLA)', value: sum(col(agentCmp.data, 'overdue')), color: C.red }]}>
          {agentCmp.data && (
            <BarsChart height={420} thickness={16} gap={0.8} xTitle="Agent" yTitle="Number of tickets" labels={col(agentCmp.data, 'label')}
              series={[{ label: 'Total tickets', data: col(agentCmp.data, 'total'), color: C.gold }, { label: 'Overdue', data: col(agentCmp.data, 'overdue'), color: C.red }]} />
          )}
        </Card>
        <Card span={3} title="Department: Resolved vs Total" sub="Resolved tickets compared with all tickets logged for each department" stale={deptCmp.stale}
          legend={[{ label: 'Resolved', value: sum(col(deptCmp.data, 'resolved')), color: C.blue }, { label: 'Total tickets', value: sum(col(deptCmp.data, 'total')), color: C.gold }]}>
          {deptCmp.data && (
            <LinesChart showValues points={4} height={320} xTitle="Department" yTitle="Number of tickets" labels={col(deptCmp.data, 'label')} tension={0.35}
              series={[{ label: 'Resolved', data: col(deptCmp.data, 'resolved'), color: C.blue }, { label: 'Total tickets', data: col(deptCmp.data, 'total'), color: C.gold }]} />
          )}
        </Card>
        <Card span={3} title="Tickets by Department" sub="All-time ticket count per department" stale={dept.stale}
          legend={[{ label: 'Busiest department', value: (dept.data || []).slice().sort((a, b) => b.count - a.count)[0]?.label ?? '–', color: C.teal }]}>
          {dept.data && (
            <LinesChart showValues height={340} xTitle="Department" yTitle="Number of tickets" labels={col(dept.data, 'label')} tension={0}
              series={[{ label: 'Tickets', data: col(dept.data, 'count'), color: C.teal, fill: true }]} />
          )}
        </Card>
        <Card span={3} title="Tickets by Category (Radar)" sub="Number of tickets in each category (all time) — each point is labelled with its count; rings show the scale" stale={category.stale}
          legend={[{ label: 'Tickets across all categories', value: sum(col(category.data, 'count')), color: C.violet }]}>
          {category.data && (
            <div className="flex flex-col xl:flex-row gap-6 items-stretch">
              <div className="flex-1 min-w-0">
                <RadarChart height={560} labels={col(category.data, 'label')}
                  series={[{ label: 'Tickets', data: col(category.data, 'count'), color: C.violet }]} />
              </div>
              <ul className="xl:w-56 space-y-1.5 self-center w-full max-h-[420px] overflow-y-auto pr-1">
                {category.data.slice().sort((x, y) => y.count - x.count).map((r) => {
                  const mx = Math.max(...col(category.data, 'count'), 1);
                  return (
                    <li key={r.label}>
                      <div className="flex justify-between gap-2 text-[11px] text-ink2 mb-0.5"><span className="truncate">{r.label}</span><span className="font-semibold text-ink tabular-nums">{r.count} · {pct(r.count, sum(col(category.data, 'count')))}%</span></div>
                      <div className="h-1.5 rounded-full bg-line overflow-hidden"><div className="h-full rounded-full bg-violet" style={{ width: `${(r.count / mx) * 100}%` }} /></div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>
        <Card span={3} title="Category: Total vs Resolved" sub="All tickets logged versus tickets resolved in each category" stale={catCmp.stale}
          legend={[{ label: 'Total tickets', value: sum(col(catCmp.data, 'total')), color: C.gold }, { label: 'Resolved', value: sum(col(catCmp.data, 'resolved')), color: C.violet }]}>
          {catCmp.data && (
            <LinesChart showValues points={4} height={340} xTitle="Category" yTitle="Number of tickets" labels={col(catCmp.data, 'label')} tension={0.35}
              series={[{ label: 'Total tickets', data: col(catCmp.data, 'total'), color: C.gold }, { label: 'Resolved', data: col(catCmp.data, 'resolved'), color: C.violet }]} />
          )}
        </Card>
        <Card span={3} title="Overdue Tickets by Category" sub="Open tickets that are past their SLA, per category" stale={catCmp.stale}
          legend={[{ label: 'Overdue tickets (total)', value: sum(col(catCmp.data, 'overdue')), color: C.red }]}>
          {catCmp.data && (
            <LinesChart showValues height={360} xTitle="Category" yTitle="Overdue tickets" labels={col(catCmp.data, 'label')} tension={0}
              series={[{ label: 'Overdue', data: col(catCmp.data, 'overdue'), color: C.red, fill: true }]} />
          )}
        </Card>
        <Card span={3} title="Assigned vs Overdue Tickets by Category" sub="Open tickets that have an owner (assigned) compared with open tickets past their SLA (overdue)" stale={catCmp.stale}
          legend={[{ label: 'Assigned (open, has an owner)', value: sum(col(catCmp.data, 'assigned')), color: C.blue }, { label: 'Overdue (open, past SLA)', value: sum(col(catCmp.data, 'overdue')), color: C.red }]}>
          {catCmp.data && (
            <BarsChart height={360} thickness={26} gap={0.6} xTitle="Category" yTitle="Number of tickets" labels={col(catCmp.data, 'label')}
              series={[{ label: 'Assigned', data: col(catCmp.data, 'assigned'), color: C.blue }, { label: 'Overdue', data: col(catCmp.data, 'overdue'), color: C.red }]} />
          )}
        </Card>
      </div>

      <div className="mt-4 text-center text-slate text-[11.5px] flex items-center justify-center gap-1.5">
        {anyLoading && (
          <span className="inline-block w-[9px] h-[9px] rounded-full border-2 border-panelBorder border-t-blue animate-spin" />
        )}
        {lastUpdated ? lastUpdated.toLocaleTimeString() : '–'}
      </div>
      </div>
    </div>
  );
}
