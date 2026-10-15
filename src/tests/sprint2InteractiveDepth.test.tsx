import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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

describe('Sprint 2 Interactive Depth — FriendAsksHomeGame, ToyBoatNegotiationGame & Island Linkage', () => {
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
    disableInternalPlaytestMode();
    lockParentAccess();
    resetParentPinForTesting();
    resetProductExperienceMetrics();
  });

  it('FriendAsksHomeGame covers 5 peer scenarios and 7 expression modes, with realistic non-instant peer reactions and session resume', () => {
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

    // Scenario 1: Curious friend asking -> Round 1 choose DIRECT_ANSWER
    expect(view.findByTestId('friend-dialogue-round-badge')?.text.replace(/\s+/g, '')).toContain('第1轮互动');
    view.click(view.findByTestId('dialogue-option-opt_c1_direct'));

    // Round 2: Peer does NOT immediately drop it — continues probing about toys!
    expect(view.findByTestId('friend-dialogue-round-badge')?.text.replace(/\s+/g, '')).toContain('第2轮互动');
    expect(view.findByTestId('peer-current-speech')?.text).toContain('那你的玩具和画笔放哪边呀');

    // Child sets boundary in Round 2 -> reaches Round 3 terminal state
    view.click(view.findByTestId('dialogue-option-opt_c1_r2_boundary'));
    expect(view.findByTestId('friend-scenario-terminal-card')).toBeTruthy();

    // Switch to Scenario 2: Repeated privacy probing by classmate Doudou
    view.click(view.findByTestId('friend-scenario-tab-scenario_probing_classmate_drawing'));
    expect(view.findByTestId('peer-current-speech')?.text).toContain('你为什么画了两个家呀');

    // State boundary in Round 1 -> Doudou grumbles ("小气鬼") in Round 2 instead of apologizing immediately!
    view.click(view.findByTestId('dialogue-option-opt_p1_boundary'));
    expect(view.findByTestId('peer-current-speech')?.text).toContain('小气鬼');

    // Unmount and remount -> verifies session state is restored at Round 2 of Scenario 2!
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

    resumedView.unmount();
  });

  it('ToyBoatNegotiationGame supports movable boat zones, turn order, real 3s/5s durations, 2 conflict tasks, and island/companion linkage', () => {
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

    // 1. Move boat to BEAR_DOCK
    view.click(view.findByTestId('move-boat-zone-BEAR_DOCK'));
    expect(view.findByTestId('move-boat-zone-BEAR_DOCK')?.props['data-has-boat']).toBe('true');

    // 2. Arrange Bear first, 5s duration, empty-handed wait -> Rabbit becomes LOW_FRUSTRATED
    view.click(view.findByTestId('order-actor-bear'));
    view.click(view.findByTestId('duration-seconds-5'));
    view.click(view.findByTestId('waiting-activity-wait_empty_hands'));
    expect(view.findByTestId('rabbit-reaction-card')?.props['data-satisfaction']).toBe('LOW_FRUSTRATED');

    // 3. Switch to 3s duration + sand digger exchange -> both become HIGH_SATISFIED
    view.click(view.findByTestId('duration-seconds-3'));
    view.click(view.findByTestId('strategy-option-EXCHANGE_ALT'));
    expect(view.findByTestId('rabbit-reaction-card')?.props['data-satisfaction']).toBe('HIGH_SATISFIED');
    expect(view.findByTestId('bear-reaction-card')?.props['data-satisfaction']).toBe('HIGH_SATISFIED');

    // 4. Execute plan -> Round 1 -> Round 2 -> Observed Result
    view.click(view.findByTestId('execute-negotiation-plan-btn'));
    expect(view.findByTestId('boat-execution-status-badge')?.props['data-phase']).toBe('RUNNING');
    view.click(view.findByTestId('advance-negotiation-round-btn'));
    view.click(view.findByTestId('advance-negotiation-round-btn'));
    expect(view.findByTestId('boat-execution-status-badge')?.props['data-phase']).toBe('OBSERVED_RESULT');
    expect(view.findByTestId('negotiation-observed-complete-badge')).toBeTruthy();

    // 5. Switch to Task 2 (Limited Resource Cooperation) and execute
    view.click(view.findByTestId('boat-task-tab-task_limited_resource_coop'));
    view.click(view.findByTestId('execute-negotiation-plan-btn'));
    view.click(view.findByTestId('advance-negotiation-round-btn'));
    view.click(view.findByTestId('advance-negotiation-round-btn'));
    expect(view.findByTestId('toy-boat-completed-count')?.text.replace(/\s+/g, '')).toContain('已完成2/2个协商任务');
    view.unmount();

    // 6. Verify FairytaleIslandMap and CompanionBanner reflect the child's choices!
    const islandView = createStatefulTestRenderer(
      <AppProvider>
        <CompanionBanner />
        <FairytaleIslandMap />
      </AppProvider>
    );
    expect(islandView.findByTestId('companion-session-memory')).toBeTruthy();
    expect(islandView.findByTestId('companion-session-memory')?.text).toContain('浅水溪湾的松果渡船挑战');
    expect(islandView.findByTestId('island-toy-boat-progress-badge')?.text.replace(/\s+/g, '')).toContain('小船协商2项');
    expect(islandView.findByTestId('island-world-reaction-banner')?.text.replace(/\s+/g, '')).toContain('双向桥溪流的小木船完成了2次协商试航');

    islandView.unmount();
  });
});
