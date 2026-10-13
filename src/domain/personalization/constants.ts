import {
  AnimalCompanionId,
  AnimalCompanionInfo,
  InterestActivityId,
  InterestActivityInfo,
  AgeBandTierId,
  AgeBandDefinition,
  PersonalizationProfile
} from './types';

// 1. 中性动物伙伴元数据（无性别、无歧视偏见）
export const ANIMAL_COMPANIONS: Record<AnimalCompanionId, AnimalCompanionInfo> = {
  guoguo_squirrel: {
    id: 'guoguo_squirrel',
    name: '果果',
    animal: '小松鼠',
    avatarEmoji: '🐿️',
    greetingText: '我是小松鼠果果，我喜欢收捡森林里的每一片小树叶和秘密线索！',
    traitDescription: '细心观察、整理线索',
    themeColorBg: 'bg-amber-100',
    themeColorBorder: 'border-amber-300',
    themeColorText: 'text-amber-900',
  },
  beibei_otter: {
    id: 'beibei_otter',
    name: '贝贝',
    animal: '小海獭',
    avatarEmoji: '🦦',
    greetingText: '我是小海獭贝贝，如果觉得累了，我们可以一起躺在水面上慢慢呼吸。',
    traitDescription: '温和平静、放松深呼吸',
    themeColorBg: 'bg-teal-100',
    themeColorBorder: 'border-teal-300',
    themeColorText: 'text-teal-900',
  },
  tiantian_raccoon: {
    id: 'tiantian_raccoon',
    name: '天天',
    animal: '小浣熊',
    avatarEmoji: '🦝',
    greetingText: '我是小浣熊天天，遇到解不开的谜题，我们拆成一小步一小步来看看！',
    traitDescription: '动手拆解、化大为小',
    themeColorBg: 'bg-indigo-100',
    themeColorBorder: 'border-indigo-300',
    themeColorText: 'text-indigo-900',
  },
  qiqi_deer: {
    id: 'qiqi_deer',
    name: '奇奇',
    animal: '小鹿',
    avatarEmoji: '🦌',
    greetingText: '我是小鹿奇奇，森林里起风时，我会停下来听一听自己的心跳声。',
    traitDescription: '敏锐感受、退后一步',
    themeColorBg: 'bg-emerald-100',
    themeColorBorder: 'border-emerald-300',
    themeColorText: 'text-emerald-900',
  },
};

// 2. 兴趣活动定义
export const INTEREST_ACTIVITIES: Record<InterestActivityId, InterestActivityInfo> = {
  drawing: {
    id: 'drawing',
    label: '画画与色彩',
    icon: '🎨',
    sceneTitle: '美术角蜡笔侦探',
    sceneDescription: '画室桌角的彩色蜡笔和断痕，找出画板上的客观线索',
  },
  sports: {
    id: 'sports',
    label: '足球与运动',
    icon: '⚽',
    sceneTitle: '绿茵场足球侦探',
    sceneDescription: '球场草地边缘被踢出界外的足球，分辨真实轨迹与猜想',
  },
  nature: {
    id: 'nature',
    label: '自然与小动物',
    icon: '🌲',
    sceneTitle: '森林落叶坚果侦探',
    sceneDescription: '大树树洞前被风吹落的橡果，探索自然痕迹与真实原因',
  },
  puzzle: {
    id: 'puzzle',
    label: '拼图与机关',
    icon: '🧩',
    sceneTitle: '拼图桌彩虹碎片侦探',
    sceneDescription: '地毯角落少掉的一枚小拼图，观察空间摆放与事实',
  },
};

// 3. 年龄分层架构预留定义
export const AGE_BAND_DEFINITIONS: Record<AgeBandTierId, AgeBandDefinition> = {
  TODDLER_2_4: {
    id: 'TODDLER_2_4',
    label: '亲子启蒙期',
    ageRangeDisplay: '2–4 岁',
    status: 'RESERVED_STUB',
    primaryDeliveryMethod: '成人主导的面对面共同游戏，不设计为独立运行的心理产品',
    cognitiveFocus: '感官探索、身体拥抱、安全依恋',
    privacyLevel: '高（完全由监护人现场照护）',
    isChildIndependentExecutable: false,
  },
  EARLY_CHILDHOOD_5_7: {
    id: 'EARLY_CHILDHOOD_5_7',
    label: '探索实践期 (当前运行)',
    ageRangeDisplay: '5–7 岁',
    status: 'ACTIVE_VERIFIED_V1',
    primaryDeliveryMethod: '以具体操作、大图标卡片、简短语音为主，不依赖长文字阅读',
    cognitiveFocus: '事实与猜想分离、退后一步、情绪与行为解耦',
    privacyLevel: '最高（匿名ID、本地运行、无云端心理画像）',
    isChildIndependentExecutable: true,
  },
  MIDDLE_CHILDHOOD_8_10: {
    id: 'MIDDLE_CHILDHOOD_8_10',
    label: '同伴建构期 (架构预留)',
    ageRangeDisplay: '8–10 岁',
    status: 'RESERVED_STUB',
    primaryDeliveryMethod: '同伴协商模拟、真实情境对话选择、自我边界设立',
    cognitiveFocus: '同伴关系、社会反馈、反欺凌自主表达边界',
    privacyLevel: '高（独立空间与隐私抽屉）',
    isChildIndependentExecutable: true,
  },
  EARLY_TEEN_11_13: {
    id: 'EARLY_TEEN_11_13',
    label: '逻辑辩思期 (架构预留)',
    ageRangeDisplay: '11–13 岁',
    status: 'RESERVED_STUB',
    primaryDeliveryMethod: '复杂多方观点对比、信息求证、自主权衡记录',
    cognitiveFocus: '复杂人际关系理解、信息真伪判断、独立取舍责任',
    privacyLevel: '极高（未成年人适龄私密日记与保护屏障）',
    isChildIndependentExecutable: true,
  },
  LATE_TEEN_14_17: {
    id: 'LATE_TEEN_14_17',
    label: '青年独立期 (架构预留)',
    ageRangeDisplay: '14–17 岁',
    status: 'RESERVED_STUB',
    primaryDeliveryMethod: '抽象思维引导、深度反思脚手架、法律与人际权利指引',
    cognitiveFocus: '自主权、生活规划、多重视角协调',
    privacyLevel: '成年过渡级隐私保护（非极端安全风险不得穿透通知）',
    isChildIndependentExecutable: true,
  },
};

// 4. 默认本地配置（中性、安全、无预设标签）
export const DEFAULT_PERSONALIZATION_PROFILE: PersonalizationProfile = {
  pseudonymousId: 'child_anon_default',
  companionId: 'guoguo_squirrel',
  primaryInterest: 'drawing',
  interactionStyle: 'hands_on',
  accessibility: {
    voiceEnabled: true,
    reducedMotion: false,
    simplifiedText: false,
  },
  ageTier: 'EARLY_CHILDHOOD_5_7',
  consentForLocalStorage: true,
  updatedAt: 1718000000000,
};
