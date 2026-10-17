import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useReducedMotionPreference } from '../story-cup-pilot/StoryCupSceneArtV2';
import {
  type V2_3CalmLayerPart,
  type V2_3CalmState,
  type V2_3CompanionId,
  type V2_3CompanionRigState,
  V2_3_BATCH01_META,
  V2_3_CALM_LAYER_Z_ORDER,
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
}

const CALM_LAYER_LABELS: Record<V2_3CalmLayerPart, string> = {
  room: 'L1 绿草空间环境层',
  breathing_visual: 'L2 呼吸引导光环层',
};

const PHASE_DISPLAY_LABELS: Record<'inhale' | 'hold' | 'exhale' | 'rest', string> = {
  inhale: '吸气中',
  hold: '轻停中',
  exhale: '呼气中',
  rest: '休息中',
};

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
}) => {
  const { personalization } = useApp();
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
        ? 1.15
        : phase === 'exhale'
          ? 0.88
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

  return (
    <div
      data-testid="v2-calm-corner-stage-wrapper"
      data-calm-asset-state={calmAssetState}
      data-breathing-phase={phase}
      data-is-paused={isPaused ? 'true' : 'false'}
      data-theme={theme}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      data-tech-preview="TECH_PREVIEW_NOT_ART_APPROVED"
      className="space-y-1.5"
    >
      {/* Responsive Layered Stage Container */}
      <div
        data-testid="v2-calm-corner-stage"
        data-stage-layout={isMobileStage ? 'mobile-4x3' : 'desktop-16x9'}
        className={`relative w-full overflow-hidden rounded-3xl border-2 border-teal-300/90 shadow-md bg-teal-950/20 select-none ${
          isMobileStage ? 'aspect-[420/340]' : 'aspect-[16/9]'
        }`}
      >
        {/* 1. V2.3 Calm Corner SVG Layers (room -> breathing_visual) */}
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
              testId={`v2-calm-layer-${part}`}
              style={style}
              onAssetMetric={recordAssetEvent}
            />
          );
        })}

        {/* 2. Theme & Pacing Status Pill (top-left, non-blocking) */}
        <div
          data-testid="v2-calm-status-pill"
          className="absolute top-2.5 left-2.5 z-10 px-3 py-1 rounded-full bg-white/90 border border-teal-300 shadow-2xs text-xs font-black text-teal-950 pointer-events-none flex items-center gap-1.5"
        >
          <span>
            {isPaused ? '已暂停呼吸节律' : PHASE_DISPLAY_LABELS[phase]} · 主题：{theme === 'bear' ? '呼吸伙伴' : theme === 'balloon' ? '飞翔气球' : '绿草清风'}
          </span>
        </div>

        {/* 3. V2.3 7-Part Companion Rig Actor (4 official companions only) */}
        <div
          data-testid="v2-calm-companion-slot"
          className="absolute left-2.5 bottom-2 z-10 pointer-events-none"
        >
          <V2_3CompanionRigActor
            companionId={companionId}
            state={companionRigState}
            prefersReducedMotion={prefersReducedMotion}
            testIdPrefix="v2-calm-companion-rig"
            className={isMobileStage ? 'w-20 h-25' : 'w-26 h-32'}
          />
        </div>

        {/* 4. Interactive SVG Stage Targets (Keyboard Focusable .v2-story-svg-focusable >= 56x56 CSS px) */}
        <svg
          data-testid="v2-calm-interactive-svg"
          viewBox={isMobileStage ? '0 0 420 340' : '0 0 1200 675'}
          className="absolute inset-0 w-full h-full z-20 pointer-events-auto"
          aria-label="绿草平静角可交互呼吸与颜色接地舞台"
        >
          {isMobileStage ? (
            <>
              {/* Central Breathing Orb Target on Mobile (420x340): 116x108 SVG units (>= 76x70 CSS px at 360px viewport) */}
              <g
                data-testid="v2-calm-svg-breathe-orb"
                role="button"
                tabIndex={0}
                aria-label={isPaused ? '舞台中央呼吸球：点击或按回车继续呼吸引导' : '舞台中央呼吸球：点击或按回车暂停呼吸引导'}
                aria-pressed={isPaused}
                onClick={onTogglePause}
                onKeyDown={(e) => handleSvgKeyActivate(e, onTogglePause)}
                className="v2-story-svg-focusable cursor-pointer"
              >
                <rect
                  x={152}
                  y={72}
                  width={116}
                  height={108}
                  rx={54}
                  fill={isPaused ? '#FEF3C7' : '#CCFBF1'}
                  fillOpacity={0.85}
                  stroke={isPaused ? '#D97706' : '#0D9488'}
                  strokeWidth={4}
                />
                <text
                  x={210}
                  y={122}
                  textAnchor="middle"
                  fill="#134E4A"
                  fontSize="17"
                  fontWeight="900"
                >
                  {isPaused ? '点击继续' : PHASE_DISPLAY_LABELS[phase]}
                </text>
                <text
                  x={210}
                  y={146}
                  textAnchor="middle"
                  fill="#0F766E"
                  fontSize="13"
                  fontWeight="700"
                >
                  {isPaused ? '已暂停' : '4-2-4-2 节律'}
                </text>
              </g>

              {/* 3 Grounding Color Stones on Mobile (bottom-right): each 98x96 SVG units (>= 58x57 CSS px at 360px viewport) */}
              {groundingItems.map((item, idx) => {
                const x = 110 + idx * 102;
                const y = 228;
                return (
                  <g
                    key={item.id}
                    data-testid={`v2-calm-svg-color-${item.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`舞台颜色接地石：${item.shortLabel}${item.active ? '（已找到）' : '（点击标记找到）'}`}
                    aria-pressed={item.active}
                    onClick={item.onToggle}
                    onKeyDown={(e) => handleSvgKeyActivate(e, item.onToggle)}
                    className="v2-story-svg-focusable cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={98}
                      height={96}
                      rx={20}
                      fill={item.fill}
                      fillOpacity={item.active ? 0.96 : 0.84}
                      stroke={item.active ? '#0284C7' : item.stroke}
                      strokeWidth={item.active ? 4.5 : 2.5}
                    />
                    <text
                      x={x + 49}
                      y={y + 54}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize="16"
                      fontWeight="900"
                    >
                      {item.active ? `✓${item.shortLabel}` : item.shortLabel}
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            <>
              {/* Central Breathing Orb Target on Desktop (1200x675): 240x200 SVG units (>= 100x84 CSS px) */}
              <g
                data-testid="v2-calm-svg-breathe-orb"
                role="button"
                tabIndex={0}
                aria-label={isPaused ? '舞台中央呼吸球：点击或按回车继续呼吸引导' : '舞台中央呼吸球：点击或按回车暂停呼吸引导'}
                aria-pressed={isPaused}
                onClick={onTogglePause}
                onKeyDown={(e) => handleSvgKeyActivate(e, onTogglePause)}
                className="v2-story-svg-focusable cursor-pointer"
              >
                <rect
                  x={480}
                  y={195}
                  width={240}
                  height={200}
                  rx={100}
                  fill={isPaused ? '#FEF3C7' : '#CCFBF1'}
                  fillOpacity={0.86}
                  stroke={isPaused ? '#D97706' : '#0D9488'}
                  strokeWidth={6}
                />
                <text
                  x={600}
                  y={285}
                  textAnchor="middle"
                  fill="#134E4A"
                  fontSize="32"
                  fontWeight="900"
                >
                  {isPaused ? '点击继续' : PHASE_DISPLAY_LABELS[phase]}
                </text>
                <text
                  x={600}
                  y={330}
                  textAnchor="middle"
                  fill="#0F766E"
                  fontSize="22"
                  fontWeight="700"
                >
                  {isPaused ? '已暂停节律' : '点按可暂停/继续'}
                </text>
              </g>

              {/* 3 Grounding Color Stones on Desktop (bottom-right): each 210x150 SVG units (>= 88x62 CSS px) */}
              {groundingItems.map((item, idx) => {
                const x = 420 + idx * 240;
                const y = 495;
                return (
                  <g
                    key={item.id}
                    data-testid={`v2-calm-svg-color-${item.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`舞台颜色接地石：${item.shortLabel}${item.active ? '（已找到）' : '（点击标记找到）'}`}
                    aria-pressed={item.active}
                    onClick={item.onToggle}
                    onKeyDown={(e) => handleSvgKeyActivate(e, item.onToggle)}
                    className="v2-story-svg-focusable cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={210}
                      height={150}
                      rx={30}
                      fill={item.fill}
                      fillOpacity={item.active ? 0.96 : 0.85}
                      stroke={item.active ? '#0284C7' : item.stroke}
                      strokeWidth={item.active ? 6 : 3.5}
                    />
                    <text
                      x={x + 105}
                      y={y + 86}
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

      {/* 5. Default-Collapsed Engineering / QA Hold Reviewer Drawer */}
      <V2_3ReviewerDebugDrawer
        sceneKey="calm_corner"
        sceneTitle="V2.3 绿草平静角样板"
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
      />
    </div>
  );
};
