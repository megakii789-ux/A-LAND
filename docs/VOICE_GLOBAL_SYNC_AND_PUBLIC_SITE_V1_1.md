# A-LAND V1.1 全站四角色语音一致性修复与公开域名实体验收报告

- **版本基线**：`preview@a7e13c936c84d00f9001973034b504e7581aa652` 升级至 V1.1
- **GitHub 分支状态**：
  - `public-live`（正式生产分支，指向最新验收通过提交）
  - `preview`（持续开发预览分支，与 `public-live` 同步）
  - `main` 与 `public-hold`（严格保持原状，未覆盖、未删除）
- **真实公开域名（Production Branch: `public-live`）**：`https://qingyu-island-preview.pages.dev`（`HTTP 200 OK`，无痕免登录直达）
- **预览分支别名（Preview Branch: `preview`）**：`https://preview.qingyu-island-preview.pages.dev`（受 Cloudflare 账户级 `*.qingyu-island-preview.pages.dev` Zero Trust 通配符策略保护，返回 `302` 至 Cloudflare Access）

---

## 一、实际修复内容

### 1. P0：统一 `NarrationSession` 语音会话状态，彻底消除角色切换后的语音与字幕残留

- **核心修改文件**：
  - `src/utils/speech.ts`
  - `src/domain/voice/voiceLineRegistry.ts`
  - `src/components/ChildIsland/ChildAudioBar.tsx`
  - `src/components/ChildIsland/CompanionBanner.tsx`
  - `src/components/ChildIsland/Personalization/PersonalizationSettingsModal.tsx`
  - `src/components/Audio/VoiceSystemAuditionModal.tsx`
  - `src/components/ChildIsland/TwoHomesBridge/TwoHomesBridgeModal.tsx`
  - `src/components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal.tsx`
- **状态模型**：在 `speechNarrator` 内部维护唯一的 `NarrationSession`：
  - 字段包含：`lineId`、`sceneId`、`companionId`、`voiceProfileId`、`targetVoiceName`、`text`、`playbackSessionId`、`playbackStatus`（`'idle' | 'playing' | 'paused' | 'completed' | 'cancelled'`）、`sourceType`、`voiceSourceLabel`、`emotionTone`、`updatedAt`。
- **七项核心机制**：
  1. **旧音频与延迟回调即时取消**：切换伙伴时递增 `activeRunToken`、清理 `prosodyTimers` 分句韵律定时器，并停止旧 `HTMLAudioElement` 与 `speechSynthesis` 队列。
  2. **角色专属自我介绍自动改写**：`adaptCompanionSelfIntroText()` 自动识别 `companion.self_intro.*`、`companion.greeting.*`、`audition.sample.*` 以及包含旧伙伴自称（如“我是果果”）的文本，在伙伴切换时立即替换为新伙伴的自我介绍，确保点击“重听”绝不会读出旧角色名字。
  3. **旧字幕与旧声源标签同步刷新**：`ChildAudioBar` 与 `CompanionBanner` 订阅 `NarrationSession`，角色切换后字幕、头像、声线徽章同步更新。
  4. **朗读中切换从句首重读**：若切换时 `playbackStatus === 'playing'`，立即停止旧音频并用新伙伴声线从当前句首重新朗读，零叠音。
  5. **暂停态切换不误播**：若切换时 `playbackStatus === 'paused'`，仅更新会话角色、声线与文本，保持暂停态，不自动继续播放。
  6. **空闲态切换不乱播**：若切换时未在朗读（`idle` / `completed` / `cancelled`），仅同步更新待重听的 `NarrationSession`，不无故触发整段故事自动播放。
  7. **试听模式隔离与还原**：`VoiceSystemAuditionModal` 进入临时试听时保存 `preAuditionSnapshot`，取消或关闭弹窗时完整还原原伙伴身份及试听前的重听文本。

### 2. P0：全站四角色语音覆盖检查与 548 条预录神经语音库

- **核心修改文件**：
  - `src/domain/voice/voiceLineRegistry.ts`
  - `scripts/generate-tts-assets.py`
  - `src/data/ttsManifest.ts`
  - `public/audio/tts/manifest.json` 及 `public/audio/tts/*.mp3`
- **全站调用分类台账（`VOICE_CALL_SITE_CATALOG`）**：
  - `FIXED_LINE`（固定台词）：覆盖首页问候、简短自我介绍、声音试听样音、双向小桥 5 大入口及 4 条分支、大困难拆解台、平静角、求助入口、故事森林、3 个互动游戏，**100% 具备四角色独立预录 MP3**。
  - `FINITE_PARAM_COMBO`（有限参数组合）：覆盖首页伙伴会话记忆问候（5 类活动记忆 × 问候前缀）、天气站情绪回应，**100% 具备四角色独立预录 MP3**（并在 `speech.ts` 中支持“问候前缀 + 记忆句子”复合预录匹配）。
  - `DYNAMIC_BEHAVIOR_FEEDBACK`（动态行为反馈）与 `FREE_INPUT_OR_UNBOUNDED`（自由输入）：优先匹配四角色分段预录模板；未命中时降级至当前角色专属 Web Speech 参数，**严禁静默借用其他角色的 MP3**。当设备仅提供 `<= 1` 种中文系统语音时，在诊断信息中如实记录 `systemVoiceLimitationNote`。
- **预录音频规模**：新增 30 组核心台词 × 4 角色 = **120 条** Edge Neural TTS 预录音频（果果 `XiaoyiNeural`、贝贝 `XiaoxiaoNeural`、天天 `YunxiNeural`、奇奇 `YunxiaNeural`），总预录 MP3 数量从 428 条扩充至 **548 条**。`auditGlobalFourCompanionCoverage()` 审计缺失数为 `0`（覆盖率 `100%`）。

### 3. P1：换家情绪语调（`emotionTone`）真实可听节奏

- **核心修改文件**：`src/utils/speech.ts`、`src/domain/transition/transitionExperienceEngine.ts`
- **实现方式**：`buildProsodyCadencePlan(text, emotionTone, baseRate, basePitch)` 根据 5 种换家情绪语调生成真实的分句停顿与语速/音高包络（`ProsodyCadencePlan`）：
  - `light-everyday`（轻松日常）：`rateScale = 1.03`，分句停顿 `140ms`，句间停顿 `220ms`，节奏轻快自然。
  - `warm-dual-empathy`（温柔双向共情）：`rateScale = 0.91`，分句停顿 `460ms`，句间停顿 `640ms`，句尾逐句放缓（`[0.93, 0.90, 0.88]`）。
  - `calm-fact-clarity`（事实与猜测澄清）：`rateScale = 0.95`，分句停顿 `340ms`，句间停顿 `480ms`，吐字平稳清晰。
  - `gentle-inquiry`（温和探询具体原因）：`rateScale = 0.93`，分句停顿 `410ms`，句间停顿 `560ms`。
  - `protective-safety`（安全保护提示）：`rateScale = 0.89`，分句停顿 `520ms`，句间停顿 `720ms`，沉稳坚定。
- **双通道真实执行**：预录 MP3 播放时通过分句边界定时器实时调节 `HTMLAudioElement.playbackRate`；Web Speech 降级时按子句切分并插入真实的句间停顿定时器。

### 4. P1：双向小桥首次中性入口

- **核心修改文件**：`src/components/ChildIsland/TwoHomesBridge/TwoHomesBridgeModal.tsx`、`src/domain/transition/transitionExperienceEngine.ts`
- **修复效果**：
  - 首次打开双向小桥且无历史进度时，`feelingSet` 为空数组 `[]`，不默认选中“不舍得这边 + 也期待那边”。
  - 首屏展示中性五选一入口（`data-testid="bridge-neutral-entry-gate"`）：`今天轻松开心`、`有点舍不得`、`担心别人的感受`、`有些害怕或说不清`、`想先体验一个小朋友的故事`。
  - 当孩子已有保存的场景进度时，重新打开自动恢复此前进度并展示 `bridge-restored-progress-banner`，不覆盖孩子此前的选择。

---

## 二、核心反例复现与新增自动化测试

新增专项测试文件 `src/tests/voiceGlobalSyncV1_1.test.tsx`（7 项测试）并更新 `src/tests/sprint4_2GlobalVoiceSync.test.tsx`（34 项测试）与 `src/tests/transitionExperienceV1.test.tsx`（24 项测试），全量 **36 个测试文件、373 项测试 100% 通过**：

| 反例场景 | 验证方式与结果 |
| --- | --- |
| 果果朗读“我是果果” → 切换奇奇 → 点击重听 | **通过**：重听内容自动切换为 `"我是奇奇！森林里起风时，我会停下来听一听自己的心跳声。"`（或奇奇完整问候），音源为 `starlight-companion-*.mp3`（`zh-CN-YunxiaNeural`），字幕与头像同步为奇奇 |
| 果果 → 贝贝 → 天天 → 奇奇连续切换 | **通过**：每次切换后 `NarrationSession.companionId`、`voiceProfileId`、字幕文本与预录音源 URI 均无旧角色残留 |
| 播放进行中切换角色 | **通过**：旧 `HTMLAudioElement` 立即 `pause()` 并归零，新角色从当前句首立即发声，无双音叠加 |
| 暂停状态下切换角色 / 空闲状态下切换角色 | **通过**：暂停态切换后保持 `paused` 不误播；空闲态切换后保持 `idle/completed` 不无故自动朗读整段故事 |
| 临时试听其他角色后取消/关闭 | **通过**：恢复正式伙伴身份及试听前的 `NarrationSession` 重听内容 |
| 双向小桥首次进入默认状态检查 | **通过**：首次进入 `feelingSet === []`，展示 5 个中性起点卡片；选择后再次打开正常恢复历史进度 |

---

## 三、公开域名与真实浏览器实体验收结果

### 1. 构建与部署版本信息

- **GitHub 分支与提交**：`public-live` / `preview`（最新代码提交 `d89181983f2a3eedac65f7b733505ec79a961b69`）
- **正式公开根域**：`https://qingyu-island-preview.pages.dev`（Production Branch 已绑定为 `public-live`）
- **线上运行时版本清单**：`https://qingyu-island-preview.pages.dev/version.json`（`buildStatus: "VERIFIED_QUALITY_GATE_PASSED"`）

### 2. 无登录、无缓存真实 Playwright 浏览器验收记录（`1440×900` & `390×844`）

- **验证产物**：`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/v1_1-live-public-verification.json`
- **关键实测指标**：
  - **首页加载与响应式**：`homeLoaded: true`，桌面端 `1440×900` 与手机端 `390×844` 均 `zeroHorizontalOverflow: true`（`scrollWidth <= innerWidth`）。
  - **强制回归实测（果果 → 奇奇 → 重听）**：
    - 切换前果果问候：`"你好呀！我是果果。我是小松鼠果果，我喜欢收捡森林里的每一片小树叶和秘密线索！"`
    - 切换奇奇并点击重听后：横幅显示 `"奇奇在身边"`，语音控制条徽章显示 `"奇奇 · 星光守护"`，声源标签显示 `"真实神经音源 · 奇奇 (星光守护 · zh-CN-YunxiaNeural)"`，实时字幕显示 `"你好呀我是奇奇我是小鹿奇奇森林里起风时我会停下来听一听自己的心跳声"`，实际加载音频 URI 为 `/audio/tts/starlight-companion-fbd0fee64949a515.mp3`。
  - **双向小桥中性入口与各分支**：首次打开展示 `bridge-neutral-entry-gate`（5 个选项），点击 `今天轻松开心` 正常进入 `ordinary-happy-interactive-panel`；手机端 `390×844` 点击 `担心别人的感受` 正常进入 `slice-b-interactive-panel`，且支持四角色神经语音播放。

---

## 四、已知环境限制与未解决体验说明

1. **Cloudflare Access 通配符子域限制**：`*.qingyu-island-preview.pages.dev`（含 `https://preview.qingyu-island-preview.pages.dev`）存在账户级 Zero Trust Access 策略拦截；正式公开根域 `https://qingyu-island-preview.pages.dev` 已通过 `public-live` 生产分支实现 100% 免登录公开访问。
2. **极端开放文本的本地系统语音限制**：对于用户在输入框中自由输入的任意未预录文字，会降级使用浏览器本地 `speechSynthesis`；若宿主机仅安装单一中文系统语音，`speechNarrator` 会在诊断状态中明确记录 `systemVoiceLimitationNote`，不虚报四角色独立系统声线。
