import React from 'react';
import { Activity, TrendingUp, Sparkles, Compass, Lightbulb, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GrowthObservationLog: React.FC = () => {
  const { parentObservations, completedLeaves, todayWeather, weatherHistory, hugEvents } = useApp();

  // 1. 动态计算分、通、择及总叶子练习频率（合并故事叶探索与家长日常观察记录，无任何mock偏置）
  const obsFrustration = parentObservations.find(o => o.id === 'obs-frustration')?.selfInitiatedCount || 0;
  const obsOthersAction = parentObservations.find(o => o.id === 'obs-others-action')?.selfInitiatedCount || 0;
  const obsAfterChoice = parentObservations.find(o => o.id === 'obs-after-choice')?.selfInitiatedCount || 0;
  const obsPersonLabel = parentObservations.find(o => o.id === 'obs-person-label')?.selfInitiatedCount || 0;
  const obsOwnEmotion = parentObservations.find(o => o.id === 'obs-own-emotion')?.selfInitiatedCount || 0;

  const fenCount = completedLeaves.length + obsFrustration + obsPersonLabel + obsOwnEmotion;
  const tongCount = completedLeaves.length + obsOthersAction;
  const zeCount = completedLeaves.length + obsAfterChoice;

  const toolUsageStats = [
    {
      id: 'fen',
      name: '分 (区分事实与推论)',
      tag: '退后一步 · 看清事实',
      count: fenCount,
      desc: '分清“看见的”和“脑袋想的”，减少误解（由故事林探索与日常“挫折观察”、“人物标签”、“情绪命名”共同积累）',
      coachingTip: '孩子在遇到委屈时，多问“我们亲眼看到/听到了什么？”，帮助从推论退回事实。'
    },
    {
      id: 'tong',
      name: '通 (看见多方观点)',
      tag: '站在对面 · 换位理解',
      count: tongCount,
      desc: '理解对方可能有不同想法与感受（由故事林探索与日常“对方意图观察”共同积累）',
      coachingTip: '讨论争议时，尝试引导“如果是对方，Ta 可能会怎么看？”。'
    },
    {
      id: 'ze',
      name: '择 (权衡不同选择)',
      tag: '看清后果 · 做出选择',
      count: zeCount,
      desc: '思考不同做法带来的具体结果（由故事林探索与日常“选择代价承担”共同积累）',
      coachingTip: '在面临纠结或冲突时，列出两三种做法，陪孩子聊聊每种选择之后会发生什么。'
    }
  ];

  const totalToolPractices = toolUsageStats.reduce((sum, item) => sum + item.count, 0);

  // 2. 日常自发应用观察趋势
  const selfInitiatedTotal = parentObservations.reduce((sum, obs) => sum + obs.selfInitiatedCount, 0);

  return (
    <div className="space-y-5">
      {/* 顶部提示与说明 */}
      <div className="bg-linear-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 border border-teal-200 p-5 rounded-3xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900">成长观察日志</h3>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                追踪思考工具使用频率与日常自发应用趋势，提供针对性教练建议
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-100/80 px-3 py-1 rounded-full border border-teal-200">
            遵循非评分与数据最小化契约
          </span>
        </div>
      </div>

      {/* 统计指标卡 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4.5 rounded-3xl border border-stone-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">
            🌱
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 block">累计思考探索</span>
            <span className="text-xl font-black text-stone-900">{totalToolPractices} 次</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-3xl border border-stone-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
            ✨
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 block">日常自发应用（无提醒）</span>
            <span className="text-xl font-black text-emerald-700">{selfInitiatedTotal} 次</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-3xl border border-stone-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl shrink-0">
            🫂
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 block">求助与想念表达</span>
            <span className="text-xl font-black text-rose-700">{hugEvents.length} 次</span>
          </div>
        </div>
      </div>

      {/* 工具使用频率列表 */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600" />
            <span>核心姿态（分、通、择）使用频率</span>
          </h4>
          <span className="text-xs text-stone-500 font-medium">看尝试频率，不评判熟练度</span>
        </div>

        <div className="space-y-4">
          {toolUsageStats.map((tool) => {
            const percentage = Math.min(100, Math.round((tool.count / Math.max(1, totalToolPractices)) * 100));
            return (
              <div key={tool.id} className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200 mr-2">
                      {tool.tag}
                    </span>
                    <span className="text-sm font-black text-stone-900">{tool.name}</span>
                  </div>
                  <span className="text-sm font-black text-teal-800 bg-white px-3 py-1 rounded-xl border border-stone-200 shadow-2xs">
                    {tool.count} 次 ({percentage}%)
                  </span>
                </div>

                {/* 简易可视化进度条 */}
                <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, percentage)}%` }}
                  />
                </div>

                <p className="text-xs text-stone-600 font-medium leading-relaxed">
                  {tool.desc}
                </p>

                {/* 家长针对性教练建议 */}
                <div className="pt-2 border-t border-stone-200/60 flex items-start gap-2 text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200/60">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block mb-0.5">教练提示：</span>
                    <span>{tool.coachingTip}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 习惯与趋势摘要卡 */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>日常行为观察与内化趋势</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {parentObservations.map((obs) => (
            <div key={obs.id} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-900 block">观察维度：{obs.dimension}</span>
              <p className="text-stone-700 font-medium">目标行为：{obs.targetBehavior}</p>
              <div className="flex items-center justify-between text-emerald-800 pt-1 border-t border-emerald-200/60 font-bold">
                <span>孩子自发做到了：</span>
                <span>{obs.selfInitiatedCount} 次</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
