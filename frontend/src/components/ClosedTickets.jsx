import React from 'react';

// Closed tickets shown on their own: a big number plus a thin ring showing
// what share of all tickets are closed.
export default function ClosedTickets({ closed, open, loading }) {
  const total = (closed ?? 0) + (open ?? 0);
  const pct = total ? Math.round((closed / total) * 100) : 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-5">
      <svg width="132" height="132" viewBox="0 0 132 132" className="shrink-0" role="img" aria-label={`${pct}% closed`}>
        <circle cx="66" cy="66" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle
          cx="66" cy="66" r={r} fill="none" stroke="var(--violet)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 66 66)"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        <text x="66" y="72" textAnchor="middle" fill="var(--ink)" fontSize="24" fontWeight="700">
          {loading ? '–' : `${pct}%`}
        </text>
      </svg>
      <div>
        <div className={`text-[38px] font-bold leading-none text-violet ${loading ? 'skeleton-text' : ''}`}>
          {loading ? '000' : (closed ?? '–')}
        </div>
        <div className="text-[11px] text-slate mt-2 font-semibold tracking-[0.06em]">CLOSED TICKETS</div>
      </div>
    </div>
  );
}
