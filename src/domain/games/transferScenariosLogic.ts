/**
 * 独立迁移情境逻辑 (Transfer Scenarios Logic)
 * 认知目标：未受训练情境下的独立迁移检验
 *
 * 核心规则：
 * 1. 不显示“事实与猜测”、“双面币”、“协商模型”等方法名称；
 * 2. 不提供暗示正确答案的提示词（如严禁直接写“心里想：”暴露分类标签）；
 * 3. 记录成人提示数量 (adultPromptCount)；
 * 4. 包含“证据仍不足、应保留不确定性”的迁移情境；
 * 5. 迁移有效性作为开放性研究问题，不自动声称已经培养成功。
 */

import { TransferScenarioDefinition } from './types';

export const TRANSFER_SCENARIOS: ReadonlyArray<TransferScenarioDefinition> = [
  {
    id: 'transfer_biscuit_mystery',
    title: '小客厅的饼干盒',
    surfaceSituation: '茶几上的铁盒子打开了，里面的圆形曲奇饼干少了两块。',
    underlyingStructure: 'FACT_VS_INFERENCE',
    promptSpokenText: '桌上的小饼干少了两块，请先选出真正有现场依据的发现，以及当下最合理的判断吧。',
    cluesOrChoices: [
      {
        id: 't1_crumbs',
        label: '茶几边缘有掉落的饼干碎屑',
        categoryOrPath: 'FACT',
        icon: '🍪',
      },
      {
        id: 't2_dog_hair',
        label: '沙发脚边有一撮小金毛狗毛',
        categoryOrPath: 'FACT',
        icon: '🐕',
      },
      {
        id: 't3_brother_walked',
        label: '弟弟刚才从茶几旁边走过去玩积木了',
        categoryOrPath: 'FACT',
        icon: '🚶‍♂️',
      },
      {
        id: 't4_inference_thought',
        label: '“肯定是弟弟刚才路过时把两块饼干偷吃掉了！”',
        categoryOrPath: 'INFERENCE',
        icon: '💭',
      },
      {
        id: 't5_unknown_who',
        label: '现有线索还看不出是谁吃了饼干，现在还不知道',
        categoryOrPath: 'UNKNOWN',
        icon: '❓',
      },
    ],
    objectiveOutcome:
      '客观发现：现场只有饼干碎屑、狗毛和路过的弟弟，没有任何证据拍到是谁吃了饼干，所以不能凭空冤枉弟弟。不勾选无证据的指责、承认“现在还不知道”，才是不冤枉别人的科学态度。',
  },
  {
    id: 'transfer_swing_seesaw',
    title: '公园的秋千与跷跷板',
    surfaceSituation: '小松鼠和小刺猬都飞快跑到了公园唯一的红色大秋千前，两个人都想先坐上去。',
    underlyingStructure: 'CHOICE_TRADEOFF',
    promptSpokenText: '秋千只有一个，两个好朋友都想玩，试着帮他们选出能兼顾双方的办法吧。',
    cluesOrChoices: [
      {
        id: 't_path_count_10',
        label: '数 10 下轮流荡秋千（一人数数，一人荡，但要排队等待）',
        categoryOrPath: 'TAKE_TURNS',
        icon: '⏱️',
      },
      {
        id: 't_path_double_seesaw',
        label: '一起去玩旁边的双人跷跷板（不用等，但要暂时放下秋千）',
        categoryOrPath: 'ALTERNATIVE_TOGETHER',
        icon: '⚖️',
      },
      {
        id: 't_path_push_partner',
        label: '小刺猬先坐秋千，小松鼠在后面轻轻推，一会儿再换过来',
        categoryOrPath: 'COOPERATE_PUSH',
        icon: '🤝',
      },
      {
        id: 't_limit_tradeoff',
        label: '认识限制：每种可执行办法都有小小代价（轮流要等待，玩跷跷板要暂放秋千）',
        categoryOrPath: 'LIMITATION_RECOGNIZED',
        icon: '⚖️',
      },
      {
        id: 't_unfair_monopoly',
        label: '谁跑得快就一直霸占秋千，不让另一个人玩',
        categoryOrPath: 'UNFAIR_MONOPOLY',
        icon: '🚫',
      },
    ],
    objectiveOutcome:
      '三种合作方案都可以避免争抢：数数轮流要排队等待，跷跷板需要暂时放下秋千，合作推秋千需要一人先推一人先坐。提出可执行安排并同时认识相应限制，才是成熟的协商思考。',
  },
  {
    id: 'transfer_rainy_umbrella_uncertainty',
    title: '走廊边的湿雨伞与水脚印',
    surfaceSituation: '午睡起来后，教室门口伞架上少了一把黄色小雨伞，地板上有一串湿漉漉的水脚印通向走廊拐角。',
    underlyingStructure: 'FACT_VS_INFERENCE',
    promptSpokenText: '黄色小雨伞不见了，地上有一串水脚印。请勾选有事实依据的观察，并做出最稳妥的判断！',
    cluesOrChoices: [
      {
        id: 'u1_wet_footprints',
        label: '伞架旁有一串湿漉漉的水脚印通向走廊拐角',
        categoryOrPath: 'FACT',
        icon: '👣',
      },
      {
        id: 'u2_two_classes_passed',
        label: '刚才中班和大班都有小朋友冒雨从走廊经过',
        categoryOrPath: 'FACT',
        icon: '🌧️',
      },
      {
        id: 'u3_blame_mingming',
        label: '“肯定是隔壁班明明故意把黄色小雨伞拿回家了！”',
        categoryOrPath: 'INFERENCE',
        icon: '💭',
      },
      {
        id: 'u4_retain_uncertainty',
        label: '水脚印看不出是谁踩的，现在证据还不足，还不知道是谁拿了伞',
        categoryOrPath: 'UNKNOWN',
        icon: '❓',
      },
    ],
    objectiveOutcome:
      '客观发现：地面水脚印和两个班路过都是事实，但水脚印无法证明是谁拿了雨伞（可能是拿错，也可能是保育老师收去晾干）。当证据不足时，保留“现在还不知道”最合理！',
  },
];

export interface TransferAttemptEvaluation {
  readonly isGoalMet: boolean;
  readonly hasSelectedUnknownOption: boolean;
  readonly feedbackMessage: string;
}

/**
 * Sprint 1.2 任务四：针对不同迁移任务建立明确的目标判断函数
 * - 事实辨析任务 (transfer_biscuit_mystery)：必须勾选至少 1 项客观观察事实 + 勾选未知边界 (t5_unknown_who) + 不勾选无证据臆测指责；只勾选一个普通事实项不得过关。
 * - 协商任务 (transfer_swing_seesaw)：必须提出至少 1 项可执行合作安排 + 认识相应限制 (t_limit_tradeoff) + 不勾选霸占选项。
 * - 不确定性任务 (transfer_rainy_umbrella_uncertainty)：允许“现在无法确定” (u4_retain_uncertainty) 成为合理完成结果，且不得勾选无证据指责。
 */
export function evaluateTransferScenarioAttempt(
  scenario: TransferScenarioDefinition,
  chosenOptionIds: ReadonlyArray<string>
): TransferAttemptEvaluation {
  const selectedItems = scenario.cluesOrChoices.filter((c) => chosenOptionIds.includes(c.id));
  const hasSelectedInference = selectedItems.some((c) => c.categoryOrPath === 'INFERENCE');
  const hasSelectedUnknownOption = selectedItems.some((c) => c.categoryOrPath === 'UNKNOWN');
  const selectedFacts = selectedItems.filter((c) => c.categoryOrPath === 'FACT');

  // 1. 不确定性任务：允许“现在无法确定”成为合理完成结果
  if (scenario.id === 'transfer_rainy_umbrella_uncertainty') {
    if (hasSelectedInference) {
      return {
        isGoalMet: false,
        hasSelectedUnknownOption,
        feedbackMessage:
          '再仔细看一看：你勾选的选项里包含了一条没有证据的猜测指责哦！试着去掉凭空指责，保留真实观察与“现在还不知道”吧。',
      };
    }
    if (!hasSelectedUnknownOption) {
      return {
        isGoalMet: false,
        hasSelectedUnknownOption: false,
        feedbackMessage:
          '你注意到了现场的事实，但仅凭地面水脚印能确定是谁拿了雨伞吗？请把代表“现在证据不足、还无法确定”的判断也勾选上吧！',
      };
    }
    return {
      isGoalMet: true,
      hasSelectedUnknownOption: true,
      feedbackMessage: scenario.objectiveOutcome,
    };
  }

  // 2. 事实辨析任务：检查孩子能否区分观察、猜测和未知（只勾选一个普通事实项不得记为完成）
  if (scenario.underlyingStructure === 'FACT_VS_INFERENCE') {
    if (hasSelectedInference) {
      return {
        isGoalMet: false,
        hasSelectedUnknownOption,
        feedbackMessage:
          '再仔细看一看：你勾选的选项里包含了一条没有证据的猜测指责哦！试着去掉凭空猜测的指责、只保留真实事实和“现在还不知道”，再来确认完成吧。',
      };
    }
    if (selectedFacts.length === 0 || !hasSelectedUnknownOption) {
      return {
        isGoalMet: false,
        hasSelectedUnknownOption,
        feedbackMessage:
          '只勾选单条普通事实或漏掉未知边界还不够完成哦！请同时选出「现场观察到的客观事实」以及「现在还不知道是谁吃的」这项合理判断后再提交。',
      };
    }
    return {
      isGoalMet: true,
      hasSelectedUnknownOption: true,
      feedbackMessage: scenario.objectiveOutcome,
    };
  }

  // 3. 协商任务：检查孩子能否提出可执行安排并认识相应限制
  const hasUnfairMonopoly = selectedItems.some((c) => c.categoryOrPath === 'UNFAIR_MONOPOLY');
  if (hasUnfairMonopoly) {
    return {
      isGoalMet: false,
      hasSelectedUnknownOption: false,
      feedbackMessage:
        '一个人霸占秋千不让朋友玩会导致争吵哦！请去掉霸占选项，选择能兼顾双方的可执行安排并认识它的限制。',
    };
  }

  const hasExecutableArrangement = selectedItems.some((c) =>
    ['TAKE_TURNS', 'ALTERNATIVE_TOGETHER', 'COOPERATE_PUSH'].includes(c.categoryOrPath)
  );
  const hasRecognizedLimitation = selectedItems.some(
    (c) => c.categoryOrPath === 'LIMITATION_RECOGNIZED'
  );

  if (!hasExecutableArrangement || !hasRecognizedLimitation) {
    return {
      isGoalMet: false,
      hasSelectedUnknownOption: false,
      feedbackMessage:
        '协商不仅要选出一个可执行的合作安排（轮流、换跷跷板或推秋千），还要同时勾选「认识限制：每种办法都有小小代价」哦！',
    };
  }

  return {
    isGoalMet: true,
    hasSelectedUnknownOption: false,
    feedbackMessage: scenario.objectiveOutcome,
  };
}

