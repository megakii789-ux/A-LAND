import React, { useState } from 'react';
import { CrayonDetectiveGame } from './CrayonDetectiveGame/CrayonDetectiveGame';
import { FriendAsksHomeGame } from './FriendAsksHomeGame/FriendAsksHomeGame';
import { ToyBoatNegotiationGame } from './ToyBoatNegotiationGame/ToyBoatNegotiationGame';
import { TransferScenariosModal } from './TransferLab/TransferScenariosModal';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';

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

  if (!isOpen) return null;

  const handleSwitchGame = (game: 'detective' | 'friend_asks' | 'boat' | 'transfer') => {
    sounds.playClick();
    speechNarrator.stop();
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
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeGame === 'detective'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              🖍️ 蜡笔侦探
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGame('friend_asks')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeGame === 'friend_asks'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              💬 问起我的家
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGame('boat')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeGame === 'boat'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              ⛵ 小船协商
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
          {activeGame === 'detective' && (
            <CrayonDetectiveGame onExit={onClose} />
          )}
          {activeGame === 'friend_asks' && (
            <FriendAsksHomeGame onExit={onClose} />
          )}
          {activeGame === 'boat' && (
            <ToyBoatNegotiationGame onExit={onClose} />
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
