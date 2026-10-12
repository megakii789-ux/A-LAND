import React, { useState } from 'react';
import { Volume2, Flag, Eye, Coins, Scale, ShieldCheck } from 'lucide-react';
import { DialogFrame } from '../../shared/DialogFrame';
import { speechNarrator } from '../../../utils/speech';
interface Props { isOpen:boolean; onClose:()=>void; }
const TOOLS=[
 {id:'flag',label:'小旗子',Icon:Flag},{id:'lenses',label:'三个镜头',Icon:Eye},
 {id:'coin',label:'双面币',Icon:Coins},{id:'scale',label:'小天平',Icon:Scale},
 {id:'boxes',label:'三个小盒子',Icon:Eye},{id:'safety',label:'先保护自己',Icon:ShieldCheck}
] as const;
const CARDS=[
 {text:'米豆没有回答招呼。',box:'看到的',explain:'这是故事里发生的事。为什么没回答，还不知道。'},
 {text:'我心里有点难过。',box:'心里的',explain:'这是心里的感受。感受可以说出来。'},
 {text:'米豆一定不喜欢我了。',box:'猜的',explain:'这是一个猜测。我们还不知道米豆为什么没有回答。'}
];
const VIEWS=[
 {title:'我的镜头',text:'我挥了手，没有听见米豆回答。'},
 {title:'他的镜头',text:'故事画面里，米豆低头看着地上的贝壳。'},
 {title:'远一点的镜头',text:'两个人隔着一条小路。这里不知道米豆有没有听见。'}
];
export const ThoughtDetectiveLabModal:React.FC<Props>=({isOpen,onClose})=>{
 const [tool,setTool]=useState<(typeof TOOLS)[number]['id']>('flag');
 const [flag,setFlag]=useState(true),[lens,setLens]=useState(0),[coin,setCoin]=useState(false);
 const [choice,setChoice]=useState<string|null>(null),[card,setCard]=useState(0),[feedback,setFeedback]=useState('');
 const switchTool=(id:typeof tool)=>{setTool(id);setFeedback('');speechNarrator.stop();};
 const speak=(text:string)=>speechNarrator.speak(text);
 return <DialogFrame open={isOpen} onClose={onClose} title="想法侦探社">
  <div className="qy-tabs" aria-label="选择想玩的工具">{TOOLS.map(t=><button key={t.id} aria-pressed={tool===t.id} onClick={()=>switchTool(t.id)}>{t.label}</button>)}</div>
  {tool==='flag'&&<>
   <p className="qy-child-copy">小兔刚才推了朋友一下。小兔还会画画，也正在学习说出生气。</p>
   <div className="qy-section-card"><h3>{flag?'“小兔就是坏孩子”':'小兔有很多面'}</h3>
    <p>{flag?'这面旗子把小兔全部说完了吗？':'推人不可以。但一次行为，不是一个人的全部。'}</p>
    <button className="qy-button" onClick={()=>setFlag(!flag)}>{flag?'拿下这面旗子看看':'再看看那面旗子'}</button>
   </div>
   <button className="qy-button qy-button-soft" onClick={()=>speak('推人不可以。但一次行为，不是一个人的全部。')}><Volume2 aria-hidden="true"/>听一听</button>
  </>}
  {tool==='lenses'&&<>
   <p className="qy-child-copy">我和米豆在小路上。换个位置，看见了什么？</p>
   <div className="qy-choice-grid">{VIEWS.map((v,i)=><button key={v.title} className="qy-choice" aria-pressed={lens===i}
     onClick={()=>{setLens(i);speak(v.text);}}>{v.title}</button>)}</div>
   <p className="qy-feedback" role="status">{VIEWS[lens].text}</p>
   <p className="qy-child-copy">镜头能看见动作，不能读出别人的心。</p>
  </>}
  {tool==='coin'&&<>
   <p className="qy-child-copy">下雨了。有人想野餐，有人刚种了种子。</p>
   <div className="qy-section-card"><h3>{coin?'看看种种子的人':'看看想野餐的人'}</h3>
    <p>{coin?'种子得到雨水，他很高兴。':'野餐要改期了，她有点失望。'}</p>
    <button className="qy-button" onClick={()=>{setCoin(!coin);speak(!coin?'种子得到雨水，他很高兴。':'野餐要改期了，她有点失望。');}}>翻过来看看</button>
   </div><p>两种感受可以同时有。这里不讨论伤害别人可不可以。</p>
  </>}
  {tool==='scale'&&<>
   <p className="qy-child-copy">只有一只小船，两个人都想玩。可以试哪个安全的办法？</p>
   <div className="qy-choice-grid">
    <button className="qy-choice" aria-pressed={choice==='turn'} onClick={()=>setChoice('turn')}>商量轮流玩</button>
    <button className="qy-choice" aria-pressed={choice==='together'} onClick={()=>setChoice('together')}>一个当船长，一个当岸上的接应人</button>
   </div>
   {choice&&<p className="qy-feedback" role="status">{choice==='turn'?'两个人都有机会，不过要等一会儿。等不下去了，可以请大人帮忙。':'可以一起玩，不过需要商量各自怎么做。不喜欢这个办法时可以再换。'}</p>}
   <p className="qy-inline-note">选择可以调整，不需要自己扛下所有后果。</p>
  </>}
  {tool==='boxes'&&<>
   <p className="qy-child-copy">读读这张故事卡，放在哪个盒子？</p>
   <div className="qy-section-card"><p>{CARDS[card].text}</p>
    <button className="qy-button qy-button-soft" onClick={()=>speak(CARDS[card].text)}><Volume2 aria-hidden="true"/>听这张卡</button>
   </div>
   <div className="qy-tabs">{['看到的','心里的','猜的'].map(box=><button key={box} onClick={()=>setFeedback(
      box===CARDS[card].box?CARDS[card].explain:`再看看：${CARDS[card].explain}`)}>{box}</button>)}</div>
   {feedback&&<p className="qy-feedback" role="status">{feedback}</p>}
   <button className="qy-button" onClick={()=>{setCard((card+1)%CARDS.length);setFeedback('');}}>换一张故事卡</button>
  </>}
  {tool==='safety'&&<>
   <h3>有人正在弄疼我</h3><p className="qy-child-copy">先保护身体，能离开时就离开，找可信的大人帮忙。不需要先猜他为什么这样。</p>
   <p className="qy-child-copy">没有及时说出“不”，也不是你的错。一个大人没有帮忙，还可以告诉另一位可信的大人。</p>
   <button className="qy-button" onClick={()=>window.dispatchEvent(new Event('qingyu:local-help'))}>我想找大人</button>
  </>}
 </DialogFrame>;
};
