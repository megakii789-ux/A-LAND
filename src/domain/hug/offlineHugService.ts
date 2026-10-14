/**
 * Offline & Real Communication Hug Service (SEC-03 & AG-R3 R3-02)
 *
 * R3-02 Iron Rules:
 * - Current build has NO remote relay (REMOTE_RELAY_CONFIGURED = false):
 *   1. Never display "已送达" or "大人已收到";
 *   2. Never call local state changes remote notifications;
 *   3. Never claim unpersisted miss notes are "已经保存";
 *   4. Never prompt the user that network recovery alone allows resending (`canRetry: false`);
 *   5. Never allow callable simulation parameters (such as `hasVerifiedRemoteRelay: true`) to fake remote success (`SENT`).
 */

import {
  HugDomainState,
  HugRequestType,
  CommunicationStatus,
  CareResponsibility,
  CoPresenceStatus,
  LocalHugSupportMode,
  LocalHugSupportRecord,
} from './types';

export interface HugSubmitOptions {
  isOnline: boolean;
  targetCaregiverName: string;
  requestType: HugRequestType;
  /**
   * R3-02: Callable simulation flags are strictly ignored in runtime because no real remote relay exists.
   * Kept in type signature only so negative tests can verify that passing `true` STILL fails closed to `SEND_FAILED`.
   */
  hasVerifiedRemoteRelay?: boolean;
}

const ACTIVE_HUG_SESSION_KEY = 'active_open_hug_state';

/**
 * R3-02: Hard constant indicating that this local-only build has NO remote push/relay infrastructure.
 * Callers cannot override this via parameters.
 */
const REAL_REMOTE_RELAY_INFRASTRUCTURE_AVAILABLE = false;

export class OfflineHugController {
  private isSubmitting = false;

  /**
   * 发起抱抱请求：
   * AG-R5: 当前版本没有远程中继，无论传入什么模拟参数 (如 isOnline: true / hasVerifiedRemoteRelay: true)，
   * 都不能返回 SENT 或 ACKNOWLEDGED。必须诚实返回 CommunicationStatus.SEND_FAILED。
   */
  async submitHugRequest(options: HugSubmitOptions): Promise<HugDomainState> {
    if (this.isSubmitting) {
      throw new Error('DUPLICATE_SUBMIT_BLOCKED: Request is already in progress');
    }

    this.isSubmitting = true;
    try {
      const failedState: HugDomainState = {
        requestType: options.requestType,
        communication: CommunicationStatus.SEND_FAILED,
        care: CareResponsibility.UNASSIGNED,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: options.targetCaregiverName
      };
      OfflineHugController.serializeActiveState(failedState);
      return failedState;
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * 发送中途断网处理：
   * 若在 SENDING 途中失去网络连接，立即将状态降级为 SEND_FAILED，绝不悬挂或假装已发。
   */
  handleNetworkLossDuringHug(currentState: HugDomainState): HugDomainState {
    if (
      currentState.communication === CommunicationStatus.SENDING ||
      currentState.communication === CommunicationStatus.UNSENT ||
      currentState.communication === CommunicationStatus.SENT
    ) {
      const updated: HugDomainState = {
        ...currentState,
        communication: CommunicationStatus.SEND_FAILED
      };
      OfflineHugController.serializeActiveState(updated);
      return updated;
    }
    return currentState;
  }

  /**
   * 网络重新连接检测：
   * AG-R5: 删除 handleReconnect() 中的错误重试承诺，统一 canRetry: false。
   * 网络恢复不得生成重试提示，诚实引导找身边大人。
   */
  handleReconnect(_currentState: HugDomainState): {
    canRetry: boolean;
    promptText: string;
  } {
    return {
      canRetry: false,
      promptText: '网络已恢复连接。本机运行模式下不会向远端发信，请直接找身边信任的大人。'
    };
  }

  static serializeActiveState(state: HugDomainState | null): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        if (state) {
          sessionStorage.setItem(ACTIVE_HUG_SESSION_KEY, JSON.stringify(state));
        } else {
          sessionStorage.removeItem(ACTIVE_HUG_SESSION_KEY);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * 恢复可能存在的历史状态，并强制将任何历史遗留的模拟 SENT / ACKNOWLEDGED 状态降级为 SEND_FAILED，
   * 防止刷新后继续展示虚假的“已送达/大人已收到”提示。
   */
  static restoreActiveState(): HugDomainState | null {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const raw = sessionStorage.getItem(ACTIVE_HUG_SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as HugDomainState;
          if (
            parsed.communication === CommunicationStatus.SENT ||
            parsed.communication === CommunicationStatus.ACKNOWLEDGED ||
            parsed.communication === CommunicationStatus.SENDING
          ) {
            const downgraded: HugDomainState = {
              ...parsed,
              communication: CommunicationStatus.SEND_FAILED
            };
            sessionStorage.setItem(ACTIVE_HUG_SESSION_KEY, JSON.stringify(downgraded));
            return downgraded;
          }
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }

  static clearActiveState(): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(ACTIVE_HUG_SESSION_KEY);
      }
    } catch {
      // Ignore
    }
  }
}

export function getLocalHugCapabilities() {
  return {
    hasRemoteRelay: false,
    canSendRemoteNotification: false,
    canGuaranteeAdultArrival: false,
    supportsNearbyAdultGuidance: true,
    supportsSessionMissNote: true,
  } as const;
}

export function createLocalHugRecord(params: {
  mode: LocalHugSupportMode;
  targetLabel: '身边的大人' | '爸爸' | '妈妈';
  noteText?: string;
  isSavedToLocalStorage?: boolean;
}): LocalHugSupportRecord {
  return {
    id: `local-hug-${Date.now()}`,
    mode: params.mode,
    targetLabel: params.targetLabel,
    noteText: params.noteText?.trim() ? params.noteText.trim().slice(0, 160) : undefined,
    persistenceStatus: params.isSavedToLocalStorage
      ? 'LOCAL_STORAGE_SAVED'
      : 'SESSION_MEMORY_ONLY',
    createdAtIso: new Date().toISOString(),
  };
}
