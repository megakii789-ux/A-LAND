# 晴雨小岛 A-LAND｜第三轮审计测试实证报告 (AG-R3 Test Evidence)

**审计日期**：2026-10-14  
**测试执行工具**：TypeScript Compiler, Vitest 5.0.3, Vite 6.2.0, Playwright 1.64.0  

---

## 一、TypeScript 静态类型检查

```bash
$ npx tsc --noEmit
Exit Code: 0 (No type errors)
```
- 全仓开启 TypeScript Strict 模式；
- 无任何未解决的类型不匹配或隐式 any；
- 领域服务层与 React 组件层严格解耦。

---

## 二、Vitest 单元与领域契约测试套件实测

```bash
$ npx vitest run
Test Files: 24 passed (24)
Tests:      243 passed (243)
Duration:   8.93s
```

### 核心测试套件分布与覆盖范围

1. **P0 安全补丁综合套件** (`tests/domain/p0SecurityRemediation.test.ts` - 18 tests):
   - 服务端 Fail-Closed 接口保护 (503 / `API_DISABLED_PENDING_VERIFIED_AUTH`)；
   - 抱抱求助状态真实性（不伪造远程送达，降级旧状态）；
   - 保护儿童身体、离开、求助等安全围栏优先。

2. **儿童求助与共处契约** (`tests/domain/hug.test.ts` & `tests/domain/hugContract.test.ts`):
   - 三维度解耦（通信状态、照护责任、共处状态）；
   - 到场确认后 App 必须 Step Back 退场。

3. **PWA 离线与存储契约** (`tests/domain/pwaOffline.test.ts` - 14 tests):
   - 离线状态下求助请求诚实返回未送达；
   - 刷新页面与重连状态下状态机安全降级。

4. **个性化引擎与隐私过滤器** (`tests/domain/personalizationEngine.test.ts` - 17 tests):
   - 拦截并剥离真实姓名、学校、心理诊断、家庭结构等违规字段；
   - 撤回同意并清空存储 (`revokeConsentAndWipeStorage`)；
   - 年龄分层架构与 5–7 岁受控适配。

5. **内容审核注册中心** (`src/tests/contentAuditRegistry.test.ts` - 11 tests):
   - 验证审核记录结构与 SHA-256 哈希校验；
   - 注册新审核记录与内容渲染许可；
   - 注册中心清空时，场景验证阻断并返回 `UNAUDITED_CONTENT`。

6. **认知内核与宪法守卫** (`tests/domain/cognitiveKernel.test.ts` - 18 tests):
   - 场景 A、B、C 机器可读定义；
   - 宪法铁律验证（不贴标签、不压抑情绪、不强迫公开披露）。

7. **平静空间无竞争与无障碍** (`src/tests/calmSpace.test.ts` - 7 tests):
   - 零积分、零星星、零等级；
   - 实时屏幕阅读器 `aria-live="polite"` 呼吸提示；
   - 交互按钮全量无障碍标签 (`aria-label`, `aria-pressed`, `aria-expanded`)。

8. **每周成长记录真实性** (`tests/domain/weeklyReportService.test.ts`):
   - 全空数据无默认天气记录；
   - 无练习次数强制保底，无分/通/择比例插值；
   - 记录不足统一输出 `尚无足够观察记录`。

---

## 三、工程构建产物校验

```bash
$ npm run build (vite build)
Exit Code: 0
Generated:
  dist/index.html
  dist/assets/index-*.js
  dist/assets/index-*.css
```
构建产物完整生成，无编译错误或缺失导入。

---

## 四、Playwright 浏览器 E2E 与 Firebase Emulator 状态核验

依据第四阶段与第五阶段审核规则：
> “没有浏览器或 Java 运行环境时，保留 BLOCKED，不得以模拟器测试代替真实运行结果。”

### 1. 宿主环境工具核验
- **Java Runtime**: 执行 `java -version` 返回 `sh: 1: java: not found`。
- **Playwright 浏览器核心**: 执行 `npx playwright test` 返回：
  `Error: browserType.launch: Executable doesn't exist at /root/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell`

### 2. 结论与审计定性
由于运行沙箱容器未预装 Java 虚拟机（无法启动真正的本地 Firebase Emulator 进行跨网络真实监听）且未安装无头 Chromium 可执行文件，依据红队穿透审计规则：
- **不伪造测试结果**；
- **不使用假 Mock 宣称已跑通真实跨端浏览器 E2E**；
- **状态如实记录为 BLOCKED_BY_TEST_ENVIRONMENT**。
