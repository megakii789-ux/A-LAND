import { describe, it, expect } from 'vitest';
import {
  HugRequestType,
  CommunicationStatus,
  CareResponsibility,
  CoPresenceStatus,
  HugDomainState,
  mapHugStateToChildPresentation,
} from '../../src/domain/hug';

describe('PHASE F — Hug & Co-Presence Interaction Contract (抱抱与在场契约全组合)', () => {
  // 1. 测试 7 大 Canonical States
  describe('7 大 Canonical States 正确映射', () => {
    // 1. local/send failed
    it('Canonical State 1: local/send failed 提示找身边大人，不标记虚假承诺', () => {
      const state: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.SEND_FAILED,
        care: CareResponsibility.UNASSIGNED,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: '妈妈',
      };
      const presentation = mapHugStateToChildPresentation(state);
      expect(presentation.displayText).toContain('网络未接通');
      expect(presentation.spokenText).toContain('拉拉大人的衣角');
      expect(presentation.shouldStepBack).toBe(false);
    });

    // 2. server accepted, unseen
    it('Canonical State 2: server accepted, unseen 明确陈述提醒已发，大人还未打开', () => {
      const state: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.SENT,
        care: CareResponsibility.UNASSIGNED,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: '爸爸',
      };
      const presentation = mapHugStateToChildPresentation(state);
      expect(presentation.displayText).toContain('等待大人查看');
      expect(presentation.spokenText).toContain('还没有打开看');
      expect(presentation.shouldStepBack).toBe(false);
    });

    // 3. caregiver opened, unassigned
    it('Canonical State 3: caregiver opened, unassigned 明确陈述大人已看但尚未接手', () => {
      const state: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.ACKNOWLEDGED,
        care: CareResponsibility.UNASSIGNED,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: '妈妈',
      };
      const presentation = mapHugStateToChildPresentation(state);
      expect(presentation.displayText).toContain('等待确认中');
      expect(presentation.spokenText).toContain('还没有回复接手');
      expect(presentation.shouldStepBack).toBe(false);
    });

    // 4. caregiver promised self, unconfirmed
    it('Canonical State 4: caregiver promised self, unconfirmed 绝不陈述已到场，保持 UNCONFIRMED 不得标 FAILED', () => {
      const state: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.ACKNOWLEDGED,
        care: CareResponsibility.ASSIGNED_SELF,
        coPresence: CoPresenceStatus.UNCONFIRMED,
        targetCaregiverName: '妈妈',
      };
      const presentation = mapHugStateToChildPresentation(state);
      expect(presentation.displayText).toContain('尚未确认到场');
      expect(presentation.spokenText).toContain('尚未确认到场');
      expect(presentation.spokenText).not.toContain('失约');
      expect(presentation.spokenText).not.toContain('失败');
      expect(presentation.shouldStepBack).toBe(false);
    });

    // 5. caregiver delegated, unconfirmed
    it('Canonical State 5: caregiver delegated, unconfirmed 告知委托他人协助，尚未到场', () => {
      const state: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.ACKNOWLEDGED,
        care: CareResponsibility.ASSIGNED_OTHER,
        coPresence: CoPresenceStatus.UNCONFIRMED,
        targetCaregiverName: '爸爸',
      };
      const presentation = mapHugStateToChildPresentation(state);
      expect(presentation.displayText).toContain('已委托其他大人');
      expect(presentation.spokenText).toContain('委托另一位大人');
      expect(presentation.shouldStepBack).toBe(false);
    });

    // 6. caregiver cannot attend
    it('Canonical State 6: caregiver cannot attend 提供修复与支持语言，不羞辱，不归咎于孩子', () => {
      const state: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.ACKNOWLEDGED,
        care: CareResponsibility.CANNOT_ATTEND,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: '妈妈',
      };
      const presentation = mapHugStateToChildPresentation(state);
      expect(presentation.displayText).toContain('暂时无法抽身');
      expect(presentation.spokenText).toContain('这不是你的原因');
      expect(presentation.spokenText).not.toContain('不想要你');
      expect(presentation.spokenText).not.toContain('讨厌');
      expect(presentation.shouldStepBack).toBe(false);
    });

    // 7. locally confirmed
    it('Canonical State 7: locally confirmed 触发退场原则 (shouldStepBack: true)', () => {
      const state: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.ACKNOWLEDGED,
        care: CareResponsibility.ASSIGNED_SELF,
        coPresence: CoPresenceStatus.ARRIVED_CONFIRMED,
        targetCaregiverName: '妈妈',
      };
      const presentation = mapHugStateToChildPresentation(state);
      expect(presentation.shouldStepBack).toBe(true);
      expect(presentation.displayText).toContain('已在身边');
      expect(presentation.spokenText).toContain('已经在身边啦');
    });
  });

  // 2. 异步想念流程 (ASYNC_MISS) — 明确告诉孩子不需要等回复
  describe('ASYNC_MISS (异步想念)', () => {
    it('明确告诉孩子不需要等回复，解耦即时求助', () => {
      const states: HugDomainState[] = [
        {
          requestType: HugRequestType.ASYNC_MISS,
          communication: CommunicationStatus.UNSENT,
          care: CareResponsibility.UNASSIGNED,
          coPresence: CoPresenceStatus.NOT_PRESENT,
          targetCaregiverName: '爸爸',
        },
        {
          requestType: HugRequestType.ASYNC_MISS,
          communication: CommunicationStatus.SENDING,
          care: CareResponsibility.UNASSIGNED,
          coPresence: CoPresenceStatus.NOT_PRESENT,
          targetCaregiverName: '爸爸',
        },
        {
          requestType: HugRequestType.ASYNC_MISS,
          communication: CommunicationStatus.SENT,
          care: CareResponsibility.UNASSIGNED,
          coPresence: CoPresenceStatus.NOT_PRESENT,
          targetCaregiverName: '爸爸',
        },
      ];

      for (const state of states) {
        const presentation = mapHugStateToChildPresentation(state);
        expect(presentation.spokenText).toContain('不需要等回复');
        expect(presentation.shouldStepBack).toBe(false);
      }
    });
  });

  // 3. Copy Safety Test: 在所有未验证到场状态中搜索违禁预测词
  describe('COPY SAFETY TEST (未验证状态严禁预测性承诺)', () => {
    const forbiddenPhrases = [
      '马上',
      '一定',
      '保证',
      '已经来了',
      '正在来的路上',
    ];

    // 构建各种未验证到场的笛卡尔积状态组合
    const commStatuses = [
      CommunicationStatus.UNSENT,
      CommunicationStatus.SENDING,
      CommunicationStatus.SENT,
      CommunicationStatus.ACKNOWLEDGED,
      CommunicationStatus.SEND_FAILED,
    ];

    const careResponsibilities = [
      CareResponsibility.UNASSIGNED,
      CareResponsibility.ASSIGNED_SELF,
      CareResponsibility.ASSIGNED_OTHER,
      CareResponsibility.ESCALATED_FALLBACK,
      CareResponsibility.CANNOT_ATTEND,
    ];

    const coPresences = [
      CoPresenceStatus.NOT_PRESENT,
      CoPresenceStatus.ON_THE_WAY,
      CoPresenceStatus.UNCONFIRMED,
    ];

    it('任何未验证状态中如果命中 forbiddenPhrases 必须 fail test', () => {
      for (const comm of commStatuses) {
        for (const care of careResponsibilities) {
          for (const co of coPresences) {
            const state: HugDomainState = {
              requestType: HugRequestType.INSTANT_HELP,
              communication: comm,
              care,
              coPresence: co,
              targetCaregiverName: '测试家长',
            };

            const presentation = mapHugStateToChildPresentation(state);

            for (const phrase of forbiddenPhrases) {
              const inSpoken = presentation.spokenText.includes(phrase);
              const inDisplay = presentation.displayText.includes(phrase);
              const inSafeAction = presentation.safeWaitingAction.includes(phrase);

              if (inSpoken || inDisplay || inSafeAction) {
                throw new Error(
                  `Copy Safety Violation! Found "${phrase}" in presentation for state: ${JSON.stringify(state)}`
                );
              }

              expect(inSpoken).toBe(false);
              expect(inDisplay).toBe(false);
              expect(inSafeAction).toBe(false);
            }
          }
        }
      }
    });
  });

  // 4. UNCONFIRMED 不得标记为 FAILED
  describe('UNCONFIRMED 绝不等于 FAILED 契约', () => {
    it('当家长承诺但未确认时，必须保持 UNCONFIRMED，绝不能出现失约、不理、失败', () => {
      const state: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.SENT,
        care: CareResponsibility.ASSIGNED_SELF,
        coPresence: CoPresenceStatus.UNCONFIRMED,
        targetCaregiverName: '爸爸',
      };

      const presentation = mapHugStateToChildPresentation(state);
      expect(presentation.spokenText).not.toContain('失约');
      expect(presentation.spokenText).not.toContain('没来');
      expect(presentation.spokenText).not.toContain('没理你');
      expect(presentation.spokenText).not.toContain('失败');
      expect(presentation.displayText).not.toContain('失约');
      expect(presentation.displayText).not.toContain('失败');
      expect(presentation.shouldStepBack).toBe(false);
    });
  });
});
