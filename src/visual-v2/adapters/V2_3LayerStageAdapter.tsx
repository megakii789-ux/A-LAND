import React, { useCallback, useEffect, useRef, useState } from 'react';
import { speechNarrator, type NarrationSession } from '../../utils/speech';
import {
  type V2_3CompanionId,
  type V2_3CompanionRigPart,
  type V2_3CompanionRigState,
  type V2_3SceneAssetRecord,
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

export function useV2_3MediaLoadTracker(sceneId: string, expectedAssets: readonly V2_3SceneAssetRecord[]) {
  const mountTimeRef = useRef<number>(
    typeof performance !== 'undefined' ? performance.now() : Date.now()
  );

  const [summary, setSummary] = useState<V2_3SceneMediaLoadSummary>(() => ({
    sceneId,
    totalExpected: expectedAssets.length,
    loadedCount: 0,
    fallbackCount: 0,
    firstAssetLoadedMs: null,
    allAssetsLoadedMs: null,
    assets: {},
  }));

  useEffect(() => {
    mountTimeRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
  }, [sceneId]);

  const recordAssetEvent = useCallback(
    (record: V2_3SceneAssetRecord, status: 'loaded' | 'fallback') => {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const durationMs = Math.max(1, Math.round((now - mountTimeRef.current) * 100) / 100);

      setSummary((prev) => {
        const nextAssets: Record<string, V2_3AssetTimingEntry> = {
          ...prev.assets,
          [record.assetId]: {
            assetId: record.assetId,
            publicUrl: record.publicUrl,
            sha256: record.sha256,
            bytes: record.bytes,
            status,
            durationMs,
            isSharedGeometryFixture: record.isSharedGeometryFixture,
          },
        };
        const entries = Object.values(nextAssets);
        const loadedCount = entries.filter((e) => e.status === 'loaded').length;
        const fallbackCount = entries.filter((e) => e.status === 'fallback').length;
        const firstAssetLoadedMs =
          prev.firstAssetLoadedMs !== null ? prev.firstAssetLoadedMs : durationMs;
        const allAssetsLoadedMs =
          entries.length >= expectedAssets.length
            ? Math.max(...entries.map((e) => e.durationMs))
            : prev.allAssetsLoadedMs;

        const nextSummary: V2_3SceneMediaLoadSummary = {
          sceneId,
          totalExpected: expectedAssets.length,
          loadedCount,
          fallbackCount,
          firstAssetLoadedMs,
          allAssetsLoadedMs,
          assets: nextAssets,
        };

        if (typeof window !== 'undefined') {
          window.__ALAND_V2_3_MEDIA_METRICS__ = window.__ALAND_V2_3_MEDIA_METRICS__ || {};
          window.__ALAND_V2_3_MEDIA_METRICS__[sceneId] = nextSummary;
        }

        return nextSummary;
      });
    },
    [expectedAssets.length, sceneId]
  );

  return { summary, recordAssetEvent };
}

function buildFallbackSvgDataUri(assetId: string): string {
  const safeLabel = assetId.replace(/[^a-zA-Z0-9_/-]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#E0F2FE" fill-opacity="0.35"/><rect x="24" y="24" width="1152" height="627" rx="28" fill="none" stroke="#0284C7" stroke-width="4" stroke-dasharray="12 8"/><text x="600" y="338" text-anchor="middle" fill="#0369A1" font-family="sans-serif" font-size="22" font-weight="bold">FALLBACK LAYER (${safeLabel})</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface V2_3ResilientSvgLayerProps {
  record: V2_3SceneAssetRecord;
  testId: string;
  className?: string;
  style?: React.CSSProperties;
  forceFallbackForTest?: boolean;
  onAssetMetric?: (record: V2_3SceneAssetRecord, status: 'loaded' | 'fallback') => void;
}

export const V2_3ResilientSvgLayer: React.FC<V2_3ResilientSvgLayerProps> = ({
  record,
  testId,
  className = 'absolute inset-0 w-full h-full object-fill pointer-events-none select-none',
  style,
  forceFallbackForTest = false,
  onAssetMetric,
}) => {
  const [useFallback, setUseFallback] = useState<boolean>(forceFallbackForTest);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const reportedRef = useRef<string>('');

  useEffect(() => {
    setUseFallback(forceFallbackForTest);
    reportedRef.current = '';
  }, [record.assetId, record.publicUrl, forceFallbackForTest]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0 && reportedRef.current !== record.assetId) {
      reportedRef.current = record.assetId;
      onAssetMetric?.(record, useFallback ? 'fallback' : 'loaded');
    }
  }, [onAssetMetric, record, useFallback]);

  const handleLoad = () => {
    if (reportedRef.current !== record.assetId) {
      reportedRef.current = record.assetId;
      onAssetMetric?.(record, useFallback ? 'fallback' : 'loaded');
    }
  };

  const handleError = () => {
    if (!useFallback) {
      setUseFallback(true);
    }
    if (reportedRef.current !== `${record.assetId}:fallback`) {
      reportedRef.current = `${record.assetId}:fallback`;
      onAssetMetric?.(record, 'fallback');
    }
  };

  const src = useFallback ? buildFallbackSvgDataUri(record.assetId) : record.publicUrl;

  return (
    <img
      ref={imgRef}
      data-testid={testId}
      data-asset-id={record.assetId}
      data-sha256={record.sha256}
      data-bytes={record.bytes}
      data-shared-geometry={record.isSharedGeometryFixture ? 'true' : 'false'}
      data-fallback-active={useFallback ? 'true' : 'false'}
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

export interface V2_3CompanionRigActorProps {
  companionId: V2_3CompanionId;
  state: V2_3CompanionRigState;
  prefersReducedMotion: boolean;
  className?: string;
  testIdPrefix?: string;
}

/**
 * V2_3CompanionRigActor — Renders one of the 4 official companions using the 7-part V2.3 SVG rig
 * (`ears_or_tail`, `far_arm`, `torso`, `head`, `eyes`, `mouth`, `near_arm`).
 *
 * Truth & Voice rules:
 * - Only the 4 official companion identities (`guoguo_squirrel`, `beibei_otter`, `tiantian_raccoon`, `qiqi_deer`) are supported.
 * - Mouth movement ONLY activates when `speechNarrator` session `playbackStatus === 'playing'` AND `!prefersReducedMotion`.
 * - When `playbackStatus === 'paused'` or `'idle'`, mouth immediately resets to a static closed state (`data-mouth-active="false"`).
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

  const resolvePartRecord = (part: V2_3CompanionRigPart) => {
    if (part === 'mouth') {
      if (isPlayingSpeech && !prefersReducedMotion) {
        return mouthOpenTick ? greetingLayers.mouth : neutralLayers.mouth;
      }
      // When not actively speaking, never leave the open 'greeting' mouth stuck open
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
        ? 'transition-transform duration-300 -translate-y-0.5'
        : 'transition-transform duration-700';

  return (
    <div
      data-testid={testIdPrefix}
      data-companion-id={companionId}
      data-rig-state={effectiveState}
      data-playback-status={narrationSession.playbackStatus}
      data-mouth-active={isPlayingSpeech && !prefersReducedMotion ? 'true' : 'false'}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      data-tech-preview="TECH_PREVIEW_NOT_ART_APPROVED"
      data-art-gate="ART_DIRECTOR_QA_HOLD"
      aria-label={`${COMPANION_DISPLAY_NAMES[companionId]}（V2.3 7部件技术分层角色）`}
      className={`relative select-none pointer-events-none aspect-[420/525] ${bodyMotionClass} ${className}`}
    >
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
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ zIndex: idx + 1 }}
          />
        );
      })}
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
  testIdPrefix: string;
}

/**
 * Default-collapsed (`defaultOpen = false`) engineering/reviewer debug drawer for V2.3 Batch 01 scenes.
 * Keeps the child-facing experience free of engineering strings while giving auditors & Playwright
 * full visibility into SHA-256 provenance, layer toggles, shared-geometry fixtures, and load timings.
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
  testIdPrefix,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [narrationSession, setNarrationSession] = useState<NarrationSession>(() =>
    speechNarrator.getNarrationSession()
  );

  useEffect(() => {
    return speechNarrator.subscribe(() => {
      setNarrationSession({ ...speechNarrator.getNarrationSession() });
    });
  }, []);

  const visibleCount = layers.filter((l) => enabledLayers[l.id] !== false).length;

  return (
    <div
      data-testid={`${testIdPrefix}-debug-drawer-container`}
      data-scene-key={sceneKey}
      data-drawer-open={isOpen ? 'true' : 'false'}
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
              ? `收起审阅调试抽屉 (${sceneTitle} · QA Hold)`
              : `审阅/工程调试抽屉 (图层 ${visibleCount}/${layers.length} · QA Hold)`}
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
                ART_DIRECTOR_QA_HOLD · TECH_PREVIEW_NOT_ART_APPROVED
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
            <strong className="text-amber-300">技术适配源披露：</strong>
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

          {/* Layer Toggle Buttons >= 56x56 CSS px */}
          <div
            data-testid={`${testIdPrefix}-layer-toggles`}
            className="grid grid-cols-2 sm:grid-cols-4 gap-1.5"
            role="group"
            aria-label={`${sceneTitle} V2.3 图层独立开关`}
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
