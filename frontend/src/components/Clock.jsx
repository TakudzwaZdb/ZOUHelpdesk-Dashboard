import React, { useEffect, useState } from 'react';

export default function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-right">
      <div className="text-lg sm:text-[22px] font-bold tabular-nums">{now.toLocaleTimeString()}</div>
      <div className="text-[11px] sm:text-xs text-slate whitespace-nowrap">
        {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}
