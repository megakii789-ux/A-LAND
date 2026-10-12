import { describe, it, expect, beforeEach } from 'vitest';
import {
  ResearchEvent,
  FailureCode,
  CoarseLatencyBucket,
  ExitType,
  CoarseEmotionalLoad,
  AdultInterventionType,
  validateResearchEvent,
  InMemoryEventSink,
  assertNoUnverifiedPsychologicalMetricsInParentUI,
} from '../../src/domain/research';
import { SupportLevel } from '../../src/domain/scaffolding';
import { StructureId } from '../../src/domain/transfer';

describe('Phase K: Research Event Layer & EventSink', () => {
  let sink: InMemoryEventSink;

  beforeEach(() => {
    sink = new InMemoryEventSink();
  });

  const sampleValidEvent: ResearchEvent = {
    participantPseudonymousId: 'child_anon_9a4f',
    sessionId: 'sess_20261009_001',
    contentId: 'fact_infer_train_1',
    structureId: StructureId.FACT_VS_INFERENCE,
    supportLevel: SupportLevel.S1_IMPLICIT_PROMPT,
    failureCode: FailureCode.NONE,
    latencyBucket: CoarseLatencyBucket.NORMAL_5_30S,
    exitType: ExitType.COMPLETED,
    coarseEmotionalLoad: CoarseEmotionalLoad.CALM,
    adultInterventionType: AdultInterventionType.OBSERVING_PRESENCE,
    timestamp: 1791550000000,
  };

  it('CONTRACT: 严格允许 10 个标准研究白名单字段，检验通过', async () => {
    const val = validateResearchEvent(sampleValidEvent);
    expect(val.isValid).toBe(true);
    expect(val.errors).toHaveLength(0);

    const recordRes = await sink.recordEvent(sampleValidEvent);
    expect(recordRes.success).toBe(true);
    expect(recordRes.eventId).toBeDefined();

    const events = await sink.getEventsByParticipant('child_anon_9a4f');
    expect(events).toHaveLength(1);
    expect(events[0].participantPseudonymousId).toBe('child_anon_9a4f');
  });

  it('CRITICAL CONTRACT: 严禁 raw voice, transcript, drawing content, free text 渗入', async () => {
    const leakedEvent = {
      ...sampleValidEvent,
      rawVoice: 'http://cdn/audio/voice_sample.wav',
      transcript: '孩子说：我不喜欢小兔子',
      drawingContent: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      freeTextChildAnswer: '因为妈妈在生我的气',
    };

    const val = validateResearchEvent(leakedEvent);
    expect(val.isValid).toBe(false);
    expect(val.errors.some((e) => e.includes('rawVoice'))).toBe(true);
    expect(val.errors.some((e) => e.includes('transcript'))).toBe(true);
    expect(val.errors.some((e) => e.includes('drawingContent'))).toBe(true);
    expect(val.errors.some((e) => e.includes('freeTextChildAnswer'))).toBe(true);

    const recordRes = await sink.recordEvent(leakedEvent as unknown as ResearchEvent);
    expect(recordRes.success).toBe(false);
    expect(recordRes.error).toContain('Validation failed');
  });

  it('CRITICAL CONTRACT: 严禁 diagnostic label, personality score, mental-health prediction', async () => {
    const diagnosticEvent = {
      ...sampleValidEvent,
      diagnosticLabel: 'ADHD_ATTENTION_DEFICIT',
      personalityScore: 'INTROVERT_82',
      mentalHealthPrediction: 'HIGH_ANXIETY_RISK',
      abilityScore: 92,
      transferIndex: 0.88,
    };

    const val = validateResearchEvent(diagnosticEvent);
    expect(val.isValid).toBe(false);
    expect(val.errors.some((e) => e.includes('diagnosticLabel'))).toBe(true);
    expect(val.errors.some((e) => e.includes('personalityScore'))).toBe(true);
    expect(val.errors.some((e) => e.includes('mentalHealthPrediction'))).toBe(true);
    expect(val.errors.some((e) => e.includes('abilityScore'))).toBe(true);
    expect(val.errors.some((e) => e.includes('transferIndex'))).toBe(true);
  });

  it('CONTRACT: Researcher Export 仅导出脱敏的结构化事件', async () => {
    await sink.recordEvent(sampleValidEvent);
    await sink.recordEvent({
      ...sampleValidEvent,
      participantPseudonymousId: 'child_anon_5c2b',
      contentId: 'choice_heldout',
      structureId: StructureId.CHOICE_TRADEOFF,
      supportLevel: SupportLevel.S0_INDEPENDENT,
      failureCode: FailureCode.NONE,
      latencyBucket: CoarseLatencyBucket.DELIBERATE_30_90S,
      exitType: ExitType.COMPLETED,
      coarseEmotionalLoad: CoarseEmotionalLoad.CALM,
      adultInterventionType: AdultInterventionType.NONE,
      timestamp: 1791550060000,
    });

    const exported = await sink.exportDeIdentifiedEvents();
    expect(exported).toHaveLength(2);

    for (const evt of exported) {
      // 导出的每个对象绝无敏感 key
      const keys = Object.keys(evt);
      expect(keys).not.toContain('rawVoice');
      expect(keys).not.toContain('transcript');
      expect(keys).not.toContain('childName');
      expect(keys).not.toContain('diagnosticLabel');
      expect(keys).not.toContain('mentalHealthPrediction');

      // 仅包含合规的 10 个核心字段 + timestamp
      expect(evt.participantPseudonymousId).toMatch(/^child_anon_/);
      expect(evt.sessionId).toBeDefined();
      expect(evt.contentId).toBeDefined();
      expect(evt.structureId).toBeDefined();
      expect(evt.supportLevel).toBeDefined();
      expect(evt.failureCode).toBeDefined();
      expect(evt.latencyBucket).toBeDefined();
      expect(evt.exitType).toBeDefined();
      expect(evt.coarseEmotionalLoad).toBeDefined();
      expect(evt.adultInterventionType).toBeDefined();
    }
  });

  describe('DELETION TESTS (符合隐私权与被遗忘权)', () => {
    it('支持按受试者伪 ID 彻底删除该受试者的所有记录 (deleteEventsByParticipant)', async () => {
      await sink.recordEvent(sampleValidEvent);
      await sink.recordEvent({
        ...sampleValidEvent,
        sessionId: 'sess_second_002',
        timestamp: 1791550120000,
      });
      await sink.recordEvent({
        ...sampleValidEvent,
        participantPseudonymousId: 'child_anon_OTHER',
        timestamp: 1791550180000,
      });

      const allBefore = await sink.exportDeIdentifiedEvents();
      expect(allBefore).toHaveLength(3);

      // 删除 child_anon_9a4f
      const deleteResult = await sink.deleteEventsByParticipant('child_anon_9a4f');
      expect(deleteResult.deletedCount).toBe(2);

      const afterEvents = await sink.getEventsByParticipant('child_anon_9a4f');
      expect(afterEvents).toHaveLength(0);

      // 其他受试者的数据不受影响
      const otherEvents = await sink.getEventsByParticipant('child_anon_OTHER');
      expect(otherEvents).toHaveLength(1);
    });

    it('支持按会话 ID 删除记录 (deleteEventsBySession)', async () => {
      await sink.recordEvent(sampleValidEvent);
      await sink.recordEvent({
        ...sampleValidEvent,
        sessionId: 'sess_to_delete',
        timestamp: 1791550200000,
      });

      const delSessionRes = await sink.deleteEventsBySession('sess_to_delete');
      expect(delSessionRes.deletedCount).toBe(1);

      const remaining = await sink.exportDeIdentifiedEvents({ sessionId: 'sess_to_delete' });
      expect(remaining).toHaveLength(0);
    });

    it('支持一键清空所有研究事件 (clearAllEvents)', async () => {
      await sink.recordEvent(sampleValidEvent);
      const clearRes = await sink.clearAllEvents();
      expect(clearRes.clearedCount).toBe(1);

      const all = await sink.exportDeIdentifiedEvents();
      expect(all).toHaveLength(0);
    });
  });

  describe('UI SAFETY CHECK: 禁止向家长显示未经验证的心理/能力分数指标', () => {
    it('命中“孩子能力等级”、“孩子通能力 67 分”、“迁移指数”等伪心理指标时必须 fail', () => {
      const unsafeUIs = [
        '本周孩子能力等级为 L3',
        '报告：孩子通能力 67 分',
        '今日测评：迁移指数达到 85%',
        '系统诊断：心理评分 72 分',
      ];

      for (const text of unsafeUIs) {
        const check = assertNoUnverifiedPsychologicalMetricsInParentUI(text);
        expect(check.passed).toBe(false);
        expect(check.violations.length).toBeGreaterThan(0);
      }
    });

    it('正向合规的质性描述与事实频次统计通过检查', () => {
      const safeUI = '本周共记录 6 次心晴，孩子自主进行了 4 次分一分思考实践，遇到挫折后能自主回归平静的自然节律。';
      const check = assertNoUnverifiedPsychologicalMetricsInParentUI(safeUI);
      expect(check.passed).toBe(true);
      expect(check.violations).toHaveLength(0);
    });
  });
});
