import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Compass,
  Scale,
  Boxes,
  Heart,
  ListChecks,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Check,
  BookOpen
} from 'lucide-react';
import { ParentMedal, ParentMedalPosture } from '../../types';
import { sounds } from '../../utils/sound';

interface Props {
  medals: ParentMedal[];
  onManualUnlock?: (medalId: string) => void;
  onNavigateTab?: (tab: 'observe' | 'pocketTips' | 'consistency' | 'huginbox') => void;
}

export const ParentMedalsWall: React.FC<Props> = ({
  medals,
  onManualUnlock,
  onNavigateTab
}) => {
  const [filter, setFilter] = useState<'all' | ParentMedalPosture>('all');
  const [selectedMedalId, setSelectedMedalId] = useState<string | null>(null);
  const [justCelebratedId, setJustCelebratedId] = useState<string | null>(null);

  const unlockedCount = medals.filter((m) => m.unlocked).length;
  const totalCount = medals.length;

  const filteredMedals = medals.filter((m) => {
    if (filter === 'all') return true;
    return m.posture === filter;
  });

  const selectedMedal = medals.find((m) => m.id === selectedMedalId) || medals[0];

  const getThemeStyles = (theme: ParentMedal['badgeTheme'], unlocked: boolean) => {
    if (!unlocked) {
      return {
        cardBg: 'bg-stone-50 border-stone-200 opacity-75',
        badgeBg: 'bg-stone-200 text-stone-500 border-stone-300',
        badgeBorder: 'border-stone-300',
        textColor: 'text-stone-500',
        highlightText: 'text-stone-600',
        glow: ''
      };
    }
    switch (theme) {
      case 'sky':
        return {
          cardBg: 'bg-linear-to-br from-sky-50 to-white border-sky-300 hover:border-sky-400',
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
          badgeBorder: 'border-sky-300',
          textColor: 'text-sky-900',
          highlightText: 'text-sky-700',
          glow: 'shadow-sky-100'
        };
      case 'emerald':
        return {
          cardBg: 'bg-linear-to-br from-emerald-50 to-white border-emerald-300 hover:border-emerald-400',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          badgeBorder: 'border-emerald-300',
          textColor: 'text-emerald-900',
          highlightText: 'text-emerald-700',
          glow: 'shadow-emerald-100'
        };
      case 'amber':
        return {
          cardBg: 'bg-linear-to-br from-amber-50 to-white border-amber-300 hover:border-amber-400',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          badgeBorder: 'border-amber-300',
          textColor: 'text-amber-950',
          highlightText: 'text-amber-700',
          glow: 'shadow-amber-100'
        };
      case 'rose':
        return {
          cardBg: 'bg-linear-to-br from-rose-50 to-white border-rose-300 hover:border-rose-400',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          badgeBorder: 'border-rose-300',
          textColor: 'text-rose-950',
          highlightText: 'text-rose-700',
          glow: 'shadow-rose-100'
        };
      case 'indigo':
        return {
          cardBg: 'bg-linear-to-br from-indigo-50 to-white border-indigo-300 hover:border-indigo-400',
          badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          badgeBorder: 'border-indigo-300',
          textColor: 'text-indigo-950',
          highlightText: 'text-indigo-700',
          glow: 'shadow-indigo-100'
        };
      case 'purple':
      default:
        return {
          cardBg: 'bg-linear-to-br from-purple-50 to-white border-purple-300 hover:border-purple-400',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
          badgeBorder: 'border-purple-300',
          textColor: 'text-purple-950',
          highlightText: 'text-purple-700',
          glow: 'shadow-purple-100'
        };
    }
  };

  const handleCelebrateManual = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playBell();
    if (onManualUnlock) {
      onManualUnlock(id);
    }
    setJustCelebratedId(id);
    setTimeout(() => {
      setJustCelebratedId(null);
    }, 2800);
  };

  return (
    <div className="space-y-6">
      {/* 顶部荣誉墙介绍横幅 */}
      <div className="bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-300/80 p-5 sm:p-6 rounded-3xl shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-3 py-1 rounded-full">
                🏅 养育勋章 · 成长印章墙
              </span>
              <span className="text-xs text-stone-600 font-medium">
                见证父母从情绪反应走向科学脚手架
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              每一次温和而坚定的引导，都是刻在孩子心里的安全锚
            </h2>
            <p className="text-sm text-stone-700 font-medium leading-relaxed max-w-3xl">
              这里不设打卡积分，不设家长排名。每一枚勋章代表一个具体的<strong>心理学成长里程碑</strong>。
              当你在生活里帮孩子区分了一次事实、翻转了一次双面币、给了一个自主小选择，你就稳稳地拓宽了孩子的心理弹性。
            </p>
          </div>

          <div className="bg-white/95 p-4 rounded-2xl border border-amber-200 shadow-2xs shrink-0 text-center space-y-1 min-w-[160px]">
            <span className="text-xs text-stone-500 font-bold block">亲子思考成长里程碑</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-900">
              {unlockedCount} <span className="text-sm font-medium text-stone-500">/ {totalCount}</span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${Math.round((unlockedCount / totalCount) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-amber-800 font-medium block pt-0.5">
              已点亮 {Math.round((unlockedCount / totalCount) * 100)}% 思考姿态
            </span>
          </div>
        </div>
      </div>

      {/* 筛选标签栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              sounds.playClick();
              setFilter('all');
            }}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            全部印章 ({totalCount})
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setFilter('fen');
            }}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'fen'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-sky-800 hover:bg-sky-50'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>分 · 事实锚定</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setFilter('tong');
            }}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'tong'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>通 · 双面视角</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setFilter('ze');
            }}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'ze'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>择 · 赋能自主</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setFilter('presence');
            }}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'presence'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-800 hover:bg-rose-50'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>土 · 温暖在场</span>
          </button>
        </div>

        <span className="text-xs text-stone-500 font-medium px-2">
          点击任意勋章查看心理学原理与落地引导法
        </span>
      </div>

      {/* 勋章卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMedals.map((medal) => {
          const styles = getThemeStyles(medal.badgeTheme, medal.unlocked);
          const isSelected = selectedMedalId === medal.id;
          const isJustCelebrated = justCelebratedId === medal.id;

          return (
            <div
              key={medal.id}
              onClick={() => {
                sounds.playClick();
                setSelectedMedalId(medal.id);
              }}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${styles.cardBg} ${
                isSelected ? 'ring-3 ring-amber-400 ring-offset-2' : ''
              }`}
            >
              <div className="space-y-3">
                {/* 顶栏：姿态标签 + 解锁状态 */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${styles.badgeBg}`}
                  >
                    {medal.postureLabel}
                  </span>
                  {medal.unlocked ? (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{medal.unlockedAt || '已点亮'}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-stone-400" />
                      <span>待达成</span>
                    </span>
                  )}
                </div>

                {/* 勋章大图标与标题 */}
                <div className="flex items-center gap-3 pt-1">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border-2 shrink-0 ${
                      medal.unlocked
                        ? 'bg-white border-amber-200 shadow-amber-100'
                        : 'bg-stone-100 border-stone-200 grayscale opacity-60'
                    }`}
                  >
                    {medal.emoji}
                  </div>
                  <div>
                    <h3 className={`text-base font-black ${medal.unlocked ? 'text-stone-900' : 'text-stone-500'}`}>
                      {medal.title}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium line-clamp-1 mt-0.5">
                      {medal.triggerDescription}
                    </p>
                  </div>
                </div>

                {/* 获得条件说明 */}
                <div className="p-2.5 bg-white/80 rounded-xl border border-stone-200/80 text-xs text-stone-600 font-medium">
                  <span className="font-bold text-stone-700 block text-[11px]">达成路径：</span>
                  <span className="leading-relaxed">{medal.criteriaHint}</span>
                </div>
              </div>

              {/* 卡片底栏操作 */}
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedMedalId(medal.id);
                  }}
                  className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1"
                >
                  <span>心理学解读</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleCelebrateManual(medal.id, e)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                    isJustCelebrated
                      ? 'bg-emerald-600 text-white'
                      : medal.unlocked
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                      : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                  }`}
                  title="标记今天我已在真实生活中引导过这项姿态"
                >
                  {isJustCelebrated ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>已记录今天！</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3 h-3" />
                      <span>今日已践行</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 选中勋章的深度心理学与实操解读弹窗/看板 */}
      {selectedMedal && (
        <div className="bg-white rounded-3xl border-2 border-amber-300/80 p-5 sm:p-7 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-amber-50 rounded-2xl border border-amber-200">
                {selectedMedal.emoji}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-stone-900">
                    {selectedMedal.title}
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {selectedMedal.postureLabel}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
                  {selectedMedal.triggerDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateTab && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    if (selectedMedal.posture === 'fen' || selectedMedal.posture === 'tong' || selectedMedal.posture === 'ze') {
                      onNavigateTab('observe');
                    } else if (selectedMedal.posture === 'presence') {
                      onNavigateTab('huginbox');
                    } else if (selectedMedal.posture === 'consistency') {
                      onNavigateTab('consistency');
                    } else {
                      onNavigateTab('pocketTips');
                    }
                  }}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>直达对应功能实操</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-1">
            {/* 发展心理学机制 */}
            <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200 space-y-2">
              <span className="text-xs font-black text-sky-900 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-sky-600" />
                <span>背后的儿童认知与大脑发育规律：</span>
              </span>
              <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed">
                {selectedMedal.developmentalSignificance}
              </p>
            </div>

            {/* 现实养育落地动作 */}
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>家长带走一个现实落地动作：</span>
              </span>
              <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed">
                {selectedMedal.practicalParentTip}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
