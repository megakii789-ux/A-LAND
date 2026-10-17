import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { StoryGroveModal } from '../components/ChildIsland/StoryGrove/StoryGroveModal';
import {
  resolveActiveStorySpeaker,
  resolveStoryCharacterVisualState,
  STORY_CUP_SCENE_LAYERS,
  STORY_CUP_PROPS,
  STORY_CUP_STAGE_MATRIX_DESKTOP,
  STORY_CUP_STAGE_MATRIX_MOBILE,
  resolveStoryCupStageMatrixForWidth,
} from '../visual-v2/story-cup-pilot/StoryCupSceneArtV2';
import {
  grantParentAccess,
  enableInternalPlaytestMode,
  disableInternalPlaytestMode,
  lockParentAccess,
  resetParentPinForTesting,
} from '../domain/privacy/parentAccess';
import { resetProductExperienceMetrics } from '../domain/cognitive/productExperienceMetrics';
import { resetPersonalizationProfile } from '../domain/personalization';
import { speechNarrator } from '../utils/speech';

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

  function keyDown(target: any, key: string) {
    if (!target || !target.props || typeof target.props.onKeyDown !== 'function') {
      throw new Error('Target does not support onKeyDown');
    }
    target.props.onKeyDown({
      key,
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    flush();
  }

  flush();

  return {
    findAll,
    findByTestId,
    click,
    keyDown,
    flush,
  };
}

describe('A-LAND V2.2 StoryGrove::cup-size Visual Skinning Pilot (Gate 1–Gate 3R)', () => {
  beforeEach(() => {
    const localStore = new Map<string, string>();
    const sessionStore = new Map<string, string>();
    (globalThis as any).window = {
      innerWidth: 1440,
      innerHeight: 900,
      location: { pathname: '/visual-v2-review/story-cup-pilot', search: '' },
      localStorage: {
        getItem: (k: string) => localStore.get(k) ?? null,
        setItem: (k: string, v: string) => localStore.set(k, String(v)),
        removeItem: (k: string) => localStore.delete(k),
        clear: () => localStore.clear(),
      },
      sessionStorage: {
        getItem: (k: string) => sessionStore.get(k) ?? null,
        setItem: (k: string, v: string) => sessionStore.set(k, String(v)),
        removeItem: (k: string) => sessionStore.delete(k),
        clear: () => sessionStore.clear(),
      },
      matchMedia: () => ({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
      addEventListener: () => {},
      removeEventListener: () => {},
      setInterval: () => 1,
      clearInterval: () => {},
      setTimeout: () => 1,
      clearTimeout: () => {},
      speechSynthesis: {
        getVoices: () => [],
        speak: () => {},
        cancel: () => {},
        pause: () => {},
        resume: () => {},
      },
    };
    (globalThis as any).localStorage = (globalThis as any).window.localStorage;
    (globalThis as any).sessionStorage = (globalThis as any).window.sessionStorage;

    disableInternalPlaytestMode();
    lockParentAccess();
    resetParentPinForTesting();
    resetProductExperienceMetrics();
    resetPersonalizationProfile();
    speechNarrator.stop();
  });

  it('enforces ContentAuditRegistry Fail-Closed in child mode before adult PIN unlock', () => {
    disableInternalPlaytestMode();
    const renderer = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} visualV2Pilot={true} />
      </AppProvider>
    );

    const cupLeafBtn = renderer.findByTestId('story-catalog-leaf-cup-size');
    expect(cupLeafBtn).toBeTruthy();
    renderer.click(cupLeafBtn);

    expect(renderer.findByTestId('story-leaf-audit-gate-blocked')).toBeTruthy();
    expect(renderer.findByTestId('interactive-leaf-view-cup-size')).toBeNull();
  });

  it('renders 5 independent layers (L1..L5), 4 SVG props, 2 9-part character rigs, and hides debug inspector inside a default-closed drawer until expanded', () => {
    grantParentAccess();
    enableInternalPlaytestMode();
    const renderer = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} visualV2Pilot={true} />
      </AppProvider>
    );

    renderer.click(renderer.findByTestId('story-catalog-leaf-cup-size'));

    expect(renderer.findByTestId('interactive-leaf-view-cup-size')).toBeTruthy();

    // P1-03: Debug drawer is closed by default in the child interface
    const drawerToggle = renderer.findByTestId('v2-story-cup-debug-drawer-toggle');
    expect(drawerToggle).toBeTruthy();
    expect(drawerToggle.props['aria-expanded']).toBe(false);
    expect(renderer.findByTestId('v2-story-cup-pilot-inspector')).toBeNull();

    // Expanding the reviewer debug drawer reveals QA badges and L1..L5 toggles
    renderer.click(drawerToggle);
    expect(renderer.findByTestId('v2-story-cup-debug-drawer-toggle').props['aria-expanded']).toBe(
      true
    );
    expect(renderer.findByTestId('v2-story-cup-pilot-inspector')).toBeTruthy();
    expect(renderer.findByTestId('v2-story-cup-qa-badge')?.text).toContain('ART_DIRECTOR_QA_HOLD');
    expect(renderer.findByTestId('v2-story-cup-content-qa-flag')?.text).toContain(
      'CONTENT_QA_REVIEW'
    );

    // Verify all 5 layers are mounted and visible initially
    for (const layer of STORY_CUP_SCENE_LAYERS) {
      const layerEl = renderer.findByTestId(`v2-story-cup-layer-${layer.id}`);
      expect(layerEl?.props['data-layer-visible']).toBe('true');
    }

    // Toggle L1 off individually
    renderer.click(renderer.findByTestId('v2-layer-toggle-L1'));
    expect(renderer.findByTestId('v2-story-cup-layer-L1')?.props['data-layer-visible']).toBe(
      'false'
    );
    expect(renderer.findByTestId('v2-story-cup-layer-L3')?.props['data-layer-visible']).toBe(
      'true'
    );

    // Reset all 5 layers
    renderer.click(renderer.findByTestId('v2-layer-toggle-reset'));
    expect(renderer.findByTestId('v2-story-cup-layer-L1')?.props['data-layer-visible']).toBe(
      'true'
    );

    // Verify all 4 V2 SVG props exist inside story-interactive-svg-cup-size with pointerEvents: none
    for (const propKey of Object.keys(STORY_CUP_PROPS)) {
      const propImg = renderer.findByTestId(`v2-prop-image-${propKey}`);
      expect(propImg).toBeTruthy();
      expect(propImg.props.style?.pointerEvents).toBe('none');
    }

    // Verify both 9-part character rigs (Tiaotiao & Pupu) are mounted
    const tiaotiaoRig = renderer.findByTestId('story-character-rig-tiaotiao_story_squirrel');
    const pupuRig = renderer.findByTestId('story-character-rig-pupu_story_elephant');
    expect(tiaotiaoRig).toBeTruthy();
    expect(pupuRig).toBeTruthy();
    expect(tiaotiaoRig.props['data-character-role']).toBe(
      'story-actor-only-not-global-companion'
    );
    expect(pupuRig.props['data-character-role']).toBe('story-actor-only-not-global-companion');

    // Each rig renders 7 base parts + 1 eye part + 1 mouth part = 9 SVG rig parts
    const tiaotiaoParts = renderer.findAll(
      (n) => Boolean(n.props && n.props['data-rig-part']),
      tiaotiaoRig
    );
    const pupuParts = renderer.findAll(
      (n) => Boolean(n.props && n.props['data-rig-part']),
      pupuRig
    );
    expect(tiaotiaoParts.length).toBe(9);
    expect(pupuParts.length).toBe(9);
  });

  it('preserves cup positions (CENTER_TABLE, NEXT_TO_BLOCK, NEXT_TO_BUCKET), keyboard control, and partial vs complete outcomes', () => {
    grantParentAccess();
    enableInternalPlaytestMode();
    const renderer = createStatefulTestRenderer(
      <AppProvider>
        <StoryGroveModal isOpen={true} onClose={() => {}} visualV2Pilot={true} />
      </AppProvider>
    );

    renderer.click(renderer.findByTestId('story-catalog-leaf-cup-size'));

    const sceneContainer = renderer.findByTestId('interactive-leaf-scene-cup-size');
    expect(sceneContainer.props['data-cup-position']).toBe('CENTER_TABLE');

    // Gate 4R (Gate3R-UX-02): Verify V2 SVG interactive targets have v2-story-svg-focusable and no inline outline:none
    const dropzoneBlock = renderer.findByTestId('cup-dropzone-NEXT_TO_BLOCK');
    const dropzoneCenter = renderer.findByTestId('cup-dropzone-CENTER_TABLE');
    const dropzoneBucket = renderer.findByTestId('cup-dropzone-NEXT_TO_BUCKET');
    const movableCup = renderer.findByTestId('movable-blue-cup-prop');

    for (const svgTarget of [dropzoneBlock, dropzoneCenter, dropzoneBucket, movableCup]) {
      expect(svgTarget.props.className).toBe('v2-story-svg-focusable');
      expect(svgTarget.props.style?.outline).toBeUndefined();
      expect(svgTarget.props.role).toBe('button');
      expect(svgTarget.props.tabIndex).toBe(0);
    }

    // Dropzone Enter / Space keyboard activation
    renderer.keyDown(dropzoneBucket, ' ');
    expect(
      renderer.findByTestId('interactive-leaf-scene-cup-size').props['data-cup-position']
    ).toBe('NEXT_TO_BUCKET');
    renderer.keyDown(dropzoneCenter, 'Enter');
    expect(
      renderer.findByTestId('interactive-leaf-scene-cup-size').props['data-cup-position']
    ).toBe('CENTER_TABLE');

    // Keyboard navigation on movable-blue-cup-prop: ArrowLeft -> NEXT_TO_BLOCK
    renderer.keyDown(movableCup, 'ArrowLeft');
    expect(
      renderer.findByTestId('interactive-leaf-scene-cup-size').props['data-cup-position']
    ).toBe('NEXT_TO_BLOCK');

    // Selecting partial action act_only_look_squirrel must NOT trigger celebrate state
    renderer.click(renderer.findByTestId('story-action-act_only_look_squirrel'));
    speechNarrator.stop();
    renderer.flush();
    expect(
      renderer.findByTestId('story-character-rig-tiaotiao_story_squirrel').props['data-actor-state']
    ).toBe('think');
    expect(
      renderer.findByTestId('story-character-rig-pupu_story_elephant').props['data-actor-state']
    ).toBe('think');

    // Move cup to NEXT_TO_BUCKET via button and inspect remaining hotspots
    renderer.click(renderer.findByTestId('move-cup-to-bucket'));
    expect(
      renderer.findByTestId('interactive-leaf-scene-cup-size').props['data-cup-position']
    ).toBe('NEXT_TO_BUCKET');
    expect(
      renderer.findByTestId('interactive-leaf-scene-cup-size').props['data-compared-count']
    ).toBe(2);

    renderer.click(renderer.findByTestId('story-hotspot-obj_blue_cup'));
    renderer.click(renderer.findByTestId('story-hotspot-obj_twig_ruler'));

    // Select complete comparison action act_compare_both_sides
    renderer.click(renderer.findByTestId('story-action-act_compare_both_sides'));
    speechNarrator.stop();
    renderer.flush();

    expect(
      renderer.findByTestId('story-character-rig-tiaotiao_story_squirrel').props['data-actor-state']
    ).toBe('celebrate');
    expect(
      renderer.findByTestId('story-character-rig-pupu_story_elephant').props['data-actor-state']
    ).toBe('celebrate');
  });

  it('prevents Tiaotiao and Pupu from talking simultaneously and keeps both listening when global narrator speaks (P1-02)', () => {
    // 1. Global narrator reading general scene prompt (activeHotspotId === null): neither character talks
    expect(
      resolveActiveStorySpeaker({
        playbackStatus: 'playing',
        activeHotspotId: null,
        selectedSceneActionId: null,
      })
    ).toBe('narrator_or_multi');
    expect(
      resolveStoryCharacterVisualState({
        characterId: 'tiaotiao_story_squirrel',
        playbackStatus: 'playing',
        selectedSceneActionId: null,
        hasAllRequiredEvidence: false,
        isGoalCompleted: false,
        activeHotspotId: null,
        cupPosition: 'CENTER_TABLE',
        isBlinkTick: false,
        prefersReducedMotion: false,
      })
    ).toBe('idle');
    expect(
      resolveStoryCharacterVisualState({
        characterId: 'pupu_story_elephant',
        playbackStatus: 'playing',
        selectedSceneActionId: null,
        hasAllRequiredEvidence: false,
        isGoalCompleted: false,
        activeHotspotId: null,
        cupPosition: 'CENTER_TABLE',
        isBlinkTick: false,
        prefersReducedMotion: false,
      })
    ).toBe('idle');

    // 2. Tiaotiao speaking (activeHotspotId === 'obj_wooden_block'): ONLY Tiaotiao talks, Pupu listens
    expect(
      resolveActiveStorySpeaker({
        playbackStatus: 'playing',
        activeHotspotId: 'obj_wooden_block',
        selectedSceneActionId: null,
      })
    ).toBe('tiaotiao_story_squirrel');
    expect(
      resolveStoryCharacterVisualState({
        characterId: 'tiaotiao_story_squirrel',
        playbackStatus: 'playing',
        selectedSceneActionId: null,
        hasAllRequiredEvidence: false,
        isGoalCompleted: false,
        activeHotspotId: 'obj_wooden_block',
        cupPosition: 'NEXT_TO_BLOCK',
        isBlinkTick: false,
        prefersReducedMotion: false,
      })
    ).toBe('talk');
    expect(
      resolveStoryCharacterVisualState({
        characterId: 'pupu_story_elephant',
        playbackStatus: 'playing',
        selectedSceneActionId: null,
        hasAllRequiredEvidence: false,
        isGoalCompleted: false,
        activeHotspotId: 'obj_wooden_block',
        cupPosition: 'NEXT_TO_BLOCK',
        isBlinkTick: false,
        prefersReducedMotion: false,
      })
    ).toBe('think');

    // 3. Pupu speaking (activeHotspotId === 'obj_elephant_bucket'): ONLY Pupu talks, Tiaotiao listens
    expect(
      resolveActiveStorySpeaker({
        playbackStatus: 'playing',
        activeHotspotId: 'obj_elephant_bucket',
        selectedSceneActionId: null,
      })
    ).toBe('pupu_story_elephant');
    expect(
      resolveStoryCharacterVisualState({
        characterId: 'pupu_story_elephant',
        playbackStatus: 'playing',
        selectedSceneActionId: null,
        hasAllRequiredEvidence: false,
        isGoalCompleted: false,
        activeHotspotId: 'obj_elephant_bucket',
        cupPosition: 'NEXT_TO_BUCKET',
        isBlinkTick: false,
        prefersReducedMotion: false,
      })
    ).toBe('talk');
    expect(
      resolveStoryCharacterVisualState({
        characterId: 'tiaotiao_story_squirrel',
        playbackStatus: 'playing',
        selectedSceneActionId: null,
        hasAllRequiredEvidence: false,
        isGoalCompleted: false,
        activeHotspotId: 'obj_elephant_bucket',
        cupPosition: 'NEXT_TO_BUCKET',
        isBlinkTick: false,
        prefersReducedMotion: false,
      })
    ).toBe('think');

    // 4. Multi-speaker action summary (selectedSceneActionId !== null): narrator/multi-speaker, neither enters simultaneous talk
    expect(
      resolveActiveStorySpeaker({
        playbackStatus: 'playing',
        activeHotspotId: 'obj_elephant_bucket',
        selectedSceneActionId: 'act_compare_both_sides',
      })
    ).toBe('narrator_or_multi');
    expect(
      resolveStoryCharacterVisualState({
        characterId: 'tiaotiao_story_squirrel',
        playbackStatus: 'playing',
        selectedSceneActionId: 'act_compare_both_sides',
        hasAllRequiredEvidence: true,
        isGoalCompleted: true,
        activeHotspotId: 'obj_elephant_bucket',
        cupPosition: 'NEXT_TO_BUCKET',
        isBlinkTick: false,
        prefersReducedMotion: false,
      })
    ).toBe('think');

    // 5. Speech paused -> idle (no fake talking loop while paused)
    expect(
      resolveStoryCharacterVisualState({
        characterId: 'tiaotiao_story_squirrel',
        playbackStatus: 'paused',
        selectedSceneActionId: null,
        hasAllRequiredEvidence: false,
        isGoalCompleted: false,
        activeHotspotId: 'obj_wooden_block',
        cupPosition: 'NEXT_TO_BLOCK',
        isBlinkTick: false,
        prefersReducedMotion: false,
      })
    ).toBe('idle');
  });

  it('resolves unified desktop vs mobile stage matrices with >=56px touch hitboxes (P1-01 & P1-04)', () => {
    expect(resolveStoryCupStageMatrixForWidth(390)).toBe(STORY_CUP_STAGE_MATRIX_MOBILE);
    expect(resolveStoryCupStageMatrixForWidth(768)).toBe(STORY_CUP_STAGE_MATRIX_DESKTOP);

    expect(STORY_CUP_STAGE_MATRIX_MOBILE.svgViewBox).toBe('0 0 420 747');
    expect(STORY_CUP_STAGE_MATRIX_DESKTOP.svgViewBox).toBe('0 0 420 220');

    // On mobile 360px (container ~302px wide), scale is 302/420 = 0.719; width 84 * 0.719 = 60.4px >= 56px
    expect(STORY_CUP_STAGE_MATRIX_MOBILE.dropZones.NEXT_TO_BLOCK.width).toBeGreaterThanOrEqual(84);
    expect(STORY_CUP_STAGE_MATRIX_MOBILE.dropZones.NEXT_TO_BLOCK.height).toBeGreaterThanOrEqual(86);
    expect(STORY_CUP_STAGE_MATRIX_MOBILE.dropZones.NEXT_TO_BLOCK.y).toBeGreaterThanOrEqual(480);
  });
});

