async function req(path: string, options?: RequestInit) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(e.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  get: (p: string) => req(p),
  post: (p: string, body: any) => req(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p: string, body: any) => req(p, { method: 'PUT', body: JSON.stringify(body) }),
  del: (p: string, body: any) => req(p, { method: 'DELETE', body: JSON.stringify(body) }),
};

export const timeAgo = (iso?: string) => {
  if (!iso) return '—';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 0) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const fmt = (n: any, d = 1) => {
  const v = Number(n);
  return isNaN(v) ? '—' : v.toFixed(d);
};
