import test from 'node:test';
import assert from 'node:assert/strict';
import {passwordRules,emailValid,phoneValid,phoneMask} from '../src/core/logic.js';
import {submit,action} from '../src/modules/account.js';
import {reset} from '../src/core/store.js';
test('cadastro aceita contato válido e exige todos os requisitos de senha',()=>{
  assert.equal(emailValid('marina.souza@email.com'),true);assert.equal(emailValid('marina@'),false);
  assert.equal(phoneValid('(19) 99876-5432'),true);assert.equal(phoneValid('99876'),false);
  assert.equal(phoneMask('19998765432'),'(19) 99876-5432');
  for(const weak of ['curta','abcdefgh','ABCDEFGH','Hydromind1','Hydro@xx'])assert.equal(passwordRules(weak).every(Boolean),false);
  assert.equal(passwordRules('Hydro@2026').every(Boolean),true);
});
test('verificação bloqueia após três erros e reenvio permite concluir cadastro',()=>{
  reset();const message={textContent:'',scrollIntoView(){}},button={},attempts={};
  const f={querySelector:s=>s==='.form-error'?message:button},ctx={state:'success',go:p=>ctx.destination=p,later:fn=>fn(),stateTo:s=>ctx.state=s,toast(){}};
  globalThis.document={querySelector:()=>attempts};
  try{
    submit('register',{name:'Pessoa Exemplo',identifier:'pessoa@exemplo.test',password:'Hydro@2026',consent:'on'},ctx,f);assert.equal(ctx.destination,'/verificar');
    for(let i=0;i<3;i++)submit('verify',{code:'000000'},ctx,f);
    submit('verify',{code:'123456'},ctx,f);assert.match(message.textContent,/esgotadas/);assert.equal(ctx.destination,'/verificar');
    action('code:resend',ctx);submit('verify',{code:'123456'},ctx,f);assert.equal(ctx.destination,'/login');
  }finally{delete globalThis.document;reset();}
});
