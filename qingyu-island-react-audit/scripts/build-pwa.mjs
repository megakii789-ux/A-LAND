import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd(),dist=path.join(root,'dist');
if(!fs.existsSync(path.join(dist,'index.html')))throw new Error('Run vite build first');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>
 entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const files=walk(dist).filter(file=>!file.endsWith('sw.js')&&!file.endsWith('.map'))
 .map(file=>'/'+path.relative(dist,file).split(path.sep).join('/')).sort();
const digest=crypto.createHash('sha256');
for(const file of files)digest.update(fs.readFileSync(path.join(dist,file.slice(1))));
const name='qingyu-static-'+digest.digest('hex').slice(0,16);
const template=fs.readFileSync(path.join(root,'public/sw.js'),'utf8');
fs.writeFileSync(path.join(dist,'sw.js'),template.replace('__QY_CACHE_NAME__',name)
 .replace('__QY_STATIC_PATHS__',JSON.stringify(files)));
console.log(`PWA static manifest: ${files.length} files, ${name}`);
