# 内容模型与叶子结构规范 (Content Schema & Leaf Specifications)

**版本**：1.0.0 (Phase B)  
**设计目标**：确保儿童端教学内容遵循“关系结构统一，表面情境多样”的认知迁移规律。

---

## 1. 概念分层架构

```
[根 Root]：退后一步 (Step Back / Decentering) + 分、通、择 三种心智姿态
   │
   ▼
[干 Trunk]：稳定结构体系 (StructureId Registry)
   │
   ▼
[枝 Branch]：生活情境领域 (Surface Domains: 学校、两家往返、同伴交往、日常作息等)
   │
   ▼
[叶 Leaf]：具体可交互卡片 (LeafDefinition: 训练叶 Training Leaf 与 检验叶 Held-Out Leaf)
```

---

## 2. 核心结构注册表 (StructureId Registry)

每一个合法的 `structureId` 代表一种经过认知发展学论证的心智应对模型：

| StructureId | 思考姿态 | 认知结构内涵 |
| :--- | :--- | :--- |
| `FEN_SINGLE_BURDEN_SPLIT` | **分 (Divide)** | 将一个感觉“做不完/太大”的任务，拆分为按时间、空间或动作独立的微小执行步。 |
| `FEN_OWNERSHIP_SEPARATION` | **分 (Divide)** | 区分“我的情绪/责任”与“别人的情绪/责任”（如：大人生气是大人的情绪，不是我犯错引起的）。 |
| `TONG_FEELING_EXPRESSION` | **通 (Communicate)** | 建立内心主观体验与现实语言的沟通桥梁，用安全无指责的句式表达需要。 |
| `TONG_PERSPECTIVE_CROSSING` | **通 (Communicate)** | 识别对方可能由于视线、时间差或信息不对称而未察觉到的事实。 |
| `ZE_CHOICE_WITHIN_LIMIT` | **择 (Choose)** | 在既定现实框架（不能改变事实）下，自主选择个人可以掌控的行动路径。 |
| `ZE_CALM_DOWN_STRATEGY` | **择 (Choose)** | 当强烈情绪来袭时，在多种自我安抚工具（喝水、数数、抱玩偶、退一步）中择一实践。 |

---

## 3. 叶子实体定义规范 (LeafDefinition Schema)

```typescript
export interface LeafDefinition {
  /** 唯一内容标识符 */
  leafId: string;

  /** 底层认知逻辑关系结构 (必须注册于 StructureId Registry) */
  structureId: StructureId;

  /** 思考姿态归属 */
  posture: 'FEN' | 'TONG' | 'ZE';

  /** 表面情境领域 (不可等同于 structureId) */
  surfaceDomain: 'school' | 'two_homes' | 'friendship' | 'daily_routine' | 'sibling';

  /** 是否为隔离检验叶 (用于评估无提示下的迁移能力) */
  isHeldOutTransfer: boolean;

  /** 脚手架进阶序列位置 (1-4) */
  scaffoldTier: 1 | 2 | 3 | 4;

  /** 适合的最小年龄 (默认 6) */
  targetAgeMin: number;

  /** 面向儿童的口语化情境题面 (以语音朗读为主) */
  promptSpokenText: string;

  /** 关键操作选项或步骤列表 (最少2项，最多4项，防止认知过载) */
  stepsOrOptions: ReadonlyArray<{
    id: string;
    labelSpokenText: string;
    isKeyAction: boolean;
  }>;
}
```

---

## 4. 迁移配对有效性规则 (Transfer Pair Validity)

为证明儿童习得的是“可迁移的心智方法”，而非机械记忆：
1. **结构相同性 (`structureIdMatch === true`)**：训练叶与检验叶必须指向完全一致的 `structureId`。
2. **表面相异性 (`surfaceDomainMatch === false`)**：检验叶的 `surfaceDomain` 必须不同于训练叶（例如：从学校生活迁移到家庭收拾）。
3. **隔离性 (`isHeldOutTransfer === true`)**：检验叶不得在训练环节作为示例出现。
4. **禁止引导泄漏**：在呈现检验叶时，不得提示“请像刚才那样用‘分’把东西切开”，而应自然呈现困境情境，观察儿童自发调用的策略。
