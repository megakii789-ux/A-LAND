/**
 * A-LAND V2 Asset Factory V0.1 — Verified Manifest, Component Mapping & Art Director QA Ledger
 * Status: ASSET_ENGINEERING_PARTIAL / ART_DIRECTOR_QA_HOLD
 */

export const V2_ASSET_FACTORY_META = {
  packageVersion: 'A_LAND_V2_ASSET_FACTORY_V0_1_20261016',
  baselineSha: 'dc71b227d5a55d43fc8743f84b44d7c459522988',
  releaseState: 'ART_DIRECTOR_QA_HOLD' as const,
  productionArtPass: false as const,
  publicPathRoot: '/visual-v2/assets' as const,
  reviewEntryPath: '/visual-v2-review' as const,
  disclosures: {
    nativeCharacterWidthsPx: '172–206px (idle_2x_upscaled is bilinear/bicubic interpolation, NOT native 4K)',
    nativeLandmarkWidthsPx: '113–213px (idle_2x_upscaled is interpolation, NOT native 4K)',
    animationRigType: '2.5D whole-sprite transforms (8-frame WebP / 4x2 PNG sprite sheets + CSS/WAAPI; NO skeletal rig, NO lip-sync, NO native .aep)',
    sceneBackplatesType: 'Engineering layered SVG vectors (4 island layers + 8 scene backplates; 3D lighting/geometry master layers still on HOLD)',
    grabCutAuditNote: 'All 21 cutout PNGs have verified alpha (31.75%–62.29% transparent pixels); automated GrabCut matting has minor ear-tip clipping on guoguo_squirrel and qiqi_deer requiring manual artist cleanup.',
  },
} as const;

export const V2_DESIGN_TOKENS = {
  color: {
    seaBlue: '#72CBFF',
    skyBlue: '#60BCF6',
    sunYellow: '#FFD67A',
    leafGreen: '#A7D676',
    coralPink: '#FFB6C9',
    lavender: '#B9A6FF',
    paperWhite: '#FFF7EB',
    inkBlue: '#123C5C',
    woodBrown: '#B68C64',
    primaryTeal: '#18B7A4',
  },
  layout: {
    minTouchTargetCssPx: 56,
    primaryButtonMinHeightCssPx: 64,
    desktopReferenceWidth: 1440,
    mobileReferenceWidth: 390,
    mobileMinimumWidth: 360,
  },
  motion: {
    idleMs: 3000,
    enterMs: 380,
    tapMs: 180,
    pressScale: 0.976,
    reducedMotion: 'disable non-essential animations',
  },
  artwork: {
    nativeRasterPixelsLimited: true,
    '2xRasterIsInterpolationOnly': true,
    full3DGeometryAvailable: false,
    animationRigType: '2.5D whole-sprite transforms',
  },
} as const;

export interface AssetGapEntry {
  moduleId: string;
  moduleName: string;
  currentAssets: string;
  productionGap: string;
  owner: string;
  gate: 'ART_DIRECTOR_QA_HOLD';
}

export const V2_ASSET_GAP_LEDGER: readonly AssetGapEntry[] = [
  {
    moduleId: 'companions',
    moduleName: '四伙伴立绘 (果果/贝贝/天天/奇奇)',
    currentAssets: '4 张经 GrabCut 抠图的透明原生立绘（172–206px 宽）与 2× 插值版',
    productionGap: '缺每位 ≥1024px 可编辑母版、背面、手臂/眼睛/嘴巴/耳朵/身体独立分层；果果与奇奇耳尖存在自动抠图裁切痕迹',
    owner: '视觉资产创作',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
  {
    moduleId: 'animations',
    moduleName: '四伙伴动画状态 (16 组 WebP/4×2 PNG)',
    currentAssets: '4 伙伴 × 4 状态 (idle/greeting/listening/celebrate) 整体精灵变换 + CSS/WAAPI',
    productionGap: '无逐部位骨骼绑定、无眨眼/转身、无真实语音口型帧同步、无原生 AE 工程 (.aep)',
    owner: '美术+动效',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
  {
    moduleId: 'landmarks',
    moduleName: '8 大地标透明建筑资产',
    currentAssets: '8 张透明小图（113–213px 宽）+ 8 张 SVG 工程占位场景背板',
    productionGap: '缺 8× 4K 原生 3D 场景源、物件分层与遮挡/法线/光照统一及昼夜雨雾变体',
    owner: '美术',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
  {
    moduleId: 'main_island',
    moduleName: '儿童首页主岛 4 层背景',
    currentAssets: '4 层真正独立、无限缩放的工程 SVG (01_sky / 02_distant_ocean / 03_island_ground / 04_foreground_boardwalk)',
    productionGap: '缺与已批准 3D 大场景同等级的分离天空/远岛/中景房屋/前景植被 2K/4K 成品层',
    owner: '美术',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
  {
    moduleId: 'weather_and_tools',
    moduleName: '天气与侦探工具透明道具 (9 项)',
    currentAssets: '5 种天气 (61–86px) + 4 种工具 (68–99px) 透明 PNG/WebP',
    productionGap: '缺真高清独立轮廓及激活/禁用/悬停多状态图层',
    owner: '美术+前端',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
  {
    moduleId: 'story_and_bridge',
    moduleName: '故事林 & 两个家的桥场景内层',
    currentAssets: '独立场景 SVG 工程背板 + 地标透明立绘，复用现有真实业务交互 DOM',
    productionGap: '缺互动任务内每张可动道具的高清独立 3D 分层资产（如 Slice A/B/C 专属高精道具图层）',
    owner: '视觉资产+产品审核',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
  {
    moduleId: 'parent_coach',
    moduleName: '家长教练端视觉壳',
    currentAssets: '仅设计参考图 V07，无独立拆出高清家长端透明图层；采用 V2 视觉壳封装真实业务数据',
    productionGap: '缺家长界面独立可替换图层、插画母版及 UI 组件标定',
    owner: 'UI 设计',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
] as const;

export const V2_COMPONENT_ASSET_MAPPING = [
  {
    v2Component: 'src/visual-v2/IslandMapV2.tsx',
    legacyComponent: 'src/components/ChildIsland/FairytaleIslandMap.tsx',
    visualAssets: [
      '/visual-v2/assets/scenes/01_sky.svg',
      '/visual-v2/assets/scenes/02_distant_ocean.svg',
      '/visual-v2/assets/scenes/03_island_ground.svg',
      '/visual-v2/assets/scenes/04_foreground_boardwalk.svg',
      '/visual-v2/assets/landmarks/*/idle_native.webp',
    ],
    interactionOwner: 'Existing IslandHome handleOpenPlace / setIsBreakerOpen / recordLandmarkVisit',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
  {
    v2Component: 'src/visual-v2/CompanionActorV2.tsx',
    legacyComponent: 'src/components/ChildIsland/CompanionBanner.tsx',
    visualAssets: [
      '/visual-v2/assets/characters/*/idle_native.webp',
      '/visual-v2/assets/characters/*/motion_*.webp',
    ],
    interactionOwner: 'personalization.companionId + speechNarrator real playback session events',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
  {
    v2Component: 'src/visual-v2/V2UIStateComponents.tsx (V2ChildAudioBar)',
    legacyComponent: 'src/components/ChildIsland/ChildAudioBar.tsx',
    visualAssets: ['/visual-v2/assets/effects/*.svg'],
    interactionOwner: 'speechNarrator.replay / pause / resume / stop (zero fake progress)',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
  {
    v2Component: 'src/visual-v2/SceneBackdropV2.tsx',
    legacyComponent: 'WeatherStation / StoryGrove / ThoughtDetective / TwoHomesBridge / DifficultyBreaker / CourageHouse / StarlightCabin / CalmSpace',
    visualAssets: [
      '/visual-v2/assets/scenes/*_scene_backplate.svg',
      '/visual-v2/assets/props/weather/*/native.webp',
      '/visual-v2/assets/props/tools/*/native.webp',
    ],
    interactionOwner: '100% real business modal state machines & ContentAuditRegistry Fail-Closed gates',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
  {
    v2Component: 'src/visual-v2/V2UIStateComponents.tsx (V2ParentDashboardShell)',
    legacyComponent: 'src/components/ParentCoach/ParentDashboard.tsx',
    visualAssets: ['V2 token shell (no fake demo data; connected to real AppContext & parentAccess PIN gate)'],
    interactionOwner: 'ParentDashboard + ParentGateModal + lockParentAccess',
    gate: 'ART_DIRECTOR_QA_HOLD',
  },
] as const;

export const MEASURED_ALPHA_ASSETS = [
  { path: 'assets/characters/guoguo_squirrel/idle_native.png', width: 206, height: 259, transparentPercent: 48.14 },
  { path: 'assets/characters/beibei_otter/idle_native.png', width: 194, height: 260, transparentPercent: 34.54 },
  { path: 'assets/characters/tiantian_raccoon/idle_native.png', width: 181, height: 239, transparentPercent: 31.75 },
  { path: 'assets/characters/qiqi_deer/idle_native.png', width: 172, height: 244, transparentPercent: 43.21 },
  { path: 'assets/landmarks/story_grove/idle_native.png', width: 189, height: 146, transparentPercent: 33.42 },
  { path: 'assets/landmarks/tools_room/idle_native.png', width: 180, height: 144, transparentPercent: 34.88 },
  { path: 'assets/landmarks/courage_house/idle_native.png', width: 171, height: 140, transparentPercent: 35.39 },
  { path: 'assets/landmarks/weather_station/idle_native.png', width: 113, height: 147, transparentPercent: 57.11 },
  { path: 'assets/landmarks/calm_corner/idle_native.png', width: 173, height: 122, transparentPercent: 35.25 },
  { path: 'assets/landmarks/two_homes_bridge/idle_native.png', width: 213, height: 107, transparentPercent: 33.63 },
  { path: 'assets/landmarks/starlight_cabin/idle_native.png', width: 169, height: 157, transparentPercent: 35.73 },
  { path: 'assets/landmarks/difficulty_breaker/idle_native.png', width: 191, height: 151, transparentPercent: 40.41 },
  { path: 'assets/props/weather/sunny/native.png', width: 61, height: 61, transparentPercent: 35.5 },
  { path: 'assets/props/weather/calm/native.png', width: 86, height: 68, transparentPercent: 37.93 },
  { path: 'assets/props/weather/sad/native.png', width: 79, height: 77, transparentPercent: 33.63 },
  { path: 'assets/props/weather/angry/native.png', width: 80, height: 72, transparentPercent: 33.68 },
  { path: 'assets/props/weather/scared/native.png', width: 78, height: 72, transparentPercent: 33.12 },
  { path: 'assets/props/tools/binoculars/native.png', width: 68, height: 64, transparentPercent: 62.29 },
  { path: 'assets/props/tools/two_sided_coin/native.png', width: 81, height: 67, transparentPercent: 40.0 },
  { path: 'assets/props/tools/balance_scale/native.png', width: 99, height: 73, transparentPercent: 44.0 },
  { path: 'assets/props/tools/weather_clouds/native.png', width: 94, height: 71, transparentPercent: 32.29 },
] as const;
