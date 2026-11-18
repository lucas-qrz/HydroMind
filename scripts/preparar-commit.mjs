import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {verifyOwnership} from './ownership.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const result=await verifyOwnership(root);if(result.errors.length){console.error(result.errors.join('\n'));process.exit(1);}
const person=process.argv[2],part=result.manifest.parts.find(p=>p.owner.toLowerCase()===(person||'').toLowerCase());
if(!part){console.error('Uso: node scripts/preparar-commit.mjs Lucas|Caio|Leo|Bazinga|JP|DG');process.exit(1);}
function git(args){const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});if(r.status!==0){console.error(r.stderr||'Falha ao executar Git.');process.exit(1);}return r.stdout.trim();}
const gitRoot=git(['rev-parse','--show-toplevel']);if(path.resolve(gitRoot).toLowerCase()!==root.toLowerCase()){console.error('A raiz do repositório deve ser a pasta HydroMind. Use o repositório do projeto, sem incluir a pasta Faculdade inteira.');process.exit(1);}
const staged=git(['diff','--cached','--name-only']).split('\n').filter(Boolean),foreign=staged.filter(file=>!part.files.includes(file));
if(foreign.length){console.error('Já há arquivos de outra parte no stage. Revise-os antes de continuar:\n'+foreign.join('\n'));process.exit(1);}
git(['add','--',...part.files]);console.log(`Parte ${part.number} — ${part.owner}: arquivos preparados no stage.`);console.log(git(['diff','--cached','--stat']));console.log('\nRevise o stage e faça o commit usando sua própria identidade Git:');console.log(`git commit -m "${part.message}"`);console.log('Este script não faz commit, não muda autor e não publica.');
