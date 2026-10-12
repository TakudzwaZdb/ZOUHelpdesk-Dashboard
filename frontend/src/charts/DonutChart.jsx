import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext.jsx';
import { PALETTE } from './setup.js';

export default function DonutChart({ labels, values }) {
  const { chartColors } = useTheme();
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 3,
        borderColor: chartColors.panel,
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 12 }, color: chartColors.text, padding: 14 },
      },
    },
    maintainAspectRatio: false,
    cutout: '78%',
    animation: { duration: 300 },
  };
  return (
    <div className="h-[240px]">
      <Doughnut data={data} options={options} />
    </div>
  );
}
