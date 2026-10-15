import React, { useState } from 'react';
import { Volume2, Sparkles, Wind, BookOpen, Search, Shield, Heart, Moon, Sun, Wrench, Compass, Eye, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';
import { IslandPlace } from '../../context/AppContext';
import { IslandUiIconSvg } from './CompanionIcons';
import { loadProductExperienceMetrics, recordLandmarkVisit } from '../../domain/cognitive/productExperienceMetrics';

export interface FairytaleIslandMapProps {
  onSelectPlace?: (place: IslandPlace) => void;
  onSelectLocation?: (locationId: string) => void;
  onOpenBreaker?: () => void;
  completedStoriesCount?: number;
  completedDetectiveCasesCount?: number;
  sunCount?: number;
  rainCount?: number;
}

export type LandmarkId = 'calm' | 'breaker' | 'detective' | 'bridge' | 'story' | 'courage' | 'starlight' | 'weather';

interface LandmarkData {
  id: LandmarkId;
  placeKey: IslandPlace | 'breaker';
  title: string;
  subTitle: string;
  tag: string;
  desc: string;
  actionText: string;
  ariaLabel: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    glow: string;
  };
  speechText: string;
  coords: {
    cx: number;
    cy: number;
    badgeX: number;
    badgeY: number;
    hitWidth: number;
    hitHeight: number;
  };
}

/**
 * 晴雨小岛 · 2.5D 分层童话小岛空间探索地图 (Fairytale Island 2.5D Isometric SVG Map)
 * 严格遵循 AG-04A 视觉与交互空间标准：
 * 1. 2.5D 等轴测分层手绘海岛架构：
 *    - 绿草平静角：宁静水波、绿草坪、呼吸光晕与柔和花瓣；
 *    - 大困难拆解台：三级阶梯踏脚石台、木工工坊、拼插齿轮与积木；
 *    - 思考侦探所：铜质放大镜观测塔、好奇心之树、三色宝盒（事实/想法/感觉）；
 *    - 双向桥小驿：横跨清泉的双家木拱桥、两端温暖小屋与安心小书包；
 *    - 故事森林：发光思考之叶、巨大展开绘本亭、森林动物足迹；
 *    - 星光树屋 / 勇气小屋：双层古树树屋，下层勇气爱心庇护屋、上层星光天文望远镜；
 *    - 情绪天气站：海岛之巅晴雨气象台、旋转风速仪与彩虹云梯。
 * 2. 交互与无障碍：
 *    - 触控目标尺寸全视口 >= 56x56 CSS px；
 *    - 严格遵循 prefers-reduced-motion，使用 motion-reduce:animate-none 禁用所有环境动效；
 *    - 完整保留 onSelectPlace / onSelectLocation 兼容性与卡片视图切换；
 *    - 自然流式响应式 viewBox="0 0 1000 680"，绝无横向溢出。
 */
export const FairytaleIslandMap: React.FC<FairytaleIslandMapProps> = ({
  onSelectPlace,
  onSelectLocation,
  onOpenBreaker,
  completedStoriesCount = 0,
  completedDetectiveCasesCount,
  sunCount = 0,
  rainCount = 0,
}) => {
  const [activeLandmark, setActiveLandmark] = useState<LandmarkId | null>(null);
  const expMetrics = loadProductExperienceMetrics();
  const solvedCasesCount = completedDetectiveCasesCount ?? expMetrics.completedDetectiveCaseIds.length;

  const landmarks: LandmarkData[] = [
    {
      id: 'calm',
      placeKey: 'calm',
      title: '绿草平静角',
      subTitle: '呼吸放松 · 随时安心退回',
      tag: '随时退回',
      desc: '跟着温柔的小波纹慢慢吸气和呼气，身体松松软软的。',
      actionText: '去呼吸放松',
      ariaLabel: '进入绿草平静角（进入绿草呼吸平静角）：慢慢深呼吸，放松身体，平复情绪',
      colorScheme: {
        bg: 'from-emerald-100 to-teal-50',
        border: 'border-emerald-300',
        text: 'text-emerald-950',
        badgeBg: 'bg-emerald-100/95',
        badgeBorder: 'border-emerald-400',
        badgeText: 'text-emerald-900',
        glow: '#10B981',
      },
      speechText: '这里是绿草平静角。如果觉得有点累或者心里噗通噗通跳，就来这里跟着圆圈深呼吸，随时可以停下来休息。',
      coords: {
        cx: 175,
        cy: 485,
        badgeX: 105,
        badgeY: 415,
        hitWidth: 165,
        hitHeight: 145,
      },
    },
    {
      id: 'breaker',
      placeKey: 'breaker',
      title: '大困难拆解台',
      subTitle: '大石变小步 · 迈出第一步',
      tag: '小步走',
      desc: '把沉重的大问题，像切积木一样拆成 3 个容易迈出的小踏脚石。',
      actionText: '去拆解大困难',
      ariaLabel: '进入大困难拆解台：把大问题拆成容易迈出的小踏脚石',
      colorScheme: {
        bg: 'from-amber-100 to-orange-50',
        border: 'border-amber-300',
        text: 'text-amber-950',
        badgeBg: 'bg-amber-100/95',
        badgeBorder: 'border-amber-400',
        badgeText: 'text-amber-950',
        glow: '#F59E0B',
      },
      speechText: '这里是大困难拆解台。遇到觉得很难的事情别着急，动动手用小木槌把它敲成三小块，一步一步迈过去。',
      coords: {
        cx: 825,
        cy: 495,
        badgeX: 745,
        badgeY: 425,
        hitWidth: 165,
        hitHeight: 145,
      },
    },
    {
      id: 'detective',
      placeKey: 'detective',
      title: '思考侦探所',
      subTitle: '放大镜找线索 · 区分事实猜测',
      tag: '线索机关',
      desc: '拿起黄铜放大镜，在好奇心树下寻找证据，看清什么是事实，什么是猜测。',
      actionText: '拿起放大镜调查',
      ariaLabel: '进入思考侦探所（进入想法侦探社）：用放大镜寻找真实线索，区分看到的事实与脑子里的猜测',
      colorScheme: {
        bg: 'from-amber-100 to-yellow-50',
        border: 'border-amber-300',
        text: 'text-amber-950',
        badgeBg: 'bg-amber-200/95',
        badgeBorder: 'border-amber-500',
        badgeText: 'text-amber-950',
        glow: '#D97706',
      },
      speechText: '这里是思考侦探所，也就是想法侦探社。在这里当个聪明的小侦探，用放大镜看清楚眼前发生的事情，不凭感觉瞎猜。',
      coords: {
        cx: 485,
        cy: 335,
        badgeX: 415,
        badgeY: 260,
        hitWidth: 165,
        hitHeight: 155,
      },
    },
    {
      id: 'bridge',
      placeKey: 'bridge',
      title: '双向桥小驿',
      subTitle: '两个温暖家 · 日程安心想念',
      tag: '温暖两家',
      desc: '一座美丽的木拱桥连着两头温暖的家，看日程表、收拾书包、想念可以安心说。',
      actionText: '踏上双向小桥',
      ariaLabel: '进入双向桥小驿（进入照顾小桥）：两个温暖的家，看日程安排、收拾小书包与安心想念',
      colorScheme: {
        bg: 'from-teal-100 to-cyan-50',
        border: 'border-teal-300',
        text: 'text-teal-950',
        badgeBg: 'bg-teal-100/95',
        badgeBorder: 'border-teal-400',
        badgeText: 'text-teal-950',
        glow: '#14B8A6',
      },
      speechText: '这里是双向桥小驿，也就是照顾小桥。桥的两边都是爱你的家，日程清清楚楚，两边的爸爸妈妈都深深爱着你。',
      coords: {
        cx: 490,
        cy: 535,
        badgeX: 420,
        badgeY: 480,
        hitWidth: 175,
        hitHeight: 135,
      },
    },
    {
      id: 'story',
      placeKey: 'story',
      title: '故事森林',
      subTitle: '绘本密林 · 发现思考之叶',
      tag: completedStoriesCount > 0 ? `已读 ${completedStoriesCount} 篇` : '故事绘本',
      desc: '在发光的大树下漫步，打开一本本生活故事，发现看待世界的新视角。',
      actionText: '打开故事绘本',
      ariaLabel: '进入故事森林（进入故事林）：在绿树丛中漫步，打开生活故事绘本',
      colorScheme: {
        bg: 'from-emerald-100 to-green-50',
        border: 'border-emerald-300',
        text: 'text-emerald-950',
        badgeBg: 'bg-emerald-100/95',
        badgeBorder: 'border-emerald-400',
        badgeText: 'text-emerald-900',
        glow: '#059669',
      },
      speechText: '这里是故事森林，也就是故事林。古老的大树下有一本本好看的绘本，跟小动物们一起看看他们是怎样想办法的。',
      coords: {
        cx: 215,
        cy: 245,
        badgeX: 145,
        badgeY: 175,
        hitWidth: 165,
        hitHeight: 145,
      },
    },
    {
      id: 'courage',
      placeKey: 'courage',
      title: '勇气小屋',
      subTitle: '练习说真心话 · 学会坚定说不',
      tag: '安全表达',
      desc: '在大树下温暖的小木屋里，练习把心里话告诉可信赖的大人，保护自己的身体与心。',
      actionText: '进屋练习说话',
      ariaLabel: '进入勇气小屋（进入勇气说话屋）：练习把心里话说出来，有权说不，找可信任的大人',
      colorScheme: {
        bg: 'from-rose-100 to-pink-50',
        border: 'border-rose-300',
        text: 'text-rose-950',
        badgeBg: 'bg-rose-100/95',
        badgeBorder: 'border-rose-400',
        badgeText: 'text-rose-950',
        glow: '#F43F5E',
      },
      speechText: '这里是勇气小屋，也是勇气说话屋。在这里练习大声说出不，学会把心里的困惑和委屈讲给信任的大人听。',
      coords: {
        cx: 740,
        cy: 285,
        badgeX: 685,
        badgeY: 330,
        hitWidth: 155,
        hitHeight: 135,
      },
    },
    {
      id: 'starlight',
      placeKey: 'starlight',
      title: '星光树屋',
      subTitle: '点亮爱好强项 · 多面精彩自我',
      tag: '多面自我',
      desc: '登上树梢的天文台，拿起望远镜探索星空拼图，你本身就是一个无比丰富的孩子。',
      actionText: '点亮闪亮星光',
      ariaLabel: '进入星光树屋（进入星光小屋）：点亮你的爱好拼图，家庭只是其中一片，你本身无比丰富',
      colorScheme: {
        bg: 'from-indigo-100 to-blue-50',
        border: 'border-indigo-300',
        text: 'text-indigo-950',
        badgeBg: 'bg-indigo-100/95',
        badgeBorder: 'border-indigo-400',
        badgeText: 'text-indigo-950',
        glow: '#6366F1',
      },
      speechText: '这里是星光树屋，也是星光小屋。在夜空树梢上点亮属于你的爱好、特长与好朋友，家庭只是大拼图里的一片，你本身闪闪发光。',
      coords: {
        cx: 815,
        cy: 175,
        badgeX: 760,
        badgeY: 105,
        hitWidth: 155,
        hitHeight: 135,
      },
    },
    {
      id: 'weather',
      placeKey: 'weather',
      title: '情绪天气站',
      subTitle: '海岛之巅 · 天空与身体感觉',
      tag: '天空观测',
      desc: '在山顶气象台看今天头顶的天气：晴天、阴天还是有小雨，感受身体暖暖的还是紧紧的。',
      actionText: '观测今天天气',
      ariaLabel: '进入情绪天气站：看看今天头顶的天气与身体里的感觉',
      colorScheme: {
        bg: 'from-sky-100 to-cyan-50',
        border: 'border-sky-300',
        text: 'text-sky-950',
        badgeBg: 'bg-sky-100/95',
        badgeBorder: 'border-sky-400',
        badgeText: 'text-sky-950',
        glow: '#0284C7',
      },
      speechText: '这里是情绪天气站。站在山顶吹着微风，看看头顶的天空，也抱抱自己身体里正在流动的感觉。',
      coords: {
        cx: 495,
        cy: 135,
        badgeX: 420,
        badgeY: 70,
        hitWidth: 165,
        hitHeight: 135,
      },
    },
  ];

  const handleLandmarkClick = (landmark: LandmarkData) => {
    sounds.playKalimbaBloom();
    speechNarrator.stop();
    recordLandmarkVisit(landmark.id);

    if (landmark.placeKey === 'breaker') {
      if (onOpenBreaker) {
        onOpenBreaker();
        return;
      }
      if (onSelectLocation) {
        onSelectLocation('breaker');
      } else if (onSelectPlace) {
        onSelectPlace('calm');
      }
      return;
    }

    if (onSelectPlace) {
      onSelectPlace(landmark.placeKey as IslandPlace);
    }
    if (onSelectLocation) {
      onSelectLocation(landmark.placeKey);
    }
  };

  const handleReadLandmark = (e: React.MouseEvent, speech: string) => {
    e.stopPropagation();
    sounds.playClick();
    speechNarrator.speak(speech);
  };

  return (
    <div
      role="region"
      aria-label="可探索的童话小岛地图"
      className="relative w-full rounded-3xl bg-linear-to-b from-sky-200/60 via-amber-100/40 to-emerald-100/70 p-2 sm:p-5 border-2 border-sky-300/80 shadow-lg select-none overflow-hidden"
    >
      {/* 注入内联动效样式，严格支持 prefers-reduced-motion */}
      <style>{`
        @keyframes islandCloudFloatA {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(22px, -4px); }
        }
        @keyframes islandCloudFloatB {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(-18px, 3px); }
        }
        @keyframes islandShoreWave {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.02); }
        }
        @keyframes islandCalmBreathePulse {
          0%, 100% { r: 38px; opacity: 0.35; }
          50% { r: 48px; opacity: 0.85; }
        }
        @keyframes islandFairyLight {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.95; }
        }
        .anim-cloud-a { animation: islandCloudFloatA 12s ease-in-out infinite; }
        .anim-cloud-b { animation: islandCloudFloatB 14s ease-in-out infinite; }
        .anim-shore-wave { animation: islandShoreWave 5s ease-in-out infinite; transform-origin: center; }
        .anim-calm-breathe { animation: islandCalmBreathePulse 4s ease-in-out infinite; }
        .anim-fairy-light { animation: islandFairyLight 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .anim-cloud-a,
          .anim-cloud-b,
          .anim-shore-wave,
          .anim-calm-breathe,
          .anim-fairy-light {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* 顶部标题栏与整岛语音指引 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 px-1">
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
                2.5D 立体故事岛 · 八大探索空间
              </span>
            </div>
            <p className="text-xs sm:text-base text-stone-600 font-medium mt-0.5">
              宁静海湾、双家小桥、思考侦探木屋与星光树屋，点一点先听线索或直接进入
            </p>
            <div
              data-testid="island-progress-summary"
              className="flex flex-wrap items-center gap-1.5 mt-1.5"
            >
              <span className="text-[11px] font-bold bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                🔍 已破案 {solvedCasesCount} 起
              </span>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300">
                📖 已读故事 {completedStoriesCount} 篇
              </span>
              <span className="text-[11px] font-bold bg-sky-100 text-sky-950 px-2.5 py-0.5 rounded-full border border-sky-300">
                ☀️ {sunCount}阳 · 🌧️ {rainCount}雨
              </span>
              {expMetrics.visitedLandmarks.length > 0 && (
                <span className="text-[11px] font-bold bg-purple-100 text-purple-950 px-2.5 py-0.5 rounded-full border border-purple-300">
                  🧭 已探索 {expMetrics.visitedLandmarks.length}/8 处
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 听整座小岛全景语音介绍 */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            speechNarrator.speak('欢迎来到晴雨小岛！海面上飘着小木船，山巅有情绪天气站，树林深处是故事森林，小桥两边是温暖的家，还有放大镜木屋与星光树屋。你想先去哪里探险呢？');
          }}
          className="w-full sm:w-auto min-h-[56px] px-5 py-3 bg-white/95 hover:bg-white text-stone-900 border-2 border-stone-300 hover:border-amber-400 rounded-2xl font-black text-sm sm:text-base shadow-xs flex items-center justify-center gap-2.5 cursor-pointer transition-colors whitespace-nowrap focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
          aria-label="听一听小岛地图语音介绍"
        >
          <Volume2 className="w-6 h-6 text-amber-600 shrink-0" />
          <span>听小岛介绍</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2.5D 手绘等轴测立体童话小岛 SVG 核心画布 */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-sky-300/80 bg-linear-to-b from-sky-200 via-sky-100 to-teal-100 shadow-inner">
        <svg
          viewBox="0 0 1000 680"
          className="w-full h-auto max-h-[580px] block"
          aria-label="晴雨小岛2.5D立体全景手绘地图：包含绿草平静角、大困难拆解台、思考侦探所、双向桥小驿、故事森林、星光树屋与情绪天气站"
        >
          <defs>
            {/* 海洋柔波渐变 */}
            <radialGradient id="islandOceanGrad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="55%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#38BDF8" />
            </radialGradient>

            {/* 2.5D 悬崖地壳厚度渐变 (Terracotta / Earthy Strata) */}
            <linearGradient id="cliffStrataGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="35%" stopColor="#B45309" />
              <stop offset="70%" stopColor="#92400E" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            {/* 岛屿金色沙滩边缘渐变 */}
            <linearGradient id="islandSandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="60%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* 岛屿翠绿高地草坪渐变 */}
            <linearGradient id="islandGrassGrad" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="30%" stopColor="#6EE7B7" />
              <stop offset="70%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* 高地山丘渐变 */}
            <linearGradient id="highHillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* 清澈河流渐变 */}
            <linearGradient id="riverStreamGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="40%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* 故事森林树冠渐变 */}
            <radialGradient id="storyTreeGrad" cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>

            {/* 星光树屋古树树冠渐变 */}
            <radialGradient id="starlightCanopyGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="50%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#065F46" />
            </radialGradient>

            {/* 黄铜放大镜渐变 */}
            <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* 双向拱桥木质渐变 */}
            <linearGradient id="bridgeWoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="50%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>

            {/* 柔和投影滤镜 */}
            <filter id="islandShadow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0F172A" floodOpacity="0.18" />
            </filter>
            <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* ======================================================= */}
          {/* 1. 海洋背景层与柔波水花 */}
          {/* ======================================================= */}
          <rect width="1000" height="680" fill="url(#islandOceanGrad)" />

          {/* 环岛柔波海岸动画线 */}
          <path
            d="M 120 480 C 70 380, 160 210, 310 170 C 470 130, 680 130, 830 190 C 950 250, 970 410, 890 530 C 810 650, 630 630, 480 620 C 330 610, 170 580, 120 480 Z"
            fill="none"
            stroke="#E0F2FE"
            strokeWidth="10"
            strokeLinecap="round"
            className="anim-shore-wave opacity-50"
          />
          <path
            d="M 100 485 C 50 375, 145 200, 305 160 C 475 120, 690 120, 845 180 C 970 240, 990 415, 905 540 C 825 665, 635 645, 480 635 C 320 625, 155 590, 100 485 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeDasharray="12 16"
            className="anim-shore-wave opacity-60"
          />

          {/* 远海童话漂流瓶与小海星 */}
          <g transform="translate(80, 600)" opacity="0.85">
            <ellipse cx="12" cy="6" rx="14" ry="4" fill="#38BDF8" opacity="0.4" />
            <path d="M 6 6 Q 12 0 18 6 Q 24 12 18 14 Q 10 14 6 6 Z" fill="#FDE047" stroke="#D97706" strokeWidth="1" />
            <line x1="12" y1="2" x2="12" y2="0" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          {/* 欢快小海豚嬉水水花 */}
          <g transform="translate(900, 600)" opacity="0.9">
            <path d="M 0 10 Q 15 -5 30 10 Q 15 5 0 10 Z" fill="#0284C7" />
            <circle cx="22" cy="4" r="1" fill="#FFFFFF" />
            <path d="M -8 12 Q -2 8 4 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 26 12 Q 32 8 38 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>

          {/* 漂浮的小云朵 (微风飘动，支持 prefers-reduced-motion) */}
          <g className="anim-cloud-a" transform="translate(60, 50)" opacity="0.9">
            <ellipse cx="60" cy="30" rx="42" ry="20" fill="#FFFFFF" />
            <ellipse cx="40" cy="24" rx="26" ry="18" fill="#FFFFFF" />
            <ellipse cx="80" cy="24" rx="28" ry="18" fill="#FFFFFF" />
            <circle cx="62" cy="16" r="20" fill="#FFFFFF" />
          </g>
          <g className="anim-cloud-b" transform="translate(760, 40)" opacity="0.85">
            <ellipse cx="60" cy="28" rx="36" ry="17" fill="#FFFFFF" />
            <ellipse cx="42" cy="22" rx="22" ry="15" fill="#FFFFFF" />
            <ellipse cx="78" cy="22" rx="24" ry="15" fill="#FFFFFF" />
            <circle cx="60" cy="14" r="16" fill="#FFFFFF" />
          </g>

          {/* ======================================================= */}
          {/* 2. 2.5D 海岛地壳分层厚度 (Isometric Cliff Skirt) */}
          {/* ======================================================= */}
          <g filter="url(#islandShadow)">
            {/* 地壳下沉岩层立体厚度 (向下延伸 45px) */}
            <path
              d="M 130 480 
                 C 100 420, 140 260, 240 200 
                 C 340 150, 480 140, 620 140 
                 C 740 140, 840 180, 880 250 
                 C 930 330, 930 440, 880 520 
                 C 820 610, 680 620, 490 610 
                 C 320 600, 190 570, 130 480 Z"
              transform="translate(0, 36)"
              fill="url(#cliffStrataGrad)"
            />
            {/* 岩层条纹纹理 */}
            <path
              d="M 140 500 Q 220 540 330 550 Q 500 560 690 555 Q 810 535 870 480"
              stroke="#78350F"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              transform="translate(0, 36)"
              opacity="0.6"
            />
            <path
              d="M 180 525 Q 310 575 490 580 Q 670 580 820 535"
              stroke="#D97706"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              transform="translate(0, 36)"
              opacity="0.4"
            />

            {/* 金色沙滩外沿缓冲圈 */}
            <path
              d="M 130 480 
                 C 100 420, 140 260, 240 200 
                 C 340 150, 480 140, 620 140 
                 C 740 140, 840 180, 880 250 
                 C 930 330, 930 440, 880 520 
                 C 820 610, 680 620, 490 610 
                 C 320 600, 190 570, 130 480 Z"
              fill="url(#islandSandGrad)"
            />

            {/* 岛屿翠绿高地主体地表 (Top Plateau) */}
            <path
              d="M 145 470 
                 C 118 415, 155 270, 250 215 
                 C 345 165, 480 155, 615 155 
                 C 730 155, 825 192, 865 258 
                 C 910 332, 910 435, 865 508 
                 C 808 592, 672 602, 490 592 
                 C 325 582, 202 555, 145 470 Z"
              fill="url(#islandGrassGrad)"
            />

            {/* 岛上内陆阶梯丘陵层 (Elevation Contours) */}
            {/* 西北森林丘陵 */}
            <path
              d="M 175 360 C 170 260, 240 220, 340 230 C 370 290, 330 380, 240 400 C 190 410, 178 390, 175 360 Z"
              fill="#34D399"
              opacity="0.75"
            />
            {/* 东北树屋高地 */}
            <path
              d="M 640 260 C 660 180, 770 170, 845 220 C 870 290, 830 360, 750 370 C 670 380, 630 330, 640 260 Z"
              fill="#10B981"
              opacity="0.65"
            />
            {/* 顶峰气象站岩岭 */}
            <path
              d="M 430 170 C 460 135, 530 135, 565 170 C 580 200, 540 225, 495 225 C 450 225, 420 195, 430 170 Z"
              fill="url(#highHillGrad)"
            />
          </g>

          {/* ======================================================= */}
          {/* 3. 中央山泉溪流与清凉瀑布 (Mountain Spring to Ocean) */}
          {/* ======================================================= */}
          <path
            d="M 495 210
               Q 485 280, 510 360
               Q 525 430, 480 500
               Q 450 545, 490 600"
            fill="none"
            stroke="url(#riverStreamGrad)"
            strokeWidth="28"
            strokeLinecap="round"
          />
          {/* 溪水闪亮流光纹 */}
          <path
            d="M 492 215 Q 483 280, 508 360 Q 523 430, 478 500 Q 452 540, 488 595"
            fill="none"
            stroke="#E0F2FE"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="10 18"
            className="anim-shore-wave"
          />

          {/* ======================================================= */}
          {/* 4. 2.5D 故事书蜿蜒鹅卵石小径 (Storybook Winding Paths) */}
          {/* ======================================================= */}
          <g fill="none" stroke="#FDE68A" strokeWidth="12" strokeLinecap="round" opacity="0.85">
            {/* 小径 1: 绿草平静角 <-> 双向桥小驿西端 */}
            <path d="M 220 480 Q 300 520, 440 535" />
            {/* 小径 2: 双向桥小驿东端 <-> 大困难拆解台 */}
            <path d="M 540 535 Q 670 540, 770 500" />
            {/* 小径 3: 双向桥 <-> 思考侦探所 */}
            <path d="M 490 510 Q 460 430, 485 365" />
            {/* 小径 4: 故事森林 <-> 思考侦探所 */}
            <path d="M 280 280 Q 360 320, 445 340" />
            {/* 小径 5: 思考侦探所 <-> 星光树屋与勇气小屋 */}
            <path d="M 535 330 Q 620 310, 710 270" />
            {/* 小径 6: 思考侦探所 <-> 山顶情绪天气站阶梯 */}
            <path d="M 490 310 Q 510 255, 495 195" />
          </g>
          {/* 鹅卵石踏脚石斑纹 */}
          <g fill="#D97706" opacity="0.6">
            <ellipse cx="250" cy="495" rx="5" ry="3" />
            <ellipse cx="320" cy="515" rx="6" ry="3.5" />
            <ellipse cx="380" cy="528" rx="5" ry="3" />
            <ellipse cx="610" cy="535" rx="5" ry="3" />
            <ellipse cx="680" cy="525" rx="6" ry="3.5" />
            <ellipse cx="740" cy="510" rx="5" ry="3" />
            <ellipse cx="330" cy="298" rx="5" ry="3" />
            <ellipse cx="400" cy="325" rx="6" ry="3.5" />
            <ellipse cx="580" cy="320" rx="5" ry="3" />
            <ellipse cx="660" cy="290" rx="6" ry="3.5" />
          </g>

          {/* ======================================================= */}
          {/* 5. 空间地标 1: 绿草平静角 (Green Grass Calm Corner) */}
          {/* ======================================================= */}
          <g id="landmark-calm" transform="translate(175, 485)">
            {/* 舒缓呼吸光晕波纹 (动效随 prefers-reduced-motion 降级) */}
            <circle cx="0" cy="0" r="42" fill="#34D399" className="anim-calm-breathe" />
            <circle cx="0" cy="0" r="32" fill="#6EE7B7" opacity="0.6" />
            <circle cx="0" cy="0" r="22" fill="#A7F3D0" opacity="0.8" />

            {/* 柔软绿草丘与花朵簇 */}
            <ellipse cx="0" cy="8" rx="36" ry="20" fill="#059669" opacity="0.9" />
            <ellipse cx="-8" cy="2" rx="28" ry="16" fill="#10B981" />
            {/* 舒缓白雏菊与粉色花瓣 */}
            <circle cx="-16" cy="-4" r="4" fill="#FDE047" />
            <circle cx="-16" cy="-4" r="2" fill="#F59E0B" />
            <circle cx="14" cy="4" r="4" fill="#FDA4AF" />
            <circle cx="14" cy="4" r="2" fill="#E11D48" />
            <circle cx="2" cy="14" r="3.5" fill="#C4B5FD" />

            {/* 宁静休息木质长椅 */}
            <rect x="-18" y="-14" width="36" height="8" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
            <rect x="-16" y="-6" width="5" height="12" rx="1.5" fill="#78350F" />
            <rect x="11" y="-6" width="5" height="12" rx="1.5" fill="#78350F" />
            {/* 摇曳的暖心小风铃 / 蒲公英 */}
            <circle cx="0" cy="-24" r="7" fill="#FFFFFF" opacity="0.9" stroke="#6EE7B7" strokeWidth="1.5" />
            <line x1="0" y1="-17" x2="0" y2="-6" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* ======================================================= */}
          {/* 空间地标 2: 大困难拆解台 (Big Difficulty Breaker Station) */}
          {/* ======================================================= */}
          <g id="landmark-breaker" transform="translate(825, 495)">
            {/* 三级踏脚石阶梯平台 (1步、2步、3步) */}
            {/* 阶梯 1 */}
            <path d="M -45 15 L -10 0 L 25 15 L -10 30 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
            <path d="M -45 15 L -45 25 L -10 40 L -10 30 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M -10 30 L -10 40 L 25 25 L 25 15 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
            {/* 阶梯 2 */}
            <path d="M -30 -5 L 0 -18 L 30 -5 L 0 8 Z" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
            <path d="M -30 -5 L -30 4 L 0 17 L 0 8 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
            <path d="M 0 8 L 0 17 L 30 4 L 30 -5 Z" fill="#EAB308" stroke="#A16207" strokeWidth="1.5" />
            {/* 阶梯 3: 顶层拆解魔法工坊木台 */}
            <path d="M -20 -25 L 10 -38 L 40 -25 L 10 -12 Z" fill="#FED7AA" stroke="#F97316" strokeWidth="2" />
            <path d="M -20 -25 L -20 -15 L 10 -2 L 10 -12 Z" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.5" />
            <path d="M 10 -12 L 10 -2 L 40 -15 L 40 -25 Z" fill="#FB923C" stroke="#C2410C" strokeWidth="1.5" />

            {/* 木工桌上的彩色积木与小齿轮 */}
            <rect x="2" y="-34" width="8" height="8" rx="1.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
            <rect x="12" y="-34" width="8" height="8" rx="1.5" fill="#34D399" stroke="#059669" strokeWidth="1" />
            <circle cx="8" cy="-22" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" strokeDasharray="2 2" />
            {/* 小金木槌 */}
            <line x1="-12" y1="-30" x2="-2" y2="-20" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            <rect x="-16" y="-35" width="7" height="10" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" transform="rotate(-40 -16 -35)" />
          </g>

          {/* ======================================================= */}
          {/* 空间地标 3: 思考侦探所 (Thought Detective Lab) */}
          {/* ======================================================= */}
          <g id="landmark-detective" transform="translate(485, 335)">
            {/* 圆形石砌工坊底座 */}
            <ellipse cx="0" cy="22" rx="38" ry="16" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
            {/* 侦探木屋主体 */}
            <path d="M -26 18 L -26 -10 L 0 -26 L 26 -10 L 26 18 Z" fill="#FEF3C7" stroke="#B45309" strokeWidth="2.5" />
            {/* 木质三角屋檐与暖灯 */}
            <polygon points="-32,-8 0,-32 32,-8" fill="#B45309" stroke="#78350F" strokeWidth="2" />
            <circle cx="0" cy="-6" r="6" fill="#FDE047" stroke="#D97706" strokeWidth="1.5" />

            {/* 标志性巨大黄铜放大镜 (Brass Magnifying Glass Tower) */}
            <g transform="translate(18, -18)">
              <circle cx="10" cy="0" r="16" fill="#E0F2FE" opacity="0.85" stroke="url(#brassGrad)" strokeWidth="4.5" />
              <line x1="22" y1="12" x2="34" y2="24" stroke="#78350F" strokeWidth="5.5" strokeLinecap="round" />
              <circle cx="8" cy="-2" r="3.5" fill="#FFFFFF" opacity="0.8" />
            </g>

            {/* 好奇心之树与三色宝盒 (事实/想法/感觉) */}
            <g transform="translate(-32, -10)">
              {/* 小树 */}
              <circle cx="-6" cy="-8" r="14" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
              <line x1="-6" y1="6" x2="-6" y2="18" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
              {/* 宝盒 1: 事实 (金色) */}
              <rect x="-14" y="0" width="8" height="7" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
              {/* 宝盒 2: 想法 (蓝色) */}
              <rect x="-4" y="-4" width="8" height="7" rx="1.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
              {/* 宝盒 3: 感觉 (粉色) */}
              <rect x="6" y="2" width="8" height="7" rx="1.5" fill="#FB7185" stroke="#E11D48" strokeWidth="1" />
            </g>
          </g>

          {/* ======================================================= */}
          {/* 空间地标 4: 双向桥小驿 (Two Homes Bridge) */}
          {/* ======================================================= */}
          <g id="landmark-bridge" transform="translate(490, 535)">
            {/* 木拱桥主拱梁 */}
            <path
              d="M -48 6 Q 0 -22, 48 6"
              fill="none"
              stroke="url(#bridgeWoodGrad)"
              strokeWidth="11"
              strokeLinecap="round"
            />
            {/* 拱桥护栏与木柱 */}
            <path
              d="M -48 -2 Q 0 -30, 48 -2"
              fill="none"
              stroke="#D97706"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line x1="-30" y1="2" x2="-30" y2="-12" stroke="#78350F" strokeWidth="2.5" />
            <line x1="-10" y1="-8" x2="-10" y2="-22" stroke="#78350F" strokeWidth="2.5" />
            <line x1="10" y1="-8" x2="10" y2="-22" stroke="#78350F" strokeWidth="2.5" />
            <line x1="30" y1="2" x2="30" y2="-12" stroke="#78350F" strokeWidth="2.5" />
            {/* 桥中央温暖明灯 */}
            <circle cx="0" cy="-24" r="5" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1.5" />

            {/* 左岸温馨小屋 (Peach Roof Cottage) */}
            <g transform="translate(-62, -4)">
              <rect x="-12" y="-12" width="24" height="20" rx="3" fill="#FFF1F2" stroke="#E11D48" strokeWidth="1.5" />
              <polygon points="-16,-10 0,-24 16,-10" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1.8" />
              {/* 小书包挂在门前 */}
              <rect x="2" y="-4" width="7" height="9" rx="1.8" fill="#F43F5E" />
            </g>

            {/* 右岸蔚蓝小屋 (Sky Roof Cottage) */}
            <g transform="translate(62, -4)">
              <rect x="-12" y="-12" width="24" height="20" rx="3" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.5" />
              <polygon points="-16,-10 0,-24 16,-10" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1.8" />
              {/* 小门窗与暖光 */}
              <rect x="-3" y="-3" width="7" height="11" rx="1" fill="#FEF08A" />
            </g>
          </g>

          {/* ======================================================= */}
          {/* 空间地标 5: 故事森林 (Story Grove) */}
          {/* ======================================================= */}
          <g id="landmark-story" transform="translate(215, 245)">
            {/* 密林远景发光古树群 */}
            <circle cx="-32" cy="-18" r="28" fill="url(#storyTreeGrad)" />
            <circle cx="30" cy="-22" r="26" fill="url(#storyTreeGrad)" />
            <circle cx="0" cy="-38" r="32" fill="url(#storyTreeGrad)" />

            {/* 发光思考之叶与萤火光斑 */}
            <circle cx="-18" cy="-32" r="3" fill="#FEF08A" className="anim-fairy-light" />
            <circle cx="16" cy="-40" r="3" fill="#FEF08A" className="anim-fairy-light" />
            <circle cx="28" cy="-10" r="2.5" fill="#A7F3D0" className="anim-fairy-light" />

            {/* 树干 */}
            <rect x="-8" y="-10" width="16" height="28" rx="4" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />

            {/* 中央巨大展开童话绘本亭 (Open Picture Book Gazebo) */}
            <g transform="translate(0, 8)">
              {/* 展开的绘本书页 */}
              <path
                d="M -26 -6 Q 0 -16, 26 -6 L 26 12 Q 0 2, -26 12 Z"
                fill="#FEF3C7"
                stroke="#D97706"
                strokeWidth="2.5"
              />
              <line x1="0" y1="-12" x2="0" y2="7" stroke="#B45309" strokeWidth="2.5" />
              {/* 书页插画小色彩条 */}
              <line x1="-20" y1="-1" x2="-6" y2="-4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              <line x1="-20" y1="4" x2="-6" y2="1" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="-4" x2="20" y2="-1" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="1" x2="20" y2="4" stroke="#FB7185" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>

          {/* ======================================================= */}
          {/* 空间地标 6: 星光树屋与勇气小屋 (Courage & Starlight Treehouse) */}
          {/* ======================================================= */}
          <g id="landmark-treehouse" transform="translate(780, 240)">
            {/* 参天古树巨大树冠 */}
            <ellipse cx="0" cy="-45" rx="56" ry="46" fill="url(#starlightCanopyGrad)" />
            <circle cx="-32" cy="-65" r="32" fill="url(#starlightCanopyGrad)" />
            <circle cx="32" cy="-60" r="34" fill="url(#starlightCanopyGrad)" />

            {/* 粗壮古树干与绳梯 */}
            <path d="M -16 -10 Q -10 20 -20 40 L 20 40 Q 10 20 16 -10 Z" fill="#78350F" stroke="#451A03" strokeWidth="2" />
            <line x1="18" y1="5" x2="18" y2="35" stroke="#D97706" strokeWidth="2" strokeDasharray="3 3" />

            {/* 下层建筑: 勇气小屋 (Courage Cabin) */}
            <g transform="translate(-32, -8)">
              <rect x="-16" y="-12" width="32" height="24" rx="4" fill="#FFE4E6" stroke="#E11D48" strokeWidth="2" />
              <polygon points="-20,-10 0,-24 20,-10" fill="#F43F5E" stroke="#BE123C" strokeWidth="2" />
              {/* 安全爱心护盾 */}
              <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
              <path d="M -3 -1 Q 0 -4 3 -1 Q 0 4 -3 -1 Z" fill="#E11D48" />
              {/* 勇气明灯 */}
              <circle cx="16" cy="-4" r="3.5" fill="#FDE047" stroke="#F59E0B" strokeWidth="1" />
            </g>

            {/* 上层建筑: 星光树屋与望远镜 (Starlight Observatory) */}
            <g transform="translate(24, -65)">
              <rect x="-16" y="-10" width="32" height="22" rx="4" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2" />
              {/* 玻璃星空穹顶 */}
              <path d="M -16 -10 A 16 16 0 0 1 16 -10 Z" fill="#C7D2FE" opacity="0.8" stroke="#4F46E5" strokeWidth="1.8" />
              {/* 黄铜天文望远镜指向夜空 */}
              <line x1="-4" y1="-8" x2="22" y2="-28" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="16" y1="-24" x2="24" y2="-30" stroke="#B45309" strokeWidth="6" strokeLinecap="round" />
              {/* 悬挂的月牙与拼图星 */}
              <path d="M 32 -38 A 8 8 0 0 0 38 -26 A 10 10 0 1 1 32 -38 Z" fill="#FDE047" />
              <circle cx="12" cy="-44" r="2" fill="#FEF08A" className="anim-fairy-light" />
              <circle cx="-18" cy="-50" r="2.5" fill="#FEF08A" className="anim-fairy-light" />
            </g>
          </g>

          {/* ======================================================= */}
          {/* 空间地标 7: 情绪天气站 (Weather Sky Observatory) */}
          {/* ======================================================= */}
          <g id="landmark-weather" transform="translate(495, 135)">
            {/* 山巅晴雨观测站木塔 */}
            <ellipse cx="0" cy="18" rx="28" ry="10" fill="#64748B" opacity="0.5" />
            <rect x="-18" y="-12" width="36" height="26" rx="4" fill="#F0F9FF" stroke="#0284C7" strokeWidth="2.5" />
            <polygon points="-24,-10 0,-28 24,-10" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />

            {/* 旋转风速仪与风向小鸟 */}
            <line x1="0" y1="-28" x2="0" y2="-44" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="-44" r="3" fill="#F59E0B" />
            <line x1="-8" y1="-44" x2="8" y2="-44" stroke="#0284C7" strokeWidth="2" />
            <circle cx="-8" cy="-44" r="2" fill="#EF4444" />
            <circle cx="8" cy="-44" r="2" fill="#3B82F6" />

            {/* 彩虹柔光弧与阳光云朵 */}
            <path
              d="M -35 -20 Q 0 -52 35 -20"
              fill="none"
              stroke="#FDE047"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M -32 -23 Q 0 -55 32 -23"
              fill="none"
              stroke="#FDA4AF"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* 晴雨小太阳与小雨滴徽记 */}
            <circle cx="-16" cy="-28" r="6" fill="#FDE047" stroke="#F59E0B" strokeWidth="1.5" />
            <path d="M 16 -24 Q 18 -20 16 -18 Q 14 -20 16 -24 Z" fill="#0284C7" />
          </g>

          {/* ======================================================= */}
          {/* 6. 交互热区层 (Interactive SVG Landmark Buttons >= 56px) */}
          {/* ======================================================= */}
          {landmarks.map((lm) => {
            const isHovered = activeLandmark === lm.id;
            return (
              <g
                key={lm.id}
                role="button"
                tabIndex={0}
                aria-label={lm.ariaLabel}
                className="group cursor-pointer focus:outline-none"
                onClick={() => handleLandmarkClick(lm)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLandmarkClick(lm);
                  }
                }}
                onMouseEnter={() => setActiveLandmark(lm.id)}
                onMouseLeave={() => setActiveLandmark(null)}
                onFocus={() => setActiveLandmark(lm.id)}
                onBlur={() => setActiveLandmark(null)}
              >
                {/* 1. 大触控检测区域：使用 fill="#FFFFFF" fillOpacity="0.001" 确保在所有 SVG 引擎中 100% 拦截并响应点击 */}
                <rect
                  x={lm.coords.cx - lm.coords.hitWidth / 2}
                  y={lm.coords.cy - lm.coords.hitHeight / 2}
                  width={lm.coords.hitWidth}
                  height={lm.coords.hitHeight}
                  fill="#FFFFFF"
                  fillOpacity="0.001"
                  pointerEvents="all"
                  className="cursor-pointer"
                />

                {/* 2. 悬浮/聚焦时的 2.5D 高亮脉冲圈 */}
                <circle
                  cx={lm.coords.cx}
                  cy={lm.coords.cy}
                  r={isHovered ? 48 : 34}
                  fill={lm.colorScheme.glow}
                  opacity={isHovered ? 0.35 : 0.08}
                  className="transition-all duration-200 motion-reduce:transition-none"
                />

                {/* 3. 悬浮地标指示徽章 (高对比白底彩色标签，文字清晰) */}
                <g
                  transform={`translate(${lm.coords.badgeX}, ${lm.coords.badgeY})`}
                  className={`transition-transform duration-200 motion-reduce:transition-none ${
                    isHovered ? '-translate-y-2' : ''
                  }`}
                  filter="url(#badgeShadow)"
                >
                  {/* 徽章背景胶囊 */}
                  <rect
                    x="0"
                    y="0"
                    width="140"
                    height="42"
                    rx="16"
                    fill="#FFFFFF"
                    stroke={lm.colorScheme.glow}
                    strokeWidth={isHovered ? 3 : 2}
                  />
                  {/* 小圆点彩灯 */}
                  <circle cx="16" cy="21" r="5" fill={lm.colorScheme.glow} />
                  {/* 地标名称 */}
                  <text
                    x="28"
                    y="26"
                    fontSize="15"
                    fontWeight="900"
                    fill="#1C1917"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {lm.title}
                  </text>
                  {/* 进入箭头指示器 */}
                  <circle cx="124" cy="21" r="10" fill={lm.colorScheme.glow} />
                  <path d="M 121 16 L 127 21 L 121 26" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 选定/悬浮地标故事小导览栏 & 今日小岛微探索线索栏 */}
      {(() => {
        const current = landmarks.find((l) => l.id === (activeLandmark ?? 'detective'));
        if (!current) return null;
        return (
          <div
            data-testid="island-micro-clue-bar"
            className="mt-3 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-2 border-amber-300 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn"
            role="status"
            aria-live="polite"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black bg-amber-400 text-stone-900 px-2.5 py-0.5 rounded-full">
                  {activeLandmark ? '📍 地标微探索预览' : '🔍 今日小岛探索线索'}
                </span>
                <span className="text-base sm:text-lg font-black text-stone-900">{current.title}</span>
                <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                  {current.id === 'detective' && solvedCasesCount > 0
                    ? `已破案 ${solvedCasesCount} 起`
                    : current.tag}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
                {current.desc}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => handleReadLandmark(e, current.speechText)}
                className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 border border-amber-200 cursor-pointer shadow-2xs focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
                aria-label={`朗读${current.title}线索介绍`}
                title={`朗读${current.title}线索介绍`}
              >
                <Volume2 className="w-5 h-5 text-amber-800" />
              </button>
              <button
                type="button"
                onClick={() => handleLandmarkClick(current)}
                className="min-h-[56px] px-4 py-2.5 bg-stone-900 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-black shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                {current.actionText} →
              </button>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 8 大探索空间故事书画卷快捷导航条 (进入与朗读语义分离，触控全部 >= 56px) */}
      {/* ========================================================================= */}
      <div className="mt-4 pt-3 border-t-2 border-stone-200/80">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-black text-stone-900">
              童话小岛八大探索空间直接进入
            </span>
            <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-bold">
              触控目标 ≥ 56px
            </span>
          </div>
          <span className="text-xs text-stone-500 font-medium hidden sm:inline">
            左侧直接进入地点，右侧独立听取语音介绍
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
          {landmarks.map((lm) => {
            const isVisited = expMetrics.visitedLandmarks.includes(lm.id);
            const dynamicBadge =
              lm.id === 'detective' && solvedCasesCount > 0
                ? `已破案 ${solvedCasesCount} 起`
                : lm.id === 'story' && completedStoriesCount > 0
                ? `已读 ${completedStoriesCount} 篇`
                : lm.tag;

            return (
              <div
                key={lm.id}
                onMouseEnter={() => setActiveLandmark(lm.id)}
                onMouseLeave={() => setActiveLandmark(null)}
                className={`group flex items-stretch justify-between gap-2 p-2.5 rounded-2xl bg-linear-to-b ${lm.colorScheme.bg} border-2 ${lm.colorScheme.border} hover:border-amber-400 shadow-xs hover:shadow-md transition-all`}
              >
                <button
                  type="button"
                  onClick={() => handleLandmarkClick(lm)}
                  onFocus={() => setActiveLandmark(lm.id)}
                  onBlur={() => setActiveLandmark(null)}
                  className="flex-1 flex items-center justify-between gap-2 text-left min-h-[56px] min-w-0 px-1.5 py-1 rounded-xl cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
                  aria-label={lm.ariaLabel}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl bg-white/90 text-stone-900 flex items-center justify-center font-black text-base shadow-2xs border border-stone-200 shrink-0"
                      aria-hidden="true"
                    >
                      {lm.id === 'calm' && '🌿'}
                      {lm.id === 'breaker' && '🔨'}
                      {lm.id === 'detective' && '🔍'}
                      {lm.id === 'bridge' && '🌉'}
                      {lm.id === 'story' && '📖'}
                      {lm.id === 'courage' && '🛡️'}
                      {lm.id === 'starlight' && '⭐'}
                      {lm.id === 'weather' && '⛅'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-base font-black text-stone-900 group-hover:text-amber-900 transition-colors whitespace-nowrap">
                          {lm.title}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${lm.colorScheme.badgeBg} ${lm.colorScheme.badgeText}`}>
                          {dynamicBadge}
                        </span>
                        {isVisited && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                            已探索
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 font-medium truncate mt-0.5">
                        {lm.subTitle}
                      </p>
                    </div>
                  </div>
                  <span
                    className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center text-sm font-black shadow-xs group-hover:bg-amber-600 shrink-0 transition-colors"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleReadLandmark(e, lm.speechText)}
                  className="w-14 h-14 min-w-[56px] min-h-[56px] self-center rounded-xl bg-white/95 hover:bg-white text-stone-800 flex items-center justify-center transition-colors cursor-pointer border border-stone-200 shadow-2xs shrink-0 focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
                  aria-label={`朗读${lm.title}介绍`}
                  title={`朗读${lm.title}介绍`}
                >
                  <Volume2 className="w-5 h-5 text-amber-700" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
