import React from 'react';

export default function ResolutionPace({ data, loading }) {
  const pct = data?.resolved_pct ?? 0;
  const target = data?.target_pct ?? 80;
  const onTrack = pct >= target;

  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <span className={`text-[32px] font-bold ${loading ? 'skeleton-text' : ''} ${onTrack ? 'text-green' : 'text-gold'}`}>
            {loading ? '00%' : `${pct}%`}
          </span>
          <span className="text-[12.5px] text-slate ml-2">resolved of all tickets</span>
        </div>
        <div className="text-right text-[12.5px] text-slate">
          Target: <span className="font-semibold text-ink2">{target}%</span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-2 rounded-full bg-line overflow-hidden">
        {/* Fill */}
        <div
          className={`h-full rounded-full transition-all duration-500 ${onTrack ? 'bg-green' : 'bg-gold'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
        {/* Target marker line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-ink"
          style={{ left: `${Math.min(target, 100)}%` }}
          title={`${target}% target`}
        />
      </div>

      <div className="mt-2 text-[11.5px] text-slate">
        {loading
          ? 'Loading…'
          : onTrack
            ? `On track — ${(pct - target).toFixed(1)} pts above the ${target}% target`
            : `${(target - pct).toFixed(1)} pts below the ${target}% target`}
      </div>
    </div>
  );
}
