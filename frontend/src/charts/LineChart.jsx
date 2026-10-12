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
        borderColor: '#4a86e8',
        backgroundColor: 'rgba(74,134,232,0.10)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#4a86e8',
        pointHoverBorderColor: '#21222d',
        pointHoverBorderWidth: 2,
      },
    ],
  };
  const options = {
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: chartColors.text, font: { size: 12 } } },
      y: {
        grid: { color: chartColors.grid },
        border: { display: false },
        ticks: { color: chartColors.text, font: { size: 12 } },
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
    animation: { duration: 300 },
  };
  return (
    <div className="h-[240px]">
      <Line data={data} options={options} />
    </div>
  );
}
