import React from 'react';
import { Radar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext.jsx';
import { valueLabels } from './common.js';
import { useNarrow } from './useNarrow.js';

// Wrap long category names onto several short lines so none are clipped.
const wrap = (text, max) => {
  const words = String(text).split(' ');
  const lines = [];
  let cur = '';
  words.forEach((w) => {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  });
  if (cur) lines.push(cur);
  return lines;
};

export default function RadarChart({ labels, series, height = 340 }) {
  const { theme } = useTheme();
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const light = theme === 'light';
  const ink = css('--ink') || '#e8eaf2';
  const ink2 = css('--ink-2') || '#c3cbe0';
  const narrow = useNarrow();
  const many = labels.length > 10;
  const primary = series[0]?.data || [];
  // Name (wrapped) + its count on its own line, so every value is readable even when the polygon is crowded.
  const pointLabels = labels.map((l, i) => [...wrap(l, narrow ? 12 : 16), `${primary[i] ?? ''}`]);
  const data = {
    labels: pointLabels,
    datasets: series.map((s) => ({
      label: s.label,
      data: s.data,
      borderColor: s.color,
      backgroundColor: s.color + (light ? '40' : '55'),
      borderWidth: 3,
      pointRadius: many ? 3 : 5,
      pointBackgroundColor: s.color,
      pointBorderColor: light ? '#ffffff' : '#e8eaf2',
      pointBorderWidth: 1.5,
    })),
  };
  const gridColor = light ? 'rgba(43,61,92,0.28)' : 'rgba(163,174,203,0.30)';
  const options = {
    plugins: { legend: { display: false }, valueLabels: { display: !many, size: narrow ? 8.5 : 10 } },
    layout: { padding: narrow ? 4 : 16 },
    scales: {
      r: {
        grid: { color: gridColor },
        angleLines: { color: gridColor },
        ticks: { display: true, color: ink2, backdropColor: 'transparent', font: { size: 9 }, maxTicksLimit: 5 },
        pointLabels: { color: ink, font: { size: narrow ? (many ? 8 : 9) : (many ? 10 : 11.5), weight: '600' } },
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
    animation: { duration: 300 },
  };
  const h = narrow ? (many ? 460 : 400) : many ? Math.max(height, 700) : height;
  return (
    <div style={{ height: h }}>
      <Radar data={data} options={options} plugins={[valueLabels]} />
    </div>
  );
}
