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
        borderWidth: 2,
        borderColor: chartColors.panel,
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, font: { size: 11 }, color: chartColors.text },
      },
    },
    maintainAspectRatio: false,
    cutout: '62%',
    animation: { duration: 300 },
  };
  return (
    <div className="h-[190px]">
      <Doughnut data={data} options={options} />
    </div>
  );
}
