import React from 'react';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext.jsx';
import { axisOpts, valueLabels } from './common.js';
import { useNarrow } from './useNarrow.js';

// Generic line / area chart. series = [{ label, data, color, fill?, dashed? }]
export default function LinesChart({ labels, series, tension = 0.4, points = 0, showValues = false, height = 260, xTitle, yTitle, rotate }) {
  const { chartColors } = useTheme();
  const narrow = useNarrow();
  const data = {
    labels,
    datasets: series.map((s) => ({
      label: s.label,
      noLabels: s.noLabels,
      data: s.data,
      borderColor: s.color,
      backgroundColor: s.color + '2e',
      fill: !!s.fill,
      tension,
      borderWidth: 3,
      borderDash: s.dashed ? [4, 4] : undefined,
      pointRadius: points,
      pointBackgroundColor: s.color,
      pointBorderColor: '#21222d',
      pointBorderWidth: 2,
      pointHoverRadius: 5,
    })),
  };
  const axes = axisOpts(chartColors, { xTitle, yTitle, narrow, count: labels.length });
  if (rotate) { axes.x.ticks.minRotation = rotate; axes.x.ticks.maxRotation = rotate; }
  const options = {
    layout: { padding: { top: 10, right: 22 } },
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: false }, valueLabels: { display: showValues, size: narrow ? 8.5 : 9.5 } },
    scales: axes,
    maintainAspectRatio: false,
    animation: { duration: 300 },
  };
  return (
    <div className="overflow-x-auto">
      <div style={{ height: narrow ? height + 60 : height, minWidth: labels.length > 16 ? `${labels.length * 40}px` : undefined }}>
        <Line data={data} options={options} plugins={[valueLabels]} />
      </div>
    </div>
  );
}
