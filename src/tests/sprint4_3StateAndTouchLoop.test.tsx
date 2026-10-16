import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { speechNarrator } from '../utils/speech';
import { sounds } from '../utils/sound';
import { AppProvider } from '../context/AppContext';
import { resetPersonalizationProfile } from '../domain/personalization';
import {
  getChildSessionExperienceMetrics,
  resetProductExperienceMetrics,
} from '../domain/cognitive/productExperienceMetrics';
import {
  disableInternalPlaytestMode,
  resetParentPinForTesting,
} from '../domain/privacy/parentAccess';
import {
  createInitialTransitionExperienceState,
  interactWithSliceAObject,
  interactWithSliceBObject,
  investigateSliceCFearReason,
  executeTransitionAction,
  toggleTransitionFeeling,
  getSliceBSortingStatus,
  LELE_THIRD_PERSON_STORIES,
} from '../domain/transition/transitionExperienceEngine';
import { TwoHomesBridgeModal } from '../components/ChildIsland/TwoHomesBridge/TwoHomesBridgeModal';
import { DifficultyBreakerModal } from '../components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal';

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

  function renderNode(node: any, path: string): any {
    if (node === null || node === undefined || typeof node === 'boolean') return null;
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) {
      return node.map((child, i) => renderNode(child, `${path}.${i}`)).filter((x) => x !== null);
    }
    if (!React.isValidElement(node)) return null;

    const element = node as React.ReactElement<any>;
    const type = element.type as any;

    if (type === React.Fragment) {
      return renderNode(element.props.children, `${path}.f`);
    }

    if (typeof type === 'object' && type !== null) {
      if ('_context' in type || '$$typeof' in type) {
        const ctx = type._context || type;
        if ('value' in element.props) {
          contextStack.push({ context: ctx, value: element.props.value });
          const rendered = renderNode(element.props.children, `${path}.ctx`);
          contextStack.pop();
          return rendered;
        }
      }
    }

    if (typeof type === 'function') {
      const compName = type.displayName || type.name || 'Anon';
      const instanceKey = `${path}:${compName}${element.key != null ? `:${element.key}` : ''}`;
      let inst = instances.get(instanceKey);
      if (!inst) {
        inst = { hooks: [], hookIndex: 0 };
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
      const children = renderNode(element.props.children, `${path}.${type}`);
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
    unmount,
  };
}

class MockHtmlAudioElement {
  public src: string;
  public playbackRate: number = 1.0;
  public preservesPitch: boolean = true;
  public currentTime: number = 0;
  public duration: number = 2.8;
  public paused: boolean = false;
  public onended: (() => void) | null = null;
  public onerror: (() => void) | null = null;

  constructor(src: string = '') {
    this.src = src;
  }

  play(): Promise<void> {
    this.paused = false;
    return Promise.resolve();
  }

  pause(): void {
    this.paused = true;
  }
}

describe('A-LAND Sprint 4.3｜转变体验状态真实性 + 语音暂停续播 + 六岁儿童触控闭环', () => {
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

    class MockUtterance {
      public text: string;
      public lang: string = 'zh-CN';
      public rate: number = 1;
      public pitch: number = 1;
      public volume: number = 1;
      public voice: any = null;
      public onboundary: any = null;
      public onend: any = null;
      public onerror: any = null;
      constructor(text: string) {
        this.text = text;
      }
    }

    const defaultSynth = {
      getVoices: () => [],
      speak: () => {},
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      onvoiceschanged: null,
    };

    Object.defineProperty(globalThis, 'localStorage', { value: storageMock, configurable: true });
    Object.defineProperty(globalThis, 'sessionStorage', { value: sessionMock, configurable: true });
    Object.defineProperty(globalThis, 'Audio', { value: MockHtmlAudioElement, configurable: true });
    Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
      value: MockUtterance,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: storageMock,
        sessionStorage: sessionMock,
        Audio: MockHtmlAudioElement,
        SpeechSynthesisUtterance: MockUtterance,
        speechSynthesis: defaultSynth,
        setInterval: globalThis.setInterval.bind(globalThis),
        clearInterval: globalThis.clearInterval.bind(globalThis),
        setTimeout: globalThis.setTimeout.bind(globalThis),
        clearTimeout: globalThis.clearTimeout.bind(globalThis),
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
        matchMedia: () => ({
          matches: false,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
        history: {
          replaceState: () => {},
        },
        location: {
          search: '',
        },
        scrollTo: () => {},
      },
      configurable: true,
    });

    disableInternalPlaytestMode();
    resetParentPinForTesting();
    resetPersonalizationProfile();
    resetProductExperienceMetrics();
    sounds.setMasterMuted(false);
    sounds.setSfxMuted(false);
    speechNarrator.setVoiceEnabled(true);
    speechNarrator.stop();
    speechNarrator.clearPlaybackHistory();
    speechNarrator.syncWithCompanion('guoguo_squirrel');
  });

  afterEach(() => {
    speechNarrator.stop();
  });

  // =========================================================================
  // Phase 1 Item 1 (P0): 跨 Slice 状态污染修复
  // =========================================================================
  it('P0-1: Slice A 专属星星不得在 Slice B、C、Ordinary 中渲染或触发；跨分支迁移使用目标分支独立状态，不覆盖原分支历史，不错误记录完成', () => {
    // 1. Domain-layer branch identity guards
    const sliceBState = createInitialTransitionExperienceState('SLICE_B_LOYALTY_CONFLICT');
    const attemptedCrossSliceStar = interactWithSliceAObject(sliceBState, {
      type: 'TOGGLE_WEST_STAR',
    });
    expect(attemptedCrossSliceStar).toBe(sliceBState);
    expect(attemptedCrossSliceStar.activeSliceId).toBe('SLICE_B_LOYALTY_CONFLICT');
    expect(attemptedCrossSliceStar.interactiveObjects.westStarLit).toBe(false);

    const attemptedCrossSliceAction = executeTransitionAction(
      sliceBState,
      'action_carry_both_stars_together'
    );
    expect(attemptedCrossSliceAction).toBe(sliceBState);
    expect(attemptedCrossSliceAction.observedOutcome).toBeNull();

    // 2. UI-layer verification: Slice A SVG stars are ONLY rendered in Slice A
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // Initially on Slice A -> SVG stars exist
    expect(view.findByTestId('svg-west-star-btn')).toBeTruthy();
    expect(view.findByTestId('svg-east-star-btn')).toBeTruthy();

    // Switch to Slice B -> Slice A SVG stars must NOT exist in Slice B
    view.click(view.findByTestId('transition-slice-tab-SLICE_B_LOYALTY_CONFLICT')!);
    expect(view.findByTestId('svg-west-star-btn')).toBeNull();
    expect(view.findByTestId('svg-east-star-btn')).toBeNull();

    // Perform an action in Slice B so Slice B has real history & outcome
    view.click(view.findByTestId('slice-b-raise-fence')!);
    view.click(view.findByTestId('transition-action-action_decline_messenger_role')!);
    expect(view.findByTestId('transition-observed-outcome')?.props['data-action-id']).toBe(
      'action_decline_messenger_role'
    );
    expect(getChildSessionExperienceMetrics().exploredTransitionSliceIds).toEqual([
      'SLICE_B_LOYALTY_CONFLICT',
    ]);

    // Switch to Slice C and Ordinary -> Slice A SVG stars must NOT exist
    view.click(view.findByTestId('transition-slice-tab-SLICE_C_SPECIFIC_FEAR_OR_CONCERN')!);
    expect(view.findByTestId('svg-west-star-btn')).toBeNull();
    expect(view.findByTestId('svg-east-star-btn')).toBeNull();

    view.click(view.findByTestId('transition-slice-tab-ORDINARY_HAPPY_TRANSITION')!);
    expect(view.findByTestId('svg-west-star-btn')).toBeNull();
    expect(view.findByTestId('svg-east-star-btn')).toBeNull();

    // Return to Slice B and trigger legitimate cross-branch migration via feeling chip (`miss_current_place`)
    view.click(view.findByTestId('transition-slice-tab-SLICE_B_LOYALTY_CONFLICT')!);
    // Deselect `happy_here_worry_other_adult` and select `miss_current_place` -> migrates to Slice A's independent state
    view.click(view.findByTestId('feeling-chip-happy_here_worry_other_adult')!);
    view.click(view.findByTestId('feeling-chip-miss_current_place')!);

    // Now on Slice A: Slice A must NOT inherit Slice B's `action_decline_messenger_role` outcome, and must NOT falsely record Slice A as explored
    expect(view.findByTestId('slice-a-interactive-panel')).toBeTruthy();
    expect(view.findByTestId('transition-observed-outcome')).toBeNull();
    expect(getChildSessionExperienceMetrics().exploredTransitionSliceIds).toEqual([
      'SLICE_B_LOYALTY_CONFLICT',
    ]);

    // Switch back to Slice B -> Slice B's original history and outcome (`action_decline_messenger_role`) are 100% preserved!
    view.click(view.findByTestId('transition-slice-tab-SLICE_B_LOYALTY_CONFLICT')!);
    expect(view.findByTestId('transition-observed-outcome')?.props['data-action-id']).toBe(
      'action_decline_messenger_role'
    );

    view.unmount();
  });

  // =========================================================================
  // Phase 1 Item 2 (P0): 改变担忧原因后旧结果残留修复
  // =========================================================================
  it('P0-2: Slice C 改变担忧原因（日程→环境、安全→普通、说不清→明确原因）后，当前行动与结果立即失效，历史尝试保留，新结果只能在新行动后产生', () => {
    let state = createInitialTransitionExperienceState('SLICE_C_SPECIFIC_FEAR_OR_CONCERN');

    // 1. 日程 -> 环境 (Schedule -> Environment)
    state = investigateSliceCFearReason(state, 'reason_schedule_uncertainty');
    state = executeTransitionAction(state, 'action_check_schedule_signpost');
    expect(state.chosenAction).toBe('action_check_schedule_signpost');
    expect(state.observedOutcome?.actionId).toBe('action_check_schedule_signpost');
    expect(state.attemptCount).toBe(1);

    // Switch reason to unfamiliar environment -> chosenAction and observedOutcome MUST invalidate immediately
    state = investigateSliceCFearReason(state, 'reason_unfamiliar_environment');
    expect(state.interactiveObjects.investigatedFearReason).toBe('reason_unfamiliar_environment');
    expect(state.chosenAction).toBeNull();
    expect(state.observedOutcome).toBeNull();
    expect(state.nextAttempt).toBeNull();
    // Historical attempts remain intact
    expect(state.actionHistory).toEqual(['action_check_schedule_signpost']);
    expect(state.attemptCount).toBe(1);

    // Execute new action for unfamiliar environment -> new outcome produced, attemptCount & revisionCount increment
    state = executeTransitionAction(state, 'action_pack_habit_card_or_nightlight');
    expect(state.chosenAction).toBe('action_pack_habit_card_or_nightlight');
    expect(state.observedOutcome?.actionId).toBe('action_pack_habit_card_or_nightlight');
    expect(state.attemptCount).toBe(2);
    expect(state.revisionCount).toBe(1);

    // 2. 普通 -> 安全 -> 普通 (Environment -> Safety -> Schedule)
    state = investigateSliceCFearReason(state, 'reason_specific_person_or_behavior');
    expect(state.chosenAction).toBeNull();
    expect(state.observedOutcome).toBeNull();
    expect(state.ordinaryRitualsBlockedBySafety).toBe(true);

    state = executeTransitionAction(state, 'action_tell_trusted_adult_immediately');
    expect(state.observedOutcome?.actionId).toBe('action_tell_trusted_adult_immediately');
    expect(state.attemptCount).toBe(3);

    // Safety -> Ordinary (reason_schedule_uncertainty)
    state = investigateSliceCFearReason(state, 'reason_schedule_uncertainty');
    expect(state.chosenAction).toBeNull();
    expect(state.observedOutcome).toBeNull();
    expect(state.ordinaryRitualsBlockedBySafety).toBe(false);
    expect(state.attemptCount).toBe(3);

    // 3. 说不清 -> 明确原因 (Unsure -> Separation)
    state = investigateSliceCFearReason(state, 'reason_unsure_or_dont_want_to_say');
    state = executeTransitionAction(state, 'action_sit_quietly_no_explanation');
    expect(state.observedOutcome?.actionId).toBe('action_sit_quietly_no_explanation');
    expect(state.attemptCount).toBe(4);

    state = investigateSliceCFearReason(state, 'reason_separation_reluctance');
    expect(state.chosenAction).toBeNull();
    expect(state.observedOutcome).toBeNull();
    expect(state.actionHistory).toHaveLength(4);
    expect(state.attemptCount).toBe(4);
  });

  // =========================================================================
  // Phase 1 Item 3 (P1): 困难拆解器子情境切换状态重置
  // =========================================================================
  it('P1-3: DifficultyBreakerModal 从 fen、tong、ze、complete 任一阶段切换子情境，都进入新情境正确的起点（fen），绝不出现空完成画面', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <DifficultyBreakerModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // Pick diff-two-homes -> starts in 'fen' of 'sub_dual_attachment'
    view.click(view.findByTestId('breaker-pick-diff-two-homes')!);
    expect(view.findByTestId('breaker-step-fen')).toBeTruthy();

    // 1. From 'fen' (after revealing fact card), switch to 'sub_loyalty_conflict' -> resets to unrevealed 'fen'
    view.click(view.findByTestId('breaker-fen-fact')!);
    expect(view.findByTestId('breaker-fen-fact')?.props['aria-pressed']).toBe(true);
    view.click(view.findByTestId('breaker-sub-sub_loyalty_conflict')!);
    expect(view.findByTestId('breaker-step-fen')).toBeTruthy();
    expect(view.findByTestId('breaker-fen-fact')?.props['aria-pressed']).toBe(false);
    expect(view.findByTestId('breaker-step-complete')).toBeNull();

    // 2. Advance to 'tong', flip lens, then switch to 'sub_specific_concern' -> resets to 'fen'
    view.click(view.findByTestId('breaker-fen-fact')!);
    view.click(view.findByTestId('breaker-next-to-tong')!);
    expect(view.findByTestId('breaker-step-tong')).toBeTruthy();
    view.click(view.findByTestId('breaker-flip-lens-btn')!);
    view.click(view.findByTestId('breaker-sub-sub_specific_concern')!);
    expect(view.findByTestId('breaker-step-fen')).toBeTruthy();
    expect(view.findByTestId('breaker-step-tong')).toBeNull();
    expect(view.findByTestId('breaker-step-complete')).toBeNull();

    // 3. Advance to 'ze', place 1 stepping stone, then switch to 'sub_ordinary_transition' -> resets to 'fen'
    view.click(view.findByTestId('breaker-next-to-tong')!);
    view.click(view.findByTestId('breaker-next-to-ze')!);
    expect(view.findByTestId('breaker-step-ze')).toBeTruthy();
    const firstActionBtn = view.findAll(
      (n) => n.props && typeof n.props['data-testid'] === 'string' && n.props['data-testid'].startsWith('breaker-action-')
    )[0];
    expect(firstActionBtn).toBeTruthy();
    view.click(firstActionBtn);
    view.click(view.findByTestId('breaker-sub-sub_ordinary_transition')!);
    expect(view.findByTestId('breaker-step-fen')).toBeTruthy();
    expect(view.findByTestId('breaker-step-ze')).toBeNull();
    expect(view.findByTestId('breaker-step-complete')).toBeNull();

    // 4. Advance all the way to 'complete', then switch to 'sub_dual_attachment' -> resets to 'fen', NO empty complete screen!
    view.click(view.findByTestId('breaker-next-to-tong')!);
    view.click(view.findByTestId('breaker-next-to-ze')!);
    const ordinaryActionBtn = view.findAll(
      (n) => n.props && typeof n.props['data-testid'] === 'string' && n.props['data-testid'].startsWith('breaker-action-')
    )[0];
    view.click(ordinaryActionBtn);
    view.click(view.findByTestId('breaker-complete-btn')!);
    expect(view.findByTestId('breaker-step-complete')).toBeTruthy();

    view.click(view.findByTestId('breaker-sub-sub_dual_attachment')!);
    expect(view.findByTestId('breaker-step-complete')).toBeNull();
    expect(view.findByTestId('breaker-step-fen')).toBeTruthy();

    view.unmount();
  });

  // =========================================================================
  // Phase 1 Item 4 (P1): 语音暂停续播与角色切换
  // =========================================================================
  it('P1-4: 暂停状态下切换角色立即终止旧声源，保留 paused 状态；调用 resume() 时以新角色建立安全的播放会话', () => {
    speechNarrator.syncWithCompanion('guoguo_squirrel');
    speechNarrator.speak(
      '这里是双向桥小驿。去另一边住的时候，每个人心里可能会有不一样的感受，也可能平平常常。先点点看你现在有什么感觉吧！',
      undefined,
      undefined,
      {
        speakerId: 'guoguo_squirrel',
        sceneId: 'two-homes-bridge',
      }
    );

    const oldAudio = speechNarrator.getActiveAudioElement() as MockHtmlAudioElement | null;
    expect(oldAudio).not.toBeNull();
    const sessionBeforePause = speechNarrator.getNarrationSession();
    expect(sessionBeforePause.playbackStatus).toBe('playing');

    // Pause playback
    speechNarrator.pause();
    expect(speechNarrator.getIsPaused()).toBe(true);
    expect(speechNarrator.getNarrationSession().playbackStatus).toBe('paused');

    // Switch companion to qiqi_deer while paused
    speechNarrator.syncWithCompanion('qiqi_deer');

    // Old audio source is immediately terminated, no auto-play occurs, and paused intent is preserved
    expect(oldAudio?.paused).toBe(true);
    expect(speechNarrator.getActiveAudioElement()).toBeNull();
    expect(speechNarrator.getIsPaused()).toBe(true);
    expect(speechNarrator.getSpeaking()).toBe(true);

    const pausedSwitchedSession = speechNarrator.getNarrationSession();
    expect(pausedSwitchedSession.playbackStatus).toBe('paused');
    expect(pausedSwitchedSession.companionId).toBe('qiqi_deer');
    expect(speechNarrator.getProfile()).toBe('starlight-companion');

    // User clicks resume -> establishes a clean new playback session in Qiqi's voice
    speechNarrator.resume();
    expect(speechNarrator.getIsPaused()).toBe(false);
    expect(speechNarrator.getSpeaking()).toBe(true);

    const resumedSession = speechNarrator.getNarrationSession();
    expect(resumedSession.playbackStatus).toBe('playing');
    expect(resumedSession.companionId).toBe('qiqi_deer');
    expect(resumedSession.playbackSessionId).toBeGreaterThan(
      pausedSwitchedSession.playbackSessionId
    );
    expect((speechNarrator.getActiveAudioElement() as MockHtmlAudioElement | null)?.src).toContain(
      '/audio/tts/starlight-companion-'
    );
    expect(speechNarrator.getLastPlaybackDiagnostics()?.neuralVoiceName).toBe(
      'zh-CN-YunxiaNeural'
    );
  });

  // =========================================================================
  // Phase 2: Slice B 事实与猜测分类闭环 + 小水獭乐乐第三人称故事闭环
  // =========================================================================
  it('Phase 2: Slice B 真实移动气泡、查看证据、调整误分、撤销操作、完成归类后才可获得成长结论；小水獭乐乐第三人称故事具备完整角色、事件与结果', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // Switch to Slice B
    view.click(view.findByTestId('transition-slice-tab-SLICE_B_LOYALTY_CONFLICT')!);

    // 1. Attempting to click `action_allow_joy_release_adult_worry` BEFORE sorting bubbles is blocked from producing a conclusion
    view.click(view.findByTestId('transition-action-action_allow_joy_release_adult_worry')!);
    expect(view.findByTestId('transition-observed-outcome')).toBeNull();
    expect(view.findByTestId('slice-b-sorting-required-banner')).toBeTruthy();

    // 2. Inspect evidence on bubbles
    view.click(view.findByTestId('slice-b-evidence-btn-fact_happy_here')!);
    expect(view.findByTestId('slice-b-evidence-card-fact_happy_here')?.text).toContain(
      '桌子上摆着刚拼好的拼图'
    );

    view.click(view.findByTestId('slice-b-evidence-btn-guess_other_adult_sad')!);
    expect(view.findByTestId('slice-b-evidence-card-guess_other_adult_sad')?.text).toContain(
      '没有亲眼看见另一边的大人'
    );

    // 3. Misclassify `guess_other_adult_sad` into Known Fact tray -> shows mismatch feedback & guard banner, still blocks conclusion
    view.click(view.findByTestId('slice-b-try-claim-guess-as-fact')!);
    expect(view.findByTestId('slice-b-guess-not-fact-guard')).toBeTruthy();
    expect(view.findByTestId('slice-b-tray-feedback-guess_other_adult_sad')?.text).toContain(
      '只是我们心里的担心和猜测'
    );

    // 4. Adjust `guess_other_adult_sad` from Fact tray to Guess cloud using the adjust button
    view.click(view.findByTestId('slice-b-adjust-guess_other_adult_sad')!);
    expect(view.findByTestId('slice-b-guess-not-fact-guard')).toBeNull();
    expect(view.findByTestId('slice-b-tray-feedback-guess_other_adult_sad')?.text).toContain(
      '猜测云反馈：分得很清楚'
    );

    // 5. Test Undo button -> reverts the adjustment back to Fact tray, then re-classify to Guess cloud
    view.click(view.findByTestId('slice-b-undo-btn')!);
    expect(view.findByTestId('slice-b-guess-not-fact-guard')).toBeTruthy();
    view.click(view.findByTestId('slice-b-classify-guess')!);
    expect(view.findByTestId('slice-b-guess-not-fact-guard')).toBeNull();

    // 6. Tap-select `fact_happy_here` bubble and drop into Known Fact tray via `slice-b-drop-selected-to-fact`
    view.click(view.findByTestId('slice-b-select-bubble-fact_happy_here')!);
    view.click(view.findByTestId('slice-b-drop-selected-to-fact')!);
    expect(view.findByTestId('slice-b-tray-feedback-fact_happy_here')?.text).toContain(
      '已知事实盘反馈'
    );

    // Classify 3rd bubble (`guess_must_be_messenger`) into Guess cloud
    view.click(view.findByTestId('slice-b-classify-messenger-as-guess')!);
    expect(view.findByTestId('slice-b-sorting-conclusion-card')).toBeTruthy();
    expect(view.findByTestId('slice-b-sorting-progress-badge')?.text).toContain('已归类 3/3');

    // 7. Switch to "小水獭乐乐的故事" (third-person story mode) and execute the action -> both scene outcome and Lele third-person story outcome appear!
    view.click(view.findByTestId('transition-context-story_experience')!);
    const storyCard = view.findByTestId('lele-third-person-story-card');
    expect(storyCard).toBeTruthy();
    expect(storyCard?.props['data-character-name']).toBe('小水獭乐乐');
    expect(view.findByTestId('lele-story-event-text')?.text).toContain(
      LELE_THIRD_PERSON_STORIES.SLICE_B_LOYALTY_CONFLICT.storyEvent
    );

    view.click(view.findByTestId('transition-action-action_allow_joy_release_adult_worry')!);
    const outcome = view.findByTestId('transition-observed-outcome');
    expect(outcome).toBeTruthy();
    expect(outcome?.props['data-action-id']).toBe('action_allow_joy_release_adult_worry');

    const leleStoryOutcome = view.findByTestId('lele-third-person-story-outcome');
    expect(leleStoryOutcome).toBeTruthy();
    expect(leleStoryOutcome?.text).toContain('小水獭乐乐用分界镜核对了证据');

    view.unmount();
  });
});
