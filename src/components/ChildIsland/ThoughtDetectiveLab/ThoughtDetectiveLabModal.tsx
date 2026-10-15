import React, { useState } from 'react';
import {
  Search,
  Flag,
  Eye,
  Coins,
  Scale,
  ShieldAlert,
  Boxes,
  CircleDot,
  Layers,
  X,
  Volume2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  Hammer
} from 'lucide-react';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';
import { DifficultyBreakerModal } from '../DifficultyBreaker/DifficultyBreakerModal';
import {
  RainWeatherIllustration,
  LocationBadgeIllustration,
  DetectiveMagnifierIllustration
} from '../StoryGrove/StoryIllustrations';
import { CrayonDetectiveGame } from '../../InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame';
import { TransferScenariosModal } from '../../InteractiveGames/TransferLab/TransferScenariosModal';
import { loadProductExperienceMetrics } from '../../../domain/cognitive/productExperienceMetrics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ThoughtDetectiveLabModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'threeBoxes' | 'circles' | 'fourSteps'>('tools');
  const [isBreakerOpen, setIsBreakerOpen] = useState<boolean>(false);
  const [isCrayonGameOpen, setIsCrayonGameOpen] = useState<boolean>(false);
  const [isTransferLabOpen, setIsTransferLabOpen] = useState<boolean>(false);
  const expMetrics = loadProductExperienceMetrics();

  // Tool Workshop State
  const [activeTool, setActiveTool] = useState<'flag' | 'lenses' | 'coin' | 'scale' | 'fence'>('flag');

  // Flag tool interactive
  const [personFlagRemoved, setPersonFlagRemoved] = useState<boolean>(false);

  // Lenses interactive
  const [currentLens, setCurrentLens] = useState<'my' | 'his' | 'sky'>('my');

  // Coin interactive
  const [coinSide, setCoinSide] = useState<'front' | 'back'>('front');

  // Three boxes classification state
  const [boxItems, setBoxItems] = useState([
    { id: '1', text: '桌上的牛奶打翻了，地板湿了', target: 'visible', placed: 'visible' },
    { id: '2', text: '心里一阵酸酸的，想掉眼泪', target: 'heart', placed: 'heart' },
    { id: '3', text: '“他肯定是故意让我难看的！”', target: 'guess', placed: null as string | null },
    { id: '4', text: '门被风吹得砰的一声关上了', target: 'visible', placed: null as string | null },
    { id: '5', text: '肚子紧绷绷的，像个小皮球', target: 'heart', placed: null as string | null }
  ]);

  // Responsibility Circles state
  const [circleItems, setCircleItems] = useState([
    { id: 'c1', text: '大人分开住在不同房子里', target: 'adult', placed: 'adult' },
    { id: 'c2', text: '难过了跟大人要一个抱抱', target: 'mine', placed: 'mine' },
    { id: 'c3', text: '周末一起去公园还是去看绘本', target: 'together', placed: null as string | null },
    { id: 'c4', text: '大人之间商量生活费和日程', target: 'adult', placed: null as string | null },
    { id: 'c5', text: '晚上按时刷牙洗脸睡觉', target: 'mine', placed: null as string | null }
  ]);

  // 4 steps of stepping back
  const [currentStep, setCurrentStep] = useState<number>(1);

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    speechNarrator.speak(text);
  };

  const handlePlaceBox = (itemId: string, boxType: string) => {
    sounds.playClick();
    setBoxItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, placed: boxType } : item)
    );
  };

  const handlePlaceCircle = (itemId: string, circleType: string) => {
    sounds.playClick();
    setCircleItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, placed: circleType } : item)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-sky-50/95 border-2 border-sky-200 rounded-3xl p-4 sm:p-8 max-w-2xl w-full shadow-2xl relative my-auto transition-all duration-200 text-stone-800 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-stone-500 hover:text-stone-700 p-2 rounded-full hover:bg-sky-100 transition-colors z-20 cursor-pointer min-w-[56px] min-h-[56px] flex items-center justify-center"
          aria-label="离开想法侦探社"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pr-12">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center p-1.5 shadow-inner shrink-0 border-2 border-amber-200">
            <LocationBadgeIllustration type="detective" className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xl sm:text-3xl font-black text-stone-800">
                想法侦探社 · 工具坊
              </h3>
              <button
                onClick={() => handleSpeak("想法侦探社：这里有四件神奇的小工具和一道安全围栏，帮你看清心里的声音！")}
                className="p-2 rounded-xl text-sky-700 hover:bg-sky-100 min-w-[56px] min-h-[56px] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="听一听想法侦探社介绍"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <p className="text-sm sm:text-base text-stone-600 font-medium">工具是拿在手里的把手，帮我们退后一步看清真相</p>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsBreakerOpen(true);
                }}
                className="min-h-[48px] px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                aria-label="打开大困难拆解台"
              >
                <span>🔨 大困难拆解台</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Storybook Hero Illustration */}
        <div className="mb-4 rounded-2xl overflow-hidden border-2 border-amber-200 shadow-sm bg-amber-50">
          <DetectiveMagnifierIllustration className="w-full h-32 sm:h-40 object-cover" />
        </div>

        {/* 真实可玩探案互动横幅 */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsCrayonGameOpen(true);
          }}
          className="w-full min-h-[64px] mb-4 p-3.5 bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-between gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl shrink-0" aria-hidden="true">🔍</span>
            <span className="text-left">
              <span>开始真实探案互动：《蜡笔侦探》（含多案件与新证据反转）</span>
              <span className="block text-xs font-normal text-amber-100 mt-0.5">
                {expMetrics.completedDetectiveCaseIds.length > 0
                  ? `已解开 ${expMetrics.completedDetectiveCaseIds.length} 起案件 · 修正判断 ${expMetrics.hypothesisRevisionCount} 次 · 迁移练习 ${expMetrics.completedTransferScenarioIds.length} 个`
                  : '用手指移动放大镜找线索，区分事实与猜测，在发现新证据后修正判断'}
              </span>
            </span>
          </div>
          <span className="text-xs bg-amber-700/60 px-3 py-1.5 rounded-full font-bold shrink-0 whitespace-nowrap">
            立刻探索 →
          </span>
        </button>

        {isCrayonGameOpen ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCrayonGameOpen(false)}
                className="min-h-[56px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                ← 返回想法侦探社
              </button>
            </div>
            <CrayonDetectiveGame
              onExit={() => setIsCrayonGameOpen(false)}
              onOpenTransferLab={() => {
                setIsCrayonGameOpen(false);
                setIsTransferLabOpen(true);
              }}
            />
          </div>
        ) : (
          <>
            {/* Tab Navigation - min-h-[56px] */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-sky-100/70 rounded-2xl mb-6">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('tools');
            }}
            className={`min-h-[56px] py-2.5 px-2 rounded-xl text-xs sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'tools'
                ? 'bg-white text-sky-950 shadow-sm border border-sky-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="四件工具与围栏"
          >
            <Scale className="w-4 h-4 text-sky-700 shrink-0" />
            <span>四件工具与围栏</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('threeBoxes');
            }}
            className={`min-h-[56px] py-2.5 px-2 rounded-xl text-xs sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'threeBoxes'
                ? 'bg-white text-sky-950 shadow-sm border border-sky-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="三个分类盒子"
          >
            <Boxes className="w-4 h-4 text-sky-700 shrink-0" />
            <span>三个分类盒子</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('circles');
            }}
            className={`min-h-[56px] py-2.5 px-2 rounded-xl text-xs sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'circles'
                ? 'bg-white text-sky-950 shadow-sm border border-sky-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="责任圈拼图"
          >
            <CircleDot className="w-4 h-4 text-sky-700 shrink-0" />
            <span>责任圈拼图</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('fourSteps');
            }}
            className={`min-h-[56px] py-2.5 px-2 rounded-xl text-xs sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'fourSteps'
                ? 'bg-white text-sky-950 shadow-sm border border-sky-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="退后一步4台阶"
          >
            <Layers className="w-4 h-4 text-sky-700 shrink-0" />
            <span>退后4台阶</span>
          </button>
        </div>

        {/* ================= TAB 1: 四件工具与围栏 ================= */}
        {activeTab === 'tools' && (
          <div className="space-y-5">
            {/* Tool Selector Bar: 2 cols on mobile (5th spans 2), 5 cols on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTool('flag');
                }}
                className={`min-h-[64px] p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  activeTool === 'flag'
                    ? 'bg-amber-100 border-amber-400 font-extrabold text-amber-950 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
                aria-label="选择工具：小旗子"
              >
                <Flag className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <span className="text-xs sm:text-sm font-bold block whitespace-nowrap">小旗子</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTool('lenses');
                }}
                className={`min-h-[64px] p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  activeTool === 'lenses'
                    ? 'bg-sky-100 border-sky-400 font-extrabold text-sky-950 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
                aria-label="选择工具：三个镜头"
              >
                <Eye className="w-5 h-5 mx-auto mb-1 text-sky-600" />
                <span className="text-xs sm:text-sm font-bold block whitespace-nowrap">三个镜头</span>
              </button>

              <button
                onClick={() => {
                  sounds.playCoinFlip();
                  setActiveTool('coin');
                }}
                className={`min-h-[64px] p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  activeTool === 'coin'
                    ? 'bg-emerald-100 border-emerald-400 font-extrabold text-emerald-950 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
                aria-label="选择工具：双面币"
              >
                <Coins className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs sm:text-sm font-bold block whitespace-nowrap">双面币</span>
              </button>

              <button
                onClick={() => {
                  sounds.playScaleClink();
                  setActiveTool('scale');
                }}
                className={`min-h-[64px] p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  activeTool === 'scale'
                    ? 'bg-purple-100 border-purple-400 font-extrabold text-purple-950 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
                aria-label="选择工具：小天平"
              >
                <Scale className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <span className="text-xs sm:text-sm font-bold block whitespace-nowrap">小天平</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTool('fence');
                }}
                className={`col-span-2 sm:col-span-1 min-h-[64px] p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  activeTool === 'fence'
                    ? 'bg-rose-100 border-rose-400 font-extrabold text-rose-950 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
                aria-label="选择工具：安全围栏"
              >
                <ShieldAlert className="w-5 h-5 mx-auto mb-1 text-rose-600" />
                <span className="text-xs sm:text-sm font-bold block whitespace-nowrap">安全围栏</span>
              </button>
            </div>

            {/* TOOL 1: 小旗子 */}
            {activeTool === 'flag' && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-amber-600" />
                    小旗子：挂在事上的 vs 挂在人身上的
                  </h4>
                  <button
                    onClick={() => handleSpeak("小旗子：挂在事上的要清楚，比如打人不可以；挂在人身上的可以摘下来，比如他是坏孩子只是一个标签。")}
                    className="min-w-[48px] min-h-[48px] p-2 text-amber-700 hover:bg-amber-100 rounded-xl flex items-center justify-center cursor-pointer"
                    aria-label="听一听小旗子工具说明"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-800 block mb-1">🚩 挂在事上的旗子（要清楚）：</span>
                    <p className="text-stone-700 leading-relaxed font-medium">
                      “打人不可以”、“说谎害人不可以”。规矩要清清楚楚。
                    </p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-700 block mb-1">🏷️ 挂在人身上的旗子（可以摘）：</span>
                    <p className="text-stone-700 leading-relaxed font-medium">
                      “他是坏孩子”、“我是可怜的孩子”。一个人身上有许多面旗子，没有哪一面是他的全部！
                    </p>
                  </div>
                </div>

                {/* Interactive Flag Removal */}
                <div className="p-4 bg-amber-100/40 rounded-2xl border border-amber-200 text-center">
                  <p className="text-xs text-stone-600 mb-3">动动手：试试把贴在小兔子身上的标签旗子摘下来</p>
                  <div className="inline-flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl border-2 border-amber-200 shadow-xs">
                      🐰
                    </div>
                    {personFlagRemoved ? (
                      <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold animate-in zoom-in">
                        ✨ 旗子摘下啦：小兔子只是今天有点着急，他正在学着控制脾气！
                      </div>
                    ) : (
                      <div className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        🚩 贴着的标签：“坏脾气兔子”
                      </div>
                    )}
                    <button
                      onClick={() => {
                        sounds.playBell();
                        setPersonFlagRemoved(!personFlagRemoved);
                      }}
                      className="mt-2 min-h-[48px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                    >
                      {personFlagRemoved ? '重新贴上看看对比' : '点我把标签旗子摘下来！'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TOOL 2: 三个镜头 */}
            {activeTool === 'lenses' && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sky-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-sky-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-sky-600" />
                    三个镜头：退后一步的切换魔法
                  </h4>
                  <button
                    onClick={() => handleSpeak("三个镜头：我的眼睛、他的眼睛、天上的眼睛。点一下切换，把镜头拉到天上看看自己！")}
                    className="min-w-[48px] min-h-[48px] p-2 text-sky-700 hover:bg-sky-100 rounded-xl flex items-center justify-center cursor-pointer"
                    aria-label="听一听三个镜头工具说明"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setCurrentLens('my');
                    }}
                    className={`min-h-[48px] p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      currentLens === 'my'
                        ? 'bg-sky-100 border-sky-400 text-sky-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <span className="text-base block mb-1">👀</span>
                    <span className="text-xs">我的眼睛</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      setCurrentLens('his');
                    }}
                    className={`min-h-[48px] p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      currentLens === 'his'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <span className="text-base block mb-1">🧑‍🤝‍🧑</span>
                    <span className="text-xs">他的眼睛</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playBell();
                      setCurrentLens('sky');
                    }}
                    className={`min-h-[48px] p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      currentLens === 'sky'
                        ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <span className="text-base block mb-1">☁️</span>
                    <span className="text-xs">天上的眼睛</span>
                  </button>
                </div>

                <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs sm:text-sm">
                  {currentLens === 'my' && (
                    <div className="animate-in fade-in">
                      <strong className="text-sky-800 block mb-1">【我的眼睛】：</strong>
                      <p className="text-stone-700">“我辛辛苦苦搭的积木城堡被撞塌了，我好气啊！我想大喊大叫！”</p>
                    </div>
                  )}
                  {currentLens === 'his' && (
                    <div className="animate-in fade-in">
                      <strong className="text-emerald-800 block mb-1">【他的眼睛】：</strong>
                      <p className="text-stone-700">“他刚才在急着捡皮球，没看清脚下，他现在也很害怕我会打他，呆在原地。”</p>
                    </div>
                  )}
                  {currentLens === 'sky' && (
                    <div className="animate-in fade-in">
                      <strong className="text-amber-800 block mb-1">【天上的眼睛（退后一步）】：</strong>
                      <p className="text-stone-700 leading-relaxed">
                        “从天上往下看：两个小朋友站在积木旁。一个是气红了脸的我，头顶有一朵雷雨云；一个是害怕的他。城堡塌了是事实，但我们俩都还可以重新做选择。”
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TOOL 3: 双面币 */}
            {activeTool === 'coin' && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    双面币：翻过来看另一面（只问对谁好、对谁不好）
                  </h4>
                  <button
                    onClick={() => handleSpeak("双面币：翻翻看！只问对谁好、对谁不好、什么时候，不问可不可以。")}
                    className="min-w-[48px] min-h-[48px] p-2 text-emerald-700 hover:bg-emerald-100 rounded-xl flex items-center justify-center cursor-pointer"
                    aria-label="听一听双面币工具说明"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex flex-col items-center">
                  <button
                    onClick={() => {
                      sounds.playCoinFlip();
                      setCoinSide(coinSide === 'front' ? 'back' : 'front');
                    }}
                    className="w-28 h-28 rounded-full bg-linear-to-tr from-amber-400 via-amber-200 to-yellow-300 border-4 border-amber-500 shadow-lg flex flex-col items-center justify-center p-2 text-center transform hover:scale-105 active:rotate-180 transition-all duration-300 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-amber-900">
                      {coinSide === 'front' ? '正面 (下雨天)' : '反面 (下雨天)'}
                    </span>
                    <span className="text-[10px] text-amber-800 mt-1 block">点我翻转 🪙</span>
                  </button>

                  <div className="mt-4 p-3 bg-white rounded-2xl border border-emerald-200 text-xs w-full text-center space-y-3">
                    <div className="rounded-xl overflow-hidden border border-stone-200/80">
                      <RainWeatherIllustration focusSide={coinSide === 'front' ? 'frog' : 'rabbit'} className="w-full h-32 sm:h-36 object-cover" />
                    </div>

                    {coinSide === 'front' ? (
                      <p className="text-stone-700 font-medium">
                        <strong className="text-emerald-700">【对谁好】：</strong>农民伯伯的庄稼喝足了水，荷花池塘里的小青蛙开心极了！
                      </p>
                    ) : (
                      <p className="text-stone-700 font-medium">
                        <strong className="text-rose-700">【对谁不好】：</strong>准备野餐的小兔子不能去草地放风筝了，小翅膀湿漉漉的。
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TOOL 4: 小天平 */}
            {activeTool === 'scale' && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-600" />
                    小天平：掂量好处与代价
                  </h4>
                  <button
                    onClick={() => handleSpeak("小天平：把不同的做法放上去，看各自的好处与代价。自己选，自己担。")}
                    className="min-w-[48px] min-h-[48px] p-2 text-purple-700 hover:bg-purple-100 rounded-xl flex items-center justify-center cursor-pointer"
                    aria-label="听一听小天平工具说明"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <span className="font-bold text-purple-800 block mb-1">⚖️ 盘子左边：大声发脾气扔东西</span>
                    <p className="text-stone-600">好处：心里的怒气瞬间冲出来了</p>
                    <p className="text-rose-600 mt-0.5">代价：吓到朋友，玩具可能坏掉，事情还是没解决</p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <span className="font-bold text-purple-800 block mb-1">⚖️ 盘子右边：深呼吸两口并说“我不喜欢这样”</span>
                    <p className="text-emerald-700">好处：对方听懂了我的边界，我保护了自己</p>
                    <p className="text-stone-600 mt-0.5">代价：需要忍住前3秒的冲动</p>
                  </div>
                </div>
              </div>
            )}

            {/* TOOL 5: 围栏 (FENCE) */}
            {activeTool === 'fence' && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-rose-300 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    安全围栏：围栏里的事不上天平，直接说不！
                  </h4>
                  <button
                    onClick={() => handleSpeak("围栏里的事不上天平，直接说不！伤害身体、骗人害人、碰私处，一定要告诉信任的大人！")}
                    className="min-w-[48px] min-h-[48px] p-2 text-rose-700 hover:bg-rose-100 rounded-xl flex items-center justify-center cursor-pointer"
                    aria-label="听一听安全围栏说明"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2 text-rose-900">
                  <p className="font-bold">🚫 围栏里的铁律（绝对底线，不上天平掂量）：</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>故意伤害别人的身体（打人、推人、咬人）</li>
                    <li>骗人去害人、霸凌别的小朋友</li>
                    <li>碰别人的私处，或让任何人触碰我的私处</li>
                    <li>让我感到害怕、不舒服但有人让我保密的事情</li>
                  </ul>
                  <div className="mt-2 pt-2 border-t border-rose-200 font-bold text-rose-800">
                    👉 遇到围栏里的事：不用掂量，直接大声说“不！”，并且立刻告诉可信赖的大人！
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: 三个分类盒子 ================= */}
        {activeTab === 'threeBoxes' && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl border border-sky-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-stone-800">三个分类盒子</h4>
                <p className="text-xs text-stone-500">把卡片放进对应的盒子里，分清事实、感受与猜测</p>
              </div>
              <button
                onClick={() => handleSpeak("把卡片分进三个盒子：看得见的、心里的、脑子猜的。")}
                className="p-2 text-sky-700 hover:bg-sky-50 rounded-xl min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer"
                aria-label="朗读三个分类盒子说明"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Three Target Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-0 text-left sm:text-center">
                <span className="text-xl sm:text-base block sm:mb-1 shrink-0">👀</span>
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">看得见的</span>
                  <span className="text-[11px] sm:text-[10px] text-emerald-700">真实发生的事实</span>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-0 text-left sm:text-center">
                <span className="text-xl sm:text-base block sm:mb-1 shrink-0">💓</span>
                <div>
                  <span className="text-xs font-bold text-rose-900 block">心里的</span>
                  <span className="text-[11px] sm:text-[10px] text-rose-700">当下的身体与情绪感受</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-0 text-left sm:text-center">
                <span className="text-xl sm:text-base block sm:mb-1 shrink-0">💭</span>
                <div>
                  <span className="text-xs font-bold text-amber-900 block">猜的</span>
                  <span className="text-[11px] sm:text-[10px] text-amber-700">大脑编造的故事/猜测</span>
                </div>
              </div>
            </div>

            {/* Items to sort */}
            <div className="space-y-2 pt-2">
              {boxItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs"
                >
                  <span className="text-xs sm:text-sm font-medium text-stone-800 flex items-center gap-1.5">
                    {item.placed && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {item.text}
                  </span>

                  <div className="flex flex-wrap gap-1.5 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handlePlaceBox(item.id, 'visible')}
                      className={`min-h-[48px] flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        item.placed === 'visible'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      看得见
                    </button>
                    <button
                      onClick={() => handlePlaceBox(item.id, 'heart')}
                      className={`min-h-[48px] flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        item.placed === 'heart'
                          ? 'bg-rose-600 text-white border-rose-700'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      心里的
                    </button>
                    <button
                      onClick={() => handlePlaceBox(item.id, 'guess')}
                      className={`min-h-[48px] flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        item.placed === 'guess'
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      猜的
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: 责任圈拼图 ================= */}
        {activeTab === 'circles' && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl border border-sky-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-stone-800">责任圈拼图</h4>
                <p className="text-xs text-stone-500">分清大人的事、我的事与一起商量的事</p>
              </div>
              <button
                onClick={() => handleSpeak("责任圈：大人的事归大人管，我的事归我管，一起商量的事大家坐下来谈。")}
                className="p-2 text-sky-700 hover:bg-sky-50 rounded-xl min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer"
                aria-label="朗读责任圈拼图说明"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Circles visual */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-purple-50 border-2 border-purple-300 rounded-2xl text-left sm:text-center">
                <span className="text-xs font-bold text-purple-900 block">大人的事</span>
                <span className="text-[11px] sm:text-[10px] text-purple-700">婚姻、住址安排（不用我扛）</span>
              </div>
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left sm:text-center">
                <span className="text-xs font-bold text-amber-900 block">我的事</span>
                <span className="text-[11px] sm:text-[10px] text-amber-700">玩耍、表达感受、早睡早起</span>
              </div>
              <div className="p-3 bg-teal-50 border-2 border-teal-300 rounded-2xl text-left sm:text-center">
                <span className="text-xs font-bold text-teal-900 block">一起商量的事</span>
                <span className="text-[11px] sm:text-[10px] text-teal-700">周末计划、换家带什么</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 pt-2">
              {circleItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs"
                >
                  <span className="text-xs sm:text-sm font-medium text-stone-800 flex items-center gap-1.5">
                    {item.placed && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {item.text}
                  </span>

                  <div className="flex flex-wrap gap-1.5 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handlePlaceCircle(item.id, 'adult')}
                      className={`min-h-[48px] flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        item.placed === 'adult'
                          ? 'bg-purple-600 text-white border-purple-700'
                          : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      大人的事
                    </button>
                    <button
                      onClick={() => handlePlaceCircle(item.id, 'mine')}
                      className={`min-h-[48px] flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        item.placed === 'mine'
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      我的事
                    </button>
                    <button
                      onClick={() => handlePlaceCircle(item.id, 'together')}
                      className={`min-h-[48px] flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        item.placed === 'together'
                          ? 'bg-teal-600 text-white border-teal-700'
                          : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                      }`}
                    >
                      一起商量
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: 退后一步的四级台阶 ================= */}
        {activeTab === 'fourSteps' && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl border border-sky-100">
              <h4 className="text-sm font-bold text-stone-800">退后一步的四级台阶</h4>
              <p className="text-xs text-stone-500">一步一步往上走，把“我”和“我的情绪”分开</p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  step: 1,
                  title: '1 命名',
                  where: '情绪天气站',
                  childSays: '“我现在像一团红云，肚子里热热的”',
                  desc: '给情绪起名字，指出身体哪里有感觉。'
                },
                {
                  step: 2,
                  title: '2 看变化',
                  where: '情绪天气站、心情小盒子',
                  childSays: '“刚才很气，现在深呼吸后没那么气了”',
                  desc: '比较“刚才”和“现在”，发现情绪会流动。'
                },
                {
                  step: 3,
                  title: '3 听见想法',
                  where: '想法侦探社',
                  childSays: '“我脑子里在说：他是故意的”',
                  desc: '听见脑子里的小喇叭在说什么。'
                },
                {
                  step: 4,
                  title: '4 想法不一定是真的',
                  where: '想法侦探社、三个镜头',
                  childSays: '“我猜他是故意的，但我并不确定”',
                  desc: '把“看到的”和“猜的”分开。'
                }
              ].map((s) => (
                <div
                  key={s.step}
                  onClick={() => {
                    sounds.playClick();
                    setCurrentStep(s.step);
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    currentStep === s.step
                      ? 'bg-sky-100/70 border-sky-500 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800">{s.title} · 在【{s.where}】练</span>
                    {currentStep === s.step && <span className="text-xs font-bold text-sky-600">当前正在看 👈</span>}
                  </div>
                  <div className="text-xs font-bold text-stone-800 mt-1">
                    孩子的话：{s.childSays}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </>
        )}

        {/* Difficulty Breaker Modal */}
        <DifficultyBreakerModal
          isOpen={isBreakerOpen}
          onClose={() => setIsBreakerOpen(false)}
        />

        {/* Transfer Scenarios Modal */}
        <TransferScenariosModal
          isOpen={isTransferLabOpen}
          onClose={() => setIsTransferLabOpen(false)}
        />
      </div>
    </div>
  );
};
