import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenancy/tenant.service';
import { CostService } from './cost.service';
import { ConsumptionQueryDto } from './dto';
@Injectable()
export class ConsumptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantService,
    private readonly cost: CostService,
  ) {}
  async query(userId: string, q: ConsumptionQueryDto) {
    await this.tenant.authorize(userId, q.organizationId);
    const where: Prisma.ConsumptionAggregateWhereInput = {
      organizationId: q.organizationId,
      granularity: q.granularity,
      bucketStart: { gte: q.from, lt: q.to },
      siteId: q.siteId,
      sensorId: q.sensorId,
      sensor: q.zoneId ? { zoneId: q.zoneId } : undefined,
    };
    const points = await this.prisma.consumptionAggregate.groupBy({
      by: ['bucketStart'],
      where,
      _sum: { volume: true },
      orderBy: { bucketStart: 'asc' },
    });
    const total = points.reduce((s, p) => s + (p._sum.volume ?? 0), 0);
    const tariff = await this.cost.activeTariff(q.organizationId, q.siteId, q.to);
    return {
      from: q.from,
      to: q.to,
      granularity: q.granularity,
      totalLiters: total,
      totalM3: total / 1000,
      costEstimate: this.cost.estimate(total, tariff?.pricePerM3 ?? null),
      currency: tariff?.currency ?? null,
      series: points.map((p) => ({ timestamp: p.bucketStart, volumeLiters: p._sum.volume ?? 0 })),
    };
  }
}
