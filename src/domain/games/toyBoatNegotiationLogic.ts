/**
 * 《小船协商》领域状态与逻辑 (Toy Boat Negotiation Logic)
 * 认知目标：理解选择、利益、代价和反馈 (CHOICE_TRADEOFF & COOPERATIVE_DECISION)
 * 
 * 核心规则：
 * 1. 拖放角色、玩具和道具尝试不同分配方案；
 * 2. 至少三种不同的安全解决路径；
 * 3. 动画与角色行动呈现真实反馈；
 * 4. 每种方案展示合理收益与现实限制（代价）；
 * 5. 不显示唯一的“正确选择”，允许随时重新修改方案。
 */

import { NegotiationSolutionPath, NegotiationResultDetails } from './types';

export interface NegotiableItem {
  readonly id: string;
  readonly name: string;
  readonly type: 'MAIN_TOY' | 'TOOL_TIMER' | 'COOP_PROP' | 'ALT_TOY';
  readonly icon: string;
  readonly defaultZone: 'SHELF' | 'POND' | 'SANDPIT';
}

export const NEGOTIATION_ITEMS: ReadonlyArray<NegotiableItem> = [
  {
    id: 'item_boat',
    name: '小木船',
    type: 'MAIN_TOY',
    icon: '⛵',
    defaultZone: 'POND',
  },
  {
    id: 'item_timer',
    name: '3分钟沙漏',
    type: 'TOOL_TIMER',
    icon: '⏳',
    defaultZone: 'SHELF',
  },
  {
    id: 'item_duck',
    name: '小黄鸭货物',
    type: 'COOP_PROP',
    icon: '🦆',
    defaultZone: 'SHELF',
  },
  {
    id: 'item_digger',
    name: '沙滩挖掘机',
    type: 'ALT_TOY',
    icon: '🚜',
    defaultZone: 'SANDPIT',
  },
];

export const NEGOTIATION_PATHS_DETAILS: Record<NegotiationSolutionPath, NegotiationResultDetails> = {
  TAKE_TURNS: {
    path: 'TAKE_TURNS',
    title: '方案一：轮流玩（沙漏翻转）',
    rabbitRoleDescription: '小兔先开小船在池塘里游 3 分钟；小熊在岸边看着金黄色沙漏慢慢漏下。',
    bearRoleDescription: '沙漏漏完一翻转，换小熊开小船游 3 分钟；小兔在岸边数水波等待。',
    advantageGained: '【收益】每只小动物都有当船长掌舵的时间，规则非常公平！',
    realisticLimitation: '【现实限制】轮到等待的一方需要耐心等待 3 分钟，不能立刻玩上小船。',
    narrativeFeedback: '两个小动物虽然要排队，但都知道马上就能轮到自己，心里很踏实！',
    animationState: 'TAKE_TURNS_ACTIVE',
  },

  COOPERATE_CARGO: {
    path: 'COOPERATE_CARGO',
    title: '方案二：合作运货游戏（探险航队）',
    rabbitRoleDescription: '小兔当领航船长，握紧船桨负责在前面带路划船。',
    bearRoleDescription: '小熊当货港管理员，把小黄鸭和彩色石头装上小船，在对岸接船卸货。',
    advantageGained: '【收益】两只小动物立刻都能玩，不用等待，探险任务更加好玩！',
    realisticLimitation: '【现实限制】需要两个人商量配合，不能一个人随心所欲把船乱甩。',
    narrativeFeedback: '小船满载着小黄鸭晃晃悠悠靠岸了，两个好朋友高兴得拍手大笑！',
    animationState: 'COOPERATE_ACTIVE',
  },

  TRADE_TOYS: {
    path: 'TRADE_TOYS',
    title: '方案三：交换玩具玩（开船与挖沙）',
    rabbitRoleDescription: '小兔开开心心地在水里划小木船看水波。',
    bearRoleDescription: '小熊在沙滩上用挖掘机挖出大水渠，过 5 分钟后两个人互换玩具。',
    advantageGained: '【收益】两只小手都有极棒的玩具在玩，谁都不用坐在旁边空等！',
    realisticLimitation: '【现实限制】当前这一刻玩到的不是第一愿望的小木船，需要退后一步换着玩。',
    narrativeFeedback: '水渠挖通了，小木船正好顺着水渠滑过去，沙滩和池塘连成了一片！',
    animationState: 'TRADE_ACTIVE',
  },
};

/**
 * 根据拖放到池塘/活动区域的道具判定激活哪种协商方案
 */
export function determineNegotiationPath(
  placedItemIds: ReadonlyArray<string>
): NegotiationSolutionPath | null {
  const hasTimer = placedItemIds.includes('item_timer');
  const hasDuck = placedItemIds.includes('item_duck');
  const hasDigger = placedItemIds.includes('item_digger');

  if (hasTimer) return 'TAKE_TURNS';
  if (hasDuck) return 'COOPERATE_CARGO';
  if (hasDigger) return 'TRADE_TOYS';

  return null;
}
