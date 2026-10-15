# A-LAND｜Sprint 4 认知迁移真实性与儿童沉浸体验深化 · 简短验收记录

- **执行工作区**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **基线提交**：`preview@c70d3bb96769272352b1491ff46e1d59aeda9ee8`

---

## 一、前置定向修复（FIX-01 ～ FIX-05）验收

1. **FIX-01｜复合迁移任务多目标进展（[`interactiveStoryLeaves.ts`](../../../src/domain/storyGrove/interactiveStoryLeaves.ts)、[`productExperienceMetrics.ts`](../../../src/domain/cognitive/productExperienceMetrics.ts)、[`StoryGroveModal.tsx`](../../../src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx)）**
   - 移除 `action.resolvesProblem && inspectedObjectIds.length >= 1` 单击即完成整幕迁移的做法。
   - 拆分为三项独立可观察目标：
     - `SHADOW_INVESTIGATION`（照亮核实窗外黑影，需观察 `camp_obj_curtain_shadow` 与 `camp_obj_pinecone_branch` 并执行 `camp_act_shine_light_check_branch`）
     - `PERSONAL_BOUNDARY`（表达个人舒适边界，需观察 `camp_obj_anxious_peer` 并执行 `camp_act_state_comfort_boundary`）
     - `SHARED_RESOURCE`（商量共享唯一照明工具，需观察 `camp_obj_shared_flashlight` 并执行 `camp_act_share_flashlight_roles`）
   - 局部完成记录对应 `completedGoals`，仅当三项目标全部达成时才将整幕复合挑战判定为 `isCompleted: true`。
   - 独立区分：`ORDINARY_ATTEMPT`（普通尝试/局部进展）、`HINT_ASSISTED_COMPLETION`（经历提示或修正后完成）、`UNPROMPTED_AUTONOMOUS_COMPLETION`（无提示自主完成）。

2. **FIX-02｜两片故事叶引入行动关联证据条件（[`interactiveStoryLeaves.ts`](../../../src/domain/storyGrove/interactiveStoryLeaves.ts) `evaluateInteractiveLeafGoalCompletion`）**
   - 《一只杯子，是大还是小？》（`cup-size`）选择双侧比较行动 `act_compare_both_sides` 时，必须真正获取 `obj_wooden_block` 与 `obj_elephant_bucket` 两处对比参照（或把蓝水杯先后移动到 `NEXT_TO_BLOCK` 与 `NEXT_TO_BUCKET`）；仅观察任意两处无关物件（如 `obj_blue_cup` + `obj_twig_ruler`）不会完成该认知目标。
   - 《小火车谁先开？》（`toy-share`）选择分工合作行动 `act_station_master_turn_system` 时，必须真正了解小火车、积木车站与角色关切三项证据。支持先观察后行动或先行动后补充观察，不强制固定顺序。

3. **FIX-03｜修正计数来自真实行为变化（[`interactiveStoryLeaves.ts`](../../../src/domain/storyGrove/interactiveStoryLeaves.ts) `isGenuineActionRevision`）**
   - 点击 `story-revise-action-btn`（“回到场景换个办法试试”）或 `camp-revise-method-btn`（“换个方法再试”）仅返回场景观察态，**不再直接增加 `revisionCount` 或点亮“已根据后果调整做法”**。
   - 仅当已执行过前序行动并观察后果、随后执行了不同行动且产生可观察的不同场景结果时，才计入真实修正。

4. **FIX-04｜历史成果与最新尝试独立保存（[`productExperienceMetrics.ts`](../../../src/domain/cognitive/productExperienceMetrics.ts) `recordStoryGroveTransferAttempt`、[`FairytaleIslandMap.tsx`](../../../src/components/ChildIsland/FairytaleIslandMap.tsx)）**
   - 分离 `historicalCompletedCampGoals`、`hasEverCompletedCampTransfer` 与 `latestCampTransferAttempt`。
   - 首次完成露营夜三项目标后小岛树屋暖灯（`island-svg-camp-transfer-lantern`）常亮；随后重新进入并执行未成功的尝试（`camp_act_guess_monster_scream`）退出后，最近一次尝试记录为未完成（`latestCampTransferAttempt.isCompleted === false`），但历史已完成目标与小岛暖灯保持常亮不消失。

5. **FIX-05｜隐藏提前剧透信息（[`interactiveStoryLeaves.ts`](../../../src/domain/storyGrove/interactiveStoryLeaves.ts)、[`StoryGroveModal.tsx`](../../../src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx)）**
   - 未探索前热点使用中性名称：`窗外的影子`、`帐篷旁边的东西`、`地上的照明工具`、`身旁紧张的同伴`，行动按钮不提前揭示“松果树枝”或“柔光灯罩”谜底。
   - 仅当孩子用手电筒照亮或点击检查 `camp_obj_pinecone_branch` 后，才揭示真相标签 `风中摇晃的松果树枝`。

---

## 二、儿童沉浸体验深化（样板 A & 样板 B）

- **样板 A｜《杯子大小》直接道具移动比对**：提供可移动的“森林蓝水杯”道具（`move-cup-to-block` / `move-cup-to-center` / `move-cup-to-bucket`），移动到小积木旁直观显示 `比小积木高一截 ↑`，移动到大水桶旁直观显示 `比大水桶矮好多 ↓`，刻度尺恒定指示 `2格高(不变)`，并折叠成人共读说明抽屉以降低儿童端文字密度。
- **样板 B｜《树屋露营夜》手电筒光束探索与三目标徽章**：提供 4 向手电筒光束控制（`aim-flashlight-SHADOW_CURTAIN` / `OUTSIDE_BRANCH` / `LANTERN_DIFFUSER` / `TENT_INSIDE`），实时改变 SVG 光锥指向、局部照明、窗外松果树枝显影、柔光灯罩暖光扩散及同伴表情姿态。

---

## 三、测试与真实浏览器验证结果

- **8 项反例与回归测试**：`src/tests/sprint4AuthenticityAndImmersion.test.tsx`（5 项综合反例套件）+ 全量 33 个测试文件（304 项测试）100% 通过。
- **真实浏览器多视口脚本**：[`scripts/verify-sprint4-browser.mjs`](../../../scripts/verify-sprint4-browser.mjs)（`1440×900` 与 `390×844` 均 `scrollWidth <= innerWidth`）。
- **仓库内截图存证**：
  - `docs/verification/sprint4/sprint4-mobile-390-showcaseA-cup-prop-manipulation.png`
  - `docs/verification/sprint4/sprint4-mobile-390-showcaseB-camp-beam-and-multigoal.png`
  - `docs/verification/sprint4/sprint4-desktop-1440-showcaseA-cup-prop-manipulation.png`
  - `docs/verification/sprint4/sprint4-desktop-1440-showcaseB-camp-all-goals.png`
  - `docs/verification/sprint4/sprint4-desktop-1440-fix04-island-lantern-persisted.png`
