import { describe, it, expect } from 'vitest';
import {
  evaluateWeatherGuidance,
  isHeavyWeather,
  assertNoDiagnosticLabel,
  SoilWeatherState
} from '../../src/domain/weather/soilWeatherContract';

describe('PHASE E — Soil / Weather Flow Contract (情绪天气与土壤契约)', () => {
  // 1. “我不想选”是完整合法路径
  it('Contract: “我不想选”是完整合法路径，不惩罚，不强加干涉', () => {
    const optOutState: SoilWeatherState = {
      primary: 'opt_out',
      intensityLevel: 'gentle',
      bodySensations: []
    };

    const guidance = evaluateWeatherGuidance(optOutState);

    expect(guidance.allowHeavyContentRecommendation).toBe(true);
    expect(guidance.suggestedContentWeight).toBe('open_all');
    expect(guidance.isHighIntensityOrHeavy).toBe(false);
    expect(guidance.offerCalmCorner).toBe(true); // 永远可达
    expect(guidance.childGentleExplanation).toContain('不想选完全没关系');
  });

  // 2. 雨天 / 雷雨仍能安全退出，且不强制进入平静角
  it('Contract: rain/thunder 仍能安全退出，提供和大人一起与平静角，但可自由留在小岛', () => {
    const stormyState: SoilWeatherState = {
      primary: 'stormy',
      intensityLevel: 'intense',
      bodySensations: ['肚子紧紧的', '头热热的']
    };

    const guidance = evaluateWeatherGuidance(stormyState);

    // 处于高负荷状态
    expect(guidance.isHighIntensityOrHeavy).toBe(true);
    // 不主动推荐新的重负荷内容
    expect(guidance.allowHeavyContentRecommendation).toBe(false);
    expect(guidance.suggestedContentWeight).toBe('light_only');
    // 提供大人支持与平静角邀请
    expect(guidance.offerAdultSupport).toBe(true);
    expect(guidance.offerCalmCorner).toBe(true);

    // 当孩子明确拒绝平静角时，绝不循环强推
    const declinedState: SoilWeatherState = {
      ...stormyState,
      calmCornerDeclined: true
    };
    const declinedGuidance = evaluateWeatherGuidance(declinedState);
    expect(declinedGuidance.offerCalmCorner).toBe(false); // 不再循环强推平静角
  });

  it('Contract: 普通雨天轻微强度不应过度限制', () => {
    const lightRainState: SoilWeatherState = {
      primary: 'rainy',
      intensityLevel: 'gentle',
      bodySensations: ['眼眶湿湿的']
    };

    const guidance = evaluateWeatherGuidance(lightRainState);
    expect(guidance.isHighIntensityOrHeavy).toBe(false);
    expect(guidance.allowHeavyContentRecommendation).toBe(true);
    expect(guidance.suggestedContentWeight).toBe('open_all');
  });

  // 3. 不存在 sunny-only reward (选晴解锁，选雨拿走内容)
  it('Contract: 不存在 sunny-only reward（晴天绝不能是独占内容的前提条件）', () => {
    const sunnyState: SoilWeatherState = {
      primary: 'sunny',
      intensityLevel: 'medium',
      bodySensations: ['全身松松的']
    };

    const rainyState: SoilWeatherState = {
      primary: 'rainy',
      intensityLevel: 'gentle',
      bodySensations: ['全身松松的']
    };

    const sunnyGuidance = evaluateWeatherGuidance(sunnyState);
    const rainyGuidance = evaluateWeatherGuidance(rainyState);

    // 晴天和轻雨天都开放内容，不存在晴天独占特权
    expect(sunnyGuidance.suggestedContentWeight).toBe(rainyGuidance.suggestedContentWeight);
    expect(sunnyGuidance.allowHeavyContentRecommendation).toBe(true);
  });

  // 4. 无自动心理标签 / 临床诊断
  it('Contract: 绝对禁止从天气记录自动推断心理疾病、人格缺陷或临床标签', () => {
    const outputsToCheck = [
      '你现在像一团暴风雷电，肚子里有火。',
      '可以难过，可以生气，可以大哭。所有的感受都可以有。',
      '我就在这儿陪着你，我们一起等云朵变轻、等雨小一点。',
      '今天的小岛阳光刚刚好，随心探索吧。',
      '不想选完全没关系，你想玩什么都可以。',
      '现在先照顾好感觉，我们慢慢来，玩点轻松的或者抱一抱。'
    ];

    for (const text of outputsToCheck) {
      expect(assertNoDiagnosticLabel(text)).toBe(true);
    }

    // 反向测试确保诊断检测器有效拦截
    expect(assertNoDiagnosticLabel('该儿童表现出明显的抑郁状态')).toBe(false);
    expect(assertNoDiagnosticLabel('可能有创伤和多动症倾向')).toBe(false);
    expect(assertNoDiagnosticLabel('表现出人格缺陷')).toBe(false);
  });

  // 5. 强度判断纯函数正确性
  it('Contract: isHeavyWeather 纯函数精确覆盖雷雨、强降雨与强烈强度', () => {
    expect(isHeavyWeather('opt_out', 'intense')).toBe(false); // opt_out 不算 heavy
    expect(isHeavyWeather('stormy', 'gentle')).toBe(true); // 雷雨恒为 heavy
    expect(isHeavyWeather('stormy', 'intense')).toBe(true);
    expect(isHeavyWeather('rainy', 'gentle')).toBe(false);
    expect(isHeavyWeather('rainy', 'medium')).toBe(true);
    expect(isHeavyWeather('rainy', 'intense')).toBe(true);
    expect(isHeavyWeather('sunny', 'gentle')).toBe(false);
    expect(isHeavyWeather('sunny', 'intense')).toBe(true); // 极端高躁动/极度强烈时降负荷
    expect(isHeavyWeather('cloudy', 'gentle')).toBe(false);
    expect(isHeavyWeather('foggy', 'medium')).toBe(false);
  });
});
