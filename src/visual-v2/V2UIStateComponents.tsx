import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  SlidersHorizontal,
  RotateCcw,
  Pause,
  Play,
  Square,
  AlertCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ANIMAL_COMPANIONS,
  INTEREST_ACTIVITIES,
  AnimalCompanionId,
} from '../domain/personalization';
import {
  speechNarrator,
  KaraokeSyncState,
  NarrationSession,
  normalizeTextForTtsKey,
  COMPANION_TO_VOICE_PROFILE,
} from '../utils/speech';
import { sounds } from '../utils/sound';
import {
  getProductExperienceMetrics,
  subscribeProductExperienceMetrics,
  CompanionSessionMemory,
} from '../domain/cognitive/productExperienceMetrics';
import {
  COMPANION_IDS,
  nativeCompanionUrl,
  effectSvgUrl,
} from './AlandVisualAssets';
import { CompanionActorV2 } from './CompanionActorV2';
import {
  V2_ASSET_FACTORY_META,
  V2_ASSET_GAP_LEDGER,
} from './manifest/v2AssetManifest';
import { ParentDashboard } from '../components/ParentCoach/ParentDashboard';

/**
 * 1. V2ArtDirectorHoldBanner — 显式美术门禁与资产溯源披露条
 */
export const V2ArtDirectorHoldBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      data-testid="v2-art-director-hold-banner"
      data-release-state={V2_ASSET_FACTORY_META.releaseState}
      role="region"
      aria-label="V2 视觉资产工厂技术审阅与美术门禁状态"
      className="rounded-2xl bg-[#123C5C] text-[#FFF7EB] px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm border border-[#72CBFF]/40"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[11px] shrink-0">
            {V2_ASSET_FACTORY_META.releaseState}
          </span>
          <span className="text-xs sm:text-sm font-extrabold truncate">
            V2 独立视觉评审壳 · 真实分层资产已接入 · 冻结业务层 0 改动
          </span>
        </div>

        <button
          type="button"
          data-testid="v2-toggle-gap-ledger-btn"
          onClick={() => setExpanded((v) => !v)}
          className="min-h-[44px] px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-black flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none"
          aria-expanded={expanded}
        >
          <span>{expanded ? '收起美术缺口台账' : '查看美术缺口 (HOLD)'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div
          data-testid="v2-asset-gap-ledger-panel"
          className="mt-2.5 pt-2.5 border-t border-white/20 text-xs space-y-2"
        >
          <p className="text-amber-200 font-bold">
            • 角色原生像素：{V2_ASSET_FACTORY_META.disclosures.nativeCharacterWidthsPx}；地标原生像素：{V2_ASSET_FACTORY_META.disclosures.nativeLandmarkWidthsPx}。
          </p>
          <p className="text-sky-100">
            • 动画机制：{V2_ASSET_FACTORY_META.disclosures.animationRigType}。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {V2_ASSET_GAP_LEDGER.map((row) => (
              <div
                key={row.moduleId}
                className="p-2 rounded-xl bg-white/10 border border-white/15 space-y-0.5"
              >
                <div className="flex items-center justify-between gap-1 font-black text-amber-300">
                  <span>{row.moduleName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 border border-amber-300/40">
                    {row.gate}
                  </span>
                </div>
                <div className="text-[11px] text-white/90">现状：{row.currentAssets}</div>
                <div className="text-[11px] text-rose-200">缺口：{row.productionGap}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 2. V2CompanionBanner — 四伙伴 V2 透明立绘与真实语音同步横幅
 * 契约：
 * - 唯一声线身份来自 `personalization.companionId`；
 * - 朗读状态与逐词字幕 100% 来自 `speechNarrator`；
 * - 支持直接点击切换四位伙伴 (`guoguo_squirrel` / `beibei_otter` / `tiantian_raccoon` / `qiqi_deer`)。
 */
export const V2CompanionBanner: React.FC<{
  onOpenSettings?: () => void;
  reducedMotion?: boolean;
}> = ({ onOpenSettings, reducedMotion = false }) => {
  const { personalization, updatePersonalization } = useApp();
  const companion =
    ANIMAL_COMPANIONS[personalization.companionId] || ANIMAL_COMPANIONS.guoguo_squirrel;
  const voiceProfile = COMPANION_TO_VOICE_PROFILE[companion.id];
  const interest =
    INTEREST_ACTIVITIES[personalization.primaryInterest] || INTEREST_ACTIVITIES.drawing;

  const [sessionMemory, setSessionMemory] = useState<CompanionSessionMemory | null>(
    () => getProductExperienceMetrics().latestCompanionMemory
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(() => speechNarrator.getSpeaking());
  const [karaoke, setKaraoke] = useState<KaraokeSyncState>(() =>
    speechNarrator.getKaraokeState()
  );

  useEffect(() => {
    setSessionMemory(getProductExperienceMetrics().latestCompanionMemory);
    return subscribeProductExperienceMetrics((m) => {
      setSessionMemory(m.latestCompanionMemory);
    });
  }, []);

  useEffect(() => {
    speechNarrator.syncWithCompanion(companion.id);
    speechNarrator.setVoiceEnabled(personalization.accessibility.voiceEnabled);
  }, [companion.id, personalization.accessibility.voiceEnabled]);

  useEffect(() => {
    return speechNarrator.subscribe(() => {
      setIsSpeaking(speechNarrator.getSpeaking());
      setKaraoke(speechNarrator.getKaraokeState());
    });
  }, []);

  const greetingText = sessionMemory
    ? `你好呀！我是${companion.name}。${sessionMemory.companionReactionText}`
    : `你好呀！我是${companion.name}。${companion.greetingText}`;

  const handleSpeak = () => {
    speechNarrator.speak(greetingText, undefined, undefined, {
      speakerId: companion.id,
      sceneId: 'island_home_companion',
    });
  };

  const handleSelectCompanion = (nextId: AnimalCompanionId) => {
    sounds.playCardSelect();
    updatePersonalization({ companionId: nextId });
    speechNarrator.syncWithCompanion(nextId);
  };

  const isSpeakingThisGreeting =
    isSpeaking &&
    karaoke.tokens.length > 0 &&
    normalizeTextForTtsKey(karaoke.fullText) === normalizeTextForTtsKey(greetingText);

  return (
    <div
      data-testid="companion-banner"
      data-companion-id={companion.id}
      data-voice-profile={voiceProfile}
      className="p-2.5 sm:p-4 rounded-3xl border-2 border-[#18B7A4]/45 shadow-md bg-gradient-to-r from-[#FFF9EC] via-white to-[#EAF9F6] flex flex-col gap-2.5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          <div
            data-testid="companion-banner-avatar-btn"
            data-companion-id={companion.id}
            onClick={handleSpeak}
          >
            <CompanionActorV2
              companionId={companion.id}
              reducedMotion={reducedMotion}
              size="md"
              onTriggerSpeak={handleSpeak}
              testId="v2-banner-companion-actor"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2
                data-testid="companion-banner-name"
                className="text-base sm:text-2xl font-black text-[#123C5C] tracking-wide whitespace-nowrap"
              >
                {companion.name}在身边
              </h2>
              <span className="text-[11px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#18B7A4]/15 text-[#123C5C] border border-[#18B7A4]/30 shrink-0">
                {companion.animal} · {interest.label}
              </span>
              {sessionMemory && (
                <span
                  data-testid="companion-session-memory"
                  data-event-stage={sessionMemory.eventStage || 'COMPLETED_OBSERVED'}
                  className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-xl border min-w-0 max-w-full break-words ${
                    sessionMemory.eventStage === 'ARRANGED_OR_STARTED'
                      ? 'bg-amber-100 text-amber-950 border-amber-300'
                      : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  }`}
                >
                  <span className="min-w-0 break-words">
                    {sessionMemory.eventStage === 'ARRANGED_OR_STARTED'
                      ? `⏳ 伙伴陪你尝试中：${sessionMemory.childChoiceSummary}`
                      : `🌟 伙伴记得：${sessionMemory.childChoiceSummary}`}
                  </span>
                </span>
              )}
            </div>

            {isSpeakingThisGreeting ? (
              <p
                data-testid="companion-karaoke-greeting"
                className="text-xs sm:text-base text-[#123C5C] mt-1 leading-snug sm:leading-relaxed font-medium"
              >
                {karaoke.tokens.map((tok, idx) => (
                  <span
                    key={`${idx}-${tok.offsetMs}`}
                    className={`transition-colors duration-100 rounded-md ${
                      tok.isActive
                        ? 'bg-[#FFD67A] text-[#123C5C] font-black px-1 py-0.5 shadow-2xs'
                        : tok.isPast
                          ? 'text-teal-900 font-bold'
                          : 'text-stone-700 font-medium'
                    }`}
                  >
                    {tok.text}
                  </span>
                ))}
              </p>
            ) : (
              <p
                data-testid="companion-greeting-text"
                className="text-xs sm:text-base text-stone-700 mt-1 leading-snug sm:leading-relaxed font-medium line-clamp-2 sm:line-clamp-none"
              >
                {greetingText}
              </p>
            )}
          </div>
        </div>

        {/* 右侧操作区：听问候 + 偏好设置 */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            data-testid="v2-banner-speak-btn"
            onClick={handleSpeak}
            className="min-h-[56px] min-w-[56px] px-3.5 rounded-2xl bg-[#72CBFF]/25 hover:bg-[#72CBFF]/40 text-[#123C5C] border-2 border-[#60BCF6]/60 flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm transition-colors cursor-pointer"
            aria-label={`听${companion.name}问候`}
          >
            <Volume2 className="w-5 h-5 text-[#123C5C] shrink-0" />
            <span className="whitespace-nowrap">听问候</span>
          </button>

          {onOpenSettings && (
            <button
              type="button"
              data-testid="v2-banner-settings-btn"
              onClick={() => {
                sounds.playCardSelect();
                onOpenSettings();
              }}
              className="min-h-[56px] min-w-[56px] px-3.5 rounded-2xl bg-[#FFD67A]/45 hover:bg-[#FFD67A]/70 text-[#123C5C] border-2 border-[#B68C64]/50 flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm transition-colors cursor-pointer"
              aria-label="打开小岛偏好设置"
            >
              <SlidersHorizontal className="w-5 h-5 text-[#123C5C] shrink-0" />
              <span className="whitespace-nowrap">换伙伴</span>
            </button>
          )}
        </div>
      </div>

      {/* 四位伙伴透明 PNG 一键切换栏 (每个触控目标 >= 56×56px) */}
      <div
        data-testid="v2-companion-quick-switcher"
        role="group"
        aria-label="切换四位透明立绘伙伴"
        className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-1.5 border-t border-[#B68C64]/20"
      >
        {COMPANION_IDS.map((cid) => {
          const item = ANIMAL_COMPANIONS[cid];
          const selected = companion.id === cid;
          return (
            <button
              key={cid}
              type="button"
              data-testid={`v2-pick-companion-${cid}`}
              aria-pressed={selected}
              onClick={() => handleSelectCompanion(cid)}
              className={`min-h-[56px] px-2 py-1.5 rounded-2xl border-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:ring-4 focus-visible:ring-[#18B7A4] focus-visible:outline-none ${
                selected
                  ? 'bg-[#18B7A4]/20 border-[#18B7A4] text-[#123C5C] shadow-2xs'
                  : 'bg-white/80 hover:bg-white border-stone-200 text-stone-700'
              }`}
              aria-label={`选择伙伴${item.name}（${item.animal}）`}
            >
              <img
                src={nativeCompanionUrl(cid)}
                alt=""
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 pointer-events-none"
              />
              <span className="font-black text-xs sm:text-sm whitespace-nowrap">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 3. V2ChildAudioBar — 只替换 V2 图形与色彩，100% 保持 speechNarrator 真实音频实现
 */
export const V2ChildAudioBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(speechNarrator.getSpeaking());
  const [isPaused, setIsPaused] = useState<boolean>(speechNarrator.getIsPaused());
  const [voiceWarning, setVoiceWarning] = useState<string | null>(
    speechNarrator.getVoiceWarning()
  );
  const [isSfxMuted, setIsSfxMuted] = useState<boolean>(sounds.getSfxMuted());
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(
    speechNarrator.getVoiceEnabled()
  );
  const [activeProfileConfig, setActiveProfileConfig] = useState(() =>
    speechNarrator.getProfileConfig()
  );
  const [lastText, setLastText] = useState<string>(speechNarrator.getLastText());
  const [karaoke, setKaraoke] = useState<KaraokeSyncState>(speechNarrator.getKaraokeState());
  const [narrationSession, setNarrationSession] = useState<NarrationSession>(() =>
    speechNarrator.getNarrationSession()
  );

  useEffect(() => {
    const unsubscribeSpeech = speechNarrator.subscribe(() => {
      setIsSpeaking(speechNarrator.getSpeaking());
      setIsPaused(speechNarrator.getIsPaused());
      setVoiceWarning(speechNarrator.getVoiceWarning());
      setIsVoiceEnabled(speechNarrator.getVoiceEnabled());
      setActiveProfileConfig(speechNarrator.getProfileConfig());
      setLastText(speechNarrator.getLastText());
      setKaraoke(speechNarrator.getKaraokeState());
      setNarrationSession(speechNarrator.getNarrationSession());
    });
    const unsubscribeSound = sounds.subscribe(() => {
      setIsSfxMuted(sounds.getSfxMuted());
    });
    return () => {
      unsubscribeSpeech();
      unsubscribeSound();
    };
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

  const handleToggleSfx = () => {
    const nextMuted = !isSfxMuted;
    sounds.setSfxMuted(nextMuted);
    setIsSfxMuted(nextMuted);
    if (!nextMuted) {
      sounds.playNatureChime();
    }
  };

  return (
    <div
      data-testid="child-audio-bar"
      data-companion-id={narrationSession.companionId}
      data-playback-status={narrationSession.playbackStatus}
      className={`w-full space-y-2 ${className}`}
    >
      {voiceWarning && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center justify-between gap-2.5 p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs text-amber-950"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <p className="text-xs sm:text-sm font-extrabold text-amber-900 leading-snug">
              {voiceWarning}
            </p>
          </div>
          <button
            type="button"
            onClick={() => speechNarrator.dismissVoiceWarning()}
            className="px-3.5 py-2 text-xs font-black bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl shrink-0 min-h-[56px] min-w-[56px] cursor-pointer"
            aria-label="关闭语音提示"
          >
            知道了
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3.5 bg-[#FFF9EC] rounded-3xl border-2 border-[#B68C64]/45 shadow-sm relative overflow-hidden">
        {isSpeaking && (
          <div
            className="absolute bottom-0 left-0 h-1.5 bg-[#18B7A4] transition-all duration-100 pointer-events-none"
            style={{ width: `${Math.max(6, Math.round(karaoke.progressRatio * 100))}%` }}
            aria-hidden="true"
          />
        )}

        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            data-testid="audio-bar-companion-avatar"
            data-companion-id={narrationSession.companionId}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 p-1 border-2 ${
              isSpeaking
                ? 'bg-[#FFD67A]/60 border-[#B68C64]'
                : 'bg-white border-stone-200'
            }`}
            aria-hidden="true"
          >
            <img
              src={nativeCompanionUrl(narrationSession.companionId)}
              alt=""
              className="w-9 h-9 object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                data-testid="audio-bar-companion-voice-badge"
                className="text-xs font-black text-[#123C5C] whitespace-nowrap"
              >
                {isSpeaking
                  ? isPaused
                    ? `${activeProfileConfig.companionName}语音已暂停`
                    : `${activeProfileConfig.companionName}正在轻声朗读`
                  : isVoiceEnabled
                    ? `${activeProfileConfig.companionName} · ${activeProfileConfig.name}`
                    : `${activeProfileConfig.companionName} · 字幕伴读（语音已关）`}
              </span>
              {(lastText || narrationSession.voiceSourceLabel) && (
                <span
                  data-testid="audio-bar-voice-source-label"
                  className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-[#18B7A4]/40 text-[#123C5C]"
                >
                  <img src={effectSvgUrl('sparkle')} alt="" className="w-3 h-3" />
                  <span>{karaoke.voiceSourceLabel || narrationSession.voiceSourceLabel}</span>
                </span>
              )}
            </div>

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
                        ? 'bg-[#FFD67A] text-[#123C5C] font-black px-1 py-0.5'
                        : isSpeaking && tok.isPast
                          ? 'text-teal-900 font-bold'
                          : 'text-stone-600 font-medium'
                    }`}
                  >
                    {tok.text}
                  </span>
                ))}
              </p>
            ) : (
              <p
                data-testid="karaoke-caption-line"
                className="text-xs text-stone-600 font-medium truncate max-w-[210px] sm:max-w-[400px]"
              >
                {lastText || '点击任意地标或听问候按钮，体验声文同步伴读'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-testid="audio-bar-replay-btn"
            onClick={handleReplay}
            className="min-h-[56px] min-w-[56px] px-3 py-2 rounded-2xl bg-[#FFD67A]/60 hover:bg-[#FFD67A] text-[#123C5C] border border-[#B68C64]/50 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            aria-label="重新朗读上一段话"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">重听</span>
          </button>

          {isSpeaking && (
            <button
              type="button"
              data-testid="audio-bar-pause-btn"
              onClick={handleTogglePause}
              className="min-h-[56px] min-w-[56px] px-3 py-2 rounded-2xl bg-[#72CBFF]/35 hover:bg-[#72CBFF]/60 text-[#123C5C] border border-[#60BCF6] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              aria-label={isPaused ? '继续朗读' : '暂停朗读'}
            >
              {isPaused ? <Play className="w-4 h-4 shrink-0" /> : <Pause className="w-4 h-4 shrink-0" />}
              <span className="hidden sm:inline">{isPaused ? '继续' : '暂停'}</span>
            </button>
          )}

          {isSpeaking && (
            <button
              type="button"
              data-testid="audio-bar-stop-btn"
              onClick={handleStop}
              className="min-h-[56px] min-w-[56px] px-3 py-2 rounded-2xl bg-[#FFB6C9]/45 hover:bg-[#FFB6C9]/75 text-rose-950 border border-rose-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              aria-label="停止当前语音朗读"
            >
              <Square className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">停止</span>
            </button>
          )}

          <button
            type="button"
            data-testid="audio-bar-sfx-btn"
            onClick={handleToggleSfx}
            aria-pressed={!isSfxMuted}
            className={`min-h-[56px] min-w-[56px] px-3 py-2 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
              isSfxMuted
                ? 'bg-stone-100 text-stone-500 border-stone-200'
                : 'bg-[#A7D676]/35 text-[#123C5C] border-[#A7D676]'
            }`}
            aria-label={isSfxMuted ? '开启轻柔互动音效' : '关闭轻柔互动音效'}
          >
            {isSfxMuted ? <VolumeX className="w-4 h-4 shrink-0" /> : <Volume2 className="w-4 h-4 shrink-0" />}
            <span className="hidden md:inline">{isSfxMuted ? '音效已关' : '轻柔音效'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 4. V2ParentDashboardShell — 家长端独立 V2 视觉壳
 * 契约：
 * - 周报、观察记录、抱抱收件箱与亲子门禁 100% 接原 `ParentDashboard` 与 `AppContext`，严禁使用演示假数据；
 * - 明确标注家长端独立高清图层处于 `ART_DIRECTOR_QA_HOLD`（仅有 V07 设计参照）。
 */
export const V2ParentDashboardShell: React.FC = () => {
  return (
    <div
      data-testid="v2-parent-dashboard-shell"
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      className="min-h-screen bg-gradient-to-b from-[#F5FBFE] via-[#FFF7EB] to-[#EAF5F0]"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3">
        <div
          data-testid="v2-parent-qa-hold-banner"
          className="rounded-2xl bg-[#123C5C] text-[#FFF7EB] p-3 sm:p-4 border-2 border-[#B68C64]/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black">
                  家长教练端 · V2 视觉壳（真实业务源数据直连）
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px]">
                  ART_DIRECTOR_QA_HOLD
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-sky-100 mt-0.5">
                本包仅含 V07 整页参考图，未拆出家长端独立高清插画母版；下方周报、观察记录、抱抱请求与门禁全部读写原业务真实状态，静音规则严格生效。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 100% 真实业务家长工作台 */}
      <ParentDashboard />
    </div>
  );
};
