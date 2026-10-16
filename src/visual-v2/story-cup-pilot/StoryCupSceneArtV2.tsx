import React, { useEffect, useState } from 'react';
import { speechNarrator, type NarrationSession } from '../../utils/speech';
import { useApp } from '../../context/AppContext';
import type { CupTablePosition } from '../../domain/storyGrove/interactiveStoryLeaves';

export function useReducedMotionPreference(): boolean {
  const { personalization } = useApp();
  const [systemReduced, setSystemReduced] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return Boolean(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setSystemReduced(Boolean(e.matches));
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
  }, []);

  return Boolean(personalization.accessibility.reducedMotion) || systemReduced;
}

export type StoryCupCharacterState = 'idle' | 'blink' | 'talk' | 'think' | 'celebrate';

export type SceneLayerId = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export interface SceneLayerSpec {
  id: SceneLayerId;
  name: string;
  label: string;
  desktopSvg: string;
  desktopWebp: string;
  desktopPng: string;
  mobileSvg: string;
  mobileWebp: string;
  mobilePng: string;
}

const BASE_PATH = '/visual-v2/story-cup-pilot';

export const STORY_CUP_SCENE_LAYERS: SceneLayerSpec[] = [
  {
    id: 'L1',
    name: 'L1_sky_distant',
    label: 'L1 远空海湾',
    desktopSvg: `${BASE_PATH}/01_SCENE_LAYERS/desktop/L1_sky_distant.svg`,
    desktopWebp: `${BASE_PATH}/exports/webp/01_SCENE_LAYERS/desktop/L1_sky_distant.webp`,
    desktopPng: `${BASE_PATH}/exports/png/01_SCENE_LAYERS/desktop/L1_sky_distant.png`,
    mobileSvg: `${BASE_PATH}/01_SCENE_LAYERS/mobile/L1_sky_distant.svg`,
    mobileWebp: `${BASE_PATH}/exports/webp/01_SCENE_LAYERS/mobile/L1_sky_distant.webp`,
    mobilePng: `${BASE_PATH}/exports/png/01_SCENE_LAYERS/mobile/L1_sky_distant.png`,
  },
  {
    id: 'L2',
    name: 'L2_treehouse_arch',
    label: 'L2 树屋木拱',
    desktopSvg: `${BASE_PATH}/01_SCENE_LAYERS/desktop/L2_treehouse_arch.svg`,
    desktopWebp: `${BASE_PATH}/exports/webp/01_SCENE_LAYERS/desktop/L2_treehouse_arch.webp`,
    desktopPng: `${BASE_PATH}/exports/png/01_SCENE_LAYERS/desktop/L2_treehouse_arch.png`,
    mobileSvg: `${BASE_PATH}/01_SCENE_LAYERS/mobile/L2_treehouse_arch.svg`,
    mobileWebp: `${BASE_PATH}/exports/webp/01_SCENE_LAYERS/mobile/L2_treehouse_arch.webp`,
    mobilePng: `${BASE_PATH}/exports/png/01_SCENE_LAYERS/mobile/L2_treehouse_arch.png`,
  },
  {
    id: 'L3',
    name: 'L3_shelves_lamps_foliage',
    label: 'L3 书架暖灯',
    desktopSvg: `${BASE_PATH}/01_SCENE_LAYERS/desktop/L3_shelves_lamps_foliage.svg`,
    desktopWebp: `${BASE_PATH}/exports/webp/01_SCENE_LAYERS/desktop/L3_shelves_lamps_foliage.webp`,
    desktopPng: `${BASE_PATH}/exports/png/01_SCENE_LAYERS/desktop/L3_shelves_lamps_foliage.png`,
    mobileSvg: `${BASE_PATH}/01_SCENE_LAYERS/mobile/L3_shelves_lamps_foliage.svg`,
    mobileWebp: `${BASE_PATH}/exports/webp/01_SCENE_LAYERS/mobile/L3_shelves_lamps_foliage.webp`,
    mobilePng: `${BASE_PATH}/exports/png/01_SCENE_LAYERS/mobile/L3_shelves_lamps_foliage.png`,
  },
  {
    id: 'L4',
    name: 'L4_tabletop',
    label: 'L4 木桌台面',
    desktopSvg: `${BASE_PATH}/01_SCENE_LAYERS/desktop/L4_tabletop.svg`,
    desktopWebp: `${BASE_PATH}/exports/webp/01_SCENE_LAYERS/desktop/L4_tabletop.webp`,
    desktopPng: `${BASE_PATH}/exports/png/01_SCENE_LAYERS/desktop/L4_tabletop.png`,
    mobileSvg: `${BASE_PATH}/01_SCENE_LAYERS/mobile/L4_tabletop.svg`,
    mobileWebp: `${BASE_PATH}/exports/webp/01_SCENE_LAYERS/mobile/L4_tabletop.webp`,
    mobilePng: `${BASE_PATH}/exports/png/01_SCENE_LAYERS/mobile/L4_tabletop.png`,
  },
  {
    id: 'L5',
    name: 'L5_foreground_foliage',
    label: 'L5 前景枝叶',
    desktopSvg: `${BASE_PATH}/01_SCENE_LAYERS/desktop/L5_foreground_foliage.svg`,
    desktopWebp: `${BASE_PATH}/exports/webp/01_SCENE_LAYERS/desktop/L5_foreground_foliage.webp`,
    desktopPng: `${BASE_PATH}/exports/png/01_SCENE_LAYERS/desktop/L5_foreground_foliage.png`,
    mobileSvg: `${BASE_PATH}/01_SCENE_LAYERS/mobile/L5_foreground_foliage.svg`,
    mobileWebp: `${BASE_PATH}/exports/webp/01_SCENE_LAYERS/mobile/L5_foreground_foliage.webp`,
    mobilePng: `${BASE_PATH}/exports/png/01_SCENE_LAYERS/mobile/L5_foreground_foliage.png`,
  },
];

export const STORY_CUP_PROPS = {
  obj_wooden_block: {
    svg: `${BASE_PATH}/03_INTERACTIVE_PROPS/obj_wooden_block.svg`,
    webp: `${BASE_PATH}/exports/webp/03_INTERACTIVE_PROPS/obj_wooden_block.webp`,
    png: `${BASE_PATH}/exports/png/03_INTERACTIVE_PROPS/obj_wooden_block.png`,
  },
  obj_blue_cup: {
    svg: `${BASE_PATH}/03_INTERACTIVE_PROPS/obj_blue_cup.svg`,
    webp: `${BASE_PATH}/exports/webp/03_INTERACTIVE_PROPS/obj_blue_cup.webp`,
    png: `${BASE_PATH}/exports/png/03_INTERACTIVE_PROPS/obj_blue_cup.png`,
  },
  obj_elephant_bucket: {
    svg: `${BASE_PATH}/03_INTERACTIVE_PROPS/obj_elephant_bucket.svg`,
    webp: `${BASE_PATH}/exports/webp/03_INTERACTIVE_PROPS/obj_elephant_bucket.webp`,
    png: `${BASE_PATH}/exports/png/03_INTERACTIVE_PROPS/obj_elephant_bucket.png`,
  },
  obj_twig_ruler: {
    svg: `${BASE_PATH}/03_INTERACTIVE_PROPS/obj_twig_ruler.svg`,
    webp: `${BASE_PATH}/exports/webp/03_INTERACTIVE_PROPS/obj_twig_ruler.webp`,
    png: `${BASE_PATH}/exports/png/03_INTERACTIVE_PROPS/obj_twig_ruler.png`,
  },
} as const;

export const STORY_CUP_EFFECTS = {
  comparisonRibbon: {
    svg: `${BASE_PATH}/04_EFFECTS/fx_comparison_ribbon.svg`,
    webp: `${BASE_PATH}/exports/webp/04_EFFECTS/fx_comparison_ribbon.webp`,
  },
  inspectionSpotlight: {
    svg: `${BASE_PATH}/04_EFFECTS/fx_inspection_spotlight.svg`,
    webp: `${BASE_PATH}/exports/webp/04_EFFECTS/fx_inspection_spotlight.webp`,
  },
  observationSparkles: {
    svg: `${BASE_PATH}/04_EFFECTS/fx_observation_sparkles.svg`,
    webp: `${BASE_PATH}/exports/webp/04_EFFECTS/fx_observation_sparkles.webp`,
  },
} as const;

const RIG_BASE_PARTS = [
  '00_shadow',
  '01_tail_back',
  '02_feet',
  '03_body',
  '04_left_arm',
  '05_right_arm',
  '06_head',
] as const;

export function resolveStoryCharacterVisualState(params: {
  playbackStatus: NarrationSession['playbackStatus'];
  selectedSceneActionId: string | null;
  hasAllRequiredEvidence: boolean;
  isGoalCompleted: boolean;
  activeHotspotId: string | null;
  cupPosition: CupTablePosition;
  isBlinkTick: boolean;
  prefersReducedMotion: boolean;
}): StoryCupCharacterState {
  const {
    playbackStatus,
    selectedSceneActionId,
    hasAllRequiredEvidence,
    isGoalCompleted,
    activeHotspotId,
    cupPosition,
    isBlinkTick,
    prefersReducedMotion,
  } = params;

  // 1. Real speechNarrator playing session takes top priority for approximate mouth movement
  if (playbackStatus === 'playing') {
    return 'talk';
  }

  // 2. Paused speech immediately stops performance and holds calm idle
  if (playbackStatus === 'paused') {
    return 'idle';
  }

  // 3. Goal completion celebration ONLY when real business logic confirms goal + all required evidence.
  // Never celebrate on act_only_look_squirrel or incomplete evidence!
  if (
    isGoalCompleted &&
    hasAllRequiredEvidence &&
    selectedSceneActionId !== null &&
    selectedSceneActionId !== 'act_only_look_squirrel'
  ) {
    return 'celebrate';
  }

  // 4. Think state when single-side bias (act_only_look_squirrel), incomplete evidence, or actively comparing
  if (
    selectedSceneActionId === 'act_only_look_squirrel' ||
    (selectedSceneActionId !== null && !hasAllRequiredEvidence) ||
    activeHotspotId !== null ||
    cupPosition !== 'CENTER_TABLE'
  ) {
    return 'think';
  }

  // 5. Periodic blink in idle when reduced-motion is off
  if (!prefersReducedMotion && isBlinkTick) {
    return 'blink';
  }

  return 'idle';
}

interface StoryCharacterRigProps {
  characterId: 'tiaotiao_story_squirrel' | 'pupu_story_elephant';
  displayName: string;
  state: StoryCupCharacterState;
  prefersReducedMotion: boolean;
  isVoicePaused: boolean;
  className?: string;
}

export const StoryCharacterRigV2: React.FC<StoryCharacterRigProps> = ({
  characterId,
  displayName,
  state,
  prefersReducedMotion,
  isVoicePaused,
  className = '',
}) => {
  const eyePart = state === 'blink' ? '07_eyes_blink' : '07_eyes_open';
  const mouthPart =
    state === 'talk'
      ? '08_mouth_talk'
      : state === 'think'
        ? '08_mouth_think'
        : '08_mouth_smile';

  const charDir = `${BASE_PATH}/02_STORY_CHARACTERS/${characterId}`;
  const stateWebp = `${BASE_PATH}/exports/webp/02_STORY_CHARACTERS/${characterId}/states/${state}.webp`;

  // Decorative motion style respecting prefers-reduced-motion and voice pause
  const motionStyle: React.CSSProperties =
    prefersReducedMotion || isVoicePaused
      ? { transform: 'none', transition: 'none', animation: 'none' }
      : state === 'celebrate'
        ? {
            transform: 'translateY(-10px) scale(1.03)',
            transition: 'transform 400ms ease-out',
          }
        : state === 'talk'
          ? {
              transform: 'translateY(-4px)',
              transition: 'transform 220ms ease-in-out',
            }
          : state === 'think'
            ? {
                transform: 'translateY(-2px)',
                transition: 'transform 320ms ease-in-out',
              }
            : {
                animation: 'al-cup-idle 3s ease-in-out infinite',
              };

  return (
    <div
      data-testid={`story-character-rig-${characterId}`}
      data-character-id={characterId}
      data-character-role="story-actor-only-not-global-companion"
      data-actor-state={state}
      data-eye-part={eyePart}
      data-mouth-part={mouthPart}
      data-voice-paused={isVoicePaused ? 'true' : 'false'}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      data-state-webp={stateWebp}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={motionStyle}
      title={`${displayName} (${state})`}
    >
      {/* Native 9-part SVG rig assembly (canvas 800x900) */}
      <div className="relative w-full aspect-[8/9]">
        {RIG_BASE_PARTS.map((partId) => (
          <img
            key={partId}
            src={`${charDir}/rig_parts/${partId}.svg`}
            alt=""
            draggable={false}
            data-rig-part={partId}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
        ))}
        <img
          src={`${charDir}/rig_parts/${eyePart}.svg`}
          alt=""
          draggable={false}
          data-rig-part={eyePart}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
        <img
          src={`${charDir}/rig_parts/${mouthPart}.svg`}
          alt=""
          draggable={false}
          data-rig-part={mouthPart}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
      </div>
    </div>
  );
};

export interface StoryCupSceneArtV2Props {
  cupPosition: CupTablePosition;
  comparedCupPositions: ('NEXT_TO_BLOCK' | 'NEXT_TO_BUCKET')[];
  inspectedHotspotIds: string[];
  activeHotspotId: string | null;
  selectedSceneActionId: string | null;
  hasAllRequiredEvidence: boolean;
  isGoalCompleted: boolean;
  enabledLayers: Record<SceneLayerId, boolean>;
}

/**
 * Pure visual backdrop + 5-layer treehouse + 2 story character rigs + visual-only effects.
 * All layers have pointer-events: none and never intercept or mutate domain state.
 */
export const StoryCupSceneArtV2: React.FC<StoryCupSceneArtV2Props> = ({
  cupPosition,
  comparedCupPositions,
  activeHotspotId,
  selectedSceneActionId,
  hasAllRequiredEvidence,
  isGoalCompleted,
  enabledLayers,
}) => {
  const prefersReducedMotion = useReducedMotionPreference();
  const [narrationSession, setNarrationSession] = useState<NarrationSession>(() =>
    speechNarrator.getNarrationSession()
  );
  const [isBlinkTick, setIsBlinkTick] = useState(false);

  useEffect(() => {
    return speechNarrator.subscribe(() => {
      setNarrationSession({ ...speechNarrator.getNarrationSession() });
    });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsBlinkTick(false);
      return;
    }
    const interval = window.setInterval(() => {
      setIsBlinkTick(true);
      window.setTimeout(() => setIsBlinkTick(false), 150);
    }, 3200);
    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  const actorState = resolveStoryCharacterVisualState({
    playbackStatus: narrationSession.playbackStatus,
    selectedSceneActionId,
    hasAllRequiredEvidence,
    isGoalCompleted,
    activeHotspotId,
    cupPosition,
    isBlinkTick,
    prefersReducedMotion,
  });

  const isVoicePaused = narrationSession.playbackStatus === 'paused';
  const showComparisonRibbon = comparedCupPositions.length === 2;
  const showSpotlight =
    activeHotspotId !== null || cupPosition === 'NEXT_TO_BLOCK' || cupPosition === 'NEXT_TO_BUCKET';
  const showSparkles =
    isGoalCompleted &&
    hasAllRequiredEvidence &&
    selectedSceneActionId !== 'act_only_look_squirrel';

  return (
    <div
      data-testid="v2-story-cup-art-backdrop"
      data-art-director-gate="ART_DIRECTOR_QA_HOLD"
      data-engineering-status="ENGINEERING_ASSET_READY"
      data-actor-state={actorState}
      data-speech-status={narrationSession.playbackStatus}
      data-speech-companion={narrationSession.companionId}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes al-cup-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes al-cup-shimmer {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.95; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-testid="v2-story-cup-art-backdrop"] * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* 5 Independent Responsive Layers (Desktop 1600x900 / Mobile 900x1600, WebP -> PNG -> SVG) */}
      {STORY_CUP_SCENE_LAYERS.map((layer, index) => {
        const isVisible = enabledLayers[layer.id] !== false;
        return (
          <picture
            key={layer.id}
            data-testid={`v2-story-cup-layer-${layer.id}`}
            data-layer-name={layer.name}
            data-layer-visible={isVisible ? 'true' : 'false'}
            data-desktop-svg={layer.desktopSvg}
            data-mobile-svg={layer.mobileSvg}
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ zIndex: index + 1 }}
          >
            <source media="(max-width: 640px)" srcSet={layer.mobileWebp} type="image/webp" />
            <source media="(max-width: 640px)" srcSet={layer.mobilePng} type="image/png" />
            <source media="(min-width: 641px)" srcSet={layer.desktopWebp} type="image/webp" />
            <img
              src={layer.desktopPng}
              alt=""
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
            />
          </picture>
        );
      })}

      {/* Visual-only Effects (04_EFFECTS) */}
      {showSpotlight && (
        <picture
          data-testid="v2-story-cup-fx-spotlight"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
          style={{ zIndex: 6 }}
        >
          <source srcSet={STORY_CUP_EFFECTS.inspectionSpotlight.webp} type="image/webp" />
          <img
            src={STORY_CUP_EFFECTS.inspectionSpotlight.svg}
            alt=""
            draggable={false}
            className="w-full h-full object-cover pointer-events-none"
          />
        </picture>
      )}

      {showComparisonRibbon && (
        <picture
          data-testid="v2-story-cup-fx-ribbon"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
          style={{ zIndex: 7 }}
        >
          <source srcSet={STORY_CUP_EFFECTS.comparisonRibbon.webp} type="image/webp" />
          <img
            src={STORY_CUP_EFFECTS.comparisonRibbon.svg}
            alt=""
            draggable={false}
            className="w-full h-full object-cover pointer-events-none"
          />
        </picture>
      )}

      {showSparkles && !prefersReducedMotion && (
        <picture
          data-testid="v2-story-cup-fx-sparkles"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 8, animation: 'al-cup-shimmer 1.2s ease-in-out infinite' }}
        >
          <source srcSet={STORY_CUP_EFFECTS.observationSparkles.webp} type="image/webp" />
          <img
            src={STORY_CUP_EFFECTS.observationSparkles.svg}
            alt=""
            draggable={false}
            className="w-full h-full object-cover pointer-events-none"
          />
        </picture>
      )}

      {/* Story Characters Layer (Tiaotiao Squirrel & Pupu Elephant - 9-part SVG rigs) */}
      <div
        data-testid="v2-story-cup-characters-stage"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 9 }}
      >
        <StoryCharacterRigV2
          characterId="tiaotiao_story_squirrel"
          displayName="小松鼠跳跳（故事角色）"
          state={actorState}
          prefersReducedMotion={prefersReducedMotion}
          isVoicePaused={isVoicePaused}
          className="absolute left-[1%] sm:left-[2%] bottom-[22%] sm:bottom-[20%] w-[22%] sm:w-[20%] max-w-[126px]"
        />
        <StoryCharacterRigV2
          characterId="pupu_story_elephant"
          displayName="小象噗噗（故事角色）"
          state={actorState}
          prefersReducedMotion={prefersReducedMotion}
          isVoicePaused={isVoicePaused}
          className="absolute right-[1%] sm:right-[2%] bottom-[22%] sm:bottom-[20%] w-[24%] sm:w-[22%] max-w-[136px]"
        />
      </div>
    </div>
  );
};

export interface StoryCupLayerControlBarV2Props {
  enabledLayers: Record<SceneLayerId, boolean>;
  onToggleLayer: (id: SceneLayerId) => void;
  onResetLayers: () => void;
}

export const StoryCupLayerControlBarV2: React.FC<StoryCupLayerControlBarV2Props> = ({
  enabledLayers,
  onToggleLayer,
  onResetLayers,
}) => {
  const [narrationSession, setNarrationSession] = useState<NarrationSession>(() =>
    speechNarrator.getNarrationSession()
  );

  useEffect(() => {
    return speechNarrator.subscribe(() => {
      setNarrationSession({ ...speechNarrator.getNarrationSession() });
    });
  }, []);

  return (
    <div
      data-testid="v2-story-cup-pilot-inspector"
      className="rounded-2xl bg-amber-950/90 text-amber-50 px-3 py-2.5 border border-amber-400/40 space-y-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            data-testid="v2-story-cup-qa-badge"
            className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black"
          >
            ART_DIRECTOR_QA_HOLD · V2.2 故事林杯子样板
          </span>
          <span
            data-testid="v2-story-cup-content-qa-flag"
            className="px-2 py-0.5 rounded-full bg-rose-900/90 text-rose-100 border border-rose-400/40 font-bold"
            title="源码部分台词写为“小狐狸果果”，与全局松鼠果果物种不一致；按契约不暗改业务文案，单列 CONTENT_QA_REVIEW"
          >
            CONTENT_QA_REVIEW：台词含“小狐狸果果”待产品另案校订
          </span>
        </div>
        <span
          data-testid="v2-story-cup-voice-session-pill"
          data-playback-status={narrationSession.playbackStatus}
          data-companion-id={narrationSession.companionId}
          className="px-2 py-0.5 rounded-full bg-stone-800 text-amber-200 font-bold"
        >
          旁白：{narrationSession.companionId} · {narrationSession.playbackStatus}（近似嘴型非音素同步）
        </span>
      </div>

      {/* 5-Layer Toggle Controls for Gate 1 Verification */}
      <div
        data-testid="v2-story-cup-layer-toggles"
        className="grid grid-cols-3 sm:grid-cols-6 gap-1.5"
        role="group"
        aria-label="V2.2 树屋场景 5 图层独立开关"
      >
        {STORY_CUP_SCENE_LAYERS.map((layer) => {
          const active = enabledLayers[layer.id] !== false;
          return (
            <button
              key={layer.id}
              type="button"
              data-testid={`v2-layer-toggle-${layer.id}`}
              aria-pressed={active}
              onClick={() => onToggleLayer(layer.id)}
              className={`min-h-[56px] min-w-[56px] px-2 py-1.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer flex flex-col items-center justify-center ${
                active
                  ? 'bg-emerald-600 text-white border-emerald-300 shadow-sm'
                  : 'bg-stone-800/90 text-stone-300 border-stone-600'
              }`}
            >
              <span>{layer.label}</span>
              <span className="text-[10px] opacity-85">{active ? '显示中' : '已隐藏'}</span>
            </button>
          );
        })}
        <button
          type="button"
          data-testid="v2-layer-toggle-reset"
          onClick={onResetLayers}
          className="min-h-[56px] min-w-[56px] px-2 py-1.5 rounded-xl text-[11px] font-black border bg-amber-600 hover:bg-amber-500 text-white border-amber-300 transition-all cursor-pointer flex flex-col items-center justify-center"
        >
          <span>重置 5 层</span>
          <span className="text-[10px] opacity-90">全部开启</span>
        </button>
      </div>
    </div>
  );
};
