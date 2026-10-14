import { describe, it, expect, beforeEach } from 'vitest';
import {
  AuthSession,
  verifyEndpointAuthorization,
  AuthorizationError,
  FirestoreDataStoreAdapter,
  ScopedChildDeviceManager,
  FirebaseAuthAdapter,
  FirebaseNotificationAdapter,
  FirebaseEventSinkAdapter
} from '../../src/providers';
import { HugRequestType, CareResponsibility, CoPresenceStatus, CommunicationStatus } from '../../src/domain/hug/types';
import { SupportLevel } from '../../src/domain/scaffolding/types';
import {
  FailureCode,
  CoarseLatencyBucket,
  ExitType,
  CoarseEmotionalLoad,
  AdultInterventionType
} from '../../src/domain/research/types';

describe('Phase L: Backend, Auth, and Data Isolation Contracts', () => {
  // 测试角色与身份定义
  const caregiverA: AuthSession = {
    uid: 'cg_alice',
    role: 'CAREGIVER',
    familyId: 'family_101',
    email: 'alice@family101.org',
    scopes: ['caregiver:read', 'caregiver:write', 'caregiver:private_notes', 'write:caregiver_config']
  };

  const caregiverB_sameFamily: AuthSession = {
    uid: 'cg_bob',
    role: 'CAREGIVER',
    familyId: 'family_101',
    email: 'bob@family101.org',
    scopes: ['caregiver:read', 'caregiver:write', 'caregiver:private_notes', 'write:caregiver_config']
  };

  const caregiverFamily2: AuthSession = {
    uid: 'cg_charlie',
    role: 'CAREGIVER',
    familyId: 'family_202',
    email: 'charlie@family202.org',
    scopes: ['caregiver:read', 'caregiver:write', 'caregiver:private_notes']
  };

  const childDeviceA: AuthSession = ScopedChildDeviceManager.createChildDeviceSession({
    deviceId: 'tablet_ipad_01',
    familyId: 'family_101',
    participantPseudonym: 'child_star_99',
    scopes: ['child:read_leaves', 'child:emit_hug_request', 'child:record_weather']
  });

  const researcherSession: AuthSession = {
    uid: 'res_dr_smith',
    role: 'RESEARCHER',
    familyId: '', // 研究员无家庭成员身份
    scopes: ['research:export']
  };

  let store: FirestoreDataStoreAdapter;

  beforeEach(() => {
    store = new FirestoreDataStoreAdapter();
  });

  describe('Server Authorization Guard (verifyEndpointAuthorization)', () => {
    it('1. Family Isolation: family A 不能读 family B', () => {
      // Caregiver A 尝试访问 Family 202
      expect(() => {
        verifyEndpointAuthorization({
          session: caregiverA,
          targetFamilyId: 'family_202',
          actionType: 'READ'
        });
      }).toThrowError(/FAMILY_MISMATCH/);

      // Caregiver Charlie 正常访问 Family 202
      expect(() => {
        verifyEndpointAuthorization({
          session: caregiverFamily2,
          targetFamilyId: 'family_202',
          actionType: 'READ'
        });
      }).not.toThrow();
    });

    it('2. Caregiver Private Note Isolation: caregiver A 不能读 caregiver B private note', () => {
      // 同一家庭中，Alice 尝试读取 Bob 的私密复盘笔记
      expect(() => {
        verifyEndpointAuthorization({
          session: caregiverA,
          targetFamilyId: 'family_101',
          resourceOwnerId: caregiverB_sameFamily.uid,
          actionType: 'READ'
        });
      }).toThrowError(/RESOURCE_OWNERSHIP_VIOLATION/);

      // Bob 可以读取自己的私密自省笔记
      expect(() => {
        verifyEndpointAuthorization({
          session: caregiverB_sameFamily,
          targetFamilyId: 'family_101',
          resourceOwnerId: caregiverB_sameFamily.uid,
          actionType: 'READ'
        });
      }).not.toThrow();
    });

    it('3. Child Device Restricted: child device 不能读 caregiver notes', () => {
      expect(() => {
        verifyEndpointAuthorization({
          session: childDeviceA,
          targetFamilyId: 'family_101',
          resourceOwnerId: caregiverA.uid,
          requiredRole: 'CAREGIVER',
          actionType: 'READ'
        });
      }).toThrowError(/ROLE_FORBIDDEN/);
    });

    it('4. Child Device Restricted: child device 不能改变 caregiver', () => {
      expect(() => {
        verifyEndpointAuthorization({
          session: childDeviceA,
          targetFamilyId: 'family_101',
          actionType: 'MUTATE_CAREGIVER'
        });
      }).toThrowError(/CHILD_CANNOT_MUTATE_CAREGIVER/);
    });

    it('5. Researcher Isolation: researcher 不能读 raw family content', () => {
      expect(() => {
        verifyEndpointAuthorization({
          session: researcherSession,
          targetFamilyId: 'family_101',
          actionType: 'READ'
        });
      }).toThrowError(/FORBIDDEN_RESEARCHER_ACCESS/);

      // 但研究员可以执行 RESEARCH_EXPORT
      expect(() => {
        verifyEndpointAuthorization({
          session: researcherSession,
          targetFamilyId: '',
          actionType: 'RESEARCH_EXPORT'
        });
      }).not.toThrow();
    });
  });

  describe('DataStore Adapter & Artifact Guardrails', () => {
    it('拒绝上传 Local-only child artifacts (自由录音、自由画作)', async () => {
      const illegalChildArtifact = {
        familyId: 'family_101',
        rawVoice: 'base64_child_audio_stream_data...',
        drawingCanvas: 'data:image/png;base64,...'
      };

      await expect(
        store.setDoc('child_records', 'rec_01', illegalChildArtifact, childDeviceA)
      ).rejects.toThrow(/SECURITY VIOLATION: Local-only child artifacts MUST NOT be uploaded/);
    });

    it('允许合规的儿童思考结构事件持久化', async () => {
      const compliantData = {
        familyId: 'family_101',
        structureId: 'FACT_VS_INFERENCE',
        supportLevel: 'S2',
        completedAt: new Date().toISOString()
      };

      await expect(
        store.setDoc('child_records', 'rec_ok', compliantData, childDeviceA)
      ).resolves.not.toThrow();

      const retrieved = await store.getDoc<typeof compliantData>('child_records', 'rec_ok', childDeviceA);
      expect(retrieved?.structureId).toBe('FACT_VS_INFERENCE');
    });

    it('跨家庭读取阻断 (Family A 读取 Family B 存储的记录失败)', async () => {
      await store.setDoc(
        'child_records',
        'rec_fam2',
        { familyId: 'family_202', data: 'confidential' },
        caregiverFamily2
      );

      // Caregiver A 尝试读取 Family 202 的记录
      await expect(
        store.getDoc('child_records', 'rec_fam2', caregiverA)
      ).rejects.toThrowError(/FAMILY_MISMATCH/);
    });
  });

  describe('Scoped Child Device Binding Flow', () => {
    it('正确生成安全受控的设备绑定，过滤所有管理权限', () => {
      const bindingPayload = ScopedChildDeviceManager.generateDeviceBindingPayload({
        familyId: 'family_101',
        caregiverUid: caregiverA.uid,
        participantPseudonym: 'child_p01'
      });

      expect(bindingPayload.pairingToken).toContain('pair_family_101');
      expect(bindingPayload.scopes).toContain('child:read_leaves');
      expect(bindingPayload.scopes).not.toContain('write:caregiver_config');

      const session = ScopedChildDeviceManager.createChildDeviceSession({
        deviceId: 'tablet_007',
        familyId: 'family_101',
        participantPseudonym: 'child_p01',
        scopes: [...bindingPayload.scopes, 'caregiver:private_notes'] // 试图非法混入
      });

      // 验证敏感权限被自动剔除
      expect(session.scopes).not.toContain('caregiver:private_notes');
      expect(session.role).toBe('CHILD_DEVICE');
    });
  });

  describe('Firebase Event Sink Isolation', () => {
    it('Event sink 仅允许去标识化数据导出，拦截研究员越权写入家庭', async () => {
      const eventSink = new FirebaseEventSinkAdapter();

      const emitResult = await eventSink.recordEvent(
        {
          participantPseudonymousId: 'child_09',
          sessionId: 's_01',
          contentId: 'fact_leaf_01',
          structureId: 'FACT_VS_INFERENCE',
          supportLevel: SupportLevel.S1_IMPLICIT_PROMPT,
          failureCode: FailureCode.NONE,
          latencyBucket: CoarseLatencyBucket.NORMAL_5_30S,
          exitType: ExitType.COMPLETED,
          coarseEmotionalLoad: CoarseEmotionalLoad.CALM,
          adultInterventionType: AdultInterventionType.NONE,
          timestamp: Date.now()
        },
        childDeviceA
      );
      expect(emitResult.success).toBe(true);

      const exported = await eventSink.exportDeIdentifiedEvents(undefined, researcherSession);
      expect(exported.length).toBe(1);
      expect(exported[0].participantPseudonymousId).toBe('child_09');

      // 验证研究员尝试发起家庭级别数据写入被拒
      const badResult = await eventSink.recordEvent(
        {
          participantPseudonymousId: 'child_fake',
          sessionId: 's_bad',
          contentId: 'leaf_bad',
          structureId: 'CHOICE_TRADEOFF',
          supportLevel: SupportLevel.S0_INDEPENDENT,
          failureCode: FailureCode.NONE,
          latencyBucket: CoarseLatencyBucket.FAST_UNDER_5S,
          exitType: ExitType.COMPLETED,
          coarseEmotionalLoad: CoarseEmotionalLoad.CALM,
          adultInterventionType: AdultInterventionType.NONE,
          timestamp: Date.now()
        },
        researcherSession
      );
      expect(badResult.success).toBe(false);
    });
  });

  describe('AG-R5 Real HTTP Request Verification', () => {
    it('真实 HTTP GET /api/health 返回 200 OK 与本机高安全运行状态', async () => {
      const { createApiApp } = await import('../../server');
      const http = await import('http');
      const app = createApiApp();
      const server = http.createServer(app);

      await new Promise<void>((resolve) => server.listen(0, resolve));
      const port = (server.address() as any).port;

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/health`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.status).toBe('ok');
        expect(data.mode).toBe('local-only-verified');
        expect(data.remoteRelayEnabled).toBe(false);
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    it('真实 HTTP POST /api/caregiver/sync 私有 API 强制 Fail-Closed 返回 503', async () => {
      const { createApiApp } = await import('../../server');
      const http = await import('http');
      const app = createApiApp();
      const server = http.createServer(app);

      await new Promise<void>((resolve) => server.listen(0, resolve));
      const port = (server.address() as any).port;

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/caregiver/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ familyId: 'family_101', secretData: 'test' }),
        });
        expect(res.status).toBe(503);
        const data = await res.json();
        expect(data.code).toBe('API_DISABLED_PENDING_VERIFIED_AUTH');
        expect(data.error).toBe('CLOUD_API_DISABLED');
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });
});
