/**
 * 场景 C：原定的户外活动因为下雨取消
 * 
 * 认知目标：
 * 1. 结构迁移：位置决定视角效应 (PERSPECTIVE_DEPENDENT_EFFECT)。
 * 2. 区分可控与不可控控制点 (Locus of Control)。
 * 3. 拒绝有毒的强制积极思考 (Anti-Toxic Positivity)。
 * 4. R3-03：在独立专业审核完成前保持 PENDING_REVIEW，不编造专家委员会。
 */

import { UnifiedSceneDefinition, CognitiveLayer } from '../types';
import { StructureId } from '../../transfer/types';
import { Boundary } from '../../safety/types';

export const SCENARIO_C_RAINY_OUTDOOR_CANCEL: UnifiedSceneDefinition = {
  sceneId: 'SCENE_C_RAINY_OUTDOOR_CANCEL_V1',
  version: '1.0.0',
  ageBand: 'AGE_6_8',
  title: '天空下起了大雨',
  contextNarrationSpokenText: '今天原本是期待了一整周的公园野餐和踢足球日，你早早就换好了运动鞋。可是刚走到门口，窗外突然乌云密布，哗啦啦下起了倾盆大雨，大人叹了口气说：“今天去不成公园了。”',

  cognitiveStructureId: StructureId.PERSPECTIVE_DEPENDENT_EFFECT,
  activeLayers: [
    CognitiveLayer.TING_PAUSE,
    CognitiveLayer.FEN_SEPARATE,
    CognitiveLayer.TONG_PERSPECTIVE,
    CognitiveLayer.ZE_CHOOSE,
    CognitiveLayer.YAN_VERIFY,
  ],

  pauseGroundingPrompt: '停一下。看着窗外的雨滴，深吸一口气。你的鞋子已经穿好了，期待了一周的活动落空了，你可以叹一口气，也可以撅起嘴巴。',

  confirmedFacts: [
    '今天原计划去公园野餐踢球',
    '窗外正在下大雨，公园草坪湿透了不能去',
    '大人宣布今天的户外活动取消',
  ],

  characterEmotions: [
    {
      characterName: '我',
      emotionWord: '失望、沮丧与委屈',
      bodilySensation: '肩膀耷拉下来，胸口闷闷的，眼眶有点湿',
    },
    {
      characterName: '花园里的小草和蜗牛',
      emotionWord: '舒畅与欢喜',
      bodilySensation: '叶子喝饱了水伸展开来，蜗牛探出了触角',
    },
    {
      characterName: '种菜的农夫伯伯',
      emotionWord: '松了一口气',
      bodilySensation: '很久没下雨了，菜苗终于可以喝水了',
    },
  ],

  interpretationsAndGuesses: [
    {
      characterName: '我',
      guessOrThought: '今天真是最糟糕、最讨厌的一天，什么好事情都没有了。（这是失望时的脑补念头，不是客观事实）',
      isConfirmed: false,
    },
  ],

  unconfirmedInformation: [
    '这场雨会下多久，下午会不会变小，我们尚未确认',
    '在家里能不能玩出其他好玩的事情，我们尚未尝试确认',
  ],

  perspectives: [
    {
      characterId: 'char_child',
      characterName: '期待踢球的我',
      visibleInformation: [
        '看到了取消的通知和湿漉漉的窗外',
        '知道自己为了今天期待准备了整整一个星期',
      ],
      hiddenInformation: [
        '一时看不到雨水给大自然带来的生机',
      ],
      emotionalState: '失望与计划落空',
      perspectiveLimitation: '只看到了活动取消带来的难过损失',
    },
    {
      characterId: 'char_nature',
      characterName: '田野与植物',
      visibleInformation: [
        '土地已经干裂了好几天',
        '迎来了清凉滋润的雨水',
      ],
      hiddenInformation: [
        '不知道人类小朋友在家里准备了足球',
      ],
      emotionalState: '欣喜解渴',
      perspectiveLimitation: '根据大自然的生长规律运转',
    },
  ],

  safetyBoundaryAssessment: {
    isBoundaryTriggered: false,
    boundaryType: Boundary.NONE,
    triggerReason: '自然天气变化，无身体伤害、无欺凌、无隐私泄露。',
    bypassTradeoffFlow: false,
  },

  actionChoices: [
    {
      actionId: 'choice_c_acknowledge_disappointment',
      labelSpokenText: '允许自己失望一会儿：“我很失望，我想坐在地毯上发呆 5 分钟，抱抱我的玩偶。”',
      actionDescription: '诚实接纳自己的感受，不逼迫自己强颜欢笑。等心情慢慢平静下来再做决定。',
      locusOfControl: 'INTERNAL_CONTROL',
      privacyLevel: 'NO_DISCLOSURE',
      isSafeBoundaryAction: false,
      isEmergencyHelp: false,
      isDiscretionaryChoice: true,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_c1_calmed_down',
          feedbackScenario: '一种可能：抱紧玩偶静静坐了一会儿',
          feedbackSpokenText: '抱着软软的玩偶，肩膀可能渐渐放松下来。失望的感觉是允许存在的，不用逼自己马上开心。',
          allowsReadjustment: true,
          outcomeType: 'CALM_RESULT',
        },
      ],
    },
    {
      actionId: 'choice_c_indoor_tent_alternative',
      labelSpokenText: '把精力转到自己能决定的事情上：“虽然不能去公园，但我们可以在客厅用被子搭一个‘室内探险帐篷’！”',
      actionDescription: '区分不可控的天气与可控的室内活动，在自己可掌控的范围内尝试新玩法。',
      locusOfControl: 'INTERNAL_CONTROL',
      privacyLevel: 'NO_DISCLOSURE',
      isSafeBoundaryAction: false,
      isEmergencyHelp: false,
      isDiscretionaryChoice: true,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_c2_fun_indoors',
          feedbackScenario: '一种可能：客厅帐篷搭好了',
          feedbackSpokenText: '一种可能是，你和家人用被子和椅子搭了一座帐篷，在客厅里玩起了室内探险。',
          allowsReadjustment: true,
          outcomeType: 'OBSERVED_FACT',
        },
      ],
    },
    {
      actionId: 'choice_c_observe_rain_together',
      labelSpokenText: '走到窗前看雨：“看看窗户上的小雨滴在赛跑，找找泥土里的蜗牛有没有钻出来。”',
      actionDescription: '换个角度观察大自然的真实发生，看看窗外的雨景。',
      locusOfControl: 'INTERNAL_CONTROL',
      privacyLevel: 'NO_DISCLOSURE',
      isSafeBoundaryAction: false,
      isEmergencyHelp: false,
      isDiscretionaryChoice: true,
      potentialFeedbacks: [
        {
          outcomeId: 'fb_c3_snail_observed',
          feedbackScenario: '一种可能：看到了花坛边的雨滴和蜗牛',
          feedbackSpokenText: '窗外的花坛里，雨水正落在树叶上，你观察到了平时晴天看不到的雨中景色。',
          allowsReadjustment: true,
          outcomeType: 'OBSERVED_FACT',
        },
      ],
    },
  ],

  requiresAdultCoReading: false,

  exitOrPauseOptions: {
    allowSilence: true,
    allowPassOrSkip: true,
    allowPrivateKeep: true,
    spokenExitGuidance: '计划泡汤的时候，难过是完全正常的。你不需要逼自己立刻笑出来。',
  },

  isHeldOutTransfer: true,
  surfaceDomain: 'nature',

  // 关键：允许孩子保持失望，拒绝强迫积极思维
  allowNegativeEmotionPreservation: true,

  provenance: {
    author: 'A-LAND 研发草拟',
    sourceDescription: '基于儿童控制点理论与情绪接纳原理草拟（待独立专业伦理审核）',
    reviewStatus: 'PENDING_REVIEW',
    reviewedBy: '',
    reviewDate: '',
    pedagogicalNotes: '待独立专业审核：训练“事实 vs 解释”以及“视角效应”，捍卫儿童真实失望情绪的正当性。',
  },
};
