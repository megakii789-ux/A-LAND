import type { LeafScenario } from '../../types';
/** Explicit legacy IDs complement category metadata: "two-homes-rules" is filed under rules. */
const FAMILY_IDS = new Set(['not-my-fault', 'two-homes-rules']);
export function requiresAdultCoPlay(leaf: LeafScenario): boolean {
  return FAMILY_IDS.has(leaf.id) || leaf.category === '家的形状' || leaf.weight === 'deep';
}
export function visibleLeaves(leaves: readonly LeafScenario[], familyEnabled: boolean): LeafScenario[] {
  return leaves.filter(leaf => familyEnabled || !requiresAdultCoPlay(leaf));
}
export function canUseTradeoff(leaf: LeafScenario): boolean {
  return !leaf.boundary || leaf.boundary === 'NONE';
}
