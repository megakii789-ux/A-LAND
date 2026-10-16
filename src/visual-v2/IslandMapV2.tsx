import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { IslandPlace } from '../context/AppContext';
import { AnimalCompanionId, ANIMAL_COMPANIONS } from '../domain/personalization';
import { sounds } from '../utils/sound';
import { speechNarrator } from '../utils/speech';
import {
  loadProductExperienceMetrics,
  recordLandmarkVisit,
  subscribeProductExperienceMetrics,
} from '../domain/cognitive/productExperienceMetrics';
import {
  IslandBackdropLayers,
  LandmarkId,
  landmarkUrl,
  effectSvgUrl,
} from './AlandVisualAssets';
import { CompanionActorV2 } from './CompanionActorV2';

export interface IslandMapV2Props {
  companionId: AnimalCompanionId;
  reducedMotion?: boolean;
  viewMode?: 'map' | 'cards';
  onViewModeChange?: (mode: 'map' | 'cards') => void;
  onSelectPlace?: (place: IslandPlace) => void;
  onSelectLocation?: (locationId: string) => void;
  onOpenBreaker?: () => void;
  completedStoriesCount?: number;
  completedDetectiveCasesCount?: number;
  sunCount?: number;
  rainCount?: number;
}

export interface V2LandmarkConfig {
  assetId: LandmarkId;
  placeKey: Exclude<IslandPlace, 'island'> | 'breaker';
  legacyTestId: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  speechText: string;
  desktopPos: { left: string; top: string };
}

/**
 * IslandMapV2 — A-LAND V2 分层主岛与 8 大透明建筑地标组件
 * 契约：
 * 1. 4 层独立 SVG 场景背景 (`01_sky.svg` .. `04_foreground_boardwalk.svg`)；
 * 2. 8 个真实透明 alpha 建筑资产 (`idle_native.webp`) 可互动，触发既有 `onSelectPlace` / `onSelectLocation` / `onOpenBreaker`；
 * 3. 支持地图模式与清晰卡片回退导航 (`viewMode: 'map' | 'cards'`)；
 * 4. 栈桥上的透明伙伴立绘仅作展示 (`displayOnly={true}` / `pointer-events-none`)；
 * 5. 所有正式文案均位于 React DOM，以业务状态为唯一事实源，触控目标 >= 56×56 CSS px。
 */
export const IslandMapV2: React.FC<IslandMapV2Props> = ({
  companionId,
  reducedMotion = false,
  viewMode = 'map',
  onSelectPlace,
  onSelectLocation,
  onOpenBreaker,
  completedStoriesCount = 0,
  completedDetectiveCasesCount,
  sunCount = 0,
  rainCount = 0,
}) => {
  const [, setMetricsTick] = useState(0);
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    return subscribeProductExperienceMetrics(() => {
      setMetricsTick((v) => v + 1);
    });
  }, []);

  const expMetrics = loadProductExperienceMetrics();
  const solvedCasesCount =
    completedDetectiveCasesCount ?? expMetrics.completedDetectiveCaseIds.length;
  const completedToyBoatCount = expMetrics.completedToyBoatTaskIds.length;
  const completedInteractiveStoryCount = Math.max(
    completedStoriesCount,
    expMetrics.completedStoryLeafIds.length
  );

  const companion = ANIMAL_COMPANIONS[companionId] || ANIMAL_COMPANIONS.guoguo_squirrel;

  const landmarks: V2LandmarkConfig[] = [
    {
      assetId: 'story_grove',
      placeKey: 'story',
      legacyTestId: 'map-landmark-story',
      title: '故事林',
      subtitle: '在故事里发现更多视角',
      badge:
        completedInteractiveStoryCount > 0
          ? `已探 ${completedInteractiveStoryCount} 片故事叶`
          : '绘本密林',
      description: '打开树林里的小动物故事，动动手比较不同角度与做法。',
      speechText: '这里是故事林。翻开发光的故事叶，看看小动物们遇到了什么事，一起试试不同的办法吧！',
      desktopPos: { left: '17%', top: '31%' },
    },
    {
      assetId: 'tools_room',
      placeKey: 'detective',
      legacyTestId: 'map-landmark-detective',
      title: '想法侦探社',
      subtitle: '放大镜找线索 · 区分事实猜测',
      badge: solvedCasesCount > 0 ? `已破案 ${solvedCasesCount} 起` : '思考工具屋',
      description: '拿起放大镜、双面币与小天平，看清什么是亲眼看到的事实，什么是心里的猜测。',
      speechText: '这里是想法侦探社，也是思考工具屋。拿起放大镜找找真实证据，把事实和猜测分清楚！',
      desktopPos: { left: '38%', top: '31%' },
    },
    {
      assetId: 'courage_house',
      placeKey: 'courage',
      legacyTestId: 'map-landmark-courage',
      title: '勇气说话屋',
      subtitle: '练习说出真实感受与边界',
      badge: '安全表达',
      description: '在安全温暖的小屋里，练习用自己的方式把心里话告诉可信的大人。',
      speechText: '这里是勇气说话屋。不管是想说喜欢、不喜欢，还是需要帮忙，都可以来这里练习说出来。',
      desktopPos: { left: '59%', top: '32%' },
    },
    {
      assetId: 'weather_station',
      placeKey: 'weather',
      legacyTestId: 'map-landmark-weather',
      title: '情绪天气站',
      subtitle: '认识心里的晴天、云朵或小雨',
      badge: '云朵天气',
      description: '看看今天心里像暖阳、厚云还是小雨，也可以选择暂时不选。',
      speechText: '这里是情绪天气站。每种天气都是自然的，来看看今天你头顶是哪一朵云吧。',
      desktopPos: { left: '81%', top: '31%' },
    },
    {
      assetId: 'calm_corner',
      placeKey: 'calm',
      legacyTestId: 'map-landmark-calm',
      title: '绿草平静角',
      subtitle: '呼吸放松 · 随时安心退回',
      badge: '随时退回',
      description: '跟着柔和的水波慢慢吸气和呼气，随时可以停下来安静休息。',
      speechText: '这里是绿草平静角。觉得累了或者想安静一会儿，随时来这里深呼吸休息。',
      desktopPos: { left: '18%', top: '63%' },
    },
    {
      assetId: 'two_homes_bridge',
      placeKey: 'bridge',
      legacyTestId: 'map-landmark-bridge',
      title: '两个家的桥',
      subtitle: '连接不同住所 · 自主选择过渡方式',
      badge: completedToyBoatCount > 0 ? `已通航 ${completedToyBoatCount} 次` : '双向小桥',
      description: '支持双向不舍、事实与猜测分拣、具体担忧调查或轻松开心地过桥。',
      speechText: '这里是两个家的桥。去另一边住的时候，不管你是轻松开心、有点舍不得还是有担心的事，都可以按自己的节奏过桥。',
      desktopPos: { left: '40%', top: '61%' },
    },
    {
      assetId: 'starlight_cabin',
      placeKey: 'starlight',
      legacyTestId: 'map-landmark-starlight',
      title: '星光小屋',
      subtitle: '发现我的闪光点与多面爱好',
      badge: `${sunCount}阳 ${rainCount}雨`,
      description: '点亮你的独特兴趣、收藏小作品，看见闪闪发光的自己。',
      speechText: '这里是星光小屋。来看看你喜欢的活动和属于你的闪亮小印记吧！',
      desktopPos: { left: '62%', top: '61%' },
    },
    {
      assetId: 'difficulty_breaker',
      placeKey: 'breaker',
      legacyTestId: 'map-landmark-breaker',
      title: '大困难拆解台',
      subtitle: '把大问题拆成 3 个小踏脚石',
      badge: '小步拆解',
      description: '遇到觉得很难的事情，用分、通、择三步把它拆成容易迈出的小步子。',
      speechText: '这里是大困难拆解台。再大的困难也可以拆成三小步，一步一步轻松试一试。',
      desktopPos: { left: '83%', top: '63%' },
    },
  ];

  const handleActivateLandmark = (item: V2LandmarkConfig) => {
    speechNarrator.stop();
    sounds.playModalOpen();
    recordLandmarkVisit(item.placeKey);
    onSelectLocation?.(item.placeKey);
    if (item.placeKey === 'breaker') {
      onOpenBreaker?.();
    } else {
      onSelectPlace?.(item.placeKey);
    }
  };

  const handleSpeakLandmark = (e: React.MouseEvent, item: V2LandmarkConfig) => {
    e.stopPropagation();
    sounds.playTap();
    speechNarrator.speak(item.speechText, undefined, undefined, {
      speakerId: companion.id,
      sceneId: `v2_map_${item.assetId}`,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
    setParallax({ x: Math.round(dx * 10) / 10, y: Math.round(dy * 10) / 10 });
  };

  const handlePointerLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  return (
    <section
      data-testid="v2-island-map-root"
      data-view-mode={viewMode}
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      aria-label="晴雨小岛 V2 分层探索地图与八大地标"
      className="w-full space-y-3 sm:space-y-4"
    >
      {viewMode === 'map' ? (
        <>
          {/* 1. 2.5D 分层主岛舞台 (4 层独立 SVG + 8 个透明建筑交互热区 + 栈桥仅展示透明伙伴) */}
          <div
            data-testid="v2-island-map-stage"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="relative w-full rounded-3xl p-1.5 sm:p-2.5 bg-[#AFDFEA] shadow-lg border-2 border-white/90 overflow-hidden"
          >
            <div className="relative w-full min-h-[540px] sm:min-h-[520px] lg:min-h-[560px] rounded-2xl overflow-hidden bg-[#8ED7ED] isolation-auto">
              {/* 4 层独立 SVG 背景层 */}
              <div
                style={
                  reducedMotion
                    ? undefined
                    : {
                        transform: `translate(${parallax.x * 0.25}px, ${parallax.y * 0.2}px)`,
                        transition: 'transform 220ms ease-out',
                      }
                }
                className="absolute inset-0 pointer-events-none"
              >
                <IslandBackdropLayers />
              </div>

              {/* 左上角真实分层与 QA 门禁状态标识 */}
              <div
                data-testid="v2-stage-layer-badge"
                className="relative z-10 inline-flex items-center gap-1.5 m-2.5 sm:m-3.5 px-3 py-1 rounded-full bg-white/90 border border-white shadow-xs text-[11px] sm:text-xs font-extrabold text-[#123C5C]"
              >
                <span className="w-2 h-2 rounded-full bg-[#18B7A4] inline-block" />
                <span>4 层 SVG 场景 + 8 透明地标 · ART_DIRECTOR_QA_HOLD</span>
              </div>

              {/* 装饰星光 SVG */}
              {!reducedMotion && (
                <img
                  src={effectSvgUrl('sparkle')}
                  alt=""
                  aria-hidden="true"
                  className="aland-sparkle absolute z-10 right-[18%] top-[14%] w-9 h-9 pointer-events-none"
                />
              )}

              {/* 8 个透明建筑地标交互容器：
                  - 桌面/平板 (>=640px) 按海岛空间坐标分布；
                  - 手机视口 (<640px: 360/390/430px) 采用自适应 2 列空间网格，保证 8 个地标全部 >=56×56px 且零水平溢出 */}
              <div
                data-testid="v2-landmark-Interactive-container"
                className="relative z-10 grid grid-cols-2 gap-2 px-2.5 pt-1 pb-28 sm:block sm:inset-0 sm:absolute sm:p-0"
              >
                {landmarks.map((item) => (
                  <button
                    key={item.assetId}
                    type="button"
                    data-testid={item.legacyTestId}
                    data-v2-landmark={item.assetId}
                    data-place-key={item.placeKey}
                    onClick={() => handleActivateLandmark(item)}
                    style={
                      typeof window !== 'undefined'
                        ? ({
                            '--v2-left': item.desktopPos.left,
                            '--v2-top': item.desktopPos.top,
                          } as React.CSSProperties)
                        : undefined
                    }
                    className="group min-h-[68px] min-w-[68px] sm:min-h-[96px] sm:min-w-[112px] p-1 sm:p-1 rounded-2xl bg-white/75 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none border border-white/80 sm:border-transparent flex flex-row sm:flex-col items-center justify-start sm:justify-end gap-1 sm:gap-0.5 text-left sm:text-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-[#18B7A4] focus-visible:outline-none sm:absolute sm:-translate-x-1/2 sm:-translate-y-1/2 sm:left-[var(--v2-left)] sm:top-[var(--v2-top)] overflow-hidden sm:overflow-visible"
                    aria-label={`进入${item.title}：${item.subtitle}（${item.badge}）`}
                  >
                    <img
                      data-testid={`v2-landmark-img-${item.assetId}`}
                      src={landmarkUrl(item.assetId)}
                      alt=""
                      className="w-10 h-10 sm:w-24 sm:h-20 lg:w-28 lg:h-24 object-contain shrink-0 drop-shadow-md pointer-events-none select-none"
                    />
                    <div className="min-w-0 flex flex-col items-start sm:items-center">
                      <span className="px-1.5 sm:px-2.5 py-0.5 rounded-full bg-gradient-to-b from-[#FFF7EB] to-white border-2 border-[#B68C64] text-[#123C5C] font-black text-[11px] sm:text-sm shadow-xs whitespace-nowrap">
                        {item.title}
                      </span>
                      <span className="mt-0.5 text-[10px] sm:text-[11px] font-extrabold text-[#123C5C] bg-[#FFD67A]/90 px-1.5 py-0.2 rounded-full whitespace-nowrap">
                        {item.badge}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* 前景栈桥上的透明伙伴角色：严格遵循契约“透明角色仅展示” (displayOnly + pointer-events-none) */}
              <div
                data-testid="v2-stage-companion-display-only"
                aria-hidden="true"
                className="pointer-events-none select-none absolute z-20 bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-2"
              >
                <CompanionActorV2
                  companionId={companion.id}
                  reducedMotion={reducedMotion}
                  displayOnly={true}
                  size="md"
                  testId="v2-boardwalk-companion-sprite"
                />
                <div className="mb-3 px-2.5 py-1 rounded-2xl bg-white/95 border-2 border-[#72CBFF] text-[#123C5C] text-[11px] sm:text-xs font-black shadow-sm whitespace-nowrap">
                  {companion.name}陪你探索小岛
                </div>
              </div>
            </div>
          </div>

          {/* 2. 地标快捷入口条 (8 个地点独立按钮，满足桌面/平板/手机无障碍与一键直达) */}
          <div
            data-testid="v2-places-quick-row"
            role="group"
            aria-label="八大地标快捷直达入口"
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5"
          >
            {landmarks.map((item) => (
              <button
                key={`quick-${item.assetId}`}
                type="button"
                data-testid={`v2-quick-place-${item.placeKey}`}
                onClick={() => handleActivateLandmark(item)}
                className="min-h-[60px] px-2.5 py-2 rounded-2xl bg-[#FFF9EC] hover:bg-white border-2 border-[#B68C64]/35 hover:border-[#18B7A4] shadow-2xs flex items-center gap-2 text-left cursor-pointer transition-all focus-visible:ring-4 focus-visible:ring-[#18B7A4] focus-visible:outline-none"
                aria-label={`快捷前往${item.title}：${item.subtitle}`}
              >
                <img
                  src={landmarkUrl(item.assetId)}
                  alt=""
                  className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 pointer-events-none"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-black text-xs sm:text-sm text-[#123C5C] truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] font-bold text-stone-600 truncate">
                    {item.badge}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        /* 3. 清晰地点卡片回退导航 (Accessible Card Fallback View) */
        <div
          data-testid="v2-island-cards-fallback"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {landmarks.map((item) => (
            <div
              key={`card-${item.assetId}`}
              data-testid={`v2-location-card-${item.placeKey}`}
              className="rounded-3xl bg-[#FFF9EC] border-2 border-[#B68C64]/45 p-3.5 sm:p-4 shadow-sm flex flex-col justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={landmarkUrl(item.assetId)}
                  alt=""
                  className="w-16 h-16 object-contain shrink-0 drop-shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-[#123C5C]">
                      {item.title}
                    </h2>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFD67A]/80 text-[#123C5C]">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 font-medium mt-1 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid={`v2-card-speak-${item.placeKey}`}
                  onClick={(e) => handleSpeakLandmark(e, item)}
                  className="min-h-[56px] min-w-[56px] px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#123C5C] font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none"
                  aria-label={`听${companion.name}介绍${item.title}`}
                >
                  <Volume2 className="w-4 h-4 text-sky-700 shrink-0" />
                  <span>听介绍</span>
                </button>
                <button
                  type="button"
                  data-testid={`v2-card-open-${item.placeKey}`}
                  onClick={() => handleActivateLandmark(item)}
                  className="flex-1 min-h-[56px] px-4 rounded-2xl bg-[#18B7A4] hover:bg-[#149E8D] text-white font-black text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
                  aria-label={`进入${item.title}`}
                >
                  <span>进入{item.title}</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
