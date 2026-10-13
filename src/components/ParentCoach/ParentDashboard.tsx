import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  BookOpen,
  Sparkles,
  ListChecks,
  Activity,
  ShieldAlert,
  Heart,
  Volume2,
  PhoneCall,
  CheckCircle2,
  Info,
  Calendar,
  AlertTriangle,
  Users,
  Award,
  ArrowRight,
  HardDrive,
  FileText,
  Copy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';
import { INITIAL_PARENT_SCRIPTS, INITIAL_WEEKLY_LESSONS } from '../../data/mockData';
import { GoogleDriveModal } from '../GoogleDrive/GoogleDriveModal';
import { WeeklyReportView } from './WeeklyReportView';
import { generateLocalWeeklyReport, calculateWeeklyMetrics } from '../../services/weeklyReportService';
import { WeeklyReportData } from '../../types';
import { CaregiverHugInbox } from './CaregiverHugInbox';
import { GrowthObservationLog } from './GrowthObservationLog';
import { ParentingPocketTips } from './ParentingPocketTips';
import { ParentMedalsWall } from './ParentMedalsWall';
import { VoiceSystemAuditionModal } from './VoiceSystemAuditionModal';
import { CognitiveDevelopmentEncyclopedia } from './CognitiveDevelopmentEncyclopedia';
import { INITIAL_PARENT_MEDALS, calculateParentMedals } from '../../data/parentMedalsData';
import { ParentMedal } from '../../types';

export const ParentDashboard: React.FC = () => {
  const {
    parentObservations,
    incrementSelfInitiated,
    presenceTier,
    setPresenceTier,
    activeHugNotice,
    acknowledgeHug,
    completedLeaves,
    todayWeather,
    weatherHistory,
    hugEvents,
    medals,
    hasLegacySensitiveData,
    clearLegacySensitiveStorage
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pocketTips' | 'medals' | 'huginbox' | 'observe' | 'scripts' | 'lessons' | 'consistency' | 'report' | 'insights' | 'safety'>('report');
  const [selectedScriptId, setSelectedScriptId] = useState<string>('script-reunite');
  const [completedWeeklyAction, setCompletedWeeklyAction] = useState<boolean>(false);
  const [isDriveOpen, setIsDriveOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Weekly Report State
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportData>(() =>
    generateLocalWeeklyReport({
      todayWeather,
      weatherHistory,
      parentObservations,
      completedLeaves,
      medals,
      hugCount: hugEvents.length
    })
  );
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isAiPowered] = useState<boolean>(false);

  // SEC-07: 基于端侧客观行为记录生成科学周报反馈，严禁上传儿童观察数据调用 AI 心理推断
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    sounds.playClick();

    const localReport = generateLocalWeeklyReport({
      todayWeather,
      weatherHistory,
      parentObservations,
      completedLeaves,
      medals,
      hugCount: hugEvents.length
    });

    setWeeklyReport(localReport);
    sounds.playBell();
    setIsGeneratingReport(false);
  };

  // Re-sync local report when data changes
  useEffect(() => {
    setWeeklyReport(
      generateLocalWeeklyReport({
        todayWeather,
        weatherHistory,
        parentObservations,
        completedLeaves,
        medals,
        hugCount: hugEvents.length
      })
    );
  }, [todayWeather, weatherHistory, parentObservations, completedLeaves, medals, hugEvents]);

  // Consistency checklist states
  const [consistencyItems, setConsistencyItems] = useState([
    { id: '1', title: '睡前流程一致', desc: '两个家都在睡前讲一个温和绘本或互道晚安', checked: true },
    { id: '2', title: '屏幕时间上限一致', desc: '每天屏幕娱乐不超过20分钟', checked: true },
    { id: '3', title: '核心安全底线一致', desc: '不打人、身体隐私保护、有不适必告知大人', checked: true },
    { id: '4', title: '不让孩子当传话筒', desc: '大人的日程开销直接在手机上文字沟通', checked: true },
    { id: '5', title: '换家安心物交接', desc: '心爱玩偶与书包随孩子在两个家自由流动', checked: false }
  ]);

  const toggleConsistencyItem = (id: string) => {
    sounds.playClick();
    setConsistencyItems(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  // Parenting Milestones / Medals State
  const [parentMedals, setParentMedals] = useState<ParentMedal[]>(() => {
    try {
      const saved = localStorage.getItem('parent_medals_milestones');
      const base = saved ? JSON.parse(saved) : INITIAL_PARENT_MEDALS;
      return calculateParentMedals(base, {
        parentObservations,
        consistencyItemsCheckedCount: 4,
        hugCount: hugEvents.length,
        hasUsedPocketTips: true
      });
    } catch {
      return calculateParentMedals(INITIAL_PARENT_MEDALS, {
        parentObservations,
        consistencyItemsCheckedCount: 4,
        hugCount: hugEvents.length,
        hasUsedPocketTips: true
      });
    }
  });

  const handleManualUnlockMedal = (medalId: string) => {
    setParentMedals(prev => {
      const updated = prev.map(m =>
        m.id === medalId
          ? { ...m, unlocked: true, unlockedAt: '今日践行点亮' }
          : m
      );
      try {
        localStorage.setItem('parent_medals_milestones', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  useEffect(() => {
    setParentMedals(prev => {
      const checkedCount = consistencyItems.filter(i => i.checked).length;
      return calculateParentMedals(prev, {
        parentObservations,
        consistencyItemsCheckedCount: checkedCount,
        hugCount: hugEvents.length,
        hasUsedPocketTips: true
      });
    });
  }, [parentObservations, consistencyItems, hugEvents]);

  const currentScript = INITIAL_PARENT_SCRIPTS.find(s => s.id === selectedScriptId) || INITIAL_PARENT_SCRIPTS[0];

  return (
    <div className="min-h-screen bg-stone-100/80 text-stone-800 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Hug Notice (if child clicked hug button) */}
        {activeHugNotice && (
          <div className="bg-rose-500 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold">孩子刚刚按下了“抱抱键”！</h4>
                <p className="text-xs text-rose-100">
                  没有其他负面信息，孩子今晚需要一个长长的拥抱。请在身旁给孩子一个温暖坚定的拥抱。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('huginbox');
                }}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
              >
                查看响应选项
              </button>
              <button
                onClick={() => {
                  sounds.playBell();
                  acknowledgeHug();
                }}
                className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm"
              >
                已收到提醒
              </button>
            </div>
          </div>
        )}

        {/* Header: Caregiver Coach identity */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                家长与照顾者端 · 养育教练
              </span>
              <span className="text-xs text-stone-500">
                基于 New Beginnings 循证方案与儿童发展科学
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
              真正的杠杆在大人：少把孩子夹在中间，多一点温暖与一致
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              这里不是监视后台，而是行动脚本库与行为观察卡。尊重两个家的中立与独立。
            </p>
          </div>

          {/* 顶栏控制：成人在场模式 + 自然语音调优 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* 成人在场三档选择 */}
            <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200 shrink-0">
              <span className="text-[11px] font-bold text-stone-500 block mb-1">
                成人在场模式设置：
              </span>
              <div className="flex gap-1">
                {[
                  { tier: 'A' as const, label: 'A 独立探索', desc: '天气与轻故事' },
                  { tier: 'B' as const, label: 'B 先看后放行', desc: '进阶工具' },
                  { tier: 'C' as const, label: 'C 必须共玩', desc: '谈论真实家庭' }
                ].map(t => (
                  <button
                    key={t.tier}
                    onClick={() => {
                      sounds.playClick();
                      setPresenceTier(t.tier);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      presenceTier === t.tier
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                    title={t.desc}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 自然语音调优与去AI味入口 */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsVoiceModalOpen(true);
              }}
              className="p-2.5 bg-amber-50 hover:bg-amber-100/90 text-amber-950 border border-amber-300 rounded-2xl text-xs font-bold transition-all flex sm:flex-col items-center justify-center gap-1 cursor-pointer shadow-2xs hover:shadow-xs group min-h-[44px]"
              aria-label="打开自然语音与音效调优面板"
              title="深度声源调优、去AI机械味、声线模式切换与试听"
            >
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
                <span className="text-amber-900 font-extrabold">语音声学调优</span>
              </div>
              <span className="text-[10px] text-amber-700/80 font-medium">
                去AI机械味 · 晓晓/婷婷人声
              </span>
            </button>
          </div>
        </div>

        {/* 快捷直达卡片：养育小锦囊 */}
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-200/90 text-amber-950 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                💡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-black text-stone-900">
                    养育小锦囊：分、通、择思考姿态话术模板
                  </h4>
                  <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    可复制 · 具象脚手架
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 font-medium mt-0.5">
                  基于 6 岁儿童认知发展规律，提供针对分、通、择三种思考姿态的简短、可复制的家长话术模板。
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('pocketTips');
              }}
              className="min-h-[44px] px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
              aria-label="进入养育小锦囊库"
            >
              <span>进入完整锦囊库</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3大姿态今日精选金句（可一键直接复制） */}
          <div className="grid sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 bg-white/90 rounded-2xl border border-sky-200 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-800">【分】区分事实与猜测</span>
                <span className="text-[10px] text-stone-400">意外/自责时</span>
              </div>
              <p className="text-xs text-stone-800 font-bold leading-relaxed">
                “我们先看眼睛能看见的事实：地上的水洒了。脑子里那个‘都怪我’的声音，只是在吓唬你。”
              </p>
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText('“我们先看眼睛能看见的事实：地上的水洒了。脑子里那个‘都怪我’的声音，只是在吓唬你。”');
                  }
                  sounds.playBell();
                }}
                className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 self-end cursor-pointer pt-0.5"
                title="一键复制本条示范话术"
              >
                <Copy className="w-3 h-3" />
                <span>复制话术</span>
              </button>
            </div>

            <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800">【通】换位与双重视角</span>
                <span className="text-[10px] text-stone-400">规则/摩擦时</span>
              </div>
              <p className="text-xs text-stone-800 font-bold leading-relaxed">
                “两个家规则不同但都用心爱你。就像小鱼在不同池子，你很聪明能掌握两张通行卡！”
              </p>
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText('“两个家规则不同但都用心爱你。就像小鱼在不同池子，你很聪明能掌握两张通行卡！”');
                  }
                  sounds.playBell();
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-end cursor-pointer pt-0.5"
                title="一键复制本条示范话术"
              >
                <Copy className="w-3 h-3" />
                <span>复制话术</span>
              </button>
            </div>

            <div className="p-3 bg-white/90 rounded-2xl border border-amber-200 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-800">【择】有限选择权</span>
                <span className="text-[10px] text-stone-400">抵触/冲动时</span>
              </div>
              <p className="text-xs text-stone-800 font-bold leading-relaxed">
                “出发时间到了是大方向，但你可以决定：想先把小熊装进去，还是先装小水壶？”
              </p>
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText('“出发时间到了是大方向，但你可以决定：想先把小熊装进去，还是先装小水壶？”');
                  }
                  sounds.playBell();
                }}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 self-end cursor-pointer pt-0.5"
                title="一键复制本条示范话术"
              >
                <Copy className="w-3 h-3" />
                <span>复制话术</span>
              </button>
            </div>
          </div>
        </div>

        {/* 养育勋章成长印章快捷概览 */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
              🏅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-stone-900">
                  养育勋章：见证父母温和坚定的思考引导
                </h4>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  已点亮 {parentMedals.filter(m => m.unlocked).length} / {parentMedals.length} 枚
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-medium mt-0.5">
                记录一次事实分界、翻转一次双面币、赋能一次自主选择，即刻点亮象征亲子成长的心理学里程碑印章。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center -space-x-1.5 overflow-hidden py-1">
              {parentMedals.map(m => (
                <div
                  key={m.id}
                  title={`${m.title}（${m.unlocked ? '已点亮' : '待达成'}）`}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-transform hover:scale-110 shadow-2xs ${
                    m.unlocked
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-stone-100 border-stone-300 grayscale opacity-40'
                  }`}
                >
                  {m.emoji}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('medals');
              }}
              className="min-h-[44px] px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              aria-label="查看完整养育勋章墙"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>查看勋章墙</span>
            </button>
          </div>
        </div>

        {/* SEC-05: 历史本地敏感数据隔离与清理指示 */}
        {hasLegacySensitiveData && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
            <div className="space-y-0.5">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>检测到历史版本留存的端侧敏感数据缓存</span>
              </span>
              <p className="text-stone-600">
                新版晴雨小岛严格遵循数据最小化原则，儿童自由表达、想念与情绪记录仅保存在内存态，绝不持久化。您可以一键安全清理历史敏感缓存。
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                clearLegacySensitiveStorage();
              }}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0 transition-colors cursor-pointer"
            >
              一键清理旧版敏感缓存
            </button>
          </div>
        )}

        {/* 折叠式认知发展小百科（6岁分通择发展心理学科学底座） */}
        <CognitiveDevelopmentEncyclopedia initialExpanded={false} />

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-stone-200/60 rounded-2xl">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('pocketTips');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'pocketTips'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-900 bg-white/70 hover:bg-white'
            }`}
            aria-label="打开养育小锦囊"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
            <span>养育小锦囊</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('medals');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'medals'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-900 hover:text-amber-950 bg-amber-50/70 hover:bg-amber-100'
            }`}
            aria-label="打开养育勋章墙"
          >
            <Award className="w-4 h-4 text-amber-500 fill-current" />
            <span>养育勋章 ({parentMedals.filter(m => m.unlocked).length})</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('huginbox');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'huginbox'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 hover:text-rose-900 bg-rose-50/50 hover:bg-rose-100/50'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>抱抱收件箱与自省</span>
            {activeHugNotice && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            )}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('report');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-900 bg-white/70 hover:bg-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>周报分析与养育建议</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('observe');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'observe'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            行为观察卡（驱动工具淡出）
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('scripts');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'scripts'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            7大日常脚本库
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('lessons');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'lessons'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            微课与特别时光
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('consistency');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'consistency'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ListChecks className="w-4 h-4 text-indigo-600" />
            一致性清单
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('insights');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'insights'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-600" />
            趋势信号看板
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('safety');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'safety'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-rose-600 hover:text-rose-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            安全与危机热线
          </button>
        </div>

        {/* ================= TAB 0: 养育小锦囊 (PARENTING POCKET TIPS) ================= */}
        {activeTab === 'pocketTips' && (
          <ParentingPocketTips />
        )}

        {/* ================= TAB: 养育勋章成长印章 (PARENT MEDALS WALL) ================= */}
        {activeTab === 'medals' && (
          <ParentMedalsWall
            medals={parentMedals}
            onManualUnlock={handleManualUnlockMedal}
            onNavigateTab={(tab) => {
              if (tab === 'observe') setActiveTab('observe');
              else if (tab === 'pocketTips') setActiveTab('pocketTips');
              else if (tab === 'consistency') setActiveTab('consistency');
              else if (tab === 'huginbox') setActiveTab('huginbox');
            }}
          />
        )}

        {/* ================= TAB 0: 抱抱收件箱与私密自省 (HUG INBOX) ================= */}
        {activeTab === 'huginbox' && (
          <CaregiverHugInbox />
        )}

        {/* ================= TAB 0: 周报分析与个性化建议 (WEEKLY REPORT) ================= */}
        {activeTab === 'report' && (
          <WeeklyReportView
            report={weeklyReport}
            isLoading={isGeneratingReport}
            onRefresh={handleGenerateReport}
            isAiPowered={isAiPowered}
          />
        )}

        {/* ================= TAB 1: 行为观察卡 (OBSERVATIONS) ================= */}
        {activeTab === 'observe' && (
          <div className="space-y-4">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5">
              <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2">
                <span>观察卡：看行为，不考工具名字</span>
              </h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                不要去问孩子“这是哪件工具”。我们只观察在日常真实生活里，孩子的话和做法有没有改变。
                如果孩子在日常生活里自己用出了思考方法，点击<strong>“这次他自己想到了”</strong>，系统将把小工具的界面提示逐步淡出，撤掉脚手架！
              </p>
            </div>

            <div className="space-y-3">
              {parentObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                      维度：{obs.dimension}
                    </span>
                    <div className="text-xs text-stone-400">
                      过去常见：<del>{obs.oldBehavior}</del>
                    </div>
                    <div className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                      <span className="text-emerald-600">目标行为变化：</span>
                      <span>{obs.targetBehavior}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-stone-500 block">自发运用次数</span>
                      <span className="text-base font-extrabold text-emerald-700">
                        {obs.selfInitiatedCount} 次
                      </span>
                    </div>

                    <button
                      onClick={() => incrementSelfInitiated(obs.id)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Award className="w-4 h-4" />
                      一键标记：这次他自己想到了！
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: 7大日常脚本库 (SCRIPTS) ================= */}
        {activeTab === 'scripts' && (
          <div className="grid md:grid-cols-12 gap-5">
            {/* Left list of 7 scenarios */}
            <div className="md:col-span-5 space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                选择高频困扰场景：
              </span>
              {INITIAL_PARENT_SCRIPTS.map((script) => (
                <button
                  key={script.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedScriptId(script.id);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                    selectedScriptId === script.id
                      ? 'bg-amber-100/70 border-amber-500 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <span className="text-[11px] font-bold text-amber-800 block">
                    {script.category}
                  </span>
                  <div className="text-xs font-bold text-stone-800 mt-0.5">
                    {script.title}
                  </div>
                </button>
              ))}
            </div>

            {/* Right detail: 可以说 / 不要说 / 为什么 */}
            <div className="md:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {currentScript.category}
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-2">
                  {currentScript.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  场景：{currentScript.scenario}
                </p>
              </div>

              {/* 可以说 */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  可以说（示范话术）：
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-stone-800">
                  {currentScript.canSay.map((say, idx) => (
                    <li key={idx} className="font-medium leading-relaxed pl-2 border-l-2 border-emerald-400">
                      {say}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 不要说 */}
              <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  不要说（常见雷区）：
                </span>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {currentScript.shouldNotSay.map((notSay, idx) => (
                    <li key={idx} className="pl-2 border-l-2 border-rose-400">
                      {notSay}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 为什么（发展心理学原理） */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
                <span className="font-bold text-stone-800 block">💡 发展科学原理：</span>
                <p className="leading-relaxed">{currentScript.why}</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: 每周微课与特别时光 ================= */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {/* 特别时光 (Special Time - PCIT) */}
            <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-stone-900">
                    每周一次“特别时光”（10–15分钟高质陪伴）
                  </h3>
                </div>
                <span className="text-xs bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                  PCIT 黄金技术
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                这是每周最高性价比的关系修复工具。在这15分钟里：
                <strong>孩子主导游戏，大人不提问、不指导、不纠正，只描述和跟随！</strong>
              </p>
              <div className="grid sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="bg-white p-3 rounded-2xl border border-amber-200">
                  <span className="font-bold text-emerald-700 block mb-1">✓ 描述跟随：</span>
                  “你正在给小恐龙搭一座红色的高塔，这块积木放得好平稳。”
                </div>
                <div className="bg-white p-3 rounded-2xl border border-amber-200">
                  <span className="font-bold text-emerald-700 block mb-1">✓ 积极赞赏：</span>
                  “你很耐心地一块块拼起来，真专注。”
                </div>
                <div className="bg-white p-3 rounded-2xl border border-amber-200">
                  <span className="font-bold text-rose-700 block mb-1">✗ 忍住三件事：</span>
                  不问“这是什么恐龙？”、不指导“塔应该这么搭”、不纠正“搭歪了”。
                </div>
              </div>
            </div>

            {/* Weekly Lessons from New Beginnings */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
                New Beginnings 核心微课系列：
              </h4>
              <div className="grid sm:grid-cols-2 gap-3.5">
                {INITIAL_WEEKLY_LESSONS.map((lesson) => (
                  <div
                    key={lesson.week}
                    className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-sky-700">{lesson.pillar}</span>
                        <span className="text-stone-400">{lesson.duration}</span>
                      </div>
                      <h5 className="text-sm font-bold text-stone-900">{lesson.title}</h5>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {lesson.description}
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-amber-900 font-medium mt-3">
                      🎯 {lesson.coreAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: 一致性清单与平行育儿 ================= */}
        {activeTab === 'consistency' && (
          <div className="space-y-5">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  两个家的一致性核对清单
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  不需要所有事情都一模一样，但核心安全与睡前惯例的一致，能给6岁孩子极大的安全感
                </p>
              </div>

              <div className="space-y-2.5">
                {consistencyItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleConsistencyItem(item.id)}
                    className="p-3.5 rounded-2xl border border-stone-200 hover:border-indigo-300 flex items-center justify-between gap-3 cursor-pointer transition-all bg-stone-50/50"
                  >
                    <div>
                      <span className="text-xs font-bold text-stone-800 block">{item.title}</span>
                      <span className="text-xs text-stone-500">{item.desc}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      item.checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-stone-300 bg-white'
                    }`}>
                      {item.checked && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parallel Parenting template for high-conflict situations */}
            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-5 space-y-3">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                🛡️ 高冲突时的平行育儿模板（BIFF 原则）：
              </span>
              <p className="text-xs text-stone-600 leading-relaxed">
                若双方沟通存在张力，遵循 <strong>BIFF 沟通法</strong>（简短 Brief、信息性 Informative、友好 Friendly、坚定 Firm）：
                仅使用书面文字、仅沟通孩子的交接与就医事实，不发表个人评论，不延伸过去的恩怨。
              </p>
              <div className="p-3 bg-white rounded-2xl border border-stone-200 text-xs text-stone-700">
                <strong>示范模板：</strong>“孩子已带齐下周画具，周五下午4:30按时在校门口接送。周三需要带水彩笔已装在背包侧袋。祝顺利。”
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: 趋势信号看板 & 成长观察日志 ================= */}
        {activeTab === 'insights' && (
          <div className="space-y-5">
            <GrowthObservationLog />

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  总体信号与支持提示
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  只展示情绪词汇与平静办法的运用趋势；绝不展示孩子的私密语音、秘密抽屉涂画与原话。
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-center">
                  <span className="text-xs text-sky-800 block">最近天气记录</span>
                  <span className="text-2xl font-black text-sky-900 mt-1 block">
                    {todayWeather?.primary === 'sunny'
                      ? '☀️ 晴天'
                      : todayWeather?.primary === 'stormy'
                      ? '⛈️ 雷雨'
                      : todayWeather?.primary === 'rainy'
                      ? '🌧️ 雨天'
                      : todayWeather?.primary === 'foggy'
                      ? '🌫️ 雾天'
                      : todayWeather?.primary === 'opt_out'
                      ? '🌿 自主保留（未选择）'
                      : '⛅ 阴天/多云'}
                  </span>
                  <span className="text-[11px] text-sky-600 mt-1 block">
                    {todayWeather?.primary === 'opt_out' ? '自主选择探索节奏' : `强度感受：${todayWeather?.intensity || 3} 级`}
                  </span>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                  <span className="text-xs text-emerald-800 block">已完成叶片探索</span>
                  <span className="text-2xl font-black text-emerald-900 mt-1 block">
                    {completedLeaves.length} / 4 片
                  </span>
                  <span className="text-[11px] text-emerald-600 mt-1 block">物与名、规则与家的形状</span>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                  <span className="text-xs text-amber-800 block">自主运用思考工具</span>
                  <span className="text-2xl font-black text-amber-900 mt-1 block">
                    {parentObservations.reduce((acc, cur) => acc + cur.selfInitiatedCount, 0)} 次
                  </span>
                  <span className="text-[11px] text-amber-600 mt-1 block">正在自发驱动脚手架淡出</span>
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 leading-relaxed">
                <strong>今晚建议行动：</strong>孩子今天身体感觉主要是“{todayWeather?.bodySensations.join('、') || '松松的'}”，
                睡前花10分钟聊聊今天最开心的一件小事，给孩子一个温暖踏实的晚安拥抱。
              </div>

              {/* Google Drive Cloud Backup Card */}
              <div className="p-4 sm:p-5 bg-linear-to-r from-blue-50 to-sky-50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <span>Google 云端硬盘 · 思考成长档案云备份</span>
                      <span className="text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.2 rounded-full font-bold">
                        安全私密
                      </span>
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      将孩子的思考叶片完成记录、情绪天气日记与观察卡备份至 Google Drive，方便两个家或更换设备时随时同步。
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDriveOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>管理 Google Drive 档案</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: 安全与危机热线 ================= */}
        {activeTab === 'safety' && (
          <div className="space-y-5">
            <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
                <h3 className="text-base sm:text-lg font-bold text-rose-950">
                  三级安全预警系统与专业支持通道
                </h3>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed">
                本产品定位为健康与认知成长促进，不做临床诊断或治疗。遇到中重度困扰时，请及时联络专业医疗或心理援助热线。
              </p>

              {/* Three tiers overview */}
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-2xl border border-emerald-200">
                  <span className="font-bold text-emerald-700 block mb-1">🟢 绿级：日常波动</span>
                  <p className="text-stone-600 leading-relaxed">短暂的情绪起伏、想念或退行。继续陪伴与微课支持。</p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-amber-200">
                  <span className="font-bold text-amber-700 block mb-1">🟡 黄级：需关注信号</span>
                  <p className="text-stone-600 leading-relaxed">睡眠、食欲退行或攻击持续数周；反复自责。建议联络学校心理老师或儿童保健门诊。</p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-rose-300">
                  <span className="font-bold text-rose-700 block mb-1">🔴 红级：紧急干预</span>
                  <p className="text-stone-600 leading-relaxed">表达自伤想消失、家暴或虐待威胁。立即启动保护并拨打专业热线。</p>
                </div>
              </div>

              {/* Emergency Hotlines */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 space-y-2">
                <span className="text-xs font-bold text-stone-800 block">全国权威心理援助与求助通道：</span>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                    <div>
                      <strong className="text-xs text-rose-800 block">12356 全国统一心理援助热线</strong>
                      <span className="text-[11px] text-stone-500">24小时免费心理辅导</span>
                    </div>
                    <a
                      href="tel:12356"
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                    >
                      拨打
                    </a>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                    <div>
                      <strong className="text-xs text-sky-800 block">12355 青少年服务热线</strong>
                      <span className="text-[11px] text-stone-500">共青团青少年心理与法律援助</span>
                    </div>
                    <a
                      href="tel:12355"
                      className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold"
                    >
                      拨打
                    </a>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 mt-2">
                  *紧急危急人身安全情况下，请直接拨打 110 或 120。家暴与高冲突家庭应立即寻求人身保护与专业机构庇护。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Google Drive Modal */}
        <GoogleDriveModal
          isOpen={isDriveOpen}
          onClose={() => setIsDriveOpen(false)}
        />

        {/* Voice System Audition & Acoustic Tuning Modal */}
        <VoiceSystemAuditionModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
        />

      </div>
    </div>
  );
};
