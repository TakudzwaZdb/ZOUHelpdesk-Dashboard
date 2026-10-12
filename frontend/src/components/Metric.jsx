import React from 'react';

export function Metric({ value, label, loading, size = 'lg' }) {
  const sizeClass = size === 'lg' ? 'text-[28px] sm:text-[36px]' : 'text-[22px] sm:text-[26px]';
  return (
    <div className="flex-1 min-w-[110px]">
      <div
<<<<<<< HEAD
        className={`${sizeClass} font-bold leading-none ${loading ? 'skeleton-text' : ''}`}
=======
        className={`${sizeClass} font-extrabold leading-none font-serif ${loading ? 'skeleton-text' : ''}`}
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
      >
        {loading ? '000' : (value ?? '–')}
      </div>
      <div className="text-[11px] sm:text-[11.5px] text-slate mt-1.5 font-semibold tracking-wide">{label}</div>
    </div>
  );
}

<<<<<<< HEAD
export function KpiCard({ accent, value, label, sub, loading, wide }) {
  const borderColor = {
    blue: 'text-blue',
    red: 'text-red',
    gold: 'text-gold',
    green: 'text-green',
    violet: 'text-violet',
  }[accent];
  const dot = {
    blue: 'bg-blue',
    red: 'bg-red',
    gold: 'bg-gold',
    green: 'bg-green',
    violet: 'bg-violet',
  }[accent];
  return (
    <div
      className={`bg-panel border border-panelBorder rounded-xl px-4 sm:px-5 py-4 sm:py-5 transition-colors ${wide ? 'col-span-2 lg:col-span-1' : ''}`}
    >
      <div className="flex items-center gap-2 text-[11px] text-slate font-semibold tracking-[0.06em]">
        <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
        {label}
      </div>
      <div className={`text-[24px] sm:text-[30px] font-bold leading-none mt-3 ${borderColor} ${loading ? 'skeleton-text' : ''}`}>
        {loading ? '000' : (value ?? '–')}
      </div>
      {sub && <div className="text-[11.5px] text-slate mt-2 leading-snug">{sub}</div>}
=======
export function KpiCard({ accent, value, label, loading }) {
  const borderColor = {
    blue: 'border-t-blue',
    red: 'border-t-red',
    gold: 'border-t-gold',
    green: 'border-t-green',
  }[accent];
  return (
    <div
      className={`bg-panel border border-panelBorder ${borderColor} border-t-4 rounded-[10px] px-4 sm:px-[18px] py-3.5 sm:py-4 shadow-sm transition-colors`}
    >
      <div className={`text-[28px] sm:text-[36px] font-extrabold leading-none font-serif ${loading ? 'skeleton-text' : ''}`}>
        {loading ? '000' : (value ?? '–')}
      </div>
      <div className="text-[11.5px] sm:text-[12.5px] text-slate mt-1.5 font-semibold tracking-wide">{label}</div>
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
    </div>
  );
}
