import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  hasParentAccess,
  lockParentAccess,
  grantParentAccess,
  makePinRecord,
  savePinRecord,
  verifyPin,
  readPinRecord,
  pinFormatValid
} from '../../src/domain/privacy/parentAccess';
import {
  OfflineHugController,
  HugSubmitOptions
} from '../../src/domain/hug/offlineHugService';
import {
  HugRequestType,
  CommunicationStatus,
  CareResponsibility,
  CoPresenceStatus,
  HugDomainState
} from '../../src/domain/hug/types';
import { mapHugStateToChildPresentation } from '../../src/domain/hug/hugStateMapper';
import {
  uploadDriveFile,
  listDriveFiles,
  getDriveFileContent,
  deleteDriveFile
} from '../../src/services/googleDrive';
import { googleSignIn, SCOPES } from '../../src/services/googleAuth';
import { calculateWeeklyMetrics, generateLocalWeeklyReport } from '../../src/services/weeklyReportService';

// Storage shim for Node environment
const memoryStore = new Map<string, string>();
const mockStorage = {
  getItem: (key: string) => memoryStore.get(key) || null,
  setItem: (key: string, val: string) => memoryStore.set(key, String(val)),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear()
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: typeof mockStorage }).localStorage = mockStorage;
}
if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as unknown as { sessionStorage: typeof mockStorage }).sessionStorage = mockStorage;
}

describe('AG-01A-R2: P0 Security Remediation Comprehensive Verification Suite', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    lockParentAccess();
  });

  // ================= 1 & 2 & 3: Server Auth & Token Forgery Fail-Closed =================
  describe('SEC-01: Server-side Auth Fail Closed & Forged Token Rejection', () => {
    it('server.ts enforces Fail-Closed on /api/* returning 503 API_DISABLED_PENDING_VERIFIED_AUTH', () => {
      const serverSource = fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf-8');
      expect(serverSource).toContain('API_DISABLED_PENDING_VERIFIED_AUTH');
      expect(serverSource).toContain('res.status(503)');
      // 验证已彻底移除 Base64 解析中间件
      expect(serverSource).not.toMatch(/function\s+extractSession/);
    });

    it('server.ts contains a safe, leak-free /api/health endpoint', () => {
      const serverSource = fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf-8');
      expect(serverSource).toContain("app.get('/api/health'");
      expect(serverSource).not.toContain('childQuotes');
      expect(serverSource).not.toContain('parentObservations');
    });
  });

  // ================= 4 & 5: Firestore Authorization & research_events Isolation =================
  describe('SEC-02: Firestore Authorization Rules & research_events Client Denial', () => {
    it('firestore.rules isolates child_records without loose unauthenticated allow write', () => {
      const rules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf-8');
      const childMatch = rules.match(/match\s+\/child_records\/\{recordId\}\s*\{([\s\S]*?)\}/);
      expect(childMatch).not.toBeNull();
      const content = childMatch![1];
      expect(content).not.toMatch(/allow\s+write:/);
      expect(content).toContain('matchesFamily(familyId)');
      expect(content).toContain('allow delete: if false');
    });

    it('firestore.rules denies all client direct read/write to research_events', () => {
      const rules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf-8');
      expect(rules).toMatch(/match\s+\/research_events\/\{eventId\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
    });

    it('firestore.rules default-denies all other paths', () => {
      const rules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf-8');
      expect(rules).toMatch(/match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
    });
  });

  // ================= 6 & 7: Hug Communication Reality & Downgrade Contracts =================
  describe('SEC-03: Hug Help Reflects Real Communication & Refresh Downgrade', () => {
    it('Clicking help without verified remote relay returns SEND_FAILED even if online', async () => {
      const controller = new OfflineHugController();
      const state = await controller.submitHugRequest({
        isOnline: true,
        targetCaregiverName: '妈妈',
        requestType: HugRequestType.INSTANT_HELP,
        hasVerifiedRemoteRelay: false
      });

      expect(state.communication).toBe(CommunicationStatus.SEND_FAILED);
      expect(state.communication).not.toBe(CommunicationStatus.SENT);

      // 验证提示文案为诚实文案
      const presentation = mapHugStateToChildPresentation(state);
      expect(presentation.displayText).toContain('这里不会发消息');
      expect(presentation.spokenText).toContain('这里不会发消息');
      expect(presentation.spokenText).toContain('直接走到身边的大人面前');
    });

    it('restoreActiveState forcibly downgrades legacy SENT / ACKNOWLEDGED states to SEND_FAILED', () => {
      // 模拟旧 sessionStorage 留存的模拟已送达状态
      sessionStorage.setItem('active_open_hug_state', JSON.stringify({
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.SENT,
        care: CareResponsibility.ASSIGNED_SELF,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: '爸爸'
      }));

      const restored = OfflineHugController.restoreActiveState();
      expect(restored).not.toBeNull();
      expect(restored?.communication).toBe(CommunicationStatus.SEND_FAILED);
      expect(restored?.care).toBe(CareResponsibility.ASSIGNED_SELF);
    });

    it('Local completion does not fabricate remote arrival proof', () => {
      const state: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.SEND_FAILED,
        care: CareResponsibility.UNASSIGNED,
        coPresence: CoPresenceStatus.ARRIVED_CONFIRMED,
        targetCaregiverName: '妈妈'
      };
      const presentation = mapHugStateToChildPresentation(state);
      expect(presentation.shouldStepBack).toBe(true);
      expect(presentation.spokenText).not.toContain('远程送达');
    });
  });

  // ================= 8: Google Drive & Unaudited Cloud Backup Closed =================
  describe('SEC-04: Google Drive OAuth & Cloud Upload Completely Disabled', () => {
    it('Google Drive OAuth scopes are empty and sign-in throws CLOUD_BACKUP_DISABLED', async () => {
      expect(SCOPES.length).toBe(0);
      await expect(googleSignIn()).rejects.toThrow('CLOUD_BACKUP_DISABLED');
    });

    it('Google Drive upload and file functions throw CLOUD_BACKUP_DISABLED', async () => {
      await expect(uploadDriveFile('test.json', '{}')).rejects.toThrow('CLOUD_BACKUP_DISABLED');
      await expect(listDriveFiles()).rejects.toThrow('CLOUD_BACKUP_DISABLED');
      await expect(getDriveFileContent('file_123')).rejects.toThrow('CLOUD_BACKUP_DISABLED');
      await expect(deleteDriveFile('file_123')).rejects.toThrow('CLOUD_BACKUP_DISABLED');
    });
  });

  // ================= 9: Local Data Minimization & Storage Isolation =================
  describe('SEC-05: Child Local Data Minimization & Legacy Isolation', () => {
    it('Local artifacts store provides explicit physical deletion without cloud upload', () => {
      const localStoreSource = fs.readFileSync(path.resolve(process.cwd(), 'src/domain/safety/localChildArtifactStore.ts'), 'utf-8');
      expect(localStoreSource).toContain('deleteArtifact');
      expect(localStoreSource).toContain('clearAllArtifacts');
      expect(localStoreSource).not.toContain('firestore');
      expect(localStoreSource).not.toContain('drive');
    });

    it('AppContext persists only safe non-sensitive settings, leaving private expressions memory-only', () => {
      const appContextSource = fs.readFileSync(path.resolve(process.cwd(), 'src/context/AppContext.tsx'), 'utf-8');
      // 验证写入 safeStateToSave 不包含 childQuotes, missNotes, weatherHistory, parentObservations
      const saveMatch = appContextSource.match(/const safeStateToSave = \{([\s\S]*?)\};/);
      expect(saveMatch).not.toBeNull();
      const saveContent = saveMatch![1];
      expect(saveContent).not.toContain('childQuotes');
      expect(saveContent).not.toContain('missNotes');
      expect(saveContent).not.toContain('todayWeather');
      expect(saveContent).not.toContain('weatherHistory');
      expect(saveContent).not.toContain('parentObservations');
    });
  });

  // ================= 10: Parent Accidental Entry Gate & Lifecycle Lock =================
  describe('SEC-06: Parent Gate PIN & Lifecycle Locking', () => {
    it('Rejects invalid PIN formats (under 6 digits, or all identical digits)', async () => {
      expect(pinFormatValid('12345')).toBe(false); // < 6
      expect(pinFormatValid('111111')).toBe(false); // all identical
      expect(pinFormatValid('99999999')).toBe(false); // all identical
      expect(pinFormatValid('123456')).toBe(true);
      expect(pinFormatValid('852963')).toBe(true);
    });

    it('Generates PBKDF2 salt and hash record and successfully verifies correct PIN', async () => {
      const pinRecord = await makePinRecord('246813');
      savePinRecord(pinRecord);

      expect(hasParentAccess()).toBe(false);

      const wrongResult = await verifyPin('112233');
      expect(wrongResult.success).toBe(false);
      expect(hasParentAccess()).toBe(false);

      const correctResult = await verifyPin('246813');
      expect(correctResult.success).toBe(true);
      expect(hasParentAccess()).toBe(true);
    });

    it('Enforces lockParentAccess to relock memory-only access on demand', () => {
      grantParentAccess();
      expect(hasParentAccess()).toBe(true);
      lockParentAccess();
      expect(hasParentAccess()).toBe(false);
    });

    it('Rate-limits and locks out after 5 consecutive failed attempts', async () => {
      const pinRecord = await makePinRecord('654321');
      savePinRecord(pinRecord);

      for (let i = 0; i < 4; i++) {
        const res = await verifyPin('000001');
        expect(res.success).toBe(false);
      }

      // 第 5 次触发锁定
      const lockoutRes = await verifyPin('000001');
      expect(lockoutRes.success).toBe(false);
      expect(lockoutRes.error).toContain('临时锁定');

      // 锁定期内即便输入正确密码也拒绝
      const lockedCorrectRes = await verifyPin('654321');
      expect(lockedCorrectRes.success).toBe(false);
      expect(lockedCorrectRes.error).toContain('尝试次数过多');
    });
  });

  // ================= 11: Closure of Psychological Scoring & Pseudo-Inference =================
  describe('SEC-07: Psychological Scoring & Diagnostic Inference Closure', () => {
    it('Weekly metrics sets emotionalStabilityScore to 0 and removes arbitrary score grading', () => {
      const metrics = calculateWeeklyMetrics({
        todayWeather: {
          id: 'w1',
          timestamp: new Date().toISOString(),
          primary: 'sunny',
          intensity: 2,
          bodySensations: ['胸口松松的'],
          calmingMethod: '深呼吸'
        },
        weatherHistory: [],
        parentObservations: [],
        completedLeaves: ['leaf-1', 'leaf-2'],
        medals: [],
        hugCount: 3
      });

      expect(metrics.emotionalStabilityScore).toBe(0);
    });

    it('generateLocalWeeklyReport produces objective factual observations without diagnostic scores', () => {
      const report = generateLocalWeeklyReport({
        todayWeather: null,
        weatherHistory: [],
        parentObservations: [],
        completedLeaves: [],
        medals: [],
        hugCount: 0
      });

      expect(report.executiveSummary).toContain('客观呈现');
      expect(report.executiveSummary).not.toContain('心理评分');
      expect(report.emotionalStabilityScore).toBe(0);
    });
  });
});
