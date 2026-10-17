import React, { useEffect, useMemo, useState } from 'react';
import type { WeatherType } from '../../types';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';
import { useReducedMotionPreference } from '../story-cup-pilot/StoryCupSceneArtV2';
import {
  type V2_3CompanionId,
  type V2_3CompanionRigState,
  type V2_3WeatherLayerPart,
  type V2_3WeatherState,
  V2_3_BATCH01_META,
  V2_3_COMPANION_NATIVE_CUTOUT_MAP,
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
  forceEnableQaForTest?: boolean;
}

const WEATHER_LABELS: Record<V2_3WeatherState, string> = {
  sunny: '晴天',
  cloudy: '阴天',
  rainy: '雨天',
  stormy: '雷雨',
  foggy: '雾天',
  opt_out: '我不想选',
};

const WEATHER_COMPANION_LINES: Record<V2_3WeatherState, string> = {
  sunny: '今天心里像暖洋洋的太阳，亮堂堂的真舒服！',
  cloudy: '天上有朵慢悠悠的云，有一点点心事也没关系。',
  rainy: '心里下起毛毛雨啦，我陪你撑把温暖的小伞。',
  stormy: '轰隆隆的雷雨好有力气，我在木屋阳台陪你等雨停。',
  foggy: '白茫茫的雾气看不清，我们先慢慢呼吸、稳稳站好。',
  opt_out: '今天不想挑天气也完全没关系，我们安安静静看海湾吧。',
};

const COMPANION_SPECS: ReadonlyArray<{
  id: V2_3CompanionId;
  shortName: string;
  roleTitle: string;
  greetingLine: string;
}> = [
  {
    id: 'guoguo_squirrel',
    shortName: '果果',
    roleTitle: '松鼠果果',
    greetingLine: '我是松鼠果果！今天你的心里是什么天气呢？',
  },
  {
    id: 'beibei_otter',
    shortName: '贝贝',
    roleTitle: '水獭贝贝',
    greetingLine: '我是水獭贝贝！不管晴天还是雨天，我都陪你听海浪。',
  },
  {
    id: 'tiantian_raccoon',
    shortName: '天天',
    roleTitle: '小浣熊天天',
    greetingLine: '我是小浣熊天天！用望远镜看看头顶的云朵吧。',
  },
  {
    id: 'qiqi_deer',
    shortName: '奇奇',
    roleTitle: '小鹿奇奇',
    greetingLine: '我是小鹿奇奇！慢慢感受身体的温度，每一种天气都被欢迎。',
  },
];

const WEATHER_LAYER_LABELS: Record<V2_3WeatherLayerPart, string> = {
  backplate: 'L1 3D海湾观景台背板',
  weather_actor: 'L2 3D天空气象主层',
  front_effect: 'L3 3D木质廊檐与光效前景',
};

const WEATHER_TOKEN_SPECS: ReadonlyArray<{
  type: V2_3WeatherState;
  shortLabel: string;
  fullLabel: string;
  subtitle: string;
  fill: string;
  stroke: string;
}> = [
  { type: 'sunny', shortLabel: '晴', fullLabel: '晴天', subtitle: '暖洋洋', fill: '#FEF3C7', stroke: '#D97706' },
  { type: 'cloudy', shortLabel: '阴', fullLabel: '阴天', subtitle: '软绵绵', fill: '#F1F5F9', stroke: '#475569' },
  { type: 'rainy', shortLabel: '雨', fullLabel: '雨天', subtitle: '湿漉漉', fill: '#E0F2FE', stroke: '#0284C7' },
  { type: 'stormy', shortLabel: '雷', fullLabel: '雷雨', subtitle: '轰隆隆', fill: '#EDE9FE', stroke: '#7C3AED' },
  { type: 'foggy', shortLabel: '雾', fullLabel: '雾天', subtitle: '白茫茫', fill: '#D1FAE5', stroke: '#059669' },
  { type: 'opt_out', shortLabel: '不选', fullLabel: '我不想选', subtitle: '先休息', fill: '#F5F5F4', stroke: '#78716C' },
];

export const WeatherStationSceneArtV2: React.FC<WeatherStationSceneArtV2Props> = ({
  step,
  selectedPrimary,
  selectedSecondary,
  allowDualWeather,
  intensity,
  bodySensations,
  onSelectPrimary,
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

  const intensityScale = intensity >= 5 ? 1.06 : intensity >= 3 ? 1.0 : 0.96;

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

  const handleSwitchCompanion = (spec: (typeof COMPANION_SPECS)[number]) => {
    sounds.playClick();
    if (typeof updatePersonalization === 'function') {
      updatePersonalization({ companionId: spec.id });
    } else {
      speechNarrator.syncWithCompanion(spec.id);
    }
    speechNarrator.speak(spec.greetingLine);
  };

  const activeCompanionSpec =
    COMPANION_SPECS.find((c) => c.id === companionId) || COMPANION_SPECS[0];

  return (
    <div
      data-testid="v2-weather-station-stage-wrapper"
      data-weather-state={weatherState}
      data-weather-step={step}
      data-intensity={intensity}
      data-dual-weather={allowDualWeather && selectedSecondary ? selectedSecondary : 'none'}
      data-companion-id={companionId}
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      data-artwork-status="ASSET_ARTWORK_BLOCKED"
      data-tech-preview="TECH_PREVIEW_NOT_ART_APPROVED"
      className="space-y-2.5"
    >
      {/* 4 Official Companions Switcher Bar (Child-Safe 3D Wooden Pill Bar) */}
      <div
        data-testid="v2-weather-companion-switcher"
        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-2xl bg-linear-to-r from-[#8C5830] via-[#A46B3E] to-[#8C5830] border-2 border-[#FDE68A]/80 shadow-md"
      >
        <span className="hidden sm:inline text-xs sm:text-sm font-black text-amber-50 drop-shadow-2xs shrink-0">
          陪伴伙伴：
        </span>
        <div className="grid grid-cols-4 gap-1.5 flex-1">
          {COMPANION_SPECS.map((spec) => {
            const isActive = companionId === spec.id;
            const cutout = V2_3_COMPANION_NATIVE_CUTOUT_MAP[spec.id];
            return (
              <button
                key={spec.id}
                type="button"
                data-testid={`v2-weather-switch-companion-${spec.id}`}
                aria-pressed={isActive}
                aria-label={`切换陪伴伙伴：${spec.roleTitle}`}
                onClick={() => handleSwitchCompanion(spec)}
                className={`min-h-[48px] sm:min-h-[56px] px-1.5 sm:px-2.5 py-1 rounded-xl flex items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-linear-to-b from-[#FFFBEB] to-[#FDE68A] border-[#F59E0B] text-[#78350F] shadow-sm font-black'
                    : 'bg-[#6D4121]/85 border-[#B77D4E]/70 text-amber-100 hover:bg-[#7C4B27] font-bold'
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

      {/* Responsive 3D Fairytale Coastal Observatory Stage Container (0% source crop: 896x1200 mobile portrait / 1376x768 desktop) */}
      <div
        data-testid="v2-weather-station-stage"
        data-stage-layout={isMobileStage ? 'mobile-portrait-896x1200' : 'desktop-1376x768'}
        className={`relative w-full overflow-hidden rounded-3xl ring-4 ring-[#9A6338] shadow-[0_14px_32px_rgba(12,74,110,0.28)] bg-sky-900 select-none ${
          isMobileStage ? 'aspect-[896/1200]' : 'aspect-[1376/768]'
        }`}
      >
        {/* 1. V2.3 High-Detail 3D Fairytale Layers (backplate -> weather_actor -> front_effect) */}
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
                  opacity: isFront && intensity === 1 ? 0.85 : 1,
                };

          return (
            <V2_3ResilientSvgLayer
              key={`${weatherState}-${part}`}
              record={record}
              isMobileStage={isMobileStage}
              testId={`v2-weather-layer-${part}`}
              style={transformStyle}
              onAssetMetric={recordAssetEvent}
            />
          );
        })}

        {/* 2. State-Driven Atmospheric Overlays for Foggy & Opt-Out */}
        {weatherState === 'foggy' && (
          <div
            data-testid="v2-weather-fog-overlay"
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 4 }}
          >
            <div className="absolute inset-x-0 top-[18%] h-14 bg-white/45 blur-md" />
            <div className="absolute inset-x-0 top-[44%] h-16 bg-emerald-50/50 blur-md" />
          </div>
        )}

        {weatherState === 'opt_out' && (
          <div
            data-testid="v2-weather-optout-veil"
            aria-hidden="true"
            className="absolute inset-x-0 top-12 pointer-events-none flex items-center justify-center"
            style={{ zIndex: 4 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-[#FFFBEB]/95 text-[#78350F] text-xs sm:text-sm font-black shadow-md border-2 border-[#F59E0B]">
              安静休息中 · 今天不挑天气也没关系
            </span>
          </div>
        )}

        {/* 3. Secondary Dual-Weather Visual Indicator */}
        {allowDualWeather && selectedSecondary && (
          <div
            data-testid="v2-weather-secondary-badge"
            data-secondary-weather={selectedSecondary}
            className="absolute top-3 left-3 z-10 px-3.5 py-1 rounded-full bg-[#FFFBEB]/95 border-2 border-[#F59E0B] shadow-sm text-xs font-black text-[#78350F] pointer-events-none flex items-center gap-1.5"
          >
            <span>
              双天气并存：{WEATHER_LABELS[weatherState]} +{' '}
              {WEATHER_LABELS[selectedSecondary as V2_3WeatherState]}
            </span>
          </div>
        )}

        {/* 4. Active Body Sensation Pill Strip on Stage (non-blocking visual feedback) */}
        {bodySensations.length > 0 && weatherState !== 'opt_out' && (
          <div
            data-testid="v2-weather-stage-sensations"
            className="absolute top-3 right-3 z-10 max-w-[60%] flex flex-wrap justify-end gap-1 pointer-events-none"
          >
            {bodySensations.map((sensation) => (
              <span
                key={sensation}
                className="px-2.5 py-0.5 rounded-full bg-[#FFFBEB]/95 border-2 border-[#F59E0B] text-[11px] font-black text-[#78350F] shadow-xs"
              >
                {sensation}
              </span>
            ))}
          </div>
        )}

        {/* 5. 3D Companion Cutout & Warm Storybook Speech Bubble on Bottom/Left Wooden Veranda */}
        <div
          data-testid="v2-weather-companion-slot"
          className={`absolute left-2.5 bottom-2.5 z-10 pointer-events-none flex items-end gap-2 ${
            isMobileStage ? 'right-2.5 max-w-[94%]' : 'max-w-[33%]'
          }`}
        >
          <V2_3CompanionRigActor
            companionId={companionId}
            state={companionRigState}
            prefersReducedMotion={prefersReducedMotion}
            testIdPrefix="v2-weather-companion-rig"
            className={isMobileStage ? 'w-19 h-23 shrink-0' : 'w-26 h-32 shrink-0'}
          />
          <div
            data-testid="v2-weather-companion-speech-bubble"
            className="mb-1.5 px-3 py-2 rounded-2xl bg-linear-to-b from-[#FFFDF7]/96 to-[#FEF3C7]/95 border-2 border-[#D97706] shadow-md text-left min-w-0"
          >
            <div className="text-[11px] font-black text-[#B45309]">
              {activeCompanionSpec.roleTitle}
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-[#451A03] leading-snug line-clamp-2">
              {WEATHER_COMPANION_LINES[weatherState]}
            </p>
          </div>
        </div>

        {/* 6. Single Primary Interactive SVG Weather Selector Dial (Keyboard Focusable .v2-story-svg-focusable >= 56x56 CSS px) */}
        <svg
          data-testid="v2-weather-interactive-svg"
          viewBox={isMobileStage ? '0 0 448 600' : '0 0 1376 768'}
          className="absolute inset-0 w-full h-full z-20 pointer-events-auto"
          aria-label="情绪天气站主天气选择转盘"
        >
          {isMobileStage ? (
            <>
              {/* Mobile 448x600 coordinate system (exact 1:2 of 896x1200): 3x2 tactile weather cards in central observatory zone (y=216..416), each 132x96 SVG units (>= 90x66 CSS px at 360px viewport), non-overlapping with bottom companion deck (y=445..588) */}
              {WEATHER_TOKEN_SPECS.map((spec, index) => {
                const col = index % 3;
                const row = Math.floor(index / 3);
                const x = 18 + col * 140;
                const y = 216 + row * 104;
                const isSelected = weatherState === spec.type;
                return (
                  <g
                    key={spec.type}
                    data-testid={`v2-weather-svg-token-${spec.type}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`挑选今天头顶的天气：${spec.fullLabel}（${spec.subtitle}）`}
                    aria-pressed={isSelected}
                    onClick={() => onSelectPrimary(spec.type)}
                    onKeyDown={(e) => handleSvgKeyActivate(e, () => onSelectPrimary(spec.type))}
                    className="v2-story-svg-focusable cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={132}
                      height={96}
                      rx={22}
                      fill={spec.fill}
                      fillOpacity={isSelected ? 0.96 : 0.84}
                      stroke={isSelected ? '#B45309' : spec.stroke}
                      strokeWidth={isSelected ? 4.5 : 2.5}
                    />
                    {isSelected && (
                      <circle
                        cx={x + 112}
                        cy={y + 20}
                        r={11}
                        fill="#D97706"
                      />
                    )}
                    {isSelected && (
                      <text
                        x={x + 112}
                        y={y + 25}
                        textAnchor="middle"
                        fill="#FFFBEB"
                        fontSize="13"
                        fontWeight="900"
                      >
                        ✓
                      </text>
                    )}
                    <text
                      x={x + 66}
                      y={y + 44}
                      textAnchor="middle"
                      fill="#1E293B"
                      fontSize="20"
                      fontWeight="900"
                    >
                      {spec.fullLabel}
                    </text>
                    <text
                      x={x + 66}
                      y={y + 72}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="14"
                      fontWeight="800"
                    >
                      {spec.subtitle}
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            <>
              {/* Desktop/Tablet 1376x768 coordinate system: 6 observatory weather selector cards on bottom-right deck (x=468..1350, y=592..740), each 142x148 SVG units (>= 71x74 CSS px at 768px..1440px) */}
              {WEATHER_TOKEN_SPECS.map((spec, index) => {
                const x = 468 + index * 148;
                const y = 592;
                const isSelected = weatherState === spec.type;
                return (
                  <g
                    key={spec.type}
                    data-testid={`v2-weather-svg-token-${spec.type}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`挑选今天头顶的天气：${spec.fullLabel}（${spec.subtitle}）`}
                    aria-pressed={isSelected}
                    onClick={() => onSelectPrimary(spec.type)}
                    onKeyDown={(e) => handleSvgKeyActivate(e, () => onSelectPrimary(spec.type))}
                    className="v2-story-svg-focusable cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={142}
                      height={148}
                      rx={30}
                      fill={spec.fill}
                      fillOpacity={isSelected ? 0.96 : 0.84}
                      stroke={isSelected ? '#B45309' : spec.stroke}
                      strokeWidth={isSelected ? 6 : 3.5}
                    />
                    {isSelected && (
                      <circle
                        cx={x + 116}
                        cy={y + 28}
                        r={15}
                        fill="#D97706"
                      />
                    )}
                    {isSelected && (
                      <text
                        x={x + 116}
                        y={y + 34}
                        textAnchor="middle"
                        fill="#FFFBEB"
                        fontSize="18"
                        fontWeight="900"
                      >
                        ✓
                      </text>
                    )}
                    <text
                      x={x + 71}
                      y={y + 72}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize="27"
                      fontWeight="900"
                    >
                      {spec.fullLabel}
                    </text>
                    <text
                      x={x + 71}
                      y={y + 112}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="19"
                      fontWeight="800"
                    >
                      {spec.subtitle}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>
      </div>

      {/* 7. QA Hold Reviewer Drawer — strictly hidden in normal child UI, shown only with ?qa=1 */}
      <V2_3ReviewerDebugDrawer
        sceneKey="weather_station"
        sceneTitle="V2.3 Batch01R 情绪天气站视觉纠偏样板"
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
        forceEnableQaForTest={forceEnableQaForTest}
      />
    </div>
  );
};
