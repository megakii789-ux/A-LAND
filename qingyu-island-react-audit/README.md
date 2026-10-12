# 晴雨小岛 · 0.6.2-audit.1

这是 `/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间` 对应的 React / TypeScript 工程的**本地审阅修正版**。
不是上一轮的单文件 HTML 工程，也没有覆盖原 Google Drive 文件。

**发布状态：HOLD。** 本次已执行源码解析、纯领域严格编译/测试与静态 CSS 布局检查；
因执行环境无法获取 npm 依赖，没有执行完整 React 构建、浏览器应用端到端测试、真实设备安装或儿童验证。

先读 `docs/00-AUDIT-STATUS.md`。

## 1. 已实施的源码调整

保留 React 工程与六个地点，不新增儿童工具。修正导航、触控区、全屏弹窗、朗读失败提示、底部支持区。
移除真实使用路径中的徽章、模拟远程求助、伪云备份和心理评分。
本机求助卡没有跨设备通信；三轴状态只在成人工作台演练。
家庭及高负荷故事默认隐藏，每次进入需通过成人防误入门确认。
成人 PIN 不是监护人身份验证。云 API 默认 503，旧占位云适配器直接拒绝使用。

当前旧内容库有 7 片叶子；默认可见 4 片；另有 3 片成人共读场景。没有宣称已完成 16 周课程。

## 2. 本机运行

需要能安装原工程锁定依赖的 Node.js / Bun 环境。依赖版本范围未做静默降级。
优先沿用原工程的 `bun.lock`：

```bash
bun install --frozen-lockfile
npm run typecheck
npm test
npm run audit:source
npm run audit:domain
npm run build
npm run dev
```

如果本地已有原工程完整依赖，可先直接运行上述检查。只有 npm 的环境可执行 `npm install`，
但它会重新解析版本并生成 package-lock.json；必须保存该锁文件并复核实际安装版本，不能当成与 Bun 完全相同的环境。

开发服务器默认 `http://127.0.0.1:3000`。无须 GEMINI_API_KEY；本版不调用运行时 Gemini。

需要在 AI Studio 沙盒对外绑定时，由运行环境显式设置：

```bash
HOST=0.0.0.0 PORT=3000 npm run dev
```

不要用“能启动”替代生产验收。原始 `.env.example` 和 Firebase 配置只作原工程证据，当前实际入口不使用它们。

## 3. 新增浏览器验收

```bash
npx playwright install chromium
npm run test:audit:e2e
```

使用独立的 `playwright.audit.config.ts`，端口 3179，不复用未知服务。
9 个场景 × 6 个视口 = 54 个待执行组合；本包不附伪造的运行结果。

场景包括：首页溢出/触控尺寸、弹窗焦点循环与 Escape、天气跳过、雨天内容路径、
本地求助不发送网络消息、PIN 锁定、家庭共读确认、保存许可、伪造身份的 API 拒绝。

原 `tests/e2e`、`tests/screenshots`、`test-results` 保留为历史证据；
它们依赖旧界面和旧模拟流程，不是本轮通过报告。新测试记录写入 `audit/browser-*`。

## 4. PWA 与生产启动

```bash
npm run build
NODE_ENV=production npm start
```

构建命令先由 Vite 生成真实静态资源，再由 `scripts/build-pwa.mjs` 注入缓存清单和内容哈希。
不要把 `public/sw.js` 模板直接部署；部署应使用 `dist/sw.js`。
开发模式不注册新 service worker。测试旧版本升级时要核查此前注册的旧 worker；
不要清除同源其他应用的缓存或存储。

已补齐 manifest 声明的 192px / 512px / maskable PNG，以及 180px Apple 图标。
这些文件存在和生成脚本语法已检查，**不等于已通过 iOS / Android 安装测试**。
根路径部署为当前假设；部署到子目录前需单独适配 manifest、SW 与资源 base。

## 5. 保存与清除

默认内存体验。成人明确同意后，未加密 localStorage 仅保存：
version、故事浏览编号、固定称呼的一周安排、家庭内容开关。

天气、想念、拼图、研究观察和成人自省不因该许可持久保存，也不上传。
PIN 的盐/哈希在当前标签页 sessionStorage；解锁状态仅在内存。
关闭标签页后会失去 PIN 记录；浏览器恢复会话的行为仍应实机核查。
本机 PIN 防误入，不抵抗设备持有人或调试工具。

“清除”包含本版与已识别旧版的小岛键，不删除用户已下载文件，也不能删除未知云副本。
“设置备份”是明确标注的未加密 JSON，不是云同步；导入不恢复保存许可、PIN 或浏览记录。

## 6. 本轮证据

- `audit/source-checks.json`：85 个应用源文件 + 18 个测试/配置文件解析；9 项静态规则。
- `audit/domain-checks.json`：11 个项目文件严格编译，44 条断言，200 个旧状态组合。
- `audit/layout-fixture/measurements.json`：6 个首页静态 DOM/CSS 视口。
- `audit/color-checks.json`：6 组颜色配对计算。
- `audit/pwa-static-checks.json`：6 项静态资源/生成器检查。
- `audit/LAYOUT_REVIEW.html`：原包截图与**非 React**静态样张并排。
- `docs/PIXEL_AND_CONTRACT_AUDIT_2026-10-09.md`：详细结论。

本轮纯逻辑使用实际 TypeScript 5.8.3 和 Node WebCrypto；不是原工程声明的 TS 7.0.2 全项目验证。
没有使用假的 React 实现来替代应用，也没有把手写 Firestore 模拟器当成 Firebase Emulator。
