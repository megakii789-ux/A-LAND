import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  BATCH02_CANONICAL_ASSET_SETS,
  BATCH02_CANONICAL_DISCRETE_STATES,
  BATCH02_GATE0_BASELINE,
  BATCH02_GATE0_EXECUTION_STATUS,
  BATCH02_GATE0_HOLD_FLAGS,
  BATCH02_GATE_B0R_DECISION_STATUS,
  BATCH02_MIN_TOUCH_TARGET_PX,
  BATCH02_OPTIONAL_ADDITIONAL_VIEWPORTS,
  BATCH02_REQUIRED_VIEWPORTS,
  BATCH02_STAGE_COMPOSITION_RULE,
  BATCH02_TOTAL_REQUIRED_DISCRETE_STATES,
  BATCH02_TOTAL_REQUIRED_SETS,
  DIFFICULTY_BREAKER_COMPANION_ORDER,
  DIFFICULTY_BREAKER_PRESETS,
  DIFFICULTY_BREAKER_STAGES,
  DIFFICULTY_BREAKER_TRANSITION_SUBBRANCHES,
  DIFFICULTY_BREAKER_VOICE_SYNC_CONTRACT,
  THOUGHT_DETECTIVE_BOX_CATEGORIES,
  THOUGHT_DETECTIVE_CIRCLE_CATEGORIES,
  THOUGHT_DETECTIVE_INITIAL_BOX_ITEMS,
  THOUGHT_DETECTIVE_INITIAL_CIRCLE_ITEMS,
  THOUGHT_DETECTIVE_INITIAL_STEP,
  THOUGHT_DETECTIVE_LENSES,
  THOUGHT_DETECTIVE_MODES,
  THOUGHT_DETECTIVE_TOOLS,
  evaluateBatch02ProductionArtEligibility,
  isBreakerProgressionCleanlyResetToFen,
  isValidThoughtDetectiveBoxItemState,
  isValidThoughtDetectiveCircleItemState,
  projectThoughtDetectivePlacementToReadOnlyView,
  simulateBreakerScenarioSwitchReset,
  simulateThoughtDetectivePlaceBox,
  simulateThoughtDetectivePlaceCircle,
  validateThoughtDetectiveStateContract,
  type Batch02AssetInventoryEntry,
  type BreakerProgressionSnapshot,
} from '../visual-v2/batch02-gate0/batch02Gate0Contracts';
import { ContentAuditRegistry } from '../domain/cognitive/ContentAuditRegistry';
import { AppProvider } from '../context/AppContext';
import { ThoughtDetectiveLabModal } from '../components/ChildIsland/ThoughtDetectiveLab/ThoughtDetectiveLabModal';
import { DifficultyBreakerModal } from '../components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal';
import { speechNarrator } from '../utils/speech';
import { resetPersonalizationProfile } from '../domain/personalization';

const ROOT_DIR = process.cwd();
const BEHAVIOR_MAP_PATH = path.join(
  ROOT_DIR,
  'docs/v2-3-batch02-gate0-inventory/BATCH02_BEHAVIOR_INTERFACE_MAP.json'
);
const ARTWORK_LEDGER_PATH = path.join(
  ROOT_DIR,
  'docs/v2-3-batch02-gate0-inventory/BATCH02_ARTWORK_GAP_LEDGER.json'
);
const DISCRETE_MANIFEST_PATH = path.join(
  ROOT_DIR,
  'docs/v2-3-batch02-gate0-inventory/BATCH02_DISCRETE_ASSET_PRODUCTION_MANIFEST.json'
);

interface HookCell {
  tag: 'state' | 'ref' | 'memo' | 'callback' | 'effect';
  value?: any;
  deps?: ReadonlyArray<any>;
  cleanup?: (() => void) | void;
}

interface ComponentInstance {
  compName: string;
  hooks: HookCell[];
  hookIndex: number;
}

function areDepsEqual(
  prev: ReadonlyArray<any> | undefined,
  next: ReadonlyArray<any> | undefined
): boolean {
  if (!prev || !next) return false;
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i++) {
    if (!Object.is(prev[i], next[i])) return false;
  }
  return true;
}

function createStatefulTestRenderer(initialElement: React.ReactElement) {
  const rootElement = initialElement;
  const instances = new Map<string, ComponentInstance>();
  const pendingEffects: Array<() => void> = [];
  const contextStack: Array<{ context: any; value: any }> = [];
  let latestTree: any = null;

  const reactInternals =
    (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
    (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

  function readContext(context: any) {
    for (let i = contextStack.length - 1; i >= 0; i--) {
      if (contextStack[i].context === context) {
        return contextStack[i].value;
      }
    }
    return context._currentValue;
  }

  function createDispatcher(instance: ComponentInstance) {
    return {
      useState(initialState: any) {
        const idx = instance.hookIndex++;
        if (idx >= instance.hooks.length) {
          const initial = typeof initialState === 'function' ? initialState() : initialState;
          instance.hooks.push({ tag: 'state', value: initial });
        }
        const cell = instance.hooks[idx];
        const setState = (updater: any) => {
          const next = typeof updater === 'function' ? updater(cell.value) : updater;
          if (!Object.is(cell.value, next)) {
            cell.value = next;
          }
        };
        return [cell.value, setState];
      },
      useRef(initialValue: any) {
        const idx = instance.hookIndex++;
        if (idx >= instance.hooks.length) {
          instance.hooks.push({ tag: 'ref', value: { current: initialValue } });
        }
        return instance.hooks[idx].value;
      },
      useMemo(factory: () => any, deps?: ReadonlyArray<any>) {
        const idx = instance.hookIndex++;
        if (idx >= instance.hooks.length) {
          const value = factory();
          instance.hooks.push({ tag: 'memo', value, deps });
          return value;
        }
        const cell = instance.hooks[idx];
        if (!areDepsEqual(cell.deps, deps)) {
          cell.value = factory();
          cell.deps = deps;
        }
        return cell.value;
      },
      useCallback(callback: any, deps?: ReadonlyArray<any>) {
        const idx = instance.hookIndex++;
        if (idx >= instance.hooks.length) {
          instance.hooks.push({ tag: 'callback', value: callback, deps });
          return callback;
        }
        const cell = instance.hooks[idx];
        if (!areDepsEqual(cell.deps, deps)) {
          cell.value = callback;
          cell.deps = deps;
        }
        return cell.value;
      },
      useEffect(create: () => (() => void) | void, deps?: ReadonlyArray<any>) {
        const idx = instance.hookIndex++;
        if (idx >= instance.hooks.length) {
          const cell: HookCell = { tag: 'effect', deps };
          instance.hooks.push(cell);
          pendingEffects.push(() => {
            cell.cleanup = create();
          });
          return;
        }
        const cell = instance.hooks[idx];
        if (!areDepsEqual(cell.deps, deps)) {
          cell.deps = deps;
          pendingEffects.push(() => {
            if (typeof cell.cleanup === 'function') {
              cell.cleanup();
            }
            cell.cleanup = create();
          });
        }
      },
      useContext(context: any) {
        return readContext(context);
      },
    };
  }

  function renderNode(node: any, p: string): any {
    if (node === null || node === undefined || typeof node === 'boolean') return null;
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) {
      return node.map((child, i) => renderNode(child, `${p}.${i}`)).filter((x) => x !== null);
    }
    if (!React.isValidElement(node)) return null;

    const element = node as React.ReactElement<any>;
    const type = element.type as any;

    if (type === React.Fragment) {
      return renderNode(element.props.children, `${p}.f`);
    }

    if (typeof type === 'object' && type !== null) {
      if ('_context' in type || '$$typeof' in type) {
        const ctx = type._context || type;
        if ('value' in element.props) {
          contextStack.push({ context: ctx, value: element.props.value });
          const rendered = renderNode(element.props.children, `${p}.ctx`);
          contextStack.pop();
          return rendered;
        }
      }
    }

    if (typeof type === 'function') {
      const compName = type.displayName || type.name || 'Anon';
      const instanceKey = `${p}:${compName}${element.key != null ? `:${element.key}` : ''}`;
      let inst = instances.get(instanceKey);
      if (!inst) {
        inst = { compName, hooks: [], hookIndex: 0 };
        instances.set(instanceKey, inst);
      }
      inst.hookIndex = 0;

      const prevDispatcher = reactInternals.H;
      reactInternals.H = createDispatcher(inst);
      let renderedChild: any;
      try {
        renderedChild = type(element.props);
      } finally {
        reactInternals.H = prevDispatcher;
      }
      return renderNode(renderedChild, instanceKey);
    }

    if (typeof type === 'string') {
      const children = renderNode(element.props.children, `${p}.${type}`);
      const flatChildren = Array.isArray(children)
        ? children.flat(Infinity).filter((x) => x !== null)
        : children !== null
          ? [children]
          : [];
      const textContent = flatChildren
        .map((c) => (typeof c === 'string' ? c : c?.text || ''))
        .join('');
      return {
        type,
        props: element.props || {},
        children: flatChildren,
        text: textContent,
      };
    }

    return null;
  }

  function flush() {
    for (let pass = 0; pass < 4; pass++) {
      latestTree = renderNode(rootElement, 'root');
      if (pendingEffects.length === 0) break;
      const toRun = pendingEffects.splice(0, pendingEffects.length);
      for (const fn of toRun) {
        fn();
      }
    }
    latestTree = renderNode(rootElement, 'root');
  }

  function findAll(predicate: (node: any) => boolean, node: any = latestTree): any[] {
    if (!node) return [];
    if (Array.isArray(node)) {
      return node.flatMap((n) => findAll(predicate, n));
    }
    if (typeof node !== 'object') return [];
    const matches: any[] = [];
    if (predicate(node)) matches.push(node);
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        matches.push(...findAll(predicate, child));
      }
    }
    return matches;
  }

  function findByTestId(testId: string) {
    return findAll((n) => n.props && n.props['data-testid'] === testId)[0] || null;
  }

  function click(target: any) {
    if (!target || !target.props || typeof target.props.onClick !== 'function') {
      throw new Error('Target is not clickable');
    }
    target.props.onClick({
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    flush();
  }

  function getComponentStates(compName: string): any[] {
    for (const inst of instances.values()) {
      if (inst.compName === compName) {
        return inst.hooks.filter((h) => h.tag === 'state').map((h) => h.value);
      }
    }
    return [];
  }

  function unmount() {
    for (const inst of instances.values()) {
      for (const h of inst.hooks) {
        if (h.tag === 'effect' && typeof h.cleanup === 'function') {
          h.cleanup();
        }
      }
    }
    instances.clear();
  }

  flush();

  return {
    get tree() {
      return latestTree;
    },
    findAll,
    findByTestId,
    click,
    getComponentStates,
    unmount,
  };
}

function createSyntheticValidCompleteManifest(): Batch02AssetInventoryEntry[] {
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
      provenance: 'Art Director Signed Production 3D Render',
      sharesIdenticalBytesWith: [],
      status: 'PRODUCTION_ART_ACCEPTED',
      gapReason: '',
      artDirectorApproval: {
        approvedBy: 'Art Director Lead',
        approvalId: `AD-BATCH02-SIGN-${String(idx + 1).padStart(3, '0')}`,
        approvedSha256: sha256,
        approvedAt: '2026-10-18T10:00:00+08:00',
        version: '2.3.0',
      },
    };
  });
}

describe('A-LAND V2.3 Batch02 · Gate 0 / Gate B0R Contract & Fail-Closed Art Preflight', () => {
  beforeEach(() => {
    const localStore = new Map<string, string>();
    const sessionStore = new Map<string, string>();
    const storageMock = {
      getItem: (k: string) => localStore.get(k) ?? null,
      setItem: (k: string, v: string) => localStore.set(k, String(v)),
      removeItem: (k: string) => localStore.delete(k),
      clear: () => localStore.clear(),
    };
    const sessionMock = {
      getItem: (k: string) => sessionStore.get(k) ?? null,
      setItem: (k: string, v: string) => sessionStore.set(k, String(v)),
      removeItem: (k: string) => sessionStore.delete(k),
      clear: () => sessionStore.clear(),
    };
    Object.defineProperty(globalThis, 'localStorage', { value: storageMock, configurable: true });
    Object.defineProperty(globalThis, 'sessionStorage', { value: sessionMock, configurable: true });
    resetPersonalizationProfile();
  });

  it('B0R-01: locks frozen baseline SHAs, Gate B0R decision status, and mandatory hold flags', () => {
    expect(BATCH02_GATE0_BASELINE.frozenBranch).toBe('ui/visual-v2-batch01r-u3r-final');
    expect(BATCH02_GATE0_BASELINE.frozenArchiveHeadSha).toBe(
      'd0b497acade40bd4bbd2cc9f16e9550df2b19504'
    );
    expect(BATCH02_GATE0_BASELINE.frozenCanonicalCodeSha).toBe(
      '6a5ae8d186850ac6ddb30823bf9c87134c10c320'
    );
    expect(BATCH02_GATE0_BASELINE.gate0InventoryArchiveHeadSha).toBe(
      'a6a1f843fd9955539912bfd1b30cc46a399a9ed8'
    );
    expect(BATCH02_GATE0_EXECUTION_STATUS).toBe(
      'ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED'
    );
    expect(BATCH02_GATE_B0R_DECISION_STATUS).toBe(
      'BATCH02_GATE0R_CONTRACT_PASS / ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED'
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

  it('B0R-02: locks the frozen 6-viewport matrix (including 1024x1366) and aspect-ratio-preserving mobile stage rule', () => {
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

    // P2-02: Frozen 6 viewports MUST include 1024x1366; 1024x768 is optional additional
    expect(BATCH02_REQUIRED_VIEWPORTS).toHaveLength(6);
    expect(
      BATCH02_REQUIRED_VIEWPORTS.map((v) => `${v.width}x${v.height}`)
    ).toEqual([
      '360x800',
      '390x844',
      '430x932',
      '768x1024',
      '1024x1366',
      '1440x900',
    ]);
    expect(
      BATCH02_OPTIONAL_ADDITIONAL_VIEWPORTS.map((v) => `${v.width}x${v.height}`)
    ).toEqual(['1024x768']);
    expect(BATCH02_STAGE_COMPOSITION_RULE.forbidDestructiveObjectCoverCropOnMobile).toBe(true);
    expect(BATCH02_STAGE_COMPOSITION_RULE.mobilePortraitAspect).toBe('3:4');
  });

  it('B0R-03 (P1-01): mounts real ThoughtDetectiveLabModal and verifies { id, text, target, placed } state, initial step=1, exploratory placement, and rejection of fabricated correctBox/sorted schemas', () => {
    const renderer = createStatefulTestRenderer(
      React.createElement(
        AppProvider,
        null,
        React.createElement(ThoughtDetectiveLabModal, {
          isOpen: true,
          onClose: () => {},
        })
      )
    );

    const states = renderer.getComponentStates('ThoughtDetectiveLabModal');
    // Hook order in ThoughtDetectiveLabModal.tsx (lines 38-75):
    // 0: activeTab ('tools')
    // 1: isBreakerOpen (false)
    // 2: isCrayonGameOpen (false)
    // 3: isTransferLabOpen (false)
    // 4: activeTool ('flag')
    // 5: personFlagRemoved (false)
    // 6: currentLens ('my')
    // 7: coinSide ('front')
    // 8: boxItems
    // 9: circleItems
    // 10: currentStep (1)
    expect(states[0]).toBe('tools');
    expect(states[1]).toBe(false);
    expect(states[2]).toBe(false);
    expect(states[3]).toBe(false);
    expect(states[4]).toBe('flag');
    expect(states[5]).toBe(false);
    expect(states[6]).toBe('my');
    expect(states[7]).toBe('front');
    expect(states[8]).toEqual(THOUGHT_DETECTIVE_INITIAL_BOX_ITEMS);
    expect(states[9]).toEqual(THOUGHT_DETECTIVE_INITIAL_CIRCLE_ITEMS);
    expect(states[10]).toBe(1);
    expect(THOUGHT_DETECTIVE_INITIAL_STEP).toBe(1);

    // Validate live component state against contract validator
    const liveValidation = validateThoughtDetectiveStateContract({
      boxItems: states[8],
      circleItems: states[9],
      currentStep: states[10],
    });
    expect(liveValidation.valid).toBe(true);
    expect(liveValidation.errors).toEqual([]);

    // Switch to Three Boxes tab and click a placement button on item '3' (target='guess', place into 'visible' then 'guess')
    const threeBoxesTabBtn = renderer.findAll(
      (n) => n.type === 'button' && n.props && n.props['aria-label'] === '三个分类盒子'
    )[0];
    expect(threeBoxesTabBtn).toBeTruthy();
    renderer.click(threeBoxesTabBtn);

    const placeIntoVisibleButtons = renderer.findAll(
      (n) => n.type === 'button' && typeof n.text === 'string' && n.text.trim() === '看得见'
    );
    expect(placeIntoVisibleButtons).toHaveLength(5);
    renderer.click(placeIntoVisibleButtons[2]); // Places item '3' (index 2) into 'visible' unconditionally

    const updatedBoxItemsAfterFirstPlace = renderer.getComponentStates('ThoughtDetectiveLabModal')[8];
    const item3First = updatedBoxItemsAfterFirstPlace.find((i: any) => i.id === '3');
    expect(item3First.target).toBe('guess');
    expect(item3First.placed).toBe('visible'); // Proves no correctness gating blocks placement

    // Now move item '3' into 'guess'
    const placeIntoGuessButtons = renderer.findAll(
      (n) => n.type === 'button' && typeof n.text === 'string' && n.text.trim() === '猜的'
    );
    expect(placeIntoGuessButtons).toHaveLength(5);
    renderer.click(placeIntoGuessButtons[2]);
    const updatedBoxItemsAfterSecondPlace = renderer.getComponentStates('ThoughtDetectiveLabModal')[8];
    const item3Second = updatedBoxItemsAfterSecondPlace.find((i: any) => i.id === '3');
    expect(item3Second.placed).toBe('guess');

    // Verify pure simulation helpers match live component behavior
    const simulatedBoxes = simulateThoughtDetectivePlaceBox(
      THOUGHT_DETECTIVE_INITIAL_BOX_ITEMS,
      '3',
      'visible'
    );
    expect(simulatedBoxes.find((i) => i.id === '3')?.placed).toBe('visible');
    const simulatedCircles = simulateThoughtDetectivePlaceCircle(
      THOUGHT_DETECTIVE_INITIAL_CIRCLE_ITEMS,
      'c3',
      'mine'
    );
    expect(simulatedCircles.find((i) => i.id === 'c3')?.placed).toBe('mine');

    // Verify optional read-only view projector preserves separation from source state
    const readOnlyView = projectThoughtDetectivePlacementToReadOnlyView(simulatedBoxes);
    expect(readOnlyView[0].isPlaced).toBe(true);
    expect(readOnlyView[0].matchesReferenceTarget).toBe(true);
    expect(readOnlyView[2].currentPlacedCategory).toBe('visible');
    expect(readOnlyView[2].matchesReferenceTarget).toBe(false);

    // Explicitly verify that fabricated { correctBox, sorted } and { correctCircle, sorted } schemas FAIL validation
    const wrongBoxItem = {
      id: '1',
      text: '桌上的牛奶打翻了，地板湿了',
      correctBox: 'visible',
      sorted: null,
    };
    const wrongCircleItem = {
      id: 'c1',
      text: '大人分开住在不同房子里',
      correctCircle: 'adult',
      sorted: null,
    };
    expect(isValidThoughtDetectiveBoxItemState(wrongBoxItem)).toBe(false);
    expect(isValidThoughtDetectiveCircleItemState(wrongCircleItem)).toBe(false);

    const wrongStateValidation = validateThoughtDetectiveStateContract({
      boxItems: [wrongBoxItem, wrongBoxItem, wrongBoxItem, wrongBoxItem, wrongBoxItem],
      circleItems: [
        wrongCircleItem,
        wrongCircleItem,
        wrongCircleItem,
        wrongCircleItem,
        wrongCircleItem,
      ],
      currentStep: 1,
    });
    expect(wrongStateValidation.valid).toBe(false);
    expect(wrongStateValidation.errors.length).toBeGreaterThanOrEqual(2);

    renderer.unmount();
  });

  it('B0R-04 (P1-01): mounts real DifficultyBreakerModal and verifies speechNarrator.subscribe, inline switchCompanion, and stale progression reset to fen', () => {
    const renderer = createStatefulTestRenderer(
      React.createElement(
        AppProvider,
        null,
        React.createElement(DifficultyBreakerModal, {
          isOpen: true,
          onClose: () => {},
        })
      )
    );

    expect(DIFFICULTY_BREAKER_VOICE_SYNC_CONTRACT.subscriptionMethod).toBe(
      'speechNarrator.subscribe'
    );
    expect(DIFFICULTY_BREAKER_VOICE_SYNC_CONTRACT.speaksGreetingOnInlineSwitch).toBe(false);

    // Switch companion inline via real button
    const otterCompanionBtn = renderer.findByTestId('breaker-companion-switch-beibei_otter');
    expect(otterCompanionBtn).toBeTruthy();
    renderer.click(otterCompanionBtn);
    expect(speechNarrator.getNarrationSession().companionId).toBe('beibei_otter');

    // Pick diff-two-homes preset to enter 'fen'
    const pickTwoHomesBtn = renderer.findByTestId('breaker-pick-diff-two-homes');
    expect(pickTwoHomesBtn).toBeTruthy();
    renderer.click(pickTwoHomesBtn);

    // Reveal 'fact' crystal in 'fen'
    const fenFactBtn = renderer.findByTestId('breaker-fen-fact');
    expect(fenFactBtn).toBeTruthy();
    renderer.click(fenFactBtn);

    // Advance to 'tong' and flip lens
    renderer.click(renderer.findByTestId('breaker-next-to-tong'));
    renderer.click(renderer.findByTestId('breaker-flip-lens-btn'));

    // Advance to 'ze', place an action stone, and click voluntary pause
    renderer.click(renderer.findByTestId('breaker-next-to-ze'));
    const actionBtns = renderer.findAll(
      (n) =>
        n.props &&
        typeof n.props['data-testid'] === 'string' &&
        n.props['data-testid'].startsWith('breaker-action-')
    );
    expect(actionBtns.length).toBeGreaterThan(0);
    renderer.click(actionBtns[0]);
    renderer.click(renderer.findByTestId('breaker-pause-btn'));

    // Now switch transition subbranch inline via step tab -> fen -> subbranch button, or verify reset on subbranch switch
    const stepFenTab = renderer.findByTestId('breaker-step-tab-fen');
    renderer.click(stepFenTab);
    const subSpecificBtn = renderer.findByTestId('breaker-sub-sub_specific_concern');
    expect(subSpecificBtn).toBeTruthy();
    renderer.click(subSpecificBtn);

    // Hook order in DifficultyBreakerModal.tsx (lines 440-468):
    // 0: selectedPresetId
    // 1: transitionSubId
    // 2: currentStep
    // 3: fenRevealed
    // 4: isCoinFlipped
    // 5: steppingStones
    // 6: pausedVoluntarily
    const breakerStates = renderer.getComponentStates('DifficultyBreakerModal');
    const liveSnapshot: BreakerProgressionSnapshot = {
      currentStep: breakerStates[2],
      selectedPresetId: breakerStates[0],
      transitionSubId: breakerStates[1],
      fenRevealed: breakerStates[3],
      isCoinFlipped: breakerStates[4],
      steppingStones: breakerStates[5],
      pausedVoluntarily: breakerStates[6],
    };
    expect(liveSnapshot.transitionSubId).toBe('sub_specific_concern');
    expect(isBreakerProgressionCleanlyResetToFen(liveSnapshot)).toBe(true);

    // Also verify pure helper
    const afterPresetSwitch = simulateBreakerScenarioSwitchReset(
      {
        ...liveSnapshot,
        currentStep: 'ze',
        fenRevealed: { fact: true, feeling: true, guess: true },
        isCoinFlipped: true,
        steppingStones: [{ id: 'a1', text: 'test', badge: 'test' }, null, null],
        pausedVoluntarily: true,
      },
      'diff-blocks-broken'
    );
    expect(isBreakerProgressionCleanlyResetToFen(afterPresetSwitch)).toBe(true);
    expect(afterPresetSwitch.selectedPresetId).toBe('diff-blocks-broken');

    renderer.unmount();
  });

  it('B0R-05: verifies live source files match BATCH02_BEHAVIOR_INTERFACE_MAP.json and ContentAuditRegistry fail-closed gates remain intact', () => {
    expect(fs.existsSync(BEHAVIOR_MAP_PATH)).toBe(true);
    const mapJson = JSON.parse(fs.readFileSync(BEHAVIOR_MAP_PATH, 'utf8'));
    expect(mapJson.gateId).toBe('A-LAND_V2.3_BATCH02_GATE_B0R_A');
    expect(mapJson.modules.thought_detective_lab.componentName).toBe('ThoughtDetectiveLabModal');
    expect(mapJson.modules.difficulty_breaker.componentName).toBe('DifficultyBreakerModal');

    // Verify source SHA-256 parity between disk and BATCH02_BEHAVIOR_INTERFACE_MAP.json
    for (const fileEntry of mapJson.inspectedSourceFiles) {
      const diskBuf = fs.readFileSync(path.join(ROOT_DIR, fileEntry.filePath));
      const actualSha = crypto.createHash('sha256').update(diskBuf).digest('hex');
      expect(fileEntry.sha256).toBe(actualSha);
      expect(fileEntry.bytes).toBe(diskBuf.length);
    }

    // ContentAuditRegistry fail-closed check for Batch02 & sub-modals
    expect(ContentAuditRegistry.getAuditRecord('thought-detective-lab')?.auditStatus).toBe('PENDING');
    expect(ContentAuditRegistry.getAuditRecord('difficulty-breaker')?.auditStatus).toBe('PENDING');
    expect(ContentAuditRegistry.getAuditRecord('game_crayon_detective')?.auditStatus).toBe('PENDING');
    expect(ContentAuditRegistry.canRenderContent('thought-detective-lab')).toBe(false);
    expect(ContentAuditRegistry.canRenderContent('difficulty-breaker')).toBe(false);
    expect(ContentAuditRegistry.canRenderContent('game_crayon_detective')).toBe(false);
  });

  it('B0R-06 (P2-01): verifies 22 canonical asset sets expand to 68 discrete state variants with zero unresolved wildcards and explicit Art Production owner mapping', () => {
    expect(BATCH02_CANONICAL_ASSET_SETS).toHaveLength(BATCH02_TOTAL_REQUIRED_SETS);
    expect(BATCH02_CANONICAL_DISCRETE_STATES).toHaveLength(
      BATCH02_TOTAL_REQUIRED_DISCRETE_STATES
    );
    expect(BATCH02_TOTAL_REQUIRED_SETS).toBe(22);
    expect(BATCH02_TOTAL_REQUIRED_DISCRETE_STATES).toBe(68);

    // Every discrete state targetFilePath must be concrete (zero {companionId} wildcards)
    for (const dSpec of BATCH02_CANONICAL_DISCRETE_STATES) {
      expect(dSpec.targetFilePath).not.toContain('{');
      expect(dSpec.targetFilePath).not.toContain('}');
      expect(dSpec.waitingOwner).toBe('Art Production / Art Director');
      expect(dSpec.approvalAuthority).toBe('Art Director');
    }

    expect(fs.existsSync(DISCRETE_MANIFEST_PATH)).toBe(true);
    const discreteManifest = JSON.parse(fs.readFileSync(DISCRETE_MANIFEST_PATH, 'utf8'));
    expect(discreteManifest.totals.canonicalAssetSets).toBe(22);
    expect(discreteManifest.totals.canonicalDiscreteStates).toBe(68);
    expect(discreteManifest.totals.thoughtDetectiveDiscreteStates).toBe(30);
    expect(discreteManifest.totals.difficultyBreakerDiscreteStates).toBe(26);
    expect(discreteManifest.totals.sharedCompanionRigDiscreteStates).toBe(12);
    expect(discreteManifest.totals.missingCount).toBe(68);
  });

  it('B0R-07 (P1-02): defeats all 3 independent auditor counterexamples and all negative/positive eligibility cases without contradictory holdFlags', () => {
    expect(fs.existsSync(ARTWORK_LEDGER_PATH)).toBe(true);
    const ledger = JSON.parse(fs.readFileSync(ARTWORK_LEDGER_PATH, 'utf8'));

    // 1. Current repo 73-row ledger -> FAIL-CLOSED
    const repoReport = evaluateBatch02ProductionArtEligibility(
      ledger.entries as Batch02AssetInventoryEntry[]
    );
    expect(repoReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(repoReport.gateStatus).toBe('ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED');
    expect(repoReport.holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED).toBe(true);
    expect(repoReport.holdFlags.ARTWORK_GAP).toBe(true);
    expect(repoReport.missingRequiredSetIds).toHaveLength(22);
    expect(repoReport.missingRequiredDiscreteStateIds).toHaveLength(68);

    // 2. Empty ledger [] -> FAIL-CLOSED
    const emptyReport = evaluateBatch02ProductionArtEligibility([]);
    expect(emptyReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(
      emptyReport.blockingReasons.some((r) => r.startsWith('EMPTY_ASSET_LEDGER'))
    ).toBe(true);

    // 3. Auditor Counterexample 1: 1 fake PRODUCTION_ART_ACCEPTED row with null filePath/hash/dimensions
    const auditorFixture: Batch02AssetInventoryEntry = {
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
    const ce1 = evaluateBatch02ProductionArtEligibility([auditorFixture]);
    expect(ce1.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(ce1.holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED).toBe(true);

    // 4. Auditor Counterexample 2: 1 fake accepted row + 1 UNVERIFIED row
    const ce2 = evaluateBatch02ProductionArtEligibility([
      auditorFixture,
      {
        ...auditorFixture,
        assetId: 'fixture_unknown_breaker',
        sceneId: 'difficulty_breaker',
        status: 'UNVERIFIED',
      },
    ]);
    expect(ce2.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(
      ce2.blockingReasons.some((r) => r.startsWith('UNVERIFIED_ASSETS_PRESENT'))
    ).toBe(true);

    // 5. Auditor Counterexample 3: 2 fake accepted rows across scenes with null files/hashes
    const ce3 = evaluateBatch02ProductionArtEligibility([
      auditorFixture,
      {
        ...auditorFixture,
        assetId: 'fixture_breaker',
        sceneId: 'difficulty_breaker',
      },
    ]);
    expect(ce3.canAuthorizeBatch02UiReplacement).toBe(false);

    // 6. Missing 1 required discrete state (67/68) -> FAIL-CLOSED
    const fullValid = createSyntheticValidCompleteManifest();
    const missingOneState = evaluateBatch02ProductionArtEligibility(fullValid.slice(0, 67));
    expect(missingOneState.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(missingOneState.missingRequiredDiscreteStateIds).toHaveLength(1);

    // 7. Unresolved {companionId} wildcard path or missing 1 companion -> FAIL-CLOSED
    const withWildcard = fullValid.map((item, idx) =>
      idx === fullValid.length - 1
        ? {
            ...item,
            filePath: 'public/visual-v2/batch02-art/characters/{companionId}/rig_master_rgba.webp',
          }
        : item
    );
    const wildcardReport = evaluateBatch02ProductionArtEligibility(withWildcard);
    expect(wildcardReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(wildcardReport.missingCompanionIds).toContain('qiqi_deer');

    // 8. Below minimum pixel dimensions -> FAIL-CLOSED
    const lowRes = fullValid.map((item, idx) =>
      idx === 0 ? { ...item, pixelDimensions: { width: 1280, height: 720 } } : item
    );
    const lowResReport = evaluateBatch02ProductionArtEligibility(lowRes);
    expect(lowResReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(
      lowResReport.blockingReasons.some((r) => r.startsWith('INSUFFICIENT_PIXEL_DIMENSIONS'))
    ).toBe(true);

    // 9. Missing required alpha channel -> FAIL-CLOSED
    const noAlpha = fullValid.map((item, idx) =>
      idx === 2 ? { ...item, hasAlphaTransparency: false } : item
    );
    const noAlphaReport = evaluateBatch02ProductionArtEligibility(noAlpha);
    expect(noAlphaReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(
      noAlphaReport.blockingReasons.some((r) => r.startsWith('MISSING_REQUIRED_ALPHA_CHANNEL'))
    ).toBe(true);

    // 10. Duplicate SHA-256 across states without approved sharedAssetRef -> FAIL-CLOSED
    const unapprovedDupSha = fullValid.map((item, idx) =>
      idx === 6
        ? {
            ...item,
            sha256: fullValid[5].sha256,
            artDirectorApproval: {
              ...item.artDirectorApproval!,
              approvedSha256: fullValid[5].sha256!,
            },
          }
        : item
    );
    const dupShaReport = evaluateBatch02ProductionArtEligibility(unapprovedDupSha);
    expect(dupShaReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(
      dupShaReport.blockingReasons.some((r) =>
        r.startsWith('UNAPPROVED_DUPLICATE_SHA256_ACROSS_STATES')
      )
    ).toBe(true);

    // 11. SVG format marked PRODUCTION_ART_ACCEPTED -> FAIL-CLOSED
    const svgMarkedAccepted = fullValid.map((item, idx) =>
      idx === 5 ? { ...item, format: 'svg' as const } : item
    );
    const svgReport = evaluateBatch02ProductionArtEligibility(svgMarkedAccepted);
    expect(svgReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(
      svgReport.blockingReasons.some((r) => r.startsWith('INVALID_PRODUCTION_FORMAT'))
    ).toBe(true);

    // 12. Missing Art Director approval -> FAIL-CLOSED
    const noApproval = fullValid.map((item, idx) =>
      idx === 8 ? { ...item, artDirectorApproval: null } : item
    );
    const noApprovalReport = evaluateBatch02ProductionArtEligibility(noApproval);
    expect(noApprovalReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(
      noApprovalReport.blockingReasons.some((r) =>
        r.startsWith('MISSING_OR_INVALID_ART_DIRECTOR_APPROVAL')
      )
    ).toBe(true);

    // 13. Duplicate assetId poisoning -> FAIL-CLOSED
    const dupIdReport = evaluateBatch02ProductionArtEligibility([...fullValid, fullValid[0]]);
    expect(dupIdReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(
      dupIdReport.blockingReasons.some((r) => r.startsWith('DUPLICATE_ASSET_ID_ENTRIES'))
    ).toBe(true);

    // 14. Positive synthetic control: Complete 68 valid discrete states (+ historical TECH_PREVIEW_ONLY audit rows) -> PASS
    const positiveReport = evaluateBatch02ProductionArtEligibility([
      ...(ledger.entries as Batch02AssetInventoryEntry[]).filter(
        (e) => e.status === 'TECH_PREVIEW_ONLY'
      ),
      ...fullValid,
    ]);
    expect(positiveReport.canAuthorizeBatch02UiReplacement).toBe(true);
    expect(positiveReport.gateStatus).toBe('BATCH02_UI_REPLACEMENT_AUTHORIZED');
    expect(positiveReport.verifiedDiscreteStateCount).toBe(68);
    expect(positiveReport.verifiedSetCount).toBe(22);
    expect(positiveReport.missingRequiredSetIds).toEqual([]);
    expect(positiveReport.missingRequiredDiscreteStateIds).toEqual([]);
    expect(positiveReport.missingCompanionIds).toEqual([]);
    // Non-contradictory dynamic holdFlags
    expect(positiveReport.holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED).toBe(false);
    expect(positiveReport.holdFlags.ARTWORK_GAP).toBe(false);
    expect(positiveReport.holdFlags.ASSET_ARTWORK_BLOCKED).toBe(false);
    // Global release/QA holds remain independent
    expect(positiveReport.holdFlags.ART_DIRECTOR_QA_HOLD).toBe(true);
    expect(positiveReport.holdFlags.CONTENT_QA_REVIEW).toBe(true);
    expect(positiveReport.holdFlags.PRODUCTION_RELEASE_HOLD).toBe(true);
  });
});
