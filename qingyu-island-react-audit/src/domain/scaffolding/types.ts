/**
 * 认知脚手架域类型定义
 * 遵循 docs/PRODUCT_CONTRACTS.md: 严密四层阶梯与 S0-S5 支持层级，绝不向 6 岁儿童暴露支架代码
 */

export enum SupportLevel {
  S0_INDEPENDENT = 'S0_INDEPENDENT',               // 自主完成，无需额外提示
  S1_IMPLICIT_PROMPT = 'S1_IMPLICIT_PROMPT',       // 仅需隐式环境反思提示
  S2_STRUCTURED_SCAFFOLD = 'S2_STRUCTURED_SCAFFOLD', // 需要结构化步骤拆解卡片
  S3_MODELING_PARTIAL = 'S3_MODELING_PARTIAL',     // 需要示例角色示范并协助前置动作
  S4_CO_REGULATION = 'S4_CO_REGULATION',           // 成人坐于身旁协同调节呼吸与言语
  S5_FULL_TAKEOVER = 'S5_FULL_TAKEOVER',           // 情绪或现实超载，成人完全接管，系统温和暂停
}

export enum ScaffoldTier {
  TIER_1_CHARACTER_THOUGHT_BUBBLE = 'TIER_1_CHARACTER_THOUGHT_BUBBLE', // 观察角色的想法泡泡
  TIER_2_CHARACTER_MAY_BE_WRONG = 'TIER_2_CHARACTER_MAY_BE_WRONG',     // 发现角色的想法可能不完全对
  TIER_3_PAST_LIGHT_SELF_EVENT = 'TIER_3_PAST_LIGHT_SELF_EVENT',       // 回顾自己过去的轻度小事件
  TIER_4_CURRENT_LIGHT_SELF_EVENT = 'TIER_4_CURRENT_LIGHT_SELF_EVENT', // 当前轻度事件（Feature Flag 默认关）
}

export interface ScaffoldingContext {
  readonly currentTier: ScaffoldTier;
  readonly enableCurrentSelfEventFlag: boolean; // 默认 false
  readonly stablePerformanceCount: number;     // 在当前阶梯下的稳定成功次数（非周数升级）
  readonly lastSupportLevel: SupportLevel;
}

export interface ChildFacingScaffoldGuidance {
  /** 纯口语化、温暖的儿童导语（严禁出现 S0-S5、Tier 等术语） */
  readonly spokenPrompt: string;
  /** 允许儿童选择的小动作工具类型 */
  readonly toolType: 'BUBBLE_POP' | 'DETECTIVE_GLASS' | 'TIME_CAPSULE' | 'HAND_IN_HAND';
  /** 是否需要提示成人坐在身边陪伴 */
  readonly suggestAdultPresence: boolean;
}
