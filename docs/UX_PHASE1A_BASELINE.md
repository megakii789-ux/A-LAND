# Gate 0：源码、安全契约与视觉基线冻结报告 (`UX_PHASE1A_BASELINE.md`)

- **执行对象**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **参考仓库**：`megakii789-ux/A-LAND` (`main` 分支)
- **授权范围**：Gate 0（冻结源码与视觉证据）+ Phase 1A（界面与可访问性修复）
- **最高优先级约束**：`儿童现实安全 > 事实与反馈真实 > 隐私 > 认知契约 > 可操作性 > 美术与动效`

---

## 1. 工程根目录识别与 GitHub `main` HEAD 对比

### 1.1 本地工程根目录
- **实际工程根目录**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **目录特征**：Google Drive FUSE 挂载工作区（初始不含 `.git` 元数据目录与 `node_modules`）。

### 1.2 GitHub 最新 HEAD 与源码字节级比对
- **GitHub 仓库**：`https://github.com/megakii789-ux/A-LAND.git`
- **远端 `main` HEAD Commit**：`f8c7401907b3fe5831c343b995b777254fdfe45d`
- **Commit 标题**：`feat(cognitive): upgrade content audit to AG-R6`
- **全量文件 SHA-256 对照结果**：
  - 远端仓库共 197 个跟踪文件，本地工作区共 197 个源码/资源文件。
  - **196 个核心业务源码、测试与配置文件 100% 字节级一致（SHA-256 完全相同）**。
  - **唯一差异记录**（按 Gate 0 要求显式记录，不静默覆盖）：
    - 远端 GitHub `main` 包含 `.env.example`（本地未包含）；
    - 本地工作区包含 `README.md`（远端未包含）。

---

## 2. 本地可恢复基线快照（独立于正式源码之外）

为遵守「保存可恢复的本地基线，不将快照混入正式源码」，已在工作区外部的会话隔离目录创建完整可恢复快照：

- **源码与配置基线路径**：`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/gate0_baseline/`
- **基线 SHA-256 清单文件**：`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/gate0_baseline_sha256.txt`
- **Gate 0 原始六视口截图备份路径**：`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/gate0_baseline/tests/screenshots/`

---

## 3. 关键文件 Gate 0 初始 SHA-256 记录

### 3.1 安全、内容审核、求助与隐私契约文件（本轮严禁修改，保持 100% 不变）

| 模块分类 | 文件路径 | Gate 0 初始 SHA-256 | Phase 1A / 1A-FIX 后状态 |
| :--- | :--- | :--- | :--- |
| 内容审核门禁 | `src/domain/cognitive/ContentAuditRegistry.ts` | `6aa723e0104a7733952dcac1087d2eb7365909cf5b29719259a07ec7857c2535` | Phase 1A-FIX 仅调整对象字面量展开顺序消除 TS2783（详见 `UX_PHASE1A_FIX_CHANGE_MANIFEST.md`） |
| 内容访问分类 | `src/domain/safety/contentAccess.ts` | `096229d75be681eeb53f6e3131c0ccc471da65c757bdb217289054e752ffd451` | **未修改（0 字节变动，Phase 1A-FIX 已修正原表误填的 CompanionBanner 哈希）** |
| 求助状态机 | `src/domain/hug/hugLifecycleMachine.ts` | `7b476b0aeab5fb83be005fa69f2fbde65ab559a4a124fa4b7137b25f5858732d` | **未修改（0 字节变动）** |
| 求助发送服务 | `src/domain/hug/hugSenderService.ts` | `ef3f1a68fb6a9fb0700404c928489eb66ca91e8bc3e9d3330f3406cb540bf38a` | **未修改（0 字节变动）** |
| 求助文案契约 | `src/domain/hug/hugStatusCopyMapper.ts` | `b73fc862467c46dc70beab1c393212c2f58707d6d5353bddeef87d996815c3ab` | **未修改（0 字节变动）** |
| 隐私最小化契约 | `src/domain/privacy/privacyContract.ts` | `518a7cd00612a99c62e88fb50fa222e4fa8f1a8136319546722c0bc35334b639` | **未修改（0 字节变动）** |
| 家长防误触门禁 | `src/domain/privacy/parentAccess.ts` | `bb211e521efaa1dc903cd7e251903756cd225ee27671f17bd0fc2e61d314b801` | Phase 1A-FIX 新增预览授权会话纪元与事件订阅（详见 `UX_PHASE1A_FIX_CHANGE_MANIFEST.md`） |
| 家长 PIN 弹窗 | `src/components/ParentGateModal.tsx` | `f6eb1d3ee4309d2c28eb77438b8736a9a23db18b16a4e5b27cf64a5b2c2a3a18` | Phase 1A-FIX 新增异步 PIN 验证期间关闭窗口防竞态取消（详见 `UX_PHASE1A_FIX_CHANGE_MANIFEST.md`） |
| 隐私声明弹窗 | `src/components/Privacy/PrivacyDeclarationModal.tsx` | `07e84905992599a98cd36463ff3cc83ff5638f7c4f0a8bd7d5cd0b66f9d130cf` | **未修改（0 字节变动）** |
| Firestore 规则 | `firestore.rules` | `c877c64720266e85373282ab297c79b73cd5df95bb06a3f033827a57cb2d56ab` | **未修改（0 字节变动）** |

### 3.2 Phase 1A 目标 UI 与设计系统文件（修改前基线 SHA-256）

| 任务模块 | 文件路径 | Gate 0 修改前 SHA-256 |
| :--- | :--- | :--- |
| 任务 A / 导航栏 | `src/components/Navbar.tsx` | `c01a32040886fb7f161b66c63689598d8bdca7b5e36460f50234d55c2e28496c` |
| 任务 A / 伙伴横幅 | `src/components/ChildIsland/CompanionBanner.tsx` | `20cd938181f1b73e3ce675b9ce7c9e64bd7cf68db637eb9ab02749573f334a06` |
| 任务 A / 平静常驻卡 | `src/components/ChildIsland/AlwaysReachableCalmCard.tsx` | `c917e6499402581d4ae7f1be259fa4642718bc86c51c51650b608e36fb80c806` |
| 任务 A / 小岛首页 | `src/components/ChildIsland/IslandHome.tsx` | `615be76838d1666fd5c4cb5972d166f778fa57e09760072009e1268ebfb42e48` |
| 任务 A / 地图组件 | `src/components/ChildIsland/FairytaleIslandMap.tsx` | `d1c659d8d3be75d5254d118a33a588a50a9551e1e5a1bd7298643dfcb892eb7d` |
| 任务 A / 音频控制条 | `src/components/ChildIsland/ChildAudioBar.tsx` | `51f577e2c7f99e8be0a11bf14b34be39652390b1ca3bb1f67e4395119b2d3072` |
| 决策 3 / 偏好弹窗 | `src/components/ChildIsland/Personalization/PersonalizationSettingsModal.tsx` | `94c2459d295e6ab9012f7e47cf0ee04492069c841d675b99ec1fa799fb3d4e34` |
| 任务 B / 侦探社弹窗 | `src/components/ChildIsland/ThoughtDetectiveLab/ThoughtDetectiveLabModal.tsx` | `f82f70a435a3017d9a722a1b2fb5dc75c0664fb8ab1b589d52c15d1919c87804` |
| 任务 B / 两家桥弹窗 | `src/components/ChildIsland/TwoHomesBridge/TwoHomesBridgeModal.tsx` | `c509f1147329d3f751cc33cf622a5a05004ec55eb66c7172282a6f75e78c8b68` |
| 任务 B & E / 游戏集 | `src/components/InteractiveGames/InteractiveGamesHubModal.tsx` | `07a6016b1475680f5785ca28bc3c403e4b2d3eb5ec3008941c4ee5a753ef7336` |
| 任务 B / 3D 沙盘 | `src/components/ParentCoach/CognitiveDimension3DArtifact.tsx` | `ab2449788e9c91119197a0d2f07827d7ab76fb1d7d7677996281c5bc5935f1b2` |
| 任务 B / 勋章提示 | `src/components/ChildIsland/Medals/MedalUnlockedToast.tsx` | `0c1a11c3330ca207e78b73f2dd99c4cd32f76874efdf715fb195bf21f7b58980` |
| 任务 C / 故事插画 | `src/components/ChildIsland/StoryGrove/StoryIllustrations.tsx` | `e4083e2b6fa813be44a009be84dfaa3560d846c9e5367d2eb1b4df88450f4b82` |
| 任务 C & E / 故事林 | `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx` | `3ca6dc72fa46704e985ca260bf812d937e72cd0d1bd19fd5e6a47e636bc8f560` |
| 任务 D / 设计 Token | `src/design-system/tokens.ts` | `1d5c0b5be91ca86e51c69c5b2ee5fb0a5bd79bb04cb4df782ff892ee97bd3100` |

### 3.3 Gate 0 初始六视口截图 SHA-256 记录

| 视口规格 | 原始截图路径 | Gate 0 初始 SHA-256 |
| :--- | :--- | :--- |
| `360 × 800` | `tests/screenshots/child-home-mobile-360.png` | `c8502e3a60e0e7477df755d35c1d7e2518426f13054b196ebec8d0681f478791` |
| `390 × 844` | `tests/screenshots/child-home-mobile-390.png` | `018bb6cfab38c2bc09b0d174be2bcffbe91ee7fd220f2459bb9ef66bb22ee83a` |
| `430 × 932` | `tests/screenshots/child-home-mobile-430.png` | `a2ab7f3be48cf55110cb193c4fc607c99d4be7ff4bd519dc5fc41139c4c2fb4b` |
| `768 × 1024` | `tests/screenshots/child-home-tablet-768.png` | `07b09fb7000ee2f2b574896a3925128031d219449144a0ba1507ca397471bb2f` |
| `1024 × 1366` | `tests/screenshots/child-home-tablet-1024.png` | `6ae69128ff4b8681dd70b0f6b97409f4c451ff98fc047ccae85bc36fb2740c70` |
| `1440 × 900` | `tests/screenshots/child-home-desktop-1440.png` | `fa3821c078ff1fd29c76933fb9560be581410b9fc3a55f23414fa87da24cb1c2` |

---

## 4. 任务 D：生产构建 CSS 与设计系统核验基线

在 Gate 0 阶段，针对前期审计报告中提及的疑似无效 Tailwind 类名，通过 `vite build`（`@tailwindcss/vite@4.3.3`）生成生产环境 CSS 包（`dist/assets/index-DkDcYC2E.css`）进行了实证核验：

1. **已验证在 Tailwind v4 中有效生成、严禁误删的类名**：
   - `scale-102` → `.scale-102{scale:102%}`
   - `scale-101` → `.scale-101{scale:101%}`
   - `active:scale-98` → `.active\:scale-98{&:active{scale:98%}}`
   - `sm:w-50` → `.sm\:w-50{@media (width>=40rem){width:calc(var(--spacing)*50)}}`
   - `w-13` / `h-13` → `.w-13{width:calc(var(--spacing)*13)}` / `.h-13{height:calc(var(--spacing)*13)}`
2. **已验证在生产 CSS 中确实缺失、无样式规则输出的类名**：
   - `py-0.2`（出现在 `MedalUnlockedToast.tsx` 与 `InteractiveGamesHubModal.tsx`，已修复为 `py-0.5`）
   - `text-teal-850`（出现在 `AlwaysReachableCalmCard.tsx`，已修复为 `text-teal-900`）
   - `animate-in` / `fade-in` / `zoom-in` / `zoom-in-95`（项目未安装 `tailwindcss-animate` 插件，不产生动画副作用，但不影响布局）
3. **`src/design-system/` 使用核验**：
   - 基线状态下 `src/design-system/tokens.ts`、`ChildButton.tsx`、`ChildCard.tsx` 在 `src/components/` 中处于零引用（0 imports）状态。
   - Phase 1A 中已将 `tokens.ts` 接入 `CompanionBanner.tsx`、`AlwaysReachableCalmCard.tsx` 与 `IslandHome.tsx`，统一 `min-w-[56px] min-h-[56px]` 儿童触控标准与卡片圆角间距规范。

---

## 5. 基线已知既有问题记录（来自上游 Commit `f8c74019`）

在未做任何修改的 Gate 0 基线状态下，运行 `tsc --noEmit` 与 `vitest run` 记录到以下上游既有问题（均位于 `ContentAuditRegistry.ts` 及其单测，受本轮最高优先级约束「不能改变 ContentAuditRegistry 的审批逻辑」保护，本轮保留原样并完整记录）：

1. `src/domain/cognitive/ContentAuditRegistry.ts:652-653`：上游 AG-R6 升级时在对象字面量展开 `...record` 前定义了默认字段 `sceneVersion` 与 `invalidationConditions`，触发 TypeScript `TS2783` 提示。
2. `src/tests/contentAuditRegistry.test.ts`：上游将 `ContentAuditRegistry` 从 AG-R5 升级至 AG-R6（强制要求 15 项字段及 `contentPayloadOrHash` 实时哈希比对），但该单测文件中的 `validIndependentRecord` 测试夹具仍停留在 AG-R5 的 11 项字段，导致该单测文件内 3 个用例失败（其余 25 个测试文件共 252 个用例 100% 通过）。
