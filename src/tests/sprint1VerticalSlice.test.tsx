import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppProvider } from '../context/AppContext';
import {
  getThemedScenarioCasesByInterest,
  getThemedScenarioCase
} from '../domain/personalization/contentThemeEngine';
import {
  getProductExperienceMetrics,
  resetProductExperienceMetrics,
  hasRecordedExperienceMetrics,
  recordUnknownHonestyChoice
} from '../domain/cognitive/productExperienceMetrics';
import {
  grantParentAccess,
  lockParentAccess,
  resetParentPinForTesting,
  isInternalPlaytestEnabled,
  enableInternalPlaytestMode,
  disableInternalPlaytestMode,
  issueAdultPreviewSession
} from '../domain/privacy/parentAccess';
import { ContentAuditRegistry } from '../domain/cognitive/ContentAuditRegistry';
import { CrayonDetectiveGame } from '../components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame';
import { InteractiveGamesHubModal } from '../components/InteractiveGames/InteractiveGamesHubModal';
import { TransferScenariosModal } from '../components/InteractiveGames/TransferLab/TransferScenariosModal';
import { FairytaleIslandMap } from '../components/ChildIsland/FairytaleIslandMap';
import { ParentDashboard } from '../components/ParentCoach/ParentDashboard';
import { speechNarrator } from '../utils/speech';
import { sounds } from '../utils/sound';

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
    findButtonByAriaLabel(labelSubstring: string) {
      return (
        findAll(
          (n) =>
            n.type === 'button' &&
            typeof n.props['aria-label'] === 'string' &&
            n.props['aria-label'].includes(labelSubstring)
        )[0] || null
      );
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

describe('Sprint 1 Vertical Slice: 6-Layer Thinking Detective Loop, Internal Playtest, Audio & Island Map', () => {
  const storageMap = new Map<string, string>();

  beforeEach(() => {
    storageMap.clear();
    (globalThis as any).window = (globalThis as any).window || {};
    (globalThis as any).window.localStorage = {
      getItem: (k: string) => (storageMap.has(k) ? storageMap.get(k)! : null),
      setItem: (k: string, v: string) => storageMap.set(k, String(v)),
      removeItem: (k: string) => storageMap.delete(k),
      clear: () => storageMap.clear(),
    };
    (globalThis as any).localStorage = (globalThis as any).window.localStorage;
    resetParentPinForTesting();
    resetProductExperienceMetrics();
    ContentAuditRegistry.resetToDefault();
  });

  afterEach(() => {
    resetParentPinForTesting();
    resetProductExperienceMetrics();
  });

  it('provides at least 2 distinct cases per theme with different coordinates and non-spoiling observationPrompts', () => {
    const themes = ['drawing', 'sports', 'nature', 'puzzle'] as const;
    for (const theme of themes) {
      const cases = getThemedScenarioCasesByInterest(theme);
      expect(cases.length).toBeGreaterThanOrEqual(2);
      const case0 = getThemedScenarioCase(theme, 0);
      const case1 = getThemedScenarioCase(theme, 1);
      expect(case0.id).not.toBe(case1.id);
      expect(case0.sceneTitle).not.toBe(case1.sceneTitle);
      expect(case0.hotspots[0].xPercent).not.toBe(case1.hotspots[0].xPercent);
      for (const ev of [...case0.hotspots, ...case1.hotspots]) {
        expect(ev.observationPrompt).toBeTruthy();
        expect(ev.observationPrompt).not.toContain('所以这只是');
        expect(ev.observationPrompt).not.toContain('这是眼睛亲眼看到的事实');
      }
    }
  });

  it('completes the 4-stage CrayonDetectiveGame loop with initial judgment, lead investigation, clue sorting, hypothesis revision, and case switching', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <CrayonDetectiveGame onExit={() => {}} />
      </AppProvider>
    );

    // Stage 1: Initial hypothesis includes "现在证据还不够，我还不知道"
    expect(view.findByTestId('detective-step-hypothesis')).toBeTruthy();
    const unknownBtn = view.findButtonByText('现在证据还不够，我还不知道');
    expect(unknownBtn).toBeTruthy();
    view.click(unknownBtn);

    let metrics = getProductExperienceMetrics();
    expect(metrics.unknownHonestyCount).toBe(1);

    // Stage 2: Investigation leads appear
    expect(view.findByTestId('detective-step-leads')).toBeTruthy();

    // Unlock hotspots by clicking them on the SVG scene (2 taps if requiresObjectReveal)
    const currentCase = getThemedScenarioCase('drawing', 0);
    for (const spot of currentCase.hotspots) {
      const hotspotBtn = view.findByTestId(`scene-hotspot-${spot.id}`);
      expect(hotspotBtn).toBeTruthy();
      view.click(hotspotBtn);
      if (spot.requiresObjectReveal) {
        const revealedHotspotBtn = view.findByTestId(`scene-hotspot-${spot.id}`);
        view.click(revealedHotspotBtn);
      }
    }

    // Sort at least one discovered clue into its matching basket
    view.click(view.findByTestId('scene-hotspot-hs_curtain'));
    const quickSortBtn = view.findByTestId('quick-sort-hs_curtain-EYES_OBSERVED');
    expect(quickSortBtn).toBeTruthy();
    view.click(quickSortBtn);

    // Hypothesis revision step appears once >= 2 clues are discovered
    expect(view.findByTestId('detective-step-revise')).toBeTruthy();
    const reviseBtn = view.findByTestId('revise-hypothesis-hyp_rolled_away');
    expect(reviseBtn).toBeTruthy();
    view.click(reviseBtn);

    metrics = getProductExperienceMetrics();
    expect(metrics.hypothesisRevisionCount).toBeGreaterThanOrEqual(1);

    // Stage 3b: Choose next action and observe consequence
    const nextActionBtn = view.findByTestId('next-action-act_pickup_and_apologize');
    expect(nextActionBtn).toBeTruthy();
    view.click(nextActionBtn);
    expect(view.findByTestId('detective-action-consequence')).toBeTruthy();

    // Stage 4: Open Detective Synthesis Modal after meaningful completion
    const synthesisBtn = view.findByTestId('open-detective-synthesis-btn');
    expect(synthesisBtn).toBeTruthy();
    view.click(synthesisBtn);

    metrics = getProductExperienceMetrics();
    expect(metrics.completedDetectiveCaseIds).toContain(currentCase.id);

    // Switch to Case 2 from the synthesis modal
    const nextCaseBtn = view.findByTestId('try-next-detective-case');
    expect(nextCaseBtn).toBeTruthy();
    view.click(nextCaseBtn);
    const secondCase = getThemedScenarioCase('drawing', 1);
    expect(view.getText()).toContain(secondCase.sceneTitle);

    view.unmount();
  });

  it('supports PIN-gated Internal Playtest Mode across games without falsifying ContentAuditRegistry PENDING status', () => {
    expect(isInternalPlaytestEnabled()).toBe(false);
    expect(ContentAuditRegistry.canRenderContent('SCENE_A_PEER_ASKING_RESIDENCE_V1')).toBe(false);

    grantParentAccess();
    const enabled = enableInternalPlaytestMode();
    expect(enabled).toBe(true);
    expect(isInternalPlaytestEnabled()).toBe(true);

    // ContentAuditRegistry remains fail-closed (never falsified)
    expect(ContentAuditRegistry.canRenderContent('SCENE_A_PEER_ASKING_RESIDENCE_V1')).toBe(false);
    expect(ContentAuditRegistry.canRenderContent('cup-size')).toBe(false);

    const view = createStatefulTestRenderer(
      <AppProvider>
        <InteractiveGamesHubModal isOpen={true} onClose={() => {}} initialGame="detective" />
      </AppProvider>
    );

    expect(view.findByTestId('exit-internal-playtest-btn')).toBeTruthy();

    // Exiting internal playtest mode immediately revokes continuous preview
    disableInternalPlaytestMode();
    expect(isInternalPlaytestEnabled()).toBe(false);

    // Locking parent access also revokes playtest mode
    enableInternalPlaytestMode();
    issueAdultPreviewSession('game-crayon-detective');
    lockParentAccess();
    expect(isInternalPlaytestEnabled()).toBe(false);

    view.unmount();
  });

  it('resets adultPromptCount to 0 when resetting or switching scenarios in TransferScenariosModal', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <TransferScenariosModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // Click adult prompt button once
    const promptBtn = view.findButtonByText('+ 记录一次大人提示');
    expect(promptBtn).toBeTruthy();
    view.click(promptBtn);
    expect(view.findByTestId('adult-prompt-count-value')?.text.replace(/\s+/g, '')).toBe('1次');

    // Switch to another scenario tab -> adultPromptCount must reset to 0
    const secondScenarioTab = view.findAll(
      (n) => n.type === 'button' && n.text.replace(/\s+/g, '').includes('情境2')
    )[0];
    expect(secondScenarioTab).toBeTruthy();
    view.click(secondScenarioTab);
    expect(view.findByTestId('adult-prompt-count-value')?.text.replace(/\s+/g, '')).toBe('0次');

    view.unmount();
  });

  it('modulates all 4 companion audio personas and ducks SFX during active narration', () => {
    const fox = speechNarrator.getCompanionAudioModulation('playful-buddy', 'warm-sister');
    const bear = speechNarrator.getCompanionAudioModulation('warm-sister', 'warm-sister');
    const rabbit = speechNarrator.getCompanionAudioModulation('gentle-guide', 'warm-sister');
    const otter = speechNarrator.getCompanionAudioModulation('starlight-companion', 'warm-sister');

    expect(fox.playbackRate).toBeGreaterThan(bear.playbackRate);
    expect(rabbit.playbackRate).toBeLessThan(otter.playbackRate);
    expect(fox.preservesPitch).toBe(false);

    sounds.setSpeechDucking(true);
    expect(sounds.getSpeechDucking()).toBe(true);
    sounds.setSpeechDucking(false);
    expect(sounds.getSpeechDucking()).toBe(false);
  });

  it('renders FairytaleIslandMap with 8 spaces, independent >=56px entry & read-aloud buttons, progress summary, and direct onOpenBreaker callback', () => {
    let breakerOpened = false;
    const view = createStatefulTestRenderer(
      <FairytaleIslandMap
        onOpenBreaker={() => {
          breakerOpened = true;
        }}
        completedStoriesCount={2}
        completedDetectiveCasesCount={3}
        sunCount={4}
        rainCount={2}
      />
    );

    expect(view.getText()).toContain('童话小岛八大探索空间直接进入');
    const progressSummary = view.findByTestId('island-progress-summary');
    const normalizedProgress = progressSummary?.text.replace(/\s+/g, ' ') || '';
    expect(normalizedProgress).toContain('已破案 3 起');
    expect(normalizedProgress).toContain('已读故事 2 篇');

    const readButtons = view.findAll(
      (n) =>
        n.type === 'button' &&
        typeof n.props['aria-label'] === 'string' &&
        n.props['aria-label'].startsWith('朗读') &&
        n.props['aria-label'].endsWith('介绍')
    );
    expect(readButtons.length).toBeGreaterThanOrEqual(8);
    for (const btn of readButtons) {
      expect(btn.props.className).toContain('min-w-[56px]');
      expect(btn.props.className).toContain('min-h-[56px]');
    }

    const breakerBtn = view.findButtonByAriaLabel('进入大困难拆解台');
    expect(breakerBtn).toBeTruthy();
    view.click(breakerBtn);
    expect(breakerOpened).toBe(true);

    view.unmount();
  });

  it('shows explicit "尚无记录" in ParentDashboard when no experience metrics exist and displays real counts after recording', () => {
    resetProductExperienceMetrics();
    expect(hasRecordedExperienceMetrics(getProductExperienceMetrics())).toBe(false);

    const emptyView = createStatefulTestRenderer(
      <AppProvider>
        <ParentDashboard />
      </AppProvider>
    );
    const insightsTabEmpty = emptyView.findButtonByText('趋势信号看板');
    expect(insightsTabEmpty).toBeTruthy();
    emptyView.click(insightsTabEmpty);
    expect(emptyView.findByTestId('parent-cognitive-process-empty')).toBeTruthy();
    expect(emptyView.getText()).toContain('尚无记录');
    emptyView.unmount();

    recordUnknownHonestyChoice();
    expect(hasRecordedExperienceMetrics(getProductExperienceMetrics())).toBe(true);

    const activeView = createStatefulTestRenderer(
      <AppProvider>
        <ParentDashboard />
      </AppProvider>
    );
    const insightsTabActive = activeView.findButtonByText('趋势信号看板');
    expect(insightsTabActive).toBeTruthy();
    activeView.click(insightsTabActive);
    expect(activeView.findByTestId('parent-cognitive-process-metrics')).toBeTruthy();
    expect(activeView.findByTestId('parent-cognitive-process-empty')).toBeNull();
    expect(activeView.getText()).toContain('新证据后修正判断');
    activeView.unmount();
  });
});

