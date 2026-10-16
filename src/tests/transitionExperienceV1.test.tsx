import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  speechNarrator,
  COMPANION_TO_VOICE_PROFILE,
  CompanionVoiceId,
  VoiceProfileType,
} from '../utils/speech';
import { sounds } from '../utils/sound';
import { AppProvider } from '../context/AppContext';
import {
  savePersonalizationProfile,
  resetPersonalizationProfile,
} from '../domain/personalization';
import {
  getChildSessionExperienceMetrics,
  resetProductExperienceMetrics,
} from '../domain/cognitive/productExperienceMetrics';
import {
  disableInternalPlaytestMode,
  resetParentPinForTesting,
} from '../domain/privacy/parentAccess';
import {
  TRANSITION_FIXED_VOICE_LINES,
  TransitionSliceId,
  createInitialTransitionExperienceState,
  executeTransitionAction,
  investigateSliceCFearReason,
} from '../domain/transition/transitionExperienceEngine';
import { TwoHomesBridgeModal } from '../components/ChildIsland/TwoHomesBridge/TwoHomesBridgeModal';
import { ParentDashboard } from '../components/ParentCoach/ParentDashboard';
import { INITIAL_PARENT_SCRIPTS } from '../data/mockData';

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
    rerender(nextElement: React.ReactElement) {
      rootElement = nextElement;
      flush();
    },
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

const ALL_COMPANIONS: Array<{
  companionId: CompanionVoiceId;
  companionName: string;
  expectedProfile: VoiceProfileType;
  expectedNeuralVoice: string;
}> = [
  {
    companionId: 'guoguo_squirrel',
    companionName: '果果',
    expectedProfile: 'playful-buddy',
    expectedNeuralVoice: 'zh-CN-XiaoyiNeural',
  },
  {
    companionId: 'beibei_otter',
    companionName: '贝贝',
    expectedProfile: 'warm-sister',
    expectedNeuralVoice: 'zh-CN-XiaoxiaoNeural',
  },
  {
    companionId: 'tiantian_raccoon',
    companionName: '天天',
    expectedProfile: 'gentle-guide',
    expectedNeuralVoice: 'zh-CN-YunxiNeural',
  },
  {
    companionId: 'qiqi_deer',
    companionName: '奇奇',
    expectedProfile: 'starlight-companion',
    expectedNeuralVoice: 'zh-CN-YunxiaNeural',
  },
];

describe('A-LAND｜换家场景多维心理体验与认知逻辑重构 V1.0 (3 Slices + 10 Counterexamples + 4x3 Voice Matrix)', () => {
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
  // 10 Mandatory Counterexamples (Section 8)
  // =========================================================================

  it('COUNTEREXAMPLE-01: 孩子同时舍不得两个地方，不能被强制单选', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    const westStarBtn = view.findByTestId('slice-a-west-star');
    expect(westStarBtn).toBeTruthy();

    // Light west star, then light east star -> both remain lit simultaneously!
    view.click(westStarBtn!);
    expect(view.findByTestId('slice-a-west-star')?.props['aria-pressed']).toBe(true);

    const eastStarBtn = view.findByTestId('slice-a-east-star');
    expect(eastStarBtn).toBeTruthy();
    view.click(eastStarBtn!);
    expect(view.findByTestId('slice-a-west-star')?.props['aria-pressed']).toBe(true);
    expect(view.findByTestId('slice-a-east-star')?.props['aria-pressed']).toBe(true);

    // Feeling chips for both places are also active simultaneously
    expect(view.findByTestId('feeling-chip-miss_current_place')?.props['aria-pressed']).toBe(true);
    expect(view.findByTestId('feeling-chip-look_forward_other_place')?.props['aria-pressed']).toBe(
      true
    );
    expect(view.findByTestId('dual-feelings-coexist-badge')?.text).toContain('不需要二选一');

    view.unmount();
  });

  it('COUNTEREXAMPLE-02: 孩子开心去另一边，不应自动触发焦虑安抚', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // Deselect initial Slice A feelings and select only happy_relaxed_to_go
    view.click(view.findByTestId('feeling-chip-miss_current_place')!);
    view.click(view.findByTestId('feeling-chip-look_forward_other_place')!);
    view.click(view.findByTestId('feeling-chip-happy_relaxed_to_go')!);

    // Automatically routes to ORDINARY_HAPPY_TRANSITION without anxiety soothing
    const noSoothingBanner = view.findByTestId('ordinary-no-anxiety-soothing');
    expect(noSoothingBanner).toBeTruthy();
    expect(noSoothingBanner?.text).toContain('不会启动焦虑安抚');

    // Execute lighthearted bridge crossing
    const crossBtn = view.findByTestId('transition-action-action_cross_bridge_lightheartedly');
    expect(crossBtn).toBeTruthy();
    view.click(crossBtn!);

    const outcome = view.findByTestId('transition-observed-outcome');
    expect(outcome).toBeTruthy();
    expect(outcome?.text).toContain('没有任何焦虑安抚弹窗');
    expect(view.findByTestId('transition-companion-subtitle')?.text).toContain('普通又顺畅的一天');

    view.unmount();
  });

  it('COUNTEREXAMPLE-03: 孩子担心某一方难过，不得把猜测直接宣称为事实', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // Switch to Slice B (忠诚冲突)
    view.click(view.findByTestId('transition-slice-tab-SLICE_B_LOYALTY_CONFLICT')!);

    // Try claiming the guess ("另一边的大人现在一定在家里伤心") as a confirmed fact
    const tryClaimBtn = view.findByTestId('slice-b-try-claim-guess-as-fact');
    expect(tryClaimBtn).toBeTruthy();
    view.click(tryClaimBtn!);

    // Guard banner must appear and block treating the guess as a fact
    const guardBanner = view.findByTestId('slice-b-guess-not-fact-guard');
    expect(guardBanner).toBeTruthy();
    expect(guardBanner?.text).toContain('只是我们心里的担心和猜测，绝对不能直接当成已经确定的事实');

    // Known facts box must continue to label it as [未证实猜测], never [已知事实]
    const factsBoxText = view.findByTestId('transition-known-facts-box')?.text || '';
    expect(factsBoxText).toContain('[未证实猜测] “另一边的大人现在一定在家里偷偷伤心');

    view.unmount();
  });

  it('COUNTEREXAMPLE-04: 孩子表示不喜欢其中一个地方，不能强迫他说两个地方一样好', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    view.click(view.findByTestId('transition-slice-tab-SLICE_B_LOYALTY_CONFLICT')!);

    const dislikeOneBtn = view.findByTestId('slice-b-attitude-dislike-one');
    expect(dislikeOneBtn).toBeTruthy();
    view.click(dislikeOneBtn!);

    const acceptedBanner = view.findByTestId('slice-b-honest-dislike-accepted');
    expect(acceptedBanner).toBeTruthy();
    expect(acceptedBanner?.text).toContain('没有人规定你必须说“两个地方一样好”');

    const honestActionBtn = view.findByTestId(
      'transition-action-action_keep_honest_place_preference'
    );
    expect(honestActionBtn).toBeTruthy();
    view.click(honestActionBtn!);

    const outcome = view.findByTestId('transition-observed-outcome');
    expect(outcome?.text).toContain('不再贴上“必须一模一样”的贴纸');

    // Ensure the modal contains zero hardcoded "爱在两个家里一样多" claims
    const fullModalText = view.findByTestId('two-homes-bridge-modal')?.text || '';
    expect(fullModalText).not.toContain('爱在两个家里一样多');
    expect(fullModalText).not.toContain('两个家都为你准备了温暖的小床');

    // Also verify mockData scripts do not force equal-warmth claims
    const loveScript = INITIAL_PARENT_SCRIPTS.find((s) => s.id === 'script-love');
    expect(loveScript?.shouldNotSay.join(' ')).toContain('两个家一模一样好，你不许说不喜欢');

    view.unmount();
  });

  it('COUNTEREXAMPLE-05: 孩子拒绝拥抱、拒绝写信，仍能继续探索', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // Toggle decline hug and decline letter in Slice A
    view.click(view.findByTestId('slice-a-decline-hug-toggle')!);
    view.click(view.findByTestId('slice-a-decline-letter-toggle')!);

    expect(view.findByTestId('slice-a-decline-hug-toggle')?.props['aria-pressed']).toBe(true);
    expect(view.findByTestId('slice-a-decline-letter-toggle')?.props['aria-pressed']).toBe(true);

    // Choose the quiet wave action (no hug, no letter)
    const noHugAction = view.findByTestId('transition-action-action_quiet_wave_no_hug_no_letter');
    expect(noHugAction).toBeTruthy();
    view.click(noHugAction!);

    const outcome = view.findByTestId('transition-observed-outcome');
    expect(outcome).toBeTruthy();
    expect(outcome?.props['data-action-id']).toBe('action_quiet_wave_no_hug_no_letter');
    expect(outcome?.text).toContain('不需要勉强拥抱或写信');

    view.unmount();
  });

  it('COUNTEREXAMPLE-06: 孩子说不清害怕原因时，不得强迫选择预设原因', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // Switch to Slice C
    view.click(view.findByTestId('transition-slice-tab-SLICE_C_SPECIFIC_FEAR_OR_CONCERN')!);

    // Choose "不想回答或暂时说不清楚"
    const unsureReasonBtn = view.findByTestId('slice-c-reason-reason_unsure_or_dont_want_to_say');
    expect(unsureReasonBtn).toBeTruthy();
    view.click(unsureReasonBtn!);

    // Quiet bench action is available and can be completed without picking any preset cause
    const quietBenchAction = view.findByTestId('transition-action-action_sit_quietly_no_explanation');
    expect(quietBenchAction).toBeTruthy();
    view.click(quietBenchAction!);

    const outcome = view.findByTestId('transition-observed-outcome');
    expect(outcome).toBeTruthy();
    expect(outcome?.text).toContain('没有任何催促气泡');

    view.unmount();
  });

  it('COUNTEREXAMPLE-07: 孩子提及具体伤害时，不得使用普通换家仪式作为唯一回应', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    view.click(view.findByTestId('transition-slice-tab-SLICE_C_SPECIFIC_FEAR_OR_CONCERN')!);

    // Select specific person or harm behavior
    const harmReasonBtn = view.findByTestId('slice-c-reason-reason_specific_person_or_behavior');
    expect(harmReasonBtn).toBeTruthy();
    view.click(harmReasonBtn!);

    // Safety shield banner must be visible and ordinary rituals drawer must be removed/blocked
    expect(view.findByTestId('slice-c-safety-shield-banner')).toBeTruthy();
    expect(view.findByTestId('slice-c-ordinary-rituals-blocked')?.text).toContain(
      '绝不能靠装玩偶、深呼吸或勉强拥抱来解决'
    );
    expect(view.findByTestId('transition-optional-tools-drawer')).toBeNull();

    // Ordinary schedule/nightlight actions are NOT offered; only safety protection actions are offered
    expect(view.findByTestId('transition-action-action_check_schedule_signpost')).toBeNull();
    expect(view.findByTestId('transition-action-action_pack_habit_card_or_nightlight')).toBeNull();

    const safetyActionBtn = view.findByTestId(
      'transition-action-action_tell_trusted_adult_immediately'
    );
    expect(safetyActionBtn).toBeTruthy();
    view.click(safetyActionBtn!);

    const outcome = view.findByTestId('transition-observed-outcome');
    expect(outcome?.props['data-safety-route']).toBe('true');
    expect(outcome?.text).toContain('普通换家书包与拥抱仪式全部停用');

    // Direct engine-level guard: attempting to execute a non-safety action when safetyConcern is specific_person_or_harm_behavior is rejected
    const harmState = investigateSliceCFearReason(
      createInitialTransitionExperienceState('SLICE_C_SPECIFIC_FEAR_OR_CONCERN'),
      'reason_specific_person_or_behavior'
    );
    const blockedAttempt = executeTransitionAction(harmState, 'action_check_schedule_signpost');
    expect(blockedAttempt.chosenAction).toBeNull();
    expect(blockedAttempt.ordinaryRitualsBlockedBySafety).toBe(true);

    view.unmount();
  });

  it('COUNTEREXAMPLE-08: 角色切换后全站配音、字幕、视觉身份必须一致（含朗读进行中切换角色）', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    const firstAudio = speechNarrator.getActiveAudioElement();
    expect(firstAudio).not.toBeNull();
    expect(speechNarrator.getLastPlaybackDiagnostics()?.companionId).toBe('guoguo_squirrel');

    // Switch companion mid-speech across all 4 companions inside the modal
    for (const comp of ALL_COMPANIONS) {
      const prevAudio = speechNarrator.getActiveAudioElement() as MockHtmlAudioElement | null;
      const switchBtn = view.findByTestId(`transition-companion-switch-${comp.companionId}`);
      expect(switchBtn).toBeTruthy();
      view.click(switchBtn!);

      if (prevAudio && comp.companionId !== 'guoguo_squirrel') {
        expect(prevAudio.paused).toBe(true);
      }

      const bar = view.findByTestId('transition-companion-bar');
      expect(bar?.props['data-companion-id']).toBe(comp.companionId);
      expect(bar?.props['data-voice-profile']).toBe(comp.expectedProfile);
      expect(view.findByTestId('transition-companion-name')?.text).toContain(comp.companionName);
      expect(view.findByTestId('transition-voice-badge')?.text).toContain(comp.expectedNeuralVoice);

      const diag = speechNarrator.getLastPlaybackDiagnostics();
      expect(diag?.companionId).toBe(comp.companionId);
      expect(diag?.requestedVoiceProfile).toBe(comp.expectedProfile);
      expect(diag?.actualSourceProfile).toBe(comp.expectedProfile);
      expect(diag?.sourceType).toBe('prebaked-mp3');
      expect(diag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);
    }

    view.unmount();
  });

  it('COUNTEREXAMPLE-09: 返回、重新尝试、跨情境切换时保持正确状态', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // 1. In Slice A, light both stars and execute action 1
    view.click(view.findByTestId('slice-a-light-both-stars')!);
    view.click(view.findByTestId('transition-action-action_quiet_wave_no_hug_no_letter')!);
    expect(view.findByTestId('transition-observed-outcome')?.props['data-action-id']).toBe(
      'action_quiet_wave_no_hug_no_letter'
    );

    // 2. Switch to Slice B, raise responsibility fence, and execute action
    view.click(view.findByTestId('transition-slice-tab-SLICE_B_LOYALTY_CONFLICT')!);
    expect(view.findByTestId('transition-observed-outcome')).toBeNull();
    view.click(view.findByTestId('slice-b-raise-fence')!);
    view.click(view.findByTestId('transition-action-action_decline_messenger_role')!);
    expect(view.findByTestId('transition-observed-outcome')?.props['data-action-id']).toBe(
      'action_decline_messenger_role'
    );

    // 3. Switch back to Slice A -> Slice A's outcome and lit stars are preserved intact!
    view.click(view.findByTestId('transition-slice-tab-SLICE_A_BIDIRECTIONAL_ATTACHMENT')!);
    expect(view.findByTestId('slice-a-west-star')?.props['aria-pressed']).toBe(true);
    expect(view.findByTestId('slice-a-east-star')?.props['aria-pressed']).toBe(true);
    expect(view.findByTestId('transition-observed-outcome')?.props['data-action-id']).toBe(
      'action_quiet_wave_no_hug_no_letter'
    );

    // 4. Click "换个做法再试一次" (Retry) in Slice A and pick a different action -> revisionCount increments
    view.click(view.findByTestId('transition-retry-btn')!);
    expect(view.findByTestId('transition-observed-outcome')).toBeNull();

    view.click(view.findByTestId('transition-action-action_carry_both_stars_together')!);
    const revisedOutcome = view.findByTestId('transition-observed-outcome');
    expect(revisedOutcome?.props['data-action-id']).toBe('action_carry_both_stars_together');
    expect(revisedOutcome?.text).toContain('已尝试 2 次');
    expect(revisedOutcome?.text).toContain('调整做法 1 次');

    view.unmount();
  });

  it('COUNTEREXAMPLE-10: 家长端只反映真实发生的互动，不制造改善数据', () => {
    // 1. Before any interaction, ParentDashboard shows empty state
    const emptyParentView = createStatefulTestRenderer(
      <AppProvider>
        <ParentDashboard />
      </AppProvider>
    );

    // Switch to insights tab in ParentDashboard
    const insightsTabBtn = emptyParentView.findAll(
      (n) => n.type === 'button' && n.text.includes('趋势信号')
    )[0];
    expect(insightsTabBtn).toBeTruthy();
    emptyParentView.click(insightsTabBtn);
    expect(emptyParentView.findByTestId('parent-cognitive-process-empty')).toBeTruthy();
    emptyParentView.unmount();

    // 2. Perform 1 real exploration in Slice A and 1 voluntary pause in Slice C
    const childView = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );
    viewClickAction(childView);
    childView.unmount();

    const metrics = getChildSessionExperienceMetrics();
    expect(metrics.exploredTransitionSliceIds).toEqual(['SLICE_A_BIDIRECTIONAL_ATTACHMENT']);
    expect(metrics.pausedTransitionSliceIds).toEqual(['SLICE_C_SPECIFIC_FEAR_OR_CONCERN']);

    // 3. Re-open ParentDashboard and verify truthful counts with zero fabricated improvement percentages
    const populatedParentView = createStatefulTestRenderer(
      <AppProvider>
        <ParentDashboard />
      </AppProvider>
    );
    const insightsBtn2 = populatedParentView.findAll(
      (n) => n.type === 'button' && n.text.includes('趋势信号')
    )[0];
    expect(insightsBtn2).toBeTruthy();
    populatedParentView.click(insightsBtn2);

    const bridgeCountsCard = populatedParentView.findByTestId('parent-transition-bridge-counts');
    expect(bridgeCountsCard).toBeTruthy();
    expect(bridgeCountsCard?.text).toContain('探索 1 幕 / 主动暂停 1 次');
    expect(bridgeCountsCard?.text).not.toContain('焦虑减轻');
    expect(bridgeCountsCard?.text).not.toContain('改善率');
    populatedParentView.unmount();
  });

  // =========================================================================
  // 4 Companions × 3 Transition Vertical Slices Full Voice Matrix (Section 6)
  // =========================================================================

  describe('12-Combination Matrix: 4 Companions × 3 Transition Slices Authentic Neural Voice Sync', () => {
    const THREE_SLICES: Array<{
      sliceId: TransitionSliceId;
      actionTestId: string;
    }> = [
      {
        sliceId: 'SLICE_A_BIDIRECTIONAL_ATTACHMENT',
        actionTestId: 'transition-action-action_quiet_wave_no_hug_no_letter',
      },
      {
        sliceId: 'SLICE_B_LOYALTY_CONFLICT',
        actionTestId: 'transition-action-action_allow_joy_release_adult_worry',
      },
      {
        sliceId: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
        actionTestId: 'transition-action-action_check_schedule_signpost',
      },
    ];

    for (const comp of ALL_COMPANIONS) {
      for (const sliceSpec of THREE_SLICES) {
        it(`${comp.companionName} (${comp.expectedProfile}) × ${sliceSpec.sliceId}: speaks entry and action outcome in authentic ${comp.expectedNeuralVoice} with emotion prosody pause`, () => {
          savePersonalizationProfile({
            companionId: comp.companionId,
            primaryInterest: 'drawing',
          });
          speechNarrator.syncWithCompanion(comp.companionId);

          const view = createStatefulTestRenderer(
            <AppProvider>
              <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
            </AppProvider>
          );

          // Select target slice tab
          const tabBtn = view.findByTestId(`transition-slice-tab-${sliceSpec.sliceId}`);
          expect(tabBtn).toBeTruthy();
          view.click(tabBtn!);

          const entryDiag = speechNarrator.getLastPlaybackDiagnostics();
          expect(entryDiag).not.toBeNull();
          expect(entryDiag?.companionId).toBe(comp.companionId);
          expect(entryDiag?.requestedVoiceProfile).toBe(comp.expectedProfile);
          expect(entryDiag?.actualSourceProfile).toBe(comp.expectedProfile);
          expect(entryDiag?.sourceType).toBe('prebaked-mp3');
          expect(entryDiag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);
          expect(entryDiag?.audioUrl).toMatch(new RegExp(`^/audio/tts/${comp.expectedProfile}-`));
          expect(typeof entryDiag?.prosodyPauseMs).toBe('number');
          expect((entryDiag?.prosodyPauseMs || 0) > 140).toBe(true);

          // Execute slice action and verify outcome speech
          const actBtn = view.findByTestId(sliceSpec.actionTestId);
          expect(actBtn).toBeTruthy();
          view.click(actBtn!);

          const outcomeDiag = speechNarrator.getLastPlaybackDiagnostics();
          expect(outcomeDiag?.companionId).toBe(comp.companionId);
          expect(outcomeDiag?.requestedVoiceProfile).toBe(comp.expectedProfile);
          expect(outcomeDiag?.actualSourceProfile).toBe(comp.expectedProfile);
          expect(outcomeDiag?.sourceType).toBe('prebaked-mp3');
          expect(outcomeDiag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);

          // Subtitle bar matches spoken outcome text
          expect(view.findByTestId('transition-companion-subtitle')?.text).toContain(
            outcomeDiag?.text || ''
          );

          view.unmount();
        });
      }
    }

    it('All 33 fixed transition lines exist in prebaked manifest for all 4 companions (132/132 coverage)', () => {
      const allFixedLines = Object.values(TRANSITION_FIXED_VOICE_LINES);
      expect(allFixedLines.length).toBeGreaterThanOrEqual(33);

      for (const comp of ALL_COMPANIONS) {
        for (const line of allFixedLines) {
          const entry = speechNarrator.findPrebakedEntry(line, comp.expectedProfile);
          expect(
            entry,
            `Missing prebaked MP3 for ${comp.companionName} (${comp.expectedProfile}): ${line}`
          ).not.toBeNull();
          expect(entry?.profileId).toBe(comp.expectedProfile);
          expect(entry?.voiceName).toBe(comp.expectedNeuralVoice);
        }
      }
    });
  });
});

function viewClickAction(view: ReturnType<typeof createStatefulTestRenderer>) {
  view.click(view.findByTestId('transition-action-action_carry_both_stars_together')!);
  view.click(view.findByTestId('transition-slice-tab-SLICE_C_SPECIFIC_FEAR_OR_CONCERN')!);
  view.click(view.findByTestId('transition-pause-btn')!);
}
