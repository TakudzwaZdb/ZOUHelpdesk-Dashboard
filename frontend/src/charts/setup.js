import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
<<<<<<< HEAD
  BarController,
  LineController,
  DoughnutController,
  PieController,
  Tooltip,
  Legend,
  Filler,
  RadarController,
  RadialLinearScale,
=======
  Tooltip,
  Legend,
  Filler,
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
<<<<<<< HEAD
  BarController,
  LineController,
  DoughnutController,
  PieController,
  Tooltip,
  Legend,
  Filler,
  RadarController,
  RadialLinearScale
);

// Infographic palette — fixed order, validated for dark surfaces.
export const PALETTE = ['#26a17f', '#b98a1f', '#4a86e8', '#e5566a', '#8b6cf0', '#3d8f9d', '#8a6d3b', '#6f7a99'];

ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.elements.line.borderWidth = 2;
ChartJS.defaults.plugins.tooltip.backgroundColor = '#12131a';
ChartJS.defaults.plugins.tooltip.borderColor = '#2c2e3d';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.titleColor = '#e8eaf2';
ChartJS.defaults.plugins.tooltip.bodyColor = '#c7cde0';
=======
  Tooltip,
  Legend,
  Filler
);

export const PALETTE = ['#3a6ea5', '#c8952e', '#2f7d55', '#b3413a', '#7a5ea8', '#3d8f9d', '#8a6d3b', '#5b6c8a'];
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
