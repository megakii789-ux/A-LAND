import { describe, it, expect } from 'vitest';
import {
  SupportLevel,
  ScaffoldTier,
  determineNextScaffoldTier,
  getChildFacingScaffoldGuidance,
} from '../../src/domain/scaffolding';

describe('Scaffolding Progression & Support Level Contract (退后一步与脚手架契约)', () => {
  it('CONTRACT: 脚手架序列遵循 角色想法泡泡 -> 角色可能不对 -> 过去自己轻度事件', () => {
    // Tier 1 -> Tier 2
    const tier1ToTier2 = determineNextScaffoldTier({
      currentTier: ScaffoldTier.TIER_1_CHARACTER_THOUGHT_BUBBLE,
      enableCurrentSelfEventFlag: false,
      stablePerformanceCount: 3,
      lastSupportLevel: SupportLevel.S0_INDEPENDENT,
    });
    expect(tier1ToTier2).toBe(ScaffoldTier.TIER_2_CHARACTER_MAY_BE_WRONG);

    // Tier 2 -> Tier 3
    const tier2ToTier3 = determineNextScaffoldTier({
      currentTier: ScaffoldTier.TIER_2_CHARACTER_MAY_BE_WRONG,
      enableCurrentSelfEventFlag: false,
      stablePerformanceCount: 4,
      lastSupportLevel: SupportLevel.S1_IMPLICIT_PROMPT,
    });
    expect(tier2ToTier3).toBe(ScaffoldTier.TIER_3_PAST_LIGHT_SELF_EVENT);
  });

  it('CONTRACT: 当前自己轻度事件 (Tier 4) 受 Feature Flag 严格管控，默认关闭', () => {
    // 当 flag 为 false 时，即使稳定探索也不得晋级 Tier 4，留在 Tier 3
    const tier3WithFlagOff = determineNextScaffoldTier({
      currentTier: ScaffoldTier.TIER_3_PAST_LIGHT_SELF_EVENT,
      enableCurrentSelfEventFlag: false,
      stablePerformanceCount: 5,
      lastSupportLevel: SupportLevel.S0_INDEPENDENT,
    });
    expect(tier3WithFlagOff).toBe(ScaffoldTier.TIER_3_PAST_LIGHT_SELF_EVENT);

    // 只有当 flag 显式为 true 时，才允许进入 Tier 4
    const tier3WithFlagOn = determineNextScaffoldTier({
      currentTier: ScaffoldTier.TIER_3_PAST_LIGHT_SELF_EVENT,
      enableCurrentSelfEventFlag: true,
      stablePerformanceCount: 5,
      lastSupportLevel: SupportLevel.S0_INDEPENDENT,
    });
    expect(tier3WithFlagOn).toBe(ScaffoldTier.TIER_4_CURRENT_LIGHT_SELF_EVENT);
  });

  it('CONTRACT: 严禁因自然周数或不足稳定次数而自动晋级', () => {
    // 稳定次数不足 3 次，保持原阶
    const unstableTier = determineNextScaffoldTier({
      currentTier: ScaffoldTier.TIER_1_CHARACTER_THOUGHT_BUBBLE,
      enableCurrentSelfEventFlag: false,
      stablePerformanceCount: 2,
      lastSupportLevel: SupportLevel.S0_INDEPENDENT,
    });
    expect(unstableTier).toBe(ScaffoldTier.TIER_1_CHARACTER_THOUGHT_BUBBLE);

    // 上一次需要高支持 (S4 或 S5)，即使次数够也不得晋级
    const highSupportTier = determineNextScaffoldTier({
      currentTier: ScaffoldTier.TIER_2_CHARACTER_MAY_BE_WRONG,
      enableCurrentSelfEventFlag: false,
      stablePerformanceCount: 5,
      lastSupportLevel: SupportLevel.S4_CO_REGULATION,
    });
    expect(highSupportTier).toBe(ScaffoldTier.TIER_2_CHARACTER_MAY_BE_WRONG);
  });

  it('CONTRACT: 面向 6 岁儿童的导语严禁暴露 S0-S5 或 Tier 等工程术语', () => {
    const allTiers = [
      ScaffoldTier.TIER_1_CHARACTER_THOUGHT_BUBBLE,
      ScaffoldTier.TIER_2_CHARACTER_MAY_BE_WRONG,
      ScaffoldTier.TIER_3_PAST_LIGHT_SELF_EVENT,
      ScaffoldTier.TIER_4_CURRENT_LIGHT_SELF_EVENT,
    ];

    const forbiddenTerms = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'Tier', '支架', '等级', '得分'];

    for (const tier of allTiers) {
      const guidance = getChildFacingScaffoldGuidance(tier, SupportLevel.S1_IMPLICIT_PROMPT);
      for (const term of forbiddenTerms) {
        expect(guidance.spokenPrompt).not.toContain(term);
      }
    }
  });
});
