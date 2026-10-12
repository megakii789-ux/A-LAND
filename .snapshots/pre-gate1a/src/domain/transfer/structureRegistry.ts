import { StructureId, ThinkingPosture } from './types';

export interface StructureMetadata {
  readonly id: StructureId;
  readonly posture: ThinkingPosture;
  readonly title: string;
  readonly cognitiveGoal: string;
  readonly childMetaphor: string;
}

export const STRUCTURE_REGISTRY: Record<StructureId, StructureMetadata> = {
  // Phase J 七大核心认知迁移结构
  [StructureId.FACT_VS_INFERENCE]: {
    id: StructureId.FACT_VS_INFERENCE,
    posture: 'FEN',
    title: '事实与猜想分离',
    cognitiveGoal: '区分眼睛/耳朵真实看到听到的客观事实，与大脑自发脑补的推测或主观评价。',
    childMetaphor: '把小相机拍到的照片和小脑袋里的猜想泡泡分开放',
  },
  [StructureId.PERSPECTIVE_DEPENDENT_EFFECT]: {
    id: StructureId.PERSPECTIVE_DEPENDENT_EFFECT,
    posture: 'TONG',
    title: '位置决定视角效应',
    cognitiveGoal: '认识到同一客观事物或物理事件，处于不同位置或持有不同需求的主体，会有完全不同的感受与评价。',
    childMetaphor: '站在树上和坐在草地上，看到的风景不一样',
  },
  [StructureId.CHOICE_TRADEOFF]: {
    id: StructureId.CHOICE_TRADEOFF,
    posture: 'ZE',
    title: '选择权衡与取舍',
    cognitiveGoal: '认识到每个选项都有得到的一面，也有放下的一面，没有完美选择，但自己可以选择并承担。',
    childMetaphor: '小天平的两端：拿起了这个小苹果，两只手就得先放下小橘子',
  },
  [StructureId.MULTI_ATTRIBUTE_IDENTITY]: {
    id: StructureId.MULTI_ATTRIBUTE_IDENTITY,
    posture: 'FEN',
    title: '多属性身份与客体认知',
    cognitiveGoal: '认识到一个人或事物具有多种面向与属性，不能因为某一个局部的变化或表现就覆盖整体。',
    childMetaphor: '大魔方有很多面：转过来是黄色，转过去是蓝色，但它还是同一个魔方',
  },
  [StructureId.CONTEXT_DEPENDENT_BEHAVIOR]: {
    id: StructureId.CONTEXT_DEPENDENT_BEHAVIOR,
    posture: 'TONG',
    title: '情境依赖性行为理解',
    cognitiveGoal: '理解人的行为和规则常随环境情境、时间与角色不同而发生改变，而非固定不变的本质。',
    childMetaphor: '在操场上可以大声跑跳，在图书馆里要轻轻翻书',
  },
  [StructureId.RELATION_CHANGE_CONTINUITY]: {
    id: StructureId.RELATION_CHANGE_CONTINUITY,
    posture: 'TONG',
    title: '形式改变中的关系延续',
    cognitiveGoal: '认识到生活形式、居住物理位置或成人关系形式虽然发生转变，但爱与亲子联结的核心本质依然稳定延续。',
    childMetaphor: '两棵树虽然隔着一条小溪，但地底下的树根依然紧紧拉着手',
  },
  [StructureId.BEHAVIOR_PERSON_SEPARATION]: {
    id: StructureId.BEHAVIOR_PERSON_SEPARATION,
    posture: 'FEN',
    title: '具体行为与人本身分离',
    cognitiveGoal: '将做出的具体事情/犯的错误，与这个人作为有价值个体的本质区分开，不下整体人格审判。',
    childMetaphor: '衣服上沾了一点泥巴，擦干净就好了，小衣服还是温暖的好衣服',
  },

  // 既有姿态细分结构
  [StructureId.FEN_SINGLE_BURDEN_SPLIT]: {
    id: StructureId.FEN_SINGLE_BURDEN_SPLIT,
    posture: 'FEN',
    title: '单一负荷分切',
    cognitiveGoal: '将感到过载的一个大任务，按执行动作或时空切为互不干扰的小步骤。',
    childMetaphor: '把大西瓜切成一小牙一小牙吃',
  },
  [StructureId.FEN_OWNERSHIP_SEPARATION]: {
    id: StructureId.FEN_OWNERSHIP_SEPARATION,
    posture: 'FEN',
    title: '情绪归属划分',
    cognitiveGoal: '区分外部成人或同伴的情绪与自身的过失归因，避免内疚内卷。',
    childMetaphor: '谁的书包谁来背，大人的雨伞大人拿',
  },
  [StructureId.TONG_FEELING_EXPRESSION]: {
    id: StructureId.TONG_FEELING_EXPRESSION,
    posture: 'TONG',
    title: '需要与情绪安全通报',
    cognitiveGoal: '在不发动攻击或防御闭锁的前提下，客观清晰地说出自己的需要。',
    childMetaphor: '在两个小岛之间搭一座说话的彩虹桥',
  },
  [StructureId.TONG_PERSPECTIVE_CROSSING]: {
    id: StructureId.TONG_PERSPECTIVE_CROSSING,
    posture: 'TONG',
    title: '信息视线盲区察觉',
    cognitiveGoal: '认识到“对方不知道我看到了什么，或者对方遇到了我不知道的事”。',
    childMetaphor: '站在对方的小窗户往外看一看',
  },
  [StructureId.ZE_CHOICE_WITHIN_LIMIT]: {
    id: StructureId.ZE_CHOICE_WITHIN_LIMIT,
    posture: 'ZE',
    title: '规则边界内的自决选择',
    cognitiveGoal: '在既定事实不可更改时，寻找并执行自己依然具备主动权的选择项。',
    childMetaphor: '就算在固定的房间里，我也能选先搭哪块积木',
  },
  [StructureId.ZE_CALM_DOWN_STRATEGY]: {
    id: StructureId.ZE_CALM_DOWN_STRATEGY,
    posture: 'ZE',
    title: '身心风暴时的平稳策略自选',
    cognitiveGoal: '面对强烈生理激惹时，自主调动最契合当下的具身安抚手段。',
    childMetaphor: '下大雨时从工具箱里挑一把自己的伞',
  },
};

export function isRegisteredStructureId(id: string): id is StructureId {
  return Object.values(StructureId).includes(id as StructureId);
}
