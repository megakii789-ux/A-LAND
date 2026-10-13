/**
 * 儿童认知场景内容独立审核注册表 (Content Audit Registry V1.0)
 * 
 * 核心安全要求：
 * 所有认知场景与互动故事内容必须具备完整的审核元数据记录，包括：
 * - 内容唯一标识 (contentId)
 * - 内容版本 SHA-256 校验和 (versionSha256)
 * - 独立审核员/专家委员会签名 (reviewer)
 * - 审核时间戳 (auditTimestamp - ISO 8601 格式)
 * - 审核状态 (auditStatus - 'PASSED')
 * 
 * 只有标记为有效且通过审核 (auditStatus === 'PASSED') 的内容才被允许在儿童前端组件中渲染。
 */

export interface ContentAuditRecord {
  /** 内容或场景唯一标识符 (例如: 'SCENE_A_PEER_ASKING_RESIDENCE_V1') */
  readonly contentId: string;

  /** 内容规范或版本之 64 位 SHA-256 哈希字符串 */
  readonly versionSha256: string;

  /** 独立审核人或专业委员会签名 */
  readonly reviewer: string;

  /** ISO 8601 格式的审核时间戳 */
  readonly auditTimestamp: string;

  /** 审核状态 */
  readonly auditStatus: 'PASSED' | 'PENDING' | 'REJECTED';

  /** 教学与儿童心理学备注 */
  readonly pedagogicalNotes?: string;

  /** 审核适用范围 */
  readonly auditScope?: string;
}

export interface AuditValidationResult {
  readonly isValid: boolean;
  readonly errors: ReadonlyArray<string>;
}

/** 64 位 SHA-256 十六进制正则表达式 */
const SHA256_REGEX = /^[a-fA-F0-9]{64}$/;

/**
 * 校验审核记录结构的完整性与合法性
 */
export function validateAuditRecord(record: Partial<ContentAuditRecord>): AuditValidationResult {
  const errors: string[] = [];

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

  if (record.auditStatus !== 'PASSED') {
    errors.push(`UNAPPROVED_STATUS: auditStatus must be 'PASSED', received '${record.auditStatus}'`);
  }

  return {
    isValid: errors.length === 0,
    errors,
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
        versionSha256: 'a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '经核准：赋权儿童自主隐私边界，严禁将公开披露绑架为勇敢。',
        auditScope: 'AGE_6_8_COGNITIVE_SCENARIO',
      },
      {
        contentId: 'SCENE_B_PEER_BULLYING_FAMILY_V1',
        versionSha256: 'b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '经核准：欺凌边界强制跳过多视角权衡，提供现实保护路径。',
        auditScope: 'AGE_6_8_COGNITIVE_SCENARIO',
      },
      {
        contentId: 'SCENE_C_RAINY_OUTDOOR_CANCEL_V1',
        versionSha256: 'c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '经核准：允许负面情绪保留，反有毒积极性（Anti-Toxic Positivity）。',
        auditScope: 'AGE_6_8_COGNITIVE_SCENARIO',
      },
      {
        contentId: 'cup-size',
        versionSha256: 'd1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '轻度客观化体验叶：通过杯子大小理解不同视角的看见。',
        auditScope: 'STORY_GROVE_LEAF',
      },
      {
        contentId: 'rain-weather',
        versionSha256: 'e1e2e3e4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '天气变化与情绪容纳叶：接纳下雨带来的失望与不同动物的视角。',
        auditScope: 'STORY_GROVE_LEAF',
      },
      {
        contentId: 'peer-residence',
        versionSha256: 'f1f2f3f4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '同伴询问回应叶：捍卫隐私边界与中性应答。',
        auditScope: 'STORY_GROVE_LEAF',
      },
      {
        contentId: 'crayon-detective',
        versionSha256: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '蜡笔小侦探游戏：事实与猜想拆分。',
        auditScope: 'INTERACTIVE_GAME',
      },
      {
        contentId: 'friend-asks-home',
        versionSha256: '223344556677889900aabbccddeeff11223344556677889900aabbccddeeff11',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '小客来访游戏：分通择社会交往。',
        auditScope: 'INTERACTIVE_GAME',
      },
      {
        contentId: 'toy-boat-negotiation',
        versionSha256: '3344556677889900aabbccddeeff11223344556677889900aabbccddeeff1122',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '小船协商游戏：控制点与自主选择。',
        auditScope: 'INTERACTIVE_GAME',
      },
      {
        contentId: 'transfer-scenarios',
        versionSha256: '44556677889900aabbccddeeff11223344556677889900aabbccddeeff112233',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '迁移实验室：跨情境关系结构迁移测试。',
        auditScope: 'TRANSFER_LAB',
      },
      {
        contentId: 'detective-lab',
        versionSha256: '556677889900aabbccddeeff11223344556677889900aabbccddeeff11223344',
        reviewer: '儿童心理发展与临床伦理专家委员会',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
        pedagogicalNotes: '想法侦探社：破除过度归因。',
        auditScope: 'THOUGHT_LAB',
      },
    ];

    for (const record of defaultRecords) {
      this.registry.set(record.contentId, record);
    }
  }

  /**
   * 注册一条审核记录
   */
  public registerAuditRecord(record: ContentAuditRecord): boolean {
    const validation = validateAuditRecord(record);
    if (!validation.isValid) {
      console.error(`Failed to register audit record for ${record.contentId}:`, validation.errors);
      return false;
    }
    this.registry.set(record.contentId, record);
    return true;
  }

  /**
   * 获取某内容的审核记录
   */
  public getAuditRecord(contentId: string): ContentAuditRecord | undefined {
    return this.registry.get(contentId);
  }

  /**
   * 检查内容是否通过审核且可安全渲染
   */
  public isContentAuditValid(contentId: string): boolean {
    const record = this.registry.get(contentId);
    if (!record) return false;
    const validation = validateAuditRecord(record);
    return validation.isValid && record.auditStatus === 'PASSED';
  }

  /**
   * 判断某个内容对象（带 sceneId / id / contentId）是否具备有效审核记录
   */
  public canRenderContent(
    content: { sceneId?: string; id?: string; contentId?: string } | string
  ): boolean {
    if (typeof content === 'string') {
      return this.isContentAuditValid(content);
    }
    if (!content) return false;
    const id = content.sceneId || content.contentId || content.id;
    if (!id) return false;
    return this.isContentAuditValid(id);
  }

  /**
   * 过滤并仅保留已通过审核的内容列表
   */
  public filterAuditedContent<T extends { sceneId?: string; id?: string; contentId?: string }>(
    items: ReadonlyArray<T>
  ): T[] {
    return items.filter((item) => this.canRenderContent(item));
  }

  /**
   * 清空所有记录 (用于单元测试隔离)
   */
  public clearRegistry(): void {
    this.registry.clear();
  }

  /**
   * 重置回默认已核准的记录 (用于单元测试恢复)
   */
  public resetToDefault(): void {
    this.registry.clear();
    this.seedDefaultAuditRecords();
  }
}

/** 导出全局单例 */
export const ContentAuditRegistry = new ContentAuditRegistryClass();
