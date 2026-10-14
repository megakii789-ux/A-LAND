import React, { useState, useEffect } from 'react';
import {
  NEGOTIATION_ITEMS,
  NEGOTIATION_PATHS_DETAILS,
  NegotiableItem,
} from '../../../domain/games/toyBoatNegotiationLogic';
import { NegotiationSolutionPath, NegotiationResultDetails } from '../../../domain/games/types';
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

const SCOPE_KEY = 'game_toy_boat';

interface Props {
  onExit: () => void;
  isAdultPreview?: boolean;
  previewSessionToken?: string | null;
}

export const ToyBoatNegotiationGame: React.FC<Props> = ({
  onExit,
  previewSessionToken = null,
}) => {
  const [localSessionToken, setLocalSessionToken] = useState<string | null>(null);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [, setAccessVersion] = useState(0);

  useEffect(() => {
    return subscribeParentAccess(() => {
      setAccessVersion((v) => v + 1);
    });
  }, []);

  useEffect(() => {
    return () => {
      revokeAdultPreviewSession(SCOPE_KEY);
    };
  }, []);

  const effectiveToken = previewSessionToken ?? localSessionToken;
  const adultPreviewUnlocked = isAdultPreviewSessionValid(SCOPE_KEY, effectiveToken);
  const isApproved = ContentAuditRegistry.canRenderContent('game_toy_boat');

  // 当前放置在协商舞台（池塘水边）上的道具 ID
  const [activeItemIds, setActiveItemIds] = useState<string[]>(['item_boat']);
  // 选中的道具（用于点击放置模式）
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // 当前激活的协商方案
  const [activePath, setActivePath] = useState<NegotiationSolutionPath>('TAKE_TURNS');
  // 动画模拟状态
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // 轮流状态（0: 小兔玩; 1: 小熊玩）
  const [turnIndex, setTurnIndex] = useState<number>(0);

  useEffect(() => {
    speechNarrator.speak(
      '池塘边有一只漂亮的小木船，小兔和小熊都想玩。我们试试把不同的道具放进池塘，看看能商量出什么好办法！'
    );
    return () => {
      speechNarrator.stop();
    };
  }, []);

  // 计时器轮流轮换模拟
  useEffect(() => {
    if (activePath !== 'TAKE_TURNS') return;
    const interval = setInterval(() => {
      setTurnIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, [activePath]);

  // 切换方案
  const handleSelectPath = (path: NegotiationSolutionPath) => {
    sounds.playClick();
    setActivePath(path);
    setIsSimulating(true);

    if (path === 'TAKE_TURNS') {
      setActiveItemIds(['item_boat', 'item_timer']);
    } else if (path === 'COOPERATE_CARGO') {
      setActiveItemIds(['item_boat', 'item_duck']);
    } else if (path === 'TRADE_TOYS') {
      setActiveItemIds(['item_boat', 'item_digger']);
    }

    const details = NEGOTIATION_PATHS_DETAILS[path];
    speechNarrator.speak(details.narrativeFeedback);
  };

  const handleSelectItem = (item: NegotiableItem) => {
    sounds.playClick();
    setSelectedItemId(item.id === selectedItemId ? null : item.id);
  };

  // 拖放或点击道具放入协商水塘
  const handleDropItemToPond = (itemId: string) => {
    sounds.playClick();
    if (itemId === 'item_timer') {
      handleSelectPath('TAKE_TURNS');
    } else if (itemId === 'item_duck') {
      handleSelectPath('COOPERATE_CARGO');
    } else if (itemId === 'item_digger') {
      handleSelectPath('TRADE_TOYS');
    }
    setSelectedItemId(null);
  };

  const handleExitGame = () => {
    speechNarrator.stop();
    setLocalSessionToken(null);
    setIsParentGateOpen(false);
    revokeAdultPreviewSession();
    lockParentAccess();
    onExit();
  };

  const handleRequestAdultPreview = () => {
    sounds.playClick();
    setLocalSessionToken(null);
    revokeAdultPreviewSession();
    lockParentAccess();
    setIsParentGateOpen(true);
  };

  const currentDetails: NegotiationResultDetails = NEGOTIATION_PATHS_DETAILS[activePath];

  if (!isApproved && !adultPreviewUnlocked) {
    return (
      <div data-testid="audit-gate-blocked" className="p-6 sm:p-8 bg-amber-50 rounded-3xl border-2 border-amber-200 text-stone-800 text-center space-y-4 my-4 max-w-xl mx-auto">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-inner">
          🌱
        </div>
        <h3 className="text-lg sm:text-xl font-black text-amber-950">这个小游戏正在做最后准备</h3>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
          「小船协商」正在由大人们做最后的安全检查，准备好后再陪你一起玩。现在可以先回小岛去呼吸角、晴雨气象台或做一件找回勇气的小事哦！
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExitGame}
            className="min-h-[56px] px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm transition-colors cursor-pointer shadow-sm"
          >
            回小岛玩其他活动
          </button>
          <button
            type="button"
            onClick={handleRequestAdultPreview}
            className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
          >
            家长 / 审阅人验证预览
          </button>
        </div>
        <ParentGateModal
          isOpen={isParentGateOpen}
          onClose={() => setIsParentGateOpen(false)}
          onSuccess={() => {
            setIsParentGateOpen(false);
            const token = issueAdultPreviewSession(SCOPE_KEY);
            setLocalSessionToken(token || null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-stone-50 rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden flex flex-col my-2">
      {adultPreviewUnlocked && !isApproved && (
        <div className="bg-amber-500 text-white text-xs font-black px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <span>⚠️ 家长与审阅人预览模式 · 请在成年人陪伴下审阅，尚未面向儿童正式开放</span>
          <span className="bg-amber-700 px-2 py-0.5 rounded-full text-[10px]">大人陪伴审阅</span>
        </div>
      )}
      {/* 顶部标题与退出 */}
      <div className="bg-teal-100/80 px-4 py-3 flex items-center justify-between border-b border-teal-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">⛵</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-teal-950">
              小船协商：选择、代价与合作
            </h2>
            <div className="flex items-center gap-2 text-xs text-teal-800">
              <span>没有唯一的“正确选择”</span>
              <span aria-hidden="true">·</span>
              <span>每种方案都有收益和现实等待</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExitGame}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-sm font-bold transition-colors"
            aria-label="离开游戏"
          >
            离开小岛
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-5 space-y-4">
        {/* 1. 动态仿真水塘与角色行动画布 (Simulation Pond Stage) */}
        <div className="relative w-full h-64 sm:h-76 bg-linear-to-b from-sky-100 via-teal-100 to-amber-100/70 rounded-2xl border-2 border-teal-300 overflow-hidden shadow-inner flex flex-col justify-between p-4">
          {/* 背景水波动画纹理 */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-10 inset-x-0 h-8 bg-white/40 rounded-full animate-pulse" />
            <div className="absolute top-24 inset-x-0 h-6 bg-white/30 rounded-full animate-pulse delay-75" />
            <div className="absolute bottom-4 inset-x-0 h-16 bg-amber-200/50 rounded-t-3xl" />
          </div>

          {/* 状态徽标与沙漏提示 */}
          <div className="relative flex items-center justify-between z-10">
            <div className="bg-white/90 backdrop-blur-xs px-3 py-1 rounded-xl border border-teal-200 text-xs font-bold text-teal-900 shadow-2xs">
              {currentDetails.title}
            </div>

            {activePath === 'TAKE_TURNS' && (
              <div className="bg-amber-100/95 px-3 py-1 rounded-xl border border-amber-300 text-xs font-black text-amber-950 flex items-center gap-1.5 animate-bounce">
                <span>⏳ 沙漏流动中</span>
                <span aria-hidden="true">·</span>
                <span>现在是【{turnIndex === 0 ? '小兔掌舵' : '小熊掌舵'}】</span>
              </div>
            )}
          </div>

          {/* 角色与小船交互动态区 */}
          <div className="relative flex items-center justify-around z-10 py-2">
            {/* 角色 A: 小兔提莫 */}
            <div className="flex flex-col items-center transition-all duration-500">
              <div
                className={`text-5xl sm:text-6xl p-2 rounded-2xl transition-transform ${
                  activePath === 'COOPERATE_CARGO'
                    ? 'scale-115 rotate-3'
                    : activePath === 'TAKE_TURNS' && turnIndex === 0
                    ? 'scale-115 -translate-y-2'
                    : 'scale-95 opacity-80'
                }`}
                aria-hidden="true"
              >
                🐰
              </div>
              <span className="text-xs font-bold text-stone-800 bg-white/80 px-2 py-0.5 rounded-md mt-1">
                小兔提莫
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5 max-w-[120px] text-center">
                {activePath === 'TAKE_TURNS'
                  ? turnIndex === 0
                    ? '快乐划船中'
                    : '看沙漏等待'
                  : activePath === 'COOPERATE_CARGO'
                  ? '领航船长'
                  : '玩小木船'}
              </span>
            </div>

            {/* 中央小船动态 */}
            <div className="flex flex-col items-center">
              <div
                className={`text-6xl sm:text-7xl transition-transform duration-1000 ${
                  activePath === 'COOPERATE_CARGO'
                    ? 'translate-x-3 scale-110'
                    : activePath === 'TAKE_TURNS'
                    ? turnIndex === 0
                      ? '-translate-x-4'
                      : 'translate-x-4'
                    : 'translate-x-0'
                }`}
                aria-hidden="true"
              >
                ⛵
              </div>
              {/* 载货小黄鸭或道具 */}
              {activePath === 'COOPERATE_CARGO' && (
                <span className="text-sm font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-1 animate-pulse">
                  🦆 装满小黄鸭
                </span>
              )}
            </div>

            {/* 角色 B: 小熊波波 */}
            <div className="flex flex-col items-center transition-all duration-500">
              <div
                className={`text-5xl sm:text-6xl p-2 rounded-2xl transition-transform ${
                  activePath === 'COOPERATE_CARGO'
                    ? 'scale-115 -rotate-3'
                    : activePath === 'TAKE_TURNS' && turnIndex === 1
                    ? 'scale-115 -translate-y-2'
                    : 'scale-95 opacity-80'
                }`}
                aria-hidden="true"
              >
                🐻
              </div>
              <span className="text-xs font-bold text-stone-800 bg-white/80 px-2 py-0.5 rounded-md mt-1">
                小熊波波
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5 max-w-[120px] text-center">
                {activePath === 'TAKE_TURNS'
                  ? turnIndex === 1
                    ? '快乐划船中'
                    : '看沙漏等待'
                  : activePath === 'COOPERATE_CARGO'
                  ? '岸边装卸员'
                  : '玩沙滩挖掘机'}
              </span>
            </div>
          </div>

          {/* 底部池塘岸边提示 */}
          <div className="relative text-center text-xs text-teal-900 font-medium z-10 bg-white/60 py-1 rounded-lg">
            {currentDetails.narrativeFeedback}
          </div>
        </div>

        {/* 2. 道具箱与点击/拖放分配区 */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-3 sm:p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-stone-800">
              道具工具箱（点击或拖放道具到池塘，切换协商方案）：
            </h3>
            {selectedItemId && (
              <span className="text-xs text-amber-600 font-bold animate-pulse">
                已选中道具，点击方案即可放入
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {NEGOTIATION_ITEMS.map((item) => {
              const isSelected = selectedItemId === item.id;
              const isInPond = activeItemIds.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    handleSelectItem(item);
                    handleDropItemToPond(item.id);
                  }}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    isSelected
                      ? 'bg-teal-100 border-teal-500 shadow-md ring-2 ring-teal-300'
                      : isInPond
                      ? 'bg-teal-50 border-teal-300 text-teal-950 font-bold'
                      : 'bg-stone-50 border-stone-200 hover:border-teal-300 text-stone-700'
                  }`}
                  aria-label={`使用${item.name}`}
                >
                  <div className="text-3xl mb-1" aria-hidden="true">{item.icon}</div>
                  <div className="text-xs font-black">{item.name}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {isInPond ? '池塘使用中' : '点击使用'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 三条协商路径快速选择卡 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 方案 A: 轮流玩 */}
          <button
            type="button"
            onClick={() => handleSelectPath('TAKE_TURNS')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
              activePath === 'TAKE_TURNS'
                ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-300'
                : 'bg-white border-stone-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-hidden="true">⏳</span>
              <span className="font-black text-sm text-stone-900">方案 A：轮流玩</span>
            </div>
            <p className="text-xs text-stone-600 mb-1.5">
              翻转 3 分钟沙漏，小兔先划船，小熊等待；沙漏漏完再互换。
            </p>
          </button>

          {/* 方案 B: 合作载货 */}
          <button
            type="button"
            onClick={() => handleSelectPath('COOPERATE_CARGO')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
              activePath === 'COOPERATE_CARGO'
                ? 'bg-teal-50 border-teal-500 shadow-md ring-2 ring-teal-300'
                : 'bg-white border-stone-200 hover:border-teal-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-hidden="true">🦆</span>
              <span className="font-black text-sm text-stone-900">方案 B：合作运货</span>
            </div>
            <p className="text-xs text-stone-600 mb-1.5">
              小兔当船长划水，小熊当货港管理员装小鸭，两个人一起玩！
            </p>
          </button>

          {/* 方案 C: 交换玩 */}
          <button
            type="button"
            onClick={() => handleSelectPath('TRADE_TOYS')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
              activePath === 'TRADE_TOYS'
                ? 'bg-sky-50 border-sky-500 shadow-md ring-2 ring-sky-300'
                : 'bg-white border-stone-200 hover:border-sky-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-hidden="true">🚜</span>
              <span className="font-black text-sm text-stone-900">方案 C：交换玩具</span>
            </div>
            <p className="text-xs text-stone-600 mb-1.5">
              小熊玩挖掘机挖沙渠，小兔玩小船，谁也不用空手等。
            </p>
          </button>
        </div>

        {/* 4. 收益与现实限制客观呈现 (Tradeoff Analysis) */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 space-y-2 shadow-xs">
          <h4 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
            <span>⚖️ 方案利弊客观分析（每种好办法都有收益与代价）：</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs sm:text-sm">
              <p className="font-bold text-emerald-950 mb-1">
                {currentDetails.advantageGained}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm">
              <p className="font-bold text-amber-950 mb-1">
                {currentDetails.realisticLimitation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
