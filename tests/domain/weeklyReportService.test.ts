import { describe, it, expect } from 'vitest';
import {
  calculateWeeklyMetrics,
  generateLocalWeeklyReport,
  INSUFFICIENT_OBSERVATION_TEXT
} from '../../src/services/weeklyReportService';

describe('weeklyReportService Contract & AG-R5 Cumulative Reporting Tests', () => {
  it('SEC-07: emotionalStabilityScore 恒为 0，严禁心理打分与人格画像', () => {
    const metrics = calculateWeeklyMetrics({
      todayWeather: {
        id: 'w1',
        timestamp: new Date().toISOString(),
        primary: 'sunny',
        intensity: 2,
        bodySensations: ['放松'],
        calmingMethod: '深呼吸'
      },
      weatherHistory: [],
      parentObservations: [],
      completedLeaves: ['cup-size'],
      medals: [],
      hugCount: 2
    });

    expect(metrics.emotionalStabilityScore).toBe(0);
  });

  it('R3-01: 空数据绝不生成虚假天气或思考计数，必须返回真实 0', () => {
    const metrics = calculateWeeklyMetrics({
      todayWeather: null,
      weatherHistory: [],
      parentObservations: [],
      completedLeaves: [],
      medals: [],
      hugCount: 0
    });

    expect(metrics.totalWeatherLogs).toBe(0);
    expect(metrics.thinkingToolPractices).toBe(0);
    expect(metrics.fenCount).toBe(0);
    expect(metrics.tongCount).toBe(0);
    expect(metrics.zeCount).toBe(0);
  });

  it('AG-R5: 统一报告时间口径为“本机累计活动记录”，明确杜绝混用时间口径', () => {
    const report = generateLocalWeeklyReport({
      todayWeather: null,
      weatherHistory: [],
      parentObservations: [],
      completedLeaves: [],
      medals: [],
      hugCount: 0
    });

    expect(report.dateRange).toContain('本机累计活动记录');
    expect(report.executiveSummary).toContain('本机累计活动记录');
    expect(report.executiveSummary).toContain(INSUFFICIENT_OBSERVATION_TEXT);
  });

  it('AG-R5: 有效记录时仅客观呈现当次操作与观察计数，不声称心理能力已达成', () => {
    const report = generateLocalWeeklyReport({
      todayWeather: {
        id: 'w-today',
        timestamp: new Date().toISOString(),
        primary: 'cloudy',
        intensity: 3,
        bodySensations: ['胸口有点闷']
      },
      weatherHistory: [],
      parentObservations: [
        {
          id: 'obs-others-action',
          dimension: '对别人举动的说法',
          oldBehavior: '直接判定对方是故意的',
          targetBehavior: '先分清对方做了什么、自己想了什么',
          selfInitiatedCount: 2,
          lastObservedDate: '2026-10-14'
        }
      ],
      completedLeaves: ['cup-size'],
      medals: [],
      hugCount: 1
    });

    expect(report.totalWeatherLogs).toBe(1);
    expect(report.thinkingToolPractices).toBeGreaterThanOrEqual(1);
    expect(report.executiveSummary).toContain('客观呈现');
    expect(report.executiveSummary).toContain('不代表孩子已掌握某种稳定心理能力');
    expect(report.executiveSummary).not.toContain('心理评分');
  });
});
