import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';
import { useReducedMotionPreference } from '../story-cup-pilot/StoryCupSceneArtV2';
import {
  type V2_3CalmLayerPart,
  type V2_3CalmState,
  type V2_3CompanionId,
  type V2_3CompanionRigState,
  V2_3_BATCH01_META,
  V2_3_CALM_LAYER_Z_ORDER,
  V2_3_COMPANION_NATIVE_CUTOUT_MAP,
  getCalmCornerLayers,
} from '../manifest/v2_3Batch01Manifest';
import {
  V2_3CompanionRigActor,
  V2_3ResilientSvgLayer,
  V2_3ReviewerDebugDrawer,
  useV2_3MediaLoadTracker,
} from '../adapters/V2_3LayerStageAdapter';

export interface CalmGroundingColorSpec {
  id: 'red' | 'yellow' | 'blue' | 'green';
  shortLabel: string;
  active: boolean;
  fill: string;
  stroke: string;
  onToggle: () => void;
}

export interface CalmCornerSceneArtV2Props {
  phase: 'inhale' | 'hold' | 'exhale' | 'rest';
  isPaused: boolean;
  theme?: 'grass' | 'bear' | 'balloon';
  onTogglePause: () => void;
  groundingItems: readonly CalmGroundingColorSpec[];
  forceEnableQaForTest?: boolean;
}

const CALM_LAYER_LABELS: Record<V2_3CalmLayerPart, string> = {
  room: 'L1 3D暮光灯笼林间静谧背景',
  breathing_visual: 'L2 3D呼吸光球与流光环层',
};

const PHASE_DISPLAY_LABELS: Record<'inhale' | 'hold' | 'exhale' | 'rest', string> = {
  inhale: '深深吸气',
  hold: '轻轻停住',
  exhale: '缓缓呼气',
  rest: '安心休息',
};

const COMPANION_CALM_SPECS: ReadonlyArray<{
  id: V2_3CompanionId;
  shortName: string;
  roleTitle: string;
  calmLine: string;
}> = [
  {
    id: 'guoguo_squirrel',
    shortName: '果果',
    roleTitle: '松鼠果果',
    calmLine: '跟着暖光球慢慢吸气，我陪你把小肚皮鼓起来。',
  },
  {
    id: 'beibei_otter',
    shortName: '贝贝',
    roleTitle: '水獭贝贝',
    calmLine: '听听林间溪水的声音，轻轻呼气，肩膀松下来啦。',
  },
  {
    id: 'tiantian_raccoon',
    shortName: '天天',
    roleTitle: '小浣熊天天',
    calmLine: '点一点溪边的三颗彩色宝石，看看房间里有什么颜色吧。',
  },
  {
    id: 'qiqi_deer',
    shortName: '奇奇',
    roleTitle: '小鹿奇奇',
    calmLine: '不着急、不比快，累了随时按一下呼吸球停下来休息。',
  },
];

export function resolveCalmCornerAssetState(
  phase: 'inhale' | 'hold' | 'exhale' | 'rest',
  isPaused: boolean
): V2_3CalmState {
  if (isPaused) return 'paused';
  if (phase === 'inhale' || phase === 'hold') return 'inhale';
  if (phase === 'exhale') return 'exhale';
  return 'rest';
}

export const CalmCornerSceneArtV2: React.FC<CalmCornerSceneArtV2Props> = ({
  phase,
  isPaused,
  theme = 'grass',
  onTogglePause,
  groundingItems,
  forceEnableQaForTest = false,
}) => {
  const appCtx = useApp();
  const personalization = appCtx?.personalization;
  const updatePersonalization = appCtx?.updatePersonalization;
  const prefersReducedMotion = useReducedMotionPreference();
  const companionId = (personalization?.companionId || 'guoguo_squirrel') as V2_3CompanionId;

  const [isMobileStage, setIsMobileStage] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 640;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobileStage(window.innerWidth <= 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [enabledLayers, setEnabledLayers] = useState<Record<V2_3CalmLayerPart, boolean>>({
    room: true,
    breathing_visual: true,
  });

  const calmAssetState = resolveCalmCornerAssetState(phase, isPaused);
  const layerRecords = useMemo(() => getCalmCornerLayers(calmAssetState), [calmAssetState]);
  const expectedList = useMemo(
    () => V2_3_CALM_LAYER_Z_ORDER.map((part) => layerRecords[part]),
    [layerRecords]
  );

  const { summary: mediaSummary, recordAssetEvent } = useV2_3MediaLoadTracker(
    `calm_corner:${calmAssetState}`,
    expectedList
  );

  const companionRigState: V2_3CompanionRigState =
    isPaused || phase === 'rest' || phase === 'exhale' ? 'comfort' : 'listening';

  const breathingScale =
    prefersReducedMotion || isPaused
      ? 1.0
      : phase === 'inhale' || phase === 'hold'
        ? 1.08
        : phase === 'exhale'
          ? 0.92
          : 1.0;

  const handleToggleLayer = (id: string) => {
    const part = id as V2_3CalmLayerPart;
    setEnabledLayers((prev) => ({
      ...prev,
      [part]: !prev[part],
    }));
  };

  const handleResetLayers = () => {
    setEnabledLayers({
      room: true,
      breathing_visual: true,
    });
  };

  const layerToggleSpecs = useMemo(
    () =>
      V2_3_CALM_LAYER_Z_ORDER.map((part) => ({
        id: part,
        label: CALM_LAYER_LABELS[part],
        record: layerRecords[part],
      })),
    [layerRecords]
  );

  const handleSvgKeyActivate = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  const handleSwitchCompanion = (spec: (typeof COMPANION_CALM_SPECS)[number]) => {
    sounds.playClick();
    if (typeof updatePersonalization === 'function') {
      updatePersonalization({ companionId: spec.id });
    } else {
      speechNarrator.syncWithCompanion(spec.id);
    }
    speechNarrator.speak(spec.calmLine);
  };

  const activeCompanionSpec =
    COMPANION_CALM_SPECS.find((c) => c.id === companionId) || COMPANION_CALM_SPECS[0];

  const foregroundCanopyUrl = isMobileStage
    ? '/visual-v2/batch01r-art/layers/calm_front_canopy_mobile.webp'
    : '/visual-v2/batch01r-art/layers/calm_front_canopy_desktop.webp';

  return (
    <div
      data-testid="v2-calm-corner-stage-wrapper"
      data-calm-asset-state={calmAssetState}
      data-breathing-phase={phase}
      data-is-paused={isPaused ? 'true' : 'false'}
      data-theme={theme}
      data-companion-id={companionId}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      data-artwork-status="ASSET_ARTWORK_BLOCKED"
      data-tech-preview="TECH_PREVIEW_NOT_ART_APPROVED"
      className="space-y-2.5"
    >
      {/* 4 Official Companions Switcher Bar (Twilight Sanctuary Lantern Bar) */}
      <div
        data-testid="v2-calm-companion-switcher"
        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-2xl bg-linear-to-r from-[#13384C] via-[#1B4D63] to-[#13384C] border-2 border-[#FDE68A]/85 shadow-md"
      >
        <span className="hidden sm:inline text-xs sm:text-sm font-black text-amber-100 shrink-0">
          平静伙伴：
        </span>
        <div className="grid grid-cols-4 gap-1.5 flex-1">
          {COMPANION_CALM_SPECS.map((spec) => {
            const isActive = companionId === spec.id;
            const cutout = V2_3_COMPANION_NATIVE_CUTOUT_MAP[spec.id];
            return (
              <button
                key={spec.id}
                type="button"
                data-testid={`v2-calm-switch-companion-${spec.id}`}
                aria-pressed={isActive}
                aria-label={`切换平静陪伴伙伴：${spec.roleTitle}`}
                onClick={() => handleSwitchCompanion(spec)}
                className={`min-h-[48px] sm:min-h-[56px] px-1.5 sm:px-2.5 py-1 rounded-xl flex items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-linear-to-b from-[#FFFBEB] to-[#FDE68A] border-[#F59E0B] text-[#78350F] shadow-sm font-black'
                    : 'bg-[#0F293A]/85 border-teal-400/50 text-teal-100 hover:bg-[#163C52] font-bold'
                }`}
              >
                <img
                  src={cutout.publicUrl}
                  alt=""
                  aria-hidden="true"
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-2xs shrink-0"
                />
                <span className="text-xs sm:text-sm whitespace-nowrap">{spec.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive 3D Twilight Forest & Lantern Sanctuary Stage (0% source crop: 896x1200 mobile portrait / 1376x768 desktop) */}
      <div
        data-testid="v2-calm-corner-stage"
        data-stage-layout={isMobileStage ? 'mobile-portrait-896x1200' : 'desktop-1376x768'}
        className={`relative w-full overflow-hidden rounded-3xl ring-4 ring-[#D97706] shadow-[0_16px_38px_rgba(8,47,73,0.45)] bg-[#0F293A] select-none ${
          isMobileStage ? 'aspect-[896/1200]' : 'aspect-[1376/768]'
        }`}
      >
        {/* 1. V2.3 High-Detail 3D Calm Sanctuary Layers (room -> breathing_visual) */}
        {V2_3_CALM_LAYER_Z_ORDER.map((part, idx) => {
          if (enabledLayers[part] === false) return null;
          const record = layerRecords[part];
          const isBreathingRing = part === 'breathing_visual';

          const style: React.CSSProperties = isBreathingRing
            ? {
                zIndex: idx + 1,
                transform: `scale(${breathingScale})`,
                transition:
                  prefersReducedMotion || isPaused
                    ? 'none'
                    : 'transform 1800ms ease-in-out',
              }
            : { zIndex: idx + 1 };

          return (
            <V2_3ResilientSvgLayer
              key={`${calmAssetState}-${part}`}
              record={record}
              isMobileStage={isMobileStage}
              testId={`v2-calm-layer-${part}`}
              style={style}
              onAssetMetric={recordAssetEvent}
            />
          );
        })}

        {/* 1b. Foreground RGBA Twilight Lantern Canopy Frame */}
        <img
          src={foregroundCanopyUrl}
          alt=""
          aria-hidden="true"
          data-testid="v2-calm-foreground-canopy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ zIndex: 3 }}
        />

        {/* 2. Theme & Pacing Status Pill (top-left, warm lantern badge) */}
        <div
          data-testid="v2-calm-status-pill"
          className="absolute top-3 left-3 z-10 px-3.5 py-1 rounded-full bg-[#FFFBEB]/95 border-2 border-[#D97706] shadow-sm text-xs font-black text-[#78350F] pointer-events-none flex items-center gap-1.5"
        >
          <span>
            {isPaused ? '已暂停呼吸节律' : PHASE_DISPLAY_LABELS[phase]} · 主题：
            {theme === 'bear' ? '呼吸小熊' : theme === 'balloon' ? '飞翔气球' : '绿草清风'}
          </span>
        </div>

        {/* 3. 3D Companion Cutout & Warm Lantern Speech Bubble on Bottom/Left Mossy Bank */}
        <div
          data-testid="v2-calm-companion-slot"
          className={`absolute left-2.5 bottom-2.5 z-10 pointer-events-none flex items-end gap-2 ${
            isMobileStage ? 'right-2.5 max-w-[94%]' : 'max-w-[38%]'
          }`}
        >
          <V2_3CompanionRigActor
            companionId={companionId}
            state={companionRigState}
            prefersReducedMotion={prefersReducedMotion}
            testIdPrefix="v2-calm-companion-rig"
            className={isMobileStage ? 'w-19 h-23 shrink-0' : 'w-26 h-32 shrink-0'}
          />
          <div
            data-testid="v2-calm-companion-speech-bubble"
            className="mb-1.5 px-3 py-2 rounded-2xl bg-linear-to-b from-[#FFFDF7]/95 to-[#FEF3C7]/95 border-2 border-[#D97706] shadow-md text-left min-w-0"
          >
            <div className="text-[11px] font-black text-[#B45309]">
              {activeCompanionSpec.roleTitle}
            </div>
            <p className="text-xs font-extrabold text-[#451A03] leading-snug line-clamp-2">
              {activeCompanionSpec.calmLine}
            </p>
          </div>
        </div>

        {/* 4. Single Unified Interactive SVG Breathing Orb & 3-Color Grounding Gems (>= 56x56 CSS px) */}
        <svg
          data-testid="v2-calm-interactive-svg"
          viewBox={isMobileStage ? '0 0 448 600' : '0 0 1376 768'}
          className="absolute inset-0 w-full h-full z-20 pointer-events-auto"
          aria-label="绿草平静角可交互呼吸与颜色接地舞台"
        >
          {isMobileStage ? (
            <>
              {/* Central Breathing Orb Target on Mobile (448x600, exact 1:2 of 896x1200): coaxially centered at (224, 220) matching L2 halo (448, 440) */}
              <g
                data-testid="v2-calm-svg-breathe-orb"
                role="button"
                tabIndex={0}
                aria-label={
                  isPaused
                    ? '舞台中央呼吸球：点击或按回车继续呼吸引导'
                    : '舞台中央呼吸球：点击或按回车暂停呼吸引导'
                }
                aria-pressed={isPaused}
                onClick={onTogglePause}
                onKeyDown={(e) => handleSvgKeyActivate(e, onTogglePause)}
                className="v2-story-svg-focusable cursor-pointer"
              >
                <rect
                  x={140}
                  y={136}
                  width={168}
                  height={168}
                  rx={84}
                  fill={isPaused ? '#FEF3C7' : '#CCFBF1'}
                  fillOpacity={0.28}
                  stroke={isPaused ? '#F59E0B' : '#2DD4BF'}
                  strokeWidth={4.5}
                />
                <rect
                  x={150}
                  y={246}
                  width={148}
                  height={46}
                  rx={23}
                  fill="#FFFBEB"
                  fillOpacity={0.95}
                  stroke="#D97706"
                  strokeWidth={3}
                />
                <text
                  x={224}
                  y={275}
                  textAnchor="middle"
                  fill="#78350F"
                  fontSize="17"
                  fontWeight="900"
                >
                  {isPaused ? '▶ 点击继续' : `⏸ ${PHASE_DISPLAY_LABELS[phase]}`}
                </text>
              </g>

              {/* 3 Grounding Color Gems on Mobile (y=344..436): each 130x92 SVG units (>= 89x63 CSS px at 360px viewport), non-overlapping with bottom companion deck (y=450..588) */}
              {groundingItems.map((item, idx) => {
                const x = 18 + idx * 141;
                const y = 344;
                return (
                  <g
                    key={item.id}
                    data-testid={`v2-calm-svg-color-${item.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`舞台颜色接地石：${item.shortLabel}${
                      item.active ? '（已找到）' : '（点击标记找到）'
                    }`}
                    aria-pressed={item.active}
                    onClick={item.onToggle}
                    onKeyDown={(e) => handleSvgKeyActivate(e, item.onToggle)}
                    className="v2-story-svg-focusable cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={130}
                      height={92}
                      rx={24}
                      fill={item.fill}
                      fillOpacity={item.active ? 0.97 : 0.88}
                      stroke={item.active ? '#F59E0B' : item.stroke}
                      strokeWidth={item.active ? 4.5 : 2.5}
                    />
                    <text
                      x={x + 65}
                      y={y + 53}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize="19"
                      fontWeight="900"
                    >
                      {item.active ? `✓ ${item.shortLabel}` : item.shortLabel}
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            <>
              {/* Central Breathing Orb Target on Desktop (1376x768): coaxially centered at (688, 320) matching L2 halo (688, 320) */}
              <g
                data-testid="v2-calm-svg-breathe-orb"
                role="button"
                tabIndex={0}
                aria-label={
                  isPaused
                    ? '舞台中央呼吸球：点击或按回车继续呼吸引导'
                    : '舞台中央呼吸球：点击或按回车暂停呼吸引导'
                }
                aria-pressed={isPaused}
                onClick={onTogglePause}
                onKeyDown={(e) => handleSvgKeyActivate(e, onTogglePause)}
                className="v2-story-svg-focusable cursor-pointer"
              >
                <rect
                  x={548}
                  y={180}
                  width={280}
                  height={280}
                  rx={140}
                  fill={isPaused ? '#FEF3C7' : '#CCFBF1'}
                  fillOpacity={0.22}
                  stroke={isPaused ? '#F59E0B' : '#2DD4BF'}
                  strokeWidth={6}
                />
                <rect
                  x={563}
                  y={376}
                  width={250}
                  height={68}
                  rx={34}
                  fill="#FFFBEB"
                  fillOpacity={0.95}
                  stroke="#D97706"
                  strokeWidth={4}
                />
                <text
                  x={688}
                  y={420}
                  textAnchor="middle"
                  fill="#78350F"
                  fontSize="30"
                  fontWeight="900"
                >
                  {isPaused ? '▶ 点击继续呼吸' : `⏸ ${PHASE_DISPLAY_LABELS[phase]}`}
                </text>
              </g>

              {/* 3 Grounding Color Gems on Desktop (bottom-right): each 232x148 SVG units (>= 116x74 CSS px at 768px..1440px) */}
              {groundingItems.map((item, idx) => {
                const x = 588 + idx * 252;
                const y = 588;
                return (
                  <g
                    key={item.id}
                    data-testid={`v2-calm-svg-color-${item.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`舞台颜色接地石：${item.shortLabel}${
                      item.active ? '（已找到）' : '（点击标记找到）'
                    }`}
                    aria-pressed={item.active}
                    onClick={item.onToggle}
                    onKeyDown={(e) => handleSvgKeyActivate(e, item.onToggle)}
                    className="v2-story-svg-focusable cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={232}
                      height={148}
                      rx={32}
                      fill={item.fill}
                      fillOpacity={item.active ? 0.97 : 0.88}
                      stroke={item.active ? '#F59E0B' : item.stroke}
                      strokeWidth={item.active ? 6 : 3.5}
                    />
                    <text
                      x={x + 116}
                      y={y + 84}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize="30"
                      fontWeight="900"
                    >
                      {item.active ? `✓ ${item.shortLabel}` : item.shortLabel}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>
      </div>

      {/* 5. QA Hold Reviewer Drawer — strictly hidden in normal child UI, shown only with ?qa=1 */}
      <V2_3ReviewerDebugDrawer
        sceneKey="calm_corner"
        sceneTitle="V2.3 Batch01R 绿草平静角视觉纠偏样板"
        activeStateLabel={`${calmAssetState} (phase=${phase}, paused=${isPaused})`}
        companionId={companionId}
        companionState={companionRigState}
        layers={layerToggleSpecs}
        enabledLayers={enabledLayers}
        onToggleLayer={handleToggleLayer}
        onResetLayers={handleResetLayers}
        mediaSummary={mediaSummary}
        geometryDisclosure={V2_3_BATCH01_META.geometrySharingDisclosures.calmCorner}
        testIdPrefix="v2-calm"
        forceEnableQaForTest={forceEnableQaForTest}
      />
    </div>
  );
};
