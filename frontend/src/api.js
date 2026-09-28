const TOKEN = import.meta.env.VITE_KIOSK_TOKEN || '';

export async function getJSON(path) {
  const headers = {};

  if (TOKEN) {
    headers['X-Kiosk-Token'] = TOKEN;
  }

  const res = await fetch(path, {
    cache: 'no-store',
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${path} -> ${res.status}`);
  }

  return res.json();
}