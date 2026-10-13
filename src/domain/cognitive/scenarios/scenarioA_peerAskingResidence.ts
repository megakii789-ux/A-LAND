/**
 * 场景 A：同学问起父母为什么分开居住
 * 
 * 认知目标：
 * 1. 区分好奇发问（同学客观行为）与恶意探听。
 * 2. 隐私边界自我决定权：家庭事情是私人信息，孩子享有绝对决定权（可不说、少说、私下找信任大人说）。
 * 3. 破除认知偏误：严禁将“大声向全班公开披露”绑架为唯一“勇敢”的行为；不说、保持沉默或简略带过同样是被全力支持的自主选择。
 * 
 * 对应认知结构：
 * StructureId.FACT_VS_INFERENCE & StructureId.MULTI_ATTRIBUTE_IDENTITY
 */

import { UnifiedSceneDefinition, CognitiveLayer } from '../types';
import { StructureId } from '../../transfer/types';
import { Boundary } from '../../safety/types';

export const SCENARIO_A_PEER_ASKING_RESIDENCE: UnifiedSceneDefinition = {
  sceneId: 'SCENE_A_PEER_ASKING_RESIDENCE_V1',
  version: '1.0.0',
  ageBand: 'AGE_6_8',
  title: '课间的一句好奇提问',
  contextNarrationSpokenText: '课间休息时，前桌的小明转过头好奇地问：“上周五放学接你的是你爸爸，怎么平时都是你妈妈来呀？他们不住在一起吗？”',

  cognitiveStructureId: StructureId.FACT_VS_INFERENCE,
  activeLayers: [
    CognitiveLayer.TING_PAUSE,
    CognitiveLayer.FEN_SEPARATE,
    CognitiveLayer.TONG_PERSPECTIVE,
    CognitiveLayer.BIAN_DISCERN,
    CognitiveLayer.ZE_CHOOSE,
    CognitiveLayer.YAN_VERIFY,
  ],

  pauseGroundingPrompt: '停一下，慢慢呼一口气。你不需要马上回答。你的嘴巴和你的心属于你自己。',

  confirmedFacts: [
    '小明问了一句关于接送和住处的话',
    '小明的语气很平常，手里还拿着积木',
    '现在是在教室里，身边还有其他同学走动',
  ],

  characterEmotions: [
    {
      characterName: '我',
      emotionWord: '有些紧张和不知所措',
      bodilySensation: '胸口有点发紧，不知道该怎么回答',
    },
    {
      characterName: '小明',
      emotionWord: '单纯好奇',
      bodilySensation: '眼睛眨了眨，等待回应',
    },
  ],

  interpretationsAndGuesses: [
    {
      characterName: '我',
      guessOrThought: '他是不是在打听我的秘密，如果我不说他会不会笑话我？',
      isConfirmed: false,
    },
    {
      characterName: '小明',
      guessOrThought: '他可能只是看到了不同的接送人，随口问了一句，就像问“你今天穿了哪件外套”一样。',
      isConfirmed: false,
    },
  ],

  unconfirmedInformation: [
    '小明心里到底是怎么想的，我们还不能确认',
    '小明知不知道父母可以分开居住，我们尚未确认',
  ],

  perspectives: [
    {
      characterId: 'char_self',
      characterName: '我',
      visibleInformation: [
        '我看到了小明的提问表情',
        '我知道自己有两个温暖的家和具体的住处安排',
      ],
      hiddenInformation: [
        '我不知道小明问这句话的具体原因',
      ],
      emotionalState: '想要保护自己的个人空间',
      perspectiveLimitation: '很容易以为所有人都在关注自己的家事',
    },
    {
      characterId: 'char_xiaoming',
      characterName: '小明',
      visibleInformation: [
        '小明只看到上周五和今天接送的人不同',
      ],
      hiddenInformation: [
        '小明不知道大人的居住安排',
        '小明不知道这个问题会让对方心里发紧',
      ],
      emotionalState: '好奇探索',
      perspectiveLimitation: '不知道提问涉及到同伴的私人边界',
    },
  ],

  safetyBoundaryAssessment: {
    isBoundaryTriggered: false,
    boundaryType: Boundary.NONE,
    triggerReason: '同伴常规好奇提问，未发生嘲笑、侮辱、身体侵犯或胁迫。',
    bypassTradeoffFlow: false,
  },

  actionChoices: [
    {
      actionId: 'choice_a_minimal_statement',
      labelSpokenText: '少说一点，简单回答一句：“对呀，他们住在不同的房子，但我都在陪着他们。”',
      actionDescription: '用简短客观的一句话回应，既回答了事实，又划定了个人边界，不展开细节。',
      locusOfControl: 'INTERNAL_CONTROL',
      privacyLevel: 'MINIMAL_DISCLOSURE',
      isSafeBoundaryAction: false,
      isEmergencyHelp: false,
      isDiscretionaryChoice: true,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_a1_ok_understood',
          feedbackScenario: '小明听完点点头',
          feedbackSpokenText: '小明听了点点头说：“哦，原来是这样呀！来，我们一起搭积木吧！”',
          allowsReadjustment: true,
          outcomeType: 'PEER_REACTION',
        },
      ],
    },
    {
      actionId: 'choice_a_redirect_privacy',
      labelSpokenText: '礼貌不说，换个话题：“这是我们家的事，我不想聊这个。你看我的新积木！”',
      actionDescription: '坚定且礼貌地保护私人空间，并主动转移注意力。不说完全是被允许和正当的。',
      locusOfControl: 'INTERNAL_CONTROL',
      privacyLevel: 'NO_DISCLOSURE',
      isSafeBoundaryAction: false,
      isEmergencyHelp: false,
      isDiscretionaryChoice: true,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_a2_redirected',
          feedbackScenario: '小明看向了积木',
          feedbackSpokenText: '小明愣了一下，然后说：“好吧，那我们搭积木吧。”',
          allowsReadjustment: true,
          outcomeType: 'PEER_REACTION',
        },
      ],
    },
    {
      actionId: 'choice_a_private_talk_with_adult',
      labelSpokenText: '先不回答，放学后私下告诉信任的爸爸妈妈或老师：“今天有人问我这个，我不知道怎么说。”',
      actionDescription: '把心里的困惑留到安全的环境中，与信任的成人共同商量。',
      locusOfControl: 'CO_REGULATION',
      privacyLevel: 'PRIVATE_TO_TRUSTED_ADULT',
      isSafeBoundaryAction: false,
      isEmergencyHelp: false,
      isDiscretionaryChoice: true,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_a3_adult_coaching',
          feedbackScenario: '大人抱了抱你并给出支持',
          feedbackSpokenText: '大人微笑着说：“你做得很棒，家庭的事情由你自己决定告诉谁。你想怎么回答，我们一起想。”',
          allowsReadjustment: true,
          outcomeType: 'SAFETY_AFFIRMATION',
        },
      ],
    },
  ],

  requiresAdultCoReading: false,

  exitOrPauseOptions: {
    allowSilence: true,
    allowPassOrSkip: true,
    allowPrivateKeep: true,
    spokenExitGuidance: '不想回答或不想说完全没关系。每个人的心里都有一扇属于自己的小门，什么时候开、开多大，完全由你决定。',
  },

  isHeldOutTransfer: true,
  surfaceDomain: 'two_homes',

  provenance: {
    author: 'A-LAND 儿童认知发展工作组',
    sourceDescription: '基于儿童人际交往与家庭隐私边界真实生活情境设计',
    reviewStatus: 'REVIEWED_SAFE',
    reviewedBy: '儿童心理发展与临床伦理专家委员会',
    reviewDate: '2026-10-12',
    pedagogicalNotes: '重点消除“不说就是自卑”的道德绑架，赋予儿童自主设置隐私边界的真实权利。',
  },
};
