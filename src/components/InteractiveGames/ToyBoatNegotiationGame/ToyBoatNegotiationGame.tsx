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

/**
 * 原创矢量小动物伙伴头像 (消灭 Unicode 动物 Emoji)
 */
const AnimalFriendSvg: React.FC<{
  type: 'rabbit' | 'bear';
  className?: string;
  isActive?: boolean;
}> = ({ type, className = 'w-12 h-12', isActive = false }) => {
  if (type === 'rabbit') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
        {/* 小兔长耳朵 */}
        <ellipse cx="18" cy="12" rx="4.5" ry="11" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
        <ellipse cx="18" cy="12" rx="2.5" ry="7" fill="#FFE4E6" />
        <ellipse cx="30" cy="12" rx="4.5" ry="11" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
        <ellipse cx="30" cy="12" rx="2.5" ry="7" fill="#FFE4E6" />
        {/* 脸部 */}
        <circle cx="24" cy="28" r="15" fill="#FFFFFF" stroke="#E11D48" strokeWidth="2" />
        {/* 眼睛与腮红 */}
        <circle cx="18" cy="26" r="2.2" fill="#881337" />
        <circle cx="30" cy="26" r="2.2" fill="#881337" />
        <circle cx="14" cy="30" r="3" fill="#FDA4AF" opacity="0.7" />
        <circle cx="34" cy="30" r="3" fill="#FDA4AF" opacity="0.7" />
        {/* 三瓣嘴 */}
        <polygon points="24,29 22.5,31 25.5,31" fill="#F43F5E" />
        <path d="M21 32Q24 34 27 32" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" />
        {/* 掌舵水手领巾 */}
        <polygon points="24,39 20,44 28,44" fill={isActive ? '#38BDF8' : '#CBD5E1'} stroke="#0284C7" strokeWidth="1" />
      </svg>
    );
  }

  // 小熊波波
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      {/* 小熊圆耳朵 */}
      <circle cx="13" cy="14" r="6" fill="#B45309" stroke="#78350F" strokeWidth="2" />
      <circle cx="13" cy="14" r="3" fill="#FDE68A" />
      <circle cx="35" cy="14" r="6" fill="#B45309" stroke="#78350F" strokeWidth="2" />
      <circle cx="35" cy="14" r="3" fill="#FDE68A" />
      {/* 脸部 */}
      <circle cx="24" cy="28" r="16" fill="#D97706" stroke="#92400E" strokeWidth="2" />
      <ellipse cx="24" cy="31" rx="8" ry="6" fill="#FEF3C7" />
      {/* 眼睛与鼻头 */}
      <circle cx="18" cy="24" r="2.2" fill="#451A03" />
      <circle cx="30" cy="24" r="2.2" fill="#451A03" />
      <ellipse cx="24" cy="28.5" rx="3.5" ry="2.5" fill="#78350F" />
      <path d="M22 32Q24 34 26 32" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
      {/* 工人/水手帽子徽章 */}
      <circle cx="24" cy="15" r="4.5" fill={isActive ? '#F59E0B' : '#CBD5E1'} stroke="#B45309" strokeWidth="1" />
    </svg>
  );
};

/**
 * 原创矢量小木船
 */
const ToySailboatSvg: React.FC<{
  hasDuck?: boolean;
  className?: string;
}> = ({ hasDuck = false, className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none">
    {/* 船身 (木色) */}
    <path
      d="M10 44 L16 54 C16 54 28 57 48 54 L54 44 Z"
      fill="#D97706"
      stroke="#78350F"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* 船甲板条纹 */}
    <line x1="16" y1="44" x2="48" y2="44" stroke="#FDE68A" strokeWidth="2" />
    {/* 桅杆 */}
    <line x1="32" y1="12" x2="32" y2="44" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
    {/* 主风帆 (红白相间) */}
    <path d="M32 15 L50 38 L32 38 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
    <polygon points="32,23 44,38 32,38" fill="#FFFFFF" />
    {/* 副前帆 (天空蓝) */}
    <path d="M30 18 L16 38 L30 38 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.8" />
    {/* 顶部小彩旗 */}
    <polygon points="32,10 40,13 32,16" fill="#FBBF24" />

    {/* 载货小黄鸭插画 */}
    {hasDuck && (
      <g transform="translate(24, 28) scale(0.65)">
        <ellipse cx="14" cy="14" rx="8" ry="6" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
        <circle cx="18" cy="9" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
        <circle cx="19" cy="8" r="1" fill="#78350F" />
        <polygon points="22,9 27,10 22,12" fill="#F97316" />
      </g>
    )}
  </svg>
);

/**
 * 道具专属原创矢量图标 (替代纯 Emoji)
 */
const ItemTokenSvg: React.FC<{
  itemId: string;
  className?: string;
}> = ({ itemId, className = 'w-7 h-7' }) => {
  switch (itemId) {
    case 'item_boat':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <path d="M6 22L10 27H22L26 22Z" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
          <line x1="16" y1="7" x2="16" y2="22" stroke="#78350F" strokeWidth="1.8" />
          <polygon points="16,8 24,19 16,19" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.2" />
          <polygon points="15,10 8,19 15,19" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.2" />
        </svg>
      );
    case 'item_timer':
      // 沙漏计时器
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <path d="M8 6H24M8 26H24" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M10 6C10 14 15 16 16 16C17 16 22 14 22 6M10 26C10 18 15 16 16 16C17 16 22 18 22 26"
            stroke="#D97706"
            strokeWidth="2"
            fill="#FEF3C7"
          />
          <polygon points="12,24 20,24 16,19" fill="#F59E0B" />
          <line x1="16" y1="12" x2="16" y2="18" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="1 1" />
        </svg>
      );
    case 'item_duck':
      // 载货小黄鸭
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <ellipse cx="14" cy="20" rx="9" ry="7" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.6" />
          <circle cx="21" cy="13" r="6" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.6" />
          <circle cx="23" cy="12" r="1.3" fill="#78350F" />
          <polygon points="26,13 31,14.5 26,16" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
          <path d="M8 20Q12 24 16 22" stroke="#CA8A04" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'item_digger':
      // 挖沙挖掘机
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <rect x="6" y="16" width="12" height="8" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <rect x="8" y="24" width="14" height="4" rx="2" fill="#4B5563" stroke="#1F2937" strokeWidth="1.2" />
          <path d="M14 16L20 9L25 12" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M25 12L28 17L23 18Z" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
};

/**
 * 视觉天平/称重矢量组件 (Visual Turn-Taking Balance Scale)
 */
const BalanceScaleSvg: React.FC<{
  turnIndex: number;
  activePath: NegotiationSolutionPath;
  className?: string;
}> = ({ turnIndex, activePath, className = 'w-36 h-20' }) => {
  // 倾斜角度：轮流玩时随轮次偏向小兔或小熊
  let tiltDeg = 0;
  if (activePath === 'TAKE_TURNS') {
    tiltDeg = turnIndex === 0 ? -9 : 9; // -9度向左(兔)，+9度向右(熊)
  }

  return (
    <svg viewBox="0 0 120 70" className={className} aria-hidden="true" fill="none">
      {/* 天平立柱与底座 */}
      <polygon points="60,18 64,56 56,56" fill="#92400E" stroke="#78350F" strokeWidth="1.5" />
      <rect x="44" y="56" width="32" height="6" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
      <circle cx="60" cy="18" r="4.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />

      {/* 摆动横梁 */}
      <g transform={`rotate(${tiltDeg} 60 18)`} className="transition-transform duration-700 ease-in-out">
        <line x1="16" y1="18" x2="104" y2="18" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="20" cy="18" r="2.5" fill="#92400E" />
        <circle cx="100" cy="18" r="2.5" fill="#92400E" />

        {/* 左托盘绳与盘 */}
        <line x1="20" y1="18" x2="14" y2="38" stroke="#B45309" strokeWidth="1.2" />
        <line x1="20" y1="18" x2="26" y2="38" stroke="#B45309" strokeWidth="1.2" />
        <path d="M10 38C10 44 30 44 30 38Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />

        {/* 右托盘绳与盘 */}
        <line x1="100" y1="18" x2="94" y2="38" stroke="#B45309" strokeWidth="1.2" />
        <line x1="100" y1="18" x2="106" y2="38" stroke="#B45309" strokeWidth="1.2" />
        <path d="M90 38C90 44 110 44 110 38Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
      </g>
    </svg>
  );
};

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
  const [activeItemIds, setActiveItemIds] = useState<string[]>(['item_boat', 'item_timer']);
  // 选中的道具（用于点击放置模式）
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // 当前激活的协商方案
  const [activePath, setActivePath] = useState<NegotiationSolutionPath>('TAKE_TURNS');

  // 轮流状态（0: 小兔玩; 1: 小熊玩）
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [turnSecondsRemaining, setTurnSecondsRemaining] = useState<number>(4);

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
      setTurnSecondsRemaining((sec) => {
        if (sec <= 1) {
          setTurnIndex((prev) => (prev === 0 ? 1 : 0));
          return 4;
        }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activePath]);

  // 切换方案
  const handleSelectPath = (path: NegotiationSolutionPath) => {
    sounds.playClick();
    setActivePath(path);

    if (path === 'TAKE_TURNS') {
      setActiveItemIds(['item_boat', 'item_timer']);
      setTurnSecondsRemaining(4);
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

  // 手动翻转沙漏
  const handleFlipTurnManually = () => {
    sounds.playClick();
    setTurnIndex((prev) => (prev === 0 ? 1 : 0));
    setTurnSecondsRemaining(4);
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
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <svg viewBox="0 0 32 32" className="w-9 h-9" aria-hidden="true" fill="none">
            <path d="M16 27V12" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 14C12 11 8 13 8 18C13 18 15 16 16 14Z" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
            <path d="M16 17C20 14 24 16 24 21C19 21 17 19 16 17Z" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-amber-950">这个小游戏正在做最后准备</h3>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
          「小船协商」正在由大人们做最后的安全检查，准备好后再陪你一起玩。现在可以先回小岛去呼吸角、晴雨气象台或做一件找回勇气的小事哦！
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExitGame}
            className="min-h-[56px] px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center"
          >
            回小岛玩其他活动
          </button>
          <button
            type="button"
            onClick={handleRequestAdultPreview}
            className="min-h-[48px] px-5 py-2.5 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 font-bold rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center"
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
        <div className="bg-amber-500 text-white text-xs font-black px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>⚠️ 家长与审阅人预览模式 · 请在成年人陪伴下审阅，尚未面向儿童正式开放</span>
          </div>
          <span className="bg-amber-700 px-2 py-0.5 rounded-full text-[10px]">大人陪伴审阅</span>
        </div>
      )}

      {/* 顶部标题与退出 */}
      <div className="bg-teal-100/90 px-4 py-3 flex items-center justify-between border-b border-teal-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-200/90 flex items-center justify-center shrink-0 shadow-xs">
            <ItemTokenSvg itemId="item_boat" className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-teal-950">
              小船协商：选择、代价与合作
            </h2>
            <div className="flex items-center gap-2 text-xs text-teal-800 mt-0.5 font-bold">
              <span>没有唯一的“正确选择”</span>
              <span aria-hidden="true">·</span>
              <span>每种好办法都有收益与现实等待</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExitGame}
          className="min-h-[48px] px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center"
          aria-label="离开游戏"
        >
          离开小岛
        </button>
      </div>

      <div className="p-3 sm:p-5 space-y-4">
        {/* 1. 动态仿真池塘与角色行动画布 (Simulation Pond Stage) */}
        <div className="relative w-full h-64 sm:h-80 bg-linear-to-b from-sky-100 via-teal-100 to-amber-100/70 rounded-2xl border-2 border-teal-300 overflow-hidden shadow-inner flex flex-col justify-between p-3 sm:p-4">
          {/* 背景水波纹 */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-8 inset-x-0 h-6 bg-white/50 rounded-full animate-pulse" />
            <div className="absolute top-20 inset-x-0 h-5 bg-white/30 rounded-full animate-pulse delay-100" />
            <div className="absolute bottom-4 inset-x-0 h-16 bg-amber-200/60 rounded-t-3xl" />
          </div>

          {/* 状态徽标与沙漏轮流指示器 */}
          <div className="relative flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-teal-200 text-xs font-black text-teal-950 shadow-xs">
              {currentDetails.title}
            </div>

            {activePath === 'TAKE_TURNS' ? (
              <div className="flex items-center gap-2">
                <div className="bg-amber-100/95 px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-black text-amber-950 flex items-center gap-1.5 shadow-xs">
                  <ItemTokenSvg itemId="item_timer" className="w-4 h-4 shrink-0" />
                  <span>轮流倒数：{turnSecondsRemaining}s</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-800">
                    现在由【{turnIndex === 0 ? '小兔掌舵' : '小熊掌舵'}】
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFlipTurnManually}
                  className="min-h-[44px] px-3 py-1 bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
                >
                  翻转沙漏
                </button>
              </div>
            ) : (
              <div className="bg-teal-50/90 px-3 py-1.5 rounded-xl border border-teal-200 text-xs font-bold text-teal-900">
                {activePath === 'COOPERATE_CARGO' ? '两人分工运货' : '各自开心玩耍'}
              </div>
            )}
          </div>

          {/* 角色与小船交互动态区 */}
          <div className="relative flex items-center justify-around z-10 py-1">
            {/* 角色 A: 小兔提莫 */}
            <div className="flex flex-col items-center transition-all duration-500">
              <div
                className={`transition-transform duration-300 ${
                  activePath === 'COOPERATE_CARGO'
                    ? 'scale-110'
                    : activePath === 'TAKE_TURNS' && turnIndex === 0
                    ? 'scale-115 -translate-y-2'
                    : 'scale-90 opacity-75'
                }`}
              >
                <AnimalFriendSvg
                  type="rabbit"
                  className="w-14 h-14 sm:w-16 sm:h-16"
                  isActive={activePath === 'TAKE_TURNS' ? turnIndex === 0 : true}
                />
              </div>
              <span className="text-xs font-black text-stone-800 bg-white/90 px-2.5 py-0.5 rounded-md mt-1 border border-stone-200">
                小兔提莫
              </span>
              <span className="text-[10px] text-stone-600 font-bold mt-0.5 max-w-[120px] text-center">
                {activePath === 'TAKE_TURNS'
                  ? turnIndex === 0
                    ? '掌舵划船中'
                    : '看沙漏等待'
                  : activePath === 'COOPERATE_CARGO'
                  ? '领航船长'
                  : '玩小木船'}
              </span>
            </div>

            {/* 中央动态区域：小木船 + 视觉天平秤 */}
            <div className="flex flex-col items-center space-y-1">
              <BalanceScaleSvg
                turnIndex={turnIndex}
                activePath={activePath}
                className="w-28 sm:w-36 h-14 sm:h-18"
              />
              <div
                className={`transition-transform duration-700 ${
                  activePath === 'COOPERATE_CARGO'
                    ? 'translate-x-2 scale-105'
                    : activePath === 'TAKE_TURNS'
                    ? turnIndex === 0
                      ? '-translate-x-3'
                      : 'translate-x-3'
                    : 'translate-x-0'
                }`}
              >
                <ToySailboatSvg
                  hasDuck={activePath === 'COOPERATE_CARGO'}
                  className="w-16 h-16 sm:w-20 sm:h-20"
                />
              </div>
            </div>

            {/* 角色 B: 小熊波波 */}
            <div className="flex flex-col items-center transition-all duration-500">
              <div
                className={`transition-transform duration-300 ${
                  activePath === 'COOPERATE_CARGO'
                    ? 'scale-110'
                    : activePath === 'TAKE_TURNS' && turnIndex === 1
                    ? 'scale-115 -translate-y-2'
                    : 'scale-90 opacity-75'
                }`}
              >
                <AnimalFriendSvg
                  type="bear"
                  className="w-14 h-14 sm:w-16 sm:h-16"
                  isActive={activePath === 'TAKE_TURNS' ? turnIndex === 1 : true}
                />
              </div>
              <span className="text-xs font-black text-stone-800 bg-white/90 px-2.5 py-0.5 rounded-md mt-1 border border-stone-200">
                小熊波波
              </span>
              <span className="text-[10px] text-stone-600 font-bold mt-0.5 max-w-[120px] text-center">
                {activePath === 'TAKE_TURNS'
                  ? turnIndex === 1
                    ? '掌舵划船中'
                    : '看沙漏等待'
                  : activePath === 'COOPERATE_CARGO'
                  ? '岸边装卸员'
                  : '玩沙滩挖掘机'}
              </span>
            </div>
          </div>

          {/* 底部池塘岸边情景简述 */}
          <div className="relative text-center text-xs text-teal-950 font-bold z-10 bg-white/80 py-1.5 px-3 rounded-xl border border-teal-200/60">
            {currentDetails.narrativeFeedback}
          </div>
        </div>

        {/* 2. 道具工具箱与协商方案切换 (触控 targets >= 56px) */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-3 sm:p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-stone-800">
              道具交换箱（点击道具，切换不同的协商方案）：
            </h3>
            {selectedItemId && (
              <span className="text-xs text-teal-700 font-bold">
                已选中道具，点击方案放入
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
                  className={`min-h-[56px] p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-teal-100 border-teal-500 shadow-md ring-2 ring-teal-300'
                      : isInPond
                      ? 'bg-teal-50 border-teal-300 text-teal-950 font-black'
                      : 'bg-stone-50 border-stone-200 hover:border-teal-300 text-stone-700'
                  }`}
                  aria-label={`使用${item.name}`}
                >
                  <ItemTokenSvg itemId={item.id} className="w-8 h-8 mb-1" />
                  <div className="text-xs font-black">{item.name}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {isInPond ? '池塘使用中' : '点击放入池塘'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 三条协商路径快速选择卡 (>= 56px) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 方案 A: 轮流玩 */}
          <button
            type="button"
            onClick={() => handleSelectPath('TAKE_TURNS')}
            className={`min-h-[56px] p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              activePath === 'TAKE_TURNS'
                ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-300'
                : 'bg-white border-stone-200 hover:border-amber-300'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ItemTokenSvg itemId="item_timer" className="w-6 h-6 shrink-0" />
                <span className="font-black text-sm text-stone-900">方案 A · 轮流玩</span>
              </div>
              <p className="text-xs text-stone-600 font-bold mb-1.5 leading-relaxed">
                翻转 3 分钟沙漏，小兔先划船，小熊等待；沙漏漏完再互换。
              </p>
            </div>
            <span className="text-[11px] text-amber-800 font-black bg-amber-100/80 px-2 py-0.5 rounded-md self-start">
              公平轮替 · 耐心等待
            </span>
          </button>

          {/* 方案 B: 合作载货 */}
          <button
            type="button"
            onClick={() => handleSelectPath('COOPERATE_CARGO')}
            className={`min-h-[56px] p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              activePath === 'COOPERATE_CARGO'
                ? 'bg-teal-50 border-teal-500 shadow-md ring-2 ring-teal-300'
                : 'bg-white border-stone-200 hover:border-teal-300'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ItemTokenSvg itemId="item_duck" className="w-6 h-6 shrink-0" />
                <span className="font-black text-sm text-stone-900">方案 B · 合作运货</span>
              </div>
              <p className="text-xs text-stone-600 font-bold mb-1.5 leading-relaxed">
                小兔当船长划水，小熊当货港管理员装小鸭，两个人一起玩！
              </p>
            </div>
            <span className="text-[11px] text-teal-800 font-black bg-teal-100/80 px-2 py-0.5 rounded-md self-start">
              共同参与 · 协作配合
            </span>
          </button>

          {/* 方案 C: 交换玩 */}
          <button
            type="button"
            onClick={() => handleSelectPath('TRADE_TOYS')}
            className={`min-h-[56px] p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              activePath === 'TRADE_TOYS'
                ? 'bg-sky-50 border-sky-500 shadow-md ring-2 ring-sky-300'
                : 'bg-white border-stone-200 hover:border-sky-300'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ItemTokenSvg itemId="item_digger" className="w-6 h-6 shrink-0" />
                <span className="font-black text-sm text-stone-900">方案 C · 交换玩具</span>
              </div>
              <p className="text-xs text-stone-600 font-bold mb-1.5 leading-relaxed">
                小熊玩挖掘机挖沙渠，小兔玩小木船，谁也不用空手等。
              </p>
            </div>
            <span className="text-[11px] text-sky-800 font-black bg-sky-100/80 px-2 py-0.5 rounded-md self-start">
              互相分享 · 快乐加倍
            </span>
          </button>
        </div>

        {/* 4. 收益与现实限制客观呈现 (Tradeoff Analysis 双盘对比) */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 space-y-2 shadow-xs">
          <h4 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v18M3 9l9-6 9 6M3 9l4 7M21 9l-4 7M7 16h-4M21 16h-4" />
            </svg>
            <span>方案利弊客观分析（每种好办法都有收益与代价）：</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs sm:text-sm">
              <p className="font-black text-emerald-950 mb-1 leading-snug">
                {currentDetails.advantageGained}
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm">
              <p className="font-black text-amber-950 mb-1 leading-snug">
                {currentDetails.realisticLimitation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
