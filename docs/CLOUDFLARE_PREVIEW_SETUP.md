# A-LAND｜Cloudflare Pages + Cloudflare Access 基础设施配置手册（Gate D1）

- **建议项目名称**：`qingyu-island-preview`（如已被占用，备选名称：`a-land-qingyu-preview` 或等待人工确认）
- **绑定仓库**：`megakii789-ux/A-LAND`
- **托管计划**：Cloudflare Pages Free + Cloudflare Zero Trust Access Free
- **默认预览域名**：`https://qingyu-island-preview.pages.dev`（Production 占位）与 `https://preview.qingyu-island-preview.pages.dev`（受保护工程预览）

---

## 一、本机认证状态审计与人工授权步骤（最高原则合规报告）

根据指令第三节（Gate D1）：
> “如果缺少 Cloudflare 登录、GitHub 授权或项目创建权限，立即报告需要我完成的认证步骤。不得通过任何绕过身份验证的方法获取凭证。”

经本机环境实测（不尝试任何凭证提取或绕过）：
1. **GitHub 推送权限检测**：
   - 执行 `GIT_TERMINAL_PROMPT=0 git -C /home/voga/A-LAND push --dry-run origin preview` 返回：
     `fatal: could not read Username for 'https://github.com': terminal prompts disabled`
   - 原因：本机未配置 `gh` CLI 登录、SSH 私钥或 Git Credential Helper PAT。
2. **Cloudflare 权限检测**：
   - 检查 `~/.config/.wrangler` 与环境变量（`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`）均为空，本机尚未完成 Cloudflare 交互式 OAuth 登录。

### 需由仓库所有者执行的 3 步授权与激活指令

#### 步骤 1：完成 GitHub 推送授权并推送 `public-hold` 与 `preview` 分支
在本机终端配置 GitHub PAT 或 SSH 后，在 `/home/voga/A-LAND` 执行（**严禁推送或覆盖 `main`**）：
```bash
# 推送安全占位分支 public-hold（用作 Cloudflare Pages Production 分支）
git -C /home/voga/A-LAND push -u origin public-hold

# 推送通过全部本地门禁的工程预览分支 preview
git -C /home/voga/A-LAND push -u origin preview
```

#### 步骤 2：在 Cloudflare Dashboard 创建 Git-Integrated Pages 项目
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**。
2. 授权 GitHub 账号并选择仓库 `megakii789-ux/A-LAND`。
3. 按下表填写构建配置：

| 配置项 | 设定值 | 设计原因 |
| :--- | :--- | :--- |
| **Project name** | `qingyu-island-preview` | 遵循 Gate D1 建议名称（若被占用请停下确认新名称） |
| **Production branch** | `public-hold` | **最高安全红线**：生产主域名仅展示静态安全占位页，绝不直接部署旧 `main` 或未经审核的儿童端 |
| **Preview branches** | Custom branches → Include `preview` | 仅允许 `preview` 分支触发自动预览部署，拦截 `main` 分支自动构建 |
| **Framework preset** | `Vite` | 匹配项目 Vite 静态构建 |
| **Build command** | `npm run verify:ci`（或 `npm run build`） | 串联 `tsc --noEmit && vitest run && vite build`，失败即停止部署 |
| **Build output directory** | `dist` | Vite 静态产物输出目录，同时自动加载根目录 `functions/` |
| **Node.js version (`NODE_VERSION`)** | `20.20.2`（或通过 `.nvmrc` / `.node-version` 自动识别） | 与本机隔离验证环境严格一致 |

#### 步骤 3：开启 Cloudflare Access 预览访问控制（强制阻断未授权访问）
1. 在 Cloudflare Dashboard 进入：`Workers & Pages` → `qingyu-island-preview` → **Settings** → **General** → **Access policy** → 点击 **Enable Access policy**（自动保护 `*.qingyu-island-preview.pages.dev` 所有预览部署）。
2. 进入 **Zero Trust Dashboard** → **Access** → **Applications** → 编辑自动生成的 `qingyu-island-preview` 应用：
   - **Application domain**：`*.qingyu-island-preview.pages.dev`（以及 `qingyu-island-preview.pages.dev`）
   - **Session Duration**：`24 hours`
   - **Policy Name**：`A-LAND Authorized Reviewers Only`
   - **Action**：`Allow`
   - **Include Rule**：`Emails` → 填入授权审计人员邮箱白名单（使用 One-Time Pin (OTP) 或 Google OAuth 验证）。
   - **Fallback**：任何不在白名单内的邮箱一律拒绝签发 `CF_Authorization` JWT Cookie，无法看到任何应用 HTML 或静态 JS Bundle。

---

## 二、生产占位分支（`public-hold`）设计说明

为确保即使有人访问主域名 `https://qingyu-island-preview.pages.dev` 也绝不会接触到未通过完整内容审核的儿童业务界面，本机 Git 工作副本已专门创建 `public-hold` 分支：
- 仅包含静态安全占位页 `dist/index.html`（显示 `ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED — 晴雨小岛公网生产环境暂未开放`）与 `/api/*` 503 拦截配置。
- 不包含任何 React 儿童端组件、音频或故事资源。

---

## 三、HTTPS、部署日志保留与版本回退设置

1. **HTTPS 强制启用**：
   - Cloudflare Pages 默认开启 Universal SSL 与 `Always Use HTTPS`（HTTP 请求在边缘直接 301 重定向至 HTTPS）。
   - 项目内置 [`public/_headers`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/public/_headers) 额外附加 `X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、`X-Robots-Tag: noindex, nofollow, noarchive` 与 `X-Release-Gate-Status: ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`。
2. **部署历史与日志保留**：
   - Cloudflare Pages 永久保留每次 Git 提交对应的不可变部署快照（`<deployment-hash>.qingyu-island-preview.pages.dev`）及完整构建日志。
   - 每次部署在 `/version.json` 中固化对应的 Git Commit SHA、分支名与门禁状态，支持一键审计与秒级回滚。
