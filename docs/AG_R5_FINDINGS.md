# AG-R5 独立审计缺陷排查与根本原因分析报告 (FINDINGS)

**基线提交：** `438f688023f7a42a47ef4e93d610e9565a0ef1b4`  
**审计批次：** AG-R5（A-LAND 第五轮独立定向修复与真实负向验收）  
**审计原则：** 儿童现实安全 > 对孩子诚实 > 隐私与数据最小化 > 交互契约正确 > 可验证性

---

## 1. 缺陷总览与严重度分类

| 缺陷编号 | 严重度 | 所属领域 | 缺陷描述 | 根本原因 (Root Cause) |
|---|---|---|---|---|
| **R5-FINDING-01** | **P0** | 内容审核门禁 | `ContentAuditRegistry` 存在硬编码预设 `PASSED` 记录，作者自签与泛化“委员会”可冒充独立审查；未审内容在儿童端可通过点击进入 | 初始种子将未受外部专家审查的内容设为 `PASSED`，且 `isContentAuditValid()` 与 `canRenderContent()` 缺少哈希强校验与儿童运行时物理阻断。 |
| **R5-FINDING-02** | **P0** | 儿童求助通信契约 | `OfflineHugController.submitHugRequest` 在传入模拟参数时曾返回 `SENT`；`handleReconnect` 承诺重发重试 | 前期工程混淆了“本机记录创建”与“远端成功投递”，违反了“无远程中继时严禁承诺已发送或自动重试”的诚实契约。 |
| **R5-FINDING-03** | **P0** | 数据同意与隐私擦除 | `DEFAULT_PERSONALIZATION_PROFILE.consentForLocalStorage` 默认设为 `true`；重置配置无条件重写 localStorage | 默认开启持久化违反隐私最小化原则；清除与重置函数未继承许可状态，导致静默重新写入本地存储。 |
| **R5-FINDING-04** | **P1** | 异步防误触门禁 (ParentGate) | `ParentGateModal` 异步 PIN 校验无 generation ticket，关闭后在途异步回调可触发 `onSuccess` | 缺乏异步操作生命周期管理机制，Modal 关闭或重新打开后旧的 SHA-256 / PBKDF2 计算完成仍执行回调。 |
| **R5-FINDING-05** | **P1** | 安全分类逻辑 (ContentAccess) | `classifyLeafScenarioAccess` 对 `Boundary.PHYSICAL_SAFETY` 逻辑反向过滤，导致身体安全场景被误判为儿童可独立探索 | 过滤条件错误写作 `(leaf.boundary && leaf.boundary !== Boundary.PHYSICAL_SAFETY)`，漏掉了对物理伤害核心红线的阻断。 |
| **R5-FINDING-06** | **P1** | 报告时间口径歧义 | 周报标题标注 7 天但底层统计包含了所有历史累计记录，混淆了时间统计口径 | 记录汇聚服务未对时间戳严格按 7 天窗口过滤，却在界面标注为特定日期跨度的“周报”，造成认知混淆。 |
| **R5-FINDING-07** | **P1** | E2E 选择器脆弱性 | Playwright 测试强硬匹配写死名称“伴伴在身边”，当伙伴动态切换为果果/贝贝时测试脆断 | E2E 测试代码未采用语义化正则匹配动态伙伴名称。 |
| **R5-FINDING-08** | **P1** | PWA 资源缺失 | `manifest.webmanifest` 引用了 192/512 图标，但 `public/` 仅有 SVG 矢量图，无实际 PNG 文件 | 构建与静态资源部署流程未生成 Manifest 规范要求的标准 RGBA PNG 图标。 |

---

## 2. 详细缺陷深潜分析

### 2.1 任务一：内容审核门禁旁路深潜
- **表现：** 在旧版本中，`ContentAuditRegistry` 初始化时直接将 `cup-size`、`rain-weather` 等预置记录标记为 `PASSED`，审核人署名使用了通用的“专家委员会”字样。
- **危害：** 违反了“没有真实独立专家批准证据绝不得标记为审核通过”的铁律。一旦第三方恶意注入未审内容，可轻易绕过门禁直接在 6 岁儿童运行时展示。
- **整改对策：**
  1. 彻底清空所有默认 `PASSED` 记录，所有预置场景初始化强制置为 `PENDING`，`canEnterChildRuntime` 恒为 `false`。
  2. 建立包含 16 个特征模式的 `FABRICATED_REVIEWER_PATTERNS` 黑名单，严格封堵自审、AI 伪造、泛化委员会署名。
  3. 引入纯 TypeScript、跨平台无外部依赖的 `sha256Hex` 与 `canonicalJsonStringify`，内容或结构任意字符变动原哈希立即失效。
  4. 将门禁物理切入 `StoryGroveModal`、`InteractiveGamesHubModal`、`TransferScenariosModal`。未审内容必须显示物理拦截卡片，仅允许成年人在明确警示横幅下进行隔离预览。

### 2.2 任务二：儿童求助通信契约失真深潜
- **表现：** 在无远程中继的本机运行环境下，向孩子显示“已送出”、“已送达”或“网络恢复后点击重试”。
- **危害：** 6 岁儿童会误以为远方的父母已收到呼叫并会立刻赶来，导致现实中的安全监护空置或加剧分离焦虑。
- **整改对策：**
  1. 无论传入任何模拟网络参数，`submitHugRequest` 恒定返回 `CommunicationStatus.SEND_FAILED`。
  2. `handleReconnect` 移除一切重试指引，明确设定 `canRetry: false`，文案如实告知“本机运行模式下不会向远端发信，请直接找身边信任的大人”。
  3. `HugSupportEntry` 文案由“送出求助”修正为客观的“记录求助表达”，“寄出想念信”修正为“整理想念卡片”。
  4. 照护者默认选项置为中性的“身边信任的大人”，收件箱默认空列表，仅限隔离的 Demo Mode 下查看示例。

### 2.3 任务三：隐私存储授权漏洞深潜
- **表现：** 默认设置中允许本地持久化；用户清除数据或重置设置后，系统调用了 `DEFAULT_PERSONALIZATION_PROFILE` 将 `consentForLocalStorage` 强行恢复为 `true`。
- **危害：** 撤回同意（Revocation）后发生静默重新持久化，违反了 GDPR/COPPA 及儿童数据最小化原则。
- **整改对策：**
  1. 将 `DEFAULT_PERSONALIZATION_PROFILE.consentForLocalStorage` 默认值改为 `false`。
  2. `resetPersonalizationProfile()` 强制继承当前已设置的许可标志，严禁私自篡改用户选择。
  3. 执行 `clearAllData()` 后，彻底清除本地键名，并确保保存许可保持 `false`。
