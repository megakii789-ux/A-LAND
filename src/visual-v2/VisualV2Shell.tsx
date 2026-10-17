import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { AlwaysReachableCalmCard } from '../components/ChildIsland/AlwaysReachableCalmCard';
import { HugSupportEntry } from '../components/ChildIsland/HugSupportEntry';
import { WeatherStationModal } from '../components/ChildIsland/WeatherStationModal';
import { CalmSpace } from '../components/ChildIsland/CalmSpace';
import { CalmCornerModal } from '../components/ChildIsland/CalmCornerModal';
import { StoryGroveModal } from '../components/ChildIsland/StoryGrove/StoryGroveModal';
import { ThoughtDetectiveLabModal } from '../components/ChildIsland/ThoughtDetectiveLab/ThoughtDetectiveLabModal';
import { CourageHouseModal } from '../components/ChildIsland/CourageHouse/CourageHouseModal';
import { TwoHomesBridgeModal } from '../components/ChildIsland/TwoHomesBridge/TwoHomesBridgeModal';
import { StarlightCabinModal } from '../components/ChildIsland/StarlightCabin/StarlightCabinModal';
import { DifficultyBreakerModal } from '../components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal';
import { MedalsModal } from '../components/ChildIsland/Medals/MedalsModal';
import { MedalUnlockedToast } from '../components/ChildIsland/Medals/MedalUnlockedToast';
import { InteractiveGamesHubModal } from '../components/InteractiveGames/InteractiveGamesHubModal';
import { PersonalizationSettingsModal } from '../components/ChildIsland/Personalization/PersonalizationSettingsModal';
import { IslandUiIconSvg } from '../components/ChildIsland/CompanionIcons';
import { sounds } from '../utils/sound';
import { speechNarrator } from '../utils/speech';
import {
  clearActiveLandmarkSession,
  loadProductExperienceMetrics,
  recordLandmarkVisit,
  subscribeProductExperienceMetrics,
} from '../domain/cognitive/productExperienceMetrics';
import { IslandMapV2 } from './IslandMapV2';
import { SceneBackdropV2, ActiveV2SceneKey } from './SceneBackdropV2';
import {
  V2ArtDirectorHoldBanner,
  V2CompanionBanner,
  V2ChildAudioBar,
  V2ParentDashboardShell,
} from './V2UIStateComponents';
import { isExplicitQaDebugMode } from './adapters/V2_3LayerStageAdapter';
import { effectSvgUrl } from './AlandVisualAssets';
import './motion/asset_interaction_motion.css';

export interface VisualV2ShellProps {
  onExitV2Review?: () => void;
}

/**
 * VisualV2Shell — A-LAND V2 独立视觉评审壳 (`/visual-v2-review`)
 * 契约：
 * - 不修改任何冻结业务层 (`AppContext`、`domain/**`、`speech.ts`、`ContentAuditRegistry`、`parentAccess`)；
 * - 所有地点事件、四伙伴语音、暂停切换恢复、Slice A/B/C、拆解器、求助、家长门禁与内容审核 Fail-Closed 100% 走原业务逻辑；
 * - 门禁元数据保留在 DOM data-* 属性、/version.json 与审计文件中；QA 调试条仅在显式 `?qa=1` 时展示。
 */
export const VisualV2Shell: React.FC<VisualV2ShellProps> = ({ onExitV2Review }) => {
  const {
    currentView,
    childPlace,
    setChildPlace,
    selectedLeafId,
    completedLeaves,
    medals,
    personalization,
    updatePersonalization,
    requestHug,
  } = useApp();

  const [viewMode, setViewMode] = useState<'map' | 'cards'>('map');
  const [isMedalsOpen, setIsMedalsOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isBreakerOpen, setIsBreakerOpen] = useState(false);
  const [isCalmCornerModalOpen, setIsCalmCornerModalOpen] = useState(false);
  const [isGamesHubOpen, setIsGamesHubOpen] = useState(false);
  const [selectedHubGame, setSelectedHubGame] = useState<
    'detective' | 'friend_asks' | 'boat' | 'transfer'
  >('detective');
  const [expMetrics, setExpMetrics] = useState(() => loadProductExperienceMetrics());

  useEffect(() => {
    return subscribeProductExperienceMetrics((m) => {
      setExpMetrics(m);
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      const pathname = window.location.pathname || '';
      if (pathname.startsWith('/visual-v2-review/story-cup-pilot')) {
        recordLandmarkVisit('story');
        setChildPlace('story');
      } else if (
        pathname.startsWith('/visual-v2-review/weather-station-pilot') ||
        pathname.startsWith('/visual-v2-review/batch01-weather')
      ) {
        recordLandmarkVisit('weather');
        setChildPlace('weather');
      } else if (pathname.startsWith('/visual-v2-review/calm-corner-modal-pilot')) {
        recordLandmarkVisit('calm');
        setIsCalmCornerModalOpen(true);
      } else if (
        pathname.startsWith('/visual-v2-review/calm-corner-pilot') ||
        pathname.startsWith('/visual-v2-review/batch01-calm')
      ) {
        recordLandmarkVisit('calm');
        setChildPlace('calm');
      }
    }
  }, [setChildPlace]);

  const reducedMotion = Boolean(personalization.accessibility.reducedMotion);
  const showQaStrip = isExplicitQaDebugMode();

  const isWeatherOpen = childPlace === 'weather';
  const isCalmOpen = childPlace === 'calm';
  const isStoryOpen = childPlace === 'story';
  const isDetectiveOpen = childPlace === 'detective';
  const isCourageOpen = childPlace === 'courage';
  const isBridgeOpen = childPlace === 'bridge';
  const isStarlightOpen = childPlace === 'starlight';

  const activeSceneKey: ActiveV2SceneKey | null = isBreakerOpen
    ? 'breaker'
    : childPlace !== 'island'
      ? childPlace
      : null;

  const handleOpenPlace = (place: typeof childPlace) => {
    speechNarrator.stop();
    sounds.playModalOpen();
    if (place !== 'island') {
      recordLandmarkVisit(place);
    }
    setChildPlace(place);
  };

  const handleCloseModal = () => {
    speechNarrator.stop();
    sounds.playModalClose();
    clearActiveLandmarkSession();
    setChildPlace('island');
  };

  const handleToggleReducedMotion = () => {
    updatePersonalization({
      accessibility: {
        ...personalization.accessibility,
        reducedMotion: !reducedMotion,
      },
    });
  };

  const sunCount = medals.filter((m) => m.type === 'sun' && m.unlocked).length;
  const rainCount = medals.filter((m) => m.type === 'rain' && m.unlocked).length;

  return (
    <div
      data-testid="visual-v2-shell"
      data-artwork-status="ASSET_ARTWORK_BLOCKED"
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      data-tech-preview="TECH_PREVIEW_NOT_ART_APPROVED"
      className={`aland-v2-scope min-h-screen flex flex-col font-sans antialiased select-none max-w-full ${
        reducedMotion ? 'aland-v2-reduce-motion' : ''
      }`}
    >
      {/* 既有顶栏：完整保留家长门禁、静音与隐私声明入口 */}
      <Navbar />

      {/* QA 审阅顶部控制栏：仅在显式 ?qa=1 时展示可视化条，儿童正常阅读界面隐藏为元数据标记 */}
      {showQaStrip ? (
        <div
          data-testid="v2-review-top-strip"
          className="max-w-5xl mx-auto w-full px-3 sm:px-6 pt-2 space-y-2"
        >
          <V2ArtDirectorHoldBanner />

          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-2xl bg-white/85 border border-[#72CBFF]/50 text-xs font-bold text-[#123C5C]">
            <div className="flex items-center gap-2 flex-wrap">
              <img src={effectSvgUrl('leaf')} alt="" className="w-4 h-4" />
              <span>QA 审阅模式 (`?qa=1`) · Batch01R 视觉纠偏</span>
              <span
                data-testid="v2-pilot-gate-badge"
                className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black"
              >
                ASSET_ARTWORK_BLOCKED · ART_DIRECTOR_QA_HOLD
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                data-testid="v2-open-weather-pilot-btn"
                onClick={() => handleOpenPlace('weather')}
                className="min-h-[56px] px-3.5 py-1.5 rounded-xl border-2 border-sky-400 bg-sky-100 hover:bg-sky-200 text-sky-950 font-black cursor-pointer"
              >
                打开天气站样板
              </button>
              <button
                type="button"
                data-testid="v2-open-calm-pilot-btn"
                onClick={() => handleOpenPlace('calm')}
                className="min-h-[56px] px-3.5 py-1.5 rounded-xl border-2 border-teal-400 bg-teal-100 hover:bg-teal-200 text-teal-950 font-black cursor-pointer"
              >
                打开平静角样板
              </button>
              <button
                type="button"
                data-testid="v2-open-story-cup-pilot-btn"
                onClick={() => handleOpenPlace('story')}
                className="min-h-[56px] px-3.5 py-1.5 rounded-xl border-2 border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black cursor-pointer"
              >
                打开《一只杯子》样板
              </button>
              <button
                type="button"
                data-testid="v2-reduced-motion-toggle"
                aria-pressed={reducedMotion}
                onClick={handleToggleReducedMotion}
                className="min-h-[56px] px-3 py-1 rounded-xl border border-[#18B7A4]/50 bg-[#FFF9EC] hover:bg-[#FFD67A]/40 text-[#123C5C] font-extrabold cursor-pointer"
              >
                {reducedMotion ? '已开启减少动画' : '减少动画'}
              </button>
              {onExitV2Review && (
                <button
                  type="button"
                  data-testid="v2-exit-review-btn"
                  onClick={onExitV2Review}
                  className="min-h-[56px] px-3 py-1 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-extrabold cursor-pointer"
                >
                  返回原版皮肤 (`/`)
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          data-testid="v2-art-director-hold-banner"
          data-art-gate="ART_DIRECTOR_QA_HOLD"
          data-artwork-status="ASSET_ARTWORK_BLOCKED"
          className="sr-only"
          aria-hidden="true"
        />
      )}

      <main className="flex-1">
        {currentView === 'parent' ? (
          <V2ParentDashboardShell />
        ) : (
          <div
            data-testid="v2-child-island-home"
            className="max-w-5xl mx-auto w-full px-3 sm:px-6 pt-2 pb-32 sm:pb-36 space-y-3 sm:space-y-4"
          >
            {/* 1. V2 四伙伴问候与快速切换横幅 */}
            <V2CompanionBanner
              onOpenSettings={() => setIsPersonalizationOpen(true)}
              reducedMotion={reducedMotion}
            />

            {/* 2. 永远可达的绿草平静角与大困难拆解入口 */}
            <AlwaysReachableCalmCard
              onOpenCalm={() => handleOpenPlace('calm')}
              onOpenBreaker={() => {
                sounds.playClick();
                recordLandmarkVisit('breaker');
                setIsBreakerOpen(true);
              }}
            />

            {/* 3. 首屏现实求助常驻入口 (100% 保持 SEND_FAILED 本地实话契约) */}
            <div
              className="bg-[#FFF0F3] border-2 border-[#FFB6C9] rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2"
              role="region"
              aria-label="首屏现实求助常驻入口"
            >
              <div className="hidden sm:flex items-center gap-2 pl-2">
                <img src={effectSvgUrl('heart')} alt="" className="w-5 h-5" />
                <div>
                  <p className="text-sm sm:text-base text-[#123C5C] font-extrabold">
                    随时可以停下来休息，或者找身边的大人抱一抱！
                  </p>
                  <p className="text-xs text-stone-600 font-medium">
                    没有倒计时 · 没有分数 · 本机离线求助不会伪造远程已送达
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <HugSupportEntry />
              </div>
            </div>

            {/* 4. 地图模式 vs 清晰卡片回退导航切换栏 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div
                role="tablist"
                aria-label="选择小岛展示方式"
                className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 bg-[#FFF9EC] rounded-2xl border-2 border-[#B68C64]/45 shadow-2xs"
              >
                <button
                  type="button"
                  role="tab"
                  data-testid="v2-tab-map"
                  aria-selected={viewMode === 'map'}
                  onClick={() => {
                    sounds.playCardSelect();
                    setViewMode('map');
                  }}
                  className={`min-h-[56px] px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    viewMode === 'map'
                      ? 'bg-[#18B7A4] text-white shadow-xs'
                      : 'text-[#123C5C] hover:bg-white'
                  }`}
                >
                  <IslandUiIconSvg name="map_compass" className="w-4 h-4 shrink-0" />
                  <span>童话小岛地图</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  data-testid="v2-tab-cards"
                  aria-selected={viewMode === 'cards'}
                  onClick={() => {
                    sounds.playCardSelect();
                    setViewMode('cards');
                  }}
                  className={`min-h-[56px] px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    viewMode === 'cards'
                      ? 'bg-[#18B7A4] text-white shadow-xs'
                      : 'text-[#123C5C] hover:bg-white'
                  }`}
                >
                  <IslandUiIconSvg name="card_grid" className="w-4 h-4 shrink-0" />
                  <span>清晰地点卡片</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsPersonalizationOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#FFF9EC] hover:bg-white border-2 border-[#B68C64]/45 rounded-2xl text-xs sm:text-sm font-black text-[#123C5C] min-h-[56px] whitespace-nowrap cursor-pointer"
                  aria-label="打开小岛偏好与无障碍设置"
                >
                  <IslandUiIconSvg name="calm_leaf" className="w-4 h-4 shrink-0" />
                  <span>偏好</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsMedalsOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#FFF9EC] hover:bg-white border-2 border-[#FFD67A] rounded-2xl text-xs sm:text-sm font-black text-[#123C5C] min-h-[56px] whitespace-nowrap cursor-pointer"
                  aria-label="打开晴雨印记馆"
                >
                  <IslandUiIconSvg name="medals_star" className="w-4 h-4 shrink-0" />
                  <span>晴雨印记</span>
                  <span className="text-[11px] bg-[#FFD67A]/60 px-2 py-0.5 rounded-full font-extrabold">
                    {sunCount}阳 {rainCount}雨
                  </span>
                </button>
              </div>
            </div>

            {/* 5. V2 分层主岛与 8 大透明地标 */}
            <IslandMapV2
              companionId={personalization.companionId}
              reducedMotion={reducedMotion}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onSelectPlace={handleOpenPlace}
              onOpenBreaker={() => {
                sounds.playClick();
                recordLandmarkVisit('breaker');
                setIsBreakerOpen(true);
              }}
              completedStoriesCount={completedLeaves.length}
              completedDetectiveCasesCount={expMetrics.completedDetectiveCaseIds.length}
              sunCount={sunCount}
              rainCount={rainCount}
            />

            {/* 6. V2 伴读音频控制条 (只换图形，不改音频实现) */}
            <V2ChildAudioBar />

            {/* 7. 真实动动手探险游戏集入口 */}
            <div className="bg-gradient-to-r from-[#FFF9EC] via-[#EAF9F6] to-[#E8F4FE] border-2 border-[#18B7A4]/45 rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD67A] text-[#123C5C] flex items-center justify-center shrink-0 shadow-2xs">
                  <img src={effectSvgUrl('book')} alt="" className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-xl font-black text-[#123C5C]">
                      真实动动手探险游戏
                    </h2>
                    <span className="text-xs bg-[#18B7A4]/20 text-[#123C5C] px-2 py-0.5 rounded-full font-extrabold">
                      内容审核门禁生效
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 font-medium mt-0.5">
                    《蜡笔侦探》·《问起我的家》·《小船协商》（未过审内容在儿童端严格 Fail-Closed 拦截）
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="v2-open-games-hub-btn"
                onClick={() => {
                  sounds.playClick();
                  setSelectedHubGame('detective');
                  setIsGamesHubOpen(true);
                }}
                className="w-full sm:w-auto min-h-[56px] px-5 py-3 rounded-2xl bg-[#18B7A4] hover:bg-[#149E8D] text-white font-black text-sm sm:text-base shadow-sm cursor-pointer whitespace-nowrap"
                aria-label="打开真实动动手探险游戏集"
              >
                立刻开始玩
              </button>
            </div>
          </div>
        )}
      </main>

      {/* V2 场景独立 SVG 底图与透明道具背板 (当任一场景弹窗打开时同步呈现) */}
      <SceneBackdropV2 sceneKey={activeSceneKey} reducedMotion={reducedMotion} />

      {/* 100% 真实业务场景弹窗 (完全复用既有组件与 Sprint 4.3 状态契约) */}
      <WeatherStationModal
        isOpen={isWeatherOpen}
        onClose={handleCloseModal}
        onGoToCalm={() => setChildPlace('calm')}
        visualV2Pilot={true}
      />

      <CalmSpace
        isOpen={isCalmOpen}
        onClose={handleCloseModal}
        onNavigateHome={handleCloseModal}
        visualV2Pilot={true}
      />

      <CalmCornerModal
        isOpen={isCalmCornerModalOpen}
        onClose={() => setIsCalmCornerModalOpen(false)}
        onRequestHug={requestHug}
        visualV2Pilot={true}
      />

      <StoryGroveModal
        isOpen={isStoryOpen}
        onClose={handleCloseModal}
        initialLeafId={selectedLeafId}
        visualV2Pilot={true}
      />

      <ThoughtDetectiveLabModal
        isOpen={isDetectiveOpen}
        onClose={handleCloseModal}
      />

      <CourageHouseModal
        isOpen={isCourageOpen}
        onClose={handleCloseModal}
      />

      <TwoHomesBridgeModal
        isOpen={isBridgeOpen}
        onClose={handleCloseModal}
      />

      <StarlightCabinModal
        isOpen={isStarlightOpen}
        onClose={handleCloseModal}
      />

      <DifficultyBreakerModal
        isOpen={isBreakerOpen}
        onClose={() => setIsBreakerOpen(false)}
      />

      <MedalsModal
        isOpen={isMedalsOpen}
        onClose={() => setIsMedalsOpen(false)}
      />

      <MedalUnlockedToast onOpenMedals={() => setIsMedalsOpen(true)} />

      <InteractiveGamesHubModal
        isOpen={isGamesHubOpen}
        onClose={() => setIsGamesHubOpen(false)}
        initialGame={selectedHubGame}
      />

      <PersonalizationSettingsModal
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
      />
    </div>
  );
};
