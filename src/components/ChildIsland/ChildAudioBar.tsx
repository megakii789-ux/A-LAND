import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, Pause, Play, Square, AlertCircle, Sparkles } from 'lucide-react';
import { speechNarrator } from '../../utils/speech';
import { sounds } from '../../utils/sound';

export interface ChildAudioBarProps {
  className?: string;
}

/**
 * 晴雨小岛 · 儿童语音控制与伴读条 (Child Audio & Narrative Control Bar)
 * 严格遵循 AG-04A 声音与动效标准：
 * 1. 所有语音可重听、暂停或终止 (replay, pause/resume, stop)；
 * 2. 切换场景立即停止旧语音；
 * 3. 没有中文语音资源时明确提示，绝不静默假装朗读成功；
 * 4. 环境声音默认可关闭，绝不自动播放持续背景音；
 * 5. 动画服务于因果反馈，不制造注意力竞争；
 * 6. 触控目标不小于 48-56px，可见焦点环与完整无障碍支持。
 */
export const ChildAudioBar: React.FC<ChildAudioBarProps> = ({ className = '' }) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(speechNarrator.getSpeaking());
  const [isPaused, setIsPaused] = useState<boolean>(speechNarrator.getIsPaused());
  const [voiceWarning, setVoiceWarning] = useState<string | null>(speechNarrator.getVoiceWarning());
  const [isAmbientMuted, setIsAmbientMuted] = useState<boolean>(sounds.getMuted());
  const [lastText, setLastText] = useState<string>(speechNarrator.getLastText());

  useEffect(() => {
    const unsubscribe = speechNarrator.subscribe(() => {
      setIsSpeaking(speechNarrator.getSpeaking());
      setIsPaused(speechNarrator.getIsPaused());
      setVoiceWarning(speechNarrator.getVoiceWarning());
      setLastText(speechNarrator.getLastText());
    });
    return unsubscribe;
  }, []);

  const handleReplay = () => {
    sounds.playClick();
    speechNarrator.replay();
  };

  const handleTogglePause = () => {
    sounds.playClick();
    if (isPaused) {
      speechNarrator.resume();
    } else {
      speechNarrator.pause();
    }
  };

  const handleStop = () => {
    sounds.playClick();
    speechNarrator.stop();
  };

  const handleToggleAmbient = () => {
    const nextMuted = !isAmbientMuted;
    sounds.setMuted(nextMuted);
    setIsAmbientMuted(nextMuted);
    if (!nextMuted) {
      sounds.playNatureChime();
    }
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {/* 1. 缺少中文语音资源时的明确提示栏 (绝不静默假装成功) */}
      {voiceWarning && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center justify-between gap-2.5 p-3 sm:p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs text-amber-950 animate-in fade-in"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-amber-900 leading-snug">
                {voiceWarning}
              </p>
              <p className="text-xs text-amber-800 font-medium">
                所有内容均配有清晰大字，你也可以随时点击卡片听提示音
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => speechNarrator.dismissVoiceWarning()}
            className="px-3 py-1.5 text-xs font-black bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl transition-colors shrink-0 min-h-[44px] cursor-pointer"
            aria-label="关闭语音提示"
          >
            知道了
          </button>
        </div>
      )}

      {/* 2. 语音播报主控面板 (带重听、暂停、停止、环境声切换) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-stone-200 shadow-xs">
        {/* 状态与正在播报的文字预览 */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg transition-colors ${
              isSpeaking
                ? 'bg-amber-400 text-stone-900 animate-pulse motion-reduce:animate-none'
                : 'bg-stone-100 text-stone-600'
            }`}
            aria-hidden="true"
          >
            {isSpeaking ? (isPaused ? '⏸️' : '🔊') : '🌱'}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black text-stone-800 block">
              {isSpeaking
                ? isPaused
                  ? '语音已暂停'
                  : '伴伴正在轻声朗读'
                : '伴伴听你说'}
            </span>
            <p className="text-xs text-stone-500 font-medium truncate max-w-[200px] sm:max-w-[340px]">
              {lastText || '点击任意地点卡片，听伴伴为你朗读'}
            </p>
          </div>
        </div>

        {/* 核心操作控制组 (每个触控区域 >= 48-56px) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 重听按钮 */}
          <button
            type="button"
            onClick={handleReplay}
            disabled={!lastText}
            className="min-h-[48px] px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
            aria-label="重新朗读上一段话"
            title="重新朗读"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">重听</span>
          </button>

          {/* 暂停 / 继续按钮 */}
          {isSpeaking && (
            <button
              type="button"
              onClick={handleTogglePause}
              className="min-h-[48px] px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none"
              aria-label={isPaused ? '继续朗读' : '暂停朗读'}
              title={isPaused ? '继续朗读' : '暂停朗读'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPaused ? '继续' : '暂停'}</span>
            </button>
          )}

          {/* 停止朗读按钮 */}
          {isSpeaking && (
            <button
              type="button"
              onClick={handleStop}
              className="min-h-[48px] px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-4 focus-visible:ring-rose-500 focus-visible:outline-none"
              aria-label="停止当前语音朗读"
              title="停止朗读"
            >
              <Square className="w-4 h-4" />
              <span className="hidden sm:inline">停止</span>
            </button>
          )}

          {/* 环境声效开关 (默认关闭，不自动播放背景音) */}
          <button
            type="button"
            onClick={handleToggleAmbient}
            className={`min-h-[48px] px-3 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border focus-visible:ring-4 focus-visible:ring-teal-500 focus-visible:outline-none ${
              !isAmbientMuted
                ? 'bg-teal-100 text-teal-900 border-teal-300'
                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
            }`}
            aria-label={!isAmbientMuted ? '环境音效已开启，点击静音' : '环境音效已静音，点击开启'}
            title="环境音效开关"
          >
            {!isAmbientMuted ? <Volume2 className="w-4 h-4 text-teal-700" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{!isAmbientMuted ? '音效开' : '静音'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
