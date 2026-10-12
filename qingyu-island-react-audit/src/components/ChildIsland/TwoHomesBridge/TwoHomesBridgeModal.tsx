import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { DialogFrame } from '../../shared/DialogFrame';
import { useApp } from '../../../context/AppContext';
import { speechNarrator } from '../../../utils/speech';

interface Props { isOpen: boolean; onClose: () => void; }
const DAYS=['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];
const ITEMS=['喜欢的玩偶','一本绘本','画画本','自己的水杯','小毯子'];

export const TwoHomesBridgeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { careWeek, packedItems, togglePackedItem, missNotes } = useApp();
  const [tab,setTab]=useState<'calendar'|'bag'|'notes'>('calendar');
  const today=(new Date().getDay()+6)%7;
  return <DialogFrame open={isOpen} onClose={onClose} title="照顾小桥">
    <div className="qy-tabs">
      {([['calendar','生活安排'],['bag','我的安心物'],['notes','想念小盒子']] as const).map(([id,label]) =>
        <button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}
    </div>
    {tab==='calendar' && <>
      <p className="qy-child-copy">这是大人填写的平常一周安排。有变化时，再问问大人。</p>
      {careWeek.every(x=>x===null) ? <div className="qy-empty">还没有填写安排。请大人到工作台设置。</div> :
        <div className="qy-care-week">{DAYS.map((day,i)=><div key={day} className="qy-care-day" data-today={i===today}>
          <strong>{day}{i===today?' · 今天是这一天':''}</strong><span>{careWeek[i]||'待大人填写'}</span>
          <button className="qy-icon-button" aria-label={`听一听${day}的安排`} onClick={()=>speechNarrator.speak(`${day}。${careWeek[i]?`平常由${careWeek[i]}照顾。`:'还没有填写。'}安排不代表大人此刻就在这里。`)}><Volume2 aria-hidden="true"/></button>
        </div>)}</div>}
      <p className="qy-inline-note">日历不是实时位置，也不会给任何人发通知。</p>
    </>}
    {tab==='bag' && <>
      <p className="qy-child-copy">想带哪件安心物？可以选，也可以不带。</p>
      <div className="qy-word-cards">{ITEMS.map(item=><button key={item} aria-pressed={packedItems.includes(item)}
        onClick={()=>togglePackedItem(item)}>{item}{packedItems.includes(item)?' · 已选':''}</button>)}</div>
    </>}
    {tab==='notes' && <>
      <p className="qy-child-copy">这些想念只留在这次打开的小岛里，没有发给别人。</p>
      {missNotes.length ? missNotes.map(note=><div className="qy-section-card" key={note.id}>{note.text}</div>)
        : <div className="qy-empty">现在盒子里是空的。没有要说的话，也可以。</div>}
      <button className="qy-button qy-button-soft" onClick={()=>window.dispatchEvent(new Event('qingyu:local-help'))}>我想留一句想念</button>
    </>}
  </DialogFrame>;
};
