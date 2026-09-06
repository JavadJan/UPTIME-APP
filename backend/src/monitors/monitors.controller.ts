import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MonitorsService } from './monitors.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';

@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Post()
  create(@Body() dto: CreateMonitorDto) {
    return this.monitorsService.create(dto);
  }

  @Get()
  findAll() {
    return this.monitorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monitorsService.findOne(id);
  }

  @Get(':id/history')
  history(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.monitorsService.history(id, limit ? parseInt(limit, 10) : undefined);
  }

  @Patch(':id/pause')
  pause(@Param('id') id: string) {
    return this.monitorsService.setActive(id, false);
  }

  @Patch(':id/resume')
  resume(@Param('id') id: string) {
    return this.monitorsService.setActive(id, true);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.monitorsService.remove(id);
  }
}
