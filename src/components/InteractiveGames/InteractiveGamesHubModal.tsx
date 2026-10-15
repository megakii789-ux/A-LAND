import React, { useState, useEffect } from 'react';
import { CrayonDetectiveGame } from './CrayonDetectiveGame/CrayonDetectiveGame';
import { FriendAsksHomeGame } from './FriendAsksHomeGame/FriendAsksHomeGame';
import { ToyBoatNegotiationGame } from './ToyBoatNegotiationGame/ToyBoatNegotiationGame';
import { TransferScenariosModal } from './TransferLab/TransferScenariosModal';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';
import { ContentAuditRegistry } from '../../domain/cognitive/ContentAuditRegistry';
import {
  issueAdultPreviewSession,
  isAdultPreviewSessionValid,
  revokeAdultPreviewSession,
  lockParentAccess,
  subscribeParentAccess,
  isInternalPlaytestEnabled,
  enableInternalPlaytestMode,
  disableInternalPlaytestMode,
} from '../../domain/privacy/parentAccess';
import { ParentGateModal } from '../ParentGateModal';

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

  const [previewSessionToken, setPreviewSessionToken] = useState<string | null>(null);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [pendingPlaytestActivation, setPendingPlaytestActivation] = useState(false);
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
      setPendingPlaytestActivation(false);
      setIsTransferOpen(false);
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

  const currentScopeKey =
    activeGame === 'detective'
      ? 'game_crayon_detective'
      : activeGame === 'friend_asks'
      ? 'game_friend_asks_home'
      : activeGame === 'boat'
      ? 'game_toy_boat'
      : 'game_transfer_lab';

  const playtestActive = isInternalPlaytestEnabled();
  const adultPreviewUnlocked = isAdultPreviewSessionValid(currentScopeKey, previewSessionToken);

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

  const handleCloseHub = () => {
    speechNarrator.stop();
    setPreviewSessionToken(null);
    setIsParentGateOpen(false);
    setPendingPlaytestActivation(false);
    setIsTransferOpen(false);
    revokeAdultPreviewSession();
    if (!isInternalPlaytestEnabled()) {
      lockParentAccess();
    }
    onClose();
  };

  const handleSwitchGame = (game: 'detective' | 'friend_asks' | 'boat' | 'transfer') => {
    sounds.playClick();
    speechNarrator.stop();
    setPreviewSessionToken(null);
    setIsParentGateOpen(false);
    setPendingPlaytestActivation(false);
    revokeAdultPreviewSession();
    if (!isInternalPlaytestEnabled()) {
      lockParentAccess();
    }
    if (game === 'transfer') {
      setIsTransferOpen(true);
    } else {
      setIsTransferOpen(false);
      setActiveGame(game);
    }
  };

  const handleRequestAdultPreview = () => {
    sounds.playClick();
    setPreviewSessionToken(null);
    setPendingPlaytestActivation(false);
    revokeAdultPreviewSession();
    lockParentAccess();
    setIsParentGateOpen(true);
  };

  const handleRequestInternalPlaytest = () => {
    sounds.playClick();
    setPreviewSessionToken(null);
    setPendingPlaytestActivation(true);
    revokeAdultPreviewSession();
    lockParentAccess();
    setIsParentGateOpen(true);
  };

  const handleExitInternalPlaytest = () => {
    sounds.playClick();
    setPreviewSessionToken(null);
    disableInternalPlaytestMode();
    revokeAdultPreviewSession();
    lockParentAccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-100 rounded-3xl max-w-4xl w-full max-h-[96vh] flex flex-col shadow-2xl border-2 border-stone-300 overflow-hidden">
        {/* 顶部主导航控制栏 */}
        <div className="bg-white px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-stone-200 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl shrink-0" aria-hidden="true">🎮</span>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-black text-stone-900 truncate">
                  真实动动手探险岛
                </h2>
                <p className="text-[11px] sm:text-xs text-stone-500 truncate">
                  低识字量优先 · 真实物理交互 · 无对错打分
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseHub}
              className="min-w-[44px] min-h-[44px] p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 text-base font-black flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="关闭游戏集"
            >
              ✕
            </button>
          </div>

          {/* 游戏切换标签（移动端自动折行，避免 360px 横向挤压） */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => handleSwitchGame('detective')}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeGame === 'detective'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>🖍️ 蜡笔侦探</span>
              {!isDetectiveApproved && (
                <span className="text-[10px] px-1.5 py-0.5 bg-stone-200/90 text-stone-800 rounded font-medium">准备中</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGame('friend_asks')}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeGame === 'friend_asks'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>💬 问起我的家</span>
              {!isFriendAsksApproved && (
                <span className="text-[10px] px-1.5 py-0.5 bg-stone-200/90 text-stone-800 rounded font-medium">准备中</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGame('boat')}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeGame === 'boat'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>⛵ 小船协商</span>
              {!isBoatApproved && (
                <span className="text-[10px] px-1.5 py-0.5 bg-stone-200/90 text-stone-800 rounded font-medium">准备中</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGame('transfer')}
              className="min-h-[44px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer"
            >
              🌱 独立迁移
            </button>
          </div>
        </div>

        {/* 动态游戏主体展示 */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {!isCurrentGameApproved && !adultPreviewUnlocked ? (
            <div
              data-testid="interactive-game-audit-gate-blocked"
              className="p-5 sm:p-8 bg-amber-50 rounded-2xl border-2 border-amber-200 text-center space-y-4 my-3 max-w-xl mx-auto"
            >
              <span className="text-3xl block" aria-hidden="true">🌱</span>
              <h3 className="text-base sm:text-lg font-black text-amber-950">
                这个小游戏正在做最后准备
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 max-w-md mx-auto leading-relaxed font-medium">
                大人们正在为这个互动小游戏做最后的安全检查，准备好后再陪你一起玩。现在你可以先回小岛去呼吸角、晴雨气象台或做一件找回勇气的小事哦！
              </p>
              <div className="pt-2 flex flex-col sm:flex-row flex-wrap justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseHub}
                  className="min-h-[56px] px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm cursor-pointer shadow-sm"
                >
                  回小岛玩其他活动
                </button>
                <button
                  type="button"
                  onClick={handleRequestAdultPreview}
                  className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 font-bold rounded-2xl text-xs cursor-pointer"
                >
                  家长 / 审阅人验证预览
                </button>
                <button
                  type="button"
                  data-testid="enable-internal-playtest-btn"
                  onClick={handleRequestInternalPlaytest}
                  className="min-h-[44px] px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold rounded-2xl text-xs cursor-pointer"
                >
                  🧪 开启内部研发连续试玩（需 PIN）
                </button>
              </div>
            </div>
          ) : (
            <>
              {adultPreviewUnlocked && !isCurrentGameApproved && (
                <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold px-3 py-2 rounded-xl mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {playtestActive
                      ? '🧪 内部研发连续试玩模式 · 正式审核状态仍为 PENDING_REVIEW（未向儿童开放）'
                      : '⚠️ 家长与审阅人预览模式 · 请在成年人陪伴下审阅，尚未面向儿童正式开放'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full">
                      {playtestActive ? '连续试玩已激活' : '大人陪伴审阅'}
                    </span>
                    {playtestActive && (
                      <button
                        type="button"
                        data-testid="exit-internal-playtest-btn"
                        onClick={handleExitInternalPlaytest}
                        className="text-[11px] bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-lg font-black cursor-pointer"
                      >
                        退出试玩
                      </button>
                    )}
                  </div>
                </div>
              )}
              {activeGame === 'detective' && (
                <CrayonDetectiveGame
                  onExit={handleCloseHub}
                  isAdultPreview={adultPreviewUnlocked}
                  previewSessionToken={previewSessionToken}
                  onOpenTransferLab={() => setIsTransferOpen(true)}
                />
              )}
              {activeGame === 'friend_asks' && (
                <FriendAsksHomeGame
                  onExit={handleCloseHub}
                  isAdultPreview={adultPreviewUnlocked}
                  previewSessionToken={previewSessionToken}
                />
              )}
              {activeGame === 'boat' && (
                <ToyBoatNegotiationGame
                  onExit={handleCloseHub}
                  isAdultPreview={adultPreviewUnlocked}
                  previewSessionToken={previewSessionToken}
                />
              )}
            </>
          )}
        </div>

        {/* 迁移实验室弹窗 */}
        <TransferScenariosModal
          isOpen={isTransferOpen}
          onClose={() => {
            setIsTransferOpen(false);
            setPreviewSessionToken(null);
            revokeAdultPreviewSession();
            if (!isInternalPlaytestEnabled()) {
              lockParentAccess();
            }
          }}
        />

        <ParentGateModal
          isOpen={isParentGateOpen}
          onClose={() => {
            setIsParentGateOpen(false);
            setPendingPlaytestActivation(false);
          }}
          onSuccess={() => {
            setIsParentGateOpen(false);
            if (pendingPlaytestActivation) {
              enableInternalPlaytestMode();
              setPendingPlaytestActivation(false);
            }
            const token = issueAdultPreviewSession(currentScopeKey);
            setPreviewSessionToken(token || null);
          }}
        />
      </div>
    </div>
  );
};
