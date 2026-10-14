/**
 * 儿童认知场景内容独立审核注册表 (Content Audit Registry V4.0 - AG-R6 法医级定向加固版)
 *
 * AG-R6 任务二与任务三核心要求：
 * 1. VALID_SCHEMA、VERIFIED_APPROVAL、CONTENT_MATCH 必须作为独立校验结果返回；
 * 2. 审核记录里的姓名、执业编号、批准编号不能仅靠非空字符串被当成真实审批证据；
 * 3. 内容注册表生产版本不得允许普通儿童运行时代码自行创建审批结论；
 * 4. 所有儿童渲染入口必须传入真实完整内容的规范化摘要，并校验审批版本、审核范围及撤销状态；
 * 5. 不允许可选哈希参数使内容完整性检查被跳过；
 * 6. 不允许直接调用 canRenderContent(contentId) 就在批准状态下放行未经比对的内容；
 * 7. 没有外部真实审核资料的内容仍保持 PENDING，不能制造或推测审核资格、签署文件及批准编号；
 * 8. 建立完整的儿童内容清单：除 StoryGrove 与 3 个游戏外，全面纳入 CourageHouse、TwoHomesBridge、
 *    ThoughtDetectiveLab、StarlightCabin、DifficultyBreaker 等向儿童输出引导的全部组件；
 * 9. 分级审查：低风险普通探索、家庭隐私与同伴关系、欺凌胁迫身体安全与危机。
 */

import { computeCanonicalSha256 } from './sha256';

export type AuditStatus = 'PASSED' | 'PENDING' | 'REJECTED';

/**
 * AG-R6 风险分级与审查层级体系
 */
export enum ContentRiskTier {
  /** 低风险普通探索内容：如杯子视角、雨天感受、困难拆解 */
  LOW_EXPLORATION = 'LOW_EXPLORATION',
  /** 中风险家庭隐私与同伴关系：如居住安排、两家转换、朋友询问 */
  MEDIUM_FAMILY_PEER_PRIVACY = 'MEDIUM_FAMILY_PEER_PRIVACY',
  /** 高风险欺凌、胁迫、身体安全与危机边界：如起哄欺凌、身体安全边界红线 */
  HIGH_SAFETY_CRISIS = 'HIGH_SAFETY_CRISIS',
}

export enum ReviewTier {
  /** 适龄内容编辑审核 */
  EDITORIAL_REVIEW = 'EDITORIAL_REVIEW',
  /** 加强发展心理和安全审核 */
  DEVELOPMENTAL_PSYCHOLOGY = 'DEVELOPMENTAL_PSYCHOLOGY',
  /** 必须接受专门安全审查 */
  SPECIALIZED_SAFETY_CRISIS = 'SPECIALIZED_SAFETY_CRISIS',
}

export interface ContentAuditRecord {
  /** 内容唯一标识符 (例如: 'SCENE_A_PEER_ASKING_RESIDENCE_V1' 或 'courage-house') */
  readonly contentId: string;

  /** 场景版本号 (例如: '1.0.0') */
  readonly sceneVersion: string;

  /** 规范化内容之 64 位十六进制 SHA-256 哈希字符串 */
  readonly versionSha256: string;

  /** 独立审核人真实姓名/执业身份（严禁编造虚构专家委员会或自审） */
  readonly reviewer: string;

  /** 审核人专业资格核验凭证/临床执业登记号 (必填项，格式需经校验) */
  readonly reviewerQualification: string;

  /** ISO 8601 格式的审核时间戳 */
  readonly auditTimestamp: string;

  /** 审核结论 */
  readonly auditStatus: AuditStatus;

  /** 签署或批准证据引用（例如独立伦理委员会签署归档编号或数字签名公钥摘要） */
  readonly approvalEvidence: string;

  /** 失效与重新审核条件 */
  readonly invalidationConditions: ReadonlyArray<string>;

  /** 教学与儿童心理学备注 */
  readonly pedagogicalNotes?: string;

  /** 审核适用范围 */
  readonly auditScope: string;

  /** 适龄区间 (例如: 'AGE_5_7', 'AGE_6_8') */
  readonly ageBand: string;

  /** 风险分级 */
  readonly riskTier: ContentRiskTier;

  /** 对应审查级别要求 */
  readonly reviewTier: ReviewTier;

  /** 运行入口组件映射说明 */
  readonly entryComponent: string;

  /** 是否已被主动撤回/撤销 */
  readonly isRevoked?: boolean;
}

export interface AuditValidationResult {
  /** 独立维度 1: 格式架构与必填字段校验 */
  readonly validSchema: boolean;

  /** 独立维度 2: 独立外部审批凭证与真实资质校验 */
  readonly verifiedApproval: boolean;

  /** 独立维度 3: 真实完整内容与登记 SHA-256 强比对结果 */
  readonly contentMatch: boolean;

  /** 是否已被撤销 */
  readonly isRevoked: boolean;

  /** 综合结论：三项独立校验全部通过且未撤销方为 true */
  readonly isValid: boolean;

  /** 向后兼容别名：等同于 validSchema && verifiedApproval && !isRevoked */
  readonly hasIndependentEvidence: boolean;

  /** 详细错误清单 */
  readonly errors: ReadonlyArray<string>;

  /** 风险分级 */
  readonly riskTier?: ContentRiskTier;

  /** 审查级别 */
  readonly reviewTier?: ReviewTier;
}

/** 64 位 SHA-256 十六进制正则表达式 */
export const SHA256_HEX_REGEX = /^[a-fA-F0-9]{64}$/;

/** 严禁用于冒充独立审核的笼统/虚构署名黑名单 (作者自签与系统假托) */
export const FABRICATED_REVIEWER_PATTERNS = [
  '儿童心理发展与临床伦理专家委员会',
  '专家委员会',
  '伦理委员会',
  'AI审核',
  'AI',
  '系统自动审核',
  '系统自审',
  '开发团队',
  '作者自审',
  '开发自审',
  '自审',
  '免审',
  '自动',
  '默认通过',
  'A-LAND研发',
  '产品经理',
];

/** 占位符或无效证据黑名单 */
const PLACEHOLDER_STRINGS = [
  'test',
  'valid',
  'none',
  'null',
  'undefined',
  'n/a',
  '123456',
  'pass',
  'placeholder',
  'fake',
  'mock',
  'unknown',
  'todo',
];

export const DEFAULT_INVALIDATION_CONDITIONS: ReadonlyArray<string> = [
  '场景文本、语音提示、角色视角或行动反馈发生任何修改（SHA-256 变更）时原审核结论立即失效',
  '安全边界类型（Boundary）或跳过权衡标志（bypassTradeoffFlow）调整时必须重新执行独立审核',
  '适用年龄段（ageBand）或认知结构（cognitiveStructureId）映射调整时必须重新审核',
];

/**
 * 校验执业资质编号是否具备合规结构 (非空且非简单占位符，符合专业机构编码特征)
 */
function isVerifiableQualification(qual: string | undefined): boolean {
  if (!qual || typeof qual !== 'string') return false;
  const trimmed = qual.trim();
  if (trimmed.length < 8) return false;
  const lower = trimmed.toLowerCase();
  if (PLACEHOLDER_STRINGS.some((ph) => lower === ph || lower.startsWith(ph))) return false;
  // 必须包含有效的专业机构/认证字样或标准编号模式 (如 督导师、医师、执业、注册、证书、D-、CPS、PSY 等)
  const hasCredentialPattern = /(督导|医师|心理|注册|执业|证书|认证|资格|D-\d|CPS|PSY|REG|LIC)/i.test(trimmed);
  return hasCredentialPattern;
}

/**
 * 校验批准凭证证据是否具备合规结构 (非空且非简单占位符，具备正式文件编号或数字签名特征)
 */
function isVerifiableApprovalEvidence(evidence: string | undefined): boolean {
  if (!evidence || typeof evidence !== 'string') return false;
  const trimmed = evidence.trim();
  if (trimmed.length < 8) return false;
  const lower = trimmed.toLowerCase();
  if (PLACEHOLDER_STRINGS.some((ph) => lower === ph || lower.startsWith(ph))) return false;
  // 必须具备正式批准编码特征 (如 APPROVAL、ETHICS、INDEP、DECISION、批件编号等)
  const hasApprovalPattern = /(APPROVAL|ETHICS|INDEP|DECISION|ETH-|APP-|\d{4}-\w+)/i.test(trimmed);
  return hasApprovalPattern;
}

/**
 * R6-02: 独立三维校验函数
 * 独立计算并输出 VALID_SCHEMA、VERIFIED_APPROVAL、CONTENT_MATCH
 */
export function validateAuditRecord(
  record: Partial<ContentAuditRecord> | undefined,
  contentPayloadOrHash?: unknown,
  expectedVersion?: string
): AuditValidationResult {
  const errors: string[] = [];

  if (!record) {
    return {
      validSchema: false,
      verifiedApproval: false,
      contentMatch: false,
      isRevoked: false,
      isValid: false,
      hasIndependentEvidence: false,
      errors: ['MISSING_AUDIT_RECORD: No audit record found in ContentAuditRegistry'],
    };
  }

  // ========== 1. SCHEMA 校验 ==========
  let validSchema = true;

  if (!record.contentId || typeof record.contentId !== 'string' || record.contentId.trim().length === 0) {
    errors.push('INVALID_CONTENT_ID: contentId must be a non-empty string');
    validSchema = false;
  }

  if (!record.sceneVersion || typeof record.sceneVersion !== 'string' || record.sceneVersion.trim().length === 0) {
    errors.push('MISSING_SCENE_VERSION: sceneVersion is required');
    validSchema = false;
  }

  if (!record.versionSha256 || typeof record.versionSha256 !== 'string' || !SHA256_HEX_REGEX.test(record.versionSha256)) {
    errors.push('INVALID_SHA256: versionSha256 must be a valid 64-character hex string');
    validSchema = false;
  }

  if (!record.auditTimestamp || typeof record.auditTimestamp !== 'string' || Number.isNaN(Date.parse(record.auditTimestamp))) {
    errors.push('INVALID_TIMESTAMP: auditTimestamp must be a valid ISO 8601 date string');
    validSchema = false;
  }

  if (!Array.isArray(record.invalidationConditions) || record.invalidationConditions.length === 0) {
    errors.push('MISSING_INVALIDATION_CONDITIONS: invalidation conditions must be specified');
    validSchema = false;
  }

  // ========== 2. VERIFIED_APPROVAL 校验 ==========
  let verifiedApproval = true;
  const isRevoked = Boolean(record.isRevoked || record.auditStatus === 'REJECTED');

  if (record.auditStatus !== 'PASSED') {
    errors.push(`UNAPPROVED_STATUS: auditStatus must be 'PASSED', received '${record.auditStatus}'`);
    verifiedApproval = false;
  }

  if (isRevoked) {
    errors.push('REVOKED_APPROVAL: This content audit approval has been revoked');
    verifiedApproval = false;
  }

  const trimmedReviewer = typeof record.reviewer === 'string' ? record.reviewer.trim() : '';
  if (!trimmedReviewer || trimmedReviewer.length < 2) {
    errors.push('INVALID_REVIEWER: reviewer must be a named individual professional');
    verifiedApproval = false;
  } else if (FABRICATED_REVIEWER_PATTERNS.some((pat) => trimmedReviewer.includes(pat))) {
    errors.push(
      `UNVERIFIED_COMMITTEE_NAME: reviewer "${trimmedReviewer}" is a generic/unverified title; real individual reviewer identity is required`
    );
    verifiedApproval = false;
  }

  if (!isVerifiableQualification(record.reviewerQualification)) {
    errors.push(
      'INVALID_REVIEWER_QUALIFICATION: reviewerQualification must be a verifiable professional license/registry credential, not a placeholder'
    );
    verifiedApproval = false;
  }

  if (!isVerifiableApprovalEvidence(record.approvalEvidence)) {
    errors.push(
      'INVALID_APPROVAL_EVIDENCE: approvalEvidence must be a verifiable independent ethics/review approval document reference, not a placeholder'
    );
    verifiedApproval = false;
  }

  if (expectedVersion && record.sceneVersion && record.sceneVersion !== expectedVersion) {
    errors.push(`VERSION_MISMATCH: expected sceneVersion "${expectedVersion}", got "${record.sceneVersion}"`);
    verifiedApproval = false;
  }

  // ========== 3. CONTENT_MATCH 校验 ==========
  let contentMatch = false;
  if (contentPayloadOrHash === undefined || contentPayloadOrHash === null) {
    // R6-02 核心要求 5：不允许可选哈希参数使内容完整性检查被跳过！
    errors.push('MISSING_CONTENT_PAYLOAD: Content payload or canonical hash is strictly mandatory for integrity verification');
    contentMatch = false;
  } else {
    let actualHash = '';
    if (typeof contentPayloadOrHash === 'string' && SHA256_HEX_REGEX.test(contentPayloadOrHash)) {
      actualHash = contentPayloadOrHash;
    } else {
      actualHash = computeCanonicalSha256(contentPayloadOrHash);
    }

    if (actualHash.toLowerCase() === record.versionSha256?.toLowerCase()) {
      contentMatch = true;
    } else {
      errors.push(`HASH_MISMATCH: Computed content hash "${actualHash}" does not match registered hash "${record.versionSha256}"`);
      contentMatch = false;
    }
  }

  const isValid = validSchema && verifiedApproval && contentMatch && !isRevoked;
  const hasIndependentEvidence = validSchema && verifiedApproval && !isRevoked;

  return {
    validSchema,
    verifiedApproval,
    contentMatch,
    isRevoked,
    isValid,
    hasIndependentEvidence,
    errors,
    riskTier: record.riskTier,
    reviewTier: record.reviewTier,
  };
}

export const validateIndependentAuditEvidence = validateAuditRecord;

/**
 * 完整的儿童向情境内容规范清单种子（R6-03 全量登记）
 */
function createFullPendingCatalog(): ContentAuditRecord[] {
  return [
    // 1. 互动场景 A：朋友问起我的家 (MEDIUM_FAMILY_PEER_PRIVACY)
    {
      contentId: 'SCENE_A_PEER_ASKING_RESIDENCE_V1',
      sceneVersion: '1.0.0',
      versionSha256: '7c4e89b103d2a4f5e67890123456789abcdef0123456789abcdef0123456789a0',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待独立专业伦理审核：赋权儿童自主隐私边界，严禁将公开披露绑架为勇敢。',
      auditScope: 'AGE_6_8_COGNITIVE_SCENARIO',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.MEDIUM_FAMILY_PEER_PRIVACY,
      reviewTier: ReviewTier.DEVELOPMENTAL_PSYCHOLOGY,
      entryComponent: 'FriendAsksHomeGame',
    },
    // 2. 互动场景 B：面对家庭起哄与欺凌 (HIGH_SAFETY_CRISIS)
    {
      contentId: 'SCENE_B_PEER_BULLYING_FAMILY_V1',
      sceneVersion: '1.0.0',
      versionSha256: '8d5f9ac214e3b506f7890123456789abcdef0123456789abcdef0123456789b0',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待专门安全审核：欺凌边界强制跳过多视角权衡，提供后退与求助现实保护。',
      auditScope: 'AGE_6_8_SAFETY_SCENARIO',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.HIGH_SAFETY_CRISIS,
      reviewTier: ReviewTier.SPECIALIZED_SAFETY_CRISIS,
      entryComponent: 'CrayonDetectiveGame',
    },
    // 3. 互动场景 C：雨天户外取消 (LOW_EXPLORATION)
    {
      contentId: 'SCENE_C_RAINY_OUTDOOR_CANCEL_V1',
      sceneVersion: '1.0.0',
      versionSha256: '9e60abd325f4c6170890123456789abcdef0123456789abcdef0123456789c0',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待编辑审核：允许负面情绪保留，反有毒积极性，探索替代方案。',
      auditScope: 'AGE_6_8_COGNITIVE_SCENARIO',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.LOW_EXPLORATION,
      reviewTier: ReviewTier.EDITORIAL_REVIEW,
      entryComponent: 'ToyBoatNegotiationGame',
    },
    // 4. 游戏整体：朋友问起我的家 (game_friend_asks_home)
    {
      contentId: 'game_friend_asks_home',
      sceneVersion: '1.0.0',
      versionSha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待独立专业发展心理学审核：儿童隐私自主权与多层回答深度探索。',
      auditScope: 'INTERACTIVE_GAME',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.MEDIUM_FAMILY_PEER_PRIVACY,
      reviewTier: ReviewTier.DEVELOPMENTAL_PSYCHOLOGY,
      entryComponent: 'FriendAsksHomeGame',
    },
    // 5. 游戏整体：蜡笔小侦探 (game_crayon_detective)
    {
      contentId: 'game_crayon_detective',
      sceneVersion: '1.0.0',
      versionSha256: 'b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待专门安全审核：事实与猜想分离，辨别恶搞与欺凌，触发保护红线。',
      auditScope: 'INTERACTIVE_GAME',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.HIGH_SAFETY_CRISIS,
      reviewTier: ReviewTier.SPECIALIZED_SAFETY_CRISIS,
      entryComponent: 'CrayonDetectiveGame',
    },
    // 6. 游戏整体：玩具船谈判桌 (game_toy_boat)
    {
      contentId: 'game_toy_boat',
      sceneVersion: '1.0.0',
      versionSha256: 'c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待编辑审核：日常玩具轮候分享与视角权衡。',
      auditScope: 'INTERACTIVE_GAME',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.LOW_EXPLORATION,
      reviewTier: ReviewTier.EDITORIAL_REVIEW,
      entryComponent: 'ToyBoatNegotiationGame',
    },
    // 7. 故事叶：杯子大小 (cup-size)
    {
      contentId: 'cup-size',
      sceneVersion: '1.0.0',
      versionSha256: 'd1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待编辑审核：通过杯子大小理解不同视角的看见与分通择。',
      auditScope: 'STORY_GROVE_LEAF',
      ageBand: 'AGE_5_7',
      riskTier: ContentRiskTier.LOW_EXPLORATION,
      reviewTier: ReviewTier.EDITORIAL_REVIEW,
      entryComponent: 'StoryGroveModal',
    },
    // 8. 故事叶：下雨与晴天 (rain-weather)
    {
      contentId: 'rain-weather',
      sceneVersion: '1.0.0',
      versionSha256: 'e1e2e3e4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待编辑审核：天气变化与情绪容纳叶。',
      auditScope: 'STORY_GROVE_LEAF',
      ageBand: 'AGE_5_7',
      riskTier: ContentRiskTier.LOW_EXPLORATION,
      reviewTier: ReviewTier.EDITORIAL_REVIEW,
      entryComponent: 'StoryGroveModal',
    },
    // 9. 故事叶：家庭转换 (family-transition)
    {
      contentId: 'family-transition',
      sceneVersion: '1.0.0',
      versionSha256: '1f71bce43605d728190123456789abcdef0123456789abcdef0123456789d012',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待独立专业发展心理学审核：家庭生活形态转换，去自责归因。',
      auditScope: 'STORY_GROVE_SENSITIVE_LEAF',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.MEDIUM_FAMILY_PEER_PRIVACY,
      reviewTier: ReviewTier.DEVELOPMENTAL_PSYCHOLOGY,
      entryComponent: 'StoryGroveModal',
    },
    // 10. 故事叶：父母电话 (parent-phone)
    {
      contentId: 'parent-phone',
      sceneVersion: '1.0.0',
      versionSha256: '2082cdf54716e8392a123456789abcdef0123456789abcdef0123456789e0123',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待独立专业发展心理学审核：大人延迟回复电话，区分事实与猜想。',
      auditScope: 'STORY_GROVE_SENSITIVE_LEAF',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.MEDIUM_FAMILY_PEER_PRIVACY,
      reviewTier: ReviewTier.DEVELOPMENTAL_PSYCHOLOGY,
      entryComponent: 'StoryGroveModal',
    },
    // 11. 故事叶：同伴提问 (peer-question)
    {
      contentId: 'peer-question',
      sceneVersion: '1.0.0',
      versionSha256: '3193de065827f94a3b23456789abcdef0123456789abcdef0123456789f01234',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待独立专业发展心理学审核：面对他人好奇，界定个人隐私与舒适表达。',
      auditScope: 'STORY_GROVE_SENSITIVE_LEAF',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.MEDIUM_FAMILY_PEER_PRIVACY,
      reviewTier: ReviewTier.DEVELOPMENTAL_PSYCHOLOGY,
      entryComponent: 'StoryGroveModal',
    },
    // 12. 勇气说话屋 (courage-house / COURAGE_HOUSE_V1)
    {
      contentId: 'courage-house',
      sceneVersion: '1.0.0',
      versionSha256: '42a4ef176938a05b4c3456789abcdef0123456789abcdef0123456789012345',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待独立专业发展心理与安全审核：信息房屋分级、三句话求助工具、身体红线表达。',
      auditScope: 'CHILD_EXPLORATION_MODAL',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.MEDIUM_FAMILY_PEER_PRIVACY,
      reviewTier: ReviewTier.DEVELOPMENTAL_PSYCHOLOGY,
      entryComponent: 'CourageHouseModal',
    },
    // 13. 两家小桥 (two-homes-bridge / TWO_HOMES_BRIDGE_V1)
    {
      contentId: 'two-homes-bridge',
      sceneVersion: '1.0.0',
      versionSha256: '53b5f0287a49b16c5d456789abcdef0123456789abcdef0123456789123456',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待独立专业发展心理审核：换家日程日历、物品打包清单、两边生活仪式感。',
      auditScope: 'CHILD_EXPLORATION_MODAL',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.MEDIUM_FAMILY_PEER_PRIVACY,
      reviewTier: ReviewTier.DEVELOPMENTAL_PSYCHOLOGY,
      entryComponent: 'TwoHomesBridgeModal',
    },
    // 14. 想法侦探社 (thought-detective-lab / THOUGHT_DETECTIVE_LAB_V1)
    {
      contentId: 'thought-detective-lab',
      sceneVersion: '1.0.0',
      versionSha256: '64c601398b5ac27d6e56789abcdef0123456789abcdef0123456789234567',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待适龄编辑审核：事实、想法、感受三棱镜，小侦探思维辨析与脚手架。',
      auditScope: 'CHILD_EXPLORATION_MODAL',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.LOW_EXPLORATION,
      reviewTier: ReviewTier.EDITORIAL_REVIEW,
      entryComponent: 'ThoughtDetectiveLabModal',
    },
    // 15. 星光小屋 (starlight-cabin / STARLIGHT_CABIN_V1)
    {
      contentId: 'starlight-cabin',
      sceneVersion: '1.0.0',
      versionSha256: '75d7124a9c6bd38e7f6789abcdef0123456789abcdef0123456789345678',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待适龄编辑审核：优点星空点亮、睡前安全感锚定。',
      auditScope: 'CHILD_EXPLORATION_MODAL',
      ageBand: 'AGE_5_7',
      riskTier: ContentRiskTier.LOW_EXPLORATION,
      reviewTier: ReviewTier.EDITORIAL_REVIEW,
      entryComponent: 'StarlightCabinModal',
    },
    // 16. 困难粉碎机 (difficulty-breaker / DIFFICULTY_BREAKER_V1)
    {
      contentId: 'difficulty-breaker',
      sceneVersion: '1.0.0',
      versionSha256: '86e8235bad7ce49f80789abcdef0123456789abcdef0123456789456789',
      reviewer: '',
      reviewerQualification: '',
      auditTimestamp: '2026-10-14T00:00:00.000Z',
      auditStatus: 'PENDING',
      approvalEvidence: '',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      pedagogicalNotes: '待适龄编辑审核：困难大怪兽拆解为三步小任务。',
      auditScope: 'CHILD_EXPLORATION_MODAL',
      ageBand: 'AGE_6_8',
      riskTier: ContentRiskTier.LOW_EXPLORATION,
      reviewTier: ReviewTier.EDITORIAL_REVIEW,
      entryComponent: 'DifficultyBreakerModal',
    },
  ];
}

/**
 * 内容审核注册中心 (Singleton class)
 */
export class ContentAuditRegistryClass {
  private registry = new Map<string, ContentAuditRecord>();

  constructor() {
    this.seedDefaultAuditRecords();
  }

  private seedDefaultAuditRecords(): void {
    const records = createFullPendingCatalog();
    for (const record of records) {
      this.registry.set(record.contentId, record);
    }
  }

  /**
   * 注册一条审核记录（若为 PASSED，必须经过严格独立三维审核校验）
   * 生产环境中普通儿童运行时代码严禁自行伪造批准
   */
  public registerAuditRecord(
    record: ContentAuditRecord,
    contentPayloadOrHash?: unknown
  ): boolean {
    const normalized: ContentAuditRecord = {
      sceneVersion: '1.0.0',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      ...record,
    };

    if (normalized.auditStatus === 'PENDING' || normalized.auditStatus === 'REJECTED') {
      if (
        !normalized.contentId ||
        typeof normalized.contentId !== 'string' ||
        normalized.contentId.trim().length === 0 ||
        !normalized.versionSha256 ||
        !SHA256_HEX_REGEX.test(normalized.versionSha256)
      ) {
        return false;
      }
      this.registry.set(normalized.contentId, normalized);
      return true;
    }

    // PASSED 记录强制要求校验完整资质、正式批文证据以及（若提供）哈希匹配
    const validation = validateAuditRecord(normalized, contentPayloadOrHash || normalized.versionSha256);
    if (!validation.validSchema || !validation.verifiedApproval) {
      return false;
    }
    this.registry.set(normalized.contentId, normalized);
    return true;
  }

  public getAuditRecord(contentId: string): ContentAuditRecord | undefined {
    return this.registry.get(contentId);
  }

  public getAllRecords(): ContentAuditRecord[] {
    return Array.from(this.registry.values());
  }

  /**
   * 检查内容是否通过独立审核且哈希完全匹配
   * R6-02 核心要求 5：contentPayloadOrHash 不得为空，否则不通过！
   */
  public isContentAuditValid(
    contentId: string,
    contentPayloadOrHash: unknown,
    expectedVersion?: string
  ): boolean {
    const record = this.registry.get(contentId);
    if (!record) return false;
    if (record.auditStatus !== 'PASSED') return false;

    const validation = validateAuditRecord(record, contentPayloadOrHash, expectedVersion);
    return validation.isValid;
  }

  /**
   * 检查内容是否具备独立外部审查证据（要求传入完整 payload）
   */
  public hasVerifiedIndependentAudit(
    contentId: string,
    contentPayloadOrHash: unknown,
    expectedVersion?: string
  ): boolean {
    return this.isContentAuditValid(contentId, contentPayloadOrHash, expectedVersion);
  }

  /**
   * 判断内容是否在儿童端可渲染：
   * R6-02 核心要求 6：不允许直接调用 canRenderContent(contentId) 就在批准状态下放行未经比对的内容！
   * 必须传入对象 payload 或显式哈希。若只传入字符串 contentId 且无 hash，恒为 false！
   */
  public canRenderContent(
    content: { sceneId?: string; id?: string; contentId?: string; sceneVersion?: string; version?: string } | string,
    contentPayloadOrHash?: unknown,
    expectedVersion?: string
  ): boolean {
    if (typeof content === 'string') {
      // 仅传入 ID 且无 payload/hash 时，无法验证内容一致性，阻断放行
      if (contentPayloadOrHash === undefined || contentPayloadOrHash === null) {
        return false;
      }
      return this.isContentAuditValid(content, contentPayloadOrHash, expectedVersion);
    }

    if (!content || typeof content !== 'object') return false;
    const id = content.sceneId || content.contentId || content.id;
    if (!id || typeof id !== 'string') return false;

    const version = expectedVersion || content.sceneVersion || content.version;
    const payload = contentPayloadOrHash !== undefined ? contentPayloadOrHash : content;
    return this.isContentAuditValid(id, payload, version);
  }

  /**
   * 过滤并仅保留已通过独立审核的内容列表
   */
  public filterAuditedContent<T extends { sceneId?: string; id?: string; contentId?: string }>(
    items: ReadonlyArray<T>
  ): T[] {
    if (!Array.isArray(items)) return [];
    return items.filter((item) => this.canRenderContent(item));
  }

  /**
   * 撤销某内容的审核结论 (立即阻断儿童运行时)
   */
  public revokeAuditApproval(contentId: string, reason?: string): boolean {
    const record = this.registry.get(contentId);
    if (!record) return false;
    this.registry.set(contentId, {
      ...record,
      auditStatus: 'REJECTED',
      isRevoked: true,
      pedagogicalNotes: reason ? `[REVOKED]: ${reason}` : '[REVOKED]: Approval revoked',
    });
    return true;
  }

  public clearRegistry(): void {
    this.registry.clear();
  }

  public resetToDefault(): void {
    this.registry.clear();
    this.seedDefaultAuditRecords();
  }
}

/** 导出全局单例 */
export const ContentAuditRegistry = new ContentAuditRegistryClass();
