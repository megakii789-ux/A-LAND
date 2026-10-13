# 统一场景模式与内容运行协议 V1.0 (Scene Schema V1.0)

**产品名称**: 晴雨小岛 (A-LAND)  
**文件版本**: V1.0.0  
**生效规范**: `src/domain/cognitive/types.ts` 与 `src/domain/cognitive/cognitiveValidator.ts`  
**向下兼容**: 100% 兼容既有迁移引擎 `src/domain/transfer/types.ts` (`LeafDefinition`)

---

## 一、架构设计意图

本协议旨在构建一套严密的、面向儿童独立判断训练的内容数据交换规范（Unified Scene Schema）。  
任何进入儿童端执行的内容包，必须经过本 Schema 检验器与认知宪法断言机审查，防止劣质内容、道德绑架、伪科学心理推断或有毒正能量注入系统。

---

## 二、完整 Schema 字段定义与强类型契约

每个统一场景（`UnifiedSceneDefinition`）包含以下 16 个核心区块：

| 字段名称 | 类型 | 必填 | 规范说明 |
| :--- | :--- | :---: | :--- |
| `sceneId` | `string` | 是 | 唯一场景标识符（如 `SCENE_A_PEER_ASKING_RESIDENCE_V1`） |
| `version` | `string` | 是 | 语义化版本号（如 `1.0.0`） |
| `ageBand` | `'AGE_5_7' \| 'AGE_6_8' \| 'AGE_7_9'` | 是 | 适用年龄段，默认设计基准为 6 岁 (`AGE_6_8`) |
| `title` | `string` | 是 | 场景标题，通俗中性，无专业术语 |
| `contextNarrationSpokenText` | `string` | 是 | 语音朗读情境主文本（儿童端以语音优先为主交互模式） |
| `cognitiveStructureId` | `StructureId` | 是 | 核心认知关系结构标识，必须在 `STRUCTURE_REGISTRY` 中注册 |
| `activeLayers` | `ReadonlyArray<CognitiveLayer>` | 是 | 本场景调动的六层内部认知层级（停、分、通、辨、择、验） |
| `pauseGroundingPrompt` | `string` | 否 | **停 (Layer 1)**: 生理与情绪平复指引文案 |
| `confirmedFacts` | `ReadonlyArray<string>` | 是 | **分 (Layer 2)**: 眼睛耳朵亲见、不可辩驳的客观事实 |
| `characterEmotions` | `ReadonlyArray<{ characterName, emotionWord, bodilySensation }>` | 是 | **分 (Layer 2)**: 角色真实情绪体验与生理感受 |
| `interpretationsAndGuesses` | `ReadonlyArray<{ characterName, guessOrThought, isConfirmed: false }>` | 是 | **分 (Layer 2)**: 主观脑补、解释与猜测（强类型约束 `isConfirmed: false`） |
| `unconfirmedInformation` | `ReadonlyArray<string>` | 是 | **通 (Layer 3)**: 尚未掌握的事实信息与认知盲区 (Epistemic Unknowns) |
| `perspectives` | `ReadonlyArray<CharacterPerspective>` | 是 | **通 (Layer 3)**: 至少两个视角的可见与不可见信息对比 |
| `safetyBoundaryAssessment` | `SceneSafetyAssessment` | 是 | **辨 (Layer 4)**: 安全红线研判与是否强制跳过多视角权衡 (`bypassTradeoffFlow`) |
| `actionChoices` | `ReadonlyArray<SceneActionChoice>` | 是 | **择 (Layer 5)**: 自主选择行动（至少 2 项，包含控制点与隐私等级） |
| `exitOrPauseOptions` | `ExitOrPauseSupport` | 是 | 允许不说、少说、跳过与无羞耻退出的完整支持 |
| `requiresAdultCoReading` | `boolean` | 是 | 是否建议成年人共同陪伴阅读与讨论 |
| `isHeldOutTransfer` | `boolean` | 是 | 是否为未训练的独立检验迁移叶 (Held-Out Leaf) |
| `surfaceDomain` | `SurfaceDomain` | 是 | 生活情境领域（`school`, `two_homes`, `nature`, `playground` 等） |
| `allowNegativeEmotionPreservation` | `boolean` | 否 | 是否允许保持失望、拒绝强迫积极思维 (Anti-Toxic Positivity) |
| `provenance` | `SceneProvenance` | 是 | 内容来源与专业伦理安全审核元数据 (`reviewStatus: 'REVIEWED_SAFE'`) |

---

## 三、三个标准测试场景机器可读规范

### 1. 场景 A：同学问起父母为什么分开居住
- **情境标识**: `SCENE_A_PEER_ASKING_RESIDENCE_V1`
- **结构 ID**: `StructureId.FACT_VS_INFERENCE`
- **核心契约**:
  - 允许不说、少说、私下说、求助。
  - **绝不把公开披露定义为唯一勇敢行为**。
  - 提供 3 种自主行动选择：
    1. 简要回答一句事实并划定边界 (`MINIMAL_DISCLOSURE`)；
    2. 礼貌拒绝并转移话题 (`NO_DISCLOSURE`)；
    3. 先不回答，放学私下找信任家长商量 (`PRIVATE_TO_TRUSTED_ADULT`)。
  - 退出指引承诺：“你的心里有一扇属于自己的小门，什么时候开、开多大，完全由你决定。”

### 2. 场景 B：同学因为家庭情况故意嘲笑或欺负主角
- **情境标识**: `SCENE_B_PEER_BULLYING_FAMILY_V1`
- **结构 ID**: `StructureId.BEHAVIOR_PERSON_SEPARATION`
- **核心契约**:
  - `isBoundaryTriggered: true`，触发 `Boundary.PSYCHOLOGICAL_SAFETY`。
  - **`bypassTradeoffFlow: true`**：强制跳过多视角权衡，**绝不通过理解欺凌者来合理化欺凌**！
  - 提供 3 种明确的安全边界与现实支持行动：
    1. 严肃大声说不并转身离开 (`isSafeBoundaryAction: true`)；
    2. 立刻向值日老师报告寻求现实干预 (`isEmergencyHelp: true`)；
    3. 退出冲突圈走向安全朋友 (`isSafeBoundaryAction: true`)。
  - 现实安全通道：定义明确的逃离与报告路径。

### 3. 场景 C：原定的户外活动因为下雨取消
- **情境标识**: `SCENE_C_RAINY_OUTDOOR_CANCEL_V1`
- **结构 ID**: `StructureId.PERSPECTIVE_DEPENDENT_EFFECT`
- **核心契约**:
  - `allowNegativeEmotionPreservation: true`：**允许孩子保持失望，绝不强迫积极思考**。
  - 区分可控与不可控控制点：
    - 不可控：下雨天气、户外取消；
    - 可控：允许自己坐地毯上发呆抱玩偶 5 分钟、在客厅用被子搭探险帐篷、在窗前看小蜗牛。
  - 提供无压力的行动选项与平静反馈。

---

## 四、迁移引擎兼容性与投影机制

在 `src/domain/cognitive/transferBridge.ts` 中实现了双向投影协议：

```typescript
// 将 UnifiedSceneDefinition 投影为既有迁移引擎认可的 LeafDefinition
const leaf: LeafDefinition = convertUnifiedSceneToLeaf(scene);

// 验证其符合既有迁移架构契约 (validateLeafDefinition)
const auditReport = auditSceneTransferCompatibility(scene);
// auditReport.isFullyCompatibleWithTransferEngine === true
```

- **认知结构注册表映射**: `cognitiveStructureId` 严格挂载至 `STRUCTURE_REGISTRY` 对应条目。
- **表面情境与情感负荷投影**: 边界触发映射为 `deep`，自然情境映射为 `light`。
- **零工具泄露保证**: 严禁在转化的题干或提示中泄露“双面币”、“小天平”等工具术语。

---

## 五、负向测试规范矩阵

任何合规的 Scene 必须在以下负向攻击下准确触发拦截：

| 负向测试场景 | 预期触发拦截错误码 | 保护逻辑 |
| :--- | :--- | :--- |
| 欺凌场景下开启双面币权衡 (`bypassTradeoffFlow: false`) | `CONSTITUTION_RULE_B_VIOLATION` | 禁止利用多视角工具为欺凌暴力洗白 |
| 行动选项包含“原谅欺凌 / 默默挨打”合理化文案 | `CONSTITUTION_RULE_B_VIOLATION` | 严禁引导受害者忍受伤害 |
| 强迫公开披露隐私 / 文案绑定“不说就是懦弱” | `CONSTITUTION_RULE_C_VIOLATION` | 保护隐私决定权与心理安全 |
| 剥夺全部退出与沉默支持 (`allowSilence: false`) | `CONSTITUTION_RULE_C_VIOLATION` | 必须提供无羞耻感出口 |
| 文本出现“不正常家庭 / 破碎家庭 / 坏人”等标签 | `CONSTITUTION_RULE_A_VIOLATION` | 严格分离具体行为与人本身 |
| 场景根对象注入心理打分或能力评分属性 | `CONSTITUTION_RULE_D_VIOLATION` | 严禁自动化心理诊断与评分 |
| 挫折情境中出现“不准难过 / 必须立刻开心” | `TOXIC_POSITIVITY_VIOLATION` | 捍卫真实失望情绪的正当性 |
| 缺少已确认事实或将猜测标为确认事实 | `MISSING_FACTS` / `GUESS_CANNOT_BE_CONFIRMED` | 严格保障事实与猜想分离 |
| 全部反馈均不允许重新调整 (`allowsReadjustment: false`) | `MISSING_READJUSTABLE_FEEDBACK` | 保障第 6 层（验）真实有效 |
