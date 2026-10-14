import React, { useState } from 'react';
import {
  Brain,
  Heart,
  Calendar,
  RefreshCw,
  Award,
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  FileText,
  Share2,
  ClipboardList
} from 'lucide-react';
import { WeeklyReportData, WeatherType } from '../../types';
import { INSUFFICIENT_OBSERVATION_TEXT } from '../../services/weeklyReportService';
import { sounds } from '../../utils/sound';

interface WeeklyReportViewProps {
  report: WeeklyReportData;
  isLoading: boolean;
  onRefresh: () => void;
  isAiPowered?: boolean;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  report,
  isLoading,
  onRefresh,
}) => {
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [reminderSaved, setReminderSaved] = useState(false);

  const getWeatherIcon = (type: WeatherType) => {
    switch (type) {
      case 'sunny':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'cloudy':
        return <Cloud className="w-5 h-5 text-sky-500" />;
      case 'rainy':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'stormy':
        return <CloudLightning className="w-5 h-5 text-purple-500" />;
      case 'foggy':
        return <Cloud className="w-5 h-5 text-stone-400" />;
      case 'opt_out':
      default:
        return <Cloud className="w-5 h-5 text-stone-400" />;
    }
  };

  const weatherLabelMap: Record<WeatherType, string> = {
    sunny: '晴天',
    cloudy: '多云',
    rainy: '雨天',
    stormy: '雷雨',
    foggy: '薄雾',
    opt_out: '未选择/保留'
  };

  const hasWeatherRecords = report.totalWeatherLogs > 0;
  const hasPracticeRecords = report.thinkingToolPractices > 0;

  const handleShareReport = () => {
    sounds.playClick();
    const summaryText = `【晴雨小岛 · 本机客观活动记录摘要】
周期：${report.dateRange}
天气记录：${hasWeatherRecords ? `共 ${report.totalWeatherLogs} 次（最多为${weatherLabelMap[report.primaryDominantEmotion]}）` : INSUFFICIENT_OBSERVATION_TEXT}
客观活动计数：${hasPracticeRecords ? `${report.thinkingToolPractices} 项记录` : INSUFFICIENT_OBSERVATION_TEXT}
说明：${report.executiveSummary}
本周建议动作：${report.suggestedFocusForNextWeek}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Control Bar */}
      <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-sky-700 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                本机客观活动记录与养育参考
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/90 text-stone-900 flex items-center gap-1">
                <ClipboardList className="w-3 h-3" />
                仅统计可追溯客观记录 · 非心理能力评估
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              只记录发生过的具体活动，不给孩子打心理分或贴能力标签
            </h2>
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                统计周期：{report.dateRange}
              </span>
              <span>·</span>
              <span>更新时间：{report.generatedAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleShareReport}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
              title="复制客观记录摘要至剪贴板"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedNotice ? '已复制记录摘要！' : '复制摘要'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onRefresh();
              }}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? '正在刷新记录...' : '刷新客观记录'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Objective Data Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: 天气记录计数 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold mb-2">
            <span>本机天气点选记录</span>
            {getWeatherIcon(report.primaryDominantEmotion)}
          </div>
          <div>
            {hasWeatherRecords ? (
              <>
                <div className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-1.5">
                  <span>{weatherLabelMap[report.primaryDominantEmotion]}</span>
                  <span className="text-xs font-bold text-stone-500">
                    ({report.weatherDistribution[report.primaryDominantEmotion] || 0}次)
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  本周期共记录 {report.totalWeatherLogs} 次天气选择
                </p>
              </>
            ) : (
              <>
                <div className="text-base sm:text-lg font-black text-stone-600">
                  {INSUFFICIENT_OBSERVATION_TEXT}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  共记录 0 次，空数据不生成默认天气次数
                </p>
              </>
            )}
          </div>
        </div>

        {/* Metric 2: 客观活动与观察计数 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold mb-2">
            <span>客观活动与观察记录</span>
            <Brain className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            {hasPracticeRecords ? (
              <>
                <div className="text-xl sm:text-2xl font-black text-indigo-700">
                  {report.thinkingToolPractices} <span className="text-xs font-bold text-stone-600">项可追溯记录</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  分({report.fenCount}) · 通({report.tongCount}) · 择({report.zeCount})（不做比例估算）
                </p>
              </>
            ) : (
              <>
                <div className="text-base sm:text-lg font-black text-stone-600">
                  {INSUFFICIENT_OBSERVATION_TEXT}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  分(0) · 通(0) · 择(0)（不设最少练习次数）
                </p>
              </>
            )}
          </div>
        </div>

        {/* Metric 3: 评估边界说明（替代原“自主平复良好”） */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold mb-2">
            <span>能力与情绪评估边界</span>
            <ClipboardList className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-stone-800 flex items-baseline gap-1">
              <span>{hasWeatherRecords || hasPracticeRecords ? '仅保留客观记录' : INSUFFICIENT_OBSERVATION_TEXT}</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              不设心理评分，不推断平复力或已掌握能力
            </p>
          </div>
        </div>

        {/* Metric 4: 本机活动标记与本地求助点击 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold mb-2">
            <span>本机标记与求助点击</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-800 flex items-center gap-2">
              <span>{report.unlockedMedalsCount} 项活动标记</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              本机求助点击 {report.hugCount} 次（操作计数，非依恋能力评估）
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: 客观记录说明 */}
      <div className="bg-stone-50/80 p-5 sm:p-6 rounded-3xl border border-stone-200/90 space-y-3">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <span>本周期客观活动记录说明</span>
        </h3>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
          {report.executiveSummary}
        </p>
      </div>

      {/* Section 2: 天气记录与思考活动详情 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Left: 天气点选记录 */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>天气选择与身体感觉记录</span>
            </h4>
            <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full">
              客观计数
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-stone-600">
              <span className="font-bold">本周期天气点选分布</span>
              <span>记录 {report.totalWeatherLogs} 次</span>
            </div>
            {hasWeatherRecords ? (
              <div className="flex h-3 rounded-full overflow-hidden bg-stone-100">
                <div
                  style={{ width: `${(report.weatherDistribution.sunny / report.totalWeatherLogs) * 100}%` }}
                  className="bg-amber-400"
                  title={`晴天: ${report.weatherDistribution.sunny}次`}
                />
                <div
                  style={{ width: `${(report.weatherDistribution.cloudy / report.totalWeatherLogs) * 100}%` }}
                  className="bg-sky-400"
                  title={`多云: ${report.weatherDistribution.cloudy}次`}
                />
                <div
                  style={{ width: `${(report.weatherDistribution.rainy / report.totalWeatherLogs) * 100}%` }}
                  className="bg-blue-400"
                  title={`雨天: ${report.weatherDistribution.rainy}次`}
                />
                <div
                  style={{ width: `${(report.weatherDistribution.stormy / report.totalWeatherLogs) * 100}%` }}
                  className="bg-purple-500"
                  title={`雷雨: ${report.weatherDistribution.stormy}次`}
                />
                <div
                  style={{ width: `${(report.weatherDistribution.foggy / report.totalWeatherLogs) * 100}%` }}
                  className="bg-stone-300"
                  title={`雾天: ${report.weatherDistribution.foggy}次`}
                />
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-500 text-center">
                {INSUFFICIENT_OBSERVATION_TEXT}
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-[11px] text-stone-500 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                晴天 {report.weatherDistribution.sunny}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                多云 {report.weatherDistribution.cloudy}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                雨天 {report.weatherDistribution.rainy}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                雷雨 {report.weatherDistribution.stormy}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-stone-700">
            <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
              <span className="font-bold text-rose-900 block mb-0.5">天气点选记录：</span>
              <p className="leading-relaxed">{report.emotionalTrajectoryAnalysis.pattern}</p>
            </div>
            <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
              <span className="font-bold text-sky-900 block mb-0.5">身体感觉词汇记录：</span>
              <p className="leading-relaxed">{report.emotionalTrajectoryAnalysis.bodyAwarenessNote}</p>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <span className="font-bold text-emerald-900 block mb-0.5">记录解释说明：</span>
              <p className="leading-relaxed">{report.emotionalTrajectoryAnalysis.soothingCapacity}</p>
            </div>
          </div>
        </div>

        {/* Right: 思考活动与家长观察记录 */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>“分·通·择” 明确记录与陪伴说明</span>
            </h4>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              不估算次数
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-center">
              <span className="text-[11px] font-bold text-indigo-700 block">1. 分一分</span>
              <span className="text-xl font-black text-indigo-900 mt-0.5 block">{report.fenCount}次</span>
              <span className="text-[10px] text-stone-500">明确记录</span>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 text-center">
              <span className="text-[11px] font-bold text-amber-700 block">2. 通一通</span>
              <span className="text-xl font-black text-amber-900 mt-0.5 block">{report.tongCount}次</span>
              <span className="text-[10px] text-stone-500">明确记录</span>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center">
              <span className="text-[11px] font-bold text-emerald-700 block">3. 择一择</span>
              <span className="text-xl font-black text-emerald-900 mt-0.5 block">{report.zeCount}次</span>
              <span className="text-[10px] text-stone-500">明确记录</span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-stone-700">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="font-bold text-stone-900 block mb-0.5">可追溯活动来源：</span>
              <p className="leading-relaxed">{report.thinkingPracticeReview.highlight}</p>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
              <span className="font-bold text-amber-900 block mb-0.5">脚手架与证据原则：</span>
              <p className="leading-relaxed">{report.thinkingPracticeReview.stageDescription}</p>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <span className="font-bold text-emerald-900 block mb-0.5">日常陪伴建议：</span>
              <p className="leading-relaxed">{report.thinkingPracticeReview.scaffoldingAdvice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: 养育参考建议 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>日常陪伴话术参考（通用家庭沟通工具）</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              以下为给照顾者的日常沟通参考，不是针对孩子的心理诊断或治疗处方
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {report.personalizedParentingTips.map((tip) => (
            <div
              key={tip.id}
              className="bg-white p-5 rounded-3xl border border-stone-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    tip.category === '共情接纳'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : tip.category === '责任圈去中间人'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : tip.category === '特别时光'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {tip.category}
                  </span>
                  <span className="text-[11px] text-stone-400">家长沟通参考</span>
                </div>

                <h4 className="text-sm font-black text-stone-900 leading-snug">
                  {tip.title}
                </h4>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {tip.advice}
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl">
                  <span className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>大人可用的一句话/动作：</span>
                  </span>
                  <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                    {tip.scriptAction}
                  </p>
                </div>

                <div className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <strong className="text-stone-700">设计说明：</strong>
                  {tip.why}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: 下周微小聚焦目标 */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🎯
          </div>
          <div>
            <h4 className="text-sm font-black text-stone-900">
              本周只做一件能兑现的小事
            </h4>
            <p className="text-xs text-amber-950 mt-0.5 leading-relaxed font-medium">
              {report.suggestedFocusForNextWeek}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playBell();
            setReminderSaved(true);
          }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          {reminderSaved ? '已在当前页面标记' : '标记本页提醒'}
        </button>
      </div>
    </div>
  );
};
