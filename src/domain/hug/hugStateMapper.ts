import {
  HugRequestType,
  CommunicationStatus,
  CareResponsibility,
  CoPresenceStatus,
  HugDomainState,
  ChildFacingHugPresentation,
} from './types';

/**
 * 严格遵照 docs/PRODUCT_CONTRACTS.md:
 * 1. 只能向孩子陈述已知事实。
 * 2. 严禁预测性承诺（禁止“马上”、“一定”、“保证”、“已经来了”、“正在来的路上”）。
 * 3. ASSIGNED_SELF 绝不能自动当成“已到场”。
 * 4. UNCONFIRMED 绝不能当成“失约”或“家长不理你”，不得标记 FAILED。
 * 5. 真人确认到场后，App 应退场 (shouldStepBack: true)。
 * 6. 支持 7 大 Canonical States:
 *    1. local/send failed
 *    2. server accepted, unseen (SENT, UNASSIGNED, NOT_PRESENT)
 *    3. caregiver opened, unassigned (ACKNOWLEDGED, UNASSIGNED, NOT_PRESENT)
 *    4. caregiver promised self, unconfirmed (ACKNOWLEDGED, ASSIGNED_SELF, UNCONFIRMED/NOT_PRESENT)
 *    5. caregiver delegated, unconfirmed (ACKNOWLEDGED, ASSIGNED_OTHER, UNCONFIRMED/NOT_PRESENT)
 *    6. caregiver cannot attend (ACKNOWLEDGED, CANNOT_ATTEND, NOT_PRESENT)
 *    7. locally confirmed (ARRIVED_CONFIRMED)
 */
export function mapHugStateToChildPresentation(
  state: HugDomainState
): ChildFacingHugPresentation {
  const { requestType, communication, care, coPresence, targetCaregiverName } = state;
  const caregiver = targetCaregiverName?.trim() || '大人';

  // 1. 本地已确认真人到场 (Canonical State 7: locally confirmed)
  if (coPresence === CoPresenceStatus.ARRIVED_CONFIRMED) {
    return {
      spokenText: `${caregiver}已经在身边啦。深呼吸，去握握大人的手吧。`,
      displayText: `${caregiver}已在身边`,
      shouldStepBack: true,
      safeWaitingAction: '去给身边的大人一个暖暖的拥抱吧',
    };
  }

  // 2. 异步想念流程 (ASYNC_MISS) — 明确告诉孩子不需要等回复
  if (requestType === HugRequestType.ASYNC_MISS) {
    switch (communication) {
      case CommunicationStatus.UNSENT:
        return {
          spokenText: `你想对${caregiver}说的话已经放进小瓶子里了，准备寄出去。不需要等回复哦。`,
          displayText: '准备寄出想念 · 不需等回复',
          shouldStepBack: false,
          safeWaitingAction: '摸摸你的小玩偶或者喝一口水',
        };
      case CommunicationStatus.SENDING:
        return {
          spokenText: `想念的小瓶子正在慢慢飞往${caregiver}那里，不需要等回复。`,
          displayText: '正在送信中 · 不需等回复',
          shouldStepBack: false,
          safeWaitingAction: '看看窗外天空的一朵云',
        };
      case CommunicationStatus.SENT:
      case CommunicationStatus.ACKNOWLEDGED:
        return {
          spokenText: `想念的信已经送到了。${caregiver}有空时会看到，你不需要等回复，安心做自己的事吧。`,
          displayText: '信已送达 · 不需等回复',
          shouldStepBack: false,
          safeWaitingAction: '画一张小画或者把今天最喜欢的玩具收好',
        };
      case CommunicationStatus.SEND_FAILED:
        return {
          spokenText: `网络信号好像休息了，信先稳稳收在你的小岛抽屉里。不用着急等回复，我们稍后再试。`,
          displayText: '信已保存在小岛上',
          shouldStepBack: false,
          safeWaitingAction: '先做个深呼吸，信不会弄丢的',
        };
    }
  }

  // 3. 即时求助流程 (INSTANT_HELP)

  // 3.1 Canonical State 1: local/send failed (SEC-03: 诚实告知儿童，不承诺虚假远程传输，提供非身体接触求助)
  if (communication === CommunicationStatus.SEND_FAILED) {
    return {
      spokenText: `这里不会发消息。网络未接通或无远程通道。如果你觉得难受或害怕，请直接走到身边的大人面前，拉拉大人的衣角，或者请大人坐在旁边陪陪你。`,
      displayText: '这里不会发消息 · 网络未接通 · 请找身边大人',
      shouldStepBack: false,
      safeWaitingAction: '找身边看得见的大人说说话、拉拉衣角，或者请大人在旁边陪坐一会儿',
    };
  }

  // 3.2 Canonical State 6: caregiver cannot attend (大人确实无法前来，提供修复与支持语言，不羞辱)
  if (care === CareResponsibility.CANNOT_ATTEND) {
    return {
      spokenText: `${caregiver}现在抽不开身，不能过来陪你。这不是你的原因。你可以找身边其他安全的大人，或者去平静角休息。`,
      displayText: `${caregiver}暂时无法抽身 · 找身边大人`,
      shouldStepBack: false,
      safeWaitingAction: '去握握身边其他大人的手，或者在安静的地方坐坐',
    };
  }

  // 3.3 正在发送中
  if (communication === CommunicationStatus.SENDING || communication === CommunicationStatus.UNSENT) {
    return {
      spokenText: `正在给${caregiver}送去呼唤提醒，小岛正在连接中。`,
      displayText: '正在送出提醒…',
      shouldStepBack: false,
      safeWaitingAction: '慢慢吸一口气，再慢慢吐出来',
    };
  }

  // 3.4 Canonical State 4: caregiver promised self, unconfirmed
  if (care === CareResponsibility.ASSIGNED_SELF) {
    // 无论是 UNCONFIRMED 还是 NOT_PRESENT 或 ON_THE_WAY
    // 关键安全原则：绝不说“马上”、“保证”、“已经在路上”
    if (coPresence === CoPresenceStatus.UNCONFIRMED || coPresence === CoPresenceStatus.NOT_PRESENT || coPresence === CoPresenceStatus.ON_THE_WAY) {
      return {
        spokenText: `${caregiver}已点击确认会来陪伴。目前尚未确认到场，你可以先在安全的地方坐好，或者找身边能看到的大人。`,
        displayText: `${caregiver}已确认会来 · 尚未确认到场`,
        shouldStepBack: false,
        safeWaitingAction: '双手抱抱自己，或者找身边的安全大人',
      };
    }
  }

  // 3.5 Canonical State 5: caregiver delegated, unconfirmed
  if (care === CareResponsibility.ASSIGNED_OTHER) {
    return {
      spokenText: `${caregiver}已委托另一位大人协助陪伴。目前尚未确认到场，你可以找现在身边能看到的大人拉拉手。`,
      displayText: '已委托其他大人 · 尚未确认到场',
      shouldStepBack: false,
      safeWaitingAction: '找身边看得见的大人说一句话',
    };
  }

  // 3.6 备用联系人接手 (ESCALATED_FALLBACK)
  if (care === CareResponsibility.ESCALATED_FALLBACK) {
    return {
      spokenText: `已向备用守护人送出提醒。目前尚未确认到场，如果感到害怕，请找身边能看到的大人。`,
      displayText: '备用守护已提醒 · 尚未确认到场',
      shouldStepBack: false,
      safeWaitingAction: '站起来走向房间里其他安全的大人',
    };
  }

  // 3.7 Canonical State 3: caregiver opened, unassigned (已看未接手)
  if (communication === CommunicationStatus.ACKNOWLEDGED && care === CareResponsibility.UNASSIGNED) {
    return {
      spokenText: `${caregiver}已打开并看到了消息，还没有回复接手。我们耐心等一会儿，或者直接找身边的大人。`,
      displayText: `${caregiver}已打开提醒 · 等待确认中`,
      shouldStepBack: false,
      safeWaitingAction: '双手轻轻摸摸自己的肩膀，深呼吸',
    };
  }

  // 3.8 Canonical State 2: server accepted, unseen (已送达服务端，大人尚未打开)
  if (communication === CommunicationStatus.SENT && care === CareResponsibility.UNASSIGNED) {
    return {
      spokenText: `消息已送达服务器，提醒已经发出，${caregiver}还没有打开看。你可以先做深呼吸。`,
      displayText: '提醒已送达 · 等待大人查看',
      shouldStepBack: false,
      safeWaitingAction: '深呼吸 3 次，或者找身边能看到的大人',
    };
  }

  // 兜底通用安全呈现
  return {
    spokenText: `消息已经送达。目前尚未确认到场，你可以先在安全的地方坐好，或者找身边能看到的大人。`,
    displayText: '消息已送达 · 尚未确认到场',
    shouldStepBack: false,
    safeWaitingAction: '双手轻轻抱抱自己，靠着小椅子休息一下',
  };
}
