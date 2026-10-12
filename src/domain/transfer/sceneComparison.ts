import { LeafDefinition } from './types';

export interface SceneComparisonItem {
  readonly situationSummary: string;
  readonly visualEmoji: string;
}

export interface ReflectionComparisonView {
  readonly sceneA: SceneComparisonItem;
  readonly sceneB: SceneComparisonItem;
  readonly childSpokenQuestion: string;
  readonly childSpokenInsight: string;
}

/**
 * 严格按照 docs/PRODUCT_CONTRACTS.md:
 * “回头比一比”：
 * 1. 比较的是两个具体生活场景（Scene A vs Scene B）。
 * 2. 严禁向 6 岁孩子询问工具名称（如“这是不是双面币？”“这是不是小天平？”）。
 * 3. 聚焦于情境间共通的思维本质与解决秘密。
 */
export function buildSceneComparisonView(
  currentLeaf: LeafDefinition,
  allLeaves: ReadonlyArray<LeafDefinition>
): ReflectionComparisonView | null {
  if (!currentLeaf.reflectionComparison) {
    return null;
  }

  const { comparedLeafId, situationA, situationB, sharedCoreQuestion } =
    currentLeaf.reflectionComparison;

  const comparedLeaf = allLeaves.find((l) => l.leafId === comparedLeafId);

  return {
    sceneA: {
      situationSummary: situationA,
      visualEmoji: '🍃',
    },
    sceneB: {
      situationSummary: situationB || (comparedLeaf ? comparedLeaf.title : '另一个故事场景'),
      visualEmoji: '🌿',
    },
    childSpokenQuestion: `“比一比：${situationA}，和【${situationB}】，有什么悄悄一样的地方？”`,
    childSpokenInsight: sharedCoreQuestion,
  };
}

/**
 * 安全审查：验证比一比文案中绝不包含任何工具名称（如双面币、小天平、放大镜等）或设计者元术语
 */
export function assertNoToolNameLeakageInComparison(
  view: ReflectionComparisonView,
  prohibitedToolKeywords: string[] = ['双面币', '天平', '小天平', '放大镜', '温度计', '爱心线', '魔方', 'P1', 'P2', 'P3', '分通择', 'S0', 'S1', 'S2', 'S3', 'S4', 'S5']
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];
  const textToCheck = `${view.sceneA.situationSummary} ${view.sceneB.situationSummary} ${view.childSpokenQuestion} ${view.childSpokenInsight}`;

  for (const keyword of prohibitedToolKeywords) {
    if (textToCheck.includes(keyword)) {
      violations.push(`Found leaked tool/internal keyword "${keyword}" in child comparison view`);
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}
