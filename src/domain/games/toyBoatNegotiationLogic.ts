/**
 * 《玩具船协商》物体操作、利益冲突、规则协商与结果观察领域引擎 (Sprint 2 Deep Interactive Overhaul)
 * 认知目标：理解选择、利益、代价、规则协商与结果反馈 (CHOICE_TRADEOFF & COOPERATIVE_DECISION)
 *
 * 核心原则：
 * 1. 不设唯一标准答案：轮流、合作、交换、暂时等待都可以成立；
 * 2. 时间提示与实际操作严格一致（采用真实可感知的 3 秒 / 5 秒每轮操作计时与第 1 轮 / 第 2 轮交接，绝不写假“3分钟”）；
 * 3. 直观展示双方角色在当前安排下的真实反应与需求满足状态（绝不包装成儿童心理能力评分）；
 * 4. 至少包含两个不同冲突条件的任务：
 *    - 任务一 (task_turn_and_waiting)：侧重轮流与等待；
 *    - 任务二 (task_limited_resource_coop)：侧重资源有限时的合作与替代。
 */

import { NegotiationSolutionPath, NegotiationResultDetails } from './types';

export type BoatPositionZone = 'RABBIT_DOCK' | 'CENTER_POND' | 'BEAR_DOCK' | 'CANAL_HARBOR';

export type FirstTurnActor = 'rabbit' | 'bear' | 'both';

export type PlanStrategyType =
  | 'TURN_WAIT'       // 轮流与等待（设定先后顺序与每轮真实秒数）
  | 'COOPERATE_ROLES' // 分工合作（一人掌舵划桨、一人装卸货物/瞭望）
  | 'EXCHANGE_ALT';   // 交换与替代玩法（一人开船、一人操作挖掘机/吊车修水渠，下轮互换）

export type WaitingActivityId =
  | 'wait_empty_hands' // 空手坐在岸边干等
  | 'wait_ring_bell'   // 当岸边计时摇铃员数水波
  | 'wait_cargo_crane' // 操作岸边小吊车装松果/小黄鸭
  | 'wait_sand_digger'; // 开沙滩挖掘机修筑通航小水渠

export interface WaitingActivityOption {
  readonly id: WaitingActivityId;
  readonly label: string;
  readonly shortDesc: string;
  readonly icon: string;
}

export const WAITING_ACTIVITY_OPTIONS: ReadonlyArray<WaitingActivityOption> = [
  {
    id: 'wait_empty_hands',
    label: '空手在岸边干等',
    shortDesc: '手里没有别的玩具，光看着对方玩',
    icon: '⏳',
  },
  {
    id: 'wait_ring_bell',
    label: '当摇铃计时员数水波',
    shortDesc: '看着真实倒数秒表，到点摇响交接小铜铃',
    icon: '🔔',
  },
  {
    id: 'wait_cargo_crane',
    label: '当港口装卸员运松果',
    shortDesc: '在码头用小吊篮把松果和小黄鸭装上船',
    icon: '📦',
  },
  {
    id: 'wait_sand_digger',
    label: '开沙滩挖掘机修水渠',
    shortDesc: '在浅滩挖出一条新水渠，让小船能开进新航道',
    icon: '🚜',
  },
];

export interface NegotiationTaskDefinition {
  readonly id: string;
  readonly badge: string;
  readonly title: string;
  readonly conflictFocus: string;
  readonly sceneSummary: string;
  readonly rabbitNeedLabel: string;
  readonly bearNeedLabel: string;
  readonly resourceConstraintNote: string;
  readonly recommendedStrategies: ReadonlyArray<PlanStrategyType>;
}

export const TOY_BOAT_TASKS: ReadonlyArray<NegotiationTaskDefinition> = [
  {
    id: 'task_turn_and_waiting',
    badge: '任务一 · 轮流与等待',
    title: '池塘边的唯一红帆船',
    conflictFocus: '侧重轮流顺序、真实等待时长与等待期体验',
    sceneSummary:
      '晴朗水塘里只有一条红帆小木船。小兔提莫想先当船长冲浪，小熊波波也想自己掌舵去芦苇丛，谁都不想在岸边空手干等太久。',
    rabbitNeedLabel: '小兔提莫的愿望：想亲自握舵开船看水花，不想等太久',
    bearNeedLabel: '小熊波波的愿望：想自己独立开船去对岸，也怕在岸边无聊干等',
    resourceConstraintNote: '冲突条件：只有 1 条玩具船，单人掌舵时另一人必须等待或做别的事。',
    recommendedStrategies: ['TURN_WAIT', 'EXCHANGE_ALT'],
  },
  {
    id: 'task_limited_resource_coop',
    badge: '任务二 · 资源有限时的合作与替代',
    title: '浅水溪湾的松果渡船挑战',
    conflictFocus: '侧重资源受限下的角色分工合作与替代工具组合',
    sceneSummary:
      '浅水溪湾需要把岸上的松果运到对岸小岛，但现场只有一条小木船、一支船桨和岸边的挖掘机。如果两个人抢着单干，船容易卡在浅滩石头旁！',
    rabbitNeedLabel: '小兔提莫的愿望：擅长握桨控制方向，但一个人搬不动大筐松果',
    bearNeedLabel: '小熊波波的愿望：力气大想装运松果、开挖掘机拓宽水道，也想坐船过河',
    resourceConstraintNote: '冲突条件：船桨只有 1 支、航道窄，单独争抢会搁浅，需要分工合作或用挖掘机修筑替代水渠。',
    recommendedStrategies: ['COOPERATE_ROLES', 'EXCHANGE_ALT'],
  },
];

export function getToyBoatTaskById(taskId: string): NegotiationTaskDefinition {
  return TOY_BOAT_TASKS.find((t) => t.id === taskId) || TOY_BOAT_TASKS[0];
}

export interface NegotiationPlanConfig {
  readonly taskId: string;
  readonly boatPositionZone: BoatPositionZone;
  readonly firstTurnActor: FirstTurnActor;
  readonly turnDurationSeconds: 3 | 5;
  readonly planStrategy: PlanStrategyType;
  readonly waitingActivityId: WaitingActivityId;
}

export type NeedSatisfactionLevel = 'HIGH_SATISFIED' | 'MODERATE_WAITING' | 'LOW_FRUSTRATED';

export interface CharacterReactionEvaluation {
  readonly whoPlaysFirstLabel: string;
  readonly whoWaitsLabel: string;
  readonly requiresCooperationLabel: string;
  readonly overallSatisfactionSummary: string;
  readonly rabbitSatisfaction: NeedSatisfactionLevel;
  readonly rabbitStatusLabel: string;
  readonly rabbitSpokenReaction: string;
  readonly bearSatisfaction: NeedSatisfactionLevel;
  readonly bearStatusLabel: string;
  readonly bearSpokenReaction: string;
  readonly executionOutcomeNarrative: string;
  readonly round1ActionText: string;
  readonly round2ActionText: string;
}

/**
 * 根据孩子当前组合的协商安排（任务、小船位置、先后顺序、轮流秒数、策略、等待活动）
 * 实时计算两个角色的自然反应、需求满足状态与执行结果
 */
export function evaluateNegotiationPlan(
  config: NegotiationPlanConfig
): CharacterReactionEvaluation {
  const {
    taskId,
    boatPositionZone,
    firstTurnActor,
    turnDurationSeconds,
    planStrategy,
    waitingActivityId,
  } = config;

  const isTask2 = taskId === 'task_limited_resource_coop';

  // 情况 A：分工合作策略 (COOPERATE_ROLES) 或选择“两人一起配合 (both)”
  if (planStrategy === 'COOPERATE_ROLES' || firstTurnActor === 'both') {
    const hasCoopProp =
      waitingActivityId === 'wait_cargo_crane' || waitingActivityId === 'wait_sand_digger';
    return {
      whoPlaysFirstLabel: '小兔提莫与小熊波波同时上场（分工配合）',
      whoWaitsLabel: '无需空等（两人各有专属角色）',
      requiresCooperationLabel: '需要紧密配合：一人掌舵划船，一人负责装卸松果或疏通航道',
      overallSatisfactionSummary: hasCoopProp
        ? '双方需求都得到满足：既摸到了玩具，又合力完成了渡船目标！'
        : '双方都在船边参与，不过需要商量好口令才不会把小船晃歪哦。',
      rabbitSatisfaction: 'HIGH_SATISFIED',
      rabbitStatusLabel: '需求满足：当上领航船长握桨控向',
      rabbitSpokenReaction:
        '小兔提莫开心地握住船桨：“太好啦！我负责在前面看水路划桨，波波你来装松果！”',
      bearSatisfaction: 'HIGH_SATISFIED',
      bearStatusLabel: '需求满足：负责装卸松果与护航',
      bearSpokenReaction:
        '小熊波波拍拍胸脯：“没问题！我把松果稳稳装上船，靠岸时我来拉缆绳！”',
      executionOutcomeNarrative: isTask2
        ? '执行结果：第 1 轮小熊在码头装好松果，小兔稳稳划桨避开浅滩；第 2 轮小船顺利抵达水渠港，两人击掌欢呼！'
        : '执行结果：小兔掌舵、小熊当副船长放小黄鸭，小船在池塘中央平稳航行，谁也没有被冷落！',
      round1ActionText: '第 1 阶段：小兔握桨掌舵，小熊在岸边把货物稳稳放上船甲板',
      round2ActionText: '第 2 阶段：小船顺着水流驶向对岸码头，两人一起迎接小船靠岸',
    };
  }

  // 情况 B：交换与替代方案 (EXCHANGE_ALT) 或选择了挖掘机修水渠
  if (planStrategy === 'EXCHANGE_ALT' || waitingActivityId === 'wait_sand_digger') {
    const firstIsRabbit = firstTurnActor === 'rabbit';
    return {
      whoPlaysFirstLabel: firstIsRabbit
        ? `第 1 轮（${turnDurationSeconds}秒）：小兔先开船，小熊开挖掘机修水渠`
        : `第 1 轮（${turnDurationSeconds}秒）：小熊先开船，小兔开挖掘机修水渠`,
      whoWaitsLabel: `没有人空手干等！等待开船的一方先玩沙滩挖掘机，${turnDurationSeconds} 秒后互换`,
      requiresCooperationLabel: '水渠挖通后，小木船正好可以开进新水渠港，两边玩具联动起来',
      overallSatisfactionSummary:
        '双方需求都很满足：用替代玩具化解了干等焦虑，还在第 2 轮实现了互换体验！',
      rabbitSatisfaction: 'HIGH_SATISFIED',
      rabbitStatusLabel: firstIsRabbit
        ? `需求满足：先开船 ${turnDurationSeconds} 秒，再换玩挖掘机`
        : `需求满足：先玩挖掘机 ${turnDurationSeconds} 秒，第 2 轮准时开船`,
      rabbitSpokenReaction: firstIsRabbit
        ? `小兔提莫笑着说：“我先开 ${turnDurationSeconds} 秒小船，波波挖好水渠我就把船开过去换你！”`
        : `小兔提莫点点头：“那我先开 ${turnDurationSeconds} 秒挖掘机修水渠，等铃声一响就换我开船！”`,
      bearSatisfaction: 'HIGH_SATISFIED',
      bearStatusLabel: !firstIsRabbit
        ? `需求满足：先开船 ${turnDurationSeconds} 秒，再换玩挖掘机`
        : `需求满足：先开挖掘机修水渠，第 2 轮准时接手小船`,
      bearSpokenReaction: !firstIsRabbit
        ? `小熊波波高兴地说：“太棒了，我先划 ${turnDurationSeconds} 秒，然后去开我最爱的挖掘机！”`
        : `小熊波波干劲十足：“好呀！我先用挖掘机把浅滩水渠挖宽，${turnDurationSeconds} 秒后换我当船长！”`,
      executionOutcomeNarrative: `执行结果：第 1 轮（${turnDurationSeconds}秒）开船与挖渠同时进行；到点交接后，第 2 轮（${turnDurationSeconds}秒）双方互换玩具，小船顺利驶入新修好的水渠港！`,
      round1ActionText: firstIsRabbit
        ? `第 1 轮（${turnDurationSeconds}秒）：小兔开船航行，小熊用挖掘机疏通水渠港`
        : `第 1 轮（${turnDurationSeconds}秒）：小熊开船航行，小兔用挖掘机疏通水渠港`,
      round2ActionText: firstIsRabbit
        ? `第 2 轮（${turnDurationSeconds}秒）：双方互换！小熊开船驶入新水渠，小兔体验挖掘机`
        : `第 2 轮（${turnDurationSeconds}秒）：双方互换！小兔开船驶入新水渠，小熊体验挖掘机`,
    };
  }

  // 情况 C：轮流与等待方案 (TURN_WAIT)
  const firstIsRabbit = firstTurnActor === 'rabbit';
  const isEmptyHandWait = waitingActivityId === 'wait_empty_hands';
  const isLongerWait = turnDurationSeconds === 5;

  // 在任务二（浅水溪湾）中，如果只让一个人单干且空手干等，会遇到现实限制（小船容易卡在浅滩）
  if (isTask2 && isEmptyHandWait) {
    return {
      whoPlaysFirstLabel: firstIsRabbit
        ? `小兔提莫独自先划 ${turnDurationSeconds} 秒`
        : `小熊波波独自先划 ${turnDurationSeconds} 秒`,
      whoWaitsLabel: firstIsRabbit
        ? `小熊波波在岸边空手干等 ${turnDurationSeconds} 秒`
        : `小兔提莫在岸边空手干等 ${turnDurationSeconds} 秒`,
      requiresCooperationLabel:
        '浅水溪湾既有急流又有大筐松果，一个人单干没人帮忙装卸或修水渠，小船走得很慢！',
      overallSatisfactionSummary:
        '等待方有些着急，而且单人运松果效率不高。试试加上“港口装卸员”或切换“分工合作”吧！',
      rabbitSatisfaction: firstIsRabbit ? 'MODERATE_WAITING' : 'LOW_FRUSTRATED',
      rabbitStatusLabel: firstIsRabbit
        ? '独自划船有点费力，还得自己搬松果'
        : `在岸边空手干等 ${turnDurationSeconds} 秒，心里直发急`,
      rabbitSpokenReaction: firstIsRabbit
        ? '小兔提莫擦擦汗：“哎呀，我一个人既要划桨又要扶松果，船快卡在浅滩石头上啦！”'
        : '小兔提莫跺跺脚：“光让我坐在岸边干看着，松果也没运过去，好慢呀……”',
      bearSatisfaction: !firstIsRabbit ? 'MODERATE_WAITING' : 'LOW_FRUSTRATED',
      bearStatusLabel: !firstIsRabbit
        ? '独自开船没人帮忙看浅滩，有点手忙脚乱'
        : `在岸边空手干等 ${turnDurationSeconds} 秒，觉得有些无聊`,
      bearSpokenReaction: !firstIsRabbit
        ? '小熊波波喊道：“浅滩水太浅啦，要是有人帮我用挖掘机修水渠或者一起配合就好了！”'
        : '小熊波波叹了口气：“我只能干巴巴等在岸上，其实我可以帮忙装松果或者挖水渠呀！”',
      executionOutcomeNarrative:
        '执行结果：虽然按照先后顺序轮流了，但因为浅水湾需要配合，单人开船在浅滩晃晃悠悠，等待的一方也觉得干等无聊。你可以随时点击「重新协商」试试合作或安排等待活动！',
      round1ActionText: firstIsRabbit
        ? `第 1 轮（${turnDurationSeconds}秒）：小兔独自吃力划船，小熊在岸边空手干等`
        : `第 1 轮（${turnDurationSeconds}秒）：小熊独自吃力划船，小兔在岸边空手干等`,
      round2ActionText: firstIsRabbit
        ? `第 2 轮（${turnDurationSeconds}秒）：换小熊独自划船，小兔在岸边空手等待`
        : `第 2 轮（${turnDurationSeconds}秒）：换小兔独自划船，小熊在岸边空手等待`,
    };
  }

  // 任务一或有明确等待活动的轮流方案
  const waitingFeelsImpatient = isEmptyHandWait && isLongerWait;
  return {
    whoPlaysFirstLabel: firstIsRabbit
      ? `第 1 轮：小兔提莫先玩 ${turnDurationSeconds} 秒`
      : `第 1 轮：小熊波波先玩 ${turnDurationSeconds} 秒`,
    whoWaitsLabel: firstIsRabbit
      ? `第 1 轮：小熊波波等待 ${turnDurationSeconds} 秒（${isEmptyHandWait ? '空手等待' : '负责摇铃计时/装卸'}），第 2 轮准时接手`
      : `第 1 轮：小兔提莫等待 ${turnDurationSeconds} 秒（${isEmptyHandWait ? '空手等待' : '负责摇铃计时/装卸'}），第 2 轮准时接手`,
    requiresCooperationLabel: '需要双方遵守约定：倒计时归零时准时把小船靠岸交接',
    overallSatisfactionSummary: waitingFeelsImpatient
      ? `规则虽然公平，但空手干等 ${turnDurationSeconds} 秒让等待方有点坐不住。缩短到 3 秒或给等待方安排“摇铃计时员”会更舒服！`
      : `规则清晰可信！每轮真实倒数 ${turnDurationSeconds} 秒后准时交换，两个伙伴都玩上了小木船！`,
    rabbitSatisfaction: firstIsRabbit
      ? 'HIGH_SATISFIED'
      : waitingFeelsImpatient
        ? 'LOW_FRUSTRATED'
        : 'MODERATE_WAITING',
    rabbitStatusLabel: firstIsRabbit
      ? `需求满足：第 1 轮先开船 ${turnDurationSeconds} 秒（船停在${boatPositionZone === 'RABBIT_DOCK' ? '小兔码头' : '水塘航道'}）`
      : waitingFeelsImpatient
        ? `空手等 ${turnDurationSeconds} 秒有点着急，盼着快点轮到自己`
        : `安心等待 ${turnDurationSeconds} 秒，第 2 轮准时当船长`,
    rabbitSpokenReaction: firstIsRabbit
      ? `小兔提莫开心地说：“谢谢让我先开 ${turnDurationSeconds} 秒！时间一到我就立刻把船开回码头换波波！”`
      : waitingFeelsImpatient
        ? '小兔提莫巴望地看着水面：“5 秒钟空手干等好漫长呀，要是能让我当摇铃员或者每次 3 秒就好了……”'
        : `小兔提莫点点头：“好！我先数 ${turnDurationSeconds} 下水波摇小铃铛，马上就轮到我开船啦！”`,
    bearSatisfaction: !firstIsRabbit
      ? 'HIGH_SATISFIED'
      : waitingFeelsImpatient
        ? 'LOW_FRUSTRATED'
        : 'MODERATE_WAITING',
    bearStatusLabel: !firstIsRabbit
      ? `需求满足：第 1 轮先开船 ${turnDurationSeconds} 秒`
      : waitingFeelsImpatient
        ? `空手等 ${turnDurationSeconds} 秒有点着急，坐在岸边直叹气`
        : `安心等待 ${turnDurationSeconds} 秒，第 2 轮准时当船长`,
    bearSpokenReaction: !firstIsRabbit
      ? `小熊波波笑眯眯地说：“我先开 ${turnDurationSeconds} 秒过过瘾，倒计时结束就换提莫！”`
      : waitingFeelsImpatient
        ? '小熊波波托着下巴叹气：“空手干等 5 秒有点久呢，我肚子都等咕噜了……”'
        : `小熊波波摇着计时铃铛：“3、2、1！看着真秒表轮流玩，我知道马上就到我啦！”`,
    executionOutcomeNarrative: `执行结果：第 1 轮真实运行 ${turnDurationSeconds} 秒后小船靠岸交接，第 2 轮又运行 ${turnDurationSeconds} 秒，双方都亲自开到了小木船！`,
    round1ActionText: firstIsRabbit
      ? `第 1 轮（${turnDurationSeconds}秒）：小兔提莫掌舵开船，小熊波波在岸边${isEmptyHandWait ? '等待' : '当计时员'}`
      : `第 1 轮（${turnDurationSeconds}秒）：小熊波波掌舵开船，小兔提莫在岸边${isEmptyHandWait ? '等待' : '当计时员'}`,
    round2ActionText: firstIsRabbit
      ? `第 2 轮（${turnDurationSeconds}秒）：准时交接！小熊波波接手开船，小兔提莫在岸边加油`
      : `第 2 轮（${turnDurationSeconds}秒）：准时交接！小兔提莫接手开船，小熊波波在岸边加油`,
  };
}

// =========================================================================
// 向下兼容旧版导出 (Legacy Compatibility Exports)
// =========================================================================

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
    name: '真实倒数计时铃',
    type: 'TOOL_TIMER',
    icon: '⏳',
    defaultZone: 'SHELF',
  },
  {
    id: 'item_duck',
    name: '松果与小黄鸭货物',
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
    title: '方案一：真实秒数轮流玩（准时交接）',
    rabbitRoleDescription: '小兔先开小船在池塘里航行一轮（3秒或5秒）；小熊在岸边看着秒表准备交接。',
    bearRoleDescription: '第一轮倒计时结束铃响，换小熊开小船航行一轮；小兔在岸边数水波等待。',
    advantageGained: '【收益】每只小动物都有独立当船长掌舵的时间，规则非常公平！',
    realisticLimitation: '【现实限制】轮到等待的一方需要耐心等待一轮，如果空手干等太久会有点着急。',
    narrativeFeedback: '两个小动物看着真实的倒数秒数轮流接手，知道马上就能轮到自己，心里很踏实！',
    animationState: 'TAKE_TURNS_ACTIVE',
  },
  COOPERATE_CARGO: {
    path: 'COOPERATE_CARGO',
    title: '方案二：分工合作运松果（探险航队）',
    rabbitRoleDescription: '小兔当领航船长，握紧船桨负责在前面避开浅滩划船。',
    bearRoleDescription: '小熊当港口管理员，把松果和小黄鸭装上小船，在对岸接船卸货。',
    advantageGained: '【收益】两只小动物立刻都能参与，不用等待，还能合力完成渡船挑战！',
    realisticLimitation: '【现实限制】需要两个人商量配合口令，不能一个人随心所欲把船乱开。',
    narrativeFeedback: '小船满载着松果和小黄鸭稳稳靠岸了，两个好朋友高兴得拍手大笑！',
    animationState: 'COOPERATE_ACTIVE',
  },
  TRADE_TOYS: {
    path: 'TRADE_TOYS',
    title: '方案三：交换与替代玩法（开船与修水渠）',
    rabbitRoleDescription: '一人先在水里划小木船，另一人在浅滩开挖掘机修筑通航水渠，下一轮互换。',
    bearRoleDescription: '水渠修通后小木船正好驶入新水渠港，两边玩具连成一片。',
    advantageGained: '【收益】两只小手都有好玩的玩具可操作，谁都不用坐在旁边空等！',
    realisticLimitation: '【现实限制】当前这一刻玩到的不是第一愿望，第一轮先玩挖掘机的一方需要等下一轮才摸到小木船。',
    narrativeFeedback: '水渠挖通了，小木船顺着水渠滑进新港湾，沙滩和池塘连成了一片！',
    animationState: 'TRADE_ACTIVE',
  },
};

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
