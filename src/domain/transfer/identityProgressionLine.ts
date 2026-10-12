import { StructureId, LeafDefinition } from './types';

export interface FiveStageProgressionItem {
  readonly stageOrder: number;
  readonly stageTitle: string;
  readonly structureId: StructureId;
  readonly psychologicalCore: string;
  readonly sampleLeafId: string;
}

/**
 * 严格按照 Phase J 交互契约：
 * “把原有五级迁移阶梯实现成 MULTI_ATTRIBUTE_IDENTITY / RELATION_CHANGE_CONTINUITY 这一内容线，
 *  不要当成所有迁移的等级。”
 *
 * 这是一条针对自我认同与亲子联结延续性的纵向发展认知线，
 * 绝不能把所有叶子的迁移普遍当作五级强制阶梯。
 */
export const IDENTITY_AND_RELATION_PROGRESSION_LINE: ReadonlyArray<FiveStageProgressionItem> = [
  {
    stageOrder: 1,
    stageTitle: '客体物之多属性存在',
    structureId: StructureId.MULTI_ATTRIBUTE_IDENTITY,
    psychologicalCore: '自然物或玩具的外观随着时间或角度改变，但客体核心本质保持同一。',
    sampleLeafId: 'multi_attr_train_1',
  },
  {
    stageOrder: 2,
    stageTitle: '自我角色的多面整合',
    structureId: StructureId.MULTI_ATTRIBUTE_IDENTITY,
    psychologicalCore: '自己可以在学校是认真学生，在家里是会哭的宝宝，多面统一于完整的自我。',
    sampleLeafId: 'multi_attr_train_2',
  },
  {
    stageOrder: 3,
    stageTitle: '重要他人的情绪多面性',
    structureId: StructureId.MULTI_ATTRIBUTE_IDENTITY,
    psychologicalCore: '家长会有着急、生气的时刻，但情绪波动不等于爱和抚养责任的瓦解。',
    sampleLeafId: 'multi_attr_heldout',
  },
  {
    stageOrder: 4,
    stageTitle: '空间距离中的情感延续',
    structureId: StructureId.RELATION_CHANGE_CONTINUITY,
    psychologicalCore: '住址、房间或物理距离发生改变，情感联结与牵挂不受物理阻隔而中断。',
    sampleLeafId: 'relation_train_1',
  },
  {
    stageOrder: 5,
    stageTitle: '家庭结构转变中的亲子爱永恒',
    structureId: StructureId.RELATION_CHANGE_CONTINUITY,
    psychologicalCore: '大人分开居住，生活形态重组，但父母对孩子的爱与保护承诺永恒延续。',
    sampleLeafId: 'relation_heldout',
  },
];

export function isIdentityOrRelationStructure(structureId: StructureId): boolean {
  return (
    structureId === StructureId.MULTI_ATTRIBUTE_IDENTITY ||
    structureId === StructureId.RELATION_CHANGE_CONTINUITY
  );
}

export function getProgressionStepForLeaf(
  leaf: LeafDefinition
): FiveStageProgressionItem | null {
  if (!isIdentityOrRelationStructure(leaf.structureId)) {
    return null;
  }
  return (
    IDENTITY_AND_RELATION_PROGRESSION_LINE.find((item) => item.sampleLeafId === leaf.leafId) ||
    IDENTITY_AND_RELATION_PROGRESSION_LINE.find((item) => item.structureId === leaf.structureId) ||
    null
  );
}
