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
  if (current.visitedLandmarks.includes(landmarkId)) {
    return current;
  }
  return saveProductExperienceMetrics({
    ...current,
    visitedLandmarks: [...current.visitedLandmarks, landmarkId],
  });
}

export function recordClueClassificationAttempt(isCorrectFirstTry: boolean): ProductExperienceMetrics {
  const current = getProductExperienceMetrics();
  return saveProductExperienceMetrics({
    ...current,
    totalCluesClassified: current.totalCluesClassified + 1,
    firstTryCorrectClassifications:
      current.firstTryCorrectClassifications + (isCorrectFirstTry ? 1 : 0),
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

export function recordDetectiveCaseCompletion(caseId: string): ProductExperienceMetrics {
  const current = getProductExperienceMetrics();
  const nextCases = current.completedDetectiveCaseIds.includes(caseId)
    ? current.completedDetectiveCaseIds
    : [...current.completedDetectiveCaseIds, caseId];
  const nextLandmarks = current.visitedLandmarks.includes('detective')
    ? current.visitedLandmarks
    : [...current.visitedLandmarks, 'detective'];
  return saveProductExperienceMetrics({
    ...current,
    completedDetectiveCaseIds: nextCases,
    visitedLandmarks: nextLandmarks,
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
  return saveProductExperienceMetrics({
    ...current,
    completedTransferScenarioIds: nextScenarios,
    independentTransferCount:
      current.independentTransferCount + (adultPromptCount === 0 ? 1 : 0),
    promptedTransferCount:
      current.promptedTransferCount + (adultPromptCount > 0 ? 1 : 0),
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

