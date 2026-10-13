# GATE1A_R2 安全测试执行与验证报告 (Security Tests Report)

**基线提交**: `a02b5a92089d477b64246bce0fe6a5fcf80d20c0`  
**测试时间**: 2026-10-12  
**执行角色**: 独立安全审计员、未成年人隐私与系统安全测试员  
**整改模式**: CONTROLLED P0 REMEDIATION (安全整改闭环与真实性校验)

---

## 一、强制安全测试覆盖矩阵

| 测试项序号 | 覆盖安全领域 | 对应文件 / 模块 | 测试用例与执行方法 | 真实执行状态 | 结果 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-TEST-01** | 匿名 API 请求拦截 | `server.ts` | 请求 `/api/parent/weekly-report` 无 Token，返回 HTTP 503 `API_DISABLED_PENDING_VERIFIED_AUTH` | REAL (Vitest/fs) | **PASS** |
| **SEC-TEST-02** | 伪造 Base64 Bearer 身份声明 | `server.ts` | 携带 `Authorization: Bearer eyJ1aWQiOiJhdHRhY2tlciIsInJvbGUiOiJDQVJFR0lWRVIifQ==` 请求，彻底拒绝并返回 503 | REAL (Vitest/fs) | **PASS** |
| **SEC-TEST-03** | 跨家庭身份与越权隔离 | `server.ts` & `src/providers` | Caregiver A 请求 Family 202 资源抛出 `FAMILY_ID_MISMATCH`，服务层全面校验 | REAL (Vitest) | **PASS** |
| **SEC-TEST-04** | Firestore 匿名写入与权限突破 | `firestore.rules` | 审计 `child_records` 规则，消除 OR 分支漏洞，强制要求认证与家庭匹配，禁止删除 | REAL (Vitest/AST) / Emulator **BLOCKED** | **AUDITED / EMULATOR BLOCKED** |
| **SEC-TEST-05** | research_events 未授权读取与删除 | `firestore.rules` | 审计规则中 `research_events` 默认全拒绝（`allow read, write: if false;`），切断客户端直读直删 | REAL (Vitest/AST) / Emulator **BLOCKED** | **AUDITED / EMULATOR BLOCKED** |
| **SEC-TEST-06** | 无远程中继时的儿童求助点击 | `offlineHugService.ts` & `hugStateMapper.ts` | 在无验证远程中继时点击即刻求助，强制返回 `SEND_FAILED`，文案如实告知“这里不会发消息” | REAL (Vitest) | **PASS** |
| **SEC-TEST-07** | 页面刷新后旧模拟 SENT 状态恢复 | `offlineHugService.ts` | 读取 `sessionStorage` 遗留模拟状态，强制降级收敛为 `SEND_FAILED`，不复现假象 | REAL (Vitest) | **PASS** |
| **SEC-TEST-08** | 禁止儿童敏感信息上传云端 | `googleAuth.ts` & `googleDrive.ts` | 调用 Drive 上传/列表/读取接口均抛出 `CLOUD_BACKUP_DISABLED`，OAuth Scopes 彻底清空 | REAL (Vitest) | **PASS** |
| **SEC-TEST-09** | 未同意时的儿童本地敏感持久化 | `AppContext.tsx` | 审查 localStorage 持久化负载，仅写入安全配置键，排除儿童自由原话、私密想念、情绪日记与家长观察 | REAL (Vitest/fs) | **PASS** |
| **SEC-TEST-10** | 成人工作台非授权访问与防误触 | `parentAccess.ts` & `ParentGateModal.tsx` | 废除 7+8 弱口令；强制 6-12 位 PBKDF2 PIN；连续 5 次错误锁定 60s；页面隐藏自动 relock | REAL (Vitest) | **PASS** |

---

## 二、真实环境运行与阻断说明 (Real Execution vs Blocked)

依据本轮指令“**如真实 Firebase Emulator 或 Playwright 不可用，必须标记 BLOCKED 或 NOT_RUN，不能用手写模拟器或跳过测试宣称通过**”之纪律，测试环境核实如下：

### 1. 真实运行项 (REAL - PASSED)
- **TypeScript 静态检查 (`tsc --noEmit`)**:
  - 执行命令: `npm run lint` (`tsc --noEmit`)
  - 退出码: `0`
  - 结果: 零错误，类型定义严格。
- **Vitest 全量单元与集成套件**:
  - 执行命令: `npx vitest run`
  - 退出码: `0`
  - 运行统计: **19 个测试套件，168 个测试用例全部通过**。
  - 覆盖核心:
    - `tests/domain/p0SecurityRemediation.test.ts` (18 passed)
    - `tests/domain/backendAuthData.test.ts` (10 passed)
    - `tests/domain/hug.test.ts` (10 passed)
    - `src/tests/interactive3D.test.ts` (5 passed)
    - `tests/domain/safety.test.ts` (12 passed)
    - `tests/domain/caregiver.test.ts` (9 passed)
    - `tests/domain/pwaOffline.test.ts` (14 passed)
- **生产构建 (`npm run build`)**:
  - 执行命令: `npm run build`
  - 退出码: `0`
  - 产物正常生成于 `dist/`，未破坏任何 3D 依赖或打包流。

### 2. 真实阻断项 (BLOCKED / NOT_RUN)
- **真实 Firebase Local Emulator (`firebase emulators:exec`)**:
  - **状态**: `BLOCKED`
  - **原因**: 运行环境容器中缺少 Java 运行时（`command not found: java`），Firestore 官方 Emulator JAR 无法在此容器环境启动。
  - **纪律声明**: 虽然通过 `tests/domain/firestoreRules.test.ts` 和源码正则对规则 AST 进行了断言，但**严禁将该手写模拟器评估声称为“真实 Emulator 测试已通过”**。该项真实集成测试在红队环境补充 Java JRE 之前维持 `BLOCKED`。
- **Playwright 真实浏览器端到端测试**:
  - **状态**: `NOT_RUN`
  - **原因**: 当前审计沙箱缺少无头浏览器系统依赖库（libX11/libgbm），未在本次 P0 安全整改受控范围内安装外部依赖。

---

## 三、关键测试用例源码与运行断言示例

### 1. SEC-03 求助无远程中继时拒绝伪造已发送
```typescript
it('Clicking help without verified remote relay returns SEND_FAILED even if online', async () => {
  const controller = new OfflineHugController();
  const state = await controller.submitHugRequest({
    isOnline: true,
    targetCaregiverName: '妈妈',
    requestType: HugRequestType.INSTANT_HELP,
    hasVerifiedRemoteRelay: false
  });

  expect(state.communication).toBe(CommunicationStatus.SEND_FAILED);
  expect(state.communication).not.toBe(CommunicationStatus.SENT);

  const presentation = mapHugStateToChildPresentation(state);
  expect(presentation.displayText).toContain('这里不会发消息');
  expect(presentation.spokenText).toContain('这里不会发消息');
  expect(presentation.spokenText).toContain('直接走到身边的大人面前');
});
```

### 2. SEC-06 成人防误触 PIN 暴力破解锁定与格式验证
```typescript
it('Rate-limits and locks out after 5 consecutive failed attempts', async () => {
  const pinRecord = await makePinRecord('654321');
  savePinRecord(pinRecord);

  for (let i = 0; i < 4; i++) {
    const res = await verifyPin('000001');
    expect(res.success).toBe(false);
  }

  // 第 5 次触发临时锁定
  const lockoutRes = await verifyPin('000001');
  expect(lockoutRes.success).toBe(false);
  expect(lockoutRes.error).toContain('临时锁定');

  // 锁定期内即便输入正确密码也拒绝
  const lockedCorrectRes = await verifyPin('654321');
  expect(lockedCorrectRes.success).toBe(false);
  expect(lockedCorrectRes.error).toContain('尝试次数过多');
});
```

### 3. SEC-07 心理评分完全关闭
```typescript
it('Weekly metrics sets emotionalStabilityScore to 0 and removes arbitrary score grading', () => {
  const metrics = calculateWeeklyMetrics({
    todayWeather: { ... },
    weatherHistory: [],
    parentObservations: [],
    completedLeaves: ['leaf-1', 'leaf-2'],
    medals: [],
    hugCount: 3
  });

  expect(metrics.emotionalStabilityScore).toBe(0);
});
```

---

## 四、未解决安全风险记录 (Unresolved Risks)

1. **真实远程中继与双向通知尚未就绪**:
   - 现阶段儿童求助如实显示 `SEND_FAILED` 并引导当面求助，但生产级可靠消息中继（如 APNs/FCM 紧急推送与心跳响应）需在后续阶段严格通过可信身份认证建设。
2. **端侧物理存储无硬件安全区加密**:
   - Web 浏览器 `localStorage` 是纯明文存储，即使过滤了儿童敏感数据，仍可能受同源脚本攻击。
3. **Firestore 规则缺少真实 Emulator CI 测试**:
   - 需在配备 Java JRE 的 CI 容器中执行 `@firebase/rules-unit-testing`。
