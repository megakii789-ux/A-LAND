import { AuthProvider, AuthSession, UserRole } from './authProvider';

export class ScopedChildDeviceManager {
  /**
   * 家长端为儿童设备生成一次性 / 受控配对令牌
   */
  static generateDeviceBindingPayload(params: {
    familyId: string;
    caregiverUid: string;
    participantPseudonym: string;
  }): { pairingToken: string; scopes: string[] } {
    if (!params.participantPseudonym.startsWith('child_') && !params.participantPseudonym.startsWith('p_')) {
      throw new Error('Participant pseudonym must not be a real child name');
    }
    return {
      pairingToken: `pair_${params.familyId}_${Date.now()}`,
      scopes: [
        'child:read_leaves',
        'child:emit_hug_request',
        'child:record_weather',
        'child:record_local_artifact'
      ]
    };
  }

  /**
   * 验证儿童设备的绑定与会话范围
   */
  static createChildDeviceSession(params: {
    deviceId: string;
    familyId: string;
    participantPseudonym: string;
    scopes: string[];
  }): AuthSession {
    // 强制过滤任何敏感家长管理范围
    const restrictedScopes = params.scopes.filter(
      (s) => !s.includes('caregiver') && !s.includes('parent_notes') && !s.includes('delete_family')
    );

    return {
      uid: `dev_${params.deviceId}`,
      role: 'CHILD_DEVICE',
      familyId: params.familyId,
      deviceId: params.deviceId,
      participantPseudonym: params.participantPseudonym,
      scopes: restrictedScopes
    };
  }
}
