import {
  LeafDefinition,
  TransferPairValidationResult,
} from './types';
import { isRegisteredStructureId } from './structureRegistry';

/**
 * 校验单张叶子定义的契约合规性
 * 关键契约：held-out transfer leaf 必须拥有已注册的有效 structureId
 */
export function validateLeafDefinition(
  leaf: unknown
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!leaf || typeof leaf !== 'object') {
    return { isValid: false, errors: ['Leaf definition must be a valid non-null object'] };
  }

  const l = leaf as Partial<LeafDefinition>;

  if (!l.leafId || typeof l.leafId !== 'string' || l.leafId.trim().length === 0) {
    errors.push('leafId is missing or empty');
  }

  // 关键契约：任何叶子（特别是 held-out 迁移叶）必须携带有效的 structureId
  if (!l.structureId || typeof l.structureId !== 'string') {
    errors.push('structureId is missing');
  } else if (!isRegisteredStructureId(l.structureId)) {
    errors.push(`structureId "${l.structureId}" is not registered in STRUCTURE_REGISTRY`);
  }

  if (!l.promptSpokenText || l.promptSpokenText.trim().length === 0) {
    errors.push('promptSpokenText is required for child voice narration');
  }

  if (!l.surfaceDomain) {
    errors.push('surfaceDomain is missing');
  }

  if (l.isHeldOutTransfer === undefined || typeof l.isHeldOutTransfer !== 'boolean') {
    errors.push('isHeldOutTransfer boolean flag is required');
  }

  // 关键契约：系统不得在 held-out leaf 向孩子明示对应工具 (prompt 或 label 不得泄露工具名称)
  if (l.isHeldOutTransfer && l.associatedToolName && l.associatedToolName.trim().length > 0) {
    const tool = l.associatedToolName.trim();
    if (l.promptSpokenText && l.promptSpokenText.includes(tool)) {
      errors.push(`CRITICAL CONTRACT VIOLATION: held-out transfer leaf prompts must not reveal tool name "${tool}" to the child`);
    }
    if (Array.isArray(l.stepsOrOptions)) {
      for (const step of l.stepsOrOptions) {
        if (step.labelSpokenText && step.labelSpokenText.includes(tool)) {
          errors.push(`CRITICAL CONTRACT VIOLATION: held-out transfer leaf step options must not reveal tool name "${tool}"`);
        }
      }
    }
  }

  if (!Array.isArray(l.stepsOrOptions)) {
    errors.push('stepsOrOptions must be an array');
  } else {
    if (l.stepsOrOptions.length < 2) {
      errors.push('stepsOrOptions must have at least 2 items to allow meaningful choice');
    }
    if (l.stepsOrOptions.length > 4) {
      errors.push('stepsOrOptions cannot exceed 4 items to prevent 6-year-old cognitive overload');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 校验迁移配对 (Training Leaf vs Held-Out Transfer Leaf) 的科学有效性
 * 严格遵循 docs/CONTENT_SCHEMA.md:
 * 1. 结构相同：两叶必须共享同一个底层 structureId。
 * 2. 表面相异：两叶必须属于不同的 surfaceDomain（不得用同场景重复测试伪造迁移）。
 * 3. 隔离检验：测试叶必须标记为 isHeldOutTransfer: true。
 */
export function validateTransferPair(
  trainingLeaf: LeafDefinition,
  testLeaf: LeafDefinition
): TransferPairValidationResult {
  const trainCheck = validateLeafDefinition(trainingLeaf);
  if (!trainCheck.isValid) {
    return {
      isValidTransferPair: false,
      reason: `Training leaf invalid: ${trainCheck.errors.join('; ')}`,
    };
  }

  const testCheck = validateLeafDefinition(testLeaf);
  if (!testCheck.isValid) {
    return {
      isValidTransferPair: false,
      reason: `Test leaf invalid: ${testCheck.errors.join('; ')}`,
    };
  }

  if (!testLeaf.isHeldOutTransfer) {
    return {
      isValidTransferPair: false,
      reason: 'Test leaf must be marked as isHeldOutTransfer: true',
    };
  }

  if (trainingLeaf.structureId !== testLeaf.structureId) {
    return {
      isValidTransferPair: false,
      reason: `Structure mismatch: training has "${trainingLeaf.structureId}", test has "${testLeaf.structureId}". Cannot test structural transfer.`,
    };
  }

  if (trainingLeaf.surfaceDomain === testLeaf.surfaceDomain) {
    return {
      isValidTransferPair: false,
      reason: `Surface context collision: both leaves are in "${trainingLeaf.surfaceDomain}". Structural transfer requires testing across different surface domains.`,
    };
  }

  return {
    isValidTransferPair: true,
    sharedStructureId: trainingLeaf.structureId,
    reason: 'Valid transfer pair: shared cognitive structure across distinct surface domains.',
  };
}
