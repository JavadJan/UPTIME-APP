import styles from './StatusPulse.module.css';
import { MonitorStatus } from '../lib/types';

const LABEL: Record<MonitorStatus, string> = {
  UP: 'Up',
  DOWN: 'Down',
  UNKNOWN: 'Checking',
};

export function StatusPulse({ status }: { status: MonitorStatus }) {
  return (
    <span className={styles.wrap} data-status={status}>
      <span className={styles.dotContainer} aria-hidden="true">
        <span className={styles.ring} />
        <span className={styles.dot} />
      </span>
      <span className={styles.label}>{LABEL[status]}</span>
    </span>
  );
}
