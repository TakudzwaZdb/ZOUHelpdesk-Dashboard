import React, { useMemo } from 'react';
import { useNarrow } from '../useNarrow.js';

const PALETTE = ['#2fbf9a', '#e0a82e', '#5b95f0', '#f0687c', '#9d82ff', '#7dd3c0', '#f2c76b'];

// Deterministic spiral word-cloud: biggest word in the centre, each next word
// spirals outwards until it fits without overlapping. Pure SVG, no libraries.
function layout(words, W, H, minF, maxF) {
  const max = Math.max(...words.map((w) => w.count), 1);
  const min = Math.min(...words.map((w) => w.count), max);
  const placed = [];
  const hit = (a, b) => !(a.x2 < b.x1 || a.x1 > b.x2 || a.y2 < b.y1 || a.y1 > b.y2);
  words.forEach((w, i) => {
    const t = max === min ? 1 : (Math.sqrt(w.count) - Math.sqrt(min)) / (Math.sqrt(max) - Math.sqrt(min));
    const size = Math.round(minF + t * (maxF - minF));
    const bw = w.text.length * size * 0.56 + 8, bh = size * 1.12;
    const vertical = i > 2 && i % 5 === 0 && size < maxF * 0.6; // a few rotated words for the classic look
    const ww = vertical ? bh : bw, hh = vertical ? bw : bh;
    for (let k = 0; k < 4000; k++) {
      const ang = k * 0.35, rad = 2.2 * ang;
      const x = W / 2 + Math.cos(ang) * rad * 1.9 - ww / 2;
      const y = H / 2 + Math.sin(ang) * rad * 0.95 - hh / 2;
      const box = { x1: x, y1: y, x2: x + ww, y2: y + hh };
      if (box.x1 < 4 || box.y1 < 4 || box.x2 > W - 4 || box.y2 > H - 4) continue;
      if (placed.some((p) => hit(p.box, box))) continue;
      placed.push({ ...w, size, vertical, box, color: PALETTE[i % PALETTE.length], cx: x + ww / 2, cy: y + hh / 2 });
      break;
    }
  });
  return placed;
}

export default function WordCloud({ words }) {
  const narrow = useNarrow();
  const W = narrow ? 360 : 760, H = narrow ? 380 : 340;
  const list = useMemo(() => (words || []).slice(0, narrow ? 26 : 48), [words, narrow]);
  const placed = useMemo(() => (list.length ? layout(list, W, H, narrow ? 15 : 14, narrow ? 44 : 54) : []), [list, W, H, narrow]);
  if (!list.length) return <div className="h-[300px] grid place-items-center text-sm text-ink2">No ticket subjects to analyse yet</div>;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: narrow ? 380 : 340 }} role="img" aria-label="Most frequent words in ticket subjects">
      {placed.map((w) => (
        <text key={w.text} x={w.cx} y={w.cy} textAnchor="middle" dominantBaseline="central" fontSize={w.size} fontWeight={w.size > 30 ? 800 : 700}
          fill={w.color} transform={w.vertical ? `rotate(-90 ${w.cx} ${w.cy})` : undefined}>
          <title>{`${w.text}: ${w.count} tickets`}</title>
          {w.text}
        </text>
      ))}
    </svg>
  );
}
