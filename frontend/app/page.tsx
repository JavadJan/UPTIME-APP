'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, clearToken, getToken } from './lib/api';
import { Monitor } from './lib/types';
import { OverviewStrip } from './components/OverviewStrip';
import { MonitorCard } from './components/MonitorCard';
import { AddMonitorCard } from './components/AddMonitorCard';
import styles from './page.module.css';

const POLL_MS = 10_000;

export default function DashboardPage() {
  const router = useRouter();
  const [monitors, setMonitors] = useState<Monitor[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const refresh = useCallback(() => {
    api
      .listMonitors()
      .then((m) => {
        setMonitors(m);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Could not reach the API.'));
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/auth');
      return;
    }

    setCheckingAuth(false);
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh, router]);

  function handleLogout() {
    clearToken();
    router.replace('/auth');
  }

  if (checkingAuth) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Checking session…</div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pulse</h1>
          <p className={styles.subtitle}>Know the moment something goes down.</p>
        </div>
        <div className={styles.headerActions}>
          {monitors && monitors.length > 0 && <OverviewStrip monitors={monitors} />}
          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          Can&rsquo;t reach the API at the configured URL. Is the backend running?
          <div className={styles.errorDetail}>{error}</div>
        </div>
      )}

      {monitors === null && !error && <div className={styles.loading}>Loading monitors…</div>}

      {monitors !== null && (
        <div className={styles.grid}>
          {monitors.map((m) => (
            <MonitorCard key={m.id} monitor={m} onChange={refresh} />
          ))}
          <AddMonitorCard onAdded={refresh} />
        </div>
      )}
    </main>
  );
}
