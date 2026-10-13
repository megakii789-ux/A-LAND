/**
 * 《蜡笔侦探》领域状态与逻辑 (Crayon Detective Logic)
 * 认知目标：事实与猜测分离 (FACT_VS_INFERENCE)
 * 
 * 核心规则：
 * 1. 证据线索必须通过放大镜探索后方可解锁；
 * 2. 证据卡片可拖拽或点击分配至“眼睛看到的”、“脑子想到的”和“还不确定的”；
 * 3. 皮皮书包里的情况为永久未知（不能凭空推断）；
 * 4. 严禁责备错误选择，提供温和引导；
 * 5. 允许撤销、重试与“我不知道”。
 */

import { HotspotEvidence, ClueCardItem, SortingBasketType, SortingBasket } from './types';

export const CRAYON_DETECTIVE_HOTSPOTS: ReadonlyArray<HotspotEvidence> = [
  {
    id: 'hs_easel',
    name: '画架小桌',
    xPercent: 28,
    yPercent: 38,
    radiusPercent: 12,
    foundDescription: '画架上画着一半的向日葵，桌角有绿色蜡笔划痕和蜡笔碎屑。',
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
];

export const SORTING_BASKETS: ReadonlyArray<SortingBasket> = [
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
];

export interface PlacementEvaluation {
  readonly isMatch: boolean;
  readonly spokenFeedback: string;
}

export function evaluateCluePlacement(
  clueCategory: string,
  targetBasket: SortingBasketType
): PlacementEvaluation {
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
        spokenFeedback: '温和提示：这是奇奇脑海里自己猜的念头，眼睛没有拍到证据哦，放进“脑子想到的”泡泡里更合适呢。',
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
        spokenFeedback: '书包拉链拉着，我们谁也看不见里面，所以这是一件“还不知道”的事，不要凭空猜想哦。',
      };
    }
  }

  return {
    isMatch: false,
    spokenFeedback: '我们试着把卡片换个盒子摆摆看吧。',
  };
}
