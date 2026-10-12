import { useEffect, useRef, useState } from 'react';
import { getJSON } from '../api.js';

/**
 * Each panel calls this with its own endpoint(s) and manages its own
 * loading / error / data state. A broken query in one panel (wrong table
 * name, DB hiccup, etc.) never blanks out the others — exactly the
 * fault-isolation behaviour the kiosk needs to stay useful mid-presentation.
 *
 * @param {string|string[]} endpoints - one API path, or several to fetch together
 * @param {number} intervalMs - refresh interval (default 45s)
 */
export function useEndpoint(endpoints, intervalMs = 45000) {
  const paths = Array.isArray(endpoints) ? endpoints : [endpoints];
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timer;

    async function load() {
      try {
        const results = await Promise.all(paths.map((p) => getJSON(`/api/${p}`)));
        if (!mounted.current) return;
        setData(results.length === 1 ? results[0] : results);
        setError(null);
        setLastUpdated(new Date());
      } catch (err) {
        if (!mounted.current) return;
        setError(err.message);
      } finally {
        if (mounted.current) setLoading(false);
      }
    }

    load();
    timer = setInterval(load, intervalMs);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paths.join(','), intervalMs]);

  return { data, loading, error, lastUpdated, stale: !!error };
}
