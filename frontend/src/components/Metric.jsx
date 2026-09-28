import React from 'react';

export function Metric({ value, label, loading, size = 'lg' }) {
  const sizeClass = size === 'lg' ? 'text-[28px] sm:text-[36px]' : 'text-[22px] sm:text-[26px]';
  return (
    <div className="flex-1 min-w-[110px]">
      <div
        className={`${sizeClass} font-extrabold leading-none font-serif ${loading ? 'skeleton-text' : ''}`}
      >
        {loading ? '000' : (value ?? '–')}
      </div>
      <div className="text-[11px] sm:text-[11.5px] text-slate mt-1.5 font-semibold tracking-wide">{label}</div>
    </div>
  );
}

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
    </div>
  );
}
