import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { AppProvider } from '../context/AppContext';
import { WeatherStationModal } from '../components/ChildIsland/WeatherStationModal';
import { CalmSpace } from '../components/ChildIsland/CalmSpace';
import { CalmCornerModal } from '../components/ChildIsland/CalmCornerModal';
import {
  V2_3_BATCH01_META,
  V2_3_WEATHER_STATION_ASSETS,
  V2_3_CALM_CORNER_ASSETS,
  V2_3_CHARACTER_RIG_ASSETS,
  V2_3_PREPRODUCTION_TRACKED_RISKS,
  getWeatherStationLayers,
  getCalmCornerLayers,
  getCompanionRigLayers,
} from '../visual-v2/manifest/v2_3Batch01Manifest';
import {
  V2_3ResilientSvgLayer,
  V2_3CompanionRigActor,
} from '../visual-v2/adapters/V2_3LayerStageAdapter';
import { resolveCalmCornerAssetState } from '../visual-v2/batch01/CalmCornerSceneArtV2';
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

  function renderNode(node: any, pathKey: string): any {
    if (node === null || node === undefined || typeof node === 'boolean') return null;
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) {
      return node.map((child, i) => renderNode(child, `${pathKey}.${i}`)).filter((x) => x !== null);
    }
    if (!React.isValidElement(node)) return null;

    const element = node as React.ReactElement<any>;
    const type = element.type as any;

    if (type === React.Fragment) {
      return renderNode(element.props.children, `${pathKey}.f`);
    }

    if (typeof type === 'object' && type !== null) {
      if ('_context' in type || '$$typeof' in type) {
        const ctx = type._context || type;
        if ('value' in element.props) {
          contextStack.push({ context: ctx, value: element.props.value });
          const rendered = renderNode(element.props.children, `${pathKey}.ctx`);
          contextStack.pop();
          return rendered;
        }
      }
    }

    if (typeof type === 'function') {
      const compName = type.displayName || type.name || 'Anon';
      const instanceKey = `${pathKey}:${compName}${element.key != null ? `:${element.key}` : ''}`;
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
      const children = renderNode(element.props.children, `${pathKey}.${type}`);
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

  function findByAriaLabel(labelSubstring: string) {
    return (
      findAll(
        (n) =>
          n.props &&
          typeof n.props['aria-label'] === 'string' &&
          n.props['aria-label'].includes(labelSubstring)
      )[0] || null
    );
  }

  function click(target: any) {
    if (!target || !target.props || typeof target.props.onClick !== 'function') {
      throw new Error('Target is not clickable');
    }
    target.props.onClick({
      stopPropagation: () => {},
      preventDefault: () => {},
    });
    flush();
  }

  flush();

  return {
    get tree() {
      return latestTree;
    },
    flush,
    findAll,
    findByTestId,
    findByAriaLabel,
    click,
    rerender(nextElement: React.ReactElement) {
      rootElement = nextElement;
      flush();
    },
  };
}

describe('A-LAND V2.3 Batch 01 — Weather Station & Calm Corner Independent Skin Integration', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    resetProductExperienceMetrics();
    resetPersonalizationProfile();
    speechNarrator.stop();
  });

  describe('Gate A: Resource Manifest, SHA-256 Verification, Shared-Geometry Disclosure & Companion Rig Adapters', () => {
    it('discloses V2.3 package metadata, 318 SVG files / 94 unique bodies, and mandatory hold flags', () => {
      expect(V2_3_BATCH01_META.packageVersion).toBe('A_LAND_V2_3_TECH_VECTOR_LAYER_FACTORY_20261017');
      expect(V2_3_BATCH01_META.zipSha256).toBe(
        'f98f3d84f87e0a358e522d0566acf3628c1c66234d3181f59bd00fae07637a74'
      );
      expect(V2_3_BATCH01_META.zipBytes).toBe(359075);
      expect(V2_3_BATCH01_META.newEditableSvgMasters).toBe(318);
      expect(V2_3_BATCH01_META.uniqueSvgByteBodies).toBe(94);
      expect(V2_3_BATCH01_META.productionQualityApproved).toBe(0);
      expect(V2_3_BATCH01_META.flags.ART_DIRECTOR_QA_HOLD).toBe(true);
      expect(V2_3_BATCH01_META.flags.TECH_PREVIEW_NOT_ART_APPROVED).toBe(true);
      expect(V2_3_BATCH01_META.flags.CONTENT_QA_REVIEW).toBe(true);
      expect(V2_3_BATCH01_META.flags.PRODUCTION_RELEASE_HOLD).toBe(true);
      expect(V2_3_BATCH01_META.flags.V2_3_BATCH01_TECH_INTEGRATION_AUTHORIZED).toBe(true);
      expect(V2_3_BATCH01_META.flags.ENGINEERING_PILOT_AUDIT_PASS_STORY_CUP_ONLY).toBe(true);
      expect(V2_3_PREPRODUCTION_TRACKED_RISKS.length).toBe(3);
    });

    it('verifies every Batch 01 SVG asset on disk matches its recorded SHA-256 and byte length', () => {
      expect(V2_3_WEATHER_STATION_ASSETS.length).toBe(18);
      expect(V2_3_CALM_CORNER_ASSETS.length).toBe(8);
      expect(V2_3_CHARACTER_RIG_ASSETS.length).toBe(168);

      const allBatch01Assets = [
        ...V2_3_WEATHER_STATION_ASSETS,
        ...V2_3_CALM_CORNER_ASSETS,
        ...V2_3_CHARACTER_RIG_ASSETS,
      ];
      expect(allBatch01Assets.length).toBe(194);

      const publicRoot = path.resolve(process.cwd(), 'public');
      for (const asset of allBatch01Assets) {
        const diskPath = path.join(publicRoot, asset.publicUrl.replace(/^\//, ''));
        expect(fs.existsSync(diskPath)).toBe(true);
        const buf = fs.readFileSync(diskPath);
        const actualSha256 = crypto.createHash('sha256').update(buf).digest('hex');
        expect(buf.length).toBe(asset.bytes);
        expect(actualSha256).toBe(asset.sha256);
      }
    });

    it('explicitly flags shared SVG geometry fixtures in Weather Station and Calm Corner', () => {
      const sunnyLayers = getWeatherStationLayers('sunny');
      const optOutLayers = getWeatherStationLayers('opt_out');
      expect(sunnyLayers.backplate.isSharedGeometryFixture).toBe(true);
      expect(optOutLayers.backplate.isSharedGeometryFixture).toBe(true);
      expect(sunnyLayers.backplate.sha256).toBe(optOutLayers.backplate.sha256);

      const cloudyLayers = getWeatherStationLayers('cloudy');
      const foggyLayers = getWeatherStationLayers('foggy');
      expect(cloudyLayers.backplate.isSharedGeometryFixture).toBe(true);
      expect(foggyLayers.backplate.isSharedGeometryFixture).toBe(true);
      expect(cloudyLayers.backplate.sha256).toBe(foggyLayers.backplate.sha256);

      const rainyLayers = getWeatherStationLayers('rainy');
      const stormyLayers = getWeatherStationLayers('stormy');
      expect(rainyLayers.backplate.isSharedGeometryFixture).toBe(false);
      expect(stormyLayers.backplate.isSharedGeometryFixture).toBe(false);

      const calmRest = getCalmCornerLayers('rest');
      const calmInhale = getCalmCornerLayers('inhale');
      const calmExhale = getCalmCornerLayers('exhale');
      const calmPaused = getCalmCornerLayers('paused');
      expect(calmRest.room.isSharedGeometryFixture).toBe(true);
      expect(calmInhale.room.isSharedGeometryFixture).toBe(true);
      expect(calmExhale.room.isSharedGeometryFixture).toBe(true);
      expect(calmPaused.room.isSharedGeometryFixture).toBe(false);
      expect(calmPaused.room.sha256).not.toBe(calmRest.room.sha256);
    });

    it('triggers deterministic SVG data-URI fallback when an asset fails to load', () => {
      const sampleAsset = getWeatherStationLayers('sunny').backplate;
      const renderer = createStatefulTestRenderer(
        <V2_3ResilientSvgLayer record={sampleAsset} testId="test-resilient-layer" />
      );

      const imgBefore = renderer.findByTestId('test-resilient-layer');
      expect(imgBefore).not.toBeNull();
      expect(imgBefore.props['data-fallback-active']).toBe('false');
      expect(imgBefore.props.src).toBe(sampleAsset.publicUrl);

      // Simulate image load failure
      imgBefore.props.onError();
      renderer.flush();

      const imgAfter = renderer.findByTestId('test-resilient-layer');
      expect(imgAfter.props['data-fallback-active']).toBe('true');
      expect(String(imgAfter.props.src).startsWith('data:image/svg+xml;utf8,')).toBe(true);
    });

    it('locks 7-part companion rigs to the 4 official companions and gates mouth movement on speechNarrator', () => {
      for (const companionId of V2_3_BATCH01_META.companionIdentitiesFrozen) {
        const layers = getCompanionRigLayers(companionId, 'neutral');
        expect(Object.keys(layers)).toEqual([
          'ears_or_tail',
          'far_arm',
          'torso',
          'head',
          'eyes',
          'mouth',
          'near_arm',
        ]);
      }

      const renderer = createStatefulTestRenderer(
        <V2_3CompanionRigActor
          companionId="beibei_otter"
          state="greeting"
          prefersReducedMotion={false}
          testIdPrefix="companion-rig-test"
        />
      );
      const rigIdle = renderer.findByTestId('companion-rig-test');
      expect(rigIdle.props['data-companion-id']).toBe('beibei_otter');
      expect(rigIdle.props['data-mouth-active']).toBe('false');
      // Even in 'greeting' state, when not actively speaking, mouth uses neutral closed mouth
      const mouthIdle = renderer.findByTestId('companion-rig-test-part-mouth');
      expect(mouthIdle.props['data-asset-id']).toBe('characters/beibei_otter/neutral/mouth');
    });
  });

  describe('Gate B: Weather Station Real Scene Pilot Integration', () => {
    it('preserves original WeatherStationModal when visualV2Pilot is false and renders V2 stage when true', () => {
      const rendererOrig = createStatefulTestRenderer(
        <AppProvider>
          <WeatherStationModal
            isOpen={true}
            onClose={() => {}}
            onGoToCalm={() => {}}
            visualV2Pilot={false}
          />
        </AppProvider>
      );
      expect(rendererOrig.findByTestId('v2-weather-station-stage-wrapper')).toBeNull();
      expect(rendererOrig.findByTestId('weather-station-modal')).not.toBeNull();

      const rendererV2 = createStatefulTestRenderer(
        <AppProvider>
          <WeatherStationModal
            isOpen={true}
            onClose={() => {}}
            onGoToCalm={() => {}}
            visualV2Pilot={true}
          />
        </AppProvider>
      );
      const v2Wrapper = rendererV2.findByTestId('v2-weather-station-stage-wrapper');
      expect(v2Wrapper).not.toBeNull();
      expect(v2Wrapper.props['data-weather-state']).toBe('sunny');
      expect(v2Wrapper.props['data-weather-step']).toBe('camera');

      // Reviewer debug drawer must be collapsed by default
      expect(
        rendererV2.findByTestId('v2-weather-debug-drawer-container').props['data-drawer-open']
      ).toBe('false');
      expect(rendererV2.findByTestId('v2-weather-inspector-panel')).toBeNull();
    });

    it('drives V2 Weather Station across camera -> select -> heavyHolding, dual weather, intensity, sensations, and opt-out', () => {
      let calmOpened = false;
      const renderer = createStatefulTestRenderer(
        <AppProvider>
          <WeatherStationModal
            isOpen={true}
            onClose={() => {}}
            onGoToCalm={() => {
              calmOpened = true;
            }}
            visualV2Pilot={true}
          />
        </AppProvider>
      );

      // Move from Step 1 (camera) to Step 2 (select)
      renderer.click(renderer.findByAriaLabel('看今天头顶的天气'));
      expect(
        renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-weather-step']
      ).toBe('select');

      // Select foggy via interactive SVG token on stage
      renderer.click(renderer.findByTestId('v2-weather-svg-token-foggy'));
      expect(
        renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-weather-state']
      ).toBe('foggy');
      expect(renderer.findByTestId('v2-weather-fog-overlay')).not.toBeNull();

      // Select stormy via interactive SVG token on stage
      renderer.click(renderer.findByTestId('v2-weather-svg-token-stormy'));
      expect(
        renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-weather-state']
      ).toBe('stormy');

      // Select highest intensity ("强烈" -> value 5)
      renderer.click(renderer.findByAriaLabel('感觉程度：强烈'));
      expect(
        renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-intensity']
      ).toBe(5);

      // Toggle body sensation ("胸口堵堵的")
      renderer.click(renderer.findByAriaLabel('身体感觉：胸口堵堵的'));
      expect(renderer.findByTestId('v2-weather-stage-sensations')).not.toBeNull();

      // Submit heavy weather -> transitions to Step 3 ('heavyHolding')
      renderer.click(renderer.findByAriaLabel('记下今天的天气'));
      expect(
        renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-weather-step']
      ).toBe('heavyHolding');

      // Click Calm Corner button in heavyHolding
      renderer.click(renderer.findByAriaLabel('去绿草平静角深呼吸'));
      expect(calmOpened).toBe(true);
    });

    it('supports full opt-out ("我不想选") flow in V2 Weather Station', () => {
      let closed = false;
      const renderer = createStatefulTestRenderer(
        <AppProvider>
          <WeatherStationModal
            isOpen={true}
            onClose={() => {
              closed = true;
            }}
            onGoToCalm={() => {}}
            visualV2Pilot={true}
          />
        </AppProvider>
      );

      renderer.click(renderer.findByAriaLabel('看今天头顶的天气'));
      renderer.click(renderer.findByTestId('v2-weather-svg-token-opt_out'));
      expect(
        renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-weather-state']
      ).toBe('opt_out');
      expect(renderer.findByTestId('v2-weather-optout-veil')).not.toBeNull();

      renderer.click(renderer.findByAriaLabel('确认完成，回小岛'));
      expect(closed).toBe(true);
    });
  });

  describe('Gate C: Calm Corner Real Scene Pilot Integration (CalmSpace & CalmCornerModal)', () => {
    it('maps breathing phases and pause state accurately to V2.3 Calm Corner visual states', () => {
      expect(resolveCalmCornerAssetState('inhale', false)).toBe('inhale');
      expect(resolveCalmCornerAssetState('hold', false)).toBe('inhale');
      expect(resolveCalmCornerAssetState('exhale', false)).toBe('exhale');
      expect(resolveCalmCornerAssetState('rest', false)).toBe('rest');
      expect(resolveCalmCornerAssetState('inhale', true)).toBe('paused');
      expect(resolveCalmCornerAssetState('exhale', true)).toBe('paused');
    });

    it('preserves original CalmSpace when visualV2Pilot is false and renders V2 stage when true', () => {
      const rendererOrig = createStatefulTestRenderer(
        <AppProvider>
          <CalmSpace isOpen={true} onClose={() => {}} visualV2Pilot={false} />
        </AppProvider>
      );
      expect(rendererOrig.findByTestId('v2-calm-corner-stage-wrapper')).toBeNull();
      expect(rendererOrig.findByTestId('calm-space-modal')).not.toBeNull();

      const rendererV2 = createStatefulTestRenderer(
        <AppProvider>
          <CalmSpace isOpen={true} onClose={() => {}} visualV2Pilot={true} />
        </AppProvider>
      );
      const wrapper = rendererV2.findByTestId('v2-calm-corner-stage-wrapper');
      expect(wrapper).not.toBeNull();
      expect(wrapper.props['data-calm-asset-state']).toBe('inhale');
      expect(wrapper.props['data-is-paused']).toBe('false');
    });

    it('supports pause/resume freeze, 3-colors grounding, adult co-regulation, hug request, and safe exit in V2 CalmSpace', () => {
      let closed = false;
      const renderer = createStatefulTestRenderer(
        <AppProvider>
          <CalmSpace
            isOpen={true}
            onClose={() => {
              closed = true;
            }}
            visualV2Pilot={true}
          />
        </AppProvider>
      );

      // Click SVG breathe orb on stage to pause breathing -> immediately switches to 'paused' state
      renderer.click(renderer.findByTestId('v2-calm-svg-breathe-orb'));
      const pausedWrapper = renderer.findByTestId('v2-calm-corner-stage-wrapper');
      expect(pausedWrapper.props['data-is-paused']).toBe('true');
      expect(pausedWrapper.props['data-calm-asset-state']).toBe('paused');

      // Click again to resume
      renderer.click(renderer.findByTestId('v2-calm-svg-breathe-orb'));
      expect(renderer.findByTestId('v2-calm-corner-stage-wrapper').props['data-is-paused']).toBe(
        'false'
      );

      // 3-colors grounding via SVG stones on stage
      renderer.click(renderer.findByTestId('v2-calm-svg-color-red'));
      renderer.click(renderer.findByTestId('v2-calm-svg-color-yellow'));
      renderer.click(renderer.findByTestId('v2-calm-svg-color-blue'));
      expect(renderer.findByTestId('v2-calm-svg-color-red').props['aria-pressed']).toBe(true);
      expect(renderer.findByTestId('v2-calm-svg-color-yellow').props['aria-pressed']).toBe(true);
      expect(renderer.findByTestId('v2-calm-svg-color-blue').props['aria-pressed']).toBe(true);

      // Adult co-regulation card toggle
      renderer.click(renderer.findByAriaLabel('展开查看给身旁大人的共同调节卡陪伴建议'));
      expect(renderer.findByAriaLabel('收起给身旁大人的共同调节卡陪伴建议')).not.toBeNull();

      // Safe exit
      renderer.click(renderer.findByAriaLabel('我已经感觉平静好点了，安全返回晴雨小岛主页'));
      expect(closed).toBe(true);
    });

    it('renders V2 stage inside CalmCornerModal when visualV2Pilot is true and preserves pause + 3-colors', () => {
      let hugRequested = false;
      const renderer = createStatefulTestRenderer(
        <AppProvider>
          <CalmCornerModal
            isOpen={true}
            onClose={() => {}}
            onRequestHug={() => {
              hugRequested = true;
            }}
            visualV2Pilot={true}
          />
        </AppProvider>
      );

      const wrapper = renderer.findByTestId('v2-calm-corner-stage-wrapper');
      expect(wrapper).not.toBeNull();
      expect(wrapper.props['data-calm-asset-state']).toBe('inhale');

      // Pause via SVG breathe orb
      renderer.click(renderer.findByTestId('v2-calm-svg-breathe-orb'));
      expect(
        renderer.findByTestId('v2-calm-corner-stage-wrapper').props['data-calm-asset-state']
      ).toBe('paused');

      // Mark 3 colors via SVG stones
      renderer.click(renderer.findByTestId('v2-calm-svg-color-red'));
      renderer.click(renderer.findByTestId('v2-calm-svg-color-yellow'));
      renderer.click(renderer.findByTestId('v2-calm-svg-color-green'));
      expect(renderer.findByTestId('v2-calm-svg-color-green').props['aria-pressed']).toBe(true);
      expect(hugRequested).toBe(false);
    });
  });
});
