import React from 'react';

export default function PerformanceMatrix({ rows, nameLabel = 'Name' }) {
  if (!rows) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="text-left text-slate border-b border-panelBorder">
            <th className="py-1.5 pr-3 font-semibold">{nameLabel}</th>
            <th className="py-1.5 pr-3 font-semibold text-right">Total</th>
            <th className="py-1.5 pr-3 font-semibold text-right">Assigned</th>
            <th className="py-1.5 pr-3 font-semibold text-right">Resolved</th>
            <th className="py-1.5 pr-3 font-semibold text-right">Overdue</th>
            <th className="py-1.5 font-semibold text-right">Resolution %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const pct = r.total ? Math.round((r.resolved / r.total) * 1000) / 10 : 0;
            const pctColor = pct >= 80 ? 'text-green' : pct >= 50 ? 'text-gold' : 'text-red';
            return (
              <tr key={r.label} className="border-b border-panelBorder last:border-0">
                <td className="py-1.5 pr-3 text-ink">{r.label}</td>
                <td className="py-1.5 pr-3 text-right text-ink2">{r.total}</td>
                <td className="py-1.5 pr-3 text-right text-ink2">{r.assigned}</td>
                <td className="py-1.5 pr-3 text-right text-ink2">{r.resolved}</td>
                <td className="py-1.5 pr-3 text-right text-ink2">{r.overdue}</td>
                <td className={`py-1.5 text-right font-semibold ${pctColor}`}>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
