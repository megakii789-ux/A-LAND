import React, { useState } from 'react';
import { CrayonDetectiveGame } from './CrayonDetectiveGame/CrayonDetectiveGame';
import { FriendAsksHomeGame } from './FriendAsksHomeGame/FriendAsksHomeGame';
import { ToyBoatNegotiationGame } from './ToyBoatNegotiationGame/ToyBoatNegotiationGame';
import { TransferScenariosModal } from './TransferLab/TransferScenariosModal';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';

import { ContentAuditRegistry } from '../../domain/cognitive/ContentAuditRegistry';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialGame?: 'detective' | 'friend_asks' | 'boat' | 'transfer';
}

export const InteractiveGamesHubModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialGame = 'detective',
}) => {
  const [activeGame, setActiveGame] = useState<'detective' | 'friend_asks' | 'boat' | 'transfer'>(
    initialGame
  );
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const [adultPreviewUnlocked, setAdultPreviewUnlocked] = useState(false);

  if (!isOpen) return null;

  const isDetectiveApproved = ContentAuditRegistry.canRenderContent('game_crayon_detective');
  const isFriendAsksApproved = ContentAuditRegistry.canRenderContent('game_friend_asks_home');
  const isBoatApproved = ContentAuditRegistry.canRenderContent('game_toy_boat');

  const isCurrentGameApproved =
    activeGame === 'detective'
      ? isDetectiveApproved
      : activeGame === 'friend_asks'
      ? isFriendAsksApproved
      : activeGame === 'boat'
      ? isBoatApproved
      : true;

  const handleSwitchGame = (game: 'detective' | 'friend_asks' | 'boat' | 'transfer') => {
    sounds.playClick();
    speechNarrator.stop();
    setAdultPreviewUnlocked(false);
    if (game === 'transfer') {
      setIsTransferOpen(true);
    } else {
      setActiveGame(game);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-100 rounded-3xl max-w-4xl w-full max-h-[96vh] flex flex-col shadow-2xl border-2 border-stone-300 overflow-hidden animate-in fade-in">
        {/* 顶部主导航控制栏 */}
        <div className="bg-white px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">🎮</span>
            <div>
              <h2 className="text-base sm:text-xl font-black text-stone-900">
                真实动动手探险岛
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500">
                低识字量优先 · 真实物理交互 · 无对错打分
              </p>
            </div>
          </div>

          {/* 游戏切换标签 */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => handleSwitchGame('detective')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1 ${
                activeGame === 'detective'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>🖍️ 蜡笔侦探</span>
              {!isDetectiveApproved && (
                <span className="text-[10px] px-1 py-0.2 bg-stone-200/90 text-stone-800 rounded font-normal">待审</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGame('friend_asks')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1 ${
                activeGame === 'friend_asks'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>💬 问起我的家</span>
              {!isFriendAsksApproved && (
                <span className="text-[10px] px-1 py-0.2 bg-stone-200/90 text-stone-800 rounded font-normal">待审</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGame('boat')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1 ${
                activeGame === 'boat'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>⛵ 小船协商</span>
              {!isBoatApproved && (
                <span className="text-[10px] px-1 py-0.2 bg-stone-200/90 text-stone-800 rounded font-normal">待审</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGame('transfer')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
            >
              🌱 独立迁移
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 text-lg font-black ml-1"
              aria-label="关闭游戏集"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 动态游戏主体展示 */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {!isCurrentGameApproved && !adultPreviewUnlocked ? (
            <div
              data-testid="interactive-game-audit-gate-blocked"
              className="p-6 sm:p-8 bg-amber-50 rounded-2xl border-2 border-amber-300 text-center space-y-3 my-4"
            >
              <span className="text-3xl block">🛡️</span>
              <h3 className="text-base sm:text-lg font-black text-amber-950">
                待独立专家审核 · 互动内容安全隔离
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                当前游戏组件尚未完成外部独立心理与伦理专家审批。为防止未审内容流向儿童，儿童运行时已被安全阻断。
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdultPreviewUnlocked(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-xs"
                >
                  成人专家审查预览
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl text-xs sm:text-sm cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          ) : (
            <>
              {adultPreviewUnlocked && !isCurrentGameApproved && (
                <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold px-3 py-2 rounded-xl mb-3 flex items-center justify-between">
                  <span>⚠️ 成人专家审查预览模式 · 未获独立审批前严禁作为儿童正式使用</span>
                  <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded">PENDING_REVIEW</span>
                </div>
              )}
              {activeGame === 'detective' && (
                <CrayonDetectiveGame onExit={onClose} />
              )}
              {activeGame === 'friend_asks' && (
                <FriendAsksHomeGame onExit={onClose} />
              )}
              {activeGame === 'boat' && (
                <ToyBoatNegotiationGame onExit={onClose} />
              )}
            </>
          )}
        </div>

        {/* 迁移实验室弹窗 */}
        <TransferScenariosModal
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
        />
      </div>
    </div>
  );
};

