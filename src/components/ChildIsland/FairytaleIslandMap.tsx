import React, { useState } from 'react';
import { Volume2, Sparkles, Compass, Eye, Shield, Heart, HelpCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';
import { IslandPlace } from '../../context/AppContext';
import { IslandUiIconSvg } from './CompanionIcons';

export interface FairytaleIslandMapProps {
  onSelectPlace: (place: IslandPlace) => void;
  completedStoriesCount?: number;
  sunCount?: number;
  rainCount?: number;
}

/**
 * 晴雨小岛 · 可探索童话小岛地图 (Fairytale Island Interactive Spatial Map)
 * 遵循 AG-04A 设计标准：
 * 1. 空间与地点身份独特，彻底告别单调同质卡片：
 *    - 情绪天气站：山巅晴雨观测站、云朵、天气与动态天空感知；
 *    - 故事林：古老密林深处、小动物踪迹与展开的带叶故事书；
 *    - 想法侦探社：木屋工坊、黄铜放大镜、足迹线索与事实/猜测机关；
 *    - 勇气说话屋：暖心凉亭、对话泡泡、防护爱心盾牌与对话伙伴；
 *    - 照顾小桥：横跨清泉的双家木拱桥、交接背包与中性称谓；
 *    - 星光小屋：夜空穹顶、星宿月影与多面自我拼图；
 * 2. 交互与无障碍：
 *    - 触控目标全部 >= 56x56 CSS px，核心操作区优先 >= 64px；
 *    - 键盘 Enter/Space 顺畅导航，高对比可见焦点环；
 *    - 语音一键朗读、重听、停止支持；
 *    - 无依赖单一颜色判断状态，图形 + 文字双重指示；
 *    - 纯矢量原创 SVG，支持 prefers-reduced-motion。
 */
export const FairytaleIslandMap: React.FC<FairytaleIslandMapProps> = ({
  onSelectPlace,
  completedStoriesCount = 0,
  sunCount = 0,
  rainCount = 0,
}) => {
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  const handleLandmarkClick = (place: IslandPlace, title: string, desc: string) => {
    sounds.playKalimbaBloom();
    speechNarrator.stop();
    onSelectPlace(place);
  };

  const handleReadLandmark = (e: React.MouseEvent, title: string, desc: string) => {
    e.stopPropagation();
    sounds.playClick();
    speechNarrator.speak(`${title}。${desc}`);
  };

  return (
    <div
      role="region"
      aria-label="可探索的童话小岛地图"
      className="relative w-full rounded-3xl bg-linear-to-b from-sky-200/60 via-amber-100/50 to-emerald-100/70 p-3 sm:p-6 border-2 border-sky-300/80 shadow-lg"
    >
      {/* 顶部标题栏与探索指引 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shadow-xs shrink-0" aria-hidden="true">
            <IslandUiIconSvg name="map_compass" className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight whitespace-nowrap">
                童话小岛探索地图
              </h2>
              <span className="text-xs bg-amber-200/90 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300 shrink-0">
                点击建筑直接去玩
              </span>
            </div>
            <p className="text-sm sm:text-base text-stone-600 font-medium mt-0.5">
              在小岛上漫步，每个地方都有专属的小秘密
            </p>
          </div>
        </div>

        {/* 听整座岛介绍语音 */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            speechNarrator.speak('欢迎来到晴雨小岛！山顶有情绪天气站，树林里有故事林，木屋里有想法侦探社，还有勇气说话屋、照顾小桥和星光小屋。点击你想去的地方吧！');
          }}
          className="w-full sm:w-auto min-h-[56px] px-5 py-3 bg-white/95 hover:bg-white text-stone-900 border-2 border-stone-300 hover:border-amber-400 rounded-2xl font-black text-sm sm:text-base shadow-xs flex items-center justify-center gap-2.5 cursor-pointer transition-colors whitespace-nowrap focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
          aria-label="听一听小岛地图语音介绍"
        >
          <Volume2 className="w-6 h-6 text-amber-600 shrink-0" />
          <span>听小岛介绍</span>
        </button>
      </div>

      {/* 6 大独特空间网格布局 (自适应：360px 单列大触控卡、390px+ 双列、1024px+ 三列，绝无横向溢出) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {/* ========================================================= */}
        {/* 地点 1: 情绪天气站 (Weather Sky Observatory) */}
        {/* ========================================================= */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleLandmarkClick('weather', '情绪天气站', '看看今天头顶的天气与身体里的感觉')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLandmarkClick('weather', '情绪天气站', '看看今天头顶的天气与身体里的感觉');
            }
          }}
          onMouseEnter={() => setActiveHoverId('weather')}
          onMouseLeave={() => setActiveHoverId(null)}
          className="group relative rounded-3xl bg-linear-to-b from-sky-100 via-sky-50 to-white border-3 border-sky-300 hover:border-sky-500 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none"
          aria-label="进入情绪天气站：看看今天头顶的天气与身体里的感觉"
        >
          <div>
            {/* 顶栏：独特图标徽章 + 语音朗读 */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-sky-400 text-white flex items-center justify-center shadow-md group-hover:scale-105 motion-reduce:group-hover:scale-100 transition-transform shrink-0" aria-hidden="true">
                {/* 情绪天气站独创矢量图标 */}
                <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                  <circle cx="18" cy="18" r="9" fill="#FDE047" stroke="#F59E0B" strokeWidth="2.5" />
                  <path d="M 12 36 A 10 10 0 0 1 26 24 A 12 12 0 0 1 38 30 A 8 8 0 0 1 36 38 L 14 38 A 8 8 0 0 1 12 36 Z" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="18" y1="42" x2="16" y2="46" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="26" y1="42" x2="24" y2="46" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="32" y1="42" x2="30" y2="46" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-sky-800 bg-sky-200/90 px-2.5 py-1 rounded-full border border-sky-300">
                  天空观测
                </span>
                <button
                  type="button"
                  onClick={(e) => handleReadLandmark(e, '情绪天气站', '看看今天头顶的天气与身体里的感觉')}
                  className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-800 flex items-center justify-center transition-colors cursor-pointer border border-sky-200 shadow-2xs focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none"
                  title="朗读情绪天气站介绍"
                  aria-label="朗读情绪天气站介绍"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 视觉要素：云朵与感知天空变化 */}
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 group-hover:text-sky-900 transition-colors">
              情绪天气站
            </h3>
            <p className="text-base text-stone-600 mt-1 leading-snug font-medium">
              头顶有晴天、阴天和小雨，心里也有不同的感觉
            </p>

            {/* 专属微景观指示 */}
            <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-100/70 p-2 rounded-xl">
              <span className="text-sm">⛅</span>
              <span>今天天气：晴天有微风 · 身体暖暖的</span>
            </div>
          </div>

          {/* 底部行动大按钮 (>=56px 触控区) */}
          <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between">
            <span className="text-base font-extrabold text-sky-800">观测今天的天气</span>
            <span className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center text-lg font-black shadow-xs group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 transition-transform">
              →
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 地点 2: 故事林 (Story Grove) */}
        {/* ========================================================= */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleLandmarkClick('story', '故事林', '在绿树丛中漫步，打开生活故事绘本')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLandmarkClick('story', '故事林', '在绿树丛中漫步，打开生活故事绘本');
            }
          }}
          onMouseEnter={() => setActiveHoverId('story')}
          onMouseLeave={() => setActiveHoverId(null)}
          className="group relative rounded-3xl bg-linear-to-b from-emerald-100 via-emerald-50 to-white border-3 border-emerald-300 hover:border-emerald-500 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] cursor-pointer focus-visible:ring-4 focus-visible:ring-emerald-500 focus-visible:outline-none"
          aria-label="进入故事林：在绿树丛中漫步，打开生活故事绘本"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 motion-reduce:group-hover:scale-100 transition-transform shrink-0" aria-hidden="true">
                {/* 故事林独创矢量图标：古树与展开故事书 */}
                <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                  <path d="M 24 6 C 14 6 8 16 12 24 C 8 28 10 36 18 36 L 30 36 C 38 36 40 28 36 24 C 40 16 34 6 24 6 Z" fill="#34D399" stroke="#059669" strokeWidth="2" />
                  <rect x="22" y="32" width="4" height="12" rx="1.5" fill="#78350F" />
                  {/* 小刺猬小松鼠足迹 */}
                  <circle cx="16" cy="22" r="2" fill="#047857" />
                  <circle cx="32" cy="20" r="2" fill="#047857" />
                  {/* 展开的绘本书 */}
                  <path d="M 16 38 Q 24 35 32 38 L 32 44 Q 24 41 16 44 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-200/90 px-2.5 py-1 rounded-full border border-emerald-300">
                  {completedStoriesCount > 0 ? `已听 ${completedStoriesCount} 个故事` : '绘本树丛'}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleReadLandmark(e, '故事林', '在绿树丛中漫步，打开生活故事绘本，寻找新思考')}
                  className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center transition-colors cursor-pointer border border-emerald-200 shadow-2xs focus-visible:ring-4 focus-visible:ring-emerald-500 focus-visible:outline-none"
                  title="朗读故事林介绍"
                  aria-label="朗读故事林介绍"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 group-hover:text-emerald-900 transition-colors">
              故事林
            </h3>
            <p className="text-base text-stone-600 mt-1 leading-snug font-medium">
              树林里住着小动物，每棵树下都有一本生活故事
            </p>

            <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 p-2 rounded-xl">
              <span className="text-sm">📖</span>
              <span>走一圈、读一读，发现不同视角的生活叶片</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
            <span className="text-base font-extrabold text-emerald-800">打开树丛故事</span>
            <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-black shadow-xs group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 transition-transform">
              →
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 地点 3: 想法侦探社 (Thought Detective Lab) */}
        {/* ========================================================= */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleLandmarkClick('detective', '想法侦探社', '用放大镜寻找真实线索，区分看到的事实与脑子里的猜测')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLandmarkClick('detective', '想法侦探社', '用放大镜寻找真实线索，区分看到的事实与脑子里的猜测');
            }
          }}
          onMouseEnter={() => setActiveHoverId('detective')}
          onMouseLeave={() => setActiveHoverId(null)}
          className="group relative rounded-3xl bg-linear-to-b from-amber-100 via-amber-50 to-white border-3 border-amber-300 hover:border-amber-500 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
          aria-label="进入想法侦探社：用放大镜寻找真实线索，区分看到的事实与脑子里的猜测"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md group-hover:scale-105 motion-reduce:group-hover:scale-100 transition-transform shrink-0" aria-hidden="true">
                {/* 想法侦探社独创矢量图标：黄铜放大镜与线索脚印 */}
                <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                  <circle cx="20" cy="20" r="12" fill="#FEF3C7" stroke="#B45309" strokeWidth="3" />
                  <circle cx="20" cy="20" r="7" fill="#E0F2FE" opacity="0.8" />
                  <line x1="29" y1="29" x2="40" y2="40" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="20" cy="20" r="2.5" fill="#D97706" />
                  {/* 小机关齿轮 */}
                  <circle cx="34" cy="14" r="5" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 2" />
                </svg>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-900 bg-amber-200/90 px-2.5 py-1 rounded-full border border-amber-300">
                  线索机关
                </span>
                <button
                  type="button"
                  onClick={(e) => handleReadLandmark(e, '想法侦探社', '用放大镜寻找真实线索，区分看到的事实与脑子里的猜测')}
                  className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center transition-colors cursor-pointer border border-amber-200 shadow-2xs focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
                  title="朗读想法侦探社介绍"
                  aria-label="朗读想法侦探社介绍"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 group-hover:text-amber-900 transition-colors">
              想法侦探社
            </h3>
            <p className="text-base text-stone-600 mt-1 leading-snug font-medium">
              拿起放大镜动动手，看看哪些是事实，哪些只是猜测
            </p>

            <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-100/70 p-2 rounded-xl">
              <span className="text-sm">🔍</span>
              <span>动手找线索 · 不凭感觉随便给别人贴标签</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
            <span className="text-base font-extrabold text-amber-900">拿起放大镜调查</span>
            <span className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-black shadow-xs group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 transition-transform">
              →
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 地点 4: 勇气说话屋 (Courage House) */}
        {/* ========================================================= */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleLandmarkClick('courage', '勇气说话屋', '练习把心里话说出来，有权说不，找可信任的大人')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLandmarkClick('courage', '勇气说话屋', '练习把心里话说出来，有权说不，找可信任的大人');
            }
          }}
          onMouseEnter={() => setActiveHoverId('courage')}
          onMouseLeave={() => setActiveHoverId(null)}
          className="group relative rounded-3xl bg-linear-to-b from-rose-100 via-rose-50 to-white border-3 border-rose-300 hover:border-rose-500 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] cursor-pointer focus-visible:ring-4 focus-visible:ring-rose-500 focus-visible:outline-none"
          aria-label="进入勇气说话屋：练习把心里话说出来，有权说不，找可信任的大人"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-rose-400 text-white flex items-center justify-center shadow-md group-hover:scale-105 motion-reduce:group-hover:scale-100 transition-transform shrink-0" aria-hidden="true">
                {/* 勇气说话屋独创矢量图标：安全爱心盾牌与对话泡泡 */}
                <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                  {/* 对话泡泡 */}
                  <path d="M 8 10 Q 8 6 14 6 L 34 6 Q 40 6 40 10 L 40 24 Q 40 28 34 28 L 22 28 L 14 34 L 16 28 Q 8 28 8 24 Z" fill="#FFE4E6" stroke="#E11D48" strokeWidth="2" />
                  {/* 防护爱心盾牌 */}
                  <path d="M 24 16 C 24 13 21 11 18 13 C 14 15 14 20 24 26 C 34 20 34 15 30 13 C 27 11 24 13 24 16 Z" fill="#F43F5E" />
                </svg>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-rose-800 bg-rose-200/90 px-2.5 py-1 rounded-full border border-rose-300">
                  安全表达
                </span>
                <button
                  type="button"
                  onClick={(e) => handleReadLandmark(e, '勇气说话屋', '练习把心里话说出来，有权说不，找可信任的大人')}
                  className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-800 flex items-center justify-center transition-colors cursor-pointer border border-rose-200 shadow-2xs focus-visible:ring-4 focus-visible:ring-rose-500 focus-visible:outline-none"
                  title="朗读勇气说话屋介绍"
                  aria-label="朗读勇气说话屋介绍"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 group-hover:text-rose-900 transition-colors">
              勇气说话屋
            </h3>
            <p className="text-base text-stone-600 mt-1 leading-snug font-medium">
              在这里练习把心事好好告诉大人，也学会说坚定的“不”
            </p>

            <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-rose-800 bg-rose-100/70 p-2 rounded-xl">
              <span className="text-sm">🛡️</span>
              <span>保护身体与心 · 遇到不舒服随时找可信大人求助</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between">
            <span className="text-base font-extrabold text-rose-800">进屋倾听与练习</span>
            <span className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center text-lg font-black shadow-xs group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 transition-transform">
              →
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 地点 5: 照顾小桥 (原两个家的桥/照顾小桥) */}
        {/* ========================================================= */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleLandmarkClick('bridge', '照顾小桥', '两个温暖的家，看交接日历、收拾小书包与安心想念')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLandmarkClick('bridge', '照顾小桥', '两个温暖的家，看交接日历、收拾小书包与安心想念');
            }
          }}
          onMouseEnter={() => setActiveHoverId('bridge')}
          onMouseLeave={() => setActiveHoverId(null)}
          className="group relative rounded-3xl bg-linear-to-b from-teal-100 via-teal-50 to-white border-3 border-teal-300 hover:border-teal-500 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] cursor-pointer focus-visible:ring-4 focus-visible:ring-teal-500 focus-visible:outline-none"
          aria-label="进入照顾小桥：两个温暖的家，看交接日历、收拾小书包与安心想念"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 motion-reduce:group-hover:scale-100 transition-transform shrink-0" aria-hidden="true">
                {/* 照顾小桥独创矢量图标：木拱桥与两个家的小灯笼 */}
                <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                  {/* 水波流淌 */}
                  <path d="M 6 36 Q 24 30 42 36" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                  {/* 木拱桥梁 */}
                  <path d="M 6 32 Q 24 16 42 32" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 6 35 Q 24 20 42 35" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
                  <line x1="16" y1="25" x2="16" y2="36" stroke="#78350F" strokeWidth="2" />
                  <line x1="32" y1="25" x2="32" y2="36" stroke="#78350F" strokeWidth="2" />
                  {/* 两端的家与小灯笼 */}
                  <circle cx="24" cy="14" r="3" fill="#FDE047" />
                  <polygon points="10,18 4,24 16,24" fill="#F43F5E" />
                  <polygon points="38,18 32,24 44,24" fill="#3B82F6" />
                </svg>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-teal-800 bg-teal-200/90 px-2.5 py-1 rounded-full border border-teal-300">
                  温暖两家
                </span>
                <button
                  type="button"
                  onClick={(e) => handleReadLandmark(e, '照顾小桥', '两个温暖的家，看交接日历、收拾小书包与安心想念')}
                  className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl bg-teal-100 hover:bg-teal-200 text-teal-800 flex items-center justify-center transition-colors cursor-pointer border border-teal-200 shadow-2xs focus-visible:ring-4 focus-visible:ring-teal-500 focus-visible:outline-none"
                  title="朗读照顾小桥介绍"
                  aria-label="朗读照顾小桥介绍"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 group-hover:text-teal-900 transition-colors">
              照顾小桥
            </h3>
            <p className="text-base text-stone-600 mt-1 leading-snug font-medium">
              桥的两头都是温暖的港湾，看日程安排、装好自己的小书包
            </p>

            <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-100/70 p-2 rounded-xl">
              <span className="text-sm">🎒</span>
              <span>中性家庭称谓 · 日程清清楚楚 · 想念随时安心说</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-teal-100 flex items-center justify-between">
            <span className="text-base font-extrabold text-teal-800">踏上照顾小桥</span>
            <span className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg font-black shadow-xs group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 transition-transform">
              →
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 地点 6: 星光小屋 (Starlight Cabin) */}
        {/* ========================================================= */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleLandmarkClick('starlight', '星光小屋', '点亮你的爱好拼图，家庭只是其中一片，你本身无比丰富')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLandmarkClick('starlight', '星光小屋', '点亮你的爱好拼图，家庭只是其中一片，你本身无比丰富');
            }
          }}
          onMouseEnter={() => setActiveHoverId('starlight')}
          onMouseLeave={() => setActiveHoverId(null)}
          className="group relative rounded-3xl bg-linear-to-b from-indigo-100 via-indigo-50 to-white border-3 border-indigo-300 hover:border-indigo-500 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] cursor-pointer focus-visible:ring-4 focus-visible:ring-indigo-500 focus-visible:outline-none"
          aria-label="进入星光小屋：点亮你的爱好拼图，家庭只是其中一片，你本身无比丰富"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 motion-reduce:group-hover:scale-100 transition-transform shrink-0" aria-hidden="true">
                {/* 星光小屋独创矢量图标：夜空月影与拼图繁星 */}
                <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                  <path d="M 12 16 A 14 14 0 0 0 28 32 A 16 16 0 1 1 12 16 Z" fill="#FDE047" opacity="0.9" />
                  <polygon points="34,8 37,16 45,17 38,23 40,31 34,26 28,31 30,23 23,17 31,16" fill="#FDE047" stroke="#F59E0B" strokeWidth="1.5" />
                  {/* 拼图块 */}
                  <rect x="18" y="26" width="10" height="10" rx="2" fill="#EC4899" />
                  <rect x="29" y="26" width="10" height="10" rx="2" fill="#3B82F6" />
                </svg>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-indigo-900 bg-indigo-200/90 px-2.5 py-1 rounded-full border border-indigo-300">
                  多面自我
                </span>
                <button
                  type="button"
                  onClick={(e) => handleReadLandmark(e, '星光小屋', '点亮你的爱好拼图，家庭只是其中一片，你本身无比丰富')}
                  className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 flex items-center justify-center transition-colors cursor-pointer border border-indigo-200 shadow-2xs focus-visible:ring-4 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  title="朗读星光小屋介绍"
                  aria-label="朗读星光小屋介绍"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 group-hover:text-indigo-950 transition-colors">
              星光小屋
            </h3>
            <p className="text-base text-stone-600 mt-1 leading-snug font-medium">
              点亮你的爱好与强项，家庭只是大拼图里的一片
            </p>

            <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-indigo-900 bg-indigo-100/70 p-2 rounded-xl">
              <span className="text-sm">⭐</span>
              <span>爱好、朋友与成长 · 你是一个无比丰富独立的孩子</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between">
            <span className="text-base font-extrabold text-indigo-900">点亮我的星光</span>
            <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-xs group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 transition-transform">
              👉
            </span>
          </div>
        </div>
      </div>

      {/* 底部两大安心专属常驻入口：绿草呼吸平静角 + 真人求助 */}
      <div className="mt-5 pt-4 border-t-2 border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 绿草呼吸平静角快速入口 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleLandmarkClick('calm', '绿草呼吸平静角', '慢慢深呼吸，放松身体，平复情绪')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLandmarkClick('calm', '绿草呼吸平静角', '慢慢深呼吸，放松身体，平复情绪');
            }
          }}
          className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-teal-50 hover:bg-teal-100/90 border-2 border-teal-300 shadow-xs cursor-pointer transition-colors focus-visible:ring-4 focus-visible:ring-teal-500 focus-visible:outline-none"
          aria-label="进入绿草呼吸平静角：慢慢深呼吸，放松身体，平复情绪"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center text-2xl shadow-xs shrink-0" aria-hidden="true">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-stone-900">绿草呼吸平静角</span>
                <span className="text-xs bg-teal-200 text-teal-900 font-bold px-2 py-0.5 rounded-full">随时可退回</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                跟着小光圈一起吸气、呼气，身体松松的
              </p>
            </div>
          </div>
          <span className="text-teal-700 font-black text-sm px-3 py-2 bg-white rounded-xl shadow-2xs shrink-0">
            去休息 👉
          </span>
        </div>

        {/* 伴伴安全守则常驻提示 */}
        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl shadow-xs shrink-0" aria-hidden="true">
            🌱
          </div>
          <div>
            <span className="text-base font-black text-stone-900">安心玩耍约定</span>
            <p className="text-xs sm:text-sm text-stone-600 font-medium mt-0.5">
              没有倒计时 · 没有对错打分 · 任何时候都能找身边的大人抱抱
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
