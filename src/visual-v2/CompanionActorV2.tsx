import React, { useEffect, useRef, useState } from 'react';
import { ANIMAL_COMPANIONS, AnimalCompanionId } from '../domain/personalization';
import { speechNarrator, NarrationSession, COMPANION_TO_VOICE_PROFILE } from '../utils/speech';
import {
  VisualCharacter,
  MotionState,
  nativeCompanionUrl,
  spriteUrl,
} from './AlandVisualAssets';
import { animateAlandSprite } from './motion/animations';

export interface CompanionActorV2Props {
  companionId: AnimalCompanionId;
  reducedMotion?: boolean;
  displayOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  overrideMotion?: MotionState | null;
  onTriggerSpeak?: () => void;
  className?: string;
  testId?: string;
}

/**
 * CompanionActorV2 — 四伙伴 2.5D 透明精灵角色组件
 * 契约：
 * 1. 严格使用既有业务 ID (`guoguo_squirrel` | `beibei_otter` | `tiantian_raccoon` | `qiqi_deer`) 与 `voiceProfile`；
 * 2. 朗读开始/暂停/继续/结束状态 100% 来自 `speechNarrator` 真实会话，绝不从 CSS/WAAPI 动画反向伪造语音进度；
 * 3. 在主岛栈桥上设置 `displayOnly={true}` 时仅作为透明角色展示，不劫持地标导航；
 * 4. 明确标注 `ART_DIRECTOR_QA_HOLD`（原生立绘 172–206px，整体精灵变换，无真实口型对齐）。
 */
export const CompanionActorV2: React.FC<CompanionActorV2Props> = ({
  companionId,
  reducedMotion = false,
  displayOnly = false,
  size = 'md',
  overrideMotion = null,
  onTriggerSpeak,
  className = '',
  testId = 'v2-companion-actor',
}) => {
  const companion = ANIMAL_COMPANIONS[companionId] || ANIMAL_COMPANIONS.guoguo_squirrel;
  const voiceProfile = COMPANION_TO_VOICE_PROFILE[companion.id];
  const [session, setSession] = useState<NarrationSession>(() =>
    speechNarrator.getNarrationSession()
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(() => speechNarrator.getSpeaking());
  const [isPaused, setIsPaused] = useState<boolean>(() => speechNarrator.getIsPaused());
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = speechNarrator.subscribe(() => {
      setSession(speechNarrator.getNarrationSession());
      setIsSpeaking(speechNarrator.getSpeaking());
      setIsPaused(speechNarrator.getIsPaused());
    });
    return unsub;
  }, []);

  const isThisCompanionActivelyPlaying =
    isSpeaking &&
    !isPaused &&
    session.companionId === companion.id &&
    session.playbackStatus === 'playing';

  const effectiveMotion: MotionState = reducedMotion
    ? 'idle'
    : overrideMotion
      ? overrideMotion
      : isThisCompanionActivelyPlaying
        ? session.sceneId === 'island_home_companion'
          ? 'greeting'
          : 'listening'
        : 'idle';

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;
    animateAlandSprite(containerRef.current, effectiveMotion);
  }, [effectiveMotion, reducedMotion, companion.id]);

  const sizeClasses =
    size === 'lg'
      ? 'w-28 h-28 sm:w-36 sm:h-36'
      : size === 'sm'
        ? 'w-12 h-12 sm:w-14 sm:h-14'
        : 'w-16 h-16 sm:w-20 sm:h-20';

  const resolvedSrc = reducedMotion
    ? nativeCompanionUrl(companion.id)
    : spriteUrl(companion.id, effectiveMotion);

  if (displayOnly) {
    return (
      <div
        ref={containerRef}
        data-testid={testId}
        data-companion-id={companion.id}
        data-voice-profile={voiceProfile}
        data-motion-state={effectiveMotion}
        data-playback-status={session.playbackStatus}
        data-art-gate="ART_DIRECTOR_QA_HOLD"
        aria-hidden="true"
        className={`pointer-events-none select-none inline-flex flex-col items-center ${className}`}
      >
        <VisualCharacter
          companion={companion.id}
          motion={effectiveMotion}
          reducedMotion={reducedMotion}
          className={`${sizeClasses} object-contain drop-shadow-md`}
          alt=""
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      data-companion-id={companion.id}
      data-voice-profile={voiceProfile}
      data-motion-state={effectiveMotion}
      data-playback-status={session.playbackStatus}
      data-image-src={resolvedSrc}
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      className={`inline-flex flex-col items-center ${className}`}
    >
      <button
        type="button"
        data-testid={`${testId}-trigger`}
        onClick={onTriggerSpeak}
        className="relative min-w-[56px] min-h-[56px] p-1.5 rounded-2xl bg-gradient-to-b from-[#FFF9EC] to-[#E3F6F2] border-2 border-[#18B7A4]/40 shadow-sm hover:brightness-105 active:scale-95 transition-transform cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none flex items-center justify-center"
        aria-label={`${companion.name}（${companion.animal}）：点击朗读问候语`}
        title={`点击听${companion.name}说话（声线：${voiceProfile}）`}
      >
        <VisualCharacter
          companion={companion.id}
          motion={effectiveMotion}
          reducedMotion={reducedMotion}
          className={`${sizeClasses} object-contain drop-shadow-sm`}
          alt={`${companion.name}透明立绘`}
        />
        <span
          data-testid={`${testId}-state-pill`}
          className={`absolute -bottom-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border shadow-2xs whitespace-nowrap ${
            isThisCompanionActivelyPlaying
              ? 'bg-amber-400 text-stone-950 border-amber-600'
              : isPaused && session.companionId === companion.id
                ? 'bg-sky-200 text-sky-950 border-sky-400'
                : 'bg-white/95 text-[#123C5C] border-stone-200'
          }`}
        >
          {isThisCompanionActivelyPlaying
            ? '朗读中'
            : isPaused && session.companionId === companion.id
              ? '已暂停'
              : companion.name}
        </span>
      </button>
    </div>
  );
};
