import React, { useState, useEffect } from 'react';
import {
  TOY_BOAT_TASKS,
  WAITING_ACTIVITY_OPTIONS,
  getToyBoatTaskById,
  evaluateNegotiationPlan,
  BoatPositionZone,
  FirstTurnActor,
  PlanStrategyType,
  WaitingActivityId,
  NeedSatisfactionLevel,
} from '../../../domain/games/toyBoatNegotiationLogic';
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
  recordToyBoatSessionProgress,
} from '../../../domain/cognitive/productExperienceMetrics';
import { ParentGateModal } from '../../ParentGateModal';

const SCOPE_KEY = 'game_toy_boat';

interface Props {
  onExit: () => void;
  isAdultPreview?: boolean;
  previewSessionToken?: string | null;
}

/**
 * 原创矢量小动物伙伴头像（小兔提莫 / 小熊波波，随需求满足状态变化神情）
 */
const AnimalFriendSvg: React.FC<{
  type: 'rabbit' | 'bear';
  satisfaction: NeedSatisfactionLevel;
  isActiveTurn?: boolean;
  className?: string;
}> = ({ type, satisfaction, isActiveTurn = false, className = 'w-14 h-14' }) => {
  const isHappy = satisfaction === 'HIGH_SATISFIED';
  const isFrustrated = satisfaction === 'LOW_FRUSTRATED';

  if (type === 'rabbit') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
        <ellipse cx="18" cy="12" rx="4.5" ry="11" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
        <ellipse cx="18" cy="12" rx="2.5" ry="7" fill="#FFE4E6" />
        <ellipse cx="30" cy="12" rx="4.5" ry="11" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
        <ellipse cx="30" cy="12" rx="2.5" ry="7" fill="#FFE4E6" />
        <circle cx="24" cy="28" r="15" fill="#FFFFFF" stroke="#E11D48" strokeWidth="2" />
        <circle cx="18" cy="26" r="2.2" fill="#881337" />
        <circle cx="30" cy="26" r="2.2" fill="#881337" />
        <circle cx="14" cy="30" r="3" fill="#FDA4AF" opacity="0.7" />
        <circle cx="34" cy="30" r="3" fill="#FDA4AF" opacity="0.7" />
        <polygon points="24,29 22.5,31 25.5,31" fill="#F43F5E" />
        {isHappy ? (
          <path d="M20 32Q24 36 28 32" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
        ) : isFrustrated ? (
          <path d="M20 34Q24 31 28 34" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <line x1="21" y1="33" x2="27" y2="33" stroke="#E11D48" strokeWidth="1.8" strokeLinecap="round" />
        )}
        <polygon
          points="24,39 20,44 28,44"
          fill={isActiveTurn ? '#38BDF8' : '#CBD5E1'}
          stroke="#0284C7"
          strokeWidth="1"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      <circle cx="13" cy="14" r="6" fill="#B45309" stroke="#78350F" strokeWidth="2" />
      <circle cx="13" cy="14" r="3" fill="#FDE68A" />
      <circle cx="35" cy="14" r="6" fill="#B45309" stroke="#78350F" strokeWidth="2" />
      <circle cx="35" cy="14" r="3" fill="#FDE68A" />
      <circle cx="24" cy="28" r="16" fill="#D97706" stroke="#92400E" strokeWidth="2" />
      <ellipse cx="24" cy="31" rx="8" ry="6" fill="#FEF3C7" />
      <circle cx="18" cy="24" r="2.2" fill="#451A03" />
      <circle cx="30" cy="24" r="2.2" fill="#451A03" />
      <ellipse cx="24" cy="28.5" rx="3.5" ry="2.5" fill="#78350F" />
      {isHappy ? (
        <path d="M20 32Q24 36 28 32" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      ) : isFrustrated ? (
        <path d="M20 34Q24 31 28 34" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <line x1="21" y1="33" x2="27" y2="33" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
      )}
      <circle
        cx="24"
        cy="15"
        r="4.5"
        fill={isActiveTurn ? '#F59E0B' : '#CBD5E1'}
        stroke="#B45309"
        strokeWidth="1"
      />
    </svg>
  );
};

/**
 * 原创矢量可移动玩具木船（含货物与船桨状态）
 */
const ToySailboatSvg: React.FC<{
  hasCargo?: boolean;
  isSailing?: boolean;
  className?: string;
}> = ({ hasCargo = false, isSailing = false, className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none">
    <path
      d="M10 44 L16 54 C16 54 28 57 48 54 L54 44 Z"
      fill="#D97706"
      stroke="#78350F"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <line x1="16" y1="44" x2="48" y2="44" stroke="#FDE68A" strokeWidth="2" />
    <line x1="32" y1="12" x2="32" y2="44" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 15 L50 38 L32 38 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
    <polygon points="32,23 44,38 32,38" fill="#FFFFFF" />
    <path d="M30 18 L16 38 L30 38 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.8" />
    <polygon points="32,10 40,13 32,16" fill="#FBBF24" />
    {hasCargo && (
      <g transform="translate(22, 28) scale(0.65)">
        <ellipse cx="14" cy="14" rx="8" ry="6" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
        <circle cx="18" cy="9" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
        <circle cx="19" cy="8" r="1" fill="#78350F" />
        <polygon points="22,9 27,10 22,12" fill="#F97316" />
      </g>
    )}
    {isSailing && (
      <path
        d="M6 56Q18 52 32 56T58 56"
        stroke="#0284C7"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    )}
  </svg>
);

const BOAT_ZONE_META: ReadonlyArray<{
  zone: BoatPositionZone;
  label: string;
  shortHint: string;
  xPercent: number;
}> = [
  {
    zone: 'RABBIT_DOCK',
    label: '左岸 · 小兔码头',
    shortHint: '停靠小兔身边',
    xPercent: 18,
  },
  {
    zone: 'CENTER_POND',
    label: '池塘中央航道',
    shortHint: '水塘正中间',
    xPercent: 45,
  },
  {
    zone: 'BEAR_DOCK',
    label: '右岸 · 小熊码头',
    shortHint: '停靠小熊身边',
    xPercent: 72,
  },
  {
    zone: 'CANAL_HARBOR',
    label: '浅滩水渠新港',
    shortHint: '通往挖掘机水渠',
    xPercent: 88,
  },
];

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
  const adultPreviewUnlocked =
    isAdultPreviewSessionValid(SCOPE_KEY, effectiveToken) || isInternalPlaytestEnabled();
  const isApproved = ContentAuditRegistry.canRenderContent('game_toy_boat');

  // 从端侧指标恢复上次退出时的会话状态（支持随时退出恢复 + 重新尝试）
  const savedSnapshot = getProductExperienceMetrics().toyBoatSessionState;
  const initialTask = getToyBoatTaskById(savedSnapshot?.activeTaskId || TOY_BOAT_TASKS[0].id);

  const [activeTaskId, setActiveTaskId] = useState<string>(initialTask.id);
  const [boatPositionZone, setBoatPositionZone] = useState<BoatPositionZone>(
    savedSnapshot?.boatPositionZone || 'RABBIT_DOCK'
  );
  const [firstTurnActor, setFirstTurnActor] = useState<FirstTurnActor>(
    savedSnapshot?.firstTurnActor || 'rabbit'
  );
  const [turnDurationSeconds, setTurnDurationSeconds] = useState<3 | 5>(
    savedSnapshot?.turnDurationSeconds === 5 ? 5 : 3
  );
  const [planStrategy, setPlanStrategy] = useState<PlanStrategyType>(
    savedSnapshot?.planStrategy || 'TURN_WAIT'
  );
  const [waitingActivityId, setWaitingActivityId] = useState<WaitingActivityId>(
    (savedSnapshot?.waitingActivityId as WaitingActivityId) || 'wait_ring_bell'
  );

  // 执行状态机：PLANNING（协商布置中） -> RUNNING（方案执行倒数中） -> OBSERVED_RESULT（已观察执行结果）
  const [executionPhase, setExecutionPhase] = useState<'PLANNING' | 'RUNNING' | 'OBSERVED_RESULT'>(
    savedSnapshot?.executionPhase === 'OBSERVED_RESULT' ? 'OBSERVED_RESULT' : 'PLANNING'
  );
  const [activeExecutionRound, setActiveExecutionRound] = useState<1 | 2>(1);
  const [secondsLeftInRound, setSecondsLeftInRound] = useState<number>(turnDurationSeconds);
  const [completedRoundCount, setCompletedRoundCount] = useState<number>(
    savedSnapshot?.completedRoundCount || 0
  );
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(
    () => getProductExperienceMetrics().completedToyBoatTaskIds
  );

  const task = getToyBoatTaskById(activeTaskId);
  const evaluation = evaluateNegotiationPlan({
    taskId: activeTaskId,
    boatPositionZone,
    firstTurnActor,
    turnDurationSeconds,
    planStrategy,
    waitingActivityId,
  });

  useEffect(() => {
    if (!isApproved && !adultPreviewUnlocked) return;
    speechNarrator.speak(
      `${task.title}。${task.sceneSummary} 请先移动小船的位置、安排谁先玩、设定真实的轮流秒数或合作方案，然后点击执行看看结果吧！`
    );
    return () => {
      speechNarrator.stop();
    };
  }, [activeTaskId]);

  const persistSnapshot = (
    nextOverrides: Partial<{
      activeTaskId: string;
      boatPositionZone: BoatPositionZone;
      firstTurnActor: FirstTurnActor;
      turnDurationSeconds: 3 | 5;
      planStrategy: PlanStrategyType;
      waitingActivityId: WaitingActivityId;
      executionPhase: 'PLANNING' | 'RUNNING' | 'OBSERVED_RESULT';
      completedRoundCount: number;
    }>,
    recordMemory = false
  ) => {
    const nextTask = getToyBoatTaskById(nextOverrides.activeTaskId ?? activeTaskId);
    const nextBoatZone = nextOverrides.boatPositionZone ?? boatPositionZone;
    const nextActor = nextOverrides.firstTurnActor ?? firstTurnActor;
    const nextDuration = nextOverrides.turnDurationSeconds ?? turnDurationSeconds;
    const nextStrategy = nextOverrides.planStrategy ?? planStrategy;
    const nextWaitAct = nextOverrides.waitingActivityId ?? waitingActivityId;
    const nextPhase = nextOverrides.executionPhase ?? executionPhase;
    const nextRounds = nextOverrides.completedRoundCount ?? completedRoundCount;

    const strategyText =
      nextStrategy === 'COOPERATE_ROLES'
        ? '分工合作运货'
        : nextStrategy === 'EXCHANGE_ALT'
          ? '交换玩具与修水渠'
          : `每轮 ${nextDuration} 秒轮流玩`;

    const actorText =
      nextActor === 'both'
        ? '小兔和小熊一起配合'
        : nextActor === 'rabbit'
          ? '小兔提莫先玩'
          : '小熊波波先玩';

    const updated = recordToyBoatSessionProgress(
      {
        activeTaskId: nextTask.id,
        boatPositionZone: nextBoatZone,
        firstTurnActor: nextActor,
        turnDurationSeconds: nextDuration,
        planStrategy: nextStrategy,
        waitingActivityId: nextWaitAct,
        executionPhase: nextPhase,
        completedRoundCount: nextRounds,
      },
      recordMemory
        ? {
            gameId: 'toy_boat',
            scenarioTitle: nextTask.title,
            childChoiceSummary: `在「${nextTask.title}」安排了【${actorText} · ${strategyText}】`,
            companionReactionText: `我记得你在「${nextTask.title}」帮小兔和小熊商量了「${actorText}、${strategyText}」，还亲眼观察了执行结果呢！`,
            updatedAt: new Date().toISOString(),
          }
        : undefined
    );
    setCompletedTaskIds(updated.completedToyBoatTaskIds);
  };

  // 真实秒数倒计时引擎：与孩子设定的 3 秒或 5 秒严格一致
  useEffect(() => {
    if (executionPhase !== 'RUNNING') return;

    const timer = setInterval(() => {
      setSecondsLeftInRound((prev) => {
        if (prev <= 1) {
          if (activeExecutionRound === 1) {
            setActiveExecutionRound(2);
            setBoatPositionZone((prevZone) =>
              firstTurnActor === 'rabbit'
                ? 'BEAR_DOCK'
                : firstTurnActor === 'bear'
                  ? 'RABBIT_DOCK'
                  : 'CANAL_HARBOR'
            );
            return turnDurationSeconds;
          } else {
            // 完成两轮真实执行，进入结果观察状态
            setExecutionPhase('OBSERVED_RESULT');
            setCompletedRoundCount((c) => c + 2);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [executionPhase, activeExecutionRound, turnDurationSeconds, firstTurnActor]);

  // 切换冲突任务
  const handleSelectTask = (nextTaskId: string) => {
    sounds.playClick();
    const nextTask = getToyBoatTaskById(nextTaskId);
    const defaultStrat: PlanStrategyType =
      nextTask.id === 'task_limited_resource_coop' ? 'COOPERATE_ROLES' : 'TURN_WAIT';
    const defaultWait: WaitingActivityId =
      nextTask.id === 'task_limited_resource_coop' ? 'wait_cargo_crane' : 'wait_ring_bell';

    setActiveTaskId(nextTask.id);
    setPlanStrategy(defaultStrat);
    setWaitingActivityId(defaultWait);
    setExecutionPhase('PLANNING');
    setActiveExecutionRound(1);
    setSecondsLeftInRound(turnDurationSeconds);

    persistSnapshot({
      activeTaskId: nextTask.id,
      planStrategy: defaultStrat,
      waitingActivityId: defaultWait,
      executionPhase: 'PLANNING',
    });
  };

  // 直接移动玩具船到不同水域/码头
  const handleMoveBoatToZone = (zone: BoatPositionZone) => {
    sounds.playClick();
    setBoatPositionZone(zone);
    const zoneMeta = BOAT_ZONE_META.find((z) => z.zone === zone);
    persistSnapshot({ boatPositionZone: zone });
    if (zoneMeta) {
      speechNarrator.speak(`你把小木船移到了「${zoneMeta.label}」。`);
    }
  };

  // 设置谁先玩
  const handleSetFirstTurnActor = (actor: FirstTurnActor) => {
    sounds.playClick();
    setFirstTurnActor(actor);
    const autoZone: BoatPositionZone =
      actor === 'rabbit' ? 'RABBIT_DOCK' : actor === 'bear' ? 'BEAR_DOCK' : 'CENTER_POND';
    const nextStrategy: PlanStrategyType =
      actor === 'both' ? 'COOPERATE_ROLES' : planStrategy;
    setBoatPositionZone(autoZone);
    setPlanStrategy(nextStrategy);
    setExecutionPhase('PLANNING');

    persistSnapshot({
      firstTurnActor: actor,
      boatPositionZone: autoZone,
      planStrategy: nextStrategy,
      executionPhase: 'PLANNING',
    });
  };

  // 设置真实轮流秒数 (3秒 或 5秒)
  const handleSetTurnDuration = (seconds: 3 | 5) => {
    sounds.playClick();
    setTurnDurationSeconds(seconds);
    setSecondsLeftInRound(seconds);
    setExecutionPhase('PLANNING');
    persistSnapshot({ turnDurationSeconds: seconds, executionPhase: 'PLANNING' });
    speechNarrator.speak(`已设置每轮真实倒计时 ${seconds} 秒，到点就摇铃交接！`);
  };

  // 选择协商方案类型
  const handleSelectPlanStrategy = (strategy: PlanStrategyType) => {
    sounds.playClick();
    setPlanStrategy(strategy);
    let nextWait = waitingActivityId;
    let nextActor = firstTurnActor;
    if (strategy === 'COOPERATE_ROLES') {
      nextActor = 'both';
      nextWait = 'wait_cargo_crane';
    } else if (strategy === 'EXCHANGE_ALT') {
      if (nextActor === 'both') nextActor = 'rabbit';
      nextWait = 'wait_sand_digger';
    } else if (strategy === 'TURN_WAIT' && nextActor === 'both') {
      nextActor = 'rabbit';
    }
    setFirstTurnActor(nextActor);
    setWaitingActivityId(nextWait);
    setExecutionPhase('PLANNING');

    persistSnapshot({
      planStrategy: strategy,
      firstTurnActor: nextActor,
      waitingActivityId: nextWait,
      executionPhase: 'PLANNING',
    });
  };

  // 选择等待方的具体活动/替代道具
  const handleSelectWaitingActivity = (actId: WaitingActivityId) => {
    sounds.playClick();
    setWaitingActivityId(actId);
    setExecutionPhase('PLANNING');
    persistSnapshot({ waitingActivityId: actId, executionPhase: 'PLANNING' });
  };

  // 点击执行方案并观察结果
  const handleExecutePlan = () => {
    sounds.playKalimbaBloom();
    setActiveExecutionRound(1);
    setSecondsLeftInRound(turnDurationSeconds);
    setExecutionPhase('RUNNING');
    const startZone: BoatPositionZone =
      firstTurnActor === 'rabbit'
        ? 'RABBIT_DOCK'
        : firstTurnActor === 'bear'
          ? 'BEAR_DOCK'
          : 'CENTER_POND';
    setBoatPositionZone(startZone);

    persistSnapshot(
      {
        boatPositionZone: startZone,
        executionPhase: 'RUNNING',
      },
      true
    );
    speechNarrator.speak(
      `开始执行你的协商方案！${evaluation.round1ActionText}。你可以观察倒数秒表，或者点击推进下一轮交接！`
    );
  };

  // 手动推进交接轮次或直接完成观察（既支持等待真实秒数，也支持儿童主动点击交接观察）
  const handleAdvanceRoundOrComplete = () => {
    sounds.playClick();
    if (executionPhase === 'RUNNING' && activeExecutionRound === 1) {
      setActiveExecutionRound(2);
      setSecondsLeftInRound(turnDurationSeconds);
      const nextZone: BoatPositionZone =
        firstTurnActor === 'rabbit'
          ? 'BEAR_DOCK'
          : firstTurnActor === 'bear'
            ? 'RABBIT_DOCK'
            : 'CANAL_HARBOR';
      setBoatPositionZone(nextZone);
      persistSnapshot({ boatPositionZone: nextZone }, true);
      speechNarrator.speak(`铃铃铃！第 1 轮结束，现在交接进入第 2 轮：${evaluation.round2ActionText}`);
      return;
    }

    const nextRounds = completedRoundCount + 2;
    setExecutionPhase('OBSERVED_RESULT');
    setCompletedRoundCount(nextRounds);
    setSecondsLeftInRound(0);
    persistSnapshot(
      {
        executionPhase: 'OBSERVED_RESULT',
        completedRoundCount: nextRounds,
      },
      true
    );
    sounds.playKalimbaBloom();
    speechNarrator.speak(evaluation.executionOutcomeNarrative);
  };

  // 随时重新协商修改安排
  const handleRenegotiate = () => {
    sounds.playClick();
    setExecutionPhase('PLANNING');
    setActiveExecutionRound(1);
    setSecondsLeftInRound(turnDurationSeconds);
    persistSnapshot({ executionPhase: 'PLANNING' });
    speechNarrator.speak('我们停下来重新商量！你可以随时调整谁先玩、每轮几秒或者换成合作方案。');
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

  if (!isApproved && !adultPreviewUnlocked) {
    return (
      <div
        data-testid="audit-gate-blocked"
        className="p-6 sm:p-8 bg-amber-50 rounded-3xl border-2 border-amber-200 text-stone-800 text-center space-y-4 my-4 max-w-xl mx-auto"
      >
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

  const renderSatisfactionBadge = (level: NeedSatisfactionLevel, text: string) => {
    const colorClass =
      level === 'HIGH_SATISFIED'
        ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
        : level === 'MODERATE_WAITING'
          ? 'bg-amber-100 text-amber-950 border-amber-400'
          : 'bg-rose-100 text-rose-950 border-rose-400';
    return (
      <span className={`inline-block text-[11px] font-black px-2.5 py-0.5 rounded-full border ${colorClass}`}>
        {text}
      </span>
    );
  };

  return (
    <div
      data-testid="toy-boat-negotiation-game"
      className="w-full min-w-0 max-w-4xl mx-auto bg-teal-50/40 rounded-3xl border-2 border-teal-200 shadow-xl overflow-hidden flex flex-col my-2"
    >
      {adultPreviewUnlocked && !isApproved && (
        <div className="bg-amber-500 text-white text-xs font-black px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="break-words">⚠️ 家长与审阅人预览模式 · 请在成年人陪伴下审阅，尚未面向儿童正式开放</span>
          </div>
          <span className="bg-amber-700 px-2 py-0.5 rounded-full text-[10px] shrink-0">大人陪伴审阅</span>
        </div>
      )}

      {/* 顶部标题栏：清澈水湾与船坞协商剧场氛围 */}
      <div className="bg-linear-to-r from-teal-100 via-cyan-100 to-sky-100 px-3 sm:px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-teal-200 min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-200/90 flex items-center justify-center shrink-0 shadow-xs">
            <ToySailboatSvg className="w-8 h-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-base sm:text-2xl font-black text-teal-950">
                玩具船协商 · 动手分配与结果观察
              </h2>
              <span
                data-testid="toy-boat-completed-count"
                className="text-[11px] bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-full font-black"
              >
                已完成 {completedTaskIds.length}/{TOY_BOAT_TASKS.length} 个协商任务
              </span>
            </div>
            <p className="text-xs text-teal-800 mt-0.5 font-bold">
              移动小船位置 · 安排先后顺序与真实秒数 · 观察双方需求满足与真实结果
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExitGame}
          className="min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-teal-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center shrink-0"
          aria-label="离开游戏"
        >
          离开小岛
        </button>
      </div>

      <div className="p-2.5 sm:p-5 space-y-3.5 sm:space-y-4 min-w-0">
        {/* 两个不同冲突条件的任务切换栏 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {TOY_BOAT_TASKS.map((t) => {
            const isSelected = t.id === task.id;
            const isDone = completedTaskIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                data-testid={`boat-task-tab-${t.id}`}
                onClick={() => handleSelectTask(t.id)}
                className={`min-h-[60px] p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-100 border-teal-600 text-teal-950 shadow-sm ring-2 ring-teal-300'
                    : 'bg-white border-stone-200 hover:border-teal-300 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-black">{t.badge}：{t.title}</span>
                  {isDone && (
                    <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-black shrink-0">
                      已验证方案
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-600 font-bold mt-1">
                  {t.conflictFocus}
                </span>
              </button>
            );
          })}
        </div>

        {/* 1. 可交互水塘画布：可移动玩具船 + 双方角色实时反应与需求满足状态 */}
        <div className="bg-linear-to-b from-sky-100 via-teal-100 to-amber-100/70 rounded-2xl border-2 border-teal-300 p-3.5 sm:p-4 space-y-3 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs sm:text-sm font-black text-teal-950 bg-white/90 px-3 py-1.5 rounded-xl border border-teal-200">
              {task.resourceConstraintNote}
            </div>
            <div
              data-testid="boat-execution-status-badge"
              data-phase={executionPhase}
              className="text-xs font-black bg-amber-100 text-amber-950 border border-amber-400 px-3 py-1.5 rounded-xl"
            >
              {executionPhase === 'PLANNING'
                ? '🛠️ 正在布置协商方案'
                : executionPhase === 'RUNNING'
                  ? `⏱️ 正在执行第 ${activeExecutionRound}/2 轮（真实倒数 ${secondsLeftInRound} 秒）`
                  : '✅ 已执行并观察真实结果'}
            </div>
          </div>

          {/* 动手移动玩具船的四个水域码头槽位 */}
          <div className="bg-sky-200/70 rounded-2xl border-2 border-sky-300 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-sky-950">
              <span>⛵ 动手点选码头，把玩具船开过去（当前停靠：{BOAT_ZONE_META.find((z) => z.zone === boatPositionZone)?.label}）：</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BOAT_ZONE_META.map((z) => {
                const hasBoatHere = boatPositionZone === z.zone;
                return (
                  <button
                    key={z.zone}
                    type="button"
                    data-testid={`move-boat-zone-${z.zone}`}
                    data-has-boat={hasBoatHere ? 'true' : 'false'}
                    onClick={() => handleMoveBoatToZone(z.zone)}
                    className={`min-h-[68px] p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                      hasBoatHere
                        ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-300 scale-102'
                        : 'bg-sky-50/80 border-sky-300 hover:bg-white/80 text-sky-950'
                    }`}
                  >
                    {hasBoatHere ? (
                      <ToySailboatSvg
                        hasCargo={
                          planStrategy === 'COOPERATE_ROLES' ||
                          waitingActivityId === 'wait_cargo_crane'
                        }
                        isSailing={executionPhase === 'RUNNING'}
                        className="w-11 h-11"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-sky-400 flex items-center justify-center text-[11px] font-black text-sky-700">
                        停船点
                      </div>
                    )}
                    <span className="text-xs font-black text-stone-900 mt-1">{z.label}</span>
                    <span className="text-[10px] text-stone-600 font-medium">{z.shortHint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 两个角色的实时需求满足状态与对话反应卡片（非心理能力评分） */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 小兔提莫 */}
            <div
              data-testid="rabbit-reaction-card"
              data-satisfaction={evaluation.rabbitSatisfaction}
              className="bg-white/95 rounded-2xl border-2 border-rose-200 p-3.5 flex items-start gap-3 shadow-2xs"
            >
              <div className="flex flex-col items-center shrink-0">
                <AnimalFriendSvg
                  type="rabbit"
                  satisfaction={evaluation.rabbitSatisfaction}
                  isActiveTurn={firstTurnActor === 'rabbit' || firstTurnActor === 'both'}
                  className="w-14 h-14"
                />
                <span className="text-xs font-black text-stone-900 mt-1">小兔提莫</span>
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="text-[11px] font-bold text-stone-500">{task.rabbitNeedLabel}</div>
                {renderSatisfactionBadge(
                  evaluation.rabbitSatisfaction,
                  evaluation.rabbitStatusLabel
                )}
                <p className="text-xs sm:text-sm font-black text-stone-800 leading-snug">
                  {evaluation.rabbitSpokenReaction}
                </p>
              </div>
            </div>

            {/* 小熊波波 */}
            <div
              data-testid="bear-reaction-card"
              data-satisfaction={evaluation.bearSatisfaction}
              className="bg-white/95 rounded-2xl border-2 border-amber-200 p-3.5 flex items-start gap-3 shadow-2xs"
            >
              <div className="flex flex-col items-center shrink-0">
                <AnimalFriendSvg
                  type="bear"
                  satisfaction={evaluation.bearSatisfaction}
                  isActiveTurn={firstTurnActor === 'bear' || firstTurnActor === 'both'}
                  className="w-14 h-14"
                />
                <span className="text-xs font-black text-stone-900 mt-1">小熊波波</span>
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="text-[11px] font-bold text-stone-500">{task.bearNeedLabel}</div>
                {renderSatisfactionBadge(evaluation.bearSatisfaction, evaluation.bearStatusLabel)}
                <p className="text-xs sm:text-sm font-black text-stone-800 leading-snug">
                  {evaluation.bearSpokenReaction}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 协商规则操作台：安排先后顺序、真实轮流秒数、合作/交换与等待期活动 */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
            <h3 className="text-sm sm:text-base font-black text-stone-900">
              🛠️ 亲自制定协商方案（调整任意条件，观察上面两只小动物的反应变化）：
            </h3>
            {executionPhase !== 'PLANNING' && (
              <button
                type="button"
                data-testid="renegotiate-plan-btn"
                onClick={handleRenegotiate}
                className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-black cursor-pointer"
              >
                🔄 重新协商 / 修改安排
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 操作维度 1：安排先后顺序 */}
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 space-y-2">
              <div className="text-xs font-black text-stone-800">
                1. 安排谁先上船：
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'rabbit' as FirstTurnActor, label: '🐰 小兔提莫先玩' },
                  { id: 'bear' as FirstTurnActor, label: '🐻 小熊波波先玩' },
                  { id: 'both' as FirstTurnActor, label: '🤝 两人一起分工上场' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`order-actor-${opt.id}`}
                    onClick={() => handleSetFirstTurnActor(opt.id)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-black text-left cursor-pointer transition-all ${
                      firstTurnActor === opt.id
                        ? 'bg-teal-600 text-white border-teal-700 shadow-2xs'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-teal-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 操作维度 2：设置简单、真实、可理解的轮流时长（3秒 vs 5秒，与真实倒数严格一致） */}
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 space-y-2">
              <div className="text-xs font-black text-stone-800">
                2. 设置每轮真实时长：
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { sec: 3 as const, label: '⏱️ 每轮 3 秒（快节奏交接）', desc: '等待时间短，适合心急伙伴' },
                  { sec: 5 as const, label: '⏱️ 每轮 5 秒（慢节奏航行）', desc: '玩得更久，但等待方需耐心' },
                ].map((opt) => (
                  <button
                    key={opt.sec}
                    type="button"
                    data-testid={`duration-seconds-${opt.sec}`}
                    onClick={() => handleSetTurnDuration(opt.sec)}
                    className={`min-h-[48px] px-3 py-2 rounded-xl border text-left cursor-pointer transition-all ${
                      turnDurationSeconds === opt.sec
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="text-xs font-black">{opt.label}</div>
                    <div
                      className={`text-[10px] ${
                        turnDurationSeconds === opt.sec ? 'text-amber-50' : 'text-stone-500'
                      }`}
                    >
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 操作维度 3：提出交换、合作或替代方案 */}
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 space-y-2">
              <div className="text-xs font-black text-stone-800">
                3. 选择协商方式：
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'TURN_WAIT' as PlanStrategyType, label: '🔔 轮流玩（按秒表交接）' },
                  { id: 'COOPERATE_ROLES' as PlanStrategyType, label: '⚓ 分工合作（船长+装卸员）' },
                  { id: 'EXCHANGE_ALT' as PlanStrategyType, label: '🚜 交换与替代（开船+挖水渠）' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    data-testid={`strategy-option-${st.id}`}
                    onClick={() => handleSelectPlanStrategy(st.id)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-black text-left cursor-pointer transition-all ${
                      planStrategy === st.id
                        ? 'bg-sky-600 text-white border-sky-700 shadow-2xs'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-sky-400'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 操作维度 4：等待或配合的一方做什么？（直观对比空手干等 vs 替代/合作道具） */}
          <div className="space-y-2 pt-1 min-w-0">
            <div className="text-xs font-black text-stone-800">
              4. 岸上等待或配合的伙伴做什么？（试试选「空手干等」与「开挖掘机/当计时员」有什么不同）：
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 min-w-0">
              {WAITING_ACTIVITY_OPTIONS.map((act) => {
                const isSelected = waitingActivityId === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    data-testid={`waiting-activity-${act.id}`}
                    onClick={() => handleSelectWaitingActivity(act.id)}
                    className={`min-h-[56px] min-w-0 p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-xs ring-2 ring-teal-200'
                        : 'bg-stone-50 border-stone-200 hover:border-teal-300 text-stone-700'
                    }`}
                  >
                    <div className="text-xs font-black break-words">
                      {act.icon} {act.label}
                    </div>
                    <div className="text-[10px] text-stone-600 font-medium mt-0.5 break-words">
                      {act.shortDesc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 执行方案与交接操作栏 */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
            <div className="text-xs font-bold text-stone-600">
              {executionPhase === 'RUNNING'
                ? activeExecutionRound === 1
                  ? `正在运行：${evaluation.round1ActionText}（剩余 ${secondsLeftInRound} 秒）`
                  : `正在运行：${evaluation.round2ActionText}（剩余 ${secondsLeftInRound} 秒）`
                : '安排好上面 4 项后，点击右侧按钮真正运行小船并观察结果！'}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {executionPhase === 'RUNNING' && (
                <button
                  type="button"
                  data-testid="advance-negotiation-round-btn"
                  onClick={handleAdvanceRoundOrComplete}
                  className="min-h-[52px] px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm cursor-pointer shadow-sm"
                >
                  {activeExecutionRound === 1
                    ? '🔔 摇铃交接第 2 轮'
                    : '✅ 完成交接并查看结果'}
                </button>
              )}

              <button
                type="button"
                data-testid="execute-negotiation-plan-btn"
                onClick={handleExecutePlan}
                className="min-h-[56px] px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm sm:text-base cursor-pointer shadow-md transition-colors"
              >
                {executionPhase === 'PLANNING'
                  ? '🚀 开始执行协商方案'
                  : '🔄 重新运行当前方案'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. 真实结果四维观察面板（谁先玩 / 谁在等 / 是否需要配合 / 双方是否满意） */}
        <div
          data-testid="negotiation-result-observation"
          className="bg-white rounded-2xl border-2 border-teal-300 p-4 sm:p-5 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-sm sm:text-base font-black text-teal-950">
              🔍 当前协商方案的真实结果观察（没有唯一标准答案，看看双方感受）：
            </h4>
            {executionPhase === 'OBSERVED_RESULT' && (
              <span
                data-testid="negotiation-observed-complete-badge"
                className="text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-400 px-3 py-1 rounded-full"
              >
                ✨ 已完成两轮试航与结果验证
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
              <span className="font-black text-sky-950">① 谁先玩：</span>
              <span className="text-stone-800 font-bold">{evaluation.whoPlaysFirstLabel}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="font-black text-amber-950">② 谁在等：</span>
              <span className="text-stone-800 font-bold">{evaluation.whoWaitsLabel}</span>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
              <span className="font-black text-teal-950">③ 是否需要配合：</span>
              <span className="text-stone-800 font-bold">{evaluation.requiresCooperationLabel}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="font-black text-emerald-950">④ 双方是否满意：</span>
              <span className="text-stone-800 font-bold">{evaluation.overallSatisfactionSummary}</span>
            </div>
          </div>

          {executionPhase === 'OBSERVED_RESULT' && (
            <div
              data-testid="execution-outcome-narrative"
              className="p-3.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-xs sm:text-sm font-black text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <span>{evaluation.executionOutcomeNarrative}</span>
              <button
                type="button"
                onClick={handleRenegotiate}
                className="min-h-[44px] px-4 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-400 text-xs font-black shrink-0 cursor-pointer"
              >
                换一种分配方案再试
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
