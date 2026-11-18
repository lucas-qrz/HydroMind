import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
export async function verifyOwnership(root){
  const manifest=JSON.parse(await readFile(path.join(root,'docs','divisao-commits.json'),'utf8')),errors=[];
  async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.filter(e=>!['.git','node_modules','dist','artifacts'].includes(e.name)).map(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.relative(root,path.join(dir,e.name)).replaceAll('\\','/')]))).flat();}
  const files=await walk(root),assigned=manifest.parts.flatMap(p=>p.files);
  for(const file of files){const count=assigned.filter(f=>f===file).length;if(count!==1)errors.push(`${file}: ${count} responsáveis; esperado exatamente 1.`);}
  for(const file of assigned)if(!files.includes(file))errors.push(`Arquivo atribuído não existe: ${file}`);
  if(manifest.parts.length!==6)errors.push('A divisão precisa ter exatamente seis partes.');
  return {errors,files,manifest};
}
