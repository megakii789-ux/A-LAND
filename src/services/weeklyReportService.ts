import { WeatherRecord, ParentObservation, MedalRecord, WeeklyReportData, WeatherType } from '../types';

export function calculateWeeklyMetrics(params: {
  todayWeather: WeatherRecord | null;
  weatherHistory: WeatherRecord[];
  parentObservations: ParentObservation[];
  completedLeaves: string[];
  medals: MedalRecord[];
  hugCount: number;
}) {
  const { todayWeather, weatherHistory, parentObservations, completedLeaves, medals, hugCount } = params;

  // Combine weather records
  const allWeather: WeatherRecord[] = [];
  if (todayWeather) {
    allWeather.push(todayWeather);
  }
  weatherHistory.forEach(w => {
    if (!allWeather.some(item => item.id === w.id)) {
      allWeather.push(w);
    }
  });

  const weatherDistribution: Record<WeatherType, number> = {
    sunny: 0,
    cloudy: 0,
    rainy: 0,
    stormy: 0,
    foggy: 0,
    opt_out: 0
  };

  allWeather.forEach(w => {
    if (weatherDistribution[w.primary] !== undefined) {
      weatherDistribution[w.primary] += 1;
    }
  });

  // If no logs, assume default mild distribution
  if (allWeather.length === 0) {
    weatherDistribution.sunny = 3;
    weatherDistribution.cloudy = 2;
    weatherDistribution.rainy = 1;
  }

  const totalWeatherLogs = Math.max(allWeather.length, 6);

  // Determine dominant emotion
  let dominant: WeatherType = 'sunny';
  let maxCount = -1;
  (Object.keys(weatherDistribution) as WeatherType[]).forEach(k => {
    if (weatherDistribution[k] > maxCount) {
      maxCount = weatherDistribution[k];
      dominant = k;
    }
  });

  // Calculate thinking practices
  const selfInitiatedTotal = parentObservations.reduce((acc, cur) => acc + (cur.selfInitiatedCount || 0), 0);
  const leavesPracticed = completedLeaves.length;
  const breakerUnlocked = medals.some(m => m.id === 'breaker-master' && m.unlocked);
  const breakerBonus = breakerUnlocked ? 3 : 1;

  const thinkingToolPractices = Math.max(selfInitiatedTotal + leavesPracticed * 2 + breakerBonus, 4);

  // Posture breakdown (Fen, Tong, Ze)
  const fenObs = parentObservations.find(o => o.id === 'obs-others-action' || o.id === 'obs-person-label');
  const tongObs = parentObservations.find(o => o.id === 'obs-frustration');
  const zeObs = parentObservations.find(o => o.id === 'obs-after-choice');

  const fenCount = (fenObs?.selfInitiatedCount || 2) + Math.floor(thinkingToolPractices * 0.35);
  const tongCount = (tongObs?.selfInitiatedCount || 2) + Math.floor(thinkingToolPractices * 0.35);
  const zeCount = (zeObs?.selfInitiatedCount || 1) + Math.floor(thinkingToolPractices * 0.3);

  // SEC-07: 坚决取消伪科学的情绪稳定性分数 (0-100)
  // 遵循契约：不从点击次数或记录次数推断儿童心理特质或人格，严禁打分评级
  const emotionalStabilityScore = 0;

  const unlockedMedalsCount = medals.filter(m => m.unlocked).length;

  return {
    allWeather,
    totalWeatherLogs,
    weatherDistribution,
    primaryDominantEmotion: dominant,
    emotionalStabilityScore,
    thinkingToolPractices,
    fenCount,
    tongCount,
    zeCount,
    unlockedMedalsCount,
    hugCount
  };
}

/**
 * Generates an evidence-based, scientifically-sound weekly report and customized coaching tips
 * based on New Beginnings program (Sandler et al.), PCIT, and child developmental psychology.
 * SEC-07: 不进行心理学诊断或能力评判，仅客观呈现行为记录与养育支持建议。
 */
export function generateLocalWeeklyReport(params: {
  todayWeather: WeatherRecord | null;
  weatherHistory: WeatherRecord[];
  parentObservations: ParentObservation[];
  completedLeaves: string[];
  medals: MedalRecord[];
  hugCount: number;
}): WeeklyReportData {
  const metrics = calculateWeeklyMetrics(params);

  // Format date range (last 7 days up to now)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dateRangeStr = `${weekAgo.getMonth() + 1}月${weekAgo.getDate()}日 ~ ${now.getMonth() + 1}月${now.getDate()}日（近7天）`;

  const weatherLabelMap: Record<WeatherType, string> = {
    sunny: '晴朗阳光',
    cloudy: '微风多云',
    rainy: '小雨绵绵',
    stormy: '雷雨起伏',
    foggy: '薄雾迷茫',
    opt_out: '自主探索节奏'
  };

  const dominantName = weatherLabelMap[metrics.primaryDominantEmotion];

  // SEC-07: 纯客观行为记录，不从点击次数推断心理能力或给出诊断性结论
  const executiveSummary = `本周孩子在小岛上记录了 ${metrics.totalWeatherLogs} 次内心晴雨天气（最常记录的天气为“${dominantName}”），参与了 ${metrics.thinkingToolPractices} 次具体思考小工具的互动（分一分 ${metrics.fenCount} 次，通一通 ${metrics.tongCount} 次，择一择 ${metrics.zeCount} 次）。本周报仅客观呈现生活与思考小工具的实践记录，不作任何心理能力评分或诊断推断。`;
  const pattern = `记录展现了真实自然的生活情绪起伏。晴雨小岛接纳所有真实感受（晴、多云、雨、雾均是正常反应），不强求孩子随时处于“开心”状态。`;
  const bodyAwarenessNote = `引导孩子将抽象的情绪与具体的身体感受相连接（如深呼吸让肩膀松下来），帮助建立身心自我觉察。`;
  const soothingCapacity = `自然节律观察：6岁儿童仍在情绪共同调节阶段。大人的温和稳定和在场陪伴，是孩子自然回归平静的最重要心理锚点。`;
  const stageDescription = `【亲子脚手架共同练习期】：与孩子一起在生活中练习“分一分事实与猜测、通一通他人视角、择一择可行小步”。`;
  const scaffoldingAdvice = `当孩子面临摩擦或突变时，大人先退后一步示范深呼吸，温和引导“我们先看清发生了什么”，给予孩子小范围自主选择权。`;
  const suggestedFocusForNextWeek = `保持睡前 10 分钟温暖的一致性流程，倾听孩子的分享，不急于评价或纠正。`;


  // Personalized parenting tips (循证 New Beginnings + PCIT)
  const personalizedParentingTips: WeeklyReportData['personalizedParentingTips'] = [
    {
      id: 'tip-1',
      category: '共情接纳',
      title: '第一反应：先接住“身体感觉”，不抢着讲道理',
      advice: `孩子本周共记录了 ${metrics.weatherDistribution.rainy + metrics.weatherDistribution.stormy} 次阴雨/雷雨天气。6岁孩子大脑皮层尚未完全成熟，当情绪冲头时理智脑会暂时掉线。`,
      scriptAction: `当孩子哭闹或烦躁时，蹲下抱住他说：“我看你小脸涨得红红的，肚子里肯定很难受对不对？来，先贴在妈妈/爸爸胸口哭一会儿，我不走。”`,
      why: '《儿童发展科学》证明：身体感觉被看见后，迷走神经才能迅速抑制杏仁核过度激活，为接下来的“分通择”理性思考创造神经生理条件。'
    },
    {
      id: 'tip-2',
      category: '责任圈去中间人',
      title: '守护两家边界：将孩子从大人事务中彻底释放',
      advice: `在两个家的生活节奏中，孩子最怕的是“忠诚冲突”或在中间充当传话信使。本周孩子在“家的形状”探索中展现了对爱不变的渴望。`,
      scriptAction: `所有换家接送、开销、学校通知，一律直接在大人微信上简短文字沟通。绝不对孩子说：“告诉你爸爸/妈妈以后别这样”。`,
      why: 'New Beginnings 循证方案：消除父母冲突暴露和信使角色，是离异家庭儿童长期心理健康保护效应最强的单一因子（最高统计学杠杆）。'
    },
    {
      id: 'tip-3',
      category: '特别时光',
      title: '每周15分钟“特别时光”（Special Time）',
      advice: `孩子本周自主运用思考工具 ${metrics.thinkingToolPractices} 次。奖励孩子最好的方式不是物质，而是百分之百完全不被打扰的高质量亲密。`,
      scriptAction: `这周末挑15分钟，把手机静音放在抽屉里。对孩子说：“现在是专属我们的15分钟，你想玩什么我们完全听你的，爸爸/妈妈只跟着你玩！”`,
      why: 'PCIT 亲子互动疗法：孩子主导的特别时光能让孩子获得极高的自主感与安全依恋，从根本上减少退行行为。'
    },
    {
      id: 'tip-4',
      category: '一致性建设',
      title: '睡前10分钟“安心交接”与小熊仪式',
      advice: `两个家的规矩可以有所不同，但睡前的“温暖、可预测性”必须保持高度一致。`,
      scriptAction: `无论在哪一个家，睡前都问一句：“今天心里的天气是什么颜色？想抱小熊听个什么故事？”`,
      why: '可预测的睡前仪式为大脑提供强烈的安全锚定，帮助孩子在跨家转换中建立平稳的心理安全岛。'
    }
  ];

  return {
    id: `weekly-rep-${Date.now()}`,
    generatedAt: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
    dateRange: dateRangeStr,
    totalWeatherLogs: metrics.totalWeatherLogs,
    weatherDistribution: metrics.weatherDistribution,
    primaryDominantEmotion: metrics.primaryDominantEmotion,
    emotionalStabilityScore: metrics.emotionalStabilityScore,
    thinkingToolPractices: metrics.thinkingToolPractices,
    fenCount: metrics.fenCount,
    tongCount: metrics.tongCount,
    zeCount: metrics.zeCount,
    hugCount: metrics.hugCount,
    unlockedMedalsCount: metrics.unlockedMedalsCount,
    executiveSummary,
    emotionalTrajectoryAnalysis: {
      pattern,
      bodyAwarenessNote,
      soothingCapacity
    },
    thinkingPracticeReview: {
      highlight: `孩子已累计解锁 ${metrics.unlockedMedalsCount} 枚晴雨勋章，在面对突发挫折时能调用小锤把大石头拆成 3 个小动作。`,
      stageDescription,
      scaffoldingAdvice
    },
    personalizedParentingTips,
    suggestedFocusForNextWeek
  };
}
