import React, { useState } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, Volume2 } from 'lucide-react';
import { DialogFrame } from '../shared/DialogFrame';
import { useApp } from '../../context/AppContext';
import { speechNarrator } from '../../utils/speech';
import type { WeatherType } from '../../types';

interface Props { isOpen: boolean; onClose: () => void; onGoToCalm: () => void; }
const WEATHER = [
  { value: 'sunny', label: '晴', hint: '暖暖的', Icon: Sun },
  { value: 'cloudy', label: '云', hint: '有些说不清', Icon: Cloud },
  { value: 'rainy', label: '雨', hint: '有点想哭', Icon: CloudRain },
  { value: 'stormy', label: '雷', hint: '轰隆隆的', Icon: CloudLightning },
  { value: 'foggy', label: '雾', hint: '有点迷糊', Icon: CloudFog },
] as const;
const BODY = ['肚子紧紧的', '心跳有点快', '手心暖暖的', '身体松松的'];
const intensityOptions = [{ value: 1, label: '一点点' }, { value: 3, label: '一些' }, { value: 5, label: '很多' }];

export const WeatherStationModal: React.FC<Props> = ({ isOpen, onClose, onGoToCalm }) => {
  const { saveTodayWeather, setChildPlace } = useApp();
  // No default "sunny": every choice is the child's, not seeded data.
  const [primary, setPrimary] = useState<WeatherType | null>(null);
  const [secondary, setSecondary] = useState<WeatherType | null>(null);
  const [intensity, setIntensity] = useState(1);
  const [body, setBody] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [dual, setDual] = useState(false);
  const reply = primary === 'rainy' ? '今天像一场雨。可以难过。'
    : primary === 'stormy' ? '今天像打雷。可以生气，也可以请大人陪一会儿。'
    : '谢谢你告诉我。各种天气都可以。';
  const finish = () => {
    if (!primary) return;
    saveTodayWeather({ primary, secondary: dual ? secondary : null, intensity, bodySensations: body });
    setFinished(true);
    speechNarrator.speak(reply);
  };
  return <DialogFrame open={isOpen} onClose={onClose} title="情绪天气站">
    {!finished ? <>
      <div className="qy-flow-actions" style={{ marginTop: 0, marginBottom: 20 }}>
        <p className="qy-child-copy">你现在的心里，像什么天气？</p>
        <button className="qy-icon-button" aria-label="听一听天气站的问题"
          onClick={() => speechNarrator.speak('你现在的心里，像什么天气？也可以不选。')}>
          <Volume2 aria-hidden="true" />
        </button>
      </div>
      <div className="qy-choice-grid" aria-label="选择天气">
        {WEATHER.map(({ value, label, hint, Icon }) => <button className="qy-choice" key={value}
          aria-pressed={primary === value} onClick={() => { setPrimary(value); if (secondary === value) setSecondary(null); }}>
          <Icon aria-hidden="true" /><strong>{label}</strong><div>{hint}</div>
        </button>)}
        <button className="qy-choice" onClick={onClose}>我不想选，也可以回去玩</button>
      </div>
      {primary && <>
        <section className="qy-section-card" style={{ marginTop: 24 }}>
          <h3>这种感觉有多少？</h3>
          <div className="qy-tabs">{intensityOptions.map(o => <button key={o.value}
            aria-pressed={intensity === o.value} onClick={() => setIntensity(o.value)}>{o.label}</button>)}</div>
          <button className="qy-button qy-button-soft" aria-pressed={dual} onClick={() => setDual(!dual)}>还有另一种天气</button>
          {dual && <div className="qy-tabs" style={{ marginTop: 16 }}>{WEATHER.filter(w => w.value !== primary).map(w =>
            <button key={w.value} aria-pressed={secondary === w.value} onClick={() => setSecondary(secondary === w.value ? null : w.value)}>{w.label}</button>)}</div>}
        </section>
        <section className="qy-section-card"><h3>身体有什么感觉？</h3><p>可以选，也可以跳过。</p>
          <div className="qy-tabs">{BODY.map(label => <button key={label} aria-pressed={body.includes(label)}
            onClick={() => setBody(prev => prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label])}>{label}</button>)}</div>
        </section>
        <button className="qy-button" onClick={finish}>选好了</button>
      </>}
    </> : <>
      <p className="qy-child-copy" role="status">{reply}</p>
      <p className="qy-child-copy">接下来想做什么？不用先变开心。</p>
      <div className="qy-choice-grid">
        <button className="qy-choice" onClick={onGoToCalm}>去平静角歇一会儿</button>
        <button className="qy-choice" onClick={() => window.dispatchEvent(new Event('qingyu:local-help'))}>找身边的大人</button>
        <button className="qy-choice" onClick={() => setChildPlace('story')}>听一个小故事</button>
        <button className="qy-choice" onClick={onClose}>回小岛自己选</button>
      </div>
    </>}
  </DialogFrame>;
};
