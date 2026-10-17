# A-LAND V2.3 Batch 01 — 预生产跟踪风险清单 (`PREPRODUCTION_TRACKED_RISKS.md`)

根据 `A_LAND_V2_3_BATCH01_WEATHER_CALM_EXECUTION.md` Gate D 要求，以下三项工程环境与构建体积事项在 V2.3 Batch 01 独立视觉换肤分支中**仅做如实记录与量化监控，严禁在视觉换肤分支中越权升级依赖或拆分业务路由**：

| 风险 ID | 类别 | 实测现象与原始日志证据 | Batch 01 处置策略 | 责任归属与目标门禁 |
| :--- | :--- | :--- | :--- | :--- |
| `RISK-NODE20-ENGINE-WARN` | 构建与运行环境 (`Node v20.20.2`) | `RAW_NPM_CI.log` 中记录 `@firebase/*` 要求 `node >= 24.12.0`、`vitest@5.0.4` 要求 `node ^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`，当前环境为 `Node v20.20.2` / `npm 10.8.2` | 保持冻结锁文件与构建环境，不在视觉分支内修改运行时要求 | Platform / Release Engineering（Preproduction Infrastructure Gate） |
| `RISK-NPM-ADVISORIES-4HIGH` | 依赖安全通告 (`npm audit`) | `RAW_NPM_CI.log` 报告开发/构建传递依赖存在 `4 high severity vulnerabilities` | 严格禁止在视觉换肤分支运行 `npm audit fix --force` 或改动 `package.json` / `package-lock.json` | Security & Release Engineering（Preproduction Security Gate） |
| `RISK-MAIN-JS-BUNDLE-SIZE` | 前端主包体积与媒体加载耗时 | `RAW_BUILD.log` 与 `GATE_D_6VIEWPORT_AND_E2E_REPORT.json` 实测：`dist/assets/index-BzdlNGt4.js` 为 `2,493.52 kB`（gzip `558.51 kB`），`dist/assets/index-aOaByqsr.css` 为 `181.03 kB`（gzip `23.12 kB`）；V2.3 场景 SVG 图层实测全层加载耗时 `1.2ms – 20.1ms`，Fallback 触发次数 `0` | 通过 `useV2_3MediaLoadTracker` (`window.__ALAND_V2_3_MEDIA_METRICS__`) 实测记录每个场景首层与全层加载耗时；主包 `dynamic import()` 拆分留待独立性能门禁执行 | Frontend Architecture（Preproduction Performance Gate） |
