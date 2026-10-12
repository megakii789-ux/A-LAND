/**
 * Caregiver Response & Reliability Domain Service (家长响应与可靠性契约)
 * 遵照 docs/PRODUCT_CONTRACTS.md:
 * 1. 严格区分三种响应选择：
 *    - 我现在可以去 (ASSIGNED_SELF)
 *    - 我请 XX 去 (ASSIGNED_OTHER, 必须指定已配置的受信任在场成人)
 *    - 我现在不能去 (CANNOT_ATTEND)
 * 2. 私密自我反思 (Private Reflection)：
 *    “这次陪伴在孩子端没有确认完成。实际发生的是？”
 *    - 我去了
 *    - 我没能去 -> 显示修复脚本 (Repair Script)
 *    - 我不确定
 * 3. 修复脚本必须由真人说，App 绝不冒充家长。
 * 4. 可靠性审查 (Reliability Review)：
 *    - Configurable（阈值可配置，绝不硬编码在 UI）
 *    - Private（私密自省）
 *    - No score（无积分无打分）
 *    - No streak（无连续签到）
 *    - No comparison between caregivers（绝无家长间对抗性比较）
 * 5. 假设 v0.6：滚动 14 天内自报 2 次没能去（2 self-reported misses / rolling 14 days）
 *    只触发 review recommendation，不自动关闭功能。
 */

import { CareResponsibility } from '../hug/types';

export interface TrustedCaregiverContact {
  id: string;
  name: string;
  relationship: '爸爸' | '妈妈' | '外公' | '外婆' | '爷爷' | '奶奶' | '老师' | '专职照顾者';
  phone?: string;
  isOnsite: boolean;
}

export type CaregiverActionChoice =
  | 'I_CAN_GO_NOW'
  | 'I_DELEGATE_TO_TRUSTED'
  | 'I_CANNOT_GO_NOW';

export interface CaregiverActionResolution {
  choice: CaregiverActionChoice;
  responsibility: CareResponsibility;
  delegatedCaregiver?: TrustedCaregiverContact;
  reasonOrNote?: string;
  timestamp: string;
}

export type PrivateReflectionOutcome =
  | 'I_ATTENDED'      // 我去了
  | 'I_COULD_NOT_GO'  // 我没能去 -> 触发 repair script
  | 'I_AM_UNSURE';    // 我不确定

export interface PrivateReflectionRecord {
  id: string;
  hugRequestId: string;
  timestamp: string; // ISO string
  outcome: PrivateReflectionOutcome;
}

export interface ReliabilityReviewConfig {
  /** 滚动时间窗口天数，默认 14 天 */
  rollingWindowDays: number;
  /** 触发温和回顾建议的未履约次数，默认 2 次 */
  missThreshold: number;
}

export const DEFAULT_RELIABILITY_CONFIG: ReliabilityReviewConfig = {
  rollingWindowDays: 14,
  missThreshold: 2,
};

/**
 * 修复脚本：真实人类父母口述指引，App 不冒充家长发声
 */
export const PARENT_REPAIR_SCRIPT = {
  title: '真诚修复话术（请由你亲自对孩子说）：',
  lines: [
    '“刚才我说会来，可是后来没做到。让你等了，对不起。”',
    '“不是因为你不重要。下次如果我不能来，我会直接告诉你。”'
  ],
  guidance: '看着孩子的眼睛，蹲下来，用平静温和的语气说。不需要找过多的借口，承认真实发生的事实本身就是给孩子最强大的安全感。',
};

/**
 * 将家长的点击动作转化为严格的责任状态
 */
export function resolveCaregiverChoice(
  choice: CaregiverActionChoice,
  delegatedCaregiver?: TrustedCaregiverContact
): CaregiverActionResolution {
  const timestamp = new Date().toISOString();

  switch (choice) {
    case 'I_CAN_GO_NOW':
      return {
        choice,
        responsibility: CareResponsibility.ASSIGNED_SELF,
        timestamp,
      };

    case 'I_DELEGATE_TO_TRUSTED':
      if (!delegatedCaregiver) {
        throw new Error('委托给他人时必须指定已配置的在场成人，不能只输入自由文本姓名');
      }
      return {
        choice,
        responsibility: CareResponsibility.ASSIGNED_OTHER,
        delegatedCaregiver,
        timestamp,
      };

    case 'I_CANNOT_GO_NOW':
      return {
        choice,
        responsibility: CareResponsibility.CANNOT_ATTEND,
        timestamp,
      };
  }
}

/**
 * 纯函数：根据历史自报反思计算是否需要温和建议评估
 * 绝不自动关闭抱抱功能！只触发 review recommendation
 * 绝无打分、无比较、无胜负
 */
export function evaluateReliabilityReview(
  reflections: PrivateReflectionRecord[],
  config: ReliabilityReviewConfig = DEFAULT_RELIABILITY_CONFIG,
  referenceDate: Date = new Date()
): {
  shouldRecommendReview: boolean;
  missCountInWindow: number;
  recommendationMessage?: string;
} {
  const cutoffTime = referenceDate.getTime() - config.rollingWindowDays * 24 * 60 * 60 * 1000;

  // 筛选最近窗口内的未履约记录
  const recentMisses = reflections.filter(r => {
    const recordTime = new Date(r.timestamp).getTime();
    return recordTime >= cutoffTime && r.outcome === 'I_COULD_NOT_GO';
  });

  const missCount = recentMisses.length;
  const shouldRecommend = missCount >= config.missThreshold;

  if (shouldRecommend) {
    return {
      shouldRecommendReview: true,
      missCountInWindow: missCount,
      recommendationMessage:
        '即时抱抱请求也许暂时不适合现在的生活节奏。我们可以先换成一个更可预测的方式（例如固定的睡前通话或绘本时光）。这不是失败，而是为了给孩子更稳定的预期。',
    };
  }

  return {
    shouldRecommendReview: false,
    missCountInWindow: missCount,
  };
}
