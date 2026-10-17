# A-LAND V2.3 Batch01R — Asset Mapping, SHA-256 Uniqueness & Provenance

- **Remediation Branch**: `ui/visual-v2-batch01r-art-remediation`
- **Canonical Code SHA (`CANONICAL_CODE_SHA`)**: `6c6e6cf16193f4bb7fd27d8a0cb9161ecf6973c4`
- **Handoff ZIP SHA-256**: `1914661b9592e0efc754ad409da905f6428f81e530966ba739754059580b4a8d`
- **Manifest File**: `src/visual-v2/manifest/v2_3Batch01Manifest.ts`
- **Audit Gate Status**: `ASSET_ARTWORK_BLOCKED` / `ART_DIRECTOR_QA_HOLD` / `TECH_PREVIEW_NOT_ART_APPROVED`

---

## 1. SHA-256 Uniqueness Verification (Zero Shared-Geometry Duplicate Hashes)

In the previous rejected `Batch01`, `calm_corner/exhale/room`, `calm_corner/paused/room`, and `calm_corner/rest/room` shared the exact same SVG file hash (`isSharedGeometryFixture: true`).

In `Batch01R`:
- **Total Scene/State Layer Records**: `26` (`18` Weather Station layer records + `8` Calm Corner layer records)
- **Unique Desktop Asset SHA-256 Count**: `26 / 26` (`100%` unique)
- **Unique Mobile Asset SHA-256 Count**: `26 / 26` (`100%` unique)
- **`isSharedGeometryFixture` Count**: `0 / 26` (`false` on every record)

---

## 2. Scene & State Layer Mapping (`26` Layer Records, Desktop `1376×768` + Mobile `896×1200`)

| Asset ID | Module / State / Layer | Desktop Public URL (`1376×768` / RGBA) | Desktop SHA-256 | Mobile Public URL (`896×1200` / RGBA) | Mobile SHA-256 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `weather_station/sunny/backplate` | Weather · `sunny` · L1 Backplate | `/visual-v2/batch01r-art/scenes/weather_sunny_backplate_desktop.webp` | `ea6f0ee44f345820a44e4c808e03ef6cabdf34f937eda25696f08216dbb0d373` | `/visual-v2/batch01r-art/scenes/weather_sunny_backplate_mobile.webp` | `783b3a30cd2df68d5f72e7113b833765f4419d414cfef7ff1e3b4fb871134a62` |
| `weather_station/sunny/weather_actor` | Weather · `sunny` · L2 Sky Actor | `/visual-v2/batch01r-art/layers/weather_actor_sunny_rgba.png` | `c132715eadcd403cd1805aba7e6deaf25c537b5b3ef43488e38b04105f56359d` | `/visual-v2/batch01r-art/layers/weather_actor_sunny_rgba.png` | `c132715eadcd403cd1805aba7e6deaf25c537b5b3ef43488e38b04105f56359d` |
| `weather_station/sunny/front_effect` | Weather · `sunny` · L3 Veranda Frame | `/visual-v2/batch01r-art/layers/weather_front_sunny_desktop.webp` | `b633380608a73f28f05d2d8bc37af1fa9564ca140a9cfd93925af4112ab4732c` | `/visual-v2/batch01r-art/layers/weather_front_sunny_mobile.webp` | `00d74a7763f9e5964ba5de339f21a9a99c5dd5f2b3a948c6fa16180f376f40b5` |
| `weather_station/cloudy/backplate` | Weather · `cloudy` · L1 Backplate | `/visual-v2/batch01r-art/scenes/weather_cloudy_backplate_desktop.webp` | `b83a476bf636120286de5ff3930cb974e6c7921ba68fdcd9c718f18c7d411c18` | `/visual-v2/batch01r-art/scenes/weather_cloudy_backplate_mobile.webp` | `8db8e550df9e9a8dd58353988e43b81bb17ba0da378da3d2c79d6c01548e1a66` |
| `weather_station/cloudy/weather_actor` | Weather · `cloudy` · L2 Sky Actor | `/visual-v2/batch01r-art/layers/weather_actor_cloudy_rgba.png` | `d1e614dcfa739be84df712d1a079c63b40800ab33c18dc793fa151bc78702e64` | `/visual-v2/batch01r-art/layers/weather_actor_cloudy_rgba.png` | `d1e614dcfa739be84df712d1a079c63b40800ab33c18dc793fa151bc78702e64` |
| `weather_station/cloudy/front_effect` | Weather · `cloudy` · L3 Veranda Frame | `/visual-v2/batch01r-art/layers/weather_front_cloudy_desktop.webp` | `85ed9989abfc1df5284fa9247829e3b3a24171d91a5d2218c980cf9f209ac9de` | `/visual-v2/batch01r-art/layers/weather_front_cloudy_mobile.webp` | `9e536b58e8b6a7a8b12630bc1a6a91a911417d9a77e0bf1ef1d0ca383d54ae6c` |
| `weather_station/rainy/backplate` | Weather · `rainy` · L1 Backplate | `/visual-v2/batch01r-art/scenes/weather_rainy_backplate_desktop.webp` | `a290b541b25f8fb33489078be47ba8652b8df1ec7fb03dc9176d22da3b9e15f4` | `/visual-v2/batch01r-art/scenes/weather_rainy_backplate_mobile.webp` | `e7a1326c8c300a7f346960e73500161e5dd92989ab63d518b496a951dc7dc589` |
| `weather_station/rainy/weather_actor` | Weather · `rainy` · L2 Sky Actor | `/visual-v2/batch01r-art/layers/weather_actor_rainy_rgba.png` | `fd4731eb92467c72bd631d526ba3cb6c5368b4478e20bb57bf90138953543a92` | `/visual-v2/batch01r-art/layers/weather_actor_rainy_rgba.png` | `fd4731eb92467c72bd631d526ba3cb6c5368b4478e20bb57bf90138953543a92` |
| `weather_station/rainy/front_effect` | Weather · `rainy` · L3 Veranda Frame | `/visual-v2/batch01r-art/layers/weather_front_rainy_desktop.webp` | `ff8eb6fc675db11d031854a0172185dc4ac75de75ca72a30a457795216f49be6` | `/visual-v2/batch01r-art/layers/weather_front_rainy_mobile.webp` | `30a7f7808727260454f5133223438df41e3dc818e0f1cd214bc3be5fb0caab4e` |
| `weather_station/stormy/backplate` | Weather · `stormy` · L1 Backplate | `/visual-v2/batch01r-art/scenes/weather_stormy_backplate_desktop.webp` | `b4a5bb424df6b16d2255a764f4b18040290e53993b75194651ca1ba938559112` | `/visual-v2/batch01r-art/scenes/weather_stormy_backplate_mobile.webp` | `e38a5de014a353b60d0b3db16197b320377d5cf5e04d7c934e4cf59c039eb2cf` |
| `weather_station/stormy/weather_actor` | Weather · `stormy` · L2 Sky Actor | `/visual-v2/batch01r-art/layers/weather_actor_stormy_rgba.png` | `f8220eb4050445792e887a75fc49794c425731a6cf9a32f9638767ca461e47cf` | `/visual-v2/batch01r-art/layers/weather_actor_stormy_rgba.png` | `f8220eb4050445792e887a75fc49794c425731a6cf9a32f9638767ca461e47cf` |
| `weather_station/stormy/front_effect` | Weather · `stormy` · L3 Veranda Frame | `/visual-v2/batch01r-art/layers/weather_front_stormy_desktop.webp` | `1d5e5cdbe7445abcf6427180fb53a7a22048bb40bc9371d0e819a282c81f6e08` | `/visual-v2/batch01r-art/layers/weather_front_stormy_mobile.webp` | `781f9045be9721db1b299985fa9061bc13a58f087fa39c9dc9f77e121f81c6b8` |
| `weather_station/foggy/backplate` | Weather · `foggy` · L1 Backplate | `/visual-v2/batch01r-art/scenes/weather_foggy_backplate_desktop.webp` | `6f41a2bb02b92eb098b34712321275abbf2e40b1812eb095d8fb539d4bb0c7e0` | `/visual-v2/batch01r-art/scenes/weather_foggy_backplate_mobile.webp` | `20d365934c22e3593378e9106e479c6d0d5ff6bf58e334fa2e2e03ab0a859f64` |
| `weather_station/foggy/weather_actor` | Weather · `foggy` · L2 Sky Actor | `/visual-v2/batch01r-art/layers/weather_actor_foggy_rgba.png` | `0742857b46a10a6ab4db0e6547052f59e01ca0ecff3b050aa63e6cb2524c66d4` | `/visual-v2/batch01r-art/layers/weather_actor_foggy_rgba.png` | `0742857b46a10a6ab4db0e6547052f59e01ca0ecff3b050aa63e6cb2524c66d4` |
| `weather_station/foggy/front_effect` | Weather · `foggy` · L3 Veranda Frame | `/visual-v2/batch01r-art/layers/weather_front_foggy_desktop.webp` | `3da7b90cd1a1b70492e851aa782a6a3db5c635f7d9d81fc186fb4853b27e967c` | `/visual-v2/batch01r-art/layers/weather_front_foggy_mobile.webp` | `258de8e48e91a036c2f56560fd2fd151763d07efbc2984b686cb26debeab3f88` |
| `weather_station/opt_out/backplate` | Weather · `opt_out` · L1 Backplate | `/visual-v2/batch01r-art/scenes/weather_opt_out_backplate_desktop.webp` | `67c6a9238cb53b27bc9cbdf170ecbe807cf83b419ab6413b08f5a30ef8e8e97f` | `/visual-v2/batch01r-art/scenes/weather_opt_out_backplate_mobile.webp` | `b4ffab8631a1f71099c4c2f92db2744a644002dd7d1d6671a03b9f53d06d0fb6` |
| `weather_station/opt_out/weather_actor` | Weather · `opt_out` · L2 Sky Actor | `/visual-v2/batch01r-art/layers/weather_actor_opt_out_rgba.png` | `0bf18886e92d57c0416e3fc21190dfdc40f8bc0d9f6f836fb62697380efbc337` | `/visual-v2/batch01r-art/layers/weather_actor_opt_out_rgba.png` | `0bf18886e92d57c0416e3fc21190dfdc40f8bc0d9f6f836fb62697380efbc337` |
| `weather_station/opt_out/front_effect` | Weather · `opt_out` · L3 Veranda Frame | `/visual-v2/batch01r-art/layers/weather_front_opt_out_desktop.webp` | `c852e812fc5d9079cd95f762b105fa6a014d94609736b1aa72357b3c4b39efeb` | `/visual-v2/batch01r-art/layers/weather_front_opt_out_mobile.webp` | `f6eb177fa1d2163646b289d140c80cb68b67b1d45df0158bd288a9ba8f4a6bf5` |
| `calm_corner/inhale/room` | Calm · `inhale` · L1 Sanctuary | `/visual-v2/batch01r-art/scenes/calm_inhale_room_desktop.webp` | `1d504fa6cf23bc2a050db3dfc70c48ac2bb6135f7f784e541a1250ed88e86ea1` | `/visual-v2/batch01r-art/scenes/calm_inhale_room_mobile.webp` | `f5cc8b208f03fd9389831e976a979546144946fb26bd2334b65ab70f32e7060d` |
| `calm_corner/inhale/breathing_visual` | Calm · `inhale` · L2 Halo | `/visual-v2/batch01r-art/layers/calm_breathing_halo_inhale_rgba.png` | `7e87fb0ede8aa06c2a45ef91b17e34c13cf6b86c59980a119ab8887f493eaa41` | `/visual-v2/batch01r-art/layers/calm_breathing_halo_inhale_rgba.png` | `7e87fb0ede8aa06c2a45ef91b17e34c13cf6b86c59980a119ab8887f493eaa41` |
| `calm_corner/exhale/room` | Calm · `exhale` · L1 Sanctuary | `/visual-v2/batch01r-art/scenes/calm_exhale_room_desktop.webp` | `1cd4be2a99993c3be7971b68de0396aa395ef03d71d7fd33557a8ef68875a3bd` | `/visual-v2/batch01r-art/scenes/calm_exhale_room_mobile.webp` | `66a8f103052b04ffab7340928d3965f8266fc99e4425777815293bd1905e3dd0` |
| `calm_corner/exhale/breathing_visual` | Calm · `exhale` · L2 Halo | `/visual-v2/batch01r-art/layers/calm_breathing_halo_exhale_rgba.png` | `5964df7c187861ac5498b883f1c73cbdd3e179111dd8de95197e6f0302551b1b` | `/visual-v2/batch01r-art/layers/calm_breathing_halo_exhale_rgba.png` | `5964df7c187861ac5498b883f1c73cbdd3e179111dd8de95197e6f0302551b1b` |
| `calm_corner/paused/room` | Calm · `paused` · L1 Sanctuary | `/visual-v2/batch01r-art/scenes/calm_paused_room_desktop.webp` | `94c9d34f0fa5963dd8c775bbefdddc665f5b9c39b08e841f72fd6c5f5ef69029` | `/visual-v2/batch01r-art/scenes/calm_paused_room_mobile.webp` | `df275b5a8e677a9135147722cbdc82da514418193d0795ef6ba16091727fd8c7` |
| `calm_corner/paused/breathing_visual` | Calm · `paused` · L2 Halo | `/visual-v2/batch01r-art/layers/calm_breathing_halo_paused_rgba.png` | `2040a60c9e64f1e4c92ef99220e026e44ba5b9ac645af6c039bcbf6015de2a4b` | `/visual-v2/batch01r-art/layers/calm_breathing_halo_paused_rgba.png` | `2040a60c9e64f1e4c92ef99220e026e44ba5b9ac645af6c039bcbf6015de2a4b` |
| `calm_corner/rest/room` | Calm · `rest` · L1 Sanctuary | `/visual-v2/batch01r-art/scenes/calm_rest_room_desktop.webp` | `86e4cccd2f74a34565a15f44edbb03fbdb72cf444fb4be45fb7e8cf241f3f1b5` | `/visual-v2/batch01r-art/scenes/calm_rest_room_mobile.webp` | `39b300ef3e544d3975921749d2b0d88b17dc235e9d7b6aeec3b2833ef0585118` |
| `calm_corner/rest/breathing_visual` | Calm · `rest` · L2 Halo | `/visual-v2/batch01r-art/layers/calm_breathing_halo_rest_rgba.png` | `cb56be79233d9d25a9626397ee5c4b00bfbe96df2255eb0fbeb22493b6058ba4` | `/visual-v2/batch01r-art/layers/calm_breathing_halo_rest_rgba.png` | `cb56be79233d9d25a9626397ee5c4b00bfbe96df2255eb0fbeb22493b6058ba4` |

---

## 3. Native 3D RGBA Cutouts (`02_EXISTING_TRANSPARENT_CUTOUTS_PREVIEW_ONLY` -> `public/visual-v2/batch01r-art/cutouts/`)

| Cutout Key | Public URL | Dimensions | SHA-256 | Bytes | Wired Component |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `companion_guoguo` | `/visual-v2/batch01r-art/cutouts/characters/guoguo_squirrel/idle_native.png` | `129×172` | `0565c1b8bf1312a46db342bf1bc84db6d75521303f14cf62e235c2c2fa6ab2e1` | `35,610` | `V2_3CompanionRigActor`, Companion Switcher (`WeatherStationSceneArtV2`, `CalmCornerSceneArtV2`) |
| `companion_beibei` | `/visual-v2/batch01r-art/cutouts/characters/beibei_otter/idle_native.png` | `135×174` | `66ca5e3dc253973e9e4c83090a486ef601e0f2d11ecdb608d37da52a707938ab` | `36,683` | `V2_3CompanionRigActor`, Companion Switcher (`WeatherStationSceneArtV2`, `CalmCornerSceneArtV2`) |
| `companion_tiantian` | `/visual-v2/batch01r-art/cutouts/characters/tiantian_raccoon/idle_native.png` | `131×171` | `1ca3f38d43726c8971001c600b26158f3be7ec657cb69e11234be3ac861681dc` | `38,479` | `V2_3CompanionRigActor`, Companion Switcher (`WeatherStationSceneArtV2`, `CalmCornerSceneArtV2`) |
| `companion_qiqi` | `/visual-v2/batch01r-art/cutouts/characters/qiqi_deer/idle_native.png` | `131×171` | `337fd9c89f9ef21b3ca86a2f153e2524c60542c336eb33de8eb1b4c39ac2269d` | `35,882` | `V2_3CompanionRigActor`, Companion Switcher (`WeatherStationSceneArtV2`, `CalmCornerSceneArtV2`) |
| `landmark_weather_station` | `/visual-v2/batch01r-art/cutouts/landmarks/weather_station/idle_native.png` | `170×114` | `2076ee0f9d4838a02e9f26e97d67bfdb2d09c9ab5994c66838d16667eb5a3fc8` | `28,601` | `WeatherStationModal` V2 Observatory Header |
| `landmark_calm_corner` | `/visual-v2/batch01r-art/cutouts/landmarks/calm_corner/idle_native.png` | `147×124` | `b9bfaa3d4854312ff203599a4417a91aa3e6d3d60731be04d6f896136b1c0fd4` | `33,218` | `CalmSpace` & `CalmCornerModal` V2 Sanctuary Header |
| `weather_sunny` | `/visual-v2/batch01r-art/cutouts/props/weather/sunny/native.png` | `135×137` | `781373fc0db9ec29d4502b6be7ab300e7c71161dc89e64c45c5c8ff512b5fb2c` | `24,782` | `WeatherStationModal` Sunny Card |
| `weather_calm` | `/visual-v2/batch01r-art/cutouts/props/weather/calm/native.png` | `136×136` | `fd45dc7bf6c6564ef75df60ab713ab36cd97c52db5a1de784d7ebcdab0ba843e` | `18,864` | `WeatherStationModal` Opt-Out Card |
| `weather_sad` | `/visual-v2/batch01r-art/cutouts/props/weather/sad/native.png` | `136×131` | `a2ab649e05f95f9cd595ab73fc7a81a0b0db2d123e28c0bd4a2be4d305ff304e` | `20,034` | `WeatherStationModal` Rainy Card |
| `weather_angry` | `/visual-v2/batch01r-art/cutouts/props/weather/angry/native.png` | `134×136` | `461c002080bc99e3d7df2120b7030d15df455ec57de1b6d37f9fd963918b4aa3` | `22,741` | `WeatherStationModal` Stormy Card |
| `weather_scared` | `/visual-v2/batch01r-art/cutouts/props/weather/scared/native.png` | `131×128` | `32f37d8c0a846c6fd896959dc9ae1321d3fb7c18cc5a2417e8a9c4a98781140d` | `20,036` | `WeatherStationModal` Foggy Card |
| `weather_clouds` | `/visual-v2/batch01r-art/cutouts/props/tools/weather_clouds/native.png` | `147×99` | `1cc7e892cf5debc6f8d3877b47c2d7a4776007fb2d3a0808ccca34342725e793` | `17,841` | `WeatherStationModal` Cloudy Card |
