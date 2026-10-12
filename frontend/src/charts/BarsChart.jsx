import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext.jsx';
import { axisOpts, valueLabels } from './common.js';
import { useNarrow } from './useNarrow.js';

// Generic bar chart. series = [{ label, data, color }]
export default function BarsChart({ labels, series, horizontal: horizontalProp = false, thickness = 10, height = 260, gap, xTitle, yTitle }) {
  const horizontal = horizontalProp;
  const { chartColors } = useTheme();
  const narrow = useNarrow();
  // Vertical bars stay vertical: with many categories the chart keeps a minimum width per
  // category and scrolls sideways inside its box instead of squeezing labels together.
  const dense = labels.length > 14;
  const minW = labels.length * (series.length * (dense ? 13 : 15) + (dense ? 18 : 26));
  if (dense && !horizontal) thickness = 12;
  // horizontal bars grow with the number of rows so every name stays readable
  if (horizontal) height = Math.max(height, labels.length * (series.length * (thickness + 2) + 12) + 90);
  const data = {
    labels,
    datasets: series.map((s) => ({
      label: s.label,
      data: s.data,
      backgroundColor: s.color,
      borderRadius: 3,
      borderSkipped: horizontal ? 'left' : 'bottom',
      maxBarThickness: narrow ? Math.max(9, Math.round(thickness * 0.7)) : thickness,
      barPercentage: 0.85,
      categoryPercentage: gap ?? 0.7,
      minBarLength: 3,
    })),
  };
  const axes = axisOpts(chartColors, { xTitle, yTitle, narrow, count: horizontal ? 0 : labels.length });
  if (horizontal) {
    axes.x.grid.display = true;
    axes.y.grid.display = false;
    axes.y.ticks = { color: chartColors.text, font: { size: 11 } };
    axes.x.grace = '12%';
    axes.x.grid.display = true;
  }
  const options = {
    layout: { padding: { top: 10, right: 22 } },
    indexAxis: horizontal ? 'y' : 'x',
    plugins: { legend: { display: false }, valueLabels: { display: true, skipZero: false, size: narrow ? 8.5 : 9.5 } },
    scales: axes,
    maintainAspectRatio: false,
    animation: { duration: 300 },
  };
  return (
    <div className={horizontal ? '' : 'overflow-x-auto'}>
      {!horizontal && ((narrow && labels.length > 6) || labels.length > 20) && <div className="text-[10px] text-slate mb-1">← scroll sideways to see all {labels.length} →</div>}
      <div style={{ height: narrow ? height + 40 : height, minWidth: horizontal ? undefined : `${minW}px` }}>
        <Bar data={data} options={options} plugins={[valueLabels]} />
      </div>
    </div>
  );
}
