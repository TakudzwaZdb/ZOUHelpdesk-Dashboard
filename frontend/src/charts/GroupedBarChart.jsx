import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext.jsx';

// series = [
//   { label: 'Total', data: [...], color: '#3a6ea5' },
//   { label: 'Open', data: [...], color: '#5b8db8' },
//   { label: 'Pending', data: [...], color: '#7aa6c2' },
// ]

export default function GroupedBarChart({
  labels = [],
  series = [],
  yStepSize,
}) {
  const { chartColors } = useTheme();

  const data = {
    labels,

    datasets: series.map((s) => ({
      label: s.label,
      data: s.data,

      backgroundColor: s.color,

      borderRadius: 4,

      // Keeps grouped bars readable.
      barPercentage: 0.82,
      categoryPercentage: 0.72,

      // Prevents bars from becoming excessively wide.
      maxBarThickness: 30,

      // IMPORTANT:
      // Do NOT use minBarLength here.
      // This allows small values to keep their true
      // proportional height.
      minBarLength: 0,

      borderWidth: 0,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: 'nearest',
      intersect: true,
    },

    plugins: {
      legend: {
        display: true,
        position: 'bottom',

        labels: {
          color: chartColors.text,
          boxWidth: 12,
          boxHeight: 12,
          font: {
            size: 12,
          },
          padding: 14,
        },
      },

      tooltip: {
        enabled: true,

        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },

    scales: {
      x: {
        stacked: false,

        grid: {
          color: chartColors.grid,
          drawBorder: false,
        },

        ticks: {
          color: chartColors.text,
          font: {
            size: 12,
          },

          autoSkip: false,
          maxRotation: 45,
          minRotation: 0,
        },
      },

      y: {
        stacked: false,

        beginAtZero: true,

        grid: {
          color: chartColors.grid,
          drawBorder: false,
        },

        ticks: {
          color: chartColors.text,
          font: {
            size: 12,
          },

          stepSize: yStepSize,
          precision: 0,
        },
      },
    },

    animation: {
      duration: 300,
    },

    events: [
      'mousemove',
      'mouseout',
      'click',
      'touchstart',
      'touchmove',
    ],

    hover: {
      mode: 'nearest',
      intersect: true,
    },
  };

  return (
    <div
      className="w-full"
      style={{
        height: '500px',
        minHeight: '500px',
      }}
    >
      <Bar data={data} options={options} />
    </div>
  );
}