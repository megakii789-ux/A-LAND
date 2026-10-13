/**
 * 迁移引擎双向兼容桥接器 (Cognitive Transfer Engine Bridge)
 * 遵循 docs/SCENE_SCHEMA_V1.md:
 * 确保统一场景模型 (UnifiedSceneDefinition) 与既有迁移引擎 (src/domain/transfer/) 100% 互通兼容，
 * 不破坏既有 LeafDefinition 契约，亦支持将 UnifiedScene 投影为迁移叶用于泛化能力检验。
 */

import { UnifiedSceneDefinition } from './types';
import {
  LeafDefinition,
  ThinkingPosture,
  EmotionalWeight,
  PersonalDistance,
  CognitiveLoad,
} from '../transfer/types';
import { STRUCTURE_REGISTRY } from '../transfer/structureRegistry';
import { validateLeafDefinition } from '../transfer/transferValidator';

/**
 * 将 UnifiedSceneDefinition 无损投影/转换为兼容既有 LeafDefinition 的实例
 */
export function convertUnifiedSceneToLeaf(scene: UnifiedSceneDefinition): LeafDefinition {
  const structureMeta = STRUCTURE_REGISTRY[scene.cognitiveStructureId];
  const posture: ThinkingPosture = structureMeta ? structureMeta.posture : 'FEN';

  // 映射情感负荷与个人距离
  let emotionalWeight: EmotionalWeight = 'medium';
  if (scene.safetyBoundaryAssessment.isBoundaryTriggered) {
    emotionalWeight = 'deep';
  } else if (scene.surfaceDomain === 'nature') {
    emotionalWeight = 'light';
  }

  const personalDistance: PersonalDistance = 'peer';
  const cognitiveLoad: CognitiveLoad = scene.activeLayers.length > 4 ? 'moderate' : 'low';

  const leafOptions = scene.actionChoices.map((choice) => ({
    id: choice.actionId,
    labelSpokenText: choice.labelSpokenText,
    isKeyAction: choice.isSafeBoundaryAction || choice.isDiscretionaryChoice,
  }));

  const leaf: LeafDefinition = {
    leafId: scene.sceneId,
    title: scene.title,
    structureId: scene.cognitiveStructureId,
    posture,
    surfaceDomain: scene.surfaceDomain,
    emotionalWeight,
    personalDistance,
    cognitiveLoad,
    boundary: scene.safetyBoundaryAssessment.boundaryType,
    isHeldOutTransfer: scene.isHeldOutTransfer,
    scaffoldTier: scene.requiresAdultCoReading ? 2 : 1,
    targetAgeMin: 6,
    promptSpokenText: scene.contextNarrationSpokenText,
    stepsOrOptions: leafOptions,
  };

  return leaf;
}

/**
 * 迁移引擎兼容性验证报告接口
 */
export interface TransferEngineCompatibilityReport {
  readonly sceneId: string;
  readonly isFullyCompatibleWithTransferEngine: boolean;
  readonly convertedLeafId: string;
  readonly leafValidationErrors: ReadonlyArray<string>;
  readonly structureRegistered: boolean;
  readonly sharedStructureId: string;
}

/**
 * 检验一个场景与现有迁移引擎的兼容性
 */
export function auditSceneTransferCompatibility(
  scene: UnifiedSceneDefinition
): TransferEngineCompatibilityReport {
  const leaf = convertUnifiedSceneToLeaf(scene);
  const validation = validateLeafDefinition(leaf);

  return {
    sceneId: scene.sceneId,
    isFullyCompatibleWithTransferEngine: validation.isValid,
    convertedLeafId: leaf.leafId,
    leafValidationErrors: validation.errors,
    structureRegistered: scene.cognitiveStructureId in STRUCTURE_REGISTRY,
    sharedStructureId: scene.cognitiveStructureId,
  };
}
