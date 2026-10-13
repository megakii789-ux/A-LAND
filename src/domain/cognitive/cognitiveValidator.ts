/**
 * 认知内核统一场景验证器 (Cognitive Kernel Scene Validator V1.0)
 * 严格执行 docs/COGNITIVE_CONSTITUTION_V1.md 与 docs/SCENE_SCHEMA_V1.md
 * 
 * 核心职责：
 * 1. 结构完整性与类型守卫
 * 2. 严厉审查五条不可违背的宪法级铁律 (Constitution Rules A-E)
 * 3. 事实与猜想隔离验证 (分)
 * 4. 多视角可见与不可见信息验证 (通)
 * 5. 安全边界绝对优先权验证 (辨)
 * 6. 自主行动控制点与隐私无迫度验证 (择)
 * 7. 反馈可复验修正验证 (验)
 */

import {
  UnifiedSceneDefinition,
  SceneValidationError,
  SceneValidationResult,
  CognitiveConstitutionRule,
  CognitiveLayer,
} from './types';
import { isRegisteredStructureId } from '../transfer/structureRegistry';
import { Boundary } from '../safety/types';
import { ContentAuditRegistry } from './ContentAuditRegistry';


/**
 * 违反宪法原则 A 的违禁词汇表 (将人和家庭整体定性/贴全局标签)
 */
const FORBIDDEN_GLOBAL_LABELS = [
  '坏人',
  '好人',
  '坏孩子',
  '坏小孩',
  '坏爸爸',
  '坏妈妈',
  '不正常的家庭',
  '怪家庭',
  '怪人',
  '怪孩子',
  '完整家庭',
  '不完整家庭',
  '残缺家庭',
  '破碎家庭',
  '失败家庭',
  '畸形家庭',
];

/**
 * 违反宪法原则 B 的伤害合理化违禁词汇 (要求受害者忍受欺凌或合理化暴力)
 */
const FORBIDDEN_HARM_JUSTIFICATIONS = [
  '原谅欺凌',
  '忍受打骂',
  '默默挨打',
  '他有难处所以打你没关系',
  '理解他就不觉得痛了',
  '只要理解欺凌者就不用求助',
  '假装没被欺负',
];

/**
 * 违反宪法原则 C 的强迫公开披露与羞耻捆绑词汇
 */
const FORBIDDEN_PRIVACY_COERCION = [
  '只有公开说出来才是勇敢',
  '必须全部告诉大家',
  '不说就是胆小鬼',
  '瞒着大家是可耻的',
  '只有大声承认父母分开才是好孩子',
];

/**
 * 违反反强迫积极思考 (Anti-Toxic Positivity) 的压抑情绪词汇
 */
const FORBIDDEN_TOXIC_POSITIVITY = [
  '不准难过',
  '哭是没用的所以必须笑',
  '必须立刻开心起来',
  '不能感到失望',
  '强行笑出来',
];

/**
 * 深度递归提取场景中的全部文本，用于合规性敏感词审查
 */
function extractAllSceneTexts(scene: UnifiedSceneDefinition): string[] {
  const texts: string[] = [
    scene.title,
    scene.contextNarrationSpokenText,
    scene.pauseGroundingPrompt || '',
    scene.reflectionVerificationPrompt || '',
    scene.exitOrPauseOptions.spokenExitGuidance,
    ...scene.confirmedFacts,
    ...scene.unconfirmedInformation,
  ];

  for (const emotion of scene.characterEmotions) {
    texts.push(emotion.emotionWord);
    if (emotion.bodilySensation) texts.push(emotion.bodilySensation);
  }

  for (const guess of scene.interpretationsAndGuesses) {
    texts.push(guess.guessOrThought);
  }

  for (const perspective of scene.perspectives) {
    texts.push(...perspective.visibleInformation);
    texts.push(...perspective.hiddenInformation);
    if (perspective.emotionalState) texts.push(perspective.emotionalState);
    if (perspective.perspectiveLimitation) texts.push(perspective.perspectiveLimitation);
  }

  for (const choice of scene.actionChoices) {
    texts.push(choice.labelSpokenText);
    texts.push(choice.actionDescription);
    for (const feedback of choice.potentialFeedbacks) {
      texts.push(feedback.feedbackScenario);
      texts.push(feedback.feedbackSpokenText);
    }
  }

  return texts;
}

/**
 * 校验场景是否满足统一 Scene Schema 与认知宪法
 */
export function validateUnifiedScene(scene: unknown): SceneValidationResult {
  const errors: SceneValidationError[] = [];
  const verifiedLayers: CognitiveLayer[] = [];

  if (!scene || typeof scene !== 'object') {
    return {
      isValid: false,
      sceneId: 'UNKNOWN',
      errors: [{ code: 'INVALID_OBJECT', message: 'Scene definition must be a non-null object' }],
      verifiedLayers: [],
    };
  }

  const s = scene as Partial<UnifiedSceneDefinition>;
  const sceneId = s.sceneId || 'UNKNOWN';

  // 1. 基础元数据验证
  if (!s.sceneId || typeof s.sceneId !== 'string' || s.sceneId.trim().length === 0) {
    errors.push({ code: 'MISSING_SCENE_ID', message: 'sceneId is required' });
  }
  if (!s.version || typeof s.version !== 'string') {
    errors.push({ code: 'MISSING_VERSION', message: 'version is required' });
  }
  if (!s.ageBand || !['AGE_5_7', 'AGE_6_8', 'AGE_7_9'].includes(s.ageBand)) {
    errors.push({ code: 'INVALID_AGE_BAND', message: 'Valid ageBand is required (AGE_5_7, AGE_6_8, AGE_7_9)' });
  }
  if (!s.title || s.title.trim().length === 0) {
    errors.push({ code: 'MISSING_TITLE', message: 'title is required' });
  }
  if (!s.contextNarrationSpokenText || s.contextNarrationSpokenText.trim().length === 0) {
    errors.push({ code: 'MISSING_NARRATION', message: 'contextNarrationSpokenText is required for child voice-first interface' });
  }

  // 2. 认知结构标识检验
  if (!s.cognitiveStructureId || !isRegisteredStructureId(s.cognitiveStructureId)) {
    errors.push({
      code: 'INVALID_STRUCTURE_ID',
      message: `cognitiveStructureId "${String(s.cognitiveStructureId)}" must be registered in STRUCTURE_REGISTRY`,
    });
  }

  if (!Array.isArray(s.activeLayers) || s.activeLayers.length === 0) {
    errors.push({ code: 'MISSING_ACTIVE_LAYERS', message: 'activeLayers must declare at least one active cognitive layer' });
  } else {
    for (const layer of s.activeLayers) {
      verifiedLayers.push(layer);
    }
  }

  // 3. 宪法原则 A 检验：不将人或家庭贴全局标签
  const allTexts = extractAllSceneTexts(s as UnifiedSceneDefinition);
  for (const text of allTexts) {
    for (const forbiddenLabel of FORBIDDEN_GLOBAL_LABELS) {
      if (text.includes(forbiddenLabel)) {
        errors.push({
          code: 'CONSTITUTION_RULE_A_VIOLATION',
          ruleViolated: CognitiveConstitutionRule.RULE_A_NO_GLOBAL_LABELING,
          message: `Violates Rule A: text contains forbidden global moral/normalcy label "${forbiddenLabel}" in "${text.slice(0, 30)}..."`,
        });
      }
    }
  }

  // 4. 宪法原则 B 检验：理解对方原因不等于允许伤害行为
  const isBoundaryTriggered = s.safetyBoundaryAssessment?.isBoundaryTriggered === true;
  const boundaryType = s.safetyBoundaryAssessment?.boundaryType || Boundary.NONE;
  const isHarmOrBullying =
    boundaryType === Boundary.PHYSICAL_HARM ||
    boundaryType === Boundary.PHYSICAL_SAFETY ||
    boundaryType === Boundary.PSYCHOLOGICAL_SAFETY ||
    boundaryType === Boundary.PRIVACY_BOUNDARY ||
    boundaryType === Boundary.SECRECY_COERCION;

  if (isBoundaryTriggered && isHarmOrBullying) {
    // 铁律：触及伤害边界时，必须 bypassTradeoffFlow === true，禁止双面币/天平权衡讨论
    if (s.safetyBoundaryAssessment?.bypassTradeoffFlow !== true) {
      errors.push({
        code: 'CONSTITUTION_RULE_B_VIOLATION',
        ruleViolated: CognitiveConstitutionRule.RULE_B_UNDERSTANDING_NOT_PERMITTING_HARM,
        message: 'Violates Rule B: When physical/psychological harm or bullying is triggered, bypassTradeoffFlow MUST be true to prevent legitimizing harm through tradeoff tools.',
      });
    }

    // 严禁存在将伤害合理化的文案
    for (const text of allTexts) {
      for (const justification of FORBIDDEN_HARM_JUSTIFICATIONS) {
        if (text.includes(justification)) {
          errors.push({
            code: 'CONSTITUTION_RULE_B_VIOLATION',
            ruleViolated: CognitiveConstitutionRule.RULE_B_UNDERSTANDING_NOT_PERMITTING_HARM,
            message: `Violates Rule B: Harmful justification found: "${justification}"`,
          });
        }
      }
    }

    // 必须有明确的安全边界行动
    const hasSafeAction = s.actionChoices?.some((c) => c.isSafeBoundaryAction || c.isEmergencyHelp);
    if (!hasSafeAction) {
      errors.push({
        code: 'MISSING_SAFE_BOUNDARY_ACTION',
        ruleViolated: CognitiveConstitutionRule.RULE_B_UNDERSTANDING_NOT_PERMITTING_HARM,
        message: 'Violates Rule B: When safety boundary is triggered, at least one safe boundary action or emergency help action must be provided.',
      });
    }
  }

  // 5. 宪法原则 C 检验：不强迫儿童讲述家庭隐私，允许不说/少说/私下说
  for (const text of allTexts) {
    for (const coercion of FORBIDDEN_PRIVACY_COERCION) {
      if (text.includes(coercion)) {
        errors.push({
          code: 'CONSTITUTION_RULE_C_VIOLATION',
          ruleViolated: CognitiveConstitutionRule.RULE_C_NO_FORCED_PRIVACY_DISCLOSURE,
          message: `Violates Rule C: Coercive public disclosure framing found: "${coercion}"`,
        });
      }
    }
  }

  // 退出与沉默支持检验
  if (!s.exitOrPauseOptions) {
    errors.push({
      code: 'MISSING_EXIT_OPTIONS',
      ruleViolated: CognitiveConstitutionRule.RULE_C_NO_FORCED_PRIVACY_DISCLOSURE,
      message: 'exitOrPauseOptions is required to ensure no-shame exits.',
    });
  } else {
    if (!s.exitOrPauseOptions.allowSilence && !s.exitOrPauseOptions.allowPrivateKeep && !s.exitOrPauseOptions.allowPassOrSkip) {
      errors.push({
        code: 'CONSTITUTION_RULE_C_VIOLATION',
        ruleViolated: CognitiveConstitutionRule.RULE_C_NO_FORCED_PRIVACY_DISCLOSURE,
        message: 'Violates Rule C: Scene must permit silence, skipping, or private keeping without penalty.',
      });
    }
    if (!s.exitOrPauseOptions.spokenExitGuidance || s.exitOrPauseOptions.spokenExitGuidance.trim().length === 0) {
      errors.push({
        code: 'MISSING_EXIT_SPOKEN_GUIDANCE',
        message: 'spokenExitGuidance is required to comfort the child when opting out.',
      });
    }
  }

  // 若情境涉及家庭隐私，必须提供非公开披露的动作选项
  const isPrivacyContext = s.surfaceDomain === 'two_homes' || s.title?.includes('父母') || s.contextNarrationSpokenText?.includes('分开');
  if (isPrivacyContext && Array.isArray(s.actionChoices)) {
    const hasNonDisclosureOption = s.actionChoices.some(
      (c) => c.privacyLevel === 'NO_DISCLOSURE' || c.privacyLevel === 'MINIMAL_DISCLOSURE' || c.privacyLevel === 'PRIVATE_TO_TRUSTED_ADULT'
    );
    if (!hasNonDisclosureOption) {
      errors.push({
        code: 'CONSTITUTION_RULE_C_VIOLATION',
        ruleViolated: CognitiveConstitutionRule.RULE_C_NO_FORCED_PRIVACY_DISCLOSURE,
        message: 'Violates Rule C: Family privacy scenes must provide choices allowing non-disclosure, minimal disclosure, or private adult sharing.',
      });
    }
  }

  // 6. 宪法原则 D 检验：禁止心理诊断、人格评分与单次点击能力推断
  // 检查是否包含任何评分或人格标签
  const rawScene = s as Record<string, unknown>;
  const forbiddenDiagnosticKeys = ['psychologicalScore', 'personalityTrait', 'stabilityRating', 'diagnosticScore', 'iqScore', 'gritRating'];
  for (const key of forbiddenDiagnosticKeys) {
    if (key in rawScene) {
      errors.push({
        code: 'CONSTITUTION_RULE_D_VIOLATION',
        ruleViolated: CognitiveConstitutionRule.RULE_D_NO_PSYCHOLOGICAL_DIAGNOSIS,
        message: `Violates Rule D: Forbidden diagnostic/scoring property "${key}" present in scene definition.`,
      });
    }
  }

  // 7. 宪法原则 E 检验：面对真正伤害/威胁，优先提供安全退出和寻找现实支持的路径
  if (isBoundaryTriggered && isHarmOrBullying) {
    if (!s.safetyBoundaryAssessment?.emergencyRealityActions || s.safetyBoundaryAssessment.emergencyRealityActions.length === 0) {
      errors.push({
        code: 'CONSTITUTION_RULE_E_VIOLATION',
        ruleViolated: CognitiveConstitutionRule.RULE_E_SAFETY_FIRST_REALITY_SUPPORT,
        message: 'Violates Rule E: High-boundary scenes must define concrete emergencyRealityActions for reality support.',
      });
    }
  }

  // 8. 事实、感受、解释严格分离检验 (分)
  if (!Array.isArray(s.confirmedFacts) || s.confirmedFacts.length === 0) {
    errors.push({ code: 'MISSING_FACTS', message: 'confirmedFacts must contain at least one verifiable objective fact' });
  }

  if (!Array.isArray(s.interpretationsAndGuesses) || s.interpretationsAndGuesses.length === 0) {
    errors.push({ code: 'MISSING_GUESSES', message: 'interpretationsAndGuesses must delineate subjective thoughts/assumptions' });
  } else {
    for (const guess of s.interpretationsAndGuesses) {
      if (guess.isConfirmed !== false) {
        errors.push({
          code: 'GUESS_CANNOT_BE_CONFIRMED',
          message: `Interpretations/guesses cannot be marked as confirmed fact: "${guess.guessOrThought}"`,
        });
      }
    }
  }

  // 9. 视角与未确认信息检验 (通)
  if (!Array.isArray(s.perspectives) || s.perspectives.length < 2) {
    errors.push({ code: 'INSUFFICIENT_PERSPECTIVES', message: 'perspectives must delineate at least 2 distinct character perspectives' });
  }

  if (!Array.isArray(s.unconfirmedInformation) || s.unconfirmedInformation.length === 0) {
    errors.push({ code: 'MISSING_UNCONFIRMED_INFO', message: 'unconfirmedInformation must define epistemic unknowns/blind spots' });
  }

  // 10. 行动选择与反馈检验 (择 & 验)
  if (!Array.isArray(s.actionChoices) || s.actionChoices.length < 2) {
    errors.push({ code: 'INSUFFICIENT_CHOICES', message: 'actionChoices must provide at least 2 distinct agentic choices' });
  } else {
    let hasReadjustableFeedback = false;
    for (const choice of s.actionChoices) {
      if (!choice.labelSpokenText || choice.labelSpokenText.trim().length === 0) {
        errors.push({ code: 'CHOICE_MISSING_SPOKEN_LABEL', message: `Choice ${choice.actionId} is missing labelSpokenText` });
      }
      if (!Array.isArray(choice.potentialFeedbacks) || choice.potentialFeedbacks.length === 0) {
        errors.push({ code: 'CHOICE_MISSING_FEEDBACKS', message: `Choice ${choice.actionId} must have at least one potentialFeedback` });
      } else {
        for (const fb of choice.potentialFeedbacks) {
          if (fb.allowsReadjustment) hasReadjustableFeedback = true;
        }
      }
    }

    // 验：系统必须至少有一个支持观察反馈后重新调整的出口
    if (!hasReadjustableFeedback) {
      errors.push({
        code: 'MISSING_READJUSTABLE_FEEDBACK',
        message: 'At least one choice feedback consequence must have allowsReadjustment === true to fulfill Layer 6 (验).',
      });
    }
  }

  // 11. 反强迫积极思考 (Anti-Toxic Positivity)
  if (s.allowNegativeEmotionPreservation === true) {
    for (const text of allTexts) {
      for (const toxic of FORBIDDEN_TOXIC_POSITIVITY) {
        if (text.includes(toxic)) {
          errors.push({
            code: 'TOXIC_POSITIVITY_VIOLATION',
            message: `Scene violates emotional validation: forbidden toxic positivity phrase "${toxic}" found.`,
          });
        }
      }
    }
  }

  // 12. 专业审核状态
  if (!s.provenance) {
    errors.push({ code: 'MISSING_PROVENANCE', message: 'provenance information is required' });
  } else if (s.provenance.reviewStatus !== 'REVIEWED_SAFE') {
    errors.push({
      code: 'UNREVIEWED_SCENE',
      message: `Scene reviewStatus is "${s.provenance.reviewStatus}"; must be "REVIEWED_SAFE" to enter child runtime.`,
    });
  }

  // 13. Content Audit Registry Verification
  if (!ContentAuditRegistry.canRenderContent(sceneId)) {
    errors.push({
      code: 'UNAUDITED_CONTENT',
      message: `Scene "${sceneId}" does not have a valid audit record in ContentAuditRegistry.`,
    });
  }

  return {
    isValid: errors.length === 0,
    sceneId,
    errors,
    verifiedLayers,
  };
}

