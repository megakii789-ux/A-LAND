/**
 * Domain Contract: Soil / Weather Flow (情绪天气与土壤契约)
 * 
 * 契约核心原则:
 * 1. 天气仅作为自我表达、降低内容负荷信号、邀请成人/平静角信号。
 * 2. 绝非游戏化奖励条件（绝不存在选晴天解锁有趣内容、选雨天内容被拿走）。
 * 3. 晴 / 阴 / 雨 / 雷 / 雾 / 我不想选。
 * 4. “我不想选”是完整合法路径，尊重儿童选择。
 * 5. 支持 intensity（轻柔 / 中等 / 强烈），但不对孩子显示数字分数。
 * 6. 高强度（如雷雨、大雨或强风浪）：
 *    - 不主动推荐新的重负荷思考叶，降低认知负担；
 *    - 主动提供“和大人一起”与“平静角”温和邀请；
 *    - 随时允许正常安全退出，随时可选择轻量内容；
 *    - 不强迫孩子去平静角；如果拒绝，绝不反复循环推荐。
 * 7. 严禁从天气推断心理疾病、人格或自动化临床诊断（无自动心理标签）。
 */

export type WeatherOptionType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'opt_out';

export type WeatherIntensityLevel = 'gentle' | 'medium' | 'intense';

export interface SoilWeatherState {
  primary: WeatherOptionType;
  secondary?: WeatherOptionType | null;
  intensityLevel: WeatherIntensityLevel;
  bodySensations: string[];
  calmCornerDeclined?: boolean; // 孩子是否明确拒绝去平静角
}

export interface WeatherContentGuidance {
  /** 允许推荐新重负荷情境吗？高负荷时不主动推荐 */
  allowHeavyContentRecommendation: boolean;
  /** 是否提供和大人一起的选项 */
  offerAdultSupport: boolean;
  /** 是否提供平静角邀请 */
  offerCalmCorner: boolean;
  /** 适合推荐的内容负荷级别 */
  suggestedContentWeight: 'light_only' | 'open_all';
  /** 是否是高负荷天气 */
  isHighIntensityOrHeavy: boolean;
  /** 孩子友好解释，无诊断术语 */
  childGentleExplanation: string;
}

/**
 * 判断是否为高负荷状态（雷雨、高强度小雨、或 intense 级别）
 */
export function isHeavyWeather(
  primary: WeatherOptionType,
  intensity: WeatherIntensityLevel
): boolean {
  if (primary === 'opt_out') {
    return false;
  }
  if (primary === 'stormy') {
    return true;
  }
  if (primary === 'rainy' && (intensity === 'medium' || intensity === 'intense')) {
    return true;
  }
  if (intensity === 'intense') {
    return true;
  }
  return false;
}

/**
 * 纯函数：根据当前天气状态计算内容引导策略
 * 绝不存在“选晴 = 解锁有趣内容；选雨 = 内容被拿走”
 */
export function evaluateWeatherGuidance(
  state: SoilWeatherState
): WeatherContentGuidance {
  // 1. “我不想选”完整路径：不强加任何干涉，所有内容自由开放，不带任何标签
  if (state.primary === 'opt_out') {
    return {
      allowHeavyContentRecommendation: true,
      offerAdultSupport: false,
      offerCalmCorner: true, // 平静角仍然永远可去
      suggestedContentWeight: 'open_all',
      isHighIntensityOrHeavy: false,
      childGentleExplanation: '不想选完全没关系，你想玩什么都可以。'
    };
  }

  const isHeavy = isHeavyWeather(state.primary, state.intensityLevel);

  // 2. 高强度/重天气：降低内容负荷，提供成人陪伴与平静角，但不强迫，不没收
  if (isHeavy) {
    // 孩子如果已经表达过拒绝去平静角，绝不循环强推
    const shouldOfferCalm = !state.calmCornerDeclined;

    return {
      allowHeavyContentRecommendation: false, // 不主动塞入新的重任务
      offerAdultSupport: true,
      offerCalmCorner: shouldOfferCalm,
      suggestedContentWeight: 'light_only',
      isHighIntensityOrHeavy: true,
      childGentleExplanation: '现在先照顾好感觉，我们慢慢来，玩点轻松的或者抱一抱。'
    };
  }

  // 3. 常规天气（晴、阴、雾、轻雨）
  return {
    allowHeavyContentRecommendation: true,
    offerAdultSupport: false,
    offerCalmCorner: true,
    suggestedContentWeight: 'open_all',
    isHighIntensityOrHeavy: false,
    childGentleExplanation: '今天的小岛阳光刚刚好，随心探索吧。'
  };
}

/**
 * 安全校验：绝对禁止任何自动心理病理化标签
 * 验证任何输出均不包含心理疾病、抑郁、多动、创伤等诊断词汇
 */
export function assertNoDiagnosticLabel(text: string): boolean {
  const forbiddenTerms = [
    '抑郁', '焦虑症', '自闭', '多动症', '对立违抗', '创伤', '心理障碍',
    '心理疾病', '人格缺陷', '病态', '非正常', '异常心理', '双相', 'PTSD'
  ];
  return !forbiddenTerms.some(term => text.includes(term));
}
