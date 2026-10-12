import { AuthProvider, AuthSession } from './authProvider';
import { ScopedChildDeviceManager } from './childDeviceBinding';

export class FirebaseAuthAdapter implements AuthProvider {
  private currentSession: AuthSession | null = null;

  constructor(initialSession?: AuthSession) {
    this.currentSession = initialSession || null;
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    return this.currentSession;
  }

  async authenticateCaregiver(): Promise<AuthSession> {
    // 监护人通过 Google 身份认证
    const caregiverSession: AuthSession = {
      uid: 'cg_parent_123',
      role: 'CAREGIVER',
      familyId: 'family_alpha',
      email: 'parent@example.com',
      scopes: [
        'caregiver:read',
        'caregiver:write',
        'caregiver:private_notes',
        'family:manage'
      ]
    };
    this.currentSession = caregiverSession;
    return caregiverSession;
  }

  async bindChildDevice(params: {
    familyId: string;
    deviceId: string;
    participantPseudonym: string;
    pairingToken: string;
  }): Promise<AuthSession> {
    const session = ScopedChildDeviceManager.createChildDeviceSession({
      deviceId: params.deviceId,
      familyId: params.familyId,
      participantPseudonym: params.participantPseudonym,
      scopes: [
        'child:read_leaves',
        'child:emit_hug_request',
        'child:record_weather'
      ]
    });
    this.currentSession = session;
    return session;
  }

  async signOut(): Promise<void> {
    this.currentSession = null;
  }
}
