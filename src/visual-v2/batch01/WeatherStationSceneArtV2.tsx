import React, { useEffect, useMemo, useState } from 'react';
import type { WeatherType } from '../../types';
import { useApp } from '../../context/AppContext';
import { useReducedMotionPreference } from '../story-cup-pilot/StoryCupSceneArtV2';
import {
  type V2_3CompanionId,
  type V2_3CompanionRigState,
  type V2_3WeatherLayerPart,
  type V2_3WeatherState,
  V2_3_BATCH01_META,
  V2_3_WEATHER_LAYER_Z_ORDER,
  getWeatherStationLayers,
} from '../manifest/v2_3Batch01Manifest';
import {
  V2_3CompanionRigActor,
  V2_3ResilientSvgLayer,
  V2_3ReviewerDebugDrawer,
  useV2_3MediaLoadTracker,
} from '../adapters/V2_3LayerStageAdapter';

export interface WeatherStationSceneArtV2Props {
  step: 'camera' | 'select' | 'heavyHolding';
  selectedPrimary: WeatherType;
  selectedSecondary: WeatherType | null;
  allowDualWeather: boolean;
  intensity: number;
  bodySensations: string[];
  onSelectPrimary: (weather: WeatherType) => void;
  onToggleBodySensation: (label: string) => void;
}

const WEATHER_LABELS: Record<V2_3WeatherState, string> = {
  sunny: '晴天',
  cloudy: '阴天',
  rainy: '雨天',
  stormy: '雷雨',
  foggy: '雾天',
  opt_out: '我不想选',
};

const WEATHER_LAYER_LABELS: Record<V2_3WeatherLayerPart, string> = {
  backplate: 'L1 天空环境背板',
  weather_actor: 'L2 气象主体层',
  front_effect: 'L3 前景气象粒子',
};

const WEATHER_TOKEN_SPECS: ReadonlyArray<{
  type: V2_3WeatherState;
  shortLabel: string;
  fill: string;
  stroke: string;
}> = [
  { type: 'sunny', shortLabel: '晴', fill: '#FEF3C7', stroke: '#F59E0B' },
  { type: 'cloudy', shortLabel: '阴', fill: '#F1F5F9', stroke: '#64748B' },
  { type: 'rainy', shortLabel: '雨', fill: '#E0F2FE', stroke: '#0284C7' },
  { type: 'stormy', shortLabel: '雷', fill: '#EDE9FE', stroke: '#7C3AED' },
  { type: 'foggy', shortLabel: '雾', fill: '#D1FAE5', stroke: '#059669' },
  { type: 'opt_out', shortLabel: '不选', fill: '#F5F5F4', stroke: '#78716C' },
];

export const WeatherStationSceneArtV2: React.FC<WeatherStationSceneArtV2Props> = ({
  step,
  selectedPrimary,
  selectedSecondary,
  allowDualWeather,
  intensity,
  bodySensations,
  onSelectPrimary,
  onToggleBodySensation,
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

  const [enabledLayers, setEnabledLayers] = useState<Record<V2_3WeatherLayerPart, boolean>>({
    backplate: true,
    weather_actor: true,
    front_effect: true,
  });

  const weatherState = (selectedPrimary || 'sunny') as V2_3WeatherState;
  const layerRecords = useMemo(() => getWeatherStationLayers(weatherState), [weatherState]);
  const expectedList = useMemo(
    () => V2_3_WEATHER_LAYER_Z_ORDER.map((part) => layerRecords[part]),
    [layerRecords]
  );

  const { summary: mediaSummary, recordAssetEvent } = useV2_3MediaLoadTracker(
    `weather_station:${weatherState}`,
    expectedList
  );

  const companionRigState: V2_3CompanionRigState =
    step === 'heavyHolding' || weatherState === 'opt_out'
      ? 'comfort'
      : step === 'camera'
        ? 'greeting'
        : intensity >= 5
          ? 'thinking'
          : 'listening';

  const intensityScale = intensity >= 5 ? 1.12 : intensity >= 3 ? 1.0 : 0.9;

  const handleToggleLayer = (id: string) => {
    const part = id as V2_3WeatherLayerPart;
    setEnabledLayers((prev) => ({
      ...prev,
      [part]: !prev[part],
    }));
  };

  const handleResetLayers = () => {
    setEnabledLayers({
      backplate: true,
      weather_actor: true,
      front_effect: true,
    });
  };

  const layerToggleSpecs = useMemo(
    () =>
      V2_3_WEATHER_LAYER_Z_ORDER.map((part) => ({
        id: part,
        label: WEATHER_LAYER_LABELS[part],
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
      data-testid="v2-weather-station-stage-wrapper"
      data-weather-state={weatherState}
      data-weather-step={step}
      data-intensity={intensity}
      data-dual-weather={allowDualWeather && selectedSecondary ? selectedSecondary : 'none'}
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      data-tech-preview="TECH_PREVIEW_NOT_ART_APPROVED"
      className="space-y-1.5"
    >
      {/* Responsive Layered Stage Container */}
      <div
        data-testid="v2-weather-station-stage"
        data-stage-layout={isMobileStage ? 'mobile-4x3' : 'desktop-16x9'}
        className={`relative w-full overflow-hidden rounded-3xl border-2 border-sky-300/90 shadow-md bg-sky-950/20 select-none ${
          isMobileStage ? 'aspect-[420/340]' : 'aspect-[16/9]'
        }`}
      >
        {/* 1. V2.3 Environment SVG Layers (backplate -> weather_actor -> front_effect) */}
        {V2_3_WEATHER_LAYER_Z_ORDER.map((part, idx) => {
          if (enabledLayers[part] === false) return null;
          const record = layerRecords[part];
          const isActor = part === 'weather_actor';
          const isFront = part === 'front_effect';

          const transformStyle: React.CSSProperties =
            isActor && !prefersReducedMotion
              ? {
                  zIndex: idx + 1,
                  transform: `scale(${intensityScale})`,
                  transition: 'transform 400ms ease-out',
                }
              : {
                  zIndex: idx + 1,
                  opacity: isFront && intensity === 1 ? 0.65 : 1,
                };

          return (
            <V2_3ResilientSvgLayer
              key={`${weatherState}-${part}`}
              record={record}
              testId={`v2-weather-layer-${part}`}
              style={transformStyle}
              onAssetMetric={recordAssetEvent}
            />
          );
        })}

        {/* 2. State-Driven Visual Differentiation for Shared-Geometry Fixtures (foggy & opt_out) */}
        {weatherState === 'foggy' && (
          <div
            data-testid="v2-weather-fog-overlay"
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 4 }}
          >
            <div className="absolute inset-x-0 top-[18%] h-12 bg-white/55 blur-md" />
            <div className="absolute inset-x-0 top-[46%] h-16 bg-emerald-50/65 blur-md" />
            <div className="absolute inset-x-0 bottom-[12%] h-14 bg-white/60 blur-sm" />
          </div>
        )}

        {weatherState === 'opt_out' && (
          <div
            data-testid="v2-weather-optout-veil"
            aria-hidden="true"
            className="absolute inset-0 bg-stone-900/25 backdrop-blur-[1px] pointer-events-none flex items-center justify-center"
            style={{ zIndex: 4 }}
          >
            <span className="px-3.5 py-1 rounded-full bg-white/90 text-stone-800 text-xs font-extrabold shadow-xs border border-stone-300">
              安静休息中 · 今天不挑天气也没关系
            </span>
          </div>
        )}

        {/* 3. Secondary Dual-Weather Visual Indicator */}
        {allowDualWeather && selectedSecondary && (
          <div
            data-testid="v2-weather-secondary-badge"
            data-secondary-weather={selectedSecondary}
            className="absolute top-2.5 left-2.5 z-10 px-3 py-1 rounded-full bg-white/92 border-2 border-sky-300 shadow-xs text-xs font-black text-sky-950 pointer-events-none flex items-center gap-1.5"
          >
            <span>双天气并存：{WEATHER_LABELS[weatherState]} + {WEATHER_LABELS[selectedSecondary as V2_3WeatherState]}</span>
          </div>
        )}

        {/* 4. Active Body Sensation Pill Strip on Stage (non-blocking visual feedback) */}
        {bodySensations.length > 0 && weatherState !== 'opt_out' && (
          <div
            data-testid="v2-weather-stage-sensations"
            className="absolute top-2.5 right-2.5 z-10 max-w-[62%] flex flex-wrap justify-end gap-1 pointer-events-none"
          >
            {bodySensations.map((sensation) => (
              <span
                key={sensation}
                className="px-2 py-0.5 rounded-full bg-amber-100/95 border border-amber-400 text-[11px] font-black text-amber-950 shadow-2xs"
              >
                {sensation}
              </span>
            ))}
          </div>
        )}

        {/* 5. V2.3 7-Part Companion Rig Actor (4 official companions only) */}
        <div
          data-testid="v2-weather-companion-slot"
          className="absolute left-2.5 bottom-2 z-10 pointer-events-none"
        >
          <V2_3CompanionRigActor
            companionId={companionId}
            state={companionRigState}
            prefersReducedMotion={prefersReducedMotion}
            testIdPrefix="v2-weather-companion-rig"
            className={isMobileStage ? 'w-20 h-25' : 'w-26 h-32'}
          />
        </div>

        {/* 6. Interactive SVG Stage Targets (Keyboard Focusable .v2-story-svg-focusable >= 56x56 CSS px) */}
        <svg
          data-testid="v2-weather-interactive-svg"
          viewBox={isMobileStage ? '0 0 420 340' : '0 0 1200 675'}
          className="absolute inset-0 w-full h-full z-20 pointer-events-auto"
          aria-label="情绪天气站可交互舞台热区"
        >
          {isMobileStage ? (
            <>
              {/* Mobile 420x340 coordinate system: 3x2 weather quick-tokens on right/bottom-right, each 88x86 SVG units (>= 60x59 CSS px at 360px viewport) */}
              {WEATHER_TOKEN_SPECS.map((spec, index) => {
                const col = index % 3;
                const row = Math.floor(index / 3);
                const x = 128 + col * 94;
                const y = 148 + row * 92;
                const isSelected = weatherState === spec.type;
                return (
                  <g
                    key={spec.type}
                    data-testid={`v2-weather-svg-token-${spec.type}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`舞台快捷切换天气：${WEATHER_LABELS[spec.type]}`}
                    aria-pressed={isSelected}
                    onClick={() => onSelectPrimary(spec.type)}
                    onKeyDown={(e) => handleSvgKeyActivate(e, () => onSelectPrimary(spec.type))}
                    className="v2-story-svg-focusable cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={88}
                      height={86}
                      rx={18}
                      fill={spec.fill}
                      fillOpacity={isSelected ? 0.96 : 0.82}
                      stroke={isSelected ? '#0284C7' : spec.stroke}
                      strokeWidth={isSelected ? 4 : 2.5}
                    />
                    <text
                      x={x + 44}
                      y={y + 50}
                      textAnchor="middle"
                      fill="#1E293B"
                      fontSize="20"
                      fontWeight="900"
                    >
                      {spec.shortLabel}
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            <>
              {/* Desktop/Tablet 1200x675 coordinate system: 6 weather sky orbs along bottom-right, each 156x146 SVG units (>= 64x60 CSS px) */}
              {WEATHER_TOKEN_SPECS.map((spec, index) => {
                const x = 210 + index * 160;
                const y = 505;
                const isSelected = weatherState === spec.type;
                return (
                  <g
                    key={spec.type}
                    data-testid={`v2-weather-svg-token-${spec.type}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`舞台快捷切换天气：${WEATHER_LABELS[spec.type]}`}
                    aria-pressed={isSelected}
                    onClick={() => onSelectPrimary(spec.type)}
                    onKeyDown={(e) => handleSvgKeyActivate(e, () => onSelectPrimary(spec.type))}
                    className="v2-story-svg-focusable cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={150}
                      height={144}
                      rx={28}
                      fill={spec.fill}
                      fillOpacity={isSelected ? 0.96 : 0.84}
                      stroke={isSelected ? '#0284C7' : spec.stroke}
                      strokeWidth={isSelected ? 6 : 3.5}
                    />
                    <text
                      x={x + 75}
                      y={y + 84}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize="34"
                      fontWeight="900"
                    >
                      {spec.shortLabel}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>
      </div>

      {/* 7. Default-Collapsed Engineering / QA Hold Reviewer Drawer */}
      <V2_3ReviewerDebugDrawer
        sceneKey="weather_station"
        sceneTitle="V2.3 情绪天气站样板"
        activeStateLabel={`${WEATHER_LABELS[weatherState]} (step=${step}, intensity=${intensity})`}
        companionId={companionId}
        companionState={companionRigState}
        layers={layerToggleSpecs}
        enabledLayers={enabledLayers}
        onToggleLayer={handleToggleLayer}
        onResetLayers={handleResetLayers}
        mediaSummary={mediaSummary}
        geometryDisclosure={V2_3_BATCH01_META.geometrySharingDisclosures.weatherStation}
        testIdPrefix="v2-weather"
      />
    </div>
  );
};
