import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';

@Injectable()
export class MonitorsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMonitorDto) {
    return this.prisma.monitor.create({
      data: {
        name: dto.name,
        url: dto.url,
        intervalSecs: dto.intervalSecs ?? 60,
        timeoutMs: dto.timeoutMs ?? 5000,
      },
    });
  }

  findAll() {
    return this.prisma.monitor.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const monitor = await this.prisma.monitor.findUnique({ where: { id } });
    if (!monitor) throw new NotFoundException(`Monitor ${id} not found`);
    return monitor;
  }

  async history(id: string, limit = 50) {
    await this.findOne(id);
    return this.prisma.checkResult.findMany({
      where: { monitorId: id },
      orderBy: { checkedAt: 'desc' },
      take: limit,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.monitor.delete({ where: { id } });
  }

  async setActive(id: string, isActive: boolean) {
    await this.findOne(id);
    return this.prisma.monitor.update({ where: { id }, data: { isActive } });
  }
}
