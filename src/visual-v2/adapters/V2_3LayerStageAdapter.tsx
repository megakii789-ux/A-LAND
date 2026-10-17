import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { speechNarrator, type NarrationSession } from '../../utils/speech';
import {
  type V2_3CompanionId,
  type V2_3CompanionRigPart,
  type V2_3CompanionRigState,
  type V2_3SceneAssetRecord,
  V2_3_COMPANION_NATIVE_CUTOUT_MAP,
  V2_3_COMPANION_RIG_Z_ORDER,
  getCompanionRigLayers,
} from '../manifest/v2_3Batch01Manifest';

export interface V2_3AssetTimingEntry {
  assetId: string;
  publicUrl: string;
  sha256: string;
  bytes: number;
  status: 'loaded' | 'fallback';
  durationMs: number;
  isSharedGeometryFixture: boolean;
}

export interface V2_3SceneMediaLoadSummary {
  sceneId: string;
  assetSetSignature: string;
  totalExpected: number;
  loadedCount: number;
  fallbackCount: number;
  firstAssetLoadedMs: number | null;
  allAssetsLoadedMs: number | null;
  assets: Record<string, V2_3AssetTimingEntry>;
}

declare global {
  interface Window {
    __ALAND_V2_3_MEDIA_METRICS__?: Record<string, V2_3SceneMediaLoadSummary>;
  }
}

export function isExplicitQaDebugMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const searchParams = new URLSearchParams(window.location.search || '');
    return searchParams.get('qa') === '1';
  } catch {
    return false;
  }
}

function getNowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

function buildEmptySummary(
  sceneId: string,
  assetSetSignature: string,
  totalExpected: number
): V2_3SceneMediaLoadSummary {
  return {
    sceneId,
    assetSetSignature,
    totalExpected,
    loadedCount: 0,
    fallbackCount: 0,
    firstAssetLoadedMs: null,
    allAssetsLoadedMs: null,
    assets: {},
  };
}

/**
 * useV2_3MediaLoadTracker — Scene-scoped and asset-set-scoped media load tracker.
 *
 * Batch01R Remediation Contract:
 * - Whenever `sceneId` OR the ordered list of `expectedAssets` (`assetId`s) changes,
 *   all previous asset events and timing counters are immediately cleared and `mountTimeRef` resets.
 * - Stale load/error events from previous scenes or previous weather/calm states are rejected.
 * - `loadedCount`, `fallbackCount`, `firstAssetLoadedMs`, and `allAssetsLoadedMs` are computed
 *   exclusively from the current `expectedAssets` set.
 */
export function useV2_3MediaLoadTracker(
  sceneId: string,
  expectedAssets: readonly V2_3SceneAssetRecord[]
) {
  const assetIdsKey = useMemo(
    () => expectedAssets.map((a) => a.assetId).join('|'),
    [expectedAssets]
  );
  const assetSetSignature = `${sceneId}::${assetIdsKey}`;
  const expectedAssetIdSet = useMemo(
    () => new Set(expectedAssets.map((a) => a.assetId)),
    [expectedAssets]
  );

  const sessionRef = useRef<{
    signature: string;
    sceneId: string;
    mountTimeMs: number;
    summary: V2_3SceneMediaLoadSummary;
  }>({
    signature: assetSetSignature,
    sceneId,
    mountTimeMs: getNowMs(),
    summary: buildEmptySummary(sceneId, assetSetSignature, expectedAssets.length),
  });

  const [, setRenderTick] = useState<number>(0);

  // Synchronously reset session state if signature changed so even the first render frame has zero stale data
  if (sessionRef.current.signature !== assetSetSignature) {
    const freshSummary = buildEmptySummary(sceneId, assetSetSignature, expectedAssets.length);
    sessionRef.current = {
      signature: assetSetSignature,
      sceneId,
      mountTimeMs: getNowMs(),
      summary: freshSummary,
    };
    if (typeof window !== 'undefined') {
      window.__ALAND_V2_3_MEDIA_METRICS__ = window.__ALAND_V2_3_MEDIA_METRICS__ || {};
      window.__ALAND_V2_3_MEDIA_METRICS__[sceneId] = freshSummary;
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__ALAND_V2_3_MEDIA_METRICS__ = window.__ALAND_V2_3_MEDIA_METRICS__ || {};
      window.__ALAND_V2_3_MEDIA_METRICS__[sceneId] = sessionRef.current.summary;
    }
    setRenderTick((t) => t + 1);
  }, [assetSetSignature, sceneId]);

  const recordAssetEvent = useCallback(
    (record: V2_3SceneAssetRecord, status: 'loaded' | 'fallback') => {
      // Strictly reject stale asset callbacks that do not belong to the active expectedAssets set
      if (!expectedAssetIdSet.has(record.assetId)) {
        return;
      }
      if (sessionRef.current.signature !== assetSetSignature) {
        return;
      }

      const now = getNowMs();
      const durationMs = Math.max(1, Math.round((now - sessionRef.current.mountTimeMs) * 100) / 100);
      const prev = sessionRef.current.summary;

      const nextAssets: Record<string, V2_3AssetTimingEntry> = {};
      for (const [k, v] of Object.entries(prev.assets)) {
        if (expectedAssetIdSet.has(k)) {
          nextAssets[k] = v;
        }
      }

      nextAssets[record.assetId] = {
        assetId: record.assetId,
        publicUrl: record.publicUrl,
        sha256: record.sha256,
        bytes: record.bytes,
        status,
        durationMs,
        isSharedGeometryFixture: record.isSharedGeometryFixture,
      };

      const entries = Object.values(nextAssets);
      const loadedCount = entries.filter((e) => e.status === 'loaded').length;
      const fallbackCount = entries.filter((e) => e.status === 'fallback').length;
      const firstAssetLoadedMs =
        entries.length > 0 ? Math.min(...entries.map((e) => e.durationMs)) : null;
      const allAssetsLoadedMs =
        expectedAssets.length > 0 && entries.length >= expectedAssets.length
          ? Math.max(...entries.map((e) => e.durationMs))
          : null;

      const nextSummary: V2_3SceneMediaLoadSummary = {
        sceneId,
        assetSetSignature,
        totalExpected: expectedAssets.length,
        loadedCount,
        fallbackCount,
        firstAssetLoadedMs,
        allAssetsLoadedMs,
        assets: nextAssets,
      };

      sessionRef.current.summary = nextSummary;
      if (typeof window !== 'undefined') {
        window.__ALAND_V2_3_MEDIA_METRICS__ = window.__ALAND_V2_3_MEDIA_METRICS__ || {};
        window.__ALAND_V2_3_MEDIA_METRICS__[sceneId] = nextSummary;
      }
      setRenderTick((t) => t + 1);
    },
    [assetSetSignature, expectedAssetIdSet, expectedAssets.length, sceneId]
  );

  return {
    summary: sessionRef.current.summary,
    recordAssetEvent,
  };
}

function buildFallbackSvgDataUri(assetId: string): string {
  const isCalm = assetId.startsWith('calm_corner');
  const svg = isCalm
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#134E4A"/><stop offset="100%" stop-color="#0F766E"/></linearGradient></defs><rect width="1200" height="675" rx="32" fill="url(#g)" fill-opacity="0.45"/><circle cx="600" cy="338" r="140" fill="#99F6E4" fill-opacity="0.35"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#BAE6FD"/></linearGradient></defs><rect width="1200" height="675" rx="32" fill="url(#w)" fill-opacity="0.45"/><circle cx="600" cy="260" r="110" fill="#FDE68A" fill-opacity="0.45"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface V2_3ResilientSvgLayerProps {
  record: V2_3SceneAssetRecord;
  testId: string;
  isMobileStage?: boolean;
  className?: string;
  style?: React.CSSProperties;
  forceFallbackForTest?: boolean;
  onAssetMetric?: (record: V2_3SceneAssetRecord, status: 'loaded' | 'fallback') => void;
}

export const V2_3ResilientSvgLayer: React.FC<V2_3ResilientSvgLayerProps> = ({
  record,
  testId,
  isMobileStage = false,
  className = 'absolute inset-0 w-full h-full object-cover pointer-events-none select-none',
  style,
  forceFallbackForTest = false,
  onAssetMetric,
}) => {
  const [useFallback, setUseFallback] = useState<boolean>(forceFallbackForTest);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const reportedRef = useRef<string>('');

  const resolvedUrl =
    isMobileStage && record.mobilePublicUrl ? record.mobilePublicUrl : record.publicUrl;
  const resolvedSha =
    isMobileStage && record.mobileSha256 ? record.mobileSha256 : record.sha256;
  const resolvedBytes =
    isMobileStage && record.mobileBytes ? record.mobileBytes : record.bytes;

  useEffect(() => {
    setUseFallback(forceFallbackForTest);
    reportedRef.current = '';
  }, [record.assetId, resolvedUrl, forceFallbackForTest]);

  useEffect(() => {
    const img = imgRef.current;
    const reportKey = `${record.assetId}::${resolvedUrl}::${useFallback ? 'fallback' : 'loaded'}`;
    if (img && img.complete && img.naturalWidth > 0 && reportedRef.current !== reportKey) {
      reportedRef.current = reportKey;
      onAssetMetric?.(record, useFallback ? 'fallback' : 'loaded');
    }
  }, [onAssetMetric, record, resolvedUrl, useFallback]);

  const handleLoad = () => {
    const reportKey = `${record.assetId}::${resolvedUrl}::${useFallback ? 'fallback' : 'loaded'}`;
    if (reportedRef.current !== reportKey) {
      reportedRef.current = reportKey;
      onAssetMetric?.(record, useFallback ? 'fallback' : 'loaded');
    }
  };

  const handleError = () => {
    if (!useFallback) {
      setUseFallback(true);
    }
    const reportKey = `${record.assetId}::${resolvedUrl}::fallback`;
    if (reportedRef.current !== reportKey) {
      reportedRef.current = reportKey;
      onAssetMetric?.(record, 'fallback');
    }
  };

  const src = useFallback ? buildFallbackSvgDataUri(record.assetId) : resolvedUrl;

  return (
    <img
      ref={imgRef}
      data-testid={testId}
      data-asset-id={record.assetId}
      data-sha256={resolvedSha}
      data-bytes={resolvedBytes}
      data-shared-geometry={record.isSharedGeometryFixture ? 'true' : 'false'}
      data-fallback-active={useFallback ? 'true' : 'false'}
      data-artwork-status="ASSET_ARTWORK_BLOCKED"
      data-tech-preview="TECH_PREVIEW_NOT_ART_APPROVED"
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      src={src}
      alt=""
      draggable={false}
      onLoad={handleLoad}
      onError={handleError}
      className={className}
      style={style}
    />
  );
};

export const COMPANION_DISPLAY_NAMES: Record<V2_3CompanionId, string> = {
  guoguo_squirrel: '小松鼠果果',
  beibei_otter: '小水獭贝贝',
  tiantian_raccoon: '小浣熊天天',
  qiqi_deer: '小鹿奇奇',
};

export const COMPANION_SHORT_NAMES: Record<V2_3CompanionId, string> = {
  guoguo_squirrel: '果果',
  beibei_otter: '贝贝',
  tiantian_raccoon: '天天',
  qiqi_deer: '奇奇',
};

export const COMPANION_ROLE_BADGES: Record<V2_3CompanionId, string> = {
  guoguo_squirrel: '好奇小探险家',
  beibei_otter: '温暖小乐天派',
  tiantian_raccoon: '聪明小发明家',
  qiqi_deer: '温柔小治愈师',
};

export interface V2_3CompanionRigActorProps {
  companionId: V2_3CompanionId;
  state: V2_3CompanionRigState;
  prefersReducedMotion: boolean;
  className?: string;
  testIdPrefix?: string;
}

/**
 * V2_3CompanionRigActor — Renders one of the 4 official companions using the genuine 3D cartoon RGBA cutout
 * from `02_EXISTING_TRANSPARENT_CUTOUTS_PREVIEW_ONLY` at native-safe preview dimensions (`<= 172..206px` native width,
 * never stretched to fake 4K), paired with the 7-part voice-synced rig state layers so that mouth movement
 * strictly follows `speechNarrator` (`playbackStatus === 'playing'` && `!prefersReducedMotion`).
 */
export const V2_3CompanionRigActor: React.FC<V2_3CompanionRigActorProps> = ({
  companionId,
  state,
  prefersReducedMotion,
  className = 'w-28 h-35',
  testIdPrefix = 'v2-3-companion-rig',
}) => {
  const [narrationSession, setNarrationSession] = useState<NarrationSession>(() =>
    speechNarrator.getNarrationSession()
  );
  const [mouthOpenTick, setMouthOpenTick] = useState<boolean>(false);
  const [blinkTick, setBlinkTick] = useState<boolean>(false);

  useEffect(() => {
    return speechNarrator.subscribe(() => {
      setNarrationSession({ ...speechNarrator.getNarrationSession() });
    });
  }, []);

  const isPlayingSpeech =
    narrationSession.playbackStatus === 'playing' &&
    narrationSession.companionId === companionId;
  const isPausedSpeech = narrationSession.playbackStatus === 'paused';

  useEffect(() => {
    if (!isPlayingSpeech || prefersReducedMotion) {
      setMouthOpenTick(false);
      return;
    }
    setMouthOpenTick(true);
    const timer = setInterval(() => {
      setMouthOpenTick((prev) => !prev);
    }, 220);
    return () => clearInterval(timer);
  }, [isPlayingSpeech, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || isPausedSpeech || state === 'comfort') {
      setBlinkTick(false);
      return;
    }
    const interval = setInterval(() => {
      setBlinkTick(true);
      setTimeout(() => setBlinkTick(false), 160);
    }, 3600);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, isPausedSpeech, state]);

  const effectiveState: V2_3CompanionRigState = isPausedSpeech ? 'neutral' : state;
  const baseLayers = getCompanionRigLayers(companionId, effectiveState);
  const greetingLayers = getCompanionRigLayers(companionId, 'greeting');
  const neutralLayers = getCompanionRigLayers(companionId, 'neutral');
  const comfortLayers = getCompanionRigLayers(companionId, 'comfort');
  const nativeCutout = V2_3_COMPANION_NATIVE_CUTOUT_MAP[companionId];

  const resolvePartRecord = (part: V2_3CompanionRigPart) => {
    if (part === 'mouth') {
      if (isPlayingSpeech && !prefersReducedMotion) {
        return mouthOpenTick ? greetingLayers.mouth : neutralLayers.mouth;
      }
      if (effectiveState === 'greeting') {
        return neutralLayers.mouth;
      }
      return baseLayers.mouth;
    }
    if (part === 'eyes') {
      if (blinkTick && !prefersReducedMotion) {
        return comfortLayers.eyes;
      }
      return baseLayers.eyes;
    }
    return baseLayers[part];
  };

  const bodyMotionClass =
    prefersReducedMotion || isPausedSpeech
      ? ''
      : isPlayingSpeech
        ? 'transition-transform duration-300 -translate-y-1 scale-[1.03]'
        : 'transition-transform duration-700';

  return (
    <div
      data-testid={testIdPrefix}
      data-companion-id={companionId}
      data-rig-state={effectiveState}
      data-playback-status={narrationSession.playbackStatus}
      data-mouth-active={isPlayingSpeech && !prefersReducedMotion ? 'true' : 'false'}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      data-native-cutout-sha256={nativeCutout.sha256}
      data-native-width={nativeCutout.nativeWidth}
      data-native-height={nativeCutout.nativeHeight}
      data-artwork-status="ASSET_ARTWORK_BLOCKED"
      data-tech-preview="TECH_PREVIEW_NOT_ART_APPROVED"
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      aria-label={`${COMPANION_DISPLAY_NAMES[companionId]}（3D伙伴伴读角色）`}
      className={`relative select-none pointer-events-none aspect-[420/525] max-w-[168px] ${bodyMotionClass} ${className}`}
    >
      {/* Genuine 3D Cartoon RGBA Cutout at native-safe display dimensions (never stretched beyond native 172..206px) */}
      <img
        data-testid={`${testIdPrefix}-3d-cutout`}
        data-sha256={nativeCutout.sha256}
        src={nativeCutout.publicUrl}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_10px_16px_rgba(15,23,42,0.32)]"
        style={{ zIndex: 10 }}
      />

      {/* Voice-Speaking Animated Indicator Badge (only visible when speechNarrator is actively playing for this companion) */}
      {isPlayingSpeech && (
        <div
          data-testid={`${testIdPrefix}-speaking-indicator`}
          className="absolute -top-2 right-0 z-20 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 border-2 border-white shadow-md text-[10px] font-black flex items-center gap-1"
        >
          <span className={prefersReducedMotion ? '' : 'animate-pulse'}>🔊</span>
          <span>伴读中</span>
        </div>
      )}

      {/* Synchronized 7-part rig telemetry nodes for voice/mouth/blink state verification */}
      <div className="sr-only" aria-hidden="true">
        {V2_3_COMPANION_RIG_Z_ORDER.map((part, idx) => {
          const partRecord = resolvePartRecord(part);
          return (
            <img
              key={part}
              data-testid={`${testIdPrefix}-part-${part}`}
              data-part={part}
              data-asset-id={partRecord.assetId}
              data-sha256={partRecord.sha256}
              src={partRecord.publicUrl}
              alt=""
              draggable={false}
              style={{ zIndex: idx + 1 }}
            />
          );
        })}
      </div>
    </div>
  );
};

export interface V2_3LayerToggleSpec {
  id: string;
  label: string;
  record: V2_3SceneAssetRecord;
}

export interface V2_3ReviewerDebugDrawerProps {
  sceneKey: 'weather_station' | 'calm_corner';
  sceneTitle: string;
  activeStateLabel: string;
  companionId: V2_3CompanionId;
  companionState: V2_3CompanionRigState;
  layers: readonly V2_3LayerToggleSpec[];
  enabledLayers: Record<string, boolean>;
  onToggleLayer: (id: string) => void;
  onResetLayers: () => void;
  mediaSummary: V2_3SceneMediaLoadSummary;
  geometryDisclosure: string;
  defaultOpen?: boolean;
  forceEnableQaForTest?: boolean;
  testIdPrefix: string;
}

/**
 * V2_3ReviewerDebugDrawer — Strictly gated behind explicit `?qa=1` query parameter.
 *
 * Batch01R Contract:
 * - Completely absent (`return null`) in normal child-facing views so no child ever sees
 *   "审阅/工程调试抽屉 · QA Hold" or any technical QA strings.
 * - Only renders when `?qa=1` is explicitly present in the URL (or `forceEnableQaForTest` in unit tests).
 */
export const V2_3ReviewerDebugDrawer: React.FC<V2_3ReviewerDebugDrawerProps> = ({
  sceneKey,
  sceneTitle,
  activeStateLabel,
  companionId,
  companionState,
  layers,
  enabledLayers,
  onToggleLayer,
  onResetLayers,
  mediaSummary,
  geometryDisclosure,
  defaultOpen = false,
  forceEnableQaForTest = false,
  testIdPrefix,
}) => {
  const qaAllowed = forceEnableQaForTest || isExplicitQaDebugMode();
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [narrationSession, setNarrationSession] = useState<NarrationSession>(() =>
    speechNarrator.getNarrationSession()
  );

  useEffect(() => {
    if (!qaAllowed) return;
    return speechNarrator.subscribe(() => {
      setNarrationSession({ ...speechNarrator.getNarrationSession() });
    });
  }, [qaAllowed]);

  if (!qaAllowed) {
    return null;
  }

  const visibleCount = layers.filter((l) => enabledLayers[l.id] !== false).length;

  return (
    <div
      data-testid={`${testIdPrefix}-debug-drawer-container`}
      data-scene-key={sceneKey}
      data-drawer-open={isOpen ? 'true' : 'false'}
      data-artwork-status="ASSET_ARTWORK_BLOCKED"
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      data-tech-preview="TECH_PREVIEW_NOT_ART_APPROVED"
      data-content-gate="CONTENT_QA_REVIEW"
      data-release-gate="PRODUCTION_RELEASE_HOLD"
      className="pt-1"
    >
      <div className="flex items-center justify-end">
        <button
          type="button"
          data-testid={`${testIdPrefix}-debug-drawer-toggle`}
          aria-expanded={isOpen}
          aria-controls={`${testIdPrefix}-inspector-panel`}
          onClick={() => setIsOpen((prev) => !prev)}
          className="min-h-[56px] min-w-[56px] px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-sky-100 text-stone-700 border border-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <span>
            {isOpen
              ? `收起QA审阅面板 (${sceneTitle})`
              : `QA审阅面板 (?qa=1 · 图层 ${visibleCount}/${layers.length})`}
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          id={`${testIdPrefix}-inspector-panel`}
          data-testid={`${testIdPrefix}-inspector-panel`}
          className="mt-2 rounded-2xl bg-slate-900/95 text-slate-100 px-3.5 py-3 border border-sky-400/40 space-y-2.5 text-left"
        >
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                data-testid={`${testIdPrefix}-art-hold-badge`}
                className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black"
              >
                ASSET_ARTWORK_BLOCKED · ART_DIRECTOR_QA_HOLD
              </span>
              <span
                data-testid={`${testIdPrefix}-production-zero-badge`}
                className="px-2 py-0.5 rounded-full bg-rose-900/90 text-rose-100 border border-rose-400/40 font-bold"
              >
                production_quality_approved = 0 · PRODUCTION_RELEASE_HOLD
              </span>
              <span
                data-testid={`${testIdPrefix}-content-qa-badge`}
                className="px-2 py-0.5 rounded-full bg-sky-900/90 text-sky-100 border border-sky-400/40 font-bold"
              >
                CONTENT_QA_REVIEW
              </span>
            </div>
            <span
              data-testid={`${testIdPrefix}-voice-status-pill`}
              data-playback-status={narrationSession.playbackStatus}
              data-companion-id={companionId}
              data-companion-state={companionState}
              className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-200 font-bold"
            >
              伙伴：{companionId} ({companionState}) · 语音：{narrationSession.playbackStatus} · 状态：{activeStateLabel}
            </span>
          </div>

          <div
            data-testid={`${testIdPrefix}-geometry-disclosure`}
            className="text-[11px] text-slate-300 bg-slate-800/80 rounded-xl px-2.5 py-1.5 border border-slate-700 leading-relaxed"
          >
            <strong className="text-amber-300">美术门禁披露：</strong>
            {geometryDisclosure}
          </div>

          <div
            data-testid={`${testIdPrefix}-media-metrics`}
            data-loaded-count={mediaSummary.loadedCount}
            data-expected-count={mediaSummary.totalExpected}
            data-fallback-count={mediaSummary.fallbackCount}
            data-all-loaded-ms={mediaSummary.allAssetsLoadedMs ?? 0}
            className="text-[11px] text-emerald-300 font-mono flex flex-wrap gap-3"
          >
            <span>
              已加载图层: {mediaSummary.loadedCount}/{mediaSummary.totalExpected}
            </span>
            <span>Fallback触发: {mediaSummary.fallbackCount}</span>
            <span>
              首层耗时: {mediaSummary.firstAssetLoadedMs !== null ? `${mediaSummary.firstAssetLoadedMs}ms` : '加载中'}
            </span>
            <span>
              全层完成: {mediaSummary.allAssetsLoadedMs !== null ? `${mediaSummary.allAssetsLoadedMs}ms` : '加载中'}
            </span>
          </div>

          <div
            data-testid={`${testIdPrefix}-layer-toggles`}
            className="grid grid-cols-2 sm:grid-cols-4 gap-1.5"
            role="group"
            aria-label={`${sceneTitle} 图层独立开关`}
          >
            {layers.map((layer) => {
              const active = enabledLayers[layer.id] !== false;
              return (
                <button
                  key={layer.id}
                  type="button"
                  data-testid={`${testIdPrefix}-layer-toggle-${layer.id}`}
                  aria-pressed={active}
                  onClick={() => onToggleLayer(layer.id)}
                  className={`min-h-[56px] min-w-[56px] px-2.5 py-1.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer flex flex-col items-center justify-center ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-300 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-600'
                  }`}
                >
                  <span>{layer.label}</span>
                  <span className="text-[10px] opacity-85">
                    {active ? '显示中' : '已隐藏'} · {layer.record.sha256.slice(0, 8)}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              data-testid={`${testIdPrefix}-layer-toggle-reset`}
              onClick={onResetLayers}
              className="min-h-[56px] min-w-[56px] px-2.5 py-1.5 rounded-xl text-[11px] font-black border bg-amber-600 hover:bg-amber-500 text-white border-amber-300 transition-all cursor-pointer flex flex-col items-center justify-center"
            >
              <span>重置全部图层</span>
              <span className="text-[10px] opacity-90">恢复默认显示</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
