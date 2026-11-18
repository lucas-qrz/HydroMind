import test from 'node:test';
import assert from 'node:assert/strict';
import {planPrices} from '../src/core/logic.js';
import {submit,action} from '../src/modules/services.js';
import {get,reset} from '../src/core/store.js';
test('planos mantêm desconto anunciado e totais coerentes',()=>{const saving=1-planPrices.Anual/(planPrices.Mensal*12);assert.equal(Math.round(saving*100),22);assert.ok(planPrices.Trimestral<planPrices.Mensal*3);assert.equal((planPrices.Anual+499).toFixed(2),'778.90');});
test('pagamento demonstrativo atualiza assinatura sem persistir dados do cartão',async()=>{
  reset();const ctx={query:new URLSearchParams('plano=Anual'),render(){},later:fn=>fn(),go:p=>ctx.destination=p},f={querySelector:()=>({})};
  await action('pay-method:Crédito',ctx);submit('payment',{card:'4242 4242 4242 4242',expiry:'12/30',cvv:'123'},ctx,f);
  assert.equal(ctx.destination,'/pagamento/aprovado');assert.equal(get().subscription.plan,'Anual');assert.equal(get().subscription.method,'Crédito');assert.equal(JSON.stringify(get()).includes('4242'),false);
  reset();
});
test('agendamento, reagendamento e cancelamento preservam os dados da visita',()=>{
  reset();const ctx={go:p=>ctx.destination=p,render(){},toast(){}},f={};
  submit('visit',{name:'Marina Souza',email:'marina.souza@email.com',phone:'(19) 99876-5432',address:'Endereço fictício',date:'2026-11-20',slot:'08:00–12:00'},ctx,f);assert.equal(ctx.destination,'/visita');assert.equal(get().visit.status,'Agendada');
  submit('reschedule',{date:'2026-11-25',slot:'13:00–17:00'},ctx,f);assert.equal(get().visit.date,'2026-11-25');
  submit('cancel-visit',{reason:'Outra data'},ctx,f);assert.equal(get().visit.cancelled,true);assert.equal(get().visit.address,'Endereço fictício');reset();
});
