import test from 'node:test';
import assert from 'node:assert/strict';
import {target} from '../src/core/logic.js';
import {action} from '../src/modules/alerts.js';
import {get,reset} from '../src/core/store.js';
test('meta e desperdício usam conversão de litros para m³ antes do custo',()=>{const t=target(10,20,8.5);assert.equal(t.volume,8);assert.equal(t.cost,68);assert.equal((.31*45/1000*8.5).toFixed(2),'0.12');assert.equal(target(9.32,10,8.5).volume.toFixed(3),'8.388');});
test('falha de comunicação não fecha registro; confirmação bem-sucedida resolve alerta',()=>{
  reset();const ctx={params:['a1'],modal(){},render(){},later:fn=>fn(),toast(){}};
  action('valve:fail',ctx);assert.equal(get().valveClosed,false);assert.equal(get().alerts[0].status,'open');
  action('valve:close',ctx);assert.equal(get().valveClosed,true);assert.equal(get().alerts[0].status,'resolved');reset();
});
