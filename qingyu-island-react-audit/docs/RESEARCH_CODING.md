> **历史文档提示（2026-10-09，0.6.2-audit.1）**
> 以下保留原 AI Studio 导出稿的内容，不代表当前实现已验证。
> 当前执行边界与验收结果以 `00-AUDIT-STATUS.md`、`LOCAL_REVIEW_CONTRACTS.md`、
> `PIXEL_AND_CONTRACT_AUDIT_2026-10-09.md` 和 `RELEASE_READINESS.md` 为准。
> 原文中的云服务、自动到场判断、自动失约阈值、完整训练/迁移有效性或“全部通过”不能直接用于发布声明。
> 未加提示的原稿副本保存在 `audit/baseline-docs/RESEARCH_CODING.md`。

# 研究编码与观测数据规范 (Research Coding Schema: F1-F7)

**版本**：1.0.0 (Phase B)  
**目的**：为学习科学评估、脚手架自适应支持和心理健康防护提供隐私安全、合规且具可解释性的量化观测字段。

---

## 1. 核心铁律与数据主权约束

1. **绝对隐私化 (Pseudonymous by Design)**：
   - 不采集真实儿童姓名、家庭地址、学校、同学姓名。
   - 不采集生物识别信息（不记录声纹、不识别人脸情绪表情）。
2. **严禁孩子原话用于算法心理评级**：
   - 孩子的自由录音、随手涂鸦、未寄出信件仅保存在本地设备存储 (`local-only`)，绝对不得上传至集中式云数据库。
   - 严禁通过文本语义模型对儿童进行“性格缺陷”、“心理病理学”或“创伤等级”打标。
3. **有限度结构化观测**：
   系统仅允许流转并统计经过脱敏的 **F1 - F7** 标准化研究编码。

---

## 2. 核心观测字段定义 (F1 - F7)

| 字段编码 | 字段名称 | 类型定义 | 业务与科学含义 |
| :--- | :--- | :--- | :--- |
| **F1** | `contentId` | `string` | 当前交互的叶子、工具或故事内容唯一标识。 |
| **F2** | `structureId` | `StructureId` | 当前内容所属的底层认知结构注册码（如 `FEN_SINGLE_BURDEN_SPLIT`）。 |
| **F3** | `supportLevel` | `SupportLevel` (`S0` - `S5`) | 完成本次交互所实际消耗的外部脚手架层级（严禁向儿童暴露）。 |
| **F4** | `failureCode` | `FailureCode` | 本次尝试中遇到的主要认知或交互阻碍（若成功完成则为 `NONE`）。 |
| **F5** | `coarseLatencyBucket` | `LatencyBucket` | 粗粒度反应耗时区间（消除精确按键级监控带来的监视风险）。 |
| **F6** | `exitType` | `ExitType` | 本次活动离开或结束的具体方式。 |
| **F7** | `coarseEmotionalLoad` | `EmotionalLoad` | 进入与进行本项任务时观察到的粗粒度情绪负荷水平。 |

---

## 3. 枚举值字典详解

### F3: SupportLevel
- `S0_INDEPENDENT`：自主完成，无需额外支架。
- `S1_IMPLICIT_PROMPT`：仅需反思性问题触发。
- `S2_STRUCTURED_SCAFFOLD`：使用了具象卡片与拖拽等辅助结构。
- `S3_MODELING_PARTIAL`：需要角色示例示范并协助前置步骤。
- `S4_CO_REGULATION`：由监护人/成人坐于身旁协助调节呼吸与思路。
- `S5_FULL_TAKEOVER`：情绪过载或困难过大，由成人全面接管现实生活，应用暂停。

### F4: FailureCode
- `NONE`：顺利完成，未遇到显著阻碍。
- `ATTENTION_DROP`：注意力自然分散（正常 6 岁儿童生理现象）。
- `EMOTIONAL_OVERLOAD`：情绪负荷超出容忍窗，暂停练习。
- `TASK_CONFUSION`：对指导语理解产生歧义。
- `TECHNICAL_ABORT`：网络波动、按错返回或设备电量问题。

### F5: CoarseLatencyBucket
- `FAST_UNDER_5S`：< 5 秒（通常为直觉反应或快速点击）。
- `NORMAL_5_30S`：5 - 30 秒（正常 6 岁理解与操作节奏）。
- `DELIBERATE_30_90S`：30 - 90 秒（深思熟虑、自言自语或与玩偶交流）。
- `EXTENDED_OVER_90S`：> 90 秒（中途离场、沉思或需要成人介入）。

### F6: ExitType
- `COMPLETED`：正常探索完成。
- `SKIPPED`：儿童主动选择跳过该叶片。
- `ABORTED_BY_CHILD`：儿童主动点击“先不玩了/返回”。
- `ADULT_INTERVENED`：大人点击家长入口或介入中断。

### F7: CoarseEmotionalLoad
- `CALM`：平稳、好奇、专注。
- `MILD_TENSION`：轻度紧张、遇到阻碍时的皱眉。
- `HEAVY_UPSET`：明显沮丧、抽泣、抗拒。
- `SHUTDOWN`：退缩、缄默、完全无反应（需立即启动支持）。
