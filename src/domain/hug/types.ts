/**
 * PHASE F & R3-02 — Hug & Co-Presence Domain Types
 * Strictly follows docs/PRODUCT_CONTRACTS.md (Section 2: 抱抱契约) & AG-R3 R3-02
 *
 * Three Independent Dimensions:
 * 1. CommunicationStatus: 通信状态（在无远程中继版本中，严禁伪造已送达/已收到）
 * 2. CareResponsibility: 照护责任（谁来接手照护）
 * 3. CoPresenceStatus: 共处状态（真人是否已经来到孩子身边）
 */

export enum HugRequestType {
  /** 即时求助：我现在需要身边的大人抱抱我/帮帮我 */
  INSTANT_HELP = 'INSTANT_HELP',
  /** 本地想念：我想念远方的大人（放进本地想念盒，不等于即时传唤） */
  ASYNC_MISS = 'ASYNC_MISS',
}

export enum CommunicationStatus {
  UNSENT = 'UNSENT',
  SENDING = 'SENDING',
  SENT = 'SENT',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  SEND_FAILED = 'SEND_FAILED',
}

export enum CareResponsibility {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED_SELF = 'ASSIGNED_SELF',
  ASSIGNED_OTHER = 'ASSIGNED_OTHER',
  ESCALATED_FALLBACK = 'ESCALATED_FALLBACK',
  CANNOT_ATTEND = 'CANNOT_ATTEND',
}

export enum CoPresenceStatus {
  NOT_PRESENT = 'NOT_PRESENT',
  ON_THE_WAY = 'ON_THE_WAY',
  UNCONFIRMED = 'UNCONFIRMED',
  ARRIVED_CONFIRMED = 'ARRIVED_CONFIRMED',
}

export interface HugDomainState {
  readonly requestType: HugRequestType;
  readonly communication: CommunicationStatus;
  readonly care: CareResponsibility;
  readonly coPresence: CoPresenceStatus;
  readonly targetCaregiverName?: string;
  readonly message?: string;
}

export interface ChildHugPresentation {
  /** 面向 6 岁儿童的语音播报文案（仅陈述已知事实，严禁预测性承诺与虚假远程送达） */
  readonly spokenText: string;
  /** 面向 6 岁儿童的简短辅助文字 */
  readonly displayText: string;
  /** 在真人尚未到场时，提供给孩子的安全自主过渡小建议 */
  readonly safeWaitingAction: string;
  /** 当真人已到场确认（ARRIVED_CONFIRMED）时，App 是否必须主动退场（Step Back） */
  readonly shouldStepBack: boolean;
}

export type LocalHugSupportMode = 'SEEK_NEARBY_ADULT' | 'LOCAL_MISS_NOTE';

export interface LocalHugSupportRecord {
  id: string;
  mode: LocalHugSupportMode;
  targetLabel: '身边的大人' | '爸爸' | '妈妈';
  noteText?: string;
  persistenceStatus: 'SESSION_MEMORY_ONLY' | 'LOCAL_STORAGE_SAVED';
  createdAtIso: string;
}
