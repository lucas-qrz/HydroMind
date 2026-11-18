import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function walk(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();}
const files=(await Promise.all(['src','scripts','tests'].map(d=>walk(path.join(root,d))))).flat();let errors=0;
for(const file of files.filter(f=>/\.(js|mjs)$/.test(f))){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0){console.error(result.stderr);errors++;}}
for(const file of files.filter(f=>f.endsWith('.css'))){const text=await readFile(file,'utf8');if(/font-size:\s*(?:[0-9]|1[01])px/.test(text)){console.error('Fonte abaixo de 12 px:',file);errors++;}}
const {verifyOwnership}=await import('./ownership.mjs');const report=await verifyOwnership(root);report.errors.forEach(e=>console.error(e));errors+=report.errors.length;
if(errors){process.exitCode=1;console.error(`${errors} problema(s) encontrado(s).`);}else console.log(`Sintaxe verificada em ${files.filter(f=>/\.(js|mjs)$/.test(f)).length} arquivos. Tipografia >=12 px. Todos os arquivos pertencem a exatamente uma das seis partes.`);
