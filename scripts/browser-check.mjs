// QA opcional: usa Edge instalado e o protocolo DevTools, sem pacotes externos.
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createServer} from '../server.mjs';
import * as account from '../src/modules/account.js';
import * as dashboard from '../src/modules/dashboard.js';
import * as sensors from '../src/modules/sensors.js';
import * as alerts from '../src/modules/alerts.js';
import * as economy from '../src/modules/economy.js';
import * as services from '../src/modules/services.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),artifacts=path.join(root,'artifacts');
await mkdir(artifacts,{recursive:true});
const edge=process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port,debugPort=9237;
console.log('Iniciando Edge headless para QA local…');
const browser=spawn(edge,['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port='+debugPort,'--user-data-dir='+path.join(artifacts,'edge-profile'),'about:blank'],{windowsHide:true,stdio:'ignore'});
browser.on('error',e=>console.error('Falha ao abrir Edge:',e.message));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let socket,id=0;const pending=new Map(),exceptions=[],checks=[],overflows=[];
try{
  let tabs;for(let i=0;i<10;i++){try{tabs=await (await fetch(`http://127.0.0.1:${debugPort}/json/list`,{signal:AbortSignal.timeout(1000)})).json();break;}catch{await sleep(200);}}
  if(!tabs)throw new Error('Edge não disponibilizou o DevTools local. Verificação de navegador indisponível.');
  socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const current=++id;const timer=setTimeout(()=>{pending.delete(current);reject(new Error('DevTools sem resposta: '+method));},8000);pending.set(current,{resolve:v=>{clearTimeout(timer);resolve(v);},reject:e=>{clearTimeout(timer);reject(e);}});socket.send(JSON.stringify({id:current,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1024,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:base});
  for(let i=0;i<50;i++){await sleep(100);if(await evaluate('!!document.querySelector(".dashboard-layout")'))break;}
  const goto=async route=>{await evaluate(`location.hash=${JSON.stringify(route)}`);await sleep(90);assert.ok(await evaluate('!!document.querySelector("#main")'),route);};
  const click=async selector=>{assert.ok(await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`),'controle ausente: '+selector);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await sleep(100);};
  const fill=async (selector,value)=>{await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('Campo ausente');el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));})()`);};
  const screenshot=async filename=>{const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(path.join(artifacts,filename),Buffer.from(r.data,'base64'));};
  await screenshot('dashboard-desktop.png');
  const routes=[account,dashboard,sensors,alerts,economy,services].flatMap(m=>m.routes);
  for(const width of [1440,768,390]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:width===390?844:1024,deviceScaleFactor:1,mobile:width===390});
    for(const r of routes){await goto(r.sample||r.path);const overflow=await evaluate('document.documentElement.scrollWidth>innerWidth+1');if(overflow)overflows.push({width,route:r.sample||r.path,scroll:await evaluate('document.documentElement.scrollWidth')});}
    await goto('/inicio');await screenshot('dashboard-'+width+'.png');checks.push(`${routes.length} rotas em ${width}px`);console.log(checks.at(-1));
  }
  await goto('/cadastro');await fill('[name=name]','Pessoa Demonstração');await fill('[name=identifier]','pessoa@exemplo.test');await fill('[name=password]','Hydro@2026');await click('[name=consent]');assert.equal(await evaluate('document.querySelector("[type=submit]").disabled'),false);await click('[type=submit]');await sleep(850);assert.equal(await evaluate('location.hash'),'#/verificar');await fill('[name=code]','000000');await click('[type=submit]');assert.ok((await evaluate('document.querySelector(".form-error").textContent')).includes('incorreto'));await fill('[name=code]','123456');await click('[type=submit]');assert.equal(await evaluate('location.hash'),'#/login');checks.push('Cadastro → código incorreto → verificação → login');
  await goto('/sensor/banheiro');await click('[data-action=limit]');await fill('[name=limit]','9');await click('dialog [type=submit]');assert.ok((await evaluate('document.querySelector("#main").textContent')).includes('9'));checks.push('Configuração de limite persistida');
  await goto('/parear/permissoes');await click('[data-action="permission:allow"]');await sleep(1400);await click('[data-action="device:A7F2"]');await sleep(2300);assert.equal(await evaluate('location.hash'),'#/parear/nome');await click('[type=submit]');assert.equal(await evaluate('location.hash'),'#/sensores');checks.push('Pareamento completo e adição de sensor');
  await goto('/alerta/a1');await click('[data-action="valve:confirm"]');await click('[data-action="valve:fail"]');await sleep(1100);assert.ok((await evaluate('document.querySelector("dialog").textContent')).includes('Falha de comunicação'));await click('[data-action="valve:confirm"]');await click('[data-action="valve:close"]');await sleep(1100);await click('[data-action="modal:close"]');assert.ok((await evaluate('document.querySelector("#main").textContent')).includes('Resolvido'));checks.push('Registro: confirmação, falha, nova tentativa e resolução');
  await goto('/tarifa');await fill('[name=tariff]','0');await click('[type=submit]');assert.ok((await evaluate('document.querySelector(".form-error").textContent')).includes('maior que zero'));await fill('[name=tariff]','9,00');await click('[type=submit]');await sleep(800);assert.equal(await evaluate('location.hash'),'#/economia');checks.push('Tarifa: validação e atualização do dashboard');
  await goto('/pagamento?plano=Anual');await click('[data-action="pay-method:Crédito"]');await click('[type=submit]');await sleep(1100);assert.equal(await evaluate('location.hash'),'#/pagamento/aprovado');checks.push('Crédito fictício → aprovado');
  await goto('/instalacao');await click('[type=submit]');assert.equal(await evaluate('location.hash'),'#/visita');await click('[data-action="visit:reschedule"]');await fill('dialog [name=date]','2026-11-25');await click('dialog [type=submit]');assert.ok((await evaluate('document.querySelector("#main").textContent')).includes('25/11/2026'));checks.push('Solicitação de visita e reagendamento');
  await goto('/suporte');await fill('[name=message]','Preciso de ajuda para conectar meu sensor.');await click('[type=submit]');assert.ok((await evaluate('location.hash')).startsWith('#/chamado/SAC-'));checks.push('Mensagem de suporte → protocolo');
  for(const route of ['/inicio','/sensores','/alertas','/economia','/mais','/cadastro','/pagamento'])for(const state of ['loading','empty','error','offline']){await goto(route+'?estado='+state);assert.ok(await evaluate('!!document.querySelector("#view-state")'));}
  checks.push('28 variações de carregamento, vazio, erro e offline');
  await goto('/inicio');await evaluate('localStorage.removeItem("hydromind-demo-v1")');await send('Page.reload');await sleep(500);
  assert.deepEqual(overflows,[],'Páginas com transbordamento horizontal');assert.deepEqual(exceptions,[],'Erros de execução no navegador');
  const result={browser:'Microsoft Edge headless',checks,overflows,exceptions,date:new Date().toISOString()};await writeFile(path.join(artifacts,'browser-results.json'),JSON.stringify(result,null,2));console.log('QA de navegador concluída:',checks.length,'grupos de verificações.');
}finally{socket?.close();browser.kill();await new Promise(resolve=>server.close(resolve));}
