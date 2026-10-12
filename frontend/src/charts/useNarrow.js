import { useEffect, useState } from 'react';

// True on phone-width screens so charts can shrink fonts / rotate labels.
export function useNarrow(limit = 640) {
  const get = () => (typeof window !== 'undefined' ? window.innerWidth < limit : false);
  const [narrow, setNarrow] = useState(get);
  useEffect(() => {
    const on = () => setNarrow(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return narrow;
}
