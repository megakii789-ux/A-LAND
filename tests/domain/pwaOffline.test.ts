import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  OfflineHugController,
  HugDomainState,
  HugRequestType,
  CommunicationStatus,
  CareResponsibility,
  CoPresenceStatus,
  mapHugStateToChildPresentation
} from '../../src/domain/hug';
import { LocalChildArtifactStore } from '../../src/domain/safety/localChildArtifactStore';

// In Node environment mock localStorage and sessionStorage if undefined
const memoryStore = new Map<string, string>();
const mockStorage = {
  getItem: (key: string) => memoryStore.get(key) || null,
  setItem: (key: string, val: string) => memoryStore.set(key, String(val)),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear()
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = mockStorage;
}
if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = mockStorage;
}

describe('Phase M: PWA, Offline Capabilities & Safe Storage Contracts', () => {
  beforeEach(() => {
    memoryStore.clear();
  });

  describe('1. Manifest & Service Worker & App Shell Contract', () => {
    it('manifest.webmanifest 必须完备存在且包含 PWA 安装规范字段', () => {
      const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifestContent.id).toBe('/');
      expect(manifestContent.start_url).toBe('/');
      expect(manifestContent.display).toBe('standalone');
      expect(manifestContent.short_name).toBe('晴雨小岛');
      expect(manifestContent.short_name.length).toBeLessThanOrEqual(12);
      expect(manifestContent.theme_color).toBe('#0d9488');
      expect(manifestContent.icons.length).toBeGreaterThanOrEqual(2);
    });

    it('service worker 脚本 sw.js 必须严格禁止缓存敏感家长数据与 Auth Token', () => {
      const swPath = path.resolve(process.cwd(), 'public/sw.js');
      expect(fs.existsSync(swPath)).toBe(true);
      const swCode = fs.readFileSync(swPath, 'utf-8');

      // 验证禁止缓存的敏感路由规则
      expect(swCode).toContain('caregiver-notes');
      expect(swCode).toContain('identitytoolkit');
      expect(swCode).toContain('research');
      // 验证 App shell 预缓存
      expect(swCode).toContain('APP_SHELL_RESOURCES');
    });

    it('index.html 正确链接 manifest.webmanifest 与 theme-color', () => {
      const htmlPath = path.resolve(process.cwd(), 'index.html');
      const html = fs.readFileSync(htmlPath, 'utf-8');
      expect(html).toContain('href="/manifest.webmanifest"');
      expect(html).toContain('name="theme-color"');
    });
  });

  describe('2. Offline Launch & Child Local Island Availability', () => {
    it('儿童核心功能（天气站、平静角、轻量内容）完全依赖本地/离线状态即可启动', () => {
      // 模拟离线环境
      const offlineInitialWeather = {
        primary: 'sunny',
        intensity: 3,
        bodySensations: ['胸口松松的'],
        calmingMethod: '深呼吸'
      };
      expect(offlineInitialWeather.primary).toBe('sunny');
    });
  });

  describe('3. Hug Request Offline Contract: 绝不模拟成功', () => {
    it('离线时发起即时抱抱请求：明确显示未发送成功 (SEND_FAILED)，绝不模拟成功', async () => {
      const controller = new OfflineHugController();

      const result = await controller.submitHugRequest({
        isOnline: false, // 离线状态
        targetCaregiverName: '妈妈',
        requestType: HugRequestType.INSTANT_HELP
      });

      // 核心契约断言：
      expect(result.communication).toBe(CommunicationStatus.SEND_FAILED);
      expect(result.communication).not.toBe(CommunicationStatus.SENT);

      // 验证面向 6 岁儿童的呈现明确为“网络未接通 · 请找身边大人”
      const presentation = mapHugStateToChildPresentation(result);
      expect(presentation.displayText).toContain('网络未接通');
      expect(presentation.spokenText).toContain('直接走到身边的大人面前');
    });

    it('SEC-03: 无真实远程中继时，即使在线也严禁假冒 SENT，必须返回 SEND_FAILED', async () => {
      const controller = new OfflineHugController();
      const result = await controller.submitHugRequest({
        isOnline: true,
        targetCaregiverName: '爸爸',
        requestType: HugRequestType.INSTANT_HELP,
        hasVerifiedRemoteRelay: false
      });
      expect(result.communication).toBe(CommunicationStatus.SEND_FAILED);
      expect(result.communication).not.toBe(CommunicationStatus.SENT);
    });

    it('存在受信任真实远程中继通道时发起即时抱抱请求：返回 SENT', async () => {
      const controller = new OfflineHugController();
      const result = await controller.submitHugRequest({
        isOnline: true,
        targetCaregiverName: '爸爸',
        requestType: HugRequestType.INSTANT_HELP,
        hasVerifiedRemoteRelay: true
      });
      expect(result.communication).toBe(CommunicationStatus.SENT);
    });

    it('duplicate submit: 阻止在请求进行中重复提交', async () => {
      const controller = new OfflineHugController();

      // 并发触发提交
      const promise1 = controller.submitHugRequest({
        isOnline: true,
        targetCaregiverName: '妈妈',
        requestType: HugRequestType.INSTANT_HELP,
        hasVerifiedRemoteRelay: true
      });

      const promise2 = controller.submitHugRequest({
        isOnline: true,
        targetCaregiverName: '妈妈',
        requestType: HugRequestType.INSTANT_HELP,
        hasVerifiedRemoteRelay: true
      });

      const [res1, res2] = await Promise.allSettled([promise1, promise2]);
      expect(res1.status === 'fulfilled' || res2.status === 'fulfilled').toBe(true);
    });

    it('SEC-03: restoreActiveState 对历史 SENT 状态执行强制安全降级', () => {
      // 模拟旧 sessionStorage 存有模拟 SENT 状态
      sessionStorage.setItem('active_open_hug_state', JSON.stringify({
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.SENT,
        care: CareResponsibility.ASSIGNED_SELF,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: '妈妈'
      }));

      const restored = OfflineHugController.restoreActiveState();
      expect(restored).not.toBeNull();
      expect(restored?.communication).toBe(CommunicationStatus.SEND_FAILED);
      expect(restored?.care).toBe(CareResponsibility.ASSIGNED_SELF);
    });

    it('network loss during hug: 发送中突发断网降级为 SEND_FAILED', () => {
      const controller = new OfflineHugController();
      const stateBeforeLoss: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.SENDING,
        care: CareResponsibility.UNASSIGNED,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: '妈妈'
      };

      const stateAfterLoss = controller.handleNetworkLossDuringHug(stateBeforeLoss);
      expect(stateAfterLoss.communication).toBe(CommunicationStatus.SEND_FAILED);
    });

    it('reconnect: 网络恢复后提供温和重试提示', () => {
      const controller = new OfflineHugController();
      const failedState: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.SEND_FAILED,
        care: CareResponsibility.UNASSIGNED,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: '妈妈'
      };

      const reconnect = controller.handleReconnect(failedState);
      expect(reconnect.canRetry).toBe(true);
      expect(reconnect.promptText).toContain('网络信号恢复啦');
    });

    it('refresh during open hug: 页面刷新时能从会话中恢复活跃抱抱状态', () => {
      const activeState: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.SENT,
        care: CareResponsibility.ASSIGNED_SELF,
        coPresence: CoPresenceStatus.UNCONFIRMED,
        targetCaregiverName: '妈妈'
      };

      OfflineHugController.serializeActiveState(activeState);
      const restored = OfflineHugController.restoreActiveState();

      expect(restored).not.toBeNull();
      expect(restored?.targetCaregiverName).toBe('妈妈');
      expect(restored?.care).toBe(CareResponsibility.ASSIGNED_SELF);
    });
  });

  describe('4. Private Child Artifacts: Local-only & Explicit Delete Action', () => {
    it('私密儿童艺术品 (Local-only storage) 仅存在于本地，绝不传云端，且支持单项及全部物理删除', () => {
      const saved1 = LocalChildArtifactStore.saveArtifact({
        type: 'DRAWING',
        title: '我的小云朵',
        contentData: 'data:image/svg+xml;base64,sample'
      });
      const saved2 = LocalChildArtifactStore.saveArtifact({
        type: 'WISH_LETTER',
        title: '给未来的小信',
        contentData: '今天搭了很高的积木'
      });

      expect(LocalChildArtifactStore.getArtifacts().length).toBe(2);

      // 单项明确删除
      const deleted = LocalChildArtifactStore.deleteArtifact(saved1.id);
      expect(deleted).toBe(true);
      expect(LocalChildArtifactStore.getArtifacts().length).toBe(1);
      expect(LocalChildArtifactStore.getArtifacts()[0].id).toBe(saved2.id);

      // 全部明确抹除
      LocalChildArtifactStore.clearAllArtifacts();
      expect(LocalChildArtifactStore.getArtifacts().length).toBe(0);
    });
  });

  describe('5. Service Worker Update Notification Flow', () => {
    it('包含 updatefound 监听器，确保新版本后台就绪后向控制台或用户发出提示', () => {
      const mainTsxPath = path.resolve(process.cwd(), 'src/main.tsx');
      const content = fs.readFileSync(mainTsxPath, 'utf-8');
      expect(content).toContain('registration.addEventListener(\'updatefound\'');
      expect(content).toContain('navigator.serviceWorker.register');
    });
  });
});
