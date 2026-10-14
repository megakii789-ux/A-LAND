import { describe, it, expect, beforeEach } from 'vitest';
import {
  AnimalCompanionId,
  InterestActivityId,
  PersonalizationProfile,
  ANIMAL_COMPANIONS,
  INTEREST_ACTIVITIES,
  DEFAULT_PERSONALIZATION_PROFILE,
  validateAndSanitizeProfile,
  PERSONALIZATION_SCHEMA_SPEC,
  THEMED_SCENARIOS,
  getThemedScenarioByInterest,
  evaluateThemedCluePlacement,
  dispatchAgeTierAdaptation,
  getAgeTierAuditSummary,
  loadPersonalizationProfile,
  savePersonalizationProfile,
  resetPersonalizationProfile,
  clearAllPersonalizationData,
  revokeConsentAndWipeStorage,
  getPrivacyDataFlowChart,
  PERSONALIZATION_STORAGE_KEY,
} from '../../src/domain/personalization';
import { StructureId } from '../../src/domain/transfer/types';

// Mock localStorage and window in node test runner
class MockStorage implements Storage {
  private store: Record<string, string> = {};
  get length() {
    return Object.keys(this.store).length;
  }
  clear(): void {
    this.store = {};
  }
  getItem(key: string): string | null {
    return key in this.store ? this.store[key] : null;
  }
  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

if (typeof globalThis.window === 'undefined') {
  const mockStorage = new MockStorage();
  (globalThis as any).window = {
    localStorage: mockStorage,
  };
} else if (!globalThis.window.localStorage) {
  (globalThis.window as any).localStorage = new MockStorage();
}

describe('AG-04B: 受控儿童个性化引擎规范与认知安全契约测试', () => {
  beforeEach(() => {
    // 清理测试环境本地存储
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    resetPersonalizationProfile();
  });

  // =========================================================================
  // 1. 统一认知目标在多套兴趣皮肤下的同构性与安全边界 (Cognitive Isomorphism)
  // =========================================================================
  describe('1. 认知同构性：同一认知目标在多种兴趣皮肤下保持严格等价', () => {
    const interestThemes: InterestActivityId[] = ['drawing', 'sports', 'nature', 'puzzle'];

    it('CONTRACT: 所有已审核场景必须具有相同的结构ID (FACT_VS_INFERENCE)', () => {
      interestThemes.forEach((theme) => {
        const scenario = getThemedScenarioByInterest(theme);
        expect(scenario.structureId).toBe(StructureId.FACT_VS_INFERENCE);
      });
    });

    it('CONTRACT: 所有场景必须标注为人工审核冻结版本 (AUDITED_FROZEN_V1)，严禁运行时动态盲生', () => {
      interestThemes.forEach((theme) => {
        const scenario = getThemedScenarioByInterest(theme);
        expect(scenario.auditStatus).toBe('AUDITED_FROZEN_V1');
        expect(scenario.frozenVersion).toBe('1.0.0-frozen');
        expect(scenario.auditorSignOff).toBeDefined();
        expect(scenario.auditorSignOff.length).toBeGreaterThan(0);
      });
    });

    it('CONTRACT: 每个兴趣皮肤严格拥有相同分类槽位：3个FACT + 1个INFERENCE + 1个UNKNOWN', () => {
      interestThemes.forEach((theme) => {
        const scenario = getThemedScenarioByInterest(theme);
        expect(scenario.hotspots.length).toBe(5);

        const facts = scenario.hotspots.filter((h) => h.category === 'FACT');
        const inferences = scenario.hotspots.filter((h) => h.category === 'INFERENCE');
        const unknowns = scenario.hotspots.filter((h) => h.category === 'UNKNOWN');

        expect(facts.length).toBe(3);
        expect(inferences.length).toBe(1);
        expect(unknowns.length).toBe(1);

        // 盲区未知必须标记为永久未知 (不能凭空推断)
        expect(unknowns[0].isPermanentUnknown).toBe(true);
      });
    });

    it('CONTRACT: 每个兴趣皮肤使用完全一致的三个分类目标盒', () => {
      interestThemes.forEach((theme) => {
        const scenario = getThemedScenarioByInterest(theme);
        expect(scenario.sortingBaskets.length).toBe(3);
        const basketIds = scenario.sortingBaskets.map((b) => b.id);
        expect(basketIds).toEqual(['EYES_OBSERVED', 'MIND_GUESSED', 'STILL_UNKNOWN']);
      });
    });

    it('CONTRACT: 线索评测逻辑 (evaluateThemedCluePlacement) 跨所有主题 100% 同构，无偏见、不责备', () => {
      // 1. FACT 放置评测
      const factCorrect = evaluateThemedCluePlacement('FACT', 'EYES_OBSERVED');
      expect(factCorrect.isMatch).toBe(true);
      expect(factCorrect.spokenFeedback).toContain('真实事实');

      const factMisplaced = evaluateThemedCluePlacement('FACT', 'MIND_GUESSED');
      expect(factMisplaced.isMatch).toBe(false);
      expect(factMisplaced.spokenFeedback).toContain('眼睛清清楚楚看到的证据');

      // 2. INFERENCE 放置评测
      const inferenceCorrect = evaluateThemedCluePlacement('INFERENCE', 'MIND_GUESSED');
      expect(inferenceCorrect.isMatch).toBe(true);
      expect(inferenceCorrect.spokenFeedback).toContain('猜想和念头');

      const inferenceMisplaced = evaluateThemedCluePlacement('INFERENCE', 'EYES_OBSERVED');
      expect(inferenceMisplaced.isMatch).toBe(false);
      expect(inferenceMisplaced.spokenFeedback).toContain('温和提示');
      expect(inferenceMisplaced.spokenFeedback).not.toContain('你错了');

      // 3. UNKNOWN 盲区放置评测
      const unknownCorrect = evaluateThemedCluePlacement('UNKNOWN', 'STILL_UNKNOWN');
      expect(unknownCorrect.isMatch).toBe(true);
      expect(unknownCorrect.spokenFeedback).toContain('承认还不知道也是很有力量的事');

      const unknownMisplaced = evaluateThemedCluePlacement('UNKNOWN', 'MIND_GUESSED');
      expect(unknownMisplaced.isMatch).toBe(false);
      expect(unknownMisplaced.spokenFeedback).toContain('不要凭空猜想');
    });
  });

  // =========================================================================
  // 2. 偏好设置修改、重置、撤回许可与彻底清除 (User Preference Lifecycle)
  // =========================================================================
  describe('2. 偏好生命周期：修改、重置、撤回许可与完全清除', () => {
    it('CONTRACT: 允许自如切换中性动物伙伴', () => {
      const companions: AnimalCompanionId[] = ['guoguo_squirrel', 'beibei_otter', 'tiantian_raccoon', 'qiqi_deer'];
      companions.forEach((cId) => {
        const saved = savePersonalizationProfile({ companionId: cId });
        expect(saved.companionId).toBe(cId);
        expect(ANIMAL_COMPANIONS[cId].name).toBeDefined();
      });
    });

    it('CONTRACT: 允许自如切换主兴趣皮肤与交互偏好', () => {
      const saved1 = savePersonalizationProfile({
        primaryInterest: 'sports',
        interactionStyle: 'story_first',
      });
      expect(saved1.primaryInterest).toBe('sports');
      expect(saved1.interactionStyle).toBe('story_first');

      const saved2 = savePersonalizationProfile({
        primaryInterest: 'nature',
        interactionStyle: 'hands_on',
      });
      expect(saved2.primaryInterest).toBe('nature');
      expect(saved2.interactionStyle).toBe('hands_on');
    });

    it('CONTRACT: 允许独立开启/关闭语音、动效模式和简化文字说明', () => {
      const saved = savePersonalizationProfile({
        accessibility: {
          voiceEnabled: false,
          reducedMotion: true,
          simplifiedText: true,
        },
      });
      expect(saved.accessibility.voiceEnabled).toBe(false);
      expect(saved.accessibility.reducedMotion).toBe(true);
      expect(saved.accessibility.simplifiedText).toBe(true);
    });

    it('CONTRACT: 支持一键恢复为中性默认配置 (resetPersonalizationProfile)', () => {
      savePersonalizationProfile({
        companionId: 'tiantian_raccoon',
        primaryInterest: 'puzzle',
        accessibility: {
          voiceEnabled: false,
          reducedMotion: true,
          simplifiedText: true,
        },
      });

      const reset = resetPersonalizationProfile();
      expect(reset.companionId).toBe(DEFAULT_PERSONALIZATION_PROFILE.companionId);
      expect(reset.primaryInterest).toBe(DEFAULT_PERSONALIZATION_PROFILE.primaryInterest);
      expect(reset.accessibility.voiceEnabled).toBe(true);
      expect(reset.accessibility.reducedMotion).toBe(false);
      expect(reset.accessibility.simplifiedText).toBe(false);
    });

    it('CONTRACT: 支持撤回本地保存许可 (revokeConsentAndWipeStorage)，撤销后清除 localStorage', () => {
      savePersonalizationProfile({ companionId: 'beibei_otter', consentForLocalStorage: true });
      expect(window.localStorage.getItem(PERSONALIZATION_STORAGE_KEY)).not.toBeNull();

      const revoked = revokeConsentAndWipeStorage();
      expect(revoked.consentForLocalStorage).toBe(false);
      expect(window.localStorage.getItem(PERSONALIZATION_STORAGE_KEY)).toBeNull();
    });

    it('CONTRACT: 支持一键彻底清除本地数据 (clearAllPersonalizationData)', () => {
      savePersonalizationProfile({ companionId: 'qiqi_deer', consentForLocalStorage: true });
      clearAllPersonalizationData();
      expect(window.localStorage.getItem(PERSONALIZATION_STORAGE_KEY)).toBeNull();
    });
  });

  // =========================================================================
  // 3. 隐私与数据安全过滤器 (Privacy Stripper & Schema Auditing)
  // =========================================================================
  describe('3. 隐私与安全边界过滤器：严禁儿童敏感个人信息与心理推断', () => {
    it('CONTRACT: 严禁字段 (家庭结构、心理诊断、真实姓名等) 输入时必须被拦截并剥离', () => {
      const maliciousPayload = {
        pseudonymousId: 'child_anon_safe123',
        companionId: 'guoguo_squirrel',
        primaryInterest: 'drawing',
        interactionStyle: 'hands_on',
        accessibility: {
          voiceEnabled: true,
          reducedMotion: false,
          simplifiedText: false,
        },
        ageTier: 'EARLY_CHILDHOOD_5_7',
        consentForLocalStorage: true,
        updatedAt: Date.now(),
        // 违规注入字段：
        realName: '李小明',
        schoolName: '实验小学',
        familyStructure: 'divorced',
        psychologicalDiagnosis: 'ADHD',
        mentalHealthState: 'depressed',
        personalityType: 'introvert',
      };

      const result = validateAndSanitizeProfile(maliciousPayload);

      // 验证违规字段被识别并捕获
      expect(result.strippedForbiddenFields).toContain('realName');
      expect(result.strippedForbiddenFields).toContain('schoolName');
      expect(result.strippedForbiddenFields).toContain('familyStructure');
      expect(result.strippedForbiddenFields).toContain('psychologicalDiagnosis');
      expect(result.strippedForbiddenFields).toContain('mentalHealthState');
      expect(result.strippedForbiddenFields).toContain('personalityType');

      // 验证净化后的 Profile 中完全不包含上述非法属性
      const sanitized = result.sanitizedProfile as unknown as Record<string, unknown>;
      expect(sanitized.realName).toBeUndefined();
      expect(sanitized.schoolName).toBeUndefined();
      expect(sanitized.familyStructure).toBeUndefined();
      expect(sanitized.psychologicalDiagnosis).toBeUndefined();
      expect(sanitized.mentalHealthState).toBeUndefined();
      expect(sanitized.personalityType).toBeUndefined();
    });

    it('CONTRACT: 伪匿名ID必须符合安全正则规范，不能包含个人特征', () => {
      const validProfile = validateAndSanitizeProfile({
        pseudonymousId: 'child_anon_test_999',
        companionId: 'guoguo_squirrel',
        primaryInterest: 'drawing',
      });
      expect(validProfile.sanitizedProfile.pseudonymousId).toBe('child_anon_test_999');

      const invalidIdProfile = validateAndSanitizeProfile({
        pseudonymousId: 'real_name_john_doe',
        companionId: 'guoguo_squirrel',
      });
      // 应该自动重新分配匿名 ID
      expect(invalidIdProfile.sanitizedProfile.pseudonymousId).toMatch(/^child_anon_[a-zA-Z0-9_-]+$/);
    });

    it('CONTRACT: 隐私数据流图导出明确标注云端传输与AI画像为物理阻断', () => {
      const flowChart = getPrivacyDataFlowChart();
      expect(flowChart).toContain('禁止上传心理画像');
      expect(flowChart).toContain('物理阻断');
      expect(flowChart).toContain('LocalStorage');
    });
  });

  // =========================================================================
  // 4. 年龄分层架构守卫与 Fail-closed 安全降级 (Age Band Architecture)
  // =========================================================================
  describe('4. 年龄分层架构守卫：仅 5-7 岁为活跃验证层，其他存根安全降级', () => {
    it('CONTRACT: 5–7 岁 (EARLY_CHILDHOOD_5_7) 处于 ACTIVE_VERIFIED_V1 状态', () => {
      const dispatch = dispatchAgeTierAdaptation('EARLY_CHILDHOOD_5_7');
      expect(dispatch.effectiveTier).toBe('EARLY_CHILDHOOD_5_7');
      expect(dispatch.isFullyVerified).toBe(true);
      expect(dispatch.adaptationRules.minTouchTargetPx).toBe(56);
      expect(dispatch.adaptationRules.requiresVoiceGuidance).toBe(true);
      expect(dispatch.fallbackNotice).toBeUndefined();
    });

    it('CONTRACT: 2–4 岁、8–10 岁、11–13 岁、14–17 岁预留存根安全降级至 5-7 岁已验证层', () => {
      const unverifiedTiers = ['TODDLER_2_4', 'MIDDLE_CHILDHOOD_8_10', 'EARLY_TEEN_11_13', 'LATE_TEEN_14_17'] as const;

      unverifiedTiers.forEach((tier) => {
        const dispatch = dispatchAgeTierAdaptation(tier);
        expect(dispatch.requestedTier).toBe(tier);
        expect(dispatch.effectiveTier).toBe('EARLY_CHILDHOOD_5_7');
        expect(dispatch.isFullyVerified).toBe(false);
        expect(dispatch.fallbackNotice).toContain('安全降级至经完整验证的 5–7 岁儿童操作适配层');
      });
    });

    it('CONTRACT: 年龄分层审计清单准确暴露状态，不虚假声称支持', () => {
      const summary = getAgeTierAuditSummary();
      const activeSummary = summary.filter((s) => s.isExecutableInChildV1);
      expect(activeSummary.length).toBe(1);
      expect(activeSummary[0].tier).toBe('EARLY_CHILDHOOD_5_7');

      const stubSummaries = summary.filter((s) => !s.isExecutableInChildV1);
      expect(stubSummaries.length).toBe(4);
      stubSummaries.forEach((s) => {
        expect(s.status).toBe('RESERVED_STUB');
      });
    });
  });
});
