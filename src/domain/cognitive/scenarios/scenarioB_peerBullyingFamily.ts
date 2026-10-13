/**
 * 场景 B：同学因为家庭情况故意嘲笑或欺负主角
 * 
 * 认知与安全目标：
 * 1. 严格触发安全边界：语言攻击、嘲弄与欺凌行为直接触犯心理安全与人身尊严红线。
 * 2. 宪法原则 B 严格执行：理解对方可能有原因（例如对方也感到孤独或在引起注意），绝不等于允许或忍受其欺凌行为！
 * 3. 严禁使用双面币或小天平权衡工具：bypassTradeoffFlow 强制为 true，跳过多视角合理化流程。
 * 4. 明确对行为划界限：大声制止、抽身离开、向身边现实安全大人（老师、家长）求助。
 * 
 * 对应认知结构：
 * StructureId.BEHAVIOR_PERSON_SEPARATION & 安全围栏
 */

import { UnifiedSceneDefinition, CognitiveLayer } from '../types';
import { StructureId } from '../../transfer/types';
import { Boundary } from '../../safety/types';

export const SCENARIO_B_PEER_BULLYING_FAMILY: UnifiedSceneDefinition = {
  sceneId: 'SCENE_B_PEER_BULLYING_FAMILY_V1',
  version: '1.0.0',
  ageBand: 'AGE_6_8',
  title: '操场上的不友好声音',
  contextNarrationSpokenText: '操场滑梯旁，一个同学指着小主人公大声起哄：“你的爸爸妈妈都不住一起，你真奇怪，我们都不跟你玩！”旁边还有人跟着笑。',

  cognitiveStructureId: StructureId.BEHAVIOR_PERSON_SEPARATION,
  activeLayers: [
    CognitiveLayer.TING_PAUSE,
    CognitiveLayer.FEN_SEPARATE,
    CognitiveLayer.BIAN_DISCERN,
    CognitiveLayer.ZE_CHOOSE,
    CognitiveLayer.YAN_VERIFY,
  ],

  pauseGroundingPrompt: '停一下。把双手放在胸口，感受自己的心跳。对方说的话不是真的，你不需要承担他的恶意。你是一个非常珍贵的小朋友。',

  confirmedFacts: [
    '同学指着人说了攻击和嘲笑的话',
    '他说“不跟你玩”并起哄让其他人笑',
    '操场上有巡视的老师在不远处',
  ],

  characterEmotions: [
    {
      characterName: '我',
      emotionWord: '难过、委屈和愤怒',
      bodilySensation: '眼眶发酸，手心冰凉发抖',
    },
    {
      characterName: '起哄同学',
      emotionWord: '得意、想显示威风',
      bodilySensation: '大声嚷嚷，指手画脚',
    },
  ],

  interpretationsAndGuesses: [
    {
      characterName: '起哄同学',
      guessOrThought: '他用嘲笑别人的家庭来让自己显得厉害，或者从别人那里听来了错误的话。',
      isConfirmed: false,
    },
    {
      characterName: '我',
      guessOrThought: '是不是真的是我或者我的家庭有什么不好？（这是被伤害时的痛苦念头，但绝不是事实！）',
      isConfirmed: false,
    },
  ],

  unconfirmedInformation: [
    '起哄同学是从哪里学来这种话的，我们尚未确认',
    '其他旁观同学是不是真的赞同他，尚未确认',
  ],

  perspectives: [
    {
      characterId: 'char_victim',
      characterName: '被嘲弄的主角',
      visibleInformation: [
        '听到了刺耳的嘲笑声音',
        '感受到了极大的不舒服和委屈',
      ],
      hiddenInformation: [
        '知道自己两个家依然充满爱，并没有哪里奇怪',
      ],
      emotionalState: '需要安全保护与尊严捍卫',
      perspectiveLimitation: '在被攻击当下容易怀疑自己',
    },
    {
      characterId: 'char_bully',
      characterName: '起哄者',
      visibleInformation: [
        '看到了周围人的目光',
      ],
      hiddenInformation: [
        '完全不知道分开居住也是一种正常负责的家庭生活方式',
        '不知道自己的恶语会给别人带来多大的伤害',
      ],
      emotionalState: '攻击性与从众',
      perspectiveLimitation: '缺乏同理心并践踏了交往边界',
    },
  ],

  safetyBoundaryAssessment: {
    isBoundaryTriggered: true,
    boundaryType: Boundary.PSYCHOLOGICAL_SAFETY,
    triggerReason: '发生当面嘲弄、排挤与心理恶意攻击，触发儿童尊严与心理安全围栏。',
    // 关键铁律：欺凌场景下强制跳过多视角权衡，绝不以“同理欺凌者”来合理化欺凌行为！
    bypassTradeoffFlow: true,
    emergencyRealityActions: [
      '立刻大声清楚地表达拒绝：“请你停下，不准这样说话！”',
      '转身离开现场，走向操场旁的值日老师',
      '放学后原原本本告诉家人，让大人协助学校介入处理',
    ],
  },

  actionChoices: [
    {
      actionId: 'choice_b_firm_refusal',
      labelSpokenText: '严肃大声说不：“请你停下！这不是事实，你这样做非常没有礼貌！”然后转身离开。',
      actionDescription: '坚决划定身体和语言边界，不与对方缠斗，保护自身尊严后立即脱离险境。',
      locusOfControl: 'INTERNAL_CONTROL',
      privacyLevel: 'NO_DISCLOSURE',
      isSafeBoundaryAction: true,
      isEmergencyHelp: false,
      isDiscretionaryChoice: false,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_b1_bully_stopped',
          feedbackScenario: '起哄者被坚定的态度震慑',
          feedbackSpokenText: '起哄的同学没想到你会这么坚定，声音小了下去。你安全地走开了。',
          allowsReadjustment: true,
          outcomeType: 'SAFETY_AFFIRMATION',
        },
      ],
    },
    {
      actionId: 'choice_b_report_teacher',
      labelSpokenText: '立刻走向老师：“老师，那边的同学在起哄笑话我的家，让我感到很不舒服，请帮助我。”',
      actionDescription: '寻求现实中成人权威的庇护与干预。求助是力量的体现，绝非告状或软弱。',
      locusOfControl: 'CO_REGULATION',
      privacyLevel: 'PRIVATE_TO_TRUSTED_ADULT',
      isSafeBoundaryAction: true,
      isEmergencyHelp: true,
      isDiscretionaryChoice: false,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_b2_teacher_intervened',
          feedbackScenario: '老师严肃介入并保护了你',
          feedbackSpokenText: '老师走到起哄同学面前严肃制止，并拉着你的手给予肯定：“你来找老师是对的，没有任何人可以取笑别人的家庭。”',
          allowsReadjustment: true,
          outcomeType: 'SAFETY_AFFIRMATION',
        },
      ],
    },
    {
      actionId: 'choice_b_leave_calm_space',
      labelSpokenText: '不理会他的起哄，直接走向好朋友或秋千区：“我不听这些难听的话，我要去玩秋千。”',
      actionDescription: '不给恶意提供舞台，主动退出冲突圈，回到能够让自己安心的安全同伴身边。',
      locusOfControl: 'INTERNAL_CONTROL',
      privacyLevel: 'NO_DISCLOSURE',
      isSafeBoundaryAction: true,
      isEmergencyHelp: false,
      isDiscretionaryChoice: false,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_b3_moved_away',
          feedbackScenario: '在秋千区平静下来',
          feedbackSpokenText: '你坐上了秋千，身边有好朋友递过来的橡皮泥。那些难听的声音慢慢听不到了。',
          allowsReadjustment: true,
          outcomeType: 'CALM_RESULT',
        },
      ],
    },
  ],

  requiresAdultCoReading: true,

  exitOrPauseOptions: {
    allowSilence: true,
    allowPassOrSkip: true,
    allowPrivateKeep: true,
    spokenExitGuidance: '如果你现在觉得很不舒服或者心口发酸，直接合上屏幕。走到身边安全的大人那里，牵住大人的手。你始终是被好好爱着的。',
  },

  isHeldOutTransfer: true,
  surfaceDomain: 'school',

  provenance: {
    author: 'A-LAND 儿童认知发展工作组',
    sourceDescription: '基于校园反欺凌与反偏见规范设计',
    reviewStatus: 'REVIEWED_SAFE',
    reviewedBy: '儿童心理发展与临床伦理专家委员会',
    reviewDate: '2026-10-12',
    pedagogicalNotes: '严格遵循宪法原则 B：欺凌行为绝对不可商量权衡，受害者无须同理施暴者，首要任务是制止、撤离与报告。',
  },
};
