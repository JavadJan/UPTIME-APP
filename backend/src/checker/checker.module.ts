import { Module } from '@nestjs/common';
import { CheckerService } from './checker.service';
import { SchedulerService } from './scheduler.service';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [AlertsModule],
  providers: [CheckerService, SchedulerService],
  exports: [CheckerService],
})
export class CheckerModule {}
