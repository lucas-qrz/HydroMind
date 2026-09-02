import { RuleBasedAnomalyDetector } from './detector';
describe('RuleBasedAnomalyDetector', () => {
  const detector = new RuleBasedAnomalyDetector({
    continuousMinutes: 15,
    flowThreshold: 0.05,
    spikeMultiplier: 3,
  });
  it('detecta pico e explica em português', () => {
    const now = new Date('2026-09-02T12:00:00Z');
    const readings = [1, 1, 1, 1, 8].map((flowRate, i) => ({
      timestamp: new Date(now.getTime() - (4 - i) * 60000),
      flowRate,
      volumeDelta: 0.1,
    }));
    const result = detector.detect(readings, now);
    expect(result.some((r) => r.type === 'SPIKE')).toBe(true);
    expect(result.find((r) => r.type === 'SPIKE')?.explanation).toContain('pico');
  });
  it('detecta fluxo contínuo', () => {
    const now = new Date();
    const readings = [12, 8, 4].map((minutes) => ({
      timestamp: new Date(now.getTime() - minutes * 60000),
      flowRate: 1,
      volumeDelta: 0.1,
    }));
    expect(detector.detect(readings, now).some((r) => r.type === 'CONTINUOUS_FLOW')).toBe(true);
  });
});
