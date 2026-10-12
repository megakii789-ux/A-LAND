# 晴雨小岛 · 生产就绪与合规状态备忘报告 (RELEASE_READINESS.md)

本文件遵照《儿童现实安全》、《数据最小化与儿童隐私标准》以及《交互契约规范》（docs/PRODUCT_CONTRACTS.md）制定，对晴雨小岛 v0.6 生产就绪度进行全面客观审查。

---

## 1. 自动化质量与测试状态概览 (Status Overview)

### A. PASSED (已通过测试验证项目)
- [x] **七大认知迁移关系结构 (Phase J Transfer Engine)**:
  - 全部 7 大核心结构（`FACT_VS_INFERENCE`, `PERSPECTIVE_DEPENDENT_EFFECT`, `CHOICE_TRADEOFF`, `MULTI_ATTRIBUTE_IDENTITY`, `CONTEXT_DEPENDENT_BEHAVIOR`, `RELATION_CHANGE_CONTINUITY`, `BEHAVIOR_PERSON_SEPARATION`）均配有 2 训练叶、1 检验叶、1 表面相似干扰叶（共 28 片标准叶子）。
  - Held-out 检验叶零工具名泄漏自动化门禁校验通过。
  - 场景比对引擎“回头比一比”纯情境比较（不问孩子工具名称）测试通过。
- [x] **研究数据最小化与去标识化层 (Phase K EventSink Layer)**:
  - 严格限制 10 项白名单字段，禁止录入原始语音、笔迹画作、自由文本问答、诊断标签、人格测试与心理评分。
  - 家长端禁止展示伪心理学指标（如“通能力 67 分”），自动化拦截测试通过。
  - GDPR/儿童隐私物理级删除测试（`deleteEventsByParticipant`, `deleteEventsBySession`）测试通过。
- [x] **后端授权、数据隔离与规则体系 (Phase L Backend/Auth/Data)**:
  - 抽象 Provider 接口体系（`AuthProvider`, `DataStore`, `NotificationProvider`, `EventSink`）解耦完成，Firebase 仅作为适配器。
  - 服务端接口鉴权门禁（`verifyEndpointAuthorization`）通过：
    1. Family A 绝对无法读取或修改 Family B 数据（Family Isolation）。
    2. Caregiver A 绝对无法读取同一家庭中 Caregiver B 的私密反思笔记（Private Reflection Isolation）。
    3. Child Device 无法读取 Caregiver 私密笔记，严禁修改 Caregiver 联系人与配置。
    4. Researcher 角色绝对无法访问任何家庭原始私有数据，仅能导出脱敏结构化事件。
  - 运行时与规则层双重物理拦截：严禁将儿童本地画作（`drawingCanvas`）与自由录音（`rawVoice`）上传云端。
- [x] **离线与 PWA 能力 (Phase M PWA / Offline)**:
  - PWA 规范清单 `manifest.webmanifest`、`sw.js` 完备；
  - 离线 App Shell 预缓存就绪；
  - 关键契约：即时抱抱请求在离线时明确提示未送达（`SEND_FAILED`），**绝对不模拟成功**；
  - 突发断网降级、网络恢复温和重试、防重复提交（Duplicate Guard）与开状态刷新恢复（Refresh during open hug）均通过测试。
- [x] **多视口横向滚动溢出保护 (Playwright E2E)**:
  - 覆盖全部目标视口（360x800, 390x844, 430x932, 768x1024, 1024x1366），确保横向滚动条绝对为零（`scrollWidth <= clientWidth`）。
  - 儿童交互热区内部基准 >= 56x56px，主按钮高 >= 64px，无障碍 `aria-label` 与 `prefers-reduced-motion` 适配完成。

---

### B. FAILED (测试或契约未通过项)
- **无**。当前 Vitest 单元/契约测试共 10 个测试文件 96 个测试全部通过（96 passed, 0 failed）。Playwright 端到端多视口与无障碍测试全部通过。

---

### C. NOT IMPLEMENTED (按契约暂不实现 / 特意禁用的功能)
- [ ] **儿童端运行时生成式 AI 对话 (Runtime LLM Chat for Children)**:
  - 依据《最高安全优先级》，严禁在 6 岁儿童端引入自由 LLM 对话或即时心理诊断生成，保持纯规则与儿童科学证据驱动。
- [ ] **声纹识别与人脸情绪推断**:
  - 严禁采集生物识别数据。
- [ ] **精确地理位置追踪 (GPS Co-presence Tracking)**:
  - 严禁采集精准 GPS 来判断家长是否到场，在场确认完全依赖本地儿童自愿点击“有人来陪我了”。
- [ ] **积分、等级、签到打卡、对抗式家长比较排行榜**:
  - 严格保持非游戏化成瘾设计。

---

## 2. 跨职能审查清单 (Readiness Checklist)

### D. NEEDS LEGAL REVIEW (需要法务合规审查项)
1. **未成年人网络保护条例与儿童个人信息网络保护规定 (PIPL / COPPA / GDPR-K)**:
   - 审查儿童设备绑定方式（无独立账号绑定，仅使用伪匿名代号 `child_xxx`）的授权同意书架构。
   - 审查监护人代行同意（Verifiable Parental Consent）交互流程。
2. **两家轮换与离异家庭监护权数据隐私合规**:
   - 确认在法律层面，双方监护人各自的“私密自省笔记”属于个人私密记录，互不公开符合法律规范。

---

### E. NEEDS CLINICAL REVIEW (需要儿童心理与临床专家审查项)
1. **物理伤害围栏情境下的成人支持话术 (Physical Harm Boundary Scripts)**:
   - 审查打人、推搡等攻击性行为场景下，先保护身体、找大人的行动路径是否充分有效。
2. **家长失约修复脚本 (Repair Scripts for Missed Commitments)**:
   - 审查家长自报没能赴约时的自省示范话术（“刚才我说会来，可是后来没做到...不是因为你不重要”），评估其在减轻儿童被抛弃感维度的心理学有效性。
3. **退后一步四级阶梯（L1 - L4）**:
   - 审查当前关闭 L4（当前自身情绪事件）的 Feature Flag 设置，确保孩子在未建立充分心理安全前不被过早暴露于自身张力中。

---

### F. NEEDS CHILD USABILITY TEST (需要 6 岁真实儿童可用性测试项)
1. **360px 小屏手机上的视觉与语音听觉配合测试**:
   - 验证不识字或识字量少的 6 岁儿童在完全依赖伴伴语音朗读时，能否无障碍完成“天气记录”和“找大人抱抱”。
2. **“有人来陪我了”退场按钮的儿童心智理解**:
   - 验证儿童是否能理解当真人坐到身边后，点击小岛绿草地完成退场。

---

### G. NEEDS MAINLAND PRODUCTION INFRASTRUCTURE DECISION (中国大陆生产基础设施决策)
1. **Firebase 服务可用性与国内合规替代方案**:
   - Firebase Authentication 与 Firestore 在中国大陆直连受限。
   - **生产决策需求**：正式上线时，可将本工程中实现的 `AuthProvider` 和 `DataStore` Provider 抽象无缝切换为国内合规自建适配器（如阿里云 Node.js Serverless + PostgreSQL / MongoDB 或微信云开发），现有领域层与前端组件无需做任何改动。
2. **App Check 策略说明**:
   - 必须先在监控模式（Monitoring Mode）下运行至少 14 天，充分采集合法设备令牌与网络指纹分布，确认正常流量无误报后再行强制执行（Enforce Mode）。
3. **域名 ICP 备案与儿童教育类移动应用前置审批**。

---

## 3. 部署决策 (Deployment Decision)
> **STATUS**: **HOLD PRODUCTION DEPLOYMENT**  
> 当前版本严禁直接部署至公开生产环境，待法务、临床、真实儿童可用性测试及国内基础设施适配完成签署后方可推进。
