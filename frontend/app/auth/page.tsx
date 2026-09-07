'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, setToken } from '../lib/api';
import styles from './page.module.css';

type Tab = 'signin' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }

    api
      .listMonitors()
      .then(() => router.replace('/'))
      .catch(() => setCheckingSession(false));
  }, [router]);

  const title = useMemo(() => (tab === 'signin' ? 'Sign in' : 'Sign up'), [tab]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setMessageType(null);

    try {
      if (tab === 'signup') {
        await api.signup({ email, password });
        setMessage('Account created. You can sign in now.');
        setMessageType('success');
        setTab('signin');
        setPassword('');
        return;
      }

      const { accessToken } = await api.login({ email, password });
      setToken(accessToken);
      router.replace('/');
    } catch (err: any) {
      setMessage(err?.message || 'Authentication failed.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <h1 className={styles.title}>Pulse</h1>
            <p className={styles.subtitle}>Checking your session…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <div className={styles.brand}>
          <h1 className={styles.title}>Pulse</h1>
          <p className={styles.subtitle}>Know the moment something goes down.</p>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'signin' ? styles.tabActive : ''}`}
            onClick={() => {
              setTab('signin');
              setMessage(null);
              setMessageType(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
            onClick={() => {
              setTab('signup');
              setMessage(null);
              setMessageType(null);
            }}
          >
            Sign up
          </button>
        </div>

        {message && (
          <div className={`${styles.message} ${messageType === 'success' ? styles.success : styles.error}`}>
            {message}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          <div className={styles.actions}>
            <button type="submit" className={`${styles.button} ${styles.primary}`} disabled={loading}>
              {loading ? 'Working…' : title}
            </button>
          </div>
        </form>

        <div className={styles.footer}>
          No auth guards yet on the dashboard UI, but your token is stored locally in the browser.
        </div>
      </section>
    </main>
  );
}