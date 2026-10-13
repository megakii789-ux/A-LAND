/**
 * 受控儿童个性化引擎类型定义 (AG-04B: Controlled Child Personalization V1.0)
 * 遵循:
 * - docs/PRODUCT_CONTRACTS.md
 * - docs/SAFETY_MODEL.md
 * - docs/COGNITIVE_CONSTITUTION_V1.md
 * 
 * 核心原则：
 * 1. 统一认知内核：允许因儿童兴趣、操作偏好改变呈现方式，认知规则与安全边界保持一致；
 * 2. 身份去标签化：不因家庭结构、性别或单次行为预设性格与能力；不把“离异儿童”作为核心身份；
 * 3. 隐私与数据最小化：默认本地运行 (local-only)，不进行云端持久画像；
 * 4. 严禁心理诊断、声纹、人脸识别或 AI 自由心理推测。
 */

// 1. 中性动物伙伴（无性别刻板、温和稳定）
export type AnimalCompanionId = 
  | 'guoguo_squirrel'  // 小松鼠果果：善于观察收集细节
  | 'beibei_otter'     // 小海獭贝贝：喜欢在水边慢慢漂浮放松
  | 'tiantian_raccoon' // 小浣熊天天：好奇拆解小机关
  | 'qiqi_deer';       // 小鹿奇奇：轻声慢步、感受敏锐

export interface AnimalCompanionInfo {
  readonly id: AnimalCompanionId;
  readonly name: string;
  readonly animal: string;
  readonly avatarEmoji: string;
  readonly greetingText: string;
  readonly traitDescription: string;
  readonly themeColorBg: string;
  readonly themeColorBorder: string;
  readonly themeColorText: string;
}

// 2. 兴趣活动（用于多套情境皮肤）
export type InterestActivityId = 
  | 'drawing'  // 画画与色彩
  | 'sports'   // 足球与运动
  | 'nature'   // 动物与自然探索
  | 'puzzle';  // 拼图与积木

export interface InterestActivityInfo {
  readonly id: InterestActivityId;
  readonly label: string;
  readonly icon: string;
  readonly sceneTitle: string;
  readonly sceneDescription: string;
}

// 3. 交互偏好
export type InteractionStyle = 'hands_on' | 'story_first';

export interface ChildAccessibilityPreferences {
  readonly voiceEnabled: boolean;       // 是否开启语音朗读 (默认 true)
  readonly reducedMotion: boolean;      // 是否减少动效 (默认 false)
  readonly simplifiedText: boolean;     // 是否使用更简短的文字说明 (默认 false，适合识字量较少阶段)
}

// 4. 年龄分层架构预留定义
export type AgeBandTierId = 
  | 'TODDLER_2_4'           // 2–4 岁：成年人主导共同游戏（预留存根，不独立运行）
  | 'EARLY_CHILDHOOD_5_7'   // 5–7 岁：以具体操作、图片、简短语音为主（★ 本轮正式完成并验证）
  | 'MIDDLE_CHILDHOOD_8_10' // 8–10 岁：增加同伴关系、社会反馈和表达边界（预留）
  | 'EARLY_TEEN_11_13'      // 11–13 岁：增加复杂关系、信息判断与自主选择（预留）
  | 'LATE_TEEN_14_17';      // 14–17 岁：增强独立性、抽象推理和适龄隐私保护（预留）

export type AgeBandStatus = 'ACTIVE_VERIFIED_V1' | 'RESERVED_STUB';

export interface AgeBandDefinition {
  readonly id: AgeBandTierId;
  readonly label: string;
  readonly ageRangeDisplay: string;
  readonly status: AgeBandStatus;
  readonly primaryDeliveryMethod: string;
  readonly cognitiveFocus: string;
  readonly privacyLevel: string;
  readonly isChildIndependentExecutable: boolean;
}

// 5. 本地个性化配置 Profile
export interface PersonalizationProfile {
  readonly pseudonymousId: string; // 匿名标识符，如 child_anon_xxx，严禁真实身份
  readonly companionId: AnimalCompanionId;
  readonly primaryInterest: InterestActivityId;
  readonly interactionStyle: InteractionStyle;
  readonly accessibility: ChildAccessibilityPreferences;
  readonly ageTier: AgeBandTierId;
  readonly consentForLocalStorage: boolean; // 是否许可在本机本地存储保存设置
  readonly updatedAt: number;
}

// 6. 严禁字段列表（用于安全审计与入参拦截）
export const FORBIDDEN_PERSONALIZATION_FIELDS = [
  'realName',
  'schoolName',
  'homeAddress',
  'familyStructure',
  'parentalMaritalStatus',
  'psychologicalDiagnosis',
  'mentalHealthState',
  'personalityType',
  'temperamentPrediction',
  'voiceprintId',
  'facialEmotionVector',
  'gpsCoordinates',
] as const;

export type ForbiddenPersonalizationField = typeof FORBIDDEN_PERSONALIZATION_FIELDS[number];
