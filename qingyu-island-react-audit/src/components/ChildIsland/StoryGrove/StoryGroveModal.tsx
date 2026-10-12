import React, { useState } from 'react';
import { Volume2, ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';
import { INITIAL_LEAF_SCENARIOS } from '../../../data/mockData';
import { useApp } from '../../../context/AppContext';
import { DialogFrame } from '../../shared/DialogFrame';
import { ParentGateModal } from '../../ParentGateModal';
import { speechNarrator } from '../../../utils/speech';
import { lockParentAccess } from '../../../domain/privacy/parentAccess';
import { visibleLeaves, requiresAdultCoPlay, canUseTradeoff } from '../../../domain/safety/contentAccess';

interface Props { isOpen:boolean; onClose:()=>void; initialLeafId?:string|null; }
type Stage='catalog'|'scene'|'look'|'perspective'|'choose'|'offscreen'|'compare';
export const StoryGroveModal:React.FC<Props>=({isOpen,onClose,initialLeafId})=>{
 const{completedLeaves,markLeafComplete,familyContent}=useApp();
 const leaves=visibleLeaves(INITIAL_LEAF_SCENARIOS,familyContent);
 const [id,setId]=useState(initialLeafId||'cup-size');
 const [stage,setStage]=useState<Stage>('catalog');
 const [choice,setChoice]=useState<string|null>(null);
 const [requestedId,setRequestedId]=useState<string|null>(null);
 const [coPlayApproved,setCoPlayApproved]=useState<string|null>(null);
 const leaf=leaves.find(item=>item.id===id)||leaves[0];
 const begin=(next:string)=>{
  const item=leaves.find(l=>l.id===next); if(!item)return;
  if(requiresAdultCoPlay(item)){setRequestedId(next);return;}
  setId(next);setChoice(null);setCoPlayApproved(null);setStage('scene');
 };
 const say=(text:string)=>speechNarrator.speak(text);
 const reset=()=>{setStage('catalog');setChoice(null);setCoPlayApproved(null);speechNarrator.stop();};
 if(!leaf)return <DialogFrame open={isOpen} onClose={onClose} title="故事林"><p>还没有可以打开的故事。</p></DialogFrame>;
 const safeTradeoff=canUseTradeoff(leaf);
 const coPlayMissing=stage!=='catalog'&&requiresAdultCoPlay(leaf)&&coPlayApproved!==leaf.id;
 return <>
  <DialogFrame open={isOpen} onClose={onClose} title="故事林">
   {stage==='catalog'?<>
    <p className="qy-child-copy">选一个想听的小故事。随时都能回去。</p>
    <div className="qy-story-catalog">{leaves.map(item=><button key={item.id} onClick={()=>begin(item.id)}
      aria-label={`打开故事：${item.title}`}>
     <BookOpen aria-hidden="true"/><h3>{item.title}</h3><p>{item.summary}</p>
     {completedLeaves.includes(item.id)&&<p className="qy-inline-note">这次已经看过，可以再看。</p>}
     {requiresAdultCoPlay(item)&&<p className="qy-inline-note">和大人一起读</p>}
    </button>)}</div>
   </>:coPlayMissing?<div className="qy-section-card">
    <p>这个故事需要大人一起读。请先回到故事林。</p><button className="qy-button" onClick={reset}>回到故事林</button>
   </div>:<>
    <div className="qy-flow-actions" style={{marginTop:0,marginBottom:20}}>
     <button className="qy-button qy-button-quiet" onClick={reset}><ArrowLeft aria-hidden="true"/>选别的故事</button>
     <span className="qy-inline-note">{leaf.title}</span>
    </div>
    <div className="qy-story-stage">
    {stage==='scene'&&<>
     <p>{leaf.summary}</p><button className="qy-button qy-button-soft" onClick={()=>say(leaf.summary)}><Volume2 aria-hidden="true"/>听这个故事</button>
     {!safeTradeoff?<div className="qy-feedback">
      <ShieldCheck aria-hidden="true"/><p>先保护身体，离开伤害，找可信的大人。知道对方为什么这样，也不等于可以伤害别人。</p>
      <button className="qy-button" onClick={()=>setStage('choose')}>看看安全的办法</button>
     </div>:<div className="qy-choice-grid" style={{marginTop:24}}>
      <button className="qy-choice" onClick={()=>setStage('look')}>发生了什么？</button>
      <button className="qy-choice" onClick={()=>setStage('perspective')}>换个位置看看</button>
      <button className="qy-choice" onClick={()=>setStage('choose')}>我想先选一个办法</button>
     </div>}
    </>}
    {stage==='look'&&<>
     <section className="qy-section-card"><h3>故事里发生的事</h3><p>{leaf.walkSteps.fenContent.fact}</p></section>
     <section className="qy-section-card"><h3>心里的感受</h3><p>{leaf.walkSteps.fenContent.feeling}</p></section>
     <section className="qy-section-card"><h3>想到的一种可能</h3><p>{leaf.walkSteps.fenContent.guess}</p></section>
     <button className="qy-button qy-button-soft" onClick={()=>say(Object.values(leaf.walkSteps.fenContent).join('。'))}><Volume2 aria-hidden="true"/>听一听</button>
     <div className="qy-flow-actions"><button className="qy-button qy-button-soft" onClick={()=>setStage('perspective')}>再换个位置</button><button className="qy-button" onClick={()=>setStage('choose')}>我想选办法了</button></div>
    </>}
    {stage==='perspective'&&safeTradeoff&&<>
     <section className="qy-section-card"><h3>这一边</h3><p>{leaf.walkSteps.tongContent.sideA}</p></section>
     <section className="qy-section-card"><h3>另一边</h3><p>{leaf.walkSteps.tongContent.sideB}</p></section>
     <p>这里讲的是故事。现实里不知道别人怎么想时，可以问，也可以先不知道。</p>
     <button className="qy-button qy-button-soft" onClick={()=>say(`${leaf.walkSteps.tongContent.sideA}。${leaf.walkSteps.tongContent.sideB}`)}><Volume2 aria-hidden="true"/>听一听</button>
     <div className="qy-flow-actions"><button className="qy-button qy-button-soft" onClick={()=>setStage('look')}>再看看发生的事</button><button className="qy-button" onClick={()=>setStage('choose')}>我想选办法了</button></div>
    </>}
    {stage==='choose'&&<>
     <p>你想让主角试哪个办法？也可以先不选。</p>
     {!safeTradeoff&&<p className="qy-feedback">只看保护身体、离开或求助的办法，不给伤害行为称好处。</p>}
     <div className="qy-choice-grid">{leaf.choices.map(c=><button className="qy-choice" key={c.id}
      aria-pressed={choice===c.id} onClick={()=>{setChoice(c.id);say(`${c.label}。${c.description}`);}}>
      <strong>{c.label}</strong><p>{c.description}</p>
      {safeTradeoff&&<><p>可能有帮助：{c.benefit}</p><p>也要考虑：{c.cost}</p></>}
     </button>)}</div>
     <p className="qy-inline-note">愿意时，可以把理由说给身边的大人听。这里不录音、不保存原话。</p>
     <div className="qy-flow-actions"><button className="qy-button qy-button-quiet" onClick={reset}>今天先不选</button>
      <button className="qy-button" disabled={!choice} onClick={()=>{markLeafComplete(leaf.id);setStage('offscreen');}}>我想试这个</button></div>
    </>}
    {stage==='offscreen'&&<>
     <h3>离开屏幕，试一小步</h3><p>{leaf.offscreenTask.action}</p>
     <button className="qy-button qy-button-soft" onClick={()=>say(leaf.offscreenTask.action)}><Volume2 aria-hidden="true"/>听一听</button>
     <div className="qy-flow-actions"><button className="qy-button qy-button-soft" onClick={()=>setStage('compare')}>回头比一比</button><button className="qy-button" onClick={onClose}>放下屏幕</button></div>
    </>}
    {stage==='compare'&&<>
     <h3>想想另一个故事</h3><p>你听过《{leaf.compareWithOtherLeaf.otherLeafTitle}》吗？</p>
     <p>两件事有什么像的地方？又有什么不一样？没听过也可以跳过。</p>
     <p className="qy-inline-note">不用说工具名字，也没有要背的答案。</p>
     <button className="qy-button" onClick={onClose}>今天到这里</button>
    </>}
    </div>
   </>}
  </DialogFrame>
  <ParentGateModal isOpen={requestedId!==null} onClose={()=>setRequestedId(null)} onSuccess={()=>{
   const next=requestedId;setRequestedId(null);lockParentAccess();
   if(next){setId(next);setCoPlayApproved(next);setChoice(null);setStage('scene');}
  }}/>
 </>;
};
