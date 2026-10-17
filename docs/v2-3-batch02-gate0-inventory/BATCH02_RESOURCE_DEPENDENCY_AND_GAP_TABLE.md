# A-LAND V2.3 Batch02 · Gate B0-B — Two-Scene Resource Dependency & Artwork Gap Table

## 1. Forensic Summary of Existing Assets vs. Production 3D Visual Bar

| Metric | Count | Audit Finding |
| --- | ---: | --- |
| Total Inspected & Required Batch02 Asset Entries | `73` | Full machine-readable ledger in `BATCH02_ARTWORK_GAP_LEDGER.json` |
| Existing Repository Assets Inspected (`public/visual-v2/**`) | `43` | All `43` are `TECH_PREVIEW_ONLY` (`0` production 3D assets) |
| Upstream Reference Boards Inspected (`01_APPROVED_VISUAL_REFERENCES`) | `8` | Composite styleguide/concept boards with baked-in callout text; `0` dedicated scene plates for Detective Lab or Difficulty Breaker |
| Missing Production 3D Assets Required for Batch02 | `22` | High-res `16:9` desktop & `3:4` mobile plates, L1/L2/L3 depth layers, 3D tool/box/circle/ladder/crystal/stone props, and 4-companion 3D rigs |
| **`PRODUCTION_ART_ACCEPTED`** | **`0`** | **Triggers mandatory `ARTWORK_GAP / BATCH02_UI_REPLACEMENT_NOT_AUTHORIZED` stop gate** |
| Duplicate Byte-for-Byte SVG Files in `v2-3-layer-factory` | `27` | All 4 detective modes and all 5 breaker stages reuse identical flat SVG templates |

---

## 2. Forensic Proof of Duplicate Technical SVG Templates in `public/visual-v2/v2-3-layer-factory/`

### Cluster A — `detective/{tools,three_boxes,lenses,scales}/workshop.svg` (4× Identical)
- **Byte Size**: `1,786` bytes
- **SHA-256**: `f78cd87c24986274903f9e73f7d8671c5a2c0cf825b0a6298804e4f362052124`
- **Files**:
  - `public/visual-v2/v2-3-layer-factory/assets/detective/tools/workshop.svg`
  - `public/visual-v2/v2-3-layer-factory/assets/detective/three_boxes/workshop.svg`
  - `public/visual-v2/v2-3-layer-factory/assets/detective/lenses/workshop.svg`
  - `public/visual-v2/v2-3-layer-factory/assets/detective/scales/workshop.svg`
- **Deficiency**: Flat 2D geometric cabin (`<rect>` + `<circle>` trees); identical across all 4 directories; missing modes `circles` and `fourSteps`.

### Cluster B — `detective/*/tool_objects.svg` & `difficulty_breaker/*/step_stones.svg` (9× Identical Geometry)
- **Byte Size**: `594` bytes
- **SHA-256 (`detective/*/tool_objects.svg`, 4 files)**: `dcbbb7c84af1d7b9b5fa6ef15035dc43e7cb24e070894f621e0f86b249f05e1a`
- **SHA-256 (`difficulty_breaker/*/step_stones.svg`, 5 files)**: `fac24115bfecd0f08b901189167806e82b621c51dc9b0d897478ffbd2f107474`
- **Deficiency**: All 9 files draw the exact same 3 flat rectangles (`<rect x="345" y="505" width="130" height="90" rx="12" fill="#e5ba68"/><rect x="524" .../><rect x="702" .../>`).

### Cluster C — `difficulty_breaker/{select,divide,connect,choose,complete}/workbench.svg` (5× Identical)
- **Byte Size**: `1,380` bytes
- **SHA-256**: `4513badc2273985b74a22c91b2530574a4f384871f23c1b296420d3604480851`
- **Deficiency**: All 5 stages (`pick`, `fen`, `tong`, `ze`, `complete`) share the exact same 1,380-byte flat SVG table and dashed line.

---

## 3. Existing Raster Cutouts & Legacy Backplates (`TECH_PREVIEW_ONLY`)

| Asset ID | File Path | Dimensions | Alpha | Bytes | SHA-256 (Prefix) | Provenance & Limitation | Status |
| --- | --- | --- | --- | ---: | --- | --- | --- |
| `legacy_svg_backplate_tools_room` | `public/visual-v2/assets/scenes/tools_room_scene_backplate.svg` | `1600×900` (SVG) | No | 4,535 | `f1c8f5810108882e` | Procedural 2D bookshelf/window template (same geometry as `difficulty_breaker_scene_backplate.svg`) | `TECH_PREVIEW_ONLY` |
| `legacy_svg_backplate_difficulty_breaker` | `public/visual-v2/assets/scenes/difficulty_breaker_scene_backplate.svg` | `1600×900` (SVG) | No | 4,544 | `c385d03cca452afa` | Procedural 2D bookshelf/window template (same geometry as `tools_room_scene_backplate.svg`) | `TECH_PREVIEW_ONLY` |
| `cutout_landmark_tools_room_native_png` | `public/visual-v2/assets/landmarks/tools_room/idle_native.png` | `180×144` | Yes | 55,139 | `6b92f858c0639b10` | `cv2.grabCut` from `V14_character_landmark_asset_board.png` `[220,672,406,828]` | `TECH_PREVIEW_ONLY` |
| `cutout_landmark_difficulty_breaker_native_png` | `public/visual-v2/assets/landmarks/difficulty_breaker/idle_native.png` | `191×151` | Yes | 54,907 | `f21845ffd2d1ee8b` | `cv2.grabCut` from `V14_character_landmark_asset_board.png` `[1418,670,1635,829]` | `TECH_PREVIEW_ONLY` |
| `cutout_prop_tool_binoculars_png` | `public/visual-v2/assets/props/tools/binoculars/native.png` | `68×64` | Yes | 10,515 | `676ff8240590a4bd` | `cv2.grabCut` from `V04_ui_component_styleguide.png`; tiny thumbnail | `TECH_PREVIEW_ONLY` |
| `cutout_prop_tool_two_sided_coin_png` | `public/visual-v2/assets/props/tools/two_sided_coin/native.png` | `68×64` | Yes | 10,114 | `b4be3cb82d180392` | `cv2.grabCut` from `V04_ui_component_styleguide.png`; tiny thumbnail | `TECH_PREVIEW_ONLY` |
| `cutout_prop_tool_balance_scale_png` | `public/visual-v2/assets/props/tools/balance_scale/native.png` | `99×65` | Yes | 13,839 | `2fe942a860c799ba` | `cv2.grabCut` from `V04_ui_component_styleguide.png`; tiny thumbnail | `TECH_PREVIEW_ONLY` |
| `cutout_prop_tool_weather_clouds_png` | `public/visual-v2/assets/props/tools/weather_clouds/native.png` | `68×64` | Yes | 10,759 | `b4909ffec7868130` | Mismatched weather icon placed in `props/tools/`; `flag` and `fence` tools are missing | `TECH_PREVIEW_ONLY` |

---

## 4. Required Production 3D Assets to Commission / Generate Before Batch02 UI Replacement (`22` Missing Sets)

| Target Asset ID | Scene | Target Path | Min Dimensions | Alpha | Required Visual & Interactive States | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `prod_detective_master_plate_desktop_16x9` | `thought_detective` | `public/visual-v2/batch02-art/scenes/detective_workshop_desktop.webp` | `2560×1440` (`16:9`) | No | Pixar/Nintendo-grade 3D detective treehouse observatory & warm wooden desk; zero baked text/characters | `MISSING` |
| `prod_detective_master_plate_mobile_3x4` | `thought_detective` | `public/visual-v2/batch02-art/scenes/detective_workshop_mobile.webp` | `1200×1600` (`3:4`) | No | Vertical 3:4 mobile composition with safe top header and bottom dock zones (`360×800`..`430×932`) | `MISSING` |
| `prod_detective_layer_distant_window_sky` | `thought_detective` | `public/visual-v2/batch02-art/layers/detective_l1_distant_sky_rgba.webp` | `2560×1440` | Yes | Independent L1 distant sky & island bay view through observatory window | `MISSING` |
| `prod_detective_layer_mid_workbench_bookshelves` | `thought_detective` | `public/visual-v2/batch02-art/layers/detective_l2_mid_workbench_rgba.webp` | `2560×1440` | Yes | Independent L2 3D wooden workbench, clue board, and shelves | `MISSING` |
| `prod_detective_layer_fore_arch_lanterns` | `thought_detective` | `public/visual-v2/batch02-art/layers/detective_l3_fore_arch_rgba.webp` | `2560×1440` | Yes | Independent L3 foreground wooden arch & warm hanging magnifier lanterns | `MISSING` |
| `prod_detective_prop_tool_flag_states` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_tool_flag_rgba.webp` | `512×512` | Yes | Tool 1 (`flag`): `personFlagRemoved=false` vs `true` (separating person from event) | `MISSING` |
| `prod_detective_prop_tool_three_lenses_states` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_tool_three_lenses_rgba.webp` | `512×512` | Yes | Tool 2 (`lenses`): 3D tri-lens turret (`my` amber, `his` sky, `sky` emerald) | `MISSING` |
| `prod_detective_prop_tool_two_sided_coin_states` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_tool_coin_rgba.webp` | `512×512` | Yes | Tool 3 (`coin`): `front` (challenge side) & `back` (caring side) | `MISSING` |
| `prod_detective_prop_tool_balance_scale_states` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_tool_balance_scale_rgba.webp` | `512×512` | Yes | Tool 4 (`scale`): 3D wooden/brass dual-pan fairness scale | `MISSING` |
| `prod_detective_prop_tool_safety_fence_states` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_tool_safety_fence_rgba.webp` | `512×512` | Yes | Tool 5 (`fence`): 3D protective boundary fence & shield badge | `MISSING` |
| `prod_detective_prop_three_boxes_set` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_three_boxes_set_rgba.webp` | `600×400` | Yes | Mode 2 (`threeBoxes`): 3 tactile 3D chests (`visible`, `heart`, `guess`) with open/sorted glow states | `MISSING` |
| `prod_detective_prop_control_circles_rings` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_control_circles_rgba.webp` | `800×600` | Yes | Mode 3 (`circles`): 3 concentric 3D rings (`adult`, `mine`, `together`) | `MISSING` |
| `prod_detective_prop_four_steps_staircase` | `thought_detective` | `public/visual-v2/batch02-art/props/detective_four_steps_ladder_rgba.webp` | `800×500` | Yes | Mode 4 (`fourSteps`): 4-step 3D wooden observation ladder (`currentStep: 1..4`) | `MISSING` |
| `prod_breaker_master_plate_desktop_16x9` | `difficulty_breaker` | `public/visual-v2/batch02-art/scenes/breaker_workbench_creek_desktop.webp` | `2560×1440` (`16:9`) | No | 3D artisan stone-splitting workbench beside a sunlit forest creek; zero baked text/characters | `MISSING` |
| `prod_breaker_master_plate_mobile_3x4` | `difficulty_breaker` | `public/visual-v2/batch02-art/scenes/breaker_workbench_creek_mobile.webp` | `1200×1600` (`3:4`) | No | Vertical 3:4 mobile composition for `360×800`..`430×932` | `MISSING` |
| `prod_breaker_layer_creek_and_workbench` | `difficulty_breaker` | `public/visual-v2/batch02-art/layers/breaker_l2_workbench_stream_rgba.webp` | `2560×1440` | Yes | Independent L2 3D workbench & stepping-stone stream midground layer | `MISSING` |
| `prod_breaker_prop_preset_boulders_3x` | `difficulty_breaker` | `public/visual-v2/batch02-art/props/breaker_preset_boulders_rgba.webp` | `512×512` | Yes | Stage 0 (`pick`): 3 3D problem boulders (`diff-two-homes`, `diff-blocks-broken`, `diff-friend-ask`) + 4 subbranch tokens | `MISSING` |
| `prod_breaker_prop_fen_crystal_stones_3x` | `difficulty_breaker` | `public/visual-v2/batch02-art/props/breaker_fen_crystals_rgba.webp` | `900×450` | Yes | Stage 1 (`fen`): 3 splittable 3D crystal geodes (`fact` emerald, `feeling` rose, `guess` amber) unsplit & revealed | `MISSING` |
| `prod_breaker_prop_tong_dual_lens_turntable` | `difficulty_breaker` | `public/visual-v2/batch02-art/props/breaker_tong_dual_lens_rgba.webp` | `600×600` | Yes | Stage 2 (`tong`): 3D dual-sided perspective lens turntable (`isCoinFlipped: false \| true`) | `MISSING` |
| `prod_breaker_prop_ze_river_stepping_stones` | `difficulty_breaker` | `public/visual-v2/batch02-art/props/breaker_ze_stepping_stones_rgba.webp` | `900×450` | Yes | Stage 3 (`ze`): 3 creek stepping-stone slots (empty/placed/safety) + voluntary pause rest cushion | `MISSING` |
| `prod_breaker_prop_complete_celebration_bridge` | `difficulty_breaker` | `public/visual-v2/batch02-art/props/breaker_complete_path_rgba.webp` | `1200×675` | Yes | Stage 4 (`complete`): 3D completed stepping-stone creek path & warm lantern glow | `MISSING` |
| `prod_shared_4companions_3d_rig_masters` | `shared_companion_rig` | `public/visual-v2/batch02-art/characters/{companionId}/rig_master_rgba.webp` | `1024×1024` | Yes | High-res 3D layered character rigs (`guoguo`, `beibei`, `tiantian`, `qiqi`) with voice-synced mouth states | `MISSING` |
