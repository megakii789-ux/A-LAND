import { describe, it, expect, beforeEach } from 'vitest';
import {
  ContentAuditRegistry,
  validateAuditRecord,
  ContentAuditRecord,
} from '../domain/cognitive/ContentAuditRegistry';
import { validateUnifiedScene } from '../domain/cognitive/cognitiveValidator';
import { SCENARIO_A_PEER_ASKING_RESIDENCE } from '../domain/cognitive/scenarios/scenarioA_peerAskingResidence';

describe('ContentAuditRegistry Unit Tests', () => {
  beforeEach(() => {
    ContentAuditRegistry.resetToDefault();
  });

  describe('validateAuditRecord', () => {
    it('should pass validation for a fully valid audit record', () => {
      const record: ContentAuditRecord = {
        contentId: 'TEST_SCENE_V1',
        versionSha256: 'a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4',
        reviewer: '儿童心理专家',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
      };

      const result = validateAuditRecord(record);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject records with invalid version SHA-256', () => {
      const record: Partial<ContentAuditRecord> = {
        contentId: 'TEST_SCENE_V1',
        versionSha256: 'invalid_sha_256',
        reviewer: '儿童心理专家',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
      };

      const result = validateAuditRecord(record);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('INVALID_SHA256');
    });

    it('should reject records with empty reviewer', () => {
      const record: Partial<ContentAuditRecord> = {
        contentId: 'TEST_SCENE_V1',
        versionSha256: 'a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4',
        reviewer: '  ',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PASSED',
      };

      const result = validateAuditRecord(record);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('INVALID_REVIEWER');
    });

    it('should reject records with invalid timestamp', () => {
      const record: Partial<ContentAuditRecord> = {
        contentId: 'TEST_SCENE_V1',
        versionSha256: 'a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4',
        reviewer: '儿童心理专家',
        auditTimestamp: 'not_a_date',
        auditStatus: 'PASSED',
      };

      const result = validateAuditRecord(record);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('INVALID_TIMESTAMP_FORMAT');
    });

    it('should reject records with status other than PASSED', () => {
      const record: Partial<ContentAuditRecord> = {
        contentId: 'TEST_SCENE_V1',
        versionSha256: 'a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4a1a2a3a4b1b2b3b4c1c2c3c4d1d2d3d4',
        reviewer: '儿童心理专家',
        auditTimestamp: '2026-10-12T00:00:00.000Z',
        auditStatus: 'PENDING',
      };

      const result = validateAuditRecord(record);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('UNAPPROVED_STATUS');
    });
  });

  describe('ContentAuditRegistry methods', () => {
    it('should confirm default pre-seeded scenarios are valid for rendering', () => {
      expect(ContentAuditRegistry.canRenderContent('SCENE_A_PEER_ASKING_RESIDENCE_V1')).toBe(true);
      expect(ContentAuditRegistry.canRenderContent('SCENE_B_PEER_BULLYING_FAMILY_V1')).toBe(true);
      expect(ContentAuditRegistry.canRenderContent('SCENE_C_RAINY_OUTDOOR_CANCEL_V1')).toBe(true);
      expect(ContentAuditRegistry.canRenderContent('cup-size')).toBe(true);
    });

    it('should block unapproved or unregistered content', () => {
      expect(ContentAuditRegistry.canRenderContent('UNAPPROVED_CUSTOM_SCENE')).toBe(false);
    });

    it('should register new audit record and allow rendering', () => {
      const newRecord: ContentAuditRecord = {
        contentId: 'NEW_AUDITED_SCENE',
        versionSha256: '1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff',
        reviewer: '伦理委员会',
        auditTimestamp: '2026-10-13T00:00:00.000Z',
        auditStatus: 'PASSED',
      };

      const registered = ContentAuditRegistry.registerAuditRecord(newRecord);
      expect(registered).toBe(true);
      expect(ContentAuditRegistry.canRenderContent('NEW_AUDITED_SCENE')).toBe(true);
    });

    it('should filter items based on audit registry records', () => {
      const items = [
        { id: 'cup-size', name: 'Cup Leaf' },
        { id: 'UNAPPROVED_LEAF', name: 'Fake Leaf' },
        { sceneId: 'SCENE_A_PEER_ASKING_RESIDENCE_V1', name: 'Scene A' },
      ];

      const filtered = ContentAuditRegistry.filterAuditedContent(items);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(f => f.name)).toEqual(['Cup Leaf', 'Scene A']);
    });
  });

  describe('Integration with cognitiveValidator', () => {
    it('should validate Scenario A when registered in audit registry', () => {
      const validation = validateUnifiedScene(SCENARIO_A_PEER_ASKING_RESIDENCE);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail scenario validation if audit record is cleared or missing', () => {
      ContentAuditRegistry.clearRegistry();
      const validation = validateUnifiedScene(SCENARIO_A_PEER_ASKING_RESIDENCE);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.code === 'UNAUDITED_CONTENT')).toBe(true);
    });
  });
});

