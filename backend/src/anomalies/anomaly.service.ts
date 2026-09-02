import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AnomalyType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RuleBasedAnomalyDetector } from './detector';
@Injectable()
export class AnomalyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}
  async evaluateReading(sensorId: string): Promise<void> {
    const sensor = await this.prisma.sensor.findUnique({
      where: { id: sensorId },
      include: { site: true },
    });
    if (!sensor) return;
    const readings = await this.prisma.telemetryReading.findMany({
      where: { sensorId },
      orderBy: { timestamp: 'desc' },
      take: 30,
    });
    const detector = new RuleBasedAnomalyDetector({
      continuousMinutes: this.config.get('ANOMALY_CONTINUOUS_FLOW_MINUTES', 15),
      flowThreshold: this.config.get('ANOMALY_CONTINUOUS_FLOW_THRESHOLD', 0.05),
      spikeMultiplier: this.config.get('ANOMALY_SPIKE_MULTIPLIER', 3),
    });
    for (const detection of detector.detect(readings, new Date()))
      await this.persist(
        sensor.site.organizationId,
        sensor.siteId,
        sensorId,
        detection.type,
        detection.severity,
        detection.score,
        detection.explanation,
        detection.evidence,
        detection.startedAt,
      );
  }
  @Cron('0 * * * * *') async evaluateOfflineSensors(): Promise<void> {
    const threshold = new Date(Date.now() - this.config.get('SENSOR_OFFLINE_MINUTES', 15) * 60000);
    const sensors = await this.prisma.sensor.findMany({
      where: { status: 'ACTIVE', OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: threshold } }] },
      include: { site: true },
    });
    for (const sensor of sensors) {
      await this.prisma.sensor.update({ where: { id: sensor.id }, data: { status: 'OFFLINE' } });
      await this.persist(
        sensor.site.organizationId,
        sensor.siteId,
        sensor.id,
        'SENSOR_OFFLINE',
        'MEDIUM',
        1,
        'Sensor sem comunicação acima do limite esperado.',
        {
          lastSeenAt: sensor.lastSeenAt?.toISOString() ?? 'never',
          threshold: threshold.toISOString(),
        },
        threshold,
      );
    }
  }
  private async persist(
    organizationId: string,
    siteId: string,
    sensorId: string,
    type: AnomalyType,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    score: number,
    explanation: string,
    evidence: Record<string, unknown>,
    startedAt: Date,
  ) {
    const since = new Date(Date.now() - this.config.get('ANOMALY_COOLDOWN_MINUTES', 60) * 60000);
    if (
      await this.prisma.anomaly.findFirst({
        where: {
          sensorId,
          type,
          createdAt: { gte: since },
          status: { in: ['OPEN', 'ACKNOWLEDGED'] },
        },
      })
    )
      return;
    await this.prisma.$transaction(async (tx) => {
      const anomaly = await tx.anomaly.create({
        data: {
          organizationId,
          siteId,
          sensorId,
          type,
          severity,
          score,
          explanation,
          evidence: evidence as Prisma.InputJsonValue,
          startedAt,
        },
      });
      await tx.alert.create({
        data: {
          organizationId,
          anomalyId: anomaly.id,
          type,
          severity,
          title: this.title(type),
          message: explanation,
        },
      });
    });
  }
  private title(type: AnomalyType) {
    return {
      CONTINUOUS_FLOW: 'Possível vazamento',
      UNUSUAL_INCREASE: 'Consumo acima da média',
      NIGHT_CONSUMPTION: 'Consumo fora do horário',
      SPIKE: 'Pico de consumo',
      SENSOR_OFFLINE: 'Sensor offline',
    }[type];
  }
}
