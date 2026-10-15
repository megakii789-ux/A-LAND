/**
 * 儿童交互游戏领域类型定义 (AG-03: 三组真实可玩互动体验)
 * 遵循 docs/PRODUCT_CONTRACTS.md, docs/SAFETY_MODEL.md, docs/COGNITIVE_CONSTITUTION_V1.md
 * 
 * 游戏一：《蜡笔侦探》 (事实与猜测分离)
 * 游戏二：《朋友问起我的家》 (自主表达、隐私边界与反欺凌)
 * 游戏三：《小船协商》 (选择、代价、利益与合作反馈)
 * 独立迁移：两个未受训练的泛化情境
 */

// ===================== 游戏一：《蜡笔侦探》类型 =====================

export type EvidenceCategory = 'FACT' | 'INFERENCE' | 'UNKNOWN';

export interface HotspotEvidence {
  readonly id: string;
  readonly name: string;
  readonly xPercent: number; // 场景中的相对百分比坐标 (0-100)
  readonly yPercent: number;
  readonly radiusPercent: number;
  readonly foundDescription: string;
  readonly spokenText: string;
  readonly category: EvidenceCategory; // 属于客观事实还是主观猜测还是未知
  readonly hint: string;
  readonly observationPrompt?: string; // 归类前展示的中性客观观察提示（不剧透分类答案）
  readonly icon: string;
  readonly isPermanentUnknown?: boolean; // 永远无法确认的盲区（如：蜡笔现在到底在谁口袋里）
  readonly interactionVerb?: string; // 场景内物象操作动词（如：掀开窗帘、拨开红枫叶堆、顺着脚印看）
  readonly requiresObjectReveal?: boolean; // 是否需要在场景中先执行翻开/拨开等动作才能显露隐藏物证
  readonly unrevealedPrompt?: string; // 尚未翻开遮挡物时的环境微提示
}

export interface ClueCardItem {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly category: EvidenceCategory;
  readonly icon: string;
  readonly isPermanentUnknown?: boolean;
}

export type SortingBasketType = 'EYES_OBSERVED' | 'MIND_GUESSED' | 'STILL_UNKNOWN';

export interface SortingBasket {
  readonly id: SortingBasketType;
  readonly label: string;
  readonly subLabel: string;
  readonly expectedCategory: EvidenceCategory;
  readonly icon: string;
  readonly colorBg: string;
  readonly borderColor: string;
}

// ===================== 游戏二：《朋友问起我的家》类型 =====================

export type ResponseTarget = 'ASKING_PEER' | 'CLOSE_FRIEND' | 'TRUSTED_ADULT' | 'KEEP_PRIVATE';

export type DisclosureDepth = 'NO_ANSWER_REDIRECT' | 'MINIMAL_TOUCH' | 'CLEAR_FACT';

export type PeerReactionOutcomeType =
  | 'UNDERSTANDING'       // 1. 理解接纳
  | 'FURTHER_QUESTION'    // 2. 继续追问好奇
  | 'MISUNDERSTANDING'    // 3. 轻微误解
  | 'BULLYING_RIDICULE';  // 4. 嘲笑起哄 (触发安全围栏)

export interface PeerReactionOutcome {
  readonly type: PeerReactionOutcomeType;
  readonly peerSpokenText: string;
  readonly peerActionDescription: string;
  readonly expressionEmoji: string;
  readonly isBoundaryTriggered: boolean;
  readonly nextOptionsPrompt: string;
}

// ===================== 游戏三：《小船协商》类型 =====================

export type NegotiationSolutionPath =
  | 'TAKE_TURNS'        // 路径 A: 轮流玩 (配合沙漏计时器)
  | 'COOPERATE_CARGO'   // 路径 B: 合作载货游戏 (小兔当船长，小熊当装卸员)
  | 'TRADE_TOYS';       // 路径 C: 交换玩 (小船换挖土机)

export interface NegotiationResultDetails {
  readonly path: NegotiationSolutionPath;
  readonly title: string;
  readonly rabbitRoleDescription: string;
  readonly bearRoleDescription: string;
  readonly advantageGained: string;       // 收益 (得到什么)
  readonly realisticLimitation: string;   // 代价/限制 (需要放下什么或等待什么)
  readonly narrativeFeedback: string;
  readonly animationState: string;
}

// ===================== 独立迁移情境类型 =====================

export interface TransferScenarioDefinition {
  readonly id: string;
  readonly title: string;
  readonly surfaceSituation: string;
  readonly underlyingStructure: 'FACT_VS_INFERENCE' | 'CHOICE_TRADEOFF';
  readonly promptSpokenText: string;
  readonly cluesOrChoices: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly categoryOrPath: string;
    readonly icon: string;
  }>;
  readonly objectiveOutcome: string;
}

export interface TransferSessionAuditLog {
  readonly scenarioId: string;
  readonly adultPromptCount: number;
  readonly completedWithoutHint: boolean;
  readonly sessionTimestamp: string;
  readonly researchNote: string;
}
