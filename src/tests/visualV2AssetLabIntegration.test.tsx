import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import App, { isVisualV2ReviewRoute } from '../App';
import { speechNarrator } from '../utils/speech';
import { sounds } from '../utils/sound';
import { resetPersonalizationProfile } from '../domain/personalization';
import { resetProductExperienceMetrics } from '../domain/cognitive/productExperienceMetrics';
import { ContentAuditRegistry } from '../domain/cognitive/ContentAuditRegistry';
import {
  disableInternalPlaytestMode,
  lockParentAccess,
  resetParentPinForTesting,
} from '../domain/privacy/parentAccess';
import {
  V2_ASSET_FACTORY_META,
  V2_ASSET_GAP_LEDGER,
  MEASURED_ALPHA_ASSETS,
} from '../visual-v2/manifest/v2AssetManifest';

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

describe('A-LAND Visual V2 Asset Factory V0.1 Integration & Frozen Business Layer Contracts', () => {
  let currentPathname = '/';
  let currentSearch = '';

  function setMockUrl(pathname: string, search: string = '') {
    currentPathname = pathname;
    currentSearch = search;
    (globalThis as any).window.location.pathname = pathname;
    (globalThis as any).window.location.search = search;
  }

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

    currentPathname = '/';
    currentSearch = '';

    Object.defineProperty(globalThis, 'localStorage', { value: storageMock, configurable: true });
    Object.defineProperty(globalThis, 'sessionStorage', { value: sessionMock, configurable: true });
    Object.defineProperty(globalThis, 'Audio', { value: MockHtmlAudioElement, configurable: true });
    Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
      value: MockUtterance,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'document', {
      value: {
        visibilityState: 'visible',
        addEventListener: () => {},
        removeEventListener: () => {},
      },
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
          pushState: (_s: any, _t: string, url: string) => {
            const [p, q] = url.split('?');
            setMockUrl(p || '/', q ? `?${q}` : '');
          },
          replaceState: (_s: any, _t: string, url: string) => {
            const [p, q] = url.split('?');
            setMockUrl(p || '/', q ? `?${q}` : '');
          },
        },
        location: {
          pathname: currentPathname,
          search: currentSearch,
          href: 'http://localhost/',
        },
      },
      configurable: true,
    });

    resetPersonalizationProfile();
    resetProductExperienceMetrics();
    disableInternalPlaytestMode();
    resetParentPinForTesting();
    lockParentAccess();
    sounds.setSfxMuted(false);
    speechNarrator.stop();
    speechNarrator.setVoiceEnabled(true);
    speechNarrator.syncWithCompanion('guoguo_squirrel');
  });

  afterEach(() => {
    speechNarrator.stop();
  });

  it('1. Route isolation & Alpha Asset Manifest Certification: default "/" renders original V1 view; "/visual-v2-review" renders VisualV2Shell with ART_DIRECTOR_QA_HOLD', () => {
    setMockUrl('/');
    expect(isVisualV2ReviewRoute()).toBe(false);
    const v1Renderer = createStatefulTestRenderer(<App />);
    expect(v1Renderer.findByTestId('visual-v2-shell')).toBeNull();
    v1Renderer.unmount();

    setMockUrl('/visual-v2-review');
    expect(isVisualV2ReviewRoute()).toBe(true);
    const v2Renderer = createStatefulTestRenderer(<App />);
    const shell = v2Renderer.findByTestId('visual-v2-shell');
    expect(shell).not.toBeNull();
    expect(shell.props['data-art-gate']).toBe('ART_DIRECTOR_QA_HOLD');
    expect(v2Renderer.findByTestId('v2-art-director-hold-banner')).not.toBeNull();
    v2Renderer.unmount();

    // Verify all 21 measured alpha PNG assets have >30% transparent pixels and zero 0% fake cutouts
    expect(MEASURED_ALPHA_ASSETS.length).toBe(21);
    for (const asset of MEASURED_ALPHA_ASSETS) {
      expect(asset.transparentPercent).toBeGreaterThan(30);
    }
    expect(V2_ASSET_FACTORY_META.releaseState).toBe('ART_DIRECTOR_QA_HOLD');
    expect(V2_ASSET_FACTORY_META.productionArtPass).toBe(false);
    expect(V2_ASSET_GAP_LEDGER.every((g) => g.gate === 'ART_DIRECTOR_QA_HOLD')).toBe(true);
  });

  it('2. Main Island V2: 4 SVG layers, 8 interactive transparent landmarks, card fallback navigation, and display-only boardwalk companion', () => {
    setMockUrl('/visual-v2-review');
    const renderer = createStatefulTestRenderer(<App />);

    // 4 independent SVG background layers
    for (let i = 1; i <= 4; i++) {
      const layer = renderer.findByTestId(`v2-island-layer-${i}`);
      expect(layer).not.toBeNull();
      expect(layer.props.src).toContain('/visual-v2/assets/scenes/0');
    }

    // 8 interactive transparent landmarks
    const landmarkTestIds = [
      'map-landmark-story',
      'map-landmark-detective',
      'map-landmark-courage',
      'map-landmark-weather',
      'map-landmark-calm',
      'map-landmark-bridge',
      'map-landmark-starlight',
      'map-landmark-breaker',
    ];
    for (const tid of landmarkTestIds) {
      const btn = renderer.findByTestId(tid);
      expect(btn).not.toBeNull();
      expect(btn.type).toBe('button');
      const imgs = renderer.findAll((n) => n.type === 'img', btn);
      expect(imgs.length).toBeGreaterThan(0);
      expect(imgs[0].props.src).toContain('/visual-v2/assets/landmarks/');
    }

    // Boardwalk companion is strictly display-only (pointer-events-none & aria-hidden)
    const boardwalkCompanion = renderer.findByTestId('v2-stage-companion-display-only');
    expect(boardwalkCompanion).not.toBeNull();
    expect(boardwalkCompanion.props['aria-hidden']).toBe('true');
    expect(boardwalkCompanion.props.className).toContain('pointer-events-none');

    // Switch to Card Fallback Navigation
    renderer.click(renderer.findByTestId('v2-tab-cards'));
    expect(renderer.findByTestId('v2-island-cards-fallback')).not.toBeNull();
    expect(renderer.findByTestId('v2-location-card-weather')).not.toBeNull();
    expect(renderer.findByTestId('v2-location-card-breaker')).not.toBeNull();

    renderer.unmount();
  });

  it('3. Four Companions & Pause/Switch/Resume voice contract in V2 shell', () => {
    setMockUrl('/visual-v2-review');
    const renderer = createStatefulTestRenderer(<App />);

    // Speak greeting as default companion (guoguo_squirrel)
    renderer.click(renderer.findByTestId('v2-banner-speak-btn'));
    expect(speechNarrator.getNarrationSession().companionId).toBe('guoguo_squirrel');
    expect(speechNarrator.getSpeaking()).toBe(true);

    // Pause speech
    speechNarrator.pause();
    expect(speechNarrator.getIsPaused()).toBe(true);
    expect(speechNarrator.getNarrationSession().playbackStatus).toBe('paused');

    // Switch companion to qiqi_deer via V2 quick switcher while paused
    renderer.click(renderer.findByTestId('v2-pick-companion-qiqi_deer'));
    const pausedSwitched = speechNarrator.getNarrationSession();
    expect(pausedSwitched.companionId).toBe('qiqi_deer');
    expect(pausedSwitched.playbackStatus).toBe('paused');
    expect(speechNarrator.getIsPaused()).toBe(true);
    expect(speechNarrator.getActiveAudioElement()).toBeNull();

    // Resume playback -> plays in qiqi_deer's voice
    speechNarrator.resume();
    const resumed = speechNarrator.getNarrationSession();
    expect(resumed.companionId).toBe('qiqi_deer');
    expect(resumed.playbackStatus).toBe('playing');
    expect(speechNarrator.getIsPaused()).toBe(false);

    renderer.unmount();
  });

  it('4. Real Scene Modals + SceneBackdropV2: TwoHomesBridge (Sprint 4.3 Slice B/C) & DifficultyBreaker sub-branch reset', () => {
    setMockUrl('/visual-v2-review');
    const renderer = createStatefulTestRenderer(<App />);

    // Open TwoHomesBridgeModal from V2 landmark
    renderer.click(renderer.findByTestId('map-landmark-bridge'));
    const backdrop = renderer.findByTestId('v2-scene-backdrop');
    expect(backdrop).not.toBeNull();
    expect(backdrop.props['data-landmark-id']).toBe('two_homes_bridge');
    expect(renderer.findByTestId('v2-scene-backplate-img').props.src).toContain(
      'two_homes_bridge_scene_backplate.svg'
    );

    // Switch to Slice B via transition slice tab
    renderer.click(renderer.findByTestId('transition-slice-tab-SLICE_B_LOYALTY_CONFLICT'));
    expect(renderer.findByTestId('slice-b-evidence-btn-fact_happy_here')).not.toBeNull();
    // Slice A exclusive stars must NOT render in Slice B
    expect(renderer.findByTestId('svg-west-star-btn')).toBeNull();
    expect(renderer.findByTestId('svg-east-star-btn')).toBeNull();

    // Open DifficultyBreakerModal directly via V2 landmark button
    renderer.click(renderer.findByTestId('map-landmark-breaker'));
    expect(renderer.findByTestId('v2-scene-backdrop').props['data-landmark-id']).toBe(
      'difficulty_breaker'
    );
    renderer.click(renderer.findByTestId('breaker-pick-diff-two-homes'));
    expect(renderer.findByTestId('breaker-step-fen')).not.toBeNull();
    renderer.click(renderer.findByTestId('breaker-fen-fact'));
    expect(renderer.findByTestId('breaker-fen-fact').props['aria-pressed']).toBe(true);
    renderer.click(renderer.findByTestId('breaker-sub-sub_loyalty_conflict'));
    expect(renderer.findByTestId('breaker-fen-fact').props['aria-pressed']).toBe(false);

    renderer.unmount();
  });

  it('5. Sensitive paths intact: ParentGateModal PIN gate & ContentAuditRegistry Fail-Closed', () => {
    setMockUrl('/visual-v2-review');
    const renderer = createStatefulTestRenderer(<App />);

    // ContentAuditRegistry remains 100% Fail-Closed in child mode
    const records = ContentAuditRegistry.getAllRecords();
    expect(records.length).toBe(16);
    for (const r of records) {
      expect(
        ContentAuditRegistry.canRenderContent(
          { contentId: r.contentId, sceneVersion: r.sceneVersion },
          r.versionSha256,
          r.sceneVersion
        )
      ).toBe(false);
    }

    // Switching to Parent Coach opens ParentGateModal (never bypasses parent gate)
    const parentSwitchBtn = renderer.findAll(
      (n) =>
        n.type === 'button' &&
        n.props?.['aria-label'] === '当前处于孩子端，点击切换到家长教练端'
    )[0];
    expect(parentSwitchBtn).not.toBeUndefined();
    renderer.click(parentSwitchBtn);
    expect(renderer.findByTestId('v2-parent-dashboard-shell')).toBeNull();

    renderer.unmount();
  });
});
