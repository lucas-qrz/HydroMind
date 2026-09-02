import { CostService } from './cost.service';
describe('CostService', () => {
  const service = new CostService({} as never);
  it('converte litros em m³ e aplica a tarifa', () =>
    expect(service.estimate(13800, 9.18)).toBe(126.68));
  it('retorna null sem tarifa', () => expect(service.estimate(1000, null)).toBeNull());
});
