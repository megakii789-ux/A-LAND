import { SupportLevel } from '../scaffolding/types';

/**
 * 允许记录的研究事件 (Phase K 交互契约):
 * 1. participant pseudonymous id
 * 2. session id
 * 3. content id
 * 4. structure id
 * 5. support level S0-S5
 * 6. failure code F1-F7
 * 7. latency bucket
 * 8. exit/skip
 * 9. coarse emotional load
 * 10. adult intervention type
 */

export enum FailureCode {
  NONE = 'NONE',                                 // 顺利完成
  ATTENTION_DROP = 'ATTENTION_DROP',             // 注意力转移（6岁儿童正常生理节律）
  EMOTIONAL_OVERLOAD = 'EMOTIONAL_OVERLOAD',     // 情绪负荷超出容忍窗
  TASK_CONFUSION = 'TASK_CONFUSION',             // 对指导语产生疑惑
  TECHNICAL_ABORT = 'TECHNICAL_ABORT',           // 网络/误触设备原因中断
}

export enum CoarseLatencyBucket {
  FAST_UNDER_5S = 'FAST_UNDER_5S',               // 直觉反应 (<5s)
  NORMAL_5_30S = 'NORMAL_5_30S',                 // 正常阅读与交互节奏 (5-30s)
  DELIBERATE_30_90S = 'DELIBERATE_30_90S',       // 深思熟虑或口头交流 (30-90s)
  EXTENDED_OVER_90S = 'EXTENDED_OVER_90S',       // 长时间停留或成人讨论 (>90s)
}

export enum ExitType {
  COMPLETED = 'COMPLETED',                       // 正常探索完成
  SKIPPED = 'SKIPPED',                           // 儿童主动跳过
  ABORTED_BY_CHILD = 'ABORTED_BY_CHILD',         // 儿童主动返回/退出
  ADULT_INTERVENED = 'ADULT_INTERVENED',         // 成人接入/中断
}

export enum CoarseEmotionalLoad {
  CALM = 'CALM',                                 // 平稳、好奇
  MILD_TENSION = 'MILD_TENSION',                 // 轻度紧张、思考性停顿
  HEAVY_UPSET = 'HEAVY_UPSET',                   // 明显沮丧、抽泣
  SHUTDOWN = 'SHUTDOWN',                         // 退缩、无反应（需成人立即现实介入）
}

export enum AdultInterventionType {
  NONE = 'NONE',                                 // 无成人介入，独立完成
  OBSERVING_PRESENCE = 'OBSERVING_PRESENCE',     // 成人在旁温和注视，不发言
  VERBAL_ENCOURAGEMENT = 'VERBAL_ENCOURAGEMENT', // 简短言语鼓励，不给答案
  CO_REGULATION_BREATHING = 'CO_REGULATION_BREATHING', // 带领深呼吸/身体放松
  READING_PROMPT = 'READING_PROMPT',             // 协助朗读题面文字
  FULL_SUPPORT_TAKEOVER = 'FULL_SUPPORT_TAKEOVER', // 接管现实生活并退出应用
}

export interface ResearchEvent {
  /** 1. 匿名受试者伪 ID (例如 "child_anon_8f3a") */
  readonly participantPseudonymousId: string;
  /** 2. 会话 ID (例如 "sess_20261009_001") */
  readonly sessionId: string;
  /** 3. 内容唯一标识符 */
  readonly contentId: string;
  /** 4. 认知结构注册码 */
  readonly structureId: string;
  /** 5. 支架级别 (S0 - S5) */
  readonly supportLevel: SupportLevel;
  /** 6. 障碍归因编码 (FailureCode) */
  readonly failureCode: FailureCode;
  /** 7. 粗粒度耗时桶 */
  readonly latencyBucket: CoarseLatencyBucket;
  /** 8. 离开/跳过类型 */
  readonly exitType: ExitType;
  /** 9. 粗粒度情绪负荷 */
  readonly coarseEmotionalLoad: CoarseEmotionalLoad;
  /** 10. 成人干预类型 */
  readonly adultInterventionType: AdultInterventionType;
  /** 事件记录时间戳 (epoch ms) */
  readonly timestamp: number;
}

export interface SanitizedResearchRecord {
  readonly recordId: string;
  readonly event: ResearchEvent;
}

/**
 * 严格禁止渗入字段黑名单：
 * raw voice, transcript, drawing content, free text child answer,
 * diagnostic label, personality score, mental-health prediction
 */
export const FORBIDDEN_RESEARCH_FIELDS: ReadonlyArray<string> = [
  'rawVoice',
  'rawAudio',
  'voiceRecording',
  'voiceprint',
  'transcript',
  'transcription',
  'drawingContent',
  'drawingData',
  'freeTextChildAnswer',
  'childAnswer',
  'freeText',
  'diagnosticLabel',
  'diagnosis',
  'personalityScore',
  'personalityType',
  'mentalHealthPrediction',
  'mentalHealthScore',
  'traumaScore',
  'iqScore',
  'abilityScore',
  'transferIndex',
  'childRealName',
  'childName',
  'gps',
  'exactLocation',
];
