/**
 * 个性化配置 Schema 校验与安全过滤器
 * 遵循 docs/PRODUCT_CONTRACTS.md 和 docs/SAFETY_MODEL.md
 * 
 * 强制安全审计：
 * - 拒绝接收家庭结构、心理诊断、精确地址、真实姓名等入侵字段
 * - 强制限制在受控枚举范围内
 * - 确保数据可在本机无损重置
 */

import {
  PersonalizationProfile,
  AnimalCompanionId,
  InterestActivityId,
  InteractionStyle,
  AgeBandTierId,
  FORBIDDEN_PERSONALIZATION_FIELDS,
} from './types';
import { DEFAULT_PERSONALIZATION_PROFILE, ANIMAL_COMPANIONS, INTEREST_ACTIVITIES } from './constants';

export interface ValidationResult {
  readonly isValid: boolean;
  readonly sanitizedProfile: PersonalizationProfile;
  readonly strippedForbiddenFields: string[];
  readonly validationErrors: string[];
}

export const PERSONALIZATION_SCHEMA_SPEC = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ControlledChildPersonalizationProfileV1',
  description: '受控儿童个性化引擎本地偏好配置规范（严禁儿童敏感个人信息与心理推断）',
  type: 'object',
  properties: {
    pseudonymousId: {
      type: 'string',
      pattern: '^child_anon_[a-zA-Z0-9_-]+$',
      description: '匿名伪标识符，严禁包含真实姓名、学号或身份证件号',
    },
    companionId: {
      type: 'string',
      enum: ['guoguo_squirrel', 'beibei_otter', 'tiantian_raccoon', 'qiqi_deer'],
      description: '中性动物伙伴标识符',
    },
    primaryInterest: {
      type: 'string',
      enum: ['drawing', 'sports', 'nature', 'puzzle'],
      description: '儿童偏好的兴趣活动（用于场景皮肤适配，不推断心理特征）',
    },
    interactionStyle: {
      type: 'string',
      enum: ['hands_on', 'story_first'],
      description: '操作风格偏好（动手操作 vs 听故事先导）',
    },
    accessibility: {
      type: 'object',
      properties: {
        voiceEnabled: { type: 'boolean' },
        reducedMotion: { type: 'boolean' },
        simplifiedText: { type: 'boolean' },
      },
      required: ['voiceEnabled', 'reducedMotion', 'simplifiedText'],
      additionalProperties: false,
    },
    ageTier: {
      type: 'string',
      enum: ['TODDLER_2_4', 'EARLY_CHILDHOOD_5_7', 'MIDDLE_CHILDHOOD_8_10', 'EARLY_TEEN_11_13', 'LATE_TEEN_14_17'],
      description: '年龄分层代号（本轮仅 5–7 岁为活跃可执行态，其他处于架构预留存根态）',
    },
    consentForLocalStorage: {
      type: 'boolean',
      description: '是否同意保存在本设备 localStorage',
    },
    updatedAt: {
      type: 'number',
      description: '偏好最后更新时间戳',
    },
  },
  required: [
    'pseudonymousId',
    'companionId',
    'primaryInterest',
    'interactionStyle',
    'accessibility',
    'ageTier',
    'consentForLocalStorage',
    'updatedAt',
  ],
  additionalProperties: false,
} as const;

/**
 * 校验并净化个性化配置输入，坚决剔除一切违规字段
 */
export function validateAndSanitizeProfile(input: unknown): ValidationResult {
  const strippedForbiddenFields: string[] = [];
  const validationErrors: string[] = [];

  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      sanitizedProfile: { ...DEFAULT_PERSONALIZATION_PROFILE },
      strippedForbiddenFields: [],
      validationErrors: ['Input is not an object'],
    };
  }

  const raw = input as Record<string, unknown>;

  // 1. 扫描并拦截所有被禁止的敏感/心理/家庭入侵字段
  for (const forbiddenKey of FORBIDDEN_PERSONALIZATION_FIELDS) {
    if (forbiddenKey in raw && raw[forbiddenKey] !== undefined) {
      strippedForbiddenFields.push(forbiddenKey);
    }
  }

  // 2. 检查额外非法属性
  for (const key of Object.keys(raw)) {
    if (key.toLowerCase().includes('diagnosis') ||
        key.toLowerCase().includes('mental') ||
        key.toLowerCase().includes('divorce') ||
        key.toLowerCase().includes('address') ||
        key.toLowerCase().includes('location') ||
        key.toLowerCase().includes('school')) {
      if (!strippedForbiddenFields.includes(key)) {
        strippedForbiddenFields.push(key);
      }
    }
  }

  // 3. 安全获取与校验各项字段
  let companionId: AnimalCompanionId = DEFAULT_PERSONALIZATION_PROFILE.companionId;
  if (typeof raw.companionId === 'string' && raw.companionId in ANIMAL_COMPANIONS) {
    companionId = raw.companionId as AnimalCompanionId;
  } else if (raw.companionId !== undefined) {
    validationErrors.push(`Invalid companionId: ${String(raw.companionId)}`);
  }

  let primaryInterest: InterestActivityId = DEFAULT_PERSONALIZATION_PROFILE.primaryInterest;
  if (typeof raw.primaryInterest === 'string' && raw.primaryInterest in INTEREST_ACTIVITIES) {
    primaryInterest = raw.primaryInterest as InterestActivityId;
  } else if (raw.primaryInterest !== undefined) {
    validationErrors.push(`Invalid primaryInterest: ${String(raw.primaryInterest)}`);
  }

  let interactionStyle: InteractionStyle = DEFAULT_PERSONALIZATION_PROFILE.interactionStyle;
  if (raw.interactionStyle === 'hands_on' || raw.interactionStyle === 'story_first') {
    interactionStyle = raw.interactionStyle;
  } else if (raw.interactionStyle !== undefined) {
    validationErrors.push(`Invalid interactionStyle: ${String(raw.interactionStyle)}`);
  }

  // 4. 辅助无障碍偏好
  const rawAccess = (typeof raw.accessibility === 'object' && raw.accessibility !== null)
    ? (raw.accessibility as Record<string, unknown>)
    : {};
  
  const accessibility = {
    voiceEnabled: typeof rawAccess.voiceEnabled === 'boolean'
      ? rawAccess.voiceEnabled
      : DEFAULT_PERSONALIZATION_PROFILE.accessibility.voiceEnabled,
    reducedMotion: typeof rawAccess.reducedMotion === 'boolean'
      ? rawAccess.reducedMotion
      : DEFAULT_PERSONALIZATION_PROFILE.accessibility.reducedMotion,
    simplifiedText: typeof rawAccess.simplifiedText === 'boolean'
      ? rawAccess.simplifiedText
      : DEFAULT_PERSONALIZATION_PROFILE.accessibility.simplifiedText,
  };

  // 5. 年龄分层
  const validAgeBands: AgeBandTierId[] = [
    'TODDLER_2_4',
    'EARLY_CHILDHOOD_5_7',
    'MIDDLE_CHILDHOOD_8_10',
    'EARLY_TEEN_11_13',
    'LATE_TEEN_14_17',
  ];
  let ageTier: AgeBandTierId = DEFAULT_PERSONALIZATION_PROFILE.ageTier;
  if (typeof raw.ageTier === 'string' && validAgeBands.includes(raw.ageTier as AgeBandTierId)) {
    ageTier = raw.ageTier as AgeBandTierId;
  }

  // 6. 存储同意权与时间戳
  const consentForLocalStorage = typeof raw.consentForLocalStorage === 'boolean'
    ? raw.consentForLocalStorage
    : DEFAULT_PERSONALIZATION_PROFILE.consentForLocalStorage;

  const pseudonymousId = (typeof raw.pseudonymousId === 'string' && /^child_anon_[a-zA-Z0-9_-]+$/.test(raw.pseudonymousId))
    ? raw.pseudonymousId
    : `child_anon_${Math.random().toString(36).substring(2, 9)}`;

  const sanitizedProfile: PersonalizationProfile = {
    pseudonymousId,
    companionId,
    primaryInterest,
    interactionStyle,
    accessibility,
    ageTier,
    consentForLocalStorage,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
  };

  const isValid = strippedForbiddenFields.length === 0 && validationErrors.length === 0;

  return {
    isValid,
    sanitizedProfile,
    strippedForbiddenFields,
    validationErrors,
  };
}
