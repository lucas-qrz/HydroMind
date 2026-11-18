import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../server.mjs';
import {get,reset,update} from '../src/core/store.js';
import * as account from '../src/modules/account.js';
import * as dashboard from '../src/modules/dashboard.js';
import * as sensors from '../src/modules/sensors.js';
import * as alerts from '../src/modules/alerts.js';
import * as economy from '../src/modules/economy.js';
import * as services from '../src/modules/services.js';
const modules=[account,dashboard,sensors,alerts,economy,services];
test('todos os destinos renderizados resolvem uma rota do protótipo',()=>{
  const routes=modules.flatMap(m=>m.routes),patterns=routes.map(r=>new RegExp('^'+r.path.replace(/:[^/]+/g,'([^/]+)')+'$')),seen=new Set();
  reset();update(s=>s.visit={date:'2026-11-20',slot:'08:00–12:00',address:'Endereço fictício',status:'Agendada'});
  for(const route of routes){assert.ok(!seen.has(route.path),'rota duplicada '+route.path);seen.add(route.path);const sample=route.sample||route.path,params=sample.match(new RegExp('^'+route.path.replace(/:[^/]+/g,'([^/]+)')+'$')).slice(1);
    for(const state of ['success','loading','empty','error','offline',...(route.states||[])]){
      const body=route.view({path:sample,params,query:new URLSearchParams(),state,get,update});assert.equal(typeof body,'string');assert.ok(body.length>20,sample);assert.ok(!body.includes('undefined'),sample+' '+state);
      for(const match of body.matchAll(/href="#([^\"]+)"/g)){const destination=match[1].split('?')[0];assert.ok(destination==='/prototipo'||patterns.some(p=>p.test(destination)),`${sample} aponta para destino inexistente: ${destination}`);}
    }
  }
  assert.ok(routes.length>=60);reset();
});
test('servidor entrega aplicação e bloqueia acesso a código de testes e arquivos privados',async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  try{for(const p of ['/','/src/app.js','/assets/mark.svg','/src/styles.css'])assert.equal((await fetch(base+p)).status,200,p);for(const p of ['/package.json','/server.mjs','/docs/divisao-commits.json','/tests/integration.test.mjs','/missing','/%2e%2e/server.mjs'])assert.equal((await fetch(base+p)).status,404,p);}finally{await new Promise(resolve=>server.close(resolve));}
});
