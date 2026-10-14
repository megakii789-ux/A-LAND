# 晴雨小岛 A-LAND｜第三轮穿透审计缺陷排查与审计发现 (AG-R3 Findings)

**核查基线**：GitHub 提交 `e81796b00d536c7ff88d8ed5d637fe98ecb69646`  
**执行角色**：高级工程修复员 + 独立儿童安全红队  
**审计时间**：2026-10-14  
**审计范围**：全仓儿童现实安全、真实通信契约、独立内容审查、数据最小化与防误触工程

---

## 一、P0 级审计发现（核心安全与诚实性漏洞）

### 1. R3-01: 虚假成长记录与算法心理能力推断
- **涉事文件与行号**：
  - `src/services/weeklyReportService.ts`: 历史代码通过 `Math.max(..., 6)` 与默认晴3/多云2/雨1对空数据强行填补天气；通过 `Math.max(..., 4)` 和 `completedLeaves.length * 2` 虚构最少练习次数；通过固定比例 `* 0.35` 和 `* 0.30` 估算分、通、择完成次数；将单次点击或徽章断言为“自主平复良好”、“脚手架正在淡出”。
  - `src/components/ParentCoach/WeeklyReportView.tsx`: 历史代码直接展示虚构图表与推断评语。
  - `src/components/ParentCoach/ParentDashboard.tsx`: 历史默认载入非空模拟观察数据。
- **严重性**：违反《儿童现实安全》与《对孩子诚实》原则，将屏幕点击伪造为稳定心理能力，误导家长抚养决策。
- **修复措施**：
  - 空数据坚决不生成默认天气，统一显示常量 `INSUFFICIENT_OBSERVATION_TEXT = '尚无足够观察记录'`；
  - 彻底移除任何练习次数保底与比例估算；
  - 仅客观汇总可追溯来源的实际操作，明确声明“不代表孩子已掌握某种稳定心理能力，亦不作任何心理或临床诊断推断”。

### 2. R3-02: 儿童求助状态虚假声明与伪造远程送达
- **涉事文件与行号**：
  - `src/components/ChildIsland/HugButton.tsx` (原第 50, 54, 64, 67 行)：在无远程中继的情况下，点击后弹出“轻声提醒已送达”、“大人那边已收到你的抱抱心愿”。
  - `src/components/ChildIsland/HugSupportEntry.tsx` (原第 118-145 行)：异步想念 Tab 声称“把想念的话装进小信封。大人有空时会看”，在未持久化时向孩子谎称“已经保存”，并误导孩子断网重连即可发送。
  - `src/domain/hug/offlineHugService.ts`：允许通过模拟参数 `hasVerifiedRemoteRelay: true` 伪造 `CommunicationStatus.SENT`；重连提示承诺“网络恢复后可重新发送”。
  - `src/components/ParentCoach/CaregiverHugInbox.tsx` (原第 58-82 行)：在真实家长工作台默认载入 3 条虚构求助历史（`req-1`、`req-2`、`req-3`）及自省记录。
- **严重性**：极高现实人身安全风险。6 岁儿童在遭遇现实危险或强烈情绪时若信以为真“大人已收到”，会导致儿童放弃在现实中寻找身边成年人，造成严重现实看护真空。
- **修复措施**：
  - 严格遵守 3 个独立维度（communication status, care responsibility, co-presence）；
  - 当前无远程中继时，严禁出现“已送达”、“大人已收到”；
  - 抱抱键与求助入口统一调整为“当面求助卡”，明确提示“这里不会发送远程通知，请直接走到身边信任的大人面前”；
  - 本地想念表达透明披露实际存储状态（未开启存储同意时明确说明“仅在当前页面存在，关闭页面后清除”）；
  - 真实家长工作台默认完全清空虚构求助历史，演练数据严格限制在显式开启的 Demo Mode 下。

### 3. R3-03: 儿童场景伪造专家审查与伦理批准
- **涉事文件与行号**：
  - `src/domain/cognitive/ContentAuditRegistry.ts` (原第 101, 110, 119 行)：所有场景默认标记为 `PASSED`，审查人填充虚构的“儿童心理发展与临床伦理专家委员会”。
  - `src/domain/cognitive/types.ts` & `src/domain/cognitive/scenarios/*`: 仅凭硬编码字符串声明 `REVIEWED_SAFE`。
- **严重性**：伪造临床伦理背书，规避真实安全红队与专家审查流程。
- **修复措施**：
  - 建立 6 要素独立审核登记规范：场景版本、SHA-256 哈希、真实专家核验、审核结论、审核时间、批准证据、失效条件；
  - 严禁模糊委员会或虚假署名；
  - 在外部正式资质专家完成签署之前，家庭敏感场景在安全层级统一归类为待审核/大人共读，不伪造伦理通告。

---

## 二、P1 级缺陷排查与处置

| 编号 | 缺陷描述 | 涉事位置 | 修复方式 |
| :--- | :--- | :--- | :--- |
| **P1-01** | `server.ts` 健康检查路由被注释且无真正 HTTP 校验 | `server.ts` | 取消注释 `/api/health` 返回真实 200 JSON，保留未授权 `/api/*` 返回 503 Fail-Closed |
| **P1-02** | 默认状态包含示例天气、家庭住所、想念留言与特质 | `src/context/AppContext.tsx` | 全部重置为 null 或空数组，演示数据仅在显式 Demo Mode 注入 |
| **P1-03** | 本地存储许可未严格默认 false，撤回和重置时可能覆写 | `src/domain/personalization/profileStore.ts` & `AppContext.tsx` | 许可默认 false，清除/撤回后先置标志再清除，杜绝 useEffect 重新写回 |
| **P1-04** | 家庭接送与两家日程默认被写入 localStorage | `src/context/AppContext.tsx` | 将接送日程设立独立敏感分类，增加专门同意开关，未授权不落地存储 |
| **P1-05** | 家长 PIN 异步 PBKDF2 校验与弹窗关闭存在竞争状态 | `src/components/ParentGateModal.tsx` | 引入 generation ticket 票据与 isSubmitting 锁，关闭即废弃旧票据 |
| **P1-06** | `validateUnifiedScene` 传入不完整/恶意嵌套数据发生未捕获异常 | `src/domain/cognitive/cognitiveValidator.ts` | 增加全局防御性深层安全提取器与类型守卫，全面兜底不抛错 |
| **P1-07** | 互动游戏中同伴理解、老师干预、欺凌停止被表述为必然保证 | `src/domain/games/friendAsksHomeLogic.ts` & 游戏文本 | 将绝对保证修正为客观现实可能情节，提供现实备用求助路径 |
| **P1-08** | 场景缺少成人共读与儿童独立分类标识 | `src/domain/safety/contentAccess.ts` | 建立 `classifyLeafScenarioAccess`，将敏感/待审内容明确归入大人共读 |
| **P1-09** | 迁移任务中提示次数跨场景泄露污染 | `src/domain/transfer/transferValidator.ts` | 严格重置场景级提示器状态，未经训练的新叶禁止附带先验线索 |
| **P1-10** | 遗留旧按钮文案与 Google Drive 说明不符合离线运行现实 | 全局组件 | 统一清除伪造在线通信文案与外部云盘指示，恢复纯本地诚实提示 |
