export const money = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
export const number = (value,digits=0) => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:digits}).format(value);
export const decimal = value => Number(String(value).trim().replace(/\s/g,'').replace(',','.'));
export const emailValid = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const phoneValid = value => /^\d{10,11}$/.test(value.replace(/\D/g,''));
export function passwordRules(value) { return [value.length>=8,/[A-Z]/.test(value),/[a-z]/.test(value),/\d/.test(value),/[^A-Za-z0-9]/.test(value)]; }
export function phoneMask(value) { const d=value.replace(/\D/g,'').slice(0,11); return d.length>6 ? `(${d.slice(0,2)}) ${d.slice(2,d.length>10?7:6)}-${d.slice(d.length>10?7:6)}` : d.length>2 ? `(${d.slice(0,2)}) ${d.slice(2)}` : d; }
export const validInterval = (start,end) => Boolean(start&&end&&/^\d{4}-\d{2}-\d{2}$/.test(start)&&/^\d{4}-\d{2}-\d{2}$/.test(end)&&Number.isFinite(Date.parse(start))&&Number.isFinite(Date.parse(end))&&start<=end);
export function target(reference,percent,tariff) { const volume=reference*(1-percent/100); return {volume,cost:volume*tariff}; }
export function contrast(a,b) {
  const lum=hex=>{const c=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return c[0]*0.2126+c[1]*0.7152+c[2]*0.0722;};
  const [x,y]=[lum(a),lum(b)].sort((x,y)=>y-x);return (x+0.05)/(y+0.05);
}
export const planPrices = {Mensal:29.9,Trimestral:79.9,Anual:279.9};
export function recommend({bathrooms=1,kitchen=true,laundry=true,garden=false,tank=false}) {
  return [...Array(Math.max(0,Math.min(20,Number(bathrooms)||0)))].map((_,i)=>`Banheiro ${i+1}`).concat(kitchen?['Cozinha']:[],laundry?['Área de serviço']:[],garden?['Jardim']:[],tank?["Caixa d'água"]:[]);
}
