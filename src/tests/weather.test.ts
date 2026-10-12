import { describe, it, expect } from 'vitest';
import {
  evaluateWeatherGuidance,
  SoilWeatherState
} from '../domain/weather/soilWeatherContract';

describe('Weather Navigation & Peace Corner Exit Tests', () => {
  it('verifies "I don\'t want to select" (opt_out) acts as a complete, safe navigation path without penalty or forced intervention', () => {
    const optOutState: SoilWeatherState = {
      primary: 'opt_out',
      intensityLevel: 'gentle',
      bodySensations: []
    };

    const guidance = evaluateWeatherGuidance(optOutState);

    // 完整的导航路径：允许开放浏览所有内容、不被视为高负荷、无惩罚
    expect(guidance.allowHeavyContentRecommendation).toBe(true);
    expect(guidance.suggestedContentWeight).toBe('open_all');
    expect(guidance.isHighIntensityOrHeavy).toBe(false);

    // 随时可达平静角与安心提示，同时说明“不想选完全没关系”
    expect(guidance.offerCalmCorner).toBe(true);
    expect(guidance.childGentleExplanation).toContain('不想选完全没关系');
  });

  it('verifies rain and thunder weather states allow safe exit and access to the peace corner without locking the child in', () => {
    // 1. 处于强降雨/雷雨天气状态
    const rainyState: SoilWeatherState = {
      primary: 'rainy',
      intensityLevel: 'intense',
      bodySensations: ['眼眶湿湿的', '心里紧紧的']
    };

    const thunderState: SoilWeatherState = {
      primary: 'stormy',
      intensityLevel: 'intense',
      bodySensations: ['胸口闷闷的', '想大喊大叫']
    };

    const rainGuidance = evaluateWeatherGuidance(rainyState);
    const thunderGuidance = evaluateWeatherGuidance(thunderState);

    // 两种重负荷天气均安全地提供平静角出口
    expect(rainGuidance.offerCalmCorner).toBe(true);
    expect(thunderGuidance.offerCalmCorner).toBe(true);

    // 在低/中轻度负荷下仍提供轻量内容支持，不阻断页面正常退出导航
    expect(rainGuidance.suggestedContentWeight).toBe('light_only');
    expect(thunderGuidance.suggestedContentWeight).toBe('light_only');

    // 2. 当孩子选择不进入平静角 (calmCornerDeclined) 时，系统尊重选择，允许自由退出并留在小岛
    const declinedThunderState: SoilWeatherState = {
      ...thunderState,
      calmCornerDeclined: true
    };

    const declinedGuidance = evaluateWeatherGuidance(declinedThunderState);
    expect(declinedGuidance.offerCalmCorner).toBe(false); // 不强制绑定，安全退出至自由浏览
  });

  it('verifies that no "sunny-only" rewards or unlocks are triggered by selecting specific weather states, adhering to the non-incentivized design contract', () => {
    const sunnyState: SoilWeatherState = {
      primary: 'sunny',
      intensityLevel: 'gentle',
      bodySensations: ['身体松松的']
    };

    const rainyState: SoilWeatherState = {
      primary: 'rainy',
      intensityLevel: 'gentle',
      bodySensations: ['身体松松的']
    };

    const cloudyState: SoilWeatherState = {
      primary: 'cloudy',
      intensityLevel: 'gentle',
      bodySensations: ['身体松松的']
    };

    const sunnyGuidance = evaluateWeatherGuidance(sunnyState);
    const rainyGuidance = evaluateWeatherGuidance(rainyState);
    const cloudyGuidance = evaluateWeatherGuidance(cloudyState);

    // 核心契约：选择“晴天”绝不能赋予超越其他正向/中性情绪天气的独占特权或特权解锁
    expect(sunnyGuidance.suggestedContentWeight).toBe(rainyGuidance.suggestedContentWeight);
    expect(sunnyGuidance.suggestedContentWeight).toBe(cloudyGuidance.suggestedContentWeight);

    expect(sunnyGuidance.allowHeavyContentRecommendation).toBe(true);
    expect(rainyGuidance.allowHeavyContentRecommendation).toBe(true);
    expect(cloudyGuidance.allowHeavyContentRecommendation).toBe(true);

    // 不存在将晴天判断为“更好”或“答对”的价值奖励评语
    expect(sunnyGuidance.childGentleExplanation).not.toContain('真棒');
    expect(sunnyGuidance.childGentleExplanation).not.toContain('做对了');
    expect(sunnyGuidance.childGentleExplanation).not.toContain('奖励');
  });

  it('契约验证：选择任何天气状态时绝对不存在隐藏的激励或惩罚（如解锁额外专属内容、扣除积分资源或限制正常功能）', () => {
    const allWeatherTypes: Array<SoilWeatherState['primary']> = [
      'sunny',
      'cloudy',
      'rainy',
      'stormy',
      'foggy',
      'opt_out'
    ];

    // 1. 验证常规温和强度下的开放性契约
    const gentleResults = allWeatherTypes.map((type) => ({
      type,
      guidance: evaluateWeatherGuidance({
        primary: type,
        intensityLevel: 'gentle',
        bodySensations: []
      })
    }));

    for (const res of gentleResults) {
      if (res.type === 'stormy') {
        // 雷雨状态天然触发高负荷照顾模式，但绝不扣除资源
        expect(res.guidance.suggestedContentWeight).toBe('light_only');
      } else {
        expect(res.guidance.allowHeavyContentRecommendation).toBe(true);
        expect(res.guidance.suggestedContentWeight).toBe('open_all');
      }
    }

    // 2. 验证系统结构中绝对不存在积分 (score/point)、金币 (coin)、扣分 (penalty/deduct)、隐藏解锁 (bonus) 等游戏化成瘾数据结构
    for (const res of gentleResults) {
      const stringified = JSON.stringify(res.guidance);
      expect(stringified).not.toContain('score');
      expect(stringified).not.toContain('point');
      expect(stringified).not.toContain('coin');
      expect(stringified).not.toContain('penalty');
      expect(stringified).not.toContain('deduct');
      expect(stringified).not.toContain('reward');
      expect(stringified).not.toContain('unlock_bonus');
    }

    // 3. 验证即使在重负荷（stormy）下，引导理由依然是照顾儿童情绪负荷（“先照顾好感觉”），而非惩罚或封禁
    const stormyGuidance = evaluateWeatherGuidance({
      primary: 'stormy',
      intensityLevel: 'intense',
      bodySensations: ['胸口闷闷的']
    });
    expect(stormyGuidance.childGentleExplanation).toContain('先照顾好感觉');
    expect(stormyGuidance.offerAdultSupport).toBe(true);
  });
});
