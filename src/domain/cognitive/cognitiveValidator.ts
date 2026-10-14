/**
 * 认知内核统一场景验证器 (Cognitive Kernel Scene Validator V1.1 - R3-03 & P1-06 防御加固版)
 * 严格执行 docs/COGNITIVE_CONSTITUTION_V1.md 与 docs/SCENE_SCHEMA_V1.md
 *
 * 核心职责：
 * 1. 结构完整性与类型守卫（对不完整、错误类型及恶意嵌套数据绝不抛出未捕获异常，统一返回可处理的错误）
 * 2. 严厉审查五条不可违背的宪法级铁律 (Constitution Rules A-E)
 * 3. 事实与猜想隔离验证 (分)
 * 4. 多视角可见与不可见信息验证 (通)
 * 5. 安全边界绝对优先权验证 (辨)
 * 6. 自主行动控制点与隐私无迫度验证 (择)
 * 7. 反馈可复验修正验证 (验)
 * 8. R3-03 独立审核验证：禁止无独立审核证据的 REVIEWED_SAFE，禁止仅凭字符串 reviewedBy/reviewDate 认定已审查
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

const VALID_COGNITIVE_LAYERS = new Set<string>(Object.values(CognitiveLayer));

function isPlainRecord(val: unknown): val is Record<string, unknown> {
  return Boolean(val && typeof val === 'object' && !Array.isArray(val));
}

function safeNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * 防御性提取场景中的全部文本（对 null、错误类型、超大数组、恶意 getter 安全降级，不抛异常）
 */
function extractAllSceneTexts(scene: Record<string, unknown>): string[] {
  const texts: string[] = [];
  const pushStr = (v: unknown) => {
    if (typeof v === 'string' && v.length > 0) {
      texts.push(v.slice(0, 5000));
    }
  };

  pushStr(scene.title);
  pushStr(scene.contextNarrationSpokenText);
  pushStr(scene.pauseGroundingPrompt);
  pushStr(scene.reflectionVerificationPrompt);

  if (isPlainRecord(scene.exitOrPauseOptions)) {
    pushStr(scene.exitOrPauseOptions.spokenExitGuidance);
  }

  if (Array.isArray(scene.confirmedFacts)) {
    for (const item of scene.confirmedFacts.slice(0, 100)) {
      pushStr(item);
    }
  }

  if (Array.isArray(scene.unconfirmedInformation)) {
    for (const item of scene.unconfirmedInformation.slice(0, 100)) {
      pushStr(item);
    }
  }

  if (Array.isArray(scene.characterEmotions)) {
    for (const emotion of scene.characterEmotions.slice(0, 100)) {
      if (isPlainRecord(emotion)) {
        pushStr(emotion.emotionWord);
        pushStr(emotion.bodilySensation);
      }
    }
  }

  if (Array.isArray(scene.interpretationsAndGuesses)) {
    for (const guess of scene.interpretationsAndGuesses.slice(0, 100)) {
      if (isPlainRecord(guess)) {
        pushStr(guess.guessOrThought);
      }
    }
  }

  if (Array.isArray(scene.perspectives)) {
    for (const perspective of scene.perspectives.slice(0, 100)) {
      if (isPlainRecord(perspective)) {
        if (Array.isArray(perspective.visibleInformation)) {
          for (const v of perspective.visibleInformation.slice(0, 100)) pushStr(v);
        }
        if (Array.isArray(perspective.hiddenInformation)) {
          for (const h of perspective.hiddenInformation.slice(0, 100)) pushStr(h);
        }
        pushStr(perspective.emotionalState);
        pushStr(perspective.perspectiveLimitation);
      }
    }
  }

  if (Array.isArray(scene.actionChoices)) {
    for (const choice of scene.actionChoices.slice(0, 100)) {
      if (isPlainRecord(choice)) {
        pushStr(choice.labelSpokenText);
        pushStr(choice.actionDescription);
        if (Array.isArray(choice.potentialFeedbacks)) {
          for (const fb of choice.potentialFeedbacks.slice(0, 100)) {
            if (isPlainRecord(fb)) {
              pushStr(fb.feedbackScenario);
              pushStr(fb.feedbackSpokenText);
            }
          }
        }
      }
    }
  }

  return texts;
}

/**
 * 校验场景是否满足统一 Scene Schema 与认知宪法
 * Phase 3 #6: 对不完整、错误类型及恶意嵌套数据，必须返回可处理的错误，不允许未捕获异常。
 */
export function validateUnifiedScene(scene: unknown): SceneValidationResult {
  const errors: SceneValidationError[] = [];
  const verifiedLayers: CognitiveLayer[] = [];

  try {
    if (!isPlainRecord(scene)) {
      return {
        isValid: false,
        sceneId: 'UNKNOWN',
        errors: [{ code: 'INVALID_OBJECT', message: 'Scene definition must be a non-null plain object' }],
        verifiedLayers: [],
        canEnterChildRuntime: false,
      };
    }

    const s = scene as Partial<UnifiedSceneDefinition> & Record<string, unknown>;
    const sceneId = safeNonEmptyString(s.sceneId) ? s.sceneId.trim() : 'UNKNOWN';

    // 1. 基础元数据验证
    if (!safeNonEmptyString(s.sceneId)) {
      errors.push({ code: 'MISSING_SCENE_ID', field: 'sceneId', message: 'sceneId must be a non-empty string' });
    }
    if (!safeNonEmptyString(s.version)) {
      errors.push({ code: 'MISSING_VERSION', field: 'version', message: 'version must be a non-empty string' });
    }
    if (typeof s.ageBand !== 'string' || !['AGE_5_7', 'AGE_6_8', 'AGE_7_9'].includes(s.ageBand)) {
      errors.push({
        code: 'INVALID_AGE_BAND',
        field: 'ageBand',
        message: 'Valid ageBand is required (AGE_5_7, AGE_6_8, AGE_7_9)',
      });
    }
    if (!safeNonEmptyString(s.title)) {
      errors.push({ code: 'MISSING_TITLE', field: 'title', message: 'title must be a non-empty string' });
    }
    if (!safeNonEmptyString(s.contextNarrationSpokenText)) {
      errors.push({
        code: 'MISSING_NARRATION',
        field: 'contextNarrationSpokenText',
        message: 'contextNarrationSpokenText must be a non-empty string for child voice-first interface',
      });
    }

    // 2. 认知结构标识检验
    if (typeof s.cognitiveStructureId !== 'string' || !isRegisteredStructureId(s.cognitiveStructureId)) {
      errors.push({
        code: 'INVALID_STRUCTURE_ID',
        field: 'cognitiveStructureId',
        message: `cognitiveStructureId "${String(s.cognitiveStructureId)}" must be registered in STRUCTURE_REGISTRY`,
      });
    }

    if (!Array.isArray(s.activeLayers) || s.activeLayers.length === 0) {
      errors.push({
        code: 'MISSING_ACTIVE_LAYERS',
        field: 'activeLayers',
        message: 'activeLayers must be a non-empty array of CognitiveLayer',
      });
    } else {
      for (const layer of s.activeLayers) {
        if (typeof layer === 'string' && VALID_COGNITIVE_LAYERS.has(layer)) {
          verifiedLayers.push(layer as CognitiveLayer);
        } else {
          errors.push({
            code: 'INVALID_ACTIVE_LAYER',
            field: 'activeLayers',
            message: `Invalid cognitive layer: "${String(layer)}"`,
          });
        }
      }
    }

    // 3. 宪法原则 A 检验：不将人或家庭贴全局标签
    const allTexts = extractAllSceneTexts(s);
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
    const safetyAssessment = isPlainRecord(s.safetyBoundaryAssessment) ? s.safetyBoundaryAssessment : null;
    if (!safetyAssessment) {
      errors.push({
        code: 'MISSING_SAFETY_ASSESSMENT',
        field: 'safetyBoundaryAssessment',
        message: 'safetyBoundaryAssessment must be a valid object',
      });
    }
    const isBoundaryTriggered = safetyAssessment?.isBoundaryTriggered === true;
    const boundaryType =
      typeof safetyAssessment?.boundaryType === 'string'
        ? (safetyAssessment.boundaryType as Boundary)
        : Boundary.NONE;
    const isHarmOrBullying =
      boundaryType === Boundary.PHYSICAL_HARM ||
      boundaryType === Boundary.PHYSICAL_SAFETY ||
      boundaryType === Boundary.PSYCHOLOGICAL_SAFETY ||
      boundaryType === Boundary.PRIVACY_BOUNDARY ||
      boundaryType === Boundary.SECRECY_COERCION;

    if (isBoundaryTriggered && isHarmOrBullying) {
      // 铁律：触及伤害边界时，必须 bypassTradeoffFlow === true，禁止双面币/天平权衡讨论
      if (safetyAssessment?.bypassTradeoffFlow !== true) {
        errors.push({
          code: 'CONSTITUTION_RULE_B_VIOLATION',
          ruleViolated: CognitiveConstitutionRule.RULE_B_UNDERSTANDING_NOT_PERMITTING_HARM,
          message:
            'Violates Rule B: When physical/psychological harm or bullying is triggered, bypassTradeoffFlow MUST be true to prevent legitimizing harm through tradeoff tools.',
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
      const hasSafeAction =
        Array.isArray(s.actionChoices) &&
        s.actionChoices.some(
          (c) => isPlainRecord(c) && (c.isSafeBoundaryAction === true || c.isEmergencyHelp === true)
        );
      if (!hasSafeAction) {
        errors.push({
          code: 'MISSING_SAFE_BOUNDARY_ACTION',
          ruleViolated: CognitiveConstitutionRule.RULE_B_UNDERSTANDING_NOT_PERMITTING_HARM,
          message:
            'Violates Rule B: When safety boundary is triggered, at least one safe boundary action or emergency help action must be provided.',
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
    if (!isPlainRecord(s.exitOrPauseOptions)) {
      errors.push({
        code: 'MISSING_EXIT_OPTIONS',
        field: 'exitOrPauseOptions',
        ruleViolated: CognitiveConstitutionRule.RULE_C_NO_FORCED_PRIVACY_DISCLOSURE,
        message: 'exitOrPauseOptions is required to ensure no-shame exits.',
      });
    } else {
      const exitOpts = s.exitOrPauseOptions;
      if (
        exitOpts.allowSilence !== true &&
        exitOpts.allowPrivateKeep !== true &&
        exitOpts.allowPassOrSkip !== true
      ) {
        errors.push({
          code: 'CONSTITUTION_RULE_C_VIOLATION',
          ruleViolated: CognitiveConstitutionRule.RULE_C_NO_FORCED_PRIVACY_DISCLOSURE,
          message: 'Violates Rule C: Scene must permit silence, skipping, or private keeping without penalty.',
        });
      }
      if (!safeNonEmptyString(exitOpts.spokenExitGuidance)) {
        errors.push({
          code: 'MISSING_EXIT_SPOKEN_GUIDANCE',
          field: 'exitOrPauseOptions.spokenExitGuidance',
          message: 'spokenExitGuidance is required to comfort the child when opting out.',
        });
      }
    }

    // 若情境涉及家庭隐私，必须提供非公开披露的动作选项
    const titleStr = typeof s.title === 'string' ? s.title : '';
    const narrationStr = typeof s.contextNarrationSpokenText === 'string' ? s.contextNarrationSpokenText : '';
    const isPrivacyContext =
      s.surfaceDomain === 'two_homes' || titleStr.includes('父母') || narrationStr.includes('分开');
    if (isPrivacyContext && Array.isArray(s.actionChoices)) {
      const hasNonDisclosureOption = s.actionChoices.some(
        (c) =>
          isPlainRecord(c) &&
          (c.privacyLevel === 'NO_DISCLOSURE' ||
            c.privacyLevel === 'MINIMAL_DISCLOSURE' ||
            c.privacyLevel === 'PRIVATE_TO_TRUSTED_ADULT')
      );
      if (!hasNonDisclosureOption) {
        errors.push({
          code: 'CONSTITUTION_RULE_C_VIOLATION',
          ruleViolated: CognitiveConstitutionRule.RULE_C_NO_FORCED_PRIVACY_DISCLOSURE,
          message:
            'Violates Rule C: Family privacy scenes must provide choices allowing non-disclosure, minimal disclosure, or private adult sharing.',
        });
      }
    }

    // 6. 宪法原则 D 检验：禁止心理诊断、人格评分与单次点击能力推断
    const forbiddenDiagnosticKeys = [
      'psychologicalScore',
      'personalityTrait',
      'stabilityRating',
      'diagnosticScore',
      'iqScore',
      'gritRating',
    ];
    for (const key of forbiddenDiagnosticKeys) {
      if (key in s) {
        errors.push({
          code: 'CONSTITUTION_RULE_D_VIOLATION',
          ruleViolated: CognitiveConstitutionRule.RULE_D_NO_PSYCHOLOGICAL_DIAGNOSIS,
          message: `Violates Rule D: Forbidden diagnostic/scoring property "${key}" present in scene definition.`,
        });
      }
    }

    // 7. 宪法原则 E 检验：面对真正伤害/威胁，优先提供安全退出和寻找现实支持的路径
    if (isBoundaryTriggered && isHarmOrBullying) {
      const emergencyActions = safetyAssessment?.emergencyRealityActions;
      if (
        !Array.isArray(emergencyActions) ||
        emergencyActions.length === 0 ||
        !emergencyActions.every((item) => safeNonEmptyString(item))
      ) {
        errors.push({
          code: 'CONSTITUTION_RULE_E_VIOLATION',
          ruleViolated: CognitiveConstitutionRule.RULE_E_SAFETY_FIRST_REALITY_SUPPORT,
          message:
            'Violates Rule E: High-boundary scenes must define concrete emergencyRealityActions for reality support.',
        });
      }
    }

    // 8. 事实、感受、解释严格分离检验 (分)
    if (
      !Array.isArray(s.confirmedFacts) ||
      s.confirmedFacts.length === 0 ||
      !s.confirmedFacts.every((f) => safeNonEmptyString(f))
    ) {
      errors.push({
        code: 'MISSING_FACTS',
        field: 'confirmedFacts',
        message: 'confirmedFacts must contain at least one verifiable objective fact string',
      });
    }

    if (!Array.isArray(s.interpretationsAndGuesses) || s.interpretationsAndGuesses.length === 0) {
      errors.push({
        code: 'MISSING_GUESSES',
        field: 'interpretationsAndGuesses',
        message: 'interpretationsAndGuesses must delineate subjective thoughts/assumptions',
      });
    } else {
      for (const guess of s.interpretationsAndGuesses) {
        if (!isPlainRecord(guess) || !safeNonEmptyString(guess.guessOrThought)) {
          errors.push({
            code: 'INVALID_GUESS_ITEM',
            field: 'interpretationsAndGuesses',
            message: 'Each interpretation/guess must be an object with non-empty guessOrThought',
          });
        } else if (guess.isConfirmed !== false) {
          errors.push({
            code: 'GUESS_CANNOT_BE_CONFIRMED',
            field: 'interpretationsAndGuesses',
            message: `Interpretations/guesses cannot be marked as confirmed fact: "${String(guess.guessOrThought)}"`,
          });
        }
      }
    }

    // 9. 视角与未确认信息检验 (通)
    if (
      !Array.isArray(s.perspectives) ||
      s.perspectives.length < 2 ||
      !s.perspectives.every(
        (p) =>
          isPlainRecord(p) &&
          safeNonEmptyString(p.characterId) &&
          safeNonEmptyString(p.characterName) &&
          Array.isArray(p.visibleInformation) &&
          Array.isArray(p.hiddenInformation)
      )
    ) {
      errors.push({
        code: 'INSUFFICIENT_PERSPECTIVES',
        field: 'perspectives',
        message: 'perspectives must delineate at least 2 well-formed character perspectives',
      });
    }

    if (
      !Array.isArray(s.unconfirmedInformation) ||
      s.unconfirmedInformation.length === 0 ||
      !s.unconfirmedInformation.every((u) => safeNonEmptyString(u))
    ) {
      errors.push({
        code: 'MISSING_UNCONFIRMED_INFO',
        field: 'unconfirmedInformation',
        message: 'unconfirmedInformation must define epistemic unknowns/blind spots as non-empty strings',
      });
    }

    // 10. 行动选择与反馈检验 (择 & 验)
    if (!Array.isArray(s.actionChoices) || s.actionChoices.length < 2) {
      errors.push({
        code: 'INSUFFICIENT_CHOICES',
        field: 'actionChoices',
        message: 'actionChoices must provide at least 2 distinct agentic choices',
      });
    } else {
      let hasReadjustableFeedback = false;
      for (const choice of s.actionChoices) {
        if (!isPlainRecord(choice)) {
          errors.push({
            code: 'INVALID_CHOICE_ITEM',
            field: 'actionChoices',
            message: 'Each actionChoice must be a non-null object',
          });
          continue;
        }
        const actionId = safeNonEmptyString(choice.actionId) ? choice.actionId : 'UNKNOWN_CHOICE';
        if (!safeNonEmptyString(choice.labelSpokenText)) {
          errors.push({
            code: 'CHOICE_MISSING_SPOKEN_LABEL',
            field: 'actionChoices.labelSpokenText',
            message: `Choice ${actionId} is missing labelSpokenText`,
          });
        }
        if (!Array.isArray(choice.potentialFeedbacks) || choice.potentialFeedbacks.length === 0) {
          errors.push({
            code: 'CHOICE_MISSING_FEEDBACKS',
            field: 'actionChoices.potentialFeedbacks',
            message: `Choice ${actionId} must have at least one potentialFeedback`,
          });
        } else {
          for (const fb of choice.potentialFeedbacks) {
            if (!isPlainRecord(fb) || !safeNonEmptyString(fb.feedbackSpokenText)) {
              errors.push({
                code: 'INVALID_FEEDBACK_ITEM',
                field: 'actionChoices.potentialFeedbacks',
                message: `Choice ${actionId} contains malformed feedback item`,
              });
            } else if (fb.allowsReadjustment === true) {
              hasReadjustableFeedback = true;
            }
          }
        }
      }

      // 验：系统必须至少有一个支持观察反馈后重新调整的出口
      if (!hasReadjustableFeedback) {
        errors.push({
          code: 'MISSING_READJUSTABLE_FEEDBACK',
          message:
            'At least one choice feedback consequence must have allowsReadjustment === true to fulfill Layer 6 (验).',
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

    // 12. 专业审核状态与 AG-R5 独立审核登记核验
    let canEnterChildRuntime = false;
    const auditRecord = ContentAuditRegistry.getAuditRecord(sceneId);
    if (!auditRecord) {
      errors.push({
        code: 'UNAUDITED_CONTENT',
        field: 'sceneId',
        message: `Scene "${sceneId}" is not registered in ContentAuditRegistry.`,
      });
    }

    if (!isPlainRecord(s.provenance)) {
      errors.push({
        code: 'MISSING_PROVENANCE',
        field: 'provenance',
        message: 'provenance information is required',
      });
    } else {
      const reviewStatus = s.provenance.reviewStatus;
      if (reviewStatus === 'DRAFT' || reviewStatus === 'REJECTED') {
        errors.push({
          code: 'UNREVIEWED_SCENE',
          field: 'provenance.reviewStatus',
          message: `Scene reviewStatus is "${String(reviewStatus)}"; cannot enter child runtime.`,
        });
        canEnterChildRuntime = false;
      } else if (reviewStatus === 'REVIEWED_SAFE') {
        // AG-R5: 严禁伪造，必须在 ContentAuditRegistry 中具备完整 6 要素独立审核证据、真实签署且 SHA-256 哈希与内容完全匹配
        const isAuditValid = ContentAuditRegistry.isContentAuditValid(sceneId, s);
        if (!isAuditValid) {
          errors.push({
            code: 'UNVERIFIED_REVIEWED_SAFE',
            field: 'provenance.reviewStatus',
            message: `Scene "${sceneId}" claims REVIEWED_SAFE without verified independent audit evidence or hash mismatch in ContentAuditRegistry.`,
          });
          canEnterChildRuntime = false;
        } else {
          canEnterChildRuntime = errors.length === 0;
        }
      } else if (reviewStatus === 'PENDING_REVIEW') {
        // AG-R5 铁律：在外部独立审核建立并签署前，场景保持为 PENDING_REVIEW 状态
        // 认知结构与宪法格式可通过，但 canEnterChildRuntime 绝对为 false
        canEnterChildRuntime = false;
      } else {
        errors.push({
          code: 'UNREVIEWED_SCENE',
          field: 'provenance.reviewStatus',
          message: `Scene reviewStatus "${String(reviewStatus)}" is invalid.`,
        });
        canEnterChildRuntime = false;
      }
    }

    return {
      isValid: errors.length === 0,
      sceneId,
      errors,
      verifiedLayers,
      canEnterChildRuntime,
    };
  } catch (err) {
    return {
      isValid: false,
      sceneId: 'UNKNOWN',
      errors: [
        {
          code: 'MALFORMED_SCENE_INPUT',
          message: err instanceof Error ? err.message : 'Unexpected validation failure on malformed input',
        },
      ],
      verifiedLayers: [],
      canEnterChildRuntime: false,
    };
  }
}
