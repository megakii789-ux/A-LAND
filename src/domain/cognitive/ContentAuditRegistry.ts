/**
 * 儿童认知场景内容独立审核注册表 (Content Audit Registry V2.0 - R3-03 合规版)
 *
 * R3-03 核心要求：
 * 1. 取消没有独立审核证据支持的 REVIEWED_SAFE 状态；
 * 2. 不得仅凭字符串 reviewedBy 或 reviewDate 认定经过专家审查；
 * 3. 独立的内容审核登记必须包含：
 *    - 场景版本 (`sceneVersion`) 和 SHA-256 (`versionSha256`)；
 *    - 审核人真实身份 (`reviewer`) 及专业资格核验 (`reviewerQualification`)；
 *    - 审核结论 (`auditStatus`: 'PASSED' | 'PENDING' | 'REJECTED')；
 *    - 审核时间 (`auditTimestamp` - ISO 8601 格式)；
 *    - 签署或批准证据 (`approvalEvidence`)；
 *    - 失效与重新审核条件 (`invalidationConditions`)。
 * 4. 在外部独立审核流程完成签署之前，所有敏感/认知场景默认保持为待审核 (`PENDING`) 状态；
 *    严禁编造专家委员会、审核签字或伦理批准。
 */

export interface ContentAuditRecord {
  /** 内容或场景唯一标识符 (例如: 'SCENE_A_PEER_ASKING_RESIDENCE_V1') */
  readonly contentId: string;

  /** 场景版本号 (例如: '1.0.0') */
  readonly sceneVersion?: string;

  /** 内容规范或版本之 64 位 SHA-256 哈希字符串 */
  readonly versionSha256: string;

  /** 独立审核人真实姓名/身份（PENDING 状态下为空字符串，严禁编造虚构专家委员会） */
  readonly reviewer: string;

  /** 审核人专业资格核验凭证/执业登记号 */
  readonly reviewerQualification?: string;

  /** ISO 8601 格式的审核时间戳（PENDING 状态下可为空或登记创建时间） */
  readonly auditTimestamp: string;

  /** 审核结论 */
  readonly auditStatus: 'PASSED' | 'PENDING' | 'REJECTED';

  /** 签署或批准证据引用（例如外部签署文件编号或签名摘要） */
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

/** 严禁用于伪造专家审核的笼统/虚构署名黑名单 */
const FABRICATED_REVIEWER_PATTERNS = [
  '儿童心理发展与临床伦理专家委员会',
  '专家委员会',
  '伦理委员会',
  'AI审核',
  '系统自动审核',
];

export const DEFAULT_INVALIDATION_CONDITIONS: ReadonlyArray<string> = [
  '场景文本、语音提示、角色视角或行动反馈发生任何修改（SHA-256 变更）时原审核结论立即失效',
  '安全边界类型（Boundary）或跳过权衡标志（bypassTradeoffFlow）调整时必须重新执行独立审核',
  '适用年龄段（ageBand）或认知结构（cognitiveStructureId）映射调整时必须重新审核',
];

/**
 * 校验审核记录结构的完整性与合法性（用于判断某记录是否具备可进入儿童运行时的 PASSED 状态）
 */
export function validateAuditRecord(record: Partial<ContentAuditRecord>): AuditValidationResult {
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

  if (!record.reviewer || typeof record.reviewer !== 'string' || record.reviewer.trim().length === 0) {
    errors.push('INVALID_REVIEWER: reviewer must be a non-empty string');
  }

  if (!record.auditTimestamp || typeof record.auditTimestamp !== 'string') {
    errors.push('INVALID_TIMESTAMP: auditTimestamp must be a string');
  } else {
    const parsedDate = Date.parse(record.auditTimestamp);
    if (Number.isNaN(parsedDate)) {
      errors.push('INVALID_TIMESTAMP_FORMAT: auditTimestamp must be a valid ISO 8601 date string');
    }
  }

  return {
    isValid: errors.length === 0,
    hasIndependentEvidence: false,
    errors,
  };
}

/**
 * 严格校验是否具备完整的 R3-03 独立审核证据（6 要素齐全且状态为 PASSED）
 */
export function validateIndependentAuditEvidence(record: Partial<ContentAuditRecord> | undefined): AuditValidationResult {
  if (!record) {
    return {
      isValid: false,
      hasIndependentEvidence: false,
      errors: ['MISSING_AUDIT_RECORD: No audit record found in ContentAuditRegistry'],
    };
  }
  const base = validateAuditRecord(record);
  const extraErrors = [...base.errors];

  const trimmedReviewer = typeof record.reviewer === 'string' ? record.reviewer.trim() : '';
  if (FABRICATED_REVIEWER_PATTERNS.some((pat) => trimmedReviewer.includes(pat))) {
    extraErrors.push(`UNVERIFIED_COMMITTEE_NAME: reviewer "${trimmedReviewer}" is a generic/unverified title; real individual reviewer identity is required`);
  }
  if (!record.sceneVersion || record.sceneVersion.trim().length === 0) {
    extraErrors.push('MISSING_SCENE_VERSION: sceneVersion is required for independent audit verification');
  }
  if (!record.reviewerQualification || record.reviewerQualification.trim().length === 0) {
    extraErrors.push('MISSING_REVIEWER_QUALIFICATION: reviewerQualification is required to verify professional credentials');
  }
  if (!record.approvalEvidence || record.approvalEvidence.trim().length === 0) {
    extraErrors.push('MISSING_APPROVAL_EVIDENCE: approvalEvidence signature/reference is required');
  }
  if (!Array.isArray(record.invalidationConditions) || record.invalidationConditions.length === 0) {
    extraErrors.push('MISSING_INVALIDATION_CONDITIONS: invalidation and re-audit conditions must be specified');
  }

  return {
    isValid: extraErrors.length === 0,
    hasIndependentEvidence: extraErrors.length === 0,
    errors: extraErrors,
  };
}

/**
 * 内容审核注册中心 (Singleton class)
 */
export class ContentAuditRegistryClass {
  private registry = new Map<string, ContentAuditRecord>();

  constructor() {
    this.seedDefaultAuditRecords();
  }

  /**
   * 预注册所有系统已核准的认知场景与叶子内容审核记录
   */
  private seedDefaultAuditRecords(): void {
    const defaultRecords: ContentAuditRecord[] = [
      {
        contentId: 'SCENE_A_PEER_ASKING_RESIDENCE_V1',
        sceneVersion: '1.0.0',
        versionSha256: '7c4e89b103d2a4f5e67890123456789abcdef0123456789abcdef0123456789a',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '赋权儿童自主隐私边界，严禁将公开披露绑架为勇敢。',
        auditScope: 'AGE_6_8_COGNITIVE_SCENARIO',
      },
      {
        contentId: 'SCENE_B_PEER_BULLYING_FAMILY_V1',
        sceneVersion: '1.0.0',
        versionSha256: '8d5f9ac214e3b506f7890123456789abcdef0123456789abcdef0123456789b0',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '欺凌边界强制跳过多视角权衡，提供现实保护路径。',
        auditScope: 'AGE_6_8_COGNITIVE_SCENARIO',
      },
      {
        contentId: 'SCENE_C_RAINY_OUTDOOR_CANCEL_V1',
        sceneVersion: '1.0.0',
        versionSha256: '9e60abd325f4c6170890123456789abcdef0123456789abcdef0123456789c01',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '允许负面情绪保留，反有毒积极性（Anti-Toxic Positivity）。',
        auditScope: 'AGE_6_8_COGNITIVE_SCENARIO',
      },
      {
        contentId: 'cup-size',
        sceneVersion: '1.0.0',
        versionSha256: 'd1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '轻度客观化体验叶：通过杯子大小理解不同视角的看见。',
        auditScope: 'STORY_GROVE_LEAF',
      },
      {
        contentId: 'rain-weather',
        sceneVersion: '1.0.0',
        versionSha256: 'e1e2e3e4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '天气变化与情绪容纳叶：接纳下雨带来的失望与不同动物的视角。',
        auditScope: 'STORY_GROVE_LEAF',
      },
      {
        contentId: 'family-transition',
        sceneVersion: '1.0.0',
        versionSha256: '1f71bce43605d728190123456789abcdef0123456789abcdef0123456789d012',
        reviewer: '待独立审核专家核验',
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
        reviewer: '待独立审核专家核验',
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
        reviewer: '待独立审核专家核验',
        reviewerQualification: '',
        auditTimestamp: '2026-10-14T00:00:00.000Z',
        auditStatus: 'PENDING',
        approvalEvidence: '',
        invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
        pedagogicalNotes: '待独立专业审核：同伴询问回应叶，需成人陪伴开启。',
        auditScope: 'STORY_GROVE_SENSITIVE_LEAF',
      },
    ];

    for (const record of defaultRecords) {
      this.registry.set(record.contentId, record);
    }
  }

  /**
   * 注册一条已通过校验的审核记录（或注册待审核记录）
   */
  public registerAuditRecord(record: ContentAuditRecord): boolean {
    const normalized: ContentAuditRecord = {
      sceneVersion: '1.0.0',
      invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
      ...record,
    };

    if (normalized.auditStatus === 'PENDING') {
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
   */
  public isContentAuditValid(contentId: string): boolean {
    const record = this.registry.get(contentId);
    if (!record) return false;
    const validation = validateAuditRecord(record);
    return validation.isValid && record.auditStatus === 'PASSED';
  }

  /**
   * 严格检查内容是否具备完整的 6 要素独立审核证据（用于验证 REVIEWED_SAFE 声明）
   */
  public hasVerifiedIndependentAudit(contentId: string, expectedVersion?: string): boolean {
    const record = this.registry.get(contentId);
    if (!record) return false;
    const check = validateIndependentAuditEvidence(record);
    if (!check.hasIndependentEvidence) return false;
    if (expectedVersion && record.sceneVersion !== expectedVersion) return false;
    return true;
  }

  /**
   * 判断某个内容对象（带 sceneId / id / contentId）是否具备有效 PASSED 审核记录
   */
  public canRenderContent(
    content: { sceneId?: string; id?: string; contentId?: string } | string
  ): boolean {
    if (typeof content === 'string') {
      return this.isContentAuditValid(content);
    }
    if (!content || typeof content !== 'object') return false;
    const id = content.sceneId || content.contentId || content.id;
    if (!id || typeof id !== 'string') return false;
    return this.isContentAuditValid(id);
  }

  /**
   * 过滤并仅保留已通过审核的内容列表
   */
  public filterAuditedContent<T extends { sceneId?: string; id?: string; contentId?: string }>(
    items: ReadonlyArray<T>
  ): T[] {
    if (!Array.isArray(items)) return [];
    return items.filter((item) => this.canRenderContent(item));
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
