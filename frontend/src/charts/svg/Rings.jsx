import React from 'react';

const TAU = Math.PI * 2;

// One arc as a stroked circle: fraction of the circumference, starting after `offsetFrac`.
function Arc({ cx, cy, r, w, color, frac, offsetFrac = 0, gap = 0, title }) {
  const c = TAU * r;
  const len = Math.max(0, frac * c - gap);
  return (
    <circle
      cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={w}
      strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offsetFrac * c}
      transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray .5s ease' }}
    >
      {title && <title>{title}</title>}
    </circle>
  );
}

function People({ x, y, color = 'var(--ink)' }) {
  return (
    <g fill={color} opacity="0.9">
      <circle cx={x - 9} cy={y - 8} r="4.5" />
      <path d={`M${x - 17} ${y + 8} q0 -11 8 -11 q8 0 8 11z`} />
      <circle cx={x + 9} cy={y - 8} r="4.5" />
      <path d={`M${x + 1} ${y + 8} q0 -11 8 -11 q8 0 8 11z`} />
    </g>
  );
}

// Concentric rings (photo chart 1)
export function ConcentricRings({ rings }) {
  return (
    <svg viewBox="0 0 160 150" className="w-full h-[250px]" role="img">
      {rings.map((g, i) => {
        const r = 62 - i * 13;
        return (
          <g key={g.label}>
            <circle cx="80" cy="75" r={r} fill="none" stroke="var(--line)" strokeWidth="7" />
            <Arc cx={80} cy={75} r={r} w={7} color={g.color} frac={Math.min(g.value, 100) / 100} title={`${g.label}: ${g.value}%`} />
          </g>
        );
      })}
      <People x={80} y={78} />
    </svg>
  );
}

// Row of small donuts with a centred % (photo chart 10)
export function MiniDonuts({ items }) {
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-5 pt-1 h-[250px] content-center">
      {items.map((it) => (
        <div key={it.label} className="flex flex-col items-center gap-1.5 min-w-0 text-center">
          <svg viewBox="0 0 64 64" className="w-[92px] h-[92px] sm:w-[104px] sm:h-[104px]">
            <circle cx="32" cy="32" r="26" fill="none" stroke="var(--line)" strokeWidth="6" />
            <Arc cx={32} cy={32} r={26} w={6} color={it.color} frac={Math.min(it.value, 100) / 100} title={`${it.label}: ${it.value}%`} />
            <text x="32" y="36" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">{Math.round(it.value)}%</text>
          </svg>
          <div className="text-[10px] leading-tight text-slate font-semibold uppercase tracking-wide">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

// Segmented donut with gaps. hub=true adds a centre hub (photo charts 11 & 14)
export function SegDonut({ items, center, hub = false }) {
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  let acc = 0;
  return (
    <svg viewBox="0 0 160 150" className="w-full h-[250px]" role="img">
      {items.map((it) => {
        const frac = it.value / total;
        const el = (
          <Arc key={it.label} cx={80} cy={75} r={hub ? 52 : 54} w={hub ? 20 : 14} color={it.color} frac={frac} offsetFrac={acc} gap={4}
            title={`${it.label}: ${it.value} (${Math.round(frac * 100)}%)`} />
        );
        acc += frac;
        return el;
      })}
      {hub && <circle cx="80" cy="75" r="28" fill="var(--bg)" stroke="var(--panel-border)" />}
      <text x="80" y={hub ? 73 : 73} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--ink)">{center?.value}</text>
      <text x="80" y="89" textAnchor="middle" fontSize="9" fill="var(--slate)" style={{ letterSpacing: '.06em' }}>{center?.label}</text>
    </svg>
  );
}

// Plain pie chart (photo chart 20) — every wedge is labelled with its name, % and count
export function GlobePie({ items }) {
  const total = items.reduce((a, b) => a + (Number(b.value) || 0), 0);
  const cx = 150, cy = 130, R = 110;
  if (!total) {
    return (
      <svg viewBox="0 0 300 260" className="w-full h-[300px]" role="img">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="6 6" />
        <text x={cx} y={cy} textAnchor="middle" fontSize="13" fill="var(--ink-2)">No tickets in this period</text>
      </svg>
    );
  }
  let acc = 0;
  const pt = (ang, rad) => [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad];
  return (
    <svg viewBox="0 0 300 260" className="w-full h-[300px]" role="img">
      {items.map((it) => {
        const v = Number(it.value) || 0;
        const frac = v / total;
        const a0 = acc * TAU - Math.PI / 2;
        const a1 = (acc + frac) * TAU - Math.PI / 2;
        const mid = (a0 + a1) / 2;
        acc += frac;
        if (!v) return null;
        const pctTxt = `${Math.round(frac * 1000) / 10}%`;
        let wedge;
        if (frac >= 0.9999) wedge = <circle cx={cx} cy={cy} r={R} fill={it.color} stroke="var(--bg)" strokeWidth="2" />;
        else {
          const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
          wedge = <path d={`M${cx} ${cy} L${x0} ${y0} A${R} ${R} 0 ${frac > 0.5 ? 1 : 0} 1 ${x1} ${y1} Z`} fill={it.color} stroke="var(--bg)" strokeWidth="2.5" strokeLinejoin="round" />;
        }
        const inside = frac >= 0.12;
        const [tx, ty] = pt(mid, inside ? R * 0.58 : R * 0.8);
        return (
          <g key={it.label}>
            <title>{`${it.label}: ${v} (${pctTxt})`}</title>
            {wedge}
            <g fill="#fff" textAnchor="middle" style={{ pointerEvents: 'none' }}>
              <text x={tx} y={ty - (inside ? 4 : 1)} fontSize={inside ? 17 : 11} fontWeight="800">{pctTxt}</text>
              {inside && <text x={tx} y={ty + 12} fontSize="10.5" fontWeight="600">{it.label}</text>}
              {inside && <text x={tx} y={ty + 25} fontSize="9.5" opacity="0.92">{v} tickets</text>}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

// Overlapping bubbles sized by area (photo chart 7)
export function Bubbles({ items }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const R = 58;
  const pos = [[72, 80], [122, 96], [102, 50]]; // big, medium, small
  const sorted = [...items].sort((a, b) => b.value - a.value);
  return (
    <svg viewBox="0 0 170 150" className="w-full h-[250px]" role="img">
      {sorted.map((it, i) => {
        const r = Math.max(10, Math.sqrt(it.value / max) * R);
        const [x, y] = pos[i] || pos[2];
        return (
          <g key={it.label}>
            <circle cx={x} cy={y} r={r} fill={it.color} fillOpacity="0.72" stroke="var(--panel)" strokeWidth="2">
              <title>{`${it.label}: ${it.value}`}</title>
            </circle>
            <text x={x} y={y + 4} textAnchor="middle" fontSize={r > 24 ? 14 : 10} fontWeight="700" fill="#fff">{it.value}</text>
          </g>
        );
      })}
    </svg>
  );
}
