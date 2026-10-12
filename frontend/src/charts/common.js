// Fixed-order infographic palette (validated on the dark surface).
export const C = {
  teal: '#26a17f',
  gold: '#b98a1f',
  blue: '#4a86e8',
  red: '#e5566a',
  violet: '#8b6cf0',
};

export function axisOpts(chartColors, { grid = true, xGrid = false, max, xTitle, yTitle, narrow = false, count = 0 } = {}) {
  const title = (text) => (text ? { display: true, text, color: chartColors.text, font: { size: narrow ? 9.5 : 10.5, weight: '600' }, padding: 6 } : { display: false });
  const tick = { color: chartColors.text, font: { size: narrow ? 9 : 10 }, maxTicksLimit: 8 };
  return {
    x: { grid: { display: xGrid, color: chartColors.grid }, border: { display: false }, ticks: { ...tick, maxRotation: count > 16 ? 90 : narrow ? 65 : 45, minRotation: count > 16 ? 90 : narrow ? 65 : 0, autoSkip: false }, title: title(xTitle) },
    y: { grid: { display: grid, color: chartColors.grid }, border: { display: false }, ticks: tick, beginAtZero: true, max, grace: '12%', title: title(yTitle) },
  };
}

export const short = (s = '', n = 9) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// Draws each value next to its bar / point so charts can be read without hovering.
// Labels that would collide with an already-drawn label are skipped, and each label sits on a
// dark pill so it stays readable over lines and areas.
export const valueLabels = {
  id: 'valueLabels',
  afterDatasetsDraw(chart) {
    const opts = chart.options.plugins.valueLabels;
    if (!opts || !opts.display) return;
    const { ctx, chartArea } = chart;
    const horizontal = chart.options.indexAxis === 'y';
    const isLine = chart.config.type === 'line';
    const size = opts.size || 9.5;
    const drawn = [];
    const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    ctx.save();
    ctx.font = `600 ${size}px Inter, sans-serif`;
    ctx.textBaseline = 'middle';
    // Draw the first dataset first so the primary series keeps its labels when space is tight.
    chart.data.datasets.forEach((ds, i) => {
      const meta = chart.getDatasetMeta(i);
      if (meta.hidden || ds.noLabels) return;
      meta.data.forEach((el, j) => {
        const v = ds.data[j];
        if (v == null || (opts.skipZero && v === 0)) return;
        const txt = String(Math.round(v * 10) / 10);
        const w = ctx.measureText(txt).width + 10;
        const h = horizontal ? size + 3 : size + 6;
        let x; let y;
        if (horizontal) { x = el.x + 6; y = el.y - h / 2; }
        else {
          const below = isLine && i % 2 === 1; // alternate series above/below their points
          x = el.x - w / 2;
          y = below ? el.y + 8 : el.y - h - 6;
          if (below && chartArea && y + h > chartArea.bottom + 2) y = el.y - h - 6; // no room below → put above
        }
        const box = { x, y, w, h };
        // keep inside the drawing area
        if (!horizontal && chartArea) {
          if (box.y < chartArea.top - 14 || box.y + h > chartArea.bottom + 2) return;
          if (box.x < chartArea.left - 20 || box.x + w > chartArea.right + 24) return;
        }
        if (drawn.some((d) => hit(d, box))) return; // congested — leave it out
        drawn.push(box);
        ctx.fillStyle = 'rgba(18,19,26,0.88)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(box.x, box.y, w, h, 4); else ctx.rect(box.x, box.y, w, h);
        ctx.fill();
        if (horizontal && typeof ds.backgroundColor === 'string') { ctx.strokeStyle = ds.backgroundColor; ctx.lineWidth = 1.2; ctx.stroke(); }
        ctx.fillStyle = '#f2f4fa';
        ctx.textAlign = 'center';
        ctx.fillText(txt, box.x + w / 2, box.y + h / 2 + 0.5);
      });
    });
    ctx.restore();
  },
};
