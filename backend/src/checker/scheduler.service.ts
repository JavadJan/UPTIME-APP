import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { CheckerService } from './checker.service';

const TICK_MS = 10_000;

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private running = false;

  constructor(private readonly checker: CheckerService) {}

  @Interval(TICK_MS)
  async tick() {
    // Guard against overlapping ticks if a check batch runs long.
    if (this.running) return;
    this.running = true;
    try {
      await this.checker.runDueChecks();
    } catch (err) {
      this.logger.error('Error running scheduled checks', err as Error);
    } finally {
      this.running = false;
    }
  }
}
