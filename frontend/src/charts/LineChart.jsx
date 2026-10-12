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
<<<<<<< HEAD
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
=======
        borderColor: '#3a6ea5',
        backgroundColor: 'rgba(58,110,165,0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
      },
    ],
  };
  const options = {
<<<<<<< HEAD
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
=======
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: chartColors.grid }, ticks: { color: chartColors.text } },
      y: { grid: { color: chartColors.grid }, ticks: { color: chartColors.text }, beginAtZero: true },
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
    },
    maintainAspectRatio: false,
    animation: { duration: 300 },
  };
  return (
<<<<<<< HEAD
    <div className="h-[240px]">
=======
    <div className="h-[190px]">
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
      <Line data={data} options={options} />
    </div>
  );
}
