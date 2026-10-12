import { describe, it, expect } from 'vitest';
import {
  PARENTING_POCKET_TIPS,
  ParentingPocketTips,
  ParentingTipItem,
  ThinkingPosture
} from '../components/ParentCoach/ParentingPocketTips';

describe('ParentingPocketTips Contract & Developmental Rationale Tests', () => {
  it('CONTRACT: ParentingPocketTips component should be a valid React functional component', () => {
    expect(typeof ParentingPocketTips).toBe('function');
  });

  it('CONTRACT: PARENTING_POCKET_TIPS should contain structured items for all three postures: fen, tong, ze', () => {
    expect(PARENTING_POCKET_TIPS.length).toBeGreaterThanOrEqual(9);

    const postures: ThinkingPosture[] = ['fen', 'tong', 'ze'];
    for (const p of postures) {
      const items = PARENTING_POCKET_TIPS.filter((t) => t.posture === p);
      expect(items.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('CONTRACT: Every tip must have complete developmental rationales, micro-steps, avoid lists, and physical anchors', () => {
    PARENTING_POCKET_TIPS.forEach((tip: ParentingTipItem) => {
      expect(tip.id).toBeDefined();
      expect(tip.title.trim().length).toBeGreaterThan(0);
      expect(tip.scenario.trim().length).toBeGreaterThan(0);
      expect(tip.coreScript.trim().length).toBeGreaterThan(0);
      expect(tip.developmentalRationale.trim().length).toBeGreaterThan(20);
      expect(tip.avoidScript.trim().length).toBeGreaterThan(0);
      expect(tip.offscreenActionTip.trim().length).toBeGreaterThan(0);

      // Micro steps must have at least 3 concrete progression steps
      expect(tip.stepGuide.length).toBeGreaterThanOrEqual(3);
      tip.stepGuide.forEach((step) => {
        expect(step.step).toBeDefined();
        expect(step.content.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('CONTRACT: Safety fence posture tip must NOT reopen established safety boundaries on a balance scale', () => {
    const safetyFenceTip = PARENTING_POCKET_TIPS.find((t) => t.id === 'tip-ze-safe-fence');
    expect(safetyFenceTip).toBeDefined();
    // Must clearly state safe fence cannot be bargained on a scale
    expect(safetyFenceTip?.coreScript).toContain('安全围栏');
    expect(safetyFenceTip?.coreScript).toContain('绝不上小天平');
  });

  it('CONTRACT: Scripts must not blame the child for adult marital/parental changes', () => {
    const divorceTip = PARENTING_POCKET_TIPS.find((t) => t.id === 'tip-fen-divorce');
    expect(divorceTip).toBeDefined();
    expect(divorceTip?.coreScript).toContain('大人决定');
    expect(divorceTip?.coreScript).toContain('不是因为你');
  });

  it('CONTRACT: Avoid scripts must identify counter-productive or shaming parental reactions', () => {
    PARENTING_POCKET_TIPS.forEach((tip: ParentingTipItem) => {
      // Must give negative demonstration to warn parents
      expect(tip.avoidScript.length).toBeGreaterThan(5);
    });
  });
});
