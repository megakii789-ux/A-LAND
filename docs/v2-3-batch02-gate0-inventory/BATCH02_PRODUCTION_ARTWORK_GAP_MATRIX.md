# A-LAND V2.3 Batch02 · Gate B0R-B & B0R-C — Two-Scene Resource Dependency, 22-Set / 68-State Artwork Gap Table & Hardened Eligibility Contract

## 1. Forensic Summary of Existing Assets vs. Production 3D Visual Bar

| Metric | Count | Audit & Eligibility Finding |
| --- | ---: | --- |
| Total Set-Level Ledger Entries (`BATCH02_ARTWORK_GAP_LEDGER.json`) | `73` | `43` existing repo files + `8` upstream reference boards + `22` required production asset sets |
| Existing Repository Assets Inspected (`public/visual-v2/**`) | `43` | All `43` are `TECH_PREVIEW_ONLY` (`0` production 3D assets) |
| Upstream Reference Boards Inspected (`01_APPROVED_VISUAL_REFERENCES`) | `8` | Composite styleguide/concept boards with baked-in callout text; `0` dedicated scene plates for Detective Lab or Difficulty Breaker |
| Required Production Asset Sets (`BATCH02_CANONICAL_ASSET_SETS`) | `22` | `13` sets for `thought_detective`, `8` sets for `difficulty_breaker`, `1` set for `shared_companion_rig` |
| **Required Discrete State Deliverables (`BATCH02_CANONICAL_DISCRETE_STATES`)** | **`68`** | **`30` discrete states (`thought_detective`) + `26` discrete states (`difficulty_breaker`) + `12` discrete states (`shared_companion_rig` across 4 companions × 3 states)** |
| Waiting Production Owner | `Art Production / Art Director` | External visual production pipeline — **not** engineering placeholder synthesis |
| **`PRODUCTION_ART_ACCEPTED` (Verified Sets / Discrete States)** | **`0 / 22` sets (`0 / 68` states)** | **Triggers mandatory `BATCH02_GATE0R_CONTRACT_PASS / ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED` stop gate** |
| Duplicate Byte-for-Byte SVG Files in `v2-3-layer-factory` | `27` | All 4 detective modes and all 5 breaker stages reuse identical flat SVG templates |

---

## 2. Hardened Fail-Closed Production Art Eligibility Contract (`evaluateBatch02ProductionArtEligibility`)

To prevent any false approval (`canAuthorizeBatch02UiReplacement === true` on incomplete or fake inputs), `evaluateBatch02ProductionArtEligibility` in `src/visual-v2/batch02-gate0/batch02Gate0Contracts.ts` enforces:

1. **Canonical Set & Discrete-State Completeness (`22` Sets / `68` Discrete States / `4` Companions)**:
   - Never trusts caller-supplied `status === 'PRODUCTION_ART_ACCEPTED'` alone.
   - Verifies that all **22 canonical asset sets** (`B02-SET-01`..`B02-SET-22`) and all **68 canonical discrete state variants** (`B02-STATE-001`..`B02-STATE-068`) across `thought_detective` (`30`), `difficulty_breaker` (`26`), and `shared_companion_rig` (`12` across `guoguo_squirrel`, `beibei_otter`, `tiantian_raccoon`, `qiqi_deer`) are satisfied.
2. **Physical, Format, Dimension, Alpha & Cryptographic Approval Verification**:
   - Every accepted deliverable must have:
     - Concrete `filePath` with **zero unresolved `{companionId}` or `*` wildcards**
     - `existsInRepo === true` (dynamically verified via filesystem inspection in `scripts/verify_v2_3_batch02_gate0_inventory.mjs`)
     - `format === 'png' || format === 'webp'` (rejects `'svg'` and `'missing'`)
     - Positive integer `byteSize > 0`
     - Valid 64-character hex `sha256` (`/^[a-f0-9]{64}$/i`)
     - `pixelDimensions.width >= minWidth` and `pixelDimensions.height >= minHeight`
     - `hasAlphaTransparency === true` whenever `requireAlpha === true`
     - Valid `artDirectorApproval` (`{ approvedBy, approvalId, approvedSha256, approvedAt }` with `approvedSha256 === sha256`)
3. **Duplicate Hash / Shared Asset Ref Policy**:
   - Any duplicate `sha256` or `sharesIdenticalBytesWith` across states is rejected unless accompanied by an explicit `sharedAssetRef` (`{ primaryAssetId, sharedWithAssetIds, approvalId, reason }`) matching `artDirectorApproval.approvalId`.
4. **Zero Contradictory Hold Flags**:
   - `holdFlags.ARTWORK_GAP`, `holdFlags.ASSET_ARTWORK_BLOCKED`, and `holdFlags.BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED` are dynamically derived from `!canAuthorizeBatch02UiReplacement`.
   - Historical `TECH_PREVIEW_ONLY` / `reference_board` audit rows can remain in the ledger for provenance without causing a permanent deadlock once all 68 canonical discrete states are genuinely delivered and signed off; any `UNVERIFIED` row or duplicate `assetId` immediately fails closed.

---

## 3. Forensic Proof of Duplicate Technical SVG Templates in `public/visual-v2/v2-3-layer-factory/`

### Cluster A — `detective/{tools,three_boxes,lenses,scales}/workshop.svg` (4× Identical)
- **Byte Size**: `1,786` bytes | **SHA-256**: `f78cd87c24986274903f9e73f7d8671c5a2c0cf825b0a6298804e4f362052124`
- **Deficiency**: Flat 2D geometric cabin (`<rect>` + `<circle>` trees); identical across all 4 directories; missing modes `circles` and `fourSteps`.

### Cluster B — `detective/*/tool_objects.svg` & `difficulty_breaker/*/step_stones.svg` (9× Identical Geometry)
- **Byte Size**: `594` bytes
- **SHA-256 (`detective/*/tool_objects.svg`, 4 files)**: `dcbbb7c84af1d7b9b5fa6ef15035dc43e7cb24e070894f621e0f86b249f05e1a`
- **SHA-256 (`difficulty_breaker/*/step_stones.svg`, 5 files)**: `fac24115bfecd0f08b901189167806e82b621c51dc9b0d897478ffbd2f107474`
- **Deficiency**: All 9 files draw the exact same 3 flat rectangles (`<rect x="345" y="505" width="130" height="90" rx="12" fill="#e5ba68"/>...`).

### Cluster C — `difficulty_breaker/{select,divide,connect,choose,complete}/workbench.svg` (5× Identical)
- **Byte Size**: `1,380` bytes | **SHA-256**: `4513badc2273985b74a22c91b2530574a4f384871f23c1b296420d3604480851`
- **Deficiency**: All 5 stages (`pick`, `fen`, `tong`, `ze`, `complete`) share the exact same 1,380-byte flat SVG table and dashed line.

---

## 4. Canonical 22 Production Asset Sets & Expansion into 68 Discrete State Deliverables (`BATCH02_DISCRETE_ASSET_PRODUCTION_MANIFEST.json`)

Every set below is assigned to **`Art Production / Art Director`** (Approval Authority: **`Art Director`**) and expands into concrete per-state deliverables in `BATCH02_DISCRETE_ASSET_PRODUCTION_MANIFEST.json` and `BATCH02_DISCRETE_ASSET_PRODUCTION_ORDER.csv`:

| Set Order ID | Canonical Set ID | Scene | Target Group Path | Min Dimensions | Alpha | Discrete States (`68` Total) | Discrete State Variants | Status |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| `B02-SET-01` | `prod_detective_master_plate_desktop_16x9` | `thought_detective` | `public/visual-v2/batch02-art/scenes/detective_workshop_desktop.webp` | `2560×1440` | No | `1` | `default` | `MISSING` |
| `B02-SET-02` | `prod_detective_master_plate_mobile_3x4` | `thought_detective` | `public/visual-v2/batch02-art/scenes/detective_workshop_mobile.webp` | `1200×1600` | No | `1` | `default` | `MISSING` |
| `B02-SET-03` | `prod_detective_layer_distant_window_sky` | `thought_detective` | `public/visual-v2/batch02-art/layers/detective_l1_distant_sky_rgba.webp` | `2560×1440` | Yes | `1` | `default` | `MISSING` |
| `B02-SET-04` | `prod_detective_layer_mid_workbench_bookshelves` | `thought_detective` | `public/visual-v2/batch02-art/layers/detective_l2_mid_workbench_rgba.webp` | `2560×1440` | Yes | `1` | `default` | `MISSING` |
| `B02-SET-05` | `prod_detective_layer_fore_arch_lanterns` | `thought_detective` | `public/visual-v2/batch02-art/layers/detective_l3_fore_arch_rgba.webp` | `2560×1440` | Yes | `1` | `default` | `MISSING` |
| `B02-SET-06` | `prod_detective_prop_tool_flag_states` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_tool_flag_rgba.webp` | `512×512` | Yes | `2` | `flag_attached`, `flag_removed` | `MISSING` |
| `B02-SET-07` | `prod_detective_prop_tool_three_lenses_states` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_tool_three_lenses_rgba.webp` | `512×512` | Yes | `3` | `my_lens`, `his_lens`, `sky_lens` | `MISSING` |
| `B02-SET-08` | `prod_detective_prop_tool_two_sided_coin_states` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_tool_coin_rgba.webp` | `512×512` | Yes | `2` | `front`, `back` | `MISSING` |
| `B02-SET-09` | `prod_detective_prop_tool_balance_scale_states` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_tool_balance_scale_rgba.webp` | `512×512` | Yes | `2` | `idle`, `interact` | `MISSING` |
| `B02-SET-10` | `prod_detective_prop_tool_safety_fence_states` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_tool_safety_fence_rgba.webp` | `512×512` | Yes | `2` | `idle`, `safe_boundary_highlight` | `MISSING` |
| `B02-SET-11` | `prod_detective_prop_three_boxes_set` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_three_boxes_set_rgba.webp` | `600×400` | Yes | `6` | `visible_empty`, `heart_empty`, `guess_empty`, `visible_placed`, `heart_placed`, `guess_placed` | `MISSING` |
| `B02-SET-12` | `prod_detective_prop_control_circles_rings` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_control_circles_rgba.webp` | `800×600` | Yes | `4` | `adult`, `mine`, `together`, `active_selection` | `MISSING` |
| `B02-SET-13` | `prod_detective_prop_four_steps_staircase` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_four_steps_ladder_rgba.webp` | `800×500` | Yes | `4` | `step_1`, `step_2`, `step_3`, `step_4` | `MISSING` |
| `B02-SET-14` | `prod_breaker_master_plate_desktop_16x9` | `difficulty_breaker` | `public/visual-v2/batch02-art/scenes/breaker_workbench_creek_desktop.webp` | `2560×1440` | No | `1` | `default` | `MISSING` |
| `B02-SET-15` | `prod_breaker_master_plate_mobile_3x4` | `difficulty_breaker` | `public/visual-v2/batch02-art/scenes/breaker_workbench_creek_mobile.webp` | `1200×1600` | No | `1` | `default` | `MISSING` |
| `B02-SET-16` | `prod_breaker_layer_creek_and_workbench` | `difficulty_breaker` | `public/visual-v2/batch02-art/layers/breaker_l2_workbench_stream_rgba.webp` | `2560×1440` | Yes | `1` | `default` | `MISSING` |
| `B02-SET-17` | `prod_breaker_prop_preset_boulders_3x` | `difficulty_breaker` | `public/visual-v2/batch02-art/props/breaker_preset_boulders_rgba.webp` | `512×512` | Yes | `7` | `two_homes`, `blocks_broken`, `friend_ask`, `sub_dual_attachment`, `sub_loyalty_conflict`, `sub_specific_concern`, `sub_ordinary_transition` | `MISSING` |
| `B02-SET-18` | `prod_breaker_prop_fen_crystal_stones_3x` | `difficulty_breaker` | `public/visual-v2/batch02-art/props/breaker_fen_crystals_rgba.webp` | `900×450` | Yes | `6` | `fact_unrevealed`, `fact_revealed`, `feeling_unrevealed`, `feeling_revealed`, `guess_unrevealed`, `guess_revealed` | `MISSING` |
| `B02-SET-19` | `prod_breaker_prop_tong_dual_lens_turntable` | `difficulty_breaker` | `public/visual-v2/batch02-art/props/breaker_tong_dual_lens_rgba.webp` | `600×600` | Yes | `2` | `front`, `flipped` | `MISSING` |
| `B02-SET-20` | `prod_breaker_prop_ze_river_stepping_stones` | `difficulty_breaker` | `public/visual-v2/batch02-art/props/breaker_ze_stepping_stones_rgba.webp` | `900×450` | Yes | `6` | `slot_0_empty`, `slot_1_empty`, `slot_2_empty`, `slot_placed`, `safety_action`, `pause_rest` | `MISSING` |
| `B02-SET-21` | `prod_breaker_prop_complete_celebration_bridge` | `difficulty_breaker` | `public/visual-v2/batch02-art/props/breaker_complete_path_rgba.webp` | `1200×675` | Yes | `2` | `completed_path`, `celebration_idle` | `MISSING` |
| `B02-SET-22` | `prod_shared_4companions_3d_rig_masters` | `shared_companion_rig` | `public/visual-v2/batch02-art/characters/{companionId}/rig_master_rgba.webp` (resolved to 12 concrete files across `guoguo_squirrel`, `beibei_otter`, `tiantian_raccoon`, `qiqi_deer`) | `1024×1024` | Yes | `12` | `guoguo_idle`, `guoguo_listening`, `guoguo_speaking`, `beibei_idle`, `beibei_listening`, `beibei_speaking`, `tiantian_idle`, `tiantian_listening`, `tiantian_speaking`, `qiqi_idle`, `qiqi_listening`, `qiqi_speaking` | `MISSING` |
| **Total** | **`22` Canonical Asset Sets** | — | — | — | — | **`68` Discrete States** | `30` Detective + `26` Breaker + `12` Companion Rig | **`0` Approved / `68` Missing** |
