import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Brain,
  Heart,
  Calendar,
  RefreshCw,
  Award,
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Eye,
  FileText,
  Share2
} from 'lucide-react';
import { WeeklyReportData, WeatherType } from '../../types';
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
  isAiPowered = false
}) => {
  const [copiedNotice, setCopiedNotice] = useState(false);

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
    opt_out: '自主节奏'
  };

  const handleShareReport = () => {
    sounds.playClick();
    const summaryText = `【晴雨小岛 · 儿童思考成长周度反馈】
周期：${report.dateRange}
主导情绪：${weatherLabelMap[report.primaryDominantEmotion]}
思考练习频次：${report.thinkingToolPractices} 次自主实践
平复力：自主平复良好（不设心理评分）
核心寄语：${report.executiveSummary}
下周建议聚焦：${report.suggestedFocusForNextWeek}`;

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
        {/* Subtle decorative background circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                周度循证成长分析与个性化养育指导
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/90 text-stone-900 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {isAiPowered ? 'AI 深度赋能' : '儿童科学循证分析引擎'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              情绪起伏是成长的天气，思考习惯是前行的罗盘
            </h2>
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                分析周期：{report.dateRange}
              </span>
              <span>·</span>
              <span>更新时间：{report.generatedAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleShareReport}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
              title="复制周报简要至剪贴板"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedNotice ? '已复制周报摘要！' : '分享周报'}</span>
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
              <span>{isLoading ? '正在深入分析...' : '重新生成分析'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Data Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: 主导情绪 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold mb-2">
            <span>主导心理天气</span>
            {getWeatherIcon(report.primaryDominantEmotion)}
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-1.5">
              <span>{weatherLabelMap[report.primaryDominantEmotion]}</span>
              <span className="text-xs font-bold text-stone-500">
                ({report.weatherDistribution[report.primaryDominantEmotion] || 0}次)
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              本周共记录 {report.totalWeatherLogs} 次心晴，接纳所有真实感受
            </p>
          </div>
        </div>

        {/* Metric 2: 思考练习频率 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold mb-2">
            <span>思考练习频率</span>
            <Brain className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-indigo-700">
              {report.thinkingToolPractices} <span className="text-xs font-bold text-stone-600">次自主实践</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              分({report.fenCount}) · 通({report.tongCount}) · 择({report.zeCount})
            </p>
          </div>
        </div>

        {/* Metric 3: 情绪平复力与稳定性 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold mb-2">
            <span>平复力与情绪韧性</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 flex items-baseline gap-1">
              <span>自主平复良好</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              不设心理评分：记录挫折后能自主回归平静的自然节律
            </p>
          </div>
        </div>

        {/* Metric 4: 探索与互动记录 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold mb-2">
            <span>探索与互动记录</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-800 flex items-center gap-2">
              <span>{report.unlockedMedalsCount} 枚勋章</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              ❤️ 发起求助互动 {report.hugCount} 次 · 真实行为记录
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: 核心总评 (Executive Summary) */}
      <div className="bg-stone-50/80 p-5 sm:p-6 rounded-3xl border border-stone-200/90 space-y-3">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <span>周度发展总评：给家长的定心丸</span>
        </h3>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
          {report.executiveSummary}
        </p>
      </div>

      {/* Section 2: 情绪轨迹与思考练习深度分析 (Dual column) */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Left: 情绪起伏轨迹与生理平复 */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>情绪起伏轨迹与身体觉知</span>
            </h4>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
              情绪健康
            </span>
          </div>

          {/* Weather distribution bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-stone-600">
              <span className="font-bold">本周情绪天气分布</span>
              <span>记录 {report.totalWeatherLogs} 次</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-stone-100">
              <div
                style={{ width: `${(report.weatherDistribution.sunny / (report.totalWeatherLogs || 1)) * 100}%` }}
                className="bg-amber-400"
                title={`晴天: ${report.weatherDistribution.sunny}次`}
              />
              <div
                style={{ width: `${(report.weatherDistribution.cloudy / (report.totalWeatherLogs || 1)) * 100}%` }}
                className="bg-sky-400"
                title={`多云: ${report.weatherDistribution.cloudy}次`}
              />
              <div
                style={{ width: `${(report.weatherDistribution.rainy / (report.totalWeatherLogs || 1)) * 100}%` }}
                className="bg-blue-400"
                title={`雨天: ${report.weatherDistribution.rainy}次`}
              />
              <div
                style={{ width: `${(report.weatherDistribution.stormy / (report.totalWeatherLogs || 1)) * 100}%` }}
                className="bg-purple-500"
                title={`雷雨: ${report.weatherDistribution.stormy}次`}
              />
              <div
                style={{ width: `${(report.weatherDistribution.foggy / (report.totalWeatherLogs || 1)) * 100}%` }}
                className="bg-stone-300"
                title={`雾天: ${report.weatherDistribution.foggy}次`}
              />
            </div>
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
              <span className="font-bold text-rose-900 block mb-0.5">波动与回弹规律：</span>
              <p className="leading-relaxed">{report.emotionalTrajectoryAnalysis.pattern}</p>
            </div>
            <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
              <span className="font-bold text-sky-900 block mb-0.5">身体生理觉知：</span>
              <p className="leading-relaxed">{report.emotionalTrajectoryAnalysis.bodyAwarenessNote}</p>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <span className="font-bold text-emerald-900 block mb-0.5">自主平复能力评估：</span>
              <p className="leading-relaxed">{report.emotionalTrajectoryAnalysis.soothingCapacity}</p>
            </div>
          </div>
        </div>

        {/* Right: 思考方法练习频率与脚手架淡出评估 */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>“分·通·择” 思考实践与脚手架进度</span>
            </h4>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              思维进阶
            </span>
          </div>

          {/* Three Posture distribution */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-center">
              <span className="text-[11px] font-bold text-indigo-700 block">1. 分一分</span>
              <span className="text-xl font-black text-indigo-900 mt-0.5 block">{report.fenCount}次</span>
              <span className="text-[10px] text-stone-500">事实 vs 猜测</span>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 text-center">
              <span className="text-[11px] font-bold text-amber-700 block">2. 通一通</span>
              <span className="text-xl font-black text-amber-900 mt-0.5 block">{report.tongCount}次</span>
              <span className="text-[10px] text-stone-500">换个眼睛看</span>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center">
              <span className="text-[11px] font-bold text-emerald-700 block">3. 择一择</span>
              <span className="text-xl font-black text-emerald-900 mt-0.5 block">{report.zeCount}次</span>
              <span className="text-[10px] text-stone-500">权衡与承担</span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-stone-700">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="font-bold text-stone-900 block mb-0.5">本周高光表现：</span>
              <p className="leading-relaxed">{report.thinkingPracticeReview.highlight}</p>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
              <span className="font-bold text-amber-900 block mb-0.5">脚手架当前阶段：</span>
              <p className="leading-relaxed">{report.thinkingPracticeReview.stageDescription}</p>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <span className="font-bold text-emerald-900 block mb-0.5">大人如何温和撤出辅助（淡出指引）：</span>
              <p className="leading-relaxed">{report.thinkingPracticeReview.scaffoldingAdvice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: 个性化教养建议 (Personalized Parenting Tips) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>针对本周数据的 4 大个性化教养实操建议</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              基于 New Beginnings 循证干预体系与 PCIT 疗法，只给父母最精准可落地的日常一句话与小动作
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
                  <span className="text-[11px] text-stone-400">循证指引</span>
                </div>

                <h4 className="text-sm font-black text-stone-900 leading-snug">
                  {tip.title}
                </h4>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {tip.advice}
                </p>
              </div>

              {/* Action Script Box */}
              <div className="space-y-2">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl">
                  <span className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>本周大人直接用的一句话/动作：</span>
                  </span>
                  <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                    {tip.scriptAction}
                  </p>
                </div>

                <div className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <strong className="text-stone-700">背后的发展心理学依据：</strong>
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
              下周只抓这一个微小目标（Less is More）
            </h4>
            <p className="text-xs text-amber-950 mt-0.5 leading-relaxed font-medium">
              {report.suggestedFocusForNextWeek}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playBell();
            alert("已为您将该聚焦目标加入日常提醒备忘！");
          }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          设为本周提醒
        </button>
      </div>
    </div>
  );
};
