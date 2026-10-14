import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  InterestActivityId,
  INTEREST_ACTIVITIES,
  getThemedScenarioByInterest,
  evaluateThemedCluePlacement,
} from '../../../domain/personalization';
import { HotspotEvidence, SortingBasketType } from '../../../domain/games/types';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';

import { ContentAuditRegistry } from '../../../domain/cognitive/ContentAuditRegistry';

interface Props {
  onExit: () => void;
  initialTheme?: InterestActivityId;
  isAdultPreview?: boolean;
}

export const CrayonDetectiveGame: React.FC<Props> = ({ onExit, initialTheme, isAdultPreview = false }) => {
  const { personalization, updatePersonalization } = useApp();
  const [adultPreviewUnlocked, setAdultPreviewUnlocked] = useState(isAdultPreview);

  // 独立内容审核门禁：未通过审核时阻断儿童正式运行时
  const isApproved = ContentAuditRegistry.canRenderContent('game_crayon_detective');

  // 当前激活的兴趣场景皮肤（默认跟随儿童全局偏好，也可在游戏内随时切换）
  const [activeTheme, setActiveTheme] = useState<InterestActivityId>(
    initialTheme || personalization.primaryInterest || 'drawing'
  );

  const scenario = getThemedScenarioByInterest(activeTheme);
  const currentHotspots = scenario.hotspots;
  const currentBaskets = scenario.sortingBaskets;

  // 放大镜位置（百分比）
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isDraggingLens, setIsDraggingLens] = useState(false);

  // 已发现的线索 ID 列表
  const [discoveredClueIds, setDiscoveredClueIds] = useState<string[]>([]);
  // 当前处于探照焦点的热点
  const [activeHotspot, setActiveHotspot] = useState<HotspotEvidence | null>(null);

  // 分类状态：clueId -> targetBasket
  const [placements, setPlacements] = useState<Record<string, SortingBasketType>>({});
  // 当前被选中的待放置卡片
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);

  // 当前温和提示语
  const [feedbackPrompt, setFeedbackPrompt] = useState<string>(
    scenario.spokenIntro
  );

  // 是否已完成全部事实猜测梳理
  const [isSynthesisOpen, setIsSynthesisOpen] = useState(false);

  const sceneContainerRef = useRef<HTMLDivElement>(null);

  // 初始化与组件卸载清理，以及主题切换响应
  useEffect(() => {
    speechNarrator.speak(scenario.spokenIntro);
    return () => {
      speechNarrator.stop();
    };
  }, [activeTheme]);

  // 切换主题场景时安全重置探索进度
  const handleSwitchTheme = (themeId: InterestActivityId) => {
    if (themeId === activeTheme) return;
    sounds.playClick();
    speechNarrator.stop();
    setActiveTheme(themeId);
    updatePersonalization({ primaryInterest: themeId });
    setDiscoveredClueIds([]);
    setPlacements({});
    setSelectedClueId(null);
    setActiveHotspot(null);
    setLensPos({ x: 50, y: 50 });
    setIsSynthesisOpen(false);
    const newScenario = getThemedScenarioByInterest(themeId);
    setFeedbackPrompt(newScenario.spokenIntro);
  };

  // 检查放大镜位置是否命中热点
  const checkHotspotHit = (x: number, y: number) => {
    let foundHit: HotspotEvidence | null = null;
    for (const spot of currentHotspots) {
      const dx = spot.xPercent - x;
      const dy = spot.yPercent - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= spot.radiusPercent) {
        foundHit = spot;
        break;
      }
    }

    if (foundHit) {
      setActiveHotspot(foundHit);
      if (!discoveredClueIds.includes(foundHit.id)) {
        sounds.playClick();
        setDiscoveredClueIds((prev) => [...prev, foundHit.id]);
        setFeedbackPrompt(`发现新线索：【${foundHit.name}】！${foundHit.foundDescription}`);
        speechNarrator.speak(foundHit.spokenText);
      }
    } else {
      setActiveHotspot(null);
    }
  };

  // 拖动放大镜计算
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingLens) return;
    updateLensByPointer(e);
  };

  const updateLensByPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sceneContainerRef.current) return;
    const rect = sceneContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const xPct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));

    setLensPos({ x: xPct, y: yPct });
    checkHotspotHit(xPct, yPct);
  };

  // 点击场景任意位置移动放大镜
  const handleSceneClick = (e: React.PointerEvent<HTMLDivElement>) => {
    updateLensByPointer(e);
  };

  // 直接点击热点探照按钮（触控等效）
  const handleDirectInspect = (spot: HotspotEvidence) => {
    setLensPos({ x: spot.xPercent, y: spot.yPercent });
    setActiveHotspot(spot);
    if (!discoveredClueIds.includes(spot.id)) {
      sounds.playClick();
      setDiscoveredClueIds((prev) => [...prev, spot.id]);
    }
    setFeedbackPrompt(`发现线索：【${spot.name}】${spot.foundDescription}`);
    speechNarrator.speak(spot.spokenText);
  };

  // 选择放置卡片
  const handleSelectCard = (clueId: string) => {
    sounds.playClick();
    setSelectedClueId(clueId === selectedClueId ? null : clueId);
    const clue = currentHotspots.find((h) => h.id === clueId);
    if (clue) {
      speechNarrator.speak(clue.spokenText);
    }
  };

  // 放置到目标箩筐（支持点击分配与撤销）
  const handlePlaceIntoBasket = (basketId: SortingBasketType) => {
    if (!selectedClueId) {
      setFeedbackPrompt('请先点击上面一张已发现的线索卡，再点击要放进的盒子。');
      return;
    }

    const clue = currentHotspots.find((h) => h.id === selectedClueId);
    if (!clue) return;

    sounds.playClick();
    const evaluation = evaluateThemedCluePlacement(clue.category, basketId);

    // 记录放置（无论对错都允许放置与调整，不阻断）
    setPlacements((prev) => ({
      ...prev,
      [selectedClueId]: basketId,
    }));
    setSelectedClueId(null);
    setFeedbackPrompt(evaluation.spokenFeedback);
    speechNarrator.speak(evaluation.spokenFeedback);
  };

  // 撤销某卡片的放置
  const handleUndoPlacement = (clueId: string) => {
    sounds.playClick();
    setPlacements((prev) => {
      const copy = { ...prev };
      delete copy[clueId];
      return copy;
    });
    setFeedbackPrompt('已将线索卡放回待分堆，随时可以重新摆放。');
  };

  // 重置整个房间
  const handleResetGame = () => {
    sounds.playClick();
    setDiscoveredClueIds([]);
    setPlacements({});
    setSelectedClueId(null);
    setActiveHotspot(null);
    setLensPos({ x: 50, y: 50 });
    setIsSynthesisOpen(false);
    setFeedbackPrompt('已重新整理场景，拿起放大镜重新找找吧！');
    speechNarrator.speak('已重新整理场景，拿起放大镜重新找找吧！');
  };

  const allDiscovered = discoveredClueIds.length >= currentHotspots.length;
  const allPlaced = currentHotspots.every((h) => placements[h.id] !== undefined);

  if (!isApproved && !adultPreviewUnlocked) {
    return (
      <div data-testid="audit-gate-blocked" className="p-8 bg-amber-50 rounded-3xl border-2 border-amber-300 text-stone-800 text-center space-y-4 my-4 max-w-xl mx-auto">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-inner">
          🛡️
        </div>
        <h3 className="text-xl font-black text-amber-950">待独立专家审核 · 儿童运行时安全拦截</h3>
        <p className="text-sm text-stone-600 leading-relaxed">
          本游戏组件（蜡笔侦探）尚未完成外部独立儿童心理与伦理专家签署审批（状态为 PENDING_REVIEW）。为保障儿童真实安全，已自动阻断直接运行。
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setAdultPreviewUnlocked(true)}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            成年人确认进入审查预览
          </button>
          <button
            type="button"
            onClick={onExit}
            className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            退出游戏
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-stone-50 rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden flex flex-col my-2">
      {adultPreviewUnlocked && !isApproved && (
        <div className="bg-amber-500 text-white text-xs font-black px-4 py-1.5 flex items-center justify-between">
          <span>⚠️ 成人审查预览模式 · 未获独立伦理审批前严禁作为儿童正式内容</span>
          <span className="bg-amber-700 px-2 py-0.5 rounded text-[10px]">PENDING_REVIEW</span>
        </div>
      )}
      {/* 顶部状态与安全退出栏 */}
      <div className="bg-amber-100/90 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <span className="text-3xl" aria-hidden="true">🔍</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-amber-950">
                {scenario.sceneTitle}
              </h2>
              <span className="text-xs bg-amber-200/90 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                结构同构 · 人工审核
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-800 mt-0.5">
              <span>寻找目标：{scenario.missingItemLabel}</span>
              <span aria-hidden="true">·</span>
              <span>已发现 {discoveredClueIds.length} / {currentHotspots.length} 条线索</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => speechNarrator.speak(feedbackPrompt)}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="重听语音引导"
          >
            <span aria-hidden="true">🔊</span>
            <span>重听提示</span>
          </button>
          <button
            type="button"
            onClick={onExit}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-sm font-bold transition-colors cursor-pointer"
            aria-label="离开侦探社"
          >
            离开
          </button>
        </div>
      </div>

      {/* 兴趣皮肤快速切换栏 (4套经过人工审核的同构主题) */}
      <div
        role="tablist"
        aria-label="选择侦探场景兴趣主题"
        className="bg-amber-50/60 px-4 py-2 border-b border-amber-200 flex items-center gap-2 overflow-x-auto"
      >
        <span className="text-xs font-bold text-stone-600 shrink-0">兴趣皮肤：</span>
        {(Object.keys(INTEREST_ACTIVITIES) as InterestActivityId[]).map((themeKey) => {
          const act = INTEREST_ACTIVITIES[themeKey];
          const isCurrent = activeTheme === themeKey;
          return (
            <button
              key={themeKey}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              onClick={() => handleSwitchTheme(themeKey)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                isCurrent
                  ? 'bg-amber-400 text-stone-900 shadow-xs ring-2 ring-amber-300'
                  : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-200'
              }`}
              aria-label={`切换为${act.label}主题`}
            >
              <span>{act.icon}</span>
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* 核心探索与交互区 */}
      <div className="p-3 sm:p-5 space-y-4">
        {/* 1. 探索场景画布 (Interactive Magnifier Scene) */}
        <div
          ref={sceneContainerRef}
          onPointerDown={(e) => {
            setIsDraggingLens(true);
            handleSceneClick(e);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={() => setIsDraggingLens(false)}
          onPointerCancel={() => setIsDraggingLens(false)}
          className="relative w-full h-64 sm:h-80 bg-linear-to-b from-sky-50 via-amber-50 to-emerald-50 rounded-2xl border-2 border-amber-200 overflow-hidden cursor-crosshair touch-none select-none shadow-inner"
          aria-label="蜡笔探索小房间全景"
        >
          {/* 房间背景手绘插画元素 */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* 窗户 */}
            <div className="absolute top-4 right-8 w-24 h-28 border-4 border-amber-300 bg-sky-200/60 rounded-t-xl" />
            {/* 窗帘 */}
            <div className="absolute top-4 right-5 w-12 h-36 bg-amber-200/80 rounded-b-xl border border-amber-300" />
            {/* 画架桌子 */}
            <div className="absolute top-20 left-12 w-36 h-28 border-2 border-stone-300 bg-amber-100/70 rounded-lg shadow-sm" />
            {/* 地板条纹 */}
            <div className="absolute bottom-0 inset-x-0 h-20 bg-linear-to-t from-stone-200/50 to-transparent" />
          </div>

          {/* 场景热点图标与探照标记 */}
          {currentHotspots.map((spot) => {
            const isDiscovered = discoveredClueIds.includes(spot.id);
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => handleDirectInspect(spot)}
                style={{
                  left: `${spot.xPercent}%`,
                  top: `${spot.yPercent}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300 min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer ${
                  isDiscovered
                    ? 'bg-amber-400 text-amber-950 scale-110 shadow-md ring-4 ring-amber-200'
                    : 'bg-white/90 text-stone-700 hover:scale-105 shadow-sm border border-stone-300'
                }`}
                aria-label={`查看${spot.name}`}
              >
                <span className="text-2xl sm:text-3xl" aria-hidden="true">{spot.icon}</span>
                <span className="sr-only">{spot.name}</span>
              </button>
            );
          })}

          {/* 物理仿真放大镜浮层 */}
          <div
            style={{
              left: `${lensPos.x}%`,
              top: `${lensPos.y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
          >
            {/* 镜片光圈 */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-600 bg-amber-100/30 backdrop-blur-xs shadow-2xl ring-4 ring-amber-300/60 flex items-center justify-center animate-pulse">
              <span className="text-xs font-bold text-amber-900 bg-white/90 px-2 py-0.5 rounded-full shadow-xs">
                {activeHotspot ? activeHotspot.name : '移动照一照'}
              </span>
            </div>
            {/* 放大镜手柄 */}
            <div className="w-4 h-12 bg-amber-800 rounded-b-md mx-auto -mt-1 shadow-md transform rotate-25 origin-top" />
          </div>

          {/* 拖拽提示指示 */}
          <div className="absolute bottom-2 left-3 bg-white/85 px-3 py-1 rounded-lg text-xs text-stone-600 font-medium pointer-events-none">
            💡 点击或用手指拖动放大镜照一照
          </div>
        </div>

        {/* 2. 温和语音与反馈引导气泡 */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 sm:p-4 flex items-start gap-3">
          <span className="text-2xl mt-0.5" aria-hidden="true">💬</span>
          <div className="flex-1">
            <p className="text-base sm:text-lg font-bold text-stone-800 leading-snug">
              {feedbackPrompt}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetGame}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold transition-colors shrink-0"
          >
            重新开始
          </button>
        </div>

        {/* 3. 已发现线索卡待分堆 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-stone-800">
              发现的线索卡片（点击卡片，再点击下方盒子归类）
            </h3>
            {discoveredClueIds.length === 0 && (
              <span className="text-xs text-stone-500">先用上面的放大镜找线索哦</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 min-h-[72px]">
            {discoveredClueIds.map((id) => {
              const clue = currentHotspots.find((h) => h.id === id);
              if (!clue) return null;
              const isPlaced = placements[id] !== undefined;
              const isSelected = selectedClueId === id;

              return (
                <div
                  key={id}
                  onClick={() => handleSelectCard(id)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 min-h-[56px] ${
                    isSelected
                      ? 'bg-amber-100 border-amber-500 shadow-md scale-102 ring-2 ring-amber-300'
                      : isPlaced
                      ? 'bg-stone-100 border-stone-300 opacity-60'
                      : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0" aria-hidden="true">{clue.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-stone-800 truncate">{clue.name}</p>
                      <p className="text-xs text-stone-500 line-clamp-1">{clue.foundDescription}</p>
                    </div>
                  </div>

                  {isPlaced ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUndoPlacement(id);
                      }}
                      className="text-xs px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-md shrink-0"
                      aria-label={`取出${clue.name}`}
                    >
                      放回
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md shrink-0">
                      {isSelected ? '已选' : '点击选择'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. 分类目标盒 (Sorting Baskets) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {currentBaskets.map((basket) => {
            const placedInThisBasket = currentHotspots.filter(
              (h) => placements[h.id] === basket.id
            );

            return (
              <div
                key={basket.id}
                onClick={() => handlePlaceIntoBasket(basket.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 ${basket.borderColor} ${basket.colorBg} cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between min-h-[140px]`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl" aria-hidden="true">{basket.icon}</span>
                      <h4 className="text-base sm:text-lg font-black text-stone-900">
                        {basket.label}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-stone-500 bg-white/70 px-2 py-0.5 rounded-full">
                      {placedInThisBasket.length} 张
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-medium mb-2.5">
                    {basket.subLabel}
                  </p>
                </div>

                {/* 放在该盒子里的卡片缩略列表 */}
                <div className="space-y-1.5">
                  {placedInThisBasket.map((clue) => (
                    <div
                      key={clue.id}
                      className="bg-white/90 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs flex items-center justify-between shadow-2xs"
                    >
                      <span className="font-bold text-stone-800 truncate mr-1">
                        {clue.icon} {clue.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUndoPlacement(clue.id);
                        }}
                        className="text-stone-400 hover:text-stone-700 font-black px-1"
                        aria-label="移出卡片"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {placedInThisBasket.length === 0 && (
                    <div className="text-center py-2 text-xs text-stone-400 border border-dashed border-stone-300 rounded-lg">
                      点击放入这里
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. 探索梳理与理性大结局 */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setFeedbackPrompt('有些事情我们暂时还不知道，这是很正常的！不用急着猜。');
              speechNarrator.speak('有些事情我们暂时还不知道，这是很正常的！不用急着猜。');
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-sm font-bold transition-colors"
          >
            🤔 我还不确定 / 需要再看看
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsSynthesisOpen(true);
              speechNarrator.speak('太棒了小侦探！我们把拍到的照片和心里的猜想分得清清楚楚。');
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-base font-black shadow-md transition-all active:scale-98"
          >
            查看侦探破案手册 ✨
          </button>
        </div>
      </div>

      {/* 破案总结浮层 (Synthesis Modal) */}
      {isSynthesisOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 border-2 border-amber-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl" aria-hidden="true">🎉</span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                    小侦探的破案发现
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    场景：{scenario.sceneTitle} · 审核冻结版本
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSynthesisOpen(false)}
                className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xl font-bold cursor-pointer"
                aria-label="关闭总结"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-stone-800 text-sm sm:text-base leading-relaxed max-h-[60vh] overflow-y-auto">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <p className="font-black text-emerald-950 mb-1.5 flex items-center gap-1.5">
                  <span>👀</span>
                  <span>眼睛拍到的客观事实：</span>
                </p>
                <ul className="text-emerald-900 text-xs sm:text-sm space-y-1.5">
                  {currentHotspots
                    .filter((h) => h.category === 'FACT')
                    .map((h) => (
                      <li key={h.id} className="flex items-start gap-1.5">
                        <span className="shrink-0">{h.icon}</span>
                        <span><strong>{h.name}</strong>：{h.foundDescription}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                <p className="font-black text-amber-950 mb-1.5 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>脑袋里的猜想泡泡：</span>
                </p>
                <ul className="text-amber-900 text-xs sm:text-sm space-y-1.5">
                  {currentHotspots
                    .filter((h) => h.category === 'INFERENCE')
                    .map((h) => (
                      <li key={h.id} className="flex items-start gap-1.5">
                        <span className="shrink-0">{h.icon}</span>
                        <span><strong>{h.name}</strong>：{h.foundDescription}</span>
                      </li>
                    ))}
                </ul>
                <p className="text-xs text-amber-800 font-bold mt-2">
                  提示：猜想没有眼睛拍到的证据，不能直接当真哦。
                </p>
              </div>

              <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200">
                <p className="font-black text-sky-950 mb-1.5 flex items-center gap-1.5">
                  <span>❓</span>
                  <span>永远保持的清醒盲区（未知）：</span>
                </p>
                <ul className="text-sky-900 text-xs sm:text-sm space-y-1.5">
                  {currentHotspots
                    .filter((h) => h.category === 'UNKNOWN')
                    .map((h) => (
                      <li key={h.id} className="flex items-start gap-1.5">
                        <span className="shrink-0">{h.icon}</span>
                        <span><strong>{h.name}</strong>：{h.foundDescription}</span>
                      </li>
                    ))}
                </ul>
                <p className="text-xs text-sky-800 font-bold mt-2">
                  承认“现在还不知道”是最有力量的事，绝不凭空冤枉同伴！
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSynthesisOpen(false)}
                className="min-h-[52px] px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black transition-colors cursor-pointer"
              >
                我知道啦，继续探索
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
