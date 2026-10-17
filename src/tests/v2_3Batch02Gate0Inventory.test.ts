import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {
  BATCH02_CANONICAL_ASSET_SETS,
  BATCH02_CANONICAL_DISCRETE_STATES,
  BATCH02_GATE0_BASELINE,
  BATCH02_GATE0_EXECUTION_STATUS,
  BATCH02_GATE0_HOLD_FLAGS,
  BATCH02_GATE_B0R_DECISION_STATUS,
  BATCH02_GATE_B0RB_DECISION_STATUS,
  BATCH02_INDEPENDENT_ART_APPROVAL_REGISTRY,
  BATCH02_MIN_TOUCH_TARGET_PX,
  BATCH02_OPTIONAL_ADDITIONAL_VIEWPORTS,
  BATCH02_READ_ONLY_READINESS_HOLD_LOCK,
  BATCH02_REQUIRED_VIEWPORTS,
  BATCH02_STAGE_COMPOSITION_RULE,
  BATCH02_TOTAL_REQUIRED_DISCRETE_STATES,
  BATCH02_TOTAL_REQUIRED_SETS,
  DIFFICULTY_BREAKER_COMPANION_ORDER,
  DIFFICULTY_BREAKER_PRESETS,
  DIFFICULTY_BREAKER_STAGES,
  DIFFICULTY_BREAKER_TRANSITION_SUBBRANCHES,
  DIFFICULTY_BREAKER_VOICE_SYNC_CONTRACT,
  THOUGHT_DETECTIVE_BOX_CATEGORIES,
  THOUGHT_DETECTIVE_CIRCLE_CATEGORIES,
  THOUGHT_DETECTIVE_INITIAL_BOX_ITEMS,
  THOUGHT_DETECTIVE_INITIAL_CIRCLE_ITEMS,
  THOUGHT_DETECTIVE_INITIAL_STEP,
  THOUGHT_DETECTIVE_LENSES,
  THOUGHT_DETECTIVE_MODES,
  THOUGHT_DETECTIVE_TOOLS,
  computeCrc32,
  decodeAndVerifyImageBuffer,
  decodeAndVerifyPngBuffer,
  decodeAndVerifyWebpBuffer,
  evaluateBatch02ProductionArtEligibility,
  isBreakerProgressionCleanlyResetToFen,
  isValidThoughtDetectiveBoxItemState,
  isValidThoughtDetectiveCircleItemState,
  projectThoughtDetectivePlacementToReadOnlyView,
  simulateBreakerScenarioSwitchReset,
  simulateThoughtDetectivePlaceBox,
  simulateThoughtDetectivePlaceCircle,
  validateThoughtDetectiveStateContract,
  type Batch02AssetInventoryEntry,
  type BreakerProgressionSnapshot,
} from '../visual-v2/batch02-gate0/batch02Gate0Contracts';
import { ContentAuditRegistry } from '../domain/cognitive/ContentAuditRegistry';
import { AppProvider } from '../context/AppContext';
import { ThoughtDetectiveLabModal } from '../components/ChildIsland/ThoughtDetectiveLab/ThoughtDetectiveLabModal';
import { DifficultyBreakerModal } from '../components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal';
import { speechNarrator } from '../utils/speech';
import { resetPersonalizationProfile } from '../domain/personalization';

const ROOT_DIR = process.cwd();
const BEHAVIOR_MAP_PATH = path.join(
  ROOT_DIR,
  'docs/v2-3-batch02-gate0-inventory/BATCH02_BEHAVIOR_INTERFACE_MAP.json'
);
const ARTWORK_LEDGER_PATH = path.join(
  ROOT_DIR,
  'docs/v2-3-batch02-gate0-inventory/BATCH02_ARTWORK_GAP_LEDGER.json'
);
const DISCRETE_MANIFEST_PATH = path.join(
  ROOT_DIR,
  'docs/v2-3-batch02-gate0-inventory/BATCH02_DISCRETE_ASSET_PRODUCTION_MANIFEST.json'
);

interface HookCell {
  tag: 'state' | 'ref' | 'memo' | 'callback' | 'effect';
  value?: any;
  deps?: ReadonlyArray<any>;
  cleanup?: (() => void) | void;
}

interface ComponentInstance {
  compName: string;
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
  const rootElement = initialElement;
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

  function renderNode(node: any, p: string): any {
    if (node === null || node === undefined || typeof node === 'boolean') return null;
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) {
      return node.map((child, i) => renderNode(child, `${p}.${i}`)).filter((x) => x !== null);
    }
    if (!React.isValidElement(node)) return null;

    const element = node as React.ReactElement<any>;
    const type = element.type as any;

    if (type === React.Fragment) {
      return renderNode(element.props.children, `${p}.f`);
    }

    if (typeof type === 'object' && type !== null) {
      if ('_context' in type || '$$typeof' in type) {
        const ctx = type._context || type;
        if ('value' in element.props) {
          contextStack.push({ context: ctx, value: element.props.value });
          const rendered = renderNode(element.props.children, `${p}.ctx`);
          contextStack.pop();
          return rendered;
        }
      }
    }

    if (typeof type === 'function') {
      const compName = type.displayName || type.name || 'Anon';
      const instanceKey = `${p}:${compName}${element.key != null ? `:${element.key}` : ''}`;
      let inst = instances.get(instanceKey);
      if (!inst) {
        inst = { compName, hooks: [], hookIndex: 0 };
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
      const children = renderNode(element.props.children, `${p}.${type}`);
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

  function getComponentStates(compName: string): any[] {
    for (const inst of instances.values()) {
      if (inst.compName === compName) {
        return inst.hooks.filter((h) => h.tag === 'state').map((h) => h.value);
      }
    }
    return [];
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
    getComponentStates,
    unmount,
  };
}

function createSyntheticValidCompleteManifest(): Batch02AssetInventoryEntry[] {
  return BATCH02_CANONICAL_DISCRETE_STATES.map((spec, idx) => {
    const sha256 = crypto
      .createHash('sha256')
      .update(`valid_prod_asset_${spec.discreteAssetId}_${idx}`)
      .digest('hex');
    return {
      assetId: spec.discreteAssetId,
      setId: spec.setId,
      stateVariant: spec.stateVariant,
      companionId: spec.companionId,
      sceneId: spec.sceneId,
      role: `Approved 3D Production Render for ${spec.discreteAssetId}`,
      filePath: spec.targetFilePath,
      existsInRepo: true,
      format: 'webp',
      pixelDimensions: { width: spec.minWidth, height: spec.minHeight },
      requiredMinDimensions: { width: spec.minWidth, height: spec.minHeight },
      hasAlphaTransparency: spec.requireAlpha ? true : false,
      byteSize: 245760 + idx * 1024,
      sha256,
      provenance: 'Candidate Metadata Structure Fixture (No Physical File)',
      sharesIdenticalBytesWith: [],
      status: 'PRODUCTION_ART_ACCEPTED',
      gapReason: '',
      artDirectorApproval: {
        approvedBy: 'Art Director Lead',
        approvalId: `AD-BATCH02-SIGN-${String(idx + 1).padStart(3, '0')}`,
        approvedSha256: sha256,
        approvedAt: '2026-10-17T12:00:00+08:00',
        version: '2.3.0',
      },
    };
  });
}

/**
 * Exact reproduction generator from independent audit `04_REPRO_FULL_FABRICATED_MANIFEST.mjs`.
 */
function createAuditorFabricated68Manifest(
  pathMode: 'canon' | 'wrong' = 'canon'
): Batch02AssetInventoryEntry[] {
  return BATCH02_CANONICAL_DISCRETE_STATES.map((spec, i) => {
    const hash = crypto
      .createHash('sha256')
      .update('FAKE_NOT_AN_IMAGE_' + spec.discreteAssetId)
      .digest('hex');
    return {
      assetId: spec.discreteAssetId,
      setId: spec.setId,
      stateVariant: spec.stateVariant,
      companionId: spec.companionId,
      sceneId: spec.sceneId,
      role: 'Fabricated model metadata',
      filePath:
        pathMode === 'canon'
          ? spec.targetFilePath
          : `public/visual-v2/batch02-art/DOES_NOT_EXIST_${i}.webp`,
      existsInRepo: true,
      format: 'webp',
      pixelDimensions: { width: spec.minWidth, height: spec.minHeight },
      hasAlphaTransparency: !!spec.requireAlpha,
      byteSize: 299000 + i,
      sha256: hash,
      provenance: 'Fabricated / never inspected',
      sharesIdenticalBytesWith: [],
      status: 'PRODUCTION_ART_ACCEPTED',
      gapReason: '',
      artDirectorApproval: {
        approvedBy: 'Anyone can write Art Director',
        approvalId: 'SELF_ATTEST_' + i,
        approvedSha256: hash,
        approvedAt: '2100-01-01T00:00:00Z',
      },
    };
  });
}

function makePngChunk(type: string, data: Buffer): Buffer {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(computeCrc32(body), 0);
  return Buffer.concat([lenBuf, body, crcBuf]);
}

function buildValidPngBuffer(opts: {
  width: number;
  height: number;
  colorType?: 2 | 6;
  seedByte?: number;
}): Buffer {
  const { width, height, colorType = 6, seedByte = 0x7f } = opts;
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bitDepth = 8
  ihdr[9] = colorType; // 6 = RGBA, 2 = RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace = 0

  const channels = colorType === 6 ? 4 : 3;
  const rowBytes = 1 + width * channels;
  const rawScanlines = Buffer.alloc(rowBytes * height, seedByte);
  for (let r = 0; r < height; r++) {
    rawScanlines[r * rowBytes] = 0; // filter type 0 (None)
  }
  const compressedIdat = zlib.deflateSync(rawScanlines, { level: 1 });

  return Buffer.concat([
    sig,
    makePngChunk('IHDR', ihdr),
    makePngChunk('IDAT', compressedIdat),
    makePngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function buildValidWebpVp8lBuffer(opts: {
  width: number;
  height: number;
  hasAlpha: boolean;
  seedByte?: number;
}): Buffer {
  const { width, height, hasAlpha, seedByte = 0xa5 } = opts;
  const vp8lPayload = Buffer.alloc(16, seedByte);
  vp8lPayload[0] = 0x2f; // VP8L signature byte
  const bits =
    ((width - 1) & 0x3fff) |
    (((height - 1) & 0x3fff) << 14) |
    ((hasAlpha ? 1 : 0) << 28) |
    (0 << 29); // version = 0
  vp8lPayload.writeUInt32LE(bits >>> 0, 1);

  const chunkHeader = Buffer.alloc(8);
  chunkHeader.write('VP8L', 0, 4, 'ascii');
  chunkHeader.writeUInt32LE(vp8lPayload.length, 4);

  const riffPayload = Buffer.concat([
    Buffer.from('WEBP', 'ascii'),
    chunkHeader,
    vp8lPayload,
  ]);
  const riffHeader = Buffer.alloc(8);
  riffHeader.write('RIFF', 0, 4, 'ascii');
  riffHeader.writeUInt32LE(riffPayload.length, 4);

  return Buffer.concat([riffHeader, riffPayload]);
}

describe('A-LAND V2.3 Batch02 · Gate 0 / Gate B0R Contract & Fail-Closed Art Preflight', () => {
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
    resetPersonalizationProfile();
  });

  it('B0R-01: locks frozen baseline SHAs, Gate B0R decision status, and mandatory hold flags', () => {
    expect(BATCH02_GATE0_BASELINE.frozenBranch).toBe('ui/visual-v2-batch01r-u3r-final');
    expect(BATCH02_GATE0_BASELINE.frozenArchiveHeadSha).toBe(
      'd0b497acade40bd4bbd2cc9f16e9550df2b19504'
    );
    expect(BATCH02_GATE0_BASELINE.frozenCanonicalCodeSha).toBe(
      '6a5ae8d186850ac6ddb30823bf9c87134c10c320'
    );
    expect(BATCH02_GATE0_BASELINE.gate0InventoryArchiveHeadSha).toBe(
      'a6a1f843fd9955539912bfd1b30cc46a399a9ed8'
    );
    expect(BATCH02_GATE0_EXECUTION_STATUS).toBe(
      'ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED'
    );
    expect(BATCH02_GATE_B0R_DECISION_STATUS).toBe(
      'BATCH02_GATE0R_CONTRACT_PASS / ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED'
    );
    expect(BATCH02_GATE0_HOLD_FLAGS).toEqual({
      ART_DIRECTOR_QA_HOLD: true,
      ASSET_ARTWORK_BLOCKED: true,
      CONTENT_QA_REVIEW: true,
      PRODUCTION_RELEASE_HOLD: true,
      ARTWORK_GAP: true,
      BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED: true,
    });
  });

  it('B0R-02: locks the frozen 6-viewport matrix (including 1024x1366) and aspect-ratio-preserving mobile stage rule', () => {
    expect(THOUGHT_DETECTIVE_MODES).toEqual(['tools', 'threeBoxes', 'circles', 'fourSteps']);
    expect(THOUGHT_DETECTIVE_TOOLS).toEqual(['flag', 'lenses', 'coin', 'scale', 'fence']);
    expect(THOUGHT_DETECTIVE_LENSES).toEqual(['my', 'his', 'sky']);
    expect(THOUGHT_DETECTIVE_BOX_CATEGORIES).toEqual(['visible', 'heart', 'guess']);
    expect(THOUGHT_DETECTIVE_CIRCLE_CATEGORIES).toEqual(['adult', 'mine', 'together']);

    expect(DIFFICULTY_BREAKER_STAGES).toEqual(['pick', 'fen', 'tong', 'ze', 'complete']);
    expect(DIFFICULTY_BREAKER_PRESETS).toEqual([
      'diff-two-homes',
      'diff-blocks-broken',
      'diff-friend-ask',
    ]);
    expect(DIFFICULTY_BREAKER_TRANSITION_SUBBRANCHES).toEqual([
      'sub_dual_attachment',
      'sub_loyalty_conflict',
      'sub_specific_concern',
      'sub_ordinary_transition',
    ]);
    expect(DIFFICULTY_BREAKER_COMPANION_ORDER).toEqual([
      'guoguo_squirrel',
      'beibei_otter',
      'tiantian_raccoon',
      'qiqi_deer',
    ]);
    expect(BATCH02_MIN_TOUCH_TARGET_PX).toBe(56);

    // P2-02: Frozen 6 viewports MUST include 1024x1366; 1024x768 is optional additional
    expect(BATCH02_REQUIRED_VIEWPORTS).toHaveLength(6);
    expect(
      BATCH02_REQUIRED_VIEWPORTS.map((v) => `${v.width}x${v.height}`)
    ).toEqual([
      '360x800',
      '390x844',
      '430x932',
      '768x1024',
      '1024x1366',
      '1440x900',
    ]);
    expect(
      BATCH02_OPTIONAL_ADDITIONAL_VIEWPORTS.map((v) => `${v.width}x${v.height}`)
    ).toEqual(['1024x768']);
    expect(BATCH02_STAGE_COMPOSITION_RULE.forbidDestructiveObjectCoverCropOnMobile).toBe(true);
    expect(BATCH02_STAGE_COMPOSITION_RULE.mobilePortraitAspect).toBe('3:4');
  });

  it('B0R-03 (P1-01): mounts real ThoughtDetectiveLabModal and verifies { id, text, target, placed } state, initial step=1, exploratory placement, and rejection of fabricated correctBox/sorted schemas', () => {
    const renderer = createStatefulTestRenderer(
      React.createElement(
        AppProvider,
        null,
        React.createElement(ThoughtDetectiveLabModal, {
          isOpen: true,
          onClose: () => {},
        })
      )
    );

    const states = renderer.getComponentStates('ThoughtDetectiveLabModal');
    // Hook order in ThoughtDetectiveLabModal.tsx (lines 38-75):
    // 0: activeTab ('tools')
    // 1: isBreakerOpen (false)
    // 2: isCrayonGameOpen (false)
    // 3: isTransferLabOpen (false)
    // 4: activeTool ('flag')
    // 5: personFlagRemoved (false)
    // 6: currentLens ('my')
    // 7: coinSide ('front')
    // 8: boxItems
    // 9: circleItems
    // 10: currentStep (1)
    expect(states[0]).toBe('tools');
    expect(states[1]).toBe(false);
    expect(states[2]).toBe(false);
    expect(states[3]).toBe(false);
    expect(states[4]).toBe('flag');
    expect(states[5]).toBe(false);
    expect(states[6]).toBe('my');
    expect(states[7]).toBe('front');
    expect(states[8]).toEqual(THOUGHT_DETECTIVE_INITIAL_BOX_ITEMS);
    expect(states[9]).toEqual(THOUGHT_DETECTIVE_INITIAL_CIRCLE_ITEMS);
    expect(states[10]).toBe(1);
    expect(THOUGHT_DETECTIVE_INITIAL_STEP).toBe(1);

    // Validate live component state against contract validator
    const liveValidation = validateThoughtDetectiveStateContract({
      boxItems: states[8],
      circleItems: states[9],
      currentStep: states[10],
    });
    expect(liveValidation.valid).toBe(true);
    expect(liveValidation.errors).toEqual([]);

    // Switch to Three Boxes tab and click a placement button on item '3' (target='guess', place into 'visible' then 'guess')
    const threeBoxesTabBtn = renderer.findAll(
      (n) => n.type === 'button' && n.props && n.props['aria-label'] === '三个分类盒子'
    )[0];
    expect(threeBoxesTabBtn).toBeTruthy();
    renderer.click(threeBoxesTabBtn);

    const placeIntoVisibleButtons = renderer.findAll(
      (n) => n.type === 'button' && typeof n.text === 'string' && n.text.trim() === '看得见'
    );
    expect(placeIntoVisibleButtons).toHaveLength(5);
    renderer.click(placeIntoVisibleButtons[2]); // Places item '3' (index 2) into 'visible' unconditionally

    const updatedBoxItemsAfterFirstPlace = renderer.getComponentStates('ThoughtDetectiveLabModal')[8];
    const item3First = updatedBoxItemsAfterFirstPlace.find((i: any) => i.id === '3');
    expect(item3First.target).toBe('guess');
    expect(item3First.placed).toBe('visible'); // Proves no correctness gating blocks placement

    // Now move item '3' into 'guess'
    const placeIntoGuessButtons = renderer.findAll(
      (n) => n.type === 'button' && typeof n.text === 'string' && n.text.trim() === '猜的'
    );
    expect(placeIntoGuessButtons).toHaveLength(5);
    renderer.click(placeIntoGuessButtons[2]);
    const updatedBoxItemsAfterSecondPlace = renderer.getComponentStates('ThoughtDetectiveLabModal')[8];
    const item3Second = updatedBoxItemsAfterSecondPlace.find((i: any) => i.id === '3');
    expect(item3Second.placed).toBe('guess');

    // Verify pure simulation helpers match live component behavior
    const simulatedBoxes = simulateThoughtDetectivePlaceBox(
      THOUGHT_DETECTIVE_INITIAL_BOX_ITEMS,
      '3',
      'visible'
    );
    expect(simulatedBoxes.find((i) => i.id === '3')?.placed).toBe('visible');
    const simulatedCircles = simulateThoughtDetectivePlaceCircle(
      THOUGHT_DETECTIVE_INITIAL_CIRCLE_ITEMS,
      'c3',
      'mine'
    );
    expect(simulatedCircles.find((i) => i.id === 'c3')?.placed).toBe('mine');

    // Verify optional read-only view projector preserves separation from source state
    const readOnlyView = projectThoughtDetectivePlacementToReadOnlyView(simulatedBoxes);
    expect(readOnlyView[0].isPlaced).toBe(true);
    expect(readOnlyView[0].matchesReferenceTarget).toBe(true);
    expect(readOnlyView[2].currentPlacedCategory).toBe('visible');
    expect(readOnlyView[2].matchesReferenceTarget).toBe(false);

    // Explicitly verify that fabricated { correctBox, sorted } and { correctCircle, sorted } schemas FAIL validation
    const wrongBoxItem = {
      id: '1',
      text: '桌上的牛奶打翻了，地板湿了',
      correctBox: 'visible',
      sorted: null,
    };
    const wrongCircleItem = {
      id: 'c1',
      text: '大人分开住在不同房子里',
      correctCircle: 'adult',
      sorted: null,
    };
    expect(isValidThoughtDetectiveBoxItemState(wrongBoxItem)).toBe(false);
    expect(isValidThoughtDetectiveCircleItemState(wrongCircleItem)).toBe(false);

    const wrongStateValidation = validateThoughtDetectiveStateContract({
      boxItems: [wrongBoxItem, wrongBoxItem, wrongBoxItem, wrongBoxItem, wrongBoxItem],
      circleItems: [
        wrongCircleItem,
        wrongCircleItem,
        wrongCircleItem,
        wrongCircleItem,
        wrongCircleItem,
      ],
      currentStep: 1,
    });
    expect(wrongStateValidation.valid).toBe(false);
    expect(wrongStateValidation.errors.length).toBeGreaterThanOrEqual(2);

    renderer.unmount();
  });

  it('B0R-04 (P1-01): mounts real DifficultyBreakerModal and verifies speechNarrator.subscribe, inline switchCompanion, and stale progression reset to fen', () => {
    const renderer = createStatefulTestRenderer(
      React.createElement(
        AppProvider,
        null,
        React.createElement(DifficultyBreakerModal, {
          isOpen: true,
          onClose: () => {},
        })
      )
    );

    expect(DIFFICULTY_BREAKER_VOICE_SYNC_CONTRACT.subscriptionMethod).toBe(
      'speechNarrator.subscribe'
    );
    expect(DIFFICULTY_BREAKER_VOICE_SYNC_CONTRACT.speaksGreetingOnInlineSwitch).toBe(false);

    // Switch companion inline via real button
    const otterCompanionBtn = renderer.findByTestId('breaker-companion-switch-beibei_otter');
    expect(otterCompanionBtn).toBeTruthy();
    renderer.click(otterCompanionBtn);
    expect(speechNarrator.getNarrationSession().companionId).toBe('beibei_otter');

    // Pick diff-two-homes preset to enter 'fen'
    const pickTwoHomesBtn = renderer.findByTestId('breaker-pick-diff-two-homes');
    expect(pickTwoHomesBtn).toBeTruthy();
    renderer.click(pickTwoHomesBtn);

    // Reveal 'fact' crystal in 'fen'
    const fenFactBtn = renderer.findByTestId('breaker-fen-fact');
    expect(fenFactBtn).toBeTruthy();
    renderer.click(fenFactBtn);

    // Advance to 'tong' and flip lens
    renderer.click(renderer.findByTestId('breaker-next-to-tong'));
    renderer.click(renderer.findByTestId('breaker-flip-lens-btn'));

    // Advance to 'ze', place an action stone, and click voluntary pause
    renderer.click(renderer.findByTestId('breaker-next-to-ze'));
    const actionBtns = renderer.findAll(
      (n) =>
        n.props &&
        typeof n.props['data-testid'] === 'string' &&
        n.props['data-testid'].startsWith('breaker-action-')
    );
    expect(actionBtns.length).toBeGreaterThan(0);
    renderer.click(actionBtns[0]);
    renderer.click(renderer.findByTestId('breaker-pause-btn'));

    // Now switch transition subbranch inline via step tab -> fen -> subbranch button, or verify reset on subbranch switch
    const stepFenTab = renderer.findByTestId('breaker-step-tab-fen');
    renderer.click(stepFenTab);
    const subSpecificBtn = renderer.findByTestId('breaker-sub-sub_specific_concern');
    expect(subSpecificBtn).toBeTruthy();
    renderer.click(subSpecificBtn);

    // Hook order in DifficultyBreakerModal.tsx (lines 440-468):
    // 0: selectedPresetId
    // 1: transitionSubId
    // 2: currentStep
    // 3: fenRevealed
    // 4: isCoinFlipped
    // 5: steppingStones
    // 6: pausedVoluntarily
    const breakerStates = renderer.getComponentStates('DifficultyBreakerModal');
    const liveSnapshot: BreakerProgressionSnapshot = {
      currentStep: breakerStates[2],
      selectedPresetId: breakerStates[0],
      transitionSubId: breakerStates[1],
      fenRevealed: breakerStates[3],
      isCoinFlipped: breakerStates[4],
      steppingStones: breakerStates[5],
      pausedVoluntarily: breakerStates[6],
    };
    expect(liveSnapshot.transitionSubId).toBe('sub_specific_concern');
    expect(isBreakerProgressionCleanlyResetToFen(liveSnapshot)).toBe(true);

    // Also verify pure helper
    const afterPresetSwitch = simulateBreakerScenarioSwitchReset(
      {
        ...liveSnapshot,
        currentStep: 'ze',
        fenRevealed: { fact: true, feeling: true, guess: true },
        isCoinFlipped: true,
        steppingStones: [{ id: 'a1', text: 'test', badge: 'test' }, null, null],
        pausedVoluntarily: true,
      },
      'diff-blocks-broken'
    );
    expect(isBreakerProgressionCleanlyResetToFen(afterPresetSwitch)).toBe(true);
    expect(afterPresetSwitch.selectedPresetId).toBe('diff-blocks-broken');

    renderer.unmount();
  });

  it('B0R-05: verifies live source files match BATCH02_BEHAVIOR_INTERFACE_MAP.json and ContentAuditRegistry fail-closed gates remain intact', () => {
    expect(fs.existsSync(BEHAVIOR_MAP_PATH)).toBe(true);
    const mapJson = JSON.parse(fs.readFileSync(BEHAVIOR_MAP_PATH, 'utf8'));
    expect(mapJson.gateId).toBe('A-LAND_V2.3_BATCH02_GATE_B0R_A');
    expect(mapJson.modules.thought_detective_lab.componentName).toBe('ThoughtDetectiveLabModal');
    expect(mapJson.modules.difficulty_breaker.componentName).toBe('DifficultyBreakerModal');

    // Verify source SHA-256 parity between disk and BATCH02_BEHAVIOR_INTERFACE_MAP.json
    for (const fileEntry of mapJson.inspectedSourceFiles) {
      const diskBuf = fs.readFileSync(path.join(ROOT_DIR, fileEntry.filePath));
      const actualSha = crypto.createHash('sha256').update(diskBuf).digest('hex');
      expect(fileEntry.sha256).toBe(actualSha);
      expect(fileEntry.bytes).toBe(diskBuf.length);
    }

    // ContentAuditRegistry fail-closed check for Batch02 & sub-modals
    expect(ContentAuditRegistry.getAuditRecord('thought-detective-lab')?.auditStatus).toBe('PENDING');
    expect(ContentAuditRegistry.getAuditRecord('difficulty-breaker')?.auditStatus).toBe('PENDING');
    expect(ContentAuditRegistry.getAuditRecord('game_crayon_detective')?.auditStatus).toBe('PENDING');
    expect(ContentAuditRegistry.canRenderContent('thought-detective-lab')).toBe(false);
    expect(ContentAuditRegistry.canRenderContent('difficulty-breaker')).toBe(false);
    expect(ContentAuditRegistry.canRenderContent('game_crayon_detective')).toBe(false);
  });

  it('B0R-06 (P2-01): verifies 22 canonical asset sets expand to 68 discrete state variants with zero unresolved wildcards and explicit Art Production owner mapping', () => {
    expect(BATCH02_CANONICAL_ASSET_SETS).toHaveLength(BATCH02_TOTAL_REQUIRED_SETS);
    expect(BATCH02_CANONICAL_DISCRETE_STATES).toHaveLength(
      BATCH02_TOTAL_REQUIRED_DISCRETE_STATES
    );
    expect(BATCH02_TOTAL_REQUIRED_SETS).toBe(22);
    expect(BATCH02_TOTAL_REQUIRED_DISCRETE_STATES).toBe(68);

    // Every discrete state targetFilePath must be concrete (zero {companionId} wildcards)
    for (const dSpec of BATCH02_CANONICAL_DISCRETE_STATES) {
      expect(dSpec.targetFilePath).not.toContain('{');
      expect(dSpec.targetFilePath).not.toContain('}');
      expect(dSpec.waitingOwner).toBe('Art Production / Art Director');
      expect(dSpec.approvalAuthority).toBe('Art Director');
    }

    expect(fs.existsSync(DISCRETE_MANIFEST_PATH)).toBe(true);
    const discreteManifest = JSON.parse(fs.readFileSync(DISCRETE_MANIFEST_PATH, 'utf8'));
    expect(discreteManifest.totals.canonicalAssetSets).toBe(22);
    expect(discreteManifest.totals.canonicalDiscreteStates).toBe(68);
    expect(discreteManifest.totals.thoughtDetectiveDiscreteStates).toBe(30);
    expect(discreteManifest.totals.difficultyBreakerDiscreteStates).toBe(26);
    expect(discreteManifest.totals.sharedCompanionRigDiscreteStates).toBe(12);
    expect(discreteManifest.totals.missingCount).toBe(68);
  });

  it('B0R-07 (P1-02 / B0R-B): defeats the 2 independent auditor 68/68 fabricated manifest counterexamples, all historical negative cases, and proves POS-01/02 metadata-only manifests remain HOLD-locked (canAuthorizeBatch02UiReplacement=false)', () => {
    expect(fs.existsSync(ARTWORK_LEDGER_PATH)).toBe(true);
    const ledger = JSON.parse(fs.readFileSync(ARTWORK_LEDGER_PATH, 'utf8'));
    const fixedReferenceMs = Date.parse('2026-10-17T18:00:00+08:00');

    expect(BATCH02_READ_ONLY_READINESS_HOLD_LOCK).toBe(true);
    expect(BATCH02_INDEPENDENT_ART_APPROVAL_REGISTRY).toHaveLength(0);

    // 0A. Independent Auditor Full 68/68 Fabricated Manifest #1 (all_68_nonexistent_canonical) -> MUST FAIL CLOSED
    const auditorFabricatedCanon = createAuditorFabricated68Manifest('canon');
    const auditorCanonReport = evaluateBatch02ProductionArtEligibility(auditorFabricatedCanon, {
      referenceNowMs: fixedReferenceMs,
    });
    expect(auditorCanonReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(auditorCanonReport.gateStatus).toBe(BATCH02_GATE_B0RB_DECISION_STATUS);
    expect(auditorCanonReport.verifiedDiscreteStateCount).toBe(0);
    expect(auditorCanonReport.verifiedSetCount).toBe(0);
    expect(auditorCanonReport.metadataComplete).toBe(false);
    expect(auditorCanonReport.physicallyVerifiedOnDisk).toBe(false);
    expect(auditorCanonReport.authenticatedApprovalVerified).toBe(false);
    expect(auditorCanonReport.physicallyVerifiedAndApproved).toBe(false);
    expect(auditorCanonReport.holdFlags.ART_DIRECTOR_QA_HOLD).toBe(true);
    expect(auditorCanonReport.holdFlags.CONTENT_QA_REVIEW).toBe(true);
    expect(auditorCanonReport.holdFlags.PRODUCTION_RELEASE_HOLD).toBe(true);
    expect(auditorCanonReport.holdFlags.ASSET_ARTWORK_BLOCKED).toBe(true);
    expect(auditorCanonReport.holdFlags.ARTWORK_GAP).toBe(true);
    expect(auditorCanonReport.holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED).toBe(true);
    expect(
      auditorCanonReport.blockingReasons.some((r) =>
        r.includes('FUTURE_APPROVAL_TIMESTAMP_REJECTED')
      )
    ).toBe(true);
    expect(
      auditorCanonReport.blockingReasons.some((r) =>
        r.startsWith('PHYSICAL_FILE_MISSING_ON_DISK')
      )
    ).toBe(true);

    // 0B. Independent Auditor Full 68/68 Fabricated Manifest #2 (all_68_nonexistent_wrong_paths) -> MUST FAIL CLOSED
    const auditorFabricatedWrong = createAuditorFabricated68Manifest('wrong');
    const auditorWrongReport = evaluateBatch02ProductionArtEligibility(auditorFabricatedWrong, {
      referenceNowMs: fixedReferenceMs,
    });
    expect(auditorWrongReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(auditorWrongReport.gateStatus).toBe(BATCH02_GATE_B0RB_DECISION_STATUS);
    expect(auditorWrongReport.verifiedDiscreteStateCount).toBe(0);
    expect(auditorWrongReport.verifiedSetCount).toBe(0);
    expect(auditorWrongReport.metadataComplete).toBe(false);
    expect(auditorWrongReport.physicallyVerifiedOnDisk).toBe(false);
    expect(auditorWrongReport.authenticatedApprovalVerified).toBe(false);
    expect(auditorWrongReport.holdFlags.ARTWORK_GAP).toBe(true);
    expect(auditorWrongReport.holdFlags.ASSET_ARTWORK_BLOCKED).toBe(true);
    expect(auditorWrongReport.holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED).toBe(true);
    expect(
      auditorWrongReport.blockingReasons.some((r) => r.startsWith('NON_CANONICAL_FILE_PATH'))
    ).toBe(true);
    expect(
      auditorWrongReport.blockingReasons.some((r) =>
        r.includes('FUTURE_APPROVAL_TIMESTAMP_REJECTED')
      )
    ).toBe(true);
    expect(
      auditorWrongReport.blockingReasons.some((r) =>
        r.startsWith('PHYSICAL_FILE_MISSING_ON_DISK')
      )
    ).toBe(true);

    // 1. Current repo 73-row ledger -> FAIL-CLOSED
    const repoReport = evaluateBatch02ProductionArtEligibility(
      ledger.entries as Batch02AssetInventoryEntry[],
      { referenceNowMs: fixedReferenceMs }
    );
    expect(repoReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(repoReport.gateStatus).toBe(BATCH02_GATE_B0RB_DECISION_STATUS);
    expect(repoReport.holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED).toBe(true);
    expect(repoReport.holdFlags.ARTWORK_GAP).toBe(true);
    expect(repoReport.missingRequiredSetIds).toHaveLength(22);
    expect(repoReport.missingRequiredDiscreteStateIds).toHaveLength(68);

    // 2. Empty ledger [] -> FAIL-CLOSED
    const emptyReport = evaluateBatch02ProductionArtEligibility([], {
      referenceNowMs: fixedReferenceMs,
    });
    expect(emptyReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(
      emptyReport.blockingReasons.some((r) => r.startsWith('EMPTY_ASSET_LEDGER'))
    ).toBe(true);

    // 3. Auditor Counterexample 1: 1 fake PRODUCTION_ART_ACCEPTED row with null filePath/hash/dimensions
    const auditorFixture: Batch02AssetInventoryEntry = {
      assetId: 'fixture_minimal_detective',
      sceneId: 'thought_detective',
      role: 'synthetic test fixture',
      filePath: null,
      existsInRepo: false,
      format: 'missing',
      pixelDimensions: null,
      hasAlphaTransparency: null,
      alphaZeroRatio: null,
      byteSize: null,
      sha256: null,
      provenance: 'synthetic audit test',
      sharesIdenticalBytesWith: [],
      status: 'PRODUCTION_ART_ACCEPTED',
      gapReason: 'none',
    };
    const ce1 = evaluateBatch02ProductionArtEligibility([auditorFixture], {
      referenceNowMs: fixedReferenceMs,
    });
    expect(ce1.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(ce1.holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED).toBe(true);

    // 4. Auditor Counterexample 2: 1 fake accepted row + 1 UNVERIFIED row
    const ce2 = evaluateBatch02ProductionArtEligibility(
      [
        auditorFixture,
        {
          ...auditorFixture,
          assetId: 'fixture_unknown_breaker',
          sceneId: 'difficulty_breaker',
          status: 'UNVERIFIED',
        },
      ],
      { referenceNowMs: fixedReferenceMs }
    );
    expect(ce2.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(
      ce2.blockingReasons.some((r) => r.startsWith('UNVERIFIED_ASSETS_PRESENT'))
    ).toBe(true);

    // 5. Auditor Counterexample 3: 2 fake accepted rows across scenes with null files/hashes
    const ce3 = evaluateBatch02ProductionArtEligibility(
      [
        auditorFixture,
        {
          ...auditorFixture,
          assetId: 'fixture_breaker',
          sceneId: 'difficulty_breaker',
        },
      ],
      { referenceNowMs: fixedReferenceMs }
    );
    expect(ce3.canAuthorizeBatch02UiReplacement).toBe(false);

    // 6. Missing 1 required discrete state (67/68) -> FAIL-CLOSED & metadataComplete=false
    const fullValid = createSyntheticValidCompleteManifest();
    const missingOneState = evaluateBatch02ProductionArtEligibility(fullValid.slice(0, 67), {
      referenceNowMs: fixedReferenceMs,
    });
    expect(missingOneState.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(missingOneState.metadataComplete).toBe(false);
    expect(missingOneState.permissionLayers.metadataReadiness.missingMetadataDiscreteStateIds).toHaveLength(1);

    // 7. Unresolved {companionId} wildcard path or missing 1 companion -> FAIL-CLOSED
    const withWildcard = fullValid.map((item, idx) =>
      idx === fullValid.length - 1
        ? {
            ...item,
            filePath: 'public/visual-v2/batch02-art/characters/{companionId}/rig_master_rgba.webp',
          }
        : item
    );
    const wildcardReport = evaluateBatch02ProductionArtEligibility(withWildcard, {
      referenceNowMs: fixedReferenceMs,
    });
    expect(wildcardReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(wildcardReport.metadataComplete).toBe(false);
    expect(
      wildcardReport.permissionLayers.metadataReadiness.missingMetadataCompanionIds
    ).toContain('qiqi_deer');

    // 8. Below minimum pixel dimensions -> FAIL-CLOSED
    const lowRes = fullValid.map((item, idx) =>
      idx === 0 ? { ...item, pixelDimensions: { width: 1280, height: 720 } } : item
    );
    const lowResReport = evaluateBatch02ProductionArtEligibility(lowRes, {
      referenceNowMs: fixedReferenceMs,
    });
    expect(lowResReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(lowResReport.metadataComplete).toBe(false);
    expect(
      lowResReport.blockingReasons.some((r) => r.startsWith('INSUFFICIENT_PIXEL_DIMENSIONS'))
    ).toBe(true);

    // 9. Missing required alpha channel -> FAIL-CLOSED
    const noAlpha = fullValid.map((item, idx) =>
      idx === 2 ? { ...item, hasAlphaTransparency: false } : item
    );
    const noAlphaReport = evaluateBatch02ProductionArtEligibility(noAlpha, {
      referenceNowMs: fixedReferenceMs,
    });
    expect(noAlphaReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(noAlphaReport.metadataComplete).toBe(false);
    expect(
      noAlphaReport.blockingReasons.some((r) => r.startsWith('MISSING_REQUIRED_ALPHA_CHANNEL'))
    ).toBe(true);

    // 10. Duplicate SHA-256 across states without approved sharedAssetRef -> FAIL-CLOSED
    const unapprovedDupSha = fullValid.map((item, idx) =>
      idx === 6
        ? {
            ...item,
            sha256: fullValid[5].sha256,
            artDirectorApproval: {
              ...item.artDirectorApproval!,
              approvedSha256: fullValid[5].sha256!,
            },
          }
        : item
    );
    const dupShaReport = evaluateBatch02ProductionArtEligibility(unapprovedDupSha, {
      referenceNowMs: fixedReferenceMs,
    });
    expect(dupShaReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(dupShaReport.metadataComplete).toBe(false);
    expect(
      dupShaReport.blockingReasons.some((r) =>
        r.startsWith('UNAPPROVED_DUPLICATE_SHA256_ACROSS_STATES')
      )
    ).toBe(true);

    // 11. SVG format marked PRODUCTION_ART_ACCEPTED -> FAIL-CLOSED
    const svgMarkedAccepted = fullValid.map((item, idx) =>
      idx === 5 ? { ...item, format: 'svg' as const } : item
    );
    const svgReport = evaluateBatch02ProductionArtEligibility(svgMarkedAccepted, {
      referenceNowMs: fixedReferenceMs,
    });
    expect(svgReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(svgReport.metadataComplete).toBe(false);
    expect(
      svgReport.blockingReasons.some((r) => r.startsWith('INVALID_PRODUCTION_FORMAT'))
    ).toBe(true);

    // 12. Missing Art Director approval -> FAIL-CLOSED
    const noApproval = fullValid.map((item, idx) =>
      idx === 8 ? { ...item, artDirectorApproval: null } : item
    );
    const noApprovalReport = evaluateBatch02ProductionArtEligibility(noApproval, {
      referenceNowMs: fixedReferenceMs,
    });
    expect(noApprovalReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(noApprovalReport.metadataComplete).toBe(false);
    expect(
      noApprovalReport.blockingReasons.some((r) =>
        r.startsWith('MISSING_OR_INVALID_ART_DIRECTOR_APPROVAL')
      )
    ).toBe(true);

    // 13. Duplicate assetId poisoning -> FAIL-CLOSED
    const dupIdReport = evaluateBatch02ProductionArtEligibility(
      [...fullValid, fullValid[0]],
      { referenceNowMs: fixedReferenceMs }
    );
    expect(dupIdReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(dupIdReport.metadataComplete).toBe(false);
    expect(
      dupIdReport.blockingReasons.some((r) => r.startsWith('DUPLICATE_ASSET_ID_ENTRIES'))
    ).toBe(true);

    // 14. POS-01 Downgraded to Read-Only Metadata Readiness:
    // Complete 68 metadata-valid entries prove ONLY `metadataComplete === true`,
    // and MUST NEVER authorize UI replacement when physical files and independent approval are absent!
    const pos01ReadinessReport = evaluateBatch02ProductionArtEligibility(
      [
        ...(ledger.entries as Batch02AssetInventoryEntry[]).filter(
          (e) => e.status === 'TECH_PREVIEW_ONLY'
        ),
        ...fullValid,
      ],
      { referenceNowMs: fixedReferenceMs }
    );
    expect(pos01ReadinessReport.metadataComplete).toBe(true);
    expect(pos01ReadinessReport.metadataReadyDiscreteStateCount).toBe(68);
    expect(pos01ReadinessReport.metadataReadySetCount).toBe(22);
    expect(
      pos01ReadinessReport.permissionLayers.metadataReadiness.metadataBlockingReasons
    ).toEqual([]);
    // Must remain strictly HOLD-locked and NOT authorized for UI replacement:
    expect(pos01ReadinessReport.physicallyVerifiedOnDisk).toBe(false);
    expect(pos01ReadinessReport.physicallyVerifiedDiscreteStateCount).toBe(0);
    expect(pos01ReadinessReport.authenticatedApprovalVerified).toBe(false);
    expect(pos01ReadinessReport.physicallyVerifiedAndApproved).toBe(false);
    expect(pos01ReadinessReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(pos01ReadinessReport.gateStatus).toBe(BATCH02_GATE_B0RB_DECISION_STATUS);
    expect(pos01ReadinessReport.verifiedDiscreteStateCount).toBe(0);
    expect(pos01ReadinessReport.verifiedSetCount).toBe(0);
    expect(pos01ReadinessReport.holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED).toBe(true);
    expect(pos01ReadinessReport.holdFlags.ARTWORK_GAP).toBe(true);
    expect(pos01ReadinessReport.holdFlags.ASSET_ARTWORK_BLOCKED).toBe(true);
    expect(pos01ReadinessReport.holdFlags.ART_DIRECTOR_QA_HOLD).toBe(true);
    expect(pos01ReadinessReport.holdFlags.CONTENT_QA_REVIEW).toBe(true);
    expect(pos01ReadinessReport.holdFlags.PRODUCTION_RELEASE_HOLD).toBe(true);

    // 15. POS-02 Downgraded to Read-Only Metadata Readiness (with explicit sharedAssetRef):
    const sharedManifest = fullValid.map((item, idx) => {
      if (idx === 5 || idx === 6) {
        return {
          ...item,
          sha256: fullValid[5].sha256,
          artDirectorApproval: {
            ...item.artDirectorApproval!,
            approvalId: 'AD-SHARED-SIGN-006',
            approvedSha256: fullValid[5].sha256!,
          },
          sharedAssetRef: {
            primaryAssetId: fullValid[5].assetId,
            sharedWithAssetIds: [fullValid[6].assetId],
            approvalId: 'AD-SHARED-SIGN-006',
            reason: 'Explicitly declared shared base prop in metadata test',
          },
        };
      }
      return item;
    });
    const pos02ReadinessReport = evaluateBatch02ProductionArtEligibility(sharedManifest, {
      referenceNowMs: fixedReferenceMs,
    });
    expect(pos02ReadinessReport.metadataComplete).toBe(true);
    expect(pos02ReadinessReport.metadataReadyDiscreteStateCount).toBe(68);
    expect(pos02ReadinessReport.canAuthorizeBatch02UiReplacement).toBe(false);
    expect(pos02ReadinessReport.holdFlags.ARTWORK_GAP).toBe(true);
    expect(pos02ReadinessReport.holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED).toBe(true);
  });

  it('B0R-08 (B0R-B Physical File & Binary Image Decoder Verification): verifies real on-disk PNG/WebP decoding, SHA-256 mismatch, corrupt image bitstream, decoded dimension mismatch, missing decoded RGBA alpha, and independent approval HOLD lock', () => {
    const fixedReferenceMs = Date.parse('2026-10-17T18:00:00+08:00');

    // 1. Direct binary decoder unit checks for PNG & WebP
    const validRgbaPng = buildValidPngBuffer({ width: 64, height: 48, colorType: 6 });
    const decodedPng = decodeAndVerifyPngBuffer(validRgbaPng);
    expect(decodedPng.valid).toBe(true);
    expect(decodedPng.format).toBe('png');
    expect(decodedPng.width).toBe(64);
    expect(decodedPng.height).toBe(48);
    expect(decodedPng.hasAlpha).toBe(true);

    const validRgbPng = buildValidPngBuffer({ width: 64, height: 48, colorType: 2 });
    const decodedRgbPng = decodeAndVerifyPngBuffer(validRgbPng);
    expect(decodedRgbPng.valid).toBe(true);
    expect(decodedRgbPng.hasAlpha).toBe(false);

    // Corrupt PNG (corrupt IDAT deflate payload with valid header)
    const corruptPng = Buffer.from(validRgbaPng);
    corruptPng[corruptPng.length - 16] ^= 0xff; // Flip byte inside IDAT / CRC
    const decodedCorruptPng = decodeAndVerifyPngBuffer(corruptPng);
    expect(decodedCorruptPng.valid).toBe(false);

    // Valid WebP (VP8L lossless with alpha)
    const validAlphaWebp = buildValidWebpVp8lBuffer({
      width: 1024,
      height: 1024,
      hasAlpha: true,
    });
    const decodedWebp = decodeAndVerifyWebpBuffer(validAlphaWebp);
    expect(decodedWebp.valid).toBe(true);
    expect(decodedWebp.format).toBe('webp');
    expect(decodedWebp.width).toBe(1024);
    expect(decodedWebp.height).toBe(1024);
    expect(decodedWebp.hasAlpha).toBe(true);

    // Corrupt WebP (header-only RIFF....WEBP without valid VP8/VP8L bitstream)
    const headerOnlyWebp = Buffer.from('RIFF\x04\x00\x00\x00WEBP', 'binary');
    expect(decodeAndVerifyWebpBuffer(headerOnlyWebp).valid).toBe(false);

    // 2. End-to-end physical file verification in an isolated temp directory
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aland-b0rb-phys-'));
    try {
      const baseManifest = createSyntheticValidCompleteManifest();

      // Write real valid WebP files to tmpRoot for states 0..3 with various physical defects on states 1, 2, 3:
      // State 0 (prod_detective_master_plate_desktop_16x9, 2560x1440, requireAlpha=false): REAL VALID WebP
      const spec0 = BATCH02_CANONICAL_DISCRETE_STATES[0];
      const validBuf0 = buildValidWebpVp8lBuffer({
        width: spec0.minWidth,
        height: spec0.minHeight,
        hasAlpha: false,
      });
      const absPath0 = path.join(tmpRoot, spec0.targetFilePath);
      fs.mkdirSync(path.dirname(absPath0), { recursive: true });
      fs.writeFileSync(absPath0, validBuf0);
      const sha0 = crypto.createHash('sha256').update(validBuf0).digest('hex');

      // State 1 (prod_detective_master_plate_mobile_3x4): WRONG SHA-256 on disk
      const spec1 = BATCH02_CANONICAL_DISCRETE_STATES[1];
      const validBuf1 = buildValidWebpVp8lBuffer({
        width: spec1.minWidth,
        height: spec1.minHeight,
        hasAlpha: false,
        seedByte: 0x33,
      });
      const absPath1 = path.join(tmpRoot, spec1.targetFilePath);
      fs.mkdirSync(path.dirname(absPath1), { recursive: true });
      fs.writeFileSync(absPath1, validBuf1);

      // State 2 (prod_detective_layer_distant_window_sky, requireAlpha=true): MISSING ALPHA on disk (hasAlpha=false)
      const spec2 = BATCH02_CANONICAL_DISCRETE_STATES[2];
      const noAlphaBuf2 = buildValidWebpVp8lBuffer({
        width: spec2.minWidth,
        height: spec2.minHeight,
        hasAlpha: false,
        seedByte: 0x44,
      });
      const absPath2 = path.join(tmpRoot, spec2.targetFilePath);
      fs.mkdirSync(path.dirname(absPath2), { recursive: true });
      fs.writeFileSync(absPath2, noAlphaBuf2);
      const sha2 = crypto.createHash('sha256').update(noAlphaBuf2).digest('hex');

      // State 3 (prod_detective_layer_workbench_foreground, 2560x640): UNDERSIZED PHYSICAL IMAGE on disk (64x64)
      const spec3 = BATCH02_CANONICAL_DISCRETE_STATES[3];
      const smallBuf3 = buildValidWebpVp8lBuffer({
        width: 64,
        height: 64,
        hasAlpha: true,
      });
      const absPath3 = path.join(tmpRoot, spec3.targetFilePath);
      fs.mkdirSync(path.dirname(absPath3), { recursive: true });
      fs.writeFileSync(absPath3, smallBuf3);
      const sha3 = crypto.createHash('sha256').update(smallBuf3).digest('hex');

      // State 4: CORRUPT IMAGE BYTES on disk (with matching SHA-256 and byteSize in metadata!)
      const spec4 = BATCH02_CANONICAL_DISCRETE_STATES[4];
      const corruptBuf4 = Buffer.from('RIFF\x10\x00\x00\x00WEBPVP8L\x04\x00\x00\x00BAD!', 'binary');
      const absPath4 = path.join(tmpRoot, spec4.targetFilePath);
      fs.mkdirSync(path.dirname(absPath4), { recursive: true });
      fs.writeFileSync(absPath4, corruptBuf4);
      const sha4 = crypto.createHash('sha256').update(corruptBuf4).digest('hex');

      const mixedManifest = baseManifest.map((entry, idx) => {
        if (idx === 0) {
          return {
            ...entry,
            byteSize: validBuf0.byteLength,
            sha256: sha0,
            artDirectorApproval: { ...entry.artDirectorApproval!, approvedSha256: sha0 },
          };
        }
        if (idx === 1) {
          return {
            ...entry,
            byteSize: validBuf1.byteLength,
            // Intentionally keep wrong sha256 to trigger PHYSICAL_SHA256_MISMATCH
          };
        }
        if (idx === 2) {
          return {
            ...entry,
            byteSize: noAlphaBuf2.byteLength,
            sha256: sha2,
            artDirectorApproval: { ...entry.artDirectorApproval!, approvedSha256: sha2 },
          };
        }
        if (idx === 3) {
          return {
            ...entry,
            byteSize: smallBuf3.byteLength,
            sha256: sha3,
            artDirectorApproval: { ...entry.artDirectorApproval!, approvedSha256: sha3 },
          };
        }
        if (idx === 4) {
          return {
            ...entry,
            byteSize: corruptBuf4.byteLength,
            sha256: sha4,
            artDirectorApproval: { ...entry.artDirectorApproval!, approvedSha256: sha4 },
          };
        }
        return entry;
      });

      const physMixedReport = evaluateBatch02ProductionArtEligibility(mixedManifest, {
        repoRootDir: tmpRoot,
        referenceNowMs: fixedReferenceMs,
      });

      // State 0 passed physical verification, while States 1..4 failed physical verification for distinct reasons:
      expect(physMixedReport.physicallyVerifiedDiscreteStateCount).toBe(1);
      expect(
        physMixedReport.blockingReasons.some((r) => r.startsWith('PHYSICAL_SHA256_MISMATCH'))
      ).toBe(true);
      expect(
        physMixedReport.blockingReasons.some((r) =>
          r.startsWith('PHYSICAL_MISSING_REQUIRED_ALPHA')
        )
      ).toBe(true);
      expect(
        physMixedReport.blockingReasons.some((r) =>
          r.startsWith('PHYSICAL_DIMENSIONS_BELOW_MIN')
        )
      ).toBe(true);
      expect(
        physMixedReport.blockingReasons.some((r) => r.startsWith('CORRUPT_IMAGE_BINARY'))
      ).toBe(true);
      // And even State 0 (which passed physical decoding) is rejected by Layer 4 Independent Art Approval Registry:
      expect(
        physMixedReport.blockingReasons.some((r) =>
          r.startsWith('CANDIDATE_SELF_ATTESTATION_NOT_TRUSTED')
        )
      ).toBe(true);
      expect(physMixedReport.approvedDiscreteStateCount).toBe(0);
      expect(physMixedReport.canAuthorizeBatch02UiReplacement).toBe(false);
      expect(physMixedReport.holdFlags.ARTWORK_GAP).toBe(true);
      expect(physMixedReport.holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED).toBe(true);
    } finally {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    }
  });
});
