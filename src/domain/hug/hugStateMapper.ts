import {
  HugDomainState,
  HugRequestType,
  CommunicationStatus,
  CareResponsibility,
  CoPresenceStatus,
  ChildHugPresentation,
  LocalHugSupportMode,
} from './types';

export interface HonestHugCopy {
  headline: string;
  spokenText: string;
  persistenceDisclosure: string;
  actionGuidance: string;
}

/**
 * R3-02 Honest local copy helper for all UI entry points.
 * - Never claims "已送达" or "大人已收到"
 * - Never calls local state changes remote notifications
 * - Explicitly discloses when a local miss note is only in current page memory
 */
export function getHonestLocalHugCopy(
  mode: LocalHugSupportMode,
  isSavedToLocalStorage = false
): HonestHugCopy {
  if (mode === 'SEEK_NEARBY_ADULT') {
    return {
      headline: '这里不会发远程消息 · 请直接找身边的大人',
      spokenText:
        '这个按钮不会给远方的大人发手机消息。如果你现在需要帮忙或想要抱抱，请直接走到身边信任的大人面前，拉拉大人的衣角告诉他。',
      persistenceDisclosure:
        '当前操作仅在本页提供找大人指引，不会向任何手机发送远程通知。',
      actionGuidance: '放下屏幕，走到房间里或身边安全的大人面前说：“我想要个抱抱。”',
    };
  }

  return {
    headline: isSavedToLocalStorage
      ? '本地想念表达（仅限本机查看 · 不会远程发送）'
      : '本地想念表达（仅在当前页面存在 · 未持久保存）',
    spokenText: isSavedToLocalStorage
      ? '这句想念留在当前这台设备里啦，不会自动发给远方的大人，也不需要等回复。下次见到大人时可以当面给他们看。'
      : '这句想念仅在当前页面存在，没有远程发送，也没有持久保存，关闭或刷新页面后就会消失。不需要等回复。',
    persistenceDisclosure: isSavedToLocalStorage
      ? '家长已开启本机存储设置：仅在当前设备留存，未发送远程消息。'
      : '未开启本机存储：该想念仅在当前页面内存中存在，未保存至本地存储，刷新或关闭页面即清除。',
    actionGuidance: '不需要在屏幕前等待回复，现在可以去喝口水或找身边的大人玩啦。',
  };
}

/**
 * Maps any combination of (HugRequestType, CommunicationStatus, CareResponsibility, CoPresenceStatus)
 * to honest, non-predictive child-facing copy.
 *
 * R3-02 & Iron Rules:
 * 1. Only state known facts. NEVER state predictive promises ("马上来", "很快就到", "一定会来", "正在来的路上").
 * 2. NEVER display "已送达" or "大人已收到" or "已经保存" for unpersisted local expressions.
 * 3. UNCONFIRMED is NEVER treated as FAILED ("失约", "不理你", "失败").
 * 4. When CoPresenceStatus.ARRIVED_CONFIRMED, shouldStepBack MUST be true.
 */
export function mapHugStateToChildPresentation(
  state: HugDomainState
): ChildHugPresentation {
  const target = state.targetCaregiverName || '大人';

  // ==================== 1. 异步想念流程 (ASYNC_MISS) ====================
  if (state.requestType === HugRequestType.ASYNC_MISS) {
    switch (state.communication) {
      case CommunicationStatus.SEND_FAILED: {
        const notice = state.message || '当前无网络连接或离线模式，无法发送至远程，请寻找身边的信任成年人';
        return {
          displayText: notice,
          spokenText:
            `${notice}。这句想念仅在当前页面存在，不需要等回复，你可以去玩别的啦。`,
          safeWaitingAction: '你可以去画一幅小画，或者喝一口温水。',
          shouldStepBack: false,
        };
      }
      case CommunicationStatus.UNSENT:
      case CommunicationStatus.SENDING:
        return {
          displayText: '正在当前页面整理想念 · 不需要等回复',
          spokenText:
            '正在当前页面放好你的想念小卡片，它仅在当前页面存在。不需要等回复，放好就可以去玩啦。',
          safeWaitingAction: '深呼吸一次，摸摸身边软软的小玩偶。',
          shouldStepBack: false,
        };
      case CommunicationStatus.SENT:
      case CommunicationStatus.ACKNOWLEDGED: {
        return {
          displayText: '当前页面想念卡片（未发远程通知） · 不需要等回复',
          spokenText: `你的想念小卡片目前仅在当前页面存在，没有发送远程通知。不需要等回复，下次见到${target}时可以当面说哦。`,
          safeWaitingAction: '不需要盯着屏幕等，去玩你喜欢的积木或绘本吧。',
          shouldStepBack: false,
        };
      }
      default: {
        const _exhaustiveCheck: never = state.communication;
        return _exhaustiveCheck;
      }
    }
  }

  // ==================== 2. 即时求助流程 (INSTANT_HELP) ====================

  // 最高优先级事实：真人已在本地确认到场 -> App 立即退场
  if (state.coPresence === CoPresenceStatus.ARRIVED_CONFIRMED) {
    return {
      displayText: `${target}已在身边 · 抱抱已达成`,
      spokenText: `${target}已经在身边啦！现在放下平板，去抱抱${target}吧。`,
      safeWaitingAction: '放下屏幕，投入大人的怀抱吧。',
      shouldStepBack: true,
    };
  }

  // 分支 A：大人明确表示当前无法到场（CANNOT_ATTEND）
  if (state.care === CareResponsibility.CANNOT_ATTEND) {
    return {
      displayText: `${target}暂时无法抽身 · 请找身边的大人`,
      spokenText: `${target}现在正在忙，暂时没办法过来，这不是你的原因。你可以先找身边照顾你的大人帮忙。`,
      safeWaitingAction: '走到现在陪着你的大人身边，或者去安静角抱抱小玩偶。',
      shouldStepBack: false,
    };
  }

  // 分支 B：发送失败或本机无远程通道（SEND_FAILED）
  if (state.communication === CommunicationStatus.SEND_FAILED) {
    const rawNotice = state.message;
    const notice = rawNotice && rawNotice.includes('当前无网络连接')
      ? `这里不会发消息 · 网络未接通 · ${rawNotice}`
      : '这里不会发消息 · 网络未接通 · 当前无网络连接或离线模式，无法发送至远程，请寻找身边的信任成年人';
    return {
      displayText: notice,
      spokenText: `这里不会发消息。网络未接通或离线模式，无法发送至远程，请寻找身边的信任成年人。如果你想找${target}，我们可以直接走到身边的大人面前，拉拉大人的衣角说“我想要个抱抱”。`,
      safeWaitingAction: '直接走到房间里的大人身边，拉拉大人的手。',
      shouldStepBack: false,
    };
  }

  // 分支 C：已升级到备用照护人（ESCALATED_FALLBACK）
  if (state.care === CareResponsibility.ESCALATED_FALLBACK) {
    return {
      displayText: '请优先找身边的备用照护大人 · 尚未确认到场',
      spokenText:
        '目前尚未确认到场。请先留在安全的地方，或者直接找身边的老师和家人帮忙。',
      safeWaitingAction: '留在安全的房间里，或者去找身边能看到的大人。',
      shouldStepBack: false,
    };
  }

  // 分支 D：其他大人代为接手（ASSIGNED_OTHER），但尚未确认到场
  if (state.care === CareResponsibility.ASSIGNED_OTHER) {
    return {
      displayText: `${target}已委托其他大人协助 · 尚未确认到场`,
      spokenText: `${target}已经委托另一位大人来照顾你，目前尚未确认到场。`,
      safeWaitingAction: '在安全的地方坐一会儿，或者看看窗外和绘本。',
      shouldStepBack: false,
    };
  }

  // 分支 E：目标大人承诺自己接手（ASSIGNED_SELF），但尚未本地确认到场
  if (state.care === CareResponsibility.ASSIGNED_SELF) {
    return {
      displayText: `${target}已知晓你的请求 · 尚未确认到场`,
      spokenText: `${target}表示会过来陪你，但目前尚未确认到场。在大人来到你身边之前，你可以先在安全的地方等一等，或者找身边的大人。`,
      safeWaitingAction: '你可以先抱抱身边的小熊，或者做三次慢呼吸。',
      shouldStepBack: false,
    };
  }

  // 分支 F：照护责任尚未分配（UNASSIGNED）
  switch (state.communication) {
    case CommunicationStatus.UNSENT:
    case CommunicationStatus.SENDING:
      return {
        displayText: '这里不会发远程消息 · 请找身边大人',
        spokenText: '这里不会发送远程通知，请先深呼吸一下，或者直接找身边的大人。',
        safeWaitingAction: '慢慢吸气，慢慢呼气，或者直接走到身边的大人面前。',
        shouldStepBack: false,
      };
    case CommunicationStatus.SENT:
      return {
        displayText: '未确认远程通道 · 等待大人查看',
        spokenText: `当前没有确认远程通知，${target}现在还没有打开看。如果你就在大人附近，也可以直接去告诉身边的大人。`,
        safeWaitingAction: '不用一直盯着屏幕，你可以先去喝口水或者找身边的大人。',
        shouldStepBack: false,
      };
    case CommunicationStatus.ACKNOWLEDGED:
      return {
        displayText: '本机记录已查看 · 等待确认中',
        spokenText: `本机记录已被查看，但${target}还没有回复接手。如果等太久，可以先找身边的大人哦。`,
        safeWaitingAction: '你可以先去安静角听听雨声，或者找身边的大人。',
        shouldStepBack: false,
      };
    default: {
      return {
        displayText: '状态未知 · 请找身边的大人',
        spokenText: '我们不确定消息的状态，请直接找身边的大人帮忙。',
        safeWaitingAction: '直接走到身边的大人面前。',
        shouldStepBack: false,
      };
    }
  }
}
