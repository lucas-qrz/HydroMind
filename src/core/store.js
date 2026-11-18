const key = 'hydromind-demo-v1';
export const initial = {
  profile: { name:'Marina Souza', email:'marina.souza@email.com', phone:'(19) 99876-5432', address:'Rua das Acácias, 120 · Campinas, SP', property:'Casa', photo:'' },
  sensors: [
    {id:'cozinha',name:'Cozinha',icon:'kitchen',status:'ok',battery:92,flow:2.4,today:128,limit:8,duration:10,signal:94,last:'Agora'},
    {id:'banheiro',name:'Banheiro',icon:'bath',status:'warning',battery:76,flow:0.31,today:164,limit:6,duration:15,signal:85,last:'Agora'},
    {id:'servico',name:'Área de serviço',icon:'washer',status:'ok',battery:84,flow:0,today:68,limit:12,duration:10,signal:88,last:'Há 1 min'},
    {id:'jardim',name:'Jardim',icon:'leaf',status:'ok',battery:65,flow:0,today:32,limit:15,duration:20,signal:72,last:'Há 2 min'},
    {id:'caixa',name:"Caixa d'água",icon:'tank',status:'danger',battery:18,flow:0,today:20,limit:20,duration:30,signal:61,last:'Há 3 min'}
  ],
  alerts:[
    {id:'a1',title:'Possível vazamento no Banheiro',sensor:'banheiro',severity:'danger',flow:0.31,minutes:45,read:false,status:'open',date:'2026-11-17T09:15:00',hint:'Descarga do vaso sanitário'},
    {id:'a2',title:"Bateria baixa na Caixa d'água",sensor:'caixa',severity:'warning',flow:0,minutes:0,read:false,status:'open',date:'2026-11-17T08:42:00',hint:'Bateria em 18%'},
    {id:'a3',title:'Consumo elevado na Cozinha',sensor:'cozinha',severity:'warning',flow:8.2,minutes:12,read:true,status:'resolved',date:'2026-11-16T18:30:00',hint:'Pico de consumo identificado'},
    {id:'a4',title:'Jardim voltou a se conectar',sensor:'jardim',severity:'ok',flow:0,minutes:0,read:true,status:'resolved',date:'2026-11-15T07:10:00',hint:'Conexão restabelecida'},
    {id:'a5',title:'Consumo noturno na Área de serviço',sensor:'servico',severity:'warning',flow:1.4,minutes:20,read:true,status:'open',date:'2026-11-11T02:30:00',hint:'Uso fora do padrão'},
    {id:'a6',title:'Leitura normalizada no Banheiro',sensor:'banheiro',severity:'ok',flow:0,minutes:0,read:true,status:'resolved',date:'2026-10-28T15:00:00',hint:'Monitoramento normal'}
  ],
  tariff:8.5, reference:9.32, goal:10, away:false, awayReturn:'', valveClosed:false,
  access:[{id:'p1',name:'Rafael Souza',email:'rafael.souza@email.com',role:'Só visualizar'}],
  preferences:{font:0,contrast:false,dark:false,reduced:false,reader:true,captions:true},
  notifications:{leak:true,high:true,offline:true,battery:true,maintenance:true,tips:false,weekly:true,push:true,email:true,whatsapp:false,sms:false,quiet:false,quietStart:'22:00',quietEnd:'07:00'},
  subscription:{plan:'Mensal',price:29.9,status:'active',method:'Pix'},
  visit:null,
  tickets:[{id:'SAC-20261110-0001',date:'2026-11-10',reason:'Dúvida sobre instalação',status:'Em andamento',messages:[{from:'support',text:'Olá, Marina! Posso ajudar com a instalação do seu HM-FLOW-01.'}]}],
  feedback:[]
};
let state;
try { const saved=JSON.parse(localStorage.getItem(key)||'null'); state=saved ? {...structuredClone(initial),...saved} : structuredClone(initial); }
catch { state=structuredClone(initial); }
export const get = () => state;
export function update(mutator) { mutator(state); try {localStorage.setItem(key,JSON.stringify(state));} catch {} return state; }
export function reset() { state=structuredClone(initial); try {localStorage.removeItem(key);} catch {} }
export function sensor(id) { return state.sensors.find(s=>s.id===id); }
export function snapshot() { return structuredClone(state); }
