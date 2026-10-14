# 晴雨小岛｜Phase 1A 独立复审问题发现与定向修复报告 (`UX_PHASE1A_FIX_FINDINGS.md`)

- **执行环境**：Antigravity
- **唯一当前工作目录**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **参考版本**：GitHub `megakii789-ux/A-LAND`，参考基线 `f8c7401907b3fe5831c343b995b777254fdfe45d`
- **执行模式**：`Phase 1A-FIX`（仅定向修复 Phase 1A 遗留问题，严禁提前执行 Phase 1B / Phase 2 / Phase 3 / Phase 4）
- **最高优先级约束**：`儿童现实安全 > 事实与反馈真实 > 隐私 > 认知契约 > 可操作性 > 美术与动效`

---

## 一、冻结已有成果（Section 一核验）

1. **保留全部 Phase 1A 正向成果**：
   - 原创四位动物伙伴（果果、贝贝、天天、奇奇）与场景地标 SVG 组件（[`src/components/ChildIsland/CompanionIcons.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ChildIsland/CompanionIcons.tsx)，SHA-256 `23133b0ff923f1c3801dd73922626c9347d68e867c0ec5637184ddd3234e1dca`，0 字节变动）；
   - 移动端首屏响应式排版（[`src/components/ChildIsland/CompanionBanner.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ChildIsland/CompanionBanner.tsx)，SHA-256 `d42c96acdf44edd25acb2012c940d10fc1a620c06f7952eaa4929503c5fcd677`，0 字节变动）；
   - 平静角常驻大按钮（[`src/components/ChildIsland/AlwaysReachableCalmCard.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ChildIsland/AlwaysReachableCalmCard.tsx)，SHA-256 `a06f56bc4970a5ac7b73f05fb5198c576fcef009fb21a5584daff87b23379d8e`，0 字节变动）；
   - 故事林宽屏插画与热区对齐（[`src/components/ChildIsland/StoryGrove/StoryIllustrations.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ChildIsland/StoryGrove/StoryIllustrations.tsx)，SHA-256 `8c41879490e712b04be88739d4a9af349506580082bcdda35467877662122e9a`，0 字节变动）。
2. **修改前快照与可恢复基线（独立于正式源码之外）**：
   - 快照目录：`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/phase1a_pre_fix_snapshot/`
   - 修改前全量 SHA-256 清单：`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/phase1a_pre_fix_sha256.txt`

---

## 二、逐项问题追踪（源码反例 → 最小修复 → 负向测试 → 实际结果 → 文件哈希 → 残余风险）

### 问题 1（P0）：成人审核预览会话残留与生命周期脱节（Section 二）

1. **源码反例**：
   - [`InteractiveGamesHubModal.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/InteractiveGames/InteractiveGamesHubModal.tsx)：虽然挂载于 `App.tsx` 且通过 `isOpen` 控制显隐，组件从未卸载（unmount）；其内部 `const [isAdultPreviewUnlocked, setIsAdultPreviewUnlocked] = useState(false)` 在成人通过一次 PIN 验证后**永久保持 `true`**。关闭游戏集弹窗再重新打开、切换游戏 Tab、或 `parentAccess.ts` 因超时/页面隐藏失效时，未审游戏仍对儿童直接敞开。
   - [`StoryGroveModal.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx)、[`CrayonDetectiveGame.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame.tsx)、[`FriendAsksHomeGame.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame.tsx)、[`ToyBoatNegotiationGame.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/InteractiveGames/ToyBoatNegotiationGame/ToyBoatNegotiationGame.tsx)、[`TransferScenariosModal.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/InteractiveGames/TransferLab/TransferScenariosModal.tsx)：均使用孤立的布尔值 `useState(false)` 保存预览解锁状态，未绑定 `parentAccess.ts` 的真实有效会话纪元（epoch），也未监听 `lockParentAccess()` / `visibilitychange` / `pagehide` 失效事件。
   - [`ParentGateModal.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ParentGateModal.tsx)：`handleVerifySubmit` 执行异步 PBKDF2 WebCrypto 校验（`await verifyParentPin(pinInput)`）期间，若用户在校验完成前点击关闭按钮或切换关闭弹窗，Promise resolve 后仍会调用 `onSuccess()` 触发授权回调。

2. **最小修复**：
   - 在 [`src/domain/privacy/parentAccess.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/domain/privacy/parentAccess.ts) 中引入单调递增的授权会话纪元 `parentAuthEpoch`、`getParentAuthEpoch()` 与 `subscribeParentAccessChange(listener)`，并在 `unlockParentAccess`、`lockParentAccess`、5 分钟超时失效以及浏览器 `visibilitychange (hidden)` / `pagehide` 时同步递增/清零纪元并广播通知。
   - 在 [`src/components/ParentGateModal.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ParentGateModal.tsx) 中引入 `verifyAttemptIdRef` 与 `isOpenRef`：当弹窗关闭、`isOpen` 变为 `false` 或组件卸载时，立即递增 `verifyAttemptIdRef.current`，确保任何在途异步 PIN 校验完成后不会触发 `onSuccess()`，并调用 `lockParentAccess()` 回收未消费的解锁状态。
   - 在 [`InteractiveGamesHubModal.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/InteractiveGames/InteractiveGamesHubModal.tsx)、[`StoryGroveModal.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx)、[`CrayonDetectiveGame.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame.tsx)、[`FriendAsksHomeGame.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame.tsx)、[`ToyBoatNegotiationGame.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/InteractiveGames/ToyBoatNegotiationGame/ToyBoatNegotiationGame.tsx)、[`TransferScenariosModal.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/InteractiveGames/TransferLab/TransferScenariosModal.tsx) 中，将布尔状态替换为绑定具体 `(targetId, authEpoch)` 的审阅会话记录，通过 `isParentAccessUnlocked() && getParentAuthEpoch() === previewSession.authEpoch` 动态派生当前预览权限，并在关闭弹窗、切换游戏、关闭故事、退出预览或 `subscribeParentAccessChange` 失效时立即清零会话并调用 `lockParentAccess()`。

3. **负向测试**：
   - 新增真实 React 组件级测试 [`src/tests/adultPreviewSessionLeak.test.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/tests/adultPreviewSessionLeak.test.tsx)（覆盖完整 8 步链路：打开未审游戏 → 本机 PIN 验证 → 进入成人预览 → 关闭弹窗 → 重新打开弹窗确认阻断 → `lockParentAccess()` / `visibilitychange` 立即退出已开启预览 → 切换游戏/关闭故事/返回儿童模式不继承授权 + 异步 PIN 验证期间关闭窗口不触发授权回调）。
   - 新增 Playwright 六视口真实浏览器负向 E2E 测试（[`tests/e2e/viewport-overflow.spec.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/tests/e2e/viewport-overflow.spec.ts) 中的 `Requirement 五.A, 五.B, 五.C`）。

4. **实际结果**：
   - `vitest run` 中 `src/tests/adultPreviewSessionLeak.test.tsx`（3 大组件级测试套件）100% 通过；
   - `playwright test` 中 6 个视口下的 `Requirement 五.A, 五.B, 五.C` 100% 通过；
   - 所有正式注册表内容保持 `PENDING_REVIEW`，未将任何内容篡改为 `PASSED`。

5. **文件哈希（修改前 → 修改后 SHA-256）**：
   - `src/domain/privacy/parentAccess.ts`: `0ce2d600ace194ed613234c5248cb79faaf42345fafb09e14fcc3a14a7def703` → `a9d5c40dc784192a7bc079cab2ad190d99fbb33cf35f91a91992a3f2ca925c4e`
   - `src/components/ParentGateModal.tsx`: `b0859110088acd881179ce476d5a212650bad57dd37d11fc86cb2312065e17cf` → `0fdff007498f7b60d02a9b8ac10f37b5eaf0dd2da6dbdb45425bc70696a0aad1`
   - `src/components/InteractiveGames/InteractiveGamesHubModal.tsx`: `6e264b4aef4b8744d733fbd2f66ebb1d426e0f549c4b19ce502c12cedce2c5c4` → `a4377208a373476e4517c70a02b035ece9a6af7200f08cb970d2085bb26ba344`
   - `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx`: `c185ea8dedcae2f2d44b8fb92fcdd76b983d90089c4d5674bbc455355064b8ba` → `9f55dfcf4f1f95f7577761eb0be4bb95bef758f780a34d97317c75ee7cd69783`
   - `src/components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame.tsx`: `a1aa33d33c33345b72e1930d4d937668c523915fac7817cd04e493cadd0e8fac` → `4c1bd40214a224d64eebacd1365c7a80addbce6130764bdd464b9fd1d8a8a222`
   - `src/components/InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame.tsx`: `c9d49448d977fc162ce7b816d834845449d5dfbfd12efae9f900352f6c9a42b8` → `43751d93096093094ed7d62e35c5bfdc3cf5aba2166af0bcebc9de69900ddce8`
   - `src/components/InteractiveGames/ToyBoatNegotiationGame/ToyBoatNegotiationGame.tsx`: `0dd463b611d2a7a95b2461d9b78dba4865eb0a09517e7474d419d57bf0acb833` → `a0c8a3dce969453d5263c559c40478a21ef80d53ce7941268a021c882c271420`
   - `src/components/InteractiveGames/TransferLab/TransferScenariosModal.tsx`: `f3d29bb18701f61ceb69a3ebec25a448808b827c23a8041a431e03924abb89c6` → `a7aec0523924b65448be083bee38f21368f981a65c1dc6ad3f0aa712c7be9539`
   - `src/tests/adultPreviewSessionLeak.test.tsx` (新增): `e1419640e5e1ec97bc1d4f3808f5bd5bcbe282f178f315e2253f5f3010967a2c`

6. **残余风险**：
   - 本机 PIN 门禁（PBKDF2-SHA256 本地哈希）仅作为防止儿童误入成人审阅预览或家长工作台的本机防误触屏障，**不能代替真实外部独立专家（儿童发展心理学 + 儿童伦理法务）的内容审核签署**；正式内容开放仍须在独立专家完成评审并更新 `ContentAuditRegistry` 载荷签名后方可生效。

---

### 问题 2：上游 TypeScript 编译错误（TS2783、TS2739、TS2554）与陈旧测试夹具（Section 三）

1. **源码反例**：
   - [`src/domain/cognitive/ContentAuditRegistry.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/domain/cognitive/ContentAuditRegistry.ts) 第 651–654 行：`hydrateSeedRecord` 中先声明了 `sceneVersion: record.sceneVersion || '1.0.0'` 与 `invalidationConditions: ...`，随后又执行 `...record` 展开，导致 TypeScript 报错 `TS2783: 'sceneVersion' is specified more than once, so this usage will be overwritten`。
   - [`src/tests/contentAuditRegistry.test.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/tests/contentAuditRegistry.test.ts)：上游 commit `f8c74019` 将 `ContentAuditRegistry` 升级为 AG-R6（强制校验 15 个字段、独立外部专家双重背书、以及 `registerAuditRecord(record, contentPayloadOrHash)` 双参数签名），但该测试文件仍使用旧版 AG-R5 的 11 字段夹具和单参数调用，触发 `TS2739`、`TS2554` 及 3 个单测断言失败。

2. **最小修复**：
   - 在 [`src/domain/cognitive/ContentAuditRegistry.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/domain/cognitive/ContentAuditRegistry.ts) 的 `hydrateSeedRecord` 中，将 `...record` 置于对象字面量首位，再对 `sceneVersion` 与 `invalidationConditions` 做 fallback 赋值，零逻辑变更消除 `TS2783`。
   - 在 [`src/tests/contentAuditRegistry.test.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/tests/contentAuditRegistry.test.ts) 中，将测试夹具 `validIndependentRecord` 升级为符合 AG-R6 真实契约的完整结构（使用 `MOCK-EXT-DEV-TEST` 仅在单测生命周期内验证 `registerAuditRecord` 门禁逻辑），向 `registerAuditRecord` 传入匹配的 `contentPayloadOrHash`，并在 `afterEach` 中将注册表恢复为原始 `PENDING_REVIEW` 种子记录，绝不污染生产注册表。

3. **负向测试**：
   - 在 `src/tests/contentAuditRegistry.test.ts` 中验证：默认生产注册表全部 17 项内容 100% 处于 `PENDING_REVIEW` 阻断状态；缺少任一 AG-R6 必填字段、内部开发者自审、哈希不匹配、缺少反诱导/家庭中立检查或被标记为 `invalidated: true` 时，`isContentApproved()` 严格返回 `false`。

4. **实际结果**：
   - `../node_modules/.bin/tsc --noEmit` 全项目退出码为 **`0`**（0 错误）；
   - `../node_modules/.bin/vitest run` 全量 28 个测试文件（264 个测试用例）退出码为 **`0`**。

5. **文件哈希（修改前 → 修改后 SHA-256）**：
   - `src/domain/cognitive/ContentAuditRegistry.ts`: `6aa723e0104a7733952dcac1087d2eb7365909cf5b29719259a07ec7857c2535` → `fbc825550bdfa597bb140b8ca51b461f8595f484bf0ce6a55e2f07fe11864eb2`
   - `src/tests/contentAuditRegistry.test.ts`: `fbbf596fbc3688d00e25b2231c3f8a3a9538c1ffe09e508bb7fee0d374aff4c8` → `6846ea0c7de1080953079dcbaff13eac4f77c862235df392d0b7dd5c7ba0064a`

6. **残余风险**：
   - 生产环境中全部 17 项核心认知内容仍严格保持 `PENDING_REVIEW`，在真实外部专家完成签署前，儿童正式模式不会放行未审内容。

---

### 问题 3：工具链版本记录与 `contentAccess.ts` 哈希证据矛盾（Section 四）

1. **源码反例**：
   - `package.json` 声明 `"vite": "^8.3.0"`，但首轮报告 `docs/UX_PHASE1A_TEST_EVIDENCE.md` 中混入了另一个临时目录中旧版 `vite v6.4.1` 的构建输出。
   - `docs/UX_PHASE1A_BASELINE.md` 第 46 行将 `src/domain/safety/contentAccess.ts` 的 SHA-256 误记为 `20cd938181f1b73e3ce675b9ce7c9e64bd7cf68db637eb9ab02749573f334a06`（实为 `CompanionBanner.tsx` 的 Gate 0 初始哈希）。

2. **最小修复**：
   - 在 `/tmp/qingyu_deps` 统一工具链环境中核验并固定版本：`node v20.20.2`、`npm 10.8.2`、`vite@8.3.4`、`typescript@7.0.2`、`vitest@5.0.4`、`@playwright/test@1.64.0`，并在该单一环境中重新执行全部构建、类型检查、单测与 E2E 测试。
   - 重新计算并修正 [`docs/UX_PHASE1A_BASELINE.md`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/docs/UX_PHASE1A_BASELINE.md) 中 `src/domain/safety/contentAccess.ts` 的真实 SHA-256 为 `096229d75be681eeb53f6e3131c0ccc471da65c757bdb217289054e752ffd451`，同步更新 [`docs/UX_PHASE1A_TEST_EVIDENCE.md`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/docs/UX_PHASE1A_TEST_EVIDENCE.md)。

3. **负向测试**：
   - 对比 `scratch/gate0_baseline/src/domain/safety/contentAccess.ts`、正式工作目录 `src/domain/safety/contentAccess.ts` 与测试副本 `/tmp/qingyu_deps/work/src/domain/safety/contentAccess.ts` 的 SHA-256，三者严格等于 `096229d75be681eeb53f6e3131c0ccc471da65c757bdb217289054e752ffd451`（0 字节改动）。

4. **实际结果**：
   - 工具链版本、构建产物与测试报告 100% 来自同一 `vite@8.3.4` 环境，无跨版本混用；`contentAccess.ts` 哈希记录已完全对齐。

5. **文件哈希（修改前 → 修改后 SHA-256）**：
   - `src/domain/safety/contentAccess.ts`: `096229d75be681eeb53f6e3131c0ccc471da65c757bdb217289054e752ffd451`（**未修改，0 字节变动**）
   - `docs/UX_PHASE1A_BASELINE.md`: `e35846c71c71e97889077f3ea5a29b7a4ad98f2c5f272b18e9ea282298d5e84b` → 已更新修正
   - `docs/UX_PHASE1A_TEST_EVIDENCE.md`: `55b6ad3ed546443dd719b34785bd31b3d774ad6f6884d2592dea8bacfe7baeed` → 已更新修正

6. **残余风险**：
   - 由于正式工作目录挂载在 Google Drive FUSE 文件系统上（不支持创建 `node_modules/.bin` 符号链接），依赖安装在 `/tmp/qingyu_deps/node_modules`，每次执行测试前均须执行 `rsync` 与全量文件 SHA-256 校验（已在 Section 六固化为强制流程）。

---

### 问题 4：360px / 390px 手机首屏现实求助入口需滚动寻找 & Playwright 负向与行为级断言强化（Section 五 A–H）

1. **源码反例**：
   - [`src/components/ChildIsland/IslandHome.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ChildIsland/IslandHome.tsx)：在 Phase 1A 中，`<HugSupportEntry />`（“找大人抱抱”）被放置在页面最底部的 `<footer>`（位于地图/卡片列表与全部附加工具入口下方），在 `360×800` 与 `390×844` 手机视口首屏（`scrollY === 0`）下处于视口底部之外（`y > 844px`），儿童需要向下滚动页面才能找到现实求助入口。
   - [`src/components/common/Interactive3DCard.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/common/Interactive3DCard.tsx)：缺少稳定可测的 DOM 属性（`data-3d-card` / `data-reduced-motion`）以供 E2E 自动化验证降低动效模式下的 JavaScript 指针视差抑制行为。
   - Playwright 测试套件（`viewport-overflow.spec.ts`、`accessibility-reduced-motion.spec.ts`、`dual-tab-lifecycle.spec.ts`）：缺少针对成人预览重开残留（五.A）、错误 PIN 拦截（五.B）、异步 PIN 期间关闭取消（五.C）、首屏无需滚动求助入口与零遮挡（五.G）的端到端断言，且 `accessibility-reduced-motion.spec.ts` 与 `dual-tab-lifecycle.spec.ts` 中存在多处 `if (await ...)` 条件分支。

2. **最小修复**：
   - 在 [`src/components/ChildIsland/IslandHome.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ChildIsland/IslandHome.tsx) 中，将 `<HugSupportEntry />` 上移至首屏顶部常驻安全支持区（紧随 `<AlwaysReachableCalmCard />` 下方、同一独立文档流区块内），使其在 `360×800`、`390×844` 等全部 6 个视口的首屏（`scrollY === 0`）均无需滚动即可直接看见并点击，且与顶部 `Navbar`、`<AlwaysReachableCalmCard />` 及 `<CompanionBanner />` 保持清晰的垂直间距，零重叠、零遮挡。
   - 在 [`src/components/common/Interactive3DCard.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/common/Interactive3DCard.tsx) 中添加 `data-3d-card="true"` 与 `data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}`。
   - 重构并强化 [`tests/e2e/viewport-overflow.spec.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/tests/e2e/viewport-overflow.spec.ts)、[`tests/e2e/accessibility-reduced-motion.spec.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/tests/e2e/accessibility-reduced-motion.spec.ts)、[`tests/e2e/dual-tab-lifecycle.spec.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/tests/e2e/dual-tab-lifecycle.spec.ts)，完整实现 Section 五 A–H 全部负向与实测断言，**彻底清零条件跳过（0 `if` 跳过、0 `test.skip`）**。

3. **负向测试**：
   - **五.A**：成人预览解锁后关闭弹窗再重新打开，断言 `interactive-game-audit-gate-blocked` 可见、预览横幅数量为 `0`；
   - **五.B**：输入错误 PIN `999999`，断言显示错误提示、未审游戏保持阻断；
   - **五.C**：输入正确 PIN `246810` 并在同一事件循环内触发 `submit` 与关闭按钮，等待异步 PBKDF2 完成后断言预览绝不解锁；
   - **五.D**：6 视口下全部首屏关键儿童按钮（去呼吸、去拆解、找大人抱抱、听问候、换伙伴、卡片语音按钮）断言 `width >= 56 && height >= 56`、处于屏幕水平边界内，且通过 `btn.click({ trial: true })` 真实命中检测；
   - **五.E**：开启 `emulateMedia({ reducedMotion: 'reduce' })`，断言 `window.getComputedStyle` 的 `transitionDuration <= 0.001s`、`animationName === 'none'`，鼠标移动不产生 3D `style.transform` 倾斜，且点击打开/关闭平静角呼吸练习交互正常；
   - **五.F**：真实点击求助入口与“在屏幕上开启找大人提醒”，断言儿童可见文案包含“这里不会发消息 · 网络未接通”、“无法发送至远程，请寻找身边的信任成年人”、“直接走到身边的大人面前”，绝不包含“提醒已远程送达/家长已收到通知/正在赶来”，且监听网络请求确认远程请求数为 `0`；
   - **五.G**：在 `360×800` 和 `390×844` 首屏（`window.scrollY === 0`）断言“找大人抱抱”按钮完整位于首屏视口内（`hugBox.y + hugBox.height <= vh`），且与 `Navbar`、`AlwaysReachableCalmCard`、`CompanionBanner` 包围盒零交集；
   - **五.H**：全量执行 6 视口 × 3 个 E2E 规范文件（共 78 个测试用例）。

4. **实际结果**：
   - `../node_modules/.bin/playwright test` 在 6 个视口下 **78/78 全部通过（退出码 `0`）**，并重新生成了包含首屏现实求助入口的 6 视口真实截图。

5. **文件哈希（修改前 → 修改后 SHA-256）**：
   - `src/components/ChildIsland/IslandHome.tsx`: `3d394874053b05a3b2d3cd929d1c77eb50d1f00c354bf4ac17ed5d7e002fff96` → `74c8c3b30406266d6da08841a44a68a5ee1bc2015adc227278e1da43a1c979c6`
   - `src/components/common/Interactive3DCard.tsx`: `cec08d5e80f729b1212d85f86fbebb0bf0cad013d80f239f94f5e280c7125c01` → `df956bb24bdfc592db8f3b74d71a214be06657f72c2999041fb71efb8e478f5f`
   - `tests/e2e/viewport-overflow.spec.ts`: `72764252e3825f41072b958fe51903c0f7944e25975e833e2b40ac0cc830d4d3` → `1dfe74d2028c386f22b12f1c8e8f92ab87dabd899b441be1c4a9f548b6e7923e`
   - `tests/e2e/accessibility-reduced-motion.spec.ts`: `47681e4f9b87f4eac00686ec8fc5ed616f82789ea34fb7459e86095b218a90a5` → `1fb62b7d30c1a2197f174da701696422829da1e77e25a1e34f212d802c10a4e8`
   - `tests/e2e/dual-tab-lifecycle.spec.ts`: `91327cb2307e91ba0503eb2012160571d2000ce3f3b0b2632c3687946dbe9ea1` → `2778b329d1ec7cc337b39470b829ca9ec15d3a37ea91f7477367f2396a323e1f`

6. **残余风险**：
   - 当前应用无已验证的远程实时推送通道，因此求助入口必须且已经如实告知儿童“这里不会发消息 · 请寻找身边的信任成年人”，绝不制造虚假的远程送达预期。
