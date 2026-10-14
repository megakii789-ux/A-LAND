# 晴雨小岛 A-LAND｜第三轮审计定向整改代码变更清单 (AG-R3 Change Manifest)

**基线版本**：`e81796b00d536c7ff88d8ed5d637fe98ecb69646`  
**审计状态**：定向修复已完成，零功能外溢，严格保持最小 diff

---

### 1. R3-01: 虚假成长记录与算法心理能力推断修复
- **修改文件**：`src/services/weeklyReportService.ts`
  - **原始行号**：Lines 1-320
  - **变更说明**：移除空数据默认天气（原晴3多云2雨1）、移除 `Math.max(..., 4)` 和完成叶乘倍、移除分/通/择的 `0.35/0.30` 估算比例；增加 `INSUFFICIENT_OBSERVATION_TEXT = '尚无足够观察记录'`；汇总文案统一声明客观计数不代表已掌握某种心理能力。
  - **回归测试**：`tests/domain/weeklyReportService.test.ts`（覆盖全空数据、部分数据、撤回数据、无效数据）
  - **测试结果**：100% PASS
  - **残余风险**：家长可能期望看到自动心理画像，需持续通过 UI 说明引导关注真实陪伴。

---

### 2. R3-02: 统一儿童求助与本地想念真实契约
- **修改文件**：
  - `src/domain/hug/types.ts` (Lines 1-70)
  - `src/domain/hug/hugStateMapper.ts` (Lines 1-201)
  - `src/domain/hug/offlineHugService.ts` (Lines 1-197)
  - `src/components/ChildIsland/HugButton.tsx` (Lines 1-61)
  - `src/components/ChildIsland/HugSupportEntry.tsx` (Lines 1-426)
  - `src/components/ParentCoach/CaregiverHugInbox.tsx` (Lines 1-332)
- **变更说明**：
  - 彻底移除“已送达”、“大人已收到”、“提醒已发送至手机”等虚假文案；
  - 抱抱键改设为“当面求助卡”，点击直接出示给身边成年人看；
  - 本地想念表达透明披露存储状态（未同意保存时明确说明“仅在当前页面存在，关闭后清除”）；
  - 家长工作台默认清空虚构求助历史，演练数据仅在显式开启 Demo Mode 下加载；
  - 严格保持 3 独立维度（通信状态、照护责任、共处状态），真人到场确认时 App 必须主动退场（Step Back）。
- **回归测试**：`tests/domain/hug.test.ts`, `tests/domain/hugContract.test.ts`, `tests/domain/p0SecurityRemediation.test.ts`, `tests/domain/caregiver.test.ts`
- **测试结果**：100% PASS
- **残余风险**：无网络中继时儿童如脱离成年人视线，屏幕工具无法物理替代在场保护，需依赖监护人常态化照护。

---

### 3. R3-03: 儿童场景独立内容审核注册体系
- **修改文件**：
  - `src/domain/cognitive/ContentAuditRegistry.ts` (Lines 1-385)
  - `src/domain/cognitive/cognitiveValidator.ts` (Lines 1-645)
  - `src/domain/cognitive/types.ts`
- **变更说明**：
  - 移除虚假专家委员会字串（黑名单过滤）；
  - 建立 6 要素独立审核登记规范（版本、SHA-256、审核人核验、结论、时间戳、批准凭证、失效条件）；
  - 在正式资质专家签署核验前，敏感家庭场景在独立审核体系中标记为待审核/大人共读；
  - 当 registry 清空时，验证器准确返回 `UNAUDITED_CONTENT` 错误。
- **回归测试**：`src/tests/contentAuditRegistry.test.ts`, `tests/domain/cognitiveKernel.test.ts`
- **测试结果**：100% PASS
- **残余风险**：正式上线前仍需外部真实具备执业资格的儿童心理学家提供带签名的审核单。

---

### 4. P1 缺陷集中整改
- **P1-01: 服务端健康检查与 Fail-Closed**
  - **修改文件**：`server.ts`
  - **变更**：启用 `/api/health` 真实路由（HTTP 200 JSON），非公开路由强制 Fail-Closed 返回 HTTP 503 与 `API_DISABLED_PENDING_VERIFIED_AUTH`。
  - **测试**：`tests/domain/p0SecurityRemediation.test.ts` (SEC-01) 通过。

- **P1-02: 默认状态未知与空值化**
  - **修改文件**：`src/context/AppContext.tsx`
  - **变更**：天气默认 `null`，住所默认“尚未设置”，想念记录与特质默认空数组。

- **P1-03: 本地存储许可与无痕撤回**
  - **修改文件**：`src/domain/personalization/profileStore.ts` & `AppContext.tsx`
  - **变更**：存储同意严格默认为 false；撤回许可时先将内存置为 false，彻底清除 localStorage，阻止 useEffect 重新回写。
  - **测试**：`tests/domain/personalizationEngine.test.ts` 17 项全过。

- **P1-04: 接送与两家安排单独同意保护**
  - **修改文件**：`src/context/AppContext.tsx`
  - **变更**：新增 `careScheduleSaveConsent`，未获得独立许可前两家安排仅保存在会话内存。

- **P1-05: 家长防误触 PIN 异步竞争状态解决**
  - **修改文件**：`src/components/ParentGateModal.tsx`
  - **变更**：增加 `generationRef` 票据与 `isSubmitting` 双重拦截，弹窗关闭即作废正在运算的 PBKDF2 结果，杜绝关闭后仍触发回调。

- **P1-06: 认知验证器恶意/畸形嵌套防御**
  - **修改文件**：`src/domain/cognitive/cognitiveValidator.ts`
  - **变更**：增加全局安全提取器与类型守卫，对 null、undefined、非对象输入安全降级为包含错误码的返回对象，绝不抛出未捕获异常。

- **P1-07: 场景交互结果去保证化**
  - **修改文件**：`src/domain/games/friendAsksHomeLogic.ts`
  - **变更**：将同伴理解、老师干预阐述为客观可能的现实走向，提供未达预期的替代安全出口。

- **P1-08: 场景访问分级（儿童独立 vs 大人共读）**
  - **修改文件**：`src/domain/safety/contentAccess.ts`
  - **变更**：实现 `classifyLeafScenarioAccess` 与 `getLeafAccessBadgeText`，明确标注需要成年人共读或待审查的场景。
