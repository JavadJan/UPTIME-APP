import { Monitor } from '../lib/types';
import styles from './OverviewStrip.module.css';

export function OverviewStrip({ monitors }: { monitors: Monitor[] }) {
  const up = monitors.filter((m) => m.isActive && m.lastStatus === 'UP').length;
  const down = monitors.filter((m) => m.isActive && m.lastStatus === 'DOWN').length;
  const paused = monitors.filter((m) => !m.isActive).length;

  return (
    <div className={styles.strip}>
      <div className={styles.stat} data-tone="up">
        <span className={styles.value}>{up}</span>
        <span className={styles.label}>up</span>
      </div>
      <div className={styles.stat} data-tone="down">
        <span className={styles.value}>{down}</span>
        <span className={styles.label}>down</span>
      </div>
      <div className={styles.stat} data-tone="neutral">
        <span className={styles.value}>{paused}</span>
        <span className={styles.label}>paused</span>
      </div>
      <div className={styles.stat} data-tone="neutral">
        <span className={styles.value}>{monitors.length}</span>
        <span className={styles.label}>total</span>
      </div>
    </div>
  );
}
