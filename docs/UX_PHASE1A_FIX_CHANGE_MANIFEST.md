# 晴雨小岛｜Phase 1A-FIX 独立变更与文件哈希清单 (`UX_PHASE1A_FIX_CHANGE_MANIFEST.md`)

- **执行模式**：`Phase 1A-FIX`
- **正式工作目录**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **参考版本**：GitHub `megakii789-ux/A-LAND` (`f8c7401907b3fe5831c343b995b777254fdfe45d`)
- **修改前可恢复快照**：`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/phase1a_pre_fix_snapshot/`
- **修改前全量 SHA-256 记录**：`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/phase1a_pre_fix_sha256.txt`

---

## 一、Phase 1A-FIX 源码与测试变更清单（含前后 SHA-256）

| 序号 | 所属章节 | 文件路径 | 变更类型 | 修改前 SHA-256 (Phase 1A 结束态) | 修改后 SHA-256 (Phase 1A-FIX 终态) | 变更摘要 |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 二 (P0 预览隔离) | `src/domain/privacy/parentAccess.ts` | 修改 | `0ce2d600ace194ed613234c5248cb79faaf42345fafb09e14fcc3a14a7def703` | `a9d5c40dc784192a7bc079cab2ad190d99fbb33cf35f91a91992a3f2ca925c4e` | 新增 `parentAuthEpoch`、`getParentAuthEpoch()`、`subscribeParentAccessChange()`，并在 `lockParentAccess` / 超时 / `visibilitychange(hidden)` / `pagehide` 时同步失效并通知订阅组件 |
| 2 | 二 & 五.C | `src/components/ParentGateModal.tsx` | 修改 | `b0859110088acd881179ce476d5a212650bad57dd37d11fc86cb2312065e17cf` | `0fdff007498f7b60d02a9b8ac10f37b5eaf0dd2da6dbdb45425bc70696a0aad1` | 新增 `verifyAttemptIdRef` 与 `isOpenRef`，确保异步 PBKDF2 PIN 验证期间关闭窗口或组件卸载时立即作废在途验证并调用 `lockParentAccess()`，绝不触发 `onSuccess` |
| 3 | 二 (P0 预览隔离) | `src/components/InteractiveGames/InteractiveGamesHubModal.tsx` | 修改 | `6e264b4aef4b8744d733fbd2f66ebb1d426e0f549c4b19ce502c12cedce2c5c4` | `a4377208a373476e4517c70a02b035ece9a6af7200f08cb970d2085bb26ba344` | 移除永久保持 `true` 的布尔状态，改为绑定 `(gameId, authEpoch)` 的会话状态；关闭弹窗、切换游戏或家长权限失效时立即退出成人预览并锁定 |
| 4 | 二 (P0 预览隔离) | `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx` | 修改 | `c185ea8dedcae2f2d44b8fb92fcdd76b983d90089c4d5674bbc455355064b8ba` | `9f55dfcf4f1f95f7577761eb0be4bb95bef758f780a34d97317c75ee7cd69783` | 绑定 `(sceneId, authEpoch)` 审阅会话；关闭故事、切换故事或家长权限失效时立即清除预览授权 |
| 5 | 二 (P0 预览隔离) | `src/components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame.tsx` | 修改 | `a1aa33d33c33345b72e1930d4d937668c523915fac7817cd04e493cadd0e8fac` | `4c1bd40214a224d64eebacd1365c7a80addbce6130764bdd464b9fd1d8a8a222` | 独立挂载或受控嵌入时均严格校验 `isParentAccessUnlocked()` 与 `authEpoch`，关闭或权限失效立即退出预览 |
| 6 | 二 (P0 预览隔离) | `src/components/InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame.tsx` | 修改 | `c9d49448d977fc162ce7b816d834845449d5dfbfd12efae9f900352f6c9a42b8` | `43751d93096093094ed7d62e35c5bfdc3cf5aba2166af0bcebc9de69900ddce8` | 独立挂载或受控嵌入时均严格校验 `isParentAccessUnlocked()` 与 `authEpoch`，关闭或权限失效立即退出预览 |
| 7 | 二 (P0 预览隔离) | `src/components/InteractiveGames/ToyBoatNegotiationGame/ToyBoatNegotiationGame.tsx` | 修改 | `0dd463b611d2a7a95b2461d9b78dba4865eb0a09517e7474d419d57bf0acb833` | `a0c8a3dce969453d5263c559c40478a21ef80d53ce7941268a021c882c271420` | 独立挂载或受控嵌入时均严格校验 `isParentAccessUnlocked()` 与 `authEpoch`，关闭或权限失效立即退出预览 |
| 8 | 二 (P0 预览隔离) | `src/components/InteractiveGames/TransferLab/TransferScenariosModal.tsx` | 修改 | `f3d29bb18701f61ceb69a3ebec25a448808b827c23a8041a431e03924abb89c6` | `a7aec0523924b65448be083bee38f21368f981a65c1dc6ad3f0aa712c7be9539` | 绑定 `(scenarioId, authEpoch)` 审阅会话；切换迁移场景、关闭实验室弹窗或家长权限失效时立即退出预览 |
| 9 | 二 (组件级测试) | `src/tests/adultPreviewSessionLeak.test.tsx` | 新增 | `N/A (新增文件)` | `e1419640e5e1ec97bc1d4f3808f5bd5bcbe282f178f315e2253f5f3010967a2c` | 构造真实 React 19 组件级测试，完整验证 Section 二要求的 8 步链路及异步 PIN 关闭取消负向测试 |
| 10 | 三 (TS 修复) | `src/domain/cognitive/ContentAuditRegistry.ts` | 修改 | `6aa723e0104a7733952dcac1087d2eb7365909cf5b29719259a07ec7857c2535` | `fbc825550bdfa597bb140b8ca51b461f8595f484bf0ce6a55e2f07fe11864eb2` | 调整 `hydrateSeedRecord` 中 `...record` 与默认字段顺序，消除 `TS2783`；不改变任何审批逻辑与默认 `PENDING_REVIEW` 状态 |
| 11 | 三 (夹具修复) | `src/tests/contentAuditRegistry.test.ts` | 修改 | `fbbf596fbc3688d00e25b2231c3f8a3a9538c1ffe09e508bb7fee0d374aff4c8` | `6846ea0c7de1080953079dcbaff13eac4f77c862235df392d0b7dd5c7ba0064a` | 适配 AG-R6 真实 15 字段契约与 `contentPayloadOrHash` 双参数签名，消除 `TS2739` / `TS2554`，并在 `afterEach` 恢复原始 `PENDING_REVIEW` 种子 |
| 12 | 五.G (首屏求助) | `src/components/ChildIsland/IslandHome.tsx` | 修改 | `3d394874053b05a3b2d3cd929d1c77eb50d1f00c354bf4ac17ed5d7e002fff96` | `74c8c3b30406266d6da08841a44a68a5ee1bc2015adc227278e1da43a1c979c6` | 将 `<HugSupportEntry />` 移至首屏顶部安全支持区（紧随 `<AlwaysReachableCalmCard />` 下方），确保 `360×800` 与 `390×844` 首屏无需滚动即可触达，且不遮挡平静角与其他按钮 |
| 13 | 五.E (动效实测) | `src/components/common/Interactive3DCard.tsx` | 修改 | `cec08d5e80f729b1212d85f86fbebb0bf0cad013d80f239f94f5e280c7125c01` | `df956bb24bdfc592db8f3b74d71a214be06657f72c2999041fb71efb8e478f5f` | 增加 `data-3d-card="true"` 与 `data-reduced-motion` 属性，供 Playwright 验证降低动效模式下的 JS 交互行为 |
| 14 | 五 (Playwright) | `tests/e2e/viewport-overflow.spec.ts` | 修改 | `72764252e3825f41072b958fe51903c0f7944e25975e833e2b40ac0cc830d4d3` | `1dfe74d2028c386f22b12f1c8e8f92ab87dabd899b441be1c4a9f548b6e7923e` | 新增 Requirement 五.A、五.B、五.C、五.D、五.F、五.G 真实负向与几何命中测试（零条件跳过） |
| 15 | 五 (Playwright) | `tests/e2e/accessibility-reduced-motion.spec.ts` | 修改 | `47681e4f9b87f4eac00686ec8fc5ed616f82789ea34fb7459e86095b218a90a5` | `1fb62b7d30c1a2197f174da701696422829da1e77e25a1e34f212d802c10a4e8` | 强化 Requirement 五.E（验证 computed CSS 动效属性 + 3D 卡片指针抑制 + 平静角打开/关闭 JS 交互，零条件跳过） |
| 16 | 五 (Playwright) | `tests/e2e/dual-tab-lifecycle.spec.ts` | 修改 | `91327cb2307e91ba0503eb2012160571d2000ce3f3b0b2632c3687946dbe9ea1` | `2778b329d1ec7cc337b39470b829ca9ec15d3a37ea91f7477367f2396a323e1f` | 移除全部 `if (await ...)` 条件跳过，强制执行双标签页本地求助、异步想念信及家长 PIN 门禁锁定全链路 |

---

## 二、Phase 1A 已交付且本轮严格冻结未改动的核心文件验证

| 文件路径 | Phase 1A 冻结 SHA-256 | Phase 1A-FIX 后 SHA-256 | 状态 |
| :--- | :--- | :--- | :--- |
| `src/domain/safety/contentAccess.ts` | `096229d75be681eeb53f6e3131c0ccc471da65c757bdb217289054e752ffd451` | `096229d75be681eeb53f6e3131c0ccc471da65c757bdb217289054e752ffd451` | **100% 冻结未变（已纠正基线报告笔误）** |
| `src/components/ChildIsland/CompanionIcons.tsx` | `23133b0ff923f1c3801dd73922626c9347d68e867c0ec5637184ddd3234e1dca` | `23133b0ff923f1c3801dd73922626c9347d68e867c0ec5637184ddd3234e1dca` | **100% 冻结未变** |
| `src/components/ChildIsland/CompanionBanner.tsx` | `d42c96acdf44edd25acb2012c940d10fc1a620c06f7952eaa4929503c5fcd677` | `d42c96acdf44edd25acb2012c940d10fc1a620c06f7952eaa4929503c5fcd677` | **100% 冻结未变** |
| `src/components/ChildIsland/AlwaysReachableCalmCard.tsx` | `a06f56bc4970a5ac7b73f05fb5198c576fcef009fb21a5584daff87b23379d8e` | `a06f56bc4970a5ac7b73f05fb5198c576fcef009fb21a5584daff87b23379d8e` | **100% 冻结未变** |
| `src/components/ChildIsland/StoryGrove/StoryIllustrations.tsx` | `8c41879490e712b04be88739d4a9af349506580082bcdda35467877662122e9a` | `8c41879490e712b04be88739d4a9af349506580082bcdda35467877662122e9a` | **100% 冻结未变** |
| `src/components/Navbar.tsx` | `6ecbdd97f8c1acfc156a89c58643343eb9d3412a2a7f935d3d1e3834bd7c81b1` | `6ecbdd97f8c1acfc156a89c58643343eb9d3412a2a7f935d3d1e3834bd7c81b1` | **100% 冻结未变** |

---

## 三、六视口截图更新后 SHA-256 清单（含首屏无需滚动的现实求助入口）

| 视口名称 | 分辨率 | 截图路径 | Phase 1A (修改前) SHA-256 | Phase 1A-FIX (首屏含求助入口) SHA-256 |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile-360** | `360 × 800` | `tests/screenshots/child-home-mobile-360.png` | `9e934e26fc9ac51b5f8865ee9036e4a9d646fd6514869d00ec99eb40113ce54a` | `9278c851225c6134476b00c93faa306db59b417faf4089be5eb338e8d7b4b3a5` |
| **Mobile-390** | `390 × 844` | `tests/screenshots/child-home-mobile-390.png` | `cb768125aee38acef828ab598c130c7d3460344a36cc3fceabb1b10adda36092` | `9a6b7620bb86d120bd2fc84ce7ac07e8be1fab5ff32205ec9c7385f0fc49047f` |
| **Mobile-430** | `430 × 932` | `tests/screenshots/child-home-mobile-430.png` | `ec026e37d33f0216e15b2fe9a4f21ed4e4b97949a55ae79596b11505d4dde40a` | `134b101070002347f3aae11f7bcdbdf9107cf8ca595ced4e898994cd154d9e5d` |
| **Tablet-768** | `768 × 1024` | `tests/screenshots/child-home-tablet-768.png` | `9b8c3c7bcf56d4c178f735d9d86f570da914f1068f82b5572a95a77694a2bbdd` | `ff1ecf51dabcc0f52f218e917c1763a91e63667233e2132d9a6bc993008a129b` |
| **Tablet-1024** | `1024 × 1366` | `tests/screenshots/child-home-tablet-1024.png` | `c5799279624c8315575b47a5a324ed25f5e24912827780c6fbe3be8018825a39` | `f8ffaefe79d44014c2ac5db3e848a01b8234c8b79ad5394fd247cb2bea808694` |
| **Desktop-1440** | `1440 × 900` | `tests/screenshots/child-home-desktop-1440.png` | `beb8051ec4455265780269720c6b51c9d0acd8f0f3bdda89c669600dc8680dde` | `ec05b237deea991021e7c4e25a40ca889bf3f27730006d7b77bd45b6deda9678` |
