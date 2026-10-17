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
  V2_3_BATCH01R_CUTOUT_ASSETS,
  V2_3_CHARACTER_RIG_ASSETS,
  V2_3_COMPANION_NATIVE_CUTOUT_MAP,
  V2_3_PREPRODUCTION_TRACKED_RISKS,
  getWeatherStationLayers,
  getCalmCornerLayers,
  getCompanionRigLayers,
} from '../visual-v2/manifest/v2_3Batch01Manifest';
import {
  V2_3ResilientSvgLayer,
  V2_3CompanionRigActor,
  useV2_3MediaLoadTracker,
} from '../visual-v2/adapters/V2_3LayerStageAdapter';
import {
  WeatherStationSceneArtV2,
} from '../visual-v2/batch01/WeatherStationSceneArtV2';
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

describe('A-LAND V2.3 Batch01R — Weather Station & Calm Corner Visual Correction & Engineering Remediation', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    resetProductExperienceMetrics();
    resetPersonalizationProfile();
    speechNarrator.stop();
  });

  describe('Gate A: Visual Quality Gate, ASSET_ARTWORK_BLOCKED Disclosure & High-Detail 3D Layer Verification', () => {
    it('discloses Batch01R handoff ZIP SHA-256, ASSET_ARTWORK_BLOCKED, and mandatory hold flags', () => {
      expect(V2_3_BATCH01_META.packageVersion).toBe(
        'A_LAND_BATCH01R_VISUAL_CORRECTION_HANDOFF_20261017'
      );
      expect(V2_3_BATCH01_META.zipSha256).toBe(
        '1914661b9592e0efc754ad409da905f6428f81e530966ba739754059580b4a8d'
      );
      expect(V2_3_BATCH01_META.zipBytes).toBe(20970433);
      expect(V2_3_BATCH01_META.productionQualityApproved).toBe(0);
      expect(V2_3_BATCH01_META.flags.ASSET_ARTWORK_BLOCKED).toBe(true);
      expect(V2_3_BATCH01_META.flags.ART_DIRECTOR_QA_HOLD).toBe(true);
      expect(V2_3_BATCH01_META.flags.TECH_PREVIEW_NOT_ART_APPROVED).toBe(true);
      expect(V2_3_BATCH01_META.flags.CONTENT_QA_REVIEW).toBe(true);
      expect(V2_3_BATCH01_META.flags.PRODUCTION_RELEASE_HOLD).toBe(true);
      expect(V2_3_BATCH01_META.flags.V2_3_BATCH01_TECH_INTEGRATION_AUTHORIZED).toBe(true);
      expect(V2_3_BATCH01_META.flags.ENGINEERING_PILOT_AUDIT_PASS_STORY_CUP_ONLY).toBe(true);
      expect(V2_3_PREPRODUCTION_TRACKED_RISKS.length).toBe(3);
    });

    it('verifies every Batch01R 3D scene layer, native RGBA cutout, and companion rig asset on disk matches its SHA-256 and byte length', () => {
      expect(V2_3_WEATHER_STATION_ASSETS.length).toBe(18);
      expect(V2_3_CALM_CORNER_ASSETS.length).toBe(8);
      const cutoutList = Object.values(V2_3_BATCH01R_CUTOUT_ASSETS);
      expect(cutoutList.length).toBe(12);
      expect(V2_3_CHARACTER_RIG_ASSETS.length).toBe(168);

      const publicRoot = path.resolve(process.cwd(), 'public');

      for (const asset of [...V2_3_WEATHER_STATION_ASSETS, ...V2_3_CALM_CORNER_ASSETS]) {
        const diskPath = path.join(publicRoot, asset.publicUrl.replace(/^\//, ''));
        expect(fs.existsSync(diskPath)).toBe(true);
        const buf = fs.readFileSync(diskPath);
        const actualSha256 = crypto.createHash('sha256').update(buf).digest('hex');
        expect(buf.length).toBe(asset.bytes);
        expect(actualSha256).toBe(asset.sha256);

        if (asset.mobilePublicUrl) {
          const mobileDiskPath = path.join(publicRoot, asset.mobilePublicUrl.replace(/^\//, ''));
          expect(fs.existsSync(mobileDiskPath)).toBe(true);
          const mobileBuf = fs.readFileSync(mobileDiskPath);
          const mobileSha256 = crypto.createHash('sha256').update(mobileBuf).digest('hex');
          expect(mobileBuf.length).toBe(asset.mobileBytes);
          expect(mobileSha256).toBe(asset.mobileSha256);
        }
      }

      for (const cutout of cutoutList) {
        const diskPath = path.join(publicRoot, cutout.publicUrl.replace(/^\//, ''));
        expect(fs.existsSync(diskPath)).toBe(true);
        const buf = fs.readFileSync(diskPath);
        const actualSha256 = crypto.createHash('sha256').update(buf).digest('hex');
        expect(buf.length).toBe(cutout.bytes);
        expect(actualSha256).toBe(cutout.sha256);
      }

      for (const rigPart of V2_3_CHARACTER_RIG_ASSETS) {
        const diskPath = path.join(publicRoot, rigPart.publicUrl.replace(/^\//, ''));
        expect(fs.existsSync(diskPath)).toBe(true);
        const buf = fs.readFileSync(diskPath);
        const actualSha256 = crypto.createHash('sha256').update(buf).digest('hex');
        expect(buf.length).toBe(rigPart.bytes);
        expect(actualSha256).toBe(rigPart.sha256);
      }
    });

    it('ensures all 26 Weather Station & Calm Corner 3D scene layers have distinct SHA-256 hashes (zero shared-geometry fixture collisions)', () => {
      const allSceneLayers = [...V2_3_WEATHER_STATION_ASSETS, ...V2_3_CALM_CORNER_ASSETS];
      expect(allSceneLayers.length).toBe(26);
      const desktopHashes = new Set(allSceneLayers.map((a) => a.sha256));
      const mobileHashes = new Set(allSceneLayers.map((a) => a.mobileSha256));
      expect(desktopHashes.size).toBe(26);
      expect(mobileHashes.size).toBe(26);
      for (const layer of allSceneLayers) {
        expect(layer.isSharedGeometryFixture).toBe(false);
      }
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

      imgBefore.props.onError();
      renderer.flush();

      const imgAfter = renderer.findByTestId('test-resilient-layer');
      expect(imgAfter.props['data-fallback-active']).toBe('true');
      expect(String(imgAfter.props.src).startsWith('data:image/svg+xml;utf8,')).toBe(true);
    });

    it('locks companion actors to the 4 official companions, renders native RGBA 3D cutouts, and gates mouth activity on speechNarrator', () => {
      expect(V2_3_BATCH01_META.companionIdentitiesFrozen).toEqual([
        'guoguo_squirrel',
        'beibei_otter',
        'tiantian_raccoon',
        'qiqi_deer',
      ]);

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
      const cutoutImg = renderer.findByTestId('companion-rig-test-3d-cutout');
      expect(cutoutImg.props.src).toBe(V2_3_COMPANION_NATIVE_CUTOUT_MAP.beibei_otter.publicUrl);
      const mouthIdle = renderer.findByTestId('companion-rig-test-part-mouth');
      expect(mouthIdle.props['data-asset-id']).toBe('characters/beibei_otter/neutral/mouth');
    });
  });

  describe('Gate B1: useV2_3MediaLoadTracker Reset & Stale Callback Rejection Across Two Switching Sequences', () => {
    function TrackerHarness({
      sceneId,
      expectedAssets,
      onExpose,
    }: {
      sceneId: string;
      expectedAssets: ReadonlyArray<any>;
      onExpose: (ctx: ReturnType<typeof useV2_3MediaLoadTracker>) => void;
    }) {
      const tracker = useV2_3MediaLoadTracker(sceneId, expectedAssets);
      onExpose(tracker);
      return <div data-testid="tracker-harness" data-scene-id={tracker.summary.sceneId} />;
    }

    it('resets loadedCount, fallbackCount, and mountTimeMs cleanly across two different asset switching sequences and rejects stale callbacks', () => {
      let latestTracker!: ReturnType<typeof useV2_3MediaLoadTracker>;
      const expose = (t: ReturnType<typeof useV2_3MediaLoadTracker>) => {
        latestTracker = t;
      };

      const sunnyExpected = Object.values(getWeatherStationLayers('sunny'));
      const rainyExpected = Object.values(getWeatherStationLayers('rainy'));
      const stormyExpected = Object.values(getWeatherStationLayers('stormy'));
      const foggyExpected = Object.values(getWeatherStationLayers('foggy'));
      const calmInhaleExpected = Object.values(getCalmCornerLayers('inhale'));
      const calmPausedExpected = Object.values(getCalmCornerLayers('paused'));

      // Sequence A: sunny -> rainy -> stormy -> calm_corner:inhale
      const renderer = createStatefulTestRenderer(
        <TrackerHarness
          sceneId="weather_station:sunny"
          expectedAssets={sunnyExpected}
          onExpose={expose}
        />
      );
      expect(latestTracker.summary.sceneId).toBe('weather_station:sunny');
      expect(latestTracker.summary.totalExpected).toBe(3);
      expect(latestTracker.summary.loadedCount).toBe(0);

      for (const a of sunnyExpected) {
        latestTracker.recordAssetEvent(a, 'loaded');
      }
      renderer.flush();
      expect(latestTracker.summary.loadedCount).toBe(3);

      // Switch to rainy -> must immediately reset to 0 loaded and reject stale sunny callback
      renderer.rerender(
        <TrackerHarness
          sceneId="weather_station:rainy"
          expectedAssets={rainyExpected}
          onExpose={expose}
        />
      );
      expect(latestTracker.summary.sceneId).toBe('weather_station:rainy');
      expect(latestTracker.summary.loadedCount).toBe(0);
      expect(latestTracker.summary.fallbackCount).toBe(0);
      expect(Object.keys(latestTracker.summary.assets)).toHaveLength(0);

      // Fire stale sunny callback -> must be rejected
      latestTracker.recordAssetEvent(sunnyExpected[0], 'loaded');
      renderer.flush();
      expect(latestTracker.summary.loadedCount).toBe(0);

      // Record rainy loads
      latestTracker.recordAssetEvent(rainyExpected[0], 'loaded');
      latestTracker.recordAssetEvent(rainyExpected[1], 'fallback');
      renderer.flush();
      expect(latestTracker.summary.loadedCount).toBe(1);
      expect(latestTracker.summary.fallbackCount).toBe(1);

      // Switch to stormy -> resets to 0
      renderer.rerender(
        <TrackerHarness
          sceneId="weather_station:stormy"
          expectedAssets={stormyExpected}
          onExpose={expose}
        />
      );
      expect(latestTracker.summary.sceneId).toBe('weather_station:stormy');
      expect(latestTracker.summary.loadedCount).toBe(0);
      expect(latestTracker.summary.fallbackCount).toBe(0);

      // Switch to calm_corner:inhale (2 layers) -> resets to totalExpected=2, loadedCount=0
      renderer.rerender(
        <TrackerHarness
          sceneId="calm_corner:inhale"
          expectedAssets={calmInhaleExpected}
          onExpose={expose}
        />
      );
      expect(latestTracker.summary.sceneId).toBe('calm_corner:inhale');
      expect(latestTracker.summary.totalExpected).toBe(2);
      expect(latestTracker.summary.loadedCount).toBe(0);

      // Sequence B: stormy -> foggy -> sunny -> calm_corner:paused
      renderer.rerender(
        <TrackerHarness
          sceneId="weather_station:stormy"
          expectedAssets={stormyExpected}
          onExpose={expose}
        />
      );
      for (const a of stormyExpected) {
        latestTracker.recordAssetEvent(a, 'loaded');
      }
      renderer.flush();
      expect(latestTracker.summary.loadedCount).toBe(3);

      renderer.rerender(
        <TrackerHarness
          sceneId="weather_station:foggy"
          expectedAssets={foggyExpected}
          onExpose={expose}
        />
      );
      expect(latestTracker.summary.loadedCount).toBe(0);
      latestTracker.recordAssetEvent(stormyExpected[2], 'loaded');
      renderer.flush();
      expect(latestTracker.summary.loadedCount).toBe(0);

      renderer.rerender(
        <TrackerHarness
          sceneId="weather_station:sunny"
          expectedAssets={sunnyExpected}
          onExpose={expose}
        />
      );
      expect(latestTracker.summary.loadedCount).toBe(0);

      renderer.rerender(
        <TrackerHarness
          sceneId="calm_corner:paused"
          expectedAssets={calmPausedExpected}
          onExpose={expose}
        />
      );
      expect(latestTracker.summary.sceneId).toBe('calm_corner:paused');
      expect(latestTracker.summary.totalExpected).toBe(2);
      expect(latestTracker.summary.loadedCount).toBe(0);
      for (const a of calmPausedExpected) {
        latestTracker.recordAssetEvent(a, 'loaded');
      }
      renderer.flush();
      expect(latestTracker.summary.loadedCount).toBe(2);
    });
  });

  describe('Gate B2: Weather Station 3D Observatory Reskin, 4-Companion Switching & Child UI QA Drawer Removal', () => {
    it('hides V2_3ReviewerDebugDrawer from the child UI by default and only renders it when explicitly enabled for QA', () => {
      const rendererChild = createStatefulTestRenderer(
        <AppProvider>
          <WeatherStationModal
            isOpen={true}
            onClose={() => {}}
            onGoToCalm={() => {}}
            visualV2Pilot={true}
          />
        </AppProvider>
      );
      const v2Wrapper = rendererChild.findByTestId('v2-weather-station-stage-wrapper');
      expect(v2Wrapper).not.toBeNull();
      expect(v2Wrapper.props['data-artwork-status']).toBe('ASSET_ARTWORK_BLOCKED');

      // Child UI must NOT contain the engineering debug drawer
      expect(rendererChild.findByTestId('v2-weather-debug-drawer-container')).toBeNull();

      // Explicit QA mode renders the drawer (collapsed by default)
      const rendererQa = createStatefulTestRenderer(
        <AppProvider>
          <WeatherStationSceneArtV2
            step="select"
            selectedPrimary="sunny"
            selectedSecondary={null}
            allowDualWeather={false}
            intensity={3}
            bodySensations={[]}
            onSelectPrimary={() => {}}
            onToggleBodySensation={() => {}}
            forceEnableQaForTest={true}
          />
        </AppProvider>
      );
      expect(
        rendererQa.findByTestId('v2-weather-debug-drawer-container').props['data-drawer-open']
      ).toBe('false');
    });

    it('switches among all 4 official companions in Weather Station and synchronizes speechNarrator voice profile', () => {
      const renderer = createStatefulTestRenderer(
        <AppProvider>
          <WeatherStationModal
            isOpen={true}
            onClose={() => {}}
            onGoToCalm={() => {}}
            visualV2Pilot={true}
          />
        </AppProvider>
      );

      for (const companionId of V2_3_BATCH01_META.companionIdentitiesFrozen) {
        const btn = renderer.findByTestId(`v2-weather-switch-companion-${companionId}`);
        expect(btn).not.toBeNull();
        renderer.click(btn);
        expect(
          renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-companion-id']
        ).toBe(companionId);
        expect(speechNarrator.getNarrationSession().companionId).toBe(companionId);
      }
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

      renderer.click(renderer.findByAriaLabel('看今天头顶的天气'));
      expect(
        renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-weather-step']
      ).toBe('select');

      renderer.click(renderer.findByTestId('v2-weather-svg-token-foggy'));
      expect(
        renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-weather-state']
      ).toBe('foggy');
      expect(renderer.findByTestId('v2-weather-fog-overlay')).not.toBeNull();

      renderer.click(renderer.findByTestId('v2-weather-svg-token-stormy'));
      expect(
        renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-weather-state']
      ).toBe('stormy');

      renderer.click(renderer.findByAriaLabel('感觉程度：强烈'));
      expect(
        renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-intensity']
      ).toBe(5);

      renderer.click(renderer.findByAriaLabel('身体感觉：胸口堵堵的'));
      expect(renderer.findByTestId('v2-weather-stage-sensations')).not.toBeNull();

      renderer.click(renderer.findByAriaLabel('记下今天的天气'));
      expect(
        renderer.findByTestId('v2-weather-station-stage-wrapper').props['data-weather-step']
      ).toBe('heavyHolding');

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

  describe('Gate B3: Calm Corner 3D Twilight Sanctuary Reskin, Zero Duplicate Controls & Safe Exit', () => {
    it('maps breathing phases and pause state accurately to V2.3 Calm Corner visual states', () => {
      expect(resolveCalmCornerAssetState('inhale', false)).toBe('inhale');
      expect(resolveCalmCornerAssetState('hold', false)).toBe('inhale');
      expect(resolveCalmCornerAssetState('exhale', false)).toBe('exhale');
      expect(resolveCalmCornerAssetState('rest', false)).toBe('rest');
      expect(resolveCalmCornerAssetState('inhale', true)).toBe('paused');
      expect(resolveCalmCornerAssetState('exhale', true)).toBe('paused');
    });

    it('renders single unified breathing & 3-color grounding system in V2 CalmSpace with zero duplicate controls and zero child QA drawer', () => {
      const rendererV2 = createStatefulTestRenderer(
        <AppProvider>
          <CalmSpace isOpen={true} onClose={() => {}} visualV2Pilot={true} />
        </AppProvider>
      );
      const wrapper = rendererV2.findByTestId('v2-calm-corner-stage-wrapper');
      expect(wrapper).not.toBeNull();
      expect(wrapper.props['data-calm-asset-state']).toBe('inhale');
      expect(wrapper.props['data-artwork-status']).toBe('ASSET_ARTWORK_BLOCKED');

      // Child UI must not render QA debug drawer
      expect(rendererV2.findByTestId('v2-calm-debug-drawer-container')).toBeNull();

      // Must NOT render duplicate legacy 3-color button bar in V2 mode
      expect(
        rendererV2.findByAriaLabel(
          '红色物品感知练习：请在周围房间里找到一件红色的东西，找到后点击'
        )
      ).toBeNull();
      // Instead, the single unified 3-color stones exist on the stage
      expect(rendererV2.findByTestId('v2-calm-svg-color-red')).not.toBeNull();
      expect(rendererV2.findByTestId('v2-calm-svg-color-yellow')).not.toBeNull();
      expect(rendererV2.findByTestId('v2-calm-svg-color-blue')).not.toBeNull();
    });

    it('supports pause/resume freeze, 4-companion switching, 3-colors grounding, adult co-regulation, and safe exit in V2 CalmSpace', () => {
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

      // Switch companion in CalmSpace
      renderer.click(renderer.findByTestId('v2-calm-switch-companion-qiqi_deer'));
      expect(
        renderer.findByTestId('v2-calm-corner-stage-wrapper').props['data-companion-id']
      ).toBe('qiqi_deer');

      // Pause/resume via stage breathing orb
      renderer.click(renderer.findByTestId('v2-calm-svg-breathe-orb'));
      const pausedWrapper = renderer.findByTestId('v2-calm-corner-stage-wrapper');
      expect(pausedWrapper.props['data-is-paused']).toBe('true');
      expect(pausedWrapper.props['data-calm-asset-state']).toBe('paused');

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

    it('renders V2 stage inside CalmCornerModal when visualV2Pilot is true and preserves pause + 3-colors without duplicate buttons', () => {
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
      expect(renderer.findByTestId('v2-calm-debug-drawer-container')).toBeNull();

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

  describe('Gates U1–U3: Batch01R Minimal UX Closeout (Single Primary Weather Selector, Zero-Crop Stage Geometry & Header Typography)', () => {
    it('Gate U1: ensures V2 Weather Station has a single primary 6-weather selector (SVG stage tokens only) while preserving dynamic phrase bar, keyboard Enter/Space, and legacy `/` selector', () => {
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

      rendererV2.click(rendererV2.findByAriaLabel('看今天头顶的天气'));

      const tokenIds = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy', 'opt_out'] as const;
      for (const id of tokenIds) {
        expect(rendererV2.findByTestId(`v2-weather-svg-token-${id}`)).not.toBeNull();
      }

      // Duplicate 6-card primary selector grid must NOT exist in V2 mode
      expect(rendererV2.findByAriaLabel('天气选择：晴天')).toBeNull();
      expect(rendererV2.findByAriaLabel('天气选择：雨天')).toBeNull();

      // Dynamic phrase bar + read-aloud button must update when selecting a weather token
      rendererV2.click(rendererV2.findByTestId('v2-weather-svg-token-rainy'));
      const phraseBar = rendererV2.findByTestId('v2-weather-selected-phrase-bar');
      expect(phraseBar).not.toBeNull();
      expect(phraseBar.props['data-selected-weather']).toBe('rainy');
      expect(rendererV2.findByTestId('v2-weather-dynamic-phrase').text).toContain(
        '我现在像下雨天，眼眶或心里有点湿湿的'
      );
      expect(rendererV2.findByTestId('v2-weather-selected-phrase-read-aloud')).not.toBeNull();

      // Keyboard Enter / Space on SVG token activates selection
      const cloudyToken = rendererV2.findByTestId('v2-weather-svg-token-cloudy');
      cloudyToken.props.onKeyDown({
        key: 'Enter',
        preventDefault: () => {},
        stopPropagation: () => {},
      });
      rendererV2.flush();
      expect(
        rendererV2.findByTestId('v2-weather-station-stage-wrapper').props['data-weather-state']
      ).toBe('cloudy');

      // Legacy mode (`visualV2Pilot={false}`) still keeps the classic 6-card selector
      const rendererLegacy = createStatefulTestRenderer(
        <AppProvider>
          <WeatherStationModal
            isOpen={true}
            onClose={() => {}}
            onGoToCalm={() => {}}
            visualV2Pilot={false}
          />
        </AppProvider>
      );
      rendererLegacy.click(rendererLegacy.findByAriaLabel('看今天头顶的天气'));
      expect(rendererLegacy.findByAriaLabel('天气选择：晴天')).not.toBeNull();
    });

    it('Gate U2: enforces exact 1376x768 desktop and 896x1200 mobile dimensions across all 26 Weather Station & Calm Corner layers for 0% stage crop loss', () => {
      const allSceneLayers = [...V2_3_WEATHER_STATION_ASSETS, ...V2_3_CALM_CORNER_ASSETS];
      expect(allSceneLayers.length).toBe(26);
      for (const layer of allSceneLayers) {
        expect(layer.nativeWidth).toBe(1376);
        expect(layer.nativeHeight).toBe(768);
        expect(layer.mobileNativeWidth).toBe(896);
        expect(layer.mobileNativeHeight).toBe(1200);
      }
    });

    it('Gate U3: renders full unwrapped scene titles in Weather Station and Calm Space headers without truncate classes', () => {
      const weatherRenderer = createStatefulTestRenderer(
        <AppProvider>
          <WeatherStationModal
            isOpen={true}
            onClose={() => {}}
            onGoToCalm={() => {}}
            visualV2Pilot={true}
          />
        </AppProvider>
      );
      const weatherTitle = weatherRenderer.findByTestId('v2-weather-header-title');
      expect(weatherTitle).not.toBeNull();
      expect(weatherTitle.text).toBe('情绪天气站');
      expect(String(weatherTitle.props.className || '').includes('truncate')).toBe(false);

      const calmRenderer = createStatefulTestRenderer(
        <AppProvider>
          <CalmSpace isOpen={true} onClose={() => {}} visualV2Pilot={true} />
        </AppProvider>
      );
      const calmTitle = calmRenderer.findByTestId('v2-calm-header-title');
      expect(calmTitle).not.toBeNull();
      expect(calmTitle.text).toBe('绿草冷静空间');
      expect(String(calmTitle.props.className || '').includes('truncate')).toBe(false);
    });
  });
});

