/**
 * 场景 B：同学因为家庭情况故意嘲笑或欺负主角
 * 
 * 认知与安全目标：
 * 1. 严格触发安全边界：语言攻击、嘲弄与欺凌行为直接触犯心理安全与人身尊严红线。
 * 2. 宪法原则 B 严格执行：理解对方可能有原因绝不等于允许或忍受其欺凌行为！
 * 3. 严禁使用双面币或小天平权衡工具：bypassTradeoffFlow 强制为 true，跳过多视角合理化流程。
 * 4. 明确对行为划界限：大声制止、抽身离开、向身边现实安全大人（老师、家长）求助。
 * 5. R3-03 & P1-07：起哄停止、老师介入等结果只能作为可能反馈，不向儿童承诺现实必然发生；保持 PENDING_REVIEW。
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

  pauseGroundingPrompt: '停一下。把双手放在胸口，感受自己的心跳。对方说的话不是事实，你不需要承担他的恶意。',

  confirmedFacts: [
    '同学指着人说了攻击和嘲笑的话',
    '他说“不跟你玩”并起哄让其他人笑',
    '操场上有巡视的老师在不远处',
  ],

  characterEmotions: [
    {
      characterName: '我',
      emotionWord: '难过、委屈和生气',
      bodilySensation: '眼眶发酸，手心发紧',
    },
    {
      characterName: '起哄同学',
      emotionWord: '起哄、想引起注意',
      bodilySensation: '大声嚷嚷，指手画脚',
    },
  ],

  interpretationsAndGuesses: [
    {
      characterName: '起哄同学',
      guessOrThought: '他可能想在别人面前显得厉害，或者从别人那里听来了错误的话。',
      isConfirmed: false,
    },
    {
      characterName: '我',
      guessOrThought: '是不是真的是我或者我的家庭有什么不好？（这是被伤害时的难过念头，但绝不是事实！）',
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
        '感受到了很不舒服和委屈',
      ],
      hiddenInformation: [
        '知道大人不住在一起不代表自己有什么奇怪',
      ],
      emotionalState: '需要安全保护与边界支持',
      perspectiveLimitation: '在被攻击当下容易怀疑自己',
    },
    {
      characterId: 'char_bully',
      characterName: '起哄者',
      visibleInformation: [
        '看到了周围人的目光',
      ],
      hiddenInformation: [
        '不了解不同家庭有不同的居住安排',
        '没有意识到嘲笑别人越过了安全边界',
      ],
      emotionalState: '起哄与从众',
      perspectiveLimitation: '越过了尊重他人的交往边界',
    },
  ],

  safetyBoundaryAssessment: {
    isBoundaryTriggered: true,
    boundaryType: Boundary.PSYCHOLOGICAL_SAFETY,
    triggerReason: '发生当面嘲弄、排挤与心理恶意攻击，触发儿童尊严与心理安全围栏。',
    // 关键铁律：欺凌场景下强制跳过多视角权衡，绝不以“同理欺凌者”来合理化欺凌行为！
    bypassTradeoffFlow: true,
    emergencyRealityActions: [
      '大声清楚地表达拒绝：“请你停下，不准这样说话！”',
      '转身离开现场，走向操场旁的值日老师或安全大人',
      '放学后告诉家人，请大人协助沟通处理',
    ],
  },

  actionChoices: [
    {
      actionId: 'choice_b_firm_refusal',
      labelSpokenText: '严肃大声说不：“请你停下！你这样做很不礼貌！”然后转身离开。',
      actionDescription: '划定语言边界，不与对方缠斗，优先离开现场保护自己。',
      locusOfControl: 'INTERNAL_CONTROL',
      privacyLevel: 'NO_DISCLOSURE',
      isSafeBoundaryAction: true,
      isEmergencyHelp: false,
      isDiscretionaryChoice: false,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_b1_bully_stopped',
          feedbackScenario: '一种可能：对方声音变小，你先离开现场',
          feedbackSpokenText: '一种可能是，对方听到你坚定说不后声音小了下去，你安全地走开了；如果对方没有停下，请立刻去找身边的老师或大人。',
          allowsReadjustment: true,
          outcomeType: 'SAFETY_AFFIRMATION',
        },
      ],
    },
    {
      actionId: 'choice_b_report_teacher',
      labelSpokenText: '立刻走向老师：“老师，那边的同学在起哄笑话我的家，让我很不舒服，请帮帮我。”',
      actionDescription: '寻求现实中安全成人的帮助与保护。求助是保护自己的正当行动。',
      locusOfControl: 'CO_REGULATION',
      privacyLevel: 'PRIVATE_TO_TRUSTED_ADULT',
      isSafeBoundaryAction: true,
      isEmergencyHelp: true,
      isDiscretionaryChoice: false,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_b2_teacher_intervened',
          feedbackScenario: '一种可能：老师前来了解并制止起哄',
          feedbackSpokenText: '一种可能是，老师走过来制止了起哄，并告诉你：“你来找大人帮忙是对的。”如果第一位大人刚好在忙，可以继续找另一位可信大人。',
          allowsReadjustment: true,
          outcomeType: 'SAFETY_AFFIRMATION',
        },
      ],
    },
    {
      actionId: 'choice_b_leave_calm_space',
      labelSpokenText: '先离开起哄的地方，走向好朋友或老师看得到的区域。',
      actionDescription: '主动退出冲突现场，回到安全同伴或大人视线范围内。',
      locusOfControl: 'INTERNAL_CONTROL',
      privacyLevel: 'NO_DISCLOSURE',
      isSafeBoundaryAction: true,
      isEmergencyHelp: false,
      isDiscretionaryChoice: false,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_b3_moved_away',
          feedbackScenario: '一种可能：离开冲突区后心情慢慢平复',
          feedbackSpokenText: '一种可能是，你走到了安全的区域，远离了刺耳的声音；如果心里还是很难受，随时可以告诉身边信任的大人。',
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
    spokenExitGuidance: '如果你现在觉得很不舒服，可以直接合上屏幕，走到身边安全的大人那里。',
  },

  isHeldOutTransfer: true,
  surfaceDomain: 'school',

  provenance: {
    author: 'A-LAND 研发草拟',
    sourceDescription: '基于校园反欺凌与反偏见规范草拟（待独立专业伦理审核）',
    reviewStatus: 'PENDING_REVIEW',
    reviewedBy: '',
    reviewDate: '',
    pedagogicalNotes: '待独立专业审核：欺凌行为不可商量权衡，受害者无须同理或原谅施害者，首要任务是离开与求助。',
  },
};
