import React from 'react';
import { Star, Volume2 } from 'lucide-react';
import { DialogFrame } from '../../shared/DialogFrame';
import { useApp } from '../../../context/AppContext';
import { speechNarrator } from '../../../utils/speech';
interface Props { isOpen:boolean; onClose:()=>void; }
const GROUPS=[
 {title:'我喜欢',values:['画画','搭积木','唱歌','看绘本','观察小动物']},
 {title:'我正在学',values:['系鞋带','说出需要','骑小车','整理自己的东西']},
 {title:'我关心',values:['家里的大人','朋友','小动物','自己']},
];
export const StarlightCabinModal:React.FC<Props>=({isOpen,onClose})=>{
 const{starlightTraits,addStarlightTrait,removeStarlightTrait}=useApp();
 const toggle=(value:string)=>starlightTraits.includes(value)?removeStarlightTrait(value):addStarlightTrait(value);
 return <DialogFrame open={isOpen} onClose={onClose} title="星光小屋">
  <p className="qy-child-copy">我有很多面。喜欢的可以留下，点一下也能拿走。</p>
  <button className="qy-button qy-button-soft" onClick={()=>speechNarrator.speak('我有很多面。喜欢的可以留下，点一下也能拿走。')}>
   <Volume2 aria-hidden="true"/>听一听
  </button>
  <div className="qy-section-card" style={{marginTop:24}}>
   <h3><Star aria-hidden="true" style={{display:'inline',verticalAlign:'middle'}}/> 这次我选了</h3>
   {starlightTraits.length?<div className="qy-word-cards">{starlightTraits.map(value=><button key={value}
    aria-label={`拿走${value}这张卡片`} onClick={()=>removeStarlightTrait(value)}>{value} · 拿走</button>)}</div>
    :<p>现在还没有卡片。不选也可以。</p>}
  </div>
  {GROUPS.map(group=><section className="qy-section-card" key={group.title}>
   <h3>{group.title}</h3><div className="qy-word-cards">{group.values.map(value=><button key={value}
    aria-pressed={starlightTraits.includes(value)} onClick={()=>toggle(value)}>{value}</button>)}</div>
  </section>)}
  <p className="qy-inline-note">卡片不会给你打分，也不是你的全部。刷新页面后，这次的选择会清除。</p>
 </DialogFrame>;
};
