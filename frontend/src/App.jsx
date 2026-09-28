import React from 'react';
import { useEndpoint } from './hooks/useEndpoint.js';
import { KpiCard, Metric } from './components/Metric.jsx';
import Panel from './components/Panel.jsx';
import StatusBadge from './components/StatusBadge.jsx';
import ThemeSwitcher from './components/ThemeSwitcher.jsx';
import Clock from './components/Clock.jsx';
import BarChart from './charts/BarChart.jsx';
import LineChart from './charts/LineChart.jsx';
import DonutChart from './charts/DonutChart.jsx';
import GroupedBarChart from './charts/GroupedBarChart.jsx';

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
  const deptComparison = useEndpoint('department-comparison');
  const categoryComparison = useEndpoint('category-comparison');
  const agentComparison = useEndpoint('agent-comparison');

  const anyLoading = [summary, volume, assignment, daily, hourly, response, dept, category, source, channel, workload, resolvedAgent]
    .some((p) => p.loading);
  const lastUpdated = [summary, volume, dept].map((p) => p.lastUpdated).filter(Boolean).sort().pop();

  return (
    <div className="p-4 sm:p-6 lg:p-[22px_28px_30px] max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start sm:items-end mb-5 border-b-2 border-ink pb-3.5 flex-col sm:flex-row gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-[26px] font-serif font-semibold text-ink leading-tight">
            Student Helpdesk — Live Operations Dashboard
          </h1>
          <div className="flex items-center gap-2.5 text-slate text-[12px] sm:text-[13px] mt-1.5 flex-wrap">
            <StatusBadge />
            <span>Auto-refreshing every 45s · view-only · aggregate statistics only</span>
          </div>
        </div>
        <div className="flex items-center sm:items-end gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          <Clock />
          <ThemeSwitcher />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 mb-4">
        <KpiCard accent="blue" value={summary.data?.open} label="OPEN TICKETS" loading={summary.loading} />
        <KpiCard accent="red" value={summary.data?.overdue} label="OVERDUE" loading={summary.loading} />
        <KpiCard accent="gold" value={summary.data?.pending} label="PENDING (AWAITING STUDENT)" loading={summary.loading} />
        <KpiCard accent="green" value={summary.data?.resolved} label="RESOLVED" loading={summary.loading} />
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        <Panel title="Ticket Volume" stale={volume.stale}>
          <div className="flex gap-5 flex-wrap">
            <Metric value={volume.data?.today} label="Today" loading={volume.loading} size="sm" />
            <Metric value={volume.data?.this_week} label="This Week" loading={volume.loading} size="sm" />
            <Metric value={volume.data?.this_month} label="This Month" loading={volume.loading} size="sm" />
          </div>
        </Panel>

        <Panel title="Assigned vs Unassigned" stale={assignment.stale}>
          {assignment.data && (
            <DonutChart labels={['Assigned', 'Unassigned']} values={[assignment.data.assigned, assignment.data.unassigned]} />
          )}
        </Panel>

        <Panel title="Daily Ticket Volume — Last 14 Days" span={4} stale={daily.stale}>
          {daily.data && <LineChart labels={daily.data.map((d) => d.date)} values={daily.data.map((d) => d.count)} />}
        </Panel>

        <Panel title="Hourly Ticket Volume — Last 24h" stale={hourly.stale}>
          {hourly.data && <LineChart labels={hourly.data.map((d) => d.hour)} values={hourly.data.map((d) => d.count)} />}
        </Panel>

        <Panel title="Response & Resolution / SLA" stale={response.stale}>
          <div className="flex gap-5 flex-wrap">
            <Metric value={response.data?.[0]?.avg_first_response_minutes} label="Avg first response (min)" loading={response.loading} size="sm" />
            <Metric value={response.data?.[0]?.avg_resolution_hours} label="Avg resolution (hrs)" loading={response.loading} size="sm" />
            <Metric value={response.data?.[1] ? `${response.data[1].within_sla_pct}%` : undefined} label="SLA compliance" loading={response.loading} size="sm" />
          </div>
        </Panel>

        <Panel title="Tickets by Department" stale={dept.stale}>
          {dept.data && <BarChart labels={dept.data.map((d) => d.label)} values={dept.data.map((d) => d.count)} yStepSize={10} />}
        </Panel>

       <Panel title="Tickets by Category" stale={category.stale}>
  {category.data && <BarChart labels={category.data.map((d) => d.label)} values={category.data.map((d) => d.count)} yStepSize={10} />}
</Panel>

        <Panel title="Tickets by Source" stale={source.stale}>
          {source.data && <DonutChart labels={source.data.map((d) => d.label)} values={source.data.map((d) => d.count)} />}
        </Panel>

        <Panel title="AI Chatbot vs Portal-Generated" stale={channel.stale}>
          {channel.data && (
            <DonutChart labels={['AI Chatbot', 'Portal / Other']} values={[channel.data.ai_chatbot, channel.data.portal_and_other]} />
          )}
        </Panel>

        <Panel title="Agent Workload (open tickets)" stale={workload.stale}>
          {workload.data && <BarChart labels={workload.data.map((d) => d.agent)} values={workload.data.map((d) => d.open_tickets)} />}
        </Panel>

        <Panel title="Tickets Resolved per Agent" stale={resolvedAgent.stale}>
          {resolvedAgent.data && <BarChart labels={resolvedAgent.data.map((d) => d.agent)} values={resolvedAgent.data.map((d) => d.resolved)} />}
        </Panel>

        <Panel title="Total vs Assigned vs Resolved vs Overdue by Department" span={4} stale={deptComparison.stale}>
          {deptComparison.data && (
            <GroupedBarChart
              labels={deptComparison.data.map((d) => d.label)}
              yStepSize={5}
              series={[
                { label: 'Total', data: deptComparison.data.map((d) => d.total), color: '#c8952e' },
                { label: 'Assigned', data: deptComparison.data.map((d) => d.assigned), color: '#3a6ea5' },
                { label: 'Resolved', data: deptComparison.data.map((d) => d.resolved), color: '#2f7d55' },
                { label: 'Overdue', data: deptComparison.data.map((d) => d.overdue), color: '#b3413a' },
              ]}
            />
          )}
        </Panel>

        <Panel title="Total vs Assigned vs Resolved vs Overdue by Category" span={4} stale={categoryComparison.stale}>
          {categoryComparison.data && (
            <GroupedBarChart
              labels={categoryComparison.data.map((d) => d.label)}
              yStepSize={5}
              series={[
                { label: 'Total', data: categoryComparison.data.map((d) => d.total), color: '#c8952e' },
                { label: 'Assigned', data: categoryComparison.data.map((d) => d.assigned), color: '#3a6ea5' },
                { label: 'Resolved', data: categoryComparison.data.map((d) => d.resolved), color: '#2f7d55' },
                { label: 'Overdue', data: categoryComparison.data.map((d) => d.overdue), color: '#b3413a' },
              ]}
            />
          )}
        </Panel>

        <Panel title="Total vs Assigned vs Resolved vs Overdue by Agent" span={4} stale={agentComparison.stale}>
          {agentComparison.data && (
            <GroupedBarChart
              labels={agentComparison.data.map((d) => d.label)}
              yStepSize={5}
              series={[
                { label: 'Total', data: agentComparison.data.map((d) => d.total), color: '#c8952e' },
                { label: 'Assigned', data: agentComparison.data.map((d) => d.assigned), color: '#3a6ea5' },
                { label: 'Resolved', data: agentComparison.data.map((d) => d.resolved), color: '#2f7d55' },
                { label: 'Overdue', data: agentComparison.data.map((d) => d.overdue), color: '#b3413a' },
              ]}
            />
          )}
        </Panel>
      </div>

      <div className="mt-4 text-center text-slate text-[11.5px] flex items-center justify-center gap-1.5">
        {anyLoading && (
          <span className="inline-block w-[9px] h-[9px] rounded-full border-2 border-panelBorder border-t-blue animate-spin" />
        )}
        ZOU Student Affairs · Helpdesk Analytics · Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '–'}
      </div>
    </div>
  );
}
