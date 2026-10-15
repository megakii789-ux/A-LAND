import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  InterestActivityId,
  INTEREST_ACTIVITIES,
  ANIMAL_COMPANIONS,
  getThemedScenarioByInterest,
  getThemedScenarioCasesByInterest,
  evaluateThemedCluePlacement,
  evaluateHypothesisAgainstEvidence,
  evaluateDetectiveCaseCompletionReadiness,
  getOrderAwareDiscoveryFeedback,
  HypothesisEvaluationResult,
  DetectiveCaseCompletionReadiness,
} from '../../../domain/personalization';
import { HotspotEvidence, SortingBasketType } from '../../../domain/games/types';
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
  DetectiveCaseStatus,
  getProductExperienceMetrics,
  recordClueClassificationAttempt,
  recordDetectiveCaseCompletion,
  recordDetectiveCaseState,
  recordHypothesisRevision,
  recordUnknownHonestyChoice,
  subscribeProductExperienceMetrics,
} from '../../../domain/cognitive/productExperienceMetrics';
import { ParentGateModal } from '../../ParentGateModal';
import { CompanionAvatarSvg, InterestBadgeSvg } from '../../ChildIsland/CompanionIcons';
import { TransferScenariosModal } from '../TransferLab/TransferScenariosModal';

const SCOPE_KEY = 'game_crayon_detective';

const CASE_STATUS_LABELS: Record<DetectiveCaseStatus, string> = {
  NOT_STARTED: '尚未开始调查',
  EXPLORING: '正在现场调查',
  REFLECTING: '整理证据与判断',
  ACTION_SELECTED: '已尝试行动方案',
  COMPLETED: '已完成破案闭环',
  COMPLETED_AFTER_REFERENCE: '参考后完成探索',
  ENDED_EARLY: '已暂停 / 仅查看参考',
};

interface Props {
  onExit: () => void;
  initialTheme?: InterestActivityId;
  isAdultPreview?: boolean;
  previewSessionToken?: string | null;
  onOpenTransferLab?: () => void;
}

/**
 * 绘本级原创矢量线索图标组件 (彻底消除跨平台 Emoji 缺字/豆腐块)
 */
const ClueVisualIcon: React.FC<{
  icon?: string;
  clueId?: string;
  category?: 'FACT' | 'INFERENCE' | 'UNKNOWN';
  className?: string;
}> = ({ icon, clueId = '', category = 'FACT', className = 'w-7 h-7' }) => {
  // 1. 画架 / 色彩 / 画笔
  if (clueId.includes('easel') || clueId.includes('cap') || icon === '🎨' || icon === '🖊️' || icon === '✨') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <path d="M7 27L12 8L16 4L20 8L25 27" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
        <line x1="9" y1="20" x2="23" y2="20" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="9.5" y="8.5" width="13" height="10" rx="1.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
        <circle cx="13" cy="13" r="1.5" fill="#EF4444" />
        <circle cx="17" cy="12" r="1.5" fill="#10B981" />
        <circle cx="19" cy="15" r="1.5" fill="#3B82F6" />
      </svg>
    );
  }

  // 2. 猫爪印 / 狗爪印
  if (clueId.includes('tracks') || clueId.includes('paw') || icon === '🐾') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <ellipse cx="16" cy="19" rx="6" ry="4.5" fill="#F59E0B" />
        <circle cx="10" cy="13" r="2.2" fill="#D97706" />
        <circle cx="14" cy="10" r="2.2" fill="#D97706" />
        <circle cx="18" cy="10" r="2.2" fill="#D97706" />
        <circle cx="22" cy="13" r="2.2" fill="#D97706" />
      </svg>
    );
  }

  // 3. 蜡笔 / 水彩笔
  if (clueId.includes('curtain') || clueId.includes('crayon') || clueId.includes('board_slot') || icon === '🖍️') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <path d="M8 24L19 13L24 18L13 29L8 27L8 24Z" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
        <path d="M19 13L23 9L27 13L24 18L19 13Z" fill="#34D399" stroke="#047857" strokeWidth="1.5" />
        <polygon points="23,9 28,4 27,13" fill="#059669" />
        <line x1="12" y1="18" x2="16" y2="22" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
    );
  }

  // 4. 猜想念头 / 脑海气泡
  if (clueId.includes('thought') || clueId.includes('guess') || icon === '💭' || category === 'INFERENCE') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <path
          d="M8 15C6.5 15 5 16.5 5 18.5C5 20.8 7 22.5 9 22.5C9.5 22.5 10 22.3 10.5 22C11.5 23.5 13.5 24.5 16 24.5C19 24.5 21.5 23.2 22.5 21.2C24.5 21 26 19.5 26 17.5C26 15.2 24.2 13.5 22 13.5C21.8 13.5 21.5 13.5 21.2 13.6C20.5 10.5 17.5 8.5 14 8.5C9.5 8.5 6 11.5 6 15.5C6 15.8 6 16.2 6.1 16.5"
          fill="#FEF3C7"
          stroke="#D97706"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="15" cy="16" r="1.5" fill="#F59E0B" />
        <circle cx="18" cy="16" r="1.5" fill="#F59E0B" />
        <path d="M14 19Q16.5 21 19 19" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 5. 书包 / 盲区未知
  if (
    clueId.includes('backpack') ||
    clueId.includes('locker') ||
    clueId.includes('burrow') ||
    icon === '🎒' ||
    icon === '🔒' ||
    icon === '🕳️' ||
    category === 'UNKNOWN'
  ) {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <path d="M11 9C11 6.5 13 4.5 16 4.5C19 4.5 21 6.5 21 9V11H11V9Z" stroke="#0284C7" strokeWidth="1.8" fill="#E0F2FE" />
        <rect x="7" y="10" width="18" height="17" rx="3.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.8" />
        <rect x="10" y="14" width="12" height="7" rx="2" fill="#BAE6FD" stroke="#0369A1" strokeWidth="1.4" />
        <line x1="16" y1="14" x2="16" y2="17" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="18.5" r="1" fill="#0369A1" />
      </svg>
    );
  }

  // 6. 足球
  if (clueId.includes('soccer') || clueId.includes('ball') || icon === '⚽') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <circle cx="16" cy="16" r="12" fill="#FFFFFF" stroke="#1F2937" strokeWidth="1.8" />
        <polygon points="16,11 19.5,13.5 18,17.5 14,17.5 12.5,13.5" fill="#1F2937" />
        <line x1="16" y1="11" x2="16" y2="5" stroke="#1F2937" strokeWidth="1.4" />
        <line x1="19.5" y1="13.5" x2="25" y2="11.5" stroke="#1F2937" strokeWidth="1.4" />
        <line x1="18" y1="17.5" x2="22.5" y2="23" stroke="#1F2937" strokeWidth="1.4" />
        <line x1="14" y1="17.5" x2="9.5" y2="23" stroke="#1F2937" strokeWidth="1.4" />
        <line x1="12.5" y1="13.5" x2="7" y2="11.5" stroke="#1F2937" strokeWidth="1.4" />
      </svg>
    );
  }

  // 7. 羽毛 / 橡果 / 树叶 / 自然
  if (icon === '🪶' || icon === '🌱' || icon === '🌲' || icon === '🍂' || icon === '🌰' || icon === '🍀') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <path d="M16 27V11" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 14C12 11 8 13 8 18C13 18 15 16 16 14Z" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
        <path d="M16 17C20 14 24 16 24 21C19 21 17 19 16 17Z" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
        <ellipse cx="16" cy="9" rx="3.5" ry="2.5" fill="#D97706" />
      </svg>
    );
  }

  // 默认客观事实相机图标
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <rect x="5" y="9" width="22" height="17" rx="3.5" fill="#D1FAE5" stroke="#059669" strokeWidth="1.8" />
      <circle cx="16" cy="17.5" r="4.5" fill="#FFFFFF" stroke="#059669" strokeWidth="1.8" />
      <circle cx="16" cy="17.5" r="2" fill="#10B981" />
      <rect x="9" y="6" width="6" height="3" rx="1" fill="#059669" />
    </svg>
  );
};

/**
 * 原创矢量放大镜图标
 */
const MagnifierLensSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
    <circle cx="13" cy="13" r="8" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.4" />
    <circle cx="13" cy="13" r="5" stroke="#FDE68A" strokeWidth="1.5" opacity="0.8" />
    <line x1="19" y1="19" x2="27" y2="27" stroke="#92400E" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M10 10C11 8.5 13 8.5 14 9" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * 分类盒专属矢量图标
 */
const BasketCrateSvg: React.FC<{
  type: SortingBasketType;
  className?: string;
}> = ({ type, className = 'w-7 h-7' }) => {
  switch (type) {
    case 'EYES_OBSERVED':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <rect x="4" y="10" width="24" height="17" rx="3" fill="#D1FAE5" stroke="#059669" strokeWidth="2" />
          <path d="M4 15H28" stroke="#059669" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="16" cy="20" r="4" fill="#FFFFFF" stroke="#047857" strokeWidth="1.8" />
          <circle cx="16" cy="20" r="1.8" fill="#059669" />
          <rect x="13" y="6.5" width="6" height="3.5" rx="1" fill="#10B981" stroke="#047857" strokeWidth="1.2" />
        </svg>
      );
    case 'MIND_GUESSED':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <rect x="4" y="10" width="24" height="17" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <path d="M4 15H28" stroke="#D97706" strokeWidth="1.5" strokeDasharray="2 2" />
          <path
            d="M16 13C14 13 12.5 14.5 12.5 16.5C12.5 18 13.5 19 14.5 20V21.5H17.5V20C18.5 19 19.5 18 19.5 16.5C19.5 14.5 18 13 16 13Z"
            fill="#FDE047"
            stroke="#B45309"
            strokeWidth="1.4"
          />
          <line x1="14.5" y1="23" x2="17.5" y2="23" stroke="#B45309" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'STILL_UNKNOWN':
    default:
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <rect x="4" y="10" width="24" height="17" rx="3" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <path d="M4 15H28" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="16" cy="20" r="4.5" fill="#FFFFFF" stroke="#0369A1" strokeWidth="1.5" />
          <text x="16" y="23" textAnchor="middle" fontSize="9" fontWeight="900" fill="#0284C7">?</text>
        </svg>
      );
  }
};

/**
 * P1-02：主题差异化可交互 SVG 环境画布
 * 为画画美术角（窗帘可掀起、猫爪印连线、画架向日葵、拉链书包）与自然森林（大橡树洞、喜鹊羽毛、分岔滚痕、可拨开红枫叶堆与空帽壳、深树洞）提供鲜明视觉环境
 */
const DetectiveEnvironmentSceneSvg: React.FC<{
  themeId: InterestActivityId;
  scenarioId: string;
  revealedObjectIds: ReadonlyArray<string>;
  selectedActionId: string | null;
}> = ({ themeId, scenarioId, revealedObjectIds, selectedActionId }) => {
  const isCurtainLifted = revealedObjectIds.includes('hs_curtain');
  const isMaplePileOpened = revealedObjectIds.includes('hs_nature_leaf_pile');

  if (themeId === 'nature') {
    return (
      <svg
        data-testid="scene-env-nature"
        viewBox="0 0 800 380"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DCFCE7" />
            <stop offset="55%" stopColor="#FEF9C3" />
            <stop offset="100%" stopColor="#BBF7D0" />
          </linearGradient>
          <linearGradient id="oakTrunk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="50%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#57534E" />
          </linearGradient>
        </defs>
        <rect width="800" height="380" fill="url(#forestSky)" />
        {/* 远景树冠与林间光斑 */}
        <circle cx="150" cy="60" r="95" fill="#86EFAC" opacity="0.45" />
        <circle cx="330" cy="40" r="110" fill="#4ADE80" opacity="0.35" />
        <circle cx="670" cy="70" r="90" fill="#A7F3D0" opacity="0.5" />
        {/* 森林草地斜坡 */}
        <path d="M0 245 Q260 220 520 250 T800 240 L800 380 L0 380 Z" fill="#86EFAC" opacity="0.7" />
        <path d="M0 285 Q380 255 800 295 L800 380 L0 380 Z" fill="#4ADE80" opacity="0.55" />

        {/* 左侧大橡树树干与储粮树洞 (25%, 36%) */}
        <path d="M125 20 L255 20 L285 285 L95 285 Z" fill="url(#oakTrunk)" />
        <ellipse cx="200" cy="138" rx="34" ry="44" fill="#292524" stroke="#451A03" strokeWidth="6" />
        {/* 青苔刮痕与喜鹊尾羽 */}
        <path d="M172 168 Q200 182 228 168" stroke="#22C55E" strokeWidth="8" strokeLinecap="round" />
        <path d="M218 148 Q242 132 252 152 Q232 160 218 148 Z" fill="#1E293B" stroke="#F8FAFC" strokeWidth="2" />

        {/* 倒木与黑乎乎的深树洞 (68%, 30%) */}
        <rect x="465" y="86" width="165" height="62" rx="26" fill="#78350F" stroke="#451A03" strokeWidth="4" />
        <ellipse cx="545" cy="117" rx="28" ry="22" fill="#09090B" stroke="#27272A" strokeWidth="4" />
        {selectedActionId === 'act_nat_pickup_wave' && (
          <ellipse cx="545" cy="144" rx="40" ry="9" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
        )}

        {/* 草地上的两条分岔滚落压痕 (50%, 74% -> 一条通向枫叶堆 82%,56%，一条通向深树洞 68%,30%) */}
        <path
          d="M215 200 Q340 275 400 280"
          stroke="#B45309"
          strokeWidth="6"
          strokeDasharray="10 8"
          fill="none"
          opacity="0.75"
        />
        <path
          d="M400 280 Q530 265 645 220"
          stroke="#D97706"
          strokeWidth="5"
          strokeDasharray="8 7"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M400 280 Q480 210 538 142"
          stroke="#78350F"
          strokeWidth="5"
          strokeDasharray="8 7"
          fill="none"
          opacity="0.8"
        />

        {/* 右侧红枫叶堆 (82%, 56%)：未拨开时盖住，拨开后显露半个空橡果帽壳 */}
        <g transform="translate(610, 175)">
          {/* 拨开后显露的半个空橡果帽壳 */}
          <ellipse cx="48" cy="45" rx="26" ry="14" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <path d="M32 44 C32 28, 64 28, 64 44 Z" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
          <line x1="48" y1="26" x2="52" y2="19" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />

          {/* 红枫叶遮挡层 */}
          <g
            transform={isMaplePileOpened ? 'translate(34, -26) rotate(22)' : 'translate(0, 0)'}
            style={{ transition: 'transform 0.35s ease' }}
          >
            <ellipse cx="45" cy="42" rx="46" ry="26" fill="#EF4444" opacity="0.92" />
            <ellipse cx="32" cy="36" rx="32" ry="20" fill="#F97316" opacity="0.9" />
            <ellipse cx="62" cy="40" rx="28" ry="18" fill="#DC2626" opacity="0.9" />
          </g>
        </g>
      </svg>
    );
  }

  if (themeId === 'sports') {
    return (
      <svg
        data-testid="scene-env-sports"
        viewBox="0 0 800 380"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <rect width="800" height="380" fill="#ECFDF5" />
        <rect y="140" width="800" height="240" fill="#86EFAC" opacity="0.55" />
        <line x1="60" y1="150" x2="740" y2="150" stroke="#FFFFFF" strokeWidth="6" />
        <line x1="180" y1="150" x2="110" y2="370" stroke="#FFFFFF" strokeWidth="6" />
        {/* 球门框 */}
        <rect x="330" y="65" width="160" height="95" fill="none" stroke="#FFFFFF" strokeWidth="8" rx="6" />
        {/* 右侧冬青灌木丛 */}
        <circle cx="670" cy="205" r="55" fill="#15803D" opacity="0.75" />
        <circle cx="710" cy="220" r="45" fill="#166534" opacity="0.8" />
      </svg>
    );
  }

  if (themeId === 'puzzle') {
    return (
      <svg
        data-testid="scene-env-puzzle"
        viewBox="0 0 800 380"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <rect width="800" height="380" fill="#FFFBEB" />
        {/* 拼图木桌 */}
        <rect x="120" y="105" width="260" height="120" rx="14" fill="#FDE68A" stroke="#D97706" strokeWidth="4" />
        {/* 毛绒地毯与翻折角 */}
        <polygon points="210,255 590,255 630,360 175,360" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="4" />
        <polygon points="390,255 445,255 425,295" fill="#C4B5FD" stroke="#6D28D9" strokeWidth="3" />
        {/* 沙发抱枕 */}
        <rect x="615" y="175" width="95" height="72" rx="22" fill="#FBCFE8" stroke="#DB2777" strokeWidth="3" />
      </svg>
    );
  }

  // 默认画画主题（Case A：《美术角绿色蜡笔》及 Case 2）
  return (
    <svg
      data-testid="scene-env-drawing"
      viewBox="0 0 800 380"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="studioWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="68%" stopColor="#FFFBEB" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
      </defs>
      <rect width="800" height="380" fill="url(#studioWall)" />
      {/* 阳光木地板 */}
      <rect x="0" y="250" width="800" height="130" fill="#FCD34D" opacity="0.45" />
      <line x1="0" y1="250" x2="800" y2="250" stroke="#D97706" strokeWidth="3" />

      {/* 左侧画架与向日葵画布 (28%, 38%) */}
      <g transform="translate(155, 78)">
        <line x1="30" y1="165" x2="55" y2="10" stroke="#92400E" strokeWidth="6" strokeLinecap="round" />
        <line x1="115" y1="165" x2="90" y2="10" stroke="#92400E" strokeWidth="6" strokeLinecap="round" />
        <rect x="24" y="24" width="98" height="78" rx="8" fill="#FFFFFF" stroke="#B45309" strokeWidth="4" />
        <circle cx="73" cy="58" r="16" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
        {/* 行动反馈：若选了捡起蜡笔继续画，补上饱满绿叶 */}
        <path
          d="M73 74 L73 96"
          stroke="#10B981"
          strokeWidth={selectedActionId === 'act_pickup_and_apologize' ? '6' : '3'}
          strokeLinecap="round"
        />
        {selectedActionId === 'act_put_pen_box_rule' && (
          <rect x="98" y="68" width="22" height="30" rx="4" fill="#34D399" stroke="#047857" strokeWidth="2" />
        )}
      </g>

      {/* 椅子与拉紧拉链的皮皮书包 (68%, 30%) */}
      <g transform="translate(500, 74)">
        <rect x="10" y="18" width="68" height="76" rx="18" fill="#BAE6FD" stroke="#0284C7" strokeWidth="4" />
        <line x1="22" y1="45" x2="66" y2="45" stroke="#0369A1" strokeWidth="4" strokeDasharray="5 3" />
        <rect x="38" y="40" width="12" height="12" rx="3" fill="#0284C7" />
      </g>

      {/* 地板上的彩色猫爪梅花印轨迹 (48%, 76% -> 通向右侧窗帘 82%, 58%) */}
      {scenarioId === 'scenario_detective_drawing_v1' && (
        <g opacity="0.85">
          <circle cx="310" cy="285" r="7" fill="#10B981" />
          <circle cx="365" cy="296" r="8" fill="#F59E0B" />
          <circle cx="425" cy="288" r="8" fill="#10B981" />
          <circle cx="495" cy="276" r="7" fill="#34D399" />
          <circle cx="565" cy="256" r="8" fill="#10B981" />
          <path
            d="M285 275 Q430 305 630 232"
            stroke="#059669"
            strokeWidth="3.5"
            strokeDasharray="7 7"
            fill="none"
          />
        </g>
      )}

      {/* 右侧窗户与可掀开的布窗帘 (82%, 58%) */}
      <g transform="translate(612, 36)">
        <rect x="0" y="0" width="118" height="145" rx="10" fill="#E0F2FE" stroke="#F59E0B" strokeWidth="5" />
        {/* 窗帘底下的绿色蜡笔（掀开窗帘后完整显露） */}
        <g transform="translate(26, 168)">
          <rect x="0" y="0" width="54" height="14" rx="5" fill="#10B981" stroke="#047857" strokeWidth="2.5" />
          <polygon points="54,0 68,7 54,14" fill="#059669" />
        </g>
        {/* 可掀开的暖橙窗帘布 */}
        <path
          d={
            isCurtainLifted
              ? 'M8 0 L112 0 L92 128 Q56 112 18 136 Z'
              : 'M8 0 L112 0 L116 196 Q60 206 6 194 Z'
          }
          fill="#FDE68A"
          stroke="#D97706"
          strokeWidth="4"
        />
      </g>
    </svg>
  );
};

export const CrayonDetectiveGame: React.FC<Props> = ({
  onExit,
  initialTheme,
  previewSessionToken = null,
  onOpenTransferLab,
}) => {
  const { personalization, updatePersonalization, unlockMedal } = useApp();
  const [localSessionToken, setLocalSessionToken] = useState<string | null>(null);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [, setAccessVersion] = useState(0);
  const [experienceMetrics, setExperienceMetrics] = useState(() => getProductExperienceMetrics());

  useEffect(() => {
    const unsubAccess = subscribeParentAccess(() => {
      setAccessVersion((v) => v + 1);
    });
    const unsubMetrics = subscribeProductExperienceMetrics((m) => {
      setExperienceMetrics(m);
    });
    return () => {
      unsubAccess();
      unsubMetrics();
    };
  }, []);

  useEffect(() => {
    return () => {
      revokeAdultPreviewSession(SCOPE_KEY);
    };
  }, []);

  const effectiveToken = previewSessionToken ?? localSessionToken;
  const adultPreviewUnlocked = isAdultPreviewSessionValid(SCOPE_KEY, effectiveToken);

  // 独立内容审核门禁：未通过审核时阻断儿童正式运行时
  const isApproved = ContentAuditRegistry.canRenderContent('game_crayon_detective');

  // 当前激活的兴趣场景皮肤（默认跟随儿童全局偏好，也可在游戏内随时切换）
  const [activeTheme, setActiveTheme] = useState<InterestActivityId>(
    initialTheme || personalization.primaryInterest || 'drawing'
  );
  // 当前主题下的案件序号（每个主题含至少 2 个独立案件）
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);

  const themeCases = getThemedScenarioCasesByInterest(activeTheme);
  const scenario = themeCases[activeCaseIndex] || getThemedScenarioByInterest(activeTheme);
  const currentHotspots = scenario.hotspots;
  const currentBaskets = scenario.sortingBaskets;
  const currentCompanion =
    ANIMAL_COMPANIONS[personalization.companionId] || ANIMAL_COMPANIONS.guoguo_squirrel;

  // P0-01：显式案件状态机
  const [caseStatus, setCaseStatus] = useState<DetectiveCaseStatus>('NOT_STARTED');

  // 放大镜位置（百分比）
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isDraggingLens, setIsDraggingLens] = useState(false);

  // 已发现的线索 ID 列表（仅当儿童真实触碰/操作场景物体后加入）
  const [discoveredClueIds, setDiscoveredClueIds] = useState<string[]>([]);
  // 调查方向高亮提示的目标热点 ID 列表（P0-03：调查方向只高亮引导，不替儿童自动领取全部线索）
  const [highlightedHotspotIds, setHighlightedHotspotIds] = useState<string[]>([]);
  // 已在场景中掀开/拨开的遮挡物热点 ID
  const [revealedObjectIds, setRevealedObjectIds] = useState<string[]>([]);
  // 当前处于探照焦点的热点
  const [activeHotspot, setActiveHotspot] = useState<HotspotEvidence | null>(null);

  // 分类状态：clueId -> targetBasket
  const [placements, setPlacements] = useState<Record<string, SortingBasketType>>({});
  // 记录每个线索是否已记录过首次归类统计
  const [attemptedClueIds, setAttemptedClueIds] = useState<string[]>([]);
  // 当前被选中的待放置卡片
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);

  // 六层思考核心状态：
  // 阶段 1（停）：初步判断 ID
  const [initialHypothesisId, setInitialHypothesisId] = useState<string | null>(null);
  // 阶段 2（通）：已探索的调查方向 ID 列表
  const [exploredLeadIds, setExploredLeadIds] = useState<string[]>([]);
  // 阶段 3（辨）：发现新证据后修正/确认后的判断 ID + 证据关系评估结果
  const [revisedHypothesisId, setRevisedHypothesisId] = useState<string | null>(null);
  const [hypothesisEvaluation, setHypothesisEvaluation] = useState<HypothesisEvaluationResult | null>(null);
  // 阶段 4（择）：选择的下一步温和行动 ID
  const [chosenNextActionId, setChosenNextActionId] = useState<string | null>(null);
  // Sprint 1.2 任务二：是否在本案完成前提前查看过完整参考结局
  const [hasViewedReferenceBeforeCompletion, setHasViewedReferenceBeforeCompletion] = useState<boolean>(false);
  // 内嵌能力迁移实验室弹窗开关
  const [isEmbeddedTransferOpen, setIsEmbeddedTransferOpen] = useState(false);

  // 当前温和提示语
  const [feedbackPrompt, setFeedbackPrompt] = useState<string>(scenario.spokenIntro);

  // 是否打开破案手册浮层
  const [isSynthesisOpen, setIsSynthesisOpen] = useState(false);

  const sceneContainerRef = useRef<HTMLDivElement>(null);

  // 初始化与组件卸载清理，以及主题/案件切换响应
  useEffect(() => {
    speechNarrator.speak(scenario.spokenIntro);
    return () => {
      speechNarrator.stop();
    };
  }, [activeTheme, activeCaseIndex]);

  const resetCaseState = (targetScenarioIntro: string) => {
    setCaseStatus('NOT_STARTED');
    setDiscoveredClueIds([]);
    setHighlightedHotspotIds([]);
    setRevealedObjectIds([]);
    setPlacements({});
    setAttemptedClueIds([]);
    setSelectedClueId(null);
    setActiveHotspot(null);
    setInitialHypothesisId(null);
    setExploredLeadIds([]);
    setRevisedHypothesisId(null);
    setHypothesisEvaluation(null);
    setChosenNextActionId(null);
    setHasViewedReferenceBeforeCompletion(false);
    setLensPos({ x: 50, y: 50 });
    setIsSynthesisOpen(false);
    setFeedbackPrompt(targetScenarioIntro);
  };

  /**
   * Sprint 1.2 任务二：基于统一、可测试的 evaluateDetectiveCaseCompletionReadiness 推进案件完成状态
   * 必须满足：
   * 1. 已获取案件级关键证据 (hasKeyEvidence)；
   * 2. 已尝试并将至少 1 条已获取证据正确归类 (hasAttemptedSorting && hasValidSortedClue)；
   * 3. 已依据当前证据重新检查判断 (hasCheckedHypothesisWithEvidence，允许“还不知道”)；
   * 4. 已选择与掌握信息相称的行动 (hasProportionateAction)；
   * 5. 区分独立完成 (COMPLETED) 与提前查看参考结局后完成 (COMPLETED_AFTER_REFERENCE)。
   */
  const tryCompleteDetectiveLoop = (overrides?: {
    discoveredClueIds?: ReadonlyArray<string>;
    revealedObjectIds?: ReadonlyArray<string>;
    placements?: Readonly<Record<string, SortingBasketType>>;
    initialHypothesisId?: string | null;
    revisedHypothesisId?: string | null;
    chosenNextActionId?: string | null;
    hasViewedReferenceBeforeCompletion?: boolean;
  }): DetectiveCaseCompletionReadiness => {
    const nextDiscovered = overrides?.discoveredClueIds ?? discoveredClueIds;
    const nextRevealed = overrides?.revealedObjectIds ?? revealedObjectIds;
    const nextPlacements = overrides?.placements ?? placements;
    const nextInitialHyp =
      overrides?.initialHypothesisId !== undefined ? overrides.initialHypothesisId : initialHypothesisId;
    const nextRevisedHyp =
      overrides?.revisedHypothesisId !== undefined ? overrides.revisedHypothesisId : revisedHypothesisId;
    const nextAction =
      overrides?.chosenNextActionId !== undefined ? overrides.chosenNextActionId : chosenNextActionId;
    const nextViewedRef =
      overrides?.hasViewedReferenceBeforeCompletion ?? hasViewedReferenceBeforeCompletion;

    const readiness = evaluateDetectiveCaseCompletionReadiness({
      scenario,
      discoveredClueIds: nextDiscovered,
      revealedObjectIds: nextRevealed,
      placements: nextPlacements,
      initialHypothesisId: nextInitialHyp,
      revisedHypothesisId: nextRevisedHyp,
      chosenNextActionId: nextAction,
      hasViewedReferenceBeforeCompletion: nextViewedRef,
    });

    if (readiness.isReadyToComplete && readiness.completionStatus) {
      setCaseStatus(readiness.completionStatus);
      recordDetectiveCaseCompletion(scenario.id, {
        status: readiness.completionStatus,
        discoveredClueCount: readiness.validDiscoveredClueIds.length,
        hasKeyEvidence: readiness.hasKeyEvidence,
        hasAttemptedSorting: readiness.hasAttemptedSorting && readiness.hasValidSortedClue,
        hasCheckedHypothesisWithEvidence: readiness.hasCheckedHypothesisWithEvidence,
        hasSelectedHypothesis: Boolean(nextRevisedHyp || nextInitialHyp),
        hasSelectedAction: Boolean(nextAction),
        hasProportionateAction: readiness.hasProportionateAction,
        hasViewedReferenceBeforeCompletion: readiness.hasViewedReferenceBeforeCompletion,
      });
      if (readiness.completionStatus === 'COMPLETED') {
        unlockMedal('sun-detective');
      }
    }

    return readiness;
  };

  // 切换主题场景时安全重置探索进度
  const handleSwitchTheme = (themeId: InterestActivityId) => {
    if (themeId === activeTheme) return;
    sounds.playClick();
    speechNarrator.stop();
    setActiveTheme(themeId);
    setActiveCaseIndex(0);
    updatePersonalization({ primaryInterest: themeId });
    const nextCases = getThemedScenarioCasesByInterest(themeId);
    const nextScenario = nextCases[0] || getThemedScenarioByInterest(themeId);
    resetCaseState(nextScenario.spokenIntro);
  };

  // 切换同主题下的不同案件（Case 1 / Case 2）
  const handleSwitchCase = (caseIdx: number) => {
    if (caseIdx === activeCaseIndex) return;
    sounds.playCardSelect();
    speechNarrator.stop();
    setActiveCaseIndex(caseIdx);
    const nextScenario = themeCases[caseIdx] || themeCases[0];
    resetCaseState(nextScenario.spokenIntro);
  };

  // 阶段 1：选择初步判断（支持选“还不知道”）
  const handleSelectInitialHypothesis = (hypId: string) => {
    sounds.playCardSelect();
    setInitialHypothesisId(hypId);
    setCaseStatus((prev) => (prev === 'NOT_STARTED' || prev === 'ENDED_EARLY' ? 'EXPLORING' : prev));
    recordDetectiveCaseState(scenario.id, 'EXPLORING');
    const hyp = scenario.initialHypotheses?.find((h) => h.id === hypId);
    if (hyp) {
      if (hyp.isUnknownOption) {
        recordUnknownHonestyChoice(scenario.id);
      }
      setFeedbackPrompt(`${currentCompanion.name}：${hyp.feedbackText}`);
      speechNarrator.speak(hyp.feedbackText);
    }
  };

  // 阶段 2（P0-03）：选择调查方向仅高亮引导场景目标物，不替孩子自动解锁全部线索
  const handleChooseInvestigationLead = (leadId: string) => {
    const lead = scenario.investigationLeads?.find((l) => l.id === leadId);
    if (!lead) return;
    sounds.playDiscoveryChime();
    setCaseStatus((prev) => (prev === 'NOT_STARTED' || prev === 'ENDED_EARLY' ? 'EXPLORING' : prev));
    recordDetectiveCaseState(scenario.id, 'EXPLORING');
    if (!exploredLeadIds.includes(leadId)) {
      setExploredLeadIds((prev) => [...prev, leadId]);
    }
    setHighlightedHotspotIds([...lead.targetHotspotIds]);
    const targetSpots = currentHotspots.filter((h) => lead.targetHotspotIds.includes(h.id));
    if (targetSpots.length > 0) {
      const firstUnfound = targetSpots.find((s) => !discoveredClueIds.includes(s.id)) || targetSpots[0];
      setLensPos({ x: firstUnfound.xPercent, y: firstUnfound.yPercent });
    }
    setFeedbackPrompt(`${currentCompanion.name}：${lead.discoverySpokenText}`);
    speechNarrator.speak(lead.discoverySpokenText);
  };

  // 阶段 3（P0-02）：发现新证据后修正/确认判断（根据真实已发现线索评估支持/反驳/证据不足）
  const handleReviseHypothesis = (hypId: string) => {
    sounds.playDiscoveryChime();
    const previousJudgmentId = revisedHypothesisId ?? initialHypothesisId;
    setRevisedHypothesisId(hypId);

    const evaluation = evaluateHypothesisAgainstEvidence(scenario, hypId, discoveredClueIds);
    setHypothesisEvaluation(evaluation);

    const hyp = scenario.initialHypotheses?.find((h) => h.id === hypId);
    if (hyp?.isUnknownOption) {
      recordUnknownHonestyChoice(scenario.id);
    }

    // 仅当判断真实发生变化且已有发现线索时才计入判断修正次数
    recordHypothesisRevision({
      caseId: scenario.id,
      previousHypothesisId: previousJudgmentId,
      nextHypothesisId: hypId,
      discoveredClueCount: discoveredClueIds.length,
    });

    const readiness = tryCompleteDetectiveLoop({
      revisedHypothesisId: hypId,
    });

    if (!readiness.isReadyToComplete) {
      setCaseStatus((prev) => {
        if (prev === 'COMPLETED' || prev === 'COMPLETED_AFTER_REFERENCE') return prev;
        if (chosenNextActionId) return 'ACTION_SELECTED';
        return 'REFLECTING';
      });
    }

    setFeedbackPrompt(evaluation.spokenFeedback);
    speechNarrator.speak(evaluation.spokenFeedback);
  };

  // 阶段 4（P0-01 / P1-02）：选择下一步行动并观察场景与角色反应
  const handleSelectNextAction = (actionId: string) => {
    const choice = scenario.nextActionChoices?.find((c) => c.id === actionId);
    if (!choice) return;
    sounds.playCardSelect();
    setChosenNextActionId(actionId);

    const readiness = tryCompleteDetectiveLoop({
      chosenNextActionId: actionId,
    });

    if (!readiness.isReadyToComplete) {
      setCaseStatus((prev) =>
        prev === 'COMPLETED' || prev === 'COMPLETED_AFTER_REFERENCE' ? prev : 'ACTION_SELECTED'
      );
      recordDetectiveCaseState(scenario.id, 'ACTION_SELECTED');
    }

    const spoken = choice.worldChangeSummary
      ? `${choice.feedbackText} ${choice.worldChangeSummary}`
      : choice.feedbackText;
    setFeedbackPrompt(spoken);
    speechNarrator.speak(spoken);
  };

  /**
   * Sprint 1.2 任务一：修复真实场景触控与物体发现机制
   * 1. 需要掀开、拨开的物体 (requiresObjectReveal)，第一次操作只改变遮挡状态 (revealedObjectIds)，不加入已获证据；
   * 2. 完成揭示动作后，第二次触碰才真正获取对应的隐藏证据 (discoveredClueIds)；
   * 3. 尚未获得的证据不能进入线索册或归类盒。
   */
  const inspectSceneObject = (spot: HotspotEvidence) => {
    setLensPos({ x: spot.xPercent, y: spot.yPercent });
    setActiveHotspot(spot);
    setCaseStatus((prev) => (prev === 'NOT_STARTED' || prev === 'ENDED_EARLY' ? 'EXPLORING' : prev));
    recordDetectiveCaseState(scenario.id, 'EXPLORING');

    // 第 1 次点击需要掀开/拨开的遮挡物：只改变遮挡状态，不获取隐藏证据
    if (spot.requiresObjectReveal && !revealedObjectIds.includes(spot.id)) {
      sounds.playCardSelect();
      const nextRevealed = [...revealedObjectIds, spot.id];
      setRevealedObjectIds(nextRevealed);
      setSelectedClueId(null);

      const revealPrompt =
        spot.id === 'hs_curtain'
          ? '窗帘已经掀开一角，露出了底下的绿色蜡笔！再点一次完成取证并记进线索册吧！'
          : spot.id === 'hs_nature_leaf_pile'
            ? '红枫叶堆已经拨开，露出了底下的半个空帽壳！再点一次仔细检查并收进线索册吧！'
            : `已经${spot.interactionVerb || '掀开'}「${spot.name}」，再点一次获取里面的隐藏证据吧！`;
      setFeedbackPrompt(revealPrompt);
      speechNarrator.speak(revealPrompt);
      return;
    }

    // 已完成揭示（或无需揭示的普通物体）：真正获取证据
    setSelectedClueId(spot.id);
    const isFirstTimeDiscovery = !discoveredClueIds.includes(spot.id);
    const priorClues = discoveredClueIds;

    if (isFirstTimeDiscovery) {
      sounds.playClick();
      const nextClues = [...discoveredClueIds, spot.id];
      setDiscoveredClueIds(nextClues);

      // 若已选过修正判断，随着新证据加入实时刷新证据支撑评估
      if (revisedHypothesisId) {
        setHypothesisEvaluation(evaluateHypothesisAgainstEvidence(scenario, revisedHypothesisId, nextClues));
      }

      tryCompleteDetectiveLoop({
        discoveredClueIds: nextClues,
      });
    } else {
      sounds.playClick();
    }

    const orderFeedback = getOrderAwareDiscoveryFeedback(
      scenario,
      spot,
      isFirstTimeDiscovery ? priorClues : priorClues.filter((id) => id !== spot.id)
    );
    setFeedbackPrompt(orderFeedback);
    speechNarrator.speak(spot.spokenText);
  };

  // Sprint 1.2 任务一：场景空白区域仅负责移动放大镜，绝不重复触发物体检查
  const updateLensOnBlankArea = (e: React.PointerEvent<HTMLDivElement>) => {
    const targetEl = e.target as HTMLElement | null;
    if (targetEl && targetEl.closest('button')) {
      return;
    }
    if (!sceneContainerRef.current) return;
    const rect = sceneContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const xPct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));

    setLensPos({ x: xPct, y: yPct });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingLens) return;
    updateLensOnBlankArea(e);
  };

  const handleSceneClick = (e: React.PointerEvent<HTMLDivElement>) => {
    updateLensOnBlankArea(e);
  };

  // 物体按钮独立处理检查
  const handleDirectInspect = (spot: HotspotEvidence) => {
    inspectSceneObject(spot);
  };

  // 选择放置卡片（仅限已真正获得的证据）
  const handleSelectCard = (clueId: string) => {
    if (!discoveredClueIds.includes(clueId)) return;
    sounds.playClick();
    setSelectedClueId(clueId === selectedClueId ? null : clueId);
    const clue = currentHotspots.find((h) => h.id === clueId);
    if (clue) {
      setActiveHotspot(clue);
      speechNarrator.speak(clue.spokenText);
    }
  };

  // 放置到目标箩筐（严格拦截尚未完成揭示或尚未获取的证据）
  const handlePlaceIntoBasket = (basketId: SortingBasketType, explicitClueId?: string) => {
    const targetId = explicitClueId ?? selectedClueId ?? activeHotspot?.id ?? null;
    if (!targetId) {
      setFeedbackPrompt('先在场景里点一件线索物体，再点要放进的盒子吧！');
      return;
    }

    const clue = currentHotspots.find((h) => h.id === targetId);
    if (!clue) return;

    if (!discoveredClueIds.includes(targetId)) {
      setFeedbackPrompt('这条线索还没有完成现场取证，先在场景里再次点击获取证据吧！');
      return;
    }

    if (clue.requiresObjectReveal && !revealedObjectIds.includes(targetId)) {
      setFeedbackPrompt('先掀开遮挡物并再次点击获取证据，才能放进归类盒哦！');
      return;
    }

    sounds.playClick();
    const evaluation = evaluateThemedCluePlacement(clue.category, basketId);

    if (!attemptedClueIds.includes(clue.id)) {
      setAttemptedClueIds((prev) => [...prev, clue.id]);
      recordClueClassificationAttempt(evaluation.isMatch);
    }

    const nextPlacements: Record<string, SortingBasketType> = {
      ...placements,
      [targetId]: basketId,
    };
    setPlacements(nextPlacements);

    const readiness = tryCompleteDetectiveLoop({
      placements: nextPlacements,
    });

    if (!readiness.isReadyToComplete) {
      setCaseStatus((prev) => {
        if (prev === 'COMPLETED' || prev === 'COMPLETED_AFTER_REFERENCE' || prev === 'ACTION_SELECTED') {
          return prev;
        }
        return 'REFLECTING';
      });
    }

    setSelectedClueId(null);
    setFeedbackPrompt(evaluation.spokenFeedback);
    speechNarrator.speak(evaluation.spokenFeedback);
  };

  // 撤销某卡片的放置
  const handleUndoPlacement = (clueId: string) => {
    sounds.playClick();
    setPlacements((prev) => {
      const copy = { ...prev };
      delete copy[clueId];
      return copy;
    });
    setFeedbackPrompt('已将线索卡放回待分堆，随时可以重新摆放。');
  };

  // 重置整个房间
  const handleResetGame = () => {
    sounds.playClick();
    resetCaseState('已重新整理场景，拿起放大镜重新找找吧！');
    speechNarrator.speak('已重新整理场景，拿起放大镜重新找找吧！');
  };

  /**
   * Sprint 1.2 任务二：打开侦探破案手册
   * 1. 调用 evaluateDetectiveCaseCompletionReadiness 检查真实认知闭环；
   * 2. 未达标时提前查看完整参考结局 -> 记为 ENDED_EARLY 并标记 hasViewedReferenceBeforeCompletion = true；
   * 3. 提前查看完整答案后继续探索完成 -> 记为 COMPLETED_AFTER_REFERENCE（辅助完成），与独立完成严格区分。
   */
  const handleOpenSynthesis = () => {
    sounds.playDiscoveryChime();
    setIsSynthesisOpen(true);

    const readiness = tryCompleteDetectiveLoop();

    if (
      !readiness.isReadyToComplete &&
      caseStatus !== 'COMPLETED' &&
      caseStatus !== 'COMPLETED_AFTER_REFERENCE'
    ) {
      setHasViewedReferenceBeforeCompletion(true);
      setCaseStatus('ENDED_EARLY');
      recordDetectiveCaseState(scenario.id, 'ENDED_EARLY');
      const missingHint =
        readiness.missingStepDescriptions[0] ||
        '完成关键物证查验、线索归类、判断核对与行动选择';
      const earlyMsg = `你打开了侦探参考手册！目前还差一步：${missingHint}。提前看参考不会直接算作独立破案完成哦，随时可以回现场继续探索。`;
      setFeedbackPrompt(earlyMsg);
      speechNarrator.speak(earlyMsg);
      return;
    }

    const summarySpeech = scenario.resolutionSummary
      ? `太棒了小侦探！${scenario.resolutionSummary}`
      : '太棒了小侦探！我们完成了完整的现场取证与破案闭环。';
    speechNarrator.speak(summarySpeech);
  };

  const handleExitGame = () => {
    speechNarrator.stop();
    setLocalSessionToken(null);
    setIsParentGateOpen(false);
    revokeAdultPreviewSession(SCOPE_KEY);
    if (!isInternalPlaytestEnabled()) {
      lockParentAccess();
    }
    onExit();
  };

  const handleRequestAdultPreview = () => {
    sounds.playClick();
    setLocalSessionToken(null);
    revokeAdultPreviewSession();
    lockParentAccess();
    setIsParentGateOpen(true);
  };

  if (!isApproved && !adultPreviewUnlocked) {
    return (
      <div data-testid="audit-gate-blocked" className="p-6 sm:p-8 bg-amber-50 rounded-3xl border-2 border-amber-200 text-stone-800 text-center space-y-4 my-4 max-w-xl mx-auto">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ClueVisualIcon icon="🌱" className="w-9 h-9" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-amber-950">这个小游戏正在做最后准备</h3>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
          「蜡笔侦探」正在由大人们做最后的安全检查，准备好后再陪你一起玩。现在可以先回小岛去呼吸角、晴雨气象台或做一件找回勇气的小事哦！
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

  // 计算当前放对盒子的卡片数（仅统计已真正获取的证据）
  const correctlySortedCount = currentHotspots.filter((h) => {
    if (!discoveredClueIds.includes(h.id)) return false;
    const placed = placements[h.id];
    if (!placed) return false;
    return evaluateThemedCluePlacement(h.category, placed).isMatch;
  }).length;

  const selectedActionObj = scenario.nextActionChoices?.find((c) => c.id === chosenNextActionId) || null;
  const currentReadiness = evaluateDetectiveCaseCompletionReadiness({
    scenario,
    discoveredClueIds,
    revealedObjectIds,
    placements,
    initialHypothesisId,
    revisedHypothesisId,
    chosenNextActionId,
    hasViewedReferenceBeforeCompletion,
  });

  const currentGoalText = currentReadiness.isReadyToComplete
    ? '🌟 已完成全部侦探步骤！可以打开破案手册查看复盘啦'
    : !initialHypothesisId && discoveredClueIds.length === 0
      ? '🎯 当前目标：先选一个初步想法，再点场景里的物体寻找关键证据'
      : !currentReadiness.hasKeyEvidence
        ? '🎯 当前目标：点击场景物体（遮挡物点第 1 下掀开、第 2 下取证）集齐关键证据'
        : !currentReadiness.hasAttemptedSorting || !currentReadiness.hasValidSortedClue
          ? '🎯 当前目标：把找到的线索卡放进正确的「分一分」分类盒'
          : !currentReadiness.hasCheckedHypothesisWithEvidence
            ? '🎯 当前目标：在「4 · 辨一辨」对照物证确认或修正你的判断'
            : '🎯 当前目标：在「5 · 试行动」选一个与当前信息相称的做法';

  const currentJudgmentLabel =
    scenario.initialHypotheses?.find((h) => h.id === (revisedHypothesisId ?? initialHypothesisId))?.label ||
    '尚未选择判断（保留思考空间）';

  return (
    <div className="w-full max-w-4xl mx-auto bg-stone-50 rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden flex flex-col">
      {adultPreviewUnlocked && !isApproved && (
        <div
          className={
            onOpenTransferLab
              ? 'sr-only'
              : 'bg-amber-500 text-white text-xs font-black px-3 py-1 flex flex-wrap items-center justify-between gap-2'
          }
        >
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>
              {isInternalPlaytestEnabled()
                ? '🧪 内部研发连续试玩模式 · 正式审核状态仍为 PENDING_REVIEW'
                : '⚠️ 家长与审阅人预览模式 · 请在成年人陪伴下审阅，尚未面向儿童正式开放'}
            </span>
          </div>
          <span className="bg-amber-700 px-2 py-0.5 rounded-full text-[10px]">
            {isInternalPlaytestEnabled() ? '内部试玩中' : '大人陪伴审阅'}
          </span>
        </div>
      )}

      {/* 顶部紧凑状态与安全退出栏 */}
      <div className="bg-amber-100/90 px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center justify-between gap-2 border-b border-amber-200">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-200/90 flex items-center justify-center shrink-0 shadow-xs">
            <MagnifierLensSvg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm sm:text-lg font-black text-amber-950 truncate">
                {scenario.sceneTitle}
              </h2>
              <span
                data-testid="detective-case-status-badge"
                data-status={caseStatus}
                className={`text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full ${
                  caseStatus === 'COMPLETED'
                    ? 'bg-emerald-600 text-white'
                    : caseStatus === 'COMPLETED_AFTER_REFERENCE'
                      ? 'bg-sky-600 text-white'
                      : caseStatus === 'ENDED_EARLY'
                        ? 'bg-stone-300 text-stone-800'
                        : 'bg-amber-200/90 text-amber-950'
                }`}
              >
                {CASE_STATUS_LABELS[caseStatus]}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-[11px] text-amber-900">
              <span>找：{scenario.missingItemLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-bold">线索 {discoveredClueIds.length}/{currentHotspots.length}</span>
              <span aria-hidden="true">·</span>
              <span className="font-bold text-emerald-800">
                已破案 {experienceMetrics.completedDetectiveCaseIds.length} 起
              </span>
              <span className="hidden sm:inline text-amber-800/80">· 结构同构 · 人工审核</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => speechNarrator.speak(feedbackPrompt)}
            className="min-h-[38px] sm:min-h-[42px] px-2 py-1 rounded-xl bg-amber-200/90 hover:bg-amber-300 text-amber-950 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            aria-label="重听语音引导"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <span className="hidden sm:inline">重听提示</span>
          </button>
          <button
            type="button"
            onClick={handleExitGame}
            className="min-h-[38px] sm:min-h-[42px] px-2.5 py-1 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
            aria-label="离开侦探社"
          >
            离开
          </button>
        </div>
      </div>

      {/* 兴趣皮肤快速切换栏 + 同主题双案件切换器 */}
      <div className="bg-amber-50/70 px-2.5 py-1 border-b border-amber-200 flex items-center justify-between gap-1.5 overflow-x-auto">
        <div
          role="tablist"
          aria-label="选择侦探场景兴趣主题"
          className="flex items-center gap-1 shrink-0"
        >
          {(Object.keys(INTEREST_ACTIVITIES) as InterestActivityId[]).map((themeKey) => {
            const act = INTEREST_ACTIVITIES[themeKey];
            const isCurrent = activeTheme === themeKey;
            return (
              <button
                key={themeKey}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                onClick={() => handleSwitchTheme(themeKey)}
                className={`min-h-[34px] sm:min-h-[38px] px-2 py-0.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  isCurrent
                    ? 'bg-amber-400 text-stone-900 shadow-xs ring-2 ring-amber-300'
                    : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-200'
                }`}
                aria-label={`切换为${act.label}主题`}
              >
                <InterestBadgeSvg interestId={themeKey} className="w-3.5 h-3.5 shrink-0" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

        {themeCases.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            {themeCases.map((c, idx) => {
              const isCurrentCase = idx === activeCaseIndex;
              const isSolved = experienceMetrics.completedDetectiveCaseIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  data-testid={`switch-case-${idx + 1}`}
                  onClick={() => handleSwitchCase(idx)}
                  className={`min-h-[34px] sm:min-h-[38px] px-2 py-0.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                    isCurrentCase
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-emerald-50 border border-stone-200'
                  }`}
                  aria-label={`切换到案件${idx + 1}：${c.sceneTitle}`}
                >
                  <span>案件 {idx + 1}</span>
                  {isSolved && <span aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* P1-01 & Sprint 1.2 任务五：手机端首屏突出一个当前探索目标 + 场景优先 */}
      <div className="p-2 sm:p-3.5 space-y-2.5">
        <div
          data-testid="detective-current-goal-pill"
          className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1 text-[11px] sm:text-xs font-black text-emerald-950 flex items-center justify-between gap-2"
        >
          <span className="truncate">{currentGoalText}</span>
          <span className="text-[10px] font-bold text-emerald-700 shrink-0">
            关键物证 {currentReadiness.hasKeyEvidence ? '已找齐 ✓' : '待查验'}
          </span>
        </div>

        {/* 1. 核心探索场景画布 (Scene-First Interactive Canvas - 手机首屏直接可见) */}
        <div
          ref={sceneContainerRef}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement | null)?.closest('button')) return;
            setIsDraggingLens(true);
            handleSceneClick(e);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={() => setIsDraggingLens(false)}
          onPointerCancel={() => setIsDraggingLens(false)}
          className="relative w-full h-56 sm:h-72 rounded-2xl border-2 border-amber-300 overflow-hidden cursor-crosshair touch-none select-none shadow-inner bg-amber-50"
          aria-label="侦探探索小房间全景"
        >
          {/* 差异化 SVG 主题场景环境 */}
          <DetectiveEnvironmentSceneSvg
            themeId={activeTheme}
            scenarioId={scenario.id}
            revealedObjectIds={revealedObjectIds}
            selectedActionId={chosenNextActionId}
          />

          {/* 场景热点物体（物体按钮独立处理检查，阻断父容器 pointer/touch 冒泡，防止单次触控双触发） */}
          {currentHotspots.map((spot) => {
            const isDiscovered = discoveredClueIds.includes(spot.id);
            const isHighlighted = highlightedHotspotIds.includes(spot.id) && !isDiscovered;
            const isRevealed = revealedObjectIds.includes(spot.id);
            const isThoughtBubble = spot.category === 'INFERENCE';
            const isUnknownSpot = spot.category === 'UNKNOWN';

            return (
              <button
                key={spot.id}
                type="button"
                data-testid={`scene-hotspot-${spot.id}`}
                data-category={spot.category}
                data-highlighted={isHighlighted ? 'true' : 'false'}
                data-revealed={isRevealed ? 'true' : 'false'}
                data-discovered={isDiscovered ? 'true' : 'false'}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectInspect(spot);
                }}
                style={{
                  left: `${spot.xPercent}%`,
                  top: `${spot.yPercent}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1.5 rounded-2xl transition-all duration-300 min-w-[54px] min-h-[54px] flex flex-col items-center justify-center cursor-pointer ${
                  isDiscovered
                    ? 'bg-amber-400 text-amber-950 scale-105 shadow-md ring-4 ring-amber-200/90'
                    : isRevealed && spot.requiresObjectReveal
                      ? 'bg-emerald-100 text-emerald-950 scale-110 shadow-lg ring-4 ring-emerald-400 border-2 border-emerald-600'
                      : isHighlighted
                        ? 'bg-sky-100 text-sky-950 scale-110 shadow-lg ring-4 ring-sky-400 animate-pulse border-2 border-sky-500'
                        : isThoughtBubble
                          ? 'bg-amber-50/95 text-amber-900 border-2 border-dashed border-amber-500 shadow-xs'
                          : isUnknownSpot
                            ? 'bg-sky-50/95 text-sky-900 border-2 border-sky-400 shadow-xs'
                            : 'bg-white/95 text-stone-800 hover:scale-105 shadow-sm border-2 border-stone-300'
                }`}
                aria-label={`查看${spot.name}`}
              >
                <ClueVisualIcon icon={spot.icon} clueId={spot.id} category={spot.category} className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="text-[10px] font-black leading-tight mt-0.5 max-w-[76px] truncate">
                  {spot.requiresObjectReveal && !isRevealed
                    ? spot.interactionVerb || spot.name
                    : spot.requiresObjectReveal && isRevealed && !isDiscovered
                      ? `点取：${spot.name}`
                      : spot.name}
                </span>
              </button>
            );
          })}

          {/* 物理仿真放大镜浮层 */}
          <div
            style={{
              left: `${lensPos.x}%`,
              top: `${lensPos.y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-600 bg-amber-100/25 backdrop-blur-[1px] shadow-xl ring-2 ring-amber-300/60 flex items-end justify-center pb-1">
              <span className="text-[10px] font-black text-amber-950 bg-white/95 px-2 py-0.5 rounded-full shadow-2xs border border-amber-200 truncate max-w-[90px]">
                {activeHotspot ? activeHotspot.name : '点物体调查'}
              </span>
            </div>
          </div>
        </div>

        {/* 动物伙伴实时简短提示条（紧随场景画布下方） */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl px-3 py-1.5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0 p-1">
            <CompanionAvatarSvg companionId={currentCompanion.id} className="w-full h-full" />
          </div>
          <p
            data-testid="detective-companion-prompt"
            className="flex-1 min-w-0 text-xs font-black text-stone-800 leading-snug"
          >
            {feedbackPrompt}
          </p>
          <button
            type="button"
            onClick={handleResetGame}
            className="min-h-[36px] text-xs px-2.5 py-1 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-colors shrink-0 cursor-pointer"
          >
            重来
          </button>
        </div>

        {/* P1-01 & Sprint 1.2 任务一：场景内选中的线索即时查看与一键三盒归类浮层 (仅当真正获取证据后才允许归类) */}
        {activeHotspot && (
          <div
            data-testid="scene-object-popover"
            className="bg-white rounded-2xl border-2 border-amber-300 p-3 shadow-md space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <ClueVisualIcon
                    icon={activeHotspot.icon}
                    clueId={activeHotspot.id}
                    category={activeHotspot.category}
                    className="w-6 h-6"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-stone-900">
                      {activeHotspot.name}
                    </span>
                    {activeHotspot.requiresObjectReveal &&
                      revealedObjectIds.includes(activeHotspot.id) &&
                      !discoveredClueIds.includes(activeHotspot.id) && (
                        <span
                          data-testid="popover-reveal-only-badge"
                          className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full"
                        >
                          👀 已拨开遮挡 · 再点一次获取物证
                        </span>
                      )}
                    {activeHotspot.requiresObjectReveal &&
                      revealedObjectIds.includes(activeHotspot.id) &&
                      discoveredClueIds.includes(activeHotspot.id) && (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          ✓ 已亲手翻开并取证
                        </span>
                      )}
                    {activeHotspot.isPermanentUnknown && (
                      <span className="text-[10px] font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                        🔒 外部无法看清内部
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-700 font-medium mt-0.5">
                    {activeHotspot.requiresObjectReveal && !discoveredClueIds.includes(activeHotspot.id)
                      ? '遮挡物已经打开啦！再点一次场景里的这个位置，就能把显露出来的证据收进线索册。'
                      : activeHotspot.observationPrompt || activeHotspot.foundDescription}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveHotspot(null)}
                className="min-w-[36px] min-h-[36px] rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-black cursor-pointer"
                aria-label="收起线索详情"
              >
                ✕
              </button>
            </div>

            {/* 尚未真正获取证据时不渲染归类盒按钮；已获取证据后才允许一键归入三盒 */}
            {discoveredClueIds.includes(activeHotspot.id) ? (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-100">
                <span className="text-[11px] font-bold text-stone-500">放进哪个盒：</span>
                {currentBaskets.map((basket) => {
                  const isPlacedHere = placements[activeHotspot.id] === basket.id;
                  return (
                    <button
                      key={basket.id}
                      type="button"
                      data-testid={`quick-sort-${activeHotspot.id}-${basket.id}`}
                      onClick={() => handlePlaceIntoBasket(basket.id, activeHotspot.id)}
                      className={`min-h-[40px] px-2.5 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1 ${
                        isPlacedHere
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                          : `${basket.colorBg} ${basket.borderColor} text-stone-800 hover:brightness-95`
                      }`}
                    >
                      <span>{basket.icon}</span>
                      <span>{basket.label}</span>
                      {isPlacedHere && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="pt-1 border-t border-stone-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-800">
                  先完成第二次点击取证，才能把证据放进分类盒哦！
                </span>
                <button
                  type="button"
                  data-testid={`collect-revealed-clue-${activeHotspot.id}`}
                  onClick={() => handleDirectInspect(activeHotspot)}
                  className="min-h-[38px] px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer"
                >
                  🔍 立即取证
                </button>
              </div>
            )}
          </div>
        )}

        {/* 阶段一 & 二：紧凑双栏引导（1. 初步判断 -> 2. 调查方向区域高亮） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* 步骤 1：停 & 初步判断 */}
          <div
            data-testid="detective-step-hypothesis"
            className="bg-white rounded-2xl border-2 border-amber-200 p-3 space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px]">
                  1 · 停一停
                </span>
                <span>调查前你觉得呢？</span>
              </span>
              {initialHypothesisId && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  已记初判
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {(scenario.initialHypotheses || []).map((hyp) => {
                const isSelected = initialHypothesisId === hyp.id;
                return (
                  <button
                    key={hyp.id}
                    type="button"
                    data-testid={`initial-hypothesis-${hyp.id}`}
                    onClick={() => handleSelectInitialHypothesis(hyp.id)}
                    className={`min-h-[44px] px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-2xs'
                        : 'bg-stone-50 hover:bg-amber-50/60 border-stone-200 text-stone-700'
                    }`}
                  >
                    <span>{hyp.label}</span>
                    {isSelected && <span className="text-[11px] font-black text-amber-800 shrink-0">✓ 初判</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 步骤 2：通 & 调查方向（只高亮场景区域，引导孩子自己点物体） */}
          <div
            data-testid="detective-step-leads"
            className="bg-white rounded-2xl border-2 border-sky-200 p-3 space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 text-[11px]">
                  2 · 找线索
                </span>
                <span>点方向高亮区域，再去点场景物体</span>
              </span>
              <span className="text-[10px] font-bold text-sky-700">
                已找到 {discoveredClueIds.length}/{currentHotspots.length}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(scenario.investigationLeads || []).map((lead) => {
                const isExplored = exploredLeadIds.includes(lead.id);
                const allTargetsFound = lead.targetHotspotIds.every((id) =>
                  discoveredClueIds.includes(id)
                );
                return (
                  <button
                    key={lead.id}
                    type="button"
                    data-testid={`investigation-lead-${lead.id}`}
                    onClick={() => handleChooseInvestigationLead(lead.id)}
                    className={`min-h-[44px] px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                      allTargetsFound
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                        : isExplored
                          ? 'bg-sky-50 border-sky-400 text-sky-950'
                          : 'bg-stone-50 hover:bg-sky-50/60 border-stone-200 text-stone-700'
                    }`}
                  >
                    <span>🔍 {lead.label}</span>
                    <span className="text-[10px] font-extrabold text-sky-700 shrink-0">
                      {allTargetsFound ? '✓ 物体已查验' : isExplored ? '去点闪光物体 ↑' : '指引位置 →'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 步骤 3：紧凑三盒分类栏（点击已找到的线索卡或从浮层直接放入三盒） */}
        {discoveredClueIds.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black text-stone-800">
                3 · 分一分：已发现的线索（点卡片再点下方分类盒）
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                已分清 {correctlySortedCount} / {currentHotspots.length}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {discoveredClueIds.map((id) => {
                const clue = currentHotspots.find((h) => h.id === id);
                if (!clue) return null;
                const isPlaced = placements[id] !== undefined;
                const isSelected = selectedClueId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectCard(id)}
                    className={`min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 text-amber-950 ring-2 ring-amber-300'
                        : isPlaced
                          ? 'bg-stone-100 border-stone-300 text-stone-500'
                          : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-amber-300'
                    }`}
                  >
                    <ClueVisualIcon icon={clue.icon} clueId={clue.id} category={clue.category} className="w-4 h-4 shrink-0" />
                    <span>{clue.name}</span>
                    {isPlaced && <span className="text-[10px] text-emerald-700">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {currentBaskets.map((basket) => {
                const placedInThisBasket = currentHotspots.filter(
                  (h) => discoveredClueIds.includes(h.id) && placements[h.id] === basket.id
                );
                return (
                  <div
                    key={basket.id}
                    onClick={() => handlePlaceIntoBasket(basket.id)}
                    className={`p-2.5 rounded-xl border-2 ${basket.borderColor} ${basket.colorBg} cursor-pointer transition-all hover:shadow-xs flex flex-col justify-between min-h-[84px]`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-1">
                        <BasketCrateSvg type={basket.id} className="w-4 h-4 shrink-0" />
                        <span>{basket.label}</span>
                      </span>
                      <span className="text-[10px] font-bold text-stone-600 bg-white/80 px-1.5 py-0.5 rounded-full">
                        {placedInThisBasket.length}
                      </span>
                    </div>
                    <div className="space-y-1 mt-1.5">
                      {placedInThisBasket.map((clue) => (
                        <div
                          key={clue.id}
                          className="bg-white/95 px-2 py-1 rounded-lg border border-stone-200 text-[11px] flex items-center justify-between"
                        >
                          <span className="font-bold text-stone-800 truncate">{clue.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUndoPlacement(clue.id);
                            }}
                            className="min-w-[28px] min-h-[28px] text-stone-400 hover:text-stone-700 font-black flex items-center justify-center cursor-pointer"
                            aria-label={`移出${clue.name}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 步骤 4（P0-02 & Sprint 1.2 任务三）：发现 >= 2 条证据后，基于案件级关键证据条件验证判断 */}
        {discoveredClueIds.length >= 2 && scenario.initialHypotheses && (
          <div
            data-testid="detective-step-revise"
            className="bg-emerald-50/90 border-2 border-emerald-200 rounded-2xl p-3.5 space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 text-[11px]">
                  4 · 辨一辨
                </span>
                <span>对照刚刚找到的物证，现在的判断是什么？</span>
              </h4>
              {hypothesisEvaluation && (
                <span
                  data-testid="hypothesis-evaluation-badge"
                  data-relation={hypothesisEvaluation.relation}
                  data-finding-state={hypothesisEvaluation.findingState}
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                    hypothesisEvaluation.relation === 'SUPPORTED_BY_EVIDENCE'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : hypothesisEvaluation.relation === 'CONTRADICTED_BY_EVIDENCE'
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : 'bg-amber-100 text-amber-950 border-amber-300'
                  }`}
                >
                  {hypothesisEvaluation.badgeLabel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {scenario.initialHypotheses.map((hyp) => {
                const isRevisedSelected = revisedHypothesisId === hyp.id;
                const wasInitial = initialHypothesisId === hyp.id;
                return (
                  <button
                    key={hyp.id}
                    type="button"
                    data-testid={`revise-hypothesis-${hyp.id}`}
                    onClick={() => handleReviseHypothesis(hyp.id)}
                    className={`min-h-[48px] p-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer border-2 flex flex-col justify-between ${
                      isRevisedSelected
                        ? 'bg-white border-emerald-600 text-emerald-950 shadow-xs ring-2 ring-emerald-200'
                        : 'bg-white/80 hover:bg-white border-emerald-200 text-stone-700'
                    }`}
                  >
                    <span>{hyp.label}</span>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-stone-100 text-[10px]">
                      {wasInitial ? (
                        <span className="text-amber-700 font-bold">最初想法</span>
                      ) : (
                        <span className="text-stone-400">可选判断</span>
                      )}
                      {isRevisedSelected && (
                        <span className="text-emerald-700 font-black">✓ 当前判断</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {hypothesisEvaluation && (
              <div
                data-testid="hypothesis-evaluation-feedback"
                className={`p-2.5 rounded-xl text-xs font-bold border ${
                  hypothesisEvaluation.relation === 'CONTRADICTED_BY_EVIDENCE'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : hypothesisEvaluation.relation === 'SUPPORTED_BY_EVIDENCE'
                      ? 'bg-emerald-100/80 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                {hypothesisEvaluation.spokenFeedback}
              </div>
            )}
          </div>
        )}

        {/* 步骤 5（P0-01 / P1-02）：选择下一步行动并查看收益、代价与世界变化 */}
        {discoveredClueIds.length >= 2 && scenario.nextActionChoices && (
          <div
            data-testid="detective-step-action"
            className="bg-indigo-50/90 border-2 border-indigo-200 rounded-2xl p-3.5 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black text-indigo-950 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-950 text-[11px]">
                  5 · 试行动
                </span>
                <span>接下来我们怎么做？看看每种做法带来的收获与代价：</span>
              </h4>
              {chosenNextActionId && (
                <span className="text-[11px] font-black text-indigo-800 bg-white px-2.5 py-0.5 rounded-full border border-indigo-300">
                  ✓ 已尝试行动
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {scenario.nextActionChoices.map((choice) => {
                const isPicked = chosenNextActionId === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    data-testid={`next-action-${choice.id}`}
                    onClick={() => handleSelectNextAction(choice.id)}
                    className={`w-full min-h-[48px] p-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer border-2 ${
                      isPicked
                        ? 'bg-white border-indigo-600 text-indigo-950 shadow-xs'
                        : 'bg-white/80 hover:bg-white border-indigo-200 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{choice.label}</span>
                      {isPicked && <span className="text-indigo-700 font-black shrink-0">✓ 已尝试</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedActionObj && (
              <div
                data-testid="detective-action-consequence"
                className="bg-white rounded-xl border border-indigo-200 p-3 space-y-1.5 text-xs"
              >
                <p className="font-black text-indigo-950">{selectedActionObj.feedbackText}</p>
                {selectedActionObj.consequenceBenefit && (
                  <p className="text-emerald-800 font-bold">✨ {selectedActionObj.consequenceBenefit}</p>
                )}
                {selectedActionObj.consequenceTradeoff && (
                  <p className="text-amber-900 font-bold">⚖️ {selectedActionObj.consequenceTradeoff}</p>
                )}
                {selectedActionObj.worldChangeSummary && (
                  <p className="text-stone-700 font-medium">🌍 现场变化：{selectedActionObj.worldChangeSummary}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 底部操作栏：诚实保留“还不确定” + 打开破案手册（区分提前查看参考 vs 完成破案） */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            data-testid="detective-honest-unsure-btn"
            onClick={() => {
              sounds.playClick();
              recordUnknownHonestyChoice(scenario.id);
              setFeedbackPrompt('有些事情我们暂时还不知道，这是很正常的！不用急着猜。');
              speechNarrator.speak('有些事情我们暂时还不知道，这是很正常的！不用急着猜。');
            }}
            className="w-full sm:w-auto min-h-[48px] px-4 py-2 rounded-2xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center cursor-pointer"
          >
            我还不确定 / 需要再看看
          </button>

          <button
            type="button"
            data-testid="open-detective-synthesis-btn"
            onClick={handleOpenSynthesis}
            className={`w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-2xl text-white text-sm sm:text-base font-black shadow-md transition-all active:scale-98 flex items-center justify-center cursor-pointer ${
              caseStatus === 'COMPLETED' || caseStatus === 'COMPLETED_AFTER_REFERENCE' || currentReadiness.isReadyToComplete
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            查看侦探破案手册 {correctlySortedCount > 0 ? `(${correctlySortedCount}/${currentHotspots.length})` : ''}
          </button>
        </div>
      </div>

      {/* 破案总结浮层 (Synthesis Modal：保留孩子自己的判断空间，区分 ENDED_EARLY / COMPLETED_AFTER_REFERENCE / COMPLETED) */}
      {isSynthesisOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 border-2 border-amber-300 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-black">
                  <MagnifierLensSvg className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900">
                    {caseStatus === 'COMPLETED'
                      ? '小侦探的独立破案发现（已完成闭环）'
                      : caseStatus === 'COMPLETED_AFTER_REFERENCE'
                        ? '小侦探的参考后完成记录'
                        : '侦探参考手册（尚未完成取证闭环）'}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    场景：{scenario.sceneTitle} · 状态：{CASE_STATUS_LABELS[caseStatus]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSynthesisOpen(false)}
                className="min-w-[44px] min-h-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-base font-bold cursor-pointer"
                aria-label="关闭总结"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-stone-800 text-sm leading-relaxed overflow-y-auto pr-1 flex-1">
              {/* Sprint 1.2 任务五：查看结局前保留一步孩子自己的判断空间，不直接把标准答案盖在孩子选择上 */}
              <div
                data-testid="synthesis-child-own-judgment"
                className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-xs space-y-1"
              >
                <p className="font-black text-indigo-950">
                  🧠 你自己的当前思考记录：
                </p>
                <p className="text-indigo-900 font-bold">
                  · 你的判断：{currentJudgmentLabel}
                </p>
                <p className="text-indigo-900 font-bold">
                  · 你的行动选择：{selectedActionObj ? selectedActionObj.label : '尚未选择行动'}
                </p>
              </div>

              {caseStatus !== 'COMPLETED' && caseStatus !== 'COMPLETED_AFTER_REFERENCE' && (
                <div
                  data-testid="synthesis-early-peek-banner"
                  className="p-3 bg-stone-100 rounded-2xl border-2 border-stone-300 text-stone-800 text-xs sm:text-sm font-bold space-y-1"
                >
                  <p>
                    💡 当前为「提前查看参考 / 自主暂停」模式（已获取 {discoveredClueIds.length} 条线索）。
                  </p>
                  <p className="text-xs text-stone-700">
                    提前看参考不会直接计入独立完成或点亮破案奖章；若继续回现场完成剩余步骤，将诚实记录为「参考后完成探索」。
                  </p>
                </div>
              )}

              {caseStatus === 'COMPLETED_AFTER_REFERENCE' && (
                <div
                  data-testid="synthesis-assisted-completion-banner"
                  className="p-3 bg-sky-50 rounded-2xl border-2 border-sky-300 text-sky-950 text-xs sm:text-sm font-bold"
                >
                  🤝 你在查看过参考手册后补齐了全部调查与行动步骤，本次已记录为「参考后完成探索」（不冒充零参考独立破案）。
                </div>
              )}

              {scenario.resolutionSummary && (
                <div className="p-3.5 bg-amber-100/80 rounded-2xl border-2 border-amber-300">
                  <p className="font-black text-amber-950 text-xs sm:text-sm">
                    🎉 案件复盘：{scenario.resolutionSummary}
                  </p>
                </div>
              )}

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <p className="font-black text-emerald-950 mb-1 flex items-center gap-2 text-xs sm:text-sm">
                  <BasketCrateSvg type="EYES_OBSERVED" className="w-5 h-5 shrink-0" />
                  <span>眼睛拍到的客观事实：</span>
                </p>
                <ul className="text-emerald-900 text-xs space-y-1">
                  {currentHotspots
                    .filter((h) => h.category === 'FACT')
                    .map((h) => (
                      <li key={h.id} className="flex items-start gap-2">
                        <ClueVisualIcon icon={h.icon} clueId={h.id} category={h.category} className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>{h.name}</strong>：{h.foundDescription}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <p className="font-black text-amber-950 mb-1 flex items-center gap-2 text-xs sm:text-sm">
                  <BasketCrateSvg type="MIND_GUESSED" className="w-5 h-5 shrink-0" />
                  <span>脑袋里的猜想泡泡：</span>
                </p>
                <ul className="text-amber-900 text-xs space-y-1">
                  {currentHotspots
                    .filter((h) => h.category === 'INFERENCE')
                    .map((h) => (
                      <li key={h.id} className="flex items-start gap-2">
                        <ClueVisualIcon icon={h.icon} clueId={h.id} category={h.category} className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>{h.name}</strong>：{h.foundDescription}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200">
                <p className="font-black text-sky-950 mb-1 flex items-center gap-2 text-xs sm:text-sm">
                  <BasketCrateSvg type="STILL_UNKNOWN" className="w-5 h-5 shrink-0" />
                  <span>保持清醒的盲区（未知）：</span>
                </p>
                <ul className="text-sky-900 text-xs space-y-1">
                  {currentHotspots
                    .filter((h) => h.category === 'UNKNOWN')
                    .map((h) => (
                      <li key={h.id} className="flex items-start gap-2">
                        <ClueVisualIcon icon={h.icon} clueId={h.id} category={h.category} className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>{h.name}</strong>：{h.foundDescription}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* 在手册中同样可以选择下一步行动以完成闭环 */}
              {scenario.nextActionChoices && scenario.nextActionChoices.length > 0 && (
                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-2">
                  <p className="font-black text-indigo-950 text-xs">
                    🌟 第 5 步（择 · 选做法）：查明情况后，我们接下来怎么做？
                  </p>
                  <div className="space-y-1.5">
                    {scenario.nextActionChoices.map((choice) => {
                      const isPicked = chosenNextActionId === choice.id;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          data-testid={`modal-next-action-${choice.id}`}
                          onClick={() => handleSelectNextAction(choice.id)}
                          className={`w-full min-h-[44px] p-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer border ${
                            isPicked
                              ? 'bg-white border-indigo-500 text-indigo-950 shadow-xs'
                              : 'bg-white/70 hover:bg-white border-indigo-200 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{choice.label}</span>
                            {isPicked && <span className="text-indigo-700 font-black shrink-0">✓ 已选</span>}
                          </div>
                          {isPicked && (
                            <div className="mt-1 space-y-0.5 text-[11px]">
                              <p className="text-emerald-800 font-bold">{choice.feedbackText}</p>
                              {choice.consequenceBenefit && <p className="text-emerald-700">{choice.consequenceBenefit}</p>}
                              {choice.consequenceTradeoff && <p className="text-amber-800">{choice.consequenceTradeoff}</p>}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                {themeCases.length > 1 && (
                  <button
                    type="button"
                    data-testid="try-next-detective-case"
                    onClick={() => {
                      const nextIdx = (activeCaseIndex + 1) % themeCases.length;
                      setIsSynthesisOpen(false);
                      handleSwitchCase(nextIdx);
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center"
                  >
                    🔍 挑战案件 {(activeCaseIndex + 1) % themeCases.length + 1}
                  </button>
                )}
                <button
                  type="button"
                  data-testid="open-transfer-from-detective"
                  onClick={() => {
                    sounds.playCardSelect();
                    setIsSynthesisOpen(false);
                    if (onOpenTransferLab) {
                      onOpenTransferLab();
                    } else {
                      setIsEmbeddedTransferOpen(true);
                    }
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center"
                >
                  🚀 去新场景检验本领（迁移实验）
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsSynthesisOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center"
              >
                返回现场继续探索
              </button>
            </div>
          </div>
        </div>
      )}

      {isEmbeddedTransferOpen && (
        <TransferScenariosModal
          isOpen={isEmbeddedTransferOpen}
          onClose={() => setIsEmbeddedTransferOpen(false)}
        />
      )}
    </div>
  );
};
