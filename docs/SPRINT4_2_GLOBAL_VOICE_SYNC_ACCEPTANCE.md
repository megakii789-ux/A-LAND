# A-LAND｜Sprint 4.2 四角色全域语音同步与配音体验重构验收报告

- **执行工作区**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **基线提交**：`preview@73c3be69359436e0477335539cded0e027ff765b`
- **验收状态**：**全部通过（TypeScript 零报错 · 34 个测试套件 / 342 项测试全绿 · 256 条四角色独立神经语音资源 · 24 项 4×6 真浏览器矩阵与 10 项负向回归全通过）**

---

## 一、原有角色声音不同步的根因分析

在 Sprint 4.2 审计中，定位并彻底修复了导致“换了伙伴头像但声音不变 / 跨角色串音 / 音效误关人声”的七项核心根因：

1. **多套竞争的角色状态源与挂载耦合**：
   - 原实现将 `speechNarrator.setProfile()` 与 `sounds.setTemplate()` 放在 `CompanionBanner.tsx` 的局部 `useEffect` 中，且 `localStorage.getItem('child_voice_profile')`、`VoiceSystemAuditionModal` 试听选择、`manualVoiceOverride` 均可独立覆写全局声线，未以 `personalization.companionId` 作为唯一事实源。
2. **音源回退（`PREBAKED_TTS_BY_DEFAULT_KEY`）导致跨角色串音**：
   - 原 `ttsManifest` 仅对首句问候生成了四角色音频，其余 50 段文本仅生成了单一角色音频；`findPrebakedEntry()` 在找不到当前角色专属音频时回退到 `PREBAKED_TTS_BY_DEFAULT_KEY`，导致选择奇奇或天天时实际播放贝贝（`warm-sister`）或果果（`playful-buddy`）的 MP3，同时界面仍标称为“奇奇专属神经语音”。
3. **朗读中途切换角色缺少会话并发保护（Race Condition）**：
   - 原 `speech.ts` 的 `HTMLAudioElement` 回调（`onplay` / `onended` / `onerror`）、分句定时器 `pauseTimer` 及 `SpeechSynthesisUtterance` 未绑定递增的 `playbackSessionId`，导致旧角色音频在切换或中断后仍可能触发回调或覆盖新角色的播放状态。
4. **试听面板未区分“临时试听”与“正式切换全岛伙伴”**：
   - 原 `VoiceSystemAuditionModal.tsx` 点击任意声线卡片即直接修改全局 `speechNarrator` 声线且不同步 `personalization.companionId`，关闭弹窗后造成“头像与声音分裂”。
5. **儿童快捷声控栏将“音效开关”与“伙伴语音”强耦合**：
   - 原 `ChildAudioBar.tsx` 将 `sounds.getMuted()` 同时用于控制合成器音效与伙伴朗读，孩子只想关掉点击音效时把伙伴朗读也一并静默。
6. **故事森林与露营夜固定前缀造成角色混音**：
   - 原 `StoryGroveModal.tsx` 的 `getPartnerMemoryFeedback` 与露营反馈文案硬编码了其他伙伴名字，未随当前 `companionId` 动态对齐，也未建立多说话人声线路由。
7. **单一系统语音环境下的虚假专属声线标注**：
   - 当浏览器 `speechSynthesis.getVoices()` 仅提供 1 个中文系统语音时，原界面仍对 Web Speech 回退分支显示 4 种专属角色音色名称，未诚实标注系统通用语音替代。

---

## 二、四角色映射与音源覆盖表

### 2.1 全域唯一角色映射契约（单一事实源：`personalization.companionId`）

| 伙伴 | Companion ID | Voice Profile | 目标神经人声 | 声学泛音模板（Web Audio DSP） |
| :--- | :--- | :--- | :--- | :--- |
| **果果**（小松鼠） | `guoguo_squirrel` | `playful-buddy` | `zh-CN-XiaoyiNeural` | 元气伙伴 · 清脆木琴与灵动泛音 |
| **贝贝**（小海獭） | `beibei_otter` | `warm-sister` | `zh-CN-XiaoxiaoNeural` | 暖阳姐姐 · 温润马林巴与柔波共鸣 |
| **天天**（小浣熊） | `tiantian_raccoon` | `gentle-guide` | `zh-CN-YunxiNeural` | 和风守护 · 沉稳木质低音与清晰节拍 |
| **奇奇**（小鹿） | `qiqi_deer` | `starlight-companion` | `zh-CN-YunxiaNeural` | 星光守护 · 空灵水晶竖琴与森林微风 |

### 2.2 预制神经语音覆盖统计（`public/audio/tts/` & `src/data/ttsManifest.ts`）

- **主线台词组数**：67 组（包含 4 段伙伴专属自我介绍 + 63 段全岛共享主线台词，涵盖情绪天气站、绿草呼吸角、困难拆解器、勇气小屋、双家小桥、星光树屋、蜡笔侦探、朋友问起家里事、轮流玩小船、故事森林《一只杯子》《小火车》及树屋露营夜全套反馈）。
- **四角色全量生成音频数**：`4 + 63 × 4 = 256` 个独立 MP3 音源（全部包含毫秒级 `WordBoundary` 字词高亮时间戳）。
- **跨角色默认回退**：已彻底移除 `PREBAKED_TTS_BY_DEFAULT_KEY`；`findPrebakedEntry(text, profileId)` 严格校验 `entry.profileId === targetProfile`，杜绝任何跨角色 MP3 冒充。

| 角色 Voice Profile | 神经声源模型 | 独立 MP3 数量 | 主线共享台词覆盖率 | 同一主线台词二进制校验示例（《一只杯子》开场引导） |
| :--- | :--- | :---: | :---: | :--- |
| `playful-buddy`（果果） | `zh-CN-XiaoyiNeural` | **64** | **100% (63/63 + 专属问候)** | `/audio/tts/playful-buddy-a77124c17461b59d.mp3` (`50,976 B`, SHA256 `1daa20d25053ef62...`) |
| `warm-sister`（贝贝） | `zh-CN-XiaoxiaoNeural` | **64** | **100% (63/63 + 专属问候)** | `/audio/tts/warm-sister-2d5ec67de0947276.mp3` (`55,440 B`, SHA256 `88a3b72e4f66fc50...`) |
| `gentle-guide`（天天） | `zh-CN-YunxiNeural` | **64** | **100% (63/63 + 专属问候)** | `/audio/tts/gentle-guide-50af67fb2b64edb0.mp3` (`52,992 B`, SHA256 `5bf25a093684270f...`) |
| `starlight-companion`（奇奇） | `zh-CN-YunxiaNeural` | **64** | **100% (63/63 + 专属问候)** | `/audio/tts/starlight-companion-0231569bec425503.mp3` (`55,440 B`, SHA256 `11998e71794b91e8...`) |
| **合计** | 4 种独立神经声线 | **256** | **100% 真实同角色音源** | **4 个 MP3 文件 SHA256 哈希与字节结构完全独立** |

---

## 三、24 项（4 角色 × 6 场景）矩阵验证结果

通过 `src/tests/sprint4_2GlobalVoiceSync.test.tsx` 组件集成测试与 `scripts/verify-sprint4_2-voice.mjs` Playwright 真浏览器端到端验证，逐一核验 `window.__SPEECH_NARRATOR_DIAGNOSTICS__` 暴露的实时诊断字段：

| # | 伙伴角色 | 场景模块 | `companionId` | `requestedVoiceProfile` | `actualSourceProfile` | `sourceType` | `neuralVoiceName` | 实际播放音频 URI | 结果 |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :-: |
| 01 | **果果** | 1. 首页伙伴问候 | `guoguo_squirrel` | `playful-buddy` | `playful-buddy` | `prebaked-mp3` | `zh-CN-XiaoyiNeural` | `/audio/tts/playful-buddy-baf74c7a798320c8.mp3` | PASS |
| 02 | **果果** | 2. 情绪天气站与呼吸平静角 | `guoguo_squirrel` | `playful-buddy` | `playful-buddy` | `prebaked-mp3` | `zh-CN-XiaoyiNeural` | `/audio/tts/playful-buddy-518ee17064a4bf59.mp3` | PASS |
| 03 | **果果** | 3. 蜡笔侦探 | `guoguo_squirrel` | `playful-buddy` | `playful-buddy` | `prebaked-mp3` | `zh-CN-XiaoyiNeural` | `/audio/tts/playful-buddy-737cbd99a0bc81d8.mp3` | PASS |
| 04 | **果果** | 4. 朋友问起家里事 | `guoguo_squirrel` | `playful-buddy` | `playful-buddy` | `prebaked-mp3` | `zh-CN-XiaoyiNeural` | `/audio/tts/playful-buddy-a907873494e79989.mp3` | PASS |
| 05 | **果果** | 5. 轮流玩小船 | `guoguo_squirrel` | `playful-buddy` | `playful-buddy` | `prebaked-mp3` | `zh-CN-XiaoyiNeural` | `/audio/tts/playful-buddy-69609765da209e02.mp3` | PASS |
| 06 | **果果** | 6. 故事森林与露营夜 | `guoguo_squirrel` | `playful-buddy` | `playful-buddy` | `prebaked-mp3` | `zh-CN-XiaoyiNeural` | `/audio/tts/playful-buddy-a77124c17461b59d.mp3` | PASS |
| 07 | **贝贝** | 1. 首页伙伴问候 | `beibei_otter` | `warm-sister` | `warm-sister` | `prebaked-mp3` | `zh-CN-XiaoxiaoNeural` | `/audio/tts/warm-sister-3f8b18c96d7ca94d.mp3` | PASS |
| 08 | **贝贝** | 2. 情绪天气站与呼吸平静角 | `beibei_otter` | `warm-sister` | `warm-sister` | `prebaked-mp3` | `zh-CN-XiaoxiaoNeural` | `/audio/tts/warm-sister-0da5a56f155f453a.mp3` | PASS |
| 09 | **贝贝** | 3. 蜡笔侦探 | `beibei_otter` | `warm-sister` | `warm-sister` | `prebaked-mp3` | `zh-CN-XiaoxiaoNeural` | `/audio/tts/warm-sister-4053a60bf6d615c0.mp3` | PASS |
| 10 | **贝贝** | 4. 朋友问起家里事 | `beibei_otter` | `warm-sister` | `warm-sister` | `prebaked-mp3` | `zh-CN-XiaoxiaoNeural` | `/audio/tts/warm-sister-02b4a2a037408253.mp3` | PASS |
| 11 | **贝贝** | 5. 轮流玩小船 | `beibei_otter` | `warm-sister` | `warm-sister` | `prebaked-mp3` | `zh-CN-XiaoxiaoNeural` | `/audio/tts/warm-sister-d3cd94dff6ca2be3.mp3` | PASS |
| 12 | **贝贝** | 6. 故事森林与露营夜 | `beibei_otter` | `warm-sister` | `warm-sister` | `prebaked-mp3` | `zh-CN-XiaoxiaoNeural` | `/audio/tts/warm-sister-2d5ec67de0947276.mp3` | PASS |
| 13 | **天天** | 1. 首页伙伴问候 | `tiantian_raccoon` | `gentle-guide` | `gentle-guide` | `prebaked-mp3` | `zh-CN-YunxiNeural` | `/audio/tts/gentle-guide-87eccc780cd48a04.mp3` | PASS |
| 14 | **天天** | 2. 情绪天气站与呼吸平静角 | `tiantian_raccoon` | `gentle-guide` | `gentle-guide` | `prebaked-mp3` | `zh-CN-YunxiNeural` | `/audio/tts/gentle-guide-fa8333e5ba620775.mp3` | PASS |
| 15 | **天天** | 3. 蜡笔侦探 | `tiantian_raccoon` | `gentle-guide` | `gentle-guide` | `prebaked-mp3` | `zh-CN-YunxiNeural` | `/audio/tts/gentle-guide-56789cd2be9f9119.mp3` | PASS |
| 16 | **天天** | 4. 朋友问起家里事 | `tiantian_raccoon` | `gentle-guide` | `gentle-guide` | `prebaked-mp3` | `zh-CN-YunxiNeural` | `/audio/tts/gentle-guide-2ff58719d2efe388.mp3` | PASS |
| 17 | **天天** | 5. 轮流玩小船 | `tiantian_raccoon` | `gentle-guide` | `gentle-guide` | `prebaked-mp3` | `zh-CN-YunxiNeural` | `/audio/tts/gentle-guide-5c7f0e12ff40cbe4.mp3` | PASS |
| 18 | **天天** | 6. 故事森林与露营夜 | `tiantian_raccoon` | `gentle-guide` | `gentle-guide` | `prebaked-mp3` | `zh-CN-YunxiNeural` | `/audio/tts/gentle-guide-50af67fb2b64edb0.mp3` | PASS |
| 19 | **奇奇** | 1. 首页伙伴问候 | `qiqi_deer` | `starlight-companion` | `starlight-companion` | `prebaked-mp3` | `zh-CN-YunxiaNeural` | `/audio/tts/starlight-companion-fbd0fee64949a515.mp3` | PASS |
| 20 | **奇奇** | 2. 情绪天气站与呼吸平静角 | `qiqi_deer` | `starlight-companion` | `starlight-companion` | `prebaked-mp3` | `zh-CN-YunxiaNeural` | `/audio/tts/starlight-companion-69786ab0b5e1dbe3.mp3` | PASS |
| 21 | **奇奇** | 3. 蜡笔侦探 | `qiqi_deer` | `starlight-companion` | `starlight-companion` | `prebaked-mp3` | `zh-CN-YunxiaNeural` | `/audio/tts/starlight-companion-00e600ba980df764.mp3` | PASS |
| 22 | **奇奇** | 4. 朋友问起家里事 | `qiqi_deer` | `starlight-companion` | `starlight-companion` | `prebaked-mp3` | `zh-CN-YunxiaNeural` | `/audio/tts/starlight-companion-89da13adfc68182c.mp3` | PASS |
| 23 | **奇奇** | 5. 轮流玩小船 | `qiqi_deer` | `starlight-companion` | `starlight-companion` | `prebaked-mp3` | `zh-CN-YunxiaNeural` | `/audio/tts/starlight-companion-4f071102e864f4e1.mp3` | PASS |
| 24 | **奇奇** | 6. 故事森林与露营夜 | `qiqi_deer` | `starlight-companion` | `starlight-companion` | `prebaked-mp3` | `zh-CN-YunxiaNeural` | `/audio/tts/starlight-companion-0231569bec425503.mp3` | PASS |

---

## 四、10 项负向与回归测试结果

全部 10 项负向测试已固化在 [`src/tests/sprint4_2GlobalVoiceSync.test.tsx`](../src/tests/sprint4_2GlobalVoiceSync.test.tsx) 中并执行通过：

| 测试编号 | 负向验证场景 | 断言重点 | 状态 |
| :---: | :--- | :--- | :---: |
| **NEGATIVE-01** | 选择奇奇时不得返回或播放贝贝 / 果果 MP3 | 遍历全部 63 条主线台词，断言 `actualSourceProfile === 'starlight-companion'` 且 `audioUrl` 前缀为 `/audio/tts/starlight-companion-`；未知动态文本回退到 `web-speech-fallback` 而绝不借用其他角色 MP3 | **PASS** |
| **NEGATIVE-02** | 不渲染 `CompanionBanner` 的页面仍同步角色声音 | 仅挂载 `AppProvider` + 子组件（不含 `CompanionBanner`），切换 `companionId` 至天天，断言 `speechNarrator.getProfile() === 'gentle-guide'` 且播放 `zh-CN-YunxiNeural` | **PASS** |
| **NEGATIVE-03** | 朗读中途从果果切到天天，旧声音立即停止，新朗读使用天天声音 | 断言果果音频 `paused === true`、`playbackSessionId` 递增，新朗读立即采用 `gentle-guide` (`zh-CN-YunxiNeural`) | **PASS** |
| **NEGATIVE-04** | 旧音频延迟回调不得覆盖新角色状态 | 手动触发已被中断旧会话 `Audio` 实例的延迟 `onerror` / `onended` 回调，断言当前正在播放的新角色会话状态与 `speaking === true` 不受污染 | **PASS** |
| **NEGATIVE-05** | 试听面板中临时试听其他声线但不确认，退出后恢复原角色 | 当前伙伴为贝贝，打开 `VoiceSystemAuditionModal` 点击奇奇卡片临时试听，点击“退出并恢复原伙伴”，断言恢复为 `beibei_otter` / `warm-sister` | **PASS** |
| **NEGATIVE-06** | 试听面板确认切换后，伙伴 ID、语音引擎与声学模板同步更新 | 在 `VoiceSystemAuditionModal` 选择天天并点击“确认切换全岛伙伴”，断言 `personalization.companionId === 'tiantian_raccoon'`、`speechNarrator.getProfile() === 'gentle-guide'`、`sounds.getTemplate() === 'gentle-guide'` | **PASS** |
| **NEGATIVE-07** | 关闭音效（`sfxMuted = true`）后，伙伴语音仍可正常播放 | 点击 `ChildAudioBar` 的 `audio-bar-sfx-toggle` 关闭音效，断言 `sounds.getSfxMuted() === true` 且 `speechNarrator.speak()` 依然正常播放 `prebaked-mp3` | **PASS** |
| **NEGATIVE-08** | 关闭伙伴语音（`voiceEnabled = false`）后，不再播报人声但音效保持可用 | 关闭 `voiceEnabled`，断言 `speechNarrator.speak()` 仅更新文字字幕而不播放音频（`sourceType === 'muted-speech-off'`），同时 `sounds.getSfxMuted() === false` | **PASS** |
| **NEGATIVE-09** | 重置偏好或清除全部数据后，角色与声线同步回到默认果果 | 切换至奇奇后分别调用 `resetPersonalization()` 与 `clearAllData()`，断言伙伴与声线均同步回退至 `guoguo_squirrel` / `playful-buddy` | **PASS** |
| **NEGATIVE-10** | 仅 1 个系统中文语音时，不得把 Web Speech 回退显示成 4 种专属系统配音 | Mock `speechSynthesis.getVoices()` 仅含单一中文语音并朗读非预制自由输入文本，断言 `distinctSystemVoiceCount === 1` 且 `voiceSourceLabel` 诚实标注为 `系统通用语音替代 (...) · 仅预制语音具角色专属声线` | **PASS** |

---

## 五、真浏览器实际体验结论

1. **端到端真浏览器自动化与 HTTP 音频二进制核验**：
   - 启动真实 Chromium 浏览器（桌面 `1440×900` 与移动端 `390×844`），通过 `scripts/verify-sprint4_2-voice.mjs` 驱动用户真实点击完成 4 角色 × 6 场景全流程切换。
   - 对同一句故事台词在四个角色下触发的 MP3 URL 发起真实 HTTP GET 请求，返回均为 `HTTP 200`，文件体积分别为 `50,976 B`、`55,440 B`、`52,992 B`、`55,440 B`，4 个文件的 SHA256 哈希值互不相同。
2. **试听恢复与音效解耦真机验证**：
   - 在 `PersonalizationSettingsModal` 内打开 `VoiceSystemAuditionModal`，临时试听奇奇声线时顶部状态徽章清晰显示 `临时试听中：奇奇（当前全岛伙伴：贝贝）`，点击取消后回到首页点击“听问候”立即恢复贝贝 `zh-CN-XiaoxiaoNeural` 声音。
   - 在顶部 `ChildAudioBar` 关闭“音效”后点击“听问候”，伙伴语音与逐词高亮正常播放，实现了“伙伴语音 / 音效 / 环境音 / 全部静音”四通道正交解耦。
3. **移动端与桌面端布局检查**：
   - 桌面端 `1440×900` 与移动端 `390×844` 均保持 `document.documentElement.scrollWidth <= window.innerWidth`（零横向溢出），控制台零运行时错误。
