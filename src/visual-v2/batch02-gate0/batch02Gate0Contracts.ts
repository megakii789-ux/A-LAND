/**
 * A-LAND V2.3 Batch02 · Gate 0 / Gate B0R / Gate B0R-B — Executable Behavior, Asset & Physical Eligibility Contracts
 *
 * Scope:
 * - Target Modules: ThoughtDetectiveLabModal («想法侦探社») & DifficultyBreakerModal («困难拆解台»)
 * - Gate B0R-A (FROZEN PASS): Real component behavior, state schema, and voice/companion sync contracts.
 * - Gate B0R-C (FROZEN PASS): 22 canonical asset sets & 68 discrete state variants + 6 frozen viewports.
 * - Gate B0R-B (Closeout): 5-layer permission separation (Contract / Metadata Readiness / Physical File & Image Decode /
 *   Independent Art Approval Provenance / UI Replacement Authorization) + Read-Only Readiness Hold Lock.
 * - Self-contained module (zero relative runtime imports) so it can be executed directly under `node --experimental-strip-types`.
 * - Fail-Closed Stop Condition: B0R_A_PASS / B0R_C_PASS / B0R_B_PHYSICAL_GATE_PASS_BUT_ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

export type CompanionVoiceId =
  | 'guoguo_squirrel'
  | 'beibei_otter'
  | 'tiantian_raccoon'
  | 'qiqi_deer';

export type VoiceProfileType =
  | 'warm-sister'
  | 'gentle-guide'
  | 'playful-buddy'
  | 'starlight-companion';

export type EmotionProsodyTone =
  | 'warm-dual-empathy'
  | 'calm-fact-clarity'
  | 'gentle-inquiry'
  | 'protective-safety'
  | 'light-everyday';

export const BATCH02_GATE0_EXECUTION_STATUS =
  'ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED' as const;

export const BATCH02_GATE_B0R_DECISION_STATUS =
  'BATCH02_GATE0R_CONTRACT_PASS / ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED' as const;

export const BATCH02_GATE_B0RB_DECISION_STATUS =
  'B0R_A_PASS / B0R_C_PASS / B0R_B_PHYSICAL_GATE_PASS_BUT_ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED' as const;

export const BATCH02_GATE0_BASELINE = {
  frozenBranch: 'ui/visual-v2-batch01r-u3r-final',
  frozenArchiveHeadSha: 'd0b497acade40bd4bbd2cc9f16e9550df2b19504',
  frozenCanonicalCodeSha: '6a5ae8d186850ac6ddb30823bf9c87134c10c320',
  gate0InventoryBranch: 'ui/visual-v2-batch02-gate0-inventory',
  gate0InventoryArchiveHeadSha: 'a6a1f843fd9955539912bfd1b30cc46a399a9ed8',
  gate0InventoryCanonicalCodeSha: '25a09c7a23bda842cf8327d12f4e3df4df4b1597',
  gateB0RBranch: 'ui/visual-v2-batch02-gate0r-contract',
  gateB0RArchiveHeadSha: 'dafe3a96c97278d947abbb78da9972aa468ed625',
  gateB0RCanonicalCodeSha: '56936d624dc491de4c5f4085115892eb4609edfa',
  gateB0RBBranch: 'ui/visual-v2-batch02-b0rb-closeout',
} as const;

export interface Batch02HoldFlags {
  readonly ART_DIRECTOR_QA_HOLD: boolean;
  readonly ASSET_ARTWORK_BLOCKED: boolean;
  readonly CONTENT_QA_REVIEW: boolean;
  readonly PRODUCTION_RELEASE_HOLD: boolean;
  readonly ARTWORK_GAP: boolean;
  readonly BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED: boolean;
}

export const BATCH02_GATE0_HOLD_FLAGS: Batch02HoldFlags = {
  ART_DIRECTOR_QA_HOLD: true,
  ASSET_ARTWORK_BLOCKED: true,
  CONTENT_QA_REVIEW: true,
  PRODUCTION_RELEASE_HOLD: true,
  ARTWORK_GAP: true,
  BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED: true,
} as const;

export const BATCH02_MIN_TOUCH_TARGET_PX = 56 as const;

/**
 * Frozen 6-Viewport Verification Matrix (Gate B0R-C / P2-02)
 * Matches the mandatory 6 viewports in 02_ANTIGRAVITY_BATCH02_GATE0_TASK.md & 02_ANTIGRAVITY_GATE_B0R_TASK.md.
 */
export const BATCH02_REQUIRED_VIEWPORTS = [
  { id: 'mobile_360x800', width: 360, height: 800, orientation: 'portrait', aspectTier: 'mobile_3_4' },
  { id: 'mobile_390x844', width: 390, height: 844, orientation: 'portrait', aspectTier: 'mobile_3_4' },
  { id: 'mobile_430x932', width: 430, height: 932, orientation: 'portrait', aspectTier: 'mobile_3_4' },
  { id: 'tablet_768x1024', width: 768, height: 1024, orientation: 'portrait', aspectTier: 'tablet_adaptive' },
  { id: 'tablet_1024x1366', width: 1024, height: 1366, orientation: 'portrait', aspectTier: 'tablet_adaptive' },
  { id: 'desktop_1440x900', width: 1440, height: 900, orientation: 'landscape', aspectTier: 'desktop_16_9' },
] as const;

/**
 * Optional 7th landscape tablet viewport (never substitutes for frozen 1024×1366).
 */
export const BATCH02_OPTIONAL_ADDITIONAL_VIEWPORTS = [
  { id: 'tablet_1024x768', width: 1024, height: 768, orientation: 'landscape', aspectTier: 'desktop_16_9' },
] as const;

/**
 * Aspect-Ratio-Preserving Stage Composition Rule (Gate B0R-C / Gate U2 alignment)
 * Prohibits cropping 3:4 portrait mobile plates into shallow 188-215px `object-cover` strips.
 */
export const BATCH02_STAGE_COMPOSITION_RULE = {
  mobilePortraitAspect: '3:4',
  desktopLandscapeAspect: '16:9',
  forbidDestructiveObjectCoverCropOnMobile: true,
  mobileCompositionPolicy:
    'Render dedicated 3:4 portrait scene plates (>=1200x1600) in an aspect-ratio-preserving stage container (aspect-[3/4] or full-bleed safe-zone backdrop with object-contain / safe focal framing) so sky, workbench, and companion anchors are never vertically sliced into a shallow horizontal strip.',
  desktopCompositionPolicy:
    'Render dedicated 16:9 landscape scene plates (>=2560x1440) with L1/L2/L3 depth parallax and interactive prop anchors.',
} as const;

// ============================================================================
// 1. ThoughtDetectiveLabModal («想法侦探社») Real Source Behavior & V2 Contract
//    Source of truth: src/components/ChildIsland/ThoughtDetectiveLab/ThoughtDetectiveLabModal.tsx
// ============================================================================

export type ThoughtDetectiveTabId = 'tools' | 'threeBoxes' | 'circles' | 'fourSteps';
export type ThoughtDetectiveToolId = 'flag' | 'lenses' | 'coin' | 'scale' | 'fence';
export type ThoughtDetectiveLensId = 'my' | 'his' | 'sky';
export type ThoughtDetectiveCoinSide = 'front' | 'back';
export type ThoughtDetectiveBoxCategory = 'visible' | 'heart' | 'guess';
export type ThoughtDetectiveCircleCategory = 'adult' | 'mine' | 'together';
export type ThoughtDetectiveStepNumber = 1 | 2 | 3 | 4;

/**
 * Exact shape of `boxItems` in `ThoughtDetectiveLabModal.tsx` (lines 57-63).
 * Note: Uses `target` and `placed` (NOT `correctBox` or `sorted`).
 */
export interface ThoughtDetectiveBoxItemState {
  id: string;
  text: string;
  target: ThoughtDetectiveBoxCategory;
  placed: ThoughtDetectiveBoxCategory | null;
}

/**
 * Exact shape of `circleItems` in `ThoughtDetectiveLabModal.tsx` (lines 66-72).
 * Note: Uses `target` and `placed` (NOT `correctCircle` or `sorted`).
 */
export interface ThoughtDetectiveCircleItemState {
  id: string;
  text: string;
  target: ThoughtDetectiveCircleCategory;
  placed: ThoughtDetectiveCircleCategory | null;
}

/**
 * Optional read-only derived view for future V2 presentation layers ONLY.
 * Never replaces the canonical `{ id, text, target, placed }` state shape.
 */
export interface ThoughtDetectiveReadOnlyPlacementView<TCategory extends string> {
  readonly id: string;
  readonly text: string;
  readonly referenceTargetCategory: TCategory;
  readonly currentPlacedCategory: TCategory | null;
  readonly isPlaced: boolean;
  readonly matchesReferenceTarget: boolean;
}

export interface ThoughtDetectiveExperienceMetricsSummary {
  completedDetectiveCaseIds: readonly string[];
  hypothesisRevisionCount: number;
  completedTransferScenarioIds: readonly string[];
}

export const THOUGHT_DETECTIVE_MODES: readonly ThoughtDetectiveTabId[] = [
  'tools',
  'threeBoxes',
  'circles',
  'fourSteps',
] as const;

export const THOUGHT_DETECTIVE_TOOLS: readonly ThoughtDetectiveToolId[] = [
  'flag',
  'lenses',
  'coin',
  'scale',
  'fence',
] as const;

export const THOUGHT_DETECTIVE_LENSES: readonly ThoughtDetectiveLensId[] = [
  'my',
  'his',
  'sky',
] as const;

export const THOUGHT_DETECTIVE_BOX_CATEGORIES: readonly ThoughtDetectiveBoxCategory[] = [
  'visible',
  'heart',
  'guess',
] as const;

export const THOUGHT_DETECTIVE_CIRCLE_CATEGORIES: readonly ThoughtDetectiveCircleCategory[] = [
  'adult',
  'mine',
  'together',
] as const;

/**
 * Exact initial `boxItems` state in `ThoughtDetectiveLabModal.tsx` (lines 57-63).
 * Items '1' and '2' start pre-placed as concrete examples; '3', '4', '5' start with `placed: null`.
 */
export const THOUGHT_DETECTIVE_INITIAL_BOX_ITEMS: readonly ThoughtDetectiveBoxItemState[] = [
  { id: '1', text: '桌上的牛奶打翻了，地板湿了', target: 'visible', placed: 'visible' },
  { id: '2', text: '心里一阵酸酸的，想掉眼泪', target: 'heart', placed: 'heart' },
  { id: '3', text: '“他肯定是故意让我难看的！”', target: 'guess', placed: null },
  { id: '4', text: '门被风吹得砰的一声关上了', target: 'visible', placed: null },
  { id: '5', text: '肚子紧绷绷的，像个小皮球', target: 'heart', placed: null },
] as const;

/**
 * Exact initial `circleItems` state in `ThoughtDetectiveLabModal.tsx` (lines 66-72).
 * Items 'c1' and 'c2' start pre-placed as concrete examples; 'c3', 'c4', 'c5' start with `placed: null`.
 */
export const THOUGHT_DETECTIVE_INITIAL_CIRCLE_ITEMS: readonly ThoughtDetectiveCircleItemState[] = [
  { id: 'c1', text: '大人分开住在不同房子里', target: 'adult', placed: 'adult' },
  { id: 'c2', text: '难过了跟大人要一个抱抱', target: 'mine', placed: 'mine' },
  { id: 'c3', text: '周末一起去公园还是去看绘本', target: 'together', placed: null },
  { id: 'c4', text: '大人之间商量生活费和日程', target: 'adult', placed: null },
  { id: 'c5', text: '晚上按时刷牙洗脸睡觉', target: 'mine', placed: null },
] as const;

/**
 * Exact initial `currentStep` state in `ThoughtDetectiveLabModal.tsx` (line 75): `useState<number>(1)`.
 */
export const THOUGHT_DETECTIVE_INITIAL_STEP: ThoughtDetectiveStepNumber = 1;

/**
 * Mirrors `handlePlaceBox` in `ThoughtDetectiveLabModal.tsx` (lines 83-88):
 * Plays `sounds.playClick()` and unconditionally updates `placed: boxType` for matching `id`.
 * Does NOT block placement on `target` mismatch and does NOT call `unlockMedal` or `playSuccess`.
 */
export function simulateThoughtDetectivePlaceBox(
  items: readonly ThoughtDetectiveBoxItemState[],
  id: string,
  boxType: ThoughtDetectiveBoxCategory
): ThoughtDetectiveBoxItemState[] {
  return items.map((item) => (item.id === id ? { ...item, placed: boxType } : item));
}

/**
 * Mirrors `handlePlaceCircle` in `ThoughtDetectiveLabModal.tsx` (lines 90-95):
 * Plays `sounds.playClick()` and unconditionally updates `placed: circleType` for matching `id`.
 * Does NOT block placement on `target` mismatch.
 */
export function simulateThoughtDetectivePlaceCircle(
  items: readonly ThoughtDetectiveCircleItemState[],
  id: string,
  circleType: ThoughtDetectiveCircleCategory
): ThoughtDetectiveCircleItemState[] {
  return items.map((item) => (item.id === id ? { ...item, placed: circleType } : item));
}

/**
 * Pure read-only view projector (optional adapter helper; never mutates or replaces live state).
 */
export function projectThoughtDetectivePlacementToReadOnlyView<
  TCategory extends string,
  TItem extends { id: string; text: string; target: TCategory; placed: TCategory | null },
>(items: readonly TItem[]): ThoughtDetectiveReadOnlyPlacementView<TCategory>[] {
  return items.map((item) => ({
    id: item.id,
    text: item.text,
    referenceTargetCategory: item.target,
    currentPlacedCategory: item.placed,
    isPlaced: item.placed !== null,
    matchesReferenceTarget: item.placed !== null && item.placed === item.target,
  }));
}

/**
 * Runtime contract validator for `ThoughtDetectiveBoxItemState`.
 * Explicitly rejects fabricated `{ correctBox, sorted }` schemas.
 */
export function isValidThoughtDetectiveBoxItemState(
  candidate: unknown
): candidate is ThoughtDetectiveBoxItemState {
  if (!candidate || typeof candidate !== 'object') return false;
  const obj = candidate as Record<string, unknown>;
  if ('correctBox' in obj || 'sorted' in obj) return false;
  if (typeof obj.id !== 'string' || obj.id.length === 0) return false;
  if (typeof obj.text !== 'string' || obj.text.length === 0) return false;
  if (
    obj.target !== 'visible' &&
    obj.target !== 'heart' &&
    obj.target !== 'guess'
  ) {
    return false;
  }
  if (
    obj.placed !== null &&
    obj.placed !== 'visible' &&
    obj.placed !== 'heart' &&
    obj.placed !== 'guess'
  ) {
    return false;
  }
  return true;
}

/**
 * Runtime contract validator for `ThoughtDetectiveCircleItemState`.
 * Explicitly rejects fabricated `{ correctCircle, sorted }` schemas.
 */
export function isValidThoughtDetectiveCircleItemState(
  candidate: unknown
): candidate is ThoughtDetectiveCircleItemState {
  if (!candidate || typeof candidate !== 'object') return false;
  const obj = candidate as Record<string, unknown>;
  if ('correctCircle' in obj || 'sorted' in obj) return false;
  if (typeof obj.id !== 'string' || obj.id.length === 0) return false;
  if (typeof obj.text !== 'string' || obj.text.length === 0) return false;
  if (
    obj.target !== 'adult' &&
    obj.target !== 'mine' &&
    obj.target !== 'together'
  ) {
    return false;
  }
  if (
    obj.placed !== null &&
    obj.placed !== 'adult' &&
    obj.placed !== 'mine' &&
    obj.placed !== 'together'
  ) {
    return false;
  }
  return true;
}

export interface ThoughtDetectiveStateContractValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateThoughtDetectiveStateContract(candidate: {
  boxItems: unknown;
  circleItems: unknown;
  currentStep: unknown;
}): ThoughtDetectiveStateContractValidationResult {
  const errors: string[] = [];
  if (!Array.isArray(candidate.boxItems) || candidate.boxItems.length !== 5) {
    errors.push('INVALID_BOX_ITEMS_LENGTH: boxItems must be an array of 5 items.');
  } else {
    candidate.boxItems.forEach((item, idx) => {
      if (!isValidThoughtDetectiveBoxItemState(item)) {
        errors.push(
          `INVALID_BOX_ITEM_SCHEMA_AT_${idx}: must use { id, text, target, placed } and must not contain correctBox/sorted.`
        );
      }
    });
  }

  if (!Array.isArray(candidate.circleItems) || candidate.circleItems.length !== 5) {
    errors.push('INVALID_CIRCLE_ITEMS_LENGTH: circleItems must be an array of 5 items.');
  } else {
    candidate.circleItems.forEach((item, idx) => {
      if (!isValidThoughtDetectiveCircleItemState(item)) {
        errors.push(
          `INVALID_CIRCLE_ITEM_SCHEMA_AT_${idx}: must use { id, text, target, placed } and must not contain correctCircle/sorted.`
        );
      }
    });
  }

  if (
    candidate.currentStep !== 1 &&
    candidate.currentStep !== 2 &&
    candidate.currentStep !== 3 &&
    candidate.currentStep !== 4
  ) {
    errors.push('INVALID_CURRENT_STEP: currentStep must be 1 | 2 | 3 | 4.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Proposed V2 Scene Art Adapter Contract for `ThoughtDetectiveLabModal.tsx`
 * (To be mounted ONLY after Batch02 production 3D assets pass Art Director preflight)
 */
export interface ThoughtDetectiveSceneArtV2Props {
  activeTab: ThoughtDetectiveTabId;
  activeTool: ThoughtDetectiveToolId;
  personFlagRemoved: boolean;
  currentLens: ThoughtDetectiveLensId;
  coinSide: ThoughtDetectiveCoinSide;
  boxItems: readonly ThoughtDetectiveBoxItemState[];
  circleItems: readonly ThoughtDetectiveCircleItemState[];
  currentStep: ThoughtDetectiveStepNumber;
  isBreakerOpen: boolean;
  isCrayonGameOpen: boolean;
  isTransferLabOpen: boolean;
  expMetrics: ThoughtDetectiveExperienceMetricsSummary;
  companionId: CompanionVoiceId;
  isSpeaking: boolean;
  reducedMotion: boolean;
  onSelectTab: (tab: ThoughtDetectiveTabId) => void;
  onSelectTool: (tool: ThoughtDetectiveToolId) => void;
  onTogglePersonFlag: (removed: boolean) => void;
  onSelectLens: (lens: ThoughtDetectiveLensId) => void;
  onFlipCoin: () => void;
  onPlaceBox: (id: string, boxType: ThoughtDetectiveBoxCategory) => void;
  onPlaceCircle: (id: string, circleType: ThoughtDetectiveCircleCategory) => void;
  onSelectStep: (step: ThoughtDetectiveStepNumber) => void;
  onOpenBreaker: () => void;
  onOpenCrayonGame: () => void;
  onOpenTransferLab: () => void;
  onSpeak: (text: string) => void;
  forceEnableQaForTest?: boolean;
}

// ============================================================================
// 2. DifficultyBreakerModal («困难拆解台») Real Source Behavior & V2 Contract
//    Source of truth: src/components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal.tsx
// ============================================================================

export type BreakerStageId = 'pick' | 'fen' | 'tong' | 'ze' | 'complete';

export type BreakerPresetId =
  | 'diff-two-homes'
  | 'diff-blocks-broken'
  | 'diff-friend-ask';

export type BreakerTransitionSubBranchId =
  | 'sub_dual_attachment'
  | 'sub_loyalty_conflict'
  | 'sub_specific_concern'
  | 'sub_ordinary_transition';

export type BreakerFenPieceId = 'fact' | 'feeling' | 'guess';

export interface BreakerFenRevealedState {
  fact: boolean;
  feeling: boolean;
  guess: boolean;
}

export interface BreakerActionSteppingStoneItem {
  id: string;
  text: string;
  badge: string;
  isSafetyAction?: boolean;
}

export const DIFFICULTY_BREAKER_STAGES: readonly BreakerStageId[] = [
  'pick',
  'fen',
  'tong',
  'ze',
  'complete',
] as const;

export const DIFFICULTY_BREAKER_PRESETS: readonly BreakerPresetId[] = [
  'diff-two-homes',
  'diff-blocks-broken',
  'diff-friend-ask',
] as const;

export const DIFFICULTY_BREAKER_TRANSITION_SUBBRANCHES: readonly BreakerTransitionSubBranchId[] = [
  'sub_dual_attachment',
  'sub_loyalty_conflict',
  'sub_specific_concern',
  'sub_ordinary_transition',
] as const;

export const DIFFICULTY_BREAKER_COMPANION_ORDER: readonly CompanionVoiceId[] = [
  'guoguo_squirrel',
  'beibei_otter',
  'tiantian_raccoon',
  'qiqi_deer',
] as const;

/**
 * Exact voice & companion synchronization contract in `DifficultyBreakerModal.tsx` (lines 489-525).
 * Verified against `src/utils/speech.ts` and `DifficultyBreakerModal.tsx`.
 */
export const DIFFICULTY_BREAKER_VOICE_SYNC_CONTRACT = {
  subscriptionMethod: 'speechNarrator.subscribe',
  speakingGetter: 'speechNarrator.getSpeaking()',
  karaokeGetter: 'speechNarrator.getKaraokeState()',
  inlineCompanionSwitchHandler: 'handleSwitchCompanionInline',
  inlineCompanionSwitchCalls: [
    'updatePersonalization({ companionId: nextCompanionId })',
    'speechNarrator.switchCompanion(nextCompanionId)',
  ],
  speaksGreetingOnInlineSwitch: false,
  sourceLineRange: {
    subscribeEffect: '489-495',
    speakWithCompanionHelper: '513-520',
    handleSwitchCompanionInline: '522-525',
  },
} as const;

/**
 * Proposed V2 Scene Art Adapter Contract for `DifficultyBreakerModal.tsx`
 * (To be mounted ONLY after Batch02 production 3D assets pass Art Director preflight)
 */
export interface DifficultyBreakerSceneArtV2Props {
  currentStep: BreakerStageId;
  selectedPresetId: BreakerPresetId;
  transitionSubId: BreakerTransitionSubBranchId;
  fenRevealed: BreakerFenRevealedState;
  isCoinFlipped: boolean;
  steppingStones: readonly [
    BreakerActionSteppingStoneItem | null,
    BreakerActionSteppingStoneItem | null,
    BreakerActionSteppingStoneItem | null,
  ];
  availableActions: readonly BreakerActionSteppingStoneItem[];
  pausedVoluntarily: boolean;
  activeCompanionId: CompanionVoiceId;
  activeVoiceProfileId: VoiceProfileType;
  isSpeaking: boolean;
  karaokeFullText: string;
  lastSpokenText: string;
  reducedMotion: boolean;
  onPickPreset: (presetId: BreakerPresetId, subId?: BreakerTransitionSubBranchId) => void;
  onSwitchTransitionSubBranch: (subId: BreakerTransitionSubBranchId) => void;
  onSelectStepTab: (step: Exclude<BreakerStageId, 'pick' | 'complete'>) => void;
  onToggleFenPiece: (piece: BreakerFenPieceId) => void;
  onFlipLens: () => void;
  onPlaceAction: (action: BreakerActionSteppingStoneItem, slotIndex?: 0 | 1 | 2) => void;
  onRemoveStone: (slotIndex: 0 | 1 | 2) => void;
  onVoluntaryPause: () => void;
  onSwitchCompanionInline: (companionId: CompanionVoiceId) => void;
  onReplaySpeech: () => void;
  onSpeakWithCompanion: (text: string, emotionTone?: EmotionProsodyTone) => void;
  onComplete: () => void;
  onResetToPick: () => void;
  onClose: () => void;
  forceEnableQaForTest?: boolean;
}

/**
 * Pure state-transition verifier proving that switching presets or transition subbranches
 * in `DifficultyBreakerModal` clears all stale progression (`resetBreakerScenarioProgressToFen`, lines 536-541).
 */
export interface BreakerProgressionSnapshot {
  currentStep: BreakerStageId;
  selectedPresetId: BreakerPresetId;
  transitionSubId: BreakerTransitionSubBranchId;
  fenRevealed: BreakerFenRevealedState;
  isCoinFlipped: boolean;
  steppingStones: Array<BreakerActionSteppingStoneItem | null>;
  pausedVoluntarily: boolean;
}

export function simulateBreakerScenarioSwitchReset(
  previous: BreakerProgressionSnapshot,
  nextPresetId: BreakerPresetId,
  nextTransitionSubId?: BreakerTransitionSubBranchId
): BreakerProgressionSnapshot {
  return {
    currentStep: 'fen',
    selectedPresetId: nextPresetId,
    transitionSubId: nextTransitionSubId ?? previous.transitionSubId,
    fenRevealed: { fact: false, feeling: false, guess: false },
    isCoinFlipped: false,
    steppingStones: [null, null, null],
    pausedVoluntarily: false,
  };
}

export function isBreakerProgressionCleanlyResetToFen(
  snapshot: BreakerProgressionSnapshot
): boolean {
  return (
    snapshot.currentStep === 'fen' &&
    snapshot.fenRevealed.fact === false &&
    snapshot.fenRevealed.feeling === false &&
    snapshot.fenRevealed.guess === false &&
    snapshot.isCoinFlipped === false &&
    snapshot.steppingStones.length === 3 &&
    snapshot.steppingStones.every((slot) => slot === null) &&
    snapshot.pausedVoluntarily === false
  );
}

// ============================================================================
// 3. Canonical 22-Set / 68-Discrete-State Production Asset Manifest (Gate B0R-B & B0R-C)
// ============================================================================

export type Batch02ProductionSceneId =
  | 'thought_detective'
  | 'difficulty_breaker'
  | 'shared_companion_rig';

export type Batch02LedgerSceneId = Batch02ProductionSceneId | 'reference_board';

export type Batch02AssetEligibilityStatus =
  | 'PRODUCTION_ART_ACCEPTED'
  | 'TECH_PREVIEW_ONLY'
  | 'MISSING'
  | 'UNVERIFIED';

export interface Batch02ArtDirectorApprovalRecord {
  approvedBy: string;
  approvalId: string;
  approvedSha256: string;
  approvedAt: string;
  version?: string;
}

export interface Batch02SharedAssetRef {
  primaryAssetId: string;
  sharedWithAssetIds: readonly string[];
  approvalId: string;
  reason: string;
}

export interface Batch02DiscreteStateDeliverableEntry {
  discreteAssetId: string;
  setId: string;
  stateVariant: string;
  companionId: CompanionVoiceId | null;
  filePath: string;
  existsInRepo: boolean;
  format: 'png' | 'webp' | 'svg' | 'missing';
  pixelDimensions: { width: number; height: number } | null;
  hasAlphaTransparency: boolean | null;
  byteSize: number | null;
  sha256: string | null;
  status: Batch02AssetEligibilityStatus;
  artDirectorApproval?: Batch02ArtDirectorApprovalRecord | null;
  sharedAssetRef?: Batch02SharedAssetRef | null;
}

export interface Batch02AssetInventoryEntry {
  assetId: string;
  setId?: string;
  stateVariant?: string;
  companionId?: CompanionVoiceId | null;
  sceneId: Batch02LedgerSceneId;
  role: string;
  filePath: string | null;
  existsInRepo: boolean;
  format: 'png' | 'webp' | 'svg' | 'missing';
  pixelDimensions: { width: number; height: number } | null;
  requiredMinDimensions?: { width: number; height: number } | null;
  hasAlphaTransparency: boolean | null;
  alphaZeroRatio?: number | null;
  byteSize: number | null;
  sha256: string | null;
  provenance: string;
  sharesIdenticalBytesWith: readonly string[];
  status: Batch02AssetEligibilityStatus;
  gapReason: string;
  waitingOwner?: string;
  artDirectorApproval?: Batch02ArtDirectorApprovalRecord | null;
  sharedAssetRef?: Batch02SharedAssetRef | null;
  discreteStateDeliverables?: readonly Batch02DiscreteStateDeliverableEntry[];
}

export interface Batch02CanonicalAssetSetSpec {
  readonly setOrderId: string;
  readonly setId: string;
  readonly sceneId: Batch02ProductionSceneId;
  readonly role: string;
  readonly targetGroupPath: string;
  readonly minWidth: number;
  readonly minHeight: number;
  readonly requireAlpha: boolean;
  readonly requiredStateVariants: readonly string[];
  readonly minimumDiscreteStateVariants: number;
  readonly waitingOwner: 'Art Production / Art Director';
  readonly approvalAuthority: 'Art Director';
}

export interface Batch02CanonicalDiscreteStateSpec {
  readonly discreteOrderId: string;
  readonly discreteAssetId: string;
  readonly setId: string;
  readonly sceneId: Batch02ProductionSceneId;
  readonly stateVariant: string;
  readonly companionId: CompanionVoiceId | null;
  readonly targetGroupPath: string;
  readonly targetFilePath: string;
  readonly minWidth: number;
  readonly minHeight: number;
  readonly requireAlpha: boolean;
  readonly waitingOwner: 'Art Production / Art Director';
  readonly approvalAuthority: 'Art Director';
}

/**
 * Canonical 22 Production Asset Sets matching `05_ASSET_PRODUCTION_ORDER.csv` (22 sets = 68 discrete state variants).
 */
export const BATCH02_CANONICAL_ASSET_SETS: readonly Batch02CanonicalAssetSetSpec[] = [
  {
    setOrderId: 'B02-SET-01',
    setId: 'prod_detective_master_plate_desktop_16x9',
    sceneId: 'thought_detective',
    role: 'Thought Detective Lab 3D Master Scene Backplate — Desktop 16:9 (>=2560x1440, zero text/characters)',
    targetGroupPath: 'public/visual-v2/batch02-art/scenes/detective_workshop_desktop.webp',
    minWidth: 2560,
    minHeight: 1440,
    requireAlpha: false,
    requiredStateVariants: ['default'],
    minimumDiscreteStateVariants: 1,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-02',
    setId: 'prod_detective_master_plate_mobile_3x4',
    sceneId: 'thought_detective',
    role: 'Thought Detective Lab 3D Master Scene Backplate — Mobile 3:4 (>=1200x1600, aspect-ratio-preserving safe zones)',
    targetGroupPath: 'public/visual-v2/batch02-art/scenes/detective_workshop_mobile.webp',
    minWidth: 1200,
    minHeight: 1600,
    requireAlpha: false,
    requiredStateVariants: ['default'],
    minimumDiscreteStateVariants: 1,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-03',
    setId: 'prod_detective_layer_distant_window_sky',
    sceneId: 'thought_detective',
    role: 'Thought Detective L1 Distant Layer — Observatory Window & Island Sky (>=2560x1440 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/layers/detective_l1_distant_sky_rgba.webp',
    minWidth: 2560,
    minHeight: 1440,
    requireAlpha: true,
    requiredStateVariants: ['default'],
    minimumDiscreteStateVariants: 1,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-04',
    setId: 'prod_detective_layer_mid_workbench_bookshelves',
    sceneId: 'thought_detective',
    role: 'Thought Detective L2 Midground Layer — 3D Wooden Investigation Desk & Clue Shelves (>=2560x1440 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/layers/detective_l2_mid_workbench_rgba.webp',
    minWidth: 2560,
    minHeight: 1440,
    requireAlpha: true,
    requiredStateVariants: ['default'],
    minimumDiscreteStateVariants: 1,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-05',
    setId: 'prod_detective_layer_fore_arch_lanterns',
    sceneId: 'thought_detective',
    role: 'Thought Detective L3 Foreground Frame — Warm Wooden Archway & Hanging Magnifier Lamps (>=2560x1440 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/layers/detective_l3_fore_arch_rgba.webp',
    minWidth: 2560,
    minHeight: 1440,
    requireAlpha: true,
    requiredStateVariants: ['default'],
    minimumDiscreteStateVariants: 1,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-06',
    setId: 'prod_detective_prop_tool_flag_states',
    sceneId: 'thought_detective',
    role: '3D Interactive Tool 1 Prop — Person vs. Event Flag (`flag_attached` & `flag_removed`, >=512x512 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/detective_tool_flag_rgba.webp',
    minWidth: 512,
    minHeight: 512,
    requireAlpha: true,
    requiredStateVariants: ['flag_attached', 'flag_removed'],
    minimumDiscreteStateVariants: 2,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-07',
    setId: 'prod_detective_prop_tool_three_lenses_states',
    sceneId: 'thought_detective',
    role: '3D Interactive Tool 2 Prop — Three Perspective Lenses (`my_lens`, `his_lens`, `sky_lens`, >=512x512 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/detective_tool_three_lenses_rgba.webp',
    minWidth: 512,
    minHeight: 512,
    requireAlpha: true,
    requiredStateVariants: ['my_lens', 'his_lens', 'sky_lens'],
    minimumDiscreteStateVariants: 3,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-08',
    setId: 'prod_detective_prop_tool_two_sided_coin_states',
    sceneId: 'thought_detective',
    role: '3D Interactive Tool 3 Prop — Two-Sided Coin (`front` & `back`, >=512x512 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/detective_tool_coin_rgba.webp',
    minWidth: 512,
    minHeight: 512,
    requireAlpha: true,
    requiredStateVariants: ['front', 'back'],
    minimumDiscreteStateVariants: 2,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-09',
    setId: 'prod_detective_prop_tool_balance_scale_states',
    sceneId: 'thought_detective',
    role: '3D Interactive Tool 4 Prop — Fairness Balance Scale (`idle` & `interact`, >=512x512 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/detective_tool_balance_scale_rgba.webp',
    minWidth: 512,
    minHeight: 512,
    requireAlpha: true,
    requiredStateVariants: ['idle', 'interact'],
    minimumDiscreteStateVariants: 2,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-10',
    setId: 'prod_detective_prop_tool_safety_fence_states',
    sceneId: 'thought_detective',
    role: '3D Interactive Tool 5 Prop — Protective Safety Fence Shield (`idle` & `safe_boundary_highlight`, >=512x512 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/detective_tool_safety_fence_rgba.webp',
    minWidth: 512,
    minHeight: 512,
    requireAlpha: true,
    requiredStateVariants: ['idle', 'safe_boundary_highlight'],
    minimumDiscreteStateVariants: 2,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-11',
    setId: 'prod_detective_prop_three_boxes_set',
    sceneId: 'thought_detective',
    role: '3D Mode 2 Props — Three Sorting Chests (`visible`/`heart`/`guess` × `empty`/`placed`, >=600x400 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/detective_three_boxes_set_rgba.webp',
    minWidth: 600,
    minHeight: 400,
    requireAlpha: true,
    requiredStateVariants: [
      'visible_empty',
      'heart_empty',
      'guess_empty',
      'visible_placed',
      'heart_placed',
      'guess_placed',
    ],
    minimumDiscreteStateVariants: 6,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-12',
    setId: 'prod_detective_prop_control_circles_rings',
    sceneId: 'thought_detective',
    role: '3D Mode 3 Props — Concentric Control Rings (`adult`, `mine`, `together`, `active_selection`, >=800x600 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/detective_control_circles_rgba.webp',
    minWidth: 800,
    minHeight: 600,
    requireAlpha: true,
    requiredStateVariants: ['adult', 'mine', 'together', 'active_selection'],
    minimumDiscreteStateVariants: 4,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-13',
    setId: 'prod_detective_prop_four_steps_staircase',
    sceneId: 'thought_detective',
    role: '3D Mode 4 Props — 4-Step Stepping-Back Observation Ladder (`step_1`..`step_4`, >=800x500 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/detective_four_steps_ladder_rgba.webp',
    minWidth: 800,
    minHeight: 500,
    requireAlpha: true,
    requiredStateVariants: ['step_1', 'step_2', 'step_3', 'step_4'],
    minimumDiscreteStateVariants: 4,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-14',
    setId: 'prod_breaker_master_plate_desktop_16x9',
    sceneId: 'difficulty_breaker',
    role: 'Difficulty Breaker 3D Master Scene Backplate — Desktop 16:9 (>=2560x1440, Artisan Stone-Splitting Workbench & Creek)',
    targetGroupPath: 'public/visual-v2/batch02-art/scenes/breaker_workbench_creek_desktop.webp',
    minWidth: 2560,
    minHeight: 1440,
    requireAlpha: false,
    requiredStateVariants: ['default'],
    minimumDiscreteStateVariants: 1,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-15',
    setId: 'prod_breaker_master_plate_mobile_3x4',
    sceneId: 'difficulty_breaker',
    role: 'Difficulty Breaker 3D Master Scene Backplate — Mobile 3:4 (>=1200x1600, aspect-ratio-preserving safe zones)',
    targetGroupPath: 'public/visual-v2/batch02-art/scenes/breaker_workbench_creek_mobile.webp',
    minWidth: 1200,
    minHeight: 1600,
    requireAlpha: false,
    requiredStateVariants: ['default'],
    minimumDiscreteStateVariants: 1,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-16',
    setId: 'prod_breaker_layer_creek_and_workbench',
    sceneId: 'difficulty_breaker',
    role: 'Difficulty Breaker L2 Midground Layer — 3D Wooden Splitting Table & Sparkling Stream (>=2560x1440 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/layers/breaker_l2_workbench_stream_rgba.webp',
    minWidth: 2560,
    minHeight: 1440,
    requireAlpha: true,
    requiredStateVariants: ['default'],
    minimumDiscreteStateVariants: 1,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-17',
    setId: 'prod_breaker_prop_preset_boulders_3x',
    sceneId: 'difficulty_breaker',
    role: 'Stage 0 (`pick`) 3D Preset Boulders (3x) & Two-Homes Subbranch Compass Tokens (4x) (>=512x512 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/breaker_preset_boulders_rgba.webp',
    minWidth: 512,
    minHeight: 512,
    requireAlpha: true,
    requiredStateVariants: [
      'two_homes',
      'blocks_broken',
      'friend_ask',
      'sub_dual_attachment',
      'sub_loyalty_conflict',
      'sub_specific_concern',
      'sub_ordinary_transition',
    ],
    minimumDiscreteStateVariants: 7,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-18',
    setId: 'prod_breaker_prop_fen_crystal_stones_3x',
    sceneId: 'difficulty_breaker',
    role: 'Stage 1 (`fen`) 3D Splittable Crystal Stones — Fact, Feeling, Guess in Unrevealed & Revealed States (>=900x450 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/breaker_fen_crystals_rgba.webp',
    minWidth: 900,
    minHeight: 450,
    requireAlpha: true,
    requiredStateVariants: [
      'fact_unrevealed',
      'fact_revealed',
      'feeling_unrevealed',
      'feeling_revealed',
      'guess_unrevealed',
      'guess_revealed',
    ],
    minimumDiscreteStateVariants: 6,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-19',
    setId: 'prod_breaker_prop_tong_dual_lens_turntable',
    sceneId: 'difficulty_breaker',
    role: 'Stage 2 (`tong`) 3D Dual-Sided Perspective Lens Turntable (`front` & `flipped`, >=600x600 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/breaker_tong_dual_lens_rgba.webp',
    minWidth: 600,
    minHeight: 600,
    requireAlpha: true,
    requiredStateVariants: ['front', 'flipped'],
    minimumDiscreteStateVariants: 2,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-20',
    setId: 'prod_breaker_prop_ze_river_stepping_stones',
    sceneId: 'difficulty_breaker',
    role: 'Stage 3 (`ze`) 3D Creek Stepping-Stone Slots (`slot_0_empty`..`slot_2_empty`, `slot_placed`, `safety_action`, `pause_rest`, >=900x450 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/breaker_ze_stepping_stones_rgba.webp',
    minWidth: 900,
    minHeight: 450,
    requireAlpha: true,
    requiredStateVariants: [
      'slot_0_empty',
      'slot_1_empty',
      'slot_2_empty',
      'slot_placed',
      'safety_action',
      'pause_rest',
    ],
    minimumDiscreteStateVariants: 6,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-21',
    setId: 'prod_breaker_prop_complete_celebration_bridge',
    sceneId: 'difficulty_breaker',
    role: 'Stage 4 (`complete`) 3D Completed Stepping-Stone Path & Lantern Celebration Overlay (`completed_path` & `celebration_idle`, >=1200x675 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/props/breaker_complete_path_rgba.webp',
    minWidth: 1200,
    minHeight: 675,
    requireAlpha: true,
    requiredStateVariants: ['completed_path', 'celebration_idle'],
    minimumDiscreteStateVariants: 2,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
  {
    setOrderId: 'B02-SET-22',
    setId: 'prod_shared_4companions_3d_rig_masters',
    sceneId: 'shared_companion_rig',
    role: '4 Animal Companions (`guoguo_squirrel`, `beibei_otter`, `tiantian_raccoon`, `qiqi_deer`) High-Res 3D Layered Masters (`idle`, `listening`, `speaking`, >=1024x1024 RGBA)',
    targetGroupPath: 'public/visual-v2/batch02-art/characters/{companionId}/rig_master_rgba.webp',
    minWidth: 1024,
    minHeight: 1024,
    requireAlpha: true,
    requiredStateVariants: [
      'guoguo_idle',
      'guoguo_listening',
      'guoguo_speaking',
      'beibei_idle',
      'beibei_listening',
      'beibei_speaking',
      'tiantian_idle',
      'tiantian_listening',
      'tiantian_speaking',
      'qiqi_idle',
      'qiqi_listening',
      'qiqi_speaking',
    ],
    minimumDiscreteStateVariants: 12,
    waitingOwner: 'Art Production / Art Director',
    approvalAuthority: 'Art Director',
  },
] as const;

const COMPANION_PREFIX_MAP: Readonly<Record<string, CompanionVoiceId>> = {
  guoguo: 'guoguo_squirrel',
  beibei: 'beibei_otter',
  tiantian: 'tiantian_raccoon',
  qiqi: 'qiqi_deer',
};

function resolveConcreteDiscreteTargetFilePath(
  setSpec: Batch02CanonicalAssetSetSpec,
  stateVariant: string
): { companionId: CompanionVoiceId | null; targetFilePath: string } {
  if (setSpec.sceneId === 'shared_companion_rig') {
    const [prefix, pose] = stateVariant.split('_');
    const companionId = COMPANION_PREFIX_MAP[prefix] ?? 'guoguo_squirrel';
    return {
      companionId,
      targetFilePath: `public/visual-v2/batch02-art/characters/${companionId}/rig_master_${pose}_rgba.webp`,
    };
  }
  if (setSpec.requiredStateVariants.length === 1 && stateVariant === 'default') {
    return {
      companionId: null,
      targetFilePath: setSpec.targetGroupPath,
    };
  }
  const baseWithoutExt = setSpec.targetGroupPath.replace(/\.webp$/i, '');
  return {
    companionId: null,
    targetFilePath: `${baseWithoutExt}__${stateVariant}.webp`,
  };
}

/**
 * Canonical 68 Discrete State Deliverables expanded from the 22 canonical sets.
 */
export const BATCH02_CANONICAL_DISCRETE_STATES: readonly Batch02CanonicalDiscreteStateSpec[] =
  BATCH02_CANONICAL_ASSET_SETS.flatMap((setSpec) =>
    setSpec.requiredStateVariants.map((stateVariant) => {
      const { companionId, targetFilePath } = resolveConcreteDiscreteTargetFilePath(
        setSpec,
        stateVariant
      );
      return {
        discreteOrderId: '',
        discreteAssetId:
          setSpec.requiredStateVariants.length === 1 && stateVariant === 'default'
            ? setSpec.setId
            : `${setSpec.setId}__${stateVariant}`,
        setId: setSpec.setId,
        sceneId: setSpec.sceneId,
        stateVariant,
        companionId,
        targetGroupPath: setSpec.targetGroupPath,
        targetFilePath,
        minWidth: setSpec.minWidth,
        minHeight: setSpec.minHeight,
        requireAlpha: setSpec.requireAlpha,
        waitingOwner: setSpec.waitingOwner,
        approvalAuthority: setSpec.approvalAuthority,
      };
    })
  ).map((item, idx) => ({
    ...item,
    discreteOrderId: `B02-STATE-${String(idx + 1).padStart(3, '0')}`,
  }));

export const BATCH02_TOTAL_REQUIRED_SETS = 22 as const;
export const BATCH02_TOTAL_REQUIRED_DISCRETE_STATES = 68 as const;

// ============================================================================
// 4. Gate B0R-B Physical Art Eligibility & Read-Only Readiness Evaluator
// ============================================================================

export interface Batch02DecodedImageInspection {
  readonly valid: boolean;
  readonly format: 'png' | 'webp' | null;
  readonly width: number;
  readonly height: number;
  readonly hasAlpha: boolean;
  readonly error: string | null;
}

export interface Batch02IndependentArtApprovalEntry {
  readonly discreteAssetId: string;
  readonly setId: string;
  readonly stateVariant: string;
  readonly canonicalFilePath: string;
  readonly verifiedPhysicalSha256: string;
  readonly gateVersion: 'A-LAND_V2.3_BATCH02';
  readonly approvedBy: string;
  readonly approvalTicketId: string;
  readonly approvedAt: string;
}

/**
 * Authoritative Independent Art Director Approval Registry (Gate B0R-B Requirement 3).
 *
 * Candidate manifests MUST NEVER self-declare their own approval (`entry.artDirectorApproval`
 * is untrusted metadata only). An asset is only considered approved by the Art Director if its
 * physical on-disk SHA-256, `discreteAssetId`, `setId`, `stateVariant`, and `canonicalFilePath`
 * match a cryptographically anchored entry in this independent registry.
 *
 * At Gate B0R-B (0/68 production assets produced), this registry is empty and frozen.
 */
export const BATCH02_INDEPENDENT_ART_APPROVAL_REGISTRY: readonly Batch02IndependentArtApprovalEntry[] =
  Object.freeze([]);

/**
 * Gate B0R-B Read-Only Readiness Hold Lock.
 * While `true`, `evaluateBatch02ProductionArtEligibility` acts strictly as a read-only readiness
 * and physical audit statistics evaluator and cannot issue `BATCH02_UI_REPLACEMENT_AUTHORIZED`.
 */
export const BATCH02_READ_ONLY_READINESS_HOLD_LOCK = true as const;

export interface Batch02PermissionLayersReport {
  readonly behaviorAndRequirementContractValid: boolean;
  readonly metadataReadiness: {
    readonly metadataComplete: boolean;
    readonly metadataReadyDiscreteStateCount: number;
    readonly metadataReadySetCount: number;
    readonly missingMetadataDiscreteStateIds: readonly string[];
    readonly missingMetadataSetIds: readonly string[];
    readonly missingMetadataCompanionIds: readonly CompanionVoiceId[];
    readonly metadataBlockingReasons: readonly string[];
  };
  readonly physicalArtVerification: {
    readonly physicallyVerifiedOnDisk: boolean;
    readonly physicallyVerifiedDiscreteStateCount: number;
    readonly physicallyVerifiedSetCount: number;
    readonly missingPhysicalDiscreteStateIds: readonly string[];
    readonly missingPhysicalSetIds: readonly string[];
    readonly missingPhysicalCompanionIds: readonly CompanionVoiceId[];
    readonly physicalBlockingReasons: readonly string[];
  };
  readonly independentArtApproval: {
    readonly authenticatedApprovalVerified: boolean;
    readonly approvedDiscreteStateCount: number;
    readonly approvedSetCount: number;
    readonly unapprovedDiscreteStateIds: readonly string[];
    readonly approvalBlockingReasons: readonly string[];
  };
  readonly uiReplacementAuthorization: {
    readonly evaluatorMode: 'READ_ONLY_READINESS_STATISTICS_HOLD_LOCKED';
    readonly physicallyVerifiedAndApproved: boolean;
    readonly canAuthorizeBatch02UiReplacement: false;
  };
}

export interface Batch02ProductionArtEligibilityOptions {
  /**
   * Optional explicit repository root directory for physical file resolution.
   * Defaults to auto-detected repository root and `process.cwd()`.
   */
  readonly repoRootDir?: string;
  /**
   * Optional reference timestamp (ms since epoch) used to reject future-dated metadata timestamps.
   * Defaults to `Date.now()`.
   */
  readonly referenceNowMs?: number;
}

export interface Batch02ProductionArtEligibilityReport {
  canAuthorizeBatch02UiReplacement: boolean;
  gateStatus:
    | typeof BATCH02_GATE_B0RB_DECISION_STATUS
    | typeof BATCH02_GATE0_EXECUTION_STATUS;
  holdFlags: Batch02HoldFlags;
  evaluatorMode: 'READ_ONLY_READINESS_STATISTICS_HOLD_LOCKED';
  metadataComplete: boolean;
  physicallyVerifiedOnDisk: boolean;
  authenticatedApprovalVerified: boolean;
  physicallyVerifiedAndApproved: boolean;
  metadataReadyDiscreteStateCount: number;
  metadataReadySetCount: number;
  physicallyVerifiedDiscreteStateCount: number;
  physicallyVerifiedSetCount: number;
  approvedDiscreteStateCount: number;
  productionAcceptedCount: number;
  verifiedDiscreteStateCount: number;
  requiredDiscreteStateCount: number;
  verifiedSetCount: number;
  requiredSetCount: number;
  techPreviewOnlyCount: number;
  missingAssetCount: number;
  unverifiedAssetCount: number;
  duplicateGeometryClusterCount: number;
  missingRequiredSetIds: readonly string[];
  missingRequiredDiscreteStateIds: readonly string[];
  missingCompanionIds: readonly CompanionVoiceId[];
  blockingReasons: readonly string[];
  permissionLayers: Batch02PermissionLayersReport;
}

const HEX_SHA256_REGEX = /^[a-f0-9]{64}$/i;

// Precomputed IEEE 802.3 CRC32 lookup table for real PNG chunk integrity verification
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.byteLength; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Real PNG binary decoder and integrity verifier (Gate B0R-B Requirement 2).
 * Does NOT merely check the 8-byte PNG header:
 * - Verifies every chunk's IEEE 802.3 CRC32 checksum.
 * - Parses and validates `IHDR` (dimensions, bitDepth, colorType, compression, filter, interlace).
 * - Detects RGBA / alpha transparency via `colorType` (4 or 6) or `tRNS` chunk.
 * - Decompresses concatenated `IDAT` chunks using `zlib.inflateSync` to catch corrupt/fake payloads.
 * - Verifies decompressed scanline byte length and filter type bytes (0..4) for non-interlaced images.
 * - Verifies `IEND` termination with zero trailing garbage bytes.
 */
export function decodeAndVerifyPngBuffer(buf: Uint8Array): Batch02DecodedImageInspection {
  if (!buf || buf.byteLength < 33) {
    return {
      valid: false,
      format: null,
      width: 0,
      height: 0,
      hasAlpha: false,
      error: 'PNG_TOO_SMALL: Buffer is smaller than minimum valid PNG (33 bytes).',
    };
  }

  const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) {
    if (buf[i] !== pngSig[i]) {
      return {
        valid: false,
        format: null,
        width: 0,
        height: 0,
        hasAlpha: false,
        error: 'PNG_INVALID_SIGNATURE: Missing 8-byte PNG magic header.',
      };
    }
  }

  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let offset = 8;
  let seenIhdr = false;
  let seenIend = false;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  let hasTrns = false;
  const idatChunks: Buffer[] = [];

  while (offset < buf.byteLength) {
    if (offset + 12 > buf.byteLength) {
      return {
        valid: false,
        format: 'png',
        width: 0,
        height: 0,
        hasAlpha: false,
        error: 'PNG_TRUNCATED_CHUNK_HEADER: Unexpected EOF before IEND.',
      };
    }

    const length = view.getUint32(offset, false);
    const typeBytes = buf.subarray(offset + 4, offset + 8);
    const type = String.fromCharCode(typeBytes[0], typeBytes[1], typeBytes[2], typeBytes[3]);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const crcOffset = dataEnd;

    if (crcOffset + 4 > buf.byteLength) {
      return {
        valid: false,
        format: 'png',
        width: 0,
        height: 0,
        hasAlpha: false,
        error: `PNG_TRUNCATED_CHUNK_DATA: Chunk "${type}" exceeds buffer bounds.`,
      };
    }

    const expectedCrc = view.getUint32(crcOffset, false);
    const actualCrc = computeCrc32(buf.subarray(offset + 4, dataEnd));
    if (actualCrc !== expectedCrc) {
      return {
        valid: false,
        format: 'png',
        width: 0,
        height: 0,
        hasAlpha: false,
        error: `PNG_CRC32_MISMATCH: Chunk "${type}" failed CRC32 integrity verification.`,
      };
    }

    const chunkData = buf.subarray(dataStart, dataEnd);

    if (!seenIhdr) {
      if (type !== 'IHDR' || length !== 13) {
        return {
          valid: false,
          format: 'png',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'PNG_MISSING_IHDR: First chunk must be a 13-byte IHDR chunk.',
        };
      }
      seenIhdr = true;
      width = view.getUint32(dataStart, false);
      height = view.getUint32(dataStart + 4, false);
      bitDepth = chunkData[8];
      colorType = chunkData[9];
      const compression = chunkData[10];
      const filter = chunkData[11];
      interlace = chunkData[12];

      if (width <= 0 || height <= 0 || width > 32768 || height > 32768) {
        return {
          valid: false,
          format: 'png',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: `PNG_INVALID_DIMENSIONS: IHDR dimensions ${width}x${height} out of valid range.`,
        };
      }
      if (compression !== 0 || filter !== 0 || (interlace !== 0 && interlace !== 1)) {
        return {
          valid: false,
          format: 'png',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'PNG_INVALID_IHDR_FLAGS: Invalid compression, filter, or interlace method.',
        };
      }
      const validDepths: Record<number, readonly number[]> = {
        0: [1, 2, 4, 8, 16],
        2: [8, 16],
        3: [1, 2, 4, 8],
        4: [8, 16],
        6: [8, 16],
      };
      if (!validDepths[colorType] || !validDepths[colorType].includes(bitDepth)) {
        return {
          valid: false,
          format: 'png',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: `PNG_INVALID_COLOR_BIT_DEPTH: Unsupported colorType=${colorType} bitDepth=${bitDepth}.`,
        };
      }
    } else if (type === 'tRNS') {
      if (length > 0) {
        hasTrns = true;
      }
    } else if (type === 'IDAT') {
      if (length > 0) {
        idatChunks.push(Buffer.from(chunkData));
      }
    } else if (type === 'IEND') {
      if (length !== 0) {
        return {
          valid: false,
          format: 'png',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'PNG_INVALID_IEND: IEND chunk must have length 0.',
        };
      }
      seenIend = true;
      offset = crcOffset + 4;
      break;
    }

    offset = crcOffset + 4;
  }

  if (!seenIhdr || !seenIend || offset !== buf.byteLength) {
    return {
      valid: false,
      format: 'png',
      width: 0,
      height: 0,
      hasAlpha: false,
      error: 'PNG_INCOMPLETE_OR_TRAILING_BYTES: Missing IEND or trailing bytes after IEND.',
    };
  }

  if (idatChunks.length === 0) {
    return {
      valid: false,
      format: 'png',
      width: 0,
      height: 0,
      hasAlpha: false,
      error: 'PNG_MISSING_IDAT: Zero IDAT image payload chunks found.',
    };
  }

  let decompressed: Buffer;
  try {
    decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  } catch (err) {
    return {
      valid: false,
      format: 'png',
      width: 0,
      height: 0,
      hasAlpha: false,
      error: `PNG_CORRUPT_IDAT_STREAM: Zlib inflate failed (${err instanceof Error ? err.message : String(err)}).`,
    };
  }

  if (interlace === 0) {
    const channels =
      colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
    const rowBytes = 1 + Math.ceil((width * channels * bitDepth) / 8);
    const expectedBytes = rowBytes * height;
    if (decompressed.byteLength !== expectedBytes) {
      return {
        valid: false,
        format: 'png',
        width: 0,
        height: 0,
        hasAlpha: false,
        error: `PNG_SCANLINE_SIZE_MISMATCH: Decompressed IDAT length ${decompressed.byteLength} !== expected ${expectedBytes} for ${width}x${height}.`,
      };
    }
    for (let r = 0; r < height; r++) {
      const filterType = decompressed[r * rowBytes];
      if (filterType > 4) {
        return {
          valid: false,
          format: 'png',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: `PNG_INVALID_SCANLINE_FILTER: Row ${r} has invalid filter byte ${filterType}.`,
        };
      }
    }
  } else if (decompressed.byteLength === 0) {
    return {
      valid: false,
      format: 'png',
      width: 0,
      height: 0,
      hasAlpha: false,
      error: 'PNG_EMPTY_INTERLACED_PAYLOAD: Decompressed Adam7 payload is empty.',
    };
  }

  const hasAlpha = colorType === 6 || colorType === 4 || hasTrns;
  return {
    valid: true,
    format: 'png',
    width,
    height,
    hasAlpha,
    error: null,
  };
}

/**
 * Real WebP binary decoder and integrity verifier (Gate B0R-B Requirement 2).
 * Does NOT merely check the 12-byte RIFF/WEBP header:
 * - Verifies exact RIFF container length (`riffSize === buf.byteLength - 8`).
 * - Walks all RIFF chunks (`VP8X`, `VP8L`, `VP8 `, `ALPH`) with bounds checks.
 * - For `VP8L` (lossless): verifies magic byte `0x2f`, version `0`, 14-bit width/height, alpha bit, and non-empty bitstream.
 * - For `VP8 ` (lossy): verifies keyframe bit, showFrame bit, first partition size bounds, `0x9d 0x01 0x2a` start code, and dimensions.
 * - For `VP8X` (extended): verifies flags, 24-bit dimensions, `ALPH` chunk presence when lossy alpha is flagged, and cross-checks `VP8X` dimensions against the actual `VP8 `/`VP8L` bitstream dimensions.
 */
export function decodeAndVerifyWebpBuffer(buf: Uint8Array): Batch02DecodedImageInspection {
  if (!buf || buf.byteLength < 20) {
    return {
      valid: false,
      format: null,
      width: 0,
      height: 0,
      hasAlpha: false,
      error: 'WEBP_TOO_SMALL: Buffer is smaller than minimum valid WebP (20 bytes).',
    };
  }

  const riffHeader = String.fromCharCode(buf[0], buf[1], buf[2], buf[3]);
  const webpHeader = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]);
  if (riffHeader !== 'RIFF' || webpHeader !== 'WEBP') {
    return {
      valid: false,
      format: null,
      width: 0,
      height: 0,
      hasAlpha: false,
      error: 'WEBP_INVALID_SIGNATURE: Missing RIFF....WEBP container header.',
    };
  }

  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const riffSize = view.getUint32(4, true);
  if (riffSize !== buf.byteLength - 8) {
    return {
      valid: false,
      format: 'webp',
      width: 0,
      height: 0,
      hasAlpha: false,
      error: `WEBP_RIFF_SIZE_MISMATCH: RIFF size field (${riffSize}) !== buffer length - 8 (${buf.byteLength - 8}).`,
    };
  }

  let offset = 12;
  let vp8xWidth: number | null = null;
  let vp8xHeight: number | null = null;
  let vp8xAlphaFlag = false;
  let hasAlphChunk = false;
  let hasBitstreamChunk = false;
  let bitstreamWidth = 0;
  let bitstreamHeight = 0;
  let bitstreamAlpha = false;

  while (offset < buf.byteLength) {
    if (offset + 8 > buf.byteLength) {
      return {
        valid: false,
        format: 'webp',
        width: 0,
        height: 0,
        hasAlpha: false,
        error: 'WEBP_TRUNCATED_CHUNK_HEADER: Unexpected EOF reading RIFF chunk header.',
      };
    }

    const fourCC = String.fromCharCode(
      buf[offset],
      buf[offset + 1],
      buf[offset + 2],
      buf[offset + 3]
    );
    const chunkSize = view.getUint32(offset + 4, true);
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkSize;
    const paddedEnd = dataEnd + (chunkSize & 1);

    if (dataEnd > buf.byteLength || paddedEnd > buf.byteLength) {
      return {
        valid: false,
        format: 'webp',
        width: 0,
        height: 0,
        hasAlpha: false,
        error: `WEBP_TRUNCATED_CHUNK_PAYLOAD: Chunk "${fourCC}" size ${chunkSize} exceeds buffer length.`,
      };
    }

    if (fourCC === 'VP8X') {
      if (offset !== 12 || chunkSize !== 10) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'WEBP_INVALID_VP8X_CHUNK: VP8X must be the first chunk with size 10.',
        };
      }
      const flags = buf[dataStart];
      if ((flags & 0xc1) !== 0) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'WEBP_INVALID_VP8X_FLAGS: Reserved VP8X flag bits are non-zero.',
        };
      }
      vp8xAlphaFlag = (flags & 0x10) !== 0;
      vp8xWidth =
        1 + (buf[dataStart + 4] | (buf[dataStart + 5] << 8) | (buf[dataStart + 6] << 16));
      vp8xHeight =
        1 + (buf[dataStart + 7] | (buf[dataStart + 8] << 8) | (buf[dataStart + 9] << 16));
    } else if (fourCC === 'ALPH') {
      if (chunkSize < 2) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'WEBP_INVALID_ALPH_CHUNK: ALPH chunk payload is too short.',
        };
      }
      const alphFlags = buf[dataStart];
      if ((alphFlags & 0xc0) !== 0) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'WEBP_INVALID_ALPH_HEADER: Reserved ALPH header bits are non-zero.',
        };
      }
      hasAlphChunk = true;
    } else if (fourCC === 'VP8L') {
      if (chunkSize < 6) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'WEBP_INVALID_VP8L_CHUNK: VP8L chunk is smaller than 6 bytes.',
        };
      }
      if (buf[dataStart] !== 0x2f) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: `WEBP_INVALID_VP8L_SIGNATURE: Expected 0x2f signature byte, got 0x${buf[dataStart].toString(16)}.`,
        };
      }
      const bits = view.getUint32(dataStart + 1, true);
      const w = (bits & 0x3fff) + 1;
      const h = ((bits >>> 14) & 0x3fff) + 1;
      const alphaUsed = ((bits >>> 28) & 0x1) === 1;
      const version = (bits >>> 29) & 0x7;
      if (version !== 0) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: `WEBP_INVALID_VP8L_VERSION: Expected version 0, got ${version}.`,
        };
      }
      let nonZeroBitstreamByte = false;
      for (let i = dataStart + 5; i < dataEnd; i++) {
        if (buf[i] !== 0) {
          nonZeroBitstreamByte = true;
          break;
        }
      }
      if (!nonZeroBitstreamByte) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'WEBP_EMPTY_VP8L_BITSTREAM: VP8L entropy bitstream contains only zero bytes.',
        };
      }
      hasBitstreamChunk = true;
      bitstreamWidth = w;
      bitstreamHeight = h;
      bitstreamAlpha = alphaUsed;
    } else if (fourCC === 'VP8 ') {
      if (chunkSize < 11) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'WEBP_INVALID_VP8_CHUNK: VP8 lossy chunk is smaller than 11 bytes.',
        };
      }
      const frameTag =
        buf[dataStart] | (buf[dataStart + 1] << 8) | (buf[dataStart + 2] << 16);
      const isKeyFrame = (frameTag & 0x1) === 0;
      const version = (frameTag >>> 1) & 0x7;
      const showFrame = ((frameTag >>> 4) & 0x1) === 1;
      const firstPartSize = frameTag >>> 5;
      if (!isKeyFrame || version > 3 || !showFrame || firstPartSize <= 0 || 10 + firstPartSize > chunkSize) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'WEBP_INVALID_VP8_FRAME_TAG: Invalid keyframe tag or partition size exceeds chunk.',
        };
      }
      if (
        buf[dataStart + 3] !== 0x9d ||
        buf[dataStart + 4] !== 0x01 ||
        buf[dataStart + 5] !== 0x2a
      ) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'WEBP_INVALID_VP8_START_CODE: Missing 0x9d 0x01 0x2a VP8 start code.',
        };
      }
      const w = view.getUint16(dataStart + 6, true) & 0x3fff;
      const h = view.getUint16(dataStart + 8, true) & 0x3fff;
      if (w <= 0 || h <= 0) {
        return {
          valid: false,
          format: 'webp',
          width: 0,
          height: 0,
          hasAlpha: false,
          error: 'WEBP_INVALID_VP8_DIMENSIONS: Zero width or height in VP8 frame header.',
        };
      }
      hasBitstreamChunk = true;
      bitstreamWidth = w;
      bitstreamHeight = h;
      bitstreamAlpha = hasAlphChunk;
    }

    offset = paddedEnd;
  }

  if (!hasBitstreamChunk) {
    return {
      valid: false,
      format: 'webp',
      width: 0,
      height: 0,
      hasAlpha: false,
      error: 'WEBP_MISSING_BITSTREAM_CHUNK: Container has no valid VP8 or VP8L image bitstream chunk.',
    };
  }

  if (
    vp8xWidth !== null &&
    vp8xHeight !== null &&
    (vp8xWidth !== bitstreamWidth || vp8xHeight !== bitstreamHeight)
  ) {
    return {
      valid: false,
      format: 'webp',
      width: 0,
      height: 0,
      hasAlpha: false,
      error: `WEBP_VP8X_DIMENSION_MISMATCH: VP8X header (${vp8xWidth}x${vp8xHeight}) !== bitstream (${bitstreamWidth}x${bitstreamHeight}).`,
    };
  }

  if (vp8xAlphaFlag && !bitstreamAlpha && !hasAlphChunk) {
    return {
      valid: false,
      format: 'webp',
      width: 0,
      height: 0,
      hasAlpha: false,
      error: 'WEBP_MISSING_DECLARED_ALPHA_DATA: VP8X flags alpha=true, but neither VP8L alpha nor ALPH chunk is present.',
    };
  }

  const hasAlpha = bitstreamAlpha || (vp8xAlphaFlag && hasAlphChunk);
  return {
    valid: true,
    format: 'webp',
    width: bitstreamWidth,
    height: bitstreamHeight,
    hasAlpha,
    error: null,
  };
}

/**
 * Unified binary image decoder for PNG and WebP production assets.
 */
export function decodeAndVerifyImageBuffer(
  buf: Uint8Array,
  expectedFormat?: 'png' | 'webp'
): Batch02DecodedImageInspection {
  if (!buf || buf.byteLength < 12) {
    return {
      valid: false,
      format: null,
      width: 0,
      height: 0,
      hasAlpha: false,
      error: 'IMAGE_BUFFER_TOO_SMALL: Buffer is smaller than 12 bytes.',
    };
  }
  const isPng =
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47;
  const isWebp =
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50;

  if (expectedFormat === 'png' && !isPng) {
    return {
      valid: false,
      format: null,
      width: 0,
      height: 0,
      hasAlpha: false,
      error: 'IMAGE_FORMAT_MISMATCH: Expected PNG binary signature, but file bytes are not PNG.',
    };
  }
  if (expectedFormat === 'webp' && !isWebp) {
    return {
      valid: false,
      format: null,
      width: 0,
      height: 0,
      hasAlpha: false,
      error: 'IMAGE_FORMAT_MISMATCH: Expected WebP binary signature, but file bytes are not WebP.',
    };
  }
  if (isPng) {
    return decodeAndVerifyPngBuffer(buf);
  }
  if (isWebp) {
    return decodeAndVerifyWebpBuffer(buf);
  }
  return {
    valid: false,
    format: null,
    width: 0,
    height: 0,
    hasAlpha: false,
    error: 'UNSUPPORTED_OR_CORRUPT_IMAGE_HEADER: File bytes are neither valid PNG nor valid WebP.',
  };
}

function hasUnresolvedWildcardOrTraversalPath(filePath: string | null | undefined): boolean {
  if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
    return true;
  }
  if (/\{[^}]+\}|\*/.test(filePath)) {
    return true;
  }
  if (filePath.includes('..') || filePath.includes('\\') || filePath.startsWith('/') || filePath.includes('\0')) {
    return true;
  }
  return false;
}

/**
 * Enforces strict canonical path binding (Gate B0R-B Requirement 2):
 * `entry.filePath` must equal `spec.targetFilePath` (or a controlled alias explicitly matching
 * the same canonical basename only when format is `.png` instead of `.webp`).
 */
export function isCanonicalTargetFilePathBound(
  candidateFilePath: string | null | undefined,
  spec: Batch02CanonicalDiscreteStateSpec,
  declaredFormat: string | null | undefined
): boolean {
  if (hasUnresolvedWildcardOrTraversalPath(candidateFilePath)) {
    return false;
  }
  const normalized = candidateFilePath!.trim();
  if (normalized === spec.targetFilePath) {
    return declaredFormat === 'webp';
  }
  const pngCanonicalAlias = spec.targetFilePath.replace(/\.webp$/i, '.png');
  if (normalized === pngCanonicalAlias && declaredFormat === 'png') {
    return true;
  }
  return false;
}

function isValidCandidateApprovalMetadata(
  approval: Batch02ArtDirectorApprovalRecord | null | undefined,
  sha256: string | null | undefined,
  referenceNowMs: number
): { valid: boolean; reason: string | null } {
  if (!approval || typeof approval !== 'object' || !sha256) {
    return { valid: false, reason: 'Missing artDirectorApproval object or sha256.' };
  }
  if (
    typeof approval.approvedBy !== 'string' ||
    approval.approvedBy.trim().length === 0 ||
    typeof approval.approvalId !== 'string' ||
    approval.approvalId.trim().length === 0 ||
    typeof approval.approvedAt !== 'string' ||
    approval.approvedAt.trim().length === 0 ||
    typeof approval.approvedSha256 !== 'string' ||
    approval.approvedSha256.toLowerCase() !== sha256.toLowerCase()
  ) {
    return {
      valid: false,
      reason: 'artDirectorApproval fields are incomplete or approvedSha256 does not match sha256.',
    };
  }
  const parsedTime = Date.parse(approval.approvedAt);
  if (!Number.isFinite(parsedTime)) {
    return {
      valid: false,
      reason: `artDirectorApproval.approvedAt "${approval.approvedAt}" is not a valid ISO-8601 timestamp.`,
    };
  }
  if (parsedTime > referenceNowMs + 60_000) {
    return {
      valid: false,
      reason: `FUTURE_APPROVAL_TIMESTAMP_REJECTED: artDirectorApproval.approvedAt "${approval.approvedAt}" is in the future relative to evaluation time.`,
    };
  }
  return { valid: true, reason: null };
}

function resolveCandidateRepoRoots(explicitRepoRootDir?: string): string[] {
  if (explicitRepoRootDir && explicitRepoRootDir.trim().length > 0) {
    return [path.resolve(explicitRepoRootDir)];
  }
  const roots = new Set<string>();
  roots.add(path.resolve(process.cwd()));
  try {
    if (typeof import.meta?.url === 'string' && import.meta.url.startsWith('file:')) {
      const moduleDir = path.dirname(fileURLToPath(import.meta.url));
      const normalizedModuleDir = moduleDir.replace(/\\/g, '/');
      if (normalizedModuleDir.endsWith('/src/visual-v2/batch02-gate0')) {
        roots.add(path.resolve(moduleDir, '../../..'));
      }
      roots.add(path.resolve(moduleDir));
    }
  } catch {
    // Fallback to process.cwd() if import.meta.url cannot be converted
  }
  return Array.from(roots);
}

/**
 * Gate B0R-B Physical & Layered Production Art Eligibility Evaluator.
 *
 * Implements the 5 mandatory B0R-B closeout guarantees:
 * 1. **5-Layer Permission Separation**:
 *    - `behaviorAndRequirementContractValid` (B0R-A & B0R-C frozen contracts)
 *    - `metadataReadiness` (`metadataComplete`, 0..68 structural + temporal + canonical-path checks)
 *    - `physicalArtVerification` (`physicallyVerifiedOnDisk`, real disk `stat/read`, byte SHA-256, real PNG/WebP binary decode of dimensions & RGBA alpha)
 *    - `independentArtApproval` (`authenticatedApprovalVerified`, verified against `BATCH02_INDEPENDENT_ART_APPROVAL_REGISTRY`; candidate self-attestations are NEVER trusted)
 *    - `uiReplacementAuthorization` (`READ_ONLY_READINESS_STATISTICS_HOLD_LOCKED`, `canAuthorizeBatch02UiReplacement: false`)
 * 2. **Canonical File Binding**:
 *    - Every discrete state must bind to `spec.targetFilePath` (or controlled `.png` alias), exist as a regular file on disk, match byte size & SHA-256, and decode as a non-corrupt PNG/WebP meeting `minWidth x minHeight` and `requireAlpha`.
 * 3. **Independent Approval Provenance & Read-Only Hold Lock**:
 *    - Never grants `BATCH02_UI_REPLACEMENT_AUTHORIZED` from JSON metadata or self-written `artDirectorApproval` strings.
 */
export function evaluateBatch02ProductionArtEligibility(
  entries: readonly Batch02AssetInventoryEntry[],
  options?: Batch02ProductionArtEligibilityOptions
): Batch02ProductionArtEligibilityReport {
  const referenceNowMs =
    typeof options?.referenceNowMs === 'number' && Number.isFinite(options.referenceNowMs)
      ? options.referenceNowMs
      : Date.now();
  const repoRoots = resolveCandidateRepoRoots(options?.repoRootDir);

  const metadataBlockingReasons: string[] = [];
  const physicalBlockingReasons: string[] = [];
  const approvalBlockingReasons: string[] = [];

  if (!Array.isArray(entries) || entries.length === 0) {
    metadataBlockingReasons.push(
      'EMPTY_ASSET_LEDGER: Zero asset inventory entries were supplied for Batch02 eligibility evaluation.'
    );
  }

  const safeEntries = Array.isArray(entries) ? entries : [];

  // 1. Check duplicate assetIds
  const seenAssetIds = new Set<string>();
  const duplicateAssetIds = new Set<string>();
  for (const entry of safeEntries) {
    if (!entry || typeof entry.assetId !== 'string' || entry.assetId.trim().length === 0) {
      metadataBlockingReasons.push(
        'INVALID_ENTRY_ASSET_ID: Ledger contains an entry with empty or non-string assetId.'
      );
      continue;
    }
    if (seenAssetIds.has(entry.assetId)) {
      duplicateAssetIds.add(entry.assetId);
    }
    seenAssetIds.add(entry.assetId);
  }
  if (duplicateAssetIds.size > 0) {
    metadataBlockingReasons.push(
      `DUPLICATE_ASSET_ID_ENTRIES: Duplicate assetId values detected (${Array.from(duplicateAssetIds).join(', ')}).`
    );
  }

  // 2. Check UNVERIFIED entries (must immediately fail closed)
  const unverifiedEntries = safeEntries.filter((e) => e?.status === 'UNVERIFIED');
  if (unverifiedEntries.length > 0) {
    metadataBlockingReasons.push(
      `UNVERIFIED_ASSETS_PRESENT: ${unverifiedEntries.length} asset entry(ies) have status UNVERIFIED (${unverifiedEntries
        .map((e) => e.assetId)
        .join(', ')}).`
    );
  }

  const techPreviewOnlyCount = safeEntries.filter((e) => e?.status === 'TECH_PREVIEW_ONLY').length;
  const duplicateGeometryClusterCount = safeEntries.filter(
    (e) => Array.isArray(e?.sharesIdenticalBytesWith) && e.sharesIdenticalBytesWith.length > 0
  ).length;

  // Lookup maps for canonical sets and discrete states
  const canonicalSetById = new Map<string, Batch02CanonicalAssetSetSpec>(
    BATCH02_CANONICAL_ASSET_SETS.map((s) => [s.setId, s])
  );
  const canonicalDiscreteById = new Map<string, Batch02CanonicalDiscreteStateSpec>(
    BATCH02_CANONICAL_DISCRETE_STATES.map((d) => [d.discreteAssetId, d])
  );
  const canonicalDiscreteBySetAndVariant = new Map<string, Batch02CanonicalDiscreteStateSpec>(
    BATCH02_CANONICAL_DISCRETE_STATES.map((d) => [`${d.setId}::${d.stateVariant}`, d])
  );
  const independentApprovalByStateId = new Map<string, Batch02IndependentArtApprovalEntry>(
    BATCH02_INDEPENDENT_ART_APPROVAL_REGISTRY.map((a) => [a.discreteAssetId, a])
  );

  // Track per-layer satisfaction
  const metadataReadyDiscreteStates = new Map<
    string,
    {
      sha256: string;
      filePath: string;
      sharedAssetRef?: Batch02SharedAssetRef | null;
      approvalId: string;
    }
  >();
  const physicallyVerifiedDiscreteStates = new Map<
    string,
    {
      physicalSha256: string;
      resolvedAbsPath: string;
      width: number;
      height: number;
      hasAlpha: boolean;
      sharedAssetRef?: Batch02SharedAssetRef | null;
      approvalId: string;
    }
  >();
  const approvedDiscreteStates = new Set<string>();

  const candidateAcceptedEntries = safeEntries.filter(
    (e) => e?.status === 'PRODUCTION_ART_ACCEPTED'
  );

  for (const entry of candidateAcceptedEntries) {
    const matchedDiscrete =
      canonicalDiscreteById.get(entry.assetId) ??
      (entry.setId && entry.stateVariant
        ? canonicalDiscreteBySetAndVariant.get(`${entry.setId}::${entry.stateVariant}`)
        : undefined);
    const matchedSet = canonicalSetById.get(entry.assetId);

    if (!matchedDiscrete && !matchedSet) {
      metadataBlockingReasons.push(
        `UNKNOWN_ACCEPTED_ASSET_ID: "${entry.assetId}" is not in the canonical Batch02 manifest.`
      );
      continue;
    }

    // Case A: Set-level entry with multiple discrete states must provide discreteStateDeliverables
    if (
      matchedSet &&
      matchedSet.minimumDiscreteStateVariants > 1 &&
      !matchedDiscrete
    ) {
      if (
        !Array.isArray(entry.discreteStateDeliverables) ||
        entry.discreteStateDeliverables.length < matchedSet.minimumDiscreteStateVariants
      ) {
        metadataBlockingReasons.push(
          `INCOMPLETE_DISCRETE_VARIANTS_FOR_SET: Set "${matchedSet.setId}" requires ${matchedSet.minimumDiscreteStateVariants} discrete state variants (${matchedSet.requiredStateVariants.join(
            ', '
          )}), but discreteStateDeliverables is missing or incomplete.`
        );
        continue;
      }

      for (const sub of entry.discreteStateDeliverables) {
        const subSpec = canonicalDiscreteBySetAndVariant.get(
          `${matchedSet.setId}::${sub.stateVariant}`
        );
        if (!subSpec) {
          metadataBlockingReasons.push(
            `UNKNOWN_STATE_VARIANT_FOR_SET: "${sub.stateVariant}" is not a valid state variant for set "${matchedSet.setId}".`
          );
          continue;
        }
        evaluateSingleDiscreteDeliverableLayers(
          {
            assetId: sub.discreteAssetId || subSpec.discreteAssetId,
            filePath: sub.filePath,
            existsInRepo: sub.existsInRepo,
            format: sub.format,
            pixelDimensions: sub.pixelDimensions,
            hasAlphaTransparency: sub.hasAlphaTransparency,
            byteSize: sub.byteSize,
            sha256: sub.sha256,
            status: sub.status,
            sharesIdenticalBytesWith: [],
            artDirectorApproval: sub.artDirectorApproval ?? entry.artDirectorApproval,
            sharedAssetRef: sub.sharedAssetRef ?? entry.sharedAssetRef,
          },
          subSpec,
          referenceNowMs,
          repoRoots,
          independentApprovalByStateId,
          metadataBlockingReasons,
          physicalBlockingReasons,
          approvalBlockingReasons,
          metadataReadyDiscreteStates,
          physicallyVerifiedDiscreteStates,
          approvedDiscreteStates
        );
      }
      continue;
    }

    // Case B: Direct discrete state entry (or single-state set entry)
    const targetDiscreteSpec =
      matchedDiscrete ??
      canonicalDiscreteBySetAndVariant.get(`${matchedSet!.setId}::default`)!;

    if (entry.sceneId !== targetDiscreteSpec.sceneId) {
      metadataBlockingReasons.push(
        `SCENE_ID_MISMATCH: Asset "${entry.assetId}" declared sceneId "${entry.sceneId}", expected "${targetDiscreteSpec.sceneId}".`
      );
      continue;
    }

    evaluateSingleDiscreteDeliverableLayers(
      entry,
      targetDiscreteSpec,
      referenceNowMs,
      repoRoots,
      independentApprovalByStateId,
      metadataBlockingReasons,
      physicalBlockingReasons,
      approvalBlockingReasons,
      metadataReadyDiscreteStates,
      physicallyVerifiedDiscreteStates,
      approvedDiscreteStates
    );
  }

  // 3A. Check duplicate SHA-256 across metadata-ready discrete states unless covered by approved sharedAssetRef
  const metaShaToDiscreteIds = new Map<string, string[]>();
  for (const [discreteId, meta] of metadataReadyDiscreteStates.entries()) {
    const list = metaShaToDiscreteIds.get(meta.sha256) ?? [];
    list.push(discreteId);
    metaShaToDiscreteIds.set(meta.sha256, list);
  }

  for (const [sha, discreteIds] of metaShaToDiscreteIds.entries()) {
    if (discreteIds.length <= 1) continue;
    for (const id of discreteIds) {
      const meta = metadataReadyDiscreteStates.get(id)!;
      const ref = meta.sharedAssetRef;
      const hasValidSharedRef =
        ref &&
        typeof ref.primaryAssetId === 'string' &&
        Array.isArray(ref.sharedWithAssetIds) &&
        ref.approvalId === meta.approvalId &&
        typeof ref.reason === 'string' &&
        ref.reason.trim().length > 0 &&
        discreteIds.every(
          (peerId) => peerId === ref.primaryAssetId || ref.sharedWithAssetIds.includes(peerId)
        );
      if (!hasValidSharedRef) {
        metadataBlockingReasons.push(
          `UNAPPROVED_DUPLICATE_SHA256_ACROSS_STATES: Discrete states (${discreteIds.join(
            ', '
          )}) share identical SHA-256 "${sha}" without a valid sharedAssetRef.`
        );
        for (const peerId of discreteIds) {
          metadataReadyDiscreteStates.delete(peerId);
          physicallyVerifiedDiscreteStates.delete(peerId);
          approvedDiscreteStates.delete(peerId);
        }
        break;
      }
    }
  }

  // 3B. Check duplicate physical SHA-256 across physically verified files on disk
  const physShaToDiscreteIds = new Map<string, string[]>();
  for (const [discreteId, phys] of physicallyVerifiedDiscreteStates.entries()) {
    const list = physShaToDiscreteIds.get(phys.physicalSha256) ?? [];
    list.push(discreteId);
    physShaToDiscreteIds.set(phys.physicalSha256, list);
  }
  for (const [sha, discreteIds] of physShaToDiscreteIds.entries()) {
    if (discreteIds.length <= 1) continue;
    for (const id of discreteIds) {
      const phys = physicallyVerifiedDiscreteStates.get(id)!;
      const ref = phys.sharedAssetRef;
      const hasValidSharedRef =
        ref &&
        typeof ref.primaryAssetId === 'string' &&
        Array.isArray(ref.sharedWithAssetIds) &&
        ref.approvalId === phys.approvalId &&
        typeof ref.reason === 'string' &&
        ref.reason.trim().length > 0 &&
        discreteIds.every(
          (peerId) => peerId === ref.primaryAssetId || ref.sharedWithAssetIds.includes(peerId)
        );
      if (!hasValidSharedRef) {
        physicalBlockingReasons.push(
          `PHYSICAL_UNAPPROVED_DUPLICATE_BYTES: On-disk files for (${discreteIds.join(
            ', '
          )}) have identical SHA-256 "${sha}" without a valid sharedAssetRef.`
        );
        for (const peerId of discreteIds) {
          physicallyVerifiedDiscreteStates.delete(peerId);
          approvedDiscreteStates.delete(peerId);
        }
        break;
      }
    }
  }

  // 4. Compute per-layer completeness across 68 discrete states, 22 sets, and 4 companions
  const missingMetadataDiscreteStateIds: string[] = [];
  const missingPhysicalDiscreteStateIds: string[] = [];
  const unapprovedDiscreteStateIds: string[] = [];

  for (const spec of BATCH02_CANONICAL_DISCRETE_STATES) {
    if (!metadataReadyDiscreteStates.has(spec.discreteAssetId)) {
      missingMetadataDiscreteStateIds.push(spec.discreteAssetId);
    }
    if (!physicallyVerifiedDiscreteStates.has(spec.discreteAssetId)) {
      missingPhysicalDiscreteStateIds.push(spec.discreteAssetId);
    }
    if (!approvedDiscreteStates.has(spec.discreteAssetId)) {
      unapprovedDiscreteStateIds.push(spec.discreteAssetId);
    }
  }

  const missingMetadataSetIds: string[] = [];
  const missingPhysicalSetIds: string[] = [];
  let approvedSetCount = 0;

  for (const setSpec of BATCH02_CANONICAL_ASSET_SETS) {
    const allMeta = setSpec.requiredStateVariants.every((variant) => {
      const dSpec = canonicalDiscreteBySetAndVariant.get(`${setSpec.setId}::${variant}`);
      return dSpec ? metadataReadyDiscreteStates.has(dSpec.discreteAssetId) : false;
    });
    if (!allMeta) {
      missingMetadataSetIds.push(setSpec.setId);
    }

    const allPhys = setSpec.requiredStateVariants.every((variant) => {
      const dSpec = canonicalDiscreteBySetAndVariant.get(`${setSpec.setId}::${variant}`);
      return dSpec ? physicallyVerifiedDiscreteStates.has(dSpec.discreteAssetId) : false;
    });
    if (!allPhys) {
      missingPhysicalSetIds.push(setSpec.setId);
    }

    const allApproved = setSpec.requiredStateVariants.every((variant) => {
      const dSpec = canonicalDiscreteBySetAndVariant.get(`${setSpec.setId}::${variant}`);
      return dSpec ? approvedDiscreteStates.has(dSpec.discreteAssetId) : false;
    });
    if (allApproved) {
      approvedSetCount++;
    }
  }

  const missingMetadataCompanionIds: CompanionVoiceId[] = [];
  const missingPhysicalCompanionIds: CompanionVoiceId[] = [];

  for (const companionId of DIFFICULTY_BREAKER_COMPANION_ORDER) {
    const companionStates = BATCH02_CANONICAL_DISCRETE_STATES.filter(
      (d) => d.companionId === companionId
    );
    const metaComplete =
      companionStates.length === 3 &&
      companionStates.every((d) => metadataReadyDiscreteStates.has(d.discreteAssetId));
    if (!metaComplete) {
      missingMetadataCompanionIds.push(companionId);
    }
    const physComplete =
      companionStates.length === 3 &&
      companionStates.every((d) => physicallyVerifiedDiscreteStates.has(d.discreteAssetId));
    if (!physComplete) {
      missingPhysicalCompanionIds.push(companionId);
    }
  }

  const metadataReadyDiscreteStateCount = metadataReadyDiscreteStates.size;
  const metadataReadySetCount = BATCH02_TOTAL_REQUIRED_SETS - missingMetadataSetIds.length;
  const physicallyVerifiedDiscreteStateCount = physicallyVerifiedDiscreteStates.size;
  const physicallyVerifiedSetCount = BATCH02_TOTAL_REQUIRED_SETS - missingPhysicalSetIds.length;
  const approvedDiscreteStateCount = approvedDiscreteStates.size;

  if (missingMetadataSetIds.length > 0) {
    metadataBlockingReasons.push(
      `MISSING_CANONICAL_ASSET_SETS: ${missingMetadataSetIds.length}/${BATCH02_TOTAL_REQUIRED_SETS} required production asset sets have incomplete or invalid metadata.`
    );
  }
  if (missingMetadataDiscreteStateIds.length > 0) {
    metadataBlockingReasons.push(
      `MISSING_CANONICAL_DISCRETE_STATES: ${missingMetadataDiscreteStateIds.length}/${BATCH02_TOTAL_REQUIRED_DISCRETE_STATES} required discrete state variants have incomplete or invalid metadata.`
    );
  }
  if (missingMetadataCompanionIds.length > 0) {
    metadataBlockingReasons.push(
      `MISSING_COMPANION_RIG_COVERAGE: ${missingMetadataCompanionIds.length}/4 required companions (${missingMetadataCompanionIds.join(
        ', '
      )}) lack complete 3-state metadata coverage.`
    );
  }

  if (physicallyVerifiedDiscreteStateCount < BATCH02_TOTAL_REQUIRED_DISCRETE_STATES) {
    physicalBlockingReasons.push(
      `PHYSICAL_ART_VERIFICATION_INCOMPLETE: ${physicallyVerifiedDiscreteStateCount}/${BATCH02_TOTAL_REQUIRED_DISCRETE_STATES} canonical discrete state files passed on-disk existence, SHA-256 byte verification, and real PNG/WebP binary decoding.`
    );
  }

  if (BATCH02_INDEPENDENT_ART_APPROVAL_REGISTRY.length === 0) {
    approvalBlockingReasons.push(
      'INDEPENDENT_ART_APPROVAL_REGISTRY_EMPTY_HOLD: Candidate manifest self-declarations (artDirectorApproval) are untrusted; 0/68 assets exist in BATCH02_INDEPENDENT_ART_APPROVAL_REGISTRY.'
    );
  }
  if (unapprovedDiscreteStateIds.length > 0) {
    approvalBlockingReasons.push(
      `UNAPPROVED_DISCRETE_STATES: ${unapprovedDiscreteStateIds.length}/${BATCH02_TOTAL_REQUIRED_DISCRETE_STATES} discrete states lack independent Art Director registry sign-off.`
    );
  }

  if (BATCH02_READ_ONLY_READINESS_HOLD_LOCK) {
    approvalBlockingReasons.push(
      'READ_ONLY_READINESS_HOLD_LOCK_ACTIVE: Gate B0R-B locks evaluator to read-only readiness statistics; UI replacement authorization is prohibited until real production assets are delivered and independently signed off.'
    );
  }

  const metadataComplete =
    metadataBlockingReasons.length === 0 &&
    metadataReadyDiscreteStateCount === BATCH02_TOTAL_REQUIRED_DISCRETE_STATES &&
    metadataReadySetCount === BATCH02_TOTAL_REQUIRED_SETS &&
    missingMetadataDiscreteStateIds.length === 0 &&
    missingMetadataSetIds.length === 0 &&
    missingMetadataCompanionIds.length === 0 &&
    unverifiedEntries.length === 0;

  const physicallyVerifiedOnDisk =
    metadataComplete &&
    physicalBlockingReasons.length === 0 &&
    physicallyVerifiedDiscreteStateCount === BATCH02_TOTAL_REQUIRED_DISCRETE_STATES &&
    physicallyVerifiedSetCount === BATCH02_TOTAL_REQUIRED_SETS &&
    missingPhysicalDiscreteStateIds.length === 0 &&
    missingPhysicalSetIds.length === 0 &&
    missingPhysicalCompanionIds.length === 0;

  const authenticatedApprovalVerified =
    physicallyVerifiedOnDisk &&
    !BATCH02_READ_ONLY_READINESS_HOLD_LOCK &&
    approvalBlockingReasons.length === 0 &&
    approvedDiscreteStateCount === BATCH02_TOTAL_REQUIRED_DISCRETE_STATES &&
    unapprovedDiscreteStateIds.length === 0;

  const physicallyVerifiedAndApproved =
    metadataComplete && physicallyVerifiedOnDisk && authenticatedApprovalVerified;

  // Under Gate B0R-B Read-Only Readiness Hold Lock, canAuthorizeBatch02UiReplacement is strictly false
  const canAuthorizeBatch02UiReplacement = false;

  // Fully verified discrete states require BOTH physical verification on disk AND independent approval
  const verifiedDiscreteStateCount = physicallyVerifiedAndApproved
    ? approvedDiscreteStateCount
    : 0;
  const verifiedSetCount = physicallyVerifiedAndApproved ? approvedSetCount : 0;

  const missingRequiredDiscreteStateIds = BATCH02_CANONICAL_DISCRETE_STATES.filter(
    (s) =>
      !(
        physicallyVerifiedDiscreteStates.has(s.discreteAssetId) &&
        approvedDiscreteStates.has(s.discreteAssetId)
      )
  ).map((s) => s.discreteAssetId);

  const missingRequiredSetIds = BATCH02_CANONICAL_ASSET_SETS.filter((setSpec) =>
    !setSpec.requiredStateVariants.every((variant) => {
      const dSpec = canonicalDiscreteBySetAndVariant.get(`${setSpec.setId}::${variant}`);
      return dSpec
        ? physicallyVerifiedDiscreteStates.has(dSpec.discreteAssetId) &&
            approvedDiscreteStates.has(dSpec.discreteAssetId)
        : false;
    })
  ).map((s) => s.setId);

  const missingCompanionIds: CompanionVoiceId[] = DIFFICULTY_BREAKER_COMPANION_ORDER.filter(
    (companionId) => {
      const companionStates = BATCH02_CANONICAL_DISCRETE_STATES.filter(
        (d) => d.companionId === companionId
      );
      return !(
        companionStates.length === 3 &&
        companionStates.every(
          (d) =>
            physicallyVerifiedDiscreteStates.has(d.discreteAssetId) &&
            approvedDiscreteStates.has(d.discreteAssetId)
        )
      );
    }
  );

  const blockingReasons: string[] = [
    ...metadataBlockingReasons,
    ...physicalBlockingReasons,
    ...approvalBlockingReasons,
  ];

  if (verifiedDiscreteStateCount === 0) {
    blockingReasons.push(
      'ZERO_VERIFIED_PRODUCTION_ART: 0 canonical Batch02 production assets passed combined physical file decoding and independent Art Director approval verification.'
    );
  }
  if (missingRequiredDiscreteStateIds.length > 0 && duplicateGeometryClusterCount > 0) {
    blockingReasons.push(
      `DUPLICATE_TECH_SVG_TEMPLATES: ${duplicateGeometryClusterCount} existing v2-3-layer-factory SVG files share identical byte-for-byte templates across modes/stages and are ineligible as production art.`
    );
  }
  if (missingRequiredDiscreteStateIds.length > 0 && techPreviewOnlyCount > 0) {
    blockingReasons.push(
      `LOW_RES_CUTOUTS_AND_TECH_SVGS_ONLY: ${techPreviewOnlyCount} existing assets are low-resolution grabCut cutouts or procedural SVG placeholders marked TECH_PREVIEW_ONLY.`
    );
  }

  const dynamicHoldFlags: Batch02HoldFlags = {
    ART_DIRECTOR_QA_HOLD: true,
    CONTENT_QA_REVIEW: true,
    PRODUCTION_RELEASE_HOLD: true,
    ASSET_ARTWORK_BLOCKED: !canAuthorizeBatch02UiReplacement,
    ARTWORK_GAP: !canAuthorizeBatch02UiReplacement,
    BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED: !canAuthorizeBatch02UiReplacement,
  };

  const permissionLayers: Batch02PermissionLayersReport = {
    behaviorAndRequirementContractValid: true,
    metadataReadiness: {
      metadataComplete,
      metadataReadyDiscreteStateCount,
      metadataReadySetCount,
      missingMetadataDiscreteStateIds,
      missingMetadataSetIds,
      missingMetadataCompanionIds,
      metadataBlockingReasons,
    },
    physicalArtVerification: {
      physicallyVerifiedOnDisk,
      physicallyVerifiedDiscreteStateCount,
      physicallyVerifiedSetCount,
      missingPhysicalDiscreteStateIds,
      missingPhysicalSetIds,
      missingPhysicalCompanionIds,
      physicalBlockingReasons,
    },
    independentArtApproval: {
      authenticatedApprovalVerified,
      approvedDiscreteStateCount,
      approvedSetCount,
      unapprovedDiscreteStateIds,
      approvalBlockingReasons,
    },
    uiReplacementAuthorization: {
      evaluatorMode: 'READ_ONLY_READINESS_STATISTICS_HOLD_LOCKED',
      physicallyVerifiedAndApproved,
      canAuthorizeBatch02UiReplacement: false,
    },
  };

  return {
    canAuthorizeBatch02UiReplacement,
    gateStatus: BATCH02_GATE_B0RB_DECISION_STATUS,
    holdFlags: dynamicHoldFlags,
    evaluatorMode: 'READ_ONLY_READINESS_STATISTICS_HOLD_LOCKED',
    metadataComplete,
    physicallyVerifiedOnDisk,
    authenticatedApprovalVerified,
    physicallyVerifiedAndApproved,
    metadataReadyDiscreteStateCount,
    metadataReadySetCount,
    physicallyVerifiedDiscreteStateCount,
    physicallyVerifiedSetCount,
    approvedDiscreteStateCount,
    productionAcceptedCount: verifiedDiscreteStateCount,
    verifiedDiscreteStateCount,
    requiredDiscreteStateCount: BATCH02_TOTAL_REQUIRED_DISCRETE_STATES,
    verifiedSetCount,
    requiredSetCount: BATCH02_TOTAL_REQUIRED_SETS,
    techPreviewOnlyCount,
    missingAssetCount: missingRequiredDiscreteStateIds.length,
    unverifiedAssetCount: unverifiedEntries.length,
    duplicateGeometryClusterCount,
    missingRequiredSetIds,
    missingRequiredDiscreteStateIds,
    missingCompanionIds,
    blockingReasons,
    permissionLayers,
  };
}

function evaluateSingleDiscreteDeliverableLayers(
  entry: {
    assetId: string;
    filePath: string | null;
    existsInRepo: boolean;
    format: 'png' | 'webp' | 'svg' | 'missing';
    pixelDimensions: { width: number; height: number } | null;
    hasAlphaTransparency: boolean | null;
    byteSize: number | null;
    sha256: string | null;
    status: Batch02AssetEligibilityStatus;
    sharesIdenticalBytesWith: readonly string[];
    artDirectorApproval?: Batch02ArtDirectorApprovalRecord | null;
    sharedAssetRef?: Batch02SharedAssetRef | null;
  },
  spec: Batch02CanonicalDiscreteStateSpec,
  referenceNowMs: number,
  repoRoots: readonly string[],
  independentApprovalByStateId: ReadonlyMap<string, Batch02IndependentArtApprovalEntry>,
  metadataBlockingReasons: string[],
  physicalBlockingReasons: string[],
  approvalBlockingReasons: string[],
  metadataReadyDiscreteStates: Map<
    string,
    {
      sha256: string;
      filePath: string;
      sharedAssetRef?: Batch02SharedAssetRef | null;
      approvalId: string;
    }
  >,
  physicallyVerifiedDiscreteStates: Map<
    string,
    {
      physicalSha256: string;
      resolvedAbsPath: string;
      width: number;
      height: number;
      hasAlpha: boolean;
      sharedAssetRef?: Batch02SharedAssetRef | null;
      approvalId: string;
    }
  >,
  approvedDiscreteStates: Set<string>
): void {
  const label = `${spec.discreteAssetId} (set=${spec.setId}, variant=${spec.stateVariant})`;
  let metaValid = true;

  if (entry.status !== 'PRODUCTION_ART_ACCEPTED') {
    metadataBlockingReasons.push(
      `NON_ACCEPTED_STATUS: ${label} has status "${entry.status}", expected "PRODUCTION_ART_ACCEPTED".`
    );
    return;
  }

  if (hasUnresolvedWildcardOrTraversalPath(entry.filePath)) {
    metadataBlockingReasons.push(
      `UNRESOLVED_WILDCARD_OR_TRAVERSAL_PATH: ${label} has invalid, wildcard, or traversal filePath "${String(
        entry.filePath
      )}".`
    );
    metaValid = false;
  }

  if (entry.format !== 'png' && entry.format !== 'webp') {
    metadataBlockingReasons.push(
      `INVALID_PRODUCTION_FORMAT: ${label} has format "${entry.format}"; only raster 3D renders ("png" or "webp") are eligible.`
    );
    metaValid = false;
  }

  const canonicalBound = isCanonicalTargetFilePathBound(entry.filePath, spec, entry.format);
  if (!canonicalBound) {
    metadataBlockingReasons.push(
      `NON_CANONICAL_FILE_PATH: ${label} declared filePath "${String(
        entry.filePath
      )}", which violates strict canonical binding to "${spec.targetFilePath}".`
    );
    metaValid = false;
  }

  if (entry.existsInRepo !== true) {
    metadataBlockingReasons.push(
      `ACCEPTED_ASSET_NOT_IN_REPO: ${label} claims PRODUCTION_ART_ACCEPTED but existsInRepo is false.`
    );
    metaValid = false;
  }

  if (typeof entry.byteSize !== 'number' || !Number.isFinite(entry.byteSize) || entry.byteSize <= 0) {
    metadataBlockingReasons.push(
      `INVALID_BYTE_SIZE: ${label} has invalid byteSize "${String(entry.byteSize)}".`
    );
    metaValid = false;
  }

  if (typeof entry.sha256 !== 'string' || !HEX_SHA256_REGEX.test(entry.sha256)) {
    metadataBlockingReasons.push(
      `INVALID_SHA256_DIGEST: ${label} lacks a valid 64-character hex SHA-256 digest.`
    );
    metaValid = false;
  }

  if (
    !entry.pixelDimensions ||
    typeof entry.pixelDimensions.width !== 'number' ||
    typeof entry.pixelDimensions.height !== 'number' ||
    entry.pixelDimensions.width < spec.minWidth ||
    entry.pixelDimensions.height < spec.minHeight
  ) {
    metadataBlockingReasons.push(
      `INSUFFICIENT_PIXEL_DIMENSIONS: ${label} dimensions (${
        entry.pixelDimensions
          ? `${entry.pixelDimensions.width}x${entry.pixelDimensions.height}`
          : 'null'
      }) are below minimum required ${spec.minWidth}x${spec.minHeight}.`
    );
    metaValid = false;
  }

  if (spec.requireAlpha && entry.hasAlphaTransparency !== true) {
    metadataBlockingReasons.push(
      `MISSING_REQUIRED_ALPHA_CHANNEL: ${label} requires RGBA alpha transparency (requireAlpha=true), but hasAlphaTransparency is ${String(
        entry.hasAlphaTransparency
      )}.`
    );
    metaValid = false;
  }

  const approvalCheck = isValidCandidateApprovalMetadata(
    entry.artDirectorApproval,
    entry.sha256,
    referenceNowMs
  );
  if (!approvalCheck.valid) {
    metadataBlockingReasons.push(
      `MISSING_OR_INVALID_ART_DIRECTOR_APPROVAL: ${label} failed approval metadata validation (${approvalCheck.reason}).`
    );
    metaValid = false;
  }

  if (
    Array.isArray(entry.sharesIdenticalBytesWith) &&
    entry.sharesIdenticalBytesWith.length > 0 &&
    !entry.sharedAssetRef
  ) {
    metadataBlockingReasons.push(
      `UNAPPROVED_IDENTICAL_BYTES_CLUSTER: ${label} shares identical bytes with ${entry.sharesIdenticalBytesWith.length} other file(s) without an approved sharedAssetRef.`
    );
    metaValid = false;
  }

  const normalizedSha =
    typeof entry.sha256 === 'string' ? entry.sha256.toLowerCase() : '';
  const canonicalPathToInspect = canonicalBound
    ? entry.filePath!.trim()
    : spec.targetFilePath;

  // Record Layer 2 metadata readiness only if all metadata checks passed
  if (metaValid) {
    metadataReadyDiscreteStates.set(spec.discreteAssetId, {
      sha256: normalizedSha,
      filePath: canonicalPathToInspect,
      sharedAssetRef: entry.sharedAssetRef,
      approvalId: entry.artDirectorApproval!.approvalId,
    });
  }

  // Layer 3: Always perform physical disk inspection against the canonical target path
  let resolvedFile: string | null = null;
  for (const rootDir of repoRoots) {
    const candidateAbs = path.resolve(rootDir, canonicalPathToInspect);
    const relativeToRoot = path.relative(rootDir, candidateAbs);
    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
      continue;
    }
    try {
      const st = fs.statSync(candidateAbs);
      if (st.isFile()) {
        resolvedFile = candidateAbs;
        break;
      }
    } catch {
      // Not found in this candidate root
    }
  }

  if (!resolvedFile) {
    physicalBlockingReasons.push(
      `PHYSICAL_FILE_MISSING_ON_DISK: ${label} canonical file "${canonicalPathToInspect}" does not exist on disk (caller claimed existsInRepo=${String(
        entry.existsInRepo
      )}).`
    );
    return;
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = fs.readFileSync(resolvedFile);
  } catch (err) {
    physicalBlockingReasons.push(
      `PHYSICAL_FILE_READ_ERROR: ${label} failed reading "${canonicalPathToInspect}" (${
        err instanceof Error ? err.message : String(err)
      }).`
    );
    return;
  }

  let physValid = true;

  if (typeof entry.byteSize === 'number' && fileBuffer.byteLength !== entry.byteSize) {
    physicalBlockingReasons.push(
      `PHYSICAL_BYTESIZE_MISMATCH: ${label} actual file byteLength (${fileBuffer.byteLength}) !== declared byteSize (${entry.byteSize}).`
    );
    physValid = false;
  }

  const actualSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex').toLowerCase();
  if (normalizedSha && actualSha256 !== normalizedSha) {
    physicalBlockingReasons.push(
      `PHYSICAL_SHA256_MISMATCH: ${label} actual file SHA-256 (${actualSha256}) !== declared sha256 (${normalizedSha}).`
    );
    physValid = false;
  }

  const expectedImgFormat =
    entry.format === 'png' || entry.format === 'webp' ? entry.format : undefined;
  const decoded = decodeAndVerifyImageBuffer(fileBuffer, expectedImgFormat);
  if (!decoded.valid) {
    physicalBlockingReasons.push(
      `CORRUPT_IMAGE_BINARY: ${label} physical file "${canonicalPathToInspect}" failed binary image decode (${decoded.error}).`
    );
    return;
  }

  if (decoded.width < spec.minWidth || decoded.height < spec.minHeight) {
    physicalBlockingReasons.push(
      `PHYSICAL_DIMENSIONS_BELOW_MIN: ${label} decoded physical dimensions (${decoded.width}x${decoded.height}) are below required minimum ${spec.minWidth}x${spec.minHeight}.`
    );
    physValid = false;
  }

  if (
    entry.pixelDimensions &&
    (decoded.width !== entry.pixelDimensions.width ||
      decoded.height !== entry.pixelDimensions.height)
  ) {
    physicalBlockingReasons.push(
      `PHYSICAL_DIMENSIONS_MISMATCH_WITH_METADATA: ${label} decoded physical dimensions (${decoded.width}x${decoded.height}) !== declared pixelDimensions (${entry.pixelDimensions.width}x${entry.pixelDimensions.height}).`
    );
    physValid = false;
  }

  if (spec.requireAlpha && !decoded.hasAlpha) {
    physicalBlockingReasons.push(
      `PHYSICAL_MISSING_REQUIRED_ALPHA: ${label} decoded physical image lacks required RGBA alpha transparency channel.`
    );
    physValid = false;
  }

  if (!metaValid || !physValid) {
    return;
  }

  // Layer 3 passed: Record physical verification
  physicallyVerifiedDiscreteStates.set(spec.discreteAssetId, {
    physicalSha256: actualSha256,
    resolvedAbsPath: resolvedFile,
    width: decoded.width,
    height: decoded.height,
    hasAlpha: decoded.hasAlpha,
    sharedAssetRef: entry.sharedAssetRef,
    approvalId: entry.artDirectorApproval!.approvalId,
  });

  // Layer 4: Independent Art Director Approval Registry Provenance Verification
  const registeredApproval = independentApprovalByStateId.get(spec.discreteAssetId);
  if (
    !registeredApproval ||
    registeredApproval.canonicalFilePath !== canonicalPathToInspect ||
    registeredApproval.verifiedPhysicalSha256.toLowerCase() !== actualSha256 ||
    registeredApproval.setId !== spec.setId ||
    registeredApproval.stateVariant !== spec.stateVariant ||
    registeredApproval.gateVersion !== 'A-LAND_V2.3_BATCH02'
  ) {
    approvalBlockingReasons.push(
      `CANDIDATE_SELF_ATTESTATION_NOT_TRUSTED: ${label} (sha256=${actualSha256.slice(
        0,
        12
      )}...) is not present in BATCH02_INDEPENDENT_ART_APPROVAL_REGISTRY; candidate manifest self-approval "${
        entry.artDirectorApproval!.approvalId
      }" by "${entry.artDirectorApproval!.approvedBy}" cannot authorize UI replacement.`
    );
    return;
  }

  approvedDiscreteStates.add(spec.discreteAssetId);
}

