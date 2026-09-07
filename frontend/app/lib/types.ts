export type MonitorStatus = 'UNKNOWN' | 'UP' | 'DOWN';

export interface Monitor {
  id: string;
  name: string;
  url: string;
  intervalSecs: number;
  timeoutMs: number;
  isActive: boolean;
  lastStatus: MonitorStatus;
  lastCheckedAt: string | null;
  createdAt: string;
}

export interface CheckResult {
  id: string;
  monitorId: string;
  status: MonitorStatus;
  statusCode: number | null;
  responseMs: number | null;
  errorMessage: string | null;
  checkedAt: string;
}
