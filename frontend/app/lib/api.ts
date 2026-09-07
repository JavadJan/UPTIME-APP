import { CheckResult, Monitor } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'pulse_token';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
}

function redirectToAuth() {
  if (!isBrowser()) return;
  if (window.location.pathname !== '/auth') {
    window.location.assign('/auth');
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      redirectToAuth();
    }
    const body = await res.text().catch(() => '');
    throw new Error(`${options?.method || 'GET'} ${path} failed (${res.status}): ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getToken,
  clearToken,
  signup: (data: { email: string; password: string }) =>
    request<{ id: string; email: string; createdAt: string }>(
      '/auth/signup',
      { method: 'POST', body: JSON.stringify(data) },
    ),
  login: (data: { email: string; password: string }) =>
    request<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listMonitors: () => request<Monitor[]>('/monitors'),
  createMonitor: (data: { name: string; url: string; intervalSecs?: number }) =>
    request<Monitor>('/monitors', { method: 'POST', body: JSON.stringify(data) }),
  history: (id: string, limit = 20) =>
    request<CheckResult[]>(`/monitors/${id}/history?limit=${limit}`),
  pause: (id: string) => request<Monitor>(`/monitors/${id}/pause`, { method: 'PATCH' }),
  resume: (id: string) => request<Monitor>(`/monitors/${id}/resume`, { method: 'PATCH' }),
  remove: (id: string) => request<void>(`/monitors/${id}`, { method: 'DELETE' }),
};
