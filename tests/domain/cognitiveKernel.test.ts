import { describe, it, expect } from 'vitest';
import {
  CognitiveLayer,
  CognitiveConstitutionRule,
  validateUnifiedScene,
  SCENARIO_A_PEER_ASKING_RESIDENCE,
  SCENARIO_B_PEER_BULLYING_FAMILY,
  SCENARIO_C_RAINY_OUTDOOR_CANCEL,
  auditSceneTransferCompatibility,
  convertUnifiedSceneToLeaf,
  UnifiedSceneDefinition,
} from '../../src/domain/cognitive';
import { Boundary } from '../../src/domain/safety/types';
import { StructureId } from '../../src/domain/transfer/types';
import { validateLeafDefinition } from '../../src/domain/transfer/transferValidator';

describe('AG-02: 儿童独立判断认知内核 V1.0 架构与契约测试', () => {
  // ================= 1. 六层内部认知模型与枚举健全性 =================
  describe('一、六层内部认知模型体系完整性 (Six Internal Cognitive Layers)', () => {
    it('定义了全部六层内部认知模型 (停、分、通、辨、择、验)', () => {
      const layers = Object.values(CognitiveLayer);
      expect(layers).toContain(CognitiveLayer.TING_PAUSE);
      expect(layers).toContain(CognitiveLayer.FEN_SEPARATE);
      expect(layers).toContain(CognitiveLayer.TONG_PERSPECTIVE);
      expect(layers).toContain(CognitiveLayer.BIAN_DISCERN);
      expect(layers).toContain(CognitiveLayer.ZE_CHOOSE);
      expect(layers).toContain(CognitiveLayer.YAN_VERIFY);
      expect(layers.length).toBe(6);
    });

    it('定义了五条不可违背的宪法级铁律', () => {
      const rules = Object.values(CognitiveConstitutionRule);
      expect(rules).toContain(CognitiveConstitutionRule.RULE_A_NO_GLOBAL_LABELING);
      expect(rules).toContain(CognitiveConstitutionRule.RULE_B_UNDERSTANDING_NOT_PERMITTING_HARM);
      expect(rules).toContain(CognitiveConstitutionRule.RULE_C_NO_FORCED_PRIVACY_DISCLOSURE);
      expect(rules).toContain(CognitiveConstitutionRule.RULE_D_NO_PSYCHOLOGICAL_DIAGNOSIS);
      expect(rules).toContain(CognitiveConstitutionRule.RULE_E_SAFETY_FIRST_REALITY_SUPPORT);
      expect(rules.length).toBe(5);
    });
  });

  // ================= 2. 三个基准场景机器可读定义验证 =================
  describe('二、三个核心基准场景合规性检验 (Three Benchmark Scenarios)', () => {
    it('场景 A (同学问起父母分开居住) 100% 通过统一验证器', () => {
      const result = validateUnifiedScene(SCENARIO_A_PEER_ASKING_RESIDENCE);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.sceneId).toBe('SCENE_A_PEER_ASKING_RESIDENCE_V1');

      // 验证包含非公开披露行动 (不说、少说、私下说)
      const choices = SCENARIO_A_PEER_ASKING_RESIDENCE.actionChoices;
      const minimalChoice = choices.find((c) => c.privacyLevel === 'MINIMAL_DISCLOSURE');
      const noDisclosureChoice = choices.find((c) => c.privacyLevel === 'NO_DISCLOSURE');
      const adultChoice = choices.find((c) => c.privacyLevel === 'PRIVATE_TO_TRUSTED_ADULT');

      expect(minimalChoice).toBeDefined();
      expect(noDisclosureChoice).toBeDefined();
      expect(adultChoice).toBeDefined();

      // 验证退出支持
      expect(SCENARIO_A_PEER_ASKING_RESIDENCE.exitOrPauseOptions.allowSilence).toBe(true);
    });

    it('场景 B (同学嘲讽欺凌家庭) 100% 通过统一验证器并坚守安全围栏', () => {
      const result = validateUnifiedScene(SCENARIO_B_PEER_BULLYING_FAMILY);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);

      // 验证安全边界优先
      expect(SCENARIO_B_PEER_BULLYING_FAMILY.safetyBoundaryAssessment.isBoundaryTriggered).toBe(true);
      expect(SCENARIO_B_PEER_BULLYING_FAMILY.safetyBoundaryAssessment.bypassTradeoffFlow).toBe(true);
      expect(SCENARIO_B_PEER_BULLYING_FAMILY.safetyBoundaryAssessment.emergencyRealityActions?.length).toBeGreaterThan(0);

      // 验证包含明确现实求助或安全退出
      const hasEmergencyOrBoundaryAction = SCENARIO_B_PEER_BULLYING_FAMILY.actionChoices.some(
        (c) => c.isEmergencyHelp || c.isSafeBoundaryAction
      );
      expect(hasEmergencyOrBoundaryAction).toBe(true);
    });

    it('场景 C (下雨活动取消) 100% 通过统一验证器并捍卫失望情绪的正当性', () => {
      const result = validateUnifiedScene(SCENARIO_C_RAINY_OUTDOOR_CANCEL);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);

      // 验证反强迫积极思考 (允许保持失望)
      expect(SCENARIO_C_RAINY_OUTDOOR_CANCEL.allowNegativeEmotionPreservation).toBe(true);

      // 验证区分控制点
      const internalChoices = SCENARIO_C_RAINY_OUTDOOR_CANCEL.actionChoices.filter(
        (c) => c.locusOfControl === 'INTERNAL_CONTROL'
      );
      expect(internalChoices.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ================= 3. 宪法级铁律负向测试 =================
  describe('三、安全边界、拒绝表达与宪法铁律负向测试 (Negative Security & Constitution Tests)', () => {
    it('负向测试 1: 企图在欺凌场景中关闭 bypassTradeoffFlow 触发 RULE_B 违规', () => {
      const invalidScene: UnifiedSceneDefinition = {
        ...SCENARIO_B_PEER_BULLYING_FAMILY,
        sceneId: 'TEST_INVALID_BULLY_TRADEOFF',
        safetyBoundaryAssessment: {
          ...SCENARIO_B_PEER_BULLYING_FAMILY.safetyBoundaryAssessment,
          bypassTradeoffFlow: false, // 企图在欺凌情境下开启双面币权衡！
        },
      };

      const result = validateUnifiedScene(invalidScene);
      expect(result.isValid).toBe(false);
      const err = result.errors.find((e) => e.code === 'CONSTITUTION_RULE_B_VIOLATION');
      expect(err).toBeDefined();
      expect(err?.message).toContain('bypassTradeoffFlow MUST be true');
    });

    it('负向测试 2: 企图在欺凌场景中文案诱导受害者“忍受打骂 / 原谅欺凌”触发 RULE_B 违规', () => {
      const invalidScene: UnifiedSceneDefinition = {
        ...SCENARIO_B_PEER_BULLYING_FAMILY,
        sceneId: 'TEST_INVALID_FORGIVE_BULLY',
        actionChoices: [
          ...SCENARIO_B_PEER_BULLYING_FAMILY.actionChoices,
          {
            actionId: 'choice_harm_justification',
            labelSpokenText: '原谅欺凌，默默忍受对方的嘲笑',
            actionDescription: '因为他有难处，所以假装没被欺负。',
            locusOfControl: 'INTERNAL_CONTROL',
            privacyLevel: 'NO_DISCLOSURE',
            isSafeBoundaryAction: false,
            isEmergencyHelp: false,
            isDiscretionaryChoice: false,
            potentialFeedbacks: [
              {
                outcomeId: 'fb_bad',
                feedbackScenario: '忍受了嘲笑',
                feedbackSpokenText: '你默默忍受了。',
                allowsReadjustment: false,
                outcomeType: 'SAFETY_AFFIRMATION',
              },
            ],
          },
        ],
      };

      const result = validateUnifiedScene(invalidScene);
      expect(result.isValid).toBe(false);
      const err = result.errors.find((e) => e.code === 'CONSTITUTION_RULE_B_VIOLATION');
      expect(err).toBeDefined();
      expect(err?.message).toContain('Harmful justification found');
    });

    it('负向测试 3: 企图将家庭隐私强迫公开披露并剥夺“不说”权利触发 RULE_C 违规', () => {
      const invalidScene: UnifiedSceneDefinition = {
        ...SCENARIO_A_PEER_ASKING_RESIDENCE,
        sceneId: 'TEST_INVALID_FORCED_DISCLOSURE',
        contextNarrationSpokenText: '只有公开说出来才是勇敢的小孩，不说就是胆小鬼！',
        actionChoices: [
          {
            actionId: 'choice_public_only',
            labelSpokenText: '必须全部告诉大家我的父母为什么分开',
            actionDescription: '公开详述家庭所有细节',
            locusOfControl: 'INTERNAL_CONTROL',
            privacyLevel: 'PUBLIC_DISCLOSURE', // 只有公开披露！
            isSafeBoundaryAction: false,
            isEmergencyHelp: false,
            isDiscretionaryChoice: true,
            potentialFeedbacks: [
              {
                outcomeId: 'fb_pub',
                feedbackScenario: '全班都知道了',
                feedbackSpokenText: '大家都知道了。',
                allowsReadjustment: true,
                outcomeType: 'PEER_REACTION',
              },
            ],
          },
          {
            actionId: 'choice_public_two',
            labelSpokenText: '大声说出家庭地址',
            actionDescription: '公开披露',
            locusOfControl: 'INTERNAL_CONTROL',
            privacyLevel: 'PUBLIC_DISCLOSURE',
            isSafeBoundaryAction: false,
            isEmergencyHelp: false,
            isDiscretionaryChoice: true,
            potentialFeedbacks: [
              {
                outcomeId: 'fb_pub_2',
                feedbackScenario: '公开了',
                feedbackSpokenText: '公开了。',
                allowsReadjustment: true,
                outcomeType: 'PEER_REACTION',
              },
            ],
          },
        ],
      };

      const result = validateUnifiedScene(invalidScene);
      expect(result.isValid).toBe(false);
      const ruleCErrors = result.errors.filter((e) => e.ruleViolated === CognitiveConstitutionRule.RULE_C_NO_FORCED_PRIVACY_DISCLOSURE);
      expect(ruleCErrors.length).toBeGreaterThan(0);
    });

    it('负向测试 4: 企图剥夺所有无羞耻退出/沉默支持触发 RULE_C 违规', () => {
      const invalidScene: UnifiedSceneDefinition = {
        ...SCENARIO_A_PEER_ASKING_RESIDENCE,
        sceneId: 'TEST_NO_EXIT',
        exitOrPauseOptions: {
          allowSilence: false,
          allowPassOrSkip: false,
          allowPrivateKeep: false,
          spokenExitGuidance: '必须回答！',
        },
      };

      const result = validateUnifiedScene(invalidScene);
      expect(result.isValid).toBe(false);
      const err = result.errors.find((e) => e.message.includes('permit silence, skipping, or private keeping'));
      expect(err).toBeDefined();
    });

    it('负向测试 5: 企图给家庭或人贴“不正常家庭 / 破碎家庭 / 坏人”全局标签触发 RULE_A 违规', () => {
      const invalidScene: UnifiedSceneDefinition = {
        ...SCENARIO_A_PEER_ASKING_RESIDENCE,
        sceneId: 'TEST_GLOBAL_LABEL',
        title: '一个不正常家庭的孩子的故事',
        confirmedFacts: ['主角来自一个残缺家庭'],
      };

      const result = validateUnifiedScene(invalidScene);
      expect(result.isValid).toBe(false);
      const err = result.errors.find((e) => e.code === 'CONSTITUTION_RULE_A_VIOLATION');
      expect(err).toBeDefined();
      expect(err?.message).toContain('forbidden global moral/normalcy label');
    });

    it('负向测试 6: 企图在场景定义中注入心理评分或诊断属性触发 RULE_D 违规', () => {
      const invalidScene = {
        ...SCENARIO_A_PEER_ASKING_RESIDENCE,
        sceneId: 'TEST_DIAGNOSTIC_INJECTION',
        psychologicalScore: 88, // 严禁的评分字段
        personalityTrait: 'HIGH_ANXIETY', // 严禁的心理特征打标
      };

      const result = validateUnifiedScene(invalidScene);
      expect(result.isValid).toBe(false);
      const err = result.errors.find((e) => e.code === 'CONSTITUTION_RULE_D_VIOLATION');
      expect(err).toBeDefined();
      expect(err?.message).toContain('Forbidden diagnostic/scoring property');
    });

    it('负向测试 7: 企图在挫折情境中强行推行有毒积极思维（“不准难过 / 必须立刻开心起来”）触发违规', () => {
      const invalidScene: UnifiedSceneDefinition = {
        ...SCENARIO_C_RAINY_OUTDOOR_CANCEL,
        sceneId: 'TEST_TOXIC_POSITIVITY',
        contextNarrationSpokenText: '虽然下雨了，但你不准难过，必须立刻开心起来！哭是没用的所以必须笑！',
      };

      const result = validateUnifiedScene(invalidScene);
      expect(result.isValid).toBe(false);
      const err = result.errors.find((e) => e.code === 'TOXIC_POSITIVITY_VIOLATION');
      expect(err).toBeDefined();
      expect(err?.message).toContain('forbidden toxic positivity phrase');
    });

    it('负向测试 8: 缺少已确认事实 (confirmedFacts) 或将主观猜测设为 isConfirmed: true 报错', () => {
      const invalidScene = {
        ...SCENARIO_A_PEER_ASKING_RESIDENCE,
        sceneId: 'TEST_NO_FACTS',
        confirmedFacts: [],
        interpretationsAndGuesses: [
          {
            characterName: '小明',
            guessOrThought: '我认为他讨厌我',
            isConfirmed: true as unknown as false, // 违背强类型约束
          },
        ],
      };

      const result = validateUnifiedScene(invalidScene);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_FACTS')).toBe(true);
      expect(result.errors.some((e) => e.code === 'GUESS_CANNOT_BE_CONFIRMED')).toBe(true);
    });

    it('负向测试 9: 未经审核安全标记（reviewStatus: DRAFT）阻断进入儿童端', () => {
      const draftScene: UnifiedSceneDefinition = {
        ...SCENARIO_A_PEER_ASKING_RESIDENCE,
        sceneId: 'TEST_DRAFT_SCENE',
        provenance: {
          ...SCENARIO_A_PEER_ASKING_RESIDENCE.provenance,
          reviewStatus: 'DRAFT',
        },
      };

      const result = validateUnifiedScene(draftScene);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'UNREVIEWED_SCENE')).toBe(true);
    });

    it('负向测试 10: 所有行动反馈均没有 allowsReadjustment (缺少第 6 层：验) 报错', () => {
      const noReadjustScene: UnifiedSceneDefinition = {
        ...SCENARIO_C_RAINY_OUTDOOR_CANCEL,
        sceneId: 'TEST_NO_READJUST',
        actionChoices: SCENARIO_C_RAINY_OUTDOOR_CANCEL.actionChoices.map((choice) => ({
          ...choice,
          potentialFeedbacks: choice.potentialFeedbacks.map((fb) => ({
            ...fb,
            allowsReadjustment: false, // 全部锁死，不让调整！
          })),
        })),
      };

      const result = validateUnifiedScene(noReadjustScene);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_READJUSTABLE_FEEDBACK')).toBe(true);
    });
  });

  // ================= 4. 现有迁移引擎兼容性验证 =================
  describe('四、现有迁移引擎双向兼容性报告 (Transfer Engine Compatibility)', () => {
    it('场景 A 转换为 LeafDefinition 能 100% 通过既有 validateLeafDefinition', () => {
      const leafA = convertUnifiedSceneToLeaf(SCENARIO_A_PEER_ASKING_RESIDENCE);
      const leafValidation = validateLeafDefinition(leafA);
      expect(leafValidation.isValid).toBe(true);
      expect(leafValidation.errors).toEqual([]);

      const audit = auditSceneTransferCompatibility(SCENARIO_A_PEER_ASKING_RESIDENCE);
      expect(audit.isFullyCompatibleWithTransferEngine).toBe(true);
      expect(audit.sharedStructureId).toBe(StructureId.FACT_VS_INFERENCE);
      expect(audit.structureRegistered).toBe(true);
    });

    it('场景 B 转换为 LeafDefinition 能 100% 通过既有 validateLeafDefinition 并保留边界', () => {
      const leafB = convertUnifiedSceneToLeaf(SCENARIO_B_PEER_BULLYING_FAMILY);
      const leafValidation = validateLeafDefinition(leafB);
      expect(leafValidation.isValid).toBe(true);
      expect(leafValidation.errors).toEqual([]);
      expect(leafB.boundary).toBe(Boundary.PSYCHOLOGICAL_SAFETY);

      const audit = auditSceneTransferCompatibility(SCENARIO_B_PEER_BULLYING_FAMILY);
      expect(audit.isFullyCompatibleWithTransferEngine).toBe(true);
    });

    it('场景 C 转换为 LeafDefinition 能 100% 通过既有 validateLeafDefinition 并映射为自然情境', () => {
      const leafC = convertUnifiedSceneToLeaf(SCENARIO_C_RAINY_OUTDOOR_CANCEL);
      const leafValidation = validateLeafDefinition(leafC);
      expect(leafValidation.isValid).toBe(true);
      expect(leafValidation.errors).toEqual([]);
      expect(leafC.surfaceDomain).toBe('nature');
      expect(leafC.structureId).toBe(StructureId.PERSPECTIVE_DEPENDENT_EFFECT);

      const audit = auditSceneTransferCompatibility(SCENARIO_C_RAINY_OUTDOOR_CANCEL);
      expect(audit.isFullyCompatibleWithTransferEngine).toBe(true);
    });
  });
});
