# 90_ANTIGRAVITY_RETURNED_UX_CLOSEOUT — Evidence Manifest

- **Branch**: `ui/visual-v2-batch01r-ux-closeout`
- **Baseline Commit (`ui/visual-v2-batch01r-art-remediation`)**: `1ebcab9790e498243fb11e8abffe27acdc0b9a43`
- **Canonical Code Commit SHA (`CANONICAL_CODE_SHA`)**: `c4d8542813d4de212a8efe3a6f830dbea050233f`
- **Fixed Cloudflare Pages Deployment URL**: `https://5f4ddccb.qingyu-island-v2-assetlab.pages.dev`
- **Branch Alias URL**: `https://ui-visual-v2-batch01r-ux-clo.qingyu-island-v2-assetlab.pages.dev`
- **Live `/version.json`**: `https://5f4ddccb.qingyu-island-v2-assetlab.pages.dev/version.json`

## Included Files in `90_ANTIGRAVITY_RETURNED_UX_CLOSEOUT` (`1DNY12eMLgGUHLJfe9UDl4Fx5Qoa7g-I0`)

1. **`V2_3_BATCH01R_UX_CLOSEOUT_RECEIPT.md`**: Complete engineering closeout receipt for Gates U1–U4 (`P1-01`, `P1-02`, `P1-03`), 6-viewport metrics matrix, and hold flags disclosure.
2. **`GATE_U4_UX_CLOSEOUT_REPORT.json`**: Raw programmatic Playwright 6-viewport (`360x800`, `390x844`, `430x932`, `768x1024`, `1024x1366`, `1440x900`) and E2E verification report.
3. **`ASSET_MANIFEST_UX_CLOSEOUT.json`**: Complete SHA-256, byte length, dimensions (`1376x768` desktop / `896x1200` mobile), colorMode, and alphaZeroRatio manifest for all 45 Batch01R PNG layer and cutout files (`45/45` unique SHA-256).
4. **`version.json`**: Live `/version.json` fetched from `https://5f4ddccb.qingyu-island-v2-assetlab.pages.dev/version.json` proving `commitSha: "c4d8542813d4de212a8efe3a6f830dbea050233f"` and all mandatory hold flags (`ASSET_ARTWORK_BLOCKED`, `ART_DIRECTOR_QA_HOLD`, `CONTENT_QA_REVIEW`, `PRODUCTION_RELEASE_HOLD`).
5. **`SOURCE_CODE_DIFF_1ebcab97_to_c4d85428.patch` & `GIT_DIFF_STAT.txt`**: Full git patch and diffstat from baseline `1ebcab9790e498243fb11e8abffe27acdc0b9a43` to `c4d8542813d4de212a8efe3a6f830dbea050233f`.
6. **Raw Execution Logs**:
   - `npm_ci.log`
   - `npm_run_typecheck.log`
   - `npm_test.log` (`40 passed (40)`, `405 passed (405)`)
   - `npm_run_build.log`
   - `playwright_verification.log` (`ALL GATES U1–U4 6-VIEWPORT & E2E CHECKS PASSED!`)
   - `wrangler_deploy.log`
7. **`screenshots/` (36 PNG screenshots)**:
   - 6-viewport Original (`/`) Weather Station & Calm Corner (`v2_3_batch01r_<vp>_original_*.png`, 12 files)
   - 6-viewport V2 Batch01R UX Closeout Weather Station & Calm Corner (`v2_3_batch01r_<vp>_v2_*.png`, 12 files)
   - Mobile Hotspot Alignment Overlay Screenshots at `360x800`, `390x844`, `430x932` (`v2_3_batch01r_<vp>_v2_weather_hotspot_overlay.png` & `v2_3_batch01r_<vp>_v2_calm_hotspot_overlay.png`, 6 files)
   - Deep E2E State, 4-Companion Switching, Keyboard Focus, QA Debug Drawer (`?qa=1`), `CalmCornerModal`, `prefers-reduced-motion`, and StoryCup V2.2 Regression Screenshots (13 files)
   - Visual Comparison Boards (`UX_CLOSEOUT_MOBILE_390x844_4UP.png`, `comparison_weather_station_390x844_mobile.png`, `comparison_calm_corner_390x844_mobile.png`)
