import React from 'react';
import './motion/asset_interaction_motion.css';

/**
 * A-LAND V2, illustrative layer only. All state and event semantics remain
 * owned by the existing A-LAND components; these controls do NOT persist data.
 * Assets are served from public/visual-v2/assets/.
 */
export const BASE = '/visual-v2/assets' as const;

export const COMPANION_IDS = [
  'guoguo_squirrel',
  'beibei_otter',
  'tiantian_raccoon',
  'qiqi_deer',
] as const;
export type CompanionId = (typeof COMPANION_IDS)[number];

export const LANDMARK_IDS = [
  'story_grove',
  'tools_room',
  'courage_house',
  'weather_station',
  'calm_corner',
  'two_homes_bridge',
  'starlight_cabin',
  'difficulty_breaker',
] as const;
export type LandmarkId = (typeof LANDMARK_IDS)[number];

export const WEATHER_PROP_IDS = ['sunny', 'calm', 'sad', 'angry', 'scared'] as const;
export type WeatherPropId = (typeof WEATHER_PROP_IDS)[number];

export const TOOL_PROP_IDS = [
  'binoculars',
  'two_sided_coin',
  'balance_scale',
  'weather_clouds',
] as const;
export type ToolPropId = (typeof TOOL_PROP_IDS)[number];

export const EFFECT_IDS = ['sparkle', 'ripple', 'leaf', 'heart', 'book'] as const;
export type EffectId = (typeof EFFECT_IDS)[number];

export type MotionState = 'idle' | 'greeting' | 'listening' | 'celebrate';

export const spriteUrl = (companion: CompanionId, state: MotionState = 'idle') =>
  `${BASE}/characters/${companion}/motion_${state}.webp`;

export const nativeCompanionUrl = (companion: CompanionId) =>
  `${BASE}/characters/${companion}/idle_native.webp`;

export const nativeCompanionPngUrl = (companion: CompanionId) =>
  `${BASE}/characters/${companion}/idle_native.png`;

export const landmarkUrl = (landmark: LandmarkId) =>
  `${BASE}/landmarks/${landmark}/idle_native.webp`;

export const landmarkPngUrl = (landmark: LandmarkId) =>
  `${BASE}/landmarks/${landmark}/idle_native.png`;

export const sceneBackplateUrl = (landmark: LandmarkId) =>
  `${BASE}/scenes/${landmark}_scene_backplate.svg`;

export const weatherPropUrl = (prop: WeatherPropId) =>
  `${BASE}/props/weather/${prop}/native.webp`;

export const toolPropUrl = (prop: ToolPropId) =>
  `${BASE}/props/tools/${prop}/native.webp`;

export const effectSvgUrl = (effect: EffectId) =>
  `${BASE}/effects/${effect}.svg`;

export const MAP_LABELS: Record<LandmarkId, string> = {
  story_grove: '故事林',
  tools_room: '想法侦探社',
  courage_house: '勇气说话屋',
  weather_station: '情绪天气站',
  calm_corner: '绿草平静角',
  two_homes_bridge: '两个家的桥',
  starlight_cabin: '星光小屋',
  difficulty_breaker: '大困难拆解台',
};

export function VisualCharacter({
  companion,
  motion = 'idle',
  reducedMotion = false,
  className = '',
  onClick,
  alt,
}: {
  companion: CompanionId;
  motion?: MotionState;
  reducedMotion?: boolean;
  className?: string;
  onClick?: () => void;
  alt?: string;
}) {
  const src = reducedMotion ? nativeCompanionUrl(companion) : spriteUrl(companion, motion);
  return (
    <img
      src={src}
      data-motion={reducedMotion ? 'idle' : motion}
      data-companion={companion}
      alt={alt ?? `${companion}的视觉角色动效`}
      className={`aland-actor ${className}`}
      onClick={onClick}
    />
  );
}

export function VisualLandmark({
  id,
  onActivate,
  className = '',
  subtitle,
  badge,
  style,
  testId,
}: {
  id: LandmarkId;
  onActivate: (id: LandmarkId) => void;
  className?: string;
  subtitle?: string;
  badge?: string;
  style?: React.CSSProperties;
  testId?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId ?? `v2-landmark-${id}`}
      data-landmark-id={id}
      style={style}
      className={className}
      onClick={() => onActivate(id)}
      aria-label={`前往${MAP_LABELS[id]}${subtitle ? `：${subtitle}` : ''}`}
    >
      <img src={landmarkUrl(id)} alt="" className="pointer-events-none select-none" />
      <span className="v2-landmark-title">{MAP_LABELS[id]}</span>
      {badge && <span className="v2-landmark-badge">{badge}</span>}
    </button>
  );
}

/** For background parallax; SVGs intentionally supply no interactive labels. */
export function IslandBackdropLayers({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-testid="v2-island-backdrop-layers"
      className={`aland-scene-layers ${className}`}
    >
      {[
        '01_sky.svg',
        '02_distant_ocean.svg',
        '03_island_ground.svg',
        '04_foreground_boardwalk.svg',
      ].map((name, i) => (
        <img
          key={name}
          data-testid={`v2-island-layer-${i + 1}`}
          data-depth={i}
          alt=""
          src={`${BASE}/scenes/${name}`}
        />
      ))}
    </div>
  );
}
