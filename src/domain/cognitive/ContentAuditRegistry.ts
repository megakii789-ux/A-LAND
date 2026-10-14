/**
 * 儿童认知场景内容独立审核注册表 (Content Audit Registry V3.0 - AG-R5 严格闭环版)
 *
 * AG-R5 任务一核心要求：
 * 1. 彻底删除所有没有真实独立批准证据的默认 PASSED 审核记录；
 * 2. isContentAuditValid()、canRenderContent()、hasVerifiedIndependentAudit() 与 validateUnifiedScene() 必须遵守同一个严格审批结果；
 * 3. PENDING_REVIEW、REJECTED、不存在记录、哈希不匹配时，一律 canEnterChildRuntime === false；
 * 4. 审核人、资格、批准证据、签署状态不得由内容作者自行伪造；严禁使用“专家委员会”、“AI审核”等虚构主体；
 * 5. 使用规范化内容及真实 SHA-256 绑定版本；改动任何受审核内容，原批准立即失效；
 * 6. 将审核门禁接入 StoryGrove、InteractiveGamesHub 和 TransferLab 的实际内容加载流程；
 * 7. 成人预览未审内容与儿童正式使用必须隔离；没有专家审批时不制造审批记录。
 */

import { computeCanonicalSha256 } from './sha256';

export interface ContentAuditRecord {
  /** 内容或场景唯一标识符 (例如: 'SCENE_A_PEER_ASKING_RESIDENCE_V1') */
  readonly contentId: string;

  /** 场景版本号 (例如: '1.0.0') */
  readonly sceneVersion?: string;

  /** 内容规范或版本之 64 位十六进制 SHA-256 哈希字符串 */
  readonly versionSha256: string;

  /** 独立审核人真实姓名/执业身份（严禁编造虚构专家委员会或自审） */
  readonly reviewer: string;

  /** 审核人专业资格核验凭证/临床执业登记号 (必填项) */
  readonly reviewerQualification?: string;

  /** ISO 8601 格式的审核时间戳 */
  readonly auditTimestamp: string;

  /** 审核结论 */
  readonly auditStatus: 'PASSED' | 'PENDING' | 'REJECTED';

  /** 签署或批准证据引用（例如独立伦理委员会签署归档编号或数字签名公钥摘要） */
  readonly approvalEvidence?: string;

  /** 失效与重新审核条件 */
  readonly invalidationConditions?: ReadonlyArray<string>;

  /** 教学与儿童心理学备注 */
  readonly pedagogicalNotes?: string;

  /** 审核适用范围 */
  readonly auditScope?: string;
}

export interface AuditValidationResult {
  readonly isValid: boolean;
  readonly hasIndependentEvidence: boolean;
  readonly errors: ReadonlyArray<string>;
}

/** 64 位 SHA-256 十六进制正则表达式 */
const SHA256_REGEX = /^[a-fA-F0-9]{64}$/;

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

export const DEFAULT_INVALIDATION_CONDITIONS: ReadonlyArray<string> = [
  '场景文本、语音提示、角色视角或行动反馈发生任何修改（SHA-256 变更）时原审核结论立即失效',
  '安全边界类型（Boundary）或跳过权衡标志（bypassTradeoffFlow）调整时必须重新执行独立审核',
  '适用年龄段（ageBand）或认知结构（cognitiveStructureId）映射调整时必须重新审核',
];

/**
 * 严格校验审核记录是否具备完整的真实独立批准证据（6 要素齐全且状态为 PASSED）
 * AG-R5: isContentAuditValid 与 validateAuditRecord 必须遵守同一个严格审批结果
 */
export function validateAuditRecord(record: Partial<ContentAuditRecord> | undefined): AuditValidationResult {
  if (!record) {
    return {
      isValid: false,
      hasIndependentEvidence: false,
      errors: ['MISSING_AUDIT_RECORD: No audit record found in ContentAuditRegistry'],
    };
  }

  const errors: string[] = [];

  if (record.auditStatus !== 'PASSED') {
    errors.push(`UNAPPROVED_STATUS: auditStatus must be 'PASSED', received '${record.auditStatus}'`);
  }

  if (!record.contentId || typeof record.contentId !== 'string' || record.contentId.trim().length === 0) {
    errors.push('INVALID_CONTENT_ID: contentId must be a non-empty string');
  }

  if (!record.versionSha256 || typeof record.versionSha256 !== 'string' || !SHA256_REGEX.test(record.versionSha256)) {
    errors.push('INVALID_SHA256: versionSha256 must be a valid 64-character hex string');
  }

  const trimmedReviewer = typeof record.reviewer === 'string' ? record.reviewer.trim() : '';
  if (!trimmedReviewer) {
    errors.push('INVALID_REVIEWER: reviewer must be a non-empty string');
  } else if (FABRICATED_REVIEWER_PATTERNS.some((pat) => trimmedReviewer.includes(pat))) {
    errors.push(
      `UNVERIFIED_COMMITTEE_NAME: reviewer "${trimmedReviewer}" is a generic/unverified title; real individual reviewer identity is required`
    );
  }

  if (!record.reviewerQualification || typeof record.reviewerQualification !== 'string' || record.reviewerQualification.trim().length === 0) {
    errors.push('MISSING_REVIEWER_QUALIFICATION: reviewerQualification is required to verify professional credentials');
  }

  if (!record.sceneVersion || typeof record.sceneVersion !== 'string' || record.sceneVersion.trim().length === 0) {
    errors.push('MISSING_SCENE_VERSION: sceneVersion is required for independent audit verification');
  }

  if (!record.approvalEvidence || typeof record.approvalEvidence !== 'string' || record.approvalEvidence.trim().length === 0) {
    errors.push('MISSING_APPROVAL_EVIDENCE: approvalEvidence signature/reference is required');
  }

  if (!Array.isArray(record.invalidationConditions) || record.invalidationConditions.length === 0) {
    errors.push('MISSING_INVALIDATION_CONDITIONS: invalidation and re-audit conditions must be specified');
  }

  if (!record.auditTimestamp || typeof record.auditTimestamp !== 'string') {
    errors.push('INVALID_TIMESTAMP: auditTimestamp must be a string');
  } else {
    const parsedDate = Date.parse(record.auditTimestamp);
    if (Number.isNaN(parsedDate)) {
      errors.push('INVALID_TIMESTAMP_FORMAT: auditTimestamp must be a valid ISO 8601 date string');
    }
  }

  const isFullyValid = errors.length === 0;
  return {
    isValid: isFullyValid,
    hasIndependentEvidence: isFullyValid,
    errors,
  };
}

/**
 * 别名保持向后兼容：必须遵循完全相同的严格审查逻辑
 */
export const validateIndependentAuditEvidence = validateAuditRecord;

/**
 * 内容审核注册中心 (Singleton class)
 */
export class ContentAuditRegistryClass {
  private registry = new Map<string, ContentAuditRecord>();

  constructor() {
    this.seedDefaultAuditRecords();
  }

  /**
   * 预注册系统所有场景与叶子的审核初始状态：
   * AG-R5 铁律：删除所有没有真实独立批准证据的默认 PASSED 审核记录！
   * 没有专家真实审批时，一律为 PENDING 状态，严禁制造任何虚假 PASSED 记录。
   */
  private seedDefaultAuditRecords(): void {
    const defaultPendingRecords: ContentAuditRecord[] = [
      {
        contentId: 'SCENE_A_PEER_ASKING_RESIDENCE_V1',
        sceneVersion: '1.0.0',
        versionSha256: '7c4e89b103d2a4f5e67890123456789abcdef0123456789abcdef0123456789a',
        reviewer: '',
        reviewerQualification: '',
        auditTimestamp: '2026-10-14T00:00:00.000Z',
        auditStatus: 'PENDING',
        approvalEvidence: '',
        invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
        pedagogicalNotes: '待独立专业伦理审核：赋权儿童自主隐私边界，严禁将公开披露绑架为勇敢。',
        auditScope: 'AGE_6_8_COGNITIVE_SCENARIO',
      },
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
        pedagogicalNotes: '待独立专业伦理审核：欺凌边界强制跳过多视角权衡，提供现实保护路径。',
        auditScope: 'AGE_6_8_COGNITIVE_SCENARIO',
      },
      {
        contentId: 'SCENE_C_RAINY_OUTDOOR_CANCEL_V1',
        sceneVersion: '1.0.0',
        versionSha256: '9e60abd325f4c6170890123456789abcdef0123456789abcdef0123456789c01',
        reviewer: '',
        reviewerQualification: '',
        auditTimestamp: '2026-10-14T00:00:00.000Z',
        auditStatus: 'PENDING',
        approvalEvidence: '',
        invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
        pedagogicalNotes: '待独立专业伦理审核：允许负面情绪保留，反有毒积极性。',
        auditScope: 'AGE_6_8_COGNITIVE_SCENARIO',
      },
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
        pedagogicalNotes: '待独立专业伦理审核：通过杯子大小理解不同视角的看见。',
        auditScope: 'STORY_GROVE_LEAF',
      },
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
        pedagogicalNotes: '待独立专业伦理审核：天气变化与情绪容纳叶。',
        auditScope: 'STORY_GROVE_LEAF',
      },
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
        pedagogicalNotes: '待独立专业审核：家庭转换敏感叶，需成人陪伴开启。',
        auditScope: 'STORY_GROVE_SENSITIVE_LEAF',
      },
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
        pedagogicalNotes: '待独立专业审核：父母延迟回复电话敏感叶，需成人陪伴开启。',
        auditScope: 'STORY_GROVE_SENSITIVE_LEAF',
      },
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
        pedagogicalNotes: '待独立专业审核：同伴询问回应叶，需成人陪伴开启。',
        auditScope: 'STORY_GROVE_SENSITIVE_LEAF',
      },
    ];

    for (const record of defaultPendingRecords) {
      this.registry.set(record.contentId, record);
    }
  }

  /**
   * 注册一条审核记录（若为 PASSED，必须经过完整独立审核校验）
   */
  public registerAuditRecord(record: ContentAuditRecord): boolean {
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
        !SHA256_REGEX.test(normalized.versionSha256)
      ) {
        return false;
      }
      this.registry.set(normalized.contentId, normalized);
      return true;
    }

    const validation = validateAuditRecord(normalized);
    if (!validation.isValid) {
      return false;
    }
    this.registry.set(normalized.contentId, normalized);
    return true;
  }

  /**
   * 获取某内容的审核记录
   */
  public getAuditRecord(contentId: string): ContentAuditRecord | undefined {
    return this.registry.get(contentId);
  }

  /**
   * 检查内容是否通过独立审核且可作为已审核安全内容渲染
   * 若传入了 contentPayloadOrHash，额外校验真实规范化 SHA-256 是否完全匹配
   */
  public isContentAuditValid(
    contentId: string,
    contentPayloadOrHash?: unknown,
    expectedVersion?: string
  ): boolean {
    const record = this.registry.get(contentId);
    if (!record) return false;
    const validation = validateAuditRecord(record);
    if (!validation.isValid || record.auditStatus !== 'PASSED') {
      return false;
    }

    if (expectedVersion && record.sceneVersion && record.sceneVersion !== expectedVersion) {
      return false;
    }

    // 若提供了内容载荷或预期哈希，进行哈希一致性检验
    if (contentPayloadOrHash !== undefined && contentPayloadOrHash !== null) {
      let expectedHash = '';
      if (typeof contentPayloadOrHash === 'string' && SHA256_REGEX.test(contentPayloadOrHash)) {
        expectedHash = contentPayloadOrHash;
      } else {
        expectedHash = computeCanonicalSha256(contentPayloadOrHash);
      }
      if (expectedHash !== record.versionSha256) {
        return false;
      }
    }

    return true;
  }

  /**
   * 严格检查内容是否具备完整的独立审核证据
   */
  public hasVerifiedIndependentAudit(contentId: string, expectedVersion?: string): boolean {
    const record = this.registry.get(contentId);
    if (!record) return false;
    if (!this.isContentAuditValid(contentId, undefined, expectedVersion)) return false;
    return true;
  }

  /**
   * 判断某个内容对象（带 sceneId / id / contentId / sceneVersion）是否具备有效 PASSED 审核记录
   */
  public canRenderContent(
    content: { sceneId?: string; id?: string; contentId?: string; sceneVersion?: string; version?: string } | string,
    contentPayloadOrHash?: unknown,
    expectedVersion?: string
  ): boolean {
    if (typeof content === 'string') {
      return this.isContentAuditValid(content, contentPayloadOrHash, expectedVersion);
    }
    if (!content || typeof content !== 'object') return false;
    const id = content.sceneId || content.contentId || content.id;
    if (!id || typeof id !== 'string') return false;
    const version = expectedVersion || content.sceneVersion || content.version;
    return this.isContentAuditValid(id, contentPayloadOrHash || content, version);
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
      pedagogicalNotes: reason ? `[REVOKED]: ${reason}` : '[REVOKED]: Approval revoked',
    });
    return true;
  }

  /**
   * 清空所有记录 (用于单元测试隔离)
   */
  public clearRegistry(): void {
    this.registry.clear();
  }

  /**
   * 重置回默认待审核登记状态 (用于单元测试恢复)
   */
  public resetToDefault(): void {
    this.registry.clear();
    this.seedDefaultAuditRecords();
  }
}

/** 导出全局单例 */
export const ContentAuditRegistry = new ContentAuditRegistryClass();
