import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, Granularity } from '@prisma/client';
import { verify } from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AnomalyService } from '../anomalies/anomaly.service';
import { TelemetryDto } from './dto';
@Injectable()
export class IotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly anomalies: AnomalyService,
  ) {}
  async ingest(dto: TelemetryDto, secret: string) {
    const sensor = await this.prisma.sensor.findUnique({
      where: { id: dto.sensorId },
      include: { credentials: { where: { revokedAt: null } }, site: true },
    });
    if (!sensor || sensor.status === 'INACTIVE' || sensor.status === 'MAINTENANCE')
      throw new UnauthorizedException('Sensor não autorizado');
    const checks = await Promise.all(
      sensor.credentials.map((c) => verify(c.secretHash, secret).catch(() => false)),
    );
    if (!checks.some(Boolean)) throw new UnauthorizedException('Credencial do sensor inválida');
    let reading;
    try {
      reading = await this.prisma.$transaction(async (tx) => {
        const created = await tx.telemetryReading.create({
          data: { ...dto, timestamp: new Date(dto.timestamp) },
        });
        await tx.sensor.update({
          where: { id: sensor.id },
          data: { lastSeenAt: new Date(), status: 'ACTIVE' },
        });
        for (const granularity of ['HOUR', 'DAY', 'MONTH'] as Granularity[]) {
          const bucket = this.bucket(dto.timestamp, granularity);
          await tx.consumptionAggregate.upsert({
            where: {
              scopeKey_bucketStart_granularity: {
                scopeKey: `sensor:${sensor.id}`,
                bucketStart: bucket,
                granularity,
              },
            },
            create: {
              organizationId: sensor.site.organizationId,
              siteId: sensor.siteId,
              sensorId: sensor.id,
              scopeKey: `sensor:${sensor.id}`,
              bucketStart: bucket,
              granularity,
              volume: dto.volumeDelta,
            },
            update: { volume: { increment: dto.volumeDelta } },
          });
        }
        return created;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        return this.prisma.telemetryReading.findFirst({
          where: { sensorId: dto.sensorId, externalReadingId: dto.externalReadingId },
        });
      throw error;
    }
    void this.anomalies.evaluateReading(dto.sensorId);
    return reading;
  }
  private bucket(input: Date, g: Granularity) {
    const d = new Date(input);
    if (g === 'HOUR') d.setUTCMinutes(0, 0, 0);
    else {
      d.setUTCHours(0, 0, 0, 0);
      if (g === 'MONTH') d.setUTCDate(1);
    }
    return d;
  }
}
