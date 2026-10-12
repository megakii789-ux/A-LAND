import { describe, it, expect } from 'vitest';
import {
  INITIAL_PARENT_MEDALS,
  calculateParentMedals,
  EvaluateMedalsParams
} from '../data/parentMedalsData';
import { ParentMedalsWall } from '../components/ParentCoach/ParentMedalsWall';
import { ParentMedal } from '../types';

describe('Caregiver Parenting Medals (养育勋章) Contract & Dynamic Engine Tests', () => {
  it('CONTRACT: ParentMedalsWall component should be a valid React functional component', () => {
    expect(typeof ParentMedalsWall).toBe('function');
  });

  it('CONTRACT: INITIAL_PARENT_MEDALS must contain structured medals covering fen, tong, ze, presence, consistency, and scaffold', () => {
    expect(INITIAL_PARENT_MEDALS.length).toBeGreaterThanOrEqual(6);

    const postures = INITIAL_PARENT_MEDALS.map((m) => m.posture);
    expect(postures).toContain('fen');
    expect(postures).toContain('tong');
    expect(postures).toContain('ze');
    expect(postures).toContain('presence');
    expect(postures).toContain('consistency');
    expect(postures).toContain('scaffold');
  });

  it('CONTRACT: Every parent medal must provide evidence-based developmental significance and non-shaming practical guidance', () => {
    INITIAL_PARENT_MEDALS.forEach((medal: ParentMedal) => {
      expect(medal.id).toBeDefined();
      expect(medal.title.trim().length).toBeGreaterThan(0);
      expect(medal.triggerDescription.trim().length).toBeGreaterThan(0);
      expect(medal.developmentalSignificance.trim().length).toBeGreaterThan(20);
      expect(medal.practicalParentTip.trim().length).toBeGreaterThan(10);
      expect(medal.criteriaHint.trim().length).toBeGreaterThan(0);
    });
  });

  it('CONTRACT: calculateParentMedals dynamically unlocks medals based on actual parent observations and presence data', () => {
    const mockZeroParams: EvaluateMedalsParams = {
      parentObservations: [
        { id: 'obs-frustration', dimension: '挫折', oldBehavior: '', targetBehavior: '', selfInitiatedCount: 0 },
        { id: 'obs-others-action', dimension: '别人意图', oldBehavior: '', targetBehavior: '', selfInitiatedCount: 0 },
        { id: 'obs-after-choice', dimension: '选择之后', oldBehavior: '', targetBehavior: '', selfInitiatedCount: 0 },
        { id: 'obs-person-label', dimension: '人与事', oldBehavior: '', targetBehavior: '', selfInitiatedCount: 0 },
        { id: 'obs-own-emotion', dimension: '情绪命名', oldBehavior: '', targetBehavior: '', selfInitiatedCount: 0 }
      ],
      consistencyItemsCheckedCount: 1,
      hugCount: 0,
      hasUsedPocketTips: false
    };

    // With zero observations, lockable badges should not be forced unlocked unless default
    const zeroResults = calculateParentMedals(
      INITIAL_PARENT_MEDALS.map((m) => ({ ...m, unlocked: false, unlockedAt: undefined })),
      mockZeroParams
    );

    const scaffoldMedalZero = zeroResults.find((m) => m.id === 'p-medal-scaffold-fade');
    expect(scaffoldMedalZero?.unlocked).toBe(false);

    // Now supply real active data
    const mockActiveParams: EvaluateMedalsParams = {
      parentObservations: [
        { id: 'obs-frustration', dimension: '挫折', oldBehavior: '', targetBehavior: '', selfInitiatedCount: 2 },
        { id: 'obs-others-action', dimension: '别人意图', oldBehavior: '', targetBehavior: '', selfInitiatedCount: 2 },
        { id: 'obs-after-choice', dimension: '选择之后', oldBehavior: '', targetBehavior: '', selfInitiatedCount: 1 },
        { id: 'obs-person-label', dimension: '人与事', oldBehavior: '', targetBehavior: '', selfInitiatedCount: 1 },
        { id: 'obs-own-emotion', dimension: '情绪命名', oldBehavior: '', targetBehavior: '', selfInitiatedCount: 2 }
      ],
      consistencyItemsCheckedCount: 4,
      hugCount: 2,
      hasUsedPocketTips: true
    };

    const activeResults = calculateParentMedals(
      INITIAL_PARENT_MEDALS.map((m) => ({ ...m, unlocked: false, unlockedAt: undefined })),
      mockActiveParams
    );

    const factMedal = activeResults.find((m) => m.id === 'p-medal-fen-fact');
    const tongMedal = activeResults.find((m) => m.id === 'p-medal-tong-coin');
    const zeMedal = activeResults.find((m) => m.id === 'p-medal-ze-agency');
    const presenceMedal = activeResults.find((m) => m.id === 'p-medal-presence-haven');
    const consistencyMedal = activeResults.find((m) => m.id === 'p-medal-consistency-guard');
    const scaffoldMedal = activeResults.find((m) => m.id === 'p-medal-scaffold-fade'); // total is 2+2+1+1+2 = 8 >= 5

    expect(factMedal?.unlocked).toBe(true);
    expect(tongMedal?.unlocked).toBe(true);
    expect(zeMedal?.unlocked).toBe(true);
    expect(presenceMedal?.unlocked).toBe(true);
    expect(consistencyMedal?.unlocked).toBe(true);
    expect(scaffoldMedal?.unlocked).toBe(true);
  });

  it('CONTRACT: No competitive rankings, penalties, or countdown pressures in caregiver milestones', () => {
    // Badges must be developmental affirmations, no failure codes or demotions
    INITIAL_PARENT_MEDALS.forEach((medal) => {
      expect(medal.title).not.toContain('惩罚');
      expect(medal.title).not.toContain('扣分');
      expect(medal.title).not.toContain('排名');
      expect(medal.title).not.toContain('落后');
    });
  });
});
