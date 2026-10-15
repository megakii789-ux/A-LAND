import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  InterestActivityId,
  INTEREST_ACTIVITIES,
  ANIMAL_COMPANIONS,
  getThemedScenarioByInterest,
  getThemedScenarioCasesByInterest,
  evaluateThemedCluePlacement,
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
  getProductExperienceMetrics,
  recordClueClassificationAttempt,
  recordDetectiveCaseCompletion,
  recordHypothesisRevision,
  recordUnknownHonestyChoice,
  subscribeProductExperienceMetrics,
} from '../../../domain/cognitive/productExperienceMetrics';
import { ParentGateModal } from '../../ParentGateModal';
import { CompanionAvatarSvg, InterestBadgeSvg } from '../../ChildIsland/CompanionIcons';
import { TransferScenariosModal } from '../TransferLab/TransferScenariosModal';

const SCOPE_KEY = 'game_crayon_detective';

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
  if (clueId.includes('backpack') || clueId.includes('locker') || icon === '🎒' || icon === '🔒' || category === 'UNKNOWN') {
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

  // 7. 树叶 / 青草 / 自然
  if (icon === '🌱' || icon === '🌲' || icon === '🍂' || icon === '🌰' || icon === '🍀') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
        <path d="M16 27V12" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 14C12 11 8 13 8 18C13 18 15 16 16 14Z" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
        <path d="M16 17C20 14 24 16 24 21C19 21 17 19 16 17Z" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
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

  // 放大镜位置（百分比）
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isDraggingLens, setIsDraggingLens] = useState(false);

  // 已发现的线索 ID 列表
  const [discoveredClueIds, setDiscoveredClueIds] = useState<string[]>([]);
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
  // 阶段 3（辨）：发现新证据后修正/确认后的判断 ID
  const [revisedHypothesisId, setRevisedHypothesisId] = useState<string | null>(null);
  // 阶段 4（择）：选择的下一步温和行动 ID
  const [chosenNextActionId, setChosenNextActionId] = useState<string | null>(null);
  // 内嵌能力迁移实验室弹窗开关
  const [isEmbeddedTransferOpen, setIsEmbeddedTransferOpen] = useState(false);

  // 当前温和提示语
  const [feedbackPrompt, setFeedbackPrompt] = useState<string>(
    scenario.spokenIntro
  );

  // 是否已完成全部事实猜测梳理
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
    setDiscoveredClueIds([]);
    setPlacements({});
    setAttemptedClueIds([]);
    setSelectedClueId(null);
    setActiveHotspot(null);
    setInitialHypothesisId(null);
    setExploredLeadIds([]);
    setRevisedHypothesisId(null);
    setChosenNextActionId(null);
    setLensPos({ x: 50, y: 50 });
    setIsSynthesisOpen(false);
    setFeedbackPrompt(targetScenarioIntro);
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
    const hyp = scenario.initialHypotheses?.find((h) => h.id === hypId);
    if (hyp) {
      if (hyp.isUnknownOption) {
        recordUnknownHonestyChoice();
      }
      setFeedbackPrompt(`${currentCompanion.name}：${hyp.feedbackText}`);
      speechNarrator.speak(hyp.feedbackText);
    }
  };

  // 阶段 2：主动选择调查方向，解锁对应隐藏/关键线索
  const handleChooseInvestigationLead = (leadId: string) => {
    const lead = scenario.investigationLeads?.find((l) => l.id === leadId);
    if (!lead) return;
    sounds.playDiscoveryChime();
    if (!exploredLeadIds.includes(leadId)) {
      setExploredLeadIds((prev) => [...prev, leadId]);
    }
    const targetSpots = currentHotspots.filter((h) => lead.targetHotspotIds.includes(h.id));
    if (targetSpots.length > 0) {
      const firstSpot = targetSpots[0];
      setLensPos({ x: firstSpot.xPercent, y: firstSpot.yPercent });
      setActiveHotspot(firstSpot);
      setDiscoveredClueIds((prev) => {
        const merged = new Set([...prev, ...targetSpots.map((s) => s.id)]);
        return Array.from(merged);
      });
    }
    setFeedbackPrompt(`${currentCompanion.name}：${lead.discoverySpokenText}`);
    speechNarrator.speak(lead.discoverySpokenText);
  };

  // 阶段 3：发现新证据后修正/确认判断
  const handleReviseHypothesis = (hypId: string) => {
    sounds.playDiscoveryChime();
    const isChanged = initialHypothesisId !== null && initialHypothesisId !== hypId;
    setRevisedHypothesisId(hypId);
    recordHypothesisRevision();
    const hyp = scenario.initialHypotheses?.find((h) => h.id === hypId);
    const msg = isChanged
      ? `太棒啦！看到新证据后，你把刚才的想法修正为「${hyp?.label || ''}」，这就是真正的科学小侦探！`
      : `你结合收集到的真实证据确认了判断：「${hyp?.label || ''}」！`;
    setFeedbackPrompt(msg);
    speechNarrator.speak(msg);
  };

  // 检查放大镜位置是否命中热点
  const checkHotspotHit = (x: number, y: number) => {
    let foundHit: HotspotEvidence | null = null;
    for (const spot of currentHotspots) {
      const dx = spot.xPercent - x;
      const dy = spot.yPercent - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= spot.radiusPercent) {
        foundHit = spot;
        break;
      }
    }

    if (foundHit) {
      setActiveHotspot(foundHit);
      if (!discoveredClueIds.includes(foundHit.id)) {
        sounds.playClick();
        setDiscoveredClueIds((prev) => [...prev, foundHit.id]);
        setFeedbackPrompt(`发现新线索：【${foundHit.name}】！${foundHit.foundDescription}`);
        speechNarrator.speak(foundHit.spokenText);
      }
    } else {
      setActiveHotspot(null);
    }
  };

  // 拖动放大镜计算
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingLens) return;
    updateLensByPointer(e);
  };

  const updateLensByPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sceneContainerRef.current) return;
    const rect = sceneContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const xPct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));

    setLensPos({ x: xPct, y: yPct });
    checkHotspotHit(xPct, yPct);
  };

  // 点击场景任意位置移动放大镜
  const handleSceneClick = (e: React.PointerEvent<HTMLDivElement>) => {
    updateLensByPointer(e);
  };

  // 直接点击热点探照按钮（触控等效）
  const handleDirectInspect = (spot: HotspotEvidence) => {
    setLensPos({ x: spot.xPercent, y: spot.yPercent });
    setActiveHotspot(spot);
    if (!discoveredClueIds.includes(spot.id)) {
      sounds.playClick();
      setDiscoveredClueIds((prev) => [...prev, spot.id]);
    }
    setFeedbackPrompt(`发现线索：【${spot.name}】${spot.foundDescription}`);
    speechNarrator.speak(spot.spokenText);
  };

  // 选择放置卡片
  const handleSelectCard = (clueId: string) => {
    sounds.playClick();
    setSelectedClueId(clueId === selectedClueId ? null : clueId);
    const clue = currentHotspots.find((h) => h.id === clueId);
    if (clue) {
      speechNarrator.speak(clue.spokenText);
    }
  };

  // 放置到目标箩筐（支持点击分配与撤销）
  const handlePlaceIntoBasket = (basketId: SortingBasketType) => {
    if (!selectedClueId) {
      setFeedbackPrompt('先点一张找到的线索卡，再点要放进的盒子吧！');
      return;
    }

    const clue = currentHotspots.find((h) => h.id === selectedClueId);
    if (!clue) return;

    sounds.playClick();
    const evaluation = evaluateThemedCluePlacement(clue.category, basketId);

    if (!attemptedClueIds.includes(clue.id)) {
      setAttemptedClueIds((prev) => [...prev, clue.id]);
      recordClueClassificationAttempt(evaluation.isMatch);
    }

    // 记录放置（无论对错都允许放置与调整，不阻断）
    setPlacements((prev) => ({
      ...prev,
      [selectedClueId]: basketId,
    }));
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

  // 打开侦探破案手册并记录案件完成与勋章点亮
  const handleOpenSynthesis = () => {
    sounds.playDiscoveryChime();
    setIsSynthesisOpen(true);
    recordDetectiveCaseCompletion(scenario.id);
    unlockMedal('sun-detective');
    const summarySpeech = scenario.resolutionSummary
      ? `太棒了小侦探！${scenario.resolutionSummary}`
      : '太棒了小侦探！我们把拍到的照片和心里的猜想分得清清楚楚。';
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

  // 计算当前放对盒子的卡片数
  const correctlySortedCount = currentHotspots.filter((h) => {
    const placed = placements[h.id];
    if (!placed) return false;
    return evaluateThemedCluePlacement(h.category, placed).isMatch;
  }).length;

  return (
    <div className="w-full max-w-4xl mx-auto bg-stone-50 rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden flex flex-col my-2">
      {adultPreviewUnlocked && !isApproved && (
        <div className="bg-amber-500 text-white text-xs font-black px-4 py-2 flex flex-wrap items-center justify-between gap-2">
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

      {/* 顶部状态与安全退出栏 */}
      <div className="bg-amber-100/90 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-200/90 flex items-center justify-center shrink-0 shadow-xs">
            <MagnifierLensSvg className="w-7 h-7 text-amber-800" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-amber-950">
                {scenario.sceneTitle}
              </h2>
              <span className="text-xs bg-amber-200/90 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                {scenario.caseBadge ? `${scenario.caseBadge} · 结构同构 · 人工审核` : '结构同构 · 人工审核'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-800 mt-0.5">
              <span>寻找目标：{scenario.missingItemLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-bold">已发现 {discoveredClueIds.length} / {currentHotspots.length}</span>
              <span aria-hidden="true">·</span>
              <span className="font-bold text-emerald-800">
                已破获 {experienceMetrics.completedDetectiveCaseIds.length} 个案件
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => speechNarrator.speak(feedbackPrompt)}
            className="min-h-[48px] px-3.5 py-2 rounded-xl bg-amber-200/90 hover:bg-amber-300 text-amber-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="重听语音引导"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <span>重听提示</span>
          </button>
          <button
            type="button"
            onClick={handleExitGame}
            className="min-h-[48px] px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center"
            aria-label="离开侦探社"
          >
            离开
          </button>
        </div>
      </div>

      {/* 兴趣皮肤快速切换栏 + 同主题双案件切换器 */}
      <div className="bg-amber-50/70 px-4 py-2 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div
          role="tablist"
          aria-label="选择侦探场景兴趣主题"
          className="flex items-center gap-2 overflow-x-auto"
        >
          <span className="text-xs font-bold text-stone-600 shrink-0">场景主题：</span>
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
                className={`min-h-[48px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isCurrent
                    ? 'bg-amber-400 text-stone-900 shadow-xs ring-2 ring-amber-300'
                    : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-200'
                }`}
                aria-label={`切换为${act.label}主题`}
              >
                <InterestBadgeSvg interestId={themeKey} className="w-5 h-5 shrink-0" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

        {/* 同主题多案件切换（防止背答案，每个案件拥有不同线索位置与不同原因解释） */}
        {themeCases.length > 1 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-stone-600">选择案件：</span>
            {themeCases.map((c, idx) => {
              const isCurrentCase = idx === activeCaseIndex;
              const isSolved = experienceMetrics.completedDetectiveCaseIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  data-testid={`switch-case-${idx + 1}`}
                  onClick={() => handleSwitchCase(idx)}
                  className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
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

      {/* 核心探索与交互区 */}
      <div className="p-3 sm:p-5 space-y-4">
        {/* 阶段一 & 二：六层思考引导面板（1. 初步判断 / 允许不知道 -> 2. 主动选择调查方向） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 步骤 1：停 & 初步判断 */}
          <div
            data-testid="detective-step-hypothesis"
            className="bg-white rounded-2xl border-2 border-amber-200 p-3.5 space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs">
                  第 1 步 · 停一停
                </span>
                <span>还没找全证据前，你觉得呢？</span>
              </span>
              {initialHypothesisId && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  已记录初判
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
                    className={`min-h-[48px] px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-2xs'
                        : 'bg-stone-50 hover:bg-amber-50/60 border-stone-200 text-stone-700'
                    }`}
                  >
                    <span>{hyp.label}</span>
                    {isSelected && <span className="text-xs font-black text-amber-800 shrink-0">✓ 当前想法</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 步骤 2：通 & 主动选择调查方向 */}
          <div
            data-testid="detective-step-leads"
            className="bg-white rounded-2xl border-2 border-sky-200 p-3.5 space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-sky-950 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 text-xs">
                  第 2 步 · 选方向
                </span>
                <span>接下来你想先调查哪里？</span>
              </span>
              <span className="text-[11px] font-bold text-sky-700">
                已调查 {exploredLeadIds.length} / {(scenario.investigationLeads || []).length} 处
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(scenario.investigationLeads || []).map((lead) => {
                const isExplored = exploredLeadIds.includes(lead.id);
                return (
                  <button
                    key={lead.id}
                    type="button"
                    data-testid={`investigation-lead-${lead.id}`}
                    onClick={() => handleChooseInvestigationLead(lead.id)}
                    className={`min-h-[48px] px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                      isExplored
                        ? 'bg-sky-50 border-sky-400 text-sky-950'
                        : 'bg-stone-50 hover:bg-sky-50/60 border-stone-200 text-stone-700'
                    }`}
                  >
                    <span>🔍 {lead.label}</span>
                    <span className="text-[11px] font-extrabold text-sky-700 shrink-0">
                      {isExplored ? '✓ 已发现线索' : '去看看 →'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 1. 探索场景画布 (Interactive Magnifier Scene) */}
        <div
          ref={sceneContainerRef}
          onPointerDown={(e) => {
            setIsDraggingLens(true);
            handleSceneClick(e);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={() => setIsDraggingLens(false)}
          onPointerCancel={() => setIsDraggingLens(false)}
          className="relative w-full h-64 sm:h-80 bg-linear-to-b from-sky-50 via-amber-50 to-emerald-50 rounded-2xl border-2 border-amber-200 overflow-hidden cursor-crosshair touch-none select-none shadow-inner"
          aria-label="侦探探索小房间全景"
        >
          {/* 房间背景手绘插画元素 */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* 窗户 */}
            <div className="absolute top-4 right-8 w-24 h-28 border-4 border-amber-300 bg-sky-200/60 rounded-t-xl" />
            {/* 窗帘 */}
            <div className="absolute top-4 right-5 w-12 h-36 bg-amber-200/80 rounded-b-xl border border-amber-300" />
            {/* 桌子 */}
            <div className="absolute top-20 left-12 w-36 h-28 border-2 border-stone-300 bg-amber-100/70 rounded-lg shadow-sm" />
            {/* 地板条纹 */}
            <div className="absolute bottom-0 inset-x-0 h-20 bg-linear-to-t from-stone-200/50 to-transparent" />
          </div>

          {/* 场景热点图标与探照标记 (触控 targets >= 56px) */}
          {currentHotspots.map((spot) => {
            const isDiscovered = discoveredClueIds.includes(spot.id);
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => handleDirectInspect(spot)}
                style={{
                  left: `${spot.xPercent}%`,
                  top: `${spot.yPercent}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl transition-all duration-300 min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer ${
                  isDiscovered
                    ? 'bg-amber-400 text-amber-950 scale-110 shadow-md ring-4 ring-amber-200/80'
                    : 'bg-white/95 text-stone-700 hover:scale-105 shadow-sm border-2 border-stone-300/80'
                }`}
                aria-label={`查看${spot.name}`}
              >
                <ClueVisualIcon icon={spot.icon} clueId={spot.id} category={spot.category} className="w-8 h-8" />
                <span className="sr-only">{spot.name}</span>
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
            {/* 镜片光圈 */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-600 bg-amber-100/35 backdrop-blur-xs shadow-2xl ring-4 ring-amber-300/60 flex items-center justify-center">
              <span className="text-[11px] sm:text-xs font-black text-amber-950 bg-white/95 px-2.5 py-0.5 rounded-full shadow-xs border border-amber-200">
                {activeHotspot ? activeHotspot.name : '移动照一照'}
              </span>
            </div>
            {/* 放大镜手柄 */}
            <div className="w-3.5 h-12 bg-amber-800 rounded-b-md mx-auto -mt-1 shadow-md transform rotate-25 origin-top" />
          </div>

          {/* 拖拽提示指示 */}
          <div className="absolute bottom-2 left-3 bg-white/90 px-3 py-1.5 rounded-xl text-xs text-stone-700 font-bold pointer-events-none border border-amber-200/60 flex items-center gap-1.5">
            <MagnifierLensSvg className="w-4 h-4" />
            <span>用手指拖动放大镜，或点上方调查方向/小圆圈探索</span>
          </div>
        </div>

        {/* 2. 动物伙伴实时陪伴与语音引导气泡 */}
        <div className="bg-amber-50/90 border-2 border-amber-200 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white border border-amber-200 flex items-center justify-center shrink-0 p-1 shadow-2xs">
            <CompanionAvatarSvg companionId={currentCompanion.id} className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-amber-800 block">
              伙伴 {currentCompanion.name} 陪你探案：
            </span>
            <p className="text-sm sm:text-base font-black text-stone-800 leading-snug">
              {feedbackPrompt}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetGame}
            className="min-h-[48px] text-xs px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-colors shrink-0 flex items-center justify-center cursor-pointer"
          >
            重新开始
          </button>
        </div>

        {/* 3. 已发现线索卡待分堆（卡片只展示中性观察描述 observationPrompt，绝不提前剧透答案类别！） */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-stone-800 flex items-center gap-1.5">
              <span>第 3 步 · 分一分：收集到的线索卡片</span>
              <span className="text-xs text-stone-500 font-normal">（点击卡片，再点击下方盒子归类）</span>
            </h3>
            {discoveredClueIds.length === 0 && (
              <span className="text-xs text-amber-700 font-bold">先用放大镜或调查方向找线索哦</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 min-h-[72px]">
            {discoveredClueIds.map((id) => {
              const clue = currentHotspots.find((h) => h.id === id);
              if (!clue) return null;
              const isPlaced = placements[id] !== undefined;
              const isSelected = selectedClueId === id;

              return (
                <div
                  key={id}
                  onClick={() => handleSelectCard(id)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 min-h-[56px] ${
                    isSelected
                      ? 'bg-amber-100 border-amber-500 shadow-md scale-102 ring-2 ring-amber-300'
                      : isPlaced
                      ? 'bg-stone-100 border-stone-300 opacity-60'
                      : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                      <ClueVisualIcon icon={clue.icon} clueId={clue.id} category={clue.category} className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-stone-800 truncate">{clue.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {clue.observationPrompt || clue.foundDescription}
                      </p>
                    </div>
                  </div>

                  {isPlaced ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUndoPlacement(id);
                      }}
                      className="min-h-[48px] px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl shrink-0 cursor-pointer flex items-center justify-center"
                      aria-label={`取出${clue.name}`}
                    >
                      放回
                    </button>
                  ) : (
                    <span className="min-h-[48px] px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl shrink-0 flex items-center justify-center">
                      {isSelected ? '已选' : '点击选择'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. 分类目标盒 (Sorting Baskets) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {currentBaskets.map((basket) => {
            const placedInThisBasket = currentHotspots.filter(
              (h) => placements[h.id] === basket.id
            );

            return (
              <div
                key={basket.id}
                onClick={() => handlePlaceIntoBasket(basket.id)}
                className={`p-4 rounded-2xl border-2 ${basket.borderColor} ${basket.colorBg} cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between min-h-[150px]`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <BasketCrateSvg type={basket.id} className="w-7 h-7 shrink-0" />
                      <h4 className="text-base sm:text-lg font-black text-stone-900">
                        {basket.label}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-stone-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-stone-200">
                      {placedInThisBasket.length} 张
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-medium mb-3">
                    {basket.subLabel}
                  </p>
                </div>

                {/* 放在该盒子里的卡片缩略列表 */}
                <div className="space-y-1.5">
                  {placedInThisBasket.map((clue) => {
                    const isCorrect = evaluateThemedCluePlacement(clue.category, basket.id).isMatch;
                    return (
                      <div
                        key={clue.id}
                        className="bg-white/95 px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs flex items-center justify-between shadow-2xs"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ClueVisualIcon icon={clue.icon} clueId={clue.id} category={clue.category} className="w-4 h-4 shrink-0" />
                          <span className="font-bold text-stone-800 truncate">{clue.name}</span>
                          {isCorrect && (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                              ✓ 分清啦
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUndoPlacement(clue.id);
                          }}
                          className="min-w-[44px] min-h-[44px] text-stone-400 hover:text-stone-700 font-black flex items-center justify-center cursor-pointer"
                          aria-label="移出卡片"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}

                  {placedInThisBasket.length === 0 && (
                    <div className="text-center py-2 text-xs text-stone-400 border border-dashed border-stone-300 rounded-xl">
                      点击放入这里
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4B. 阶段三核心：发现新证据后修正/确认判断 (Hypothesis Revision Panel) */}
        {discoveredClueIds.length >= 2 && scenario.initialHypotheses && (
          <div
            data-testid="detective-step-revise"
            className="bg-emerald-50/90 border-2 border-emerald-200 rounded-2xl p-4 space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm sm:text-base font-black text-emerald-950 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 text-xs">
                  第 4 步 · 辨一辨
                </span>
                <span>看完了现场证据，你现在的判断是什么？（可以修改刚才的想法哦！）</span>
              </h4>
              {revisedHypothesisId && (
                <span className="text-xs font-extrabold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-300">
                  ✓ 已根据新证据更新判断
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
                    className={`min-h-[52px] p-3 rounded-xl text-left text-xs sm:text-sm font-bold transition-all cursor-pointer border-2 flex flex-col justify-between ${
                      isRevisedSelected
                        ? 'bg-white border-emerald-600 text-emerald-950 shadow-sm ring-2 ring-emerald-200'
                        : 'bg-white/80 hover:bg-white border-emerald-200 text-stone-700'
                    }`}
                  >
                    <span>{hyp.label}</span>
                    <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-stone-100 text-[11px]">
                      {wasInitial ? (
                        <span className="text-amber-700 font-bold">最初的想法</span>
                      ) : (
                        <span className="text-stone-400">新判断选项</span>
                      )}
                      {isRevisedSelected && (
                        <span className="text-emerald-700 font-black">✓ 最终判断</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. 探索梳理与破案大结局 */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              recordUnknownHonestyChoice();
              setFeedbackPrompt('有些事情我们暂时还不知道，这是很正常的！不用急着猜。');
              speechNarrator.speak('有些事情我们暂时还不知道，这是很正常的！不用急着猜。');
            }}
            className="w-full sm:w-auto min-h-[56px] px-5 py-2.5 rounded-2xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-sm font-bold transition-colors flex items-center justify-center cursor-pointer"
          >
            我还不确定 / 需要再看看
          </button>

          <button
            type="button"
            onClick={handleOpenSynthesis}
            className="w-full sm:w-auto min-h-[56px] px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-base font-black shadow-md transition-all active:scale-98 flex items-center justify-center cursor-pointer"
          >
            查看侦探破案手册 {correctlySortedCount > 0 ? `(${correctlySortedCount}/${currentHotspots.length})` : ''}
          </button>
        </div>
      </div>

      {/* 破案总结浮层 (Synthesis Modal：包含真相揭晓 + 下一步行动选择“择” + 迁移挑战“验”) */}
      {isSynthesisOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 border-2 border-amber-300 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-black">
                  <MagnifierLensSvg className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                    小侦探的破案发现
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    场景：{scenario.sceneTitle} · {scenario.caseBadge || '审核冻结版本'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSynthesisOpen(false)}
                className="min-w-[48px] min-h-[48px] rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-lg font-bold cursor-pointer"
                aria-label="关闭总结"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-stone-800 text-sm sm:text-base leading-relaxed overflow-y-auto pr-1 flex-1">
              {/* 本案真相揭晓 */}
              {scenario.resolutionSummary && (
                <div className="p-3.5 bg-amber-100/80 rounded-2xl border-2 border-amber-300">
                  <p className="font-black text-amber-950 text-sm sm:text-base">
                    🎉 破案真相：{scenario.resolutionSummary}
                  </p>
                </div>
              )}

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <p className="font-black text-emerald-950 mb-1.5 flex items-center gap-2">
                  <BasketCrateSvg type="EYES_OBSERVED" className="w-5 h-5 shrink-0" />
                  <span>眼睛拍到的客观事实：</span>
                </p>
                <ul className="text-emerald-900 text-xs sm:text-sm space-y-1.5">
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

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                <p className="font-black text-amber-950 mb-1.5 flex items-center gap-2">
                  <BasketCrateSvg type="MIND_GUESSED" className="w-5 h-5 shrink-0" />
                  <span>脑袋里的猜想泡泡：</span>
                </p>
                <ul className="text-amber-900 text-xs sm:text-sm space-y-1.5">
                  {currentHotspots
                    .filter((h) => h.category === 'INFERENCE')
                    .map((h) => (
                      <li key={h.id} className="flex items-start gap-2">
                        <ClueVisualIcon icon={h.icon} clueId={h.id} category={h.category} className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>{h.name}</strong>：{h.foundDescription}</span>
                      </li>
                    ))}
                </ul>
                <p className="text-xs text-amber-800 font-bold mt-2">
                  提示：猜想没有眼睛拍到的证据，不能直接当真哦。
                </p>
              </div>

              <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200">
                <p className="font-black text-sky-950 mb-1.5 flex items-center gap-2">
                  <BasketCrateSvg type="STILL_UNKNOWN" className="w-5 h-5 shrink-0" />
                  <span>永远保持的清醒盲区（未知）：</span>
                </p>
                <ul className="text-sky-900 text-xs sm:text-sm space-y-1.5">
                  {currentHotspots
                    .filter((h) => h.category === 'UNKNOWN')
                    .map((h) => (
                      <li key={h.id} className="flex items-start gap-2">
                        <ClueVisualIcon icon={h.icon} clueId={h.id} category={h.category} className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>{h.name}</strong>：{h.foundDescription}</span>
                      </li>
                    ))}
                </ul>
                <p className="text-xs text-sky-800 font-bold mt-2">
                  承认“现在还不知道”是最有力量的事，绝不凭空冤枉同伴！
                </p>
              </div>

              {/* 第 5 步（择）：选择温和有建设性的下一步行动 */}
              {scenario.nextActionChoices && scenario.nextActionChoices.length > 0 && (
                <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-2">
                  <p className="font-black text-indigo-950 text-xs sm:text-sm">
                    🌟 第 5 步（择 · 选做法）：查明真相后，我们接下来怎么做最好？
                  </p>
                  <div className="space-y-1.5">
                    {scenario.nextActionChoices.map((choice) => {
                      const isPicked = chosenNextActionId === choice.id;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          data-testid={`next-action-${choice.id}`}
                          onClick={() => {
                            sounds.playCardSelect();
                            setChosenNextActionId(choice.id);
                            speechNarrator.speak(choice.feedbackText);
                          }}
                          className={`w-full min-h-[48px] p-2.5 rounded-xl text-left text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
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
                            <p className="text-xs text-emerald-800 mt-1 font-medium">
                              {choice.feedbackText}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 底部第 6 步（验）：挑战本主题另一案件 / 进入迁移实验室 / 返回探索 */}
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
                    className="min-h-[48px] px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition-colors cursor-pointer flex items-center justify-center"
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
                  className="min-h-[48px] px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black transition-colors cursor-pointer flex items-center justify-center"
                >
                  🚀 去新场景检验本领（迁移实验）
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsSynthesisOpen(false)}
                className="min-h-[48px] px-5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black transition-colors cursor-pointer flex items-center justify-center"
              >
                我知道啦，继续探索
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 内嵌能力迁移实验室（当未传外部 onOpenTransferLab 时直接打开） */}
      {isEmbeddedTransferOpen && (
        <TransferScenariosModal
          isOpen={isEmbeddedTransferOpen}
          onClose={() => setIsEmbeddedTransferOpen(false)}
        />
      )}
    </div>
  );
};
