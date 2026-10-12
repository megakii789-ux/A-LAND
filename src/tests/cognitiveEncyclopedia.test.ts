import { describe, it, expect } from 'vitest';
import {
  COGNITIVE_DEVELOPMENT_DATA,
  CognitiveDimensionKey
} from '../components/ParentCoach/CognitiveDevelopmentEncyclopedia';

describe('Cognitive Development Encyclopedia Contracts & Psychological Logic', () => {
  const dimensions: CognitiveDimensionKey[] = ['fen', 'tong', 'ze'];

  it('CONTRACT: Provides complete developmental coverage for all 3 core postures (fen, tong, ze)', () => {
    dimensions.forEach((dimKey) => {
      const data = COGNITIVE_DEVELOPMENT_DATA[dimKey];
      expect(data).toBeDefined();
      expect(data.name).toBeDefined();
      expect(data.oneLinerFormula).toBeDefined();
      expect(data.developmentalCore.scientificBasis).toBeDefined();
      expect(data.developmentalCore.stage).toContain('6');
      expect(data.commonBehaviors.length).toBeGreaterThanOrEqual(2);
      expect(data.scaffoldingShift.scientificGuidance).toBeDefined();
      expect(data.safetyFenceBoundary).toBeDefined();
    });
  });

  it('CONTRACT (Fen): Must clearly separate adult marital decisions and accidents from child responsibility', () => {
    const fen = COGNITIVE_DEVELOPMENT_DATA.fen;
    expect(fen.developmentalCore.scientificBasis).toContain('自我中心');
    expect(fen.oneLinerFormula).toContain('事实');
    expect(fen.oneLinerFormula).toContain('大人的事情大人担');
    expect(fen.safetyFenceBoundary).toContain('婚姻');
  });

  it('CONTRACT (Tong): Theory of Mind must teach perspective-taking without compromising physical/privacy boundaries', () => {
    const tong = COGNITIVE_DEVELOPMENT_DATA.tong;
    expect(tong.developmentalCore.stage).toContain('心智理论');
    expect(tong.scaffoldingShift.scientificGuidance).toContain('双面币');
    expect(tong.safetyFenceBoundary).toContain('底线');
    expect(tong.safetyFenceBoundary).toContain('暴力');
  });

  it('CONTRACT (Ze): Must provide agency within non-negotiable safety fences (no unlimited permissive indulgence)', () => {
    const ze = COGNITIVE_DEVELOPMENT_DATA.ze;
    expect(ze.developmentalCore.scientificBasis).toContain('抑制控制');
    expect(ze.oneLinerFormula).toContain('围栏以内给选择');
    expect(ze.scaffoldingShift.scientificGuidance).toContain('二选一');
    expect(ze.safetyFenceBoundary).toContain('安全围栏');
  });

  it('CONTRACT: Must emphasize that adults serve as external prefrontal cortex (外部前额叶) without shaming the 6yo child', () => {
    dimensions.forEach((dimKey) => {
      const data = COGNITIVE_DEVELOPMENT_DATA[dimKey];
      data.commonBehaviors.forEach((b) => {
        expect(b.adultMistake.length).toBeGreaterThan(0);
        expect(b.childMind.length).toBeGreaterThan(0);
      });
      expect(data.scaffoldingShift.whyItWorks).toBeDefined();
    });
  });
});
