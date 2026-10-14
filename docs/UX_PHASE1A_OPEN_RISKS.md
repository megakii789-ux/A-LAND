# Phase 1A 残余风险与后续阶段边界说明 (`UX_PHASE1A_OPEN_RISKS.md`)

- **执行对象**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **当前完成阶段**：Gate 0 + Phase 1A
- **停止条件声明**：**Phase 1A 完成后已立即停止。未启动 Phase 2 完整 2.5D 地图重构、未批量重绘全站装饰角色、未重构音频引擎（`sound.ts` / `speech.ts`）、未引入新动画库。**

---

## 一、上游基线既有问题（受最高优先级安全契约约束未触碰）

### 风险 R-01：`ContentAuditRegistry.ts` 与 `contentAuditRegistry.test.ts` 的 AG-R5 → AG-R6 夹具未同步
- **位置**：
  - `src/domain/cognitive/ContentAuditRegistry.ts:652-653`
  - `src/tests/contentAuditRegistry.test.ts:17-124`
- **现象**：
  1. 上游 Commit `f8c74019`（`feat(cognitive): upgrade content audit to AG-R6`）在 `ContentAuditRegistry.ts` 的 `registerAuditRecord()` 中先写了默认属性 `sceneVersion: '1.0.0'` 和 `invalidationConditions: DEFAULT_INVALIDATION_CONDITIONS`，随后又执行了 `...record` 展开，导致 `tsc --noEmit` 报告 2 处 `TS2783`（属性被覆盖）。
  2. 上游将 `ContentAuditRecord` 接口扩展为 15 个必填字段（新增 `ageBand`、`riskTier`、`reviewTier`、`entryComponent`），并要求 `canRenderContent(contentId, contentPayloadOrHash)` 必须传入实时内容载荷以比对 SHA-256；但 `src/tests/contentAuditRegistry.test.ts` 内的测试夹具仍为旧版 AG-R5 的 11 字段格式且未传入载荷参数，导致该单测文件中 3 个正向用例失败。
- **为什么本轮未修改**：
  - 本轮授权指令明确规定：**「修复布局过程中，不能改变 ContentAuditRegistry 的审批逻辑」「严禁将 PENDING_REVIEW 内容改为默认 PASSED 或通过硬编码专家批准状态解除内容门禁」**。
  - 为确保 `ContentAuditRegistry.ts` 的 SHA-256（`6aa723e0104a7733952dcac1087d2eb7365909cf5b29719259a07ec7857c2535`）与 Gate 0 基线 100% 字节级一致，本轮严格保持该文件零改动。
- **后续建议（待独立授权）**：
  - 在后续专门的安全/测试维护窗口中，更新 `src/tests/contentAuditRegistry.test.ts` 的测试夹具以补齐 AG-R6 的 4 个新字段与测试载荷参数，并移除 `ContentAuditRegistry.ts:652-653` 中被 `...record` 覆盖的冗余默认值。

---

## 二、Phase 1A 范围外的视觉与交互遗留项（留待 Phase 1B / Phase 2–4 独立授权）

### 风险 R-02：非关键装饰性 Emoji 尚未全量替换为 SVG（符合决策 3 边界）
- **位置**：次级弹窗正文、故事步骤提示气泡、家长端口袋锦囊列表等非关键装饰符号（如 `💡`、`🌱`、`✨`）。
- **现状**：
  - 核心交互入口（四大动物伙伴果果/贝贝/天天/奇奇、四个兴趣徽章、导航天气丝带、平静角双按钮、地图切换按钮、妈妈家/爸爸家徽标、拆解台锤子、故事林安全叶片等）已 100% 替换为原创内联 SVG（`CompanionIcons.tsx`）。
  - 次要装饰性 Emoji 按决策 3（「非关键装饰符号不必一次性清零」）保留，且均带有文字标签或 `aria-hidden="true"`，不影响任何功能可操作性。

### 风险 R-03：首页地图仍为卡片网格过渡态，尚未升级为完整 2.5D 童话岛屿（符合决策 2 边界）
- **位置**：`src/components/ChildIsland/FairytaleIslandMap.tsx`
- **现状**：
  - Phase 1A 已修复 `IslandPanoramaIllustration` 的 `preserveAspectRatio="xMidYMid slice"` 宽屏留白与移动端布局挤压，并保留了「童话地图视图 / 清晰卡片视图」双视图无障碍切换。
  - 真正的「中央可探索原创绘本式 2.5D 岛屿 + 六个具有不同空间特征的可点击地形热点」已按决策 2 冻结设计要求，等待 Phase 2 独立授权后实施。

### 风险 R-04：Tailwind v4 中未安装 `tailwindcss-animate` 插件导致的静态过渡
- **位置**：部分弹窗容器上的 `animate-in fade-in zoom-in-95` 类名。
- **现状**：
  - 经生产构建 CSS 核验，项目使用 `@tailwindcss/vite@4.3.3` 且未引入 `tailwindcss-animate`，上述类名在编译后无对应 keyframe 规则（退化为瞬时显示，不影响布局、触控与可访问性，且天然符合降低动效安全要求）。
  - 本轮未引入新动画库或全局 CSS 插件（遵守第七节停止条件），可在后续阶段按需统一清理或替换为原生 CSS transition。

### 风险 R-05：真实远程求助通道尚未接入生产后端（符合最高优先级事实真实约束）
- **位置**：`src/domain/hug/hugSenderService.ts`、`src/components/ChildIsland/HugSupportEntry.tsx`
- **现状**：
  - 当前跨标签页/本机 `BroadcastChannel` + `localStorage` 求助机制及状态机保持 100% 完好，所有状态文案严格诚实陈述本机/网络状态，**绝不把本机模拟求助伪称为真实远程送达**。
