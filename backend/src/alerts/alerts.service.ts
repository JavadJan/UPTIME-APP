import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MonitorStatus } from '../common/monitor-status';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Called by the checker whenever a monitor's status changes.
   * Records the flip and fires a notification. Swap notify() for a real
   * email/webhook integration when you're ready - the trigger logic here
   * doesn't need to change.
   */
  async handleStatusChange(
    monitorId: string,
    monitorName: string,
    fromStatus: MonitorStatus,
    toStatus: MonitorStatus,
  ) {
    await this.prisma.alertLog.create({
      data: { monitorId, fromStatus, toStatus },
    });
    await this.notify(monitorName, fromStatus, toStatus);
  }

  private async notify(monitorName: string, fromStatus: MonitorStatus, toStatus: MonitorStatus) {
    // MVP: log to console. Replace with nodemailer / a webhook POST / etc.
    this.logger.warn(`[ALERT] ${monitorName}: ${fromStatus} -> ${toStatus}`);
  }
}
