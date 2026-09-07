import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';

@Injectable()
export class MonitorsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateMonitorDto) {
    return this.prisma.monitor.create({
      data: {
        userId,
        name: dto.name,
        url: dto.url,
        intervalSecs: dto.intervalSecs ?? 60,
        timeoutMs: dto.timeoutMs ?? 5000,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.monitor.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(userId: string, id: string) {
    const monitor = await this.prisma.monitor.findFirst({ where: { id, userId } });
    if (!monitor) throw new NotFoundException(`Monitor ${id} not found`);
    return monitor;
  }

  async history(userId: string, id: string, limit = 50) {
    await this.findOne(userId, id);
    return this.prisma.checkResult.findMany({
      where: { monitorId: id },
      orderBy: { checkedAt: 'desc' },
      take: limit,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.monitor.delete({ where: { id } });
  }

  async setActive(userId: string, id: string, isActive: boolean) {
    await this.findOne(userId, id);
    return this.prisma.monitor.update({ where: { id }, data: { isActive } });
  }
}
