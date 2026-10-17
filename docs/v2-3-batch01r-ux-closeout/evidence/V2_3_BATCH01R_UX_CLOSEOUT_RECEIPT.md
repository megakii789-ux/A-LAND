# A-LAND V2.3 Batch01R — Minimal UX Closeout Receipt (Gates U1–U4)

- **Audit & Task Folder**: `https://drive.google.com/drive/folders/1QOHqlQhOPuNKef2BbunVDkYVFgCGdcQQ`
- **Returned Evidence Folder (`90_ANTIGRAVITY_RETURNED_UX_CLOSEOUT`)**: `https://drive.google.com/drive/folders/1DNY12eMLgGUHLJfe9UDl4Fx5Qoa7g-I0`
- **Baseline Branch & Commit**: `ui/visual-v2-batch01r-art-remediation` @ `1ebcab9790e498243fb11e8abffe27acdc0b9a43` (source origin `6c6e6cf16193f4bb7fd27d8a0cb9161ecf6973c4`)
- **Isolated Remediation Branch**: `ui/visual-v2-batch01r-ux-closeout`
- **Canonical Code Commit SHA (`CANONICAL_CODE_SHA`)**: `c4d8542813d4de212a8efe3a6f830dbea050233f`
- **Cloudflare Pages Project**: `qingyu-island-v2-assetlab`
- **Immutable Deployment URL**: `https://5f4ddccb.qingyu-island-v2-assetlab.pages.dev`
- **Branch Alias URL**: `https://ui-visual-v2-batch01r-ux-clo.qingyu-island-v2-assetlab.pages.dev`
- **Live `/version.json` URL**: `https://5f4ddccb.qingyu-island-v2-assetlab.pages.dev/version.json`
- **V2 Weather Station Review Route**: `https://5f4ddccb.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/weather-station-pilot`
- **V2 Calm Corner (`CalmSpace`) Review Route**: `https://5f4ddccb.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/calm-corner-pilot`
- **V2 Calm Corner (`CalmCornerModal`) Review Route**: `https://5f4ddccb.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/calm-corner-modal-pilot`
- **V2.2 StoryGrove Cup Pilot Regression Route**: `https://5f4ddccb.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/story-cup-pilot`

---

## 1. Mandatory Hold Flags & Scope Guardrails Preserved

| Flag / Invariant | Value / Status |
| :--- | :--- |
| `ASSET_ARTWORK_BLOCKED` | `true` (`artworkQualityGate: "ASSET_ARTWORK_BLOCKED"`) |
| `ART_DIRECTOR_QA_HOLD` | `true` (`artDirectorQaGate: "ART_DIRECTOR_QA_HOLD"`) |
| `TECH_PREVIEW_NOT_ART_APPROVED` | `true` (`techPreviewGate: "TECH_PREVIEW_NOT_ART_APPROVED"`) |
| `CONTENT_QA_REVIEW` | `true` (`contentQaReviewFlag: "CONTENT_QA_REVIEW"`, 16/16 `PENDING_REVIEW`, `renderableInChildModeCount: 0`) |
| `PRODUCTION_RELEASE_HOLD` | `true` (`productionReleaseGate: "PRODUCTION_RELEASE_HOLD"`) |
| `productionQualityApprovedCount` | `0` |
| Protected Branches (`main`, `preview`, `public-live`, `public-hold`, `ui/visual-v2-story-pilot`, `ui/visual-v2-batch01-weather-calm`, `ui/visual-v2-batch01r-art-remediation`) | **Untouched** |
| Protected Directories (`src/context`, `src/domain`, `src/services`, `src/data`, `src/utils/speech.ts`, `public/audio/tts`) | **`0 files changed` (`git diff --stat` = empty)** |

---

## 2. P1 Remediation Summary (Gates U1–U4)

### Gate U1 — Weather Station Single Primary Weather Selector (`P1-01` Closed)
- **Root Cause**: In V2 mode, `WeatherStationModal.tsx` rendered both the 6 SVG weather hotspots inside `WeatherStationSceneArtV2.tsx` AND the legacy `WEATHERS.map` 6-card selector grid below the stage, creating two competing sets of primary weather selection controls.
- **Remediation**:
  - Designated the 6 SVG weather hotspots (`晴天` / `阴天` / `雨天` / `雷雨` / `雾天` / `我不想选`, `data-testid="v2-weather-svg-token-*"`) in `src/visual-v2/batch01/WeatherStationSceneArtV2.tsx` as the **single primary weather selector** in V2 mode, displaying the full weather title, child-friendly subtitle (`暖洋洋` / `软绵绵` / `湿漉漉` / `轰隆隆` / `白茫茫` / `先休息`), and active checkmark badge (`✓`).
  - Removed the duplicate `WEATHERS.map` 6-card primary selector grid in `src/components/ChildIsland/WeatherStationModal.tsx` when `isV2Active` is true (`legacyDuplicatePrimaryCardCount === 0`), while preserving it on the original `/` route when `!isV2Active`.
  - Preserved all required cognitive & accessibility capabilities: dynamic weather description sentence (`data-testid="v2-weather-selected-phrase-bar"` / `v2-weather-dynamic-phrase`) + read-aloud button (`v2-weather-selected-phrase-read-aloud`, `56×56px`), dual-weather toggle + secondary weather selector, qualitative intensity selector (`微弱` / `中等` / `强烈`), body sensations, opt-out confirmation & clean exit, save (`saveTodayWeather`), heavy-weather holding + adult support, and return/re-open.
  - Added automatic `modalScrollRef.current.scrollTop = 0` reset when transitioning between steps (`camera` -> `select` -> `heavyHolding`) so the child immediately sees the top header and stage.

### Gate U2 — Mobile Stage & Asset Geometry Alignment (`P1-02` Closed)
- **Root Cause**: Mobile assets were `896×1200` (`aspect = 0.7467`), whereas the mobile stage container used `aspect-[420/340]` (`aspect = 1.2353`) with `border-4`, causing `object-cover` to crop ~39.55% of the source image height and misalign the Calm Corner breathing orb hotspot relative to the painted moon/orb.
- **Remediation**:
  - Converted the mobile stage (`<= 640px`) in both `WeatherStationSceneArtV2.tsx` and `CalmCornerSceneArtV2.tsx` to a **true portrait stage (`aspect-[896/1200]`, `data-stage-layout="mobile-portrait-896x1200"`, `viewBox="0 0 448 600"`)** and the desktop stage (`> 640px`) to **`aspect-[1376/768]` (`data-stage-layout="desktop-1376x768"`, `viewBox="0 0 1376 768"`)** using `ring-4` framing so the inner content box has zero border-box aspect distortion.
  - Framed all 26 desktop scene layer records (`backplate`/`room`, `weather_actor`/`breathing_visual`, `front_effect`) at `1376×768` (`26/26` unique SHA-256) and all 26 mobile scene layer records at `896×1200` (`26/26` unique SHA-256), achieving **`visibleHeightRatio = 1.0000` (`100.00%`) and `visibleWidthRatio = 1.0000` (`100.00%`) (`0.00%` crop loss)** across all 6 viewports without `object-fill` stretching.
  - Recalculated all SVG hotspots (`v2-weather-svg-token-*` at `98×72px` on `390x844`; `v2-calm-svg-breathe-orb` coaxially centered at `(224, 220)` mobile / `(688, 320)` desktop with `0px` horizontal offset, `124×124px` on `390x844`; `v2-calm-svg-color-*` at `96×68px` on `390x844`) so every touch target exceeds `>= 56×56 CSS px` and capture-verified via hotspot overlay screenshots at `360x800`, `390x844`, and `430x932`.

### Gate U3 — Narrow Mobile Header Layout & Typography (`P1-03` Closed)
- **Root Cause**: On `360px` / `390px` screens, single-row header flex layouts with two `56×56px` action buttons compressed the title column, causing `"情绪天气站"` to truncate with `...` and `"绿草冷静空间"` to wrap awkwardly as `"绿草冷静空 / 间"`.
- **Remediation**:
  - Redesigned the V2 headers in `WeatherStationModal.tsx`, `CalmSpace.tsx`, and `CalmCornerModal.tsx` into a **two-row responsive header layout**:
    - **Row 1**: Landmark 3D cutout icon + full unwrapped single-line title (`"情绪天气站"` / `"绿草冷静空间"` / `"绿草平静角"`, `whitespace-nowrap`, zero `truncate`) + `56×56px` audio and close buttons (`shrink-0`).
    - **Row 2**: Safety badge (`"海湾木屋观景台"` / `"非竞争 · 随时可离开"`) + full readable subtitle sentence.
  - Converted the 4-companion switcher (`果果` / `贝贝` / `天天` / `奇奇`) into a 4-column grid (`grid grid-cols-4 gap-1.5 flex-1`) so all 4 companions are 100% visible side-by-side without horizontal clipping at `360px` and `390px`.

### Gate U4 — Same-Source Verification, Deployment & Evidence Return
- Executed `npm ci`, `npm run typecheck`, `npm test` (`40/40` test files, `405/405` unit tests passed), `npm run build`, and Playwright 6-viewport verification (`scripts/verify_v2_3_batch01r_art_remediation.mjs`) on the single `CANONICAL_CODE_SHA = c4d8542813d4de212a8efe3a6f830dbea050233f`.
- Deployed `dist` to Cloudflare Pages (`https://5f4ddccb.qingyu-island-v2-assetlab.pages.dev`) and verified live `/version.json` (`commitSha === "c4d8542813d4de212a8efe3a6f830dbea050233f"`).

---

## 3. Six-Viewport Quantitative Verification Matrix (`GATE_U4_UX_CLOSEOUT_REPORT.json`)

| Viewport | `scrollWidth <= innerWidth` | Weather Stage Layout | Weather Layer Crop Loss | Weather Single Primary Selector | Weather Title (`情绪天气站`) | Calm Stage Layout | Calm Layer Crop Loss | Calm Orb Center Delta | Calm Title (`绿草冷静空间`) | All SVG Hotspots `>=56px` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `360x800` | `360 <= 360` (`PASS`) | `mobile-portrait-896x1200` (`304×407.1`) | `0.00%` (`vhr=1, vwr=1`) | `PASS` (`6` SVG, `0` legacy) | `90/90px`, `1` line (`PASS`) | `mobile-portrait-896x1200` (`304×407.1`) | `0.00%` (`vhr=1, vwr=1`) | `0px` (`PASS`) | `108/108px`, `1` line (`PASS`) | `PASS` (`89.2×65.6px` / `87.1×62.1px`) |
| `390x844` | `390 <= 390` (`PASS`) | `mobile-portrait-896x1200` (`334×447.3`) | `0.00%` (`vhr=1, vwr=1`) | `PASS` (`6` SVG, `0` legacy) | `90/90px`, `1` line (`PASS`) | `mobile-portrait-896x1200` (`334×447.3`) | `0.00%` (`vhr=1, vwr=1`) | `0px` (`PASS`) | `108/108px`, `1` line (`PASS`) | `PASS` (`98×72px` / `95.7×68.3px`) |
| `430x932` | `430 <= 430` (`PASS`) | `mobile-portrait-896x1200` (`374×500.9`) | `0.00%` (`vhr=1, vwr=1`) | `PASS` (`6` SVG, `0` legacy) | `90/90px`, `1` line (`PASS`) | `mobile-portrait-896x1200` (`374×500.9`) | `0.00%` (`vhr=1, vwr=1`) | `0px` (`PASS`) | `108/108px`, `1` line (`PASS`) | `PASS` (`109.7×80.6px` / `107.2×76.4px`) |
| `768x1024` | `768 <= 768` (`PASS`) | `desktop-1376x768` (`672×375.1`) | `0.00%` (`vhr=1, vwr=1`) | `PASS` (`6` SVG, `0` legacy) | `120/120px`, `1` line (`PASS`) | `desktop-1376x768` (`672×375.1`) | `0.00%` (`vhr=1, vwr=1`) | `0px` (`PASS`) | `144/144px`, `1` line (`PASS`) | `PASS` (`67.9×83px` / `113.3×72.3px`) |
| `1024x1366` | `1024 <= 1024` (`PASS`) | `desktop-1376x768` (`712×397.4`) | `0.00%` (`vhr=1, vwr=1`) | `PASS` (`6` SVG, `0` legacy) | `120/120px`, `1` line (`PASS`) | `desktop-1376x768` (`712×397.4`) | `0.00%` (`vhr=1, vwr=1`) | `0px` (`PASS`) | `144/144px`, `1` line (`PASS`) | `PASS` (`71.9×87.9px` / `120×76.6px`) |
| `1440x900` | `1440 <= 1440` (`PASS`) | `desktop-1376x768` (`712×397.4`) | `0.00%` (`vhr=1, vwr=1`) | `PASS` (`6` SVG, `0` legacy) | `120/120px`, `1` line (`PASS`) | `desktop-1376x768` (`712×397.4`) | `0.00%` (`vhr=1, vwr=1`) | `0px` (`PASS`) | `144/144px`, `1` line (`PASS`) | `PASS` (`71.9×87.9px` / `120×76.6px`) |

---

## 4. Open Items & Remaining Hold Disclosures

1. **`ASSET_ARTWORK_BLOCKED` & `ART_DIRECTOR_QA_HOLD` Retained**:
   - While all 26 desktop (`1376×768`) and 26 mobile (`896×1200`) scene layers have unique SHA-256 hashes and zero stage crop loss, final production art master sign-off from the Art Director remains pending (`productionQualityApprovedCount: 0`).
2. **Awaiting Independent ChatGPT Audit Before Batch 02**:
   - Per project governance, Batch 02 remains strictly locked (`LOCKED_UNTIL_BATCH01_INDEPENDENT_AUDIT_PASS`) until ChatGPT completes independent review of `90_ANTIGRAVITY_RETURNED_UX_CLOSEOUT`.
