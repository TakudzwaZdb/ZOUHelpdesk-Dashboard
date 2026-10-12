import React from 'react';
import { useEndpoint } from '../hooks/useEndpoint.js';

export default function StatusBadge() {
  const { data, error } = useEndpoint('status', 45000);

  let mode = 'connecting';
  let label = 'Connecting…';
  if (error) {
    mode = 'error';
    label = 'Server unreachable';
  } else if (data) {
    if (data.demo_mode) {
      mode = 'demo';
      label = 'Demo Data';
    } else if (data.db_connected) {
      mode = 'live';
      label = 'Live — connected to MySQL';
    } else {
      mode = 'error';
      label = 'Database unreachable';
    }
  }

  const styles = {
    live: { dot: 'bg-green animate-pulse2', text: 'text-green' },
    demo: { dot: 'bg-gold', text: 'text-gold' },
    error: { dot: 'bg-red animate-[pulse2_1s_infinite]', text: 'text-red' },
    connecting: { dot: 'bg-slate', text: 'text-slate' },
  }[mode];

  return (
    <span
      className={`inline-flex items-center gap-1.5 py-[3px] pl-2 pr-2.5 rounded-full text-[11.5px] font-semibold tracking-wide border border-panelBorder bg-panel ${styles.text}`}
    >
      <span className={`inline-block w-[7px] h-[7px] rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
}
