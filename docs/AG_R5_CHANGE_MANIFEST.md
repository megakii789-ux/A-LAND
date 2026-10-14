# AG-R5 修复文件清单与行为变更对照表 (CHANGE MANIFEST)

**基线提交：** `438f688023f7a42a47ef4e93d610e9565a0ef1b4`  
**生成时间：** 2026-10-14  
**审查环境：** Node.js 20+ / TypeScript 5.8+ / Vite 8.3+

---

## 1. 修改与新增文件清单与 SHA-256 校验和

| 文件路径 | 状态 | SHA-256 校验和 |
|---|---|---|
| `src/domain/cognitive/ContentAuditRegistry.ts` | 修改 | `01c4841886317f094e4a99b67eed60aed7ce31505e080a1c1a5fc5acd6b65746` |
| `src/domain/cognitive/cognitiveValidator.ts` | 修改 | `fe45b24217bd9a2cb12bd8de56ee7981e9c1bbe8703a5ce7abb29fcfd5de08ef` |
| `src/domain/cognitive/sha256.ts` | 新增 | `d9bc6058201599789ad3b0685dca6c36dae2f9dd6aab94809790e8b82f123c2c` |
| `src/domain/hug/offlineHugService.ts` | 修改 | `84c845226f89c99dd1086846ba36b3a1a3155515549e403bbda30966be952edf` |
| `src/components/ChildIsland/HugSupportEntry.tsx` | 修改 | `52c1ac5a8641e7a55dfeb0a85a29d66970846d84e08a60ad428282133946f1f7` |
| `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx` | 修改 | `0bcb03ff1e6ffe3ceda81dabe2bebc322d8a717e0672ec4f1ec37690bc5dc7df` |
| `src/components/InteractiveGames/InteractiveGamesHubModal.tsx` | 修改 | `9edd66d8842aa79154052e6dd257bed47f069882c94e7c56401e418ccfdb3e56` |
| `src/components/ParentGateModal.tsx` | 修改 | `b0859110088acd881179ce476d5a212650bad57dd37d11fc86cb2312065e17cf` |
| `src/domain/safety/contentAccess.ts` | 修改 | `096229d75be681eeb53f6e3131c0ccc471da65c757bdb217289054e752ffd451` |
| `src/domain/personalization/constants.ts` | 修改 | `2411daba2de0839a794c64f7e2c769dd4570f3925678a855ca050f040a0618bc` |
| `src/domain/personalization/profileStore.ts` | 修改 | `b2acb197e90bcaaa9f5da22a87d687ef28210dd2716fe8667a55ae0200a30ca6` |
| `src/services/weeklyReportService.ts` | 修改 | `f04085e0a2086985d3d1e2a4270094b2d76d3ca871781891e744494e0dd6f431` |
| `public/pwa-icon-192.png` | 新增 | `cc7646af91f11e59d7438557ddaae4790a40d00c06abfe0a2774e2b5fcfa99bc` |
| `public/pwa-icon-512.png` | 新增 | `6b6aea74ce5537f98390475f13a74b263c0387d3d5b37ba0a2d4c941c870210c` |
| `public/pwa-icon-maskable-512.png` | 新增 | `6b6aea74ce5537f98390475f13a74b263c0387d3d5b37ba0a2d4c941c870210c` |
| `tests/domain/hugContract.test.ts` | 新增 | `359528b17d95d916d487344f9d9da97a50fe00e7f10149ee56d50cbc2a445207` |
| `tests/domain/weeklyReportService.test.ts` | 新增 | `92271ef184425a52045c46a8af8c5c53e92592751c239b611d511de36acadcf6` |
| `tests/domain/backendAuthData.test.ts` | 修改 | `de83f2d405a03ff9612b3f96f6fd49eb50b84696b560baa2344a3d899db18866` |
| `tests/domain/pwaOffline.test.ts` | 修改 | `decfab711831a4db96446b9720a37b837abb34335cc314adb646522e19f84cd8` |
| `src/tests/contentAuditRegistry.test.ts` | 修改 | `fbbf596fbc3688d00e25b2231c3f8a3a9538c1ffe09e508bb7fee0d374aff4c8` |
| `tests/domain/personalizationEngine.test.ts` | 修改 | `b72e08a6a0723657994499ca3b27e4dc9e4e0072906fd211031ef0b48836196e` |
| `tests/e2e/viewport-overflow.spec.ts` | 修改 | `01463b6d803712c17d890a844f4bb0992d7b6a840c0e13813e42677784397688` |

---

## 2. 逐项修改代码与行为对照

### 2.1 任务一：彻底关闭内容审核旁路
- **修改文件：**
  - `src/domain/cognitive/ContentAuditRegistry.ts`
  - `src/domain/cognitive/cognitiveValidator.ts`
  - `src/domain/cognitive/sha256.ts`
  - `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx`
  - `src/components/InteractiveGames/InteractiveGamesHubModal.tsx`
- **行为变更：**
  - 清空所有虚假的默认 `PASSED` 审核状态，全部重置为 `PENDING`。
  - 在 `isContentAuditValid()` 与 `canRenderContent()` 中增加强哈希校验与版本约束。
  - `validateUnifiedScene()` 在未审、待审或哈希不匹配时强制 `canEnterChildRuntime: false`。
  - 阻断虚假签名（包括“自审”、“免审”、“AI审核”、“专家委员会”等）。
  - `StoryGroveModal` 与 `InteractiveGamesHubModal` 增加未审拦截页，儿童无法直接进入未审情境，仅限成人解锁后隔离预览。

### 2.2 任务二：儿童求助通信契约校正
- **修改文件：**
  - `src/domain/hug/offlineHugService.ts`
  - `src/components/ChildIsland/HugSupportEntry.tsx`
  - `src/components/ParentCoach/CaregiverHugInbox.tsx`
- **行为变更：**
  - 无论输入何种在线或模拟中继参数，`submitHugRequest` 恒定返回 `SEND_FAILED`。
  - `handleReconnect` 设置 `canRetry: false`，彻底删除误导儿童重发的提示。
  - `HugSupportEntry` 文案修正为客观的“记录求助表达”与“整理想念卡片”。
  - 目标照护者默认选择“身边信任的大人”。
  - `CaregiverHugInbox` 真实模式下默认空收件箱，仅允许在明确隔离的 Demo 模式查看 3 条示例。

### 2.3 任务三：数据许可与彻底清除
- **修改文件：**
  - `src/domain/personalization/constants.ts`
  - `src/domain/personalization/profileStore.ts`
  - `src/context/AppContext.tsx`
- **行为变更：**
  - `DEFAULT_PERSONALIZATION_PROFILE.consentForLocalStorage` 默认值设为 `false`。
  - `resetPersonalizationProfile()` 严格继承当前用户授予或撤回的许可状态，不篡改 localStorage 许可。
  - `clearAllData()` 清除所有相关存储键，确保在重置后许可仍为 `false`。

### 2.4 任务四：其余 P1 隐患修复
- **修改文件：**
  - `src/components/ParentGateModal.tsx`：引入 `generationTicketRef` 计数器，异步哈希完成若 Ticket 失效直接丢弃，关闭 Modal 不再触发 `onSuccess`。
  - `src/domain/safety/contentAccess.ts`：修复边界逻辑，确保 `Boundary.PHYSICAL_SAFETY` 与非 `NONE` 场景必须触发成人陪同。
  - `src/services/weeklyReportService.ts`：报告口径统一更名为“本机累计活动记录”，杜绝时间跨度与累计计数混用。
  - `tests/e2e/viewport-overflow.spec.ts`：修复动态伙伴名称选择器脆弱性。
  - `public/pwa-icon-*.png`：补齐 Manifest 规范标准的 192/512 RGBA PNG 真实图标文件。
