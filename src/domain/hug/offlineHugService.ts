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
  /** 是否存在真实受信的远程推送/中继通道 (SEC-03: 当前环境默认 false) */
  hasVerifiedRemoteRelay?: boolean;
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
      // SEC-03 核心契约：
      // 1. 当前无真实远程通信服务，严禁仅凭 navigator.onLine 或随机 ID 假冒“发送成功”。
      // 2. 只有在明确提供 hasVerifiedRemoteRelay 真实通道且在线时，才允许返回 SENT。
      // 3. 本地无通道时，必须明确返回未向外送达 (SEND_FAILED)，引导孩子直接找身边大人。
      if (!options.isOnline || !options.hasVerifiedRemoteRelay) {
        this.activePendingRequestId = null;
        return {
          requestType: options.requestType,
          communication: CommunicationStatus.SEND_FAILED,
          care: CareResponsibility.UNASSIGNED,
          coPresence: CoPresenceStatus.NOT_PRESENT,
          targetCaregiverName: options.targetCaregiverName
        };
      }

      // 仅在真实可信远程中继通道下允许标记 SENT (供将来接入生产通知服务)
      const requestId = `hug_remote_${Date.now()}`;
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
      const parsed = JSON.parse(raw) as HugDomainState;
      // SEC-03 核心契约：
      // 旧 sessionStorage 中的 SENT、ACKNOWLEDGED 或 ARRIVED_CONFIRMED 等历史模拟状态
      // 绝对不得在刷新后假冒真实送达或真实在场结论！
      // 必须执行确定性安全降级为 SEND_FAILED，绝不向儿童假报“消息已送达 / 大人已确认会来”。
      if (
        parsed.communication === CommunicationStatus.SENT ||
        parsed.communication === CommunicationStatus.ACKNOWLEDGED ||
        parsed.coPresence === CoPresenceStatus.ARRIVED_CONFIRMED
      ) {
        return {
          ...parsed,
          communication: CommunicationStatus.SEND_FAILED,
          coPresence: CoPresenceStatus.NOT_PRESENT
        };
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
