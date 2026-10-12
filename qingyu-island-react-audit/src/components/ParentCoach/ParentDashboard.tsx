import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RELEASE } from '../../config/release';
import { CARE_LABELS, parseLocalState } from '../../domain/privacy/localState';
import { REVIEW_SCRIPTS } from '../../data/reviewScripts';
import { mapHugStateToChildPresentation } from '../../domain/hug/hugStateMapper';
import { CommunicationStatus as C, CareResponsibility as R, CoPresenceStatus as P,
  HugRequestType as T, HugDomainState } from '../../domain/hug/types';
import { FAILURE_CODES, SUPPORT_CODES, OUTCOMES, validObservation,
  LocalObservation } from '../../domain/research/observationProtocol';

const DAYS=['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];
const TABS=[['overview','使用边界'],['care','生活安排'],['scripts','对话脚本'],
 ['records','使用记录'],['simulation','状态演练'],['observe','观察卡'],['privacy','本机数据']] as const;
const STATES:{
 title:string; state:HugDomainState
}[]=[
 {title:'服务接收，是否看见未知',state:{requestType:T.INSTANT_HELP,communication:C.SENT,care:R.UNASSIGNED,coPresence:P.UNCONFIRMED}},
 {title:'设备收到，不等于本人看到',state:{requestType:T.INSTANT_HELP,communication:C.ACKNOWLEDGED,care:R.UNASSIGNED,coPresence:P.UNCONFIRMED,acknowledgementEvidence:'DEVICE_RECEIVED'}},
 {title:'成人明确确认看到',state:{requestType:T.INSTANT_HELP,communication:C.ACKNOWLEDGED,care:R.UNASSIGNED,coPresence:P.UNCONFIRMED,acknowledgementEvidence:'HUMAN_OPENED'}},
 {title:'本人答应，会合未知',state:{requestType:T.INSTANT_HELP,communication:C.ACKNOWLEDGED,care:R.ASSIGNED_SELF,coPresence:P.UNCONFIRMED,careEvidence:'SELF_ACCEPTED'}},
 {title:'请求转交，尚无接受确认',state:{requestType:T.INSTANT_HELP,communication:C.SENT,care:R.ASSIGNED_OTHER,coPresence:P.UNCONFIRMED,careEvidence:'REQUESTED_OTHER'}},
 {title:'接应人明确接受，会合未知',state:{requestType:T.INSTANT_HELP,communication:C.SENT,care:R.ASSIGNED_OTHER,coPresence:P.UNCONFIRMED,careEvidence:'OTHER_ACCEPTED'}},
 {title:'成人自报来到身边',state:{requestType:T.INSTANT_HELP,communication:C.SENT,care:R.ASSIGNED_SELF,coPresence:P.ARRIVED_CONFIRMED,meetingEvidence:'ADULT_SELF_REPORT'}},
 {title:'只在本机选择结束请求',state:{requestType:T.INSTANT_HELP,communication:C.SENT,care:R.ASSIGNED_SELF,coPresence:P.ARRIVED_CONFIRMED,meetingEvidence:'LOCAL_CLOSE'}},
 {title:'发送结果失败或未确认',state:{requestType:T.INSTANT_HELP,communication:C.SEND_FAILED,care:R.UNASSIGNED,coPresence:P.UNCONFIRMED}}
];
const NEW_OBSERVATION:LocalObservation={task:'',failure:'NONE',support:'P0',promptDescription:'',promptCount:0,outcome:'未知'};
export const ParentDashboard:React.FC=()=>{
 const {careWeek,setCareDay,familyContent,setFamilyContent,weatherHistory,completedLeaves,
   saveLocal,setSaveLocal,clearDeviceData,storageError}=useApp();
 const [tab,setTab]=useState<(typeof TABS)[number][0]>('overview');
 const [simulation,setSimulation]=useState(0);
 const [reflection,setReflection]=useState<'unknown'|'kept'|'missed'>('unknown');
 const [manualPause,setManualPause]=useState(false);
 const [exportConsent,setExportConsent]=useState(false);
 const [clearConfirm,setClearConfirm]=useState(false);
 const [status,setStatus]=useState('');
 const [observation,setObservation]=useState<LocalObservation>({...NEW_OBSERVATION});
 const [records,setRecords]=useState<LocalObservation[]>([]);
 const fileInput=useRef<HTMLInputElement>(null);
 const cue=mapHugStateToChildPresentation(STATES[simulation].state);
 const backup=()=> {
   if(!exportConsent)return;
   const json=JSON.stringify({version:2,completedLeaves,careWeek,familyContent},null,2);
   const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
   const a=document.createElement('a');a.href=url;a.download='qingyu-review-settings.json';a.click();
   setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('已请求下载设置文件；请在浏览器下载列表确认。');
 };
 const readBackup=async(file:File|undefined)=>{
   if(!file)return;
   if(file.size>200000){setStatus('文件过大，未导入。');return;}
   try {
    const parsed=parseLocalState(await file.text());
    if(!parsed){setStatus('文件未通过版本或字段校验，未导入。');return;}
    // Import only care settings; do not grant storage consent from a file.
    parsed.careWeek.forEach((name,day)=>setCareDay(day,name));
    setFamilyContent(parsed.familyContent);
    setStatus('已导入生活安排和家庭内容开关；不恢复浏览记录，不改变保存许可或 PIN。');
   }catch{setStatus('读取失败，未导入。');}
   finally{if(fileInput.current)fileInput.current.value='';}
 };
 return <section className="qy-adult" aria-labelledby="adult-title">
  <h1 id="adult-title">给大人的工作台</h1>
  <p>帮助现实里的陪伴，不评判孩子，也不比较照顾者。</p>
  <nav className="qy-tabs" aria-label="工作台栏目">{TABS.map(([id,label])=><button key={id}
   aria-pressed={tab===id} onClick={()=>{setTab(id);setStatus('');setClearConfirm(false);}}>{label}</button>)}</nav>
  {tab==='overview'&&<>
   <div className="qy-warning">版本 {RELEASE.version} · 本机审阅版。远程消息、云账户、云备份与自动心理周报未启用。</div>
   <section className="qy-section-card"><h3>今天只做一件小事</h3>
    <p>和孩子商量一段能兑现的陪伴时间，放下手机，由孩子选择怎么玩。</p>
    <p>做不到时由真人解释并修复，不让 App 替你许诺。孩子不需要靠使用次数或“正确表达”换取陪伴。</p>
   </section>
   <section className="qy-section-card"><h3>这版能做什么</h3>
    <p>故事练习、天气表达、平静角、固定句式、本地求助卡与成人审阅。没有实时监护或危机识别。</p>
    <p>真实儿童使用前，仍需成人审阅内容并陪同；本版工程检查不等于疗效验证或专业安全认证。</p>
   </section>
  </>}
  {tab==='care'&&<>
   <section className="qy-section-card"><h3>平常一周的照顾安排</h3>
    <p>只选择称呼，不填姓名或住址。这个日历不是定位，也不是即时请求的接收人名单。</p>
    <div className="qy-form-grid">{DAYS.map((day,i)=><label className="qy-field" key={day}>{day}
      <select value={careWeek[i]||''} onChange={e=>setCareDay(i,e.target.value||null)}><option value="">尚未填写</option>
       {CARE_LABELS.map(label=><option key={label} value={label}>{label}</option>)}</select>
    </label>)}</div>
   </section>
   <section className="qy-section-card"><h3>家庭变化场景</h3>
    <label className="qy-check"><input type="checkbox" checked={familyContent} onChange={e=>setFamilyContent(e.target.checked)}/>
     <span>我已准备先审阅，并在每次阅读家庭变化故事时陪伴孩子。</span></label>
    <p>默认关闭。不默认孩子有两个家，不要求孩子接受或解释成人的决定。</p>
   </section>
  </>}
  {tab==='scripts'&&REVIEW_SCRIPTS.map(script=><section className="qy-section-card" key={script.id}>
   <h3>{script.title}</h3>{script.say.map(sentence=><p key={sentence}>“{sentence}”</p>)}<p className="qy-inline-note">{script.action}</p>
  </section>)}
  {tab==='records'&&<section className="qy-section-card">
   <h3>只记录做过的事</h3><p>这次页面内选择了 {weatherHistory.length} 次天气；当前记录了 {completedLeaves.length} 个已看故事。</p>
   <p>这些不是情绪稳定性、思考能力或迁移能力的分数。不会根据天气、点击或次数生成诊断和心理周报。</p>
   <p>天气只在当前页面内存中，刷新后清除。故事浏览标记是否保留，取决于“本机数据”的明确选择。</p>
  </section>}
  {tab==='simulation'&&<>
   <div className="qy-warning">模拟演练：没有向孩子或其他设备发送消息。这里的反馈来自下面的人为选择。</div>
   <label className="qy-field">选择演练情境<select value={simulation} onChange={e=>setSimulation(Number(e.target.value))}>
    {STATES.map((item,i)=><option value={i} key={item.title}>{item.title}</option>)}</select></label>
   <section className="qy-section-card"><h3>示意文案</h3><p>{cue.displayText}</p><p>{cue.spokenText}</p>
    <p className="qy-inline-note">系统不知道的事实保持未知。结束屏幕流程不代表已验证陪伴质量。</p></section>
   <section className="qy-section-card"><h3>事后由成人自省</h3>
    <p>今天有一个答应孩子的安排，实际怎么样？这是自报，不是系统判定，也不发给另一位照顾者。</p>
    <div className="qy-tabs">{([['unknown','不确定 / 不记录'],['kept','我做到了'],['missed','我没能做到']] as const).map(([v,label])=>
     <button key={v} aria-pressed={reflection===v} onClick={()=>setReflection(v)}>{label}</button>)}</div>
    {reflection==='missed'&&<p className="qy-feedback">由真人说：“我刚才答应了，后来没能做到。让你等了，对不起。不是因为你不重要。”然后商量一个实际能做到的安排。</p>}
    <label className="qy-check"><input type="checkbox" checked={manualPause} onChange={e=>setManualPause(e.target.checked)}/>
     <span>这类即时请求会增加等待或压力，先暂停并复盘。</span></label>
    <p>{manualPause?'已记录本次复盘选择。':'没有设定自动失约次数阈值。'}本版远程功能一直关闭；本地“找身边大人”入口不受影响。</p>
   </section>
  </>}
  {tab==='observe'&&<>
   <div className="qy-warning">人工研究记录，不是孩子测验。不填孩子的原话、姓名、学校或家庭细节。离开工作台后本页记录清除。</div>
   <form className="qy-section-card" onSubmit={e=>{
     e.preventDefault();if(!validObservation(observation)){setStatus('请检查任务、提示次数和提示描述是否一致。');return;}
     setRecords(old=>[observation,...old].slice(0,100));setObservation({...NEW_OBSERVATION});setStatus('记录留在本页内存中，没有上传。');
   }}>
    <label className="qy-field">任务编号<input required maxLength={80} value={observation.task} placeholder="例如 TB-01，不填个人资料"
     onChange={e=>setObservation({...observation,task:e.target.value})}/></label>
    <div className="qy-form-grid">
     <label className="qy-field">观察到的卡点<select value={observation.failure} onChange={e=>setObservation({...observation,failure:e.target.value as LocalObservation['failure']})}>
      <option value="NONE">没有观察到特定卡点</option>{Object.entries(FAILURE_CODES).map(([id,label])=><option key={id} value={id}>{id} · {label}</option>)}</select></label>
     <label className="qy-field">本任务的提示类别<select value={observation.support} onChange={e=>setObservation({...observation,support:e.target.value as LocalObservation['support']})}>
      {Object.entries(SUPPORT_CODES).map(([id,label])=><option key={id} value={id}>{id} · {label}</option>)}</select></label>
     <label className="qy-field">额外提示次数<input type="number" min={0} max={20} value={observation.promptCount}
      onChange={e=>setObservation({...observation,promptCount:Number(e.target.value)})}/></label>
     <label className="qy-field">任务结果<select value={observation.outcome} onChange={e=>setObservation({...observation,outcome:e.target.value as LocalObservation['outcome']})}>
      {OUTCOMES.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
    </div>
    <label className="qy-field">实际给出的提示，不填孩子回答<textarea maxLength={200} value={observation.promptDescription}
     onChange={e=>setObservation({...observation,promptDescription:e.target.value})}/></label>
    <button className="qy-button" type="submit">留在本页观察记录中</button>
   </form>
   <p>本页有 {records.length} 条观察。提示类别跨任务不可当作统一分数，退出与能力未呈现必须分开。</p>
   {records.slice(0,6).map((rec,i)=><div className="qy-section-card" key={i}>{rec.task} · {rec.failure} · {rec.support} · {rec.promptCount} 次 · {rec.outcome}</div>)}
  </>}
  {tab==='privacy'&&<>
   <section className="qy-section-card"><h3>由大人决定是否保留</h3>
    <p>默认只在内存中体验。开启后，仅保留故事浏览编号、固定称呼的一周安排、家庭内容开关。</p>
    <p>本机存档是未加密的 localStorage。它不防护设备持有人；不要在共用设备上保存。天气、想念、拼图与观察记录不会随此设置落盘。</p>
    <label className="qy-check"><input type="checkbox" checked={saveLocal} onChange={e=>setSaveLocal(e.target.checked)}/>
      <span>我理解这些限制，同意保存上述少量本机设置。</span></label>
    {storageError&&<p className="qy-error" role="alert">{storageError}</p>}
   </section>
   <section className="qy-section-card"><h3>设置文件，不是云同步</h3>
    <label className="qy-check"><input type="checkbox" checked={exportConsent} onChange={e=>setExportConsent(e.target.checked)}/>
      <span>我知道下载的是未加密文件，会包含固定称呼的照顾安排；由我保管或删除。</span></label>
    <button className="qy-button" disabled={!exportConsent} onClick={backup}>下载本机设置</button>
    <label className="qy-field" style={{marginTop:20}}>导入设置（只恢复安排与内容开关）
      <input ref={fileInput} type="file" accept=".json,application/json" onChange={e=>void readBackup(e.target.files?.[0])}/></label>
   </section>
   <section className="qy-section-card"><h3>清除这台设备的小岛数据</h3>
    <p>清除本版与已识别旧版的本机存档、PIN 哈希和当前内存记录。已下载的文件、云端已有副本不在此操作范围。</p>
    {!clearConfirm?<button className="qy-button qy-button-danger" onClick={()=>setClearConfirm(true)}>准备清除</button>:<>
      <p className="qy-error">无法撤销。确实要清除并返回小岛吗？</p>
      <div className="qy-flow-actions"><button className="qy-button qy-button-soft" onClick={()=>setClearConfirm(false)}>取消</button>
       <button className="qy-button qy-button-danger" onClick={()=>{if(!clearDeviceData())setStatus('没有全部清除，请检查浏览器站点数据。');}}>确认清除并返回</button></div>
    </>}
   </section>
  </>}
  {status&&<p className="qy-feedback" role="status">{status}</p>}
 </section>;
};
