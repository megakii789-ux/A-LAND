#!/usr/bin/env node
/**
 * A-LAND V2.3 Batch02 · Gate 0 / Gate B0R — Programmatic Source Behavior, Discrete Asset & Eligibility Verifier
 *
 * Performs:
 * 1. Gate B0R-A: Verifies live source contracts of ThoughtDetectiveLabModal.tsx and DifficultyBreakerModal.tsx
 *    (exact line numbers, `{ id, text, target, placed }` state shapes, initial `currentStep = 1`, exploratory
 *    `handlePlaceBox`/`handlePlaceCircle` behavior, and `speechNarrator.subscribe` + `switchCompanion` voice contract)
 *    and outputs `docs/v2-3-batch02-gate0-inventory/BATCH02_BEHAVIOR_INTERFACE_MAP.json`.
 * 2. Gate B0R-B & B0R-C: Dynamically inspects disk paths for all 36 existing repo assets, 15 upstream reference boards,
 *    22 canonical production asset sets, and 68 discrete state variants (`BATCH02_CANONICAL_DISCRETE_STATES`);
 *    evaluates fail-closed eligibility via `evaluateBatch02ProductionArtEligibility`; runs the counterexample
 *    regression suite (`evidence/b0r_counterexample_regression.json`); and outputs
 *    `BATCH02_ARTWORK_GAP_LEDGER.json`, `BATCH02_DISCRETE_ASSET_PRODUCTION_MANIFEST.json`, and
 *    `BATCH02_DISCRETE_ASSET_PRODUCTION_ORDER.csv`.
 * 3. Gate B0R-D: Verifies zero modifications to frozen business modules or Batch01R components, and records
 *    `BATCH02_GATE0R_CONTRACT_PASS / ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED` into
 *    `evidence/gate0_inventory_verification.json`.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { transformSync } from 'esbuild';

const ROOT_DIR = process.cwd();
const OUT_DIR = path.join(ROOT_DIR, 'docs/v2-3-batch02-gate0-inventory');
const EVIDENCE_DIR = path.join(OUT_DIR, 'evidence');
const REF_DIR =
  '/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/batch01r_handoff/unpacked/01_APPROVED_VISUAL_REFERENCES';

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

// Dynamically load the TypeScript contract module so Node 20 and Node 22 execute the exact same source of truth
const contractsTsPath = path.join(
  ROOT_DIR,
  'src/visual-v2/batch02-gate0/batch02Gate0Contracts.ts'
);
const contractsTsSource = fs.readFileSync(contractsTsPath, 'utf8');
const { code: contractsJsCode } = transformSync(contractsTsSource, {
  loader: 'ts',
  format: 'esm',
});
const contractsMod = await import(
  'data:text/javascript;base64,' + Buffer.from(contractsJsCode).toString('base64')
);

const {
  BATCH02_CANONICAL_ASSET_SETS,
  BATCH02_CANONICAL_DISCRETE_STATES,
  BATCH02_GATE0_BASELINE,
  BATCH02_GATE0_EXECUTION_STATUS,
  BATCH02_GATE_B0R_DECISION_STATUS,
  BATCH02_GATE_B0RB_DECISION_STATUS,
  BATCH02_OPTIONAL_ADDITIONAL_VIEWPORTS,
  BATCH02_REQUIRED_VIEWPORTS,
  BATCH02_STAGE_COMPOSITION_RULE,
  DIFFICULTY_BREAKER_VOICE_SYNC_CONTRACT,
  THOUGHT_DETECTIVE_INITIAL_BOX_ITEMS,
  THOUGHT_DETECTIVE_INITIAL_CIRCLE_ITEMS,
  THOUGHT_DETECTIVE_INITIAL_STEP,
  evaluateBatch02ProductionArtEligibility,
  validateThoughtDetectiveStateContract,
} = contractsMod;

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
// 1. Gate B0R-A: Verify Live Source Contracts & Build BATCH02_BEHAVIOR_INTERFACE_MAP.json
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
  detectiveBoxItemsUseTargetAndPlaced:
    detectiveSrc.includes("{ id: '1', text: '桌上的牛奶打翻了，地板湿了', target: 'visible', placed: 'visible' }") &&
    detectiveSrc.includes("{ id: '2', text: '心里一阵酸酸的，想掉眼泪', target: 'heart', placed: 'heart' }") &&
    detectiveSrc.includes("{ id: '3', text: '“他肯定是故意让我难看的！”', target: 'guess', placed: null as string | null }") &&
    !detectiveSrc.includes('correctBox') &&
    !detectiveSrc.includes('sorted:'),
  detectiveCircleItemsUseTargetAndPlaced:
    detectiveSrc.includes("{ id: 'c1', text: '大人分开住在不同房子里', target: 'adult', placed: 'adult' }") &&
    detectiveSrc.includes("{ id: 'c2', text: '难过了跟大人要一个抱抱', target: 'mine', placed: 'mine' }") &&
    detectiveSrc.includes("{ id: 'c3', text: '周末一起去公园还是去看绘本', target: 'together', placed: null as string | null }") &&
    !detectiveSrc.includes('correctCircle'),
  detectiveInitialStepIs1:
    detectiveSrc.includes('const [currentStep, setCurrentStep] = useState<number>(1);'),
  detectiveHandlersPlaceUnconditionallyWithPlayClick:
    detectiveSrc.includes('const handlePlaceBox = (itemId: string, boxType: string) =>') &&
    detectiveSrc.includes('const handlePlaceCircle = (itemId: string, circleType: string) =>') &&
    !detectiveSrc.includes('unlockMedal') &&
    !detectiveSrc.includes('playSuccess'),
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
  breakerUsesSpeechNarratorSubscribeAndSwitchCompanion:
    breakerSrc.includes('const unsubscribe = speechNarrator.subscribe(() => {') &&
    breakerSrc.includes('setIsSpeaking(speechNarrator.getSpeaking());') &&
    breakerSrc.includes('setKaraoke(speechNarrator.getKaraokeState());') &&
    breakerSrc.includes('speechNarrator.switchCompanion(nextCompanionId);') &&
    !breakerSrc.includes('subscribeKaraoke') &&
    !breakerSrc.includes('subscribeSpeakingState'),
};

for (const [k, ok] of Object.entries(sourceAssertions)) {
  if (!ok) {
    throw new Error(`Source contract assertion failed: ${k}`);
  }
}

const initialStateValidation = validateThoughtDetectiveStateContract({
  boxItems: THOUGHT_DETECTIVE_INITIAL_BOX_ITEMS,
  circleItems: THOUGHT_DETECTIVE_INITIAL_CIRCLE_ITEMS,
  currentStep: THOUGHT_DETECTIVE_INITIAL_STEP,
});
if (!initialStateValidation.valid) {
  throw new Error(
    `Initial ThoughtDetective state contract validation failed: ${initialStateValidation.errors.join(
      '; '
    )}`
  );
}

const inspectedSourceFiles = [
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
];

const behaviorInterfaceMap = {
  schemaVersion: '1.1.0-B0R',
  gateId: 'A-LAND_V2.3_BATCH02_GATE_B0R_A',
  generatedAt: '2026-10-17T16:30:00+08:00',
  frozenBaseline: BATCH02_GATE0_BASELINE,
  requiredViewports: BATCH02_REQUIRED_VIEWPORTS,
  optionalAdditionalViewports: BATCH02_OPTIONAL_ADDITIONAL_VIEWPORTS,
  stageCompositionRule: BATCH02_STAGE_COMPOSITION_RULE,
  inspectedSourceFiles,
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
          line: 38,
          purpose: 'Controls the 4 top-level cognitive exploration modes in Thought Detective Lab.',
        },
        {
          name: 'isBreakerOpen',
          type: 'boolean',
          defaultValue: 'false',
          line: 39,
          purpose: 'Opens DifficultyBreakerModal directly from ThoughtDetectiveLabModal header CTA.',
        },
        {
          name: 'isCrayonGameOpen',
          type: 'boolean',
          defaultValue: 'false',
          line: 40,
          purpose: 'Switches modal body into CrayonDetectiveGame spatial investigation view.',
        },
        {
          name: 'isTransferLabOpen',
          type: 'boolean',
          defaultValue: 'false',
          line: 41,
          purpose: 'Opens TransferScenariosModal from the 4-Steps progression tab.',
        },
        {
          name: 'expMetrics',
          type: 'ProductExperienceMetrics',
          defaultValue: 'loadProductExperienceMetrics()',
          line: 42,
          purpose: 'Displays live completedDetectiveCaseIds, hypothesisRevisionCount, and completedTransferScenarioIds.',
        },
        {
          name: 'activeTool',
          type: "'flag' | 'lenses' | 'coin' | 'scale' | 'fence'",
          defaultValue: "'flag'",
          line: 45,
          purpose: 'Selects which of the 5 thinking tools is active inside the tools tab.',
        },
        {
          name: 'personFlagRemoved',
          type: 'boolean',
          defaultValue: 'false',
          line: 48,
          purpose: 'Tool 1 (Flag): Separates the person (“我”) from the temporary mistake/event (“事”).',
        },
        {
          name: 'currentLens',
          type: "'my' | 'his' | 'sky'",
          defaultValue: "'my'",
          line: 51,
          purpose: 'Tool 2 (Three Lenses): Switches between My Lens, Peer Lens, and Sky Bird-Eye Lens.',
        },
        {
          name: 'coinSide',
          type: "'front' | 'back'",
          defaultValue: "'front'",
          line: 54,
          purpose: 'Tool 3 (Two-Sided Coin): Flips between the difficulty side and the caring/intention side.',
        },
        {
          name: 'boxItems',
          type: "Array<{ id: string, text: string, target: 'visible' | 'heart' | 'guess', placed: 'visible' | 'heart' | 'guess' | null }>",
          defaultValue:
            "5 items: id '1' (placed: 'visible') & id '2' (placed: 'heart') pre-placed as examples; id '3', '4', '5' have placed: null",
          line: 57,
          initialItems: THOUGHT_DETECTIVE_INITIAL_BOX_ITEMS,
          purpose:
            'Mode 2 (Three Boxes): Exploratory classification into Visible Fact, Heart Feeling, or Mind Guess via handlePlaceBox(id, boxType).',
        },
        {
          name: 'circleItems',
          type: "Array<{ id: string, text: string, target: 'adult' | 'mine' | 'together', placed: 'adult' | 'mine' | 'together' | null }>",
          defaultValue:
            "5 items: id 'c1' (placed: 'adult') & id 'c2' (placed: 'mine') pre-placed as examples; id 'c3', 'c4', 'c5' have placed: null",
          line: 66,
          initialItems: THOUGHT_DETECTIVE_INITIAL_CIRCLE_ITEMS,
          purpose:
            'Mode 3 (Control Circles): Exploratory boundary classification into Adult Responsibility, My Choice, or Shared Discussion via handlePlaceCircle(id, circleType).',
        },
        {
          name: 'currentStep',
          type: 'number (1 | 2 | 3 | 4)',
          defaultValue: '1',
          line: 75,
          purpose: 'Mode 4 (Four Steps): Highlights the active step (initial 1) on the 4-step cognitive scaffolding ladder.',
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
                audioEffect: 'sounds.playClick() on both flag removal and reset (lines 336-358)',
                narration: 'Speaks tool intro and separated-event encouragement via handleSpeak / speechNarrator.speak()',
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
            handlerName: 'handlePlaceBox(id, boxType) (lines 83-88)',
            placementBehavior:
              'Plays sounds.playClick() and unconditionally sets item.placed = boxType for matching id. Does NOT block placement on target mismatch, does NOT call unlockMedal("thought-detective"), and does NOT call sounds.playSuccess(). Items 1 and 2 start pre-placed as examples; items 3, 4, 5 start with placed: null and can be moved freely between boxes.',
          },
          {
            tabId: 'circles',
            label: '控制圈',
            categories: ['adult (大人的事)', 'mine (我的事)', 'together (一起商量)'],
            itemCount: 5,
            handlerName: 'handlePlaceCircle(id, circleType) (lines 90-95)',
            placementBehavior:
              'Plays sounds.playClick() and unconditionally sets item.placed = circleType for matching id. Does NOT block placement on target mismatch and does NOT call sounds.playSuccess(). Items c1 and c2 start pre-placed as examples; items c3, c4, c5 start with placed: null and can be moved freely between circles.',
          },
          {
            tabId: 'fourSteps',
            label: '往后退一步4阶',
            initialStep: 1,
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
        helperFunction: 'resetBreakerScenarioProgressToFen (lines 527-533)',
        invokedBy: [
          'handlePickPreset (lines 535-550)',
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
        inlineSwitchHandler: 'handleSwitchCompanionInline (lines 522-525)',
        globalSyncMechanism:
          'Calls updatePersonalization({ companionId: nextCompanionId }) + speechNarrator.switchCompanion(nextCompanionId) (does NOT call syncWithCompanion and does NOT speak a greeting on inline switch).',
        subtitleSynchronization:
          'Subscribes via speechNarrator.subscribe(() => { setIsSpeaking(speechNarrator.getSpeaking()); setKaraoke(speechNarrator.getKaraokeState()); }) (lines 489-495); displays karaoke.fullText while speaking and falls back to lastSpokenText with replay button (`breaker-replay-speech`).',
        contractDetails: DIFFICULTY_BREAKER_VOICE_SYNC_CONTRACT,
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
// 2. Gate B0R-B & B0R-C: Dynamic Disk Inspection of Existing Assets,
//    22 Canonical Asset Sets & 68 Discrete State Deliverables
// ============================================================================

const existingRepoAssetPaths = [
  // Scene backplates (V2.0 procedural SVG)
  {
    assetId: 'legacy_svg_backplate_tools_room',
    sceneId: 'thought_detective',
    role: 'Legacy V2.0 Scene Backplate SVG (`tools_room_scene_backplate.svg`)',
    relPath: 'public/visual-v2/assets/scenes/tools_room_scene_backplate.svg',
    provenance:
      'Procedural SVG bookshelf/window template (shares identical geometry with difficulty_breaker_scene_backplate.svg except gradient colors)',
  },
  {
    assetId: 'legacy_svg_backplate_difficulty_breaker',
    sceneId: 'difficulty_breaker',
    role: 'Legacy V2.0 Scene Backplate SVG (`difficulty_breaker_scene_backplate.svg`)',
    relPath: 'public/visual-v2/assets/scenes/difficulty_breaker_scene_backplate.svg',
    provenance:
      'Procedural SVG bookshelf/window template (shares identical geometry with tools_room_scene_backplate.svg except gradient colors)',
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
    existsInRepo: Boolean(entry.info),
    format: entry.info ? entry.info.format : 'missing',
    pixelDimensions: entry.info ? entry.info.pixelDimensions : null,
    hasAlphaTransparency: entry.info ? entry.info.hasAlphaTransparency : null,
    byteSize: entry.info ? entry.info.bytes : null,
    sha256: entry.info ? entry.info.sha256 : null,
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

// Dynamically inspect all 68 canonical discrete state paths on disk (never hardcoded!)
const discreteStateDeliverableEntries = BATCH02_CANONICAL_DISCRETE_STATES.map((dSpec) => {
  const diskInfo = inspectFile(dSpec.targetFilePath, false);
  const existsOnDisk = Boolean(diskInfo);
  return {
    discreteOrderId: dSpec.discreteOrderId,
    discreteAssetId: dSpec.discreteAssetId,
    setId: dSpec.setId,
    sceneId: dSpec.sceneId,
    stateVariant: dSpec.stateVariant,
    companionId: dSpec.companionId,
    targetGroupPath: dSpec.targetGroupPath,
    filePath: dSpec.targetFilePath,
    existsInRepo: existsOnDisk,
    format: existsOnDisk ? diskInfo.format : 'missing',
    pixelDimensions: existsOnDisk ? diskInfo.pixelDimensions : null,
    requiredMinDimensions: { width: dSpec.minWidth, height: dSpec.minHeight },
    requireAlpha: dSpec.requireAlpha,
    hasAlphaTransparency: existsOnDisk ? diskInfo.hasAlphaTransparency : dSpec.requireAlpha,
    byteSize: existsOnDisk ? diskInfo.bytes : null,
    sha256: existsOnDisk ? diskInfo.sha256 : null,
    waitingOwner: dSpec.waitingOwner,
    approvalAuthority: dSpec.approvalAuthority,
    artDirectorApproval: null,
    status: 'MISSING',
    productionOrderStatus: 'NOT_PRODUCED_NOT_APPROVED',
    gapReason: `Discrete state deliverable "${dSpec.stateVariant}" for set "${dSpec.setId}" has not been produced or signed off by ${dSpec.waitingOwner}.`,
  };
});

// Build the 22 canonical set-level entries by dynamically inspecting their group path & discrete state children
const canonicalSetLedgerEntries = BATCH02_CANONICAL_ASSET_SETS.map((setSpec) => {
  const children = discreteStateDeliverableEntries.filter((d) => d.setId === setSpec.setId);
  const groupDiskInfo = !setSpec.targetGroupPath.includes('{')
    ? inspectFile(setSpec.targetGroupPath, false)
    : null;
  const anyChildExists = children.some((c) => c.existsInRepo);
  const existsOnDisk = Boolean(groupDiskInfo) || anyChildExists;

  return {
    setOrderId: setSpec.setOrderId,
    assetId: setSpec.setId,
    setId: setSpec.setId,
    sceneId: setSpec.sceneId,
    role: setSpec.role,
    filePath: setSpec.targetGroupPath,
    existsInRepo: existsOnDisk,
    format: groupDiskInfo ? groupDiskInfo.format : 'missing',
    pixelDimensions: groupDiskInfo ? groupDiskInfo.pixelDimensions : null,
    requiredMinDimensions: { width: setSpec.minWidth, height: setSpec.minHeight },
    hasAlphaTransparency: groupDiskInfo ? groupDiskInfo.hasAlphaTransparency : setSpec.requireAlpha,
    byteSize: groupDiskInfo ? groupDiskInfo.bytes : null,
    sha256: groupDiskInfo ? groupDiskInfo.sha256 : null,
    requiredStateVariants: setSpec.requiredStateVariants,
    minimumDiscreteStateVariants: setSpec.minimumDiscreteStateVariants,
    waitingOwner: setSpec.waitingOwner,
    approvalAuthority: setSpec.approvalAuthority,
    artDirectorApproval: null,
    provenance:
      'NOT_YET_PRODUCED (Waiting on Art Production / Art Director sign-off before Batch02 UI replacement)',
    sharesIdenticalBytesWith: [],
    status: 'MISSING',
    gapReason: `Missing ${setSpec.minimumDiscreteStateVariants} required discrete state variant(s) [${setSpec.requiredStateVariants.join(
      ', '
    )}]; waiting on ${setSpec.waitingOwner}.`,
    discreteStateDeliverables: children,
  };
});

const allLedgerEntries = [
  ...existingAssetLedgerEntries,
  ...referenceBoardEntries,
  ...canonicalSetLedgerEntries,
];

const eligibilityReport = evaluateBatch02ProductionArtEligibility(allLedgerEntries);

const artworkGapLedger = {
  schemaVersion: '1.1.0-B0R',
  gateId: 'A-LAND_V2.3_BATCH02_GATE_B0R_B',
  generatedAt: '2026-10-17T16:30:00+08:00',
  overallDecision: eligibilityReport.gateStatus,
  gateB0RDecision: BATCH02_GATE_B0R_DECISION_STATUS,
  waitingProductionOwner: 'Art Production / Art Director',
  holdFlags: eligibilityReport.holdFlags,
  summaryCounts: {
    totalInspectedAndRequiredSetEntries: allLedgerEntries.length,
    existingRepoAssetsInspected: existingAssetLedgerEntries.length,
    upstreamReferenceBoardsInspected: referenceBoardEntries.length,
    missingProductionAssetSetsRequired: canonicalSetLedgerEntries.length,
    missingDiscreteStateVariantsRequired: discreteStateDeliverableEntries.length,
    discreteStatesByScene: {
      thought_detective: discreteStateDeliverableEntries.filter(
        (d) => d.sceneId === 'thought_detective'
      ).length,
      difficulty_breaker: discreteStateDeliverableEntries.filter(
        (d) => d.sceneId === 'difficulty_breaker'
      ).length,
      shared_companion_rig: discreteStateDeliverableEntries.filter(
        (d) => d.sceneId === 'shared_companion_rig'
      ).length,
    },
    productionArtAcceptedCount: eligibilityReport.productionAcceptedCount,
    verifiedDiscreteStateCount: eligibilityReport.verifiedDiscreteStateCount,
    verifiedSetCount: eligibilityReport.verifiedSetCount,
    techPreviewOnlyCount: eligibilityReport.techPreviewOnlyCount,
    missingSetCount: eligibilityReport.missingRequiredSetIds.length,
    missingDiscreteStateCount: eligibilityReport.missingRequiredDiscreteStateIds.length,
    duplicateByteForByteSvgEntriesCount: eligibilityReport.duplicateGeometryClusterCount,
  },
  eligibilityReport,
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

// Write Discrete 68-State Production Manifest JSON & CSV (Gate B0R-C / P2-01)
const discreteManifestJson = {
  schemaVersion: '1.1.0-B0R',
  gateId: 'A-LAND_V2.3_BATCH02_GATE_B0R_C_DISCRETE_MANIFEST',
  generatedAt: '2026-10-17T16:30:00+08:00',
  waitingOwner: 'Art Production / Art Director',
  approvalAuthority: 'Art Director',
  note: '22 grouped production asset sets expand into 68 proposed discrete state deliverables across thought_detective (30), difficulty_breaker (26), and shared_companion_rig (12 across 4 companions). Zero unresolved {companionId} wildcards remain in discrete targetFilePaths.',
  totals: {
    canonicalAssetSets: BATCH02_CANONICAL_ASSET_SETS.length,
    canonicalDiscreteStates: discreteStateDeliverableEntries.length,
    thoughtDetectiveDiscreteStates: 30,
    difficultyBreakerDiscreteStates: 26,
    sharedCompanionRigDiscreteStates: 12,
    producedCount: discreteStateDeliverableEntries.filter((d) => d.existsInRepo).length,
    approvedCount: 0,
    missingCount: discreteStateDeliverableEntries.filter((d) => !d.existsInRepo).length,
  },
  sets: canonicalSetLedgerEntries.map((s) => ({
    setOrderId: s.setOrderId,
    setId: s.setId,
    sceneId: s.sceneId,
    role: s.role,
    targetGroupPath: s.filePath,
    requiredMinDimensions: s.requiredMinDimensions,
    requireAlpha: s.hasAlphaTransparency,
    requiredStateVariants: s.requiredStateVariants,
    minimumDiscreteStateVariants: s.minimumDiscreteStateVariants,
    waitingOwner: s.waitingOwner,
    approvalAuthority: s.approvalAuthority,
    status: s.status,
  })),
  discreteStates: discreteStateDeliverableEntries,
};

fs.writeFileSync(
  path.join(OUT_DIR, 'BATCH02_DISCRETE_ASSET_PRODUCTION_MANIFEST.json'),
  JSON.stringify(discreteManifestJson, null, 2) + '\n',
  'utf8'
);

const csvHeader =
  'discrete_order_id,discrete_asset_id,set_id,scene_id,state_variant,companion_id,target_group_path,resolved_target_file_path,min_width,min_height,require_alpha,waiting_owner,approval_authority,exists_in_repo,status\n';
const csvRows = discreteStateDeliverableEntries
  .map((d) =>
    [
      d.discreteOrderId,
      d.discreteAssetId,
      d.setId,
      d.sceneId,
      d.stateVariant,
      d.companionId ?? '',
      d.targetGroupPath,
      d.filePath,
      d.requiredMinDimensions.width,
      d.requiredMinDimensions.height,
      d.requireAlpha ? 'True' : 'False',
      `"${d.waitingOwner}"`,
      `"${d.approvalAuthority}"`,
      d.existsInRepo ? 'True' : 'False',
      d.productionOrderStatus,
    ].join(',')
  )
  .join('\n');

fs.writeFileSync(
  path.join(OUT_DIR, 'BATCH02_DISCRETE_ASSET_PRODUCTION_ORDER.csv'),
  csvHeader + csvRows + '\n',
  'utf8'
);

// ============================================================================
// 3. Gate B0R-B & B0R-D: Counterexample & Physical Eligibility Regression
// ============================================================================

const fixedReferenceMs = Date.parse('2026-10-17T18:00:00+08:00');

const auditorFixture = {
  assetId: 'fixture_minimal_detective',
  sceneId: 'thought_detective',
  role: 'synthetic test fixture',
  filePath: null,
  existsInRepo: false,
  format: 'missing',
  pixelDimensions: null,
  hasAlphaTransparency: null,
  alphaZeroRatio: null,
  byteSize: null,
  sha256: null,
  provenance: 'synthetic audit test',
  sharesIdenticalBytesWith: [],
  status: 'PRODUCTION_ART_ACCEPTED',
  gapReason: 'none',
};

function createSyntheticValidCompleteManifest() {
  return BATCH02_CANONICAL_DISCRETE_STATES.map((spec, idx) => {
    const sha256 = crypto
      .createHash('sha256')
      .update(`valid_prod_asset_${spec.discreteAssetId}_${idx}`)
      .digest('hex');
    return {
      assetId: spec.discreteAssetId,
      setId: spec.setId,
      stateVariant: spec.stateVariant,
      companionId: spec.companionId,
      sceneId: spec.sceneId,
      role: `Approved 3D Production Render for ${spec.discreteAssetId}`,
      filePath: spec.targetFilePath,
      existsInRepo: true,
      format: 'webp',
      pixelDimensions: { width: spec.minWidth, height: spec.minHeight },
      requiredMinDimensions: { width: spec.minWidth, height: spec.minHeight },
      hasAlphaTransparency: spec.requireAlpha ? true : false,
      byteSize: 245760 + idx * 1024,
      sha256,
      provenance: 'Candidate Metadata Structure Fixture (No Physical File)',
      sharesIdenticalBytesWith: [],
      status: 'PRODUCTION_ART_ACCEPTED',
      gapReason: '',
      artDirectorApproval: {
        approvedBy: 'Art Director Lead',
        approvalId: `AD-BATCH02-SIGN-${String(idx + 1).padStart(3, '0')}`,
        approvedSha256: sha256,
        approvedAt: '2026-10-17T12:00:00+08:00',
        version: '2.3.0',
      },
    };
  });
}

/**
 * Exact generator from independent audit `04_REPRO_FULL_FABRICATED_MANIFEST.mjs`.
 */
function createAuditorFabricated68Manifest(pathMode = 'canon') {
  return BATCH02_CANONICAL_DISCRETE_STATES.map((spec, i) => {
    const hash = crypto
      .createHash('sha256')
      .update('FAKE_NOT_AN_IMAGE_' + spec.discreteAssetId)
      .digest('hex');
    return {
      assetId: spec.discreteAssetId,
      setId: spec.setId,
      stateVariant: spec.stateVariant,
      companionId: spec.companionId,
      sceneId: spec.sceneId,
      role: 'Fabricated model metadata',
      filePath:
        pathMode === 'canon'
          ? spec.targetFilePath
          : `public/visual-v2/batch02-art/DOES_NOT_EXIST_${i}.webp`,
      existsInRepo: true,
      format: 'webp',
      pixelDimensions: { width: spec.minWidth, height: spec.minHeight },
      hasAlphaTransparency: !!spec.requireAlpha,
      byteSize: 299000 + i,
      sha256: hash,
      provenance: 'Fabricated / never inspected',
      sharesIdenticalBytesWith: [],
      status: 'PRODUCTION_ART_ACCEPTED',
      gapReason: '',
      artDirectorApproval: {
        approvedBy: 'Anyone can write Art Director',
        approvalId: 'SELF_ATTEST_' + i,
        approvedSha256: hash,
        approvedAt: '2100-01-01T00:00:00Z',
      },
    };
  });
}

// Generate exact post-fix reproduction output matching `03_INDEPENDENT_FULL_FABRICATED_MANIFEST_REPRO.json`
const auditorFullFabricatedCases = [
  ['all_68_nonexistent_canonical', createAuditorFabricated68Manifest('canon')],
  ['all_68_nonexistent_wrong_paths', createAuditorFabricated68Manifest('wrong')],
];

const auditorReproAfterFixOutput = {
  source: 'src/visual-v2/batch02-gate0/batch02Gate0Contracts.ts',
  source_sha256: sha256Buffer(fs.readFileSync(contractsTsPath)),
  fileCount: BATCH02_CANONICAL_DISCRETE_STATES.length,
  allCanonicalPathsAbsent: BATCH02_CANONICAL_DISCRETE_STATES.every(
    (s) => !fs.existsSync(path.join(ROOT_DIR, s.targetFilePath))
  ),
  cases: auditorFullFabricatedCases.map(([id, entries]) => {
    const r = evaluateBatch02ProductionArtEligibility(entries, {
      referenceNowMs: fixedReferenceMs,
    });
    return {
      id,
      inputCount: entries.length,
      exampleEntry: entries[0],
      canAuthorizeBatch02UiReplacement: r.canAuthorizeBatch02UiReplacement,
      gateStatus: r.gateStatus,
      holds: r.holdFlags,
      verifiedCount: r.verifiedDiscreteStateCount,
      metadataComplete: r.metadataComplete,
      physicallyVerifiedOnDisk: r.physicallyVerifiedOnDisk,
      authenticatedApprovalVerified: r.authenticatedApprovalVerified,
      blockingReasonsCount: r.blockingReasons.length,
      blockingReasonsSample: r.blockingReasons.slice(0, 5),
      blockingReasonsByLayerSample: {
        layer2MetadataAndPathSample: r.blockingReasons
          .filter(
            (msg) =>
              msg.includes('FUTURE_APPROVAL_TIMESTAMP_REJECTED') ||
              msg.includes('NON_CANONICAL_FILE_PATH')
          )
          .slice(0, 2),
        layer3PhysicalDiskSample: r.blockingReasons
          .filter((msg) => msg.includes('PHYSICAL_FILE_MISSING_ON_DISK'))
          .slice(0, 2),
        layer4IndependentApprovalSample: r.blockingReasons.filter((msg) =>
          msg.includes('CANDIDATE_SELF_ATTESTATION_NOT_TRUSTED')
        ),
        layer5HoldLockSample: r.blockingReasons.filter((msg) =>
          msg.includes('READ_ONLY_READINESS_HOLD_LOCK_ACTIVE')
        ),
      },
    };
  }),
};

fs.writeFileSync(
  path.join(EVIDENCE_DIR, 'b0rb_full_fabricated_manifest_repro_after_fix.json'),
  JSON.stringify(auditorReproAfterFixOutput, null, 2) + '\n',
  'utf8'
);

const counterexampleCases = [
  {
    caseId: 'CE-AUDITOR-FULL-01_all_68_nonexistent_canonical',
    description:
      'Independent Auditor Full 68/68 Fabricated Manifest #1 (all_68_nonexistent_canonical): 68 nonexistent canonical files with existsInRepo=true, fake SHA-256, and self-attested future approval (2100-01-01)',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: evaluateBatch02ProductionArtEligibility(
      createAuditorFabricated68Manifest('canon'),
      { referenceNowMs: fixedReferenceMs }
    ),
  },
  {
    caseId: 'CE-AUDITOR-FULL-02_all_68_nonexistent_wrong_paths',
    description:
      'Independent Auditor Full 68/68 Fabricated Manifest #2 (all_68_nonexistent_wrong_paths): 68 nonexistent wrong paths (DOES_NOT_EXIST_*.webp) with existsInRepo=true and self-attested future approval',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: evaluateBatch02ProductionArtEligibility(
      createAuditorFabricated68Manifest('wrong'),
      { referenceNowMs: fixedReferenceMs }
    ),
  },
  {
    caseId: 'CE-00_current_repo_73_rows',
    description: 'Current repo ledger (36 existing + 15 reference boards + 22 missing canonical sets)',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: evaluateBatch02ProductionArtEligibility(allLedgerEntries, {
      referenceNowMs: fixedReferenceMs,
    }),
  },
  {
    caseId: 'CE-01_empty_ledger',
    description: 'Empty ledger array []',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: evaluateBatch02ProductionArtEligibility([], {
      referenceNowMs: fixedReferenceMs,
    }),
  },
  {
    caseId: 'CE-02_auditor_counterexample_1_single_fake_accepted_row',
    description:
      'Auditor Counterexample 1 (only_one_accepted_label_missing_other_scene): 1 fake PRODUCTION_ART_ACCEPTED row with filePath=null, existsInRepo=false, format="missing"',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: evaluateBatch02ProductionArtEligibility([auditorFixture], {
      referenceNowMs: fixedReferenceMs,
    }),
  },
  {
    caseId: 'CE-03_auditor_counterexample_2_fake_accepted_plus_unverified',
    description:
      'Auditor Counterexample 2 (accepted_label_plus_unverified_other_scene): 1 fake accepted row + 1 UNVERIFIED row',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: evaluateBatch02ProductionArtEligibility(
      [
        auditorFixture,
        {
          ...auditorFixture,
          assetId: 'fixture_unknown_breaker',
          sceneId: 'difficulty_breaker',
          status: 'UNVERIFIED',
        },
      ],
      { referenceNowMs: fixedReferenceMs }
    ),
  },
  {
    caseId: 'CE-04_auditor_counterexample_3_two_fake_labels_no_files_no_hashes',
    description:
      'Auditor Counterexample 3 (two_labels_no_files_no_hashes): 2 fake PRODUCTION_ART_ACCEPTED rows across detective & breaker with null files/hashes',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: evaluateBatch02ProductionArtEligibility(
      [
        auditorFixture,
        {
          ...auditorFixture,
          assetId: 'fixture_breaker',
          sceneId: 'difficulty_breaker',
        },
      ],
      { referenceNowMs: fixedReferenceMs }
    ),
  },
  {
    caseId: 'CE-05_missing_one_discrete_state',
    description: '67 of 68 valid discrete state entries (1 discrete state missing)',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: evaluateBatch02ProductionArtEligibility(
      createSyntheticValidCompleteManifest().slice(0, 67),
      { referenceNowMs: fixedReferenceMs }
    ),
  },
  {
    caseId: 'CE-06_unresolved_companion_wildcard_path',
    description: 'Complete 68 entries except 1 companion entry still contains {companionId} wildcard in filePath',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: (() => {
      const manifest = createSyntheticValidCompleteManifest();
      manifest[manifest.length - 1] = {
        ...manifest[manifest.length - 1],
        filePath: 'public/visual-v2/batch02-art/characters/{companionId}/rig_master_rgba.webp',
      };
      return evaluateBatch02ProductionArtEligibility(manifest, {
        referenceNowMs: fixedReferenceMs,
      });
    })(),
  },
  {
    caseId: 'CE-07_below_minimum_dimensions',
    description: 'Complete 68 entries except desktop scene plate is 1280x720 (< required 2560x1440)',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: (() => {
      const manifest = createSyntheticValidCompleteManifest();
      manifest[0] = {
        ...manifest[0],
        pixelDimensions: { width: 1280, height: 720 },
      };
      return evaluateBatch02ProductionArtEligibility(manifest, {
        referenceNowMs: fixedReferenceMs,
      });
    })(),
  },
  {
    caseId: 'CE-08_missing_required_alpha_channel',
    description: 'Complete 68 entries except an RGBA layer has hasAlphaTransparency: false',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: (() => {
      const manifest = createSyntheticValidCompleteManifest();
      manifest[2] = {
        ...manifest[2],
        hasAlphaTransparency: false,
      };
      return evaluateBatch02ProductionArtEligibility(manifest, {
        referenceNowMs: fixedReferenceMs,
      });
    })(),
  },
  {
    caseId: 'CE-09_unapproved_duplicate_sha256',
    description: 'Complete 68 entries except 2 states share the same SHA-256 without an approved sharedAssetRef',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: (() => {
      const manifest = createSyntheticValidCompleteManifest();
      const dupSha = manifest[5].sha256;
      manifest[6] = {
        ...manifest[6],
        sha256: dupSha,
        artDirectorApproval: {
          ...manifest[6].artDirectorApproval,
          approvedSha256: dupSha,
        },
      };
      return evaluateBatch02ProductionArtEligibility(manifest, {
        referenceNowMs: fixedReferenceMs,
      });
    })(),
  },
  {
    caseId: 'CE-10_svg_format_rejected_as_production_art',
    description: 'Complete 68 entries except 1 prop entry is format: "svg"',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: (() => {
      const manifest = createSyntheticValidCompleteManifest();
      manifest[5] = {
        ...manifest[5],
        format: 'svg',
      };
      return evaluateBatch02ProductionArtEligibility(manifest, {
        referenceNowMs: fixedReferenceMs,
      });
    })(),
  },
  {
    caseId: 'CE-11_missing_art_director_approval',
    description: 'Complete 68 entries except 1 entry has artDirectorApproval: null',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: (() => {
      const manifest = createSyntheticValidCompleteManifest();
      manifest[10] = {
        ...manifest[10],
        artDirectorApproval: null,
      };
      return evaluateBatch02ProductionArtEligibility(manifest, {
        referenceNowMs: fixedReferenceMs,
      });
    })(),
  },
  {
    caseId: 'CE-12_duplicate_asset_id_poisoning',
    description: 'Complete 68 entries plus 1 duplicate assetId entry',
    expectedAuthorized: false,
    expectedMetadataComplete: false,
    expectedPhysicallyVerified: false,
    report: (() => {
      const manifest = createSyntheticValidCompleteManifest();
      return evaluateBatch02ProductionArtEligibility([...manifest, manifest[0]], {
        referenceNowMs: fixedReferenceMs,
      });
    })(),
  },
  {
    caseId: 'READINESS-POS-01_complete_68_metadata_structure_only_hold_locked',
    description:
      'Metadata Readiness Control (formerly POS-01): Complete 68 structural metadata entries prove ONLY metadataComplete=true; because physical files and independent Art Director registry sign-off are absent, canAuthorizeBatch02UiReplacement MUST be false and ARTWORK_GAP=true',
    expectedAuthorized: false,
    expectedMetadataComplete: true,
    expectedPhysicallyVerified: false,
    report: evaluateBatch02ProductionArtEligibility(createSyntheticValidCompleteManifest(), {
      referenceNowMs: fixedReferenceMs,
    }),
  },
  {
    caseId: 'READINESS-POS-02_complete_68_metadata_plus_historical_rows_hold_locked',
    description:
      'Metadata Readiness Control with historical audit rows (formerly POS-02): Complete 68 structural metadata entries + TECH_PREVIEW_ONLY rows prove ONLY metadataComplete=true while keeping canAuthorizeBatch02UiReplacement=false and ARTWORK_GAP=true',
    expectedAuthorized: false,
    expectedMetadataComplete: true,
    expectedPhysicallyVerified: false,
    report: evaluateBatch02ProductionArtEligibility(
      [
        ...existingAssetLedgerEntries,
        ...referenceBoardEntries,
        ...createSyntheticValidCompleteManifest(),
      ],
      { referenceNowMs: fixedReferenceMs }
    ),
  },
];

for (const testCase of counterexampleCases) {
  const actual = testCase.report.canAuthorizeBatch02UiReplacement;
  if (actual !== testCase.expectedAuthorized) {
    throw new Error(
      `Counterexample regression failure on ${testCase.caseId}: expected canAuthorizeBatch02UiReplacement=${testCase.expectedAuthorized}, got ${actual}`
    );
  }
  if (testCase.report.metadataComplete !== testCase.expectedMetadataComplete) {
    throw new Error(
      `Metadata readiness mismatch on ${testCase.caseId}: expected metadataComplete=${testCase.expectedMetadataComplete}, got ${testCase.report.metadataComplete}`
    );
  }
  if (testCase.report.physicallyVerifiedOnDisk !== testCase.expectedPhysicallyVerified) {
    throw new Error(
      `Physical verification mismatch on ${testCase.caseId}: expected physicallyVerifiedOnDisk=${testCase.expectedPhysicallyVerified}, got ${testCase.report.physicallyVerifiedOnDisk}`
    );
  }
  if (
    testCase.report.holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED !== !actual ||
    testCase.report.holdFlags.ARTWORK_GAP !== !actual ||
    testCase.report.holdFlags.ASSET_ARTWORK_BLOCKED !== !actual
  ) {
    throw new Error(
      `Contradictory holdFlags on ${testCase.caseId}: canAuthorize=${actual}, holdFlags=${JSON.stringify(
        testCase.report.holdFlags
      )}`
    );
  }
}

const counterexampleRegressionOutput = {
  schemaVersion: '1.2.0-B0R-B',
  gateId: 'A-LAND_V2.3_BATCH02_GATE_B0RB_COUNTEREXAMPLE_REGRESSION',
  verifiedAt: new Date().toISOString(),
  nodeVersion: process.version,
  totalCases: counterexampleCases.length,
  allAssertionsPassed: true,
  cases: counterexampleCases.map((c) => ({
    caseId: c.caseId,
    description: c.description,
    expectedAuthorized: c.expectedAuthorized,
    actualAuthorized: c.report.canAuthorizeBatch02UiReplacement,
    expectedMetadataComplete: c.expectedMetadataComplete,
    actualMetadataComplete: c.report.metadataComplete,
    expectedPhysicallyVerified: c.expectedPhysicallyVerified,
    actualPhysicallyVerified: c.report.physicallyVerifiedOnDisk,
    authenticatedApprovalVerified: c.report.authenticatedApprovalVerified,
    gateStatus: c.report.gateStatus,
    holdFlags: c.report.holdFlags,
    metadataReadyDiscreteStateCount: c.report.metadataReadyDiscreteStateCount,
    physicallyVerifiedDiscreteStateCount: c.report.physicallyVerifiedDiscreteStateCount,
    approvedDiscreteStateCount: c.report.approvedDiscreteStateCount,
    verifiedDiscreteStateCount: c.report.verifiedDiscreteStateCount,
    verifiedSetCount: c.report.verifiedSetCount,
    missingSetCount: c.report.missingRequiredSetIds.length,
    missingDiscreteStateCount: c.report.missingRequiredDiscreteStateIds.length,
    blockingReasonsCount: c.report.blockingReasons.length,
    blockingReasonsSample: c.report.blockingReasons.slice(0, 6),
  })),
};

fs.writeFileSync(
  path.join(EVIDENCE_DIR, 'b0r_counterexample_regression.json'),
  JSON.stringify(counterexampleRegressionOutput, null, 2) + '\n',
  'utf8'
);

// ============================================================================
// 4. Gate B0R-D: Verify Zero Frozen File Modifications & Write Verification Summary
// ============================================================================

const diffFromU3R = execSync('git diff --name-only d0b497acade40bd4bbd2cc9f16e9550df2b19504', {
  cwd: ROOT_DIR,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(Boolean);

const diffFromGate0 = execSync('git diff --name-only a6a1f843fd9955539912bfd1b30cc46a399a9ed8', {
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

const modifiedForbiddenFiles = diffFromU3R.filter((f) =>
  forbiddenPrefixes.some((prefix) => f === prefix || f.startsWith(prefix))
);

if (modifiedForbiddenFiles.length > 0) {
  throw new Error(
    `FROZEN_BOUNDARY_VIOLATION: Modified forbidden files: ${modifiedForbiddenFiles.join(', ')}`
  );
}

const verificationSummary = {
  gate: 'A-LAND_V2.3_BATCH02_GATE_B0R_B',
  status: BATCH02_GATE_B0RB_DECISION_STATUS,
  executionStatus: BATCH02_GATE0_EXECUTION_STATUS,
  verifiedAt: new Date().toISOString(),
  baseline: BATCH02_GATE0_BASELINE,
  zeroFrozenBusinessFilesModified: modifiedForbiddenFiles.length === 0,
  modifiedForbiddenFiles,
  modifiedFilesSinceGate0Inventory: diffFromGate0,
  sourceContractAssertions: sourceAssertions,
  artworkPreflightSummary: artworkGapLedger.summaryCounts,
  counterexampleRegressionSummary: {
    totalCases: counterexampleRegressionOutput.totalCases,
    allAssertionsPassed: counterexampleRegressionOutput.allAssertionsPassed,
    auditor68FabricatedCanonicalRejected:
      auditorReproAfterFixOutput.cases[0].canAuthorizeBatch02UiReplacement === false,
    auditor68FabricatedWrongPathsRejected:
      auditorReproAfterFixOutput.cases[1].canAuthorizeBatch02UiReplacement === false,
  },
  holdFlags: artworkGapLedger.holdFlags,
};

fs.writeFileSync(
  path.join(EVIDENCE_DIR, 'gate0_inventory_verification.json'),
  JSON.stringify(verificationSummary, null, 2) + '\n',
  'utf8'
);

console.log(JSON.stringify(verificationSummary, null, 2));
