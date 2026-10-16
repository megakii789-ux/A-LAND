import React from 'react';
import { IslandPlace } from '../context/AppContext';
import {
  LandmarkId,
  MAP_LABELS,
  WEATHER_PROP_IDS,
  TOOL_PROP_IDS,
  landmarkUrl,
  sceneBackplateUrl,
  weatherPropUrl,
  toolPropUrl,
  effectSvgUrl,
} from './AlandVisualAssets';

export type ActiveV2SceneKey = Exclude<IslandPlace, 'island'> | 'breaker';

const PLACE_TO_LANDMARK_ID: Record<ActiveV2SceneKey, LandmarkId> = {
  weather: 'weather_station',
  story: 'story_grove',
  detective: 'tools_room',
  courage: 'courage_house',
  bridge: 'two_homes_bridge',
  starlight: 'starlight_cabin',
  medals: 'starlight_cabin',
  calm: 'calm_corner',
  breaker: 'difficulty_breaker',
};

const SCENE_QA_HOLD_NOTES: Record<LandmarkId, string> = {
  weather_station:
    'ART_DIRECTOR_QA_HOLD · 工程 SVG 背板 + 5 枚透明天气道具 (61–86px)，待补 4K 3D 气象台母版',
  story_grove:
    'ART_DIRECTOR_QA_HOLD · 工程 SVG 背板 + 树屋透明立绘 (189×146px)，待补 4K 3D 故事林分层',
  tools_room:
    'ART_DIRECTOR_QA_HOLD · 工程 SVG 背板 + 4 枚透明工具道具 (68–99px)，待补 4K 3D 侦探社母版',
  courage_house:
    'ART_DIRECTOR_QA_HOLD · 工程 SVG 背板 + 勇气屋透明立绘 (171×140px)，待补 4K 3D 室内外分层',
  two_homes_bridge:
    'ART_DIRECTOR_QA_HOLD · 工程 SVG 背板 + 双家木桥透明立绘 (213×107px)，复用 Sprint 4.3 真实 Slice A/B/C 状态机',
  starlight_cabin:
    'ART_DIRECTOR_QA_HOLD · 工程 SVG 背板 + 星光屋透明立绘 (169×157px)，待补 4K 3D 星空母版',
  calm_corner:
    'ART_DIRECTOR_QA_HOLD · 工程 SVG 背板 + 平静角透明立绘 (173×122px)，待补 4K 3D 溪流母版',
  difficulty_breaker:
    'ART_DIRECTOR_QA_HOLD · 工程 SVG 背板 + 拆解台透明立绘 (191×151px)，复用 Sprint 4.3 真实子情境重置规则',
};

export interface SceneBackdropV2Props {
  sceneKey: ActiveV2SceneKey | null;
  reducedMotion?: boolean;
}

/**
 * SceneBackdropV2 — 场景独立 SVG 底图与透明道具背板层
 * 契约：
 * - 仅提供 V2 独立 SVG 场景背板、透明地标与透明天气/工具道具展示；
 * - 全部 pointer-events-none，绝不遮挡或替代真实业务 Modal 的 DOM 与状态机；
 * - 显式标注 ART_DIRECTOR_QA_HOLD。
 */
export const SceneBackdropV2: React.FC<SceneBackdropV2Props> = ({
  sceneKey,
  reducedMotion = false,
}) => {
  if (!sceneKey) return null;

  const landmarkId = PLACE_TO_LANDMARK_ID[sceneKey];
  if (!landmarkId) return null;

  const backplateSrc = sceneBackplateUrl(landmarkId);
  const landmarkSpriteSrc = landmarkUrl(landmarkId);
  const label = MAP_LABELS[landmarkId];
  const holdNote = SCENE_QA_HOLD_NOTES[landmarkId];

  return (
    <>
      <div
        data-testid="v2-scene-backdrop"
        data-scene-key={sceneKey}
        data-landmark-id={landmarkId}
        data-art-gate="ART_DIRECTOR_QA_HOLD"
        aria-hidden="true"
        className="fixed inset-0 z-[45] pointer-events-none select-none overflow-hidden aland-scene-enter"
      >
        {/* 1. 独立场景 SVG 工程背板 */}
        <img
          data-testid="v2-scene-backplate-img"
          src={backplateSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-95"
        />

        {/* 2. 装饰性透明 SVG 动效粒子 */}
        {!reducedMotion && (
          <img
            src={effectSvgUrl('sparkle')}
            alt=""
            className="aland-sparkle absolute top-14 right-8 w-8 h-8 opacity-75"
          />
        )}
      </div>

      {/* 3. 顶部场景资产与 ART_DIRECTOR_QA_HOLD 状态铭牌 (z-[55] pointer-events-none, 位于模糊层之上且绝不拦截弹窗操作) */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-1.5 px-2 sm:px-4 flex items-center justify-between gap-2 z-[55] pointer-events-none select-none"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF9EC]/95 border-2 border-[#B68C64]/50 shadow-md">
          <img
            data-testid="v2-scene-landmark-cutout"
            src={landmarkSpriteSrc}
            alt=""
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
          />
          <span className="text-xs sm:text-sm font-black text-[#123C5C] whitespace-nowrap">
            V2 场景层 · {label}
          </span>
          <span
            data-testid="v2-scene-qa-hold-badge"
            className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-400"
          >
            ART_DIRECTOR_QA_HOLD
          </span>
        </div>

        {/* 情绪天气站专属 5 枚透明天气道具展示 */}
        {landmarkId === 'weather_station' && (
          <div
            data-testid="v2-weather-props-strip"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-sky-200 shadow-sm"
          >
            {WEATHER_PROP_IDS.map((propId) => (
              <img
                key={propId}
                data-testid={`v2-weather-prop-${propId}`}
                src={weatherPropUrl(propId)}
                alt=""
                className="w-6 h-6 object-contain"
              />
            ))}
          </div>
        )}

        {/* 想法侦探社 (工具屋) 专属 4 枚透明工具道具展示 */}
        {landmarkId === 'tools_room' && (
          <div
            data-testid="v2-tool-props-strip"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-amber-200 shadow-sm"
          >
            {TOOL_PROP_IDS.map((toolId) => (
              <img
                key={toolId}
                data-testid={`v2-tool-prop-${toolId}`}
                src={toolPropUrl(toolId)}
                alt=""
                className="w-6 h-6 object-contain"
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. 底部技术预览说明条 (z-[55] pointer-events-none) */}
      <div
        aria-hidden="true"
        className="fixed bottom-1 left-2 right-2 flex justify-center z-[55] pointer-events-none select-none"
      >
        <div
          data-testid="v2-scene-hold-note"
          className="px-3 py-0.5 rounded-full bg-[#123C5C]/90 text-[#FFF7EB] text-[10px] sm:text-xs font-bold shadow-sm truncate max-w-full"
        >
          {holdNote}
        </div>
      </div>
    </>
  );
};
