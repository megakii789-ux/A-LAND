import { describe, it, expect } from 'vitest';
import {
  cleanAndSegmentText,
  scoreAndCategorizeVoice,
  VOICE_PROFILES,
  VoiceProfileType
} from '../utils/speech';
import { sounds } from '../utils/sound';

describe('Speech System Voice Optimization & Anti-Robotic Filter Contracts', () => {
  describe('cleanAndSegmentText - Child Safety & Prosody Cleaning', () => {
    it('CONTRACT: Strips parenthetical designer/developer notes to never expose internal terms to 6yo child', () => {
      const rawWithNotes = '大人不住在一个房子里，是大人之间做的大人决定。（不怪孩子，引导大人承担责任）这件事百分之百不是因为你。';
      const segments = cleanAndSegmentText(rawWithNotes);

      // Verify parenthetical text was completely excised
      const combined = segments.join('');
      expect(combined).not.toContain('引导大人承担责任');
      expect(combined).not.toContain('不怪孩子');
      expect(combined).toContain('大人不住在一个房子里');
      expect(combined).toContain('这件事百分之百不是因为你');
    });

    it('CONTRACT: Strips English brackets and internal code tokens', () => {
      const textWithCodes = '退后一步看一看 [S2] [structureId: 301] 【训练叶】慢慢深呼吸。';
      const segments = cleanAndSegmentText(textWithCodes);
      const combined = segments.join('');
      expect(combined).not.toContain('S2');
      expect(combined).not.toContain('structureId');
      expect(combined).not.toContain('训练叶');
      expect(combined).toContain('退后一步看一看');
      expect(combined).toContain('慢慢深呼吸');
    });

    it('CONTRACT: Strips markdown syntax like bold, asterisks, hashtags', () => {
      const markdownText = '**深呼吸**，闭上眼睛，#今天的心情# 是*阴天*。';
      const segments = cleanAndSegmentText(markdownText);
      const combined = segments.join('');
      expect(combined).not.toContain('**');
      expect(combined).not.toContain('*');
      expect(combined).not.toContain('#');
      expect(combined).toContain('深呼吸');
    });

    it('CONTRACT: Splits long sentences into child-friendly natural breath clauses', () => {
      const longSentence = '当你想念爸爸或者妈妈的时候，无论他们在哪里，心里对你的爱都是一直都在的，你随时可以抱抱小恐龙。';
      const segments = cleanAndSegmentText(longSentence);

      // Should be divided into manageable respiratory units (at least 2 segments)
      expect(segments.length).toBeGreaterThanOrEqual(2);
      // Each segment should be moderate in length to allow natural breathing pauses
      segments.forEach(segment => {
        expect(segment.length).toBeLessThanOrEqual(20);
      });
    });

    it('Gracefully handles empty strings and whitespace', () => {
      expect(cleanAndSegmentText('')).toEqual([]);
      expect(cleanAndSegmentText('   ')).toEqual([]);
      expect(cleanAndSegmentText('（全部都在括号里）')).toEqual([]);
    });
  });

  describe('scoreAndCategorizeVoice - Multi-Tier Natural Voice Discovery', () => {
    it('Ranks Microsoft Xiaoxiao (晓晓) as highest tier neural-natural for empathetic child narration', () => {
      const voice = {
        name: 'Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)',
        lang: 'zh-CN'
      };
      const result = scoreAndCategorizeVoice(voice);
      expect(result.tier).toBe('neural-natural');
      expect(result.isNatural).toBe(true);
      expect(result.score).toBe(100);
    });

    it('Ranks Microsoft Yunxi (云希) as top tier neural-natural voice', () => {
      const voice = {
        name: 'Microsoft Yunxi Online (Natural) - Chinese (Mainland)',
        lang: 'zh-CN'
      };
      const result = scoreAndCategorizeVoice(voice);
      expect(result.tier).toBe('neural-natural');
      expect(result.isNatural).toBe(true);
      expect(result.score).toBe(95);
    });

    it('Ranks Apple Tingting Enhanced as top tier neural-natural voice', () => {
      const voice = {
        name: 'Tingting (Enhanced)',
        lang: 'zh-CN'
      };
      const result = scoreAndCategorizeVoice(voice);
      expect(result.tier).toBe('neural-natural');
      expect(result.isNatural).toBe(true);
      expect(result.score).toBe(94);
    });

    it('Ranks Google Chinese / Mandarin as top tier voice', () => {
      const voice = {
        name: 'Google 普通话（中国大陆）',
        lang: 'zh-CN'
      };
      const result = scoreAndCategorizeVoice(voice);
      expect(result.tier).toBe('neural-natural');
      expect(result.score).toBeGreaterThanOrEqual(90);
    });

    it('Penalizes mechanical synthesizers (eSpeak) to fallback tier', () => {
      const voice = {
        name: 'eSpeak zh',
        lang: 'zh-cmn'
      };
      const result = scoreAndCategorizeVoice(voice);
      expect(result.tier).toBe('fallback');
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.isNatural).toBe(false);
    });

    it('Filters non-Chinese voices to score 0', () => {
      const voice = {
        name: 'Alex',
        lang: 'en-US'
      };
      const result = scoreAndCategorizeVoice(voice);
      expect(result.score).toBe(0);
      expect(result.tier).toBe('fallback');
    });
  });

  describe('VOICE_PROFILES - Child Developmental Acoustic Bounds', () => {
    const profiles: VoiceProfileType[] = ['warm-sister', 'gentle-guide', 'playful-buddy'];

    it.each(profiles)('Profile %s rate and pitch adhere to 6-year-old cognitive and emotional comfort bounds', (profileKey) => {
      const config = VOICE_PROFILES[profileKey];
      expect(config).toBeDefined();

      // Rate: unhurried and clear (0.85 ~ 0.98), not robotic rush or dragged distortion
      expect(config.rate).toBeGreaterThanOrEqual(0.85);
      expect(config.rate).toBeLessThanOrEqual(1.00);

      // Pitch: warm, reassuring (0.98 ~ 1.08), avoiding sharp metallic squeak or deep authoritative boom
      expect(config.pitch).toBeGreaterThanOrEqual(0.98);
      expect(config.pitch).toBeLessThanOrEqual(1.10);

      // Must have descriptive labels for caregivers
      expect(config.name.length).toBeGreaterThan(0);
      expect(config.suitableScenarios.length).toBeGreaterThan(0);
    });
  });

  describe('SoundPlayer - Organic Acoustic Soundscape', () => {
    it('Toggles mute state correctly without throwing errors', () => {
      sounds.setMuted(true);
      expect(sounds.getMuted()).toBe(true);

      // Playing sounds while muted should be safe no-op
      expect(() => sounds.playClick()).not.toThrow();
      expect(() => sounds.playBell()).not.toThrow();
      expect(() => sounds.playWarmBloom()).not.toThrow();
      expect(() => sounds.playWarmHug()).not.toThrow();

      sounds.setMuted(false);
      expect(sounds.getMuted()).toBe(false);
    });
  });
});
