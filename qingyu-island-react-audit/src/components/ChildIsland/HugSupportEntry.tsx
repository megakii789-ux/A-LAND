import React,{useEffect,useState} from 'react';
import {HandHeart,Mail,Users,Check} from 'lucide-react';
import {DialogFrame} from '../shared/DialogFrame';
import {useApp} from '../../context/AppContext';
import {speechNarrator} from '../../utils/speech';
interface Props {onOpenCalmCorner?:()=>void;}
/**
 * Real LOCAL assistance, not simulated notification delivery.
 * Remote transport is not configured: no "sent", "seen", or "on the way" UI.
 */
export const HugSupportEntry:React.FC<Props>=({onOpenCalmCorner})=>{
 const [open,setOpen]=useState(false),[view,setView]=useState<'choose'|'nearby'|'note'|'saved'>('choose');
 const{addMissNote}=useApp();
 const start=()=>{setView('choose');setOpen(true);};
 useEffect(()=>{window.addEventListener('qingyu:local-help',start);return()=>window.removeEventListener('qingyu:local-help',start);},[]);
 return <>
  <button type="button" className="qy-button qy-support-button" aria-label="我想找身边的大人" onClick={start}>
   <HandHeart aria-hidden="true"/><span>我想找大人</span>
  </button>
  <DialogFrame open={open} onClose={()=>setOpen(false)} title="你现在需要什么？" help={false}>
   {view==='choose'&&<div className="qy-support-options">
    <p className="qy-child-copy">这里不会发消息。可以直接去找身边你信任的大人。</p>
    <button className="qy-support-choice" onClick={()=>{setView('nearby');speechNarrator.speak('请把这张卡片给身边你信任的大人看。我想请你陪我一会儿。');}}>
      <Users aria-hidden="true"/><strong>请身边的人陪一会儿</strong><span>把这张卡片给大人看</span>
    </button>
    <button className="qy-support-choice" onClick={()=>setView('note')}><Mail aria-hidden="true"/>
      <strong>留下一句想念</strong><span>只留在这次打开的小岛里</span></button>
   </div>}
   {view==='nearby'&&<section className="qy-local-help-card">
    <HandHeart aria-hidden="true"/><h3>我想请你陪一会儿</h3>
    <p>可以坐在旁边、说说话，也可以问问我想不想抱抱。</p>
    <p className="qy-child-copy">没有合适的大人在附近时，可以去找老师或另一位你信任的大人。不要只等屏幕。</p>
    <button className="qy-button" onClick={()=>setOpen(false)}>放下屏幕</button>
   </section>}
   {view==='note'&&<section className="qy-local-help-card">
     <Mail aria-hidden="true"/><h3>我有一点想你</h3><p>这句话不会发给对方。关闭或刷新页面后会清除。</p>
     <button className="qy-button" onClick={()=>{addMissNote('我有一点想你');setView('saved');}}>先放在小岛里</button>
   </section>}
   {view==='saved'&&<section className="qy-local-help-card">
    <Check aria-hidden="true"/><h3>放在这次的小岛里了</h3><p>没有发送给别人，也不用等回复。</p>
    <button className="qy-button" onClick={()=>setOpen(false)}>回去看看</button>
   </section>}
   {onOpenCalmCorner&&view!=='saved'&&<button className="qy-button qy-button-quiet" onClick={()=>{setOpen(false);onOpenCalmCorner();}}>我先去平静角</button>}
  </DialogFrame>
 </>;
};
