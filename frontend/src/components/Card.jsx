import React from 'react';

// Small infographic card: tiny title, chart, and a coloured-dash legend
// (mirrors the little legend lines under each chart in the reference).
export default function Card({ title, sub, legend, stale, span = 1, children }) {
  return (
    <div className={`relative bg-panel border border-panelBorder rounded-2xl p-4 sm:p-6 flex flex-col min-w-0 ${span === 2 ? 'lg:col-span-2' : span === 3 ? 'lg:col-span-2 xl:col-span-3' : ''}`}>
      <h2 className="panel-title text-[13px] font-semibold text-slate mb-1 flex justify-between gap-2">
        <span>{title}</span>
        {stale && <span className="text-red shrink-0">⚠</span>}
      </h2>
      {sub ? <p className="text-[12px] text-slate/90 mb-4 leading-snug">{sub}</p> : <div className="mb-3" />}
      <div className="flex-1 min-h-0 rounded-xl border border-panelBorder bg-bg/50 p-3 sm:p-4">{children}</div>
      {legend && (
        <ul className={`mt-4 ${span > 1 ? 'flex flex-wrap gap-x-8 gap-y-1.5' : 'space-y-1.5'}`}>
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5 text-[12px] text-slate">
              <span className="inline-block w-4 h-[3px] rounded-full shrink-0" style={{ background: l.color }} />
              <span>{l.label}</span>
              <span className="ml-auto text-ink2 font-semibold tabular-nums">{l.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
