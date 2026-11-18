import test from 'node:test';
import assert from 'node:assert/strict';
import {recommend} from '../src/core/logic.js';
import {submit} from '../src/modules/sensors.js';
import {get,reset} from '../src/core/store.js';
test('planejamento converte pontos informados em recomendação coerente',()=>{
  const points=recommend({bathrooms:1,kitchen:true,laundry:true,garden:true,tank:true});assert.equal(points.length,5);assert.ok(points.includes("Caixa d'água"));
  assert.equal(recommend({bathrooms:2,kitchen:true,laundry:false,garden:false,tank:false}).length,3);
  assert.equal(recommend({bathrooms:0,kitchen:false,laundry:false}).length,0);
  assert.ok(recommend({bathrooms:100}).length<=22);
});
test('concluir pareamento adiciona sensor com ID único e mantém os cinco existentes',()=>{
  reset();const ctx={go:p=>ctx.destination=p,toast(){}};submit('sensor-name',{location:'Outro',custom:'Varanda'},ctx,{});
  assert.equal(get().sensors.length,6);assert.equal(new Set(get().sensors.map(s=>s.id)).size,6);assert.equal(get().sensors.at(-1).name,'Varanda');assert.equal(ctx.destination,'/sensores');reset();
});
