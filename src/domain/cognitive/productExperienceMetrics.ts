// 晴雨小岛 · 核心认知体验与成长进展本地度量引擎 (100% 端侧存储，零云端上传)
// Sprint 1.1 真实行为保真升级：
// 1. 严格区分 CHILD_SESSION（真实儿童会话）与 PLAYTEST（内部研发连续试玩）命名空间，杜绝试玩污染家长端；
// 2. 侦探案件显式状态机（NOT_STARTED / EXPLORING / REFLECTING / ACTION_SELECTED / COMPLETED / ENDED_EARLY）；
// 3. 迁移实验显式状态机（NOT_STARTED / ATTEMPTED / REFERENCE_VIEWED / COMPLETED_INDEPENDENT / COMPLETED_WITH_PROMPT / ENDED_EARLY）；
// 4. 消除单次地图进入重复计数、相同判断重复点击刷修正数、重复点击“不知道”刷计数、固定/默认虚构步数等失真问题。

import { isInternalPlaytestEnabled } from '../privacy/parentAccess';

export type MetricsSessionScope = 'CHILD_SESSION' | 'PLAYTEST';

export type DetectiveCaseStatus =
  | 'NOT_STARTED'
  | 'EXPLORING'
  | 'REFLECTING'
  | 'ACTION_SELECTED'
  | 'COMPLETED'
  | 'COMPLETED_AFTER_REFERENCE'
  | 'ENDED_EARLY';

export type TransferTaskStatus =
  | 'NOT_STARTED'
  | 'ATTEMPTED'
  | 'REFERENCE_VIEWED'
  | 'COMPLETED_INDEPENDENT'
  | 'COMPLETED_WITH_PROMPT'
  | 'ENDED_EARLY';

export type FriendHomeFramingMode = 'STORY_CHILD' | 'OWN_EXPRESSION';

export type FriendHomeOutcomeStatus =
  | 'EXPRESSIVE_ACTION_ATTEMPTED'
  | 'PAUSED_VOLUNTARILY'
  | 'SCENARIO_COMPLETED';

export interface FriendHomeScenarioProgressSnapshot {
  scenarioId: string;
  currentNodeId: string;
  historyNodeIds: string[];
  chosenExpressionModes: string[];
  chosenChoiceLabels: string[];
  endedEarlyVoluntarily: boolean;
  isCompleted: boolean;
  outcomeStatus?: FriendHomeOutcomeStatus;
  composerState?: {
    shareAmount: 'NONE' | 'LITTLE' | 'OPEN';
    toneStyle: 'WARM' | 'CALM_FIRM' | 'ASK_BACK';
    topicFocus: 'WHO_PICKS_UP' | 'SHIFT_TO_PLAY' | 'PRIVATE_MATTER' | 'PAUSE_NOW';
  };
}

export interface FriendHomeSessionSnapshot {
  activeScenarioId: string;
  framingMode?: FriendHomeFramingMode;
  currentNodeId: string;
  historyNodeIds: string[];
  chosenExpressionModes: string[];
  chosenChoiceLabels: string[];
  endedEarlyVoluntarily?: boolean;
  isCompleted: boolean;
  /** Sprint 3 A3: 明确区分 EXPRESSIVE_ACTION_ATTEMPTED / PAUSED_VOLUNTARILY / SCENARIO_COMPLETED */
  outcomeStatus?: FriendHomeOutcomeStatus;
  /** P1-D: 每个社交情境独立保存自己的当前轮次、历史路径和暂停状态 */
  scenarioStatesById?: Record<string, FriendHomeScenarioProgressSnapshot>;
}

export type ToyBoatCompletionMode = 'FULL_WAIT_TIMER' | 'MANUAL_EARLY_HANDOFF';

export interface ToyBoatTaskProgressSnapshot {
  taskId: string;
  firstTurnActor: 'rabbit' | 'bear' | 'both';
  turnDurationSeconds: number;
  planStrategy: 'TURN_WAIT' | 'COOPERATE_ROLES' | 'EXCHANGE_ALT';
  waitingActivityId: string;
  boatPositionZone: 'RABBIT_DOCK' | 'CENTER_POND' | 'BEAR_DOCK' | 'CANAL_HARBOR';
  executionPhase: 'PLANNING' | 'RUNNING' | 'OBSERVED_RESULT';
  completedRoundCount: number;
  completionMode?: ToyBoatCompletionMode | null;
}

export interface ToyBoatSessionSnapshot {
  activeTaskId: string;
  firstTurnActor: 'rabbit' | 'bear' | 'both';
  turnDurationSeconds: number;
  planStrategy: 'TURN_WAIT' | 'COOPERATE_ROLES' | 'EXCHANGE_ALT';
  waitingActivityId: string;
  boatPositionZone: 'RABBIT_DOCK' | 'CENTER_POND' | 'BEAR_DOCK' | 'CANAL_HARBOR';
  executionPhase: 'PLANNING' | 'RUNNING' | 'OBSERVED_RESULT';
  completedRoundCount: number;
  /** P0-A: 区分真实等待两轮倒计时完成 vs 手动提前摇铃交接完成 */
  completionMode?: ToyBoatCompletionMode | null;
  /** P0-B: 明确标识本次完成归属的任务 ID，严禁切换任务时把旧任务完成数带入新任务 */
  completedForTaskId?: string | null;
  /** P0-B: 按任务 ID 独立保存的执行状态映射 */
  taskStatesById?: Record<string, ToyBoatTaskProgressSnapshot>;
}

export interface CompanionSessionMemory {
  gameId: 'friend_asks_home' | 'toy_boat' | 'crayon_detective' | 'story_grove';
  scenarioTitle: string;
  /** P1-B: 区分“已安排/正在进行但尚未观察结果”与“已完成并观察结果” */
  eventStage?: 'ARRANGED_OR_STARTED' | 'COMPLETED_OBSERVED';
  childChoiceSummary: string;
  companionReactionText: string;
  updatedAt: string;
}

export interface StoryGroveLeafSessionSnapshot {
  leafId: string;
  inspectedObjectIds: string[];
  chosenActionId: string | null;
  actionAttemptHistory: string[];
  revisionCount: number;
  isCompleted: boolean;
  updatedAt: string;
}

export interface StoryGroveTransferAttemptRecord {
  scenarioId: string;
  inspectedObjectIds: string[];
  chosenActions: string[];
  revisedAfterConsequence: boolean;
  isCompleted: boolean;
  completedAt: string;
}

export interface ProductExperienceMetrics {
  sessionScope: MetricsSessionScope;
  completedDetectiveCaseIds: string[];
  independentDetectiveCaseIds: string[];
  assistedDetectiveCaseIds: string[];
  earlyPeekedDetectiveCaseIds: string[];
  detectiveCaseStates: Record<string, DetectiveCaseStatus>;
  totalCluesClassified: number;
  firstTryCorrectClassifications: number;
  hypothesisRevisionCount: number;
  unknownHonestyCount: number;
  independentTransferCount: number;
  promptedTransferCount: number;
  completedTransferScenarioIds: string[];
  transferScenarioStates: Record<string, TransferTaskStatus>;
  visitedLandmarks: string[];
  /** Section 8.3: 首次进入任务前实际经历的操作步数（未进入任何任务前为 null，绝不使用固定假值） */
  firstEntryStepCount: number | null;
  /** Section 8.3: 最近一次真实完成任务的实际操作次数（未完成任务前为 null，绝不使用默认假值 6） */
  lastTaskOperationCount: number | null;
  /** Section 8.3: 主动探索行为次数（去重后的真实探索动作） */
  activeExplorationCount: number;
  /** Section 8.3: 提示调用总次数 */
  totalPromptCalls: number;
  /** Section 8.3: 主动退出/提前结束节点记录 */
  voluntaryExitNodes: string[];
  /** Section 8.3: 不同任务的真实参与次数 */
  taskParticipationCounts: Record<string, number>;
  /** Sprint 2 / 3 A3: 《朋友问起我的家》完整体验完成的多轮情境 ID（不含仅主动暂停） */
  completedFriendHomeScenarioIds: string[];
  /** Sprint 3 A3: 《朋友问起我的家》主动暂停保护边界的情境 ID */
  pausedFriendHomeScenarioIds: string[];
  /** Sprint 3 A3: 《朋友问起我的家》各情境详细状态（EXPRESSIVE_ACTION_ATTEMPTED / PAUSED_VOLUNTARILY / SCENARIO_COMPLETED） */
  friendHomeScenarioStatuses: Record<string, FriendHomeOutcomeStatus>;
  /** Sprint 2: 《玩具船协商》已执行观察完成的任务 ID */
  completedToyBoatTaskIds: string[];
  /** Sprint 2.1 P0-A: 《玩具船协商》各任务完成方式记录（完整等待 FULL_WAIT_TIMER vs 手动提前交接 MANUAL_EARLY_HANDOFF） */
  toyBoatTaskCompletionModes: Record<string, ToyBoatCompletionMode>;
  /** Sprint 2: 《朋友问起我的家》退出再进入时的任务恢复快照 */
  friendHomeSessionState: FriendHomeSessionSnapshot | null;
  /** Sprint 2: 《玩具船协商》退出再进入时的任务恢复快照 */
  toyBoatSessionState: ToyBoatSessionSnapshot | null;
  /** Sprint 3 Stage B: 故事林互动童话叶已完成 ID */
  completedStoryLeafIds: string[];
  /** Sprint 3 Stage B: 故事林互动童话叶状态快照 */
  storyLeafStatesById: Record<string, StoryGroveLeafSessionSnapshot>;
  /** Sprint 3 Stage C: 故事林跨方法自主迁移记录 */
  storyGroveTransferAttempts: StoryGroveTransferAttemptRecord[];
  /** Sprint 2: 动物伙伴对孩子当前会话具体选择的温暖记忆 */
  latestCompanionMemory: CompanionSessionMemory | null;
  lastUpdatedAt: string | null;
}

const STORAGE_KEY_CHILD = 'qingyu_experience_metrics_v1';
const STORAGE_KEY_PLAYTEST = 'qingyu_experience_metrics_playtest_v1';

function createDefaultMetrics(scope: MetricsSessionScope = 'CHILD_SESSION'): ProductExperienceMetrics {
  return {
    sessionScope: scope,
    completedDetectiveCaseIds: [],
    independentDetectiveCaseIds: [],
    assistedDetectiveCaseIds: [],
    earlyPeekedDetectiveCaseIds: [],
    detectiveCaseStates: {},
    totalCluesClassified: 0,
    firstTryCorrectClassifications: 0,
    hypothesisRevisionCount: 0,
    unknownHonestyCount: 0,
    independentTransferCount: 0,
    promptedTransferCount: 0,
    completedTransferScenarioIds: [],
    transferScenarioStates: {},
    visitedLandmarks: [],
    firstEntryStepCount: null,
    lastTaskOperationCount: null,
    activeExplorationCount: 0,
    totalPromptCalls: 0,
    voluntaryExitNodes: [],
    taskParticipationCounts: {},
    completedFriendHomeScenarioIds: [],
    pausedFriendHomeScenarioIds: [],
    friendHomeScenarioStatuses: {},
    completedToyBoatTaskIds: [],
    toyBoatTaskCompletionModes: {},
    friendHomeSessionState: null,
    toyBoatSessionState: null,
    completedStoryLeafIds: [],
    storyLeafStatesById: {},
    storyGroveTransferAttempts: [],
    latestCompanionMemory: null,
    lastUpdatedAt: null,
  };
}

type MetricsListener = (metrics: ProductExperienceMetrics) => void;
const listeners = new Set<MetricsListener>();

// 会话级防刷与真实步骤追踪状态
let preFirstEntryActionCounter = 0;
let lastVisitedLandmarkKey: string | null = null;
let lastVisitedLandmarkTimestamp = 0;
const rewardedUnknownContextKeys = new Set<string>();
const recordedRevisionTransitionKeys = new Set<string>();
const activeSessionParticipationKeys = new Set<string>();

export function getActiveMetricsScope(): MetricsSessionScope {
  return isInternalPlaytestEnabled() ? 'PLAYTEST' : 'CHILD_SESSION';
}

function getStorageKeyForScope(scope: MetricsSessionScope): string {
  return scope === 'PLAYTEST' ? STORAGE_KEY_PLAYTEST : STORAGE_KEY_CHILD;
}

function notifyListeners(metrics: ProductExperienceMetrics): void {
  listeners.forEach((listener) => {
    try {
      listener(metrics);
    } catch {
      // ignore listener errors
    }
  });
}

export function hasRecordedExperienceMetrics(metrics: ProductExperienceMetrics): boolean {
  return Boolean(
    metrics.lastUpdatedAt !== null ||
      metrics.completedDetectiveCaseIds.length > 0 ||
      metrics.independentDetectiveCaseIds.length > 0 ||
      metrics.assistedDetectiveCaseIds.length > 0 ||
      metrics.totalCluesClassified > 0 ||
      metrics.hypothesisRevisionCount > 0 ||
      metrics.unknownHonestyCount > 0 ||
      metrics.completedTransferScenarioIds.length > 0 ||
      metrics.activeExplorationCount > 0 ||
      metrics.totalPromptCalls > 0 ||
      metrics.voluntaryExitNodes.length > 0
  );
}

export function getProductExperienceMetrics(explicitScope?: MetricsSessionScope): ProductExperienceMetrics {
  const scope = explicitScope ?? getActiveMetricsScope();
  if (typeof window === 'undefined' || !window.localStorage) {
    return createDefaultMetrics(scope);
  }
  try {
    const raw = window.localStorage.getItem(getStorageKeyForScope(scope));
    if (!raw) return createDefaultMetrics(scope);
    const parsed = JSON.parse(raw) as Partial<ProductExperienceMetrics>;
    return {
      sessionScope: scope,
      completedDetectiveCaseIds: Array.isArray(parsed.completedDetectiveCaseIds)
        ? parsed.completedDetectiveCaseIds
        : [],
      independentDetectiveCaseIds: Array.isArray(parsed.independentDetectiveCaseIds)
        ? parsed.independentDetectiveCaseIds
        : [],
      assistedDetectiveCaseIds: Array.isArray(parsed.assistedDetectiveCaseIds)
        ? parsed.assistedDetectiveCaseIds
        : [],
      earlyPeekedDetectiveCaseIds: Array.isArray(parsed.earlyPeekedDetectiveCaseIds)
        ? parsed.earlyPeekedDetectiveCaseIds
        : [],
      detectiveCaseStates:
        parsed.detectiveCaseStates && typeof parsed.detectiveCaseStates === 'object'
          ? parsed.detectiveCaseStates
          : {},
      totalCluesClassified:
        typeof parsed.totalCluesClassified === 'number' ? parsed.totalCluesClassified : 0,
      firstTryCorrectClassifications:
        typeof parsed.firstTryCorrectClassifications === 'number'
          ? parsed.firstTryCorrectClassifications
          : 0,
      hypothesisRevisionCount:
        typeof parsed.hypothesisRevisionCount === 'number' ? parsed.hypothesisRevisionCount : 0,
      unknownHonestyCount:
        typeof parsed.unknownHonestyCount === 'number' ? parsed.unknownHonestyCount : 0,
      independentTransferCount:
        typeof parsed.independentTransferCount === 'number' ? parsed.independentTransferCount : 0,
      promptedTransferCount:
        typeof parsed.promptedTransferCount === 'number' ? parsed.promptedTransferCount : 0,
      completedTransferScenarioIds: Array.isArray(parsed.completedTransferScenarioIds)
        ? parsed.completedTransferScenarioIds
        : [],
      transferScenarioStates:
        parsed.transferScenarioStates && typeof parsed.transferScenarioStates === 'object'
          ? parsed.transferScenarioStates
          : {},
      visitedLandmarks: Array.isArray(parsed.visitedLandmarks) ? parsed.visitedLandmarks : [],
      firstEntryStepCount:
        typeof parsed.firstEntryStepCount === 'number' ? parsed.firstEntryStepCount : null,
      lastTaskOperationCount:
        typeof parsed.lastTaskOperationCount === 'number' ? parsed.lastTaskOperationCount : null,
      activeExplorationCount:
        typeof parsed.activeExplorationCount === 'number' ? parsed.activeExplorationCount : 0,
      totalPromptCalls:
        typeof parsed.totalPromptCalls === 'number' ? parsed.totalPromptCalls : 0,
      voluntaryExitNodes: Array.isArray(parsed.voluntaryExitNodes) ? parsed.voluntaryExitNodes : [],
      taskParticipationCounts:
        parsed.taskParticipationCounts && typeof parsed.taskParticipationCounts === 'object'
          ? parsed.taskParticipationCounts
          : {},
      completedFriendHomeScenarioIds: Array.isArray(parsed.completedFriendHomeScenarioIds)
        ? parsed.completedFriendHomeScenarioIds
        : [],
      pausedFriendHomeScenarioIds: Array.isArray(parsed.pausedFriendHomeScenarioIds)
        ? parsed.pausedFriendHomeScenarioIds
        : [],
      friendHomeScenarioStatuses:
        parsed.friendHomeScenarioStatuses && typeof parsed.friendHomeScenarioStatuses === 'object'
          ? parsed.friendHomeScenarioStatuses
          : {},
      completedToyBoatTaskIds: Array.isArray(parsed.completedToyBoatTaskIds)
        ? parsed.completedToyBoatTaskIds
        : [],
      toyBoatTaskCompletionModes:
        parsed.toyBoatTaskCompletionModes && typeof parsed.toyBoatTaskCompletionModes === 'object'
          ? parsed.toyBoatTaskCompletionModes
          : {},
      friendHomeSessionState:
        parsed.friendHomeSessionState && typeof parsed.friendHomeSessionState === 'object'
          ? parsed.friendHomeSessionState
          : null,
      toyBoatSessionState:
        parsed.toyBoatSessionState && typeof parsed.toyBoatSessionState === 'object'
          ? parsed.toyBoatSessionState
          : null,
      completedStoryLeafIds: Array.isArray(parsed.completedStoryLeafIds)
        ? parsed.completedStoryLeafIds
        : [],
      storyLeafStatesById:
        parsed.storyLeafStatesById && typeof parsed.storyLeafStatesById === 'object'
          ? parsed.storyLeafStatesById
          : {},
      storyGroveTransferAttempts: Array.isArray(parsed.storyGroveTransferAttempts)
        ? parsed.storyGroveTransferAttempts
        : [],
      latestCompanionMemory:
        parsed.latestCompanionMemory && typeof parsed.latestCompanionMemory === 'object'
          ? parsed.latestCompanionMemory
          : null,
      lastUpdatedAt: typeof parsed.lastUpdatedAt === 'string' ? parsed.lastUpdatedAt : null,
    };
  } catch {
    return createDefaultMetrics(scope);
  }
}

export function getChildSessionExperienceMetrics(): ProductExperienceMetrics {
  return getProductExperienceMetrics('CHILD_SESSION');
}

export function getPlaytestExperienceMetrics(): ProductExperienceMetrics {
  return getProductExperienceMetrics('PLAYTEST');
}

function saveProductExperienceMetrics(
  next: ProductExperienceMetrics,
  explicitScope?: MetricsSessionScope
): ProductExperienceMetrics {
  const scope = explicitScope ?? next.sessionScope ?? getActiveMetricsScope();
  const updated: ProductExperienceMetrics = {
    ...next,
    sessionScope: scope,
    lastUpdatedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(getStorageKeyForScope(scope), JSON.stringify(updated));
    } catch {
      // ignore quota errors
    }
  }
  notifyListeners(updated);
  return updated;
}

export function subscribeProductExperienceMetrics(listener: MetricsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * 记录进入首个任务前的引导/微探索步数，用于计算真实的 firstEntryStepCount
 */
export function recordPreEntryStep(): void {
  preFirstEntryActionCounter += 1;
}

/**
 * 当从某个地点弹窗返回小岛时重置当前激活地点标记，允许下次重新进入再次计数
 */
export function clearActiveLandmarkSession(): void {
  lastVisitedLandmarkKey = null;
  lastVisitedLandmarkTimestamp = 0;
}

/**
 * 记录地图/卡片地点访问（防单次点击双重触发与同地点重复叠加）
 */
export function recordLandmarkVisit(
  landmarkId: string,
  explicitStepsBeforeEntry?: number
): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);
  const now = Date.now();
  const scopedLandmarkKey = `${scope}:${landmarkId}`;

  // 防止同一入口单次点击在 Map 与 IslandHome 中被重复调用，或在同一地点未退出前重复刷次数
  if (
    lastVisitedLandmarkKey === scopedLandmarkKey &&
    now - lastVisitedLandmarkTimestamp < 1500
  ) {
    return current;
  }
  lastVisitedLandmarkKey = scopedLandmarkKey;
  lastVisitedLandmarkTimestamp = now;

  const nextLandmarks = current.visitedLandmarks.includes(landmarkId)
    ? current.visitedLandmarks
    : [...current.visitedLandmarks, landmarkId];

  const measuredFirstStep =
    current.firstEntryStepCount !== null
      ? current.firstEntryStepCount
      : typeof explicitStepsBeforeEntry === 'number' && explicitStepsBeforeEntry > 0
        ? explicitStepsBeforeEntry
        : preFirstEntryActionCounter > 0
          ? preFirstEntryActionCounter + 1
          : 1;

  return saveProductExperienceMetrics(
    {
      ...current,
      visitedLandmarks: nextLandmarks,
      firstEntryStepCount: measuredFirstStep,
      activeExplorationCount: current.activeExplorationCount + 1,
    },
    scope
  );
}

export function recordActiveExploration(taskKey?: string): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);
  const nextParticipation = { ...current.taskParticipationCounts };
  if (taskKey) {
    const sessionKey = `${scope}:${taskKey}`;
    if (!activeSessionParticipationKeys.has(sessionKey)) {
      activeSessionParticipationKeys.add(sessionKey);
      nextParticipation[taskKey] = (nextParticipation[taskKey] || 0) + 1;
    }
  }
  return saveProductExperienceMetrics(
    {
      ...current,
      activeExplorationCount: current.activeExplorationCount + 1,
      taskParticipationCounts: nextParticipation,
    },
    scope
  );
}

export function recordVoluntaryExitNode(nodeLabel: string): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);
  const nextExits = [...current.voluntaryExitNodes.slice(-9), nodeLabel];
  return saveProductExperienceMetrics(
    {
      ...current,
      voluntaryExitNodes: nextExits,
    },
    scope
  );
}

export function recordDetectiveCaseState(
  caseId: string,
  status: DetectiveCaseStatus
): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);
  const isEarlyPeek =
    status === 'ENDED_EARLY' && !current.completedDetectiveCaseIds.includes(caseId);
  const nextEarlyPeeked =
    isEarlyPeek && !current.earlyPeekedDetectiveCaseIds.includes(caseId)
      ? [...current.earlyPeekedDetectiveCaseIds, caseId]
      : current.earlyPeekedDetectiveCaseIds;

  // S2-FIX01: 一次实际开始的游戏会话只记录一次参与
  const nextParticipation = { ...current.taskParticipationCounts };
  let participationChanged = false;
  if (status === 'EXPLORING' || status === 'REFLECTING' || status === 'ACTION_SELECTED') {
    const sessionKey = `${scope}:${caseId}`;
    if (!activeSessionParticipationKeys.has(sessionKey)) {
      activeSessionParticipationKeys.add(sessionKey);
      nextParticipation[caseId] = (nextParticipation[caseId] || 0) + 1;
      participationChanged = true;
    }
  }

  if (
    current.detectiveCaseStates[caseId] === status &&
    nextEarlyPeeked.length === current.earlyPeekedDetectiveCaseIds.length &&
    !participationChanged
  ) {
    return current;
  }
  return saveProductExperienceMetrics(
    {
      ...current,
      earlyPeekedDetectiveCaseIds: nextEarlyPeeked,
      detectiveCaseStates: {
        ...current.detectiveCaseStates,
        [caseId]: status,
      },
      taskParticipationCounts: nextParticipation,
    },
    scope
  );
}

export function recordClueClassificationAttempt(isCorrectFirstTry: boolean): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);
  return saveProductExperienceMetrics(
    {
      ...current,
      totalCluesClassified: current.totalCluesClassified + 1,
      firstTryCorrectClassifications:
        current.firstTryCorrectClassifications + (isCorrectFirstTry ? 1 : 0),
      activeExplorationCount: current.activeExplorationCount + 1,
    },
    scope
  );
}

/**
 * 重置指定案件的“不知道”、“修正”与“单次会话参与”去重锁（在点击“重新开始/重玩”或切换案件时调用，允许重玩记录新的真实会话）
 */
export function resetCaseSessionDeduplication(caseId?: string): void {
  if (!caseId) {
    rewardedUnknownContextKeys.clear();
    recordedRevisionTransitionKeys.clear();
    activeSessionParticipationKeys.clear();
    return;
  }
  for (const key of Array.from(rewardedUnknownContextKeys)) {
    if (key.includes(caseId)) {
      rewardedUnknownContextKeys.delete(key);
    }
  }
  for (const key of Array.from(recordedRevisionTransitionKeys)) {
    if (key.includes(caseId)) {
      recordedRevisionTransitionKeys.delete(key);
    }
  }
  for (const key of Array.from(activeSessionParticipationKeys)) {
    if (key.endsWith(`:${caseId}`) || key.includes(caseId)) {
      activeSessionParticipationKeys.delete(key);
    }
  }
}

/**
 * 记录诚实选择“我还不知道”：同一案件回合内多次重复点击只计一次
 */
export function recordUnknownHonestyChoice(caseOrContextId: string = 'default_case'): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);
  const dedupKey = `${scope}:${caseOrContextId}`;
  if (rewardedUnknownContextKeys.has(dedupKey)) {
    return current;
  }
  rewardedUnknownContextKeys.add(dedupKey);
  return saveProductExperienceMetrics(
    {
      ...current,
      unknownHonestyCount: current.unknownHonestyCount + 1,
    },
    scope
  );
}

export interface HypothesisRevisionVerification {
  caseId: string;
  previousHypothesisId: string | null;
  nextHypothesisId: string;
  discoveredClueCount: number;
}

/**
 * 记录发现新证据后的假设修正：
 * 只有当存在前序判断、判断确实发生改变（previous !== next）、且已发现至少 1 条新线索、且非重复点击同一判断时才增加计数。
 */
export function recordHypothesisRevision(
  verification?: HypothesisRevisionVerification
): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);

  if (verification) {
    const { caseId, previousHypothesisId, nextHypothesisId, discoveredClueCount } = verification;
    if (!previousHypothesisId || previousHypothesisId === nextHypothesisId) {
      return current;
    }
    if (discoveredClueCount <= 0) {
      return current;
    }
    const transitionKey = `${scope}:${caseId}:${previousHypothesisId}->${nextHypothesisId}`;
    if (recordedRevisionTransitionKeys.has(transitionKey)) {
      return current;
    }
    recordedRevisionTransitionKeys.add(transitionKey);
  }

  return saveProductExperienceMetrics(
    {
      ...current,
      hypothesisRevisionCount: current.hypothesisRevisionCount + 1,
    },
    scope
  );
}

export interface DetectiveCompletionVerification {
  status?: DetectiveCaseStatus;
  discoveredClueCount: number;
  hasKeyEvidence: boolean;
  hasAttemptedSorting: boolean;
  hasCheckedHypothesisWithEvidence: boolean;
  hasProportionateAction: boolean;
  hasViewedReferenceBeforeCompletion?: boolean;
  hasReflectedOrSorted?: boolean;
  hasSelectedHypothesis?: boolean;
  hasSelectedAction?: boolean;
}

/**
 * S2-FIX01 记录侦探案件完成：
 * 1. 必须要求完整且明确的验证条件（discoveredClueCount >= 2 且 hasKeyEvidence / hasAttemptedSorting / hasCheckedHypothesisWithEvidence / hasProportionateAction 均显式为 true），绝不接受缺省字段被默认为通过；
 * 2. 一次实际开始的游戏会话只记录一次参与，已完成案件重新检查状态不增加新会话次数；
 * 3. 完成案例数量（completedDetectiveCaseIds）与参与会话次数（taskParticipationCounts）分别统计。
 */
export function recordDetectiveCaseCompletion(
  caseId: string,
  operationCountOrVerification?: number | Partial<DetectiveCompletionVerification>,
  explicitVerification?: Partial<DetectiveCompletionVerification>
): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);

  const operationCount =
    typeof operationCountOrVerification === 'number' ? operationCountOrVerification : undefined;
  const verification =
    typeof operationCountOrVerification === 'object' && operationCountOrVerification !== null
      ? operationCountOrVerification
      : explicitVerification;

  const hasExplicitCompleteVerification = Boolean(
    verification &&
      typeof verification.discoveredClueCount === 'number' &&
      verification.discoveredClueCount >= 2 &&
      verification.hasKeyEvidence === true &&
      verification.hasAttemptedSorting === true &&
      verification.hasCheckedHypothesisWithEvidence === true &&
      verification.hasProportionateAction === true
  );

  if (!hasExplicitCompleteVerification) {
    const discoveredCount =
      typeof verification?.discoveredClueCount === 'number' ? verification.discoveredClueCount : 0;
    const fallbackStatus: DetectiveCaseStatus =
      current.detectiveCaseStates[caseId] === 'COMPLETED' ||
      current.detectiveCaseStates[caseId] === 'COMPLETED_AFTER_REFERENCE'
        ? current.detectiveCaseStates[caseId]
        : discoveredCount === 0
          ? 'ENDED_EARLY'
          : 'EXPLORING';

    return saveProductExperienceMetrics(
      {
        ...current,
        detectiveCaseStates: {
          ...current.detectiveCaseStates,
          [caseId]: fallbackStatus,
        },
      },
      scope
    );
  }

  const wasEarlyReferenceViewed = Boolean(
    verification?.hasViewedReferenceBeforeCompletion ||
      verification?.status === 'COMPLETED_AFTER_REFERENCE' ||
      current.earlyPeekedDetectiveCaseIds.includes(caseId) ||
      current.detectiveCaseStates[caseId] === 'ENDED_EARLY'
  );

  const finalStatus: DetectiveCaseStatus = wasEarlyReferenceViewed
    ? 'COMPLETED_AFTER_REFERENCE'
    : 'COMPLETED';

  const nextCases = current.completedDetectiveCaseIds.includes(caseId)
    ? current.completedDetectiveCaseIds
    : [...current.completedDetectiveCaseIds, caseId];

  const nextIndependentCases =
    !wasEarlyReferenceViewed && !current.independentDetectiveCaseIds.includes(caseId)
      ? [...current.independentDetectiveCaseIds, caseId]
      : current.independentDetectiveCaseIds;

  const nextAssistedCases =
    wasEarlyReferenceViewed && !current.assistedDetectiveCaseIds.includes(caseId)
      ? [...current.assistedDetectiveCaseIds, caseId]
      : current.assistedDetectiveCaseIds;

  const nextLandmarks = current.visitedLandmarks.includes('detective')
    ? current.visitedLandmarks
    : [...current.visitedLandmarks, 'detective'];

  // S2-FIX01: 同一会话仅记录一次参与；已完成案件重复检查完成状态不增加新会话次数
  const sessionKey = `${scope}:${caseId}`;
  const nextParticipation = { ...current.taskParticipationCounts };
  if (!activeSessionParticipationKeys.has(sessionKey)) {
    activeSessionParticipationKeys.add(sessionKey);
    nextParticipation[caseId] = (nextParticipation[caseId] || 0) + 1;
  }

  return saveProductExperienceMetrics(
    {
      ...current,
      completedDetectiveCaseIds: nextCases,
      independentDetectiveCaseIds: nextIndependentCases,
      assistedDetectiveCaseIds: nextAssistedCases,
      detectiveCaseStates: {
        ...current.detectiveCaseStates,
        [caseId]: finalStatus,
      },
      visitedLandmarks: nextLandmarks,
      lastTaskOperationCount:
        typeof operationCount === 'number' && operationCount > 0
          ? operationCount
          : current.lastTaskOperationCount,
      taskParticipationCounts: nextParticipation,
    },
    scope
  );
}

export interface TransferCompletionVerification {
  status?: TransferTaskStatus;
  selectedOptionCount: number;
  isGoalMet?: boolean;
  hadPriorReferenceOrErrorExplanation?: boolean;
  hasSelectedConclusion?: boolean;
  isReferenceOnly?: boolean;
  isEndedEarly?: boolean;
}

/**
 * 记录迁移实验室情境完成：
 * 1. 严禁零选择点击“看一看客观结果”记为独立完成（仅记为 REFERENCE_VIEWED）；
 * 2. 未满足任务核心认知目标（如饼干盒只勾一条普通事实）仅记为 ATTEMPTED；
 * 3. 若提前查看过参考答案或提交错误后看过解释，后续完成一律记为 COMPLETED_WITH_PROMPT，不得记为独立迁移完成。
 */
export function recordTransferScenarioCompletion(
  scenarioId: string,
  adultPromptCount: number,
  verification?: TransferCompletionVerification
): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);

  if (verification?.isEndedEarly || verification?.status === 'ENDED_EARLY') {
    return saveProductExperienceMetrics(
      {
        ...current,
        transferScenarioStates: {
          ...current.transferScenarioStates,
          [scenarioId]: 'ENDED_EARLY',
        },
        voluntaryExitNodes: [...current.voluntaryExitNodes.slice(-9), `transfer:${scenarioId}:ended_early`],
      },
      scope
    );
  }

  if (
    verification &&
    (verification.isReferenceOnly ||
      verification.status === 'REFERENCE_VIEWED' ||
      verification.selectedOptionCount <= 0)
  ) {
    return saveProductExperienceMetrics(
      {
        ...current,
        transferScenarioStates: {
          ...current.transferScenarioStates,
          [scenarioId]: 'REFERENCE_VIEWED',
        },
      },
      scope
    );
  }

  if (verification && (verification.isGoalMet === false || verification.status === 'ATTEMPTED')) {
    return saveProductExperienceMetrics(
      {
        ...current,
        transferScenarioStates: {
          ...current.transferScenarioStates,
          [scenarioId]: 'ATTEMPTED',
        },
      },
      scope
    );
  }

  const priorState = current.transferScenarioStates[scenarioId];
  const hadReferenceOrErrorBefore = Boolean(
    verification?.hadPriorReferenceOrErrorExplanation ||
      verification?.status === 'COMPLETED_WITH_PROMPT' ||
      priorState === 'REFERENCE_VIEWED' ||
      priorState === 'ATTEMPTED'
  );

  const isTrulyIndependent = adultPromptCount === 0 && !hadReferenceOrErrorBefore;
  const status: TransferTaskStatus = isTrulyIndependent
    ? 'COMPLETED_INDEPENDENT'
    : 'COMPLETED_WITH_PROMPT';

  const isFirstCompletionForScenario = !current.completedTransferScenarioIds.includes(scenarioId);
  const nextScenarios = isFirstCompletionForScenario
    ? [...current.completedTransferScenarioIds, scenarioId]
    : current.completedTransferScenarioIds;
  const sessionKey = `${scope}:${scenarioId}`;
  const nextParticipation = { ...current.taskParticipationCounts };
  if (!activeSessionParticipationKeys.has(sessionKey)) {
    activeSessionParticipationKeys.add(sessionKey);
    nextParticipation[scenarioId] = (nextParticipation[scenarioId] || 0) + 1;
  }

  return saveProductExperienceMetrics(
    {
      ...current,
      completedTransferScenarioIds: nextScenarios,
      transferScenarioStates: {
        ...current.transferScenarioStates,
        [scenarioId]: status,
      },
      independentTransferCount:
        current.independentTransferCount + (isFirstCompletionForScenario && isTrulyIndependent ? 1 : 0),
      promptedTransferCount:
        current.promptedTransferCount + (isFirstCompletionForScenario && !isTrulyIndependent ? 1 : 0),
      totalPromptCalls: current.totalPromptCalls + Math.max(0, adultPromptCount),
      taskParticipationCounts: nextParticipation,
    },
    scope
  );
}

/**
 * Sprint 2 / Sprint 3 A3: 记录《朋友问起我的家》多轮社交情境进展、可恢复任务状态与动物伙伴记忆
 * 严格区分：
 * - PAUSED_VOLUNTARILY（主动暂停保护边界，记入 pausedFriendHomeScenarioIds）
 * - SCENARIO_COMPLETED（完整体验完成情境，记入 completedFriendHomeScenarioIds）
 * - EXPRESSIVE_ACTION_ATTEMPTED（已尝试表达行动但尚未结束）
 */
export function recordFriendHomeSessionProgress(
  snapshot: FriendHomeSessionSnapshot,
  companionMemory?: CompanionSessionMemory
): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);

  const lastMode =
    snapshot.chosenExpressionModes.length > 0
      ? snapshot.chosenExpressionModes[snapshot.chosenExpressionModes.length - 1]
      : null;
  const isVoluntaryPause = Boolean(
    snapshot.outcomeStatus === 'PAUSED_VOLUNTARILY' ||
      snapshot.endedEarlyVoluntarily ||
      lastMode === 'PAUSE_CONVERSATION' ||
      snapshot.currentNodeId.includes('paused')
  );

  const resolvedStatus: FriendHomeOutcomeStatus = isVoluntaryPause
    ? 'PAUSED_VOLUNTARILY'
    : snapshot.outcomeStatus === 'SCENARIO_COMPLETED' || snapshot.isCompleted
      ? 'SCENARIO_COMPLETED'
      : 'EXPRESSIVE_ACTION_ATTEMPTED';

  const isFullScenarioCompleted = resolvedStatus === 'SCENARIO_COMPLETED';

  const nextCompleted =
    isFullScenarioCompleted && !current.completedFriendHomeScenarioIds.includes(snapshot.activeScenarioId)
      ? [...current.completedFriendHomeScenarioIds, snapshot.activeScenarioId]
      : current.completedFriendHomeScenarioIds;

  const nextPaused =
    resolvedStatus === 'PAUSED_VOLUNTARILY' &&
    !current.pausedFriendHomeScenarioIds.includes(snapshot.activeScenarioId)
      ? [...current.pausedFriendHomeScenarioIds, snapshot.activeScenarioId]
      : current.pausedFriendHomeScenarioIds;

  const nextStatuses: Record<string, FriendHomeOutcomeStatus> = {
    ...current.friendHomeScenarioStatuses,
  };
  const previousStatus = nextStatuses[snapshot.activeScenarioId];
  if (
    resolvedStatus === 'SCENARIO_COMPLETED' ||
    resolvedStatus === 'PAUSED_VOLUNTARILY' ||
    !previousStatus
  ) {
    nextStatuses[snapshot.activeScenarioId] = resolvedStatus;
  }

  const normalizedSnapshot: FriendHomeSessionSnapshot = {
    ...snapshot,
    endedEarlyVoluntarily: isVoluntaryPause,
    isCompleted: isFullScenarioCompleted,
    outcomeStatus: resolvedStatus,
  };

  const sessionKey = `${scope}:friend_home:${snapshot.activeScenarioId}`;
  const nextParticipation = { ...current.taskParticipationCounts };
  if (!activeSessionParticipationKeys.has(sessionKey)) {
    activeSessionParticipationKeys.add(sessionKey);
    nextParticipation[`friend_home:${snapshot.activeScenarioId}`] =
      (nextParticipation[`friend_home:${snapshot.activeScenarioId}`] || 0) + 1;
  }

  return saveProductExperienceMetrics(
    {
      ...current,
      completedFriendHomeScenarioIds: nextCompleted,
      pausedFriendHomeScenarioIds: nextPaused,
      friendHomeScenarioStatuses: nextStatuses,
      friendHomeSessionState: normalizedSnapshot,
      latestCompanionMemory: companionMemory ?? current.latestCompanionMemory,
      taskParticipationCounts: nextParticipation,
    },
    scope
  );
}

/**
 * Sprint 3 Stage B: 记录故事森林互动童话叶观察、行动尝试、修正与完成状态
 */
export function recordStoryGroveLeafProgress(
  snapshot: StoryGroveLeafSessionSnapshot,
  companionMemory?: CompanionSessionMemory
): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);

  const nextCompleted =
    snapshot.isCompleted && !current.completedStoryLeafIds.includes(snapshot.leafId)
      ? [...current.completedStoryLeafIds, snapshot.leafId]
      : current.completedStoryLeafIds;

  const sessionKey = `${scope}:story_leaf:${snapshot.leafId}`;
  const nextParticipation = { ...current.taskParticipationCounts };
  if (!activeSessionParticipationKeys.has(sessionKey)) {
    activeSessionParticipationKeys.add(sessionKey);
    nextParticipation[`story_leaf:${snapshot.leafId}`] =
      (nextParticipation[`story_leaf:${snapshot.leafId}`] || 0) + 1;
  }

  return saveProductExperienceMetrics(
    {
      ...current,
      completedStoryLeafIds: nextCompleted,
      storyLeafStatesById: {
        ...current.storyLeafStatesById,
        [snapshot.leafId]: snapshot,
      },
      latestCompanionMemory: companionMemory ?? current.latestCompanionMemory,
      taskParticipationCounts: nextParticipation,
    },
    scope
  );
}

/**
 * Sprint 3 Stage C: 记录故事森林跨方法自主迁移尝试与方法调整
 */
export function recordStoryGroveTransferAttempt(
  attempt: StoryGroveTransferAttemptRecord,
  companionMemory?: CompanionSessionMemory
): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);

  const existingIndex = current.storyGroveTransferAttempts.findIndex(
    (item) => item.scenarioId === attempt.scenarioId
  );
  const nextAttempts = [...current.storyGroveTransferAttempts];
  if (existingIndex >= 0) {
    nextAttempts[existingIndex] = attempt;
  } else {
    nextAttempts.push(attempt);
  }

  const isFirstCompletion =
    attempt.isCompleted && !current.completedTransferScenarioIds.includes(attempt.scenarioId);
  const nextCompletedTransferIds = isFirstCompletion
    ? [...current.completedTransferScenarioIds, attempt.scenarioId]
    : current.completedTransferScenarioIds;

  const nextTransferStates: Record<string, TransferTaskStatus> = {
    ...current.transferScenarioStates,
    [attempt.scenarioId]: attempt.isCompleted ? 'COMPLETED_INDEPENDENT' : 'ATTEMPTED',
  };

  return saveProductExperienceMetrics(
    {
      ...current,
      storyGroveTransferAttempts: nextAttempts,
      completedTransferScenarioIds: nextCompletedTransferIds,
      transferScenarioStates: nextTransferStates,
      independentTransferCount:
        current.independentTransferCount + (isFirstCompletion ? 1 : 0),
      latestCompanionMemory: companionMemory ?? current.latestCompanionMemory,
    },
    scope
  );
}

/**
 * Sprint 2 / 2.1: 记录《玩具船协商》物体操作与协商方案进展、可恢复任务状态与动物伙伴记忆
 * P0-A: 统一记录真实倒计时完成（FULL_WAIT_TIMER）与手动提前交接（MANUAL_EARLY_HANDOFF）
 * P0-B: 严禁仅凭其他任务遗留的 completedRoundCount > 0 宣告当前任务完成
 */
export function recordToyBoatSessionProgress(
  snapshot: ToyBoatSessionSnapshot,
  companionMemory?: CompanionSessionMemory
): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);

  const isCurrentTaskVerifiedComplete =
    snapshot.executionPhase === 'OBSERVED_RESULT' &&
    snapshot.completedRoundCount >= 2 &&
    (snapshot.completedForTaskId === undefined ||
      snapshot.completedForTaskId === snapshot.activeTaskId);

  const nextCompleted =
    isCurrentTaskVerifiedComplete && !current.completedToyBoatTaskIds.includes(snapshot.activeTaskId)
      ? [...current.completedToyBoatTaskIds, snapshot.activeTaskId]
      : current.completedToyBoatTaskIds;

  const nextCompletionModes: Record<string, ToyBoatCompletionMode> = {
    ...current.toyBoatTaskCompletionModes,
  };
  if (isCurrentTaskVerifiedComplete && snapshot.completionMode) {
    nextCompletionModes[snapshot.activeTaskId] = snapshot.completionMode;
  }

  const sessionKey = `${scope}:toy_boat:${snapshot.activeTaskId}`;
  const nextParticipation = { ...current.taskParticipationCounts };
  if (!activeSessionParticipationKeys.has(sessionKey)) {
    activeSessionParticipationKeys.add(sessionKey);
    nextParticipation[`toy_boat:${snapshot.activeTaskId}`] =
      (nextParticipation[`toy_boat:${snapshot.activeTaskId}`] || 0) + 1;
  }

  return saveProductExperienceMetrics(
    {
      ...current,
      completedToyBoatTaskIds: nextCompleted,
      toyBoatTaskCompletionModes: nextCompletionModes,
      toyBoatSessionState: snapshot,
      latestCompanionMemory: companionMemory ?? current.latestCompanionMemory,
      taskParticipationCounts: nextParticipation,
    },
    scope
  );
}

export function resetProductExperienceMetrics(explicitScope?: MetricsSessionScope): ProductExperienceMetrics {
  preFirstEntryActionCounter = 0;
  lastVisitedLandmarkKey = null;
  lastVisitedLandmarkTimestamp = 0;
  rewardedUnknownContextKeys.clear();
  recordedRevisionTransitionKeys.clear();
  activeSessionParticipationKeys.clear();

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (explicitScope) {
        window.localStorage.removeItem(getStorageKeyForScope(explicitScope));
      } else {
        window.localStorage.removeItem(STORAGE_KEY_CHILD);
        window.localStorage.removeItem(STORAGE_KEY_PLAYTEST);
      }
    } catch {
      // ignore
    }
  }
  const activeScope = explicitScope ?? getActiveMetricsScope();
  const fresh = createDefaultMetrics(activeScope);
  notifyListeners(fresh);
  return fresh;
}

export const loadProductExperienceMetrics = getProductExperienceMetrics;
export const resetProductExperienceMetricsForTesting = resetProductExperienceMetrics;
