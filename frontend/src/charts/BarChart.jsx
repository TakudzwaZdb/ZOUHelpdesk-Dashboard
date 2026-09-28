import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext.jsx';
import { PALETTE } from './setup.js';

export default function BarChart({
  labels = [],
  values = [],
  horizontal = false,
  yStepSize,
}) {
  const { chartColors } = useTheme();

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map(
          (_, i) => PALETTE[i % PALETTE.length]
        ),
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: horizontal ? 'y' : 'x',

    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },

    scales: {
      x: {
        grid: {
          display: !horizontal,
          color: chartColors.grid,
        },
        ticks: {
          color: chartColors.text,
        },
        beginAtZero: true,
      },

      y: {
        grid: {
          display: horizontal,
          color: chartColors.grid,
        },
        ticks: {
          color: chartColors.text,
          stepSize: !horizontal ? yStepSize : undefined,
        },
        beginAtZero: true,
      },
    },

    animation: {
      duration: 300,
    },
  };

  return (
    <div className="h-[190px] w-full">
      <Bar data={data} options={options} />
    </div>
  );
}