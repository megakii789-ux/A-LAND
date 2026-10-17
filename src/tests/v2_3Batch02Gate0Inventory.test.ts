import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  BATCH02_GATE0_BASELINE,
  BATCH02_GATE0_EXECUTION_STATUS,
  BATCH02_GATE0_HOLD_FLAGS,
  BATCH02_MIN_TOUCH_TARGET_PX,
  BATCH02_REQUIRED_VIEWPORTS,
  DIFFICULTY_BREAKER_COMPANION_ORDER,
  DIFFICULTY_BREAKER_PRESETS,
  DIFFICULTY_BREAKER_STAGES,
  DIFFICULTY_BREAKER_TRANSITION_SUBBRANCHES,
  THOUGHT_DETECTIVE_BOX_CATEGORIES,
  THOUGHT_DETECTIVE_CIRCLE_CATEGORIES,
  THOUGHT_DETECTIVE_LENSES,
  THOUGHT_DETECTIVE_MODES,
  THOUGHT_DETECTIVE_TOOLS,
  evaluateBatch02ProductionArtEligibility,
  isBreakerProgressionCleanlyResetToFen,
  simulateBreakerScenarioSwitchReset,
  type Batch02AssetInventoryEntry,
  type BreakerProgressionSnapshot,
} from '../visual-v2/batch02-gate0/batch02Gate0Contracts';
import { ContentAuditRegistry } from '../domain/cognitive/ContentAuditRegistry';

const ROOT_DIR = process.cwd();
const BEHAVIOR_MAP_PATH = path.join(
  ROOT_DIR,
  'docs/v2-3-batch02-gate0-inventory/BATCH02_BEHAVIOR_INTERFACE_MAP.json'
);
const ARTWORK_LEDGER_PATH = path.join(
  ROOT_DIR,
  'docs/v2-3-batch02-gate0-inventory/BATCH02_ARTWORK_GAP_LEDGER.json'
);

describe('A-LAND V2.3 Batch02 · Gate 0 Inventory & Fail-Closed Art Preflight', () => {
  it('G0-01: locks frozen baseline SHAs and retains all mandatory hold flags', () => {
    expect(BATCH02_GATE0_BASELINE.frozenBranch).toBe('ui/visual-v2-batch01r-u3r-final');
    expect(BATCH02_GATE0_BASELINE.frozenArchiveHeadSha).toBe(
      'd0b497acade40bd4bbd2cc9f16e9550df2b19504'
    );
    expect(BATCH02_GATE0_BASELINE.frozenCanonicalCodeSha).toBe(
      '6a5ae8d186850ac6ddb30823bf9c87134c10c320'
    );
    expect(BATCH02_GATE0_EXECUTION_STATUS).toBe(
      'ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED'
    );
    expect(BATCH02_GATE0_HOLD_FLAGS).toEqual({
      ART_DIRECTOR_QA_HOLD: true,
      ASSET_ARTWORK_BLOCKED: true,
      CONTENT_QA_REVIEW: true,
      PRODUCTION_RELEASE_HOLD: true,
      ARTWORK_GAP: true,
      BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED: true,
    });
  });

  it('G0-02: defines complete ThoughtDetectiveLab and DifficultyBreaker mode/stage/tool contracts and 6 viewports', () => {
    expect(THOUGHT_DETECTIVE_MODES).toEqual(['tools', 'threeBoxes', 'circles', 'fourSteps']);
    expect(THOUGHT_DETECTIVE_TOOLS).toEqual(['flag', 'lenses', 'coin', 'scale', 'fence']);
    expect(THOUGHT_DETECTIVE_LENSES).toEqual(['my', 'his', 'sky']);
    expect(THOUGHT_DETECTIVE_BOX_CATEGORIES).toEqual(['visible', 'heart', 'guess']);
    expect(THOUGHT_DETECTIVE_CIRCLE_CATEGORIES).toEqual(['adult', 'mine', 'together']);

    expect(DIFFICULTY_BREAKER_STAGES).toEqual(['pick', 'fen', 'tong', 'ze', 'complete']);
    expect(DIFFICULTY_BREAKER_PRESETS).toEqual([
      'diff-two-homes',
      'diff-blocks-broken',
      'diff-friend-ask',
    ]);
    expect(DIFFICULTY_BREAKER_TRANSITION_SUBBRANCHES).toEqual([
      'sub_dual_attachment',
      'sub_loyalty_conflict',
      'sub_specific_concern',
      'sub_ordinary_transition',
    ]);
    expect(DIFFICULTY_BREAKER_COMPANION_ORDER).toEqual([
      'guoguo_squirrel',
      'beibei_otter',
      'tiantian_raccoon',
      'qiqi_deer',
    ]);
    expect(BATCH02_MIN_TOUCH_TARGET_PX).toBe(56);
    expect(BATCH02_REQUIRED_VIEWPORTS).toHaveLength(6);
  });

  it('G0-03: proves DifficultyBreaker preset and transition-subbranch switching clears stale progression back to fen', () => {
    const dirtyProgression: BreakerProgressionSnapshot = {
      currentStep: 'ze',
      selectedPresetId: 'diff-two-homes',
      transitionSubId: 'sub_dual_attachment',
      fenRevealed: { fact: true, feeling: true, guess: true },
      isCoinFlipped: true,
      steppingStones: [
        { id: 'act-1', text: '带上小熊玩偶', badge: '过渡小物' },
        { id: 'act-2', text: '跟妈妈抱一下', badge: '安心连接' },
        null,
      ],
      pausedVoluntarily: true,
    };

    expect(isBreakerProgressionCleanlyResetToFen(dirtyProgression)).toBe(false);

    const afterSubbranchSwitch = simulateBreakerScenarioSwitchReset(
      dirtyProgression,
      'diff-two-homes',
      'sub_specific_concern'
    );
    expect(isBreakerProgressionCleanlyResetToFen(afterSubbranchSwitch)).toBe(true);
    expect(afterSubbranchSwitch.transitionSubId).toBe('sub_specific_concern');

    const afterPresetSwitch = simulateBreakerScenarioSwitchReset(
      dirtyProgression,
      'diff-blocks-broken'
    );
    expect(isBreakerProgressionCleanlyResetToFen(afterPresetSwitch)).toBe(true);
    expect(afterPresetSwitch.selectedPresetId).toBe('diff-blocks-broken');
  });

  it('G0-04: verifies live source files match BATCH02_BEHAVIOR_INTERFACE_MAP.json and ContentAuditRegistry fail-closed gates remain intact', () => {
    expect(fs.existsSync(BEHAVIOR_MAP_PATH)).toBe(true);
    const mapJson = JSON.parse(fs.readFileSync(BEHAVIOR_MAP_PATH, 'utf8'));
    expect(mapJson.gateId).toBe('A-LAND_V2.3_BATCH02_GATE0_B0_A');
    expect(mapJson.modules.thought_detective_lab.componentName).toBe('ThoughtDetectiveLabModal');
    expect(mapJson.modules.difficulty_breaker.componentName).toBe('DifficultyBreakerModal');
    expect(
      mapJson.modules.difficulty_breaker.staleProgressionResetProof.clearedStateFields.currentStep
    ).toBe("'fen'");

    // ContentAuditRegistry fail-closed check for Batch02 & sub-modals
    const detectiveRecord = ContentAuditRegistry.getAuditRecord('thought-detective-lab');
    const breakerRecord = ContentAuditRegistry.getAuditRecord('difficulty-breaker');
    const crayonRecord = ContentAuditRegistry.getAuditRecord('game_crayon_detective');
    expect(detectiveRecord?.auditStatus).toBe('PENDING');
    expect(breakerRecord?.auditStatus).toBe('PENDING');
    expect(crayonRecord?.auditStatus).toBe('PENDING');
    expect(ContentAuditRegistry.canRenderContent('thought-detective-lab')).toBe(false);
    expect(ContentAuditRegistry.canRenderContent('difficulty-breaker')).toBe(false);
    expect(ContentAuditRegistry.canRenderContent('game_crayon_detective')).toBe(false);
  });

  it('G0-05: verifies BATCH02_ARTWORK_GAP_LEDGER.json and fail-closed evaluateBatch02ProductionArtEligibility report ARTWORK_GAP', () => {
    expect(fs.existsSync(ARTWORK_LEDGER_PATH)).toBe(true);
    const ledger = JSON.parse(fs.readFileSync(ARTWORK_LEDGER_PATH, 'utf8'));
    expect(ledger.overallDecision).toBe('ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED');
    expect(ledger.summaryCounts.productionArtAcceptedCount).toBe(0);
    expect(ledger.summaryCounts.missingCount).toBeGreaterThanOrEqual(22);
    expect(ledger.summaryCounts.duplicateByteForByteSvgEntriesCount).toBe(27);

    const report = evaluateBatch02ProductionArtEligibility(
      ledger.entries as Batch02AssetInventoryEntry[]
    );
    expect(report.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(report.gateStatus).toBe('ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED');
    expect(report.productionAcceptedCount).toBe(0);
    expect(report.missingAssetCount).toBe(ledger.summaryCounts.missingCount);
    expect(report.duplicateGeometryClusterCount).toBe(27);
    expect(report.blockingReasons.length).toBeGreaterThanOrEqual(4);
  });
});
