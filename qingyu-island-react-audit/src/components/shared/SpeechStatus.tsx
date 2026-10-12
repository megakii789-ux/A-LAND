import React,{useEffect,useState} from 'react';
import {X} from 'lucide-react';
import type {SpeechState} from '../../utils/speech';
export function SpeechStatus({inline=false}:{inline?:boolean}){
 const [message,setMessage]=useState('');
 useEffect(()=>{
  const listener=(event:Event)=>{
   const state=(event as CustomEvent<SpeechState>).detail;
   if(!inline&&document.querySelector('dialog[open]')){setMessage('');return;}
   if(state==='unavailable')setMessage('这台设备暂时没有可用的中文声音，请大人一起读。');
   if(state==='error')setMessage('声音没有播放成功，可以请大人一起读。');
   if(state==='muted')setMessage('声音已关闭，可以在顶部打开。');
  };
  window.addEventListener('qingyu:speech',listener);
  return()=>window.removeEventListener('qingyu:speech',listener);
 },[inline]);
 return message?<div className={`qy-speech-status ${inline?'qy-speech-status-inline':'qy-speech-status-global'}`} role="status"><span>{message}</span>
   <button className="qy-icon-button" onClick={()=>setMessage('')} aria-label="关闭语音提示"><X aria-hidden="true"/></button></div>:null;
}
