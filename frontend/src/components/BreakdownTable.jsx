import React from 'react';

export default function BreakdownTable({ rows }) {
  if (!rows) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="text-left text-slate border-b border-panelBorder">
            <th className="py-1.5 pr-3 font-semibold">Name</th>
            <th className="py-1.5 pr-3 font-semibold text-right">Assigned</th>
            <th className="py-1.5 pr-3 font-semibold text-right">Assigned %</th>
            <th className="py-1.5 pr-3 font-semibold text-right">Resolved</th>
            <th className="py-1.5 font-semibold text-right">Resolved %</th>
          </tr>
        </thead>
        <tbody> 
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-panelBorder last:border-0">
              <td className="py-1.5 pr-3 text-ink">{r.label}</td>
              <td className="py-1.5 pr-3 text-right text-ink2">{r.assigned}</td>
              <td className="py-1.5 pr-3 text-right text-ink2">{r.assigned_pct}%</td>
              <td className="py-1.5 pr-3 text-right text-ink2">{r.resolved}</td>
              <td className="py-1.5 text-right text-ink2">{r.resolved_pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
