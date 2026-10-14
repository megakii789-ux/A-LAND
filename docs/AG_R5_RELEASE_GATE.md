# AG-R5 独立审计与发布门禁决策报告 (RELEASE GATE)

**基线提交：** `438f688023f7a42a47ef4e93d610e9565a0ef1b4`  
**审计批次：** AG-R5（A-LAND 第五轮独立定向修复与真实负向验收）  
**评估日期：** 2026-10-14  
**门禁结论：** `PASS_FOR_LIMITED_LOCAL_REVIEW`

---

## 1. 门禁状态决策：PASS_FOR_LIMITED_LOCAL_REVIEW

依据指令“**没有真实专业审核，不允许把内容标记为独立批准；没有真实浏览器与安全权限测试，不允许宣布生产级 PASS**”，本次发布门禁定级为：

### **`PASS_FOR_LIMITED_LOCAL_REVIEW`（仅限受控本地审查通过）**

### 决策理由：
1. **P0/P1 工程级缺陷已 100% 修复并闭环：**
   - 彻底关闭了内容审核旁路，删除了所有未审默认 PASSED 记录。
   - 所有预置故事叶与互动场景严格处于 `PENDING` 待独立专家伦理审批状态。
   - 真实求助通信契约已纠偏：无远程通道时一律真实返回 `SEND_FAILED`，网络恢复绝不虚假引导重试。
   - 隐私同意与数据清除生命周期已修复：默认不保存至 localStorage，清除与重置不发生静默重新持久化。
   - ParentGate 增加 Ticket 防止异步竞态；安全边界与报告时间口径均已纠偏。
2. **测试证据真实且齐备：**
   - TypeScript `tsc --noEmit` 0 错误通过。
   - Vitest 26 个测试文件、253 个测试用例 100% 通过（涵盖所有要求强制反例与负向测试）。
   - Vite 生产构建打包成功，PWA Manifest 与 3 项 PNG 实体图标校验完全合格。
   - Playwright 54 项多端视口 E2E 真实浏览器测试全部通过。
   - 原生 HTTP 真实请求验证 `/api/health` 200 OK 及私有 API 503 Fail-Closed。
3. **为什么不能定为生产级全量发布（Full Production PASS）？**
   - **内容独立批准尚未完成：** 目前系统所有预置情境内容依法严格处于 `PENDING_REVIEW` 待审状态，儿童运行时已被门禁隔离，仅支持成年人专家共读审查预览。在获得真实外部儿童心理与伦理专家签署独立批准编号前，依契约禁止宣布为儿童生产可用。
   - **远程中继未接入：** 当前未部署生产级远程中继通信通道，所有求助必须依赖身边真实成年人监护。
   - **Firestore Emulator 环境阻断：** 容器缺少 JRE 环境，本地 Emulator 标记为 `BLOCKED_BY_TEST_ENVIRONMENT`。

---

## 2. 门禁检查项逐项核验表

| 检查大类 | 检查细项 | 状态 | 验证证据 |
|---|---|---|---|
| **P0 审核门禁** | 默认内容均处于待审，无虚假 PASSED | **已达标** | `src/domain/cognitive/ContentAuditRegistry.ts` 种子均为 PENDING |
| **P0 审核门禁** | 阻断作者自签、泛化委员会及伪造哈希 | **已达标** | 负向用例在 `contentAuditRegistry.test.ts` 真实执行通过 |
| **P0 审核门禁** | 门禁物理切入 StoryGrove 与 InteractiveHub | **已达标** | 两个核心界面组件均已接入 `adultPreviewUnlocked` 隔离拦截 |
| **P0 抱抱契约** | 无中继时严格返回 SEND_FAILED | **已达标** | `tests/domain/hugContract.test.ts` 强制反例真实通过 |
| **P0 抱抱契约** | handleReconnect canRetry 恒为 false | **已达标** | 已删除自动重发或重试承诺 |
| **P0 抱抱契约** | 目标照护者默认“身边信任的大人” | **已达标** | `HugSupportEntry` 与 `CaregiverHugInbox` 默认中性安全选项 |
| **P0 数据安全** | consentForLocalStorage 默认 false | **已达标** | `src/domain/personalization/constants.ts` 默认值为 false |
| **P0 数据安全** | resetProfile 继承当前许可，不擅自写入 | **已达标** | `src/domain/personalization/profileStore.ts` 真实通过 |
| **P1 防误触** | ParentGate 异步 generation ticket 隔离 | **已达标** | `ParentGateModal.tsx` 使用 `generationTicketRef` 防竞态 |
| **P1 边界分类** | PHYSICAL_SAFETY 必须触发大人陪同 | **已达标** | `contentAccess.ts` 正确阻断所有非 NONE 边界 |
| **P1 报告口径** | 统一为“本机累计活动记录” | **已达标** | `weeklyReportService.ts` 消除周报与累计混用 |
| **P1 PWA 资源** | 192/512 PNG 图标真实存在且有效 | **已达标** | `public/pwa-icon-*.png` 存在且经构建复制到 `dist/` |
| **P1 E2E 健壮性** | 动态伙伴名称采用语义正则匹配 | **已达标** | `viewport-overflow.spec.ts` 动态匹配通过 |
| **环境依赖** | Firestore 本地 Emulator | **BLOCKED** | 容器缺少 Java，保留 `BLOCKED_BY_TEST_ENVIRONMENT` |

---

## 3. 未关闭问题与后续行动建议 (Open Items)

1. **外部专家伦理审查流程（待线下执行）：**
   - 待具有临床儿童心理学执业资格的注册专家，针对 `SCENARIO_A`、`SCENARIO_B`、`cup-size`、`rain-weather` 等文本和语音脚本进行伦理审查。
   - 审查通过后，将真实专家姓名、资质证书号（如注册督导师编号）与正式伦理委员会批准文件编号，通过真实签名录入 `ContentAuditRegistry`，解除儿童运行时隔离。
2. **生产级远程推送中继（未来阶段）：**
   - 现阶段保持高安全端侧运行模式（Local-only）。若后续阶段需要开通跨设备远程通信，须接入合规的生产级 Firebase Admin 验签或专有安全长连接，方可开放远端状态流转。
