import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MonitorsService } from './monitors.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateMonitorDto) {
    return this.monitorsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.monitorsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.monitorsService.findOne(req.user.userId, id);
  }

  @Get(':id/history')
  history(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Query('limit') limit?: string) {
    return this.monitorsService.history(req.user.userId, id, limit ? parseInt(limit, 10) : undefined);
  }

  @Patch(':id/pause')
  pause(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.monitorsService.setActive(req.user.userId, id, false);
  }

  @Patch(':id/resume')
  resume(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.monitorsService.setActive(req.user.userId, id, true);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.monitorsService.remove(req.user.userId, id);
  }
}
