import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { FriendAsksHomeGame } from '../components/InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame';
import { ToyBoatNegotiationGame } from '../components/InteractiveGames/ToyBoatNegotiationGame/ToyBoatNegotiationGame';
import { StoryGroveModal } from '../components/ChildIsland/StoryGrove/StoryGroveModal';
import { FairytaleIslandMap } from '../components/ChildIsland/FairytaleIslandMap';
import {
  FRIEND_HOME_SCENARIOS,
  composeScenario1TurnOption,
  resolveScenarioContextSummary,
  resolveNodeFramedContent,
  resolveOptionFramedText,
  ComposerAmount,
  ComposerTone,
  ComposerTopic,
} from '../domain/games/friendAsksHomeLogic';
import {
  INTERACTIVE_STORY_LEAVES,
  STORY_GROVE_CAMP_TRANSFER_CHALLENGE,
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

describe('Sprint 3 Fairytale World & Cognitive Transfer Deep R&D', () => {
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

  it('A1 Negative & Combinatorial Test: 3D Expression Composer executes child intent independently and NEVER silently maps ADULT to ordinary boundary', () => {
    const amounts: ComposerAmount[] = ['DIRECT', 'PARTIAL', 'HOLD'];
    const tones: ComposerTone[] = ['GENTLE', 'ASK_BACK', 'FIRM'];
    const topics: ComposerTopic[] = ['PICKUP', 'PLAY_TOPIC', 'ADULT', 'PAUSE'];

    // Verify all 36 combinations in both Round 1 and Round 2
    for (const amount of amounts) {
      for (const tone of tones) {
        for (const topic of topics) {
          const composedR1 = composeScenario1TurnOption(amount, tone, topic, 1);
          const composedR2 = composeScenario1TurnOption(amount, tone, topic, 2);

          // Negative test requirement: Choosing ADULT must NEVER degrade to STATE_BOUNDARY
          if (topic === 'ADULT') {
            expect(composedR1.mode).toBe('SEEK_ADULT_HELP');
            expect(composedR1.nextNodeId).toBe('round3_adult_comfort');
            expect(composedR1.childSpokenText).toContain('老师');

            expect(composedR2.mode).toBe('SEEK_ADULT_HELP');
            expect(composedR2.nextNodeId).toBe('round3_adult_comfort');
          }

          if (topic === 'PAUSE') {
            expect(composedR1.mode).toBe('PAUSE_CONVERSATION');
            expect(composedR1.nextNodeId).toBe('round3_paused_safely');
            expect(composedR2.mode).toBe('PAUSE_CONVERSATION');
            expect(composedR2.nextNodeId).toBe('round3_paused_safely');
          }

          if (topic === 'PLAY_TOPIC') {
            expect(composedR1.nextNodeId).toBe('round2_after_topic');
            expect(composedR2.nextNodeId).toBe('round3_topic_shifted');
          }
        }
      }
    }

    // Verify in live FriendAsksHomeGame UI: selecting HOLD + FIRM + ADULT executes SEEK_ADULT_HELP -> round3_adult_comfort
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <FriendAsksHomeGame onExit={() => {}} />
      </AppProvider>
    );

    view.click(view.findByTestId('composer-amount-HOLD'));
    view.click(view.findByTestId('composer-tone-FIRM'));
    view.click(view.findByTestId('composer-topic-ADULT'));

    const applyBtn = view.findByTestId('apply-composed-expression-btn');
    expect(applyBtn?.props['data-composed-mode']).toBe('SEEK_ADULT_HELP');
    expect(applyBtn?.props['data-composed-next-node']).toBe('round3_adult_comfort');

    view.click(applyBtn);
    expect(view.findByTestId('friend-scenario-terminal-card')).toBeTruthy();
    expect(view.findByTestId('peer-current-speech')?.text).toContain('随时可以来找妈妈');

    view.unmount();
  });

  it('A2 Structured Framing Test: OWN_EXPRESSION mode removes forced two-homes assumptions across all 5 scenarios and non-initial branches', () => {
    const forbiddenTwoHomesPhrases = ['两个家', '妈妈家', '爸爸家', '周三换家', '两个不同的家'];

    for (const scenario of FRIEND_HOME_SCENARIOS) {
      const ownSummary = resolveScenarioContextSummary(scenario, 'OWN_EXPRESSION', false);
      for (const phrase of forbiddenTwoHomesPhrases) {
        expect(ownSummary).not.toContain(phrase);
      }

      for (const [nodeId, node] of Object.entries(scenario.nodes)) {
        const framedNode = resolveNodeFramedContent(node, 'OWN_EXPRESSION', false);
        for (const phrase of forbiddenTwoHomesPhrases) {
          expect(framedNode.peerSpokenText, `${scenario.id}:${nodeId} peerSpokenText`).not.toContain(phrase);
          expect(framedNode.sceneActionNote, `${scenario.id}:${nodeId} sceneActionNote`).not.toContain(phrase);
          expect(framedNode.cognitiveReflectionNote, `${scenario.id}:${nodeId} cognitiveReflectionNote`).not.toContain(
            phrase
          );
          expect(framedNode.speakerName, `${scenario.id}:${nodeId} speakerName`).not.toContain(phrase);
        }

        for (const opt of node.options || []) {
          const framedText = resolveOptionFramedText(opt, 'OWN_EXPRESSION', false);
          for (const phrase of forbiddenTwoHomesPhrases) {
            expect(framedText.childSpokenText, `${scenario.id}:${nodeId}:${opt.id}`).not.toContain(phrase);
          }
        }
      }
    }

    // Traverse 2 non-initial branches in OWN_EXPRESSION mode in the rendered game
    grantParentAccess();
    enableInternalPlaytestMode();

    const view = createStatefulTestRenderer(
      <AppProvider>
        <FriendAsksHomeGame onExit={() => {}} />
      </AppProvider>
    );

    view.click(view.findByTestId('framing-mode-OWN_EXPRESSION'));
    // Branch 1: Scenario 1 Round 1 -> Round 2 (partial) -> Round 3
    view.click(view.findByTestId('dialogue-option-opt_c1_partial'));
    expect(view.findByTestId('friend-dialogue-round-badge')?.text.replace(/\s+/g, '')).toContain('第2轮互动');
    expect(view.findByTestId('peer-current-speech')?.text).not.toContain('两个家');
    view.click(view.findByTestId('dialogue-option-opt_c1_p2_boundary'));
    expect(view.findByTestId('friend-scenario-terminal-card')).toBeTruthy();
    expect(view.findByTestId('peer-current-speech')?.text).not.toContain('两个家');

    // Branch 2: Scenario 3 (Misunderstanding) Round 1 -> Round 2 -> Round 3 in OWN_EXPRESSION mode
    view.click(view.findByTestId('friend-scenario-tab-scenario_misunderstanding_peer_playground'));
    expect(view.findByTestId('peer-current-speech')?.text).toContain('开放日活动');
    view.click(view.findByTestId('dialogue-option-opt_m1_direct'));
    expect(view.findByTestId('friend-dialogue-round-badge')?.text.replace(/\s+/g, '')).toContain('第2轮互动');
    expect(view.findByTestId('peer-current-speech')?.text).not.toContain('两个家');
    view.click(view.findByTestId('dialogue-option-opt_m2_partial'));
    expect(view.findByTestId('friend-scenario-terminal-card')).toBeTruthy();
    expect(view.findByTestId('peer-current-speech')?.text).not.toContain('两个家');

    view.unmount();
  });

  it('A3 & A4: Distinguishes PAUSED_VOLUNTARILY vs SCENARIO_COMPLETED vs EXPRESSIVE_ACTION_ATTEMPTED, and hides ToyBoat satisfaction until after execution', () => {
    grantParentAccess();
    enableInternalPlaytestMode();

    const friendView = createStatefulTestRenderer(
      <AppProvider>
        <FriendAsksHomeGame onExit={() => {}} />
      </AppProvider>
    );

    // Round 1 choice -> records EXPRESSIVE_ACTION_ATTEMPTED (neither paused nor completed)
    friendView.click(friendView.findByTestId('dialogue-option-opt_c1_direct'));
    let metrics = getPlaytestExperienceMetrics();
    expect(metrics.friendHomeScenarioStatuses['scenario_curious_friend_pickup']).toBe(
      'EXPRESSIVE_ACTION_ATTEMPTED'
    );
    expect(metrics.completedFriendHomeScenarioIds).toEqual([]);
    expect(metrics.pausedFriendHomeScenarioIds).toEqual([]);

    // Click voluntary pause in Round 2 -> records PAUSED_VOLUNTARILY
    friendView.click(friendView.findByTestId('pause-conversation-anytime-btn'));
    metrics = getPlaytestExperienceMetrics();
    expect(metrics.friendHomeScenarioStatuses['scenario_curious_friend_pickup']).toBe(
      'PAUSED_VOLUNTARILY'
    );
    expect(metrics.pausedFriendHomeScenarioIds).toEqual(['scenario_curious_friend_pickup']);
    expect(metrics.completedFriendHomeScenarioIds).toEqual([]);
    friendView.unmount();

    // A4: ToyBoatNegotiationGame hides post-execution satisfaction in PLANNING, lets child predict, and reveals after execution
    const boatView = createStatefulTestRenderer(
      <AppProvider>
        <ToyBoatNegotiationGame onExit={() => {}} />
      </AppProvider>
    );

    expect(boatView.findByTestId('rabbit-reaction-card')?.props['data-satisfaction']).toBe(
      'PENDING_OBSERVATION'
    );
    expect(boatView.findByTestId('bear-reaction-card')?.props['data-satisfaction']).toBe(
      'PENDING_OBSERVATION'
    );

    // Child makes a prediction before running
    boatView.click(boatView.findByTestId('predict-outcome-BOTH_HAPPY'));
    expect(boatView.findByTestId('predict-outcome-BOTH_HAPPY')?.props['data-selected']).toBe('true');

    // Execute and advance 2 rounds
    boatView.click(boatView.findByTestId('strategy-option-EXCHANGE_ALT'));
    boatView.click(boatView.findByTestId('execute-negotiation-plan-btn'));
    expect(boatView.findByTestId('rabbit-reaction-card')?.props['data-satisfaction']).toBe(
      'PENDING_OBSERVATION'
    );

    boatView.click(boatView.findByTestId('advance-negotiation-round-btn'));
    boatView.click(boatView.findByTestId('advance-negotiation-round-btn'));

    expect(boatView.findByTestId('rabbit-reaction-card')?.props['data-satisfaction']).toBe(
      'HIGH_SATISFIED'
    );
    expect(boatView.findByTestId('bear-reaction-card')?.props['data-satisfaction']).toBe(
      'HIGH_SATISFIED'
    );
    expect(boatView.findByTestId('prediction-vs-observation-banner')).toBeTruthy();

    boatView.unmount();
  });

  it('Stage B & Stage C: StoryGroveModal interactive fairy-tale leaves (cup-size, toy-share) and cross-game camp transfer challenge with island linkage', () => {
    expect(INTERACTIVE_STORY_LEAVES['cup-size'].hotspots.length).toBeGreaterThanOrEqual(3);
    expect(INTERACTIVE_STORY_LEAVES['cup-size'].actions.length).toBeGreaterThanOrEqual(2);
    expect(INTERACTIVE_STORY_LEAVES['toy-share'].hotspots.length).toBeGreaterThanOrEqual(3);
    expect(INTERACTIVE_STORY_LEAVES['toy-share'].actions.length).toBeGreaterThanOrEqual(2);

    // Ensure Stage C transfer actions do NOT pre-label which cognitive tool ("侦探", "边界", "协商") to use
    for (const act of STORY_GROVE_CAMP_TRANSFER_CHALLENGE.actions) {
      expect(act.label).not.toContain('侦探');
      expect(act.label).not.toContain('边界表达');
      expect(act.label).not.toContain('小船协商');
    }

    grantParentAccess();
    enableInternalPlaytestMode();

    const groveView = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // 1. Stage B: Open cup-size interactive leaf
    groveView.click(groveView.findByTestId('story-catalog-leaf-cup-size'));
    expect(groveView.findByTestId('interactive-leaf-view-cup-size')).toBeTruthy();
    expect(groveView.findByTestId('interactive-leaf-scene-cup-size')?.props['data-scene-effect']).toBe(
      'INITIAL_OBSERVE'
    );

    // Inspect 2 scene objects
    groveView.click(groveView.findByTestId('story-hotspot-obj_wooden_block'));
    expect(groveView.findByTestId('story-hotspot-observation-card')?.text).toContain('小积木');
    groveView.click(groveView.findByTestId('story-hotspot-obj_elephant_bucket'));
    expect(groveView.findByTestId('story-inspected-counter')?.text.replace(/\s+/g, '')).toContain('2/4');

    // Try one-sided action first -> sees Pupu upset -> revises action to compare both sides
    groveView.click(groveView.findByTestId('story-action-act_only_look_squirrel'));
    expect(groveView.findByTestId('interactive-leaf-scene-cup-size')?.props['data-scene-effect']).toBe(
      'SINGLE_SIDE_ONLY'
    );
    expect(groveView.findByTestId('story-revise-action-btn')).toBeTruthy();

    groveView.click(groveView.findByTestId('story-revise-action-btn'));
    groveView.click(groveView.findByTestId('story-action-act_compare_both_sides'));
    expect(groveView.findByTestId('interactive-leaf-scene-cup-size')?.props['data-scene-effect']).toBe(
      'COMPARE_BOTH'
    );
    expect(groveView.findByTestId('story-revised-badge')).toBeTruthy();
    expect(groveView.findByTestId('story-island-linkage-banner')).toBeTruthy();

    groveView.unmount();

    const transferView = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );
    transferView.click(transferView.findByTestId('open-camp-transfer-challenge'));
    expect(transferView.findByTestId('story-grove-transfer-challenge-view')).toBeTruthy();

    // Child inspects window shadow and pinecone branch
    transferView.click(transferView.findByTestId('camp-hotspot-camp_obj_window_shadow'));
    transferView.click(transferView.findByTestId('camp-hotspot-camp_obj_pinecone_branch'));
    expect(transferView.findByTestId('camp-transfer-clue-counter')?.text.replace(/\s+/g, '')).toContain('2/4');

    // Child initially tries panic/grabbing flashlight -> observes conflict consequence -> revises method
    transferView.click(transferView.findByTestId('camp-action-camp_act_guess_monster_scream'));
    expect(transferView.findByTestId('camp-transfer-svg-scene')?.props['data-camp-outcome']).toBe(
      'PANIC_CONFLICT'
    );
    transferView.click(transferView.findByTestId('camp-revise-method-btn'));
    transferView.click(transferView.findByTestId('camp-action-camp_act_shine_light_check_branch'));
    expect(transferView.findByTestId('camp-transfer-svg-scene')?.props['data-camp-outcome']).toBe(
      'SHADOW_REVEALED'
    );
    expect(transferView.findByTestId('camp-method-revised-badge')).toBeTruthy();

    // Complete the remaining 2 goals (PERSONAL_BOUNDARY and SHARED_RESOURCE) for full composite transfer completion
    transferView.click(transferView.findByTestId('camp-hotspot-camp_obj_whispering_peer'));
    transferView.click(transferView.findByTestId('camp-action-camp_act_state_comfort_boundary'));
    transferView.click(transferView.findByTestId('camp-hotspot-camp_obj_single_flashlight'));
    transferView.click(transferView.findByTestId('camp-action-camp_act_share_flashlight_roles'));
    expect(transferView.findByTestId('camp-return-island-btn')).toBeTruthy();

    transferView.unmount();

    // Verify FairytaleIslandMap renders visible Story Grove fruits & camp transfer lantern
    const islandView = createStatefulTestRenderer(
      <AppProvider>
        <FairytaleIslandMap />
      </AppProvider>
    );
    expect(islandView.findByTestId('island-svg-story-grove-fruits')).toBeTruthy();
    expect(islandView.findByTestId('island-svg-camp-transfer-lantern')).toBeTruthy();
    islandView.unmount();
  });
});
