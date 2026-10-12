import React, { useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, HandHeart } from 'lucide-react';
import { SpeechStatus } from './SpeechStatus';
import { speechNarrator } from '../../utils/speech';

let openCount=0;
let previousOverflow='';
interface Props {
  open:boolean; onClose:()=>void; title:string; children:React.ReactNode;
  mode?:'child'|'adult'; help?:boolean; className?:string;
}
/** Native modal + explicit keyboard loop + return focus. No nested clickable card. */
export function DialogFrame({open,onClose,title,children,mode='child',help=true,className=''}:Props){
  const dialog=useRef<HTMLDialogElement>(null);
  const heading=useRef<HTMLHeadingElement>(null);
  const titleId=useId();
  const closeRef=useRef(onClose);closeRef.current=onClose;
  useLayoutEffect(()=>{
    if(!open||!dialog.current)return;
    const element=dialog.current;
    const before=document.activeElement instanceof HTMLElement?document.activeElement:null;
    if(openCount++===0){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
    element.showModal();
    heading.current?.focus({preventScroll:true});
    return ()=>{
      speechNarrator.stop();
      if(element.open)element.close();
      if(--openCount===0)document.body.style.overflow=previousOverflow;
      if(before?.isConnected)before.focus({preventScroll:true});
    };
  },[open]);
  if(!open || typeof document==='undefined')return null;
  return createPortal(
    <dialog ref={dialog} aria-labelledby={titleId} aria-modal="true" data-mode={mode}
      className={`qy-dialog ${className}`} onCancel={e=>{e.preventDefault();closeRef.current();}}
      onKeyDown={e=>{
        if(e.key!=='Tab')return;
        const controls=Array.from(dialog.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]'
        )||[]).filter(x=>x.getClientRects().length>0);
        if(!controls.length){e.preventDefault();heading.current?.focus();return;}
        const first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey&&(document.activeElement===first||document.activeElement===heading.current)){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }}>
      <div className="qy-dialog-layout">
        <header className="qy-dialog-header">
          <h2 ref={heading} tabIndex={-1} id={titleId}>{title}</h2>
          <button type="button" className="qy-icon-button" onClick={onClose} aria-label={`关闭${title}`}><X aria-hidden="true"/></button>
        </header>
        <div className="qy-dialog-body"><SpeechStatus inline />{children}</div>
        {mode==='child'&&help&&<footer className="qy-dialog-footer">
          <button type="button" className="qy-button qy-button-soft" onClick={()=>window.dispatchEvent(new Event('qingyu:local-help'))}>
            <HandHeart aria-hidden="true"/>找身边的大人
          </button>
          <button type="button" className="qy-button qy-button-quiet" onClick={onClose}>今天先到这里</button>
        </footer>}
      </div>
    </dialog>,document.body);
}
