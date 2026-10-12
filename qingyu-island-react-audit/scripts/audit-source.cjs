/* Offline source checks. NOT a React build, semantic typecheck, browser test or security certification. */
const fs=require('node:fs'),path=require('node:path');
let ts;
try{ts=require('typescript');}catch{
 if(!process.env.TYPESCRIPT_PATH)throw new Error('Install project dependencies or set TYPESCRIPT_PATH to a real TypeScript package');
 ts=require(process.env.TYPESCRIPT_PATH);
}
const root=process.cwd(),errors=[],checks=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>
 x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]);
const sourceFiles=[...walk(path.join(root,'src')).filter(x=>/\.tsx?$/.test(x)),path.join(root,'server.ts')];
const supportingFiles=[...walk(path.join(root,'tests')).filter(x=>/\.tsx?$/.test(x)),
 ...fs.readdirSync(root).filter(x=>x.endsWith('.config.ts')).map(x=>path.join(root,x))];
const files=[...sourceFiles,...supportingFiles];
const asts=new Map();
for(const file of files){
 const source=fs.readFileSync(file,'utf8');
 const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 asts.set(file,sf);
 for(const d of sf.parseDiagnostics)errors.push({file:path.relative(root,file),message:ts.flattenDiagnosticMessageText(d.messageText,' ')});
}
const resolveLocal=(file,spec)=>{
 const p=path.resolve(path.dirname(file),spec);
 return [p,p+'.ts',p+'.tsx',p+'.js',path.join(p,'index.ts'),path.join(p,'index.tsx')].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile());
};
for(const[file,sf]of asts){
 for(const s of sf.statements){
  if((ts.isImportDeclaration(s)||ts.isExportDeclaration(s))&&s.moduleSpecifier&&ts.isStringLiteral(s.moduleSpecifier)){
   const spec=s.moduleSpecifier.text;
   if(spec.startsWith('.')&&!resolveLocal(file,spec))errors.push({file:path.relative(root,file),message:'Missing local import '+spec});
  }
 }
}
const reachable=new Set(),external=new Set();
function visit(file){
 if(reachable.has(file))return;reachable.add(file);
 const sf=asts.get(file);if(!sf)return;
 for(const s of sf.statements)if(ts.isImportDeclaration(s)&&ts.isStringLiteral(s.moduleSpecifier)){
   if(s.importClause?.isTypeOnly)continue;
   const spec=s.moduleSpecifier.text;
   if(spec.startsWith('.')){const target=resolveLocal(file,spec);if(target)visit(target);}
   else external.add(spec);
 }
}
visit(path.join(root,'src/main.tsx'));
function check(name,condition){checks.push({name,passed:!!condition});if(!condition)errors.push({file:'policy',message:name});}
check('active graph excludes Firebase and generative AI',[...external].every(x=>!/(firebase|genai|google)/i.test(x)));
check('no cloud backup, medals or generated report view imported by live app',[...reachable].every(x=>!/(GoogleDriveModal|MedalsModal|WeeklyReportView|CaregiverHugInbox)\.tsx$/.test(x)));
let networkCalls=[],nestedButtons=[];
for(const file of reachable){
 const sf=asts.get(file);if(!sf)continue;
 const scan=(node,insideButton=false)=>{
  if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&['fetch','XMLHttpRequest'].includes(node.expression.text))
   networkCalls.push(path.relative(root,file));
  const button=ts.isJsxElement(node)&&node.openingElement.tagName.getText(sf)==='button';
  if(button&&insideButton)nestedButtons.push(path.relative(root,file));
  ts.forEachChild(node,child=>scan(child,insideButton||button));
 };
 scan(sf);
}
check('no active direct network data submission',networkCalls.length===0);
check('no nested native button in active JSX',nestedButtons.length===0);
const server=fs.readFileSync(path.join(root,'server.ts'),'utf8');
check('server no longer trusts unsigned base64 claims',!server.includes("Buffer.from(tokenPart")&&!server.includes('extractSession'));
check('API default is explicit 503',server.includes('API_DISABLED_PENDING_VERIFIED_AUTH')&&server.includes('res.status(503)'));
const css=fs.readFileSync(path.join(root,'src/index.css'),'utf8');
check('no global horizontal overflow masking',!css.includes('overflow-x: hidden')&&!css.includes('overflow-x:hidden'));
check('reduced motion is supported',css.includes('prefers-reduced-motion:reduce'));
check('dialog focus, Escape and focus restoration are coded',(()=>{
 const d=fs.readFileSync(path.join(root,'src/components/shared/DialogFrame.tsx'),'utf8');
 return d.includes('.showModal()')&&d.includes('onCancel=')&&d.includes("e.key!=='Tab'")&&d.includes('before.focus');
})());
const result={compiler:ts.version,kind:'syntax + local import + static policy checks',sourceFiles:sourceFiles.length,supportingFiles:supportingFiles.length,
 activeModules:reachable.size,externalImports:[...external].sort(),checks,errors,
 limits:['No semantic React typecheck','No bundler execution','No React browser rendering','Static call scanning is not a network security proof']};
fs.mkdirSync(path.join(root,'audit'),{recursive:true});
fs.writeFileSync(path.join(root,'audit/source-checks.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(errors.length)process.exitCode=1;
