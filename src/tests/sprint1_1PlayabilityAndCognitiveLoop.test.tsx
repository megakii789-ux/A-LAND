import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { CrayonDetectiveGame } from '../components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame';
import { TransferScenariosModal } from '../components/InteractiveGames/TransferLab/TransferScenariosModal';
import { FairytaleIslandMap } from '../components/ChildIsland/FairytaleIslandMap';
import { ParentDashboard } from '../components/ParentCoach/ParentDashboard';
import {
  getThemedScenarioCase,
  evaluateHypothesisAgainstEvidence,
  getOrderAwareDiscoveryFeedback,
} from '../domain/personalization/contentThemeEngine';
import {
  getProductExperienceMetrics,
  getChildSessionExperienceMetrics,
  getPlaytestExperienceMetrics,
  resetProductExperienceMetrics,
  recordLandmarkVisit,
  clearActiveLandmarkSession,
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

function areDepsEqual(prev: ReadonlyArray<any> | undefined, next: ReadonlyArray<any> | undefined): boolean {
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

    const renderedChildren = renderNode(element.props.children, `${path}.${String(type)}`, seenPaths);
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
    for (let pass = 0; pass < 5; pass++) {
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

  function findAll(predicate: (node: { type: any; props: any; text: string }) => boolean): Array<{
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
    getText() {
      return collectText(latestTree);
    },
    findAll,
    findByTestId(testId: string) {
      return findAll((n) => n.props['data-testid'] === testId)[0] || null;
    },
    findButtonByText(substring: string) {
      return findAll((n) => n.type === 'button' && n.text.includes(substring))[0] || null;
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

describe('Sprint 1.1 Playability & Cognitive Loop Deepening', () => {
  const storageMap = new Map<string, string>();
  const sessionMap = new Map<string, string>();

  beforeEach(() => {
    storageMap.clear();
    sessionMap.clear();
    (globalThis as any).window = (globalThis as any).window || {};
    (globalThis as any).window.localStorage = {
      getItem: (k: string) => (storageMap.has(k) ? storageMap.get(k)! : null),
      setItem: (k: string, v: string) => storageMap.set(k, String(v)),
      removeItem: (k: string) => storageMap.delete(k),
      clear: () => storageMap.clear(),
    };
    (globalThis as any).window.sessionStorage = {
      getItem: (k: string) => (sessionMap.has(k) ? sessionMap.get(k)! : null),
      setItem: (k: string, v: string) => sessionMap.set(k, String(v)),
      removeItem: (k: string) => sessionMap.delete(k),
      clear: () => sessionMap.clear(),
    };
    (globalThis as any).localStorage = (globalThis as any).window.localStorage;
    (globalThis as any).sessionStorage = (globalThis as any).window.sessionStorage;

    resetParentPinForTesting();
    disableInternalPlaytestMode();
    lockParentAccess();
    resetProductExperienceMetrics();
    ContentAuditRegistry.resetToDefault();
  });

  afterEach(() => {
    disableInternalPlaytestMode();
    lockParentAccess();
    resetParentPinForTesting();
    resetProductExperienceMetrics();
  });

  it('Negative Test 1 (P0-01): Zero exploration -> viewing synthesis modal does NOT record case completion and marks ENDED_EARLY', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <CrayonDetectiveGame onExit={() => {}} />
      </AppProvider>
    );

    expect(view.findByTestId('detective-case-status-badge')?.text).toContain('尚未开始调查');

    // Immediately click "查看侦探破案手册" with 0 exploration
    const openSynthesisBtn = view.findByTestId('open-detective-synthesis-btn');
    expect(openSynthesisBtn).toBeTruthy();
    view.click(openSynthesisBtn);

    // Status becomes ENDED_EARLY, early-peek banner is rendered, and completedDetectiveCaseIds stays empty
    expect(view.findByTestId('synthesis-early-peek-banner')).toBeTruthy();
    expect(view.findByTestId('detective-case-status-badge')?.text).toContain('已暂停 / 仅查看参考');

    const metrics = getProductExperienceMetrics();
    expect(metrics.completedDetectiveCaseIds).toEqual([]);

    view.unmount();
  });

  it('Negative Test 2 (P0-04): Zero selection in Transfer Lab -> viewing reference summary does NOT record transfer completion', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <TransferScenariosModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    expect(view.findByTestId('transfer-task-status-badge')?.text).toContain('尚未开始');

    // Click reference button without selecting any option
    const refBtn = view.findByTestId('transfer-submit-or-view-btn');
    expect(refBtn).toBeTruthy();
    view.click(refBtn);

    expect(view.findByTestId('transfer-reference-only-badge')).toBeTruthy();
    expect(view.findByTestId('transfer-task-status-badge')?.text).toContain('仅查看客观参考');

    const metrics = getProductExperienceMetrics();
    expect(metrics.completedTransferScenarioIds).toEqual([]);
    expect(metrics.independentTransferCount).toBe(0);
    expect(metrics.promptedTransferCount).toBe(0);

    view.unmount();
  });

  it('Negative Test 3 & 4 (P0-02, P0-05): Repeated clicks on "我还不知道" or same hypothesis revision do NOT inflate metrics', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <CrayonDetectiveGame onExit={() => {}} />
      </AppProvider>
    );

    // Click "现在证据还不够，我还不知道" multiple times in Stage 1
    expect(view.findByTestId('initial-hypothesis-hyp_unknown_yet')).toBeTruthy();
    view.click(view.findByTestId('initial-hypothesis-hyp_unknown_yet'));
    view.click(view.findByTestId('initial-hypothesis-hyp_unknown_yet'));
    view.click(view.findByTestId('initial-hypothesis-hyp_unknown_yet'));

    let metrics = getProductExperienceMetrics();
    expect(metrics.unknownHonestyCount).toBe(1);

    // Discover 2 clues to unlock Stage 3 hypothesis revision
    view.click(view.findByTestId('scene-hotspot-hs_easel'));
    view.click(view.findByTestId('scene-hotspot-hs_cat_tracks'));

    // Click the same revised hypothesis 3 times in a row
    expect(view.findByTestId('revise-hypothesis-hyp_rolled_away')).toBeTruthy();
    view.click(view.findByTestId('revise-hypothesis-hyp_rolled_away'));
    view.click(view.findByTestId('revise-hypothesis-hyp_rolled_away'));
    view.click(view.findByTestId('revise-hypothesis-hyp_rolled_away'));

    metrics = getProductExperienceMetrics();
    expect(metrics.hypothesisRevisionCount).toBe(1);

    view.unmount();
  });

  it('Negative Test 5 (P0-05): Repeatedly clicking the same landmark without ending active session only counts once', () => {
    resetProductExperienceMetrics();

    recordLandmarkVisit('detective');
    recordLandmarkVisit('detective');
    recordLandmarkVisit('detective');

    let metrics = getChildSessionExperienceMetrics();
    expect(metrics.visitedLandmarks).toEqual(['detective']);
    expect(metrics.activeExplorationCount).toBe(1);

    // Once active session is cleared (e.g., modal closed), next visit counts
    clearActiveLandmarkSession();
    recordLandmarkVisit('detective');

    metrics = getChildSessionExperienceMetrics();
    expect(metrics.activeExplorationCount).toBe(2);
  });

  it('Negative Test 6 (P0-05): PLAYTEST mode metrics are strictly isolated from CHILD_SESSION and ParentDashboard', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const gameView = createStatefulTestRenderer(
      <AppProvider>
        <CrayonDetectiveGame onExit={() => {}} />
      </AppProvider>
    );

    // Complete a case while in PLAYTEST mode
    viewClickFullCaseA(gameView);
    gameView.unmount();

    const playtestMetrics = getPlaytestExperienceMetrics();
    const childMetrics = getChildSessionExperienceMetrics();

    expect(playtestMetrics.completedDetectiveCaseIds).toContain('scenario_detective_drawing_v1');
    expect(childMetrics.completedDetectiveCaseIds).toEqual([]);

    // Render ParentDashboard -> insights tab should show empty child metrics + playtest isolation note
    const parentView = createStatefulTestRenderer(
      <AppProvider>
        <ParentDashboard />
      </AppProvider>
    );
    const insightsTab = parentView.findButtonByText('趋势信号看板');
    parentView.click(insightsTab);

    expect(parentView.findByTestId('parent-cognitive-process-empty')).toBeTruthy();
    expect(parentView.findByTestId('parent-playtest-isolation-note')).toBeTruthy();
    parentView.unmount();
  });

  it('Positive Test 7 & 8 (P0-01, P0-02, P0-03): Evidence-driven hypothesis evaluation, curtain reveal, and action consequence loop', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <CrayonDetectiveGame onExit={() => {}} />
      </AppProvider>
    );

    // Step 1: Select initial hypothesis "肯定是皮皮偷偷拿走了"
    const peerBtn = view.findByTestId('initial-hypothesis-hyp_peer_took');
    view.click(peerBtn);

    // Step 2: Lead click only highlights region on scene without auto-claiming clues
    const leadCurtain = view.findByTestId('investigation-lead-lead_check_curtain');
    view.click(leadCurtain);
    expect(view.findByTestId('scene-hotspot-hs_curtain')?.props['data-highlighted']).toBe('true');
    expect(view.findByTestId('quick-sort-hs_curtain-EYES_OBSERVED')).toBeNull();

    // Tap 1 on curtain -> lifts curtain ("掀开窗帘底")
    const curtainSpot = view.findByTestId('scene-hotspot-hs_curtain');
    view.click(curtainSpot);
    expect(view.findByTestId('scene-hotspot-hs_curtain')?.props['data-revealed']).toBe('true');

    // Tap 2 on curtain -> discovers green crayon under curtain
    view.click(view.findByTestId('scene-hotspot-hs_curtain'));
    expect(view.findByTestId('scene-object-popover')).toBeTruthy();

    // Sort curtain clue into FACT via in-scene popover
    view.click(view.findByTestId('quick-sort-hs_curtain-EYES_OBSERVED'));

    // Also inspect easel clue and sort it into FACT
    view.click(view.findByTestId('scene-hotspot-hs_easel'));
    view.click(view.findByTestId('quick-sort-hs_easel-EYES_OBSERVED'));

    // Step 3: Suppose child STILL selects "肯定是皮皮偷偷拿走了" despite finding crayon under curtain
    const revisePeerBtn = view.findByTestId('revise-hypothesis-hyp_peer_took');
    view.click(revisePeerBtn);

    const feedbackBox = view.findByTestId('hypothesis-evaluation-feedback');
    expect(feedbackBox).toBeTruthy();
    const feedbackText = view.getText();
    expect(feedbackText).toContain('我们找到了蜡笔，不过这条线索还没有证明皮皮拿过它。要不要再看看刚才发现了什么？');
    expect(view.findByTestId('hypothesis-evaluation-badge')?.props['data-relation']).toBe('CONTRADICTED_BY_EVIDENCE');

    // Now child revises to evidence-supported hypothesis "可能被小动物或什么东西碰滚走了"
    const reviseRolledBtn = view.findByTestId('revise-hypothesis-hyp_rolled_away');
    view.click(reviseRolledBtn);
    expect(view.findByTestId('hypothesis-evaluation-badge')?.props['data-relation']).toBe('SUPPORTED_BY_EVIDENCE');

    // Step 4: Select next action and inspect realistic benefit, tradeoff, and world change
    const actionBtn = view.findByTestId('next-action-act_pickup_and_apologize');
    view.click(actionBtn);

    const consequenceCard = view.findByTestId('detective-action-consequence');
    expect(consequenceCard).toBeTruthy();
    expect(view.getText()).toContain('现场变化：');

    // Step 5: Open synthesis modal -> records COMPLETED
    view.click(view.findByTestId('open-detective-synthesis-btn'));
    expect(view.findByTestId('detective-case-status-badge')?.text).toContain('已完成破案闭环');

    const metrics = getPlaytestExperienceMetrics();
    expect(metrics.completedDetectiveCaseIds).toContain('scenario_detective_drawing_v1');

    view.unmount();
  });

  it('Positive Test 9 & 10 (P1-02): Case B (Nature) supports "证据不足，还不知道" as the evidence-supported conclusion and provides order-aware feedback', () => {
    const natureCase = getThemedScenarioCase('nature', 0);

    // Before discovering clues -> NOT_INVESTIGATED_YET
    const uninvestigated = evaluateHypothesisAgainstEvidence(natureCase, 'hyp_nat_magpie', []);
    expect(uninvestigated.relation).toBe('NOT_INVESTIGATED_YET');

    // After discovering tree moss feather + wind trail + empty acorn cap under leaf pile + deep burrow
    const allNatureClues = ['hs_nature_tree_moss', 'hs_nature_wind_trail', 'hs_nature_leaf_pile', 'hs_nature_deep_burrow'];

    const evalMagpie = evaluateHypothesisAgainstEvidence(natureCase, 'hyp_nat_magpie', allNatureClues);
    expect(evalMagpie.relation).toBe('INSUFFICIENT_EVIDENCE');

    const evalLeafPile = evaluateHypothesisAgainstEvidence(natureCase, 'hyp_nat_wind', allNatureClues);
    expect(evalLeafPile.relation).toBe('CONTRADICTED_BY_EVIDENCE');

    const evalUnknown = evaluateHypothesisAgainstEvidence(natureCase, 'hyp_nat_unknown', allNatureClues);
    expect(evalUnknown.relation).toBe('SUPPORTED_BY_EVIDENCE');
    expect(evalUnknown.badgeLabel).toContain('有证据支持');

    // Order-aware feedback check on Case A
    const drawingCase = getThemedScenarioCase('drawing', 0);
    const curtainHotspot = drawingCase.hotspots.find((h) => h.id === 'hs_curtain')!;
    const feedbackCurtainFirst = getOrderAwareDiscoveryFeedback(drawingCase, curtainHotspot, []);
    const feedbackCurtainAfterTracks = getOrderAwareDiscoveryFeedback(drawingCase, curtainHotspot, ['hs_cat_tracks']);
    expect(feedbackCurtainFirst).not.toBe(feedbackCurtainAfterTracks);
    expect(feedbackCurtainAfterTracks).toContain('顺着刚才的彩色猫爪印掀开窗帘');
  });

  it('Positive Test 11 (P1-03): FairytaleIslandMap unlocks world reaction banner only after real detective case completions', () => {
    const emptyMap = createStatefulTestRenderer(
      <FairytaleIslandMap completedDetectiveCasesCount={0} completedStoriesCount={0} />
    );
    expect(emptyMap.findByTestId('island-world-reaction-banner')).toBeNull();
    expect(emptyMap.getText()).toContain('放大镜找线索 · 区分事实猜测');
    emptyMap.unmount();

    const activeMap = createStatefulTestRenderer(
      <FairytaleIslandMap completedDetectiveCasesCount={2} completedStoriesCount={1} />
    );
    expect(activeMap.findByTestId('island-world-reaction-banner')).toBeTruthy();
    expect(activeMap.getText()).toContain('木屋已点亮 2 枚线索徽章');
    activeMap.unmount();
  });

  // =========================================================================
  // Sprint 1.2 真实游戏机制定向强化 — 六项必跑负向测试
  // =========================================================================

  it('Sprint 1.2 Negative Test 1: Tapping curtain or maple leaf pile once ONLY changes occlusion state and does NOT acquire hidden clue or allow sorting', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    // 1A. Case A (Drawing): Curtain
    const viewA = createStatefulTestRenderer(
      <AppProvider>
        <CrayonDetectiveGame onExit={() => {}} initialTheme="drawing" />
      </AppProvider>
    );

    const curtainSpot1 = viewA.findByTestId('scene-hotspot-hs_curtain');
    expect(curtainSpot1?.props['data-revealed']).toBe('false');
    expect(curtainSpot1?.props['data-discovered']).toBe('false');

    // First tap -> only reveals curtain, does NOT discover clue or render quick-sort
    viewA.click(curtainSpot1);
    const curtainAfterTap1 = viewA.findByTestId('scene-hotspot-hs_curtain');
    expect(curtainAfterTap1?.props['data-revealed']).toBe('true');
    expect(curtainAfterTap1?.props['data-discovered']).toBe('false');
    expect(viewA.findByTestId('popover-reveal-only-badge')).toBeTruthy();
    expect(viewA.findByTestId('quick-sort-hs_curtain-EYES_OBSERVED')).toBeNull();
    expect(viewA.getText().replace(/\s+/g, '')).toContain('线索0/5');

    // Second tap -> acquires hidden clue and unlocks quick-sort
    viewA.click(curtainAfterTap1);
    const curtainAfterTap2 = viewA.findByTestId('scene-hotspot-hs_curtain');
    expect(curtainAfterTap2?.props['data-revealed']).toBe('true');
    expect(curtainAfterTap2?.props['data-discovered']).toBe('true');
    expect(viewA.findByTestId('quick-sort-hs_curtain-EYES_OBSERVED')).toBeTruthy();
    expect(viewA.getText().replace(/\s+/g, '')).toContain('线索1/5');
    viewA.unmount();

    // 1B. Case B (Nature): Maple Leaf Pile
    const viewB = createStatefulTestRenderer(
      <AppProvider>
        <CrayonDetectiveGame onExit={() => {}} initialTheme="nature" />
      </AppProvider>
    );

    const leafSpot1 = viewB.findByTestId('scene-hotspot-hs_nature_leaf_pile');
    expect(leafSpot1?.props['data-revealed']).toBe('false');
    expect(leafSpot1?.props['data-discovered']).toBe('false');

    // First tap -> only opens maple leaf pile, does NOT discover clue or render quick-sort
    viewB.click(leafSpot1);
    const leafAfterTap1 = viewB.findByTestId('scene-hotspot-hs_nature_leaf_pile');
    expect(leafAfterTap1?.props['data-revealed']).toBe('true');
    expect(leafAfterTap1?.props['data-discovered']).toBe('false');
    expect(viewB.findByTestId('popover-reveal-only-badge')).toBeTruthy();
    expect(viewB.findByTestId('quick-sort-hs_nature_leaf_pile-EYES_OBSERVED')).toBeNull();
    expect(viewB.getText().replace(/\s+/g, '')).toContain('线索0/5');

    // Second tap -> acquires empty acorn cap clue
    viewB.click(leafAfterTap1);
    const leafAfterTap2 = viewB.findByTestId('scene-hotspot-hs_nature_leaf_pile');
    expect(leafAfterTap2?.props['data-revealed']).toBe('true');
    expect(leafAfterTap2?.props['data-discovered']).toBe('true');
    expect(viewB.findByTestId('quick-sort-hs_nature_leaf_pile-EYES_OBSERVED')).toBeTruthy();
    expect(viewB.getText().replace(/\s+/g, '')).toContain('线索1/5');
    viewB.unmount();
  });

  it('Sprint 1.2 Negative Test 2: Clicking 2 non-key hotspots + initial hypothesis + arbitrary action does NOT complete the case', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <CrayonDetectiveGame onExit={() => {}} initialTheme="drawing" />
      </AppProvider>
    );

    // 1. Select initial hypothesis only
    view.click(view.findByTestId('initial-hypothesis-hyp_peer_took'));

    // 2. Click 2 non-key hotspots (thought bubble + locked backpack, skipping curtain key evidence & sorting)
    view.click(view.findByTestId('scene-hotspot-hs_qiqi_thought'));
    view.click(view.findByTestId('scene-hotspot-hs_backpack'));

    // 3. Click an arbitrary action (even a recommended one without key evidence/sorting/revision)
    view.click(view.findByTestId('next-action-act_pickup_and_apologize'));

    // Must NOT be completed!
    expect(view.findByTestId('detective-case-status-badge')?.props['data-status']).toBe('ACTION_SELECTED');
    const metrics = getPlaytestExperienceMetrics();
    expect(metrics.completedDetectiveCaseIds).toEqual([]);
    expect(metrics.independentDetectiveCaseIds).toEqual([]);

    view.unmount();
  });

  it('Sprint 1.2 Negative Test 3: Forest case with only 2 ordinary clues does NOT certify hypothesis as SUPPORTED_BY_EVIDENCE and never spoils uninspected leaf pile or deep burrow', () => {
    const natureCase = getThemedScenarioCase('nature', 0);

    // Only 2 ordinary clues discovered (tree moss feather + wind trail), NEITHER maple leaf pile NOR deep burrow inspected
    const ordinaryClues = ['hs_nature_tree_moss', 'hs_nature_wind_trail'];

    for (const hypId of ['hyp_nat_magpie', 'hyp_nat_wind', 'hyp_nat_unknown']) {
      const evalResult = evaluateHypothesisAgainstEvidence(natureCase, hypId, ordinaryClues);
      expect(evalResult.relation).toBe('INSUFFICIENT_EVIDENCE');
      expect(evalResult.findingState).toBe('INSUFFICIENT_EVIDENCE');
      // Must NOT spoil undiscovered object states ("空帽壳" or "黑漆漆")
      expect(evalResult.spokenFeedback).not.toContain('空帽壳');
      expect(evalResult.spokenFeedback).not.toContain('黑漆漆');
    }
  });

  it('Sprint 1.2 Negative Test 4: Transfer Lab -> selecting only a single ordinary FACT item and submitting does NOT complete the scenario', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <TransferScenariosModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // Select only 1 ordinary fact item (t1_crumbs) without selecting the UNKNOWN boundary (t5_unknown_who)
    view.click(view.findByTestId('transfer-option-t1_crumbs'));
    view.click(view.findByTestId('transfer-submit-or-view-btn'));

    expect(view.findByTestId('transfer-task-status-badge')?.props['data-status']).toBe('ATTEMPTED');
    expect(view.findByTestId('transfer-evaluation-note')).toBeTruthy();

    const metrics = getPlaytestExperienceMetrics();
    expect(metrics.completedTransferScenarioIds).toEqual([]);
    expect(metrics.independentTransferCount).toBe(0);
    expect(metrics.promptedTransferCount).toBe(0);

    view.unmount();
  });

  it('Sprint 1.2 Negative Test 5: Transfer Lab -> viewing reference or triggering error explanation first, then redoing to pass, is NEVER recorded as COMPLETED_INDEPENDENT', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <TransferScenariosModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // 1. Trigger error explanation first (or view reference) by submitting an incomplete/wrong choice
    view.click(view.findByTestId('transfer-option-t4_inference_thought'));
    view.click(view.findByTestId('transfer-submit-or-view-btn'));
    expect(view.findByTestId('transfer-task-status-badge')?.props['data-status']).toBe('ATTEMPTED');

    // 2. Reset and select the valid goal options (t1_crumbs + t5_unknown_who)
    view.click(view.findButtonByText('重置选择'));
    view.click(view.findByTestId('transfer-option-t1_crumbs'));
    view.click(view.findByTestId('transfer-option-t5_unknown_who'));
    view.click(view.findByTestId('transfer-submit-or-view-btn'));

    // Must be recorded as COMPLETED_WITH_PROMPT, never COMPLETED_INDEPENDENT!
    expect(view.findByTestId('transfer-task-status-badge')?.props['data-status']).toBe('COMPLETED_WITH_PROMPT');

    const metrics = getPlaytestExperienceMetrics();
    expect(metrics.completedTransferScenarioIds).toContain('transfer_biscuit_mystery');
    expect(metrics.independentTransferCount).toBe(0);
    expect(metrics.promptedTransferCount).toBe(1);

    view.unmount();
  });

  it('Sprint 1.2 Negative Test 6: Peeking at detective reference ending early, then finishing remaining steps, records COMPLETED_AFTER_REFERENCE and never inflates independentDetectiveCaseIds', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <CrayonDetectiveGame onExit={() => {}} initialTheme="drawing" />
      </AppProvider>
    );

    // 1. Peek at reference manual early with 0 clues
    view.click(view.findByTestId('open-detective-synthesis-btn'));
    expect(view.findByTestId('detective-case-status-badge')?.props['data-status']).toBe('ENDED_EARLY');
    expect(view.findByTestId('synthesis-early-peek-banner')).toBeTruthy();

    // Close modal and complete all cognitive steps
    view.click(view.findButtonByText('返回现场继续探索'));
    viewClickFullCaseA(view);

    expect(view.findByTestId('detective-case-status-badge')?.props['data-status']).toBe('COMPLETED_AFTER_REFERENCE');
    expect(view.findByTestId('synthesis-assisted-completion-banner')).toBeTruthy();

    const metrics = getPlaytestExperienceMetrics();
    expect(metrics.completedDetectiveCaseIds).toContain('scenario_detective_drawing_v1');
    expect(metrics.assistedDetectiveCaseIds).toContain('scenario_detective_drawing_v1');
    expect(metrics.independentDetectiveCaseIds).toEqual([]);

    view.unmount();
  });
});

function viewClickFullCaseA(view: ReturnType<typeof createStatefulTestRenderer>) {
  view.click(view.findByTestId('initial-hypothesis-hyp_unknown_yet'));
  // Reveal and click curtain
  view.click(view.findByTestId('scene-hotspot-hs_curtain'));
  view.click(view.findByTestId('scene-hotspot-hs_curtain'));
  view.click(view.findByTestId('quick-sort-hs_curtain-EYES_OBSERVED'));
  // Click easel and sort
  view.click(view.findByTestId('scene-hotspot-hs_easel'));
  view.click(view.findByTestId('quick-sort-hs_easel-EYES_OBSERVED'));
  // Revise hypothesis
  view.click(view.findByTestId('revise-hypothesis-hyp_rolled_away'));
  // Select next action
  view.click(view.findByTestId('next-action-act_pickup_and_apologize'));
  // Complete synthesis
  view.click(view.findByTestId('open-detective-synthesis-btn'));
}
