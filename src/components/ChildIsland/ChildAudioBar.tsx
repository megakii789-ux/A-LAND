import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, Pause, Play, Square, AlertCircle, Sparkles } from 'lucide-react';
import { speechNarrator, KaraokeSyncState } from '../../utils/speech';
import { sounds } from '../../utils/sound';

export interface ChildAudioBarProps {
  className?: string;
}

/**
 * 晴雨小岛 · 声文并茂儿童语音伴读与音效控制条 (Child Synchronized Karaoke Audio & Narrative Control Bar)
 * 严格遵循 AG-04A 声音与动效标准：
 * 1. 真实神经音源 + 毫秒级逐词/逐分句实时高亮伴读（Karaoke Sync）；
 * 2. 所有语音可重听、暂停或终止 (replay, pause/resume, stop)；
 * 3. 切换场景立即停止旧语音；
 * 4. 没有中文语音资源时明确提示，绝不静默假装朗读成功；
 * 5. 环境声音默认可关闭，绝不自动播放持续背景音；
 * 6. 触控目标不小于 56x56px，可见焦点环与完整无障碍支持。
 */
export const ChildAudioBar: React.FC<ChildAudioBarProps> = ({ className = '' }) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(speechNarrator.getSpeaking());
  const [isPaused, setIsPaused] = useState<boolean>(speechNarrator.getIsPaused());
  const [voiceWarning, setVoiceWarning] = useState<string | null>(speechNarrator.getVoiceWarning());
  const [isAmbientMuted, setIsAmbientMuted] = useState<boolean>(sounds.getMuted());
  const [lastText, setLastText] = useState<string>(speechNarrator.getLastText());
  const [karaoke, setKaraoke] = useState<KaraokeSyncState>(speechNarrator.getKaraokeState());

  useEffect(() => {
    const unsubscribe = speechNarrator.subscribe(() => {
      setIsSpeaking(speechNarrator.getSpeaking());
      setIsPaused(speechNarrator.getIsPaused());
      setVoiceWarning(speechNarrator.getVoiceWarning());
      setLastText(speechNarrator.getLastText());
      setKaraoke(speechNarrator.getKaraokeState());
    });
    return unsubscribe;
  }, []);

  const handleReplay = () => {
    speechNarrator.replay();
  };

  const handleTogglePause = () => {
    sounds.playTap();
    if (isPaused) {
      speechNarrator.resume();
    } else {
      speechNarrator.pause();
    }
  };

  const handleStop = () => {
    sounds.playTap();
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
                所有内容均配有清晰大字与声文伴读，你也可以随时点击卡片听提示音
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => speechNarrator.dismissVoiceWarning()}
            className="px-3.5 py-2 text-xs font-black bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl transition-colors shrink-0 min-h-[56px] min-w-[56px] cursor-pointer"
            aria-label="关闭语音提示"
          >
            知道了
          </button>
        </div>
      )}

      {/* 2. 声文并茂语音播报主控面板 (带实时逐词高亮、重听、暂停、停止、环境声切换) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-stone-200 shadow-xs relative overflow-hidden">
        {/* 实时伴读进度细条 */}
        {isSpeaking && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-amber-400 transition-all duration-100 pointer-events-none"
            style={{ width: `${Math.max(6, Math.round(karaoke.progressRatio * 100))}%` }}
            aria-hidden="true"
          />
        )}

        {/* 状态与声文同步实时高亮字幕预览 */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg transition-colors ${
              isSpeaking
                ? 'bg-amber-400 text-stone-950 animate-pulse motion-reduce:animate-none shadow-xs'
                : 'bg-stone-100 text-stone-600'
            }`}
            aria-hidden="true"
          >
            <Volume2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-stone-800 whitespace-nowrap">
                {isSpeaking
                  ? isPaused
                    ? '语音已暂停'
                    : '伴伴正在轻声朗读'
                  : '伴伴声文伴读'}
              </span>
              {karaoke.isPrebakedNeural && lastText && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  <span>{karaoke.voiceSourceLabel}</span>
                </span>
              )}
            </div>

            {/* 声文同步逐词高亮字幕区 */}
            {karaoke.tokens.length > 0 ? (
              <p
                data-testid="karaoke-caption-line"
                className="text-xs sm:text-sm leading-relaxed mt-0.5 line-clamp-2"
              >
                {karaoke.tokens.map((tok, idx) => (
                  <span
                    key={`${idx}-${tok.offsetMs}`}
                    data-active={isSpeaking && tok.isActive ? 'true' : 'false'}
                    className={`transition-colors duration-100 rounded-md ${
                      isSpeaking && tok.isActive
                        ? 'bg-amber-300 text-stone-950 font-black px-1 py-0.5 shadow-2xs'
                        : isSpeaking && tok.isPast
                        ? 'text-amber-900 font-bold'
                        : 'text-stone-600 font-medium'
                    }`}
                  >
                    {tok.text}
                  </span>
                ))}
              </p>
            ) : (
              <p className="text-xs text-stone-500 font-medium truncate max-w-[200px] sm:max-w-[380px]">
                {lastText || '点击任意地点或听问候按钮，体验声文同步伴读'}
              </p>
            )}
          </div>
        </div>

        {/* 核心操作控制组 (每个触控区域 >= 56x56px) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 重听按钮 */}
          <button
            type="button"
            onClick={handleReplay}
            disabled={!lastText}
            className="min-h-[56px] min-w-[56px] px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
            aria-label="重新朗读上一段话"
            title="重新朗读"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">重听</span>
          </button>

          {/* 暂停 / 继续按钮 */}
          {isSpeaking && (
            <button
              type="button"
              onClick={handleTogglePause}
              className="min-h-[56px] min-w-[56px] px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none"
              aria-label={isPaused ? '继续朗读' : '暂停朗读'}
              title={isPaused ? '继续朗读' : '暂停朗读'}
            >
              {isPaused ? <Play className="w-4 h-4 shrink-0" /> : <Pause className="w-4 h-4 shrink-0" />}
              <span className="hidden sm:inline">{isPaused ? '继续' : '暂停'}</span>
            </button>
          )}

          {/* 停止朗读按钮 */}
          {isSpeaking && (
            <button
              type="button"
              onClick={handleStop}
              className="min-h-[56px] min-w-[56px] px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-4 focus-visible:ring-rose-500 focus-visible:outline-none"
              aria-label="停止当前语音朗读"
              title="停止朗读"
            >
              <Square className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">停止</span>
            </button>
          )}

          {/* 环境声效开关 (默认关闭，不自动播放背景音) */}
          <button
            type="button"
            onClick={handleToggleAmbient}
            className={`min-h-[56px] min-w-[56px] px-3 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border focus-visible:ring-4 focus-visible:ring-teal-500 focus-visible:outline-none ${
              !isAmbientMuted
                ? 'bg-teal-100 text-teal-900 border-teal-300'
                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
            }`}
            aria-label={!isAmbientMuted ? '环境音效已开启，点击静音' : '环境音效已静音，点击开启'}
            title="环境音效开关"
          >
            {!isAmbientMuted ? <Volume2 className="w-4 h-4 text-teal-700 shrink-0" /> : <VolumeX className="w-4 h-4 shrink-0" />}
            <span className="hidden sm:inline">{!isAmbientMuted ? '音效开' : '静音'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
