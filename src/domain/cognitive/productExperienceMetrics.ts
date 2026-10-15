// 晴雨小岛 · 核心认知体验与成长进展本地度量引擎 (100% 端侧存储，零云端上传)
// 用于追踪 Vertical Slice 真实思考过程指标：
// 1. 侦探案件破获进度（支持多主题多案件）
// 2. 事实/猜测/未知区分首次准确率
// 3. 发现新线索后修正初步判断的次数（检验“通/辨”）
// 4. 证据不足时诚实表达“还不知道”的次数
// 5. 迁移实验室独立完成 vs 提示后完成次数（检验“验”）
// 6. 小岛空间探索足迹（用于地图真实进展点亮）

export interface ProductExperienceMetrics {
  completedDetectiveCaseIds: string[];
  totalCluesClassified: number;
  firstTryCorrectClassifications: number;
  hypothesisRevisionCount: number;
  unknownHonestyCount: number;
  independentTransferCount: number;
  promptedTransferCount: number;
  completedTransferScenarioIds: string[];
  visitedLandmarks: string[];
  /** Section 8.3: 首次进入任务所需步骤 */
  firstEntryStepCount: number | null;
  /** Section 8.3: 完成单个任务的操作次数记录 */
  lastTaskOperationCount: number | null;
  /** Section 8.3: 主动探索行为次数（点击调查方向/热点/微线索） */
  activeExplorationCount: number;
  /** Section 8.3: 提示调用总次数 */
  totalPromptCalls: number;
  /** Section 8.3: 主动退出节点记录 */
  voluntaryExitNodes: string[];
  /** Section 8.3: 不同任务的参与次数 */
  taskParticipationCounts: Record<string, number>;
  lastUpdatedAt: string | null;
}

const STORAGE_KEY = 'qingyu_experience_metrics_v1';

const DEFAULT_METRICS: ProductExperienceMetrics = {
  completedDetectiveCaseIds: [],
  totalCluesClassified: 0,
  firstTryCorrectClassifications: 0,
  hypothesisRevisionCount: 0,
  unknownHonestyCount: 0,
  independentTransferCount: 0,
  promptedTransferCount: 0,
  completedTransferScenarioIds: [],
  visitedLandmarks: [],
  firstEntryStepCount: null,
  lastTaskOperationCount: null,
  activeExplorationCount: 0,
  totalPromptCalls: 0,
  voluntaryExitNodes: [],
  taskParticipationCounts: {},
  lastUpdatedAt: null,
};

type MetricsListener = (metrics: ProductExperienceMetrics) => void;
const listeners = new Set<MetricsListener>();

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

export function getProductExperienceMetrics(): ProductExperienceMetrics {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_METRICS };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_METRICS };
    const parsed = JSON.parse(raw) as Partial<ProductExperienceMetrics>;
    return {
      completedDetectiveCaseIds: Array.isArray(parsed.completedDetectiveCaseIds)
        ? parsed.completedDetectiveCaseIds
        : [],
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
    return { ...DEFAULT_METRICS };
  }
}

function saveProductExperienceMetrics(next: ProductExperienceMetrics): ProductExperienceMetrics {
  const updated: ProductExperienceMetrics = {
    ...next,
    lastUpdatedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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

export function recordLandmarkVisit(landmarkId: string): ProductExperienceMetrics {
  const current = getProductExperienceMetrics();
  const nextLandmarks = current.visitedLandmarks.includes(landmarkId)
    ? current.visitedLandmarks
    : [...current.visitedLandmarks, landmarkId];
  return saveProductExperienceMetrics({
    ...current,
    visitedLandmarks: nextLandmarks,
    firstEntryStepCount: current.firstEntryStepCount ?? 1,
    activeExplorationCount: current.activeExplorationCount + 1,
  });
}

export function recordActiveExploration(taskKey?: string): ProductExperienceMetrics {
  const current = getProductExperienceMetrics();
  const nextParticipation = { ...current.taskParticipationCounts };
  if (taskKey) {
    nextParticipation[taskKey] = (nextParticipation[taskKey] || 0) + 1;
  }
  return saveProductExperienceMetrics({
    ...current,
    activeExplorationCount: current.activeExplorationCount + 1,
    taskParticipationCounts: nextParticipation,
  });
}

export function recordVoluntaryExitNode(nodeLabel: string): ProductExperienceMetrics {
  const current = getProductExperienceMetrics();
  const nextExits = [...current.voluntaryExitNodes.slice(-9), nodeLabel];
  return saveProductExperienceMetrics({
    ...current,
    voluntaryExitNodes: nextExits,
  });
}

export function recordClueClassificationAttempt(isCorrectFirstTry: boolean): ProductExperienceMetrics {
  const current = getProductExperienceMetrics();
  return saveProductExperienceMetrics({
    ...current,
    totalCluesClassified: current.totalCluesClassified + 1,
    firstTryCorrectClassifications:
      current.firstTryCorrectClassifications + (isCorrectFirstTry ? 1 : 0),
    activeExplorationCount: current.activeExplorationCount + 1,
  });
}

export function recordUnknownHonestyChoice(): ProductExperienceMetrics {
  const current = getProductExperienceMetrics();
  return saveProductExperienceMetrics({
    ...current,
    unknownHonestyCount: current.unknownHonestyCount + 1,
  });
}

export function recordHypothesisRevision(): ProductExperienceMetrics {
  const current = getProductExperienceMetrics();
  return saveProductExperienceMetrics({
    ...current,
    hypothesisRevisionCount: current.hypothesisRevisionCount + 1,
  });
}

export function recordDetectiveCaseCompletion(
  caseId: string,
  operationCount?: number
): ProductExperienceMetrics {
  const current = getProductExperienceMetrics();
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
  return saveProductExperienceMetrics({
    ...current,
    completedDetectiveCaseIds: nextCases,
    visitedLandmarks: nextLandmarks,
    lastTaskOperationCount:
      typeof operationCount === 'number' ? operationCount : current.lastTaskOperationCount ?? 6,
    taskParticipationCounts: nextParticipation,
  });
}

export function recordTransferScenarioCompletion(
  scenarioId: string,
  adultPromptCount: number
): ProductExperienceMetrics {
  const current = getProductExperienceMetrics();
  const nextScenarios = current.completedTransferScenarioIds.includes(scenarioId)
    ? current.completedTransferScenarioIds
    : [...current.completedTransferScenarioIds, scenarioId];
  const nextParticipation = {
    ...current.taskParticipationCounts,
    [scenarioId]: (current.taskParticipationCounts[scenarioId] || 0) + 1,
  };
  return saveProductExperienceMetrics({
    ...current,
    completedTransferScenarioIds: nextScenarios,
    independentTransferCount:
      current.independentTransferCount + (adultPromptCount === 0 ? 1 : 0),
    promptedTransferCount:
      current.promptedTransferCount + (adultPromptCount > 0 ? 1 : 0),
    totalPromptCalls: current.totalPromptCalls + Math.max(0, adultPromptCount),
    taskParticipationCounts: nextParticipation,
  });
}

export function resetProductExperienceMetrics(): ProductExperienceMetrics {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  const fresh = { ...DEFAULT_METRICS };
  notifyListeners(fresh);
  return fresh;
}

export const loadProductExperienceMetrics = getProductExperienceMetrics;
export const resetProductExperienceMetricsForTesting = resetProductExperienceMetrics;


