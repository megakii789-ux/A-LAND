/**
 * 独立迁移情境逻辑 (Transfer Scenarios Logic)
 * 认知目标：未受训练情境下的独立迁移检验
 * 
 * 核心规则：
 * 1. 不显示“事实与猜测”、“双面币”、“协商模型”等方法名称；
 * 2. 不提供暗示正确答案的提示；
 * 3. 记录成人提示数量 (adultPromptCount)；
 * 4. 迁移有效性作为开放性研究问题，不自动声称已经培养成功。
 */

import { TransferScenarioDefinition } from './types';

export const TRANSFER_SCENARIOS: ReadonlyArray<TransferScenarioDefinition> = [
  {
    id: 'transfer_biscuit_mystery',
    title: '小客厅的饼干盒',
    surfaceSituation: '茶几上的铁盒子打开了，里面的圆形曲奇饼干少了两块。',
    underlyingStructure: 'FACT_VS_INFERENCE',
    promptSpokenText: '桌上的小饼干少了两块，我们来看看周围有些什么，把看到的和想到的分一分吧。',
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
        label: '心里想：“一定是弟弟偷吃了饼干！”',
        categoryOrPath: 'INFERENCE',
        icon: '💭',
      },
      {
        id: 't5_unknown_who',
        label: '到底是谁吃了饼干？',
        categoryOrPath: 'UNKNOWN',
        icon: '❓',
      },
    ],
    objectiveOutcome: '客观发现：我们只拍到了碎屑、狗毛和走过的弟弟，到底是谁吃了饼干其实还不知道。不能凭空冤枉弟弟，也不能冤枉小狗。',
  },
  {
    id: 'transfer_swing_seesaw',
    title: '公园的秋千与跷跷板',
    surfaceSituation: '小松鼠和小刺猬都飞快跑到了公园唯一的红色大秋千前，两个人都想先坐上去。',
    underlyingStructure: 'CHOICE_TRADEOFF',
    promptSpokenText: '秋千只有一个，两个好朋友都想玩，试着帮他们找找办法吧。',
    cluesOrChoices: [
      {
        id: 't_path_count_10',
        label: '数 10 下轮流荡秋千（一人数数，一人荡）',
        categoryOrPath: 'TAKE_TURNS',
        icon: '⏱️',
      },
      {
        id: 't_path_double_seesaw',
        label: '一起去玩旁边的双人跷跷板（一起飞高高）',
        categoryOrPath: 'ALTERNATIVE_TOGETHER',
        icon: '⚖️',
      },
      {
        id: 't_path_push_partner',
        label: '小刺猬坐秋千，小松鼠在后面轻轻推（两人合作）',
        categoryOrPath: 'COOPERATE_PUSH',
        icon: '🤝',
      },
    ],
    objectiveOutcome: '三种方案都可以避免吵架：数数轮流要排队，跷跷板需要放下秋千，推秋千一人玩一人推。每种办法都有开心的地方，也需要一点点商量。',
  },
];
