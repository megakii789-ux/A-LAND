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

  return Boolean(personalization?.accessibility?.reducedMotion) || systemReduced;
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

export type ActiveStorySpeaker =
  | 'tiaotiao_story_squirrel'
  | 'pupu_story_elephant'
  | 'narrator_or_multi'
  | 'none';

/**
 * Resolves whether current active speech belongs uniquely to Tiaotiao (squirrel),
 * uniquely to Pupu (elephant), or to the global companion narrator / multi-character summary.
 * Guarantees Tiaotiao and Pupu NEVER enter `talk` simultaneously.
 */
export function resolveActiveStorySpeaker(params: {
  playbackStatus: NarrationSession['playbackStatus'];
  activeHotspotId: string | null;
  selectedSceneActionId: string | null;
}): ActiveStorySpeaker {
  if (params.playbackStatus !== 'playing') {
    return 'none';
  }
  // When an action outcome (which includes narrator summary + multiple characters) or general scene setting is spoken,
  // speech belongs to the global companion narrator rather than a single story character.
  if (params.selectedSceneActionId !== null || params.activeHotspotId === null) {
    return 'narrator_or_multi';
  }
  if (params.activeHotspotId === 'obj_wooden_block') {
    return 'tiaotiao_story_squirrel';
  }
  if (params.activeHotspotId === 'obj_elephant_bucket') {
    return 'pupu_story_elephant';
  }
  return 'narrator_or_multi';
}

export function resolveStoryCharacterVisualState(params: {
  characterId?: 'tiaotiao_story_squirrel' | 'pupu_story_elephant';
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
    characterId,
    playbackStatus,
    selectedSceneActionId,
    hasAllRequiredEvidence,
    isGoalCompleted,
    activeHotspotId,
    cupPosition,
    isBlinkTick,
    prefersReducedMotion,
  } = params;

  // 1. Paused speech immediately stops performance and holds calm idle
  if (playbackStatus === 'paused') {
    return 'idle';
  }

  // 2. Real speechNarrator playing session:
  //    - If characterId is specified, ONLY the uniquely matched story speaker enters approximate 'talk';
  //      the other character (or both characters when global companion narrator speaks) remains in calm listening ('think' or 'idle').
  if (playbackStatus === 'playing') {
    if (!characterId) {
      return 'talk';
    }
    const activeSpeaker = resolveActiveStorySpeaker({
      playbackStatus,
      activeHotspotId,
      selectedSceneActionId,
    });
    if (activeSpeaker === characterId) {
      return 'talk';
    }
    // Non-speaking character listens attentively without moving mouth
    if (
      activeHotspotId !== null ||
      selectedSceneActionId !== null ||
      cupPosition !== 'CENTER_TABLE'
    ) {
      return 'think';
    }
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

export interface StoryCupStageMatrix {
  mode: 'mobile' | 'desktop';
  svgViewBox: '0 0 420 747' | '0 0 420 220';
  svgWidth: 420;
  svgHeight: 747 | 220;
  sourceAssetWidth: 900 | 1600;
  sourceAssetHeight: 1600 | 900;
  stageAspectClass: string;
  tabletopSurfaceYRange: [number, number];
  tabletopOvalCenterY: number;
  tabletopOvalCentersX: {
    NEXT_TO_BLOCK: number;
    CENTER_TABLE: number;
    NEXT_TO_BUCKET: number;
  };
  dropZones: {
    NEXT_TO_BLOCK: { x: number; y: number; width: number; height: number; cx: number; cy: number };
    CENTER_TABLE: { x: number; y: number; width: number; height: number; cx: number; cy: number };
    NEXT_TO_BUCKET: { x: number; y: number; width: number; height: number; cx: number; cy: number };
  };
  props: {
    woodenBlock: {
      groupTransform: string;
      hitRect: { x: number; y: number; width: number; height: number };
      img: { x: number; y: number; width: number; height: number };
      labelX: number;
      labelY: number;
    };
    elephantBucket: {
      groupTransform: string;
      hitRect: { x: number; y: number; width: number; height: number };
      img: { x: number; y: number; width: number; height: number };
      labelX: number;
      labelY: number;
    };
    blueCup: {
      y: number;
      dragY: number;
      xByPosition: Record<CupTablePosition, number>;
      hitRect: { x: number; y: number; width: number; height: number };
      img: { x: number; y: number; width: number; height: number };
      gaugeY: number;
    };
    twigRuler: {
      groupTransform: string;
      hitRect: { x: number; y: number; width: number; height: number };
      img: { x: number; y: number; width: number; height: number };
    };
  };
  overlayOffsetY: number;
}

/**
 * Desktop Unified Stage Matrix (1600x900 layers <-> 420x220 logical stage).
 * In desktop/L4_tabletop.svg (1600x900), tabletop top surface is y=671..766 (164..187 in 420x220),
 * and the 3 placement ovals are at cy=708 (173.1 in 420x220), cx=356, 800, 1230 (93.5, 210.0, 322.9).
 */
export const STORY_CUP_STAGE_MATRIX_DESKTOP: StoryCupStageMatrix = {
  mode: 'desktop',
  svgViewBox: '0 0 420 220',
  svgWidth: 420,
  svgHeight: 220,
  sourceAssetWidth: 1600,
  sourceAssetHeight: 900,
  stageAspectClass: 'aspect-[420/220] w-full',
  tabletopSurfaceYRange: [164, 187],
  tabletopOvalCenterY: 173,
  tabletopOvalCentersX: {
    NEXT_TO_BLOCK: 94,
    CENTER_TABLE: 210,
    NEXT_TO_BUCKET: 323,
  },
  dropZones: {
    NEXT_TO_BLOCK: { x: 84, y: 116, width: 72, height: 62, cx: 120, cy: 147 },
    CENTER_TABLE: { x: 174, y: 116, width: 72, height: 62, cx: 210, cy: 147 },
    NEXT_TO_BUCKET: { x: 252, y: 116, width: 72, height: 62, cx: 288, cy: 147 },
  },
  props: {
    woodenBlock: {
      groupTransform: 'translate(46, 114)',
      hitRect: { x: -6, y: -4, width: 78, height: 74 },
      img: { x: 16, y: 16, width: 48, height: 48 },
      labelX: 40,
      labelY: 70,
    },
    elephantBucket: {
      groupTransform: 'translate(292, 86)',
      hitRect: { x: -10, y: 14, width: 82, height: 84 },
      img: { x: -6, y: 24, width: 64, height: 68 },
      labelX: 26,
      labelY: 98,
    },
    blueCup: {
      y: 122,
      dragY: 116,
      xByPosition: {
        NEXT_TO_BLOCK: 102,
        CENTER_TABLE: 186,
        NEXT_TO_BUCKET: 248,
      },
      hitRect: { x: -22, y: -16, width: 84, height: 84 },
      img: { x: -8, y: 4, width: 54, height: 54 },
      gaugeY: 0,
    },
    twigRuler: {
      groupTransform: 'translate(115, 184)',
      hitRect: { x: 0, y: -14, width: 190, height: 44 },
      img: { x: 25, y: -16, width: 140, height: 46 },
    },
  },
  overlayOffsetY: 28,
};

/**
 * Mobile Unified Stage Matrix (900x1600 layers <-> 420x747 9:16 logical stage).
 * Exact isotropic scale k = 420 / 900 = 746.67 / 1600 = 0.46667 (zero object-cover clipping!).
 * In mobile/L4_tabletop.svg (900x1600), tabletop top surface is y=1190..1325 (555..618 in 420x747),
 * and the 3 placement ovals are at cy=1250 (583.3 in 420x747), cx=190, 452, 713 (88.7, 210.9, 332.7).
 * On 360x800 (stage width ~302px, 1 SVG unit = 0.719px), 84x86 SVG dropzones render at >= 60.4x61.8 CSS px (>= 56px).
 */
export const STORY_CUP_STAGE_MATRIX_MOBILE: StoryCupStageMatrix = {
  mode: 'mobile',
  svgViewBox: '0 0 420 747',
  svgWidth: 420,
  svgHeight: 747,
  sourceAssetWidth: 900,
  sourceAssetHeight: 1600,
  stageAspectClass: 'aspect-[9/16] w-full',
  tabletopSurfaceYRange: [555, 618],
  tabletopOvalCenterY: 583,
  tabletopOvalCentersX: {
    NEXT_TO_BLOCK: 89,
    CENTER_TABLE: 211,
    NEXT_TO_BUCKET: 333,
  },
  dropZones: {
    NEXT_TO_BLOCK: { x: 74, y: 514, width: 84, height: 86, cx: 116, cy: 557 },
    CENTER_TABLE: { x: 168, y: 514, width: 84, height: 86, cx: 210, cy: 557 },
    NEXT_TO_BUCKET: { x: 262, y: 514, width: 84, height: 86, cx: 304, cy: 557 },
  },
  props: {
    woodenBlock: {
      groupTransform: 'translate(18, 520)',
      hitRect: { x: -4, y: -4, width: 84, height: 86 },
      img: { x: 8, y: 8, width: 62, height: 62 },
      labelX: 39,
      labelY: 82,
    },
    elephantBucket: {
      groupTransform: 'translate(316, 496)',
      hitRect: { x: -8, y: 6, width: 84, height: 92 },
      img: { x: 0, y: 14, width: 74, height: 78 },
      labelX: 37,
      labelY: 106,
    },
    blueCup: {
      y: 526,
      dragY: 518,
      xByPosition: {
        NEXT_TO_BLOCK: 92,
        CENTER_TABLE: 186,
        NEXT_TO_BUCKET: 266,
      },
      hitRect: { x: -20, y: -14, width: 88, height: 88 },
      img: { x: -12, y: 0, width: 68, height: 68 },
      gaugeY: -6,
    },
    twigRuler: {
      groupTransform: 'translate(115, 636)',
      hitRect: { x: 0, y: -22, width: 190, height: 82 },
      img: { x: 15, y: -18, width: 160, height: 56 },
    },
  },
  overlayOffsetY: 420,
};

export function resolveStoryCupStageMatrixForWidth(width: number): StoryCupStageMatrix {
  return width <= 640 ? STORY_CUP_STAGE_MATRIX_MOBILE : STORY_CUP_STAGE_MATRIX_DESKTOP;
}

export function useStoryCupStageMatrix(): StoryCupStageMatrix {
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (typeof window.innerWidth === 'number' && window.innerWidth > 0) {
      return window.innerWidth <= 640;
    }
    if (typeof window.matchMedia === 'function') {
      return Boolean(window.matchMedia('(max-width: 640px)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateViewport = () => {
      if (typeof window.innerWidth === 'number' && window.innerWidth > 0) {
        setIsMobileViewport(window.innerWidth <= 640);
      } else if (typeof window.matchMedia === 'function') {
        setIsMobileViewport(Boolean(window.matchMedia('(max-width: 640px)').matches));
      }
    };
    updateViewport();
    const mql =
      typeof window.matchMedia === 'function' ? window.matchMedia('(max-width: 640px)') : null;
    if (mql && typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', updateViewport);
    }
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('resize', updateViewport);
    }
    return () => {
      if (mql && typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', updateViewport);
      }
      if (typeof window.removeEventListener === 'function') {
        window.removeEventListener('resize', updateViewport);
      }
    };
  }, []);

  return isMobileViewport ? STORY_CUP_STAGE_MATRIX_MOBILE : STORY_CUP_STAGE_MATRIX_DESKTOP;
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
  stageMatrix?: StoryCupStageMatrix;
}

/**
 * Pure visual backdrop + 5-layer treehouse + 2 story character rigs + visual-only effects.
 * Shares a single unified logical coordinate matrix (`StoryCupStageMatrix`) with the interactive SVG stage:
 * - Desktop (`>640px`): 1600x900 layers mapped 1:1 to `viewBox="0 0 420 220"` (`aspect-[420/220]`).
 * - Mobile (`<=640px`): 900x1600 layers mapped 1:1 to `viewBox="0 0 420 747"` (`aspect-[9/16]`), zero `object-cover` clipping.
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
  stageMatrix: externalMatrix,
}) => {
  const internalMatrix = useStoryCupStageMatrix();
  const stageMatrix = externalMatrix ?? internalMatrix;
  const isMobileStage = stageMatrix.mode === 'mobile';

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

  const activeSpeaker = resolveActiveStorySpeaker({
    playbackStatus: narrationSession.playbackStatus,
    activeHotspotId,
    selectedSceneActionId,
  });

  const tiaotiaoState = resolveStoryCharacterVisualState({
    characterId: 'tiaotiao_story_squirrel',
    playbackStatus: narrationSession.playbackStatus,
    selectedSceneActionId,
    hasAllRequiredEvidence,
    isGoalCompleted,
    activeHotspotId,
    cupPosition,
    isBlinkTick,
    prefersReducedMotion,
  });

  const pupuState = resolveStoryCharacterVisualState({
    characterId: 'pupu_story_elephant',
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

  const fxPositionClass = isMobileStage
    ? 'absolute left-0 right-0 top-[28%] h-[58%] w-full pointer-events-none'
    : 'absolute inset-0 w-full h-full pointer-events-none';

  return (
    <div
      data-testid="v2-story-cup-art-backdrop"
      data-art-director-gate="ART_DIRECTOR_QA_HOLD"
      data-engineering-status="ENGINEERING_AUDIT_HOLD"
      data-stage-mode={stageMatrix.mode}
      data-stage-viewbox={stageMatrix.svgViewBox}
      data-tabletop-y-range={`${stageMatrix.tabletopSurfaceYRange[0]}..${stageMatrix.tabletopSurfaceYRange[1]}`}
      data-tabletop-oval-cy={String(stageMatrix.tabletopOvalCenterY)}
      data-active-story-speaker={activeSpeaker}
      data-tiaotiao-state={tiaotiaoState}
      data-pupu-state={pupuState}
      data-actor-state={
        tiaotiaoState === 'talk'
          ? 'tiaotiao_talk'
          : pupuState === 'talk'
            ? 'pupu_talk'
            : tiaotiaoState
      }
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

      {/* 5 Independent Responsive Layers mapped 1:1 into the unified stage coordinate frame (zero object-cover clipping) */}
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
            data-active-source-mode={stageMatrix.mode}
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ zIndex: index + 1 }}
          >
            <source media="(max-width: 640px)" srcSet={layer.mobileWebp} type="image/webp" />
            <source media="(max-width: 640px)" srcSet={layer.mobilePng} type="image/png" />
            <source media="(min-width: 641px)" srcSet={layer.desktopWebp} type="image/webp" />
            <img
              src={isMobileStage ? layer.mobilePng : layer.desktopPng}
              alt=""
              draggable={false}
              className="w-full h-full object-fill pointer-events-none"
            />
          </picture>
        );
      })}

      {/* Visual-only Effects (04_EFFECTS) */}
      {showSpotlight && (
        <picture
          data-testid="v2-story-cup-fx-spotlight"
          className={`${fxPositionClass} opacity-80`}
          style={{ zIndex: 6 }}
        >
          <source srcSet={STORY_CUP_EFFECTS.inspectionSpotlight.webp} type="image/webp" />
          <img
            src={STORY_CUP_EFFECTS.inspectionSpotlight.svg}
            alt=""
            draggable={false}
            className="w-full h-full object-contain pointer-events-none"
          />
        </picture>
      )}

      {showComparisonRibbon && (
        <picture
          data-testid="v2-story-cup-fx-ribbon"
          className={`${fxPositionClass} opacity-90`}
          style={{ zIndex: 7 }}
        >
          <source srcSet={STORY_CUP_EFFECTS.comparisonRibbon.webp} type="image/webp" />
          <img
            src={STORY_CUP_EFFECTS.comparisonRibbon.svg}
            alt=""
            draggable={false}
            className="w-full h-full object-contain pointer-events-none"
          />
        </picture>
      )}

      {showSparkles && !prefersReducedMotion && (
        <picture
          data-testid="v2-story-cup-fx-sparkles"
          className={fxPositionClass}
          style={{ zIndex: 8, animation: 'al-cup-shimmer 1.2s ease-in-out infinite' }}
        >
          <source srcSet={STORY_CUP_EFFECTS.observationSparkles.webp} type="image/webp" />
          <img
            src={STORY_CUP_EFFECTS.observationSparkles.svg}
            alt=""
            draggable={false}
            className="w-full h-full object-contain pointer-events-none"
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
          state={tiaotiaoState}
          prefersReducedMotion={prefersReducedMotion}
          isVoicePaused={isVoicePaused}
          className={
            isMobileStage
              ? 'absolute left-[4%] bottom-[31%] w-[30%] max-w-[132px]'
              : 'absolute left-[3%] bottom-[14%] w-[19%] max-w-[120px]'
          }
        />
        <StoryCharacterRigV2
          characterId="pupu_story_elephant"
          displayName="小象噗噗（故事角色）"
          state={pupuState}
          prefersReducedMotion={prefersReducedMotion}
          isVoicePaused={isVoicePaused}
          className={
            isMobileStage
              ? 'absolute right-[4%] bottom-[31%] w-[32%] max-w-[140px]'
              : 'absolute right-[3%] bottom-[14%] w-[21%] max-w-[130px]'
          }
        />
      </div>
    </div>
  );
};

export interface StoryCupLayerControlBarV2Props {
  enabledLayers: Record<SceneLayerId, boolean>;
  onToggleLayer: (id: SceneLayerId) => void;
  onResetLayers: () => void;
  activeHotspotId?: string | null;
  selectedSceneActionId?: string | null;
  defaultOpen?: boolean;
}

/**
 * Reviewer / Engineering Debug Drawer (`StoryCupLayerControlBarV2`).
 * Default-closed (`defaultOpen = false`) so the 6-year-old child's primary play flow is clean and unobstructed.
 * Reviewers and automated Playwright checks can expand it via `data-testid="v2-story-cup-debug-drawer-toggle"`.
 */
export const StoryCupLayerControlBarV2: React.FC<StoryCupLayerControlBarV2Props> = ({
  enabledLayers,
  onToggleLayer,
  onResetLayers,
  activeHotspotId = null,
  selectedSceneActionId = null,
  defaultOpen = false,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(defaultOpen);
  const [narrationSession, setNarrationSession] = useState<NarrationSession>(() =>
    speechNarrator.getNarrationSession()
  );

  useEffect(() => {
    return speechNarrator.subscribe(() => {
      setNarrationSession({ ...speechNarrator.getNarrationSession() });
    });
  }, []);

  const activeSpeaker = resolveActiveStorySpeaker({
    playbackStatus: narrationSession.playbackStatus,
    activeHotspotId,
    selectedSceneActionId,
  });

  const visibleCount = STORY_CUP_SCENE_LAYERS.filter(
    (l) => enabledLayers[l.id] !== false
  ).length;

  return (
    <div
      data-testid="v2-story-cup-debug-drawer-container"
      data-drawer-open={isDrawerOpen ? 'true' : 'false'}
      className="pt-1"
    >
      <div className="flex items-center justify-end">
        <button
          type="button"
          data-testid="v2-story-cup-debug-drawer-toggle"
          aria-expanded={isDrawerOpen}
          aria-controls="v2-story-cup-pilot-inspector-panel"
          onClick={() => setIsDrawerOpen((prev) => !prev)}
          className="min-h-[56px] min-w-[56px] px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 border border-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <span>
            {isDrawerOpen
              ? '收起审阅调试抽屉 (QA Hold)'
              : `审阅/工程调试抽屉 (图层 ${visibleCount}/5 · QA Hold)`}
          </span>
        </button>
      </div>

      {isDrawerOpen && (
        <div
          id="v2-story-cup-pilot-inspector-panel"
          data-testid="v2-story-cup-pilot-inspector"
          className="mt-2 rounded-2xl bg-amber-950/90 text-amber-50 px-3 py-2.5 border border-amber-400/40 space-y-2"
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
              data-active-story-speaker={activeSpeaker}
              className="px-2 py-0.5 rounded-full bg-stone-800 text-amber-200 font-bold"
            >
              旁白：{narrationSession.companionId} · {narrationSession.playbackStatus} · 角色说话者：{activeSpeaker}（单人近似口型/其余倾听，非音素同步）
            </span>
          </div>

          {/* 5-Layer Toggle Controls for Gate 1 / Gate 3R Verification */}
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
      )}
    </div>
  );
};

