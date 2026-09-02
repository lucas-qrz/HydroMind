import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CostService } from '../consumption/cost.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenancy/tenant.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantService,
    private readonly cost: CostService,
  ) {}

  @Get('summary')
  async summary(@CurrentUser() user: AuthUser, @Query('organizationId') organizationId: string) {
    await this.tenant.authorize(user.sub, organizationId);
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const [todayAgg, monthAgg, prevAgg, sensors, openAnomalies, alerts, series, tariff] =
      await Promise.all([
        this.prisma.consumptionAggregate.aggregate({
          where: { organizationId, granularity: 'DAY', bucketStart: today },
          _sum: { volume: true },
        }),
        this.prisma.consumptionAggregate.aggregate({
          where: { organizationId, granularity: 'MONTH', bucketStart: month },
          _sum: { volume: true },
        }),
        this.prisma.consumptionAggregate.aggregate({
          where: { organizationId, granularity: 'MONTH', bucketStart: previousMonth },
          _sum: { volume: true },
        }),
        this.prisma.sensor.findMany({
          where: { site: { organizationId } },
          select: { status: true },
        }),
        this.prisma.anomaly.count({
          where: { organizationId, status: { in: ['OPEN', 'ACKNOWLEDGED'] } },
        }),
        this.prisma.alert.findMany({
          where: { organizationId, status: { not: 'CLOSED' } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        this.prisma.consumptionAggregate.findMany({
          where: {
            organizationId,
            granularity: 'DAY',
            bucketStart: { gte: new Date(now.getTime() - 7 * 86400000) },
          },
          orderBy: { bucketStart: 'asc' },
        }),
        this.cost.activeTariff(organizationId, undefined, now),
      ]);
    const sensorCounts = sensors.reduce<Record<string, number>>((counts, sensor) => {
      counts[sensor.status] = (counts[sensor.status] ?? 0) + 1;
      return counts;
    }, {});
    const current = monthAgg._sum.volume ?? 0;
    const previous = prevAgg._sum.volume ?? 0;
    return {
      todayLiters: todayAgg._sum.volume ?? 0,
      monthLiters: current,
      monthCostEstimate: this.cost.estimate(current, tariff?.pricePerM3 ?? null),
      variationPercent: previous
        ? Number((((current - previous) / previous) * 100).toFixed(1))
        : null,
      sensors: sensorCounts,
      openAnomalies,
      recentAlerts: alerts,
      series: series.map((point) => ({ timestamp: point.bucketStart, volumeLiters: point.volume })),
    };
  }
}
