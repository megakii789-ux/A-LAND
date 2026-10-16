# 真正的业务契约：StoryGrove `cup-size`

**源码证据（固定提交）：**
- `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx`，重点第 64—110、1214—1510 行。
- `src/components/ChildIsland/StoryGrove/StoryIllustrations.tsx`，`CupScaleInteractiveIllustration`。
- `src/domain/storyGrove/interactiveStoryLeaves.ts`，`INTERACTIVE_STORY_LEAVES['cup-size']`。
- GitHub：`https://github.com/megakii789-ux/A-LAND/blob/f27438146cb9bc6a4b841f6745f63165173106c4/src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx#L1214-L1510`

## 真实场景对象与 ID

| 业务 ID | 视觉资产 | 原业务用途 |
|---|---|---|
| `obj_wooden_block` | `03_INTERACTIVE_PROPS/obj_wooden_block.svg` | 左边小积木，关键观察点 |
| `obj_blue_cup` | `03_INTERACTIVE_PROPS/obj_blue_cup.svg` | 中间蓝水杯，拖拽与点击替代操作 |
| `obj_elephant_bucket` | `03_INTERACTIVE_PROPS/obj_elephant_bucket.svg` | 右边大水桶，关键观察点 |
| `obj_twig_ruler` | `03_INTERACTIVE_PROPS/obj_twig_ruler.svg` | 桌沿刻度树枝，次要观察 |

## 原有杯子三个位置

`CupTablePosition`: `CENTER_TABLE`, `NEXT_TO_BLOCK`, `NEXT_TO_BUCKET`。

原件 `viewBox="0 0 420 220"`，拖动区域为 SVG `ref={svgCupRef}`，三个透明落点（不可随意改变）：
- `cup-dropzone-NEXT_TO_BLOCK`: x=94, y=86, width=62, height=56
- `cup-dropzone-CENTER_TABLE`: x=174, y=86, width=62, height=56
- `cup-dropzone-NEXT_TO_BUCKET`: x=236, y=86, width=62, height=56
- `movable-blue-cup-prop`: `data-cup-position`、pointerdown → move/up/cancel 保留
- `cup-constant-size-gauge`: 尺寸不变的可读信息；不得绘在美术层中后失去可访问性

建议把现有视觉杯子 SVG `<rect/path>` 替成图像渲染，但**继续复用原始 `<g>` 事件处理、3 个落点、原始键盘点击替代入口和证据记录函数**。图片插入 `href="/visual-v2/..."`、`pointerEvents="none"`，不得覆盖可点击区域。不要用 CSS 绝对定位拖动替代业务状态，以免产生第二套事实源。

## 真实动作与证据

- `act_compare_both_sides`: 应先后观察两侧、完成有效比较；必要热点 `obj_wooden_block`、`obj_elephant_bucket`。
- `act_only_look_squirrel`: 只看一边，显示证据不足/可修正结果，不能伪装成功。
- `act_ask_usage_need`: 询问双方需要；保持原动作与证据门槛。
- 不改 `requiredHotspotIds`、`evaluateInteractiveLeafGoalCompletion`、`resolveInteractiveLeafActionEffectiveOutcome` 或成长度量方法。
- 图层 alpha、动效和语言提示不得用来偷偷标记 hotspot 为已观察。

## 角色与语音身份

- 业务故事角色：`小松鼠跳跳`、`小象噗噗`。用于场景对话人物视觉层，不是四伙伴可选语音身份。
- 全局伙伴：`guoguo_squirrel` 果果、`beibei_otter` 贝贝、`tiantian_raccoon` 天天、`qiqi_deer` 奇奇；实际音频服从 `speechNarrator`。
- 源码部分故事台词把果果写成「小狐狸果果」；这是现有内容问题，另案校订，不在本次换肤中修改。

## 工程状态冻结

下列测试必须保持：`story-interactive-svg-cup-size`，三个 `cup-dropzone-*`，`movable-blue-cup-prop`，`interactive-leaf-scene-cup-size`。仅用装饰资产强化现有交互，不产生平行版 `cupPosition` 状态。
