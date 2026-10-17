# A-LAND V2.3 Batch02 · Gate B0-C — Proposed V2 Integration Plan & Validation Specification

## 1. Non-Destructive V2 Adapter Architecture

To guarantee zero regressions to frozen business logic (`ThoughtDetectiveLabModal.tsx`, `DifficultyBreakerModal.tsx`, `src/domain/**`, `src/context/**`, `src/utils/speech.ts`) and frozen Batch01R components (`WeatherStationModal.tsx`, `CalmSpace.tsx`, `CalmCornerModal.tsx`), Batch02 visual integration will follow the exact adapter pattern proven in Batch01R:

1. **Executable Contracts (`src/visual-v2/batch02-gate0/batch02Gate0Contracts.ts`)**:
   - Defines `ThoughtDetectiveSceneArtV2Props` and `DifficultyBreakerSceneArtV2Props` with 1:1 state and callback parity against the live business components.
   - Defines `evaluateBatch02ProductionArtEligibility(entries)` which enforces a **fail-closed** preflight check: until all required high-resolution 3D assets are present and marked `PRODUCTION_ART_ACCEPTED`, `canAuthorizeBatch02UiReplacement` evaluates to `false` and returns `ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED`.
2. **Reuse of `V2_3LayerStageAdapter.tsx` Infrastructure**:
   - **Media Load Tracker (`useV2_3MediaLoadTracker`)**: Scene-scoped and asset-set-scoped `loadedCount` / `fallbackCount` / timing metrics (`window.__ALAND_V2_3_MEDIA_METRICS__`), resetting synchronously whenever `sceneId` or active tool/stage asset signature changes.
   - **Resilient Layer Rendering (`V2_3ResilientSvgLayer`)**: Responsive `16:9` desktop (`>= 640px`) and `3:4` mobile (`< 640px`) stage switching with deterministic SVG fallback on network error.
   - **Voice-Driven Companion Rig (`V2_3CompanionRigActor`)**: Subscribes to `speechNarrator.subscribeSession` and `speechNarrator.subscribeSpeakingState` to drive companion mouth/expression states while respecting `prefers-reduced-motion`.
   - **Explicit QA Drawer (`V2_3ReviewerDebugDrawer`)**: Hidden from normal child reading flow; rendered only when `?qa=1` is present in the URL.

---

## 2. Multi-Viewport Layout, Touch Target & Collision Prevention Contract

When Batch02 production 3D assets are delivered and UI replacement is authorized in a future gate, the stage components must pass the following automated Playwright checks across all 6 required viewports:

| Viewport ID | Dimensions | Aspect Tier | Mandatory Layout & Ergonomic Invariants |
| --- | --- | --- | --- |
| `mobile_360x800` | `360 × 800` | `mobile_3_4` | `scrollWidth <= innerWidth`; header title vs. voice/close buttons `overlapArea === 0` (Gate U3R regression guard); stage height `188px–215px` (`object-cover object-center`) |
| `mobile_390x844` | `390 × 844` | `mobile_3_4` | All interactive stage hitzones and primary action buttons `>= 56×56 CSS px`; zero horizontal overflow |
| `mobile_430x932` | `430 × 932` | `mobile_3_4` | 4 transition subbranch buttons (`breaker-sub-*`) and 5 tool tabs readable without vertical text squishing |
| `tablet_768x1024` | `768 × 1024` | `tablet_adaptive` | 3 crystal cards (`fen`) and 3 stepping-stone slots (`ze`) aligned beneath the 3D stage without clipping |
| `tablet_1024x768` | `1024 × 768` | `desktop_16_9` | Full `16:9` 3D desktop backplate + L1/L2/L3 depth layers; modal fits within `max-h-[92dvh]` |
| `desktop_1440x900` | `1440 × 900` | `desktop_16_9` | Full `16:9` 3D desktop stage; keyboard `:focus-visible` ring (`>= 3px` high-contrast outline) on all SVG/HTML interactive controls |

---

## 3. Mandatory Gate 0 Stop Condition

Per `02_ANTIGRAVITY_BATCH02_GATE0_TASK.md`:
- Because `productionArtAcceptedCount === 0` and `22` required high-resolution 3D production asset sets are `MISSING` (while `27` existing `v2-3-layer-factory` SVG files are duplicate flat geometric templates), **Batch02 full UI replacement is NOT authorized in this round**.
- `ThoughtDetectiveLabModal.tsx` and `DifficultyBreakerModal.tsx` remain **100% untouched** on `ui/visual-v2-batch02-gate0-inventory`.
- All four governance holds remain active:
  - `ART_DIRECTOR_QA_HOLD`
  - `ASSET_ARTWORK_BLOCKED`
  - `CONTENT_QA_REVIEW`
  - `PRODUCTION_RELEASE_HOLD`
