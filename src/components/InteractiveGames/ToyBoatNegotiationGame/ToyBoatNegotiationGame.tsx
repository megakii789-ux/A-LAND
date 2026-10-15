import React, { useState, useEffect, useRef } from 'react';
import {
  TOY_BOAT_TASKS,
  WAITING_ACTIVITY_OPTIONS,
  BoatPositionZone,
  FirstTurnActor,
  PlanStrategyType,
  WaitingActivityId,
  NeedSatisfactionLevel,
  getToyBoatTaskById,
  evaluateNegotiationPlan,
} from '../../../domain/games/toyBoatNegotiationLogic';
import { ContentAuditRegistry } from '../../../domain/cognitive/ContentAuditRegistry';
import {
  isAdultPreviewSessionValid,
  issueAdultPreviewSession,
  revokeAdultPreviewSession,
  lockParentAccess,
  subscribeParentAccess,
  isInternalPlaytestEnabled,
} from '../../../domain/privacy/parentAccess';
import {
  getProductExperienceMetrics,
  recordToyBoatSessionProgress,
  ToyBoatCompletionMode,
  ToyBoatTaskProgressSnapshot,
} from '../../../domain/cognitive/productExperienceMetrics';
import { ParentGateModal } from '../../ParentGateModal';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';

interface Props {
  onExit: () => void;
  isAdultPreview?: boolean;
  previewSessionToken?: string | null;
}

const SCOPE_KEY = 'game_toy_boat';

/**
 * 小动物伙伴（小兔提莫 / 小熊波波）角色神态与动作 SVG
 */
const AnimalFriendSvg: React.FC<{
  type: 'rabbit' | 'bear';
  satisfaction: NeedSatisfactionLevel;
  isActiveTurn: boolean;
  isUsingAltProp?: boolean;
  className?: string;
}> = ({ type, satisfaction, isActiveTurn, isUsingAltProp = false, className = 'w-14 h-14' }) => {
  const ringStroke =
    satisfaction === 'HIGH_SATISFIED'
      ? '#10B981'
      : satisfaction === 'MODERATE_WAITING'
        ? '#F59E0B'
        : '#F43F5E';

  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true" fill="none">
      <circle
        cx="40"
        cy="42"
        r="34"
        fill={isActiveTurn ? '#FEF3C7' : '#FFFFFF'}
        stroke={ringStroke}
        strokeWidth="3.5"
      />
      {type === 'rabbit' ? (
        <g>
          {/* 兔耳朵（着急时耳朵向两侧低垂，开心时竖起） */}
          <ellipse
            cx={satisfaction === 'LOW_FRUSTRATED' ? '24' : '29'}
            cy={satisfaction === 'LOW_FRUSTRATED' ? '22' : '18'}
            rx="5.5"
            ry="13"
            transform={satisfaction === 'LOW_FRUSTRATED' ? 'rotate(-22 24 22)' : undefined}
            fill="#FDE8E8"
            stroke="#9F1239"
            strokeWidth="2"
          />
          <ellipse
            cx={satisfaction === 'LOW_FRUSTRATED' ? '56' : '51'}
            cy={satisfaction === 'LOW_FRUSTRATED' ? '22' : '18'}
            rx="5.5"
            ry="13"
            transform={satisfaction === 'LOW_FRUSTRATED' ? 'rotate(22 56 22)' : undefined}
            fill="#FDE8E8"
            stroke="#9F1239"
            strokeWidth="2"
          />
          {/* 兔脸 */}
          <circle cx="40" cy="44" r="18" fill="#FFF1F2" stroke="#9F1239" strokeWidth="2.2" />
          <circle cx="33" cy="41" r="2.5" fill="#881337" />
          <circle cx="47" cy="41" r="2.5" fill="#881337" />
          <circle cx="28" cy="46" r="3" fill="#FDA4AF" opacity="0.65" />
          <circle cx="52" cy="46" r="3" fill="#FDA4AF" opacity="0.65" />
          {satisfaction === 'HIGH_SATISFIED' ? (
            <path d="M34 48Q40 54 46 48" stroke="#9F1239" strokeWidth="2.4" strokeLinecap="round" />
          ) : satisfaction === 'MODERATE_WAITING' ? (
            <line x1="35" y1="50" x2="45" y2="50" stroke="#9F1239" strokeWidth="2.2" strokeLinecap="round" />
          ) : (
            <path d="M34 52Q40 47 46 52" stroke="#E11D48" strokeWidth="2.4" strokeLinecap="round" />
          )}
        </g>
      ) : (
        <g>
          {/* 熊耳朵 */}
          <circle cx="25" cy="26" r="7" fill="#D97706" stroke="#78350F" strokeWidth="2.2" />
          <circle cx="55" cy="26" r="7" fill="#D97706" stroke="#78350F" strokeWidth="2.2" />
          {/* 熊脸 */}
          <circle cx="40" cy="44" r="19" fill="#F59E0B" stroke="#78350F" strokeWidth="2.2" />
          <ellipse cx="40" cy="48" rx="8" ry="6" fill="#FEF3C7" />
          <circle cx="33" cy="40" r="2.5" fill="#451A03" />
          <circle cx="47" cy="40" r="2.5" fill="#451A03" />
          <circle cx="40" cy="45" r="2.5" fill="#78350F" />
          {satisfaction === 'HIGH_SATISFIED' ? (
            <path d="M34 50Q40 55 46 50" stroke="#78350F" strokeWidth="2.4" strokeLinecap="round" />
          ) : satisfaction === 'MODERATE_WAITING' ? (
            <line x1="35" y1="51" x2="45" y2="51" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
          ) : (
            <path d="M34 53Q40 48 46 53" stroke="#B91C1C" strokeWidth="2.4" strokeLinecap="round" />
          )}
        </g>
      )}
      {isActiveTurn && (
        <circle cx="64" cy="18" r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
      )}
      {!isActiveTurn && isUsingAltProp && (
        <circle cx="64" cy="18" r="8" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
      )}
    </svg>
  );
};

/**
 * 可移动的木质小帆船 SVG
 */
const ToySailboatSvg: React.FC<{
  hasCargo?: boolean;
  isSailing?: boolean;
  className?: string;
}> = ({ hasCargo = false, isSailing = false, className = 'w-14 h-14' }) => (
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
}> = [
  {
    zone: 'RABBIT_DOCK',
    label: '左岸 · 小兔码头',
    shortHint: '停靠小兔身边',
  },
  {
    zone: 'CENTER_POND',
    label: '池塘中央航道',
    shortHint: '水塘正中间',
  },
  {
    zone: 'BEAR_DOCK',
    label: '右岸 · 小熊码头',
    shortHint: '停靠小熊身边',
  },
  {
    zone: 'CANAL_HARBOR',
    label: '浅滩水渠新港',
    shortHint: '通往挖掘机水渠',
  },
];

function createDefaultTaskProgress(taskId: string): ToyBoatTaskProgressSnapshot {
  const isCoopTask = taskId === 'task_limited_resource_coop';
  return {
    taskId,
    firstTurnActor: isCoopTask ? 'both' : 'rabbit',
    turnDurationSeconds: 3,
    planStrategy: isCoopTask ? 'COOPERATE_ROLES' : 'TURN_WAIT',
    waitingActivityId: isCoopTask ? 'wait_cargo_crane' : 'wait_ring_bell',
    boatPositionZone: isCoopTask ? 'CENTER_POND' : 'RABBIT_DOCK',
    executionPhase: 'PLANNING',
    completedRoundCount: 0,
    completionMode: null,
  };
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
  const adultPreviewUnlocked =
    isAdultPreviewSessionValid(SCOPE_KEY, effectiveToken) || isInternalPlaytestEnabled();
  const isApproved = ContentAuditRegistry.canRenderContent('game_toy_boat');

  const initialMetrics = getProductExperienceMetrics();
  const savedSnapshot = initialMetrics.toyBoatSessionState;
  const initialTask = getToyBoatTaskById(savedSnapshot?.activeTaskId || TOY_BOAT_TASKS[0].id);

  // P0-B: 每个协商任务独立维护自己的执行状态与完成轮数，避免任务一的完成数污染任务二
  const initialTaskMap: Record<string, ToyBoatTaskProgressSnapshot> = {};
  for (const t of TOY_BOAT_TASKS) {
    const fromMap = savedSnapshot?.taskStatesById?.[t.id];
    if (fromMap) {
      initialTaskMap[t.id] = fromMap;
    } else if (savedSnapshot && savedSnapshot.activeTaskId === t.id) {
      const verifiedForThisTask =
        savedSnapshot.executionPhase === 'OBSERVED_RESULT' &&
        savedSnapshot.completedRoundCount >= 2 &&
        (!savedSnapshot.completedForTaskId || savedSnapshot.completedForTaskId === t.id);
      initialTaskMap[t.id] = {
        taskId: t.id,
        firstTurnActor: savedSnapshot.firstTurnActor || 'rabbit',
        turnDurationSeconds: savedSnapshot.turnDurationSeconds === 5 ? 5 : 3,
        planStrategy: savedSnapshot.planStrategy || 'TURN_WAIT',
        waitingActivityId: savedSnapshot.waitingActivityId || 'wait_ring_bell',
        boatPositionZone: savedSnapshot.boatPositionZone || 'RABBIT_DOCK',
        executionPhase: verifiedForThisTask ? 'OBSERVED_RESULT' : 'PLANNING',
        completedRoundCount: verifiedForThisTask ? savedSnapshot.completedRoundCount : 0,
        completionMode:
          savedSnapshot.completionMode ||
          initialMetrics.toyBoatTaskCompletionModes?.[t.id] ||
          null,
      };
    } else {
      initialTaskMap[t.id] = createDefaultTaskProgress(t.id);
    }
  }

  const initialActiveState = initialTaskMap[initialTask.id] || createDefaultTaskProgress(initialTask.id);

  const [activeTaskId, setActiveTaskId] = useState<string>(initialTask.id);
  const [taskStatesById, setTaskStatesById] =
    useState<Record<string, ToyBoatTaskProgressSnapshot>>(initialTaskMap);
  const [boatPositionZone, setBoatPositionZone] = useState<BoatPositionZone>(
    initialActiveState.boatPositionZone
  );
  const [firstTurnActor, setFirstTurnActor] = useState<FirstTurnActor>(
    initialActiveState.firstTurnActor
  );
  const [turnDurationSeconds, setTurnDurationSeconds] = useState<3 | 5>(
    initialActiveState.turnDurationSeconds === 5 ? 5 : 3
  );
  const [planStrategy, setPlanStrategy] = useState<PlanStrategyType>(
    initialActiveState.planStrategy
  );
  const [waitingActivityId, setWaitingActivityId] = useState<WaitingActivityId>(
    initialActiveState.waitingActivityId as WaitingActivityId
  );
  const [executionPhase, setExecutionPhase] = useState<'PLANNING' | 'RUNNING' | 'OBSERVED_RESULT'>(
    initialActiveState.executionPhase === 'OBSERVED_RESULT' ? 'OBSERVED_RESULT' : 'PLANNING'
  );
  const [activeExecutionRound, setActiveExecutionRound] = useState<1 | 2>(1);
  const [secondsLeftInRound, setSecondsLeftInRound] = useState<number>(
    initialActiveState.turnDurationSeconds === 5 ? 5 : 3
  );
  const [completedRoundCount, setCompletedRoundCount] = useState<number>(
    initialActiveState.completedRoundCount
  );
  const [completionMode, setCompletionMode] = useState<ToyBoatCompletionMode | null>(
    initialActiveState.completionMode ?? null
  );
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(
    () => initialMetrics.completedToyBoatTaskIds
  );

  // P0-A: 单次执行幂等锁与提前交接标记，防止倒计时与手动按钮并发重复触发完成记录
  const executionRunCompletedRef = useRef<boolean>(
    initialActiveState.executionPhase === 'OBSERVED_RESULT'
  );
  const hadManualEarlyHandoffRef = useRef<boolean>(false);

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
      `${task.title}。${task.sceneSummary} 请先移动小船位置、设置轮流秒数或合作方案，再点开始执行观察实验结果吧！`
    );
    return () => {
      speechNarrator.stop();
    };
  }, [activeTaskId]);

  /**
   * 统一持久化当前任务与全局会话状态（支持 P0-A、P0-B、P1-B）
   */
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
      completionMode: ToyBoatCompletionMode | null;
      completedForTaskId: string | null;
      taskStatesOverride: Record<string, ToyBoatTaskProgressSnapshot>;
    }>,
    memoryEventStage?: 'ARRANGED_OR_STARTED' | 'COMPLETED_OBSERVED'
  ) => {
    const targetTaskId = nextOverrides.activeTaskId ?? activeTaskId;
    const nextTask = getToyBoatTaskById(targetTaskId);
    const nextBoatZone = nextOverrides.boatPositionZone ?? boatPositionZone;
    const nextActor = nextOverrides.firstTurnActor ?? firstTurnActor;
    const nextDuration = nextOverrides.turnDurationSeconds ?? turnDurationSeconds;
    const nextStrategy = nextOverrides.planStrategy ?? planStrategy;
    const nextWaitAct = nextOverrides.waitingActivityId ?? waitingActivityId;
    const nextPhase = nextOverrides.executionPhase ?? executionPhase;
    const nextRounds = nextOverrides.completedRoundCount ?? completedRoundCount;
    const nextCompMode =
      nextOverrides.completionMode !== undefined ? nextOverrides.completionMode : completionMode;
    const nextCompletedForTaskId =
      nextOverrides.completedForTaskId !== undefined
        ? nextOverrides.completedForTaskId
        : nextPhase === 'OBSERVED_RESULT' && nextRounds >= 2
          ? nextTask.id
          : null;

    const updatedTaskEntry: ToyBoatTaskProgressSnapshot = {
      taskId: nextTask.id,
      boatPositionZone: nextBoatZone,
      firstTurnActor: nextActor,
      turnDurationSeconds: nextDuration,
      planStrategy: nextStrategy,
      waitingActivityId: nextWaitAct,
      executionPhase: nextPhase,
      completedRoundCount: nextRounds,
      completionMode: nextCompMode,
    };

    const nextTaskMap: Record<string, ToyBoatTaskProgressSnapshot> = {
      ...(nextOverrides.taskStatesOverride ?? taskStatesById),
      [nextTask.id]: updatedTaskEntry,
    };
    setTaskStatesById(nextTaskMap);

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

    // P1-B: 伙伴只能记住已经实际发生的事件！未完成观察前绝不提前宣告结果已经发生
    const companionMemory =
      memoryEventStage === 'COMPLETED_OBSERVED'
        ? {
            gameId: 'toy_boat' as const,
            scenarioTitle: nextTask.title,
            eventStage: 'COMPLETED_OBSERVED' as const,
            childChoiceSummary: `在「${nextTask.title}」观察到双方合作结果：【${actorText} · ${strategyText}】`,
            companionReactionText: `我们刚刚在「${nextTask.title}」亲眼观察到双方怎样合作：${actorText}、${strategyText}！`,
            updatedAt: new Date().toISOString(),
          }
        : memoryEventStage === 'ARRANGED_OR_STARTED'
          ? {
              gameId: 'toy_boat' as const,
              scenarioTitle: nextTask.title,
              eventStage: 'ARRANGED_OR_STARTED' as const,
              childChoiceSummary: `刚才在「${nextTask.title}」安排了【${actorText} · ${strategyText}】（正在执行实验）`,
              companionReactionText: `我记得你刚才在「${nextTask.title}」安排了「${actorText}、${strategyText}」，快看看执行起来会发生什么吧！`,
              updatedAt: new Date().toISOString(),
            }
          : undefined;

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
        completionMode: nextCompMode,
        completedForTaskId: nextCompletedForTaskId,
        taskStatesById: nextTaskMap,
      },
      companionMemory
    );
    setCompletedTaskIds(updated.completedToyBoatTaskIds);
  };

  /**
   * P0-A: 统一的执行完成函数（真实倒计时自然结束与手动提前交接均通过此函数持久化，且单次执行严格只记录一次）
   */
  const finalizeCurrentExecution = (triggerSource: 'TIMER_NATURAL' | 'MANUAL_BUTTON') => {
    if (executionRunCompletedRef.current) {
      return;
    }
    executionRunCompletedRef.current = true;

    const resolvedMode: ToyBoatCompletionMode =
      triggerSource === 'MANUAL_BUTTON' || hadManualEarlyHandoffRef.current
        ? 'MANUAL_EARLY_HANDOFF'
        : 'FULL_WAIT_TIMER';

    const finalZone: BoatPositionZone =
      firstTurnActor === 'rabbit'
        ? 'BEAR_DOCK'
        : firstTurnActor === 'bear'
          ? 'RABBIT_DOCK'
          : 'CANAL_HARBOR';

    setBoatPositionZone(finalZone);
    setExecutionPhase('OBSERVED_RESULT');
    setCompletedRoundCount(2);
    setCompletionMode(resolvedMode);
    setSecondsLeftInRound(0);

    persistSnapshot(
      {
        boatPositionZone: finalZone,
        executionPhase: 'OBSERVED_RESULT',
        completedRoundCount: 2,
        completionMode: resolvedMode,
        completedForTaskId: activeTaskId,
      },
      'COMPLETED_OBSERVED'
    );

    sounds.playKalimbaBloom();
    speechNarrator.speak(evaluation.executionOutcomeNarrative);
  };

  const finalizeExecutionRef = useRef(finalizeCurrentExecution);
  finalizeExecutionRef.current = finalizeCurrentExecution;

  // P0-A: 真实秒数倒计时引擎（与孩子设定的 3 秒或 5 秒严格一致，自然倒数结束后调用统一完成函数持久化）
  useEffect(() => {
    if (executionPhase !== 'RUNNING') return;

    const timer = setInterval(() => {
      if (secondsLeftInRound <= 1) {
        if (activeExecutionRound === 1) {
          const round2Zone: BoatPositionZone =
            firstTurnActor === 'rabbit'
              ? 'BEAR_DOCK'
              : firstTurnActor === 'bear'
                ? 'RABBIT_DOCK'
                : 'CANAL_HARBOR';
          setActiveExecutionRound(2);
          setBoatPositionZone(round2Zone);
          setSecondsLeftInRound(turnDurationSeconds);
        } else {
          clearInterval(timer);
          finalizeExecutionRef.current('TIMER_NATURAL');
        }
      } else {
        setSecondsLeftInRound((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [executionPhase, activeExecutionRound, secondsLeftInRound, turnDurationSeconds, firstTurnActor]);

  /**
   * P0-B: 切换冲突任务时，恢复目标任务自己的独立进度（未执行过的任务保持 PLANNING 且 completedRoundCount = 0，绝不继承上一任务的完成数）
   */
  const handleSelectTask = (nextTaskId: string) => {
    sounds.playClick();
    const targetTask = getToyBoatTaskById(nextTaskId);
    const savedTargetState =
      taskStatesById[targetTask.id] || createDefaultTaskProgress(targetTask.id);
    const restoredDuration: 3 | 5 = savedTargetState.turnDurationSeconds === 5 ? 5 : 3;
    const restoredPhase =
      savedTargetState.executionPhase === 'OBSERVED_RESULT' &&
      savedTargetState.completedRoundCount >= 2
        ? 'OBSERVED_RESULT'
        : 'PLANNING';
    const restoredRounds = restoredPhase === 'OBSERVED_RESULT' ? savedTargetState.completedRoundCount : 0;
    const restoredMode = restoredPhase === 'OBSERVED_RESULT' ? savedTargetState.completionMode ?? null : null;

    executionRunCompletedRef.current = restoredPhase === 'OBSERVED_RESULT';
    hadManualEarlyHandoffRef.current = false;

    setActiveTaskId(targetTask.id);
    setBoatPositionZone(savedTargetState.boatPositionZone);
    setFirstTurnActor(savedTargetState.firstTurnActor);
    setTurnDurationSeconds(restoredDuration);
    setPlanStrategy(savedTargetState.planStrategy);
    setWaitingActivityId(savedTargetState.waitingActivityId as WaitingActivityId);
    setExecutionPhase(restoredPhase);
    setActiveExecutionRound(1);
    setSecondsLeftInRound(restoredDuration);
    setCompletedRoundCount(restoredRounds);
    setCompletionMode(restoredMode);

    persistSnapshot({
      activeTaskId: targetTask.id,
      boatPositionZone: savedTargetState.boatPositionZone,
      firstTurnActor: savedTargetState.firstTurnActor,
      turnDurationSeconds: restoredDuration,
      planStrategy: savedTargetState.planStrategy,
      waitingActivityId: savedTargetState.waitingActivityId as WaitingActivityId,
      executionPhase: restoredPhase,
      completedRoundCount: restoredRounds,
      completionMode: restoredMode,
      completedForTaskId: restoredPhase === 'OBSERVED_RESULT' ? targetTask.id : null,
    });
  };

  // 直接移动玩具船到不同水域/码头
  const handleMoveBoatToZone = (zone: BoatPositionZone) => {
    sounds.playClick();
    executionRunCompletedRef.current = false;
    setBoatPositionZone(zone);
    setExecutionPhase('PLANNING');
    setCompletedRoundCount(0);
    setCompletionMode(null);
    const zoneMeta = BOAT_ZONE_META.find((z) => z.zone === zone);
    persistSnapshot({
      boatPositionZone: zone,
      executionPhase: 'PLANNING',
      completedRoundCount: 0,
      completionMode: null,
      completedForTaskId: null,
    });
    if (zoneMeta) {
      speechNarrator.speak(`你把小木船移到了「${zoneMeta.label}」。`);
    }
  };

  // 设置谁先玩
  const handleSetFirstTurnActor = (actor: FirstTurnActor) => {
    sounds.playClick();
    executionRunCompletedRef.current = false;
    setFirstTurnActor(actor);
    const autoZone: BoatPositionZone =
      actor === 'rabbit' ? 'RABBIT_DOCK' : actor === 'bear' ? 'BEAR_DOCK' : 'CENTER_POND';
    const nextStrategy: PlanStrategyType =
      actor === 'both' ? 'COOPERATE_ROLES' : planStrategy;
    setBoatPositionZone(autoZone);
    setPlanStrategy(nextStrategy);
    setExecutionPhase('PLANNING');
    setCompletedRoundCount(0);
    setCompletionMode(null);

    persistSnapshot({
      firstTurnActor: actor,
      boatPositionZone: autoZone,
      planStrategy: nextStrategy,
      executionPhase: 'PLANNING',
      completedRoundCount: 0,
      completionMode: null,
      completedForTaskId: null,
    });
  };

  // 设置真实轮流秒数 (3秒 或 5秒)
  const handleSetTurnDuration = (seconds: 3 | 5) => {
    sounds.playClick();
    executionRunCompletedRef.current = false;
    setTurnDurationSeconds(seconds);
    setSecondsLeftInRound(seconds);
    setExecutionPhase('PLANNING');
    setCompletedRoundCount(0);
    setCompletionMode(null);
    persistSnapshot({
      turnDurationSeconds: seconds,
      executionPhase: 'PLANNING',
      completedRoundCount: 0,
      completionMode: null,
      completedForTaskId: null,
    });
    speechNarrator.speak(`已设置每轮真实倒计时 ${seconds} 秒，到点就摇铃交接！`);
  };

  // 选择协商方案类型
  const handleSelectPlanStrategy = (strategy: PlanStrategyType) => {
    sounds.playClick();
    executionRunCompletedRef.current = false;
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
    setCompletedRoundCount(0);
    setCompletionMode(null);

    persistSnapshot({
      planStrategy: strategy,
      firstTurnActor: nextActor,
      waitingActivityId: nextWait,
      executionPhase: 'PLANNING',
      completedRoundCount: 0,
      completionMode: null,
      completedForTaskId: null,
    });
  };

  // 选择等待方的具体活动/替代道具
  const handleSelectWaitingActivity = (actId: WaitingActivityId) => {
    sounds.playClick();
    executionRunCompletedRef.current = false;
    setWaitingActivityId(actId);
    setExecutionPhase('PLANNING');
    setCompletedRoundCount(0);
    setCompletionMode(null);
    persistSnapshot({
      waitingActivityId: actId,
      executionPhase: 'PLANNING',
      completedRoundCount: 0,
      completionMode: null,
      completedForTaskId: null,
    });
  };

  // 点击开始执行方案：进入可观察实验阶段（P1-B：此时伙伴只记忆“你刚才安排了什么”，绝不提前宣告结果已发生）
  const handleExecutePlan = () => {
    sounds.playKalimbaBloom();
    executionRunCompletedRef.current = false;
    hadManualEarlyHandoffRef.current = false;

    const startZone: BoatPositionZone =
      firstTurnActor === 'rabbit'
        ? 'RABBIT_DOCK'
        : firstTurnActor === 'bear'
          ? 'BEAR_DOCK'
          : 'CENTER_POND';

    setActiveExecutionRound(1);
    setSecondsLeftInRound(turnDurationSeconds);
    setBoatPositionZone(startZone);
    setExecutionPhase('RUNNING');
    setCompletedRoundCount(0);
    setCompletionMode(null);

    persistSnapshot(
      {
        boatPositionZone: startZone,
        executionPhase: 'RUNNING',
        completedRoundCount: 0,
        completionMode: null,
        completedForTaskId: null,
      },
      'ARRANGED_OR_STARTED'
    );
    speechNarrator.speak(
      `开始执行你的协商方案！${evaluation.round1ActionText}。看一看水塘里的小船和两只小动物的动作吧！`
    );
  };

  // 手动提前摇铃交接（P0-A：明确标记为 MANUAL_EARLY_HANDOFF 主动提前交接，不得冒充完整等待）
  const handleAdvanceRoundOrComplete = () => {
    if (executionPhase !== 'RUNNING' || executionRunCompletedRef.current) return;
    sounds.playClick();
    hadManualEarlyHandoffRef.current = true;

    if (activeExecutionRound === 1) {
      const nextZone: BoatPositionZone =
        firstTurnActor === 'rabbit'
          ? 'BEAR_DOCK'
          : firstTurnActor === 'bear'
            ? 'RABBIT_DOCK'
            : 'CANAL_HARBOR';
      setActiveExecutionRound(2);
      setSecondsLeftInRound(turnDurationSeconds);
      setBoatPositionZone(nextZone);
      persistSnapshot(
        {
          boatPositionZone: nextZone,
          executionPhase: 'RUNNING',
          completedRoundCount: 1,
          completionMode: null,
          completedForTaskId: null,
        },
        'ARRANGED_OR_STARTED'
      );
      speechNarrator.speak(
        `主动提前摇铃交接！现在进入第 2 轮：${evaluation.round2ActionText}`
      );
      return;
    }

    finalizeCurrentExecution('MANUAL_BUTTON');
  };

  // 随时重新协商修改安排
  const handleRenegotiate = () => {
    sounds.playClick();
    executionRunCompletedRef.current = false;
    hadManualEarlyHandoffRef.current = false;
    setExecutionPhase('PLANNING');
    setActiveExecutionRound(1);
    setSecondsLeftInRound(turnDurationSeconds);
    setCompletedRoundCount(0);
    setCompletionMode(null);
    persistSnapshot({
      executionPhase: 'PLANNING',
      completedRoundCount: 0,
      completionMode: null,
      completedForTaskId: null,
    });
    speechNarrator.speak('我们停下来重新商量！你可以调整谁先玩、每轮几秒或者换成合作方案。');
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
      <span className={`inline-block text-[11px] font-black px-2 py-0.5 rounded-full border ${colorClass}`}>
        {text}
      </span>
    );
  };

  // 计算当前轮次谁正在开船、谁在岸上配合/等待（用于 RUNNING 阶段动态展示）
  const isRabbitOnBoatNow =
    firstTurnActor === 'both' ||
    (executionPhase === 'RUNNING' && activeExecutionRound === 1 && firstTurnActor === 'rabbit') ||
    (executionPhase === 'RUNNING' && activeExecutionRound === 2 && firstTurnActor === 'bear') ||
    (executionPhase !== 'RUNNING' && firstTurnActor === 'rabbit');

  const isBearOnBoatNow =
    firstTurnActor === 'both' ||
    (executionPhase === 'RUNNING' && activeExecutionRound === 1 && firstTurnActor === 'bear') ||
    (executionPhase === 'RUNNING' && activeExecutionRound === 2 && firstTurnActor === 'rabbit') ||
    (executionPhase !== 'RUNNING' && firstTurnActor === 'bear');

  const currentWaitActivityMeta =
    WAITING_ACTIVITY_OPTIONS.find((w) => w.id === waitingActivityId) || WAITING_ACTIVITY_OPTIONS[0];

  return (
    <div
      data-testid="toy-boat-negotiation-game"
      className="w-full min-w-0 max-w-4xl mx-auto bg-teal-50/40 rounded-3xl border-2 border-teal-200 shadow-xl overflow-hidden flex flex-col my-1"
    >
      {adultPreviewUnlocked && !isApproved && (
        <div className="bg-amber-500 text-white text-xs font-black px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 min-w-0">
          <span className="break-words">⚠️ 家长与审阅人预览模式 · 请在成年人陪伴下审阅</span>
          <span className="bg-amber-700 px-2 py-0.5 rounded-full text-[10px] shrink-0">大人陪伴审阅</span>
        </div>
      )}

      {/* 顶部紧凑标题栏 */}
      <div className="bg-linear-to-r from-teal-100 via-cyan-100 to-sky-100 px-3 sm:px-4 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-teal-200 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-200/90 flex items-center justify-center shrink-0 shadow-xs">
            <ToySailboatSvg className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm sm:text-xl font-black text-teal-950">
                玩具船协商 · 动手实验剧场
              </h2>
              <span
                data-testid="toy-boat-completed-count"
                className="text-[11px] bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-full font-black"
              >
                已完成 {completedTaskIds.length}/{TOY_BOAT_TASKS.length} 个协商任务
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExitGame}
          className="min-h-[40px] sm:min-h-[44px] px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-teal-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center shrink-0"
          aria-label="离开游戏"
        >
          离开小岛
        </button>
      </div>

      <div className="p-2.5 sm:p-4 space-y-3 min-w-0">
        {/* 两个不同冲突条件的任务切换栏 */}
        <div className="grid grid-cols-2 gap-2">
          {TOY_BOAT_TASKS.map((t) => {
            const isSelected = t.id === task.id;
            const isDone = completedTaskIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                data-testid={`boat-task-tab-${t.id}`}
                onClick={() => handleSelectTask(t.id)}
                className={`min-h-[52px] p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-w-0 ${
                  isSelected
                    ? 'bg-teal-100 border-teal-600 text-teal-950 shadow-xs ring-2 ring-teal-300'
                    : 'bg-white border-stone-200 hover:border-teal-300 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span className="text-xs font-black truncate">{t.badge}：{t.title}</span>
                  {isDone && (
                    <span
                      data-testid={`boat-task-done-badge-${t.id}`}
                      className="text-[10px] bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded-full font-black shrink-0"
                    >
                      已验证
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone-600 font-bold truncate mt-0.5">
                  {t.conflictFocus}
                </span>
              </button>
            );
          })}
        </div>

        {/* 1. 核心视觉中心：可移动玩具船水塘实验画布 + 角色动态表情 */}
        <div className="bg-linear-to-b from-sky-100 via-teal-100 to-amber-100/70 rounded-2xl border-2 border-teal-300 p-3 space-y-2.5 shadow-inner min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="text-xs font-black text-teal-950 bg-white/90 px-2.5 py-1 rounded-xl border border-teal-200">
              {task.resourceConstraintNote}
            </div>
            <div
              data-testid="boat-execution-status-badge"
              data-phase={executionPhase}
              className="text-xs font-black bg-amber-100 text-amber-950 border border-amber-400 px-2.5 py-1 rounded-xl"
            >
              {executionPhase === 'PLANNING'
                ? '🛠️ 阶段 1：布置协商计划'
                : executionPhase === 'RUNNING'
                  ? `⏱️ 阶段 2：正在执行第 ${activeExecutionRound}/2 轮（剩余 ${secondsLeftInRound} 秒）`
                  : '✅ 阶段 3：已观察实验结果'}
            </div>
          </div>

          {/* 动手移动玩具船的四个水域码头槽位 */}
          <div className="bg-sky-200/70 rounded-2xl border-2 border-sky-300 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-sky-950">
              <span>
                ⛵ 点选码头移船（当前：{BOAT_ZONE_META.find((z) => z.zone === boatPositionZone)?.label}）
              </span>
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
                    className={`min-h-[64px] p-2 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center min-w-0 ${
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
                        className="w-10 h-10"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full border-2 border-dashed border-sky-400 flex items-center justify-center text-[10px] font-black text-sky-700">
                        停船点
                      </div>
                    )}
                    <span className="text-[11px] font-black text-stone-900 mt-1 truncate max-w-full">
                      {z.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 执行阶段实时动态实验画面条（P1-A：执行阶段重点展示谁在玩、谁在等、时间流逝） */}
          {executionPhase === 'RUNNING' && (
            <div
              data-testid="running-experiment-live-stage"
              className="bg-teal-900 text-white rounded-2xl p-3 space-y-2 shadow-md"
            >
              <div className="flex items-center justify-between gap-2 text-xs font-black">
                <span>
                  🌊 第 {activeExecutionRound}/2 轮实验进行中：
                  {activeExecutionRound === 1
                    ? evaluation.round1ActionText
                    : evaluation.round2ActionText}
                </span>
                <span
                  data-testid="running-countdown-seconds"
                  className="bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full font-black shrink-0"
                >
                  倒数 {secondsLeftInRound} 秒
                </span>
              </div>
              <div className="w-full h-2.5 bg-teal-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{
                    width: `${Math.max(10, Math.round((secondsLeftInRound / turnDurationSeconds) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* 两个角色的实时需求状态与动作表情卡片 */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 小兔提莫 */}
            <div
              data-testid="rabbit-reaction-card"
              data-satisfaction={evaluation.rabbitSatisfaction}
              className="bg-white/95 rounded-2xl border-2 border-rose-200 p-2.5 flex flex-col sm:flex-row items-center sm:items-start gap-2 shadow-2xs min-w-0"
            >
              <div className="flex flex-col items-center shrink-0">
                <AnimalFriendSvg
                  type="rabbit"
                  satisfaction={evaluation.rabbitSatisfaction}
                  isActiveTurn={isRabbitOnBoatNow}
                  isUsingAltProp={waitingActivityId !== 'wait_empty_hands'}
                  className="w-12 h-12 sm:w-14 sm:h-14"
                />
                <span className="text-xs font-black text-stone-900 mt-0.5">小兔提莫</span>
              </div>
              <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                <div className="text-[10px] font-bold text-stone-500">{task.rabbitNeedLabel}</div>
                {renderSatisfactionBadge(
                  evaluation.rabbitSatisfaction,
                  evaluation.rabbitStatusLabel
                )}
                <p className="text-xs font-black text-stone-800 leading-snug">
                  {executionPhase === 'PLANNING'
                    ? isRabbitOnBoatNow
                      ? '准备第一轮先上船掌舵！'
                      : waitingActivityId === 'wait_empty_hands'
                        ? '如果让我空手干等太久，我会着急哦！'
                        : `准备先在岸上：${currentWaitActivityMeta.label}`
                    : evaluation.rabbitSpokenReaction}
                </p>
              </div>
            </div>

            {/* 小熊波波 */}
            <div
              data-testid="bear-reaction-card"
              data-satisfaction={evaluation.bearSatisfaction}
              className="bg-white/95 rounded-2xl border-2 border-amber-200 p-2.5 flex flex-col sm:flex-row items-center sm:items-start gap-2 shadow-2xs min-w-0"
            >
              <div className="flex flex-col items-center shrink-0">
                <AnimalFriendSvg
                  type="bear"
                  satisfaction={evaluation.bearSatisfaction}
                  isActiveTurn={isBearOnBoatNow}
                  isUsingAltProp={waitingActivityId !== 'wait_empty_hands'}
                  className="w-12 h-12 sm:w-14 sm:h-14"
                />
                <span className="text-xs font-black text-stone-900 mt-0.5">小熊波波</span>
              </div>
              <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                <div className="text-[10px] font-bold text-stone-500">{task.bearNeedLabel}</div>
                {renderSatisfactionBadge(evaluation.bearSatisfaction, evaluation.bearStatusLabel)}
                <p className="text-xs font-black text-stone-800 leading-snug">
                  {executionPhase === 'PLANNING'
                    ? isBearOnBoatNow
                      ? '准备第一轮先上船掌舵！'
                      : waitingActivityId === 'wait_empty_hands'
                        ? '如果让我空手干等太久，我也会坐不住哦！'
                        : `准备先在岸上：${currentWaitActivityMeta.label}`
                    : evaluation.bearSpokenReaction}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 紧凑协商操作台：核心 3 步 + 等待道具 + 主执行按钮 */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-3 sm:p-4 space-y-3 shadow-xs min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
            <h3 className="text-xs sm:text-sm font-black text-stone-900">
              🛠️ 制定你的协商计划（选好后点下方「开始执行」观察真实结果）：
            </h3>
            {executionPhase !== 'PLANNING' && (
              <button
                type="button"
                data-testid="renegotiate-plan-btn"
                onClick={handleRenegotiate}
                className="min-h-[40px] px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-black cursor-pointer"
              >
                🔄 重新协商 / 修改安排
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 操作维度 1：安排先后顺序 */}
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-2.5 space-y-1.5">
              <div className="text-xs font-black text-stone-800">1. 谁先上船：</div>
              <div className="grid grid-cols-3 sm:grid-cols-1 gap-1.5">
                {[
                  { id: 'rabbit' as FirstTurnActor, label: '🐰 小兔先' },
                  { id: 'bear' as FirstTurnActor, label: '🐻 小熊先' },
                  { id: 'both' as FirstTurnActor, label: '🤝 一起分工' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`order-actor-${opt.id}`}
                    onClick={() => handleSetFirstTurnActor(opt.id)}
                    className={`min-h-[42px] px-2.5 py-1.5 rounded-xl border text-xs font-black text-center sm:text-left cursor-pointer transition-all ${
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

            {/* 操作维度 2：设置简单、真实、可理解的轮流时长（3秒 vs 5秒） */}
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-2.5 space-y-1.5">
              <div className="text-xs font-black text-stone-800">2. 每轮真实秒数：</div>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5">
                {[
                  { sec: 3 as const, label: '⏱️ 每轮 3 秒', desc: '快节奏交接' },
                  { sec: 5 as const, label: '⏱️ 每轮 5 秒', desc: '慢节奏航行' },
                ].map((opt) => (
                  <button
                    key={opt.sec}
                    type="button"
                    data-testid={`duration-seconds-${opt.sec}`}
                    onClick={() => handleSetTurnDuration(opt.sec)}
                    className={`min-h-[44px] px-2.5 py-1.5 rounded-xl border text-left cursor-pointer transition-all ${
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
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-2.5 space-y-1.5">
              <div className="text-xs font-black text-stone-800">3. 协商方式：</div>
              <div className="grid grid-cols-1 gap-1.5">
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
                    className={`min-h-[42px] px-2.5 py-1.5 rounded-xl border text-xs font-black text-left cursor-pointer transition-all ${
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

          {/* 操作维度 4：等待或配合的一方做什么？ */}
          <div className="space-y-1.5 pt-1 min-w-0">
            <div className="text-xs font-black text-stone-800">
              4. 岸上伙伴做什么？（对比「空手干等」与「有替代道具」）：
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 min-w-0">
              {WAITING_ACTIVITY_OPTIONS.map((act) => {
                const isSelected = waitingActivityId === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    data-testid={`waiting-activity-${act.id}`}
                    onClick={() => handleSelectWaitingActivity(act.id)}
                    className={`min-h-[52px] min-w-0 p-2 rounded-xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
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
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5 border-t border-stone-100">
            {executionPhase === 'PLANNING' ? (
              <div
                data-testid="planning-expectation-hint"
                className="text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl"
              >
                💡 布置提示：计划已准备好！点右侧按钮让小木船真正开动，等两轮结束后才能揭晓完整观察结果哦。
              </div>
            ) : (
              <div className="text-xs font-bold text-stone-600">
                {executionPhase === 'RUNNING'
                  ? `实验进行中：等秒表自然走完两轮（每轮 ${turnDurationSeconds} 秒），或点提前摇铃交接`
                  : '实验已完成！看看下方刚刚观察到的真实双方感受吧'}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {executionPhase === 'RUNNING' && (
                <button
                  type="button"
                  data-testid="advance-negotiation-round-btn"
                  onClick={handleAdvanceRoundOrComplete}
                  className="min-h-[48px] px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm cursor-pointer shadow-sm"
                >
                  {activeExecutionRound === 1
                    ? '🔔 主动提前交接第 2 轮'
                    : '🔔 主动提前完成并看结果'}
                </button>
              )}

              <button
                type="button"
                data-testid="execute-negotiation-plan-btn"
                onClick={handleExecutePlan}
                className="min-h-[52px] px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm sm:text-base cursor-pointer shadow-md transition-colors"
              >
                {executionPhase === 'PLANNING'
                  ? '🚀 开始执行协商方案'
                  : '🔄 重新运行当前方案'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. P1-A：只有在真正完成执行进入结果阶段（OBSERVED_RESULT）后，才展示四维真实观察总结 */}
        {executionPhase === 'OBSERVED_RESULT' && (
          <div
            data-testid="negotiation-result-observation"
            className="bg-white rounded-2xl border-2 border-teal-400 p-3.5 sm:p-5 space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm sm:text-base font-black text-teal-950">
                🔍 实验结果观察报告（基于刚才两轮试航的真实表现）：
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  data-testid="negotiation-observed-complete-badge"
                  data-completion-mode={completionMode || 'FULL_WAIT_TIMER'}
                  className="text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-400 px-2.5 py-0.5 rounded-full"
                >
                  {completionMode === 'MANUAL_EARLY_HANDOFF'
                    ? '✨ 已完成两轮试航（主动提前交接完成）'
                    : `✨ 已完成两轮试航（完整等待两轮倒计时结束 · ${turnDurationSeconds}秒×2轮）`}
                </span>
                <span
                  data-testid="negotiation-completion-mode-badge"
                  data-completion-mode={completionMode || 'FULL_WAIT_TIMER'}
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                    completionMode === 'MANUAL_EARLY_HANDOFF'
                      ? 'bg-amber-100 text-amber-950 border-amber-400'
                      : 'bg-sky-100 text-sky-950 border-sky-400'
                  }`}
                >
                  {completionMode === 'MANUAL_EARLY_HANDOFF'
                    ? '🔔 主动提前交接完成'
                    : `⏱️ 完整等待 ${turnDurationSeconds}秒×2轮 自然交接`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                <span className="font-black text-sky-950">① 谁先玩：</span>
                <span className="text-stone-800 font-bold">{evaluation.whoPlaysFirstLabel}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="font-black text-amber-950">② 谁在等：</span>
                <span className="text-stone-800 font-bold">{evaluation.whoWaitsLabel}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200">
                <span className="font-black text-teal-950">③ 是否需要配合：</span>
                <span className="text-stone-800 font-bold">{evaluation.requiresCooperationLabel}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-black text-emerald-950">④ 双方是否满意：</span>
                <span className="text-stone-800 font-bold">{evaluation.overallSatisfactionSummary}</span>
              </div>
            </div>

            <div
              data-testid="execution-outcome-narrative"
              className="p-3 rounded-xl bg-emerald-100/80 border border-emerald-300 text-xs sm:text-sm font-black text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <span>{evaluation.executionOutcomeNarrative}</span>
              <button
                type="button"
                onClick={handleRenegotiate}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-400 text-xs font-black shrink-0 cursor-pointer"
              >
                换一种分配方案再试
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
