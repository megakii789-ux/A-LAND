import React, { useEffect, useState } from 'react';
import { DialogFrame } from '../shared/DialogFrame';
import { speechNarrator } from '../../utils/speech';
interface Props { isOpen: boolean; onClose: () => void; onRequestHug?: () => void; }
export const CalmCornerModal: React.FC<Props> = ({ isOpen, onClose, onRequestHug }) => {
  const [tab, setTab] = useState<'breathe'|'colors'|'quiet'>('quiet');
  const [running, setRunning] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  useEffect(() => {
    const stop = () => { if (document.hidden) setRunning(false); };
    document.addEventListener('visibilitychange', stop);
    return () => { document.removeEventListener('visibilitychange', stop); speechNarrator.stop(); };
  }, []);
  return <DialogFrame open={isOpen} onClose={onClose} title="绿草平静角" help={false}>
    <p className="qy-child-copy">不用完成什么。现在就可以停下来。</p>
    <div className="qy-tabs" aria-label="平静角里的活动">
      {([['quiet','安静待一会儿'],['breathe','看看呼吸'],['colors','找三种颜色']] as const).map(([id,label]) =>
        <button key={id} aria-pressed={tab===id} onClick={() => { setTab(id); setRunning(false); speechNarrator.stop(); }}>{label}</button>)}
    </div>
    {tab==='quiet' && <div className="qy-quiet-space">
      <p>可以坐一会儿，也可以放下屏幕。</p><p>不想说话也没关系。</p>
    </div>}
    {tab==='breathe' && <>
      <p className="qy-child-copy">照着舒服的节奏呼吸，不用憋气。不舒服就停下来。</p>
      <div className="qy-breath-space"><div className="qy-breath-orb" data-running={running} aria-hidden="true">慢慢来</div></div>
      <button className="qy-button" aria-pressed={running} onClick={() => setRunning(!running)}>{running?'停止动画':'看看缓慢的起伏'}</button>
      <p className="qy-inline-note">动画只是可选的提示，不用跟上，也没有完成次数。</p>
    </>}
    {tab==='colors' && <>
      <p className="qy-child-copy">看看身边，找找这些颜色。找到一个就点一下。</p>
      <div className="qy-word-cards">{['红色','黄色','绿色'].map(c => <button key={c} aria-pressed={found.includes(c)}
        onClick={() => setFound(prev => prev.includes(c)?prev.filter(x=>x!==c):[...prev,c])}>{c}{found.includes(c)?' · 找到了':''}</button>)}</div>
      <p className="qy-inline-note">没找到也可以，不需要找齐。</p>
    </>}
    <div className="qy-flow-actions">
      <button className="qy-button qy-button-soft" onClick={() => {
        setRunning(false); (onRequestHug || (()=>window.dispatchEvent(new Event('qingyu:local-help'))))();
      }}>我想找身边的大人</button>
      <button className="qy-button qy-button-quiet" onClick={onClose}>现在就离开</button>
    </div>
  </DialogFrame>;
};
