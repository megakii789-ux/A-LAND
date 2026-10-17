# A-LAND V2.3 Batch02 · Gate B0R-C — Proposed V2 Integration Plan & Validation Specification

## 1. Non-Destructive V2 Adapter Architecture

To guarantee zero regressions to frozen business logic (`ThoughtDetectiveLabModal.tsx`, `DifficultyBreakerModal.tsx`, `src/domain/**`, `src/context/**`, `src/utils/speech.ts`) and frozen Batch01R components (`WeatherStationModal.tsx`, `CalmSpace.tsx`, `CalmCornerModal.tsx`), Batch02 visual integration will follow the exact adapter pattern proven in Batch01R:

1. **Executable Contracts (`src/visual-v2/batch02-gate0/batch02Gate0Contracts.ts`)**:
   - Defines `ThoughtDetectiveSceneArtV2Props` and `DifficultyBreakerSceneArtV2Props` with 1:1 state and callback parity against the live business components (`boxItems` & `circleItems` using `{ id, text, target, placed }`, `onPlaceBox` & `onPlaceCircle`, `currentStep` initial value `1`).
   - Defines `evaluateBatch02ProductionArtEligibility(entries)` which enforces a **fail-closed** preflight check against `BATCH02_CANONICAL_ASSET_SETS` (`22` sets) and `BATCH02_CANONICAL_DISCRETE_STATES` (`68` discrete states across `thought_detective`, `difficulty_breaker`, and all `4` companions in `shared_companion_rig`): until all required high-resolution 3D assets exist on disk, meet minimum pixel dimensions and alpha requirements, carry valid SHA-256 digests, and include cryptographic `artDirectorApproval` sign-off, `canAuthorizeBatch02UiReplacement` evaluates to `false` and returns `ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED`.
2. **Reuse of `V2_3LayerStageAdapter.tsx` Infrastructure**:
   - **Media Load Tracker (`useV2_3MediaLoadTracker`)**: Scene-scoped and asset-set-scoped `loadedCount` / `fallbackCount` / timing metrics (`window.__ALAND_V2_3_MEDIA_METRICS__`), resetting synchronously whenever `sceneId` or active tool/stage asset signature changes.
   - **Aspect-Ratio-Preserving Stage Rendering (`BATCH02_STAGE_COMPOSITION_RULE`)**: Responsive `16:9` desktop (`>= 640px`) and `3:4` mobile (`< 640px`) stage composition. Strictly **prohibits** destructive `188–215px` `object-cover` vertical cropping of `3:4` mobile scene plates (preserving the Gate U2 composition standard).
   - **Voice-Driven Companion Rig (`V2_3CompanionRigActor`)**: Subscribes via `speechNarrator.subscribe(() => { ... speechNarrator.getSpeaking(), speechNarrator.getKaraokeState(), speechNarrator.getNarrationSession() })` and uses `speechNarrator.switchCompanion(nextCompanionId)` + `updatePersonalization({ companionId: nextCompanionId })` to drive companion mouth/expression states while respecting `prefers-reduced-motion`.
   - **Explicit QA Drawer (`V2_3ReviewerDebugDrawer`)**: Hidden from normal child reading flow; rendered only when `?qa=1` is present in the URL.

---

## 2. Frozen 6-Viewport Layout, Touch Target & Collision Prevention Contract (`BATCH02_REQUIRED_VIEWPORTS`)

When Batch02 production 3D assets are delivered by `Art Production / Art Director` and UI replacement is authorized in a future gate, the stage components must pass automated Playwright checks across all **6 frozen viewports** (plus optional 7th landscape tablet viewport `1024×768`):

| Viewport ID | Dimensions | Orientation | Aspect Tier | Mandatory Layout & Ergonomic Invariants |
| --- | --- | --- | --- | --- |
| `mobile_360x800` | `360 × 800` | Portrait | `mobile_3_4` | `scrollWidth <= innerWidth`; header title vs. voice/close buttons `overlapArea === 0` (Gate U3R regression guard); dedicated `3:4` mobile stage container (`aspect-[3/4]` or safe-zone framing, **never** cropped into a shallow `188–215px` `object-cover` strip) |
| `mobile_390x844` | `390 × 844` | Portrait | `mobile_3_4` | All interactive stage hitzones and primary action buttons `>= 56×56 CSS px`; zero horizontal overflow; aspect-ratio-preserving `3:4` mobile stage |
| `mobile_430x932` | `430 × 932` | Portrait | `mobile_3_4` | 4 transition subbranch buttons (`breaker-sub-*`) and 5 tool tabs readable without vertical text squishing; aspect-ratio-preserving `3:4` mobile stage |
| `tablet_768x1024` | `768 × 1024` | Portrait | `tablet_adaptive` | 3 crystal cards (`fen`) and 3 stepping-stone slots (`ze`) aligned beneath the 3D stage without clipping |
| `tablet_1024x1366` | `1024 × 1366` | Portrait | `tablet_adaptive` | **Mandatory frozen 5th viewport**: full tablet portrait layout with zero horizontal overflow, `>= 56×56 CSS px` touch targets, and unobstructed stage & controls |
| `desktop_1440x900` | `1440 × 900` | Landscape | `desktop_16_9` | Full `16:9` 3D desktop backplate + L1/L2/L3 depth layers; keyboard `:focus-visible` ring (`>= 3px` high-contrast outline) on all SVG/HTML interactive controls |
| *(Optional 7th)* `tablet_1024x768` | `1024 × 768` | Landscape | `desktop_16_9` | Optional additional landscape tablet verification (`BATCH02_OPTIONAL_ADDITIONAL_VIEWPORTS`); never substitutes for `1024 × 1366` |

---

## 3. Mandatory Gate B0R Stop Condition

Per `02_ANTIGRAVITY_GATE_B0R_TASK.md` and `09_B0R_SCOPE_CLARIFICATION_CN.md`:
- Because `productionArtAcceptedCount === 0` (`0/22` canonical asset sets and `0/68` discrete state variants approved, while `27` existing `v2-3-layer-factory` SVG files are duplicate flat geometric templates), **Batch02 full UI replacement is NOT authorized in this round**.
- `ThoughtDetectiveLabModal.tsx` and `DifficultyBreakerModal.tsx` remain **100% untouched** on `ui/visual-v2-batch02-gate0r-contract`.
- Execution concludes at **`BATCH02_GATE0R_CONTRACT_PASS / ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED`**, retaining:
  - `ART_DIRECTOR_QA_HOLD = true`
  - `ASSET_ARTWORK_BLOCKED = true`
  - `CONTENT_QA_REVIEW = true`
  - `PRODUCTION_RELEASE_HOLD = true`
  - `ARTWORK_GAP = true`
  - `BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED = true`
