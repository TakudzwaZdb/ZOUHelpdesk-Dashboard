<<<<<<< HEAD

const TOKEN = import.meta.env.VITE_KIOSK_TOKEN || '';

export async function getJSON(path) {
  const separator = path.includes('?') ? '&' : '?';

  const url = TOKEN
    ? `${path}${separator}token=${encodeURIComponent(TOKEN)}`
    : path;

  const res = await fetch(url, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));

    throw new Error(
      data.error || `${path} -> ${res.status}`
    );
=======
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
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
  }

  return res.json();
}