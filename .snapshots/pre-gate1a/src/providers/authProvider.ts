export type UserRole = 'CAREGIVER' | 'CHILD_DEVICE' | 'RESEARCHER';

export interface AuthSession {
  readonly uid: string;
  readonly role: UserRole;
  readonly familyId: string;
  readonly deviceId?: string;
  readonly participantPseudonym?: string;
  readonly email?: string;
  readonly scopes: readonly string[];
}

export interface AuthProvider {
  getCurrentSession(): Promise<AuthSession | null>;
  authenticateCaregiver(): Promise<AuthSession>;
  bindChildDevice(params: {
    familyId: string;
    deviceId: string;
    participantPseudonym: string;
    pairingToken: string;
  }): Promise<AuthSession>;
  signOut(): Promise<void>;
}
