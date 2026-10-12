import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext.jsx';

<<<<<<< HEAD
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
=======
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

>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
<<<<<<< HEAD
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
=======

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
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
