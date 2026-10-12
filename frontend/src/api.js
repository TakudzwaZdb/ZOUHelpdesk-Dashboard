
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
  }

  return res.json();
}