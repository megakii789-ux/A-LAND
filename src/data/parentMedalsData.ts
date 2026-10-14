import { ParentMedal, ParentObservation } from '../types';

export const INITIAL_PARENT_MEDALS: ParentMedal[] = [
  {
    id: 'p-medal-fen-fact',
    title: '事实分界守护勋章',
    posture: 'fen',
    postureLabel: '分 · 事实锚定',
    badgeTheme: 'sky',
    emoji: '🛡️',
    iconName: 'ShieldCheck',
    triggerDescription: '成功引导或记录孩子将“客观事实”与“脑中猜测”分离开来。',
    developmentalSignificance:
      '6岁儿童常处于情绪推理（Emotional Reasoning）阶段，易把突发意外等同于人品否定。家长帮助孩子剥离事实与猜测，是在前额叶神经回路中建立现实检验力（Reality Testing）的关键脚手架。',
    practicalParentTip: '打翻水或积木倒塌时，先平静描述眼睛看见的物理事实，不作道德归咎。',
    unlocked: true,
    unlockedAt: '观察卡验证解锁',
    criteriaHint: '记录 1 次以上“人与事区分”或“挫折应对”行为变化'
  },
  {
    id: 'p-medal-tong-coin',
    title: '双面视角摆渡勋章',
    posture: 'tong',
    postureLabel: '通 · 双重视角',
    badgeTheme: 'emerald',
    emoji: '🪙',
    iconName: 'Compass',
    triggerDescription: '成功引导孩子翻转双面币，看到冲突中小伙伴的无意或自身视角之外的可能。',
    developmentalSignificance:
      '克服学龄初期典型的敌意归因偏差（Hostile Attribution Bias），通过“双面币”心智理论（Theory of Mind）脚手架，让孩子习得去中心化的换位理解能力。',
    practicalParentTip: '拿出一枚硬币在桌上翻转：“看，一面是委屈，一面是他慌张，一件事有两张脸”。',
    unlocked: true,
    unlockedAt: '观察卡验证解锁',
    criteriaHint: '记录 1 次以上“对别人举动的说法”行为变化'
  },
  {
    id: 'p-medal-ze-agency',
    title: '自主抉择引路勋章',
    posture: 'ze',
    postureLabel: '择 · 赋能自主',
    badgeTheme: 'amber',
    emoji: '⚖️',
    iconName: 'Scale',
    triggerDescription: '在安全围栏内为孩子提供有限二选一，并支持孩子尝试自己的小选择。',
    developmentalSignificance:
      '面对家庭结构变化，孩子最容易产生失控恐慌与全面抗拒。在坚固安全边界内提供有限选择权，能激活儿童内控点（Internal Locus of Control），告别权力斗争。',
    practicalParentTip: '在出发换家前提供两个大人都能接受的选项：“先装小熊还是先装水壶？你来做决定”。',
    unlocked: true,
    unlockedAt: '观察卡验证解锁',
    criteriaHint: '记录 1 次以上“做完选择之后”行为变化'
  },
  {
    id: 'p-medal-fen-emotion',
    title: '情绪命名指南针勋章',
    posture: 'fen',
    postureLabel: '分 · 情绪命名',
    badgeTheme: 'sky',
    emoji: '🧭',
    iconName: 'Boxes',
    triggerDescription: '成功支持孩子用具象语言（暴风雨、紧紧的）命名自身生理与情绪感受。',
    developmentalSignificance:
      '“命名即驯服（Name it to tame it）”。将大情绪语言化，能促使神经冲动从杏仁核向左前额叶皮层回流，极大缩短高激惹状态持续时间。',
    practicalParentTip: '孩子发火时，先温和描述身体信号：“我看到小拳头握紧了，身体在亮黄灯”。',
    unlocked: true,
    unlockedAt: '观察卡验证解锁',
    criteriaHint: '记录 1 次以上“对自己的情绪命名”行为变化'
  },
  {
    id: 'p-medal-presence-haven',
    title: '温暖在场安全港勋章',
    posture: 'presence',
    postureLabel: '土 · 真实在场',
    badgeTheme: 'rose',
    emoji: '❤️',
    iconName: 'Heart',
    triggerDescription: '及时响应孩子的即时求助，或在睡前给予孩子坚定的身体拥抱。',
    developmentalSignificance:
      '安全依恋（Secure Attachment）的核心原则：孩子深知无论外部世界发生什么，身边总有一位稳固的大人在场守护。情绪优先于讲道理。',
    practicalParentTip: '真人到场后放下手机与杂务，给孩子一个不少于 10 秒钟的心贴心长拥抱。',
    unlocked: true,
    unlockedAt: '抱抱响应解锁',
    criteriaHint: '响应孩子的即时抱抱提醒或完成睡前抚慰仪式'
  },
  {
    id: 'p-medal-consistency-guard',
    title: '一致安心守护勋章',
    posture: 'consistency',
    postureLabel: '守护 · 规则一致',
    badgeTheme: 'indigo',
    emoji: '📋',
    iconName: 'ListChecks',
    triggerDescription: '践行两个家的核心睡眠流程或安全底线一致性核对。',
    developmentalSignificance:
      '环境的可预测性（Predictability）是帮助儿童建立内心安全感的重要屏障。不需要所有琐事完全一样，但睡前与安全底线的一致让孩子感到踏实稳定。',
    practicalParentTip: '在玄关或书包边贴一张两个家通行清单，守住睡前温和与不打人底线。',
    unlocked: true,
    unlockedAt: '一致性核对解锁',
    criteriaHint: '在一致性清单中完成核心项的核对践行'
  },
  {
    id: 'p-medal-scaffold-fade',
    title: '静默隐退脚手架勋章',
    posture: 'scaffold',
    postureLabel: '进化 · 姿态内化',
    badgeTheme: 'purple',
    emoji: '🕊️',
    iconName: 'Sparkles',
    triggerDescription: '孩子在现实生活中累计自发运用思考姿态达到 5 次以上，见证思考工具稳步淡出。',
    developmentalSignificance:
      '维果茨基最近发展区（ZPD）最高阶段：从成人言语共调、到外在工具辅助、最终孩子自发内化为自主思考习惯。大人的放手与撤架是最高养育艺术。',
    practicalParentTip: '当孩子自己想到分通择时，克制指导冲动，用信任的微笑和点头给孩子确认。',
    unlocked: true,
    unlockedAt: '自发行为累计解锁',
    criteriaHint: '孩子自发应用思考姿态总次数达到 5 次及以上'
  },
  {
    id: 'p-medal-pocket-scholar',
    title: '温和话术雕刻家勋章',
    posture: 'fen',
    postureLabel: '践行 · 科学话术',
    badgeTheme: 'amber',
    emoji: '💡',
    iconName: 'Lightbulb',
    triggerDescription: '在养育小锦囊中查阅、复制或定制个性化分通择话术并在生活实践。',
    developmentalSignificance:
      '父母在关键时刻的语言会成为孩子未来一生的“内在自言自语（Inner Speech）”。以去情绪化的脚手架句式代替即时训诫，润物无声。',
    practicalParentTip: '把分通择核心话术保存在手机备忘录，遇到挑战时看一眼再开口。',
    unlocked: true,
    unlockedAt: '锦囊库实践解锁',
    criteriaHint: '查阅或复制养育小锦囊高频话术'
  }
];

export interface EvaluateMedalsParams {
  parentObservations: ParentObservation[];
  consistencyItemsCheckedCount: number;
  hugCount: number;
  hasUsedPocketTips?: boolean;
}

/**
 * 纯函数计算：根据当前真实养育数据动态评估勋章解锁状态
 */
export function calculateParentMedals(
  initialMedals: ParentMedal[],
  params: EvaluateMedalsParams
): ParentMedal[] {
  const {
    parentObservations,
    consistencyItemsCheckedCount,
    hugCount,
    hasUsedPocketTips = true
  } = params;

  const totalSelfInitiated = parentObservations.reduce(
    (acc, cur) => acc + cur.selfInitiatedCount,
    0
  );

  const fenObs = parentObservations.find(
    (o) => o.id === 'obs-person-label' || o.id === 'obs-frustration'
  );
  const tongObs = parentObservations.find((o) => o.id === 'obs-others-action');
  const zeObs = parentObservations.find((o) => o.id === 'obs-after-choice');
  const emotionObs = parentObservations.find((o) => o.id === 'obs-own-emotion');

  return initialMedals.map((medal) => {
    let unlocked = medal.unlocked;
    let unlockedAt = medal.unlockedAt;

    switch (medal.id) {
      case 'p-medal-fen-fact':
        if ((fenObs?.selfInitiatedCount ?? 0) > 0) {
          unlocked = true;
          unlockedAt = unlockedAt || '已由观察卡点亮';
        }
        break;

      case 'p-medal-tong-coin':
        if ((tongObs?.selfInitiatedCount ?? 0) > 0) {
          unlocked = true;
          unlockedAt = unlockedAt || '已由观察卡点亮';
        }
        break;

      case 'p-medal-ze-agency':
        if ((zeObs?.selfInitiatedCount ?? 0) > 0) {
          unlocked = true;
          unlockedAt = unlockedAt || '已由观察卡点亮';
        }
        break;

      case 'p-medal-fen-emotion':
        if ((emotionObs?.selfInitiatedCount ?? 0) > 0) {
          unlocked = true;
          unlockedAt = unlockedAt || '已由观察卡点亮';
        }
        break;

      case 'p-medal-presence-haven':
        if (hugCount > 0) {
          unlocked = true;
          unlockedAt = unlockedAt || '已由温暖在场点亮';
        }
        break;

      case 'p-medal-consistency-guard':
        if (consistencyItemsCheckedCount >= 3) {
          unlocked = true;
          unlockedAt = unlockedAt || '已由一致性清单点亮';
        }
        break;

      case 'p-medal-scaffold-fade':
        if (totalSelfInitiated >= 5) {
          unlocked = true;
          unlockedAt = unlockedAt || '已由自发应用累计点亮';
        }
        break;

      case 'p-medal-pocket-scholar':
        if (hasUsedPocketTips) {
          unlocked = true;
          unlockedAt = unlockedAt || '已由小锦囊实践点亮';
        }
        break;

      default:
        break;
    }

    return {
      ...medal,
      unlocked,
      unlockedAt
    };
  });
}
