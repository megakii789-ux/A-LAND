import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';
import { CompanionBanner } from './CompanionBanner';
import { AlwaysReachableCalmCard } from './AlwaysReachableCalmCard';
import { HugSupportEntry } from './HugSupportEntry';
import { LocationCard } from './LocationCard';

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

/**
 * 晴雨小岛 · 儿童首页 Shell (Child Island Home Shell)
 * 严格遵循 Phase D 规范：
 * 1. 保留现有世界观和地点，不增加地点：
 *    - 情绪天气站
 *    - 故事林
 *    - 想法侦探社
 *    - 勇气说话屋
 *    - 两个家的桥
 *    - 星光小屋
 *    - （困难拆解小工具 + 印记馆保留）
 * 2. 孩子端绝对不显示内部技术术语：
 *    - 禁止 P1-P6、分通择、研究代码 F1-F7、状态码
 * 3. 页面优先呈现核心四要素：
 *    - 小岛/地点视觉入口
 *    - 当前简单问候
 *    - 永远可达的真人求助入口 (HugSupportEntry)
 *    - 永远可达的平静角 (AlwaysReachableCalmCard)
 * 4. 卡片规范：
 *    - title 为主，字体 22-26px
 *    - 一句非常短的 child copy
 *    - narrator / audio affordance（喇叭朗读）
 *    - 不依赖阅读才能理解（大图标与色彩隐喻）
 * 5. 布局适配与无障碍：
 *    - 390px 2-column 网格极度稳定，360px 可降级单列或紧凑双列
 *    - 零横向滚动 (zero horizontal overflow)
 *    - 底部安全留白 (bottom safe-area padding >= 80px)
 *    - 支持 prefers-reduced-motion，无障碍 aria-label 与键盘交互
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

  const [isMedalsOpen, setIsMedalsOpen] = useState(false);
  const [isBreakerOpen, setIsBreakerOpen] = useState(false);

  // Modal open states based on childPlace
  const isWeatherOpen = childPlace === 'weather';
  const isCalmOpen = childPlace === 'calm';
  const isStoryOpen = childPlace === 'story';
  const isDetectiveOpen = childPlace === 'detective';
  const isCourageOpen = childPlace === 'courage';
  const isBridgeOpen = childPlace === 'bridge';
  const isStarlightOpen = childPlace === 'starlight';

  const handleOpenPlace = (place: typeof childPlace) => {
    sounds.playClick();
    setChildPlace(place);
  };

  const handleCloseModal = () => {
    setChildPlace('island');
  };

  const sunCount = medals.filter((m) => m.type === 'sun' && m.unlocked).length;
  const rainCount = medals.filter((m) => m.type === 'rain' && m.unlocked).length;

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-100 via-emerald-50/60 to-amber-50/70 px-3 sm:px-6 pt-3 pb-28 sm:pb-32 relative overflow-x-hidden flex flex-col justify-between">
      {/* Decorative calm background elements */}
      <div className="absolute top-12 left-10 w-32 h-16 bg-white/40 rounded-full blur-xs pointer-events-none" />
      <div className="absolute top-24 right-16 w-48 h-20 bg-white/50 rounded-full blur-xs pointer-events-none" />
      <div className="absolute -bottom-16 left-0 right-0 h-40 bg-linear-to-t from-emerald-200/50 to-transparent rounded-t-[50%] pointer-events-none" />

      {/* 1. Top Section: Companion Greeting Banner + Medals Entry */}
      <div className="relative max-w-5xl mx-auto w-full pt-1 sm:pt-2 space-y-3">
          <CompanionBanner />

          {/* 晴雨小岛全景插画画卷 (Island Storybook Panorama) */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-sky-200/90 shadow-md bg-white/60">
            <IslandPanoramaIllustration className="w-full h-36 sm:h-48 md:h-56 object-cover" />
            <div className="absolute bottom-2.5 left-3 sm:bottom-3 sm:left-4 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-sky-200 text-xs sm:text-sm font-black text-sky-900 shadow-2xs flex items-center gap-1.5">
              <span>🏝️ 晴雨小岛</span>
              <span className="text-stone-400 font-normal">·</span>
              <span className="text-stone-700 font-bold">今天也是安心探索的一天</span>
            </div>
          </div>

          {/* 2. Top Priority: Always Reachable Calm Corner (永远可达的平静角) */}
          <AlwaysReachableCalmCard onOpenCalm={() => handleOpenPlace('calm')} />

          {/* 印记馆轻量入口 (中性无竞争记录) */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsMedalsOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/85 hover:bg-white border border-amber-200 rounded-2xl text-sm sm:text-base font-bold text-amber-900 transition-all shadow-2xs cursor-pointer min-h-[44px]"
              aria-label="打开晴雨印记馆"
            >
              <span>晴雨印记</span>
              <span className="text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                {sunCount}☀️ {rainCount}💧
              </span>
            </button>
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
            borderColor="border-sky-200"
            hoverBorderColor="hover:border-sky-400"
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
            borderColor="border-emerald-200"
            hoverBorderColor="hover:border-emerald-400"
            onOpen={() => handleOpenPlace('story')}
            badge={completedLeaves.length > 0 ? `已看 ${completedLeaves.length} 个故事` : undefined}
          />

          {/* 地点 3: 想法侦探社 */}
          <LocationCard
            id="detective"
            locationType="detective"
            title="想法侦探社"
            shortCopy="用放大镜找线索，试试新想法"
            icon="🔍"
            accentBg="bg-amber-100"
            accentColor="text-amber-700"
            borderColor="border-amber-200"
            hoverBorderColor="hover:border-amber-400"
            onOpen={() => handleOpenPlace('detective')}
          />

          {/* 地点 4: 勇气说话屋 */}
          <LocationCard
            id="courage"
            locationType="courage"
            title="勇气说话屋"
            shortCopy="学会把心里话好好告诉大人"
            icon="💬"
            accentBg="bg-rose-100"
            accentColor="text-rose-700"
            borderColor="border-rose-200"
            hoverBorderColor="hover:border-rose-400"
            onOpen={() => handleOpenPlace('courage')}
          />

          {/* 地点 5: 两个家的桥 */}
          <LocationCard
            id="bridge"
            locationType="bridge"
            title="两个家的桥"
            shortCopy="看交接日历、收拾小书包与想念"
            icon="🌉"
            accentBg="bg-teal-100"
            accentColor="text-teal-700"
            borderColor="border-teal-200"
            hoverBorderColor="hover:border-teal-400"
            onOpen={() => handleOpenPlace('bridge')}
          />

          {/* 地点 6: 星光小屋 */}
          <LocationCard
            id="starlight"
            locationType="starlight"
            title="星光小屋"
            shortCopy="点亮你的独特爱好与强项拼图"
            icon="⭐"
            accentBg="bg-indigo-100"
            accentColor="text-indigo-700"
            borderColor="border-indigo-200"
            hoverBorderColor="hover:border-indigo-400"
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
            badge="呼吸引导"
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
            className="group bg-linear-to-r from-amber-100/90 via-orange-50/90 to-amber-100/90 hover:from-amber-100 hover:to-orange-100 p-4 sm:p-5 rounded-3xl border-2 border-amber-300/80 shadow-md hover:shadow-xl transition-all duration-200 motion-reduce:transition-none cursor-pointer flex items-center justify-between gap-3"
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
    </div>
  );
};
