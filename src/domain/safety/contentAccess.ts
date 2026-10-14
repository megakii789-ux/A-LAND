import { LeafScenario } from '../../types';
import { Boundary } from './types';

export type LeafAccessClassification =
  | 'CHILD_INDEPENDENT'
  | 'ADULT_CO_PLAY_PENDING_REVIEW';

const FAMILY_TRANSITION_IDS = new Set([
  'not-my-fault',
  'two-homes-rules',
  'family-transition',
  'parent-phone',
  'peer-question',
]);

/**
 * Phase 3 P1 #8 / AG-R5: 明确区分需要成年人共读、可以儿童独立使用和待审查的场景
 * 修复 NONE、PHYSICAL_SAFETY 与敏感家庭情境的分类逻辑
 */
export function classifyLeafScenarioAccess(
  leaf: LeafScenario
): LeafAccessClassification {
  const hasBoundaryConflict =
    Boolean(leaf.boundary) &&
    leaf.boundary !== Boundary.NONE &&
    (leaf.boundary as string) !== 'NONE';

  if (
    leaf.weight === 'medium' ||
    Boolean((leaf as { requiresAdult?: boolean }).requiresAdult) ||
    FAMILY_TRANSITION_IDS.has(leaf.id) ||
    leaf.category.includes('家的形状') ||
    hasBoundaryConflict
  ) {
    return 'ADULT_CO_PLAY_PENDING_REVIEW';
  }
  return 'CHILD_INDEPENDENT';
}

export function getLeafAccessBadgeText(leaf: LeafScenario): {
  badge: string;
  requiresAdultCoPlay: boolean;
  reviewNotice: string;
} {
  const classification = classifyLeafScenarioAccess(leaf);
  if (classification === 'ADULT_CO_PLAY_PENDING_REVIEW') {
    const hasBoundaryConflict =
      Boolean(leaf.boundary) &&
      leaf.boundary !== Boundary.NONE &&
      (leaf.boundary as string) !== 'NONE';

    if (hasBoundaryConflict) {
      const isPhysical =
        leaf.boundary === Boundary.PHYSICAL_SAFETY ||
        leaf.boundary === Boundary.PHYSICAL_HARM;
      return {
        badge: isPhysical ? '身体安全围栏 · 需大人陪同' : '安全围栏 · 建议大人共读',
        requiresAdultCoPlay: true,
        reviewNotice: isPhysical
          ? '涉及身体安全红线，严禁利弊权衡，需由信任的成年人陪同与指导。'
          : '涉及心理安全或人际边界，建议与信任的成年人共同阅读讨论。',
      };
    }
    return {
      badge: '待独立审查 · 需大人共读',
      requiresAdultCoPlay: true,
      reviewNotice:
        '家庭过渡敏感场景（待独立专家内容审查完成前，仅限家长或照顾者陪同共读）。',
    };
  }

  return {
    badge: '儿童可独立探索',
    requiresAdultCoPlay: false,
    reviewNotice: '日常轻情境，儿童可独立探索或随时跳过。',
  };
}
