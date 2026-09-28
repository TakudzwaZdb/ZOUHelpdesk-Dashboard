import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export const PALETTE = ['#3a6ea5', '#c8952e', '#2f7d55', '#b3413a', '#7a5ea8', '#3d8f9d', '#8a6d3b', '#5b6c8a'];
