import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { WeatherRecord, ParentObservation, AdultPresenceTier, HugEvent, MedalRecord } from '../types';
import { INITIAL_PARENT_OBSERVATIONS } from '../data/mockData';
import { sounds } from '../utils/sound';
import { speechNarrator } from '../utils/speech';
import { hasParentAccess, lockParentAccess } from '../domain/privacy/parentAccess';
import { LOCAL_STATE_KEY, CONSENT_KEY, parseLocalState, isOwnedStorageKey, CARE_LABELS } from '../domain/privacy/localState';

export type IslandPlace = 'island'|'weather'|'story'|'detective'|'courage'|'bridge'|'starlight'|'calm'|'medals';
interface AppContextType {
  currentView:'child'|'parent'; setCurrentView:(v:'child'|'parent')=>void;
  childPlace:IslandPlace; setChildPlace:(v:IslandPlace)=>void;
  selectedLeafId:string|null; setSelectedLeafId:(v:string|null)=>void;
  medals:MedalRecord[]; unlockMedal:(id:string)=>void;
  recentUnlockedMedal:MedalRecord|null; dismissUnlockedMedal:()=>void;
  todayWeather:WeatherRecord|null; weatherHistory:WeatherRecord[];
  saveTodayWeather:(w:Omit<WeatherRecord,'id'|'timestamp'>)=>void;
  hugEvents:HugEvent[]; activeHugNotice:boolean;
  requestHug:(to?:'爸爸'|'妈妈'|'当前照顾者')=>void; acknowledgeHug:()=>void;
  isMuted:boolean; toggleMute:()=>void;
  presenceTier:AdultPresenceTier; setPresenceTier:(v:AdultPresenceTier)=>void;
  parentObservations:ParentObservation[]; incrementSelfInitiated:(id:string)=>void;
  completedLeaves:string[]; markLeafComplete:(id:string,quote?:string)=>void; childQuotes:Record<string,string>;
  packedItems:string[]; togglePackedItem:(s:string)=>void;
  missNotes:Array<{id:string;text:string;date:string}>; addMissNote:(s:string)=>void;
  starlightTraits:string[]; addStarlightTrait:(s:string)=>void; removeStarlightTrait:(s:string)=>void;
  familyContent:boolean; setFamilyContent:(v:boolean)=>void;
  careWeek:(string|null)[]; setCareDay:(day:number,label:string|null)=>void;
  saveLocal:boolean; setSaveLocal:(v:boolean)=>void; clearDeviceData:()=>boolean;
  storageError:string|null;
}
const Context=createContext<AppContextType|null>(null);
const observations=()=>INITIAL_PARENT_OBSERVATIONS.map(o=>({...o,selfInitiatedCount:0,lastObservedDate:''}));
export const AppProvider:React.FC<{children:React.ReactNode}>=({children})=>{
  const [currentView,setView]=useState<'child'|'parent'>('child');
  const [childPlace,setChildPlace]=useState<IslandPlace>('island');
  const [selectedLeafId,setSelectedLeafId]=useState<string|null>(null);
  const [isMuted,setMuted]=useState(false);
  const [todayWeather,setWeather]=useState<WeatherRecord|null>(null);
  const [weatherHistory,setHistory]=useState<WeatherRecord[]>([]);
  const [presenceTier,setPresenceTier]=useState<AdultPresenceTier>('A');
  const [parentObservations,setObservations]=useState(observations);
  const [completedLeaves,setCompleted]=useState<string[]>([]);
  const [packedItems,setPacked]=useState<string[]>([]);
  const [missNotes,setMissNotes]=useState<Array<{id:string;text:string;date:string}>>([]);
  const [starlightTraits,setTraits]=useState<string[]>([]);
  const [familyContent,setFamilyContent]=useState(false);
  const [careWeek,setCareWeek]=useState<(string|null)[]>(Array(7).fill(null));
  const [saveLocal,setSaveFlag]=useState(false);
  const [storageError,setStorageError]=useState<string|null>(null);
  const [hydrated,setHydrated]=useState(false);
  const revision=useRef(0);

  useEffect(()=>{
    try {
      if(localStorage.getItem(CONSENT_KEY)==='yes') {
        const raw=localStorage.getItem(LOCAL_STATE_KEY);
        const parsed=raw?parseLocalState(raw):null;
        if(parsed){
          setCompleted(parsed.completedLeaves); setCareWeek(parsed.careWeek);
          setFamilyContent(parsed.familyContent); setSaveFlag(true);
        } else if(raw) setStorageError('旧存档未通过校验，没有载入。请在隐私页清除后重新设置。');
      }
    } catch { setStorageError('浏览器不允许本机保存；本次只在页面内存中使用。'); }
    setHydrated(true);
    return ()=>{speechNarrator.stop();lockParentAccess();};
  },[]);
  useEffect(()=>{
    if(!hydrated || !saveLocal)return;
    try {
      localStorage.setItem(CONSENT_KEY,'yes');
      localStorage.setItem(LOCAL_STATE_KEY,JSON.stringify({
        version:2,completedLeaves,careWeek,familyContent
      }));
      setStorageError(null);
    } catch {setStorageError('保存没有完成。请勿把当前内容当成已经备份。');}
  },[hydrated,saveLocal,completedLeaves,careWeek,familyContent]);
  useEffect(()=>{
    if(currentView!=='parent')return;
    let timer:ReturnType<typeof setTimeout>;
    const lock=()=>{lockParentAccess();setView('child');};
    const reset=()=>{clearTimeout(timer);timer=setTimeout(lock,5*60_000);};
    const visibility=()=>{if(document.hidden)lock();};
    reset();
    window.addEventListener('pointerdown',reset);window.addEventListener('keydown',reset);
    document.addEventListener('visibilitychange',visibility);
    return ()=>{clearTimeout(timer);window.removeEventListener('pointerdown',reset);
      window.removeEventListener('keydown',reset);document.removeEventListener('visibilitychange',visibility);};
  },[currentView]);
  const setCurrentView=(view:'child'|'parent')=>{
    if(view==='parent'&&!hasParentAccess())return;
    speechNarrator.stop();
    if(view==='child')lockParentAccess();
    setView(view);
  };
  const setSaveLocal=(enabled:boolean)=>{
    if(!hasParentAccess())return;
    if(!enabled){
      try {localStorage.removeItem(CONSENT_KEY);localStorage.removeItem(LOCAL_STATE_KEY);}
      catch {setStorageError('未能移除本机存档，请使用浏览器的站点数据设置核查。');return;}
    }
    setSaveFlag(enabled);
  };
  const clearDeviceData=()=>{
    if(!hasParentAccess())return false;
    try{
      for(const store of [localStorage,sessionStorage]){
        const keys=Array.from({length:store.length},(_,i)=>store.key(i)).filter((k):k is string=>!!k);
        keys.filter(isOwnedStorageKey).forEach(k=>store.removeItem(k));
      }
      revision.current++;
      setSaveFlag(false);setCompleted([]);setCareWeek(Array(7).fill(null));setFamilyContent(false);
      setWeather(null);setHistory([]);setPacked([]);setMissNotes([]);setTraits([]);
      setObservations(observations());setPresenceTier('A');setSelectedLeafId(null);setChildPlace('island');
      setStorageError(null);lockParentAccess();setView('child');
      return true;
    }catch{setStorageError('清除没有全部完成，请核查浏览器的站点数据设置。');return false;}
  };
  const toggleMute=()=>{const next=!isMuted;setMuted(next);sounds.setMuted(next);speechNarrator.setMuted(next);};
  const saveTodayWeather=(w:Omit<WeatherRecord,'id'|'timestamp'>)=>{
    const item:WeatherRecord={...w,id:crypto.randomUUID(),timestamp:new Date().toISOString()};
    setWeather(item);setHistory(h=>[item,...h].slice(0,30));
  };
  const setCareDay=(day:number,label:string|null)=>{
    if(!hasParentAccess()||day<0||day>6||!Number.isInteger(day))return;
    if(label!==null&&!CARE_LABELS.includes(label as typeof CARE_LABELS[number]))return;
    setCareWeek(w=>w.map((v,i)=>i===day?label:v));
  };
  return <Context.Provider value={{
    currentView,setCurrentView,childPlace,setChildPlace,selectedLeafId,setSelectedLeafId,
    isMuted,toggleMute,todayWeather,weatherHistory,saveTodayWeather,presenceTier,setPresenceTier,
    parentObservations,incrementSelfInitiated:(id)=>setObservations(a=>a.map(o=>o.id===id?
      {...o,selfInitiatedCount:o.selfInitiatedCount+1,lastObservedDate:new Date().toISOString()}:o)),
    completedLeaves,markLeafComplete:(id)=>setCompleted(a=>a.includes(id)?a:[...a,id]),childQuotes:{},
    packedItems,
    togglePackedItem:(item)=>setPacked(a=>a.includes(item)?a.filter(x=>x!==item):[...a,item]),
    missNotes,addMissNote:(text)=>setMissNotes(a=>[{id:crypto.randomUUID(),text:text.slice(0,160),date:'本次打开'},...a].slice(0,20)),
    starlightTraits,addStarlightTrait:(trait)=>setTraits(a=>a.includes(trait)?a:[...a,trait].slice(0,20)),
    removeStarlightTrait:(trait)=>setTraits(a=>a.filter(x=>x!==trait)),
    medals:[],unlockMedal:()=>{},recentUnlockedMedal:null,dismissUnlockedMedal:()=>{},
    hugEvents:[],activeHugNotice:false,requestHug:()=>window.dispatchEvent(new Event('qingyu:local-help')),acknowledgeHug:()=>{},
    familyContent,setFamilyContent:(v)=>{if(hasParentAccess())setFamilyContent(v);},
    careWeek,setCareDay,saveLocal,setSaveLocal,clearDeviceData,storageError
  }}>{children}</Context.Provider>;
};
export function useApp(){const c=useContext(Context);if(!c)throw new Error('AppProvider missing');return c;}
