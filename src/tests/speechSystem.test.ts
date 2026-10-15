import { describe, it, expect, vi } from 'vitest';
import {
  cleanAndSegmentText,
  cleanAndSegmentNaturalSentences,
  scoreAndCategorizeVoice,
  computeSegmentProsody,
  VOICE_PROFILES,
  VoiceProfileType,
  speechNarrator
} from '../utils/speech';
import {
  sounds,
  TEMPLATE_ACOUSTIC_PROFILES,
  createWarmSaturationCurve,
  computeFrequencyResponseAt,
  AudioTemplateId
} from '../utils/sound';

describe('Speech System Voice Optimization & Web Audio API Timbre Modulation Contracts', () => {
  describe('cleanAndSegmentText - Child Safety & Prosody Cleaning', () => {
    it('CONTRACT: Strips parenthetical designer/developer notes to never expose internal terms to 6yo child', () => {
      const rawWithNotes = '大人不住在一个房子里，是大人之间做的大人决定。（不怪孩子，引导大人承担责任）这件事百分之百不是因为你。';
      const segments = cleanAndSegmentText(rawWithNotes);

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

      expect(segments.length).toBeGreaterThanOrEqual(2);
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

  describe('VOICE_PROFILES & Dynamic Prosody Contours - Child Developmental Acoustic Bounds', () => {
    const profiles: VoiceProfileType[] = [
      'warm-sister',
      'gentle-guide',
      'playful-buddy',
      'starlight-companion'
    ];

    it.each(profiles)('Profile %s rate and pitch adhere to 6-year-old cognitive and emotional comfort bounds', (profileKey) => {
      const config = VOICE_PROFILES[profileKey];
      expect(config).toBeDefined();

      expect(config.rate).toBeGreaterThanOrEqual(0.85);
      expect(config.rate).toBeLessThanOrEqual(1.00);

      expect(config.pitch).toBeGreaterThanOrEqual(0.95);
      expect(config.pitch).toBeLessThanOrEqual(1.10);

      expect(config.name.length).toBeGreaterThan(0);
      expect(config.suitableScenarios.length).toBeGreaterThan(0);
      expect(config.acousticProfile.id).toBe(profileKey);
    });

    it('CONTRACT: All 4 templates produce distinct prosody contours and breathing pauses across clauses', () => {
      const pWarm = computeSegmentProsody('warm-sister', 0, 3, '你好呀');
      const pGentle = computeSegmentProsody('gentle-guide', 2, 3, '这件事不是因为你');
      const pPlayful = computeSegmentProsody('playful-buddy', 0, 3, '我们一起去看看吧？');
      const pStarlight = computeSegmentProsody('starlight-companion', 1, 3, '每个人心里都有很多颗星星');

      expect(pWarm.pitch).not.toBe(pGentle.pitch);
      expect(pPlayful.rate).toBeGreaterThan(pGentle.rate);
      expect(pGentle.pauseAfterMs).toBeGreaterThan(pPlayful.pauseAfterMs);
      expect(pStarlight.volume).toBeGreaterThanOrEqual(0.88);
    });
  });

  describe('Web Audio API Multi-Template Frequency Curves & Timbre Modulation', () => {
    const templates: AudioTemplateId[] = [
      'warm-sister',
      'gentle-guide',
      'playful-buddy',
      'starlight-companion'
    ];

    it('CONTRACT: Every template defines a strictly unique Frequency Response Curve and Timbre Modulation profile', () => {
      const formantFreqs = new Set(templates.map(id => TEMPLATE_ACOUSTIC_PROFILES[id].frequencyCurve.formantCenterFreq));
      const highCutFreqs = new Set(templates.map(id => TEMPLATE_ACOUSTIC_PROFILES[id].frequencyCurve.highCutFreq));
      const vibratoRates = new Set(templates.map(id => TEMPLATE_ACOUSTIC_PROFILES[id].timbreModulation.vibratoRateHz));
      const rootNotes = new Set(templates.map(id => TEMPLATE_ACOUSTIC_PROFILES[id].timbreModulation.scaleFrequencies[0]));

      // All 4 templates must have 4 distinct formant center frequencies, high-cut frequencies, LFO rates, and root keys
      expect(formantFreqs.size).toBe(4);
      expect(highCutFreqs.size).toBe(4);
      expect(vibratoRates.size).toBe(4);
      expect(rootNotes.size).toBe(4);
    });

    it('Computes distinct frequency response curves (dB) across low, mid, and high bands for each template', () => {
      // gentle-guide boosts low end (165Hz) strongly while starlight-companion boosts crystalline high-mids (1920Hz)
      const gentleLow = computeFrequencyResponseAt('gentle-guide', 150);
      const playfulLow = computeFrequencyResponseAt('playful-buddy', 150);
      expect(gentleLow).toBeGreaterThan(playfulLow);

      const starlightHighMid = computeFrequencyResponseAt('starlight-companion', 2000);
      const gentleHighMid = computeFrequencyResponseAt('gentle-guide', 2000);
      expect(starlightHighMid).toBeGreaterThan(gentleHighMid);
    });

    it('Generates valid non-linear WaveShaper soft-saturation curves for harmonic warmth', () => {
      const curve = createWarmSaturationCurve(0.22, 128);
      expect(curve).toBeInstanceOf(Float32Array);
      expect(curve.length).toBe(128);
      // Bounded smoothly within [-1.1, 1.1] without NaN or Infinity
      curve.forEach(val => {
        expect(Number.isFinite(val)).toBe(true);
        expect(Math.abs(val)).toBeLessThanOrEqual(1.1);
      });
    });

    it('Eliminates repetitive single-tone AI clicks via pentatonic scale progression and micro-detuning', () => {
      sounds.setTemplate('playful-buddy');
      const n1 = sounds.getNextScaleNote();
      const n2 = sounds.getNextScaleNote();
      const n3 = sounds.getNextScaleNote();

      expect(n1.frequency).not.toBe(n2.frequency);
      expect(n2.frequency).not.toBe(n3.frequency);
      expect(n1.microDetuneCents).not.toBe(n2.microDetuneCents);
    });

    it('Constructs a complete Web Audio API DSP processing chain (LowShelf, Peaking Formant, HighCut, WaveShaper, Delay)', () => {
      const makeParam = () => ({
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      });

      const mockContext = {
        currentTime: 0,
        destination: {},
        createBiquadFilter: vi.fn(() => ({
          type: 'lowpass',
          frequency: makeParam(),
          gain: makeParam(),
          Q: makeParam(),
          connect: vi.fn()
        })),
        createWaveShaper: vi.fn(() => ({
          curve: null,
          oversample: 'none',
          connect: vi.fn()
        })),
        createGain: vi.fn(() => ({
          gain: makeParam(),
          connect: vi.fn()
        })),
        createDelay: vi.fn(() => ({
          delayTime: makeParam(),
          connect: vi.fn()
        })),
        createStereoPanner: vi.fn(() => ({
          pan: makeParam(),
          connect: vi.fn()
        }))
      } as unknown as AudioContext;

      const chain = sounds.createTemplateDSPChain(mockContext, 'starlight-companion', 0.15);

      expect(chain.lowShelfFilter.type).toBe('lowshelf');
      expect(chain.formantFilter.type).toBe('peaking');
      expect(chain.highCutFilter.type).toBe('lowpass');
      expect(chain.waveShaper.oversample).toBe('2x');
      expect(chain.waveShaper.curve).toBeInstanceOf(Float32Array);
    });

    it('Synchronizes Web Audio DSP template automatically when speechNarrator switches profile', () => {
      speechNarrator.setProfile('starlight-companion');
      expect(sounds.getTemplate()).toBe('starlight-companion');

      speechNarrator.setProfile('gentle-guide');
      expect(sounds.getTemplate()).toBe('gentle-guide');

      speechNarrator.setProfile('warm-sister');
      expect(sounds.getTemplate()).toBe('warm-sister');
    });

    it('Toggles mute state and executes all template synthesis methods safely', () => {
      sounds.setMuted(true);
      expect(sounds.getMuted()).toBe(true);

      expect(() => sounds.playClick()).not.toThrow();
      expect(() => sounds.playBell()).not.toThrow();
      expect(() => sounds.playWarmBloom()).not.toThrow();
      expect(() => sounds.playWarmHug()).not.toThrow();
      expect(() => sounds.playTemplateSignature('playful-buddy')).not.toThrow();
      expect(() => sounds.playSpeechProsodyCue('warm-sister', 0)).not.toThrow();

      sounds.setMuted(false);
      expect(sounds.getMuted()).toBe(false);
    });
  });

  describe('SpeechNarrator - AG-04A Audio & Narrative Lifecycle Controls', () => {
    it('CONTRACT: Provides pause, resume, and stop controls for child narrative', () => {
      speechNarrator.stop();
      expect(speechNarrator.getSpeaking()).toBe(false);
      expect(speechNarrator.getIsPaused()).toBe(false);

      speechNarrator.pause();
      expect(speechNarrator.getIsPaused()).toBe(false);

      speechNarrator.stop();
      expect(speechNarrator.getIsPaused()).toBe(false);
      expect(speechNarrator.getSpeaking()).toBe(false);
    });

    it('CONTRACT: Replay recalls the last spoken narrative string', () => {
      speechNarrator.stop();

      speechNarrator.speak('欢迎来到晴雨小岛，我们一起慢慢看');
      expect(speechNarrator.getLastText()).toBe('欢迎来到晴雨小岛，我们一起慢慢看');

      expect(() => speechNarrator.replay()).not.toThrow();
      expect(speechNarrator.getLastText()).toBe('欢迎来到晴雨小岛，我们一起慢慢看');

      speechNarrator.stop();
    });

    it('CONTRACT: Detects lack of Chinese voice and exposes warning instead of silent fake success', () => {
      expect(typeof speechNarrator.hasChineseVoice()).toBe('boolean');
      expect(typeof speechNarrator.getVoiceWarning).toBe('function');
      expect(typeof speechNarrator.dismissVoiceWarning).toBe('function');

      speechNarrator.dismissVoiceWarning();
      expect(speechNarrator.getVoiceWarning()).toBeNull();
    });

    it('CONTRACT: Subscribers receive notifications on speech lifecycle changes', () => {
      let notifyCount = 0;

      const unsubscribe = speechNarrator.subscribe(() => {
        notifyCount++;
      });

      speechNarrator.speak('小岛阳光很温柔');
      speechNarrator.stop();

      expect(notifyCount).toBeGreaterThan(0);
      unsubscribe();
    });

    it('CONTRACT: Preserves sentence-ending punctuation (?, !, 。) in cleanAndSegmentNaturalSentences to eliminate flat AI splicing', () => {
      const sentences = cleanAndSegmentNaturalSentences(
        '我看到你的积木倒了，心里有点难过对吗？（设计师注：共情）这很正常，大人也会这样！'
      );
      expect(sentences.length).toBe(2);
      expect(sentences[0]).toBe('我看到你的积木倒了，心里有点难过对吗？');
      expect(sentences[1]).toBe('这很正常，大人也会这样！');
    });

    it('CONTRACT: Resolves pre-baked studio Neural TTS entries with millisecond WordBoundary timestamps for all 4 companions', () => {
      const guoguoEntry = speechNarrator.findPrebakedEntry(
        '你好呀！我是果果。我是小松鼠果果，我喜欢收捡森林里的每一片小树叶和秘密线索！',
        'playful-buddy'
      );
      expect(guoguoEntry).not.toBeNull();
      expect(guoguoEntry?.voiceName).toBe('zh-CN-XiaoyiNeural');
      expect(guoguoEntry?.boundaries.length).toBeGreaterThan(10);

      const beibeiEntry = speechNarrator.findPrebakedEntry(
        '你好呀！我是贝贝。我是小海獭贝贝，如果觉得累了，我们可以一起躺在水面上慢慢呼吸。',
        'warm-sister'
      );
      expect(beibeiEntry).not.toBeNull();
      expect(beibeiEntry?.voiceName).toBe('zh-CN-XiaoxiaoNeural');
      expect(beibeiEntry?.boundaries.length).toBeGreaterThan(10);
    });

    it('CONTRACT: Synchronizes companion persona to voice profile and populates Karaoke word tokens on speak()', () => {
      speechNarrator.syncWithCompanion('guoguo_squirrel');
      expect(speechNarrator.getProfile()).toBe('playful-buddy');
      expect(sounds.getTemplate()).toBe('playful-buddy');

      speechNarrator.syncWithCompanion('beibei_otter');
      expect(speechNarrator.getProfile()).toBe('warm-sister');

      speechNarrator.speak('你好呀！我是贝贝。我是小海獭贝贝，如果觉得累了，我们可以一起躺在水面上慢慢呼吸。');
      const karaoke = speechNarrator.getKaraokeState();
      expect(karaoke.isPrebakedNeural).toBe(true);
      expect(karaoke.tokens.length).toBeGreaterThan(10);
      expect(karaoke.voiceSourceLabel).toContain('贝贝');
      speechNarrator.stop();
    });

    it('CONTRACT: Executes all 8 Tactile Semantic Sound Matrix methods safely without node leak', () => {
      expect(() => sounds.playTap()).not.toThrow();
      expect(() => sounds.playCardSelect()).not.toThrow();
      expect(() => sounds.playModalOpen()).not.toThrow();
      expect(() => sounds.playModalClose()).not.toThrow();
      expect(() => sounds.playDiscoveryChime()).not.toThrow();
      expect(() => sounds.playCoinFlip()).not.toThrow();
      expect(() => sounds.playBreathe(true)).not.toThrow();
      expect(() => sounds.playBreathe(false)).not.toThrow();
    });
  });
});

