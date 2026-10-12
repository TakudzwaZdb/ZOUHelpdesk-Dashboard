import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext.jsx';
import { PALETTE } from './setup.js';

export default function BarChart({ labels, values, horizontal = false, yStepSize }) {
  const { chartColors } = useTheme();
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: 'bottom',
        // Wider, more clearly spaced bars — easier to read and to point at
        // on a kiosk screen than Chart.js's default thin/dense bars.
        barPercentage: 0.7,
        categoryPercentage: 0.75,
        maxBarThickness: 16,
      },
    ],
  };
  const options = {
    indexAxis: horizontal ? 'y' : 'x',
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: chartColors.text, font: { size: 12 } },
      },
      y: {
        grid: { color: chartColors.grid },
        border: { display: false },
        ticks: {
          color: chartColors.text,
          font: { size: 12 },
          // Fixed spacing between gridlines/labels on the value axis (e.g.
          // 10 -> 0,10,20,30...) instead of Chart.js's auto-picked steps.
          stepSize: !horizontal ? yStepSize : undefined,
        },
        beginAtZero: !horizontal,
      },
    },
    maintainAspectRatio: false,
    animation: { duration: 300 },
  };
  return (
    <div className="h-[260px]">
      <Bar data={data} options={options} />
    </div>
  );
}
