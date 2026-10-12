import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext.jsx';

// series = [{ label: 'Workload', data: [...], color: '#3a6ea5' }, ...]
export default function GroupedBarChart({ labels, series, yStepSize }) {
  const { chartColors } = useTheme();
  const data = {
    labels,
    datasets: series.map((s) => ({
      label: s.label,
      data: s.data,
      backgroundColor: s.color,
      borderRadius: { topLeft: 3, topRight: 3 },
      borderSkipped: 'bottom',
      // Each series' bars stay wide enough to read even with 4 bars per
      // category, and categories stay clearly separated from each other.
      barPercentage: 0.8,
      categoryPercentage: 0.8,
      maxBarThickness: 12,
      // Guarantees every non-zero bar renders at least this tall in
      // pixels, so a small value (e.g. Overdue: 3) next to a much larger
      // one (Total: 128) still shows as a visible, clickable bar instead
      // of a near-invisible sliver. Kept small (4px) rather than large —
      // a big floor would make genuinely different small values (2 vs 5,
      // say) all render at the same height and look identical, defeating
      // the point. The taller chart box below does more of the real work:
      // more pixels per data unit means small values separate from each
      // other visually well above this floor.
      minBarLength: 4,
    })),
  };
  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: chartColors.text, boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 12 }, padding: 14 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: chartColors.text, font: { size: 12 } },
      },
      y: {
        grid: { color: chartColors.grid },
        border: { display: false },
        // Fixed, tighter tick spacing (e.g. every 5) instead of Chart.js's
        // auto-picked steps, so the gridlines stay readable at kiosk size.
        ticks: { color: chartColors.text, font: { size: 12 }, stepSize: yStepSize },
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
    animation: { duration: 300 },
  };
  return (
    <div className="h-[420px]">
      <Bar data={data} options={options} />
    </div>
  );
}
