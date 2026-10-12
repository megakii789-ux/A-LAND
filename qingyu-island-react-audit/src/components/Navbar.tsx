import React, { useState } from 'react';
import { CloudSun, Volume2, VolumeX, Users, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ParentGateModal } from './ParentGateModal';
import { RELEASE } from '../config/release';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, isMuted, toggleMute, setChildPlace } = useApp();
  const [gate, setGate] = useState(false);
  return <>
    <header className="qy-navbar">
      <div className="qy-navbar-inner">
        <button type="button" className="qy-brand" onClick={() => {
          setCurrentView('child'); setChildPlace('island');
        }} aria-label="回到晴雨小岛首页">
          <span className="qy-brand-mark"><CloudSun aria-hidden="true" /></span>
          <strong>晴雨小岛</strong>
        </button>
        <div className="qy-navbar-actions">
          <button type="button" className="qy-icon-button" onClick={toggleMute}
            aria-label={isMuted ? '打开声音' : '关闭声音'} aria-pressed={!isMuted}>
            {isMuted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          </button>
          <button type="button" className="qy-button qy-button-soft"
            onClick={() => currentView === 'parent' ? setCurrentView('child') : setGate(true)}
            aria-label={currentView === 'parent' ? '返回小岛并锁定大人工作台' : '进入大人工作台'}>
            {currentView === 'parent' ? <ArrowLeft aria-hidden="true" /> : <Users aria-hidden="true" />}
            <span>{currentView === 'parent' ? '回小岛' : '给大人'}</span>
          </button>
        </div>
      </div>
      {currentView === 'parent' && <p className="qy-mode-note">
        本机审阅版 {RELEASE.version} · 不发送远程消息
      </p>}
    </header>
    <ParentGateModal isOpen={gate} onClose={() => setGate(false)}
      onSuccess={() => { setGate(false); setCurrentView('parent'); }} />
  </>;
};
