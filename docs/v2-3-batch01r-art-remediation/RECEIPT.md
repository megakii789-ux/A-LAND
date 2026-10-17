# A-LAND V2.3 Batch01R — Visual Correction & Engineering Remediation Receipt (`RECEIPT.md`)

## 1. Version & Traceability Matrix

| Item | Value |
| :--- | :--- |
| **Task Scope** | A-LAND V2.3 Batch01R (`情绪天气站` + `平静角` 视觉纠偏与工程整改) |
| **Google Drive Handoff Folder** | `https://drive.google.com/drive/folders/1--xIudKrRyXs-E9BlV7g3I3vfyV6UHDF` |
| **Input ZIP Verified** | `A_LAND_BATCH01R_VISUAL_CORRECTION_HANDOFF_20261017.zip` (`20,970,433` bytes) |
| **Input ZIP SHA-256** | `1914661b9592e0efc754ad409da905f6428f81e530966ba739754059580b4a8d` |
| **Baseline Branch & SHA** | `origin/ui/visual-v2-batch01-weather-calm` @ `d5bad9d0f452515be634a6bc89f101fd795a1b88` |
| **Isolated Remediation Branch** | `ui/visual-v2-batch01r-art-remediation` |
| **`CANONICAL_CODE_SHA` (Tested & Deployed)** | `6c6e6cf16193f4bb7fd27d8a0cb9161ecf6973c4` |
| **`ARCHIVE_HEAD_SHA` (Docs & Evidence Archive Commit)** | See `git rev-parse HEAD` on `ui/visual-v2-batch01r-art-remediation` (`git diff CANONICAL_CODE_SHA ARCHIVE_HEAD_SHA -- src/ public/ scripts/ package.json` = `0` lines) |
| **Protected Branches Untouched** | `main`, `preview`, `public-live`, `public-hold`, `ui/visual-v2-story-pilot`, `ui/visual-v2-batch01-weather-calm` |
| **Frozen Business Layers Diff** | `0` lines (`src/context/AppContext.tsx`, `src/domain/**`, `src/services/**`, `src/utils/speech.ts`, `src/data/**`, `public/audio/tts/**`) |
| **Cloudflare Pages Project** | `qingyu-island-v2-assetlab` |
| **Immutable Deployment URL** | `https://66083aa7.qingyu-island-v2-assetlab.pages.dev` |
| **Branch Alias Preview URL** | `https://ui-visual-v2-batch01r-art-re.qingyu-island-v2-assetlab.pages.dev` |
| **Weather Station V2 Review Route** | `https://66083aa7.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/weather-station-pilot` |
| **Calm Corner V2 Review Route** | `https://66083aa7.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/calm-corner-pilot` |
| **QA Inspector Mode Route (`?qa=1`)** | `https://66083aa7.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/weather-station-pilot?qa=1` |
| **Live `/version.json` URL** | `https://66083aa7.qingyu-island-v2-assetlab.pages.dev/version.json` |

---

## 2. Mandatory Gate & Hold Flags Retained

- `artworkQualityGate`: **`ASSET_ARTWORK_BLOCKED`** (Explicitly reported per Gate A: existing transparent cutouts are `128px–174px` `PREVIEW_ONLY`, and upstream studio 4K layered masters + multi-pose companion sheets are pending).
- `artDirectorQaGate`: **`ART_DIRECTOR_QA_HOLD`**
- `techPreviewGate`: **`TECH_PREVIEW_NOT_ART_APPROVED`**
- `contentQaReviewFlag`: **`CONTENT_QA_REVIEW`**
- `productionReleaseGate`: **`PRODUCTION_RELEASE_HOLD`**
- `contentAuditGate`: **`FAIL_CLOSED_PENDING_AUDIT`** (`16/16` items `PENDING_REVIEW`, `renderableInChildModeCount = 0`)

---

## 3. Summary of Remediation Completed (Gates A–D)

1. **Gate A — Visual Quality Gate & High-Detail 3D Fairytale Scene/Layer Replacement**:
   - Verified `A_LAND_BATCH01R_VISUAL_CORRECTION_HANDOFF_20261017.zip` (`1914661b9592e0efc754ad409da905f6428f81e530966ba739754059580b4a8d`).
   - Disconnected all rejected flat vector SVG layers (`public/visual-v2/layers/weather_station/**` and `public/visual-v2/layers/calm_corner/**`).
   - Wired 26 unique-hash high-detail 3D fairytale scene/layer assets (`1376×768` desktop + `896×1200` mobile, `26/26` unique SHA-256 hashes, `isSharedGeometryFixture: false`, zero baked text) and 12 native RGBA 3D cutouts from `02_EXISTING_TRANSPARENT_CUTOUTS_PREVIEW_ONLY/`.

2. **Gate B — Complete Scene Reskin, 4-Companion Switcher, Duplicate Control Removal & Media Tracker Fix**:
   - **Overall Container Reskin**: `WeatherStationModal.tsx`, `CalmSpace.tsx`, and `CalmCornerModal.tsx` now replace their legacy white/mint card shells, headers, weather cards, intensity selectors, body sensation chips, and footer bars with warm 3D wooden observatory and twilight lantern sanctuary styling when `isV2Active` is true.
   - **4 Official Companions**: Added a 4-companion switcher (`guoguo_squirrel` 果果, `beibei_otter` 贝贝, `tiantian_raccoon` 天天, `qiqi_deer` 奇奇) in both `WeatherStationSceneArtV2` and `CalmCornerSceneArtV2`, rendering native 3D RGBA cutouts in `V2_3CompanionRigActor` and synchronizing `speechNarrator`.
   - **Zero Duplicate Controls in Calm Corner**: In V2 mode, `CalmSpace.tsx` and `CalmCornerModal.tsx` delegate the breathing orb and 3-color grounding buttons (`找红色`/`找黄色`/`找蓝色` or `找绿色`) exclusively to `CalmCornerSceneArtV2`, eliminating the legacy duplicate breathing sphere and duplicate color button strip.
   - **Zero QA Debug Drawer in Child UI**: Removed `"审阅/工程调试抽屉 · QA Hold"` from normal child routes (`/visual-v2-review/weather-station-pilot` and `/visual-v2-review/calm-corner-pilot`); QA layer controls only render when `?qa=1` is explicitly present.
   - **Media Load Tracker State Reset Fix**: Fixed `useV2_3MediaLoadTracker` in `src/visual-v2/adapters/V2_3LayerStageAdapter.tsx` so switching `sceneId` (`weather_station:sunny` -> `weather_station:stormy`, `calm_corner:inhale` -> `calm_corner:paused`) immediately resets `mountTimeMs`, clears `assets`, and rejects stale callbacks from previous scenes.

3. **Gate C & D — 6-Viewport Playwright Verification, Side-by-Side Comparison Boards & Same-Source Deployment**:
   - All 40 Vitest suites (`402` tests) and all 6 Playwright viewports (`360x800`, `390x844`, `430x932`, `768x1024`, `1024x1366`, `1440x900`) passed on `CANONICAL_CODE_SHA` (`6c6e6cf16193f4bb7fd27d8a0cb9161ecf6973c4`) with `0` console errors, `0` page errors, `0` HTTP 404s, `0` horizontal overflow, and `>= 56×56px` touch/SVG targets.
   - Generated 24 raw viewport screenshots + 4 side-by-side comparison boards (`1. Approved 3D Reference` vs `2. Previous Rejected Batch01` vs `3. Current Batch01R`).
   - Deployed `CANONICAL_CODE_SHA` to Cloudflare Pages (`https://66083aa7.qingyu-island-v2-assetlab.pages.dev`) and verified live `/version.json`.
