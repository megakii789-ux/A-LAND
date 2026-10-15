import React, { useState, useEffect } from 'react';
import {
  TRANSFER_SCENARIOS,
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
} from '../../../domain/privacy/parentAccess';
import { ParentGateModal } from '../../ParentGateModal';

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
  // 1. 饼干碎屑
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

  // 2. 狗毛 / 爪印
  if (cueId.includes('dog')) {
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

  // 3. 走过去的弟弟 / 人物步子
  if (cueId.includes('brother')) {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <circle cx="16" cy="9" r="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
        <path d="M16 13V21L12 27M16 21L20 27" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 17L16 15L21 17" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 4. 猜想气泡
  if (cueId.includes('thought') || categoryOrPath === 'INFERENCE') {
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

  // 5. 未知秘密
  if (cueId.includes('unknown') || categoryOrPath === 'UNKNOWN') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <rect x="7" y="10" width="18" height="17" rx="3.5" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.8" />
        <path d="M11 10V8C11 5.5 13 4 16 4C19 4 21 5.5 21 8V10" stroke="#0284C7" strokeWidth="1.8" />
        <text x="16" y="22" textAnchor="middle" fontSize="10" fontWeight="900" fill="#0369A1">?</text>
      </svg>
    );
  }

  // 6. 数数轮流玩 (沙漏/秒表)
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

  // 7. 双人跷跷板
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

  // 8. 合作推秋千
  if (cueId.includes('push') || categoryOrPath === 'COOPERATE_PUSH') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <path d="M7 16C12 12 16 12 25 16" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M11 20L15 15L20 20" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="9" r="3" fill="#34D399" />
      </svg>
    );
  }

  // 默认标志
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
  const [showOutcome, setShowOutcome] = useState<boolean>(false);
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
      lockParentAccess();
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

  const handleCloseModal = () => {
    speechNarrator.stop();
    setPreviewSessionToken(null);
    setIsParentGateOpen(false);
    revokeAdultPreviewSession();
    lockParentAccess();
    onClose();
  };

  const handleToggleOption = (optionId: string) => {
    sounds.playClick();
    setChosenOptionIds((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  const handleIncrementAdultPrompt = () => {
    sounds.playClick();
    setAdultPromptCount((prev) => prev + 1);
  };

  const handleCompleteScenario = () => {
    sounds.playClick();
    setShowOutcome(true);
    speechNarrator.speak(currentScenario.objectiveOutcome);
  };

  const handleResetScenario = () => {
    sounds.playClick();
    setChosenOptionIds([]);
    setShowOutcome(false);
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
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                独立生活小情境（无提示检验）
              </h2>
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
          {/* 情境切换 Tab (触控 targets >= 48px) */}
          <div className="flex flex-wrap items-center gap-2">
            {TRANSFER_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setPreviewSessionToken(null);
                  setIsParentGateOpen(false);
                  revokeAdultPreviewSession();
                  lockParentAccess();
                  setSelectedScenarioIndex(idx);
                  handleResetScenario();
                }}
                className={`min-h-[48px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center ${
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
              <span>⚠️ 家长与审阅人预览模式 · 请在成年人陪伴下审阅，尚未面向儿童正式开放</span>
              <span className="text-[10px] bg-amber-200 px-2.5 py-0.5 rounded-full">大人陪伴审阅</span>
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
              {/* 情境描述卡片 (Tactile Illustrated Card) */}
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

              {/* 选项与分类交互 (触控 targets >= 56px 视觉卡片) */}
              <div className="space-y-2.5">
                <h4 className="text-xs sm:text-sm font-black text-stone-700">
                  请选择或标记你认为的线索与动作：
                </h4>

                <div className="space-y-2">
                  {currentScenario.cluesOrChoices.map((item) => {
                    const isSelected = chosenOptionIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
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

              {/* 成人提示次数计数器 (单独记录，无羞耻) */}
              <div className="bg-stone-100/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-700 border border-stone-200">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div>
                    <span className="font-bold">大人陪伴提示记录：</span>
                    <span className="ml-1 text-sm font-black text-amber-800">{adultPromptCount} 次</span>
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

              {/* 客观发现呈现 */}
              {showOutcome && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-2 animate-in fade-in">
                  <h5 className="font-black text-emerald-950 text-sm flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>客观探索发现：</span>
                  </h5>
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
        <div className="bg-stone-100 px-4 py-3 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetScenario}
            className="min-h-[48px] px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs sm:text-sm font-bold hover:bg-stone-50 cursor-pointer flex items-center justify-center"
          >
            重置选择
          </button>

          <button
            type="button"
            onClick={handleCompleteScenario}
            className="min-h-[56px] px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black shadow-md transition-colors cursor-pointer flex items-center justify-center"
          >
            看一看客观结果
          </button>
        </div>
      </div>
    </div>
  );
};
