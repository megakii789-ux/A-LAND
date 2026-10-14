import { describe, it, expect } from 'vitest';
import {
  OfflineHugController,
  HugRequestType,
  CommunicationStatus,
  CareResponsibility,
  CoPresenceStatus,
  mapHugStateToChildPresentation
} from '../../src/domain/hug';

describe('AG-R5 儿童求助与抱抱真实通信契约测试 (hugContract.test.ts)', () => {
  it('强制反例：即使 isOnline=true 且 hasVerifiedRemoteRelay=true，当前版本因无真实远程中继，仍必须返回 SEND_FAILED', async () => {
    const controller = new OfflineHugController();
    const result = await controller.submitHugRequest({
      requestType: HugRequestType.INSTANT_HELP,
      targetCaregiverName: '身边信任的大人',
      isOnline: true,
      hasVerifiedRemoteRelay: true,
    });

    expect(result.communication).toBe(CommunicationStatus.SEND_FAILED);
    expect(result.communication).not.toBe(CommunicationStatus.SENT);
    expect(result.communication).not.toBe(CommunicationStatus.ACKNOWLEDGED);
    expect(result.care).toBe(CareResponsibility.UNASSIGNED);
    expect(result.coPresence).toBe(CoPresenceStatus.NOT_PRESENT);
  });

  it('handleReconnect 严禁重试承诺，统一 canRetry: false，网络恢复不得生成重试提示', async () => {
    const controller = new OfflineHugController();
    const state = await controller.submitHugRequest({
      requestType: HugRequestType.INSTANT_HELP,
      targetCaregiverName: '身边信任的大人',
      isOnline: true,
      hasVerifiedRemoteRelay: true,
    });

    const reconnectResult = controller.handleReconnect(state);
    expect(reconnectResult.canRetry).toBe(false);
    expect(reconnectResult.promptText).not.toContain('点击重试');
    expect(reconnectResult.promptText).not.toContain('已自动重发');
    expect(reconnectResult.promptText).toContain('身边信任的大人');
  });

  it('三个维度完全独立：发送失败不等于照护责任已确认或真人到场', async () => {
    const controller = new OfflineHugController();
    const state = await controller.submitHugRequest({
      requestType: HugRequestType.ASYNC_MISS,
      targetCaregiverName: '身边信任的大人',
      isOnline: false,
      hasVerifiedRemoteRelay: false,
    });

    expect(state.communication).toBe(CommunicationStatus.SEND_FAILED);
    expect(state.care).toBe(CareResponsibility.UNASSIGNED);
    expect(state.coPresence).toBe(CoPresenceStatus.NOT_PRESENT);
  });

  it('mapHugStateToChildPresentation 仅陈述已知事实，绝不承诺“家长马上来”', () => {
    const presentation = mapHugStateToChildPresentation({
      requestType: HugRequestType.INSTANT_HELP,
      communication: CommunicationStatus.SEND_FAILED,
      care: CareResponsibility.UNASSIGNED,
      coPresence: CoPresenceStatus.NOT_PRESENT,
      targetCaregiverName: '身边信任的大人',
    });

    expect(presentation.displayText).not.toContain('马上来');
    expect(presentation.displayText).not.toContain('已经送达');
    expect(presentation.displayText).toContain('请找身边大人');
    expect(presentation.spokenText).not.toContain('马上来');
    expect(presentation.safeWaitingAction).toContain('大人身边');
    expect(presentation.shouldStepBack).toBe(false);
  });
});
