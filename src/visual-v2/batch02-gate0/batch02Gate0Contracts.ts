/**
 * A-LAND V2.3 Batch02 · Gate 0 — Executable Behavior, Asset & Eligibility Contracts
 *
 * Scope:
 * - Target Modules: ThoughtDetectiveLabModal («想法侦探社») & DifficultyBreakerModal («困难拆解台»)
 * - Gate 0 Boundary: Read-only behavior discovery, production artwork gap inventory, and proposed V2
 *   scene adapter interface contracts ONLY.
 * - Does NOT modify ThoughtDetectiveLabModal.tsx, DifficultyBreakerModal.tsx, or any frozen domain/voice/audit module.
 * - Fail-Closed Stop Condition: ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED
 */

import type { CompanionVoiceId, EmotionProsodyTone, VoiceProfileType } from '../../utils/speech';

export const BATCH02_GATE0_EXECUTION_STATUS =
  'ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED' as const;

export const BATCH02_GATE0_BASELINE = {
  frozenBranch: 'ui/visual-v2-batch01r-u3r-final',
  frozenArchiveHeadSha: 'd0b497acade40bd4bbd2cc9f16e9550df2b19504',
  frozenCanonicalCodeSha: '6a5ae8d186850ac6ddb30823bf9c87134c10c320',
  gate0InventoryBranch: 'ui/visual-v2-batch02-gate0-inventory',
} as const;

export const BATCH02_GATE0_HOLD_FLAGS = {
  ART_DIRECTOR_QA_HOLD: true,
  ASSET_ARTWORK_BLOCKED: true,
  CONTENT_QA_REVIEW: true,
  PRODUCTION_RELEASE_HOLD: true,
  ARTWORK_GAP: true,
  BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED: true,
} as const;

export const BATCH02_MIN_TOUCH_TARGET_PX = 56 as const;

export const BATCH02_REQUIRED_VIEWPORTS = [
  { id: 'mobile_360x800', width: 360, height: 800, orientation: 'portrait', aspectTier: 'mobile_3_4' },
  { id: 'mobile_390x844', width: 390, height: 844, orientation: 'portrait', aspectTier: 'mobile_3_4' },
  { id: 'mobile_430x932', width: 430, height: 932, orientation: 'portrait', aspectTier: 'mobile_3_4' },
  { id: 'tablet_768x1024', width: 768, height: 1024, orientation: 'portrait', aspectTier: 'tablet_adaptive' },
  { id: 'tablet_1024x768', width: 1024, height: 768, orientation: 'landscape', aspectTier: 'desktop_16_9' },
  { id: 'desktop_1440x900', width: 1440, height: 900, orientation: 'landscape', aspectTier: 'desktop_16_9' },
] as const;

export type Batch02AssetEligibilityStatus =
  | 'PRODUCTION_ART_ACCEPTED'
  | 'TECH_PREVIEW_ONLY'
  | 'MISSING'
  | 'UNVERIFIED';

export interface Batch02AssetInventoryEntry {
  assetId: string;
  sceneId: 'thought_detective' | 'difficulty_breaker' | 'shared_companion_rig' | 'reference_board';
  role: string;
  filePath: string | null;
  existsInRepo: boolean;
  format: 'png' | 'webp' | 'svg' | 'missing';
  pixelDimensions: { width: number; height: number } | null;
  hasAlphaTransparency: boolean | null;
  alphaZeroRatio: number | null;
  byteSize: number | null;
  sha256: string | null;
  provenance: string;
  sharesIdenticalBytesWith: readonly string[];
  status: Batch02AssetEligibilityStatus;
  gapReason: string;
}

// ============================================================================
// 1. ThoughtDetectiveLabModal («想法侦探社») Real Behavior & Proposed V2 Contract
// ============================================================================

export type ThoughtDetectiveTabId = 'tools' | 'threeBoxes' | 'circles' | 'fourSteps';
export type ThoughtDetectiveToolId = 'flag' | 'lenses' | 'coin' | 'scale' | 'fence';
export type ThoughtDetectiveLensId = 'my' | 'his' | 'sky';
export type ThoughtDetectiveCoinSide = 'front' | 'back';
export type ThoughtDetectiveBoxCategory = 'visible' | 'heart' | 'guess';
export type ThoughtDetectiveCircleCategory = 'adult' | 'mine' | 'together';
export type ThoughtDetectiveStepNumber = 1 | 2 | 3 | 4;

export interface ThoughtDetectiveBoxItemState {
  id: string;
  text: string;
  correctBox: ThoughtDetectiveBoxCategory;
  sorted: ThoughtDetectiveBoxCategory | null;
}

export interface ThoughtDetectiveCircleItemState {
  id: string;
  text: string;
  correctCircle: ThoughtDetectiveCircleCategory;
  sorted: ThoughtDetectiveCircleCategory | null;
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
  onSortBoxItem: (itemId: string, targetBox: ThoughtDetectiveBoxCategory) => void;
  onSortCircleItem: (itemId: string, targetCircle: ThoughtDetectiveCircleCategory) => void;
  onSelectStep: (step: ThoughtDetectiveStepNumber) => void;
  onOpenBreaker: () => void;
  onOpenCrayonGame: () => void;
  onOpenTransferLab: () => void;
  onSpeak: (text: string) => void;
  forceEnableQaForTest?: boolean;
}

// ============================================================================
// 2. DifficultyBreakerModal («困难拆解台») Real Behavior & Proposed V2 Contract
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
 * in `DifficultyBreakerModal` clears all stale progression (`resetBreakerScenarioProgressToFen`).
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
// 3. Gate B0-B / B0-C Fail-Closed Production Art Eligibility Evaluator
// ============================================================================

export interface Batch02ProductionArtEligibilityReport {
  canAuthorizeBatch02UiReplacement: boolean;
  gateStatus: typeof BATCH02_GATE0_EXECUTION_STATUS | 'BATCH02_UI_REPLACEMENT_AUTHORIZED';
  holdFlags: typeof BATCH02_GATE0_HOLD_FLAGS;
  productionAcceptedCount: number;
  techPreviewOnlyCount: number;
  missingAssetCount: number;
  duplicateGeometryClusterCount: number;
  blockingReasons: readonly string[];
}

export function evaluateBatch02ProductionArtEligibility(
  entries: readonly Batch02AssetInventoryEntry[]
): Batch02ProductionArtEligibilityReport {
  const productionAcceptedCount = entries.filter(
    (e) =>
      (e.sceneId === 'thought_detective' || e.sceneId === 'difficulty_breaker') &&
      e.status === 'PRODUCTION_ART_ACCEPTED'
  ).length;
  const techPreviewOnlyCount = entries.filter(
    (e) => e.status === 'TECH_PREVIEW_ONLY'
  ).length;
  const missingAssetCount = entries.filter(
    (e) => e.status === 'MISSING'
  ).length;
  const duplicateGeometryClusterCount = entries.filter(
    (e) => e.sharesIdenticalBytesWith.length > 0
  ).length;

  const blockingReasons: string[] = [];

  if (productionAcceptedCount === 0) {
    blockingReasons.push(
      'ZERO_PRODUCTION_ART_ACCEPTED: 0 production-approved 3D assets exist for ThoughtDetectiveLab or DifficultyBreaker.'
    );
  }
  if (missingAssetCount > 0) {
    blockingReasons.push(
      `MISSING_PRODUCTION_ASSETS: ${missingAssetCount} required high-resolution 3D scene plates, layered depth elements, and interactive prop states are missing.`
    );
  }
  if (duplicateGeometryClusterCount > 0) {
    blockingReasons.push(
      `DUPLICATE_TECH_SVG_TEMPLATES: ${duplicateGeometryClusterCount} existing v2-3-layer-factory SVG files share identical byte-for-byte templates across modes/stages and are ineligible as production art.`
    );
  }
  if (techPreviewOnlyCount > 0) {
    blockingReasons.push(
      `LOW_RES_CUTOUTS_AND_TECH_SVGS_ONLY: ${techPreviewOnlyCount} existing assets are low-resolution grabCut cutouts (68×64 to 191×151 px) or procedural SVG placeholders marked TECH_PREVIEW_ONLY.`
    );
  }

  const canAuthorizeBatch02UiReplacement =
    blockingReasons.length === 0 &&
    productionAcceptedCount > 0 &&
    missingAssetCount === 0 &&
    duplicateGeometryClusterCount === 0;

  return {
    canAuthorizeBatch02UiReplacement,
    gateStatus: canAuthorizeBatch02UiReplacement
      ? 'BATCH02_UI_REPLACEMENT_AUTHORIZED'
      : BATCH02_GATE0_EXECUTION_STATUS,
    holdFlags: BATCH02_GATE0_HOLD_FLAGS,
    productionAcceptedCount,
    techPreviewOnlyCount,
    missingAssetCount,
    duplicateGeometryClusterCount,
    blockingReasons,
  };
}
