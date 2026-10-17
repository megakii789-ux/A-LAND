# A-LAND V2.3 Batch02 · Gate B0-A — Real Source Behavior & Interface Specification

## 1. Inspected Live Source Files at Frozen Baseline (`d0b497acade40bd4bbd2cc9f16e9550df2b19504`)

| File Path | Lines | Bytes | SHA-256 | Role in Batch02 |
| --- | ---: | ---: | --- | --- |
| `src/components/ChildIsland/ThoughtDetectiveLab/ThoughtDetectiveLabModal.tsx` | 873 | 45,560 | `cf9bd38411f56b4328e9895caeb89fb834517545a117bc357a29b45ce2c66d2e` | Primary «想法侦探社» modal component |
| `src/components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal.tsx` | 1,638 | 74,536 | `0d39ff838dc0e201f3d160755eb712c979fc718ddfc5f8d04bb95c7c412be36d` | Primary «困难拆解台» modal component |
| `src/visual-v2/VisualV2Shell.tsx` | 499 | 21,113 | `d28cd322b5b832a8a53f2f32f28b8db17ee2cc92ee53a02d0d47329d5b1db79d` | V2 review shell mounting both modals |
| `src/domain/cognitive/ContentAuditRegistry.ts` | 780 | 30,297 | `4b838fd90677a0d04073680cf0bb20dc1a014d9f12eb2aa0552c8fb4e48cc895` | Fail-closed `PENDING_REVIEW` content audit gate |
| `src/components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame.tsx` | 2,051 | 97,058 | `099fd7ff019c5303ecaa9456fc11eeef4f439bd0495479ca63ef443ab5548b29` | Spatial detective case game launched from Detective Lab |
| `src/components/InteractiveGames/TransferLab/TransferScenariosModal.tsx` | 619 | 28,981 | `6dd909792a76fc099d04f7ff1151d604ec3cf7770e92b5e67d0c35a0808843f2` | Unprompted transfer scenario modal launched from Detective Lab |

---

## 2. Module 1: `ThoughtDetectiveLabModal.tsx` («想法侦探社»)

### 2.1 Props & Entry/Exit Contract
- **Props**: `{ isOpen: boolean; onClose: () => void }`
- **Entry from `VisualV2Shell.tsx`**:
  - Clicking map landmark `v2-landmark-tools_room` or card `detective` calls `recordLandmarkVisit('detective')` and `setChildPlace('detective')`.
- **Exit**:
  - Clicking close (`aria-label="关闭"`) invokes `onClose()`, which in `VisualV2Shell` stops `speechNarrator.stop()`, plays `sounds.playModalClose()`, calls `clearActiveLandmarkSession()`, and resets `childPlace` to `'island'`.

### 2.2 Complete State & Action Mapping

| Mode / Feature | State Variable(s) | User Action / Trigger | State Transition | Audio / Voice / Metrics Side Effect |
| --- | --- | --- | --- | --- |
| **Top CTA: Open Difficulty Breaker** | `isBreakerOpen: boolean` | Click button `去困难拆解台` (lines 116–123) | `setIsBreakerOpen(true)` | `sounds.playClick()`; mounts `<DifficultyBreakerModal isOpen={isBreakerOpen} />` |
| **Top CTA: Launch Crayon Detective Game** | `isCrayonGameOpen: boolean` | Click button `进入现场调查` (lines 163–170) | `setIsCrayonGameOpen(true)` | `sounds.playClick()`; renders `<CrayonDetectiveGame />`; on exit refreshes `expMetrics = loadProductExperienceMetrics()` |
| **Mode Switching (4 Tabs)** | `activeTab: 'tools' \| 'threeBoxes' \| 'circles' \| 'fourSteps'` | Click tab buttons (lines 180–231) | `setActiveTab(tab)` | `sounds.playClick()` |
| **Tool 1: 「人」与「事」小旗子 (`flag`)** | `activeTool === 'flag'`, `personFlagRemoved: boolean` | Click `拔掉“我不好”小旗子` / `重新插上试一试` (lines 336–358) | `setPersonFlagRemoved(true \| false)` | `sounds.playSuccess()` + `speechNarrator.speak(...)` separating temporary mistake from self-worth |
| **Tool 2: 三个小镜头 (`lenses`)** | `activeTool === 'lenses'`, `currentLens: 'my' \| 'his' \| 'sky'` | Click lens buttons `我的镜头` / `他的镜头` / `天空鸟儿镜头` (lines 413–445) | `setCurrentLens(lensId)` | `sounds.playClick()` + `speechNarrator.speak(...)` |
| **Tool 3: 两面硬币 (`coin`)** | `activeTool === 'coin'`, `coinSide: 'front' \| 'back'` | Click coin card `点我翻面看看` (lines 495–525) | `setCoinSide(prev === 'front' ? 'back' : 'front')` | `sounds.playCoinFlip()` + `speechNarrator.speak(...)` |
| **Tool 4: 公平小天平 (`scale`)** | `activeTool === 'scale'` | Select tool tab `公平小天平` (lines 555–602) | `setActiveTool('scale')` | `sounds.playClick()` + `speechNarrator.speak(...)` comparing different household habits vs. equal care |
| **Tool 5: 安全围栏 (`fence`)** | `activeTool === 'fence'` | Select tool tab `安全围栏` (lines 605–663) | `setActiveTool('fence')` | Non-negotiable body safety & anti-bullying red-line rules; explicitly bypasses perspective trade-off |
| **Mode 2: 三个小盒子 (`threeBoxes`)** | `boxItems` (`id: '1'..'5'`, `sorted: null \| 'visible' \| 'heart' \| 'guess'`) | Click target box (`眼睛看到的` / `心里的感觉` / `脑子猜的`) for each unsorted item | Updates `boxItems[i].sorted = targetBox` if `targetBox === item.correctBox` | `sounds.playSuccess()`; when all 5 items are sorted, calls `unlockMedal('thought-detective')` |
| **Mode 3: 控制圈 (`circles`)** | `circleItems` (`id: 'c1'..'c5'`, `sorted: null \| 'adult' \| 'mine' \| 'together'`) | Click target circle (`大人的事` / `我的事` / `一起商量`) for each unsorted item | Updates `circleItems[i].sorted = targetCircle` if `targetCircle === item.correctCircle` | `sounds.playSuccess()` on match, gentle retry sound on mismatch |
| **Mode 4: 往后退一步4阶 (`fourSteps`)** | `currentStep: 1 \| 2 \| 3 \| 4`, `isTransferLabOpen: boolean` | Click step cards `1..4` or `打开独立生活小情境（无提示检验）` (lines 778–853) | `setCurrentStep(s.step)` or `setIsTransferLabOpen(true)` | `sounds.playClick()`; mounts `<TransferScenariosModal />` |

---

## 3. Module 2: `DifficultyBreakerModal.tsx` («困难拆解台»)

### 3.1 Complete Stage, Preset, Subbranch & Voice Mapping

| Stage / Feature | State Variable(s) | Test ID / Selector | User Action & State Transition | Audio / Voice / Safety Invariant |
| --- | --- | --- | --- | --- |
| **Companion & Voice Bar** | `personalization.companionId`, `isSpeaking`, `karaoke`, `lastSpokenText` | `breaker-companion-bar`, `breaker-companion-switch-{id}`, `breaker-replay-speech` | Inline switch across 4 companions (`guoguo_squirrel`, `beibei_otter`, `tiantian_raccoon`, `qiqi_deer`) or replay current voice line | Calls `updatePersonalization({ companionId })` + `speechNarrator.syncWithCompanion(compId)` and speaks `SWITCH_COMPANION_GREETING[compId]` |
| **Stage 0: `pick` (挑选大石头困难)** | `currentStep === 'pick'`, `selectedPresetId`, `transitionSubId` | `breaker-step-pick`, `breaker-pick-{presetId}`, `breaker-pick-sub-{subId}` | Pick one of 3 presets (`diff-two-homes`, `diff-blocks-broken`, `diff-friend-ask`) or directly pick one of 4 transition subbranches | Calls `resetBreakerScenarioProgressToFen()`, sets `currentStep = 'fen'`, and speaks scenario `entrySpeech` with emotion prosody tone |
| **Inline 4-Subbranch Switcher (`diff-two-homes`)** | `selectedPresetId === 'diff-two-homes'`, `transitionSubId` | `breaker-transition-sub-selector`, `breaker-sub-{subId}` | Switch among `sub_dual_attachment`, `sub_loyalty_conflict`, `sub_specific_concern`, `sub_ordinary_transition` | Calls `resetBreakerScenarioProgressToFen()` so stale `fenRevealed`, `isCoinFlipped`, `steppingStones`, and `pausedVoluntarily` are 100% cleared |
| **Stage 1: `fen` (1. 看清石头 · 分)** | `currentStep === 'fen'`, `fenRevealed: { fact, feeling, guess }` | `breaker-step-fen`, `breaker-svg-stage-fen`, `breaker-fen-fact`, `breaker-fen-feeling`, `breaker-fen-guess` | Toggle any of the 3 crystal pieces (`fact`, `feeling`, `guess`) via SVG stage or detail cards | `sounds.playBell()`; when revealed (`nextVal === true`), speaks `activeContent.fenItems[piece]` (`calm-fact-clarity` or `warm-dual-empathy`) |
| **Stage 2: `tong` (2. 换位置看 · 通)** | `currentStep === 'tong'`, `isCoinFlipped: boolean` | `breaker-step-tong`, `breaker-svg-stage-tong`, `breaker-flip-lens-btn` | Click dual-sided perspective lens to toggle `isCoinFlipped` | `sounds.playCoinFlip()`; speaks `silverLining` (when flipped) or `shiftContent` (when unflipped) |
| **Stage 3: `ze` (3. 选踏脚石 · 择)** | `currentStep === 'ze'`, `steppingStones: [slot0, slot1, slot2]`, `pausedVoluntarily: boolean` | `breaker-step-ze`, `breaker-stone-slot-0..2`, `breaker-action-{id}`, `breaker-pause-btn`, `breaker-complete-btn` | Place 1–3 actions into slots (`handlePlaceAction`), remove a stone (`handleRemoveStone`), pause voluntarily (`setPausedVoluntarily(true)`), or finish when `placedStonesCount >= 1` | Placing action clears `pausedVoluntarily = false`, plays `sounds.playScaleClink()`, and speaks `action.text` (`protective-safety` for safety actions). Completing unlocks `breaker-master` & `action-pioneer` medals |
| **Stage 4: `complete` (完成拆解)** | `currentStep === 'complete'` | `breaker-step-complete`, `breaker-reset-btn` | Review chosen stepping stones; click `拆解另一个情况` (`setCurrentStep('pick')`) or `完成拆解，回小岛` (`onClose`) | Speaks `BREAKER_FIXED_VOICE_LINES.COMPLETE_SPEECH` |
