import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Brain,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Scale,
  Compass,
  Boxes,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '../../utils/sound';
import { CognitiveDimension3DArtifact } from './CognitiveDimension3DArtifact';

export type CognitiveDimensionKey = 'fen' | 'tong' | 'ze';

export interface CognitiveDimensionData {
  key: CognitiveDimensionKey;
  name: string;
  badge: string;
  themeColor: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    lightBg: string;
    activeBorder: string;
  };
  icon: string;
  oneLinerFormula: string;
  developmentalCore: {
    title: string;
    stage: string;
    scientificBasis: string;
  };
  commonBehaviors: Array<{
    scenario: string;
    childMind: string;
    adultMistake: string;
  }>;
  scaffoldingShift: {
    instinctReaction: string;
    scientificGuidance: string;
    whyItWorks: string;
  };
  safetyFenceBoundary: string;
}

export const COGNITIVE_DEVELOPMENT_DATA: Record<CognitiveDimensionKey, CognitiveDimensionData> = {
  fen: {
    key: 'fen',
    name: '【分】区分与客观化',
    badge: '自我中心归因破除 · 责任界限',
    themeColor: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-900',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      lightBg: 'bg-sky-50/50',
      activeBorder: 'border-sky-500'
    },
    icon: '🧭',
    oneLinerFormula: '“眼睛看见的是事实，脑子里冒出的是猜测；大人的事情大人担，孩子的任务是长大。”',
    developmentalCore: {
      title: '从前运算期自我中心，迈向具体运算期的事实分离',
      stage: '皮亚杰前运算期向具体运算期过渡（5~7岁，以6岁为核心转折点）',
      scientificBasis: '6岁儿童大脑额叶执行网络仍在早期发育阶段，极易将“自己的内在念头”与“外部客观现实”产生魔幻式混淆（Magical Thinking）。当家庭发生变动或出现意外时，孩子本能地运用自我中心思维解释外界，误认为“是因为我不乖、我不听话，爸爸妈妈才不高兴甚至分开”。'
    },
    commonBehaviors: [
      {
        scenario: '意外打翻牛奶或弄坏玩具',
        childMind: '“脑子里一个声音在大叫：全完了，都是我太笨了，大人一定会讨厌我！”',
        adultMistake: '急于批评或反向说教：“你怎么这么笨/又毛手毛脚？”，进一步加剧自我归因恐惧。'
      },
      {
        scenario: '父母发生争执或家庭结构变动',
        childMind: '“是不是因为我昨晚没好好吃蔬菜，爸爸才离开这个房子的？”',
        adultMistake: '对孩子含糊其辞或抱怨另一方，导致孩子长期背负沉重的道德内疚与自责。'
      }
    ],
    scaffoldingShift: {
      instinctReaction: '“这跟你没关系，别胡思乱想了！”（孩子大脑无法处理抽象否定）',
      scientificGuidance: '具象拆分：第一步“看事实”（地上的水洒了/大人不住在一起是大人决定），第二步“分界线”（这不是你的错，百分之百不是因为你）。',
      whyItWorks: '6岁孩子需要具体可见的外部线索（如把手掌放在胸口、用眼睛数看得见的物体），帮助神经系统从警觉恐慌中退后一步，切断虚假的内疚回路。'
    },
    safetyFenceBoundary: '【不可突破底线】大人的婚姻与伴侣矛盾是大人的独立责任，严禁让孩子充当传话筒或裁判。'
  },
  tong: {
    key: 'tong',
    name: '【通】心智通达与视角转换',
    badge: '心智理论（Theory of Mind）萌芽 · 换位思考',
    themeColor: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      lightBg: 'bg-emerald-50/50',
      activeBorder: 'border-emerald-500'
    },
    icon: '🪙',
    oneLinerFormula: '“一枚硬币有两面，一件事有两个角度；不急着下好坏总判决，先看对方当时在想什么。”',
    developmentalCore: {
      title: '二级心智理论（Second-Order Beliefs）与情绪二元论',
      stage: '心智理论建立与社会透视萌芽期（6~8岁）',
      scientificBasis: '6岁孩子刚刚开始理解“别人心里知道的信息可能和我不同”，但在情绪激动、疲惫或面临利益冲突时，工作记忆会瞬间被自我视角占满。他们的大脑难以同时维持两套相反的观点，因此极易滑向非黑即白的二元分类（要么全是对的，要么全是坏的）。'
    },
    commonBehaviors: [
      {
        scenario: '同伴无意撞倒自己的积木',
        childMind: '“他存心针对我！他是大坏蛋！”（归因偏差，直接推断敌意意图）',
        adultMistake: '强迫孩子“赶紧跟人家说没关系/要懂事大度”，强行压抑真实愤怒。'
      },
      {
        scenario: '在两个家里生活规矩不同',
        childMind: '“在妈妈家可以看电视，在爸爸家不可以，肯定有一边是在故意整我！”',
        adultMistake: '贬低另一方家庭的规则，让孩子在忠诚冲突中撕裂。'
      }
    ],
    scaffoldingShift: {
      instinctReaction: '“人家是不小心的，你怎么这么小气不懂事？”（剥夺孩子自我验证的机会）',
      scientificGuidance: '具象双面币：先接纳孩子的委屈，再拿出一枚硬币或做翻转手势：“一面是你辛辛苦苦搭的积木倒了，好难过；翻过来另一面，他刚才跑太快脚滑了，他当时在想什么？”',
      whyItWorks: '具象物理道具为 6 岁工作记忆提供外部支架，让孩子在不被指责的前提下，安全地演练多重视角。'
    },
    safetyFenceBoundary: '【不可突破底线】理解对方的原因不等于放弃安全底线。身体隐私、暴力侵犯属于明确围栏，不可用双面币模糊对错。'
  },
  ze: {
    key: 'ze',
    name: '【择】自主选择权与安全围栏',
    badge: '前额叶抑制控制 · 有限自主权',
    themeColor: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      lightBg: 'bg-amber-50/50',
      activeBorder: 'border-amber-500'
    },
    icon: '⚖️',
    oneLinerFormula: '“安全底线不妥协，围栏以内给选择；把掌控感还给孩子，把安全感留在大人手里。”',
    developmentalCore: {
      title: '自我效能感爆发与前额叶抑制控制雏形',
      stage: '小学过渡期自主意识与规则内化（6岁左右）',
      scientificBasis: '6岁孩子强烈的“我长大了、我自己来”代表自我效能感的健康成长。但此时前额叶抑制控制网络（Inhibitory Control）极度脆弱，无法承受无边界的自由选择（易诱发决策焦虑失控）；同时也无法忍受全盘命令压制（易诱发强烈对峙）。'
    },
    commonBehaviors: [
      {
        scenario: '到时间该洗澡刷牙却赖着不走',
        childMind: '“如果大人叫我怎样我就怎样，那我一点权力都没有了！”（通过对抗确认自我存在）',
        adultMistake: '硬碰硬强制拖拽，或妥协让步任由拖延，让界限崩塌。'
      },
      {
        scenario: '两个愿望无法同时满足时大哭大闹',
        childMind: '“我想踢球又想拼乐高，为什么不能都要？我好着急难受！”',
        adultMistake: '冷嘲热讽：“贪得无厌，今天两个都不许玩了！”'
      }
    ],
    scaffoldingShift: {
      instinctReaction: '“数到三你再不过来我就揍你！”或者“好好好你想干嘛就干嘛。”',
      scientificGuidance: '围栏内二选一：底线不可变（必须刷牙），形式给选择（“你想先刷上牙还是下牙？用蓝色牙刷还是黄色牙刷？”）。',
      whyItWorks: '有限选择权给足了 6 岁孩子的尊严与主控感，而清晰温和的围栏则保障了心理安全感。'
    },
    safetyFenceBoundary: '【不可突破底线】涉及人身安全、身体界限和法律原则时，属于绝对安全围栏，温和坚定执行，不讨价还价。'
  }
};

interface Props {
  initialExpanded?: boolean;
}

export const CognitiveDevelopmentEncyclopedia: React.FC<Props> = ({
  initialExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);
  const [activeTab, setActiveTab] = useState<CognitiveDimensionKey>('fen');

  const currentData = COGNITIVE_DEVELOPMENT_DATA[activeTab];

  const handleToggle = () => {
    sounds.playClick();
    setIsExpanded(prev => !prev);
  };

  const handleSelectTab = (key: CognitiveDimensionKey) => {
    sounds.playClick();
    setActiveTab(key);
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-3xl shadow-2xs overflow-hidden transition-all">
      {/* 折叠栏头部 */}
      <div
        onClick={handleToggle}
        className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/80 transition-colors select-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        aria-expanded={isExpanded}
        aria-label="认知发展小百科：6岁儿童分通择心理学逻辑"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
            🧠
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-stone-900">
                认知发展小百科：6 岁儿童“分·通·择”心理学逻辑
              </h3>
              <span className="text-[11px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full border border-indigo-200">
                儿童发展科学 · 读懂行为背后
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5 line-clamp-1 sm:line-clamp-none">
              基于皮亚杰认知过渡期、心智理论（Theory of Mind）与前额叶执行功能，解开孩子对抗、自责与非黑即白背后的发展瓶颈。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-stone-500 hidden sm:inline">
            {isExpanded ? '收起百科' : '展开阅读'}
          </span>
          <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* 折叠展开内容主体 */}
      {isExpanded && (
        <div className="border-t border-stone-200/80 bg-stone-50/50 p-4 sm:p-6 space-y-5 animate-in slide-in-from-top-2 duration-200">

          {/* 顶栏认知导读卡 */}
          <div className="bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="text-xs text-stone-700 leading-relaxed">
                <strong className="text-indigo-950 font-black block sm:inline mr-2">
                  核心科学原则：大人是孩子未成熟大脑的“外部前额叶”。
                </strong>
                6 岁的孩子不是“存心找麻烦”，而是其神经系统正处于从自我中心向理性逻辑蜕变的敏感跃迁期。
              </div>
            </div>
          </div>

          {/* 三大维度选项卡切换 */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-stone-200/60 rounded-2xl">
            {(['fen', 'tong', 'ze'] as CognitiveDimensionKey[]).map((k) => {
              const data = COGNITIVE_DEVELOPMENT_DATA[k];
              const isSelected = activeTab === k;
              return (
                <button
                  key={k}
                  onClick={() => handleSelectTab(k)}
                  className={`py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80 scale-[1.01]'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                  }`}
                  aria-selected={isSelected}
                  role="tab"
                >
                  <span className="text-base">{data.icon}</span>
                  <span className="truncate">{data.name}</span>
                </button>
              );
            })}
          </div>

          {/* 当前选中的维度深度解析面板 */}
          <div className={`border ${currentData.themeColor.border} bg-white rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5`}>

            {/* 维度头部与金句 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-2xl bg-stone-100/80 border border-stone-200 shadow-2xs">
                  {currentData.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-black text-stone-900">
                      {currentData.name}
                    </h4>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${currentData.themeColor.badgeBg} ${currentData.themeColor.badgeText}`}>
                      {currentData.badge}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 font-medium">
                    {currentData.developmentalCore.stage}
                  </p>
                </div>
              </div>

              {/* 口诀标语 */}
              <div className={`p-3 rounded-2xl ${currentData.themeColor.lightBg} border ${currentData.themeColor.border} text-xs font-bold ${currentData.themeColor.text} sm:max-w-md`}>
                <span className="font-extrabold mr-1">💡 通俗记忆口诀：</span>
                {currentData.oneLinerFormula}
              </div>
            </div>

            {/* 深度内容板块 1：科学发展基础 */}
            <div className="space-y-1.5 bg-stone-50/80 p-4 rounded-2xl border border-stone-200/80">
              <div className="flex items-center gap-2 text-xs font-black text-stone-900">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>为什么 6 岁孩子会这样？（发展神经科学与认知瓶颈）</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {currentData.developmentalCore.scientificBasis}
              </p>
            </div>

            {/* 深度内容板块 2：日常生活中的真实孩子心理 vs 大人本能误区 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-stone-900">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>常见日常情境对比：孩子心里在想什么 vs 传统本能误区</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {currentData.commonBehaviors.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/40 space-y-2 text-xs"
                  >
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px] font-black">
                        {idx + 1}
                      </span>
                      <span>情境：{item.scenario}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-stone-200 space-y-1">
                      <div className="text-[11px] font-bold text-sky-800 flex items-center gap-1">
                        <span>💭 6岁孩子的大脑信号：</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed italic">
                        {item.childMind}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-900 space-y-0.5">
                      <div className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>常见误区（容易使孩子倒退）：</span>
                      </div>
                      <p className="text-[11px] text-rose-800/90 leading-relaxed">
                        {item.adultMistake}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 深度内容板块 3：大人的脚手架引导转化 */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-amber-50/60 to-orange-50/60 border border-amber-200 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-black text-amber-950">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>大人的引导脚手架：从“本能说教”转向“认知支架”</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/80 border border-amber-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-stone-500 block">传统本能反应（低效）：</span>
                  <p className="text-stone-800 leading-relaxed">
                    {currentData.scaffoldingShift.instinctReaction}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/95 border border-amber-300 shadow-2xs space-y-1">
                  <span className="text-[11px] font-black text-amber-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    科学脚手架引导（推荐）：
                  </span>
                  <p className="text-stone-900 font-medium leading-relaxed">
                    {currentData.scaffoldingShift.scientificGuidance}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-amber-900/80 bg-amber-100/60 p-2.5 rounded-xl leading-relaxed">
                <strong className="font-bold">为什么有效？</strong> {currentData.scaffoldingShift.whyItWorks}
              </div>
            </div>

            {/* 3D 物理认知教具交互模块 */}
            <CognitiveDimension3DArtifact dimension={activeTab} />

            {/* 深度内容板块 4：安全围栏不可妥协警示 */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-stone-100/80 border border-stone-200 text-xs text-stone-700">
              <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="text-stone-900 font-bold block">
                  心理学安全与围栏契约边界：
                </strong>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {currentData.safetyFenceBoundary}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
