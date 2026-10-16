import { ReactElement } from 'react';
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  speechNarrator,
  COMPANION_TO_VOICE_PROFILE,
  VOICE_PROFILES,
  CompanionVoiceId,
  VoiceProfileType,
} from '../utils/speech';
import { sounds } from '../utils/sound';
import { AppProvider, useApp } from '../context/AppContext';
import {
  ANIMAL_COMPANIONS,
  loadPersonalizationProfile,
  savePersonalizationProfile,
  resetPersonalizationProfile,
} from '../domain/personalization';
import { resetProductExperienceMetrics } from '../domain/cognitive/productExperienceMetrics';
import {
  grantParentAccess,
  lockParentAccess,
  resetParentPinForTesting,
  enableInternalPlaytestMode,
  disableInternalPlaytestMode,
} from '../domain/privacy/parentAccess';
import { ContentAuditRegistry } from '../domain/cognitive/ContentAuditRegistry';
import { CompanionBanner } from '../components/ChildIsland/CompanionBanner';
import { ChildAudioBar } from '../components/ChildIsland/ChildAudioBar';
import { VoiceSystemAuditionModal } from '../components/Audio/VoiceSystemAuditionModal';
import { CrayonDetectiveGame } from '../components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame';
import { FriendAsksHomeGame } from '../components/InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame';
import { ToyBoatNegotiationGame } from '../components/InteractiveGames/ToyBoatNegotiationGame/ToyBoatNegotiationGame';
import { StoryGroveModal } from '../components/ChildIsland/StoryGrove/StoryGroveModal';
import { WeatherStationModal } from '../components/ChildIsland/WeatherStationModal';
import { CalmSpace } from '../components/ChildIsland/CalmSpace';

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
    findAll,
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

describe('Sprint 4.2: Four-Character Global Voice Synchronization & Audio Architecture', () => {
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

    class MockAudioElement {
      public src: string;
      public preload: string = 'auto';
      public currentTime: number = 0;
      public playbackRate: number = 1.0;
      public preservesPitch: boolean = true;
      public paused: boolean = true;
      public onplay: (() => void) | null = null;
      public onended: ((ev?: any) => void) | null = null;
      public onerror: ((ev?: any) => void) | null = null;
      constructor(src?: string) {
        this.src = src || '';
      }
      play() {
        this.paused = false;
        if (this.onplay) this.onplay();
        return Promise.resolve();
      }
      pause() {
        this.paused = true;
      }
      removeAttribute(attr: string) {
        if (attr === 'src') this.src = '';
      }
      load() {}
    }

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
    Object.defineProperty(globalThis, 'Audio', { value: MockAudioElement, configurable: true });
    Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
      value: MockUtterance,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: storageMock,
        sessionStorage: sessionMock,
        Audio: MockAudioElement,
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
          search: '?playtest=1',
        },
        scrollTo: () => {},
      },
      configurable: true,
    });

    ContentAuditRegistry.resetToDefault();
    resetParentPinForTesting();
    grantParentAccess();
    enableInternalPlaytestMode();
    resetProductExperienceMetrics();
    resetPersonalizationProfile();

    speechNarrator.stop();
    speechNarrator.clearPlaybackHistory();
    speechNarrator.clearManualVoiceOverride();
    sounds.setSfxMuted(false);
    sounds.setMasterMuted(false);
    speechNarrator.setVoiceEnabled(true);
    speechNarrator.syncWithCompanion('guoguo_squirrel');
  });

  afterEach(() => {
    speechNarrator.stop();
    disableInternalPlaytestMode();
    lockParentAccess();
    resetParentPinForTesting();
    resetProductExperienceMetrics();
  });

  // =========================================================================
  // 10 Mandatory Negative / Counterexample Tests
  // =========================================================================

  it('NEGATIVE-01: Selecting Qiqi (starlight-companion) NEVER returns or plays Beibei or Guoguo pre-baked MP3s', () => {
    speechNarrator.syncWithCompanion('qiqi_deer');
    expect(speechNarrator.getProfile()).toBe('starlight-companion');

    // Legacy single-profile line that was recorded only for warm-sister (Beibei)
    const legacyBeibeiOnlyLine = '轻轻屏住呼吸……一、二。';
    const crossLookup = speechNarrator.findPrebakedEntry(
      legacyBeibeiOnlyLine,
      'starlight-companion'
    );
    expect(crossLookup).toBeNull();

    // Shared mainline phrase must strictly resolve Qiqi's own starlight-companion (zh-CN-YunxiaNeural) recording
    const sharedLine =
      '点击或移动桌上的蓝水杯，让它先后挨着左边的小积木和右边的大水桶，看看会发生什么！';
    const qiqiEntry = speechNarrator.findPrebakedEntry(sharedLine, 'starlight-companion');
    expect(qiqiEntry).not.toBeNull();
    expect(qiqiEntry?.profileId).toBe('starlight-companion');
    expect(qiqiEntry?.voiceName).toBe('zh-CN-YunxiaNeural');
    expect(qiqiEntry?.audioUrl).toContain('/audio/tts/starlight-companion-');

    speechNarrator.speak(sharedLine);
    const diag = speechNarrator.getLastPlaybackDiagnostics();
    expect(diag?.companionId).toBe('qiqi_deer');
    expect(diag?.requestedVoiceProfile).toBe('starlight-companion');
    expect(diag?.actualSourceProfile).toBe('starlight-companion');
    expect(diag?.neuralVoiceName).toBe('zh-CN-YunxiaNeural');
    expect(diag?.audioUrl).not.toContain('warm-sister');
    expect(diag?.audioUrl).not.toContain('playful-buddy');
  });

  it('NEGATIVE-02: Views rendered WITHOUT CompanionBanner still synchronize companion voice via AppProvider', () => {
    // Save Tiantian in personalization storage before mounting AppProvider without CompanionBanner
    savePersonalizationProfile({ companionId: 'tiantian_raccoon' });

    const HeadlessSceneProbe: React.FC = () => {
      const { personalization, updatePersonalization } = useApp();
      return (
        <div>
          <span data-testid="probe-companion">{personalization.companionId}</span>
          <button
            data-testid="switch-to-qiqi"
            onClick={() => updatePersonalization({ companionId: 'qiqi_deer' })}
          >
            切到奇奇
          </button>
        </div>
      );
    };

    const view = createStatefulTestRenderer(
      <AppProvider>
        <HeadlessSceneProbe />
      </AppProvider>
    );

    expect(speechNarrator.getCommittedCompanionId()).toBe('tiantian_raccoon');
    expect(speechNarrator.getProfile()).toBe('gentle-guide');
    expect(sounds.getTemplate()).toBe('gentle-guide');

    // Switch companion without CompanionBanner mounted
    const switchBtn = view.findByTestId('switch-to-qiqi');
    expect(switchBtn).toBeTruthy();
    view.click(switchBtn!);

    expect(speechNarrator.getCommittedCompanionId()).toBe('qiqi_deer');
    expect(speechNarrator.getProfile()).toBe('starlight-companion');
    expect(sounds.getTemplate()).toBe('starlight-companion');

    view.unmount();
  });

  it('NEGATIVE-03: Switching from Guoguo to Tiantian while speaking immediately stops old audio and uses Tiantian voice for new speech', () => {
    speechNarrator.syncWithCompanion('guoguo_squirrel');
    speechNarrator.speak(
      '你好呀！我是果果。我是小松鼠果果，我喜欢收捡森林里的每一片小树叶和秘密线索！'
    );

    const sessionGuoguo = speechNarrator.getPlaybackSessionId();
    const audioGuoguo = speechNarrator.getActiveAudioElement();
    expect(speechNarrator.getSpeaking()).toBe(true);
    expect(audioGuoguo).not.toBeNull();
    expect(speechNarrator.getLastPlaybackDiagnostics()?.requestedVoiceProfile).toBe(
      'playful-buddy'
    );

    // Switch to Tiantian mid-speech
    speechNarrator.syncWithCompanion('tiantian_raccoon');

    // Old Guoguo audio must be cancelled immediately (paused === true) and new Tiantian session started from sentence start (V1.1 Rule 4)
    expect(audioGuoguo?.paused).toBe(true);
    expect(speechNarrator.getActiveAudioElement()).not.toBe(audioGuoguo);
    expect(speechNarrator.getPlaybackSessionId()).toBeGreaterThan(sessionGuoguo);
    expect(speechNarrator.getProfile()).toBe('gentle-guide');
    expect(sounds.getTemplate()).toBe('gentle-guide');
    expect(speechNarrator.getSpeaking()).toBe(true);

    const diagTiantian = speechNarrator.getLastPlaybackDiagnostics();
    expect(diagTiantian?.companionId).toBe('tiantian_raccoon');
    expect(diagTiantian?.requestedVoiceProfile).toBe('gentle-guide');
    expect(diagTiantian?.actualSourceProfile).toBe('gentle-guide');
    expect(diagTiantian?.neuralVoiceName).toBe('zh-CN-YunxiNeural');
    expect(diagTiantian?.audioUrl).toContain('/audio/tts/gentle-guide-');
  });

  it('NEGATIVE-04: Delayed onerror or onended callback from an interrupted previous audio session NEVER overwrites or replays over the active session', () => {
    speechNarrator.syncWithCompanion('guoguo_squirrel');
    speechNarrator.speak(
      '欢迎来到美术角！桌上的绿色小蜡笔不见了，我们拿起小放大镜，看看地上和桌边有些什么。'
    );

    const firstAudio = speechNarrator.getActiveAudioElement();
    const firstSessionId = speechNarrator.getPlaybackSessionId();
    expect(firstAudio).not.toBeNull();

    // Capture stale handlers before switching
    const staleOnError = firstAudio?.onerror;
    const staleOnEnded = firstAudio?.onended;

    // Now switch to Qiqi and start a new utterance
    speechNarrator.syncWithCompanion('qiqi_deer');
    speechNarrator.speak(
      '夜晚的树屋帐篷外晃动着一个神秘黑影！身旁的小刺猬紧张地追问你的隐私秘密，而地上只有一件照明工具，大家都想拿。先转动光束照一照吧！'
    );

    const secondSessionId = speechNarrator.getPlaybackSessionId();
    const secondAudio = speechNarrator.getActiveAudioElement();
    expect(secondSessionId).toBeGreaterThan(firstSessionId);
    expect(speechNarrator.getSpeaking()).toBe(true);
    expect(speechNarrator.getLastPlaybackDiagnostics()?.companionId).toBe('qiqi_deer');
    expect(speechNarrator.getLastPlaybackDiagnostics()?.sourceType).toBe('prebaked-mp3');

    // Simulate late firing of stale callbacks from firstAudio
    if (typeof staleOnError === 'function') {
      staleOnError.call(firstAudio!, new Event('error'));
    }
    if (typeof staleOnEnded === 'function') {
      staleOnEnded.call(firstAudio!, new Event('ended'));
    }

    // Active Qiqi session must remain completely intact!
    expect(speechNarrator.getPlaybackSessionId()).toBe(secondSessionId);
    expect(speechNarrator.getSpeaking()).toBe(true);
    expect(speechNarrator.getActiveAudioElement()).toBe(secondAudio);
    expect(speechNarrator.getLastPlaybackDiagnostics()?.companionId).toBe('qiqi_deer');
    expect(speechNarrator.getLastPlaybackDiagnostics()?.sourceType).toBe('prebaked-mp3');
    expect(speechNarrator.getLastPlaybackDiagnostics()?.neuralVoiceName).toBe('zh-CN-YunxiaNeural');
  });

  it('NEGATIVE-05: Temporary audition in VoiceSystemAuditionModal without confirmation restores the original companion upon exit', () => {
    savePersonalizationProfile({ companionId: 'beibei_otter' });
    speechNarrator.syncWithCompanion('beibei_otter');
    expect(speechNarrator.getCommittedCompanionId()).toBe('beibei_otter');
    expect(speechNarrator.getProfile()).toBe('warm-sister');

    let closed = false;
    const view = createStatefulTestRenderer(
      <VoiceSystemAuditionModal
        isOpen={true}
        onClose={() => {
          closed = true;
        }}
      />
    );

    // Click Qiqi's card for temporary audition
    const qiqiCard = view.findByTestId('audition-profile-card-starlight-companion');
    expect(qiqiCard).toBeTruthy();
    view.click(qiqiCard!);

    // During temporary audition: currentProfile is starlight-companion, but committed companion remains beibei_otter
    expect(speechNarrator.isAuditionPreviewActive()).toBe(true);
    expect(speechNarrator.getProfile()).toBe('starlight-companion');
    expect(speechNarrator.getCommittedCompanionId()).toBe('beibei_otter');
    expect(loadPersonalizationProfile().companionId).toBe('beibei_otter');

    // Click cancel/exit without confirming
    const cancelBtn = view.findByTestId('audition-cancel-restore-btn');
    expect(cancelBtn).toBeTruthy();
    view.click(cancelBtn!);

    expect(closed).toBe(true);
    expect(speechNarrator.isAuditionPreviewActive()).toBe(false);
    expect(speechNarrator.getCommittedCompanionId()).toBe('beibei_otter');
    expect(speechNarrator.getProfile()).toBe('warm-sister');
    expect(sounds.getTemplate()).toBe('warm-sister');

    view.unmount();
  });

  it('NEGATIVE-06: Confirming global switch in VoiceSystemAuditionModal updates companionId, voice profile, and acoustic template together', () => {
    savePersonalizationProfile({ companionId: 'guoguo_squirrel' });
    speechNarrator.syncWithCompanion('guoguo_squirrel');

    let confirmedCompanion: string | null = null;
    const view = createStatefulTestRenderer(
      <VoiceSystemAuditionModal
        isOpen={true}
        onClose={() => {}}
        onConfirmCompanionChange={(cid) => {
          confirmedCompanion = cid;
        }}
      />
    );

    // Preview Tiantian (gentle-guide)
    const tiantianCard = view.findByTestId('audition-profile-card-gentle-guide');
    expect(tiantianCard).toBeTruthy();
    view.click(tiantianCard!);

    // Confirm global switch
    const confirmBtn = view.findByTestId('audition-confirm-global-btn');
    expect(confirmBtn).toBeTruthy();
    view.click(confirmBtn!);

    expect(confirmedCompanion).toBe('tiantian_raccoon');
    expect(loadPersonalizationProfile().companionId).toBe('tiantian_raccoon');
    expect(speechNarrator.isAuditionPreviewActive()).toBe(false);
    expect(speechNarrator.getCommittedCompanionId()).toBe('tiantian_raccoon');
    expect(speechNarrator.getProfile()).toBe('gentle-guide');
    expect(sounds.getTemplate()).toBe('gentle-guide');

    view.unmount();
  });

  it('NEGATIVE-07: Muting SFX (sfxMuted = true) via ChildAudioBar NEVER disables partner voice narration', () => {
    const view = createStatefulTestRenderer(<ChildAudioBar />);

    const sfxBtn = view.findByTestId('audio-bar-sfx-toggle');
    expect(sfxBtn).toBeTruthy();
    expect(sounds.getSfxMuted()).toBe(false);

    // Mute SFX via ChildAudioBar button
    view.click(sfxBtn!);
    expect(sounds.getSfxMuted()).toBe(true);
    expect(speechNarrator.getVoiceEnabled()).toBe(true);

    // Trigger partner speech while SFX is muted -> must STILL speak!
    speechNarrator.syncWithCompanion('beibei_otter');
    speechNarrator.speak(
      '你好呀！我是贝贝。我是小海獭贝贝，如果觉得累了，我们可以一起躺在水面上慢慢呼吸。'
    );

    expect(speechNarrator.getSpeaking()).toBe(true);
    const diag = speechNarrator.getLastPlaybackDiagnostics();
    expect(diag?.sourceType).toBe('prebaked-mp3');
    expect(diag?.companionId).toBe('beibei_otter');
    expect(diag?.neuralVoiceName).toBe('zh-CN-XiaoxiaoNeural');

    view.unmount();
  });

  it('NEGATIVE-08: Disabling partner voice (voiceEnabled = false) silences speech while keeping SFX enabled', () => {
    sounds.setSfxMuted(false);
    speechNarrator.setVoiceEnabled(false);

    speechNarrator.speak(
      '你好呀！我是果果。我是小松鼠果果，我喜欢收捡森林里的每一片小树叶和秘密线索！'
    );

    // Partner speech does not play audio, only updates caption
    expect(speechNarrator.getSpeaking()).toBe(false);
    expect(speechNarrator.getActiveAudioElement()).toBeNull();
    expect(speechNarrator.getLastPlaybackDiagnostics()?.sourceType).toBe('muted-speech-off');

    // SFX remains enabled and unmuted
    expect(sounds.getSfxMuted()).toBe(false);
    expect(sounds.getMasterMuted()).toBe(false);
    expect(() => sounds.playClick()).not.toThrow();
  });

  it('NEGATIVE-09: Resetting personalization or clearing all data restores companion and voice to default Guoguo (playful-buddy)', () => {
    const ResetProbe: React.FC = () => {
      const { personalization, updatePersonalization, resetPersonalization, clearAllData } =
        useApp();
      return (
        <div>
          <span data-testid="current-comp">{personalization.companionId}</span>
          <button
            data-testid="set-qiqi"
            onClick={() => updatePersonalization({ companionId: 'qiqi_deer' })}
          >
            奇奇
          </button>
          <button data-testid="reset-pref" onClick={() => resetPersonalization()}>
            重置偏好
          </button>
          <button data-testid="clear-all" onClick={() => clearAllData()}>
            清除全部
          </button>
        </div>
      );
    };

    const view = createStatefulTestRenderer(
      <AppProvider>
        <ResetProbe />
      </AppProvider>
    );

    view.click(view.findByTestId('set-qiqi')!);
    expect(speechNarrator.getCommittedCompanionId()).toBe('qiqi_deer');
    expect(speechNarrator.getProfile()).toBe('starlight-companion');

    view.click(view.findByTestId('reset-pref')!);
    expect(speechNarrator.getCommittedCompanionId()).toBe('guoguo_squirrel');
    expect(speechNarrator.getProfile()).toBe('playful-buddy');
    expect(sounds.getTemplate()).toBe('playful-buddy');

    view.click(view.findByTestId('set-qiqi')!);
    expect(speechNarrator.getProfile()).toBe('starlight-companion');

    view.click(view.findByTestId('clear-all')!);
    expect(speechNarrator.getCommittedCompanionId()).toBe('guoguo_squirrel');
    expect(speechNarrator.getProfile()).toBe('playful-buddy');
    expect(sounds.getTemplate()).toBe('playful-buddy');

    view.unmount();
  });

  it('NEGATIVE-10: When OS only provides a single Chinese system voice and dynamic text falls back to Web Speech API, UI truthfully labels it as shared system fallback instead of claiming 4 neural voices', () => {
    const mockSingleSystemVoice = {
      name: 'Google 普通话（中国大陆）',
      lang: 'zh-CN',
      default: true,
      localService: true,
      voiceURI: 'Google 普通话（中国大陆）',
    } as SpeechSynthesisVoice;

    const origSpeechSynthesis = window.speechSynthesis;
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => [mockSingleSystemVoice],
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        onvoiceschanged: null,
      },
    });

    // Trigger voice list refresh via private initVoices or constructor simulation
    (speechNarrator as unknown as { initVoices: () => void }).initVoices();

    expect(speechNarrator.getDistinctSystemVoiceCount()).toBe(1);

    // Speak a dynamic runtime sentence not in prebaked manifest across all 4 companions
    for (const comp of ALL_COMPANIONS) {
      speechNarrator.syncWithCompanion(comp.companionId);
      speechNarrator.speak(`动态生成的即时测试语句：${comp.companionName}的临时播报。`);
      const diag = speechNarrator.getLastPlaybackDiagnostics();
      const karaoke = speechNarrator.getKaraokeState();

      expect(diag?.sourceType).toBe('system-voice-shared-fallback');
      expect(diag?.distinctSystemVoiceCount).toBe(1);
      expect(karaoke.isPrebakedNeural).toBe(false);
      expect(karaoke.voiceSourceLabel).toContain('系统通用语音替代');
      expect(karaoke.voiceSourceLabel).toContain('仅预制语音具角色专属声线');
      expect(karaoke.voiceSourceLabel).not.toContain('真实神经音源');
    }

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: origSpeechSynthesis,
    });
  });

  // =========================================================================
  // 24-Combination Matrix Verification (4 Companions × 6 Core Scenes)
  // =========================================================================

  describe('24-Combination Matrix: 4 Companions × 6 Core Scenes Real Component Integration', () => {
    for (const comp of ALL_COMPANIONS) {
      describe(`Companion: ${comp.companionName} (${comp.companionId} -> ${comp.expectedProfile} / ${comp.expectedNeuralVoice})`, () => {
        beforeEach(() => {
          savePersonalizationProfile({
            companionId: comp.companionId,
            primaryInterest: 'drawing',
          });
          speechNarrator.syncWithCompanion(comp.companionId);
        });

        it(`[1/6] 首页伙伴问候 (CompanionBanner): speaks ${comp.companionName}'s authentic neural voice`, () => {
          const view = createStatefulTestRenderer(
            <AppProvider>
              <CompanionBanner />
            </AppProvider>
          );

          const greetBtn = view.findAll(
            (n) => n.type === 'button' && n.text.includes('听问候')
          )[0];
          expect(greetBtn).toBeTruthy();
          view.click(greetBtn);

          const diag = speechNarrator.getLastPlaybackDiagnostics();
          expect(diag).not.toBeNull();
          expect(diag?.companionId).toBe(comp.companionId);
          expect(diag?.requestedVoiceProfile).toBe(comp.expectedProfile);
          expect(diag?.actualSourceProfile).toBe(comp.expectedProfile);
          expect(diag?.sourceType).toBe('prebaked-mp3');
          expect(diag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);
          expect(diag?.audioUrl).toMatch(new RegExp(`^/audio/tts/${comp.expectedProfile}-`));

          view.unmount();
        });

        it(`[2/6] 情绪天气站与呼吸平静角 (WeatherStationModal & CalmSpace): speaks ${comp.companionName}'s authentic neural voice`, () => {
          const view = createStatefulTestRenderer(
            <AppProvider>
              <CalmSpace isOpen={true} onClose={() => {}} />
              <WeatherStationModal isOpen={true} onClose={() => {}} onGoToCalm={() => {}} />
            </AppProvider>
          );

          // Speak CalmSpace breathing prompt
          const calmReadBtn = view.findAll(
            (n) =>
              n.type === 'button' &&
              String(n.props['aria-label'] || '').includes('通过语音朗读当前呼吸引导提示')
          )[0];
          expect(calmReadBtn).toBeTruthy();
          view.click(calmReadBtn);

          const calmDiag = speechNarrator.getLastPlaybackDiagnostics();
          expect(calmDiag?.companionId).toBe(comp.companionId);
          expect(calmDiag?.requestedVoiceProfile).toBe(comp.expectedProfile);
          expect(calmDiag?.actualSourceProfile).toBe(comp.expectedProfile);
          expect(calmDiag?.sourceType).toBe('prebaked-mp3');
          expect(calmDiag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);

          view.unmount();
        });

        it(`[3/6] 蜡笔侦探 (CrayonDetectiveGame): speaks opening intro in ${comp.companionName}'s authentic neural voice`, () => {
          const view = createStatefulTestRenderer(
            <AppProvider>
              <CrayonDetectiveGame onExit={() => {}} />
            </AppProvider>
          );

          const diag = speechNarrator.getLastPlaybackDiagnostics();
          expect(diag).not.toBeNull();
          expect(diag?.companionId).toBe(comp.companionId);
          expect(diag?.requestedVoiceProfile).toBe(comp.expectedProfile);
          expect(diag?.actualSourceProfile).toBe(comp.expectedProfile);
          expect(diag?.sourceType).toBe('prebaked-mp3');
          expect(diag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);
          expect(diag?.audioUrl).toMatch(new RegExp(`^/audio/tts/${comp.expectedProfile}-`));

          view.unmount();
        });

        it(`[4/6] 朋友问起家里事 (FriendAsksHomeGame): speaks scenario prompt in ${comp.companionName}'s authentic neural voice`, () => {
          window.history.replaceState({}, '', '/?playtest=1');
          const view = createStatefulTestRenderer(
            <AppProvider>
              <FriendAsksHomeGame onExit={() => {}} />
            </AppProvider>
          );

          const diag = speechNarrator.getLastPlaybackDiagnostics();
          expect(diag).not.toBeNull();
          expect(diag?.companionId).toBe(comp.companionId);
          expect(diag?.requestedVoiceProfile).toBe(comp.expectedProfile);
          expect(diag?.actualSourceProfile).toBe(comp.expectedProfile);
          expect(diag?.sourceType).toBe('prebaked-mp3');
          expect(diag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);
          expect(diag?.audioUrl).toMatch(new RegExp(`^/audio/tts/${comp.expectedProfile}-`));

          window.history.replaceState({}, '', '/');
          view.unmount();
        });

        it(`[5/6] 轮流玩小船 (ToyBoatNegotiationGame): speaks negotiation prompt in ${comp.companionName}'s authentic neural voice`, () => {
          window.history.replaceState({}, '', '/?playtest=1');
          const view = createStatefulTestRenderer(
            <AppProvider>
              <ToyBoatNegotiationGame onExit={() => {}} />
            </AppProvider>
          );

          const diag = speechNarrator.getLastPlaybackDiagnostics();
          expect(diag).not.toBeNull();
          expect(diag?.companionId).toBe(comp.companionId);
          expect(diag?.requestedVoiceProfile).toBe(comp.expectedProfile);
          expect(diag?.actualSourceProfile).toBe(comp.expectedProfile);
          expect(diag?.sourceType).toBe('prebaked-mp3');
          expect(diag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);
          expect(diag?.audioUrl).toMatch(new RegExp(`^/audio/tts/${comp.expectedProfile}-`));

          window.history.replaceState({}, '', '/');
          view.unmount();
        });

        it(`[6/6] 故事森林与树屋露营夜 (StoryGroveModal cup-size & camp transfer): speaks story and camp prompts in ${comp.companionName}'s authentic neural voice`, () => {
          const view = createStatefulTestRenderer(
            <AppProvider>
              <StoryGroveModal isOpen={true} onClose={() => {}} />
            </AppProvider>
          );

          // Enter《一只杯子，是大还是小？》
          const cupBtn = view.findByTestId('story-catalog-leaf-cup-size');
          expect(cupBtn).toBeTruthy();
          view.click(cupBtn!);

          const leafDiag = speechNarrator.getLastPlaybackDiagnostics();
          expect(leafDiag?.companionId).toBe(comp.companionId);
          expect(leafDiag?.requestedVoiceProfile).toBe(comp.expectedProfile);
          expect(leafDiag?.actualSourceProfile).toBe(comp.expectedProfile);
          expect(leafDiag?.sourceType).toBe('prebaked-mp3');
          expect(leafDiag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);

          // Move cup to block -> speaks cup comparison feedback in same companion's neural voice
          const moveBlockBtn = view.findByTestId('move-cup-to-block');
          expect(moveBlockBtn).toBeTruthy();
          view.click(moveBlockBtn!);

          const moveDiag = speechNarrator.getLastPlaybackDiagnostics();
          expect(moveDiag?.companionId).toBe(comp.companionId);
          expect(moveDiag?.requestedVoiceProfile).toBe(comp.expectedProfile);
          expect(moveDiag?.actualSourceProfile).toBe(comp.expectedProfile);
          expect(moveDiag?.sourceType).toBe('prebaked-mp3');
          expect(moveDiag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);

          // Return to catalog and enter 树屋露营夜 (Camp Transfer Challenge)
          const backBtn = view.findAll(
            (n) => n.type === 'button' && n.text.includes('返回目录')
          )[0];
          expect(backBtn).toBeTruthy();
          view.click(backBtn);
          const campBtn = view.findByTestId('open-camp-transfer-challenge');
          expect(campBtn).toBeTruthy();
          view.click(campBtn!);

          const campDiag = speechNarrator.getLastPlaybackDiagnostics();
          expect(campDiag?.companionId).toBe(comp.companionId);
          expect(campDiag?.requestedVoiceProfile).toBe(comp.expectedProfile);
          expect(campDiag?.actualSourceProfile).toBe(comp.expectedProfile);
          expect(campDiag?.sourceType).toBe('prebaked-mp3');
          expect(campDiag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);
          expect(campDiag?.audioUrl).toMatch(new RegExp(`^/audio/tts/${comp.expectedProfile}-`));

          view.unmount();
        });
      });
    }
  });
});
