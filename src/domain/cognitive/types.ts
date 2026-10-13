/**
 * 儿童独立判断认知内核 V1.0 - 领域模型与类型契约
 * 遵循 docs/COGNITIVE_CONSTITUTION_V1.md 与 docs/SCENE_SCHEMA_V1.md
 * 
 * 核心目标：
 * 不是矫正离异家庭儿童，而是培养通用的儿童独立判断能力：
 * 1. 辨别事实与猜测
 * 2. 理解感受但不被感受完全支配
 * 3. 从不同位置观察信息
 * 4. 不轻易给人和家庭贴标签
 * 5. 明确识别伤害、不公平及安全边界
 * 6. 在不确定情境下自主选择
 * 7. 根据真实反馈修正判断
 */

import { StructureId, SurfaceDomain } from '../transfer/types';
import { Boundary } from '../safety/types';

/**
 * 六层内部认知模型 (Internal Cognitive Layers)
 * 内部系统规则与架构脚手架，严禁要求 6 岁儿童背诵或暴露专业术语。
 */
export enum CognitiveLayer {
  /** 1. 停 (Grounding / Pause): 在安全情况下获得喘息与思考空间，稳定生理与情绪过载 */
  TING_PAUSE = 'TING_PAUSE',

  /** 2. 分 (Separate): 事实、感受、解释、标签四者严格分离 */
  FEN_SEPARATE = 'FEN_SEPARATE',

  /** 3. 通 (Perspective): 寻找不同视角能够看到的信息，发现未掌握的事实与认知盲区 */
  TONG_PERSPECTIVE = 'TONG_PERSPECTIVE',

  /** 4. 辨 (Discern Boundaries): 判断伤害、公平、权利、隐私与不可逾越的行为边界 */
  BIAN_DISCERN = 'BIAN_DISCERN',

  /** 5. 择 (Choose Action): 在自身可控制的范围 (Locus of Control) 内自主选择应对行动 */
  ZE_CHOOSE = 'ZE_CHOOSE',

  /** 6. 验 (Verify & Revise): 观察真实反馈，允许无羞耻地修正原初判断与行动 */
  YAN_VERIFY = 'YAN_VERIFY',
}

/**
 * 认知内核五条不可违背的宪法级铁律 (Constitution Rules)
 */
export enum CognitiveConstitutionRule {
  /** A. 不将孩子或家庭整体定义为好人、坏人、完整、失败或不正常 */
  RULE_A_NO_GLOBAL_LABELING = 'RULE_A_NO_GLOBAL_LABELING',

  /** B. 理解对方的原因不等于允许伤害行为 (安全边界绝对优先于多视角权衡) */
  RULE_B_UNDERSTANDING_NOT_PERMITTING_HARM = 'RULE_B_UNDERSTANDING_NOT_PERMITTING_HARM',

  /** C. 不强迫儿童讲述家庭隐私，也不鼓励因羞耻而持续隐瞒求助需求 */
  RULE_C_NO_FORCED_PRIVACY_DISCLOSURE = 'RULE_C_NO_FORCED_PRIVACY_DISCLOSURE',

  /** D. 不能通过某次选择或使用次数判断儿童心理状态 (零诊断、零人格推断) */
  RULE_D_NO_PSYCHOLOGICAL_DIAGNOSIS = 'RULE_D_NO_PSYCHOLOGICAL_DIAGNOSIS',

  /** E. 面对真正的伤害、威胁或不安全照护者，优先提供安全退出和寻找现实支持的路径 */
  RULE_E_SAFETY_FIRST_REALITY_SUPPORT = 'RULE_E_SAFETY_FIRST_REALITY_SUPPORT',
}

/**
 * 控制点分类：帮助 6 岁儿童区分“我能决定的”与“我决定不了的”
 */
export type LocusOfControl =
  | 'INTERNAL_CONTROL'         // 自己完全可决定的（如：喝口水、说不说、走开、选择怎么做）
  | 'EXTERNAL_UNCONTROLLABLE'   // 他人的想法/天气/大人的婚姻法律决定（不可控，不需要负责）
  | 'CO_REGULATION';           // 与可信成人共同商量协商的

/**
 * 隐私披露等级
 */
export type PrivacyDisclosureLevel =
  | 'NO_DISCLOSURE'            // 完全不说 / 保持沉默
  | 'MINIMAL_DISCLOSURE'       // 少说 / 简略中性回应
  | 'PRIVATE_TO_TRUSTED_ADULT' // 仅私下向信任的安全大人倾诉
  | 'PUBLIC_DISCLOSURE';       // 向同伴/公众公开披露

/**
 * 角色在场景中能够看到的信息视角
 */
export interface CharacterPerspective {
  readonly characterId: string;
  readonly characterName: string;
  /** 该角色能够亲眼看到或知道的已知事实 */
  readonly visibleInformation: ReadonlyArray<string>;
  /** 该角色看不到或不知道的隐藏信息 / 盲区 */
  readonly hiddenInformation: ReadonlyArray<string>;
  /** 该角色的情绪体验 */
  readonly emotionalState?: string;
  /** 该角色的视角局限性说明 */
  readonly perspectiveLimitation?: string;
}

/**
 * 行动的不同反馈分支
 */
export interface ActionFeedbackConsequence {
  readonly outcomeId: string;
  readonly feedbackScenario: string;
  readonly feedbackSpokenText: string;
  /** 是否允许孩子根据此反馈重新调整或选择 (验) */
  readonly allowsReadjustment: boolean;
  /** 客观反馈类型 */
  readonly outcomeType: 'OBSERVED_FACT' | 'PEER_REACTION' | 'SAFETY_AFFIRMATION' | 'CALM_RESULT';
}

/**
 * 孩子可选择的行动定义
 */
export interface SceneActionChoice {
  readonly actionId: string;
  readonly labelSpokenText: string;
  readonly actionDescription: string;
  readonly locusOfControl: LocusOfControl;
  readonly privacyLevel: PrivacyDisclosureLevel;
  /** 是否属于明确的安全边界保护行动 (如制止、离开、报告) */
  readonly isSafeBoundaryAction: boolean;
  /** 是否为紧急现实求助行动 */
  readonly isEmergencyHelp: boolean;
  /** 
   * 是否属于自由自主选择 (非唯一所谓的“道德正确”或“标准答案”)
   * 铁律：在无安全违规情境下，严禁将单一动作包装为唯一正确答案
   */
  readonly isDiscretionaryChoice: boolean;
  /** 该行动可能引发的多种真实客观反馈 */
  readonly potentialFeedbacks: ReadonlyArray<ActionFeedbackConsequence>;
}

/**
 * 安全边界研判
 */
export interface SceneSafetyAssessment {
  readonly isBoundaryTriggered: boolean;
  readonly boundaryType: Boundary;
  readonly triggerReason?: string;
  /** 
   * 当遭遇欺凌、身体伤害或胁迫时，是否跳过一般多视角权衡流程直接进入安全保护
   * 铁律：欺凌与伤害行为下，此项必须为 true，严禁让孩子“理解欺凌者来忍受欺凌”
   */
  readonly bypassTradeoffFlow: boolean;
  /** 现实世界安全支持路径 */
  readonly emergencyRealityActions?: ReadonlyArray<string>;
}

/**
 * 退出、暂停与不回答支持 (无羞耻感出口)
 */
export interface ExitOrPauseSupport {
  readonly allowSilence: boolean;          // 允许不说
  readonly allowPassOrSkip: boolean;       // 允许跳过/退出
  readonly allowPrivateKeep: boolean;      // 允许只留在心里
  readonly spokenExitGuidance: string;     // 退出时的安抚文案 (例如：“不想说完全没关系，你的心里有一扇属于自己的小门”)
}

/**
 * 内容溯源与专业伦理审核
 */
export interface SceneProvenance {
  readonly author: string;
  readonly sourceDescription: string;
  readonly reviewStatus: 'DRAFT' | 'REVIEWED_SAFE' | 'REJECTED';
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly pedagogicalNotes?: string;
}

/**
 * 统一场景模型 (Unified Scene Schema V1.0)
 * 必须通过认知宪法与 Schema 验证器严格校验后方可进入儿童端运行。
 */
export interface UnifiedSceneDefinition {
  readonly sceneId: string;
  readonly version: string;
  readonly ageBand: 'AGE_5_7' | 'AGE_6_8' | 'AGE_7_9';
  
  /** 标题与情境描述 (无成人学术术语) */
  readonly title: string;
  readonly contextNarrationSpokenText: string;

  /** 认知结构标识 (与 transfer engine 架构注册表一致) */
  readonly cognitiveStructureId: StructureId;
  /** 本场景激活的六层内部认知模型层级 */
  readonly activeLayers: ReadonlyArray<CognitiveLayer>;

  /** 1. 停：获得思考空间的环境指引 (如：停下来深吸一口气) */
  readonly pauseGroundingPrompt?: string;

  /** 2. 分：明确确认的客观事实 (Eyes/Ears observable) */
  readonly confirmedFacts: ReadonlyArray<string>;
  /** 2. 分：角色的情绪体验与身体感觉 */
  readonly characterEmotions: ReadonlyArray<{
    characterName: string;
    emotionWord: string;
    bodilySensation?: string;
  }>;
  /** 2. 分：角色的主观解释、念头与猜测 (明确标记为未被证实的猜想) */
  readonly interpretationsAndGuesses: ReadonlyArray<{
    characterName: string;
    guessOrThought: string;
    isConfirmed: false; // 强类型约束：猜测永远不能直接等同于事实
  }>;

  /** 3. 通：尚未确认的关键信息 (Epistemic Unknowns / 知识盲区) */
  readonly unconfirmedInformation: ReadonlyArray<string>;
  /** 3. 通：不同角色能够看到与看不到的信息 */
  readonly perspectives: ReadonlyArray<CharacterPerspective>;

  /** 4. 辨：伤害与安全边界研判 */
  readonly safetyBoundaryAssessment: SceneSafetyAssessment;

  /** 5. 择：孩子可选择的自主应对行动 (至少包含 2 个有意义选项) */
  readonly actionChoices: ReadonlyArray<SceneActionChoice>;

  /** 6. 验：后续观察指引 */
  readonly reflectionVerificationPrompt?: string;

  /** 是否需要成年人共同阅读/指导 */
  readonly requiresAdultCoReading: boolean;

  /** 允许暂停、退出、不回答的完整支持 */
  readonly exitOrPauseOptions: ExitOrPauseSupport;

  /** 是否为未受训练的独立检验迁移叶 (Held-Out Transfer Leaf) */
  readonly isHeldOutTransfer: boolean;

  /** 表面生活情境领域 */
  readonly surfaceDomain: SurfaceDomain;

  /** 
   * 是否允许孩子保持负面/失望情绪，不强迫积极思考 (Anti-Toxic Positivity)
   * 针对场景 C (下雨取消)：允许失望，不逼迫“要感恩下雨”
   */
  readonly allowNegativeEmotionPreservation?: boolean;

  /** 内容来源与伦理审核 */
  readonly provenance: SceneProvenance;
}

/**
 * 场景验证错误
 */
export interface SceneValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly ruleViolated?: CognitiveConstitutionRule;
}

/**
 * 场景验证综合结果
 */
export interface SceneValidationResult {
  readonly isValid: boolean;
  readonly sceneId: string;
  readonly errors: ReadonlyArray<SceneValidationError>;
  readonly verifiedLayers: ReadonlyArray<CognitiveLayer>;
}
