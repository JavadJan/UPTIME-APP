export const MonitorStatus = {
  UNKNOWN: 'UNKNOWN',
  UP: 'UP',
  DOWN: 'DOWN',
} as const;

export type MonitorStatus = (typeof MonitorStatus)[keyof typeof MonitorStatus];
