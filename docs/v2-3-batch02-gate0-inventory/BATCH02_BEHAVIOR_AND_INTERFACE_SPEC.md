# A-LAND V2.3 Batch02 · Gate B0R-A — Real Source Behavior & Interface Specification

## 1. Inspected Live Source Files at Frozen Baseline (`d0b497acade40bd4bbd2cc9f16e9550df2b19504` / `a6a1f843fd9955539912bfd1b30cc46a399a9ed8`)

All SHA-256 digests below are computed directly from the unmodified live repository files and match `BATCH02_BEHAVIOR_INTERFACE_MAP.json` byte-for-byte:

| File Path | Lines | Bytes | Exact SHA-256 | Role in Batch02 |
| --- | ---: | ---: | --- | --- |
| `src/components/ChildIsland/ThoughtDetectiveLab/ThoughtDetectiveLabModal.tsx` | 873 | 45,560 | `b76279089dfb728ccb4d8bac21741901e4448298eb9404281139186e291d483e` | Primary «想法侦探社» modal component |
| `src/components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal.tsx` | 1,638 | 74,536 | `93bc7835122fdacc1fccf01ab40d542066e6cd0a9cf043507224a973f93921aa` | Primary «困难拆解台» modal component |
| `src/visual-v2/VisualV2Shell.tsx` | 499 | 21,113 | `1aa969e195a0e49ea0ea051c94ce2ddf69e950329a5810d7c6c9941ef23bea00` | V2 review shell mounting both modals |
| `src/domain/cognitive/ContentAuditRegistry.ts` | 780 | 30,297 | `fbc825550bdfa597bb140b8ca51b461f8595f484bf0ce6a55e2f07fe11864eb2` | Fail-closed `PENDING_REVIEW` content audit gate |
| `src/components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame.tsx` | 2,051 | 97,058 | `9c00f572cba01613965ec327b0a2d5c7cec3a60950b870861c0b3eebcb68770e` | Spatial detective case game launched from Detective Lab |
| `src/components/InteractiveGames/TransferLab/TransferScenariosModal.tsx` | 619 | 28,981 | `94f346dd6edd9491eb3eb7f7a0f885f589d93d60d52c86b7b32be1b9d1807a20` | Unprompted transfer scenario modal launched from Detective Lab |
| `src/context/AppContext.tsx` | 674 | 23,751 | `b55e36bd8ad872dd453934969157ee5d181c9c6a3f90f069fc6e8e79bd12f0e2` | Global child personalization & medal context |
| `src/utils/speech.ts` | 2,460 | 80,993 | `bb6474a2f717f2ec717878ca99714c9a0e6053896dd2631556bf59c44bdafbe1` | Hybrid Neural TTS & karaoke narrator engine |
| `src/domain/cognitive/productExperienceMetrics.ts` | 1,622 | 59,659 | `3cf9781e1b1ad917d54d923ff16e58f50452581788d766256c6ee44482e69cd8` | Detective case & transfer scenario metrics store |
| `src/domain/privacy/parentAccess.ts` | 247 | 8,011 | `c4f1ac21fcf28c7d92d94dba16a93ed452da9a8770d15287d56facb54ccf8f98` | Session-bound adult preview & parent gate access |

---

## 2. Module 1: `ThoughtDetectiveLabModal.tsx` («想法侦探社»)

### 2.1 Props & Entry/Exit Contract
- **Props**: `{ isOpen: boolean; onClose: () => void }` (lines 32–35)
- **Entry from `VisualV2Shell.tsx`**:
  - Clicking map landmark `v2-landmark-tools_room` or card `detective` calls `recordLandmarkVisit('detective')` and `setChildPlace('detective')`.
- **Exit**:
  - Clicking close (`aria-label="离开想法侦探社"`, lines 100–106) invokes `onClose()`, which in `VisualV2Shell` stops `speechNarrator.stop()`, plays `sounds.playModalClose()`, calls `clearActiveLandmarkSession()`, and resets `childPlace` to `'island'`.

### 2.2 Exact Hook Order & Initial State Values (Lines 38–75)

| Hook Index | State / Variable Name | Exact Type | Exact Initial Value | Source Line |
| ---: | --- | --- | --- | ---: |
| 0 | `activeTab` | `'tools' \| 'threeBoxes' \| 'circles' \| 'fourSteps'` | `'tools'` | 38 |
| 1 | `isBreakerOpen` | `boolean` | `false` | 39 |
| 2 | `isCrayonGameOpen` | `boolean` | `false` | 40 |
| 3 | `isTransferLabOpen` | `boolean` | `false` | 41 |
| — | `expMetrics` | `ProductExperienceMetrics` (direct call, not `useState`) | `loadProductExperienceMetrics()` | 42 |
| 4 | `activeTool` | `'flag' \| 'lenses' \| 'coin' \| 'scale' \| 'fence'` | `'flag'` | 45 |
| 5 | `personFlagRemoved` | `boolean` | `false` | 48 |
| 6 | `currentLens` | `'my' \| 'his' \| 'sky'` | `'my'` | 51 |
| 7 | `coinSide` | `'front' \| 'back'` | `'front'` | 54 |
| 8 | `boxItems` | `Array<{ id: string; text: string; target: 'visible' \| 'heart' \| 'guess'; placed: string \| null }>` | 5 items (`'1'` -> `placed: 'visible'`, `'2'` -> `placed: 'heart'`, `'3'..'5'` -> `placed: null`) | 57–63 |
| 9 | `circleItems` | `Array<{ id: string; text: string; target: 'adult' \| 'mine' \| 'together'; placed: string \| null }>` | 5 items (`'c1'` -> `placed: 'adult'`, `'c2'` -> `placed: 'mine'`, `'c3'..'c5'` -> `placed: null`) | 66–72 |
| 10 | `currentStep` | `number` (`1 \| 2 \| 3 \| 4`) | `1` | 75 |

### 2.3 Complete State & Action Mapping (Verified Against Live Source)

| Mode / Feature | State Variable(s) | User Action / Trigger | Exact State Transition in Source | Audio / Voice / Metrics Side Effect |
| --- | --- | --- | --- | --- |
| **Top CTA: Open Difficulty Breaker** | `isBreakerOpen: boolean` | Click button `去困难拆解台` (lines 116–123) | `setIsBreakerOpen(true)` | `sounds.playClick()`; mounts `<DifficultyBreakerModal isOpen={isBreakerOpen} />` |
| **Top CTA: Launch Crayon Detective Game** | `isCrayonGameOpen: boolean` | Click button `开始真实探案互动：《蜡笔侦探》` (lines 150–170) | `setIsCrayonGameOpen(true)` | `sounds.playClick()`; renders `<CrayonDetectiveGame />` |
| **Mode Switching (4 Tabs)** | `activeTab: 'tools' \| 'threeBoxes' \| 'circles' \| 'fourSteps'` | Click tab buttons (`四件工具与围栏` / `三个分类盒子` / `责任圈拼图` / `退后一步4台阶`, lines 195–255) | `setActiveTab(tab)` | `sounds.playClick()` |
| **Tool 1: 「人」与「事」小旗子 (`flag`)** | `activeTool === 'flag'`, `personFlagRemoved: boolean` | Click `拔掉“我不好”小旗子` / `重新插上试一试` (lines 336–358) | `setPersonFlagRemoved(!personFlagRemoved)` | `sounds.playClick()` + optional `handleSpeak(...)` via speaker button |
| **Tool 2: 三个小镜头 (`lenses`)** | `activeTool === 'lenses'`, `currentLens: 'my' \| 'his' \| 'sky'` | Click lens buttons `我的镜头` / `他的镜头` / `天空镜头` (lines 413–445) | `setCurrentLens(lensId)` | `sounds.playClick()` + optional `handleSpeak(...)` |
| **Tool 3: 两面硬币 (`coin`)** | `activeTool === 'coin'`, `coinSide: 'front' \| 'back'` | Click coin card (lines 495–525) | `setCoinSide(coinSide === 'front' ? 'back' : 'front')` | `sounds.playCoinFlip()` + optional `handleSpeak(...)` |
| **Tool 4: 公平小天平 (`scale`)** | `activeTool === 'scale'` | Select tool tab `公平小天平` (lines 555–602) | `setActiveTool('scale')` | `sounds.playClick()` + optional `handleSpeak(...)` |
| **Tool 5: 安全围栏 (`fence`)** | `activeTool === 'fence'` | Select tool tab `安全围栏` (lines 605–625) | `setActiveTool('fence')` | `sounds.playClick()`; non-negotiable body safety & anti-bullying red-line rules |
| **Mode 2: 三个分类盒子 (`threeBoxes`)** | `boxItems` (`{ id, text, target, placed }`, lines 57–63) | Click `看得见` / `心里的` / `猜的` button on any item (`handlePlaceBox(itemId, boxType)`, lines 83–88, 669–699) | Unconditionally sets `item.placed = boxType` for matching `itemId` (no correctness blocking; freely movable; items `'1'` and `'2'` start pre-placed as examples) | Plays `sounds.playClick()`. Does **not** call `unlockMedal('thought-detective')` or `sounds.playSuccess()` |
| **Mode 3: 责任圈拼图 (`circles`)** | `circleItems` (`{ id, text, target, placed }`, lines 66–72) | Click `大人的事` / `我的事` / `一起商量` button on any item (`handlePlaceCircle(itemId, circleType)`, lines 90–95, 761–791) | Unconditionally sets `item.placed = circleType` for matching `itemId` (no correctness blocking; freely movable; items `'c1'` and `'c2'` start pre-placed as examples) | Plays `sounds.playClick()`. Does **not** call `sounds.playSuccess()` |
| **Mode 4: 退后一步4台阶 (`fourSteps`)** | `currentStep: 1 \| 2 \| 3 \| 4` (initial `1`), `isTransferLabOpen: boolean` | Click step cards `1..4` or `打开独立生活小情境（无提示检验）` (lines 803–853) | `setCurrentStep(s.step)` or `setIsTransferLabOpen(true)` | `sounds.playClick()`; mounts `<TransferScenariosModal />` |

---

## 3. Module 2: `DifficultyBreakerModal.tsx` («困难拆解台»)

### 3.1 Exact Hook Order & Voice/Companion Contract (Lines 438–565)

- **Hook Order** (`DifficultyBreakerModal.tsx` lines 440–473):
  0. `selectedPresetId` (`'diff-two-homes'`, line 440)
  1. `transitionSubId` (`'sub_dual_attachment'`, line 441)
  2. `currentStep` (`'pick'`, line 443)
  3. `fenRevealed` (`{ fact: false, feeling: false, guess: false }`, line 448)
  4. `isCoinFlipped` (`false`, line 459)
  5. `steppingStones` (`[null, null, null]`, line 462)
  6. `pausedVoluntarily` (`false`, line 467)
  7. `isSpeaking` (`speechNarrator.getSpeaking()`, line 469)
  8. `karaoke` (`speechNarrator.getKaraokeState()`, line 470)
  9. `lastSpokenText` (`BREAKER_FIXED_VOICE_LINES.ENTRY_GREETING`, line 471)
- **Voice Subscription Contract** (lines 489–495):
  - Uses `const unsubscribe = speechNarrator.subscribe(() => { setIsSpeaking(speechNarrator.getSpeaking()); setKaraoke(speechNarrator.getKaraokeState()); });`
  - Does **not** call non-existent `subscribeKaraoke` or `subscribeSpeakingState`.
- **Modal Open Voice Sync** (lines 497–506):
  - When `isOpen` becomes `true`, calls `speechNarrator.syncWithCompanion(activeCompanion.id)` and speaks `BREAKER_FIXED_VOICE_LINES.ENTRY_GREETING`.
- **Inline Companion Switch Contract** (`handleSwitchCompanionInline`, lines 522–525):
  - Calls `updatePersonalization({ companionId: nextCompanionId })` and `speechNarrator.switchCompanion(nextCompanionId)` (which internally delegates to `syncWithCompanion(nextCompanionId, { restartActiveSpeech: true })`).
  - Does **not** speak a separate `SWITCH_COMPANION_GREETING` on inline switch.

### 3.2 Complete Stage, Preset, Subbranch & Stale-Progression Reset Mapping

| Stage / Feature | State Variable(s) | Test ID / Selector | User Action & State Transition | Audio / Voice / Safety Invariant |
| --- | --- | --- | --- | --- |
| **Companion & Voice Bar** | `personalization.companionId`, `isSpeaking`, `karaoke`, `lastSpokenText` | `breaker-companion-bar`, `breaker-companion-switch-{id}`, `breaker-replay-speech` | Inline switch across 4 companions (`guoguo_squirrel`, `beibei_otter`, `tiantian_raccoon`, `qiqi_deer`) or replay `lastSpokenText` | Calls `updatePersonalization({ companionId: nextCompanionId })` + `speechNarrator.switchCompanion(nextCompanionId)` (lines 522–525) |
| **Stage 0: `pick` (挑选大石头困难)** | `currentStep === 'pick'`, `selectedPresetId`, `transitionSubId` | `breaker-step-pick`, `breaker-pick-{presetId}`, `breaker-pick-sub-{subId}` | Pick one of 3 presets (`diff-two-homes`, `diff-blocks-broken`, `diff-friend-ask`) or directly pick one of 4 transition subbranches (lines 535–550) | Calls `resetBreakerScenarioProgressToFen()` (lines 527–533), sets `currentStep = 'fen'`, and speaks scenario `entrySpeech` |
| **Inline 4-Subbranch Switcher (`diff-two-homes`)** | `selectedPresetId === 'diff-two-homes'`, `transitionSubId` | `breaker-transition-sub-selector`, `breaker-sub-{subId}` | Switch among `sub_dual_attachment`, `sub_loyalty_conflict`, `sub_specific_concern`, `sub_ordinary_transition` (`handleSwitchTransitionSubBranch`, lines 552–565) | Calls `resetBreakerScenarioProgressToFen()` (lines 527–533) so stale `fenRevealed`, `isCoinFlipped`, `steppingStones`, and `pausedVoluntarily` are 100% cleared |
| **Stage 1: `fen` (1. 看清石头 · 分)** | `currentStep === 'fen'`, `fenRevealed: { fact, feeling, guess }` | `breaker-step-fen`, `breaker-svg-stage-fen`, `breaker-fen-fact`, `breaker-fen-feeling`, `breaker-fen-guess` | Toggle any of the 3 crystal pieces (`fact`, `feeling`, `guess`) via SVG stage or detail cards (`handleToggleFenPiece`, lines 567–579) | `sounds.playBell()`; when revealed (`nextVal === true`), speaks `activeContent.fenItems[piece]` (`calm-fact-clarity` or `warm-dual-empathy`) |
| **Stage 2: `tong` (2. 换位置看 · 通)** | `currentStep === 'tong'`, `isCoinFlipped: boolean` | `breaker-step-tong`, `breaker-svg-stage-tong`, `breaker-flip-lens-btn` | Click dual-sided perspective lens to toggle `isCoinFlipped` | `sounds.playCoinFlip()`; speaks `silverLining` (when flipped) or `shiftContent` (when unflipped) |
| **Stage 3: `ze` (3. 选踏脚石 · 择)** | `currentStep === 'ze'`, `steppingStones: [slot0, slot1, slot2]`, `pausedVoluntarily: boolean` | `breaker-step-ze`, `breaker-stone-slot-0..2`, `breaker-action-{id}`, `breaker-pause-btn`, `breaker-complete-btn` | Place 1–3 actions into slots (`handlePlaceAction`, lines 581–602), remove a stone (`handleRemoveStone`, lines 604–611), pause voluntarily (`setPausedVoluntarily(true)`), or finish when `placedStonesCount >= 1` | Placing action clears `pausedVoluntarily = false`, plays `sounds.playScaleClink()`, and speaks `action.text` (`protective-safety` for safety actions). Completing unlocks `breaker-master` & `action-pioneer` medals |
| **Stage 4: `complete` (完成拆解)** | `currentStep === 'complete'` | `breaker-step-complete`, `breaker-reset-btn` | Review chosen stepping stones; click `拆解另一个情况` (`setCurrentStep('pick')`) or `完成拆解，回小岛` (`onClose`) | Speaks `BREAKER_FIXED_VOICE_LINES.COMPLETE_SPEECH` |

---

## 4. Frozen 6-Viewport Matrix & Gate U2 Stage Composition Policy (Gate B0R-C / P2-02)

### 4.1 Frozen 6-Viewport Verification Matrix (`BATCH02_REQUIRED_VIEWPORTS`)
1. `360×800` (`mobile_360x800`, portrait, `mobile_3_4`)
2. `390×844` (`mobile_390x844`, portrait, `mobile_3_4`)
3. `430×932` (`mobile_430x932`, portrait, `mobile_3_4`)
4. `768×1024` (`tablet_768x1024`, portrait, `tablet_adaptive`)
5. **`1024×1366`** (`tablet_1024x1366`, portrait, `tablet_adaptive` — mandatory frozen viewport)
6. `1440×900` (`desktop_1440x900`, landscape, `desktop_16_9`)

- **Optional 7th Additional Viewport (`BATCH02_OPTIONAL_ADDITIONAL_VIEWPORTS`)**: `1024×768` (`tablet_1024x768`, landscape) may be included as an optional 7th check, never replacing `1024×1366`.

### 4.2 Aspect-Ratio-Preserving Mobile & Desktop Stage Composition Rule (`BATCH02_STAGE_COMPOSITION_RULE`)
- **Mobile Portrait (`360×800`, `390×844`, `430×932`)**: Must render dedicated `3:4` portrait scene plates (`>=1200×1600`) inside an aspect-ratio-preserving stage container (`aspect-[3/4]` or full-bleed safe-zone backdrop with `object-contain` / safe focal framing). **Prohibits** cropping `3:4` vertical scene art into shallow `188–215px` `object-cover` horizontal strips (preserving the Gate U2 composition standard).
- **Desktop / Landscape (`1440×900`)**: Must render dedicated `16:9` landscape scene plates (`>=2560×1440`) with independent L1/L2/L3 depth layers and interactive 3D prop anchors.
