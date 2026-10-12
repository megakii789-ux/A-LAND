import {
  SupportLevel,
  ScaffoldTier,
  ScaffoldingContext,
  ChildFacingScaffoldGuidance,
} from './types';

/**
 * 严格按照 docs/PRODUCT_CONTRACTS.md:
 * 1. 脚手架顺序为：
 *    - character thought bubble (Tier 1)
 *    - character may be wrong (Tier 2)
 *    - past light self event (Tier 3)
 *    - current light self event (Tier 4, feature flag, default off)
 * 2. 严禁按自然周数自动升级！必须基于表现与成人指导。
 * 3. 严禁向 6 岁儿童暴露 S0-S5 或 Tier1-4。
 */
export function determineNextScaffoldTier(
  context: ScaffoldingContext
): ScaffoldTier {
  const { currentTier, enableCurrentSelfEventFlag, stablePerformanceCount, lastSupportLevel } =
    context;

  // 如果处于高支持度依赖状态 (S4/S5)，不可升级，应稳固在当前或回退
  if (
    lastSupportLevel === SupportLevel.S4_CO_REGULATION ||
    lastSupportLevel === SupportLevel.S5_FULL_TAKEOVER
  ) {
    return currentTier;
  }

  // 必须至少有 3 次独立或轻度提示下的稳定探索，才能允许探索下一阶
  const isStable =
    stablePerformanceCount >= 3 &&
    (lastSupportLevel === SupportLevel.S0_INDEPENDENT ||
      lastSupportLevel === SupportLevel.S1_IMPLICIT_PROMPT);

  if (!isStable) {
    return currentTier;
  }

  switch (currentTier) {
    case ScaffoldTier.TIER_1_CHARACTER_THOUGHT_BUBBLE:
      return ScaffoldTier.TIER_2_CHARACTER_MAY_BE_WRONG;

    case ScaffoldTier.TIER_2_CHARACTER_MAY_BE_WRONG:
      return ScaffoldTier.TIER_3_PAST_LIGHT_SELF_EVENT;

    case ScaffoldTier.TIER_3_PAST_LIGHT_SELF_EVENT:
      // 关键契约：Tier 4 必须有 feature flag 显式开启，默认关闭
      if (enableCurrentSelfEventFlag) {
        return ScaffoldTier.TIER_4_CURRENT_LIGHT_SELF_EVENT;
      }
      return ScaffoldTier.TIER_3_PAST_LIGHT_SELF_EVENT;

    case ScaffoldTier.TIER_4_CURRENT_LIGHT_SELF_EVENT:
      return ScaffoldTier.TIER_4_CURRENT_LIGHT_SELF_EVENT;

    default: {
      const _exhaustiveCheck: never = currentTier;
      throw new Error(`Unhandled scaffold tier: ${_exhaustiveCheck}`);
    }
  }
}

/**
 * 转换为面向儿童的口语化导语，消除所有工程与理论术语
 */
export function getChildFacingScaffoldGuidance(
  tier: ScaffoldTier,
  supportLevel: SupportLevel
): ChildFacingScaffoldGuidance {
  const suggestAdult =
    supportLevel === SupportLevel.S3_MODELING_PARTIAL ||
    supportLevel === SupportLevel.S4_CO_REGULATION ||
    supportLevel === SupportLevel.S5_FULL_TAKEOVER;

  switch (tier) {
    case ScaffoldTier.TIER_1_CHARACTER_THOUGHT_BUBBLE:
      return {
        spokenPrompt: '看！小动物的脑袋上冒出了一个想法小泡泡。我们一起来看看泡泡里装着什么？',
        toolType: 'BUBBLE_POP',
        suggestAdultPresence: suggestAdult,
      };

    case ScaffoldTier.TIER_2_CHARACTER_MAY_BE_WRONG:
      return {
        spokenPrompt: '小动物的泡泡里想的，真的完全是对的吗？拿小放大镜仔细看一看吧。',
        toolType: 'DETECTIVE_GLASS',
        suggestAdultPresence: suggestAdult,
      };

    case ScaffoldTier.TIER_3_PAST_LIGHT_SELF_EVENT:
      return {
        spokenPrompt: '还记得上次积木倒下的时候吗？事情已经过去啦，我们打开时光小盒看一看。',
        toolType: 'TIME_CAPSULE',
        suggestAdultPresence: suggestAdult,
      };

    case ScaffoldTier.TIER_4_CURRENT_LIGHT_SELF_EVENT:
      return {
        spokenPrompt: '现在发生的这件小事，让我们退后一步，像小侦探一样做个深呼吸。',
        toolType: 'HAND_IN_HAND',
        suggestAdultPresence: true, // 当前自己事件必须有成人陪伴在场
      };

    default: {
      const _exhaustiveCheck: never = tier;
      throw new Error(`Unhandled scaffold tier: ${_exhaustiveCheck}`);
    }
  }
}
