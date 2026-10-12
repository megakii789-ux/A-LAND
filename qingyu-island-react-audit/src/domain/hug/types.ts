/**
 * 抱抱与在场状态域类型定义
 * 遵循 docs/PRODUCT_CONTRACTS.md: 绝不混淆通信、责任与在场三维
 */

export enum HugRequestType {
  INSTANT_HELP = 'INSTANT_HELP', // 即时求助：需要此时此刻的安全感或注意力
  ASYNC_MISS = 'ASYNC_MISS',     // 异步想念：写信、心愿瓶、稍后查看
}

export enum CommunicationStatus {
  UNSENT = 'UNSENT',               // 尚未发出
  SENDING = 'SENDING',             // 发送中
  SENT = 'SENT',                   // 已送达中继通道
  ACKNOWLEDGED = 'ACKNOWLEDGED',   // 收到确认；需 evidence 才能声称人工阅读
  SEND_FAILED = 'SEND_FAILED',     // 通道故障
}

export enum CareResponsibility {
  UNASSIGNED = 'UNASSIGNED',                 // 尚未有大人接手 / 未指派
  ASSIGNED_SELF = 'ASSIGNED_SELF',           // 当前主要抚养人/身边家长承诺接手
  ASSIGNED_OTHER = 'ASSIGNED_OTHER',         // 另一位抚养人接手 / 委托转交 (delegated)
  ESCALATED_FALLBACK = 'ESCALATED_FALLBACK', // 备用紧急联系人接手
  CANNOT_ATTEND = 'CANNOT_ATTEND',           // 当前大人确实无法前来（提供修复与支持语言，不羞辱）
}

export enum CoPresenceStatus {
  NOT_PRESENT = 'NOT_PRESENT',             // 不在身边
  ON_THE_WAY = 'ON_THE_WAY',               // 在途中（仅客观事实，不得向孩子虚构倒计时）
  ARRIVED_CONFIRMED = 'ARRIVED_CONFIRMED', // 本地已确认真人到场
  UNCONFIRMED = 'UNCONFIRMED',             // 到场未确认（铁律：绝不等于失约！）
}

export interface HugDomainState {
  readonly requestType: HugRequestType;
  readonly communication: CommunicationStatus;
  readonly care: CareResponsibility;
  readonly coPresence: CoPresenceStatus;
  readonly targetCaregiverName?: string;
  /** Device receipt is not evidence a person has read a message. */
  readonly acknowledgementEvidence?: 'DEVICE_RECEIVED' | 'HUMAN_OPENED';
  readonly careEvidence?: 'SELF_ACCEPTED' | 'REQUESTED_OTHER' | 'OTHER_ACCEPTED' | 'DECLINED';
  /** A user closing the flow is not independent proof of care quality or arrival. */
  readonly meetingEvidence?: 'LOCAL_CLOSE' | 'ADULT_SELF_REPORT' | 'OBSERVER_REPORT';
  readonly requestId?: string;
}

export interface ChildFacingHugPresentation {
  /** 适合朗读给 6 岁儿童的清晰事实陈述 */
  readonly spokenText: string;
  /** 简明视觉辅助文案 */
  readonly displayText: string;
  /** 界面是否应退场（当真人已在身边时为 true） */
  readonly shouldStepBack: boolean;
  /** 当大人尚未到场时，提供给儿童的安全、平静等待微行动 */
  readonly safeWaitingAction: string;
}
