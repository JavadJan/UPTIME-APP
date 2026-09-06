import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Monitor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { runWithConcurrencyLimit } from './concurrency';
import { MonitorStatus } from '../common/monitor-status';

interface CheckOutcome {
  status: MonitorStatus;
  statusCode?: number;
  responseMs: number;
  errorMessage?: string;
}

const MAX_CONCURRENT_CHECKS = 20;

function normalizeMonitorStatus(status: string): MonitorStatus {
  if (
    status === MonitorStatus.UP ||
    status === MonitorStatus.DOWN ||
    status === MonitorStatus.UNKNOWN
  ) {
    return status;
  }

  return MonitorStatus.UNKNOWN;
}

@Injectable()
export class CheckerService {
  private readonly logger = new Logger(CheckerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: AlertsService,
  ) {}

  /** Finds every active monitor whose interval has elapsed and checks them concurrently. */
  async runDueChecks(): Promise<void> {
    const now = new Date();
    const monitors = await this.prisma.monitor.findMany({ where: { isActive: true } });

    const due = monitors.filter((m) => {
      if (!m.lastCheckedAt) return true;
      const elapsedSecs = (now.getTime() - m.lastCheckedAt.getTime()) / 1000;
      return elapsedSecs >= m.intervalSecs;
    });

    if (due.length === 0) return;

    await runWithConcurrencyLimit(due, MAX_CONCURRENT_CHECKS, (monitor) =>
      this.checkAndRecord(monitor),
    );
  }

  /** Checks a single monitor, persists the result, and fires an alert on status change. */
  async checkAndRecord(monitor: Monitor): Promise<void> {
    const outcome = await this.check(monitor.url, monitor.timeoutMs);
    const previousStatus = normalizeMonitorStatus(monitor.lastStatus);

    await this.prisma.checkResult.create({
      data: {
        monitorId: monitor.id,
        status: outcome.status,
        statusCode: outcome.statusCode,
        responseMs: outcome.responseMs,
        errorMessage: outcome.errorMessage,
      },
    });

    await this.prisma.monitor.update({
      where: { id: monitor.id },
      data: { lastStatus: outcome.status, lastCheckedAt: new Date() },
    });

    if (previousStatus !== outcome.status) {
      this.logger.log(`${monitor.name}: ${previousStatus} -> ${outcome.status}`);
      await this.alerts.handleStatusChange(
        monitor.id,
        monitor.name,
        previousStatus,
        outcome.status,
      );
    }
  }

  /** Performs the actual HTTP check. Never throws - failures are folded into the outcome. */
  private async check(url: string, timeoutMs: number): Promise<CheckOutcome> {
    const startedAt = Date.now();
    try {
      const response = await axios.get(url, {
        timeout: timeoutMs,
        validateStatus: () => true,
      });
      const responseMs = Date.now() - startedAt;
      const isUp = response.status >= 200 && response.status < 400;
      return {
        status: isUp ? MonitorStatus.UP : MonitorStatus.DOWN,
        statusCode: response.status,
        responseMs,
      };
    } catch (err: any) {
      const responseMs = Date.now() - startedAt;
      return {
        status: MonitorStatus.DOWN,
        responseMs,
        errorMessage: err.code || err.message || 'Unknown error',
      };
    }
  }
}
