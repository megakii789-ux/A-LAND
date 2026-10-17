# A-LAND V2.3 Batch 01 — 资源映射表与几何复用真实披露 (`ASSET_MAPPING_AND_SHARED_GEOMETRY_DISCLOSURE.md`)

- **输入素材包**: `A_LAND_V2_3_TECH_VECTOR_LAYER_FACTORY_20261017.zip`
- **ZIP 字节数**: `359,075` bytes
- **ZIP SHA-256**: `f98f3d84f87e0a358e522d0566acf3628c1c66234d3181f59bd00fae07637a74`
- **总清单项 (`ASSET_MANIFEST.json`)**: `334` 项（`318` 个新分层 SVG + `16` 个既有图标 SVG）
- **318 个 SVG 独立字节体数量**: **`94` 个唯一 SHA-256 字节体**
- **生产美术准入数 (`production_quality_approved`)**: **`0`**
- **强制门禁标志**:
  - `ART_DIRECTOR_QA_HOLD`
  - `TECH_PREVIEW_NOT_ART_APPROVED`
  - `CONTENT_QA_REVIEW`
  - `PRODUCTION_RELEASE_HOLD`
  - `V2_3_BATCH01_TECH_INTEGRATION_AUTHORIZED`
  - `ENGINEERING_PILOT_AUDIT_PASS_STORY_CUP_ONLY`

---

## 1. 情绪天气站 (`WeatherStationModal` -> `WeatherStationSceneArtV2.tsx`) 18 个分层 SVG 映射与几何复用披露

> **真实性披露**：`weather_station` 共 6 个状态 × 3 层（`backplate` / `weather_actor` / `front_effect`）= **18 个 SVG 文件**，对应 **12 个唯一 SHA-256 字节体**：
> - `sunny` 与 `opt_out` 的 3 层底包 SVG 字节体完全相同（`isSharedGeometryFixture: true`）；
> - `cloudy` 与 `foggy` 的 3 层底包 SVG 字节体完全相同（`isSharedGeometryFixture: true`）；
> - `rainy` 与 `stormy` 各自拥有独立的 3 层 SVG 字节体（`isSharedGeometryFixture: false`）。
> - 在 `WeatherStationSceneArtV2.tsx` 舞台适配器中，除按状态加载对应 SVG 外，还通过真实 React/DOM 视觉层（`v2-weather-fog-overlay` 雾气层、`v2-weather-optout-veil` 静息柔光幕、`v2-weather-secondary-badge` 双天气并存徽章、`v2-weather-stage-sensations` 身体感受胶囊、以及按强度 `1/3/5` 缩放 `weather_actor`）实现 100% 真实可见的状态区分。

| 状态 (`state`) | 图层 (`part`) | 公共路径 (`publicUrl`) | 字节数 | SHA-256 | 是否底包复用 (`isSharedGeometryFixture`) | 复用对象 (`sharedGeometryWith`) |
| :--- | :--- | :--- | ---: | :--- | :--- | :--- |
| `sunny` | `backplate` | `/visual-v2/v2-3-layer-factory/assets/weather_station/sunny/backplate.svg` | 1166 | `ce412151936007d9138a4726adee0b7b17e4d12eebd6beb65194a386b862f13e` | `true` | `weather_station/opt_out/backplate` |
| `sunny` | `weather_actor` | `/visual-v2/v2-3-layer-factory/assets/weather_station/sunny/weather_actor.svg` | 676 | `78572c6cd080d4bb118f8dc892b5213d45e96995a92060d5b926552a0170a574` | `true` | `weather_station/opt_out/weather_actor` |
| `sunny` | `front_effect` | `/visual-v2/v2-3-layer-factory/assets/weather_station/sunny/front_effect.svg` | 830 | `56a8e0bcb6e170be616c192e85ee87832fcb44e4d22a4d10ddf7f1c7b44d533e` | `true` | `weather_station/opt_out/front_effect` |
| `cloudy` | `backplate` | `/visual-v2/v2-3-layer-factory/assets/weather_station/cloudy/backplate.svg` | 1225 | `f651d72c97e382598c60636a4de7c6c1163a6c6e2b4f8fa28092781e421ec5af` | `true` | `weather_station/foggy/backplate` |
| `cloudy` | `weather_actor` | `/visual-v2/v2-3-layer-factory/assets/weather_station/cloudy/weather_actor.svg` | 735 | `219711a0317f946de8e15b9e133fe5c0b9c44c9524d866ad3747a9744571b0a8` | `true` | `weather_station/foggy/weather_actor` |
| `cloudy` | `front_effect` | `/visual-v2/v2-3-layer-factory/assets/weather_station/cloudy/front_effect.svg` | 889 | `81baa443404d7d49c3ddfe2fec058d098e388e9178af66e7a4cf1000e011909a` | `true` | `weather_station/foggy/front_effect` |
| `rainy` | `backplate` | `/visual-v2/v2-3-layer-factory/assets/weather_station/rainy/backplate.svg` | 1225 | `8054190df5a93c58e27481bc82bb0783431ef9ecbc0ee19a47eb0369cb2a655e` | `false` | — |
| `rainy` | `weather_actor` | `/visual-v2/v2-3-layer-factory/assets/weather_station/rainy/weather_actor.svg` | 735 | `8c407685086a2aa91843235022352c1dc9d50e0a7e4f8f4d432e585a32494351` | `false` | — |
| `rainy` | `front_effect` | `/visual-v2/v2-3-layer-factory/assets/weather_station/rainy/front_effect.svg` | 1456 | `031d3715ec0fb11457d2c967a7e0731b7bf384b680d4cc38c07efdf8dc5e5051` | `false` | — |
| `stormy` | `backplate` | `/visual-v2/v2-3-layer-factory/assets/weather_station/stormy/backplate.svg` | 1225 | `d64886ab7c7597bb5ee9f7438efbdcf61665be50fd6245e30b1593c987ca641e` | `false` | — |
| `stormy` | `weather_actor` | `/visual-v2/v2-3-layer-factory/assets/weather_station/stormy/weather_actor.svg` | 891 | `c7d0c1df7893cc1bf80d05900aa0ec020b4c17a7a3e6bc2315f3801a9c158a83` | `false` | — |
| `stormy` | `front_effect` | `/visual-v2/v2-3-layer-factory/assets/weather_station/stormy/front_effect.svg` | 1456 | `0187df973abfd1bf6cf9557fb97754f2f82361ff5f57b1b327f69a2a168d084b` | `false` | — |
| `foggy` | `backplate` | `/visual-v2/v2-3-layer-factory/assets/weather_station/foggy/backplate.svg` | 1225 | `f651d72c97e382598c60636a4de7c6c1163a6c6e2b4f8fa28092781e421ec5af` | `true` | `weather_station/cloudy/backplate` |
| `foggy` | `weather_actor` | `/visual-v2/v2-3-layer-factory/assets/weather_station/foggy/weather_actor.svg` | 735 | `219711a0317f946de8e15b9e133fe5c0b9c44c9524d866ad3747a9744571b0a8` | `true` | `weather_station/cloudy/weather_actor` |
| `foggy` | `front_effect` | `/visual-v2/v2-3-layer-factory/assets/weather_station/foggy/front_effect.svg` | 889 | `81baa443404d7d49c3ddfe2fec058d098e388e9178af66e7a4cf1000e011909a` | `true` | `weather_station/cloudy/front_effect` |
| `opt_out` | `backplate` | `/visual-v2/v2-3-layer-factory/assets/weather_station/opt_out/backplate.svg` | 1166 | `ce412151936007d9138a4726adee0b7b17e4d12eebd6beb65194a386b862f13e` | `true` | `weather_station/sunny/backplate` |
| `opt_out` | `weather_actor` | `/visual-v2/v2-3-layer-factory/assets/weather_station/opt_out/weather_actor.svg` | 676 | `78572c6cd080d4bb118f8dc892b5213d45e96995a92060d5b926552a0170a574` | `true` | `weather_station/sunny/weather_actor` |
| `opt_out` | `front_effect` | `/visual-v2/v2-3-layer-factory/assets/weather_station/opt_out/front_effect.svg` | 830 | `56a8e0bcb6e170be616c192e85ee87832fcb44e4d22a4d10ddf7f1c7b44d533e` | `true` | `weather_station/sunny/front_effect` |

---

## 2. 绿草平静角 (`CalmSpace` & `CalmCornerModal` -> `CalmCornerSceneArtV2.tsx`) 8 个分层 SVG 映射与几何复用披露

> **真实性披露**：`calm_corner` 共 4 个状态 × 2 层（`room` / `breathing_visual`）= **8 个 SVG 文件**，对应 **4 个唯一 SHA-256 字节体**：
> - `rest`、`inhale`、`exhale` 的 `room.svg` 与 `breathing_visual.svg` 底包字节体相同（`isSharedGeometryFixture: true`）；
> - `paused` 拥有完全独立的 `room.svg` 与 `breathing_visual.svg` 字节体（`isSharedGeometryFixture: false`）。
> - 在 `CalmCornerSceneArtV2.tsx` 舞台适配器中，`breathing_visual` 图层由真实呼吸相位状态（`inhale`/`hold` -> `scale(1.15)`，`exhale` -> `scale(0.88)`，`rest`/`paused` -> `scale(1)`）驱动缩放，并在 `isPaused || prefersReducedMotion` 时立即冻结为 `scale(1)` 且 `transition: none`。

| 状态 (`state`) | 图层 (`part`) | 公共路径 (`publicUrl`) | 字节数 | SHA-256 | 是否底包复用 (`isSharedGeometryFixture`) | 复用对象 (`sharedGeometryWith`) |
| :--- | :--- | :--- | ---: | :--- | :--- | :--- |
| `rest` | `room` | `/visual-v2/v2-3-layer-factory/assets/calm_corner/rest/room.svg` | 1655 | `7238f29412b26f65a5e758bb5f526b4889d6ebff8e33c00f3c5191eee5472213` | `true` | `calm_corner/inhale/room`, `calm_corner/exhale/room` |
| `rest` | `breathing_visual` | `/visual-v2/v2-3-layer-factory/assets/calm_corner/rest/breathing_visual.svg` | 476 | `b8ac02c00187a4ae6769eff567e76434c1a9df2b606922847be6208e93bffc62` | `true` | `calm_corner/inhale/breathing_visual`, `calm_corner/exhale/breathing_visual` |
| `inhale` | `room` | `/visual-v2/v2-3-layer-factory/assets/calm_corner/inhale/room.svg` | 1655 | `7238f29412b26f65a5e758bb5f526b4889d6ebff8e33c00f3c5191eee5472213` | `true` | `calm_corner/rest/room`, `calm_corner/exhale/room` |
| `inhale` | `breathing_visual` | `/visual-v2/v2-3-layer-factory/assets/calm_corner/inhale/breathing_visual.svg` | 476 | `b8ac02c00187a4ae6769eff567e76434c1a9df2b606922847be6208e93bffc62` | `true` | `calm_corner/rest/breathing_visual`, `calm_corner/exhale/breathing_visual` |
| `exhale` | `room` | `/visual-v2/v2-3-layer-factory/assets/calm_corner/exhale/room.svg` | 1655 | `7238f29412b26f65a5e758bb5f526b4889d6ebff8e33c00f3c5191eee5472213` | `true` | `calm_corner/rest/room`, `calm_corner/inhale/room` |
| `exhale` | `breathing_visual` | `/visual-v2/v2-3-layer-factory/assets/calm_corner/exhale/breathing_visual.svg` | 476 | `b8ac02c00187a4ae6769eff567e76434c1a9df2b606922847be6208e93bffc62` | `true` | `calm_corner/rest/breathing_visual`, `calm_corner/inhale/breathing_visual` |
| `paused` | `room` | `/visual-v2/v2-3-layer-factory/assets/calm_corner/paused/room.svg` | 1655 | `5050b78cb5a03fc0a34c49fc071b8812d016f45c369ee6703c3bfec2b8767d75` | `false` | — |
| `paused` | `breathing_visual` | `/visual-v2/v2-3-layer-factory/assets/calm_corner/paused/breathing_visual.svg` | 476 | `418cc2bbe816879ab0ff5989b445ecdc72c2a9614a0c31db63e47f9558632056` | `false` | — |

---

## 3. 四伙伴 7 部件技术分层角色 (`V2_3CompanionRigActor`) 168 个 SVG 映射摘要

- **严格锁定 4 个既有伙伴 ID**：`guoguo_squirrel`（小松鼠果果）、`beibei_otter`（小水獭贝贝）、`tiantian_raccoon`（小浣熊天天）、`qiqi_deer`（小鹿奇奇），禁止新增第 5 个伙伴或改动声音配置。
- **7 部件 Z 轴叠放顺序 (`V2_3_COMPANION_RIG_Z_ORDER`)**：
  1. `ears_or_tail`
  2. `far_arm`
  3. `torso`
  4. `head`
  5. `eyes`
  6. `mouth`
  7. `near_arm`
- **真实口型门禁**：`V2_3CompanionRigActor` 订阅 `speechNarrator.subscribe()`，仅当 `narrationSession.playbackStatus === 'playing'` 且 `narrationSession.companionId === companionId` 且 `!prefersReducedMotion` 时才切换 `greeting/mouth.svg` 与 `neutral/mouth.svg`；静默或暂停时立即回到闭合口型（`data-mouth-active="false"`）。
