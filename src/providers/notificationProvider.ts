import { HugDomainState } from '../domain/hug/types';
import { AuthSession } from './authProvider';

export interface NotificationPayload {
  readonly recipientCaregiverId?: string;
  readonly familyId: string;
  readonly title: string;
  readonly body: string;
  readonly hugState?: HugDomainState;
  readonly sentAt: string;
}

export interface NotificationProvider {
  sendCaregiverAlert(payload: NotificationPayload, session: AuthSession): Promise<{ deliveryId: string; success: boolean }>;
  subscribeToAlerts(caregiverId: string, onAlert: (payload: NotificationPayload) => void): () => void;
}
