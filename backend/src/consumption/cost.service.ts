import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CostService {
  constructor(private readonly prisma: PrismaService) {}

  estimate(volumeLiters: number, pricePerM3: number | null): number | null {
    return pricePerM3 === null ? null : Number(((volumeLiters / 1000) * pricePerM3).toFixed(2));
  }

  activeTariff(organizationId: string, siteId: string | undefined, at: Date) {
    return this.prisma.tariff.findFirst({
      where: {
        organizationId,
        AND: [
          { OR: siteId ? [{ siteId }, { siteId: null }] : [{ siteId: null }] },
          { OR: [{ effectiveTo: null }, { effectiveTo: { gt: at } }] },
        ],
        effectiveFrom: { lte: at },
      },
      orderBy: [{ siteId: 'desc' }, { effectiveFrom: 'desc' }],
    });
  }
}
