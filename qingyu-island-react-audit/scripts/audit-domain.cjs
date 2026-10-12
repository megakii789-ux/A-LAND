/* Real strict compilation and Node assertions for the pure-domain subset only.
   No React, no mock crypto, no simulated Firebase service is called. */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
let ts;try{ts=require('typescript');}catch{if(!process.env.TYPESCRIPT_PATH)throw new Error('TypeScript package required');ts=require(process.env.TYPESCRIPT_PATH);}
const root=process.cwd(),out=fs.mkdtempSync(path.join(os.tmpdir(),'qingyu-domain-'));
fs.writeFileSync(path.join(out,'package.json'),'{"type":"commonjs"}');
const inputs=[
 'src/domain/privacy/localState.ts','src/domain/privacy/parentAccess.ts',
 'src/domain/hug/hugStateMapper.ts','src/domain/hug/offlineHugService.ts',
 'src/domain/safety/contentAccess.ts','src/domain/research/observationProtocol.ts',
 'src/domain/caregiver/caregiverResponseService.ts','src/providers/cloudGuard.ts','src/data/mockData.ts'
].map(f=>path.join(root,f));
const program=ts.createProgram(inputs,{
 strict:true,skipLibCheck:true,noEmitOnError:true,target:ts.ScriptTarget.ES2022,
 module:ts.ModuleKind.CommonJS,moduleResolution:ts.ModuleResolutionKind.Node10,
 lib:['lib.es2022.d.ts','lib.dom.d.ts'],types:[],outDir:out,rootDir:path.join(root,'src')
});
const diagnostics=ts.getPreEmitDiagnostics(program);
if(diagnostics.length){
 console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>root,getNewLine:()=>'\n'}));
 process.exit(1);
}
program.emit();
const load=f=>require(path.join(out,f));
const {HugRequestType:T,CommunicationStatus:C,CareResponsibility:R,CoPresenceStatus:P}=load('domain/hug/types.js');
const {mapHugStateToChildPresentation:map}=load('domain/hug/hugStateMapper.js');
const {OfflineHugController:Controller}=load('domain/hug/offlineHugService.js');
const privacy=load('domain/privacy/localState.js'),pin=load('domain/privacy/parentAccess.js');
const {INITIAL_LEAF_SCENARIOS:leaves}=load('data/mockData.js');
const access=load('domain/safety/contentAccess.js'),research=load('domain/research/observationProtocol.js');
const caregiver=load('domain/caregiver/caregiverResponseService.js');
const results=[];
const check=async(name,fn)=>{try{await fn();results.push({name,passed:true});}catch(e){results.push({name,passed:false,error:String(e)});}};
const base={requestType:T.INSTANT_HELP,communication:C.UNSENT,care:R.UNASSIGNED,coPresence:P.UNCONFIRMED};
(async()=>{
 let combos=0;
 await check('200 legacy combinations never infer arrival without meeting evidence',()=>{
  for(const requestType of Object.values(T))for(const communication of Object.values(C))
  for(const care of Object.values(R))for(const coPresence of Object.values(P)){
   const v=map({requestType,communication,care,coPresence});combos++;
   assert.equal(v.shouldStepBack,false);
   assert(!/马上|正在路上|还没到|还没有打开|失约/.test(v.spokenText));
  }
 });
 await check('unknown input fails closed',()=>{assert.equal(map(null).shouldStepBack,false);assert.match(map({}).displayText,/不清楚/);});
 await check('unsent is not sending',()=>assert.match(map(base).displayText,/还没有发出/));
 await check('server receipt does not assert seen or not seen',()=>{
  const v=map({...base,communication:C.SENT});assert(!/已看到|没看到|没有打开/.test(v.spokenText));
 });
 await check('device receipt remains human-reading unknown',()=>{
  assert.match(map({...base,communication:C.ACKNOWLEDGED,acknowledgementEvidence:'DEVICE_RECEIVED'}).displayText,/还没有收到/);
 });
 await check('explicit human opening can be stated',()=>{
  assert.match(map({...base,communication:C.ACKNOWLEDGED,acknowledgementEvidence:'HUMAN_OPENED'}).displayText,/确认看到/);
 });
 await check('a self promise never becomes arrival',()=>{
  const v=map({...base,communication:C.SENT,care:R.ASSIGNED_SELF,careEvidence:'SELF_ACCEPTED'});
  assert.equal(v.shouldStepBack,false);assert.match(v.displayText,/愿意/);
 });
 await check('delegation request is not accepted responsibility',()=>{
  const v=map({...base,communication:C.SENT,care:R.ASSIGNED_OTHER,careEvidence:'REQUESTED_OTHER'});
  assert.match(v.spokenText,/还没有收到对方接受/);
 });
 await check('delegate acceptance is attributed not physical arrival',()=>{
  const v=map({...base,communication:C.SENT,care:R.ASSIGNED_OTHER,careEvidence:'OTHER_ACCEPTED'});
  assert.equal(v.shouldStepBack,false);assert.match(v.spokenText,/回应说/);
 });
 await check('self-reported arrival is not independent confirmation',()=>{
  const v=map({...base,coPresence:P.ARRIVED_CONFIRMED,meetingEvidence:'ADULT_SELF_REPORT'});
  assert.equal(v.shouldStepBack,false);assert.match(v.spokenText,/反馈/);
 });
 await check('local flow closure does not claim someone arrived',()=>{
  const v=map({...base,coPresence:P.ARRIVED_CONFIRMED,meetingEvidence:'LOCAL_CLOSE'});
  assert.equal(v.shouldStepBack,true);assert(!/已经来到|已在身边/.test(v.spokenText));
 });
 await check('observed meeting can end screen flow',()=>{
  assert.equal(map({...base,coPresence:P.ARRIVED_CONFIRMED,meetingEvidence:'OBSERVER_REPORT'}).shouldStepBack,true);
 });
 await check('decline does not invent a reason',()=>{
  const v=map({...base,care:R.CANNOT_ATTEND,careEvidence:'DECLINED'});
  assert.match(v.spokenText,/回应说/);assert(!/开会|抽不开身|忙/.test(v.spokenText));
 });
 await check('asynchronous failure does not promise storage',()=>{
  assert(!/已保存|不会弄丢/.test(map({...base,requestType:T.ASYNC_MISS,communication:C.SEND_FAILED}).spokenText));
 });
 await check('caregiver field cannot inject predictive copy',()=>{
  assert(!map({...base,communication:C.SENT,care:R.ASSIGNED_SELF,careEvidence:'SELF_ACCEPTED',targetCaregiverName:'马上来'}).spokenText.includes('马上来'));
 });
 const request={isOnline:true,targetCaregiverName:'妈妈',requestType:T.INSTANT_HELP};
 await check('online flag without transport cannot return SENT',async()=>{
  assert.equal((await new Controller().submitHugRequest(request)).communication,C.SEND_FAILED);
 });
 await check('offline cannot invoke transport',async()=>{
  let calls=0;const c=new Controller({send:async()=>{calls++;return {accepted:true,requestId:'x'};}});
  assert.equal((await c.submitHugRequest({...request,isOnline:false})).communication,C.SEND_FAILED);assert.equal(calls,0);
 });
 await check('real receipt is required; success with missing id rejected',async()=>{
  assert.equal((await new Controller({send:async()=>({accepted:true})}).submitHugRequest(request)).communication,C.SEND_FAILED);
 });
 await check('transport rejection cannot return success',async()=>{
  assert.equal((await new Controller({send:async()=>{throw new Error('offline');}}).submitHugRequest(request)).communication,C.SEND_FAILED);
 });
 await check('concurrent submission blocked while waiting for receipt',async()=>{
  let resolve;const c=new Controller({send:()=>new Promise(r=>resolve=r)});const first=c.submitHugRequest(request);
  await assert.rejects(c.submitHugRequest(request),/DUPLICATE/);resolve({accepted:true,requestId:'ok-1'});await first;
 });
 await check('active request needs explicit close before new submission',async()=>{
  const c=new Controller({send:async()=>({accepted:true,requestId:'ok-2'})});await c.submitHugRequest(request);
  await assert.rejects(c.submitHugRequest(request),/ACTIVE_REQUEST/);c.closeActiveRequest();
  assert.equal((await c.submitHugRequest(request)).communication,C.SENT);
 });
 await check('network loss preserves historical server receipt',()=>{
  const s={...base,communication:C.SENT};assert.deepEqual(new Controller().handleNetworkLossDuringHug(s),s);
 });
 await check('reconnect without transport cannot enable retry',()=>{
  assert.equal(new Controller().handleReconnect({...base,communication:C.SEND_FAILED}).canRetry,false);
 });
 const store=new Map();
 globalThis.sessionStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 await check('restoration rejects malformed state',()=>{
  store.set('active_open_hug_state','{"communication":"SENT","evil":true}');assert.equal(Controller.restoreActiveState(),null);
 });
 await check('restore never imports claimed physical arrival',()=>{
  Controller.serializeActiveState({...base,communication:C.SENT,coPresence:P.ARRIVED_CONFIRMED,targetCaregiverName:'妈妈'});
  const v=Controller.restoreActiveState();assert.equal(v.coPresence,P.UNCONFIRMED);assert.equal(v.targetCaregiverName,undefined);
 });
 const clean=privacy.emptyLocalState();
 await check('allowlisted state round-trips',()=>assert.deepEqual(privacy.parseLocalState(JSON.stringify(clean)),clean));
 await check('raw child quote rejected from persistent schema',()=>assert.equal(privacy.parseLocalState(JSON.stringify({...clean,childQuotes:{a:'x'}})),null));
 await check('malformed JSON, oversized input and prototype payload rejected',()=>{
  assert.equal(privacy.parseLocalState('{'),null);assert.equal(privacy.parseLocalState('x'.repeat(200001)),null);
  assert.equal(privacy.parseLocalState('{"__proto__":{},"version":2}'),null);
 });
 await check('bad caregiver name rejected',()=>assert.equal(privacy.parseLocalState(JSON.stringify({...clean,careWeek:['personal-name',null,null,null,null,null,null]})),null));
 await check('wrong version rejected',()=>assert.equal(privacy.parseLocalState(JSON.stringify({...clean,version:1})),null));
 await check('cleanup owns old raw-artifact keys but not unrelated storage',()=>{
  assert(privacy.isOwnedStorageKey('sunny_island_child_private_artifacts_v1'));assert(privacy.isOwnedStorageKey('sunny_rain_island_v1_state'));assert(!privacy.isOwnedStorageKey('other_app'));
 });
 await check('PIN format checks length and repeated digits',()=>{
  assert(!pin.pinFormatValid('15'));assert(!pin.pinFormatValid('111111'));assert(pin.pinFormatValid('826491'));
 });
 await check('real PBKDF2 verifies correct PIN and rejects wrong PIN',async()=>{
  const rec=await pin.makePinRecord('826491');assert(await pin.checkPin('826491',rec));assert(!await pin.checkPin('826492',rec));
 });
 await check('PIN salts are random and no plain PIN stored',async()=>{
  const a=await pin.makePinRecord('826491'),b=await pin.makePinRecord('826491');
  assert.notEqual(a.salt,b.salt);assert.notEqual(a.hash,b.hash);assert(!JSON.stringify(a).includes('826491'));
 });
 await check('PIN corrupt iteration bounds rejected',async()=>{
  assert(!await pin.checkPin('826491',{salt:'0'.repeat(32),hash:'0'.repeat(64),iterations:1}));
 });
 await check('parent access starts locked and locks again',()=>{
  pin.lockParentAccess();assert(!pin.hasParentAccess());pin.grantParentAccess();assert(pin.hasParentAccess());pin.lockParentAccess();assert(!pin.hasParentAccess());
 });
 await check('family leaves hidden by default including misfiled rules leaf',()=>{
  const list=access.visibleLeaves(leaves,false);assert(list.length>0);
  assert(!list.some(l=>l.id==='not-my-fault'||l.id==='two-homes-rules'));
 });
 await check('every boundary-tagged leaf bypasses tradeoff',()=>{
  for(const leaf of leaves)if(leaf.boundary&&leaf.boundary!=='NONE')assert(!access.canUseTradeoff(leaf));
 });
 const obs={task:'TB-01',failure:'F2',support:'P2',promptDescription:'呈现角色思想泡泡',promptCount:1,outcome:'支持下完成'};
 await check('observation type and support remain separate',()=>assert(research.validObservation(obs)));
 await check('prompt count cannot contradict no-prompt category',()=>{
  assert(!research.validObservation({...obs,support:'P0',promptCount:1}));
  assert(!research.validObservation({...obs,promptCount:0}));
 });
 await check('prompt without specification rejected',()=>assert(!research.validObservation({...obs,promptDescription:''})));
 await check('child exit is a distinct outcome, not ability failure',()=>assert(research.validObservation({...obs,outcome:'孩子退出'})));
 await check('automatic reliability threshold disabled by default',()=>{
  const r=caregiver.evaluateReliabilityReview(Array.from({length:8},(_,i)=>({id:String(i),hugRequestId:'x',timestamp:new Date().toISOString(),outcome:'I_COULD_NOT_GO'})));
  assert.equal(r.shouldRecommendReview,false);
 });
 await check('legacy cloud guard fails closed',()=>assert.throws(()=>load('providers/cloudGuard.js').requireImplementedCloudAdapter(),/NOT_IMPLEMENTED/));
 const report={compiler:ts.version,kind:'strict pure-domain compilation + real Node assertions',
  compiledProjectFiles:program.getSourceFiles().filter(f=>f.fileName.startsWith(path.join(root,'src'))).length,
  combinations:combos,passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,
  crypto:'Node WebCrypto PBKDF2 SHA-256, real implementation',
  content:{sourceLeaves:leaves.length,defaultVisible:access.visibleLeaves(leaves,false).length,
    adultCoPlay:leaves.filter(access.requiresAdultCoPlay).map(x=>x.id)},
  results,limits:['No React component runtime','No Vite build','No Firebase Emulator','No push delivery or cross-device validation']};
 fs.mkdirSync(path.join(root,'audit'),{recursive:true});fs.writeFileSync(path.join(root,'audit/domain-checks.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 fs.rmSync(out,{recursive:true,force:true});
 if(report.failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
