import {get,update} from '../core/store.js';
import {emailValid,phoneValid,passwordRules,phoneMask} from '../core/logic.js';
import {h,icon,btn,link,card,head,field,select,toggle,form,notice,back,badge,error,empty} from '../core/ui.js';
export const name='Conta, perfil e configurações';
let slide=0,rating=5,verification={expires:Date.now()+900000,attempts:0},pending=null;
const ruleLabels=['Pelo menos 8 caracteres','Uma letra maiúscula','Uma letra minúscula','Um número','Um caractere especial'];
const password=(label='Senha',name='password')=>`<label class="field"><span>${label}</span><span class="password-wrap"><input type="password" name="${name}" autocomplete="new-password" required minlength="8"><button type="button" data-action="password:${name}" aria-label="Mostrar senha">${icon('eye')}</button></span></label><ul class="password-rules" data-rules>${ruleLabels.map(t=>`<li>${icon('info')}${t}</li>`).join('')}</ul>`;
const menu=[['Meu perfil','/perfil','user','Seus dados e seu imóvel'],['Compartilhar acesso','/compartilhar','users','Sua casa, conectada com quem importa'],['Notificações','/notificacoes','bell','Escolha como quer ser avisado'],['Acessibilidade','/acessibilidade','eye','Uma experiência do seu jeito'],['Planos e pagamento','/assinatura','card','Gerencie sua assinatura'],['Tutoriais','/tutoriais','play','Instalação e primeiros passos'],['Suporte','/suporte','help','Estamos aqui para ajudar'],['Avaliar o produto','/avaliar','star','Conte como foi sua experiência'],['Sair','/login','logout','Voltar à tela de entrada']];
function authHeading(title,desc){return `<div class="eyebrow">HYDRO MIND · ÁGUA ALERTA</div><h1>${title}</h1><p>${desc}</p>`;}
function register(ctx){return authHeading('Sua casa mais inteligente.','Crie sua conta e comece a cuidar de cada gota.')+
  (ctx.state==='conflict'?notice('E-mail ou telefone já cadastrado (409). Entre na sua conta ou recupere sua senha.','danger'):'')+
  form('register',field('Nome completo','name','text','','required autocomplete="name"')+field('E-mail ou telefone','identifier','text','','required autocomplete="username" placeholder="seu@email.com ou (19) 99999-9999"')+password()+`<label class="checkbox-row"><input type="checkbox" name="consent" required> <span>Li e aceito a <a href="#/privacidade">Política de Privacidade</a> e o tratamento dos dados desta demonstração.</span></label>`,'Criar conta')+`<p class="auth-footer">Já tem conta? <a href="#/login">Entrar</a></p>`;}
function verify(ctx){return back('/cadastro')+authHeading('Confira seu código.','Na demonstração, use o código 123456. Nenhum e-mail ou SMS foi enviado.')+form('verify',field('Código de 6 dígitos','code','text','','class="otp" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" required autocomplete="one-time-code"')+`<p class="muted">Válido por <strong id="code-timer">15:00</strong> · <span id="attempts">${3-verification.attempts}</span> tentativa(s) restante(s).</p>`,'Verificar código')+btn('Reenviar código','code:resend','ghost')+(ctx.state==='expired'?notice('O código expirou. Solicite um novo código.','warning'):'');}
function login(ctx){return authHeading('Bem-vinda de volta.','Sua água sob controle. Seu futuro mais tranquilo.')+notice('Acesso de demonstração: marina.souza@email.com · senha Hydro@2026')+form('login',field('E-mail ou telefone','identifier','text','marina.souza@email.com','required autocomplete="username"')+`<label class="field"><span>Senha</span><span class="password-wrap"><input type="password" name="password" required autocomplete="current-password"><button type="button" data-action="password:password" aria-label="Mostrar senha">${icon('eye')}</button></span></label><a href="#/recuperar">Esqueci minha senha</a>`,'Entrar')+`<p class="auth-footer">Primeira vez aqui? <a href="#/cadastro">Criar conta</a></p>`+(ctx.state==='error'?notice('Credenciais inválidas. Confira e tente novamente.','danger'):'');}
function profile(){const p=get().profile;return back()+head('Meu perfil','Um pouco sobre você e a sua casa.')+`<div class="narrow">${card(`<div class="actions" style="margin-bottom:24px"><span class="avatar avatar-large">${p.photo?`<img src="${h(p.photo)}" alt="Foto do perfil">`:'MS'}</span><label class="button secondary">${icon('user')} Alterar foto<input type="file" name="photo" accept="image/png,image/jpeg,image/webp" hidden></label><small class="muted">JPG, PNG ou WebP · até 2 MB</small></div>`+form('profile',field('Nome completo','name','text',p.name,'required minlength="3" autocomplete="name"')+field('E-mail','email','email',p.email,'required autocomplete="email"')+field('Telefone','phone','tel',p.phone,'required autocomplete="tel"')+field('Endereço','address','text',p.address,'required autocomplete="street-address"')+select('Tipo de imóvel','property',['Casa','Apartamento','Empresa','Escola','Condomínio'],p.property)))}</div>`;}
function share(){return back()+head('Cuidar, juntos.','Compartilhe o monitoramento com pessoas de confiança.',btn(`${icon('plus')} Convidar`,'invite'))+card(`<div class="menu-list">${get().access.length?get().access.map(p=>`<div class="menu-item"><span class="avatar">${h(p.name[0])}</span><div class="grow"><strong>${h(p.name)}</strong><small>${h(p.email)} · ${h(p.role)}</small></div>${btn('Remover',`remove:${p.id}`,'soft-danger')}</div>`).join(''):empty('Nenhum acesso compartilhado','Convide alguém para acompanhar o consumo.')}</div>`);}
function accessibility(){const p=get().preferences;return back()+head('Do seu jeito.','Ajuste a experiência para ficar confortável para você.')+`<div class="narrow">${card(form('accessibility',select('Tamanho da fonte','font',[[0,'Padrão'],[1,'Maior'],[2,'Muito maior']],p.font)+toggle('Alto contraste','contrast',p.contrast,'Reforça textos, bordas e controles.')+toggle('Modo escuro','dark',p.dark)+toggle('Reduzir animações','reduced',p.reduced)+toggle('Anúncios extras para leitor de tela','reader',p.reader,'Controles, rótulos e navegação por teclado estão sempre disponíveis.')+toggle('Legendas sempre ativas','captions',p.captions,'Aplicado ao player demonstrativo.')))}</div>`;}
export const routes=[
  {path:'/splash',title:'Splash',auth:true,group:'account',view:()=>`<div class="splash-content"><img src="assets/mark.png" width="120" height="120" alt="Símbolo Hydro Mind"><div class="eyebrow" style="margin-top:28px">HYDRO MIND</div><h1>Água Alerta</h1><p>O futuro da água começa em casa.</p>${link('Começar '+icon('arrow'),'/boas-vindas')}</div>`},
  {path:'/boas-vindas',title:'Boas-vindas',auth:true,group:'account',view:()=>{const slides=[['drop','Sua água, em tempo real.','Conheça o consumo da sua casa e acompanhe cada ambiente de onde estiver.'],['shield','Cuidado que antecipa.','Receba alertas de possíveis vazamentos e aja antes que uma gota vire um problema.'],['leaf','Economize com propósito.','Transforme seus hábitos, acompanhe metas e veja a economia acontecer.']];const s=slides[slide];return `<div class="empty-icon" style="width:100px;height:100px">${icon(s[0])}</div>${authHeading(s[1],s[2])}<div class="steps">${slides.map((_,i)=>btn(`<span class="step ${slide===i?'active':''}"></span>`,`slide:${i}`,'ghost',`aria-label="Slide ${i+1}" aria-pressed="${slide===i}"`)).join('')}</div><div class="stack">${link('Criar conta','/cadastro')}${link('Já tenho conta','/login','secondary')}</div>`;}},
  {path:'/cadastro',title:'Cadastro',auth:true,group:'account',states:['conflict'],view:register},
  {path:'/verificar',title:'Verificação',auth:true,group:'account',states:['expired'],view:verify},
  {path:'/login',title:'Login',auth:true,group:'account',view:login},
  {path:'/recuperar',title:'Recuperar senha',auth:true,group:'account',view:()=>back('/login')+authHeading('Vamos recuperar seu acesso.','Informe seu e-mail para simular o envio de um link de recuperação.')+form('recover',field('E-mail','email','email','','required autocomplete="email"'),'Enviar link')},
  {path:'/recuperar/enviado',title:'Link enviado',auth:true,group:'account',view:()=>empty('Confira sua caixa de entrada.','Simulação: um link de recuperação foi preparado. Nenhuma mensagem externa foi enviada.',link('Abrir link demonstrativo','/nova-senha'))},
  {path:'/nova-senha',title:'Nova senha',auth:true,group:'account',view:ctx=>ctx.state==='expired'?empty('Esse link expirou.','Solicite um novo link para continuar.',link('Solicitar novo link','/recuperar')):authHeading('Um novo começo.','Escolha uma senha diferente da senha demonstrativa atual.')+form('reset',password('Nova senha')+field('Confirmar nova senha','confirmation','password','','required autocomplete="new-password"'),'Salvar nova senha'),states:['expired']},
  {path:'/senha-atualizada',title:'Senha atualizada',auth:true,group:'account',view:()=>empty('Tudo pronto!','A troca de senha foi simulada. O acesso demonstrativo continua disponível.',link('Voltar para o login','/login'))},
  {path:'/mais',title:'Mais',group:'account',view:()=>head('Seu espaço.','Tudo o que você precisa, em um só lugar.')+`<div class="narrow">${card(`<div class="actions" style="margin-bottom:24px"><span class="avatar avatar-large">MS</span><div><h2 style="margin:0 0 6px">${h(get().profile.name)}</h2><span class="muted">${h(get().profile.email)}</span></div></div><div class="menu-list">${menu.map(([label,to,ico,desc])=>`<a class="menu-item" href="#${to}">${icon(ico)}<div><strong>${label}</strong><small>${desc}</small></div>${icon('chevron')}</a>`).join('')}</div>`)}</div>`},
  {path:'/perfil',title:'Meu perfil',group:'account',view:profile},
  {path:'/compartilhar',title:'Compartilhar acesso',group:'account',view:share},
  {path:'/acessibilidade',title:'Acessibilidade',group:'account',view:accessibility},
  {path:'/avaliar',title:'Avaliar o produto',group:'account',view:()=>back()+head('Sua opinião faz diferença.','Conte como tem sido sua experiência com a Hydro Mind.')+`<div class="narrow">${card(`<h2>Como você avalia o Água Alerta?</h2><div class="stars" role="group" aria-label="Nota de 1 a 5 estrelas">${[1,2,3,4,5].map(n=>btn(icon('star'),`rate:${n}`,n<=rating?'secondary selected':'secondary',`aria-label="${n} estrela${n>1?'s':''}" aria-pressed="${n<=rating}"`)).join('')}</div><p id="rating-label" class="muted">${rating} de 5 estrelas</p>`+form('feedback',select('Categoria','category',['App','Sensor','Instalação','Atendimento'])+`<label class="field"><span>Comentário</span><textarea name="comment" required maxlength="1500" placeholder="O que podemos melhorar?"></textarea></label>`,'Enviar avaliação'))}</div>`},
  {path:'/avaliar/obrigado',title:'Obrigado pela avaliação',group:'account',view:()=>card(empty('Obrigado por compartilhar!','Sua avaliação foi salva neste navegador. Sua opinião ajuda a construir uma experiência melhor.',link('Voltar ao início','/inicio')))},
  {path:'/privacidade',title:'Privacidade',auth:true,group:'account',view:()=>back('/cadastro')+authHeading('Privacidade em primeiro lugar.','Aviso do protótipo acadêmico.')+`<p>Os dados de Marina Souza são fictícios. Nome, configurações e ações demonstrativas ficam apenas no armazenamento local deste navegador. Não há autenticação real, coleta por servidor nem envio de e-mail, SMS ou WhatsApp.</p><p>Evite inserir informações pessoais reais. Você pode apagar tudo em “Mapa de telas → Restaurar dados de demonstração”. O carregamento opcional das fontes Google estabelece conexão com o provedor das fontes.</p><p>Esta tela demonstra o aceite de privacidade solicitado no projeto; não representa uma política jurídica de um produto em produção.</p>`}
];
export function mount(ctx){
  if(ctx.path==='/cadastro'){const button=document.querySelector('[data-form="register"] button[type="submit"]');if(button)button.disabled=true;}
  if(ctx.path==='/verificar'){
    const tick=()=>{const remaining=ctx.state==='expired'?0:Math.max(0,Math.ceil((verification.expires-Date.now())/1000));const timer=document.querySelector('#code-timer');if(timer)timer.textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;};tick();const t=setInterval(tick,1000);ctx.cleanup.push(()=>clearInterval(t));
  }
}
export function action(action,ctx,b){
  if(action.startsWith('slide:')){slide=Number(action.split(':')[1]);ctx.render();}
  if(action.startsWith('password:')){const input=b.parentElement.querySelector('input');input.type=input.type==='password'?'text':'password';b.setAttribute('aria-label',input.type==='password'?'Mostrar senha':'Ocultar senha');}
  if(action==='code:resend'){verification={expires:Date.now()+900000,attempts:0};ctx.stateTo('success');ctx.toast('Novo código demonstrativo: 123456.');}
  if(action==='invite')ctx.modal('Convidar para cuidar da água',form('invite',field('Nome','name','text','','required')+field('E-mail','email','email','','required')+select('Permissão','role',['Só visualizar','Gerenciar']),'Enviar convite demonstrativo'));
  if(action.startsWith('remove:')){const id=action.slice(7);ctx.modal('Remover acesso?',`<p>A pessoa deixará de aparecer na lista compartilhada desta demonstração.</p>${btn('Remover acesso',`confirm-remove:${id}`,'danger')}`);}
  if(action.startsWith('confirm-remove:')){update(s=>s.access=s.access.filter(p=>p.id!==action.slice(15)));ctx.render();ctx.toast('Acesso removido.');}
  if(action.startsWith('rate:')){rating=Number(action.slice(5));document.querySelectorAll('[data-action^="rate:"]').forEach((el,i)=>{el.classList.toggle('selected',i<rating);el.setAttribute('aria-pressed',String(i<rating));});document.querySelector('#rating-label').textContent=`${rating} de 5 estrelas`;}
}
export function input(e){
  if(e.target.name==='identifier'&&e.target.value&&!/[a-z@]/i.test(e.target.value)){e.target.value=phoneMask(e.target.value);}
  if(e.target.name==='phone')e.target.value=phoneMask(e.target.value);
  const f=e.target.closest('form');
  if(f?.querySelector('[data-rules]')){const checks=passwordRules(f.elements.password.value);f.querySelector('[data-rules]').innerHTML=checks.map((ok,i)=>`<li class="${ok?'passed':''}">${icon(ok?'check':'info')}${ruleLabels[i]}</li>`).join('');if(f.dataset.form==='register')f.querySelector('[type=submit]').disabled=!(checks.every(Boolean)&&f.elements.consent.checked);}
}
export function change(e,ctx){
  if(e.target.name==='consent')input(e);
  if(e.target.name==='photo'){
    const file=e.target.files[0];if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024){ctx.toast('Escolha JPG, PNG ou WebP de até 2 MB.');return;}
    const reader=new FileReader();reader.onload=()=>{update(s=>s.profile.photo=reader.result);ctx.render();ctx.toast('Foto atualizada neste navegador.');};reader.readAsDataURL(file);
  }
}
export function submit(name,d,ctx,f){
  if(name==='register'){
    if(d.name.trim().length<3)return error('Informe seu nome completo.',f);
    if(!emailValid(d.identifier)&&!phoneValid(d.identifier))return error(d.identifier.includes('@')?'Informe um e-mail válido.':'Informe um e-mail ou telefone válido com DDD.',f);
    if(!passwordRules(d.password).every(Boolean)||!d.consent)return error('Confira os requisitos da senha e aceite a política.',f);
    if(ctx.state==='conflict'||[get().profile.email,'marina.souza@email.com','(19) 99876-5432'].includes(d.identifier))return error('E-mail ou telefone já cadastrado (409). Faça login ou recupere sua senha.',f);
    pending={name:d.name.trim(),...(emailValid(d.identifier)?{email:d.identifier}:{phone:phoneMask(d.identifier)})};verification={expires:Date.now()+900000,attempts:0};
    const b=f.querySelector('[type=submit]');b.disabled=true;b.textContent='Criando conta…';ctx.later(()=>ctx.go('/verificar'),700);
  }
  if(name==='verify'){
    if(ctx.state==='expired'||Date.now()>verification.expires)return error('Código expirado. Reenvie para continuar.',f);
    if(verification.attempts>=3)return error('Tentativas esgotadas. Solicite um novo código.',f);
    if(d.code!=='123456'){verification.attempts++;document.querySelector('#attempts').textContent=3-verification.attempts;return error(verification.attempts===3?'Tentativas esgotadas. Solicite um novo código.':'Código incorreto. Tente novamente.',f);}
    if(pending)update(s=>Object.assign(s.profile,pending));pending=null;ctx.go('/login');ctx.toast('Conta demonstrativa verificada. Use as credenciais de demonstração para entrar.');
  }
  if(name==='login'){
    if(ctx.state==='error'||!['marina.souza@email.com',get().profile.email,get().profile.phone].includes(d.identifier)||d.password!=='Hydro@2026')return error('E-mail, telefone ou senha incorretos.',f);
    const b=f.querySelector('[type=submit]');b.disabled=true;b.textContent='Entrando…';ctx.later(()=>ctx.go('/inicio'),600);
  }
  if(name==='recover'){if(!emailValid(d.email))return error('Informe um e-mail válido.',f);ctx.go('/recuperar/enviado');}
  if(name==='reset'){
    if(d.password==='Hydro@2026')return error('A nova senha não pode ser igual à atual.',f);
    if(!passwordRules(d.password).every(Boolean))return error('A senha precisa cumprir todos os requisitos.',f);
    if(d.password!==d.confirmation)return error('As senhas não coincidem.',f);ctx.go('/senha-atualizada');
  }
  if(name==='profile'){if(!emailValid(d.email)||!phoneValid(d.phone)||d.name.trim().length<3)return error('Confira nome, e-mail e telefone com DDD.',f);update(s=>Object.assign(s.profile,d));ctx.render();ctx.toast('Perfil atualizado com sucesso.');}
  if(name==='invite'){if(!emailValid(d.email))return error('Informe um e-mail válido.',f);if(get().access.some(p=>p.email===d.email)||get().profile.email===d.email)return error('Essa pessoa já tem acesso.',f);update(s=>s.access.push({id:crypto.randomUUID(),...d}));ctx.render();ctx.toast('Convite salvo na demonstração; nenhum e-mail enviado.');}
  if(name==='accessibility'){update(s=>s.preferences={font:Number(d.font),contrast:!!d.contrast,dark:!!d.dark,reduced:!!d.reduced,reader:!!d.reader,captions:!!d.captions});ctx.render();ctx.toast('Preferências salvas.');}
  if(name==='feedback'){update(s=>s.feedback.push({rating,...d,date:new Date().toISOString()}));ctx.go('/avaliar/obrigado');}
}
