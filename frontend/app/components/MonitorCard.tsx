'use client';

import { useEffect, useState } from 'react';
import { Monitor, CheckResult } from '../lib/types';
import { api } from '../lib/api';
import { StatusPulse } from './StatusPulse';
import { Sparkline } from './Sparkline';
import styles from './MonitorCard.module.css';

function timeAgo(iso: string | null): string {
  if (!iso) return 'never checked';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function uptimePercent(history: CheckResult[]): number | null {
  if (history.length === 0) return null;
  const up = history.filter((h) => h.status === 'UP').length;
  return Math.round((up / history.length) * 100);
}

export function MonitorCard({ monitor, onChange }: { monitor: Monitor; onChange: () => void }) {
  const [history, setHistory] = useState<CheckResult[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .history(monitor.id, 20)
      .then((h) => {
        if (!cancelled) setHistory(h);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [monitor.id, monitor.lastCheckedAt]);

  const uptime = uptimePercent(history);
  const latest = history[0];

  async function toggleActive() {
    setBusy(true);
    try {
      if (monitor.isActive) await api.pause(monitor.id);
      else await api.resume(monitor.id);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Remove "${monitor.name}"? This can't be undone.`)) return;
    setBusy(true);
    try {
      await api.remove(monitor.id);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.card} data-paused={!monitor.isActive}>
      <div className={styles.top}>
        <div>
          <div className={styles.name}>{monitor.name}</div>
          <div className={styles.url}>{monitor.url}</div>
        </div>
        <StatusPulse status={monitor.isActive ? monitor.lastStatus : 'UNKNOWN'} />
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Uptime</span>
          <span className={styles.metricValue}>{uptime !== null ? `${uptime}%` : '—'}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Response</span>
          <span className={styles.metricValue}>
            {latest?.responseMs != null ? `${latest.responseMs}ms` : '—'}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Checked</span>
          <span className={styles.metricValue}>{timeAgo(monitor.lastCheckedAt)}</span>
        </div>
      </div>

      <Sparkline history={history} />

      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={toggleActive} disabled={busy}>
          {monitor.isActive ? 'Pause' : 'Resume'}
        </button>
        <button className={styles.actionBtnDanger} onClick={remove} disabled={busy}>
          Remove
        </button>
      </div>
    </div>
  );
}
