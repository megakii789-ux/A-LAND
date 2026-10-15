import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { StoryGroveModal } from '../components/ChildIsland/StoryGrove/StoryGroveModal';
import { FairytaleIslandMap } from '../components/ChildIsland/FairytaleIslandMap';
import {
  INTERACTIVE_STORY_LEAVES,
  STORY_GROVE_CAMP_TRANSFER_CHALLENGE,
  evaluateInteractiveLeafGoalCompletion,
  evaluateCampTransferGoals,
  isGenuineActionRevision,
} from '../domain/storyGrove/interactiveStoryLeaves';
import {
  getPlaytestExperienceMetrics,
  resetProductExperienceMetrics,
} from '../domain/cognitive/productExperienceMetrics';
import {
  grantParentAccess,
  lockParentAccess,
  resetParentPinForTesting,
  enableInternalPlaytestMode,
  disableInternalPlaytestMode,
} from '../domain/privacy/parentAccess';
import { ContentAuditRegistry } from '../domain/cognitive/ContentAuditRegistry';

interface HookCell {
  tag: 'state' | 'ref' | 'memo' | 'callback' | 'effect';
  value?: any;
  deps?: ReadonlyArray<any>;
  cleanup?: (() => void) | void;
}

interface ComponentInstance {
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
  let rootElement = initialElement;
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

  function renderNode(node: any, path: string, seenPaths: Set<string>): any {
    if (node === null || node === undefined || typeof node === 'boolean') return null;
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) {
      return node.map((child, idx) => renderNode(child, `${path}.${idx}`, seenPaths));
    }
    if (!React.isValidElement(node)) return null;

    const element = node as React.ReactElement<any>;
    const type: any = element.type;

    if (type === React.Fragment) {
      return renderNode(element.props.children, `${path}.frag`, seenPaths);
    }

    if (typeof type === 'object' && type !== null && ('_context' in type || '$$typeof' in type)) {
      const ctx = type._context || type;
      if ('value' in element.props) {
        contextStack.push({ context: ctx, value: element.props.value });
        try {
          return renderNode(element.props.children, `${path}.ctx`, seenPaths);
        } finally {
          contextStack.pop();
        }
      }
    }

    if (typeof type === 'function') {
      const compName = type.displayName || type.name || 'Anonymous';
      const instanceKey = `${path}:${compName}${element.key !== null ? `:${element.key}` : ''}`;
      seenPaths.add(instanceKey);

      let instance = instances.get(instanceKey);
      if (!instance) {
        instance = { hooks: [], hookIndex: 0 };
        instances.set(instanceKey, instance);
      }
      instance.hookIndex = 0;

      const prevDispatcher = reactInternals.H;
      reactInternals.H = createDispatcher(instance);
      let renderedChild: any;
      try {
        renderedChild = type(element.props);
      } finally {
        reactInternals.H = prevDispatcher;
      }
      return renderNode(renderedChild, instanceKey, seenPaths);
    }

    const renderedChildren = renderNode(
      element.props.children,
      `${path}.${String(type)}`,
      seenPaths
    );
    return {
      type,
      props: element.props,
      children: Array.isArray(renderedChildren)
        ? renderedChildren
        : renderedChildren !== null
          ? [renderedChildren]
          : [],
    };
  }

  function flushRender() {
    for (let pass = 0; pass < 6; pass++) {
      const seenPaths = new Set<string>();
      latestTree = renderNode(rootElement, 'root', seenPaths);

      for (const [key, inst] of Array.from(instances.entries())) {
        if (!seenPaths.has(key)) {
          for (const h of inst.hooks) {
            if (h.tag === 'effect' && typeof h.cleanup === 'function') {
              h.cleanup();
              h.cleanup = undefined;
            }
          }
          instances.delete(key);
        }
      }

      if (pendingEffects.length === 0) break;
      const effectsToRun = pendingEffects.splice(0, pendingEffects.length);
      for (const eff of effectsToRun) {
        eff();
      }
    }
  }

  flushRender();

  function collectText(node: any): string {
    if (node === null || node === undefined) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(collectText).join(' ');
    if (typeof node === 'object' && node.children) {
      return node.children.map(collectText).join(' ');
    }
    return '';
  }

  function findAll(
    predicate: (node: { type: any; props: any; text: string }) => boolean
  ): Array<{
    type: any;
    props: any;
    text: string;
  }> {
    const matches: Array<{ type: any; props: any; text: string }> = [];
    function walk(node: any) {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (typeof node === 'object' && node.type) {
        const item = { type: node.type, props: node.props || {}, text: collectText(node) };
        if (predicate(item)) {
          matches.push(item);
        }
        if (Array.isArray(node.children)) {
          node.children.forEach(walk);
        }
      }
    }
    walk(latestTree);
    return matches;
  }

  return {
    rerender(nextElement?: React.ReactElement) {
      if (nextElement) {
        rootElement = nextElement;
      }
      flushRender();
    },
    getText() {
      return collectText(latestTree);
    },
    findByTestId(testId: string) {
      return findAll((n) => n.props['data-testid'] === testId)[0] || null;
    },
    click(target: { props: any } | null) {
      if (!target || typeof target.props.onClick !== 'function') {
        throw new Error('Target has no onClick handler');
      }
      target.props.onClick({
        stopPropagation: () => {},
        preventDefault: () => {},
      });
      flushRender();
    },
    unmount() {
      for (const [, inst] of Array.from(instances.entries())) {
        for (const h of inst.hooks) {
          if (h.tag === 'effect' && typeof h.cleanup === 'function') {
            h.cleanup();
            h.cleanup = undefined;
          }
        }
      }
      instances.clear();
    },
  };
}

describe('Sprint 4 Cognitive Transfer Authenticity & Child Immersion Counterexamples', () => {
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
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: storageMock,
        sessionStorage: sessionMock,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
        matchMedia: () => ({
          matches: false,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
        scrollTo: () => {},
      },
      configurable: true,
    });

    ContentAuditRegistry.resetToDefault();
    resetParentPinForTesting();
    grantParentAccess();
    enableInternalPlaytestMode();
    resetProductExperienceMetrics();
  });

  afterEach(() => {
    disableInternalPlaytestMode();
    lockParentAccess();
    resetParentPinForTesting();
    resetProductExperienceMetrics();
  });

  it('Counterexample 1 & 2 (FIX-01): Observing 1 unrelated object or completing only PERSONAL_BOUNDARY NEVER marks SHADOW_INVESTIGATION, SHARED_RESOURCE, or the full camp challenge complete', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    view.click(view.findByTestId('open-camp-transfer-challenge'));

    // Counterexample 1: Inspect only 1 unrelated object (single flashlight) and click shine_light_check_branch
    view.click(view.findByTestId('camp-hotspot-camp_obj_single_flashlight'));
    view.click(view.findByTestId('camp-action-camp_act_shine_light_check_branch'));

    let metrics = getPlaytestExperienceMetrics();
    expect(metrics.hasEverCompletedCampTransfer).toBe(false);
    expect(metrics.latestCampTransferAttempt?.isCompleted).toBe(false);
    expect(metrics.latestCampTransferAttempt?.completedGoals).toEqual([]);
    expect(view.findByTestId('camp-goal-badge-SHADOW_INVESTIGATION')?.props['data-completed']).toBe(
      'false'
    );

    // Counterexample 2: Complete ONLY PERSONAL_BOUNDARY (inspect peer + express boundary)
    view.click(view.findByTestId('camp-hotspot-camp_obj_whispering_peer'));
    view.click(view.findByTestId('camp-action-camp_act_state_comfort_boundary'));

    metrics = getPlaytestExperienceMetrics();
    expect(metrics.latestCampTransferAttempt?.completedGoals).toEqual(['PERSONAL_BOUNDARY']);
    expect(metrics.historicalCompletedCampGoals).toEqual(['PERSONAL_BOUNDARY']);
    expect(metrics.latestCampTransferAttempt?.completedGoals).not.toContain('SHADOW_INVESTIGATION');
    expect(metrics.latestCampTransferAttempt?.completedGoals).not.toContain('SHARED_RESOURCE');
    expect(metrics.latestCampTransferAttempt?.isCompleted).toBe(false);
    expect(metrics.hasEverCompletedCampTransfer).toBe(false);

    expect(view.findByTestId('camp-goal-badge-PERSONAL_BOUNDARY')?.props['data-completed']).toBe(
      'true'
    );
    expect(view.findByTestId('camp-goal-badge-SHADOW_INVESTIGATION')?.props['data-completed']).toBe(
      'false'
    );
    expect(view.findByTestId('camp-goal-badge-SHARED_RESOURCE')?.props['data-completed']).toBe(
      'false'
    );

    view.unmount();
  });

  it('Counterexample 3 (FIX-02): Cup story with 2 unrelated observations (cup + twig ruler) NEVER completes dual-comparison goal, while order-independent block + bucket comparison DOES complete it', () => {
    // Pure logic verification first
    const unrelatedEval = evaluateInteractiveLeafGoalCompletion(
      'cup-size',
      'act_compare_both_sides',
      ['obj_blue_cup', 'obj_twig_ruler'],
      []
    );
    expect(unrelatedEval.isGoalCompleted).toBe(false);
    expect(unrelatedEval.missingHotspotIds).toEqual(['obj_wooden_block', 'obj_elephant_bucket']);

    // UI verification: inspect only obj_blue_cup and obj_twig_ruler, then click act_compare_both_sides
    const view = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    view.click(view.findByTestId('story-catalog-leaf-cup-size'));
    view.click(view.findByTestId('story-hotspot-obj_blue_cup'));
    view.click(view.findByTestId('story-hotspot-obj_twig_ruler'));
    expect(view.findByTestId('story-inspected-counter')?.text.replace(/\s+/g, '')).toContain('2/4');

    view.click(view.findByTestId('story-action-act_compare_both_sides'));

    // Even though 2 objects were inspected and a positive action was clicked, missing block & bucket prevents completion!
    let metrics = getPlaytestExperienceMetrics();
    expect(metrics.completedStoryLeafIds).not.toContain('cup-size');
    expect(metrics.storyLeafStatesById['cup-size']?.isCompleted).toBe(false);
    expect(view.findByTestId('story-island-linkage-banner')).toBeNull();
    expect(view.findByTestId('story-missing-evidence-prompt')).toBeTruthy();

    // Order-independent completion: now move cup to block and bucket AFTER selecting the action
    view.click(view.findByTestId('move-cup-to-block'));
    expect(getPlaytestExperienceMetrics().completedStoryLeafIds).not.toContain('cup-size');

    view.click(view.findByTestId('move-cup-to-bucket'));
    metrics = getPlaytestExperienceMetrics();
    expect(metrics.completedStoryLeafIds).toContain('cup-size');
    expect(metrics.storyLeafStatesById['cup-size']?.isCompleted).toBe(true);
    expect(view.findByTestId('story-island-linkage-banner')).toBeTruthy();

    view.unmount();
  });

  it('Counterexample 4 (FIX-03): Clicking "换个方法" without executing a new action NEVER increments revisionCount', () => {
    expect(isGenuineActionRevision(null, null, 'act_a', 'STATE_A')).toBe(false);
    expect(isGenuineActionRevision('act_a', 'STATE_A', 'act_a', 'STATE_A')).toBe(false);
    expect(isGenuineActionRevision('act_a', 'STATE_A', 'act_b', 'STATE_B')).toBe(true);

    const view = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // 1. Test in Story Leaf (cup-size)
    view.click(view.findByTestId('story-catalog-leaf-cup-size'));
    view.click(view.findByTestId('story-action-act_only_look_squirrel'));
    expect(getPlaytestExperienceMetrics().storyLeafStatesById['cup-size']?.revisionCount).toBe(0);

    // Click "回到场景换个办法试试" 3 times and re-click the SAME action -> revisionCount MUST stay 0!
    view.click(view.findByTestId('story-revise-action-btn'));
    expect(getPlaytestExperienceMetrics().storyLeafStatesById['cup-size']?.revisionCount).toBe(0);
    expect(view.findByTestId('story-revised-badge')).toBeNull();

    view.click(view.findByTestId('story-action-act_only_look_squirrel'));
    expect(getPlaytestExperienceMetrics().storyLeafStatesById['cup-size']?.revisionCount).toBe(0);
    view.click(view.findByTestId('story-revise-action-btn'));
    expect(getPlaytestExperienceMetrics().storyLeafStatesById['cup-size']?.revisionCount).toBe(0);

    // Now execute a DIFFERENT action with a different outcome -> revisionCount becomes 1
    view.click(view.findByTestId('story-action-act_compare_both_sides'));
    expect(getPlaytestExperienceMetrics().storyLeafStatesById['cup-size']?.revisionCount).toBe(1);
    expect(view.findByTestId('story-revised-badge')).toBeTruthy();

    view.unmount();

    // 2. Test in Camp Night Transfer Challenge
    const campView = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );
    campView.click(campView.findByTestId('open-camp-transfer-challenge'));
    campView.click(campView.findByTestId('camp-action-camp_act_guess_monster_scream'));
    expect(getPlaytestExperienceMetrics().latestCampTransferAttempt?.revisionCount).toBe(0);
    expect(getPlaytestExperienceMetrics().latestCampTransferAttempt?.revisedAfterConsequence).toBe(
      false
    );

    // Click "换个方法再试" without choosing a new action -> revisionCount stays 0 and badge stays hidden
    campView.click(campView.findByTestId('camp-revise-method-btn'));
    expect(getPlaytestExperienceMetrics().latestCampTransferAttempt?.revisionCount).toBe(0);
    expect(campView.findByTestId('camp-method-revised-badge')).toBeNull();

    // Execute a genuinely different action -> revisionCount becomes 1
    campView.click(campView.findByTestId('camp-action-camp_act_shine_light_check_branch'));
    expect(getPlaytestExperienceMetrics().latestCampTransferAttempt?.revisionCount).toBe(1);
    expect(getPlaytestExperienceMetrics().latestCampTransferAttempt?.revisedAfterConsequence).toBe(
      true
    );
    expect(campView.findByTestId('camp-method-revised-badge')).toBeTruthy();

    campView.unmount();
  });

  it('Counterexample 5 (FIX-04): First full completion lights island warm lantern; re-entering and trying an unsuccessful action NEVER extinguishes the historical island lantern', () => {
    const groveView = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    groveView.click(groveView.findByTestId('open-camp-transfer-challenge'));

    // Complete all 3 goals autonomously on first run
    groveView.click(groveView.findByTestId('aim-flashlight-SHADOW_CURTAIN'));
    groveView.click(groveView.findByTestId('aim-flashlight-OUTSIDE_BRANCH'));
    groveView.click(groveView.findByTestId('camp-action-camp_act_shine_light_check_branch'));

    groveView.click(groveView.findByTestId('aim-flashlight-TENT_INSIDE'));
    groveView.click(groveView.findByTestId('camp-action-camp_act_state_comfort_boundary'));

    groveView.click(groveView.findByTestId('aim-flashlight-LANTERN_DIFFUSER'));
    groveView.click(groveView.findByTestId('camp-action-camp_act_share_flashlight_roles'));

    let metrics = getPlaytestExperienceMetrics();
    expect(metrics.hasEverCompletedCampTransfer).toBe(true);
    expect(metrics.latestCampTransferAttempt?.isCompleted).toBe(true);
    expect(metrics.latestCampTransferAttempt?.independenceLevel).toBe(
      'UNPROMPTED_AUTONOMOUS_COMPLETION'
    );
    groveView.unmount();

    // Check Island Map: warm lantern is lit
    const islandView1 = createStatefulTestRenderer(
      <AppProvider>
        <FairytaleIslandMap />
      </AppProvider>
    );
    expect(islandView1.findByTestId('island-svg-camp-transfer-lantern')).toBeTruthy();
    islandView1.unmount();

    // Re-enter Camp Night and try an unsuccessful panic action, then exit immediately
    const replayView = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );
    replayView.click(replayView.findByTestId('open-camp-transfer-challenge'));
    expect(replayView.findByTestId('camp-historical-lantern-badge')).toBeTruthy();

    replayView.click(replayView.findByTestId('camp-action-camp_act_guess_monster_scream'));
    metrics = getPlaytestExperienceMetrics();

    // Latest attempt reflects the new incomplete run, while historical achievements stay intact!
    expect(metrics.latestCampTransferAttempt?.isCompleted).toBe(false);
    expect(metrics.latestCampTransferAttempt?.chosenActions).toEqual([
      'camp_act_guess_monster_scream',
    ]);
    expect(metrics.hasEverCompletedCampTransfer).toBe(true);
    expect(metrics.historicalCompletedCampGoals).toEqual([
      'SHADOW_INVESTIGATION',
      'PERSONAL_BOUNDARY',
      'SHARED_RESOURCE',
    ]);
    replayView.unmount();

    // Return to Island Map: warm lantern MUST still be lit!
    const islandView2 = createStatefulTestRenderer(
      <AppProvider>
        <FairytaleIslandMap />
      </AppProvider>
    );
    expect(islandView2.findByTestId('island-svg-camp-transfer-lantern')).toBeTruthy();
    expect(islandView2.findByTestId('island-story-grove-progress-badge')?.text).toContain(
      '露营灯已亮'
    );
    islandView2.unmount();
  });

  it('Counterexample 6 & 7 (FIX-05 & Direct Scene Manipulation): Unexplored hotspots/actions hide spoilers ("松果"), and moving the cup or aiming the flashlight produces observable scene changes', () => {
    // Static check on hotspot default labels and action labels
    for (const hotspot of STORY_GROVE_CAMP_TRANSFER_CHALLENGE.hotspots) {
      expect(hotspot.label).not.toContain('松果');
    }
    for (const action of STORY_GROVE_CAMP_TRANSFER_CHALLENGE.actions) {
      expect(action.label).not.toContain('松果');
    }

    const view = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // Showcase A: Direct cup movement in cup-size
    view.click(view.findByTestId('story-catalog-leaf-cup-size'));
    expect(view.findByTestId('movable-blue-cup-prop')?.props['data-cup-position']).toBe(
      'CENTER_TABLE'
    );
    expect(view.findByTestId('cup-constant-size-gauge')?.text).toContain('2格高(不变)');

    view.click(view.findByTestId('move-cup-to-block'));
    expect(view.findByTestId('movable-blue-cup-prop')?.props['data-cup-position']).toBe(
      'NEXT_TO_BLOCK'
    );
    expect(view.findByTestId('cup-vs-block-visual-badge')).toBeTruthy();

    view.click(view.findByTestId('move-cup-to-bucket'));
    expect(view.findByTestId('movable-blue-cup-prop')?.props['data-cup-position']).toBe(
      'NEXT_TO_BUCKET'
    );
    expect(view.findByTestId('cup-vs-bucket-visual-badge')).toBeTruthy();
    expect(view.findByTestId('interactive-leaf-scene-cup-size')?.props['data-compared-count']).toBe(
      2
    );

    // Showcase B: Unexplored hotspot hides "松果", aiming flashlight reveals it and changes beam direction
    view.click(view.findByTestId('story-hotspot-obj_blue_cup')); // just to test switching back to catalog
    view.unmount();

    const campView = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );
    campView.click(campView.findByTestId('open-camp-transfer-challenge'));

    // Before exploration: camp_obj_pinecone_branch shows neutral label "帐篷旁边的东西"
    const branchBtnBefore = campView.findByTestId('camp-hotspot-camp_obj_pinecone_branch');
    expect(branchBtnBefore?.text).toContain('帐篷旁边的东西');
    expect(branchBtnBefore?.text).not.toContain('松果');
    expect(campView.findByTestId('camp-transfer-svg-scene')?.props['data-beam-target']).toBe('OFF');

    // Aim flashlight at OUTSIDE_BRANCH -> scene beam updates and reveals "风中摇晃的松果树枝"
    campView.click(campView.findByTestId('aim-flashlight-OUTSIDE_BRANCH'));
    expect(campView.findByTestId('camp-transfer-svg-scene')?.props['data-beam-target']).toBe(
      'OUTSIDE_BRANCH'
    );
    expect(campView.findByTestId('camp-svg-light-beam')?.props['data-beam-direction']).toBe(
      'OUTSIDE_BRANCH'
    );
    const branchBtnAfter = campView.findByTestId('camp-hotspot-camp_obj_pinecone_branch');
    expect(branchBtnAfter?.text).toContain('风中摇晃的松果树枝');
    expect(campView.findByTestId('camp-hotspot-observation-card')?.text).toContain('两颗大松果');

    campView.unmount();
  });
});
