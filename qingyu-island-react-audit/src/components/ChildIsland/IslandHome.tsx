import React from 'react';
import {Wind} from 'lucide-react';
import {useApp} from '../../context/AppContext';
import {CompanionBanner} from './CompanionBanner';
import {AlwaysReachableCalmCard} from './AlwaysReachableCalmCard';
import {HugSupportEntry} from './HugSupportEntry';
import {LocationCard} from './LocationCard';
import {WeatherStationModal} from './WeatherStationModal';
import {CalmCornerModal} from './CalmCornerModal';
import {StoryGroveModal} from './StoryGrove/StoryGroveModal';
import {ThoughtDetectiveLabModal} from './ThoughtDetectiveLab/ThoughtDetectiveLabModal';
import {CourageHouseModal} from './CourageHouse/CourageHouseModal';
import {TwoHomesBridgeModal} from './TwoHomesBridge/TwoHomesBridgeModal';
import {StarlightCabinModal} from './StarlightCabin/StarlightCabinModal';
import type {IslandPlace} from '../../context/AppContext';

const PLACES:{id:IslandPlace;title:string;copy:string;bg:string;color:string;border:string}[]=[
 {id:'weather',title:'情绪天气站',copy:'看看心里的天气',bg:'bg-sky-100',color:'text-sky-800',border:'border-sky-200'},
 {id:'story',title:'故事林',copy:'听一个小故事',bg:'bg-emerald-100',color:'text-emerald-800',border:'border-emerald-200'},
 {id:'detective',title:'想法侦探社',copy:'找找别的可能',bg:'bg-amber-100',color:'text-amber-900',border:'border-amber-200'},
 {id:'courage',title:'勇气说话屋',copy:'说出我的需要',bg:'bg-rose-100',color:'text-rose-800',border:'border-rose-200'},
 {id:'bridge',title:'照顾小桥',copy:'看看生活的安排',bg:'bg-teal-100',color:'text-teal-800',border:'border-teal-200'},
 {id:'starlight',title:'星光小屋',copy:'拼出我的很多面',bg:'bg-indigo-100',color:'text-indigo-800',border:'border-indigo-200'},
];
export const IslandHome:React.FC=()=>{
 const{childPlace,setChildPlace,selectedLeafId}=useApp();
 const close=()=>setChildPlace('island');
 return <div className="qy-island">
  <div className="qy-island-inner">
   <CompanionBanner/>
   <AlwaysReachableCalmCard onOpenCalm={()=>setChildPlace('calm')}/>
   <section aria-labelledby="island-places-title">
    <div className="qy-section-heading"><h2 id="island-places-title">想先去哪里？</h2><p>不着急，随时都能停下来。</p></div>
    <div className="qy-place-grid">{PLACES.map(p=><LocationCard key={p.id} id={p.id} title={p.title}
      shortCopy={p.copy} accentBg={p.bg} accentColor={p.color} borderColor={p.border}
      hoverBorderColor="" onOpen={()=>setChildPlace(p.id)}/>)}</div>
   </section>
  </div>
  <div className="qy-support-dock" aria-label="随时可用的支持">
    <div className="qy-support-dock-inner">
      <button className="qy-dock-calm" onClick={()=>setChildPlace('calm')} aria-label="去平静角"><Wind aria-hidden="true"/><span>歇一会儿</span></button>
      <HugSupportEntry onOpenCalmCorner={()=>setChildPlace('calm')}/>
    </div>
  </div>
  {childPlace==='weather'&&<WeatherStationModal isOpen onClose={close} onGoToCalm={()=>setChildPlace('calm')}/>}
  {childPlace==='calm'&&<CalmCornerModal isOpen onClose={close}/>}
  {childPlace==='story'&&<StoryGroveModal isOpen onClose={close} initialLeafId={selectedLeafId}/>}
  {childPlace==='detective'&&<ThoughtDetectiveLabModal isOpen onClose={close}/>}
  {childPlace==='courage'&&<CourageHouseModal isOpen onClose={close}/>}
  {childPlace==='bridge'&&<TwoHomesBridgeModal isOpen onClose={close}/>}
  {childPlace==='starlight'&&<StarlightCabinModal isOpen onClose={close}/>}
 </div>;
};
