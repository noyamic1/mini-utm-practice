import type { Alert, Zone } from '../../shared/types';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path); // relative URL: Vite proxies /api to the server
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json() as Promise<T>;
}

export const fetchZones = () => getJson<Zone[]>('/api/zones');
export const fetchAlerts = () => getJson<Alert[]>('/api/alerts');
