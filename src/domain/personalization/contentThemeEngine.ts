/**
 * 受控儿童多主题内容适配引擎 (Audited Content Theme Engine V1.0)
 * 认知目标：事实与猜测分离 (FACT_VS_INFERENCE, 结构ID: fact_vs_inference)
 * 
 * 核心契约：
 * 1. 结构同构性：无论选择画画、运动、小动物自然还是拼图主题，
 *    所有场景严格拥有相同的认知结构：3个客观事实 (FACT) + 1个主观猜想 (INFERENCE) + 1个永久未知 (UNKNOWN)；
 * 2. 严格人工审核与冻结：状态标为 AUDITED_FROZEN_V1，禁止运行时未经审核的 LLM 自由生成；
 * 3. 评测判定完全一致：分类箱和评测逻辑 100% 同构，不偏袒或惩罚任何兴趣；
 * 4. 情绪与安全边界一致：不责备错误、允许撤回、肯定“承认不知道”的勇气。
 */

import { HotspotEvidence, SortingBasket, SortingBasketType } from '../games/types';
import { InterestActivityId } from './types';
import { StructureId } from '../transfer/types';

export type AuditedContentStatus = 'AUDITED_FROZEN_V1' | 'PENDING_HUMAN_REVIEW' | 'REJECTED';

export interface ThemedDetectiveScenario {
  readonly id: string;
  readonly structureId: StructureId;
  readonly themeId: InterestActivityId;
  readonly themeTitle: string;
  readonly sceneTitle: string;
  readonly auditStatus: AuditedContentStatus;
  readonly auditorSignOff: string;
  readonly frozenVersion: string;
  readonly sceneDescription: string;
  readonly spokenIntro: string;
  readonly missingItemLabel: string;
  readonly hotspots: ReadonlyArray<HotspotEvidence>;
  readonly sortingBaskets: ReadonlyArray<SortingBasket>;
}

// 1. 画画主题：《美术室蜡笔侦探》
const DRAWING_SCENARIO: ThemedDetectiveScenario = {
  id: 'scenario_detective_drawing_v1',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'drawing',
  themeTitle: '画画与色彩',
  sceneTitle: '美术角蜡笔侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-A',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '美术课下课了，桌上的绿色蜡笔找不到了，大家一起找出客观事实！',
  spokenIntro: '欢迎来到美术角！桌上的绿色小蜡笔不见了，我们拿起小放大镜，看看地上和桌边有些什么。',
  missingItemLabel: '绿色蜡笔',
  hotspots: [
    {
      id: 'hs_easel',
      name: '画架小桌',
      xPercent: 28,
      yPercent: 38,
      radiusPercent: 12,
      foundDescription: '画架上画着一半的向日葵，桌角有绿色蜡笔划痕和碎屑。',
      spokenText: '画架桌角有几粒绿色的蜡笔碎屑，还有刚刚画完的向日葵。',
      category: 'FACT',
      hint: '这是小眼睛清清楚楚拍到的。',
      icon: '🎨',
    },
    {
      id: 'hs_cat_tracks',
      name: '地板梅花印',
      xPercent: 48,
      yPercent: 76,
      radiusPercent: 14,
      foundDescription: '地板上有一串小猫咪的彩色梅花脚印，从桌子一直通向窗帘。',
      spokenText: '地板上有一串小猫踩了颜料的小脚印，一直通向窗帘后面。',
      category: 'FACT',
      hint: '这是真实踩在地板上的脚印。',
      icon: '🐾',
    },
    {
      id: 'hs_curtain',
      name: '飘动的窗帘底',
      xPercent: 82,
      yPercent: 58,
      radiusPercent: 13,
      foundDescription: '窗帘角下滚着一支绿色蜡笔，上面有被猫爪拨动玩耍的划痕。',
      spokenText: '在窗帘底下找到了一支绿色蜡笔！上面还有被小猫咪抓过的小划痕。',
      category: 'FACT',
      hint: '小蜡笔真的滚在窗帘底下了。',
      icon: '🖍️',
    },
    {
      id: 'hs_qiqi_thought',
      name: '奇奇的脑海念头',
      xPercent: 16,
      yPercent: 18,
      radiusPercent: 14,
      foundDescription: '“奇奇觉得皮皮刚才多看了蜡笔一眼，肯定是他偷偷装走了。”',
      spokenText: '奇奇心里想：“皮皮刚才多看了蜡笔一眼，肯定是他拿的！”',
      category: 'INFERENCE',
      hint: '这是奇奇脑子里猜的想法，眼睛可没有拍到皮皮拿蜡笔哦。',
      icon: '💭',
    },
    {
      id: 'hs_backpack',
      name: '皮皮的书包',
      xPercent: 68,
      yPercent: 30,
      radiusPercent: 12,
      foundDescription: '皮皮的书包拉链拉得紧紧的，外面什么也看不到，里面有没有蜡笔是不知道的。',
      spokenText: '皮皮的书包拉链拉得好好的，外面什么也看不见。里面有没有蜡笔，我们现在根本不知道。',
      category: 'UNKNOWN',
      hint: '拉链拉着，眼睛看不见里面，这是不知道的事情。',
      icon: '🎒',
      isPermanentUnknown: true,
    },
  ],
  sortingBaskets: [
    {
      id: 'EYES_OBSERVED',
      label: '眼睛看到的',
      subLabel: '客观事实 · 相机能拍到',
      expectedCategory: 'FACT',
      icon: '👀',
      colorBg: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
    },
    {
      id: 'MIND_GUESSED',
      label: '脑子想到的',
      subLabel: '猜想念头 · 脑海里的想法',
      expectedCategory: 'INFERENCE',
      icon: '💡',
      colorBg: 'bg-amber-50',
      borderColor: 'border-amber-300',
    },
    {
      id: 'STILL_UNKNOWN',
      label: '还不知道的',
      subLabel: '盲区秘密 · 还没有证据',
      expectedCategory: 'UNKNOWN',
      icon: '❓',
      colorBg: 'bg-sky-50',
      borderColor: 'border-sky-300',
    },
  ],
};

// 2. 运动主题：《绿茵场足球侦探》
const SPORTS_SCENARIO: ThemedDetectiveScenario = {
  id: 'scenario_detective_sports_v1',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'sports',
  themeTitle: '足球与运动',
  sceneTitle: '绿茵场足球侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-B',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '足球练习结束后，黑白足球找不到了，我们一起来找球场上的线索！',
  spokenIntro: '欢迎来到绿茵场！训练用的小足球不知道滚去哪里了，我们拿起放大镜，仔细看看草坪边缘。',
  missingItemLabel: '训练足球',
  hotspots: [
    {
      id: 'hs_sports_grass_line',
      name: '草坪边线压痕',
      xPercent: 26,
      yPercent: 42,
      radiusPercent: 12,
      foundDescription: '白石灰边线旁的绿草有几处被重重压倒的滚痕，上面带着新鲜泥巴。',
      spokenText: '边线旁的青草被压平了一条细道，是足球刚才滚过去的真实印记。',
      category: 'FACT',
      hint: '这是草地上实实在在能拍到的压痕。',
      icon: '🌱',
    },
    {
      id: 'hs_sports_dog_paw',
      name: '球门后小狗爪印',
      xPercent: 52,
      yPercent: 78,
      radiusPercent: 14,
      foundDescription: '白色球网下方的湿泥地上，有一串欢快的小狗爪子印通向灌木丛。',
      spokenText: '球门后面有一串湿漉漉的小狗爪印，一直延伸到冬青树丛里。',
      category: 'FACT',
      hint: '这是小狗踩在泥巴上的脚印，眼睛看得见。',
      icon: '🐾',
    },
    {
      id: 'hs_sports_bush',
      name: '冬青灌木丛底',
      xPercent: 84,
      yPercent: 54,
      radiusPercent: 13,
      foundDescription: '深绿色的冬青叶子底下，卡着那颗黑白足球，球皮上还粘着一片黄叶。',
      spokenText: '灌木丛底下露出了黑白足球！它卡在叶子堆里，上面还粘着落叶呢。',
      category: 'FACT',
      hint: '足球真实地卡在草丛底下，找到它了。',
      icon: '⚽',
    },
    {
      id: 'hs_sports_teammate_thought',
      name: '队友的脑海念头',
      xPercent: 18,
      yPercent: 20,
      radiusPercent: 14,
      foundDescription: '“队友觉得隔壁班刚才走得匆忙，肯定是他们把球踢走藏起来了。”',
      spokenText: '小刚心里想：“隔壁班刚才路过，肯定是他们故意把球藏起来了！”',
      category: 'INFERENCE',
      hint: '这是脑海里的猜测，眼睛并没有看到隔壁班拿球哦。',
      icon: '💭',
    },
    {
      id: 'hs_sports_locker',
      name: '锁着的铁皮球柜',
      xPercent: 70,
      yPercent: 28,
      radiusPercent: 12,
      foundDescription: '球场边铁皮器材柜的大锁挂得好好的，里面还有没有球我们谁也看不见。',
      spokenText: '器材柜锁得紧紧的，谁也没钥匙开门。里面有没有备用球，我们现在根本不知道。',
      category: 'UNKNOWN',
      hint: '柜子锁着看不见，不知道就是不知道。',
      icon: '🔒',
      isPermanentUnknown: true,
    },
  ],
  sortingBaskets: DRAWING_SCENARIO.sortingBaskets,
};

// 3. 动物与自然主题：《森林坚果侦探》
const NATURE_SCENARIO: ThemedDetectiveScenario = {
  id: 'scenario_detective_nature_v1',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'nature',
  themeTitle: '自然与小动物',
  sceneTitle: '森林落叶坚果侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-C',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '大橡树底下，小松鼠辛辛苦苦收集的大橡果不见了，一起当小森林侦探！',
  spokenIntro: '欢迎来到大橡树下！小松鼠放在树洞旁的大橡果找不到了，我们拿起放大镜，看看落叶和树皮。',
  missingItemLabel: '金黄橡果',
  hotspots: [
    {
      id: 'hs_nature_tree_moss',
      name: '树皮上的干松针',
      xPercent: 25,
      yPercent: 36,
      radiusPercent: 12,
      foundDescription: '老树皮上挂着被大风吹落的松针，树洞口还有细软的绿色青苔被刮乱。',
      spokenText: '树干上的青苔被擦掉了一小块，旁边还有几根从头顶落下来的松针。',
      category: 'FACT',
      hint: '这是树皮上真实的刮痕和松针。',
      icon: '🌲',
    },
    {
      id: 'hs_nature_wind_trail',
      name: '风吹叶子滑道',
      xPercent: 50,
      yPercent: 74,
      radiusPercent: 14,
      foundDescription: '地面上的红枫叶被一阵大风吹开了一条散开的斜坡，像个小滑梯。',
      spokenText: '地上的落叶被风刮出了一条长长的滑道，从树下一直滑向小草堆。',
      category: 'FACT',
      hint: '这是风吹走落叶留在地面的真实痕迹。',
      icon: '🍂',
    },
    {
      id: 'hs_nature_leaf_pile',
      name: '枫叶堆底下的橡果',
      xPercent: 82,
      yPercent: 56,
      radiusPercent: 13,
      foundDescription: '在厚厚的一堆红枫叶底下，露出了圆滚滚的橡果小帽尖。',
      spokenText: '在落叶堆底下找到大橡果了！它圆滚滚的小帽子正卡在泥土边呢。',
      category: 'FACT',
      hint: '橡果真真实实地躺在叶子底下。',
      icon: '🌰',
    },
    {
      id: 'hs_nature_squirrel_thought',
      name: '小松鼠的脑海念头',
      xPercent: 18,
      yPercent: 18,
      radiusPercent: 14,
      foundDescription: '“小松鼠觉得刚才喜鹊在树顶上叫唤，肯定是被坏小偷叼走了。”',
      spokenText: '小松鼠心里急着想：“刚才喜鹊大叫了一声，肯定是有小偷把它偷走了！”',
      category: 'INFERENCE',
      hint: '这是心里着急猜的念头，眼睛没有拍到小偷哦。',
      icon: '💭',
    },
    {
      id: 'hs_nature_deep_burrow',
      name: '黑乎乎的深树洞',
      xPercent: 68,
      yPercent: 30,
      radiusPercent: 12,
      foundDescription: '倒木深处有一个黑漆漆的小树洞，里面太暗了，有没有别的东西根本看不见。',
      spokenText: '倒下的老树洞里面黑咕隆咚的，眼睛完全看不清。里面藏着什么，我们谁也不知道。',
      category: 'UNKNOWN',
      hint: '洞里太暗看不见，不知道就是不知道。',
      icon: '🕳️',
      isPermanentUnknown: true,
    },
  ],
  sortingBaskets: DRAWING_SCENARIO.sortingBaskets,
};

// 4. 拼图与机关主题：《拼图桌面彩虹碎片侦探》
const PUZZLE_SCENARIO: ThemedDetectiveScenario = {
  id: 'scenario_detective_puzzle_v1',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'puzzle',
  themeTitle: '拼图与机关',
  sceneTitle: '拼图桌彩虹碎片侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-D',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '拼图只差最后一片彩虹角了，地毯和桌边有些什么秘密线索呢？',
  spokenIntro: '欢迎来到拼图小桌！彩虹拼图的最后一片找不到啦，我们拿起放大镜，在桌角和地毯上找一找。',
  missingItemLabel: '彩虹拼图角',
  hotspots: [
    {
      id: 'hs_puzzle_box_corner',
      name: '拼图盒边的纸屑',
      xPercent: 26,
      yPercent: 38,
      radiusPercent: 12,
      foundDescription: '拼图盒子边角有一圈撕开的透明胶带，旁边还掉了一小片彩色纸屑。',
      spokenText: '拼图盒子旁边有几粒彩色的小纸屑，盒子盖子被打开过。',
      category: 'FACT',
      hint: '这是小眼睛拍到的纸屑与盒子。',
      icon: '📦',
    },
    {
      id: 'hs_puzzle_rug_edge',
      name: '地毯边翻折印',
      xPercent: 50,
      yPercent: 76,
      radiusPercent: 14,
      foundDescription: '客厅毛绒地毯的一角翻了起来，地板砖上留下了一条浅浅的压痕。',
      spokenText: '地毯的一只角被踢翻过来了，底下露出了干净的地板。',
      category: 'FACT',
      hint: '这是眼睛看到的翻起来的地毯角。',
      icon: '🧶',
    },
    {
      id: 'hs_puzzle_cushion_corner',
      name: '抱枕底下的拼图角',
      xPercent: 82,
      yPercent: 54,
      radiusPercent: 13,
      foundDescription: '小沙发抱枕底下露出了一块厚纸片，正是那枚红黄绿相间的彩虹拼图！',
      spokenText: '在软软的抱枕底下找到了！是最后那片彩虹拼图，它悄悄压在下面呢。',
      category: 'FACT',
      hint: '拼图真真实实地找到了。',
      icon: '🧩',
    },
    {
      id: 'hs_puzzle_child_thought',
      name: '明明的脑海念头',
      xPercent: 18,
      yPercent: 18,
      radiusPercent: 14,
      foundDescription: '“明明心里想：刚才弟弟在这跑过，肯定是他故意把拼图扔掉的。”',
      spokenText: '明明脑子里想：“刚才弟弟走过这里，肯定是他故意把拼图扔掉的！”',
      category: 'INFERENCE',
      hint: '这是脑子里猜的想法，眼睛并没有看到弟弟扔拼图。',
      icon: '💭',
    },
    {
      id: 'hs_puzzle_locked_drawer',
      name: '卡住的小抽屉',
      xPercent: 70,
      yPercent: 28,
      radiusPercent: 12,
      foundDescription: '木桌下的小抽屉被卡得紧紧的拉不开，里面还有没有别的东西谁也不知道。',
      spokenText: '桌子下的小抽屉卡住了，拉也拉不开。里面放着什么，我们现在根本不知道。',
      category: 'UNKNOWN',
      hint: '抽屉拉不开看不见，这是不知道的事情。',
      icon: '🗄️',
      isPermanentUnknown: true,
    },
  ],
  sortingBaskets: DRAWING_SCENARIO.sortingBaskets,
};

// 场景映射表
export const THEMED_SCENARIOS: Record<InterestActivityId, ThemedDetectiveScenario> = {
  drawing: DRAWING_SCENARIO,
  sports: SPORTS_SCENARIO,
  nature: NATURE_SCENARIO,
  puzzle: PUZZLE_SCENARIO,
};

/**
 * 通用线索分类评测函数（跨所有主题 100% 同构）
 */
export function evaluateThemedCluePlacement(
  clueCategory: string,
  targetBasket: SortingBasketType
): { isMatch: boolean; spokenFeedback: string } {
  if (clueCategory === 'FACT') {
    if (targetBasket === 'EYES_OBSERVED') {
      return {
        isMatch: true,
        spokenFeedback: '找对啦！这是小眼睛和相机能拍到的真实事实。',
      };
    } else {
      return {
        isMatch: false,
        spokenFeedback: '再看一看，这是眼睛清清楚楚看到的证据哦，要不要试着放进“眼睛看到的”盒子里？',
      };
    }
  }

  if (clueCategory === 'INFERENCE') {
    if (targetBasket === 'MIND_GUESSED') {
      return {
        isMatch: true,
        spokenFeedback: '太棒了！这是小脑袋里的猜想和念头，可能对也可能不对。',
      };
    } else {
      return {
        isMatch: false,
        spokenFeedback: '温和提示：这是脑海里自己猜的念头，眼睛没有拍到客观证据哦，放进“脑子想到的”盒子里更合适呢。',
      };
    }
  }

  if (clueCategory === 'UNKNOWN') {
    if (targetBasket === 'STILL_UNKNOWN') {
      return {
        isMatch: true,
        spokenFeedback: '非常清醒！不知道就是不知道，承认还不知道也是很有力量的事！',
      };
    } else {
      return {
        isMatch: false,
        spokenFeedback: '外面拉着或锁着，我们谁也看不见里面，所以这是一件“还不知道”的事，不要凭空猜想哦。',
      };
    }
  }

  return {
    isMatch: false,
    spokenFeedback: '我们试着把卡片换个盒子摆摆看吧。',
  };
}

/**
 * 根据儿童偏好的兴趣获取已审核冻结的场景定义
 */
export function getThemedScenarioByInterest(interestId: InterestActivityId): ThemedDetectiveScenario {
  return THEMED_SCENARIOS[interestId] || THEMED_SCENARIOS.drawing;
}
