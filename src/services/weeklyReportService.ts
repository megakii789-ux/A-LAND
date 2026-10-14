import {
  WeeklyReportData,
  WeatherRecord,
  ParentObservation,
  HugEvent,
  MedalRecord,
  WeatherType
} from '../types';
import { INITIAL_LEAF_SCENARIOS } from '../data/mockData';

export const INSUFFICIENT_OBSERVATION_TEXT = '尚无足够观察记录';

const VALID_WEATHER_TYPES = new Set<WeatherType>([
  'sunny',
  'cloudy',
  'rainy',
  'stormy',
  'foggy',
  'opt_out'
]);

const KNOWN_LEAF_IDS = new Set<string>([
  ...INITIAL_LEAF_SCENARIOS.map((leaf) => leaf.id),
  'broken-tower',
  'family-transition',
  'parent-phone',
  'peer-question',
  'leaf-1',
  'leaf-2',
]);

export interface ExplicitPostureCounts {
  fen?: number;
  tong?: number;
  ze?: number;
}

export interface GenerateReportInput {
  todayWeather?: WeatherRecord | null;
  weatherHistory: WeatherRecord[];
  parentObservations: ParentObservation[];
  completedLeaves: string[];
  medals: MedalRecord[];
  hugCount?: number;
  hugEvents?: HugEvent[];
  tonightAt?: '妈妈家' | '爸爸家' | '尚未设置' | string;
  postureCounts?: ExplicitPostureCounts;
  isWithdrawn?: boolean;
}

function toSafeCount(val: unknown): number {
  if (typeof val !== 'number' || !Number.isFinite(val) || val < 0) {
    return 0;
  }
  return Math.floor(val);
}

/**
 * R3-01 Contract:
 * - Empty data NEVER generates default weather counts (no sunny=3/cloudy=2/rainy=1, no Math.max(..., 6));
 * - NEVER forces a minimum practice count (no Math.max(..., 4), no breakerBonus, no *2 inflation);
 * - NEVER estimates fen/tong/ze completion counts via ratios (no 0.35 / 0.30 multipliers);
 * - NEVER calls badges, click counts, or self-reported counts "mastered psychological abilities";
 * - Displays "尚无足够观察记录" uniformly when records are insufficient;
 * - NEVER outputs unsubstantiated claims like "自主平复良好" or "脚手架正在淡出".
 */
export function calculateWeeklyMetrics(params: GenerateReportInput) {
  const isWithdrawn = Boolean(params?.isWithdrawn);

  const weatherDistribution: Record<WeatherType, number> = {
    sunny: 0,
    cloudy: 0,
    rainy: 0,
    stormy: 0,
    foggy: 0,
    opt_out: 0
  };

  const allWeather: WeatherRecord[] = [];
  const pushValidWeather = (w: unknown) => {
    if (
      w &&
      typeof w === 'object' &&
      typeof (w as WeatherRecord).id === 'string' &&
      (w as WeatherRecord).id.trim().length > 0 &&
      typeof (w as WeatherRecord).primary === 'string' &&
      VALID_WEATHER_TYPES.has((w as WeatherRecord).primary)
    ) {
      const record = w as WeatherRecord;
      if (!allWeather.some((item) => item.id === record.id)) {
        allWeather.push(record);
      }
    }
  };

  if (!isWithdrawn) {
    if (params?.todayWeather) {
      pushValidWeather(params.todayWeather);
    }
    if (Array.isArray(params?.weatherHistory)) {
      for (const item of params.weatherHistory) {
        pushValidWeather(item);
      }
    }
  }

  for (const w of allWeather) {
    weatherDistribution[w.primary] += 1;
  }

  // R3-01: Empty data NEVER generates default weather counts
  const totalWeatherLogs = allWeather.length;

  let dominant: WeatherType = 'opt_out';
  let maxCount = 0;
  (Object.keys(weatherDistribution) as WeatherType[]).forEach((k) => {
    if (weatherDistribution[k] > maxCount) {
      maxCount = weatherDistribution[k];
      dominant = k;
    }
  });

  // Validate parent observations (ignore negative, NaN, or malformed entries)
  const rawObservations =
    !isWithdrawn && Array.isArray(params?.parentObservations)
      ? params.parentObservations
      : [];

  let fenObsCount = 0;
  let tongObsCount = 0;
  let zeObsCount = 0;
  let otherObsCount = 0;

  for (const item of rawObservations) {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string') {
      continue;
    }
    const c = toSafeCount(item.selfInitiatedCount);
    if (item.id === 'obs-others-action' || item.id === 'obs-person-label' || item.id === 'obs2') {
      fenObsCount += c;
    } else if (item.id === 'obs-frustration' || item.id === 'obs3') {
      tongObsCount += c;
    } else if (item.id === 'obs-after-choice' || item.id === 'obs4') {
      zeObsCount += c;
    } else {
      otherObsCount += c;
    }
  }

  const explicitFen = isWithdrawn ? 0 : toSafeCount(params?.postureCounts?.fen);
  const explicitTong = isWithdrawn ? 0 : toSafeCount(params?.postureCounts?.tong);
  const explicitZe = isWithdrawn ? 0 : toSafeCount(params?.postureCounts?.ze);

  // R3-01: Strictly traceable counts only; NO ratio estimation (no *0.35 / *0.30) and NO default +2/+1 floor
  const fenCount = fenObsCount + explicitFen;
  const tongCount = tongObsCount + explicitTong;
  const zeCount = zeObsCount + explicitZe;

  // Validate completed leaves (deduplicate, only count valid leaf IDs)
  const rawLeaves =
    !isWithdrawn && Array.isArray(params?.completedLeaves)
      ? params.completedLeaves
      : [];
  const validLeafIds = Array.from(
    new Set(
      rawLeaves.filter(
        (id): id is string =>
          typeof id === 'string' && id.trim().length > 0 && KNOWN_LEAF_IDS.has(id)
      )
    )
  );

  const selfInitiatedTotal = fenObsCount + tongObsCount + zeObsCount + otherObsCount;

  // R3-01: No minimum practice floor (no Math.max(..., 4)), no *2 leaf multiplier, no breakerBonus
  const thinkingToolPractices =
    validLeafIds.length + selfInitiatedTotal + explicitFen + explicitTong + explicitZe;

  const emotionalStabilityScore = 0;

  const unlockedMedalsCount =
    !isWithdrawn && Array.isArray(params?.medals)
      ? params.medals.filter(
          (m) => m && typeof m === 'object' && typeof m.id === 'string' && m.unlocked === true
        ).length
      : 0;

  let hugCount = 0;
  if (!isWithdrawn) {
    if (Array.isArray(params?.hugEvents)) {
      hugCount = params.hugEvents.filter(
        (h) => h && typeof h === 'object' && typeof h.id === 'string' && h.id.trim().length > 0
      ).length;
    } else {
      hugCount = toSafeCount(params?.hugCount);
    }
  }

  return {
    allWeather,
    validLeafIds,
    selfInitiatedTotal,
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

export function generateLocalWeeklyReport(params: GenerateReportInput): WeeklyReportData {
  const metrics = calculateWeeklyMetrics(params);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const dateRangeStr = `${weekAgo.getMonth() + 1}月${weekAgo.getDate()}日 - ${now.getMonth() + 1}月${now.getDate()}日`;

  const hasWeatherRecords = metrics.totalWeatherLogs > 0;
  const hasThinkingRecords = metrics.thinkingToolPractices > 0;
  const hasAnySufficientRecord = hasWeatherRecords || hasThinkingRecords;

  const recordedSensations = Array.from(
    new Set(
      metrics.allWeather.flatMap((r) =>
        Array.isArray(r.bodySensations)
          ? r.bodySensations.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
          : []
      )
    )
  );

  const executiveSummary = hasAnySufficientRecord
    ? `本页仅客观呈现可追溯来源的本机活动记录：当前已记录 ${metrics.totalWeatherLogs} 次天气选择、${metrics.validLeafIds.length} 片故事叶浏览、${metrics.selfInitiatedTotal} 次家长日常观察标记（分 ${metrics.fenCount} 次，通 ${metrics.tongCount} 次，择 ${metrics.zeCount} 次）。这些记录仅反映当次操作与观察计数，不代表孩子已掌握某种稳定心理能力，也不作任何心理诊断推断。`
    : `${INSUFFICIENT_OBSERVATION_TEXT}。本页仅客观呈现可追溯来源的本机活动记录，当前没有可汇总的天气选择、故事浏览或家长观察记录，不作任何心理能力或诊断推断。`;

  const pattern = hasWeatherRecords
    ? `客观记录汇总：本周期共记录 ${metrics.totalWeatherLogs} 次天气选择（晴天 ${metrics.weatherDistribution.sunny} 次、多云 ${metrics.weatherDistribution.cloudy} 次、雨天 ${metrics.weatherDistribution.rainy} 次、雷雨 ${metrics.weatherDistribution.stormy} 次、薄雾 ${metrics.weatherDistribution.foggy} 次、不选 ${metrics.weatherDistribution.opt_out} 次）。`
    : INSUFFICIENT_OBSERVATION_TEXT;

  const bodyAwarenessNote =
    hasWeatherRecords && recordedSensations.length > 0
      ? `本机记录到的身体感觉词汇包括：${recordedSensations.join('、')}（仅反映当次点选，不作生理或临床推断）。`
      : INSUFFICIENT_OBSERVATION_TEXT;

  const soothingCapacity = hasWeatherRecords
    ? '本机仅保留天气与平静角访问计数，不对孩子的平复能力或情绪韧性下评估结论。'
    : INSUFFICIENT_OBSERVATION_TEXT;

  const highlight = hasThinkingRecords
    ? `客观活动来源：已完成故事叶 ${metrics.validLeafIds.length} 片，家长手动记下日常观察 ${metrics.selfInitiatedTotal} 次（分 ${metrics.fenCount} 次 / 通 ${metrics.tongCount} 次 / 择 ${metrics.zeCount} 次）。单次点击或活动标记不等于已掌握心理能力。`
    : INSUFFICIENT_OBSERVATION_TEXT;

  const stageDescription = hasThinkingRecords
    ? '脚手架支持等级需依据跨场景、无提示的新叶证据判定，系统不会根据点击次数或周数自动宣告能力达成。'
    : INSUFFICIENT_OBSERVATION_TEXT;

  const scaffoldingAdvice = hasThinkingRecords
    ? '请在真实生活中继续提供温和陪伴，尊重孩子不回答或跳过的权利，不以测验方式考核孩子。'
    : INSUFFICIENT_OBSERVATION_TEXT;

  const personalizedParentingTips: WeeklyReportData['personalizedParentingTips'] = [
    {
      id: 'tip-1',
      category: '共情接纳',
      title: '在讲道理之前：先接住情绪与身体感受',
      advice: '当孩子面临计划改变、委屈或想念时，先给予安静陪伴，不急于要求孩子立刻乐观起来。',
      scriptAction: '抱抱孩子或陪坐一会儿说：“我看到你现在有点难过，可以慢慢来，我陪着你。”',
      why: '6岁儿童需要真人的情绪共同调节，接纳负面感受能降低防御。'
    },
    {
      id: 'tip-2',
      category: '责任圈去中间人',
      title: '守住大人责任圈：不让孩子替大人传话或操心',
      advice: '成人之间的安排与分歧由成人直接沟通，不让孩子承担传话或评判谁对谁错的压力。',
      scriptAction: '温和坚定地告诉孩子：“这是大人的事情，大人会商量好，你只管安心玩耍。”',
      why: '清晰划分大人责任与儿童界限，能减少孩子的自责与夹缝感。'
    },
    {
      id: 'tip-3',
      category: '特别时光',
      title: '10-15分钟无评价陪伴：由孩子决定玩什么',
      advice: '安排一段放下手机的专属陪伴时间，不提问考核、不借游戏说教，只跟随陪伴。',
      scriptAction: '对孩子说：“接下来的 15 分钟归你指挥，你想搭积木还是画画，我都陪你。”',
      why: '稳定的真人高质量陪伴是孩子安全感的根本来源，屏幕工具无法替代。'
    },
    {
      id: 'tip-4',
      category: '一致性建设',
      title: '可预测的日常：用事先说明替代临时催促',
      advice: '不同住处或照顾者的具体生活习惯可以不同，但安全底线与提前告知应保持清楚。',
      scriptAction: '在日程变动前提前告诉孩子：“今天下午由谁来接你，如果有变化我会提前和你说。”',
      why: '可预测的日常说明有助于降低 6 岁儿童的未知焦虑。'
    }
  ];

  return {
    id: `weekly-rep-${Date.now()}`,
    generatedAt: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    dateRange: dateRangeStr,
    totalWeatherLogs: metrics.totalWeatherLogs,
    weatherDistribution: metrics.weatherDistribution,
    primaryDominantEmotion: metrics.primaryDominantEmotion,
    emotionalStabilityScore: 0,
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
      highlight,
      stageDescription,
      scaffoldingAdvice
    },
    personalizedParentingTips,
    suggestedFocusForNextWeek:
      '本周只做一件能兑现的小事：选一个固定时段放下手机陪孩子玩 15 分钟，不做口头承诺之外的预测。'
  };
}

export const buildFallbackWeeklyReport = generateLocalWeeklyReport;

export async function generateWeeklyReport(
  input: GenerateReportInput
): Promise<{ report: WeeklyReportData; isAiPowered: boolean }> {
  const report = generateLocalWeeklyReport(input);
  return { report, isAiPowered: false };
}
