import React, { useState, useEffect } from 'react';
import {
  TRANSFER_SCENARIOS,
  evaluateTransferScenarioAttempt,
} from '../../../domain/games/transferScenariosLogic';
import { TransferScenarioDefinition } from '../../../domain/games/types';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';

import { ContentAuditRegistry } from '../../../domain/cognitive/ContentAuditRegistry';
import {
  issueAdultPreviewSession,
  isAdultPreviewSessionValid,
  revokeAdultPreviewSession,
  lockParentAccess,
  subscribeParentAccess,
  isInternalPlaytestEnabled,
} from '../../../domain/privacy/parentAccess';
import {
  TransferTaskStatus,
  recordTransferScenarioCompletion,
  recordUnknownHonestyChoice,
} from '../../../domain/cognitive/productExperienceMetrics';
import { ParentGateModal } from '../../ParentGateModal';

const TRANSFER_STATUS_LABELS: Record<TransferTaskStatus, string> = {
  NOT_STARTED: '尚未开始',
  ATTEMPTED: '已尝试选择',
  REFERENCE_VIEWED: '仅查看客观参考',
  COMPLETED_INDEPENDENT: '独立迁移完成',
  COMPLETED_WITH_PROMPT: '陪伴提示下完成',
  ENDED_EARLY: '已自主暂停退出',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isAdultPreview?: boolean;
}

/**
 * 原创矢量线索图标 (替代迁移情境中的 Unicode Emojis)
 */
const TransferCueIcon: React.FC<{
  cueId: string;
  categoryOrPath?: string;
  className?: string;
}> = ({ cueId, categoryOrPath, className = 'w-7 h-7' }) => {
  if (cueId.includes('crumbs')) {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <circle cx="16" cy="16" r="10" fill="#FDE68A" stroke="#B45309" strokeWidth="1.6" />
        <circle cx="13" cy="13" r="1.5" fill="#78350F" />
        <circle cx="19" cy="14" r="1.5" fill="#78350F" />
        <circle cx="15" cy="19" r="1.5" fill="#78350F" />
        <circle cx="8" cy="24" r="1" fill="#B45309" />
        <circle cx="24" cy="22" r="1" fill="#B45309" />
      </svg>
    );
  }

  if (cueId.includes('dog') || cueId.includes('footprints')) {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <ellipse cx="16" cy="18" rx="6" ry="4.5" fill="#FBBF24" />
        <circle cx="11" cy="12" r="2.2" fill="#D97706" />
        <circle cx="15" cy="10" r="2.2" fill="#D97706" />
        <circle cx="19" cy="10" r="2.2" fill="#D97706" />
        <circle cx="23" cy="12" r="2.2" fill="#D97706" />
      </svg>
    );
  }

  if (cueId.includes('brother') || cueId.includes('classes')) {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <circle cx="16" cy="9" r="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
        <path d="M16 13V21L12 27M16 21L20 27" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 17L16 15L21 17" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (cueId.includes('thought') || cueId.includes('blame') || categoryOrPath === 'INFERENCE') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <path
          d="M8 15C6.5 15 5 16.5 5 18.5C5 20.8 7 22.5 9 22.5C9.5 22.5 10 22.3 10.5 22C11.5 23.5 13.5 24.5 16 24.5C19 24.5 21.5 23.2 22.5 21.2C24.5 21 26 19.5 26 17.5C26 15.2 24.2 13.5 22 13.5C21.8 13.5 21.5 13.5 21.2 13.6C20.5 10.5 17.5 8.5 14 8.5C9.5 8.5 6 11.5 6 15.5C6 15.8 6 16.2 6.1 16.5"
          fill="#FEF3C7"
          stroke="#D97706"
          strokeWidth="1.8"
        />
        <circle cx="15" cy="16" r="1.5" fill="#F59E0B" />
        <circle cx="18" cy="16" r="1.5" fill="#F59E0B" />
      </svg>
    );
  }

  if (cueId.includes('unknown') || cueId.includes('uncertainty') || categoryOrPath === 'UNKNOWN') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <rect x="7" y="10" width="18" height="17" rx="3.5" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.8" />
        <path d="M11 10V8C11 5.5 13 4 16 4C19 4 21 5.5 21 8V10" stroke="#0284C7" strokeWidth="1.8" />
        <text x="16" y="22" textAnchor="middle" fontSize="10" fontWeight="900" fill="#0369A1">?</text>
      </svg>
    );
  }

  if (cueId.includes('count') || categoryOrPath === 'TAKE_TURNS') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <circle cx="16" cy="17" r="10" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.8" />
        <line x1="16" y1="17" x2="16" y2="11" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="17" x2="20" y2="17" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="14" y="4" width="4" height="3" rx="1" fill="#D97706" />
      </svg>
    );
  }

  if (cueId.includes('seesaw') || categoryOrPath === 'ALTERNATIVE_TOGETHER') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <polygon points="16,21 12,27 20,27" fill="#0284C7" stroke="#0369A1" strokeWidth="1.2" />
        <line x1="6" y1="18" x2="26" y2="22" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="8" cy="15" r="2.5" fill="#F43F5E" />
        <circle cx="24" cy="19" r="2.5" fill="#10B981" />
      </svg>
    );
  }

  if (cueId.includes('push') || categoryOrPath === 'COOPERATE_PUSH') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <path d="M7 16C12 12 16 12 25 16" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M11 20L15 15L20 20" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="9" r="3" fill="#34D399" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <circle cx="16" cy="16" r="11" fill="#D1FAE5" stroke="#059669" strokeWidth="1.8" />
      <polyline points="11,16 15,20 22,12" stroke="#047857" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const TransferScenariosModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [adultPromptCount, setAdultPromptCount] = useState<number>(0);
  const [chosenOptionIds, setChosenOptionIds] = useState<string[]>([]);
  const [taskStatus, setTaskStatus] = useState<TransferTaskStatus>('NOT_STARTED');
  const [showOutcome, setShowOutcome] = useState<boolean>(false);
  const [evaluationNote, setEvaluationNote] = useState<string | null>(null);
  const [hasPriorReferenceOrErrorByScenario, setHasPriorReferenceOrErrorByScenario] = useState<
    Record<string, boolean>
  >({});
  const [previewSessionToken, setPreviewSessionToken] = useState<string | null>(null);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [, setAccessVersion] = useState(0);

  useEffect(() => {
    return subscribeParentAccess(() => {
      setAccessVersion((v) => v + 1);
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPreviewSessionToken(null);
      setIsParentGateOpen(false);
      revokeAdultPreviewSession();
      if (!isInternalPlaytestEnabled()) {
        lockParentAccess();
      }
    }
    return () => {
      revokeAdultPreviewSession();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentScenario: TransferScenarioDefinition = TRANSFER_SCENARIOS[selectedScenarioIndex];
  const currentScopeKey = `transfer:${currentScenario.id}`;
  const isScenarioApproved = ContentAuditRegistry.canRenderContent(currentScenario.id);
  const adultPreviewUnlocked = isAdultPreviewSessionValid(currentScopeKey, previewSessionToken);
  const hadPriorReferenceOrError = Boolean(hasPriorReferenceOrErrorByScenario[currentScenario.id]);

  const handleCloseModal = () => {
    speechNarrator.stop();
    if (taskStatus === 'NOT_STARTED' || taskStatus === 'ATTEMPTED') {
      setTaskStatus('ENDED_EARLY');
    }
    setPreviewSessionToken(null);
    setIsParentGateOpen(false);
    revokeAdultPreviewSession();
    if (!isInternalPlaytestEnabled()) {
      lockParentAccess();
    }
    onClose();
  };

  const handleToggleOption = (optionId: string) => {
    sounds.playClick();
    setEvaluationNote(null);
    setChosenOptionIds((prev) => {
      const next = prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId];
      if (next.length > 0 && (taskStatus === 'NOT_STARTED' || taskStatus === 'REFERENCE_VIEWED' || taskStatus === 'ENDED_EARLY')) {
        setTaskStatus('ATTEMPTED');
      } else if (next.length === 0 && taskStatus === 'ATTEMPTED') {
        setTaskStatus('NOT_STARTED');
      }
      return next;
    });
  };

  const handleIncrementAdultPrompt = () => {
    sounds.playClick();
    setAdultPromptCount((prev) => prev + 1);
  };

  /**
   * Sprint 1.2 任务四：修复迁移实验的伪独立完成
   * 1. 若 0 选择直接点击“看一看客观结果”，仅记为 REFERENCE_VIEWED，并标记已看过参考；
   * 2. 调用 evaluateTransferScenarioAttempt 检查特定任务目标（事实辨析需同时包含事实与未知、协商需可执行安排与限制认识、不确定性任务允许“现在无法确定”）；
   * 3. 提前查看参考答案或提交错误判断后看过完整解析，后续重做通过一律记为 COMPLETED_WITH_PROMPT，不得记为 COMPLETED_INDEPENDENT。
   */
  const handleCompleteScenario = () => {
    sounds.playClick();

    if (chosenOptionIds.length === 0) {
      setShowOutcome(true);
      setTaskStatus('REFERENCE_VIEWED');
      setHasPriorReferenceOrErrorByScenario((prev) => ({
        ...prev,
        [currentScenario.id]: true,
      }));
      setEvaluationNote(
        '你还没有勾选任何线索或方案就打开了参考结果，本次仅记录为「参考查看」，不会计入迁移完成哦！即使随后重做，也将诚实记为「参考/提示后完成」。'
      );
      recordTransferScenarioCompletion(currentScenario.id, adultPromptCount, {
        status: 'REFERENCE_VIEWED',
        selectedOptionCount: 0,
        isGoalMet: false,
        hadPriorReferenceOrErrorExplanation: true,
      });
      speechNarrator.speak(currentScenario.objectiveOutcome);
      return;
    }

    const attemptEval = evaluateTransferScenarioAttempt(currentScenario, chosenOptionIds);

    if (attemptEval.hasSelectedUnknownOption) {
      recordUnknownHonestyChoice(`transfer:${currentScenario.id}`);
    }

    if (!attemptEval.isGoalMet) {
      setShowOutcome(true);
      setTaskStatus('ATTEMPTED');
      setHasPriorReferenceOrErrorByScenario((prev) => ({
        ...prev,
        [currentScenario.id]: true,
      }));
      setEvaluationNote(attemptEval.feedbackMessage);
      recordTransferScenarioCompletion(currentScenario.id, adultPromptCount, {
        status: 'ATTEMPTED',
        selectedOptionCount: chosenOptionIds.length,
        isGoalMet: false,
        hadPriorReferenceOrErrorExplanation: true,
      });
      speechNarrator.speak(attemptEval.feedbackMessage);
      return;
    }

    setShowOutcome(true);
    const finalStatus: TransferTaskStatus =
      adultPromptCount === 0 && !hadPriorReferenceOrError
        ? 'COMPLETED_INDEPENDENT'
        : 'COMPLETED_WITH_PROMPT';
    setTaskStatus(finalStatus);
    setEvaluationNote(null);
    recordTransferScenarioCompletion(currentScenario.id, adultPromptCount, {
      status: finalStatus,
      selectedOptionCount: chosenOptionIds.length,
      isGoalMet: true,
      hadPriorReferenceOrErrorExplanation: hadPriorReferenceOrError,
    });
    speechNarrator.speak(currentScenario.objectiveOutcome);
  };

  const handleEndEarly = () => {
    sounds.playClick();
    setTaskStatus('ENDED_EARLY');
    setShowOutcome(false);
    setEvaluationNote('已记录为「自主暂停 / 暂不作答」，不计入迁移完成统计。');
  };

  // 修复跨任务提示次数污染：切换或重置情境时同步清空当前勾选，但保留同一任务已看过参考/错误解析的记录
  const handleResetScenario = () => {
    sounds.playClick();
    setChosenOptionIds([]);
    setShowOutcome(false);
    setEvaluationNote(null);
    setAdultPromptCount(0);
    setTaskStatus('NOT_STARTED');
  };

  const handleRequestAdultPreview = () => {
    sounds.playClick();
    setPreviewSessionToken(null);
    revokeAdultPreviewSession();
    lockParentAccess();
    setIsParentGateOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-50 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border-2 border-stone-300 shadow-2xl overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="bg-linear-to-r from-amber-100 to-sky-100 px-4 py-3 flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200/90 flex items-center justify-center text-amber-900 font-black shadow-xs">
              <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true" fill="none">
                <path d="M16 27V12" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M16 14C12 11 8 13 8 18C13 18 15 16 16 14Z" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
                <path d="M16 17C20 14 24 16 24 21C19 21 17 19 16 17Z" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-stone-900">
                  独立生活小情境（无提示检验）
                </h2>
                <span
                  data-testid="transfer-task-status-badge"
                  data-status={taskStatus}
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                    taskStatus === 'COMPLETED_INDEPENDENT' || taskStatus === 'COMPLETED_WITH_PROMPT'
                      ? 'bg-emerald-600 text-white'
                      : taskStatus === 'REFERENCE_VIEWED' || taskStatus === 'ENDED_EARLY'
                        ? 'bg-stone-300 text-stone-800'
                        : 'bg-amber-200 text-amber-950'
                  }`}
                >
                  {TRANSFER_STATUS_LABELS[taskStatus]}
                </span>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                未受训练新情境 · 零方法名称透露 · 客观观察记录
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            className="min-w-[48px] min-h-[48px] p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 text-lg font-black flex items-center justify-center cursor-pointer transition-colors"
            aria-label="关闭情境"
          >
            ✕
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* 情境切换 Tab */}
          <div className="flex flex-wrap items-center gap-2">
            {TRANSFER_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                type="button"
                data-testid={`transfer-scenario-tab-${idx + 1}`}
                onClick={() => {
                  sounds.playClick();
                  setPreviewSessionToken(null);
                  setIsParentGateOpen(false);
                  revokeAdultPreviewSession();
                  if (!isInternalPlaytestEnabled()) {
                    lockParentAccess();
                  }
                  setSelectedScenarioIndex(idx);
                  handleResetScenario();
                }}
                className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center ${
                  selectedScenarioIndex === idx
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white border-2 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                情境 {idx + 1}：{sc.title}
              </button>
            ))}
          </div>

          {adultPreviewUnlocked && !isScenarioApproved && (
            <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black px-3.5 py-2 rounded-2xl flex flex-wrap items-center justify-between gap-2">
              <span>
                {isInternalPlaytestEnabled()
                  ? '🧪 内部研发连续试玩模式 · 正式审核状态仍为 PENDING_REVIEW'
                  : '⚠️ 家长与审阅人预览模式 · 请在成年人陪伴下审阅，尚未面向儿童正式开放'}
              </span>
              <span className="text-[10px] bg-amber-200 px-2.5 py-0.5 rounded-full">
                {isInternalPlaytestEnabled() ? '内部试玩中' : '大人陪伴审阅'}
              </span>
            </div>
          )}

          {!isScenarioApproved && !adultPreviewUnlocked ? (
            <div data-testid="audit-gate-blocked" className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-200 text-center space-y-3">
              <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true" fill="none">
                  <path d="M16 27V12" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M16 14C12 11 8 13 8 18C13 18 15 16 16 14Z" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
                  <path d="M16 17C20 14 24 16 24 21C19 21 17 19 16 17Z" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-black text-amber-950">这个小情境正在做最后准备</h3>
              <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed">
                「{currentScenario.title}」正在由大人们做最后的安全检查，准备好后再陪你一起尝试。现在可以先回小岛去玩其他开放的活动哦！
              </p>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="min-h-[56px] px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm cursor-pointer shadow-sm flex items-center justify-center"
                >
                  回小岛玩其他活动
                </button>
                <button
                  type="button"
                  onClick={handleRequestAdultPreview}
                  className="min-h-[48px] px-5 py-2.5 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 font-bold rounded-2xl text-xs cursor-pointer flex items-center justify-center"
                >
                  家长 / 审阅人验证预览
                </button>
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
          ) : (
            <>
              {/* 情境描述卡片 */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 sm:p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {currentScenario.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-bold">
                  {currentScenario.surfaceSituation}
                </p>
                <p className="text-xs text-stone-500 font-medium">
                  {currentScenario.promptSpokenText}
                </p>
              </div>

              {/* 选项与分类交互 */}
              <div className="space-y-2.5">
                <h4 className="text-xs sm:text-sm font-black text-stone-700">
                  请先勾选你认同的客观事实或解决做法（至少选 1 项后再验证）：
                </h4>

                <div className="space-y-2">
                  {currentScenario.cluesOrChoices.map((item) => {
                    const isSelected = chosenOptionIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-testid={`transfer-option-${item.id}`}
                        onClick={() => handleToggleOption(item.id)}
                        className={`w-full min-h-[56px] p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 border-amber-500 shadow-xs ring-2 ring-amber-300'
                            : 'bg-white border-stone-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                            <TransferCueIcon cueId={item.id} categoryOrPath={item.categoryOrPath} className="w-7 h-7" />
                          </div>
                          <span className="text-xs sm:text-sm font-black text-stone-800 leading-snug">
                            {item.label}
                          </span>
                        </div>
                        <span className={`text-xs font-black px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-400 text-stone-900'
                            : 'bg-stone-100 text-stone-500'
                        }`}>
                          {isSelected ? '✓ 已标记' : '点击标记'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 成人提示次数计数器 */}
              <div className="bg-stone-100/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-700 border border-stone-200">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div>
                    <span className="font-bold">大人陪伴提示记录：</span>
                    <span data-testid="adult-prompt-count-value" className="ml-1 text-sm font-black text-amber-800">{adultPromptCount} 次</span>
                    <span className="text-stone-400 ml-2">（仅作客观观察记录）</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleIncrementAdultPrompt}
                  className="min-h-[48px] px-3.5 py-2 bg-white border border-stone-300 rounded-xl font-bold text-stone-800 hover:bg-stone-50 cursor-pointer shadow-2xs flex items-center justify-center"
                >
                  + 记录一次大人提示
                </button>
              </div>

              {evaluationNote && (
                <div
                  data-testid="transfer-evaluation-note"
                  className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs sm:text-sm font-bold text-amber-950"
                >
                  💡 {evaluationNote}
                </div>
              )}

              {/* 客观发现呈现（严格区分 REFERENCE_VIEWED / ATTEMPTED / COMPLETED_INDEPENDENT / COMPLETED_WITH_PROMPT） */}
              {showOutcome && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h5 className="font-black text-emerald-950 text-sm flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <span>客观探索发现：</span>
                    </h5>
                    {taskStatus === 'REFERENCE_VIEWED' || taskStatus === 'ATTEMPTED' ? (
                      <span
                        data-testid="transfer-reference-only-badge"
                        className="text-xs font-extrabold px-2.5 py-1 rounded-full border bg-stone-200 text-stone-800 border-stone-300"
                      >
                        📖 仅查看参考（未计入迁移完成）
                      </span>
                    ) : (
                      <span
                        data-testid="transfer-independence-badge"
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                          taskStatus === 'COMPLETED_INDEPENDENT'
                            ? 'bg-amber-100 text-amber-950 border-amber-300'
                            : 'bg-sky-100 text-sky-900 border-sky-300'
                        }`}
                      >
                        {taskStatus === 'COMPLETED_INDEPENDENT'
                          ? '🌟 独立迁移完成（0 次提示）'
                          : `🤝 陪伴提示下完成（${adultPromptCount} 次提示）`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-bold">
                    {currentScenario.objectiveOutcome}
                  </p>
                  <div className="text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-200 font-medium">
                    研究记录说明：此情境仅作为未提示迁移能力的开放性观察，不自动认定孩子已稳固掌握此心理能力。
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 底部按钮栏 */}
        <div className="bg-stone-100 px-4 py-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetScenario}
              className="min-h-[48px] px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs sm:text-sm font-bold hover:bg-stone-50 cursor-pointer flex items-center justify-center"
            >
              重置选择
            </button>
            <button
              type="button"
              data-testid="transfer-end-early-btn"
              onClick={handleEndEarly}
              className="min-h-[48px] px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-600 text-xs sm:text-sm font-bold hover:bg-stone-50 cursor-pointer flex items-center justify-center"
            >
              暂不作答
            </button>
          </div>

          <button
            type="button"
            data-testid="transfer-submit-or-view-btn"
            onClick={handleCompleteScenario}
            className="min-h-[56px] px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black shadow-md transition-colors cursor-pointer flex items-center justify-center"
          >
            {chosenOptionIds.length > 0 ? '确认选择并看客观结果' : '看一看客观结果'}
          </button>
        </div>
      </div>
    </div>
  );
};
