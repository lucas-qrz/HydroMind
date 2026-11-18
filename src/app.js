import {get,update,reset} from './core/store.js';
import {h,icon,btn,link,card,head,badge,dataState} from './core/ui.js';
import * as account from './modules/account.js';
import * as dashboard from './modules/dashboard.js';
import * as sensors from './modules/sensors.js';
import * as alerts from './modules/alerts.js';
import * as economy from './modules/economy.js';
import * as services from './modules/services.js';

const modules=[account,dashboard,sensors,alerts,economy,services];
const routes=modules.flatMap(m=>m.routes.map(r=>({...r,module:m})));
const nav=[['Início','/inicio','home','dashboard'],['Sensores','/sensores','sensor','sensors'],['Alertas','/alertas','bell','alerts'],['Economia','/economia','leaf','economy'],['Mais','/mais','grid','account']];
let ctx,current,cleanup=[],toastTimer,previousPath='';
export function go(path) {if(location.hash==='#'+path)render();else location.hash=path;}
export function toast(message) {const el=document.querySelector('#toast');el.textContent=message;el.className='show';clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.className='',4500);}
export function close() {document.querySelector('#overlay dialog')?.close();document.querySelector('#overlay').innerHTML='';}
export function modal(title,body) {
  close();document.querySelector('#overlay').innerHTML=`<dialog class="modal" aria-labelledby="modal-title"><div class="modal-header"><h2 id="modal-title">${title}</h2>${btn(icon('close'),'modal:close','icon-button','aria-label="Fechar janela"')}</div>${body}</dialog>`;
  const d=document.querySelector('dialog');d.showModal();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
}
function preferences() {
  const p=get().preferences;
  document.documentElement.className=[p.dark?'dark':'',p.contrast?'high-contrast':'',p.reduced?'reduced-motion':'',p.font===1?'font-medium':p.font===2?'font-large':''].filter(Boolean).join(' ');
}
function navLinks(mobile=false) {const unread=get().alerts.filter(a=>!a.read).length;return nav.map(([label,to,ico,group])=>`<a href="#${to}" class="${mobile?'':'nav-link '}${current?.group===group?'active':''}" ${current?.group===group?'aria-current="page"':''}>${icon(ico)}<span>${label}</span>${group==='alerts'&&unread?`<span class="count">${unread}</span>`:''}</a>`).join('');}
function catalogue() {
  return head('Uma água. Seis perspectivas.','Explore todas as telas e os fluxos do protótipo.',link(`${icon('home')} Voltar ao início`,'/inicio'),'GUIA DO PROTÓTIPO')+
    `<div class="grid cols-3">${modules.map((m,i)=>card(`${badge(`Parte ${i+1} · ${['Lucas','Caio','Leo','Bazinga','JP','DG'][i]}`,'info')}<h2 style="margin-top:18px">${m.name}</h2><div class="flow-list">${m.routes.map(r=>`<a class="flow-link" href="#${r.sample||r.path}">${h(r.title)}${icon('chevron')}</a>`).join('')}</div>`,'prototype-group')).join('')}</div>`+
    card('<h2>Como apresentar</h2><p>Use o seletor no rodapé de cada tela para alternar os estados de dados. Fluxos específicos têm variações adicionais. Os endereços podem ser copiados e abertos diretamente. As informações são fictícias e as alterações ficam neste navegador.</p><p>Frames de referência: mobile 390 × 844, tablet a partir de 768 px e desktop 1440 × 1024. Prefixos HM/ e nomes de frames estão documentados no guia de handoff.</p>'+btn('Restaurar dados de demonstração','demo:reset','secondary'));
}
export function render() {
  cleanup.forEach(fn=>fn());cleanup=[];
  close();
  const [path,search='']=(location.hash.slice(1)||'/inicio').split('?');
  const query=new URLSearchParams(search);
  let params=[];
  current=routes.find(r=>{const match=path.match(new RegExp('^'+r.path.replace(/:[^/]+/g,'([^/]+)')+'$'));if(match){params=match.slice(1);return true;}return false;});
  ctx={path,query,params,state:query.get('estado')||'success',go,render,toast,modal,close,cleanup,update,get,
    later(fn,ms){const id=setTimeout(fn,ms);cleanup.push(()=>clearTimeout(id));return id;},
    stateTo(state){const q=new URLSearchParams(query);if(state==='success')q.delete('estado');else q.set('estado',state);go(path+(q.size?'?'+q:''));}
  };
  if(path==='/prototipo')current={title:'Protótipo',group:'',view:catalogue};
  if(!current)current={title:'Página não encontrada',group:'',view:()=>head('Essa página não foi encontrada','Volte ao início para continuar.',link('Ir para o início','/inicio'))};
  preferences();document.title=`${current.title} · Água Alerta`;
  let body=current.view(ctx);
  const stateManaged=new Set(['/inicio','/sensor/:id','/sensores','/saude','/saude/:id','/alertas','/alerta/:id','/economia','/tarifa','/historico','/comparar','/semelhantes','/dicas','/condominio','/tutoriais','/instalacao','/visita','/chamados']);
  if(current.module&&!stateManaged.has(current.path)&&['loading','empty','error','offline'].includes(ctx.state)&&!(current.path==='/login'&&ctx.state==='error'))body=dataState(ctx,body);
  const profile=get().profile;
  const states=['success','loading','empty','error','offline',...(current.states||[])];
  const stateLabels={success:'Sucesso',loading:'Carregando',empty:'Vazio',error:'Erro',offline:'Offline',active:'Alerta ativo',denied:'Permissão negada',permanent:'Negada permanentemente',bluetooth:'Bluetooth desligado',timeout:'Tempo esgotado',refused:'Pareamento recusado',disconnected:'Desconectou ao parear',conflict:'Conflito · 409',expired:'Expirado',rejected:'Recusado',achieved:'Meta atingida',missed:'Meta não atingida'};
  const controls=`<footer class="prototype-bar"><a href="#/prototipo">${icon('grid')} &nbsp;Mapa de telas</a><span>Protótipo acadêmico · dados simulados</span><label>Estado: <select id="view-state" aria-label="Estado da demonstração">${[...new Set(states)].map(v=>`<option value="${v}" ${ctx.state===v?'selected':''}>${stateLabels[v]||h(v)}</option>`).join('')}</select></label></footer>`;
  document.querySelector('#app').innerHTML=current.auth?`<div class="auth-shell"><aside class="auth-art"><a class="brand" href="#/inicio"><img src="assets/mark.svg" alt=""><div><strong>hydro mind</strong><small>ÁGUA ALERTA</small></div></a><div class="auth-art-content"><div class="auth-water">${icon('drop')}</div><h1>Cada gota conta.<br>Você no controle.</h1><p>Inteligência que cuida da sua água, da sua casa e do amanhã.</p></div><div class="auth-art-footer">Campinas, SP · Tecnologia com propósito</div></aside><main class="auth-main" id="main" tabindex="-1"><div class="auth-content"><a class="auth-brand-mobile" href="#/inicio"><img src="assets/mark.svg" alt="">hydro mind</a>${body}${controls}</div></main></div>`:
    `<div class="app-shell"><aside class="sidebar"><a class="brand" href="#/inicio"><img src="assets/mark.svg" alt=""><div><strong>hydro mind</strong><small>ÁGUA ALERTA</small></div></a><div class="nav-label">SEU MONITORAMENTO</div><nav aria-label="Navegação principal">${navLinks()}</nav><div class="sidebar-bottom"><div class="sidebar-tip">${icon('leaf')}<strong>Pequenas ações.<br>Grandes mudanças.</strong><p>Uma casa consciente faz a diferença para o planeta.</p><a href="#/dicas" class="button ghost" style="color:#8be4f4;padding:12px 0 0;font-size:12px">Explore nossas dicas ${icon('arrow')}</a></div><a class="nav-link" href="#/suporte">${icon('help')}<span>Precisa de ajuda?</span></a><div class="sidebar-footer">Hydro Mind © 2026<br>Protótipo acadêmico</div></div></aside><header class="topbar"><div class="breadcrumb"><span>Meu espaço</span>${icon('chevron')}<strong>${current.title}</strong></div><div class="top-actions"><span class="demo-badge">Demonstração</span><a href="#/prototipo" class="button ghost presentation-button">${icon('grid')} Apresentação</a><a class="icon-button" href="#/alertas" aria-label="Notificações">${icon('bell')}<span class="notification-dot"></span></a><a class="profile-mini" href="#/perfil"><span class="avatar">${profile.photo?`<img src="${h(profile.photo)}" alt="Foto de perfil">`:h(profile.name.split(' ').map(n=>n[0]).slice(0,2).join(''))}</span><div><strong>${h(profile.name)}</strong><small>Minha residência</small></div>${icon('chevron')}</a></div></header><main class="content" id="main" tabindex="-1">${body}${controls}</main><nav class="bottom-nav" aria-label="Navegação principal mobile">${navLinks(true)}</nav></div>`;
  current.module?.mount?.(ctx);
  if(path!==previousPath){window.scrollTo(0,0);document.querySelector('#main')?.focus({preventScroll:true});previousPath=path;}
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');if(!b||b.disabled)return;
  const action=b.dataset.action;
  if(action==='modal:close'){close();return;}
  if(action.startsWith('state:')){ctx.stateTo(action.slice(6));return;}
  if(action==='demo:reset'){modal('Restaurar demonstração?',`<p>As alterações locais em perfil, sensores, alertas, metas e serviços serão substituídas pelos exemplos iniciais.</p><div class="actions">${btn('Restaurar dados','demo:confirm','danger')}${btn('Manter alterações','modal:close','secondary')}</div>`);return;}
  if(action==='demo:confirm'){reset();render();toast('Dados de demonstração restaurados.');return;}
  current.module?.action?.(action,ctx,b,e);
});
document.addEventListener('submit',async e=>{
  const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();
  if(!f.checkValidity()){f.reportValidity();return;}
  const name=f.dataset.form, data=Object.fromEntries(new FormData(f));
  await current.module?.submit?.(name,data,ctx,f);
});
document.addEventListener('change',e=>{if(e.target.id==='view-state')ctx.stateTo(e.target.value);else current.module?.change?.(e,ctx);});
document.addEventListener('input',e=>current.module?.input?.(e,ctx));
window.addEventListener('hashchange',render);render();
