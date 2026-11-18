import {validInterval} from '../core/logic.js';
export const monthly=[{label:'Jun',a:11.4,b:14.1},{label:'Jul',a:10.8,b:13.8},{label:'Ago',a:10.2,b:13.5},{label:'Set',a:9.7,b:13.2},{label:'Out',a:9.32,b:12.9},{label:'Nov',a:8.2,b:11.4}];
export function history(start,end,aggregation='day',sensor='all'){
  if(!validInterval(start,end))return [];
  const ratios={all:1,cozinha:128/412,banheiro:164/412,servico:68/412,jardim:32/412,caixa:20/412};
  const ratio=ratios[sensor]??0,rows=[];
  for(const [month,days,total] of [['2026-10',31,9.32],['2026-11',17,8.2]]){
    const weights=Array.from({length:days},(_,i)=>.8+((i*7)%11)/20), sum=weights.reduce((a,b)=>a+b,0);
    for(let i=1;i<=days;i++){const date=month+'-'+String(i).padStart(2,'0');if(date<start||date>end)continue;
      let volume=total*weights[i-1]/sum;
      if(month==='2026-11')volume=i===17?.412:7.788*weights[i-1]/(sum-weights[16]);
      rows.push({date,volume:volume*ratio});
    }
  }
  if(aggregation==='day')return rows;
  const groups=new Map();rows.forEach(r=>{const date=new Date(r.date+'T12:00:00Z');const key=aggregation==='month'?r.date.slice(0,7):(()=>{date.setUTCDate(date.getUTCDate()-((date.getUTCDay()+6)%7));return date.toISOString().slice(0,10);})();groups.set(key,(groups.get(key)||0)+r.volume);});
  return [...groups].map(([date,volume])=>({date,volume}));
}
export function compare(aStart,aEnd,bStart,bEnd,sensor='all'){
  const a=history(aStart,aEnd,'day',sensor),b=history(bStart,bEnd,'day',sensor);
  const totalA=a.reduce((t,r)=>t+r.volume,0),totalB=b.reduce((t,r)=>t+r.volume,0);
  const dayIndex=(date,start)=>Math.round((Date.parse(date)-Date.parse(start))/86400000);
  const aMap=new Map(a.map(r=>[dayIndex(r.date,aStart),r.volume])),bMap=new Map(b.map(r=>[dayIndex(r.date,bStart),r.volume]));
  const length=Math.min(62,Math.max(validInterval(aStart,aEnd)?dayIndex(aEnd,aStart)+1:0,validInterval(bStart,bEnd)?dayIndex(bEnd,bStart)+1:0));
  return {a,b,totalA,totalB,percent:totalB?((totalA-totalB)/totalB*100):null,days:Array.from({length},(_,i)=>({label:String(i+1),a:aMap.get(i)??null,b:bMap.get(i)??null}))};
}
export function csv(rows,tariff,sensorName){
  const cell=value=>{let v=String(value);if(/^[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';};
  return '\uFEFF'+[['Data','Sensor','Consumo (m³)','Custo estimado (R$)'],...rows.map(r=>[r.date,sensorName,r.volume.toFixed(4).replace('.',','),(r.volume*tariff).toFixed(2).replace('.',',')])].map(row=>row.map(cell).join(';')).join('\r\n');
}
