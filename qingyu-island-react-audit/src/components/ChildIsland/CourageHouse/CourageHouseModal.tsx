import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { DialogFrame } from '../../shared/DialogFrame';
import { speechNarrator } from '../../../utils/speech';
interface Props{isOpen:boolean;onClose:()=>void;}
const SCENES=[
 {title:'说出我的需要',story:'小熊想请身边的大人陪一会儿。',phrases:['我想请你坐在我旁边。','我想要抱抱。','我先不想被抱，可以陪我说话吗？']},
 {title:'我不想传话',story:'一位大人请小熊给另一位大人传一件让他为难的话。',phrases:['这件事请你自己说，好吗？','我不想帮忙传话。','我想找另一位大人帮我。']},
 {title:'别人问我的家',story:'同学问了一个关于小熊家的问题。',phrases:['这件事我现在不想说。','我想只说一点点。','我们先聊别的吧。','我想找老师。']},
 {title:'我需要帮忙',story:'小熊不喜欢别人给他起的外号，已经说过不喜欢。',phrases:['我不喜欢这个称呼，请停下来。','我先离开这里。','老师，我需要你帮忙。']}
];
export const CourageHouseModal:React.FC<Props>=({isOpen,onClose})=>{
 const[index,setIndex]=useState(0),[selected,setSelected]=useState<string|null>(null);
 const scene=SCENES[index];
 return <DialogFrame open={isOpen} onClose={onClose} title="勇气说话屋">
  <p className="qy-child-copy">先替小熊试着说一句。不想说也可以。</p>
  <div className="qy-tabs">{SCENES.map((s,i)=><button key={s.title} aria-pressed={index===i}
   onClick={()=>{setIndex(i);setSelected(null);speechNarrator.stop();}}>{s.title}</button>)}</div>
  <section className="qy-section-card"><h3>{scene.title}</h3><p>{scene.story}</p>
   <button className="qy-button qy-button-soft" onClick={()=>speechNarrator.speak(scene.story)}><Volume2 aria-hidden="true"/>听一听</button>
  </section>
  <div className="qy-choice-grid">{scene.phrases.map(phrase=><button key={phrase} className="qy-choice" aria-pressed={selected===phrase}
   onClick={()=>{setSelected(phrase);speechNarrator.speak(phrase);}}>{phrase}</button>)}</div>
  {selected&&<div className="qy-feedback" role="status"><p>你给小熊选了：“{selected}”</p>
   <p>现实里，对方可能有不同的回应。不好开口、说了也没被听见时，都可以找可信的大人帮忙。</p></div>}
  <p className="qy-inline-note">这里是故事练习，不会发送消息，也不记录声音。</p>
 </DialogFrame>;
};
