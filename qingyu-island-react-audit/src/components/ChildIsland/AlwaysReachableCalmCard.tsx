import React from 'react';
import {Wind,Volume2} from 'lucide-react';
import {speechNarrator} from '../../utils/speech';
export const AlwaysReachableCalmCard:React.FC<{onOpenCalm:()=>void}>=({onOpenCalm})=>(
 <section className="qy-calm-card">
  <button type="button" onClick={onOpenCalm} className="qy-calm-main" aria-label="进入绿草平静角">
   <Wind aria-hidden="true"/><span><strong>绿草平静角</strong><span>想歇一会儿，就来这里。</span></span>
  </button>
  <button className="qy-icon-button" type="button" aria-label="听一听平静角介绍" onClick={()=>speechNarrator.speak('绿草平静角。想歇一会儿，就来这里。')}>
   <Volume2 aria-hidden="true"/>
  </button>
 </section>
);
