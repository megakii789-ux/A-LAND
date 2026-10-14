# A-LAND｜Cloudflare Pages + Cloudflare Access 基础设施配置与上线档案（Gate D1）

- **项目名称**：`qingyu-island-preview`（状态：**ACTIVE & DEPLOYED**）
- **Cloudflare Account ID**：`f5dbf69384a5e6738fc622198a12b8f9`
- **绑定 GitHub 仓库**：`megakii789-ux/A-LAND`（GitHub App Installation ID: `171371763`）
- **生产占位主域名（`public-hold` 分支）**：`https://qingyu-island-preview.pages.dev/`（部署别名：`https://ad78b30e.qingyu-island-preview.pages.dev/`）
- **受控工程预览域名（`preview` 分支）**：`https://preview.qingyu-island-preview.pages.dev/`（固定版本别名：`https://810087d9.qingyu-island-preview.pages.dev/`）

---

## 一、已生效的 Cloudflare Pages 基础设施配置（Gate D1）

| 配置项 | 实际生效值 | 验证状态 |
| :--- | :--- | :---: |
| **Project name** | `qingyu-island-preview` | **已创建并上线** |
| **Production branch** | `public-hold`（自动部署已启用，严禁选择 `main`） | **已生效** |
| **Preview branches** | Custom branches → Include: `preview` / Exclude: `main` | **已生效** |
| **Framework preset** | `Vite` | **已生效** |
| **Build command** | `npm run build` | **已生效** |
| **Build output directory** | `dist`（自动识别并编译 `/functions` 与 `_routes.json`、`_headers`） | **已生效** |
| **HTTPS / SSL** | Cloudflare Universal SSL (HTTP/2 + HTTP/3 强制 HTTPS) | **已生效** |
| **部署日志与历史版本保留** | 永久保留每次 Git Commit 对应的 Deployment ID 与构建日志 | **已生效** |

---

## 二、已生效的 Cloudflare Access 零信任访问控制策略（Gate D1 & D5）

为确保任何未经授权的公网访客无法看到预览环境中的儿童应用界面，已在 Cloudflare Zero Trust Access 中启用强制邮箱白名单门禁：

- **Access Application Name**：`qingyu-island-preview - Cloudflare Pages`
- **Access Application ID**：`39f088b0-9197-4921-93af-8ccbae7651ee`
- **Application Audience (AUD) Tag**：`19b25da51e24f56720b7cda05d8eadcc39f854e685fa4788f198db0b95ebc031`
- **受保护域名范围（Protected Destination）**：`*.qingyu-island-preview.pages.dev`（涵盖 `preview.qingyu-island-preview.pages.dev` 及所有 `<deployment-hash>.qingyu-island-preview.pages.dev` 子域名）
- **Access Policy**：
  - **Policy Name**：`Allow Members - Cloudflare Pages`
  - **Policy ID**：`c021431d-df5e-4133-8074-5c92ab7f7549`
  - **Action**：`Allow`
  - **Include Rule**：`Emails` → `megakii789@gmail.com`
  - **Session Duration**：`24 hours`（`HttpOnly; Secure` Cookie）

### 实测拦截效果
1. 未登录或未携带有效 `CF_Authorization` Cookie 请求 `https://preview.qingyu-island-preview.pages.dev/` 或 `/api/health` 时，边缘直接返回 `HTTP 302` 重定向至 `https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/...`。
2. 输入非白名单邮箱（如 `unauthorized-test@example.com`）不会收到任何一次性验证码（OTP），无法获取应用 HTML 或 JS Bundle。
3. 使用白名单邮箱 `megakii789@gmail.com` 完成 OTP 验证后，正常加载受控工程预览页面。

---

## 三、GitHub 远端分支推送与 SSH Deploy Key 配置记录

- **SSH Deploy Key 名称**：`a-land-local-preview-deploy`（仅绑定至 `megakii789-ux/A-LAND` 单一仓库，指纹：`SHA256:5tnQBd03U1OQ8r8OqkxSIQ5Cigh0+NrkE2GFl3ZWTpo`）
- **远端分支状态**：
  - `origin/main`：`f8c7401907b3fe5831c343b995b777254fdfe45d`（**未覆盖、未改动**）
  - `origin/public-hold`：`e00706e281b298414ee8eebe9de3853fa6ec9765`（生产安全占位分支）
  - `origin/preview`：`ada7191924aa6946fdfb334f6d57672bef4cab6b`（受控工程预览分支）
