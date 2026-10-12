/**
 * 迁移架构域类型定义
 * 遵循 docs/CONTENT_SCHEMA.md: 关系结构与表面情境解耦，严禁以情境相似替代结构相似
 */

export enum StructureId {
  // 核心七大认知迁移关系结构 (Phase J)
  FACT_VS_INFERENCE = 'FACT_VS_INFERENCE',
  PERSPECTIVE_DEPENDENT_EFFECT = 'PERSPECTIVE_DEPENDENT_EFFECT',
  CHOICE_TRADEOFF = 'CHOICE_TRADEOFF',
  MULTI_ATTRIBUTE_IDENTITY = 'MULTI_ATTRIBUTE_IDENTITY',
  CONTEXT_DEPENDENT_BEHAVIOR = 'CONTEXT_DEPENDENT_BEHAVIOR',
  RELATION_CHANGE_CONTINUITY = 'RELATION_CHANGE_CONTINUITY',
  BEHAVIOR_PERSON_SEPARATION = 'BEHAVIOR_PERSON_SEPARATION',

  // 既有姿态细分结构 (兼容现有引用)
  FEN_SINGLE_BURDEN_SPLIT = 'FEN_SINGLE_BURDEN_SPLIT',
  FEN_OWNERSHIP_SEPARATION = 'FEN_OWNERSHIP_SEPARATION',
  TONG_FEELING_EXPRESSION = 'TONG_FEELING_EXPRESSION',
  TONG_PERSPECTIVE_CROSSING = 'TONG_PERSPECTIVE_CROSSING',
  ZE_CHOICE_WITHIN_LIMIT = 'ZE_CHOICE_WITHIN_LIMIT',
  ZE_CALM_DOWN_STRATEGY = 'ZE_CALM_DOWN_STRATEGY',
}

export type ThinkingPosture = 'FEN' | 'TONG' | 'ZE';

export type SurfaceDomain =
  | 'school'
  | 'two_homes'
  | 'friendship'
  | 'daily_routine'
  | 'sibling'
  | 'playground'
  | 'nature';

export type EmotionalWeight = 'light' | 'medium' | 'deep';

export type PersonalDistance = 'character' | 'peer' | 'self_past' | 'self_current';

export type CognitiveLoad = 'low' | 'moderate' | 'high';

export interface LeafStepOption {
  readonly id: string;
  readonly labelSpokenText: string;
  readonly isKeyAction: boolean;
}

export interface LeafDefinition {
  readonly leafId: string;
  readonly title: string;
  readonly structureId: StructureId;
  readonly posture: ThinkingPosture;
  readonly surfaceDomain: SurfaceDomain;
  readonly emotionalWeight: EmotionalWeight;
  readonly personalDistance: PersonalDistance;
  readonly cognitiveLoad: CognitiveLoad;
  readonly boundary: 'NONE' | 'PHYSICAL_HARM' | 'PHYSICAL_SAFETY' | 'PSYCHOLOGICAL_SAFETY' | 'SECRECY_COERCION' | 'ADULT_RESPONSIBILITY_CROSSING' | 'PRIVACY_BOUNDARY';
  readonly isHeldOutTransfer: boolean;
  readonly isFoil?: boolean; // 表面相似但结构不同的干扰叶 (foil)
  readonly scaffoldTier: 1 | 2 | 3 | 4;
  readonly targetAgeMin: number;
  readonly promptSpokenText: string;
  readonly stepsOrOptions: ReadonlyArray<LeafStepOption>;
  /**
   * 对应儿童思考工具名称 (例如 "双面币", "小天平", "事实放大镜")
   * 铁律：系统不得在 held-out transfer leaf 向孩子明示该工具！
   */
  readonly associatedToolName?: string;
  /**
   * 回头比一比：比的是两个生活情境，严禁问孩子工具名字
   */
  readonly reflectionComparison?: {
    readonly comparedLeafId: string;
    readonly situationA: string;
    readonly situationB: string;
    readonly sharedCoreQuestion: string; // 两个情境下共通的问题/秘密（无工具术语）
  };
}

export interface ContentFilterCriteria {
  readonly structureId?: StructureId;
  readonly surfaceDomain?: SurfaceDomain;
  readonly emotionalWeight?: EmotionalWeight;
  readonly personalDistance?: PersonalDistance;
  readonly cognitiveLoad?: CognitiveLoad;
  readonly boundary?: 'NONE' | 'PHYSICAL_HARM' | 'PHYSICAL_SAFETY' | 'PSYCHOLOGICAL_SAFETY' | 'SECRECY_COERCION' | 'ADULT_RESPONSIBILITY_CROSSING' | 'PRIVACY_BOUNDARY';
}

export interface TransferPairValidationResult {
  readonly isValidTransferPair: boolean;
  readonly sharedStructureId?: StructureId;
  readonly reason: string;
}
