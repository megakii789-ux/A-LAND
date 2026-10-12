import { describe, it, expect } from 'vitest';
import {
  StructureId,
  LeafDefinition,
  validateLeafDefinition,
  validateTransferPair,
  STRUCTURE_REGISTRY,
  SEED_TRANSFER_LEAVES,
  validateSeedTransferLeaves,
  filterLeaves,
  buildSceneComparisonView,
  assertNoToolNameLeakageInComparison,
  IDENTITY_AND_RELATION_PROGRESSION_LINE,
  isIdentityOrRelationStructure,
  getProgressionStepForLeaf,
} from '../../src/domain/transfer';

describe('Transfer Contract & Leaf Schema (迁移契约与叶子模型)', () => {
  it('CRITICAL CONTRACT 5: held-out transfer leaf 必须有注册的有效 structureId', () => {
    const invalidHeldOutLeafMissingStructure = {
      leafId: 'heldout_001',
      title: '缺少结构的叶子',
      posture: 'FEN',
      surfaceDomain: 'school',
      emotionalWeight: 'light',
      personalDistance: 'character',
      cognitiveLoad: 'low',
      boundary: 'NONE',
      isHeldOutTransfer: true,
      scaffoldTier: 2,
      targetAgeMin: 6,
      promptSpokenText: '桌子上的画笔全倒了，我们要怎么收拾呢？',
      stepsOrOptions: [
        { id: 'step_1', labelSpokenText: '先把粗笔收进蓝色笔筒', isKeyAction: true },
        { id: 'step_2', labelSpokenText: '再把细笔装进笔袋', isKeyAction: false },
      ],
    };

    const checkMissing = validateLeafDefinition(invalidHeldOutLeafMissingStructure);
    expect(checkMissing.isValid).toBe(false);
    expect(checkMissing.errors.some((e) => e.includes('structureId is missing'))).toBe(true);

    const invalidHeldOutLeafFakeStructure = {
      ...invalidHeldOutLeafMissingStructure,
      structureId: 'RANDOM_UNREGISTERED_TAG',
    };

    const checkFake = validateLeafDefinition(invalidHeldOutLeafFakeStructure);
    expect(checkFake.isValid).toBe(false);
    expect(checkFake.errors.some((e) => e.includes('not registered in STRUCTURE_REGISTRY'))).toBe(true);

    const validHeldOutLeaf: LeafDefinition = {
      leafId: 'heldout_valid_001',
      title: '有效的检验叶',
      structureId: StructureId.FACT_VS_INFERENCE,
      posture: 'FEN',
      surfaceDomain: 'school',
      emotionalWeight: 'light',
      personalDistance: 'character',
      cognitiveLoad: 'low',
      boundary: 'NONE',
      isHeldOutTransfer: true,
      scaffoldTier: 2,
      targetAgeMin: 6,
      promptSpokenText: '桌子上的画笔全倒了，我们要怎么收拾呢？',
      stepsOrOptions: [
        { id: 'step_1', labelSpokenText: '先把粗笔收进蓝色笔筒', isKeyAction: true },
        { id: 'step_2', labelSpokenText: '再把细笔装进笔袋', isKeyAction: false },
      ],
    };

    const checkValid = validateLeafDefinition(validHeldOutLeaf);
    expect(checkValid.isValid).toBe(true);
    expect(checkValid.errors).toHaveLength(0);
  });

  it('CONTRACT: 迁移检验配对必须共享底层结构，但必须跨越不同的表面情境', () => {
    const trainingLeaf: LeafDefinition = {
      leafId: 'train_lego_01',
      title: '收积木',
      structureId: StructureId.FEN_SINGLE_BURDEN_SPLIT,
      posture: 'FEN',
      surfaceDomain: 'daily_routine',
      emotionalWeight: 'light',
      personalDistance: 'character',
      cognitiveLoad: 'low',
      boundary: 'NONE',
      isHeldOutTransfer: false,
      scaffoldTier: 1,
      targetAgeMin: 6,
      promptSpokenText: '地毯上的大城堡积木倒了，好大一堆呀。',
      stepsOrOptions: [
        { id: 'opt_1', labelSpokenText: '先捡红色大砖块', isKeyAction: true },
        { id: 'opt_2', labelSpokenText: '再捡黄色小轮子', isKeyAction: true },
      ],
    };

    const validTransferLeaf: LeafDefinition = {
      leafId: 'test_backpack_01',
      title: '装书包',
      structureId: StructureId.FEN_SINGLE_BURDEN_SPLIT,
      posture: 'FEN',
      surfaceDomain: 'two_homes',
      emotionalWeight: 'medium',
      personalDistance: 'peer',
      cognitiveLoad: 'moderate',
      boundary: 'NONE',
      isHeldOutTransfer: true,
      scaffoldTier: 2,
      targetAgeMin: 6,
      promptSpokenText: '两个家之间要带的东西太多了，装不下了。',
      stepsOrOptions: [
        { id: 'opt_1', labelSpokenText: '今天先装要画画的书', isKeyAction: true },
        { id: 'opt_2', labelSpokenText: '小睡衣下次再带', isKeyAction: false },
      ],
    };

    const result = validateTransferPair(trainingLeaf, validTransferLeaf);
    expect(result.isValidTransferPair).toBe(true);
    expect(result.sharedStructureId).toBe(StructureId.FEN_SINGLE_BURDEN_SPLIT);
  });

  it('CONTRACT: 表面情境相同的重复测试绝不能作为迁移证据 (禁止以情境相似替代结构迁移)', () => {
    const trainingLeaf: LeafDefinition = {
      leafId: 'train_school_01',
      title: '收卡片',
      structureId: StructureId.FEN_SINGLE_BURDEN_SPLIT,
      posture: 'FEN',
      surfaceDomain: 'school',
      emotionalWeight: 'light',
      personalDistance: 'character',
      cognitiveLoad: 'low',
      boundary: 'NONE',
      isHeldOutTransfer: false,
      scaffoldTier: 1,
      targetAgeMin: 6,
      promptSpokenText: '教室里有很多散落的卡片。',
      stepsOrOptions: [
        { id: 's1', labelSpokenText: '先收动物卡', isKeyAction: true },
        { id: 's2', labelSpokenText: '再收植物卡', isKeyAction: false },
      ],
    };

    const sameDomainLeaf: LeafDefinition = {
      leafId: 'test_school_02',
      title: '收笔',
      structureId: StructureId.FEN_SINGLE_BURDEN_SPLIT,
      posture: 'FEN',
      surfaceDomain: 'school',
      emotionalWeight: 'light',
      personalDistance: 'character',
      cognitiveLoad: 'low',
      boundary: 'NONE',
      isHeldOutTransfer: true,
      scaffoldTier: 2,
      targetAgeMin: 6,
      promptSpokenText: '教室里有很多散落的画笔。',
      stepsOrOptions: [
        { id: 's1', labelSpokenText: '先收蜡笔', isKeyAction: true },
        { id: 's2', labelSpokenText: '再收铅笔', isKeyAction: false },
      ],
    };

    const collisionResult = validateTransferPair(trainingLeaf, sameDomainLeaf);
    expect(collisionResult.isValidTransferPair).toBe(false);
    expect(collisionResult.reason).toContain('Surface context collision');
  });

  it('CONTRACT: 6 岁儿童选项数量必须控制在 2 到 4 项之间', () => {
    const overloadedLeaf = {
      leafId: 'overloaded_01',
      title: '过多选项',
      structureId: StructureId.ZE_CHOICE_WITHIN_LIMIT,
      posture: 'ZE',
      surfaceDomain: 'daily_routine',
      emotionalWeight: 'light',
      personalDistance: 'character',
      cognitiveLoad: 'low',
      boundary: 'NONE',
      isHeldOutTransfer: false,
      scaffoldTier: 1,
      targetAgeMin: 6,
      promptSpokenText: '睡前选哪个小故事听呢？',
      stepsOrOptions: [
        { id: '1', labelSpokenText: '故事1', isKeyAction: false },
        { id: '2', labelSpokenText: '故事2', isKeyAction: false },
        { id: '3', labelSpokenText: '故事3', isKeyAction: false },
        { id: '4', labelSpokenText: '故事4', isKeyAction: false },
        { id: '5', labelSpokenText: '故事5', isKeyAction: false },
      ],
    };

    const check = validateLeafDefinition(overloadedLeaf);
    expect(check.isValid).toBe(false);
    expect(check.errors.some((e) => e.includes('cannot exceed 4 items'))).toBe(true);
  });
});

describe('Phase J: StructureRegistry & Seven Core Cognitive Structures', () => {
  const REQUIRED_STRUCTURES = [
    StructureId.FACT_VS_INFERENCE,
    StructureId.PERSPECTIVE_DEPENDENT_EFFECT,
    StructureId.CHOICE_TRADEOFF,
    StructureId.MULTI_ATTRIBUTE_IDENTITY,
    StructureId.CONTEXT_DEPENDENT_BEHAVIOR,
    StructureId.RELATION_CHANGE_CONTINUITY,
    StructureId.BEHAVIOR_PERSON_SEPARATION,
  ];

  it('StructureRegistry 至少完整支持要求的七大认知结构', () => {
    for (const structId of REQUIRED_STRUCTURES) {
      expect(STRUCTURE_REGISTRY[structId]).toBeDefined();
      expect(STRUCTURE_REGISTRY[structId].id).toBe(structId);
      expect(STRUCTURE_REGISTRY[structId].title).toBeTruthy();
      expect(STRUCTURE_REGISTRY[structId].cognitiveGoal).toBeTruthy();
      expect(STRUCTURE_REGISTRY[structId].childMetaphor).toBeTruthy();
    }
  });

  it('每个结构至少包含 2 training leaves, 1 held-out transfer leaf, 1 foil leaf', () => {
    for (const structId of REQUIRED_STRUCTURES) {
      const leavesForStructure = SEED_TRANSFER_LEAVES.filter((l) => l.structureId === structId && !l.isFoil);
      const trainingLeaves = leavesForStructure.filter((l) => !l.isHeldOutTransfer);
      const heldOutLeaves = leavesForStructure.filter((l) => l.isHeldOutTransfer);

      expect(trainingLeaves.length).toBeGreaterThanOrEqual(2);
      expect(heldOutLeaves.length).toBeGreaterThanOrEqual(1);

      // 验证干扰项 (foil): 同表面情境或类似场景，但结构不同
      // 检验 SEED_TRANSFER_LEAVES 中对应于此结构或对应该结构情境的 foil
      const relatedFoil = SEED_TRANSFER_LEAVES.find(
        (l) => l.isFoil && (l.surfaceDomain === heldOutLeaves[0].surfaceDomain || l.structureId !== structId)
      );
      expect(relatedFoil).toBeDefined();
    }

    // 总计 28 张标准叶子
    expect(SEED_TRANSFER_LEAVES.length).toBe(28);

    const validation = validateSeedTransferLeaves();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('CRITICAL CONTRACT: 系统不得在 held-out transfer leaf 中向孩子明示对应工具', () => {
    const heldOutLeaves = SEED_TRANSFER_LEAVES.filter((l) => l.isHeldOutTransfer);
    expect(heldOutLeaves.length).toBe(7);

    for (const leaf of heldOutLeaves) {
      if (leaf.associatedToolName) {
        // prompt 不得包含工具名称
        expect(leaf.promptSpokenText.includes(leaf.associatedToolName)).toBe(false);
        // 选项不得包含工具名称
        for (const opt of leaf.stepsOrOptions) {
          expect(opt.labelSpokenText.includes(leaf.associatedToolName)).toBe(false);
        }
      }
    }

    // 严禁性校验器：如果有人故意在 held-out 叶子 prompt 里加上工具名，校验器必须判定非法
    const leakingLeaf: LeafDefinition = {
      ...heldOutLeaves[0],
      leafId: 'leaking_test_01',
      associatedToolName: '放大镜',
      promptSpokenText: '请拿出你的放大镜，看一看谁在说谎！',
    };
    const leakCheck = validateLeafDefinition(leakingLeaf);
    expect(leakCheck.isValid).toBe(false);
    expect(leakCheck.errors.some((e) => e.includes('must not reveal tool name'))).toBe(true);
  });
});

describe('Phase J: Content Engine Multi-Dimensional Filter', () => {
  it('支持按 structureId 筛选', () => {
    const filtered = filterLeaves(SEED_TRANSFER_LEAVES, {
      structureId: StructureId.FACT_VS_INFERENCE,
    });
    expect(filtered.length).toBeGreaterThanOrEqual(3);
    expect(filtered.every((l) => l.structureId === StructureId.FACT_VS_INFERENCE)).toBe(true);
  });

  it('支持按 surfaceDomain 筛选', () => {
    const filtered = filterLeaves(SEED_TRANSFER_LEAVES, {
      surfaceDomain: 'two_homes',
    });
    expect(filtered.length).toBeGreaterThanOrEqual(4);
    expect(filtered.every((l) => l.surfaceDomain === 'two_homes')).toBe(true);
  });

  it('支持按 emotionalWeight 筛选', () => {
    const deepLeaves = filterLeaves(SEED_TRANSFER_LEAVES, {
      emotionalWeight: 'deep',
    });
    expect(deepLeaves.length).toBeGreaterThanOrEqual(3);
    expect(deepLeaves.every((l) => l.emotionalWeight === 'deep')).toBe(true);
  });

  it('支持按 personalDistance 筛选', () => {
    const characterLeaves = filterLeaves(SEED_TRANSFER_LEAVES, {
      personalDistance: 'character',
    });
    expect(characterLeaves.length).toBeGreaterThanOrEqual(7);
    expect(characterLeaves.every((l) => l.personalDistance === 'character')).toBe(true);
  });

  it('支持按 cognitiveLoad 筛选', () => {
    const lowLoad = filterLeaves(SEED_TRANSFER_LEAVES, {
      cognitiveLoad: 'low',
    });
    expect(lowLoad.length).toBeGreaterThanOrEqual(7);
    expect(lowLoad.every((l) => l.cognitiveLoad === 'low')).toBe(true);
  });

  it('支持按 boundary 筛选 (PHYSICAL_HARM 触发围栏契约)', () => {
    const harmLeaves = filterLeaves(SEED_TRANSFER_LEAVES, {
      boundary: 'PHYSICAL_HARM',
    });
    expect(harmLeaves.length).toBe(1);
    expect(harmLeaves[0].leafId).toBe('behavior_person_heldout');
  });

  it('支持复合维度组合筛选', () => {
    const complexFilter = filterLeaves(SEED_TRANSFER_LEAVES, {
      structureId: StructureId.RELATION_CHANGE_CONTINUITY,
      surfaceDomain: 'two_homes',
      emotionalWeight: 'deep',
    });
    expect(complexFilter.length).toBe(1);
    expect(complexFilter[0].leafId).toBe('relation_heldout');
  });
});

describe('Phase J: 五级迁移阶梯内容线 (MULTI_ATTRIBUTE_IDENTITY / RELATION_CHANGE_CONTINUITY)', () => {
  it('五级阶梯为特定内容发展线，而非所有迁移的普遍等级', () => {
    expect(IDENTITY_AND_RELATION_PROGRESSION_LINE).toHaveLength(5);

    // 验证所有阶梯只涵盖 MULTI_ATTRIBUTE_IDENTITY 与 RELATION_CHANGE_CONTINUITY
    for (const step of IDENTITY_AND_RELATION_PROGRESSION_LINE) {
      expect(isIdentityOrRelationStructure(step.structureId)).toBe(true);
      expect([
        StructureId.MULTI_ATTRIBUTE_IDENTITY,
        StructureId.RELATION_CHANGE_CONTINUITY,
      ]).toContain(step.structureId);
    }

    // 检验其他结构不归属于此特定内容线
    expect(isIdentityOrRelationStructure(StructureId.FACT_VS_INFERENCE)).toBe(false);
    expect(isIdentityOrRelationStructure(StructureId.CHOICE_TRADEOFF)).toBe(false);

    // 检验叶子能够正确映射到特定阶梯
    const multiAttrLeaf = SEED_TRANSFER_LEAVES.find((l) => l.leafId === 'multi_attr_train_1')!;
    const step = getProgressionStepForLeaf(multiAttrLeaf);
    expect(step).toBeDefined();
    expect(step?.stageOrder).toBe(1);
  });
});

describe('Phase J: “回头比一比” (Scene-to-Scene Comparison without Tool Names)', () => {
  it('比一比是对两个生活情境的对照，严禁向孩子询问工具名字', () => {
    const leaf = SEED_TRANSFER_LEAVES.find((l) => l.leafId === 'persp_train_1')!;
    const comparisonView = buildSceneComparisonView(leaf, SEED_TRANSFER_LEAVES);

    expect(comparisonView).not.toBeNull();
    if (!comparisonView) return;

    // 对比的是两个具体情境
    expect(comparisonView.sceneA.situationSummary).toContain('池塘下雨小青蛙高兴小兔子难过');
    expect(comparisonView.sceneB.situationSummary).toContain('大象和小老鼠看桌上的水杯');

    // 问题聚焦于情境之间共通的道理
    expect(comparisonView.childSpokenQuestion).toContain('有什么悄悄一样的地方？');
    expect(comparisonView.childSpokenInsight).toContain('同一个东西，站在不同地方看，感觉一样吗？');

    // 严格安全审查：文案中严禁泄漏工具名或设计者术语
    const leakageCheck = assertNoToolNameLeakageInComparison(comparisonView);
    expect(leakageCheck.passed).toBe(true);
    expect(leakageCheck.violations).toHaveLength(0);
  });

  it('所有 seed leaves 的回头比一比均无工具名或设计者元术语泄漏', () => {
    for (const leaf of SEED_TRANSFER_LEAVES) {
      const view = buildSceneComparisonView(leaf, SEED_TRANSFER_LEAVES);
      if (view) {
        const check = assertNoToolNameLeakageInComparison(view);
        expect(check.passed).toBe(true);
        expect(check.violations).toHaveLength(0);
      }
    }
  });
});
