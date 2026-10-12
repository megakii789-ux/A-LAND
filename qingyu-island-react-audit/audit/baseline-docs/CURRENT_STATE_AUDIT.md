# 晴雨小岛项目当前状态深度审查报告 (Phase A Audit)

**审查执行时间**：2026-10-09  
**审查原则**：只审查，不改动业务代码，不安装新依赖，以《儿童安全模型》及《产品交互契约》为最高裁判基准。

---

## 1. 当前 Frontend / Backend 架构

### 1.1 架构概览
- **客户端架构**：React 19 + TypeScript + Vite 8，使用 Tailwind CSS v4 进行样式管理。客户端是一个单一单页应用（SPA），无路由系统，通过全局上下文 `AppContext.tsx` 中的状态变量 `currentView: 'child' | 'parent'` 实现视图切换。
- **服务端架构**：Express 4.21 全栈开发服务器（`server.ts`），通过 `vite.middlewares` 挂载 Vite 开发中间件并监听端口 3000。
- **状态存储与持久化**：
  - 核心状态持久化完全依赖浏览器的 `localStorage`（键名 `sunny_rain_island_v1_state` 以及 `diff_breaker_history_v1`）。
  - 没有接入远程持久化数据库（Firestore 仅引入了客户端 SDK，实际仅用作 Google OAuth 登录，未连接 Firestore 集合）。
- **外部集成**：
  - **Google GenAI**：后端通过 `@google/genai` (v2.4.0) 初始化，调用模型 `gemini-3.8-flash`。
  - **Google Drive**：客户端通过 Firebase Auth 获取 Google OAuth Access Token，直接在浏览器端发起 Google Drive REST API v3 读写。

```
[Browser Client: React 19]
   │
   ├── AppContext (localStorage: sunny_rain_island_v1_state)
   │     ├── currentView ('child' <-> 'parent' via math gate)
   │     └── Child/Parent Shared In-Memory State
   │
   ├── Google Drive REST API v3 (Direct client-side fetch via OAuth token)
   │
   └── HTTP POST /api/parent/weekly-report (Unauthenticated)
         │
         ▼
[Express Server: server.ts (Port 3000)]
   │
   └── GoogleGenAI SDK (gemini-3.8-flash)
```

---

## 2. routes / pages / components / services / types 的实际结构

### 2.1 目录结构与文件清册
```
/
├── server.ts                               # Express 后端入口，挂载 Vite 并提供周报生成 API
├── vite.config.ts                          # Vite 配置（Tailwind CSS 插件）
├── package.json                            # 项目配置与依赖清单
├── firebase-applet-config.json             # Firebase / Google Client 配置
├── index.html                              # SPA HTML 模板
├── metadata.json                           # AI Studio Applet 元数据
└── src/
    ├── main.tsx                            # React DOM 入口
    ├── App.tsx                             # 主应用装配：根据 currentView 渲染 child 或 parent
    ├── index.css                           # Tailwind CSS 全局样式
    ├── types/
    │   └── index.ts                        # 核心数据模型类型定义（Weather, Leaf, Hug, Medal, Report 等）
    ├── data/
    │   └── mockData.ts                     # 静态情境叶、徽章配置、养育建议、家长观察初始数据
    ├── context/
    │   └── AppContext.tsx                  # 全局状态树与方法（天气、拥抱、徽章、书包、心事等）
    ├── utils/
    │   ├── sound.ts                        # Web Audio API 合成音效（钟声、点击、翻币、拥抱音）
    │   └── speech.ts                       # Web Speech API 浏览器语音朗读（window.speechSynthesis）
    ├── services/
    │   ├── googleAuth.ts                   # Firebase Auth 包装的 Google 登录与 OAuth Token 缓存
    │   ├── googleDrive.ts                  # Google Drive REST API v3 备份/同步实现
    │   └── weeklyReportService.ts          # 周报数据聚合计算与服务端/本地兜底调用
    └── components/
        ├── Navbar.tsx                      # 顶部通栏（模式切换、拥抱红点提示、音量、云端硬盘、说明）
        ├── ParentGateModal.tsx             # 家长验证闸门（数学题 7 + 8 = 15）
        ├── GoogleDrive/
        │   └── GoogleDriveModal.tsx        # Google 云端硬盘同步管理弹窗
        ├── ChildIsland/                    # 【孩子端】
        │   ├── IslandHome.tsx              # 小岛主页（内心天气、思考拆解台横幅、6大场景入口卡片）
        │   ├── HugButton.tsx               # 抱抱键组件与确认气泡
        │   ├── WeatherStationModal.tsx     # 情绪天气站弹窗
        │   ├── CalmCornerModal.tsx         # 平静角落（深呼吸引导）
        │   ├── StoryGrove/                 # 故事林（4片叶具体生活情境演练）
        │   │   └── StoryGroveModal.tsx
        │   ├── ThoughtDetectiveLab/        # 想法侦探社（小旗子、三个镜头、双面币、小天平、安全围栏）
        │   │   └── ThoughtDetectiveLabModal.tsx
        │   ├── CourageHouse/               # 勇气说话屋（三句话工具箱、信息小房子、不寄出的心事抽屉）
        │   │   └── CourageHouseModal.tsx
        │   ├── TwoHomesBridge/             # 两个家的桥（日程脚印、换家小书包、想念盒子）
        │   │   └── TwoHomesBridgeModal.tsx
        │   ├── StarlightCabin/             # 星光小屋（多维我是谁拼图、强项卡）
        │   │   └── StarlightCabinModal.tsx
        │   ├── DifficultyBreaker/          # 分通择困难拆解台（预设情境拆解与踏脚石）
        │   │   └── DifficultyBreakerModal.tsx
        │   └── Medals/                     # 徽章系统
        │       ├── MedalsModal.tsx         # 成就徽章馆弹窗
        │       └── MedalUnlockedToast.tsx  # 勋章解锁轻提示 Toast
        └── ParentCoach/                    # 【家长端】
            ├── ParentDashboard.tsx         # 家长教练工作台（6大标签页）
            └── WeeklyReportView.tsx        # 周报分析视图与个性化建议展示
```

### 2.2 路由机制现状
- **无客户端 Router**：未引入 `react-router` 或任何现代路由库。
- **状态伪路由**：在 `App.tsx`（第 19 行）中仅有一行三元判断：
  ```tsx
  {currentView === 'child' ? <IslandHome /> : <ParentDashboard />}
  ```
- **弹窗式层级**：所有子页面和探索点均作为 `Modal` 挂载在主视图中，以布尔值 `isOpen` 控制渲染，无法通过 URL 深度链接定位，刷新后全部关闭。

---

## 3. 当前 Child / Parent 是否已经分离

### 3.1 结论：**完全未物理分离，存在重大边界穿透风险**

### 3.2 现状具体证据
1. **同进程同 Context 共享**：
   - 孩子端与家长端运行在同一个 SPA 进程和同一个 React Context（`AppContext.tsx`）中。
   - 孩子端的每次点击操作（如天气选择、徽章解锁、抱抱点击）直接修改上下文状态；家长端立即无延迟订阅并刷新。
2. **极其脆弱的“闸门”**（`ParentGateModal.tsx` 第 14-16 行）：
   - 进入家长端的唯一拦截是一道固定加法算式：
     ```tsx
     const num1 = 7;
     const num2 = 8;
     const correctAnswer = num1 + num2; // 15
     ```
   - 任何 6 岁儿童或随意输入数字 15 的人，都能在 3 秒内解锁家长端。
3. **数据互相可见与泄露**：
   - 存储在同一个 `localStorage` 键 `sunny_rain_island_v1_state` 下。
   - 家长端的敏感观察记录（`parentObservations`）、离异沟通脚本、甚至交接备忘，孩子只要切换视图即可全文查阅。
   - 孩子端私密的自由心事（`missNotes`，例如“想念爸爸带我去池塘看小鸭子”）以及对家长的引用原话（`childQuotes`），家长端在同一状态树中随处可读。
4. **儿童界面直接放置家长入口与技术备份**：
   - 孩子端主导航栏右侧赫然显示“进入家长教练端”按钮与“Google 云端硬盘”备份按钮（`Navbar.tsx` 第 102、129 行），对 6 岁儿童造成不必要的认知干扰与误触风险。

---

## 4. 当前所有 Firebase / Google / AI 依赖

### 4.1 依赖清单
| 依赖名称 | 版本 | 引入位置 | 实际用途与行为 |
| :--- | :--- | :--- | :--- |
| `@google/genai` | `^2.4.0` | `server.ts` | 后端调用 Gemini 3.8 Flash，生成家长周报分析与建议 |
| `firebase` | `^13.0.0` | `package.json`<br>`src/services/googleAuth.ts`<br>`src/components/GoogleDriveModal.tsx` | 仅使用 `firebase/app` 与 `firebase/auth` 实现 Google Popup 登录并换取 Access Token |
| `dotenv` | `^17.2.3` | `server.ts` | 读取服务器端环境变量 `GEMINI_API_KEY` |
| `express` | `^4.21.2` | `server.ts` | 提供 HTTP 接口服务并托管开发中间件 |

### 4.2 客户端配置（`firebase-applet-config.json`）
- 包含 `projectId: "gen-lang-client-0959641890"`、`apiKey`、`authDomain`、`oAuthClientId`。
- **注意**：Firestore、Cloud Storage 并没有任何数据库规则文件（无 `firestore.rules`，未调用 Firestore SDK 存储文档）。

### 4.3 Google OAuth 范围过度索取
在 `src/services/googleAuth.ts`（第 16-30 行）中声明了高达 13 个 Google Drive Scopes，包含了：
- `https://www.googleapis.com/auth/drive`（完全控制用户所有云端硬盘文件）
- `https://www.googleapis.com/auth/drive.photos.readonly`
- `https://www.googleapis.com/auth/drive.meet.readonly`
- `https://www.googleapis.com/auth/drive.scripts`
这严重违反了**“隐私与数据最小化”**原则（仅备份小岛配置完全不需要全盘读写和 Meet/Photos 权限）。

---

## 5. 当前有哪些 Runtime Gemini Calls

### 5.1 唯一调用点
- **服务端入口**：`server.ts` 中的 `POST /api/parent/weekly-report`（第 28-132 行）。
- **模型**：`gemini-3.8-flash`。
- **触发源**：
  - 家长打开“周报分析”标签页时自动请求（`WeeklyReportView.tsx` 第 78 行）。
  - 家长点击“重新计算并生成分析”按钮时主动请求（`WeeklyReportView.tsx` 第 87 行）。

### 5.2 提示词内容与契约冲突
在 `server.ts` 第 44-105 行，向 Gemini 发送了以下 Prompt：
- **输入数据**：将 6 岁儿童当周的点击频次、天气记录（晴/雨/雷）、抱抱按钮按压次数、勋章数以及家长日常行为观察文本打包序列化送入大模型。
- **要求模型推断**：
  - `"情绪波动与平复曲线分析"`
  - `"自我平复力发展阶段评估"`（**直接违反“不得自动判断孩子心理状态、诊断或治疗；不得从点击推断心理疾病或人格”的禁止事项**）
  - `"当前所处的脚手架阶段"`
- **当前保障与隐患**：
  - 虽然调用位于服务端 `server.ts`，未将 API Key 泄露到前端；
  - 虽然在 AI 失败时提供了本地确定性规则引擎兜底（`weeklyReportService.ts`）；
  - **但该调用直接越界对儿童进行发展心理学阶段评估，违反了安全底线规范**。

---

## 6. 当前所有儿童数据字段

审查 `src/types/index.ts`、`src/context/AppContext.tsx`、`src/components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal.tsx`，当前系统涉及的儿童数据字段如下：

### 6.1 情绪与心理天气
- `WeatherRecord`:
  - `id: string`
  - `timestamp: string`
  - `primary: WeatherType` ('sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy')
  - `secondary?: WeatherType | null`
  - `intensity: number` (1-5 强度)
  - `bodySensations: string[]`（身体感觉列表，如 '胸口松松的', '头热热的', '小手抖抖' 等）
  - `calmingMethod?: string`（平复方式，如 '深呼吸', '喝温水'）
  - `note?: string`（文字备注）

### 6.2 求助与拥抱事件
- `HugEvent`:
  - `id: string`
  - `timestamp: string`
  - `toParent: '爸爸' | '妈妈' | '当前照顾者'`
  - `acknowledged: boolean`

### 6.3 思考练习与困难拆解历史
- `DifficultyBreakerHistory`（存储在 `localStorage: diff_breaker_history_v1`）：
  - `id: string`
  - `presetId: string`（'diff-two-homes' | 'diff-blocks-broken' | 'diff-friend-ask'）
  - `fenCompleted: boolean`
  - `tongCompleted: boolean`
  - `selectedActions: string[]`
  - `completedAt: string`

### 6.4 游戏化成就数据（勋章）
- `MedalRecord`:
  - `id: string`
  - `type: 'sun' | 'rain'`
  - `category: 'weather' | 'breaker' | 'leaves' | 'hug'`
  - `unlocked: boolean`
  - `unlockedAt?: string`

### 6.5 高度敏感的儿童私密心事与表达
- `childQuotes: Record<string, string>`：儿童完成情境叶时的自由口述引用。
- `missNotes: Array<{ id: string; text: string; date: string }>`：两个家的桥中的“想念盒子”，记录孩子对另一位家长的私密想念文本（例如：“想念爸爸带我去池塘看小鸭子”）。
- `starlightTraits: string[]`：星光小屋中的自我特征描述（例如：“画画很仔细”, "有两个温暖的家"）。
- `packedItems: string[]`：换家小书包中孩子勾选的随身物品（如安心小熊玩偶）。

### 6.6 数据合规风险
1. `childQuotes`、`missNotes` 包含孩子自由文字表达，且在 Google Drive 同步模块中被明文打包上传。
2. 缺乏 Pseudonymous ID 抽象，没有家庭 ID（`familyId`）和受试 ID 隔离。

---

## 7. 当前抱抱键实际发生什么

### 7.1 代码执行链
在 `src/components/ChildIsland/HugButton.tsx` 与 `src/context/AppContext.tsx`：
1. 孩子点击“抱抱键”：
   - 播放合成暖心音效 `sounds.playWarmHug()`；
   - 本地状态调用 `requestHug('妈妈' | '爸爸')`；
   - 在前端内存数组 `hugEvents` 中追加一个对象 `{ id, timestamp, toParent, acknowledged: false }`；
   - 将前端上下文中的 `activeHugNotice` 设为 `true`；
   - **自动解锁勋章**：`unlockMedal('hug-courage')`（将求助行为变成了成就收集）；
2. 前端展示承诺气泡（`HugButton.tsx` 第 50-67 行）：
   - 显示标题：**“已告诉大人啦”**
   - 描述文本：**“今晚在妈妈家身边，静静等拥抱”**
   - 弹出气泡：**“❤️ 已给身边的家长发轻提醒。大人手机收到了一条：‘孩子想要抱抱’。无论发生什么，你都被好好爱着！”**
3. 导航栏响应：
   - 在同一个屏幕的顶部导航栏（`Navbar.tsx`）上，弹出一个红色的跳动药丸按钮：**“孩子要抱抱！”**
   - 只要点击该药丸，页面直接无条件跳入“家长教练端”，并将 `activeHugNotice` 设为 `false`。

### 7.2 严重违反的交互契约
1. **对孩子不诚实（虚假陈述）**：
   - 现实中**没有任何网络请求发出**，**没有任何短信/推送发送到任何大人的手机**，大人的手机根本没有“收到一条消息”。
   - 这是对 6 岁儿童的直接撒谎，违背了“最高优先级 2：对孩子诚实”和“只能向孩子陈述已知事实，不得陈述预测性承诺”。
2. **将求助动作与勋章挂钩**：
   - 按下抱抱键即刻奖励“勇气勋章”，违反了“禁止事项：不得添加积分/随机奖励/对心理动作发放奖章”。
3. **混淆三个独立维度**：
   - 完全未区分 `communication status`（发送状态）、`care responsibility`（照顾责任）与 `co-presence`（真人是否到场）。
   - 把“界面按钮被点击”虚构成“大人已经收到并即将前来”。
4. **App 不退场**：
   - 真人到场后 App 应该退场，但当前代码在同一屏幕上不断闪烁脉冲动画（`animate-pulse`），继续吸引注意力。

---

## 8. 当前通知流

### 8.1 现状诊断
- **无任何远程通讯管道**：没有 WebSocket、没有 SSE（Server-Sent Events）、没有 Web Push、没有 Firebase Cloud Messaging (FCM)、没有 Webhook、没有 Twilio 短信。
- **纯内存布尔值**：通知流唯一的承载体是 React Context 内部的单个布尔变量：
  ```ts
  const [activeHugNotice, setActiveHugNotice] = useState<boolean>(false);
  ```
- **同屏回环**：孩子在屏幕中央按下抱抱，通知直接显示在该屏幕上方的导航栏。如果家长不坐在孩子旁边看着同一台设备，没有任何人能够接收到此通知。
- **跨会话丢失**：一旦刷新页面或关闭浏览器标签，该“通知”即刻丢失，无排队与持久化状态机。

---

## 9. 当前移动端 Overflow 原因

经过对 360px Viewport（标准窄屏 Android 手机）及 390px（标准 iPhone）的 CSS 布局检查，发现以下导致横向溢出（Horizontal Overflow）和垂直遮挡的根源：

1. **`Navbar.tsx` 在小屏幕上强制单行无换行**：
   - 第 49-71 行：`<div className="max-w-6xl mx-auto flex items-center justify-between gap-3">`
   - 左侧有 Logo + 标题 + 副标题；右侧挤入了 5 个按钮（抱抱提示、静音、云端硬盘、关于、切换家长端）。
   - 在 360px 宽度下，右侧按钮组直接将整个页面宽度撑破至 440px 以上，导致整个应用在手机上出现横向晃动。
2. **5 列与 7 列网格硬编码，缺乏断点响应**：
   - `WeatherStationModal.tsx`（第 237、294 行）：`<div className="grid grid-cols-5 gap-2">`。在 360px 下，每列宽度不足 50px，包含文字后必然溢出或重叠。
   - `ThoughtDetectiveLabModal.tsx`（第 192 行）：`<div className="grid grid-cols-5 gap-1.5 sm:gap-2">`。顶部 5 个工具选择按钮挤在单行。
   - `TwoHomesBridgeModal.tsx`（第 151 行）：`<div className="grid grid-cols-7 gap-1 text-center">`。7 天日程脚印在弹窗内强制排成 7 列。
3. **固定像素宽度弹窗与绝对定位元素越界**：
   - `HugButton.tsx`（第 61 行）：提示气泡声明为固定宽度 `w-64`（256px），并设置 `left-1/2 -translate-x-1/2`。当抱抱键靠近手机屏幕左侧或右侧边缘时，气泡直接超出视口边界。
4. **弹窗未预留底部安全操作区（Safe Area）**：
   - 多个 Modal（如 `ThoughtDetectiveLabModal.tsx`、`DifficultyBreakerModal.tsx`）采用 `max-h-[92vh] overflow-y-auto`，其底部的“下一步/完成”固定按钮在移动端软键盘弹出或底部导航栏遮挡时，内容滚动到底部被遮挡，违反了儿童 UI 标准中“内容滚动区域必须为底部固定支持区留足空间”的规定。

---

## 10. 当前 Child UI 中暴露的内部设计术语

在应当纯净、面向 6 岁儿童的小岛界面中，充斥着大量内部工程师/设计者术语，严重违反了契约要求：

| 暴露位置 | 实际代码 / 文本 | 违反的契约标准 |
| :--- | :--- | :--- |
| `Navbar.tsx` (第 65 行) | **“退后一步 · 分、通、择三种姿态 · 离异场景第一批叶”** | 绝不能把家庭结构（离异）作为孩子的核心身份印在儿童顶栏；禁止把“分/通/择”设计术语灌输给孩子 |
| `IslandHome.tsx` (第 433 行) | 情绪天气站卡片角标：**“P2 觉察”** | 禁止把 P1/P2/P3/P4/P5 柱子编号暴露给儿童 |
| `IslandHome.tsx` (第 452 行) | 故事林卡片右上角角标：**“叶的主场 · MVP”** | 将内部研发代号“叶的主场”、“MVP”直接呈现在儿童卡片上 |
| `IslandHome.tsx` (第 490 行) | 想法侦探社卡片角标：**“P3 工具坊”** | 暴露内部架构柱子编号 P3 |
| `IslandHome.tsx` (第 517 行) | 勇气说话屋卡片角标：**“P4 表达”** | 暴露内部架构柱子编号 P4 |
| `IslandHome.tsx` (第 544 行) | 两个家的桥卡片角标：**“P1 安全感”** | 暴露内部架构柱子编号 P1 |
| `IslandHome.tsx` (第 571 行) | 星光小屋卡片角标：**“P5 我是谁”** | 暴露内部架构柱子编号 P5 |
| `IslandHome.tsx` (第 376 行) | 思考拆解台横幅：**“分·通·择 思考拆解台”** | 抽象成人学术术语未转化为儿童具象化隐喻 |
| `DifficultyBreakerModal.tsx` | **“Step 1: 分 (辨别事实与想法)”**<br>**“Step 2: 通 (换位与正面反面)”**<br>**“Step 3: 择 (做选择与踏脚石)”** | 暴露阶段编号 Step 1/2/3 及设计分类法 |

---

## 11. 当前 Accessibility 问题

对照儿童标准规范（儿童正文 >= 18px、重要文字 >= 16px、交互热区 >= 56x56px、主要按钮高 >= 64px、voice-first、prefers-reduced-motion）：

1. **字体过小（严重不达标）**：
   - 全局子组件充斥着 `text-[10px]`、`text-xs` (12px)、`text-[11px]`。
   - 示例：`IslandHome.tsx` 描述文本全为 `text-xs`（12px）；`ThoughtDetectiveLabModal.tsx` 选项文本全为 12px；`Navbar.tsx` 副标题 `text-[10px]`。
   - 6 岁儿童识字量有限，正文普遍低于 18px 且字号过细，导致阅读认知负荷过大。
2. **交互触控目标过小（不满足 >= 56x56px）**：
   - `WeatherStationModal.tsx` 的 5 种天气选择按钮：内边距仅 `p-2`，实际物理渲染尺寸仅约 42x46px。
   - 工具切换按钮（`ThoughtDetectiveLabModal.tsx` 第 193-267 行）：高度仅约 40px。
   - 主要操作按钮（如 `DifficultyBreakerModal.tsx` 的“下一步”按钮）：高度仅 `py-2.5`（约 42px），远低于规范要求的 `>= 64px`。
3. **语音辅助（Voice-First）覆盖不足**：
   - 困难拆解台（`DifficultyBreakerModal.tsx`）中的选项卡片只有文字，无自动语音朗读按钮；
   - 两个家的桥（`TwoHomesBridgeModal.tsx`）的换家清单只有文字图标，无朗读；
   - 不识字的孩子无法独立在无成人协助下使用。
4. **动画未适配 `prefers-reduced-motion`**：
   - 广泛使用了 `animate-pulse`、`animate-bounce`、`animate-ping` 等 Tailwind 预设动画类；
   - 未包含 `motion-reduce:animate-none`，对前庭功能敏感或注意力缺陷儿童不友好。
5. **胜利动画与奖章滥用**：
   - `DifficultyBreakerModal.tsx`（第 640 行）：大石头粉碎步骤中包含跳跃动画（`animate-bounce`）与“🎉 大石头被你成功粉碎啦！”的价值激励；
   - 勋章系统（`MedalsModal.tsx`、`MedalUnlockedToast.tsx`）使用游戏化通关解锁逻辑，违反了“不得做 confetti、奖章、星星奖励或胜利动画”的禁止规则。

---

## 12. 当前 Tests 覆盖

### 12.1 审查结论：**测试覆盖率为 0%（无任何测试代码）**
1. **测试框架未安装**：
   - `package.json` 的 `devDependencies` 中**没有** `vitest`、`@testing-library/react`、`jsdom`。
   - `package.json` 的 `scripts` 甚至没有定义 `"test"` 命令（仅有 `dev`, `start`, `build`, `preview`, `clean`, `lint`）。
2. **测试文件数量**：
   - 经全局检索 `*.test.ts` / `*.test.tsx` / `*.spec.ts`，在业务代码目录中**不存在任何测试文件**（匹配到的仅为 `node_modules` 内部三方包测试声明）。
3. **核心领域契约完全未经断言**：
   - 抱抱契约状态转换纯函数：不存在；
   - 围栏契约纯函数：不存在；
   - 退后一步支持等级（S0-S5）脚手架状态机：不存在；
   - 迁移叶 structureId 映射逻辑：不存在。

---

## 13. 当前 Server Authorization 风险

### 13.1 审查文件：`server.ts`
1. **零鉴权开放端点（No Auth Middleware）**：
   - `app.post('/api/parent/weekly-report')` 没有执行任何身份验证。
   - 未提取或校验 `Authorization: Bearer <token>`，无会话 Cookie。
2. **无租户隔离（No familyId / Role / Scope Check）**：
   - 请求体直接解构不受信任的任意客户端 JSON（`req.body`）。
   - 服务端完全不过问发送请求的是儿童、家长还是网络爬虫，缺乏对当前用户角色的授权检验。
3. **API 滥用与配额消耗隐患**：
   - 任何公网客户端只要发送 POST 请求到 `/api/parent/weekly-report`，就会在服务端触发真实的 Google GenAI `gemini-3.8-flash` 大模型调用。
   - 无速率限制（Rate Limiting），无并发拦截，恶意刷量可在数秒内耗尽 GCP 项目的 Gemini API 配额。
4. **输入清洗缺失**：
   - 客户端上传的 `childObservations` 数组未经验证直接 `JSON.stringify` 拼接到系统 Prompt 中，存在提示词注入（Prompt Injection）风险。

---

## 14. 未来重构时最小修改路径

为实现工程原则与交互契约合规，建议在后续阶段采取如下精简、受控、渐进的重构路径：

```
[Phase B: 基础设施与契约解耦]
       │
       ├── 1. 补齐 Vitest 与测试环境配置
       ├── 2. 抽离 Domain Rules 为纯函数 (抱抱契约、围栏契约、退后一步状态机)
       └── 3. 清理儿童端暴露的违规术语 (P1-P5, 离异标签, MVP, 抽象分类)
       │
[Phase C: 契约矫正与儿童 UI 改造]
       │
       ├── 4. 纠正抱抱键 (去除虚假承诺与勋章，严格区分发送/责任/到场三维度)
       ├── 5. 移除游戏化违规特性 (下架勋章馆、消除成就弹窗与胜利奖励)
       ├── 6. 改造触控热区与字号标准 (>=56px, 按钮>=64px, 正文>=18px)
       └── 7. 解决 360px 响应式溢出 (修复导航栏与 5/7 列网格)
       │
[Phase D: 边界隔离与服务端安全加固]
       │
       ├── 8. 物理分离 Child 与 Parent 路由/页面入口
       ├── 9. 加固 server.ts (增加鉴权校验、角色检查、防滥用频控)
       └── 10. 收敛 Google OAuth Scopes，确保儿童自由记录 Local-Only
```

---

## 建议的 Phase B 文件清单

在接下来的 **Phase B** 中，优先集中于**建立领域纯函数、测试基础设施以及清理违规儿童端术语**，避免一次性大范围重写。建议的最小修改文件清单如下：

### 1. 依赖与配置
- `package.json`（仅补充 `vitest`, `@testing-library/react`, `jsdom` 与 `"test": "vitest run"` 脚本）
- `vite.config.ts`（增加 Vitest 测试环境配置）

### 2. 领域服务与契约纯函数（新增纯逻辑文件，不依赖 React）
- `src/domain/contracts/hugContract.ts`（抱抱契约状态机：状态维度、陈述事实、失败/未确认模型）
- `src/domain/contracts/fenceContract.ts`（安全围栏纯函数：底线拦截、禁止天平与双面币重开）
- `src/domain/contracts/stepBackScaffold.ts`（退后一步支持等级 S0-S5 纯函数）
- `src/domain/contracts/__tests__/hugContract.test.ts`（Vitest 单元测试）
- `src/domain/contracts/__tests__/fenceContract.test.ts`（Vitest 单元测试）
- `src/domain/contracts/__tests__/stepBackScaffold.test.ts`（Vitest 单元测试）

### 3. 儿童端违规术语清理与契约对齐（现有文件修改）
- `src/components/Navbar.tsx`（移除儿童可见的“离异”与设计术语副标题）
- `src/components/ChildIsland/IslandHome.tsx`（清理 P1-P5 角标、“叶的主场 · MVP”标识，修正术语）
- `src/components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal.tsx`（移除“Step 1/2/3 分通择”暴露及胜利用语，解除与勋章的耦合）
- `src/components/ChildIsland/HugButton.tsx`（修正不实提示语，取消勋章派发）
- `src/context/AppContext.tsx`（解耦勋章与情绪/求助记录，接入规范的数据契约）

---
*报告生成完毕。未修改任何业务代码，未安装依赖，等待 Phase B 指令。*
