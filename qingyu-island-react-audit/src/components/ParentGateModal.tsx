import React,{useState,useEffect,useRef} from 'react';
import {DialogFrame} from './shared/DialogFrame';
import {readPinRecord,makePinRecord,checkPin,savePinRecord,grantParentAccess} from '../domain/privacy/parentAccess';
interface Props{isOpen:boolean;onClose:()=>void;onSuccess:()=>void;}
export const ParentGateModal:React.FC<Props>=({isOpen,onClose,onSuccess})=>{
 const submitting=useRef(false);
 const generation=useRef(0);
 const [pin,setPin]=useState(''),[repeat,setRepeat]=useState(''),[error,setError]=useState('');
 const [busy,setBusy]=useState(false),[hasPin,setHasPin]=useState(false),[attempts,setAttempts]=useState(0);
 const [blockedUntil,setBlockedUntil]=useState(0);
 useEffect(()=>{
  generation.current++;submitting.current=false;setBusy(false);
  if(isOpen){setPin('');setRepeat('');setError('');setHasPin(!!readPinRecord());}
  return()=>{generation.current++;};
 },[isOpen]);
 const cancel=()=>{generation.current++;submitting.current=false;onClose();};
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();if(submitting.current)return;
  if(Date.now()<blockedUntil){setError('尝试较多，请稍后再试。');return;}
  const ticket=generation.current;
  submitting.current=true;setBusy(true);setError('');
  try{
   const record=readPinRecord();
   if(!record){
    if(pin!==repeat)throw new Error('两次 PIN 不一致，请重新确认。');
    const nextRecord=await makePinRecord(pin);
    if(ticket!==generation.current)return;
    savePinRecord(nextRecord);
   }else{
    const valid=await checkPin(pin,record);
    if(ticket!==generation.current)return;
    if(!valid){
    const count=attempts+1;setAttempts(count);
    if(count>=5)setBlockedUntil(Date.now()+30_000);
    throw new Error('PIN 不正确，请重新输入。');
    }
   }
   if(ticket!==generation.current)return;
   grantParentAccess();setPin('');setRepeat('');onSuccess();
  }catch(e){if(ticket===generation.current)setError(e instanceof Error?e.message:'设备暂时不能完成验证，请在支持 WebCrypto 的浏览器中使用。');}
  finally{if(ticket===generation.current){submitting.current=false;setBusy(false);}}
 };
 return <DialogFrame open={isOpen} onClose={cancel} title="给大人的小门" mode="adult" help={false}>
  <p className="qy-body-copy">这是本机防误入设置，不是监护人身份验证。PIN 的盐和哈希只留在当前标签页；关闭标签页后需重新设置。</p>
  <form className="qy-form" onSubmit={submit}>
   <label htmlFor="parent-pin">{hasPin?'输入 PIN':'由大人设置 6–12 位数字 PIN'}</label>
   <input id="parent-pin" type="password" inputMode="numeric" pattern="[0-9]{6,12}" minLength={6} maxLength={12}
    autoComplete="off" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} required/>
   {!hasPin&&<><label htmlFor="parent-pin-repeat">再次输入 PIN</label>
    <input id="parent-pin-repeat" type="password" inputMode="numeric" autoComplete="off" minLength={6} maxLength={12}
      value={repeat} onChange={e=>setRepeat(e.target.value.replace(/\D/g,''))} required/></>}
   {error&&<p role="alert" className="qy-form-error">{error}</p>}
   <button className="qy-button" type="submit" disabled={busy}>{busy?'正在验证…':hasPin?'进入大人工作台':'设置并进入'}</button>
  </form>
  <p className="qy-small-copy">它不保护设备持有人或调试工具访问。请勿在共用设备上输入需要保密的内容。</p>
 </DialogFrame>;
};
