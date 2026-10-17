/**
 * A-LAND V2.3 Batch 01 — Strongly Typed Scene & Character Rig Adapter Manifest
 * Package: A_LAND_V2_3_TECH_VECTOR_LAYER_FACTORY_20261017.zip
 * Scope: Batch 01 ONLY (WeatherStationModal + CalmCornerModal / CalmSpace)
 * Status: TECH_PREVIEW_NOT_ART_APPROVED / ART_DIRECTOR_QA_HOLD / CONTENT_QA_REVIEW / PRODUCTION_RELEASE_HOLD
 */

export type V2_3CompanionId =
  | "guoguo_squirrel"
  | "beibei_otter"
  | "tiantian_raccoon"
  | "qiqi_deer";

export type V2_3CompanionRigState =
  | "neutral"
  | "greeting"
  | "listening"
  | "thinking"
  | "comfort"
  | "celebrate";

export type V2_3CompanionRigPart =
  | "ears_or_tail"
  | "far_arm"
  | "torso"
  | "head"
  | "eyes"
  | "mouth"
  | "near_arm";

export type V2_3WeatherState =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "stormy"
  | "foggy"
  | "opt_out";

export type V2_3WeatherLayerPart =
  | "backplate"
  | "weather_actor"
  | "front_effect";

export type V2_3CalmState =
  | "rest"
  | "inhale"
  | "exhale"
  | "paused";

export type V2_3CalmLayerPart =
  | "room"
  | "breathing_visual";

export interface V2_3SceneAssetRecord<TScene extends string = string, TState extends string = string, TPart extends string = string> {
  assetId: string;
  category: "environment" | "character_rig";
  scene: TScene;
  state: TState;
  part: TPart;
  deliverySvg: string;
  publicUrl: string;
  sha256: string;
  bytes: number;
  isSharedGeometryFixture: boolean;
  sharedGeometryWith: readonly string[];
  qaStatus: "TECH_PREVIEW_NOT_ART_APPROVED";
  artGate: "ART_DIRECTOR_QA_HOLD";
}

export interface V2_3CharacterRigAssetRecord extends V2_3SceneAssetRecord<"global", V2_3CompanionRigState, V2_3CompanionRigPart> {
  companionId: V2_3CompanionId;
}

export const V2_3_BATCH01_META = {
  packageVersion: "A_LAND_V2_3_TECH_VECTOR_LAYER_FACTORY_20261017" as const,
  zipBytes: 359075 as const,
  zipSha256: "f98f3d84f87e0a358e522d0566acf3628c1c66234d3181f59bd00fae07637a74" as const,
  baselineBranch: "origin/ui/visual-v2-story-pilot" as const,
  baselineArchiveHeadSha: "21fadb75822860f6a76e272ecf7be345a8769949" as const,
  baselineCanonicalCodeSha: "1330a797824c4d55a367ad04b7e7099d71cf8e6a" as const,
  worktreeBranch: "ui/visual-v2-batch01-weather-calm" as const,
  authorizedBatch: "BATCH_01_WEATHER_AND_CALM_ONLY" as const,
  authorizedModules: [
    "src/components/ChildIsland/WeatherStationModal.tsx",
    "src/components/ChildIsland/CalmCornerModal.tsx",
    "src/components/ChildIsland/CalmSpace.tsx",
  ] as const,
  publicPathRoot: "/visual-v2/v2-3-layer-factory" as const,
  totalManifestItems: 334 as const,
  newEditableSvgMasters: 318 as const,
  uniqueSvgByteBodies: 94 as const,
  environmentLayersCount: 150 as const,
  characterRigPartsCount: 168 as const,
  priorIconsCount: 16 as const,
  sha256SumsEntriesVerified: 335 as const,
  productionQualityApproved: 0 as const,
  flags: {
    ENGINEERING_PILOT_AUDIT_PASS_STORY_CUP_ONLY: true as const,
    V2_3_BATCH01_TECH_INTEGRATION_AUTHORIZED: true as const,
    ART_DIRECTOR_QA_HOLD: true as const,
    TECH_PREVIEW_NOT_ART_APPROVED: true as const,
    CONTENT_QA_REVIEW: true as const,
    PRODUCTION_RELEASE_HOLD: true as const,
  },
  companionIdentitiesFrozen: [
    "guoguo_squirrel",
    "beibei_otter",
    "tiantian_raccoon",
    "qiqi_deer",
  ] as const,
  geometrySharingDisclosures: {
    weatherStation:
      "18 SVG layer files contain 12 unique SHA-256 bodies: sunny and opt_out share identical 3-layer SVG geometry; cloudy and foggy share identical 3-layer SVG geometry; rainy and stormy have unique 3-layer SVG geometry. State differentiation for foggy/opt_out/intensity/dual-weather is provided by the React DOM & SVG stage adapter.",
    calmCorner:
      "8 SVG layer files contain 4 unique SHA-256 bodies: rest, inhale, and exhale share identical room.svg + breathing_visual.svg bytes, while paused has distinct room.svg + breathing_visual.svg bytes. Real breathing phase expansion/contraction and reduced-motion freeze are driven by the React stage adapter.",
    characterRigs:
      "168 SVG rig files (4 companions × 6 states × 7 parts) contain 35 unique SHA-256 bodies: each companion has unique torso, head, ears_or_tail, and 2 arm variants; eyes (3 variants) and mouth (4 variants) share geometry across companions.",
  },
} as const;

export const V2_3_COMPANION_RIG_Z_ORDER: readonly V2_3CompanionRigPart[] = [
  "ears_or_tail",
  "far_arm",
  "torso",
  "head",
  "eyes",
  "mouth",
  "near_arm",
] as const;

export const V2_3_WEATHER_LAYER_Z_ORDER: readonly V2_3WeatherLayerPart[] = [
  "backplate",
  "weather_actor",
  "front_effect",
] as const;

export const V2_3_CALM_LAYER_Z_ORDER: readonly V2_3CalmLayerPart[] = [
  "room",
  "breathing_visual",
] as const;

export const V2_3_WEATHER_STATION_ASSETS: readonly V2_3SceneAssetRecord<"weather_station", V2_3WeatherState, V2_3WeatherLayerPart>[] = [
  {
    "assetId": "weather_station/sunny/backplate",
    "category": "environment",
    "scene": "weather_station",
    "state": "sunny",
    "part": "backplate",
    "deliverySvg": "weather_station/sunny/backplate.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/sunny/backplate.svg",
    "sha256": "ce412151936007d9138a4726adee0b7b17e4d12eebd6beb65194a386b862f13e",
    "bytes": 1166,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/opt_out/backplate"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/sunny/weather_actor",
    "category": "environment",
    "scene": "weather_station",
    "state": "sunny",
    "part": "weather_actor",
    "deliverySvg": "weather_station/sunny/weather_actor.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/sunny/weather_actor.svg",
    "sha256": "78572c6cd080d4bb118f8dc892b5213d45e96995a92060d5b926552a0170a574",
    "bytes": 676,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/opt_out/weather_actor"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/sunny/front_effect",
    "category": "environment",
    "scene": "weather_station",
    "state": "sunny",
    "part": "front_effect",
    "deliverySvg": "weather_station/sunny/front_effect.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/sunny/front_effect.svg",
    "sha256": "56a8e0bcb6e170be616c192e85ee87832fcb44e4d22a4d10ddf7f1c7b44d533e",
    "bytes": 830,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/opt_out/front_effect"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/cloudy/backplate",
    "category": "environment",
    "scene": "weather_station",
    "state": "cloudy",
    "part": "backplate",
    "deliverySvg": "weather_station/cloudy/backplate.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/cloudy/backplate.svg",
    "sha256": "f651d72c97e382598c60636a4de7c6c1163a6c6e2b4f8fa28092781e421ec5af",
    "bytes": 1225,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/foggy/backplate"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/cloudy/weather_actor",
    "category": "environment",
    "scene": "weather_station",
    "state": "cloudy",
    "part": "weather_actor",
    "deliverySvg": "weather_station/cloudy/weather_actor.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/cloudy/weather_actor.svg",
    "sha256": "219711a0317f946de8e15b9e133fe5c0b9c44c9524d866ad3747a9744571b0a8",
    "bytes": 735,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/foggy/weather_actor"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/cloudy/front_effect",
    "category": "environment",
    "scene": "weather_station",
    "state": "cloudy",
    "part": "front_effect",
    "deliverySvg": "weather_station/cloudy/front_effect.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/cloudy/front_effect.svg",
    "sha256": "81baa443404d7d49c3ddfe2fec058d098e388e9178af66e7a4cf1000e011909a",
    "bytes": 889,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/foggy/front_effect"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/rainy/backplate",
    "category": "environment",
    "scene": "weather_station",
    "state": "rainy",
    "part": "backplate",
    "deliverySvg": "weather_station/rainy/backplate.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/rainy/backplate.svg",
    "sha256": "25f5f81bd4cf1d65e500e32d00bb441c6e793eb5013ae21cde31723bae4ac93f",
    "bytes": 3383,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/rainy/weather_actor",
    "category": "environment",
    "scene": "weather_station",
    "state": "rainy",
    "part": "weather_actor",
    "deliverySvg": "weather_station/rainy/weather_actor.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/rainy/weather_actor.svg",
    "sha256": "45a6dc0c1b363a7ef2d2874b609113ea1b5dbc457385f77e282a7757029f2280",
    "bytes": 2895,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/rainy/front_effect",
    "category": "environment",
    "scene": "weather_station",
    "state": "rainy",
    "part": "front_effect",
    "deliverySvg": "weather_station/rainy/front_effect.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/rainy/front_effect.svg",
    "sha256": "f5d6e29b345355f7445cd85afe391c88a2c4c165d298211d0848d90e76d5c5ba",
    "bytes": 3047,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/stormy/backplate",
    "category": "environment",
    "scene": "weather_station",
    "state": "stormy",
    "part": "backplate",
    "deliverySvg": "weather_station/stormy/backplate.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/stormy/backplate.svg",
    "sha256": "dd6704af2260dfadf5e94d9e49e5c6e43cf009c8c919547c52142697a541bf8f",
    "bytes": 3442,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/stormy/weather_actor",
    "category": "environment",
    "scene": "weather_station",
    "state": "stormy",
    "part": "weather_actor",
    "deliverySvg": "weather_station/stormy/weather_actor.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/stormy/weather_actor.svg",
    "sha256": "80c8da1dbf2e18701889c301c3f31e04db76cbb3e2a7622ce1e793e7ccd4ec97",
    "bytes": 2953,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/stormy/front_effect",
    "category": "environment",
    "scene": "weather_station",
    "state": "stormy",
    "part": "front_effect",
    "deliverySvg": "weather_station/stormy/front_effect.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/stormy/front_effect.svg",
    "sha256": "a86bb6a6fc7b7840e3d0c7491095ca337905b2d7494d501253c7dbb4ed4cef11",
    "bytes": 3115,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/foggy/backplate",
    "category": "environment",
    "scene": "weather_station",
    "state": "foggy",
    "part": "backplate",
    "deliverySvg": "weather_station/foggy/backplate.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/foggy/backplate.svg",
    "sha256": "f651d72c97e382598c60636a4de7c6c1163a6c6e2b4f8fa28092781e421ec5af",
    "bytes": 1225,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/cloudy/backplate"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/foggy/weather_actor",
    "category": "environment",
    "scene": "weather_station",
    "state": "foggy",
    "part": "weather_actor",
    "deliverySvg": "weather_station/foggy/weather_actor.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/foggy/weather_actor.svg",
    "sha256": "219711a0317f946de8e15b9e133fe5c0b9c44c9524d866ad3747a9744571b0a8",
    "bytes": 735,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/cloudy/weather_actor"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/foggy/front_effect",
    "category": "environment",
    "scene": "weather_station",
    "state": "foggy",
    "part": "front_effect",
    "deliverySvg": "weather_station/foggy/front_effect.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/foggy/front_effect.svg",
    "sha256": "81baa443404d7d49c3ddfe2fec058d098e388e9178af66e7a4cf1000e011909a",
    "bytes": 889,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/cloudy/front_effect"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/opt_out/backplate",
    "category": "environment",
    "scene": "weather_station",
    "state": "opt_out",
    "part": "backplate",
    "deliverySvg": "weather_station/opt_out/backplate.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/opt_out/backplate.svg",
    "sha256": "ce412151936007d9138a4726adee0b7b17e4d12eebd6beb65194a386b862f13e",
    "bytes": 1166,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/sunny/backplate"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/opt_out/weather_actor",
    "category": "environment",
    "scene": "weather_station",
    "state": "opt_out",
    "part": "weather_actor",
    "deliverySvg": "weather_station/opt_out/weather_actor.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/opt_out/weather_actor.svg",
    "sha256": "78572c6cd080d4bb118f8dc892b5213d45e96995a92060d5b926552a0170a574",
    "bytes": 676,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/sunny/weather_actor"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "weather_station/opt_out/front_effect",
    "category": "environment",
    "scene": "weather_station",
    "state": "opt_out",
    "part": "front_effect",
    "deliverySvg": "weather_station/opt_out/front_effect.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/weather_station/opt_out/front_effect.svg",
    "sha256": "56a8e0bcb6e170be616c192e85ee87832fcb44e4d22a4d10ddf7f1c7b44d533e",
    "bytes": 830,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "weather_station/sunny/front_effect"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  }
] as const;

export const V2_3_CALM_CORNER_ASSETS: readonly V2_3SceneAssetRecord<"calm_corner", V2_3CalmState, V2_3CalmLayerPart>[] = [
  {
    "assetId": "calm_corner/rest/room",
    "category": "environment",
    "scene": "calm_corner",
    "state": "rest",
    "part": "room",
    "deliverySvg": "calm_corner/rest/room.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/calm_corner/rest/room.svg",
    "sha256": "7238f29412b26f65a5e758bb5f526b4889d6ebff8e33c00f3c5191eee5472213",
    "bytes": 1655,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "calm_corner/inhale/room",
      "calm_corner/exhale/room"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "calm_corner/rest/breathing_visual",
    "category": "environment",
    "scene": "calm_corner",
    "state": "rest",
    "part": "breathing_visual",
    "deliverySvg": "calm_corner/rest/breathing_visual.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/calm_corner/rest/breathing_visual.svg",
    "sha256": "b8ac02c00187a4ae6769eff567e76434c1a9df2b606922847be6208e93bffc62",
    "bytes": 476,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "calm_corner/inhale/breathing_visual",
      "calm_corner/exhale/breathing_visual"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "calm_corner/inhale/room",
    "category": "environment",
    "scene": "calm_corner",
    "state": "inhale",
    "part": "room",
    "deliverySvg": "calm_corner/inhale/room.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/calm_corner/inhale/room.svg",
    "sha256": "7238f29412b26f65a5e758bb5f526b4889d6ebff8e33c00f3c5191eee5472213",
    "bytes": 1655,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "calm_corner/rest/room",
      "calm_corner/exhale/room"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "calm_corner/inhale/breathing_visual",
    "category": "environment",
    "scene": "calm_corner",
    "state": "inhale",
    "part": "breathing_visual",
    "deliverySvg": "calm_corner/inhale/breathing_visual.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/calm_corner/inhale/breathing_visual.svg",
    "sha256": "b8ac02c00187a4ae6769eff567e76434c1a9df2b606922847be6208e93bffc62",
    "bytes": 476,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "calm_corner/rest/breathing_visual",
      "calm_corner/exhale/breathing_visual"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "calm_corner/exhale/room",
    "category": "environment",
    "scene": "calm_corner",
    "state": "exhale",
    "part": "room",
    "deliverySvg": "calm_corner/exhale/room.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/calm_corner/exhale/room.svg",
    "sha256": "7238f29412b26f65a5e758bb5f526b4889d6ebff8e33c00f3c5191eee5472213",
    "bytes": 1655,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "calm_corner/rest/room",
      "calm_corner/inhale/room"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "calm_corner/exhale/breathing_visual",
    "category": "environment",
    "scene": "calm_corner",
    "state": "exhale",
    "part": "breathing_visual",
    "deliverySvg": "calm_corner/exhale/breathing_visual.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/calm_corner/exhale/breathing_visual.svg",
    "sha256": "b8ac02c00187a4ae6769eff567e76434c1a9df2b606922847be6208e93bffc62",
    "bytes": 476,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "calm_corner/rest/breathing_visual",
      "calm_corner/inhale/breathing_visual"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "calm_corner/paused/room",
    "category": "environment",
    "scene": "calm_corner",
    "state": "paused",
    "part": "room",
    "deliverySvg": "calm_corner/paused/room.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/calm_corner/paused/room.svg",
    "sha256": "5050b78c9d41ac0625d886547d3c8767fa4da6fbb8ea0646a08d1300d821aa3b",
    "bytes": 1716,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  },
  {
    "assetId": "calm_corner/paused/breathing_visual",
    "category": "environment",
    "scene": "calm_corner",
    "state": "paused",
    "part": "breathing_visual",
    "deliverySvg": "calm_corner/paused/breathing_visual.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/calm_corner/paused/breathing_visual.svg",
    "sha256": "418cc2bbe8166f3812062c82f45a65876717541e9ff1fe0fbf95bcfd2d17f8dc",
    "bytes": 537,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD"
  }
] as const;

export const V2_3_CHARACTER_RIG_ASSETS: readonly V2_3CharacterRigAssetRecord[] = [
  {
    "assetId": "characters/guoguo_squirrel/neutral/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "torso",
    "deliverySvg": "characters/guoguo_squirrel/neutral/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/neutral/torso.svg",
    "sha256": "72370f6203926ae29259e31f04ba5cd639c73150f8f94328d72d8e56e49343b4",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/greeting/torso",
      "characters/guoguo_squirrel/listening/torso",
      "characters/guoguo_squirrel/thinking/torso",
      "characters/guoguo_squirrel/comfort/torso",
      "characters/guoguo_squirrel/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/neutral/head",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "head",
    "deliverySvg": "characters/guoguo_squirrel/neutral/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/neutral/head.svg",
    "sha256": "b0b63f6b17369670327b8d64ee21b8f5e933ecd0912e2ab1cb627c29ab44c29d",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/greeting/head",
      "characters/guoguo_squirrel/listening/head",
      "characters/guoguo_squirrel/thinking/head",
      "characters/guoguo_squirrel/comfort/head",
      "characters/guoguo_squirrel/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/neutral/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "eyes",
    "deliverySvg": "characters/guoguo_squirrel/neutral/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/neutral/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/neutral/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "mouth",
    "deliverySvg": "characters/guoguo_squirrel/neutral/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/neutral/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/listening/mouth",
      "characters/guoguo_squirrel/celebrate/mouth",
      "characters/beibei_otter/neutral/mouth",
      "characters/beibei_otter/listening/mouth",
      "characters/beibei_otter/celebrate/mouth",
      "characters/tiantian_raccoon/neutral/mouth",
      "characters/tiantian_raccoon/listening/mouth",
      "characters/tiantian_raccoon/celebrate/mouth",
      "characters/qiqi_deer/neutral/mouth",
      "characters/qiqi_deer/listening/mouth",
      "characters/qiqi_deer/celebrate/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/neutral/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "near_arm",
    "deliverySvg": "characters/guoguo_squirrel/neutral/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/neutral/near_arm.svg",
    "sha256": "6640e84e34fd1f0b7e04e0a1957e525b79a66ba6a68667c33cea879afdea6822",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/listening/near_arm",
      "characters/guoguo_squirrel/thinking/near_arm",
      "characters/guoguo_squirrel/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/neutral/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "far_arm",
    "deliverySvg": "characters/guoguo_squirrel/neutral/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/neutral/far_arm.svg",
    "sha256": "4b2e99ee28d4ca73e4ed9b369ebddc67d39c341792a301f7a7408d0b0d7b50fa",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/greeting/far_arm",
      "characters/guoguo_squirrel/listening/far_arm",
      "characters/guoguo_squirrel/thinking/far_arm",
      "characters/guoguo_squirrel/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/neutral/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "ears_or_tail",
    "deliverySvg": "characters/guoguo_squirrel/neutral/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/neutral/ears_or_tail.svg",
    "sha256": "1e5cf942981682ddd56a31b53d72f448b69b1c9cc598152c6da55d9ba2c65162",
    "bytes": 366,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/greeting/ears_or_tail",
      "characters/guoguo_squirrel/listening/ears_or_tail",
      "characters/guoguo_squirrel/thinking/ears_or_tail",
      "characters/guoguo_squirrel/comfort/ears_or_tail",
      "characters/guoguo_squirrel/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/greeting/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "torso",
    "deliverySvg": "characters/guoguo_squirrel/greeting/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/greeting/torso.svg",
    "sha256": "72370f6203926ae29259e31f04ba5cd639c73150f8f94328d72d8e56e49343b4",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/torso",
      "characters/guoguo_squirrel/listening/torso",
      "characters/guoguo_squirrel/thinking/torso",
      "characters/guoguo_squirrel/comfort/torso",
      "characters/guoguo_squirrel/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/greeting/head",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "head",
    "deliverySvg": "characters/guoguo_squirrel/greeting/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/greeting/head.svg",
    "sha256": "b0b63f6b17369670327b8d64ee21b8f5e933ecd0912e2ab1cb627c29ab44c29d",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/head",
      "characters/guoguo_squirrel/listening/head",
      "characters/guoguo_squirrel/thinking/head",
      "characters/guoguo_squirrel/comfort/head",
      "characters/guoguo_squirrel/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/greeting/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "eyes",
    "deliverySvg": "characters/guoguo_squirrel/greeting/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/greeting/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/greeting/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "mouth",
    "deliverySvg": "characters/guoguo_squirrel/greeting/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/greeting/mouth.svg",
    "sha256": "c8e9c22c090f963010fbb2ce918c9542a3da700f57d3f69bd2d5764478a7d0a2",
    "bytes": 191,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/greeting/mouth",
      "characters/tiantian_raccoon/greeting/mouth",
      "characters/qiqi_deer/greeting/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/greeting/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "near_arm",
    "deliverySvg": "characters/guoguo_squirrel/greeting/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/greeting/near_arm.svg",
    "sha256": "11d24d4240eaa73fc31fe28dfdfb3b04caa2323cd2af059c84cf029821dc96b0",
    "bytes": 236,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/celebrate/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/greeting/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "far_arm",
    "deliverySvg": "characters/guoguo_squirrel/greeting/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/greeting/far_arm.svg",
    "sha256": "4b2e99ee28d4ca73e4ed9b369ebddc67d39c341792a301f7a7408d0b0d7b50fa",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/far_arm",
      "characters/guoguo_squirrel/listening/far_arm",
      "characters/guoguo_squirrel/thinking/far_arm",
      "characters/guoguo_squirrel/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/greeting/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "ears_or_tail",
    "deliverySvg": "characters/guoguo_squirrel/greeting/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/greeting/ears_or_tail.svg",
    "sha256": "1e5cf942981682ddd56a31b53d72f448b69b1c9cc598152c6da55d9ba2c65162",
    "bytes": 366,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/ears_or_tail",
      "characters/guoguo_squirrel/listening/ears_or_tail",
      "characters/guoguo_squirrel/thinking/ears_or_tail",
      "characters/guoguo_squirrel/comfort/ears_or_tail",
      "characters/guoguo_squirrel/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/listening/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "torso",
    "deliverySvg": "characters/guoguo_squirrel/listening/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/listening/torso.svg",
    "sha256": "72370f6203926ae29259e31f04ba5cd639c73150f8f94328d72d8e56e49343b4",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/torso",
      "characters/guoguo_squirrel/greeting/torso",
      "characters/guoguo_squirrel/thinking/torso",
      "characters/guoguo_squirrel/comfort/torso",
      "characters/guoguo_squirrel/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/listening/head",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "head",
    "deliverySvg": "characters/guoguo_squirrel/listening/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/listening/head.svg",
    "sha256": "b0b63f6b17369670327b8d64ee21b8f5e933ecd0912e2ab1cb627c29ab44c29d",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/head",
      "characters/guoguo_squirrel/greeting/head",
      "characters/guoguo_squirrel/thinking/head",
      "characters/guoguo_squirrel/comfort/head",
      "characters/guoguo_squirrel/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/listening/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "eyes",
    "deliverySvg": "characters/guoguo_squirrel/listening/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/listening/eyes.svg",
    "sha256": "1062d1a7afd2a16bd811310be93bc4c874538fbde0b87d5023169c75822cdd2c",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/listening/eyes",
      "characters/tiantian_raccoon/listening/eyes",
      "characters/qiqi_deer/listening/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/listening/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "mouth",
    "deliverySvg": "characters/guoguo_squirrel/listening/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/listening/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/mouth",
      "characters/guoguo_squirrel/celebrate/mouth",
      "characters/beibei_otter/neutral/mouth",
      "characters/beibei_otter/listening/mouth",
      "characters/beibei_otter/celebrate/mouth",
      "characters/tiantian_raccoon/neutral/mouth",
      "characters/tiantian_raccoon/listening/mouth",
      "characters/tiantian_raccoon/celebrate/mouth",
      "characters/qiqi_deer/neutral/mouth",
      "characters/qiqi_deer/listening/mouth",
      "characters/qiqi_deer/celebrate/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/listening/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "near_arm",
    "deliverySvg": "characters/guoguo_squirrel/listening/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/listening/near_arm.svg",
    "sha256": "6640e84e34fd1f0b7e04e0a1957e525b79a66ba6a68667c33cea879afdea6822",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/near_arm",
      "characters/guoguo_squirrel/thinking/near_arm",
      "characters/guoguo_squirrel/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/listening/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "far_arm",
    "deliverySvg": "characters/guoguo_squirrel/listening/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/listening/far_arm.svg",
    "sha256": "4b2e99ee28d4ca73e4ed9b369ebddc67d39c341792a301f7a7408d0b0d7b50fa",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/far_arm",
      "characters/guoguo_squirrel/greeting/far_arm",
      "characters/guoguo_squirrel/thinking/far_arm",
      "characters/guoguo_squirrel/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/listening/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "ears_or_tail",
    "deliverySvg": "characters/guoguo_squirrel/listening/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/listening/ears_or_tail.svg",
    "sha256": "1e5cf942981682ddd56a31b53d72f448b69b1c9cc598152c6da55d9ba2c65162",
    "bytes": 366,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/ears_or_tail",
      "characters/guoguo_squirrel/greeting/ears_or_tail",
      "characters/guoguo_squirrel/thinking/ears_or_tail",
      "characters/guoguo_squirrel/comfort/ears_or_tail",
      "characters/guoguo_squirrel/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/thinking/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "torso",
    "deliverySvg": "characters/guoguo_squirrel/thinking/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/thinking/torso.svg",
    "sha256": "72370f6203926ae29259e31f04ba5cd639c73150f8f94328d72d8e56e49343b4",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/torso",
      "characters/guoguo_squirrel/greeting/torso",
      "characters/guoguo_squirrel/listening/torso",
      "characters/guoguo_squirrel/comfort/torso",
      "characters/guoguo_squirrel/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/thinking/head",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "head",
    "deliverySvg": "characters/guoguo_squirrel/thinking/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/thinking/head.svg",
    "sha256": "b0b63f6b17369670327b8d64ee21b8f5e933ecd0912e2ab1cb627c29ab44c29d",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/head",
      "characters/guoguo_squirrel/greeting/head",
      "characters/guoguo_squirrel/listening/head",
      "characters/guoguo_squirrel/comfort/head",
      "characters/guoguo_squirrel/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/thinking/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "eyes",
    "deliverySvg": "characters/guoguo_squirrel/thinking/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/thinking/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/thinking/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "mouth",
    "deliverySvg": "characters/guoguo_squirrel/thinking/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/thinking/mouth.svg",
    "sha256": "0619c999a62701c18791bff97b13010702315e4a854610a6b990c0774f405138",
    "bytes": 189,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/thinking/mouth",
      "characters/tiantian_raccoon/thinking/mouth",
      "characters/qiqi_deer/thinking/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/thinking/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "near_arm",
    "deliverySvg": "characters/guoguo_squirrel/thinking/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/thinking/near_arm.svg",
    "sha256": "6640e84e34fd1f0b7e04e0a1957e525b79a66ba6a68667c33cea879afdea6822",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/near_arm",
      "characters/guoguo_squirrel/listening/near_arm",
      "characters/guoguo_squirrel/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/thinking/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "far_arm",
    "deliverySvg": "characters/guoguo_squirrel/thinking/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/thinking/far_arm.svg",
    "sha256": "4b2e99ee28d4ca73e4ed9b369ebddc67d39c341792a301f7a7408d0b0d7b50fa",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/far_arm",
      "characters/guoguo_squirrel/greeting/far_arm",
      "characters/guoguo_squirrel/listening/far_arm",
      "characters/guoguo_squirrel/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/thinking/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "ears_or_tail",
    "deliverySvg": "characters/guoguo_squirrel/thinking/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/thinking/ears_or_tail.svg",
    "sha256": "1e5cf942981682ddd56a31b53d72f448b69b1c9cc598152c6da55d9ba2c65162",
    "bytes": 366,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/ears_or_tail",
      "characters/guoguo_squirrel/greeting/ears_or_tail",
      "characters/guoguo_squirrel/listening/ears_or_tail",
      "characters/guoguo_squirrel/comfort/ears_or_tail",
      "characters/guoguo_squirrel/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/comfort/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "torso",
    "deliverySvg": "characters/guoguo_squirrel/comfort/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/comfort/torso.svg",
    "sha256": "72370f6203926ae29259e31f04ba5cd639c73150f8f94328d72d8e56e49343b4",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/torso",
      "characters/guoguo_squirrel/greeting/torso",
      "characters/guoguo_squirrel/listening/torso",
      "characters/guoguo_squirrel/thinking/torso",
      "characters/guoguo_squirrel/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/comfort/head",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "head",
    "deliverySvg": "characters/guoguo_squirrel/comfort/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/comfort/head.svg",
    "sha256": "b0b63f6b17369670327b8d64ee21b8f5e933ecd0912e2ab1cb627c29ab44c29d",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/head",
      "characters/guoguo_squirrel/greeting/head",
      "characters/guoguo_squirrel/listening/head",
      "characters/guoguo_squirrel/thinking/head",
      "characters/guoguo_squirrel/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/comfort/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "eyes",
    "deliverySvg": "characters/guoguo_squirrel/comfort/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/comfort/eyes.svg",
    "sha256": "649e1d51a6e9d1a0f56a7bb787865c170724f0e635c6cfee4a5bb39dae119037",
    "bytes": 262,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/comfort/eyes",
      "characters/tiantian_raccoon/comfort/eyes",
      "characters/qiqi_deer/comfort/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/comfort/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "mouth",
    "deliverySvg": "characters/guoguo_squirrel/comfort/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/comfort/mouth.svg",
    "sha256": "86a307ab2910f6e1545f8ab38da2ccb74bf7a3ecee8b470689a57b1a0ed4ce29",
    "bytes": 214,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/comfort/mouth",
      "characters/tiantian_raccoon/comfort/mouth",
      "characters/qiqi_deer/comfort/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/comfort/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "near_arm",
    "deliverySvg": "characters/guoguo_squirrel/comfort/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/comfort/near_arm.svg",
    "sha256": "6640e84e34fd1f0b7e04e0a1957e525b79a66ba6a68667c33cea879afdea6822",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/near_arm",
      "characters/guoguo_squirrel/listening/near_arm",
      "characters/guoguo_squirrel/thinking/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/comfort/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "far_arm",
    "deliverySvg": "characters/guoguo_squirrel/comfort/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/comfort/far_arm.svg",
    "sha256": "4b2e99ee28d4ca73e4ed9b369ebddc67d39c341792a301f7a7408d0b0d7b50fa",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/far_arm",
      "characters/guoguo_squirrel/greeting/far_arm",
      "characters/guoguo_squirrel/listening/far_arm",
      "characters/guoguo_squirrel/thinking/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/comfort/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "ears_or_tail",
    "deliverySvg": "characters/guoguo_squirrel/comfort/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/comfort/ears_or_tail.svg",
    "sha256": "1e5cf942981682ddd56a31b53d72f448b69b1c9cc598152c6da55d9ba2c65162",
    "bytes": 366,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/ears_or_tail",
      "characters/guoguo_squirrel/greeting/ears_or_tail",
      "characters/guoguo_squirrel/listening/ears_or_tail",
      "characters/guoguo_squirrel/thinking/ears_or_tail",
      "characters/guoguo_squirrel/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/celebrate/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "torso",
    "deliverySvg": "characters/guoguo_squirrel/celebrate/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/celebrate/torso.svg",
    "sha256": "72370f6203926ae29259e31f04ba5cd639c73150f8f94328d72d8e56e49343b4",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/torso",
      "characters/guoguo_squirrel/greeting/torso",
      "characters/guoguo_squirrel/listening/torso",
      "characters/guoguo_squirrel/thinking/torso",
      "characters/guoguo_squirrel/comfort/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/celebrate/head",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "head",
    "deliverySvg": "characters/guoguo_squirrel/celebrate/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/celebrate/head.svg",
    "sha256": "b0b63f6b17369670327b8d64ee21b8f5e933ecd0912e2ab1cb627c29ab44c29d",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/head",
      "characters/guoguo_squirrel/greeting/head",
      "characters/guoguo_squirrel/listening/head",
      "characters/guoguo_squirrel/thinking/head",
      "characters/guoguo_squirrel/comfort/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/celebrate/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "eyes",
    "deliverySvg": "characters/guoguo_squirrel/celebrate/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/celebrate/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/celebrate/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "mouth",
    "deliverySvg": "characters/guoguo_squirrel/celebrate/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/celebrate/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/mouth",
      "characters/guoguo_squirrel/listening/mouth",
      "characters/beibei_otter/neutral/mouth",
      "characters/beibei_otter/listening/mouth",
      "characters/beibei_otter/celebrate/mouth",
      "characters/tiantian_raccoon/neutral/mouth",
      "characters/tiantian_raccoon/listening/mouth",
      "characters/tiantian_raccoon/celebrate/mouth",
      "characters/qiqi_deer/neutral/mouth",
      "characters/qiqi_deer/listening/mouth",
      "characters/qiqi_deer/celebrate/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/celebrate/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "near_arm",
    "deliverySvg": "characters/guoguo_squirrel/celebrate/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/celebrate/near_arm.svg",
    "sha256": "11d24d4240eaa73fc31fe28dfdfb3b04caa2323cd2af059c84cf029821dc96b0",
    "bytes": 236,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/greeting/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/celebrate/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "far_arm",
    "deliverySvg": "characters/guoguo_squirrel/celebrate/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/celebrate/far_arm.svg",
    "sha256": "4450224dfb78a989c32c2d5b4e5227c4438933afad3fc8ac2422e7472ece49f9",
    "bytes": 238,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/guoguo_squirrel/celebrate/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "ears_or_tail",
    "deliverySvg": "characters/guoguo_squirrel/celebrate/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/guoguo_squirrel/celebrate/ears_or_tail.svg",
    "sha256": "1e5cf942981682ddd56a31b53d72f448b69b1c9cc598152c6da55d9ba2c65162",
    "bytes": 366,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/ears_or_tail",
      "characters/guoguo_squirrel/greeting/ears_or_tail",
      "characters/guoguo_squirrel/listening/ears_or_tail",
      "characters/guoguo_squirrel/thinking/ears_or_tail",
      "characters/guoguo_squirrel/comfort/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "guoguo_squirrel"
  },
  {
    "assetId": "characters/beibei_otter/neutral/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "torso",
    "deliverySvg": "characters/beibei_otter/neutral/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/neutral/torso.svg",
    "sha256": "f3805c370be82e6d414a6f3c5dab4dbbc3748c85ff0f8b66c715b5db0a19916c",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/greeting/torso",
      "characters/beibei_otter/listening/torso",
      "characters/beibei_otter/thinking/torso",
      "characters/beibei_otter/comfort/torso",
      "characters/beibei_otter/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/neutral/head",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "head",
    "deliverySvg": "characters/beibei_otter/neutral/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/neutral/head.svg",
    "sha256": "9c1907b23fa195fee2273e9db9db2cfe9a116511eed2255dd917420a76830511",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/greeting/head",
      "characters/beibei_otter/listening/head",
      "characters/beibei_otter/thinking/head",
      "characters/beibei_otter/comfort/head",
      "characters/beibei_otter/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/neutral/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "eyes",
    "deliverySvg": "characters/beibei_otter/neutral/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/neutral/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/neutral/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "mouth",
    "deliverySvg": "characters/beibei_otter/neutral/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/neutral/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/mouth",
      "characters/guoguo_squirrel/listening/mouth",
      "characters/guoguo_squirrel/celebrate/mouth",
      "characters/beibei_otter/listening/mouth",
      "characters/beibei_otter/celebrate/mouth",
      "characters/tiantian_raccoon/neutral/mouth",
      "characters/tiantian_raccoon/listening/mouth",
      "characters/tiantian_raccoon/celebrate/mouth",
      "characters/qiqi_deer/neutral/mouth",
      "characters/qiqi_deer/listening/mouth",
      "characters/qiqi_deer/celebrate/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/neutral/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "near_arm",
    "deliverySvg": "characters/beibei_otter/neutral/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/neutral/near_arm.svg",
    "sha256": "0616702a6bc77f62a808db538c90bef87d4f72d509c5b4bf71c5d2639996fc33",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/listening/near_arm",
      "characters/beibei_otter/thinking/near_arm",
      "characters/beibei_otter/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/neutral/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "far_arm",
    "deliverySvg": "characters/beibei_otter/neutral/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/neutral/far_arm.svg",
    "sha256": "558db9ecf45f4073a56f72cdabc9db694a4eb86c883e544bbad4af4c2768ce31",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/greeting/far_arm",
      "characters/beibei_otter/listening/far_arm",
      "characters/beibei_otter/thinking/far_arm",
      "characters/beibei_otter/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/neutral/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "ears_or_tail",
    "deliverySvg": "characters/beibei_otter/neutral/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/neutral/ears_or_tail.svg",
    "sha256": "874e60cae6e2bd97bc6d53921c38a2e3727589a548fedd98734c44a7aea8b7db",
    "bytes": 357,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/greeting/ears_or_tail",
      "characters/beibei_otter/listening/ears_or_tail",
      "characters/beibei_otter/thinking/ears_or_tail",
      "characters/beibei_otter/comfort/ears_or_tail",
      "characters/beibei_otter/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/greeting/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "torso",
    "deliverySvg": "characters/beibei_otter/greeting/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/greeting/torso.svg",
    "sha256": "f3805c370be82e6d414a6f3c5dab4dbbc3748c85ff0f8b66c715b5db0a19916c",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/torso",
      "characters/beibei_otter/listening/torso",
      "characters/beibei_otter/thinking/torso",
      "characters/beibei_otter/comfort/torso",
      "characters/beibei_otter/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/greeting/head",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "head",
    "deliverySvg": "characters/beibei_otter/greeting/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/greeting/head.svg",
    "sha256": "9c1907b23fa195fee2273e9db9db2cfe9a116511eed2255dd917420a76830511",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/head",
      "characters/beibei_otter/listening/head",
      "characters/beibei_otter/thinking/head",
      "characters/beibei_otter/comfort/head",
      "characters/beibei_otter/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/greeting/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "eyes",
    "deliverySvg": "characters/beibei_otter/greeting/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/greeting/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/greeting/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "mouth",
    "deliverySvg": "characters/beibei_otter/greeting/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/greeting/mouth.svg",
    "sha256": "c8e9c22c090f963010fbb2ce918c9542a3da700f57d3f69bd2d5764478a7d0a2",
    "bytes": 191,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/greeting/mouth",
      "characters/tiantian_raccoon/greeting/mouth",
      "characters/qiqi_deer/greeting/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/greeting/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "near_arm",
    "deliverySvg": "characters/beibei_otter/greeting/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/greeting/near_arm.svg",
    "sha256": "d39f72f07c41ed76744c30a6943645aa58aa51b4c73583f9d80d2e906b02c0dd",
    "bytes": 236,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/celebrate/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/greeting/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "far_arm",
    "deliverySvg": "characters/beibei_otter/greeting/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/greeting/far_arm.svg",
    "sha256": "558db9ecf45f4073a56f72cdabc9db694a4eb86c883e544bbad4af4c2768ce31",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/far_arm",
      "characters/beibei_otter/listening/far_arm",
      "characters/beibei_otter/thinking/far_arm",
      "characters/beibei_otter/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/greeting/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "ears_or_tail",
    "deliverySvg": "characters/beibei_otter/greeting/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/greeting/ears_or_tail.svg",
    "sha256": "874e60cae6e2bd97bc6d53921c38a2e3727589a548fedd98734c44a7aea8b7db",
    "bytes": 357,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/ears_or_tail",
      "characters/beibei_otter/listening/ears_or_tail",
      "characters/beibei_otter/thinking/ears_or_tail",
      "characters/beibei_otter/comfort/ears_or_tail",
      "characters/beibei_otter/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/listening/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "torso",
    "deliverySvg": "characters/beibei_otter/listening/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/listening/torso.svg",
    "sha256": "f3805c370be82e6d414a6f3c5dab4dbbc3748c85ff0f8b66c715b5db0a19916c",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/torso",
      "characters/beibei_otter/greeting/torso",
      "characters/beibei_otter/thinking/torso",
      "characters/beibei_otter/comfort/torso",
      "characters/beibei_otter/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/listening/head",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "head",
    "deliverySvg": "characters/beibei_otter/listening/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/listening/head.svg",
    "sha256": "9c1907b23fa195fee2273e9db9db2cfe9a116511eed2255dd917420a76830511",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/head",
      "characters/beibei_otter/greeting/head",
      "characters/beibei_otter/thinking/head",
      "characters/beibei_otter/comfort/head",
      "characters/beibei_otter/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/listening/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "eyes",
    "deliverySvg": "characters/beibei_otter/listening/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/listening/eyes.svg",
    "sha256": "1062d1a7afd2a16bd811310be93bc4c874538fbde0b87d5023169c75822cdd2c",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/listening/eyes",
      "characters/tiantian_raccoon/listening/eyes",
      "characters/qiqi_deer/listening/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/listening/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "mouth",
    "deliverySvg": "characters/beibei_otter/listening/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/listening/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/mouth",
      "characters/guoguo_squirrel/listening/mouth",
      "characters/guoguo_squirrel/celebrate/mouth",
      "characters/beibei_otter/neutral/mouth",
      "characters/beibei_otter/celebrate/mouth",
      "characters/tiantian_raccoon/neutral/mouth",
      "characters/tiantian_raccoon/listening/mouth",
      "characters/tiantian_raccoon/celebrate/mouth",
      "characters/qiqi_deer/neutral/mouth",
      "characters/qiqi_deer/listening/mouth",
      "characters/qiqi_deer/celebrate/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/listening/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "near_arm",
    "deliverySvg": "characters/beibei_otter/listening/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/listening/near_arm.svg",
    "sha256": "0616702a6bc77f62a808db538c90bef87d4f72d509c5b4bf71c5d2639996fc33",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/near_arm",
      "characters/beibei_otter/thinking/near_arm",
      "characters/beibei_otter/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/listening/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "far_arm",
    "deliverySvg": "characters/beibei_otter/listening/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/listening/far_arm.svg",
    "sha256": "558db9ecf45f4073a56f72cdabc9db694a4eb86c883e544bbad4af4c2768ce31",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/far_arm",
      "characters/beibei_otter/greeting/far_arm",
      "characters/beibei_otter/thinking/far_arm",
      "characters/beibei_otter/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/listening/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "ears_or_tail",
    "deliverySvg": "characters/beibei_otter/listening/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/listening/ears_or_tail.svg",
    "sha256": "874e60cae6e2bd97bc6d53921c38a2e3727589a548fedd98734c44a7aea8b7db",
    "bytes": 357,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/ears_or_tail",
      "characters/beibei_otter/greeting/ears_or_tail",
      "characters/beibei_otter/thinking/ears_or_tail",
      "characters/beibei_otter/comfort/ears_or_tail",
      "characters/beibei_otter/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/thinking/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "torso",
    "deliverySvg": "characters/beibei_otter/thinking/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/thinking/torso.svg",
    "sha256": "f3805c370be82e6d414a6f3c5dab4dbbc3748c85ff0f8b66c715b5db0a19916c",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/torso",
      "characters/beibei_otter/greeting/torso",
      "characters/beibei_otter/listening/torso",
      "characters/beibei_otter/comfort/torso",
      "characters/beibei_otter/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/thinking/head",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "head",
    "deliverySvg": "characters/beibei_otter/thinking/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/thinking/head.svg",
    "sha256": "9c1907b23fa195fee2273e9db9db2cfe9a116511eed2255dd917420a76830511",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/head",
      "characters/beibei_otter/greeting/head",
      "characters/beibei_otter/listening/head",
      "characters/beibei_otter/comfort/head",
      "characters/beibei_otter/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/thinking/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "eyes",
    "deliverySvg": "characters/beibei_otter/thinking/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/thinking/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/thinking/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "mouth",
    "deliverySvg": "characters/beibei_otter/thinking/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/thinking/mouth.svg",
    "sha256": "0619c999a62701c18791bff97b13010702315e4a854610a6b990c0774f405138",
    "bytes": 189,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/thinking/mouth",
      "characters/tiantian_raccoon/thinking/mouth",
      "characters/qiqi_deer/thinking/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/thinking/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "near_arm",
    "deliverySvg": "characters/beibei_otter/thinking/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/thinking/near_arm.svg",
    "sha256": "0616702a6bc77f62a808db538c90bef87d4f72d509c5b4bf71c5d2639996fc33",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/near_arm",
      "characters/beibei_otter/listening/near_arm",
      "characters/beibei_otter/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/thinking/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "far_arm",
    "deliverySvg": "characters/beibei_otter/thinking/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/thinking/far_arm.svg",
    "sha256": "558db9ecf45f4073a56f72cdabc9db694a4eb86c883e544bbad4af4c2768ce31",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/far_arm",
      "characters/beibei_otter/greeting/far_arm",
      "characters/beibei_otter/listening/far_arm",
      "characters/beibei_otter/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/thinking/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "ears_or_tail",
    "deliverySvg": "characters/beibei_otter/thinking/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/thinking/ears_or_tail.svg",
    "sha256": "874e60cae6e2bd97bc6d53921c38a2e3727589a548fedd98734c44a7aea8b7db",
    "bytes": 357,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/ears_or_tail",
      "characters/beibei_otter/greeting/ears_or_tail",
      "characters/beibei_otter/listening/ears_or_tail",
      "characters/beibei_otter/comfort/ears_or_tail",
      "characters/beibei_otter/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/comfort/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "torso",
    "deliverySvg": "characters/beibei_otter/comfort/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/comfort/torso.svg",
    "sha256": "f3805c370be82e6d414a6f3c5dab4dbbc3748c85ff0f8b66c715b5db0a19916c",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/torso",
      "characters/beibei_otter/greeting/torso",
      "characters/beibei_otter/listening/torso",
      "characters/beibei_otter/thinking/torso",
      "characters/beibei_otter/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/comfort/head",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "head",
    "deliverySvg": "characters/beibei_otter/comfort/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/comfort/head.svg",
    "sha256": "9c1907b23fa195fee2273e9db9db2cfe9a116511eed2255dd917420a76830511",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/head",
      "characters/beibei_otter/greeting/head",
      "characters/beibei_otter/listening/head",
      "characters/beibei_otter/thinking/head",
      "characters/beibei_otter/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/comfort/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "eyes",
    "deliverySvg": "characters/beibei_otter/comfort/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/comfort/eyes.svg",
    "sha256": "649e1d51a6e9d1a0f56a7bb787865c170724f0e635c6cfee4a5bb39dae119037",
    "bytes": 262,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/comfort/eyes",
      "characters/tiantian_raccoon/comfort/eyes",
      "characters/qiqi_deer/comfort/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/comfort/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "mouth",
    "deliverySvg": "characters/beibei_otter/comfort/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/comfort/mouth.svg",
    "sha256": "86a307ab2910f6e1545f8ab38da2ccb74bf7a3ecee8b470689a57b1a0ed4ce29",
    "bytes": 214,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/comfort/mouth",
      "characters/tiantian_raccoon/comfort/mouth",
      "characters/qiqi_deer/comfort/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/comfort/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "near_arm",
    "deliverySvg": "characters/beibei_otter/comfort/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/comfort/near_arm.svg",
    "sha256": "0616702a6bc77f62a808db538c90bef87d4f72d509c5b4bf71c5d2639996fc33",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/near_arm",
      "characters/beibei_otter/listening/near_arm",
      "characters/beibei_otter/thinking/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/comfort/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "far_arm",
    "deliverySvg": "characters/beibei_otter/comfort/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/comfort/far_arm.svg",
    "sha256": "558db9ecf45f4073a56f72cdabc9db694a4eb86c883e544bbad4af4c2768ce31",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/far_arm",
      "characters/beibei_otter/greeting/far_arm",
      "characters/beibei_otter/listening/far_arm",
      "characters/beibei_otter/thinking/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/comfort/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "ears_or_tail",
    "deliverySvg": "characters/beibei_otter/comfort/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/comfort/ears_or_tail.svg",
    "sha256": "874e60cae6e2bd97bc6d53921c38a2e3727589a548fedd98734c44a7aea8b7db",
    "bytes": 357,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/ears_or_tail",
      "characters/beibei_otter/greeting/ears_or_tail",
      "characters/beibei_otter/listening/ears_or_tail",
      "characters/beibei_otter/thinking/ears_or_tail",
      "characters/beibei_otter/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/celebrate/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "torso",
    "deliverySvg": "characters/beibei_otter/celebrate/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/celebrate/torso.svg",
    "sha256": "f3805c370be82e6d414a6f3c5dab4dbbc3748c85ff0f8b66c715b5db0a19916c",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/torso",
      "characters/beibei_otter/greeting/torso",
      "characters/beibei_otter/listening/torso",
      "characters/beibei_otter/thinking/torso",
      "characters/beibei_otter/comfort/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/celebrate/head",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "head",
    "deliverySvg": "characters/beibei_otter/celebrate/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/celebrate/head.svg",
    "sha256": "9c1907b23fa195fee2273e9db9db2cfe9a116511eed2255dd917420a76830511",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/head",
      "characters/beibei_otter/greeting/head",
      "characters/beibei_otter/listening/head",
      "characters/beibei_otter/thinking/head",
      "characters/beibei_otter/comfort/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/celebrate/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "eyes",
    "deliverySvg": "characters/beibei_otter/celebrate/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/celebrate/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/celebrate/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "mouth",
    "deliverySvg": "characters/beibei_otter/celebrate/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/celebrate/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/mouth",
      "characters/guoguo_squirrel/listening/mouth",
      "characters/guoguo_squirrel/celebrate/mouth",
      "characters/beibei_otter/neutral/mouth",
      "characters/beibei_otter/listening/mouth",
      "characters/tiantian_raccoon/neutral/mouth",
      "characters/tiantian_raccoon/listening/mouth",
      "characters/tiantian_raccoon/celebrate/mouth",
      "characters/qiqi_deer/neutral/mouth",
      "characters/qiqi_deer/listening/mouth",
      "characters/qiqi_deer/celebrate/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/celebrate/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "near_arm",
    "deliverySvg": "characters/beibei_otter/celebrate/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/celebrate/near_arm.svg",
    "sha256": "d39f72f07c41ed76744c30a6943645aa58aa51b4c73583f9d80d2e906b02c0dd",
    "bytes": 236,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/greeting/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/celebrate/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "far_arm",
    "deliverySvg": "characters/beibei_otter/celebrate/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/celebrate/far_arm.svg",
    "sha256": "af5eba3a91140995a143720641c244f0d598eaf216983eac01be78339d0a5f17",
    "bytes": 238,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/beibei_otter/celebrate/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "ears_or_tail",
    "deliverySvg": "characters/beibei_otter/celebrate/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/beibei_otter/celebrate/ears_or_tail.svg",
    "sha256": "874e60cae6e2bd97bc6d53921c38a2e3727589a548fedd98734c44a7aea8b7db",
    "bytes": 357,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/beibei_otter/neutral/ears_or_tail",
      "characters/beibei_otter/greeting/ears_or_tail",
      "characters/beibei_otter/listening/ears_or_tail",
      "characters/beibei_otter/thinking/ears_or_tail",
      "characters/beibei_otter/comfort/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "beibei_otter"
  },
  {
    "assetId": "characters/tiantian_raccoon/neutral/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "torso",
    "deliverySvg": "characters/tiantian_raccoon/neutral/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/neutral/torso.svg",
    "sha256": "39a458bd82c3675e652884cb5c22f79ddd9c472b0da59f18c6888fc453f8588f",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/greeting/torso",
      "characters/tiantian_raccoon/listening/torso",
      "characters/tiantian_raccoon/thinking/torso",
      "characters/tiantian_raccoon/comfort/torso",
      "characters/tiantian_raccoon/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/neutral/head",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "head",
    "deliverySvg": "characters/tiantian_raccoon/neutral/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/neutral/head.svg",
    "sha256": "298c5d722a53ce08688f9a2bff1726af1ec76ef3abdf9aa90ec1e0f621ff2e37",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/greeting/head",
      "characters/tiantian_raccoon/listening/head",
      "characters/tiantian_raccoon/thinking/head",
      "characters/tiantian_raccoon/comfort/head",
      "characters/tiantian_raccoon/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/neutral/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "eyes",
    "deliverySvg": "characters/tiantian_raccoon/neutral/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/neutral/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/neutral/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "mouth",
    "deliverySvg": "characters/tiantian_raccoon/neutral/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/neutral/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/mouth",
      "characters/guoguo_squirrel/listening/mouth",
      "characters/guoguo_squirrel/celebrate/mouth",
      "characters/beibei_otter/neutral/mouth",
      "characters/beibei_otter/listening/mouth",
      "characters/beibei_otter/celebrate/mouth",
      "characters/tiantian_raccoon/listening/mouth",
      "characters/tiantian_raccoon/celebrate/mouth",
      "characters/qiqi_deer/neutral/mouth",
      "characters/qiqi_deer/listening/mouth",
      "characters/qiqi_deer/celebrate/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/neutral/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "near_arm",
    "deliverySvg": "characters/tiantian_raccoon/neutral/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/neutral/near_arm.svg",
    "sha256": "f822f16f59ce60d0f21556fb57ca80137951247acb5684eb95aede0c3f534e83",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/listening/near_arm",
      "characters/tiantian_raccoon/thinking/near_arm",
      "characters/tiantian_raccoon/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/neutral/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "far_arm",
    "deliverySvg": "characters/tiantian_raccoon/neutral/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/neutral/far_arm.svg",
    "sha256": "2282d9221e2526fa5b7b13e8c05821b1abcaba425e6724b04356a68e4222a0eb",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/greeting/far_arm",
      "characters/tiantian_raccoon/listening/far_arm",
      "characters/tiantian_raccoon/thinking/far_arm",
      "characters/tiantian_raccoon/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/neutral/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "ears_or_tail",
    "deliverySvg": "characters/tiantian_raccoon/neutral/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/neutral/ears_or_tail.svg",
    "sha256": "ffa1274618edeaf5f22f2a713003d9b4905c47e7aed5065f662a1f0b2eb2cb16",
    "bytes": 338,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/greeting/ears_or_tail",
      "characters/tiantian_raccoon/listening/ears_or_tail",
      "characters/tiantian_raccoon/thinking/ears_or_tail",
      "characters/tiantian_raccoon/comfort/ears_or_tail",
      "characters/tiantian_raccoon/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/greeting/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "torso",
    "deliverySvg": "characters/tiantian_raccoon/greeting/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/greeting/torso.svg",
    "sha256": "39a458bd82c3675e652884cb5c22f79ddd9c472b0da59f18c6888fc453f8588f",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/torso",
      "characters/tiantian_raccoon/listening/torso",
      "characters/tiantian_raccoon/thinking/torso",
      "characters/tiantian_raccoon/comfort/torso",
      "characters/tiantian_raccoon/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/greeting/head",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "head",
    "deliverySvg": "characters/tiantian_raccoon/greeting/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/greeting/head.svg",
    "sha256": "298c5d722a53ce08688f9a2bff1726af1ec76ef3abdf9aa90ec1e0f621ff2e37",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/head",
      "characters/tiantian_raccoon/listening/head",
      "characters/tiantian_raccoon/thinking/head",
      "characters/tiantian_raccoon/comfort/head",
      "characters/tiantian_raccoon/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/greeting/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "eyes",
    "deliverySvg": "characters/tiantian_raccoon/greeting/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/greeting/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/greeting/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "mouth",
    "deliverySvg": "characters/tiantian_raccoon/greeting/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/greeting/mouth.svg",
    "sha256": "c8e9c22c090f963010fbb2ce918c9542a3da700f57d3f69bd2d5764478a7d0a2",
    "bytes": 191,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/greeting/mouth",
      "characters/beibei_otter/greeting/mouth",
      "characters/qiqi_deer/greeting/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/greeting/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "near_arm",
    "deliverySvg": "characters/tiantian_raccoon/greeting/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/greeting/near_arm.svg",
    "sha256": "cb6e4779d94c5a5f2fb08d9bab72328cb60d27b458f332c503d2432c773cd736",
    "bytes": 236,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/celebrate/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/greeting/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "far_arm",
    "deliverySvg": "characters/tiantian_raccoon/greeting/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/greeting/far_arm.svg",
    "sha256": "2282d9221e2526fa5b7b13e8c05821b1abcaba425e6724b04356a68e4222a0eb",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/far_arm",
      "characters/tiantian_raccoon/listening/far_arm",
      "characters/tiantian_raccoon/thinking/far_arm",
      "characters/tiantian_raccoon/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/greeting/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "ears_or_tail",
    "deliverySvg": "characters/tiantian_raccoon/greeting/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/greeting/ears_or_tail.svg",
    "sha256": "ffa1274618edeaf5f22f2a713003d9b4905c47e7aed5065f662a1f0b2eb2cb16",
    "bytes": 338,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/ears_or_tail",
      "characters/tiantian_raccoon/listening/ears_or_tail",
      "characters/tiantian_raccoon/thinking/ears_or_tail",
      "characters/tiantian_raccoon/comfort/ears_or_tail",
      "characters/tiantian_raccoon/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/listening/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "torso",
    "deliverySvg": "characters/tiantian_raccoon/listening/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/listening/torso.svg",
    "sha256": "39a458bd82c3675e652884cb5c22f79ddd9c472b0da59f18c6888fc453f8588f",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/torso",
      "characters/tiantian_raccoon/greeting/torso",
      "characters/tiantian_raccoon/thinking/torso",
      "characters/tiantian_raccoon/comfort/torso",
      "characters/tiantian_raccoon/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/listening/head",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "head",
    "deliverySvg": "characters/tiantian_raccoon/listening/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/listening/head.svg",
    "sha256": "298c5d722a53ce08688f9a2bff1726af1ec76ef3abdf9aa90ec1e0f621ff2e37",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/head",
      "characters/tiantian_raccoon/greeting/head",
      "characters/tiantian_raccoon/thinking/head",
      "characters/tiantian_raccoon/comfort/head",
      "characters/tiantian_raccoon/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/listening/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "eyes",
    "deliverySvg": "characters/tiantian_raccoon/listening/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/listening/eyes.svg",
    "sha256": "1062d1a7afd2a16bd811310be93bc4c874538fbde0b87d5023169c75822cdd2c",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/listening/eyes",
      "characters/beibei_otter/listening/eyes",
      "characters/qiqi_deer/listening/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/listening/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "mouth",
    "deliverySvg": "characters/tiantian_raccoon/listening/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/listening/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/mouth",
      "characters/guoguo_squirrel/listening/mouth",
      "characters/guoguo_squirrel/celebrate/mouth",
      "characters/beibei_otter/neutral/mouth",
      "characters/beibei_otter/listening/mouth",
      "characters/beibei_otter/celebrate/mouth",
      "characters/tiantian_raccoon/neutral/mouth",
      "characters/tiantian_raccoon/celebrate/mouth",
      "characters/qiqi_deer/neutral/mouth",
      "characters/qiqi_deer/listening/mouth",
      "characters/qiqi_deer/celebrate/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/listening/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "near_arm",
    "deliverySvg": "characters/tiantian_raccoon/listening/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/listening/near_arm.svg",
    "sha256": "f822f16f59ce60d0f21556fb57ca80137951247acb5684eb95aede0c3f534e83",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/near_arm",
      "characters/tiantian_raccoon/thinking/near_arm",
      "characters/tiantian_raccoon/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/listening/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "far_arm",
    "deliverySvg": "characters/tiantian_raccoon/listening/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/listening/far_arm.svg",
    "sha256": "2282d9221e2526fa5b7b13e8c05821b1abcaba425e6724b04356a68e4222a0eb",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/far_arm",
      "characters/tiantian_raccoon/greeting/far_arm",
      "characters/tiantian_raccoon/thinking/far_arm",
      "characters/tiantian_raccoon/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/listening/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "ears_or_tail",
    "deliverySvg": "characters/tiantian_raccoon/listening/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/listening/ears_or_tail.svg",
    "sha256": "ffa1274618edeaf5f22f2a713003d9b4905c47e7aed5065f662a1f0b2eb2cb16",
    "bytes": 338,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/ears_or_tail",
      "characters/tiantian_raccoon/greeting/ears_or_tail",
      "characters/tiantian_raccoon/thinking/ears_or_tail",
      "characters/tiantian_raccoon/comfort/ears_or_tail",
      "characters/tiantian_raccoon/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/thinking/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "torso",
    "deliverySvg": "characters/tiantian_raccoon/thinking/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/thinking/torso.svg",
    "sha256": "39a458bd82c3675e652884cb5c22f79ddd9c472b0da59f18c6888fc453f8588f",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/torso",
      "characters/tiantian_raccoon/greeting/torso",
      "characters/tiantian_raccoon/listening/torso",
      "characters/tiantian_raccoon/comfort/torso",
      "characters/tiantian_raccoon/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/thinking/head",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "head",
    "deliverySvg": "characters/tiantian_raccoon/thinking/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/thinking/head.svg",
    "sha256": "298c5d722a53ce08688f9a2bff1726af1ec76ef3abdf9aa90ec1e0f621ff2e37",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/head",
      "characters/tiantian_raccoon/greeting/head",
      "characters/tiantian_raccoon/listening/head",
      "characters/tiantian_raccoon/comfort/head",
      "characters/tiantian_raccoon/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/thinking/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "eyes",
    "deliverySvg": "characters/tiantian_raccoon/thinking/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/thinking/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/thinking/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "mouth",
    "deliverySvg": "characters/tiantian_raccoon/thinking/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/thinking/mouth.svg",
    "sha256": "0619c999a62701c18791bff97b13010702315e4a854610a6b990c0774f405138",
    "bytes": 189,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/thinking/mouth",
      "characters/beibei_otter/thinking/mouth",
      "characters/qiqi_deer/thinking/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/thinking/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "near_arm",
    "deliverySvg": "characters/tiantian_raccoon/thinking/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/thinking/near_arm.svg",
    "sha256": "f822f16f59ce60d0f21556fb57ca80137951247acb5684eb95aede0c3f534e83",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/near_arm",
      "characters/tiantian_raccoon/listening/near_arm",
      "characters/tiantian_raccoon/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/thinking/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "far_arm",
    "deliverySvg": "characters/tiantian_raccoon/thinking/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/thinking/far_arm.svg",
    "sha256": "2282d9221e2526fa5b7b13e8c05821b1abcaba425e6724b04356a68e4222a0eb",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/far_arm",
      "characters/tiantian_raccoon/greeting/far_arm",
      "characters/tiantian_raccoon/listening/far_arm",
      "characters/tiantian_raccoon/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/thinking/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "ears_or_tail",
    "deliverySvg": "characters/tiantian_raccoon/thinking/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/thinking/ears_or_tail.svg",
    "sha256": "ffa1274618edeaf5f22f2a713003d9b4905c47e7aed5065f662a1f0b2eb2cb16",
    "bytes": 338,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/ears_or_tail",
      "characters/tiantian_raccoon/greeting/ears_or_tail",
      "characters/tiantian_raccoon/listening/ears_or_tail",
      "characters/tiantian_raccoon/comfort/ears_or_tail",
      "characters/tiantian_raccoon/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/comfort/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "torso",
    "deliverySvg": "characters/tiantian_raccoon/comfort/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/comfort/torso.svg",
    "sha256": "39a458bd82c3675e652884cb5c22f79ddd9c472b0da59f18c6888fc453f8588f",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/torso",
      "characters/tiantian_raccoon/greeting/torso",
      "characters/tiantian_raccoon/listening/torso",
      "characters/tiantian_raccoon/thinking/torso",
      "characters/tiantian_raccoon/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/comfort/head",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "head",
    "deliverySvg": "characters/tiantian_raccoon/comfort/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/comfort/head.svg",
    "sha256": "298c5d722a53ce08688f9a2bff1726af1ec76ef3abdf9aa90ec1e0f621ff2e37",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/head",
      "characters/tiantian_raccoon/greeting/head",
      "characters/tiantian_raccoon/listening/head",
      "characters/tiantian_raccoon/thinking/head",
      "characters/tiantian_raccoon/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/comfort/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "eyes",
    "deliverySvg": "characters/tiantian_raccoon/comfort/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/comfort/eyes.svg",
    "sha256": "649e1d51a6e9d1a0f56a7bb787865c170724f0e635c6cfee4a5bb39dae119037",
    "bytes": 262,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/comfort/eyes",
      "characters/beibei_otter/comfort/eyes",
      "characters/qiqi_deer/comfort/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/comfort/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "mouth",
    "deliverySvg": "characters/tiantian_raccoon/comfort/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/comfort/mouth.svg",
    "sha256": "86a307ab2910f6e1545f8ab38da2ccb74bf7a3ecee8b470689a57b1a0ed4ce29",
    "bytes": 214,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/comfort/mouth",
      "characters/beibei_otter/comfort/mouth",
      "characters/qiqi_deer/comfort/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/comfort/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "near_arm",
    "deliverySvg": "characters/tiantian_raccoon/comfort/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/comfort/near_arm.svg",
    "sha256": "f822f16f59ce60d0f21556fb57ca80137951247acb5684eb95aede0c3f534e83",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/near_arm",
      "characters/tiantian_raccoon/listening/near_arm",
      "characters/tiantian_raccoon/thinking/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/comfort/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "far_arm",
    "deliverySvg": "characters/tiantian_raccoon/comfort/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/comfort/far_arm.svg",
    "sha256": "2282d9221e2526fa5b7b13e8c05821b1abcaba425e6724b04356a68e4222a0eb",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/far_arm",
      "characters/tiantian_raccoon/greeting/far_arm",
      "characters/tiantian_raccoon/listening/far_arm",
      "characters/tiantian_raccoon/thinking/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/comfort/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "ears_or_tail",
    "deliverySvg": "characters/tiantian_raccoon/comfort/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/comfort/ears_or_tail.svg",
    "sha256": "ffa1274618edeaf5f22f2a713003d9b4905c47e7aed5065f662a1f0b2eb2cb16",
    "bytes": 338,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/ears_or_tail",
      "characters/tiantian_raccoon/greeting/ears_or_tail",
      "characters/tiantian_raccoon/listening/ears_or_tail",
      "characters/tiantian_raccoon/thinking/ears_or_tail",
      "characters/tiantian_raccoon/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/celebrate/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "torso",
    "deliverySvg": "characters/tiantian_raccoon/celebrate/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/celebrate/torso.svg",
    "sha256": "39a458bd82c3675e652884cb5c22f79ddd9c472b0da59f18c6888fc453f8588f",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/torso",
      "characters/tiantian_raccoon/greeting/torso",
      "characters/tiantian_raccoon/listening/torso",
      "characters/tiantian_raccoon/thinking/torso",
      "characters/tiantian_raccoon/comfort/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/celebrate/head",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "head",
    "deliverySvg": "characters/tiantian_raccoon/celebrate/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/celebrate/head.svg",
    "sha256": "298c5d722a53ce08688f9a2bff1726af1ec76ef3abdf9aa90ec1e0f621ff2e37",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/head",
      "characters/tiantian_raccoon/greeting/head",
      "characters/tiantian_raccoon/listening/head",
      "characters/tiantian_raccoon/thinking/head",
      "characters/tiantian_raccoon/comfort/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/celebrate/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "eyes",
    "deliverySvg": "characters/tiantian_raccoon/celebrate/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/celebrate/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/celebrate/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "mouth",
    "deliverySvg": "characters/tiantian_raccoon/celebrate/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/celebrate/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/mouth",
      "characters/guoguo_squirrel/listening/mouth",
      "characters/guoguo_squirrel/celebrate/mouth",
      "characters/beibei_otter/neutral/mouth",
      "characters/beibei_otter/listening/mouth",
      "characters/beibei_otter/celebrate/mouth",
      "characters/tiantian_raccoon/neutral/mouth",
      "characters/tiantian_raccoon/listening/mouth",
      "characters/qiqi_deer/neutral/mouth",
      "characters/qiqi_deer/listening/mouth",
      "characters/qiqi_deer/celebrate/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/celebrate/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "near_arm",
    "deliverySvg": "characters/tiantian_raccoon/celebrate/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/celebrate/near_arm.svg",
    "sha256": "cb6e4779d94c5a5f2fb08d9bab72328cb60d27b458f332c503d2432c773cd736",
    "bytes": 236,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/greeting/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/celebrate/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "far_arm",
    "deliverySvg": "characters/tiantian_raccoon/celebrate/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/celebrate/far_arm.svg",
    "sha256": "4127e52d73487a0d970d0e88d892580581138dc6ccc24e26858f06732b811bf1",
    "bytes": 238,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/tiantian_raccoon/celebrate/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "ears_or_tail",
    "deliverySvg": "characters/tiantian_raccoon/celebrate/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/tiantian_raccoon/celebrate/ears_or_tail.svg",
    "sha256": "ffa1274618edeaf5f22f2a713003d9b4905c47e7aed5065f662a1f0b2eb2cb16",
    "bytes": 338,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/tiantian_raccoon/neutral/ears_or_tail",
      "characters/tiantian_raccoon/greeting/ears_or_tail",
      "characters/tiantian_raccoon/listening/ears_or_tail",
      "characters/tiantian_raccoon/thinking/ears_or_tail",
      "characters/tiantian_raccoon/comfort/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "tiantian_raccoon"
  },
  {
    "assetId": "characters/qiqi_deer/neutral/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "torso",
    "deliverySvg": "characters/qiqi_deer/neutral/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/neutral/torso.svg",
    "sha256": "758d950f2d365479ec681a2fce1412a68f7a039ec6638b4118044ad0839dc6db",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/greeting/torso",
      "characters/qiqi_deer/listening/torso",
      "characters/qiqi_deer/thinking/torso",
      "characters/qiqi_deer/comfort/torso",
      "characters/qiqi_deer/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/neutral/head",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "head",
    "deliverySvg": "characters/qiqi_deer/neutral/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/neutral/head.svg",
    "sha256": "728a26928ab17bcea8028e59c9293c204e3d5bace2a563f02d3bb1e83caf39f7",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/greeting/head",
      "characters/qiqi_deer/listening/head",
      "characters/qiqi_deer/thinking/head",
      "characters/qiqi_deer/comfort/head",
      "characters/qiqi_deer/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/neutral/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "eyes",
    "deliverySvg": "characters/qiqi_deer/neutral/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/neutral/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/neutral/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "mouth",
    "deliverySvg": "characters/qiqi_deer/neutral/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/neutral/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/mouth",
      "characters/guoguo_squirrel/listening/mouth",
      "characters/guoguo_squirrel/celebrate/mouth",
      "characters/beibei_otter/neutral/mouth",
      "characters/beibei_otter/listening/mouth",
      "characters/beibei_otter/celebrate/mouth",
      "characters/tiantian_raccoon/neutral/mouth",
      "characters/tiantian_raccoon/listening/mouth",
      "characters/tiantian_raccoon/celebrate/mouth",
      "characters/qiqi_deer/listening/mouth",
      "characters/qiqi_deer/celebrate/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/neutral/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "near_arm",
    "deliverySvg": "characters/qiqi_deer/neutral/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/neutral/near_arm.svg",
    "sha256": "a6fe808b5e90dc8105815d748a440e431725fe7bbc755b6fe92e5fd16116f334",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/listening/near_arm",
      "characters/qiqi_deer/thinking/near_arm",
      "characters/qiqi_deer/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/neutral/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "far_arm",
    "deliverySvg": "characters/qiqi_deer/neutral/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/neutral/far_arm.svg",
    "sha256": "8fd295d5b32d2d34cb26f1b55a1fe232905489aedb12f8c6dab72b735cec45d8",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/greeting/far_arm",
      "characters/qiqi_deer/listening/far_arm",
      "characters/qiqi_deer/thinking/far_arm",
      "characters/qiqi_deer/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/neutral/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "neutral",
    "part": "ears_or_tail",
    "deliverySvg": "characters/qiqi_deer/neutral/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/neutral/ears_or_tail.svg",
    "sha256": "2d051ba7c80a5d80d1855f43897c1e49b22977b4c753fde5a2e7c442049d5470",
    "bytes": 453,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/greeting/ears_or_tail",
      "characters/qiqi_deer/listening/ears_or_tail",
      "characters/qiqi_deer/thinking/ears_or_tail",
      "characters/qiqi_deer/comfort/ears_or_tail",
      "characters/qiqi_deer/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/greeting/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "torso",
    "deliverySvg": "characters/qiqi_deer/greeting/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/greeting/torso.svg",
    "sha256": "758d950f2d365479ec681a2fce1412a68f7a039ec6638b4118044ad0839dc6db",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/torso",
      "characters/qiqi_deer/listening/torso",
      "characters/qiqi_deer/thinking/torso",
      "characters/qiqi_deer/comfort/torso",
      "characters/qiqi_deer/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/greeting/head",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "head",
    "deliverySvg": "characters/qiqi_deer/greeting/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/greeting/head.svg",
    "sha256": "728a26928ab17bcea8028e59c9293c204e3d5bace2a563f02d3bb1e83caf39f7",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/head",
      "characters/qiqi_deer/listening/head",
      "characters/qiqi_deer/thinking/head",
      "characters/qiqi_deer/comfort/head",
      "characters/qiqi_deer/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/greeting/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "eyes",
    "deliverySvg": "characters/qiqi_deer/greeting/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/greeting/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/thinking/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/greeting/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "mouth",
    "deliverySvg": "characters/qiqi_deer/greeting/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/greeting/mouth.svg",
    "sha256": "c8e9c22c090f963010fbb2ce918c9542a3da700f57d3f69bd2d5764478a7d0a2",
    "bytes": 191,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/greeting/mouth",
      "characters/beibei_otter/greeting/mouth",
      "characters/tiantian_raccoon/greeting/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/greeting/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "near_arm",
    "deliverySvg": "characters/qiqi_deer/greeting/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/greeting/near_arm.svg",
    "sha256": "68a82c81d414bc6927a9fe14656d90a72df541bb2c3481853d7b1f2fbaaa732f",
    "bytes": 236,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/celebrate/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/greeting/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "far_arm",
    "deliverySvg": "characters/qiqi_deer/greeting/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/greeting/far_arm.svg",
    "sha256": "8fd295d5b32d2d34cb26f1b55a1fe232905489aedb12f8c6dab72b735cec45d8",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/far_arm",
      "characters/qiqi_deer/listening/far_arm",
      "characters/qiqi_deer/thinking/far_arm",
      "characters/qiqi_deer/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/greeting/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "greeting",
    "part": "ears_or_tail",
    "deliverySvg": "characters/qiqi_deer/greeting/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/greeting/ears_or_tail.svg",
    "sha256": "2d051ba7c80a5d80d1855f43897c1e49b22977b4c753fde5a2e7c442049d5470",
    "bytes": 453,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/ears_or_tail",
      "characters/qiqi_deer/listening/ears_or_tail",
      "characters/qiqi_deer/thinking/ears_or_tail",
      "characters/qiqi_deer/comfort/ears_or_tail",
      "characters/qiqi_deer/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/listening/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "torso",
    "deliverySvg": "characters/qiqi_deer/listening/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/listening/torso.svg",
    "sha256": "758d950f2d365479ec681a2fce1412a68f7a039ec6638b4118044ad0839dc6db",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/torso",
      "characters/qiqi_deer/greeting/torso",
      "characters/qiqi_deer/thinking/torso",
      "characters/qiqi_deer/comfort/torso",
      "characters/qiqi_deer/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/listening/head",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "head",
    "deliverySvg": "characters/qiqi_deer/listening/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/listening/head.svg",
    "sha256": "728a26928ab17bcea8028e59c9293c204e3d5bace2a563f02d3bb1e83caf39f7",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/head",
      "characters/qiqi_deer/greeting/head",
      "characters/qiqi_deer/thinking/head",
      "characters/qiqi_deer/comfort/head",
      "characters/qiqi_deer/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/listening/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "eyes",
    "deliverySvg": "characters/qiqi_deer/listening/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/listening/eyes.svg",
    "sha256": "1062d1a7afd2a16bd811310be93bc4c874538fbde0b87d5023169c75822cdd2c",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/listening/eyes",
      "characters/beibei_otter/listening/eyes",
      "characters/tiantian_raccoon/listening/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/listening/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "mouth",
    "deliverySvg": "characters/qiqi_deer/listening/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/listening/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/mouth",
      "characters/guoguo_squirrel/listening/mouth",
      "characters/guoguo_squirrel/celebrate/mouth",
      "characters/beibei_otter/neutral/mouth",
      "characters/beibei_otter/listening/mouth",
      "characters/beibei_otter/celebrate/mouth",
      "characters/tiantian_raccoon/neutral/mouth",
      "characters/tiantian_raccoon/listening/mouth",
      "characters/tiantian_raccoon/celebrate/mouth",
      "characters/qiqi_deer/neutral/mouth",
      "characters/qiqi_deer/celebrate/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/listening/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "near_arm",
    "deliverySvg": "characters/qiqi_deer/listening/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/listening/near_arm.svg",
    "sha256": "a6fe808b5e90dc8105815d748a440e431725fe7bbc755b6fe92e5fd16116f334",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/near_arm",
      "characters/qiqi_deer/thinking/near_arm",
      "characters/qiqi_deer/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/listening/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "far_arm",
    "deliverySvg": "characters/qiqi_deer/listening/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/listening/far_arm.svg",
    "sha256": "8fd295d5b32d2d34cb26f1b55a1fe232905489aedb12f8c6dab72b735cec45d8",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/far_arm",
      "characters/qiqi_deer/greeting/far_arm",
      "characters/qiqi_deer/thinking/far_arm",
      "characters/qiqi_deer/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/listening/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "listening",
    "part": "ears_or_tail",
    "deliverySvg": "characters/qiqi_deer/listening/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/listening/ears_or_tail.svg",
    "sha256": "2d051ba7c80a5d80d1855f43897c1e49b22977b4c753fde5a2e7c442049d5470",
    "bytes": 453,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/ears_or_tail",
      "characters/qiqi_deer/greeting/ears_or_tail",
      "characters/qiqi_deer/thinking/ears_or_tail",
      "characters/qiqi_deer/comfort/ears_or_tail",
      "characters/qiqi_deer/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/thinking/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "torso",
    "deliverySvg": "characters/qiqi_deer/thinking/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/thinking/torso.svg",
    "sha256": "758d950f2d365479ec681a2fce1412a68f7a039ec6638b4118044ad0839dc6db",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/torso",
      "characters/qiqi_deer/greeting/torso",
      "characters/qiqi_deer/listening/torso",
      "characters/qiqi_deer/comfort/torso",
      "characters/qiqi_deer/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/thinking/head",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "head",
    "deliverySvg": "characters/qiqi_deer/thinking/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/thinking/head.svg",
    "sha256": "728a26928ab17bcea8028e59c9293c204e3d5bace2a563f02d3bb1e83caf39f7",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/head",
      "characters/qiqi_deer/greeting/head",
      "characters/qiqi_deer/listening/head",
      "characters/qiqi_deer/comfort/head",
      "characters/qiqi_deer/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/thinking/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "eyes",
    "deliverySvg": "characters/qiqi_deer/thinking/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/thinking/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/celebrate/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/thinking/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "mouth",
    "deliverySvg": "characters/qiqi_deer/thinking/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/thinking/mouth.svg",
    "sha256": "0619c999a62701c18791bff97b13010702315e4a854610a6b990c0774f405138",
    "bytes": 189,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/thinking/mouth",
      "characters/beibei_otter/thinking/mouth",
      "characters/tiantian_raccoon/thinking/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/thinking/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "near_arm",
    "deliverySvg": "characters/qiqi_deer/thinking/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/thinking/near_arm.svg",
    "sha256": "a6fe808b5e90dc8105815d748a440e431725fe7bbc755b6fe92e5fd16116f334",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/near_arm",
      "characters/qiqi_deer/listening/near_arm",
      "characters/qiqi_deer/comfort/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/thinking/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "far_arm",
    "deliverySvg": "characters/qiqi_deer/thinking/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/thinking/far_arm.svg",
    "sha256": "8fd295d5b32d2d34cb26f1b55a1fe232905489aedb12f8c6dab72b735cec45d8",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/far_arm",
      "characters/qiqi_deer/greeting/far_arm",
      "characters/qiqi_deer/listening/far_arm",
      "characters/qiqi_deer/comfort/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/thinking/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "thinking",
    "part": "ears_or_tail",
    "deliverySvg": "characters/qiqi_deer/thinking/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/thinking/ears_or_tail.svg",
    "sha256": "2d051ba7c80a5d80d1855f43897c1e49b22977b4c753fde5a2e7c442049d5470",
    "bytes": 453,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/ears_or_tail",
      "characters/qiqi_deer/greeting/ears_or_tail",
      "characters/qiqi_deer/listening/ears_or_tail",
      "characters/qiqi_deer/comfort/ears_or_tail",
      "characters/qiqi_deer/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/comfort/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "torso",
    "deliverySvg": "characters/qiqi_deer/comfort/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/comfort/torso.svg",
    "sha256": "758d950f2d365479ec681a2fce1412a68f7a039ec6638b4118044ad0839dc6db",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/torso",
      "characters/qiqi_deer/greeting/torso",
      "characters/qiqi_deer/listening/torso",
      "characters/qiqi_deer/thinking/torso",
      "characters/qiqi_deer/celebrate/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/comfort/head",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "head",
    "deliverySvg": "characters/qiqi_deer/comfort/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/comfort/head.svg",
    "sha256": "728a26928ab17bcea8028e59c9293c204e3d5bace2a563f02d3bb1e83caf39f7",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/head",
      "characters/qiqi_deer/greeting/head",
      "characters/qiqi_deer/listening/head",
      "characters/qiqi_deer/thinking/head",
      "characters/qiqi_deer/celebrate/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/comfort/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "eyes",
    "deliverySvg": "characters/qiqi_deer/comfort/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/comfort/eyes.svg",
    "sha256": "649e1d51a6e9d1a0f56a7bb787865c170724f0e635c6cfee4a5bb39dae119037",
    "bytes": 262,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/comfort/eyes",
      "characters/beibei_otter/comfort/eyes",
      "characters/tiantian_raccoon/comfort/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/comfort/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "mouth",
    "deliverySvg": "characters/qiqi_deer/comfort/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/comfort/mouth.svg",
    "sha256": "86a307ab2910f6e1545f8ab38da2ccb74bf7a3ecee8b470689a57b1a0ed4ce29",
    "bytes": 214,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/comfort/mouth",
      "characters/beibei_otter/comfort/mouth",
      "characters/tiantian_raccoon/comfort/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/comfort/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "near_arm",
    "deliverySvg": "characters/qiqi_deer/comfort/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/comfort/near_arm.svg",
    "sha256": "a6fe808b5e90dc8105815d748a440e431725fe7bbc755b6fe92e5fd16116f334",
    "bytes": 237,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/near_arm",
      "characters/qiqi_deer/listening/near_arm",
      "characters/qiqi_deer/thinking/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/comfort/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "far_arm",
    "deliverySvg": "characters/qiqi_deer/comfort/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/comfort/far_arm.svg",
    "sha256": "8fd295d5b32d2d34cb26f1b55a1fe232905489aedb12f8c6dab72b735cec45d8",
    "bytes": 238,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/far_arm",
      "characters/qiqi_deer/greeting/far_arm",
      "characters/qiqi_deer/listening/far_arm",
      "characters/qiqi_deer/thinking/far_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/comfort/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "comfort",
    "part": "ears_or_tail",
    "deliverySvg": "characters/qiqi_deer/comfort/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/comfort/ears_or_tail.svg",
    "sha256": "2d051ba7c80a5d80d1855f43897c1e49b22977b4c753fde5a2e7c442049d5470",
    "bytes": 453,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/ears_or_tail",
      "characters/qiqi_deer/greeting/ears_or_tail",
      "characters/qiqi_deer/listening/ears_or_tail",
      "characters/qiqi_deer/thinking/ears_or_tail",
      "characters/qiqi_deer/celebrate/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/celebrate/torso",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "torso",
    "deliverySvg": "characters/qiqi_deer/celebrate/torso.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/celebrate/torso.svg",
    "sha256": "758d950f2d365479ec681a2fce1412a68f7a039ec6638b4118044ad0839dc6db",
    "bytes": 363,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/torso",
      "characters/qiqi_deer/greeting/torso",
      "characters/qiqi_deer/listening/torso",
      "characters/qiqi_deer/thinking/torso",
      "characters/qiqi_deer/comfort/torso"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/celebrate/head",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "head",
    "deliverySvg": "characters/qiqi_deer/celebrate/head.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/celebrate/head.svg",
    "sha256": "728a26928ab17bcea8028e59c9293c204e3d5bace2a563f02d3bb1e83caf39f7",
    "bytes": 287,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/head",
      "characters/qiqi_deer/greeting/head",
      "characters/qiqi_deer/listening/head",
      "characters/qiqi_deer/thinking/head",
      "characters/qiqi_deer/comfort/head"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/celebrate/eyes",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "eyes",
    "deliverySvg": "characters/qiqi_deer/celebrate/eyes.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/celebrate/eyes.svg",
    "sha256": "bbd9fff7db0c55f5d9ff196ae7d84d9aea635cf0ece7c56a088cb4146bdcef57",
    "bytes": 452,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/eyes",
      "characters/guoguo_squirrel/greeting/eyes",
      "characters/guoguo_squirrel/thinking/eyes",
      "characters/guoguo_squirrel/celebrate/eyes",
      "characters/beibei_otter/neutral/eyes",
      "characters/beibei_otter/greeting/eyes",
      "characters/beibei_otter/thinking/eyes",
      "characters/beibei_otter/celebrate/eyes",
      "characters/tiantian_raccoon/neutral/eyes",
      "characters/tiantian_raccoon/greeting/eyes",
      "characters/tiantian_raccoon/thinking/eyes",
      "characters/tiantian_raccoon/celebrate/eyes",
      "characters/qiqi_deer/neutral/eyes",
      "characters/qiqi_deer/greeting/eyes",
      "characters/qiqi_deer/thinking/eyes"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/celebrate/mouth",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "mouth",
    "deliverySvg": "characters/qiqi_deer/celebrate/mouth.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/celebrate/mouth.svg",
    "sha256": "45241c2db9b8508f77d83bc23718cab6ab808fcadc2eaffae62357fc865ac6b8",
    "bytes": 285,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/guoguo_squirrel/neutral/mouth",
      "characters/guoguo_squirrel/listening/mouth",
      "characters/guoguo_squirrel/celebrate/mouth",
      "characters/beibei_otter/neutral/mouth",
      "characters/beibei_otter/listening/mouth",
      "characters/beibei_otter/celebrate/mouth",
      "characters/tiantian_raccoon/neutral/mouth",
      "characters/tiantian_raccoon/listening/mouth",
      "characters/tiantian_raccoon/celebrate/mouth",
      "characters/qiqi_deer/neutral/mouth",
      "characters/qiqi_deer/listening/mouth"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/celebrate/near_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "near_arm",
    "deliverySvg": "characters/qiqi_deer/celebrate/near_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/celebrate/near_arm.svg",
    "sha256": "68a82c81d414bc6927a9fe14656d90a72df541bb2c3481853d7b1f2fbaaa732f",
    "bytes": 236,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/greeting/near_arm"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/celebrate/far_arm",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "far_arm",
    "deliverySvg": "characters/qiqi_deer/celebrate/far_arm.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/celebrate/far_arm.svg",
    "sha256": "414cf5bbe3e27eb870460db9a68683f03a69e411431739af9692ec2bd8d0a47c",
    "bytes": 238,
    "isSharedGeometryFixture": false,
    "sharedGeometryWith": [],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  },
  {
    "assetId": "characters/qiqi_deer/celebrate/ears_or_tail",
    "category": "character_rig",
    "scene": "global",
    "state": "celebrate",
    "part": "ears_or_tail",
    "deliverySvg": "characters/qiqi_deer/celebrate/ears_or_tail.svg",
    "publicUrl": "/visual-v2/v2-3-layer-factory/assets/characters/qiqi_deer/celebrate/ears_or_tail.svg",
    "sha256": "2d051ba7c80a5d80d1855f43897c1e49b22977b4c753fde5a2e7c442049d5470",
    "bytes": 453,
    "isSharedGeometryFixture": true,
    "sharedGeometryWith": [
      "characters/qiqi_deer/neutral/ears_or_tail",
      "characters/qiqi_deer/greeting/ears_or_tail",
      "characters/qiqi_deer/listening/ears_or_tail",
      "characters/qiqi_deer/thinking/ears_or_tail",
      "characters/qiqi_deer/comfort/ears_or_tail"
    ],
    "qaStatus": "TECH_PREVIEW_NOT_ART_APPROVED",
    "artGate": "ART_DIRECTOR_QA_HOLD",
    "companionId": "qiqi_deer"
  }
] as const;

export const V2_3_PREPRODUCTION_TRACKED_RISKS = [
  {
    id: "RISK-NODE20-ENGINE-WARN",
    category: "Build & Runtime Environment",
    summary: "Node v20.20.2 prints EBADENGINE warnings for @firebase/* (>=24.12.0) and vitest (^20.0.0 || ^22.0.0 || >=24.0.0)",
    batch01Policy: "Tracked only per Gate D instruction; do not upgrade Node or dependencies inside visual skin pilot branch",
    owner: "Platform / Release Engineering",
    targetGate: "Preproduction Infrastructure Gate",
  },
  {
    id: "RISK-NPM-ADVISORIES-4HIGH",
    category: "Dependency Security Advisories",
    summary: "npm ci reports 4 high-severity advisories in transitive dev/build dependencies",
    batch01Policy: "Tracked only per Gate D instruction; no unapproved package.json / package-lock.json mutations in V2 visual branch",
    owner: "Security & Release Engineering",
    targetGate: "Preproduction Security Gate",
  },
  {
    id: "RISK-MAIN-JS-BUNDLE-SIZE",
    category: "Frontend Performance & Chunking",
    summary: "Single main bundle dist/assets/index-*.js (~2.32 MB raw / ~540 KB gzip) triggers Vite >500 kB chunk warning",
    batch01Policy: "Tracked with measured scene media load timings; route/modal lazy-splitting scheduled for dedicated preproduction performance gate",
    owner: "Frontend Architecture",
    targetGate: "Preproduction Performance Gate",
  },
] as const;

export function getWeatherStationLayers(
  state: V2_3WeatherState
): Record<V2_3WeatherLayerPart, V2_3SceneAssetRecord<"weather_station", V2_3WeatherState, V2_3WeatherLayerPart>> {
  const entries = V2_3_WEATHER_STATION_ASSETS.filter((a) => a.state === state);
  const map = {} as Record<V2_3WeatherLayerPart, V2_3SceneAssetRecord<"weather_station", V2_3WeatherState, V2_3WeatherLayerPart>>;
  for (const part of V2_3_WEATHER_LAYER_Z_ORDER) {
    const found = entries.find((e) => e.part === part);
    if (!found) {
      throw new Error(`[V2_3_BATCH01] Missing weather_station asset for state=${state} part=${part}`);
    }
    map[part] = found;
  }
  return map;
}

export function getCalmCornerLayers(
  state: V2_3CalmState
): Record<V2_3CalmLayerPart, V2_3SceneAssetRecord<"calm_corner", V2_3CalmState, V2_3CalmLayerPart>> {
  const entries = V2_3_CALM_CORNER_ASSETS.filter((a) => a.state === state);
  const map = {} as Record<V2_3CalmLayerPart, V2_3SceneAssetRecord<"calm_corner", V2_3CalmState, V2_3CalmLayerPart>>;
  for (const part of V2_3_CALM_LAYER_Z_ORDER) {
    const found = entries.find((e) => e.part === part);
    if (!found) {
      throw new Error(`[V2_3_BATCH01] Missing calm_corner asset for state=${state} part=${part}`);
    }
    map[part] = found;
  }
  return map;
}

export function getCompanionRigLayers(
  companionId: V2_3CompanionId,
  state: V2_3CompanionRigState
): Record<V2_3CompanionRigPart, V2_3CharacterRigAssetRecord> {
  const entries = V2_3_CHARACTER_RIG_ASSETS.filter(
    (a) => a.companionId === companionId && a.state === state
  );
  const map = {} as Record<V2_3CompanionRigPart, V2_3CharacterRigAssetRecord>;
  for (const part of V2_3_COMPANION_RIG_Z_ORDER) {
    const found = entries.find((e) => e.part === part);
    if (!found) {
      throw new Error(`[V2_3_BATCH01] Missing character_rig asset for companion=${companionId} state=${state} part=${part}`);
    }
    map[part] = found;
  }
  return map;
}
