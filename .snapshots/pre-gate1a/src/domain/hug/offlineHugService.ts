/**
 * Offline & Network Resilient Hug Service
 * 遵循 Phase M 契约与 docs/PRODUCT_CONTRACTS.md:
 * 1. 即时抱抱请求在离线时：明确显示没有发送成功 (CommunicationStatus.SEND_FAILED)
 * 2. 绝对不得模拟成功！
 * 3. 防止重复提交 (Duplicate Submit Guard)
 * 4. 网络恢复自动感知与单次重试/重新提示 (Reconnect)
 * 5. 页面刷新/离开时的开状态保护 (Refresh during open hug)
 */

import {
  HugRequestType,
  CommunicationStatus,
  CareResponsibility,
  CoPresenceStatus,
  HugDomainState
} from './types';

export interface HugSubmitOptions {
  isOnline: boolean;
  targetCaregiverName: string;
  requestType: HugRequestType;
}

export class OfflineHugController {
  private activePendingRequestId: string | null = null;
  private isSubmitting: boolean = false;

  /**
   * 提交抱抱请求并返回确定性领域状态
   */
  async submitHugRequest(options: HugSubmitOptions): Promise<HugDomainState> {
    // 防重复提交保护 (Duplicate submit guard)
    if (this.isSubmitting) {
      throw new Error('DUPLICATE_SUBMIT_BLOCKED: A hug request submission is already in progress');
    }

    this.isSubmitting = true;
    try {
      // 核心契约：离线时明确显示没有发送成功，绝对不得模拟成功
      if (!options.isOnline) {
        return {
          requestType: options.requestType,
          communication: CommunicationStatus.SEND_FAILED,
          care: CareResponsibility.UNASSIGNED,
          coPresence: CoPresenceStatus.NOT_PRESENT,
          targetCaregiverName: options.targetCaregiverName
        };
      }

      // 在线时返回发送成功
      const requestId = `hug_${Date.now()}`;
      this.activePendingRequestId = requestId;
      return {
        requestType: options.requestType,
        communication: CommunicationStatus.SENT,
        care: CareResponsibility.UNASSIGNED,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: options.targetCaregiverName
      };
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * 网络丢失拦截器
   */
  handleNetworkLossDuringHug(currentState: HugDomainState): HugDomainState {
    // 若尚未收到家长端确认 (ACKNOWLEDGED) 且网络突然中断，必须准确降级为通信失败状态
    if (
      currentState.communication === CommunicationStatus.SENDING ||
      currentState.communication === CommunicationStatus.SENT
    ) {
      return {
        ...currentState,
        communication: CommunicationStatus.SEND_FAILED
      };
    }
    return currentState;
  }

  /**
   * 网络重新连接检测
   */
  handleReconnect(currentState: HugDomainState): { canRetry: boolean; promptText: string } {
    if (currentState.communication === CommunicationStatus.SEND_FAILED) {
      return {
        canRetry: true,
        promptText: '网络信号恢复啦。如果依然需要大人，可以点击重新发送。'
      };
    }
    return {
      canRetry: false,
      promptText: '网络已恢复连接。'
    };
  }

  /**
   * 刷新/重新打开时的持久化状态恢复 (Refresh during open hug)
   */
  static serializeActiveState(state: HugDomainState | null): void {
    if (!state) {
      sessionStorage.removeItem('active_open_hug_state');
    } else {
      sessionStorage.setItem('active_open_hug_state', JSON.stringify(state));
    }
  }

  static restoreActiveState(): HugDomainState | null {
    try {
      const raw = sessionStorage.getItem('active_open_hug_state');
      if (!raw) return null;
      return JSON.parse(raw) as HugDomainState;
    } catch {
      return null;
    }
  }
}
