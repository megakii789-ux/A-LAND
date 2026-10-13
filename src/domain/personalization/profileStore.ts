/**
 * 本地隐私与个性化配置存储管理 (Personalization Profile Store V1.0)
 * 遵循 docs/PRODUCT_CONTRACTS.md, docs/SAFETY_MODEL.md
 * 
 * 隐私原则：
 * 1. 默认本机运行 (Local-only)：未开启或撤回同意时仅驻留内存，绝不向任何外部服务同步；
 * 2. 最小化与去诊断化：仅存储选中的动物伙伴、兴趣皮肤和无障碍开关；严禁推断精神状态与人格画像；
 * 3. 完整的用户可控权：提供查看、修改、恢复默认、撤回保存许可、一键彻底清除功能。
 */

import { PersonalizationProfile } from './types';
import { DEFAULT_PERSONALIZATION_PROFILE } from './constants';
import { validateAndSanitizeProfile } from './schema';

export const PERSONALIZATION_STORAGE_KEY = 'aland_child_personalization_v1';

// 内存暂存状态（当用户未许可本地持久化时使用）
let inMemorySessionProfile: PersonalizationProfile = { ...DEFAULT_PERSONALIZATION_PROFILE };

/**
 * 加载个性化偏好
 */
export function loadPersonalizationProfile(): PersonalizationProfile {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return inMemorySessionProfile;
  }

  try {
    const rawData = window.localStorage.getItem(PERSONALIZATION_STORAGE_KEY);
    if (!rawData) {
      return inMemorySessionProfile;
    }

    const parsed = JSON.parse(rawData);
    const { isValid, sanitizedProfile } = validateAndSanitizeProfile(parsed);

    // 如果存储中存在撤回许可，则不信任本地持久化并重置
    if (!sanitizedProfile.consentForLocalStorage) {
      inMemorySessionProfile = { ...sanitizedProfile };
      return sanitizedProfile;
    }

    inMemorySessionProfile = sanitizedProfile;
    return sanitizedProfile;
  } catch {
    return inMemorySessionProfile;
  }
}

/**
 * 保存个性化偏好
 */
export function savePersonalizationProfile(profile: Partial<PersonalizationProfile>): PersonalizationProfile {
  const merged: PersonalizationProfile = {
    ...inMemorySessionProfile,
    ...profile,
    updatedAt: Date.now(),
  };

  const { sanitizedProfile } = validateAndSanitizeProfile(merged);
  inMemorySessionProfile = sanitizedProfile;

  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      if (sanitizedProfile.consentForLocalStorage) {
        window.localStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(sanitizedProfile));
      } else {
        // 若撤回了本地存储许可，从 localStorage 移除
        window.localStorage.removeItem(PERSONALIZATION_STORAGE_KEY);
      }
    } catch {
      // 容错处理
    }
  }

  return sanitizedProfile;
}

/**
 * 重置为初始默认偏好
 */
export function resetPersonalizationProfile(): PersonalizationProfile {
  const resetProfile: PersonalizationProfile = {
    ...DEFAULT_PERSONALIZATION_PROFILE,
    updatedAt: Date.now(),
  };

  inMemorySessionProfile = resetProfile;

  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      window.localStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(resetProfile));
    } catch {
      // 容错处理
    }
  }

  return resetProfile;
}

/**
 * 一键彻底清除本地所有个性化偏好数据（无痕清理）
 */
export function clearAllPersonalizationData(): void {
  inMemorySessionProfile = {
    ...DEFAULT_PERSONALIZATION_PROFILE,
    consentForLocalStorage: false,
    updatedAt: Date.now(),
  };

  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      window.localStorage.removeItem(PERSONALIZATION_STORAGE_KEY);
    } catch {
      // 容错处理
    }
  }
}

/**
 * 撤回本地持久化许可并清理本地缓存（仅保留当次内存会话）
 */
export function revokeConsentAndWipeStorage(): PersonalizationProfile {
  inMemorySessionProfile = {
    ...inMemorySessionProfile,
    consentForLocalStorage: false,
    updatedAt: Date.now(),
  };

  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      window.localStorage.removeItem(PERSONALIZATION_STORAGE_KEY);
    } catch {
      // 容错处理
    }
  }

  return inMemorySessionProfile;
}

/**
 * 输出隐私数据流图 Markdown（供技术与伦理审计使用）
 */
export function getPrivacyDataFlowChart(): string {
  return `
\`\`\`mermaid
flowchart TD
  subgraph ChildDevice ["儿童本地设备 (Browser / Local Device)"]
    ChildAction["儿童选择偏好 (角色 / 兴趣 / 语音 / 动效)"]
    Sanitizer["Schema & 严禁字段过滤器 (Stripper)"]
    InMemoryState["内存会话状态 (In-Memory State)"]
    ConsentCheck{"用户是否同意在本地保存？"}
    LocalStorage["本地存储 (LocalStorage)<br/>- 仅存储中性标识<br/>- 无真实姓名<br/>- 无心理诊断"]
    PurgeAction["一键彻底清除 / 撤回许可"]
  end

  subgraph CloudServer ["云端环境 (Cloud & Network)"]
    NoCloudProfile["【物理阻断】禁止上传心理画像或儿童私密偏好"]
    NoAIProfiling["【物理阻断】禁止未经审查的即时 AI 心理预测"]
  end

  ChildAction --> Sanitizer
  Sanitizer --> InMemoryState
  InMemoryState --> ConsentCheck
  ConsentCheck -- 是 (默认) --> LocalStorage
  ConsentCheck -- 否 / 撤回 --> PurgeAction
  PurgeAction -->|立即擦除| LocalStorage

  InMemoryState -.->|严格禁止流动| NoCloudProfile
  LocalStorage -.->|严格禁止流动| NoAIProfiling
\`\`\`
`;
}
