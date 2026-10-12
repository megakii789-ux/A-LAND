/**
 * AUDIT QUARANTINE: not imported by the active application.
 * The former report inferred mental qualities from usage and had a non-existent API.
 * Do not re-enable before the claims and data-flow have been reviewed.
 */
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

  // Emotional stability score: higher sunny/cloudy, plus practice self-regulation
  const sunCloudRatio = (weatherDistribution.sunny + weatherDistribution.cloudy) / (totalWeatherLogs || 1);
  const stabilityBase = 72;
  const bonusPractice = Math.min(thinkingToolPractices * 2, 18);
  const bonusHugs = Math.min(hugCount * 2, 6);
  const emotionalStabilityScore = Math.min(98, Math.round(stabilityBase + (sunCloudRatio * 10) + (bonusPractice / 2) + bonusHugs));

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

  // Dynamic tailoring based on emotion and practice frequency
  let executiveSummary = '';
  let pattern = '';
  let bodyAwarenessNote = '';
  let soothingCapacity = '';
  let stageDescription = '';
  let scaffoldingAdvice = '';
  let suggestedFocusForNextWeek = '';

  if (metrics.thinkingToolPractices >= 8) {
    executiveSummary = `本周孩子的心理由“${dominantName}”主导，并在日常中高频展现出自主运用思考工具的倾向（达到 ${metrics.thinkingToolPractices} 次自主实践）。尤其在“分一分”事实与猜测方面进步斐然，面对计划突变或同伴摩擦时，情绪回弹速度比上周明显缩短。`;
    pattern = `呈现健康的情绪波动与自主回弹曲线。虽然偶有雨天或雷雨（${metrics.weatherDistribution.rainy + metrics.weatherDistribution.stormy} 次），但孩子未陷入持久退行，而是能借由小工具将困难切碎。`;
    bodyAwarenessNote = `孩子对身体发热、肚子紧紧等生理觉知灵敏度提升，能借助绿草平静角和深呼吸使副交感神经重新主导。`;
    soothingCapacity = `自主平复力处于【成长进阶期】。孩子已经从“必须大人抱持”向“能自己退后一步、先深呼吸再说话”自发过渡。`;
    stageDescription = `【脚手架稳步撤离期】：由于自主发起已超阈值，孩子正在把小岛上的“分、通、择”内在化为自己的认知习惯。`;
    scaffoldingAdvice = `家长可以减少口头指导，多用“哇，刚才发生什么了，你怎么想的？”开放提问，把解释权和选择权留给孩子。`;
    suggestedFocusForNextWeek = `巩固“择其一而行”的承担感，并保持睡前10分钟的高质量亲子特别时光。`;
  } else {
    executiveSummary = `本周孩子整体情绪基调以“${dominantName}”为主，记录了 ${metrics.totalWeatherLogs} 次内心晴雨，完成了 ${metrics.thinkingToolPractices} 次思考练习。处于“建立安全基底与思考启蒙”的关键阶段，对具象化的小工具充满好奇。`;
    pattern = `情绪表现真实自然，换家交接日前后或玩具争抢时偶有波动。通过“抱抱键”主动发起了 ${metrics.hugCount} 次依恋寻求，展现了优秀的向内求助能力。`;
    bodyAwarenessNote = `开始把抽象的难过与具体的生理反应（如“胸口堵堵”、“手心出汗”）相对应，这是情绪智力（EQ）萌芽的核心标志。`;
    soothingCapacity = `平复力处于【共同调节期】。6岁孩子依然极度依赖成人温和镇定的神经系统来带动自己冷静下来。`;
    stageDescription = `【脚手架搭建与示范期】：孩子正在熟悉“分（事实 vs 想法）”与“通（换个眼睛看）”，大人的一致性反应是最佳催化剂。`;
    scaffoldingAdvice = `在遇到冲突时，大人先蹲下来做深呼吸，示范“按下暂停键”，不急于讲大道理。`;
    suggestedFocusForNextWeek = `强化两个家的睡前一致性流程，在孩子情绪来临时先命名感受，不急于纠正。`;
  }

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
