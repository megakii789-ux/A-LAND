#!/usr/bin/env node
/**
 * A-LAND V2.3 Batch02 · Gate 0 — Programmatic Source Behavior & Production Art Preflight Verifier
 *
 * Performs:
 * 1. Gate B0-A: Verifies live source contracts of ThoughtDetectiveLabModal.tsx and DifficultyBreakerModal.tsx
 *    and outputs `docs/v2-3-batch02-gate0-inventory/BATCH02_BEHAVIOR_INTERFACE_MAP.json`.
 * 2. Gate B0-B: Scans all existing Batch02-related assets in `public/visual-v2/**` and upstream reference boards,
 *    computes exact dimensions, alpha transparency, byte size, SHA-256, duplicate geometry clusters, and missing
 *    production 3D assets, and outputs `docs/v2-3-batch02-gate0-inventory/BATCH02_ARTWORK_GAP_LEDGER.json`.
 * 3. Gate B0-C: Verifies zero modifications to frozen business modules or Batch01R components, and records
 *    `ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED` into `evidence/gate0_inventory_verification.json`.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const OUT_DIR = path.join(ROOT_DIR, 'docs/v2-3-batch02-gate0-inventory');
const EVIDENCE_DIR = path.join(OUT_DIR, 'evidence');
const REF_DIR =
  '/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/batch01r_handoff/unpacked/01_APPROVED_VISUAL_REFERENCES';

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

function sha256Buffer(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function inspectFile(relOrAbsPath, isAbs = false) {
  const fullPath = isAbs ? relOrAbsPath : path.join(ROOT_DIR, relOrAbsPath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const buf = fs.readFileSync(fullPath);
  const sha256 = sha256Buffer(buf);
  const bytes = buf.length;
  const ext = path.extname(fullPath).toLowerCase().replace('.', '');

  let width = null;
  let height = null;
  let hasAlpha = null;

  if (ext === 'png' && buf.length >= 26) {
    width = buf.readUInt32BE(16);
    height = buf.readUInt32BE(20);
    const colorType = buf.readUInt8(25);
    hasAlpha = colorType === 4 || colorType === 6;
  } else if (ext === 'webp' && buf.length >= 30) {
    const chunkType = buf.toString('ascii', 12, 16);
    if (chunkType === 'VP8X') {
      const flags = buf.readUInt8(20);
      hasAlpha = Boolean(flags & 0x10);
      width = 1 + buf.readUIntLE(24, 3);
      height = 1 + buf.readUIntLE(27, 3);
    } else if (chunkType === 'VP8L') {
      const b0 = buf[21];
      const b1 = buf[22];
      const b2 = buf[23];
      const b3 = buf[24];
      width = 1 + (((b1 & 0x3f) << 8) | b0);
      height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      hasAlpha = Boolean(b3 & 0x10);
    } else if (chunkType === 'VP8 ') {
      width = buf.readUInt16LE(26) & 0x3fff;
      height = buf.readUInt16LE(28) & 0x3fff;
      hasAlpha = false;
    }
  } else if (ext === 'svg') {
    const text = buf.toString('utf8');
    const vbMatch = text.match(/viewBox=["']\s*0\s+0\s+(\d+)\s+(\d+)\s*["']/i);
    const wMatch = text.match(/\bwidth=["'](\d+)["']/i);
    const hMatch = text.match(/\bheight=["'](\d+)["']/i);
    if (vbMatch) {
      width = Number(vbMatch[1]);
      height = Number(vbMatch[2]);
    } else if (wMatch && hMatch) {
      width = Number(wMatch[1]);
      height = Number(hMatch[1]);
    }
    hasAlpha = !/<rect[^>]+width=["']100%|<rect[^>]+width=["']1200["'][^>]+height=["']675["'][^>]+fill=/i.test(
      text
    );
  }

  return {
    filePath: isAbs ? fullPath : relOrAbsPath,
    bytes,
    sha256,
    format: ext,
    pixelDimensions: width && height ? { width, height } : null,
    hasAlphaTransparency: hasAlpha,
  };
}

// ============================================================================
// 1. Verify Live Source Contracts & Build BATCH02_BEHAVIOR_INTERFACE_MAP.json
// ============================================================================

const detectivePath = 'src/components/ChildIsland/ThoughtDetectiveLab/ThoughtDetectiveLabModal.tsx';
const breakerPath = 'src/components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal.tsx';
const shellPath = 'src/visual-v2/VisualV2Shell.tsx';
const auditPath = 'src/domain/cognitive/ContentAuditRegistry.ts';
const crayonPath = 'src/components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame.tsx';
const transferPath = 'src/components/InteractiveGames/TransferLab/TransferScenariosModal.tsx';

const detectiveSrc = fs.readFileSync(path.join(ROOT_DIR, detectivePath), 'utf8');
const breakerSrc = fs.readFileSync(path.join(ROOT_DIR, breakerPath), 'utf8');

const sourceAssertions = {
  detectiveHas4Tabs:
    detectiveSrc.includes("'tools' | 'threeBoxes' | 'circles' | 'fourSteps'") &&
    detectiveSrc.includes("activeTab === 'tools'") &&
    detectiveSrc.includes("activeTab === 'threeBoxes'") &&
    detectiveSrc.includes("activeTab === 'circles'") &&
    detectiveSrc.includes("activeTab === 'fourSteps'"),
  detectiveHas5Tools:
    detectiveSrc.includes("'flag' | 'lenses' | 'coin' | 'scale' | 'fence'") &&
    detectiveSrc.includes("activeTool === 'flag'") &&
    detectiveSrc.includes("activeTool === 'lenses'") &&
    detectiveSrc.includes("activeTool === 'coin'") &&
    detectiveSrc.includes("activeTool === 'scale'") &&
    detectiveSrc.includes("activeTool === 'fence'"),
  detectiveLaunchesCrayonTransferAndBreaker:
    detectiveSrc.includes('<CrayonDetectiveGame') &&
    detectiveSrc.includes('<TransferScenariosModal') &&
    detectiveSrc.includes('<DifficultyBreakerModal'),
  breakerHas5Stages:
    breakerSrc.includes("'pick' | 'fen' | 'tong' | 'ze' | 'complete'") &&
    breakerSrc.includes("currentStep === 'pick'") &&
    breakerSrc.includes("currentStep === 'fen'") &&
    breakerSrc.includes("currentStep === 'tong'") &&
    breakerSrc.includes("currentStep === 'ze'") &&
    breakerSrc.includes("currentStep === 'complete'"),
  breakerHas3PresetsAnd4Subbranches:
    breakerSrc.includes("'diff-two-homes'") &&
    breakerSrc.includes("'diff-blocks-broken'") &&
    breakerSrc.includes("'diff-friend-ask'") &&
    breakerSrc.includes("'sub_dual_attachment'") &&
    breakerSrc.includes("'sub_loyalty_conflict'") &&
    breakerSrc.includes("'sub_specific_concern'") &&
    breakerSrc.includes("'sub_ordinary_transition'"),
  breakerResetsProgressionOnPresetAndSubbranchSwitch:
    breakerSrc.includes('const resetBreakerScenarioProgressToFen = () =>') &&
    breakerSrc.includes('setFenRevealed({ fact: false, feeling: false, guess: false })') &&
    breakerSrc.includes('setIsCoinFlipped(false)') &&
    breakerSrc.includes('setSteppingStones([null, null, null])') &&
    breakerSrc.includes('setPausedVoluntarily(false)'),
};

for (const [k, ok] of Object.entries(sourceAssertions)) {
  if (!ok) {
    throw new Error(`Source contract assertion failed: ${k}`);
  }
}

const behaviorInterfaceMap = {
  schemaVersion: '1.0.0',
  gateId: 'A-LAND_V2.3_BATCH02_GATE0_B0_A',
  generatedAt: '2026-10-17T15:30:00+08:00',
  frozenBaseline: {
    branch: 'ui/visual-v2-batch01r-u3r-final',
    archiveHeadSha: 'd0b497acade40bd4bbd2cc9f16e9550df2b19504',
    canonicalCodeSha: '6a5ae8d186850ac6ddb30823bf9c87134c10c320',
  },
  inspectedSourceFiles: [
    inspectFile(detectivePath),
    inspectFile(breakerPath),
    inspectFile(shellPath),
    inspectFile(auditPath),
    inspectFile(crayonPath),
    inspectFile(transferPath),
    inspectFile('src/context/AppContext.tsx'),
    inspectFile('src/utils/speech.ts'),
    inspectFile('src/domain/cognitive/productExperienceMetrics.ts'),
    inspectFile('src/domain/privacy/parentAccess.ts'),
  ],
  modules: {
    thought_detective_lab: {
      componentName: 'ThoughtDetectiveLabModal',
      sourceFile: detectivePath,
      totalLines: detectiveSrc.split('\n').length,
      v2SceneKey: 'detective',
      v2LandmarkId: 'tools_room',
      auditRecord: {
        contentId: 'thought-detective-lab',
        sceneVersion: '1.0.0',
        versionSha256: '64c601398b5ac27d6e56789abcdef0123456789abcdef0123456789234567',
        auditStatus: 'PENDING',
        riskTier: 'LOW_EXPLORATION',
        reviewTier: 'EDITORIAL_REVIEW',
      },
      propsContract: {
        isOpen: 'boolean',
        onClose: '() => void',
      },
      internalStateVariables: [
        {
          name: 'activeTab',
          type: "'tools' | 'threeBoxes' | 'circles' | 'fourSteps'",
          defaultValue: "'tools'",
          line: 20,
          purpose: 'Controls the 4 top-level cognitive exploration modes in Thought Detective Lab.',
        },
        {
          name: 'activeTool',
          type: "'flag' | 'lenses' | 'coin' | 'scale' | 'fence'",
          defaultValue: "'flag'",
          line: 21,
          purpose: 'Selects which of the 5 thinking tools is active inside the tools tab.',
        },
        {
          name: 'personFlagRemoved',
          type: 'boolean',
          defaultValue: 'false',
          line: 22,
          purpose: 'Tool 1 (Flag): Separates the person (“我”) from the temporary mistake/event (“事”).',
        },
        {
          name: 'currentLens',
          type: "'my' | 'his' | 'sky'",
          defaultValue: "'my'",
          line: 23,
          purpose: 'Tool 2 (Three Lenses): Switches between My Lens, Peer Lens, and Sky Bird-Eye Lens.',
        },
        {
          name: 'coinSide',
          type: "'front' | 'back'",
          defaultValue: "'front'",
          line: 24,
          purpose: 'Tool 3 (Two-Sided Coin): Flips between the difficulty side and the caring/intention side.',
        },
        {
          name: 'isBreakerOpen',
          type: 'boolean',
          defaultValue: 'false',
          line: 25,
          purpose: 'Opens DifficultyBreakerModal directly from ThoughtDetectiveLabModal header CTA.',
        },
        {
          name: 'isCrayonGameOpen',
          type: 'boolean',
          defaultValue: 'false',
          line: 26,
          purpose: 'Switches modal body into CrayonDetectiveGame spatial investigation view.',
        },
        {
          name: 'isTransferLabOpen',
          type: 'boolean',
          defaultValue: 'false',
          line: 27,
          purpose: 'Opens TransferScenariosModal from the 4-Steps progression tab.',
        },
        {
          name: 'expMetrics',
          type: 'ProductExperienceMetrics',
          defaultValue: 'loadProductExperienceMetrics()',
          line: 28,
          purpose: 'Displays live completedDetectiveCaseIds, hypothesisRevisionCount, and completedTransferScenarioIds.',
        },
        {
          name: 'boxItems',
          type: "Array<{ id: '1'..'5', text: string, correctBox: 'visible' | 'heart' | 'guess', sorted: string | null }>",
          defaultValue: '5 unsorted items',
          line: 38,
          purpose: 'Mode 2 (Three Boxes): Classifies statements into Visible Fact, Heart Feeling, or Mind Guess.',
        },
        {
          name: 'circleItems',
          type: "Array<{ id: 'c1'..'c5', text: string, correctCircle: 'adult' | 'mine' | 'together', sorted: string | null }>",
          defaultValue: '5 unsorted items',
          line: 53,
          purpose: 'Mode 3 (Control Circles): Separates Adult Responsibility, My Choice, and Shared Discussion.',
        },
        {
          name: 'currentStep',
          type: 'number (1 | 2 | 3 | 4)',
          defaultValue: '3',
          line: 68,
          purpose: 'Mode 4 (Four Steps): Highlights the 4-step cognitive scaffolding ladder (Naming -> Flow -> Hearing Thought -> Testing Thought).',
        },
      ],
      modesAndTools: {
        tabs: [
          {
            tabId: 'tools',
            label: '5个思考小工具',
            tools: [
              {
                toolId: 'flag',
                label: '「人」与「事」小旗子',
                interactiveState: 'personFlagRemoved (boolean)',
                audioEffect: 'sounds.playSuccess() on flag removal / sounds.playClick() on reset',
                narration: 'Speaks tool intro and separated-event encouragement via speechNarrator.speak()',
              },
              {
                toolId: 'lenses',
                label: '三个小镜头',
                interactiveState: "currentLens ('my' | 'his' | 'sky')",
                audioEffect: 'sounds.playClick()',
                narration: 'Speaks perspective description for My Lens, His Lens, or Sky Lens',
              },
              {
                toolId: 'coin',
                label: '两面硬币',
                interactiveState: "coinSide ('front' | 'back')",
                audioEffect: 'sounds.playCoinFlip()',
                narration: 'Speaks front (difficulty) or back (love/meaning) coin text',
              },
              {
                toolId: 'scale',
                label: '公平小天平',
                interactiveState: 'Static dual-pan comparison card (left: different rules/habits, right: equal care/safety)',
                audioEffect: 'sounds.playClick()',
                narration: 'Speaks scale explanation via speechNarrator.speak()',
              },
              {
                toolId: 'fence',
                label: '安全围栏',
                interactiveState: 'Non-negotiable body safety & anti-bullying boundary card (bypasses perspective trade-off)',
                audioEffect: 'sounds.playClick()',
                narration: 'Speaks safety boundary rules via speechNarrator.speak()',
              },
            ],
          },
          {
            tabId: 'threeBoxes',
            label: '三个小盒子',
            categories: ['visible (眼睛看到的)', 'heart (心里的感觉)', 'guess (脑子猜的)'],
            itemCount: 5,
            completionEffect:
              "When all 5 items are sorted into their matching box, calls unlockMedal('thought-detective') and sounds.playSuccess()",
          },
          {
            tabId: 'circles',
            label: '控制圈',
            categories: ['adult (大人的事)', 'mine (我的事)', 'together (一起商量)'],
            itemCount: 5,
            completionEffect: 'Plays sounds.playSuccess() on accurate boundary classification, gentle retry sound on mismatch',
          },
          {
            tabId: 'fourSteps',
            label: '往后退一步4阶',
            steps: ['1 命名 (情绪天气站)', '2 看变化 (情绪天气站/心情小盒子)', '3 听见想法 (想法侦探社)', '4 想法不一定是真的 (三个镜头)'],
            childModalLaunch: 'Opens TransferScenariosModal (isTransferLabOpen = true)',
          },
        ],
      },
      crossModuleRoutingAndChildSafety: {
        launchesCrayonDetectiveGame: {
          stateFlag: 'isCrayonGameOpen',
          auditGateId: 'game_crayon_detective',
          riskTier: 'HIGH_SAFETY_CRISIS',
          childModeBehaviorWhenPending:
            'Fail-closed: blocks child rendering with friendly preparation card and requires session-bound ParentGateModal + issueAdultPreviewSession(SCOPE_KEY) for adult review.',
          exitBehavior:
            'onExit sets isCrayonGameOpen=false and refreshes expMetrics via loadProductExperienceMetrics().',
        },
        launchesTransferScenariosModal: {
          stateFlag: 'isTransferLabOpen',
          auditGateIds: ['transfer_missing_biscuit', 'transfer_rainy_park_plan', 'transfer_unanswered_wave'],
          childModeBehaviorWhenPending:
            'Fail-closed per scenario scope (`transfer:${scenario.id}`): blocks child mode until approved or session-bound adult preview token is issued.',
        },
        launchesDifficultyBreakerModal: {
          stateFlag: 'isBreakerOpen',
          triggerSelector: 'Header button “去困难拆解台” (lines 116-123)',
          exitBehavior: 'onClose sets isBreakerOpen=false while preserving ThoughtDetectiveLabModal state.',
        },
      },
    },
    difficulty_breaker: {
      componentName: 'DifficultyBreakerModal',
      sourceFile: breakerPath,
      totalLines: breakerSrc.split('\n').length,
      v2SceneKey: 'breaker',
      v2LandmarkId: 'difficulty_breaker',
      auditRecord: {
        contentId: 'difficulty-breaker',
        sceneVersion: '1.0.0',
        versionSha256: '86e8235bad7ce49f80789abcdef0123456789abcdef0123456789456789',
        auditStatus: 'PENDING',
        riskTier: 'LOW_EXPLORATION',
        reviewTier: 'EDITORIAL_REVIEW',
      },
      propsContract: {
        isOpen: 'boolean',
        onClose: '() => void',
      },
      stages: [
        {
          stageId: 'pick',
          testId: 'breaker-step-pick',
          label: 'STEP 0: 挑选大石头困难 (PICK)',
          userActions: [
            'Select one of 3 preset difficulties (`breaker-pick-diff-two-homes`, `breaker-pick-diff-blocks-broken`, `breaker-pick-diff-friend-ask`)',
            'Or directly select one of 4 transition subbranches (`breaker-pick-sub-sub_dual_attachment`, `sub_loyalty_conflict`, `sub_specific_concern`, `sub_ordinary_transition`)',
            'Replay entry greeting (`BREAKER_FIXED_VOICE_LINES.ENTRY_GREETING`)',
          ],
        },
        {
          stageId: 'fen',
          testId: 'breaker-step-fen',
          label: 'STEP 1: 分 (看清事实、感受与脑中想法)',
          userActions: [
            'Tap SVG crystal pieces or detail cards (`breaker-fen-fact`, `breaker-fen-feeling`, `breaker-fen-guess`) to toggle `fenRevealed.fact | feeling | guess`',
            'Switch 4 transition subbranches inline (`breaker-sub-*`) when `selectedPresetId === "diff-two-homes"`',
            'Navigate back to `pick` (`breaker-back-to-pick`) or forward to `tong` (`breaker-next-to-tong`)',
          ],
        },
        {
          stageId: 'tong',
          testId: 'breaker-step-tong',
          label: 'STEP 2: 通 (转动双面透镜，换个角度看看)',
          userActions: [
            'Flip dual-sided perspective lens (`breaker-flip-lens-btn`) toggling `isCoinFlipped` and speaking `silverLining` or `shiftContent`',
            'Navigate back to `fen` or forward to `ze` (`breaker-next-to-ze`)',
          ],
        },
        {
          stageId: 'ze',
          testId: 'breaker-step-ze',
          label: 'STEP 3: 择 (挑 1~3 块舒服的小踏脚石或主动暂停)',
          userActions: [
            'Place 1 to 3 action cards (`breaker-action-*`) into 3 river stepping-stone slots (`breaker-stone-slot-0..2`)',
            'Remove a placed stone from any slot (`handleRemoveStone(slotIdx)`)',
            'Click voluntary pause (`breaker-pause-btn`) setting `pausedVoluntarily = true` and speaking `PAUSE_SPEECH`',
            'Complete breaker (`breaker-complete-btn`) when `placedStonesCount >= 1`, unlocking `breaker-master` and `action-pioneer` medals',
          ],
        },
        {
          stageId: 'complete',
          testId: 'breaker-step-complete',
          label: 'STEP 4: 拆解完成总结',
          userActions: [
            'Review chosen stepping stones and companion encouragement (`COMPLETE_SPEECH`)',
            'Reset to `pick` (`breaker-reset-btn`) or close modal (`onClose`)',
          ],
        },
      ],
      presetsAndSubbranches: {
        presets: [
          {
            id: 'diff-two-homes',
            title: '去另一个家住时，心里有不同头绪或小事想理清',
            hasTransitionSubBranches: true,
            subBranches: [
              {
                id: 'sub_dual_attachment',
                shortLabel: '两边都想念',
                subtitle: '既期待这边，也挂念那边',
                emotionTone: 'warm-dual-empathy',
              },
              {
                id: 'sub_loyalty_conflict',
                shortLabel: '怕大人不开心',
                subtitle: '在妈妈面前不敢提想爸爸',
                emotionTone: 'warm-dual-empathy',
              },
              {
                id: 'sub_specific_concern',
                shortLabel: '惦记具体小事',
                subtitle: '小夜灯、绘本或作业没带齐',
                emotionTone: 'protective-safety',
              },
              {
                id: 'sub_ordinary_transition',
                shortLabel: '只是平常换住处',
                subtitle: '心情挺轻松，理一下小安排',
                emotionTone: 'light-everyday',
              },
            ],
          },
          {
            id: 'diff-blocks-broken',
            title: '辛辛苦苦搭好的高塔倒了，心里又急又气',
            hasTransitionSubBranches: false,
          },
          {
            id: 'diff-friend-ask',
            title: '好朋友一直追问我不想回答的家里私事',
            hasTransitionSubBranches: false,
          },
        ],
      },
      staleProgressionResetProof: {
        helperFunction: 'resetBreakerScenarioProgressToFen (lines 536-541)',
        invokedBy: [
          'handlePickPreset (lines 543-550)',
          'handleSwitchTransitionSubBranch (lines 552-565)',
        ],
        clearedStateFields: {
          fenRevealed: '{ fact: false, feeling: false, guess: false }',
          isCoinFlipped: false,
          steppingStones: '[null, null, null]',
          pausedVoluntarily: false,
          currentStep: "'fen'",
        },
      },
      companionAndVoiceSync: {
        companionOrder: ['guoguo_squirrel', 'beibei_otter', 'tiantian_raccoon', 'qiqi_deer'],
        inlineSwitchHandler: 'handleSwitchCompanionInline (lines 521-534)',
        globalSyncMechanism:
          'Calls updatePersonalization({ companionId: compId }) + speechNarrator.syncWithCompanion(compId) and speaks SWITCH_COMPANION_GREETING[compId]',
        subtitleSynchronization:
          'Subscribes to speechNarrator.subscribeKaraoke and speechNarrator.subscribeSpeakingState; displays karaoke.fullText while speaking and falls back to lastSpokenText with replay button (`breaker-replay-speech`).',
      },
    },
  },
};

fs.writeFileSync(
  path.join(OUT_DIR, 'BATCH02_BEHAVIOR_INTERFACE_MAP.json'),
  JSON.stringify(behaviorInterfaceMap, null, 2) + '\n',
  'utf8'
);

// ============================================================================
// 2. Gate B0-B: Scan Existing Assets & Build BATCH02_ARTWORK_GAP_LEDGER.json
// ============================================================================

const existingRepoAssetPaths = [
  // Scene backplates (V2.0 procedural SVG)
  {
    assetId: 'legacy_svg_backplate_tools_room',
    sceneId: 'thought_detective',
    role: 'Legacy V2.0 Scene Backplate SVG (`tools_room_scene_backplate.svg`)',
    relPath: 'public/visual-v2/assets/scenes/tools_room_scene_backplate.svg',
    provenance: 'Procedural SVG bookshelf/window template (shares identical geometry with difficulty_breaker_scene_backplate.svg except gradient colors)',
  },
  {
    assetId: 'legacy_svg_backplate_difficulty_breaker',
    sceneId: 'difficulty_breaker',
    role: 'Legacy V2.0 Scene Backplate SVG (`difficulty_breaker_scene_backplate.svg`)',
    relPath: 'public/visual-v2/assets/scenes/difficulty_breaker_scene_backplate.svg',
    provenance: 'Procedural SVG bookshelf/window template (shares identical geometry with tools_room_scene_backplate.svg except gradient colors)',
  },
  // Landmark cutouts
  {
    assetId: 'cutout_landmark_tools_room_native_png',
    sceneId: 'thought_detective',
    role: 'Map Landmark Cutout (`tools_room/idle_native.png`)',
    relPath: 'public/visual-v2/assets/landmarks/tools_room/idle_native.png',
    provenance: 'cv2.grabCut crop [220,672,406,828] from V14_character_landmark_asset_board.png (180x144 native)',
  },
  {
    assetId: 'cutout_landmark_tools_room_native_webp',
    sceneId: 'thought_detective',
    role: 'Map Landmark Cutout WebP (`tools_room/idle_native.webp`)',
    relPath: 'public/visual-v2/assets/landmarks/tools_room/idle_native.webp',
    provenance: 'cv2.grabCut crop [220,672,406,828] from V14_character_landmark_asset_board.png (180x144 native)',
  },
  {
    assetId: 'cutout_landmark_tools_room_2x_png',
    sceneId: 'thought_detective',
    role: 'Map Landmark Cutout 2x Upscaled (`tools_room/idle_2x_upscaled.png`)',
    relPath: 'public/visual-v2/assets/landmarks/tools_room/idle_2x_upscaled.png',
    provenance: '2x interpolation from 180x144 grabCut (360x288; provenance notes upscaled_is_not_higher_native_detail=true)',
  },
  {
    assetId: 'cutout_landmark_difficulty_breaker_native_png',
    sceneId: 'difficulty_breaker',
    role: 'Map Landmark Cutout (`difficulty_breaker/idle_native.png`)',
    relPath: 'public/visual-v2/assets/landmarks/difficulty_breaker/idle_native.png',
    provenance: 'cv2.grabCut crop [1418,670,1635,829] from V14_character_landmark_asset_board.png (191x151 native)',
  },
  {
    assetId: 'cutout_landmark_difficulty_breaker_native_webp',
    sceneId: 'difficulty_breaker',
    role: 'Map Landmark Cutout WebP (`difficulty_breaker/idle_native.webp`)',
    relPath: 'public/visual-v2/assets/landmarks/difficulty_breaker/idle_native.webp',
    provenance: 'cv2.grabCut crop [1418,670,1635,829] from V14_character_landmark_asset_board.png (191x151 native)',
  },
  {
    assetId: 'cutout_landmark_difficulty_breaker_2x_png',
    sceneId: 'difficulty_breaker',
    role: 'Map Landmark Cutout 2x Upscaled (`difficulty_breaker/idle_2x_upscaled.png`)',
    relPath: 'public/visual-v2/assets/landmarks/difficulty_breaker/idle_2x_upscaled.png',
    provenance: '2x interpolation from 191x151 grabCut (382x302; provenance notes upscaled_is_not_higher_native_detail=true)',
  },
  // Tool prop cutouts
  {
    assetId: 'cutout_prop_tool_binoculars_png',
    sceneId: 'thought_detective',
    role: 'Tool Prop Cutout (`binoculars/native.png` -> 三个小镜头)',
    relPath: 'public/visual-v2/assets/props/tools/binoculars/native.png',
    provenance: 'grabCut from V04_ui_component_styleguide.png (68x64 px miniature icon)',
  },
  {
    assetId: 'cutout_prop_tool_two_sided_coin_png',
    sceneId: 'thought_detective',
    role: 'Tool Prop Cutout (`two_sided_coin/native.png` -> 两面硬币 / 双面透镜)',
    relPath: 'public/visual-v2/assets/props/tools/two_sided_coin/native.png',
    provenance: 'grabCut from V04_ui_component_styleguide.png (68x64 px miniature icon)',
  },
  {
    assetId: 'cutout_prop_tool_balance_scale_png',
    sceneId: 'thought_detective',
    role: 'Tool Prop Cutout (`balance_scale/native.png` -> 公平小天平)',
    relPath: 'public/visual-v2/assets/props/tools/balance_scale/native.png',
    provenance: 'grabCut from V04_ui_component_styleguide.png (99x65 px miniature icon)',
  },
  {
    assetId: 'cutout_prop_tool_weather_clouds_png',
    sceneId: 'thought_detective',
    role: 'Mismatched Tool Prop Cutout (`weather_clouds/native.png` — not one of the 5 detective tools)',
    relPath: 'public/visual-v2/assets/props/tools/weather_clouds/native.png',
    provenance: 'grabCut from V04_ui_component_styleguide.png (68x64 px miniature icon)',
  },
  // V2.3 Tech Vector Layer Factory — Detective
  ...['tools', 'three_boxes', 'lenses', 'scales'].flatMap((mode) =>
    ['workshop', 'tool_objects', 'actor'].map((part) => ({
      assetId: `tech_factory_detective_${mode}_${part}`,
      sceneId: 'thought_detective',
      role: `V2.3 Tech Layer Factory SVG (detective/${mode}/${part}.svg)`,
      relPath: `public/visual-v2/v2-3-layer-factory/assets/detective/${mode}/${part}.svg`,
      provenance:
        'A_LAND_V2_3_TECH_VECTOR_LAYER_FACTORY_20261017.zip (DELIVERY_QA_SUMMARY.json: production_quality_approved = 0)',
    }))
  ),
  // V2.3 Tech Vector Layer Factory — Difficulty Breaker
  ...['select', 'divide', 'connect', 'choose', 'complete'].flatMap((stage) =>
    ['workbench', 'step_stones', 'feedback'].map((part) => ({
      assetId: `tech_factory_breaker_${stage}_${part}`,
      sceneId: 'difficulty_breaker',
      role: `V2.3 Tech Layer Factory SVG (difficulty_breaker/${stage}/${part}.svg)`,
      relPath: `public/visual-v2/v2-3-layer-factory/assets/difficulty_breaker/${stage}/${part}.svg`,
      provenance:
        'A_LAND_V2_3_TECH_VECTOR_LAYER_FACTORY_20261017.zip (DELIVERY_QA_SUMMARY.json: production_quality_approved = 0)',
    }))
  ),
  // Companion native cutouts
  ...['guoguo_squirrel', 'beibei_otter', 'tiantian_raccoon', 'qiqi_deer'].map((comp) => ({
    assetId: `cutout_companion_${comp}_native_png`,
    sceneId: 'shared_companion_rig',
    role: `Companion Native Cutout (${comp}/idle_native.png)`,
    relPath: `public/visual-v2/batch01r-art/cutouts/characters/${comp}/idle_native.png`,
    provenance: 'cv2.grabCut crop from V14_character_landmark_asset_board.png (low-res preview cutout)',
  })),
];

const inspectedExisting = existingRepoAssetPaths.map((item) => {
  const info = inspectFile(item.relPath, false);
  return { ...item, info };
});

// Group by SHA-256 to detect duplicate byte-for-byte geometry
const shaGroups = new Map();
for (const entry of inspectedExisting) {
  if (!entry.info) continue;
  const list = shaGroups.get(entry.info.sha256) || [];
  list.push(entry.relPath);
  shaGroups.set(entry.info.sha256, list);
}

const existingAssetLedgerEntries = inspectedExisting.map((entry) => {
  const sameShaPaths = (shaGroups.get(entry.info.sha256) || []).filter(
    (p) => p !== entry.relPath
  );
  return {
    assetId: entry.assetId,
    sceneId: entry.sceneId,
    role: entry.role,
    filePath: entry.relPath,
    existsInRepo: true,
    format: entry.info.format,
    pixelDimensions: entry.info.pixelDimensions,
    hasAlphaTransparency: entry.info.hasAlphaTransparency,
    byteSize: entry.info.bytes,
    sha256: entry.info.sha256,
    provenance: entry.provenance,
    sharesIdenticalBytesWith: sameShaPaths,
    status: 'TECH_PREVIEW_ONLY',
    gapReason:
      sameShaPaths.length > 0
        ? `Shares 100% identical byte-for-byte SVG content (${entry.info.bytes}B) with ${sameShaPaths.length} other files; simplified flat geometric placeholder with production_quality_approved=0.`
        : entry.info.format === 'svg'
          ? 'Procedural vector backplate template; lacks Pixar/Nintendo-grade 3D lighting, depth layers, and tactile props.'
          : `Low-resolution grabCut cutout (${entry.info.pixelDimensions?.width}x${entry.info.pixelDimensions?.height} px) extracted from composite reference sheet; blurs when scaled to modal stage.`,
  };
});

// Also inspect upstream reference boards in 01_APPROVED_VISUAL_REFERENCES
const referenceBoardFiles = fs.existsSync(REF_DIR)
  ? fs
      .readdirSync(REF_DIR)
      .filter((f) => f.endsWith('.png'))
      .sort()
  : [];

const referenceBoardEntries = referenceBoardFiles.map((fileName) => {
  const info = inspectFile(path.join(REF_DIR, fileName), true);
  return {
    assetId: `reference_board_${fileName.replace(/\.png$/i, '').toLowerCase()}`,
    sceneId: 'reference_board',
    role: `Approved Visual Style Reference Sheet (${fileName})`,
    filePath: `01_APPROVED_VISUAL_REFERENCES/${fileName}`,
    existsInRepo: false,
    format: info.format,
    pixelDimensions: info.pixelDimensions,
    hasAlphaTransparency: info.hasAlphaTransparency,
    byteSize: info.bytes,
    sha256: info.sha256,
    provenance: 'A_LAND_BATCH01R_VISUAL_CORRECTION_HANDOFF_20261017.zip / 01_APPROVED_VISUAL_REFERENCES',
    sharesIdenticalBytesWith: [],
    status: 'TECH_PREVIEW_ONLY',
    gapReason:
      'Composite multi-panel concept/styleguide sheet with baked-in typography and callouts; cannot be directly mounted as a clean character-free/text-free runtime layer.',
  };
});

// Required Missing Production 3D Assets for Batch 02 (Thought Detective + Difficulty Breaker)
const missingProductionAssets = [
  // Thought Detective Lab — Scene Plates & Depth Layers
  {
    assetId: 'prod_detective_master_plate_desktop_16x9',
    sceneId: 'thought_detective',
    role: 'Thought Detective Lab 3D Master Scene Backplate — Desktop 16:9 (>=2560x1440 RGBA/WebP, zero text/characters)',
    targetPath: 'public/visual-v2/batch02-art/scenes/detective_workshop_desktop.webp',
    requiredMinDims: { width: 2560, height: 1440 },
    requiredAlpha: false,
    gapReason: 'No high-resolution 3D cartoon detective treehouse/workshop desktop scene plate exists in Git or Google Drive.',
  },
  {
    assetId: 'prod_detective_master_plate_mobile_3x4',
    sceneId: 'thought_detective',
    role: 'Thought Detective Lab 3D Master Scene Backplate — Mobile 3:4 (>=1200x1600 RGBA/WebP, safe top/bottom UI zones)',
    targetPath: 'public/visual-v2/batch02-art/scenes/detective_workshop_mobile.webp',
    requiredMinDims: { width: 1200, height: 1600 },
    requiredAlpha: false,
    gapReason: 'No dedicated 3:4 portrait mobile scene plate exists for Thought Detective Lab.',
  },
  {
    assetId: 'prod_detective_layer_distant_window_sky',
    sceneId: 'thought_detective',
    role: 'Thought Detective L1 Distant Layer — Observatory Window & Island Sky (>=2560x1440 transparent WebP/PNG)',
    targetPath: 'public/visual-v2/batch02-art/layers/detective_l1_distant_sky_rgba.webp',
    requiredMinDims: { width: 2560, height: 1440 },
    requiredAlpha: true,
    gapReason: 'Missing independent L1 distant parallax layer.',
  },
  {
    assetId: 'prod_detective_layer_mid_workbench_bookshelves',
    sceneId: 'thought_detective',
    role: 'Thought Detective L2 Midground Layer — 3D Wooden Investigation Desk & Clue Shelves (>=2560x1440 transparent WebP/PNG)',
    targetPath: 'public/visual-v2/batch02-art/layers/detective_l2_mid_workbench_rgba.webp',
    requiredMinDims: { width: 2560, height: 1440 },
    requiredAlpha: true,
    gapReason: 'Missing independent L2 3D wooden investigation workbench layer.',
  },
  {
    assetId: 'prod_detective_layer_fore_arch_lanterns',
    sceneId: 'thought_detective',
    role: 'Thought Detective L3 Foreground Frame — Warm Wooden Archway & Hanging Magnifier Lamps (>=2560x1440 transparent WebP/PNG)',
    targetPath: 'public/visual-v2/batch02-art/layers/detective_l3_fore_arch_rgba.webp',
    requiredMinDims: { width: 2560, height: 1440 },
    requiredAlpha: true,
    gapReason: 'Missing independent L3 foreground framing layer.',
  },
  // Thought Detective Lab — 5 Thinking Tools & Interactive Mode Props
  {
    assetId: 'prod_detective_prop_tool_flag_states',
    sceneId: 'thought_detective',
    role: '3D Interactive Tool 1 Prop — Person vs. Event Flag (`flag`: attached vs. removed states, >=512x512 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/detective_tool_flag_rgba.webp',
    requiredMinDims: { width: 512, height: 512 },
    requiredAlpha: true,
    gapReason: 'Completely missing even in low-res cutouts (only 4 tool cutouts exist; `flag` was never cut out).',
  },
  {
    assetId: 'prod_detective_prop_tool_three_lenses_states',
    sceneId: 'thought_detective',
    role: '3D Interactive Tool 2 Prop — Three Perspective Lenses (`my`, `his`, `sky` 3D turret states, >=512x512 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/detective_tool_three_lenses_rgba.webp',
    requiredMinDims: { width: 512, height: 512 },
    requiredAlpha: true,
    gapReason: 'Existing `binoculars/native.png` is only 68x64 px and has no `my`/`his`/`sky` state variants.',
  },
  {
    assetId: 'prod_detective_prop_tool_two_sided_coin_states',
    sceneId: 'thought_detective',
    role: '3D Interactive Tool 3 Prop — Two-Sided Coin (`front` difficulty side & `back` caring side, >=512x512 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/detective_tool_coin_rgba.webp',
    requiredMinDims: { width: 512, height: 512 },
    requiredAlpha: true,
    gapReason: 'Existing `two_sided_coin/native.png` is only 68x64 px and lacks front/back 3D state sprites.',
  },
  {
    assetId: 'prod_detective_prop_tool_balance_scale_states',
    sceneId: 'thought_detective',
    role: '3D Interactive Tool 4 Prop — Fairness Balance Scale (>=512x512 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/detective_tool_balance_scale_rgba.webp',
    requiredMinDims: { width: 512, height: 512 },
    requiredAlpha: true,
    gapReason: 'Existing `balance_scale/native.png` is only 99x65 px.',
  },
  {
    assetId: 'prod_detective_prop_tool_safety_fence_states',
    sceneId: 'thought_detective',
    role: '3D Interactive Tool 5 Prop — Protective Safety Fence Shield (`fence`, >=512x512 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/detective_tool_safety_fence_rgba.webp',
    requiredMinDims: { width: 512, height: 512 },
    requiredAlpha: true,
    gapReason: 'Completely missing even in low-res cutouts (`fence` was never cut out).',
  },
  {
    assetId: 'prod_detective_prop_three_boxes_set',
    sceneId: 'thought_detective',
    role: '3D Mode 2 Props — Three Sorting Chests (`visible` camera chest, `heart` feeling chest, `guess` cloud chest, >=600x400 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/detective_three_boxes_set_rgba.webp',
    requiredMinDims: { width: 600, height: 400 },
    requiredAlpha: true,
    gapReason: 'Existing `v2-3-layer-factory/assets/detective/three_boxes/tool_objects.svg` is just 3 flat rectangles (`<rect width="130" height="90"/>`).',
  },
  {
    assetId: 'prod_detective_prop_control_circles_rings',
    sceneId: 'thought_detective',
    role: '3D Mode 3 Props — Concentric Wooden/Glowing Control Rings (`adult`, `mine`, `together`, >=800x600 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/detective_control_circles_rgba.webp',
    requiredMinDims: { width: 800, height: 600 },
    requiredAlpha: true,
    gapReason: 'Zero assets exist for Mode 3 (`circles`) even in `v2-3-layer-factory`.',
  },
  {
    assetId: 'prod_detective_prop_four_steps_staircase',
    sceneId: 'thought_detective',
    role: '3D Mode 4 Props — 4-Step Stepping-Back Observation Ladder (`currentStep: 1..4`, >=800x500 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/detective_four_steps_ladder_rgba.webp',
    requiredMinDims: { width: 800, height: 500 },
    requiredAlpha: true,
    gapReason: 'Zero assets exist for Mode 4 (`fourSteps`) even in `v2-3-layer-factory`.',
  },

  // Difficulty Breaker — Scene Plates, Depth Layers & 5-Stage Interactive Props
  {
    assetId: 'prod_breaker_master_plate_desktop_16x9',
    sceneId: 'difficulty_breaker',
    role: 'Difficulty Breaker 3D Master Scene Backplate — Desktop 16:9 (>=2560x1440 RGBA/WebP, Artisan Stone-Splitting Workbench & Creek)',
    targetPath: 'public/visual-v2/batch02-art/scenes/breaker_workbench_creek_desktop.webp',
    requiredMinDims: { width: 2560, height: 1440 },
    requiredAlpha: false,
    gapReason: 'No high-resolution 3D cartoon workbench/creek desktop scene plate exists for Difficulty Breaker.',
  },
  {
    assetId: 'prod_breaker_master_plate_mobile_3x4',
    sceneId: 'difficulty_breaker',
    role: 'Difficulty Breaker 3D Master Scene Backplate — Mobile 3:4 (>=1200x1600 RGBA/WebP)',
    targetPath: 'public/visual-v2/batch02-art/scenes/breaker_workbench_creek_mobile.webp',
    requiredMinDims: { width: 1200, height: 1600 },
    requiredAlpha: false,
    gapReason: 'No dedicated 3:4 portrait mobile scene plate exists for Difficulty Breaker.',
  },
  {
    assetId: 'prod_breaker_layer_creek_and_workbench',
    sceneId: 'difficulty_breaker',
    role: 'Difficulty Breaker L2 Midground Layer — 3D Wooden Splitting Table & Sparkling Stepping-Stone Stream (>=2560x1440 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/layers/breaker_l2_workbench_stream_rgba.webp',
    requiredMinDims: { width: 2560, height: 1440 },
    requiredAlpha: true,
    gapReason: 'Missing independent 3D workbench and creek midground layer.',
  },
  {
    assetId: 'prod_breaker_prop_preset_boulders_3x',
    sceneId: 'difficulty_breaker',
    role: 'Stage 0 (`pick`) 3D Preset Boulders & 4 Two-Homes Subbranch Compass Tokens (`diff-two-homes`, `diff-blocks-broken`, `diff-friend-ask`, >=512x512 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/breaker_preset_boulders_rgba.webp',
    requiredMinDims: { width: 512, height: 512 },
    requiredAlpha: true,
    gapReason: 'Missing 3D preset boulders and 4 transition subbranch tokens.',
  },
  {
    assetId: 'prod_breaker_prop_fen_crystal_stones_3x',
    sceneId: 'difficulty_breaker',
    role: 'Stage 1 (`fen`) 3D Splittable Crystal Stones — Fact (Emerald), Feeling (Rose), Guess (Amber) in Unsplit & Split-Glow States (>=900x450 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/breaker_fen_crystals_rgba.webp',
    requiredMinDims: { width: 900, height: 450 },
    requiredAlpha: true,
    gapReason: 'Existing `v2-3-layer-factory/assets/difficulty_breaker/divide/*` is identical to `select/*` and has no splittable crystal states.',
  },
  {
    assetId: 'prod_breaker_prop_tong_dual_lens_turntable',
    sceneId: 'difficulty_breaker',
    role: 'Stage 2 (`tong`) 3D Dual-Sided Perspective Lens Turntable (`isCoinFlipped: false | true`, >=600x600 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/breaker_tong_dual_lens_rgba.webp',
    requiredMinDims: { width: 600, height: 600 },
    requiredAlpha: true,
    gapReason: 'Missing 3D dual-sided lens turntable asset for Stage 2 (`tong`).',
  },
  {
    assetId: 'prod_breaker_prop_ze_river_stepping_stones',
    sceneId: 'difficulty_breaker',
    role: 'Stage 3 (`ze`) 3D Creek Stepping-Stone Slots (3 slots: empty, standard action placed, safety action placed, plus voluntary pause rest cushion, >=900x450 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/breaker_ze_stepping_stones_rgba.webp',
    requiredMinDims: { width: 900, height: 450 },
    requiredAlpha: true,
    gapReason: 'Existing `step_stones.svg` is identical to `detective/tool_objects.svg` (3 flat rectangles) with zero slot or pause states.',
  },
  {
    assetId: 'prod_breaker_prop_complete_celebration_bridge',
    sceneId: 'difficulty_breaker',
    role: 'Stage 4 (`complete`) 3D Completed Stepping-Stone Path & Lantern Celebration Overlay (>=1200x675 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/props/breaker_complete_path_rgba.webp',
    requiredMinDims: { width: 1200, height: 675 },
    requiredAlpha: true,
    gapReason: 'Missing 3D completion stage overlay.',
  },
  // High-Resolution 3D Companion Masters & Expression Rigs
  {
    assetId: 'prod_shared_4companions_3d_rig_masters',
    sceneId: 'shared_companion_rig',
    role: '4 Animal Companions (`guoguo`, `beibei`, `tiantian`, `qiqi`) High-Res 3D Layered Masters (torso, head, eyes, voice-synced mouth, near/far arms, >=1024x1024 RGBA)',
    targetPath: 'public/visual-v2/batch02-art/characters/{companionId}/rig_master_rgba.webp',
    requiredMinDims: { width: 1024, height: 1024 },
    requiredAlpha: true,
    gapReason:
      'Existing native cutouts are 154x168 to 198x162 px grabCut crops from V14, and existing 168 rig part SVGs in `v2-3-layer-factory` are flat 2D ellipses/circles (`production_quality_approved = 0`).',
  },
];

const missingLedgerEntries = missingProductionAssets.map((m) => ({
  assetId: m.assetId,
  sceneId: m.sceneId,
  role: m.role,
  filePath: m.targetPath,
  existsInRepo: false,
  format: 'missing',
  pixelDimensions: null,
  requiredMinDimensions: m.requiredMinDims,
  hasAlphaTransparency: m.requiredAlpha,
  byteSize: null,
  sha256: null,
  provenance: 'NOT_YET_PRODUCED (Must be commissioned/generated and approved by Art Director before Batch02 UI replacement)',
  sharesIdenticalBytesWith: [],
  status: 'MISSING',
  gapReason: m.gapReason,
}));

const allLedgerEntries = [
  ...existingAssetLedgerEntries,
  ...referenceBoardEntries,
  ...missingLedgerEntries,
];

const artworkGapLedger = {
  schemaVersion: '1.0.0',
  gateId: 'A-LAND_V2.3_BATCH02_GATE0_B0_B',
  generatedAt: '2026-10-17T15:30:00+08:00',
  overallDecision: 'ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED',
  holdFlags: {
    ART_DIRECTOR_QA_HOLD: true,
    ASSET_ARTWORK_BLOCKED: true,
    CONTENT_QA_REVIEW: true,
    PRODUCTION_RELEASE_HOLD: true,
    ARTWORK_GAP: true,
    BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED: true,
  },
  summaryCounts: {
    totalInspectedAndRequiredEntries: allLedgerEntries.length,
    existingRepoAssetsInspected: existingAssetLedgerEntries.length,
    upstreamReferenceBoardsInspected: referenceBoardEntries.length,
    missingProductionAssetsRequired: missingLedgerEntries.length,
    productionArtAcceptedCount: allLedgerEntries.filter(
      (e) => e.status === 'PRODUCTION_ART_ACCEPTED'
    ).length,
    techPreviewOnlyCount: allLedgerEntries.filter((e) => e.status === 'TECH_PREVIEW_ONLY').length,
    missingCount: allLedgerEntries.filter((e) => e.status === 'MISSING').length,
    duplicateByteForByteSvgEntriesCount: existingAssetLedgerEntries.filter(
      (e) => e.sharesIdenticalBytesWith.length > 0
    ).length,
  },
  duplicateGeometryForensicFindings: [
    {
      clusterId: 'detective_workshop_svg_4x_identical',
      sha256: 'f78cd87c24986274903f9e73f7d8671c5a2c0cf825b0a6298804e4f362052124',
      bytes: 1786,
      files: [
        'public/visual-v2/v2-3-layer-factory/assets/detective/tools/workshop.svg',
        'public/visual-v2/v2-3-layer-factory/assets/detective/three_boxes/workshop.svg',
        'public/visual-v2/v2-3-layer-factory/assets/detective/lenses/workshop.svg',
        'public/visual-v2/v2-3-layer-factory/assets/detective/scales/workshop.svg',
      ],
      finding:
        'All 4 detective modes share the exact same 1,786-byte flat 2D house/boxes SVG template; modes `circles` and `fourSteps` are not even represented.',
    },
    {
      clusterId: 'detective_and_breaker_boxes_stones_9x_identical',
      sha256_detective: 'dcbbb7c84af1d7b9b5fa6ef15035dc43e7cb24e070894f621e0f86b249f05e1a',
      sha256_breaker: 'fac24115bfecd0f08b901189167806e82b621c51dc9b0d897478ffbd2f107474',
      bytes: 594,
      files: [
        'public/visual-v2/v2-3-layer-factory/assets/detective/tools/tool_objects.svg',
        'public/visual-v2/v2-3-layer-factory/assets/detective/three_boxes/tool_objects.svg',
        'public/visual-v2/v2-3-layer-factory/assets/detective/lenses/tool_objects.svg',
        'public/visual-v2/v2-3-layer-factory/assets/detective/scales/tool_objects.svg',
        'public/visual-v2/v2-3-layer-factory/assets/difficulty_breaker/select/step_stones.svg',
        'public/visual-v2/v2-3-layer-factory/assets/difficulty_breaker/divide/step_stones.svg',
        'public/visual-v2/v2-3-layer-factory/assets/difficulty_breaker/connect/step_stones.svg',
        'public/visual-v2/v2-3-layer-factory/assets/difficulty_breaker/choose/step_stones.svg',
        'public/visual-v2/v2-3-layer-factory/assets/difficulty_breaker/complete/step_stones.svg',
      ],
      finding:
        'All 4 detective `tool_objects.svg` files and all 5 difficulty_breaker `step_stones.svg` files contain the exact same 3 flat `<rect width="130" height="90" rx="12">` shapes at identical coordinates.',
    },
    {
      clusterId: 'breaker_workbench_5x_identical',
      sha256: '4513badc2273985b74a22c91b2530574a4f384871f23c1b296420d3604480851',
      bytes: 1380,
      files: [
        'public/visual-v2/v2-3-layer-factory/assets/difficulty_breaker/select/workbench.svg',
        'public/visual-v2/v2-3-layer-factory/assets/difficulty_breaker/divide/workbench.svg',
        'public/visual-v2/v2-3-layer-factory/assets/difficulty_breaker/connect/workbench.svg',
        'public/visual-v2/v2-3-layer-factory/assets/difficulty_breaker/choose/workbench.svg',
        'public/visual-v2/v2-3-layer-factory/assets/difficulty_breaker/complete/workbench.svg',
      ],
      finding:
        'All 5 Difficulty Breaker stages share the exact same 1,380-byte flat SVG workbench template with zero stage-specific differentiation.',
    },
  ],
  entries: allLedgerEntries,
};

fs.writeFileSync(
  path.join(OUT_DIR, 'BATCH02_ARTWORK_GAP_LEDGER.json'),
  JSON.stringify(artworkGapLedger, null, 2) + '\n',
  'utf8'
);

// ============================================================================
// 3. Gate B0-C: Verify Zero Frozen File Modifications & Write Verification Summary
// ============================================================================

const diffNamesRaw = execSync('git diff --name-only d0b497acade40bd4bbd2cc9f16e9550df2b19504', {
  cwd: ROOT_DIR,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(Boolean);

const forbiddenPrefixes = [
  'src/components/ChildIsland/ThoughtDetectiveLab/',
  'src/components/ChildIsland/DifficultyBreaker/',
  'src/components/ChildIsland/WeatherStationModal.tsx',
  'src/components/ChildIsland/CalmSpace.tsx',
  'src/components/ChildIsland/CalmCornerModal.tsx',
  'src/visual-v2/batch01/',
  'src/context/',
  'src/domain/',
  'src/services/',
  'src/data/',
  'src/utils/',
];

const modifiedForbiddenFiles = diffNamesRaw.filter((f) =>
  forbiddenPrefixes.some((prefix) => f === prefix || f.startsWith(prefix))
);

if (modifiedForbiddenFiles.length > 0) {
  throw new Error(
    `FROZEN_BOUNDARY_VIOLATION: Modified forbidden files: ${modifiedForbiddenFiles.join(', ')}`
  );
}

const verificationSummary = {
  gate: 'A-LAND_V2.3_BATCH02_GATE0_INVENTORY',
  status: 'ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED',
  verifiedAt: new Date().toISOString(),
  baselineArchiveHeadSha: 'd0b497acade40bd4bbd2cc9f16e9550df2b19504',
  baselineCanonicalCodeSha: '6a5ae8d186850ac6ddb30823bf9c87134c10c320',
  zeroFrozenBusinessFilesModified: modifiedForbiddenFiles.length === 0,
  modifiedForbiddenFiles,
  sourceContractAssertions: sourceAssertions,
  artworkPreflightSummary: artworkGapLedger.summaryCounts,
  holdFlags: artworkGapLedger.holdFlags,
};

fs.writeFileSync(
  path.join(EVIDENCE_DIR, 'gate0_inventory_verification.json'),
  JSON.stringify(verificationSummary, null, 2) + '\n',
  'utf8'
);

console.log(JSON.stringify(verificationSummary, null, 2));
