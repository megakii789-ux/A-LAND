/**
 * 年龄分层架构与适配引擎 (Age Band Tier Engine V1.0)
 * 
 * 核心要求：
 * 1. 本轮只正式完成并验证当前约六岁用户（5–7 岁 EARLY_CHILDHOOD_5_7）的适配层；
 * 2. 2–4 岁、8–10 岁、11–13 岁、14–17 岁保留结构接口和设计方案，状态显式标为 RESERVED_STUB，不宣称已完成；
 * 3. Fail-Closed 守卫：若外部传入尚未激活的年龄段，自动安全降级至 5–7 岁经过验证的适配层，并返回结构告警；
 * 4. 适配标准：5–7 岁阶段强制满足大触控目标 (>=56px)、简短语音首选、不依赖长文字阅读。
 */

import { AgeBandTierId, AgeBandDefinition } from './types';
import { AGE_BAND_DEFINITIONS } from './constants';

export interface AgeTierAdaptationRules {
  readonly minTouchTargetPx: number;
  readonly maxWordsPerUtterance: number;
  readonly requiresVoiceGuidance: boolean;
  readonly allowsAbstractMetaphor: boolean;
  readonly allowsLongFormText: boolean;
  readonly enablePeerRoleplayBoundary: boolean;
  readonly enableSocialComparison: boolean; // 永远为 false
}

export interface AgeTierDispatchResult {
  readonly requestedTier: AgeBandTierId;
  readonly effectiveTier: AgeBandTierId;
  readonly isFullyVerified: boolean;
  readonly adaptationRules: AgeTierAdaptationRules;
  readonly definition: AgeBandDefinition;
  readonly fallbackNotice?: string;
}

/**
 * 5–7 岁适配规则（已验证基线）
 */
const EARLY_CHILDHOOD_5_7_RULES: AgeTierAdaptationRules = {
  minTouchTargetPx: 56,
  maxWordsPerUtterance: 25,
  requiresVoiceGuidance: true,
  allowsAbstractMetaphor: false,
  allowsLongFormText: false,
  enablePeerRoleplayBoundary: false,
  enableSocialComparison: false,
};

/**
 * 年龄分层调度与安全守卫
 */
export function dispatchAgeTierAdaptation(requestedTier: AgeBandTierId): AgeTierDispatchResult {
  const definition = AGE_BAND_DEFINITIONS[requestedTier] || AGE_BAND_DEFINITIONS.EARLY_CHILDHOOD_5_7;

  // 检查是否为正式激活层
  if (requestedTier === 'EARLY_CHILDHOOD_5_7') {
    return {
      requestedTier,
      effectiveTier: 'EARLY_CHILDHOOD_5_7',
      isFullyVerified: true,
      adaptationRules: EARLY_CHILDHOOD_5_7_RULES,
      definition,
    };
  }

  // 其他年龄段属于架构预留存根，安全降级至已验证的 5–7 岁层，绝不向儿童提供未经完整验证的交互
  return {
    requestedTier,
    effectiveTier: 'EARLY_CHILDHOOD_5_7',
    isFullyVerified: false,
    adaptationRules: EARLY_CHILDHOOD_5_7_RULES,
    definition: AGE_BAND_DEFINITIONS.EARLY_CHILDHOOD_5_7,
    fallbackNotice: `年龄段 ${requestedTier} (${definition.ageRangeDisplay}) 处于 RESERVED_STUB 预留状态，系统已安全降级至经完整验证的 5–7 岁儿童操作适配层。`,
  };
}

/**
 * 架构预留清单查询（供审计报告使用）
 */
export function getAgeTierAuditSummary(): ReadonlyArray<{
  tier: AgeBandTierId;
  label: string;
  status: string;
  isExecutableInChildV1: boolean;
}> {
  return (Object.keys(AGE_BAND_DEFINITIONS) as AgeBandTierId[]).map((tierKey) => {
    const def = AGE_BAND_DEFINITIONS[tierKey];
    return {
      tier: def.id,
      label: `${def.ageRangeDisplay} (${def.label})`,
      status: def.status,
      isExecutableInChildV1: def.status === 'ACTIVE_VERIFIED_V1',
    };
  });
}
