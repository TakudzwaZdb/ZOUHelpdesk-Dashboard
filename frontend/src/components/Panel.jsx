import React from 'react';

export default function Panel({ title, span = 2, stale, loading, children }) {
  // Panels sit in a 1 / 2 / 4-column grid depending on screen width
  // (mobile / tablet / desktop). "span=2" panels are half-width once
  // there's room for two per row (tablet and up); "span=4" panels stay
  // full-width at every breakpoint. On mobile everything is a single
  // column regardless, so col-span-1 there is a no-op.
  const spanClass = span === 4 ? 'col-span-1 sm:col-span-2 lg:col-span-4' : 'col-span-1 lg:col-span-2';
  return (
    <div
      className={`${spanClass} relative bg-panel border border-panelBorder rounded-xl p-4 sm:p-5 transition-colors`}
    >
      <h2 className="panel-title text-[11px] sm:text-[11.5px] font-semibold mb-4 text-slate flex justify-between items-center gap-2">
        <span>{title}</span>
        {stale && <span className="text-[10px] font-semibold text-red shrink-0">⚠ no data</span>}
      </h2>
      {children}
    </div>
  );
}
