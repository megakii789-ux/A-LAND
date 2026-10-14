import { describe, it, expect, beforeEach } from 'vitest';
import {
  ContentAuditRegistry,
  validateAuditRecord,
  ContentAuditRecord,
  DEFAULT_INVALIDATION_CONDITIONS,
} from '../domain/cognitive/ContentAuditRegistry';
import { validateUnifiedScene } from '../domain/cognitive/cognitiveValidator';
import { SCENARIO_A_PEER_ASKING_RESIDENCE } from '../domain/cognitive/scenarios/scenarioA_peerAskingResidence';
import { computeCanonicalSha256 } from '../domain/cognitive/sha256';

describe('ContentAuditRegistry AG-R5 Strict Gate Unit Tests', () => {
  beforeEach(() => {
    ContentAuditRegistry.resetToDefault();
  });

  const validIndependentRecord: ContentAuditRecord = {
    contentId: 'TEST_SCENE_V1',
    sceneVersion: '1.0.0',
    versionSha256: 'a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4',
    reviewer: '张林（副主任医师 / 临床儿童心理专科）',
    reviewerQualification: '中国心理学会临床心理注册系统注册督导师（D-21-089）',
    auditTimestamp: '2026-10-12T00:00:00.000Z',
    auditStatus: 'PASSED',
    approvalEvidence: 'INDEP-ETHICS-2026-R5-APPROVAL-001',
    invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS,
    pedagogicalNotes: '经独立医学与伦理双盲复核确认',
    auditScope: 'CHILD_INDEPENDENT',
  };

  describe('validateAuditRecord 6 要素严格审查', () => {
    it('具备完备 6 要素及真实独立资格证据时通过', () => {
      const result = validateAuditRecord(validIndependentRecord);
      expect(result.isValid).toBe(true);
      expect(result.hasIndependentEvidence).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('拒绝非法或非 64 位 SHA-256', () => {
      const record = { ...validIndependentRecord, versionSha256: 'invalid_sha' };
      const result = validateAuditRecord(record);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('INVALID_SHA256'))).toBe(true);
    });

    it('拒绝空白或虚构的审核人（泛化专家委员会、AI审核等）', () => {
      const fakeRecord1 = { ...validIndependentRecord, reviewer: '  ' };
      expect(validateAuditRecord(fakeRecord1).isValid).toBe(false);

      const fakeRecord2 = { ...validIndependentRecord, reviewer: '儿童心理发展与临床伦理专家委员会' };
      const res2 = validateAuditRecord(fakeRecord2);
      expect(res2.isValid).toBe(false);
      expect(res2.errors.some((e) => e.includes('UNVERIFIED_COMMITTEE_NAME'))).toBe(true);

      const fakeRecord3 = { ...validIndependentRecord, reviewer: '系统自动AI审核' };
      expect(validateAuditRecord(fakeRecord3).isValid).toBe(false);
    });

    it('缺少执业资格证据或批准编号时拒绝', () => {
      const noQualRecord = { ...validIndependentRecord, reviewerQualification: '' };
      expect(validateAuditRecord(noQualRecord).isValid).toBe(false);

      const noEvidenceRecord = { ...validIndependentRecord, approvalEvidence: '' };
      expect(validateAuditRecord(noEvidenceRecord).isValid).toBe(false);
    });

    it('审核结论非 PASSED（例如 PENDING / REJECTED）时拒绝进入运行时', () => {
      const pendingRecord: ContentAuditRecord = { ...validIndependentRecord, auditStatus: 'PENDING' };
      const result = validateAuditRecord(pendingRecord);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('UNAPPROVED_STATUS'))).toBe(true);
    });
  });

  describe('ContentAuditRegistry AG-R5 默认状态与门禁阻断', () => {
    it('任务一要求：默认预置场景必须为待审核 (PENDING)，不得返回 PASSED 或允许儿童独立渲染', () => {
      expect(ContentAuditRegistry.canRenderContent('SCENE_A_PEER_ASKING_RESIDENCE_V1')).toBe(false);
      expect(ContentAuditRegistry.canRenderContent('SCENE_B_PEER_BULLYING_FAMILY_V1')).toBe(false);
      expect(ContentAuditRegistry.canRenderContent('SCENE_C_RAINY_OUTDOOR_CANCEL_V1')).toBe(false);
      expect(ContentAuditRegistry.canRenderContent('cup-size')).toBe(false);
    });

    it('阻断未知或未登记内容', () => {
      expect(ContentAuditRegistry.canRenderContent('UNAPPROVED_CUSTOM_SCENE')).toBe(false);
      expect(ContentAuditRegistry.isContentAuditValid('UNAPPROVED_CUSTOM_SCENE')).toBe(false);
    });

    it('登记真实完备独立审批后允许渲染，改动内容哈希立即失效', () => {
      const testContent = { text: '这是原始受审场景' };
      const correctHash = computeCanonicalSha256(testContent);

      const approvedRecord: ContentAuditRecord = {
        ...validIndependentRecord,
        contentId: 'HASH_BOUND_SCENE',
        versionSha256: correctHash,
      };

      expect(ContentAuditRegistry.registerAuditRecord(approvedRecord)).toBe(true);
      // 原文完全匹配时允许
      expect(ContentAuditRegistry.isContentAuditValid('HASH_BOUND_SCENE', testContent)).toBe(true);

      // 改动原文（篡改内容），原批准立即失效
      const tamperedContent = { text: '这是被改动的场景文本' };
      expect(ContentAuditRegistry.isContentAuditValid('HASH_BOUND_SCENE', tamperedContent)).toBe(false);
    });

    it('撤销批准后立即关闭儿童运行时门禁', () => {
      ContentAuditRegistry.registerAuditRecord(validIndependentRecord);
      expect(ContentAuditRegistry.canRenderContent('TEST_SCENE_V1')).toBe(true);

      ContentAuditRegistry.revokeAuditApproval('TEST_SCENE_V1', '发现新安全风险');
      expect(ContentAuditRegistry.canRenderContent('TEST_SCENE_V1')).toBe(false);
    });

    it('负向测试：更换版本 (version bump) 未重新审核时，原批准不得用于新版本', () => {
      ContentAuditRegistry.registerAuditRecord({
        ...validIndependentRecord,
        contentId: 'VERSION_TEST_SCENE',
        sceneVersion: '1.0.0',
      });
      // 匹配原版本通过
      expect(ContentAuditRegistry.canRenderContent('VERSION_TEST_SCENE', undefined, '1.0.0')).toBe(true);
      // 更换版本（如升级到 2.0.0）由于未有新版本审核，门禁必须严格阻断
      expect(ContentAuditRegistry.canRenderContent('VERSION_TEST_SCENE', undefined, '2.0.0')).toBe(false);
      expect(ContentAuditRegistry.isContentAuditValid('VERSION_TEST_SCENE', undefined, '2.0.0')).toBe(false);
    });

    it('负向测试：伪造签名或任意哈希不得绕过审核门禁', () => {
      // 伪造签名尝试注册
      const fakeSignedRecord: ContentAuditRecord = {
        ...validIndependentRecord,
        contentId: 'FAKE_SIGN_SCENE',
        reviewer: '开发自审-自动免审通过',
      };
      expect(ContentAuditRegistry.registerAuditRecord(fakeSignedRecord)).toBe(false);
      expect(ContentAuditRegistry.canRenderContent('FAKE_SIGN_SCENE')).toBe(false);

      // 任意伪造哈希校验原文时必须拒绝
      const legitRecord: ContentAuditRecord = {
        ...validIndependentRecord,
        contentId: 'ARBITRARY_HASH_SCENE',
        versionSha256: '0000000000000000000000000000000000000000000000000000000000000000',
      };
      ContentAuditRegistry.registerAuditRecord(legitRecord);
      const actualContent = { title: '真实的测试内容' };
      // 原文计算出的真实 SHA-256 与伪造全0哈希不匹配，必须阻断
      expect(ContentAuditRegistry.isContentAuditValid('ARBITRARY_HASH_SCENE', actualContent)).toBe(false);
    });
  });

  describe('Integration with cognitiveValidator', () => {
    it('Scenario A 处于待审核状态时，结构验证通过但 canEnterChildRuntime 严格为 false', () => {
      const validation = validateUnifiedScene(SCENARIO_A_PEER_ASKING_RESIDENCE);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.canEnterChildRuntime).toBe(false);
    });

    it('未注册审核记录时，validateUnifiedScene 抛出 UNAUDITED_CONTENT 且 canEnterChildRuntime 为 false', () => {
      ContentAuditRegistry.clearRegistry();
      const validation = validateUnifiedScene(SCENARIO_A_PEER_ASKING_RESIDENCE);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some((e) => e.code === 'UNAUDITED_CONTENT')).toBe(true);
      expect(validation.canEnterChildRuntime).toBe(false);
    });
  });
});
