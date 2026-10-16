import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  speechNarrator,
  COMPANION_TO_VOICE_PROFILE,
  CompanionVoiceId,
  VoiceProfileType,
  buildProsodyCadencePlan,
  EMOTION_TONE_PROSODY_SPECS,
} from '../utils/speech';
import {
  VOICE_CALL_SITE_CATALOG,
  VOICE_LINE_REGISTRY,
  auditGlobalFourCompanionCoverage,
  adaptCompanionSelfIntroText,
} from '../domain/voice/voiceLineRegistry';
import { sounds } from '../utils/sound';
import { AppProvider, useApp } from '../context/AppContext';
import {
  savePersonalizationProfile,
  resetPersonalizationProfile,
  ANIMAL_COMPANIONS,
} from '../domain/personalization';
import {
  resetProductExperienceMetrics,
  recordTransitionExperienceProgress,
} from '../domain/cognitive/productExperienceMetrics';
import {
  disableInternalPlaytestMode,
  resetParentPinForTesting,
} from '../domain/privacy/parentAccess';
import { CompanionBanner } from '../components/ChildIsland/CompanionBanner';
import { ChildAudioBar } from '../components/ChildIsland/ChildAudioBar';
import { PersonalizationSettingsModal } from '../components/ChildIsland/Personalization/PersonalizationSettingsModal';
import { VoiceSystemAuditionModal } from '../components/Audio/VoiceSystemAuditionModal';
import { TwoHomesBridgeModal } from '../components/ChildIsland/TwoHomesBridge/TwoHomesBridgeModal';
import {
  TRANSITION_FIXED_VOICE_LINES,
  createInitialTransitionExperienceState,
} from '../domain/transition/transitionExperienceEngine';

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
  public duration: number = 3.0;
  public paused: boolean = false;
  public onplay: (() => void) | null = null;
  public onended: (() => void) | null = null;
  public onerror: (() => void) | null = null;

  constructor(src: string = '') {
    this.src = src;
  }

  play(): Promise<void> {
    this.paused = false;
    if (this.onplay) this.onplay();
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

describe('A-LAND V1.1: 全站四角色语音一致性修复 (NarrationSession + Global Coverage + Prosody Cadence + Neutral Bridge Entry)', () => {
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
  // Section I: P0 解决角色切换后语音内容残留 (Mandatory Regression & 7 Rules)
  // =========================================================================

  it('MANDATORY REGRESSION: 果果朗读“我是果果” → 切换奇奇 → 点击重听 (语音内容、字幕、头像、声线全部属于奇奇)', () => {
    const SwitchAndAudioHarness: React.FC = () => {
      const { updatePersonalization } = useApp();
      return (
        <div>
          <CompanionBanner />
          <ChildAudioBar />
          <button
            type="button"
            data-testid="harness-speak-guoguo-short"
            onClick={() => speechNarrator.speak('我是果果')}
          >
            果果说我是果果
          </button>
          <button
            type="button"
            data-testid="harness-switch-to-qiqi"
            onClick={() => {
              updatePersonalization({ companionId: 'qiqi_deer' });
              speechNarrator.switchCompanion('qiqi_deer');
            }}
          >
            切换到奇奇
          </button>
        </div>
      );
    };

    const view = createStatefulTestRenderer(
      <AppProvider>
        <SwitchAndAudioHarness />
      </AppProvider>
    );

    // Step 1: Guoguo speaks "我是果果"
    view.click(view.findByTestId('harness-speak-guoguo-short')!);
    const guoguoSession = speechNarrator.getNarrationSession();
    expect(guoguoSession.companionId).toBe('guoguo_squirrel');
    expect(guoguoSession.text).toContain('我是果果');
    expect(guoguoSession.playbackStatus).toBe('playing');
    expect(speechNarrator.getLastPlaybackDiagnostics()?.neuralVoiceName).toBe('zh-CN-XiaoyiNeural');

    // Finish Guoguo's playback naturally
    const guoguoAudio = speechNarrator.getActiveAudioElement() as MockHtmlAudioElement | null;
    expect(guoguoAudio).not.toBeNull();
    if (guoguoAudio?.onended) {
      guoguoAudio.onended();
    }
    expect(speechNarrator.getNarrationSession().playbackStatus).toBe('completed');

    // Step 2: Switch companion to Qiqi (idle/completed state -> updates session & subtitle without auto-playing)
    view.click(view.findByTestId('harness-switch-to-qiqi')!);
    const afterSwitchSession = speechNarrator.getNarrationSession();
    expect(afterSwitchSession.companionId).toBe('qiqi_deer');
    expect(afterSwitchSession.text).toBe('我是奇奇');
    expect(afterSwitchSession.text).not.toContain('果果');
    expect(afterSwitchSession.lineId).toBe('companion.self_intro.short');
    expect(afterSwitchSession.playbackStatus).toBe('idle');

    // Verify avatar, subtitle, and voice badge in UI immediately reflect Qiqi BEFORE clicking replay
    expect(view.findByTestId('companion-banner')?.props['data-companion-id']).toBe('qiqi_deer');
    expect(view.findByTestId('companion-banner-name')?.text).toContain('奇奇在身边');
    expect(view.findByTestId('audio-bar-companion-avatar')?.props['data-companion-id']).toBe(
      'qiqi_deer'
    );
    expect(view.findByTestId('audio-bar-companion-voice-badge')?.text).toContain('奇奇');
    expect(view.findByTestId('audio-bar-voice-source-label')?.text).toContain(
      'zh-CN-YunxiaNeural'
    );
    expect(view.findByTestId('karaoke-caption-line')?.text).toContain('我是奇奇');
    expect(view.findByTestId('karaoke-caption-line')?.text).not.toContain('我是果果');

    // Step 3: Click Replay ("重听") on ChildAudioBar
    const replayBtn = view.findByTestId('audio-bar-replay-btn');
    expect(replayBtn).toBeTruthy();
    view.click(replayBtn!);

    // Verify voice content, subtitle, avatar, and neural voice all belong to Qiqi!
    const replaySession = speechNarrator.getNarrationSession();
    const replayDiag = speechNarrator.getLastPlaybackDiagnostics();
    expect(replaySession.companionId).toBe('qiqi_deer');
    expect(replaySession.text).toBe('我是奇奇');
    expect(replaySession.playbackStatus).toBe('playing');
    expect(replaySession.playbackSessionId).toBeGreaterThan(guoguoSession.playbackSessionId);

    expect(replayDiag?.companionId).toBe('qiqi_deer');
    expect(replayDiag?.requestedVoiceProfile).toBe('starlight-companion');
    expect(replayDiag?.actualSourceProfile).toBe('starlight-companion');
    expect(replayDiag?.sourceType).toBe('prebaked-mp3');
    expect(replayDiag?.neuralVoiceName).toBe('zh-CN-YunxiaNeural');
    expect(replayDiag?.audioUrl).toMatch(/^\/audio\/tts\/starlight-companion-/);
    expect(replayDiag?.text).toBe('我是奇奇');

    expect(view.findByTestId('karaoke-caption-line')?.text).toContain('我是奇奇');
    expect(view.findByTestId('audio-bar-companion-avatar')?.props['data-companion-id']).toBe(
      'qiqi_deer'
    );

    view.unmount();
  });

  it('SECTION I RULES 4, 5, 6, 7: Mid-speech switch restarts from sentence start; paused switch stays silent; idle switch stays silent; temporary audition never overwrites committed companion', () => {
    // Rule 4: Mid-speech switch on a story sentence restarts from sentence start with new companion and cancels old audio
    const storyLine =
      '点击或移动桌上的蓝水杯，让它先后挨着左边的小积木和右边的大水桶，看看会发生什么！';
    speechNarrator.syncWithCompanion('guoguo_squirrel');
    speechNarrator.speak(storyLine, undefined, undefined, {
      sceneId: 'game_crayon_detective',
    });

    const firstAudio = speechNarrator.getActiveAudioElement() as MockHtmlAudioElement;
    const firstSessionId = speechNarrator.getNarrationSession().playbackSessionId;
    expect(firstAudio).not.toBeNull();
    expect(speechNarrator.getNarrationSession().playbackStatus).toBe('playing');

    // Simulate halfway playback, then switch to Beibei mid-speech
    firstAudio.currentTime = 1.4;
    speechNarrator.switchCompanion('beibei_otter');

    const secondAudio = speechNarrator.getActiveAudioElement() as MockHtmlAudioElement;
    const secondSession = speechNarrator.getNarrationSession();
    expect(firstAudio.paused).toBe(true);
    expect(secondAudio).not.toBeNull();
    expect(secondAudio).not.toBe(firstAudio);
    expect(secondAudio.currentTime).toBe(0);
    expect(secondSession.playbackSessionId).toBeGreaterThan(firstSessionId);
    expect(secondSession.companionId).toBe('beibei_otter');
    expect(secondSession.playbackStatus).toBe('playing');
    expect(secondSession.text).toBe(storyLine);
    expect(speechNarrator.getLastPlaybackDiagnostics()?.neuralVoiceName).toBe(
      'zh-CN-XiaoxiaoNeural'
    );

    // Rule 5: Paused state switch terminates old audio source, does NOT auto-play, preserves paused intent,
    // and establishes a clean new playback session in the new companion's voice when the user clicks Resume ("继续")
    speechNarrator.pause();
    expect(speechNarrator.getNarrationSession().playbackStatus).toBe('paused');
    expect(secondAudio.paused).toBe(true);

    speechNarrator.switchCompanion('tiantian_raccoon');
    const pausedSwitchedSession = speechNarrator.getNarrationSession();
    expect(pausedSwitchedSession.companionId).toBe('tiantian_raccoon');
    expect(pausedSwitchedSession.playbackStatus).toBe('paused');
    expect(speechNarrator.getIsPaused()).toBe(true);
    expect(speechNarrator.getSpeaking()).toBe(true);
    expect(speechNarrator.getActiveAudioElement()).toBeNull();

    // User clicks Resume ("继续") -> plays in Tiantian's voice with a new session
    speechNarrator.resume();
    const resumedSession = speechNarrator.getNarrationSession();
    const resumedAudio = speechNarrator.getActiveAudioElement() as MockHtmlAudioElement;
    expect(resumedSession.companionId).toBe('tiantian_raccoon');
    expect(resumedSession.playbackStatus).toBe('playing');
    expect(resumedSession.playbackSessionId).toBeGreaterThan(pausedSwitchedSession.playbackSessionId);
    expect(speechNarrator.getIsPaused()).toBe(false);
    expect(speechNarrator.getSpeaking()).toBe(true);
    expect(resumedAudio).not.toBeNull();
    expect(resumedAudio).not.toBe(secondAudio);
    expect(speechNarrator.getLastPlaybackDiagnostics()?.neuralVoiceName).toBe(
      'zh-CN-YunxiNeural'
    );

    // Stop speech so Rule 6 starts from a true idle state
    speechNarrator.stop();

    // Rule 6: Switching while idle/not speaking in PersonalizationSettingsModal does NOT auto-play a story
    const settingsView = createStatefulTestRenderer(
      <AppProvider>
        <PersonalizationSettingsModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );
    expect(speechNarrator.getSpeaking()).toBe(false);
    settingsView.click(settingsView.findByTestId('personalization-companion-qiqi_deer')!);
    expect(speechNarrator.getCommittedCompanionId()).toBe('qiqi_deer');
    expect(speechNarrator.getSpeaking()).toBe(false);
    expect(speechNarrator.getNarrationSession().companionId).toBe('qiqi_deer');
    expect(speechNarrator.getNarrationSession().playbackStatus).toBe('idle');
    settingsView.unmount();

    // Rule 7: Temporary audition in VoiceSystemAuditionModal never overwrites committed companion or pre-audition text
    speechNarrator.speak('我是奇奇。');
    const qiqiAudio = speechNarrator.getActiveAudioElement() as MockHtmlAudioElement;
    qiqiAudio.onended?.();
    expect(speechNarrator.getNarrationSession().text).toContain('我是奇奇');

    const auditionView = createStatefulTestRenderer(
      <VoiceSystemAuditionModal isOpen={true} onClose={() => {}} />
    );
    auditionView.click(auditionView.findByTestId('audition-profile-card-playful-buddy')!);
    expect(speechNarrator.isAuditionPreviewActive()).toBe(true);
    expect(speechNarrator.getCommittedCompanionId()).toBe('qiqi_deer');

    auditionView.click(auditionView.findByTestId('audition-cancel-restore-btn')!);
    expect(speechNarrator.isAuditionPreviewActive()).toBe(false);
    expect(speechNarrator.getCommittedCompanionId()).toBe('qiqi_deer');
    expect(speechNarrator.getNarrationSession().companionId).toBe('qiqi_deer');
    expect(speechNarrator.getNarrationSession().text).toContain('我是奇奇');
    auditionView.unmount();
  });

  // =========================================================================
  // Section II: P0 建立真正的全域语音覆盖检查
  // =========================================================================

  it('SECTION II: Global voice call-site catalog & 4-companion prebaked coverage audit has 0 missing entries across all 4 companions', () => {
    expect(VOICE_CALL_SITE_CATALOG.length).toBeGreaterThanOrEqual(15);
    expect(VOICE_LINE_REGISTRY.length).toBeGreaterThanOrEqual(85);

    const categories = new Set(VOICE_CALL_SITE_CATALOG.map((c) => c.category));
    expect(categories.has('FIXED_LINE')).toBe(true);
    expect(categories.has('FINITE_PARAM_COMBO')).toBe(true);
    expect(categories.has('DYNAMIC_BEHAVIOR_FEEDBACK')).toBe(true);
    expect(categories.has('FREE_INPUT_OR_UNBOUNDED')).toBe(true);

    const audit = auditGlobalFourCompanionCoverage();
    expect(audit.missingEntries).toEqual([]);
    expect(audit.fullyCoveredLines).toBe(audit.totalRegisteredLines);
  });

  it('SECTION II: CompanionBanner session memory composite greeting resolves authentic 4-companion prebaked MP3s', () => {
    const sampleState = createInitialTransitionExperienceState('SLICE_A_BIDIRECTIONAL_ATTACHMENT');
    recordTransitionExperienceProgress(sampleState, {
      gameId: 'two_homes_bridge',
      scenarioTitle: '双向不舍',
      eventStage: 'COMPLETED_OBSERVED',
      childChoiceSummary: '在双向小桥体验了双向不舍',
      companionReactionText: TRANSITION_FIXED_VOICE_LINES.SLICE_A_OUTCOME_BOTH_STARS,
      updatedAt: new Date().toISOString(),
    });

    for (const comp of ALL_COMPANIONS) {
      savePersonalizationProfile({ companionId: comp.companionId });
      speechNarrator.syncWithCompanion(comp.companionId);

      const view = createStatefulTestRenderer(
        <AppProvider>
          <CompanionBanner />
        </AppProvider>
      );

      const speakBtn = view.findByTestId('companion-banner-avatar-btn');
      expect(speakBtn).toBeTruthy();
      view.click(speakBtn!);

      const diag = speechNarrator.getLastPlaybackDiagnostics();
      expect(diag?.companionId).toBe(comp.companionId);
      expect(diag?.sourceType).toBe('prebaked-mp3');
      expect(diag?.actualSourceProfile).toBe(comp.expectedProfile);
      expect(diag?.neuralVoiceName).toBe(comp.expectedNeuralVoice);

      view.unmount();
    }
  });

  it('SECTION II: Single Chinese system voice device records explicit systemVoiceLimitationNote in NarrationSession and PlaybackDiagnostics', () => {
    const singleVoice = {
      name: 'Android 中文系统语音',
      lang: 'zh-CN',
      default: true,
      localService: true,
      voiceURI: 'Android 中文系统语音',
    } as SpeechSynthesisVoice;

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => [singleVoice],
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        onvoiceschanged: null,
      },
    });

    (speechNarrator as unknown as { initVoices: () => void }).initVoices();
    expect(speechNarrator.getDistinctSystemVoiceCount()).toBe(1);

    speechNarrator.syncWithCompanion('qiqi_deer');
    speechNarrator.speak('这是小朋友自由输入的未预录动态句子。');

    const session = speechNarrator.getNarrationSession();
    const diag = speechNarrator.getLastPlaybackDiagnostics();
    expect(session.sourceType).toBe('system-voice-shared-fallback');
    expect(session.distinctSystemVoiceCount).toBe(1);
    expect(session.systemVoiceLimitationNote).toContain('当前设备仅检测到 1 个中文系统语音');
    expect(diag?.systemVoiceLimitationNote).toContain('不冒充四角色独立系统声线');
  });

  // =========================================================================
  // Section III: P1 让换家情绪语调真实影响听感
  // =========================================================================

  it('SECTION III: Emotion tones produce distinct multi-clause ProsodyCadencePlans and dynamically modulate audio playbackRate', () => {
    vi.useFakeTimers();
    try {
      const sampleText =
        '一边舍不得离开现在的地方，一边又期待去另一边，这两种感觉可以同时待在心里，不需要二选一。';

      const lightPlan = buildProsodyCadencePlan(sampleText, 'playful-buddy', 'light-everyday');
      const warmPlan = buildProsodyCadencePlan(sampleText, 'playful-buddy', 'warm-dual-empathy');
      const factPlan = buildProsodyCadencePlan(sampleText, 'playful-buddy', 'calm-fact-clarity');
      const inquiryPlan = buildProsodyCadencePlan(sampleText, 'playful-buddy', 'gentle-inquiry');
      const safetyPlan = buildProsodyCadencePlan(sampleText, 'playful-buddy', 'protective-safety');

      expect(lightPlan.cadencePattern).toBe('brisk-light');
      expect(warmPlan.cadencePattern).toBe('warm-breathing');
      expect(factPlan.cadencePattern).toBe('steady-measured');
      expect(inquiryPlan.cadencePattern).toBe('soft-unhurried');
      expect(safetyPlan.cadencePattern).toBe('firm-grounded');

      // Audible rate and pause differentiation
      expect(lightPlan.basePlaybackRate).toBeGreaterThan(warmPlan.basePlaybackRate);
      expect(warmPlan.clausePauseMs).toBeGreaterThan(lightPlan.clausePauseMs);
      expect(inquiryPlan.sentencePauseMs).toBeGreaterThan(lightPlan.sentencePauseMs);
      expect(warmPlan.clauses.length).toBeGreaterThanOrEqual(3);
      expect(warmPlan.clauses[0].playbackRate).not.toBe(
        warmPlan.clauses[warmPlan.clauses.length - 1].playbackRate
      );

      // Verify runtime HTMLAudioElement playbackRate modulation across clauses and cancellation on switch
      speechNarrator.syncWithCompanion('guoguo_squirrel');
      speechNarrator.speak(sampleText, undefined, undefined, {
        emotionTone: 'warm-dual-empathy',
      });

      const activeAudio = speechNarrator.getActiveAudioElement() as MockHtmlAudioElement;
      expect(activeAudio).not.toBeNull();
      const firstClauseRate = activeAudio.playbackRate;
      expect(firstClauseRate).toBeCloseTo(warmPlan.clauses[0].playbackRate, 2);

      // Advance timers to final clause checkpoint -> playbackRate modulates to closing cadence
      vi.advanceTimersByTime(8000);
      expect(activeAudio.playbackRate).toBeCloseTo(
        warmPlan.clauses[warmPlan.clauses.length - 1].playbackRate,
        2
      );
    } finally {
      vi.useRealTimers();
    }
  });

  // =========================================================================
  // Section IV: P1 双向小桥使用中性首次入口
  // =========================================================================

  it('SECTION IV: TwoHomesBridgeModal opens with neutral 5-option entry gate on fresh visit (without defaulting to dual attachment) and restores saved progress on subsequent visits', () => {
    const view = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );

    // 1. Neutral entry gate is visible with all 5 neutral choices
    const gate = view.findByTestId('bridge-neutral-entry-gate');
    expect(gate).toBeTruthy();
    expect(view.findByTestId('bridge-entry-ordinary-happy')?.text).toContain('今天轻松开心');
    expect(view.findByTestId('bridge-entry-dual-attachment')?.text).toContain('有点舍不得');
    expect(view.findByTestId('bridge-entry-loyalty-conflict')?.text).toContain('担心别人的感受');
    expect(view.findByTestId('bridge-entry-specific-concern')?.text).toContain('有些害怕或说不清');
    expect(view.findByTestId('bridge-entry-story-mode')?.text).toContain(
      '想先体验一个小朋友的故事'
    );

    // 2. Does NOT default to "同时舍不得这边并期待那边" on fresh entry!
    expect(view.findByTestId('feeling-chip-miss_current_place')?.props['aria-pressed']).toBe(false);
    expect(view.findByTestId('feeling-chip-look_forward_other_place')?.props['aria-pressed']).toBe(
      false
    );
    expect(view.findByTestId('dual-feelings-coexist-badge')).toBeNull();

    // 3. Initial speech is NEUTRAL_FIRST_ENTRY
    const initialDiag = speechNarrator.getLastPlaybackDiagnostics();
    expect(initialDiag?.text).toBe(TRANSITION_FIXED_VOICE_LINES.NEUTRAL_FIRST_ENTRY);
    expect(initialDiag?.sourceType).toBe('prebaked-mp3');

    // 4. Child chooses "今天轻松开心" -> routes to ORDINARY_HAPPY_TRANSITION and saves progress
    view.click(view.findByTestId('bridge-entry-ordinary-happy')!);
    expect(view.findByTestId('bridge-neutral-entry-gate')).toBeNull();
    expect(view.findByTestId('bridge-restored-progress-banner')?.text).toContain('轻松过桥');
    expect(view.findByTestId('ordinary-no-anxiety-soothing')).toBeTruthy();
    view.unmount();

    // 5. Re-open TwoHomesBridgeModal -> restores "轻松过桥" progress without overwriting child's choice
    const reopenedView = createStatefulTestRenderer(
      <AppProvider>
        <TwoHomesBridgeModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );
    expect(reopenedView.findByTestId('bridge-neutral-entry-gate')).toBeNull();
    expect(reopenedView.findByTestId('bridge-restored-progress-banner')?.text).toContain(
      '轻松过桥'
    );
    expect(reopenedView.findByTestId('ordinary-no-anxiety-soothing')).toBeTruthy();

    // Can also re-open neutral entry gate and choose "想先体验一个小朋友的故事"
    reopenedView.click(reopenedView.findByTestId('bridge-reopen-neutral-entry-btn')!);
    expect(reopenedView.findByTestId('bridge-neutral-entry-gate')).toBeTruthy();
    reopenedView.click(reopenedView.findByTestId('bridge-entry-story-mode')!);
    expect(reopenedView.findByTestId('bridge-restored-progress-banner')?.text).toContain(
      '故事体验模式'
    );
    expect(speechNarrator.getLastPlaybackDiagnostics()?.text).toBe(
      TRANSITION_FIXED_VOICE_LINES.STORY_MODE_ENTRY
    );

    reopenedView.unmount();
  });
});
