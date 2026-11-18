import test from 'node:test';
import assert from 'node:assert/strict';
import {history,compare,csv} from '../src/modules/economy-data.js';
import {decimal,validInterval} from '../src/core/logic.js';
test('dados históricos reconciliam 412 L hoje, 8,2 m³ mês e 9,32 m³ outubro',()=>{
  assert.equal(history('2026-11-17','2026-11-17')[0].volume,.412);
  assert.ok(Math.abs(history('2026-11-01','2026-11-30').reduce((t,r)=>t+r.volume,0)-8.2)<1e-9);
  assert.ok(Math.abs(history('2026-10-01','2026-10-31').reduce((t,r)=>t+r.volume,0)-9.32)<1e-9);
  const all=history('2026-11-01','2026-11-17').reduce((t,r)=>t+r.volume,0);let split=0;for(const id of ['cozinha','banheiro','servico','jardim','caixa'])split+=history('2026-11-01','2026-11-17','day',id).reduce((t,r)=>t+r.volume,0);assert.ok(Math.abs(all-split)<1e-9);
});
test('agrupamento preserva totais e comparação distingue lacunas de consumo zero',()=>{
  const total=mode=>history('2026-10-01','2026-11-17',mode).reduce((t,r)=>t+r.volume,0);assert.ok(Math.abs(total('day')-total('week'))<1e-9);assert.ok(Math.abs(total('month')-total('day'))<1e-9);
  const c=compare('2026-11-01','2026-11-30','2026-10-01','2026-10-31');assert.equal(c.days.length,31);assert.equal(c.days[17].a,null);assert.equal(Math.round(c.percent),-12);
  assert.equal(compare('2026-11-01','2026-11-17','2025-01-01','2025-01-31').percent,null);
});
test('CSV pt-BR escapa aspas e fórmulas, datas e decimais são validados',()=>{
  const text=csv([{date:'2026-11-17',volume:.412}],8.5,'=SUM(A1)');assert.ok(text.startsWith('\uFEFF'));assert.ok(text.includes("'=SUM(A1)"));assert.ok(text.includes('0,4120'));assert.equal(decimal('8,50'),8.5);assert.equal(validInterval('2026-11-17','2026-11-01'),false);assert.deepEqual(history('2026-11-17','2026-11-01'),[]);
});
