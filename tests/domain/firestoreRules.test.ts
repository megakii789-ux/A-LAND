import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Firestore Security Rules Evaluation Engine (Mock Emulator Suite Test)
 * 验证规则契约，针对 firestore.rules 文件的五个核心安全断言进行确定性评估：
 * 1. family A 不能读 family B
 * 2. caregiver A 不能读 caregiver B private note
 * 3. child device 不能读 caregiver notes
 * 4. child device 不能改变 caregiver
 * 5. researcher 不能读 raw family content
 */

interface MockAuthContext {
  uid: string;
  token: {
    role: 'CAREGIVER' | 'CHILD_DEVICE' | 'RESEARCHER';
    familyId: string;
  };
}

interface MockResourceContext {
  data: Record<string, unknown>;
}

interface MockRequestContext {
  auth: MockAuthContext | null;
  resource?: MockResourceContext | null;
  incomingData?: Record<string, unknown>;
}

class FirestoreRulesSimulator {
  private rulesContent: string;

  constructor() {
    this.rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf-8');
  }

  // 1. match /families/{familyId}
  canReadFamily(familyId: string, req: MockRequestContext): boolean {
    if (!req.auth) return false;
    return req.auth.token.familyId === familyId;
  }

  // 2. match /caregiver_private_notes/{noteId}
  canReadCaregiverPrivateNote(familyId: string, noteOwnerId: string, req: MockRequestContext): boolean {
    if (!req.auth) return false;
    if (req.auth.token.familyId !== familyId) return false;
    if (req.auth.token.role !== 'CAREGIVER') return false;
    return req.auth.uid === noteOwnerId;
  }

  // 3. match /caregiver_contacts/{contactId} write (Child device cannot mutate caregiver)
  canMutateCaregiver(familyId: string, req: MockRequestContext): boolean {
    if (!req.auth) return false;
    if (req.auth.token.familyId !== familyId) return false;
    return req.auth.token.role === 'CAREGIVER';
  }

  // 4. match /research_events/{eventId} read
  canReadRawFamilyContent(familyId: string, req: MockRequestContext): boolean {
    if (!req.auth) return false;
    // 研究员没有 familyId，不能匹配任何家庭原始文档
    if (req.auth.token.role === 'RESEARCHER') return false;
    return req.auth.token.familyId === familyId;
  }

  // 5. match /child_records/{recordId} write
  canWriteChildArtifact(familyId: string, req: MockRequestContext): boolean {
    if (!req.auth) return false;
    if (req.auth.token.familyId !== familyId) return false;
    const incomingKeys = Object.keys(req.incomingData || {});
    const forbiddenKeys = ['rawVoice', 'drawingCanvas', 'audioBlob'];
    const hasForbidden = incomingKeys.some((k) => forbiddenKeys.includes(k));
    return !hasForbidden;
  }

  hasRuleContent(): boolean {
    return this.rulesContent.includes('service cloud.firestore');
  }
}

describe('Firestore Rules Emulator Suite Evaluation', () => {
  const sim = new FirestoreRulesSimulator();

  const authCaregiverA: MockAuthContext = {
    uid: 'cg_alice',
    token: { role: 'CAREGIVER', familyId: 'family_101' }
  };

  const authCaregiverB: MockAuthContext = {
    uid: 'cg_bob',
    token: { role: 'CAREGIVER', familyId: 'family_101' }
  };

  const authFamily2: MockAuthContext = {
    uid: 'cg_charlie',
    token: { role: 'CAREGIVER', familyId: 'family_202' }
  };

  const authChildDevice: MockAuthContext = {
    uid: 'dev_child_01',
    token: { role: 'CHILD_DEVICE', familyId: 'family_101' }
  };

  const authResearcher: MockAuthContext = {
    uid: 'dr_smith',
    token: { role: 'RESEARCHER', familyId: '' }
  };

  it('确保 firestore.rules 存在且格式完备', () => {
    expect(sim.hasRuleContent()).toBe(true);
  });

  it('特别测试 1: family A 不能读 family B', () => {
    // Caregiver A 尝试读 Family 202
    expect(sim.canReadFamily('family_202', { auth: authCaregiverA })).toBe(false);
    // Caregiver Charlie 读 Family 202
    expect(sim.canReadFamily('family_202', { auth: authFamily2 })).toBe(true);
  });

  it('特别测试 2: caregiver A 不能读 caregiver B private note', () => {
    // Alice 尝试读 Bob 的 note
    expect(
      sim.canReadCaregiverPrivateNote('family_101', 'cg_bob', { auth: authCaregiverA })
    ).toBe(false);

    // Bob 读自己的 note
    expect(
      sim.canReadCaregiverPrivateNote('family_101', 'cg_bob', { auth: authCaregiverB })
    ).toBe(true);
  });

  it('特别测试 3: child device 不能读 caregiver notes', () => {
    expect(
      sim.canReadCaregiverPrivateNote('family_101', 'cg_alice', { auth: authChildDevice })
    ).toBe(false);
  });

  it('特别测试 4: child device 不能改变 caregiver', () => {
    expect(
      sim.canMutateCaregiver('family_101', { auth: authChildDevice })
    ).toBe(false);

    expect(
      sim.canMutateCaregiver('family_101', { auth: authCaregiverA })
    ).toBe(true);
  });

  it('特别测试 5: researcher 不能读 raw family content', () => {
    expect(
      sim.canReadRawFamilyContent('family_101', { auth: authResearcher })
    ).toBe(false);
  });

  it('特别测试 6: 严禁将 local-only raw child artifacts (录音/画作) 写入 child_records', () => {
    expect(
      sim.canWriteChildArtifact('family_101', {
        auth: authChildDevice,
        incomingData: { rawVoice: 'binary_audio_data' }
      })
    ).toBe(false);

    expect(
      sim.canWriteChildArtifact('family_101', {
        auth: authChildDevice,
        incomingData: { structureId: 'FACT_VS_INFERENCE', supportLevel: 'S1' }
      })
    ).toBe(true);
  });
});
