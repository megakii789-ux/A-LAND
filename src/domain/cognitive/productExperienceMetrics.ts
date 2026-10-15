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
  | 'ENDED_EARLY';

export type TransferTaskStatus =
  | 'NOT_STARTED'
  | 'ATTEMPTED'
  | 'REFERENCE_VIEWED'
  | 'COMPLETED_INDEPENDENT'
  | 'COMPLETED_WITH_PROMPT'
  | 'ENDED_EARLY';

export interface ProductExperienceMetrics {
  sessionScope: MetricsSessionScope;
  completedDetectiveCaseIds: string[];
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
  lastUpdatedAt: string | null;
}

const STORAGE_KEY_CHILD = 'qingyu_experience_metrics_v1';
const STORAGE_KEY_PLAYTEST = 'qingyu_experience_metrics_playtest_v1';

function createDefaultMetrics(scope: MetricsSessionScope = 'CHILD_SESSION'): ProductExperienceMetrics {
  return {
    sessionScope: scope,
    completedDetectiveCaseIds: [],
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
    nextParticipation[taskKey] = (nextParticipation[taskKey] || 0) + 1;
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
  if (current.detectiveCaseStates[caseId] === status) {
    return current;
  }
  return saveProductExperienceMetrics(
    {
      ...current,
      detectiveCaseStates: {
        ...current.detectiveCaseStates,
        [caseId]: status,
      },
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
 * 重置指定案件的“不知道”与“修正”单回合去重锁（在点击“重新开始”或切换案件时调用）
 */
export function resetCaseSessionDeduplication(caseId?: string): void {
  if (!caseId) {
    rewardedUnknownContextKeys.clear();
    recordedRevisionTransitionKeys.clear();
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
  hasReflectedOrSorted?: boolean;
  hasSelectedHypothesis?: boolean;
  hasSelectedAction?: boolean;
}

/**
 * 记录侦探案件完成：
 * 必须经过真实线索探索（至少发现 2 条线索）且完成了思考动作（归类或判断辨析），
 * 严禁零探索直接查看结局即记录完成或赋予默认虚构操作数。
 */
export function recordDetectiveCaseCompletion(
  caseId: string,
  operationCountOrVerification?: number | DetectiveCompletionVerification,
  explicitVerification?: DetectiveCompletionVerification
): ProductExperienceMetrics {
  const scope = getActiveMetricsScope();
  const current = getProductExperienceMetrics(scope);

  const operationCount =
    typeof operationCountOrVerification === 'number' ? operationCountOrVerification : undefined;
  const verification =
    typeof operationCountOrVerification === 'object' && operationCountOrVerification !== null
      ? operationCountOrVerification
      : explicitVerification;

  if (verification) {
    const hasThoughtStep = Boolean(
      verification.hasReflectedOrSorted ?? verification.hasSelectedHypothesis ?? true
    );
    if (verification.discoveredClueCount < 2 || !hasThoughtStep) {
      return saveProductExperienceMetrics(
        {
          ...current,
          detectiveCaseStates: {
            ...current.detectiveCaseStates,
            [caseId]: verification.discoveredClueCount === 0 ? 'ENDED_EARLY' : 'EXPLORING',
          },
        },
        scope
      );
    }
  }

  const nextCases = current.completedDetectiveCaseIds.includes(caseId)
    ? current.completedDetectiveCaseIds
    : [...current.completedDetectiveCaseIds, caseId];
  const nextLandmarks = current.visitedLandmarks.includes('detective')
    ? current.visitedLandmarks
    : [...current.visitedLandmarks, 'detective'];
  const nextParticipation = {
    ...current.taskParticipationCounts,
    [caseId]: (current.taskParticipationCounts[caseId] || 0) + 1,
  };

  return saveProductExperienceMetrics(
    {
      ...current,
      completedDetectiveCaseIds: nextCases,
      detectiveCaseStates: {
        ...current.detectiveCaseStates,
        [caseId]: 'COMPLETED',
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
  hasSelectedConclusion?: boolean;
  isReferenceOnly?: boolean;
  isEndedEarly?: boolean;
}

/**
 * 记录迁移实验室情境完成：
 * 严禁零选择点击“看一看客观结果”记为独立完成；
 * 零选择查看结果仅记为 REFERENCE_VIEWED，不增加完成数。
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
    (verification.isReferenceOnly || verification.selectedOptionCount <= 0)
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

  const status: TransferTaskStatus =
    adultPromptCount === 0 ? 'COMPLETED_INDEPENDENT' : 'COMPLETED_WITH_PROMPT';
  const isFirstCompletionForScenario = !current.completedTransferScenarioIds.includes(scenarioId);
  const nextScenarios = isFirstCompletionForScenario
    ? [...current.completedTransferScenarioIds, scenarioId]
    : current.completedTransferScenarioIds;
  const nextParticipation = {
    ...current.taskParticipationCounts,
    [scenarioId]: (current.taskParticipationCounts[scenarioId] || 0) + 1,
  };

  return saveProductExperienceMetrics(
    {
      ...current,
      completedTransferScenarioIds: nextScenarios,
      transferScenarioStates: {
        ...current.transferScenarioStates,
        [scenarioId]: status,
      },
      independentTransferCount:
        current.independentTransferCount +
        (isFirstCompletionForScenario && adultPromptCount === 0 ? 1 : 0),
      promptedTransferCount:
        current.promptedTransferCount +
        (isFirstCompletionForScenario && adultPromptCount > 0 ? 1 : 0),
      totalPromptCalls: current.totalPromptCalls + Math.max(0, adultPromptCount),
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
