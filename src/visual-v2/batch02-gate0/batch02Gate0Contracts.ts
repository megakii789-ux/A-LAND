/**
 * A-LAND V2.3 Batch02 · Gate 0 / Gate B0R — Executable Behavior, Asset & Fail-Closed Eligibility Contracts
 *
 * Scope:
 * - Target Modules: ThoughtDetectiveLabModal («想法侦探社») & DifficultyBreakerModal («困难拆解台»)
 * - Gate 0 / B0R Boundary: Read-only behavior discovery, production artwork gap inventory (22 sets / 68 discrete states),
 *   hardened fail-closed production art eligibility evaluator, and V2 scene adapter interface contracts ONLY.
 * - Does NOT modify ThoughtDetectiveLabModal.tsx, DifficultyBreakerModal.tsx, Batch01R, or any frozen domain/voice/audit module.
 * - Self-contained module (zero relative runtime imports) so it can be executed directly under `node --experimental-strip-types`.
 * - Fail-Closed Stop Condition: BATCH02_GATE0R_CONTRACT_PASS / ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED
 */

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

export const BATCH02_GATE0_BASELINE = {
  frozenBranch: 'ui/visual-v2-batch01r-u3r-final',
  frozenArchiveHeadSha: 'd0b497acade40bd4bbd2cc9f16e9550df2b19504',
  frozenCanonicalCodeSha: '6a5ae8d186850ac6ddb30823bf9c87134c10c320',
  gate0InventoryBranch: 'ui/visual-v2-batch02-gate0-inventory',
  gate0InventoryArchiveHeadSha: 'a6a1f843fd9955539912bfd1b30cc46a399a9ed8',
  gate0InventoryCanonicalCodeSha: '25a09c7a23bda842cf8327d12f4e3df4df4b1597',
  gateB0RBranch: 'ui/visual-v2-batch02-gate0r-contract',
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
// 4. Gate B0R-B Fail-Closed Production Art Eligibility Evaluator
// ============================================================================

export interface Batch02ProductionArtEligibilityReport {
  canAuthorizeBatch02UiReplacement: boolean;
  gateStatus: typeof BATCH02_GATE0_EXECUTION_STATUS | 'BATCH02_UI_REPLACEMENT_AUTHORIZED';
  holdFlags: Batch02HoldFlags;
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
}

const HEX_SHA256_REGEX = /^[a-f0-9]{64}$/i;

function hasUnresolvedWildcardPath(filePath: string | null | undefined): boolean {
  if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
    return true;
  }
  return /\{[^}]+\}|\*/.test(filePath);
}

function isValidArtDirectorApproval(
  approval: Batch02ArtDirectorApprovalRecord | null | undefined,
  sha256: string | null | undefined
): boolean {
  if (!approval || typeof approval !== 'object' || !sha256) return false;
  return (
    typeof approval.approvedBy === 'string' &&
    approval.approvedBy.trim().length > 0 &&
    typeof approval.approvalId === 'string' &&
    approval.approvalId.trim().length > 0 &&
    typeof approval.approvedAt === 'string' &&
    approval.approvedAt.trim().length > 0 &&
    typeof approval.approvedSha256 === 'string' &&
    approval.approvedSha256.toLowerCase() === sha256.toLowerCase()
  );
}

/**
 * Hardened Fail-Closed Production Art Eligibility Evaluator (Gate B0R-B / Fix P1-02).
 *
 * Never trusts caller-supplied `status === 'PRODUCTION_ART_ACCEPTED'` alone:
 * - Rejects empty ledgers, duplicate `assetId`s, and any `UNVERIFIED` entry.
 * - Verifies every `PRODUCTION_ART_ACCEPTED` candidate against `BATCH02_CANONICAL_ASSET_SETS` (22 sets)
 *   and `BATCH02_CANONICAL_DISCRETE_STATES` (68 discrete states across `thought_detective`, `difficulty_breaker`,
 *   and all 4 companions in `shared_companion_rig`).
 * - Enforces concrete `filePath` (no `{companionId}` wildcard), `existsInRepo === true`, `png|webp` format,
 *   positive `byteSize`, valid 64-hex `sha256`, `pixelDimensions >= minWidth x minHeight`, `hasAlphaTransparency`
 *   when required, and a cryptographic `artDirectorApproval` record matching `sha256`.
 * - Rejects duplicate `sha256` or `sharesIdenticalBytesWith` across accepted production assets unless explicitly
 *   authorized by a matching `sharedAssetRef` with `approvalId === artDirectorApproval.approvalId`.
 * - Dynamically derives `holdFlags.ARTWORK_GAP`, `holdFlags.ASSET_ARTWORK_BLOCKED`, and
 *   `holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED` from `!canAuthorizeBatch02UiReplacement`.
 */
export function evaluateBatch02ProductionArtEligibility(
  entries: readonly Batch02AssetInventoryEntry[]
): Batch02ProductionArtEligibilityReport {
  const blockingReasons: string[] = [];

  if (!Array.isArray(entries) || entries.length === 0) {
    blockingReasons.push(
      'EMPTY_ASSET_LEDGER: Zero asset inventory entries were supplied for Batch02 eligibility evaluation.'
    );
  }

  const safeEntries = Array.isArray(entries) ? entries : [];

  // 1. Check duplicate assetIds
  const seenAssetIds = new Set<string>();
  const duplicateAssetIds = new Set<string>();
  for (const entry of safeEntries) {
    if (!entry || typeof entry.assetId !== 'string' || entry.assetId.trim().length === 0) {
      blockingReasons.push('INVALID_ENTRY_ASSET_ID: Ledger contains an entry with empty or non-string assetId.');
      continue;
    }
    if (seenAssetIds.has(entry.assetId)) {
      duplicateAssetIds.add(entry.assetId);
    }
    seenAssetIds.add(entry.assetId);
  }
  if (duplicateAssetIds.size > 0) {
    blockingReasons.push(
      `DUPLICATE_ASSET_ID_ENTRIES: Duplicate assetId values detected (${Array.from(duplicateAssetIds).join(', ')}).`
    );
  }

  // 2. Check UNVERIFIED entries (must immediately fail closed)
  const unverifiedEntries = safeEntries.filter((e) => e?.status === 'UNVERIFIED');
  if (unverifiedEntries.length > 0) {
    blockingReasons.push(
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

  // Track which canonical discrete state IDs are genuinely satisfied
  const verifiedDiscreteStates = new Map<
    string,
    { sha256: string; sharedAssetRef?: Batch02SharedAssetRef | null; approvalId: string }
  >();

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
      blockingReasons.push(
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
        blockingReasons.push(
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
          blockingReasons.push(
            `UNKNOWN_STATE_VARIANT_FOR_SET: "${sub.stateVariant}" is not a valid state variant for set "${matchedSet.setId}".`
          );
          continue;
        }
        validateSingleDiscreteDeliverable(
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
          blockingReasons,
          verifiedDiscreteStates
        );
      }
      continue;
    }

    // Case B: Direct discrete state entry (or single-state set entry)
    const targetDiscreteSpec =
      matchedDiscrete ??
      canonicalDiscreteBySetAndVariant.get(`${matchedSet!.setId}::default`)!;

    if (entry.sceneId !== targetDiscreteSpec.sceneId) {
      blockingReasons.push(
        `SCENE_ID_MISMATCH: Asset "${entry.assetId}" declared sceneId "${entry.sceneId}", expected "${targetDiscreteSpec.sceneId}".`
      );
      continue;
    }

    validateSingleDiscreteDeliverable(
      entry,
      targetDiscreteSpec,
      blockingReasons,
      verifiedDiscreteStates
    );
  }

  // 3. Check duplicate SHA-256 across verified discrete states unless covered by approved sharedAssetRef
  const shaToDiscreteIds = new Map<string, string[]>();
  for (const [discreteId, meta] of verifiedDiscreteStates.entries()) {
    const list = shaToDiscreteIds.get(meta.sha256) ?? [];
    list.push(discreteId);
    shaToDiscreteIds.set(meta.sha256, list);
  }

  for (const [sha, discreteIds] of shaToDiscreteIds.entries()) {
    if (discreteIds.length <= 1) continue;
    for (const id of discreteIds) {
      const meta = verifiedDiscreteStates.get(id)!;
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
        blockingReasons.push(
          `UNAPPROVED_DUPLICATE_SHA256_ACROSS_STATES: Discrete states (${discreteIds.join(
            ', '
          )}) share identical SHA-256 "${sha}" without a valid Art-Director-approved sharedAssetRef.`
        );
        for (const peerId of discreteIds) {
          verifiedDiscreteStates.delete(peerId);
        }
        break;
      }
    }
  }

  // 4. Verify completeness of all 68 canonical discrete states & all 22 canonical sets & all 4 companions
  const missingRequiredDiscreteStateIds: string[] = [];
  for (const spec of BATCH02_CANONICAL_DISCRETE_STATES) {
    if (!verifiedDiscreteStates.has(spec.discreteAssetId)) {
      missingRequiredDiscreteStateIds.push(spec.discreteAssetId);
    }
  }

  const missingRequiredSetIds: string[] = [];
  for (const setSpec of BATCH02_CANONICAL_ASSET_SETS) {
    const allStatesVerified = setSpec.requiredStateVariants.every((variant) => {
      const dSpec = canonicalDiscreteBySetAndVariant.get(`${setSpec.setId}::${variant}`);
      return dSpec ? verifiedDiscreteStates.has(dSpec.discreteAssetId) : false;
    });
    if (!allStatesVerified) {
      missingRequiredSetIds.push(setSpec.setId);
    }
  }

  const missingCompanionIds: CompanionVoiceId[] = [];
  for (const companionId of DIFFICULTY_BREAKER_COMPANION_ORDER) {
    const companionStates = BATCH02_CANONICAL_DISCRETE_STATES.filter(
      (d) => d.companionId === companionId
    );
    const companionComplete =
      companionStates.length === 3 &&
      companionStates.every((d) => verifiedDiscreteStates.has(d.discreteAssetId));
    if (!companionComplete) {
      missingCompanionIds.push(companionId);
    }
  }

  const verifiedDiscreteStateCount = verifiedDiscreteStates.size;
  const verifiedSetCount = BATCH02_TOTAL_REQUIRED_SETS - missingRequiredSetIds.length;

  if (verifiedDiscreteStateCount === 0) {
    blockingReasons.push(
      'ZERO_VERIFIED_PRODUCTION_ART: 0 canonical Batch02 production assets passed physical, dimension, alpha, SHA-256, and Art Director approval verification.'
    );
  }
  if (missingRequiredSetIds.length > 0) {
    blockingReasons.push(
      `MISSING_CANONICAL_ASSET_SETS: ${missingRequiredSetIds.length}/${BATCH02_TOTAL_REQUIRED_SETS} required production asset sets are incomplete or missing.`
    );
  }
  if (missingRequiredDiscreteStateIds.length > 0) {
    blockingReasons.push(
      `MISSING_CANONICAL_DISCRETE_STATES: ${missingRequiredDiscreteStateIds.length}/${BATCH02_TOTAL_REQUIRED_DISCRETE_STATES} required discrete state variants are incomplete or missing.`
    );
  }
  if (missingCompanionIds.length > 0) {
    blockingReasons.push(
      `MISSING_COMPANION_RIG_COVERAGE: ${missingCompanionIds.length}/4 required companions (${missingCompanionIds.join(
        ', '
      )}) lack complete high-resolution 3D rig states (idle, listening, speaking).`
    );
  }

  // Include forensic reasons for current repo tech-preview SVGs & cutouts when production sets are still missing
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

  const canAuthorizeBatch02UiReplacement =
    blockingReasons.length === 0 &&
    verifiedDiscreteStateCount === BATCH02_TOTAL_REQUIRED_DISCRETE_STATES &&
    verifiedSetCount === BATCH02_TOTAL_REQUIRED_SETS &&
    missingRequiredDiscreteStateIds.length === 0 &&
    missingRequiredSetIds.length === 0 &&
    missingCompanionIds.length === 0 &&
    unverifiedEntries.length === 0;

  const dynamicHoldFlags: Batch02HoldFlags = {
    ART_DIRECTOR_QA_HOLD: true,
    CONTENT_QA_REVIEW: true,
    PRODUCTION_RELEASE_HOLD: true,
    ASSET_ARTWORK_BLOCKED: !canAuthorizeBatch02UiReplacement,
    ARTWORK_GAP: !canAuthorizeBatch02UiReplacement,
    BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED: !canAuthorizeBatch02UiReplacement,
  };

  return {
    canAuthorizeBatch02UiReplacement,
    gateStatus: canAuthorizeBatch02UiReplacement
      ? 'BATCH02_UI_REPLACEMENT_AUTHORIZED'
      : BATCH02_GATE0_EXECUTION_STATUS,
    holdFlags: dynamicHoldFlags,
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
  };
}

function validateSingleDiscreteDeliverable(
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
  blockingReasons: string[],
  verifiedDiscreteStates: Map<
    string,
    { sha256: string; sharedAssetRef?: Batch02SharedAssetRef | null; approvalId: string }
  >
): void {
  const label = `${spec.discreteAssetId} (set=${spec.setId}, variant=${spec.stateVariant})`;

  if (entry.status !== 'PRODUCTION_ART_ACCEPTED') {
    blockingReasons.push(
      `NON_ACCEPTED_STATUS: ${label} has status "${entry.status}", expected "PRODUCTION_ART_ACCEPTED".`
    );
    return;
  }

  if (hasUnresolvedWildcardPath(entry.filePath)) {
    blockingReasons.push(
      `UNRESOLVED_WILDCARD_OR_EMPTY_PATH: ${label} has invalid or wildcard filePath "${String(
        entry.filePath
      )}".`
    );
    return;
  }

  if (entry.existsInRepo !== true) {
    blockingReasons.push(
      `ACCEPTED_ASSET_NOT_IN_REPO: ${label} claims PRODUCTION_ART_ACCEPTED but existsInRepo is false.`
    );
    return;
  }

  if (entry.format !== 'png' && entry.format !== 'webp') {
    blockingReasons.push(
      `INVALID_PRODUCTION_FORMAT: ${label} has format "${entry.format}"; only raster 3D renders ("png" or "webp") are eligible.`
    );
    return;
  }

  if (typeof entry.byteSize !== 'number' || !Number.isFinite(entry.byteSize) || entry.byteSize <= 0) {
    blockingReasons.push(
      `INVALID_BYTE_SIZE: ${label} has invalid byteSize "${String(entry.byteSize)}".`
    );
    return;
  }

  if (typeof entry.sha256 !== 'string' || !HEX_SHA256_REGEX.test(entry.sha256)) {
    blockingReasons.push(
      `INVALID_SHA256_DIGEST: ${label} lacks a valid 64-character hex SHA-256 digest.`
    );
    return;
  }

  if (
    !entry.pixelDimensions ||
    typeof entry.pixelDimensions.width !== 'number' ||
    typeof entry.pixelDimensions.height !== 'number' ||
    entry.pixelDimensions.width < spec.minWidth ||
    entry.pixelDimensions.height < spec.minHeight
  ) {
    blockingReasons.push(
      `INSUFFICIENT_PIXEL_DIMENSIONS: ${label} dimensions (${
        entry.pixelDimensions
          ? `${entry.pixelDimensions.width}x${entry.pixelDimensions.height}`
          : 'null'
      }) are below minimum required ${spec.minWidth}x${spec.minHeight}.`
    );
    return;
  }

  if (spec.requireAlpha && entry.hasAlphaTransparency !== true) {
    blockingReasons.push(
      `MISSING_REQUIRED_ALPHA_CHANNEL: ${label} requires RGBA alpha transparency (requireAlpha=true), but hasAlphaTransparency is ${String(
        entry.hasAlphaTransparency
      )}.`
    );
    return;
  }

  if (!isValidArtDirectorApproval(entry.artDirectorApproval, entry.sha256)) {
    blockingReasons.push(
      `MISSING_OR_INVALID_ART_DIRECTOR_APPROVAL: ${label} lacks a valid Art Director sign-off matching its SHA-256.`
    );
    return;
  }

  if (
    Array.isArray(entry.sharesIdenticalBytesWith) &&
    entry.sharesIdenticalBytesWith.length > 0 &&
    !entry.sharedAssetRef
  ) {
    blockingReasons.push(
      `UNAPPROVED_IDENTICAL_BYTES_CLUSTER: ${label} shares identical bytes with ${entry.sharesIdenticalBytesWith.length} other file(s) without an approved sharedAssetRef.`
    );
    return;
  }

  verifiedDiscreteStates.set(spec.discreteAssetId, {
    sha256: entry.sha256.toLowerCase(),
    sharedAssetRef: entry.sharedAssetRef,
    approvalId: entry.artDirectorApproval!.approvalId,
  });
}
