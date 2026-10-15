import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { FriendAsksHomeGame } from '../components/InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame';
import { ToyBoatNegotiationGame } from '../components/InteractiveGames/ToyBoatNegotiationGame/ToyBoatNegotiationGame';
import { FairytaleIslandMap } from '../components/ChildIsland/FairytaleIslandMap';
import { CompanionBanner } from '../components/ChildIsland/CompanionBanner';
import {
  FRIEND_HOME_SCENARIOS,
  EXPRESSION_MODE_META,
} from '../domain/games/friendAsksHomeLogic';
import {
  TOY_BOAT_TASKS,
  evaluateNegotiationPlan,
} from '../domain/games/toyBoatNegotiationLogic';
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

describe('Sprint 2 & Sprint 2.1 Interactive Depth — FriendAsksHomeGame, ToyBoatNegotiationGame & Island Linkage', () => {
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
        matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
        scrollTo: () => {},
      },
      configurable: true,
    });

    ContentAuditRegistry.resetToDefault();
    resetParentPinForTesting();
    disableInternalPlaytestMode();
    resetProductExperienceMetrics();
  });

  afterEach(() => {
    vi.useRealTimers();
    disableInternalPlaytestMode();
    lockParentAccess();
    resetParentPinForTesting();
    resetProductExperienceMetrics();
  });

  it('FriendAsksHomeGame covers 5 peer scenarios, 7 expression modes, per-scenario progress preservation (A -> B -> A), and framing protection (P1-C / P1-D)', () => {
    expect(FRIEND_HOME_SCENARIOS.length).toBe(5);
    expect(Object.keys(EXPRESSION_MODE_META)).toEqual([
      'DIRECT_ANSWER',
      'PARTIAL_ANSWER',
      'ASK_PEER',
      'CHANGE_TOPIC',
      'STATE_BOUNDARY',
      'PAUSE_CONVERSATION',
      'SEEK_ADULT_HELP',
    ]);

    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <FriendAsksHomeGame onExit={() => {}} />
      </AppProvider>
    );

    // P1-C: Framing selector defaults to STORY_CHILD and switching to OWN_EXPRESSION uses neutral family wording when two-homes schedule is not configured
    expect(view.findByTestId('active-framing-status')?.props['data-framing-mode']).toBe('STORY_CHILD');
    view.click(view.findByTestId('framing-mode-OWN_EXPRESSION'));
    expect(view.findByTestId('active-framing-status')?.props['data-framing-mode']).toBe('OWN_EXPRESSION');
    expect(view.findByTestId('active-framing-status')?.props['data-two-homes-configured']).toBe('false');
    expect(view.findByTestId('dialogue-option-opt_c1_direct')?.text).toContain('因为我们家每天接送的安排不一样');

    // Switch back to STORY_CHILD to test Scenario 1 Round 1 -> Round 2
    view.click(view.findByTestId('framing-mode-STORY_CHILD'));
    expect(view.findByTestId('scenario1-expression-composer')).toBeTruthy();
    expect(view.findByTestId('friend-dialogue-round-badge')?.text.replace(/\s+/g, '')).toContain('第1轮互动');
    view.click(view.findByTestId('dialogue-option-opt_c1_direct'));

    // Round 2: Peer does NOT immediately drop it — continues probing about toys!
    expect(view.findByTestId('friend-dialogue-round-badge')?.text.replace(/\s+/g, '')).toContain('第2轮互动');
    expect(view.findByTestId('peer-current-speech')?.text).toContain('那你的玩具和画笔放哪边呀');

    // P1-B: While Scenario 1 is at Round 2 (not yet completed), companion memory eventStage is ARRANGED_OR_STARTED
    expect(getPlaytestExperienceMetrics().latestCompanionMemory?.eventStage).toBe('ARRANGED_OR_STARTED');

    // P1-C: Switch from Scenario 1 (at Round 2) -> Scenario 2 (at Round 1) -> back to Scenario 1
    // Scenario 1 MUST preserve its Round 2 progress instead of resetting!
    view.click(view.findByTestId('friend-scenario-tab-scenario_probing_classmate_drawing'));
    expect(view.findByTestId('friend-dialogue-round-badge')?.text.replace(/\s+/g, '')).toContain('第1轮互动');
    expect(view.findByTestId('scenario2-boundary-loop-panel')).toBeTruthy();
    expect(view.findByTestId('peer-reaction-visual-cue')?.text).toContain('胳膊肘撑在画纸边');

    // Switch back to Scenario 1 -> verify Round 2 is restored!
    view.click(view.findByTestId('friend-scenario-tab-scenario_curious_friend_pickup'));
    expect(view.findByTestId('friend-dialogue-round-badge')?.text.replace(/\s+/g, '')).toContain('第2轮互动');
    expect(view.findByTestId('peer-current-speech')?.text).toContain('那你的玩具和画笔放哪边呀');
    expect(view.findByTestId('friend-dialogue-history')?.text.replace(/\s+/g, '')).toContain('第1轮');

    // Complete Scenario 1 in Round 2 -> reaches Round 3 terminal state
    view.click(view.findByTestId('dialogue-option-opt_c1_r2_boundary'));
    expect(view.findByTestId('friend-scenario-terminal-card')).toBeTruthy();
    expect(getPlaytestExperienceMetrics().latestCompanionMemory?.eventStage).toBe('COMPLETED_OBSERVED');

    // Switch to Scenario 2: Repeated privacy probing by classmate Doudou
    view.click(view.findByTestId('friend-scenario-tab-scenario_probing_classmate_drawing'));
    expect(view.findByTestId('peer-current-speech')?.text).toContain('你为什么画了两个家呀');

    // State boundary in Round 1 -> Doudou grumbles ("小气鬼") in Round 2 instead of apologizing immediately!
    view.click(view.findByTestId('dialogue-option-opt_p1_boundary'));
    expect(view.findByTestId('peer-current-speech')?.text).toContain('小气鬼');

    // Unmount and remount -> verifies session state is restored at Round 2 of Scenario 2 AND Scenario 1 state is still in scenarioStatesById!
    view.unmount();

    const resumedView = createStatefulTestRenderer(
      <AppProvider>
        <FriendAsksHomeGame onExit={() => {}} />
      </AppProvider>
    );
    expect(resumedView.findByTestId('friend-dialogue-round-badge')?.text.replace(/\s+/g, '')).toContain('第2轮互动');
    expect(resumedView.findByTestId('peer-current-speech')?.text).toContain('小气鬼');

    // Test voluntary pause anytime is affirmed as a valid right, never judged as failure
    resumedView.click(resumedView.findByTestId('pause-conversation-anytime-btn'));
    expect(resumedView.findByTestId('voluntary-pause-affirmation')).toBeTruthy();
    expect(resumedView.getText()).toContain('你成功使用了「暂停对话」的权利');

    const metrics = getPlaytestExperienceMetrics();
    expect(metrics.completedFriendHomeScenarioIds).toContain('scenario_curious_friend_pickup');
    expect(metrics.completedFriendHomeScenarioIds).toContain('scenario_probing_classmate_drawing');
    expect(metrics.latestCompanionMemory?.gameId).toBe('friend_asks_home');
    expect(metrics.latestCompanionMemory?.eventStage).toBe('COMPLETED_OBSERVED');

    resumedView.unmount();
  });

  it('ToyBoatNegotiationGame P0-A & P0-B & P1-A & P1-B: natural countdown completion persists to storage, distinguishes timer vs manual early handoff, hides result before execution, and prevents Task 1 -> Task 2 false completion', () => {
    vi.useFakeTimers();
    expect(TOY_BOAT_TASKS.length).toBe(2);

    // Verify evaluation logic distinguishes empty-hand waiting frustration vs cooperative/exchange satisfaction
    const impatientEval = evaluateNegotiationPlan({
      taskId: 'task_turn_and_waiting',
      boatPositionZone: 'RABBIT_DOCK',
      firstTurnActor: 'rabbit',
      turnDurationSeconds: 5,
      planStrategy: 'TURN_WAIT',
      waitingActivityId: 'wait_empty_hands',
    });
    expect(impatientEval.rabbitSatisfaction).toBe('HIGH_SATISFIED');
    expect(impatientEval.bearSatisfaction).toBe('LOW_FRUSTRATED');

    const coopEval = evaluateNegotiationPlan({
      taskId: 'task_limited_resource_coop',
      boatPositionZone: 'CENTER_POND',
      firstTurnActor: 'both',
      turnDurationSeconds: 3,
      planStrategy: 'COOPERATE_ROLES',
      waitingActivityId: 'wait_cargo_crane',
    });
    expect(coopEval.rabbitSatisfaction).toBe('HIGH_SATISFIED');
    expect(coopEval.bearSatisfaction).toBe('HIGH_SATISFIED');

    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <ToyBoatNegotiationGame onExit={() => {}} />
      </AppProvider>
    );

    // Ensure no fake "3分钟" text exists anywhere in ToyBoatNegotiationGame
    expect(view.getText()).not.toContain('3分钟');
    expect(view.getText()).not.toContain('3 分钟');

    // P1-A: In PLANNING phase, 4D result panel MUST NOT be visible! Only expectation hint is shown.
    expect(view.findByTestId('boat-execution-status-badge')?.props['data-phase']).toBe('PLANNING');
    expect(view.findByTestId('planning-expectation-hint')).toBeTruthy();
    expect(view.findByTestId('negotiation-result-observation')).toBeNull();

    // 1. Move boat to BEAR_DOCK, arrange 3s duration + sand digger exchange
    view.click(view.findByTestId('move-boat-zone-BEAR_DOCK'));
    expect(view.findByTestId('move-boat-zone-BEAR_DOCK')?.props['data-has-boat']).toBe('true');
    view.click(view.findByTestId('order-actor-bear'));
    view.click(view.findByTestId('duration-seconds-3'));
    view.click(view.findByTestId('strategy-option-EXCHANGE_ALT'));

    // 2. Start execution -> RUNNING phase
    view.click(view.findByTestId('execute-negotiation-plan-btn'));
    expect(view.findByTestId('boat-execution-status-badge')?.props['data-phase']).toBe('RUNNING');
    // P1-A: Still no result observation panel during RUNNING!
    expect(view.findByTestId('negotiation-result-observation')).toBeNull();
    // P1-B: Companion memory records ARRANGED_OR_STARTED while running, NOT completed!
    expect(getPlaytestExperienceMetrics().latestCompanionMemory?.eventStage).toBe('ARRANGED_OR_STARTED');
    expect(getPlaytestExperienceMetrics().completedToyBoatTaskIds).toEqual([]);

    // 3. P0-A: Let the REAL 3-second countdown finish Round 1 -> Round 2 -> Observed Result naturally!
    for (let sec = 0; sec < 3; sec++) {
      vi.advanceTimersByTime(1000);
      view.rerender();
    }
    // After 3 seconds, Round 1 finishes and Round 2 starts automatically
    expect(view.findByTestId('boat-execution-status-badge')?.props['data-phase']).toBe('RUNNING');
    expect(view.findByTestId('boat-execution-status-badge')?.text.replace(/\s+/g, '')).toContain(
      '正在执行第2/2轮'
    );

    for (let sec = 0; sec < 3; sec++) {
      vi.advanceTimersByTime(1000);
      view.rerender();
    }
    // After another 3 seconds, Round 2 finishes naturally and persists FULL_WAIT_TIMER!
    expect(view.findByTestId('boat-execution-status-badge')?.props['data-phase']).toBe('OBSERVED_RESULT');
    expect(view.findByTestId('negotiation-result-observation')).toBeTruthy();
    expect(view.findByTestId('negotiation-observed-complete-badge')?.props['data-completion-mode']).toBe(
      'FULL_WAIT_TIMER'
    );
    expect(view.findByTestId('negotiation-observed-complete-badge')?.text).toContain('完整等待两轮倒计时结束');

    const metricsAfterTask1 = getPlaytestExperienceMetrics();
    expect(metricsAfterTask1.completedToyBoatTaskIds).toEqual(['task_turn_and_waiting']);
    expect(metricsAfterTask1.toyBoatTaskCompletionModes['task_turn_and_waiting']).toBe('FULL_WAIT_TIMER');
    expect(metricsAfterTask1.latestCompanionMemory?.eventStage).toBe('COMPLETED_OBSERVED');

    // P0-A Persistence check: Unmount and remount -> Task 1 OBSERVED_RESULT and FULL_WAIT_TIMER are restored from localStorage!
    view.unmount();
    const remountedView = createStatefulTestRenderer(
      <AppProvider>
        <ToyBoatNegotiationGame onExit={() => {}} />
      </AppProvider>
    );
    expect(remountedView.findByTestId('boat-execution-status-badge')?.props['data-phase']).toBe(
      'OBSERVED_RESULT'
    );
    expect(
      remountedView.findByTestId('negotiation-observed-complete-badge')?.props['data-completion-mode']
    ).toBe('FULL_WAIT_TIMER');

    // 4. P0-B Negative Test: Switch from completed Task 1 to Task 2 WITHOUT executing Task 2
    remountedView.click(remountedView.findByTestId('boat-task-tab-task_limited_resource_coop'));
    expect(remountedView.findByTestId('boat-execution-status-badge')?.props['data-phase']).toBe('PLANNING');
    expect(remountedView.findByTestId('negotiation-result-observation')).toBeNull();
    // Even if child clicks options in Task 2 planning phase, Task 2 MUST NOT be marked completed!
    remountedView.click(remountedView.findByTestId('duration-seconds-5'));
    const metricsAfterSwitch = getPlaytestExperienceMetrics();
    expect(metricsAfterSwitch.completedToyBoatTaskIds).toEqual(['task_turn_and_waiting']);
    expect(metricsAfterSwitch.completedToyBoatTaskIds).not.toContain('task_limited_resource_coop');

    // 5. Execute Task 2 using manual early handoff -> verify it records MANUAL_EARLY_HANDOFF and completes Task 2
    remountedView.click(remountedView.findByTestId('execute-negotiation-plan-btn'));
    remountedView.click(remountedView.findByTestId('advance-negotiation-round-btn'));
    remountedView.click(remountedView.findByTestId('advance-negotiation-round-btn'));
    expect(remountedView.findByTestId('boat-execution-status-badge')?.props['data-phase']).toBe(
      'OBSERVED_RESULT'
    );
    expect(
      remountedView.findByTestId('negotiation-observed-complete-badge')?.props['data-completion-mode']
    ).toBe('MANUAL_EARLY_HANDOFF');
    expect(remountedView.findByTestId('negotiation-observed-complete-badge')?.text).toContain(
      '主动提前交接完成'
    );
    expect(
      remountedView.findByTestId('toy-boat-completed-count')?.text.replace(/\s+/g, '')
    ).toContain('已完成2/2个协商任务');
    const finalBoatMetrics = getPlaytestExperienceMetrics();
    expect(finalBoatMetrics.completedToyBoatTaskIds).toEqual([
      'task_turn_and_waiting',
      'task_limited_resource_coop',
    ]);
    expect(finalBoatMetrics.toyBoatTaskCompletionModes['task_limited_resource_coop']).toBe(
      'MANUAL_EARLY_HANDOFF'
    );
    remountedView.unmount();

    // 6. P1-E: Verify FairytaleIslandMap renders visible SVG progress elements (sailing boat under bridge) and CompanionBanner reflects completion!
    const islandView = createStatefulTestRenderer(
      <AppProvider>
        <CompanionBanner />
        <FairytaleIslandMap />
      </AppProvider>
    );
    expect(islandView.findByTestId('companion-session-memory')).toBeTruthy();
    expect(islandView.findByTestId('companion-session-memory')?.props['data-event-stage']).toBe(
      'COMPLETED_OBSERVED'
    );
    expect(islandView.findByTestId('companion-session-memory')?.text).toContain('浅水溪湾的松果渡船挑战');
    expect(islandView.findByTestId('island-toy-boat-progress-badge')?.text.replace(/\s+/g, '')).toContain(
      '小船协商2项'
    );
    expect(islandView.findByTestId('island-svg-bridge-sailing-boat')).toBeTruthy();
    expect(islandView.findByTestId('island-svg-bridge-sailing-boat')?.props['data-completed-count']).toBe(
      '2'
    );

    islandView.unmount();
  });
});
