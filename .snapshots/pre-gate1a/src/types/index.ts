// Core data models for 晴雨小岛 (6-year-old thinking growth space)

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'opt_out';

export interface WeatherRecord {
  id: string;
  timestamp: string;
  primary: WeatherType;
  secondary?: WeatherType | null;
  intensity: number; // 1 to 5
  bodySensations: string[]; // e.g., '头热热的', '胸口堵堵的', '肚子紧紧的', '小手抖抖', '松松的'
  calmingMethod?: string;
  note?: string;
}

export type ThinkingPosture = 'fen' | 'tong' | 'ze'; // 分, 通, 择

export type DoorType = 'fen' | 'tong' | 'ze';

export interface LeafScenario {
  id: string;
  title: string;
  subtitle: string;
  category: '物与名' | '一事多面' | '对错与规则' | '家的形状' | '说与不说';
  weight: 'light' | 'medium' | 'deep'; // 轻叶 vs 重叶
  summary: string;
  character: string;
  /** Content-level boundary metadata (PHASE H): NONE | PHYSICAL_HARM | etc. */
  boundary?: 'NONE' | 'PHYSICAL_HARM' | 'PHYSICAL_SAFETY' | 'PSYCHOLOGICAL_SAFETY' | 'SECRECY_COERCION' | 'ADULT_RESPONSIBILITY_CROSSING' | 'PRIVACY_BOUNDARY';
  // Three entrance doors
  doors: {
    fen: {
      question: string;
      description: string;
    };
    tong: {
      question: string;
      description: string;
    };
    ze: {
      question: string;
      description: string;
    };
  };
  // Step: 走一圈
  walkSteps: {
    fenContent: {
      fact: string;
      guess: string;
      feeling: string;
    };
    tongContent: {
      sideA: string;
      sideB: string;
      whoseView: string;
    };
    zeContent: {
      choiceA: { text: string; benefit: string; cost: string };
      choiceB: { text: string; benefit: string; cost: string };
      fenceReminder?: string; // 围栏提醒
    };
  };
  // Step: 选
  choices: Array<{
    id: string;
    label: string;
    description: string;
    benefit: string;
    cost: string;
  }>;
  // Step: 试 (离屏小任务)
  offscreenTask: {
    action: string;
    tipForAdult: string;
  };
  // Step: 回头比一比
  compareWithOtherLeaf: {
    otherLeafTitle: string;
    question: string;
    keyAnalogy: string;
  };
}

export interface ParentObservation {
  id: string;
  dimension: string; // e.g. '挫折之后的第一句话', '对别人举动的说法', '做完选择之后', '对人的说法', '对自己的情绪'
  oldBehavior: string;
  targetBehavior: string;
  lastObservedDate?: string;
  selfInitiatedCount: number; // 一键标记：这次他自己想到了
}

export interface ParentScript {
  id: string;
  title: string;
  category: string;
  scenario: string;
  canSay: string[];
  shouldNotSay: string[];
  why: string;
}

export interface WeeklyLesson {
  week: number;
  pillar: string;
  title: string;
  duration: string;
  coreAction: string; // 本周只做一件事
  description: string;
}

export type AdultPresenceTier = 'A' | 'B' | 'C'; // A: 独立, B: 先看后放行, C: 必须共玩

export interface HugEvent {
  id: string;
  timestamp: string;
  toParent: '爸爸' | '妈妈' | '当前照顾者';
  acknowledged: boolean;
}

export type MedalType = 'sun' | 'rain';

export interface MedalRecord {
  id: string;
  title: string;
  type: MedalType; // 'sun' (阳光徽章) or 'rain' (雨滴徽章)
  emoji: string;
  category: 'weather' | 'breaker' | 'leaves' | 'hug';
  description: string;
  meaning: string; // 发展心理学意义
  offscreenAction: string; // 离屏亲子小动作
  unlocked: boolean;
  unlockedAt?: string;
}

export interface WeeklyReportData {
  id: string;
  generatedAt: string;
  dateRange: string;
  // Metrics summary
  totalWeatherLogs: number;
  weatherDistribution: Record<WeatherType, number>;
  primaryDominantEmotion: WeatherType;
  emotionalStabilityScore: number; // 0 - 100
  thinkingToolPractices: number; // 自主思考 + 拆解台 + 叶片完成
  fenCount: number; // 分
  tongCount: number; // 通
  zeCount: number; // 择
  hugCount: number;
  unlockedMedalsCount: number;
  // Qualitative sections
  executiveSummary: string; // 核心周报总评
  emotionalTrajectoryAnalysis: {
    pattern: string; // e.g. "多云转晴、遇到挫折后能自主回弹"
    bodyAwarenessNote: string; // 身体感知反馈
    soothingCapacity: string; // 自我平复力分析
  };
  thinkingPracticeReview: {
    highlight: string;
    stageDescription: string; // 脚手架阶段
    scaffoldingAdvice: string; // 撤脚手架建议
  };
  personalizedParentingTips: Array<{
    id: string;
    category: '共情接纳' | '责任圈去中间人' | '一致性建设' | '特别时光';
    title: string;
    advice: string;
    scriptAction: string; // 本周家长的一句话或小动作
    why: string; // 心理学原理
  }>;
  suggestedFocusForNextWeek: string;
}

export type ParentMedalPosture = 'fen' | 'tong' | 'ze' | 'presence' | 'consistency' | 'scaffold';

export interface ParentMedal {
  id: string;
  title: string;
  posture: ParentMedalPosture;
  postureLabel: string;
  badgeTheme: 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
  emoji: string;
  iconName: string;
  triggerDescription: string;
  developmentalSignificance: string; // 发展心理学依据
  practicalParentTip: string; // 现实落地养育动作
  unlocked: boolean;
  unlockedAt?: string;
  criteriaHint: string;
}
