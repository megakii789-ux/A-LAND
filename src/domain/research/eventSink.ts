import {
  ResearchEvent,
  FORBIDDEN_RESEARCH_FIELDS,
  FailureCode,
  CoarseLatencyBucket,
  ExitType,
  CoarseEmotionalLoad,
  AdultInterventionType,
} from './types';
import { SupportLevel } from '../scaffolding/types';

/**
 * 校验 ResearchEvent 对象是否严格符合 Phase K 隐私与数据最小化契约
 */
export function validateResearchEvent(
  event: unknown
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!event || typeof event !== 'object') {
    return { isValid: false, errors: ['Event must be a non-null object'] };
  }

  const e = event as Record<string, unknown>;

  // 1. 必填白名单字段检查
  if (typeof e.participantPseudonymousId !== 'string' || e.participantPseudonymousId.trim().length === 0) {
    errors.push('participantPseudonymousId is required');
  }

  if (typeof e.sessionId !== 'string' || e.sessionId.trim().length === 0) {
    errors.push('sessionId is required');
  }

  if (typeof e.contentId !== 'string' || e.contentId.trim().length === 0) {
    errors.push('contentId is required');
  }

  if (typeof e.structureId !== 'string' || e.structureId.trim().length === 0) {
    errors.push('structureId is required');
  }

  if (!Object.values(SupportLevel).includes(e.supportLevel as SupportLevel)) {
    errors.push(`supportLevel is invalid: ${String(e.supportLevel)}`);
  }

  if (!Object.values(FailureCode).includes(e.failureCode as FailureCode)) {
    errors.push(`failureCode is invalid: ${String(e.failureCode)}`);
  }

  if (!Object.values(CoarseLatencyBucket).includes(e.latencyBucket as CoarseLatencyBucket)) {
    errors.push(`latencyBucket is invalid: ${String(e.latencyBucket)}`);
  }

  if (!Object.values(ExitType).includes(e.exitType as ExitType)) {
    errors.push(`exitType is invalid: ${String(e.exitType)}`);
  }

  if (!Object.values(CoarseEmotionalLoad).includes(e.coarseEmotionalLoad as CoarseEmotionalLoad)) {
    errors.push(`coarseEmotionalLoad is invalid: ${String(e.coarseEmotionalLoad)}`);
  }

  if (!Object.values(AdultInterventionType).includes(e.adultInterventionType as AdultInterventionType)) {
    errors.push(`adultInterventionType is invalid: ${String(e.adultInterventionType)}`);
  }

  if (typeof e.timestamp !== 'number' || isNaN(e.timestamp)) {
    errors.push('timestamp must be a valid number');
  }

  // 2. 黑名单字段严格防护：绝不允许携带任何自由文本、音频、绘图、心理诊断或能力得分
  for (const forbiddenKey of FORBIDDEN_RESEARCH_FIELDS) {
    if (forbiddenKey in e) {
      errors.push(`PROHIBITED FIELD DETECTED: "${forbiddenKey}" violates research privacy contract`);
    }
  }

  // 额外模糊扫描：检查 key 中是否包含禁止词根
  const prohibitedRoots = ['voice', 'audio', 'transcript', 'drawing', 'diagnostic', 'personality', 'mentalhealth', 'score'];
  for (const key of Object.keys(e)) {
    const lowerKey = key.toLowerCase();
    for (const root of prohibitedRoots) {
      if (lowerKey.includes(root)) {
        errors.push(`PROHIBITED ROOT DETECTED in property "${key}"`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * EventSink 接口：遵循提供者抽象 (Provider Interface)
 */
export interface EventSink {
  /** 写入单个研究事件 */
  recordEvent(event: ResearchEvent): Promise<{ success: boolean; eventId?: string; error?: string }>;
  /** 查询指定受试者的所有事件 */
  getEventsByParticipant(participantPseudonymousId: string): Promise<ReadonlyArray<ResearchEvent>>;
  /** 导出脱敏的结构化事件 */
  exportDeIdentifiedEvents(options?: { sessionId?: string }): Promise<ReadonlyArray<ResearchEvent>>;
  /** 删除指定受试者的所有事件 (符合 GDPR/儿童被遗忘权) */
  deleteEventsByParticipant(participantPseudonymousId: string): Promise<{ deletedCount: number }>;
  /** 删除指定会话的所有事件 */
  deleteEventsBySession(sessionId: string): Promise<{ deletedCount: number }>;
  /** 清空所有事件 */
  clearAllEvents(): Promise<{ clearedCount: number }>;
}

/**
 * 内存/本地持久化 EventSink 实现 (遵守数据最小化与脱敏导出)
 */
export class InMemoryEventSink implements EventSink {
  private events: ResearchEvent[] = [];

  async recordEvent(event: ResearchEvent): Promise<{ success: boolean; eventId?: string; error?: string }> {
    const validation = validateResearchEvent(event);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join('; ')}`,
      };
    }

    // 严密深拷贝并清除任何附加属性，只保留纯净的 10 个契约字段 + timestamp
    const cleanEvent: ResearchEvent = {
      participantPseudonymousId: event.participantPseudonymousId,
      sessionId: event.sessionId,
      contentId: event.contentId,
      structureId: event.structureId,
      supportLevel: event.supportLevel,
      failureCode: event.failureCode,
      latencyBucket: event.latencyBucket,
      exitType: event.exitType,
      coarseEmotionalLoad: event.coarseEmotionalLoad,
      adultInterventionType: event.adultInterventionType,
      timestamp: event.timestamp,
    };

    this.events.push(cleanEvent);
    return {
      success: true,
      eventId: `evt_${cleanEvent.timestamp}_${this.events.length}`,
    };
  }

  async getEventsByParticipant(participantPseudonymousId: string): Promise<ReadonlyArray<ResearchEvent>> {
    return this.events.filter((e) => e.participantPseudonymousId === participantPseudonymousId);
  }

  async exportDeIdentifiedEvents(options?: { sessionId?: string }): Promise<ReadonlyArray<ResearchEvent>> {
    let list = this.events;
    if (options?.sessionId) {
      list = list.filter((e) => e.sessionId === options.sessionId);
    }

    // 导出的每条事件均保证仅包含脱敏结构化字段
    return list.map((e) => ({
      participantPseudonymousId: e.participantPseudonymousId,
      sessionId: e.sessionId,
      contentId: e.contentId,
      structureId: e.structureId,
      supportLevel: e.supportLevel,
      failureCode: e.failureCode,
      latencyBucket: e.latencyBucket,
      exitType: e.exitType,
      coarseEmotionalLoad: e.coarseEmotionalLoad,
      adultInterventionType: e.adultInterventionType,
      timestamp: e.timestamp,
    }));
  }

  async deleteEventsByParticipant(participantPseudonymousId: string): Promise<{ deletedCount: number }> {
    const beforeCount = this.events.length;
    this.events = this.events.filter((e) => e.participantPseudonymousId !== participantPseudonymousId);
    return { deletedCount: beforeCount - this.events.length };
  }

  async deleteEventsBySession(sessionId: string): Promise<{ deletedCount: number }> {
    const beforeCount = this.events.length;
    this.events = this.events.filter((e) => e.sessionId !== sessionId);
    return { deletedCount: beforeCount - this.events.length };
  }

  async clearAllEvents(): Promise<{ clearedCount: number }> {
    const count = this.events.length;
    this.events = [];
    return { clearedCount: count };
  }
}

/**
 * 检验 UI 文案安全：严禁向家长显示“孩子能力等级”、“孩子通能力 67 分”、“迁移指数”等未经验证的心理指标
 */
export function assertNoUnverifiedPsychologicalMetricsInParentUI(
  uiText: string,
  prohibitedPhrases: string[] = [
    '孩子能力等级',
    '能力等级',
    '67分',
    '能力 67 分',
    '分能力',
    '通能力',
    '择能力',
    '迁移指数',
    '智商',
    '心理指数',
    '心理评分',
    '心理状态诊断',
    '性格缺陷',
    '创伤等级',
  ]
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];
  for (const phrase of prohibitedPhrases) {
    if (uiText.includes(phrase)) {
      violations.push(`Found unverified psychological/ranking metric: "${phrase}"`);
    }
  }
  return {
    passed: violations.length === 0,
    violations,
  };
}
