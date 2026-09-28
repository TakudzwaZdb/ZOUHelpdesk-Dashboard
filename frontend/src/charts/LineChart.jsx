import React from 'react';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext.jsx';

export default function LineChart({ labels, values }) {
  const { chartColors } = useTheme();
  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: '#3a6ea5',
        backgroundColor: 'rgba(58,110,165,0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };
  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: chartColors.grid }, ticks: { color: chartColors.text } },
      y: { grid: { color: chartColors.grid }, ticks: { color: chartColors.text }, beginAtZero: true },
    },
    maintainAspectRatio: false,
    animation: { duration: 300 },
  };
  return (
    <div className="h-[190px]">
      <Line data={data} options={options} />
    </div>
  );
}
