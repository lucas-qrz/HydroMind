import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConsumptionService } from '../consumption/consumption.service';
import { ConsumptionQueryDto } from '../consumption/dto';
import { PrismaService } from '../prisma/prisma.service';
@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly consumption: ConsumptionService,
    private readonly prisma: PrismaService,
  ) {}
  @Get('consumption') async report(@CurrentUser() u: AuthUser, @Query() q: ConsumptionQueryDto) {
    const current = await this.consumption.query(u.sub, q);
    const duration = q.to.getTime() - q.from.getTime();
    const previous = await this.consumption.query(u.sub, {
      ...q,
      from: new Date(q.from.getTime() - duration),
      to: q.from,
    });
    const top = await this.prisma.consumptionAggregate.groupBy({
      by: ['sensorId'],
      where: {
        organizationId: q.organizationId,
        granularity: q.granularity,
        bucketStart: { gte: q.from, lt: q.to },
        sensorId: { not: null },
      },
      _sum: { volume: true },
      orderBy: { _sum: { volume: 'desc' } },
      take: 10,
    });
    const anomalies = await this.prisma.anomaly.count({
      where: { organizationId: q.organizationId, createdAt: { gte: q.from, lt: q.to } },
    });
    return {
      ...current,
      previousTotalLiters: previous.totalLiters,
      variationPercent: previous.totalLiters
        ? Number(
            (((current.totalLiters - previous.totalLiters) / previous.totalLiters) * 100).toFixed(
              1,
            ),
          )
        : null,
      topConsumers: top,
      anomalies,
    };
  }
}
