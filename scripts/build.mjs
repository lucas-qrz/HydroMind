import {cp,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(path.join(root,'dist'),{recursive:true});
for(const item of ['index.html','assets','src'])await cp(path.join(root,item),path.join(root,'dist',item),{recursive:true});
console.log('Aplicação estática preparada em dist/. Nenhuma dependência precisa ser instalada.');
