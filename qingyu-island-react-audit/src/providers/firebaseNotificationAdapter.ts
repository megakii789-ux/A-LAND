import { requireImplementedCloudAdapter } from './cloudGuard';
import { NotificationProvider, NotificationPayload } from './notificationProvider';
import { AuthSession } from './authProvider';
import { verifyEndpointAuthorization } from './serverAuthorization';

export class FirebaseNotificationAdapter implements NotificationProvider {
  constructor() { requireImplementedCloudAdapter(); }
  private subscribers: Map<string, Array<(payload: NotificationPayload) => void>> = new Map();

  async sendCaregiverAlert(
    payload: NotificationPayload,
    session: AuthSession
  ): Promise<{ deliveryId: string; success: boolean }> {
    // 验证发出者属于同一个家庭
    verifyEndpointAuthorization({
      session,
      targetFamilyId: payload.familyId,
      actionType: 'WRITE'
    });

    const deliveryId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // 如果有针对特定监护人或广播
    if (payload.recipientCaregiverId) {
      const cbs = this.subscribers.get(payload.recipientCaregiverId) || [];
      cbs.forEach((cb) => cb(payload));
    }

    return { deliveryId, success: true };
  }

  subscribeToAlerts(
    caregiverId: string,
    onAlert: (payload: NotificationPayload) => void
  ): () => void {
    const list = this.subscribers.get(caregiverId) || [];
    list.push(onAlert);
    this.subscribers.set(caregiverId, list);

    return () => {
      const current = this.subscribers.get(caregiverId) || [];
      this.subscribers.set(
        caregiverId,
        current.filter((cb) => cb !== onAlert)
      );
    };
  }
}
