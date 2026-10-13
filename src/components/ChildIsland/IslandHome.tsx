import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';
import { CompanionBanner } from './CompanionBanner';
import { AlwaysReachableCalmCard } from './AlwaysReachableCalmCard';
import { HugSupportEntry } from './HugSupportEntry';
import { LocationCard } from './LocationCard';
import { FairytaleIslandMap } from './FairytaleIslandMap';
import { ChildAudioBar } from './ChildAudioBar';

// Modal imports
import { WeatherStationModal } from './WeatherStationModal';
import { CalmSpace } from './CalmSpace';
import { StoryGroveModal } from './StoryGrove/StoryGroveModal';
import { ThoughtDetectiveLabModal } from './ThoughtDetectiveLab/ThoughtDetectiveLabModal';
import { CourageHouseModal } from './CourageHouse/CourageHouseModal';
import { TwoHomesBridgeModal } from './TwoHomesBridge/TwoHomesBridgeModal';
import { StarlightCabinModal } from './StarlightCabin/StarlightCabinModal';
import { DifficultyBreakerModal } from './DifficultyBreaker/DifficultyBreakerModal';
import { MedalsModal } from './Medals/MedalsModal';
import { MedalUnlockedToast } from './Medals/MedalUnlockedToast';
import { IslandPanoramaIllustration } from './StoryGrove/StoryIllustrations';
import { Interactive3DCard } from '../common/Interactive3DCard';
import { InteractiveGamesHubModal } from '../InteractiveGames/InteractiveGamesHubModal';
import { PersonalizationSettingsModal } from './Personalization/PersonalizationSettingsModal';

/**
 * 晴雨小岛 · 儿童首页 Shell (Child Island Home Shell)
 * 严格遵循 AG-04A 视觉与交互体系升级：
 * 1. 升级为“可探索的童话小岛”，保留清晰卡片导航作为无障碍回退方式；
 * 2. 六个主要地点具备专属视觉身份：
 *    - 情绪天气站：云朵、天气、可感知的天空变化；
 *    - 故事林：树林、小动物与可打开的故事；
 *    - 想法侦探社：放大镜、线索、小型机关；
 *    - 勇气说话屋：可选择的对话角色与安全表达空间；
 *    - 照顾小桥：生活安排、不同住所和中性的家庭称呼；
 *    - 星光小屋：角色兴趣、作品与多面自我；
 * 3. 伴读音频控制条：可重听、暂停、终止，设备缺少中文语音包时明确提示；
 * 4. 触控目标不小于 56x56 CSS px，核心操作区不小于 64px 高；
 * 5. 绝对无全局 overflow-x:hidden 掩盖溢出，自然布局无横向滚动；
 * 6. 底部留白 pb-32 sm:pb-36，安全支持栏绝不遮挡入口。
 */
export const IslandHome: React.FC = () => {
  const {
    childPlace,
    setChildPlace,
    selectedLeafId,
    requestHug,
    completedLeaves,
    medals
  } = useApp();

  const [viewMode, setViewMode] = useState<'map' | 'cards'>('map');
  const [isMedalsOpen, setIsMedalsOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isBreakerOpen, setIsBreakerOpen] = useState(false);
  const [isGamesHubOpen, setIsGamesHubOpen] = useState(false);
  const [selectedHubGame, setSelectedHubGame] = useState<'detective' | 'friend_asks' | 'boat' | 'transfer'>('detective');

  // Modal open states based on childPlace
  const isWeatherOpen = childPlace === 'weather';
  const isCalmOpen = childPlace === 'calm';
  const isStoryOpen = childPlace === 'story';
  const isDetectiveOpen = childPlace === 'detective';
  const isCourageOpen = childPlace === 'courage';
  const isBridgeOpen = childPlace === 'bridge';
  const isStarlightOpen = childPlace === 'starlight';

  const handleOpenPlace = (place: typeof childPlace) => {
    speechNarrator.stop();
    sounds.playClick();
    setChildPlace(place);
  };

  const handleCloseModal = () => {
    speechNarrator.stop();
    setChildPlace('island');
  };

  const sunCount = medals.filter((m) => m.type === 'sun' && m.unlocked).length;
  const rainCount = medals.filter((m) => m.type === 'rain' && m.unlocked).length;

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-100 via-emerald-50/60 to-amber-50/70 px-3 sm:px-6 pt-3 pb-32 sm:pb-36 relative flex flex-col justify-between max-w-full">
      {/* Decorative calm background elements contained without global overflow-x: hidden */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-12 left-10 w-32 h-16 bg-white/40 rounded-full blur-xs" />
        <div className="absolute top-24 right-16 w-48 h-20 bg-white/50 rounded-full blur-xs" />
        <div className="absolute -bottom-16 left-0 right-0 h-40 bg-linear-to-t from-emerald-200/50 to-transparent rounded-t-[50%]" />
      </div>

      {/* 1. Top Section: Companion Greeting Banner + Audio Bar + Medals Entry */}
      <div className="relative max-w-5xl mx-auto w-full pt-1 sm:pt-2 space-y-3">
        <CompanionBanner onOpenSettings={() => setIsPersonalizationOpen(true)} />

        {/* AG-04A: 全功能儿童伴读音频控制条 (重听/暂停/停止/环境声/缺失中文语音包明确警告) */}
        <ChildAudioBar />

        {/* 晴雨小岛全景插画画卷 (3D 触感全景浮层) */}
        <Interactive3DCard
          maxTilt={6}
          perspective={1200}
          className="relative overflow-hidden rounded-3xl border-2 border-sky-200/90 shadow-md hover:shadow-xl bg-white/60 transition-shadow"
        >
          <IslandPanoramaIllustration className="w-full h-36 sm:h-48 md:h-56 object-cover" />
          <div
            style={{ transform: 'translateZ(26px)' }}
            className="absolute bottom-2.5 left-3 sm:bottom-3 sm:left-4 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-sky-200 text-xs sm:text-sm font-black text-sky-900 shadow-md flex items-center gap-1.5"
          >
            <span>🏝️ 晴雨小岛</span>
            <span className="text-stone-400 font-normal">·</span>
            <span className="text-stone-700 font-bold">今天也是安心探索的一天</span>
          </div>
        </Interactive3DCard>

        {/* 2. Top Priority: Always Reachable Calm Corner (永远可达的平静角) */}
        <AlwaysReachableCalmCard onOpenCalm={() => handleOpenPlace('calm')} />

        {/* 浏览模式切换与偏好/印记馆入口 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* 地图探索 vs 清晰卡片切换器 */}
          <div
            role="tablist"
            aria-label="选择小岛展示方式"
            className="flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-stone-200 shadow-2xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'map'}
              onClick={() => {
                sounds.playClick();
                setViewMode('map');
              }}
              className={`min-h-[48px] px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none ${
                viewMode === 'map'
                  ? 'bg-amber-400 text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span>🗺️</span>
              <span>童话小岛地图</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'cards'}
              onClick={() => {
                sounds.playClick();
                setViewMode('cards');
              }}
              className={`min-h-[48px] px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none ${
                viewMode === 'cards'
                  ? 'bg-amber-400 text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span>📋</span>
              <span>清晰地点卡片</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* 受控儿童偏好设置入口 (AG-04B) */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsPersonalizationOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/90 hover:bg-white border-2 border-stone-200 hover:border-amber-300 rounded-2xl text-sm sm:text-base font-bold text-stone-800 transition-all shadow-2xs cursor-pointer min-h-[48px] focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
              aria-label="打开小岛偏好与无障碍设置"
            >
              <span>🌿</span>
              <span>偏好</span>
            </button>

            {/* 印记馆轻量入口 (中性无竞争记录) */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsMedalsOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white border-2 border-amber-200 rounded-2xl text-sm sm:text-base font-bold text-amber-900 transition-all shadow-2xs cursor-pointer min-h-[48px] focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
              aria-label="打开晴雨印记馆"
            >
              <span>晴雨印记</span>
              <span className="text-xs text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-bold">
                {sunCount}☀️ {rainCount}💧
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Island: 6 Core Locations (390px 2-column, 360px adaptive, 768px+ 3-column) */}
      <div className="relative max-w-5xl mx-auto w-full py-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-5">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight">
            你想先去哪儿玩？
          </h1>
          <p className="text-base sm:text-lg text-stone-600 mt-1 font-medium">
            动动手就能玩，没有失败，也没有对错打分
          </p>
        </div>

        {/* 真实可玩互动体验入口 (AG-03: 蜡笔侦探 · 问起我的家 · 小船协商 · 独立迁移) */}
        <div className="bg-linear-to-r from-amber-100 via-teal-50 to-sky-100 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 mb-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl font-black shrink-0 shadow-xs">
              🎮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-stone-900">
                  真实动动手探险游戏
                </h2>
                <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  真实交互
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                《蜡笔侦探》(放大镜探索) · 《问起我的家》(边界防护) · 《小船协商》(利弊权衡)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setSelectedHubGame('detective');
                setIsGamesHubOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md transition-all active:scale-98"
            >
              立刻开始玩 ✨
            </button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <FairytaleIslandMap
            onSelectPlace={handleOpenPlace}
            completedStoriesCount={completedLeaves.length}
            sunCount={sunCount}
            rainCount={rainCount}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
              {/* 地点 1: 情绪天气站 */}
              <LocationCard
                id="weather"
                locationType="weather"
                title="情绪天气站"
                shortCopy="看今天头顶的天气与身体感觉"
                icon="⛅"
                accentBg="bg-sky-100"
                accentColor="text-sky-600"
                borderColor="border-sky-300"
                hoverBorderColor="hover:border-sky-500"
                badge="云朵天气"
                onOpen={() => handleOpenPlace('weather')}
              />

              {/* 地点 2: 故事林 */}
              <LocationCard
                id="story"
                locationType="story"
                title="故事林"
                shortCopy="走一圈、想一想，探索生活小故事"
                icon="📖"
                accentBg="bg-emerald-100"
                accentColor="text-emerald-700"
                borderColor="border-emerald-300"
                hoverBorderColor="hover:border-emerald-500"
                badge={completedLeaves.length > 0 ? `已读 ${completedLeaves.length} 个故事` : '绘本树丛'}
                onOpen={() => handleOpenPlace('story')}
              />

              {/* 地点 3: 想法侦探社 */}
              <LocationCard
                id="detective"
                locationType="detective"
                title="想法侦探社"
                shortCopy="用放大镜找线索，区分事实与猜测"
                icon="🔍"
                accentBg="bg-amber-100"
                accentColor="text-amber-700"
                borderColor="border-amber-300"
                hoverBorderColor="hover:border-amber-500"
                badge="放大镜线索"
                onOpen={() => handleOpenPlace('detective')}
              />

              {/* 地点 4: 勇气说话屋 */}
              <LocationCard
                id="courage"
                locationType="courage"
                title="勇气说话屋"
                shortCopy="学会把心里话好好告诉可信大人"
                icon="💬"
                accentBg="bg-rose-100"
                accentColor="text-rose-700"
                borderColor="border-rose-300"
                hoverBorderColor="hover:border-rose-500"
                badge="安全表达"
                onOpen={() => handleOpenPlace('courage')}
              />

              {/* 地点 5: 照顾小桥 (生活安排、不同住所和中性的家庭称呼) */}
              <LocationCard
                id="bridge"
                locationType="bridge"
                title="照顾小桥"
                shortCopy="看交接日历、收拾小书包与安心想念"
                icon="🌉"
                accentBg="bg-teal-100"
                accentColor="text-teal-700"
                borderColor="border-teal-300"
                hoverBorderColor="hover:border-teal-500"
                badge="中性称呼·两家"
                onOpen={() => handleOpenPlace('bridge')}
              />

              {/* 地点 6: 星光小屋 (角色兴趣、作品与多面自我) */}
              <LocationCard
                id="starlight"
                locationType="starlight"
                title="星光小屋"
                shortCopy="点亮你的独特爱好与强项拼图"
                icon="⭐"
                accentBg="bg-indigo-100"
                accentColor="text-indigo-700"
                borderColor="border-indigo-300"
                hoverBorderColor="hover:border-indigo-500"
                badge="多面自我"
                onOpen={() => handleOpenPlace('starlight')}
              />

              {/* 地点 7: 绿草呼吸平静角 (情绪调节呼吸练习) */}
              <LocationCard
                id="calm"
                locationType="calm"
                title="绿草呼吸平静角"
                shortCopy="跟随圆圈呼吸练习，放松身体平复情绪"
                icon="🌿"
                accentBg="bg-teal-100"
                accentColor="text-teal-700"
                borderColor="border-teal-300"
                hoverBorderColor="hover:border-teal-500"
                badge="随时可退回"
                onOpen={() => handleOpenPlace('calm')}
              />
            </div>

            {/* 困难拆解小台子卡片 (保持现有世界观，不增加地点) */}
            <div className="mt-4">
              <div
                onClick={() => {
                  sounds.playClick();
                  setIsBreakerOpen(true);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsBreakerOpen(true);
                  }
                }}
                className="group bg-linear-to-r from-amber-100/90 via-orange-50/90 to-amber-100/90 hover:from-amber-100 hover:to-orange-100 p-4 sm:p-5 rounded-3xl border-3 border-amber-300 hover:border-amber-400 shadow-md hover:shadow-xl transition-all duration-200 motion-reduce:transition-none cursor-pointer flex items-center justify-between gap-3 focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
                aria-label="打开大困难变小魔法拆解台"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 motion-reduce:group-hover:scale-100 transition-transform shrink-0">
                    🔨
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                        大石头变小魔法拆解台
                      </h3>
                      <span className="text-xs font-bold text-amber-900 bg-amber-200/90 px-2.5 py-0.5 rounded-full shrink-0">
                        小步走
                      </span>
                    </div>
                    <p className="text-base sm:text-lg text-stone-700 mt-0.5 leading-snug font-medium truncate sm:whitespace-normal">
                      把沉重的大问题，拆成 3 个容易迈出的小踏脚石
                    </p>
                  </div>
                </div>

                <span className="px-4 py-2.5 min-h-[48px] bg-amber-600 group-hover:bg-amber-700 text-white text-base font-black rounded-2xl shadow-xs transition-colors hidden sm:flex items-center gap-1 shrink-0">
                  <span>去拆解</span>
                  <span className="text-lg">👉</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Support Bar: 永远可达的真人求助入口 (Hug Support Entry) */}
      <div className="relative max-w-5xl mx-auto w-full pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
        <div className="text-center sm:text-left">
          <p className="text-base sm:text-lg text-stone-700 font-extrabold">
            🌱 随时可以停下来休息，或者找大人抱一抱！
          </p>
          <p className="text-sm sm:text-base text-stone-500 mt-0.5 font-medium">
            没有倒计时 · 没有分数 · 身边总有大人在
          </p>
        </div>

        {/* 永远可达的真人求助入口 (Phase D support entry) */}
        <div className="w-full sm:w-auto">
          <HugSupportEntry />
        </div>
      </div>

      {/* Place Modals (保持现有完整世界观弹窗) */}
      <WeatherStationModal
        isOpen={isWeatherOpen}
        onClose={handleCloseModal}
        onGoToCalm={() => setChildPlace('calm')}
      />

      <CalmSpace
        isOpen={isCalmOpen}
        onClose={handleCloseModal}
        onNavigateHome={handleCloseModal}
      />

      <StoryGroveModal
        isOpen={isStoryOpen}
        onClose={handleCloseModal}
        initialLeafId={selectedLeafId}
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

      {/* Difficulty Breaker Modal */}
      <DifficultyBreakerModal
        isOpen={isBreakerOpen}
        onClose={() => setIsBreakerOpen(false)}
      />

      {/* Medals Modal & Unlocked Toast */}
      <MedalsModal
        isOpen={isMedalsOpen}
        onClose={() => setIsMedalsOpen(false)}
      />

      <MedalUnlockedToast
        onOpenMedals={() => setIsMedalsOpen(true)}
      />

      {/* 真实交互小游戏总集 (AG-03) */}
      <InteractiveGamesHubModal
        isOpen={isGamesHubOpen}
        onClose={() => setIsGamesHubOpen(false)}
        initialGame={selectedHubGame}
      />

      {/* 受控个性化偏好模态弹窗 (AG-04B) */}
      <PersonalizationSettingsModal
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
      />
    </div>
  );
};
