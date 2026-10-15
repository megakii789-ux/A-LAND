# A-LAND｜Sprint 4 & Sprint 4.1 认知迁移真实性、核心语义修复与直接触控强化 · 简短验收记录

- **执行工作区**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **Sprint 4 基线提交**：`preview@c70d3bb96769272352b1491ff46e1d59aeda9ee8`
- **Sprint 4.1 审计基线**：`preview@535b16c68064d789dcbbdd6a89cbdc8b8dc27598`

---

## 一、Sprint 4.1 核心认知语义修复与直接触控强化（FIX-01 ～ FIX-05）

1. **FIX-01｜行动结果必须与实际发现的证据一致（[`interactiveStoryLeaves.ts`](../../../src/domain/storyGrove/interactiveStoryLeaves.ts) `resolveInteractiveLeafActionEffectiveOutcome` / `resolveCampActionEffectiveOutcome`、[`StoryGroveModal.tsx`](../../../src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx)）**
   - 统一为“行动执行 → 场景真实变化 → 产生观察证据 → 结果反馈”闭环。
   - 当孩子在尚未获取必要观察证据（`requiredHotspotIds`）前直接点击正向行动（如未照亮窗外任何物体即点击 `camp_act_shine_light_check_branch`“照亮窗外核实黑影”，或未对比两侧参照物即点击 `act_compare_both_sides`），系统**绝不提前呈现最终真相**（松果树枝谜底或双侧比较结论），SVG 场景状态（`data-camp-outcome="PENDING_OBSERVATION"` / `effectiveSceneVisualEffect="OBSERVING"`）、角色台词、结果说明与小岛伙伴记忆统一引用同一份有效场景状态（`eventStage: 'ARRANGED_OR_STARTED'`）。
   - 只有真正通过手电光束照亮/观察或移动水杯获取对应证据后，才呈现完整真相并达成对应认知目标。

2. **FIX-02｜历史局部目标不能冒充一次完整挑战（[`productExperienceMetrics.ts`](../../../src/domain/cognitive/productExperienceMetrics.ts)、[`interactiveStoryLeaves.ts`](../../../src/domain/storyGrove/interactiveStoryLeaves.ts)、[`FairytaleIslandMap.tsx`](../../../src/components/ChildIsland/FairytaleIslandMap.tsx)）**
   - 严格分离维护：
     - `historicalCompletedCampGoals`：历史累计达成过的独立子目标（点亮小岛局部探索星光 `island-svg-camp-partial-stars`）；
     - `hasEverCompletedFullCampRun`：是否在**单次尝试中**完整达成全部三项目标（唯一决定小岛树屋露营暖灯 `island-svg-camp-transfer-lantern` 是否点亮）；
     - `latestCampTransferAttempt`：最近一次尝试的真实状态。
   - **反例验证通过**：第一次只完成黑影（1/3）、第二次只完成边界（1/3）、第三次只完成共享照明（1/3），`historicalCompletedCampGoals` 累计为 `3/3`，但三次 `latestCampTransferAttempt.isCompleted` 均为 `false`，`hasEverCompletedFullCampRun` 严格保持 `false`。
   - **同次会话冲突区分**：在同一会话达成三项目标后，若孩子再次点击恐慌/争抢等不成功行动（如 `camp_act_guess_monster_scream`），`evaluateCampTransferGoals` 判定 `isCurrentActionConflict: true` 且当前 `isAllGoalsCompleted: false`，当前画面如实呈现冲突状态（`data-camp-outcome="PANIC"`），绝不一边展示争抢冲突一边宣告当前所有问题已解决，同时保留历史 `hasEverCompletedFullCampRun: true` 成果。

3. **FIX-03｜自主试错不是外部辅助（[`productExperienceMetrics.ts`](../../../src/domain/cognitive/productExperienceMetrics.ts)、[`StoryGroveModal.tsx`](../../../src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx)）**
   - 在 `StoryGroveTransferAttemptRecord` 中独立记录：
     - `usedExternalHint`（是否点击显式提示按钮 `camp-request-external-hint-btn`）
     - `viewedReferenceAnswer`（是否查看参考提示）
     - `receivedAdultHelp`（是否展开成人共读辅助）
     - `triedMultipleMethods`（是否自主尝试多种方法）
     - `selfRevisedAfterConsequence`（是否在观察后果后自主修正）
   - 孩子未使用外部提示/参考答案/成人帮助，仅通过自主试错、观察后果并调整做法完成挑战，严格判定为 `UNPROMPTED_AUTONOMOUS_COMPLETION`。
   - 新增 `bestCampTransferIndependence`：若首次在提示辅助下完成（`HINT_ASSISTED_COMPLETION`），第二次完全自主完成（`UNPROMPTED_AUTONOMOUS_COMPLETION`），自动将最佳独立迁移状态升级为 `UNPROMPTED_AUTONOMOUS_COMPLETION`，并将 `transferScenarioStates['leaf-camp-transfer']` 从 `COMPLETED_WITH_PROMPT` 升级为 `COMPLETED_INDEPENDENT`，同步更新 `independentTransferCount` 与 `promptedTransferCount`。

4. **FIX-04｜两处核心场景直接触控拖拽强化（[`StoryGroveModal.tsx`](../../../src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx)）**
   - **《杯子大小》直接拖拽与磁吸比对**：支持按住 SVG 中的蓝水杯（`movable-blue-cup-prop`）直接左右拖动到小积木旁（`cup-dropzone-NEXT_TO_BLOCK`）、桌面中央（`cup-dropzone-CENTER_TABLE`）、大水桶旁（`cup-dropzone-NEXT_TO_BUCKET`）三个带磁吸高亮（`cup-snap-highlight`）的放置区，松手即完成吸附并自动生成对应参照观察证据；超出范围松手会温和回弹并给出友好提示（`cup-drag-recovery-hint`），同时保留原有按钮作为无障碍兜底路径。
   - **《树屋露营夜》手电光束连续拖动照明**：支持在露营夜 SVG 画布（`camp-interactive-svg-canvas`）或手电筒手柄（`camp-draggable-flashlight`）上直接按住拖动，连续旋转/移动光束与聚光光斑（`camp-beam-spotlight-circle`）照向窗外黑影、窗外树枝、帐篷内同伴和柔光灯罩四个热区（`camp-beam-zone-*`），实时改变局部照度、轮廓显影、观察证据与角色反馈，同时保留四向按钮作为无障碍兜底路径。

5. **FIX-05｜真实浏览器脚本严格断言（[`scripts/verify-sprint4-browser.mjs`](../../../scripts/verify-sprint4-browser.mjs)）**
   - 引入 `node:assert/strict`，对全部 7 项核心条件执行硬性断言（任一失败立即非零码退出），并在 `390×844` 移动端与 `1440×900` 桌面端通过真实鼠标/指针拖拽完成水杯比对与手电光束探索截图取证。

---

## 二、验证命令与真实浏览器截图存证

- **类型检查与单元测试**：
  - `./node_modules/.bin/tsc --noEmit`（0 错误）
  - `./node_modules/.bin/vitest run`（33 个测试文件 / 308 项测试 100% 通过）
  - `./node_modules/.bin/vite build`（生产构建通过）
- **真实浏览器多视口严格断言脚本**：
  - `node scripts/verify-sprint4-browser.mjs`（7 大类硬性断言全部通过，退出码 `0`）
- **双视口核心截图**：
  - `docs/verification/sprint4/sprint4-mobile-390-showcaseA-cup-prop-manipulation.png`（`390×844` 拖拽杯子完成参照比较）
  - `docs/verification/sprint4/sprint4-mobile-390-showcaseB-camp-beam-and-multigoal.png`（`390×844` 拖动光束与多目标进展）
  - `docs/verification/sprint4/sprint4-desktop-1440-showcaseA-cup-prop-manipulation.png`（`1440×900` 拖拽杯子完成参照比较）
  - `docs/verification/sprint4/sprint4-desktop-1440-showcaseB-camp-all-goals.png`（`1440×900` 拖动光束完成三目标与自主试错修正）
  - `docs/verification/sprint4/sprint4-desktop-1440-fix04-island-lantern-persisted.png`（`1440×900` 完整通关后再次失败尝试仍保留历史露营暖灯）
