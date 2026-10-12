import { describe, it, expect } from 'vitest';
import {
  CareResponsibility
} from '../../src/domain/hug/types';
import {
  resolveCaregiverChoice,
  evaluateReliabilityReview,
  PARENT_REPAIR_SCRIPT,
  TrustedCaregiverContact,
  PrivateReflectionRecord,
  ReliabilityReviewConfig,
  DEFAULT_RELIABILITY_CONFIG
} from '../../src/domain/caregiver';

describe('PHASE G — Caregiver Response & Reliability Review Contract', () => {
  const mockOnsiteContact: TrustedCaregiverContact = {
    id: 'contact-grandma',
    name: '外婆',
    relationship: '外婆',
    isOnsite: true,
  };

  // 1. 三项明确响应动作
  describe('Caregiver Action Resolution (家长响应三项排他状态)', () => {
    it('选择“我现在可以去” -> 产生 ASSIGNED_SELF 责任', () => {
      const result = resolveCaregiverChoice('I_CAN_GO_NOW');
      expect(result.choice).toBe('I_CAN_GO_NOW');
      expect(result.responsibility).toBe(CareResponsibility.ASSIGNED_SELF);
      expect(result.delegatedCaregiver).toBeUndefined();
    });

    it('选择“我请 XX 去” -> 产生 ASSIGNED_OTHER 责任并必须携带已配置的联系人', () => {
      const result = resolveCaregiverChoice('I_DELEGATE_TO_TRUSTED', mockOnsiteContact);
      expect(result.choice).toBe('I_DELEGATE_TO_TRUSTED');
      expect(result.responsibility).toBe(CareResponsibility.ASSIGNED_OTHER);
      expect(result.delegatedCaregiver?.name).toBe('外婆');
      expect(result.delegatedCaregiver?.isOnsite).toBe(true);
    });

    it('选择“我请 XX 去”若未指定配置联系人 -> 必须抛出异常阻止自由文本姓名', () => {
      expect(() => {
        resolveCaregiverChoice('I_DELEGATE_TO_TRUSTED', undefined);
      }).toThrowError(/必须指定已配置的在场成人/);
    });

    it('选择“我现在不能去” -> 产生 CANNOT_ATTEND 责任', () => {
      const result = resolveCaregiverChoice('I_CANNOT_GO_NOW');
      expect(result.choice).toBe('I_CANNOT_GO_NOW');
      expect(result.responsibility).toBe(CareResponsibility.CANNOT_ATTEND);
    });
  });

  // 2. 修复脚本 (Repair Script) 契约
  describe('Repair Script Content & Safety (真人说，App 不冒充家长)', () => {
    it('包含指定的真诚修复核心语句，承认未履约事实并声明不是孩子原因', () => {
      expect(PARENT_REPAIR_SCRIPT.lines[0]).toContain('刚才我说会来，可是后来没做到。让你等了，对不起。');
      expect(PARENT_REPAIR_SCRIPT.lines[1]).toContain('不是因为你不重要。下次如果我不能来，我会直接告诉你。');
      // 强调必须由真人说
      expect(PARENT_REPAIR_SCRIPT.guidance).toContain('用平静温和的语气说');
    });
  });

  // 3. 可靠性审查 (Reliability Review)
  describe('Reliability Review (configurable, private, no score, no streak, no comparison)', () => {
    const fixedNow = new Date('2026-10-09T10:00:00Z');

    it('滚动14天内未满2次自报没能去 -> 不触发 review recommendation', () => {
      const reflections: PrivateReflectionRecord[] = [
        {
          id: 'ref-1',
          hugRequestId: 'req-1',
          timestamp: new Date('2026-10-08T10:00:00Z').toISOString(),
          outcome: 'I_COULD_NOT_GO', // 1 次
        },
        {
          id: 'ref-2',
          hugRequestId: 'req-2',
          timestamp: new Date('2026-10-07T10:00:00Z').toISOString(),
          outcome: 'I_ATTENDED',
        },
      ];

      const review = evaluateReliabilityReview(reflections, DEFAULT_RELIABILITY_CONFIG, fixedNow);
      expect(review.shouldRecommendReview).toBe(false);
      expect(review.missCountInWindow).toBe(1);
    });

    it('滚动14天内自报2次没能去 -> 触发 review recommendation，但不自动关闭功能', () => {
      const reflections: PrivateReflectionRecord[] = [
        {
          id: 'ref-1',
          hugRequestId: 'req-1',
          timestamp: new Date('2026-10-08T10:00:00Z').toISOString(),
          outcome: 'I_COULD_NOT_GO',
        },
        {
          id: 'ref-2',
          hugRequestId: 'req-2',
          timestamp: new Date('2026-10-06T10:00:00Z').toISOString(),
          outcome: 'I_COULD_NOT_GO',
        },
      ];

      const review = evaluateReliabilityReview(reflections, DEFAULT_RELIABILITY_CONFIG, fixedNow);
      expect(review.shouldRecommendReview).toBe(true);
      expect(review.missCountInWindow).toBe(2);
      expect(review.recommendationMessage).toContain('即时抱抱请求也许暂时不适合现在的生活节奏');
      expect(review.recommendationMessage).toContain('换成一个更可预测的方式');
    });

    it('超出14天滚动窗口的未履约记录不计入当前统计', () => {
      const reflections: PrivateReflectionRecord[] = [
        {
          id: 'ref-old',
          hugRequestId: 'req-old',
          // 20 天前（超出 14 天）
          timestamp: new Date('2026-09-18T10:00:00Z').toISOString(),
          outcome: 'I_COULD_NOT_GO',
        },
        {
          id: 'ref-recent',
          hugRequestId: 'req-recent',
          timestamp: new Date('2026-10-08T10:00:00Z').toISOString(),
          outcome: 'I_COULD_NOT_GO',
        },
      ];

      const review = evaluateReliabilityReview(reflections, DEFAULT_RELIABILITY_CONFIG, fixedNow);
      // 只有 1 次在窗口内，不触发
      expect(review.shouldRecommendReview).toBe(false);
      expect(review.missCountInWindow).toBe(1);
    });

    it('阈值必须通过配置注入，支持自定义滚动窗口与次数', () => {
      const customConfig: ReliabilityReviewConfig = {
        rollingWindowDays: 7,
        missThreshold: 1, // 只要 7 天内自报 1 次就提示
      };

      const reflections: PrivateReflectionRecord[] = [
        {
          id: 'ref-1',
          hugRequestId: 'req-1',
          timestamp: new Date('2026-10-08T10:00:00Z').toISOString(),
          outcome: 'I_COULD_NOT_GO',
        },
      ];

      const review = evaluateReliabilityReview(reflections, customConfig, fixedNow);
      expect(review.shouldRecommendReview).toBe(true);
      expect(review.missCountInWindow).toBe(1);
    });
  });
});
