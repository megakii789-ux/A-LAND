import React, { useState } from 'react';
import {
  TRANSFER_SCENARIOS,
} from '../../../domain/games/transferScenariosLogic';
import { TransferScenarioDefinition } from '../../../domain/games/types';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferScenariosModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [adultPromptCount, setAdultPromptCount] = useState<number>(0);
  const [chosenOptionIds, setChosenOptionIds] = useState<string[]>([]);
  const [showOutcome, setShowOutcome] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentScenario: TransferScenarioDefinition = TRANSFER_SCENARIOS[selectedScenarioIndex];

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

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-50 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border-2 border-stone-300 shadow-2xl overflow-hidden animate-in fade-in">
        {/* 顶部标题栏 */}
        <div className="bg-linear-to-r from-amber-100 to-sky-100 px-4 py-3 flex items-center justify-between border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🌱</span>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                独立生活小情境（无提示检验）
              </h2>
            </div>
            <p className="text-xs text-stone-600">
              未受训练新情境 · 零方法名称透露 · 客观观察记录
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 text-lg font-black"
            aria-label="关闭情境"
          >
            ✕
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* 情境切换 Tab */}
          <div className="flex items-center gap-2">
            {TRANSFER_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedScenarioIndex(idx);
                  handleResetScenario();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedScenarioIndex === idx
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                情境 {idx + 1}：{sc.title}
              </button>
            ))}
          </div>

          {/* 情境描述卡片 */}
          <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 space-y-2 shadow-2xs">
            <h3 className="text-base sm:text-lg font-black text-stone-900">
              {currentScenario.title}
            </h3>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-medium">
              {currentScenario.surfaceSituation}
            </p>
            <p className="text-xs text-stone-500">
              {currentScenario.promptSpokenText}
            </p>
          </div>

          {/* 选项与分类交互 */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-stone-700">
              请选择或分类你认为的线索与动作：
            </h4>

            <div className="space-y-2">
              {currentScenario.cluesOrChoices.map((item) => {
                const isSelected = chosenOptionIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleOption(item.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl shrink-0" aria-hidden="true">{item.icon}</span>
                      <span className="text-xs sm:text-sm font-bold text-stone-800">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-stone-400">
                      {isSelected ? '✓ 已标记' : '点击标记'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 成人提示次数计数器 (单独记录，无羞耻) */}
          <div className="bg-stone-100/80 rounded-xl p-3 flex items-center justify-between text-xs text-stone-600 border border-stone-200">
            <div>
              <span className="font-bold">大人陪伴提示次数：</span>
              <span className="ml-1 text-sm font-black text-amber-700">{adultPromptCount} 次</span>
            </div>
            <button
              type="button"
              onClick={handleIncrementAdultPrompt}
              className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg font-bold text-stone-700 hover:bg-stone-50"
            >
              + 记录一次大人提示
            </button>
          </div>

          {/* 客观发现呈现 */}
          {showOutcome && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-2 animate-in fade-in">
              <h5 className="font-black text-emerald-950 text-sm flex items-center gap-1.5">
                <span>🔍 客观探索结果：</span>
              </h5>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
                {currentScenario.objectiveOutcome}
              </p>
              <div className="text-[11px] text-emerald-700 bg-white/70 p-2 rounded-lg border border-emerald-200">
                📌 研究记录说明：此情境仅作为未提示迁移能力的开放性观察，不自动认定孩子已稳固掌握此心理能力。
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮栏 */}
        <div className="bg-stone-100 px-4 py-3 border-t border-stone-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleResetScenario}
            className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs sm:text-sm font-bold hover:bg-stone-50"
          >
            重置选择
          </button>

          <button
            type="button"
            onClick={handleCompleteScenario}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black shadow-md transition-colors"
          >
            看一看客观结果 ✨
          </button>
        </div>
      </div>
    </div>
  );
};
