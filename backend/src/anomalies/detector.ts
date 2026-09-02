import { AnomalyType, Severity } from '@prisma/client';

export interface ReadingSample {
  timestamp: Date;
  flowRate: number | null;
  volumeDelta: number;
}
export interface Detection {
  type: AnomalyType;
  severity: Severity;
  score: number;
  explanation: string;
  evidence: Record<string, number | string>;
  startedAt: Date;
}
export interface DetectorConfig {
  continuousMinutes: number;
  flowThreshold: number;
  spikeMultiplier: number;
}
export interface AnomalyDetector {
  detect(readings: ReadingSample[], now: Date): Detection[];
}

export class RuleBasedAnomalyDetector implements AnomalyDetector {
  constructor(private readonly config: DetectorConfig) {}
  detect(readings: ReadingSample[], now: Date): Detection[] {
    if (!readings.length) return [];
    const ordered = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const current = ordered.at(-1)!;
    const previous = ordered.slice(0, -1);
    const result: Detection[] = [];
    const average = previous.length
      ? previous.reduce((s, r) => s + (r.flowRate ?? r.volumeDelta), 0) / previous.length
      : 0;
    const value = current.flowRate ?? current.volumeDelta;
    if (previous.length >= 3 && average > 0 && value >= average * this.config.spikeMultiplier)
      result.push({
        type: 'SPIKE',
        severity: value >= average * this.config.spikeMultiplier * 2 ? 'HIGH' : 'MEDIUM',
        score: Math.min(1, value / (average * this.config.spikeMultiplier * 2)),
        explanation: 'Foi detectado um pico abrupto de consumo em relação às leituras recentes.',
        evidence: { current: value, recentAverage: average, multiplier: value / average },
        startedAt: current.timestamp,
      });
    if (previous.length >= 6 && average > 0 && current.volumeDelta >= average * 2)
      result.push({
        type: 'UNUSUAL_INCREASE',
        severity: 'MEDIUM',
        score: Math.min(1, current.volumeDelta / (average * 4)),
        explanation: 'O consumo atual está significativamente acima da média móvel.',
        evidence: { currentVolume: current.volumeDelta, movingAverage: average },
        startedAt: current.timestamp,
      });
    const start = new Date(now.getTime() - this.config.continuousMinutes * 60000);
    const window = ordered.filter((r) => r.timestamp >= start);
    if (window.length >= 3 && window.every((r) => (r.flowRate ?? 0) >= this.config.flowThreshold))
      result.push({
        type: 'CONTINUOUS_FLOW',
        severity: 'HIGH',
        score: Math.min(1, window.length / 10),
        explanation: `Fluxo contínuo detectado por aproximadamente ${this.config.continuousMinutes} minutos.`,
        evidence: { readings: window.length, minimumFlow: this.config.flowThreshold },
        startedAt: window[0].timestamp,
      });
    const hour = current.timestamp.getUTCHours();
    if (hour >= 0 && hour < 5 && current.volumeDelta >= 0.1)
      result.push({
        type: 'NIGHT_CONSUMPTION',
        severity: 'LOW',
        score: Math.min(1, current.volumeDelta),
        explanation: 'Consumo relevante detectado em janela de baixa atividade.',
        evidence: { utcHour: hour, volumeDelta: current.volumeDelta },
        startedAt: current.timestamp,
      });
    return result;
  }
}
