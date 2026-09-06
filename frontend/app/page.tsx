'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './lib/api';
import { Monitor } from './lib/types';
import { OverviewStrip } from './components/OverviewStrip';
import { MonitorCard } from './components/MonitorCard';
import { AddMonitorCard } from './components/AddMonitorCard';
import styles from './page.module.css';

const POLL_MS = 10_000;

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pulse</h1>
          <p className={styles.subtitle}>Know the moment something goes down.</p>
        </div>
        {monitors && monitors.length > 0 && <OverviewStrip monitors={monitors} />}
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
