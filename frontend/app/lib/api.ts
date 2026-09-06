import { CheckResult, Monitor } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${options?.method || 'GET'} ${path} failed (${res.status}): ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listMonitors: () => request<Monitor[]>('/monitors'),
  createMonitor: (data: { name: string; url: string; intervalSecs?: number }) =>
    request<Monitor>('/monitors', { method: 'POST', body: JSON.stringify(data) }),
  history: (id: string, limit = 20) =>
    request<CheckResult[]>(`/monitors/${id}/history?limit=${limit}`),
  pause: (id: string) => request<Monitor>(`/monitors/${id}/pause`, { method: 'PATCH' }),
  resume: (id: string) => request<Monitor>(`/monitors/${id}/resume`, { method: 'PATCH' }),
  remove: (id: string) => request<void>(`/monitors/${id}`, { method: 'DELETE' }),
};
