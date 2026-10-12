import React from 'react';

// Exact values shown on their own, beside the chart, instead of on top of the lines.
// items = [{ label, values: [{ name, value, color }] }]
export default function ValueStrip({ items }) {
  return (
    <div className="mt-5 grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))' }}>
      {items.map((it) => (
        <div key={it.label} className="rounded-lg border border-panelBorder bg-bg/60 px-3 py-2">
          <div className="text-[12px] font-semibold text-ink2 mb-1 leading-tight">{it.label}</div>
          {it.values.map((v) => (
            <div key={v.name} className="flex items-center gap-1.5 text-[12px] text-slate">
              <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: v.color }} />
              <span>{v.name}</span>
              <span className="ml-auto text-ink font-bold tabular-nums">{v.value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
