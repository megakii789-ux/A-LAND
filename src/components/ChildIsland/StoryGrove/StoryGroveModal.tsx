import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  DoorOpen,
  RotateCcw,
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  X,
  Compass,
  MessageCircle,
  Home
} from 'lucide-react';
import { LeafScenario, DoorType } from '../../../types';
import { INITIAL_LEAF_SCENARIOS } from '../../../data/mockData';
import { useApp } from '../../../context/AppContext';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';
import { isHeavyWeather } from '../../../domain/weather/soilWeatherContract';
import {
  CupScaleInteractiveIllustration,
  RainWeatherIllustration,
  LocationBadgeIllustration
} from './StoryIllustrations';
import { ContentAuditRegistry } from '../../../domain/cognitive/ContentAuditRegistry';
import {
  issueAdultPreviewSession,
  isAdultPreviewSessionValid,
  revokeAdultPreviewSession,
  lockParentAccess,
  subscribeParentAccess,
} from '../../../domain/privacy/parentAccess';
import { ParentGateModal } from '../../ParentGateModal';
import { IslandUiIconSvg } from '../CompanionIcons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialLeafId?: string | null;
}

export const StoryGroveModal: React.FC<Props> = ({ isOpen, onClose, initialLeafId }) => {
  const { completedLeaves, markLeafComplete, childQuotes, todayWeather } = useApp();

  const [activeLeafId, setActiveLeafId] = useState<string>(initialLeafId || 'cup-size');
  const [stage, setStage] = useState<'catalog' | 'doorIntro' | 'walkLoop' | 'choose' | 'offscreen' | 'compare'>('catalog');
  const [selectedDoor, setSelectedDoor] = useState<DoorType>('fen');
  const [walkSubStep, setWalkSubStep] = useState<'fen' | 'tong' | 'ze'>('fen');
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [customQuote, setCustomQuote] = useState<string>('');
  const [compareAnswered, setCompareAnswered] = useState<boolean>(false);
  const [previewSessionToken, setPreviewSessionToken] = useState<string | null>(null);
  const [isParentGateOpen, setIsParentGateOpen] = useState<boolean>(false);
  const [, setAccessVersion] = useState<number>(0);

  useEffect(() => {
    return subscribeParentAccess(() => {
      setAccessVersion((v) => v + 1);
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPreviewSessionToken(null);
      setIsParentGateOpen(false);
      setStage('catalog');
      revokeAdultPreviewSession();
      lockParentAccess();
    }
    return () => {
      revokeAdultPreviewSession();
    };
  }, [isOpen]);

  const isCurrentHeavyWeather = todayWeather
    ? isHeavyWeather(
        todayWeather.primary,
        todayWeather.intensity >= 4 ? 'intense' : todayWeather.intensity >= 2 ? 'medium' : 'gentle'
      )
    : false;

  const currentLeaf = INITIAL_LEAF_SCENARIOS.find(l => l.id === activeLeafId) || INITIAL_LEAF_SCENARIOS[0];
  const currentScopeKey = `story:${currentLeaf.id}`;
  const isCurrentLeafApproved = ContentAuditRegistry.canRenderContent(currentLeaf.id);
  const adultPreviewUnlocked = isAdultPreviewSessionValid(currentScopeKey, previewSessionToken);

  // 边界优先原则：当 boundary !== 'NONE' 且存在边界时触发红线约束
  const hasBoundaryConflict = !!currentLeaf.boundary && currentLeaf.boundary !== 'NONE';

  if (!isOpen) return null;

  const handleCloseStoryGrove = () => {
    speechNarrator.stop();
    setPreviewSessionToken(null);
    setIsParentGateOpen(false);
    setStage('catalog');
    revokeAdultPreviewSession();
    lockParentAccess();
    onClose();
  };

  const handleReturnToCatalog = () => {
    sounds.playClick();
    speechNarrator.stop();
    setPreviewSessionToken(null);
    setIsParentGateOpen(false);
    revokeAdultPreviewSession();
    lockParentAccess();
    setStage('catalog');
  };

  const handleStartLeaf = (leafId: string) => {
    sounds.playClick();
    speechNarrator.stop();
    setActiveLeafId(leafId);
    setPreviewSessionToken(null);
    setIsParentGateOpen(false);
    revokeAdultPreviewSession();
    lockParentAccess();
    setStage('doorIntro');
    setSelectedDoor('fen');
    setWalkSubStep('fen');
    setSelectedChoiceId(null);
    setCustomQuote(childQuotes[leafId] || '');
    setCompareAnswered(false);
  };

  const handleRequestAdultReview = () => {
    sounds.playClick();
    setPreviewSessionToken(null);
    revokeAdultPreviewSession();
    lockParentAccess();
    setIsParentGateOpen(true);
  };

  const handleSpeak = (text: string) => {
    speechNarrator.speak(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-amber-50/95 border border-amber-200/90 rounded-3xl p-4 sm:p-8 max-w-2xl w-full shadow-2xl relative my-auto transition-all duration-200 text-stone-800 max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleCloseStoryGrove}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-stone-500 hover:text-stone-700 p-2 rounded-full hover:bg-amber-100/60 transition-colors z-20 min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
          aria-label="离开故事林"
        >
          <X className="w-6 h-6" />
        </button>

        {/* ================= STAGE 0: 叶子选择目录 (CATALOG) ================= */}
        {stage === 'catalog' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pr-12">
              <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center p-1.5 shadow-inner shrink-0 border border-emerald-200">
                <LocationBadgeIllustration type="story" className="w-full h-full" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-800 flex items-center gap-1.5 flex-wrap">
                  <span>故事林 · 发现思考之叶</span>
                  <button
                    onClick={() => handleSpeak("欢迎来到故事林。这里有很多有趣的故事叶，动手玩一玩，发现你的思考方法！")}
                    className="p-2 rounded-full hover:bg-amber-100 text-amber-700 min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer"
                    aria-label="朗读故事林介绍"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600">从轻巧好玩的事物开始，慢慢探索更丰富的生活情境</p>
              </div>
            </div>

            {/* 当天气为重天气/高强度时，温柔建议先玩轻叶，绝不锁死或拿走内容 */}
            {isCurrentHeavyWeather && (
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-sky-900">
                <div className="text-sm">
                  <span className="font-bold block">💡 伴伴悄悄话：</span>
                  今天身体感受比较强烈，推荐先玩轻松的轻叶（如《一只杯子》），不给自己压力。
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {INITIAL_LEAF_SCENARIOS.map((leaf) => {
                const isDone = completedLeaves.includes(leaf.id);
                const isAudited = ContentAuditRegistry.canRenderContent(leaf.id);
                return (
                  <button
                    key={leaf.id}
                    onClick={() => handleStartLeaf(leaf.id)}
                    className="text-left p-5 rounded-3xl bg-white border-2 border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer min-h-[140px]"
                    aria-label={`探索故事叶：${leaf.title}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-emerald-800">
                          {leaf.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {!isAudited && (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                              准备中 · 需大人陪同
                            </span>
                          )}
                          {isDone && (
                            <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> 已探索
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="text-lg font-black text-stone-900 group-hover:text-amber-900 transition-colors">
                        {leaf.title}
                      </h4>
                      <p className="text-sm sm:text-base text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {leaf.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-sm sm:text-base text-amber-800 font-bold">
                      <span>主角：{leaf.character}</span>
                      <span className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                        看看详情 <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= NON-CATALOG AUDIT GATE: 任何非目录阶段若未授权则立即阻断 ================= */}
        {stage !== 'catalog' && !isCurrentLeafApproved && !adultPreviewUnlocked && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pr-12">
              <button
                onClick={handleReturnToCatalog}
                className="min-h-[48px] px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-xs sm:text-sm font-bold text-stone-700 flex items-center gap-1.5 border border-amber-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> 返回叶子目录
              </button>
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
                {currentLeaf.category} · {currentLeaf.character}
              </span>
            </div>

            <div
              data-testid="story-leaf-audit-gate-blocked"
              className="p-5 sm:p-7 bg-amber-50 rounded-3xl border-2 border-amber-300 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
                <IslandUiIconSvg name="waiting_lantern" className="w-11 h-11" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-amber-950">
                  这片故事叶正在由大人细心检查中
                </h3>
                <p className="text-sm sm:text-base text-stone-700 max-w-md mx-auto leading-relaxed font-medium">
                  大人们正在认真检查《{currentLeaf.title}》的每一句话，确保它足够温暖安全，现在还不能自己打开哦。你可以先去小岛上其他已经准备好的地方玩一玩！
                </p>
              </div>

              {/* 儿童适龄可用活动引导（>= 56px 触控标准） */}
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseStoryGrove}
                  className="min-h-[56px] px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm sm:text-base cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  <span>回小岛去别的地点玩</span>
                </button>
                <button
                  type="button"
                  onClick={handleReturnToCatalog}
                  className="min-h-[56px] px-5 py-3 bg-white hover:bg-stone-100 text-stone-800 font-bold rounded-2xl text-sm sm:text-base border-2 border-stone-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>看其他故事叶</span>
                </button>
              </div>

              {/* 成人/专家受控审阅入口：必须通过家长 PIN 门禁，禁止儿童一键放行 */}
              <div className="pt-3 border-t border-amber-200/80 flex flex-col items-center gap-1.5">
                <span className="text-xs text-stone-500">
                  如果你是家长或审阅老师，需要陪同预览内容：
                </span>
                <button
                  type="button"
                  onClick={handleRequestAdultReview}
                  className="min-h-[48px] px-4 py-2.5 bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-bold rounded-xl text-xs border border-amber-300 cursor-pointer transition-colors"
                >
                  🔒 家长 / 审阅人验证后预览（需输入家长 PIN）
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 1: 三扇门进入 (DOORS INTRO) ================= */}
        {stage === 'doorIntro' && (isCurrentLeafApproved || adultPreviewUnlocked) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pr-12">
              <button
                onClick={handleReturnToCatalog}
                className="min-h-[48px] px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-xs sm:text-sm font-bold text-stone-700 flex items-center gap-1.5 border border-amber-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> 返回叶子目录
              </button>
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
                {currentLeaf.category} · {currentLeaf.character}
              </span>
            </div>

            <>
              <div className="bg-white/90 p-4 rounded-3xl border border-amber-200 overflow-hidden shadow-sm space-y-3">
                {adultPreviewUnlocked && !isCurrentLeafApproved && (
                  <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-2">
                    <span>🛡️ 当前为家长/专家受控审阅预览模式（已通过家长 PIN 校验），本故事尚未向儿童独立开放。</span>
                    <span className="text-[11px] bg-amber-200 px-2 py-0.5 rounded-full shrink-0">成人共读审阅</span>
                  </div>
                )}
                  {/* Scenario Visual Anchor */}
                  <div className="mb-3 rounded-2xl overflow-hidden border border-stone-200/80 bg-slate-50">
                    {currentLeaf.id === 'cup-size' ? (
                      <CupScaleInteractiveIllustration perspective="neutral" className="w-full h-40 sm:h-48" />
                    ) : currentLeaf.id === 'rain-weather' ? (
                      <RainWeatherIllustration focusSide="both" className="w-full h-40 sm:h-48" />
                    ) : (
                      <div className="h-32 bg-amber-100/50 flex items-center justify-center">
                        <LocationBadgeIllustration type="story" className="w-16 h-16" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-stone-800 mb-1 flex items-center gap-2">
                    <span>{currentLeaf.title}</span>
                    <button
                      onClick={() => handleSpeak(currentLeaf.summary)}
                      className="p-2 rounded-xl text-amber-700 hover:bg-amber-100 min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer"
                      aria-label="朗读故事概述"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-2 font-medium">
                    {currentLeaf.summary}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5">
                    🚪 选一扇你最想推开的门进入（三扇门都可以通向理解）：
                  </p>

                  <div className="grid gap-2.5">
                    {/* Door 1: 先分 */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setSelectedDoor('fen');
                        setWalkSubStep('fen');
                        setStage('walkLoop');
                      }}
                      className="min-h-[64px] p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-sky-200 hover:border-sky-400 hover:bg-sky-50/50 text-left transition-all flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <DoorOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-sky-700">门 1 · 先分（发生了什么？）</div>
                        <div className="text-sm font-bold text-stone-800 mt-0.5">{currentLeaf.doors.fen.question}</div>
                        <div className="text-xs text-stone-500 mt-1">{currentLeaf.doors.fen.description}</div>
                      </div>
                    </button>

                    {/* Door 2: 先换 */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setSelectedDoor('tong');
                        setWalkSubStep('tong');
                        setStage('walkLoop');
                      }}
                      className="min-h-[64px] p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition-all flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-700">门 2 · 先换（换位置看呢？）</div>
                        <div className="text-sm font-bold text-stone-800 mt-0.5">{currentLeaf.doors.tong.question}</div>
                        <div className="text-xs text-stone-500 mt-1">{currentLeaf.doors.tong.description}</div>
                      </div>
                    </button>

                    {/* Door 3: 先选 */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setSelectedDoor('ze');
                        setWalkSubStep('ze');
                        setStage('walkLoop');
                      }}
                      className="min-h-[64px] p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 text-left transition-all flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-700">门 3 · 先选（我可以怎么办？）</div>
                        <div className="text-sm font-bold text-stone-800 mt-0.5">{currentLeaf.doors.ze.question}</div>
                        <div className="text-xs text-stone-500 mt-1">{currentLeaf.doors.ze.description}</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
          </div>
        )}

        {/* ================= STAGE 2: 走一圈 (WALK LOOP) ================= */}
        {stage === 'walkLoop' && (isCurrentLeafApproved || adultPreviewUnlocked) && (
          <div className="space-y-6">
            {/* Steps indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/70">
              <span className="text-xs font-bold text-stone-500">走一圈：三种姿态都要看一看</span>
              <div className="flex gap-1.5">
                {(['fen', 'tong', 'ze'] as const).map((stepName) => (
                  <button
                    key={stepName}
                    onClick={() => {
                      sounds.playClick();
                      setWalkSubStep(stepName);
                    }}
                    className={`min-h-[48px] px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      walkSubStep === stepName
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-white text-stone-500 border border-stone-200'
                    }`}
                  >
                    {stepName === 'fen' ? '1. 分一分' : stepName === 'tong' ? '2. 换一换' : '3. 掂一掂'}
                  </button>
                ))}
              </div>
            </div>

            {/* SUB-STEP 1: 分一分 */}
            {walkSubStep === 'fen' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-800">
                    姿态 · 分：把看得见的、心里的、猜的分开
                  </span>
                  <button
                    onClick={() => handleSpeak("分一分：哪些是真正看见的事实，哪些只是脑子里的猜测？")}
                    className="min-w-[48px] min-h-[48px] p-2 flex items-center justify-center text-sky-700 hover:bg-sky-100 rounded-xl cursor-pointer"
                    aria-label="听一听分一分提示"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Visual Anchor during Fen (分一分) */}
                <div className="rounded-2xl overflow-hidden border border-sky-200/90 bg-white">
                  {currentLeaf.id === 'cup-size' ? (
                    <CupScaleInteractiveIllustration perspective="neutral" className="w-full h-36 sm:h-44 object-cover" />
                  ) : currentLeaf.id === 'rain-weather' ? (
                    <RainWeatherIllustration focusSide="both" className="w-full h-36 sm:h-44 object-cover" />
                  ) : null}
                </div>

                <div className="grid gap-3">
                  <div className="bg-emerald-50/70 p-4 rounded-2xl border-2 border-emerald-200 shadow-2xs">
                    <span className="text-xs font-bold text-emerald-800 block">👀 看得见的事实：</span>
                    <p className="text-xs sm:text-sm text-stone-800 mt-1 font-medium">{currentLeaf.walkSteps.fenContent.fact}</p>
                  </div>

                  <div className="bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200 shadow-2xs">
                    <span className="text-xs font-bold text-amber-800 block">💭 脑子里的声音 / 猜测：</span>
                    <p className="text-xs sm:text-sm text-stone-800 mt-1 font-medium">{currentLeaf.walkSteps.fenContent.guess}</p>
                  </div>

                  <div className="bg-rose-50/70 p-4 rounded-2xl border-2 border-rose-200 shadow-2xs">
                    <span className="text-xs font-bold text-rose-800 block">💓 心里的感受：</span>
                    <p className="text-xs sm:text-sm text-stone-800 mt-1 font-medium">{currentLeaf.walkSteps.fenContent.feeling}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setWalkSubStep('tong');
                    }}
                    className="min-h-[48px] px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>去换一换镜头</span> <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SUB-STEP 2: 换一换 */}
            {walkSubStep === 'tong' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">
                    {hasBoundaryConflict ? '姿态 · 通：理解原因，但红线绝不妥协' : '姿态 · 通：同一件事，换个位置看有另一面'}
                  </span>
                  <button
                    onClick={() => handleSpeak(hasBoundaryConflict ? "他可能有原因，但打人和伤害身体绝对不可以。" : "换一换：站在不同的眼睛看，或者翻过双面币看看另一面！")}
                    className="min-w-[48px] min-h-[48px] p-2 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 rounded-xl cursor-pointer"
                    aria-label="听一听换一换提示"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* 关键契约：boundary !== NONE 时，禁止对红线行为显示双面币 (Coin flip)！ */}
                {hasBoundaryConflict ? (
                  <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
                      <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>红线不翻双面币：伤害身体没有“另一面”</span>
                    </div>
                    <div className="space-y-2 text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                      <p className="bg-white/80 p-3 rounded-xl border border-rose-200">
                        {currentLeaf.walkSteps.tongContent.sideA}
                      </p>
                      <p className="bg-rose-100/70 p-3 rounded-xl border border-rose-300 font-bold text-rose-950">
                        {currentLeaf.walkSteps.tongContent.sideB}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* boundary === NONE 时，允许标准的双面币翻转与双向比较呈现 */
                  <div className="space-y-3">
                    {/* Visual Perspective Switcher */}
                    <div className="rounded-2xl overflow-hidden border border-emerald-200/90 bg-white">
                      {currentLeaf.id === 'cup-size' ? (
                        <CupScaleInteractiveIllustration perspective="squirrel" className="w-full h-36 sm:h-44 object-cover" />
                      ) : currentLeaf.id === 'rain-weather' ? (
                        <RainWeatherIllustration focusSide="frog" className="w-full h-36 sm:h-44 object-cover" />
                      ) : null}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-xs">
                        <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mb-1.5">
                          <span>🪙 这一面：</span>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                          {currentLeaf.walkSteps.tongContent.sideA}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border-2 border-teal-200 shadow-xs">
                        <div className="text-xs font-bold text-teal-700 flex items-center gap-1 mb-1.5">
                          <span>🪙 翻过来的另一面：</span>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                          {currentLeaf.walkSteps.tongContent.sideB}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-600 text-center font-medium">
                  {currentLeaf.walkSteps.tongContent.whoseView}
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => setWalkSubStep('fen')}
                    className="min-h-[48px] px-3.5 py-2 text-xs sm:text-sm font-bold text-stone-600 hover:text-stone-800 flex items-center gap-1.5 rounded-xl cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> 回到分一分
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setWalkSubStep('ze');
                    }}
                    className="min-h-[48px] px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>去小天平掂一掂</span> <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SUB-STEP 3: 掂一掂 */}
            {walkSubStep === 'ze' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-amber-100/60 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">
                    {hasBoundaryConflict ? '姿态 · 择：绝对安全行动（保护身体 · 找大人）' : '姿态 · 择：在小天平上看好处与代价，自己选'}
                  </span>
                  <button
                    onClick={() => handleSpeak(hasBoundaryConflict ? "后退保护身体，大声说停，走向安全大人求助。" : "在小天平上掂量：每种做法都有好处和需要付出的代价，没有全对全错。")}
                    className="min-w-[48px] min-h-[48px] p-2 flex items-center justify-center text-amber-800 hover:bg-amber-100 rounded-xl cursor-pointer"
                    aria-label="听一听掂一掂提示"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* 关键契约：boundary !== NONE 时，禁止对打人等红线行为上小天平称“好处”！ */}
                {hasBoundaryConflict ? (
                  <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
                      <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>红线上不了天平：伤害身体绝没有好处可称</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3.5 rounded-2xl border-2 border-emerald-300 shadow-xs">
                        <span className="text-xs font-bold text-emerald-900 block mb-1">
                          🛡️ 安全行动 1：{currentLeaf.walkSteps.zeContent.choiceA.text}
                        </span>
                        <div className="text-[11px] text-emerald-700 mt-1">
                          <strong>安全意义：</strong>{currentLeaf.walkSteps.zeContent.choiceA.benefit}
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border-2 border-emerald-300 shadow-xs">
                        <span className="text-xs font-bold text-emerald-900 block mb-1">
                          🛡️ 安全行动 2：{currentLeaf.walkSteps.zeContent.choiceB.text}
                        </span>
                        <div className="text-[11px] text-emerald-700 mt-1">
                          <strong>安全意义：</strong>{currentLeaf.walkSteps.zeContent.choiceB.benefit}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-rose-100/70 rounded-xl text-xs text-rose-900 font-bold text-center">
                      {currentLeaf.walkSteps.zeContent.fenceReminder}
                    </div>
                  </div>
                ) : (
                  /* boundary === NONE 时，允许在小天平上呈现两面利弊权衡 */
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
                      <span className="text-xs font-bold text-stone-700 block mb-1">
                        做法 A：{currentLeaf.walkSteps.zeContent.choiceA.text}
                      </span>
                      <div className="text-[11px] text-emerald-700 mt-1">
                        <strong>好处：</strong>{currentLeaf.walkSteps.zeContent.choiceA.benefit}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-1">
                        <strong>代价：</strong>{currentLeaf.walkSteps.zeContent.choiceA.cost}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
                      <span className="text-xs font-bold text-stone-700 block mb-1">
                        做法 B：{currentLeaf.walkSteps.zeContent.choiceB.text}
                      </span>
                      <div className="text-[11px] text-emerald-700 mt-1">
                        <strong>好处：</strong>{currentLeaf.walkSteps.zeContent.choiceB.benefit}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-1">
                        <strong>代价：</strong>{currentLeaf.walkSteps.zeContent.choiceB.cost}
                      </div>
                    </div>
                  </div>
                )}

                {/* 普通围栏提醒（如存在） */}
                {!hasBoundaryConflict && currentLeaf.walkSteps.zeContent.fenceReminder && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
                    <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{currentLeaf.walkSteps.zeContent.fenceReminder}</span>
                  </div>
                )}

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => setWalkSubStep('tong')}
                    className="min-h-[48px] px-3.5 py-2 text-xs sm:text-sm font-bold text-stone-600 hover:text-stone-800 flex items-center gap-1.5 rounded-xl cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> 回到换一换
                  </button>
                  <button
                    onClick={() => {
                      sounds.playBell();
                      setStage('choose');
                    }}
                    className="min-h-[56px] px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span>走完一圈了，我自己来选！</span> <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STAGE 3: 自己选 (CHOOSE) ================= */}
        {stage === 'choose' && (isCurrentLeafApproved || adultPreviewUnlocked) && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <span>我来选一个做法</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  原样留下我的话
                </span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">自己选，自己担，没有标准答案</p>
            </div>

            <div className="space-y-3">
              {currentLeaf.choices.map((ch) => {
                const isSelected = selectedChoiceId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedChoiceId(ch.id);
                    }}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'bg-amber-100/70 border-amber-500 shadow-md scale-101'
                        : 'bg-white border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-800">{ch.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-700" />}
                    </div>
                    <p className="text-xs text-stone-600 mt-1">{ch.description}</p>
                    <div className="mt-2 pt-2 border-t border-stone-100 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                      <span className="text-emerald-700">✓ {ch.benefit}</span>
                      <span className="text-stone-500">○ 代价：{ch.cost}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Child custom words input / voice prompt */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
              <label className="text-xs font-bold text-stone-700 block mb-1">
                🗣️ 我选这个，因为我想说（孩子自己的原话）：
              </label>
              <input
                type="text"
                value={customQuote}
                onChange={(e) => setCustomQuote(e.target.value)}
                placeholder="例如：我觉得这样大家都能开心，我也不会憋在心里"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                disabled={!selectedChoiceId}
                onClick={() => {
                  sounds.playBell();
                  markLeafComplete(currentLeaf.id, customQuote);
                  setStage('offscreen');
                }}
                className="min-h-[56px] px-8 py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-base font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>按下“我选这个”并看离屏任务</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 4: 离屏小任务 (OFFSCREEN) ================= */}
        {stage === 'offscreen' && (isCurrentLeafApproved || adultPreviewUnlocked) && (
          <div className="space-y-6">
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-200/80 text-amber-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-stone-800">
                回到生活里试一下（离屏小动作）
              </h3>
              <p className="text-xs text-stone-500">把屏幕关上一小会儿，用真实的小行动感受它</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-md space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🏃‍♂️</span>
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                    今天带走的小动作：
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-stone-800 mt-1 leading-relaxed">
                    {currentLeaf.offscreenTask.action}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-start gap-2.5">
                <span className="text-base">👨‍👩‍👧</span>
                <div>
                  <span className="text-[11px] font-bold text-stone-500">给身边大人的一句悄悄话：</span>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    {currentLeaf.offscreenTask.tipForAdult}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setStage('compare');
                }}
                className="w-full min-h-[56px] py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl text-xs sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>我试好啦，去“回头比一比”两件事哪里像</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 5: 回头比一比 (COMPARE WITH OTHER LEAF) ================= */}
        {stage === 'compare' && (isCurrentLeafApproved || adultPreviewUnlocked) && (
          <div className="space-y-6">
            <div className="text-center py-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto mb-2">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-800">
                回头比一比：这件事，像我们上次的哪件事？
              </h3>
              <p className="text-xs text-stone-500">
                学习科学告诉我们：把两件事放在一起比，方法就真正长在手里了！
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-teal-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  当前叶：{currentLeaf.title}
                </span>
                <span className="text-stone-400">对比 ⇄</span>
                <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                  {currentLeaf.compareWithOtherLeaf.otherLeafTitle}
                </span>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs sm:text-sm font-medium text-teal-900 leading-relaxed">
                “{currentLeaf.compareWithOtherLeaf.question}”
              </div>

              <button
                onClick={() => {
                  sounds.playBell();
                  setCompareAnswered(true);
                }}
                className={`w-full min-h-[48px] p-3 rounded-xl border text-xs sm:text-sm text-left transition-all cursor-pointer ${
                  compareAnswered
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                💡 {compareAnswered ? '已发现核心相同点：' : '点一下揭秘共同的思考小秘密：'}
                <div className="mt-1 font-semibold text-stone-800">
                  {currentLeaf.compareWithOtherLeaf.keyAnalogy}
                </div>
              </button>
            </div>

            {compareAnswered && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-xs text-emerald-800 font-bold animate-in fade-in">
                🌱 太棒啦！你已经不靠死记硬背，而是自己发现了两件事底下的同一套办法！
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReturnToCatalog}
                className="flex-1 min-h-[48px] py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center"
              >
                看其他故事叶
              </button>
              <button
                onClick={handleCloseStoryGrove}
                className="flex-1 min-h-[56px] py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center"
              >
                完成本次探索，回小岛
              </button>
            </div>
          </div>
        )}
      </div>

      <ParentGateModal
        isOpen={isParentGateOpen}
        onClose={() => setIsParentGateOpen(false)}
        onSuccess={() => {
          setIsParentGateOpen(false);
          const token = issueAdultPreviewSession(currentScopeKey);
          setPreviewSessionToken(token || null);
        }}
      />
    </div>
  );
};
