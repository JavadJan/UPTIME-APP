'use client';

import { FormEvent, useState } from 'react';
import { api } from '../lib/api';
import styles from './AddMonitorCard.module.css';

export function AddMonitorCard({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [intervalSecs, setIntervalSecs] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !url.trim()) {
      setError('Name and URL are required.');
      return;
    }
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`;

    setSubmitting(true);
    try {
      await api.createMonitor({ name: name.trim(), url: normalizedUrl, intervalSecs });
      setName('');
      setUrl('');
      setIntervalSecs(60);
      setOpen(false);
      onAdded();
    } catch (err: any) {
      setError(err.message || 'Could not add monitor.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button className={styles.placeholder} onClick={() => setOpen(true)}>
        <span className={styles.plus}>+</span>
        <span>Add a monitor</span>
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Name</span>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My site"
          autoFocus
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>URL</span>
        <input
          className={styles.input}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Check every</span>
        <select
          className={styles.input}
          value={intervalSecs}
          onChange={(e) => setIntervalSecs(Number(e.target.value))}
        >
          <option value={30}>30 seconds</option>
          <option value={60}>1 minute</option>
          <option value={300}>5 minutes</option>
          <option value={600}>10 minutes</option>
        </select>
      </label>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => setOpen(false)}
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? 'Adding…' : 'Add monitor'}
        </button>
      </div>
    </form>
  );
}
